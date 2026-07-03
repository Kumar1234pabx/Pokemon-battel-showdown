import React, { useState, useEffect } from 'react';
import { Announcement, Delegate, RoomAllotment } from '../types';
import { gameAudio } from '../utils/audio';
import { PlusCircle, Search, Trash2, Home, CheckCircle2, XCircle, Users } from 'lucide-react';
import { esc } from '../utils/helpers';

interface AdminTerminalProps {
  pass: string;
  onLogout: () => void;
}

export const AdminTerminal: React.FC<AdminTerminalProps> = ({ pass, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'checkin' | 'ann' | 'rooms'>('checkin');
  
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

  // Load stats and announcements on boot
  useEffect(() => {
    loadStats();
    if (activeTab === 'ann') loadLiveAnnouncements();
    if (activeTab === 'rooms') loadRoomAllotments();
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
          { id: 'rooms', label: 'Room Allotments' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
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
    </div>
  );
};
