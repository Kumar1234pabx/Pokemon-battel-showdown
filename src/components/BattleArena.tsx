import React, { useState, useEffect, useRef } from 'react';
import { Pokemon, Move } from '../types';
import { PokemonSprite } from './PokemonSprites';
import { gameAudio } from '../utils/audio';
import { esc } from '../utils/helpers';

interface BattleArenaProps {
  battleMode: 'offline' | 'online';
  playerTeam: Pokemon[];
  opponentTeam: Pokemon[];
  activePlayerIdx: number;
  activeOpponentIdx: number;
  onPlayerSwitch: (idx: number) => void;
  onOpponentSwitch: (idx: number) => void;
  onMoveResolved: (log: string[], updatedPlayerTeam: Pokemon[], updatedOpponentTeam: Pokemon[]) => void;
  battleId?: string | null;
  onlinePlayerPhone?: string;
  isOnlineTurnWaiting?: boolean;
  setOnlineTurnWaiting?: (b: boolean) => void;
  onBattleFinished: (winnerName: string, won: boolean) => void;
}

export const BattleArena: React.FC<BattleArenaProps> = ({
  battleMode,
  playerTeam,
  opponentTeam,
  activePlayerIdx,
  activeOpponentIdx,
  onPlayerSwitch,
  onOpponentSwitch,
  onMoveResolved,
  battleId,
  onlinePlayerPhone,
  isOnlineTurnWaiting,
  setOnlineTurnWaiting,
  onBattleFinished,
}) => {
  const pActive = playerTeam[activePlayerIdx];
  const oActive = opponentTeam[activeOpponentIdx];

  // Visual Effects State
  const [playerAttacking, setPlayerAttacking] = useState(false);
  const [opponentAttacking, setOpponentAttacking] = useState(false);
  const [playerHit, setPlayerHit] = useState(false);
  const [opponentHit, setOpponentHit] = useState(false);
  
  // Floating Text Effects
  const [playerFloat, setPlayerFloat] = useState<{ text: string; color: string } | null>(null);
  const [opponentFloat, setOpponentFloat] = useState<{ text: string; color: string } | null>(null);

  const [battleLogs, setBattleLogs] = useState<string[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [battleLogs]);

  // OFFLINE GAMEPLAY RESOLUTION
  const resolveOfflineTurn = (move: Move) => {
    gameAudio.playSelect();
    
    // Choose random CPU move
    const oMoves = oActive.moves.filter(m => m.power > 0 || m.effect === 'heal');
    const cpuMove = oMoves[Math.floor(Math.random() * oMoves.length)];

    // Deep Copy teams to resolve
    const nextPlayerTeam = JSON.parse(JSON.stringify(playerTeam));
    const nextOpponentTeam = JSON.parse(JSON.stringify(opponentTeam));
    const curP = nextPlayerTeam[activePlayerIdx];
    const curO = nextOpponentTeam[activeOpponentIdx];

    const logs: string[] = [];
    logs.push(`\n--- Turn Action ---`);

    // Speed determines priority
    const playerFirst = curP.speed >= curO.speed;
    const order = playerFirst
      ? [
          { name: 'Player', actor: curP, target: curO, m: move, isPlayer: true },
          { name: 'CPU', actor: curO, target: curP, m: cpuMove, isPlayer: false }
        ]
      : [
          { name: 'CPU', actor: curO, target: curP, m: cpuMove, isPlayer: false },
          { name: 'Player', actor: curP, target: curO, m: move, isPlayer: true }
        ];

    const animateAttack = (isPlayer: boolean, isHeal: boolean) => {
      if (isPlayer) {
        setPlayerAttacking(true);
        setTimeout(() => setPlayerAttacking(false), 300);
        if (isHeal) {
          gameAudio.playHeal();
        } else {
          gameAudio.playBeam();
          setTimeout(() => {
            setOpponentHit(true);
            gameAudio.playHit();
            setTimeout(() => setOpponentHit(false), 200);
          }, 150);
        }
      } else {
        setOpponentAttacking(true);
        setTimeout(() => setOpponentAttacking(false), 300);
        if (isHeal) {
          gameAudio.playHeal();
        } else {
          gameAudio.playBeam();
          setTimeout(() => {
            setPlayerHit(true);
            gameAudio.playHit();
            setTimeout(() => setPlayerHit(false), 200);
          }, 150);
        }
      }
    };

    let pFainted = false;
    let oFainted = false;

    // Resolve attacks sequentially with timeline delays
    order.forEach((act, idx) => {
      setTimeout(() => {
        if (act.actor.hp <= 0) return; // Fainted already

        // Status paralization check
        if (act.actor.status === 'Paralyzed' && Math.random() < 0.25) {
          logs.push(`${act.actor.name} is paralyzed! It can't move.`);
          setBattleLogs([...logs]);
          return;
        }

        logs.push(`${act.isPlayer ? 'Your' : "Opponent's"} ${act.actor.name} used ${act.m.name}!`);
        animateAttack(act.isPlayer, act.m.category === 'Status');

        if (act.m.category === 'Status' && act.m.effect === 'heal') {
          const heal = Math.floor(act.actor.maxHp * 0.5);
          act.actor.hp = Math.min(act.actor.maxHp, act.actor.hp + heal);
          logs.push(`${act.actor.name} recovered ${heal} HP!`);
          if (act.isPlayer) {
            setPlayerFloat({ text: `+${heal} HP`, color: 'text-emerald-400' });
            setTimeout(() => setPlayerFloat(null), 1000);
          } else {
            setOpponentFloat({ text: `+${heal} HP`, color: 'text-emerald-400' });
            setTimeout(() => setOpponentFloat(null), 1000);
          }
        } else {
          // Regular Damage Attack
          let dmg = Math.floor((act.m.power * (act.actor.spAtk / act.target.spDef)) / 5) + 5;
          if (act.actor.status === 'Burned') dmg = Math.floor(dmg * 0.5);

          // Type Multipliers
          const mult = getTypeMult(act.m.type, act.target.type);
          dmg = Math.floor(dmg * mult);
          act.target.hp = Math.max(0, act.target.hp - dmg);

          if (mult > 1) logs.push("It's super effective!");
          if (mult < 1 && mult > 0) logs.push("It's not very effective...");
          if (mult === 0) logs.push(`It doesn't affect ${act.target.name}...`);

          logs.push(`Dealt ${dmg} damage.`);
          if (act.isPlayer) {
            setOpponentFloat({ text: `-${dmg} HP`, color: 'text-rose-400' });
            setTimeout(() => setOpponentFloat(null), 1000);
          } else {
            setPlayerFloat({ text: `-${dmg} HP`, color: 'text-rose-400' });
            setTimeout(() => setPlayerFloat(null), 1000);
          }

          // Apply Status Condition
          if (act.m.effect && act.target.hp > 0 && act.target.status === 'None') {
            if (act.m.effect === 'burn' && Math.random() < 0.3) {
              act.target.status = 'Burned';
              logs.push(`${act.target.name} was burned!`);
            } else if (act.m.effect === 'paralyze' && Math.random() < 0.3) {
              act.target.status = 'Paralyzed';
              logs.push(`${act.target.name} was paralyzed!`);
            }
          }

          if (act.target.hp <= 0) {
            logs.push(`${act.target.name} fainted!`);
            setTimeout(() => gameAudio.playFaint(), 300);
            if (act.isPlayer) oFainted = true;
            else pFainted = true;
          }
        }

        // Status effects at end of round
        if (idx === 1) {
          [curP, curO].forEach((p, isP1) => {
            if (p.hp > 0 && p.status === 'Burned') {
              const bDmg = Math.floor(p.maxHp * 0.08);
              p.hp = Math.max(0, p.hp - bDmg);
              logs.push(`${p.name} took ${bDmg} burn damage.`);
              if (p.hp <= 0) {
                logs.push(`${p.name} fainted!`);
                setTimeout(() => gameAudio.playFaint(), 300);
                if (isP1 === 0) pFainted = true;
                else oFainted = true;
              }
            }
          });

          // Check End Game
          const pAllFainted = nextPlayerTeam.every((p: any) => p.hp <= 0);
          const oAllFainted = nextOpponentTeam.every((p: any) => p.hp <= 0);

          if (pAllFainted) {
            logs.push("\n❌ All your Pokémon have fainted. You lost the battle!");
            onMoveResolved(logs, nextPlayerTeam, nextOpponentTeam);
            setTimeout(() => onBattleFinished("Opponent", false), 1500);
          } else if (oAllFainted) {
            logs.push("\n🏆 All opponent's Pokémon have fainted. You won the battle!");
            onMoveResolved(logs, nextPlayerTeam, nextOpponentTeam);
            setTimeout(() => onBattleFinished("Player", true), 1500);
          } else {
            onMoveResolved(logs, nextPlayerTeam, nextOpponentTeam);
          }
        }

        setBattleLogs([...logs]);
      }, idx * 1000);
    });
  };

  // ONLINE GAMEPLAY TURN RESOLUTION
  const submitOnlineMove = async (moveName: string) => {
    if (!battleId || !onlinePlayerPhone || isOnlineTurnWaiting) return;
    gameAudio.playSelect();
    setOnlineTurnWaiting?.(true);

    try {
      const response = await fetch('/api/game/battle-submit-move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ battleId, myPhone: onlinePlayerPhone, moveName })
      });
      const data = await response.json();
      if (data.ok) {
        setBattleLogs(data.battle.log);
      }
    } catch (e) {}
  };

  const getTypeMult = (atk: string, defs: string[]) => {
    const chart: Record<string, Record<string, number>> = {
      Electric: { Water: 2, Flying: 2, Electric: 0.5 },
      Fire: { Steel: 2, Fire: 0.5, Water: 0.5 },
      Water: { Fire: 2, Water: 0.5 },
      Flying: { Fighting: 2, Steel: 0.5 },
      Psychic: { Fighting: 2, Psychic: 0.5, Steel: 0.5 },
      Fighting: { Steel: 2, Flying: 0.5, Psychic: 0.5, Ghost: 0 },
      Steel: { Steel: 0.5, Fire: 0.5, Water: 0.5 },
      Ghost: { Ghost: 2, Psychic: 2 },
      Poison: { Ghost: 0.5, Poison: 0.5, Steel: 0 }
    };
    let m = 1;
    const row = chart[atk];
    if (row) {
      defs.forEach(d => { if (row[d] !== undefined) m *= row[d]; });
    }
    return m;
  };

  const hpColor = (hp: number, max: number) => {
    const ratio = hp / max;
    if (ratio > 0.5) return 'bg-emerald-500';
    if (ratio > 0.2) return 'bg-amber-500';
    return 'bg-rose-500 animate-pulse';
  };

  return (
    <div className="flex flex-col gap-4">
      {/* 3D-Perspective Battle Arena */}
      <div className="relative h-[280px] sm:h-[360px] rounded-xl overflow-hidden bg-slate-950 border border-slate-700/50 flex flex-col justify-between p-4">
        {/* Sky/Atmosphere background elements */}
        <div className="absolute inset-0 bg-radial-gradient from-slate-900 via-slate-950 to-black pointer-events-none" />
        <div className="absolute top-10 left-10 w-24 h-24 rounded-full bg-purple-500/10 blur-xl animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-32 h-32 rounded-full bg-blue-500/10 blur-2xl animate-pulse" />

        {/* Isometric Battle Stage */}
        <div className="absolute left-1/2 bottom-[10%] -translate-x-1/2 w-[120%] h-[180px] bg-slate-900 border-t-2 border-slate-700/80 rounded-[50%] scale-y-[0.35] shadow-[0_30px_50px_rgba(0,0,0,0.8)] pointer-events-none" style={{ transformOrigin: 'center bottom' }} />

        {/* OPPONENT SIDE (Top Right) */}
        <div className="relative flex justify-end items-start gap-4 z-10 w-full">
          {/* Health Card */}
          <div className="bg-slate-900/90 border border-slate-700/60 rounded-xl p-3 w-[180px] sm:w-[220px] shadow-lg">
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-white text-sm sm:text-base">{esc(oActive.name)}</span>
              <span className="text-xs text-slate-400 font-mono">Lv.50</span>
            </div>
            {/* Health Bar */}
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden mb-1">
              <div className={`h-full transition-all duration-300 ${hpColor(oActive.hp, oActive.maxHp)}`} style={{ width: `${(oActive.hp / oActive.maxHp) * 100}%` }} />
            </div>
            <div className="flex justify-between items-center text-[10.5px] font-mono">
              <span className={oActive.status !== 'None' ? 'text-amber-400' : 'text-slate-400'}>
                {oActive.status !== 'None' ? esc(oActive.status) : 'Healthy'}
              </span>
              <span className="text-slate-300">{oActive.hp} / {oActive.maxHp} HP</span>
            </div>
          </div>

          {/* Sprite Arena Slot */}
          <div className="relative w-28 h-28 sm:w-36 sm:h-36 flex items-center justify-center">
            <PokemonSprite
              name={oActive.name}
              isBack={false}
              isAttacking={opponentAttacking}
              isHit={opponentHit}
              status={oActive.status}
              className="w-24 h-24 sm:w-32 sm:h-32 transition-transform duration-300 transform scale-x-[-1]"
            />
            {/* Float values */}
            {opponentFloat && (
              <div className={`absolute -top-6 font-bold text-lg animate-bounce ${opponentFloat.color}`}>
                {opponentFloat.text}
              </div>
            )}
          </div>
        </div>

        {/* PLAYER SIDE (Bottom Left) */}
        <div className="relative flex justify-start items-end gap-4 z-10 w-full">
          {/* Sprite Arena Slot */}
          <div className="relative w-28 h-28 sm:w-36 sm:h-36 flex items-center justify-center">
            <PokemonSprite
              name={pActive.name}
              isBack={true}
              isAttacking={playerAttacking}
              isHit={playerHit}
              status={pActive.status}
              className="w-24 h-24 sm:w-32 sm:h-32"
            />
            {/* Float values */}
            {playerFloat && (
              <div className={`absolute -top-6 font-bold text-lg animate-bounce ${playerFloat.color}`}>
                {playerFloat.text}
              </div>
            )}
          </div>

          {/* Health Card */}
          <div className="bg-slate-900/90 border border-slate-700/60 rounded-xl p-3 w-[180px] sm:w-[220px] shadow-lg">
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-white text-sm sm:text-base">{esc(pActive.name)}</span>
              <span className="text-xs text-slate-400 font-mono">Lv.50</span>
            </div>
            {/* Health Bar */}
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden mb-1">
              <div className={`h-full transition-all duration-300 ${hpColor(pActive.hp, pActive.maxHp)}`} style={{ width: `${(pActive.hp / pActive.maxHp) * 100}%` }} />
            </div>
            <div className="flex justify-between items-center text-[10.5px] font-mono">
              <span className={pActive.status !== 'None' ? 'text-amber-400' : 'text-slate-400'}>
                {pActive.status !== 'None' ? esc(pActive.status) : 'Healthy'}
              </span>
              <span className="text-slate-300">{pActive.hp} / {pActive.maxHp} HP</span>
            </div>
          </div>
        </div>
      </div>

      {/* Battle logs stream */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 h-28 overflow-y-auto text-xs sm:text-sm font-mono flex flex-col gap-1 shadow-inner">
        {battleLogs.length === 0 ? (
          <div className="text-slate-500 italic">No turns played yet. Select a move to attack!</div>
        ) : (
          battleLogs.map((log, i) => (
            <div key={i} className={log.startsWith('---') ? 'text-gold' : log.includes('fainted') || log.includes('lost') ? 'text-rose-400 font-bold' : log.includes('wins') ? 'text-emerald-400 font-bold' : 'text-slate-300'}>
              {log}
            </div>
          ))
        )}
        <div ref={logEndRef} />
      </div>

      {/* Control Actions / Switch Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Moves Selection */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col gap-2">
          <label className="fld">Choose Attack</label>
          <div className="grid grid-cols-2 gap-2">
            {pActive.hp <= 0 ? (
              <p className="col-span-2 text-center text-xs text-rose-400 italic py-2">
                This Pokémon has fainted. Please switch!
              </p>
            ) : isOnlineTurnWaiting ? (
              <p className="col-span-2 text-center text-xs text-amber-400 animate-pulse py-2">
                Waiting for opponent to submit move...
              </p>
            ) : (
              pActive.moves.map(m => (
                <button
                  key={m.name}
                  onClick={() => (battleMode === 'offline' ? resolveOfflineTurn(m) : submitOnlineMove(m.name))}
                  className="flex flex-col items-start p-2.5 rounded-lg border border-slate-700 bg-slate-950/50 hover:border-gold hover:bg-slate-900 text-left transition-colors"
                >
                  <span className="text-sm font-bold text-white">{m.name}</span>
                  <div className="flex justify-between w-full mt-1 text-[10px] font-mono text-slate-400">
                    <span>Power: {m.power}</span>
                    <span>Acc: {m.accuracy}%</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Switch Pokémon Selection */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col gap-2">
          <label className="fld">Switch Team Member</label>
          <div className="flex flex-col gap-1.5">
            {playerTeam.map((p, idx) => {
              const active = idx === activePlayerIdx;
              const fainted = p.hp <= 0;
              return (
                <button
                  key={p.id}
                  disabled={active || fainted || isOnlineTurnWaiting}
                  onClick={() => onPlayerSwitch(idx)}
                  className={`flex items-center justify-between p-2 rounded-lg border text-sm transition-all ${
                    active
                      ? 'border-gold bg-gold/10 text-white font-bold'
                      : fainted
                      ? 'border-slate-800 bg-slate-950/20 text-slate-600 cursor-not-allowed'
                      : 'border-slate-700 bg-slate-950/50 text-slate-300 hover:border-slate-500 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 flex items-center justify-center bg-slate-950/60 rounded overflow-hidden border border-slate-800/40 p-0.5">
                      {fainted ? (
                        <span className="text-xs">💀</span>
                      ) : (
                        <img 
                          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.dexNumber || 25}.png`}
                          alt={p.name}
                          className="w-full h-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                      )}
                    </div>
                    <div className="text-left">
                      <div>{p.name}</div>
                      <div className="text-[10px] text-slate-400">{p.type.join('/')}</div>
                    </div>
                  </div>
                  <span className="text-xs font-mono">
                    {p.hp} / {p.maxHp} HP
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
