import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const EVENT_DAYS = ['2026-07-27', '2026-07-28', '2026-07-29'];

app.use(express.json());

// In-Memory Fallback Databases
let delegates: any[] = [
  { name: "Sathya Narayanan", phone: "9876543210", committee: "UNSC", portfolio: "USA", cls: "12", section: "A" },
  { name: "Tobi Madara", phone: "9999988888", committee: "AIPPM", portfolio: "Amit Shah", cls: "11", section: "B" },
  { name: "Kunal Sharma", phone: "9812345678", committee: "UNHRC", portfolio: "United Kingdom", cls: "10", section: "C" },
  { name: "Riya Sen", phone: "9823456789", committee: "WHO", portfolio: "India", cls: "12", section: "B" },
  { name: "Aarav Gupta", phone: "9834567890", committee: "UNCSW", portfolio: "France", cls: "11", section: "A" },
  { name: "Ananya Iyer", phone: "9845678901", committee: "IPL", portfolio: "MS Dhoni", cls: "12", section: "C" },
  { name: "Kabir Mehra", phone: "9856789012", committee: "The Fame Files", portfolio: "Robert Downey Jr", cls: "10", section: "A" },
  { name: "Siddharth Roy", phone: "9867890123", committee: "UNGA", portfolio: "Canada", cls: "11", section: "C" },
  { name: "Meera Nair", phone: "9878901234", committee: "IP", portfolio: "Press Reporter", cls: "12", section: "D" },
  { name: "Ishaan Malhotra", phone: "9889012345", committee: "WHO Beginners", portfolio: "Brazil", cls: "9", section: "A" }
];

let attendance: Record<string, any> = {
  "9876543210": { "Day 1 In": "09:12 AM", "Day 1 Out": "04:30 PM", "Day 2 In": "09:05 AM" },
  "9999988888": { "Day 1 In": "09:20 AM", "Day 1 Out": "04:45 PM" }
};

let roomAllotments: Record<string, string[]> = {
  "UNSC": ["Room 101", "Room 101", "Room 101"],
  "AIPPM": ["Auditorium", "Auditorium", "Room 102"],
  "UNHRC": ["Room 202", "Room 202", "Room 202"],
  "UNCSW": ["Room 303", "Room 303", "Room 303"],
  "WHO": ["Room 204", "Room 204", "Room 204"],
  "WHO Beginners": ["Room 205", "Room 205", "Room 205"],
  "IPL": ["Sports Room", "Sports Room", "Sports Room"],
  "The Fame Files": ["AV Hall", "AV Hall", "AV Hall"],
  "UNGA": ["Room 104", "Room 104", "Room 104"],
  "IP": ["Press Room", "Press Room", "Press Room"]
};

let announcements: any[] = [
  {
    id: "ann_1",
    type: "Update",
    title: "Opening Ceremony",
    body: "Welcome to SPSMUN 3.0! The opening ceremony starts at 9:30 AM in the main auditorium. Please be seated by 9:15 AM.",
    ts: "2026-07-27 08:30"
  },
  {
    id: "ann_2",
    type: "Agenda",
    title: "Day 1 High Tea & Debate Slots",
    body: "First committee session starts at 11:00 AM. High tea will be served at 1:15 PM in the lawn area.",
    ts: "2026-07-27 10:45"
  },
  {
    id: "ann_3",
    type: "Poll",
    title: "Best Food Stall on Campus?",
    body: "Vote for your favorite food stall so we can declare the SPSMUN Gastronomy Winner!",
    ts: "2026-07-27 12:00",
    options: ["Pizza Hub", "Chaotic Chat", "Waffle Wonder", "Noodle Box"],
    votes: [
      { text: "Pizza Hub", count: 24 },
      { text: "Chaotic Chat", count: 18 },
      { text: "Waffle Wonder", count: 32 },
      { text: "Noodle Box", count: 15 }
    ],
    total: 89
  }
];

// Active Game Lobby & Multiplayer Battles
let onlinePlayers: Record<string, { name: string; phone: string; lastSeen: number; committee: string }> = {};
let battleInvites: any[] = []; // { id, fromPhone, fromName, toPhone, status: 'pending'|'accepted'|'declined' }
let activeBattles: Record<string, any> = {};
let gameLeaderboard: Record<string, { wins: number; losses: number; name: string; committee: string }> = {
  "9876543210": { wins: 5, losses: 1, name: "Sathya Narayanan", committee: "UNSC" },
  "9999988888": { wins: 3, losses: 0, name: "Tobi Madara", committee: "AIPPM" }
};

// Cleanup inactive players & expired invites
setInterval(() => {
  const now = Date.now();
  for (const phone in onlinePlayers) {
    if (now - onlinePlayers[phone].lastSeen > 8000) {
      delete onlinePlayers[phone];
    }
  }
  battleInvites = battleInvites.filter(inv => now - parseInt(inv.id) < 60000);
}, 5000);

// Helper for type advantages in Pokémon Showdown
function getTypeMultiplier(attackType: string, defenderTypes: string[]): number {
  const chart: Record<string, Record<string, number>> = {
    Electric: { Water: 2, Flying: 2, Electric: 0.5 },
    Fire: { Steel: 2, Fire: 0.5, Water: 0.5 },
    Water: { Fire: 2, Water: 0.5 },
    Flying: { Fighting: 2, Steel: 0.5 },
    Psychic: { Fighting: 2, Psychic: 0.5, Steel: 0.5 },
    Fighting: { Steel: 2, Flying: 0.5, Psychic: 0.5, Ghost: 0 },
    Steel: { Steel: 0.5, Fire: 0.5, Water: 0.5 },
    Ghost: { Ghost: 2, Psychic: 2 },
    Poison: { Ghost: 0.5, Poison: 0.5, Steel: 0 }
  };

  let mult = 1;
  const attackMap = chart[attackType];
  if (attackMap) {
    for (const dt of defenderTypes) {
      if (attackMap[dt] !== undefined) {
        mult *= attackMap[dt];
      }
    }
  }
  return mult;
}

// REST API for Live Apps Script proxy (with local fallback!)
app.all("/api/proxy", async (req: any, res) => {
  const params = { ...req.query, ...req.body };
  const action = params.action;
  const pUrl = params.apiUrl || "";

  // If user passes a custom URL, proxy to Google Apps Script
  if (pUrl && pUrl.startsWith("http")) {
    try {
      const urlWithParams = new URL(pUrl);
      Object.keys(params).forEach(k => {
        if (k !== "apiUrl") urlWithParams.searchParams.set(k, params[k]);
      });
      const response = await fetch(urlWithParams.toString());
      const data = await response.json();
      return res.json(data);
    } catch (err: any) {
      console.error("Apps Script Proxy Error, falling back to local DB:", err.message);
    }
  }

  // Pure Local Database Resolution
  if (action === "lookup") {
    const { phone, name } = params;
    const cleanPhone = String(phone).replace(/\D/g, "");
    const del = delegates.find(d => d.phone === cleanPhone && d.name.toLowerCase() === String(name).toLowerCase());
    if (del) {
      return res.json({
        ok: true,
        delegate: del,
        attendance: attendance[cleanPhone] || {},
        rooms: roomAllotments[del.committee] || ["", "", ""],
        today: detectDay(),
        agenda: `Committee agenda for ${del.committee} discussion.`
      });
    } else {
      return res.json({ ok: false, error: "Name and phone number do not match." });
    }
  }

  if (action === "search") {
    const q = String(params.q || "").toLowerCase();
    const results = delegates
      .filter(d => d.name.toLowerCase().includes(q) || d.phone.includes(q))
      .map(d => ({
        name: d.name,
        phone: d.phone,
        masked: "***-***-" + d.phone.slice(-4),
        committee: d.committee
      }));
    return res.json({ ok: true, results });
  }

  if (action === "getcommittees") {
    const comList = Array.from(new Set(delegates.map(d => d.committee))).map(name => ({
      committee: name,
      rooms: roomAllotments[name] || ["TBA", "TBA", "TBA"]
    }));
    return res.json({ ok: true, committees: comList });
  }

  if (action === "setroom") {
    const { committee, day, room } = params;
    if (!roomAllotments[committee]) roomAllotments[committee] = ["", "", ""];
    roomAllotments[committee][parseInt(day, 10) - 1] = room;
    return res.json({ ok: true });
  }

  if (action === "adminsearch") {
    const q = String(params.q || "").toLowerCase();
    const results = delegates
      .filter(d => d.name.toLowerCase().includes(q) || d.phone.includes(q))
      .map(d => ({
        ...d,
        attendance: attendance[d.phone] || {}
      }));
    return res.json({ ok: true, results, today: detectDay() });
  }

  if (action === "stats") {
    const dActive = detectDay();
    let cIn = 0, cOut = 0;
    Object.values(attendance).forEach(a => {
      if (a[`Day ${dActive} In`]) cIn++;
      if (a[`Day ${dActive} Out`]) cOut++;
    });
    return res.json({
      ok: true,
      today: dActive,
      checkedInToday: cIn,
      checkedOutToday: cOut,
      totalDelegates: delegates.length
    });
  }

  if (action === "checkin") {
    const { phone, day } = params;
    if (!attendance[phone]) attendance[phone] = {};
    const tStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    attendance[phone][`Day ${day} In`] = tStr;
    return res.json({ ok: true, attendance: attendance[phone], time: tStr });
  }

  if (action === "checkout") {
    const { phone, day } = params;
    if (!attendance[phone]) attendance[phone] = {};
    const tStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    attendance[phone][`Day ${day} Out`] = tStr;
    return res.json({ ok: true, attendance: attendance[phone], time: tStr });
  }

  if (action === "announcements") {
    const { phone } = params;
    const mapped = announcements.map(a => {
      const myChoice = ""; // Local state logic if any
      return { ...a, myChoice };
    });
    return res.json({ ok: true, announcements: mapped });
  }

  if (action === "postann") {
    const { type, title, body, options } = params;
    const newAnn = {
      id: "ann_" + Date.now(),
      type,
      title,
      body,
      ts: new Date().toISOString().slice(0, 16).replace("T", " "),
      options: options ? options.split("|") : undefined,
      votes: options ? options.split("|").map((o: string) => ({ text: o, count: 0 })) : undefined,
      total: options ? 0 : undefined
    };
    announcements.unshift(newAnn);
    return res.json({ ok: true });
  }

  if (action === "delann") {
    const { id } = params;
    announcements = announcements.filter(a => a.id !== id);
    return res.json({ ok: true });
  }

  if (action === "vote") {
    const { pollId, option } = params;
    const ann = announcements.find(a => a.id === pollId);
    if (ann && ann.votes) {
      const optItem = ann.votes.find((v: any) => v.text === option);
      if (optItem) {
        optItem.count++;
        ann.total = (ann.total || 0) + 1;
      }
    }
    return res.json({ ok: true });
  }

  return res.json({ ok: false, error: "Action not found." });
});

// MULTIPLAYER GAME PLATFORM ENDPOINTS
app.post("/api/game/heartbeat", (req, res) => {
  const { phone, name, committee } = req.body;
  if (!phone || !name) return res.status(400).json({ error: "Missing identity info." });
  onlinePlayers[phone] = { name, phone, committee, lastSeen: Date.now() };

  // Fetch active battle invite where target is this phone
  const invite = battleInvites.find(inv => inv.toPhone === phone && inv.status === 'pending');
  return res.json({
    ok: true,
    onlinePlayers: Object.values(onlinePlayers).filter(p => p.phone !== phone),
    incomingInvite: invite || null
  });
});

app.post("/api/game/challenge", (req, res) => {
  const { fromPhone, fromName, toPhone } = req.body;
  if (!fromPhone || !toPhone) return res.status(400).json({ error: "Missing challenge info." });
  
  // Clear past invites between these players
  battleInvites = battleInvites.filter(inv => !(inv.fromPhone === fromPhone && inv.toPhone === toPhone));

  const newInvite = {
    id: String(Date.now()),
    fromPhone,
    fromName,
    toPhone,
    status: 'pending'
  };
  battleInvites.push(newInvite);
  return res.json({ ok: true, invite: newInvite });
});

app.post("/api/game/invite-status", (req, res) => {
  const { id } = req.body;
  const invite = battleInvites.find(inv => inv.id === id);
  if (!invite) return res.json({ ok: false, error: "Invite expired." });
  return res.json({ ok: true, status: invite.status, invite });
});

app.post("/api/game/accept-invite", (req, res) => {
  const { id, toTeam } = req.body;
  const invite = battleInvites.find(inv => inv.id === id);
  if (!invite) return res.json({ ok: false, error: "Invite expired." });
  invite.status = 'accepted';

  // Instantiate BattleState on Server
  const battleId = "battle_" + id;
  activeBattles[battleId] = {
    id: battleId,
    player1Phone: invite.fromPhone,
    player1Name: invite.fromName,
    player1Team: null, // to be populated when player 1 fetches
    player1ActiveIndex: 0,
    player2Phone: invite.toPhone,
    player2Name: onlinePlayers[invite.toPhone]?.name || "Challenger",
    player2Team: toTeam,
    player2ActiveIndex: 0,
    turn: 1,
    player1MoveName: null,
    player2MoveName: null,
    log: ["Battle started between " + invite.fromName + " and " + (onlinePlayers[invite.toPhone]?.name || "Trainer") + "!"],
    winnerPhone: null,
    status: 'active'
  };

  return res.json({ ok: true, battleId });
});

app.post("/api/game/decline-invite", (req, res) => {
  const { id } = req.body;
  const invite = battleInvites.find(inv => inv.id === id);
  if (invite) invite.status = 'declined';
  return res.json({ ok: true });
});

app.post("/api/game/battle-state", (req, res) => {
  const { battleId, myPhone, myTeam } = req.body;
  const battle = activeBattles[battleId];
  if (!battle) return res.status(404).json({ error: "Battle not found." });

  // Lazily populate Player 1's team when they join
  if (myPhone === battle.player1Phone && !battle.player1Team) {
    battle.player1Team = myTeam;
  }

  return res.json({ ok: true, battle });
});

app.post("/api/game/battle-submit-move", (req, res) => {
  const { battleId, myPhone, moveName } = req.body;
  const battle = activeBattles[battleId];
  if (!battle) return res.status(404).json({ error: "Battle not found." });

  if (myPhone === battle.player1Phone) {
    battle.player1MoveName = moveName;
  } else if (myPhone === battle.player2Phone) {
    battle.player2MoveName = moveName;
  }

  // Turn Resolution: if BOTH have selected a move, resolve!
  if (battle.player1MoveName && battle.player2MoveName) {
    resolveTurn(battle);
  }

  return res.json({ ok: true, battle });
});

app.post("/api/game/battle-switch-fainted", (req, res) => {
  const { battleId, myPhone, nextIndex } = req.body;
  const battle = activeBattles[battleId];
  if (!battle) return res.status(404).json({ error: "Battle not found." });

  if (myPhone === battle.player1Phone) {
    const pk = battle.player1Team[battle.player1ActiveIndex];
    if (pk.hp <= 0) {
      battle.player1ActiveIndex = nextIndex;
      battle.log.push(`${battle.player1Name} sent out ${battle.player1Team[nextIndex].name}!`);
    }
  } else if (myPhone === battle.player2Phone) {
    const pk = battle.player2Team[battle.player2ActiveIndex];
    if (pk.hp <= 0) {
      battle.player2ActiveIndex = nextIndex;
      battle.log.push(`${battle.player2Name} sent out ${battle.player2Team[nextIndex].name}!`);
    }
  }

  return res.json({ ok: true, battle });
});

// Perform Pokémon battle move resolution
function resolveTurn(battle: any) {
  const p1 = battle.player1Team[battle.player1ActiveIndex];
  const p2 = battle.player2Team[battle.player2ActiveIndex];

  const m1 = p1.moves.find((m: any) => m.name === battle.player1MoveName);
  const m2 = p2.moves.find((m: any) => m.name === battle.player2MoveName);

  if (!m1 || !m2) return;

  // Decide who goes first based on Speed (higher goes first)
  const p1First = p1.speed >= p2.speed;
  const actors = p1First
    ? [
        { name: battle.player1Name, poke: p1, move: m1, opponent: p2, isP1: true },
        { name: battle.player2Name, poke: p2, move: m2, opponent: p1, isP1: false }
      ]
    : [
        { name: battle.player2Name, poke: p2, move: m2, opponent: p1, isP1: false },
        { name: battle.player1Name, poke: p1, move: m1, opponent: p2, isP1: true }
      ];

  battle.log.push(`\n--- Turn ${battle.turn} Resolution ---`);

  for (const act of actors) {
    if (act.poke.hp <= 0) continue; // Fainted, can't attack!

    // Handle paralyze status skip
    if (act.poke.status === 'Paralyzed' && Math.random() < 0.25) {
      battle.log.push(`${act.poke.name} is paralyzed! It can't move!`);
      continue;
    }

    battle.log.push(`${act.name}'s ${act.poke.name} used ${act.move.name}!`);

    if (act.move.category === 'Status' && act.move.effect === 'heal') {
      const amt = Math.floor(act.poke.maxHp * 0.5);
      act.poke.hp = Math.min(act.poke.maxHp, act.poke.hp + amt);
      battle.log.push(`${act.poke.name} recovered ${amt} HP!`);
      continue;
    }

    // Check Accuracy
    if (Math.random() * 100 > act.move.accuracy) {
      battle.log.push(`The attack missed!`);
      continue;
    }

    // Damage Calculation
    let damage = Math.floor((act.move.power * (act.poke.spAtk / act.opponent.spDef)) / 5) + 5;
    if (act.poke.status === 'Burned') damage = Math.floor(damage * 0.5);

    // Apply multiplier
    const mult = getTypeMultiplier(act.move.type, act.opponent.type);
    damage = Math.floor(damage * mult);

    act.opponent.hp = Math.max(0, act.opponent.hp - damage);

    if (mult > 1) battle.log.push("It's super effective!");
    if (mult < 1 && mult > 0) battle.log.push("It's not very effective...");
    if (mult === 0) battle.log.push(`It doesn't affect ${act.opponent.name}...`);

    battle.log.push(`Dealt ${damage} damage to ${act.opponent.name}.`);

    // Handle status infliction
    if (act.move.effect && act.opponent.hp > 0 && act.opponent.status === 'None') {
      if (act.move.effect === 'burn' && Math.random() < 0.3) {
        act.opponent.status = 'Burned';
        battle.log.push(`${act.opponent.name} was burned!`);
      } else if (act.move.effect === 'paralyze' && Math.random() < 0.3) {
        act.opponent.status = 'Paralyzed';
        battle.log.push(`${act.opponent.name} was paralyzed!`);
      }
    }

    if (act.opponent.hp <= 0) {
      battle.log.push(`${act.opponent.name} fainted!`);
    }
  }

  // Handle status damage at end of turn
  [p1, p2].forEach((p, idx) => {
    if (p.hp > 0 && p.status === 'Burned') {
      const burnDmg = Math.floor(p.maxHp * 0.08);
      p.hp = Math.max(0, p.hp - burnDmg);
      battle.log.push(`${p.name} took ${burnDmg} damage from its burn!`);
      if (p.hp <= 0) battle.log.push(`${p.name} fainted!`);
    }
  });

  // Check Game Over Conditions
  const p1Dead = battle.player1Team.every((p: any) => p.hp <= 0);
  const p2Dead = battle.player2Team.every((p: any) => p.hp <= 0);

  if (p1Dead || p2Dead) {
    battle.status = 'completed';
    if (p1Dead && p2Dead) {
      battle.log.push("The battle ended in a draw!");
    } else if (p1Dead) {
      battle.winnerPhone = battle.player2Phone;
      battle.log.push(`${battle.player2Name} wins the battle! Congratulations!`);
      recordWin(battle.player2Phone, battle.player2Name, battle.player1Phone);
    } else {
      battle.winnerPhone = battle.player1Phone;
      battle.log.push(`${battle.player1Name} wins the battle! Congratulations!`);
      recordWin(battle.player1Phone, battle.player1Name, battle.player2Phone);
    }
  }

  // Advance turn, reset actions
  battle.turn++;
  battle.player1MoveName = null;
  battle.player2MoveName = null;
}

// Update game leaderboard
function recordWin(winPhone: string, winName: string, losePhone: string) {
  // Update Winner
  if (!gameLeaderboard[winPhone]) {
    const d = delegates.find(x => x.phone === winPhone) || {};
    gameLeaderboard[winPhone] = { wins: 0, losses: 0, name: winName, committee: d.committee || "MUN" };
  }
  gameLeaderboard[winPhone].wins++;

  // Update Loser
  if (!gameLeaderboard[losePhone]) {
    const d2 = delegates.find(x => x.phone === losePhone) || {};
    gameLeaderboard[losePhone] = { wins: 0, losses: 0, name: d2.name || "Trainer", committee: d2.committee || "MUN" };
  }
  gameLeaderboard[losePhone].losses++;
}

// Fetch Leaderboard API
app.get("/api/game/leaderboard", (req, res) => {
  const sorted = Object.keys(gameLeaderboard)
    .map(phone => ({
      phone,
      ...gameLeaderboard[phone]
    }))
    .sort((a, b) => b.wins - a.wins || a.losses - b.losses);

  const ranked = sorted.map((item, index) => ({
    ...item,
    rank: index + 1
  }));

  return res.json({ ok: true, leaderboard: ranked });
});

function detectDay() {
  const t = new Date().toISOString().slice(0, 10);
  const idx = EVENT_DAYS.indexOf(t);
  return idx >= 0 ? idx + 1 : 1;
}

// Vite and Production asset handlers
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SPSMUN 2026 Portal Running on port ${PORT}`);
  });
}

startServer();
