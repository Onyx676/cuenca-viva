import type { GameState } from './models/GameState';
import { SimulationEngine } from './simulation/SimulationEngine';
import { SessionLog, createSessionExport, type SessionAction } from './sessionExport';

export const RECOVERY_KEY = 'cuenca-viva:recovery:v1';
export const RECOVERY_BACKUP_KEY = 'cuenca-viva:recovery:previous:v1';
const SECTORS = ['population', 'agriculture', 'livestock', 'mining', 'ecosystem'] as const;
const MAX_ACTIONS = 10000;
const MAX_SAVED_CHARACTERS = 4_000_000;
type StorageAccess = () => Pick<Storage, 'getItem' | 'setItem'>;
type Recovered = { ok: true; engine: SimulationEngine; log: SessionLog; savedAt: string };
type Rejected = { ok: false; reason: string };
export type RecoveryRead =
  | ({ kind: 'ready'; raw: string } & Recovered)
  | { kind: 'rejected'; raw: string; reason: string }
  | { kind: 'missing' }
  | { kind: 'unavailable'; reason: string };

export function createRecoveryPacket(state: GameState, log: SessionLog | null, savedAt: string) {
  if (!log || state.turn < 1 || state.year < 1) return null;
  return { recoverySchemaVersion: 1,
    session: createSessionExport(state, SimulationEngine.MODEL_VERSION, log, savedAt) };
}

function object(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function equalJSON(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((value, i) => equalJSON(value, b[i]));
  }
  if (!object(a) || !object(b)) return false;
  const keys = Object.keys(a);
  return keys.length === Object.keys(b).length && keys.every(key =>
    Object.hasOwn(b, key) && equalJSON(a[key], b[key]));
}

function validAction(value: unknown): value is SessionAction {
  if (!object(value) || !Number.isInteger(value.turn) || (value.turn as number) < 1 || (value.turn as number) > 20) return false;
  switch (value.type) {
    case 'allocation': {
      const values = value.values;
      return object(values) && Object.keys(values).length === SECTORS.length && SECTORS.every(id =>
        Number.isSafeInteger(values[id]) && (values[id] as number) >= 0);
    }
    case 'event-choice': return typeof value.eventId === 'string' && typeof value.optionId === 'string';
    case 'purchase': return typeof value.upgradeId === 'string';
    case 'resolve': case 'advance': return true;
    default: return false;
  }
}

/** Rebuild every private system and PRNG by replay; never assign a saved GameState.
 * Validation failure discards only this fresh replay, never the caller's game or storage.
 */
export function replayRecovery(packet: unknown): Recovered | Rejected {
  try {
    if (!object(packet) || packet.recoverySchemaVersion !== 1 || !object(packet.session)) {
      return { ok: false, reason: 'Formato de copia local no compatible.' };
    }
    const data = packet.session;
    if (data.schemaVersion !== 1 || data.modelVersion !== SimulationEngine.MODEL_VERSION) {
      return { ok: false, reason: 'La copia pertenece a otra versión del modelo. Se conserva sin reemplazarla.' };
    }
    const meta = data.metadata;
    const recording = data.recording;
    if (!object(meta) || meta.context !== 'game' || typeof meta.scenarioId !== 'string'
      || typeof meta.seed !== 'string' || typeof meta.isClassroomMode !== 'boolean'
      || typeof data.exportedAt !== 'string' || !object(recording)
      || recording.kind !== 'complete-action-log' || !Array.isArray(recording.actions)
      || recording.actions.length > MAX_ACTIONS || !recording.actions.every(validAction)) {
      return { ok: false, reason: 'La copia no contiene un registro de partida válido y completo.' };
    }
    const engine = new SimulationEngine(meta.scenarioId, meta.seed, meta.isClassroomMode);
    if (engine.getState().scenarioId !== meta.scenarioId || !equalJSON(engine.getState(), recording.initialState)) {
      return { ok: false, reason: 'Las fuentes o datos del modelo cambiaron; se conserva la copia original.' };
    }
    const log = new SessionLog(engine.getState());
    const actions = recording.actions as SessionAction[];
    for (let i = 0; i < actions.length; i++) {
      const action = actions[i];
      const state = engine.getState();
      if (state.turn !== action.turn) throw new Error('Turno fuera de orden');
      switch (action.type) {
        case 'allocation':
          if (state.isSeasonResolved || state.isGameOver) throw new Error('Reparto fuera de fase');
          for (const id of SECTORS) engine.setSectorAllocation(id, action.values[id]);
          // SessionLog.snapshot will reproduce the final pending allocation. Avoid
          // adding it twice on every load/save cycle, without changing SessionLog.
          if (i < actions.length - 1) log.captureAllocations(state);
          break;
        case 'event-choice':
          if (state.activeInteractiveEvent?.id !== action.eventId
            || !engine.canChooseEventOption(action.optionId).allowed) throw new Error('Evento no válido');
          engine.chooseEventOption(action.optionId);
          log.record(action);
          break;
        case 'purchase':
          if (!engine.purchaseUpgrade(action.upgradeId).success) throw new Error('Compra no válida');
          log.record(action);
          break;
        case 'resolve':
          if (state.isSeasonResolved || state.isGameOver || state.activeInteractiveEvent) throw new Error('Resolución fuera de fase');
          engine.resolveSeason();
          log.record(action);
          break;
        case 'advance':
          if (!state.isSeasonResolved || state.isGameOver) throw new Error('Avance fuera de fase');
          engine.advanceToNextTurn();
          if (state.turn !== action.turn + 1) throw new Error('Avance incompleto');
          log.record(action);
          break;
      }
    }
    if (!equalJSON(engine.getState(), data.snapshot)) {
      return { ok: false, reason: 'El replay no coincide con el estado guardado. Se conserva la copia original.' };
    }
    return { ok: true, engine, log, savedAt: data.exportedAt };
  } catch {
    return { ok: false, reason: 'No se pudo verificar el registro de la partida. Se conserva la copia original.' };
  }
}

/** Storage is injected; these functions neither access globals nor remove copies. */
export function readRecovery(access: StorageAccess): RecoveryRead {
  let raw: string | null;
  try { raw = access().getItem(RECOVERY_KEY); }
  catch { return { kind: 'unavailable', reason: 'Este navegador no permite leer la copia local.' }; }
  if (raw === null) return { kind: 'missing' };
  try {
    if (raw.length > MAX_SAVED_CHARACTERS) throw new Error('Copia demasiado grande');
    const result = replayRecovery(JSON.parse(raw));
    return result.ok ? { kind: 'ready', raw, ...result }
      : { kind: 'rejected', raw, reason: result.reason };
  } catch {
    return { kind: 'rejected', raw, reason: 'La copia local no se puede leer. Se conserva sin reemplazarla.' };
  }
}

export function writeRecovery(access: StorageAccess,
  packet: NonNullable<ReturnType<typeof createRecoveryPacket>>, preserveOriginal: boolean): { ok: true } | Rejected {
  try {
    const raw = JSON.stringify(packet);
    if (raw.length > MAX_SAVED_CHARACTERS) throw new Error('Copia demasiado grande');
    const storage = access();
    if (preserveOriginal) {
      const previous = storage.getItem(RECOVERY_KEY);
      // Deliberate new-game choice archives the old raw bytes before replacement,
      // including incompatible/corrupt data. A failed archive leaves it untouched.
      if (previous !== null) storage.setItem(RECOVERY_BACKUP_KEY, previous);
    }
    storage.setItem(RECOVERY_KEY, raw);
    return { ok: true };
  } catch {
    return { ok: false, reason: 'No se pudo guardar la copia local. Podés seguir jugando y guardar el diagnóstico JSON.' };
  }
}
