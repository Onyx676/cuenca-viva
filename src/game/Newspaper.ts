import type { SeasonResult } from '../models/Balance';
import { SEASONS_INFO } from '../models/Season';
import { getSeasonVerdict, type SeasonVerdict, type SeasonVerdictKind } from '../seasonVerdict';
import { SeededRandom } from '../simulation/RandomSystem';
import { NEWSPAPER_HEADLINES } from './NewspaperHeadlines';

export interface NewspaperArticle {
  headline: string;
  subhead: string;
  photoEmoji: string;
}
export interface NewspaperEdition {
  editionNumber: number;
  dateString: string;
  price: string;
  kind: SeasonVerdictKind;
  label: string;
  mainArticle: NewspaperArticle;
  secondaryArticles: Pick<NewspaperArticle, 'headline' | 'subhead'>[];
}

// Comentarios editoriales de personajes: no son sucesos ni daños simulados.
// Azar editorial independiente y reproducible, sin acceso al PRNG de gameplay.
const VOICES = {
  population: ['Sofía: «La canilla exige un escribano. Me rindo».', 'Sofía: «Puse una peluca al trámite. Sigue siendo un trámite».', 'Sofía: «El mapache selló mi taza. Ahora soy expediente».', 'Sofía: «¿Y si nombramos ministro al flotante del tanque?».'],
  agriculture: ['Jacinto: «Si las actas regaran, tendría arroz en el techo».', 'Jacinto: «Mi zapallo pide abogado. Se cree concesionario».', 'Jacinto: «El espantapájaros cobra viáticos. Yo sigo acá».', 'Jacinto: «Regar con discursos: aprobado por los cactus».'],
  livestock: ['Berta: «Las vacas piden megáfono. Ya bastante opinan».', 'Berta: «Una vaca quiere ser concejal. Tiene cara de acta».', 'Berta: «El comité rumia. La vaca pide que no la imiten».', 'Berta: «Les puse corbata. Ahora mugen por ventanilla».'],
  mining: ['Ferrada: «Mi casco pide vacaciones. Le ofrecí un tupper».', 'Ferrada: «El mapache audita con un colador. Me preocupa».', 'Ferrada: «La planilla tiene sed. No pienso regar Excel».', 'Ferrada: «Pipo trajo un pico de juguete. Quiere ascenso».'],
  ecosystem: ['Clara: «Pipo vino de inspector. El chaleco le queda de carpa».', 'Clara: «El mapache exige peaje. Le pagué con una hoja».', 'Clara: «Pipo quiere un río con wifi. Primero, un río».', 'Clara: «Una rana pidió el acta en idioma charco».'],
  reservoir: ['Sofía: «El embalse no acepta cuotas ni un abrazo».', 'Jacinto: «El verano vino con sorbete. No lo dejen pasar».', 'Berta: «La vaca quiere guardar lluvia en un tupper».', 'Ferrada: «El mapache declaró al embalse caja chica».'],
  waterQuality: ['Clara: «Pipo trajo un colador. Dice que es tecnología».', 'Ferrada: «El mapache lava el informe. Sigue sin servir».', 'Sofía: «Agua perfumada: idea rechazada por la rana».', 'Clara: «Pipo pide agua clara, no un PowerPoint celeste».'],
  basinHealth: ['Clara: «La rana preside. Prohibió croar por encima de ella».', 'Sofía: «Pipo dibujó un río en el acta. Pide flotadores».', 'Jacinto: «El mapache propone regar las fotocopias».', 'Clara: «Pipo llevó salvavidas a una reunión de Zoom».']
} as const;

const NAMES = { population: 'Ciudad', agriculture: 'Cultivos', livestock: 'Granja', mining: 'Mina', ecosystem: 'Río Vivo', reservoir: 'Embalse', waterQuality: 'Calidad del agua', basinHealth: 'Salud del río' } as const;

const EXTRA_VOICES = {
  population: ['Sofía: «El vecino trajo la canilla a la asamblea».', 'Sofía: «Pipo vende turnos para mirar la fuente».', 'Sofía: «Un balde pidió ser secretario».', 'Sofía: «La fila de trámites llegó al tanque».'],
  agriculture: ['Jacinto: «El tomate pide escolta para ir al riego».', 'Jacinto: «El maíz contrató al abogado del zapallo».', 'Jacinto: «El cactus vende cursos de paciencia».', 'Jacinto: «El espantapájaros pide oficina con sombra».'],
  livestock: ['Berta: «La vaca trajo un silbato. Grave error».', 'Berta: «El toro exige un bebedero con reposabrazos».', 'Berta: «La asamblea terminó: se comieron el acta».', 'Berta: «Las vacas contrataron al gallo de vocero».'],
  mining: ['Ferrada: «El casco exige aire acondicionado».', 'Ferrada: «Pipo fiscaliza usando una lupa de juguete».', 'Ferrada: «La máquina pide una hamaca paraguaya».', 'Ferrada: «El ventilador se anotó como asesor».'],
  ecosystem: ['Clara: «La rana quiere una oficina flotante».', 'Clara: «Pipo exige casco para entrar al charco».', 'Clara: «Las totoras fundaron una comisión».', 'Clara: «El flamenco vino a pedir estacionamiento».'],
  reservoir: ['Berta: «El tupper no pasó la inspección de represas».', 'Sofía: «Pipo ofrece un seguro contra sorbetes».', 'Jacinto: «La nube no acepta que le cobren expensas».', 'Ferrada: «El embalse rechazó un pagaré mojado».'],
  waterQuality: ['Clara: «La rana rechaza el detergente de Pipo».', 'Sofía: «El perfume no reemplaza al tratamiento».', 'Ferrada: «Pipo quiere filtrar el agua con una media».', 'Clara: «El colador tiene más prensa que utilidad».'],
  basinHealth: ['Clara: «Las totoras pidieron silla en el consejo».', 'Berta: «La rana controla el orden del día».', 'Jacinto: «Pipo propone darles vacaciones a los peces».', 'Sofía: «La reunión flotante terminó en remojo».']
} as const;

// Una escena editorial y la decisión que sí está registrada. No atribuye
// efectos nominales, producción ni suministro al evento: eso vive en el balance.
export function getEventRecap(record: SeasonResult['events'][number], turn: number): { headline: string; decision: string } | null {
  if (!record.chosenOptionId) return null;
  const option = record.event.options?.find(item => item.id === record.chosenOptionId);
  if (!option) return null;
  const scenes: Record<string, readonly string[]> = {
    berta_calor: ['Berta: «La vaca pidió hielo y una sombrillita»', 'Berta: «El toro quiso hacer bombita en el bebedero»'],
    ferrada_molienda: ['Ferrada: «La máquina trajo su propio abanico»', 'Ferrada: «El casco pidió sentarse frente al ventilador»'],
    sofia_aniversario: ['Sofía: «Pipo quiso cortar la cinta con los dientes»', 'Sofía: «El vecino vino al acto con patas de rana»'],
    jacinto_festival: ['Jacinto: «El maíz exige una alfombra roja»', 'Jacinto: «El zapallo quiere ser jurado de la cosecha»'],
    clara_carpincho: ['Clara: «Pipo reclamó agua por triplicado»', 'Clara: «La rana le negó el cargo de ministro del charco»'],
    fugas_red_ciudad: ['Sofía: «Pipo propuso tapar la fuga con un sello»', 'Sofía: «La cuadrilla retiró una media del plano de Pipo»'],
    flamencos_turismo: ['Clara: «Los flamencos pidieron habitaciones con vista»', 'Clara: «El flamenco quiso pagar el paseo con plumas»'],
    falla_saneamiento: ['Clara: «El colador de Pipo no pasó la inspección»', 'Clara: «Pipo confundió el filtro con un perchero»'],
    sequia_severa: ['Jacinto: «El sol vino con sorbete; nadie lo invitó»', 'Berta: «La vaca pidió negociar directamente con una nube»'],
    lluvia_extraordinaria: ['Sofía: «Pipo sacó el flotador antes que el paraguas»', 'Clara: «La rana quiso presidir desde una reposera»']
  };
  const choices: Record<string, string> = {
    agua_fresca_berta: 'Elegiste renovar los piletones con agua fresca.', bebederos_sombra: 'Elegiste sombra y bebederos térmicos.',
    enfriamiento_mina: 'Autorizaste agua adicional para la producción.', recirculacion_mina: 'Elegiste usar la recirculación instalada.', freno_mina: 'Mantuviste la producción normal sin agua extra.',
    fuentes_activas: 'Elegiste celebrar con las fuentes activas.', campana_educativa: 'Elegiste una exposición sobre cuidado del agua.', ahorro_estricto: 'Suspendiste los juegos de agua.',
    apoyo_jacinto: 'Autorizaste agua extra para la siembra.', riego_eficiente_jacinto: 'Elegiste exigir riego por goteo.', priorizar_reserva: 'Mantuviste el cupo para cuidar las reservas.',
    pulso_ecologico: 'Elegiste liberar un pulso de agua al humedal.', canal_biofiltro: 'Elegiste conectar meandros y totoras.', dejar_ciclo: 'Elegiste dejar continuar el ciclo natural.',
    reparar_canerias: 'Elegiste reparar la fuga con la cuadrilla.', sensores_red: 'Elegiste sectorizar la red con sensores.', postergar_fuga: 'Postergaste el arreglo de la fuga.', renovar_red: 'Elegiste renovar la red de forma permanente.',
    reserva_protegida: 'Elegiste proteger el área como parque natural.', paseos_embarcacion: 'Elegiste habilitar paseos guiados en canoa.',
    reparacion_urgente: 'Elegiste reparar los filtros de inmediato.', dilucion_rio: 'Elegiste liberar agua para diluir la suciedad.',
    restriccion_riego: 'Elegiste riego nocturno y restricciones.', agotar_embalse: 'Elegiste usar la reserva superficial de emergencia.', bombear_acuifero: 'Elegiste bombeo subterráneo de emergencia.',
    liberar_preventivo: 'Elegiste liberar agua antes de la crecida.', retener_todo: 'Elegiste intentar retener agua de la crecida.', drenaje_sostenible: 'Elegiste usar el drenaje para infiltrar agua.'
  };
  const lines = scenes[record.event.id];
  return { headline: lines ? lines[Math.floor((turn - 1) / 4) % lines.length] : record.event.name,
    decision: choices[record.chosenOptionId] ?? `Elegiste «${option.label}».` };
}

const RESERVE_HEADLINES = {
  draw: ['El embalse pagó: Pipo dejó la propina en hojas', 'La reserva bajó; Berta inventa la alcancía para lluvia', 'Pipo audita el embalse con una cucharita', 'El embalse prestó agua; Jacinto ofrece devolver sandías', 'Sofía busca al que anotó «agua infinita» en el presupuesto', 'Berta prohíbe a las vacas sorber el embalse con pajita', 'El embalse pide vacaciones; le ofrecen un feriado seco', 'Ferrada trae un termo: el embalse rechaza la garantía', 'Pipo declara al tupper reserva estratégica del valle', 'El embalse pagó; el verano pregunta si hay otra ronda', 'Sofía propone un tesorero que sepa cerrar la canilla', 'Jacinto guarda una nube dibujada: el banco no la acepta', 'Berta funda el Club de Amigos del Agua que Quedó', 'Pipo cuenta la reserva; pierde la cuenta al mojarse', 'Ferrada presenta un pagaré: el embalse no sabe leer', 'La reserva financió el reparto; la vaca pide el balance', 'Sofía suspende el concurso de llenar piletas con discursos', 'Jacinto ofrece empeñar el zapallo para cuidar la reserva', 'El embalse prestó otra vez; Pipo exige un garante con botas', 'Berta declara al tupper patrimonio hídrico familiar'],
  recovery: ['Embalse repuesto: Pipo propone un brindis con mate vacío', 'Embalse repuesto: la vaca exige un tupper más grande', 'Embalse repuesto: el mapache quiere cobrar expensas', 'Embalse repuesto: el verano se anota con sorbete']
} as const;

// Sólo narra resultados resueltos. El sorteo editorial no consume PRNG de gameplay.
export function generateNewspaperEdition(
  result: SeasonResult,
  previous?: SeasonResult,
  verdict: SeasonVerdict = getSeasonVerdict(result, previous),
  history: readonly SeasonResult[] = [],
  editorialSeed = 'HERALDO'
): NewspaperEdition {
  const b = result.balance;
  const s = b.satisfactions;
  const percent = (rate: number) => `${Math.round(rate * 100)}%`;
  const variant = ((result.turn - 1) % 20 + 20) % 20;
  // Cada situación tiene una bolsa barajada. Se agota antes de repetir;
  // reconstruirla desde semilla/historial conserva la edición al reabrir o recuperar.
  const occurrence = history.length ? history.filter(row => row.turn < result.turn &&
    getSeasonVerdict(row, history.find(item => item.turn === row.turn - 1)).kind === verdict.kind &&
    getSeasonVerdict(row, history.find(item => item.turn === row.turn - 1)).focus === verdict.focus).length : variant;
  const pick = (lines: readonly string[], topic = verdict.kind as string) => {
    const bag = [...lines];
    const editorialRandom = new SeededRandom(`${editorialSeed}:heraldo:${topic}:${Math.floor(occurrence / bag.length)}`);
    for (let index = bag.length - 1; index > 0; index--) {
      const swap = editorialRandom.rangeInt(0, index);
      [bag[index], bag[swap]] = [bag[swap], bag[index]];
    }
    return bag[occurrence % bag.length];
  };
  const voice = (topic: keyof typeof VOICES) => pick([...VOICES[topic], ...EXTRA_VOICES[topic]], `voice:${topic}`);
  const productive = ['agriculture', 'livestock', 'mining'] as const;
  const lowest = [...productive].sort((a, c) => s[a] - s[c])[0];
  const usesReturned = b.returns.population + b.returns.agriculture + b.returns.livestock + b.returns.mining;
  const requestFact = (id: 'population' | typeof productive[number]) =>
    b.allocations[id] === 0 ? `${NAMES[id]} no tuvo agua asignada.`
      : b.suppliedAllocations[id] < b.allocations[id] ? 'No llegó todo lo asignado.'
      : s[id] < 1 ? 'Llegó todo lo pedido; no cubría la demanda.' : '';
  const deficitFact = (id: typeof productive[number]) =>
    b.allocations[id] === 0 ? `${NAMES[id]} no tuvo agua asignada.`
      : b.suppliedAllocations[id] < b.allocations[id] ? `${NAMES[id]} cubrió ${percent(s[id])}: recibió ${b.suppliedAllocations[id]} 💧 de ${b.allocations[id]} asignadas. ${requestFact(id)}`
      : `${NAMES[id]} cubrió ${percent(s[id])} de su demanda. ${requestFact(id)}`;
  const chosen = result.events.find(item => item.chosenOptionId);
  const eventFact = (record: SeasonResult['events'][number]) => {
    const option = record.event.options?.find(item => item.id === record.chosenOptionId);
    const choice = option ? `Se eligió «${option.label}». ` : '';
    const adjustment = record.waterAdjustment;
    const effects = record.appliedEffects ?? option?.effects;
    const economy = effects?.moneyDelta
      ? effects.moneyDelta > 0 ? `Aporte de $${effects.moneyDelta}. ` : `Costo acordado: $${-effects.moneyDelta}. `
      : '';
    if (record.appliedEffects) {
      const actual = record.appliedEffects;
      const metrics = [
        actual.moneyDelta ? 'presupuesto' : '',
        actual.trustDelta ? 'confianza' : '',
        actual.basinHealthDelta ? 'salud de cuenca' : '',
        actual.waterQualityDelta ? 'calidad' : '',
        adjustment?.reservoirChange || adjustment?.aquiferChange ? 'reservas' : ''
      ].filter(Boolean);
      if (record.project) return `${choice}${record.project.upgradeId === 'reparacion_red' ? 'La renovación de la red' : 'La obra'} quedó instalada.`;
      return `${choice}${metrics.length ? `Cambió ${metrics.slice(0, 2).join(' y ')}.` : 'Sin cambio directo registrado.'}`;
    }
    // Los términos del acuerdo no prueban cambios netos: confianza/calidad tienen topes.
    const agreement = effects ? [
      effects.moneyDelta && effects.moneyDelta > 0 ? `Aporte de $${effects.moneyDelta}` : '',
      effects.moneyDelta && effects.moneyDelta < 0 ? `Costo acordado: $${-effects.moneyDelta}` : '',
      effects.trustDelta && effects.trustDelta > 0 ? 'bono de confianza' : '',
      effects.trustDelta && effects.trustDelta < 0 ? 'costo de confianza' : '',
      effects.basinHealthDelta && effects.basinHealthDelta > 0 ? 'apoyo a la salud del río' : '',
      effects.waterQualityDelta && effects.waterQualityDelta < 0 ? 'caída de calidad prevista' : ''
    ].filter(Boolean).join('; ') : '';
    // El registro real prima sobre los efectos nominales de la opción.
    const changes = adjustment
      ? [adjustment.reservoirChange !== 0 ? `embalse ${adjustment.reservoirChange > 0 ? '+' : ''}${adjustment.reservoirChange} 💧` : '',
         adjustment.aquiferChange !== 0 ? `acuífero ${adjustment.aquiferChange > 0 ? '+' : ''}${adjustment.aquiferChange} 💧` : ''].filter(Boolean).join('; ')
      : '';
    return `${choice}${changes ? `${economy}Ajuste real: ${changes}, fuera del reparto.` : agreement ? `Acuerdo: ${agreement}.` : ''}`.trim();
  };
  const covered = new Set<string>();
  const delta = b.reservoirEnd - b.reservoirStart;
  const qualityFact = previous
    ? `La calidad del agua pasó de ${previous.balance.waterQuality} a ${b.waterQuality}/100.`
    : `La calidad del agua cerró en ${b.waterQuality}/100.`;
  const reserveFact = delta > 0
    ? `El embalse recuperó reserva; guarda ${b.reservoirEnd} 💧 para más adelante.`
    : delta < 0 ? `El embalse bajó; quedan ${b.reservoirEnd} 💧 para la próxima estación.`
      : `El embalse conserva ${b.reservoirEnd} 💧, igual que al inicio del reparto.`;
  const facts = {
    population: b.allocations.population === 0 ? requestFact('population') : `Ciudad recibió ${percent(s.population)} de su demanda. ${requestFact('population')}`.trim(),
    ecosystem: `El caudal ecológico cubrió ${percent(s.ecosystem)} de su referencia.`,
    waterQuality: qualityFact,
    basinHealth: `La salud del río cerró en ${b.basinHealth}/100.`
  };
  const hints = {
    population: 'Revisá la asignación a Ciudad.',
    ecosystem: 'Revisá el caudal aguas abajo.',
    waterQuality: 'Revisá la calidad de los retornos y el tratamiento.',
    basinHealth: 'Para la próxima, mirá juntos el caudal ecológico y la calidad del agua.'
  };
  let headline: string;
  let subhead: string;
  let photoEmoji = '📰';
  // Una caída real de calidad merece portada antes que una reserva sin cambios
  // o una celebración. Ante recuperación o uso de reservas, sólo domina si cayó
  // al menos 8 puntos, la magnitud que el veredicto usa para recuperar calidad.
  // Crisis y alertas conservan prioridad; no cambiamos las reglas del veredicto.
  if (verdict.kind !== 'crisis' && verdict.kind !== 'error'
    && (['normal', 'good', 'opportunity'].includes(verdict.kind)
      || (previous && previous.balance.waterQuality - b.waterQuality >= 8))
    && previous && b.waterQuality < previous.balance.waterQuality) {
    covered.add('waterQuality');
    subhead = `${qualityFact} ${hints.waterQuality}`;
    photoEmoji = '🔎';
    headline = pick(NEWSPAPER_HEADLINES.qualityDrop, 'qualityDrop');
  } else if (verdict.kind === 'crisis' || verdict.kind === 'error') {
    const focus = verdict.focus as keyof typeof facts;
    covered.add(focus);
    headline = `${verdict.kind === 'crisis' ? 'Crisis' : 'Alerta'} en ${NAMES[focus]}`;
    headline += `: ${pick(NEWSPAPER_HEADLINES[verdict.kind])}`;
    if (focus === 'population' && b.allocations.population === 0) headline = `Ciudad sin pedido: ${pick(NEWSPAPER_HEADLINES[verdict.kind])}`;
    subhead = `${facts[focus]} ${hints[focus]}`;
    photoEmoji = verdict.kind === 'crisis' ? '🫶' : '🔎';
  } else if (verdict.kind === 'recovery') {
    const focus = verdict.focus!;
    covered.add(focus);
    const p = previous?.balance;
    const comparison = focus === 'reservoir' ? reserveFact
      : focus === 'agriculture' || focus === 'livestock' || focus === 'mining'
        ? `${focus === 'agriculture' ? 'Cultivos' : focus === 'livestock' ? 'Granja' : 'Mina'} pasó de ${percent(p!.satisfactions[focus])} a ${percent(s[focus])} de cobertura.`
      : focus === 'population'
      ? `Ciudad pasó de ${percent(p!.satisfactions.population)} a ${percent(s.population)} de cobertura.`
      : focus === 'ecosystem'
        ? `El caudal ecológico pasó de ${percent(p!.satisfactions.ecosystem)} a ${percent(s.ecosystem)} de su referencia.`
        : focus === 'waterQuality' ? qualityFact
          : `La salud del río pasó de ${p!.basinHealth} a ${b.basinHealth}/100.`;
    headline = `${NAMES[focus]} recuperó ${focus === 'reservoir' ? 'reserva' : focus === 'waterQuality' || focus === 'basinHealth' ? 'terreno' : 'cobertura'}`;
    headline = `${NAMES[focus]} mejora: ${pick(NEWSPAPER_HEADLINES.recovery)}`;
    subhead = comparison + (focus === 'population' && productive.every(id => b.allocations[id] === 0)
      ? ' Producción sigue sin asignación.' : '');
    photoEmoji = '🌱';
  } else if (verdict.kind === 'tradeoff') {
    const beneficiary = s.population >= 0.85 ? 'population' : 'agriculture';
    covered.add(beneficiary);
    covered.add('reservoir');
    headline = pick(RESERVE_HEADLINES.draw);
    subhead = `${NAMES[beneficiary]} cubrió ${percent(s[beneficiary])} de su demanda. El reparto usó reservas y el embalse bajó.`;
    photoEmoji = '🏦';
  } else if (verdict.kind === 'good') {
    covered.add('population');
    covered.add('ecosystem');
    headline = pick(NEWSPAPER_HEADLINES.good);
    subhead = `${result.goalAchieved ? '¡Meta cumplida! ' : ''}Buen abastecimiento y calidad. El reparto funcionó; la ceremonia de Pipo es discutible.`;
    photoEmoji = '🎉';
  } else if (verdict.kind === 'opportunity') {
    const record = result.events.find(item => item.event.type === 'OPPORTUNITY_INTERACTIVE' && item.chosenOptionId)!;
    covered.add('event');
    headline = pick(NEWSPAPER_HEADLINES.opportunity);
    subhead = eventFact(record);
    photoEmoji = '✉️';
  } else {
    if (s[lowest] < 0.8) {
      covered.add(lowest);
      headline = `Ciudad y río siguen; ${NAMES[lowest]} queda corto`;
      headline = pick(NEWSPAPER_HEADLINES.normal);
      subhead = deficitFact(lowest);
    } else {
      covered.add('reservoir');
      headline = pick(NEWSPAPER_HEADLINES.normal);
      subhead = reserveFact;
    }
    photoEmoji = '💧';
  }

  if (verdict.pendingSector && verdict.kind !== 'normal' && !covered.has(verdict.pendingSector)) {
    const id = verdict.pendingSector;
    subhead += ` ${deficitFact(id)}`;
    covered.add(id);
  }

  const secondaryArticles: NewspaperEdition['secondaryArticles'] = [];
  const add = (topic: string, headline: string, fact: string) => {
    if (!covered.has(topic) && secondaryArticles.length < 2) {
      secondaryArticles.push({ headline, subhead: fact });
      covered.add(topic);
    }
  };
  // Alertas complementarias antes que curiosidades, sin duplicar la portada.
  if (s.population < 0.8) add('population', 'Sofía: «La canilla no lee comunicados»', facts.population);
  if (s.ecosystem < 0.75) add('ecosystem', 'Clara: «Pipo pide río, no un dibujo azul»', facts.ecosystem);
  if (b.waterQuality < 60 || (previous && b.waterQuality < previous.balance.waterQuality))
    add('waterQuality', voice('waterQuality'), qualityFact);
  if (b.basinHealth < 60) add('basinHealth', voice('basinHealth'), facts.basinHealth);
  // Una decisión registrada merece una breve; nunca desplaza alertas de ciudad/río/calidad.
  if (chosen) add('event', chosen.event.name, eventFact(chosen));
  if (delta < 0) add('reservoir', voice('reservoir'), reserveFact);
  // Menor cobertura primero: no privilegiar siempre Cultivos por orden de código.
  for (const topic of [...productive].sort((a, c) => s[a] - s[c])) {
    if (s[topic] < 0.8) add(topic, b.allocations[topic] === 0 ? `${NAMES[topic]} quedó fuera del reparto` : voice(topic), deficitFact(topic));
  }
  const briefs: [string, string, string][] = [
    ['waterQuality', voice('waterQuality'), `${qualityFact} Más caudal no garantiza mejor calidad.`],
    ['reservoir', voice('reservoir'), reserveFact],
    ['ecosystem', voice('ecosystem'), `Caudal ecológico: ${percent(s.ecosystem)}. Cuenta también el agua que sigue y retorna.`],
    ['returns', 'Clara: «El agua no ficha salida: sigue viaje»', `Ciudad y actividades devolvieron ${usesReturned} 💧 al río. Aguas abajo pasaron ${b.downstreamFlow} 💧 en total; esos retornos ya están incluidos.`],
    ['population', voice('population'), facts.population],
    ['agriculture', voice('agriculture'), `Cobertura de Cultivos: ${percent(s.agriculture)}.`],
    ['livestock', voice('livestock'), `Cobertura de Granja: ${percent(s.livestock)}.`],
    ['mining', voice('mining'), `Cobertura de Mina: ${percent(s.mining)}.`]
  ];
  if (b.snowMelt > 0) briefs.push(['snow', 'Pipo: «La montaña manda agua sin estampilla»', 'Hubo deshielo: agua de la reserva de nieve llegó al río.']);
  if (b.seasonRainfall > 0) briefs.push(['rain', 'Jacinto: «Llueve. Suspendan el baile del zapallo»', b.soilInfiltration > 0 ? 'Una parte de la lluvia se infiltró en el suelo.' : 'Llovió; este balance no registró infiltración al suelo.']);
  const event = result.events[0];
  if (event) briefs.push(['event', event.event.name, event.chosenOptionId ? eventFact(event) : 'Suceso registrado esta estación. El balance incluye sus efectos; no permite aislarlos del clima y del reparto.']);
  briefs.push(['aquifer', 'Berta: «La reserva de abajo no es un sótano de mates»', b.aquiferWithdrawal > 0 ? 'Hubo bombeo del acuífero para abastecer el reparto.' : 'Esta estación no se bombeó agua del acuífero.']);
  const start = variant % briefs.length;
  for (const brief of [...briefs.slice(start), ...briefs.slice(0, start)]) add(...brief);

  return {
    editionNumber: result.turn,
    dateString: `Año ${result.year} • ${SEASONS_INFO[result.season].name} (Turno ${result.turn}/20)`,
    price: 'Edición Escolar Gratuita',
    kind: verdict.kind,
    label: verdict.label,
    mainArticle: { headline, subhead, photoEmoji },
    secondaryArticles
  };
}
