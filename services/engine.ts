import { StockfishConfig } from "../types";

// Public CDN for Stockfish.js (WASM based if supported, or asm.js fallback)
const STOCKFISH_URL = 'https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.0/stockfish.js';

class Engine {
  private worker: Worker | null = null;
  private isReady: boolean = false;
  private onMove: (from: string, to: string, promotion?: string) => void;

  constructor(onMove: (from: string, to: string, promotion?: string) => void) {
    this.onMove = onMove;
  }

  async init() {
    try {
      // Create a blob to load the external script to avoid strict CORS issues sometimes seen with direct worker creation
      const response = await fetch(STOCKFISH_URL);
      const scriptContent = await response.text();
      const blob = new Blob([scriptContent], { type: 'application/javascript' });
      const url = URL.createObjectURL(blob);
      
      this.worker = new Worker(url);

      this.worker.onmessage = (e) => {
        const msg = e.data;
        if (msg === 'uciok') {
          this.isReady = true;
        } else if (msg.startsWith('bestmove')) {
          // Format: bestmove e2e4 ponder ...
          const moveData = msg.split(' ')[1];
          if (moveData) {
            const from = moveData.substring(0, 2);
            const to = moveData.substring(2, 4);
            const promotion = moveData.length > 4 ? moveData.substring(4, 5) : undefined;
            this.onMove(from, to, promotion);
          }
        }
      };

      this.worker.postMessage('uci');
      this.worker.postMessage('isready');
    } catch (err) {
      console.error("Failed to load Stockfish", err);
    }
  }

  configure(config: StockfishConfig) {
    if (!this.worker) return;
    
    // Set Skill Level
    this.worker.postMessage(`setoption name Skill Level value ${config.skillLevel}`);
    // Clear hash to avoid using memory from previous games
    this.worker.postMessage('ucinewgame');
    this.worker.postMessage('isready');
  }

  evaluate(fen: string, config: StockfishConfig) {
    if (!this.worker || !this.isReady) return;

    this.worker.postMessage(`position fen ${fen}`);
    
    const depthParam = config.depth ? `depth ${config.depth}` : '';
    const timeParam = config.moveTime ? `movetime ${config.moveTime}` : '';
    
    // If specific depth is set use it, otherwise use time
    if (config.depth) {
       this.worker.postMessage(`go ${depthParam}`);
    } else {
       this.worker.postMessage(`go ${timeParam}`);
    }
  }

  terminate() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }
}

export default Engine;
