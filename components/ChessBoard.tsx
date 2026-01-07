
import React, { useEffect, useRef, useState, useMemo, forwardRef, useImperativeHandle } from 'react';
import { Chess, Square, Move } from 'chess.js';
import { Lineup, PlayerColor, Trainer, GameMode } from '../types';
import { AudioManager } from '../services/audio';
import Engine from '../services/engine';

export interface ChessBoardRef {
    undo: () => void;
    redo: () => void;
}

interface BoardProps {
  mode: GameMode;
  userColor: PlayerColor;
  trainer?: Trainer;
  onGameOver: (winner: PlayerColor | 'draw', pgn: string) => void;
  onTurnChange?: (turn: PlayerColor) => void;
  onHistoryChange?: (canUndo: boolean, canRedo: boolean) => void;
  onBoardUpdate?: (history: string[]) => void;
  redLineup: Lineup;
  blueLineup: Lineup;
}

interface Arrow {
  from: Square;
  to: Square;
}

interface BoardEffect {
    id: number;
    square: Square;
    type: 'capture' | 'evolve';
    imageUrl?: string;
}

export const ChessBoard = forwardRef<ChessBoardRef, BoardProps>(({ 
  mode, 
  userColor, 
  trainer, 
  onGameOver,
  onTurnChange,
  onHistoryChange,
  onBoardUpdate,
  redLineup,
  blueLineup
}, ref) => {
  const [game, setGame] = useState(new Chess());
  const gameRef = useRef(game);
  
  const [redoStack, setRedoStack] = useState<Move[]>([]);

  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [validMoves, setValidMoves] = useState<string[]>([]);
  const [lastMove, setLastMove] = useState<Move | null>(null);
  const [promotionPending, setPromotionPending] = useState<{from: Square, to: Square} | null>(null);
  
  const [arrows, setArrows] = useState<Arrow[]>([]);
  const [drawingArrow, setDrawingArrow] = useState<Square | null>(null);
  const [markedSquares, setMarkedSquares] = useState<Square[]>([]);

  const [effects, setEffects] = useState<BoardEffect[]>([]);

  const gameOverHandled = useRef(false);

  const engineRef = useRef<Engine | null>(null);
  
  useEffect(() => {
    gameRef.current = game;
    if (onTurnChange) {
        onTurnChange(game.turn() as PlayerColor);
    }
    
    if (onHistoryChange) {
        const canUndo = mode === GameMode.COMPUTER 
            ? (game.turn() === userColor && game.history().length >= 2) 
            : game.history().length > 0;
        const canRedo = redoStack.length > 0;
        onHistoryChange(canUndo, canRedo);
    }

    if (onBoardUpdate) {
        onBoardUpdate(game.history());
    }

  }, [game, redoStack, onTurnChange, onHistoryChange, onBoardUpdate, mode, userColor]);

  useEffect(() => {
    if (game.inCheck() && !game.isGameOver()) {
        AudioManager.getInstance().playCheckSound();
    } else {
        AudioManager.getInstance().stopCheckSound();
    }
  }, [game]); 
  
  useEffect(() => {
    return () => {
        AudioManager.getInstance().stopCheckSound();
    };
  }, []);

  const isFlipped = useMemo(() => {
    if (mode === GameMode.PASS_AND_PLAY) {
      return game.turn() === 'b';
    }
    return userColor === PlayerColor.BLACK;
  }, [mode, userColor, game.turn()]);

  useEffect(() => {
    if (mode === GameMode.COMPUTER && trainer) {
      const engine = new Engine((from, to, promotion) => {
        makeMove(from as Square, to as Square, promotion);
      });
      engine.init().then(() => {
        engine.configure(trainer.aiConfig);
        if (gameRef.current.turn() !== userColor) {
             setTimeout(() => {
                 engine.evaluate(gameRef.current.fen(), trainer.aiConfig);
             }, 1000);
        }
      });
      engineRef.current = engine;
      
      return () => {
        engine.terminate();
      };
    }
  }, [mode, trainer]); 

  useEffect(() => {
    if (mode === GameMode.COMPUTER && !game.isGameOver()) {
      const isUserTurn = game.turn() === userColor;
      if (!isUserTurn && engineRef.current) {
        const timer = setTimeout(() => {
          engineRef.current?.evaluate(game.fen(), trainer!.aiConfig);
        }, 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [game, mode, userColor, trainer]);

  useEffect(() => {
    if (game.isGameOver()) {
      if (gameOverHandled.current) return;
      gameOverHandled.current = true;

      AudioManager.getInstance().stopMusic();
      AudioManager.getInstance().stopCheckSound();
      
      setTimeout(() => AudioManager.getInstance().playSfx('VICTORY'), 100);
      
      const pgn = game.pgn();
      
      if (game.isCheckmate()) {
        const winner = game.turn() === 'w' ? PlayerColor.BLACK : PlayerColor.WHITE;
        onGameOver(winner, pgn);
      } else {
        onGameOver('draw', pgn);
      }
    } else {
        gameOverHandled.current = false;
    }
  }, [game, onGameOver]);

  const getAsset = (pieceType: string, pieceColor: string) => {
     const lineup = pieceColor === 'w' ? redLineup : blueLineup;
     return lineup[pieceType as keyof Lineup];
  }

  const triggerEffect = (square: Square, type: 'capture' | 'evolve', imageUrl?: string) => {
      const id = Date.now() + Math.random();
      setEffects(prev => [...prev, { id, square, type, imageUrl }]);
      
      setTimeout(() => {
          setEffects(prev => prev.filter(e => e.id !== id));
      }, 1200); 
  };

  const cloneGameWithHistory = (sourceGame: Chess) => {
      const newGame = new Chess();
      newGame.loadPgn(sourceGame.pgn());
      return newGame;
  };

  const handleUndo = () => {
      if (game.history().length === 0) return;

      const tempGame = cloneGameWithHistory(game);
      
      if (mode === GameMode.PASS_AND_PLAY) {
          const undoneMove = tempGame.undo();
          if (undoneMove) {
              setRedoStack(prev => [...prev, undoneMove]);
              setGame(tempGame);
              setLastMove(tempGame.history({ verbose: true }).pop() || null);
              AudioManager.getInstance().playSfx('MOVE');
          }
      } 
      else if (mode === GameMode.COMPUTER) {
          if (game.turn() === userColor) {
               const aiMove = tempGame.undo();
               const userMove = tempGame.undo();
               
               if (aiMove && userMove) {
                   setRedoStack(prev => [...prev, aiMove, userMove]); 
                   setGame(tempGame);
                   setLastMove(tempGame.history({ verbose: true }).pop() || null);
                   AudioManager.getInstance().playSfx('MOVE');
               }
          }
      }
  };

  const handleRedo = () => {
      if (redoStack.length === 0) return;

      const tempGame = cloneGameWithHistory(game);
      const movesToRedo = [...redoStack];
      
      if (mode === GameMode.PASS_AND_PLAY) {
          const move = movesToRedo.pop();
          if (move) {
              tempGame.move(move);
              setRedoStack(movesToRedo);
              setGame(tempGame);
              setLastMove(move);
              AudioManager.getInstance().playSfx('MOVE');
          }
      }
      else if (mode === GameMode.COMPUTER) {
          const userMove = movesToRedo.pop();
          const aiMove = movesToRedo.pop();
          
          if (userMove) {
              tempGame.move(userMove);
              if (aiMove) tempGame.move(aiMove);
              
              setRedoStack(movesToRedo);
              setGame(tempGame);
              setLastMove(aiMove || userMove);
              AudioManager.getInstance().playSfx('MOVE');
          }
      }
  };

  useImperativeHandle(ref, () => ({
    undo: handleUndo,
    redo: handleRedo
  }));

  const makeMove = (from: Square, to: Square, promotion?: string) => {
    try {
      const tempGame = cloneGameWithHistory(gameRef.current);

      const targetPiece = gameRef.current.get(to); 
      
      const moveConfig: any = { from, to };
      if (promotion) moveConfig.promotion = promotion;
      
      const verboseMove = gameRef.current.moves({ verbose: true }).find(m => m.from === from && m.to === to && m.promotion === promotion);
      const isEnPassant = verboseMove?.flags.includes('e');
      
      let capturedAssetUrl: string | undefined = undefined;

      if (targetPiece) {
          const asset = getAsset(targetPiece.type, targetPiece.color);
          capturedAssetUrl = asset.imgUrl;
      } else if (isEnPassant) {
          const capturedColor = gameRef.current.turn() === 'w' ? 'b' : 'w';
          const asset = getAsset('p', capturedColor);
          capturedAssetUrl = asset.imgUrl;
      }

      const result = tempGame.move(moveConfig);
      
      if (result) {
        setGame(tempGame);
        setLastMove(result);
        setSelectedSquare(null);
        setValidMoves([]);
        setPromotionPending(null);
        setArrows([]); 
        setMarkedSquares([]);
        
        setRedoStack([]);
        
        if (result.captured) {
            if (capturedAssetUrl) {
                triggerEffect(to, 'capture', capturedAssetUrl);
            }
            AudioManager.getInstance().playSfx('CAPTURE');
        } else {
            AudioManager.getInstance().playSfx('MOVE');
        }

        if (result.promotion) {
            triggerEffect(to, 'evolve');
            AudioManager.getInstance().playSfx('EVOLVE');
        }
      }
    } catch (e) {
      console.error("Invalid move attempt:", {from, to, promotion}, e);
    }
  };

  const handleSquareInteraction = (square: Square, isDragDrop = false) => {
    if (promotionPending) return;
    if (game.isGameOver()) return;
    if (mode === GameMode.COMPUTER && game.turn() !== userColor) return;

    if (arrows.length > 0 || markedSquares.length > 0) {
        setArrows([]);
        setMarkedSquares([]);
    }

    if (selectedSquare && validMoves.includes(square)) {
        const verboseMoves = game.moves({ verbose: true });
        const move = verboseMoves.find(m => m.from === selectedSquare && m.to === square);
        
        if (move && (move.flags.includes('p') || move.promotion)) {
            setPromotionPending({ from: selectedSquare, to: square });
        } else {
            makeMove(selectedSquare, square);
        }
        return;
    }

    const piece = game.get(square);
    if (piece && piece.color === game.turn()) {
        setSelectedSquare(square);
        const moves = game.moves({ square, verbose: true }).map(m => m.to);
        setValidMoves(moves);
    } else {
        setSelectedSquare(null);
        setValidMoves([]);
    }
  };

  const onDragStart = (e: React.DragEvent, square: Square) => {
    if (mode === GameMode.COMPUTER && game.turn() !== userColor) {
        e.preventDefault();
        return;
    }
    const piece = game.get(square);
    if (!piece || piece.color !== game.turn()) {
        e.preventDefault();
        return;
    }
    setSelectedSquare(square);
    const moves = game.moves({ square, verbose: true }).map(m => m.to);
    setValidMoves(moves);
    
    e.dataTransfer.setData("text/plain", square);
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const onDrop = (e: React.DragEvent, targetSquare: Square) => {
    e.preventDefault();
    const sourceSquare = e.dataTransfer.getData("text/plain") as Square;
    
    if (sourceSquare !== targetSquare) {
       handleSquareInteraction(targetSquare, true);
    }
  };

  const onRightClickDown = (e: React.MouseEvent, square: Square) => {
    if (e.button === 2) {
        setDrawingArrow(square);
    }
  };
  
  const onRightClickUp = (e: React.MouseEvent, square: Square) => {
    if (e.button === 2 && drawingArrow) {
        if (drawingArrow === square) {
             setMarkedSquares(prev => {
                if (prev.includes(square)) return prev.filter(s => s !== square);
                return [...prev, square];
             });
             setDrawingArrow(null);
        } else {
             setArrows(prev => {
                const exists = prev.find(a => a.from === drawingArrow && a.to === square);
                if (exists) return prev.filter(a => a !== exists);
                return [...prev, { from: drawingArrow, to: square }];
             });
             setDrawingArrow(null);
        }
    }
  };

  const board = game.board();

  const renderArrows = () => {
    return (
        <svg className="arrow-layer w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
             {arrows.map((arrow, i) => {
                 const x1 = (arrow.from.charCodeAt(0) - 97) * 12.5 + 6.25;
                 const y1 = (8 - parseInt(arrow.from[1])) * 12.5 + 6.25;
                 const x2 = (arrow.to.charCodeAt(0) - 97) * 12.5 + 6.25;
                 const y2 = (8 - parseInt(arrow.to[1])) * 12.5 + 6.25;

                 return (
                     <line 
                        key={i} 
                        x1={x1} y1={y1} x2={x2} y2={y2} 
                        stroke="rgba(255, 165, 0, 0.6)" 
                        strokeWidth="1.5" 
                        markerEnd="url(#arrowhead)"
                     />
                 );
             })}
             <defs>
                <marker id="arrowhead" markerWidth="4" markerHeight="4" refX="2" refY="2" orient="auto">
                    <polygon points="0 0, 4 2, 0 4" fill="rgba(255, 165, 0, 0.6)" />
                </marker>
             </defs>
        </svg>
    )
  };

  const renderSquare = (rowIdx: number, colIdx: number, piece: { type: string, color: string } | null) => {
    const isDark = (rowIdx + colIdx) % 2 === 1;
    const file = String.fromCharCode(97 + colIdx); 
    const rank = 8 - rowIdx; 
    const squareId = `${file}${rank}` as Square;
    
    const isSelected = selectedSquare === squareId;
    const isLastMoveFrom = lastMove?.from === squareId;
    const isLastMoveTo = lastMove?.to === squareId;
    const isValidMove = validMoves.includes(squareId);
    const isMarked = markedSquares.includes(squareId);
    
    const bgColor = isDark ? 'bg-board-dark' : 'bg-board-light';
    let overlayClass = '';
    
    if (isSelected) overlayClass = 'bg-poke-yellow/60';
    else if (isLastMoveFrom || isLastMoveTo) overlayClass = 'bg-poke-yellow/40';
    
    const pokemonAsset = piece ? getAsset(piece.type, piece.color) : null;
    const isPawn = piece?.type === 'p';

    const tintStyle = piece?.color === 'w' 
        ? { filter: 'sepia(0.3) hue-rotate(-50deg) saturate(1.5) drop-shadow(0 4px 2px rgba(0,0,0,0.3))' } 
        : { filter: 'sepia(0.3) hue-rotate(180deg) saturate(1.5) drop-shadow(0 4px 2px rgba(0,0,0,0.3))' };

    const activeEvolve = effects.find(e => e.square === squareId && e.type === 'evolve');
    const activeCapture = effects.find(e => e.square === squareId && e.type === 'capture');

    return (
      <div 
        key={squareId}
        onMouseDown={(e) => {
            if (e.button === 2) onRightClickDown(e, squareId);
            else handleSquareInteraction(squareId);
        }}
        onMouseUp={(e) => {
            if (e.button === 2) onRightClickUp(e, squareId);
        }}
        onContextMenu={(e) => e.preventDefault()}
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, squareId)}
        className={`w-full h-full relative ${bgColor} flex items-center justify-center select-none overflow-hidden`}
      >
        {!isFlipped && colIdx === 0 && <span className={`absolute top-0.5 left-0.5 text-[6px] md:text-[9px] font-sans font-bold ${isDark ? 'text-board-light' : 'text-board-dark'}`}>{rank}</span>}
        {!isFlipped && rowIdx === 7 && <span className={`absolute bottom-0.5 right-0.5 text-[6px] md:text-[9px] font-sans font-bold ${isDark ? 'text-board-light' : 'text-board-dark'}`}>{file}</span>}
        
        <div className={`absolute inset-0 transition-colors ${overlayClass}`} />

        {isMarked && <div className="absolute inset-0 bg-red-500/50" />}
        {isValidMove && !piece && <div className="absolute w-2 h-2 md:w-3 md:h-3 bg-black/20 rounded-full" />}
        {isValidMove && piece && <div className="absolute inset-0 border-4 border-black/20 rounded-sm" />}
        
        {piece && pokemonAsset && (
            <div 
                draggable={!game.isGameOver()}
                onDragStart={(e) => onDragStart(e, squareId)}
                className={`relative transition-transform duration-200 transform cursor-grab active:cursor-grabbing 
                    ${isPawn ? 'w-full h-full scale-125' : 'w-[95%] h-[95%]'}
                    ${isSelected ? '-translate-y-1' : ''} 
                    ${isFlipped ? 'rotate-180' : ''} 
                    hover:scale-105
                    ${activeEvolve ? 'animate-evolve-flash' : ''}`}
            >
                <img 
                    src={pokemonAsset.imgUrl} 
                    alt={pokemonAsset.name}
                    className="w-full h-full object-contain pointer-events-none" 
                    style={tintStyle}
                    loading="lazy"
                />
            </div>
        )}

        {activeCapture && activeCapture.imageUrl && (
            <div className="absolute inset-0 z-30 pointer-events-none animate-capture">
                 <img 
                    src={activeCapture.imageUrl} 
                    className="w-full h-full object-contain" 
                 />
            </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full h-full items-center justify-center">
        <div className="relative w-full aspect-square bg-gray-900 p-1 md:p-4 rounded-lg shadow-2xl border-4 border-gray-700 max-h-full">
            <div 
                className="w-full h-full relative" 
                onContextMenu={(e) => e.preventDefault()}
                style={{ 
                    transform: isFlipped ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.6s ease-in-out'
                }}
            >
                <div className="w-full h-full grid grid-rows-8 grid-cols-8 border-2 border-gray-800 relative z-10">
                    {board.map((row, rowIdx) => 
                        row.map((piece, colIdx) => renderSquare(rowIdx, colIdx, piece))
                    )}
                </div>
                
                <div className="absolute inset-0 pointer-events-none z-20">
                    {renderArrows()}
                </div>
            </div>

            {promotionPending && (
                <div className="absolute inset-0 z-50 bg-black/80 flex flex-col items-center justify-center animate-fade-in rounded-lg">
                    <h3 className="text-white font-retro text-sm md:text-lg mb-4 text-center animate-pulse">EVOLUTION REQUIRED</h3>
                    <div className="flex gap-4">
                        {['q', 'r', 'b', 'n'].map((type) => {
                            const asset = getAsset(type, game.turn());
                            return (
                                <button 
                                    key={type}
                                    onClick={() => {
                                        makeMove(promotionPending.from, promotionPending.to, type);
                                    }}
                                    className="bg-gray-800 border-2 border-white hover:border-poke-yellow p-2 md:p-4 rounded flex flex-col items-center transition-all hover:scale-125 animate-evolve"
                                >
                                    <div className="w-10 h-10 md:w-16 md:h-16 mb-2">
                                        <img src={asset.imgUrl} alt={asset.name} className="w-full h-full object-contain" />
                                    </div>
                                    <span className="text-[8px] md:text-[10px] text-white font-retro">{asset.name}</span>
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    </div>
  );
});
ChessBoard.displayName = 'ChessBoard';
