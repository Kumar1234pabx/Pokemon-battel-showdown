import React, { useState, useEffect } from 'react';
import { PokemonGame } from './components/PokemonGame';
import { gameAudio } from './utils/audio';
import { Gamepad2, Swords, Award, Volume2, BookOpen, Sparkles } from 'lucide-react';

export default function App() {
  const [hasBooted, setHasBooted] = useState<boolean>(() => {
    return localStorage.getItem('pokemon_game_booted') === 'true';
  });
  const [trainerName, setTrainerName] = useState<string>(() => {
    return localStorage.getItem('pokemon_trainer_name') || 'Red';
  });
  const [trainerAvatar, setTrainerAvatar] = useState<string>(() => {
    return localStorage.getItem('pokemon_trainer_avatar') || '🔴';
  });
  const [isBlinking, setIsBlinking] = useState(true);

  // PRESS START blinking effect
  useEffect(() => {
    const interval = setInterval(() => {
      setIsBlinking(b => !b);
    }, 600);
    return () => clearInterval(interval);
  }, []);

  const handleBoot = () => {
    gameAudio.playHeal();
    setHasBooted(true);
    localStorage.setItem('pokemon_game_booted', 'true');
  };

  const handleSaveProfile = (name: string, avatar: string) => {
    gameAudio.playSelect();
    const cleanName = name.trim().slice(0, 15) || 'Red';
    setTrainerName(cleanName);
    setTrainerAvatar(avatar);
    localStorage.setItem('pokemon_trainer_name', cleanName);
    localStorage.setItem('pokemon_trainer_avatar', avatar);
  };

  const handleResetProfile = () => {
    gameAudio.playFaint();
    localStorage.removeItem('pokemon_game_booted');
    localStorage.removeItem('pokemon_trainer_name');
    localStorage.removeItem('pokemon_trainer_avatar');
    localStorage.removeItem('pokemon_campaign_progress');
    setHasBooted(false);
    setTrainerName('Red');
    setTrainerAvatar('🔴');
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col justify-between selection:bg-amber-500/30 selection:text-white">
      
      {/* Upper Status Bar */}
      <header className="bg-slate-950 border-b border-amber-500/10 px-4 py-3 flex items-center justify-between shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-2.5">
          <Gamepad2 className="text-amber-500 animate-pulse" size={22} />
          <div>
            <h1 className="font-cinzel font-bold text-sm sm:text-base tracking-wider text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.2)]">
              POKÉMON ARENA CONSOLE
            </h1>
            <p className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">
              8-Bit Retro Simulation v3.0
            </p>
          </div>
        </div>

        {hasBooted && (
          <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 rounded-xl px-3.5 py-1.5 text-xs">
            <span className="text-sm">{trainerAvatar}</span>
            <span className="font-bold text-slate-200 font-mono">Trainer {trainerName}</span>
            <button 
              onClick={handleResetProfile} 
              className="text-[10px] text-rose-400 hover:text-rose-300 transition-colors font-mono ml-2 border-l border-slate-700 pl-2.5"
              title="Reset game progress"
            >
              Reset
            </button>
          </div>
        )}
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4">
        {!hasBooted ? (
          // Retro Startup Screen
          <div className="max-w-md w-full bg-slate-950 border-2 border-slate-800 rounded-3xl p-6 sm:p-8 text-center relative shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden">
            {/* Visual Glass Reflection Effect */}
            <div className="absolute -inset-y-10 -inset-x-20 bg-gradient-to-tr from-transparent via-white/[0.02] to-transparent rotate-12 pointer-events-none" />
            
            {/* Retro Grid Dots */}
            <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
            
            {/* Amber Status Lamp */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-full px-2.5 py-1">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <span className="w-2 h-2 rounded-full bg-amber-500 absolute" />
              <span className="text-[8px] font-mono text-amber-500 uppercase tracking-widest">SYSTEM READY</span>
            </div>

            {/* Game Logo */}
            <div className="mt-8 mb-10 flex flex-col items-center">
              <div className="relative">
                <Swords className="text-amber-500 animate-bounce mb-3" size={48} />
                <div className="absolute inset-0 bg-amber-500/10 blur-xl rounded-full" />
              </div>
              <h2 className="font-cinzel font-black text-4xl sm:text-5xl text-amber-500 tracking-wider select-none leading-none">
                POKÉMON
              </h2>
              <h3 className="font-cinzel font-bold text-2xl sm:text-3xl text-slate-100 tracking-widest mt-1 select-none">
                SHOWDOWN
              </h3>
              <div className="h-0.5 w-24 bg-gradient-to-r from-transparent via-amber-500/60 to-transparent mt-3" />
              <p className="text-[10px] font-mono text-slate-400 mt-2 tracking-widest uppercase">
                Offline Arena Simulator
              </p>
            </div>

            {/* Profile configuration */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 text-left mb-8 flex flex-col gap-3.5">
              <div>
                <label className="block text-[10px] font-mono text-amber-500 uppercase tracking-wider mb-1.5">
                  Enter Trainer Name
                </label>
                <input
                  type="text"
                  maxLength={12}
                  value={trainerName}
                  onChange={e => setTrainerName(e.target.value.replace(/[^a-zA-Z0-9 ]/g, ''))}
                  placeholder="Trainer name..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 focus:outline-none rounded-xl px-3.5 py-2 text-sm text-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-amber-500 uppercase tracking-wider mb-1.5">
                  Choose Your Avatar
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { symbol: '🔴', label: 'Red' },
                    { symbol: '⚡', label: 'Spark' },
                    { symbol: '🌿', label: 'Leaf' },
                    { symbol: '🔮', label: 'Blue' }
                  ].map(av => (
                    <button
                      key={av.label}
                      type="button"
                      onClick={() => { gameAudio.playSelect(); setTrainerAvatar(av.symbol); }}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all ${
                        trainerAvatar === av.symbol
                          ? 'border-amber-500 bg-amber-500/10'
                          : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-xl mb-0.5">{av.symbol}</span>
                      <span className="text-[9px] font-mono text-slate-400">{av.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Blinking Press Start Button */}
            <button
              onClick={handleBoot}
              className="group w-full bg-gradient-to-b from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-cinzel font-bold text-lg py-3.5 rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.25)] hover:shadow-[0_0_30px_rgba(245,158,11,0.45)] transition-all flex items-center justify-center gap-2"
            >
              <span className={isBlinking ? 'opacity-100' : 'opacity-40'}>
                PRESS START TO BATTLE
              </span>
              <Sparkles className="animate-spin text-slate-950 group-hover:scale-110 transition-transform" size={16} />
            </button>

            <div className="mt-6 flex justify-center gap-4 text-[10px] font-mono text-slate-500">
              <span className="flex items-center gap-1">⚔️ Campaign Mode</span>
              <span>·</span>
              <span className="flex items-center gap-1">👥 Local Versus</span>
            </div>
          </div>
        ) : (
          // Pokémon Battle Console Room
          <div className="w-full max-w-5xl">
            <PokemonGame 
              trainerName={trainerName}
              trainerAvatar={trainerAvatar}
              onBackToBoot={() => {
                gameAudio.playFaint();
                setHasBooted(false);
                localStorage.removeItem('pokemon_game_booted');
              }}
            />
          </div>
        )}
      </main>

      {/* Retro bottom bezel */}
      <footer className="bg-slate-950 border-t border-slate-900 py-4 text-center text-[10px] font-mono text-slate-500">
        <div>SATHYA'S SHOWDOWN ARENA · ALL RIGHTS RESERVED</div>
        <div className="text-slate-600 mt-0.5 uppercase tracking-widest">TAP SCREEN TO INTERACT · ACCELERATED SOUND SYNTHESIS ACTIVE</div>
      </footer>
    </div>
  );
}
