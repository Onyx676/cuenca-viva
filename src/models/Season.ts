export type SeasonType = 'WINTER' | 'SPRING' | 'SUMMER' | 'AUTUMN';

export interface SeasonInfo {
  id: SeasonType;
  name: string;
  icon: string;
  description: string;
  order: number; // 0: Winter, 1: Spring, 2: Summer, 3: Autumn
}

export const SEASONS_INFO: Record<SeasonType, SeasonInfo> = {
  WINTER: {
    id: 'WINTER',
    name: 'Invierno',
    icon: '❄️',
    description: 'Acumulación de nieve en alta cordillera y menor evaporación.',
    order: 0
  },
  SPRING: {
    id: 'SPRING',
    name: 'Primavera',
    icon: '🌱',
    description: 'Comienza el deshielo nival, recuperando embalses y aumentando caudales.',
    order: 1
  },
  SUMMER: {
    id: 'SUMMER',
    name: 'Verano',
    icon: '☀️',
    description: 'Máxima evaporación y mayor demanda hídrica en cultivos, ganado y ciudad.',
    order: 2
  },
  AUTUMN: {
    id: 'AUTUMN',
    name: 'Otoño',
    icon: '🍂',
    description: 'Período de lluvias e infiltración hacia el acuífero subterráneo.',
    order: 3
  }
};

export const SEASON_ORDER: SeasonType[] = ['WINTER', 'SPRING', 'SUMMER', 'AUTUMN'];

export function getNextSeason(current: SeasonType): { nextSeason: SeasonType; isNewYear: boolean } {
  const currentIndex = SEASON_ORDER.indexOf(current);
  const nextIndex = (currentIndex + 1) % SEASON_ORDER.length;
  return {
    nextSeason: SEASON_ORDER[nextIndex],
    isNewYear: nextIndex === 0
  };
}
