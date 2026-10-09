import { SeededRandom } from '../simulation/RandomSystem';
import type { SectorId } from '../models/Sector';

// Escenas de sátira, no producción, daños ni eventos nuevos de la simulación.
const LOCAL = {
  population: {
    speaker: 'Sofía',
    good: ['Los vecinos bailan; el municipio busca quién autorizó la música.', 'La canilla funcionó. Se propone inaugurarla otra vez.', 'La conga barrial todavía no tiene expediente.', 'Hoy el reclamo es por el volumen del festejo.', 'El comité de festejos pide una prórroga para seguir bailando.'],
    low: ['Los vecinos trajeron una canilla al consejo para explicar el problema.', 'El reclamo llegó con coreografía; el agua, con menos entusiasmo.', 'La fila para reclamar ya tiene comisión directiva.', 'Se suspendió el discurso: alguien abrió una canilla para demostrar su punto.', 'El barrio pide agua. La oficina ofrece una copia del pedido.']
  },
  agriculture: {
    speaker: 'Jacinto',
    good: ['El campo tiene agua; los asesores se disputan la foto.', 'Se baila entre surcos. El tractor quedó de DJ.', 'Los cajones hacen de escenario; el discurso quedó afuera.', 'El regador recibió aplausos y pidió que no le tapen el paso.', 'Los espantapájaros figuran como invitados especiales.'],
    low: ['Los espantapájaros se sumaron al reclamo: ya estaban de pie.', 'La pancarta tiene más renglones que agua el reparto.', 'El tractor llegó al consejo. No vino de paseo.', 'La reunión de riego terminó regando las excusas.', 'El campo pide agua; el asesor sugiere cambiar el título del informe.']
  },
  livestock: {
    speaker: 'Berta',
    good: ['Se festeja en el corral. La vaca sigue sin firmar el permiso.', 'El bebedero tiene público; el discurso municipal, menos.', 'La conga del corral no distingue feriados.', 'El ganado preside el festejo sin presentarse a elecciones.', 'La vaca ocupó el lugar del asesor en la foto. Nadie reclamó.'],
    low: ['Una vaca encabeza la protesta. Tiene mejor asistencia que el consejo.', 'El corral mandó una delegación. Se expresa en muuuuúltiples puntos.', 'El reclamo incluye una vaca como evidencia.', 'El bebedero vacío solicita una audiencia; no sabe usar el formulario.', 'La asamblea del corral rechaza la propuesta de tener paciencia.']
  },
  mining: {
    speaker: 'Ferrada',
    good: ['Los cascos marcan el ritmo. Seguridad pregunta por el ensayo.', 'Se festeja junto a la planta; el Excel intenta llevar el compás.', 'El operario baila. El visitante pregunta si cuenta como innovación.', 'La planta tiene agua y el comunicado tiene demasiados autores.', 'El casco del fotógrafo sigue siendo el más limpio del festejo.'],
    low: ['El casco de la visita se convirtió en urna de reclamos.', 'Los operarios trajeron una manguera al consejo: faltaba la parte del agua.', 'La protesta exige menos diapositivas y más reparto.', 'El turno se reúne alrededor del informe. El informe no enfría nada.', 'El Excel declara todo resuelto. La delegación pide una segunda opinión.']
  },
  ecosystem: {
    speaker: 'Clara',
    good: ['Las aves tienen caudal. El consejo intenta adjudicarse el vuelo.', 'El río sigue; los invitados siguen buscando dónde cortar la cinta.', 'El humedal no solicitó permiso para estar vivo.', 'Las aves esquivan la foto oficial con notable coordinación.', 'El festejo del río no incluye escenario ni factura.'],
    low: ['El humedal mandó una silla vacía a la reunión.', 'El río pide atención. El comité pregunta si tiene representante legal.', 'La pancarta dice «también estamos aguas abajo».', 'Las aves no aplauden el comunicado. No consta que lo hayan leído.', 'El consejo propone escuchar al río desde una sala sin ventanas.']
  }
} as const;
const GENERAL = {
  good: [
    'El festejo empezó antes de que terminaran de aprobarlo.',
    'El consejo pide un aplauso; la delegación ya está bailando.',
    'La foto oficial salió movida. Era una conga.',
    'El acta registra alegría. No pudo registrar el paso de baile.',
    'Se discutió quién tuvo la idea hasta que terminó la música.',
    'El micrófono pasó de asesor a animador sin concurso público.',
    'La delegación aplaude; el protocolo intenta seguir el ritmo.',
    'Se aprobó celebrar por unanimidad, con dos abstenciones rítmicas.',
    'El cartel de agradecimiento tapa al funcionario que vino a agradecerse.',
    'El comité de balance perdió a sus integrantes en la ronda de baile.'
  ],
  low: [
    'La delegación trajo un megáfono. El consejo pidió la versión en PDF.',
    'La pancarta cabe en una frase; la respuesta necesita cuatro reuniones.',
    'El reclamo tiene ritmo. La solución todavía busca fecha.',
    'El asesor propone crear una comisión para leer la pancarta.',
    'La protesta lleva cartel. El comunicado lleva membrete.',
    'Se abrió una ventanilla para recibir quejas sobre la ventanilla.',
    'La delegación pide respuestas. El consejo pide bajar el volumen.',
    'La protesta llegó temprano; el trámite se tomó su tiempo.',
    'El consejo recomienda diálogo. El megáfono ya estaba preparado.',
    'Se entregó el reclamo por duplicado; falta que llegue la respuesta.'
  ]
} as const;

export function getMapResultStory(sector: SectorId, good: boolean, turn: number, seed: string): { text: string; variant: number } {
  if (!(sector in LOCAL)) return { text: '', variant: 0 };
  const local = LOCAL[sector as keyof typeof LOCAL];
  const outcome = good ? 'good' : 'low';
  const lines = [...local[outcome], ...GENERAL[outcome]];
  const edition = Math.max(0, turn - 1);
  // Bolsa compartida y posiciones distintas: tampoco repetir la misma escena
  // genérica entre dos sectores de una edición.
  const rng = new SeededRandom(`${seed}:map-stories:${outcome}:${Math.floor(edition / lines.length)}`);
  const bag = lines.map((_, i) => i);
  for (let i = bag.length - 1; i > 0; i--) {
    const swap = rng.rangeInt(0, i);
    [bag[i], bag[swap]] = [bag[swap], bag[i]];
  }
  const offsets = { population: 0, agriculture: 3, livestock: 6, mining: 9, ecosystem: 12 };
  const choice = bag[(edition + offsets[sector as keyof typeof offsets]) % bag.length];
  return { text: `${local.speaker}: «${lines[choice]}»`, variant: choice % 3 };
}
