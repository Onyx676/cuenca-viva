import eventsData from '../data/events.json';
import { GameEvent, TriggeredEventRecord, EventOption } from '../models/Event';
import { GameState } from '../models/GameState';
import { SeededRandom } from './RandomSystem';

export class EventSystem {
  private events: GameEvent[];
  private rng: SeededRandom;
  private triggeredInteractiveHistory: Set<string> = new Set();

  constructor(rng: SeededRandom) {
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
    const eligibleEvents = this.events.filter((event) => {
      const cond = event.conditions;
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
    const shuffledInteractive = [...interactiveCandidates].sort(() => this.rng.next() - 0.5);

    // Priorizar eventos que aún no se hayan visto en la partida
    let pool = shuffledInteractive.filter((e) => !this.triggeredInteractiveHistory.has(e.id));
    if (pool.length === 0 && shuffledInteractive.length > 0) {
      this.triggeredInteractiveHistory.clear();
      pool = shuffledInteractive;
    }

    for (const event of pool) {
      if (this.rng.chance(event.conditions.probability)) {
        interactiveEvent = event;
        this.triggeredInteractiveHistory.add(event.id);
        break;
      }
    }

    // 4. Evaluar oportunidades pasivas (subsidios, premios)
    const shuffledPassive = [...passiveCandidates].sort(() => this.rng.next() - 0.5);
    for (const event of shuffledPassive) {
      if (this.rng.chance(event.conditions.probability)) {
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
  public applyOptionChoice(
    event: GameEvent,
    optionId: string,
    state: GameState
  ): TriggeredEventRecord {
    const option = event.options?.find(o => o.id === optionId) || event.options?.[0];
    if (!option) {
      return {
        event,
        wasMitigated: false,
        impactSummary: event.description
      };
    }

    const fx = option.effects;
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

    return {
      event,
      wasMitigated: fx.floodDamageAvoided ?? true,
      impactSummary: option.consequenceText,
      chosenOptionId: option.id
    };
  }
}
