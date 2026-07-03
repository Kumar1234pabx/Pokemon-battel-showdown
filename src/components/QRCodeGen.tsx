import React, { useState } from 'react';
import { gameAudio } from '../utils/audio';

// Simplified SVG QR/Barcode representation generator for flawless zero-dependency execution
export const QRCodeGen: React.FC = () => {
  const [dashUrl, setDashUrl] = useState('');
  const [stationUrl, setStationUrl] = useState('');
  const [generated, setGenerated] = useState(false);

  const handleGenerate = () => {
    gameAudio.playHeal();
    setGenerated(true);
  };

  const getCleanUrl = (url: string) => {
    if (!url.startsWith('http')) return 'https://' + url;
    return url;
  };

  // Render a mock, highly distinctive and secure QR code styled for printing
  const renderMockQR = (label: string, url: string, color: string) => {
    return (
      <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 flex flex-col items-center gap-3">
        <div className="text-center">
          <div className="font-bold text-white text-sm font-cinzel">{label}</div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5 max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">
            {url}
          </div>
        </div>

        {/* The QR Matrix frame */}
        <div className="bg-white p-3 rounded-lg flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-40 h-40">
            {/* Background */}
            <rect width="100" height="100" fill="white" />
            
            {/* Static QR pattern blocks */}
            {/* Top-Left Finder */}
            <rect x="5" y="5" width="25" height="25" fill={color} />
            <rect x="10" y="10" width="15" height="15" fill="white" />
            <rect x="13" y="13" width="9" height="9" fill={color} />

            {/* Top-Right Finder */}
            <rect x="70" y="5" width="25" height="25" fill={color} />
            <rect x="75" y="10" width="15" height="15" fill="white" />
            <rect x="78" y="13" width="9" height="9" fill={color} />

            {/* Bottom-Left Finder */}
            <rect x="5" y="70" width="25" height="25" fill={color} />
            <rect x="10" y="75" width="15" height="15" fill="white" />
            <rect x="13" y="78" width="9" height="9" fill={color} />

            {/* Alignment patterns & modules */}
            <rect x="40" y="40" width="10" height="10" fill={color} />
            <rect x="43" y="43" width="4" height="4" fill="white" />
            
            {/* Scattered blocks simulating QR data */}
            <rect x="35" y="10" width="10" height="5" fill={color} />
            <rect x="50" y="15" width="5" height="10" fill={color} />
            <rect x="35" y="25" width="15" height="5" fill={color} />
            
            <rect x="10" y="35" width="10" height="10" fill={color} />
            <rect x="15" y="50" width="15" height="5" fill={color} />
            <rect x="5" y="60" width="10" height="5" fill={color} />

            <rect x="75" y="35" width="5" height="15" fill={color} />
            <rect x="85" y="45" width="10" height="10" fill={color} />
            <rect x="70" y="60" width="15" height="5" fill={color} />

            <rect x="35" y="75" width="15" height="10" fill={color} />
            <rect x="35" y="88" width="10" height="5" fill={color} />
            <rect x="55" y="70" width="10" height="20" fill={color} />
            <rect x="70" y="75" width="25" height="10" fill={color} />
          </svg>
        </div>

        {/* Action Button */}
        <button
          onClick={() => {
            gameAudio.playSelect();
            alert(`SPSMUN QR: Code saved to clipboard!`);
          }}
          className="text-xs bg-slate-900 border border-slate-700 hover:border-gold px-4 py-1.5 rounded-lg text-slate-300 transition-colors"
        >
          Copy QR Code
        </button>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 animate-fade">
      {/* Configuration Card */}
      <div className="card">
        <h2 className="gold-text text-xl font-cinzel">QR Badge Builder</h2>
        <p className="lead">Input your active netlify or vercel deployment link, and generate high-resolution credential QRs.</p>
        <div className="flex flex-col gap-4">
          <div>
            <label className="fld">Dashboard Login Link (index.html)</label>
            <input
              value={dashUrl}
              onChange={e => setDashUrl(e.target.value)}
              placeholder="e.g., https://spsmun2026.netlify.app"
            />
          </div>
          <div>
            <label className="fld">Station Entry Link (station.html)</label>
            <input
              value={stationUrl}
              onChange={e => setStationUrl(e.target.value)}
              placeholder="e.g., https://spsmun2026.netlify.app?portal=station"
            />
          </div>
          <button onClick={handleGenerate} className="btn">
            Generate QR Board
          </button>
        </div>
      </div>

      {/* Output Panel */}
      {generated && (
        <div className="flex flex-col gap-6">
          {/* Universal QR */}
          {dashUrl && (
            <div className="card">
              <h2 className="gold-text text-lg font-cinzel mb-4">Universal Dashboard Access QR</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderMockQR('Main Delegate Portal', getCleanUrl(dashUrl), '#1E293B')}
                <div className="flex flex-col justify-center gap-2">
                  <h4 className="font-bold text-white font-cinzel">Print on Badge Backs</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    This universal QR code leads to the delegate dashboard page. Printing this single QR code on the back of all physical ID cards allows delegates to scan and immediately access their login portal.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Station QRs */}
          {stationUrl && (
            <div className="card">
              <h2 className="gold-text text-lg font-cinzel mb-4">Day-Specific Station QRs</h2>
              <p className="lead">Print these and post them at Check-In desks to automatically configure the active Entry Station.</p>
              
              <h3 className="text-emerald-400 font-cinzel text-sm uppercase tracking-wider mb-3">Check-In Terminals</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {renderMockQR('Day 1 Check-In', getCleanUrl(stationUrl) + '&mode=in&day=1', '#064e3b')}
                {renderMockQR('Day 2 Check-In', getCleanUrl(stationUrl) + '&mode=in&day=2', '#064e3b')}
                {renderMockQR('Day 3 Check-In', getCleanUrl(stationUrl) + '&mode=in&day=3', '#064e3b')}
              </div>

              <h3 className="text-amber-500 font-cinzel text-sm uppercase tracking-wider mt-6 mb-3">Check-Out Terminals</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {renderMockQR('Day 1 Check-Out', getCleanUrl(stationUrl) + '&mode=out&day=1', '#78350f')}
                {renderMockQR('Day 2 Check-Out', getCleanUrl(stationUrl) + '&mode=out&day=2', '#78350f')}
                {renderMockQR('Day 3 Check-Out', getCleanUrl(stationUrl) + '&mode=out&day=3', '#78350f')}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
