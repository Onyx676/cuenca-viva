/**
 * Generador determinista de números pseudoaleatorios basado en Mulberry32.
 * Permite que un código de aula como "AULA-2026-001" produzca exactamente
 * la misma secuencia de clima, eventos y condiciones para todos los estudiantes.
 */
export class SeededRandom {
  private state: number;

  constructor(seedString: string = 'DEFAULT_SEED') {
    this.state = this.hashString(seedString);
  }

  /**
   * Hashea un string alfanumérico a un entero de 32 bits sin signo.
   */
  private hashString(str: string): number {
    let hash = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) {
      hash = Math.imul(hash ^ str.charCodeAt(i), 3432918353);
      hash = (hash << 13) | (hash >>> 19);
    }
    return hash >>> 0;
  }

  /**
   * Retorna un float entre 0 (inclusive) y 1 (exclusive).
   */
  public next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Retorna un número flotante en el rango [min, max).
   */
  public range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  /**
   * Retorna un entero en el rango [min, max] inclusivo.
   */
  public rangeInt(min: number, max: number): number {
    return Math.floor(this.range(min, max + 1));
  }

  /**
   * Evalúa una probabilidad (0 a 1).
   */
  public chance(probability: number): boolean {
    return this.next() < probability;
  }

  /**
   * Elige un elemento aleatorio de un arreglo.
   */
  public pick<T>(items: T[]): T {
    const idx = Math.floor(this.next() * items.length);
    return items[idx];
  }

  /**
   * Selección ponderada por pesos.
   */
  public weightedPick<T extends string>(weights: Record<T, number>): T {
    const keys = Object.keys(weights) as T[];
    let totalWeight = 0;
    for (const key of keys) {
      totalWeight += weights[key];
    }

    let r = this.next() * totalWeight;
    for (const key of keys) {
      r -= weights[key];
      if (r <= 0) {
        return key;
      }
    }
    return keys[keys.length - 1];
  }
}
