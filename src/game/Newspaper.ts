import type { SeasonResult } from '../models/Balance';
import { SEASONS_INFO } from '../models/Season';
import { getSeasonVerdict, type SeasonVerdict, type SeasonVerdictKind } from '../seasonVerdict';
import { SeededRandom } from '../simulation/RandomSystem';
import { NEWSPAPER_HEADLINES } from './NewspaperHeadlines';
import { EDITORIAL_SECTORS, pickEditorial, sectorArticle, eventArticle, createEditorialLedger, type EditorialLedger, type EditorialSector } from './EditorialSelection';

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
  population: ['Sofía: «El vecino entiende mejor una canilla que un comunicado».', 'Sofía: «El trámite urgente tiene la misma fila, con otro cartel».', 'Sofía: «La oficina promete escuchar; atender es otro expediente».', 'Sofía: «Antes de anunciar, conviene probar la canilla».'],
  agriculture: ['Jacinto: «El calendario de siembra no espera al consejo».', 'Jacinto: «Si las actas regaran, tendría arroz en el techo».', 'Jacinto: «La cosecha no entiende de prórrogas administrativas».', 'Jacinto: «La asamblea terminó. Ahora empieza mi jornada».'],
  livestock: ['Berta: «Los animales comen todos los días, incluso los feriados».', 'Berta: «Me piden paciencia. El ganado pide otra cosa».', 'Berta: «Traje las cuentas; el asesor trajo saludos».', 'Berta: «El bebedero queda lejos de la conferencia de prensa».'],
  mining: ['Ferrada: «La producción necesita agua; el informe necesita honestidad».', 'Ferrada: «Pido un plan, no una foto con casco».', 'Ferrada: «El Excel aguanta cualquier promesa. La máquina, menos».', 'Ferrada: «El turno empieza antes que la reunión del consejo».'],
  ecosystem: ['Clara: «El río también tiene necesidades, aunque no mande facturas».', 'Clara: «El humedal no puede pedir turno por internet».', 'Clara: «Cuidar el río queda mejor en el reparto que en el afiche».', 'Clara: «La foto panorámica no reemplaza mirar aguas abajo».'],
  reservoir: ['Sofía: «La reserva no se renueva aprobando el presupuesto».', 'Jacinto: «El embalse no acepta promesas para la próxima cosecha».', 'Berta: «Guardar para después también es una decisión».', 'Ferrada: «La capacidad no es lo mismo que el contenido».'],
  waterQuality: ['Clara: «Un adjetivo en el folleto no cuenta como tratamiento».', 'Ferrada: «Un informe prolijo puede describir agua que no lo es».', 'Sofía: «La campaña puede esperar. El análisis, menos».', 'Clara: «Diluir no elimina lo que volvió al río».'],
  basinHealth: ['Clara: «El paisaje no lee nuestro plan de recuperación».', 'Sofía: «La cuenca no tiene botón para aprobar el acta».', 'Jacinto: «Lo que pasa aguas arriba también termina por acá».', 'Clara: «Caudal y calidad: el consejo prefiere leer uno por vez».']
} as const;

const NAMES = { population: 'Ciudad', agriculture: 'Cultivos', livestock: 'Granja', mining: 'Mina', ecosystem: 'Río Vivo', reservoir: 'Embalse', waterQuality: 'Calidad del agua', basinHealth: 'Salud del río' } as const;

const EXTRA_VOICES = {
  population: ['Sofía: «Cada barrio explica por qué debería ir primero».', 'Sofía: «Al comunicado le falta el domicilio del reclamo».', 'Sofía: «El vecino pidió agua. Le ofrecieron una encuesta».', 'Sofía: «Hay consenso sobre quién debe arreglarlo: otro».'],
  agriculture: ['Jacinto: «El pronóstico viene con letra chica; la siembra no».', 'Jacinto: «En la reunión todos conocen el campo desde la ruta».', 'Jacinto: «Pido previsión. No hace falta que venga en tapa dura».', 'Jacinto: «El asesor propone esperar; nunca sembró con fecha».'],
  livestock: ['Berta: «El protocolo supone que la granja abre a las nueve».', 'Berta: «La sombra sirve más que una visita con fotógrafo».', 'Berta: «La vaca no leyó el plan y aun así detectó el problema».', 'Berta: «Acepto consejos. Preferentemente después de escuchar».'],
  mining: ['Ferrada: «El casco de la visita todavía conserva la etiqueta».', 'Ferrada: «La eficiencia se mide; el entusiasmo se declara».', 'Ferrada: «La máquina no distingue una excusa bien redactada».', 'Ferrada: «El ahorro prometido necesita pasar por la planta».'],
  ecosystem: ['Clara: «El río nunca llegó tarde a una reunión: no lo invitan».', 'Clara: «El sendero tiene cartel. El caudal necesita algo más».', 'Clara: «La naturaleza no archiva el reclamo al cerrar la oficina».', 'Clara: «No todo lo que importa tiene una ventanilla».'],
  reservoir: ['Berta: «La reserva es para usar con criterio, no para coleccionar».', 'Sofía: «El próximo verano todavía no presentó sus demandas».', 'Jacinto: «Una reserva llena no garantiza una cosecha regada».', 'Ferrada: «La obra grande también puede quedar vacía».'],
  waterQuality: ['Clara: «La muestra no mejora porque el informe llegue en color».', 'Sofía: «Primero el tratamiento; después el acto de presentación».', 'Ferrada: «La calidad no negocia con el departamento de prensa».', 'Clara: «El retorno lleva agua y también lo que le dejamos».'],
  basinHealth: ['Clara: «El informe anual no marca el calendario del río».', 'Berta: «La cuenca comparte problemas, aunque cambie el dueño».', 'Jacinto: «Las consecuencias no respetan límites de parcela».', 'Sofía: «El balance del valle necesita más que el balance de caja».']
} as const;

// Una escena editorial y la decisión que sí está registrada. No atribuye
// efectos nominales, producción ni suministro al evento: eso vive en el balance.
export function getEventRecap(record: SeasonResult['events'][number], turn: number): { headline: string; decision: string } | null {
  if (!record.chosenOptionId) return null;
  const option = record.event.options?.find(item => item.id === record.chosenOptionId);
  if (!option) return null;
  const scenes: Record<string, readonly string[]> = {
    berta_calor: ['Berta: «El ganado no pidió permiso para tener calor»', 'Berta: «El protocolo supone que el verano atiende reclamos»', 'Berta: «La sombra trabaja sin esperar el acta»', 'Berta: «El bebedero no tiene oficina de prensa»'],
    ferrada_molienda: ['Ferrada: «La máquina no se enfría con una nota interna»', 'Ferrada: «El turno de producción no espera al asesor»', 'Ferrada: «La eficiencia necesita algo más que un anuncio»', 'Ferrada: «El casco de la visita sigue impecable»'],
    sofia_aniversario: ['Sofía: «El aniversario llega antes que el consenso»', 'Sofía: «El discurso no debería durar más que la fiesta»', 'Sofía: «La foto oficial no incluye la cuenta del lunes»', 'Sofía: «Hay más ideas para el festejo que responsables»'],
    jacinto_festival: ['Jacinto: «El calendario de siembra no negocia feriados»', 'Jacinto: «La cosecha no acepta una promesa por escrito»', 'Jacinto: «La fiesta empieza cuando termina el trabajo»', 'Jacinto: «El campo tiene menos micrófonos que la inauguración»'],
    clara_carpincho: ['Clara: «El humedal figura en el folleto, no siempre en la agenda»', 'Clara: «El carpincho llegó sin pedir turno»', 'Clara: «La reserva natural no es una reserva de discursos»', 'Clara: «La visita al río empieza cuando termina la foto»'],
    fugas_red_ciudad: ['Sofía: «La fuga sigue abierta; el expediente también»', 'Sofía: «El agua encontró la salida antes que el trámite»', 'Sofía: «La cuadrilla necesita un plano, no otra reunión»', 'Sofía: «La cañería no distingue hábiles de feriados»'],
    flamencos_turismo: ['Clara: «Los flamencos llegaron antes que el folleto turístico»', 'Clara: «La naturaleza no pidió un acto de apertura»', 'Clara: «El paisaje también necesita mantenimiento sin público»', 'Clara: «El humedal no vive de la temporada de fotos»'],
    falla_saneamiento: ['Clara: «El filtro no responde al comunicado de calma»', 'Clara: «El tratamiento no funciona por resolución municipal»', 'Clara: «La reparación necesita menos adjetivos»', 'Clara: «La muestra no espera a que termine la reunión»'],
    sequia_severa: ['Jacinto: «El pronóstico no acepta un pedido de prórroga»', 'Berta: «Las restricciones también necesitan un plan»', 'Sofía: «La emergencia no respeta el horario de atención»', 'Ferrada: «La reserva no alcanza por declaración»'],
    lluvia_extraordinaria: ['Sofía: «La lluvia llegó sin consultar el cronograma»', 'Clara: «La crecida no pidió autorización al consejo»', 'Jacinto: «El pronóstico trajo más de lo que decía el título»', 'Berta: «El temporal no tiene formulario de reclamo»']
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
  const approvedEvents: Record<string, string> = { berta_calor: '01', ferrada_molienda: '02', sofia_aniversario: '03', jacinto_festival: '04',
    clara_carpincho: '05', fugas_red_ciudad: '06', flamencos_turismo: '07', falla_saneamiento: '08', sequia_severa: '09', lluvia_extraordinaria: '10' };
  const approvedRecap = eventArticle(record.chosenOptionId, turn, 'recap');
  return { headline: approvedRecap?.headline ?? record.event.name,
    decision: choices[record.chosenOptionId] ?? `Elegiste «${option.label}».` };
}

const RESERVE_HEADLINES = {
  draw: [
    'El embalse puso el agua; el consejo, la firma',
    'Se usó la reserva: el verano todavía no pasó por caja',
    'El reparto recurrió al embalse; el mañana pide atención',
    'La reserva bajó y el discurso mantuvo su nivel',
    'Carta de lectores: «¿Y lo que queda para después?»',
    'Sofía pide incluir la próxima estación en la conversación',
    'El valle atendió el presente con parte de sus ahorros',
    'El embalse ayudó; no adjuntó promesa de reposición',
    'La reserva financió el reparto, sin cuotas automáticas',
    'Pipo propone celebrar antes de leer el saldo',
    'Jacinto agradece el agua y pregunta por la próxima siembra',
    'El acta destaca lo entregado; Berta señala lo que queda',
    'El comité descubre que la reserva tiene fondo',
    'El abastecimiento pasó por el embalse; la cuenta sigue abierta',
    'Ferrada pide un plan para el después de la urgencia',
    'Los ahorros del valle entraron en servicio',
    'El presupuesto no registra la deuda con la próxima estación',
    'Clara recuerda que el agua guardada también tiene destino',
    'Entrevista a la reserva: hoy prefirió mostrar el nivel',
    'Se recurrió al embalse; el consejo archiva «agua ilimitada»'
  ]
} as const;

// Contar la familia de portada, no el sector: cambiar de foco no vuelve
// a sortear los mismos títulos desde cero. Calidad tiene prioridad editorial.
function headlineTopic(result: SeasonResult, previous: SeasonResult | undefined, verdict: SeasonVerdict): string {
  return verdict.kind !== 'crisis' && verdict.kind !== 'error'
    && (['normal', 'good', 'opportunity'].includes(verdict.kind)
      || (previous && previous.balance.waterQuality - result.balance.waterQuality >= 8))
    && previous && result.balance.waterQuality < previous.balance.waterQuality
    ? 'qualityDrop' : verdict.kind;
}

// Sólo narra resultados resueltos. El sorteo editorial no consume PRNG de gameplay.
export function generateNewspaperEdition(
  result: SeasonResult,
  previous?: SeasonResult,
  verdict: SeasonVerdict = getSeasonVerdict(result, previous),
  history: readonly SeasonResult[] = [],
  editorialSeed = 'HERALDO'
): NewspaperEdition {
  const ledger = createEditorialLedger();
  const earlier = history.filter(row => row.turn < result.turn).sort((a, b) => a.turn - b.turn);
  for (const row of earlier) {
    const prior = history.find(item => item.turn === row.turn - 1);
    renderNewspaperEdition(row, prior, getSeasonVerdict(row, prior), history.filter(item => item.turn <= row.turn), editorialSeed, ledger);
  }
  return renderNewspaperEdition(result, previous, verdict, history, editorialSeed, ledger);
}
function renderNewspaperEdition(
  result: SeasonResult, previous: SeasonResult | undefined, verdict: SeasonVerdict,
  history: readonly SeasonResult[], editorialSeed: string, ledger: EditorialLedger
): NewspaperEdition {
  const b = result.balance;
  const s = b.satisfactions;
  const variant = ((result.turn - 1) % 20 + 20) % 20;
  // Cada situación tiene una bolsa barajada. Se agota antes de repetir;
  // reconstruirla desde semilla/historial conserva la edición al reabrir o recuperar.
  const topic = headlineTopic(result, previous, verdict);
  const occurrence = history.length ? history.filter(row => {
    const prior = history.find(item => item.turn === row.turn - 1);
    return row.turn < result.turn && headlineTopic(row, prior, getSeasonVerdict(row, prior)) === topic;
  }).length : variant;
  const pick = (lines: readonly string[], editorialTopic = topic, voiceEdition = false, positionOffset = 0) => {
    const bag = [...lines];
    const indexInBag = voiceEdition ? variant : occurrence;
    const editorialRandom = new SeededRandom(`${editorialSeed}:heraldo:${editorialTopic}:${Math.floor(indexInBag / bag.length)}`);
    for (let index = bag.length - 1; index > 0; index--) {
      const swap = editorialRandom.rangeInt(0, index);
      [bag[index], bag[swap]] = [bag[swap], bag[index]];
    }
    return bag[(indexInBag + positionOffset) % bag.length];
  };
  const voice = (topic: keyof typeof VOICES) => pick([...VOICES[topic], ...EXTRA_VOICES[topic]], `voice:${topic}`, true);
  const productive = ['agriculture', 'livestock', 'mining'] as const;
  const coverageFact = (id: 'population' | typeof productive[number] | 'ecosystem') => {
    const name = NAMES[id], rate = s[id];
    // Bandas editoriales: describen cobertura, no producción ni daños simulados.
    // La referencia completa sigue siendo 1; no redondear un faltante a éxito.
    const lines = rate >= 1 ? [
      `${name} tuvo agua para toda su necesidad.`,
      `En ${name}, el abastecimiento quedó cubierto.`,
      `${name} cerró sin faltantes de agua.`,
      `El agua alcanzó para lo que necesitaba ${name}.`,
      `${name} recibió agua suficiente esta estación.`,
      `Esta vez, ${name} cubrió su necesidad de agua.`,
      `Para ${name}, el reparto alcanzó.`,
      `${name} pudo cubrir todo su requerimiento de agua.`,
      `La necesidad de agua de ${name} quedó atendida.`,
      `${name} llegó al cierre con agua suficiente.`,
      `El abastecimiento de ${name} no dejó faltantes.`,
      `No quedó necesidad de agua pendiente en ${name}.`,
      `${name} contó con toda el agua necesaria.`,
      `El reparto cubrió las necesidades de agua de ${name}.`,
      `${name} terminó con su abastecimiento resuelto.`
    ] : rate >= .8 ? [
      `${name} quedó cerca de cubrir su necesidad de agua.`,
      `En ${name}, faltó poco para completar el abastecimiento.`,
      `${name} cerró con un faltante menor.`,
      `El agua casi alcanzó para lo que necesitaba ${name}.`,
      `${name} recibió casi toda el agua necesaria.`,
      `Esta vez, ${name} atendió la mayor parte de su necesidad.`,
      `Para ${name}, quedó una porción menor por cubrir.`,
      `${name} estuvo cerca de cubrir todo su requerimiento.`,
      `La necesidad de agua de ${name} quedó casi atendida.`,
      `${name} llegó al cierre con poco abastecimiento pendiente.`,
      `El abastecimiento de ${name} dejó un faltante pequeño.`,
      `Quedó una necesidad menor de agua pendiente en ${name}.`,
      `${name} contó con agua para casi todas sus necesidades.`,
      `El reparto dejó a ${name} cerca de lo necesario.`,
      `${name} terminó a poco de resolver su abastecimiento.`
    ] : rate >= .5 ? [
      `${name} tuvo agua, pero quedó una parte importante por cubrir.`,
      `En ${name}, el abastecimiento dejó un faltante importante.`,
      `${name} cerró con necesidades de agua todavía pendientes.`,
      `El agua atendió sólo parte de lo que necesitaba ${name}.`,
      `${name} recibió agua sin alcanzar lo necesario.`,
      `Esta vez, ${name} cubrió sólo parte de su necesidad.`,
      `Para ${name}, queda bastante abastecimiento por resolver.`,
      `${name} cubrió parte del requerimiento; el resto sigue pendiente.`,
      `La necesidad de agua de ${name} quedó atendida parcialmente.`,
      `${name} llegó al cierre con un faltante que merece atención.`,
      `El abastecimiento de ${name} quedó por debajo de lo necesario.`,
      `Quedó una necesidad importante de agua pendiente en ${name}.`,
      `${name} contó con agua para una parte de sus necesidades.`,
      `El reparto dejó necesidades importantes pendientes en ${name}.`,
      `${name} terminó con su abastecimiento aún incompleto.`
    ] : rate > 0 ? [
      `${name} recibió poca agua frente a lo necesario.`,
      `En ${name}, el abastecimiento dejó un faltante grave.`,
      `${name} cerró con gran parte de su necesidad sin cubrir.`,
      `El agua estuvo lejos de alcanzar para ${name}.`,
      `${name} recibió agua muy por debajo de lo necesario.`,
      `Esta vez, ${name} cubrió sólo una pequeña parte de su necesidad.`,
      `Para ${name}, falta resolver la mayor parte del abastecimiento.`,
      `${name} quedó lejos de cubrir su requerimiento de agua.`,
      `La necesidad de agua de ${name} sigue mayormente pendiente.`,
      `${name} llegó al cierre con un faltante serio.`,
      `El abastecimiento de ${name} necesita atención urgente.`,
      `Quedó una gran necesidad de agua pendiente en ${name}.`,
      `${name} contó con poca agua para sus necesidades.`,
      `El reparto dejó a ${name} con una brecha de agua grave.`,
      `${name} terminó con un abastecimiento muy insuficiente.`
    ] : [
      `${name} no recibió agua para cubrir su necesidad.`,
      `En ${name}, la necesidad de agua quedó sin atender.`,
      `${name} cerró sin abastecimiento.`,
      `No hubo agua recibida para ${name}.`,
      `${name} quedó sin el agua que necesitaba.`,
      `Esta vez, ${name} no cubrió ninguna parte de su necesidad.`,
      `Para ${name}, todo el abastecimiento sigue pendiente.`,
      `${name} terminó sin agua recibida.`,
      `La necesidad de agua de ${name} quedó pendiente por completo.`,
      `${name} llegó al cierre sin abastecimiento de agua.`,
      `El abastecimiento de ${name} quedó sin atender.`,
      `Toda la necesidad de agua sigue pendiente en ${name}.`,
      `${name} no contó con agua para sus necesidades.`,
      `El reparto no abasteció a ${name}.`,
      `${name} terminó con toda su necesidad sin cubrir.`
    ];
    const offsets = { population: 0, agriculture: 4, livestock: 8, mining: 12, ecosystem: 2 };
    const sentence = pick(lines, 'coverage-phrasing', true, offsets[id]);
    return id === 'ecosystem' ? sentence.replace(/abastecimiento/g, 'caudal ecológico') : sentence;
  };
  const lowest = [...productive].sort((a, c) => s[a] - s[c])[0];
  const usesReturned = b.returns.population + b.returns.agriculture + b.returns.livestock + b.returns.mining;
  const requestFact = (id: 'population' | typeof productive[number]) =>
    b.allocations[id] === 0 ? `${NAMES[id]} no tuvo agua asignada.`
      : b.suppliedAllocations[id] < b.allocations[id] ? 'No llegó todo lo asignado.'
      : '';
  const deficitFact = (id: typeof productive[number]) =>
    b.allocations[id] === 0 ? `${NAMES[id]} no tuvo agua asignada.`
      : b.suppliedAllocations[id] < b.allocations[id] ? `${coverageFact(id)} ${requestFact(id)}`
      : coverageFact(id);
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
    population: b.allocations.population === 0 ? requestFact('population') : `${coverageFact('population')} ${requestFact('population')}`.trim(),
    ecosystem: coverageFact('ecosystem'),
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
  if (topic === 'qualityDrop') {
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
      : focus === 'agriculture' || focus === 'livestock' || focus === 'mining' || focus === 'population' || focus === 'ecosystem'
        ? `${NAMES[focus]} recibió más agua respecto de su necesidad que la estación anterior. ${coverageFact(focus)}`
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
    subhead = `${coverageFact(beneficiary)} El reparto usó reservas y el embalse bajó.`;
    photoEmoji = '🏦';
  } else if (verdict.kind === 'good') {
    covered.add('population');
    covered.add('ecosystem');
    headline = pick(NEWSPAPER_HEADLINES.good);
    subhead = `${result.goalAchieved ? '¡Meta cumplida! ' : ''}Buen abastecimiento y calidad: una estación lograda por el reparto.`;
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

  // Una sola explicación de pedido insuficiente en portada. Las breves cuentan
  // otros sectores sin repetir la misma lección. No confundirlo con falta de entrega.
  const shortRequest = (['population', ...productive] as const).find(id => covered.has(id)
    && b.allocations[id] > 0 && b.suppliedAllocations[id] >= b.allocations[id] && s[id] < 1);
  if (shortRequest) subhead += ` ${pick([
    'Se entregó todo lo asignado; el pedido era menor que lo necesario.',
    'El envío llegó completo, pero se había pedido menos de lo necesario.',
    'La entrega cumplió el pedido; para cubrir la necesidad había que pedir más.',
    'El faltante venía del reparto: lo asignado no alcanzaba para la necesidad.',
    'Se recibió todo el pedido. La necesidad del sector era mayor.',
    'El pedido llegó entero; quedaba una parte de la necesidad sin asignar.',
    'La dotación se entregó completa; faltó asignar agua para el resto.',
    'Se cumplió la entrega acordada, que era menor que el requerimiento.',
    'El envío no quedó a medias: el pedido inicial se había quedado corto.',
    'Todo lo autorizado llegó. La necesidad superaba esa autorización.',
    'El reparto fijó un pedido por debajo de lo que el sector necesitaba.',
    'Se entregó el pedido sin recortes; la necesidad era mayor.',
    'La entrega alcanzó lo acordado, aunque lo acordado no alcanzaba.',
    'El pedido se completó. Para atender el resto hacía falta asignar más.',
    'No faltó parte del envío: faltó incluir más agua en el pedido.'
  ], 'short-request-explanation', true)}`;

  const approved = (ids: string[], context: string) => pickEditorial(ids, result.turn, editorialSeed, context, ledger);
  const general = (numbers: number[], context: string) => approved(numbers.map(n => `P-GEN-${String(n).padStart(2, '0')}`), context);
  const approvedSector = (id: EditorialSector) => sectorArticle(id, s[id], previous?.balance.satisfactions[id], result.turn, editorialSeed,
    !!previous && b.suppliedAllocations[id] > previous.balance.suppliedAllocations[id], ledger);
  const approvedTopic = (id: string) => {
    if (EDITORIAL_SECTORS.includes(id as EditorialSector)) return approvedSector(id as EditorialSector);
    if (id === 'waterQuality') return general(b.waterQuality < 60 ? [8, 32, 42]
      : !previous ? [12, 30, 40] : b.waterQuality < previous.balance.waterQuality ? [9, 33, 43]
      : b.waterQuality > previous.balance.waterQuality ? [10, 34, 44] : [11, 31, 41], id);
    if (id === 'basinHealth') return general(b.basinHealth < 60 ? [13, 37, 47]
      : !previous ? [16, 35, 45] : b.basinHealth < previous.balance.basinHealth ? [29, 38, 48]
      : b.basinHealth > previous.balance.basinHealth ? [14, 39, 49] : [15, 36, 46], id);
    if (id === 'reservoir') return general(delta > 0 ? [17, 55] : delta < 0 ? [18, 53] : [19, 54], id);
    if (id === 'snow' && b.snowMelt > 0) return general([20], id);
    if (id === 'rain' && b.seasonRainfall > 0) return general([b.soilInfiltration > 0 ? 21 : 22], id);
    if (id === 'aquifer') return b.aquiferWithdrawal > 0 ? general([23], id)
      : result.events.some(record => (record.waterAdjustment?.aquiferChange ?? 0) < 0) ? undefined : general([24], id);
    if (id === 'returns' && usesReturned > 0) return general([25], id);
    if (id === 'event') return eventArticle(chosen?.chosenOptionId, result.turn, editorialSeed, ledger)
      ?? (result.events.length ? general([28], id) : undefined);
    return undefined;
  };
  let mainPair = topic === 'qualityDrop' ? approvedTopic('waterQuality')
    : verdict.kind === 'crisis' && verdict.focus === 'population' ? approvedSector('population')
    : verdict.kind === 'crisis' || verdict.kind === 'error' || verdict.kind === 'recovery'
      ? approvedTopic(verdict.focus ?? '')
    : verdict.kind === 'tradeoff' ? general(s[s.population >= .85 ? 'population' : 'agriculture'] >= 1 ? [5, 51] : [6, 52], 'reserve-draw')
    : verdict.kind === 'good' ? general([1, 2], 'good')
    : verdict.kind === 'opportunity' ? approvedTopic('event')
    : s[lowest] < .8 ? approvedSector(lowest) : general([3, 4, 50], 'normal');
  if (mainPair?.headline && mainPair.subhead) {
    headline = mainPair.headline;
    subhead = mainPair.subhead;
    // La pieza reemplaza la bajada entera; el sector pendiente necesita una breve propia.
    if (verdict.pendingSector && verdict.pendingSector !== verdict.focus && verdict.kind !== 'normal') covered.delete(verdict.pendingSector);
  } else {
    // Sin pieza aprobada para ese contexto, conservar sólo la explicación factual.
    headline = verdict.label;
  }

  const secondaryArticles: NewspaperEdition['secondaryArticles'] = [];
  const add = (topic: string, headline: string, fact: string) => {
    if (!covered.has(topic) && secondaryArticles.length < 2) {
      const pair = approvedTopic(topic);
      if (pair?.headline && pair.subhead) secondaryArticles.push({ headline: pair.headline, subhead: pair.subhead });
      // Sin pieza compatible, omitir la breve: los datos siguen en el resumen.
      else return;
      covered.add(topic);
    }
  };
  // Alertas complementarias antes que curiosidades, sin duplicar la portada.
  if (s.population < 0.8) add('population', voice('population'), facts.population);
  if (s.ecosystem < 0.75) add('ecosystem', voice('ecosystem'), facts.ecosystem);
  if (b.waterQuality < 60 || (previous && b.waterQuality < previous.balance.waterQuality))
    add('waterQuality', voice('waterQuality'), qualityFact);
  if (b.basinHealth < 60) add('basinHealth', voice('basinHealth'), facts.basinHealth);
  if (verdict.pendingSector) add(verdict.pendingSector, NAMES[verdict.pendingSector], deficitFact(verdict.pendingSector));
  if (shortRequest && !mainPair && secondaryArticles.length < 2) {
    const pair = general([26], 'short-request')!;
    secondaryArticles.push({ headline: pair.headline, subhead: pair.subhead });
  }
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
    ['ecosystem', voice('ecosystem'), `${facts.ecosystem} Cuenta el agua que sigue y retorna.`],
    ['returns', 'Clara: «El reparto no termina donde termina el canal»', `Ciudad y actividades devolvieron ${usesReturned} 💧 al río. Aguas abajo pasaron ${b.downstreamFlow} 💧 en total; esos retornos ya están incluidos.`],
    ['population', voice('population'), facts.population],
    ['agriculture', voice('agriculture'), coverageFact('agriculture')],
    ['livestock', voice('livestock'), coverageFact('livestock')],
    ['mining', voice('mining'), coverageFact('mining')]
  ];
  if (b.snowMelt > 0) briefs.push(['snow', 'La montaña aporta deshielo; el consejo aún discute el calendario', 'Hubo deshielo: agua de la reserva de nieve llegó al río.']);
  if (b.seasonRainfall > 0) briefs.push(['rain', 'La lluvia llega sin completar el formulario de ingreso', b.soilInfiltration > 0 ? 'Una parte de la lluvia se infiltró en el suelo.' : 'Llovió; este balance no registró infiltración al suelo.']);
  const event = result.events[0];
  if (event) briefs.push(['event', event.event.name, event.chosenOptionId ? eventFact(event) : 'Suceso registrado esta estación. El balance incluye sus efectos; no permite aislarlos del clima y del reparto.']);
  briefs.push(['aquifer', 'Agua subterránea', b.aquiferWithdrawal > 0 ? 'Hubo bombeo del acuífero para abastecer el reparto.'
    : result.events.some(record => (record.waterAdjustment?.aquiferChange ?? 0) < 0) ? 'Hubo una extracción extraordinaria del acuífero antes del reparto.'
      : 'Esta estación no se bombeó agua del acuífero.']);
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
