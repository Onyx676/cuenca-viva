import { ClimateStateType } from '../models/ClimateState';
import { SeededRandom } from './RandomSystem';

export interface RainResult {
  seasonalRainfall: number;
  rainfallIntensity: 'MODERATE' | 'INTENSE' | 'PROLONGED';
  soilInfiltration: number;
  surfaceRunoff: number;
  evaporatedRain: number;
  directRiverRain: number;
}

export class RainSystem {
  private rng: SeededRandom;

  constructor(rng: SeededRandom) {
    this.rng = rng;
  }

  public calculateRain(
    baseRainfall: number,
    rainShare: number,
    climateFactor: number,
    ensoModifier: number,
    climateState: ClimateStateType,
    hasRainCatchment: boolean,
    hasAquiferArtificialRecharge: boolean
  ): RainResult {
    const noise = this.rng.range(0.90, 1.10);
    // Multiplicado por rainShare para escala estacional
    const seasonalRainfall = Math.max(2, Math.round(baseRainfall * rainShare * climateFactor * ensoModifier * noise));

    let intensity: 'MODERATE' | 'INTENSE' | 'PROLONGED' = 'MODERATE';
    if (climateState === 'VERY_WET') {
      intensity = this.rng.chance(0.6) ? 'INTENSE' : 'PROLONGED';
    } else if (climateState === 'WET') {
      intensity = this.rng.chance(0.4) ? 'INTENSE' : this.rng.chance(0.5) ? 'PROLONGED' : 'MODERATE';
    } else {
      intensity = this.rng.chance(0.15) ? 'INTENSE' : 'MODERATE';
    }

    let infiltrationRatio = 0.38;
    let runoffRatio = 0.42;
    let evapRatio = 0.20;

    if (intensity === 'INTENSE') {
      infiltrationRatio = 0.22;
      runoffRatio = 0.63;
      evapRatio = 0.15;
    } else if (intensity === 'PROLONGED') {
      infiltrationRatio = 0.40;
      runoffRatio = 0.45;
      evapRatio = 0.15;
    } else {
      infiltrationRatio = 0.44;
      runoffRatio = 0.32;
      evapRatio = 0.24;
    }

    if (hasRainCatchment) {
      runoffRatio -= 0.08;
      infiltrationRatio += 0.08;
    }

    if (hasAquiferArtificialRecharge) {
      runoffRatio -= 0.07;
      infiltrationRatio += 0.07;
    }

    const soilInfiltration = Math.round(seasonalRainfall * infiltrationRatio);
    const surfaceRunoff = Math.round(seasonalRainfall * runoffRatio);
    const evaporatedRain = Math.round(seasonalRainfall * evapRatio);
    const directRiverRain = Math.round(surfaceRunoff * 0.45);

    return {
      seasonalRainfall,
      rainfallIntensity: intensity,
      soilInfiltration,
      surfaceRunoff,
      evaporatedRain,
      directRiverRain
    };
  }
}
