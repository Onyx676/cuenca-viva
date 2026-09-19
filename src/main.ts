import Phaser from 'phaser';
import confetti from 'canvas-confetti';
import { SimulationEngine } from './simulation/SimulationEngine';
import { BasinScene, MapClickTarget } from './game/BasinScene';
import { SectorId } from './models/Sector';
import { UpgradeBranch } from './models/Upgrade';
import { SEASONS_INFO, SeasonType, getNextSeason } from './models/Season';
import { GameEvent } from './models/Event';
import { SeasonResult } from './models/Balance';
import seasonalGoalsData from './data/seasonalGoals.json';
import { SeasonalGoal, checkSeasonalGoal } from './models/SeasonalGoal';
import { TutorialManager } from './tutorial/TutorialManager';
import tutorialData from './data/tutorial.json';
import { sound } from './audio/SoundFX';
import { getCharacterFeedback, SECTOR_CHARACTERS } from './game/Characters';
import { generateNewspaperEdition, NewspaperEdition } from './game/Newspaper';

// --- INICIALIZACIÓN DE LA SIMULACIÓN Y TUTORIAL ---
let currentScenario = 'cuenca_central';
let currentSeed = 'AULA-2026-001';
let tutorialModeSetting: 'optional' | 'mandatory' | 'disabled' = 'optional';
let engine = new SimulationEngine(currentScenario, currentSeed, true);
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

// Banner flotante del Tutorial (Año 0)
const tutorialGuideBanner = document.getElementById('tutorial-guide-banner')!;
const tutPhaseBadge = document.getElementById('tut-phase-badge')!;
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

// Modal: Evento Interactivo
const modalInteractiveEvent = document.getElementById('modal-interactive-event')!;
const eventModalTitle = document.getElementById('event-modal-title')!;
const eventModalDesc = document.getElementById('event-modal-desc')!;
const eventOptionsContainer = document.getElementById('event-options-container')!;

// Tarjeta Ágil de Feedback Post-Estación
const cardSeasonFeedback = document.getElementById('card-season-feedback')!;
const fbSeasonTitle = document.getElementById('fb-season-title')!;
const fbGoalBadge = document.getElementById('fb-goal-badge')!;
const fbRes = document.getElementById('fb-res')!;
const fbAqui = document.getElementById('fb-aqui')!;
const fbPop = document.getElementById('fb-pop')!;
const fbAgri = document.getElementById('fb-agri')!;
const fbHealth = document.getElementById('fb-health')!;
const fbMoney = document.getElementById('fb-money')!;
const fbAdviceText = document.getElementById('fb-advice-text')!;
const btnFbContinue = document.getElementById('btn-fb-continue')!;
const btnOpenNewspaper = document.getElementById('btn-open-newspaper') as HTMLButtonElement | null;

// Modal: El Heraldo del Valle (Periódico)
const modalNewspaper = document.getElementById('modal-newspaper') as HTMLElement | null;
const btnCloseNewspaper = document.getElementById('btn-close-newspaper') as HTMLButtonElement | null;
const newsDate = document.getElementById('news-date');
const newsMainHeadline = document.getElementById('news-main-headline');
const newsMainSubhead = document.getElementById('news-main-subhead');
const newsPhotoEmoji = document.getElementById('news-photo-emoji');
const newsMainLead = document.getElementById('news-main-lead');
const newsMainQuote = document.getElementById('news-main-quote');
const newsMainAuthor = document.getElementById('news-main-author');
const newsSideHeadline = document.getElementById('news-side-headline');
const newsSideLead = document.getElementById('news-side-lead');
const newsGossip = document.getElementById('news-gossip');
const newsWeatherHumor = document.getElementById('news-weather-humor');

const finHonorIcon = document.getElementById('fin-honor-icon');
const finHonorTitle = document.getElementById('fin-honor-title');
const finHonorDesc = document.getElementById('fin-honor-desc');

let lastNewspaperEdition: NewspaperEdition | null = null;

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
const yearendMin = document.getElementById('yearend-min')!;
const yearendEco = document.getElementById('yearend-eco')!;
const yearendAdvice = document.getElementById('yearend-advice')!;
const btnYearendUpgrades = document.getElementById('btn-yearend-upgrades')!;
const btnYearendContinue = document.getElementById('btn-yearend-continue')!;

// Modal: Mejoras
const modalUpgrades = document.getElementById('modal-upgrades')!;
const btnCloseUpgrades = document.getElementById('btn-close-upgrades')!;
const upgradesList = document.getElementById('upgrades-list')!;
let activeUpgradeBranch: UpgradeBranch = 'AGUA_RESERVAS';

// Modal: Informe Final (Año 5)
const modalFinalReport = document.getElementById('modal-final-report')!;
const btnRestart = document.getElementById('btn-restart')!;

// Modal: Clima Futuro
const modalForecast = document.getElementById('modal-forecast')!;
const btnForecast = document.getElementById('btn-forecast')!;
const btnCloseForecast = document.getElementById('btn-close-forecast')!;

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
const seasonalGoals: SeasonalGoal[] = seasonalGoalsData as SeasonalGoal[];

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
  const state = engine.getState();
  return seasonalGoals.find(g => g.year === state.year && g.season === state.season);
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
  goalRewardBadge.textContent = `+$${goal.reward.moneyBonus} 💰`;
  goalRewardBadge.title = goal.hint;
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

// --- ACTUALIZACIÓN DE SECTORES Y SLIDERS INDIVIDUALES ---
function updateSectorDisplay(id: PlayableSectorId): void {
  const sec = engine.getState().sectors[id];
  const ui = sectorUI[id];
  if (!ui) return;

  ui.disp.textContent = `${sec.allocated} / ${sec.currentDemand} 💧`;
  ui.slider.value = sec.allocated.toString();
  ui.slider.max = Math.max(Number(ui.slider.max) || 30, Math.round(sec.currentDemand * 1.5), 30).toString();

  const pct = Math.round((sec.allocated / Math.max(1, sec.currentDemand)) * 100);
  ui.cov.textContent = `${pct}%`;
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
}

// --- ACTUALIZACIÓN DE BALANCE DE AGUA Y RESERVA ---
function updateBalanceDisplay(): void {
  const state = engine.getState();
  valTotalAllocated.textContent = state.currentAllocatedTotal.toString();
  valWaterAvailable.textContent = state.availableWater.toString();

  const reserve = state.availableWater - state.currentAllocatedTotal;
  if (reserve >= 0) {
    pillReserve.className = 'water-metric-pill reserve-pill';
    pillReserve.innerHTML = `🌊 Reserva: <strong id="val-water-reserve">${reserve}</strong>`;
    pillReserve.title = 'Agua no asignada que queda guardada en el embalse';
  } else {
    const deficit = Math.abs(reserve);
    pillReserve.className = 'water-metric-pill warning';
    pillReserve.innerHTML = `⚠️ Sobregasto (+${deficit} 💧 pozos): <strong id="val-water-reserve">${reserve}</strong>`;
    pillReserve.title = 'El exceso sobre el agua disponible se bombea del agua subterránea (acuífero)';
  }
}

// --- TIPS CONTEXTUALES (APARECEN UNA SOLA VEZ) ---
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
      '¡Tu mejora reduce pérdidas y aumenta la eficiencia del agua en la cuenca de forma permanente!'
    );
  }
}

function showToastTip(key: string, title: string, desc: string): void {
  shownTips.add(key);
  toastTipTitle.textContent = title;
  toastTipDesc.textContent = desc;
  toastTip.classList.add('open');
}

btnCloseToast.addEventListener('click', () => {
  toastTip.classList.remove('open');
});

// --- MANEJO DE CAMBIOS EN SLIDERS Y AJUSTE FINO (+ / -) ---
let sliderRafId: number | null = null;
function onAllocationChange(id: PlayableSectorId, value: number): void {
  const cleanVal = Math.max(0, Math.round(value));
  const prevAlloc = engine.getState().sectors[id].allocated;
  engine.setSectorAllocation(id, cleanVal);
  updateSectorDisplay(id);
  updateBalanceDisplay();

  // Audio hidráulico modulado y reacción flotante
  const sec = engine.getState().sectors[id];
  const ratio = cleanVal / Math.max(1, sec.currentDemand);
  sound.waterGurgle(0.7 + ratio * 0.5);

  const fb = getCharacterFeedback(id, Math.round(ratio * 100));
  if (Math.abs(cleanVal - prevAlloc) >= 1) {
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
        BasinScene.instance.updateGameState(engine.getState());
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
}

// Enlazar eventos para cada uno de los 5 sectores
PLAYABLE_SECTORS.forEach((id) => {
  const ui = sectorUI[id];
  ui.slider.addEventListener('input', () => {
    onAllocationChange(id, Number(ui.slider.value));
  });
  ui.slider.addEventListener('change', () => {
    onAllocationChange(id, Number(ui.slider.value));
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
  const state = engine.getState();
  const available = state.availableWater;
  const sectors = state.sectors;

  // 1. Ciudad: satisfacer demanda, con tope de 45% del agua disponible en sequías extremas
  const popDemand = sectors.population.currentDemand;
  const popTarget = Math.min(popDemand, Math.max(1, Math.floor(available * 0.45)));

  let remaining = Math.max(0, available - popTarget);

  // 2. Caudal ecológico del río
  const ecoDemand = sectors.ecosystem.currentDemand;
  const ecoTarget = Math.min(ecoDemand, remaining);
  remaining = Math.max(0, remaining - ecoTarget);

  // 3. Sectores productivos (agri, live, min) de manera equitativa proporcional
  const totalProdDemand =
    sectors.agriculture.currentDemand + sectors.livestock.currentDemand + sectors.mining.currentDemand;
  let agriAlloc = 0;
  let liveAlloc = 0;
  let minAlloc = 0;

  if (totalProdDemand > 0 && remaining > 0) {
    if (remaining >= totalProdDemand) {
      agriAlloc = sectors.agriculture.currentDemand;
      liveAlloc = sectors.livestock.currentDemand;
      minAlloc = sectors.mining.currentDemand;
    } else {
      const ratio = remaining / totalProdDemand;
      agriAlloc = Math.floor(sectors.agriculture.currentDemand * ratio);
      liveAlloc = Math.floor(sectors.livestock.currentDemand * ratio);
      minAlloc = Math.floor(sectors.mining.currentDemand * ratio);

      let rem = remaining - (agriAlloc + liveAlloc + minAlloc);
      if (rem > 0 && agriAlloc < sectors.agriculture.currentDemand) {
        agriAlloc++;
        rem--;
      }
      if (rem > 0 && liveAlloc < sectors.livestock.currentDemand) {
        liveAlloc++;
        rem--;
      }
      if (rem > 0 && minAlloc < sectors.mining.currentDemand) {
        minAlloc++;
        rem--;
      }
    }
  }

  engine.setSectorAllocation('population', popTarget);
  engine.setSectorAllocation('ecosystem', ecoTarget);
  engine.setSectorAllocation('agriculture', agriAlloc);
  engine.setSectorAllocation('livestock', liveAlloc);
  engine.setSectorAllocation('mining', minAlloc);

  PLAYABLE_SECTORS.forEach((id) => updateSectorDisplay(id));
  updateBalanceDisplay();
  BasinScene.instance?.updateGameState(engine.getState());
}

function resetCurrentDistribution(): void {
  PLAYABLE_SECTORS.forEach((id) => {
    const val = initialTurnAllocations[id] ?? 0;
    engine.setSectorAllocation(id, val);
    updateSectorDisplay(id);
  });
  updateBalanceDisplay();
  BasinScene.instance?.updateGameState(engine.getState());
}

btnSuggestedDist.addEventListener('click', () => {
  sound.pop();
  applySuggestedDistribution();
});

btnResetDist.addEventListener('click', () => {
  sound.pop();
  resetCurrentDistribution();
});

// --- GESTIÓN DEL TUTORIAL JUGABLE (AÑO 0) ---
function startTutorial(): void {
  tutorialManager.startTutorial();
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

  setupTutorialPhaseUI();
}

function exitTutorialToYearOne(): void {
  tutorialManager.exitTutorial();
  tutorialGuideBanner.style.display = 'none';

  // Desbloquear todos los sectores y sliders
  PLAYABLE_SECTORS.forEach((id) => {
    sectorUI[id].card.classList.remove('disabled-tut', 'highlight-tut');
    sectorUI[id].slider.disabled = false;
    sectorUI[id].btnMinus.disabled = false;
    sectorUI[id].btnPlus.disabled = false;
  });

  // Re-iniciar simulación con semilla de aula limpia y pura
  engine = new SimulationEngine(currentScenario, currentSeed, true);
  recordTurnInitialAllocations();
  updateUI();
  BasinScene.instance?.updateGameState(engine.getState());
}

function setupTutorialPhaseUI(): void {
  const pData = tutorialManager.getPhaseData();
  const phase = tutorialManager.getCurrentPhase();
  const total = tutorialManager.getTotalPhases();
  const st = engine.getState();

  st.season = pData.season;
  st.availableWater = pData.availableWater;

  // Configuración hidrológica y climática viva para cada fase del tutorial
  if (phase === 1) {
    // Invierno: cordillera cargada de nieve, río en caudal base, frío
    st.climateState = 'NORMAL';
    st.snowReserve = 75;
    st.reservoirVolume = 35;
    st.riverFlow = 8;
  } else if (phase >= 2 && phase <= 4) {
    // Primavera: deshielo vivo en cumbres, río con abundante caudal, cielo claro
    st.climateState = 'NORMAL';
    st.snowReserve = 45;
    st.reservoirVolume = phase === 4 ? 43 : 35;
    st.riverFlow = 28;
  } else if (phase === 5 || phase === 6) {
    // Verano: ola de calor muy seca, evaporación estival, campos secos
    st.climateState = 'VERY_DRY';
    st.snowReserve = 10;
    st.reservoirVolume = 43;
    st.riverFlow = 15;
  } else if (phase >= 7) {
    // Otoño: lluvias bajas, consecuencia del verano reflejada en el embalse
    st.climateState = 'NORMAL';
    st.snowReserve = 5;
    st.riverFlow = 12;
    if (phase === 7) {
      st.reservoirVolume = tutorialManager.getSummerAgriAllocation() >= 20 ? 20 : 35;
    } else if (phase === 8) {
      st.reservoirVolume = 25;
    } else {
      st.reservoirVolume = 30;
    }
  }

  tutPhaseBadge.textContent = `Tutorial: Año 0 (Fase ${phase}/${total}) — ${SEASONS_INFO[pData.season].name}`;
  tutTitle.textContent = pData.title;
  tutFeedback.style.display = 'none';
  tutFeedback.className = 'tut-feedback';
  tutChoices.style.display = 'none';
  tutChoices.innerHTML = '';

  if (phase === 7) {
    tutDesc.innerHTML = `<strong>${tutorialManager.getDeferredAutumnMessage()}</strong><br/>${pData.instruction}`;
  } else if (phase === 8) {
    tutDesc.innerHTML = `${pData.instruction}<br/><em>${pData.hint}</em>`;
  } else if (phase === 9) {
    tutDesc.innerHTML = `${pData.instruction}<br/><em>${pData.hint}</em>`;
    renderTutorialPhase9Choices();
  } else {
    tutDesc.innerHTML = `${pData.instruction}<br/><em>${pData.hint}</em>`;
  }

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
    engine.setSectorAllocation('population', 20);
    engine.setSectorAllocation('ecosystem', 0);
  } else if (phase === 4) {
    engine.setSectorAllocation('population', 20);
    engine.setSectorAllocation('ecosystem', 12);
  } else if (phase === 5) {
    engine.setSectorAllocation('population', 24);
  } else if (phase === 6) {
    engine.setSectorAllocation('population', 20);
    engine.setSectorAllocation('agriculture', 0);
  } else if (phase === 7) {
    engine.setSectorAllocation('population', 15);
  } else if (phase === 8) {
    engine.setSectorAllocation('population', 0);
    engine.setSectorAllocation('agriculture', 5);
    engine.setSectorAllocation('ecosystem', 5);
  }

  btnTutNext.textContent = phase === 9 ? '🎉 Finalizar Tutorial y Comenzar Año 1 🚀' : 'Continuar ➡️';

  PLAYABLE_SECTORS.forEach((id) => updateSectorDisplay(id));
  updateBalanceDisplay();
  updateUI();
  BasinScene.instance?.updateGameState(st);
}

function onTutorialSliderChange(id: PlayableSectorId): void {
  const phase = tutorialManager.getCurrentPhase();
  const st = engine.getState();

  if (phase === 2 && id === 'population') {
    const pop = st.sectors.population.allocated;
    if (pop >= 20) {
      tutFeedback.style.display = 'block';
      tutFeedback.className = 'tut-feedback success';
      tutFeedback.textContent = '✓ ¡Excelente! Ciudad 100% abastecida. Tanques llenos y vecinos conformes 😊';
    } else {
      tutFeedback.style.display = 'block';
      tutFeedback.className = 'tut-feedback';
      tutFeedback.textContent = `Abasteciendo ${pop}/20💧 a la Ciudad...`;
    }
  } else if (phase === 3 && id === 'ecosystem') {
    const eco = st.sectors.ecosystem.allocated;
    if (eco >= 12) {
      tutFeedback.style.display = 'block';
      tutFeedback.className = 'tut-feedback success';
      tutFeedback.textContent = '✓ ¡Caudal ecológico asegurado! El río conecta con el humedal y regresan las aves 🐬';
    } else if (eco < 6) {
      tutFeedback.style.display = 'block';
      tutFeedback.className = 'tut-feedback warn';
      tutFeedback.textContent = '⚠️ Río casi seco: los peces quedan atrapados en pozones y el delta se seca.';
    } else {
      tutFeedback.style.display = 'block';
      tutFeedback.className = 'tut-feedback';
      tutFeedback.textContent = `Caudal ecológico: ${eco}/12💧`;
    }
  } else if (phase === 8) {
    const agri = st.sectors.agriculture.allocated;
    const eco = st.sectors.ecosystem.allocated;
    tutFeedback.style.display = 'block';
    tutFeedback.className = 'tut-feedback';
    tutFeedback.innerHTML = `Cultivos: <strong>${agri}/8💧</strong> | Río Vivo: <strong>${eco}/6💧</strong> | Asignados: <strong>${agri + eco}/10💧</strong>`;
  }
}

function renderTutorialPhase9Choices(): void {
  tutChoices.style.display = 'grid';
  tutChoices.innerHTML = `
    <div class="tut-choice-card" id="card-choice-riego">
      <div class="tut-choice-title">🌾 Riego Tecnificado (Nivel 1)</div>
      <div class="tut-choice-desc">Instala aspersores y canales entubados en los campos. Reduce la demanda agrícola un 12% permanentemente.</div>
    </div>
    <div class="tut-choice-card" id="card-choice-clima">
      <div class="tut-choice-title">📡 Estación Meteorológica (Nivel 1)</div>
      <div class="tut-choice-desc">Instala sensores de radar en las cumbres. Eleva la precisión del pronóstico al 65% para anticipar sequías.</div>
    </div>
  `;

  const cardRiego = document.getElementById('card-choice-riego')!;
  const cardClima = document.getElementById('card-choice-clima')!;

  cardRiego.addEventListener('click', () => {
    cardRiego.classList.add('selected');
    cardClima.classList.remove('selected');
    const res = tutorialManager.applyTutorialUpgrade('riego_eficiente', engine.getState());
    tutFeedback.style.display = 'block';
    tutFeedback.className = 'tut-feedback success';
    tutFeedback.innerHTML = `<strong>${res.title}</strong><br/>${res.beforeText} ➡️ ${res.afterText}<br/><em>${res.impactText}</em>`;
  });

  cardClima.addEventListener('click', () => {
    cardClima.classList.add('selected');
    cardRiego.classList.remove('selected');
    const res = tutorialManager.applyTutorialUpgrade('estacion_meteorologica', engine.getState());
    tutFeedback.style.display = 'block';
    tutFeedback.className = 'tut-feedback success';
    tutFeedback.innerHTML = `<strong>${res.title}</strong><br/>${res.beforeText} ➡️ ${res.afterText}<br/><em>${res.impactText}</em>`;
  });
}

btnTutNext.addEventListener('click', () => {
  const st = engine.getState();
  const check = tutorialManager.canAdvance(st);

  if (!check.allowed) {
    tutFeedback.style.display = 'block';
    tutFeedback.className = 'tut-feedback warn';
    tutFeedback.textContent = check.feedback;
    return;
  }

  const phase = tutorialManager.getCurrentPhase();
  if (phase === 9) {
    confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
    exitTutorialToYearOne();
    return;
  }

  tutorialManager.advancePhase();
  setupTutorialPhaseUI();
});

btnSkipTutorial.addEventListener('click', () => {
  exitTutorialToYearOne();
});

btnWelcomeTutorial.addEventListener('click', () => {
  startTutorial();
});

btnWelcomePlay.addEventListener('click', () => {
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
    btnResolveSeason.textContent = `🧭 Tutorial Activo: Sigue la guía superior (${seasonInfo.name})`;
    btnResolveSeason.disabled = true;
    btnResolveSeason.style.opacity = '0.6';
  } else {
    yearBadge.textContent = `Año ${state.year} / ${state.maxYears}`;
    timelineTracker.style.opacity = '1';
    btnResolveSeason.disabled = false;
    btnResolveSeason.style.opacity = '1';
    btnResolveSeason.textContent = `🚀 Resolver ${seasonInfo.name} y Ver Balance`;
    renderTimelineTracker();
    updateSeasonalGoalDisplay();
    checkContextualTips();
    seasonBadge.textContent = `${seasonInfo.icon} ${seasonInfo.name} (T${state.turn}/20)`;
    seasonBadge.className = `season-badge season-${state.season.toLowerCase()}`;
  }

  if (seasonDescBanner) {
    seasonDescBanner.textContent = `— El ancho de cada canal refleja en vivo tu asignación de agua`;
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
  climateBadge.style.background = `${clim.color}22`;
  climateBadge.style.color = clim.color;
  climateBadge.style.borderColor = `${clim.color}66`;

  // Estadísticas globales
  statMoney.textContent = `$${state.money}`;
  btnUpgradesMoney.textContent = `$${state.money}`;
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
  if (BasinScene.instance) {
    BasinScene.instance.updateGameState(state);
  }
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
    let isAllowed = true;
    let prereqMsg = '';

    if (opt.requiresUpgrade) {
      const currentLvl = upgMap[opt.requiresUpgrade] || 0;
      if (currentLvl < 1) {
        isAllowed = false;
        const upgDef = engine.getUpgradeSystem().getUpgrade(opt.requiresUpgrade);
        prereqMsg = `🔒 Requiere obra: ${upgDef?.name || opt.requiresUpgrade}`;
      }
    }

    const moneyCost = opt.effects.moneyDelta && opt.effects.moneyDelta < 0 ? Math.abs(opt.effects.moneyDelta) : 0;
    if (moneyCost > 0 && moneyCost > state.money) {
      isAllowed = false;
      prereqMsg = `💰 Fondos insuficientes (Tienes $${state.money}, cuesta $${moneyCost})`;
    }

    const card = document.createElement('div');
    card.className = `event-option-card ${!isAllowed ? 'disabled' : ''}`;

    const costLabel = moneyCost > 0 ? `Costo: $${moneyCost}` : 'Sin costo directo';

    let impactNotes: string[] = [];
    if (opt.effects.trustDelta) {
      impactNotes.push(`${opt.effects.trustDelta > 0 ? '+' : ''}${opt.effects.trustDelta}% Confianza`);
    }
    if (opt.effects.basinHealthDelta) {
      impactNotes.push(`${opt.effects.basinHealthDelta > 0 ? '+' : ''}${opt.effects.basinHealthDelta}% Salud Río`);
    }
    if (opt.effects.waterQualityDelta) {
      impactNotes.push(`${opt.effects.waterQualityDelta > 0 ? '+' : ''}${opt.effects.waterQualityDelta} Calidad`);
    }
    if (opt.effects.reservoirDelta) {
      impactNotes.push(`${opt.effects.reservoirDelta > 0 ? '+' : ''}${opt.effects.reservoirDelta} 💧 Embalse`);
    }
    if (opt.effects.aquiferDelta) {
      impactNotes.push(`${opt.effects.aquiferDelta > 0 ? '+' : ''}${opt.effects.aquiferDelta} 💧 Acuífero`);
    }

    card.innerHTML = `
      <div class="event-opt-header">
        <span class="event-opt-title">${opt.label}</span>
        <span class="event-opt-cost">${costLabel}</span>
      </div>
      <div class="event-opt-desc">${opt.description}</div>
      <div class="event-opt-impact">Resultado: ${opt.consequenceText}</div>
      ${impactNotes.length > 0 ? `<div style="font-size: 0.78rem; color: #94a3b8;">Impacto numérico: ${impactNotes.join(', ')}</div>` : ''}
      ${!isAllowed ? `<div class="event-opt-prereq">${prereqMsg}</div>` : ''}
    `;

    if (isAllowed) {
      card.addEventListener('click', () => {
        engine.chooseEventOption(opt.id);
        BasinScene.instance?.setEventWeatherOverride(undefined);
        modalInteractiveEvent.classList.remove('open');
        updateUI();
      });
    }

    eventOptionsContainer.appendChild(card);
  }

  modalInteractiveEvent.classList.add('open');
}

// --- RESOLUCIÓN ESTACIONAL Y FEEDBACK ÁGIL ---
btnResolveSeason.addEventListener('click', () => {
  sound.pop();
  const st = engine.getState();
  if (st.activeInteractiveEvent) {
    showInteractiveEventModal(st.activeInteractiveEvent);
    return;
  }

  // Comprobar objetivo estacional antes de avanzar
  const currentGoal = getCurrentSeasonalGoal();
  let goalSuccess = false;
  if (currentGoal) {
    goalSuccess = checkSeasonalGoal(currentGoal, st);
    if (goalSuccess) {
      st.money += currentGoal.reward.moneyBonus;
      st.publicTrust = Math.min(100, st.publicTrust + currentGoal.reward.trustBonus);
    }
  }

  const prevRes = st.reservoirVolume;
  const prevAqui = st.aquiferVolume;

  const seasonResult = engine.resolveSeason();

  // Mostrar tarjeta ágil de feedback y preparar periódico
  renderAgileSeasonFeedback(seasonResult, currentGoal, goalSuccess, prevRes, prevAqui);
  updateUI();
});

function renderAgileSeasonFeedback(
  res: SeasonResult,
  goal: SeasonalGoal | undefined,
  goalSuccess: boolean,
  prevRes: number,
  prevAqui: number
): void {
  const st = engine.getState();
  const seasonInfo = SEASONS_INFO[res.season];

  // Generar la edición de "El Heraldo del Valle"
  lastNewspaperEdition = generateNewspaperEdition(res);

  fbSeasonTitle.textContent = `¡${seasonInfo.name} Completado! (Año ${res.year})`;

  if (goal && goalSuccess) {
    sound.coin();
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

  const deltaRes = res.balance.reservoirEnd - prevRes;
  const deltaAqui = res.balance.aquiferEnd - prevAqui;

  fbRes.textContent = `${deltaRes >= 0 ? '+' : ''}${deltaRes} 💧`;
  fbRes.style.color = deltaRes >= 0 ? '#38bdf8' : '#f87171';

  fbAqui.textContent = `${deltaAqui >= 0 ? '+' : ''}${deltaAqui} 💧`;
  fbAqui.style.color = deltaAqui >= 0 ? '#10b981' : '#f87171';

  const popSat = Math.round(res.balance.satisfactions.population * 100);
  fbPop.textContent = `${popSat}%`;
  fbPop.style.color = popSat >= 80 ? '#60a5fa' : '#f87171';

  const agriSat = Math.round(res.balance.satisfactions.agriculture * 100);
  fbAgri.textContent = `${agriSat}%`;
  fbAgri.style.color = agriSat >= 80 ? '#34d399' : '#f87171';

  fbHealth.textContent = `${st.basinHealth}%`;
  fbMoney.textContent = `$${st.money}`;

  fbAdviceText.innerHTML = `<strong>Evaluación:</strong> ${res.adviceMessage}`;

  if (st.isYearEndPhase) {
    btnFbContinue.textContent = '📊 Ir al Cierre de Año e Inversiones ➡️';
  } else {
    const nextS = getNextSeason(res.season).nextSeason;
    btnFbContinue.textContent = `Pasar a ${SEASONS_INFO[nextS].name} ${SEASONS_INFO[nextS].icon} ➡️`;
  }

  cardSeasonFeedback.classList.add('open');
}

// Modal de El Heraldo del Valle
function showNewspaperModal(edition: NewspaperEdition | null): void {
  if (!edition) return;
  sound.paperRustle();
  if (newsDate) newsDate.textContent = edition.dateString;
  if (newsMainHeadline) newsMainHeadline.textContent = edition.mainArticle.headline;
  if (newsMainSubhead) newsMainSubhead.textContent = edition.mainArticle.subhead;
  if (newsPhotoEmoji) newsPhotoEmoji.textContent = edition.mainArticle.photoEmoji;
  if (newsMainLead) newsMainLead.textContent = edition.mainArticle.lead;
  if (newsMainQuote) newsMainQuote.textContent = edition.mainArticle.quote;
  if (newsMainAuthor) newsMainAuthor.textContent = edition.mainArticle.author;
  if (newsSideHeadline) newsSideHeadline.textContent = edition.sideArticle.headline;
  if (newsSideLead) newsSideLead.textContent = edition.sideArticle.lead;
  if (newsGossip) newsGossip.textContent = edition.gossipSnippet;
  if (btnNewsContinue) {
    const st = engine.getState();
    btnNewsContinue.textContent = st.isYearEndPhase
      ? '📊 Ir al Cierre de Año e Inversiones ➡️'
      : 'Siguiente Estación ➡️';
  }

  modalNewspaper?.classList.add('open');
}

btnOpenNewspaper?.addEventListener('click', () => {
  showNewspaperModal(lastNewspaperEdition);
});

btnCloseNewspaper?.addEventListener('click', () => {
  sound.pop();
  modalNewspaper?.classList.remove('open');
});

const btnNewsContinue = document.getElementById('btn-news-continue') as HTMLButtonElement | null;
btnNewsContinue?.addEventListener('click', () => {
  sound.pop();
  modalNewspaper?.classList.remove('open');
  cardSeasonFeedback.classList.remove('open');
  const st = engine.getState();

  if (st.isYearEndPhase) {
    showYearEndModal();
  } else {
    engine.advanceToNextTurn();
    recordTurnInitialAllocations();
    updateUI();
  }
});

btnFbContinue.addEventListener('click', () => {
  sound.pop();
  cardSeasonFeedback.classList.remove('open');
  const st = engine.getState();

  if (st.isYearEndPhase) {
    showYearEndModal();
  } else {
    engine.advanceToNextTurn();
    recordTurnInitialAllocations();
    updateUI();
  }
});

// --- MODAL: CIERRE DE AÑO (CONSOLIDACIÓN TRAS EL OTOÑO) ---
function showYearEndModal(): void {
  sound.coin();
  const st = engine.getState();
  const latestYearResult = st.yearHistory[st.yearHistory.length - 1];

  yearendTitle.textContent = `📅 Cierre del Año ${latestYearResult.year} de ${st.maxYears}`;

  yearendPop.textContent = `${Math.round(latestYearResult.avgPopSatisfaction * 100)}%`;
  yearendAgri.textContent = `${Math.round(latestYearResult.avgAgriSatisfaction * 100)}%`;
  yearendMin.textContent = `${Math.round(latestYearResult.avgMinSatisfaction * 100)}%`;
  yearendEco.textContent = `${Math.round(latestYearResult.avgEcoSatisfaction * 100)}%`;

  // Desglose de ingresos
  const popInc = Math.round(latestYearResult.avgPopSatisfaction * 30);
  const agriInc = Math.round(latestYearResult.avgAgriSatisfaction * 40);
  const minInc = Math.round(latestYearResult.avgMinSatisfaction * 35);
  const ecoBonus = latestYearResult.avgEcoSatisfaction >= 0.85 ? 15 : 0;
  const trustBonus = latestYearResult.publicTrust >= 80 ? 15 : 0;
  const maint = 25;

  yearendBreakdown.innerHTML = `
    <div class="year-breakdown-item"><span>Recaudación urbana:</span><strong>+$${popInc}</strong></div>
    <div class="year-breakdown-item"><span>Producción agrícola:</span><strong>+$${agriInc}</strong></div>
    <div class="year-breakdown-item"><span>Regalías mineras:</span><strong>+$${minInc}</strong></div>
    <div class="year-breakdown-item"><span>Bono ecológico:</span><strong>+$${ecoBonus}</strong></div>
    <div class="year-breakdown-item"><span>Bono confianza ciudadana:</span><strong>+$${trustBonus}</strong></div>
    <div class="year-breakdown-item"><span style="color: #f87171;">Mantenimiento de red:</span><strong style="color: #f87171;">-$${maint}</strong></div>
    <div class="year-breakdown-item" style="grid-column: span 2; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 6px; font-weight: 800; color: #fbbf24;">
      <span>Presupuesto neto ganado:</span><span>+$${latestYearResult.budgetEarned} (Total actual: $${st.money})</span>
    </div>
  `;

  if (st.isGameOver) {
    btnYearendContinue.textContent = '🏆 Ver Resultados Finales de la Partida';
  } else {
    btnYearendContinue.textContent = `❄️ Comenzar Año ${st.year + 1}: Invierno ➡️`;
  }

  modalYearEnd.classList.add('open');
}

btnYearendUpgrades.addEventListener('click', () => {
  sound.pop();
  renderUpgradesList();
  modalUpgrades.classList.add('open');
});

btnYearendContinue.addEventListener('click', () => {
  sound.pop();
  modalYearEnd.classList.remove('open');
  const st = engine.getState();

  if (st.isGameOver) {
    showFinalReport();
  } else {
    engine.advanceToNextTurn();
    recordTurnInitialAllocations();
    updateUI();
  }
});

// --- INFORME FINAL (5 AÑOS = 20 TURNOS COMPLETADOS) ---
function showFinalReport(): void {
  const st = engine.getState();
  const yearHistory = st.yearHistory;

  let sumPop = 0;
  let sumAgri = 0;
  let sumMin = 0;
  let sumEco = 0;

  for (const yh of yearHistory) {
    sumPop += yh.avgPopSatisfaction;
    sumAgri += yh.avgAgriSatisfaction;
    sumMin += yh.avgMinSatisfaction;
    sumEco += yh.avgEcoSatisfaction;
  }

  const count = Math.max(1, yearHistory.length);
  const avgPop = Math.round((sumPop / count) * 100);
  const avgAgri = Math.round((sumAgri / count) * 100);
  const avgMin = Math.round((sumMin / count) * 100);
  const avgEco = Math.round((sumEco / count) * 100);

  document.getElementById('fin-pop')!.textContent = `${avgPop}%`;
  document.getElementById('fin-agri')!.textContent = `${avgAgri}%`;
  document.getElementById('fin-min')!.textContent = `${avgMin}%`;
  document.getElementById('fin-eco')!.textContent = `${avgEco}%`;
  document.getElementById('fin-aqui')!.textContent =
    st.aquiferStressLevel === 'HEALTHY' ? 'Saludable y Recargado' : st.aquiferStressLevel === 'STRESSED' ? 'Bajo Estrés' : 'Sobreexplotado Crítico';
  document.getElementById('fin-trust')!.textContent = `${st.publicTrust}%`;
  document.getElementById('fin-seed')!.textContent = st.seed;

  // Títulos y Diplomas Finales Divertidos y Pedagógicos
  let honorIcon = '👑';
  let honorTitleText = 'El Hacedor de Lluvia';
  let honorDescText = 'Equilibrio maestro: lograste abastecer a todos sin sobreexplotar el agua subterránea.';

  const aquiRatio = st.aquiferVolume / st.aquiferCapacity;
  if (aquiRatio < 0.4) {
    honorIcon = '🧛';
    honorTitleText = 'El Vampiro del Acuífero';
    honorDescText = '¡Pleno empleo y campos regados, pero los pozos subterráneos quedaron pidiendo agua por señas!';
  } else if (avgEco >= 88 && avgPop >= 85) {
    honorIcon = '🦫';
    honorTitleText = 'El Susurrador de Carpinchos';
    honorDescText = 'Pipo y las aves del humedal te declaran Protector Oficial del Valle. ¡Río limpio y vida asegurada!';
  } else if (avgAgri >= 90) {
    honorIcon = '🚜';
    honorTitleText = 'El Rey del Tomate Gigante';
    honorDescText = 'Don Jacinto colocó tu foto en el galpón de herramientas: ¡cosecha récord en todo el valle!';
  } else if (avgMin >= 90 && avgPop >= 85) {
    honorIcon = '💎';
    honorTitleText = 'El Magnate de las Cañerías';
    honorDescText = 'Producción récord en la mina y vecinos conformes. La economía regional te agradece de pie.';
  } else if (avgPop < 60) {
    honorIcon = '🪣';
    honorTitleText = 'El Coleccionista de Baldes';
    honorDescText = 'Los vecinos tuvieron que aprender a bañarse en 30 segundos, pero al menos la cuenca sigue en pie.';
  }

  if (finHonorIcon) finHonorIcon.textContent = honorIcon;
  if (finHonorTitle) finHonorTitle.textContent = `"${honorTitleText}"`;
  if (finHonorDesc) finHonorDesc.textContent = honorDescText;

  sound.fanfare();

  confetti({
    particleCount: 140,
    spread: 85,
    origin: { y: 0.6 }
  });

  modalFinalReport.classList.add('open');
}

btnRestart.addEventListener('click', () => {
  modalFinalReport.classList.remove('open');
  if (tutorialModeSetting === 'mandatory') {
    startTutorial();
  } else if (tutorialModeSetting === 'optional') {
    modalWelcome.classList.add('open');
    engine = new SimulationEngine(currentScenario, currentSeed, true);
    recordTurnInitialAllocations();
    updateUI();
  } else {
    exitTutorialToYearOne();
  }
});

// --- GESTIÓN DEL CATÁLOGO DE MEJORAS (3 NIVELES POR OBRA) ---
btnOpenUpgrades.addEventListener('click', () => {
  renderUpgradesList();
  modalUpgrades.classList.add('open');
});

btnCloseUpgrades.addEventListener('click', () => {
  modalUpgrades.classList.remove('open');
});

const tabBtns = document.querySelectorAll('.tab-btn');
tabBtns.forEach((btn) => {
  btn.addEventListener('click', (e) => {
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

  upgradesList.innerHTML = '';

  for (const item of catalog) {
    const currentLevel = state.upgrades[item.id]?.currentLevel || 0;
    const isMax = currentLevel >= item.maxLevel;
    const check = upgSys.canPurchase(item.id, state.upgrades, state.money);

    const card = document.createElement('div');
    card.className = 'upgrade-card';

    let effectsHTML = '';
    for (const eff of item.effects) {
      effectsHTML += `<div>✨ ${eff.description}</div>`;
    }

    card.innerHTML = `
      <div class="upgrade-card-header">
        <div class="upgrade-title">${item.name}</div>
        <div class="upgrade-level-badge">Nivel ${currentLevel} / ${item.maxLevel}</div>
      </div>
      <div class="upgrade-desc">${item.description}</div>
      <div class="upgrade-effects">${effectsHTML}</div>
      <div class="upgrade-footer">
        <div class="upgrade-cost">${isMax ? 'Completado' : `$${check.cost}`}</div>
        <button class="btn-huge-action btn-buy-upgrade" data-id="${item.id}" ${!check.canBuy ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>
          ${isMax ? 'Al Máximo' : 'Realizar Obra'}
        </button>
      </div>
      ${!check.canBuy && !isMax ? `<div style="font-size: 0.78rem; color: #f87171; font-weight: 700;">${check.reason}</div>` : ''}
    `;

    upgradesList.appendChild(card);
  }

  const buyBtns = document.querySelectorAll('.btn-buy-upgrade');
  buyBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const upgId = (e.currentTarget as HTMLElement).getAttribute('data-id');
      if (upgId) {
        const res = engine.purchaseUpgrade(upgId);
        if (res.success) {
          renderUpgradesList();
          updateUI();
        } else {
          alert(res.message);
        }
      }
    });
  });
}

// --- PRONÓSTICO DEL CLIMA (PREVISIÓN ESTACIONAL) ---
btnForecast.addEventListener('click', () => {
  const fc = engine.getState().nextSeasonForecast;
  const fcState = document.getElementById('fc-state')!;
  const fcDesc = document.getElementById('fc-desc')!;
  const fcDrought = document.getElementById('fc-drought')!;
  const fcStorm = document.getElementById('fc-storm')!;
  const fcAccuracyNote = document.getElementById('fc-accuracy-note')!;

  const stateNames: Record<string, string> = {
    VERY_DRY: '☀️ Muy Seco (Alerta de Sequía)',
    DRY: '🌤️ Seco (Bajo régimen de lluvias)',
    NORMAL: '⛅ Clima Típico Estacional',
    WET: '🌧️ Lluvias Abundantes',
    VERY_WET: '⛈️ Tormentas Severas (Riesgo de Crecida)'
  };

  fcState.textContent = stateNames[fc.likelyState] || fc.likelyState;
  fcDesc.textContent = `Previsión hidrometeorológica para la próxima estación.`;
  fcDrought.textContent = fc.droughtRisk;
  fcDrought.style.color = fc.droughtRisk === 'ALTA' ? '#ef4444' : fc.droughtRisk === 'MEDIA' ? '#f59e0b' : '#10b981';

  fcStorm.textContent = fc.stormRisk;
  fcStorm.style.color = fc.stormRisk === 'ALTA' ? '#3b82f6' : fc.stormRisk === 'MEDIA' ? '#06b6d4' : '#94a3b8';

  const accPercent = Math.round(fc.accuracy * 100);
  fcAccuracyNote.innerHTML = `
    💡 <strong>Precisión actual del pronóstico: ${accPercent}%</strong><br/>
    <em>${accPercent >= 80 ? '¡Excelente cobertura de estaciones telemétricas!' : 'Para anticipar el clima con mayor certidumbre, instala o mejora la Estación Meteorológica.'}</em>
  `;

  modalForecast.classList.add('open');
});

btnCloseForecast.addEventListener('click', () => {
  modalForecast.classList.remove('open');
});

// --- MODO AULA ESCOLAR ---
btnClassroom.addEventListener('click', () => {
  inputSeed.value = currentSeed;
  selectScenario.value = currentScenario;
  modalClassroom.classList.add('open');
});

btnCloseClassroom.addEventListener('click', () => {
  modalClassroom.classList.remove('open');
});

btnApplySeed.addEventListener('click', () => {
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
    engine = new SimulationEngine(currentScenario, currentSeed, true);
    recordTurnInitialAllocations();
    updateUI();
  }
});

// --- GUÍA DIDÁCTICA ---
btnHelp.addEventListener('click', () => {
  modalHelp.classList.add('open');
});

btnCloseHelp.addEventListener('click', () => {
  modalHelp.classList.remove('open');
});

// --- FICHA CONTEXTUAL LATERAL AL TOCAR ELEMENTOS DEL MAPA (NO BLOQUEANTE) ---
function handleMapElementClick(elem: MapClickTarget): void {
  const st = engine.getState();

  if (elem === 'dam') {
    ctxIcon.textContent = '🌊';
    ctxTitle.textContent = 'Presa y Embalse';
    ctxSubtitle.textContent = 'Almacenamiento Superficial';
    ctxDesc.textContent =
      'Estructura que retiene los caudales fluviales y el deshielo cordillerano. Permite amortiguar crecidas y almacenar agua para estaciones cálidas o años de escasez.';
    ctxStats.innerHTML = `
      <div>• <strong>Volumen almacenado:</strong> ${st.reservoirVolume} / ${st.reservoirCapacity} 💧 (${Math.round((st.reservoirVolume / st.reservoirCapacity) * 100)}%)</div>
      <div>• <strong>Evaporación estacional:</strong> Mayor en verano con altas temperaturas.</div>
    `;
    ctxPedagogy.innerHTML = '💡 <em>La ampliación del embalse y el mantenimiento preventivo aumentan la resiliencia ante sequías.</em>';
  } else if (elem === 'aquifer') {
    ctxIcon.textContent = '💧';
    ctxTitle.textContent = 'Acuífero Subterráneo';
    ctxSubtitle.textContent = 'Reserva Hídrica Profunda';
    ctxDesc.textContent =
      'El agua subterránea no forma ríos ni cavernas huecas, sino que se aloja entre los poros microscópicos y fisuras de rocas, arenas y sedimentos. Se recarga lentamente por infiltración de lluvias.';
    ctxStats.innerHTML = `
      <div>• <strong>Agua en almacenamiento:</strong> ${st.aquiferVolume} / ${st.aquiferCapacity} 💧 (${Math.round((st.aquiferVolume / st.aquiferCapacity) * 100)}%)</div>
      <div>• <strong>Estado del reservorio:</strong> ${st.aquiferStressLevel === 'HEALTHY' ? 'Saludable' : st.aquiferStressLevel === 'STRESSED' ? 'En tensión' : 'Sobregiro Crítico'}</div>
    `;
    ctxPedagogy.innerHTML = '💡 <em>Bombear más de lo que se recarga anualmente conduce a pozos secos y subsidencia del suelo.</em>';
  } else if (elem === 'mountain') {
    ctxIcon.textContent = '🏔️';
    ctxTitle.textContent = 'Cordillera y Cumbres';
    ctxSubtitle.textContent = 'Manto Nival de Altura';
    ctxDesc.textContent =
      'Cabecera de la cuenca hidrográfica donde las precipitaciones invernales caen en forma de nieve y se conservan como reserva sólida.';
    ctxStats.innerHTML = `
      <div>• <strong>Manto de nieve actual:</strong> ${st.snowReserve} 💧</div>
      <div>• <strong>Dinámica estacional:</strong> Acumula en invierno y libera agua en primavera mediante el deshielo.</div>
    `;
    ctxPedagogy.innerHTML = '💡 <em>La nieve actúa como un reservorio natural gratuito de alta montaña.</em>';
  } else if (elem === 'river') {
    ctxIcon.textContent = '🏞️';
    ctxTitle.textContent = 'Río Principal';
    ctxSubtitle.textContent = 'Red Hídrica de la Cuenca';
    ctxDesc.textContent =
      'Transporta los caudales generados por lluvia y deshielo a través del valle, conectando a todos los usuarios y ecosistemas.';
    ctxStats.innerHTML = `
      <div>• <strong>Agua disponible este turno:</strong> ${st.availableWater} 💧</div>
      <div>• <strong>Calidad química y biológica:</strong> ${st.waterQuality}/100</div>
    `;
    ctxPedagogy.innerHTML = '💡 <em>Cualquier contaminante arrojado aguas arriba afecta a todos los usuarios aguas abajo.</em>';
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
}

btnCloseContextual.addEventListener('click', () => {
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
  sound.toggleMute();
  updateSoundButtonLabel();
});
updateSoundButtonLabel();

// --- ARRANQUE INICIAL ---
recordTurnInitialAllocations();
const selectTutInit = document.getElementById('select-tutorial-mode') as HTMLSelectElement | null;
if (selectTutInit) {
  tutorialModeSetting = (selectTutInit.value as any) || 'optional';
}

if (tutorialModeSetting === 'mandatory') {
  startTutorial();
} else if (tutorialModeSetting === 'disabled') {
  modalWelcome.classList.remove('open');
  exitTutorialToYearOne();
} else {
  modalWelcome.classList.add('open');
  updateUI();
}
