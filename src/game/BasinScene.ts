import Phaser from 'phaser';
import { GameState } from '../models/GameState';
import { SectorId } from '../models/Sector';
import { SeasonType } from '../models/Season';
import type { SeasonWaterBalance } from '../models/Balance';
import upgradesCatalog from '../data/upgrades.json';
import { getMapResultStory } from './MapResultStories';
import { editorialSeed } from './EditorialSession';

export type MapClickTarget = SectorId | 'dam' | 'aquifer' | 'mountain' | 'river';

interface WaterParticle {
  progress: number; // 0.0 to 1.0 along the path
  speed: number;
  size: number;
}

interface InfiltrationDroplet {
  x: number;
  y: number;
  speed: number;
  alpha: number;
}

/**
 * Escena gráfica interactiva en Phaser 3 estilo Diorama Educativo.
 * El agua es la protagonista visual: cauce ancho, ramificaciones con partículas
 * reactivas a la asignación real, retornos visibles y ciclo hídrico perceptible.
 */
export class BasinScene extends Phaser.Scene {
  public static initialGameState?: GameState;
  public static editorialSession = 0;
  public static initialDecisionPreview?: SeasonWaterBalance;
  public static onSelectSectorCallback?: (target: MapClickTarget) => void;
  public static instance?: BasinScene;

  private gameState?: GameState;
  private decisionPreview?: SeasonWaterBalance;

  // Capas gráficas
  private skyLayer!: Phaser.GameObjects.Graphics;
  private terrainGraphics!: Phaser.GameObjects.Graphics;
  private aquiferGraphics!: Phaser.GameObjects.Graphics;
  private riverBedGraphics!: Phaser.GameObjects.Graphics;
  private canalsGraphics!: Phaser.GameObjects.Graphics;
  private reservoirGraphics!: Phaser.GameObjects.Graphics;
  private infrastructureGraphics!: Phaser.GameObjects.Graphics;
  private waterFlowGraphics!: Phaser.GameObjects.Graphics;
  private weatherFXGraphics!: Phaser.GameObjects.Graphics;

  // Etiquetas persistentes
  private damLabelText?: Phaser.GameObjects.Text;
  private riverFlowLabelText?: Phaser.GameObjects.Text;

  // Partículas y dinámicas visuales
  private clouds: { x: number; y: number; speed: number; scale: number; alpha: number }[] = [];
  private rainDrops: { x: number; y: number; speed: number; len: number }[] = [];
  private snowFlakes: { x: number; y: number; speed: number; sway: number }[] = [];
  private birds: { x: number; y: number; speed: number; baseY: number; phase: number }[] = [];
  private vaporWisps: { x: number; y: number; speed: number; alpha: number }[] = [];
  private infiltrationDroplets: InfiltrationDroplet[] = [];

  // Partículas para cada ramal de distribución (0 a 1 de progreso en su trayecto)
  private particlesCity: WaterParticle[] = [];
  private particlesAgri: WaterParticle[] = [];
  private particlesLive: WaterParticle[] = [];
  private particlesMine: WaterParticle[] = [];
  private particlesEco: WaterParticle[] = [];

  // Partículas de retorno
  private particlesReturnCity: WaterParticle[] = [];
  private particlesRecircMine: WaterParticle[] = [];

  private animTimer: number = 0;
  // Sólo presentación: rutas fijas y fases de reloj, sin PRNG de gameplay.
  private visibleFlows: { points: Phaser.Math.Vector2[]; amount: number; color: number }[] = [];
  private onSelectSector?: (target: MapClickTarget) => void;

  // Efecto visual previo a eventos climáticos
  private eventWeatherOverride?: 'STORM' | 'DROUGHT' | 'BLIZZARD';

  // Rastreo de valores primitivos renderizados para cambio de estación, clima y reservas
  private lastRenderedSeason?: SeasonType;
  private lastRenderedClimate?: string;
  private lastRenderedYear?: number;
  private lastRenderedSnow?: number;
  private lastRenderedReservoir?: number;
  private lastRenderedAquifer?: number;
  private lastRenderedQuality?: number;
  private lastRenderedHealth?: number;
  private lastRenderedUpgrades?: string;
  private mapZones: Phaser.GameObjects.Zone[] = [];
  private builtWorks = new Map<string, Phaser.GameObjects.Graphics>();
  private reactionText?: Phaser.GameObjects.Text;
  private resultActivityGraphics?: Phaser.GameObjects.Graphics;
  private resultActivityLabel?: Phaser.GameObjects.Text;
  private resolvedCoverage?: Partial<Record<SectorId, number>>;
  private resolvedRiverHealthy = false;
  private reactionTurn = 0;
  private reactionVisibleMs = 0;
  private resultReactions: { sector: SectorId; text: string }[] = [];
  private resultReactionCards: { sector: SectorId; title: string; text: string }[] = [];
  private resultSceneVariants: Partial<Record<SectorId, number>> = {};
  private waterReplay?: {
    balance: SeasonWaterBalance;
    phases: ('evaporation' | 'recharge' | 'pumping' | 'returns')[];
    started: number;
    reduced: boolean;
    graphics: Phaser.GameObjects.Graphics;
    label: HTMLDivElement;
    onComplete?: () => void;
  };

  /** Presentación del balance resuelto: no calcula agua ni modifica el estado. */
  public replaySeasonWater(balance: SeasonWaterBalance, onComplete?: () => void): void {
    this.clearWaterReplay();
    const phases: NonNullable<BasinScene['waterReplay']>['phases'] = [];
    if (balance.reservoirEvaporation > 0) phases.push('evaporation');
    if (balance.aquiferNaturalRecharge + balance.aquiferArtificialRecharge + balance.aquiferRiverRecharge > 0) phases.push('recharge');
    if (balance.aquiferWithdrawal > 0) phases.push('pumping');
    if (['population', 'agriculture', 'livestock', 'mining'].some(id => balance.returns[id as SectorId] > 0)) phases.push('returns');
    if (!phases.length) { onComplete?.(); return; }
    const label = document.createElement('div');
    label.className = 'water-replay-label';
    label.setAttribute('role', 'status');
    label.setAttribute('aria-live', 'polite');
    document.getElementById('app')!.append(label);
    document.getElementById('card-season-feedback')?.classList.add('water-replay-active');
    this.waterReplay = { balance, phases, started: this.time.now,
      reduced: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      graphics: this.add.graphics().setDepth(4), label, onComplete };
    this.drawWaterReplay();
  }

  public clearWaterReplay(): void {
    this.waterReplay?.graphics.destroy();
    this.waterReplay?.label.remove();
    this.waterReplay = undefined;
    document.getElementById('card-season-feedback')?.classList.remove('water-replay-active');
  }

  private drawWaterReplay(): void {
    const replay = this.waterReplay;
    if (!replay) return;
    const elapsed = this.time.now - replay.started;
    // Hasta cuatro movimientos: 2,8 s en total, o 1,4 s con flechas estáticas.
    const phaseDuration = replay.reduced ? 350 : 700;
    const phaseIndex = Math.floor(elapsed / phaseDuration);
    if (phaseIndex >= replay.phases.length) {
      this.clearWaterReplay();
      replay.onComplete?.();
      return;
    }
    const phase = replay.phases[phaseIndex];
    const b = replay.balance;
    const { width, height, top } = this.getMapLayout();
    const compact = width <= 640;
    document.getElementById('card-season-feedback')?.style.setProperty('--water-replay-top',
      `${(document.querySelector('.top-bar')?.getBoundingClientRect().bottom ?? 0) + 8}px`);
    const g = replay.graphics.clear().setY(top);
    const progress = replay.reduced ? 0.6 : (elapsed % phaseDuration) / phaseDuration;
    // Gotas estáticas con reduced motion; gotas en movimiento en los demás casos.
    const flow = (points: number[][], color: number) => {
      const path = new Phaser.Curves.Spline(points.map(([x, y]) => new Phaser.Math.Vector2(width * x, height * y)));
      g.lineStyle(3, color, 0.65).strokePoints(path.getPoints(24), false);
      for (let i = 0; i < 3; i++) {
        const p = path.getPoint(((replay.reduced ? 0.15 : progress) + i / 3) % 1);
        g.fillStyle(color, 0.7).fillCircle(p.x, p.y, 2);
      }
      const end = path.getPoint(1);
      g.lineStyle(2, color, 0.6).strokeEllipse(end.x, end.y, 20, 8);
    };
    let text = '', x = 0.68, y = 0.16;
    if (phase === 'evaporation') {
      // Sólo evaporación registrada del embalse, nunca su variación neta o sus entregas.
      flow([[0.68, 0.25], [0.69, 0.22], [0.68, 0.19]], 0xe8dfbe);
      text = `Evaporación · ${b.reservoirEvaporation} 💧 al aire`;
      if (compact) { x = 0.27; y = 0.27; }
    } else if (phase === 'recharge') {
      if (b.aquiferNaturalRecharge + b.aquiferArtificialRecharge > 0) flow([[0.72, 0.85], [0.72, 0.91], [0.72, 0.96]], 0x8edfd1);
      if (b.aquiferRiverRecharge > 0) flow([[0.27, 0.57], [0.43, 0.81], [0.72, 0.96]], 0x38bdf8);
      text = `Recarga · ${b.aquiferNaturalRecharge + b.aquiferArtificialRecharge + b.aquiferRiverRecharge} 💧 al acuífero${b.aquiferRiverRecharge ? ` (${b.aquiferRiverRecharge} del río)` : ''}`;
      x = 0.60; y = 0.82;
      if (compact) { x = 0.35; y = 0.87; }
    } else if (phase === 'pumping') {
      flow([[0.80, 0.96], [0.80, 0.91], [0.80, 0.87], [0.72, 0.87], [0.65, 0.87]], 0xa6e4ef);
      text = `Bombeo · ${b.aquiferWithdrawal} 💧 a la red`;
      x = 0.72; y = 0.82;
      if (compact) { x = 0.35; y = 0.87; }
    } else {
      const routes: [SectorId, number[][]][] = [
        ['mining', [[0.51, 0.39], [0.40, 0.41], [0.29, 0.43]]],
        ['population', [[0.48, 0.53], [0.38, 0.54], [0.27, 0.57]]],
        ['agriculture', [[0.44, 0.67], [0.35, 0.69], [0.25, 0.71]]],
        ['livestock', [[0.49, 0.81], [0.39, 0.82], [0.29, 0.85]]]
      ];
      let total = 0, lowestQuality = 100;
      for (const [id, points] of routes) {
        if (b.returns[id] <= 0) continue;
        total += b.returns[id];
        const quality = b.returnQualities[id];
        lowestQuality = Math.min(lowestQuality, quality);
        flow(points, quality < 45 ? 0xc69868 : quality < 70 ? 0xb6bb83 : 0x85d5df);
      }
      text = `Retornos · ${total} 💧 al río\n${lowestQuality < 45 ? 'Incluye calidad baja' : lowestQuality < 70 ? 'Incluye calidad intermedia' : 'Calidad buena'}`;
      x = 0.38; y = 0.91;
      if (compact) { x = 0.73; y = 0.84; }
    }
    if (replay.label.textContent !== text) replay.label.textContent = text;
    // Etiqueta efímera, fuera de las compuertas y de los controles inferiores.
    const labelWidth = replay.label.offsetWidth;
    replay.label.style.left = `${Math.max(8, Math.min(width - labelWidth - 8, width * x - labelWidth / 2))}px`;
    replay.label.style.top = `${top + height * y}px`;
  }

  // Posiciones propias de las obras: no desplazan sectores, canales ni compuertas.
  private getWorkAnchor(tag: string): { x: number; y: number; scale: number } {
    const { width, height, top } = this.getMapLayout();
    const scale = Math.min(1, width / 850);
    const positions: Record<string, [number, number, number, number]> = {
      dam_expanded: [0.68, 0.29, 0, 0],
      rain_catchment: [0.44, 0.40, 0, 0],
      aquifer_well: [0.72, 0.92, 0, -8],
      clean_canals: [0.585, 0.63, 0, 0],
      drip_irrigation: [0.49, 0.63, 0, 0],
      urban_pipes: [0.52, 0.48, 64, -20],
      water_treatment: [0.42, 0.55, 0, 0],
      mining_recycle: [0.54, 0.35, 48, 20],
      river_forest: [0.29, 0.88, -42, -18],
      weather_station: [0.75, 0.20, 0, 0]
    };
    const [x, y, dx, dy] = positions[tag];
    return { x: width * x + dx * scale, y: top + height * y + dy * scale, scale };
  }

  /** Sólo se llama después de una compra exitosa; ningún efecto consume PRNG. */
  public celebrateUpgrade(visualTag: string): void {
    const work = this.builtWorks.get(visualTag);
    if (!work || !work.visible) return;
    const { x, y, scale } = this.getWorkAnchor(visualTag);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.tweens.killTweensOf(work);
    work.setPosition(x, y + (reducedMotion ? 0 : 10 * scale)).setScale(scale * (reducedMotion ? 1 : 0.72)).setAlpha(0.3);
    this.tweens.add({ targets: work, y, scaleX: scale, scaleY: scale, alpha: 1,
      duration: reducedMotion ? 200 : 650, ease: 'Back.Out' });

    const pulse = this.add.graphics().setPosition(x, y).setScale(scale).setDepth(4);
    const vegetation = visualTag === 'river_forest' || visualTag === 'rain_catchment';
    pulse.lineStyle(2, vegetation ? 0xb7e896 : 0xd4f3ec, 0.9);
    pulse.strokeEllipse(0, 5, 68, 30);
    if (!reducedMotion) {
      // Pequeños destellos situados, con distribución fija, sin confeti.
      for (const [dx, dy] of [[-25, -10], [0, -25], [25, -10]]) {
        pulse.lineBetween(dx - 3, dy, dx + 3, dy);
        pulse.lineBetween(dx, dy - 3, dx, dy + 3);
      }
    }
    this.tweens.add({ targets: pulse, alpha: 0, scaleX: scale * 1.5, scaleY: scale * 1.5,
      duration: reducedMotion ? 250 : 1100, ease: 'Sine.Out', onComplete: () => pulse.destroy() });
  }

  private renderBuiltWorks(): void {
    if (!this.gameState) return;
    for (const item of upgradesCatalog) {
      const level = this.gameState.upgrades[item.id]?.currentLevel ?? 0;
      let g = this.builtWorks.get(item.visualTag);
      if (!g) {
        g = this.add.graphics().setDepth(1);
        this.builtWorks.set(item.visualTag, g);
      }
      g.clear().setVisible(level > 0);
      if (!level) { this.tweens.killTweensOf(g); continue; }
      const { x, y, scale } = this.getWorkAnchor(item.visualTag);
      // Al redibujar durante una animación conservar su aparición; después ajustar al viewport.
      if (!this.tweens.isTweening(g)) g.setPosition(x, y).setScale(scale).setAlpha(1);
      this.drawBuiltWork(g, item.visualTag, level);
    }
  }

  private drawBuiltWork(g: Phaser.GameObjects.Graphics, tag: string, level: number): void {
    const tank = (x: number, y: number, radius: number) => {
      g.fillStyle(0x466775); g.fillEllipse(x + 2, y + 5, radius * 2 + 6, radius + 8);
      g.fillStyle(0xe0e5cf); g.fillEllipse(x, y, radius * 2 + 5, radius + 6);
      g.fillStyle(0x3a9fae); g.fillEllipse(x, y, radius * 2 - 3, radius - 1);
      g.lineStyle(2, 0xa8e4e5); g.lineBetween(x - radius / 2, y, x + radius / 2, y);
    };
    switch (tag) {
      case 'dam_expanded': {
        const w = this.scale.width * 0.078 / Math.min(1, this.scale.width / 850) + 10 + level * 5;
        g.fillStyle(0x40534f, 0.45); g.fillRect(-w / 2 + 3, 0, w, 18);
        g.fillStyle(0xb5c6ba); g.fillRect(-w / 2, -7, w, 18);
        g.fillStyle(0xf1ebce); g.fillRect(-w / 2, -7, w, 5);
        for (let i = 0; i < 4 + level; i++) {
          const x = -w / 2 + 5 + i * (w - 10) / (3 + level);
          g.fillStyle(0x7e968b); g.fillTriangle(x - 3, 11, x, -2, x + 5, 11);
        }
        break;
      }
      case 'rain_catchment':
        g.fillStyle(0x537d4d); g.fillRoundedRect(-24, -10, 48, 22, 9);
        g.fillStyle(0x94b978); g.fillRoundedRect(-20, -7, 40, 16, 7);
        g.fillStyle(0x4ba6b1); g.fillEllipse(0, 1, 27, 10);
        g.lineStyle(4, 0x728e57); g.lineBetween(-28, -22, -12, -8);
        g.lineStyle(2, 0xa4d0a3); g.lineBetween(-28, -22, -12, -8);
        for (const x of [-17, 17]) { g.fillStyle(0x3d7048); g.fillCircle(x, -4, 5); }
        for (let i = 1; i < level; i++) {
          g.fillStyle(0x94b978); g.fillRoundedRect(-20 + (i - 1) * 22, 15, 19, 12, 4);
          g.fillStyle(0x4ba6b1); g.fillEllipse(-11 + (i - 1) * 22, 20, 13, 6);
        }
        break;
      case 'aquifer_well':
        g.fillStyle(0xc5bca1); g.fillEllipse(0, -2, 48 + level * 4, 14);
        g.fillStyle(0x647a75); g.fillEllipse(0, -2, 36 + level * 4, 8);
        g.lineStyle(5, 0xdce4cd); g.lineBetween(0, -3, 0, 29);
        g.lineStyle(2, 0x61c7d5); g.lineBetween(0, 0, 0, 29);
        g.fillStyle(0xc5d4c5); g.fillRect(-10, -16, 20, 12);
        g.fillStyle(0x39a9b8); g.fillEllipse(0, -16, 20, 7);
        for (let i = 0; i < level; i++) { g.fillStyle(0x88c9c2); g.fillCircle(9 + i * 8, 23, 2); }
        for (let i = 1; i < level; i++) tank(-29 + (i - 1) * 55, -6, 10);
        break;
      case 'clean_canals': {
        // Revestimiento sobre el ramal agrícola existente, sin crear otra ruta de agua.
        const half = this.scale.width * 0.045 / Math.min(1, this.scale.width / 850);
        g.lineStyle(16, 0x49625d, 0.4); g.lineBetween(-half, 3, half, 3);
        g.lineStyle(13, 0xe0dcc5); g.lineBetween(-half, 0, half, 0);
        const supplied = this.decisionPreview?.suppliedAllocations.agriculture ?? this.gameState?.sectors.agriculture.allocated ?? 0;
        g.lineStyle(7, supplied > 0 ? 0x438fa0 : 0x526f6c); g.lineBetween(-half, 0, half, 0);
        for (let i = 0; i < 3 + level; i++) {
          const x = -half + 6 + i * (2 * half - 12) / (2 + level);
          g.lineStyle(1, 0x708c83); g.lineBetween(x, -6, x, -3);
        }
        for (let i = 1; i < level; i++) {
          g.fillStyle(0xb5c6ba); g.fillRoundedRect(-20 + (i - 1) * 27, -19, 20, 9, 2);
          g.fillStyle(0x708c83); g.fillRect(-17 + (i - 1) * 27, -17, 14, 4);
        }
        break;
      }
      case 'drip_irrigation':
        for (const y of [-12, 2, 12]) {
          g.lineStyle(2.5, 0x244d52); g.lineBetween(-62, y, 58, y);
          for (let x = -54; x < 58; x += 16) { g.fillStyle(0x9cdee4); g.fillCircle(x, y, 2); }
        }
        for (const x of [-35, 38]) {
          g.lineStyle(3, 0xe0e5d5); g.lineBetween(x, 1, x, -14);
          g.lineStyle(2, 0x90dbe4, 0.9); g.strokeEllipse(x, -14, 22, 9);
        }
        if (level > 1) { g.fillStyle(0xf1d675); g.fillRect(64, -18, 7, 10); }
        if (level >= 3) {
          this.drawIsometricBuilding(g, 65, 8, 13, 16, 0xe0e5cf, 0x7d9e8b, 0x53a79a);
          g.fillStyle(0x90dbe4); g.fillRect(65, -3, 9, 6);
        }
        break;
      case 'urban_pipes':
        g.lineStyle(4, 0xd2e3d4); g.lineBetween(0, 8, 0, 42); g.lineBetween(0, 42, -46, 42);
        g.lineStyle(2, 0x4bafbd); g.lineBetween(0, 8, 0, 42); g.lineBetween(0, 42, -46, 42);
        g.lineStyle(3, 0x465c63); g.lineBetween(-8, 5, -11, 36); g.lineBetween(8, 5, 11, 36);
        g.lineBetween(-8, 17, 8, 29); g.lineBetween(8, 17, -8, 29);
        tank(0, 0, 14 + level * 2);
        g.fillStyle(0xe2e6cf); g.fillEllipse(0, -7, 28 + level * 4, 10);
        for (let i = 1; i < level; i++) {
          // Al costado de la torre, fuera de la compuerta y de los cultivos.
          this.drawIsometricBuilding(g, 100 + (i - 1) * 19, -20, 14, 15, 0xe0e5cf, 0x7d9e8b, 0x53a79a);
        }
        break;
      case 'water_treatment':
        // Piletas de tratamiento a nivel del suelo, distintas de la torre de agua.
        g.fillStyle(0x688276); g.fillRoundedRect(-42, -16, 92, 42, 5);
        this.drawIsometricBuilding(g, -47, -19, 17, 18, 0xe0e5cf, 0x7d9e8b, 0x53a79a);
        for (let i = 0; i < level + 1; i++) {
          const x = -30 + i * 19;
          g.fillStyle(0xdce2ce); g.fillRect(x, -10, 16, 28);
          g.fillStyle(i === 0 ? 0x647e81 : 0x3a9fae); g.fillRect(x + 2, -7, 12, 22);
          g.lineStyle(1, 0xa8d7d5); g.lineBetween(x + 3, 5, x + 12, 5);
        }
        g.lineStyle(3, 0xcce5d6); g.lineBetween(-37, 10, -50, 18);
        break;
      case 'mining_recycle':
        g.lineStyle(5, 0xc5d4cb); g.strokeRoundedRect(-27, -19, 51, 35, 9);
        g.lineStyle(2, 0x46b3c1); g.strokeRoundedRect(-27, -19, 51, 35, 9);
        tank(7, -2, 15 + level * 2);
        g.fillStyle(0xe1ba64); g.fillRect(-32, -8, 11, 13);
        g.fillStyle(0x4a626c); g.fillCircle(-27, -2, 3);
        g.fillStyle(0xb1e5e0); g.fillTriangle(-7, 13, -13, 10, -13, 16);
        for (let i = 1; i < level; i++) tank(-13 + (i - 1) * 24, -30, 9);
        break;
      case 'river_forest':
        g.fillStyle(0x638b52, 0.8); g.fillEllipse(0, 4, 66, 24);
        for (const [x, y] of [[-22, -6], [0, -13], [23, 0]]) {
          g.fillStyle(0x765639); g.fillRect(x - 2, y - 1, 4, 16);
          g.fillStyle(0x3d7651); g.fillCircle(x, y - 9, 12);
          g.fillStyle(0x92c879); g.fillCircle(x - 3, y - 13, 7);
        }
        for (const x of [-12, 10, 30]) {
          g.lineStyle(2, 0xc1d18a); g.lineBetween(x, 14, x + 2, 1);
          g.fillStyle(0x9d794b); g.fillRect(x + 1, -1, 3, 6);
        }
        break;
      case 'weather_station':
        g.fillStyle(0x667b6c, 0.5); g.fillEllipse(0, 12, 42, 14);
        g.lineStyle(3, 0xe5e8db); g.lineBetween(0, -28, -12, 12); g.lineBetween(0, -28, 12, 12);
        g.lineStyle(2, 0xc2d1cb); g.lineBetween(-7, -5, 7, 5); g.lineBetween(7, -5, -7, 5);
        g.fillStyle(0xe07d61); g.fillRect(-3, -30, 6, 16);
        g.lineStyle(2, 0xf3ead1); g.lineBetween(-13, -32, 13, -32);
        for (const x of [-13, 0, 13]) { g.fillStyle(0xe8e8d3); g.fillCircle(x, -33, 4); }
        this.drawIsometricBuilding(g, 15, -1, 15, 14, 0xe7e4cd, 0x97ae9d, 0xcedccb);
        if (level > 1) { g.fillStyle(0x72b9c9); g.fillEllipse(19, -22, 20, 13); }
        if (level >= 3) {
          g.lineStyle(2, 0xe5e8db); g.lineBetween(-22, 7, -22, -20);
          g.fillStyle(0x72b9c9); g.fillRoundedRect(-31, -23, 18, 11, 2);
          g.lineStyle(1, 0xc2d1cb); g.lineBetween(-25, -23, -25, -12); g.lineBetween(-19, -23, -19, -12);
        }
        break;
    }
  }

  public getMapLayout(): { width: number; height: number; top: number } {
    const panelHeight = (document.querySelector('.allocation-panel') as HTMLElement | null)?.offsetHeight ?? 165;
    const compact = this.scale.width <= 640 && !document.getElementById('app')?.classList.contains('tutorial-active');
    const top = compact ? (document.querySelector('.top-bar')?.getBoundingClientRect().bottom ?? 0) + 64 : 0;
    return { width: this.scale.width, height: Math.max(300, this.scale.height - panelHeight - 10 - top), top };
  }

  public getMapAnchor(target: MapClickTarget): { x: number; y: number } {
    const positions: Record<MapClickTarget, [number, number]> = {
      mountain: [0.40, 0.16], dam: [0.68, 0.26], river: [0.28, 0.53],
      population: [0.52, 0.48], agriculture: [0.49, 0.63], mining: [0.54, 0.35],
      livestock: [0.54, 0.77], ecosystem: [0.29, 0.88], aquifer: [0.80, 0.94], reserve: [0.80, 0.94]
    };
    const { height: effectiveHeight, top } = this.getMapLayout();
    const [x, y] = positions[target];
    return { x: this.scale.width * x, y: top + effectiveHeight * y };
  }

  public getIntakeAnchor(id: SectorId): { x: number; y: number } {
    const positions: Partial<Record<SectorId, [number, number]>> = {
      population: [0.63, 0.48], agriculture: [0.63, 0.63], mining: [0.63, 0.35], livestock: [0.63, 0.77]
    };
    const [baseX, y] = positions[id] ?? [0.41, 0.74];
    const x = baseX;
    const layout = this.getMapLayout();
    return { x: layout.width * x, y: layout.top + layout.height * y };
  }

  constructor() {
    super({ key: 'BasinScene' });
  }

  public init(data: any) {
    BasinScene.instance = this;
    this.gameState = data?.gameState || BasinScene.initialGameState;
    this.decisionPreview = BasinScene.initialDecisionPreview;
    this.onSelectSector = data?.onSelectSector || BasinScene.onSelectSectorCallback;
  }

  public updateGameState(newState: GameState, preview?: SeasonWaterBalance): void {
    if (newState.turn < this.reactionTurn || (this.gameState !== newState && newState.turn === 1)) {
      this.resultReactions = [];
      this.resultReactionCards = [];
      this.resolvedCoverage = undefined;
      this.resultActivityLabel?.setVisible(false);
      this.reactionTurn = 0;
      this.reactionText?.setVisible(false);
    }
    if (!newState.isSeasonResolved) {
      this.clearWaterReplay();
      this.reactionText?.setVisible(false);
    }
    this.gameState = newState;
    this.decisionPreview = preview;
    if (newState.isSeasonResolved && newState.turn !== this.reactionTurn) this.prepareResultReactions(newState);
    if (!newState.isSeasonResolved && newState.seasonHistory.at(-1)?.turn !== this.reactionTurn
      && newState.seasonHistory.length) this.prepareResultReactions(newState);
    if (!this.skyLayer) return;

    // Redibujar todo el diorama si hubo cambio de estación, clima, año o reservas base
    const isMajorChange =
      this.lastRenderedSeason === undefined ||
      this.lastRenderedSeason !== newState.season ||
      this.lastRenderedClimate !== newState.climateState ||
      this.lastRenderedYear !== newState.year ||
      this.lastRenderedSnow !== newState.snowReserve ||
      this.lastRenderedReservoir !== newState.reservoirVolume ||
      this.lastRenderedAquifer !== newState.aquiferVolume ||
      this.lastRenderedQuality !== newState.waterQuality ||
      this.lastRenderedHealth !== newState.basinHealth ||
      this.lastRenderedUpgrades !== JSON.stringify(newState.upgrades);

    if (isMajorChange) {
      this.renderBasin();
    } else {
      // Cambio de asignación: refrescar los flujos del preview y las tomas.
      this.updateCanalsOnly();
    }
  }

  public updateCanalsOnly(): void {
    if (!this.gameState || !this.canalsGraphics) return;
    const { width, height } = this.scale;
    const { height: effectiveH, top } = this.getMapLayout();
    for (const layer of [this.skyLayer, this.terrainGraphics, this.aquiferGraphics, this.riverBedGraphics,
      this.canalsGraphics, this.reservoirGraphics, this.infrastructureGraphics, this.waterFlowGraphics, this.weatherFXGraphics]) {
      layer.setY(top);
    }
    this.renderMainRiverBed(width, effectiveH);
    this.renderDioramaReservoir(width, effectiveH);
    this.renderCanalsAndIntakes(width, effectiveH);
    this.renderDioramaInfrastructure(width, effectiveH);
    this.renderBuiltWorks();
  }

  public setEventWeatherOverride(override?: 'STORM' | 'DROUGHT' | 'BLIZZARD'): void {
    this.eventWeatherOverride = override;
    if (this.skyLayer) {
      this.renderBasin();
    }
  }

  create(): void {
    BasinScene.instance = this;
    this.events.once('shutdown', () => {
      this.clearWaterReplay();
      this.reactionText?.destroy();
      this.reactionText = undefined;
      this.resultActivityGraphics?.destroy();
      this.resultActivityGraphics = undefined;
      this.resultActivityLabel?.destroy();
      this.resultActivityLabel = undefined;
      this.resolvedCoverage = undefined;
      this.resultReactions = [];
      this.resultReactionCards = [];
    });
    if (!this.gameState && BasinScene.initialGameState) {
      this.gameState = BasinScene.initialGameState;
    }
    if (!this.onSelectSector && BasinScene.onSelectSectorCallback) {
      this.onSelectSector = BasinScene.onSelectSectorCallback;
    }

    const { width, height } = this.scale;

    // Crear capas en orden de profundidad
    this.skyLayer = this.add.graphics();
    this.terrainGraphics = this.add.graphics();
    this.aquiferGraphics = this.add.graphics();
    this.riverBedGraphics = this.add.graphics();
    this.canalsGraphics = this.add.graphics();
    this.reservoirGraphics = this.add.graphics();
    this.infrastructureGraphics = this.add.graphics();
    this.waterFlowGraphics = this.add.graphics().setDepth(2);
    this.weatherFXGraphics = this.add.graphics();

    // Textos informativos integrados en el diorama
    this.damLabelText = this.add.text(width * 0.32, height * 0.28, '🌊 Embalse: 65%', {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '11px',
      color: '#38bdf8',
      fontStyle: 'bold',
      backgroundColor: 'rgba(15, 23, 42, 0.85)',
      padding: { x: 8, y: 4 }
    }).setOrigin(0.5);

    this.riverFlowLabelText = this.add.text(width * 0.44, height * 0.54, '💧 Río principal', {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '10px',
      color: '#bae6fd',
      fontStyle: 'bold',
      backgroundColor: 'rgba(2, 132, 199, 0.85)',
      padding: { x: 6, y: 3 }
    }).setOrigin(0.5);

    this.damLabelText.setVisible(false); // El nodo HTML accesible ofrece volumen y regulación.
    this.riverFlowLabelText.setVisible(false);
    // Inicializar grupos de partículas fluidas
    this.initWaterParticles();
    this.initAtmosphereParticles(width, height);

    if (this.gameState) {
      if (this.gameState.isSeasonResolved || this.gameState.seasonHistory.length) this.prepareResultReactions(this.gameState);
      this.renderBasin();
    }

    let resizeTimer: number;
    this.scale.on('resize', () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        if (this.gameState) this.renderBasin();
      }, 150);
    }, this);
  }

  private initWaterParticles(): void {
    const createParticles = (count: number): WaterParticle[] => {
      const arr: WaterParticle[] = [];
      for (let i = 0; i < count; i++) {
        arr.push({
          progress: Math.random(),
          speed: 0.006 + Math.random() * 0.005,
          size: 3 + Math.random() * 2
        });
      }
      return arr;
    };

    this.particlesCity = createParticles(6);
    this.particlesAgri = createParticles(8);
    this.particlesLive = createParticles(5);
    this.particlesMine = createParticles(5);
    this.particlesEco = createParticles(7);

    this.particlesReturnCity = createParticles(4);
    this.particlesRecircMine = createParticles(4);
  }

  private initAtmosphereParticles(width: number, height: number): void {
    // Nubes suaves de diorama
    this.clouds = [];
    for (let i = 0; i < 3; i++) {
      this.clouds.push({
        x: Phaser.Math.Between(0, width),
        y: Phaser.Math.Between(30, 85),
        speed: Phaser.Math.FloatBetween(0.2, 0.4),
        scale: Phaser.Math.FloatBetween(0.9, 1.3),
        alpha: 0.92
      });
    }

    // Gotas de lluvia
    this.rainDrops = [];
    for (let i = 0; i < 20; i++) {
      this.rainDrops.push({
        x: Phaser.Math.Between(0, width),
        y: Phaser.Math.Between(0, height * 0.75),
        speed: Phaser.Math.Between(12, 18),
        len: Phaser.Math.Between(10, 15)
      });
    }

    // Copos de nieve
    this.snowFlakes = [];
    for (let i = 0; i < 16; i++) {
      this.snowFlakes.push({
        x: Phaser.Math.Between(0, width),
        y: Phaser.Math.Between(0, height * 0.75),
        speed: Phaser.Math.FloatBetween(1.2, 2.4),
        sway: Phaser.Math.FloatBetween(0, Math.PI * 2)
      });
    }

    // Vapores de evaporación en verano
    this.vaporWisps = [];
    for (let i = 0; i < 6; i++) {
      this.vaporWisps.push({
        x: width * 0.30 + Math.random() * 50,
        y: height * 0.32 + Math.random() * 20,
        speed: 0.4 + Math.random() * 0.4,
        alpha: 0.3 + Math.random() * 0.3
      });
    }

    // Infiltración subterránea hacia el acuífero
    this.infiltrationDroplets = [];
    for (let i = 0; i < 8; i++) {
      this.infiltrationDroplets.push({
        x: Phaser.Math.Between(width * 0.15, width * 0.85),
        y: Phaser.Math.Between(height * 0.68, height * 0.84),
        speed: 0.3 + Math.random() * 0.3,
        alpha: 0.5
      });
    }

    // Aves del cielo (volando sobre las cumbres y el valle alto)
    this.birds = [];
    for (let i = 0; i < 4; i++) {
      this.birds.push({
        x: width * 0.20 + i * 60,
        y: height * 0.14 + i * 16,
        speed: Phaser.Math.FloatBetween(0.7, 1.1),
        baseY: height * 0.14 + i * 16,
        phase: i * 0.9
      });
    }
  }

  private setupInteractiveHotspots(): void {
    const { width, height } = this.scale;
    const notify = (target: MapClickTarget) => {
      (this.onSelectSector || BasinScene.onSelectSectorCallback)?.(target);
    };

    for (const zone of this.mapZones) zone.destroy();
    this.mapZones = [];
    const zones: [MapClickTarget, number, number][] = [
      ['mountain', width * 0.75, 100], ['dam', 110, 80],
      ['population', 160, 120], ['agriculture', 150, 90], ['mining', 130, 100],
      ['livestock', 130, 90], ['ecosystem', 90, 60], ['aquifer', 54, 48]
    ];
    for (const [target, zoneWidth, zoneHeight] of zones) {
      const { x, y } = this.getMapAnchor(target);
      const zone = this.add.zone(x, y, zoneWidth, zoneHeight).setOrigin(0.5).setInteractive({ useHandCursor: true });
      zone.on('pointerdown', () => notify(target));
      this.mapZones.push(zone);
    }
  }

  public renderBasin(): void {
    if (!this.gameState || !this.terrainGraphics) return;
    this.terrainGraphics.clear();
    this.lastRenderedSeason = this.gameState.season;
    this.lastRenderedClimate = this.gameState.climateState;
    this.lastRenderedYear = this.gameState.year;
    this.lastRenderedSnow = this.gameState.snowReserve;
    this.lastRenderedReservoir = this.gameState.reservoirVolume;
    this.lastRenderedAquifer = this.gameState.aquiferVolume;
    this.lastRenderedQuality = this.gameState.waterQuality;
    this.lastRenderedHealth = this.gameState.basinHealth;
    this.lastRenderedUpgrades = JSON.stringify(this.gameState.upgrades);

    const { width, height } = this.scale;
    // Calcular altura efectiva descontando el panel UI inferior
    const { height: effectiveH, top } = this.getMapLayout();
    for (const layer of [this.skyLayer, this.terrainGraphics, this.aquiferGraphics, this.riverBedGraphics,
      this.canalsGraphics, this.reservoirGraphics, this.infrastructureGraphics, this.waterFlowGraphics, this.weatherFXGraphics]) {
      layer.setY(top);
    }

    this.renderDioramaSky(width, effectiveH);
    this.renderDioramaTerrain(width, effectiveH);
    this.renderDioramaMountains(width, effectiveH);
    this.renderMainRiverBed(width, effectiveH);
    this.renderDioramaReservoir(width, effectiveH);
    this.renderCanalsAndIntakes(width, effectiveH);
    this.renderDioramaInfrastructure(width, effectiveH);
    this.renderDioramaAquifer(width, effectiveH);
    this.renderBuiltWorks();
    this.setupInteractiveHotspots();
  }

  // --- CIELO Y AMBIENTE DE DIORAMA ---
  private renderDioramaSky(width: number, height: number): void {
    const gfx = this.skyLayer;
    gfx.clear();

    const season = this.gameState?.season || 'WINTER';
    const isOverrideStorm = this.eventWeatherOverride === 'STORM';
    const isOverrideDrought = this.eventWeatherOverride === 'DROUGHT';

    let topColor = 0x38bdf8;
    let botColor = 0xbae6fd;

    if (isOverrideStorm) {
      topColor = 0x1e293b;
      botColor = 0x475569;
    } else if (isOverrideDrought || (season === 'SUMMER' && this.gameState?.climateState === 'VERY_DRY')) {
      topColor = 0xf59e0b;
      botColor = 0xfef08a;
    } else if (season === 'WINTER') {
      topColor = 0x64748b;
      botColor = 0xcfd8dc;
    } else if (season === 'SPRING') {
      topColor = 0x0284c7;
      botColor = 0x7dd3fc;
    } else if (season === 'AUTUMN') {
      topColor = 0x0369a1;
      botColor = 0xfde68a;
    }

    const steps = 14;
    const hStep = (height * 0.44) / steps;
    for (let i = 0; i < steps; i++) {
      const ratio = i / steps;
      const color = Phaser.Display.Color.Interpolate.ColorWithColor(
        Phaser.Display.Color.ValueToColor(topColor),
        Phaser.Display.Color.ValueToColor(botColor),
        100,
        Math.round(ratio * 100)
      );
      gfx.fillStyle(Phaser.Display.Color.GetColor(color.r, color.g, color.b), 1);
      gfx.fillRect(0, i * hStep, width, hStep + 1);
    }

    // Sol de maqueta
    if (!isOverrideStorm) {
      const sunX = width * 0.88;
      const sunY = height * 0.12;
      gfx.fillStyle(0xfef08a, 0.4);
      gfx.fillCircle(sunX, sunY, 36);
      gfx.fillStyle(0xfbbf24, 0.9);
      gfx.fillCircle(sunX, sunY, 22);
    }
  }

  // --- CORDILLERA Y CUMBRES CON MANTO NIVAL MEJORADO ---
  private renderDioramaMountains(width: number, height: number): void {
    const g = this.terrainGraphics;
    // Facetas en planta elevada, con laderas hacia el primer plano.
    for (const [x,y,size] of [[0.27,0.13,0.20],[0.43,0.09,0.23],[0.73,0.12,0.18]]) {
      g.fillStyle(0x626f69); g.fillPoints([[x-size,y+0.12],[x,y-0.06],[x+size,y+0.10],[x,y+0.24]].map(([a,b])=>new Phaser.Math.Vector2(width*a,height*b)),true);
      g.fillStyle(0x88958c);g.fillTriangle(width*(x-size),height*(y+0.12),width*x,height*(y-0.06),width*x,height*(y+0.24));
      // Escala visual, no superficie ni volumen real: sin reserva no queda manto.
      const snowDepth = 0.10 * Math.min(1, Math.max(0, (this.gameState?.snowReserve ?? 0) / 120));
      if (snowDepth > 0) {
        const halfWidth = size * snowDepth / 0.18;
        g.fillStyle(0xe1eae5);
        g.fillTriangle(width*(x-halfWidth), height*(y-0.06+snowDepth),
          width*x, height*(y-0.06), width*(x+halfWidth), height*(y-0.06+snowDepth));
      }
    }
  }

  private renderDioramaTerrain(width: number, height: number): void {
    const g=this.terrainGraphics;g.clear();g.fillStyle(0x294d43);g.fillRect(0,0,width,height);
    for(const [y,color] of [[0.22,0x68856a],[0.38,0x7c9868],[0.54,0x91a973],[0.70,0x9aaf78],[0.86,0x769865]]) {
      const pts=[[0.06,y],[0.72,y-0.09],[0.96,y+0.04],[0.88,y+0.19],[0.18,y+0.23]];
      g.fillStyle(0x4f6847);g.fillPoints(pts.map(([x,z])=>new Phaser.Math.Vector2(width*x,height*z+8)),true);
      g.fillStyle(color);g.fillPoints(pts.map(([x,z])=>new Phaser.Math.Vector2(width*x,height*z)),true);
    }
    this.renderDioramaTrees(width,height,0x426947);
  }

  private renderDioramaTrees(width: number, height: number, color: number): void {
    const gfx = this.terrainGraphics;
    const upgReforest = (this.gameState?.upgrades['restauracion_cauces']?.currentLevel || 0);
    const season = this.gameState?.season;
    // Maduración decorativa acotada; no representa recarga ni rendimiento de una obra.
    const growth = 0.85 + 0.35 * Math.min(19, Math.max(0, (this.gameState?.turn ?? 1) - 1)) / 19;
    const foliage = season === 'AUTUMN' ? 0xb77936 : season === 'WINTER' ? 0x567463 : color;
    const highlight = season === 'AUTUMN' ? 0xfbbf24 : season === 'WINTER' ? 0xa3b8a4 : 0x4ade80;

    const trees = [
      { x: width * 0.08, y: height * 0.46, s: 1.3 },
      { x: width * 0.12, y: height * 0.49, s: 1.1 },
      { x: width * 0.24, y: height * 0.43, s: 1.2 },
      { x: width * 0.52, y: height * 0.42, s: 1.4 },
      { x: width * 0.86, y: height * 0.44, s: 1.3 },
      { x: width * 0.91, y: height * 0.48, s: 1.1 },
      { x: width * 0.78, y: height * 0.58, s: 1.2 }
    ];

    // Más árboles visibles si se invirtió en reforestación
    if (upgReforest >= 1) {
      trees.push({ x: width * 0.47, y: height * 0.60, s: 1.2 });
      trees.push({ x: width * 0.51, y: height * 0.64, s: 1.1 });
    }
    if (upgReforest >= 2) {
      trees.push({ x: width * 0.38, y: height * 0.66, s: 1.3 });
      trees.push({ x: width * 0.44, y: height * 0.68, s: 1.2 });
    }

    for (const t of trees) {
      t.s *= growth;
      // Sombra
      gfx.fillStyle(0x0f172a, 0.2);
      gfx.fillEllipse(t.x, t.y + 7 * t.s, 14 * t.s, 5 * t.s);
      // Tronco
      gfx.fillStyle(0x78350f, 1);
      gfx.fillRect(t.x - 2 * t.s, t.y, 4 * t.s, 7 * t.s);
      // Copa redondeada (diorama)
      gfx.fillStyle(foliage, 1);
      gfx.fillCircle(t.x, t.y - 4 * t.s, 9 * t.s);
      gfx.fillStyle(highlight, 0.35);
      gfx.fillCircle(t.x - 2 * t.s, t.y - 6 * t.s, 5 * t.s);
    }
  }

  // --- RÍO PRINCIPAL ANCHO COMO PROTAGONISTA ---
  private renderMainRiverBed(width: number, height: number): void {
    if (!this.gameState) return;
    const gfx = this.riverBedGraphics;
    gfx.clear();

    this.visibleFlows = [];

    let riverColor = 0x0284c7;
    let riverHighlight = 0x38bdf8;
    if ((this.decisionPreview?.waterQuality ?? this.gameState.waterQuality) < 45) {
      riverColor = 0x79532f; // Agua turbia, distinguible del lecho seco también en móvil.
      riverHighlight = 0xc6a480;
    } else if ((this.decisionPreview?.waterQuality ?? this.gameState.waterQuality) < 70) {
      riverColor = 0x0d9488;
      riverHighlight = 0x2dd4bf;
    }

    // Lecho y ribera del río con gravas y sombra suave
    gfx.lineStyle(32 * Math.max(0.6, Math.min(1, width / 850)), 0x9c9275, 0.9);
    this.drawRiverPath(gfx, width, height, 2);

    const points = [new Phaser.Math.Vector2(width * 0.40, height * 0.17)];
    for (const [x,y,a,b,c,d,e,f] of [[0.40,0.17,0.40,0.25,0.24,0.25,0.28,0.39],
      [0.28,0.39,0.33,0.48,0.22,0.50,0.27,0.57],
      [0.27,0.57,0.32,0.67,0.21,0.70,0.26,0.77],
      [0.26,0.77,0.31,0.82,0.27,0.84,0.29,0.88], [0.29,0.88,0.30,0.92,0.22,0.97,0.20,1.01]]) {
      this.sampleCubicBezier(points,width*x,height*y,width*a,height*b,width*c,height*d,width*e,height*f,30);
    }
    const b = this.decisionPreview;
    const bypass = b ? Math.max(0,b.riverInflow-b.directRiverIntake-b.reservoirInflow-b.aquiferRiverRecharge) : 0;
    // Aportes laterales sin posición en el modelo: se agregan tras la toma directa.
    // Nunca se presentan como agua que atravesó el embalse.
    const lateral = b ? b.reservoirSpill+b.runoffBypass+b.aquiferOverflow+b.returns.ecosystem : 0;
    let active: typeof this.visibleFlows[number] | undefined;
    for (let i=0;i<points.length-1;i++) {
      const y=(points[i].y+points[i+1].y)/(2*height);
      let amount=b?.riverInflow ?? this.gameState.riverFlow;
      if (b && i>=12) amount-=b.directRiverIntake; // primero captación directa, t=0.4
      if (b && i>=18) { // después embalse y continuidad por el río, t=0.6
        amount=bypass+lateral;
        for (const [id,join] of [['mining',0.43],['population',0.57],['agriculture',0.71],['livestock',0.85]] as [SectorId,number][]) {
          if (y>=join) amount+=b.returns[id];
        }
        if (y>=0.85) amount=b.downstreamFlow;
      }
      if (amount<=0) { active=undefined; continue; }
      // Ancho conceptual común: cero seco, mayor caudal más superficie mojada.
      const wetWidth=26*Math.max(0.6,Math.min(1,width/850))*amount/(amount+22);
      gfx.lineStyle(wetWidth,riverColor,0.95).strokePoints([points[i],points[i+1]],false);
      gfx.lineStyle(wetWidth*0.22,riverHighlight,0.6).strokePoints([points[i],points[i+1]],false);
      if (!active || active.amount!==amount) {
        active={points:[points[i]],amount,color:riverHighlight};
        this.visibleFlows.push(active);
      }
      active.points.push(points[i+1]);
    }
    // Actualizar etiqueta del río
    if (this.riverFlowLabelText) {
      this.riverFlowLabelText.setPosition(width * 0.39, this.getMapLayout().top + height * 0.97);
      this.riverFlowLabelText.setText('↓ Continúa aguas abajo');
    }
  }

  /** Evaluates a cubic Bezier segment and pushes sampled Vector2 points into `out`. */
  private sampleCubicBezier(
    out: Phaser.Math.Vector2[],
    x0: number, y0: number,
    cp1x: number, cp1y: number,
    cp2x: number, cp2y: number,
    x1: number, y1: number,
    steps: number = 12
  ): void {
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const mt = 1 - t;
      const px = mt * mt * mt * x0 + 3 * mt * mt * t * cp1x + 3 * mt * t * t * cp2x + t * t * t * x1;
      const py = mt * mt * mt * y0 + 3 * mt * mt * t * cp1y + 3 * mt * t * t * cp2y + t * t * t * y1;
      out.push(new Phaser.Math.Vector2(px, py));
    }
  }

  private drawRiverPath(g: Phaser.GameObjects.Graphics,width: number,height: number,offsetY=0): void {
    const pts=[new Phaser.Math.Vector2(width*0.40,height*0.17+offsetY)];
    for(const [x,y,a,b,c,d,e,f] of [[0.40,0.17,0.40,0.25,0.24,0.25,0.28,0.39],[0.28,0.39,0.33,0.48,0.22,0.50,0.27,0.57],[0.27,0.57,0.32,0.67,0.21,0.70,0.26,0.77],[0.26,0.77,0.31,0.82,0.27,0.84,0.29,0.88], [0.29,0.88,0.30,0.92,0.22,0.97,0.20,1.01]])
      this.sampleCubicBezier(pts,width*x,height*y+offsetY,width*a,height*b+offsetY,width*c,height*d+offsetY,width*e,height*f+offsetY);
    g.strokePoints(pts,false);
  }

  private renderCanalsAndIntakes(width: number,height: number): void {
    if(!this.gameState)return;
    const g=this.canalsGraphics;g.clear();const b=this.decisionPreview;
    const route=(points:number[][],amount:number,returning=false,quality=100)=>{
      const pts=new Phaser.Curves.Spline(points.map(([x,y])=>new Phaser.Math.Vector2(width*x,height*y))).getPoints(40);
      const bank=(returning?5:13)*Math.max(0.6,Math.min(1,width/850));
      g.lineStyle(bank+4,0x405342,0.45);g.strokePoints(pts,false);
      g.lineStyle(bank,0xb7ad86);g.strokePoints(pts,false);g.lineStyle(Math.max(1,bank-3),0x526f6c);g.strokePoints(pts,false);
      if (amount > 0) {
        const wetWidth=(returning ? bank-1 : bank-3)*amount/(amount+8);
        g.lineStyle(wetWidth, quality < 45 ? 0x79532f : quality < 70 ? 0x38998c : 0x4aa7b0);
        g.strokePoints(pts, false);
        const highlight = quality < 45 ? 0xc6a480 : quality < 70 ? 0x94bfa0 : 0xb9edef;
        this.visibleFlows.push({ points: pts, amount, color: highlight });
        // Reflejos puntuales sobre una superficie abierta, sin línea de tubería.
        g.lineStyle(1, highlight, 0.45);
        for (const index of [10, 25]) {
          const point = pts[index];
          g.lineBetween(point.x - 2, point.y - 2, point.x + 2, point.y + 2);
        }
      }

    };
    // Puntos del mismo cauce, t=0.4 y t=0.6: la captación precede al almacenamiento.
    route([[0.34368,0.25184],[0.48,0.20],[0.59,0.16],[0.77,0.17],[0.77,0.31],[0.65,0.32]],b?.directRiverIntake??0,false,100);
    route([[0.30496,0.28592],[0.48,0.27],[0.63,0.25]],b?.reservoirInflow??0,false,100);
    route([[0.69,0.29],[0.68,0.31],[0.65,0.32]],b?.reservoirWithdrawal??0,false,100);
    route([[0.65,0.32],[0.65,0.48],[0.65,0.63],[0.65,0.77],[0.65,0.87]],b?.totalWaterSupplied??0,false,100);
    route([[0.64,0.28],[0.48,0.33],[0.27712,0.32104]],b?.reservoirSpill??0,true);
    const paths:[SectorId,number[][],number[][]][]=[
      ['mining',[[0.65,0.35],[0.63,0.35],[0.57,0.35]],[[0.51,0.39],[0.40,0.41],[0.29,0.43]]],
      ['population',[[0.65,0.48],[0.63,0.48],[0.56,0.48]],[[0.48,0.53],[0.38,0.54],[0.27,0.57]]],
      ['agriculture',[[0.65,0.63],[0.63,0.63],[0.53,0.63]],[[0.44,0.67],[0.35,0.69],[0.25,0.71]]],
      ['livestock',[[0.65,0.77],[0.63,0.77],[0.58,0.77]],[[0.49,0.81],[0.39,0.82],[0.29,0.85]]]];
    for(const [id,supply,ret] of paths){route(supply,b?.suppliedAllocations[id]??this.gameState.sectors[id].allocated);route(ret,b?.returns[id]??0,true,b?.returnQualities[id]??this.gameState.sectors[id].returnQuality);}
    route([[0.80,0.91],[0.80,0.87],[0.72,0.87],[0.65,0.87]],b?.aquiferWithdrawal??0,false,100);
  }

  private renderDioramaReservoir(width:number,height:number):void {
    if(!this.gameState)return;
    const g=this.reservoirGraphics;g.clear();const level = this.gameState.upgrades['ampliacion_embalse']?.currentLevel ?? 0;
    // Mayor vaso construido, sin simular agua adicional ni cambiar el emplazamiento.
    const x=width*0.68,y=height*0.25,w=width*0.13*(1+level*0.12),h=height*0.085*(1+level*0.04);
    const ratio=Phaser.Math.Clamp(this.gameState.reservoirVolume/Math.max(1,this.gameState.reservoirCapacity),0,1);
    g.fillStyle(0x47594c);g.fillEllipse(x,y,w+14,h+12);g.fillStyle(0x837e65);g.fillEllipse(x,y,w,h);
    // Área mojada proporcional al volumen: el vaso vacío y su margen quedan visibles.
    g.lineStyle(1,0xe5d8ac,0.8);g.strokeEllipse(x,y,w,h);
    if (ratio>0) {
      const wet=Math.sqrt(ratio);
      g.fillStyle(0x237f98);g.fillEllipse(x,y,w*wet,h*wet);
      g.lineStyle(2,0x9adbe1,0.7);g.lineBetween(x-w*wet*0.25,y,x+w*wet*0.25,y-3*wet);
    }
    const dy=height*0.29;g.fillStyle(0x33443c,0.5);g.fillRect(x-w*0.30+3,dy+4,w*0.6,14);
    g.fillStyle(0x9caea5);g.fillRect(x-w*0.30,dy-5,w*0.6,14);g.fillStyle(0xdce2cc);g.fillRect(x-w*0.30,dy-5,w*0.6,4);
    // Salida pasiva sobre el canal existente: sin volante ni otra compuerta jugable.
    // La boca permanece visible en seco; el agua sólo aparece si el embalse entrega.
    const outletX=width*0.69, outletScale=Math.max(0.55,Math.min(1,width/850));
    const outletW=22*outletScale, outletH=17*outletScale;
    g.fillStyle(0x53675e);g.fillRect(outletX-outletW/2+3*outletScale,dy,outletW,outletH);
    g.fillStyle(0xdce2cc);g.fillRoundedRect(outletX-outletW/2,dy-4*outletScale,outletW,outletH,3*outletScale);
    g.fillStyle(0x304b51);g.fillRoundedRect(outletX-outletW*0.28,dy,outletW*0.56,outletH*0.76,3*outletScale);
    if ((this.decisionPreview?.reservoirWithdrawal ?? 0)>0) {
      g.lineStyle(4*outletScale,0x5dcbd5);g.lineBetween(outletX,dy+outletH*0.7,width*0.68,height*0.31);
    }
  }

  private renderDioramaInfrastructure(width: number, height: number): void {
    if (!this.gameState) return;
    const gfx = this.infrastructureGraphics;
    gfx.clear();
    const objectScale=Math.min(1,width/850);gfx.setScale(objectScale);width/=objectScale;height/=objectScale;

    // 1. CIUDAD (Edificios amigables y escuela)
    const cityX = width * 0.52;
    const cityY = height * 0.48;

    // Sombra de la ciudad
    gfx.fillStyle(0x0f172a, 0.25);
    gfx.fillEllipse(cityX, cityY + 28, 150, 44);

    // Edificio 1
    this.drawIsometricBuilding(gfx, cityX - 44, cityY - 24, 30, 48, 0x3b82f6, 0x1d4ed8, 0x93c5fd);
    // Edificio 2 (Torre principal)
    this.drawIsometricBuilding(gfx, cityX - 10, cityY - 44, 32, 64, 0x60a5fa, 0x2563eb, 0xdbeafe);
    // Casa residencial con techo a dos aguas
    this.drawHouseWithGableRoof(gfx, cityX + 28, cityY - 10, 28, 28, 0xf8fafc, 0xe11d48);

    // Tanque de agua urbano
    gfx.fillStyle(0x38bdf8, 1);
    this.drawRegularPolygon(gfx, cityX + 64, cityY - 20, 14, 6);
    gfx.lineStyle(2.5, 0x475569, 1);
    gfx.lineBetween(cityX + 64, cityY - 6, cityX + 64, cityY + 22);

    // Humo suave de chimenea
    const smokeY = cityY - 28 - ((this.animTimer * 12) % 18);
    gfx.fillStyle(0xffffff, 0.45);
    gfx.fillCircle(cityX + 36, smokeY, 4);

    // Vecinos con vaso: gesto simbólico de cobertura, no población/consumo medidos.
    const cityCovered = this.gameState.isSeasonResolved && this.gameState.sectors.population.satisfactionRate >= .85;
    for (const offset of [-56, -42]) {
      const x = cityX + offset, y = cityY + 31;
      gfx.fillStyle(0xf1c7a2); gfx.fillCircle(x, y - 12, 3);
      gfx.lineStyle(3, 0x244461); gfx.lineBetween(x, y - 8, x, y);
      gfx.lineStyle(2, 0x244461); gfx.lineBetween(x, y, x - 3, y + 5); gfx.lineBetween(x, y, x + 3, y + 5);
      const handY = cityCovered ? y - 15 : y - 4;
      gfx.lineStyle(2, 0xf1c7a2); gfx.lineBetween(x, y - 6, x + 7, handY);
      gfx.fillStyle(cityCovered ? 0x72dbed : 0xe9e2cf); gfx.fillRect(x + 6, handY - 3, 4, 5);
    }

    // 2. AGRICULTURA (Bancales de cultivo y aspersores)
    const agriX = width * 0.49;
    const agriY = height * 0.63;
    const agriSat = this.gameState.isSeasonResolved ? this.gameState.sectors.agriculture.satisfactionRate
      : Math.min(1, (this.decisionPreview?.suppliedAllocations.agriculture ?? this.gameState.sectors.agriculture.allocated) / Math.max(1, this.gameState.sectors.agriculture.currentDemand));

    // Color del cultivo según satisfacción
    let cropColor = agriSat > 0.8 ? 0x22c55e : agriSat > 0.5 ? 0xeab308 : 0x854d0e;

    // Sombra del campo
    gfx.fillStyle(0x0f172a, 0.2);
    gfx.fillEllipse(agriX, agriY + 18, 160, 50);

    // Parcelas agrícolas
    gfx.fillStyle(cropColor, 0.95);
    gfx.fillRoundedRect(agriX - 70, agriY - 24, 64, 46, 6);
    gfx.fillStyle(cropColor, 0.85);
    gfx.fillRoundedRect(agriX + 6, agriY - 20, 60, 42, 6);

    // Surcos de cultivo
    gfx.lineStyle(2, 0x78350f, 0.4);
    gfx.lineBetween(agriX - 66, agriY - 12, agriX - 10, agriY - 12);
    gfx.lineBetween(agriX - 66, agriY + 2, agriX - 10, agriY + 2);
    gfx.lineBetween(agriX + 10, agriY - 8, agriX + 60, agriY - 8);
    gfx.lineBetween(agriX + 10, agriY + 6, agriX + 60, agriY + 6);
    // Hojas erguidas/inclinadas acompañan el color existente: señal conceptual.
    for (const offset of [-45, -22, 28, 48]) {
      const x = agriX + offset, y = agriY + 10;
      const leafY = agriSat >= .8 ? y - 13 : y - 5;
      gfx.lineStyle(2, 0x315f24); gfx.lineBetween(x, y, x, leafY);
      gfx.fillStyle(agriSat >= .8 ? 0x96dd58 : 0xb8a04d);
      gfx.fillEllipse(x - 4, leafY + 2, 9, 4); gfx.fillEllipse(x + 4, leafY, 9, 4);
    }

    // 3. MINERÍA (Cantera facetada y camión)
    const mineX = width * 0.54;
    const mineY = height * 0.35;

    // Sombra
    gfx.fillStyle(0x0f172a, 0.25);
    gfx.fillEllipse(mineX, mineY + 24, 110, 36);

    // Cantera
    gfx.fillStyle(0x64748b, 1);
    gfx.fillTriangle(mineX - 44, mineY + 24, mineX, mineY - 32, mineX + 44, mineY + 24);
    gfx.fillStyle(0x475569, 1);
    gfx.fillRect(mineX - 16, mineY, 32, 24);

    // Camión minero estilizado
    gfx.fillStyle(0xfacc15, 1);
    gfx.fillRect(mineX - 26, mineY + 12, 16, 10);
    gfx.fillStyle(0x1e293b, 1);
    gfx.fillCircle(mineX - 22, mineY + 24, 3);
    gfx.fillCircle(mineX - 14, mineY + 24, 3);

    // Planta de flotación / tanques
    gfx.fillStyle(0x0284c7, 0.9);
    this.drawRegularPolygon(gfx, mineX + 28, mineY + 14, 15, 6);
    // Trabajador con casco: mismo lenguaje de gesto que los vecinos.
    const workerX = mineX - 44, workerY = mineY + 31;
    const mineCovered = this.gameState.isSeasonResolved && this.gameState.sectors.mining.satisfactionRate >= .85;
    gfx.fillStyle(0xf1c7a2); gfx.fillCircle(workerX, workerY - 13, 3);
    gfx.fillStyle(0xf5cf5c); gfx.fillRect(workerX - 4, workerY - 18, 8, 3);
    gfx.lineStyle(3, 0xd68f39); gfx.lineBetween(workerX, workerY - 8, workerX, workerY);
    gfx.lineStyle(2, 0x334155); gfx.lineBetween(workerX, workerY, workerX - 3, workerY + 5); gfx.lineBetween(workerX, workerY, workerX + 3, workerY + 5);
    gfx.lineStyle(2, 0xf1c7a2); gfx.lineBetween(workerX, workerY - 6, workerX + 7, workerY - (mineCovered ? 13 : 4));

    // 4. GANADERÍA (Estancia campestre: Granero, Silo, Bebedero y Corral)
    const liveX = width * 0.54;
    const liveY = height * 0.77;

    // Sombra general de la estancia
    gfx.fillStyle(0x0f172a, 0.22);
    gfx.fillEllipse(liveX, liveY + 14, 130, 48);

    // Suelo terroso/heno del corral
    gfx.fillStyle(0xa16207, 0.25);
    gfx.fillRoundedRect(liveX - 44, liveY - 14, 96, 40, 10);

    // Granero rústico tradicional de madera roja
    this.drawFarmBarn(gfx, liveX + 16, liveY - 34, 38, 36);

    // Silo forrajero cilíndrico plateado
    this.drawFarmSilo(gfx, liveX + 44, liveY - 36, 14, 38);

    // Bebedero de agua donde desemboca la acequia (x = liveX - 28, y = liveY + 8)
    this.drawWaterTrough(gfx, liveX - 32, liveY + 4, 18, 12);

    // Valla de madera rústica del corral (postes y travesaños)
    this.drawCorralFence(gfx, liveX - 42, liveY - 16, 68, 38);

    // Animales en el corral y pastizal
    // Vaca lechera en pie
    this.drawCuteCow(gfx, liveX - 16, liveY - 2, 1.15, false);
    if (this.gameState.isSeasonResolved && this.gameState.sectors.livestock.satisfactionRate < .85) {
      // Megáfono de la vaca: reclamo editorial, sin evento ni penalidad adicional.
      gfx.fillStyle(0xf5cf5c); gfx.fillTriangle(liveX - 8, liveY - 7, liveX + 3, liveY - 13, liveX + 3, liveY - 2);
      gfx.lineStyle(1.5, 0xf5cf5c); gfx.lineBetween(liveX + 6, liveY - 11, liveX + 10, liveY - 13);
      gfx.lineBetween(liveX + 7, liveY - 6, liveX + 12, liveY - 6);
    }
    // Vaca echada descansando en el heno
    this.drawCuteCow(gfx, liveX + 4, liveY + 8, 1.0, true);
    // Ovejita pastando
    this.drawCuteSheep(gfx, liveX - 36, liveY - 6, 1.1);
    this.drawCuteSheep(gfx, liveX - 22, liveY + 12, 0.95);

    // Fardo de heno dorado
    this.drawHayBale(gfx, liveX + 28, liveY + 6);

    // 5. ECOSISTEMA Y HUMEDAL DEL DELTA — Laguna expresiva
    const ecoX = width * 0.29;
    const ecoY = height * 0.88;
    const ecoSat = this.ecosystemVitality();

    let deltaColor = ecoSat > 0.8 ? 0x059669 : ecoSat > 0.5 ? 0x65a30d : 0x78716c;
    const quality=this.decisionPreview?.waterQuality ?? this.gameState.waterQuality;
    const lagoonColor=quality<45 ? 0x92704e : quality<70 ? 0x398c7c : 0x237f98;
    const lagoonShine=quality<45 ? 0xc6a480 : quality<70 ? 0x94bfa0 : 0x9adbe1;
    const finalFlow=this.decisionPreview?.downstreamFlow ?? this.gameState.riverFlow;
    const lagoonWet=Math.sqrt(Math.max(0,finalFlow)/(Math.max(0,finalFlow)+22));

    // Sombra del delta
    gfx.fillStyle(0x0f172a, 0.2);
    gfx.fillEllipse(ecoX, ecoY + 6, 130, 38);

    // Vegetación del humedal (capas)
    gfx.fillStyle(deltaColor, 0.90);
    this.drawRegularPolygon(gfx, ecoX, ecoY - 2, 42, 8);
    gfx.fillStyle(deltaColor, 0.75);
    this.drawRegularPolygon(gfx, ecoX - 30, ecoY + 6, 28, 6);
    this.drawRegularPolygon(gfx, ecoX + 30, ecoY + 5, 30, 7);

    // Laguna interior (espejo de agua)
    gfx.fillStyle(0xc0ac7f,0.9);gfx.fillEllipse(ecoX,ecoY,38,22);
    gfx.fillStyle(lagoonColor, 0.88);
    if (finalFlow>0) gfx.fillEllipse(ecoX, ecoY, 38*lagoonWet, 22*lagoonWet);
    // Brillo animado en la laguna
    const lakeWave = 0;
    gfx.lineStyle(2, lagoonShine, finalFlow>0 ? 0.5 : 0);
    gfx.beginPath();
    gfx.moveTo(ecoX - 10*lagoonWet, ecoY - 2 + lakeWave);
    gfx.lineTo(ecoX + 10*lagoonWet, ecoY - 2 + lakeWave);
    gfx.stroke();

    // Juncos detallados con cabezuelas
    if (ecoSat > 0.5) {
      const reeds = [
        { x: ecoX - 18, y: ecoY + 6 },
        { x: ecoX - 14, y: ecoY + 4 },
        { x: ecoX + 16, y: ecoY + 5 },
        { x: ecoX + 20, y: ecoY + 7 },
        { x: ecoX - 32, y: ecoY + 8 },
        { x: ecoX + 33, y: ecoY + 7 },
      ];
      for (const r of reeds) {
        gfx.lineStyle(2, 0x15803d, 0.9);
        gfx.lineBetween(r.x, r.y, r.x + 2, r.y - 14);
        // Cabezuela del junco
        gfx.fillStyle(0x92400e, 0.9);
        gfx.fillRect(r.x + 1, r.y - 16, 3, 5);
      }
      // Flores de agua si el ecosistema es muy saludable
      if (ecoSat > 0.75) {
        const blooms = [{ x: ecoX - 6, y: ecoY - 4 }, { x: ecoX + 8, y: ecoY }];
        for (const b of blooms) {
          gfx.fillStyle(0xfbbf24, 0.9);
          gfx.fillCircle(b.x, b.y, 3);
          gfx.fillStyle(0xffffff, 0.7);
          gfx.fillCircle(b.x, b.y, 1.5);
        }
      }
    }

  }

  // --- CORTE GEOLÓGICO DEL ACUÍFERO (RIGOR CIENTÍFICO) ---
  private ecosystemVitality(): number {
    if (!this.gameState) return 0;
    const state = this.gameState;
    const flow = state.isSeasonResolved ? state.sectors.ecosystem.satisfactionRate
      : this.decisionPreview?.satisfactions.ecosystem ?? Math.min(1, state.sectors.ecosystem.allocated / Math.max(1, state.sectors.ecosystem.currentDemand));
    return Math.min(flow, state.waterQuality / 80, state.basinHealth / 80);
  }

  private renderDioramaAquifer(width:number,height:number):void {
    if(!this.gameState)return;
    const g=this.aquiferGraphics;g.clear();const x=width*0.65,y=height*0.92,w=width*0.28,h=height*0.07;
    g.fillStyle(0x735d43);g.fillRoundedRect(x,y,w,h,5);g.fillStyle(0xa89167);g.fillRect(x,y,w,5);
    const level=Math.min(1,this.gameState.aquiferVolume/this.gameState.aquiferCapacity);
    g.fillStyle(0x448f99,0.7);g.fillRect(x+4,y+h*(1-level*0.65),w-8,h*level*0.65);
    for(let i=0;i<9;i++){g.fillStyle(0xb5a47a,0.65);g.fillCircle(x+w*(i+0.5)/9,y+h*0.6,2);}
    g.lineStyle(5,0xc0c9b4);g.lineBetween(width*0.80,height*0.87,width*0.80,y+h*0.75);
    g.fillStyle(0x58685e);g.fillRect(width*0.80-7,height*0.87-5,14,8);
  }

  // Una respuesta editorial breve al agua efectivamente recibida, no producción medida.
  // Copiamos el resultado: avanzar estación no convierte la reacción anterior en preview.
  private prepareResultReactions(state: GameState): void {
    const sectors: SectorId[] = ['population', 'agriculture', 'livestock', 'mining', 'ecosystem'];
    const previousResult = !state.isSeasonResolved ? state.seasonHistory?.at(-1) : undefined;
    const coverage = Object.fromEntries(sectors.map(id => [id, previousResult?.balance.satisfactions[id] ?? state.sectors[id].satisfactionRate])) as Record<SectorId, number>;
    const resultTurn = previousResult?.turn ?? state.turn;
    const ordered = [...sectors].sort((a, b) => coverage[a] - coverage[b]);
    const voices: Partial<Record<SectorId, [string, string]>> = {
      population: ['Sofía: «La comisión tiene agua mineral. El barrio, una reunión».', 'Sofía: «Hoy celebramos algo extraordinario: abrir la canilla».'],
      agriculture: ['Jacinto: «El informe floreció. El campo espera su turno».', 'Jacinto: «Buen riego. Por una vez, la cosecha no depende del discurso».'],
      livestock: ['Berta: «El corral presentó un reclamo. Tiene más firmas que vecinos».', 'Berta: «Bebederos atendidos. Se suspende la asamblea del corral».'],
      mining: ['Ferrada: «Con este reparto sobra tiempo para redactar el reclamo».', 'Ferrada: «Agua para trabajar. El comunicado de éxito ya estaba escrito».'],
      ecosystem: ['Clara: «Al río le asignaron una declaración de buenas intenciones».', 'Clara: «El río sigue corriendo. Sin cortar cinta, por favor».']
    };
    const names: Partial<Record<SectorId, string>> = { population: 'Ciudad', agriculture: 'Cultivos', livestock: 'Granja', mining: 'Mina', ecosystem: 'Caudal del río' };
    const riverHealthy = (previousResult?.balance.waterQuality ?? state.waterQuality) >= 70
      && (previousResult?.balance.basinHealth ?? state.basinHealth) >= 70;
    this.resultReactionCards = sectors.map(sector => {
      const prior = state.seasonHistory?.find(row => row.turn === resultTurn - 1);
      const carpinchoEvent = state.seasonHistory?.some(row => row.turn <= resultTurn
        && row.events?.some(record => record.event.id === 'clara_carpincho')) ?? false;
      const resolved = previousResult ?? state.seasonHistory?.find(row => row.turn === resultTurn);
      const receivedMore = !!prior && !!resolved && resolved.balance.suppliedAllocations[sector] > prior.balance.suppliedAllocations[sector];
      const reservoirRecovered = !!resolved && resolved.balance.reservoirEnd > resolved.balance.reservoirStart;
      const story = getMapResultStory(sector, coverage[sector], prior?.balance.satisfactions[sector], resultTurn, editorialSeed(state.seed ?? 'VALLE', BasinScene.editorialSession), carpinchoEvent, receivedMore, reservoirRecovered, state.seasonHistory);
      this.resultSceneVariants[sector] = story.variant;
      return { sector, title: `${names[sector]} · ${Math.round(coverage[sector] * 100)}%`, text: story.text };
    });
    const selected = [ordered[0]];
    const wellSupplied = [...ordered].reverse().find(id => id !== selected[0] && coverage[id] >= .85);
    if (wellSupplied) selected.push(wellSupplied);
    this.resultReactions = selected.map(sector => ({
      sector,
      text: `Resultado T${resultTurn} · ${names[sector]} ${Math.round(coverage[sector] * 100)}%\n${voices[sector]![coverage[sector] >= .85 ? 1 : 0]}`
    }));
    this.reactionTurn = resultTurn;
    this.reactionVisibleMs = 0;
    this.resolvedCoverage = coverage;
    this.resolvedRiverHealthy = (previousResult?.balance.waterQuality ?? state.waterQuality) >= 70
      && (previousResult?.balance.basinHealth ?? state.basinHealth) >= 70;
  }

  /** La inspección muestra las cinco tarjetas juntas en DOM, sin cola temporal. */
  public replayResultReactions(): void {
    this.reactionVisibleMs = this.resultReactions.length * 9000;
    this.reactionText?.setVisible(false);
  }

  public getResultReactionCards(): readonly { sector: SectorId; title: string; text: string }[] {
    return this.resultReactionCards.map(card => ({ ...card }));
  }

  // Escenas simbólicas de respuesta al reparto anterior. No estiman cosecha,
  // población ni producción: los únicos datos usados son cobertura y turno.
  private drawResultActivity(): void {
    if (!this.resolvedCoverage) {
      this.resultActivityGraphics?.clear();
      this.resultActivityLabel?.setVisible(false);
      return;
    }
    if (!this.resultActivityGraphics) this.resultActivityGraphics = this.add.graphics().setDepth(5);
    const g = this.resultActivityGraphics;
    g.clear();
    if (this.waterReplay || document.querySelector('.modal-backdrop.open, #card-season-feedback.open')) {
      this.resultActivityLabel?.setVisible(false);
      return;
    }
    const layout = this.getMapLayout();
    if (!this.resultActivityLabel) this.resultActivityLabel = this.add.text(0, 0, '', {
      fontFamily: 'system-ui, sans-serif', fontSize: '13px', color: '#f8fafc',
      backgroundColor: 'rgba(15, 23, 42, .94)', padding: { x: 8, y: 5 }
    }).setDepth(6);
    this.resultActivityLabel.setText(`Reacciones al último reparto · T${this.reactionTurn}`)
      .setPosition(10, layout.top + layout.height - 30).setVisible(true);
    const scale = Math.max(.65, Math.min(1, layout.width / 850));
    const moving = this.gameState?.isSeasonResolved && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    for (const id of ['population', 'agriculture', 'livestock', 'mining', 'ecosystem'] as SectorId[]) {
      const coverage = this.resolvedCoverage[id] ?? 0;
      const covered = coverage >= .85;
      const variant = this.resultSceneVariants[id] ?? 0;
      const gesture = moving ? Math.sin(this.animTimer * (3 + variant)) * 3 * scale : 0;
      const anchor = this.getMapAnchor(id);
      const x = Math.max(22, anchor.x - 86 * scale), y = anchor.y + 22 * scale;
      g.fillStyle(0x0f172a, .25); g.fillEllipse(x, y + 15 * scale, 54 * scale, 14 * scale);
      if (id === 'ecosystem') {
        // Caudal atendido permite vida; sin calidad/estado adecuados no festejar.
        const healthy = covered && this.resolvedRiverHealthy;
        g.lineStyle(3 * scale, healthy ? 0xf8fafc : 0x9ca3af);
        for (const offset of healthy ? [-10, 8] : [0]) {
          g.lineBetween(x + offset * scale, y, x + (offset - 6) * scale, y - 5 * scale);
          g.lineBetween(x + offset * scale, y, x + (offset + 6) * scale, y - 5 * scale);
        }
        continue;
      }
      if (id === 'agriculture') {
        // Cajones llenos/vacíos son ilustración del abastecimiento, no rendimiento.
        for (const offset of [-14, 6]) {
          g.fillStyle(0x9a6b3e); g.fillRect(x + offset * scale, y, 17 * scale, 13 * scale);
          g.lineStyle(scale, 0xdbc08a); g.strokeRect(x + offset * scale, y, 17 * scale, 13 * scale);
          if (covered) {
            g.fillStyle(0xe5ac47); g.fillCircle(x + (offset + 5) * scale, y + 4 * scale, 4 * scale);
            g.fillCircle(x + (offset + 12) * scale, y + 4 * scale, 4 * scale);
            if (variant === 1) {
              g.lineStyle(2 * scale, 0x5bd488);
              g.lineBetween(x + (offset + 8) * scale, y, x + (offset + 8) * scale, y - 18 * scale - gesture);
              g.fillStyle(0x5bd488); g.fillCircle(x + (offset + 8) * scale, y - 18 * scale - gesture, 5 * scale);
            }
          }
        }
      } else {
        // Vecinos/operarios/corral: un gesto persistente suficientemente grande.
        for (const offset of [-12, 10]) {
          const px = x + offset * scale + (covered ? gesture : 0);
          g.fillStyle(0xe4b38f); g.fillCircle(px, y - 17 * scale, 4 * scale);
          g.lineStyle(5 * scale, id === 'mining' ? 0xe2a23a : id === 'livestock' ? 0x916744 : 0x5f9bbb);
          g.lineBetween(px, y - 11 * scale, px, y + 2 * scale);
          g.lineStyle(2.5 * scale, 0xe4b38f);
          g.lineBetween(px, y - 7 * scale, px - 8 * scale, y - (covered || variant === 1 ? 18 : 1) * scale + gesture);
          g.lineBetween(px, y - 7 * scale, px + 8 * scale, y - (covered || variant === 1 ? 18 : 1) * scale - gesture);
          g.lineStyle(3 * scale, 0x334155);
          g.lineBetween(px, y + 2 * scale, px - 4 * scale - gesture, y + 12 * scale);
          g.lineBetween(px, y + 2 * scale, px + 4 * scale, y + 12 * scale);
        }
      }
      // Bandera de celebración o cartel de reclamo, distinguibles sin animación.
      g.lineStyle(2 * scale, 0xc5c0a9); g.lineBetween(x + 27 * scale, y + 10 * scale, x + 27 * scale, y - 25 * scale);
      g.fillStyle(covered ? 0x34b28c : 0xedba54);
      g.fillRect(x + 20 * scale, y - 28 * scale, 20 * scale, 12 * scale);
      if (!covered && variant === 2) {
        // Megáfono simbólico: no crea un evento ni penalización.
        g.fillStyle(0xf5dfb8); g.fillTriangle(x - 24 * scale, y - 10 * scale,
          x - 37 * scale, y - 17 * scale, x - 37 * scale, y - 3 * scale);
      }
      g.lineStyle(2 * scale, 0x0f172a);
      if (covered) {
        g.lineBetween(x + 24 * scale, y - 22 * scale, x + 28 * scale, y - 19 * scale);
        g.lineBetween(x + 28 * scale, y - 19 * scale, x + 35 * scale, y - 25 * scale);
      } else {
        g.lineBetween(x + 30 * scale, y - 26 * scale, x + 30 * scale, y - 22 * scale);
        g.fillStyle(0x0f172a); g.fillCircle(x + 30 * scale, y - 19 * scale, scale);
      }
    }
  }

  private updateResultReaction(delta: number): void {
    // Las escenas conservan el último resultado, pero sus carteles sólo se
    // muestran al revisar esa estación resuelta, nunca durante el nuevo reparto.
    const blocked = !this.gameState?.isSeasonResolved || !!this.waterReplay
      || !!document.querySelector('.modal-backdrop.open, #card-season-feedback.open');
    const index = Math.floor(this.reactionVisibleMs / 9000);
    if (blocked || !this.resultReactions[index]) {
      this.reactionText?.setVisible(false);
      return;
    }
    if (!this.reactionText) {
      this.reactionText = this.add.text(0, 0, '', {
        fontFamily: 'system-ui, sans-serif', fontSize: '15px', color: '#f8fafc',
        backgroundColor: 'rgba(15, 23, 42, 0.97)', padding: { x: 11, y: 9 },
        wordWrap: { width: 205 }, lineSpacing: 5
      }).setDepth(6).setOrigin(0, .5);
    }
    const reaction = this.resultReactions[index];
    const anchor = this.getMapAnchor(reaction.sector);
    const layout = this.getMapLayout();
    this.reactionText.setText(reaction.text).setVisible(true);
    // A la derecha de la compuerta: evita banners de clima/meta y deja libre la toma.
    // En pantallas estrechas usamos el margen izquierdo, sin cruzar la compuerta.
    const intake = this.getIntakeAnchor(reaction.sector);
    const right = Math.max(anchor.x + 82, intake.x + 50);
    const fitsRight = right + this.reactionText.width <= layout.width - 8;
    const x = fitsRight ? right : Math.max(8, Math.min(layout.width - this.reactionText.width - 8, anchor.x - this.reactionText.width - 82));
    const y = Math.max(layout.top + this.reactionText.height / 2 + 8,
      Math.min(layout.top + layout.height - this.reactionText.height / 2 - 8, anchor.y + (fitsRight ? 0 : 45)));
    this.reactionText.setPosition(x, y);
    this.reactionVisibleMs += delta;
  }

  // --- LOOP PRINCIPAL DE ACTUALIZACIÓN (60 FPS LIGERO) ---
  update(time: number, delta: number): void {
    // Limitar delta a máximo 33ms para evitar tirones tras pausas o cambios de pestaña
    const safeDelta = Math.min(delta, 33.3);
    this.animTimer += safeDelta * 0.001;
    const { width, height } = this.scale;
    const { height: effectiveH, top } = this.getMapLayout();
    for (const layer of [this.skyLayer, this.terrainGraphics, this.aquiferGraphics, this.riverBedGraphics,
      this.canalsGraphics, this.reservoirGraphics, this.infrastructureGraphics, this.waterFlowGraphics, this.weatherFXGraphics]) {
      layer.setY(top);
    }

    // Actualizar y dibujar partículas dinámicas
    this.updateWaterFlow(width, effectiveH);
    this.updateAtmosphere(width, effectiveH, safeDelta);
    this.drawWaterReplay();
    this.drawResultActivity();
    this.updateResultReaction(safeDelta);
  }

  // --- ANIMACIÓN CONTINUA DE GOTAS Y FLUJOS DE AGUA ---
  private updateWaterFlow(width: number, height: number): void {
    if (!this.gameState) return;
    const gfx = this.waterFlowGraphics;
    gfx.clear();

    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const scale=Math.max(0.6,Math.min(1,width/850));
    // La vegetación del humedal está encima del lecho: mantener visible la llegada
    // al espejo de Río Vivo sobre esa capa, siguiendo el mismo cauce existente.
    for (const flow of this.visibleFlows) {
      const end=flow.points[flow.points.length-1];
      if (end.y < height*0.88) continue;
      const mouth=flow.points.filter(point=>point.y>=height*0.84);
      if (mouth.length>1) {
        const quality=this.decisionPreview?.waterQuality ?? this.gameState.waterQuality;
        const color=quality<45 ? 0x79532f : quality<70 ? 0x0d9488 : 0x0284c7;
        gfx.lineStyle(26*scale*flow.amount/(flow.amount+22),color,0.95).strokePoints(mouth,false);
      }
    }
    // El aporte adicional conserva su explicación contextual; una ruta extra
    // cruzaría usos y retornos y ocultaría la continuidad del cauce.
    for (const {points,amount,color} of this.visibleFlows) {
      // Espaciado en distancia, no por cantidad de muestras de la curva.
      const lengths=[0];
      for (let i=1;i<points.length;i++) lengths.push(lengths[i-1]+Phaser.Math.Distance.BetweenPoints(points[i-1],points[i]));
      const length=lengths[lengths.length-1];
      if (length<=0) continue;
      const intensity=amount/(amount+22);
      const spacing=scale*(64-18*intensity);
      const count=Math.max(1,Math.floor(length/spacing));
      const travel=reduced ? 0 : this.animTimer*scale*(18+25*intensity);
      let segment=1;
      const distances=Array.from({length:count},(_,i)=>(travel+(i+0.5)*length/count)%length).sort((a,b)=>a-b);
      gfx.lineStyle(1.4*scale,color,0.55);
      for (const distance of distances) {
        while (segment<lengths.length-1 && lengths[segment]<distance) segment++;
        const start=points[segment-1],end=points[segment];
        const t=(distance-lengths[segment-1])/Math.max(0.001,lengths[segment]-lengths[segment-1]);
        const x=start.x+(end.x-start.x)*t,y=start.y+(end.y-start.y)*t;
        const angle=Math.atan2(end.y-start.y,end.x-start.x),size=scale*(3+2*intensity);
        // Destellos longitudinales integrados al agua.
        gfx.lineBetween(x-size*Math.cos(angle),y-size*Math.sin(angle),x+size*Math.cos(angle),y+size*Math.sin(angle));
        gfx.fillStyle(color,0.6).fillCircle(x,y,scale*0.9);
      }
    }
    if (reduced) return;
    const sec = this.gameState.sectors;

    // Función auxiliar para dibujar gotas desplazándose sobre una recta
    const drawParticlesOnSegment = (
      particles: WaterParticle[],
      x1: number, y1: number, x2: number, y2: number,
      color: number,
      allocated: number, maxDemand: number
    ) => {
      if (allocated <= 0) return;
      const speedMult = Math.min(1.6, Math.max(0.4, allocated / Math.max(1, maxDemand)));
      gfx.fillStyle(color, 0.92);

      for (const p of particles) {
        p.progress = (p.progress + p.speed * speedMult) % 1.0;
        const px = x1 + (x2 - x1) * p.progress;
        const py = y1 + (y2 - y1) * p.progress;
        gfx.fillCircle(px, py, p.size * Math.min(1, width / 850));
      }
    };

    for(const [id,particles] of [['population',this.particlesCity],['agriculture',this.particlesAgri],['livestock',this.particlesLive],['mining',this.particlesMine]] as [SectorId,WaterParticle[]][]) {
      const intake=this.getIntakeAnchor(id),sector=this.getMapAnchor(id),top=this.getMapLayout().top;
      drawParticlesOnSegment(particles,intake.x,intake.y-top,sector.x+width*0.04,sector.y-top,0xb9edef,this.decisionPreview?.suppliedAllocations[id]??sec[id].allocated,sec[id].currentDemand);
    }
  }

  // --- ANIMACIÓN DE NUBES, LLUVIA, NIEVE Y AVES ---
  private updateAtmosphere(width: number, height: number, delta: number): void {
    if (!this.gameState) return;
    const gfx = this.weatherFXGraphics;
    gfx.clear();
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const frameStep = reduced ? 0 : delta / (1000 / 60);
    const visualTime = reduced ? 0 : this.animTimer;

    const isWinter = this.gameState.season === 'WINTER';
    const isOverrideStorm = this.eventWeatherOverride === 'STORM';
    const isOverrideDrought = this.eventWeatherOverride === 'DROUGHT';

    const isRaining =
      !isWinter &&
      (isOverrideStorm ||
        this.gameState.season === 'AUTUMN' ||
        this.gameState.climateState === 'WET' ||
        this.gameState.climateState === 'VERY_WET');

    // 1. Nubes
    for (const c of this.clouds) {
      c.x += c.speed * frameStep;
      if (c.x - 70 > width) c.x = -80;

      gfx.fillStyle(isRaining ? 0x64748b : 0xffffff, c.alpha);
      const cx = c.x, cy = c.y, s = c.scale * Math.min(1, width / 850);
      gfx.fillCircle(cx, cy, 22 * s);
      gfx.fillCircle(cx + 18 * s, cy - 6 * s, 18 * s);
      gfx.fillCircle(cx + 34 * s, cy + 2 * s, 20 * s);
      gfx.fillCircle(cx - 16 * s, cy + 3 * s, 16 * s);
    }

    // 2. Lluvia
    if (isRaining) {
      gfx.lineStyle(1.8, 0x38bdf8, 0.75);
      gfx.beginPath();
      for (const r of this.rainDrops) {
        r.y += r.speed * frameStep;
        if (r.y > height * 0.76) {
          r.y = Phaser.Math.Between(20, 80);
          r.x = Phaser.Math.Between(0, width);
        }
        gfx.moveTo(r.x, r.y);
        gfx.lineTo(r.x - 3, r.y + r.len);
      }
      gfx.stroke();
    }

    // 3. Nieve
    if (isWinter) {
      gfx.fillStyle(0xffffff, 0.9);
      for (const s of this.snowFlakes) {
        s.y += s.speed * frameStep;
        s.sway += 0.03 * frameStep;
        const sx = s.x + Math.sin(s.sway) * 2;
        if (s.y > height * 0.76) {
          s.y = Phaser.Math.Between(10, 60);
          s.x = Phaser.Math.Between(0, width);
        }
        gfx.fillCircle(sx, s.y, 2.5);
      }
    }

    // 4. Evaporación de verano (calor y sol fuerte)
    if (isOverrideDrought || (this.gameState.season === 'SUMMER' && !isRaining)) {
      gfx.fillStyle(0xffffff, 0.35);
      for (const v of this.vaporWisps) {
        v.y -= v.speed * frameStep;
        if (v.y < height * 0.22) {
          v.y = height * 0.33 + Math.random() * 15;
        }
        gfx.fillCircle(v.x, v.y, 4);
      }
    }

    // 5. Vida silvestre activa: Aves, Pececitos y Pipo el Carpincho
    const ecoSat = this.ecosystemVitality();
    if (ecoSat > 0.6) {
      // Aves planeando en el cielo abierto
      gfx.lineStyle(1.8, 0x1e293b, 0.85);
      gfx.beginPath();
      for (const b of this.birds) {
        b.x += b.speed * frameStep;
        if (b.x > width * 0.88) b.x = width * 0.12;
        const wing = Math.sin(visualTime * 9 + b.phase) * 3.5;
        const by = b.baseY + Math.sin(visualTime * 1.8 + b.phase) * 5;

        gfx.moveTo(b.x - 6, by - wing);
        gfx.lineTo(b.x, by);
        gfx.lineTo(b.x + 6, by - wing);
      }
      gfx.stroke();

      // Paseo corto por la orilla: deja libres sectores, compuertas y controles.
      const pipoX = width * (0.35 + 0.009 * Math.sin(visualTime * 0.45));
      const pipoY = height * 0.87 + Math.sin(visualTime * 3) * 1.2;
      // Cuerpo del carpincho
      gfx.fillStyle(0x78350f, 1);
      gfx.fillRoundedRect(pipoX, pipoY, 18, 12, 5);
      // Cabeza
      gfx.fillStyle(0x92400e, 1);
      gfx.fillRoundedRect(pipoX + 12, pipoY - 4, 10, 10, 3);
      // Ojo y orejita
      gfx.fillStyle(0x1c1917, 1);
      gfx.fillCircle(pipoX + 18, pipoY - 1, 1.5);
      gfx.fillStyle(0x78350f, 1);
      gfx.fillCircle(pipoX + 13, pipoY - 4, 2);

      // Dos patos recorren únicamente el espejo del humedal, sin objetos nuevos por frame.
      const animalScale = Math.max(0.65, Math.min(1.2, width / 1280));
      for (let i = 0; i < 2; i++) {
        const duckX = width * (0.286 + i * 0.015 + 0.004 * Math.sin(visualTime * 0.7 + i));
        const duckY = height * (0.898 + i * 0.009) + Math.sin(visualTime * 1.2 + i) * animalScale;
        gfx.lineStyle(1, 0xb9edef, 0.55);
        gfx.lineBetween(duckX - 10 * animalScale, duckY + 4 * animalScale, duckX + 8 * animalScale, duckY + 4 * animalScale);
        gfx.fillStyle(0xe7d4a4).fillEllipse(duckX, duckY, 12 * animalScale, 7 * animalScale);
        gfx.fillStyle(0x2c7354).fillCircle(duckX + 5 * animalScale, duckY - 4 * animalScale, 3 * animalScale);
        gfx.fillStyle(0xf59e0b).fillTriangle(duckX + 7 * animalScale, duckY - 5 * animalScale,
          duckX + 11 * animalScale, duckY - 3 * animalScale, duckX + 7 * animalScale, duckY - 2 * animalScale);
      }

      // Pececitos saltando del río si el caudal es óptimo (> 75%)
      if (ecoSat > 0.75) {
        const jumpPhase = (visualTime * 2.5) % (Math.PI * 2);
        if (jumpPhase < Math.PI) {
          const fishX = width * 0.29 + Math.sin(visualTime * 1.5) * 15;
          const fishY = height * 0.88 - Math.sin(jumpPhase) * 14;
          // Cuerpo del pez
          gfx.fillStyle(0xf59e0b, 0.95);
          gfx.fillEllipse(fishX, fishY, 6, 3);
          // Gotas de agua del salto
          gfx.fillStyle(0x38bdf8, 0.8);
          gfx.fillCircle(fishX - 4, fishY + 4, 1.5);
          gfx.fillCircle(fishX + 4, fishY + 3, 1.2);
        }
      }
    }
  }

  // --- DIBUJOS AUXILIARES ---
  private drawRegularPolygon(gfx: Phaser.GameObjects.Graphics, x: number, y: number, radius: number, sides: number): void {
    const points: Phaser.Math.Vector2[] = [];
    for (let i = 0; i < sides; i++) {
      const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
      points.push(new Phaser.Math.Vector2(x + radius * Math.cos(angle), y + radius * Math.sin(angle)));
    }
    gfx.fillPoints(points, true);
  }

  private drawIsometricBuilding(
    gfx: Phaser.GameObjects.Graphics,
    x: number, y: number,
    w: number, h: number,
    cFront: number, cSide: number, cRoof: number
  ): void {
    // Techo
    gfx.fillStyle(cRoof, 1);
    gfx.fillRect(x, y, w, 12);
    // Cara frontal
    gfx.fillStyle(cFront, 1);
    gfx.fillRect(x, y + 12, w * 0.65, h - 12);
    // Cara lateral
    gfx.fillStyle(cSide, 1);
    gfx.fillRect(x + w * 0.65, y + 12, w * 0.35, h - 12);
  }

  private drawHouseWithGableRoof(
    gfx: Phaser.GameObjects.Graphics,
    x: number, y: number,
    w: number, h: number,
    cWall: number, cRoof: number
  ): void {
    gfx.fillStyle(cRoof, 1);
    gfx.fillTriangle(x, y + 10, x + w / 2, y - 6, x + w, y + 10);
    gfx.fillStyle(cWall, 1);
    gfx.fillRect(x + 2, y + 10, w - 4, h - 10);
    // Puerta
    gfx.fillStyle(0x78350f, 1);
    gfx.fillRect(x + w / 2 - 3, y + h - 10, 6, 10);
  }

  private drawFarmBarn(gfx: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number): void {
    // Sombra del granero
    gfx.fillStyle(0x0f172a, 0.3);
    gfx.fillRect(x - 2, y + h - 4, w + 6, 6);

    // Paredes de madera del granero (rojo rústico)
    gfx.fillStyle(0x991b1b, 1);
    gfx.fillRect(x, y + 10, w, h - 10);
    // Cara lateral en sombra
    gfx.fillStyle(0x7f1d1d, 1);
    gfx.fillRect(x + w * 0.7, y + 10, w * 0.3, h - 10);

    // Listones de madera verticales
    gfx.fillStyle(0x571010, 0.4);
    for (let lx = x + 4; lx < x + w; lx += 6) {
      gfx.fillRect(lx, y + 10, 1.5, h - 10);
    }

    // Tejado tradicional a dos aguas
    gfx.fillStyle(0xd97706, 1);
    gfx.fillTriangle(x - 4, y + 11, x + w * 0.45, y - 6, x + w + 4, y + 11);
    gfx.fillStyle(0xb45309, 1);
    gfx.fillTriangle(x + w * 0.45, y - 6, x + w + 4, y + 11, x + w * 0.45, y + 11);

    // Ventana del pajar en el ático con heno asomando
    gfx.fillStyle(0x450a0a, 1);
    gfx.fillRect(x + w * 0.35, y + 2, 8, 6);
    gfx.fillStyle(0xfde047, 1);
    gfx.fillRect(x + w * 0.35 + 1, y + 5, 6, 3); // heno dorado

    // Gran puerta doble del establo
    gfx.fillStyle(0x450a0a, 1);
    gfx.fillRect(x + w * 0.15, y + h - 16, 16, 16);
    // Cruces blancas decorativas en las puertas
    gfx.lineStyle(1.5, 0xffffff, 0.85);
    gfx.strokeRect(x + w * 0.15, y + h - 16, 16, 16);
    gfx.lineBetween(x + w * 0.15, y + h - 16, x + w * 0.15 + 16, y + h);
    gfx.lineBetween(x + w * 0.15 + 16, y + h - 16, x + w * 0.15, y + h);
  }

  private drawFarmSilo(gfx: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number): void {
    // Sombra del silo
    gfx.fillStyle(0x0f172a, 0.25);
    gfx.fillEllipse(x + w / 2, y + h, w + 4, 6);

    // Cuerpo cilíndrico metálico
    gfx.fillStyle(0x94a3b8, 1);
    gfx.fillRect(x, y + 8, w, h - 8);
    // Brillo cilíndrico
    gfx.fillStyle(0xe2e8f0, 0.9);
    gfx.fillRect(x + 2, y + 8, w * 0.4, h - 8);
    // Sombra lateral
    gfx.fillStyle(0x475569, 1);
    gfx.fillRect(x + w * 0.7, y + 8, w * 0.3, h - 8);

    // Cúpula abovedada plateada
    gfx.fillStyle(0x64748b, 1);
    gfx.fillEllipse(x + w / 2, y + 8, w, 12);
    gfx.fillStyle(0xe2e8f0, 1);
    gfx.fillEllipse(x + w / 2 - 2, y + 6, w * 0.7, 8);

    // Bandas metálicas de refuerzo
    gfx.lineStyle(1.5, 0x334155, 0.7);
    for (let sy = y + 16; sy < y + h; sy += 8) {
      gfx.lineBetween(x, sy, x + w, sy);
    }
  }

  private drawWaterTrough(gfx: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number): void {
    // Tina / bebedero de piedra
    gfx.fillStyle(0x334155, 1);
    gfx.fillRoundedRect(x - 2, y - 2, w + 4, h + 4, 4);

    // Interior con agua fresca azul cristalina
    gfx.fillStyle(0x0284c7, 1);
    gfx.fillRoundedRect(x, y, w, h, 3);
    gfx.fillStyle(0x38bdf8, 0.9);
    gfx.fillRect(x + 2, y + 2, w - 4, h * 0.45);
    // Brillo de agua limpia
    gfx.fillStyle(0xffffff, 0.75);
    gfx.fillCircle(x + 4, y + 3, 1.5);
  }

  private drawCorralFence(gfx: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number): void {
    // Postes verticales de madera
    const postCount = 6;
    const step = w / (postCount - 1);
    gfx.fillStyle(0x78350f, 1);

    // Travesaños horizontales (valla de doble larguero)
    gfx.lineStyle(2, 0x9a3412, 1);
    gfx.lineBetween(x, y + 6, x + w, y + 6);
    gfx.lineBetween(x, y + 14, x + w, y + 14);

    // Travesaño trasero
    gfx.lineBetween(x, y + h - 6, x + w, y + h - 6);

    for (let i = 0; i < postCount; i++) {
      const px = x + i * step;
      gfx.fillRect(px - 1.5, y + 2, 3, 18);
      gfx.fillRect(px - 1.5, y + h - 10, 3, 16);
    }
  }

  private drawHayBale(gfx: Phaser.GameObjects.Graphics, x: number, y: number): void {
    // Fardo de heno cilíndrico
    gfx.fillStyle(0xd97706, 1);
    gfx.fillRoundedRect(x, y, 14, 9, 3);
    gfx.fillStyle(0xfacc15, 1);
    gfx.fillCircle(x + 3, y + 4.5, 4);
    // Cuerdas de atado
    gfx.lineStyle(1, 0x78350f, 0.8);
    gfx.lineBetween(x + 7, y, x + 7, y + 9);
    gfx.lineBetween(x + 10, y, x + 10, y + 9);
  }

  private drawCuteCow(gfx: Phaser.GameObjects.Graphics, x: number, y: number, scale: number = 1, isLying: boolean = false): void {
    const s = scale;
    // Sombra de la vaca
    gfx.fillStyle(0x0f172a, 0.25);
    if (isLying) {
      gfx.fillEllipse(x + 10 * s, y + 10 * s, 26 * s, 10 * s);
    } else {
      gfx.fillEllipse(x + 10 * s, y + 16 * s, 24 * s, 8 * s);
    }

    // Cuerpo blanco redondeado
    gfx.fillStyle(0xffffff, 1);
    if (isLying) {
      gfx.fillRoundedRect(x, y + 2 * s, 22 * s, 12 * s, 5 * s);
    } else {
      gfx.fillRoundedRect(x, y, 22 * s, 13 * s, 4 * s);
      // 4 Patitas con pezuñas negras
      gfx.fillStyle(0x1e293b, 1);
      gfx.fillRect(x + 2 * s, y + 13 * s, 3 * s, 5 * s);
      gfx.fillRect(x + 7 * s, y + 13 * s, 3 * s, 5 * s);
      gfx.fillRect(x + 14 * s, y + 13 * s, 3 * s, 5 * s);
      gfx.fillRect(x + 18 * s, y + 13 * s, 3 * s, 5 * s);
      // Pezuñas
      gfx.fillStyle(0x64748b, 1);
      gfx.fillRect(x + 2 * s, y + 16.5 * s, 3 * s, 1.5 * s);
      gfx.fillRect(x + 14 * s, y + 16.5 * s, 3 * s, 1.5 * s);
    }

    // Manchas negras distintivas (tipo Holando)
    gfx.fillStyle(0x1e293b, 1);
    gfx.fillCircle(x + 7 * s, y + 5 * s, 4 * s);
    gfx.fillCircle(x + 16 * s, y + 7 * s, 3.5 * s);
    gfx.fillCircle(x + 12 * s, y + 3 * s, 2.5 * s);

    // Colita con mechón
    gfx.lineStyle(1.5 * s, 0x1e293b, 1);
    gfx.beginPath();
    gfx.moveTo(x + 22 * s, y + 4 * s);
    gfx.lineTo(x + 25 * s, y + 8 * s);
    gfx.stroke();
    gfx.fillStyle(0x1e293b, 1);
    gfx.fillCircle(x + 25.5 * s, y + 9 * s, 1.8 * s);

    // Cabeza de la vaca
    const headX = isLying ? x - 4 * s : x - 6 * s;
    const headY = isLying ? y - 1 * s : y - 3 * s;
    gfx.fillStyle(0xffffff, 1);
    gfx.fillRoundedRect(headX, headY, 10 * s, 10 * s, 3 * s);

    // Mancha en la cabeza / oreja
    gfx.fillStyle(0x1e293b, 1);
    gfx.fillCircle(headX + 2.5 * s, headY + 2.5 * s, 2.5 * s);

    // Cuernitos simpáticos beige
    gfx.fillStyle(0xd97706, 1);
    gfx.fillTriangle(headX + 2 * s, headY, headX + 3 * s, headY - 3 * s, headX + 4 * s, headY);
    gfx.fillTriangle(headX + 6 * s, headY, headX + 7 * s, headY - 3 * s, headX + 8 * s, headY);

    // Orejitas caídas
    gfx.fillStyle(0xffffff, 1);
    gfx.fillEllipse(headX - 1.5 * s, headY + 3 * s, 3.5 * s, 2 * s);
    gfx.fillStyle(0x1e293b, 1);
    gfx.fillEllipse(headX + 10.5 * s, headY + 3 * s, 3.5 * s, 2 * s);

    // Hocico rosadito tierno
    gfx.fillStyle(0xf472b6, 1);
    gfx.fillRoundedRect(headX - 1 * s, headY + 6 * s, 8 * s, 4.5 * s, 2 * s);
    // Fosas nasales
    gfx.fillStyle(0x831843, 1);
    gfx.fillCircle(headX + 1.5 * s, headY + 8 * s, 0.8 * s);
    gfx.fillCircle(headX + 4.5 * s, headY + 8 * s, 0.8 * s);

    // Ojitos
    gfx.fillStyle(0x0f172a, 1);
    gfx.fillCircle(headX + 2 * s, headY + 4 * s, 1.2 * s);
    gfx.fillCircle(headX + 7 * s, headY + 4 * s, 1.2 * s);
  }

  private drawCuteSheep(gfx: Phaser.GameObjects.Graphics, x: number, y: number, scale: number = 1): void {
    const s = scale;
    // Sombra de la oveja
    gfx.fillStyle(0x0f172a, 0.22);
    gfx.fillEllipse(x + 5 * s, y + 13 * s, 18 * s, 6 * s);

    // Patitas oscuras
    gfx.fillStyle(0x334155, 1);
    gfx.fillRect(x + 1 * s, y + 8 * s, 2.2 * s, 6 * s);
    gfx.fillRect(x + 5 * s, y + 8 * s, 2.2 * s, 6 * s);
    gfx.fillRect(x + 10 * s, y + 8 * s, 2.2 * s, 6 * s);
    gfx.fillRect(x + 13 * s, y + 8 * s, 2.2 * s, 6 * s);

    // Lana esponjosa mullida (nube de bolitas blancas y crema)
    gfx.fillStyle(0xe2e8f0, 1);
    gfx.fillCircle(x + 4 * s, y + 5 * s, 6 * s);
    gfx.fillCircle(x + 11 * s, y + 5 * s, 5.5 * s);
    gfx.fillCircle(x + 8 * s, y + 2 * s, 5.5 * s);
    gfx.fillCircle(x + 8 * s, y + 7 * s, 5 * s);

    gfx.fillStyle(0xffffff, 1);
    gfx.fillCircle(x + 4 * s, y + 4 * s, 5 * s);
    gfx.fillCircle(x + 10 * s, y + 4 * s, 4.5 * s);
    gfx.fillCircle(x + 7 * s, y + 2 * s, 4.5 * s);

    // Cabeza y orejas oscuras de la oveja
    gfx.fillStyle(0x1e293b, 1);
    gfx.fillEllipse(x - 2 * s, y + 4 * s, 5.5 * s, 4.5 * s);
    // Orejitas
    gfx.fillEllipse(x - 3 * s, y + 1.5 * s, 2.5 * s, 1.5 * s);
    gfx.fillEllipse(x - 3 * s, y + 6.5 * s, 2.5 * s, 1.5 * s);

    // Ojito tierno
    gfx.fillStyle(0xffffff, 1);
    gfx.fillCircle(x - 2.5 * s, y + 3.2 * s, 1 * s);
    gfx.fillStyle(0x0f172a, 1);
    gfx.fillCircle(x - 2.8 * s, y + 3.2 * s, 0.6 * s);
  }
}
