import scenariosData from '../data/scenarios.json';
import seasonsData from '../data/seasons.json';
import { GameState, GameScenario } from '../models/GameState';
import { SectorId, SectorState } from '../models/Sector';
import { SeasonType, SEASON_ORDER } from '../models/Season';
import { SeasonResult, YearResult } from '../models/Balance';
import { GameEvent, TriggeredEventRecord } from '../models/Event';
import { SeededRandom } from './RandomSystem';
import { ClimateSystem } from './ClimateSystem';
import { RainSystem, RainResult } from './RainSystem';
import { SnowSystem, SnowResult } from './SnowSystem';
import { DemandSystem } from './DemandSystem';
import { UpgradeSystem } from './UpgradeSystem';
import { EventSystem } from './EventSystem';
import { WaterSystem } from './WaterSystem';

export class SimulationEngine {
  private rng: SeededRandom;
  private climateSys: ClimateSystem;
  private rainSys: RainSystem;
  private snowSys: SnowSystem;
  private demandSys: DemandSystem;
  private upgradeSys: UpgradeSystem;
  private eventSys: EventSystem;
  private waterSys: WaterSystem;

  private scenario: GameScenario;
  private state!: GameState;

  private currentRainResult!: RainResult;
  private currentSnowResult!: SnowResult;
  private populationGrowthCount: number = 0;

  constructor(scenarioId: string = 'cuenca_central', seed: string = 'AULA-2026-001', isClassroomMode: boolean = false) {
    this.rng = new SeededRandom(seed);
    this.climateSys = new ClimateSystem(this.rng);
    this.rainSys = new RainSystem(this.rng);
    this.snowSys = new SnowSystem(this.rng);
    this.demandSys = new DemandSystem();
    this.upgradeSys = new UpgradeSystem();
    this.eventSys = new EventSystem(this.rng);
    this.waterSys = new WaterSystem();

    const scen = (scenariosData as GameScenario[]).find(s => s.id === scenarioId) || (scenariosData[0] as GameScenario);
    this.scenario = scen;
    this.initGame(seed, isClassroomMode);
  }

  public getState(): GameState {
    return this.state;
  }

  public getUpgradeSystem(): UpgradeSystem {
    return this.upgradeSys;
  }

  private initGame(seed: string, isClassroomMode: boolean): void {
    const s = this.scenario;
    const init = s.initialState;

    // Sectores principales: Ciudad, Agricultura, Ganadería, Minería y Ecosistema
    const initialSectors: Record<SectorId, SectorState> = {
      population: {
        id: 'population',
        name: 'Población Urbana',
        shortName: 'Ciudad',
        icon: '🏙️',
        description: 'Hogares, escuelas, centros de salud y servicios básicos.',
        baseDemand: s.demands.population,
        currentDemand: s.demands.population,
        allocated: s.demands.population,
        consumed: Math.round(s.demands.population * 0.30),
        returned: Math.round(s.demands.population * 0.70),
        returnQuality: 40,
        satisfactionRate: 1.0,
        color: '#3b82f6',
        economicReturnPerUnit: 1.2,
        trustImpactDeficit: 3.5
      },
      agriculture: {
        id: 'agriculture',
        name: 'Agricultura',
        shortName: 'Cultivos',
        icon: '🌾',
        description: 'Producción de alimentos, frutales y cultivos bajo riego.',
        baseDemand: s.demands.agriculture,
        currentDemand: s.demands.agriculture,
        allocated: s.demands.agriculture,
        consumed: Math.round(s.demands.agriculture * 0.70),
        returned: Math.round(s.demands.agriculture * 0.30),
        returnQuality: 65,
        satisfactionRate: 1.0,
        color: '#10b981',
        economicReturnPerUnit: 1.4,
        trustImpactDeficit: 1.5
      },
      livestock: {
        id: 'livestock',
        name: 'Ganadería',
        shortName: 'Granja',
        icon: '🐄',
        description: 'Abrevado y pasturas para animales de producción.',
        baseDemand: s.demands.livestock,
        currentDemand: s.demands.livestock,
        allocated: s.demands.livestock,
        consumed: Math.round(s.demands.livestock * 0.75),
        returned: Math.round(s.demands.livestock * 0.25),
        returnQuality: 60,
        satisfactionRate: 1.0,
        color: '#eab308',
        economicReturnPerUnit: 1.0,
        trustImpactDeficit: 1.0
      },
      mining: {
        id: 'mining',
        name: 'Minería e Industria',
        shortName: 'Mina',
        icon: '⛏️',
        description: 'Extracción mineral, procesamiento y actividad productiva.',
        baseDemand: s.demands.mining,
        currentDemand: s.demands.mining,
        allocated: s.demands.mining,
        consumed: Math.round(s.demands.mining * 0.75),
        returned: Math.round(s.demands.mining * 0.15),
        returnQuality: 50,
        satisfactionRate: 1.0,
        color: '#a855f7',
        economicReturnPerUnit: 1.8,
        trustImpactDeficit: 1.2
      },
      ecosystem: {
        id: 'ecosystem',
        name: 'Ecosistema y Río',
        shortName: 'Caudal Ecológico',
        icon: '🐟',
        description: 'Caudal ambiental necesario para mantener el río vivo, humedales y peces.',
        baseDemand: s.demands.ecosystem,
        currentDemand: s.demands.ecosystem,
        allocated: s.demands.ecosystem,
        consumed: Math.round(s.demands.ecosystem * 0.15),
        returned: Math.round(s.demands.ecosystem * 0.85),
        returnQuality: 95,
        satisfactionRate: 1.0,
        color: '#06b6d4',
        economicReturnPerUnit: 0.5,
        trustImpactDeficit: 2.0
      },
      reserve: {
        id: 'reserve',
        name: 'Reserva Natural',
        shortName: 'Reserva',
        icon: '🛡️',
        description: 'Agua no asignada que se conserva automáticamente en embalses y acuíferos.',
        baseDemand: 0,
        currentDemand: 0,
        allocated: 0,
        consumed: 0,
        returned: 0,
        returnQuality: 100,
        satisfactionRate: 1.0,
        color: '#64748b',
        economicReturnPerUnit: 0.0,
        trustImpactDeficit: 0.0
      }
    };

    const initialForecast = this.climateSys.generateForecast(init.climateState, 0);

    this.state = {
      scenarioId: s.id,
      scenarioName: s.name,
      seed,
      isClassroomMode,

      turn: 1,
      year: 1,
      maxYears: 5,
      season: 'WINTER',

      money: init.money,
      publicTrust: init.publicTrust,
      basinHealth: init.basinHealth,

      climateState: init.climateState,
      ensoState: init.ensoState,
      temperatureAnomaly: 0,
      nextSeasonForecast: initialForecast,

      seasonalRainfall: 15,
      rainfallIntensity: 'MODERATE',
      snowReserve: init.snowReserve,
      snowMelt: 5,
      riverFlow: 25,

      reservoirVolume: init.reservoirVolume,
      reservoirCapacity: init.reservoirCapacity,

      aquiferVolume: init.aquiferVolume,
      aquiferCapacity: init.aquiferCapacity,
      aquiferStressLevel: 'HEALTHY',

      waterQuality: init.waterQuality,

      availableWater: 80,
      currentAllocatedTotal: 65,
      unallocatedWater: 15,

      sectors: initialSectors,
      upgrades: {},
      currentSeasonEvents: [],
      activeInteractiveEvent: null,

      seasonHistory: [],
      yearHistory: [],

      isSeasonResolved: false,
      isYearEndPhase: false,
      isGameOver: false
    };

    this.prepareSeasonStart();
  }

  /**
   * Prepara el inicio de la estación actual (Turno 1 a 20).
   */
  public prepareSeasonStart(): void {
    const s = this.scenario;
    const st = this.state;
    const seasonKey = st.season;
    const seasonConfig = (seasonsData as any)[seasonKey];
    const upgMap = this.upgradeSys.getActiveLevelMap(st.upgrades);

    // 1. Clima y ENSO: En Invierno de cada nuevo año o con persistencia de Markov
    if (st.season === 'WINTER' && st.year > 1) {
      st.climateState = this.climateSys.getNextClimateState(st.climateState);
      st.ensoState = this.climateSys.getNextEnsoState(st.ensoState);
    } else if (st.turn > 1 && this.rng.chance(0.25)) {
      // 25% de probabilidad de transición climática intra-anual
      st.climateState = this.climateSys.getNextClimateState(st.climateState);
    }

    const climConf = this.climateSys.getClimateConfig(st.climateState);
    const ensoConf = this.climateSys.getEnsoConfig(st.ensoState);

    // Temperatura de la estación = base climática + offset estacional + ENSO
    st.temperatureAnomaly = climConf.tempModifier + ensoConf.tempModifier + (seasonConfig.tempOffset || 0);

    // 2. Lluvia de la estación
    const hasDrainage = (upgMap['captacion_lluvia'] || 0) >= 1;
    const hasArtificialRecharge = (upgMap['recarga_acuifero'] || 0) >= 1;

    this.currentRainResult = this.rainSys.calculateRain(
      s.climate.baseRainfall,
      seasonConfig.rainShare || 0.25,
      climConf.rainfallFactor,
      ensoConf.rainModifier,
      st.climateState,
      hasDrainage,
      hasArtificialRecharge
    );

    st.seasonalRainfall = this.currentRainResult.seasonalRainfall;
    st.rainfallIntensity = this.currentRainResult.rainfallIntensity;

    // 3. Nieve y Deshielo según la estación
    const isHeatwave = st.season === 'SUMMER' && st.climateState === 'VERY_DRY';
    this.currentSnowResult = this.snowSys.calculateSnow(
      s.climate.baseSnowfall,
      seasonConfig.snowShare || 0.25,
      seasonConfig.snowMeltRate || 0.25,
      climConf.snowFactor,
      ensoConf.snowModifier,
      st.snowReserve,
      st.temperatureAnomaly,
      isHeatwave
    );

    st.snowReserve = this.currentSnowResult.snowReserveEnd;
    st.snowMelt = this.currentSnowResult.snowMelt;

    // 4. Caudal fluvial estacional
    const baseFlow = st.season === 'SPRING' ? 12 : st.season === 'SUMMER' ? 8 : 5;
    st.riverFlow = Math.round(st.snowMelt + this.currentRainResult.surfaceRunoff * 0.45 + baseFlow);

    // 5. Capacidad de embalse con mejoras (3 niveles)
    let bonusCap = 0;
    const damLvl = upgMap['ampliacion_embalse'] || 0;
    if (damLvl === 1) bonusCap += 25;
    else if (damLvl === 2) bonusCap += 55;
    else if (damLvl >= 3) bonusCap += 90;
    st.reservoirCapacity = s.initialState.reservoirCapacity + bonusCap;

    // 6. Agua total disponible para esta estación
    // Caudal de río + fracción utilizable del embalse + bombeo seguro del acuífero
    const surfaceUsable = Math.round(st.riverFlow * 0.70 + st.reservoirVolume * 0.45);
    const aquiferSafeDraw = Math.round(st.aquiferVolume * 0.18);
    st.availableWater = Math.max(15, surfaceUsable + aquiferSafeDraw);

    // 7. Demandas de los sectores adaptadas a la estación
    const newDemands = this.demandSys.calculateDemands(
      s.demands,
      st.season,
      st.climateState,
      st.temperatureAnomaly,
      upgMap,
      this.populationGrowthCount
    );

    let totalRequested = 0;
    for (const key of Object.keys(newDemands) as SectorId[]) {
      if (key !== 'reserve') {
        st.sectors[key].currentDemand = newDemands[key];
        totalRequested += newDemands[key];
      }
    }

    // Si es el turno 1 o si el agua alcanza, asignamos por defecto la demanda requerida
    for (const key of Object.keys(newDemands) as SectorId[]) {
      if (key !== 'reserve') {
        if (st.availableWater >= totalRequested) {
          st.sectors[key].allocated = newDemands[key];
        } else {
          // Ajuste proporcional al agua disponible
          const ratio = st.availableWater / totalRequested;
          st.sectors[key].allocated = Math.max(1, Math.round(newDemands[key] * ratio));
        }
      }
    }

    this.recalculateAllocations();

    // 8. Eventos de la estación (A partir del Turno 2 para que el Turno 1 permita al jugador explorar y entender el tablero)
    if (st.turn > 1) {
      const evCheck = this.eventSys.checkAndTriggerEvents(st);
      st.currentSeasonEvents = evCheck.records;
      st.activeInteractiveEvent = evCheck.interactiveEvent;

      // Aplicar efectos directos de eventos no interactivos
      for (const evRecord of st.currentSeasonEvents) {
        const fx = evRecord.event.effects;
        if (fx?.moneyBonus) st.money += fx.moneyBonus;
        if (fx?.moneyPenalty) st.money = Math.max(0, st.money - fx.moneyPenalty);
        if (fx?.trustBonus) st.publicTrust = Math.min(100, st.publicTrust + fx.trustBonus);
        if (fx?.trustPenalty) st.publicTrust = Math.max(0, st.publicTrust - fx.trustPenalty);
        if (fx?.basinHealthBonus) st.basinHealth = Math.min(100, st.basinHealth + fx.basinHealthBonus);
        if (fx?.basinHealthPenalty) st.basinHealth = Math.max(0, st.basinHealth - fx.basinHealthPenalty);
        if (fx?.waterQualityPenalty) st.waterQuality = Math.max(10, st.waterQuality + fx.waterQualityPenalty);
      }
    } else {
      st.currentSeasonEvents = [];
      st.activeInteractiveEvent = null;
    }

    // 9. Previsión climática de la próxima estación
    const monitorLvl = upgMap['estacion_meteorologica'] || 0;
    const simulatedNextClimate = this.climateSys.getNextClimateState(st.climateState);
    st.nextSeasonForecast = this.climateSys.generateForecast(simulatedNextClimate, monitorLvl);

    st.isSeasonResolved = false;
  }

  /**
   * Recalcula la suma de agua asignada y la reserva resultante no asignada.
   */
  public recalculateAllocations(): void {
    const st = this.state;
    const total =
      st.sectors.population.allocated +
      st.sectors.agriculture.allocated +
      st.sectors.livestock.allocated +
      st.sectors.mining.allocated +
      st.sectors.ecosystem.allocated;

    st.currentAllocatedTotal = total;
    st.unallocatedWater = Math.max(0, st.availableWater - total);
  }

  /**
   * Permite al jugador modificar la asignación de agua de un sector.
   */
  public setSectorAllocation(sectorId: SectorId, amount: number): void {
    if (this.state.isSeasonResolved) return;
    if (sectorId === 'reserve') return; // Reserva no es un sector asignable

    const clamped = Math.max(0, Math.round(amount));
    this.state.sectors[sectorId].allocated = clamped;
    this.recalculateAllocations();
  }

  /**
   * Procesa la elección del jugador ante un evento interactivo (opciones A/B/C).
   */
  public chooseEventOption(optionId: string): void {
    if (!this.state.activeInteractiveEvent) return;

    const record = this.eventSys.applyOptionChoice(
      this.state.activeInteractiveEvent,
      optionId,
      this.state
    );

    this.state.currentSeasonEvents.push(record);
    this.state.activeInteractiveEvent = null;
  }

  /**
   * Compra o mejora una obra del catálogo.
   */
  public purchaseUpgrade(upgradeId: string): { success: boolean; message: string } {
    const result = this.upgradeSys.purchase(upgradeId, this.state.upgrades, this.state.money);
    if (!result.success) {
      return { success: false, message: result.error || 'No se pudo adquirir la mejora' };
    }
    this.state.money = result.newMoney;

    // Actualizar capacidades de almacenamiento si impacta el embalse
    const upg = this.upgradeSys.getUpgrade(upgradeId);
    if (upg?.branch === 'AGUA_RESERVAS') {
      const upgMap = this.upgradeSys.getActiveLevelMap(this.state.upgrades);
      let bonusCap = 0;
      const damLvl = upgMap['ampliacion_embalse'] || 0;
      if (damLvl === 1) bonusCap += 25;
      else if (damLvl === 2) bonusCap += 55;
      else if (damLvl >= 3) bonusCap += 90;
      this.state.reservoirCapacity = this.scenario.initialState.reservoirCapacity + bonusCap;
    }

    return { success: true, message: `¡Mejora completada: ${upg?.name} (Nivel ${result.newLevel})!` };
  }

  /**
   * Resuelve el turno de la estación actual (Operación central: resolveSeason).
   */
  public resolveSeason(): SeasonResult {
    const st = this.state;
    const seasonConfig = (seasonsData as any)[st.season];
    const climConf = this.climateSys.getClimateConfig(st.climateState);
    const upgMap = this.upgradeSys.getActiveLevelMap(st.upgrades);

    const allocations: Record<SectorId, number> = {
      population: st.sectors.population.allocated,
      agriculture: st.sectors.agriculture.allocated,
      livestock: st.sectors.livestock.allocated,
      mining: st.sectors.mining.allocated,
      ecosystem: st.sectors.ecosystem.allocated,
      reserve: 0
    };

    const hydrology = this.waterSys.resolveSeason(
      {
        seasonRainfall: this.currentRainResult.seasonalRainfall,
        rainfallIntensity: this.currentRainResult.rainfallIntensity,
        soilInfiltration: this.currentRainResult.soilInfiltration,
        surfaceRunoff: this.currentRainResult.surfaceRunoff,
        directRiverRain: this.currentRainResult.directRiverRain,
        evaporatedRain: this.currentRainResult.evaporatedRain,

        snowReserveStart: this.currentSnowResult.snowReserveBeforeMelt,
        snowAccumulated: this.currentSnowResult.snowAccumulated,
        snowMelt: this.currentSnowResult.snowMelt,
        snowReserveEnd: this.currentSnowResult.snowReserveEnd,

        evaporationFactor: climConf.evaporationFactor,
        evaporationMultiplier: seasonConfig.evaporationMultiplier || 1.0,
        temperatureAnomaly: st.temperatureAnomaly,

        reservoirStart: st.reservoirVolume,
        reservoirCapacity: st.reservoirCapacity,

        aquiferStart: st.aquiferVolume,
        aquiferCapacity: st.aquiferCapacity,

        allocations,
        availableWater: st.availableWater,
        upgrades: upgMap
      },
      st.sectors,
      st.waterQuality,
      st.basinHealth,
      st.publicTrust
    );

    // Actualizar estado del juego
    st.reservoirVolume = hydrology.newReservoirVolume;
    st.aquiferVolume = hydrology.newAquiferVolume;
    st.aquiferStressLevel = hydrology.newAquiferStress;
    st.waterQuality = hydrology.newWaterQuality;
    st.basinHealth = hydrology.newBasinHealth;
    st.publicTrust = hydrology.newPublicTrust;

    // Actualizar consumos y retornos
    for (const key of Object.keys(allocations) as SectorId[]) {
      if (key !== 'reserve') {
        st.sectors[key].consumed = hydrology.balance.consumptions[key];
        st.sectors[key].returned = hydrology.balance.returns[key];
        st.sectors[key].satisfactionRate = hydrology.balance.satisfactions[key];
      }
    }

    // Mensajes didácticos
    let adviceMessage = '';
    if (hydrology.newAquiferStress === 'CRITICAL') {
      adviceMessage = '⚠️ ¡El acuífero subterráneo está en nivel crítico! Extraer más agua de los poros de la roca puede provocar hundimientos irreversibles.';
    } else if (hydrology.balance.satisfactions.population < 0.90) {
      adviceMessage = '⚠️ La ciudad sufrió cortes de agua potable. Se dispararon los reclamos ciudadanos y cayó la confianza pública.';
    } else if (hydrology.balance.satisfactions.ecosystem < 0.70) {
      adviceMessage = '⚠️ El río quedó por debajo del caudal ecológico. Peces y plantas acuáticas sufrieron degradación.';
    } else if (st.reservoirVolume < 25 && st.season === 'SPRING') {
      adviceMessage = '💡 El embalse no logró recargarse con el deshielo. Se avecina un verano de alta exigencia hídrica.';
    } else {
      adviceMessage = '✅ Gestión equilibrada: se cubrieron las necesidades y se preservaron reservas.';
    }

    const seasonResult: SeasonResult = {
      turn: st.turn,
      year: st.year,
      season: st.season,
      climateState: st.climateState,
      ensoState: st.ensoState,
      balance: hydrology.balance,
      events: [...st.currentSeasonEvents],
      adviceMessage
    };

    st.seasonHistory.push(seasonResult);
    st.isSeasonResolved = true;

    // Si terminó Otoño (turno 4, 8, 12, 16, 20), ejecutamos el cierre anual
    if (st.season === 'AUTUMN') {
      this.closeYear();
    }

    return seasonResult;
  }

  /**
   * Cierre anual al finalizar Otoño: calcula ingresos, presupuesto ganado y consolida métricas.
   */
  private closeYear(): void {
    const st = this.state;
    const yearSeasons = st.seasonHistory.filter(s => s.year === st.year);

    let sumPop = 0;
    let sumAgri = 0;
    let sumMin = 0;
    let sumEco = 0;

    for (const sr of yearSeasons) {
      sumPop += sr.balance.satisfactions.population;
      sumAgri += sr.balance.satisfactions.agriculture;
      sumMin += sr.balance.satisfactions.mining;
      sumEco += sr.balance.satisfactions.ecosystem;
    }

    const count = Math.max(1, yearSeasons.length);
    const avgPop = sumPop / count;
    const avgAgri = sumAgri / count;
    const avgMin = sumMin / count;
    const avgEco = sumEco / count;

    // Cálculo de presupuesto anual (Sección 14):
    // Ingresos por actividad productiva + recaudación urbana + bono por confianza y salud ambiental - costos de mantenimiento
    const popTax = Math.round(avgPop * 30);
    const agriRevenue = Math.round(avgAgri * 40);
    const minRoyalties = Math.round(avgMin * 35);
    const ecoGrant = avgEco >= 0.85 ? 15 : 0;
    const trustBonus = st.publicTrust >= 80 ? 15 : 0;
    const baseMaintenance = 25;

    const budgetEarned = Math.max(20, popTax + agriRevenue + minRoyalties + ecoGrant + trustBonus - baseMaintenance);
    st.money += budgetEarned;

    const summaryMessage = `Año ${st.year} finalizado con éxito. Se generaron $${budgetEarned} de presupuesto para nuevas obras.`;

    const yr: YearResult = {
      year: st.year,
      seasons: [...yearSeasons],
      avgPopSatisfaction: avgPop,
      avgAgriSatisfaction: avgAgri,
      avgMinSatisfaction: avgMin,
      avgEcoSatisfaction: avgEco,
      reservoirEnd: st.reservoirVolume,
      aquiferEnd: st.aquiferVolume,
      waterQuality: st.waterQuality,
      basinHealth: st.basinHealth,
      publicTrust: st.publicTrust,
      budgetEarned,
      summaryMessage
    };

    st.yearHistory.push(yr);
    st.isYearEndPhase = true;

    if (st.turn >= 20 || st.year >= st.maxYears) {
      st.isGameOver = true;
    }
  }

  /**
   * Avanza al siguiente turno (estación).
   */
  public advanceToNextTurn(): void {
    if (this.state.isGameOver) return;

    this.state.turn += 1;
    this.state.year = Math.floor((this.state.turn - 1) / 4) + 1;
    this.state.season = SEASON_ORDER[(this.state.turn - 1) % 4];
    this.state.isYearEndPhase = false;

    this.prepareSeasonStart();
  }
}
