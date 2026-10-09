import type { SeasonResult, SeasonWaterBalance } from './models/Balance';

const sectors = ['population', 'agriculture', 'livestock', 'mining'] as const;
const names = { population: 'Ciudad', agriculture: 'Cultivos', livestock: 'Granja', mining: 'Mina' };

// La historia no registra demandas: cobertura incompleta + pedido entregado
// permite distinguir una brecha del pedido sin inventar su demanda numérica.
export function describeRequestGaps(b: SeasonWaterBalance): string {
  const zero = sectors.filter(id => b.allocations[id] === 0 && b.satisfactions[id] < 1);
  const low = sectors.filter(id => b.allocations[id] > 0
    && b.suppliedAllocations[id] >= b.allocations[id] && b.satisfactions[id] < 1);
  const missing = sectors.filter(id => b.suppliedAllocations[id] < b.allocations[id]);
  const list = (ids: readonly (typeof sectors[number])[]) => ids.map(id => names[id]).join(', ');
  return [
    zero.length ? `Sin pedido: ${list(zero)}.` : '',
    low.length ? `Pedido entregado completo, menor que la demanda: ${list(low)}.` : '',
    missing.length ? `Pedido no entregado por completo: ${list(missing)}.` : '',
  ].filter(Boolean).join(' ');
}

export function describeStorageHistory(history: SeasonResult[], kind: 'reservoir' | 'aquifer', mode: 'detail' | 'summary' = 'detail'): string {
  if (!history.length) return 'Sin historial estacional para reconstruir las reservas.';
  const eventDelta = (r: SeasonResult) => r.events.reduce((sum, e) => sum
    + (kind === 'reservoir' ? e.waterAdjustment?.reservoirChange ?? 0 : e.waterAdjustment?.aquiferChange ?? 0), 0);
  const first = history[0];
  // Inicio del balance YA incluye el evento de esa estación. Restarlo sólo
  // del primer inicio permite sumar cada ajuste una vez en toda la trayectoria.
  const initial = (kind === 'reservoir' ? first.balance.reservoirStart : first.balance.aquiferStart) - eventDelta(first);
  const end = kind === 'reservoir' ? history.at(-1)!.balance.reservoirEnd : history.at(-1)!.balance.aquiferEnd;
  const sum = (get: (r: SeasonResult) => number) => history.reduce((s, r) => s + get(r), 0);
  const inflow = sum(r => kind === 'reservoir' ? r.balance.reservoirInflow
    : r.balance.aquiferNaturalRecharge + r.balance.aquiferArtificialRecharge);
  const withdrawal = sum(r => kind === 'reservoir' ? r.balance.reservoirWithdrawal : r.balance.aquiferWithdrawal);
  const overflow = sum(r => kind === 'reservoir' ? r.balance.reservoirSpill : r.balance.aquiferOverflow);
  const evaporation = kind === 'reservoir' ? sum(r => r.balance.reservoirEvaporation) : 0;
  const events = sum(eventDelta);
  const unexplained = end - (initial + inflow - withdrawal - overflow - evaporation + events);
  const signed = (n: number) => `${n >= 0 ? '+' : '−'}${Math.abs(n)}`;
  const name = kind === 'reservoir' ? 'Embalse' : 'Acuífero';
  if (mode === 'summary') {
    const emergency = kind === 'aquifer' && history.some(r => r.events.some(e =>
      e.event.id === 'sequia_severa' && e.chosenOptionId === 'bombear_acuifero'
      && (e.waterAdjustment?.aquiferChange ?? 0) < 0));
    return `${name}: de ${initial} a ${end} gotas (${signed(end - initial)} netas). ${inflow} gotas de ${kind === 'aquifer' ? 'recarga' : 'entrada'} acompañaron ${withdrawal} de abastecimiento normal${overflow ? `; ${overflow} salieron por ${kind === 'aquifer' ? 'desborde' : 'derrame'}` : ''}${events ? `; ajuste neto extraordinario por eventos: ${signed(events)} gotas${emergency ? ', incluida la emergencia' : ''}` : ''}.${unexplained ? ' Hay otros cambios sin desglose; consultá el detalle.' : ''}`;
  }
  return `${name}: inicio ${initial} + ${inflow} ${kind === 'reservoir' ? 'entradas del río' : 'recarga natural y artificial'} − ${withdrawal} abastecimiento normal − ${overflow} ${kind === 'reservoir' ? 'derrames' : 'desbordes'}${kind === 'reservoir' ? ` − ${evaporation} evaporación` : ''}${events ? ` ${signed(events)} ajustes extraordinarios de eventos` : ''}${unexplained ? ` ${signed(unexplained)} otros cambios entre balances sin desglose` : ''} = ${end} gotas al cierre. Cambio neto: ${signed(end - initial)} gotas.${kind === 'reservoir' && overflow === 0 ? ' No hubo derrames registrados; ampliar capacidad no agrega agua.' : ''}`;
}
