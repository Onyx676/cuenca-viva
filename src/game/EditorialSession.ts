/** Local presentation metadata. It never enters the hydrological state or its PRNG. */
export const EDITORIAL_SESSION_COUNTER_KEY = 'cuenca-viva:editorial-session-counter:v1';
type StorageAccess = () => Pick<Storage, 'getItem' | 'setItem'>;
export function validEditorialSession(value: unknown): value is number {
  return Number.isSafeInteger(value) && (value as number) >= 0;
}
export function createEditorialSessionCounter(access: StorageAccess) {
  let nextInMemory = 0;
  return () => {
    let next = nextInMemory;
    try {
      const raw = access().getItem(EDITORIAL_SESSION_COUNTER_KEY);
      const saved = raw === null ? 0 : Number(raw);
      if (validEditorialSession(saved)) next = Math.max(next, saved);
    } catch { /* Storage may be unavailable; keep varying during this app session. */ }
    nextInMemory = next < Number.MAX_SAFE_INTEGER ? next + 1 : 0;
    try { access().setItem(EDITORIAL_SESSION_COUNTER_KEY, String(nextInMemory)); } catch { /* Memory fallback. */ }
    return next;
  };
}
export function editorialSeed(gameplaySeed: string, session: number): string {
  return `EDITORIAL_SESSION:${validEditorialSession(session) ? session : 0}:${gameplaySeed}`;
}
export function unpackEditorialSeed(seed: string): { seed: string; rotation: number } {
  const match = /^EDITORIAL_SESSION:(\d+):([\s\S]*)$/.exec(seed);
  const rotation = match ? Number(match[1]) : 0;
  return match && validEditorialSession(rotation) ? { seed: match[2], rotation } : { seed, rotation: 0 };
}
