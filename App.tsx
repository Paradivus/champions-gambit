
import React, { useState, useEffect, useRef } from 'react';
import { IntroSequence } from './components/IntroSequence';
import { ChessBoard, ChessBoardRef } from './components/ChessBoard';
import { AppState, GameMode, PlayerColor, Trainer, AudioSettings, AppSettings, Lineup } from './types';
import { 
    TRAINERS, 
    p, 
    SOUNDS, 
    POKEMON_NAMES_GEN1, 
    RED_LINEUP, 
    BLUE_LINEUP, 
    getTrainerSprite, 
    ASSETS, 
    PLAYER_AVATARS 
} from './constants';
import { AudioManager } from './services/audio';
import { 
    SpeakerWaveIcon, 
    SpeakerXMarkIcon, 
    Cog6ToothIcon, 
    ArrowRightOnRectangleIcon,
    ArrowLeftIcon,
    XMarkIcon,
    ArrowDownTrayIcon,
    ArrowUturnLeftIcon, 
    ArrowUturnRightIcon
} from '@heroicons/react/24/solid';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.INTRO);
  const [gameMode, setGameMode] = useState<GameMode>(GameMode.PASS_AND_PLAY);
  const [userColor, setUserColor] = useState<PlayerColor>(PlayerColor.WHITE);
  const [currentTurn, setCurrentTurn] = useState<PlayerColor>(PlayerColor.WHITE);
  
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | undefined>(undefined);
  const [winner, setWinner] = useState<PlayerColor | 'draw' | null>(null);
  const [gamePgn, setGamePgn] = useState<string>('');
  
  const boardRef = useRef<ChessBoardRef>(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);

  const [audioSettings, setAudioSettings] = useState<AudioSettings>({ 
    muted: false, 
    masterVolume: 0.5, 
    musicVolume: 0.5, 
    sfxVolume: 0.5 
  });
  const [showSettings, setShowSettings] = useState(false);
  
  const [appSettings, setAppSettings] = useState<AppSettings>({
    redName: 'RED',
    blueName: 'BLUE',
    customRedLineup: {},
    customBlueLineup: {}
  });

  const [editingLineupColor, setEditingLineupColor] = useState<PlayerColor | null>(null);
  const [editingPieceKey, setEditingPieceKey] = useState<keyof Lineup | null>(null);

  useEffect(() => {
    const unlockAudio = () => AudioManager.getInstance().resumeContext();
    window.addEventListener('click', unlockAudio);
    window.addEventListener('keydown', unlockAudio);
    return () => {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
  }, []);

  useEffect(() => {
    AudioManager.getInstance().updateSettings(audioSettings);
    AudioManager.getInstance().playMusic(SOUNDS.BGM_MENU);
  }, []); 

  useEffect(() => {
    AudioManager.getInstance().updateSettings(audioSettings);
  }, [audioSettings]);

  useEffect(() => {
    if (logEndRef.current) {
        logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [moveHistory]);

  const toggleMute = () => {
    setAudioSettings(prev => ({ ...prev, muted: !prev.muted }));
  };

  const handleExit = () => {
    setAppState(AppState.MENU);
    setWinner(null);
    setGamePgn('');
    setMoveHistory([]);
    setSelectedTrainer(undefined);
    AudioManager.getInstance().playSfx('CLICK');
    AudioManager.getInstance().playMusic(SOUNDS.BGM_MENU);
  };

  const startGameTransition = () => {
      setCurrentTurn(PlayerColor.WHITE);
      setMoveHistory([]);
      AudioManager.getInstance().playMusic(SOUNDS.BGM_ENCOUNTER, true);
      setAppState(AppState.TRANSITION);

      setTimeout(() => {
          setAppState(curr => curr === AppState.TRANSITION ? AppState.GAME : curr);
      }, 3000);
  };

  const getCustomizedLineup = (baseLineup: Lineup, overrides: Partial<{ [key in keyof Lineup]: number | string }>) => {
     const newLineup = { ...baseLineup };
     (Object.keys(overrides) as Array<keyof Lineup>).forEach(key => {
         const val = overrides[key];
         if (val) {
             if (typeof val === 'number') {
                 const name = POKEMON_NAMES_GEN1[val - 1] || `Poke #${val}`;
                 newLineup[key] = p(name, val);
             } else {
                 const avatar = PLAYER_AVATARS.find(a => a.sprite === val);
                 const name = avatar ? avatar.name : val;
                 newLineup[key] = {
                     name: name,
                     imgUrl: getTrainerSprite(val),
                     id: val
                 };
             }
         }
     });
     return newLineup;
  };
  
  const handleDownloadPgn = () => {
    if (!gamePgn) return;
    const blob = new Blob([gamePgn], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `champions-gambit-${new Date().toISOString().split('T')[0]}.pgn`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  let redLineup = getCustomizedLineup(RED_LINEUP, appSettings.customRedLineup);
  let blueLineup = getCustomizedLineup(BLUE_LINEUP, appSettings.customBlueLineup);

  if (gameMode === GameMode.COMPUTER && selectedTrainer) {
      let trainerLineup = { ...selectedTrainer.lineup };
      
      if (selectedTrainer.id === 'champion') {
         const kingSprite = userColor === PlayerColor.WHITE ? 'blue' : 'red';
         const kingName = userColor === PlayerColor.WHITE ? 'Blue' : 'Red';
         trainerLineup.k = { name: kingName, imgUrl: getTrainerSprite(kingSprite), id: 0 };
      }

      if (userColor === PlayerColor.WHITE) {
          blueLineup = trainerLineup;
      } else {
          redLineup = trainerLineup;
      }
  }

  const getUserSprite = () => {
      const customKing = userColor === PlayerColor.WHITE ? appSettings.customRedLineup.k : appSettings.customBlueLineup.k;
      if (typeof customKing === 'string') return getTrainerSprite(customKing);
      return getTrainerSprite(userColor === PlayerColor.WHITE ? 'red' : 'blue');
  }

  const getOpponentSprite = () => {
      if (gameMode === GameMode.COMPUTER && selectedTrainer) {
        if (selectedTrainer.id === 'champion') {
            return getTrainerSprite(userColor === PlayerColor.WHITE ? 'blue' : 'red');
        }
        return selectedTrainer.imgUrl;
      }
      const customKing = appSettings.customBlueLineup.k;
      if (typeof customKing === 'string') return getTrainerSprite(customKing);
      return getTrainerSprite('blue');
  }

  const isFlipped = gameMode === GameMode.PASS_AND_PLAY 
        ? currentTurn === PlayerColor.BLACK
        : userColor === PlayerColor.BLACK;

  const getPlayerDisplayInfo = (position: 'top' | 'bottom') => {
      
      const isTopPosition = position === 'top';
      const isBottomPosition = position === 'bottom';
      
      let targetColor: PlayerColor;
      
      if (isFlipped) {
          targetColor = isTopPosition ? PlayerColor.WHITE : PlayerColor.BLACK;
      } else {
          targetColor = isTopPosition ? PlayerColor.BLACK : PlayerColor.WHITE;
      }
      
      const isRedTeam = targetColor === PlayerColor.WHITE;

      if (gameMode === GameMode.COMPUTER && selectedTrainer) {
          const isUser = targetColor === userColor;
          
          if (isUser) {
               return {
                 name: userColor === PlayerColor.WHITE ? appSettings.redName : appSettings.blueName,
                 avatar: getUserSprite(),
                 teamColor: userColor === PlayerColor.WHITE ? 'red' : 'blue',
                 isActive: currentTurn === userColor
               };
          } else {
               let avatar = selectedTrainer.imgUrl;
               if (selectedTrainer.id === 'champion') {
                    avatar = getTrainerSprite(userColor === PlayerColor.WHITE ? 'blue' : 'red');
               }
               return {
                   name: selectedTrainer.name,
                   avatar,
                   teamColor: userColor === PlayerColor.WHITE ? 'blue' : 'red',
                   isActive: currentTurn !== userColor
               }
          }
      }

      if (isRedTeam) {
          return {
              name: appSettings.redName,
              avatar: redLineup.k.imgUrl,
              teamColor: 'red',
              isActive: currentTurn === PlayerColor.WHITE
          };
      } else {
          return {
              name: appSettings.blueName,
              avatar: blueLineup.k.imgUrl,
              teamColor: 'blue',
              isActive: currentTurn === PlayerColor.BLACK
          };
      }
  };

  if (appState === AppState.INTRO) {
    return <IntroSequence onComplete={() => setAppState(AppState.MENU)} />;
  }

  const renderSettingsModal = () => {
     const isRedTab = editingLineupColor !== PlayerColor.BLACK;
      
      if (editingPieceKey && editingLineupColor) {
          return (
            <div className="fixed inset-0 z-[60] bg-black/95 flex flex-col items-center justify-center p-4">
                 <div className="w-full max-w-4xl h-full flex flex-col">
                    <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
                        <h3 className="text-white font-retro text-sm md:text-lg">
                            SELECT {isRedTab ? 'RED' : 'BLUE'} {editingPieceKey.toUpperCase()}
                        </h3>
                        <button onClick={() => { setEditingPieceKey(null); setEditingLineupColor(null); }} className="text-gray-400 hover:text-white">
                            <XMarkIcon className="w-8 h-8"/>
                        </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto min-h-0 scrollbar-thin bg-gray-900/50 rounded p-2">
                        {editingPieceKey === 'k' ? (
                            <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">
                                {PLAYER_AVATARS.map((avatar) => {
                                    const isTeamRestricted = (editingLineupColor === PlayerColor.WHITE) 
                                        ? ['Blue', 'Gary'].includes(avatar.name) 
                                        : ['Red', 'Ash'].includes(avatar.name);

                                    const opponentKingId = editingLineupColor === PlayerColor.WHITE 
                                        ? blueLineup.k.id 
                                        : redLineup.k.id;
                                    
                                    const isUniqueRestricted = avatar.sprite === opponentKingId;

                                    const isRestricted = isTeamRestricted || isUniqueRestricted;
                                    
                                    return (
                                        <button 
                                            key={avatar.sprite}
                                            onClick={() => !isRestricted && handlePieceChange(editingLineupColor!, editingPieceKey!, avatar.sprite)}
                                            disabled={isRestricted}
                                            className={`flex flex-col items-center p-3 rounded border transition-all ${
                                                isRestricted 
                                                    ? 'border-gray-800 opacity-30 grayscale cursor-not-allowed' 
                                                    : 'border-gray-700 hover:bg-gray-800 hover:border-poke-yellow'
                                            }`}
                                        >
                                            <img src={getTrainerSprite(avatar.sprite)} className="w-16 h-16 object-contain mb-2" />
                                            <span className="text-[9px] text-gray-400 font-retro text-center">{avatar.name}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                                {POKEMON_NAMES_GEN1.map((name, idx) => {
                                    const id = idx + 1;
                                    const isUsed = isPokemonUsedGlobal(id);
                                    return (
                                        <button 
                                            key={id}
                                            onClick={() => !isUsed && handlePieceChange(editingLineupColor!, editingPieceKey!, id)}
                                            disabled={isUsed}
                                            className={`flex flex-col items-center p-2 rounded border ${isUsed ? 'opacity-20 border-gray-800' : 'border-gray-700 hover:bg-gray-800 hover:border-poke-yellow'}`}
                                        >
                                            <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`} className="w-12 h-12 object-contain" />
                                            <span className="text-[8px] text-gray-400 font-retro truncate w-full text-center mt-1">{name}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                 </div>
            </div>
          )
      }

      return (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
            <div className="bg-gray-800 border-4 border-white w-full max-w-2xl max-h-[90dvh] flex flex-col relative rounded-sm shadow-2xl">
                <div className="flex justify-between items-center p-6 border-b border-gray-700">
                    <h2 className="text-white font-retro text-xl">SETTINGS</h2>
                    <button onClick={() => setShowSettings(false)} className="text-white hover:text-poke-red">
                        <XMarkIcon className="w-8 h-8" />
                    </button>
                </div>
                
                <div className="overflow-y-auto p-6 space-y-8 scrollbar-thin">
                    <div className="bg-gray-900 p-4 rounded border border-gray-700">
                        <h3 className="text-poke-yellow font-retro text-xs mb-4">AUDIO MIXER</h3>
                        <div className="space-y-4">
                            {[
                                { label: 'MASTER', val: audioSettings.masterVolume, key: 'masterVolume' },
                                { label: 'MUSIC', val: audioSettings.musicVolume, key: 'musicVolume' },
                                { label: 'SFX', val: audioSettings.sfxVolume, key: 'sfxVolume' }
                            ].map((control) => (
                                 <div key={control.label} className="flex items-center gap-4">
                                    <span className="text-white font-retro text-[10px] w-16">{control.label}</span>
                                    <input 
                                        type="range" min="0" max="1" step="0.1" 
                                        value={control.val}
                                        onChange={(e) => setAudioSettings(prev => ({...prev, [control.key]: parseFloat(e.target.value)}))}
                                        className="flex-1 accent-poke-red h-2 rounded-lg appearance-none bg-gray-700 cursor-pointer"
                                    />
                                    <span className="text-gray-400 font-mono text-xs w-8 text-right">{Math.round(control.val * 100)}%</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <div className="flex gap-4 mb-4 border-b border-gray-700">
                             <button 
                                onClick={() => setEditingLineupColor(PlayerColor.WHITE)}
                                className={`flex-1 font-retro text-xs py-2 border-b-2 transition-colors ${!editingLineupColor || editingLineupColor === PlayerColor.WHITE ? 'border-poke-red text-white' : 'border-transparent text-gray-500'}`}
                            >
                                RED TEAM
                            </button>
                             <button 
                                onClick={() => setEditingLineupColor(PlayerColor.BLACK)}
                                className={`flex-1 font-retro text-xs py-2 border-b-2 transition-colors ${editingLineupColor === PlayerColor.BLACK ? 'border-poke-blue text-white' : 'border-transparent text-gray-500'}`}
                            >
                                BLUE TEAM
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="flex flex-col">
                                <label className="text-gray-400 font-retro text-[10px] mb-2">TRAINER NAME</label>
                                <input 
                                    type="text" 
                                    value={(!editingLineupColor || editingLineupColor === PlayerColor.WHITE) ? appSettings.redName : appSettings.blueName}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (!editingLineupColor || editingLineupColor === PlayerColor.WHITE) setAppSettings(prev => ({...prev, redName: val}));
                                        else setAppSettings(prev => ({...prev, blueName: val}));
                                    }}
                                    className="bg-gray-900 text-white p-3 border border-gray-600 font-retro text-xs uppercase focus:border-poke-yellow outline-none rounded"
                                    maxLength={10}
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                {['k','q','r','b','n','p'].map((keyStr) => {
                                    const key = keyStr as keyof Lineup;
                                    const activeColor = editingLineupColor || PlayerColor.WHITE;
                                    const currentLineup = activeColor === PlayerColor.WHITE ? redLineup : blueLineup;
                                    const piece = currentLineup[key];
                                    const labels: Record<string, string> = { k: 'King', q: 'Queen', r: 'Rook', b: 'Bishop', n: 'Knight', p: 'Pawn' };
                                    
                                    return (
                                        <div 
                                            key={key} 
                                            onClick={() => {
                                                setEditingLineupColor(activeColor);
                                                setEditingPieceKey(key);
                                            }}
                                            className="bg-gray-900 p-2 rounded border border-gray-700 hover:border-poke-yellow cursor-pointer flex flex-col items-center group relative overflow-hidden transition-all hover:bg-gray-800"
                                        >
                                            <span className="text-[8px] text-gray-500 font-retro mb-1 uppercase">{labels[key]}</span>
                                            <img src={piece.imgUrl} className="w-10 h-10 object-contain group-hover:scale-110 transition-transform" />
                                            <span className="text-[9px] text-white font-bold mt-1 truncate w-full text-center">{piece.name}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      );
  };

  const handlePieceChange = (color: PlayerColor, pieceKey: keyof Lineup, newId: number | string) => {
      const updater = color === PlayerColor.WHITE 
        ? (val: any) => setAppSettings(p => ({...p, customRedLineup: { ...p.customRedLineup, [pieceKey]: val }}))
        : (val: any) => setAppSettings(p => ({...p, customBlueLineup: { ...p.customBlueLineup, [pieceKey]: val }}));
      
      updater(newId);
      setEditingPieceKey(null);
  };

  const isPokemonUsedGlobal = (id: number | string) => {
      if (typeof id === 'string') return false; 
      
      for (const key of Object.keys(redLineup) as Array<keyof Lineup>) {
          if (editingLineupColor === PlayerColor.WHITE && editingPieceKey === key) continue;
          
          if (redLineup[key].id === id) return true;
      }

      for (const key of Object.keys(blueLineup) as Array<keyof Lineup>) {
          if (editingLineupColor === PlayerColor.BLACK && editingPieceKey === key) continue;
          
          if (blueLineup[key].id === id) return true;
      }
      
      return false;
  };

  if (appState === AppState.MENU) {
    return (
      <div className="h-full w-full bg-gray-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {showSettings && renderSettingsModal()}
        <div className="absolute inset-0 opacity-40 pointer-events-none">
            <div 
                className="w-[140%] h-full absolute top-0 -left-[20%] bg-cover blur-sm"
                style={{ 
                    backgroundImage: `url(${ASSETS.STADIUM_BG})`,
                    animation: 'scroll 60s linear infinite alternate'
                }}
            />
        </div>
        <div className="absolute inset-0 bg-black/40 pointer-events-none" />
        <style>{`@keyframes scroll { 0% { transform: translateX(-5%); } 100% { transform: translateX(5%); } }`}</style>
        
        <div className="z-10 flex flex-col items-center space-y-12 animate-fade-in w-full max-w-md">
           <h1 className="font-retro text-4xl md:text-5xl text-center leading-snug drop-shadow-xl select-none">
            <span className="text-poke-red">CHAMPION'S</span><br />
            <span className="text-poke-blue">GAMBIT</span>
          </h1>
          <button 
            onClick={() => {
                AudioManager.getInstance().playSfx('CLICK');
                setAppState(AppState.MODE_SELECT);
            }}
            className="group relative px-12 py-5 bg-white border-b-4 border-r-4 border-gray-400 active:border-0 active:translate-y-1 transition-all rounded-sm hover:scale-105"
          >
             <span className="font-retro text-xl text-black group-hover:text-poke-red transition-colors">PLAY GAME</span>
          </button>
          <div className="flex space-x-10">
            <button onClick={toggleMute} className="text-gray-400 hover:text-white transition-colors flex flex-col items-center group">
                {audioSettings.muted ? <SpeakerXMarkIcon className="w-8 h-8" /> : <SpeakerWaveIcon className="w-8 h-8" />}
                <span className="text-[10px] font-sans mt-2 opacity-0 group-hover:opacity-100 transition-opacity">Audio</span>
            </button>
            <button onClick={() => setShowSettings(true)} className="text-gray-400 hover:text-white transition-colors flex flex-col items-center group">
                <Cog6ToothIcon className="w-8 h-8" />
                <span className="text-[10px] font-sans mt-2 opacity-0 group-hover:opacity-100 transition-opacity">Config</span>
            </button>
          </div>
          <div className="text-gray-600 font-retro text-[8px] absolute bottom-4">v1.0.0</div>
        </div>
      </div>
    );
  }

  if (appState === AppState.TRANSITION) {
      const p1Info = gameMode === GameMode.PASS_AND_PLAY 
         ? { name: appSettings.redName, avatar: typeof appSettings.customRedLineup.k === 'string' ? getTrainerSprite(appSettings.customRedLineup.k) : getTrainerSprite('red'), color: 'poke-red' }
         : { name: userColor === PlayerColor.WHITE ? appSettings.redName : appSettings.blueName, avatar: getUserSprite(), color: userColor === PlayerColor.WHITE ? 'poke-red' : 'poke-blue' };
         
      const p2Info = gameMode === GameMode.PASS_AND_PLAY
         ? { name: appSettings.blueName, avatar: getOpponentSprite(), color: 'poke-blue' }
         : { name: selectedTrainer?.name || 'Opponent', avatar: getOpponentSprite(), color: userColor === PlayerColor.WHITE ? 'poke-blue' : 'poke-red' };

      return (
        <div className="fixed inset-0 z-50 bg-gray-900 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-white animate-[flash_0.2s_ease-in-out_6] mix-blend-overlay opacity-50 pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-1/2 bg-black animate-[slideDown_0.8s_ease-out_forwards_0.5s]" />
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-black animate-[slideUp_0.8s_ease-out_forwards_0.5s]" />
            
            <div className="absolute inset-0 flex items-center justify-between px-4 md:px-20 z-10">
                <div className="flex flex-col items-center animate-[slideRight_0.6s_ease-out_forwards_1s] opacity-0 translate-x-[-100px]">
                    <img src={p1Info.avatar} className={`w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-${p1Info.color.replace('poke-', '') === 'red' ? 'red-600' : 'blue-600'} bg-gray-800 object-cover shadow-2xl mb-4`} />
                    <div className={`bg-black/80 px-6 py-2 border-l-4 ${p1Info.color === 'poke-red' ? 'border-poke-red' : 'border-poke-blue'}`}>
                         <span className="text-white font-retro text-lg md:text-2xl">{p1Info.name}</span>
                    </div>
                </div>
                <div className="animate-[zoomIn_0.5s_ease-out_forwards_1.4s] opacity-0 scale-0 z-20">
                     <h1 className="font-retro text-5xl md:text-7xl text-white drop-shadow-[4px_4px_0_#dd2d4a] italic">VS</h1>
                </div>
                 <div className="flex flex-col items-center animate-[slideLeft_0.6s_ease-out_forwards_1s] opacity-0 translate-x-[100px]">
                    <img src={p2Info.avatar} className={`w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-${p2Info.color.replace('poke-', '') === 'red' ? 'red-600' : 'blue-600'} bg-gray-800 object-cover shadow-2xl mb-4`} />
                    <div className={`bg-black/80 px-6 py-2 border-r-4 ${p2Info.color === 'poke-red' ? 'border-poke-red' : 'border-poke-blue'}`}>
                         <span className="text-white font-retro text-lg md:text-2xl">{p2Info.name}</span>
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes slideDown { 0% { transform: translateY(-100%); } 100% { transform: translateY(0); } }
                @keyframes slideUp { 0% { transform: translateY(100%); } 100% { transform: translateY(0); } }
                @keyframes slideRight { 0% { opacity: 0; transform: translateX(-200px); } 100% { opacity: 1; transform: translateX(0); } }
                @keyframes slideLeft { 0% { opacity: 0; transform: translateX(200px); } 100% { opacity: 1; transform: translateX(0); } }
                @keyframes zoomIn { 0% { opacity: 0; transform: scale(0) rotate(-180deg); } 80% { transform: scale(1.5) rotate(10deg); } 100% { opacity: 1; transform: scale(1) rotate(0); } }
            `}</style>
        </div>
      );
  }

  if (appState === AppState.MODE_SELECT) {
      return (
        <div className="h-full w-full bg-gray-900 flex flex-col items-center justify-center p-6 animate-fade-in relative">
             <button onClick={() => setAppState(AppState.MENU)} className="absolute top-6 left-6 text-gray-400 hover:text-white flex items-center gap-2 font-retro text-xs">
                <ArrowLeftIcon className="w-4 h-4" /> BACK
            </button>
            <h2 className="text-white font-retro text-2xl mb-12">SELECT MODE</h2>
            <div className="flex flex-col gap-6 w-full max-w-lg">
                <button 
                    onClick={() => { setGameMode(GameMode.PASS_AND_PLAY); AudioManager.getInstance().playSfx('CLICK'); startGameTransition(); }}
                    className="bg-gray-800 hover:bg-gray-750 p-6 md:p-8 border-l-8 border-poke-red text-left group transition-all hover:translate-x-2"
                >
                    <h3 className="text-white font-retro text-lg group-hover:text-poke-red mb-2">PASS & PLAY</h3>
                    <p className="text-gray-400 text-xs leading-relaxed">Local multiplayer. Two players share this device.</p>
                </button>
                <button 
                    onClick={() => { setGameMode(GameMode.COMPUTER); setAppState(AppState.SIDE_SELECT); AudioManager.getInstance().playSfx('CLICK'); }}
                    className="bg-gray-800 hover:bg-gray-750 p-6 md:p-8 border-l-8 border-poke-blue text-left group transition-all hover:translate-x-2"
                >
                    <h3 className="text-white font-retro text-lg group-hover:text-poke-blue mb-2">VS COMPUTER</h3>
                    <p className="text-gray-400 text-xs leading-relaxed">Challenge the Gym Leaders and become Champion!</p>
                </button>
            </div>
        </div>
      );
  }

  if (appState === AppState.SIDE_SELECT) {
      return (
        <div className="h-full w-full bg-gray-900 flex flex-col items-center justify-center p-6 animate-fade-in relative">
             <button onClick={() => setAppState(AppState.MODE_SELECT)} className="absolute top-6 left-6 text-gray-400 hover:text-white flex items-center gap-2 font-retro text-xs">
                <ArrowLeftIcon className="w-4 h-4" /> BACK
            </button>
            <h2 className="text-white font-retro text-2xl mb-12">CHOOSE COLOUR</h2>
            <div className="flex flex-col md:flex-row gap-8">
                <button onClick={() => { setUserColor(PlayerColor.WHITE); setAppState(AppState.TRAINER_SELECT); AudioManager.getInstance().playSfx('CLICK'); }} className="flex flex-col items-center group">
                    <div className="w-56 h-56 bg-gray-800 border-4 border-poke-red rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                        <span className="text-poke-red font-retro text-3xl">RED</span>
                    </div>
                    <span className="text-gray-400 text-xs mt-4 font-retro group-hover:text-white">PLAY FIRST</span>
                </button>
                <button onClick={() => { setUserColor(PlayerColor.BLACK); setAppState(AppState.TRAINER_SELECT); AudioManager.getInstance().playSfx('CLICK'); }} className="flex flex-col items-center group">
                    <div className="w-56 h-56 bg-gray-800 border-4 border-poke-blue rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                         <span className="text-poke-blue font-retro text-3xl">BLUE</span>
                    </div>
                    <span className="text-gray-400 text-xs mt-4 font-retro group-hover:text-white">PLAY SECOND</span>
                </button>
            </div>
        </div>
      );
  }

  if (appState === AppState.TRAINER_SELECT) {
      return (
        <div className="h-full w-full bg-gray-900 flex flex-col relative animate-fade-in">
            <div className="flex-none p-6 flex items-center justify-center relative border-b border-gray-800">
                <button onClick={() => setAppState(AppState.SIDE_SELECT)} className="absolute left-6 text-gray-400 hover:text-white flex items-center gap-2 font-retro text-xs">
                    <ArrowLeftIcon className="w-4 h-4" /> BACK
                </button>
                <h2 className="text-white font-retro text-xl md:text-2xl">SELECT OPPONENT</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {TRAINERS.map((trainer) => {
                        const isChampion = trainer.id === 'champion';
                        let displayImg = trainer.imgUrl;
                        if (isChampion) {
                            displayImg = userColor === PlayerColor.WHITE ? getTrainerSprite('blue') : getTrainerSprite('red');
                        }

                        return (
                            <button 
                                key={trainer.id}
                                onClick={() => { setSelectedTrainer(trainer); AudioManager.getInstance().playSfx('CLICK'); startGameTransition(); }}
                                className="bg-gray-800 border border-gray-700 hover:border-poke-yellow p-4 rounded flex items-center gap-4 group transition-all hover:bg-gray-750 text-left"
                            >
                                <div className="w-16 h-16 bg-gray-900 rounded-full border border-gray-600 flex-shrink-0 flex items-center justify-center p-1">
                                    <img 
                                        src={displayImg} 
                                        className={`w-full h-full object-contain ${isChampion ? 'brightness-0 drop-shadow-[0_0_2px_#fff]' : 'drop-shadow-lg'}`} 
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-white font-retro text-xs group-hover:text-poke-yellow truncate">{trainer.name}</h3>
                                    <p className="text-[10px] text-poke-red font-bold mt-1">{trainer.difficultyLabel}</p>
                                    <p className="text-[10px] text-gray-400 mt-1 italic truncate">"{trainer.theme}"</p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
      );
  }

  if (appState === AppState.GAME) {
      const topInfo = getPlayerDisplayInfo('top');
      const bottomInfo = getPlayerDisplayInfo('bottom');

      const renderPlayerCard = (info: any, isLarge = false) => (
          <div className={`w-full flex items-center gap-3 bg-gray-800/90 p-2 lg:p-4 rounded-sm border-l-4 ${info.teamColor === 'red' ? 'border-poke-red' : 'border-poke-blue'} shadow-lg transition-colors duration-500 ${info.isActive ? 'bg-gray-700 ring-2 ring-poke-yellow/30' : ''}`}>
               <div className={`${isLarge ? 'w-12 h-12 lg:w-16 lg:h-16' : 'w-8 h-8'} rounded-full bg-black overflow-hidden border border-gray-600`}>
                    <img src={info.avatar} className="w-full h-full object-cover" />
               </div>
               <div className="flex-1 min-w-0">
                   <div className="flex items-baseline justify-between">
                       <span className="text-white font-retro text-[8px] lg:text-sm truncate mr-2">{info.name}</span>
                       <span className="text-gray-500 text-[8px] lg:text-[10px] uppercase font-bold shrink-0">{info.teamColor === 'red' ? 'Red Team' : 'Blue Team'}</span>
                   </div>
               </div>
          </div>
      );

      const renderControls = () => (
        <div className="flex justify-center gap-4 w-full">
            <button 
                onClick={() => boardRef.current?.undo()}
                disabled={!canUndo}
                className="bg-gray-800 text-white px-4 py-3 lg:px-6 rounded-full border border-gray-500 hover:bg-poke-red hover:border-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 font-retro text-[10px] lg:text-xs transition-all active:scale-95 shadow-lg flex-1 justify-center"
            >
                <ArrowUturnLeftIcon className="w-4 h-4 lg:w-5 lg:h-5" /> UNDO
            </button>
            <button 
                onClick={() => boardRef.current?.redo()}
                disabled={!canRedo}
                className="bg-gray-800 text-white px-4 py-3 lg:px-6 rounded-full border border-gray-500 hover:bg-poke-blue hover:border-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 font-retro text-[10px] lg:text-xs transition-all active:scale-95 shadow-lg flex-1 justify-center"
            >
                REDO <ArrowUturnRightIcon className="w-4 h-4 lg:w-5 lg:h-5" />
            </button>
        </div>
      );

      return (
        <div className="h-full w-full bg-gray-900 p-2 lg:p-8 flex items-center justify-center relative">
             <button 
                onClick={handleExit} 
                className="absolute top-2 left-2 z-50 text-gray-400 hover:text-white flex items-center gap-2 font-retro text-[8px] lg:text-[10px] bg-gray-900/80 p-2 rounded"
            >
                <ArrowRightOnRectangleIcon className="w-4 h-4 lg:w-5 lg:h-5" /> EXIT
            </button>

             <div className="w-full h-full max-w-7xl flex flex-col lg:flex-row items-center justify-center gap-2 lg:gap-8">
                 
                 <div className="flex-1 h-full w-full max-w-[100vw] flex items-center justify-center relative lg:order-1">
                      <div className="lg:hidden absolute top-0 w-full z-10 p-1">
                          {renderPlayerCard(topInfo)}
                      </div>

                      <div className="w-full max-w-[95vw] lg:max-w-[85vh] aspect-square mx-auto">
                        <ChessBoard 
                            ref={boardRef}
                            mode={gameMode}
                            userColor={userColor}
                            trainer={selectedTrainer}
                            redLineup={redLineup}
                            blueLineup={blueLineup}
                            onTurnChange={setCurrentTurn}
                            onHistoryChange={(u, r) => { setCanUndo(u); setCanRedo(r); }}
                            onBoardUpdate={(history) => setMoveHistory(history)}
                            onGameOver={(w, pgn) => {
                                setWinner(w);
                                setGamePgn(pgn);
                            }}
                        />
                      </div>

                      <div className="lg:hidden absolute bottom-0 w-full z-10 p-1 flex flex-col gap-2">
                           {renderPlayerCard(bottomInfo)}
                           {renderControls()}
                      </div>
                 </div>

                 <div className="hidden lg:flex flex-col w-80 h-[85vh] justify-between bg-gray-800/20 p-6 rounded-xl border border-gray-700/50 backdrop-blur-sm lg:order-2">
                      <div className="space-y-4">
                          <h3 className="text-gray-400 font-retro text-xs text-center mb-4">OPPONENT</h3>
                          {renderPlayerCard(topInfo, true)}
                      </div>

                      <div className="flex-1 flex flex-col gap-4 min-h-0">
                          <div className="bg-gray-900/50 rounded-lg border border-gray-700/30 flex flex-col flex-1 overflow-hidden relative">
                              <div className="bg-gray-800 p-2 text-center border-b border-gray-700">
                                   <span className="text-gray-400 font-retro text-[10px]">BATTLE LOG</span>
                              </div>
                              <div className="flex-1 overflow-y-auto p-2 scrollbar-thin space-y-1">
                                    <table className="w-full text-[10px] font-retro">
                                        <tbody>
                                            {Array.from({ length: Math.ceil(moveHistory.length / 2) }).map((_, i) => (
                                                <tr key={i} className="text-gray-300 odd:bg-white/5">
                                                    <td className="p-1 text-gray-500 w-8">{i + 1}.</td>
                                                    <td className="p-1 text-poke-red">{moveHistory[i * 2]}</td>
                                                    <td className="p-1 text-poke-blue">{moveHistory[i * 2 + 1] || ''}</td>
                                                </tr>
                                            ))}
                                            <tr ref={logEndRef} />
                                        </tbody>
                                    </table>
                                    {moveHistory.length === 0 && (
                                        <div className="h-full flex items-center justify-center text-gray-600 italic text-[10px]">
                                            No moves yet...
                                        </div>
                                    )}
                              </div>
                          </div>
                          {renderControls()}
                      </div>

                      <div className="space-y-4">
                          <h3 className="text-gray-400 font-retro text-xs text-center mb-4">PLAYER</h3>
                          {renderPlayerCard(bottomInfo, true)}
                      </div>
                 </div>
             </div>

             {winner && (
                 <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center animate-fade-in p-6">
                      <h2 className="text-white font-retro text-2xl md:text-5xl mb-8 text-center animate-pulse text-poke-yellow leading-relaxed drop-shadow-lg mx-auto">
                          {winner === 'draw' 
                            ? 'GAME DRAWN!' 
                            : (winner === PlayerColor.WHITE 
                                ? (gameMode === GameMode.PASS_AND_PLAY ? 'RED WINS!' : (userColor === PlayerColor.WHITE ? 'VICTORY!' : 'DEFEAT'))
                                : (gameMode === GameMode.PASS_AND_PLAY ? 'BLUE WINS!' : (userColor === PlayerColor.BLACK ? 'VICTORY!' : 'DEFEAT'))
                              )
                          }
                      </h2>
                      
                      <div className="flex flex-col gap-4 w-full max-w-xs">
                          <button 
                            onClick={handleExit}
                            className="bg-white text-black font-retro px-8 py-4 hover:bg-poke-red hover:text-white transition-all transform hover:scale-105 rounded-sm shadow-xl border-4 border-transparent active:border-poke-yellow text-xs md:text-sm w-full"
                          >
                              RETURN TO MENU
                          </button>
                          
                          <button 
                            onClick={handleDownloadPgn}
                            className="bg-gray-800 text-white font-retro px-8 py-4 hover:bg-poke-blue transition-all transform hover:scale-105 rounded-sm shadow-xl border-2 border-gray-600 active:border-poke-yellow text-xs md:text-sm w-full flex items-center justify-center gap-2"
                          >
                              <ArrowDownTrayIcon className="w-4 h-4" /> EXPORT PGN
                          </button>
                      </div>
                 </div>
             )}
        </div>
      );
  }

  return null;
};

export default App;
