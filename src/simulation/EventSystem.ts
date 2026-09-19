import eventsData from '../data/events.json';
import { GameEvent, TriggeredEventRecord, EventOption } from '../models/Event';
import { GameState } from '../models/GameState';
import { SeededRandom } from './RandomSystem';

export class EventSystem {
  private events: GameEvent[];
  private rng: SeededRandom;

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

    for (const event of this.events) {
      const cond = event.conditions;

      if (cond.minYear && state.year < cond.minYear) continue;
      if (cond.seasons && !cond.seasons.includes(state.season)) continue;
      if (cond.climateStates && !cond.climateStates.includes(state.climateState)) continue;

      if (cond.upgradeNotOwned) {
        const lvl = state.upgrades[cond.upgradeNotOwned]?.currentLevel || 0;
        if (lvl > 0) continue;
      }

      if (cond.aquiferThreshold !== undefined && state.aquiferVolume > cond.aquiferThreshold) {
        continue;
      }

      if (cond.minTrust !== undefined && state.publicTrust < cond.minTrust) {
        continue;
      }

      if (cond.minBasinHealth !== undefined && state.basinHealth < cond.minBasinHealth) {
        continue;
      }

      // Tirada determinista
      if (this.rng.chance(cond.probability)) {
        if (event.isInteractive && event.options && event.options.length > 0) {
          // Si es interactivo, lo marcamos para que el jugador tome la decisión
          interactiveEvent = event;
          break; // Un evento interactivo a la vez
        } else {
          // Evento directo (oportunidad, subsidio, etc.)
          records.push({
            event,
            wasMitigated: true,
            impactSummary: event.narrativeMitigated || event.description
          });
          if (records.length >= 2) break;
        }
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
