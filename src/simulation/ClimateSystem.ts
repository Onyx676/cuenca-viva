import climateData from '../data/climate.json';
import { ClimateStateType, EnsoStateType, ClimateConfig, EnsoConfig, ClimateForecast } from '../models/ClimateState';
import { SeededRandom } from './RandomSystem';

export class ClimateSystem {
  private rng: SeededRandom;

  constructor(rng: SeededRandom) {
    this.rng = rng;
  }

  public getClimateConfig(state: ClimateStateType): ClimateConfig {
    return (climateData.states as Record<ClimateStateType, ClimateConfig>)[state];
  }

  public getEnsoConfig(enso: EnsoStateType): EnsoConfig {
    return (climateData.enso as Record<EnsoStateType, EnsoConfig>)[enso];
  }

  /**
   * Determina el próximo estado climático a partir de la matriz de transición de Markov.
   * La persistencia de estados simula memorias secas o húmedas sin saltos aleatorios bruscos.
   */
  public getNextClimateState(currentState: ClimateStateType): ClimateStateType {
    const transitions = (climateData.transitions as Record<ClimateStateType, Record<ClimateStateType, number>>)[currentState];
    return this.rng.weightedPick<ClimateStateType>(transitions);
  }

  /**
   * Determina el estado ENSO (El Niño / Oscilación del Sur).
   */
  public getNextEnsoState(currentEnso: EnsoStateType): EnsoStateType {
    const weights: Record<EnsoStateType, number> = {
      NEUTRAL: currentEnso === 'NEUTRAL' ? 0.60 : 0.50,
      EL_NINO: currentEnso === 'EL_NINO' ? 0.25 : 0.25,
      LA_NINA: currentEnso === 'LA_NINA' ? 0.25 : 0.25
    };
    return this.rng.weightedPick<EnsoStateType>(weights);
  }

  /**
   * Genera el pronóstico meteorológico estacional según el nivel de monitoreo (0 a 3).
   * Sección 12 y 22:
   * Nivel 0: Previsión incierta (40% de acierto).
   * Nivel 1: Tendencia general de la próxima estación (65%).
   * Nivel 2: Probabilidades numéricas y aporte estimado (85%).
   * Nivel 3: Sistema de alerta temprana de extremos (95%).
   */
  public generateForecast(
    realNextState: ClimateStateType,
    monitoringLevel: number
  ): ClimateForecast {
    let accuracy = 0.40;
    if (monitoringLevel === 1) accuracy = 0.65;
    else if (monitoringLevel === 2) accuracy = 0.85;
    else if (monitoringLevel >= 3) accuracy = 0.95;

    let predictedState = realNextState;
    if (!this.rng.chance(accuracy)) {
      const allStates: ClimateStateType[] = ['VERY_DRY', 'DRY', 'NORMAL', 'WET', 'VERY_WET'];
      predictedState = this.rng.pick(allStates);
    }

    const droughtRisk: 'BAJA' | 'MEDIA' | 'ALTA' =
      predictedState === 'VERY_DRY' ? 'ALTA' : predictedState === 'DRY' ? 'MEDIA' : 'BAJA';

    const stormRisk: 'BAJA' | 'MEDIA' | 'ALTA' =
      predictedState === 'VERY_WET' ? 'ALTA' : predictedState === 'WET' ? 'MEDIA' : 'BAJA';

    const snowExpected: 'BAJA' | 'MEDIA' | 'ALTA' =
      predictedState === 'VERY_DRY' || predictedState === 'DRY' ? 'BAJA' :
      predictedState === 'NORMAL' ? 'MEDIA' : 'ALTA';

    return {
      likelyState: predictedState,
      droughtRisk,
      stormRisk,
      snowExpected,
      accuracy
    };
  }
}
