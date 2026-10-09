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

  constructor() {
    this.currentPhaseIndex = 0;
  }

  public isActive(): boolean {
    return this.active;
  }

  public startTutorial(): void {
    this.active = true;
    this.currentPhaseIndex = 0;
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

  public canAdvance(state: GameState): { allowed: boolean; feedback: string } {
    const phase = this.getCurrentPhase();

    if (phase === 1) {
      // Fase 1: Introducción a la nieve e invierno
      return { allowed: true, feedback: 'Seguí el agua hasta el embalse.' };
    }

    if (phase === 2) {
      // Fase 2: Abastecer la Ciudad
      const popAlloc = state.sectors.population.allocated;
      if (popAlloc < state.sectors.population.currentDemand) {
        return {
          allowed: false,
          feedback: `Mové Ciudad hasta ${state.sectors.population.currentDemand} gotas: es lo que necesita.`
        };
      }
      return {
        allowed: true,
        feedback: '✓ Meta cubierta en este ejemplo. En la partida, mirá la cobertura prevista.'
      };
    }

    if (phase === 3) {
      // Fase 3: Caudal ecológico
      const ecoAlloc = state.sectors.ecosystem.allocated;
      if (ecoAlloc < state.sectors.ecosystem.currentDemand) {
        return {
          allowed: false,
          feedback: `Pedí ${state.sectors.ecosystem.currentDemand} gotas adicionales para completar esta práctica.`
        };
      }
      return {
        allowed: true,
        feedback: '✓ Practicaste un aporte adicional al humedal.'
      };
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
