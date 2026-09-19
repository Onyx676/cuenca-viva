import { SectorId, SectorState } from '../models/Sector';
import { SeasonWaterBalance } from '../models/Balance';
import { UpgradesActiveMap } from './DemandSystem';

export interface SeasonalHydrologyInputs {
  seasonRainfall: number;
  rainfallIntensity: 'MODERATE' | 'INTENSE' | 'PROLONGED';
  soilInfiltration: number;
  surfaceRunoff: number;
  directRiverRain: number;
  evaporatedRain: number;

  snowReserveStart: number;
  snowAccumulated: number;
  snowMelt: number;
  snowReserveEnd: number;

  evaporationFactor: number;
  evaporationMultiplier: number;
  temperatureAnomaly: number;

  reservoirStart: number;
  reservoirCapacity: number;

  aquiferStart: number;
  aquiferCapacity: number;

  allocations: Record<SectorId, number>;
  availableWater: number;
  upgrades: UpgradesActiveMap;
}

export class WaterSystem {
  public resolveSeason(
    inputs: SeasonalHydrologyInputs,
    currentSectors: Record<SectorId, SectorState>,
    currentWaterQuality: number,
    currentBasinHealth: number,
    currentPublicTrust: number
  ): {
    balance: SeasonWaterBalance;
    newReservoirVolume: number;
    newAquiferVolume: number;
    newAquiferStress: 'HEALTHY' | 'ATTENTION' | 'STRESSED' | 'CRITICAL';
    newWaterQuality: number;
    newBasinHealth: number;
    newPublicTrust: number;
  } {
    const {
      seasonRainfall,
      rainfallIntensity,
      soilInfiltration,
      surfaceRunoff,
      directRiverRain,
      evaporatedRain,
      snowReserveStart,
      snowAccumulated,
      snowMelt,
      snowReserveEnd,
      evaporationFactor,
      evaporationMultiplier,
      reservoirStart,
      reservoirCapacity,
      aquiferStart,
      aquiferCapacity,
      allocations,
      availableWater,
      upgrades
    } = inputs;

    // 1. Caudal de entrada al río principal desde deshielo cordillerano y escorrentía superficial
    const baseSpringFlow = 5;
    const riverInflow = Math.round(snowMelt + surfaceRunoff * 0.45 + directRiverRain + baseSpringFlow);
    const riverFlowTotal = riverInflow;

    // 2. Embalse: Inflow natural, evaporación estacional y retención
    const baseReservoirEvap = Math.round(
      3 * evaporationFactor * evaporationMultiplier * (reservoirStart / Math.max(1, reservoirCapacity))
    );
    let reservoirWater = reservoirStart + Math.round(riverInflow * 0.70) - baseReservoirEvap;
    reservoirWater = Math.max(0, reservoirWater);

    let reservoirSpill = 0;
    if (reservoirWater > reservoirCapacity) {
      reservoirSpill = reservoirWater - reservoirCapacity;
      reservoirWater = reservoirCapacity;
    }

    // 3. Demanda total asignada por el jugador (excluyendo reserva, que es agua no asignada)
    const consumptiveAllocated =
      (allocations.population || 0) +
      (allocations.agriculture || 0) +
      (allocations.livestock || 0) +
      (allocations.mining || 0) +
      (allocations.ecosystem || 0);

    // Prioridad 1: Toma directa del caudal fluvial (hasta el 65% del caudal de paso)
    const directRiverIntake = Math.min(Math.round(riverInflow * 0.65), consumptiveAllocated);
    const deficitAfterRiver = Math.max(0, consumptiveAllocated - directRiverIntake);

    // Prioridad 2: Extracción del embalse (hasta el 65% del volumen actual almacenado en la estación)
    const maxReservoirDraw = Math.round(reservoirWater * 0.65);
    const reservoirWithdrawal = Math.min(maxReservoirDraw, deficitAfterRiver);
    const reservoirEnd = Math.max(0, Math.round(reservoirWater - reservoirWithdrawal));

    // Prioridad 3: Bombeo del acuífero para cubrir el remanente
    const aquiferWithdrawal = Math.max(0, deficitAfterRiver - reservoirWithdrawal);

    // 4. Acuífero: Infiltración natural + recarga artificial gestionada - extracción
    let aquiferNaturalRecharge = Math.round(soilInfiltration * 0.85);
    let aquiferArtificialRecharge = 0;
    const rechargeLevel = upgrades['recarga_acuifero'] || 0;
    if (rechargeLevel >= 1) {
      const bonusRate = rechargeLevel === 1 ? 0.20 : rechargeLevel === 2 ? 0.35 : 0.50;
      aquiferArtificialRecharge = Math.round(surfaceRunoff * bonusRate);
    }

    let aquiferWater = aquiferStart + aquiferNaturalRecharge + aquiferArtificialRecharge - aquiferWithdrawal;
    const aquiferEnd = Math.max(0, Math.min(aquiferCapacity, Math.round(aquiferWater)));

    // Nivel de estrés freático del acuífero (Sección 12):
    // >70% saludable, 40-70% atención, 20-40% estrés, <20% crítico
    const aquiferPercent = (aquiferEnd / aquiferCapacity) * 100;
    let newAquiferStress: 'HEALTHY' | 'ATTENTION' | 'STRESSED' | 'CRITICAL' = 'HEALTHY';
    if (aquiferPercent < 20) {
      newAquiferStress = 'CRITICAL';
    } else if (aquiferPercent < 40) {
      newAquiferStress = 'STRESSED';
    } else if (aquiferPercent < 70) {
      newAquiferStress = 'ATTENTION';
    }

    // 5. Consumos y Retornos de sectores
    const consumptions: Record<SectorId, number> = {
      population: 0,
      agriculture: 0,
      livestock: 0,
      mining: 0,
      ecosystem: 0,
      reserve: 0
    };

    const returns: Record<SectorId, number> = {
      population: 0,
      agriculture: 0,
      livestock: 0,
      mining: 0,
      ecosystem: 0,
      reserve: 0
    };

    const satisfactions: Record<SectorId, number> = {
      population: 1,
      agriculture: 1,
      livestock: 1,
      mining: 1,
      ecosystem: 1,
      reserve: 1
    };

    // POBLACIÓN (Urbana)
    const popAlloc = allocations.population || 0;
    const popDemand = Math.max(1, currentSectors.population.currentDemand);
    satisfactions.population = Math.min(1.0, popAlloc / popDemand);
    consumptions.population = Math.round(popAlloc * 0.30);
    returns.population = Math.max(0, popAlloc - consumptions.population);

    // AGRICULTURA
    const agriAlloc = allocations.agriculture || 0;
    const agriDemand = Math.max(1, currentSectors.agriculture.currentDemand);
    satisfactions.agriculture = Math.min(1.0, agriAlloc / agriDemand);
    consumptions.agriculture = Math.round(agriAlloc * 0.70);
    returns.agriculture = Math.max(0, agriAlloc - consumptions.agriculture);

    // GANADERÍA
    const liveAlloc = allocations.livestock || 0;
    const liveDemand = Math.max(1, currentSectors.livestock.currentDemand);
    satisfactions.livestock = Math.min(1.0, liveAlloc / liveDemand);
    consumptions.livestock = Math.round(liveAlloc * 0.75);
    returns.livestock = Math.max(0, liveAlloc - consumptions.livestock);

    // MINERÍA
    const minAlloc = allocations.mining || 0;
    const minDemand = Math.max(1, currentSectors.mining.currentDemand);
    satisfactions.mining = Math.min(1.0, minAlloc / minDemand);
    const minRecircLevel = upgrades['recirculacion_minera'] || 0;

    if (minRecircLevel >= 3) {
      // Circuito cerrado completo: vertido cero
      consumptions.mining = minAlloc;
      returns.mining = 0;
    } else if (minRecircLevel >= 1) {
      consumptions.mining = Math.round(minAlloc * 0.65);
      returns.mining = Math.max(0, minAlloc - consumptions.mining);
    } else {
      consumptions.mining = Math.round(minAlloc * 0.75);
      returns.mining = Math.round(minAlloc * 0.15);
    }

    // ECOSISTEMA (Caudal ambiental)
    const ecoAlloc = allocations.ecosystem || 0;
    const ecoDemand = Math.max(1, currentSectors.ecosystem.currentDemand);
    satisfactions.ecosystem = Math.min(1.0, ecoAlloc / ecoDemand);
    consumptions.ecosystem = Math.round(ecoAlloc * 0.15);
    returns.ecosystem = Math.max(0, ecoAlloc - consumptions.ecosystem);

    // Agua no asignada que queda en la cuenca como reserva natural
    const unallocatedStored = Math.max(0, availableWater - consumptiveAllocated);

    // 6. Calidad del Agua
    const sanitationLevel = upgrades['planta_saneamiento'] || 0;
    let urbanReturnQuality = sanitationLevel >= 3 ? 94 : sanitationLevel === 2 ? 82 : sanitationLevel === 1 ? 70 : 35;
    const agriReturnQuality = (upgrades['riego_eficiente'] || 0) > 0 ? 80 : 65;
    const minReturnQuality = minRecircLevel >= 3 ? 100 : minRecircLevel >= 1 ? 75 : 50;

    const cleanRiverWater = Math.max(1, riverInflow * 0.5 + ecoAlloc);
    const totalReturnFlow = returns.population + returns.agriculture + returns.mining;

    let weightedReturnScore =
      (returns.population * urbanReturnQuality +
        returns.agriculture * agriReturnQuality +
        returns.mining * minReturnQuality) /
      Math.max(1, totalReturnFlow);

    const dilutionRatio = cleanRiverWater / Math.max(1, cleanRiverWater + totalReturnFlow);
    let targetQuality = Math.round(95 * dilutionRatio + weightedReturnScore * (1 - dilutionRatio));

    if ((upgrades['restauracion_cauces'] || 0) >= 1) targetQuality += 6;

    const newWaterQuality = Math.max(20, Math.min(100, Math.round(currentWaterQuality * 0.65 + targetQuality * 0.35)));

    // 7. Salud de la Cuenca
    let basinDelta = 0;
    if (satisfactions.ecosystem >= 0.9) basinDelta += 2;
    else if (satisfactions.ecosystem < 0.6) basinDelta -= 4;

    if (newAquiferStress === 'CRITICAL') basinDelta -= 5;
    else if (newAquiferStress === 'STRESSED') basinDelta -= 2;
    else if (newAquiferStress === 'HEALTHY') basinDelta += 1;

    if (newWaterQuality < 50) basinDelta -= 3;
    else if (newWaterQuality >= 80) basinDelta += 2;

    if ((upgrades['restauracion_cauces'] || 0) >= 1) basinDelta += 1;

    const newBasinHealth = Math.max(10, Math.min(100, currentBasinHealth + basinDelta));

    // 8. Confianza Pública
    let trustDelta = 0;
    if (satisfactions.population < 0.95) {
      trustDelta -= Math.round((1 - satisfactions.population) * 25);
    } else {
      trustDelta += 1;
    }

    if (satisfactions.agriculture < 0.7) trustDelta -= 3;
    if (satisfactions.mining < 0.7) trustDelta -= 2;
    if (newWaterQuality < 55) trustDelta -= 4;
    if (newAquiferStress === 'CRITICAL') trustDelta -= 4;

    const newPublicTrust = Math.max(10, Math.min(100, currentPublicTrust + trustDelta));

    const balance: SeasonWaterBalance = {
      seasonRainfall,
      rainfallIntensity,
      soilInfiltration,
      surfaceRunoff,
      evaporatedRain,

      snowReserveStart,
      snowAccumulated,
      snowMelt,
      snowReserveEnd,

      riverInflow,
      riverFlowTotal,

      reservoirStart,
      reservoirInflow: Math.round(riverInflow * 0.70),
      reservoirWithdrawal,
      reservoirEvaporation: baseReservoirEvap,
      reservoirSpill,
      reservoirEnd,

      aquiferStart,
      aquiferNaturalRecharge,
      aquiferArtificialRecharge,
      aquiferWithdrawal,
      aquiferEnd,

      allocations,
      consumptions,
      returns,
      satisfactions,

      totalWaterAvailable: availableWater,
      totalWaterSupplied: consumptiveAllocated,
      unallocatedStored,

      waterQuality: newWaterQuality,
      basinHealth: newBasinHealth,
      publicTrust: newPublicTrust
    };

    return {
      balance,
      newReservoirVolume: reservoirEnd,
      newAquiferVolume: aquiferEnd,
      newAquiferStress,
      newWaterQuality,
      newBasinHealth,
      newPublicTrust
    };
  }
}
