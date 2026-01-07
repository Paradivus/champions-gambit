
import { StockfishConfig } from "../types";

const STOCKFISH_URL = 'https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.0/stockfish.js';

class Engine {
  private worker: Worker | null = null;
  private isReady: boolean = false;
  private onMove: (from: string, to: string, promotion?: string) => void;
  private messageQueue: string[] = [];

  constructor(onMove: (from: string, to: string, promotion?: string) => void) {
    this.onMove = onMove;
  }

  async init() {
    try {
      const response = await fetch(STOCKFISH_URL);
      if (!response.ok) throw new Error("Network response was not ok");
      const scriptContent = await response.text();
      const blob = new Blob([scriptContent], { type: 'application/javascript' });
      const url = URL.createObjectURL(blob);
      
      this.worker = new Worker(url);

      this.worker.onmessage = (e) => {
        const msg = e.data;
        if (msg === 'uciok') {
          this.isReady = true;
          this.processQueue();
        } else if (msg === 'readyok') {
            this.isReady = true;
        } else if (msg.startsWith('bestmove')) {
          const moveData = msg.split(' ')[1];
          if (moveData && moveData !== '(none)') {
            const from = moveData.substring(0, 2);
            const to = moveData.substring(2, 4);
            const promotion = moveData.length > 4 ? moveData.substring(4, 5) : undefined;
            this.onMove(from, to, promotion);
          }
        }
      };

      this.postMessage('uci');
      setTimeout(() => {
          if (!this.isReady) {
              this.postMessage('isready');
          }
      }, 1000);
    } catch (err) {
      console.error("Failed to load Stockfish", err);
    }
  }

  private postMessage(msg: string) {
      if (this.worker) {
          this.worker.postMessage(msg);
      } else {
          this.messageQueue.push(msg);
      }
  }

  private processQueue() {
      if (!this.worker || !this.isReady) return;
      
      while (this.messageQueue.length > 0) {
          const msg = this.messageQueue.shift();
          if (msg) this.worker.postMessage(msg);
      }
  }

  configure(config: StockfishConfig) {
    this.postMessage('ucinewgame');
    
    if (config.uciElo) {
        this.postMessage('setoption name UCI_LimitStrength value true');
        this.postMessage(`setoption name UCI_Elo value ${config.uciElo}`);
    } else {
        this.postMessage('setoption name UCI_LimitStrength value false');
        if (config.skillLevel !== undefined) {
             this.postMessage(`setoption name Skill Level value ${config.skillLevel}`);
        }
    }
    
    this.postMessage('isready');
  }

  evaluate(fen: string, config: StockfishConfig) {
    this.postMessage(`position fen ${fen}`);
    
    if (config.nodes) {
         this.postMessage(`go nodes ${config.nodes}`);
    } else if (config.depth) {
         this.postMessage(`go depth ${config.depth}`);
    } else {
         this.postMessage(`go movetime ${config.moveTime || 1000}`);
    }
  }

  terminate() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
      this.isReady = false;
      this.messageQueue = [];
    }
  }
}

export default Engine;
