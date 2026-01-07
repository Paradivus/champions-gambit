
import { StockfishConfig } from '../types';

export const BOT_CONFIGS: Record<string, StockfishConfig> = {
  brock: {
    nodes: 200,
    skillLevel: 0,
  },
  misty: {
    nodes: 800,
    skillLevel: 1,
  },
  surge: {
    nodes: 2500,
    skillLevel: 2,
  },
  erika: {
    depth: 3,
    skillLevel: 3,
    moveTime: 400,
  },
  koga: {
    depth: 4,
    skillLevel: 4,
    moveTime: 600,
  },
  sabrina: {
    uciElo: 1400,
    depth: 6,
    moveTime: 800,
  },
  blaine: {
    uciElo: 1700,
    depth: 8,
    moveTime: 1000,
  },
  giovanni: {
    uciElo: 2000,
    depth: 10,
    moveTime: 1200,
  },
  rival: {
    uciElo: 2400,
    depth: 14,
    moveTime: 1800,
  },
  champion: {
    uciElo: 2850,
    depth: 18,
    moveTime: 2500,
  },
};
