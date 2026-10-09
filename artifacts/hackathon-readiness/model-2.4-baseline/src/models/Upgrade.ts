export type UpgradeBranch =
  | 'AGUA_RESERVAS'
  | 'AGRICULTURA'
  | 'CIUDAD_SANEAMIENTO'
  | 'MINERIA'
  | 'AMBIENTE'
  | 'MONITOREO_CLIMATICO';

export interface UpgradeEffect {
  type: string;
  value: number;
  description: string;
}

export interface UpgradeDefinition {
  id: string;
  branch: UpgradeBranch;
  name: string;
  description: string;
  level: number;
  maxLevel: number;
  costs: number[];
  effects: UpgradeEffect[];
  prerequisites: string[];
  visualTag: string;
}

export interface UpgradeState {
  id: string;
  currentLevel: number;
}
