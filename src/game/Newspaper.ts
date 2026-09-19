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

  // Normalizar porcentajes a escala 0 - 100
  const popSat = Math.round((satisfactions.population ?? 1) * 100);
  const agriSat = Math.round((satisfactions.agriculture ?? 1) * 100);
  const liveSat = Math.round((satisfactions.livestock ?? 1) * 100);
  const minSat = Math.round((satisfactions.mining ?? 1) * 100);
  const ecoSat = Math.round((satisfactions.ecosystem ?? 1) * 100);

  // Encontrar el sector con mayor problema y el más satisfecho
  const sectorsList = [
    { id: 'population', name: 'Ciudad', sat: popSat },
    { id: 'agriculture', name: 'Cultivos', sat: agriSat },
    { id: 'livestock', name: 'Ganado', sat: liveSat },
    { id: 'mining', name: 'Mina', sat: minSat },
    { id: 'ecosystem', name: 'Río', sat: ecoSat },
  ];
  sectorsList.sort((a, b) => a.sat - b.sat);
  const worstSector = sectorsList[0];
  const bestSector = sectorsList[sectorsList.length - 1];

  let mainArticle: NewspaperArticle;
  let sideArticle: NewspaperArticle;

  // 1. ELECCIÓN INTELIGENTE DEL TITULAR PRINCIPAL
  if (worstSector.sat < 60) {
    // Hay un sector en crisis real
    if (worstSector.id === 'population') {
      mainArticle = {
        headline: '¡CRISIS DE ESPUMA! LA CIUDAD RECLAMA AGUA CON PATITOS DE GOMA',
        subhead: 'La Alcaldesa Sofía pide calma mientras los vecinos hacen fila con cacerolas',
        lead: 'Vecinos de todos los barrios marcharon hacia el municipio. Denuncian duchas de 12 segundos y canillas que solo escupen aire.',
        photoEmoji: '🏙️🪣',
        quote: '"Abrí la canilla para lavarme los dientes y salió un suspiro", declaró un indignado vecino.',
        author: 'Sofía Reporta - Redacción Central'
      };
    } else if (worstSector.id === 'ecosystem') {
      mainArticle = {
        headline: 'EL RÍO PIDE AUXILIO: PIPO EL CARPINCHO LIDERA HUELGA DE HUMEDAL',
        subhead: 'Los peces exigen carriles profundos y corriente limpia para continuar nadando',
        lead: 'La orilla del río parece una playa desierta. La Dra. Clara advierte que los carpinchos han empezado a armar carpas frente a la gobernación.',
        photoEmoji: '🦫⚠️',
        quote: '"Si el río se seca, Pipo no responderá por sus actos", advirtió la bióloga con megáfono.',
        author: 'Dra. Clara - Suplemento Verde'
      };
    } else if (worstSector.id === 'agriculture') {
      mainArticle = {
        headline: 'DON JACINTO EN PIE DE GUERRA: "MIS TOMATES PARECEN CIRUELAS SECAS"',
        subhead: 'Los productores del valle amenazan con regar los campos con mate cocido',
        lead: 'Las acequias del valle bajaron a mínimos históricos. Las hortalizas muestran síntomas de insolación y los tractores permanecen quietos.',
        photoEmoji: '🚜🥀',
        quote: '"Treinta años sembrando para ver la tierra partida como cascote", disparó Don Jacinto.',
        author: 'Don Jacinto - Desde el Surco'
      };
    } else if (worstSector.id === 'mining') {
      mainArticle = {
        headline: 'FRENO A LOS MOTORES: EL ING. FERRADA DICE QUE LAS MÁQUINAS ECHAN HUMO',
        subhead: 'La falta de agua paraliza las cintas transportadoras y calienta las bombas',
        lead: 'Las bombas del concentrador de mineral entraron en modo de emergencia térmica. Ferrada exige prioridad hídrica para no suspender turnos de obreros.',
        photoEmoji: '👷‍♂️📉',
        quote: '"Sin agua para enfriar el circuito, las piedras quedan trabadas", avisó el superintendente.',
        author: 'Gacetilla Minera del Valle'
      };
    } else {
      mainArticle = {
        headline: 'DOÑA BERTA EN ALERTA: "¡LAS VACAS ME VAN A DAR LECHE EN POLVO!"',
        subhead: 'Bebederos secos en los corrales altos ponen en apuros a la quesería local',
        lead: 'Los tajamares y piletones rurales amanecieron sin agua. Doña Berta pide camiones cisterna urgentes para refrescar a los terneros.',
        photoEmoji: '🐄⚠️',
        quote: '"Los animales no entienden de planillas de cálculo, necesitan tomar agua", reclamó la tambera.',
        author: 'Doña Berta - Voz Rural'
      };
    }
  } else if (balance.aquiferEnd < 45) {
    // Alerta de agua subterránea
    mainArticle = {
      headline: 'ECOS MISTERIOSOS EN EL ACUÍFERO: ¿ESTAMOS VACIANDO EL FONDO DEL VALLE?',
      subhead: 'Geólogos advierten que los pozos subterráneos tardan años en recargarse',
      lead: 'El agua bajo tierra se desplomó alarmantemente tras bombeos intensivos. Las bombas rurales comienzan a chupar arena fina.',
      photoEmoji: '💧📉',
      quote: '"El acuífero es nuestra caja de ahorro, ¡y estamos gastando el aguinaldo!", alertó la cuenca.',
      author: 'Observatorio Hidrológico'
    };
  } else if (popSat >= 85 && agriSat >= 85 && ecoSat >= 85 && minSat >= 85) {
    // Abundancia y éxito general
    const successHeadlines = [
      {
        headline: '¡MILAGRO EN LA CUENCA! AGUA PARA TODOS Y FIESTA EN LA PLAZA',
        subhead: 'La gestión hídrica logra el equilibrio supremo entre ciudad, campo y naturaleza',
        lead: 'Comercios florecientes, tomates gigantes y el río más cristalino que nunca. Los vecinos proponen erigir una estatua al administrador.',
        photoEmoji: '🎉🌊',
        quote: '"Hacía años que no veíamos tanta tranquilidad en el valle", coincidieron vecinos y granjeros.',
        author: 'La Voz Comunitaria'
      },
      {
        headline: 'TEMPORADA DE ORO: EL VALLE FUNCIONA COMO UN RELOJ SUIZO',
        subhead: 'Don Jacinto y la Alcaldesa comparten un café en señal de paz histórica',
        lead: 'Canales llenos, fuentes activas en la ciudad y la mina trabajando con recirculación perfecta. Un modelo de gestión que enseñarán en las escuelas.',
        photoEmoji: '✨🏆',
        quote: '"Cuando hay agua bien repartida, hasta los perros andan contentos", bromeó Don Jacinto.',
        author: 'Redacción Central'
      },
      {
        headline: 'RÍO BRILLANTE Y COSECHA RÉCORD: FESTIVAL DE VERDURAS EN EL PUEBLO',
        subhead: 'Pipo el Carpincho es nombrado Embajador Honorario de la Cuenca',
        lead: 'Las ferias barriales desbordan de melones, lechugas y quesos frescos. El humedal alberga bandadas de flamencos que asombran a los turistas.',
        photoEmoji: '🦫🍉',
        quote: '"Esto demuestra que producir y cuidar la naturaleza pueden ir de la mano", afirmó Clara.',
        author: 'Suplemento Ecosistema'
      }
    ];
    mainArticle = successHeadlines[result.turn % successHeadlines.length];
  } else {
    // Balance moderado según la estación
    const seasonalModerates: Record<string, NewspaperArticle> = {
      WINTER: {
        headline: 'INVIERNO TRANQUILO: LA CUMBRE COMIENZA A GUARDAR SU MANTO BLANCO',
        subhead: 'El frío reduce la evaporación y los vecinos aprovechan para reparar cañerías',
        lead: 'Sin grandes tormentas pero con nevadas estables, la cuenca duerme su ciclo invernal mientras se monitorean los embalses para la primavera.',
        photoEmoji: '❄️🏔️',
        quote: '"La nieve de hoy es el agua fresca del próximo verano."',
        author: 'Boletín Cordillerano'
      },
      SPRING: {
        headline: 'DESHIELO CONTROLADO: EL AGUA DE MONTAÑA DESPIERTA EL VALLE',
        subhead: 'Las compuertas del embalse regulan el pulso de agua sin sobresaltos',
        lead: 'Los primeros calores aceleraron el deshielo en las cumbres. El río aumentó su caudal y las parcelas agrícolas reciben su primer gran riego.',
        photoEmoji: '🌱🌊',
        quote: '"El truco está en no dejar escapar el agua de más hacia el mar."',
        author: 'Crónica de Riego'
      },
      SUMMER: {
        headline: 'EL VALLE RESISTE EL CALOR DEL VERANO CON PULSO FIRME',
        subhead: 'A pesar del sol ardiente, las reservas estratégicas evitaron racionamientos',
        lead: 'El calor apretó fuerte pero las reservas guardadas en primavera respondieron a tiempo. La ciudad y el campo mantienen sus actividades.',
        photoEmoji: '☀️🌻',
        quote: '"Quien ahorró en invierno, duerme siesta fresca en verano."',
        author: 'Diario del Verano'
      },
      AUTUMN: {
        headline: 'LLEGA EL OTOÑO: TIEMPO DE BALANCE Y GUARDAR HERRAMIENTAS',
        subhead: 'Finalizan las cosechas principales y se planifican las obras del próximo año',
        lead: 'Las hojas caen y la demanda de riego comienza a descender. Productores y vecinos esperan la liquidación del presupuesto anual.',
        photoEmoji: '🍂🌾',
        quote: '"Un año que termina, una cuenca que sigue viva."',
        author: 'Ecos Rurales'
      }
    };
    mainArticle = seasonalModerates[season] || {
      headline: 'LA CUENCA AGUANTA EL PASO DE LA ESTACIÓN CON PULSO FIRME',
      subhead: 'Un reparto ajustado pero estable mantiene funcionando los motores del valle',
      lead: 'Sin lujos pero sin tragedias, las compuertas se mantuvieron abiertas y los usuarios cumplieron sus metas mínimas de supervivencia.',
      photoEmoji: '⚖️🌤️',
      quote: '"La clave es no dormirse en los laureles antes del próximo cambio de clima."',
      author: 'Redacción Heraldo'
    };
  }

  // 2. NOTICIA SECUNDARIA DINÁMICA (Elegida de un sector distinto al principal)
  if (bestSector.id === 'agriculture' && bestSector.sat >= 85) {
    sideArticle = {
      headline: 'Don Jacinto bate récord de calabazas',
      subhead: 'Cosecha gigante asombra al pueblo',
      lead: 'Una calabaza de 85 kilos fue presentada en la plaza. "Pura agua buena y abono", festejó Don Jacinto.',
      photoEmoji: '🎃🚜',
      quote: '"Entra un chico adentro de la calabaza"',
      author: 'Suplemento Campo'
    };
  } else if (bestSector.id === 'livestock' && bestSector.sat >= 85) {
    sideArticle = {
      headline: 'Doña Berta gana la copa del queso',
      subhead: 'Las vacas producen leche cremosa',
      lead: 'Con bebederos a rebosar, la quesería del valle exportará quesos a la capital con sello de calidad.',
      photoEmoji: '🧀🐄',
      quote: '"Vaca fresca da leche con crema"',
      author: 'Suplemento Campo'
    };
  } else if (balance.waterQuality > 80) {
    sideArticle = {
      headline: 'Río cristalino: ¡Vuelven los flamencos!',
      subhead: 'Baja turbidez y oxígeno en máximos',
      lead: 'Bañistas y aves playeras comparten las playas del río en una jornada festiva y colorida.',
      photoEmoji: '🪷🦆',
      quote: '"Se ven las piedras del fondo"',
      author: 'Turismo Fluvial'
    };
  } else if (bestSector.id === 'mining' && bestSector.sat >= 85) {
    sideArticle = {
      headline: 'Mina logra récord de exportación',
      subhead: 'El Ing. Ferrada elogia el circuito',
      lead: 'La cuadrilla minera completó el trimestre sin paradas imprevistas gracias al enfriamiento continuo.',
      photoEmoji: '💎👷‍♂️',
      quote: '"Producción segura y trabajo para todos"',
      author: 'Economía Regional'
    };
  } else {
    sideArticle = {
      headline: 'Mercado de hortalizas cotiza al alza',
      subhead: 'La verdura de estación mantiene precios',
      lead: 'Los cajones de lechuga y papa se venden rápido en la feria popular de productores.',
      photoEmoji: '🥬🧺',
      quote: '"A comprar antes que suba el flete"',
      author: 'Economía Barrial'
    };
  }

  // 3. CHISMES CÓMICOS ROTATIVOS DE LA CUENCA (10 variantes desopilantes)
  const gossips = [
    'Se vio a Don Jacinto intentando convencer a una nube con una guitarra criolla.',
    'Pipo el Carpincho fue nombrado "Inspector Honorario" de compuertas y canales.',
    'El Ing. Ferrada cambió su café por agua mineral con gas para demostrar su compromiso.',
    'La Alcaldesa Sofía prohibió los carnavales con bombitas de agua hasta nuevo aviso.',
    'Vecinos aseguran que el acuífero susurra canciones de cuna cuando baja la noche.',
    'Doña Berta le puso anteojos de sol a sus vacas para protegerlas de la resolana.',
    'Apareció un pato flotando en la pileta de enfriamiento de la mina; fue rescatado sano y salvo.',
    'Don Jacinto amenazó con patentar un sistema de riego que funciona con música clásica.',
    'La Dra. Clara descubrió que a los carpinchos les encanta escuchar el pronóstico del clima.',
    'Un grupo de vecinos organizó una carrera de barquitos de papel en el canal central.'
  ];
  const gossipSnippet = gossips[result.turn % gossips.length];

  // 4. PRONÓSTICO SEGÚN PIPO EL CARPINCHO
  const weatherJokes: Record<string, string> = {
    VERY_DRY: 'Sol implacable: Hasta los cactus están pidiendo un vaso de limonada con hielo.',
    DRY: 'Viento seco y cielo limpio. Ideal para secar ropa colgada, pero cuidemos las reservas.',
    NORMAL: 'Clima de temporada perfecto. Buen momento para mantener el equilibrio y no dormirse.',
    WET: 'Nubes generosas en camino: Los paraguas y las botas de goma cotizan en bolsa.',
    VERY_WET: 'Lluvias torrenciales: Pipo ofrece paseos en bote por la avenida principal del pueblo.'
  };
  const weatherForecastHumor = weatherJokes[result.climateState] || 'Cielo variable con probabilidad de decisiones interesantes.';

  return {
    editionNumber: result.turn,
    dateString: `Año ${year} • ${seasonName} (Turno ${result.turn}/20)`,
    price: 'Edición Escolar Gratuita',
    mainArticle,
    sideArticle,
    gossipSnippet,
    weatherForecastHumor
  };
}
