
import React, { useEffect, useState } from 'react';
import { AudioManager } from '../services/audio';

interface IntroProps {
  onComplete: () => void;
}

enum IntroStage {
    DISCLAIMER = 0,
    DISCLAIMER_FADE = 1,
    LOGO_START = 2,
    LOGO_SETTLED = 3
}

export const IntroSequence: React.FC<IntroProps> = ({ onComplete }) => {
  const [stage, setStage] = useState<IntroStage>(IntroStage.DISCLAIMER);

  useEffect(() => {
    const timer1 = setTimeout(() => setStage(IntroStage.DISCLAIMER_FADE), 6500);
    
    const timer2 = setTimeout(() => setStage(IntroStage.LOGO_START), 7500);

    const timer3 = setTimeout(() => {
        setStage(IntroStage.LOGO_SETTLED);
        AudioManager.getInstance().playSfx('INTRO');
    }, 13000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  const handleClick = () => {
    AudioManager.getInstance().resumeContext();

    if (stage >= IntroStage.LOGO_START) {
        AudioManager.getInstance().playSfx('CLICK');
        onComplete();
    }
  };

  return (
    <div 
        onClick={handleClick}
        className="fixed inset-0 bg-black flex items-center justify-center z-50 cursor-pointer overflow-hidden"
    >
      <div className={`absolute inset-0 flex flex-col items-center justify-center p-4 md:p-8 transition-opacity duration-1000 ${
          stage === IntroStage.DISCLAIMER ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}>
          <div className="border-2 border-white/20 p-6 md:p-8 max-w-2xl bg-gray-900/90 backdrop-blur-sm rounded-sm text-center">
            <h2 className="text-white font-retro text-xs md:text-sm mb-6 leading-loose tracking-widest text-poke-yellow animate-pulse">
                GAME DISCLAIMER
            </h2>
            <div className="text-gray-300 font-sans text-[10px] md:text-xs leading-relaxed space-y-3 overflow-y-auto max-h-[60vh] scrollbar-thin">
                <p>
                    <strong>Champion’s Gambit</strong> is an independent, fan-made project created for educational, experimental, and non-commercial purposes only.
                </p>
                <p>
                    Pokémon, Pokémon character names, trainer names (including Red, Blue, and Gym Leaders), Pokémon sprites, trainer sprites, sound effects, music tracks, fonts, and all related trademarks, artwork, and audio assets are the intellectual property of <strong>Nintendo, Game Freak, and Creatures Inc.</strong>
                </p>
                <p>
                    This project is not affiliated with, endorsed by, sponsored by, or approved by Nintendo, Game Freak, or any related entities.
                </p>
                <p>
                    All Pokémon-related assets used in this project are included strictly for learning, demonstration, personal portfolio presentation, and non-commercial fan expression.
                </p>
                <p>
                    No ownership of Pokémon intellectual property is claimed.
                </p>
                <p className="font-mono text-[9px] text-gray-500 pt-2">
                    If you are a rights holder and believe any content should be modified or removed, please contact the repository owner and it will be addressed promptly.
                </p>
            </div>
          </div>
      </div>

      <div 
        className={`transition-all duration-1000 transform flex flex-col items-center ${
          stage >= IntroStage.LOGO_START ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
        }`}
      >
        <div className="relative">
            <div className={`absolute -inset-10 bg-blue-500/20 blur-3xl rounded-full transition-opacity duration-2000 ${stage === IntroStage.LOGO_SETTLED ? 'opacity-100' : 'opacity-0'}`}></div>
            
            <h1 className="relative font-retro text-4xl md:text-6xl text-white text-center leading-snug tracking-wider drop-shadow-[4px_4px_0_rgba(0,0,0,1)]">
            <span className="text-poke-red inline-block animate-[float_3s_ease-in-out_infinite]">CHAMPION'S</span><br />
            <span className="text-poke-blue inline-block animate-[float_3s_ease-in-out_infinite] delay-150">GAMBIT</span>
            </h1>
        </div>
        
        {stage === IntroStage.LOGO_SETTLED && (
          <div className="mt-16 text-center animate-pulse text-white font-retro text-sm md:text-lg blink-caret flex flex-col gap-2">
            <span>▶ PRESS START</span>
          </div>
        )}
      </div>
    </div>
  );
};
