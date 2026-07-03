import React, { useState } from 'react';
import { gameAudio } from '../utils/audio';
import { Search, CheckCircle2, XCircle } from 'lucide-react';
import { esc } from '../utils/helpers';

interface EntryStationProps {
  pass: string;
}

export const EntryStation: React.FC<EntryStationProps> = ({ pass }) => {
  const [day, setDay] = useState<number>(1);
  const [mode, setMode] = useState<'In' | 'Out'>('In');
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'ok' | 'err' } | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setStatusMsg(null);
    try {
      const response = await fetch(`/api/proxy?action=adminsearch&q=${query}&pass=${pass}`);
      const data = await response.json();
      if (data.ok && data.results) {
        setSearchResults(data.results);
        if (data.results.length === 0) {
          setStatusMsg({ text: "No matching delegates found.", type: "err" });
        }
      }
    } catch (e) {
      setStatusMsg({ text: "Could not fetch delegates list.", type: "err" });
    } finally {
      setLoading(false);
    }
  };

  const handleMark = async (phone: string, name: string) => {
    try {
      const response = await fetch('/api/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: mode === 'In' ? 'checkin' : 'checkout',
          phone,
          day,
          by: 'Station'
        })
      });
      const data = await response.json();
      if (data.ok) {
        if (mode === 'In') {
          gameAudio.playHeal();
          setStatusMsg({ text: `✓ Successfully checked IN ${name} at ${data.time}`, type: 'ok' });
        } else {
          gameAudio.playFaint();
          setStatusMsg({ text: `✓ Successfully checked OUT ${name} at ${data.time}`, type: 'ok' });
        }
        setQuery('');
        setSearchResults([]);
      } else {
        setStatusMsg({ text: data.error || "Execution failed.", type: 'err' });
      }
    } catch (e) {
      setStatusMsg({ text: "Service connection failed.", type: 'err' });
    }
  };

  return (
    <div className="max-w-md mx-auto animate-fade">
      <div className="card">
        {/* Dynamic header badge */}
        <div className={`p-4 rounded-xl text-center mb-6 border ${
          mode === 'In' ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-amber-500/50 bg-amber-500/5'
        }`}>
          <div className={`text-2xl font-bold font-cinzel ${mode === 'In' ? 'text-emerald-300' : 'text-amber-400'}`}>
            {mode === 'In' ? 'CHECK-IN' : 'CHECK-OUT'}
          </div>
          <div className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Day {day} Station Active</div>
        </div>

        {/* Station Select Config */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div>
            <label className="fld">Conference Day</label>
            <select value={day} onChange={e => setDay(parseInt(e.target.value, 10))} className="bg-slate-950 text-sm">
              <option value="1">Day 1 · 27 Jul</option>
              <option value="2">Day 2 · 28 Jul</option>
              <option value="3">Day 3 · 29 Jul</option>
            </select>
          </div>
          <div>
            <label className="fld">Action Mode</label>
            <select value={mode} onChange={e => setMode(e.target.value as any)} className="bg-slate-950 text-sm">
              <option value="In">Check In</option>
              <option value="Out">Check Out</option>
            </select>
          </div>
        </div>

        {/* Search/Mark Input */}
        <div className="flex flex-col gap-2">
          <label className="fld">Scan Barcode / Type Name or Phone</label>
          <div className="flex gap-2">
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search or scan ID card..."
              className="flex-1"
              onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
            />
            <button onClick={handleSearch} className="btn sm flex items-center gap-1.5" style={{ width: 'auto' }}>
              <Search size={14} /> Find
            </button>
          </div>
        </div>

        {/* Status Messages */}
        {statusMsg && (
          <div className={`mt-4 p-3.5 rounded-xl border text-sm ${
            statusMsg.type === 'ok' ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300' : 'border-rose-500/40 bg-rose-500/10 text-rose-300'
          }`}>
            {statusMsg.text}
          </div>
        )}

        {/* Search Results selection */}
        {searchResults.length > 0 && (
          <div className="flex flex-col gap-2 mt-6 border-t border-slate-800 pt-4">
            <label className="fld">Matches found ({searchResults.length})</label>
            {searchResults.map(d => (
              <button
                key={d.phone}
                onClick={() => handleMark(d.phone, d.name)}
                className="w-full p-3 text-left rounded-lg bg-slate-950/40 border border-slate-800 hover:border-gold flex justify-between items-center transition-colors"
              >
                <div>
                  <div className="font-bold text-white text-sm">{esc(d.name)}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{esc(d.committee)} · +91 {esc(d.phone)}</div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                  mode === 'In' ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300' : 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                }`}>
                  {mode === 'In' ? 'Check In' : 'Check Out'}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
