export type ClimateStateType = 'VERY_DRY' | 'DRY' | 'NORMAL' | 'WET' | 'VERY_WET';
export type EnsoStateType = 'NEUTRAL' | 'EL_NINO' | 'LA_NINA';

export interface ClimateConfig {
  name: string;
  description: string;
  rainfallFactor: number;
  snowFactor: number;
  tempModifier: number;
  evaporationFactor: number;
  color: string;
}

export interface EnsoConfig {
  name: string;
  description: string;
  rainModifier: number;
  snowModifier: number;
  tempModifier: number;
}

export interface ClimateForecast {
  likelyState: ClimateStateType;
  droughtRisk: 'BAJA' | 'MEDIA' | 'ALTA';
  stormRisk: 'BAJA' | 'MEDIA' | 'ALTA';
  snowExpected: 'BAJA' | 'MEDIA' | 'ALTA';
  accuracy: number; // 0-1 based on upgrades
}
