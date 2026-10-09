import type { GameState } from './models/GameState';

const SECTORS = ['population', 'agriculture', 'livestock', 'mining', 'ecosystem'] as const;
type Allocations = Record<typeof SECTORS[number], number>;
export type SessionAction =
  | { type: 'allocation'; turn: number; values: Allocations }
  | { type: 'event-choice'; turn: number; eventId: string; optionId: string }
  | { type: 'purchase'; turn: number; upgradeId: string }
  | { type: 'resolve'; turn: number }
  | { type: 'advance'; turn: number };

function allocationAction(state: GameState): SessionAction {
  return { type: 'allocation', turn: state.turn,
    values: Object.fromEntries(SECTORS.map(id => [id, state.sectors[id].allocated])) as Allocations };
}

/** UI-owned log: create only with a fresh engine, discard during tutorial.
 * Capture committed allocations at action boundaries, never suggestion trials or previews.
 */
export class SessionLog {
  private readonly initialState: GameState;
  private readonly actions: SessionAction[] = [];

  constructor(freshState: GameState) {
    this.initialState = structuredClone(freshState);
  }

  captureAllocations(state: GameState): void {
    if (!state.isSeasonResolved) this.actions.push(allocationAction(state));
  }

  record(action: Exclude<SessionAction, { type: 'allocation' }>): void {
    this.actions.push({ ...action });
  }

  snapshot(state: GameState) {
    // Include pending slider changes without modifying the live log on export.
    const actions = structuredClone(this.actions);
    if (!state.isSeasonResolved) actions.push(allocationAction(state));
    return { initialState: structuredClone(this.initialState), actions };
  }
}

/** Detached diagnostic data; no DOM, engine mutation, RNG or restoration. */
export function createSessionExport(state: GameState, modelVersion: string,
  log: SessionLog | null, exportedAt: string, context: 'game' | 'tutorial' = 'game') {
  return {
    schemaVersion: 1,
    modelVersion,
    exportedAt,
    metadata: { scenarioId: state.scenarioId, seed: state.seed,
      isClassroomMode: state.isClassroomMode, context,
      ...(state.goalRulesVersion ? { goalRulesVersion: state.goalRulesVersion } : {}) },
    recording: log ? { kind: 'complete-action-log' as const, ...log.snapshot(state) }
      : { kind: 'snapshot-only' as const, reason: context === 'tutorial'
        ? 'Práctica del tutorial; no es una partida reproducible.'
        : 'No se registraron acciones desde el inicio de esta partida.' },
    snapshot: structuredClone(state),
    limitations: [
      'Replay requiere las mismas fuentes y datos del modelo; no se garantiza compatibilidad futura.',
      'El historial de balances y las obras actuales no reconstruyen compras anteriores ni prueban causalidad.',
      'El log guarda decisiones del motor y repartos en sus límites; no movimientos de sliders ni vistas previas.',
      'Modelo educativo conceptual, no una herramienta profesional de predicción.'
    ]
  };
}
