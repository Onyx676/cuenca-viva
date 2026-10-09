import Phaser from 'phaser';
import confetti from 'canvas-confetti';
import { SimulationEngine } from './simulation/SimulationEngine';
import { SessionLog, createSessionExport } from './sessionExport';
import { createRecoveryPacket, readRecovery, writeRecovery, type RecoveryRead } from './sessionRecovery';
import { BasinScene, MapClickTarget } from './game/BasinScene';
import { SectorId } from './models/Sector';
import { ClimateForecast, ClimateStateType } from './models/ClimateState';
import { UpgradeBranch } from './models/Upgrade';
import { SEASONS_INFO, SeasonType, getNextSeason } from './models/Season';
import { GameEvent } from './models/Event';
import { SeasonResult, SeasonWaterBalance } from './models/Balance';
import { getSeasonVerdict } from './seasonVerdict';
import { describeRequestGaps, describeStorageHistory } from './waterClarity';
import { suggestDistribution } from './suggestedDistribution';
import { SeasonalGoal, checkSeasonalGoal } from './models/SeasonalGoal';
import { goalProgress } from './simulation/MissionSystem';
import { TutorialManager } from './tutorial/TutorialManager';
import tutorialData from './data/tutorial.json';
import { sound } from './audio/SoundFX';
import { getCharacterFeedback, SECTOR_CHARACTERS } from './game/Characters';
import { generateNewspaperEdition, getEventRecap, NewspaperEdition } from './game/Newspaper';
import { createLearningReport } from './resultReport';

// --- INICIALIZACIÓN DE LA SIMULACIÓN Y TUTORIAL ---
let currentScenario = 'cuenca_central';
let currentSeed = 'AULA-2026-001';
let tutorialModeSetting: 'optional' | 'mandatory' | 'disabled' = 'optional';
let sessionLog: SessionLog | null = null;
// Startup never writes over a stored session before Continue/Restart is chosen.
let recoveryWritesEnabled = false;
let preserveRecoveryOriginal = false;
let recoverySaveTimer: number | undefined;
let recoveryWarningShown = false;
let recoveryChoiceVisible = false;
function createRecordedEngine(): SimulationEngine {
  const fresh = new SimulationEngine(currentScenario, currentSeed, true);
  sessionLog = new SessionLog(fresh.getState());
  return fresh;
}
let engine = createRecordedEngine();

function advanceRecordedTurn(): void {
  const turn = engine.getState().turn;
  engine.advanceToNextTurn();
  if (engine.getState().turn !== turn) {
    sessionLog?.record({ type: 'advance', turn });
    saveRecovery();
  }
}
export type PlayableSectorId = 'population' | 'agriculture' | 'livestock' | 'mining' | 'ecosystem';
export const PLAYABLE_SECTORS: PlayableSectorId[] = ['population', 'agriculture', 'livestock', 'mining', 'ecosystem'];
const tutorialManager = new TutorialManager();

// Registro de la asignación inicial de cada turno para el botón [RESTABLECER]
let initialTurnAllocations: Record<PlayableSectorId, number> = {
  population: 20,
  agriculture: 25,
  livestock: 10,
  mining: 15,
  ecosystem: 12
};

// Pasar estado inicial a la escena ANTES de que Phaser inicie el ciclo
BasinScene.initialGameState = engine.getState();
BasinScene.onSelectSectorCallback = (target: MapClickTarget) => handleMapElementClick(target);

// --- INICIALIZACIÓN DE PHASER 3 ---
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: window.innerWidth,
  height: window.innerHeight,
  transparent: false,
  backgroundColor: '#0f172a',
  fps: {
    target: 60,
    forceSetTimeOut: false,
    smoothStep: true
  },
  render: {
    antialias: false,
    powerPreference: 'high-performance',
    batchSize: 4096
  },
  input: {
    windowEvents: false
  },
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [BasinScene]
};

const game = new Phaser.Game(config);

// --- REFERENCIAS AL DOM ---
// Barra Superior
const yearBadge = document.getElementById('year-badge')!;
const seasonBadge = document.getElementById('season-badge')!;
const climateBadge = document.getElementById('climate-badge')!;
const statMoney = document.getElementById('stat-money')!;
const statTrust = document.getElementById('stat-trust')!;
const statHealth = document.getElementById('stat-health')!;
const statQuality = document.getElementById('stat-quality')!;
const btnSoundToggle = document.getElementById('btn-sound-toggle') as HTMLButtonElement | null;

// Tracker Gráfico de 20 Turnos
const timelineTracker = document.getElementById('timeline-tracker')!;

// Banner de Desafío Estacional
const seasonalGoalBanner = document.getElementById('seasonal-goal-banner')!;
const goalTitle = document.getElementById('goal-title')!;
const goalDesc = document.getElementById('goal-desc')!;
const goalRewardBadge = document.getElementById('goal-reward-badge')!;

// Reservas de agua
const indSnow = document.getElementById('ind-snow')!;
const barSnow = document.getElementById('bar-snow')!;
const indRes = document.getElementById('ind-res')!;
const barRes = document.getElementById('bar-res')!;
const indAqui = document.getElementById('ind-aqui')!;
const barAqui = document.getElementById('bar-aqui')!;

// Tarjeta Contextual Flotante (no bloqueante)
const contextualCard = document.getElementById('contextual-card')!;
const ctxIcon = document.getElementById('ctx-icon')!;
const ctxTitle = document.getElementById('ctx-title')!;
const ctxSubtitle = document.getElementById('ctx-subtitle')!;
const ctxDesc = document.getElementById('ctx-desc')!;
const ctxStats = document.getElementById('ctx-stats')!;
const ctxPedagogy = document.getElementById('ctx-pedagogy')!;
const btnCloseContextual = document.getElementById('btn-close-contextual')!;

// Panel inferior de asignación
const seasonDescBanner = document.getElementById('season-desc-banner') as HTMLElement | null;
const valTotalAllocated = document.getElementById('val-total-allocated')!;
const valWaterAvailable = document.getElementById('val-water-available')!;
const valWaterReserve = document.getElementById('val-water-reserve')!;
const pillReserve = document.getElementById('pill-reserve')!;
const btnSuggestedDist = document.getElementById('btn-suggested-dist')!;
const btnResetDist = document.getElementById('btn-reset-dist')!;
const btnResolveSeason = document.getElementById('btn-resolve-season') as HTMLButtonElement;
const btnOpenUpgrades = document.getElementById('btn-open-upgrades')!;
const btnUpgradesMoney = document.getElementById('btn-upgrades-money')!;

// UI de los 5 sectores con personajes, sliders y ajuste fino
interface SectorUIElements {
  disp: HTMLElement;
  cov: HTMLElement;
  slider: HTMLInputElement;
  mood: HTMLElement;
  card: HTMLElement;
  btnMinus: HTMLButtonElement;
  btnPlus: HTMLButtonElement;
  avatar: HTMLElement;
  speaker: HTMLElement;
  quote: HTMLElement;
  floatContainer: HTMLElement;
}

const sectorUI: Record<PlayableSectorId, SectorUIElements> = {
  population: {
    disp: document.getElementById('disp-pop')!,
    cov: document.getElementById('cov-pop')!,
    slider: document.getElementById('slider-pop') as HTMLInputElement,
    mood: document.getElementById('mood-pop')!,
    card: document.getElementById('card-pop')!,
    btnMinus: document.getElementById('btn-minus-pop') as HTMLButtonElement,
    btnPlus: document.getElementById('btn-plus-pop') as HTMLButtonElement,
    avatar: document.getElementById('avatar-pop')!,
    speaker: document.getElementById('speaker-pop')!,
    quote: document.getElementById('quote-pop')!,
    floatContainer: document.getElementById('float-pop')!,
  },
  agriculture: {
    disp: document.getElementById('disp-agri')!,
    cov: document.getElementById('cov-agri')!,
    slider: document.getElementById('slider-agri') as HTMLInputElement,
    mood: document.getElementById('mood-agri')!,
    card: document.getElementById('card-agri')!,
    btnMinus: document.getElementById('btn-minus-agri') as HTMLButtonElement,
    btnPlus: document.getElementById('btn-plus-agri') as HTMLButtonElement,
    avatar: document.getElementById('avatar-agri')!,
    speaker: document.getElementById('speaker-agri')!,
    quote: document.getElementById('quote-agri')!,
    floatContainer: document.getElementById('float-agri')!,
  },
  livestock: {
    disp: document.getElementById('disp-live')!,
    cov: document.getElementById('cov-live')!,
    slider: document.getElementById('slider-live') as HTMLInputElement,
    mood: document.getElementById('mood-live')!,
    card: document.getElementById('card-live')!,
    btnMinus: document.getElementById('btn-minus-live') as HTMLButtonElement,
    btnPlus: document.getElementById('btn-plus-live') as HTMLButtonElement,
    avatar: document.getElementById('avatar-live')!,
    speaker: document.getElementById('speaker-live')!,
    quote: document.getElementById('quote-live')!,
    floatContainer: document.getElementById('float-live')!,
  },
  mining: {
    disp: document.getElementById('disp-min')!,
    cov: document.getElementById('cov-min')!,
    slider: document.getElementById('slider-min') as HTMLInputElement,
    mood: document.getElementById('mood-min')!,
    card: document.getElementById('card-min')!,
    btnMinus: document.getElementById('btn-minus-min') as HTMLButtonElement,
    btnPlus: document.getElementById('btn-plus-min') as HTMLButtonElement,
    avatar: document.getElementById('avatar-min')!,
    speaker: document.getElementById('speaker-min')!,
    quote: document.getElementById('quote-min')!,
    floatContainer: document.getElementById('float-min')!,
  },
  ecosystem: {
    disp: document.getElementById('disp-eco')!,
    cov: document.getElementById('cov-eco')!,
    slider: document.getElementById('slider-eco') as HTMLInputElement,
    mood: document.getElementById('mood-eco')!,
    card: document.getElementById('card-eco')!,
    btnMinus: document.getElementById('btn-minus-eco') as HTMLButtonElement,
    btnPlus: document.getElementById('btn-plus-eco') as HTMLButtonElement,
    avatar: document.getElementById('avatar-eco')!,
    speaker: document.getElementById('speaker-eco')!,
    quote: document.getElementById('quote-eco')!,
    floatContainer: document.getElementById('float-eco')!,
  },
};

// Modal: Bienvenida / ¿Primera vez?
const modalWelcome = document.getElementById('modal-welcome')!;
const btnWelcomeTutorial = document.getElementById('btn-welcome-tutorial')!;
const btnWelcomePlay = document.getElementById('btn-welcome-play')!;
const recoveryChoice = document.getElementById('welcome-recovery')!;
const welcomeNewChoices = document.getElementById('welcome-new-choices')!;
const recoveryDescription = document.getElementById('recovery-description')!;
const btnContinueRecovery = document.getElementById('btn-continue-recovery') as HTMLButtonElement;
const btnRestartRecovery = document.getElementById('btn-restart-recovery')!;
const btnDownloadRecovery = document.getElementById('btn-download-recovery')!;

// Banner flotante del Tutorial (Año 0)
const tutorialGuideBanner = document.getElementById('tutorial-guide-banner')!;
const tutPhaseBadge = document.getElementById('tut-phase-badge')!;
function setTutorialCollapsed(collapsed: boolean): void {
  tutorialGuideBanner.classList.toggle('tutorial-collapsed', collapsed);
  tutPhaseBadge.setAttribute('aria-expanded', String(!collapsed));
  tutPhaseBadge.title = collapsed ? 'Volver a la guía del tutorial' : 'Plegar la guía para explorar el mapa';
  if (!collapsed) {
    contextualCard.classList.remove('open');
    if (tutorialManager.isActive() && window.innerWidth <= 800) closeSectorEditor();
  }
  positionMapControls();
}
tutPhaseBadge.addEventListener('click', () => {
  if (!canUseControl(tutPhaseBadge)) return;
  setTutorialCollapsed(!tutorialGuideBanner.classList.contains('tutorial-collapsed'));
});
document.querySelector('.water-reserves-card')!.addEventListener('toggle', () => {
  if (tutorialManager.isActive() && window.innerWidth <= 800
    && (document.querySelector('.water-reserves-card') as HTMLDetailsElement).open) setTutorialCollapsed(true);
  positionMapControls();
});
const btnSkipTutorial = document.getElementById('btn-skip-tutorial')!;
const tutTitle = document.getElementById('tut-title')!;
const tutDesc = document.getElementById('tut-desc')!;
const tutChoices = document.getElementById('tut-choices')!;
const tutFeedback = document.getElementById('tut-feedback')!;
const btnTutNext = document.getElementById('btn-tut-next') as HTMLButtonElement;

// Toast Tips contextuales
const toastTip = document.getElementById('toast-tip')!;
const toastTipTitle = document.getElementById('toast-tip-title')!;
const toastTipDesc = document.getElementById('toast-tip-desc')!;
const btnCloseToast = document.getElementById('btn-close-toast')!;
const shownTips = new Set<string>();
const btnDistributionTip = document.getElementById('btn-distribution-tip')!;
function closeDistributionTip(): void {
  toastTip.classList.remove('open');
  btnDistributionTip.setAttribute('aria-expanded', 'false');
}

// Modal: Evento Interactivo
const modalInteractiveEvent = document.getElementById('modal-interactive-event')!;
const eventModalTitle = document.getElementById('event-modal-title')!;
const eventModalDesc = document.getElementById('event-modal-desc')!;
const eventOptionsContainer = document.getElementById('event-options-container')!;

// Tarjeta Ágil de Feedback Post-Estación
const cardSeasonFeedback = document.getElementById('card-season-feedback')!;
const fbSeasonTitle = document.getElementById('fb-season-title')!;
const fbGoalBadge = document.getElementById('fb-goal-badge')!;
const fbWaterSummary = document.getElementById('fb-water-summary')!;
const fbPop = document.getElementById('fb-pop')!;
const fbAgri = document.getElementById('fb-agri')!;
const fbHealth = document.getElementById('fb-health')!;
const fbMoney = document.getElementById('fb-money')!;
const fbAdviceText = document.getElementById('fb-advice-text')!;
const btnFbContinue = document.getElementById('btn-fb-continue')!;
const btnOpenNewspaper = document.getElementById('btn-open-newspaper') as HTMLButtonElement | null;
const btnViewValley = document.getElementById('btn-view-valley') as HTMLButtonElement;
// Baseline de UI: posterior a eventos/compras y anterior al reparto. No se inventa
// al recuperar una partida resuelta, cuyo estado histórico mezcla otras decisiones.
let resolvedImpact: { result: SeasonResult; trust: number; health: number } | null = null;

// Los créditos ya existen en el motor. Sólo diferimos su presentación hasta
// el resumen y el cierre anual; cambiar de motor descarta esta memoria de UI.
const budgetPresentations = new WeakMap<SimulationEngine, { season: number; annual: number }>();
let budgetAnimation: number | undefined;
const fbBudgetReceipt = document.createElement('p');
fbBudgetReceipt.className = 'fb-water-line';
fbBudgetReceipt.hidden = true;
document.getElementById('fb-sector-impact')!.after(fbBudgetReceipt);

function visibleBudget(): number {
  const pending = budgetPresentations.get(engine);
  return engine.getState().money - (pending?.season ?? 0) - (pending?.annual ?? 0);
}

function renderBudget(value: number): void {
  statMoney.textContent = `$${value}`;
  btnUpgradesMoney.textContent = `$${value}`;
}

function revealBudget(kind: 'season' | 'annual'): void {
  const pending = budgetPresentations.get(engine);
  if (!pending || pending[kind] === 0) return;
  const from = visibleBudget();
  const delta = pending[kind];
  pending[kind] = 0; // Consumir la presentación, nunca volver a acreditar.
  const to = visibleBudget();
  if (budgetAnimation !== undefined) cancelAnimationFrame(budgetAnimation);
  budgetAnimation = undefined;
  const receipt = kind === 'season' ? fbBudgetReceipt
    : yearendBreakdown.querySelector<HTMLElement>('[data-budget-total]');
  if (receipt) {
    receipt.hidden = false;
    receipt.setAttribute('aria-label', `Presupuesto: $${to}. ${delta > 0 ? 'Ganaste' : 'Cambio de'} $${delta}.`);
  }
  const draw = (value: number) => {
    renderBudget(value);
    if (receipt) receipt.textContent = kind === 'season'
      ? `Presupuesto: $${value} · Premio del desafío: +$${delta}`
      : `${delta >= 0 ? '+' : ''}$${delta} (Total actual: $${value})`;
  };
  if (delta > 0) sound.coin();
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    draw(to);
    return;
  }
  const owner = engine;
  const turn = engine.getState().turn;
  const start = performance.now();
  const tick = (now: number) => {
    if (engine !== owner || engine.getState().turn !== turn || visibleBudget() !== to) {
      budgetAnimation = undefined;
      renderBudget(visibleBudget());
      return;
    }
    const progress = Math.min(1, (now - start) / 850);
    draw(Math.round(from + (to - from) * (1 - (1 - progress) ** 3)));
    budgetAnimation = progress < 1 ? requestAnimationFrame(tick) : undefined;
  };
  budgetAnimation = requestAnimationFrame(tick);
}

// Modal: El Heraldo del Valle (Periódico)
const modalNewspaper = document.getElementById('modal-newspaper') as HTMLElement | null;
const newsDate = document.getElementById('news-date');
const newsMainHeadline = document.getElementById('news-main-headline');
const newsMainSubhead = document.getElementById('news-main-subhead');
const newsPhotoEmoji = document.getElementById('news-photo-emoji');
const newsPhotoCaption = document.getElementById('news-photo-caption');

const finHonorIcon = document.getElementById('fin-honor-icon');
const finHonorTitle = document.getElementById('fin-honor-title');
const finHonorDesc = document.getElementById('fin-honor-desc');

// Reutilizar los cinco controles existentes: sólo uno se abre junto al sector seleccionado.
const sectorEditor = document.getElementById('sector-editor')!;
const mapSectorLabels = document.getElementById('map-sector-labels')!;
let selectedSector: PlayableSectorId | null = null;
let decisionSector: PlayableSectorId | null = null;
let previousGatePreview: SeasonWaterBalance | undefined;
let previousGateContext = '';
const gateDecision = document.createElement('div');
gateDecision.className = 'gate-decision';
gateDecision.hidden = true;
gateDecision.setAttribute('role', 'status');
gateDecision.setAttribute('aria-live', 'polite');
const decisionSupply = document.createElement('div');
const decisionReserve = document.createElement('div');
const decisionLimit = document.createElement('div');
gateDecision.append(decisionSupply, decisionLimit, decisionReserve);
sectorEditor.appendChild(gateDecision);
for (const id of PLAYABLE_SECTORS) {
  sectorEditor.appendChild(sectorUI[id].card);
  sectorUI[id].btnMinus.parentElement!.hidden = true;
  const label = document.createElement('button');
  label.className = `map-sector-button ${id === 'ecosystem' ? 'river-outcome' : 'intake-button'}`;
  label.setAttribute('aria-controls', 'sector-editor');
  label.dataset.mapSector = id;
  if (id !== 'ecosystem') {
    label.innerHTML = `<svg class="physical-gate" viewBox="0 0 64 72" aria-hidden="true">
      <path d="M16 52 L16 72 M48 52 L48 72" stroke="#62554b" stroke-width="7"/>
      <path d="M20 56 L44 56 L44 72 L20 72Z" fill="#163a48"/>
      <path class="gate-water" d="M23 57 L41 57 L41 72 L23 72Z" fill="#5cddff"/>
      <path d="M9 25 L9 60 L17 60 L17 25 M47 25 L47 60 L55 60 L55 25" fill="#c4c9c6" stroke="#556068" stroke-width="2"/>
      <path d="M7 24 L57 24" stroke="#d6dbd7" stroke-width="7"/>
      <path d="M32 11 L32 51" stroke="#67717a" stroke-width="4"/>
      <g class="gate-leaf"><rect x="18" y="28" width="28" height="27" rx="2" fill="#d39947" stroke="#553c26" stroke-width="2"/>
      <path d="M21 34 L43 34 M21 43 L43 43" stroke="#f4ca81" stroke-width="2"/></g>
      <text x="57" y="19" fill="#fff0bf" font-size="13">↕</text>
      <g class="gate-wheel"><circle cx="32" cy="11" r="9" fill="#364047" stroke="#ffe0a2" stroke-width="3"/>
      <path d="M23 11 L41 11 M32 2 L32 20" stroke="#ffe0a2" stroke-width="2"/></g>
    </svg><span class="gate-caption"></span>`;
    let drag: { pointer: number; startY: number; allocation: number; moved: boolean } | null = null;
    let suppressClick = false;
    label.addEventListener('pointerdown', event => {
      if (backgroundInteractionBlocked() || event.button !== 0 || sectorUI[id].slider.disabled) return;
      event.preventDefault();
      suppressClick = false;
      drag = { pointer: event.pointerId, startY: event.clientY, allocation: engine.getState().sectors[id].allocated, moved: false };
      label.setPointerCapture(event.pointerId);
      label.classList.add('operating');
    });
    label.addEventListener('pointermove', event => {
      if (backgroundInteractionBlocked() || !drag || drag.pointer !== event.pointerId || sectorUI[id].slider.disabled) return;
      const distance = drag.startY - event.clientY;
      if (!drag.moved && Math.abs(distance) < 3) return;
      if (!drag.moved) {
        drag.moved = true; closeSectorEditor(); contextualCard.classList.remove('open');
        decisionSector = id;
      }
      const max = Number(sectorUI[id].slider.max);
      const requested = Math.max(0, Math.min(max, Math.round(drag.allocation + distance / 80 * max)));
      if (requested !== engine.getState().sectors[id].allocated) onAllocationChange(id, requested);
    });
    const endDrag = () => {
      if (drag?.moved) saveRecovery();
      if (drag) suppressClick = drag.moved;
      drag = null;
      label.classList.remove('operating');
    };
    label.addEventListener('pointerup', endDrag);
    label.addEventListener('pointercancel', endDrag);
    label.addEventListener('lostpointercapture', endDrag);
    label.addEventListener('click', () => {
      if (suppressClick) { suppressClick = false; return; }
      selectMapSector(id);
    });
  } else label.addEventListener('click', () => selectMapSector(id));
  mapSectorLabels.appendChild(label);
  const quick = document.createElement('button');
  quick.className = 'sector-quick-button';
  quick.textContent = `${engine.getState().sectors[id].icon} ${id === 'ecosystem' ? 'Aporte adicional al humedal' : engine.getState().sectors[id].shortName}`;
  quick.dataset.quickSector = id;
  quick.addEventListener('click', () => selectMapSector(id));
  document.querySelector('.sectors-grid')!.appendChild(quick);
}

// Nombres decorativos; los targets siguen en las obras físicas.
const networkLabels: { element: HTMLElement; x: number; y: number }[] = [];
for (const [key, text, x, y] of [
  ['river', 'Río principal', 0.335, 0.205],
  ['intake', 'Toma de agua', 0.475, 0.155],
  ['storage', 'Canal al embalse', 0.475, 0.285],
  ['dam', 'Embalse', 0.68, 0.225],
  ['supply', 'Canal de reparto', 0.69, 0.57],
  ['wells', 'Pozo', 0.835, 0.94]
] as const) {
  const element = document.createElement('span');
  element.className = 'map-cartographic-label';
  element.dataset.network = key;
  element.textContent = text;
  mapSectorLabels.appendChild(element);
  networkLabels.push({ element, x, y });
}
function waterQualityLabel(quality: number): string {
  return quality >= 70 ? 'buena' : quality >= 45 ? 'intermedia' : 'baja';
}

function closeSectorEditor(): void {
  const previous = selectedSector;
  sectorEditor.hidden = true;
  selectedSector = null;
  decisionSector = null;
  gateDecision.hidden = true;
  sectorEditor.classList.remove('showing-decision');
  if (previous) document.querySelector<HTMLButtonElement>(`[data-map-sector="${previous}"]`)?.focus({ preventScroll: true });
  document.querySelectorAll("[data-map-sector]").forEach(el => el.setAttribute("aria-expanded", "false"));
  for (const id of PLAYABLE_SECTORS) {
    sectorUI[id].card.classList.remove('selected-sector');
    document.querySelector(`[data-quick-sector="${id}"]`)?.setAttribute('aria-pressed', 'false');
  }
}

function selectMapSector(id: PlayableSectorId, focusSlider = true): void {
  if (backgroundInteractionBlocked()) return;
  if (tutorialManager.isActive() && !tutorialManager.getPhaseData().enabledSectors.includes(id)) return;
  contextualCard.classList.remove('open');
  selectedSector = id;
  previousGatePreview = undefined;
  if (tutorialManager.isActive() && window.innerWidth <= 800) setTutorialCollapsed(true);
  decisionSector = id;
  sectorEditor.hidden = false;
  document.querySelectorAll<HTMLElement>("[data-map-sector]").forEach(el => el.setAttribute("aria-expanded", String(el.dataset.mapSector === id)));
  sectorEditor.querySelector(".sector-editor-hint")!.textContent = id === "ecosystem"
    ? "Pedís agua extra al humedal. Con pedido 0 también puede llegar agua por el río."
    : "Subí la compuerta para pedir más; bajala para cerrar. También podés usar este control.";
  if (!tutorialManager.isActive()) sectorEditor.querySelector('.sector-editor-hint')!.textContent = id === 'ecosystem'
    ? 'El caudal ayuda a la salud de cuenca; calidad y acuífero también cuentan.'
    : id === 'population' ? 'Abastecer Ciudad sostiene confianza y recaudación. La recaudación llega al cierre del año.'
      : id === 'agriculture' ? 'La cobertura de Cultivos aporta al presupuesto anual; una brecha grande también afecta confianza.'
        : id === 'mining' ? 'La cobertura de Mina aporta regalías al cierre del año; una brecha grande afecta confianza.'
          : 'La cobertura de Granja aporta al presupuesto al cerrar el año.';
  for (const sector of PLAYABLE_SECTORS) {
    sectorUI[sector].card.classList.toggle('selected-sector', sector === id);
    document.querySelector(`[data-quick-sector="${sector}"]`)?.setAttribute('aria-pressed', String(sector === id));
  }
  PLAYABLE_SECTORS.forEach(updateSectorDisplay);
  updateGateDecision();
  positionMapControls();
  if (focusSlider) sectorUI[id].slider.focus({ preventScroll: true });
}

function positionMapControls(): void {
  const scene = BasinScene.instance;
  if (!scene) return;
  const compact = window.innerWidth <= 640;
  const headerBottom = document.querySelector('.top-bar')!.getBoundingClientRect().bottom;
  tutorialGuideBanner.style.setProperty('--tutorial-dock-top', `${headerBottom + 8}px`);
  document.getElementById('app')!.style.setProperty('--tutorial-inspection-top', `${headerBottom + 8}px`);
  const reserves = document.querySelector<HTMLDetailsElement>('.water-reserves-card')!;
  const inspectionTop = window.innerWidth <= 800 ? headerBottom + 74
    : Math.max(headerBottom + 16, reserves.getBoundingClientRect().bottom + 12);
  contextualCard.style.setProperty('--tutorial-context-top', `${inspectionTop}px`);
  contextualCard.style.setProperty('--tutorial-context-height', `${Math.max(100, document.querySelector('.allocation-panel')!.getBoundingClientRect().top - inspectionTop - 8)}px`);
  seasonalGoalBanner.style.top = compact ? `${headerBottom + 8}px` : '';
  if (!forecastPreview.hidden) {
    const forecastTop = compact ? headerBottom + 8 : Math.max(headerBottom + 8, timelineTracker.getBoundingClientRect().bottom + 8);
    forecastPreview.style.top = `${forecastTop}px`;
    seasonalGoalBanner.style.top = `${forecastPreview.getBoundingClientRect().bottom + 6}px`;
  }
  tutorialGuideBanner.style.top = compact ? `${headerBottom + 8}px` : '';
  for (const id of PLAYABLE_SECTORS) {
    const anchor = id === "ecosystem" ? scene.getMapAnchor(id) : scene.getIntakeAnchor(id);
    const label = document.querySelector<HTMLButtonElement>(`[data-map-sector="${id}"]`)!;
    label.style.left = `${Math.max(label.offsetWidth / 2 + 4, Math.min(scene.scale.width - label.offsetWidth / 2 - 4, anchor.x))}px`;
    label.style.top = `${anchor.y + (id === 'ecosystem' ? 22 : compact ? -29 : -43)}px`;
    label.disabled = tutorialManager.isActive() && !tutorialManager.getPhaseData().enabledSectors.includes(id);
  }
  const { height: mapHeight, top: mapTop } = scene.getMapLayout();
  for (const { element, x, y } of networkLabels) {
    element.style.left = `${scene.scale.width * (compact && element.dataset.network === "river" ? 0.17 : x)}px`;
    element.style.top = `${mapTop + mapHeight * (compact && element.dataset.network === "river" ? 0.60 : y)}px`;
  }
  positionValleyResultCards();
  if (selectedSector) {
    const gate=document.querySelector<HTMLElement>(`[data-map-sector="${selectedSector}"]`)!.getBoundingClientRect();
    const panel=document.querySelector('.allocation-panel')!.getBoundingClientRect();
    const editorWidth=sectorEditor.offsetWidth;
    sectorEditor.style.left=`${compact?8:Math.max(8,gate.left-editorWidth-18)}px`;
    const baseAvailableTop=tutorialManager.isActive() && window.innerWidth <= 800
      ? Math.max(headerBottom + 64, tutorialGuideBanner.getBoundingClientRect().bottom + 8)
      : headerBottom+(compact?64:8);
    const visibleBannerBottom = (element: HTMLElement) => element.getClientRects().length ? element.getBoundingClientRect().bottom + 8 : 0;
    const availableTop = Math.max(baseAvailableTop, visibleBannerBottom(forecastPreview), visibleBannerBottom(seasonalGoalBanner));
    const below=gate.bottom+14,above=gate.top-availableTop-14,spaceBelow=panel.top-below-8;
    const useBelow=compact&&spaceBelow>above;
    const compactDecision = compact && !tutorialManager.isActive();
    sectorEditor.style.maxHeight=`${Math.max(80,compact && !compactDecision?(useBelow?spaceBelow:above):panel.top-availableTop-8)}px`;
    const editorHeight=sectorEditor.offsetHeight;
    sectorEditor.style.top=`${compactDecision ? Math.max(availableTop, panel.top-editorHeight-8) : compact?useBelow?below:Math.max(availableTop,gate.top-editorHeight-14):Math.max(availableTop,Math.min(panel.top-editorHeight-8,gate.top))}px`;

  }
  if (!gateDecision.hidden && !selectedSector && decisionSector) {
    const gate = document.querySelector<HTMLElement>(`[data-map-sector="${decisionSector}"]`)!.getBoundingClientRect();
    const panelTop = document.querySelector('.allocation-panel')!.getBoundingClientRect().top;
    gateDecision.style.left = `${Math.max(8, Math.min(window.innerWidth - gateDecision.offsetWidth - 8, gate.left))}px`;
    const below = gate.bottom + 10;
    gateDecision.style.top = `${below + gateDecision.offsetHeight < panelTop - 8 ? below : Math.max(headerBottom + 64, gate.top - gateDecision.offsetHeight - 10)}px`;
  }
}

function isFirstWinterDecision(): boolean {
  const st = engine.getState();
  return !tutorialManager.isActive() && st.year === 1 && st.season === 'WINTER' && !st.isSeasonResolved;
}

function decisionPreviewContext(): string {
  const st = engine.getState();
  // Si hubo evento u obra, no atribuir al reparto una diferencia de condiciones.
  return JSON.stringify([
    st.year, st.turn, st.season, st.climateState, st.temperatureAnomaly,
    st.reservoirVolume, st.reservoirCapacity, st.aquiferVolume, st.aquiferCapacity,
    st.snowReserve, st.riverFlow, st.availableWater, st.waterQuality, st.basinHealth,
    st.publicTrust, st.upgrades, PLAYABLE_SECTORS.map(id => st.sectors[id].currentDemand)
  ]);
}

function updateGateDecision(): void {
  const practice = tutorialManager.isActive() && tutorialManager.getCurrentPhase() === 2;
  const id = decisionSector;
  gateDecision.hidden = !id || (tutorialManager.isActive() ? !practice || id === 'ecosystem' : engine.getState().isSeasonResolved && id !== 'ecosystem');
  sectorEditor.classList.toggle('showing-decision', !gateDecision.hidden && !!selectedSector);
  if (gateDecision.hidden || !id) return;
  const st = engine.getState();
  const sec = st.sectors[id];
  gateDecision.classList.toggle('floating', !selectedSector);
  (selectedSector ? sectorEditor : mapSectorLabels).appendChild(gateDecision);
  if (practice) {
    decisionReserve.hidden = false;
    decisionLimit.textContent = '';
    const coverage = Math.min(100, Math.round(sec.allocated / Math.max(1, sec.currentDemand) * 100));
    decisionSupply.textContent = `${sec.shortName} cubre ${coverage}%: recibe ${sec.allocated}💧; necesita ${sec.currentDemand}`;
    decisionReserve.textContent = `Sin repartir: ${st.availableWater - st.currentAllocatedTotal} 💧 · reservas fijas de práctica`;
    return;
  }
  const b = st.isSeasonResolved ? st.seasonHistory.at(-1)!.balance : engine.previewSeason().balance;
  const start = previousGateContext === decisionPreviewContext() ? previousGatePreview : undefined;
  const coverage = Math.round(b.satisfactions[id] * 100);
  const beforeCoverage = start ? Math.round(start.satisfactions[id] * 100) : undefined;
  // Igual que cleanRiverWater en el motor: incluye el aporte ecológico que continúa,
  // bypass, escorrentía y desbordes. Los retornos de las cuatro tomas van aparte.
  const useReturns = b.returns.population + b.returns.agriculture + b.returns.livestock + b.returns.mining;
  const continuingFlow = b.downstreamFlow - useReturns;
  gateDecision.dataset.tone = beforeCoverage === undefined || beforeCoverage === coverage ? 'steady' : coverage > beforeCoverage ? 'gain' : 'loss';
  const extra = Math.max(0, b.suppliedAllocations[id] - sec.currentDemand);
  const missing = sec.allocated - b.suppliedAllocations[id];
  decisionSupply.textContent = id === 'ecosystem'
    ? `Llegan ${b.downstreamFlow} 💧 · referencia ${sec.currentDemand} 💧 · cantidad ${coverage}%`
    : `Pedís ${sec.allocated} gotas · necesita ${sec.currentDemand}${missing > 0 ? ` · solo llegarían ${b.suppliedAllocations[id]}` : ''}.`;
  decisionLimit.textContent = id === 'ecosystem'
    ? `Por río y otros aportes ${continuingFlow} + retornos de otros usos ${useReturns} 💧 · calidad ${waterQualityLabel(b.waterQuality)}.`
    : missing > 0
      ? `Las fuentes no alcanzan: faltan ${missing} gotas del pedido. ${extra > 0 ? `Necesidad cubierta · ${extra} gotas extra no mejoran cobertura.` : coverage === 100 ? 'Necesidad cubierta.' : `Necesidad cubierta al ${coverage}%.`}`
      : extra > 0
        ? `Necesidad cubierta · ${extra} gotas extra no mejoran cobertura.`
        : b.satisfactions[id] >= 1 ? 'Necesidad cubierta.' : sec.allocated === 0
          ? 'Sin pedido: este sector recibiría 0 gotas.'
          : `El pedido llega completo, pero es menor que la demanda: cobertura ${coverage}%.`;
  decisionSupply.title = id === 'ecosystem' ? '' : `Pedido: ${Math.round(sec.allocated / Math.max(1, sec.currentDemand) * 100)}% de demanda. La cobertura compara suministro con demanda, no apertura física.`;
  decisionLimit.title = id === 'ecosystem' ? '' : `De las ${b.suppliedAllocations[id]} gotas recibidas, se usan ${b.consumptions[id]} y vuelven al río ${b.returns[id]}. El extra no aumenta la cobertura de demanda.`;
  // El costo de confirmar es el cambio de toda la estación, visible junto al botón.
  // Evitar deltas de un paso del slider: se confunden con ese costo completo.
  decisionReserve.hidden = id !== 'ecosystem';
  decisionReserve.textContent = id === 'ecosystem'
    ? `Aporte adicional: pedís ${sec.allocated} · ${st.isSeasonResolved ? 'entregado' : 'entrega prevista'} ${b.suppliedAllocations.ecosystem} 💧.${sec.allocated === 0 ? ' No pediste aporte extra; eso no significa río seco.' : ''}`
    : '';
}

document.getElementById('btn-close-sector')!.addEventListener('click', closeSectorEditor);
sectorEditor.addEventListener('keydown', event => {
  if (event.key === 'Escape') { event.stopPropagation(); closeSectorEditor(); }
});
window.addEventListener('resize', () => requestAnimationFrame(positionMapControls));
new ResizeObserver(() => {
  BasinScene.instance?.renderBasin();
  positionMapControls();
}).observe(document.querySelector('.allocation-panel')!);

let lastNewspaperEdition: NewspaperEdition | null = null;
let openedNewspaperEdition: NewspaperEdition | null = null;
let pendingNewspaperEdition: NewspaperEdition | null = null;
let newspaperReplayToken = 0;
const newspaperModalObserver = new MutationObserver(() => openPendingNewspaper());

function cancelPendingNewspaper(): void {
  newspaperReplayToken++;
  cardSeasonFeedback.classList.remove('open');
  pendingNewspaperEdition = null;
  newspaperModalObserver.disconnect();
  BasinScene.instance?.clearWaterReplay();
  cardSeasonFeedback.inert = false;
}

function openPendingNewspaper(): void {
  const edition = pendingNewspaperEdition;
  if (!edition) return;
  const state = engine.getState();
  if (edition !== lastNewspaperEdition || !state.isSeasonResolved ||
      edition.editionNumber !== state.turn || tutorialManager.isActive()) {
    cancelPendingNewspaper();
    return;
  }
  // Si hay otro modal abierto, esperar a su salida.
  const modals = document.querySelectorAll('.modal-backdrop');
  if (Array.from(modals).some(modal => modal.classList.contains('open'))) {
    cardSeasonFeedback.classList.remove('open');
    cardSeasonFeedback.inert = true;
    modals.forEach(modal => newspaperModalObserver.observe(modal, { attributes: true, attributeFilter: ['class'] }));
    return;
  }
  pendingNewspaperEdition = null;
  newspaperModalObserver.disconnect();
  showNewspaperModal(edition);
}

let lastReactionTime: Record<PlayableSectorId, number> = {
  population: 0,
  agriculture: 0,
  livestock: 0,
  mining: 0,
  ecosystem: 0
};

function triggerFloatingReaction(id: PlayableSectorId, text: string): void {
  const now = Date.now();
  if (now - lastReactionTime[id] < 500) return;
  lastReactionTime[id] = now;

  const container = sectorUI[id]?.floatContainer;
  if (!container) return;
  const item = document.createElement('div');
  item.className = 'floating-reaction-item';
  item.textContent = text;
  container.appendChild(item);
  setTimeout(() => {
    if (item.parentNode) item.parentNode.removeChild(item);
  }, 1300);
}

// Modal: Cierre de Año
const modalYearEnd = document.getElementById('modal-year-end')!;
const yearendTitle = document.getElementById('yearend-title')!;
const yearendBreakdown = document.getElementById('yearend-breakdown')!;
const yearendPop = document.getElementById('yearend-pop')!;
const yearendAgri = document.getElementById('yearend-agri')!;
const yearendLivestock = document.getElementById('yearend-livestock')!;
const yearendMin = document.getElementById('yearend-min')!;
const yearendEco = document.getElementById('yearend-eco')!;
const yearendAdvice = document.getElementById('yearend-advice')!;
const btnYearendUpgrades = document.getElementById('btn-yearend-upgrades')!;
const btnYearendContinue = document.getElementById('btn-yearend-continue')!;

// Modal: Mejoras
const modalUpgrades = document.getElementById('modal-upgrades')!;
const btnCloseUpgrades = document.getElementById('btn-close-upgrades')!;
const upgradesList = document.getElementById('upgrades-list')!;
const upgradesBudget = document.getElementById('upgrades-budget')!;
let activeUpgradeBranch: UpgradeBranch = 'AGUA_RESERVAS';

// Modal: Informe Final (Año 5)
const modalFinalReport = document.getElementById('modal-final-report')!;
const btnRestart = document.getElementById('btn-restart')!;

// Modal: Clima Futuro
const modalForecast = document.getElementById('modal-forecast')!;
const btnForecast = document.getElementById('btn-forecast')!;
const btnCloseForecast = document.getElementById('btn-close-forecast')!;
const forecastPreview = document.getElementById('forecast-preview')!;
// Presentation-only memory: buying sensors does not regenerate the current forecast.
const forecastMonitoringLevels = new WeakMap<ClimateForecast, number>();

// Modal: Modo Clase
const modalClassroom = document.getElementById('modal-classroom')!;
const btnClassroom = document.getElementById('btn-classroom')!;
const btnCloseClassroom = document.getElementById('btn-close-classroom')!;
const btnApplySeed = document.getElementById('btn-apply-seed')!;
const inputSeed = document.getElementById('input-seed') as HTMLInputElement;
const selectScenario = document.getElementById('select-scenario') as HTMLSelectElement;

// Modal: Guía
const modalHelp = document.getElementById('modal-help')!;
const btnHelp = document.getElementById('btn-help')!;
const btnCloseHelp = document.getElementById('btn-close-help')!;

// Metas estacionales

// --- TRACKER GRÁFICO DE 20 TURNOS (5 AÑOS X 4 ESTACIONES) ---
function renderTimelineTracker(): void {
  const state = engine.getState();
  const currentTurn = state.turn;

  timelineTracker.innerHTML = '';

  const seasonIcons = ['❄️', '🌱', '☀️', '🍂'];
  const seasonKeys: SeasonType[] = ['WINTER', 'SPRING', 'SUMMER', 'AUTUMN'];

  for (let y = 1; y <= 5; y++) {
    const group = document.createElement('div');
    group.className = 'tracker-year-group';

    const lbl = document.createElement('span');
    lbl.className = 'tracker-year-label';
    lbl.textContent = `A${y}`;
    group.appendChild(lbl);

    for (let s = 0; s < 4; s++) {
      const turnNumber = (y - 1) * 4 + (s + 1);
      const pill = document.createElement('div');
      pill.className = 'tracker-season-pill';

      if (turnNumber < currentTurn) {
        pill.classList.add('completed');
        pill.textContent = '✓';
        pill.title = `Año ${y} ${SEASONS_INFO[seasonKeys[s]].name} (Completado)`;
      } else if (turnNumber === currentTurn) {
        pill.classList.add('current');
        pill.textContent = seasonIcons[s];
        pill.title = `Año ${y} ${SEASONS_INFO[seasonKeys[s]].name} (Turno Actual)`;
      } else {
        pill.classList.add('future');
        pill.textContent = seasonIcons[s];
        pill.title = `Año ${y} ${SEASONS_INFO[seasonKeys[s]].name}`;
      }

      group.appendChild(pill);
    }

    timelineTracker.appendChild(group);
  }
}

// --- ACTUALIZACIÓN DEL DESAFÍO ESTACIONAL ---
function getCurrentSeasonalGoal(): SeasonalGoal | undefined {
  return engine.getCurrentSeasonalGoal();
}

function updateSeasonalGoalDisplay(): void {
  const goal = getCurrentSeasonalGoal();
  if (!goal) {
    seasonalGoalBanner.style.display = 'none';
    return;
  }
  seasonalGoalBanner.style.display = 'flex';
  goalTitle.textContent = goal.title;
  goalDesc.textContent = goal.description;
  if (engine.getState().goalRulesVersion && engine.getState().turn > 1) {
    const st = engine.getState();
    const b = st.isSeasonResolved ? st.seasonHistory.at(-1)?.balance : engine.previewSeason().balance;
    if (b) goalRewardBadge.title = `${goal.hint} ${goalProgress(goal, b)}`;
  }
  if (isFirstWinterDecision() && goal.targetCondition.type === 'CITY_AND_RESERVOIR_MIN') {
    const st = engine.getState();
    const b = engine.previewSeason().balance;
    const reached = checkSeasonalGoal(goal, st, b);
    goalDesc.textContent = `${goal.description} Previsto: ${reached ? 'encaminada' : 'todavía no alcanza'} · Ciudad ${Math.floor(b.satisfactions.population * 100)}% / meta ${goal.targetCondition.cityCoverageThreshold}% · embalse ${b.reservoirEnd} gotas / meta ${goal.targetCondition.threshold} gotas`;
  }
  goalRewardBadge.textContent = `+$${goal.reward.moneyBonus} 💰`;
  if (!goalProgress(goal, engine.getState().isSeasonResolved ? engine.getState().seasonHistory.at(-1)!.balance : engine.previewSeason().balance)) goalRewardBadge.title = goal.hint;
}

// --- REGISTRO DE ASIGNACIÓN INICIAL DEL TURNO ---
function recordTurnInitialAllocations(): void {
  const sec = engine.getState().sectors;
  initialTurnAllocations = {
    population: sec.population.allocated,
    agriculture: sec.agriculture.allocated,
    livestock: sec.livestock.allocated,
    mining: sec.mining.allocated,
    ecosystem: sec.ecosystem.allocated,
  };
}

// Called only on turn entry (or its blocking event choice), never during UI refresh,
// purchases or player allocation changes. First winter and tutorial retain their setup.
function prepareTurnStartingDistribution(): void {
  closeDistributionTip();
  // Mantener la decisión anterior; la sugerencia sólo se aplica a pedido.
  recordTurnInitialAllocations();
}

// --- ACTUALIZACIÓN DE SECTORES Y SLIDERS INDIVIDUALES ---
function updateSectorDisplay(id: PlayableSectorId): void {
  const sec = engine.getState().sectors[id];
  const ui = sectorUI[id];
  if (!ui) return;

  ui.disp.textContent = `Recibe ${sec.allocated} · necesita ${sec.currentDemand} 💧`;
  ui.slider.max = Math.max(Number(ui.slider.max) || 30, sec.allocated, Math.round(sec.currentDemand * 1.5), 30).toString();
  ui.slider.value = sec.allocated.toString();
  ui.slider.disabled = engine.getState().isSeasonResolved || (tutorialManager.isActive() && !tutorialManager.getPhaseData().enabledSectors.includes(id));
  ui.slider.setAttribute('aria-label', `${sec.shortName}: asignación de agua`);
  ui.slider.setAttribute('aria-valuetext', `${sec.allocated} gotas, demanda ${sec.currentDemand}`);
  ui.slider.style.setProperty('--demand-mark', `${Math.min(100, sec.currentDemand / Number(ui.slider.max) * 100)}%`);

  const st = engine.getState();
  const balance = tutorialManager.isActive() ? undefined
    : st.isSeasonResolved ? st.seasonHistory.at(-1)?.balance : engine.previewSeason().balance;
  if (balance && id !== "ecosystem") {
    ui.disp.textContent = `Pedido ${Math.round(sec.allocated / Math.max(1, sec.currentDemand) * 100)}% · ${sec.allocated} 💧 solicitadas`;
    ui.slider.setAttribute("aria-valuetext", `${sec.allocated} gotas solicitadas; suministro ${balance.suppliedAllocations[id]}; demanda ${sec.currentDemand}`);
    ui.slider.setAttribute('aria-label', `${sec.shortName}: pedido de agua`);
    if (st.isSeasonResolved) ui.disp.textContent = `Pedido ${sec.allocated} · recibió ${balance.suppliedAllocations[id]}/${sec.currentDemand} 💧`;
  }
  if (id === "ecosystem") {
    ui.slider.setAttribute("aria-label", "Aporte adicional al humedal");
    ui.slider.setAttribute("aria-valuetext", `${sec.allocated} gotas adicionales solicitadas${balance ? `; entrega ${balance.suppliedAllocations.ecosystem}; caudal total ${balance.downstreamFlow}; referencia ${sec.currentDemand}; calidad ${waterQualityLabel(balance.waterQuality)}` : '; ejercicio de práctica'}`);
  }
  const pct = st.isSeasonResolved ? Math.round(sec.satisfactionRate * 100)
    : balance
      ? Math.round(balance.satisfactions[id] * 100)
      : Math.round((sec.allocated / Math.max(1, sec.currentDemand)) * 100);
  ui.cov.title = id === 'ecosystem' ? 'Porcentaje del caudal aguas abajo frente a la referencia. Incluye agua que sigue por el río y retornos; la calidad se evalúa aparte.' : 'Cobertura de demanda';
  if (tutorialManager.isActive() && id === 'ecosystem') ui.cov.title = 'Ejercicio de protección explícita; no calcula caudal total aguas abajo ni calidad.';
  if (id === 'ecosystem') {
    ui.disp.textContent = balance
      ? `Aporte adicional: pedido ${sec.allocated} · ${st.isSeasonResolved ? 'entregado' : 'entrega prevista'} ${balance.suppliedAllocations.ecosystem} 💧${st.isSeasonResolved ? ` · llegaron ${balance.downstreamFlow} / referencia ${sec.currentDemand} · calidad ${waterQualityLabel(balance.waterQuality)}` : ''}`
      : `Aporte adicional: ${sec.allocated} · práctica: probá ${sec.currentDemand} 💧`;
    ui.disp.title = balance
      ? `Por río y otros aportes: ${balance.downstreamFlow - balance.returns.population - balance.returns.agriculture - balance.returns.livestock - balance.returns.mining}; retornos de otros usos: ${balance.returns.population + balance.returns.agriculture + balance.returns.livestock + balance.returns.mining}. El aporte entregado incluye agua usada por el humedal y agua que continúa.`
      : 'Asignación de práctica frente a la meta del tutorial.';
  }
  ui.cov.textContent = `${!tutorialManager.isActive() ? id === 'ecosystem' ? 'Caudal ' : 'Cobertura ' : ''}${pct}%`;
  ui.cov.className = 'coverage-pill';
  if (pct < 70) ui.cov.classList.add('cov-deficit');
  else if (pct < 100) ui.cov.classList.add('cov-partial');
  else if (pct === 100) ui.cov.classList.add('cov-100');
  else ui.cov.classList.add('cov-over');

  // Diálogo y estado del portavoz del sector
  const fb = getCharacterFeedback(id, pct);
  ui.avatar.textContent = fb.avatarIcon;
  ui.speaker.textContent = fb.character.name;
  ui.quote.textContent = `"${fb.quote}"`;
  if (tutorialManager.isActive()) ui.quote.textContent = `Necesitamos ${sec.currentDemand} gotas. Probá mover el control y mirá cuánto recibimos.`;
  if (tutorialManager.isActive() && id === 'ecosystem') ui.quote.textContent = 'Practicá pedir agua extra. Con pedido 0 también puede llegar agua por el río.';
  if (!tutorialManager.isActive() && id === 'ecosystem' && balance && sec.allocated < sec.currentDemand && pct === 100) {
    ui.quote.textContent = 'Al humedal también llega agua que siguió por el río o volvió de otros usos. El 100% dice que alcanza la cantidad; mirá aparte si está limpia.';
  }

  if (id === 'ecosystem' && balance && sec.allocated === 0 && balance.downstreamFlow > 0) ui.quote.textContent = 'Pediste 0 gotas extra, pero el río trae agua al humedal.';

  // Tinte visual de la burbuja según satisfacción
  if (pct >= 90) {
    ui.quote.style.borderColor = 'rgba(52, 211, 153, 0.45)';
    ui.quote.style.color = '#f8fafc';
  } else if (pct >= 65) {
    ui.quote.style.borderColor = 'rgba(250, 204, 21, 0.45)';
    ui.quote.style.color = '#fef08a';
  } else {
    ui.quote.style.borderColor = 'rgba(239, 68, 68, 0.45)';
    ui.quote.style.color = '#fca5a5';
  }

  // Emoji de ánimo del sector
  if (id === 'population') ui.mood.textContent = pct >= 100 ? '😊' : pct >= 70 ? '😐' : '😟';
  else if (id === 'agriculture') ui.mood.textContent = pct >= 100 ? '🌽' : pct >= 70 ? '🌾' : '🍂';
  else if (id === 'livestock') ui.mood.textContent = pct >= 100 ? '🥛' : pct >= 70 ? '🐄' : '🥀';
  else if (id === 'mining') ui.mood.textContent = pct >= 100 ? '⚙️' : pct >= 70 ? '⛏️' : '🛑';
  else if (id === 'ecosystem') ui.mood.textContent = pct >= 100 ? '🐬' : pct >= 70 ? '🐟' : '⚠️';
  const mapButton = document.querySelector<HTMLButtonElement>(`[data-map-sector="${id}"]`);
  if (mapButton) {
    if (id === 'ecosystem') {
      mapButton.textContent = balance ? `Río Vivo · caudal ${pct}%` : 'Río Vivo';
      mapButton.title = balance ? `Caudal ${balance.downstreamFlow}/${sec.currentDemand}; calidad ${waterQualityLabel(balance.waterQuality)}` : 'Río Vivo · práctica';
    } else {
      mapButton.querySelector('.gate-caption')!.textContent = tutorialManager.isActive()
        ? `${sec.shortName} · ${Math.min(100, pct)}%`
        : `${sec.shortName} · cubre ${pct}%`;
      const opening = sec.allocated / Math.max(1, Number(ui.slider.max));
      const supplied = balance?.suppliedAllocations[id] ?? sec.allocated;
      mapButton.style.setProperty('--gate-lift', `${-opening * 27}px`);
      mapButton.style.setProperty('--gate-turn', `${opening * 270}deg`);
      mapButton.style.setProperty('--gate-water', String(Math.min(1, supplied / Math.max(1, sec.currentDemand))));
      mapButton.classList.toggle('closed', sec.allocated === 0);
      mapButton.classList.toggle('supply-shortfall', supplied < sec.allocated);
      mapButton.setAttribute('aria-label', `Compuerta ${sec.shortName}, pedido ${sec.allocated} gotas, recibe ${supplied}, cobertura ${Math.min(100, pct)}%. Arrastrá hacia arriba para abrir o hacia abajo para cerrar. Activar para ajuste preciso con teclado.`);
      mapButton.title = `Pedido ${sec.allocated} 💧 · recibe ${supplied} 💧 · cobertura ${Math.min(100, pct)}%. Arrastrá ↑ pedir más / ↓ pedir menos.`;
      if (tutorialManager.isActive()) {
        mapButton.setAttribute('aria-label', `Compuerta ${sec.shortName}, cobertura ${Math.min(100, pct)}%. Arrastrá hacia arriba para abrir o hacia abajo para cerrar. Activar para ajuste preciso con teclado.`);
        mapButton.title = 'Arrastrá ↑ abrir / ↓ cerrar. Tocá para ajustar con teclado.';
      }
      // El detalle existe una sola vez, en el editor contextual.
      let returns = ui.card.querySelector<HTMLElement>('.gate-return-detail');
      if (!returns) { returns = document.createElement('div'); returns.className = 'gate-return-detail'; ui.disp.parentElement!.after(returns); }
      returns.textContent = balance ? `Retorno: ${balance.returns[id]} 💧 · calidad ${waterQualityLabel(balance.returnQualities[id])}` : '';
    }
    mapButton.classList.toggle('needs-water', pct < 70);
  }
}

// --- ACTUALIZACIÓN DE BALANCE DE AGUA Y RESERVA ---
function updateBalanceDisplay(): void {
  updateGateDecision();
  if (!tutorialManager.isActive()) updateSeasonalGoalDisplay();
  const state = engine.getState();
  valTotalAllocated.textContent = state.currentAllocatedTotal.toString();
  valWaterAvailable.textContent = state.availableWater.toString();

  const reserve = state.availableWater - state.currentAllocatedTotal;
  if (reserve >= 0) {
    pillReserve.className = 'water-metric-pill reserve-pill';
    pillReserve.innerHTML = `💧 Sin repartir: <strong id="val-water-reserve">${reserve}</strong>`;
    pillReserve.title = 'Agua del límite recomendado que todavía no repartiste. No se agrega automáticamente al embalse: puede quedar guardada o seguir por el río.';
  } else {
    const deficit = Math.abs(reserve);
    pillReserve.className = 'water-metric-pill warning';
    pillReserve.innerHTML = `⚠️ Pedís de más: <strong id="val-water-reserve">${deficit}</strong>`;
    pillReserve.title = 'Se supera la disponibilidad prudente. El bombeo real depende del río y el embalse; puede faltar agua.';
  }
  const previewEl = document.getElementById('water-preview')!;
  if (tutorialManager.isActive()) {
    previewEl.textContent = 'Práctica: probá los controles. Las reservas son ejemplos.';
  } else {
    const b = state.isSeasonResolved ? state.seasonHistory.at(-1)!.balance : engine.previewSeason().balance;
    const heading = state.isSeasonResolved ? 'Resultado de este reparto:'
      : `Con este reparto, al terminar ${state.season === 'SPRING' ? 'la' : 'el'} ${SEASONS_INFO[state.season].name.toLowerCase()}:`;
    const usesReservoir = b.reservoirWithdrawal > 0;
    const usesWells = b.aquiferWithdrawal > 0;
    const source = usesReservoir && usesWells ? 'el embalse y los pozos'
      : usesReservoir ? 'el embalse' : 'los pozos';
    const sourceVerb = state.isSeasonResolved
      ? usesWells ? 'aportaron' : 'aportó'
      : usesWells ? 'aportan' : 'aporta';
    const requestGaps = describeRequestGaps(b);
    const explanation = usesReservoir || usesWells
      ? `El agua captada del río no ${state.isSeasonResolved ? 'alcanzó' : 'alcanza'}; ${source} ${sourceVerb} agua.`
      : b.totalWaterSupplied > 0 ? 'El agua captada del río cubre los pedidos.' : 'Sin pedidos de agua a los sectores.';
    previewEl.innerHTML = `<div class="reserve-preview-sources">${state.isSeasonResolved ? 'Este reparto usó' : 'Con este reparto'}: río ${b.directRiverIntake} · embalse ${b.reservoirWithdrawal} · pozos ${b.aquiferWithdrawal} 💧</div>
      <div class="reserve-preview-heading">${heading}</div>
      <table class="reserve-preview-table">
        <thead><tr><th scope="col">Reserva (💧)</th><th scope="col">${state.isSeasonResolved ? 'Inicio' : 'Ahora'}</th><th scope="col">${state.isSeasonResolved ? 'Final' : 'Quedaría'}</th></tr></thead>
        <tbody>
          <tr><th scope="row">Embalse</th><td>${b.reservoirStart}</td><td data-decreases="${b.reservoirEnd < b.reservoirStart}">${b.reservoirEnd}</td></tr>
          <tr><th scope="row">Agua bajo tierra</th><td>${b.aquiferStart}</td><td data-decreases="${b.aquiferEnd < b.aquiferStart}">${b.aquiferEnd}</td></tr>
        </tbody>
      </table>
      <div class="reserve-preview-reason">${explanation}${requestGaps ? ` ${requestGaps}` : ''}${b.unmetAllocation > 0 ? ` Faltan ${b.unmetAllocation} gotas del pedido.` : ''}</div>`;
    previewEl.title = `Reservas al inicio y al cierre de esta estación, incluyendo entradas y salidas. Se ${state.isSeasonResolved ? 'retiraron' : 'retirarían'} ${b.reservoirWithdrawal} gotas del embalse y ${b.aquiferWithdrawal} de los pozos; las recargas y la evaporación también afectan lo que queda.`;
    previewEl.classList.toggle('warning', b.unmetAllocation > 0 || !!requestGaps);
    btnResolveSeason.title = requestGaps ? `${requestGaps} Podés confirmar este reparto o ajustarlo.` : 'Confirmar este reparto y ver sus consecuencias.';
  }
}

// --- CONSEJOS A PEDIDO: NO INTERRUMPEN EL MAPA ---
function checkContextualTips(): void {
  if (tutorialManager.isActive()) return;

  const st = engine.getState();
  if (st.aquiferVolume / st.aquiferCapacity < 0.6 && !shownTips.has('aquifer_low')) {
    showToastTip(
      'aquifer_low',
      '⚠️ Agua Subterránea en Tensión',
      'El agua bajo tierra cayó por debajo del 60%. Los pozos tardan mucho en recargarse; evita el sobregasto continuo.'
    );
  } else if (st.waterQuality < 60 && !shownTips.has('water_quality_low')) {
    showToastTip(
      'water_quality_low',
      '🧪 Alerta de Limpieza del Río',
      'El agua del río está perdiendo pureza. Construye plantas de tratamiento o mantén el caudal ecológico para limpiarlo.'
    );
  } else if (Object.values(st.upgrades).some((u) => u.currentLevel > 0) && !shownTips.has('first_upgrade')) {
    showToastTip(
      'first_upgrade',
      '🛠️ Obra de Cuenca en Operación',
      '¡Ya tenés una obra construida! Mirá su efecto en el catálogo y ajustá el reparto para aprovecharla.'
    );
  }
}

function showToastTip(key: string, title: string, desc: string): void {
  shownTips.add(key);
  toastTipTitle.textContent = title;
  toastTipDesc.textContent = desc;
}

btnCloseToast.addEventListener('click', () => {
  if (!canUseControl(btnCloseToast)) return;
  closeDistributionTip();
  btnDistributionTip.focus();
});

// --- MANEJO DE CAMBIOS EN SLIDERS Y AJUSTE FINO (+ / -) ---
let sliderRafId: number | null = null;
function onAllocationChange(id: PlayableSectorId, value: number): void {
  if (backgroundInteractionBlocked()) return;
  let cleanVal = Math.max(0, Math.round(value));
  const prevAlloc = engine.getState().sectors[id].allocated;
  if (!tutorialManager.isActive() && prevAlloc !== cleanVal) {
    previousGatePreview = engine.previewSeason().balance;
    previousGateContext = decisionPreviewContext();
    decisionSector = id;
  }
  const prevRiverCoverage = id === 'ecosystem' && !tutorialManager.isActive()
    ? Math.round(engine.previewSeason().balance.satisfactions.ecosystem * 100) : null;
  engine.setSectorAllocation(id, cleanVal);
  scheduleRecoverySave();
  PLAYABLE_SECTORS.forEach(updateSectorDisplay);
  updateBalanceDisplay();

  // Audio hidráulico modulado y reacción flotante
  const sec = engine.getState().sectors[id];
  const ratio = cleanVal / Math.max(1, sec.currentDemand);
  sound.waterGurgle(0.7 + ratio * 0.5);

  const riverCoverage = prevRiverCoverage === null ? null
    : Math.round(engine.previewSeason().balance.satisfactions.ecosystem * 100);
  const actualCoverage = tutorialManager.isActive() ? Math.round(ratio * 100)
    : Math.round(engine.previewSeason().balance.satisfactions[id] * 100);
  const fb = getCharacterFeedback(id, riverCoverage ?? actualCoverage);
  const previousCoverage = previousGatePreview ? Math.round(previousGatePreview.satisfactions[id] * 100) : undefined;
  if (Math.abs(cleanVal - prevAlloc) >= 1 && (tutorialManager.isActive() || actualCoverage !== previousCoverage)) {
    triggerFloatingReaction(id, fb.reaction);
  }

  // Si sobrepasa el agua disponible y gasta de pozos
  const st = engine.getState();
  if (st.availableWater - st.currentAllocatedTotal < 0) {
    sound.warningDry();
  }

  // Actualización visual en vivo del mapa Phaser sincronizada con la tasa de refresco
  if (!sliderRafId) {
    sliderRafId = window.requestAnimationFrame(() => {
      sliderRafId = null;
      if (BasinScene.instance) {
        BasinScene.instance.updateGameState(engine.getState(), tutorialManager.isActive() ? undefined : engine.previewSeason().balance);
      }
    });
  }

  // Cerrar la ficha contextual si estaba abierta para que nunca obstaculice los sliders
  if (contextualCard.classList.contains('open')) {
    contextualCard.classList.remove('open');
  }

  if (tutorialManager.isActive()) {
    onTutorialSliderChange(id);
  }
  positionMapControls();
}

// Enlazar eventos para cada uno de los 5 sectores
PLAYABLE_SECTORS.forEach((id) => {
  const ui = sectorUI[id];
  ui.slider.addEventListener('input', () => {
    onAllocationChange(id, Number(ui.slider.value));
  });
  ui.slider.addEventListener('change', () => {
    onAllocationChange(id, Number(ui.slider.value));
    saveRecovery();
  });
  ui.btnMinus.addEventListener('click', () => {
    sound.pop();
    const curr = engine.getState().sectors[id].allocated;
    onAllocationChange(id, Math.max(0, curr - 1));
  });
  ui.btnPlus.addEventListener('click', () => {
    sound.pop();
    const curr = engine.getState().sectors[id].allocated;
    onAllocationChange(id, curr + 1);
  });
});

// --- DISTRIBUCIÓN SUGERIDA Y RESTABLECER ---
function applySuggestedDistribution(): void {
  const allocation = suggestDistribution(engine, getCurrentSeasonalGoal());
  PLAYABLE_SECTORS.forEach(id => {
    engine.setSectorAllocation(id, allocation[id]);
    updateSectorDisplay(id);
  });
  const balance = engine.previewSeason().balance;
  updateBalanceDisplay();
  BasinScene.instance?.updateGameState(engine.getState(), balance);
  updateDistributionTip();
}

function updateDistributionTip(): void {
  const balance = engine.previewSeason().balance;
  const pending = [...(['agriculture', 'livestock', 'mining'] as const)]
    .sort((a, b) => balance.satisfactions[a] - balance.satisfactions[b])[0];
  const pendingName = pending === 'agriculture' ? 'Cultivos' : pending === 'livestock' ? 'Granja' : 'Mina';
  const reserveDelta = balance.reservoirEnd - balance.reservoirStart;
  const reserveMessage = reserveDelta > 0 ? `El embalse prevé sumar ${reserveDelta} gotas.`
    : reserveDelta < 0 ? `El embalse prevé bajar ${-reserveDelta} gotas.` : 'El embalse prevé conservar su nivel.';
  const st = engine.getState();
  const savingsContext = st.scenarioId === 'cuenca_central' && st.turn > 1
    && (st.season === 'WINTER' || st.season === 'SPRING')
    && (st.reservoirVolume < st.reservoirCapacity * 0.6 || st.aquiferVolume < st.aquiferCapacity * 0.4)
    && reserveDelta > 0 && (['agriculture', 'livestock', 'mining'] as const)
      .every(id => balance.satisfactions[id] >= 0.7)
    ? ' Este reparto deja margen productivo para recuperar reservas.' : '';
  showToastTip('suggested_distribution', '💡 Consejo para este reparto',
    `Río Vivo cuenta el caudal y los retornos, además del aporte extra. Previsión: Ciudad ${Math.round(balance.satisfactions.population * 100)}%, río ${Math.round(balance.satisfactions.ecosystem * 100)}%. ${pendingName} queda en ${Math.round(balance.satisfactions[pending] * 100)}%; darle más puede costar otras coberturas o reservas. ${reserveMessage}${savingsContext} La sugerencia es un punto de partida, no garantiza cumplir el desafío. Lo no asignado no se guarda todo; revisá la meta.`);
}

btnDistributionTip.addEventListener('click', () => {
  if (!canUseControl(btnDistributionTip)) return;
  if (toastTip.classList.contains('open')) { closeDistributionTip(); return; }
  updateDistributionTip();
  checkContextualTips();
  toastTip.classList.add('open');
  btnDistributionTip.setAttribute('aria-expanded', 'true');
});
toastTip.addEventListener('keydown', event => {
  if (event.key === 'Escape') { closeDistributionTip(); btnDistributionTip.focus(); }
});
btnDistributionTip.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeDistributionTip();
});

function resetCurrentDistribution(): void {
  PLAYABLE_SECTORS.forEach((id) => {
    const val = initialTurnAllocations[id] ?? 0;
    engine.setSectorAllocation(id, val);
    updateSectorDisplay(id);
  });
  updateBalanceDisplay();
  BasinScene.instance?.updateGameState(engine.getState(), engine.previewSeason().balance);
}

btnSuggestedDist.addEventListener('click', () => {
  if (!canUseControl(btnSuggestedDist)) return;
  sound.pop();
  applySuggestedDistribution();
  saveRecovery();
});

btnResetDist.addEventListener('click', () => {
  if (!canUseControl(btnResetDist)) return;
  sound.pop();
  resetCurrentDistribution();
  saveRecovery();
});

// --- GESTIÓN DEL TUTORIAL JUGABLE (AÑO 0) ---
function startTutorial(): void {
  saveRecovery();
  recoveryWritesEnabled = false;
  preserveRecoveryOriginal = true;
  dismissRecoveryChoice();
  cancelPendingNewspaper();
  engine = createRecordedEngine();
  sessionLog = null;
  tutorialManager.startTutorial();
  document.getElementById('app')!.classList.add('tutorial-active');
  modalWelcome.classList.remove('open');
  tutorialGuideBanner.style.display = 'flex';
  seasonalGoalBanner.style.display = 'none';

  // Aplicar línea de base controlada del Año 0
  const st = engine.getState();
  st.year = 0;
  st.turn = 0;
  st.reservoirVolume = tutorialData.initialState.reservoirVolume;
  st.aquiferVolume = tutorialData.initialState.aquiferVolume;
  st.snowReserve = tutorialData.initialState.snowReserve;
  st.waterQuality = tutorialData.initialState.waterQuality;
  st.basinHealth = tutorialData.initialState.basinHealth;
  st.publicTrust = tutorialData.initialState.publicTrust;
  st.money = tutorialData.initialState.money;
  st.reservoirCapacity = tutorialData.initialState.reservoirCapacity;
  st.aquiferCapacity = tutorialData.initialState.aquiferCapacity;
  for (const id of PLAYABLE_SECTORS) {
    st.sectors[id].baseDemand = tutorialData.demands[id];
    st.sectors[id].currentDemand = tutorialData.demands[id];
  }

  setupTutorialPhaseUI();
}

function exitTutorialToYearOne(): void {
  beginFreshRecovery();
  cancelPendingNewspaper();
  tutorialManager.exitTutorial();
  document.getElementById('app')!.classList.remove('tutorial-active');
  document.querySelector('.water-reserves-card')?.classList.remove('tutorial-reserve-focus');
  document.querySelectorAll('.tutorial-target').forEach(el => el.classList.remove('tutorial-target'));
  btnTutNext.hidden = false;
  tutorialGuideBanner.style.display = 'none';

  // Desbloquear todos los sectores y sliders
  PLAYABLE_SECTORS.forEach((id) => {
    sectorUI[id].card.classList.remove('disabled-tut', 'highlight-tut');
    sectorUI[id].slider.disabled = false;
    sectorUI[id].btnMinus.disabled = false;
    sectorUI[id].btnPlus.disabled = false;
  });

  // Re-iniciar simulación con semilla de aula limpia y pura
  engine = createRecordedEngine();
  saveRecovery();
  recordTurnInitialAllocations();
  updateUI();
  BasinScene.instance?.updateGameState(engine.getState(), engine.previewSeason().balance);
}

function setupTutorialPhaseUI(): void {
  setTutorialCollapsed(false);
  const pData = tutorialManager.getPhaseData();
  const phase = tutorialManager.getCurrentPhase();
  const total = tutorialManager.getTotalPhases();
  const st = engine.getState();

  st.season = pData.season;
  tutorialGuideBanner.dataset.phase = String(phase);
  st.availableWater = pData.availableWater;
  for (const id of PLAYABLE_SECTORS) st.sectors[id].currentDemand = tutorialData.demands[id];
  // Escenarios fijos de práctica: no resolver ni consumir azar de gameplay.
  st.climateState = 'NORMAL';
  st.snowReserve = phase === 1 ? 75 : 45;
  st.reservoirVolume = 35;
  st.riverFlow = phase === 1 ? 8 : 28;

  tutPhaseBadge.textContent = `${phase}/${total} · ${pData.title}`;
  tutTitle.textContent = pData.title;
  tutFeedback.style.display = 'none';
  tutFeedback.className = 'tut-feedback';
  tutChoices.style.display = 'none';
  tutChoices.innerHTML = '';

  tutDesc.innerHTML = `<p>${pData.instruction}</p><p class="tut-action"><strong>Hacé:</strong> ${pData.hint}</p>`;
  tutorialGuideBanner.querySelector<HTMLElement>('.tutorial-body')!.scrollTop = 0;

  // Activar o desactivar sectores según la fase
  PLAYABLE_SECTORS.forEach((id) => {
    const ui = sectorUI[id];
    const isEnabled = pData.enabledSectors.includes(id);
    const isTarget = pData.targetSector === id;

    if (isEnabled) {
      ui.card.classList.remove('disabled-tut');
      ui.slider.disabled = false;
      ui.btnMinus.disabled = false;
      ui.btnPlus.disabled = false;
    } else {
      ui.card.classList.add('disabled-tut');
      ui.slider.disabled = true;
      ui.btnMinus.disabled = true;
      ui.btnPlus.disabled = true;
      engine.setSectorAllocation(id, 0);
    }

    if (isTarget) {
      ui.card.classList.add('highlight-tut');
    } else {
      ui.card.classList.remove('highlight-tut');
    }
  });

  // Ajustes de partida específicos de fase
  if (phase === 1) {
    PLAYABLE_SECTORS.forEach((id) => engine.setSectorAllocation(id, 0));
  } else if (phase === 2) {
    engine.setSectorAllocation('population', 0);
  } else if (phase === 3) {
    engine.setSectorAllocation('population', engine.getState().scenarioId === 'cuenca_central'
      ? Math.min(20, engine.getState().sectors.population.currentDemand) : 20);
    engine.setSectorAllocation('ecosystem', 0);
  }

  // El último gesto usa el mismo control que cierra una estación real.
  btnTutNext.hidden = phase === total;
  btnTutNext.textContent = 'Continuar →';

  PLAYABLE_SECTORS.forEach((id) => updateSectorDisplay(id));
  updateBalanceDisplay();
  updateUI();
  BasinScene.instance?.updateGameState(st);
  if (pData.targetSector && pData.targetSector !== 'reserve') selectMapSector(pData.targetSector);
  else if (phase !== total && pData.enabledSectors.length) selectMapSector(pData.enabledSectors[0] as PlayableSectorId);
  else closeSectorEditor();
  const target = pData.targetSector;
  document.querySelectorAll('[data-map-sector], [data-quick-sector]').forEach(el => {
    const button = el as HTMLElement;
    button.classList.toggle('tutorial-target', (button.dataset.mapSector ?? button.dataset.quickSector) === target);
  });
  document.querySelector('.water-reserves-card')?.classList.toggle('tutorial-reserve-focus', phase === 1);
  btnResolveSeason.classList.toggle('tutorial-target', phase === total);
  onTutorialSliderChange(pData.targetSector === 'ecosystem' ? 'ecosystem' : 'population');
}

function onTutorialSliderChange(id: PlayableSectorId): void {
  const phase = tutorialManager.getCurrentPhase();
  const st = engine.getState();
  tutFeedback.className = 'tut-feedback';

  if (phase === 1) {
    tutFeedback.style.display = 'block';
    tutFeedback.textContent = `💧 Disponibles ahora: ${st.availableWater}. Nieve y embalse guardan agua para otros momentos.`;
  } else if (phase === 2 && id === 'population') {
    const pop = st.sectors.population.allocated;
    if (pop >= 20) {
      tutFeedback.style.display = 'block';
      tutFeedback.className = 'tut-feedback success';
      tutFeedback.textContent = `✓ Cobertura de práctica: 100%. Quedan ${st.availableWater - st.currentAllocatedTotal} gotas sin repartir.`;
    } else {
      tutFeedback.style.display = 'block';
      tutFeedback.className = 'tut-feedback';
      tutFeedback.textContent = `Cobertura: ${Math.round(pop / st.sectors.population.currentDemand * 100)}%. Quedan ${st.availableWater - st.currentAllocatedTotal} gotas.`;
    }
  } else if (phase === 3 && id === 'ecosystem') {
    const eco = st.sectors.ecosystem.allocated;
    if (eco >= 12) {
      tutFeedback.style.display = 'block';
      tutFeedback.className = 'tut-feedback success';
      tutFeedback.textContent = '✓ Practicaste pedir 12 gotas adicionales al humedal.';
    } else if (eco < 6) {
      tutFeedback.style.display = 'block';
      tutFeedback.className = 'tut-feedback warn';
      tutFeedback.textContent = `Pedís ${eco} gotas extra. En esta práctica, probá ${st.sectors.ecosystem.currentDemand}.`;
    } else {
      tutFeedback.style.display = 'block';
      tutFeedback.className = 'tut-feedback';
      tutFeedback.textContent = `Pedís ${eco} gotas extra. En esta práctica, probá ${st.sectors.ecosystem.currentDemand}.`;
    }
  } else if (phase === tutorialManager.getTotalPhases()) {
    tutFeedback.style.display = 'block';
    tutFeedback.textContent = `Ciudad: ${st.sectors.population.allocated} / ${st.sectors.population.currentDemand} · Aporte adicional: ${st.sectors.ecosystem.allocated} / ${st.sectors.ecosystem.currentDemand} 💧`;
  }
}

btnTutNext.addEventListener('click', () => {
  if (!canUseControl(btnTutNext)) return;
  const st = engine.getState();
  const check = tutorialManager.canAdvance(st);

  if (!check.allowed) {
    tutFeedback.style.display = 'block';
    tutFeedback.className = 'tut-feedback warn';
    tutFeedback.textContent = check.feedback;
    return;
  }

  tutorialManager.advancePhase();
  setupTutorialPhaseUI();
});

btnSkipTutorial.addEventListener('click', () => {
  if (!canUseControl(btnSkipTutorial)) return;
  exitTutorialToYearOne();
});

btnWelcomeTutorial.addEventListener('click', () => {
  if (!canUseControl(btnWelcomeTutorial)) return;
  startTutorial();
});

document.getElementById('btn-tutorial-toggle')!.addEventListener('click', () => {
  if (backgroundInteractionBlocked()) return;
  closeSectorEditor();
  startTutorial();
});

btnWelcomePlay.addEventListener('click', () => {
  if (!canUseControl(btnWelcomePlay)) return;
  modalWelcome.classList.remove('open');
  exitTutorialToYearOne();
});

// --- ACTUALIZACIÓN PRINCIPAL DE LA INTERFAZ DE USUARIO ---
function updateUI(): void {
  const state = engine.getState();
  const isTutorial = tutorialManager.isActive();
  const seasonInfo = SEASONS_INFO[state.season];

  // 1. Barra Superior y Tracker
  if (isTutorial) {
    const phase = tutorialManager.getCurrentPhase();
    const total = tutorialManager.getTotalPhases();
    yearBadge.textContent = 'Año 0 (Tutorial Guiado)';
    timelineTracker.style.opacity = '0.35';
    seasonalGoalBanner.style.display = 'none';
    seasonBadge.textContent = `${seasonInfo.icon} ${seasonInfo.name} (Fase ${phase}/${total})`;
    seasonBadge.className = `season-badge season-${state.season.toLowerCase()}`;
    btnResolveSeason.textContent = phase === total ? 'Cerrar práctica → Año 1' : '🧭 Seguí la guía ↑';
    btnResolveSeason.disabled = phase !== total;
    btnResolveSeason.style.opacity = phase === total ? '1' : '0.6';
  } else {
    yearBadge.textContent = `Año ${state.year} / ${state.maxYears}`;
    timelineTracker.style.opacity = '1';
    btnResolveSeason.disabled = state.isSeasonResolved || state.isGameOver;
    btnResolveSeason.style.opacity = '1';
    btnResolveSeason.textContent = state.isSeasonResolved ? '✓ Estación completada' : `Confirmar ${seasonInfo.name} →`;
    renderTimelineTracker();
    updateSeasonalGoalDisplay();
    seasonBadge.textContent = `${seasonInfo.icon} ${seasonInfo.name} (T${state.turn}/20)`;
    seasonBadge.className = `season-badge season-${state.season.toLowerCase()}`;
  }

  if (seasonDescBanner) {
    seasonDescBanner.textContent = 'Selecciona un sector en el mapa y ajusta su agua';
  }

  // Clima
  const climateMap: Record<string, { label: string; color: string; icon: string }> = {
    VERY_DRY: { label: 'Muy Seco (Sequía)', color: '#ef4444', icon: '☀️' },
    DRY: { label: 'Seco', color: '#f97316', icon: '🌤️' },
    NORMAL: { label: 'Normal', color: '#10b981', icon: '⛅' },
    WET: { label: 'Lluvioso', color: '#06b6d4', icon: '🌧️' },
    VERY_WET: { label: 'Mucha Lluvia', color: '#3b82f6', icon: '⛈️' }
  };
  const clim = climateMap[state.climateState] || climateMap.NORMAL;
  climateBadge.innerHTML = `${clim.icon} ${clim.label}`;
  climateBadge.title = `ENSO: ${state.ensoState === 'EL_NINO' ? 'El Niño' : state.ensoState === 'LA_NINA' ? 'La Niña' : 'Neutral'}. Tendencia simplificada; no garantiza lluvias locales.`;
  climateBadge.style.background = `${clim.color}22`;
  climateBadge.style.color = clim.color;
  climateBadge.style.borderColor = `${clim.color}66`;
  renderForecast();

  // Estadísticas globales
  if (budgetAnimation === undefined) renderBudget(visibleBudget());
  statTrust.textContent = `${state.publicTrust}%`;
  statHealth.textContent = `${state.basinHealth}%`;
  statQuality.textContent = `${state.waterQuality}/100`;

  // 2. Reservas Naturales (con actualización viva fiel a la simulación y al diorama)
  indSnow.textContent = `${state.snowReserve} 💧`;
  barSnow.style.width = `${Math.min(100, Math.round((state.snowReserve / 100) * 100))}%`;

  const resPercent = Math.round((state.reservoirVolume / state.reservoirCapacity) * 100);
  indRes.textContent = `${resPercent}% (${state.reservoirVolume} 💧)`;
  barRes.style.width = `${Math.min(100, Math.max(0, resPercent))}%`;

  const aquiPercent = Math.round((state.aquiferVolume / state.aquiferCapacity) * 100);
  indAqui.textContent = `${aquiPercent}% (${state.aquiferVolume} 💧)`;
  barAqui.style.width = `${Math.min(100, Math.max(0, aquiPercent))}%`;
  barAqui.style.background =
    state.aquiferStressLevel === 'CRITICAL' ? '#ef4444' : state.aquiferStressLevel === 'STRESSED' ? '#f97316' : '#10b981';

  // 3. Sectores y Sliders
  PLAYABLE_SECTORS.forEach((id) => updateSectorDisplay(id));

  // 4. Balance de asignación
  updateBalanceDisplay();

  // 5. Verificar si hay un evento interactivo pendiente
  if (state.activeInteractiveEvent && !isTutorial) {
    showInteractiveEventModal(state.activeInteractiveEvent);
  }

  // 6. Notificar a Phaser para que refresque su vista Diorama y flujos
  BasinScene.initialDecisionPreview = isTutorial ? undefined : state.isSeasonResolved ? state.seasonHistory.at(-1)!.balance : engine.previewSeason().balance;
  if (BasinScene.instance) {
    BasinScene.instance.updateGameState(state, isTutorial ? undefined : state.isSeasonResolved ? state.seasonHistory.at(-1)!.balance : engine.previewSeason().balance);
  }
  positionMapControls();
  syncInteractionLock();
}

// --- EVENTOS INTERACTIVOS (DILEMAS A/B/C CON PRE-FEEDBACK VISUAL) ---
function showInteractiveEventModal(event: GameEvent): void {
  // Disparar efecto atmosférico previo sobre el diorama
  const evNameLower = (event.name + ' ' + event.description).toLowerCase();
  if (evNameLower.includes('tormenta') || evNameLower.includes('lluvia') || evNameLower.includes('crecida')) {
    BasinScene.instance?.setEventWeatherOverride('STORM');
  } else if (evNameLower.includes('sequía') || evNameLower.includes('ola de calor') || evNameLower.includes('estiaje')) {
    BasinScene.instance?.setEventWeatherOverride('DROUGHT');
  } else if (evNameLower.includes('nieve') || evNameLower.includes('frío') || evNameLower.includes('helada')) {
    BasinScene.instance?.setEventWeatherOverride('BLIZZARD');
  }

  eventModalTitle.textContent = `⚡ Evento: ${event.name}`;
  eventModalDesc.textContent = event.description;

  eventOptionsContainer.innerHTML = '';

  const state = engine.getState();
  const upgMap = engine.getUpgradeSystem().getActiveLevelMap(state.upgrades);
  const options = event.options || [];

  for (const opt of options) {
    const validation = engine.canChooseEventOption(opt.id);
    let isAllowed = validation.allowed;
    let prereqMsg = validation.reason ?? '';

    if (opt.requiresUpgrade) {
      const currentLvl = upgMap[opt.requiresUpgrade] || 0;
      if (currentLvl < 1) {
        isAllowed = false;
        const upgDef = engine.getUpgradeSystem().getUpgrade(opt.requiresUpgrade);
        prereqMsg = `🔒 Requiere obra: ${upgDef?.name || opt.requiresUpgrade}`;
      }
    }

    const projectCost = opt.projectUpgradeId
      ? engine.getUpgradeSystem().canPurchase(opt.projectUpgradeId, state.upgrades, state.money).cost : 0;
    const moneyCost = projectCost || (opt.effects.moneyDelta && opt.effects.moneyDelta < 0 ? Math.abs(opt.effects.moneyDelta) : 0);
    if (moneyCost > 0 && moneyCost > state.money) {
      isAllowed = false;
      prereqMsg = `💰 Fondos insuficientes (Tienes $${state.money}, cuesta $${moneyCost})`;
    }

    const card = document.createElement('button');
    card.type = 'button';
    card.disabled = !isAllowed;
    card.className = `event-option-card ${!isAllowed ? 'disabled' : ''}`;

    const costLabel = moneyCost > 0 ? `Costo: $${moneyCost}` : 'Sin costo directo';

    const resourceCosts: string[] = [];
    if ((opt.effects.reservoirDelta ?? 0) < 0) resourceCosts.push(`Usa ${Math.abs(opt.effects.reservoirDelta!)} gotas del embalse, fuera del reparto`);
    if ((opt.effects.aquiferDelta ?? 0) < 0) resourceCosts.push(`Usa ${Math.abs(opt.effects.aquiferDelta!)} gotas del acuífero, fuera del reparto`);

    card.innerHTML = `
      <span class="event-opt-header">
        <span class="event-opt-title">${opt.label}</span>
        <span class="event-opt-cost">${costLabel}</span>
      </span>
      <span class="event-opt-desc">${opt.description}</span>
      ${resourceCosts.length ? `<span class="event-opt-impact">${resourceCosts.join(' · ')}</span>` : ''}
      ${!isAllowed ? `<span class="event-opt-prereq">${prereqMsg}</span>` : ''}
    `;

    if (isAllowed) {
      card.addEventListener('click', () => {
        if (!canUseControl(card) || engine.getState().activeInteractiveEvent?.id !== event.id) return;
        const state = engine.getState();
        const eventId = state.activeInteractiveEvent?.id;
        const turn = state.turn;
        if (eventId && engine.canChooseEventOption(opt.id).allowed) sessionLog?.captureAllocations(state);
        engine.chooseEventOption(opt.id);
        if (!state.activeInteractiveEvent) {
          const project = state.currentSeasonEvents.at(-1)?.project;
          const definition = project && engine.getUpgradeSystem().getUpgrade(project.upgradeId);
          if (definition) pendingUpgradeConstruction.add(definition.visualTag);
        }
        if (eventId && !state.activeInteractiveEvent) {
          sessionLog?.record({ type: 'event-choice', turn, eventId, optionId: opt.id });
          saveRecovery();
        }
        BasinScene.instance?.setEventWeatherOverride(undefined);
        modalInteractiveEvent.classList.remove('open');
        if (engine.getState().scenarioId === 'cuenca_central' && engine.getState().turn > 1
          && !tutorialManager.isActive()) prepareTurnStartingDistribution();
        updateUI();
        playPendingUpgradeConstruction();
      });
    }

    eventOptionsContainer.appendChild(card);
  }

  modalInteractiveEvent.classList.add('open');
}

// --- RESOLUCIÓN ESTACIONAL Y FEEDBACK ÁGIL ---
btnResolveSeason.addEventListener('click', () => {
  if (!canUseControl(btnResolveSeason)) return;
  sound.pop();
  const st = engine.getState();
  if (tutorialManager.isActive()) {
    if (tutorialManager.getCurrentPhase() === tutorialManager.getTotalPhases()) {
      confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
      exitTutorialToYearOne();
    }
    return;
  }
  if (st.isSeasonResolved || st.isGameOver) return;
  if (st.activeInteractiveEvent) {
    showInteractiveEventModal(st.activeInteractiveEvent);
    return;
  }

  // La recompensa se calcula en el motor una vez conocidos los resultados.
  const currentGoal = getCurrentSeasonalGoal();

  sessionLog?.captureAllocations(st);
  const impactBaseline = { trust: st.publicTrust, health: st.basinHealth };
  const seasonResult = engine.resolveSeason();
  budgetPresentations.set(engine, {
    season: seasonResult.goalAchieved ? currentGoal?.reward.moneyBonus ?? 0 : 0,
    annual: st.isYearEndPhase ? st.yearHistory.at(-1)?.budgetEarned ?? 0 : 0,
  });
  resolvedImpact = { result: seasonResult,
    trust: st.publicTrust - impactBaseline.trust, health: st.basinHealth - impactBaseline.health };
  sessionLog?.record({ type: 'resolve', turn: st.turn });
  saveRecovery();

  closeDistributionTip();
  // Preparar el resumen y el periódico de esta estación
  cancelPendingNewspaper();
  closeSectorEditor();
  renderAgileSeasonFeedback(seasonResult, currentGoal, seasonResult.goalAchieved);
  updateUI();
  pendingNewspaperEdition = lastNewspaperEdition;
  openPendingNewspaper();
});

function renderSeasonWaterSummary(res: SeasonResult): void {
  const b = res.balance;
  // Los balances resueltos cuentan gotas enteras: no abreviar ni redondear
  // cada término por separado, para que la suma visible siga cerrando.
  const drops = (value: number) => value.toLocaleString('es-AR');
  fbWaterSummary.replaceChildren();
  const waterDetails = document.getElementById('fb-water-details') as HTMLDetailsElement | null;
  if (waterDetails) waterDetails.open = false;
  const eventRecap = document.getElementById('fb-event-recap');
  if (eventRecap) {
    eventRecap.replaceChildren();
    const chosen = res.events.find(record => record.chosenOptionId);
    const scene = chosen && getEventRecap(chosen, res.turn);
    eventRecap.hidden = !scene;
    if (scene) {
      const headline = document.createElement('strong');
      headline.textContent = scene.headline;
      const decision = document.createElement('span');
      decision.textContent = scene.decision;
      eventRecap.append(headline, decision);
    }
  }
  const brief = document.getElementById('fb-reserves-brief');
  const change = (value: number) => `${value >= 0 ? '+' : '−'}${drops(Math.abs(value))}`;
  if (brief) brief.textContent = `Reservas al cierre: embalse ${drops(b.reservoirEnd)} (${change(b.reservoirEnd - b.reservoirStart)}) · acuífero ${drops(b.aquiferEnd)} (${change(b.aquiferEnd - b.aquiferStart)}) 💧`;
  const coverage = document.getElementById('fb-sector-coverage');
  if (coverage) {
    coverage.replaceChildren();
    const label = document.createElement('span');
    label.textContent = 'Cobertura:';
    coverage.append(label);
    for (const [id, name] of [
      ['population', 'Ciudad'], ['agriculture', 'Cultivos'], ['livestock', 'Granja'],
      ['mining', 'Mina'], ['ecosystem', 'Caudal ecológico']
    ] as const) {
      const item = document.createElement('span');
      const value = document.createElement('strong');
      value.textContent = `${Math.round(b.satisfactions[id] * 100)}%`;
      item.append(`${name} `, value);
      coverage.append(item);
    }
  }

  const sources = document.createElement('p');
  sources.className = 'fb-water-line';
  sources.textContent = `Para abastecer: río ${drops(b.directRiverIntake)} · embalse ${drops(b.reservoirWithdrawal)} · pozos ${drops(b.aquiferWithdrawal)} gotas.`;
  fbWaterSummary.append(sources);

  for (const record of res.events) {
    const option = record.event.options?.find(item => item.id === record.chosenOptionId);
    const fx = record.appliedEffects;
    const nominal = option?.effects;
    const passive = record.event.effects;
    const signed = (value: number) => `${value > 0 ? '+' : value < 0 ? '−' : ''}${drops(Math.abs(value))}`;
    const changes: string[] = [];
    if (fx) {
      if (fx.moneyDelta || nominal?.moneyDelta || passive?.moneyBonus || passive?.moneyPenalty) changes.push(`presupuesto ${signed(fx.moneyDelta)}`);
      if (fx.trustDelta || nominal?.trustDelta || passive?.trustBonus || passive?.trustPenalty) changes.push(`confianza ${signed(fx.trustDelta)} puntos`);
      if (fx.basinHealthDelta || nominal?.basinHealthDelta || passive?.basinHealthBonus || passive?.basinHealthPenalty) changes.push(`salud de cuenca ${signed(fx.basinHealthDelta)} puntos`);
      if (fx.waterQualityDelta || nominal?.waterQualityDelta || passive?.waterQualityPenalty) changes.push(`calidad ${signed(fx.waterQualityDelta)} puntos`);
    }
    const adjustment = record.waterAdjustment;
    if (adjustment) {
      if (adjustment.reservoirChange || nominal?.reservoirDelta) changes.push(`embalse ${signed(adjustment.reservoirChange)} gotas`);
      if (adjustment.aquiferChange || nominal?.aquiferDelta) changes.push(`acuífero ${signed(adjustment.aquiferChange)} gotas`);
    }
    const eventLine = document.createElement('p');
    eventLine.className = 'fb-water-event';
    eventLine.textContent = `${record.event.name}${option ? ` · Elegiste «${option.label}»` : ''}: ${changes.join(' · ') || 'sin cambios directos registrados'}.${adjustment && (nominal?.reservoirDelta || nominal?.aquiferDelta) ? ' El agua se ajustó antes del reparto y ya está incluida en Inicio.' : ''}`;
    if (record.outcome) {
      const context = record.outcome;
      eventLine.textContent += ` Recepción ${context.kind === 'difficult' ? 'con dificultades' : context.kind === 'favorable' ? 'favorable' : 'habitual'}: red nivel ${context.networkLevel}, reservas ${context.reserveRatio < .2 ? 'bajas' : context.reserveRatio >= .5 ? 'holgadas' : 'intermedias'}, clima ${context.dry ? 'seco' : 'sin sequía'}. Simplificación del juego, con variación entre partidas.`;
    }
    if (record.project) {
      const name = engine.getUpgradeSystem().getUpgrade(record.project.upgradeId)?.name ?? record.project.upgradeId;
      eventLine.textContent += ` Obra permanente: ${name}, nivel ${record.project.level}; su eficiencia sigue activa en las próximas estaciones.`;
    }
    fbWaterSummary.append(eventLine);
  }

  const reserves = document.createElement('div');
  reserves.className = 'fb-water-reserves';
  const addReserve = (name: string, start: number, end: number, movements: [string, number, 'in' | 'out'][]) => {
    const block = document.createElement('details');
    block.className = 'fb-water-reserve';
    block.open = true;
    const heading = document.createElement('summary');
    const title = document.createElement('strong');
    title.textContent = name;
    const change = document.createElement('span');
    change.className = 'fb-water-change';
    change.textContent = `${end >= start ? '+' : '−'}${drops(Math.abs(end - start))} 💧`;
    heading.append(title, change);
    const flow = document.createElement('div');
    flow.className = 'fb-water-flow';
    const addTerm = (label: string, value: number, kind: string, sign: string) => {
      const term = document.createElement('div');
      term.className = `fb-water-term fb-water-${kind}`;
      const amount = document.createElement('strong');
      amount.textContent = `${sign}${drops(value)}`;
      const caption = document.createElement('span');
      caption.textContent = label;
      term.append(amount, caption);
      flow.append(term);
    };
    addTerm('Inicio', start, 'bookend', '');
    for (const [label, value, direction] of movements) addTerm(label, value, direction, direction === 'in' ? '+' : '−');
    addTerm('Final', end, 'bookend', '= ');
    block.append(heading, flow);
    reserves.append(block);
  };
  addReserve('Embalse', b.reservoirStart, b.reservoirEnd, [
    ['Entra del río', b.reservoirInflow, 'in'],
    ['Se usó para abastecer', b.reservoirWithdrawal, 'out'],
    ...(b.reservoirEvaporation ? [['Evaporó', b.reservoirEvaporation, 'out'] as [string, number, 'out']] : []),
    ...(b.reservoirSpill ? [['Derramó al río', b.reservoirSpill, 'out'] as [string, number, 'out']] : [])
  ]);
  addReserve('Agua bajo tierra', b.aquiferStart, b.aquiferEnd, [
    ['Entró de lluvia infiltrada', b.aquiferNaturalRecharge, 'in'],
    ...(b.aquiferRiverRecharge ? [['Se infiltró del río', b.aquiferRiverRecharge, 'in'] as [string, number, 'in']] : []),
    ...(b.aquiferArtificialRecharge ? [['Escorrentía llevada por la obra', b.aquiferArtificialRecharge, 'in'] as [string, number, 'in']] : []),
    ['Bombeo de pozos', b.aquiferWithdrawal, 'out'],
    ...(b.aquiferOverflow ? [['Rebosó al río', b.aquiferOverflow, 'out'] as [string, number, 'out']] : [])
  ]);
  fbWaterSummary.append(reserves);

  const returns = Object.values(b.returns).reduce((total, value) => total + value, 0);
  if (b.downstreamFlow || returns) {
    const river = document.createElement('p');
    river.className = 'fb-water-line';
    river.textContent = `Siguieron aguas abajo ${drops(b.downstreamFlow)} gotas${returns ? `; incluyen ${drops(returns)} que volvieron al río tras usarse` : '; no hubo retornos tras el uso'}.`;
    fbWaterSummary.append(river);
  }

  // Sólo efectos observados en el balance resuelto. La demanda no guarda
  // un ahorro separado por obra: no reconstruir comparaciones hipotéticas.
  const upgrades = engine.getState().upgrades;
  const workMessages: [string, string][] = [];
  if (b.aquiferArtificialRecharge > 0) {
    workMessages.push(['Recarga Gestionada', `¡La obra llevó ${drops(b.aquiferArtificialRecharge)} gotas de la lluvia al agua bajo tierra!`]);
  }
  if ((upgrades.planta_saneamiento?.currentLevel ?? 0) > 0 && b.returns.population > 0) {
    workMessages.push(['Saneamiento y Reúso', `¡La planta trató el agua que volvió de la ciudad! Calidad del retorno: ${drops(b.returnQualities.population)}/100.`]);
  }
  if ((upgrades.recirculacion_minera?.currentLevel ?? 0) >= 3 &&
      b.suppliedAllocations.mining > 0 && b.returns.mining === 0) {
    workMessages.push(['Recirculación minera', '¡El circuito cerrado funcionó! La mina recibió agua y no vertió gotas al río este turno.']);
  }
  if (workMessages.length) {
    const works = document.createElement('section');
    works.className = 'fb-water-works';
    const heading = document.createElement('h4');
    heading.textContent = 'Tus obras este turno';
    works.append(heading);
    for (const [name, message] of workMessages.slice(0, 2)) {
      const chip = document.createElement('p');
      chip.className = 'fb-water-work';
      const title = document.createElement('strong');
      title.textContent = name;
      const detail = document.createElement('span');
      detail.textContent = message;
      chip.append(title, detail);
      works.append(chip);
    }
    fbWaterSummary.append(works);
  }
}

function renderAgileSeasonFeedback(
  res: SeasonResult,
  goal: SeasonalGoal | undefined,
  goalSuccess: boolean
): void {
  const st = engine.getState();
  const seasonInfo = SEASONS_INFO[res.season];

  // Generar la edición de "El Heraldo del Valle"
  const previousResult = st.seasonHistory.at(-2);
  const verdict = getSeasonVerdict(res, previousResult);
  lastNewspaperEdition = generateNewspaperEdition(res, previousResult, verdict, st.seasonHistory, st.seed);
  if (btnOpenNewspaper) btnOpenNewspaper.style.display = '';

  fbSeasonTitle.textContent = `${seasonInfo.name} ${res.season === 'SPRING' ? 'completada' : 'completado'} · Año ${res.year}`;

  if (goal && goalSuccess) {
    fbGoalBadge.style.display = 'inline-block';
    fbGoalBadge.style.background = 'rgba(52, 211, 153, 0.2)';
    fbGoalBadge.style.borderColor = '#10b981';
    fbGoalBadge.style.color = '#34d399';
    fbGoalBadge.textContent = `🎯 ¡Desafío Cumplido! +$${goal.reward.moneyBonus} 💰`;
  } else if (goal && !goalSuccess) {
    fbGoalBadge.style.display = 'inline-block';
    fbGoalBadge.style.background = 'rgba(239, 68, 68, 0.2)';
    fbGoalBadge.style.borderColor = '#ef4444';
    fbGoalBadge.style.color = '#f87171';
    fbGoalBadge.textContent = '🎯 Desafío no alcanzado';
  } else {
    fbGoalBadge.style.display = 'none';
  }

  renderSeasonWaterSummary(res);
  fbBudgetReceipt.hidden = true;
  cardSeasonFeedback.querySelector('[data-investment-notice]')?.remove();
  const impact = document.getElementById('fb-sector-impact')!;
  impact.replaceChildren();
  impact.hidden = resolvedImpact?.result !== res;
  if (!impact.hidden && resolvedImpact) {
    const caption = document.createElement('div');
    caption.className = 'fb-impact-caption';
    caption.textContent = 'Efectos del reparto y desafío';
    impact.appendChild(caption);
    for (const [label, delta] of [['Confianza', resolvedImpact.trust], ['Salud de cuenca', resolvedImpact.health]] as const) {
      const chip = document.createElement('span');
      chip.dataset.tone = delta > 0 ? 'gain' : delta < 0 ? 'loss' : 'steady';
      chip.textContent = `${label}: ${delta === 0 ? 'sin cambio' : `${delta > 0 ? '+' : ''}${delta} ${Math.abs(delta) === 1 ? 'punto' : 'puntos'}`}`;
      chip.title = 'Cambio al resolver el reparto, incluida la recompensa del desafío. Los eventos previos ya estaban aplicados. Puede combinar varios sectores, reservas, calidad y obras; los topes limitan el cambio.';
      impact.appendChild(chip);
    }
  }

  const popSat = Math.round(res.balance.satisfactions.population * 100);
  fbPop.textContent = `${popSat}%`;
  fbPop.style.color = popSat >= 80 ? '#60a5fa' : '#f87171';

  const agriSat = Math.round(res.balance.satisfactions.agriculture * 100);
  fbAgri.textContent = `${agriSat}%`;
  fbAgri.style.color = agriSat >= 80 ? '#34d399' : '#f87171';

  fbHealth.textContent = `${st.basinHealth}%`;
  fbMoney.textContent = `$${st.money}`;

  fbAdviceText.className = `fb-advice fb-verdict-${verdict.kind}`;
  const verdictLabel = document.createElement('strong');
  verdictLabel.textContent = `${verdict.label}:`;
  const focusNames = { population: 'Ciudad', ecosystem: 'Río Vivo', waterQuality: 'la calidad del agua',
    basinHealth: 'la salud del río', reservoir: 'el embalse', agriculture: 'Cultivos', livestock: 'Granja', mining: 'Mina' };
  let consequence = verdict.kind === 'crisis' || verdict.kind === 'error'
    ? `Priorizá ${verdict.focus ? focusNames[verdict.focus] : 'el frente en alerta'} en la próxima estación.`
    : verdict.kind === 'tradeoff' ? 'La reserva sostuvo el abastecimiento; cuidala para la próxima estación.'
      : verdict.kind === 'recovery' ? 'Mejoró un frente que necesitaba atención.'
        : verdict.kind === 'good' ? 'El reparto acompañó a todos los sectores.'
          : 'La próxima estación puede necesitar otro reparto.';
  if (verdict.pendingSector) {
    const id = verdict.pendingSector;
    const b = res.balance;
    consequence += b.allocations[id] === 0 ? ` ${focusNames[id]} quedó sin pedido.`
      : b.suppliedAllocations[id] < b.allocations[id] ? ` A ${focusNames[id]} no le llegó todo lo pedido.`
        : ` ${focusNames[id]} necesita un pedido mayor para cubrir su demanda.`;
  }
  fbAdviceText.replaceChildren(verdictLabel, ` ${consequence}`);
  if (goal && !goalSuccess) {
    const progress = goalProgress(goal, res.balance);
    if (progress) fbAdviceText.append(` Desafío: ${progress}.`);
    if (goal.targetCondition.type === 'CITY_AND_SECTOR') fbAdviceText.append(` ${goal.hint}`);
  }
  const explanation = document.createElement('p');
  explanation.className = 'fb-water-line';
  explanation.textContent = verdict.message;
  fbWaterSummary.append(explanation);

  if (st.isYearEndPhase) {
    btnFbContinue.textContent = '📊 Ir al Cierre de Año e Inversiones ➡️';
  } else {
    const nextS = getNextSeason(res.season).nextSeason;
    btnFbContinue.textContent = `Pasar a ${SEASONS_INFO[nextS].name} ${SEASONS_INFO[nextS].icon} ➡️`;
  }

  // Preparar el resumen breve sin abrirlo: primero el diario y el valle.
  cardSeasonFeedback.classList.remove('open');
  cardSeasonFeedback.inert = true;
}

// Modal de El Heraldo del Valle
function showNewspaperModal(edition: NewspaperEdition | null): void {
  const state = engine.getState();
  if (!modalNewspaper || !edition || modalNewspaper.classList.contains('open') ||
      tutorialManager.isActive() || !state.isSeasonResolved || edition.editionNumber !== state.turn) return;
  openedNewspaperEdition = edition;
  sound.paperRustle();
  if (newsDate) newsDate.textContent = edition.dateString;
  if (newsMainHeadline) newsMainHeadline.textContent = edition.mainArticle.headline;
  if (newsMainSubhead) newsMainSubhead.textContent = edition.mainArticle.subhead;
  if (newsPhotoEmoji) newsPhotoEmoji.textContent = edition.mainArticle.photoEmoji;
  if (newsPhotoCaption) newsPhotoCaption.textContent = edition.label;
  if (modalNewspaper) modalNewspaper.dataset.verdict = edition.kind;
  const briefs = modalNewspaper?.querySelector<HTMLElement>('.newspaper-columns-grid');
  if (briefs) {
    briefs.replaceChildren();
    briefs.hidden = edition.secondaryArticles.length === 0;
    briefs.setAttribute('aria-label', 'Noticias breves de la estación');
    for (const article of edition.secondaryArticles) {
      const card = document.createElement('article');
      card.className = 'newspaper-col-card';
      const headline = document.createElement('h3');
      headline.className = 'col-title';
      headline.textContent = article.headline;
      const body = document.createElement('p');
      body.textContent = article.subhead;
      card.append(headline, body);
      briefs.append(card);
    }
  }
  const newsPriceEl = document.getElementById('news-price');
  if (newsPriceEl) newsPriceEl.textContent = edition.price;

  if (btnNewsContinue) {
    btnNewsContinue.textContent = 'Ver el valle';
  }

  cardSeasonFeedback.classList.remove('open');
  cardSeasonFeedback.inert = true;
  modalNewspaper.classList.add('open');
  btnNewsContinue?.focus();
}

btnOpenNewspaper?.addEventListener('click', () => {
  if (!canUseControl(btnOpenNewspaper) || !cardSeasonFeedback.classList.contains('open')) return;
  showNewspaperModal(lastNewspaperEdition);
});

btnViewValley.addEventListener('click', () => {
  if (!canUseControl(btnViewValley) || !cardSeasonFeedback.classList.contains('open') || !engine.getState().isSeasonResolved) return;
  showValleyInspection();
});

function showValleyInspection(): void {
  cardSeasonFeedback.classList.remove('open');
  cardSeasonFeedback.inert = true;
  BasinScene.instance?.replayResultReactions();
  valleyResults.replaceChildren();
  for (const result of BasinScene.instance?.getResultReactionCards() ?? []) {
    const card = document.createElement('details');
    card.dataset.sector = result.sector;
    card.open = true;
    const title = document.createElement('summary');
    title.textContent = result.title;
    const text = document.createElement('p');
    text.textContent = result.text;
    card.append(title, text);
    valleyResults.appendChild(card);
  }
  btnToggleValleyResults.textContent = 'Colapsar todos';
  valleyInspectionControls.hidden = false;
  valleyResultsPanel.hidden = false;
  btnResolveSeason.hidden = true;
  btnReturnSummary.hidden = false;
  positionValleyResultCards();
  btnReturnSummary.focus();
}
const btnReturnSummary = document.createElement('button');
btnReturnSummary.type = 'button';
btnReturnSummary.id = 'btn-return-summary';
btnReturnSummary.className = 'btn-huge-action';
btnReturnSummary.textContent = 'Ver resumen';
btnReturnSummary.hidden = true;
const valleyInspectionControls = document.createElement('div');
valleyInspectionControls.id = 'valley-inspection-controls';
valleyInspectionControls.hidden = true;
const valleyResultsPanel = document.createElement('section');
valleyResultsPanel.className = 'valley-results-panel';
valleyResultsPanel.hidden = true;
valleyResultsPanel.setAttribute('aria-label', 'Resultados del último reparto en el valle');
const valleyResultsHeading = document.createElement('strong');
valleyResultsHeading.textContent = 'Así respondió el valle · tocá un sector para colapsarlo';
valleyResultsHeading.hidden = true;
const btnToggleValleyResults = document.createElement('button');
btnToggleValleyResults.type = 'button';
btnToggleValleyResults.className = 'btn-tool-action';
btnToggleValleyResults.textContent = 'Colapsar todos';
const valleyResults = document.createElement('div');
valleyResults.className = 'valley-result-cards';
valleyResultsPanel.append(valleyResultsHeading, btnToggleValleyResults, valleyResults);
valleyInspectionControls.append(valleyResultsPanel, btnReturnSummary);
btnResolveSeason.parentElement!.appendChild(valleyInspectionControls);
btnToggleValleyResults.addEventListener('click', () => {
  if (!canUseControl(btnToggleValleyResults) || !engine.getState().isSeasonResolved) return;
  const cards = Array.from(valleyResults.querySelectorAll('details'));
  const expand = !cards.some(card => card.open);
  cards.forEach(card => { card.open = expand; });
  btnToggleValleyResults.textContent = expand ? 'Colapsar todos' : 'Expandir todos';
});
valleyResults.addEventListener('toggle', () => {
  btnToggleValleyResults.textContent = Array.from(valleyResults.querySelectorAll('details')).some(card => card.open)
    ? 'Colapsar todos' : 'Expandir todos';
  positionValleyResultCards();
}, true);

function positionValleyResultCards(): void {
  if (typeof valleyResultsPanel === 'undefined' || valleyResultsPanel.hidden) return;
  const scene = BasinScene.instance;
  const canvas = document.querySelector('#game-container canvas');
  if (!scene || !canvas) return;
  const rect = canvas.getBoundingClientRect(), layout = scene.getMapLayout();
  const scaleX = rect.width / layout.width, scaleY = rect.height / scene.scale.height;
  const compact = rect.width <= 640;
  valleyResultsPanel.style.setProperty('--valley-toggle-top', `${seasonalGoalBanner.getBoundingClientRect().bottom + 8}px`);
  const width = compact ? Math.floor(rect.width * .44) : Math.min(240, Math.floor(rect.width * .23));
  const top = rect.top + layout.top * scaleY + (compact ? 8 : 90);
  const bottom = Math.min(rect.top + (layout.top + layout.height) * scaleY,
    document.querySelector('.allocation-panel')!.getBoundingClientRect().top) - 8;
  for (const group of [['mining', 'agriculture', 'livestock'], ['population', 'ecosystem']] as const) {
    const positions: { card: HTMLDetailsElement; y: number }[] = [];
    let previousBottom = top - 8;
    for (const id of group) {
      const card = valleyResults.querySelector<HTMLDetailsElement>(`[data-sector="${id}"]`);
      if (!card) continue;
      const anchor = scene.getMapAnchor(id);
      card.style.width = `${width}px`;
      card.style.maxHeight = `${Math.max(65, Math.min(150, (bottom - top - 16) / group.length))}px`;
      const x = group[0] === 'mining'
        ? compact ? rect.width - width - 8 : rect.width - width - 16
        : compact ? 8 : id === 'population' ? 16 : Math.max(8, anchor.x * scaleX - width - 90);
      card.style.left = `${rect.left + x}px`;
      const y = Math.max(previousBottom + 8, rect.top + anchor.y * scaleY - card.offsetHeight / 2);
      positions.push({ card, y });
      previousBottom = y + card.offsetHeight;
    }
    // Mantener cada columna en el mapa y separar tarjetas de sectores cercanos.
    const shift = Math.max(0, previousBottom - bottom);
    positions.forEach(({ card, y }) => { card.style.top = `${Math.max(top, y - shift)}px`; });
  }
}
function openSeasonSummary(): void {
  btnReturnSummary.hidden = true;
  valleyResultsPanel.hidden = true;
  valleyInspectionControls.hidden = true;
  btnResolveSeason.hidden = false;
  cardSeasonFeedback.inert = false;
  cardSeasonFeedback.classList.add('open');
  revealBudget('season');
  // El observer debe liberar la tarjeta antes de enfocar su botón.
  requestAnimationFrame(() => { if (canUseControl(btnFbContinue)) btnFbContinue.focus(); });
}
btnReturnSummary.addEventListener('click', () => {
  if (!canUseControl(btnReturnSummary) || !engine.getState().isSeasonResolved || btnReturnSummary.hidden) return;
  openSeasonSummary();
});

function closeNewspaperToSummary(): void {
  const st = engine.getState();
  if (!modalNewspaper?.classList.contains('open') || tutorialManager.isActive()
      || !st.isSeasonResolved || openedNewspaperEdition !== lastNewspaperEdition
      || openedNewspaperEdition?.editionNumber !== st.turn) return;
  cancelPendingNewspaper();
  modalNewspaper?.classList.remove('open');
  cardSeasonFeedback.classList.remove('water-replay-active');
  showValleyInspection();
}

const btnNewsContinue = document.getElementById('btn-news-continue') as HTMLButtonElement | null;
btnNewsContinue?.addEventListener('click', () => {
  if (!canUseControl(btnNewsContinue)) return;
  sound.pop();
  closeNewspaperToSummary();
});

btnFbContinue.addEventListener('click', () => {
  if (!canUseControl(btnFbContinue)) return;
  if (!cardSeasonFeedback.classList.contains('open') || cardSeasonFeedback.inert) return;
  continueResolvedSeason();
});

function continueResolvedSeason(): void {
  const st = engine.getState();
  if (tutorialManager.isActive() || !st.isSeasonResolved || st.activeInteractiveEvent) return;
  sound.pop();
  cancelPendingNewspaper();
  modalNewspaper?.classList.remove('open');
  cardSeasonFeedback.classList.remove('open');
  btnReturnSummary.hidden = true;
  valleyResultsPanel.hidden = true;
  valleyInspectionControls.hidden = true;
  btnResolveSeason.hidden = false;

  if (st.isYearEndPhase) {
    showYearEndModal();
  } else {
    advanceRecordedTurn();
    prepareTurnStartingDistribution();
    updateUI();
  }
}

// --- MODAL: CIERRE DE AÑO (CONSOLIDACIÓN TRAS EL OTOÑO) ---
function showYearEndModal(): void {
  const st = engine.getState();
  const latestYearResult = st.yearHistory[st.yearHistory.length - 1];

  yearendTitle.textContent = `📅 Cierre del Año ${latestYearResult.year} de ${st.maxYears}`;

  yearendPop.textContent = `${Math.round(latestYearResult.avgPopSatisfaction * 100)}%`;
  yearendAgri.textContent = `${Math.round(latestYearResult.avgAgriSatisfaction * 100)}%`;
  yearendLivestock.textContent = `${Math.round(latestYearResult.avgLivestockSatisfaction * 100)}%`;
  yearendMin.textContent = `${Math.round(latestYearResult.avgMinSatisfaction * 100)}%`;
  yearendEco.textContent = `${Math.round(latestYearResult.avgEcoSatisfaction * 100)}%`;

  // Desglose de ingresos
  const popInc = Math.round(latestYearResult.avgPopSatisfaction * 30);
  const agriInc = Math.round(latestYearResult.avgAgriSatisfaction * 40);
  const livestockInc = Math.round(latestYearResult.avgLivestockSatisfaction * 10);
  const minInc = Math.round(latestYearResult.avgMinSatisfaction * 35);
  const ecoBonus = latestYearResult.avgEcoSatisfaction >= 0.85 ? 15 : 0;
  const trustBonus = latestYearResult.publicTrust >= 80 ? 15 : 0;
  const maint = 25;
  const minimumBudgetContribution = Math.max(0, latestYearResult.budgetEarned
    - (popInc + agriInc + livestockInc + minInc + ecoBonus + trustBonus - maint));

  yearendBreakdown.innerHTML = `
    <div class="year-breakdown-item"><span>Recaudación urbana:</span><strong>+$${popInc}</strong></div>
    <div class="year-breakdown-item"><span>Aporte de Cultivos:</span><strong>+$${agriInc}</strong></div>
    <div class="year-breakdown-item"><span>Actividad de Granja:</span><strong>+$${livestockInc}</strong></div>
    <div class="year-breakdown-item"><span>Regalías mineras:</span><strong>+$${minInc}</strong></div>
    <div class="year-breakdown-item"><span>Bono ecológico:</span><strong>+$${ecoBonus}</strong></div>
    <div class="year-breakdown-item"><span>Bono confianza ciudadana:</span><strong>+$${trustBonus}</strong></div>
    <div class="year-breakdown-item"><span style="color: #f87171;">Mantenimiento de red:</span><strong style="color: #f87171;">-$${maint}</strong></div>
    ${minimumBudgetContribution > 0 ? `<div class="year-breakdown-item"><span>Aporte para presupuesto mínimo:</span><strong>+$${minimumBudgetContribution}</strong></div>` : ''}
    <div class="year-breakdown-item" style="grid-column: span 2; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 6px; font-weight: 800; color: #fbbf24;">
      <span>Presupuesto neto ganado:</span><span data-budget-total>+$${latestYearResult.budgetEarned} (Total actual: $${st.money})</span>
    </div>
  `;

  if (st.isGameOver) {
    btnYearendContinue.textContent = '🏆 Ver Resultados Finales de la Partida';
  } else {
    btnYearendContinue.textContent = `❄️ Comenzar Año ${st.year + 1}: Invierno ➡️`;
  }

  modalYearEnd.classList.add('open');
  revealBudget('annual');
}

btnYearendUpgrades.addEventListener('click', () => {
  if (!canUseControl(btnYearendUpgrades)) return;
  sound.pop();
  renderUpgradesList();
  modalUpgrades.classList.add('open');
});

btnYearendContinue.addEventListener('click', () => {
  if (!canUseControl(btnYearendContinue)) return;
  if (!modalYearEnd.classList.contains('open') || tutorialManager.isActive()
      || !engine.getState().isYearEndPhase) return;
  sound.pop();
  modalYearEnd.classList.remove('open');
  playPendingUpgradeConstruction();
  const st = engine.getState();

  if (st.isGameOver) {
    showFinalReport();
  } else {
    advanceRecordedTurn();
    prepareTurnStartingDistribution();
    updateUI();
  }
});

// --- INFORME FINAL (5 AÑOS = 20 TURNOS COMPLETADOS) ---
function showFinalReport(): void {
  const st = engine.getState();
  const yearHistory = st.yearHistory;

  const history = st.seasonHistory;
  const mean = (id: SectorId) => Math.round(history.reduce((sum, r) => sum + r.balance.satisfactions[id], 0) / Math.max(1, history.length) * 100);
  const avgPop = mean('population');
  const avgAgri = mean('agriculture');
  const avgMin = mean('mining');
  const avgEco = mean('ecosystem');
  document.getElementById('fin-period-note')!.textContent = `Coberturas: medias de las ${history.length} estaciones registradas. Confianza, salud, calidad y reservas: al cierre.`;

  document.getElementById('fin-pop')!.textContent = `${avgPop}%`;
  document.getElementById('fin-agri')!.textContent = `${avgAgri}%`;
  document.getElementById('fin-min')!.textContent = `${avgMin}%`;
  document.getElementById('fin-eco')!.textContent = `${avgEco}%`;
  document.getElementById('fin-aqui')!.textContent =
    `${st.aquiferVolume}/${st.aquiferCapacity} 💧 · ${ { HEALTHY: 'Saludable', ATTENTION: 'Atención', STRESSED: 'En estrés', CRITICAL: 'Crítico' }[st.aquiferStressLevel] }`;
  document.getElementById('fin-trust')!.textContent = `${st.publicTrust}%`;
  document.getElementById('fin-seed')!.textContent = st.seed;
  document.getElementById('fin-scenario')!.textContent = st.scenarioName;
  document.getElementById('fin-version')!.textContent = engine.getModelVersion();
  const avgLive = Math.round(history.reduce((sum, r) => sum + r.balance.satisfactions.livestock, 0) / Math.max(1, history.length) * 100);
  document.getElementById('fin-live')!.textContent = `${avgLive}%`;
  document.getElementById('fin-quality')!.textContent = `${st.waterQuality}/100`;
  document.getElementById('fin-health')!.textContent = `${st.basinHealth}%`;
  document.getElementById('fin-reservoir')!.textContent = `${st.reservoirVolume}/${st.reservoirCapacity} 💧`;
  document.getElementById('fin-snow')!.textContent = `${st.snowReserve} 💧`;
  document.getElementById('fin-money')!.textContent = `$${st.money}`;
  const dryTurns = history.filter(r => PLAYABLE_SECTORS.some(id => id !== 'ecosystem' && r.balance.satisfactions[id] < 1)).length;
  const ecoTurns = history.filter(r => r.balance.satisfactions.ecosystem >= 1).length;
  const earned = yearHistory.reduce((sum, year) => sum + year.budgetEarned, 0);
  const works = Object.values(st.upgrades).filter(u => u.currentLevel > 0)
    .map(u => `${engine.getUpgradeSystem().getUpgrade(u.id)?.name ?? u.id} (N${u.currentLevel})`);
  // Sólo lectura: seleccionar momentos y comparar flujos ya registrados.
  const last = history.at(-1);
  const first = history[0];
  const units = (value: number) => `${Math.round(value)} 💧`;
  const delta = (end: number, start: number | undefined) => start === undefined
    ? 'Sin registro inicial' : `${end >= start ? '+' : '−'}${Math.round(Math.abs(end - start))} desde el inicio`;
  document.getElementById('fin-reserve-change')!.textContent = delta(st.reservoirVolume, first ? first.balance.reservoirStart - first.events.reduce((sum, e) => sum + (e.waterAdjustment?.reservoirChange ?? 0), 0) : undefined);
  document.getElementById('fin-aquifer-change')!.textContent = delta(st.aquiferVolume, first ? first.balance.aquiferStart - first.events.reduce((sum, e) => sum + (e.waterAdjustment?.aquiferChange ?? 0), 0) : undefined);
  document.getElementById('fin-river-close')!.textContent = last ? units(last.balance.downstreamFlow) : 'Sin registro';
  document.getElementById('fin-river-note')!.textContent = `Caudal al cierre · calidad ${waterQualityLabel(st.waterQuality)}`;

  const milestones = document.getElementById('fin-milestones')!;
  milestones.replaceChildren();
  const addCard = (label: string, title: string, description: string) => {
    const card = document.createElement('article');
    card.className = 'final-milestone';
    for (const [tag, text] of [['small', label], ['h3', title], ['p', description]]) {
      const el = document.createElement(tag);
      el.textContent = text;
      card.appendChild(el);
    }
    milestones.appendChild(card);
  };
  if (history.length) {
    const lowest = history.reduce((a, b) => b.balance.aquiferEnd < a.balance.aquiferEnd ? b : a);
    const best = history.reduce((a, b) => {
      const coverage = (r: SeasonResult) => PLAYABLE_SECTORS.filter(id => r.balance.satisfactions[id] >= 1).length;
      return coverage(b) > coverage(a) ? b : a;
    });
    const when = (r: SeasonResult) => `Año ${r.year} · ${SEASONS_INFO[r.season].name}`;
    const covered = PLAYABLE_SECTORS.filter(id => best.balance.satisfactions[id] >= 1).length;
    addCard(when(best), `${covered}/5 necesidades cubiertas`, `Mayor cobertura simultánea. Caudal recomendado alcanzado en ${ecoTurns}/${history.length} estaciones.`);
    const allDelivered = history.every(r => ['population', 'agriculture', 'livestock', 'mining'].every(id => r.balance.suppliedAllocations[id as SectorId] >= r.balance.allocations[id as SectorId]));
    addCard(when(lowest), `Acuífero: ${units(lowest.balance.aquiferEnd)}`, `Menor reserva. Cobertura incompleta en ${dryTurns}/${history.length} estaciones. ${allDelivered
      ? 'Los pedidos se entregaron completos; las brechas fueron de pedidos menores que la demanda. No demuestra que pedir más fuese sostenible.'
      : 'Hubo pedidos no entregados completos: compará pedido, suministro y cobertura.'} La confianza final no resume esas brechas.`);
  }
  addCard('Obras al cierre', works.length ? `${works.length} obras en uso` : 'Gestión sin obras',
    works.length ? `${works.slice(0, 2).join(' · ')}${works.length > 2 ? ` · +${works.length - 2} en detalles` : ''}` : 'La partida terminó sin mejoras construidas.');

  document.getElementById('fin-relation')!.textContent = describeStorageHistory(history, 'aquifer', 'summary');
  document.getElementById('fin-flow-detail')!.textContent = describeStorageHistory(history, 'aquifer') + ' ' + describeStorageHistory(history, 'reservoir');
  const worksList = document.getElementById('fin-works')!;
  worksList.replaceChildren();
  for (const work of works) {
    const item = document.createElement('li');
    item.textContent = work;
    worksList.appendChild(item);
  }
  document.getElementById('fin-economy')!.textContent = `Presupuesto anual neto acumulado: $${earned}. Restante: $${st.money}.`;
  const reservesFell = first && (st.aquiferVolume < first.balance.aquiferStart || st.reservoirVolume < first.balance.reservoirStart);
  const aquiferNeedsRecovery = st.aquiferStressLevel === 'STRESSED' || st.aquiferStressLevel === 'CRITICAL';
  const pumped = history.reduce((sum, result) => sum + result.balance.aquiferWithdrawal, 0);
  if (finHonorIcon) finHonorIcon.textContent = '🧭';
  if (finHonorTitle) finHonorTitle.textContent = aquiferNeedsRecovery
    ? 'Terminaste la partida; el acuífero necesita recuperarse'
    : reservesFell ? 'Abastecimiento y reservas al cierre' : 'Reservas para el próximo ciclo';
  if (finHonorDesc) finHonorDesc.textContent = history.length
    ? aquiferNeedsRecovery
      ? `Completaste ${history.length} estaciones. El acuífero cerró ${st.aquiferStressLevel === 'CRITICAL' ? 'en estado crítico' : 'en estrés'}. ${pumped > 0 ? 'El bombeo sostuvo parte del abastecimiento usando agua de esa reserva. ' : ''}Una cobertura alta, la confianza y la salud ecológica no garantizan que quede agua guardada para el próximo ciclo.`
      : `El río alcanzó el caudal recomendado en ${ecoTurns}/${history.length} estaciones. ${reservesFell ? 'Al menos una reserva cerró por debajo de su inicio: sostener el abastecimiento y guardar agua son decisiones que conviene comparar.' : 'Embalse y acuífero cerraron sin disminuir respecto del inicio. La cobertura y la calidad completan esta historia.'}`
    : 'No hay historial suficiente para describir la trayectoria de esta partida.';
  modalFinalReport.querySelector('details')?.removeAttribute('open');

  if (!aquiferNeedsRecovery) {
    sound.fanfare();
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      confetti({ particleCount: 140, spread: 85, origin: { y: 0.6 } });
    }
  }

  modalFinalReport.classList.add('open');
}

btnRestart.addEventListener('click', () => {
  if (!canUseControl(btnRestart)) return;
  cancelPendingNewspaper();
  modalFinalReport.classList.remove('open');
  if (tutorialModeSetting === 'mandatory') {
    startTutorial();
  } else if (tutorialModeSetting === 'optional') {
    modalWelcome.classList.add('open');
    beginFreshRecovery();
    engine = createRecordedEngine();
    saveRecovery();
    recordTurnInitialAllocations();
    updateUI();
  } else {
    exitTutorialToYearOne();
  }
});

// --- GESTIÓN DEL CATÁLOGO DE MEJORAS (3 NIVELES POR OBRA) ---
// Una obra que subió varios niveles se presenta una sola vez, ya desarrollada.
const pendingUpgradeConstruction = new Set<string>();
let upgradeConstructionTimer: number | undefined;

function playPendingUpgradeConstruction(): void {
  if (upgradeConstructionTimer !== undefined || pendingUpgradeConstruction.size === 0) return;
  // La última obra empieza antes de 1,2 s incluso al comprar todo el catálogo.
  const spacing = Math.min(300, 1200 / Math.max(1, pendingUpgradeConstruction.size - 1));
  const showNext = () => {
    upgradeConstructionTimer = undefined;
    // Si se vuelve a abrir el catálogo, conservar el resto para el siguiente cierre.
    // Las compras de fin de año esperan también a que el jugador vuelva al mapa.
    if (modalUpgrades.classList.contains('open') || modalYearEnd.classList.contains('open')) return;
    const tag = pendingUpgradeConstruction.values().next().value;
    if (!tag) return;
    pendingUpgradeConstruction.delete(tag);
    BasinScene.instance?.celebrateUpgrade(tag);
    if (pendingUpgradeConstruction.size > 0) upgradeConstructionTimer = window.setTimeout(showNext, spacing);
  };
  upgradeConstructionTimer = window.setTimeout(showNext, 0);
}

btnOpenUpgrades.addEventListener('click', () => {
  if (!canUseControl(btnOpenUpgrades)) return;
  const pending = budgetPresentations.get(engine);
  if (pending && (pending.season !== 0 || pending.annual !== 0)) {
    openSeasonSummary();
    const investmentNotice = document.createElement('p');
    investmentNotice.className = 'fb-water-line';
    investmentNotice.dataset.investmentNotice = '';
    cardSeasonFeedback.querySelector('[data-investment-notice]')?.remove();
    investmentNotice.textContent = pending.annual !== 0
      ? 'Antes de invertir, abrí el cierre anual para ver los nuevos fondos.'
      : 'Premio recibido. Podés volver al valle para invertir en obras.';
    fbBudgetReceipt.after(investmentNotice);
    return;
  }
  renderUpgradesList();
  modalUpgrades.classList.add('open');
});

btnCloseUpgrades.addEventListener('click', () => {
  if (!canUseControl(btnCloseUpgrades)) return;
  modalUpgrades.classList.remove('open');
  playPendingUpgradeConstruction();
  btnOpenUpgrades.focus({ preventScroll: true });
});

const tabBtns = document.querySelectorAll('.tab-btn');
tabBtns.forEach((btn) => {
  btn.addEventListener('click', (e) => {
    if (!canUseControl(btn)) return;
    tabBtns.forEach((b) => b.classList.remove('active'));
    const target = e.target as HTMLElement;
    target.classList.add('active');
    activeUpgradeBranch = target.getAttribute('data-branch') as UpgradeBranch;
    renderUpgradesList();
  });
});

function renderUpgradesList(): void {
  const upgSys = engine.getUpgradeSystem();
  const catalog = upgSys.getCatalog().filter((u) => u.branch === activeUpgradeBranch);
  const state = engine.getState();
  upgradesBudget.textContent = `Presupuesto disponible: $${state.money}`;

  upgradesList.innerHTML = '';

  for (const item of catalog) {
    const currentLevel = state.upgrades[item.id]?.currentLevel || 0;
    const isMax = currentLevel >= item.maxLevel;
    const check = upgSys.canPurchase(item.id, state.upgrades, state.money);
    const nextCost = item.costs[currentLevel] ?? item.costs[0];

    const card = document.createElement('div');
    card.className = 'upgrade-card';

    let effectsHTML = '';
    const displayedEffects = item.maxLevel === 1 ? item.effects
      : [item.effects[(isMax ? currentLevel : currentLevel + 1) - 1]];
    for (const eff of displayedEffects) {
      effectsHTML += `<div>✨ ${eff.description}</div>`;
    }
    const upgradePreview = engine.previewUpgrade(item.id);
    const efficiencySectors: Record<string, SectorId> = { riego_eficiente: 'agriculture', mantenimiento_canales: 'agriculture',
      reparacion_red: 'population', planta_saneamiento: 'population', recirculacion_minera: 'mining' };
    const demandSector = efficiencySectors[item.id];
    if (upgradePreview && demandSector) {
      const before = upgradePreview.currentDemands[demandSector];
      const after = upgradePreview.nextDemands[demandSector];
      effectsHTML += `<div>Demanda con el clima de esta estación: ${before} → ${after} gotas. ${before === after
        ? 'Sin reducción de gotas ahora (redondeo, mínimo del sector o nivel sin eficiencia); ver otros efectos y desbloqueos.'
        : `${before - after} ${before - after === 1 ? 'gota menos' : 'gotas menos'} de demanda; el ahorro real depende del reparto.`}</div>`;
      if (state.isSeasonResolved) effectsHTML += '<div>Esta estación ya cerró; el nuevo nivel se usará en la próxima operación.</div>';
    }
    if (upgradePreview && item.id === 'ampliacion_embalse') {
      const extra = item.effects[currentLevel].value;
      effectsHTML += `<div>Espacio adicional de este nivel: +${extra} gotas (${state.reservoirCapacity} → ${state.reservoirCapacity + extra}). No agrega agua.</div>`;
      const preview = engine.previewSeason().balance;
      const spilled = state.seasonHistory.reduce((sum, season) => sum + season.balance.reservoirSpill, 0);
      effectsHTML += `<div>Guardadas ahora: ${state.reservoirVolume}/${state.reservoirCapacity}. ${preview.reservoirSpill > 0
        ? 'Este reparto prevé desborde: más espacio puede retener parte de esa entrada.'
        : 'Este reparto cabe en la capacidad actual; ampliarla no cambia eso.'} Desborde registrado hasta ahora: ${spilled}. Sirve para guardar excedentes cuando llegan, no para producir agua.</div>`;
    }

    card.innerHTML = `
      <div class="upgrade-card-header">
        <div class="upgrade-title">${item.name}</div>
        <div class="upgrade-level-badge">${isMax ? `Nivel ${currentLevel} · completo` : `Actual N${currentLevel} · Comprar N${currentLevel + 1}`}</div>
      </div>
      <div class="upgrade-desc">${item.description}</div>
      <div class="upgrade-effects">${effectsHTML}</div>
      <div class="upgrade-footer">
        <div class="upgrade-cost">${isMax ? 'Completado' : `$${nextCost}`}</div>
        <button class="btn-huge-action btn-buy-upgrade" data-id="${item.id}" ${!check.canBuy ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>
          ${isMax ? 'Al Máximo' : 'Realizar Obra'}
        </button>
      </div>
      ${!check.canBuy && !isMax ? `<div style="font-size: 0.78rem; color: #f87171; font-weight: 700;">${check.reason}</div>` : ''}
    `;

    upgradesList.appendChild(card);
    if (demandSector && !state.isSeasonResolved && check.canBuy && !state.activeInteractiveEvent) {
      const comparison = document.createElement('details');
      comparison.className = 'learning-note upgrade-comparison';
      const summary = document.createElement('summary');
      summary.textContent = 'Comparar este turno con el próximo nivel';
      const label = document.createElement('label');
      label.textContent = 'Política de reparto: ';
      const policy = document.createElement('select');
      policy.setAttribute('aria-label', `Política para comparar ${item.name}`);
      policy.innerHTML = '<option value="same_requests">Mantener mis pedidos</option><option value="reduce_affected_requests">Reducir pedidos afectados, sin redistribuir</option>';
      label.append(policy);
      const result = document.createElement('div');
      const renderComparison = () => {
        const pair = engine.previewUpgradeWater(item.id, policy.value as 'same_requests' | 'reduce_affected_requests');
        result.replaceChildren();
        if (!pair) {
          result.textContent = 'La comparación requiere una estación abierta y una obra disponible.';
          return;
        }
        const note = document.createElement('p');
        note.textContent = `Nivel ${pair.currentLevel} → ${pair.nextLevel} · $${pair.cost}. Mismo clima y reservas iniciales. ${pair.policy === 'same_requests'
          ? 'Las compuertas conservan exactamente sus pedidos.'
          : 'Sólo baja el pedido de los usos cuya demanda disminuye, hasta su nueva necesidad. El margen no se reasigna.'} Es una previsión del modelo para esta estación; no cambia tu partida ni compara cinco años.`;
        const table = document.createElement('table');
        table.className = 'technology-table';
        table.innerHTML = '<caption>Efectos dentro del modelo · gotas conceptuales</caption><thead><tr><th scope="col">Medida</th><th scope="col">Nivel actual</th><th scope="col">Próximo nivel</th></tr></thead>';
        const body = document.createElement('tbody');
        const add = (name: string, before: number | string, after: number | string) => {
          const row = document.createElement('tr');
          const heading = document.createElement('th');
          heading.scope = 'row';
          heading.textContent = name;
          row.append(heading);
          for (const value of [before, after]) {
            const cell = document.createElement('td');
            cell.textContent = String(value);
            row.append(cell);
          }
          body.append(row);
        };
        for (const sector of new Set([demandSector, ...pair.affectedSectors])) {
          const name = state.sectors[sector].shortName;
          add(`Necesidad · ${name}`, pair.before.demands[sector], pair.after.demands[sector]);
          add(`Pedido · ${name}`, pair.before.allocations[sector], pair.after.allocations[sector]);
          add(`Cobertura · ${name}`, `${Math.round(pair.before.balance.satisfactions[sector] * 100)}%`, `${Math.round(pair.after.balance.satisfactions[sector] * 100)}%`);
        }
        const before = pair.before.balance;
        const after = pair.after.balance;
        const total = (values: Record<string, number>) => Object.values(values).reduce((sum, value) => sum + value, 0);
        add('Toma del río', before.directRiverIntake, after.directRiverIntake);
        add('Extracción del embalse', before.reservoirWithdrawal, after.reservoirWithdrawal);
        add('Bombeo de pozos', before.aquiferWithdrawal, after.aquiferWithdrawal);
        add('Consumo conceptual total', total(before.consumptions), total(after.consumptions));
        add('Retornos al río', total(before.returns), total(after.returns));
        add('Embalse al cierre', before.reservoirEnd, after.reservoirEnd);
        add('Acuífero al cierre', before.aquiferEnd, after.aquiferEnd);
        add('Caudal aguas abajo', before.downstreamFlow, after.downstreamFlow);
        add('Cobertura de caudal ecológico', `${Math.round(before.satisfactions.ecosystem * 100)}%`, `${Math.round(after.satisfactions.ecosystem * 100)}%`);
        table.append(body);
        const question = document.createElement('p');
        question.textContent = '¿Mejoró la cobertura, quedó más agua guardada o aumentó el retorno? Una necesidad menor no implica automáticamente menor extracción. Los coeficientes y fracciones de retorno requieren revisión experta; estos resultados no estiman ahorro en una cuenca real.';
        result.append(note, table, question);
      };
      comparison.addEventListener('toggle', () => { if (comparison.open) renderComparison(); });
      policy.addEventListener('change', renderComparison);
      comparison.append(summary, label, result);
      card.append(comparison);
    }
  }

  const buyBtns = document.querySelectorAll('.btn-buy-upgrade');
  buyBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      if (!canUseControl(btn) || !modalUpgrades.classList.contains('open')) return;
      const upgId = (e.currentTarget as HTMLElement).getAttribute('data-id');
      if (upgId) {
        sessionLog?.captureAllocations(engine.getState());
        const res = engine.purchaseUpgrade(upgId);
        if (res.success) {
          sessionLog?.record({ type: 'purchase', turn: engine.getState().turn, upgradeId: upgId });
          saveRecovery();
          renderUpgradesList();
          updateUI();
          const definition = upgSys.getUpgrade(upgId);
          if (definition) pendingUpgradeConstruction.add(definition.visualTag);
        } else {
          alert(res.message);
        }
      }
    });
  });
}

// --- PRONÓSTICO DEL CLIMA (PREVISIÓN ESTACIONAL) ---
const forecastMessages: Record<ClimateStateType, { label: string; meaning: string; tone: string }> = {
  VERY_DRY: { label: '☀️ Muy seco', meaning: 'Podría entrar muy poca agua. Cuidá las reservas del embalse y dejá agua para mantener vivo el río.', tone: 'dry' },
  DRY: { label: '🌤️ Seco', meaning: 'Podría entrar menos agua. Cuidá las reservas del embalse y mirá el agua que sigue por el río.', tone: 'dry' },
  NORMAL: { label: '⛅ Lluvias habituales', meaning: 'Podría entrar el agua habitual. Mirá la reserva del embalse: las necesidades también cambian con la estación.', tone: 'normal' },
  WET: { label: '🌧️ Más lluvias', meaning: 'Podría llegar más agua al río y al embalse. Mirá cuánto espacio libre queda para almacenarla.', tone: 'wet' },
  VERY_WET: { label: '⛈️ Posible crecida', meaning: 'Podría llegar mucha agua y subir el río. Dejá lugar en el embalse y mirá el río.', tone: 'wet' }
};

function renderForecast(): void {
  const state = engine.getState();
  const fc = state.nextSeasonForecast;
  const message = forecastMessages[fc.likelyState];
  const monitoringLevel = state.upgrades.estacion_meteorologica?.currentLevel ?? 0;
  if (!forecastMonitoringLevels.has(fc)) forecastMonitoringLevels.set(fc, monitoringLevel);
  const issuedLevel = forecastMonitoringLevels.get(fc)!;
  const pendingMonitoring = monitoringLevel > issuedLevel;
  const reliability = `${Math.round(fc.accuracy * 100)}%`;
  const monitoringNote = `Pista del clima: ${reliability}. Puede fallar. ${pendingMonitoring
    ? '✓ Nuevos sensores: mejoran la próxima pista.'
    : issuedLevel === 0 ? 'Sin sensores todavía.' : `Sensores: nivel ${issuedLevel}.`}`;

  forecastPreview.hidden = tutorialManager.isActive() || state.isGameOver || state.isSeasonResolved;
  forecastPreview.dataset.tone = message.tone;
  forecastPreview.classList.toggle('monitoring-pending', pendingMonitoring);
  document.getElementById('forecast-title')!.textContent = `Próxima estación · ${SEASONS_INFO[getNextSeason(state.season).nextSeason].name}: ${message.label}`;
  document.getElementById('forecast-meaning')!.textContent = message.meaning;
  document.getElementById('forecast-confidence')!.textContent = monitoringNote;

  const fcState = document.getElementById('fc-state')!;
  const fcDesc = document.getElementById('fc-desc')!;
  const fcDrought = document.getElementById('fc-drought')!;
  const fcStorm = document.getElementById('fc-storm')!;
  const fcAccuracyNote = document.getElementById('fc-accuracy-note')!;

  fcState.textContent = message.label;
  fcDesc.textContent = `Próxima estación: ${SEASONS_INFO[getNextSeason(state.season).nextSeason].name}. ${message.meaning}`;
  fcDrought.textContent = fc.droughtRisk;
  fcDrought.style.color = fc.droughtRisk === 'ALTA' ? '#ef4444' : fc.droughtRisk === 'MEDIA' ? '#f59e0b' : '#10b981';

  fcStorm.textContent = fc.stormRisk;
  document.getElementById('fc-drought-advice')!.textContent = fc.droughtRisk === 'ALTA'
    ? 'La pista sugiere escasez. Compará los pedidos con las reservas.'
    : fc.droughtRisk === 'MEDIA' ? 'Hay posibilidad de escasez; revisá reservas y demandas.'
    : 'La pista no indica una sequía marcada. Las necesidades igualmente cambian.';
  document.getElementById('fc-storm-advice')!.textContent = fc.stormRisk === 'ALTA'
    ? 'La pista sugiere lluvias fuertes. Más lluvia no garantiza llenar el embalse: parte infiltra o sigue por el río.'
    : fc.stormRisk === 'MEDIA' ? 'Podrían subir las lluvias. Mirá el río y el espacio libre; no es una promesa de recarga.'
    : 'La pista no indica una crecida importante. No hace falta vaciar el embalse por este aviso.';
  fcStorm.style.color = fc.stormRisk === 'ALTA' ? '#3b82f6' : fc.stormRisk === 'MEDIA' ? '#06b6d4' : '#94a3b8';

  fcAccuracyNote.textContent = `${monitoringNote} Los sensores hacen la próxima pista más confiable; no cambian el clima.`;
}

function openForecast(): void {
  if (backgroundInteractionBlocked()) return;
  renderForecast();
  modalForecast.classList.add('open');
}
btnForecast.addEventListener('click', openForecast);
document.getElementById('btn-forecast-detail')!.addEventListener('click', openForecast);

btnCloseForecast.addEventListener('click', () => {
  if (!canUseControl(btnCloseForecast)) return;
  modalForecast.classList.remove('open');
});

// Exportar siempre la partida vigente, no los campos aún sin aplicar del Aula.
function downloadSessionDiagnostic(): void {
  const state = engine.getState();
  const data = createSessionExport(state, engine.getModelVersion(), sessionLog,
    new Date().toISOString(), tutorialManager.isActive() ? 'tutorial' : 'game');
  downloadJSON(JSON.stringify(data, null, 2), 'cuenca-viva-modelo-' + engine.getModelVersion() + '-turno-' + state.turn + '.json');
}
function downloadJSON(content: string, filename: string, mimeType = 'application/json'): void {
  const url = URL.createObjectURL(new Blob([content], { type: mimeType }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  // El bloqueo de fondo impide clicks fuera del modal. La descarga debe
  // nacer dentro de la superficie activa, también en el cierre de partida.
  (activeInteractionSurface() ?? document.body).appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function learningReportHTML(): string {
  const summary = modalFinalReport.querySelector('.final-report-window')!.cloneNode(true) as HTMLElement;
  summary.querySelector('.final-report-footer')?.remove();
  summary.querySelectorAll<HTMLDetailsElement>('details').forEach(details => { details.open = true; });
  return createLearningReport(engine.getState(), summary.innerHTML);
}
document.querySelectorAll<HTMLButtonElement>('[data-save-results]').forEach(button => {
  button.addEventListener('click', () => {
    if (!canUseControl(button) || !engine.getState().isGameOver) return;
    downloadJSON(learningReportHTML(), 'cuenca-viva-mis-resultados.html', 'text/html');
    const status = modalFinalReport.querySelector<HTMLElement>('[data-export-status]');
    if (status) { status.hidden = false; status.textContent = 'Descarga solicitada. Abrí el archivo para leer, imprimir o comparar tu partida.'; }
  });
});
document.querySelectorAll<HTMLButtonElement>('[data-print-results]').forEach(button => {
  button.addEventListener('click', () => {
    if (!canUseControl(button) || !engine.getState().isGameOver) return;
    const report = learningReportHTML();
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      const status = modalFinalReport.querySelector<HTMLElement>('[data-export-status]');
      if (status) { status.hidden = false; status.textContent = 'No se pudo abrir la impresión. Usá Guardar datos y abrí el archivo descargado para imprimirlo.'; }
      return;
    }
    printWindow.document.open();
    printWindow.document.write(report);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  });
});
document.querySelectorAll<HTMLButtonElement>('[data-export-session]').forEach(button => {
  button.addEventListener('click', () => {
    if (!canUseControl(button)) return;
    downloadSessionDiagnostic();
    const status = button.closest('.modal-backdrop')?.querySelector<HTMLElement>('[data-export-status]');
    if (status) { status.hidden = false; status.textContent = 'Descarga solicitada. Revisá las descargas de tu navegador.'; }
  });
});

document.querySelectorAll<HTMLButtonElement>('[data-copy-session]').forEach(button => {
  button.addEventListener('click', async () => {
    if (!canUseControl(button)) return;
    const status = button.closest('.modal-backdrop')?.querySelector<HTMLElement>('[data-export-status]');
    const state = engine.getState();
    const data = createSessionExport(state, engine.getModelVersion(), sessionLog,
      new Date().toISOString(), tutorialManager.isActive() ? 'tutorial' : 'game');
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      if (status) { status.hidden = false; status.textContent = `Datos copiados: ${state.seasonHistory.length} estaciones. Podés pegarlos para compartir la partida.`; }
    } catch {
      if (status) { status.hidden = false; status.textContent = 'El navegador no permitió copiar. Usá Descargar registro completo y adjuntá el archivo.'; }
    }
  });
});

// --- COPIA LOCAL Y RECUPERACIÓN EXPLÍCITA ---
function setRecoveryStatus(message: string): void {
  document.querySelectorAll<HTMLElement>('[data-recovery-status]').forEach(node => { node.textContent = message; });
}

function saveRecovery(): void {
  window.clearTimeout(recoverySaveTimer);
  recoverySaveTimer = undefined;
  if (!recoveryWritesEnabled || tutorialManager.isActive() || !sessionLog) return;
  let result: { ok: true } | { ok: false; reason: string };
  try {
    const packet = createRecoveryPacket(engine.getState(), sessionLog, new Date().toISOString());
    if (!packet) return;
    result = writeRecovery(() => window.localStorage, packet, preserveRecoveryOriginal);
  } catch {
    result = { ok: false, reason: 'No se pudo guardar el progreso en este navegador. Podés descargar el registro completo desde Ayuda.' };
  }
  if (result.ok) {
    preserveRecoveryOriginal = false;
    setRecoveryStatus('Copia local guardada en este navegador. También podés descargar el diagnóstico JSON.');
  } else {
    setRecoveryStatus(result.reason);
    if (!recoveryWarningShown) {
      recoveryWarningShown = true;
      showToastTip('local_recovery_failed', 'No se pudo guardar la partida', result.reason);
    }
  }
}

function scheduleRecoverySave(): void {
  if (!recoveryWritesEnabled || tutorialManager.isActive()) return;
  window.clearTimeout(recoverySaveTimer);
  recoverySaveTimer = window.setTimeout(saveRecovery, 250);
}

function dismissRecoveryChoice(): void {
  recoveryChoiceVisible = false;
  recoveryChoice.hidden = true;
  welcomeNewChoices.hidden = false;
}

function beginFreshRecovery(): void {
  saveRecovery();
  recoveryWritesEnabled = true;
  preserveRecoveryOriginal = true;
  dismissRecoveryChoice();
}

function showRecoveryChoice(saved: RecoveryRead): boolean {
  if (saved.kind !== 'ready' && saved.kind !== 'rejected') {
    if (saved.kind === 'unavailable') setRecoveryStatus(saved.reason);
    return false;
  }
  recoveryChoiceVisible = true;
  recoveryChoice.hidden = false;
  welcomeNewChoices.hidden = true;
  modalWelcome.classList.add('open');
  btnContinueRecovery.disabled = saved.kind !== 'ready';
  const recoveryOptions = document.querySelector<HTMLDetailsElement>('#welcome-recovery .welcome-save-options');
  if (recoveryOptions) { recoveryOptions.hidden = saved.kind === 'ready'; recoveryOptions.open = saved.kind === 'rejected'; }
  btnContinueRecovery.textContent = saved.kind === 'ready' && saved.engine.getState().isGameOver ? 'Ver resultado' : '▶ Continuar';
  recoveryDescription.textContent = saved.kind === 'ready'
    ? `${saved.engine.getState().scenarioName} · Año ${saved.engine.getState().year} · ${SEASONS_INFO[saved.engine.getState().season].name}${saved.engine.getState().isGameOver ? ' · Completada' : ''}`
    : `${saved.reason} Podés descargar la copia original o iniciar otra partida.`;
  btnDownloadRecovery.onclick = () => {
    if (!canUseControl(btnDownloadRecovery)) return;
    downloadJSON(saved.raw, 'cuenca-viva-copia-local-original.json');
  };
  return true;
}

btnContinueRecovery.addEventListener('click', () => {
  if (!canUseControl(btnContinueRecovery) || !recoveryChoiceVisible) return;
  // Re-read/replay on explicit choice, before replacing any live references.
  const saved = readRecovery(() => window.localStorage);
  if (saved.kind !== 'ready') {
    if (!showRecoveryChoice(saved)) recoveryDescription.textContent = 'No se pudo leer la copia local. Podés iniciar otra partida.';
    return;
  }
  cancelPendingNewspaper();
  engine = saved.engine;
  sessionLog = saved.log;
  currentSeed = engine.getState().seed;
  currentScenario = engine.getState().scenarioId;
  tutorialManager.exitTutorial();
  recoveryWritesEnabled = true;
  preserveRecoveryOriginal = false;
  dismissRecoveryChoice();
  modalWelcome.classList.remove('open');
  const state = engine.getState();
  BasinScene.initialGameState = state;
  recordTurnInitialAllocations();
  updateUI();
  if (state.isGameOver) showFinalReport();
  else if (state.isYearEndPhase) showYearEndModal();
  else if (state.isSeasonResolved) {
    const result = state.seasonHistory.at(-1)!;
    renderAgileSeasonFeedback(result, getCurrentSeasonalGoal(), result.goalAchieved);
    cardSeasonFeedback.inert = false;
    cardSeasonFeedback.classList.add('open');
  }
  syncInteractionLock();
  setRecoveryStatus('Partida recuperada desde la copia local verificada.');
});

btnRestartRecovery.addEventListener('click', () => {
  if (!canUseControl(btnRestartRecovery) || !recoveryChoiceVisible) return;
  const saved = readRecovery(() => window.localStorage);
  if (saved.kind === 'ready') {
    currentSeed = saved.engine.getState().seed;
    currentScenario = saved.engine.getState().scenarioId;
  }
  modalWelcome.classList.remove('open');
  if (tutorialModeSetting === 'mandatory') startTutorial();
  else exitTutorialToYearOne();
});

window.addEventListener('beforeunload', saveRecovery);
window.addEventListener('pagehide', saveRecovery);
(import.meta as ImportMeta & { hot?: { dispose(callback: () => void): void } }).hot?.dispose(() => {
  saveRecovery();
  window.removeEventListener('beforeunload', saveRecovery);
  window.removeEventListener('pagehide', saveRecovery);
});


// --- MODO AULA ESCOLAR ---
btnClassroom.addEventListener('click', () => {
  if (!canUseControl(btnClassroom)) return;
  inputSeed.value = currentSeed;
  selectScenario.value = currentScenario;
  modalClassroom.classList.add('open');
});

btnCloseClassroom.addEventListener('click', () => {
  if (!canUseControl(btnCloseClassroom)) return;
  modalClassroom.classList.remove('open');
});

btnApplySeed.addEventListener('click', () => {
  if (!canUseControl(btnApplySeed)) return;
  const seedVal = inputSeed.value.trim().toUpperCase() || 'AULA-2026-001';
  const scenVal = selectScenario.value;
  const selectTut = document.getElementById('select-tutorial-mode') as HTMLSelectElement | null;
  if (selectTut) {
    tutorialModeSetting = (selectTut.value as any) || 'optional';
  }
  currentSeed = seedVal;
  currentScenario = scenVal;
  modalClassroom.classList.remove('open');

  if (tutorialModeSetting === 'mandatory') {
    startTutorial();
  } else if (tutorialModeSetting === 'disabled') {
    modalWelcome.classList.remove('open');
    exitTutorialToYearOne();
  } else {
    modalWelcome.classList.add('open');
    beginFreshRecovery();
    engine = createRecordedEngine();
    saveRecovery();
    recordTurnInitialAllocations();
    updateUI();
  }
});

// --- GUÍA DIDÁCTICA ---
btnHelp.addEventListener('click', () => {
  if (!canUseControl(btnHelp)) return;
  modalHelp.classList.add('open');
});

btnCloseHelp.addEventListener('click', () => {
  if (!canUseControl(btnCloseHelp)) return;
  modalHelp.classList.remove('open');
});

// --- FICHA CONTEXTUAL LATERAL AL TOCAR ELEMENTOS DEL MAPA (NO BLOQUEANTE) ---
function handleMapElementClick(elem: MapClickTarget): void {
  if (backgroundInteractionBlocked()) return;
  if (PLAYABLE_SECTORS.includes(elem as PlayableSectorId)) {
    selectMapSector(elem as PlayableSectorId);
    return;
  }
  closeSectorEditor();
  if (tutorialManager.isActive() && window.innerWidth <= 800) setTutorialCollapsed(true);
  const st = engine.getState();
  const b = tutorialManager.isActive() ? undefined : st.isSeasonResolved ? st.seasonHistory.at(-1)?.balance : engine.previewSeason().balance;

  if (elem === 'dam') {
    ctxIcon.textContent = '🌊';
    ctxTitle.textContent = 'Presa y Embalse';
    ctxSubtitle.textContent = 'Regulación automática · inspección';
    ctxDesc.textContent =
      'El río abastece primero por captación directa. Parte del río restante entra al embalse y otra parte sigue por el río. El embalse entrega agua automáticamente si falta suministro.';
    ctxStats.innerHTML = `
      <div>• <strong>Volumen almacenado:</strong> ${st.reservoirVolume} / ${st.reservoirCapacity} 💧 (${Math.round((st.reservoirVolume / st.reservoirCapacity) * 100)}%)</div>
      ${b ? `<div>• <strong>Recibe del río:</strong> ${b.reservoirInflow} 💧</div><div>• <strong>Entrega automática:</strong> ${b.reservoirWithdrawal} 💧</div><div>• <strong>Desborde al río:</strong> ${b.reservoirSpill} 💧</div>` : ''}
    `;
    ctxPedagogy.innerHTML = '💡 <em>Un embalse más grande puede guardar más agua, pero construirlo no lo llena.</em>';
  } else if (elem === 'aquifer') {
    ctxIcon.textContent = '💧';
    ctxTitle.textContent = 'Acuífero Subterráneo';
    ctxSubtitle.textContent = 'Agua bajo tierra';
    ctxDesc.textContent =
      'El acuífero guarda agua en espacios entre rocas y sedimentos. Recibe lluvia infiltrada, escorrentía derivada por una obra y agua del tramo permeable del río. Así, parte del deshielo puede llegar bajo tierra. Los pozos extraen agua. Con el acuífero lleno, el nuevo aporte fluvial sigue por el río.';
    ctxStats.innerHTML = `
      <div>• <strong>Agua en almacenamiento:</strong> ${st.aquiferVolume} / ${st.aquiferCapacity} 💧 (${Math.round((st.aquiferVolume / st.aquiferCapacity) * 100)}%)</div>
      <div>• <strong>Estado del reservorio:</strong> ${{ HEALTHY: 'Saludable', ATTENTION: 'Atención', STRESSED: 'En tensión', CRITICAL: 'Crítico' }[st.aquiferStressLevel]}</div>
      ${b ? `<div>• <strong>Lluvia infiltrada:</strong> +${b.aquiferNaturalRecharge} 💧</div><div>• <strong>Infiltración del río:</strong> +${b.aquiferRiverRecharge} 💧</div><div>• <strong>Escorrentía derivada por la obra:</strong> +${b.aquiferArtificialRecharge} 💧</div><div>• <strong>Bombeo:</strong> −${b.aquiferWithdrawal} 💧 · <strong>Desborde al río:</strong> −${b.aquiferOverflow} 💧</div>` : ''}
    `;
    ctxPedagogy.innerHTML = '💡 <em>Si bombeás más de lo que entra, baja la reserva. Dejar agua en el río puede ayudar a recargarla. La tasa del juego es un supuesto educativo; ver Aula.</em>';
  } else if (elem === 'mountain') {
    ctxIcon.textContent = '🏔️';
    ctxTitle.textContent = 'Cordillera y Cumbres';
    ctxSubtitle.textContent = 'Nieve que se convierte en agua';
    ctxDesc.textContent =
      'En invierno se junta nieve en la montaña. Cuando hace más calor, se derrite y aporta agua al río.';
    ctxStats.innerHTML = `
      <div>• <strong>Manto de nieve actual:</strong> ${st.snowReserve} 💧</div>
      <div>• <strong>Dinámica estacional:</strong> Acumula en invierno y libera agua en primavera mediante el deshielo.</div>
    `;
    ctxPedagogy.innerHTML = '💡 <em>La montaña guarda agua en forma de nieve para más adelante.</em>';
  } else if (elem === 'river') {
    ctxIcon.textContent = '🏞️';
    ctxTitle.textContent = 'Río Principal · información';
    ctxSubtitle.textContent = 'Recorrido y retornos del preview';
    ctxDesc.textContent =
      'El agua entra al río desde el deshielo, la lluvia y un aporte de base. Una parte se usa, otra se guarda en el embalse y otra se infiltra al acuífero. El resto sigue hacia el humedal junto con los retornos de los usos.';
    ctxStats.innerHTML = `
      <div>• <strong>Agua que entra esta estación:</strong> ${b?.riverInflow ?? st.riverFlow} 💧 (unidades del juego)</div>
      ${b ? `<div>• <strong>A la red / al embalse / al acuífero / sigue por el río:</strong> ${b.directRiverIntake} / ${b.reservoirInflow} / ${b.aquiferRiverRecharge} / ${b.riverInflow - b.directRiverIntake - b.reservoirInflow - b.aquiferRiverRecharge} 💧</div><div>• <strong>Caudal final:</strong> ${b.downstreamFlow} 💧 · calidad ${waterQualityLabel(b.waterQuality)}</div>` + (["population", "agriculture", "livestock", "mining"] as const).map(id => `<div>• <strong>Retorno ${st.sectors[id].shortName}:</strong> ${b.returns[id]} 💧 · calidad ${waterQualityLabel(b.returnQualities[id])}</div>`).join("") : ""}
      <div>• <strong>Calidad del agua:</strong> ${st.waterQuality}/100 (no mide potabilidad)</div>
    `;
    ctxPedagogy.innerHTML = '💡 <em>Río Vivo compara el agua que llega al humedal con la cantidad que necesita; este dato del cauce es sólo informativo.</em>';
  } else {
    const sec = st.sectors[elem];
    ctxIcon.textContent = sec.icon;
    ctxTitle.textContent = sec.name;
    ctxSubtitle.textContent = 'Sector Usuario de la Cuenca';
    ctxDesc.textContent = sec.description;
    const sat = Math.round(sec.satisfactionRate * 100);
    ctxStats.innerHTML = `
      <div>• <strong>Demanda estacional:</strong> ${sec.currentDemand} 💧</div>
      <div>• <strong>Agua asignada:</strong> ${sec.allocated} 💧 (Satisfacción: ${sat}%)</div>
      <div>• <strong>Retorno al río:</strong> ${sec.returned} 💧 (Calidad del vertido: ${sec.returnQuality}/100)</div>
    `;
    ctxPedagogy.innerHTML = `💡 <em>Usa los controles del panel inferior para equilibrar el suministro de este sector.</em>`;
  }

  contextualCard.classList.add('open');
  positionMapControls();
}

btnCloseContextual.addEventListener('click', () => {
  if (!canUseControl(btnCloseContextual)) return;
  contextualCard.classList.remove('open');
});

// Inspección contextual desde las tarjetas de reservas naturales
document.getElementById('row-reserve-snow')?.addEventListener('click', () => handleMapElementClick('mountain'));
document.getElementById('row-reserve-dam')?.addEventListener('click', () => handleMapElementClick('dam'));
document.getElementById('row-reserve-aquifer')?.addEventListener('click', () => handleMapElementClick('aquifer'));

// Aislar paneles HTML para evitar que toques, clicks o arrastres sangren al lienzo de Phaser
const stopEvents = ['pointerdown', 'pointerup', 'mousedown', 'mouseup', 'click', 'touchstart', 'touchend'];
const panelsToIsolate = [
  document.querySelector('.allocation-panel'),
  document.querySelector('.top-bar'),
  document.querySelector('.timeline-tracker'),
  document.querySelector('.tutorial-guide-banner'),
  document.querySelector('.water-reserves-card'),
  contextualCard
  , sectorEditor, mapSectorLabels
];
panelsToIsolate.forEach((p) => {
  if (!p) return;
  stopEvents.forEach((evt) => {
    p.addEventListener(evt, (e) => e.stopPropagation());
  });
});

// Cerrar ficha contextual al presionar la tecla Escape
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && contextualCard.classList.contains('open')) {
    contextualCard.classList.remove('open');
  }
  if (e.key === 'Escape') closeSectorEditor();
});

// --- CONTROL DE AUDIO Y BOTÓN DE SONIDO ---
function updateSoundButtonLabel(): void {
  if (!btnSoundToggle) return;
  if (sound.getMuted()) {
    btnSoundToggle.innerHTML = '🔇 Silencio';
    btnSoundToggle.title = 'Sonido silenciado. Toca para activar efectos de audio';
  } else {
    btnSoundToggle.innerHTML = '🔊 Sonido';
    btnSoundToggle.title = 'Sonido activado. Toca para silenciar';
  }
}

btnSoundToggle?.addEventListener('click', () => {
  if (!canUseControl(btnSoundToggle)) return;
  sound.toggleMute();
  updateSoundButtonLabel();
});
updateSoundButtonLabel();

// Leer el estado y el modal en cada entrada: el observer sólo sincroniza DOM/Phaser.
function activeInteractionSurface(): HTMLElement | null {
  const modals = Array.from(document.querySelectorAll<HTMLElement>('.modal-backdrop.open'));
  return modals.at(-1) ?? (cardSeasonFeedback.classList.contains('open') ? cardSeasonFeedback
    : typeof btnReturnSummary !== 'undefined' && !btnReturnSummary.hidden ? valleyInspectionControls : null);
}

function backgroundInteractionBlocked(): boolean {
  const st = engine.getState();
  return !!activeInteractionSurface() || st.isSeasonResolved || st.isGameOver || !!st.activeInteractiveEvent;
}

function canUseControl(control: Element | null): boolean {
  if (!control) return false;
  const surface = activeInteractionSurface();
  const modal = control.closest('.modal-backdrop');
  if (modal && modal !== surface) return false;
  return surface ? !!control && surface.contains(control) : !backgroundInteractionBlocked();
}

function focusInteractionSurface(surface: HTMLElement | null): void {
  const target = surface?.querySelector<HTMLElement>('button:not([disabled]), input:not([disabled]), select:not([disabled]), summary, a[href], [tabindex="0"]')
    ?? surface ?? document.getElementById('app');
  if (target) { if ((target === surface && target.tagName !== 'BUTTON') || target === document.getElementById('app')) target.tabIndex = -1; target.focus({ preventScroll: true }); }
}

const interactionPointerStyles = new WeakMap<HTMLElement, string>();
function syncInteractionLock(): void {
  const locked = backgroundInteractionBlocked();
  const surface = activeInteractionSurface();
  for (const child of Array.from(document.getElementById('app')!.children)) {
    if (!(child instanceof HTMLElement)) continue;
    const blocked = locked && child !== surface && !child.contains(surface);
    if (!interactionPointerStyles.has(child)) interactionPointerStyles.set(child, child.style.pointerEvents);
    child.inert = blocked;
    child.style.pointerEvents = blocked ? 'none' : interactionPointerStyles.get(child)!;
  }
  if (BasinScene.instance?.input) BasinScene.instance.input.enabled = !locked;
  if (locked) {
    if (selectedSector) closeSectorEditor();
    if (contextualCard.classList.contains('open')) contextualCard.classList.remove('open');
    if (toastTip.classList.contains('open')) closeDistributionTip();
    if (document.activeElement !== document.getElementById('app')
        && (!surface || !surface.contains(document.activeElement))) focusInteractionSurface(surface);
  }
}

function guardBackgroundEvent(event: Event): void {
  if (!backgroundInteractionBlocked()) return;
  const surface = activeInteractionSurface();
  const target = event.target instanceof Node ? event.target : null;
  if (surface && target && surface.contains(target)) {
    if (event instanceof KeyboardEvent && event.key === 'Tab') {
      const items = [...(surface.tagName === 'BUTTON' ? [surface] : []), ...Array.from(surface.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), select:not([disabled]), summary, a[href], [tabindex="0"]'))]
        .filter(el => !el.closest('[inert]') && el.getClientRects().length > 0);
      const next = event.shiftKey ? items.at(-1) : items[0];
      if (next && (event.shiftKey ? target === items[0] : target === items.at(-1))) { event.preventDefault(); next.focus(); }
    }
    return;
  }
  event.preventDefault();
  event.stopImmediatePropagation();
  if (event.type === 'focusin') focusInteractionSurface(surface);
}

const interactionLockObserver = new MutationObserver(() => syncInteractionLock());
interactionLockObserver.observe(document.getElementById('app')!, { subtree: true, attributes: true, attributeFilter: ['class'] });
for (const type of ['pointerdown', 'pointermove', 'click', 'input', 'change', 'keydown', 'focusin']) {
  document.addEventListener(type, guardBackgroundEvent, true);
}
syncInteractionLock();

// --- ARRANQUE INICIAL ---
recordTurnInitialAllocations();
const selectTutInit = document.getElementById('select-tutorial-mode') as HTMLSelectElement | null;
if (selectTutInit) {
  tutorialModeSetting = (selectTutInit.value as any) || 'optional';
}

updateUI();
if (showRecoveryChoice(readRecovery(() => window.localStorage))) {
  setRecoveryStatus('Hay una copia local; elegí Continuar o Reiniciar antes de jugar.');
} else if (tutorialModeSetting === 'mandatory') {
  startTutorial();
} else if (tutorialModeSetting === 'disabled') {
  modalWelcome.classList.remove('open');
  exitTutorialToYearOne();
} else {
  modalWelcome.classList.add('open');
}
