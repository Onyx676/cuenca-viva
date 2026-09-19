import { PlayableSectorId } from '../main';

export type MoodType = 'ECSTATIC' | 'HAPPY' | 'NEUTRAL' | 'WORRIED' | 'FURIOUS';

export interface SectorCharacter {
  id: PlayableSectorId;
  name: string;
  role: string;
  avatar: string; // Emoji o representación icónica principal
  badgeColor: string;
  quotes: {
    ECSTATIC: string[];
    HAPPY: string[];
    NEUTRAL: string[];
    WORRIED: string[];
    FURIOUS: string[];
  };
  floatingReactions: {
    positive: string[];
    negative: string[];
  };
}

export const SECTOR_CHARACTERS: Record<PlayableSectorId, SectorCharacter> = {
  population: {
    id: 'population',
    name: 'Alcaldesa Sofía',
    role: 'Representante Ciudadana',
    avatar: '👩‍💼',
    badgeColor: '#60a5fa',
    quotes: {
      ECSTATIC: [
        '¡Las fuentes de la plaza bailan y los vecinos sonríen!',
        '¡Presión de agua perfecta en el décimo piso!',
        '¡Aprobación ciudadana por las nubes, gracias colega!'
      ],
      HAPPY: [
        'Hogares, hospitales y escuelas abastecidos con normalidad.',
        'Los reclamos vecinales están en mínimos históricos.',
        'La gente abre la canilla y sale agua fresca. ¡Cumplimos!'
      ],
      NEUTRAL: [
        'Llegamos con lo justo. Por favor no me bajes más la presión.',
        'Algunos barrios del este se quejan de poca fuerza en las duchas.',
        'Estamos al límite, mantén el flujo estable.'
      ],
      WORRIED: [
        '¡Ya me están llamando sin parar al teléfono del municipio!',
        'Se suspendieron los regadores de plazas. La gente está inquieta.',
        '¡Un poco más de agua o la gente se va a enojar mucho!'
      ],
      FURIOUS: [
        '¡Los vecinos se bañan con baldes y llenan las redes de memes furiosos!',
        '¡Hay protestas en la puerta del municipio con cacerolas vacías!',
        '¡Emergencia total en la ciudad! ¡Abran las canillas ya!'
      ]
    },
    floatingReactions: {
      positive: ['💧 Frescura', '🚿 Presión OK', '🏙️ Ciudad feliz', '🚰 Canilla abierta'],
      negative: ['🪣 Baldes secos', '😡 Vecinos furiosos', '📱 Quejas al 100%', '🚫 Sin agua']
    }
  },

  agriculture: {
    id: 'agriculture',
    name: 'Don Jacinto',
    role: 'Voz de los Productores',
    avatar: '👨‍🌾',
    badgeColor: '#34d399',
    quotes: {
      ECSTATIC: [
        '¡Mire el tamaño de esos zapallos! ¡Son más grandes que mi camioneta!',
        '¡Cosecha dorada, m’hijo! Habrá fiesta del tomate en el pueblo.',
        '¡El campo entero huele a tierra mojada y abundancia!'
      ],
      HAPPY: [
        'Las acequias corren mansas y el maíz crece fuerte y verde.',
        'Buen riego, buena fruta. Don Jacinto le manda un abrazo.',
        'La tierra está húmeda y las plantas crecen felices.'
      ],
      NEUTRAL: [
        'Alcanza para los nogales, pero las lechugas van a salir petisas.',
        'Ni sobrado ni seco. Ojalá no venga una ola de calor fuerte.',
        'Cuidemos cada gota en los canales del fondo.'
      ],
      WORRIED: [
        '¡Las hojas del maíz se me están achicharrando con el sol!',
        'O me da un empujón de agua o se me secan las plantas del fondo.',
        '¡El sol pega duro y por el canal corre un hilito de nada!'
      ],
      FURIOUS: [
        '¡Mis lechugas parecen pasas de uva! ¡Se me está secando la quinta!',
        '¡Tantos años sembrando para ver la tierra agrietada como cascote!',
        '¡Si me corta más el agua le tiro un cajón de manzanas podridas!'
      ]
    },
    floatingReactions: {
      positive: ['🌽 Choclos gigantes', '🍉 Sandías dulces', '🌿 Campo verde', '✨ Canal lleno'],
      negative: ['🥀 Plantas secas', '🍂 Hojas tostadas', '🏜️ Tierra partida', '🚜 Tractor parado']
    }
  },

  livestock: {
    id: 'livestock',
    name: 'Doña Berta',
    role: 'Criadora y Tambera',
    avatar: '👩‍🌾',
    badgeColor: '#facc15',
    quotes: {
      ECSTATIC: [
        '¡Las vacas mugean contentas y la leche sale cremosa y rica!',
        'Bebederos llenos, pasto verde y ovejas saltando.',
        '¡Hasta los quesos artesanales salieron premiados!'
      ],
      HAPPY: [
        'El ganado pasta tranquilo a la sombra de los árboles.',
        'Los bebederos tienen agua fresca todo el día. ¡Todo marcha bien!',
        'Buena cantidad de leche esta temporada, gracias administrador.'
      ],
      NEUTRAL: [
        'Estamos cuidando el agua de los corrales. No nos sobra nada.',
        'El pasto aguanta, pero el agua de los bebederos se pone tibia.',
        'Con un poquito más de agua las vacas estarían de diez.'
      ],
      WORRIED: [
        '¡Los animales caminan buscando sombra y agua fresca!',
        'El pasto se me está poniendo duro y seco como paja.',
        'Si las vacas toman poca agua, no van a tener leche.'
      ],
      FURIOUS: [
        '¡Las vacas me van a dar leche en polvo si no me manda agua ya!',
        '¡Tengo a los terneros con sed y los piletones secos como ceniza!',
        '¡No me haga enojar, que el ganado necesita tomar agua todos los días!'
      ]
    },
    floatingReactions: {
      positive: ['🐄 Leche cremosa', '🧀 Queso rico', '🌱 Pasto tierno', '🥛 Balde lleno'],
      negative: ['🥛 Poca leche', '🥵 Vacas con sed', '🌾 Pasto seco', '💔 Corral en apuros']
    }
  },

  mining: {
    id: 'mining',
    name: 'Ing. Ferrada',
    role: 'Jefe de la Mina',
    avatar: '👷‍♂️',
    badgeColor: '#c084fc',
    quotes: {
      ECSTATIC: [
        '¡Las máquinas andan volando y sacamos mineral sin parar!',
        '¡Los camiones van y vienen cargados a tope!',
        '¡Hay trabajo y recursos para toda la región, colega!'
      ],
      HAPPY: [
        'Los motores andan parejitos y los obreros trabajan seguros.',
        'El lavado de rocas funciona dentro de los tiempos normales.',
        'Buen flujo de agua para enfriar las instalaciones.'
      ],
      NEUTRAL: [
        'Tuvimos que bajar la velocidad de las cintas transportadoras.',
        'Estamos con el agua justa para limpiar el material.',
        'Si instalamos tuberías de reciclaje gastaríamos mucha menos agua.'
      ],
      WORRIED: [
        '¡Las bombas hacen ruido a seco y los motores calientan!',
        'Si frenamos los molinos se pierden un montón de trabajos.',
        'No nos corte tanto el agua o no podemos operar.'
      ],
      FURIOUS: [
        '¡Pararon los motores! ¡Las máquinas están echando humo!',
        '¡Toda la cuadrilla parada y las piedras trabadas en las cintas!',
        '¡Sin agua para enfriar se rompen los equipos más caros!'
      ]
    },
    floatingReactions: {
      positive: ['⚙️ Máquinas al 100%', '💎 Mineral puro', '📈 Mucho trabajo', '🚛 Camión cargado'],
      negative: ['⚠️ Motor caliente', '📉 Mina parada', '🛑 Cintas quietas', '💥 Fricción']
    }
  },

  ecosystem: {
    id: 'ecosystem',
    name: 'Dra. Clara & Pipo',
    role: 'Bióloga y el Carpincho',
    avatar: '👩‍🔬🦫',
    badgeColor: '#22d3ee',
    quotes: {
      ECSTATIC: [
        '¡El humedal está hermoso! Pipo el Carpincho duerme una siesta genial.',
        '¡Aparecieron patos, garzas y peces que no veíamos hace años!',
        '¡El río tiene agua cristalina, corriente limpia y aire puro!'
      ],
      HAPPY: [
        'El caudal del río está sano. Los pececitos nadan felices.',
        'Las plantas de la orilla filtran el agua naturalmente.',
        'Pipo se da chapuzones alegres en la laguna.'
      ],
      NEUTRAL: [
        'Los peces nadan en charcos chicos. El río pide un respiro.',
        'La orilla está achicándose. Por favor cuidá que no se corte el río.',
        'Pipo me mira de reojo con cara de preocupación.'
      ],
      WORRIED: [
        '¡Aparecen bancos de arena y los patos buscan charquitos!',
        'El agua del río está tibia y con poco oxígeno para los peces.',
        'Si no le dejás más agua al río, las plantas de la orilla se mueren.'
      ],
      FURIOUS: [
        '¡El río es un hilito de barro! ¡Pipo está preparando la mochila para mudarse a tu casa!',
        '¡Los pececitos se quedan atrapados en la orilla sin agua!',
        '¡Si secamos el río nos quedamos sin naturaleza ni futuro!'
      ]
    },
    floatingReactions: {
      positive: ['🦫 Pipo duerme feliz', '🐟 Pez saltando', '🌿 Humedal vivo', '🪷 Loto florecido'],
      negative: ['🦫 Pipo enojado', '☠️ Río de barro', '🍂 Humedal seco', '⚠️ Sin oxígeno']
    }
  }
};

export function getMood(coveragePct: number): MoodType {
  if (coveragePct >= 110) return 'ECSTATIC';
  if (coveragePct >= 85) return 'HAPPY';
  if (coveragePct >= 65) return 'NEUTRAL';
  if (coveragePct >= 40) return 'WORRIED';
  return 'FURIOUS';
}

export function getCharacterFeedback(sectorId: PlayableSectorId, coveragePct: number): {
  character: SectorCharacter;
  mood: MoodType;
  quote: string;
  avatarIcon: string;
  reaction: string;
} {
  const character = SECTOR_CHARACTERS[sectorId];
  const mood = getMood(coveragePct);
  const quotesList = character.quotes[mood];
  // Elegir frase determinista o pseudo-aleatoria según el porcentaje
  const quoteIdx = Math.floor(Math.abs(coveragePct * 7)) % quotesList.length;
  const quote = quotesList[quoteIdx];

  const reactions = coveragePct >= 80 ? character.floatingReactions.positive : character.floatingReactions.negative;
  const reactionIdx = Math.floor(Math.abs(coveragePct * 13)) % reactions.length;
  const reaction = reactions[reactionIdx];

  let avatarIcon = character.avatar;
  if (mood === 'FURIOUS') avatarIcon += ' 💢';
  else if (mood === 'WORRIED') avatarIcon += ' 😰';
  else if (mood === 'ECSTATIC') avatarIcon += ' ✨';

  return { character, mood, quote, avatarIcon, reaction };
}
