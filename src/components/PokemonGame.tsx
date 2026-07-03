import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Pokemon, Move } from '../types';
import { POKEMON_ROSTER, NPC_TRAINERS, NpcTrainer } from '../data';
import { PokemonSprite } from './PokemonSprites';
import { gameAudio } from '../utils/audio';
import { Battle3DVfx, ActiveVfx } from './Battle3DVfx';
import { BattleOverModal } from './BattleOverModal';

const REGION_TABS = [
  { id: 'Kanto', label: 'Gen 1: Kanto' },
  { id: 'Johto', label: 'Gen 2: Johto' },
  { id: 'Hoenn', label: 'Gen 3: Hoenn' },
  { id: 'Sinnoh', label: 'Gen 4: Sinnoh' },
  { id: 'Unova', label: 'Gen 5: Unova' },
  { id: 'Kalos', label: 'Gen 6: Kalos' },
  { id: 'Alola', label: 'Gen 7: Alola' },
  { id: 'Galar', label: 'Gen 8: Galar' },
  { id: 'Paldea', label: 'Gen 9: Pallidia (Paldea)' }
];

const ALL_TYPES = [
  'Normal', 'Fire', 'Water', 'Grass', 'Electric', 'Ice', 'Fighting', 'Poison', 
  'Ground', 'Flying', 'Psychic', 'Bug', 'Rock', 'Ghost', 'Dragon', 'Dark', 'Steel', 'Fairy'
];

const getTypePillColor = (type: string) => {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    Normal: { bg: 'bg-neutral-500/10', text: 'text-neutral-400', border: 'border-neutral-500/30' },
    Fire: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30' },
    Water: { bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/30' },
    Grass: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
    Electric: { bg: 'bg-amber-400/10', text: 'text-amber-400', border: 'border-amber-400/30' },
    Ice: { bg: 'bg-cyan-400/10', text: 'text-cyan-400', border: 'border-cyan-400/30' },
    Fighting: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
    Poison: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
    Ground: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' },
    Flying: { bg: 'bg-indigo-400/10', text: 'text-indigo-400', border: 'border-indigo-400/30' },
    Psychic: { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/30' },
    Bug: { bg: 'bg-lime-500/10', text: 'text-lime-400', border: 'border-lime-500/30' },
    Rock: { bg: 'bg-yellow-600/10', text: 'text-yellow-500', border: 'border-yellow-600/30' },
    Ghost: { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/30' },
    Dragon: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/30' },
    Dark: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/30' },
    Steel: { bg: 'bg-blue-400/10', text: 'text-blue-400', border: 'border-blue-400/30' },
    Fairy: { bg: 'bg-fuchsia-400/10', text: 'text-fuchsia-400', border: 'border-fuchsia-400/30' }
  };
  return colors[type] || { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/30' };
};

interface PokemonGameProps {
  trainerName: string;
  trainerAvatar: string;
  onBackToBoot: () => void;
}

export const PokemonGame: React.FC<PokemonGameProps> = ({
  trainerName,
  trainerAvatar,
  onBackToBoot
}) => {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'campaign' | 'versus' | 'pokedex' | 'synth'>('campaign');
  
  // Active region filters for different Pokémon selection lists
  const [campaignRegion, setCampaignRegion] = useState<string>('Kanto');
  const [draftP1Region, setDraftP1Region] = useState<string>('Kanto');
  const [draftP2Region, setDraftP2Region] = useState<string>('Kanto');
  const [pokedexRegion, setPokedexRegion] = useState<string>('Kanto');

  // Game state
  const [gameState, setGameState] = useState<'lobby' | 'teamSelect' | 'battle' | 'gameOver'>('lobby');
  const [battleMode, setBattleMode] = useState<'campaign' | 'versus'>('campaign');
  
  // Campaign progress (0 to 4 defeated bosses)
  const [campaignProgress, setCampaignProgress] = useState<number>(() => {
    return parseInt(localStorage.getItem('pokemon_campaign_progress') || '0', 10);
  });

  // Selected teams for battle
  const [selectedPokeIdsP1, setSelectedPokeIdsP1] = useState<string[]>([]);
  const [selectedPokeIdsP2, setSelectedPokeIdsP2] = useState<string[]>([]);
  const [playerTeam, setPlayerTeam] = useState<Pokemon[]>([]);
  const [opponentTeam, setOpponentTeam] = useState<Pokemon[]>([]);
  const [activeNpc, setActiveNpc] = useState<NpcTrainer | null>(null);

  // Active Battle Parameters
  const [activePlayerIdx, setActivePlayerIdx] = useState(0);
  const [activeOpponentIdx, setActiveOpponentIdx] = useState(0);
  const [battleLogs, setBattleLogs] = useState<string[]>([]);
  const [winnerName, setWinnerName] = useState<string | null>(null);
  const [hasWonCampaignVoucher, setHasWonCampaignVoucher] = useState(false);

  // VS Mode turn states (Pass & Play)
  const [pvpTurnState, setPvpTurnState] = useState<'p1_select' | 'p2_transit' | 'p2_select' | 'resolve'>('p1_select');
  const [p1SelectedMove, setP1SelectedMove] = useState<Move | null>(null);
  const [p2SelectedMove, setP2SelectedMove] = useState<Move | null>(null);

  // Visual feedback animations
  const [isBattleAnimating, setIsBattleAnimating] = useState(false);
  const [playerAttacking, setPlayerAttacking] = useState(false);
  const [opponentAttacking, setOpponentAttacking] = useState(false);
  const [playerHit, setPlayerHit] = useState(false);
  const [opponentHit, setOpponentHit] = useState(false);
  const [playerFloat, setPlayerFloat] = useState<{ text: string; color: string } | null>(null);
  const [opponentFloat, setOpponentFloat] = useState<{ text: string; color: string } | null>(null);
  const [playerEffectiveness, setPlayerEffectiveness] = useState<{ text: string; badgeClass: string } | null>(null);
  const [opponentEffectiveness, setOpponentEffectiveness] = useState<{ text: string; badgeClass: string } | null>(null);
  const [activeVfx, setActiveVfx] = useState<ActiveVfx | null>(null);

  // Interactive Type Chart states
  const [chartAtkType, setChartAtkType] = useState<string>('Electric');
  const [chartDefType, setChartDefType] = useState<string>('Water');

  // Lane positions: -1 = Left, 0 = Center, 1 = Right
  const [playerLane, setPlayerLane] = useState<number>(0);
  const [opponentLane, setOpponentLane] = useState<number>(0);

  // Attack aim direction: -1 = Left, 0 = Center, 1 = Right
  const [playerAimLane, setPlayerAimLane] = useState<number>(0);
  const [opponentAimLane, setOpponentAimLane] = useState<number>(0);

  // Active state visual indicators for D-pad buttons (for active/pressed/animated states)
  const [p1LeftActive, setP1LeftActive] = useState<boolean>(false);
  const [p1RightActive, setP1RightActive] = useState<boolean>(false);
  const [p2LeftActive, setP2LeftActive] = useState<boolean>(false);
  const [p2RightActive, setP2RightActive] = useState<boolean>(false);

  // References to solve the stale closure in the async executeCombatMoves loop, ensuring real-time collision/dodge resolution
  const playerLaneRef = useRef<number>(0);
  const opponentLaneRef = useRef<number>(0);
  const playerAimLaneRef = useRef<number>(0);
  const opponentAimLaneRef = useRef<number>(0);

  useEffect(() => {
    playerLaneRef.current = playerLane;
  }, [playerLane]);

  useEffect(() => {
    opponentLaneRef.current = opponentLane;
  }, [opponentLane]);

  useEffect(() => {
    playerAimLaneRef.current = playerAimLane;
  }, [playerAimLane]);

  useEffect(() => {
    opponentAimLaneRef.current = opponentAimLane;
  }, [opponentAimLane]);

  // Encapsulated lane movement functions with sound & button-flash animations
  const movePlayerLeft = () => {
    setPlayerLane(prev => Math.max(-1, prev - 1));
    setP1LeftActive(true);
    setTimeout(() => setP1LeftActive(false), 150);
  };

  const movePlayerRight = () => {
    setPlayerLane(prev => Math.min(1, prev + 1));
    setP1RightActive(true);
    setTimeout(() => setP1RightActive(false), 150);
  };

  const moveOpponentLeft = () => {
    setOpponentLane(prev => Math.max(-1, prev - 1));
    setP2LeftActive(true);
    setTimeout(() => setP2LeftActive(false), 150);
  };

  const moveOpponentRight = () => {
    setOpponentLane(prev => Math.min(1, prev + 1));
    setP2RightActive(true);
    setTimeout(() => setP2RightActive(false), 150);
  };

  // Log auto-scroll (scrolls only the log container box, preventing full page scroll shifts)
  const logContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [battleLogs]);

  // Keyboard event listener for moving left/right (active at ALL times in battle)
  useEffect(() => {
    if (gameState !== 'battle') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'a') {
        e.preventDefault();
        gameAudio.playSelect();
        movePlayerLeft();
      } else if (key === 'd') {
        e.preventDefault();
        gameAudio.playSelect();
        movePlayerRight();
      } else if (key === 'arrowleft') {
        e.preventDefault();
        gameAudio.playSelect();
        if (battleMode === 'campaign') {
          movePlayerLeft(); // In Campaign, both A/D and Arrow Keys can control Player 1
        } else {
          moveOpponentLeft(); // In Local Versus, Arrow keys control Player 2 (Opponent)
        }
      } else if (key === 'arrowright') {
        e.preventDefault();
        gameAudio.playSelect();
        if (battleMode === 'campaign') {
          movePlayerRight();
        } else {
          moveOpponentRight();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, battleMode]);

  // Campaign Mode: AI live movement during battle (NPC slides around periodically, ACTIVE AT ALL TIMES including during attacks)
  useEffect(() => {
    if (gameState !== 'battle' || battleMode !== 'campaign') return;

    const interval = setInterval(() => {
      // 35% chance to change lane every 3.5 seconds
      if (Math.random() < 0.35) {
        const currentAI = opponentLaneRef.current;
        const choices = [-1, 0, 1].filter(l => l !== currentAI);
        if (choices.length > 0) {
          const nextLane = choices[Math.floor(Math.random() * choices.length)];
          setOpponentLane(nextLane);
          gameAudio.playPop(); // movement pop sound

          // Flash automated D-pad
          if (nextLane < currentAI) {
            setP2LeftActive(true);
            setTimeout(() => setP2LeftActive(false), 150);
          } else {
            setP2RightActive(true);
            setTimeout(() => setP2RightActive(false), 150);
          }
        }
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [gameState, battleMode]);

  // Handle Team Selection Toggle (Player 1 or Player 2)
  const handlePokeToggleP1 = (id: string) => {
    gameAudio.playSelect();
    if (selectedPokeIdsP1.includes(id)) {
      setSelectedPokeIdsP1(selectedPokeIdsP1.filter(x => x !== id));
    } else if (selectedPokeIdsP1.length < 3) {
      setSelectedPokeIdsP1([...selectedPokeIdsP1, id]);
    }
  };

  const handlePokeToggleP2 = (id: string) => {
    gameAudio.playSelect();
    if (selectedPokeIdsP2.includes(id)) {
      setSelectedPokeIdsP2(selectedPokeIdsP2.filter(x => x !== id));
    } else if (selectedPokeIdsP2.length < 3) {
      setSelectedPokeIdsP2([...selectedPokeIdsP2, id]);
    }
  };

  // Start Campaign Match
  const startCampaignBattle = (npc: NpcTrainer) => {
    if (selectedPokeIdsP1.length !== 3) {
      gameAudio.playFaint();
      alert("Please select exactly 3 Pokémon for your team first!");
      return;
    }
    gameAudio.playSelect();
    setBattleMode('campaign');
    setActiveNpc(npc);

    // Deep copy roster objects
    const pTeam = POKEMON_ROSTER.filter(p => selectedPokeIdsP1.includes(p.id)).map(p => ({ ...p }));
    const oppTeam = npc.team.map(name => {
      const original = POKEMON_ROSTER.find(x => x.name === name);
      return original ? JSON.parse(JSON.stringify(original)) : JSON.parse(JSON.stringify(POKEMON_ROSTER[0]));
    });

    setPlayerTeam(pTeam);
    setOpponentTeam(oppTeam);
    setActivePlayerIdx(0);
    setActiveOpponentIdx(0);
    setPlayerLane(0);
    setOpponentLane(0);
    setPlayerAimLane(0);
    setOpponentAimLane(0);
    setBattleLogs([`Battle started against ${npc.name} (${npc.role})!`, `${npc.name}: "${npc.intro}"`]);
    setGameState('battle');
  };

  // Start Versus Match (Draft Screen)
  const enterVersusDraft = () => {
    gameAudio.playSelect();
    setSelectedPokeIdsP1([]);
    setSelectedPokeIdsP2([]);
    setBattleMode('versus');
    setGameState('teamSelect');
  };

  const startVersusBattle = () => {
    if (selectedPokeIdsP1.length !== 3 || selectedPokeIdsP2.length !== 3) {
      gameAudio.playFaint();
      alert("Both players must draft exactly 3 Pokémon each!");
      return;
    }
    gameAudio.playSelect();
    const p1Team = POKEMON_ROSTER.filter(p => selectedPokeIdsP1.includes(p.id)).map(p => ({ ...p }));
    const p2Team = POKEMON_ROSTER.filter(p => selectedPokeIdsP2.includes(p.id)).map(p => ({ ...p }));

    setPlayerTeam(p1Team);
    setOpponentTeam(p2Team);
    setActivePlayerIdx(0);
    setActiveOpponentIdx(0);
    setPlayerLane(0);
    setOpponentLane(0);
    setPlayerAimLane(0);
    setOpponentAimLane(0);
    setBattleLogs([`Local PvP Versus Battle started!`, `Trainer ${trainerName} vs rival Challenger!`]);
    setPvpTurnState('p1_select');
    setP1SelectedMove(null);
    setP2SelectedMove(null);
    setGameState('battle');
  };

  // Type Chart Multipliers
  const getTypeMult = (atk: string, defs: string[]) => {
    const chart: Record<string, Record<string, number>> = {
      Normal: { Rock: 0.5, Ghost: 0, Steel: 0.5 },
      Fire: { Fire: 0.5, Water: 0.5, Grass: 2, Ice: 2, Bug: 2, Rock: 0.5, Dragon: 0.5, Steel: 2 },
      Water: { Fire: 2, Water: 0.5, Grass: 0.5, Ground: 2, Rock: 2, Dragon: 0.5 },
      Grass: { Fire: 0.5, Water: 2, Grass: 0.5, Poison: 0.5, Ground: 2, Flying: 0.5, Bug: 0.5, Rock: 2, Dragon: 0.5, Steel: 0.5 },
      Electric: { Water: 2, Electric: 0.5, Grass: 0.5, Ground: 0, Flying: 2, Dragon: 0.5 },
      Ice: { Fire: 0.5, Water: 0.5, Grass: 2, Ice: 0.5, Ground: 2, Flying: 2, Dragon: 2, Steel: 0.5 },
      Fighting: { Normal: 2, Ice: 2, Poison: 0.5, Flying: 0.5, Psychic: 0.5, Bug: 0.5, Rock: 2, Ghost: 0, Dark: 2, Steel: 2, Fairy: 0.5 },
      Poison: { Grass: 2, Poison: 0.5, Ground: 0.5, Rock: 0.5, Ghost: 0.5, Steel: 0, Fairy: 2 },
      Ground: { Fire: 2, Electric: 2, Grass: 0.5, Poison: 2, Flying: 0, Bug: 0.5, Rock: 2, Steel: 2 },
      Flying: { Grass: 2, Electric: 0.5, Fighting: 2, Bug: 2, Rock: 0.5, Steel: 0.5 },
      Psychic: { Fighting: 2, Poison: 2, Psychic: 0.5, Dark: 0, Steel: 0.5 },
      Bug: { Fire: 0.5, Grass: 2, Fighting: 0.5, Poison: 0.5, Flying: 0.5, Psychic: 2, Ghost: 0.5, Dark: 2, Steel: 0.5, Fairy: 0.5 },
      Rock: { Fire: 2, Ice: 2, Fighting: 0.5, Ground: 0.5, Flying: 2, Bug: 2, Steel: 0.5 },
      Ghost: { Normal: 0, Psychic: 2, Ghost: 2, Dark: 0.5 },
      Dragon: { Dragon: 2, Steel: 0.5, Fairy: 0 },
      Dark: { Fighting: 0.5, Psychic: 2, Ghost: 2, Dark: 0.5, Fairy: 0.5 },
      Steel: { Fire: 0.5, Water: 0.5, Electric: 0.5, Ice: 2, Rock: 2, Steel: 0.5, Fairy: 2 },
      Fairy: { Fire: 0.5, Fighting: 2, Poison: 0.5, Dragon: 2, Dark: 2, Steel: 0.5 }
    };
    let m = 1;
    const row = chart[atk];
    if (row) {
      defs.forEach(d => { if (row[d] !== undefined) m *= row[d]; });
    }
    return m;
  };

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Resolve one dynamic turn action (Used by both modes)
  const executeCombatMoves = async (p1Move: Move, p2Move: Move) => {
    setIsBattleAnimating(true);

    const curP1 = playerTeam[activePlayerIdx];
    const curP2 = opponentTeam[activeOpponentIdx];

    const logs: string[] = [...battleLogs];
    logs.push(`\n--- Turn Action ---`);
    setBattleLogs([...logs]);

    const p1First = curP1.speed >= curP2.speed;
    const order = p1First
      ? [
          { actor: curP1, target: curP2, move: p1Move, isP1: true },
          { actor: curP2, target: curP1, move: p2Move, isP1: false }
        ]
      : [
          { actor: curP2, target: curP1, move: p2Move, isP1: false },
          { actor: curP1, target: curP2, move: p1Move, isP1: true }
        ];

    let p1Fainted = false;
    let p2Fainted = false;

    // Resolve sequentially with custom delays
    for (let idx = 0; idx < order.length; idx++) {
      const act = order[idx];

      if (act.actor.hp <= 0) {
        continue; // Fainted already during first step
      }

      // Paralysis skip check
      if (act.actor.status === 'Paralyzed' && Math.random() < 0.25) {
        logs.push(`${act.actor.name} is paralyzed! It can't move.`);
        setBattleLogs([...logs]);
        await delay(1200);
        continue;
      }

      // 1. ANNOUNCE AND LAUNCH ATTACK
      logs.push(`${act.isP1 ? 'Your' : (battleMode === 'campaign' ? "Opponent's" : "Player 2's")} ${act.actor.name} used ${act.move.name}!`);
      setBattleLogs([...logs]);

      // Attacker lunge
      if (act.isP1) {
        setPlayerAttacking(true);
        setTimeout(() => setPlayerAttacking(false), 300);
      } else {
        setOpponentAttacking(true);
        setTimeout(() => setOpponentAttacking(false), 300);
      }

      // Determine real-time positions for projectile and dynamic damage evaluation
      const currentActorLane = act.isP1 ? playerLaneRef.current : opponentLaneRef.current;
      let currentAimLane = 0;

      if (act.isP1) {
        currentAimLane = playerAimLaneRef.current;
      } else {
        // AI Pokémon or Player 2 in versus mode: automatically select where to aim!
        if (battleMode === 'campaign') {
          // AI Pokémon aims at Player 1: 65% chance to aim exactly at the player's current lane
          if (Math.random() < 0.65) {
            currentAimLane = playerLaneRef.current;
          } else {
            // 35% chance to aim at any random lane
            const possibleLanes = [-1, 0, 1];
            currentAimLane = possibleLanes[Math.floor(Math.random() * possibleLanes.length)];
          }
          // Sync state/ref for UI warning overlay rendering
          setOpponentAimLane(currentAimLane);
          opponentAimLaneRef.current = currentAimLane;
        } else {
          // Versus Mode: Player 2 (opponent) aims at opponentAimLane which is selected manually!
          currentAimLane = opponentAimLaneRef.current;
        }
      }

      const isHeal = act.move.category === 'Status' && act.move.effect === 'heal';

      if (isHeal) {
        gameAudio.playHeal();
        // Trigger heal 3D aura
        setActiveVfx({
          moveName: act.move.name,
          type: 'Heal',
          direction: act.isP1 ? 'p1_to_p2' : 'p2_to_p1',
          stage: 'travel',
          category: act.move.category,
          actorLane: currentActorLane,
          aimLane: currentAimLane
        });
      } else {
        gameAudio.playBeam();
        // Trigger projectile 3D flight
        setActiveVfx({
          moveName: act.move.name,
          type: act.move.type,
          direction: act.isP1 ? 'p1_to_p2' : 'p2_to_p1',
          stage: 'travel',
          category: act.move.category,
          actorLane: currentActorLane,
          aimLane: currentAimLane
        });
      }

      // During the 600ms projectile flight delay, let the Campaign AI dynamically change lanes (dodge/attack shift)
      if (battleMode === 'campaign' && !isHeal) {
        if (act.isP1) {
          // AI under attack: 65% chance to dodge the incoming attack by moving out of player's AIMED lane
          setTimeout(() => {
            if (Math.random() < 0.65) {
              const currentAI = opponentLaneRef.current;
              const playerAim = playerAimLaneRef.current;
              // Choose any lane that is NOT the player's aimed lane to successfully dodge
              const choices = [-1, 0, 1].filter(l => l !== playerAim);
              if (choices.length > 0) {
                const nextLane = choices[Math.floor(Math.random() * choices.length)];
                setOpponentLane(nextLane);
                gameAudio.playPop();

                // Trigger AI D-pad active flashing state
                if (nextLane < currentAI) {
                  setP2LeftActive(true);
                  setTimeout(() => setP2LeftActive(false), 150);
                } else if (nextLane > currentAI) {
                  setP2RightActive(true);
                  setTimeout(() => setP2RightActive(false), 150);
                }
              }
            }
          }, Math.floor(Math.random() * 150) + 200); // 200ms to 350ms reaction window
        } else {
          // AI attacking: 50% chance to mix up its lane to force the player to react
          setTimeout(() => {
            if (Math.random() < 0.50) {
              const currentAI = opponentLaneRef.current;
              const choices = [-1, 0, 1].filter(l => l !== currentAI);
              if (choices.length > 0) {
                const nextLane = choices[Math.floor(Math.random() * choices.length)];
                setOpponentLane(nextLane);
                gameAudio.playPop();

                // Trigger AI D-pad active flashing state
                if (nextLane < currentAI) {
                  setP2LeftActive(true);
                  setTimeout(() => setP2LeftActive(false), 150);
                } else {
                  setP2RightActive(true);
                  setTimeout(() => setP2RightActive(false), 150);
                }
              }
            }
          }, Math.floor(Math.random() * 150) + 150); // 150ms to 300ms reaction window
        }
      }

      // Wait 600ms for projectile travel
      await delay(600);

      // Read real-time lanes from Refs (fully dynamic, bypassing React stale closure)
      const targetLane = act.isP1 ? opponentLaneRef.current : playerLaneRef.current;
      const isDodged = !isHeal && (currentAimLane !== targetLane);

      // 2. DELAYED IMPACT RESOLUTION
      if (!isHeal) {
        if (isDodged) {
          gameAudio.playPop(); // Swoosh/pop sound for dodge
          const aimDirectionName = currentAimLane === -1 ? 'Left' : currentAimLane === 1 ? 'Right' : 'Middle';
          const targetLaneName = targetLane === -1 ? 'Left' : targetLane === 1 ? 'Right' : 'Middle';
          logs.push(`💨 ${act.target.name} dodged the attack! (Aimed: ${aimDirectionName} vs actual position: ${targetLaneName})`);
          if (act.isP1) {
            setOpponentFloat({ text: `💨 DODGED!`, color: 'text-cyan-400 font-extrabold shadow-lg border-cyan-400/20' });
            setTimeout(() => setOpponentFloat(null), 1000);
          } else {
            setPlayerFloat({ text: `💨 DODGED!`, color: 'text-cyan-400 font-extrabold shadow-lg border-cyan-400/20' });
            setTimeout(() => setPlayerFloat(null), 1000);
          }
        } else {
          // Impact VFX and Shake target
          setActiveVfx(prev => prev ? { ...prev, stage: 'impact' } : null);
          gameAudio.playHit();
          if (act.isP1) {
            setOpponentHit(true);
            setTimeout(() => setOpponentHit(false), 250);
          } else {
            setPlayerHit(true);
            setTimeout(() => setPlayerHit(false), 250);
          }
        }
      }

      // Resolve stats/HP state changes
      if (isHeal) {
        const heal = Math.floor(act.actor.maxHp * 0.5);
        act.actor.hp = Math.min(act.actor.maxHp, act.actor.hp + heal);
        logs.push(`${act.actor.name} recovered ${heal} HP!`);
        if (act.isP1) {
          setPlayerFloat({ text: `+${heal} HP`, color: 'text-emerald-400' });
          setTimeout(() => setPlayerFloat(null), 1000);
        } else {
          setOpponentFloat({ text: `+${heal} HP`, color: 'text-emerald-400' });
          setTimeout(() => setOpponentFloat(null), 1000);
        }
      } else if (!isDodged) {
        // Regular Damage Attack (Hits successfully!)
        let dmg = Math.floor((act.move.power * (act.actor.spAtk / act.target.spDef)) / 5) + 5;
        if (act.actor.status === 'Burned') dmg = Math.floor(dmg * 0.5);

        const mult = getTypeMult(act.move.type, act.target.type);
        dmg = Math.floor(dmg * mult);
        act.target.hp = Math.max(0, act.target.hp - dmg);

        let effectivenessData: { text: string; badgeClass: string } | null = null;
        if (mult > 1) {
          logs.push("It's super effective!");
          effectivenessData = {
            text: "⚡ SUPER EFFECTIVE!",
            badgeClass: "bg-amber-500 text-slate-950 border-amber-300 font-extrabold shadow-[0_0_15px_rgba(245,158,11,0.6)]"
          };
        } else if (mult < 1 && mult > 0) {
          logs.push("It's not very effective...");
          effectivenessData = {
            text: "🛡️ NOT VERY EFFECTIVE",
            badgeClass: "bg-slate-700 text-slate-300 border-slate-500 shadow-inner"
          };
        } else if (mult === 0) {
          logs.push(`It has no effect on ${act.target.name}...`);
          effectivenessData = {
            text: "❌ NO EFFECT",
            badgeClass: "bg-rose-950 text-rose-300 border-rose-850 shadow-[0_0_12px_rgba(244,63,94,0.4)]"
          };
        } else {
          // mult === 1
          effectivenessData = {
            text: "🎯 EFFECTIVE",
            badgeClass: "bg-sky-500 text-slate-950 border-sky-300 shadow-[0_0_12px_rgba(14,165,233,0.5)]"
          };
        }

        logs.push(`Dealt ${dmg} damage.`);
        if (act.isP1) {
          setOpponentFloat({ text: `-${dmg} HP`, color: 'text-rose-400' });
          if (effectivenessData) {
            setOpponentEffectiveness(effectivenessData);
            setTimeout(() => setOpponentEffectiveness(null), 1500);
          }
          setTimeout(() => setOpponentFloat(null), 1000);
        } else {
          setPlayerFloat({ text: `-${dmg} HP`, color: 'text-rose-400' });
          if (effectivenessData) {
            setPlayerEffectiveness(effectivenessData);
            setTimeout(() => setPlayerEffectiveness(null), 1500);
          }
          setTimeout(() => setPlayerFloat(null), 1000);
        }

        // Apply Status Condition
        if (act.move.effect && act.target.hp > 0 && act.target.status === 'None') {
          if (act.move.effect === 'burn' && Math.random() < 0.3) {
            act.target.status = 'Burned';
            logs.push(`${act.target.name} was burned!`);
          } else if (act.move.effect === 'paralyze' && Math.random() < 0.3) {
            act.target.status = 'Paralyzed';
            logs.push(`${act.target.name} was paralyzed!`);
          }
        }

        if (act.target.hp <= 0) {
          logs.push(`${act.target.name} fainted!`);
          setTimeout(() => gameAudio.playFaint(), 200);
          if (act.isP1) p2Fainted = true;
          else p1Fainted = true;
        }
      }

      setBattleLogs([...logs]);

      // Wait 500ms before clearing VFX (total 1100ms)
      await delay(500);
      setActiveVfx(null);

      // Wait 900ms for full action resolution and readability (total 2000ms)
      await delay(900);

      if (p1Fainted || p2Fainted) {
        break;
      }
    }

    // 3. APPLY BURNS / GAME OVER RESOLUTION
    let burnLogAdded = false;
    [curP1, curP2].forEach((p, isIndexP2) => {
      if (p.hp > 0 && p.status === 'Burned') {
        const bDmg = Math.floor(p.maxHp * 0.08);
        p.hp = Math.max(0, p.hp - bDmg);
        logs.push(`${p.name} took ${bDmg} burn damage.`);
        burnLogAdded = true;
        if (p.hp <= 0) {
          logs.push(`${p.name} fainted!`);
          setTimeout(() => gameAudio.playFaint(), 100);
          if (isIndexP2 === 0) p1Fainted = true;
          else p2Fainted = true;
        }
      }
    });

    if (burnLogAdded) {
      setBattleLogs([...logs]);
      await delay(1000);
    }

    // Check End Game and Switch Out Fainted Pokémon
    const activeP1 = playerTeam[activePlayerIdx];
    const activeP2 = opponentTeam[activeOpponentIdx];

    let gameEnded = false;

    // 1. If Opponent's active Pokémon fainted
    if (activeP2.hp <= 0) {
      if (battleMode === 'campaign') {
        // Trainer/Campaign Battle: make the Pokémon faint and immediately give Player 1 the victory screen
        logs.push(`\n🏆 Opponent's ${activeP2.name} fainted! You won the battle!`);
        setGameState('gameOver');
        setWinnerName(trainerName);
        if (activeNpc) {
          setHasWonCampaignVoucher(true);
          const currentNpcIdx = NPC_TRAINERS.findIndex(x => x.name === activeNpc.name);
          if (currentNpcIdx >= campaignProgress) {
            const nextProgress = currentNpcIdx + 1;
            setCampaignProgress(nextProgress);
            localStorage.setItem('pokemon_campaign_progress', String(nextProgress));
          }
        }
        gameEnded = true;
      } else {
        // Versus Mode: force another Pokémon of Player 2 to come out
        const nextOppIdx = opponentTeam.findIndex(p => p.hp > 0);
        if (nextOppIdx !== -1) {
          setActiveOpponentIdx(nextOppIdx);
          logs.push(`\n🔄 Player 2's ${activeP2.name} fainted! ${opponentTeam[nextOppIdx].name} was forced onto the battlefield!`);
          setTimeout(() => gameAudio.playHeal(), 300);
        } else {
          logs.push(`\n🏆 All opposing Pokémon have fainted! Player 1 wins the battle!`);
          setGameState('gameOver');
          setWinnerName(trainerName);
          gameEnded = true;
        }
      }
    }

    // 2. If Player's active Pokémon fainted (checked if game hasn't ended already)
    if (!gameEnded && activeP1.hp <= 0) {
      const nextPlayerIdx = playerTeam.findIndex(p => p.hp > 0);
      if (nextPlayerIdx !== -1) {
        setActivePlayerIdx(nextPlayerIdx);
        logs.push(`\n🔄 Your ${activeP1.name} fainted! ${playerTeam[nextPlayerIdx].name} was forced onto the battlefield!`);
        setTimeout(() => gameAudio.playHeal(), 300);
      } else {
        logs.push(`\n❌ All your Pokémon have fainted. You lost the battle!`);
        setGameState('gameOver');
        setWinnerName(battleMode === 'campaign' ? activeNpc?.name || "Opponent" : "Player 2");
        setHasWonCampaignVoucher(false);
        gameEnded = true;
      }
    }

    setBattleLogs([...logs]);

    setIsBattleAnimating(false);
  };

  // Resolve Campaign Turn
  const resolveCampaignTurn = (move: Move) => {
    gameAudio.playSelect();
    const curOpponent = opponentTeam[activeOpponentIdx];
    // Random AI attack
    const aiMoves = curOpponent.moves.filter(m => m.power > 0 || m.effect === 'heal');
    const aiMove = aiMoves[Math.floor(Math.random() * aiMoves.length)];

    executeCombatMoves(move, aiMove);
  };

  // Submit move in Local PvP (Pass & Play)
  const submitVersusMove = (move: Move) => {
    gameAudio.playSelect();
    if (pvpTurnState === 'p1_select') {
      setP1SelectedMove(move);
      setPvpTurnState('p2_transit');
    } else if (pvpTurnState === 'p2_select') {
      setP2SelectedMove(move);
      setPvpTurnState('p1_select'); // reset turn select for next rounds
      executeCombatMoves(p1SelectedMove!, move);
    }
  };

  // Handle rematch with same team selection
  const handleRematch = () => {
    gameAudio.playSelect();
    
    if (battleMode === 'campaign' && activeNpc) {
      const pTeam = POKEMON_ROSTER.filter(p => selectedPokeIdsP1.includes(p.id)).map(p => ({ ...p }));
      const oppTeam = activeNpc.team.map(name => {
        const original = POKEMON_ROSTER.find(x => x.name === name);
        return original ? JSON.parse(JSON.stringify(original)) : JSON.parse(JSON.stringify(POKEMON_ROSTER[0]));
      });
      setPlayerTeam(pTeam);
      setOpponentTeam(oppTeam);
      setBattleLogs([
        `Rematch initiated against ${activeNpc.name} (${activeNpc.role})!`,
        `${activeNpc.name}: "${activeNpc.intro}"`
      ]);
    } else if (battleMode === 'versus') {
      const p1Team = POKEMON_ROSTER.filter(p => selectedPokeIdsP1.includes(p.id)).map(p => ({ ...p }));
      const p2Team = POKEMON_ROSTER.filter(p => selectedPokeIdsP2.includes(p.id)).map(p => ({ ...p }));
      setPlayerTeam(p1Team);
      setOpponentTeam(p2Team);
      setBattleLogs([
        `Local PvP Versus Rematch started!`,
        `Trainer ${trainerName} vs rival Challenger!`
      ]);
      setPvpTurnState('p1_select');
      setP1SelectedMove(null);
      setP2SelectedMove(null);
    }
    
    setActivePlayerIdx(0);
    setActiveOpponentIdx(0);
    setPlayerLane(0);
    setOpponentLane(0);
    setPlayerAimLane(0);
    setOpponentAimLane(0);
    setPlayerHit(false);
    setOpponentHit(false);
    setPlayerFloat(null);
    setOpponentFloat(null);
    setPlayerEffectiveness(null);
    setOpponentEffectiveness(null);
    setActiveVfx(null);
    setHasWonCampaignVoucher(false);
    setIsBattleAnimating(false);
    setGameState('battle');
  };

  // Handle returning from battle to either Lobby or Versus selection board
  const handleReturnToSelection = () => {
    gameAudio.playSelect();
    setIsBattleAnimating(false);
    setPlayerEffectiveness(null);
    setOpponentEffectiveness(null);
    if (battleMode === 'versus') {
      setSelectedPokeIdsP1([]);
      setSelectedPokeIdsP2([]);
      setP1SelectedMove(null);
      setP2SelectedMove(null);
      setGameState('teamSelect');
    } else {
      setGameState('lobby');
      setP1SelectedMove(null);
      setP2SelectedMove(null);
    }
  };

  // Switch Active Battle Pokémon
  const handlePlayerSwitch = (idx: number) => {
    gameAudio.playSelect();
    setActivePlayerIdx(idx);
    const logs = [...battleLogs, `\n🔄 You switched out to ${playerTeam[idx].name}!`];
    setBattleLogs(logs);
  };

  const handleOpponentSwitch = (idx: number) => {
    gameAudio.playSelect();
    setActiveOpponentIdx(idx);
    const logs = [...battleLogs, `\n🔄 Opponent switched out to ${opponentTeam[idx].name}!`];
    setBattleLogs(logs);
  };

  // HP progress color mapping
  const hpProgressColor = (hp: number, max: number) => {
    const ratio = hp / max;
    if (ratio > 0.5) return 'bg-emerald-500';
    if (ratio > 0.2) return 'bg-amber-500';
    return 'bg-rose-500 animate-pulse';
  };

  // Synthetic live piano keyboard parameters
  const synthPianoKeys = [
    { note: 'C4', freq: 261.63, color: 'white' },
    { note: 'C#4', freq: 277.18, color: 'black' },
    { note: 'D4', freq: 293.66, color: 'white' },
    { note: 'D#4', freq: 311.13, color: 'black' },
    { note: 'E4', freq: 329.63, color: 'white' },
    { note: 'F4', freq: 349.23, color: 'white' },
    { note: 'F#4', freq: 369.99, color: 'black' },
    { note: 'G4', freq: 392.00, color: 'white' },
    { note: 'G#4', freq: 415.30, color: 'black' },
    { note: 'A4', freq: 440.00, color: 'white' },
    { note: 'A#4', freq: 466.16, color: 'black' },
    { note: 'B4', freq: 493.88, color: 'white' },
    { note: 'C5', freq: 523.25, color: 'white' }
  ];

  const playPianoNote = (freq: number) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
      
      osc.start();
      osc.stop(audioCtx.currentTime + 0.36);
    } catch (e) {}
  };

  // Active Pokedex info helper
  const selectedPokedexPoke = POKEMON_ROSTER.find(x => x.id === selectedPokeIdsP1[0]) || POKEMON_ROSTER[0];

  return (
    <div className="flex flex-col gap-6">
      
      {/* Dynamic Sub-Navigation Header inside Applet */}
      {gameState === 'lobby' && (
        <div className="flex flex-wrap gap-2.5 bg-slate-900/50 border border-slate-800 p-2.5 rounded-2xl">
          {[
            { id: 'campaign', label: '🏆 Campaign Mode', desc: 'Fight School Mentors' },
            { id: 'versus', label: '⚔️ Local Versus', desc: 'Pass & Play Friends' },
            { id: 'pokedex', label: '📚 Pokédex Academy', desc: 'Type advantage stats' },
            { id: 'synth', label: '🎹 8-Bit Synthesizer', desc: 'Live Piano Soundboard' }
          ].map(t => {
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => { gameAudio.playSelect(); setActiveTab(t.id as any); }}
                className={`flex-1 min-w-[140px] text-left p-3 rounded-xl border transition-all ${
                  active
                    ? 'border-amber-500 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.08)]'
                    : 'border-slate-800/80 bg-slate-950/40 hover:border-slate-700'
                }`}
              >
                <div className={`font-cinzel text-xs font-bold ${active ? 'text-amber-500' : 'text-slate-200'}`}>
                  {t.label}
                </div>
                <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                  {t.desc}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* LOBBY VIEWS */}
      {gameState === 'lobby' && (
        <div className="animate-fade flex flex-col gap-6">
          
          {/* 1. CAMPAIGN TAB */}
          {activeTab === 'campaign' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Draft Configuration Panel */}
              <div className="lg:col-span-5 bg-slate-950 border-2 border-slate-900 rounded-2xl p-5 flex flex-col justify-between">
                <div>
                  <h3 className="font-cinzel font-bold text-lg text-amber-500 flex items-center gap-1.5 border-b border-slate-900 pb-3 mb-4">
                    <span>Draft Your 3-Pokémon Team</span>
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mb-4 leading-relaxed">
                    Choose exactly 3 elements to participate in the championship against School Bosses.
                  </p>

                  {/* Generation/Region Tab Selectors */}
                  <div className="flex gap-1 overflow-x-auto pb-2 mb-3 scrollbar-none border-b border-slate-900/50">
                    {REGION_TABS.map(tab => {
                      const isActive = campaignRegion === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => { gameAudio.playSelect(); setCampaignRegion(tab.id); }}
                          className={`px-2.5 py-1.5 rounded-lg text-[10px] font-mono whitespace-nowrap border transition-all ${
                            isActive
                              ? 'border-amber-500 bg-amber-500/10 text-amber-500 font-bold shadow-sm'
                              : 'border-slate-850 bg-slate-900/30 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                          }`}
                        >
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                    {POKEMON_ROSTER.filter(p => p.region === campaignRegion).map(p => {
                      const isSelected = selectedPokeIdsP1.includes(p.id);
                      const draftIdx = selectedPokeIdsP1.indexOf(p.id);
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handlePokeToggleP1(p.id)}
                          className={`relative text-left p-3 rounded-xl border transition-all ${
                            isSelected
                              ? 'border-amber-500 bg-amber-500/10'
                              : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                          }`}
                        >
                          {isSelected && (
                            <span className="absolute top-2 right-2 bg-amber-500 text-slate-950 text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center font-mono shadow">
                              {draftIdx + 1}
                            </span>
                          )}
                          <div className="w-10 h-10 flex items-center justify-center bg-slate-950/60 rounded-xl overflow-hidden p-0.5 border border-slate-800/40">
                            <img 
                              src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p.dexNumber}.png`}
                              alt={p.name}
                              className="w-full h-full object-contain"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.dexNumber}.png`;
                              }}
                            />
                          </div>
                          <div className="font-bold text-white text-sm mt-1">{p.name}</div>
                          <div className="flex gap-1.5 mt-1 flex-wrap">
                            {p.type.map(t => {
                              const style = getTypePillColor(t);
                              return (
                                <span key={t} className={`text-[8px] font-mono px-1.5 py-0.5 rounded border ${style.bg} ${style.text} ${style.border}`}>
                                  {t}
                                </span>
                              );
                            })}
                          </div>
                          <div className="text-[9px] font-mono text-slate-500 mt-1.5">HP: {p.hp} · Speed: {p.speed}</div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Active Drafted Team Indicator (Cross-generation) */}
                  <div className="mt-4 bg-slate-900/30 border border-slate-800/60 p-3 rounded-xl">
                    <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-2 flex justify-between">
                      <span>Drafted Team Squad</span>
                      <span className="text-amber-500">{selectedPokeIdsP1.length} / 3</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[0, 1, 2].map(idx => {
                        const targetId = selectedPokeIdsP1[idx];
                        const poke = POKEMON_ROSTER.find(x => x.id === targetId);
                        return (
                          <div key={idx} className="flex flex-col items-center justify-center p-2 rounded-lg border border-dashed border-slate-800 bg-slate-950/40 min-h-[70px]">
                            {poke ? (
                              <>
                                <PokemonSprite name={poke.name} dexNumber={poke.dexNumber} className="w-8 h-8 object-contain" />
                                <span className="text-[9px] text-white font-medium truncate max-w-full mt-1">{poke.name}</span>
                              </>
                            ) : (
                              <span className="text-[9px] text-slate-600 font-mono">Empty</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-900 flex justify-between items-center text-xs text-slate-400 font-mono">
                  <span>Selected: {selectedPokeIdsP1.length} / 3</span>
                  {selectedPokeIdsP1.length !== 3 && (
                    <span className="text-amber-500/80 animate-pulse">Select 3 to challenge bosses!</span>
                  )}
                </div>
              </div>

              {/* Boss Challenge Cards List */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                <div className="bg-slate-950 border-2 border-slate-900 rounded-2xl p-5">
                  <h3 className="font-cinzel font-bold text-lg text-slate-100 flex items-center gap-2 border-b border-slate-900 pb-3 mb-4">
                    <span>School Champion Campaign</span>
                    <span className="text-xs bg-slate-900 text-amber-500 border border-amber-500/20 rounded px-2 py-0.5 font-mono">
                      Step-by-Step Challenge
                    </span>
                  </h3>

                  {campaignProgress >= 4 && (
                    <div className="bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-amber-500/20 border-2 border-amber-500/40 rounded-xl p-4 text-center mb-4 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
                      <span className="text-3xl">🏆</span>
                      <h4 className="font-bold text-white mt-1">SPSMUN Champion Cup Mastered!</h4>
                      <p className="text-[11px] text-slate-300 mt-0.5">
                        You have successfully fainted every school boss and secured the Champion's Voucher code!
                      </p>
                      <div className="inline-block bg-slate-950 border border-amber-500/40 rounded px-4 py-1 text-amber-400 font-mono text-sm font-bold tracking-widest mt-2 select-all">
                        SPSMUN-CHAMP-89X72
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-3">
                    {NPC_TRAINERS.map((npc, idx) => {
                      const isUnlocked = idx <= campaignProgress;
                      const isBeaten = idx < campaignProgress;
                      
                      return (
                        <div
                          key={npc.name}
                          className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 rounded-xl border transition-all ${
                            isBeaten
                              ? 'border-emerald-500/20 bg-emerald-950/5'
                              : isUnlocked
                              ? 'border-slate-800 bg-slate-900/30'
                              : 'border-slate-950 bg-slate-950/20 opacity-40'
                          }`}
                        >
                          <div className="flex items-start sm:items-center gap-3.5">
                            <span className="text-3xl bg-slate-900 rounded-full w-12 h-12 flex items-center justify-center border border-slate-800/80 shadow">
                              {npc.avatar}
                            </span>
                            <div>
                              <div className="font-bold text-white text-base flex items-center gap-2">
                                <span>{npc.name}</span>
                                {isBeaten && <span className="text-emerald-400 text-xs font-mono">✓ Defeated</span>}
                                {!isBeaten && !isUnlocked && <span className="text-slate-500 text-[10px] font-mono">Locked</span>}
                                {isUnlocked && !isBeaten && (
                                  <span className="text-amber-500 text-[10px] font-mono animate-pulse">Active Challenger</span>
                                )}
                              </div>
                              <div className="text-xs text-amber-500/80 font-mono mt-0.5">{npc.role}</div>
                              <p className="text-xs text-slate-400 font-mono mt-1.5 italic">"{npc.intro}"</p>
                            </div>
                          </div>

                          <button
                            disabled={!isUnlocked || selectedPokeIdsP1.length !== 3}
                            onClick={() => startCampaignBattle(npc)}
                            className={`btn sm ${isUnlocked && selectedPokeIdsP1.length === 3 ? 'pulse-btn' : ''}`}
                            style={{ minWidth: '100px' }}
                          >
                            {isBeaten ? 'Re-Battle' : 'Battle'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* 2. VERSUS TAB */}
          {activeTab === 'versus' && (
            <div className="bg-slate-950 border-2 border-slate-900 rounded-2xl p-6 text-center max-w-xl mx-auto">
              <span className="text-4xl">⚔️</span>
              <h3 className="font-cinzel font-bold text-xl text-amber-500 mt-2">Local Versus Mode (Pass & Play)</h3>
              <p className="text-xs text-slate-400 font-mono mt-1 mb-6 max-w-sm mx-auto">
                No server needed! Draft teams on the same device and take turns choosing secret attacks.
              </p>

              <button
                onClick={enterVersusDraft}
                className="btn w-full py-3 text-sm flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
              >
                <span>ENTER DRAFT CHAMBER</span>
              </button>
            </div>
          )}

          {/* 3. DEX TAB */}
          {activeTab === 'pokedex' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Dex list */}
              <div className="bg-slate-950 border-2 border-slate-900 rounded-2xl p-5">
                <h3 className="font-cinzel font-bold text-base text-amber-500 border-b border-slate-900 pb-3 mb-4">
                  Pokémon Registry
                </h3>

                {/* Generation/Region Tab Selectors */}
                <div className="flex gap-1 overflow-x-auto pb-2 mb-3.5 scrollbar-none border-b border-slate-900/50">
                  {REGION_TABS.map(tab => {
                    const isActive = pokedexRegion === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => { gameAudio.playSelect(); setPokedexRegion(tab.id); }}
                        className={`px-2.5 py-1.5 rounded-lg text-[10px] font-mono whitespace-nowrap border transition-all ${
                          isActive
                            ? 'border-amber-500 bg-amber-500/10 text-amber-500 font-bold shadow-sm'
                            : 'border-slate-850 bg-slate-900/30 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-2 gap-2.5 max-h-[420px] overflow-y-auto pr-1 scrollbar-thin">
                  {POKEMON_ROSTER.filter(p => p.region === pokedexRegion).map(p => {
                    const isFocus = selectedPokedexPoke.id === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => { gameAudio.playSelect(); setSelectedPokeIdsP1([p.id]); }}
                        className={`text-left p-3 rounded-xl border transition-all ${
                          isFocus
                            ? 'border-amber-500 bg-amber-500/10'
                            : 'border-slate-800 bg-slate-900/30 hover:border-slate-700'
                        }`}
                      >
                        <div className="w-10 h-10 flex items-center justify-center bg-slate-950/60 rounded-xl overflow-hidden p-0.5 border border-slate-800/40">
                          <img 
                            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p.dexNumber}.png`}
                            alt={p.name}
                            className="w-full h-full object-contain"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.dexNumber}.png`;
                            }}
                          />
                        </div>
                        <div className="font-bold text-white text-sm mt-1">{p.name}</div>
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {p.type.map(t => {
                            const style = getTypePillColor(t);
                            return (
                              <span key={t} className={`text-[8px] font-mono px-1.5 py-0.5 rounded border ${style.bg} ${style.text} ${style.border}`}>
                                {t}
                              </span>
                            );
                          })}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Specs and interactive Type Advantages */}
              <div className="flex flex-col gap-4">
                <div className="bg-slate-950 border-2 border-slate-900 rounded-2xl p-5 flex flex-col sm:flex-row gap-5">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center bg-slate-900/80 rounded-2xl border border-slate-800">
                    <PokemonSprite name={selectedPokedexPoke.name} dexNumber={selectedPokedexPoke.dexNumber} className="w-20 h-20 sm:w-28 sm:h-28" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-cinzel font-bold text-lg text-white">{selectedPokedexPoke.name}</h4>
                    <div className="flex gap-1.5 mt-1 flex-wrap">
                      {selectedPokedexPoke.type.map(t => {
                        const style = getTypePillColor(t);
                        return (
                          <span key={t} className={`text-[9px] font-mono px-2 py-0.5 rounded border ${style.bg} ${style.text} ${style.border}`}>
                            {t}
                          </span>
                        );
                      })}
                    </div>
                    
                    {/* Stat Bars */}
                    <div className="flex flex-col gap-1.5 mt-3 text-[10px] font-mono text-slate-400">
                      <div>
                        <div className="flex justify-between"><span>HP</span><span>{selectedPokedexPoke.hp}</span></div>
                        <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden mt-0.5">
                          <div className="bg-amber-500 h-full" style={{ width: `${(selectedPokedexPoke.hp / 210) * 100}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between"><span>Speed</span><span>{selectedPokedexPoke.speed}</span></div>
                        <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden mt-0.5">
                          <div className="bg-sky-400 h-full" style={{ width: `${(selectedPokedexPoke.speed / 135) * 100}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between"><span>Sp. Attack</span><span>{selectedPokedexPoke.spAtk}</span></div>
                        <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden mt-0.5">
                          <div className="bg-rose-400 h-full" style={{ width: `${(selectedPokedexPoke.spAtk / 160) * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Interactive calculator */}
                <div className="bg-slate-950 border-2 border-slate-900 rounded-2xl p-5">
                  <h4 className="font-cinzel font-bold text-sm text-slate-100 mb-3 pb-2 border-b border-slate-900">
                    Interactive Type Advantage Calculator
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <label className="block text-[9px] font-mono text-amber-500 uppercase mb-1">Attacker Type</label>
                      <select
                        value={chartAtkType}
                        onChange={e => { gameAudio.playSelect(); setChartAtkType(e.target.value); }}
                        className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded px-2 py-1 text-xs font-mono"
                      >
                        {ALL_TYPES.map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] font-mono text-amber-500 uppercase mb-1">Defender Type</label>
                      <select
                        value={chartDefType}
                        onChange={e => { gameAudio.playSelect(); setChartDefType(e.target.value); }}
                        className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded px-2 py-1 text-xs font-mono"
                      >
                        {ALL_TYPES.map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 text-center flex flex-col items-center">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Damage Multiplier</span>
                    <span className={`text-2xl font-black font-mono mt-0.5 ${
                      getTypeMult(chartAtkType, [chartDefType]) > 1 ? 'text-emerald-400 font-extrabold shadow-sm' :
                      getTypeMult(chartAtkType, [chartDefType]) < 1 ? 'text-rose-400 font-extrabold' : 'text-slate-400'
                    }`}>
                      {getTypeMult(chartAtkType, [chartDefType])}x
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 italic mt-1.5">
                      {getTypeMult(chartAtkType, [chartDefType]) > 1 ? 'Super Effective! Deals double damage.' :
                       getTypeMult(chartAtkType, [chartDefType]) < 1 && getTypeMult(chartAtkType, [chartDefType]) > 0 ? 'Not very effective. Half damage.' :
                       getTypeMult(chartAtkType, [chartDefType]) === 0 ? 'Ineffective! Fails to damage the target.' :
                       'Standard damage exchange.'}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* 4. SYNTH TAP */}
          {activeTab === 'synth' && (
            <div className="bg-slate-950 border-2 border-slate-900 rounded-2xl p-5 max-w-xl mx-auto flex flex-col gap-5">
              <div>
                <h3 className="font-cinzel font-bold text-lg text-amber-500 border-b border-slate-900 pb-3 mb-2">
                  Retro Soundboard & Synthesizer
                </h3>
                <p className="text-xs text-slate-400 font-mono leading-relaxed">
                  Generate pure retro sound wave frequencies live! Trigger default action sounds or compose chimes on the piano keys below.
                </p>
              </div>

              {/* Core presets */}
              <div>
                <label className="block text-[10px] font-mono text-amber-500 uppercase mb-2">Combat Effect Presets</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Select Chime', trigger: () => gameAudio.playSelect() },
                    { label: 'Beam Blast', trigger: () => gameAudio.playBeam() },
                    { label: 'Hit Explosion', trigger: () => gameAudio.playHit() },
                    { label: 'Health Recovery', trigger: () => gameAudio.playHeal() },
                    { label: 'Faint Drop', trigger: () => gameAudio.playFaint() },
                    { label: 'System Pop', trigger: () => gameAudio.playPop() }
                  ].map(p => (
                    <button
                      key={p.label}
                      onClick={p.trigger}
                      className="bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl p-2.5 font-mono text-[10px] text-slate-300 text-center transition-colors hover:text-white"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live piano roll */}
              <div>
                <label className="block text-[10px] font-mono text-amber-500 uppercase mb-2">Interactive Musical Piano</label>
                <div className="flex justify-between items-stretch h-28 bg-slate-900 border border-slate-800 p-1.5 rounded-xl gap-1">
                  {synthPianoKeys.map((k, i) => (
                    <button
                      key={i}
                      onClick={() => playPianoNote(k.freq)}
                      className={`flex-1 flex flex-col justify-end pb-2 rounded border font-mono text-[9px] transition-all ${
                        k.color === 'white'
                          ? 'bg-slate-200 hover:bg-white text-slate-950 border-slate-300 shadow active:translate-y-0.5'
                          : 'bg-slate-950 hover:bg-slate-900 text-amber-500 border-slate-800 shadow active:translate-y-0.5'
                      }`}
                    >
                      <span className="font-bold rotate-[-90deg] origin-left translate-y-[-10px] block pl-2">
                        {k.note}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* TEAM SELECTION / DRAFT SCREEN (VS MODE) */}
      {gameState === 'teamSelect' && (
        <div className="animate-fade bg-slate-950 border-2 border-slate-900 rounded-3xl p-6 flex flex-col gap-6">
          <div className="text-center border-b border-slate-900 pb-4">
            <h3 className="font-cinzel font-bold text-xl text-amber-500">Draft Chamber (2-Player Local)</h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">Choose exactly 3 Pokémon per player to initialize combat.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Player 1 Draft Card */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <h4 className="font-cinzel text-sm font-bold text-white mb-2 border-b border-slate-800 pb-2">
                  🔴 Player 1 (Red)
                </h4>

                {/* Generation/Region Tab Selectors */}
                <div className="flex gap-1 overflow-x-auto pb-2 mb-3 scrollbar-none border-b border-slate-900/40">
                  {REGION_TABS.map(tab => {
                    const isActive = draftP1Region === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => { gameAudio.playSelect(); setDraftP1Region(tab.id); }}
                        className={`px-2.5 py-1.5 rounded-lg text-[9px] font-mono whitespace-nowrap border transition-all ${
                          isActive
                            ? 'border-amber-500 bg-amber-500/10 text-amber-500 font-bold shadow-sm'
                            : 'border-slate-850 bg-slate-900/30 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                  {POKEMON_ROSTER.filter(p => p.region === draftP1Region).map(p => {
                    const isSelected = selectedPokeIdsP1.includes(p.id);
                    const selectIdx = selectedPokeIdsP1.indexOf(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handlePokeToggleP1(p.id)}
                        className={`text-left p-2.5 rounded-xl border text-xs transition-all ${
                          isSelected
                            ? 'border-amber-500 bg-amber-500/10'
                            : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-white">{p.name}</span>
                          {isSelected && <span className="text-amber-400 font-bold font-mono">#{selectIdx + 1}</span>}
                        </div>
                        <div className="w-8 h-8 flex items-center justify-center bg-slate-950/60 rounded-lg overflow-hidden p-0.5 border border-slate-800/40 mb-1">
                          <img 
                            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p.dexNumber}.png`}
                            alt={p.name}
                            className="w-full h-full object-contain"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.dexNumber}.png`;
                            }}
                          />
                        </div>
                        <div className="flex gap-1.5 mt-1.5 flex-wrap">
                          {p.type.map(t => {
                            const style = getTypePillColor(t);
                            return (
                              <span key={t} className={`text-[8px] font-mono px-1.5 py-0.5 rounded border ${style.bg} ${style.text} ${style.border}`}>
                                {t}
                              </span>
                            );
                          })}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Player 1 Active Drafted Team Indicator */}
              <div className="mt-4 bg-slate-950/20 border border-slate-800/60 p-2.5 rounded-xl">
                <div className="text-[9px] font-mono text-slate-500 uppercase mb-2 flex justify-between">
                  <span>Selected Draft ({selectedPokeIdsP1.length}/3)</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[0, 1, 2].map(idx => {
                    const targetId = selectedPokeIdsP1[idx];
                    const poke = POKEMON_ROSTER.find(x => x.id === targetId);
                    return (
                      <div key={idx} className="flex flex-col items-center justify-center p-1.5 rounded-lg border border-dashed border-slate-800 bg-slate-950/40 min-h-[64px]">
                        {poke ? (
                          <>
                            <PokemonSprite name={poke.name} dexNumber={poke.dexNumber} className="w-7 h-7 object-contain" />
                            <span className="text-[8px] text-white font-medium truncate max-w-full mt-1">{poke.name}</span>
                          </>
                        ) : (
                          <span className="text-[8px] text-slate-600 font-mono">Empty</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Player 2 Draft Card */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <h4 className="font-cinzel text-sm font-bold text-white mb-2 border-b border-slate-800 pb-2">
                  🔮 Player 2 (Challenger)
                </h4>

                {/* Generation/Region Tab Selectors */}
                <div className="flex gap-1 overflow-x-auto pb-2 mb-3 scrollbar-none border-b border-slate-900/40">
                  {REGION_TABS.map(tab => {
                    const isActive = draftP2Region === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => { gameAudio.playSelect(); setDraftP2Region(tab.id); }}
                        className={`px-2.5 py-1.5 rounded-lg text-[9px] font-mono whitespace-nowrap border transition-all ${
                          isActive
                            ? 'border-sky-500 bg-sky-500/10 text-sky-400 font-bold shadow-sm'
                            : 'border-slate-850 bg-slate-900/30 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                  {POKEMON_ROSTER.filter(p => p.region === draftP2Region).map(p => {
                    const isSelected = selectedPokeIdsP2.includes(p.id);
                    const selectIdx = selectedPokeIdsP2.indexOf(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handlePokeToggleP2(p.id)}
                        className={`text-left p-2.5 rounded-xl border text-xs transition-all ${
                          isSelected
                            ? 'border-sky-500 bg-sky-500/10'
                            : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-white">{p.name}</span>
                          {isSelected && <span className="text-sky-400 font-bold font-mono">#{selectIdx + 1}</span>}
                        </div>
                        <div className="w-8 h-8 flex items-center justify-center bg-slate-950/60 rounded-lg overflow-hidden p-0.5 border border-slate-800/40 mb-1">
                          <img 
                            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p.dexNumber}.png`}
                            alt={p.name}
                            className="w-full h-full object-contain"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.dexNumber}.png`;
                            }}
                          />
                        </div>
                        <div className="flex gap-1.5 mt-1.5 flex-wrap">
                          {p.type.map(t => {
                            const style = getTypePillColor(t);
                            return (
                              <span key={t} className={`text-[8px] font-mono px-1.5 py-0.5 rounded border ${style.bg} ${style.text} ${style.border}`}>
                                {t}
                              </span>
                            );
                          })}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Player 2 Active Drafted Team Indicator */}
              <div className="mt-4 bg-slate-950/20 border border-slate-800/60 p-2.5 rounded-xl">
                <div className="text-[9px] font-mono text-slate-500 uppercase mb-2 flex justify-between">
                  <span>Selected Draft ({selectedPokeIdsP2.length}/3)</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[0, 1, 2].map(idx => {
                    const targetId = selectedPokeIdsP2[idx];
                    const poke = POKEMON_ROSTER.find(x => x.id === targetId);
                    return (
                      <div key={idx} className="flex flex-col items-center justify-center p-1.5 rounded-lg border border-dashed border-slate-800 bg-slate-950/40 min-h-[64px]">
                        {poke ? (
                          <>
                            <PokemonSprite name={poke.name} dexNumber={poke.dexNumber} className="w-7 h-7 object-contain" />
                            <span className="text-[8px] text-white font-medium truncate max-w-full mt-1">{poke.name}</span>
                          </>
                        ) : (
                          <span className="text-[8px] text-slate-600 font-mono">Empty</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>

          <div className="flex gap-4 border-t border-slate-900 pt-5">
            <button
              onClick={() => setGameState('lobby')}
              className="btn ghost flex-1 py-3 text-sm"
            >
              Cancel
            </button>
            <button
              onClick={startVersusBattle}
              disabled={selectedPokeIdsP1.length !== 3 || selectedPokeIdsP2.length !== 3}
              className="btn flex-1 py-3 text-sm shadow-[0_0_15px_rgba(245,158,11,0.15)]"
            >
              INITIALIZE PvP BATTLE
            </button>
          </div>
        </div>
      )}

      {/* ACTIVE COMBAT GROUND (BATTLE SCREEN) */}
      {(gameState === 'battle' || gameState === 'gameOver') && playerTeam.length > 0 && opponentTeam.length > 0 && (
        <div className="animate-fade flex flex-col gap-4">
          
          {/* Main 3D isometric styled screen area */}
          <div className="relative h-[380px] sm:h-[460px] rounded-3xl overflow-hidden bg-slate-950 border-2 border-slate-900 shadow-[0_10px_35px_rgba(0,0,0,0.8)]">
            {/* Ambient visual background glow details */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(30,41,59,0.35)_0%,transparent_100%)] pointer-events-none" />
            <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-amber-500/[0.04] blur-xl" />
            <div className="absolute top-1/3 right-1/4 w-44 h-44 rounded-full bg-indigo-500/[0.04] blur-3xl animate-pulse" />

            {/* Simulated Stage ring shadow with deep 3D scale and shadow positioning */}
            <div className="absolute left-1/2 bottom-[8%] -translate-x-1/2 w-[120%] h-[240px] bg-slate-900 border-t-2 border-slate-800 rounded-[50%] scale-y-[0.35] shadow-[0_40px_70px_rgba(0,0,0,0.95)] pointer-events-none" />

            {/* 3D Lane indicators for Player and Opponent dodging */}
            {[-1, 0, 1].map((lane) => (
              <div
                key={`p-lane-${lane}`}
                className={`absolute w-16 h-8 rounded-[50%] border-2 border-dashed transition-all duration-300 pointer-events-none ${
                  playerLane === lane
                    ? 'border-amber-500/85 bg-amber-500/10 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                    : 'border-slate-800/40 bg-slate-950/10'
                }`}
                style={{
                  left: `calc(22% + ${lane * 75}px)`,
                  top: '75%',
                  transform: 'translate(-50%, -50%) scale-y-[0.4]'
                }}
              />
            ))}

            {/* Real-time incoming AI attack warning highlights */}
            {[-1, 0, 1].map((lane) => {
              const isP2AttackingP1ThisLane =
                activeVfx &&
                activeVfx.stage === 'travel' &&
                activeVfx.direction === 'p2_to_p1' &&
                opponentAimLane === lane;

              return (
                <div
                  key={`p-aim-warning-${lane}`}
                  className={`absolute w-14 h-7 rounded-[50%] border-2 transition-all duration-200 pointer-events-none flex items-center justify-center ${
                    isP2AttackingP1ThisLane
                      ? 'border-rose-500 bg-rose-500/20 shadow-[0_0_16px_rgba(239,68,68,0.85)]'
                      : 'opacity-0'
                  }`}
                  style={{
                    left: `calc(22% + ${lane * 75}px)`,
                    top: '75%',
                    transform: 'translate(-50%, -50%) scale-y-[0.4]'
                  }}
                >
                  <span className="text-[12px] leading-none text-rose-400 font-black select-none animate-bounce" style={{ transform: 'scaleY(2.5)' }}>
                    ⚠️
                  </span>
                </div>
              );
            })}

            {[-1, 0, 1].map((lane) => (
              <div
                key={`o-lane-${lane}`}
                className={`absolute w-16 h-8 rounded-[50%] border-2 border-dashed transition-all duration-300 pointer-events-none ${
                  opponentLane === lane
                    ? 'border-indigo-500/85 bg-indigo-500/10 shadow-[0_0_12px_rgba(99,102,241,0.5)]'
                    : 'border-slate-800/40 bg-slate-950/10'
                }`}
                style={{
                  left: `calc(78% + ${lane * 75}px)`,
                  top: '31%',
                  transform: 'translate(-50%, -50%) scale-y-[0.4]'
                }}
              />
            ))}

            {/* Real-time Player aiming reticle / projectile trajectory target highlight */}
            {[-1, 0, 1].map((lane) => {
              // Highlight opponent lane if P1 is aiming at it (during choosing, or during projectile travel)
              const isAimingAtLane =
                playerAimLane === lane &&
                (!activeVfx || (activeVfx.direction === 'p1_to_p2' && activeVfx.stage === 'travel'));

              return (
                <div
                  key={`o-aim-target-${lane}`}
                  className={`absolute w-14 h-7 rounded-[50%] border-2 transition-all duration-200 pointer-events-none flex items-center justify-center ${
                    isAimingAtLane
                      ? 'border-emerald-500 bg-emerald-500/15 shadow-[0_0_16px_rgba(16,185,129,0.8)] animate-pulse'
                      : 'opacity-0'
                  }`}
                  style={{
                    left: `calc(78% + ${lane * 75}px)`,
                    top: '31%',
                    transform: 'translate(-50%, -50%) scale-y-[0.4]'
                  }}
                >
                  <span className="text-[12px] leading-none text-emerald-400 font-bold select-none" style={{ transform: 'scaleY(2.5)' }}>
                    🎯
                  </span>
                </div>
              );
            })}

            {/* Active 3D VFX Layer */}
            {activeVfx && <Battle3DVfx vfx={activeVfx} />}

            {/* OPPONENT SIDE HUD (Top Left) */}
            <div className="absolute top-4 left-4 sm:top-6 sm:left-6 bg-slate-950/90 border border-slate-800/80 rounded-2xl p-3 w-[180px] sm:w-[220px] shadow-[0_4px_15px_rgba(0,0,0,0.5)] z-20">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-white text-sm sm:text-base font-cinzel">
                  {opponentTeam[activeOpponentIdx].name}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Lv.50</span>
              </div>
              {/* HP percentage bar */}
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-1 border border-black/20">
                <div
                  className={`h-full transition-all duration-300 ${hpProgressColor(opponentTeam[activeOpponentIdx].hp, opponentTeam[activeOpponentIdx].maxHp)}`}
                  style={{ width: `${(opponentTeam[activeOpponentIdx].hp / opponentTeam[activeOpponentIdx].maxHp) * 100}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className={opponentTeam[activeOpponentIdx].status !== 'None' ? 'text-amber-400' : 'text-slate-500'}>
                  {opponentTeam[activeOpponentIdx].status !== 'None' ? opponentTeam[activeOpponentIdx].status : 'Healthy'}
                </span>
                <span className="text-slate-300">
                  {opponentTeam[activeOpponentIdx].hp} / {opponentTeam[activeOpponentIdx].maxHp} HP
                </span>
              </div>
            </div>

            {/* OPPONENT ACTIVE SPRITE (Top Right - Aligned with 78% X, 28% Y coordinate) */}
            <div 
              className="absolute z-10 flex items-center justify-center pointer-events-none transition-all duration-300"
              style={{
                left: `calc(78% + ${opponentLane * 75}px)`,
                top: '28%',
                transform: 'translate(-50%, -50%)'
              }}
            >
              <div className="relative flex items-center justify-center">
                <PokemonSprite
                  name={opponentTeam[activeOpponentIdx].name}
                  dexNumber={opponentTeam[activeOpponentIdx].dexNumber}
                  isBack={false}
                  isAttacking={opponentAttacking}
                  isHit={opponentHit}
                  status={opponentTeam[activeOpponentIdx].status}
                  className="transition-transform duration-300"
                />
                {/* Damage values Float */}
                {opponentFloat && (
                  <div className={`absolute -top-12 font-bold text-sm sm:text-base animate-bounce ${opponentFloat.color} font-mono px-2.5 py-0.5 bg-slate-950 border border-slate-800 rounded-full shadow-lg z-30 whitespace-nowrap`}>
                    {opponentFloat.text}
                  </div>
                )}
                {/* Effectiveness Badge Float */}
                <AnimatePresence>
                  {opponentEffectiveness && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.3, y: 15 }}
                      animate={{ opacity: 1, scale: 1.15, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, y: -20 }}
                      transition={{ type: "spring", stiffness: 350, damping: 14 }}
                      className={`absolute -top-20 font-sans text-[10px] sm:text-[11px] font-black px-2.5 py-1 rounded-xl border z-40 whitespace-nowrap uppercase tracking-wider shadow-lg ${opponentEffectiveness.badgeClass}`}
                    >
                      {opponentEffectiveness.text}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* PLAYER ACTIVE SPRITE (Bottom Left - Aligned with 22% X, 72% Y coordinate) */}
            <div 
              className="absolute z-10 flex items-center justify-center pointer-events-none transition-all duration-300"
              style={{
                left: `calc(22% + ${playerLane * 75}px)`,
                top: '72%',
                transform: 'translate(-50%, -50%)'
              }}
            >
              <div className="relative flex items-center justify-center">
                <PokemonSprite
                  name={playerTeam[activePlayerIdx].name}
                  dexNumber={playerTeam[activePlayerIdx].dexNumber}
                  isBack={true}
                  isAttacking={playerAttacking}
                  isHit={playerHit}
                  status={playerTeam[activePlayerIdx].status}
                  className="transition-transform duration-300"
                />
                {/* Damage values Float */}
                {playerFloat && (
                  <div className={`absolute -top-12 font-bold text-sm sm:text-base animate-bounce ${playerFloat.color} font-mono px-2.5 py-0.5 bg-slate-950 border border-slate-800 rounded-full shadow-lg z-30 whitespace-nowrap`}>
                    {playerFloat.text}
                  </div>
                )}
                {/* Effectiveness Badge Float */}
                <AnimatePresence>
                  {playerEffectiveness && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.3, y: 15 }}
                      animate={{ opacity: 1, scale: 1.15, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, y: -20 }}
                      transition={{ type: "spring", stiffness: 350, damping: 14 }}
                      className={`absolute -top-20 font-sans text-[10px] sm:text-[11px] font-black px-2.5 py-1 rounded-xl border z-40 whitespace-nowrap uppercase tracking-wider shadow-lg ${playerEffectiveness.badgeClass}`}
                    >
                      {playerEffectiveness.text}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* PLAYER 1 HUD (Bottom Right) */}
            <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 bg-slate-950/90 border border-slate-800/80 rounded-2xl p-3 w-[180px] sm:w-[220px] shadow-[0_4px_15px_rgba(0,0,0,0.5)] z-20">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-white text-sm sm:text-base font-cinzel">
                  {playerTeam[activePlayerIdx].name}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Lv.50</span>
              </div>
              {/* HP percentage bar */}
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-1 border border-black/20">
                <div
                  className={`h-full transition-all duration-300 ${hpProgressColor(playerTeam[activePlayerIdx].hp, playerTeam[activePlayerIdx].maxHp)}`}
                  style={{ width: `${(playerTeam[activePlayerIdx].hp / playerTeam[activePlayerIdx].maxHp) * 100}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className={playerTeam[activePlayerIdx].status !== 'None' ? 'text-amber-400' : 'text-slate-500'}>
                  {playerTeam[activePlayerIdx].status !== 'None' ? playerTeam[activePlayerIdx].status : 'Healthy'}
                </span>
                <span className="text-slate-300">
                  {playerTeam[activePlayerIdx].hp} / {playerTeam[activePlayerIdx].maxHp} HP
                </span>
              </div>
            </div>

            {/* Real-time Field Position HUD indicators integrated in the moveset panel below */}

          </div>

          {/* 2. THE MOVESETS PART */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
            <div>
              <label className="block text-[10px] font-mono text-amber-500 uppercase tracking-widest mb-3 pb-1 border-b border-slate-800">
                {isBattleAnimating
                  ? '⏳ BATTLE RESOLVING... (FROZEN)'
                  : battleMode === 'campaign'
                  ? 'CHOOSE CAMPAIGN ATTACK'
                  : `CHOOSE MOVE: ${pvpTurnState === 'p1_select' ? 'Player 1' : 'Player 2'}`}
              </label>

              {/* Turn transitions for local Versus */}
              {battleMode === 'versus' && pvpTurnState === 'p2_transit' ? (
                <div className="text-center py-6">
                  <p className="text-xs text-amber-400 font-mono animate-pulse mb-3">
                    Player 1 completed move selection!
                  </p>
                  <button
                    disabled={isBattleAnimating}
                    onClick={() => { gameAudio.playSelect(); setPvpTurnState('p2_select'); }}
                    className={`btn sm ${isBattleAnimating ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Show Player 2 Attacks
                  </button>
                </div>
              ) : (
                <div>
                  {/* TARGET AIM & POSITIONING CONTROLS PANEL */}
                  {!((battleMode === 'campaign' && playerTeam[activePlayerIdx].hp <= 0) ||
                     (battleMode === 'versus' && pvpTurnState === 'p1_select' && playerTeam[activePlayerIdx].hp <= 0) ||
                     (battleMode === 'versus' && pvpTurnState === 'p2_select' && opponentTeam[activeOpponentIdx].hp <= 0)) && (
                    <div className="bg-slate-950/90 border border-slate-800/80 rounded-xl p-3 mb-3 animate-fade-in flex flex-col gap-3">
                      {/* Aim Direction Selection */}
                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-[10px] font-mono font-bold text-slate-400 tracking-wider uppercase">
                            🎯 SELECT ATTACK TARGET DIRECTION
                          </span>
                          <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-full uppercase">
                            {((battleMode === 'campaign' || pvpTurnState === 'p1_select') ? playerAimLane : opponentAimLane) === -1 ? 'LEFT TRACK' :
                             ((battleMode === 'campaign' || pvpTurnState === 'p1_select') ? playerAimLane : opponentAimLane) === 1 ? 'RIGHT TRACK' : 'CENTER TRACK'}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {[-1, 0, 1].map((laneVal) => {
                            const isCurrentP1 = battleMode === 'campaign' || pvpTurnState === 'p1_select';
                            const isActive = isCurrentP1 ? (playerAimLane === laneVal) : (opponentAimLane === laneVal);
                            const laneLabel = laneVal === -1 ? 'LEFT' : laneVal === 1 ? 'RIGHT' : 'CENTER';
                            const icon = laneVal === -1 ? '◀' : laneVal === 1 ? '▶' : '▲';
                            
                            return (
                              <button
                                key={`aim-lane-${laneVal}`}
                                type="button"
                                onClick={() => {
                                  gameAudio.playSelect();
                                  if (isCurrentP1) {
                                    setPlayerAimLane(laneVal);
                                  } else {
                                    setOpponentAimLane(laneVal);
                                  }
                                }}
                                className={`py-1.5 px-1 text-[11px] font-mono font-bold rounded-xl border flex flex-col items-center gap-1 transition-all duration-150 ${
                                  isActive
                                    ? 'border-emerald-500 text-emerald-400 bg-emerald-500/15 shadow-[0_0_12px_rgba(16,185,129,0.25)] scale-[1.02]'
                                    : 'border-slate-850 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                                }`}
                              >
                                <span className="text-xs leading-none">{icon}</span>
                                <span className="text-[8px] font-medium">{laneLabel}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Integrated Positioning / Dodge Controls */}
                      <div className="border-t border-slate-900 pt-3">
                        <div className="flex justify-between items-center mb-1.5">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-mono font-bold text-amber-500 tracking-wider uppercase">
                              🛡️ FIELD POSITION (DODGE)
                            </span>
                            <span className="text-[8px] text-slate-500 font-mono">
                              {(battleMode === 'campaign' || pvpTurnState === 'p1_select') ? 'Control P1 with A/D or ARROWS' : 'Control P2 with ARROWS'}
                            </span>
                          </div>
                          <span className="text-[9px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded-full uppercase">
                            {((battleMode === 'campaign' || pvpTurnState === 'p1_select') ? playerLane : opponentLane) === -1 ? 'LEFT' :
                             ((battleMode === 'campaign' || pvpTurnState === 'p1_select') ? playerLane : opponentLane) === 1 ? 'RIGHT' : 'MID'}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {/* Move Left Button */}
                          <button
                            type="button"
                            onClick={() => {
                              const isCurrentP1 = battleMode === 'campaign' || pvpTurnState === 'p1_select';
                              gameAudio.playSelect();
                              if (isCurrentP1) {
                                movePlayerLeft();
                              } else {
                                moveOpponentLeft();
                              }
                            }}
                            className={`py-1.5 px-1 text-[11px] font-mono font-bold rounded-xl border flex flex-col items-center justify-center gap-1 transition-all duration-150 ${
                              (battleMode === 'campaign' || pvpTurnState === 'p1_select')
                                ? (p1LeftActive
                                  ? 'border-amber-500 text-amber-400 bg-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.4)] scale-95'
                                  : 'border-slate-850 bg-slate-900/60 text-slate-300 hover:border-slate-700 hover:text-white active:scale-95')
                                : (p2LeftActive
                                  ? 'border-indigo-500 text-indigo-400 bg-indigo-500/20 shadow-[0_0_12px_rgba(99,102,241,0.4)] scale-95'
                                  : 'border-slate-850 bg-slate-900/60 text-slate-300 hover:border-slate-700 hover:text-white active:scale-95')
                            }`}
                            title="Move Left"
                          >
                            <span className="text-xs">◀</span>
                            <span className="text-[8px] font-mono font-semibold">MOVE LEFT</span>
                          </button>

                          {/* Quick Snap to Center Button */}
                          <button
                            type="button"
                            onClick={() => {
                              const isCurrentP1 = battleMode === 'campaign' || pvpTurnState === 'p1_select';
                              gameAudio.playSelect();
                              if (isCurrentP1) {
                                setPlayerLane(0);
                              } else {
                                setOpponentLane(0);
                              }
                            }}
                            className={`py-1.5 px-1 text-[11px] font-mono font-bold rounded-xl border flex flex-col items-center justify-center gap-1 transition-all duration-150 ${
                              ((battleMode === 'campaign' || pvpTurnState === 'p1_select') ? playerLane === 0 : opponentLane === 0)
                                ? 'border-amber-500/40 text-amber-400 bg-amber-500/5'
                                : 'border-slate-900 bg-slate-950/40 text-slate-500 hover:border-slate-800 hover:text-slate-300 active:scale-95'
                            }`}
                            title="Center Position"
                          >
                            <span className="text-xs">●</span>
                            <span className="text-[8px] font-mono font-semibold">CENTER</span>
                          </button>

                          {/* Move Right Button */}
                          <button
                            type="button"
                            onClick={() => {
                              const isCurrentP1 = battleMode === 'campaign' || pvpTurnState === 'p1_select';
                              gameAudio.playSelect();
                              if (isCurrentP1) {
                                movePlayerRight();
                              } else {
                                moveOpponentRight();
                              }
                            }}
                            className={`py-1.5 px-1 text-[11px] font-mono font-bold rounded-xl border flex flex-col items-center justify-center gap-1 transition-all duration-150 ${
                              (battleMode === 'campaign' || pvpTurnState === 'p1_select')
                                ? (p1RightActive
                                  ? 'border-amber-500 text-amber-400 bg-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.4)] scale-95'
                                  : 'border-slate-850 bg-slate-900/60 text-slate-300 hover:border-slate-700 hover:text-white active:scale-95')
                                : (p2RightActive
                                  ? 'border-indigo-500 text-indigo-400 bg-indigo-500/20 shadow-[0_0_12px_rgba(99,102,241,0.4)] scale-95'
                                  : 'border-slate-850 bg-slate-900/60 text-slate-300 hover:border-slate-700 hover:text-white active:scale-95')
                            }`}
                            title="Move Right"
                          >
                            <span className="text-xs">▶</span>
                            <span className="text-[8px] font-mono font-semibold">MOVE RIGHT</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    {/* If player active is fainted, require switch */}
                    {(battleMode === 'campaign' && playerTeam[activePlayerIdx].hp <= 0) ||
                     (battleMode === 'versus' && pvpTurnState === 'p1_select' && playerTeam[activePlayerIdx].hp <= 0) ||
                     (battleMode === 'versus' && pvpTurnState === 'p2_select' && opponentTeam[activeOpponentIdx].hp <= 0) ? (
                      <p className="col-span-2 text-center text-xs text-rose-400 italic py-2">
                        Active Pokémon fainted. Switch out immediately!
                      </p>
                    ) : (
                      // Render moves of active pokemon
                      (battleMode === 'campaign' || pvpTurnState === 'p1_select'
                        ? playerTeam[activePlayerIdx]
                        : opponentTeam[activeOpponentIdx]
                      ).moves.map(m => (
                        <button
                          key={m.name}
                          disabled={isBattleAnimating}
                          onClick={() => {
                            if (battleMode === 'campaign') {
                              resolveCampaignTurn(m);
                            } else {
                              submitVersusMove(m);
                            }
                          }}
                          className={`flex flex-col items-start p-2.5 rounded-xl border transition-all text-left ${
                            isBattleAnimating
                              ? 'border-slate-900 bg-slate-950/40 text-slate-500 cursor-not-allowed opacity-55'
                              : 'border-slate-800 bg-slate-950/80 hover:border-amber-500 hover:bg-slate-900/40'
                          }`}
                        >
                          <span className={`text-xs font-bold leading-tight ${isBattleAnimating ? 'text-slate-500' : 'text-white'}`}>{m.name}</span>
                          <div className="flex justify-between w-full mt-1.5 text-[9px] font-mono text-slate-500 leading-none">
                            <span>Power: {m.power}</span>
                            <span>Acc: {m.accuracy}%</span>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 3. THE POKÉMON PART */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
            <label className="block text-[10px] font-mono text-amber-500 uppercase tracking-widest mb-3 pb-1 border-b border-slate-800">
              SWITCH ACTIVE SQUAD
            </label>

            <div className="flex flex-col gap-2">
              {/* Switch Player 1 */}
              <div className="flex flex-col gap-1.5">
                <div className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">
                  {battleMode === 'campaign' ? 'My Party Squad' : 'Player 1 Squad (Drafted)'}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {playerTeam.map((p, idx) => {
                    const isActive = idx === activePlayerIdx;
                    const isFainted = p.hp <= 0;
                    return (
                      <button
                        key={p.id}
                        disabled={isActive || isFainted || isBattleAnimating || (battleMode === 'versus' && pvpTurnState === 'p2_select')}
                        onClick={() => handlePlayerSwitch(idx)}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs transition-all ${
                          isActive
                            ? 'border-amber-500 bg-amber-500/5 text-amber-400 font-bold'
                            : isFainted
                            ? 'border-slate-950 bg-slate-950/20 text-slate-600 cursor-not-allowed'
                            : isBattleAnimating
                            ? 'border-slate-900 bg-slate-950/40 text-slate-500 cursor-not-allowed opacity-50'
                            : 'border-slate-800 bg-slate-950 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <span className="font-bold">{p.name} {isFainted ? '💀' : ''}</span>
                        <span className="font-mono text-[10px]">
                          {p.hp} / {p.maxHp} HP
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Switch Player 2 (Local PvP only) */}
              {battleMode === 'versus' && (
                <div className="flex flex-col gap-1.5 mt-2.5 pt-2.5 border-t border-slate-800">
                  <div className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">
                    Player 2 Squad (Drafted)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {opponentTeam.map((p, idx) => {
                      const isActive = idx === activeOpponentIdx;
                      const isFainted = p.hp <= 0;
                      return (
                        <button
                          key={p.id}
                          disabled={isActive || isFainted || isBattleAnimating || pvpTurnState === 'p1_select'}
                          onClick={() => handleOpponentSwitch(idx)}
                          className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs transition-all ${
                            isActive
                              ? 'border-sky-500 bg-sky-500/5 text-sky-400 font-bold'
                              : isFainted
                              ? 'border-slate-950 bg-slate-950/20 text-slate-600 cursor-not-allowed'
                              : isBattleAnimating
                              ? 'border-slate-900 bg-slate-950/40 text-slate-500 cursor-not-allowed opacity-50'
                              : 'border-slate-800 bg-slate-950 hover:border-slate-700 text-slate-300'
                          }`}
                        >
                          <span className="font-bold">{p.name} {isFainted ? '💀' : ''}</span>
                          <span className="font-mono text-[10px]">
                            {p.hp} / {p.maxHp} HP
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* 4. THE RECORDER AT THE LAST */}
          <div 
            ref={logContainerRef}
            className="bg-slate-950 border-2 border-slate-900 rounded-2xl p-4 h-28 overflow-y-auto font-mono text-[11px] sm:text-xs flex flex-col gap-1.5 shadow-inner scroll-smooth"
          >
            {battleLogs.map((log, i) => (
              <div
                key={i}
                className={
                  log.startsWith('---') ? 'text-amber-500 font-bold' :
                  log.includes('fainted') || log.includes('lost') ? 'text-rose-400 font-bold' :
                  log.includes('won') || log.includes('victory') ? 'text-emerald-400 font-bold' : 'text-slate-300'
                }
              >
                {log}
              </div>
            ))}
          </div>

          {/* Quick exit match action */}
          <div className="flex justify-center mt-2">
            <button
              onClick={() => {
                gameAudio.playFaint();
                setGameState('lobby');
                setSelectedPokeIdsP1([]);
                setSelectedPokeIdsP2([]);
              }}
              className="text-xs font-mono text-slate-500 hover:text-rose-400 transition-colors"
            >
              🏳️ Flee Battle Match
            </button>
          </div>

          {/* Responsive Victory/Defeat Overlay Modal */}
          <BattleOverModal
            isOpen={gameState === 'gameOver'}
            winnerName={winnerName}
            trainerName={trainerName}
            battleMode={battleMode}
            playerTeam={playerTeam}
            opponentTeam={opponentTeam}
            activeNpc={activeNpc}
            hasWonCampaignVoucher={hasWonCampaignVoucher}
            onRematch={handleRematch}
            onReturnToSelection={handleReturnToSelection}
          />

        </div>
      )}

    </div>
  );
};
