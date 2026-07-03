import React, { useState, useEffect } from 'react';

interface SpriteProps {
  isBack?: boolean;
  isAttacking?: boolean;
  isHit?: boolean;
  status?: string;
  className?: string;
}

const POKEMON_META: Record<string, { id: number; cleanName: string; scaleFront: number; scaleBack: number }> = {
  'Pikachu': { id: 25, cleanName: 'pikachu', scaleFront: 0.55, scaleBack: 0.60 },
  'Eevee': { id: 133, cleanName: 'eevee', scaleFront: 0.50, scaleBack: 0.55 },
  'Sylveon': { id: 700, cleanName: 'sylveon', scaleFront: 0.85, scaleBack: 0.90 },
  'Umbreon': { id: 197, cleanName: 'umbreon', scaleFront: 0.80, scaleBack: 0.85 },
  'Greninja': { id: 658, cleanName: 'greninja', scaleFront: 0.95, scaleBack: 1.05 },
  'Lucario': { id: 448, cleanName: 'lucario', scaleFront: 0.95, scaleBack: 1.00 },
  'Gengar': { id: 94, cleanName: 'gengar', scaleFront: 1.05, scaleBack: 1.15 },
  'Aegislash': { id: 681, cleanName: 'aegislash', scaleFront: 1.00, scaleBack: 1.10 },
  'Ceruledge': { id: 937, cleanName: 'ceruledge', scaleFront: 1.05, scaleBack: 1.15 },
  'Cinderace': { id: 815, cleanName: 'cinderace', scaleFront: 0.95, scaleBack: 1.05 },
  'Decidueye': { id: 724, cleanName: 'decidueye', scaleFront: 1.10, scaleBack: 1.20 },
  'Alakazam': { id: 65, cleanName: 'alakazam', scaleFront: 1.05, scaleBack: 1.15 },
  'Machamp': { id: 68, cleanName: 'machamp', scaleFront: 1.15, scaleBack: 1.25 },
  'Scizor': { id: 212, cleanName: 'scizor', scaleFront: 1.05, scaleBack: 1.15 },
  'Gardevoir': { id: 282, cleanName: 'gardevoir', scaleFront: 0.95, scaleBack: 1.05 },
  'Togekiss': { id: 468, cleanName: 'togekiss', scaleFront: 1.10, scaleBack: 1.20 },
  'Sceptile': { id: 254, cleanName: 'sceptile', scaleFront: 1.10, scaleBack: 1.20 },
  'Arcanine': { id: 59, cleanName: 'arcanine', scaleFront: 1.25, scaleBack: 1.35 },
  'Blastoise': { id: 9, cleanName: 'blastoise', scaleFront: 1.20, scaleBack: 1.30 },
  'Venusaur': { id: 3, cleanName: 'venusaur', scaleFront: 1.25, scaleBack: 1.35 },
  'Charizard': { id: 6, cleanName: 'charizard', scaleFront: 1.30, scaleBack: 1.40 },
  'Tyranitar': { id: 248, cleanName: 'tyranitar', scaleFront: 1.35, scaleBack: 1.45 },
  'Garchomp': { id: 445, cleanName: 'garchomp', scaleFront: 1.35, scaleBack: 1.45 },
  'Dragonite': { id: 149, cleanName: 'dragonite', scaleFront: 1.35, scaleBack: 1.45 },
  'Mewtwo': { id: 150, cleanName: 'mewtwo', scaleFront: 1.40, scaleBack: 1.50 },
  'Gyarados': { id: 130, cleanName: 'gyarados', scaleFront: 1.55, scaleBack: 1.65 },
  'Lugia': { id: 249, cleanName: 'lugia', scaleFront: 1.60, scaleBack: 1.70 },
  'Kyogre': { id: 382, cleanName: 'kyogre', scaleFront: 1.65, scaleBack: 1.75 },
  'Groudon': { id: 383, cleanName: 'groudon', scaleFront: 1.70, scaleBack: 1.80 },
  'Rayquaza': { id: 384, cleanName: 'rayquaza', scaleFront: 1.80, scaleBack: 1.90 }
};

export const PikachuSprite: React.FC<SpriteProps> = ({ isBack, isAttacking, isHit, status, className }) => {
  return (
    <div className={`relative ${isAttacking ? 'animate-bounce' : ''} ${isHit ? 'animate-ping duration-150' : ''} ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_8px_rgba(253,224,71,0.6)]">
        <ellipse cx="50" cy="85" rx="25" ry="8" fill="rgba(0,0,0,0.3)" />
        <polygon points="20,70 10,40 25,45 15,20 35,30 45,55" fill="#EAB308" stroke="#854D0E" strokeWidth="2" />
        {isBack ? (
          <g>
            <ellipse cx="50" cy="55" rx="26" ry="28" fill="#FACC15" stroke="#854D0E" strokeWidth="2.5" />
            <path d="M40,40 Q50,42 60,40" stroke="#854D0E" strokeWidth="2" fill="none" />
            <path d="M30,55 Q50,53 70,55" stroke="#78350F" strokeWidth="4" fill="none" />
            <path d="M32,65 Q50,63 68,65" stroke="#78350F" strokeWidth="4" fill="none" />
            <polygon points="35,35 15,10 25,32" fill="#FACC15" stroke="#854D0E" strokeWidth="2" />
            <polygon points="15,10 20,5 25,18" fill="#1C1917" />
            <polygon points="65,35 85,10 75,32" fill="#FACC15" stroke="#854D0E" strokeWidth="2" />
            <polygon points="85,10 80,5 75,18" fill="#1C1917" />
          </g>
        ) : (
          <g>
            <polygon points="35,35 15,10 25,32" fill="#FACC15" stroke="#854D0E" strokeWidth="2" />
            <polygon points="15,10 20,5 25,18" fill="#1C1917" />
            <polygon points="65,35 85,10 75,32" fill="#FACC15" stroke="#854D0E" strokeWidth="2" />
            <polygon points="85,10 80,5 75,18" fill="#1C1917" />
            <ellipse cx="50" cy="55" rx="26" ry="28" fill="#FACC15" stroke="#854D0E" strokeWidth="2.5" />
            <circle cx="34" cy="58" r="7" fill="#EF4444" />
            <circle cx="66" cy="58" r="7" fill="#EF4444" />
            <circle cx="40" cy="46" r="3.5" fill="#1C1917" />
            <circle cx="39" cy="45" r="1" fill="#FFF" />
            <circle cx="60" cy="46" r="3.5" fill="#1C1917" />
            <circle cx="59" cy="45" r="1" fill="#FFF" />
            <polygon points="50,51 48,49 52,49" fill="#1C1917" />
            <path d="M46,55 Q50,58 54,55" stroke="#1C1917" strokeWidth="2.5" fill="none" />
          </g>
        )}
      </svg>
    </div>
  );
};

export const CharizardSprite: React.FC<SpriteProps> = ({ isBack, isAttacking, isHit, status, className }) => {
  return (
    <div className={`relative ${isAttacking ? 'animate-bounce' : ''} ${isHit ? 'animate-ping duration-150' : ''} ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]">
        <ellipse cx="50" cy="90" rx="30" ry="10" fill="rgba(0,0,0,0.3)" />
        {!isBack && (
          <g>
            <path d="M30,40 C10,20 15,5 5,15 C-5,25 15,55 35,50" fill="#4B5563" stroke="#B45309" strokeWidth="2" />
            <path d="M70,40 C90,20 85,5 95,15 C105,25 85,55 65,50" fill="#4B5563" stroke="#B45309" strokeWidth="2" />
          </g>
        )}
        <path d="M70,70 Q85,80 90,65" stroke="#F97316" strokeWidth="6" fill="none" strokeLinecap="round" />
        <circle cx="92" cy="60" r="6" fill="#EF4444" className="animate-ping" />
        <circle cx="92" cy="60" r="4" fill="#F59E0B" className="animate-pulse" />
        {isBack ? (
          <g>
            <path d="M30,75 C25,50 35,35 50,35 C65,35 75,50 70,75 C65,85 35,85 30,75 Z" fill="#F97316" stroke="#9A3412" strokeWidth="2.5" />
            <path d="M42,40 C42,20 48,15 50,15 C52,15 58,20 58,40 Z" fill="#F97316" stroke="#9A3412" strokeWidth="2" />
            <ellipse cx="50" cy="18" rx="8" ry="10" fill="#F97316" stroke="#9A3412" strokeWidth="2" />
            <polygon points="45,12 38,2 44,10" fill="#F97316" stroke="#9A3412" strokeWidth="1.5" />
            <polygon points="55,12 62,2 56,10" fill="#F97316" stroke="#9A3412" strokeWidth="1.5" />
          </g>
        ) : (
          <g>
            <path d="M30,75 C25,50 35,35 50,35 C65,35 75,50 70,75 C65,85 35,85 30,75 Z" fill="#F97316" stroke="#9A3412" strokeWidth="2.5" />
            <path d="M38,75 C35,60 38,50 50,50 C62,50 65,60 62,75 Z" fill="#FEF08A" />
            <path d="M42,40 C42,25 45,20 50,20 C55,20 58,25 58,40 Z" fill="#F97316" stroke="#9A3412" strokeWidth="2" />
            <ellipse cx="50" cy="22" rx="9" ry="11" fill="#F97316" stroke="#9A3412" strokeWidth="2" />
            <ellipse cx="45" cy="20" rx="2" ry="3" fill="#38BDF8" />
            <circle cx="45" cy="20" r="0.8" fill="#1E293B" />
            <ellipse cx="55" cy="20" rx="2" ry="3" fill="#38BDF8" />
            <circle cx="55" cy="20" r="0.8" fill="#1E293B" />
            <path d="M46,26 Q50,29 54,26" stroke="#9A3412" strokeWidth="2" fill="none" />
            <polygon points="45,15 38,5 44,13" fill="#F97316" stroke="#9A3412" strokeWidth="1.5" />
            <polygon points="55,15 62,5 56,13" fill="#F97316" stroke="#9A3412" strokeWidth="1.5" />
          </g>
        )}
      </svg>
    </div>
  );
};

export const BlastoiseSprite: React.FC<SpriteProps> = ({ isBack, isAttacking, isHit, status, className }) => {
  return (
    <div className={`relative ${isAttacking ? 'animate-bounce' : ''} ${isHit ? 'animate-ping duration-150' : ''} ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]">
        <ellipse cx="50" cy="90" rx="32" ry="10" fill="rgba(0,0,0,0.4)" />
        <g className={isAttacking ? 'animate-pulse' : ''}>
          <rect x="22" y="15" width="10" height="24" transform="rotate(-15 22 15)" fill="#94A3B8" stroke="#475569" strokeWidth="2" rx="2" />
          <rect x="68" y="15" width="10" height="24" transform="rotate(15 68 15)" fill="#94A3B8" stroke="#475569" strokeWidth="2" rx="2" />
        </g>
        <ellipse cx="50" cy="58" rx="32" ry="26" fill="#78350F" stroke="#451A03" strokeWidth="3" />
        <ellipse cx="50" cy="58" rx="28" ry="22" fill="#F59E0B" />
        {isBack ? (
          <g>
            <path d="M50,84 C45,95 55,95 50,84" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="2" />
            <path d="M30,58 Q50,48 70,58" stroke="#451A03" strokeWidth="2" fill="none" />
            <path d="M30,68 Q50,58 70,68" stroke="#451A03" strokeWidth="2" fill="none" />
            <ellipse cx="50" cy="35" rx="14" ry="12" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="2.5" />
            <polygon points="40,28 35,20 42,26" fill="#3B82F6" stroke="#1D4ED8" />
            <polygon points="60,28 65,20 58,26" fill="#3B82F6" stroke="#1D4ED8" />
          </g>
        ) : (
          <g>
            <ellipse cx="50" cy="60" rx="22" ry="16" fill="#FEF08A" stroke="#B45309" strokeWidth="1.5" />
            <ellipse cx="50" cy="35" rx="16" ry="14" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="2.5" />
            <polygon points="38,28 32,18 41,25" fill="#3B82F6" stroke="#1D4ED8" />
            <polygon points="62,28 68,18 59,25" fill="#3B82F6" stroke="#1D4ED8" />
            <ellipse cx="44" cy="34" rx="2.5" ry="1.5" fill="#FFF" stroke="#1D4ED8" />
            <circle cx="44" cy="34" r="1" fill="#1C1917" />
            <ellipse cx="56" cy="34" rx="2.5" ry="1.5" fill="#FFF" stroke="#1D4ED8" />
            <circle cx="56" cy="34" r="1" fill="#1C1917" />
            <path d="M45,41 Q50,44 55,41" stroke="#1C1917" strokeWidth="2" fill="none" />
          </g>
        )}
      </svg>
    </div>
  );
};

export const MewtwoSprite: React.FC<SpriteProps> = ({ isBack, isAttacking, isHit, status, className }) => {
  return (
    <div className={`relative ${isAttacking ? 'animate-pulse' : ''} ${isHit ? 'animate-ping duration-150' : ''} ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_12px_rgba(168,85,247,0.7)]">
        <ellipse cx="50" cy="90" rx="18" ry="6" fill="rgba(0,0,0,0.3)" />
        <path d="M50,75 C25,95 20,40 10,60 C0,80 30,105 50,85" fill="none" stroke="#A855F7" strokeWidth="8" strokeLinecap="round" />
        {isBack ? (
          <g>
            <path d="M40,75 C36,45 42,42 50,42 C58,42 64,45 60,75 Z" fill="#E2E8F0" stroke="#64748B" strokeWidth="2" />
            <path d="M50,42 C48,32 46,28 50,22" fill="none" stroke="#A855F7" strokeWidth="4" />
            <ellipse cx="50" cy="24" rx="11" ry="13" fill="#E2E8F0" stroke="#64748B" strokeWidth="2" />
            <polygon points="44,14 41,5 47,12" fill="#E2E8F0" stroke="#64748B" />
            <polygon points="56,14 59,5 53,12" fill="#E2E8F0" stroke="#64748B" />
          </g>
        ) : (
          <g>
            <path d="M40,75 C36,45 42,42 50,42 C58,42 64,45 60,75 Z" fill="#E2E8F0" stroke="#64748B" strokeWidth="2" />
            <path d="M44,60 C42,50 45,46 50,46 C55,46 58,50 56,60 Z" fill="#C084FC" />
            <ellipse cx="50" cy="24" rx="11" ry="13" fill="#E2E8F0" stroke="#64748B" strokeWidth="2" />
            <polygon points="45,21 42,24 47,24" fill="#A855F7" />
            <polygon points="55,21 58,24 53,24" fill="#A855F7" />
            <polygon points="44,14 41,5 47,12" fill="#E2E8F0" stroke="#64748B" />
            <polygon points="56,14 59,5 53,12" fill="#E2E8F0" stroke="#64748B" />
            <path d="M36,48 Q25,50 30,60" fill="none" stroke="#E2E8F0" strokeWidth="4.5" strokeLinecap="round" />
            <path d="M64,48 Q75,50 70,60" fill="none" stroke="#E2E8F0" strokeWidth="4.5" strokeLinecap="round" />
          </g>
        )}
      </svg>
    </div>
  );
};

export const LucarioSprite: React.FC<SpriteProps> = ({ isBack, isAttacking, isHit, status, className }) => {
  return (
    <div className={`relative ${isAttacking ? 'animate-bounce' : ''} ${isHit ? 'animate-ping duration-150' : ''} ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]">
        <ellipse cx="50" cy="90" rx="18" ry="6" fill="rgba(0,0,0,0.3)" />
        {isBack ? (
          <g>
            <path d="M42,28 C32,28 24,38 28,48" fill="none" stroke="#0F172A" strokeWidth="4.5" strokeLinecap="round" />
            <path d="M58,28 C68,28 76,38 72,48" fill="none" stroke="#0F172A" strokeWidth="4.5" strokeLinecap="round" />
            <path d="M38,72 C35,50 42,46 50,46 C58,46 65,50 62,72 Z" fill="#0284C7" stroke="#0369A1" strokeWidth="2" />
            <path d="M38,48 Q50,46 62,48 L50,65 Z" fill="#FEF08A" />
            <ellipse cx="50" cy="30" rx="11" ry="12" fill="#0284C7" stroke="#0369A1" strokeWidth="2" />
            <path d="M42,32 H58" stroke="#0F172A" strokeWidth="5" />
            <polygon points="41,20 35,4 45,18" fill="#0284C7" stroke="#0369A1" />
            <polygon points="59,20 65,4 55,18" fill="#0284C7" stroke="#0369A1" />
          </g>
        ) : (
          <g>
            <path d="M42,28 C32,32 26,45 28,52" fill="none" stroke="#0F172A" strokeWidth="4.5" strokeLinecap="round" />
            <path d="M58,28 C68,32 74,45 72,52" fill="none" stroke="#0F172A" strokeWidth="4.5" strokeLinecap="round" />
            <path d="M38,72 C35,50 42,46 50,46 C58,46 65,50 62,72 Z" fill="#0284C7" stroke="#0369A1" strokeWidth="2" />
            <path d="M38,48 Q50,46 62,48 L50,65 Z" fill="#FEF08A" />
            <polygon points="50,52 48,58 52,52" fill="#FFF" stroke="#64748B" />
            <ellipse cx="50" cy="30" rx="11" ry="12" fill="#0284C7" stroke="#0369A1" strokeWidth="2" />
            <path d="M42,32 Q50,27 58,32 L50,41 Z" fill="#0F172A" />
            <polygon points="44,28 41,31 46,31" fill="#EF4444" />
            <polygon points="56,28 59,31 54,31" fill="#EF4444" />
            <polygon points="48,34 50,39 52,34" fill="#0F172A" />
            <polygon points="41,20 35,4 45,18" fill="#0284C7" stroke="#0369A1" />
            <polygon points="59,20 65,4 55,18" fill="#0284C7" stroke="#0369A1" />
          </g>
        )}
      </svg>
    </div>
  );
};

export const GengarSprite: React.FC<SpriteProps> = ({ isBack, isAttacking, isHit, status, className }) => {
  return (
    <div className={`relative ${isAttacking ? 'animate-bounce' : ''} ${isHit ? 'animate-ping duration-150' : ''} ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_10px_rgba(147,51,234,0.6)]">
        <ellipse cx="50" cy="85" rx="28" ry="8" fill="rgba(0,0,0,0.45)" />
        {isBack ? (
          <g>
            <polygon points="50,15 45,8 55,8" fill="#6B21A8" stroke="#4C1D95" strokeWidth="2" />
            <polygon points="35,30 25,24 38,32" fill="#6B21A8" stroke="#4C1D95" />
            <polygon points="65,30 75,24 62,32" fill="#6B21A8" stroke="#4C1D95" />
            <circle cx="50" cy="50" r="32" fill="#6B21A8" stroke="#4C1D95" strokeWidth="3" />
            <polygon points="28,26 12,8 24,32" fill="#6B21A8" stroke="#4C1D95" strokeWidth="2.5" />
            <polygon points="72,26 88,8 76,32" fill="#6B21A8" stroke="#4C1D95" strokeWidth="2.5" />
          </g>
        ) : (
          <g>
            <circle cx="50" cy="50" r="32" fill="#6B21A8" stroke="#4C1D95" strokeWidth="3" />
            <polygon points="28,26 12,8 24,32" fill="#6B21A8" stroke="#4C1D95" strokeWidth="2.5" />
            <polygon points="72,26 88,8 76,32" fill="#6B21A8" stroke="#4C1D95" strokeWidth="2.5" />
            <path d="M28,34 Q38,40 44,32 C38,30 32,30 28,34 Z" fill="#EF4444" stroke="#7F1D1D" strokeWidth="1" />
            <circle cx="37" cy="34" r="1.5" fill="#FFF" />
            <path d="M72,34 Q62,40 56,32 C62,30 68,30 72,34 Z" fill="#EF4444" stroke="#7F1D1D" strokeWidth="1" />
            <circle cx="63" cy="34" r="1.5" fill="#FFF" />
            <path d="M26,52 Q50,68 74,52 Q50,58 26,52 Z" fill="#FFF" stroke="#4C1D95" strokeWidth="2.5" />
            <path d="M34,54 V58 M42,55 V61 M50,56 V62 M58,55 V61 M66,54 V58" stroke="#E2E8F0" strokeWidth="1" />
          </g>
        )}
      </svg>
    </div>
  );
};

export const PokemonSprite: React.FC<SpriteProps & { name: string; dexNumber?: number }> = ({
  name,
  dexNumber,
  isBack = false,
  isAttacking = false,
  isHit = false,
  status = 'None',
  className = ''
}) => {
  const [imgState, setImgState] = useState<'loading' | 'gif' | 'homeArtwork' | 'svgFallback'>('loading');

  // Reset image state when name or perspective changes to reload correct visual mode
  useEffect(() => {
    setImgState('loading');
  }, [name, isBack]);

  let meta = POKEMON_META[name];
  if (!meta) {
    const clean = name.toLowerCase().replace(/[^a-z0-9\-]/g, '');
    const id = dexNumber || 25;
    meta = {
      id,
      cleanName: clean,
      scaleFront: 1.0,
      scaleBack: 1.10
    };
  }

  // Official Pokemon Showdown 3D Animated GIFs (transparent background)
  const gifUrl = isBack
    ? `https://play.pokemonshowdown.com/sprites/ani-back/${meta.cleanName}.gif`
    : `https://play.pokemonshowdown.com/sprites/ani/${meta.cleanName}.gif`;

  // Fallback 1: High Quality 3D Render from PokeAPI (Pokemon Home models)
  const homeArtworkUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${meta.id}.png`;

  // Attacking Animations: Player active Pokémon lunges up-right, opponent active Pokémon lunges down-left
  const attackClass = isAttacking
    ? (isBack ? 'translate-x-10 -translate-y-10 scale-110 rotate-3' : '-translate-x-10 translate-y-10 scale-110 -rotate-3')
    : '';

  // Hit Animation: dynamic shake and flash red colors using CSS filters
  const hitClass = isHit ? 'animate-shake brightness-125 saturate-200 text-rose-500 scale-95 duration-100' : '';

  // Apply custom filters for status effects
  const statusFilter = () => {
    if (isHit) return 'brightness(1.5) sepia(1) saturate(10) hue-rotate(-50deg)'; // Flash bright Red-Orange on damage
    if (status === 'Burned') return 'drop-shadow(0 0 10px rgba(249, 115, 22, 0.85)) saturate(1.2) sepia(0.1)';
    if (status === 'Paralyzed') return 'drop-shadow(0 0 10px rgba(234, 179, 8, 0.85)) brightness(1.1)';
    if (status === 'Poisoned') return 'drop-shadow(0 0 10px rgba(168, 85, 247, 0.85)) hue-rotate(60deg)';
    return 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))';
  };

  const scale = isBack ? meta.scaleBack : meta.scaleFront;
  const baseSize = isBack ? 'clamp(120px, 18vw, 192px)' : 'clamp(96px, 14vw, 144px)';
  const sizeStyle = {
    width: `calc(${baseSize} * ${scale})`,
    height: `calc(${baseSize} * ${scale})`,
  };

  const containerClasses = `relative flex items-center justify-center transition-all duration-300 ease-out select-none ${attackClass} ${hitClass} ${className}`;

  return (
    <div className={containerClasses} style={sizeStyle}>
      
      {/* 3D Circular Pedestal Ground ring underneath the model */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-[90%] h-[16px] bg-gradient-to-t from-slate-900/90 to-slate-800/40 border border-slate-700/40 rounded-full -z-10 shadow-[0_8px_16px_rgba(0,0,0,0.8)]" />

      {/* Dynamic shadow beneath Pokémon which responds to attack status */}
      <div className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-[65%] h-[6px] bg-black/80 rounded-full filter blur-[2px] transition-transform duration-300 -z-10 ${
        isAttacking ? 'scale-50 opacity-40' : 'scale-100 animate-pulse'
      }`} />

      {/* Loading micro-spinner */}
      {imgState === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
        </div>
      )}

      {/* Render Image Assets sequentially with secure error boundary */}
      {imgState !== 'svgFallback' && (
        <img
          src={imgState === 'gif' || imgState === 'loading' ? gifUrl : homeArtworkUrl}
          alt={name}
          referrerPolicy="no-referrer"
          className={`object-contain w-full h-full transition-all duration-300 ${
            imgState === 'loading' ? 'opacity-0 scale-75' : 'opacity-100 scale-100'
          }`}
          style={{ filter: statusFilter() }}
          onLoad={() => {
            if (imgState === 'loading') {
              setImgState('gif');
            }
          }}
          onError={() => {
            if (imgState === 'loading' || imgState === 'gif') {
              setImgState('homeArtwork'); // Try PokeAPI 3D render next
            } else {
              setImgState('svgFallback'); // Ultimate offline vector backup
            }
          }}
        />
      )}

      {/* Render standard vector fallbacks if client is offline */}
      {imgState === 'svgFallback' && (
        <div className="w-full h-full max-h-full max-w-full">
          {name === 'Pikachu' && <PikachuSprite isBack={isBack} isAttacking={false} isHit={false} status={status} className="w-full h-full" />}
          {name === 'Charizard' && <CharizardSprite isBack={isBack} isAttacking={false} isHit={false} status={status} className="w-full h-full" />}
          {name === 'Blastoise' && <BlastoiseSprite isBack={isBack} isAttacking={false} isHit={false} status={status} className="w-full h-full" />}
          {name === 'Mewtwo' && <MewtwoSprite isBack={isBack} isAttacking={false} isHit={false} status={status} className="w-full h-full" />}
          {name === 'Lucario' && <LucarioSprite isBack={isBack} isAttacking={false} isHit={false} status={status} className="w-full h-full" />}
          {name === 'Gengar' && <GengarSprite isBack={isBack} isAttacking={false} isHit={false} status={status} className="w-full h-full" />}
        </div>
      )}

      {/* Enhanced visual overhead particle rings for active statuses */}
      {status === 'Paralyzed' && (
        <div className="absolute -top-1.5 pointer-events-none flex items-center justify-center animate-bounce">
          <span className="text-yellow-400 text-xs font-bold drop-shadow-[0_0_8px_rgba(234,179,8,0.8)]">⚡</span>
        </div>
      )}
      {status === 'Burned' && (
        <div className="absolute -top-1.5 pointer-events-none flex items-center justify-center animate-pulse">
          <span className="text-orange-500 text-xs font-bold drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]">🔥</span>
        </div>
      )}
      {status === 'Poisoned' && (
        <div className="absolute -top-1.5 pointer-events-none flex items-center justify-center animate-bounce">
          <span className="text-purple-400 text-xs font-bold drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]">☠️</span>
        </div>
      )}
    </div>
  );
};
