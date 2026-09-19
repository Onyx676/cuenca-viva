import upgradesData from '../data/upgrades.json';
import { UpgradeDefinition, UpgradeState } from '../models/Upgrade';

export class UpgradeSystem {
  private catalog: UpgradeDefinition[];

  constructor() {
    this.catalog = JSON.parse(JSON.stringify(upgradesData));
  }

  public getCatalog(): UpgradeDefinition[] {
    return this.catalog;
  }

  public getUpgrade(id: string): UpgradeDefinition | undefined {
    return this.catalog.find(u => u.id === id);
  }

  public canPurchase(
    upgradeId: string,
    currentUpgrades: Record<string, UpgradeState>,
    currentMoney: number
  ): { canBuy: boolean; reason?: string; cost: number } {
    const upgrade = this.getUpgrade(upgradeId);
    if (!upgrade) {
      return { canBuy: false, reason: 'Mejora no encontrada', cost: 0 };
    }

    const currentLevel = currentUpgrades[upgradeId]?.currentLevel || 0;
    if (currentLevel >= upgrade.maxLevel) {
      return { canBuy: false, reason: 'Nivel máximo alcanzado', cost: 0 };
    }

    // Chequear prerequisitos
    for (const prereqId of upgrade.prerequisites) {
      const prereqLevel = currentUpgrades[prereqId]?.currentLevel || 0;
      if (prereqLevel < 1) {
        const prereqDef = this.getUpgrade(prereqId);
        return {
          canBuy: false,
          reason: `Requiere desbloquear primero: ${prereqDef?.name || prereqId}`,
          cost: 0
        };
      }
    }

    const cost = upgrade.costs[currentLevel] || upgrade.costs[0];
    if (currentMoney < cost) {
      return {
        canBuy: false,
        reason: `Presupuesto insuficiente (Costo: $${cost}, Tienes: $${currentMoney})`,
        cost
      };
    }

    return { canBuy: true, cost };
  }

  public purchase(
    upgradeId: string,
    currentUpgrades: Record<string, UpgradeState>,
    currentMoney: number
  ): { success: boolean; newMoney: number; newLevel: number; error?: string } {
    const check = this.canPurchase(upgradeId, currentUpgrades, currentMoney);
    if (!check.canBuy) {
      return { success: false, newMoney: currentMoney, newLevel: currentUpgrades[upgradeId]?.currentLevel || 0, error: check.reason };
    }

    const currentLevel = currentUpgrades[upgradeId]?.currentLevel || 0;
    const nextLevel = currentLevel + 1;
    currentUpgrades[upgradeId] = { id: upgradeId, currentLevel: nextLevel };

    return {
      success: true,
      newMoney: currentMoney - check.cost,
      newLevel: nextLevel
    };
  }

  public getActiveLevelMap(currentUpgrades: Record<string, UpgradeState>): Record<string, number> {
    const map: Record<string, number> = {};
    for (const id in currentUpgrades) {
      map[id] = currentUpgrades[id].currentLevel;
    }
    return map;
  }
}
