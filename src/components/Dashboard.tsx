import React, { useState, useEffect } from 'react';
import { Delegate, Announcement, RoomAllotment, Attendance } from '../types';
import { POKEMON_ROSTER } from '../data';
import { PokemonGame } from './PokemonGame';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, MapPin, User, LogOut, ExternalLink, Calendar, CheckCircle2, XCircle } from 'lucide-react';
import { gameAudio } from '../utils/audio';
import { esc, DAY_LABELS } from '../utils/helpers';

interface DashboardProps {
  delegate: Delegate;
  initialRooms: string[];
  initialAttendance: Attendance;
  initialToday: number;
  initialAgenda: string;
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  delegate,
  initialRooms,
  initialAttendance,
  initialToday,
  initialAgenda,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'ann' | 'map' | 'att' | 'game'>('ann');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [rooms, setRooms] = useState<string[]>(initialRooms);
  const [attendance, setAttendance] = useState<Attendance>(initialAttendance);
  const [agenda, setAgenda] = useState<string>(initialAgenda);
  const [selectedMapDay, setSelectedMapDay] = useState<number>(initialToday >= 1 ? initialToday : 1);
  const [loadingAnns, setLoadingAnns] = useState(false);

  // Poll for live data periodically
  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 4000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const response = await fetch(`/api/proxy?action=lookup&phone=${delegate.phone}&name=${delegate.name}`);
      const data = await response.json();
      if (data.ok) {
        if (data.rooms) setRooms(data.rooms);
        if (data.attendance) setAttendance(data.attendance);
        if (data.agenda) setAgenda(data.agenda);
      }
    } catch (e) {}

    try {
      const response = await fetch(`/api/proxy?action=announcements&phone=${delegate.phone}`);
      const data = await response.json();
      if (data.ok && data.announcements) {
        setAnnouncements(data.announcements);
      }
    } catch (e) {}
  };

  const handleVote = async (pollId: string, option: string) => {
    gameAudio.playSelect();
    try {
      const response = await fetch('/api/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'vote', pollId, option, phone: delegate.phone })
      });
      const data = await response.json();
      if (data.ok) {
        loadData();
      }
    } catch (e) {}
  };

  const getActiveRoom = () => {
    return rooms[selectedMapDay - 1] || "TBA";
  };

  return (
    <div className="flex flex-col gap-6 animate-fade">
      {/* Header Profile Summary */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-6 bg-gradient-to-br from-emerald-950/80 via-slate-950/90 to-slate-950 border border-gold/30 shadow-[0_15px_45px_rgba(0,0,0,0.5)] flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <div className="text-3xl font-extrabold gold-text font-cinzel">{esc(delegate.name)}</div>
          <div className="text-base text-gold-light mt-1.5 font-cinzel tracking-wider">
            {esc(delegate.committee)} <span className="text-slate-500">→</span> {esc(delegate.portfolio)}
          </div>
          <div className="text-xs text-slate-400 mt-1 font-mono">
            Class {esc(delegate.class)} · Section {esc(delegate.section)} · +91 {esc(delegate.phone)}
          </div>
        </div>
        <div className="flex gap-2">
          <span className="nav-pill text-[11px] bg-slate-950/60">Delegate Portal</span>
          <button onClick={onLogout} className="text-rose-400 hover:text-rose-300 p-2 rounded-full hover:bg-rose-500/10 transition-colors">
            <LogOut size={18} />
          </button>
        </div>
      </motion.div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
        {[
          { id: 'ann', label: 'Announcements', icon: Bell },
          { id: 'map', label: 'Campus Map', icon: MapPin },
          { id: 'att', label: 'Attendance', icon: Calendar },
          { id: 'game', label: 'Pokémon Game', icon: User }
        ].map(t => {
          const active = activeTab === t.id;
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => { gameAudio.playSelect(); setActiveTab(t.id as any); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-cinzel text-xs uppercase tracking-wider transition-all ${
                active
                  ? 'bg-gradient-to-b from-amber-400 to-gold text-slate-950 border-transparent font-bold'
                  : 'bg-slate-950/30 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              <Icon size={14} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Panelled Tabs views */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.2 }}
          className="min-h-[300px]"
        >
          {/* TAB 2: ANNOUNCEMENTS */}
          {activeTab === 'ann' && (
            <div className="flex flex-col gap-4">
              <h2 className="text-2xl font-bold font-cinzel gold-text">Live Board</h2>
              <div className="flex flex-col gap-3">
                {announcements.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 italic bg-slate-950/20 border border-slate-900 rounded-2xl">
                    No announcements have been posted yet. Enjoy the MUN 3.0!
                  </div>
                ) : (
                  announcements.map(a => {
                    const isPoll = a.type === 'Poll';
                    return (
                      <div key={a.id} className="rounded-xl p-4 bg-slate-950/40 border border-slate-800/80 shadow-md">
                        <div className="flex justify-between items-center mb-3">
                          <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${
                            a.type === 'Update' ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300' :
                            a.type === 'Agenda' ? 'border-amber-500/40 bg-amber-500/10 text-amber-300' :
                            'border-rose-500/40 bg-rose-500/10 text-rose-300'
                          }`}>
                            {esc(a.type)}
                          </span>
                          <span className="text-xs text-slate-500 font-mono">{esc(a.ts)}</span>
                        </div>
                        {a.title && <div className="text-lg font-bold text-white mb-1.5 font-cinzel">{esc(a.title)}</div>}
                        {a.body && <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{esc(a.body)}</p>}

                        {/* Interactive Poll Rendering */}
                        {isPoll && a.votes && (
                          <div className="mt-4 flex flex-col gap-2">
                            {a.votes.map(v => {
                              const total = a.total || 0;
                              const pct = total ? Math.round((v.count / total) * 100) : 0;
                              return (
                                <button
                                  key={v.text}
                                  onClick={() => handleVote(a.id, v.text)}
                                  className="relative overflow-hidden w-full text-left p-3 rounded-lg border border-slate-800 bg-slate-950/60 hover:border-gold/50 transition-colors"
                                >
                                  {/* Percentage fill layer */}
                                  <div className="absolute inset-y-0 left-0 bg-gold/10 transition-all duration-300" style={{ width: `${pct}%` }} />
                                  <div className="relative z-10 flex justify-between text-sm font-semibold">
                                    <span className="text-slate-200">{esc(v.text)}</span>
                                    <span className="text-gold font-mono">{v.count} votes ({pct}%)</span>
                                  </div>
                                </button>
                              );
                            })}
                            <div className="text-[10.5px] text-slate-500 font-mono mt-1 text-center">
                              Total Voters: {a.total || 0} delegates · Click on an option to submit/change your vote
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 3: CAMPUS MAP */}
          {activeTab === 'map' && (
            <div className="flex flex-col gap-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold font-cinzel gold-text">SPS Campus Navigation</h2>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Select a conference day below to locate your allotted committee room.
                </p>
                {/* Day selector pills */}
                <div className="flex gap-2 justify-center mt-4">
                  {[1, 2, 3].map(d => (
                    <button
                      key={d}
                      onClick={() => { gameAudio.playSelect(); setSelectedMapDay(d); }}
                      className={`px-4 py-2 rounded-full border font-cinzel text-xs transition-all ${
                        selectedMapDay === d
                          ? 'bg-gradient-to-b from-amber-400 to-gold text-slate-950 border-transparent font-bold shadow-md'
                          : 'bg-slate-950/40 text-slate-400 border-slate-800'
                      }`}
                    >
                      Day {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic room alert card */}
              <div className="p-5 rounded-2xl border border-gold/20 bg-slate-950/40 text-center flex flex-col items-center gap-2">
                <div className="text-slate-400 uppercase tracking-widest text-[10px] font-mono">My Allotted Venue</div>
                <div className="text-2xl font-extrabold text-white font-cinzel">{esc(getActiveRoom())}</div>
                <p className="text-xs text-slate-400 max-w-md mt-1">
                  Your committee <span className="text-gold">{esc(delegate.committee)}</span> meets at the above room on {esc(DAY_LABELS[selectedMapDay - 1])}.
                </p>
              </div>

              {/* Isometric / Schematic Campus Map Drawing */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col items-center">
                <div className="w-full max-w-lg">
                  <svg viewBox="0 0 400 300" className="w-full h-auto drop-shadow-lg">
                    {/* Background grid */}
                    <defs>
                      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(212,175,55,0.05)" strokeWidth="1"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" rx="10"/>

                    {/* Main School Building */}
                    <rect x="50" y="40" width="300" height="110" fill="rgba(17,71,52,0.3)" stroke="rgba(212,175,55,0.3)" strokeWidth="2" rx="8" />
                    <text x="200" y="32" fill="var(--gold-light)" fontSize="10" fontFamily="Cinzel" textAnchor="middle">Main Institutional Block</text>

                    {/* Auditorum Block */}
                    <rect x="50" y="190" width="120" height="80" fill="rgba(232,92,154,0.1)" stroke="rgba(232,92,154,0.4)" strokeWidth="1.5" rx="6" />
                    <text x="110" y="182" fill="var(--pink-soft)" fontSize="9" fontFamily="Cinzel" textAnchor="middle">Auditorium Hall</text>

                    {/* Food Lawn / Exhibition Block */}
                    <rect x="230" y="190" width="120" height="80" fill="rgba(212,175,55,0.08)" stroke="rgba(212,175,55,0.3)" strokeWidth="1.5" rx="6" />
                    <text x="290" y="182" fill="var(--gold-light)" fontSize="9" fontFamily="Cinzel" textAnchor="middle">Exhibition &amp; Lawn</text>

                    {/* Highlighted Marker for active room */}
                    {getActiveRoom() === 'Auditorium' ? (
                      <g className="animate-pulse">
                        <circle cx="110" cy="230" r="14" fill="rgba(232,92,154,0.3)" />
                        <circle cx="110" cy="230" r="6" fill="#E85C9A" />
                      </g>
                    ) : getActiveRoom().includes('Room 101') ? (
                      <g className="animate-pulse">
                        <circle cx="100" cy="95" r="14" fill="rgba(212,175,55,0.3)" />
                        <circle cx="100" cy="95" r="6" fill="var(--gold)" />
                      </g>
                    ) : getActiveRoom().includes('Room 202') || getActiveRoom().includes('Room 204') || getActiveRoom().includes('Room 205') ? (
                      <g className="animate-pulse">
                        <circle cx="200" cy="95" r="14" fill="rgba(212,175,55,0.3)" />
                        <circle cx="200" cy="95" r="6" fill="var(--gold)" />
                      </g>
                    ) : getActiveRoom().includes('Room 303') ? (
                      <g className="animate-pulse">
                        <circle cx="300" cy="95" r="14" fill="rgba(212,175,55,0.3)" />
                        <circle cx="300" cy="95" r="6" fill="var(--gold)" />
                      </g>
                    ) : (
                      <g className="animate-pulse">
                        <circle cx="290" cy="230" r="14" fill="rgba(212,175,55,0.3)" />
                        <circle cx="290" cy="230" r="6" fill="var(--gold)" />
                      </g>
                    )}

                    {/* Legend / Key */}
                    <text x="200" y="140" fill="var(--text-dim)" fontSize="8" textAnchor="middle">Room 101 · Room 102 · Room 202 · Room 204 · Room 303</text>
                  </svg>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CHECK-IN / OUT ATTENDANCE */}
          {activeTab === 'att' && (
            <div className="flex flex-col gap-4">
              <h2 className="text-2xl font-bold font-cinzel gold-text">Active Entry Status</h2>
              <p className="text-xs text-slate-400">
                Live attendance record scanned at the main entry lobby by school Technical Staff.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map(d => {
                  const inTime = attendance[`Day ${d} In`];
                  const outTime = attendance[`Day ${d} Out`];
                  const active = d === initialToday;
                  return (
                    <div key={d} className={`rounded-xl p-4 bg-slate-950/40 border ${active ? 'border-pink/60 shadow-[0_0_15px_rgba(232,92,154,0.15)]' : 'border-slate-800'} flex flex-col gap-3`}>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-white text-sm font-cinzel">{esc(DAY_LABELS[d - 1])}</span>
                        {active && <span className="bg-pink text-[#2a0014] text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Today</span>}
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 flex items-center gap-1.5"><CheckCircle2 size={12} className="text-emerald-400" /> Check In</span>
                        <span className={inTime ? 'text-emerald-300 font-bold' : 'text-slate-500'}>{inTime ? esc(inTime) : '—'}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 flex items-center gap-1.5"><XCircle size={12} className="text-amber-500" /> Check Out</span>
                        <span className={outTime ? 'text-amber-300 font-bold' : 'text-slate-500'}>{outTime ? esc(outTime) : '—'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: GAME ENGINE */}
          {activeTab === 'game' && (
            <div>
              <PokemonGame
                delegatePhone={delegate.phone}
                delegateName={delegate.name}
                delegateCommittee={delegate.committee}
                apiUrl=""
              />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
