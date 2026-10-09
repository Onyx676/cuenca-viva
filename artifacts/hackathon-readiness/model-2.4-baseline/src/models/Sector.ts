export type SectorId = 'population' | 'agriculture' | 'livestock' | 'mining' | 'ecosystem' | 'reserve';

export interface SectorState {
  id: SectorId;
  name: string;
  shortName: string;
  icon: string;
  description: string;
  baseDemand: number;
  currentDemand: number;
  allocated: number;
  consumed: number;
  returned: number;
  returnQuality: number; // 0 - 100
  satisfactionRate: number; // 0 - 1
  color: string;
  economicReturnPerUnit: number;
  trustImpactDeficit: number;
}
