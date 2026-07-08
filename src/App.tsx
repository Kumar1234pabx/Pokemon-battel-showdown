import React, { useState, useEffect } from 'react';
import { PokemonGame } from './components/PokemonGame';
import { AdminTerminal } from './components/AdminTerminal';
import { EntryStation } from './components/EntryStation';
import { Dashboard } from './components/Dashboard';
import { QRCodeGen } from './components/QRCodeGen';
import { gameAudio } from './utils/audio';
import { Delegate, Attendance } from './types';
import { 
  Gamepad2, Swords, Award, Volume2, BookOpen, Sparkles, 
  ShieldAlert, Users, QrCode, LogOut, Key, Lock, Building2, ClipboardList, Info, HelpCircle
} from 'lucide-react';

export default function App() {
  const [portal, setPortal] = useState<'game' | 'admin' | 'delegate' | 'station' | 'qrcode'>(() => {
    // Read from URL query param if present
    const params = new URLSearchParams(window.location.search);
    const portalParam = params.get('portal');
    if (portalParam === 'admin' || portalParam === 'delegate' || portalParam === 'station' || portalParam === 'qrcode') {
      return portalParam;
    }
    return 'game';
  });

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

  // Admin authentication state
  const [adminPasscode, setAdminPasscode] = useState('admin123');
  const [adminAuthenticated, setAdminAuthenticated] = useState(() => {
    return localStorage.getItem('spsmun_admin_auth') === 'true';
  });

  // Station authentication state
  const [stationPasscode, setStationPasscode] = useState('station123');
  const [stationAuthenticated, setStationAuthenticated] = useState(() => {
    return localStorage.getItem('spsmun_station_auth') === 'true';
  });

  // Delegate login state
  const [delegatePhone, setDelegatePhone] = useState('');
  const [delegateName, setDelegateName] = useState('');
  const [loggedInDelegate, setLoggedInDelegate] = useState<Delegate | null>(() => {
    const cached = localStorage.getItem('spsmun_delegate_user');
    return cached ? JSON.parse(cached) : null;
  });
  const [delegateRooms, setDelegateRooms] = useState<string[]>([]);
  const [delegateAttendance, setDelegateAttendance] = useState<Attendance>({});
  const [delegateToday, setDelegateToday] = useState<number>(1);
  const [delegateAgenda, setDelegateAgenda] = useState<string>('');
  const [delegateLoginError, setDelegateLoginError] = useState('');
  const [delegateLoggingIn, setDelegateLoggingIn] = useState(false);

  // PRESS START blinking effect
  useEffect(() => {
    const interval = setInterval(() => {
      setIsBlinking(b => !b);
    }, 600);
    return () => clearInterval(interval);
  }, []);

  // Sync delegate session rooms/attendance on load if cached
  useEffect(() => {
    if (loggedInDelegate) {
      fetchDelegateDetails(loggedInDelegate.phone, loggedInDelegate.name);
    }
  }, []);

  const fetchDelegateDetails = async (phone: string, name: string) => {
    try {
      const response = await fetch(`/api/proxy?action=lookup&phone=${phone}&name=${name}`);
      const data = await response.json();
      if (data.ok) {
        setDelegateRooms(data.rooms || []);
        setDelegateAttendance(data.attendance || {});
        setDelegateToday(data.today || 1);
        setDelegateAgenda(data.agenda || '');
      }
    } catch (err) {
      console.error("Error updating delegate data:", err);
    }
  };

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

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPasscode.trim()) return;
    gameAudio.playHeal();
    setAdminAuthenticated(true);
    localStorage.setItem('spsmun_admin_auth', 'true');
  };

  const handleAdminLogout = () => {
    gameAudio.playFaint();
    setAdminAuthenticated(false);
    localStorage.removeItem('spsmun_admin_auth');
  };

  const handleStationLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stationPasscode.trim()) return;
    gameAudio.playHeal();
    setStationAuthenticated(true);
    localStorage.setItem('spsmun_station_auth', 'true');
  };

  const handleStationLogout = () => {
    gameAudio.playFaint();
    setStationAuthenticated(false);
    localStorage.removeItem('spsmun_station_auth');
  };

  const handleDelegateLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!delegateName.trim() || !delegatePhone.trim()) {
      setDelegateLoginError("Please enter both Name and Phone number.");
      return;
    }

    setDelegateLoggingIn(true);
    setDelegateLoginError('');

    try {
      const response = await fetch(`/api/proxy?action=lookup&phone=${delegatePhone}&name=${delegateName}`);
      const data = await response.json();
      if (data.ok && data.delegate) {
        gameAudio.playHeal();
        setLoggedInDelegate(data.delegate);
        setDelegateRooms(data.rooms || []);
        setDelegateAttendance(data.attendance || {});
        setDelegateToday(data.today || 1);
        setDelegateAgenda(data.agenda || '');
        localStorage.setItem('spsmun_delegate_user', JSON.stringify(data.delegate));
      } else {
        gameAudio.playFaint();
        setDelegateLoginError(data.error || "Credentials do not match the registration records.");
      }
    } catch (err) {
      gameAudio.playFaint();
      setDelegateLoginError("Failed to connect to authentication servers.");
    } finally {
      setDelegateLoggingIn(false);
    }
  };

  const handleDelegateLogout = () => {
    gameAudio.playFaint();
    setLoggedInDelegate(null);
    localStorage.removeItem('spsmun_delegate_user');
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col justify-between selection:bg-amber-500/30 selection:text-white">
      
      {/* Upper Status Bar */}
      <header className="bg-slate-950 border-b border-amber-500/10 px-4 py-3 flex items-center justify-between shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-2.5">
          <Gamepad2 className="text-amber-500 animate-pulse" size={22} />
          <div>
            <h1 className="pokemon-logo-text-sm text-sm tracking-wider">
              POKÉMON ARENA CONSOLE
            </h1>
            <p className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">
              8-Bit Retro Simulation v3.0
            </p>
          </div>
        </div>

        {portal === 'game' && hasBooted && (
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
        
        {/* PORTAL A: RETRO GAME CONSOLE */}
        {portal === 'game' && (
          <>
            {!hasBooted ? (
              // Retro Startup Screen
              <div className="max-w-md w-full bg-slate-950 border-2 border-slate-800 rounded-3xl p-6 sm:p-8 text-center relative shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden">
                <div className="absolute -inset-y-10 -inset-x-20 bg-gradient-to-tr from-transparent via-white/[0.02] to-transparent rotate-12 pointer-events-none" />
                <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
                
                <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-full px-2.5 py-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  <span className="w-2 h-2 rounded-full bg-amber-500 absolute" />
                  <span className="text-[8px] font-mono text-amber-500 uppercase tracking-widest">SYSTEM READY</span>
                </div>

                <div className="mt-8 mb-10 flex flex-col items-center">
                  <div className="relative">
                    <Swords className="text-[#ffcc00] drop-shadow-[0_2px_0_#3b4cca] animate-bounce mb-3" size={48} />
                    <div className="absolute inset-0 bg-amber-500/10 blur-xl rounded-full" />
                  </div>
                  <h2 className="pokemon-logo-text text-4xl sm:text-5xl select-none leading-none scale-110">
                    POKÉMON
                  </h2>
                  <h3 className="pokemon-logo-text text-2xl sm:text-3xl tracking-wider mt-2 select-none brightness-110">
                    SHOWDOWN
                  </h3>
                  <div className="h-0.5 w-24 bg-gradient-to-r from-transparent via-amber-500/60 to-transparent mt-3.5" />
                  <p className="text-[9px] font-pressstart text-[#ffcc00] mt-2 tracking-widest uppercase scale-90 opacity-90">
                    ARENA CONSOLE
                  </p>
                </div>

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

                <button
                  onClick={handleBoot}
                  className="group w-full bg-gradient-to-b from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 font-pressstart text-[10px] py-4 rounded-2xl shadow-[0_0_20px_rgba(251,191,36,0.3)] hover:shadow-[0_0_30px_rgba(251,191,36,0.55)] transition-all flex items-center justify-center gap-2 border-2 border-[#3b4cca]"
                >
                  <span className={isBlinking ? 'opacity-100' : 'opacity-40'}>
                    PRESS START
                  </span>
                  <Sparkles className="animate-spin text-slate-950 group-hover:scale-110 transition-transform" size={14} />
                </button>

                <div className="mt-6 flex justify-center gap-4 text-[10px] font-mono text-slate-500">
                  <span className="flex items-center gap-1">⚔️ Campaign Mode</span>
                  <span>·</span>
                  <span className="flex items-center gap-1">👥 Local Multiplayer</span>
                </div>
              </div>
            ) : (
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
          </>
        )}

        {/* PORTAL B: ADMIN TERMINAL */}
        {portal === 'admin' && (
          <div className="w-full max-w-5xl animate-fade">
            {!adminAuthenticated ? (
              <div className="max-w-md mx-auto bg-slate-950 border-2 border-slate-800 rounded-3xl p-6 sm:p-8 shadow-[0_0_40px_rgba(0,0,0,0.8)]">
                <div className="text-center mb-6">
                  <div className="inline-flex bg-amber-500/10 p-3 rounded-2xl border border-amber-500/20 text-amber-500 mb-2.5">
                    <Lock size={28} />
                  </div>
                  <h2 className="gold-text text-xl font-cinzel">Admin Password Security</h2>
                  <p className="text-xs text-slate-400 mt-1">Authorized access ONLY. Enter the admin passcode to config Google Sheets integration and sync game match scores.</p>
                </div>

                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-mono text-amber-500 uppercase tracking-wider mb-1.5">
                      Enter Admin Passcode
                    </label>
                    <input
                      type="password"
                      value={adminPasscode}
                      onChange={e => setAdminPasscode(e.target.value)}
                      placeholder="e.g. admin123"
                      className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500 focus:outline-none rounded-xl px-4 py-2.5 text-sm text-slate-100 font-mono"
                    />
                    <div className="text-[10px] text-slate-500 mt-1.5 font-mono flex items-center gap-1">
                      <Info size={11} /> Hint: Enter <span className="text-amber-400 font-bold bg-amber-500/10 px-1 rounded">admin123</span> or click below to authorize.
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold py-2.5 rounded-xl transition-all font-mono text-xs uppercase"
                  >
                    Authenticate Admin
                  </button>
                </form>
              </div>
            ) : (
              <AdminTerminal pass={adminPasscode} onLogout={handleAdminLogout} />
            )}
          </div>
        )}

        {/* PORTAL C: DELEGATE PORTAL */}
        {portal === 'delegate' && (
          <div className="w-full max-w-5xl animate-fade">
            {!loggedInDelegate ? (
              <div className="max-w-md mx-auto bg-slate-950 border-2 border-slate-800 rounded-3xl p-6 sm:p-8 shadow-[0_0_40px_rgba(0,0,0,0.8)]">
                <div className="text-center mb-6">
                  <div className="inline-flex bg-emerald-500/10 p-3 rounded-2xl border border-emerald-500/20 text-emerald-400 mb-2.5">
                    <Users size={28} />
                  </div>
                  <h2 className="gold-text text-xl font-cinzel">Delegate Credential Login</h2>
                  <p className="text-xs text-slate-400 mt-1">Scan your ID card or input your registered name and mobile number to enter your official delegate panel.</p>
                </div>

                <form onSubmit={handleDelegateLogin} className="space-y-4">
                  {delegateLoginError && (
                    <div className="p-3 text-xs border border-rose-900 bg-rose-950/20 text-rose-300 rounded-xl leading-relaxed">
                      ⚠️ {delegateLoginError}
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] font-mono text-amber-500 uppercase tracking-wider mb-1.5">
                      Your Full Name
                    </label>
                    <input
                      type="text"
                      value={delegateName}
                      onChange={e => setDelegateName(e.target.value)}
                      placeholder="e.g. Sathya Narayanan"
                      className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500 focus:outline-none rounded-xl px-4 py-2.5 text-sm text-slate-100 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-amber-500 uppercase tracking-wider mb-1.5">
                      Registered Mobile (10-Digit)
                    </label>
                    <input
                      type="text"
                      value={delegatePhone}
                      onChange={e => setDelegatePhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="e.g. 9876543210"
                      className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500 focus:outline-none rounded-xl px-4 py-2.5 text-sm text-slate-100 font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={delegateLoggingIn}
                    className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold py-2.5 rounded-xl transition-all font-mono text-xs uppercase disabled:opacity-50"
                  >
                    {delegateLoggingIn ? "Looking up registration..." : "Verify Delegate ID"}
                  </button>

                  <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3.5 space-y-2 text-[10px] text-slate-400 leading-relaxed font-mono">
                    <span className="font-bold text-amber-400 flex items-center gap-1 uppercase text-[9px] tracking-wider mb-1">
                      <HelpCircle size={11} /> Registered Mock Accounts for testing:
                    </span>
                    <div className="flex justify-between border-b border-slate-800/40 pb-1">
                      <span>👤 Sathya Narayanan</span>
                      <span className="text-emerald-400">9876543210</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800/40 pb-1">
                      <span>👤 Tobi Madara</span>
                      <span className="text-emerald-400">9999988888</span>
                    </div>
                    <div className="flex justify-between">
                      <span>👤 Kunal Sharma</span>
                      <span className="text-emerald-400">9812345678</span>
                    </div>
                  </div>
                </form>
              </div>
            ) : (
              <Dashboard 
                delegate={loggedInDelegate} 
                initialRooms={delegateRooms} 
                initialAttendance={delegateAttendance} 
                initialToday={delegateToday} 
                initialAgenda={delegateAgenda} 
                onLogout={handleDelegateLogout} 
              />
            )}
          </div>
        )}

        {/* PORTAL D: ENTRY STATION CHECK-IN */}
        {portal === 'station' && (
          <div className="w-full animate-fade">
            {!stationAuthenticated ? (
              <div className="max-w-md mx-auto bg-slate-950 border-2 border-slate-800 rounded-3xl p-6 sm:p-8 shadow-[0_0_40px_rgba(0,0,0,0.8)]">
                <div className="text-center mb-6">
                  <div className="inline-flex bg-amber-500/10 p-3 rounded-2xl border border-amber-500/20 text-amber-500 mb-2.5">
                    <Lock size={28} />
                  </div>
                  <h2 className="gold-text text-xl font-cinzel">Station Login</h2>
                  <p className="text-xs text-slate-400 mt-1">Authorized check-in/out station staff only. Enter station password to authorize.</p>
                </div>

                <form onSubmit={handleStationLogin} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-mono text-amber-500 uppercase tracking-wider mb-1.5">
                      Enter Station Passcode
                    </label>
                    <input
                      type="password"
                      value={stationPasscode}
                      onChange={e => setStationPasscode(e.target.value)}
                      placeholder="e.g. station123"
                      className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500 focus:outline-none rounded-xl px-4 py-2.5 text-sm text-slate-100 font-mono"
                    />
                    <div className="text-[10px] text-slate-500 mt-1.5 font-mono flex items-center gap-1">
                      <Info size={11} /> Hint: Enter <span className="text-amber-400 font-bold bg-amber-500/10 px-1 rounded">station123</span> or click below to authorize.
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold py-2.5 rounded-xl transition-all font-mono text-xs uppercase"
                  >
                    Login Station
                  </button>
                </form>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="max-w-md mx-auto flex justify-end">
                  <button 
                    onClick={handleStationLogout} 
                    className="text-xs font-mono text-rose-400 hover:text-rose-300 flex items-center gap-1 bg-rose-550/10 border border-rose-900/30 rounded-xl px-3 py-1.5 transition-all"
                  >
                    <LogOut size={12} /> Log Out Station
                  </button>
                </div>
                <EntryStation pass={stationPasscode} />
              </div>
            )}
          </div>
        )}

        {/* PORTAL E: QR BADGE BUILDER */}
        {portal === 'qrcode' && (
          <div className="w-full max-w-3xl animate-fade">
            <QRCodeGen />
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
