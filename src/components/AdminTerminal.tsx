import React, { useState, useEffect } from 'react';
import { Announcement, Delegate, RoomAllotment } from '../types';
import { gameAudio } from '../utils/audio';
import { 
  PlusCircle, Search, Trash2, Home, CheckCircle2, XCircle, Users, 
  FileSpreadsheet, Database, RefreshCw, Link2, ShieldCheck, Gift, Award, Gamepad2, AlertCircle
} from 'lucide-react';
import { esc } from '../utils/helpers';
import { googleSignIn, logout as firebaseLogout } from '../utils/firebase_auth';

interface AdminTerminalProps {
  pass: string;
  onLogout: () => void;
}

export const AdminTerminal: React.FC<AdminTerminalProps> = ({ pass, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'checkin' | 'ann' | 'rooms' | 'sheets'>('checkin');
  
  // Stats state
  const [stats, setStats] = useState({
    today: 1,
    checkedInToday: 0,
    checkedOutToday: 0,
    totalDelegates: 0
  });

  // Search delegates state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setLoadingSearch] = useState(false);

  // Announcement state
  const [annType, setAnnType] = useState<'Update' | 'Agenda' | 'Poll'>('Update');
  const [annTitle, setAnnTitle] = useState('');
  const [annBody, setAnnBody] = useState('');
  const [pollOptions, setPollOptions] = useState('');
  const [liveAnnouncements, setLiveAnnouncements] = useState<Announcement[]>([]);
  const [posting, setPosting] = useState(false);

  // Room Allotment State
  const [roomRows, setRoomRows] = useState<RoomAllotment[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);

  // Google Sheets Sync State
  const [sheetsConfig, setSheetsConfig] = useState<any>({
    spreadsheetId: "",
    spreadsheetUrl: "",
    isLinked: false,
    isAuthorized: false,
    adminEmail: "",
    lastSynced: "",
    pendingSyncCount: 0,
    totalBattles: 0,
    history: []
  });
  const [sheetsLoading, setSheetsLoading] = useState(false);
  const [syncingSheets, setSyncingSheets] = useState(false);
  const [customSpreadsheetId, setCustomSpreadsheetId] = useState('');
  const [sheetsError, setSheetsError] = useState('');
  const [sheetsSuccess, setSheetsSuccess] = useState('');

  // Trainer Battle Search State
  const [trainerSearchQuery, setTrainerSearchQuery] = useState('');
  const [trainerStats, setTrainerStats] = useState<any | null>(null);
  const [trainerHistory, setTrainerHistory] = useState<any[]>([]);
  const [trainerSearching, setTrainerSearching] = useState(false);

  // Load stats and announcements on boot
  useEffect(() => {
    loadStats();
    if (activeTab === 'ann') loadLiveAnnouncements();
    if (activeTab === 'rooms') loadRoomAllotments();
    if (activeTab === 'sheets') loadSheetsConfig();
  }, [activeTab]);

  const loadStats = async () => {
    try {
      const response = await fetch(`/api/proxy?action=stats&pass=${pass}`);
      const data = await response.json();
      if (data.ok) {
        setStats({
          today: data.today || 1,
          checkedInToday: data.checkedInToday || 0,
          checkedOutToday: data.checkedOutToday || 0,
          totalDelegates: data.totalDelegates || 0
        });
      }
    } catch (e) {}
  };

  const loadLiveAnnouncements = async () => {
    try {
      const response = await fetch('/api/proxy?action=announcements');
      const data = await response.json();
      if (data.ok && data.announcements) {
        setLiveAnnouncements(data.announcements);
      }
    } catch (e) {}
  };

  const loadRoomAllotments = async () => {
    setLoadingRooms(true);
    try {
      const response = await fetch(`/api/proxy?action=getcommittees&pass=${pass}`);
      const data = await response.json();
      if (data.ok && data.committees) {
        setRoomRows(data.committees);
      }
    } catch (e) {
    } finally {
      setLoadingRooms(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoadingSearch(true);
    try {
      const response = await fetch(`/api/proxy?action=adminsearch&q=${searchQuery}&pass=${pass}`);
      const data = await response.json();
      if (data.ok && data.results) {
        setSearchResults(data.results);
      }
    } catch (e) {
    } finally {
      setLoadingSearch(false);
    }
  };

  const handlePostAnn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (annType === 'Poll' && !annTitle) {
      alert("Please enter the poll question in the Title field.");
      return;
    }
    if (!annTitle && !annBody) {
      alert("Please provide at least a title or a message.");
      return;
    }

    setPosting(true);
    try {
      const optStr = annType === 'Poll' ? pollOptions.split('\n').map(x => x.trim()).filter(Boolean).join('|') : '';
      const response = await fetch('/api/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'postann',
          pass,
          type: annType,
          title: annTitle,
          body: annBody,
          options: optStr
        })
      });
      const data = await response.json();
      if (data.ok) {
        setAnnTitle('');
        setAnnBody('');
        setPollOptions('');
        loadLiveAnnouncements();
        loadStats();
      }
    } catch (e) {
    } finally {
      setPosting(false);
    }
  };

  const handleDeleteAnn = async (id: string) => {
    gameAudio.playSelect();
    try {
      const response = await fetch(`/api/proxy?action=delann&pass=${pass}&id=${id}`);
      const data = await response.json();
      if (data.ok) {
        loadLiveAnnouncements();
      }
    } catch (e) {}
  };

  const handleSaveRoom = async (committee: string, day: number, room: string) => {
    try {
      await fetch('/api/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'setroom',
          pass,
          committee,
          day,
          room
        })
      });
    } catch (e) {}
  };

  // Google Sheets Management Helpers
  const loadSheetsConfig = async () => {
    setSheetsLoading(true);
    try {
      const response = await fetch('/api/sheets/config');
      const data = await response.json();
      if (data.ok) {
        setSheetsConfig(data);
        if (data.spreadsheetId) {
          setCustomSpreadsheetId(data.spreadsheetId);
        }
      }
    } catch (err: any) {
      console.error("Error loading sheets config:", err);
    } finally {
      setSheetsLoading(false);
    }
  };

  const handleLinkGoogleSheets = async (existingId?: string) => {
    setSheetsError('');
    setSheetsSuccess('');
    setSheetsLoading(true);
    gameAudio.playSelect();

    try {
      // 1. Authenticate with Google pop-up
      const loginResult = await googleSignIn();
      if (!loginResult) {
        throw new Error("Could not log in with Google.");
      }

      // 2. Register with backend
      const response = await fetch('/api/sheets/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken: loginResult.accessToken,
          email: loginResult.user.email,
          spreadsheetId: existingId || ''
        })
      });

      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Failed to configure Google Spreadsheet.");
      }

      setSheetsSuccess(existingId 
        ? `Successfully linked and authenticated Spreadsheet: ${data.spreadsheetId}`
        : `Successfully created brand-new Google Sheet: "SPSMUN 2026 - Pokémon Battle Records"!`
      );
      
      // Refresh config
      await loadSheetsConfig();

    } catch (err: any) {
      setSheetsError(err.message || "An error occurred during Sheets integration.");
      console.error(err);
    } finally {
      setSheetsLoading(false);
    }
  };

  const handleManualSync = async () => {
    setSheetsError('');
    setSheetsSuccess('');
    setSyncingSheets(true);
    gameAudio.playSelect();

    try {
      // Try with direct token, backend will error if token expired
      const response = await fetch('/api/sheets/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();
      if (response.status === 401) {
        // Token expired. Let's ask admin to sign in again to refresh
        setSheetsError("Google Authorization expired. Re-authenticating via popup...");
        const loginResult = await googleSignIn();
        if (loginResult) {
          // Retry sync with new token
          const retryRes = await fetch('/api/sheets/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accessToken: loginResult.accessToken })
          });
          const retryData = await retryRes.json();
          if (retryRes.ok && retryData.ok) {
            setSheetsSuccess(`Sync successful! Uploaded ${retryData.syncedCount} battles and updated Leaderboard.`);
          } else {
            throw new Error(retryData.error || "Retry sync failed.");
          }
        }
      } else if (!response.ok || !data.ok) {
        throw new Error(data.error || "Sync failed.");
      } else {
        setSheetsSuccess(`Sync successful! Uploaded ${data.syncedCount} pending battles and refreshed Leaderboard.`);
      }

      await loadSheetsConfig();
    } catch (err: any) {
      setSheetsError(err.message || "Sync failed.");
    } finally {
      setSyncingSheets(false);
    }
  };

  const handleDisconnectSheets = async () => {
    if (!confirm("Are you sure you want to disconnect Google Sheets? Live battles will be queued locally until reconnected.")) return;
    setSheetsError('');
    setSheetsSuccess('');
    gameAudio.playSelect();

    try {
      await fetch('/api/sheets/disconnect', { method: 'POST' });
      await firebaseLogout();
      setSheetsSuccess("Google Sheets disconnected successfully.");
      await loadSheetsConfig();
    } catch (err: any) {
      setSheetsError("Disconnect failed.");
    }
  };

  const handleTrainerSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trainerSearchQuery.trim()) return;
    setTrainerSearching(true);
    setTrainerStats(null);
    setTrainerHistory([]);
    gameAudio.playSelect();

    try {
      const res = await fetch(`/api/game/trainer-records?phone=${encodeURIComponent(trainerSearchQuery.trim())}`);
      const data = await res.json();
      if (data.ok) {
        setTrainerStats(data.stats);
        setTrainerHistory(data.history);
      } else {
        alert("Trainer ID not found. Verify phone number matches.");
      }
    } catch (err) {
      console.error(err);
      alert("Error searching trainer.");
    } finally {
      setTrainerSearching(false);
    }
  };

  const handleManualAction = async (phone: string, type: 'In' | 'Out', resultIdx: number) => {
    gameAudio.playSelect();
    const day = document.getElementById(`day-${resultIdx}`) as HTMLSelectElement;
    const selectedDay = day ? parseInt(day.value, 10) : stats.today;

    try {
      const response = await fetch('/api/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: type === 'In' ? 'checkin' : 'checkout',
          phone,
          day: selectedDay,
          by: 'Admin'
        })
      });
      const data = await response.json();
      if (data.ok) {
        // Refresh attendance column in local list representation
        const copy = [...searchResults];
        copy[resultIdx].attendance = data.attendance;
        setSearchResults(copy);
        loadStats();
      }
    } catch (e) {}
  };

  return (
    <div className="flex flex-col gap-6 animate-fade">
      {/* Top Banner Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Day', val: `Day ${stats.today}`, icon: Home },
          { label: 'Checked In Today', val: stats.checkedInToday, icon: CheckCircle2 },
          { label: 'Checked Out Today', val: stats.checkedOutToday, icon: XCircle },
          { label: 'Total Delegates', val: stats.totalDelegates, icon: Users }
        ].map((s, idx) => (
          <div key={idx} className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 text-center flex flex-col items-center">
            <s.icon size={20} className="text-gold-light mb-1" />
            <div className="text-3xl font-extrabold text-white font-cinzel">{s.val}</div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">{esc(s.label)}</div>
          </div>
        ))}
      </div>

      {/* Admin Nav */}
      <div className="flex gap-2 border-b border-slate-800 pb-2 overflow-x-auto whitespace-nowrap">
        {[
          { id: 'checkin', label: 'Check-in Desk' },
          { id: 'ann', label: 'Announcements' },
          { id: 'rooms', label: 'Room Allotments' },
          { id: 'sheets', label: '🏆 Battle Records & Sheets' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => { gameAudio.playSelect(); setActiveTab(t.id as any); }}
            className={`px-4 py-2 rounded-xl text-xs uppercase tracking-wider border font-cinzel ${
              activeTab === t.id
                ? 'bg-gradient-to-b from-amber-400 to-gold text-slate-950 border-transparent font-bold'
                : 'bg-slate-950/30 text-slate-400 border-slate-800 hover:border-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* PANEL 1: CHECK-IN DESK */}
      {activeTab === 'checkin' && (
        <div className="card">
          <h2 className="gold-text text-xl font-cinzel mb-2">Search &amp; Manage Delegates</h2>
          <p className="lead">Manual override desk. Search by name or registered phone number.</p>
          <div className="flex gap-2">
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Name or phone..."
              className="flex-1"
            />
            <button onClick={handleSearch} className="btn sm flex items-center gap-1.5" style={{ width: 'auto' }}>
              <Search size={14} /> Search
            </button>
          </div>

          <div className="flex flex-col gap-4 mt-6">
            {searchResults.map((d, rIdx) => (
              <div key={d.phone} className="p-4 rounded-xl border border-slate-800 bg-slate-950/20 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-white text-base font-cinzel">{esc(d.name)}</div>
                    <div className="text-xs text-gold-light mt-0.5">{esc(d.committee)} · {esc(d.portfolio)}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-1">
                      +91 {esc(d.phone)} · Class {esc(d.class)} {esc(d.section)}
                    </div>
                  </div>
                </div>

                {/* Day status columns */}
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map(dayNum => {
                    const inT = d.attendance[`Day ${dayNum} In`];
                    const outT = d.attendance[`Day ${dayNum} Out`];
                    return (
                      <div key={dayNum} className="bg-slate-950/60 p-2 rounded-lg text-[11px] font-mono">
                        <div className="text-slate-400 font-bold border-b border-slate-800 pb-1 mb-1">Day {dayNum}</div>
                        <div>In: <span className={inT ? 'text-emerald-400' : 'text-slate-600'}>{inT ? esc(inT) : '—'}</span></div>
                        <div>Out: <span className={outT ? 'text-amber-500' : 'text-slate-600'}>{outT ? esc(outT) : '—'}</span></div>
                      </div>
                    );
                  })}
                </div>

                {/* Admin Actions */}
                <div className="flex gap-2 items-center flex-wrap mt-2">
                  <select id={`day-${rIdx}`} className="text-xs max-w-[120px] bg-slate-950 py-1.5 px-2">
                    <option value="1">Day 1</option>
                    <option value="2">Day 2</option>
                    <option value="3">Day 3</option>
                  </select>
                  <button onClick={() => handleManualAction(d.phone, 'In', rIdx)} className="btn sm green flex-1 max-w-[140px] py-2">Check In</button>
                  <button onClick={() => handleManualAction(d.phone, 'Out', rIdx)} className="btn sm flex-1 max-w-[140px] py-2">Check Out</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PANEL 2: POST ANNOUNCEMENTS */}
      {activeTab === 'ann' && (
        <div className="flex flex-col gap-6">
          <form onSubmit={handlePostAnn} className="card flex flex-col gap-4">
            <h2 className="gold-text text-xl font-cinzel">Broadcast New Announcement</h2>
            <div className="grid grid-cols-3 gap-3">
              <select
                value={annType}
                onChange={e => setAnnType(e.target.value as any)}
                className="col-span-1 bg-slate-950"
              >
                <option value="Update">Update</option>
                <option value="Agenda">Agenda</option>
                <option value="Poll">Poll</option>
              </select>
              <input
                value={annTitle}
                onChange={e => setAnnTitle(e.target.value)}
                placeholder={annType === 'Poll' ? 'Question?' : 'Title (optional)'}
                className="col-span-2"
              />
            </div>
            <textarea
              value={annBody}
              onChange={e => setAnnBody(e.target.value)}
              placeholder="Announcement description / details..."
            />

            {annType === 'Poll' && (
              <div>
                <label className="fld">Poll Options (One per line)</label>
                <textarea
                  value={pollOptions}
                  onChange={e => setPollOptions(e.target.value)}
                  placeholder="Yes&#10;No&#10;Abstain"
                  className="h-20"
                />
              </div>
            )}

            <button type="submit" className="btn" disabled={posting}>
              Post Broadcast
            </button>
          </form>

          {/* Live stream */}
          <div className="card">
            <h2 className="gold-text text-lg font-cinzel mb-4">Current Broadcasts</h2>
            <div className="flex flex-col gap-3">
              {liveAnnouncements.map(a => (
                <div key={a.id} className="p-4 rounded-xl bg-slate-950/20 border border-slate-800 flex justify-between items-start gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-700 bg-slate-900 text-slate-300">{esc(a.type)}</span>
                      <span className="text-xs text-slate-500 font-mono">{esc(a.ts)}</span>
                    </div>
                    {a.title && <div className="text-white font-bold text-sm font-cinzel">{esc(a.title)}</div>}
                    {a.body && <p className="text-slate-400 text-xs mt-1 leading-relaxed">{esc(a.body)}</p>}
                  </div>
                  <button onClick={() => handleDeleteAnn(a.id)} className="text-rose-400 hover:text-rose-300 p-2 rounded-lg hover:bg-rose-500/10">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PANEL 3: ROOM ALLOTMENTS */}
      {activeTab === 'rooms' && (
        <div className="card">
          <h2 className="gold-text text-xl font-cinzel mb-2">Committee Rooms Setup</h2>
          <p className="lead">Updating a box will instantly save and sync that room allotment to all logged-in delegate screens.</p>
          <div className="flex flex-col gap-3">
            <div className="hidden md:grid grid-cols-4 gap-4 text-xs font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-800">
              <div>Committee</div>
              <div>Day 1 Venue</div>
              <div>Day 2 Venue</div>
              <div>Day 3 Venue</div>
            </div>

            {loadingRooms ? (
              <p className="text-center text-slate-500 py-6 text-sm">Loading listings...</p>
            ) : (
              roomRows.map(row => (
                <div key={row.committee} className="grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-4 items-center p-3 border-b border-slate-900/50">
                  <div className="text-white font-bold font-cinzel text-sm">{esc(row.committee)}</div>
                  {[0, 1, 2].map(idx => (
                    <input
                      key={idx}
                      defaultValue={row.rooms[idx] || ''}
                      placeholder={`Day ${idx + 1} room`}
                      className="bg-slate-950 py-1.5 text-xs text-slate-300 border-slate-800 focus:border-gold"
                      onBlur={e => handleSaveRoom(row.committee, idx + 1, e.target.value.trim())}
                    />
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* PANEL 4: GOOGLE SHEETS & BATTLE HISTORY */}
      {activeTab === 'sheets' && (
        <div className="flex flex-col gap-6">
          
          {/* Status Notifications */}
          {sheetsError && (
            <div className="p-4 rounded-xl border border-rose-900/50 bg-rose-950/20 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{sheetsError}</span>
            </div>
          )}
          {sheetsSuccess && (
            <div className="p-4 rounded-xl border border-emerald-900/50 bg-emerald-950/20 text-emerald-300 text-xs flex items-center gap-2">
              <ShieldCheck size={16} className="shrink-0" />
              <span>{sheetsSuccess}</span>
            </div>
          )}

          {/* Core Sheets Integration Status */}
          <div className="card">
            <div className="flex justify-between items-start gap-4 flex-wrap">
              <div>
                <h2 className="gold-text text-xl font-cinzel flex items-center gap-2">
                  <FileSpreadsheet className="text-gold-light" size={22} />
                  Google Sheets Battle Logging
                </h2>
                <p className="lead mt-1">Automatically log all online trainer matchups, win/loss records, daily games played, and reward coupons.</p>
              </div>
              <div className="flex gap-2">
                {sheetsConfig.isLinked && (
                  <button 
                    onClick={handleManualSync} 
                    disabled={syncingSheets || sheetsLoading} 
                    className="btn sm flex items-center gap-1.5 py-1.5 px-3 border border-emerald-500/30 hover:border-emerald-500/60 text-emerald-300"
                    style={{ width: 'auto' }}
                  >
                    <RefreshCw size={12} className={syncingSheets ? "animate-spin" : ""} />
                    {syncingSheets ? "Syncing..." : "Sync Now"}
                  </button>
                )}
                {sheetsConfig.isLinked && (
                  <button 
                    onClick={handleDisconnectSheets} 
                    className="text-rose-400 hover:text-rose-300 text-xs border border-rose-900/30 hover:border-rose-900/60 bg-rose-950/10 px-3 py-1.5 rounded-xl transition-all"
                  >
                    Unlink Sheet
                  </button>
                )}
              </div>
            </div>

            {/* Config State Display */}
            {sheetsConfig.isLinked ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 p-4 rounded-2xl border border-slate-800 bg-slate-950/30">
                <div className="flex flex-col gap-2">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Connected Spreadsheet</div>
                  <a 
                    href={sheetsConfig.spreadsheetUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-emerald-400 hover:text-emerald-300 font-bold text-sm flex items-center gap-1 break-all"
                  >
                    <Link2 size={14} className="shrink-0" />
                    SPSMUN 2026 - Battle Records
                  </a>
                  <div className="text-xs text-slate-400 truncate mt-1">ID: <span className="font-mono text-[10px]">{sheetsConfig.spreadsheetId}</span></div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-950/50 p-2.5 rounded-xl border border-slate-900 text-center">
                    <div className="text-[9px] text-slate-500 uppercase font-mono">Pending Sync</div>
                    <div className={`text-xl font-black mt-0.5 ${sheetsConfig.pendingSyncCount > 0 ? "text-amber-400" : "text-slate-400"}`}>
                      {sheetsConfig.pendingSyncCount}
                    </div>
                  </div>
                  <div className="bg-slate-950/50 p-2.5 rounded-xl border border-slate-900 text-center">
                    <div className="text-[9px] text-slate-500 uppercase font-mono">Last Sync Run</div>
                    <div className="text-xs font-bold text-slate-300 mt-1 break-words">
                      {sheetsConfig.lastSynced ? sheetsConfig.lastSynced.split(',')[1] || sheetsConfig.lastSynced : "Never"}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Link Setup Forms */
              <div className="mt-6 border-t border-slate-900 pt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Mode A: Create brand-new sheet */}
                <div className="p-5 rounded-2xl border border-dashed border-slate-800 bg-slate-950/10 flex flex-col justify-between">
                  <div>
                    <span className="bg-gold/10 text-gold text-[9px] font-bold font-mono px-2 py-0.5 rounded-full uppercase">Option A</span>
                    <h3 className="text-white font-bold text-base font-cinzel mt-2">Initialize Fresh Spreadsheet</h3>
                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                      Automatically provision a brand-new Google Spreadsheet titled <strong>"SPSMUN 2026 - Pokémon Battle Records"</strong> inside your Google Drive with properly pre-formatted worksheets.
                    </p>
                  </div>
                  <button 
                    onClick={() => handleLinkGoogleSheets()} 
                    disabled={sheetsLoading} 
                    className="btn mt-6 flex items-center justify-center gap-2 py-2.5"
                  >
                    <PlusCircle size={16} />
                    {sheetsLoading ? "Authorizing Google..." : "Create New Spreadsheet"}
                  </button>
                </div>

                {/* Mode B: Link existing sheet */}
                <div className="p-5 rounded-2xl border border-dashed border-slate-800 bg-slate-950/10 flex flex-col justify-between">
                  <div>
                    <span className="bg-slate-800 text-slate-300 text-[9px] font-bold font-mono px-2 py-0.5 rounded-full uppercase">Option B</span>
                    <h3 className="text-white font-bold text-base font-cinzel mt-2">Link Existing Spreadsheet ID</h3>
                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                      Connect a spreadsheet you have already created. Paste the unique Spreadsheet ID (from its URL) below to link and initialize.
                    </p>
                    <input 
                      type="text"
                      placeholder="Spreadsheet ID (e.g. 1pX9p...)"
                      value={customSpreadsheetId}
                      onChange={e => setCustomSpreadsheetId(e.target.value)}
                      className="bg-slate-950 text-xs border border-slate-800 focus:border-gold py-2 px-3 rounded-xl w-full mt-3 font-mono"
                    />
                  </div>
                  <button 
                    onClick={() => handleLinkGoogleSheets(customSpreadsheetId)} 
                    disabled={sheetsLoading || !customSpreadsheetId.trim()} 
                    className="btn mt-4 flex items-center justify-center gap-2 py-2.5 bg-slate-900 border border-slate-800 text-gold-light hover:bg-slate-800"
                  >
                    <Link2 size={16} />
                    {sheetsLoading ? "Authorizing..." : "Link Existing Sheet"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* TRAINER RECORDS LOOKUP & REWARDS SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Search Form Sidebar */}
            <div className="card col-span-1 h-fit">
              <h3 className="gold-text text-lg font-cinzel flex items-center gap-1.5 mb-2">
                <Search size={18} className="text-gold-light" />
                Trainer Audit &amp; Rewards
              </h3>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Lookup any Trainer ID (registered phone number) to search their battles, check wins/losses, daily games played, and verify eligible reward coupons.
              </p>
              <form onSubmit={handleTrainerSearch} className="flex flex-col gap-2">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Trainer Phone (e.g. 9876543210)"
                    value={trainerSearchQuery}
                    onChange={e => setTrainerSearchQuery(e.target.value)}
                    className="bg-slate-950 text-xs border border-slate-800 py-2.5 pl-3 pr-10 rounded-xl w-full"
                  />
                  <button 
                    type="submit" 
                    disabled={trainerSearching} 
                    className="absolute right-2 top-2 text-gold-light hover:text-white"
                  >
                    <Search size={16} />
                  </button>
                </div>
                <button type="submit" disabled={trainerSearching} className="btn py-2 text-xs">
                  {trainerSearching ? "Searching..." : "Search Trainer ID"}
                </button>
              </form>

              {/* Coupon rules card */}
              <div className="mt-4 p-3.5 rounded-xl border border-slate-900 bg-slate-950/20 text-[11px] text-slate-400 leading-relaxed flex flex-col gap-2">
                <span className="font-bold text-white uppercase text-[9px] tracking-wider flex items-center gap-1">
                  <Gift size={10} className="text-amber-400" /> Reward Coupon Tiers (Today)
                </span>
                <div className="flex justify-between border-b border-slate-900/50 pb-1 mt-1">
                  <span>🥉 1+ Battles Played</span>
                  <span className="font-mono text-gold-light font-bold">10% Off Coupon</span>
                </div>
                <div className="flex justify-between border-b border-slate-900/50 pb-1">
                  <span>🥈 3+ Battles Played</span>
                  <span className="font-mono text-gold-light font-bold">20% Off Coupon</span>
                </div>
                <div className="flex justify-between">
                  <span>🥇 5+ Battles Played</span>
                  <span className="font-mono text-gold font-black">50% Off Coupon</span>
                </div>
              </div>
            </div>

            {/* Results Panel */}
            <div className="col-span-1 lg:col-span-2 flex flex-col gap-4">
              {trainerStats ? (
                <div className="card flex flex-col gap-5 animate-fade">
                  {/* Summary Profile Header */}
                  <div className="flex justify-between items-start border-b border-slate-900 pb-4">
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Trainer Search Result</div>
                      <h4 className="text-white text-xl font-bold font-cinzel mt-1">{esc(trainerStats.name)}</h4>
                      <p className="text-xs text-gold-light font-medium mt-0.5">{esc(trainerStats.committee)} · +91 {esc(trainerStats.phone)}</p>
                    </div>
                    {/* Wins Losses Stats */}
                    <div className="flex gap-1">
                      <div className="bg-emerald-950/50 border border-emerald-900/40 px-3 py-1.5 rounded-xl text-center">
                        <div className="text-[8px] text-slate-400 uppercase font-mono">Wins</div>
                        <div className="text-sm font-bold text-emerald-400">{trainerStats.wins}</div>
                      </div>
                      <div className="bg-rose-950/50 border border-rose-900/40 px-3 py-1.5 rounded-xl text-center">
                        <div className="text-[8px] text-slate-400 uppercase font-mono">Losses</div>
                        <div className="text-sm font-bold text-rose-400">{trainerStats.losses}</div>
                      </div>
                    </div>
                  </div>

                  {/* Coupon Reward Claim Code */}
                  <div className="p-4 rounded-2xl border border-gold/20 bg-gradient-to-br from-amber-500/10 to-transparent flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <div className="text-xs text-slate-400 flex items-center gap-1">
                        <Award size={14} className="text-amber-400 shrink-0" />
                        Today's Match Performance ({trainerStats.playedToday} played today)
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Based on total battles finished on the active day.</div>
                    </div>
                    
                    {/* Claim Badge */}
                    <div className="bg-slate-950/80 border border-gold/40 px-3 py-2 rounded-xl text-center w-full md:w-auto">
                      <div className="text-[8px] text-gold uppercase tracking-wider font-mono">Eligible Coupon</div>
                      <div className="text-sm font-black text-white font-mono tracking-wide mt-0.5">
                        {trainerStats.couponCode}
                      </div>
                    </div>
                  </div>

                  {/* Trainer Specific Matches */}
                  <div>
                    <h5 className="text-white font-bold text-xs uppercase tracking-wider font-cinzel mb-2.5">Trainer Battle Log</h5>
                    <div className="overflow-x-auto rounded-xl border border-slate-900 bg-slate-950/20 max-h-[220px] scrollbar-thin">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-slate-950/60 text-slate-400 font-mono border-b border-slate-900">
                            <th className="p-2.5">Time</th>
                            <th className="p-2.5">Opponent</th>
                            <th className="p-2.5">Winner</th>
                            <th className="p-2.5 text-center">Sheet Sync</th>
                          </tr>
                        </thead>
                        <tbody>
                          {trainerHistory.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="p-8 text-center text-slate-600 italic">No matches logged for this trainer yet.</td>
                            </tr>
                          ) : (
                            trainerHistory.map(item => {
                              const isP1 = item.player1Phone === trainerStats.phone;
                              const oppName = isP1 ? item.player2Name : item.player1Name;
                              const oppPhone = isP1 ? item.player2Phone : item.player1Phone;
                              return (
                                <tr key={item.id} className="border-b border-slate-900/50 hover:bg-slate-950/40">
                                  <td className="p-2.5 text-slate-400 font-mono">{item.timestamp.split(',')[1] || item.timestamp}</td>
                                  <td className="p-2.5 text-slate-300">
                                    <div className="font-medium">{esc(oppName)}</div>
                                    <div className="text-[9px] text-slate-500 font-mono">+91 {esc(oppPhone)}</div>
                                  </td>
                                  <td className="p-2.5">
                                    <span className={item.winnerPhone === trainerStats.phone ? "text-emerald-400 font-bold" : (item.winnerPhone === "Draw" ? "text-slate-400" : "text-rose-400")}>
                                      {item.winnerPhone === "Draw" ? "Draw" : (item.winnerPhone === trainerStats.phone ? "Victory" : "Defeat")}
                                    </span>
                                  </td>
                                  <td className="p-2.5 text-center">
                                    {item.synced ? (
                                      <span className="text-emerald-400 text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded-full font-mono font-bold">Synced</span>
                                    ) : (
                                      <span className="text-amber-500 text-[10px] bg-amber-500/10 px-2 py-0.5 rounded-full font-mono font-bold">Queued</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="border border-dashed border-slate-800 rounded-2xl p-12 text-center text-slate-500 bg-slate-950/10 flex flex-col items-center justify-center min-h-[250px]">
                  <Database size={32} className="text-slate-600 mb-2" />
                  <p className="text-sm">No trainer loaded. Use the search box to lookup battle metrics and active rewards.</p>
                </div>
              )}
            </div>
          </div>

          {/* GLOBAL BATTLE HISTORY LOG TABLE */}
          <div className="card">
            <h3 className="gold-text text-lg font-cinzel flex items-center gap-1.5 mb-3">
              <Gamepad2 size={18} className="text-gold-light" />
              Live Battle History &amp; Sync Audit Queue
            </h3>
            <p className="lead mb-4">A complete, real-time chronicle of all trainer versus trainer multiplayer matchups played on the server.</p>

            <div className="overflow-x-auto rounded-xl border border-slate-900 bg-slate-950/10">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-950/60 text-slate-400 font-mono border-b border-slate-900 uppercase tracking-wider text-[10px]">
                    <th className="p-3">Time</th>
                    <th className="p-3">Day</th>
                    <th className="p-3">Trainer 1 (Host)</th>
                    <th className="p-3">Trainer 2 (Guest)</th>
                    <th className="p-3">Winner</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sheetsConfig.history && sheetsConfig.history.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-slate-600 italic bg-slate-950/5">No online multiplayer battles have been played yet. Matches played will appear here.</td>
                    </tr>
                  ) : (
                    sheetsConfig.history && sheetsConfig.history.map((b: any) => (
                      <tr key={b.id} className="border-b border-slate-900/50 hover:bg-slate-950/20">
                        <td className="p-3 text-slate-400 font-mono">{b.timestamp}</td>
                        <td className="p-3 text-slate-300 font-mono font-bold">Day {b.day}</td>
                        <td className="p-3">
                          <div className="text-white font-bold">{esc(b.player1Name)}</div>
                          <div className="text-[10px] text-slate-500 font-mono">+91 {esc(b.player1Phone)}</div>
                          <div className="text-[9px] text-gold-light font-mono mt-0.5">{esc(b.player1Committee)}</div>
                        </td>
                        <td className="p-3">
                          <div className="text-white font-bold">{esc(b.player2Name)}</div>
                          <div className="text-[10px] text-slate-500 font-mono">+91 {esc(b.player2Phone)}</div>
                          <div className="text-[9px] text-gold-light font-mono mt-0.5">{esc(b.player2Committee)}</div>
                        </td>
                        <td className="p-3">
                          {b.winnerPhone === "Draw" ? (
                            <span className="text-slate-400 font-bold bg-slate-900/50 px-2 py-1 rounded-lg">Draw Match</span>
                          ) : (
                            <div className="flex flex-col">
                              <span className="text-emerald-400 font-bold bg-emerald-950/30 border border-emerald-900/20 px-2 py-0.5 rounded-lg w-fit text-[10px]">
                                {esc(b.winnerName)} Won
                              </span>
                              <span className="text-[9px] text-slate-500 font-mono mt-1">+91 {esc(b.winnerPhone)}</span>
                            </div>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          {b.synced ? (
                            <span className="text-emerald-400 text-[10px] bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-mono font-bold inline-flex items-center gap-1">
                              <ShieldCheck size={12} /> Synced
                            </span>
                          ) : (
                            <span className="text-amber-500 text-[10px] bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full font-mono font-bold inline-flex items-center gap-1">
                              <AlertCircle size={12} /> Queued
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
