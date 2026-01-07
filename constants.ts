
import { Trainer, Lineup, StockfishConfig, PlayerColor } from './types';
import { BOT_CONFIGS } from './ai/botConfig';

const getPokemonSprite = (id: number): string => 
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

export const getTrainerSprite = (name: string): string => 
  `https://play.pokemonshowdown.com/sprites/trainers/${name}.png`;

export const ASSETS = {
    STADIUM_BG: 'https://i.pinimg.com/736x/ce/f5/c0/cef5c012ceb7d4ed35a6abf60c29d231.jpg', 
};

export const p = (name: string, id: number) => ({
  name,
  imgUrl: getPokemonSprite(id),
  id
});

const t = (name: string, spriteName: string) => ({
  name,
  imgUrl: getTrainerSprite(spriteName),
  id: 0
});

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
  }, BOT_CONFIGS.brock),

  createTrainer('misty', 'Misty', 600, 'Positional, cautious', 'misty', {
    q: p('Starmie', 121), r: p('Gyarados', 130), b: p('Golduck', 55), n: p('Psyduck', 54), p: p('Poliwag', 60)
  }, BOT_CONFIGS.misty),

  createTrainer('surge', 'Lt. Surge', 800, 'Early aggression', 'ltsurge', {
    q: p('Raichu', 26), r: p('Electabuzz', 125), b: p('Magneton', 82), n: p('Voltorb', 100), p: p('Pikachu', 25)
  }, BOT_CONFIGS.surge),

  createTrainer('erika', 'Erika', 1000, 'Solid, positional', 'erika', {
    q: p('Vileplume', 45), r: p('Tangela', 114), b: p('Victreebel', 71), n: p('Gloom', 44), p: p('Bellsprout', 69)
  }, BOT_CONFIGS.erika),

  createTrainer('koga', 'Koga', 1200, 'Tricky, indirect', 'koga', {
    q: p('Weezing', 110), r: p('Muk', 89), b: p('Golbat', 42), n: p('Venonat', 48), p: p('Koffing', 109)
  }, BOT_CONFIGS.koga), 

  createTrainer('sabrina', 'Sabrina', 1500, 'Tactical precision', 'sabrina', {
    q: p('Alakazam', 65), r: p('Hypno', 97), b: p('Mr. Mime', 122), n: p('Kadabra', 64), p: p('Abra', 63)
  }, BOT_CONFIGS.sabrina), 

  createTrainer('blaine', 'Blaine', 1800, 'Attacking play', 'blaine', {
    q: p('Magmar', 126), r: p('Arcanine', 59), b: p('Ninetales', 38), n: p('Rapidash', 78), p: p('Vulpix', 37)
  }, BOT_CONFIGS.blaine),

  createTrainer('giovanni', 'Giovanni', 2100, 'Endgame mastery', 'giovanni', {
    q: p('Nidoking', 34), r: p('Rhydon', 112), b: p('Nidoqueen', 31), n: p('Dugtrio', 51), p: p('Rhyhorn', 111)
  }, BOT_CONFIGS.giovanni),

  createTrainer('rival', 'Elite Rival', 2500, 'Balanced, ruthless', 'ash', {
    q: p('Pikachu', 25), r: p('Charizard', 6), b: p('Greninja', 658), n: p('Sceptile', 254), p: p('Bulbasaur', 1)
  }, BOT_CONFIGS.rival),

  createTrainer('champion', 'Champion', 3000, 'Legendary', 'red', {
  }, BOT_CONFIGS.champion),
];

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
    { name: "Sun", sprite: "elio" },
    { name: "Moon", sprite: "selene" },
    { name: "Ash", sprite: "ash" },
    { name: "Gary", sprite: "blue-gen1" },
];

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
  CLICK: 'https://assets-wig9hblnbo.edgeone.app/click.mp3', 
  MOVE: 'https://assets.mixkit.co/active_storage/sfx/2042/2042-preview.mp3', 
  CHECK: 'http://assets-wig9hblnbo.edgeone.app/check.mp3', 
  BGM_MENU: 'https://assets-wig9hblnbo.edgeone.app/bgm.mp3', 
  BGM_ENCOUNTER: 'https://assets-wig9hblnbo.edgeone.app/encounter.mp3',
  CAPTURE: 'https://assets-wig9hblnbo.edgeone.app/capture.mp3',
  VICTORY: 'https://assets-wig9hblnbo.edgeone.app/victory.mp3',
  EVOLVE: 'https://assets-wig9hblnbo.edgeone.app/evolution.mp3'
};
