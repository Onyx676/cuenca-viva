import eventsData from '../data/events.json';
import { GameEvent, TriggeredEventRecord, EventOption } from '../models/Event';
import { GameState } from '../models/GameState';
import { SeededRandom } from './RandomSystem';
import { UpgradeSystem } from './UpgradeSystem';

export class EventSystem {
  private events: GameEvent[];
  private rng: SeededRandom;
  private triggeredInteractiveHistory: Set<string> = new Set();
  private lastPassiveTurn = new Map<string, number>();

  constructor(rng: SeededRandom, private upgradeSys = new UpgradeSystem()) {
    this.events = JSON.parse(JSON.stringify(eventsData));
    this.rng = rng;
  }

  public checkAndTriggerEvents(state: GameState): {
    records: TriggeredEventRecord[];
    interactiveEvent: GameEvent | null;
  } {
    const records: TriggeredEventRecord[] = [];
    let interactiveEvent: GameEvent | null = null;

    // 1. Filtrar eventos candidatos cuyas condiciones se cumplan
    // Sorteos fijos sobre TODO el catálogo: las decisiones no desplazan futuros eventos.
    const shuffled = [...this.events];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = this.rng.rangeInt(0, i);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const occurrence = new Map(this.events.map(event => [event.id, this.rng.chance(event.conditions.probability)]));
    const eligibleEvents = shuffled.filter((event) => {
      const cond = event.conditions;
      if (cond.cooldownTurns !== undefined &&
        state.turn - (this.lastPassiveTurn.get(event.id) ?? -Infinity) < cond.cooldownTurns) return false;
      if (cond.minLastCoverage) {
        // Only an already resolved balance can justify recognition, never this turn's preview.
        const last = state.seasonHistory[state.seasonHistory.length - 1]?.balance;
        const gate = cond.minLastCoverage;
        if (!last || last.satisfactions.population < gate.urban ||
          last.satisfactions.ecosystem < gate.ecological || last.waterQuality < gate.quality ||
          ['agriculture', 'livestock', 'mining'].some(id =>
            last.satisfactions[id as 'agriculture' | 'livestock' | 'mining'] < gate.productive)) return false;
      }
      if (cond.minYear && state.year < cond.minYear) return false;
      if (cond.seasons && !cond.seasons.includes(state.season)) return false;
      if (cond.climateStates && !cond.climateStates.includes(state.climateState)) return false;

      if (cond.upgradeNotOwned) {
        const lvl = state.upgrades[cond.upgradeNotOwned]?.currentLevel || 0;
        if (lvl > 0) return false;
      }

      if (cond.aquiferThreshold !== undefined && state.aquiferVolume > cond.aquiferThreshold) {
        return false;
      }

      if (cond.minTrust !== undefined && state.publicTrust < cond.minTrust) {
        return false;
      }

      if (cond.minBasinHealth !== undefined && state.basinHealth < cond.minBasinHealth) {
        return false;
      }

      return true;
    });

    // 2. Separar interactivos y oportunidades pasivas
    const interactiveCandidates = eligibleEvents.filter(
      (e) => e.isInteractive && e.options && e.options.length > 0
    );
    const passiveCandidates = eligibleEvents.filter(
      (e) => !e.isInteractive
    );

    // 3. Mezclar aleatoriamente los interactivos para variedad total
    const shuffledInteractive = interactiveCandidates;

    // Priorizar eventos que aún no se hayan visto en la partida
    let pool = shuffledInteractive.filter((e) => !this.triggeredInteractiveHistory.has(e.id));
    if (pool.length === 0 && shuffledInteractive.length > 0) {
      this.triggeredInteractiveHistory.clear();
      pool = shuffledInteractive;
    }

    for (const event of pool) {
      if (occurrence.get(event.id)) {
        interactiveEvent = event;
        this.triggeredInteractiveHistory.add(event.id);
        break;
      }
    }

    // 4. Evaluar oportunidades pasivas (subsidios, premios)
    const shuffledPassive = passiveCandidates;
    for (const event of shuffledPassive) {
      if (occurrence.get(event.id)) {
        this.lastPassiveTurn.set(event.id, state.turn);
        records.push({
          event,
          wasMitigated: true,
          impactSummary: event.narrativeMitigated || event.description
        });
        if (records.length >= 2) break;
      }
    }

    return { records, interactiveEvent };
  }

  /**
   * Aplica la decisión tomada por el jugador en un evento interactivo.
   */
  public canChooseOption(event: GameEvent, optionId: string, state: GameState): { allowed: boolean; reason?: string } {
    const option = event.options?.find(o => o.id === optionId);
    if (!option) return { allowed: false, reason: 'Opción inexistente' };
    if (option.requiresUpgrade && !(state.upgrades[option.requiresUpgrade]?.currentLevel > 0)) {
      return { allowed: false, reason: 'Requiere construir la obra indicada' };
    }
    if (option.projectUpgradeId) {
      const project = this.upgradeSys.canPurchase(option.projectUpgradeId, state.upgrades, state.money);
      if (!project.canBuy) return { allowed: false, reason: project.reason };
    }
    if (state.money + (option.effects.moneyDelta ?? 0) < 0) return { allowed: false, reason: 'Presupuesto insuficiente' };
    if (state.reservoirVolume + (option.effects.reservoirDelta ?? 0) < 0) return { allowed: false, reason: 'No hay suficiente agua en el embalse' };
    if (state.aquiferVolume + (option.effects.aquiferDelta ?? 0) < 0) return { allowed: false, reason: 'No hay suficiente agua en el acuífero' };
    return { allowed: true };
  }

  public applyOptionChoice(
    event: GameEvent,
    optionId: string,
    state: GameState
  ): TriggeredEventRecord {
    const option = event.options?.find(o => o.id === optionId);
    if (!option || !this.canChooseOption(event, optionId, state).allowed) {
      return {
        event,
        wasMitigated: false,
        impactSummary: event.description
      };
    }

    const before = { money: state.money, trust: state.publicTrust, health: state.basinHealth, quality: state.waterQuality };
    const fx = { ...option.effects };
    let outcome: TriggeredEventRecord['outcome'];
    if (event.id === 'fugas_red_ciudad' && ['reparar_canerias', 'sensores_red', 'postergar_fuga', 'renovar_red'].includes(option.id)) {
      const networkLevel = Math.min(3, state.upgrades.reparacion_red?.currentLevel ?? 0);
      const reserveRatio = state.reservoirCapacity > 0 ? state.reservoirVolume / state.reservoirCapacity : 0;
      const dry = state.climateState === 'DRY' || state.climateState === 'VERY_DRY';
      // Probabilidades conceptuales de recepción social; no predicción científica.
      const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
      const favorable = clamp(.35 + .10 * networkLevel + (reserveRatio >= .5 ? .10 : reserveRatio < .2 ? -.10 : 0) - (dry ? .10 : 0), .20, .65);
      const difficult = clamp(.25 - .05 * networkLevel + (dry ? .10 : 0) + (reserveRatio < .2 ? .10 : 0), .10, .45);
      const roll = new SeededRandom(`${state.seed}:project-outcomes:v1:${state.turn}:${event.id}`).next();
      const kind = roll < difficult ? 'difficult' : roll >= 1 - favorable ? 'favorable' : 'ordinary';
      outcome = { kind, networkLevel, reserveRatio, dry };
      const receptions: Record<string, [number, number, number]> = {
        reparar_canerias: [3, 5, 6], sensores_red: [5, 7, 8], postergar_fuga: [-6, -4, -2], renovar_red: [1, 3, 5]
      };
      fx.trustDelta = receptions[option.id][kind === 'difficult' ? 0 : kind === 'ordinary' ? 1 : 2];
    }
    let project: TriggeredEventRecord['project'];
    if (option.projectUpgradeId) {
      const purchase = this.upgradeSys.purchase(option.projectUpgradeId, state.upgrades, state.money);
      // La validación anterior y la compra son sincrónicas; no existe un sorteo entre ellas que cambie presupuesto.
      if (!purchase.success) throw new Error('La obra validada no pudo construirse');
      project = { upgradeId: option.projectUpgradeId, level: purchase.newLevel, cost: state.money - purchase.newMoney };
      state.money = purchase.newMoney;
    }
    const reservoirBefore = state.reservoirVolume;
    const aquiferBefore = state.aquiferVolume;
    if (fx.reservoirDelta) {
      state.reservoirVolume = Math.max(0, Math.min(state.reservoirCapacity, state.reservoirVolume + fx.reservoirDelta));
    }
    if (fx.aquiferDelta) {
      state.aquiferVolume = Math.max(0, Math.min(state.aquiferCapacity, state.aquiferVolume + fx.aquiferDelta));
    }
    if (fx.moneyDelta) {
      state.money = Math.max(0, state.money + fx.moneyDelta);
    }
    if (fx.trustDelta) {
      state.publicTrust = Math.max(0, Math.min(100, state.publicTrust + fx.trustDelta));
    }
    if (fx.basinHealthDelta) {
      state.basinHealth = Math.max(0, Math.min(100, state.basinHealth + fx.basinHealthDelta));
    }
    if (fx.waterQualityDelta) {
      state.waterQuality = Math.max(10, Math.min(100, state.waterQuality + fx.waterQualityDelta));
    }

    const reservoirChange = state.reservoirVolume - reservoirBefore;
    const aquiferChange = state.aquiferVolume - aquiferBefore;
    return {
      event,
      wasMitigated: fx.floodDamageAvoided ?? true,
      impactSummary: `Elegiste «${option.label}». Cambios reales: presupuesto ${state.money - before.money}; confianza ${state.publicTrust - before.trust}; salud de cuenca ${state.basinHealth - before.health}; calidad ${state.waterQuality - before.quality}; embalse ${reservoirChange >= 0 ? '+' : ''}${reservoirChange}; acuífero ${aquiferChange >= 0 ? '+' : ''}${aquiferChange}. El agua se ajusta fuera del reparto normal.`,
      chosenOptionId: option.id,
      ...(outcome ? { outcome } : {}), ...(project ? { project } : {}),
      appliedEffects: { moneyDelta: state.money - before.money, trustDelta: state.publicTrust - before.trust,
        basinHealthDelta: state.basinHealth - before.health, waterQualityDelta: state.waterQuality - before.quality },
      waterAdjustment: {
        reservoirChange, aquiferChange,
        externalInflow: Math.max(0, reservoirChange) + Math.max(0, aquiferChange),
        externalOutflow: Math.max(0, -reservoirChange) + Math.max(0, -aquiferChange)
      }
    };
  }
}
