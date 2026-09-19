import tutorialData from '../data/tutorial.json';
import { GameState } from '../models/GameState';
import { SectorId } from '../models/Sector';
import { SeasonType } from '../models/Season';

export interface TutorialPhaseData {
  phase: number;
  season: SeasonType;
  title: string;
  instruction: string;
  hint: string;
  enabledSectors: SectorId[];
  availableWater: number;
  targetSector?: SectorId;
  targetDemand?: number;
}

export class TutorialManager {
  private active: boolean = false;
  private currentPhaseIndex: number = 0;
  private summerAgriAllocation: number = 0;
  private autumnSplitChoice?: { agri: number; eco: number };
  private chosenUpgrade?: string;

  constructor() {
    this.currentPhaseIndex = 0;
  }

  public isActive(): boolean {
    return this.active;
  }

  public startTutorial(): void {
    this.active = true;
    this.currentPhaseIndex = 0;
    this.summerAgriAllocation = 0;
    this.autumnSplitChoice = undefined;
    this.chosenUpgrade = undefined;
  }

  public exitTutorial(): void {
    this.active = false;
    this.currentPhaseIndex = 0;
  }

  public getCurrentPhase(): number {
    return this.currentPhaseIndex + 1;
  }

  public getPhaseData(): TutorialPhaseData {
    return (tutorialData.phases as TutorialPhaseData[])[this.currentPhaseIndex];
  }

  public getTotalPhases(): number {
    return tutorialData.phases.length;
  }

  public recordSummerDecision(agriAllocated: number): void {
    this.summerAgriAllocation = agriAllocated;
  }

  public getSummerAgriAllocation(): number {
    return this.summerAgriAllocation;
  }

  public recordAutumnDecision(agriAllocated: number, ecoAllocated: number): void {
    this.autumnSplitChoice = { agri: agriAllocated, eco: ecoAllocated };
  }

  public getDeferredAutumnMessage(): string {
    if (this.summerAgriAllocation >= 20) {
      return '⚠️ Consecuencia real: Durante el verano utilizaste gran parte del agua en los cultivos. Como las lluvias de otoño fueron escasas, el embalse bajó y tienes menor margen de maniobra.';
    } else {
      return '💧 Consecuencia real: Gracias a la reserva que protegiste durante el verano, el embalse se mantiene en un nivel seguro y la cuenca atraviesa el período seco con tranquilidad.';
    }
  }

  public getImperfectChoiceMessage(): string {
    if (!this.autumnSplitChoice) return '';
    const { agri, eco } = this.autumnSplitChoice;
    if (agri > eco) {
      return 'Priorizaste la producción agrícola. Los agricultores están conformes, pero el río transporta menor caudal hacia el humedal.';
    } else if (eco > agri) {
      return 'Priorizaste la salud del río. El ecosistema y los peces están protegidos, pero el campo cosechará con cierta merma.';
    } else {
      return 'Repartiste el agua por igual. Ambos sectores sufrieron un pequeño ajuste, pero ninguno quedó completamente desabastecido.';
    }
  }

  public applyTutorialUpgrade(upgradeId: 'riego_eficiente' | 'estacion_meteorologica', state: GameState): {
    title: string;
    beforeText: string;
    afterText: string;
    impactText: string;
  } {
    this.chosenUpgrade = upgradeId;
    if (!state.upgrades[upgradeId]) {
      state.upgrades[upgradeId] = { id: upgradeId, currentLevel: 1 };
    } else {
      state.upgrades[upgradeId].currentLevel = 1;
    }

    if (upgradeId === 'riego_eficiente') {
      const beforeDemand = state.sectors.agriculture.baseDemand;
      const afterDemand = Math.round(beforeDemand * 0.88);
      state.sectors.agriculture.currentDemand = afterDemand;
      return {
        title: '🌾 Riego Tecnificado Instalado (Nivel 1)',
        beforeText: `Demanda agrícola anterior: ${beforeDemand} 💧`,
        afterText: `Nueva demanda agrícola: ${afterDemand} 💧 (-12% de ahorro)`,
        impactText: '¡Aparecieron aspersores giratorios en los campos! Ahora se gasta menos agua para producir lo mismo.'
      };
    } else {
      state.nextSeasonForecast.accuracy = 0.65;
      return {
        title: '📡 Estación Meteorológica Instalada (Nivel 1)',
        beforeText: 'Pronóstico meteorológico: Incierto (40% de acierto)',
        afterText: 'Nuevo pronóstico: Alerta de tendencia confiable (65% de precisión)',
        impactText: '¡Se erigió una torre con radar en la colina! Ahora anticiparás sequías y lluvias antes de que ocurran.'
      };
    }
  }

  public canAdvance(state: GameState): { allowed: boolean; feedback: string } {
    const phase = this.getCurrentPhase();

    if (phase === 1) {
      // Fase 1: Introducción a la nieve e invierno
      return { allowed: true, feedback: '¡Entendido! Pasemos a la primavera para ver el deshielo.' };
    }

    if (phase === 2) {
      // Fase 2: Abastecer la Ciudad
      const popAlloc = state.sectors.population.allocated;
      if (popAlloc < 10) {
        return {
          allowed: false,
          feedback: '⚠️ La ciudad recibe muy poca agua (menos del 50%). Sube el slider de Ciudad para abastecerla mejor.'
        };
      }
      return {
        allowed: true,
        feedback: popAlloc >= 20 ? '✓ ¡Excelente! Ciudad 100% abastecida.' : '✓ Has abastecido a la ciudad de forma parcial.'
      };
    }

    if (phase === 3) {
      // Fase 3: Caudal ecológico
      const ecoAlloc = state.sectors.ecosystem.allocated;
      if (ecoAlloc < 6) {
        return {
          allowed: false,
          feedback: '⚠️ El río está casi seco. Mueve el slider de Río Vivo al menos a 6💧 para sostener a los peces.'
        };
      }
      return {
        allowed: true,
        feedback: '✓ ¡El río mantiene su caudal ecológico y el humedal está vivo!'
      };
    }

    if (phase === 4) {
      // Fase 4: Reserva
      return { allowed: true, feedback: '✓ Reserva almacenada en el embalse para el verano.' };
    }

    if (phase === 5) {
      // Fase 5: Ola de calor
      return { allowed: true, feedback: '✓ Superaste la ola de calor utilizando tu reserva previa.' };
    }

    if (phase === 6) {
      // Fase 6: Agricultura
      this.recordSummerDecision(state.sectors.agriculture.allocated);
      return { allowed: true, feedback: '✓ Decisión de riego confirmada. Veremos el impacto en otoño.' };
    }

    if (phase === 7) {
      // Fase 7: Consecuencia diferida
      return { allowed: true, feedback: '✓ Comprendiste el impacto de tus decisiones previas.' };
    }

    if (phase === 8) {
      // Fase 8: Decisión sin solución perfecta
      const total = state.sectors.agriculture.allocated + state.sectors.ecosystem.allocated;
      if (total === 0) {
        return { allowed: false, feedback: '⚠️ Asigna los 10💧 disponibles entre Cultivos y Río Vivo.' };
      }
      this.recordAutumnDecision(state.sectors.agriculture.allocated, state.sectors.ecosystem.allocated);
      return { allowed: true, feedback: '✓ Asumiste el compromiso de priorización.' };
    }

    if (phase === 9) {
      // Fase 9: Primera mejora
      if (!this.chosenUpgrade) {
        return { allowed: false, feedback: '⚠️ Elige una de las dos mejoras para continuar.' };
      }
      return { allowed: true, feedback: '✓ ¡Mejora construida con éxito!' };
    }

    return { allowed: true, feedback: '' };
  }

  public advancePhase(): boolean {
    if (this.currentPhaseIndex < tutorialData.phases.length - 1) {
      this.currentPhaseIndex++;
      return true;
    }
    return false;
  }
}
