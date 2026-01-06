import { Trainer, Lineup, StockfishConfig, PlayerColor } from './types';

// --- Assets ---

const getPokemonSprite = (id: number): string => 
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

export const getTrainerSprite = (name: string): string => 
  `https://play.pokemonshowdown.com/sprites/trainers/${name}.png`;

// Updated to a Pokemon Stadium (Super Smash Bros style) image
export const ASSETS = {
    STADIUM_BG: 'https://images7.alphacoders.com/610/610531.jpg', 
};

// Helper to create Pokemon mapping
export const p = (name: string, id: number) => ({
  name,
  imgUrl: getPokemonSprite(id),
  id
});

// Helper for Trainer Kings
const t = (name: string, spriteName: string) => ({
  name,
  imgUrl: getTrainerSprite(spriteName),
  id: 0
});

// --- Lineups ---

export const RED_LINEUP: Lineup = {
  k: t('Red', 'red'),
  q: p('Charizard', 6),
  r: p('Snorlax', 143),
  b: p('Alakazam', 65),
  n: p('Pikachu', 25),
  p: p('Pidgey', 16),
};

export const BLUE_LINEUP: Lineup = {
  k: t('Blue', 'blue'),
  q: p('Blastoise', 9),
  r: p('Gyarados', 130),
  b: p('Exeggutor', 103),
  n: p('Arcanine', 59),
  p: p('Rattata', 19),
};

// --- Trainers ---

const createTrainer = (
  id: string, 
  name: string, 
  elo: number,
  theme: string, 
  spriteName: string,
  lineupChanges: Partial<Lineup>,
  aiConfig: StockfishConfig
): Trainer => {
  return {
    id,
    name,
    difficultyLabel: `${elo} ELO`,
    elo,
    theme,
    imgUrl: getTrainerSprite(spriteName),
    lineup: { 
      ...BLUE_LINEUP, 
      k: t(name, spriteName),
      ...lineupChanges 
    },
    aiConfig
  };
};

export const TRAINERS: Trainer[] = [
  createTrainer('brock', 'Brock', 400, 'Defensive, slow', 'brock', {
    q: p('Onix', 95), r: p('Golem', 76), b: p('Graveler', 75), n: p('Geodude', 74), p: p('Sandshrew', 27)
  }, { skillLevel: 1, moveTime: 100, depth: 4 }),

  createTrainer('misty', 'Misty', 600, 'Positional, cautious', 'misty', {
    q: p('Starmie', 121), r: p('Gyarados', 130), b: p('Golduck', 55), n: p('Psyduck', 54), p: p('Poliwag', 60)
  }, { skillLevel: 3, moveTime: 150, depth: 5 }),

  createTrainer('surge', 'Lt. Surge', 800, 'Early aggression', 'ltsurge', {
    q: p('Raichu', 26), r: p('Electabuzz', 125), b: p('Magneton', 82), n: p('Voltorb', 100), p: p('Pikachu', 25)
  }, { skillLevel: 5, moveTime: 200, depth: 6 }),

  createTrainer('erika', 'Erika', 1000, 'Solid, positional', 'erika', {
    q: p('Vileplume', 45), r: p('Tangela', 114), b: p('Victreebel', 71), n: p('Gloom', 44), p: p('Bellsprout', 69)
  }, { skillLevel: 7, moveTime: 300, depth: 7 }),

  createTrainer('koga', 'Koga', 1200, 'Tricky, indirect', 'koga', {
    q: p('Weezing', 110), r: p('Muk', 89), b: p('Golbat', 42), n: p('Venonat', 48), p: p('Koffing', 109)
  }, { skillLevel: 9, moveTime: 400, depth: 8 }),

  createTrainer('sabrina', 'Sabrina', 1500, 'Tactical precision', 'sabrina', {
    q: p('Alakazam', 65), r: p('Hypno', 97), b: p('Mr. Mime', 122), n: p('Kadabra', 64), p: p('Abra', 63)
  }, { skillLevel: 12, moveTime: 600, depth: 10 }),

  createTrainer('blaine', 'Blaine', 1800, 'Attacking play', 'blaine', {
    q: p('Magmar', 126), r: p('Arcanine', 59), b: p('Ninetales', 38), n: p('Rapidash', 78), p: p('Vulpix', 37)
  }, { skillLevel: 14, moveTime: 800, depth: 12 }),

  createTrainer('giovanni', 'Giovanni', 2100, 'Endgame mastery', 'giovanni', {
    q: p('Nidoking', 34), r: p('Rhydon', 112), b: p('Nidoqueen', 31), n: p('Dugtrio', 51), p: p('Rhyhorn', 111)
  }, { skillLevel: 16, moveTime: 1200, depth: 14 }),

  createTrainer('rival', 'Elite Rival', 2500, 'Balanced, ruthless', 'ash', {
    q: p('Pikachu', 25), r: p('Charizard', 6), b: p('Greninja', 658), n: p('Sceptile', 254), p: p('Bulbasaur', 1)
  }, { skillLevel: 18, moveTime: 1800, depth: 16 }),

  createTrainer('champion', 'Champion', 3000, 'Legendary', 'red', {
     // Champion lineup 
  }, { skillLevel: 20, moveTime: 2500, depth: null }),
];

// Protagonists for King Selection (avoiding Gym Leaders)
export const PLAYER_AVATARS = [
    { name: "Red", sprite: "red" },
    { name: "Blue", sprite: "blue" },
    { name: "Ethan", sprite: "ethan" },
    { name: "Lyra", sprite: "lyra" },
    { name: "Brendan", sprite: "brendan" },
    { name: "May", sprite: "may" },
    { name: "Lucas", sprite: "lucas" },
    { name: "Dawn", sprite: "dawn" },
    { name: "Hilbert", sprite: "hilbert" },
    { name: "Hilda", sprite: "hilda" },
    { name: "Nate", sprite: "nate" },
    { name: "Rosa", sprite: "rosa" },
    { name: "Calem", sprite: "calem" },
    { name: "Serena", sprite: "serena" },
    { name: "Sun", sprite: "sun" },
    { name: "Moon", sprite: "moon" },
    { name: "Ash", sprite: "ash" },
    { name: "Gary", sprite: "blue-gen1" },
];

// Pokemon Names List (Gen 1)
export const POKEMON_NAMES_GEN1 = [
  "Bulbasaur", "Ivysaur", "Venusaur", "Charmander", "Charmeleon", "Charizard",
  "Squirtle", "Wartortle", "Blastoise", "Caterpie", "Metapod", "Butterfree",
  "Weedle", "Kakuna", "Beedrill", "Pidgey", "Pidgeotto", "Pidgeot",
  "Rattata", "Raticate", "Spearow", "Fearow", "Ekans", "Arbok",
  "Pikachu", "Raichu", "Sandshrew", "Sandslash", "Nidoran♀", "Nidorina",
  "Nidoqueen", "Nidoran♂", "Nidorino", "Nidoking", "Clefairy", "Clefable",
  "Vulpix", "Ninetales", "Jigglypuff", "Wigglytuff", "Zubat", "Golbat",
  "Oddish", "Gloom", "Vileplume", "Paras", "Parasect", "Venonat",
  "Venomoth", "Diglett", "Dugtrio", "Meowth", "Persian", "Psyduck",
  "Golduck", "Mankey", "Primeape", "Growlithe", "Arcanine", "Poliwag",
  "Poliwhirl", "Poliwrath", "Abra", "Kadabra", "Alakazam", "Machop",
  "Machoke", "Machamp", "Bellsprout", "Weepinbell", "Victreebel", "Tentacool",
  "Tentacruel", "Geodude", "Graveler", "Golem", "Ponyta", "Rapidash",
  "Slowpoke", "Slowbro", "Magnemite", "Magneton", "Farfetch'd", "Doduo",
  "Dodrio", "Seel", "Dewgong", "Grimer", "Muk", "Shellder", "Cloyster",
  "Gastly", "Haunter", "Gengar", "Onix", "Drowzee", "Hypno",
  "Krabby", "Kingler", "Voltorb", "Electrode", "Exeggcute", "Exeggutor",
  "Cubone", "Marowak", "Hitmonlee", "Hitmonchan", "Lickitung", "Koffing",
  "Weezing", "Rhyhorn", "Rhydon", "Chansey", "Tangela", "Kangaskhan",
  "Horsea", "Seadra", "Goldeen", "Seaking", "Staryu", "Starmie",
  "Mr. Mime", "Scyther", "Jynx", "Electabuzz", "Magmar", "Pinsir",
  "Tauros", "Magikarp", "Gyarados", "Lapras", "Ditto", "Eevee",
  "Vaporeon", "Jolteon", "Flareon", "Porygon", "Omanyte", "Omastar",
  "Kabuto", "Kabutops", "Aerodactyl", "Snorlax", "Articuno", "Zapdos",
  "Moltres", "Dratini", "Dragonair", "Dragonite", "Mewtwo", "Mew"
];

export const getLineupForSide = (color: PlayerColor, trainer?: Trainer): Lineup => {
  if (color === PlayerColor.WHITE) {
    return RED_LINEUP;
  }
  return trainer ? trainer.lineup : BLUE_LINEUP;
};

export const SOUNDS = {
  INTRO: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3', 
  CLICK: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3', 
  MOVE: 'https://assets.mixkit.co/active_storage/sfx/2042/2042-preview.mp3', 
  CHECK: 'https://assets.mixkit.co/active_storage/sfx/995/995-preview.mp3', 
  BGM_MENU: 'https://cdn.discordapp.com/attachments/1261581754070728777/1458070515963920484/SPOILER_1o6XmyF.mp3?ex=695e4d7c&is=695cfbfc&hm=f3befc17778a4cabd6c5880de4ba7fe8ebbdabb8230ab51a5ce2e7c6cf2d182f&', 
  BGM_ENCOUNTER: 'https://cdn.discordapp.com/attachments/1261581754070728777/1458075665621586014/SPOILER_vjFtIaW.mp3?ex=695e5248&is=695d00c8&hm=d46b262c17213fc3f8927d7d5bee8bec9385ed14c51b4392592763e9fe35c66b&',
  CAPTURE: 'https://cdn.discordapp.com/attachments/1261581754070728777/1458085026800341044/SPOILER_ZPOoO4J.mp3?ex=695e5b00&is=695d0980&hm=bad5441bb325de162036fa43f28c1e57976e57debe70d1688202a76275f8fb4a&',
  VICTORY: 'https://cdn.discordapp.com/attachments/1261581754070728777/1458087238075420798/SPOILER_WhQYAz6.mp3?ex=695e5d0f&is=695d0b8f&hm=3396e51c91903d4078f0fb87fdb369cac4cb34576dba88897cd88f27b204e2fa&',
  EVOLVE: 'https://cdn.discordapp.com/attachments/1261581754070728777/1458085388374642768/SPOILER_dhAHYfU.mp3?ex=695e5b56&is=695d09d6&hm=98ec1d141acf1369c1e66e403849f4bc4ced9e4a4c9231d51bc9fbbb49ae802d&'
};