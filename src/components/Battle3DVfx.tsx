import React from 'react';

export interface ActiveVfx {
  moveName: string;
  type: string;
  direction: 'p1_to_p2' | 'p2_to_p1';
  stage: 'travel' | 'impact' | 'none';
  category?: 'Physical' | 'Special' | 'Status';
  actorLane?: number;
  aimLane?: number;
}

interface Battle3DVfxProps {
  vfx: ActiveVfx;
}

export const Battle3DVfx: React.FC<Battle3DVfxProps> = ({ vfx }) => {
  const isP1 = vfx.direction === 'p1_to_p2';

  const actorLaneVal = vfx.actorLane !== undefined ? vfx.actorLane : 0;
  const aimLaneVal = vfx.aimLane !== undefined ? vfx.aimLane : 0;

  // Percentage locations matching isometric arena anchors
  // Player 1 base is 22% with 10% offset per lane
  const p1X = 22 + actorLaneVal * 11;
  const p1Y = 72;
  // Opponent base is 78% with 10% offset per lane
  const p2X = 78 + aimLaneVal * 11;
  const p2Y = 28;

  const startX = isP1 ? p1X : (78 + actorLaneVal * 11);
  const startY = isP1 ? p1Y : p2Y;
  const endX = isP1 ? p2X : (22 + aimLaneVal * 11);
  const endY = isP1 ? p2Y : p1Y;

  // Normalized angle between players for directional projectiles
  const dx = endX - startX;
  const dy = endY - startY;
  const angleRad = Math.atan2(dy, dx);
  const angleDeg = (angleRad * 180) / Math.PI;

  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
      <style>{`
        /* --- CORE SYSTEM ANIMATIONS --- */
        @keyframes vfx-hit-flash {
          0%, 100% { opacity: 0; }
          30% { opacity: 0.35; }
          60% { opacity: 0.15; }
          80% { opacity: 0.3; }
        }
        @keyframes global-shockwave {
          0% { transform: scale(0.1); opacity: 1; border-width: 6px; }
          100% { transform: scale(2.0); opacity: 0; border-width: 1px; }
        }
        @keyframes projectile-beam-fly {
          0% { left: ${startX}%; top: ${startY}%; transform: translate(-50%, -50%) scale(0.3); opacity: 0.2; }
          15% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
          90% { opacity: 1; }
          100% { left: ${endX}%; top: ${endY}%; transform: translate(-50%, -50%) scale(0.9); opacity: 0.3; }
        }
        @keyframes lunge-trail-p1 {
          0% { left: 22%; top: 72%; opacity: 0.8; width: 60px; height: 16px; transform: translate(-50%, -50%) rotate(${angleDeg}deg); }
          100% { left: 78%; top: 28%; opacity: 0; width: 120px; height: 4px; transform: translate(-50%, -50%) rotate(${angleDeg}deg); }
        }
        @keyframes lunge-trail-p2 {
          0% { left: 78%; top: 28%; opacity: 0.8; width: 60px; height: 16px; transform: translate(-50%, -50%) rotate(${angleDeg}deg); }
          100% { left: 22%; top: 72%; opacity: 0; width: 120px; height: 4px; transform: translate(-50%, -50%) rotate(${angleDeg}deg); }
        }

        /* --- HEAL STATUS ANIMATIONS --- */
        @keyframes heal-ring-expand {
          0% { transform: scale(0.4) rotateX(75deg); opacity: 0; }
          20% { opacity: 0.8; }
          100% { transform: scale(1.8) rotateX(75deg); opacity: 0; }
        }
        @keyframes heal-cross-float {
          0% { transform: translateY(15px) scale(0.5); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translateY(-45px) scale(1.2); opacity: 0; }
        }

        /* --- MOVE SPECIFIC TRAVEL ANIMATIONS --- */
        @keyframes electroball-charge {
          0% { transform: scale(0.2) rotate(0deg); opacity: 0.5; }
          50% { transform: scale(1.3) rotate(180deg); opacity: 1; }
          100% { transform: scale(1.0) rotate(360deg); opacity: 0.9; }
        }
        @keyframes flame-stream-emit {
          0% { transform: scale(0.3) translate(0, 0); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: scale(1.4) translate(${dx * 1.1}px, ${dy * 1.1}px); opacity: 0; }
        }
        @keyframes water-spurt-emit {
          0% { transform: scale(0.4) translate(0, 0); opacity: 0; }
          25% { opacity: 1; }
          100% { transform: scale(1.2) translate(${dx * 1.1}px, ${dy * 1.1}px); opacity: 0; }
        }
        @keyframes toxic-sludge-lob {
          0% { left: ${startX}%; top: ${startY}%; transform: translate(-50%, -50%) scale(0.4) translateY(0); opacity: 0; }
          40% { opacity: 1; transform: translate(-50%, -50%) scale(1.2) translateY(-80px); }
          100% { left: ${endX}%; top: ${endY}%; transform: translate(-50%, -50%) scale(0.8) translateY(0); opacity: 0.5; }
        }
        @keyframes draco-meteor-up {
          0% { left: ${startX}%; top: ${startY}%; transform: translate(-50%, -50%) scale(0.5); opacity: 0.3; }
          100% { left: ${startX}%; top: -100px; transform: translate(-50%, -50%) scale(1.5); opacity: 1; }
        }
        @keyframes leaf-spiral-fly {
          0% { transform: rotate(0deg) translate(0, 0) scale(0.2); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: rotate(720deg) translate(${dx}px, ${dy}px) scale(1.2); opacity: 0; }
        }
        @keyframes airslash-blade-fly {
          0% { left: ${startX}%; top: ${startY}%; transform: translate(-50%, -50%) rotate(${angleDeg}deg) scale(0.3); opacity: 0; }
          15% { opacity: 1; }
          100% { left: ${endX}%; top: ${endY}%; transform: translate(-50%, -50%) rotate(${angleDeg}deg) scale(1.4); opacity: 0; }
        }

        /* --- MOVE SPECIFIC IMPACT ANIMATIONS --- */
        @keyframes thunderbolt-lightning {
          0% { transform: translateY(-200px) scaleY(0); opacity: 0; }
          15% { transform: translateY(0) scaleY(1); opacity: 1; }
          25% { opacity: 0.3; }
          35% { opacity: 1; }
          45% { opacity: 0.2; }
          55% { opacity: 1; }
          100% { transform: scale(1.2); opacity: 0; }
        }
        @keyframes irontail-slash-vfx {
          0% { transform: rotate(-135deg) scale(0.2); opacity: 0; }
          20% { opacity: 1; }
          50% { transform: rotate(45deg) scale(1.2); opacity: 1; }
          100% { transform: rotate(90deg) scale(1.4); opacity: 0; }
        }
        @keyframes quick-attack-cut {
          0% { width: 0; opacity: 0; }
          30% { opacity: 1; }
          100% { width: 140px; opacity: 0; }
        }
        @keyframes electroball-vortex {
          0% { transform: scale(0.3) rotate(0deg); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: scale(2.2) rotate(360deg); opacity: 0; }
        }
        @keyframes fire-blast-expand {
          0% { transform: scale(0.4); opacity: 0; filter: brightness(1.5); }
          20% { opacity: 1; }
          100% { transform: scale(1.8); opacity: 0; filter: blur(6px); }
        }
        @keyframes firespin-column-rise {
          0% { transform: scaleX(0.5) scaleY(0); opacity: 0; transform-origin: bottom center; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: scaleX(1.3) scaleY(1.4); opacity: 0; transform-origin: bottom center; }
        }
        @keyframes hydropump-spout {
          0% { height: 0px; opacity: 0; margin-top: 60px; }
          30% { height: 180px; opacity: 1; margin-top: -40px; }
          80% { opacity: 1; }
          100% { height: 200px; opacity: 0; margin-top: -60px; }
        }
        @keyframes surf-wave-crash {
          0% { transform: translateY(100px) scaleX(0.2) scaleY(0.1); opacity: 0; }
          40% { transform: translateY(-40px) scaleX(1.2) scaleY(1.1); opacity: 1; }
          100% { transform: translateY(20px) scaleX(1.4) scaleY(1.3); opacity: 0; filter: blur(4px); }
        }
        @keyframes skullbash-cracked {
          0% { transform: scale(0.3); opacity: 0; }
          25% { opacity: 1; }
          100% { transform: scale(2.0); opacity: 0; }
        }
        @keyframes icebeam-crystal-grow {
          0% { transform: scale(0.1) rotate(0deg); opacity: 0; }
          35% { transform: scale(1.1) rotate(45deg); opacity: 1; }
          80% { opacity: 1; }
          100% { transform: scale(1.3) rotate(90deg); opacity: 0; }
        }
        @keyframes psychic-warp-screen {
          0% { transform: scale(0.5); opacity: 0; filter: hue-rotate(0deg); }
          30% { opacity: 1; }
          60% { transform: scale(1.1); filter: hue-rotate(180deg); }
          100% { transform: scale(1.5); opacity: 0; filter: hue-rotate(360deg); }
        }
        @keyframes shadowball-implosion {
          0% { transform: scale(1.6); opacity: 0; background: radial-gradient(circle, #a855f7, #000); }
          25% { transform: scale(1.0); opacity: 1; }
          75% { transform: scale(0.4); opacity: 1; box-shadow: 0 0 50px #4a044e; }
          100% { transform: scale(2.5); opacity: 0; background: radial-gradient(circle, #3b0764, transparent); }
        }
        @keyframes aurasphere-burst-vfx {
          0% { transform: scale(0.3); opacity: 0; box-shadow: 0 0 10px #22d3ee; }
          30% { opacity: 1; }
          100% { transform: scale(1.8); opacity: 0; box-shadow: 0 0 40px #06b6d4; }
        }
        @keyframes close-combat-fist-loop {
          0% { transform: scale(0.3) translate(0, 0); opacity: 0; }
          15% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: scale(1.2) translate(var(--p-x, 10px), var(--p-y, -10px)); opacity: 0; }
        }
        @keyframes extremespeed-sonic-ring {
          0% { transform: scale(0.2) rotateX(75deg); opacity: 0; border-width: 8px; }
          15% { opacity: 1; }
          100% { transform: scale(2.2) rotateX(75deg); opacity: 0; border-width: 1px; }
        }
        @keyframes flashcannon-beam-vfx {
          0% { transform: scaleX(0.1); opacity: 0; }
          15% { transform: scaleX(1.4); opacity: 1; }
          80% { opacity: 1; }
          100% { transform: scaleX(1.8); opacity: 0; filter: blur(5px); }
        }
        @keyframes darkpulse-ring-wave {
          0% { transform: scale(0.2); opacity: 0; border-width: 12px; border-color: #4a044e; }
          30% { opacity: 1; }
          100% { transform: scale(1.9); opacity: 0; border-width: 1px; border-color: #ec4899; }
        }
        @keyframes dazzlinggleam-star-fall {
          0% { transform: translateY(-50px) rotate(0deg) scale(0.2); opacity: 0; }
          25% { opacity: 1; }
          100% { transform: translateY(60px) rotate(360deg) scale(1.2); opacity: 0; }
        }
        @keyframes gigadrain-tendril {
          0% { stroke-dashoffset: 200; opacity: 0; }
          30% { opacity: 1; stroke-dashoffset: 100; }
          100% { stroke-dashoffset: 0; opacity: 0; }
        }
        @keyframes leafstorm-leaf-vortex {
          0% { transform: scale(0.3) rotate(0deg); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: scale(1.7) rotate(1080deg); opacity: 0; }
        }
        @keyframes dracometeor-comet-fall {
          0% { transform: translate(120px, -240px) scale(0.3) rotate(-35deg); opacity: 0; }
          35% { opacity: 1; }
          55% { transform: translate(0px, 0px) scale(1.3) rotate(-35deg); opacity: 1; }
          100% { transform: scale(1.5) rotate(-35deg); opacity: 0; filter: brightness(1.8); }
        }
        @keyframes outrage-fury-shock {
          0% { transform: scale(0.3); opacity: 0; background-color: #ef4444; }
          30% { opacity: 0.9; }
          100% { transform: scale(2.0); opacity: 0; background-color: #000000; }
        }
        @keyframes hurricane-funnel-vfx {
          0% { transform: scaleX(0.2) scaleY(0.4); opacity: 0; }
          15% { opacity: 0.8; }
          85% { opacity: 0.8; }
          100% { transform: scaleX(1.4) scaleY(1.4); opacity: 0; }
        }
        @keyframes moonblast-sphere-beam {
          0% { transform: scale(0.1); opacity: 0; }
          30% { transform: scale(1.3); opacity: 1; }
          75% { transform: scale(1.0); opacity: 1; }
          100% { transform: scale(2.2); opacity: 0; filter: blur(4px); }
        }
        @keyframes playrough-cloud-vfx {
          0% { transform: scale(0.4) rotate(0deg); opacity: 0; }
          15% { opacity: 1; }
          30% { transform: scale(1.1) rotate(15deg); }
          45% { transform: scale(0.9) rotate(-15deg); }
          60% { transform: scale(1.15) rotate(10deg); }
          75% { transform: scale(1.0) rotate(-5deg); }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes sacredsword-blade-strike {
          0% { transform: translateY(-150px) rotate(-45deg) scaleY(0); opacity: 0; }
          25% { transform: translateY(0) rotate(-45deg) scaleY(1.2); opacity: 1; }
          45% { transform: translateY(10px) rotate(-45deg) scaleY(1.0); }
          100% { transform: translateY(40px) rotate(-15deg) scale(1.3); opacity: 0; }
        }
        @keyframes kingsshield-dome-protect {
          0% { transform: scale(0.2); opacity: 0; }
          20% { transform: scale(1.1); opacity: 1; }
          80% { opacity: 1; }
          100% { transform: scale(1.3); opacity: 0; }
        }
        @keyframes shadowclaw-swipe-vfx {
          0% { transform: rotate(-30deg) scale(0.4); opacity: 0; }
          30% { opacity: 1; }
          100% { transform: rotate(15deg) scale(1.3); opacity: 0; }
        }
        @keyframes meteormash-fist {
          0% { transform: scale(0.1) translateY(-60px); opacity: 0; }
          40% { transform: scale(1.3) translateY(0); opacity: 1; }
          100% { transform: scale(1.6) translateY(10px); opacity: 0; }
        }
        @keyframes hypervoice-ripple {
          0% { transform: scale(0.1); opacity: 0; border-width: 14px; }
          25% { opacity: 1; }
          100% { transform: scale(1.9); opacity: 0; border-width: 1px; }
        }
        @keyframes bitterblade-cross {
          0% { transform: scale(0.2) rotate(-15deg); opacity: 0; }
          25% { opacity: 1; }
          100% { transform: scale(1.3) rotate(45deg); opacity: 0; }
        }
      `}</style>

      {/* Screen Hit Flash Overlay */}
      {vfx.stage === 'impact' && (
        <div 
          className={`absolute inset-0 z-50 rounded-3xl pointer-events-none transition-all duration-150 ${
            vfx.type === 'Electric' || vfx.moveName === 'Thunderbolt' || vfx.moveName === 'Electro Ball' ? 'bg-yellow-400/20' :
            vfx.type === 'Fire' || vfx.moveName === 'Flamethrower' || vfx.moveName === 'Fire Spin' || vfx.moveName === 'Draco Meteor' || vfx.moveName === 'Bitter Blade' ? 'bg-red-500/20' :
            vfx.type === 'Water' || vfx.moveName === 'Hydro Pump' || vfx.moveName === 'Surf' ? 'bg-blue-400/20' :
            vfx.type === 'Grass' || vfx.moveName === 'Leaf Storm' || vfx.moveName === 'Giga Drain' ? 'bg-emerald-400/15' :
            vfx.type === 'Dark' || vfx.type === 'Ghost' || vfx.moveName === 'Shadow Ball' || vfx.moveName === 'Dark Pulse' || vfx.moveName === 'Shadow Claw' ? 'bg-purple-950/25' :
            vfx.type === 'Fairy' || vfx.moveName === 'Moonblast' || vfx.moveName === 'Dazzling Gleam' || vfx.moveName === 'Play Rough' ? 'bg-pink-400/15' :
            'bg-white/15'
          }`}
          style={{ animation: 'vfx-hit-flash 0.35s ease-out forwards' }}
        />
      )}

      {/* TRAVEL STAGE: CHARGING & PROJECTILE FLIGHT PATHS */}
      {vfx.stage === 'travel' && (
        <>
          {/* Universal Charging Ring for Special/Status Moves */}
          {(vfx.category === 'Special' || vfx.category === 'Status') && (
            <div
              className="absolute flex items-center justify-center"
              style={{
                left: `${startX}%`,
                top: `${startY}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div 
                className="absolute rounded-full border-2 w-24 h-24 pointer-events-none"
                style={{
                  borderColor: 
                    vfx.moveName === 'Moonblast' || vfx.moveName === 'Dazzling Gleam' ? '#f472b6' :
                    vfx.moveName === 'Thunderbolt' || vfx.moveName === 'Electro Ball' ? '#facc15' :
                    vfx.moveName === 'Flamethrower' || vfx.moveName === 'Fire Spin' ? '#f97316' :
                    vfx.moveName === 'Hydro Pump' || vfx.moveName === 'Surf' || vfx.moveName === 'Ice Beam' ? '#3b82f6' :
                    vfx.moveName === 'Leaf Storm' || vfx.moveName === 'Giga Drain' ? '#10b981' :
                    vfx.moveName === 'Shadow Ball' || vfx.moveName === 'Dark Pulse' ? '#8b5cf6' : '#94a3b8',
                  boxShadow: `0 0 16px ${
                    vfx.type === 'Electric' ? '#facc15' :
                    vfx.type === 'Fire' ? '#f97316' :
                    vfx.type === 'Water' ? '#3b82f6' : '#94a3b8'
                  }`,
                  animation: 'aura-charge-grow 0.5s ease-out 2'
                }}
              />
            </div>
          )}

          {/* Quick Attack & Physical Move Dash Lunge Lines */}
          {vfx.category === 'Physical' && (
            <div
              className="absolute pointer-events-none flex items-center justify-center"
              style={{
                animation: isP1 ? 'lunge-trail-p1 0.4s ease-out forwards' : 'lunge-trail-p2 0.4s ease-out forwards'
              }}
            >
              <div className="relative w-full h-full flex flex-col justify-between items-center">
                <div className="w-16 h-[2px] bg-gradient-to-r from-transparent via-white to-transparent shadow-[0_0_10px_white]" />
                <div className="w-24 h-[4px] bg-gradient-to-r from-transparent via-sky-300 to-transparent mt-1 shadow-[0_0_12px_#38bdf8]" />
              </div>
            </div>
          )}

          {/* Giga Drain Healing Health Recovery Transfer Lines */}
          {vfx.moveName === 'Giga Drain' && (
            <div className="absolute inset-0 z-30 pointer-events-none">
              <svg className="w-full h-full absolute inset-0">
                <path
                  d={`M ${endX} ${endY} Q ${(startX + endX) / 2} ${(startY + endY) / 2 - 80} ${startX} ${startY}`}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="5"
                  strokeDasharray="200"
                  style={{ animation: 'gigadrain-tendril 0.6s linear infinite' }}
                />
                <path
                  d={`M ${endX} ${endY} Q ${(startX + endX) / 2} ${(startY + endY) / 2 + 80} ${startX} ${startY}`}
                  fill="none"
                  stroke="#34d399"
                  strokeWidth="3"
                  strokeDasharray="200"
                  style={{ animation: 'gigadrain-tendril 0.6s linear infinite', animationDelay: '0.2s' }}
                />
              </svg>
            </div>
          )}

          {/* Move-Specific Flight Projectiles */}
          {vfx.moveName === 'Electro Ball' && (
            <div
              className="absolute flex items-center justify-center w-12 h-12 rounded-full bg-yellow-400 border border-yellow-200 shadow-[0_0_24px_#eab308]"
              style={{
                animation: 'projectile-beam-fly 0.55s cubic-bezier(0.25, 1, 0.5, 1) forwards'
              }}
            >
              <div className="w-8 h-8 rounded-full border-2 border-white animate-spin" />
              <span className="absolute text-sm">⚡</span>
            </div>
          )}

          {vfx.moveName === 'Flamethrower' && (
            <div className="absolute pointer-events-none" style={{ left: `${startX}%`, top: `${startY}%` }}>
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="absolute w-8 h-8 rounded-full bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400 shadow-[0_0_15px_#f97316]"
                  style={{
                    animation: `flame-stream-emit 0.5s ease-out forwards`,
                    animationDelay: `${i * 0.08}s`
                  }}
                />
              ))}
            </div>
          )}

          {vfx.moveName === 'Hydro Pump' && (
            <div className="absolute pointer-events-none" style={{ left: `${startX}%`, top: `${startY}%` }}>
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="absolute w-7 h-7 rounded-full bg-gradient-to-r from-blue-600 via-sky-400 to-white shadow-[0_0_12px_#3b82f6]"
                  style={{
                    animation: `water-spurt-emit 0.5s ease-out forwards`,
                    animationDelay: `${i * 0.08}s`
                  }}
                />
              ))}
            </div>
          )}

          {vfx.moveName === 'Sludge Bomb' && (
            <div
              className="absolute flex items-center justify-center"
              style={{ animation: 'toxic-sludge-lob 0.6s ease-in-out forwards' }}
            >
              <div className="w-10 h-10 bg-purple-700 rounded-full border border-purple-500 shadow-[0_0_20px_#7c3aed] flex items-center justify-center">
                <span className="text-sm">🤢</span>
              </div>
            </div>
          )}

          {vfx.moveName === 'Draco Meteor' && (
            <div
              className="absolute flex items-center justify-center"
              style={{ animation: 'draco-meteor-up 0.5s cubic-bezier(0.25, 1, 0.5, 1) forwards' }}
            >
              <div className="w-14 h-14 bg-gradient-to-b from-amber-400 via-orange-500 to-red-600 rounded-full shadow-[0_0_25px_#f97316] flex items-center justify-center">
                <span className="text-xl">☄️</span>
              </div>
            </div>
          )}

          {vfx.moveName === 'Air Slash' && (
            <div
              className="absolute flex items-center justify-center"
              style={{ animation: 'airslash-blade-fly 0.5s ease-out forwards' }}
            >
              <div className="w-16 h-4 bg-cyan-200/40 border border-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.7)] transform skew-x-12" />
            </div>
          )}

          {vfx.moveName === 'Shadow Ball' && (
            <div
              className="absolute flex items-center justify-center"
              style={{ animation: 'projectile-beam-fly 0.55s ease-in-out forwards' }}
            >
              <div className="w-11 h-11 bg-indigo-950 border-2 border-purple-800 rounded-full shadow-[0_0_25px_#7c3aed] flex items-center justify-center">
                <div className="w-6 h-6 bg-purple-900 rounded-full animate-ping" />
                <span className="absolute text-xs">💀</span>
              </div>
            </div>
          )}

          {vfx.moveName === 'Aura Sphere' && (
            <div
              className="absolute flex items-center justify-center"
              style={{ animation: 'projectile-beam-fly 0.55s ease-out forwards' }}
            >
              <div className="w-10 h-10 bg-cyan-400 border border-white rounded-full shadow-[0_0_20px_#22d3ee] flex items-center justify-center animate-spin">
                <div className="w-4 h-4 bg-white rounded-full" />
              </div>
            </div>
          )}

          {vfx.moveName === 'Leaf Storm' && (
            <div className="absolute pointer-events-none" style={{ left: `${startX}%`, top: `${startY}%` }}>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <span
                  key={i}
                  className="absolute text-lg select-none"
                  style={{
                    animation: `leaf-spiral-fly 0.55s ease-out forwards`,
                    animationDelay: `${i * 0.06}s`
                  }}
                >
                  🍃
                </span>
              ))}
            </div>
          )}

          {/* Standard generic beam travel for other ranged special moves */}
          {vfx.category === 'Special' && 
           vfx.moveName !== 'Electro Ball' && 
           vfx.moveName !== 'Flamethrower' && 
           vfx.moveName !== 'Hydro Pump' && 
           vfx.moveName !== 'Sludge Bomb' && 
           vfx.moveName !== 'Draco Meteor' && 
           vfx.moveName !== 'Air Slash' && 
           vfx.moveName !== 'Shadow Ball' && 
           vfx.moveName !== 'Aura Sphere' && 
           vfx.moveName !== 'Leaf Storm' && (
            <div
              className="absolute flex items-center justify-center w-8 h-8 rounded-full bg-white/80 border border-white shadow-[0_0_15px_white]"
              style={{
                animation: 'projectile-beam-fly 0.5s cubic-bezier(0.1, 1, 0.2, 1) forwards'
              }}
            />
          )}

          {/* Status Recovery Heal VFX */}
          {vfx.type === 'Heal' && (
            <div
              className="absolute flex items-center justify-center"
              style={{
                left: `${startX}%`,
                top: `${startY}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div className="relative w-28 h-28 flex items-center justify-center">
                <div
                  className="absolute border-4 border-emerald-400 rounded-full w-20 h-6 pointer-events-none"
                  style={{ animation: 'heal-ring-expand 0.6s ease-out infinite' }}
                />
                <div
                  className="absolute border-2 border-emerald-200 rounded-full w-24 h-8 pointer-events-none"
                  style={{ animation: 'heal-ring-expand 0.6s ease-out infinite', animationDelay: '0.2s' }}
                />
                <div className="absolute w-12 h-12 bg-emerald-500 rounded-full border border-emerald-300 shadow-[0_0_25px_#10b981] flex items-center justify-center">
                  <span className="text-white text-lg font-bold animate-bounce">💚</span>
                </div>
                {[0, 60, 120, 180, 240, 300].map(deg => (
                  <span
                    key={deg}
                    className="absolute text-emerald-400 text-sm font-bold pointer-events-none"
                    style={{
                      transform: `rotate(${deg}deg) translateY(-25px)`,
                      animation: 'heal-cross-float 0.8s ease-out infinite'
                    }}
                  >
                    +
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* IMPACT STAGE: 35 DISTINCT AND BEAUTIFULLY DETAILED MOVE ANIMATIONS */}
      {vfx.stage === 'impact' && (
        <div
          className="absolute flex items-center justify-center"
          style={{
            left: `${endX}%`,
            top: `${endY}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {/* Base Shockwave Circle */}
          <div 
            className="absolute rounded-full border-2 border-white/60 pointer-events-none"
            style={{
              width: '140px',
              height: '45px',
              transform: 'rotateX(75deg)',
              animation: 'global-shockwave 0.45s ease-out forwards'
            }}
          />

          {/* 1. THUNDERBOLT */}
          {vfx.moveName === 'Thunderbolt' && (
            <div className="relative w-32 h-64 flex items-end justify-center pb-8">
              {[
                { delay: '0s', offset: '-15px', scale: '1.3' },
                { delay: '0.1s', offset: '15px', scale: '1.0' },
                { delay: '0.2s', offset: '0px', scale: '1.5' }
              ].map((strike, sIdx) => (
                <svg
                  key={sIdx}
                  viewBox="0 0 40 160"
                  className="absolute w-20 h-60 text-yellow-300 fill-none stroke-current drop-shadow-[0_0_20px_#facc15]"
                  style={{
                    left: `calc(50% - 40px + ${strike.offset})`,
                    transform: `scale(${strike.scale})`,
                    animation: `thunderbolt-lightning 0.5s ease-out ${strike.delay} forwards`,
                    transformOrigin: 'top center'
                  }}
                  strokeWidth="4"
                >
                  <path d="M20,0 L5,45 L25,40 L8,90 L28,85 L15,160" />
                </svg>
              ))}
              <div className="absolute w-24 h-24 rounded-full bg-yellow-400/30 blur-2xl animate-ping" />
              <div className="text-4xl drop-shadow-[0_0_12px_#eab308] z-10">⚡</div>
            </div>
          )}

          {/* 2. IRON TAIL */}
          {vfx.moveName === 'Iron Tail' && (
            <div className="relative w-36 h-36 flex items-center justify-center">
              <div 
                className="absolute w-28 h-8 bg-gradient-to-r from-slate-400 via-white to-slate-500 rounded border border-slate-300 shadow-[0_0_25px_white]"
                style={{ animation: 'irontail-slash-vfx 0.5s cubic-bezier(0.1, 1, 0.2, 1) forwards' }}
              />
              <div className="text-3xl drop-shadow-[0_0_10px_#94a3b8]">🗡️</div>
            </div>
          )}

          {/* 3. QUICK ATTACK */}
          {vfx.moveName === 'Quick Attack' && (
            <div className="relative w-32 h-32 flex items-center justify-center">
              {[
                { rot: '-30deg', delay: '0s' },
                { rot: '15deg', delay: '0.08s' },
                { rot: '60deg', delay: '0.15s' }
              ].map((slash, sIdx) => (
                <div
                  key={sIdx}
                  className="absolute h-[3px] bg-white rounded shadow-[0_0_10px_white]"
                  style={{
                    transform: `rotate(${slash.rot})`,
                    animation: `quick-attack-cut 0.4s ease-out ${slash.delay} forwards`
                  }}
                />
              ))}
              <span className="text-xl font-bold text-white tracking-widest animate-pulse font-mono bg-black/40 px-1.5 py-0.5 rounded border border-white/20">QUICK</span>
            </div>
          )}

          {/* 4. ELECTRO BALL */}
          {vfx.moveName === 'Electro Ball' && (
            <div className="relative w-36 h-36 flex items-center justify-center">
              <div 
                className="absolute w-20 h-20 rounded-full border-4 border-yellow-300 bg-yellow-500/20 shadow-[0_0_35px_#eab308]"
                style={{ animation: 'electroball-vortex 0.6s ease-out forwards' }}
              />
              <div className="text-3xl drop-shadow-[0_0_15px_#facc15] animate-ping">💥</div>
            </div>
          )}

          {/* 5. FLAMETHROWER */}
          {vfx.moveName === 'Flamethrower' && (
            <div className="relative w-40 h-40 flex items-center justify-center">
              <div className="absolute w-32 h-32 bg-orange-600/30 rounded-full blur-2xl animate-ping" />
              {[
                { size: 'w-24 h-24 bg-red-600', delay: '0s' },
                { size: 'w-18 h-18 bg-orange-500', delay: '0.08s' },
                { size: 'w-12 h-12 bg-yellow-400', delay: '0.15s' }
              ].map((fire, fIdx) => (
                <div
                  key={fIdx}
                  className={`absolute rounded-full shadow-[0_0_25px_#f97316] ${fire.size}`}
                  style={{ animation: `fire-blast-expand 0.55s ease-out ${fire.delay} forwards` }}
                />
              ))}
              <span className="text-4xl drop-shadow-[0_0_12px_#ea580c]">🔥</span>
            </div>
          )}

          {/* 6. AIR SLASH */}
          {vfx.moveName === 'Air Slash' && (
            <div className="relative w-36 h-36 flex items-center justify-center">
              {[
                { rot: '-60deg', delay: '0s' },
                { rot: '45deg', delay: '0.1s' }
              ].map((blade, bIdx) => (
                <div
                  key={bIdx}
                  className="absolute w-32 h-2.5 bg-sky-200/80 border border-white rounded shadow-[0_0_15px_rgba(255,255,255,0.8)]"
                  style={{
                    transform: `rotate(${blade.rot})`,
                    animation: `quick-attack-cut 0.45s ease-out ${blade.delay} forwards`
                  }}
                />
              ))}
              <span className="text-3xl">💨</span>
            </div>
          )}

          {/* 7. DRAGON CLAW */}
          {vfx.moveName === 'Dragon Claw' && (
            <div className="relative w-36 h-36 flex items-center justify-center">
              {[
                { rot: '-45deg', color: 'border-emerald-400', delay: '0s' },
                { rot: '45deg', color: 'border-teal-400', delay: '0.1s' }
              ].map((slash, sIdx) => (
                <div
                  key={sIdx}
                  className={`absolute w-32 h-6 border-b-4 border-t-4 rounded shadow-[0_0_20px_#10b981] ${slash.color}`}
                  style={{
                    transform: `rotate(${slash.rot})`,
                    animation: `irontail-slash-vfx 0.5s cubic-bezier(0.15, 1, 0.3, 1) ${slash.delay} forwards`
                  }}
                />
              ))}
              <span className="text-4xl drop-shadow-[0_0_15px_#059669]">🐉</span>
            </div>
          )}

          {/* 8. FIRE SPIN */}
          {vfx.moveName === 'Fire Spin' && (
            <div className="relative w-36 h-48 flex items-end justify-center">
              <div 
                className="w-24 bg-gradient-to-t from-red-600 via-orange-500 to-yellow-400/40 rounded-t-full shadow-[0_0_30px_#f97316]"
                style={{
                  height: '160px',
                  animation: 'firespin-column-rise 0.75s ease-out forwards'
                }}
              />
              <span className="absolute text-4xl animate-bounce -translate-y-16">🌪️🔥</span>
            </div>
          )}

          {/* 9. HYDRO PUMP */}
          {vfx.moveName === 'Hydro Pump' && (
            <div className="relative w-32 h-48 flex items-end justify-center pb-4">
              <div className="absolute w-28 h-28 bg-blue-500/25 rounded-full blur-xl animate-ping" />
              <div 
                className="w-14 bg-gradient-to-t from-blue-700 via-sky-400 to-white/90 rounded-t-full shadow-[0_0_25px_#3b82f6]"
                style={{ animation: 'hydropump-spout 0.65s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
              />
              <span className="text-3xl absolute -translate-y-24">🌊</span>
            </div>
          )}

          {/* 10. SURF */}
          {vfx.moveName === 'Surf' && (
            <div className="relative w-48 h-40 flex items-center justify-center">
              <div 
                className="absolute w-52 h-28 bg-gradient-to-t from-blue-600/90 via-sky-400 to-transparent rounded-t-3xl shadow-[0_-15px_25px_rgba(59,130,246,0.6)]"
                style={{ animation: 'surf-wave-crash 0.7s cubic-bezier(0.1, 1, 0.2, 1) forwards' }}
              />
              <span className="text-5xl animate-bounce z-10">🏄🌊</span>
            </div>
          )}

          {/* 11. SKULL BASH */}
          {vfx.moveName === 'Skull Bash' && (
            <div className="relative w-32 h-32 flex items-center justify-center">
              <div 
                className="absolute w-24 h-24 border-4 border-amber-500/80 rounded-full shadow-[0_0_25px_#fbbf24]"
                style={{ animation: 'skullbash-cracked 0.5s ease-out forwards' }}
              />
              <span className="text-4xl text-white font-extrabold font-mono z-10 animate-ping">CRASH</span>
            </div>
          )}

          {/* 12. ICE BEAM */}
          {vfx.moveName === 'Ice Beam' && (
            <div className="relative w-36 h-36 flex items-center justify-center">
              <div className="absolute w-28 h-28 bg-cyan-300/30 rounded-full blur-xl animate-pulse" />
              {[
                { scale: '1.0', delay: '0s' },
                { scale: '1.3', delay: '0.1s' }
              ].map((crystal, cIdx) => (
                <div
                  key={cIdx}
                  className="absolute bg-gradient-to-tr from-cyan-400/80 via-white to-transparent rounded-lg shadow-[0_0_20px_#22d3ee]"
                  style={{
                    width: '32px',
                    height: '32px',
                    animation: `icebeam-crystal-grow 0.7s ease-out ${crystal.delay} forwards`
                  }}
                />
              ))}
              <span className="text-3xl z-10 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]">❄️</span>
            </div>
          )}

          {/* 13. PSYCHIC */}
          {vfx.moveName === 'Psychic' && (
            <div className="relative w-36 h-36 flex items-center justify-center">
              <div 
                className="absolute w-32 h-32 rounded-full border-4 border-pink-500 bg-purple-900/10 shadow-[0_0_35px_#ec4899]"
                style={{ animation: 'psychic-warp-screen 0.75s ease-in-out forwards' }}
              />
              <span className="text-4xl text-pink-400 font-extrabold animate-pulse drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]">🌀</span>
            </div>
          )}

          {/* 14. SHADOW BALL */}
          {vfx.moveName === 'Shadow Ball' && (
            <div className="relative w-32 h-32 flex items-center justify-center">
              <div 
                className="absolute w-16 h-16 rounded-full"
                style={{ animation: 'shadowball-implosion 0.75s ease-out forwards' }}
              />
              <span className="text-4xl drop-shadow-[0_0_12px_#6b21a8]">🔮</span>
            </div>
          )}

          {/* 15. AURA SPHERE */}
          {vfx.moveName === 'Aura Sphere' && (
            <div className="relative w-32 h-32 flex items-center justify-center">
              <div 
                className="absolute w-14 h-14 rounded-full border border-cyan-400 bg-cyan-500/20 shadow-[0_0_30px_#06b6d4]"
                style={{ animation: 'aurasphere-burst-vfx 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
              />
              <span className="text-3xl text-cyan-300 drop-shadow-[0_0_10px_#22d3ee]">💠</span>
            </div>
          )}

          {/* 16. RECOVER */}
          {vfx.moveName === 'Recover' && (
            <div className="relative w-32 h-32 flex items-center justify-center">
              <div className="absolute w-24 h-24 bg-emerald-500/20 rounded-full blur-xl animate-pulse" />
              <div className="text-3xl">💚✨</div>
            </div>
          )}

          {/* 17. CLOSE COMBAT */}
          {vfx.moveName === 'Close Combat' && (
            <div className="relative w-36 h-36 flex items-center justify-center">
              {[
                { px: '-25px', py: '-15px', d: '0s' },
                { px: '20px', py: '-20px', d: '0.06s' },
                { px: '-15px', py: '25px', d: '0.12s' },
                { px: '25px', py: '15px', d: '0.18s' },
                { px: '0px', py: '0px', d: '0.24s' }
              ].map((p, pIdx) => (
                <div
                  key={pIdx}
                  className="absolute text-3xl font-extrabold"
                  style={{
                    '--p-x': p.px,
                    '--p-y': p.py,
                    animation: `close-combat-fist-loop 0.4s ease-out ${p.d} forwards`,
                    opacity: 0
                  } as React.CSSProperties}
                >
                  👊💥
                </div>
              ))}
            </div>
          )}

          {/* 18. EXTREME SPEED */}
          {vfx.moveName === 'Extreme Speed' && (
            <div className="relative w-36 h-36 flex items-center justify-center">
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className="absolute rounded-full border-4 border-slate-300 pointer-events-none"
                  style={{
                    width: '130px',
                    height: '40px',
                    animation: `extremespeed-sonic-ring 0.4s ease-out ${i * 0.1}s forwards`
                  }}
                />
              ))}
              <span className="text-2xl font-bold italic text-sky-300 bg-black/50 px-2 py-0.5 rounded border border-sky-400/30">FAST</span>
            </div>
          )}

          {/* 19. FLASH CANNON */}
          {vfx.moveName === 'Flash Cannon' && (
            <div className="relative w-40 h-12 flex items-center justify-center">
              <div 
                className="absolute w-48 h-6 bg-gradient-to-r from-slate-400 via-white to-slate-400 rounded-full shadow-[0_0_20px_white]"
                style={{ animation: 'flashcannon-beam-vfx 0.55s ease-out forwards' }}
              />
              <span className="text-3xl z-10 drop-shadow-[0_0_10px_white]">🛡️✴️</span>
            </div>
          )}

          {/* 20. SLUDGE BOMB */}
          {vfx.moveName === 'Sludge Bomb' && (
            <div className="relative w-36 h-36 flex items-center justify-center">
              <div className="absolute w-28 h-28 bg-purple-900/30 rounded-full blur-xl animate-pulse" />
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="absolute w-12 h-12 bg-purple-800 rounded-full border border-purple-500 opacity-0"
                  style={{
                    transform: `scale(${1 + i * 0.25})`,
                    animation: `fire-blast-expand 0.5s ease-out ${i * 0.12}s forwards`
                  }}
                />
              ))}
              <span className="text-3xl z-10">☣️💜</span>
            </div>
          )}

          {/* 21. DARK PULSE */}
          {vfx.moveName === 'Dark Pulse' && (
            <div className="relative w-36 h-36 flex items-center justify-center">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="absolute border-4 rounded-full"
                  style={{
                    width: '120px',
                    height: '120px',
                    animation: `darkpulse-ring-wave 0.65s ease-out ${i * 0.15}s forwards`
                  }}
                />
              ))}
              <span className="text-4xl text-fuchsia-400 drop-shadow-[0_0_12px_black] z-10">🌑</span>
            </div>
          )}

          {/* 22. DAZZLING GLEAM */}
          {vfx.moveName === 'Dazzling Gleam' && (
            <div className="relative w-36 h-36 flex items-center justify-center">
              <div className="absolute w-32 h-32 bg-pink-500/20 rounded-full blur-2xl animate-ping" />
              {[0, 60, 120, 180, 240, 300].map((deg, i) => (
                <span
                  key={deg}
                  className="absolute text-xl pointer-events-none"
                  style={{
                    transform: `rotate(${deg}deg) translateY(-20px)`,
                    animation: `dazzlinggleam-star-fall 0.75s ease-out ${i * 0.05}s forwards`
                  }}
                >
                  ✨⭐
                </span>
              ))}
              <span className="text-4xl animate-pulse">💖🌟</span>
            </div>
          )}

          {/* 23. GIGA DRAIN */}
          {vfx.moveName === 'Giga Drain' && (
            <div className="relative w-32 h-32 flex items-center justify-center">
              <div className="absolute w-24 h-24 bg-green-500/20 rounded-full blur-xl" />
              <span className="text-3xl text-green-400 drop-shadow-[0_0_8px_green] animate-pulse">🌱🔋</span>
            </div>
          )}

          {/* 24. LEAF STORM */}
          {vfx.moveName === 'Leaf Storm' && (
            <div className="relative w-36 h-36 flex items-center justify-center">
              <div 
                className="absolute w-28 h-28 border border-emerald-400 rounded-full flex items-center justify-center shadow-[0_0_20px_#10b981]"
                style={{ animation: 'leafstorm-leaf-vortex 0.75s cubic-bezier(0.1, 1, 0.2, 1) forwards' }}
              />
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                <span
                  key={deg}
                  className="absolute text-lg"
                  style={{ transform: `rotate(${deg}deg) translate(30px, 30px)` }}
                >
                  🍃
                </span>
              ))}
              <span className="text-3xl">🌪️🍀</span>
            </div>
          )}

          {/* 25. DRACO METEOR */}
          {vfx.moveName === 'Draco Meteor' && (
            <div className="relative w-40 h-40 flex items-center justify-center">
              {[
                { offset: '-40px', delay: '0s' },
                { offset: '40px', delay: '0.12s' },
                { offset: '0px', delay: '0.24s' }
              ].map((meteor, mIdx) => (
                <div
                  key={mIdx}
                  className="absolute w-12 h-12 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600 rounded-full shadow-[0_0_25px_#ef4444]"
                  style={{
                    left: `calc(50% - 24px + ${meteor.offset})`,
                    animation: `dracometeor-comet-fall 0.65s cubic-bezier(0.25, 1, 0.5, 1) ${meteor.delay} forwards`
                  }}
                />
              ))}
              <span className="text-4xl drop-shadow-[0_0_15px_#f97316] z-10 animate-bounce">☄️🔥</span>
            </div>
          )}

          {/* 26. OUTRAGE */}
          {vfx.moveName === 'Outrage' && (
            <div className="relative w-36 h-36 flex items-center justify-center">
              <div 
                className="absolute w-28 h-28 rounded-full shadow-[0_0_30px_#ef4444]"
                style={{ animation: 'outrage-fury-shock 0.65s ease-out forwards' }}
              />
              <span className="text-4xl font-extrabold animate-bounce tracking-widest text-red-500 font-mono">RAGE💥</span>
            </div>
          )}

          {/* 27. HURRICANE */}
          {vfx.moveName === 'Hurricane' && (
            <div className="relative w-36 h-48 flex items-center justify-center">
              <div 
                className="absolute w-24 h-40 border-l-2 border-r-2 border-dashed border-sky-300 bg-sky-200/10 rounded-full"
                style={{ animation: 'hurricane-funnel-vfx 0.75s ease-out forwards' }}
              />
              <span className="text-4xl animate-pulse">🌪️🌀</span>
            </div>
          )}

          {/* 28. MOONBLAST */}
          {vfx.moveName === 'Moonblast' && (
            <div className="relative w-40 h-40 flex items-center justify-center">
              <div 
                className="absolute w-24 h-24 rounded-full bg-gradient-to-tr from-pink-400 via-pink-100 to-transparent shadow-[0_0_35px_#f472b6]"
                style={{ animation: 'moonblast-sphere-beam 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
              />
              <span className="text-4xl z-10">🌙🌕</span>
            </div>
          )}

          {/* 29. PLAY ROUGH */}
          {vfx.moveName === 'Play Rough' && (
            <div className="relative w-36 h-36 flex items-center justify-center">
              <div 
                className="absolute w-28 h-28 rounded-full bg-white border-2 border-dashed border-slate-300 shadow-lg flex items-center justify-center overflow-hidden"
                style={{ animation: 'playrough-cloud-vfx 0.75s ease-in-out forwards' }}
              >
                <div className="grid grid-cols-2 gap-2 p-4">
                  <span className="text-xl">👊</span>
                  <span className="text-xl">⭐</span>
                  <span className="text-xl">💢</span>
                  <span className="text-xl">👊</span>
                </div>
              </div>
              <span className="text-3xl z-10 animate-bounce">✨💖</span>
            </div>
          )}

          {/* 30. SACRED SWORD */}
          {vfx.moveName === 'Sacred Sword' && (
            <div className="relative w-36 h-48 flex items-end justify-center pb-8">
              <div 
                className="absolute w-8 h-36 bg-gradient-to-t from-yellow-300 via-yellow-100 to-white/10 border-l border-r border-yellow-400 rounded shadow-[0_0_30px_#f59e0b]"
                style={{
                  clipPath: 'polygon(50% 0%, 100% 20%, 80% 100%, 20% 100%, 0% 20%)',
                  animation: 'sacredsword-blade-strike 0.65s cubic-bezier(0.19, 1, 0.22, 1) forwards'
                }}
              />
              <span className="text-4xl z-10 animate-bounce">🗡️✨</span>
            </div>
          )}

          {/* 31. KINGS SHIELD */}
          {vfx.moveName === 'Kings Shield' && (
            <div className="relative w-32 h-32 flex items-center justify-center">
              <div 
                className="absolute w-24 h-24 border-4 border-yellow-500 bg-yellow-900/10 rounded-full shadow-[0_0_30px_#eab308]"
                style={{ animation: 'kingsshield-dome-protect 0.65s ease-out forwards' }}
              />
              <span className="text-4xl z-10">🛡️👑</span>
            </div>
          )}

          {/* 32. SHADOW CLAW */}
          {vfx.moveName === 'Shadow Claw' && (
            <div className="relative w-32 h-32 flex items-center justify-center">
              <div 
                className="absolute w-28 h-20 border-b-4 border-purple-600 shadow-[0_0_20px_#a855f7]"
                style={{ animation: 'shadowclaw-swipe-vfx 0.5s cubic-bezier(0.1, 1, 0.2, 1) forwards' }}
              />
              <span className="text-3xl text-purple-400 z-10">🐾🔮</span>
            </div>
          )}

          {/* 33. METEOR MASH */}
          {vfx.moveName === 'Meteor Mash' && (
            <div className="relative w-36 h-36 flex items-center justify-center">
              <div 
                className="absolute w-16 h-16 bg-gradient-to-br from-slate-400 to-blue-900 rounded-full shadow-[0_0_30px_#3b82f6] flex items-center justify-center"
                style={{ animation: 'meteormash-fist 0.65s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards' }}
              >
                <span className="text-xl">👊☄️</span>
              </div>
              <div className="absolute w-24 h-24 rounded-full bg-blue-400/25 blur-lg animate-ping" />
            </div>
          )}

          {/* 34. HYPER VOICE */}
          {vfx.moveName === 'Hyper Voice' && (
            <div className="relative w-36 h-36 flex items-center justify-center">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="absolute border-4 border-sky-300 rounded-full"
                  style={{
                    width: '120px',
                    height: '120px',
                    animation: `hypervoice-ripple 0.6s ease-out ${i * 0.15}s forwards`
                  }}
                />
              ))}
              <span className="text-4xl text-sky-200 drop-shadow-[0_0_10px_#38bdf8] animate-bounce">📢🔊</span>
            </div>
          )}

          {/* 35. BITTER BLADE */}
          {vfx.moveName === 'Bitter Blade' && (
            <div className="relative w-36 h-36 flex items-center justify-center">
              {[
                { rot: '-45deg', delay: '0s' },
                { rot: '45deg', delay: '0.12s' }
              ].map((slash, sIdx) => (
                <div
                  key={sIdx}
                  className="absolute w-28 h-5 bg-gradient-to-r from-red-600 via-orange-500 to-yellow-300 rounded shadow-[0_0_20px_#ef4444]"
                  style={{
                    transform: `rotate(${slash.rot})`,
                    animation: `bitterblade-cross 0.55s ease-out ${slash.delay} forwards`
                  }}
                />
              ))}
              <span className="text-3xl z-10 drop-shadow-[0_0_12px_#ef4444]">🔥⚔️</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
