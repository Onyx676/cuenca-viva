import { SectorId, SectorState } from '../models/Sector';
import { SeasonWaterBalance } from '../models/Balance';
import { UpgradesActiveMap } from './DemandSystem';

export interface SeasonalHydrologyInputs {
  seasonRainfall: number;
  rainfallIntensity: 'MODERATE' | 'INTENSE' | 'PROLONGED';
  soilInfiltration: number;
  surfaceRunoff: number;
  directRiverRain: number;
  baseFlow: number;
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
  public allocationBudget(riverFlow: number, reservoirVolume: number, reservoirCapacity: number,
    aquiferVolume: number, evaporationFactor: number, evaporationMultiplier: number): number {
    const riverIntake = Math.round(riverFlow * 0.65);
    const retained = Math.round((riverFlow - riverIntake) * 0.70);
    const evap = Math.min(reservoirVolume, Math.round(3 * evaporationFactor * evaporationMultiplier
      * reservoirVolume / Math.max(1, reservoirCapacity)));
    const stored = Math.min(reservoirCapacity, reservoirVolume + retained - evap);
    return riverIntake + Math.round(stored * 0.65) + Math.round(aquiferVolume * 0.18);
  }

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
      baseFlow,
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
    // directRiverRain YA es la fracción (45%) de escorrentía que llega a cabecera.
    const riverInflow = snowMelt + directRiverRain + baseFlow;
    const riverFlowTotal = riverInflow;

    // 2. Embalse: Inflow natural, evaporación estacional y retención
    const baseReservoirEvap = Math.min(reservoirStart, Math.round(
      3 * evaporationFactor * evaporationMultiplier * (reservoirStart / Math.max(1, reservoirCapacity))
    ));

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

    // Retener sólo el caudal que no se captó: evita ofrecer dos veces la misma agua.
    const remainingRiver = riverInflow - directRiverIntake;
    const reservoirInflow = Math.round(remainingRiver * 0.70);
    const riverBypass = remainingRiver - reservoirInflow;
    const reservoirWaterBeforeSpill = reservoirStart + reservoirInflow - baseReservoirEvap;
    const reservoirSpill = Math.max(0, reservoirWaterBeforeSpill - reservoirCapacity);
    const reservoirWater = Math.min(reservoirCapacity, reservoirWaterBeforeSpill);

    // Prioridad 2: Extracción del embalse (hasta el 65% del volumen actual almacenado en la estación)
    const maxReservoirDraw = Math.round(reservoirWater * 0.65);
    const reservoirWithdrawal = Math.min(maxReservoirDraw, deficitAfterRiver);
    const reservoirEnd = Math.max(0, Math.round(reservoirWater - reservoirWithdrawal));

    // Prioridad 3: Bombeo del acuífero para cubrir el remanente
    const requestedAquiferWithdrawal = Math.max(0, deficitAfterRiver - reservoirWithdrawal);

    // 4. Acuífero: Infiltración natural + recarga artificial gestionada - extracción
    let aquiferNaturalRecharge = Math.round(soilInfiltration * 0.85);
    let aquiferArtificialRecharge = 0;
    const rechargeLevel = upgrades['recarga_acuifero'] || 0;
    if (rechargeLevel >= 1) {
      const bonusRate = rechargeLevel === 1 ? 0.20 : rechargeLevel === 2 ? 0.35 : 0.50;
      // Derivación desde escorrentía que todavía NO entró al río.
      aquiferArtificialRecharge = Math.min(surfaceRunoff - directRiverRain, Math.round(surfaceRunoff * bonusRate));
    }

    const aquiferBeforeSpill = aquiferStart + aquiferNaturalRecharge + aquiferArtificialRecharge;
    const aquiferOverflow = Math.max(0, aquiferBeforeSpill - aquiferCapacity);
    const aquiferWater = Math.min(aquiferCapacity, aquiferBeforeSpill);
    const aquiferWithdrawal = Math.min(aquiferWater, requestedAquiferWithdrawal);
    const aquiferEnd = aquiferWater - aquiferWithdrawal;
    const totalWaterSupplied = directRiverIntake + reservoirWithdrawal + aquiferWithdrawal;
    const unmetAllocation = consumptiveAllocated - totalWaterSupplied;
    const suppliedAllocations = { ...allocations, reserve: 0 };
    if (unmetAllocation > 0) {
      // Racionamiento proporcional portable; las fracciones sobrantes se asignan por orden fijo.
      const ids: SectorId[] = ['population', 'agriculture', 'livestock', 'mining', 'ecosystem'];
      for (const id of ids) suppliedAllocations[id] = Math.floor(allocations[id] * totalWaterSupplied / consumptiveAllocated);
      let remainder = totalWaterSupplied - ids.reduce((sum, id) => sum + suppliedAllocations[id], 0);
      for (const id of ids) {
        if (remainder > 0 && suppliedAllocations[id] < allocations[id]) {
          suppliedAllocations[id]++;
          remainder--;
        }
      }
    }

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
    const popAlloc = suppliedAllocations.population || 0;
    const popDemand = Math.max(1, currentSectors.population.currentDemand);
    satisfactions.population = Math.min(1.0, popAlloc / popDemand);
    consumptions.population = Math.round(popAlloc * 0.30);
    returns.population = Math.max(0, popAlloc - consumptions.population);

    // AGRICULTURA
    const agriAlloc = suppliedAllocations.agriculture || 0;
    const agriDemand = Math.max(1, currentSectors.agriculture.currentDemand);
    satisfactions.agriculture = Math.min(1.0, agriAlloc / agriDemand);
    consumptions.agriculture = Math.round(agriAlloc * 0.70);
    returns.agriculture = Math.max(0, agriAlloc - consumptions.agriculture);

    // GANADERÍA
    const liveAlloc = suppliedAllocations.livestock || 0;
    const liveDemand = Math.max(1, currentSectors.livestock.currentDemand);
    satisfactions.livestock = Math.min(1.0, liveAlloc / liveDemand);
    consumptions.livestock = Math.round(liveAlloc * 0.75);
    returns.livestock = Math.max(0, liveAlloc - consumptions.livestock);

    // MINERÍA
    const minAlloc = suppliedAllocations.mining || 0;
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
      // El resto es uso consuntivo/retención de proceso en esta abstracción.
      consumptions.mining = minAlloc - returns.mining;
    }

    // ECOSISTEMA (Caudal ambiental)
    const ecoAlloc = suppliedAllocations.ecosystem || 0;
    const ecoDemand = Math.max(1, currentSectors.ecosystem.currentDemand);
    satisfactions.ecosystem = Math.min(1.0, ecoAlloc / ecoDemand);
    consumptions.ecosystem = Math.round(ecoAlloc * 0.15);
    returns.ecosystem = Math.max(0, ecoAlloc - consumptions.ecosystem);

    // Agua no asignada que queda en la cuenca como reserva natural
    const unallocatedStored = Math.max(0, reservoirEnd - reservoirStart) + Math.max(0, aquiferEnd - aquiferStart);
    const runoffBypass = surfaceRunoff - directRiverRain - aquiferArtificialRecharge;
    const soilEvaporation = soilInfiltration - aquiferNaturalRecharge;

    // 6. Calidad del Agua
    const sanitationLevel = upgrades['planta_saneamiento'] || 0;
    let urbanReturnQuality = sanitationLevel >= 3 ? 94 : sanitationLevel === 2 ? 82 : sanitationLevel === 1 ? 70 : 35;
    const agriReturnQuality = (upgrades['riego_eficiente'] || 0) > 0 ? 80 : 65;
    const minReturnQuality = minRecircLevel >= 3 ? 100 : minRecircLevel >= 1 ? 75 : 50;

    const cleanRiverWater = riverBypass + reservoirSpill + runoffBypass + aquiferOverflow + returns.ecosystem;
    const totalReturnFlow = returns.population + returns.agriculture + returns.livestock + returns.mining;
    const downstreamFlow = cleanRiverWater + totalReturnFlow;
    // Río Vivo mide continuidad aguas abajo, incluyendo retornos; la calidad se evalúa aparte.
    satisfactions.ecosystem = Math.min(1, downstreamFlow / ecoDemand);

    let weightedReturnScore =
      (returns.population * urbanReturnQuality +
        returns.agriculture * agriReturnQuality +
        returns.livestock * 60 +
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

    const returnQualities: Record<SectorId, number> = {
      population: urbanReturnQuality, agriculture: agriReturnQuality,
      livestock: 60, mining: minReturnQuality, ecosystem: 100, reserve: 100
    };
    const totalConsumed = Object.values(consumptions).reduce((sum, value) => sum + value, 0);
    const massBalanceError = reservoirStart + aquiferStart + snowReserveStart + seasonRainfall + snowAccumulated + baseFlow
      - reservoirEnd - aquiferEnd - snowReserveEnd - evaporatedRain - soilEvaporation - baseReservoirEvap - totalConsumed - downstreamFlow;

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
      baseFlow,
      directRiverIntake,
      downstreamFlow,
      runoffBypass,
      soilEvaporation,

      reservoirStart,
      reservoirInflow,
      reservoirWithdrawal,
      reservoirEvaporation: baseReservoirEvap,
      reservoirSpill,
      reservoirEnd,

      aquiferStart,
      aquiferNaturalRecharge,
      aquiferArtificialRecharge,
      aquiferWithdrawal,
      aquiferEnd,
      aquiferOverflow,

      allocations,
      suppliedAllocations,
      returnQualities,
      consumptions,
      returns,
      satisfactions,

      totalWaterAvailable: availableWater,
      totalWaterSupplied,
      unallocatedStored,
      unmetAllocation,
      massBalanceError,

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
