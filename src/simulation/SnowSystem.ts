import { SeededRandom } from './RandomSystem';

export interface SnowResult {
  snowAccumulated: number;
  snowReserveBeforeMelt: number;
  snowMelt: number;
  snowReserveEnd: number;
  meltFlowToRiver: number;
}

export class SnowSystem {
  private rng: SeededRandom;

  constructor(rng: SeededRandom) {
    this.rng = rng;
  }

  public calculateSnow(
    baseSnowfall: number,
    snowShare: number,
    baseMeltRate: number,
    snowFactor: number,
    ensoModifier: number,
    previousSnowReserve: number,
    tempModifier: number,
    heatwaveActive: boolean
  ): SnowResult {
    const noise = this.rng.range(0.90, 1.10);
    // Acumulación estacional de nieve (máxima en Invierno, casi nula en Verano)
    const snowAccumulated = Math.round(baseSnowfall * snowShare * snowFactor * ensoModifier * noise);
    const snowReserveBeforeMelt = previousSnowReserve + snowAccumulated;

    // Tasa de deshielo modulada por temperatura de la estación y eventos
    let meltRate = baseMeltRate;
    if (tempModifier > 0) {
      meltRate += tempModifier * 0.05;
    } else if (tempModifier < 0) {
      meltRate = Math.max(0, meltRate + tempModifier * 0.03);
    }

    if (heatwaveActive) {
      meltRate += 0.25;
    }

    meltRate = Math.max(0.0, Math.min(0.95, meltRate));

    const snowMelt = Math.round(snowReserveBeforeMelt * meltRate);
    const snowReserveEnd = Math.max(0, snowReserveBeforeMelt - snowMelt);
    const meltFlowToRiver = snowMelt;

    return {
      snowAccumulated,
      snowReserveBeforeMelt,
      snowMelt,
      snowReserveEnd,
      meltFlowToRiver
    };
  }
}
