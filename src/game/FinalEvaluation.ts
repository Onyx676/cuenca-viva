import type { GameState } from '../models/GameState';

const sectors = ['population', 'agriculture', 'livestock', 'mining'] as const;
const names = { population: 'Ciudad', agriculture: 'Cultivos', livestock: 'Granja', mining: 'Mina' };

/** Descripción de registros del modelo; no califica aprendizaje ni predice sostenibilidad real. */
export function evaluateFinalHistory(state: GameState) {
  const history = state.seasonHistory;
  const count = history.length;
  const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);
  const mean = (values: number[]) => count ? sum(values) / count : 0;
  const longestRun = (values: boolean[]) => {
    let run = 0, longest = 0;
    for (const value of values) { run = value ? run + 1 : 0; longest = Math.max(longest, run); }
    return longest;
  };
  const coverage = sectors.map(id => {
    const values = history.map(row => row.balance.satisfactions[id]);
    return { id, name: names[id], mean: mean(values), worst: count ? Math.min(...values) : 0,
      incompleteRun: longestRun(values.map(value => value < 1)), zeroTurns: values.filter(value => value === 0).length };
  });
  const completeTurns = history.filter(row => sectors.every(id => row.balance.satisfactions[id] >= 1)).length;
  const zeroTurns = history.filter(row => sectors.some(id => row.balance.satisfactions[id] === 0)).length;
  const river = {
    referenceTurns: history.filter(row => row.balance.satisfactions.ecosystem >= 1).length,
    belowReferenceRun: longestRun(history.map(row => row.balance.satisfactions.ecosystem < 1)),
    qualityMean: mean(history.map(row => row.balance.waterQuality)),
    qualityWorst: count ? Math.min(...history.map(row => row.balance.waterQuality)) : 0,
    qualityClose: history.at(-1)?.balance.waterQuality ?? null,
  };
  const reserves = (kind: 'reservoir' | 'aquifer') => {
    const eventValues = (row: GameState['seasonHistory'][number]) => row.events.map(event =>
      kind === 'reservoir' ? event.waterAdjustment?.reservoirChange ?? 0 : event.waterAdjustment?.aquiferChange ?? 0);
    const adjustments = history.map(row => sum(eventValues(row)));
    const individualAdjustments = history.flatMap(eventValues);
    const first = history[0]?.balance;
    const initial = first ? (kind === 'reservoir' ? first.reservoirStart : first.aquiferStart) - adjustments[0] : null;
    const closes = history.map(row => kind === 'reservoir' ? row.balance.reservoirEnd : row.balance.aquiferEnd);
    const final = closes.at(-1) ?? null;
    return { initial, final, change: initial !== null && final !== null ? final - initial : null,
      lowestClose: count ? Math.min(...closes) : null, eventChange: sum(adjustments),
      eventAdded: sum(individualAdjustments.filter(value => value > 0)), eventRemoved: -sum(individualAdjustments.filter(value => value < 0)) };
  };
  const reservoir = reserves('reservoir'), aquifer = reserves('aquifer');
  const reservesFell = (reservoir.change ?? 0) < 0 || (aquifer.change ?? 0) < 0;
  const recharge = {
    rain: sum(history.map(row => row.balance.aquiferNaturalRecharge)),
    river: sum(history.map(row => row.balance.aquiferRiverRecharge ?? 0)),
    work: sum(history.map(row => row.balance.aquiferArtificialRecharge)),
    pumping: sum(history.map(row => row.balance.aquiferWithdrawal)),
  };
  const title = !count ? 'Sin registros para evaluar la partida'
    : zeroTurns ? 'Hubo necesidades sin abastecer'
      : completeTurns === count && reservesFell ? 'Abastecimiento completo con reservas en descenso'
        : completeTurns === count ? 'Abastecimiento completo: revisá también río y reservas'
          : 'Así se repartieron los beneficios y las brechas';
  const deliveredButIncomplete = history.filter(row => sectors.some(id => row.balance.satisfactions[id] < 1
    && row.balance.suppliedAllocations[id] >= row.balance.allocations[id])).length;
  const riverWithoutExtra = history.find(row => row.balance.allocations.ecosystem === 0 && row.balance.satisfactions.ecosystem >= 1);
  const quiz = count ? [
    { question: 'Si llega todo el pedido de un sector, ¿su demanda quedó cubierta?',
      options: ['Sí: recibir todo el pedido siempre cubre la demanda.', 'Sólo si el pedido alcanzaba para cubrir la demanda.', 'No: los pedidos nunca cuentan para la cobertura.'], correct: 1,
      explanation: `El pedido puede ser menor que la demanda. En esta partida hubo ${deliveredButIncomplete} estaciones con algún pedido entregado íntegro y cobertura incompleta; incluye pedidos de cero gotas.` },
    { question: 'Si no asignaste aporte adicional al humedal, ¿el río necesariamente quedó sin agua?',
      options: ['Sí: el aporte adicional es su única fuente.', 'Sí, salvo que se haya ampliado el embalse.', 'No: el caudal también puede recibir agua que sigue por el río y retornos.'], correct: 2,
      explanation: riverWithoutExtra ? `En la estación ${riverWithoutExtra.turn}, sin aporte adicional, el río alcanzó su referencia. El balance registra el agua que siguió aguas abajo, que puede incluir retornos.`
        : 'El aporte adicional no es la única fuente: también pueden contribuir el agua que sigue por el río y los retornos. En esta partida no se registró una estación sin aporte extra que alcanzara la referencia.' },
    { question: '¿Tener mucha agua guardada basta para decir que la gestión fue equilibrada?',
      options: ['No: también hay que revisar abastecimiento, caudal y calidad del río.', 'Sí: guardar agua es el único objetivo.', 'Sí, si además se acumula dinero.'], correct: 0,
      explanation: `Las reservas no reemplazan otras necesidades. Se cubrieron los cuatro usos en ${completeTurns}/${count} estaciones y el río alcanzó la referencia en ${river.referenceTurns}/${count}. Revisá ambas trayectorias antes de concluir.` },
  ] : [];
  return { count, title, coverage, completeTurns, zeroTurns, river, reservoir, aquifer, reservesFell, recharge, quiz };
}
