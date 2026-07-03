import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Flame, Swords, ArrowLeft, RotateCcw, Award, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Pokemon } from '../types';
import { NpcTrainer } from '../data';

export interface BattleOverModalProps {
  isOpen: boolean;
  winnerName: string | null;
  trainerName: string;
  battleMode: 'campaign' | 'versus' | 'online';
  playerTeam: Pokemon[];
  opponentTeam: Pokemon[];
  activeNpc: NpcTrainer | null;
  hasWonCampaignVoucher: boolean;
  onRematch: () => void;
  onReturnToSelection: () => void;
}

export const BattleOverModal: React.FC<BattleOverModalProps> = ({
  isOpen,
  winnerName,
  trainerName,
  battleMode,
  playerTeam,
  opponentTeam,
  activeNpc,
  hasWonCampaignVoucher,
  onRematch,
  onReturnToSelection,
}) => {
  if (!isOpen) return null;

  // Bulletproof winner check: if playerTeam has survivors, player won!
  const playerWon = playerTeam.length > 0 && playerTeam.some((p) => p.hp > 0);
  
  // Surviving team members
  const winningTeam = playerWon ? playerTeam : opponentTeam;
  const survivorsCount = winningTeam.filter((p) => p.hp > 0).length;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Semi-transparent Backdrop with Blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-950/85 backdrop-blur-md pointer-events-auto"
          onClick={onReturnToSelection} // clicking backdrop closes/returns
        />

        {/* Modal Dialog Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 15 }}
          transition={{ type: 'spring', duration: 0.5, bounce: 0.2 }}
          className={`relative w-full max-w-lg landscape:max-w-3xl bg-slate-900 border-2 rounded-3xl p-5 sm:p-6 shadow-[0_25px_60px_rgba(0,0,0,0.85)] z-10 pointer-events-auto overflow-y-auto max-h-[95vh] ${
            playerWon
              ? 'border-emerald-500/40 shadow-[0_0_50px_rgba(16,185,129,0.15)]'
              : 'border-rose-500/30 shadow-[0_0_50px_rgba(244,63,94,0.1)]'
          }`}
        >
          {/* Decorative Corner Lights */}
          <div className={`absolute top-0 left-0 w-24 h-24 rounded-br-full opacity-20 pointer-events-none ${playerWon ? 'bg-emerald-500' : 'bg-rose-500'}`} />
          <div className={`absolute bottom-0 right-0 w-24 h-24 rounded-tl-full opacity-10 pointer-events-none ${playerWon ? 'bg-emerald-500' : 'bg-rose-500'}`} />

          {/* Main layout container: vertical on portrait, horizontal grid on landscape */}
          <div className="grid grid-cols-1 landscape:grid-cols-12 gap-5 items-stretch text-center landscape:text-left relative z-10">
            
            {/* Left side: Icon, title, description, buttons */}
            <div className="landscape:col-span-6 flex flex-col items-center landscape:items-start justify-center gap-4">
              {/* Icon Header */}
              <div className="relative">
                {playerWon ? (
                  <div className="relative flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.2)] animate-pulse">
                    <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-400" />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1], rotate: [0, 360, 360] }}
                      transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                      className="absolute inset-0 rounded-full border-2 border-dashed border-emerald-500/40"
                    />
                  </div>
                ) : (
                  <div className="relative flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-rose-500/10 border border-rose-500/30 shadow-[0_0_20px_rgba(244,63,94,0.15)]">
                    <ShieldAlert className="w-8 h-8 sm:w-10 sm:h-10 text-rose-400 animate-bounce" />
                  </div>
                )}
              </div>

              {/* Title Header */}
              <div className="space-y-1 w-full text-center landscape:text-left flex flex-col items-center landscape:items-start">
                <span className={`text-[9px] uppercase font-pressstart tracking-widest font-bold block ${playerWon ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {battleMode === 'campaign' ? 'Campaign Battle Concluded' : battleMode === 'online' ? 'Online Multiplayer Concluded' : 'Local PvP Match Completed'}
                </span>
                <h2 className="pokemon-logo-text text-2xl sm:text-3xl font-black tracking-widest leading-none mt-2 scale-105">
                  {playerWon ? 'ARENA VICTORY!' : 'SQUAD FAINTED'}
                </h2>
              </div>

              {/* Subtext explanation */}
              <p className="text-xs text-slate-300 font-sans leading-relaxed max-w-sm">
                {playerWon
                  ? battleMode === 'campaign'
                    ? `Outstanding performance! Trainer ${trainerName} has successfully knocked out the rival team!`
                    : battleMode === 'online'
                    ? `Outstanding! Trainer ${trainerName} has defeated the online challenger!`
                    : `Player 1 (${trainerName}) claims victory in the Local PvP Arena!`
                  : battleMode === 'campaign'
                    ? `Rival Trainer ${winnerName || 'Opponent'} has fainted your party. Study the Pokédex type calculator to counter effectively!`
                    : battleMode === 'online'
                    ? `Challenger ${winnerName || 'Opponent'} has defeated your party. Train hard and enter matchmaking again!`
                    : `Player 2 is the champion of this matchup! Practice draft tactics for the next round!`
                }
              </p>

              {/* Action Buttons Stack (moved here for landscape optimization) */}
              <div className="w-full flex flex-col sm:flex-row gap-3 mt-2">
                {/* Return to selection */}
                <button
                  onClick={onReturnToSelection}
                  id="btn-return-selection"
                  className="flex-1 py-3 px-4 rounded-xl border border-slate-700 hover:border-slate-500 bg-slate-950/40 hover:bg-slate-800/40 text-slate-300 font-mono font-bold text-[11px] uppercase tracking-wider transition-all flex items-center justify-center gap-2 active:scale-98"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Board Room
                </button>

                {/* Rematch */}
                {battleMode !== 'online' && (
                  <button
                    onClick={onRematch}
                    id="btn-rematch"
                    className={`flex-1 py-3 px-4 rounded-xl font-mono font-bold text-[11px] uppercase tracking-wider transition-all flex items-center justify-center gap-2 active:scale-98 shadow-md ${
                      playerWon
                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:shadow-[0_0_25px_rgba(16,185,129,0.25)]'
                        : 'bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.15)] hover:shadow-[0_0_25px_rgba(244,63,94,0.25)]'
                    }`}
                  >
                    <RotateCcw className="w-3.5 h-3.5 animate-spin-slow" />
                    Rematch Match
                  </button>
                )}
              </div>
            </div>

            {/* Right side: Summary Stats, Rewards */}
            <div className="landscape:col-span-6 flex flex-col justify-center gap-4 w-full">
              {/* Survive Summary Stats Grid */}
              <div className="w-full bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-3">
                <div className="flex justify-between items-center text-xs font-mono border-b border-slate-800/50 pb-2">
                  <span className="text-slate-400">Winning Trainer</span>
                  <span className={`font-bold ${playerWon ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {playerWon ? (battleMode === 'campaign' ? trainerName : battleMode === 'online' ? trainerName : 'Player 1') : (battleMode === 'campaign' ? (activeNpc?.name || 'Opponent') : battleMode === 'online' ? (winnerName || 'Opponent') : 'Player 2')}
                  </span>
                </div>
                
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-400">Surviving Squad</span>
                  <span className="text-slate-200 font-bold">{survivorsCount} / {winningTeam.length} Alive</span>
                </div>

                {/* Quick Health bars of winning team */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {winningTeam.map((p, idx) => (
                    <div key={`${p.id}-${idx}`} className="bg-slate-900 border border-slate-800/60 rounded-xl p-2 text-center flex flex-col gap-1.5">
                      <span className="text-[10px] font-bold text-slate-300 truncate block">
                        {p.name}
                      </span>
                      <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-black/30">
                        <div
                          className={`h-full transition-all duration-300 ${
                            p.hp <= 0 ? 'w-0 bg-rose-600' : p.hp / p.maxHp > 0.5 ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${Math.max(0, (p.hp / p.maxHp) * 100)}%` }}
                        />
                      </div>
                      <span className="text-[8px] font-mono text-slate-500">
                        {p.hp <= 0 ? 'FAINTED' : `${p.hp}/${p.maxHp}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
