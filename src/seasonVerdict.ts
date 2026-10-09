import type { SeasonResult } from './models/Balance';

export type SeasonVerdictKind = 'crisis' | 'error' | 'recovery' | 'tradeoff' | 'opportunity' | 'good' | 'normal';

export interface SeasonVerdict {
  kind: SeasonVerdictKind;
  label: string;
  message: string;
  focus?: 'population' | 'ecosystem' | 'waterQuality' | 'basinHealth' | 'reservoir' | 'agriculture' | 'livestock' | 'mining';
  pendingSector?: 'agriculture' | 'livestock' | 'mining';
}

export function getSeasonVerdict(current: SeasonResult, previous?: SeasonResult): SeasonVerdict {
  const verdict = evaluateSeason(current, previous);
  const names = { agriculture: 'Cultivos', livestock: 'Granja', mining: 'Mina' };
  const pending = (Object.keys(names) as (keyof typeof names)[])
    .sort((a, b) => current.balance.satisfactions[a] - current.balance.satisfactions[b])
    .find(id => current.balance.satisfactions[id] < 0.8);
  if (pending) {
    verdict.pendingSector = pending;

  }
  const b = current.balance;
  const requestNames = { population: 'Ciudad', ...names };
  const ids = Object.keys(requestNames) as (keyof typeof requestNames)[];
  const zero = ids.filter(id => b.allocations[id] === 0 && b.satisfactions[id] < 1);
  if (zero.length) verdict.message += ` Sin pedido: ${zero.map(id => requestNames[id]).join(', ')}.`;
  const focus = verdict.focus === 'population' && b.satisfactions.population < 1 ? 'population' : pending;
  if (focus && b.allocations[focus] > 0) {
    const reason = b.suppliedAllocations[focus] < b.allocations[focus]
      ? 'el pedido no llegó completo' : 'el pedido llegó completo, pero fue menor que la demanda';
    verdict.message += focus === 'population' ? ` En Ciudad, ${reason}.`
      : ` ${requestNames[focus]} quedó en ${Math.round(b.satisfactions[focus] * 100)}%; ${reason}.`;
  }
  return verdict;
}

function evaluateSeason(current: SeasonResult, previous?: SeasonResult): SeasonVerdict {
  const b = current.balance;
  const s = b.satisfactions;
  const critical = s.population < 0.6 || s.ecosystem < 0.55 || b.waterQuality < 40 || b.basinHealth < 40;
  const strained = s.population < 0.8 || s.ecosystem < 0.75 || b.waterQuality < 60 || b.basinHealth < 60;

  // La falta grave prevalece sobre metas, eventos y mejoras parciales.
  if (critical) {
    const focus = s.population < 0.6 ? 'population' : s.ecosystem < 0.55 ? 'ecosystem' : b.waterQuality < 40 ? 'waterQuality' : 'basinHealth';
    const issue = focus === 'population' ? `la ciudad recibió ${Math.round(s.population * 100)}% de su demanda`
      : focus === 'ecosystem' ? `el caudal ecológico cubrió ${Math.round(s.ecosystem * 100)}% de la referencia`
        : focus === 'waterQuality' ? `la calidad del agua cerró en ${b.waterQuality}/100`
          : `la salud del río cerró en ${b.basinHealth}%`;
    return { kind: 'crisis', label: 'Crisis', focus, message: `Atención: ${issue}. Priorizá ese frente en la próxima estación.` };
  }
  if (strained) {
    const focus = s.population < 0.8 ? 'population' : s.ecosystem < 0.75 ? 'ecosystem' : b.waterQuality < 60 ? 'waterQuality' : 'basinHealth';
    const issue = focus === 'population' ? `la ciudad recibió ${Math.round(s.population * 100)}% de su demanda`
      : focus === 'ecosystem' ? `el caudal ecológico cubrió ${Math.round(s.ecosystem * 100)}% de la referencia`
        : focus === 'waterQuality' ? `la calidad del agua cerró en ${b.waterQuality}/100`
          : `la salud del río cerró en ${b.basinHealth}%`;
    return { kind: 'error', label: 'Resultado en alerta', focus, message: `Quedó una brecha importante: ${issue}.` };
  }

  if (previous) {
    const p = previous.balance;
    const wasStrained = p.satisfactions.population < 0.8 || p.satisfactions.ecosystem < 0.75
      || p.waterQuality < 60 || p.basinHealth < 60;
    const focus = p.satisfactions.population < 0.8 && s.population - p.satisfactions.population >= 0.15 ? 'population'
      : p.satisfactions.ecosystem < 0.75 && s.ecosystem - p.satisfactions.ecosystem >= 0.15 ? 'ecosystem'
        : p.waterQuality < 60 && b.waterQuality - p.waterQuality >= 8 ? 'waterQuality'
          : p.basinHealth < 60 && b.basinHealth - p.basinHealth >= 8 ? 'basinHealth' : undefined;
    if (wasStrained && focus) {
      return { kind: 'recovery', label: 'Recuperación', focus, message: 'Una brecha de la estación anterior mejoró y los indicadores clave salieron del nivel de alerta.' };
    }
  }

  const reservoirGain = b.reservoirEnd - b.reservoirStart;
  if (reservoirGain >= 10 && (current.season === 'WINTER' || current.season === 'SPRING')
    && s.population >= 0.95 && s.ecosystem >= 0.9) {
    return { kind: 'recovery', label: 'El embalse recuperó agua', focus: 'reservoir',
      message: `El embalse sumó ${reservoirGain} 💧 reales; ciudad y río mantuvieron cobertura básica. Esa reserva ayuda a la próxima estación.` };
  }
  if (previous) {
    for (const [id, name] of [['agriculture', 'Cultivos'], ['livestock', 'Granja'], ['mining', 'Mina']] as const) {
      if (previous.balance.satisfactions[id] < 0.7 && s[id] >= 0.7
        && s[id] - previous.balance.satisfactions[id] >= 0.15) {
        return { kind: 'recovery', label: `${name} recuperó cobertura`, focus: id,
          message: `${name} pasó de ${Math.round(previous.balance.satisfactions[id] * 100)}% a ${Math.round(s[id] * 100)}% de cobertura; ciudad y río siguen fuera de alerta.` };
      }
    }
  }

  const reservoirDrop = b.reservoirStart - b.reservoirEnd;
  if (reservoirDrop > 0 && b.reservoirWithdrawal > 0 && (s.population >= 0.85 || s.agriculture >= 0.85)
    && s.ecosystem >= 0.85 && b.waterQuality >= 70 && b.basinHealth >= 65) {
    const beneficiary = s.population >= 0.85 ? `ciudad ${Math.round(s.population * 100)}%` : `cultivos ${Math.round(s.agriculture * 100)}%`;
    return {
      kind: 'tradeoff', label: 'El embalse ayudó, pero bajó',
      message: `Cobertura de ${beneficiary}; se retiraron ${b.reservoirWithdrawal} 💧 del embalse y su reserva bajó ${reservoirDrop} 💧.`
    };
  }

  const productiveCovered = [s.agriculture, s.livestock, s.mining].every(rate => rate >= 0.8);
  if (s.population >= 0.85 && s.ecosystem >= 0.85 && b.waterQuality >= 70 && b.basinHealth >= 65
    && productiveCovered) {
    return {
      kind: 'good', label: 'Buena gestión',
      message: current.goalAchieved
        ? 'Meta cumplida con ciudad, río y las tres actividades bien cubiertos, y calidad en buen nivel.'
        : 'Ciudad, río y las tres actividades cerraron con buena cobertura; la calidad acompañó.'
    };
  }

  // Una elección de evento no eclipsa un logro general de la estación.
  const chosenOpportunity = current.events.find(record =>
    record.event.type === 'OPPORTUNITY_INTERACTIVE' && record.chosenOptionId);
  if (chosenOpportunity) {
    return {
      kind: 'opportunity', label: 'Oportunidad aprovechada',
      message: `Se eligió una acción ante ${chosenOpportunity.event.name}; ciudad y caudal ecológico mantuvieron cobertura básica.`
    };
  }

  return { kind: 'normal', label: current.goalAchieved ? 'Meta cumplida, quedan decisiones' : 'Ciudad y río siguen adelante',
    message: current.goalAchieved ? 'La meta estacional se logró; no cubre todas las necesidades de la cuenca.'
      : `Ciudad cubrió ${Math.round(s.population * 100)}% y Río Vivo ${Math.round(s.ecosystem * 100)}%. Revisá reservas y actividades para el próximo reparto.` };
}
