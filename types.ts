
export enum AppState {
  INTRO = 'INTRO',
  MENU = 'MENU',
  MODE_SELECT = 'MODE_SELECT',
  SIDE_SELECT = 'SIDE_SELECT',
  TRAINER_SELECT = 'TRAINER_SELECT',
  TRANSITION = 'TRANSITION',
  GAME = 'GAME',
}

export enum GameMode {
  PASS_AND_PLAY = 'PASS_AND_PLAY',
  COMPUTER = 'COMPUTER',
}

export enum PlayerColor {
  WHITE = 'w',
  BLACK = 'b',
}

export interface PokemonMapping {
  name: string;
  imgUrl: string; 
  id?: number | string; 
}

export interface Lineup {
  k: PokemonMapping;
  q: PokemonMapping;
  r: PokemonMapping;
  b: PokemonMapping;
  n: PokemonMapping;
  p: PokemonMapping;
}

export interface StockfishConfig {
  skillLevel?: number;
  uciElo?: number;
  nodes?: number;
  moveTime?: number;
  depth?: number;
}

export interface Trainer {
  id: string;
  name: string;
  difficultyLabel: string; 
  elo: number; 
  theme: string;
  imgUrl: string;
  lineup: Lineup;
  aiConfig: StockfishConfig;
}

export interface AppSettings {
  redName: string;
  blueName: string;
  customRedLineup: Partial<{ [key in keyof Lineup]: number | string }>; 
  customBlueLineup: Partial<{ [key in keyof Lineup]: number | string }>;
}

export interface AudioSettings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  muted: boolean;
}

export interface Move {
  from: string;
  to: string;
  promotion?: string;
}
