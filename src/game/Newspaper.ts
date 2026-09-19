import { SeasonResult } from '../models/Balance';
import { SEASONS_INFO } from '../models/Season';

export interface NewspaperArticle {
  headline: string;
  subhead: string;
  lead: string;
  photoEmoji: string;
  quote: string;
  author: string;
}

export interface NewspaperEdition {
  editionNumber: number;
  dateString: string;
  price: string;
  mainArticle: NewspaperArticle;
  sideArticle: NewspaperArticle;
  gossipSnippet: string;
  weatherForecastHumor: string;
}

export function generateNewspaperEdition(result: SeasonResult): NewspaperEdition {
  const { year, season, balance } = result;
  const seasonName = SEASONS_INFO[season].name;
  const satisfactions = balance.satisfactions;

  // Analizar la situación más extrema o relevante de la estación
  const popSat = satisfactions.population ?? 100;
  const agriSat = satisfactions.agriculture ?? 100;
  const liveSat = satisfactions.livestock ?? 100;
  const minSat = satisfactions.mining ?? 100;
  const ecoSat = satisfactions.ecosystem ?? 100;

  let mainArticle: NewspaperArticle;
  let sideArticle: NewspaperArticle;

  // 1. Elegir titular principal según lo más crítico o sobresaliente
  if (popSat < 50) {
    mainArticle = {
      headline: '¡CRISIS DE ESPUMA! LA CIUDAD RECLAMA AGUA CON PATITOS DE GOMA',
      subhead: 'La Alcaldesa Sofía pide calma mientras los vecinos hacen fila con cacerolas',
      lead: 'Vecinos de todos los barrios marcharon hacia el palacio municipal. Denuncian duchas de 12 segundos y cafeterías vendiendo café sin agua.',
      photoEmoji: '🏙️🪣',
      quote: '"Abrí la canilla y me salió un suspiro y un bicho bolita", declaró un indignado vecino.',
      author: 'Sofía Reporta - Redacción Central'
    };
  } else if (ecoSat < 50) {
    mainArticle = {
      headline: 'EL RÍO PIDE AUXILIO: PIPO EL CARPINCHO LIDERA HUELGA DE HUMEDAL',
      subhead: 'Los peces exigen carriles exclusivos y mayor caudal para continuar nadando',
      lead: 'La orilla del río parece una playa desierta. La Dra. Clara advierte que los carpinchos han empezado a armar carpas frente a la gobernación.',
      photoEmoji: '🦫⚠️',
      quote: '"Si el río se seca, Pipo no responderá por sus actos", advirtió la bióloga con megáfono.',
      author: 'Clara Ecos - Suplemento Verde'
    };
  } else if (agriSat < 50) {
    mainArticle = {
      headline: 'DON JACINTO EN PIE DE GUERRA: "MIS TOMATES PARECEN CIRUELAS SECAS"',
      subhead: 'Los productores agrícolas amenazan con regar los campos con mate cocido',
      lead: 'Las acequias del valle bajaron a mínimos históricos. Las hortalizas muestran síntomas de insolación y los tractores permanecen estacionados.',
      photoEmoji: '🚜🥀',
      quote: '"Treinta años cultivando sandías para que ahora me salgan aceitunas", disparó don Jacinto.',
      author: 'Don Jacinto - Desde el Surco'
    };
  } else if (minSat < 50) {
    mainArticle = {
      headline: 'FRENO A LA MOLIENDA: EL ING. FERRADA DICE QUE LAS MÁQUINAS ECHAN HUMO',
      subhead: 'La falta de agua paraliza las cintas y las acciones de la mina caen en picada',
      lead: 'Las bombas del concentrador de mineral entraron en modo de emergencia térmica. Ferrada exige prioridad hídrica para no suspender turnos.',
      photoEmoji: '👷‍♂️📉',
      quote: '"Sin agua para el circuito de molienda, el mineral no se mueve", avisó el superintendente.',
      author: 'Gacetilla Minera del Valle'
    };
  } else if (balance.aquiferEnd < 40) {
    mainArticle = {
      headline: 'ECOS MISTERIOSOS EN EL ACUÍFERO: ¿ESTAMOS VACIANDO EL FONDO DEL VALLE?',
      subhead: 'Geólogos advierten que el agua subterránea tardará décadas en recuperarse',
      lead: 'El nivel freático se desplomó alarmantemente tras bombeos intensivos. Los pozos rurales comienzan a chupar arena fina.',
      photoEmoji: '💧📉',
      quote: '"El acuífero es nuestra caja de ahorro, ¡y estamos gastando el aguinaldo!", alertó la cuenca.',
      author: 'Observatorio Hidrológico'
    };
  } else if (popSat >= 95 && agriSat >= 95 && ecoSat >= 95) {
    mainArticle = {
      headline: '¡MILAGRO EN LA CUENCA! AGUA PARA TODOS Y FIESTA POPULAR',
      subhead: 'La gestión hídrica logra el equilibrio perfecto entre ciudad, campo y naturaleza',
      lead: 'Comercios florecientes, tomates de campeonato y el río más cristalino que nunca. Los vecinos proponen erigir una estatua al administrador.',
      photoEmoji: '🎉🌊',
      quote: '"Hacía años que no veíamos tanta paz en el valle", coincidieron vecinos y granjeros.',
      author: 'La Voz Comunitaria'
    };
  } else {
    mainArticle = {
      headline: 'LA CUENCA AGUANTA EL PASO DE LA ESTACIÓN CON PULSO FIRME',
      subhead: 'Un reparto ajustado pero estable mantiene funcionando los motores del valle',
      lead: 'Sin lujos pero sin tragedias, las compuertas se mantuvieron abiertas y los usuarios cumplieron sus metas mínimas de supervivencia.',
      photoEmoji: '⚖️🌤️',
      quote: '"La clave es no dormirse en los laureles antes del próximo cambio de clima."',
      author: 'Redacción Heraldo'
    };
  }

  // 2. Noticia secundaria
  if (liveSat >= 95) {
    sideArticle = {
      headline: 'Doña Berta gana la copa láctea',
      subhead: 'Las vacas producen queso gourmet',
      lead: 'Con bebederos a rebosar, la quesería del valle exportará quesos a la capital.',
      photoEmoji: '🧀🐄',
      quote: '"Vaca fresca da leche con crema"',
      author: 'Suplemento Campo'
    };
  } else if (liveSat < 60) {
    sideArticle = {
      headline: 'Ganado sediento en los corrales altos',
      subhead: 'Las pasturas se endurecen',
      lead: 'Doña Berta pide camiones cisterna para rellenar los tajamares de emergencia.',
      photoEmoji: '🐄⚠️',
      quote: '"Los animales no entienden de balances"',
      author: 'Suplemento Campo'
    };
  } else if (balance.waterQuality > 85) {
    sideArticle = {
      headline: 'Río cristalino: ¡Vuelven los flamencos!',
      subhead: 'Baja turbidez y oxígeno en máximos',
      lead: 'Bañistas y aves playeras comparten las playas del río en una jornada festiva.',
      photoEmoji: '🪷🦆',
      quote: '"Se ven las piedras del fondo"',
      author: 'Turismo Fluvial'
    };
  } else {
    sideArticle = {
      headline: 'Mercado de hortalizas cotiza al alza',
      subhead: 'La verdura de estación mantiene precios',
      lead: 'Los cajones de lechuga y papa se venden rápido en la feria de productores.',
      photoEmoji: '🥬🧺',
      quote: '"A comprar antes que suba el flete"',
      author: 'Economía Barrial'
    };
  }

  // Chismes y clima humorístico
  const gossips = [
    'Se vio a Don Jacinto intentando convencer a una nube con una guitarra criolla.',
    'Pipo el Carpincho fue nombrado "Empleado Honorario" del sistema de compuertas.',
    'El Ing. Ferrada cambió su café por agua mineral con gas para apoyar el ahorro.',
    'La Alcaldesa Sofía prohibió los carnavales con bombitas de agua hasta nuevo aviso.',
    'Rumores afirman que el acuífero susurra viejas canciones cuando baja de nivel.'
  ];
  const gossipSnippet = gossips[result.turn % gossips.length];

  const weatherJokes: Record<string, string> = {
    VERY_DRY: 'Sol implacable: Hasta los cactus están pidiendo un vaso con hielo.',
    DRY: 'Viento seco y cielo despejado. Ideal para secar ropa, pésimo para el embalse.',
    NORMAL: 'Clima típico de temporada. Nada de qué alarmarse, pero no baje la guardia.',
    WET: 'Nubes generosas en el horizonte: Los paraguas cotizan en bolsa.',
    VERY_WET: 'Lluvias torrenciales: Los patos andan en jet ski por la avenida principal.'
  };
  const weatherForecastHumor = weatherJokes[result.climateState] || 'Cielo variable con probabilidad de decisiones difíciles.';

  return {
    editionNumber: result.turn,
    dateString: `Año ${year} • ${seasonName} (Edición N° ${result.turn})`,
    price: '$5 centavos hídricos',
    mainArticle,
    sideArticle,
    gossipSnippet,
    weatherForecastHumor
  };
}
