import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Pokemon, Move } from '../types';
import { POKEMON_ROSTER, NPC_TRAINERS, NpcTrainer } from '../data';
import { PokemonSprite } from './PokemonSprites';
import { gameAudio } from '../utils/audio';
import { Battle3DVfx, ActiveVfx } from './Battle3DVfx';
import { BattleOverModal } from './BattleOverModal';
import { BattleArena } from './BattleArena';
import { RotateCw, Smartphone } from 'lucide-react';

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

const getMoveStyle = (type: string, isBattleAnimating: boolean) => {
  if (isBattleAnimating) {
    return {
      btnClass: 'border-slate-900 bg-slate-950/40 text-slate-500 cursor-not-allowed opacity-55 text-left',
      nameClass: 'text-slate-500'
    };
  }

  const styles: Record<string, { btnClass: string; nameClass: string }> = {
    Normal: {
      btnClass: 'border-type-normal/25 bg-type-normal/5 hover:border-type-normal/50 hover:bg-type-normal/10 hover:shadow-[0_0_12px_#A8A77A] text-left transition-all',
      nameClass: 'text-type-normal'
    },
    Fire: {
      btnClass: 'border-type-fire/25 bg-type-fire/5 hover:border-type-fire/50 hover:bg-type-fire/10 hover:shadow-[0_0_12px_#EE8130] text-left transition-all',
      nameClass: 'text-type-fire'
    },
    Water: {
      btnClass: 'border-type-water/25 bg-type-water/5 hover:border-type-water/50 hover:bg-type-water/10 hover:shadow-[0_0_12px_#6390F0] text-left transition-all',
      nameClass: 'text-type-water'
    },
    Electric: {
      btnClass: 'border-type-electric/25 bg-type-electric/5 hover:border-type-electric/50 hover:bg-type-electric/10 hover:shadow-[0_0_12px_#F7D02C] text-left transition-all',
      nameClass: 'text-type-electric'
    },
    Grass: {
      btnClass: 'border-type-grass/25 bg-type-grass/5 hover:border-type-grass/50 hover:bg-type-grass/10 hover:shadow-[0_0_12px_#7AC74C] text-left transition-all',
      nameClass: 'text-type-grass'
    },
    Ice: {
      btnClass: 'border-type-ice/25 bg-type-ice/5 hover:border-type-ice/50 hover:bg-type-ice/10 hover:shadow-[0_0_12px_#96D9D6] text-left transition-all',
      nameClass: 'text-type-ice'
    },
    Fighting: {
      btnClass: 'border-type-fighting/25 bg-type-fighting/5 hover:border-type-fighting/50 hover:bg-type-fighting/10 hover:shadow-[0_0_12px_#C22E28] text-left transition-all',
      nameClass: 'text-type-fighting'
    },
    Poison: {
      btnClass: 'border-type-poison/25 bg-type-poison/5 hover:border-type-poison/50 hover:bg-type-poison/10 hover:shadow-[0_0_12px_#A33EA1] text-left transition-all',
      nameClass: 'text-type-poison'
    },
    Ground: {
      btnClass: 'border-type-ground/25 bg-type-ground/5 hover:border-type-ground/50 hover:bg-type-ground/10 hover:shadow-[0_0_12px_#E2BF65] text-left transition-all',
      nameClass: 'text-type-ground'
    },
    Flying: {
      btnClass: 'border-type-flying/25 bg-type-flying/5 hover:border-type-flying/50 hover:bg-type-flying/10 hover:shadow-[0_0_12px_#A98FF3] text-left transition-all',
      nameClass: 'text-type-flying'
    },
    Psychic: {
      btnClass: 'border-type-psychic/25 bg-type-psychic/5 hover:border-type-psychic/50 hover:bg-type-psychic/10 hover:shadow-[0_0_12px_#F95587] text-left transition-all',
      nameClass: 'text-type-psychic'
    },
    Bug: {
      btnClass: 'border-type-bug/25 bg-type-bug/5 hover:border-type-bug/50 hover:bg-type-bug/10 hover:shadow-[0_0_12px_#A6B91A] text-left transition-all',
      nameClass: 'text-type-bug'
    },
    Rock: {
      btnClass: 'border-type-rock/25 bg-type-rock/5 hover:border-type-rock/50 hover:bg-type-rock/10 hover:shadow-[0_0_12px_#B6A136] text-left transition-all',
      nameClass: 'text-type-rock'
    },
    Ghost: {
      btnClass: 'border-type-ghost/25 bg-type-ghost/5 hover:border-type-ghost/50 hover:bg-type-ghost/10 hover:shadow-[0_0_12px_#735797] text-left transition-all',
      nameClass: 'text-type-ghost'
    },
    Dragon: {
      btnClass: 'border-type-dragon/25 bg-type-dragon/5 hover:border-type-dragon/50 hover:bg-type-dragon/10 hover:shadow-[0_0_12px_#6F35FC] text-left transition-all',
      nameClass: 'text-type-dragon'
    },
    Dark: {
      btnClass: 'border-type-dark/25 bg-type-dark/5 hover:border-type-dark/50 hover:bg-type-dark/10 hover:shadow-[0_0_12px_#705746] text-left transition-all',
      nameClass: 'text-type-dark'
    },
    Steel: {
      btnClass: 'border-type-steel/25 bg-type-steel/5 hover:border-type-steel/50 hover:bg-type-steel/10 hover:shadow-[0_0_12px_#B7B7CE] text-left transition-all',
      nameClass: 'text-type-steel'
    },
    Fairy: {
      btnClass: 'border-type-fairy/25 bg-type-fairy/5 hover:border-type-fairy/50 hover:bg-type-fairy/10 hover:shadow-[0_0_12px_#D685AD] text-left transition-all',
      nameClass: 'text-type-fairy'
    }
  };

  return styles[type] || {
    btnClass: 'border-slate-800 bg-slate-950/80 hover:border-amber-500 hover:bg-slate-900/40 text-left',
    nameClass: 'text-white'
  };
};

interface PokemonGameProps {
  trainerName?: string;
  trainerAvatar?: string;
  onBackToBoot?: () => void;
  delegatePhone?: string;
  delegateName?: string;
  delegateCommittee?: string;
  apiUrl?: string;
}

export const PokemonGame: React.FC<PokemonGameProps> = ({
  trainerName: propTrainerName,
  trainerAvatar: propTrainerAvatar,
  onBackToBoot,
  delegatePhone,
  delegateName,
  delegateCommittee,
  apiUrl
}) => {
  const trainerName = delegateName || propTrainerName || "Trainer";
  const trainerAvatar = propTrainerAvatar || "🔮";

  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'campaign' | 'versus' | 'online_players' | 'pokedex' | 'synth'>('campaign');
  
  // Active region filters for different Pokémon selection lists
  const [campaignRegion, setCampaignRegion] = useState<string>('Kanto');
  const [draftP1Region, setDraftP1Region] = useState<string>('Kanto');
  const [draftP2Region, setDraftP2Region] = useState<string>('Kanto');
  const [pokedexRegion, setPokedexRegion] = useState<string>('Kanto');

  // Game state
  const [gameState, setGameState] = useState<'lobby' | 'teamSelect' | 'battle' | 'gameOver'>('lobby');
  const [battleMode, setBattleMode] = useState<'campaign' | 'versus' | 'online'>('campaign');

  // Online Multiplayer state
  const [onlinePlayerPhone, setOnlinePlayerPhone] = useState<string>(() => {
    if (delegatePhone) return delegatePhone;
    let id = localStorage.getItem('pokemon_trainer_phone');
    if (!id) {
      id = "9" + Math.floor(100000000 + Math.random() * 900000000).toString();
      localStorage.setItem('pokemon_trainer_phone', id);
    }
    return id;
  });

  useEffect(() => {
    if (delegatePhone) {
      setOnlinePlayerPhone(delegatePhone);
    }
  }, [delegatePhone]);

  const [personalStats, setPersonalStats] = useState<{
    wins: number;
    losses: number;
    playedToday: number;
    couponCode: string;
  } | null>(null);

  const [onlineBattleId, setOnlineBattleId] = useState<string | null>(null);
  const [onlineOpponentPhone, setOnlineOpponentPhone] = useState<string | null>(null);
  const [onlineOpponentName, setOnlineOpponentName] = useState<string | null>(null);
  const [isOnlineTurnWaiting, setIsOnlineTurnWaiting] = useState<boolean>(false);

  // Matchmaking status: 'idle' | 'searching' | 'matched' | 'timeout'
  const [matchmakingStatus, setMatchmakingStatus] = useState<'idle' | 'searching' | 'matched' | 'timeout'>('idle');
  const [matchmakingTimer, setMatchmakingTimer] = useState<number>(30);

  // Room status: 'idle' | 'hosting' | 'joining'
  const [roomStatus, setRoomStatus] = useState<'idle' | 'hosting' | 'joining'>('idle');
  const [roomCode, setRoomCode] = useState<string>('');
  const [enteredRoomCode, setEnteredRoomCode] = useState<string>('');
  const [roomError, setRoomError] = useState<string>('');

  // Direct Challenge & Heartbeat state
  const [activeTrainers, setActiveTrainers] = useState<any[]>([]);
  const [receivedInvite, setReceivedInvite] = useState<any | null>(null);
  const [sentInvite, setSentInvite] = useState<any | null>(null);
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState<boolean>(false);
  const [lastProcessedOnlineTurn, setLastProcessedOnlineTurnState] = useState<number>(1);
  const lastProcessedOnlineTurnRef = useRef<number>(1);
  const setLastProcessedOnlineTurn = (val: number) => {
    setLastProcessedOnlineTurnState(val);
    lastProcessedOnlineTurnRef.current = val;
  };
  
  // Campaign progress (0 to 4 defeated bosses)
  const [campaignProgress, setCampaignProgress] = useState<number>(() => {
    return parseInt(localStorage.getItem('pokemon_campaign_progress') || '0', 10);
  });

  // Selected campaign NPC to challenge (defaults to current unlocked NPC)
  const [selectedCampaignNpc, setSelectedCampaignNpc] = useState<NpcTrainer>(() => {
    const currentIdx = Math.min(
      parseInt(localStorage.getItem('pokemon_campaign_progress') || '0', 10),
      NPC_TRAINERS.length - 1
    );
    return NPC_TRAINERS[currentIdx] || NPC_TRAINERS[0];
  });

  // Keep selectedCampaignNpc in sync with progress if it unlocks new trainers
  useEffect(() => {
    const currentIdx = Math.min(campaignProgress, NPC_TRAINERS.length - 1);
    if (NPC_TRAINERS[currentIdx]) {
      setSelectedCampaignNpc(NPC_TRAINERS[currentIdx]);
    }
  }, [campaignProgress]);

  // Trim team draft when required size changes
  useEffect(() => {
    const requiredSize = selectedCampaignNpc?.name === "Kartik Kumar" ? 6 : 3;
    if (selectedPokeIdsP1.length > requiredSize) {
      setSelectedPokeIdsP1(selectedPokeIdsP1.slice(0, requiredSize));
    }
  }, [selectedCampaignNpc]);

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
  const [isBattleAnimating, setIsBattleAnimatingState] = useState(false);
  const isBattleAnimatingRef = useRef(false);
  const setIsBattleAnimating = (val: boolean) => {
    setIsBattleAnimatingState(val);
    isBattleAnimatingRef.current = val;
  };
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

  // Screen orientation and portrait detection
  const [isPortrait, setIsPortrait] = useState<boolean>(false);

  useEffect(() => {
    const checkOrientation = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
    };
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  const lockLandscape = async () => {
    // Try requesting fullscreen if mobile to allow orientation lock
    try {
      const docEl = document.documentElement;
      if (docEl.requestFullscreen) {
        await docEl.requestFullscreen().catch(() => {});
      } else if ((docEl as any).webkitRequestFullscreen) {
        await (docEl as any).webkitRequestFullscreen().catch(() => {});
      }
    } catch (err) {
      console.warn('Fullscreen request failed:', err);
    }

    // Attempt locking screen orientation to landscape
    try {
      const orient = window.screen && (window.screen.orientation as any);
      if (orient && orient.lock) {
        await orient.lock('landscape').catch(() => {});
      } else if ((window.screen as any).lockOrientation) {
        (window.screen as any).lockOrientation('landscape');
      } else if ((window.screen as any).mozLockOrientation) {
        (window.screen as any).mozLockOrientation('landscape');
      } else if ((window.screen as any).msLockOrientation) {
        (window.screen as any).msLockOrientation('landscape');
      }
    } catch (err) {
      console.warn('Screen orientation lock failed:', err);
    }
  };

  const unlockOrientation = async () => {
    try {
      const orient = window.screen && (window.screen.orientation as any);
      if (orient && orient.unlock) {
        orient.unlock();
      }
    } catch (err) {
      console.warn('Screen orientation unlock failed:', err);
    }

    try {
      if (document.fullscreenElement) {
        if (document.exitFullscreen) {
          await document.exitFullscreen().catch(() => {});
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen().catch(() => {});
        }
      }
    } catch (err) {
      console.warn('Exit fullscreen failed:', err);
    }
  };

  // Keep screen orientation state synced with gameState
  useEffect(() => {
    if (gameState === 'battle') {
      lockLandscape();
    } else {
      unlockOrientation();
    }
    return () => {
      if (gameState === 'battle') {
        unlockOrientation();
      }
    };
  }, [gameState]);

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

  const playerTeamRef = useRef<Pokemon[]>(playerTeam);
  useEffect(() => {
    playerTeamRef.current = playerTeam;
  }, [playerTeam]);

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
    const requiredSize = battleMode === 'campaign'
      ? (selectedCampaignNpc?.name === "Kartik Kumar" ? 6 : 3)
      : 3;
    if (selectedPokeIdsP1.includes(id)) {
      setSelectedPokeIdsP1(selectedPokeIdsP1.filter(x => x !== id));
    } else if (selectedPokeIdsP1.length < requiredSize) {
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
    const reqSize = npc.name === "Kartik Kumar" ? 6 : 3;
    if (selectedPokeIdsP1.length !== reqSize) {
      gameAudio.playFaint();
      setSelectedCampaignNpc(npc);
      alert(`To challenge ${npc.name}, you must draft exactly ${reqSize} Pokémon on the team selection panel first!`);
      return;
    }
    gameAudio.playSelect();
    lockLandscape();
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
    lockLandscape();
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

        // Dynamic HP drain healing resolution for offline/campaign/versus
        const isDrainMove = act.move.category !== 'Status' && act.move.effect === 'heal';
        if (isDrainMove) {
          const healAmt = Math.floor(dmg * 0.5);
          act.actor.hp = Math.min(act.actor.maxHp, act.actor.hp + healAmt);
          logs.push(`${act.actor.name} absorbed nutrients and recovered ${healAmt} HP!`);
          if (act.isP1) {
            setPlayerFloat({ text: `+${healAmt} HP`, color: 'text-emerald-400 font-bold' });
            setTimeout(() => setPlayerFloat(null), 1200);
          } else {
            setOpponentFloat({ text: `+${healAmt} HP`, color: 'text-emerald-400 font-bold' });
            setTimeout(() => setOpponentFloat(null), 1200);
          }
        }

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
      if (battleMode === 'campaign' && activeNpc?.name !== "Kartik Kumar") {
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
        // Versus Mode or Kartik Kumar: force another Pokémon of Player 2 / Boss to come out
        const nextOppIdx = opponentTeam.findIndex(p => p.hp > 0);
        if (nextOppIdx !== -1) {
          setActiveOpponentIdx(nextOppIdx);
          logs.push(`\n🔄 ${battleMode === 'campaign' ? "Kartik's" : "Player 2's"} ${activeP2.name} fainted! ${opponentTeam[nextOppIdx].name} was forced onto the battlefield!`);
          setTimeout(() => gameAudio.playHeal(), 300);
        } else {
          logs.push(`\n🏆 All opposing Pokémon have fainted! ${battleMode === 'campaign' ? 'You won' : 'Player 1 wins'} the battle!`);
          setGameState('gameOver');
          setWinnerName(trainerName);
          if (battleMode === 'campaign' && activeNpc) {
            setHasWonCampaignVoucher(true);
            const currentNpcIdx = NPC_TRAINERS.findIndex(x => x.name === activeNpc.name);
            if (currentNpcIdx >= campaignProgress) {
              const nextProgress = currentNpcIdx + 1;
              setCampaignProgress(nextProgress);
              localStorage.setItem('pokemon_campaign_progress', String(nextProgress));
            }
          }
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
    lockLandscape();
    
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

  // --- ONLINE MULTIPLAYER ENGINE AND POLLING ---

  // --- ONLINE MULTIPLAYER ENGINE AND POLLING ---

  const updateOnlineBattleStateDirect = (battle: any) => {
    if (!battle) return;

    const isPlayer1 = onlinePlayerPhone === battle.player1Phone;
    
    // Map teams
    const myTeam = isPlayer1 ? battle.player1Team : battle.player2Team;
    const oppTeam = isPlayer1 ? battle.player2Team : battle.player1Team;
    
    const myActiveIdx = isPlayer1 ? battle.player1ActiveIndex : battle.player2ActiveIndex;
    const oppActiveIdx = isPlayer1 ? battle.player2ActiveIndex : battle.player1ActiveIndex;
    
    const myMove = isPlayer1 ? battle.player1MoveName : battle.player2MoveName;
    
    if (myTeam) {
      setPlayerTeam(myTeam);
      setActivePlayerIdx(myActiveIdx);
    }
    
    if (oppTeam) {
      setOpponentTeam(oppTeam);
      setActiveOpponentIdx(oppActiveIdx);
    }
    
    // Set opponent info
    const oppName = isPlayer1 ? battle.player2Name : battle.player1Name;
    const oppPhone = isPlayer1 ? battle.player2Phone : battle.player1Phone;
    setOnlineOpponentName(oppName || "Opponent");
    setOnlineOpponentPhone(oppPhone || null);
    
    // Turn waiting state: we have chosen a move, but opponent hasn't
    const waiting = myMove !== null;
    setIsOnlineTurnWaiting(waiting);
    
    // Sync logs
    if (battle.log && battle.log.length > 0) {
      setBattleLogs(battle.log);
    }
    
    // Game over checks
    if (battle.status === 'completed' || battle.winnerPhone) {
      setGameState('gameOver');
      const won = battle.winnerPhone === onlinePlayerPhone;
      setWinnerName(won ? trainerName : (oppName || "Opponent"));
      setHasWonCampaignVoucher(false);
    }
  };

  const executeOnlineCombatMoves = async (res: any, finalBattle: any) => {
    setIsBattleAnimating(true);

    const isPlayer1 = onlinePlayerPhone === finalBattle.player1Phone;
    const myActiveIdx = isPlayer1 ? finalBattle.player1ActiveIndex : finalBattle.player2ActiveIndex;
    const oppActiveIdx = isPlayer1 ? finalBattle.player2ActiveIndex : finalBattle.player1ActiveIndex;
    
    // Map initial teams before resolution
    const initialMyTeam = isPlayer1 ? res.p1InitialHp.map((hp: number, i: number) => ({
      ...finalBattle.player1Team[i],
      hp,
      status: res.p1InitialStatus[i]
    })) : res.p2InitialHp.map((hp: number, i: number) => ({
      ...finalBattle.player2Team[i],
      hp,
      status: res.p2InitialStatus[i]
    }));

    const initialOppTeam = isPlayer1 ? res.p2InitialHp.map((hp: number, i: number) => ({
      ...finalBattle.player2Team[i],
      hp,
      status: res.p2InitialStatus[i]
    })) : res.p1InitialHp.map((hp: number, i: number) => ({
      ...finalBattle.player1Team[i],
      hp,
      status: res.p1InitialStatus[i]
    }));

    // Put local state back to initial values for sequential animation
    setPlayerTeam(initialMyTeam);
    setOpponentTeam(initialOppTeam);

    const curP1 = initialMyTeam[myActiveIdx];
    const curP2 = initialOppTeam[oppActiveIdx];

    const logs: string[] = [...battleLogs];
    logs.push(`\n--- Turn Action ---`);
    setBattleLogs([...logs]);

    const p1MoveName = res.player1MoveName;
    const p2MoveName = res.player2MoveName;
    const p1Move = curP1.moves.find((m: any) => m.name === (isPlayer1 ? p1MoveName : p2MoveName));
    const p2Move = curP2.moves.find((m: any) => m.name === (isPlayer1 ? p2MoveName : p1MoveName));

    if (!p1Move || !p2Move) {
      setIsBattleAnimating(false);
      updateOnlineBattleStateDirect(finalBattle);
      return;
    }

    const p1First = curP1.speed >= curP2.speed;
    const order = p1First
      ? [
          { actor: curP1, target: curP2, move: p1Move, isLocal: true },
          { actor: curP2, target: curP1, move: p2Move, isLocal: false }
        ]
      : [
          { actor: curP2, target: curP1, move: p2Move, isLocal: false },
          { actor: curP1, target: curP2, move: p1Move, isLocal: true }
        ];

    let myFainted = false;
    let oppFainted = false;

    // Synchronize starting lanes/aims
    const localDodge = isPlayer1 ? res.player1DodgeLane : res.player2DodgeLane;
    const localAim = isPlayer1 ? res.player1AimLane : res.player2AimLane;
    const remoteDodge = isPlayer1 ? res.player2DodgeLane : res.player1DodgeLane;
    const remoteAim = isPlayer1 ? res.player2AimLane : res.player1AimLane;

    setPlayerLane(localDodge);
    playerLaneRef.current = localDodge;
    setPlayerAimLane(localAim);
    playerAimLaneRef.current = localAim;
    setOpponentLane(remoteDodge);
    opponentLaneRef.current = remoteDodge;
    setOpponentAimLane(remoteAim);
    opponentAimLaneRef.current = remoteAim;

    for (let idx = 0; idx < order.length; idx++) {
      const act = order[idx];

      if (act.actor.hp <= 0) {
        continue; // fainted during earlier step
      }

      // Paralysis skip check
      if (act.actor.status === 'Paralyzed' && Math.random() < 0.25) {
        logs.push(`${act.actor.name} is paralyzed! It can't move.`);
        setBattleLogs([...logs]);
        await delay(1200);
        continue;
      }

      // 1. ANNOUNCE AND LAUNCH ATTACK
      logs.push(`${act.isLocal ? 'Your' : "Opponent's"} ${act.actor.name} used ${act.move.name}!`);
      setBattleLogs([...logs]);

      // Attacker lunge
      if (act.isLocal) {
        setPlayerAttacking(true);
        setTimeout(() => setPlayerAttacking(false), 300);
      } else {
        setOpponentAttacking(true);
        setTimeout(() => setOpponentAttacking(false), 300);
      }

      const currentActorLane = act.isLocal ? localDodge : remoteDodge;
      const currentAimLane = act.isLocal ? localAim : remoteAim;

      const isHeal = act.move.category === 'Status' && act.move.effect === 'heal';

      if (isHeal) {
        gameAudio.playHeal();
        setActiveVfx({
          moveName: act.move.name,
          type: 'Heal',
          direction: act.isLocal ? 'p1_to_p2' : 'p2_to_p1',
          stage: 'travel',
          category: act.move.category,
          actorLane: currentActorLane,
          aimLane: currentAimLane
        });
      } else {
        gameAudio.playBeam();
        setActiveVfx({
          moveName: act.move.name,
          type: act.move.type,
          direction: act.isLocal ? 'p1_to_p2' : 'p2_to_p1',
          stage: 'travel',
          category: act.move.category,
          actorLane: currentActorLane,
          aimLane: currentAimLane
        });
      }

      // Wait 600ms for projectile travel
      await delay(600);

      const targetLane = act.isLocal ? remoteDodge : localDodge;
      const isDodged = !isHeal && (currentAimLane !== targetLane);

      // 2. DELAYED IMPACT RESOLUTION
      if (!isHeal) {
        if (isDodged) {
          gameAudio.playPop(); // Swoosh/pop sound for dodge
          const aimDirectionName = currentAimLane === -1 ? 'Left' : currentAimLane === 1 ? 'Right' : 'Middle';
          const targetLaneName = targetLane === -1 ? 'Left' : targetLane === 1 ? 'Right' : 'Middle';
          logs.push(`💨 ${act.target.name} dodged the attack! (Aimed: ${aimDirectionName} vs actual position: ${targetLaneName})`);
          if (act.isLocal) {
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
          if (act.isLocal) {
            setOpponentHit(true);
            setTimeout(() => setOpponentHit(false), 250);
          } else {
            setPlayerHit(true);
            setTimeout(() => setPlayerHit(false), 250);
          }
        }
      }

      // Resolve stats/HP state changes using final server data for actor/target
      if (isHeal) {
        const finalActorHp = act.isLocal 
          ? (isPlayer1 ? finalBattle.player1Team[myActiveIdx].hp : finalBattle.player2Team[myActiveIdx].hp)
          : (isPlayer1 ? finalBattle.player2Team[oppActiveIdx].hp : finalBattle.player1Team[oppActiveIdx].hp);
        
        const healAmt = finalActorHp - act.actor.hp;
        act.actor.hp = finalActorHp;

        logs.push(`${act.actor.name} recovered ${healAmt} HP!`);
        if (act.isLocal) {
          setPlayerFloat({ text: `+${healAmt} HP`, color: 'text-emerald-400' });
          setTimeout(() => setPlayerFloat(null), 1000);
        } else {
          setOpponentFloat({ text: `+${healAmt} HP`, color: 'text-emerald-400' });
          setTimeout(() => setOpponentFloat(null), 1000);
        }
      } else if (!isDodged) {
        const finalTargetHp = act.isLocal
          ? (isPlayer1 ? finalBattle.player2Team[oppActiveIdx].hp : finalBattle.player1Team[oppActiveIdx].hp)
          : (isPlayer1 ? finalBattle.player1Team[myActiveIdx].hp : finalBattle.player2Team[myActiveIdx].hp);

        const dmg = act.target.hp - finalTargetHp;
        act.target.hp = finalTargetHp;

        // Dynamic HP drain healing resolution on client based on authoritative server state
        const isDrainMove = act.move.category !== 'Status' && act.move.effect === 'heal';
        if (isDrainMove) {
          const finalActorHp = act.isLocal
            ? (isPlayer1 ? finalBattle.player1Team[myActiveIdx].hp : finalBattle.player2Team[myActiveIdx].hp)
            : (isPlayer1 ? finalBattle.player2Team[oppActiveIdx].hp : finalBattle.player1Team[oppActiveIdx].hp);
          const healAmt = finalActorHp - act.actor.hp;
          if (healAmt > 0) {
            act.actor.hp = finalActorHp;
            logs.push(`${act.actor.name} absorbed nutrients and recovered ${healAmt} HP!`);
            if (act.isLocal) {
              setPlayerFloat({ text: `+${healAmt} HP`, color: 'text-emerald-400 font-bold' });
              setTimeout(() => setPlayerFloat(null), 1200);
            } else {
              setOpponentFloat({ text: `+${healAmt} HP`, color: 'text-emerald-400 font-bold' });
              setTimeout(() => setOpponentFloat(null), 1200);
            }
          }
        }

        const finalTargetStatus = act.isLocal
          ? (isPlayer1 ? finalBattle.player2Team[oppActiveIdx].status : finalBattle.player1Team[oppActiveIdx].status)
          : (isPlayer1 ? finalBattle.player1Team[myActiveIdx].status : finalBattle.player2Team[myActiveIdx].status);
        
        if (finalTargetStatus !== act.target.status) {
          act.target.status = finalTargetStatus;
          logs.push(`${act.target.name} is ${finalTargetStatus}!`);
        }

        let mult = getTypeMult(act.move.type, act.target.type);
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
          effectivenessData = {
            text: "🎯 EFFECTIVE",
            badgeClass: "bg-sky-500 text-slate-950 border-sky-300 shadow-[0_0_12px_rgba(14,165,233,0.5)]"
          };
        }

        logs.push(`Dealt ${dmg} damage.`);
        if (act.isLocal) {
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

        if (act.target.hp <= 0) {
          logs.push(`${act.target.name} fainted!`);
          setTimeout(() => gameAudio.playFaint(), 200);
          if (act.isLocal) oppFainted = true;
          else myFainted = true;
        }
      }

      setBattleLogs([...logs]);

      await delay(500);
      setActiveVfx(null);

      await delay(900);

      if (myFainted || oppFainted) {
        break;
      }
    }

    setIsBattleAnimating(false);
    updateOnlineBattleStateDirect(finalBattle);
  };

  const updateOnlineBattleState = (battle: any) => {
    if (!battle) return;

    if (battle.turn > lastProcessedOnlineTurnRef.current) {
      setLastProcessedOnlineTurn(battle.turn);
      if (battle.lastTurnResolved && battle.turn > 1) {
        executeOnlineCombatMoves(battle.lastTurnResolved, battle);
      } else {
        updateOnlineBattleStateDirect(battle);
      }
    } else {
      if (!isBattleAnimatingRef.current) {
        updateOnlineBattleStateDirect(battle);
      }
    }
  };

  const handleOnlineSubmitMove = async (move: Move) => {
    if (!onlineBattleId || !onlinePlayerPhone || isOnlineTurnWaiting) return;
    gameAudio.playSelect();
    setIsOnlineTurnWaiting(true);

    try {
      const response = await fetch('/api/game/battle-submit-move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          battleId: onlineBattleId,
          myPhone: onlinePlayerPhone,
          moveName: move.name,
          aimLane: playerAimLaneRef.current,
          dodgeLane: playerLaneRef.current
        })
      });
      const data = await response.json();
      if (data.ok) {
        updateOnlineBattleState(data.battle);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleOnlinePlayerSwitch = async (idx: number) => {
    if (battleMode === 'online' && onlineBattleId) {
      try {
        const response = await fetch('/api/game/battle-switch-fainted', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ battleId: onlineBattleId, myPhone: onlinePlayerPhone, nextIndex: idx })
        });
        const data = await response.json();
        if (data.ok) {
          updateOnlineBattleState(data.battle);
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      handlePlayerSwitch(idx);
    }
  };

  const initOnlineBattleState = (battleId: string) => {
    setOnlineBattleId(battleId);
    setBattleMode('online');
    setGameState('battle');
    setLastProcessedOnlineTurn(1);
    setIsOnlineTurnWaiting(false);
    setPlayerLane(0);
    playerLaneRef.current = 0;
    setPlayerAimLane(0);
    playerAimLaneRef.current = 0;
    setOpponentLane(0);
    opponentLaneRef.current = 0;
    setOpponentAimLane(0);
    opponentAimLaneRef.current = 0;
  };

  const handleStartMatchmaking = async () => {
    let curSelectedIds = [...selectedPokeIdsP1];
    if (curSelectedIds.length !== 3) {
      // Auto-draft first 3 Pokémon
      curSelectedIds = POKEMON_ROSTER.slice(0, 3).map(p => p.id);
      setSelectedPokeIdsP1(curSelectedIds);
    }
    const curSelectedTeam = POKEMON_ROSTER.filter(p => curSelectedIds.includes(p.id)).map(p => ({ ...p }));
    
    gameAudio.playSelect();
    setMatchmakingStatus('searching');
    setMatchmakingTimer(30);
    setPlayerTeam(curSelectedTeam);
    
    try {
      const response = await fetch('/api/game/matchmake/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: onlinePlayerPhone,
          name: trainerName,
          team: curSelectedTeam
        })
      });
      const data = await response.json();
      if (data.ok && data.matched) {
        setMatchmakingStatus('matched');
        initOnlineBattleState(data.battleId);
        setOnlineOpponentName(data.opponentName);
        gameAudio.playHeal();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCancelMatchmaking = async (isTimeout = false) => {
    gameAudio.playFaint();
    setMatchmakingStatus(isTimeout ? 'timeout' : 'idle');
    try {
      await fetch('/api/game/matchmake/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: onlinePlayerPhone })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateRoom = async () => {
    let curSelectedIds = [...selectedPokeIdsP1];
    if (curSelectedIds.length !== 3) {
      // Auto-draft first 3 Pokémon
      curSelectedIds = POKEMON_ROSTER.slice(0, 3).map(p => p.id);
      setSelectedPokeIdsP1(curSelectedIds);
    }
    const curSelectedTeam = POKEMON_ROSTER.filter(p => curSelectedIds.includes(p.id)).map(p => ({ ...p }));
    
    gameAudio.playSelect();
    setRoomError('');
    setPlayerTeam(curSelectedTeam);
    
    try {
      const response = await fetch('/api/game/room/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: onlinePlayerPhone,
          name: trainerName,
          team: curSelectedTeam
        })
      });
      const data = await response.json();
      if (data.ok) {
        setRoomCode(data.code);
        setRoomStatus('hosting');
      } else {
        setRoomError(data.error || 'Failed to create room.');
      }
    } catch (e) {
      console.error(e);
      setRoomError('Server error creating room.');
    }
  };

  const handleJoinRoom = async () => {
    const code = enteredRoomCode.trim();
    if (!code) {
      setRoomError("Please enter a room code!");
      return;
    }
    
    let curSelectedIds = [...selectedPokeIdsP1];
    if (curSelectedIds.length !== 3) {
      // Auto-draft first 3 Pokémon
      curSelectedIds = POKEMON_ROSTER.slice(0, 3).map(p => p.id);
      setSelectedPokeIdsP1(curSelectedIds);
    }
    const curSelectedTeam = POKEMON_ROSTER.filter(p => curSelectedIds.includes(p.id)).map(p => ({ ...p }));
    
    gameAudio.playSelect();
    setRoomError('');
    setPlayerTeam(curSelectedTeam);
    
    try {
      const response = await fetch('/api/game/room/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          phone: onlinePlayerPhone,
          name: trainerName,
          team: curSelectedTeam
        })
      });
      const data = await response.json();
      if (data.ok) {
        initOnlineBattleState(data.battleId);
        gameAudio.playHeal();
      } else {
        setRoomError(data.error || 'Failed to join room.');
        gameAudio.playFaint();
      }
    } catch (e) {
      console.error(e);
      setRoomError('Server error joining room.');
      gameAudio.playFaint();
    }
  };

  // Polling loop for active matchmaking
  useEffect(() => {
    if (matchmakingStatus !== 'searching') return;

    let countdownInterval = setInterval(() => {
      setMatchmakingTimer(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          handleCancelMatchmaking(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    let pollInterval = setInterval(async () => {
      try {
        const response = await fetch('/api/game/matchmake/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: onlinePlayerPhone })
        });
        const data = await response.json();
        if (data.ok) {
          if (data.matched) {
            clearInterval(countdownInterval);
            clearInterval(pollInterval);
            setMatchmakingStatus('matched');
            initOnlineBattleState(data.battleId);
            setOnlineOpponentName(data.opponentName);
            gameAudio.playHeal();
          } else if (data.timeout) {
            clearInterval(countdownInterval);
            clearInterval(pollInterval);
            setMatchmakingStatus('timeout');
            gameAudio.playFaint();
          }
        }
      } catch (e) {
        console.error(e);
      }
    }, 1500);

    return () => {
      clearInterval(countdownInterval);
      clearInterval(pollInterval);
    };
  }, [matchmakingStatus, onlinePlayerPhone]);

  // Polling loop for room guest joining
  useEffect(() => {
    if (roomStatus !== 'hosting' || !roomCode) return;

    let active = true;
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch('/api/game/room/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: roomCode })
        });
        if (!active) return;
        const data = await response.json();
        if (data.ok && data.room) {
          if (data.room.battleId) {
            clearInterval(pollInterval);
            setRoomStatus('idle');
            initOnlineBattleState(data.room.battleId);
            setOnlineOpponentName(data.room.guestName || "Guest");
            gameAudio.playHeal();
          }
        }
      } catch (e) {
        console.error(e);
      }
    }, 1500);

    return () => {
      active = false;
      clearInterval(pollInterval);
    };
  }, [roomStatus, roomCode]);

  // --- DIRECT CHALLENGE ENGINE HANDLERS AND POLLING ---

  const handleSendChallenge = async (opponent: any) => {
    let curSelectedIds = [...selectedPokeIdsP1];
    if (curSelectedIds.length !== 3) {
      // Auto-draft first 3 Pokémon
      curSelectedIds = POKEMON_ROSTER.slice(0, 3).map(p => p.id);
      setSelectedPokeIdsP1(curSelectedIds);
    }
    const curSelectedTeam = POKEMON_ROSTER.filter(p => curSelectedIds.includes(p.id)).map(p => ({ ...p }));
    
    gameAudio.playSelect();
    setPlayerTeam(curSelectedTeam);

    try {
      const response = await fetch('/api/game/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromPhone: onlinePlayerPhone,
          fromName: trainerName,
          toPhone: opponent.phone,
          fromTeam: curSelectedTeam
        })
      });
      const data = await response.json();
      if (data.ok && data.invite) {
        setSentInvite({ ...data.invite, toName: opponent.name });
        setIsChallengeModalOpen(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAcceptInvite = async () => {
    if (!receivedInvite) return;
    let curSelectedIds = [...selectedPokeIdsP1];
    if (curSelectedIds.length !== 3) {
      // Auto-draft first 3 Pokémon
      curSelectedIds = POKEMON_ROSTER.slice(0, 3).map(p => p.id);
      setSelectedPokeIdsP1(curSelectedIds);
    }
    const curSelectedTeam = POKEMON_ROSTER.filter(p => curSelectedIds.includes(p.id)).map(p => ({ ...p }));
    
    gameAudio.playSelect();
    setPlayerTeam(curSelectedTeam);

    try {
      const response = await fetch('/api/game/accept-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: receivedInvite.id,
          toTeam: curSelectedTeam
        })
      });
      const data = await response.json();
      if (data.ok) {
        setReceivedInvite(null);
        initOnlineBattleState(data.battleId);
        gameAudio.playHeal();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeclineInvite = async () => {
    if (!receivedInvite) return;
    gameAudio.playFaint();
    try {
      await fetch('/api/game/decline-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: receivedInvite.id })
      });
      setReceivedInvite(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCancelSentChallenge = async () => {
    if (!sentInvite) return;
    gameAudio.playFaint();
    try {
      await fetch('/api/game/decline-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: sentInvite.id })
      });
      setSentInvite(null);
      setIsChallengeModalOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  // Polling loop for online trainers heartbeat and incoming direct invites
  useEffect(() => {
    if (gameState !== 'lobby') return;

    let active = true;
    
    const fetchPersonalStats = async () => {
      try {
        const statsRes = await fetch(`/api/game/trainer-records?phone=${encodeURIComponent(onlinePlayerPhone)}`);
        const statsData = await statsRes.json();
        if (active && statsData.ok && statsData.stats) {
          setPersonalStats(statsData.stats);
        }
      } catch (err) {
        console.error("Error fetching personal stats:", err);
      }
    };
    fetchPersonalStats();

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch('/api/game/heartbeat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: onlinePlayerPhone,
            name: trainerName,
            committee: 'Trainer'
          })
        });
        if (!active) return;
        const data = await response.json();
        if (data.ok) {
          setActiveTrainers(data.onlinePlayers || []);
          if (data.incomingInvite) {
            setReceivedInvite(data.incomingInvite);
          } else {
            setReceivedInvite(null);
          }
        }
      } catch (e) {
        console.error("Error with heartbeat:", e);
      }

      // Refresh stats
      fetchPersonalStats();
    }, 3000);

    return () => {
      active = false;
      clearInterval(pollInterval);
    };
  }, [gameState, onlinePlayerPhone, trainerName]);

  // Polling loop for direct challenge we sent
  useEffect(() => {
    if (!sentInvite || sentInvite.status !== 'pending') return;

    let active = true;
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch('/api/game/invite-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: sentInvite.id })
        });
        if (!active) return;
        const data = await response.json();
        if (data.ok) {
          if (data.status === 'accepted') {
            clearInterval(pollInterval);
            setSentInvite(null);
            setIsChallengeModalOpen(false);
            
            // Start direct battle!
            initOnlineBattleState("battle_" + sentInvite.id);
            gameAudio.playHeal();
          } else if (data.status === 'declined') {
            clearInterval(pollInterval);
            alert(`${sentInvite.toName || 'Challenger'} declined your battle challenge.`);
            setSentInvite(null);
            setIsChallengeModalOpen(false);
            gameAudio.playFaint();
          }
        }
      } catch (e) {
        console.error("Error checking invite status:", e);
      }
    }, 1500);

    return () => {
      active = false;
      clearInterval(pollInterval);
    };
  }, [sentInvite]);

  // Polling loop for active online battle state
  useEffect(() => {
    if (gameState !== 'battle' || battleMode !== 'online' || !onlineBattleId) return;

    let active = true;
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch('/api/game/battle-state', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            battleId: onlineBattleId,
            myPhone: onlinePlayerPhone,
            myTeam: playerTeamRef.current
          })
        });
        if (!active) return;
        const data = await response.json();
        if (data.ok && data.battle) {
          updateOnlineBattleState(data.battle);
        }
      } catch (e) {
        console.error("Error polling battle state:", e);
      }
    }, 1500);

    return () => {
      active = false;
      clearInterval(pollInterval);
    };
  }, [gameState, battleMode, onlineBattleId, onlinePlayerPhone]);

  // HP progress color mapping
  const hpProgressColor = (hp: number, max: number) => {
    const ratio = hp / max;
    if (ratio >= 0.5) return 'bg-green-500';
    if (ratio >= 0.2) return 'bg-yellow-400';
    return 'bg-red-500 animate-pulse';
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
            { id: 'versus', label: '⚔️ Local Multiplayer', desc: 'Pass & Play Friends' },
            { id: 'online_players', label: '🌐 Online Players', desc: 'Duel Online Trainers' },
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
                <div className={`font-pressstart text-[8px] leading-normal tracking-tight ${active ? 'text-[#ffcc00] drop-shadow-[0_1px_0_rgba(59,76,202,0.8)] font-bold' : 'text-slate-200'}`}>
                  {t.label}
                </div>
                <div className="text-[10px] font-mono text-slate-400 mt-1">
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
                  <h3 className="pokemon-logo-text-sm text-sm flex items-center gap-1.5 border-b border-slate-900 pb-3 mb-4">
                    <span>Draft Your {selectedCampaignNpc?.name === "Kartik Kumar" ? 6 : 3}-Pokémon Team</span>
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mb-4 leading-relaxed">
                    Choose exactly {selectedCampaignNpc?.name === "Kartik Kumar" ? 6 : 3} elements to participate in the championship against {selectedCampaignNpc?.name || 'School Bosses'}.
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
                      <span className="text-amber-500">
                        {selectedPokeIdsP1.length} / {selectedCampaignNpc?.name === "Kartik Kumar" ? 6 : 3}
                      </span>
                    </div>
                    <div className={`grid ${selectedCampaignNpc?.name === "Kartik Kumar" ? "grid-cols-6" : "grid-cols-3"} gap-2`}>
                      {Array.from({ length: selectedCampaignNpc?.name === "Kartik Kumar" ? 6 : 3 }).map((_, idx) => {
                        const targetId = selectedPokeIdsP1[idx];
                        const poke = POKEMON_ROSTER.find(x => x.id === targetId);
                        return (
                          <div key={idx} className="flex flex-col items-center justify-center p-2 rounded-lg border border-dashed border-slate-800 bg-slate-950/40 min-h-[70px]">
                            {poke ? (
                              <>
                                <PokemonSprite name={poke.name} dexNumber={poke.dexNumber} className="w-8 h-8 object-contain" />
                                <span className="text-[8px] text-white font-medium truncate max-w-full mt-1">{poke.name}</span>
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
                  <span>Selected: {selectedPokeIdsP1.length} / {selectedCampaignNpc?.name === "Kartik Kumar" ? 6 : 3}</span>
                  {selectedPokeIdsP1.length !== (selectedCampaignNpc?.name === "Kartik Kumar" ? 6 : 3) && (
                    <span className="text-amber-500/80 animate-pulse">
                      Select {selectedCampaignNpc?.name === "Kartik Kumar" ? 6 : 3} to challenge {selectedCampaignNpc?.name}!
                    </span>
                  )}
                </div>
              </div>

              {/* Boss Challenge Cards List */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                <div className="bg-slate-950 border-2 border-slate-900 rounded-2xl p-5">
                  <h3 className="pokemon-logo-text-sm text-sm flex items-center gap-2 border-b border-slate-900 pb-3 mb-4">
                    <span>School Champion Campaign</span>
                    <span className="text-xs bg-slate-900 text-amber-500 border border-amber-500/20 rounded px-2 py-0.5 font-mono">
                      Step-by-Step Challenge
                    </span>
                  </h3>

                  {campaignProgress >= 5 && (
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
                      const isSelected = selectedCampaignNpc?.name === npc.name;
                      const reqSize = npc.name === "Kartik Kumar" ? 6 : 3;
                      const isDraftComplete = selectedPokeIdsP1.length === reqSize;
                      
                      return (
                        <div
                          key={npc.name}
                          onClick={() => {
                            if (isUnlocked) {
                              gameAudio.playSelect();
                              setSelectedCampaignNpc(npc);
                            }
                          }}
                          className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'border-amber-500 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                              : isBeaten
                              ? 'border-emerald-500/20 bg-emerald-950/5 hover:border-slate-800'
                              : isUnlocked
                              ? 'border-slate-800 bg-slate-900/30 hover:border-slate-750'
                              : 'border-slate-950 bg-slate-950/20 opacity-40 pointer-events-none'
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
                                {isSelected && (
                                  <span className="text-[9px] bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded font-mono font-bold uppercase">Targeted</span>
                                )}
                              </div>
                              <div className="text-xs text-amber-500/80 font-mono mt-0.5">{npc.role}</div>
                              <p className="text-xs text-slate-400 font-mono mt-1.5 italic">"{npc.intro}"</p>
                            </div>
                          </div>

                          <button
                            disabled={!isUnlocked || !isDraftComplete}
                            onClick={(e) => {
                              e.stopPropagation();
                              startCampaignBattle(npc);
                            }}
                            className={`btn sm ${isUnlocked && isDraftComplete ? 'pulse-btn' : ''}`}
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
            <div className="space-y-6">
              {/* Header Visualizer */}
              <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-2 border-slate-900/80 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
                  <div>
                    <span className="text-[9px] uppercase font-pressstart tracking-widest text-amber-500 font-bold block mb-1">
                      LOCAL MULTIPLAYER SECTOR
                    </span>
                    <h2 className="pokemon-logo-text text-xl sm:text-2xl font-black tracking-widest leading-none mt-1">
                      LOCAL MULTIPLAYER
                    </h2>
                    <p className="text-xs text-slate-400 font-mono mt-1.5 max-w-md">
                      Test your tactical prowess locally or connect with trainers across the globe in 3v3 combat.
                    </p>
                  </div>
                  <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-center md:text-right">
                    <div className="text-[8px] font-mono text-slate-500 uppercase">Your Trainer ID</div>
                    <div className="text-xs font-mono text-amber-400 font-bold mt-0.5">#{onlinePlayerPhone}</div>
                  </div>
                </div>
              </div>

              {/* Main Dual Grid: Local Versus */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Team Draft & Local Mode */}
                <div className="lg:col-span-12 space-y-6">
                  
                  {/* Local Mode Launcher */}
                  <div className="bg-slate-950 border-2 border-slate-900 rounded-2xl p-5 hover:border-slate-800 transition-all">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <h3 className="text-sm font-bold text-slate-200 font-mono flex items-center gap-2">
                          <span className="text-lg">👥</span> Local Pass & Play Match
                        </h3>
                        <p className="text-[11px] text-slate-400 font-mono mt-1 max-w-md">
                          Draft teams on the same device and take turns choosing secret attacks.
                        </p>
                      </div>
                      <button
                        onClick={enterVersusDraft}
                        id="btn-versus-draft"
                        className="btn sm w-full sm:w-auto py-2 px-4 text-[10px] font-mono tracking-wider text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-xl font-bold uppercase transition-all whitespace-nowrap active:scale-95 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                      >
                        Enter Local Arena
                      </button>
                    </div>
                  </div>

                  {/* Team Draft Selection */}
                  <div className="bg-slate-950 border-2 border-slate-900 rounded-2xl p-5">
                    <div className="border-b border-slate-900 pb-3 mb-4 flex justify-between items-center flex-wrap gap-2">
                      <h3 className="text-xs uppercase font-pressstart tracking-wider text-slate-300">
                        1. Choose 3-Pokémon Squad
                      </h3>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${selectedPokeIdsP1.length === 3 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                        {selectedPokeIdsP1.length === 3 ? 'Ready' : `${selectedPokeIdsP1.length}/3 Chosen`}
                      </span>
                    </div>

                    {/* Region Selector */}
                    <div className="flex gap-1 overflow-x-auto pb-2 mb-3.5 scrollbar-none border-b border-slate-900/50">
                      {REGION_TABS.map(tab => {
                        const isActive = draftP1Region === tab.id;
                        return (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => {
                              gameAudio.playSelect();
                              setDraftP1Region(tab.id);
                            }}
                            className={`px-3 py-1.5 rounded-lg text-[9px] font-mono uppercase tracking-wider border transition-all whitespace-nowrap ${
                              isActive
                                ? 'bg-amber-500/10 border-amber-500/40 text-amber-400 font-bold'
                                : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                            }`}
                          >
                            {tab.id}
                          </button>
                        );
                      })}
                    </div>

                    {/* Pokémon Selection Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[310px] overflow-y-auto pr-1 scrollbar-thin">
                      {POKEMON_ROSTER.filter(p => p.region === draftP1Region).map(p => {
                        const isSelected = selectedPokeIdsP1.includes(p.id);
                        const selectIdx = selectedPokeIdsP1.indexOf(p.id);
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => handlePokeToggleP1(p.id)}
                            className={`text-left p-2 rounded-xl border text-[11px] transition-all relative overflow-hidden flex flex-col justify-between h-[105px] ${
                              isSelected
                                ? 'border-amber-500 bg-amber-500/10'
                                : 'border-slate-900 bg-slate-950/60 hover:border-slate-800'
                            }`}
                          >
                            <div className="flex justify-between items-start w-full gap-1">
                              <span className="font-bold text-slate-200 truncate pr-4">{p.name}</span>
                              {isSelected && (
                                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[9px] font-bold font-mono flex items-center justify-center">
                                  {selectIdx + 1}
                                </span>
                              )}
                            </div>
                            <div className="w-10 h-10 my-1 self-center flex items-center justify-center bg-slate-950/40 rounded-lg overflow-hidden border border-slate-900">
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
                            <div className="flex gap-1 flex-wrap mt-0.5">
                              {p.type.map(t => {
                                const style = getTypePillColor(t);
                                return (
                                  <span key={t} className={`text-[7px] font-mono px-1 py-0.2 rounded border ${style.bg} ${style.text} ${style.border}`}>
                                    {t}
                                  </span>
                                );
                              })}
                            </div>
                            <div className="text-[9px] font-mono text-slate-500 mt-1 font-bold">HP: {p.hp} · Speed: {p.speed}</div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Active Selected Squad display */}
                    <div className="mt-4 bg-slate-950/40 border border-slate-900 p-3 rounded-xl space-y-2">
                      <div className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">
                        Current Team Composition
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {[0, 1, 2].map(idx => {
                          const targetId = selectedPokeIdsP1[idx];
                          const poke = POKEMON_ROSTER.find(x => x.id === targetId);
                          return (
                            <div key={idx} className="flex flex-col items-center justify-center p-2 rounded-lg border border-dashed border-slate-850 bg-slate-950/60 min-h-[70px]">
                              {poke ? (
                                <>
                                  <PokemonSprite name={poke.name} dexNumber={poke.dexNumber} className="w-8 h-8 object-contain" />
                                  <span className="text-[9px] text-slate-300 font-bold truncate max-w-full mt-1">{poke.name}</span>
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

              </div>
            </div>
          )}

          {/* 2.5 ONLINE PLAYERS TAB */}
          {activeTab === 'online_players' && (
            <div className="space-y-6 animate-fade">
              {/* Header Visualizer */}
              <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-2 border-slate-900/80 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
                  <div>
                    <span className="text-[9px] uppercase font-pressstart tracking-widest text-amber-500 font-bold block mb-1">
                      ONLINE MULTIPLAYER HUB
                    </span>
                    <h2 className="pokemon-logo-text text-xl sm:text-2xl font-black tracking-widest leading-none mt-1">
                      ONLINE TRAINERS
                    </h2>
                    <p className="text-xs text-slate-400 font-mono mt-1.5 max-w-md">
                      Instantly duel active online players, find random matches, or join private rooms.
                    </p>
                  </div>
                  <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-center md:text-right">
                    <div className="text-[8px] font-mono text-slate-500 uppercase">Your Trainer ID</div>
                    <div className="text-xs font-mono text-amber-400 font-bold mt-0.5">#{onlinePlayerPhone}</div>
                  </div>
                </div>
              </div>

              {/* Personal Trainer Card & Dynamic Rewards Status */}
              {personalStats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950 border-2 border-slate-900 rounded-2xl p-4">
                  <div className="flex items-center gap-3 bg-slate-900/40 p-3 rounded-xl border border-slate-900">
                    <div className="bg-emerald-500/10 text-emerald-400 p-2 rounded-lg text-lg font-bold">🏆</div>
                    <div>
                      <div className="text-[9px] text-slate-500 font-mono uppercase">Total Wins</div>
                      <div className="text-sm font-bold text-emerald-400 font-mono">{personalStats.wins} Matches</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-900/40 p-3 rounded-xl border border-slate-900">
                    <div className="bg-rose-500/10 text-rose-400 p-2 rounded-lg text-lg font-bold">💀</div>
                    <div>
                      <div className="text-[9px] text-slate-500 font-mono uppercase">Total Losses</div>
                      <div className="text-sm font-bold text-rose-400 font-mono">{personalStats.losses} Matches</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-gradient-to-r from-amber-500/10 to-transparent p-3 rounded-xl border border-gold/10">
                    <div className="bg-gold/10 text-gold p-2 rounded-lg text-lg font-bold">🎁</div>
                    <div>
                      <div className="text-[9px] text-gold-light font-mono uppercase">Today's Coupon Code</div>
                      <div className="text-xs font-black text-white font-mono tracking-wide mt-0.5">{personalStats.couponCode}</div>
                      <div className="text-[9px] text-slate-500 font-mono">({personalStats.playedToday} matches played today)</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Main Dual Grid: Online Lobby & Team Draft */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* LEFT COLUMN: Online Lobby, Matchmaking & Custom Rooms */}
                <div className="lg:col-span-6 space-y-6">
                  
                  {/* ACTIVE TRAINERS LOBBY & DIRECT CHALLENGE */}
                  <div className="bg-slate-950 border-2 border-slate-900 rounded-2xl p-5 space-y-4">
                    <h3 className="text-xs uppercase font-pressstart tracking-wider text-slate-300 border-b border-slate-900 pb-3 flex items-center justify-between">
                      <span>⚡ Online Active Trainers</span>
                      <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-mono">
                        {activeTrainers.length} Live
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono leading-relaxed">
                      Select any active trainer below to send an instant duel request! They'll receive a retro Poke-Phone alert to accept.
                    </p>

                    <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1 scrollbar-thin">
                      {activeTrainers.length === 0 ? (
                        <div className="text-center py-8 bg-slate-900/20 border border-dashed border-slate-900 rounded-xl space-y-2">
                          <p className="text-[11px] text-slate-500 font-mono italic">
                            No other active trainers online right now.
                          </p>
                          <p className="text-[10px] text-slate-600 font-mono max-w-xs mx-auto">
                            💡 Tip: Open another browser window or tab in incognito mode to simulate and test real-time direct duels!
                          </p>
                        </div>
                      ) : (
                        activeTrainers.map(trainer => (
                          <div
                            key={trainer.phone}
                            className="flex justify-between items-center bg-slate-900/40 border border-slate-850/60 rounded-xl p-3 transition-all hover:border-slate-800"
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="text-xl">🔴</span>
                              <div className="flex flex-col text-left">
                                <span className="text-xs font-bold text-slate-200">{trainer.name}</span>
                                <span className="text-[9px] text-slate-500 font-mono">Trainer ID: #{trainer.phone}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => handleSendChallenge(trainer)}
                              className="px-3 py-1.5 text-[9px] font-mono font-bold rounded-lg uppercase tracking-wider transition-all flex items-center gap-1 bg-amber-500 text-slate-950 hover:bg-amber-400 active:scale-95 shadow-[0_2px_10px_rgba(245,158,11,0.2)]"
                            >
                              Duel ⚔️
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* MATCHMAKING SECTION */}
                  <div className="bg-slate-950 border-2 border-slate-900 rounded-2xl p-5 space-y-4">
                    <h3 className="text-xs uppercase font-pressstart tracking-wider text-slate-300 border-b border-slate-900 pb-3">
                      🌍 Matchmaking Lobby
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono leading-relaxed">
                      Find a random online challenger instantly. Matchmaking will find a partner in less than 30 seconds.
                    </p>

                    {matchmakingStatus === 'idle' && (
                      <button
                        onClick={handleStartMatchmaking}
                        className="w-full py-3.5 text-[10px] font-mono tracking-wider font-bold rounded-xl uppercase transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-slate-950 hover:shadow-[0_0_20px_rgba(56,189,248,0.25)] active:scale-95"
                      >
                        ⚡ START MATCHMAKING
                      </button>
                    )}

                    {matchmakingStatus === 'searching' && (
                      <div className="space-y-2 border border-sky-500/20 bg-sky-500/5 rounded-xl p-3 text-center animate-pulse">
                        <div className="flex items-center justify-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
                          <span className="text-[10px] font-mono font-bold text-sky-400">CONNECTING TO LOBBY SERVER...</span>
                        </div>
                        <div className="text-xl font-mono text-white font-bold">{matchmakingTimer}s</div>
                        <p className="text-[10px] text-slate-400 font-mono">Looking for an active trainer...</p>
                        <button
                          onClick={() => handleCancelMatchmaking(false)}
                          className="text-[9px] text-rose-400 hover:text-rose-300 font-mono uppercase underline tracking-wider block mx-auto"
                        >
                          Cancel Search
                        </button>
                      </div>
                    )}

                    {matchmakingStatus === 'timeout' && (
                      <div className="space-y-2 border border-rose-500/20 bg-rose-500/5 rounded-xl p-3 text-center">
                        <div className="text-[10px] font-mono font-bold text-rose-400 uppercase">⌛ MATCHMAKING TIMEOUT</div>
                        <p className="text-[10px] text-slate-400 font-mono">No active challenger was found in the queue. Open another tab or try again!</p>
                        <button
                          onClick={handleStartMatchmaking}
                          className="text-[10px] text-sky-400 hover:text-sky-300 font-mono uppercase underline tracking-wider block mx-auto"
                        >
                          Retry Matchmaking
                        </button>
                      </div>
                    )}

                    {matchmakingStatus === 'matched' && (
                      <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-center rounded-xl p-3 text-[10px] font-mono font-bold uppercase animate-bounce">
                        🎯 Challenger Found! Teleporting to Arena...
                      </div>
                    )}
                  </div>

                  {/* CUSTOM BATTLE ROOMS SECTION */}
                  <div className="bg-slate-950 border-2 border-slate-900 rounded-2xl p-5 space-y-4">
                    <h3 className="text-xs uppercase font-pressstart tracking-wider text-slate-300 border-b border-slate-900 pb-3">
                      🔑 Custom Battle Room
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono leading-relaxed">
                      Create a room to get a code, share it with a friend, and battle instantly.
                    </p>

                    {roomError && (
                      <div className="text-[10px] font-mono font-bold text-rose-400 bg-rose-500/5 border border-rose-500/20 rounded-xl p-2">
                        ⚠️ {roomError}
                      </div>
                    )}

                    {roomStatus === 'idle' && (
                      <div className="grid grid-cols-1 gap-3">
                        <button
                          onClick={handleCreateRoom}
                          className="w-full py-2.5 text-[10px] font-mono tracking-wider font-bold rounded-xl uppercase transition-all bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-900 hover:border-slate-700 active:scale-95"
                        >
                          ➕ Create New Room
                        </button>

                        <div className="relative flex py-1 items-center">
                          <div className="flex-grow border-t border-slate-900" />
                          <span className="flex-shrink mx-3 text-[9px] font-mono text-slate-500 uppercase">OR JOIN ROOM</span>
                          <div className="flex-grow border-t border-slate-900" />
                        </div>

                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={enteredRoomCode}
                            onChange={(e) => setEnteredRoomCode(e.target.value.toUpperCase())}
                            placeholder="CODE"
                            maxLength={6}
                            className="w-1/3 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-center text-xs font-mono font-bold tracking-widest text-amber-400 focus:outline-none focus:border-amber-500"
                          />
                          <button
                            onClick={handleJoinRoom}
                            className="flex-1 py-2 px-4 text-[10px] font-mono tracking-wider font-bold rounded-xl uppercase transition-all bg-amber-500 text-slate-950 hover:bg-amber-400 active:scale-95"
                          >
                            Join Match
                          </button>
                        </div>
                      </div>
                    )}

                    {roomStatus === 'hosting' && (
                      <div className="space-y-3 border border-amber-500/20 bg-amber-500/5 rounded-xl p-3.5 text-center">
                        <div className="text-[10px] font-mono text-slate-400">ROOM CREATED SUCCESSFULLY!</div>
                        <div className="text-2xl font-mono text-amber-400 font-black tracking-widest bg-slate-950 border border-slate-800 py-1.5 rounded-lg">
                          {roomCode}
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono">
                          Share this code with your friend. The battle starts automatically once they join!
                        </p>
                        <button
                          onClick={() => {
                            setRoomStatus('idle');
                            setRoomCode('');
                          }}
                          className="text-[9px] text-rose-400 hover:text-rose-300 font-mono uppercase underline tracking-wider block mx-auto"
                        >
                          Close Room
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* RIGHT COLUMN: Choose 3-Pokémon Squad for Online */}
                <div className="lg:col-span-6 space-y-6">
                  <div className="bg-slate-950 border-2 border-slate-900 rounded-2xl p-5">
                    <div className="border-b border-slate-900 pb-3 mb-4 flex justify-between items-center flex-wrap gap-2">
                      <h3 className="text-xs uppercase font-pressstart tracking-wider text-slate-300">
                        Draft 3-Pokémon Squad
                      </h3>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${selectedPokeIdsP1.length === 3 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                        {selectedPokeIdsP1.length === 3 ? 'Ready' : `${selectedPokeIdsP1.length}/3 Chosen`}
                      </span>
                    </div>

                    {/* Region Selector */}
                    <div className="flex gap-1 overflow-x-auto pb-2 mb-3.5 scrollbar-none border-b border-slate-900/50">
                      {REGION_TABS.map(tab => {
                        const isActive = draftP1Region === tab.id;
                        return (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => {
                              gameAudio.playSelect();
                              setDraftP1Region(tab.id);
                            }}
                            className={`px-3 py-1.5 rounded-lg text-[9px] font-mono uppercase tracking-wider border transition-all whitespace-nowrap ${
                              isActive
                                ? 'bg-amber-500/10 border-amber-500/40 text-amber-400 font-bold'
                                : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                            }`}
                          >
                            {tab.id}
                          </button>
                        );
                      })}
                    </div>

                    {/* Pokémon Selection Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[310px] overflow-y-auto pr-1 scrollbar-thin">
                      {POKEMON_ROSTER.filter(p => p.region === draftP1Region).map(p => {
                        const isSelected = selectedPokeIdsP1.includes(p.id);
                        const selectIdx = selectedPokeIdsP1.indexOf(p.id);
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => handlePokeToggleP1(p.id)}
                            className={`text-left p-2 rounded-xl border text-[11px] transition-all relative overflow-hidden flex flex-col justify-between h-[105px] ${
                              isSelected
                                ? 'border-amber-500 bg-amber-500/10'
                                : 'border-slate-900 bg-slate-950/60 hover:border-slate-800'
                            }`}
                          >
                            <div className="flex justify-between items-start w-full gap-1">
                              <span className="font-bold text-slate-200 truncate pr-4">{p.name}</span>
                              {isSelected && (
                                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[9px] font-bold font-mono flex items-center justify-center">
                                  {selectIdx + 1}
                                </span>
                              )}
                            </div>
                            <div className="w-10 h-10 my-1 self-center flex items-center justify-center bg-slate-950/40 rounded-lg overflow-hidden border border-slate-900">
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
                            <div className="flex gap-1 flex-wrap mt-0.5">
                              {p.type.map(t => {
                                const style = getTypePillColor(t);
                                return (
                                  <span key={t} className={`text-[7px] font-mono px-1 py-0.2 rounded border ${style.bg} ${style.text} ${style.border}`}>
                                    {t}
                                  </span>
                                );
                              })}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Active Selected Squad display */}
                    <div className="mt-4 bg-slate-950/40 border border-slate-900 p-3 rounded-xl space-y-2">
                      <div className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">
                        Current Team Composition
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {[0, 1, 2].map(idx => {
                          const targetId = selectedPokeIdsP1[idx];
                          const poke = POKEMON_ROSTER.find(x => x.id === targetId);
                          return (
                            <div key={idx} className="flex flex-col items-center justify-center p-2 rounded-lg border border-dashed border-slate-850 bg-slate-950/60 min-h-[70px]">
                              {poke ? (
                                <>
                                  <PokemonSprite name={poke.name} dexNumber={poke.dexNumber} className="w-8 h-8 object-contain" />
                                  <span className="text-[9px] text-slate-300 font-bold truncate max-w-full mt-1">{poke.name}</span>
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

              </div>
            </div>
          )}

          {/* 3. DEX TAB */}
          {activeTab === 'pokedex' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Dex list */}
              <div className="bg-slate-950 border-2 border-slate-900 rounded-2xl p-5">
                <h3 className="pokemon-logo-text-sm text-sm border-b border-slate-900 pb-3 mb-4">
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
                    <h4 className="pokemon-logo-text-sm text-sm">{selectedPokedexPoke.name}</h4>
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
                  <h4 className="pokemon-logo-text-sm text-xs mb-3 pb-2 border-b border-slate-900">
                    Type Advantage Calculator
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
                <h3 className="pokemon-logo-text-sm text-sm border-b border-slate-900 pb-3 mb-2">
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
            <h3 className="pokemon-logo-text-sm text-base">Draft Chamber (2-Player Local)</h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">Choose exactly 3 Pokémon per player to initialize combat.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Player 1 Draft Card */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <h4 className="pokemon-logo-text-sm text-xs mb-2 border-b border-slate-800 pb-2">
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
                        <div className="text-[9px] font-mono text-slate-500 mt-1 font-bold">HP: {p.hp} · Speed: {p.speed}</div>
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
                <h4 className="pokemon-logo-text-sm text-xs mb-2 border-b border-slate-800 pb-2">
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
                        <div className="text-[9px] font-mono text-slate-500 mt-1 font-bold">HP: {p.hp} · Speed: {p.speed}</div>
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
        battleMode === 'online' && false ? (
          <div className="relative w-full">
            <BattleArena
              battleMode="online"
              playerTeam={playerTeam}
              opponentTeam={opponentTeam}
              activePlayerIdx={activePlayerIdx}
              activeOpponentIdx={activeOpponentIdx}
              onPlayerSwitch={handleOnlinePlayerSwitch}
              onOpponentSwitch={() => {}}
              onMoveResolved={() => {}}
              battleId={onlineBattleId}
              onlinePlayerPhone={onlinePlayerPhone}
              isOnlineTurnWaiting={isOnlineTurnWaiting}
              setOnlineTurnWaiting={setIsOnlineTurnWaiting}
              onBattleFinished={(winner, won) => {
                setGameState('gameOver');
                setWinnerName(winner);
                gameAudio.playHeal();
              }}
            />

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
        ) : (
          <div className="animate-fade grid grid-cols-1 landscape:grid-cols-10 md:grid-cols-10 gap-2 sm:gap-4 relative">
          
          {/* Portrait Rotation Overlay helper */}
          {isPortrait && (
            <div className="fixed inset-0 bg-slate-950/95 z-50 flex flex-col items-center justify-center p-6 text-center animate-fade pointer-events-auto">
              <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(245,158,11,0.25)]">
                <motion.div
                  animate={{ rotate: [0, 90, 90, 0] }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                >
                  <RotateCw className="w-10 h-10 text-amber-400" />
                </motion.div>
              </div>
              <h3 className="font-cinzel text-xl font-bold text-white mb-2">Rotate Your Device</h3>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed mb-6 font-mono">
                The battle arena is optimized for horizontal view. Please turn your phone to landscape mode.
              </p>
              <button
                onClick={() => {
                  gameAudio.playSelect();
                  lockLandscape();
                }}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 rounded-xl font-mono text-xs font-bold uppercase tracking-wider shadow-lg transition-all"
              >
                Request Landscape Lock
              </button>
            </div>
          )}

          {/* Main 3D isometric styled screen area */}
          <div className="relative h-[180px] xs:h-[240px] sm:h-[320px] md:h-[380px] lg:h-[460px] rounded-3xl overflow-hidden bg-slate-950 border-2 border-slate-900 shadow-[0_10px_35px_rgba(0,0,0,0.8)] col-span-1 landscape:col-span-7 md:col-span-7 row-auto landscape:row-start-1 md:row-start-1">
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
            <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20 pointer-events-none select-none text-left drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="font-pressstart text-[8px] sm:text-[10px] text-[#ffcc00] drop-shadow-[0_1px_0_rgba(59,76,202,0.85)] tracking-tight leading-none">
                  {opponentTeam[activeOpponentIdx].name}
                </span>
                <span className="text-[9px] text-slate-300 font-mono font-medium">Lv.50</span>
                {opponentTeam[activeOpponentIdx].status !== 'None' && (
                  <span className="text-[9px] text-amber-400 font-mono font-bold bg-amber-500/20 px-1 rounded">
                    {opponentTeam[activeOpponentIdx].status}
                  </span>
                )}
              </div>
              {/* HP percentage bar and percentage label on the side */}
              <div className="flex items-center gap-2 w-[120px] sm:w-[150px]">
                <div className="flex-1 bg-slate-900/60 h-1.5 rounded-full overflow-hidden border border-black/40">
                  <div
                    className={`h-full transition-all duration-300 ${hpProgressColor(opponentTeam[activeOpponentIdx].hp, opponentTeam[activeOpponentIdx].maxHp)}`}
                    style={{ width: `${(opponentTeam[activeOpponentIdx].hp / opponentTeam[activeOpponentIdx].maxHp) * 100}%` }}
                  />
                </div>
                <span className="text-[9px] font-mono text-white font-semibold">
                  {Math.round((opponentTeam[activeOpponentIdx].hp / opponentTeam[activeOpponentIdx].maxHp) * 100)}%
                </span>
              </div>
              <div className="text-[9px] font-mono text-slate-300 mt-1 text-left font-bold tracking-tight">
                HP: {opponentTeam[activeOpponentIdx].hp} / {opponentTeam[activeOpponentIdx].maxHp}
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
            <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 z-20 pointer-events-none select-none text-right flex flex-col items-end drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
              <div className="flex items-center gap-1.5 mb-0.5">
                {playerTeam[activePlayerIdx].status !== 'None' && (
                  <span className="text-[9px] text-amber-400 font-mono font-bold bg-amber-500/20 px-1 rounded">
                    {playerTeam[activePlayerIdx].status}
                  </span>
                )}
                <span className="font-pressstart text-[8px] sm:text-[10px] text-[#ffcc00] drop-shadow-[0_1px_0_rgba(59,76,202,0.85)] tracking-tight leading-none">
                  {playerTeam[activePlayerIdx].name}
                </span>
                <span className="text-[9px] text-slate-300 font-mono font-medium">Lv.50</span>
              </div>
              {/* HP percentage bar and percentage label on the side */}
              <div className="flex items-center gap-2 w-[120px] sm:w-[150px]">
                <div className="flex-1 bg-slate-900/60 h-1.5 rounded-full overflow-hidden border border-black/40">
                  <div
                    className={`h-full transition-all duration-300 ${hpProgressColor(playerTeam[activePlayerIdx].hp, playerTeam[activePlayerIdx].maxHp)}`}
                    style={{ width: `${(playerTeam[activePlayerIdx].hp / playerTeam[activePlayerIdx].maxHp) * 100}%` }}
                  />
                </div>
                <span className="text-[9px] font-mono text-white font-semibold">
                  {Math.round((playerTeam[activePlayerIdx].hp / playerTeam[activePlayerIdx].maxHp) * 100)}%
                </span>
              </div>
              <div className="text-[9px] font-mono text-slate-300 mt-1 text-right font-bold tracking-tight">
                HP: {playerTeam[activePlayerIdx].hp} / {playerTeam[activePlayerIdx].maxHp}
              </div>
            </div>

            {/* Real-time Field Position HUD indicators integrated in the moveset panel below */}

          </div>

          {/* 2. THE MOVESETS PART */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-1.5 xs:p-3 sm:p-4 flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.4)] col-span-1 landscape:col-span-3 md:col-span-3 row-auto landscape:row-start-1 md:row-start-1">
            <div>
              <label className="block text-[7px] xs:text-[8px] font-pressstart text-[#ffcc00] drop-shadow-[0_1px_0_rgba(59,76,202,0.8)] uppercase tracking-wider mb-2.5 pb-1 border-b border-slate-800">
                {isBattleAnimating
                  ? '⏳ BATTLE RESOLVING...'
                  : battleMode === 'campaign'
                  ? 'CHOOSE ATTACK'
                  : `MOVE: ${pvpTurnState === 'p1_select' ? 'PLAYER 1' : 'PLAYER 2'}`}
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
                    <div className="bg-slate-950/90 border border-slate-800/80 rounded-xl p-1.5 xs:p-3 mb-1.5 xs:mb-3 animate-fade-in flex flex-col gap-1.5 xs:gap-3">
                      {/* Aim Direction Selection */}
                      <div>
                        <div className="flex flex-col xs:flex-row xs:justify-between xs:items-center mb-1">
                          <span className="text-[8px] xs:text-[10px] font-mono font-bold text-slate-400 tracking-wider uppercase">
                            🎯 TARGET DIRECTION
                          </span>
                          <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-full uppercase">
                            {((battleMode === 'campaign' || battleMode === 'online' || pvpTurnState === 'p1_select') ? playerAimLane : opponentAimLane) === -1 ? 'LEFT TRACK' :
                             ((battleMode === 'campaign' || battleMode === 'online' || pvpTurnState === 'p1_select') ? playerAimLane : opponentAimLane) === 1 ? 'RIGHT TRACK' : 'CENTER TRACK'}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {[-1, 0, 1].map((laneVal) => {
                            const isCurrentP1 = battleMode === 'campaign' || battleMode === 'online' || pvpTurnState === 'p1_select';
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
                      <div className="border-t border-slate-900 pt-1.5 xs:pt-3">
                        <div className="flex flex-col xs:flex-row xs:justify-between xs:items-center mb-1">
                          <div className="flex flex-col">
                            <span className="text-[8px] xs:text-[10px] font-mono font-bold text-amber-500 tracking-wider uppercase">
                              🛡️ DODGE POSITION
                            </span>
                            <span className="hidden xs:inline text-[8px] text-slate-500 font-mono">
                              {(battleMode === 'campaign' || battleMode === 'online' || pvpTurnState === 'p1_select') ? 'Control with A/D or ARROWS' : 'Control P2 with ARROWS'}
                            </span>
                          </div>
                          <span className="text-[9px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded-full uppercase">
                            {((battleMode === 'campaign' || battleMode === 'online' || pvpTurnState === 'p1_select') ? playerLane : opponentLane) === -1 ? 'LEFT' :
                             ((battleMode === 'campaign' || battleMode === 'online' || pvpTurnState === 'p1_select') ? playerLane : opponentLane) === 1 ? 'RIGHT' : 'MID'}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {/* Move Left Button */}
                          <button
                            type="button"
                            onClick={() => {
                              const isCurrentP1 = battleMode === 'campaign' || battleMode === 'online' || pvpTurnState === 'p1_select';
                              gameAudio.playSelect();
                              if (isCurrentP1) {
                                movePlayerLeft();
                              } else {
                                moveOpponentLeft();
                              }
                            }}
                            className={`py-1.5 px-1 text-[11px] font-mono font-bold rounded-xl border flex flex-col items-center justify-center gap-1 transition-all duration-150 ${
                              (battleMode === 'campaign' || battleMode === 'online' || pvpTurnState === 'p1_select')
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
                            <span className="text-[7px] font-mono font-semibold">LEFT</span>
                          </button>

                          {/* Quick Snap to Center Button */}
                          <button
                            type="button"
                            onClick={() => {
                              const isCurrentP1 = battleMode === 'campaign' || battleMode === 'online' || pvpTurnState === 'p1_select';
                              gameAudio.playSelect();
                              if (isCurrentP1) {
                                setPlayerLane(0);
                              } else {
                                setOpponentLane(0);
                              }
                            }}
                            className={`py-1.5 px-1 text-[11px] font-mono font-bold rounded-xl border flex flex-col items-center justify-center gap-1 transition-all duration-150 ${
                              ((battleMode === 'campaign' || battleMode === 'online' || pvpTurnState === 'p1_select') ? playerLane === 0 : opponentLane === 0)
                                ? 'border-amber-500/40 text-amber-400 bg-amber-500/5'
                                : 'border-slate-900 bg-slate-950/40 text-slate-500 hover:border-slate-800 hover:text-slate-300 active:scale-95'
                            }`}
                            title="Center Position"
                          >
                            <span className="text-xs">●</span>
                            <span className="text-[7px] font-mono font-semibold">MID</span>
                          </button>

                          {/* Move Right Button */}
                          <button
                            type="button"
                            onClick={() => {
                              const isCurrentP1 = battleMode === 'campaign' || battleMode === 'online' || pvpTurnState === 'p1_select';
                              gameAudio.playSelect();
                              if (isCurrentP1) {
                                movePlayerRight();
                              } else {
                                moveOpponentRight();
                              }
                            }}
                            className={`py-1.5 px-1 text-[11px] font-mono font-bold rounded-xl border flex flex-col items-center justify-center gap-1 transition-all duration-150 ${
                              (battleMode === 'campaign' || battleMode === 'online' || pvpTurnState === 'p1_select')
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
                            <span className="text-[7px] font-mono font-semibold">RIGHT</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    {/* If player active is fainted, require switch */}
                    {((battleMode === 'campaign' || battleMode === 'online') && playerTeam[activePlayerIdx].hp <= 0) ||
                     (battleMode === 'versus' && pvpTurnState === 'p1_select' && playerTeam[activePlayerIdx].hp <= 0) ||
                     (battleMode === 'versus' && pvpTurnState === 'p2_select' && opponentTeam[activeOpponentIdx].hp <= 0) ? (
                      <p className="col-span-2 text-center text-xs text-rose-400 italic py-2">
                        Active Pokémon fainted. Switch out immediately!
                      </p>
                    ) : (
                      battleMode === 'online' && isOnlineTurnWaiting ? (
                        <div className="col-span-2 text-center py-6 bg-slate-950/40 border border-dashed border-slate-850 rounded-xl animate-pulse">
                          <p className="text-xs text-amber-400 font-mono mb-1">
                            📡 WAITING FOR OPPONENT...
                          </p>
                          <p className="text-[10px] text-slate-500 font-mono">
                            Opponent is selecting their action and dodge position.
                          </p>
                        </div>
                      ) : (
                        // Render moves of active pokemon
                        (battleMode === 'campaign' || battleMode === 'online' || pvpTurnState === 'p1_select'
                          ? playerTeam[activePlayerIdx]
                          : opponentTeam[activeOpponentIdx]
                        ).moves.map(m => {
                          const style = getMoveStyle(m.type, isBattleAnimating);
                          return (
                            <button
                              key={m.name}
                              disabled={isBattleAnimating}
                              onClick={() => {
                                if (battleMode === 'campaign') {
                                  resolveCampaignTurn(m);
                                } else if (battleMode === 'online') {
                                  handleOnlineSubmitMove(m);
                                } else {
                                  submitVersusMove(m);
                                }
                              }}
                              className={`flex flex-col items-start p-1.5 xs:p-2.5 rounded-xl border transition-all text-left ${style.btnClass}`}
                            >
                              <span className={`text-[10px] xs:text-xs font-bold leading-tight ${style.nameClass}`}>
                                {m.name}
                              </span>
                              <div className="flex justify-between w-full mt-1 xs:mt-1.5 text-[8px] xs:text-[9px] font-mono text-slate-500 leading-none">
                                <span>Pwr: {m.power}</span>
                                <span>Acc: {m.accuracy}%</span>
                              </div>
                            </button>
                          );
                        })
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 3. THE POKÉMON PART */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-1.5 xs:p-3 sm:p-4 shadow-[0_4px_20px_rgba(0,0,0,0.4)] col-span-1 landscape:col-span-7 md:col-span-7 row-auto landscape:row-start-2 md:row-start-2">
            <label className="block text-[8px] xs:text-[10px] font-mono text-amber-500 uppercase tracking-widest mb-1.5 xs:mb-3 pb-1 border-b border-slate-800">
              SWITCH ACTIVE SQUAD
            </label>

            <div className="flex flex-col gap-2">
              {/* Switch Player 1 */}
              <div className="flex flex-col gap-1.5">
                <div className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">
                  {(battleMode === 'campaign' || battleMode === 'online') ? 'My Party Squad' : 'Player 1 Squad (Drafted)'}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {playerTeam.map((p, idx) => {
                    const isActive = idx === activePlayerIdx;
                    const isFainted = p.hp <= 0;
                    return (
                      <button
                        key={p.id}
                        disabled={isActive || isFainted || isBattleAnimating || (battleMode === 'versus' && pvpTurnState === 'p2_select')}
                        onClick={() => {
                          if (battleMode === 'online') {
                            handleOnlinePlayerSwitch(idx);
                          } else {
                            handlePlayerSwitch(idx);
                          }
                        }}
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
            className="bg-slate-950 border-2 border-slate-900 rounded-2xl p-2 h-28 overflow-y-auto font-vt323 text-xs xs:text-sm sm:text-base md:text-[17px] tracking-wide flex flex-col gap-1 shadow-inner scroll-smooth col-span-1 landscape:col-span-3 md:col-span-3 row-auto landscape:row-start-2 md:row-start-2 border-l-4 border-l-[#3b4cca]"
          >
            {battleLogs.map((log, i) => (
              <div
                key={i}
                className={
                  log.startsWith('---') ? 'text-[#ffcc00] font-bold drop-shadow-[0_1px_0_rgba(0,0,0,0.8)]' :
                  log.includes('fainted') || log.includes('lost') ? 'text-rose-400 font-bold' :
                  log.includes('won') || log.includes('victory') ? 'text-emerald-400 font-bold' : 'text-slate-200'
                }
              >
                {log}
              </div>
            ))}
          </div>

          {/* Quick exit match action */}
          <div className="flex justify-center mt-2 col-span-1 landscape:col-span-7 md:col-span-7 row-auto landscape:row-start-3 md:row-start-3">
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
        )
      )}

      {/* INCOMING CHALLENGE POPUP/NOTIFICATION */}
      {receivedInvite && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-950 border-2 border-rose-500 rounded-3xl p-5 max-w-sm shadow-[0_0_35px_rgba(244,63,94,0.3)] animate-bounce border-t-8 border-t-rose-500">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-rose-500/15 rounded-2xl flex items-center justify-center border border-rose-500/30 animate-pulse text-2xl">
              📱
            </div>
            <div className="flex-1">
              <h4 className="font-pressstart text-[9px] text-rose-400 tracking-wider">POKÉ-PHONE ALERT</h4>
              <div className="text-[11px] font-mono text-slate-200 mt-2.5 leading-relaxed bg-slate-900/60 p-2.5 rounded-xl border border-slate-850">
                You are engaged in a duel with <span className="font-bold text-amber-400 font-sans">{receivedInvite.fromName}</span>! Click ready, click on the ready button, and then the duel will start.
              </div>
              <p className="text-[10px] text-slate-400 font-mono mt-1.5 italic">
                Configure your 3-Pokémon squad in the Online Players tab before hitting ready.
              </p>
              <div className="flex gap-2.5 mt-4 justify-end">
                <button
                  onClick={handleDeclineInvite}
                  className="px-3.5 py-2 rounded-xl border border-slate-800 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 text-[10px] font-mono uppercase font-bold transition-all"
                >
                  Decline
                </button>
                <button
                  onClick={handleAcceptInvite}
                  className="px-4 py-2 rounded-xl text-[10px] font-mono uppercase font-bold tracking-wider transition-all flex items-center gap-1.5 bg-rose-500 text-white hover:bg-rose-400 hover:shadow-[0_0_15px_rgba(244,63,94,0.4)] active:scale-95"
                >
                  Click Ready ⚔️
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* OUTGOING CHALLENGE WAITING DIALOG MODAL */}
      {isChallengeModalOpen && sentInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-950 border-2 border-sky-500 rounded-2xl p-6 max-w-md w-full shadow-[0_0_30px_rgba(56,189,248,0.25)] text-center space-y-4">
            <div className="w-16 h-16 bg-sky-500/10 rounded-full flex items-center justify-center border border-sky-500/20 mx-auto animate-pulse">
              <span className="text-3xl animate-bounce">📡</span>
            </div>
            <h3 className="text-sm uppercase font-pressstart tracking-wider text-sky-400 animate-pulse">
              Challenging Trainer...
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed font-mono">
              Waiting for <span className="text-amber-400 font-bold font-sans">{sentInvite.toName}</span> to accept your online battle challenge.
            </p>
            <div className="text-[10px] text-slate-500 font-mono">
              Make sure they are on the Online Players tab to accept!
            </div>
            <button
              onClick={handleCancelSentChallenge}
              className="w-full py-2.5 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-[11px] font-mono uppercase font-bold transition-colors"
            >
              Cancel Challenge
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
