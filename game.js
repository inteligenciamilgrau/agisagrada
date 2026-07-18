// ============================================================
// BOB EM BUSCA DA AGI SAGRADA â€” demo v0.2
// Fase 0: "O Chamado" (SÃ£o Paulo)  Â·  Fase 1: "A Canetada" (Washington)
// Beat 'em up estilo Streets of Rage â€” comunidade InteligÃªncia Mil Grau
// Sprites: agent-sprite-forge (Codex) com fallback pra placeholders.
// ============================================================

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// ResoluÃ§Ã£o interna: altura fixa (mantÃ©m a escala do jogo), largura acompanha
// a proporÃ§Ã£o da janela â€” o jogo preenche a tela toda, sem distorcer.
const H = 540;
let W = 960;
function resize() {
  const aspect = window.innerWidth / window.innerHeight;
  W = Math.max(720, Math.min(1600, Math.round(H * aspect)));
  canvas.width = W;
  canvas.height = H;
  ctx.imageSmoothingEnabled = false; // redimensionar o canvas reseta o contexto
}
resize();
addEventListener('resize', resize);

// ---- ConfiguraÃ§Ã£o dos sprites (formato agent-sprite-forge) ----
// cÃ©lulas 128x128, pÃ©s ancorados em (64,116) â€” vem do pipeline-meta.json
const CELL = 128, ANCHOR_X = 64, ANCHOR_Y = 116;
const SPRITES_FACE_RIGHT = true;

// faceRight: pra que lado o sprite foi DESENHADO (herÃ³is â†’ direita, chefÃµes â†’ esquerda)
const SPRITE_DEFS = {
  bob:       { base: 'sprites/bob',       faceRight: true,  actions: { idle: 4, walk: 6, attack: 6, special: 6 } },
  fefe:      { base: 'sprites/fefe',      faceRight: true,  actions: { idle: 4, walk: 6, attack: 6, special: 6 } },
  escudeiro: { base: 'sprites/escudeiro', faceRight: true,  actions: { idle: 4, walk: 6, attack: 6, special: 6 } },
  loro:      { base: 'sprites/loro',      faceRight: true,  actions: { hover: 4, attack: 6, special: 6 } },
  trunfo:    { base: 'sprites/trunfo',    faceRight: false, actions: { idle: 4, walk: 6, attack_sign: 6, attack_rage: 6, hurt: 4, projectile: 4 } },
  ilon:      { base: 'sprites/ilon',      faceRight: false, actions: { idle: 4, move: 6, attack_tweet: 6, attack_command: 6, hurt: 4 } },
  samuca:    { base: 'sprites/samuca',    faceRight: false, actions: { idle: 4, walk: 6, attack_box: 6, attack_launch: 6, hurt: 4, impact: 4 } },
  dario:     { base: 'sprites/dario',     faceRight: false, actions: { idle: 4, walk: 6, attack_vacuum: 6, attack_essay: 6, hurt: 4 } },
  drone:     { base: 'sprites/drone',     faceRight: false, actions: { hover: 4, attack: 4, death: 4 } },
  lobista:   { base: 'sprites/lobista',   faceRight: false, actions: { walk: 6, attack: 6, death: 4 } },
  advogado:  { base: 'sprites/advogado',  faceRight: false, actions: { walk: 6, attack: 6, death: 4 } },
  optimus:   { base: 'sprites/optimus',   faceRight: false, actions: { walk: 6, attack: 6, death: 4 } },
  estagiario:{ base: 'sprites/estagiario',faceRight: false, actions: { idle: 4, walk: 6, attack: 6, summon: 6, hurt: 4, death: 4 } },
  pm:        { base: 'sprites/pm',        faceRight: false, actions: { walk: 6, attack: 6, death: 4 } },
  crawler:   { base: 'sprites/crawler',   faceRight: false, actions: { walk: 6, attack: 4, death: 4 } },
  curupira:  { base: 'sprites/curupira',  faceRight: true,  actions: { idle: 4, awaken: 6, help: 6 } },
  sacibot:   { base: 'sprites/sacibot',   faceRight: true,  actions: { idle: 4, teleport: 6, steal: 6 } },
  mira:      { base: 'sprites/mira',      faceRight: true,  actions: { idle: 4 } },
  graomestre:{ base: 'sprites/graomestre',faceRight: true,  actions: { idle: 4 } },
  deepzeek:  { base: 'sprites/deepzeek',  faceRight: false, actions: { idle: 4, move: 6, attack_clone: 6, attack_breath: 6, hurt: 4 } },
  gemeo:     { base: 'sprites/gemeo',     faceRight: false, actions: { idle: 4, attack_beam: 6, hurt: 4 } },
};
const BG_FILES = {
  saopaulo: 'sprites/bg_saopaulo.png', washington: 'sprites/bg_washington.png',
  fabrica: 'sprites/bg_fabrica.png', vale: 'sprites/bg_vale.png',
  biblioteca: 'sprites/bg_biblioteca.png', muralha: 'sprites/bg_muralha.png', formosa: 'sprites/bg_formosa.png',
  labs: 'sprites/bg_labs.png',
};

// ---- Carregador com fallback ----
const assets = { anims: {}, bgs: {} };

function loadAnim(charKey, action, count, base) {
  // o sprite-forge exporta ora como "acao-1.png", ora como "sheet-1.png" â€”
  // tenta o primeiro e cai pro segundo automaticamente
  const frames = [];
  let loaded = 0, failed = false;
  const done = () => {
    if (loaded === count && !failed) {
      assets.anims[charKey] = assets.anims[charKey] || {};
      assets.anims[charKey][action] = frames;
    }
  };
  for (let i = 1; i <= count; i++) {
    const img = new Image();
    let triedAlt = false;
    img.onload = () => { loaded++; done(); };
    img.onerror = () => {
      if (!triedAlt) { triedAlt = true; img.src = `${base}/${action}/sheet-${i}.png`; }
      else failed = true;
    };
    img.src = `${base}/${action}/${action}-${i}.png`;
    frames.push(img);
  }
}
for (const [key, def] of Object.entries(SPRITE_DEFS))
  for (const [action, n] of Object.entries(def.actions))
    loadAnim(key, action, n, def.base);

for (const [key, file] of Object.entries(BG_FILES)) {
  const img = new Image();
  img.onload = () => { assets.bgs[key] = img; };
  img.src = file;
}

function hasAnim(charKey, action) {
  return assets.anims[charKey] && assets.anims[charKey][action];
}
function getAnim(charKey, action) {
  return hasAnim(charKey, action) ? assets.anims[charKey][action] : null;
}

// ---- Input ----
const keys = {};
let enterPressed = false, attackPressed = false, escPressed = false, pPressed = false, tPressed = false;
addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  // ESC fora do guard: ao sair do fullscreen o navegador engole o keyup
  if (k === 'escape') { escPressed = true; return; }
  startMusic(); // navegador sÃ³ libera Ã¡udio apÃ³s gesto do usuÃ¡rio
  if (!keys[k]) {
    if (k === 'enter' || k === ' ') enterPressed = true;
    if (k === 'j') attackPressed = true;
    if (k === 'm') { settings.musicOn = !settings.musicOn; saveSettings(); }
    if (k === 'o') pPressed = true; // O de OpÃ§Ãµes
    if (k === 't') tPressed = true;
    if (k === 'f') {
      if (document.fullscreenElement) document.exitFullscreen();
      else document.documentElement.requestFullscreen().catch(() => {});
    }
  }
  keys[k] = true;
  if (['arrowup','arrowdown','arrowleft','arrowright',' '].includes(k)) e.preventDefault();
});
addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });
function releaseAllKeys() { for (const k in keys) keys[k] = false; }
addEventListener('blur', releaseAllKeys);
document.addEventListener('visibilitychange', releaseAllKeys);
document.addEventListener('fullscreenchange', releaseAllKeys);

// ---- ConfiguraÃ§Ãµes de Ã¡udio (persistem no navegador) ----
const settings = {
  musicOn: true, musicVol: 0.7,
  sfxOn: true, sfxVol: 0.7,
  difficulty: 'facil', // facil (padrÃ£o) | medio | dificil
  lang: 'pt', // pt (padrÃ£o) | en | es
};
// ---- i18n (traduÃ§Ãµes em lang.js; PT inline Ã© o fallback canÃ´nico) ----
const LANG_ORDER = ['pt', 'en', 'es'];
const LTX = () => LANGS[settings.lang] || LANGS.pt;
const t = k => {
  const v = LTX().ui && LTX().ui[k];
  return v !== undefined ? v : LANGS.pt.ui[k];
};
const TR = k => (LTX().falas && LTX().falas[k]) || null; // null â†’ usa o PT inline
const fmt = (s, n) => s.replace('{n}', n);
const DIFF_LEVELS = ['facil', 'medio', 'dificil'];
const DIFF_INFO = {
  facil:   { label: 'FÃCIL',   take: 1,    deal: 1,    color: '#3e3' },
  medio:   { label: 'MÃ‰DIO',   take: 1.35, deal: 0.75, color: '#fa3' },
  dificil: { label: 'DIFÃCIL', take: 1.8,  deal: 0.6,  color: '#e33' },
};
const diffCfg = () => DIFF_INFO[settings.difficulty] || DIFF_INFO.facil;
try {
  const saved = JSON.parse(localStorage.getItem('agi-sagrada-audio') || '{}');
  Object.assign(settings, saved);
} catch (_) {}
function saveSettings() {
  try { localStorage.setItem('agi-sagrada-audio', JSON.stringify(settings)); } catch (_) {}
}
const MV = () => settings.musicVol; // volume da mÃºsica

// ---- Ãudio retrÃ´ (WebAudio, sem arquivos) ----
let audioCtx = null;
function beep(freq, dur = 0.08, type = 'square', vol = 0.12) {
  if (!settings.sfxOn || settings.sfxVol <= 0) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(vol * settings.sfxVol, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
    o.connect(g); g.connect(audioCtx.destination);
    o.start(); o.stop(audioCtx.currentTime + dur);
  } catch (_) {}
}
// ---- SURF MUSIC ðŸ„ (chiptune sintetizado â€” bateria + riff tremolo) ----
const music = { on: true, started: false, stepIdx: 0, nextStep: 0 };
const MUSIC_BPM = 168, MUSIC_STEP = 60 / MUSIC_BPM / 4; // semicolcheias

function noiseBuffer(dur) {
  const len = Math.max(1, Math.floor(audioCtx.sampleRate * dur));
  const buf = audioCtx.createBuffer(1, len, audioCtx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  return buf;
}
function drumKick(t) {
  const o = audioCtx.createOscillator(), g = audioCtx.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(130, t);
  o.frequency.exponentialRampToValueAtTime(45, t + 0.1);
  g.gain.setValueAtTime(0.35 * MV(), t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
  o.connect(g); g.connect(audioCtx.destination);
  o.start(t); o.stop(t + 0.13);
}
function drumSnare(t) {
  const s = audioCtx.createBufferSource(), g = audioCtx.createGain(), f = audioCtx.createBiquadFilter();
  s.buffer = noiseBuffer(0.12);
  f.type = 'bandpass'; f.frequency.value = 1800; f.Q.value = 0.8;
  g.gain.setValueAtTime(0.22 * MV(), t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.11);
  s.connect(f); f.connect(g); g.connect(audioCtx.destination);
  s.start(t);
}
function drumHat(t, open) {
  const s = audioCtx.createBufferSource(), g = audioCtx.createGain(), f = audioCtx.createBiquadFilter();
  s.buffer = noiseBuffer(open ? 0.09 : 0.035);
  f.type = 'highpass'; f.frequency.value = 7000;
  g.gain.setValueAtTime(0.08 * MV(), t);
  g.gain.exponentialRampToValueAtTime(0.001, t + (open ? 0.09 : 0.035));
  s.connect(f); f.connect(g); g.connect(audioCtx.destination);
  s.start(t);
}
function leadNote(t, midi, accent) {
  const freq = 440 * Math.pow(2, (midi - 69) / 12);
  const o = audioCtx.createOscillator(), g = audioCtx.createGain();
  o.type = 'square'; o.frequency.value = freq;
  g.gain.setValueAtTime((accent ? 0.09 : 0.06) * MV(), t);
  g.gain.exponentialRampToValueAtTime(0.001, t + MUSIC_STEP * 0.9);
  o.connect(g); g.connect(audioCtx.destination);
  o.start(t); o.stop(t + MUSIC_STEP);
}
function bassNote(t, midi) {
  const freq = 440 * Math.pow(2, (midi - 69) / 12);
  const o = audioCtx.createOscillator(), g = audioCtx.createGain();
  o.type = 'triangle'; o.frequency.value = freq;
  g.gain.setValueAtTime(0.14 * MV(), t);
  g.gain.exponentialRampToValueAtTime(0.001, t + MUSIC_STEP * 1.8);
  o.connect(g); g.connect(audioCtx.destination);
  o.start(t); o.stop(t + MUSIC_STEP * 2);
}
// ======== SISTEMA DE TRILHAS (chiptune multi-instrumento) ========
function nfreq(m) { return 440 * Math.pow(2, (m - 69) / 12); }

function pluckNote(t, m, vol, dur, type = 'square') {
  const o = audioCtx.createOscillator(), g = audioCtx.createGain();
  o.type = type; o.frequency.value = nfreq(m);
  g.gain.setValueAtTime(vol * MV(), t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g); g.connect(audioCtx.destination);
  o.start(t); o.stop(t + dur + 0.02);
}
function pianoNote(t, m, vol = 0.07) {
  // "piano" chiptune: fundamental + oitava + detune sutil, decaimento de martelo
  const f = nfreq(m);
  [[f, 1, 'triangle'], [f * 2, 0.35, 'sine'], [f * 1.003, 0.5, 'sine']].forEach(([ff, vv, ty]) => {
    const o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.type = ty; o.frequency.value = ff;
    g.gain.setValueAtTime(vol * vv * MV(), t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
    o.connect(g); g.connect(audioCtx.destination);
    o.start(t); o.stop(t + 0.6);
  });
}
function keysNote(t, m, vol = 0.05, dur = 0.3) {
  // teclado macio com ataque suave
  const o = audioCtx.createOscillator(), g = audioCtx.createGain();
  o.type = 'sine'; o.frequency.value = nfreq(m);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(vol * MV(), t + 0.03);
  g.gain.exponentialRampToValueAtTime(0.001, t + Math.max(0.1, dur));
  o.connect(g); g.connect(audioCtx.destination);
  o.start(t); o.stop(t + dur + 0.05);
}
function brassNote(t, m, vol = 0.075, dur = 0.4) {
  // "metais imperiais": dois saws destunados com filtro, ataque marcado
  const f = nfreq(m);
  [f * 0.996, f * 1.005].forEach(ff => {
    const o = audioCtx.createOscillator(), g = audioCtx.createGain(), fl = audioCtx.createBiquadFilter();
    o.type = 'sawtooth'; o.frequency.value = ff;
    fl.type = 'lowpass'; fl.frequency.value = 1400;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol * MV(), t + 0.02);
    g.gain.setValueAtTime(vol * 0.8 * MV(), t + dur * 0.6);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(fl); fl.connect(g); g.connect(audioCtx.destination);
    o.start(t); o.stop(t + dur + 0.03);
  });
}
function padNote(t, m, dur, vol = 0.028) {
  // colchÃ£o de suspense: dois saws destunados com filtro
  const f = nfreq(m);
  [f * 0.997, f * 1.004].forEach(ff => {
    const o = audioCtx.createOscillator(), g = audioCtx.createGain(), fl = audioCtx.createBiquadFilter();
    o.type = 'sawtooth'; o.frequency.value = ff;
    fl.type = 'lowpass'; fl.frequency.value = 900;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol * MV(), t + Math.min(0.4, dur * 0.3));
    g.gain.setValueAtTime(vol * MV(), t + dur * 0.7);
    g.gain.linearRampToValueAtTime(0.0001, t + dur);
    o.connect(fl); fl.connect(g); g.connect(audioCtx.destination);
    o.start(t); o.stop(t + dur + 0.05);
  });
}

// acordes compactos (r = nota raiz MIDI)
const Mj = r => ({ r, ch: [0, 4, 7] }), Mi = r => ({ r, ch: [0, 3, 7] });
const M7c = r => ({ r, ch: [0, 4, 7, 11] }), m7c = r => ({ r, ch: [0, 3, 7, 10] });
const D7c = r => ({ r, ch: [0, 4, 7, 10] }), Pw = r => ({ r, ch: [0, 7, 12] });

// bateria por estilo (com virada no fim de cada bloco de 8 compassos)
function playDrums(style, s16, barIdx, t) {
  const fill = (barIdx % 8) === 7 && s16 >= 10;
  if (fill && s16 % 2 === 0) { drumSnare(t); return; }
  switch (style) {
    case 'march':
      if (s16 === 0 || s16 === 8) drumKick(t);
      if (s16 === 4 || s16 === 12) drumSnare(t);
      if (s16 % 2 === 0) drumHat(t, false);
      break;
    case 'marchdrive': // marcha acelerada: chimbal em semicolcheias
      if (s16 === 0 || s16 === 6 || s16 === 8) drumKick(t);
      if (s16 === 4 || s16 === 12) drumSnare(t);
      drumHat(t, s16 === 14);
      break;
    case 'surfrock': // a batida do Misirlou: bumbo sincopado + caixa seca
      if (s16 === 0 || s16 === 6 || s16 === 10) drumKick(t);
      if (s16 === 4 || s16 === 12) drumSnare(t);
      if (s16 % 2 === 0) drumHat(t, s16 === 14);
      break;
    case 'popdrive': // pop agitado: chimbal cheio e bumbo dobrado
      if (s16 === 0 || s16 === 7 || s16 === 10) drumKick(t);
      if (s16 === 4 || s16 === 12) drumSnare(t);
      drumHat(t, s16 === 14);
      break;
    case 'tension': // pulso de suspense: coraÃ§Ã£o acelerado
      if (s16 === 0 || s16 === 7) drumKick(t);
      if (s16 === 12) drumSnare(t);
      if (s16 % 2 === 0) drumHat(t, s16 === 10);
      break;
    case 'techno':
      if (s16 % 4 === 0) drumKick(t);
      if (s16 === 4 || s16 === 12) drumSnare(t);
      if (s16 % 4 === 2) drumHat(t, s16 === 14);
      break;
    case 'pop':
      if (s16 === 0 || s16 === 10) drumKick(t);
      if (s16 === 4 || s16 === 12) drumSnare(t);
      if (s16 % 2 === 0) drumHat(t, false);
      break;
    case 'lofi':
      if (s16 === 0 || s16 === 7) drumKick(t);
      if (s16 === 8) drumSnare(t);
      if (s16 % 4 === 2) drumHat(t, false);
      break;
    case 'epic': // aÃ§Ã£o total: chimbal em semicolcheias direto
      if (s16 === 0 || s16 === 6 || s16 === 8) drumKick(t);
      if (s16 === 4 || s16 === 12) drumSnare(t);
      drumHat(t, s16 === 14);
      break;
    case 'suspense':
      if (s16 === 0) drumKick(t);
      if (s16 === 10) drumHat(t, true);
      break;
  }
}

function playBass(pattern, bar, s16, t) {
  const root = bar.r - 12, fifth = root + 7;
  switch (pattern) {
    case 'eighths':   if (s16 % 2 === 0) bassNote(t, root); break;
    case 'offbeat':   if (s16 % 4 === 2) bassNote(t, root); break;
    case 'rootFifth': if (s16 % 4 === 0) bassNote(t, (s16 / 4) % 2 === 0 ? root : fifth); break;
    case 'half':      if (s16 === 0 || s16 === 8) bassNote(t, root); break;
    case 'drive':     if (s16 % 2 === 0) bassNote(t, (s16 % 8) === 6 ? fifth : root); break;
  }
}

// um passo de qualquer trilha generativa (harmonia + arpejo + bateria)
function trackStep(trk, gIdx, t, stepDur) {
  const totalSteps = trk.bars.length * 16;
  const idx = gIdx % totalSteps;
  const barIdx = Math.floor(idx / 16);
  const bar = trk.bars[barIdx];
  const s16 = idx % 16;
  playDrums(trk.drums, s16, barIdx, t);
  playBass(trk.bassPat, bar, s16, t);
  if (trk.stabs && trk.stabs.includes(s16)) {
    for (const iv of bar.ch) {
      if (trk.stabInst === 'keys') keysNote(t, bar.r + 12 + iv, 0.045, stepDur * 3);
      else pianoNote(t, bar.r + 12 + iv, 0.055);
    }
  }
  if (trk.pad && s16 === 0) {
    for (const iv of bar.ch) padNote(t, bar.r + 12 + iv, stepDur * 16);
  }
  if (trk.arp && s16 % trk.arp.rate === 0) {
    const a = trk.arp;
    let tones = bar.ch.map(iv => bar.r + 24 + iv);
    if (a.octaves === 2) tones = tones.concat(bar.ch.map(iv => bar.r + 36 + iv));
    const n = Math.floor(idx / a.rate);
    let tone;
    if (a.pattern === 'down') tone = tones[tones.length - 1 - (n % tones.length)];
    else if (a.pattern === 'updown') {
      const L = tones.length * 2 - 2, k = n % L;
      tone = tones[k < tones.length ? k : L - k];
    } else tone = tones[n % tones.length];
    if (a.inst === 'keys') keysNote(t, tone, a.vol || 0.05, stepDur * a.rate * 1.1);
    else pluckNote(t, tone, a.vol || 0.05, stepDur * a.rate * 0.95);
  }
  // melodia explÃ­cita por cima (metais)
  if (trk.tune) {
    const tn = trk.tune[idx % trk.tune.length];
    if (tn !== null && tn !== undefined) brassNote(t, tn, 0.08, stepDur * 3.4);
  }
}

// ===== AS TRILHAS (parte A = 8 compassos, parte B = 8 compassos) =====
// raÃ­zes MIDI: C3=48 D=50 E=52 F=53 G=55 A=57 Bb=58 B=59
const TRACKS = {
  saopaulo:  { bpm: 168, custom: true }, // o tema surf original (Fase 0)!
  washington:{ bpm: 128, drums: 'marchdrive', bassPat: 'drive', stabs: [0, 4, 8, 12], stabInst: 'piano',
    arp: { rate: 4, pattern: 'up', octaves: 1, inst: 'keys', vol: 0.04 },
    // A: marcha pomposa em dÃ³ Â· B: vira menor, conspiraÃ§Ã£o no gabinete
    bars: [Mj(48),Mj(53),Mj(48),Mj(55), Mj(48),Mj(53),D7c(55),Mj(48),
           Mi(57),Mi(57),Mj(53),Mj(53), D7c(50),D7c(50),Mj(55),D7c(55)] },
  fabrica:   { bpm: 150, drums: 'techno', bassPat: 'drive', stabs: [0, 10], stabInst: 'keys',
    arp: { rate: 2, pattern: 'up', octaves: 2, inst: 'pluck', vol: 0.045 },
    // A: martelo industrial em mi Â· B: a esteira acelera subindo
    bars: [Pw(52),Pw(52),Pw(52),Pw(52), Pw(48),Pw(48),Pw(50),Pw(50),
           Pw(52),Pw(52),Pw(55),Pw(55), Pw(57),Pw(57),Pw(59),Pw(59)] },
  vale:      { bpm: 128, drums: 'popdrive', bassPat: 'drive', stabs: [0, 6, 8, 14], stabInst: 'keys', pad: true,
    arp: { rate: 2, pattern: 'updown', octaves: 1, inst: 'keys', vol: 0.04 },
    // A: synthpop corporativo sorridente (acordes com 7Âª) Â· B: a mÃ¡scara escorrega
    bars: [M7c(48),m7c(57),M7c(53),D7c(55), M7c(48),m7c(57),M7c(53),D7c(55),
           m7c(52),m7c(57),m7c(50),D7c(55), m7c(52),m7c(57),M7c(53),D7c(55)] },
  biblioteca:{ bpm: 104, drums: 'tension', bassPat: 'eighths', pad: true,
    arp: { rate: 2, pattern: 'down', octaves: 1, inst: 'keys', vol: 0.05 },
    // A: Ã³rgÃ£o descendo na catedral em rÃ© menor Â· B: o aspirador se aproxima
    bars: [Mi(50),Mi(50),Mi(55),Mi(55), Mj(57),Mj(57),Mi(50),Mi(50),
           Mj(58),Mi(55),{ r: 52, ch: [0, 3, 6] },D7c(57), Mi(50),Mi(55),D7c(57),Mi(50)] },
  muralha:   { bpm: 122, drums: 'surfrock', bassPat: 'eighths', stabs: [0, 8], stabInst: 'piano',
    arp: { rate: 2, pattern: 'updown', octaves: 1, inst: 'pluck', vol: 0.05 },
    // A: dedilhado pentatÃ´nico sereno Â· B: o dragÃ£o circula
    bars: [Mi(57),Mi(57),Mj(53),Mj(53), Mj(55),Mj(55),Mi(52),Mi(52),
           Mj(48),Mj(55),Mi(57),Mi(52), Mj(53),Mj(55),Mi(57),Mi(57)] },
  final:     { bpm: 152, drums: 'epic', bassPat: 'drive', stabs: [0, 8], stabInst: 'piano',
    arp: { rate: 2, pattern: 'up', octaves: 2, inst: 'pluck', vol: 0.05 },
    // A: corrida heroica Am-F-C-G Â· B: a onda final aperta
    bars: [Mi(57),Mj(53),Mj(48),Mj(55), Mi(57),Mj(53),Mj(48),Mj(55),
           Mi(50),Mj(58),Mj(53),Mj(48), Mi(50),Mj(58),Mj(52),D7c(52)] },
  boss:      (() => {
    // A MÃšSICA DO MAL â€” marcha imperial: sol menor, metais pesados,
    // ritmo DUN DUN DUN / DUN-da-duuun. Parte B: o rasante da fortaleza (bII).
    const _ = null;
    const b1 = [67,_,_,_, 67,_,_,_, 67,_,_,_, _,_,_,_];      // trÃªs marteladas
    const b2 = [63,_,_,_,_,_, 60,_, 55,_,_,_,_,_,_,_];        // Eb pontuada, C curta, G grave
    const b4 = [63,_,_,_,_,_, 60,_, 62,_,_,_,_,_,_,_];        // ...termina suspensa no V
    const b5 = [62,_,_,_, 62,_,_,_, 62,_,_,_, _,_,_,_];       // resposta no rÃ©
    const b6 = [63,_,_,_,_,_, 60,_, 57,_,_,_,_,_,_,_];
    return {
      bpm: 138, drums: 'march', bassPat: 'eighths', stabs: [0, 8], stabInst: 'piano', pad: true,
      arp: { rate: 4, pattern: 'down', octaves: 1, inst: 'keys', vol: 0.035 },
      bars: [Mi(55),Mj(51),Mi(55),D7c(50), Mi(55),Mj(51),Mi(55),Mi(55),      // A: Gm Â· Eb Â· Gm Â· D7
             Mi(55),Mj(56),Mi(55),Mj(56), Mi(55),Mj(56),D7c(50),D7c(50)],    // B: Gm â†” Ab (rasante!)
      tune: [...b1, ...b2, ...b1, ...b4, ...b5, ...b6, ...b1, ...b2,
             ...Array(128).fill(null)], // na parte B os metais calam e o medo fica
    };
  })(),
  menu:      { bpm: 84, drums: 'lofi', bassPat: 'half', stabs: [0, 7], stabInst: 'keys', pad: true,
    // lofi de planejamento: cafÃ©, mapa e acordes com 7Âª
    bars: [M7c(53),m7c(52),m7c(50),M7c(48), M7c(53),m7c(52),m7c(50),M7c(48),
           M7c(58),m7c(57),m7c(55),D7c(48), M7c(58),m7c(57),m7c(55),D7c(55)] },
  abertura:  { bpm: 72, drums: 'suspense', bassPat: 'half', pad: true,
    arp: { rate: 4, pattern: 'up', octaves: 1, inst: 'keys', vol: 0.05 },
    // lenda antiga: piano lento sobre colchÃ£o, com o V maior de suspense
    bars: [Mi(57),Mi(57),Mj(53),Mj(53), Mj(48),Mj(48),Mj(52),Mj(52),
           Mi(57),Mj(53),Mj(48),Mj(52), Mi(57),Mj(53),Mj(52),Mj(52)] },
  vitoria:   { bpm: 138, drums: 'marchdrive', bassPat: 'rootFifth', stabs: [0, 4, 8, 12], stabInst: 'piano',
    arp: { rate: 2, pattern: 'up', octaves: 2, inst: 'pluck', vol: 0.05 },
    // fanfarra de conquista
    bars: [Mj(48),Mj(55),Mi(57),Mj(53), Mj(48),Mj(53),Mj(55),Mj(48),
           Mj(53),Mj(55),Mi(57),Mj(52), Mj(53),Mj(55),Mj(48),Mj(48)] },
  gameover:  { bpm: 66, drums: 'none', bassPat: 'half', pad: true,
    arp: { rate: 4, pattern: 'down', octaves: 1, inst: 'keys', vol: 0.05 },
    // lamento breve (todo grande modelo jÃ¡ divergiu no treino)
    bars: [Mi(57),Mi(57),Mj(53),Mj(52), Mi(57),Mi(50),Mj(52),Mi(57)] },
};
const PHASE_MUSIC = { 0: 'saopaulo', 1: 'washington', 2: 'fabrica', 3: 'vale', 4: 'biblioteca', 5: 'muralha', 6: 'final', 7: 'biblioteca' };

let currentTrackName = 'abertura';
function setTrack(name) {
  if (name === currentTrackName || !TRACKS[name]) return;
  currentTrackName = name;
  music.stepIdx = 0;
  if (audioCtx) music.nextStep = Math.max(music.nextStep, audioCtx.currentTime + 0.08);
}

// fanfarra de chefÃ£o derrotado (one-shot por cima da trilha)
function playFanfare() {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const t0 = audioCtx.currentTime + 0.03;
    const seq = [60, 64, 67, 72, 67, 72, 76, 79];
    seq.forEach((m, i) => pianoNote(t0 + i * 0.09, m, 0.09));
    [72, 76, 79, 84].forEach(m => pianoNote(t0 + seq.length * 0.09 + 0.05, m, 0.08));
    drumSnare(t0); drumKick(t0 + seq.length * 0.09);
  } catch (_) {}
}

// ============ A MÃšSICA-TEMA (surf em Mi frÃ­gio) ============
// Estrutura: PARTE 1 (2x) â†’ PARTE 2 misirlou (2x) â†’ PARTE 3 cadÃªncia
// andaluza (iv menor â†’ III â†’ II â†’ I, 2 tempos cada) â†’ volta ao comeÃ§o.
const E = 52, F = 53, G = 55, GS = 56, A = 57, B = 59, C = 60, D = 62, E5 = 64;

// PARTE 1 â€” o riff original (sobe pro topo e desce correndo)
const LEAD1 = [
  E,E,E,E, E,E,F,E,  GS,GS,GS,GS, GS,GS,A,GS,
  B,B,B,B, C,B,A,GS, A,A,A,A, GS,A,GS,F,
  E,E,E,E, E,E,F,E,  GS,GS,GS,GS, GS,GS,A,GS,
  B,B,C,C, D,D,E5,E5, D,C,B,A, GS,F,E,null,
];
const BASS1 = [
  E-24,null,null,null, E-24,null,null,null, E-24,null,null,null, E-24,null,null,null,
  A-24,null,null,null, A-24,null,null,null, B-24,null,null,null, B-24,null,null,null,
  E-24,null,null,null, E-24,null,null,null, E-24,null,null,null, E-24,null,null,null,
  A-24,null,null,null, B-24,null,null,null, E-24,null,null,null, B-24,null,null,null,
];

// PARTE 2 â€” misirlou raiz: 2 tempos no I (Mi), 2 tempos um semitom acima (FÃ¡)
const LEAD2 = [
  E,E,E,E, E,E,F,E,   F,F,F,F, F,F,E,F,
  E,E,GS,GS, B,B,A,GS, F,F,A,A, C,C,A,F,
  E,E,E,E, E,F,E,D,   F,F,F,F, F,GS,F,E,
  E,GS,B,E5, D,C,B,A,  GS,A,GS,F, E,F,E,null,
];

// PARTE 3 â€” cadÃªncia andaluza: Am (iv) â†’ G (III) â†’ F (II) â†’ E (I)
// 1Âª passada: 2 tempos por acorde. NA VOLTA: dobra â€” 4 tempos por acorde!
const LEAD3A = [
  A,A,A,A, C,C,B,A,    // lÃ¡ menor
  G,G,G,G, B,B,A,G,    // sol maior
  F,F,F,F, A,A,G,F,    // fÃ¡ maior
  E,E,E,E, GS,GS,F,E,  // mi
];
const LEAD3B = [ // versÃ£o dobrada: 16 semicolcheias por acorde, mais expressiva
  A,A,A,A, C,C,B,A,   A,A,A,A, E5,E5,C,A,    // lÃ¡ menor esticado, arpejo subindo
  G,G,G,G, B,B,A,G,   G,G,G,G, D,D,B,G,      // sol maior
  F,F,F,F, A,A,G,F,   F,F,F,F, C,C,A,F,      // fÃ¡ maior
  E,E,E,E, GS,GS,F,E, E,GS,B,E5, GS,F,E,null, // mi â€” resolvÃ£o final!
];
const CAD_ROOTS = [A-24, G-24, F-24, E-24];

const P1_LEN = LEAD1.length * 2;              // 2x
const P2_LEN = LEAD2.length * 2;              // 2x
const P3_LEN = LEAD3A.length + LEAD3B.length; // cadÃªncia + volta dobrada
const SONG_LEN = P1_LEN + P2_LEN + P3_LEN;

function musicStep(gIdx, t) {
  const idx = gIdx % SONG_LEN;
  const s16 = idx % 16;
  // batida surf: bumbo no 1 e no "e" do 2, caixa no 2 e no 4
  if (s16 === 0 || s16 === 6 || s16 === 10) drumKick(t);
  if (s16 === 4 || s16 === 12) drumSnare(t);
  if (idx % 2 === 0) drumHat(t, s16 === 14);

  let lead = null, bass = null;
  if (idx < P1_LEN) {
    const i = idx % LEAD1.length;
    lead = LEAD1[i];
    bass = BASS1[i];
  } else if (idx < P1_LEN + P2_LEN) {
    const i = (idx - P1_LEN) % LEAD2.length;
    lead = LEAD2[i];
    if (i % 2 === 0) bass = (i % 16) < 8 ? E - 24 : F - 24; // pump Miâ†’FÃ¡
  } else {
    const i = idx - P1_LEN - P2_LEN;
    if (i < LEAD3A.length) {
      // 1Âª passada: 2 tempos por acorde
      lead = LEAD3A[i];
      if (i % 2 === 0) bass = CAD_ROOTS[Math.floor(i / 8)];
    } else {
      // NA VOLTA: dobrada â€” 4 tempos por acorde
      const j = i - LEAD3A.length;
      lead = LEAD3B[j];
      if (j % 2 === 0) bass = CAD_ROOTS[Math.floor(j / 16)];
    }
  }
  if (lead !== null) leadNote(t, lead, s16 % 4 === 0);
  if (bass !== null) bassNote(t, bass);
}
function startMusic() {
  if (music.started) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    music.started = true;
    music.nextStep = audioCtx.currentTime + 0.05;
    setInterval(() => {
      if (!settings.musicOn || settings.musicVol <= 0) { music.nextStep = Math.max(music.nextStep, audioCtx.currentTime + 0.05); return; }
      const trk = TRACKS[currentTrackName];
      const stepDur = 60 / trk.bpm / 4;
      while (music.nextStep < audioCtx.currentTime + 0.12) {
        if (trk.custom) {
          musicStep(music.stepIdx, music.nextStep); // tema surf da Fase 0
          music.stepIdx = (music.stepIdx + 1) % SONG_LEN;
        } else {
          trackStep(trk, music.stepIdx, music.nextStep, stepDur);
          music.stepIdx = (music.stepIdx + 1) % (trk.bars.length * 16);
        }
        music.nextStep += stepDur;
      }
    }, 30);
  } catch (_) {}
}

const sfx = {
  hit:    () => beep(220, 0.06, 'square'),
  hurt:   () => beep(110, 0.15, 'sawtooth'),
  special:() => { beep(523, 0.1); setTimeout(() => beep(659, 0.1), 90); setTimeout(() => beep(784, 0.18), 180); },
  pickup: () => { beep(880, 0.06); setTimeout(() => beep(1175, 0.09), 60); },
  enemyDie: () => beep(165, 0.2, 'triangle'),
  boss:   () => beep(196, 0.3, 'sawtooth'),
  throw:  () => beep(392, 0.07, 'triangle'),
};

// ---- Mundo ----
const GROUND_TOP = 396, GROUND_BOTTOM = 512;
const SCALE = 1.55;

let camX = 0;
let shake = 0;
let time = 0, dt = 0, lastTs = 0;

// conquistas das Guildas (persistem entre fases na mesma sessÃ£o)
const conquests = {
  checkpoint: false, itaipu: false, investimento: false, pesquisadores: false,
  dados: false, eficiencia: false, predio: false, treino: false,
  blueprints: false, playbook: false, litografia: false, // bÃ´nus (nÃ£o sÃ£o peÃ§as do plano)
};
// Moedas de SilÃ­cio escondidas (3 destravam a Ilha Formosa!)
const siliconCoins = new Set();

// ---- O PLANO DA AGI SAGRADA (o mapa que amarra a histÃ³ria) ----
// cada fase conquista uma PEÃ‡A do laboratÃ³rio; o treino sÃ³ Ã© possÃ­vel no final
const PLAN_ITEMS = [
  { key: 'checkpoint',    icon: 'ðŸ§ ', label: 'O MODELO',      sub: 'CURUPIRA-beta resgatado (F0)' },
  { key: 'itaipu',        icon: 'âš¡', label: 'ENERGIA',       sub: 'a Chave de Itaipu (F1)' },
  { key: 'investimento',  icon: 'ðŸ’°', label: 'INVESTIMENTO',  sub: 'a aposta perdida do Ilon (F2)' },
  { key: 'pesquisadores', icon: 'ðŸ§‘â€ðŸ”¬', label: 'PESQUISADORES', sub: 'os demitidos do Vale (F3)' },
  { key: 'dados',         icon: 'ðŸ“š', label: 'DADOS',         sub: 'libertados do aspirador (F4)' },
  { key: 'eficiencia',    icon: 'ðŸ”²', label: 'CHIPS',         sub: 'o tesouro do dragÃ£o (F5)' },
  { key: 'predio',        icon: 'ðŸ—ï¸', label: 'O GALPÃƒO',      sub: 'mutirÃ£o da comunidade' },
  { key: 'treino',        icon: 'ðŸ”¥', label: 'O TREINO',      sub: 'segurar os chefÃµes e treinar' },
];
let mapNext = null;      // prÃ³xima fase ao sair do mapa ('play' = sÃ³ consultando)
let mapT = 0;            // tempo de tela pro pulso do item novo
let lastAcquired = [];   // peÃ§as ganhas agora (pra destacar)

// fundo do quadro do plano (gerado pelo Codex)
const planoImg = new Image();
planoImg.onload = () => { planoImg.ready = true; };
planoImg.src = 'sprites/plano_bg.png';

function drawMap() {
  mapT += dt;
  if (planoImg.ready) {
    // arte do quadro de planejamento (Codex) + vÃ©u escuro pras cartas lerem bem
    const scale = Math.max(W / planoImg.width, H / planoImg.height);
    const iw = planoImg.width * scale, ih = planoImg.height * scale;
    ctx.drawImage(planoImg, (W - iw) / 2, (H - ih) / 2, iw, ih);
    ctx.fillStyle = 'rgba(4,4,12,0.55)'; ctx.fillRect(0, 0, W, H);
  } else {
    // fundo: quadro de planejamento no escuro (esboÃ§o)
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#0a0a1e'); grad.addColorStop(1, '#050510');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = '#ffffff08'; ctx.lineWidth = 1;
    for (let gx = 0; gx < W; gx += 40) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke(); }
    for (let gy = 0; gy < H; gy += 40) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke(); }
  }

  ctx.textAlign = 'center';
  ctx.font = 'bold 26px Courier New'; ctx.fillStyle = '#ffd23f';
  ctx.strokeStyle = '#a3320b'; ctx.lineWidth = 5;
  ctx.strokeText(t('planTitle'), W / 2, 58);
  ctx.fillText(t('planTitle'), W / 2, 58);
  ctx.font = '12px Courier New'; ctx.fillStyle = '#8888aa';
  ctx.fillText(t('planSub'), W / 2, 82);

  const cols = 4, rows = 2;
  const cardW = Math.min(210, (W - 80) / cols - 12), cardH = 128;
  const gridW = cols * (cardW + 14) - 14;
  const startX = W / 2 - gridW / 2, startY = 108;
  const doneCount = PLAN_ITEMS.filter(i => conquests[i.key]).length;

  for (let i = 0; i < PLAN_ITEMS.length; i++) {
    const item = PLAN_ITEMS[i];
    const done = conquests[item.key];
    const isNew = lastAcquired.includes(item.key);
    const cx = startX + (i % cols) * (cardW + 14);
    const cy = startY + Math.floor(i / cols) * (cardH + 16);
    const pulse = isNew ? 1 + Math.sin(mapT * 6) * 0.03 : 1;
    ctx.save();
    ctx.translate(cx + cardW / 2, cy + cardH / 2);
    ctx.scale(pulse, pulse);
    ctx.translate(-(cx + cardW / 2), -(cy + cardH / 2));
    ctx.save();
    ctx.shadowColor = done ? 'rgba(255,210,63,0.35)' : 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = done ? 16 : 8;
    ctx.fillStyle = done ? 'rgba(40,34,10,0.95)' : 'rgba(14,14,26,0.9)';
    rr(cx, cy, cardW, cardH, 12); ctx.fill();
    ctx.restore();
    ctx.strokeStyle = isNew ? '#66ff88' : done ? '#ffd23f' : '#333';
    ctx.lineWidth = isNew ? 3 : 2;
    rr(cx, cy, cardW, cardH, 12); ctx.stroke();
    ctx.globalAlpha = done ? 1 : 0.45;
    const trPlan = LTX().plan && LTX().plan[i];
    ctx.font = '34px serif'; ctx.textAlign = 'center';
    ctx.fillText(item.icon, cx + cardW / 2, cy + 46);
    ctx.font = 'bold 12px Courier New';
    ctx.fillStyle = done ? '#ffd23f' : '#777';
    ctx.fillText((trPlan && trPlan.label) || item.label, cx + cardW / 2, cy + 70);
    ctx.font = '10px Courier New'; ctx.fillStyle = done ? '#ccc' : '#555';
    wrapTextCentered((trPlan && trPlan.sub) || item.sub, cx + cardW / 2, cy + 88, cardW - 20, 12);
    ctx.globalAlpha = 1;
    // selo de status
    ctx.font = 'bold 13px Courier New';
    ctx.fillStyle = done ? '#66ff88' : '#444';
    ctx.fillText(done ? t('planDone') : t('planMissing'), cx + cardW / 2, cy + cardH - 10);
    if (isNew) {
      ctx.font = 'bold 10px Courier New'; ctx.fillStyle = '#66ff88';
      ctx.fillText(t('planNew'), cx + cardW / 2, cy + 12);
    }
    ctx.restore();
  }
  // barra de progresso do plano
  const pw = Math.min(W * 0.5, 460), px2 = W / 2 - pw / 2, py2 = startY + rows * (cardH + 16) + 12;
  ctx.fillStyle = '#1a1a2e'; rr(px2, py2, pw, 14, 7); ctx.fill();
  ctx.fillStyle = '#ffd23f'; rr(px2, py2, pw * (doneCount / PLAN_ITEMS.length), 14, 7); ctx.fill();
  ctx.font = 'bold 12px Courier New'; ctx.fillStyle = '#fff'; ctx.textAlign = 'center';
  ctx.fillText(`${doneCount}/${PLAN_ITEMS.length} ${t('planPieces')}`, W / 2, py2 + 32);
  if (doneCount === PLAN_ITEMS.length) {
    ctx.font = 'bold 16px Courier New'; ctx.fillStyle = '#66ff88';
    ctx.fillText(t('sob'), W / 2, py2 + 54);
  }
  if (Math.floor(time * 2) % 2 === 0) {
    ctx.font = 'bold 13px Courier New'; ctx.fillStyle = '#ffd23f';
    ctx.fillText(t('continueSpace'), W / 2, H - 14);
  }
}

// ---- Textos flutuantes ----
const floatTexts = [];
function spawnText(x, y, text, color = '#fff', scale = 1) {
  floatTexts.push({ x, y, text, color, scale, t: 0 });
}
function updateFloatTexts() {
  for (const f of floatTexts) { f.t += dt; f.y -= 30 * dt; }
  for (let i = floatTexts.length - 1; i >= 0; i--) if (floatTexts[i].t > 1.3) floatTexts.splice(i, 1);
}
function drawFloatTexts() {
  for (const f of floatTexts) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, 1 - f.t / 1.3);
    ctx.font = `bold ${Math.round(13 * f.scale)}px Courier New`;
    ctx.fillStyle = f.color; ctx.textAlign = 'center';
    ctx.strokeStyle = '#000'; ctx.lineWidth = 3;
    ctx.strokeText(f.text, f.x, f.y);
    ctx.fillText(f.text, f.x, f.y);
    ctx.restore();
  }
}

// ---- ProjÃ©teis (canetadas do Trunfo etc.) ----
let projectiles = [];
function updateProjectiles() {
  for (const p of projectiles) {
    // parÃ¡grafo do ensaio: cai do cÃ©u no ponto marcado
    if (p.type === 'paragrafo') {
      p.t += dt;
      p.h -= 260 * dt;
      if (p.h <= 6 && !p.dead) {
        p.dead = true;
        addImpact(p.x, p.gy);
        if (Math.abs(player.x - p.x) < 46 && Math.abs(player.gy - p.gy) < 26) {
          player.takeHit(p.dmg, 1);
        }
        beep(150, 0.08, 'sawtooth');
      }
      continue;
    }
    p.x += p.vx * dt;
    p.gy += p.vy * dt;
    p.t += dt;
    // caixa de produto: explode em pop-ups quando chega no destino
    if (p.type === 'box') {
      p.range -= Math.abs(p.vx * dt);
      if (p.range <= 0 && !p.dead) {
        p.dead = true;
        addImpact(p.x, p.gy);
        spawnPopup();
        if (Math.abs(player.x - p.x) < 70 && Math.abs(player.gy - p.gy) < 30) {
          player.takeHit(p.dmg, Math.sign(p.vx) || 1);
        }
        beep(180, 0.1, 'sawtooth');
        continue;
      }
    }
    // acerta o player
    if (!p.dead && Math.abs(player.x - p.x) < 30 && Math.abs(player.gy - p.gy) < 18 && player.jumpH < 40) {
      p.dead = true;
      if (p.type === 'box') { addImpact(p.x, p.gy); spawnPopup(); }
      player.takeHit(p.dmg, Math.sign(p.vx) || 1);
    }
    if (p.x < camX - 80 || p.x > camX + W + 80 || p.t > 4) p.dead = true;
  }
  projectiles = projectiles.filter(p => !p.dead);
}
function drawProjectiles() {
  const frames = getAnim('trunfo', 'projectile');
  for (const p of projectiles) {
    const sx = p.x - camX, sy = p.gy - p.h;
    if (p.type === 'tweet') {
      // tuitada: retÃ¢ngulo luminoso de 280 caracteres de dano
      ctx.save();
      ctx.translate(sx, sy);
      ctx.fillStyle = '#113344dd'; ctx.fillRect(-20, -12, 40, 24);
      ctx.strokeStyle = '#66ddff'; ctx.lineWidth = 2; ctx.strokeRect(-20, -12, 40, 24);
      ctx.fillStyle = '#66ddff';
      ctx.fillRect(-14, -5, 22, 3); ctx.fillRect(-14, 1, 16, 3);
      ctx.restore();
      continue;
    }
    if (p.type === 'box') {
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(p.t * 8 * Math.sign(p.vx));
      ctx.font = '24px serif'; ctx.textAlign = 'center';
      ctx.fillText('ðŸ“¦', 0, 8);
      ctx.restore();
      continue;
    }
    if (p.type === 'beam') {
      // feixe ultravioleta da litografia
      ctx.save();
      ctx.translate(sx, sy);
      ctx.shadowColor = '#cc66ff'; ctx.shadowBlur = 14;
      ctx.fillStyle = '#e6ccff';
      ctx.fillRect(-30, -4, 60, 8);
      ctx.fillStyle = '#aa55ee';
      ctx.fillRect(-30, -2, 60, 4);
      ctx.restore();
      continue;
    }
    if (p.type === 'binary') {
      // dÃ­gitos incandescentes do sopro do dragÃ£o
      ctx.save();
      ctx.translate(sx, sy);
      ctx.font = 'bold 16px Courier New'; ctx.textAlign = 'center';
      ctx.fillStyle = '#ff6644';
      ctx.shadowColor = '#ffaa00'; ctx.shadowBlur = 8;
      ctx.fillText(p.bit, 0, 0);
      ctx.restore();
      continue;
    }
    if (p.type === 'paragrafo') {
      // sombra-alvo no chÃ£o
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = '#000';
      ctx.beginPath(); ctx.ellipse(p.x - camX, p.gy, 30, 8, 0, 0, 7); ctx.fill();
      ctx.restore();
      // a pÃ¡gina caindo, girando
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(Math.sin(p.t * 6) * 0.3);
      ctx.fillStyle = '#f5f0e0'; ctx.fillRect(-18, -24, 36, 48);
      ctx.strokeStyle = '#999'; ctx.lineWidth = 1; ctx.strokeRect(-18, -24, 36, 48);
      ctx.fillStyle = '#888';
      for (let l = 0; l < 6; l++) ctx.fillRect(-13, -18 + l * 7, 26 - (l % 3) * 6, 2);
      ctx.restore();
      continue;
    }
    ctx.save();
    ctx.translate(sx, sy);
    if (frames) {
      // sprite real do aviÃ£ozinho de papel (voa pra esquerda de fÃ¡brica)
      if (p.vx > 0) ctx.scale(-1, 1);
      const img = frames[Math.floor(p.t * 12) % frames.length];
      const s = SCALE * 0.55;
      ctx.drawImage(img, -64 * s, -64 * s, CELL * s, CELL * s);
    } else {
      ctx.rotate(p.vx > 0 ? 0.1 : Math.PI - 0.1);
      ctx.fillStyle = '#f5e6b8';
      ctx.beginPath(); ctx.moveTo(14, 0); ctx.lineTo(-10, -7); ctx.lineTo(-4, 0); ctx.lineTo(-10, 7); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#c9a227'; ctx.lineWidth = 1.5; ctx.stroke();
    }
    ctx.restore();
  }
}

// ---- Drops (cafÃ©/guaranÃ¡) ----
const drops = [];
function maybeDrop(x, gy) {
  // Playbook dos SaaSseiros: o dinheiro compra cafÃ© pra todo mundo (drops 2x)
  const chance = conquests.playbook ? 0.55 : 0.28;
  if (Math.random() < chance) drops.push({ x, gy, type: Math.random() < 0.7 ? 'cafe' : 'guarana', t: 0 });
}
function updateDrops() {
  for (const d of drops) {
    d.t += dt;
    if (Math.abs(player.x - d.x) < 34 && Math.abs(player.gy - d.gy) < 20 && player.jumpH === 0) {
      const heal = d.type === 'cafe' ? 15 : 35;
      player.hp = Math.min(player.maxHp, player.hp + heal);
      spawnText(d.x - camX, d.gy - 60, d.type === 'cafe' ? 'â˜• +15' : 'ðŸ§‰ +35', '#7fff7f');
      sfx.pickup();
      d.remove = true;
    }
  }
  for (let i = drops.length - 1; i >= 0; i--) if (drops[i].remove) drops.splice(i, 1);
}
function drawDrops() {
  for (const d of drops) {
    const sx = d.x - camX, sy = d.gy - 10 + Math.sin(d.t * 4) * 3;
    ctx.font = '20px serif'; ctx.textAlign = 'center';
    ctx.fillText(d.type === 'cafe' ? 'â˜•' : 'ðŸ§‰', sx, sy);
  }
}

// ---- Moeda de SilÃ­cio da fase (escondida â€” 3 destravam a Ilha Formosa) ----
function updateDrawCoin() {
  const c = currentPhase.coin;
  if (!c || siliconCoins.has(currentPhase.id)) return;
  // coleta
  if (Math.abs(player.x - c.x) < 34 && Math.abs(player.gy - c.gy) < 24 && player.jumpH === 0) {
    siliconCoins.add(currentPhase.id);
    sfx.pickup(); playFanfare();
    spawnText(c.x - camX, c.gy - 80, fmt(t('coinGot'), siliconCoins.size), '#aaddff', 1.4);
    if (siliconCoins.size >= 3) {
      spawnText(W / 2, 200, t('islandAppeared'), '#66ff88', 1.5);
    }
    return;
  }
  // moeda girando com brilho
  const sx = c.x - camX, sy = c.gy - 24 + Math.sin(time * 3) * 5;
  if (sx < -40 || sx > W + 40) return;
  const spin = Math.abs(Math.sin(time * 4));
  ctx.save();
  ctx.shadowColor = '#88ccff'; ctx.shadowBlur = 12;
  ctx.fillStyle = '#b8d4e8';
  ctx.beginPath(); ctx.ellipse(sx, sy, 11 * Math.max(0.2, spin), 11, 0, 0, 7); ctx.fill();
  ctx.strokeStyle = '#5588aa'; ctx.lineWidth = 2; ctx.stroke();
  ctx.restore();
}

// ---- Entidade base ----
class Entity {
  constructor(x, gy) {
    this.x = x;
    this.gy = gy;
    this.jumpH = 0;
    this.vy = 0;
    this.facing = 1;
    this.hp = 100; this.maxHp = 100;
    this.state = 'idle';
    this.frame = 0; this.frameTime = 0;
    this.hitFlash = 0;
    this.dead = false;
    this.removeMe = false;
    this.scaleMul = 1;
  }
  get screenX() { return this.x - camX; }
  get screenY() { return this.gy - this.jumpH; }

  advanceAnim(fps, count, loop = true) {
    this.frameTime += dt;
    const spf = 1 / fps;
    while (this.frameTime >= spf) {
      this.frameTime -= spf;
      this.frame++;
      if (this.frame >= count) {
        if (loop) this.frame = 0;
        else { this.frame = count - 1; return true; }
      }
    }
    return false;
  }
  setState(s) { this.state = s; this.frame = 0; this.frameTime = 0; }
  setStateIf(s) { if (this.state !== s) this.setState(s); }

  drawSprite(charKey, action, fallbackFn) {
    const sx = this.screenX, sy = this.screenY;
    const frames = getAnim(charKey, action);
    if (frames) {
      const img = frames[Math.min(this.frame, frames.length - 1)];
      const s = SCALE * this.scaleMul;
      ctx.save();
      const drawnRight = SPRITE_DEFS[charKey] ? SPRITE_DEFS[charKey].faceRight : SPRITES_FACE_RIGHT;
      const flip = (this.facing === 1) !== drawnRight;
      ctx.translate(sx, sy);
      if (flip) ctx.scale(-1, 1);
      if (this.hitFlash > 0) ctx.filter = 'brightness(2.2)';
      ctx.drawImage(img, -ANCHOR_X * s, -ANCHOR_Y * s, CELL * s, CELL * s);
      ctx.restore();
    } else {
      fallbackFn(sx, sy);
    }
  }
  drawShadow(rx = 26) {
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(this.screenX, this.gy + 4, rx * this.scaleMul, 7 * this.scaleMul, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// ---- Placeholders (atÃ© o Codex entregar) ----
function drawPlaceholderHumanoid(sx, sy, opts) {
  const { body = '#666', head = '#e0b088', accent = '#333', label = '', facing = 1, t = 0, mul = 1 } = opts;
  const bob = Math.sin(t * 6) * 2;
  ctx.save();
  ctx.translate(sx, sy + bob);
  ctx.scale(mul, mul);
  ctx.fillStyle = body; ctx.fillRect(-14, -62, 28, 34);
  ctx.fillStyle = head; ctx.fillRect(-10, -84, 20, 20);
  ctx.fillStyle = accent; ctx.fillRect(facing === 1 ? -2 : -10, -78, 12, 5);
  ctx.fillStyle = '#222'; ctx.fillRect(-12, -28, 9, 28); ctx.fillRect(3, -28, 9, 28);
  ctx.fillStyle = accent; ctx.fillRect(facing === 1 ? 12 : -22, -56, 10, 16);
  ctx.restore();
  if (label) {
    ctx.font = '9px Courier New';
    ctx.fillStyle = '#8888aa'; ctx.textAlign = 'center';
    ctx.fillText(label, sx, sy - 92 * mul);
  }
}
function drawPlaceholderDrone(sx, sy, t) {
  const bob = Math.sin(t * 8) * 4;
  ctx.save();
  ctx.translate(sx, sy - 70 + bob);
  ctx.fillStyle = '#3a4a3a'; ctx.fillRect(-16, -10, 32, 20);
  ctx.fillStyle = '#ff3333'; ctx.beginPath(); ctx.arc(0, 0, 6, 0, 7); ctx.fill();
  ctx.fillStyle = '#99bbaa';
  const r = Math.sin(t * 40) > 0 ? 14 : 8;
  ctx.fillRect(-26, -16, r, 3); ctx.fillRect(26 - r, -16, r, 3);
  ctx.restore();
}

// ---- HerÃ³is jogÃ¡veis ----
const HEROES = {
  bob: {
    key: 'bob', name: '"INDIANA" BOB', desc: 'equilibrado â€” o lÃ­der',
    hp: 100, speed: 190, dmg: 8,
    idle: 'idle', walk: 'walk',
    specialText: 'PROMPT ENGENHEIRADO!', specialColor: '#ffd23f', specialDmg: 40,
  },
  fefe: {
    key: 'fefe', name: 'FÃŠ-FÃŠ LI, A VIDENTE', desc: 'tÃ©cnica â€” dano alto, mais frÃ¡gil',
    hp: 82, speed: 210, dmg: 11,
    idle: 'idle', walk: 'walk',
    specialText: 'IMAGENET!', specialColor: '#55ccff', specialDmg: 48,
  },
  escudeiro: {
    key: 'escudeiro', name: 'ESCUDEIRO MIL GRAU', desc: 'tanque â€” lento, resistente',
    hp: 135, speed: 150, dmg: 12,
    idle: 'idle', walk: 'walk',
    specialText: 'RAID DO CHAT!', specialColor: '#bb66ff', specialDmg: 36,
  },
};
const HERO_ORDER = ['bob', 'fefe', 'escudeiro'];
let selectedHero = 0;

// ---- LORO ESTOCÃSTICO â€” companion (a LLM que voa com qualquer herÃ³i) ----
class Companion {
  constructor() {
    this.x = 60; this.gy = 450;
    this.flyH = 95;
    this.facing = 1;
    this.frame = 0; this.frameTime = 0;
    this.talkCd = 6;
    this.echoCd = 0;
    this.echoFlash = 0;
    this.diveTarget = null;
    this.diveCd = 0;
  }
  // MERGULHO: quando o herÃ³i ataca do alto, o Loro caÃ§a o inimigo mais prÃ³ximo!
  // Sem cooldown: mesmo voltando do Ãºltimo ataque, ele emenda o prÃ³ximo mergulho.
  diveAttack() {
    const alvos = enemies.filter(e => !e.dead);
    if (!alvos.length) return;
    this.diveTarget = alvos.reduce((a, b) =>
      Math.abs(a.x - player.x) < Math.abs(b.x - player.x) ? a : b);
    spawnText(this.x - camX, this.gy - this.flyH - 30, TR('loroDive') || 'ðŸ¦œ MERGULHO!', '#66ff88', 1.1);
    beep(1100, 0.08, 'triangle');
  }
  update(canTalk) {
    this.diveCd = Math.max(0, this.diveCd - dt);
    // em mergulho: voa direto no alvo
    if (this.diveTarget) {
      const alvo = this.diveTarget;
      if (alvo.dead || alvo.removeMe) { this.diveTarget = null; }
      else {
        const tdx = alvo.x - this.x, tdy = alvo.gy - this.gy;
        this.x += Math.sign(tdx) * Math.min(Math.abs(tdx), 620 * dt);
        this.gy += Math.sign(tdy) * Math.min(Math.abs(tdy), 400 * dt);
        this.facing = Math.sign(tdx) || this.facing;
        this.flyH = Math.max(alvo.flyH !== undefined ? alvo.flyH : 40, this.flyH - 320 * dt);
        if (Math.abs(tdx) < 42 && Math.abs(tdy) < 26) {
          const dmg = 2 + Math.floor(Math.random() * 4); // bicada: 2 a 5
          alvo.takeHit(dmg, this.facing, false);
          spawnText(alvo.screenX, alvo.screenY - 100, fmt(TR('loroBite') || 'ðŸ¦œ BICADA! ({n})', dmg), '#66ff88', 1.1);
          this.echoFlash = 0.4;
          sfx.hit();
          this.diveTarget = null;
        }
        this.advanceFrames();
        return;
      }
    }
    // voa atrÃ¡s e acima do herÃ³i, com folga elÃ¡stica
    const tx = player.x - player.facing * 58;
    const ty = player.gy - 6;
    this.x += (tx - this.x) * Math.min(1, dt * 3.5);
    this.gy += (ty - this.gy) * Math.min(1, dt * 3.5);
    this.facing = player.facing;
    this.flyH = 95 + Math.sin(time * 3) * 8;
    this.echoCd -= dt;
    this.echoFlash = Math.max(0, this.echoFlash - dt);
    this.advanceFrames();
    // comentÃ¡rios de papagaio estocÃ¡stico
    if (canTalk) {
      this.talkCd -= dt;
      if (this.talkCd <= 0) {
        this.talkCd = 10 + Math.random() * 8;
        const falas = TR('loro') || ['tokens! tokens!', 'isso foi gerado ou aconteceu?', 'contexto cheio! contexto cheio!',
                       'AGI Ã© logo ali! eu vi no meu treino!', '*repete o Ãºltimo prompt*', 'stochastic! stochastic!'];
        spawnText(this.x - camX, this.gy - this.flyH - 30, 'ðŸ¦œ ' + falas[Math.floor(Math.random() * falas.length)], '#66ff88', 1);
      }
    }
  }
  // chance de repetir o golpe do herÃ³i â€” papagaio estocÃ¡stico!
  onPlayerHit(target) {
    if (this.echoCd > 0 || target.dead || Math.random() > 0.22) return;
    this.echoCd = 3;
    this.echoFlash = 0.4;
    const dmg = 1 + Math.floor(Math.random() * 20); // estocÃ¡stico de verdade
    target.takeHit(dmg, player.facing, false);
    const eco = TR('loroEcho') || ['ðŸ¦œ alucinou! ({n})', 'ðŸ¦œ repetiu! ({n})', 'ðŸ¦œ REPETIU CRITADO! ({n})'];
    const zoeira = fmt(dmg <= 3 ? eco[0] : dmg >= 16 ? eco[2] : eco[1], dmg);
    spawnText(target.screenX, target.screenY - 130, zoeira, '#66ff88', 1.1);
    beep(990, 0.06, 'triangle');
  }
  advanceFrames() {
    this.echoFlash = Math.max(0, this.echoFlash - dt);
    this.frameTime += dt;
    const frames = getAnim('loro', this.diveTarget ? 'attack' : 'hover') || getAnim('loro', 'hover');
    const n = frames ? frames.length : 4;
    while (this.frameTime > 1 / 8) { this.frameTime -= 1 / 8; this.frame = (this.frame + 1) % n; }
  }
  draw() {
    const sx = this.x - camX, sy = this.gy - this.flyH;
    const frames = getAnim('loro', this.diveTarget ? 'attack' : 'hover') || getAnim('loro', 'hover');
    if (frames) {
      const img = frames[this.frame % frames.length];
      const s = SCALE * 0.72;
      ctx.save();
      const flip = (this.facing === 1) !== SPRITES_FACE_RIGHT;
      ctx.translate(sx, sy);
      if (flip) ctx.scale(-1, 1);
      if (this.echoFlash > 0) ctx.filter = 'brightness(1.8)';
      ctx.drawImage(img, -ANCHOR_X * s, -ANCHOR_Y * s, CELL * s, CELL * s);
      ctx.restore();
    } else {
      ctx.font = '22px serif'; ctx.textAlign = 'center';
      ctx.fillText('ðŸ¦œ', sx, sy);
    }
  }
}
let companion = new Companion();

// ---- SACI-BOT â€” companion terrestre (apÃ³s a conquista dos Roboticistas) ----
// Espelho do Loro: quando o herÃ³i ataca NO CHÃƒO, o Saci avanÃ§a no inimigo mais prÃ³ximo!
class SaciBot {
  constructor() {
    this.x = 0; this.gy = 460;
    this.facing = 1;
    this.frame = 0; this.frameTime = 0;
    this.target = null;
    this.hitFlash = 0;
  }
  attack() {
    if (!conquests.blueprints) return;
    const alvos = enemies.filter(e => !e.dead);
    if (!alvos.length) return;
    this.target = alvos.reduce((a, b) =>
      Math.abs(a.x - player.x) < Math.abs(b.x - player.x) ? a : b);
    beep(900, 0.06, 'triangle');
  }
  update() {
    if (!conquests.blueprints) return;
    this.hitFlash = Math.max(0, this.hitFlash - dt);
    if (this.target) {
      const alvo = this.target;
      if (alvo.dead || alvo.removeMe) { this.target = null; }
      else {
        // redemoinho: avanÃ§a rasteiro no alvo
        const tdx = alvo.x - this.x, tdy = alvo.gy - this.gy;
        this.x += Math.sign(tdx) * Math.min(Math.abs(tdx), 560 * dt);
        this.gy += Math.sign(tdy) * Math.min(Math.abs(tdy), 380 * dt);
        this.gy = Math.max(GROUND_TOP, Math.min(GROUND_BOTTOM, this.gy));
        this.facing = Math.sign(tdx) || this.facing;
        if (Math.abs(tdx) < 44 && Math.abs(tdy) < 24) {
          const dmg = 2 + Math.floor(Math.random() * 4); // pancada: 2 a 5
          alvo.takeHit(dmg, this.facing, false);
          spawnText(alvo.screenX, alvo.screenY - 90, fmt(TR('saciHit') || 'ðŸŒª PANCADA! ({n})', dmg), '#ff5533', 1.1);
          this.hitFlash = 0.4;
          sfx.hit();
          this.target = null;
        }
      }
    } else {
      // segue o herÃ³i pelo chÃ£o, do lado oposto ao Loro
      const tx = player.x - player.facing * 36;
      const ty = player.gy + 16;
      this.x += (tx - this.x) * Math.min(1, dt * 4);
      this.gy += (ty - this.gy) * Math.min(1, dt * 4);
      this.gy = Math.max(GROUND_TOP, Math.min(GROUND_BOTTOM, this.gy));
      this.facing = player.facing;
    }
    this.frameTime += dt;
    const frames = getAnim('sacibot', this.target ? 'teleport' : 'idle') || getAnim('sacibot', 'idle');
    const n = frames ? frames.length : 4;
    while (this.frameTime > 1 / 8) { this.frameTime -= 1 / 8; this.frame = (this.frame + 1) % n; }
  }
  draw() {
    if (!conquests.blueprints) return;
    const sx = this.x - camX, sy = this.gy;
    // sombra
    ctx.save();
    ctx.globalAlpha = 0.3; ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.ellipse(sx, sy + 4, 16, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    const frames = getAnim('sacibot', this.target ? 'teleport' : 'idle') || getAnim('sacibot', 'idle');
    if (frames) {
      const img = frames[this.frame % frames.length];
      const s = SCALE * 0.85;
      ctx.save();
      ctx.translate(sx, sy - Math.abs(Math.sin(time * 6)) * 5); // pulinho na turbina
      if (this.facing === -1) ctx.scale(-1, 1);
      if (this.hitFlash > 0) ctx.filter = 'brightness(1.8)';
      ctx.drawImage(img, -ANCHOR_X * s, -ANCHOR_Y * s, CELL * s, CELL * s);
      ctx.restore();
    } else {
      // placeholder: redemoinho com gorro
      ctx.font = '24px serif'; ctx.textAlign = 'center';
      ctx.fillText('ðŸŒª', sx, sy - 8 - Math.abs(Math.sin(time * 6)) * 5);
      ctx.font = '10px serif';
      ctx.fillText('ðŸ”´', sx, sy - 32 - Math.abs(Math.sin(time * 6)) * 5);
    }
  }
}
let saci = new SaciBot();

// ---- Player ----
class Player extends Entity {
  constructor(heroKey) {
    super(120, 460);
    this.hero = HEROES[heroKey];
    this.char = heroKey;
    this.hp = this.maxHp = this.hero.hp;
    this.speed = this.hero.speed;
    this.special = 0; this.maxSpecial = 100;
    this.attackHitDone = false;
    this.invuln = 0;
    this.score = 0;
    this.combo = 0; this.comboTime = 0;
  }
  baseDmg() {
    if (this.hero.chaos) return 1 + Math.floor(Math.random() * 20); // estocÃ¡stico!
    return this.hero.dmg + Math.floor(Math.random() * 4);
  }
  update() {
    this.hitFlash = Math.max(0, this.hitFlash - dt);
    this.invuln = Math.max(0, this.invuln - dt);
    this.comboTime -= dt;
    if (this.comboTime <= 0) this.combo = 0;

    // pulo (fÃ­sica)
    if (this.jumpH > 0 || this.vy > 0) {
      this.jumpH += this.vy * dt;
      this.vy -= 900 * dt;
      if (this.jumpH <= 0) {
        this.jumpH = 0; this.vy = 0;
        if (this.state === 'jump' || this.state === 'airattack') this.setState('idle');
      }
    }

    // ataque aÃ©reo (mantÃ©m o momentum no ar)
    if (this.state === 'airattack') {
      let adx = 0, ady = 0;
      if (keys['arrowleft'] || keys['a']) adx = -1;
      if (keys['arrowright'] || keys['d']) adx = 1;
      if (keys['arrowup'] || keys['w']) ady = -1;
      if (keys['arrowdown'] || keys['s']) ady = 1;
      this.x += adx * this.speed * dt;
      this.gy += ady * this.speed * 0.7 * dt;
      this.x = Math.max(camX + 40, Math.min(camX + W - 40, Math.min(this.x, currentPhase.stageLen - 40)));
      this.gy = Math.max(GROUND_TOP, Math.min(GROUND_BOTTOM, this.gy));
      const done = this.advanceAnim(16, 6, false);
      if (this.frame >= 1 && this.frame <= 4 && !this.attackHitDone) {
        if (this.tryHit(88, 20, this.baseDmg() + 4)) this.attackHitDone = true;
      }
      if (done) this.setState(this.jumpH > 0 ? 'jump' : 'idle');
      return;
    }

    if (this.state === 'attack') {
      // dÃ¡ pra cancelar o golpe num PULO (e emendar voadora no ar!)
      if (keys['k'] && this.jumpH === 0) {
        this.vy = 380; this.jumpH = 0.001;
        this.setState('jump');
        beep(330, 0.08, 'triangle');
        return;
      }
      // golpe andando: patina na direÃ§Ã£o segurada enquanto a animaÃ§Ã£o roda
      let adx = 0, ady = 0;
      if (keys['arrowleft'] || keys['a']) adx = -1;
      if (keys['arrowright'] || keys['d']) adx = 1;
      if (keys['arrowup'] || keys['w']) ady = -1;
      if (keys['arrowdown'] || keys['s']) ady = 1;
      this.x += adx * this.speed * 0.65 * dt;
      this.gy += ady * this.speed * 0.45 * dt;
      this.x = Math.max(camX + 40, Math.min(camX + W - 40, Math.min(this.x, currentPhase.stageLen - 40)));
      this.gy = Math.max(GROUND_TOP, Math.min(GROUND_BOTTOM, this.gy));
      const done = this.advanceAnim(14, 6, false);
      if (this.frame >= 2 && this.frame <= 4 && !this.attackHitDone) {
        if (this.tryHit(78, 14, this.baseDmg())) this.attackHitDone = true;
      }
      if (done) this.setState('idle');
      return;
    }
    if (this.state === 'special') {
      const done = this.advanceAnim(12, 6, false);
      if (this.frame === 3 && !this.attackHitDone) {
        this.attackHitDone = true;
        shake = 0.35; sfx.special();
        for (const e of enemies) if (!e.dead) {
          e.takeHit(this.hero.specialDmg, this.facing, true);
          this.score += 50;
        }
        projectiles = []; // o especial limpa os projÃ©teis do ar!
        popups = [];      // ...e fecha todos os pop-ups (sonho de qualquer usuÃ¡rio)
        const spTxt = (LTX().heroes && LTX().heroes[this.char]) || this.hero.specialText;
        spawnText(this.screenX, this.screenY - 130, spTxt, this.hero.specialColor, 1.4);
      }
      if (done) this.setState('idle');
      return;
    }
    if (this.state === 'hurt') {
      if (this.advanceAnim(10, 4, false)) this.setState('idle');
      return;
    }

    // movimento
    let dx = 0, dy = 0;
    if (keys['arrowleft'] || keys['a']) dx = -1;
    if (keys['arrowright'] || keys['d']) dx = 1;
    if (keys['arrowup'] || keys['w']) dy = -1;
    if (keys['arrowdown'] || keys['s']) dy = 1;

    if (dx !== 0) this.facing = dx;
    this.x += dx * this.speed * dt;
    this.gy += dy * this.speed * 0.7 * dt;
    this.x = Math.max(camX + 40, Math.min(camX + W - 40, Math.min(this.x, currentPhase.stageLen - 40)));
    this.gy = Math.max(GROUND_TOP, Math.min(GROUND_BOTTOM, this.gy));

    // aÃ§Ãµes
    if (attackPressed) {
      attackPressed = false;
      this.attackHitDone = false;
      if (this.jumpH === 0) {
        this.setState('attack');
        saci.attack(); // golpe no chÃ£o: o SACI-BOT avanÃ§a junto!
      } else {
        this.setState('airattack'); beep(500, 0.06, 'triangle'); // voadora!
        companion.diveAttack(); // e o Loro mergulha no inimigo mais prÃ³ximo!
      }
      return;
    }
    if (keys['k'] && this.jumpH === 0 && this.state !== 'jump') {
      this.vy = 380; this.jumpH = 0.001; this.setState('jump'); beep(330, 0.08, 'triangle');
    }
    if (keys['l'] && this.special >= this.maxSpecial && this.state !== 'special') {
      this.setState('special'); this.attackHitDone = false; this.special = 0;
      return;
    }

    if (this.state === 'jump') { this.frame = 0; return; }
    const moving = dx !== 0 || dy !== 0;
    if (moving && this.state !== 'walk') this.setState('walk');
    if (!moving && this.state !== 'idle') this.setState('idle');
    // conta os frames do prÃ³prio asset (o hover do Loro tem 4, walk dos outros tem 6)
    const animName = this.state === 'walk' ? this.hero.walk : this.hero.idle;
    const count = (getAnim(this.char, animName) || []).length || (this.state === 'walk' ? 6 : 4);
    this.advanceAnim(this.state === 'walk' ? 10 : 6, count);
  }
  tryHit(range, depth, dmg) {
    let hitAny = false;
    for (const e of enemies) {
      if (e.dead) continue;
      const inFront = (e.x - this.x) * this.facing > -10 && Math.abs(e.x - this.x) < range;
      const sameLane = Math.abs(e.gy - this.gy) < depth + 14;
      if (inFront && sameLane) {
        // Dataeiros: crÃ­tico de "contexto local" (+15%)
        let finalDmg = conquests.dados ? Math.round(dmg * 1.15) : dmg;
        finalDmg = Math.max(1, Math.round(finalDmg * diffCfg().deal)); // dificuldade
        e.takeHit(finalDmg, this.facing, false);
        // Chave de Itaipu: especial recarrega 2x mais rÃ¡pido! âš¡
        this.special = Math.min(this.maxSpecial, this.special + (conquests.itaipu ? 18 : 9));
        this.combo++; this.comboTime = 1.2;
        this.score += 10 * this.combo;
        sfx.hit(); shake = Math.max(shake, 0.08);
        companion.onPlayerHit(e); // o Loro pode repetir o golpe!
        hitAny = true;
      }
    }
    return hitAny;
  }
  takeHit(dmg, dir) {
    if (this.invuln > 0 || this.state === 'special') return;
    dmg = Math.round(dmg * diffCfg().take); // dificuldade: dano recebido
    this.hp -= dmg;
    this.hitFlash = 0.15; this.invuln = 0.8;
    this.setState('hurt');
    this.x += dir * 24;
    sfx.hurt(); shake = Math.max(shake, 0.15);
    spawnText(this.screenX, this.screenY - 120, `-${dmg}`, '#ff5555');
    if (this.hp <= 0) { this.hp = 0; gameState = 'gameover'; }
  }
  draw() {
    this.drawShadow();
    if (this.invuln > 0 && Math.floor(time * 20) % 2 === 0 && this.state !== 'hurt') return;
    const h = this.hero;
    const map = { idle: h.idle, walk: h.walk, attack: 'attack', airattack: 'attack', special: 'special', hurt: h.idle, jump: h.walk };
    this.drawSprite(this.char, map[this.state], (sx, sy) =>
      drawPlaceholderHumanoid(sx, sy, { body: '#7a4a1e', head: '#e0b088', accent: h.specialColor, label: h.name.split(' ')[0], facing: this.facing, t: time }));
  }
}

// ---- Inimigos comuns ----
class Lobista extends Entity {
  constructor(x, gy) {
    super(x, gy);
    this.hp = this.maxHp = 34;
    this.speed = 70 + Math.random() * 30;
    this.attackCd = 0;
    this.dmg = 8;
    this.spriteKey = 'lobista';
    this.label = 'LOBISTA [gerando...]';
    this.colors = { body: '#556', head: '#e8c098', accent: '#111' };
    this.scoreValue = 100;
    this.phase = Math.random() * 10; // fase fixa da animaÃ§Ã£o placeholder (anti-tremedeira)
  }
  update() {
    this.hitFlash = Math.max(0, this.hitFlash - dt);
    if (this.dead) {
      if (this.advanceAnim(8, hasAnim(this.spriteKey, 'death') ? 4 : 1, false)) {
        this.deadTimer = (this.deadTimer || 0) + dt;
      }
      if ((this.deadTimer || 0) > 0.6) this.removeMe = true;
      return;
    }
    if (this.state === 'hurt') {
      if (this.advanceAnim(10, 2, false)) this.setState('walk');
      return;
    }
    if (this.state === 'attack') {
      const nAtk = (getAnim(this.spriteKey, 'attack') || []).length || 4;
      const done = this.advanceAnim(10, nAtk, false);
      if (this.frame === 3 && !this.hitDone) {
        this.hitDone = true;
        const inRange = Math.abs(player.x - this.x) < 66 && Math.abs(player.gy - this.gy) < 20;
        if (inRange) player.takeHit(this.dmg, Math.sign(player.x - this.x) || 1);
      }
      if (done) { this.setState('walk'); this.attackCd = 1.2 + Math.random(); }
      return;
    }
    this.attackCd -= dt;
    const dx = player.x - this.x, dy = player.gy - this.gy;
    this.facing = Math.sign(dx) || 1;
    const dist = Math.abs(dx);
    if (dist > 55 || Math.abs(dy) > 12) {
      this.x += Math.sign(dx) * this.speed * dt * (dist > 55 ? 1 : 0);
      this.gy += Math.sign(dy) * this.speed * 0.7 * dt;
      this.gy = Math.max(GROUND_TOP, Math.min(GROUND_BOTTOM, this.gy));
      this.setStateIf('walk');
      this.advanceAnim(8, hasAnim(this.spriteKey, 'walk') ? 6 : 4);
    } else if (this.attackCd <= 0) {
      this.setState('attack'); this.hitDone = false;
    } else {
      this.setStateIf('walk'); this.advanceAnim(4, 2);
    }
  }
  takeHit(dmg, dir, isSpecial) {
    this.hp -= dmg;
    this.hitFlash = 0.12;
    this.x += dir * (isSpecial ? 46 : 14);
    spawnText(this.screenX, this.screenY - 110, `${dmg}`, '#ffd23f');
    if (this.hp <= 0) {
      this.dead = true; this.frame = 0; this.frameTime = 0;
      sfx.enemyDie();
      player.score += this.scoreValue;
      maybeDrop(this.x, this.gy);
    } else this.setState('hurt');
  }
  draw() {
    if (!this.dead) this.drawShadow();
    ctx.save();
    if (this.dead && !hasAnim(this.spriteKey, 'death')) ctx.globalAlpha = Math.max(0, 1 - (this.deadTimer || 0) * 1.6);
    // sem animaÃ§Ã£o de morte? desvanece usando o prÃ³prio sprite (ex: clones do herÃ³i)
    const action = this.dead
      ? (hasAnim(this.spriteKey, 'death') ? 'death' : 'walk')
      : (this.state === 'attack' ? 'attack' : 'walk');
    this.drawSprite(this.spriteKey, action, (sx, sy) =>
      drawPlaceholderHumanoid(sx, sy, { ...this.colors, label: this.label, facing: this.facing, t: time + this.phase }));
    ctx.restore();
    if (!this.dead) this.drawHpBar();
  }
  drawHpBar() {
    const sx = this.screenX, sy = this.screenY - 96 * this.scaleMul;
    ctx.fillStyle = '#300'; ctx.fillRect(sx - 20, sy, 40, 4);
    ctx.fillStyle = '#e33'; ctx.fillRect(sx - 20, sy, 40 * (this.hp / this.maxHp), 4);
  }
}

// Advogado com liminar: mais casca-grossa (Fase 1)
class Advogado extends Lobista {
  constructor(x, gy) {
    super(x, gy);
    this.hp = this.maxHp = 58;
    this.speed = 55 + Math.random() * 20;
    this.dmg = 11;
    this.spriteKey = 'advogado';
    this.label = 'ADVOGADO [gerando...]';
    this.colors = { body: '#1d2b4a', head: '#e8c098', accent: '#8a6d1f' };
    this.scoreValue = 150;
  }
}

// RobÃ´ Optimus: capanga em sÃ©rie da GigafÃ¡brica (Fase 2)
class OptimusBot extends Lobista {
  constructor(x, gy) {
    super(x, gy);
    this.hp = this.maxHp = 26;
    this.speed = 95;
    this.dmg = 7;
    this.spriteKey = 'optimus';
    this.label = 'OPTIMUS [gerando...]';
    this.colors = { body: '#4a4a52', head: '#2a2a30', accent: '#66ccee' };
    this.scoreValue = 120;
  }
  demitir() { // o Ilon corta custos NA LUTA
    if (this.dead) return;
    this.dead = true; this.frame = 0; this.frameTime = 0;
    spawnText(this.screenX, this.screenY - 100, TR('demitido') || 'ðŸ“‰ DEMITIDO!', '#ff8866', 1.1);
    sfx.enemyDie();
  }
}

// Gerente de Produto: capanga do Vale (Fase 3), bate com roadmap enrolado
class GerenteProduto extends Lobista {
  constructor(x, gy) {
    super(x, gy);
    this.hp = this.maxHp = 42;
    this.speed = 80;
    this.dmg = 9;
    this.spriteKey = 'pm';
    this.label = 'PM [gerando...]';
    this.colors = { body: '#0d6e6e', head: '#e8c098', accent: '#f2b135' };
    this.scoreValue = 130;
  }
}

// Crawler-aranha: peste bibliotecÃ¡ria da Fase 4
class Crawler extends Lobista {
  constructor(x, gy) {
    super(x, gy);
    this.hp = this.maxHp = 30;
    this.speed = 115;
    this.dmg = 8;
    this.spriteKey = 'crawler';
    this.label = 'CRAWLER [gerando...]';
    this.colors = { body: '#2a3a2a', head: '#1a2a1a', accent: '#66ff66' };
    this.scoreValue = 130;
  }
}

// Clone Temu: o Deep-Zeek clona VOCÃŠ por 1/10 do preÃ§o (Fase 5)
class CloneTemu extends Lobista {
  constructor(x, gy) {
    super(x, gy);
    this.hp = this.maxHp = 45;
    this.speed = 140;
    this.dmg = 9;
    this.spriteKey = player.char; // usa o SEU sprite!
    this.label = TR('cloneTemuLabel') || 'VOCÃŠ (versÃ£o temu)';
    this.scoreValue = 180;
  }
  draw() {
    ctx.save();
    ctx.globalAlpha = (this.dead ? Math.max(0, 1 - (this.deadTimer || 0) * 1.6) : 0.8);
    ctx.filter = 'saturate(0.35) brightness(0.8)'; // paleta desbotada de clone barato
    super.draw();
    ctx.restore();
  }
}

// Clone open-source: quando o Deep-Zeek libera os pesos, eles lutam DO SEU LADO
let allies = [];
class CloneAliado extends Entity {
  constructor(x, gy) {
    super(x, gy);
    this.char = player.char;
    this.life = 16;
    this.attackCd = 1;
  }
  update() {
    this.life -= dt;
    if (this.life <= 0) { this.removeMe = true; return; }
    this.attackCd -= dt;
    const alvo = enemies.find(e => !e.dead);
    if (alvo) {
      const dx = alvo.x - this.x, dy = alvo.gy - this.gy;
      this.facing = Math.sign(dx) || 1;
      if (Math.abs(dx) > 60 || Math.abs(dy) > 14) {
        this.x += Math.sign(dx) * 150 * dt;
        this.gy += Math.sign(dy) * 100 * dt;
        this.gy = Math.max(GROUND_TOP, Math.min(GROUND_BOTTOM, this.gy));
        this.setStateIf('walk');
        this.advanceAnim(10, 6);
      } else if (this.attackCd <= 0) {
        this.attackCd = 1.3;
        this.setState('attack');
        alvo.takeHit(5, this.facing, false);
        spawnText(alvo.screenX, alvo.screenY - 90, '5', '#88ffcc');
      } else if (this.state === 'attack') {
        if (this.advanceAnim(14, 6, false)) this.setState('idle');
      }
    } else {
      this.setStateIf('idle');
      this.advanceAnim(6, 4);
    }
  }
  draw() {
    ctx.save();
    ctx.globalAlpha = 0.55 + Math.sin(time * 5) * 0.1; // fantasma digital
    ctx.filter = 'hue-rotate(90deg) saturate(0.6)';
    const map = { idle: 'idle', walk: 'walk', attack: 'attack' };
    this.drawSprite(this.char, map[this.state] || 'idle', () => {});
    ctx.restore();
    ctx.font = '8px Courier New'; ctx.fillStyle = '#88ffcc'; ctx.textAlign = 'center';
    ctx.fillText(TR('cloneAllyLabel') || 'clone open-source', this.screenX, this.screenY - 100);
  }
}

// ---- Pop-ups do Samuca (cobrem a TELA do jogador de verdade!) ----
let popups = [];
function spawnPopup() {
  popups.push({
    x: 60 + Math.random() * Math.max(100, W - 320),
    y: 70 + Math.random() * (H - 300),
    t: 4.5,
  });
}
function updateDrawPopups() {
  for (const p of popups) p.t -= dt;
  popups = popups.filter(p => p.t > 0);
  for (const p of popups) {
    const w = 230, h = 140;
    ctx.save();
    ctx.globalAlpha = Math.min(1, p.t / 0.4);
    ctx.fillStyle = '#e8e8e8'; ctx.fillRect(p.x, p.y, w, h);
    ctx.fillStyle = '#2a5adf'; ctx.fillRect(p.x, p.y, w, 26);
    ctx.font = 'bold 12px Courier New'; ctx.fillStyle = '#fff'; ctx.textAlign = 'left';
    ctx.fillText(t('popupTitle'), p.x + 8, p.y + 18);
    ctx.fillStyle = '#c0392b'; ctx.fillRect(p.x + w - 24, p.y + 4, 18, 18);
    ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.fillText('X', p.x + w - 15, p.y + 17);
    ctx.fillStyle = '#333'; ctx.textAlign = 'left'; ctx.font = '10px Courier New';
    t('popupBody').forEach((ln, li) => ctx.fillText(ln, p.x + 12, p.y + 48 + li * 15));
    ctx.fillStyle = '#2a5adf'; ctx.fillRect(p.x + 55, p.y + 105, 120, 24);
    ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.font = 'bold 11px Courier New';
    ctx.fillText(t('popupBtn'), p.x + 115, p.y + 121);
    ctx.restore();
  }
}
// cliques no canvas: fecha pop-ups no X e opera o dropdown de idioma do tÃ­tulo
let titleLangOpen = false;
let titleLangBoxes = [];
canvas.addEventListener('click', e => {
  const rect = canvas.getBoundingClientRect();
  const mx = (e.clientX - rect.left) * (W / rect.width);
  const my = (e.clientY - rect.top) * (H / rect.height);
  for (const p of popups) {
    if (mx >= p.x + 206 && mx <= p.x + 230 && my >= p.y && my <= p.y + 26) {
      p.t = 0;
      beep(880, 0.05);
    }
  }
  if (gameState === 'title') {
    let hit = false;
    for (const b of titleLangBoxes) {
      if (mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h) {
        hit = true;
        if (b.lang === null) { titleLangOpen = !titleLangOpen; beep(660, 0.05); }
        else { settings.lang = b.lang; saveSettings(); titleLangOpen = false; beep(784, 0.07); }
      }
    }
    if (!hit) titleLangOpen = false;
  }
});

// ---- Impactos (explosÃ£o de pop-ups do sprite do Samuca) ----
let impacts = [];
function addImpact(x, gy) { impacts.push({ x, gy, t: 0 }); }
function updateDrawImpacts() {
  for (const im of impacts) im.t += dt;
  impacts = impacts.filter(im => im.t < 0.5);
  const frames = getAnim('samuca', 'impact');
  for (const im of impacts) {
    const sx = im.x - camX, sy = im.gy - 40;
    if (frames) {
      const img = frames[Math.min(frames.length - 1, Math.floor(im.t * 10))];
      const s = SCALE * 0.9;
      ctx.drawImage(img, sx - 64 * s, sy - 64 * s, CELL * s, CELL * s);
    } else {
      ctx.save();
      ctx.globalAlpha = 1 - im.t * 2;
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(sx, sy, 20 + im.t * 60, 0, 7); ctx.fill();
      ctx.restore();
    }
  }
}

class Drone extends Entity {
  constructor(x, gy) {
    super(x, gy);
    this.hp = this.maxHp = 18;
    this.speed = 120;
    this.attackCd = 1 + Math.random();
    this.flyH = 70;
    this.phase = Math.random() * 10; // fase fixa da flutuaÃ§Ã£o (senÃ£o treme ao se mover)
  }
  update() {
    this.hitFlash = Math.max(0, this.hitFlash - dt);
    if (this.dead) {
      this.flyH = Math.max(0, this.flyH - 300 * dt);
      this.deadTimer = (this.deadTimer || 0) + dt;
      if (this.deadTimer > 0.7) this.removeMe = true;
      this.advanceAnim(10, hasAnim('drone', 'death') ? 4 : 1, false);
      return;
    }
    this.attackCd -= dt;
    const dx = player.x - this.x, dy = player.gy - this.gy;
    this.facing = Math.sign(dx) || 1;
    if (this.state === 'attack') {
      const done = this.advanceAnim(12, hasAnim('drone', 'attack') ? 4 : 3, false);
      this.flyH = Math.max(24, this.flyH - 160 * dt);
      this.x += this.facing * 200 * dt;
      if (Math.abs(player.x - this.x) < 40 && Math.abs(dy) < 18 && !this.hitDone) {
        this.hitDone = true;
        player.takeHit(6, this.facing);
      }
      if (done) { this.setState('hover'); this.attackCd = 1.6 + Math.random(); }
      return;
    }
    this.flyH = 70 + Math.sin(time * 3 + this.phase) * 8;
    if (Math.abs(dx) > 90) this.x += Math.sign(dx) * this.speed * dt;
    if (Math.abs(dy) > 6) this.gy += Math.sign(dy) * this.speed * 0.6 * dt;
    this.gy = Math.max(GROUND_TOP, Math.min(GROUND_BOTTOM, this.gy));
    if (this.attackCd <= 0 && Math.abs(dx) < 160) { this.setState('attack'); this.hitDone = false; }
    else this.advanceAnim(8, hasAnim('drone', 'hover') ? 4 : 2);
  }
  get screenY() { return this.gy - this.flyH - this.jumpH; }
  takeHit(dmg, dir, isSpecial) {
    this.hp -= dmg;
    this.hitFlash = 0.12;
    this.x += dir * (isSpecial ? 40 : 18);
    spawnText(this.screenX, this.screenY - 40, `${dmg}`, '#ffd23f');
    if (this.hp <= 0) {
      this.dead = true; this.frame = 0;
      sfx.enemyDie(); player.score += 80;
      maybeDrop(this.x, this.gy);
    }
  }
  draw() {
    this.drawShadow();
    const action = this.dead ? 'death' : (this.state === 'attack' ? 'attack' : 'hover');
    if (hasAnim('drone', action)) {
      this.drawSprite('drone', action, () => {});
    } else {
      drawPlaceholderDrone(this.screenX, this.gy - this.flyH + 70, time + this.phase);
    }
    if (!this.dead) {
      const sx = this.screenX, sy = this.screenY - 30;
      ctx.fillStyle = '#300'; ctx.fillRect(sx - 15, sy, 30, 3);
      ctx.fillStyle = '#e33'; ctx.fillRect(sx - 15, sy, 30 * (this.hp / this.maxHp), 3);
    }
  }
}

// ---- Mini-chefe Fase 0: O EstagiÃ¡rio Terceirizado ----
class Estagiario extends Lobista {
  constructor(x, gy) {
    super(x, gy);
    this.hp = this.maxHp = 160;
    this.speed = 55;
    this.dmg = 9;
    this.spriteKey = 'estagiario';
    this.summonCd = 5;
    this.talkCd = 3;
    this.scaleMul = 1.35;
    this.scoreValue = 800;
    this.isBoss = true;
    this.nameKey = 'estagiario';
    this.bossName = 'âš  O ESTAGIÃRIO TERCEIRIZADO â€” "consultoria gringa" âš ';
  }
  update() {
    if (!this.dead) {
      this.summonCd -= dt;
      this.talkCd -= dt;
      if (this.talkCd <= 0) {
        this.talkCd = 4 + Math.random() * 3;
        const falas = TR('estagiario') || ['tÃ´ sÃ³ cumprindo OKR!', 'isso nÃ£o tava no escopo!', 'vou escalar pro meu gestor!', 'era pra ser sÃ³ um estÃ¡gio!'];
        spawnText(this.screenX, this.screenY - 130, falas[Math.floor(Math.random() * falas.length)], '#aaddff', 1.1);
      }
      // invocaÃ§Ã£o com animaÃ§Ã£o prÃ³pria (levanta o tablet!)
      if (this.state === 'summon') {
        this.hitFlash = Math.max(0, this.hitFlash - dt);
        const done = this.advanceAnim(9, hasAnim('estagiario', 'summon') ? 6 : 4, false);
        if (this.frame === 3 && !this.summonDone) {
          this.summonDone = true;
          spawnText(this.screenX, this.screenY - 150, TR('estagiarioSummon') || 'DRONES, FAZEM ALGUMA COISA!', '#ffaa55', 1.2);
          enemies.push(new Drone(this.x - 80, this.gy - 20));
          enemies.push(new Drone(this.x + 80, this.gy + 20));
        }
        if (done) { this.setState('walk'); this.summonCd = 6; }
        return;
      }
      if (this.summonCd <= 0 && this.state !== 'attack' && this.state !== 'hurt' &&
          enemies.filter(e => e instanceof Drone && !e.dead).length < 3) {
        this.setState('summon');
        this.summonDone = false;
        return;
      }
    }
    super.update();
  }
  takeHit(dmg, dir, isSpecial) {
    super.takeHit(dmg, dir, isSpecial);
    if (this.dead) bossDefeated = true;
  }
  draw() {
    if (!this.dead) this.drawShadow();
    ctx.save();
    if (this.dead && !hasAnim('estagiario', 'death')) ctx.globalAlpha = Math.max(0, 1 - (this.deadTimer || 0) * 1.6);
    const action = this.dead ? 'death'
      : this.state === 'summon' ? 'summon'
      : this.state === 'attack' ? 'attack'
      : this.state === 'hurt' && hasAnim('estagiario', 'hurt') ? 'hurt'
      : 'walk';
    this.drawSprite('estagiario', action, (sx, sy) => {
      drawPlaceholderHumanoid(sx, sy, { body: '#3a5a8a', head: '#e8c098', accent: '#ff8800', facing: this.facing, t: time, mul: 1.35 });
      ctx.fillStyle = '#fff'; ctx.fillRect(sx - 8, sy - 76, 14, 9); // crachÃ¡
    });
    ctx.restore();
    if (!this.dead) drawBossBar(this);
  }
}

// ---- CHEFÃƒO Fase 1: DONALD TRUNFO ----
class Trunfo extends Entity {
  constructor(x, gy) {
    super(x, gy);
    this.hp = this.maxHp = 320;
    this.speed = 60;
    this.scaleMul = 1.45;
    this.isBoss = true;
    this.nameKey = 'trunfo';
    this.bossName = 'ðŸ‘‘ DONALD TRUNFO â€” o maior entendedor de AGI do mundo (ele diz) ðŸ‘‘';
    this.attackCd = 2;
    this.talkCd = 4;
    this.rageLevel = 0; // sobe a cada 25% de vida perdida: MUDA DE OPINIÃƒO
    this.meleeCd = 0;
  }
  update() {
    this.hitFlash = Math.max(0, this.hitFlash - dt);
    if (this.dead) {
      this.deadTimer = (this.deadTimer || 0) + dt;
      if (this.deadTimer > 1.2) this.removeMe = true;
      return;
    }
    // mudanÃ§a de opiniÃ£o a cada 25% de vida
    const lostQuarters = Math.floor((1 - this.hp / this.maxHp) * 4);
    if (lostQuarters > this.rageLevel) {
      this.rageLevel = lostQuarters;
      const flips = TR('trunfoFlips') || [
        'REGULAMENTAÃ‡ÃƒO Ã‰ CRIME!',
        'EU SEMPRE AMEI A REGULAMENTAÃ‡ÃƒO!',
        'A AGI Ã‰ MINHA! SEMPRE FOI!',
      ];
      const flipPrefix = TR('trunfoFlipPrefix') || 'ðŸ’¢ MUDEI DE OPINIÃƒO: ';
      spawnText(this.screenX, this.screenY - 170, flipPrefix + flips[Math.min(this.rageLevel - 1, 2)], '#ff6644', 1.3);
      shake = 0.3; sfx.boss();
      this.attackCd = 0.8; // fica mais agressivo
    }

    this.talkCd -= dt;
    if (this.talkCd <= 0) {
      this.talkCd = 5 + Math.random() * 3;
      const falas = TR('trunfo') || ['FAKE NEWS!', 'TARIFA NELES!', 'NinguÃ©m sabe mais de AGI que eu!', 'Vou construir um MURO de firewall!', 'Isso Ã© caÃ§a Ã s bruxas!'];
      spawnText(this.screenX, this.screenY - 150, falas[Math.floor(Math.random() * falas.length)], '#ffaa55', 1.1);
    }

    const dx = player.x - this.x, dy = player.gy - this.gy;
    this.facing = Math.sign(dx) || 1;
    this.attackCd -= dt;
    this.meleeCd -= dt;

    if (this.state === 'sign') {
      // assinando canetadas
      const done = this.advanceAnim(10, hasAnim('trunfo', 'attack_sign') ? 6 : 4, false);
      if (this.frame === 3 && !this.hitDone) {
        this.hitDone = true;
        sfx.throw();
        const volley = 2 + this.rageLevel; // fica pior conforme muda de opiniÃ£o
        for (let i = 0; i < volley; i++) {
          projectiles.push({
            x: this.x + this.facing * 30,
            gy: this.gy + (i - (volley - 1) / 2) * 26,
            h: 60,
            vx: this.facing * (260 + this.rageLevel * 40),
            vy: (player.gy - this.gy) * 0.35,
            dmg: 7, t: 0,
          });
        }
        spawnText(this.screenX, this.screenY - 130, TR('canetada') || 'âœ CANETADA!', '#ffd23f', 1.2);
      }
      if (done) { this.setState('idle'); this.attackCd = Math.max(1.2, 2.6 - this.rageLevel * 0.4); }
      return;
    }
    if (this.state === 'swipe') {
      // canetada corpo-a-corpo (a caneta Ã© GRANDE)
      const done = this.advanceAnim(12, hasAnim('trunfo', 'attack_rage') ? 6 : 4, false);
      if (this.frame === 2 && !this.hitDone) {
        this.hitDone = true;
        if (Math.abs(player.x - this.x) < 95 && Math.abs(player.gy - this.gy) < 24) {
          player.takeHit(12, this.facing);
        }
      }
      if (done) { this.setState('idle'); this.meleeCd = 1.5; }
      return;
    }
    if (this.state === 'hurtstate') {
      // cambaleia (bonÃ© torto!) depois de um golpe forte
      if (this.advanceAnim(10, hasAnim('trunfo', 'hurt') ? 4 : 2, false)) this.setState('idle');
      return;
    }

    // movimento: mantÃ©m distÃ¢ncia mÃ©dia pra canetar
    const dist = Math.abs(dx);
    if (dist < 120 && this.meleeCd <= 0) {
      this.setState('swipe'); this.hitDone = false;
      return;
    }
    if (this.attackCd <= 0) {
      this.setState('sign'); this.hitDone = false;
      return;
    }
    const wantDist = 240;
    const dir = dist > wantDist ? Math.sign(dx) : -Math.sign(dx);
    this.x += dir * this.speed * (0.8 + this.rageLevel * 0.15) * dt;
    this.x = Math.max(camX + 60, Math.min(camX + W - 60, this.x));
    if (Math.abs(dy) > 10) this.gy += Math.sign(dy) * this.speed * 0.5 * dt;
    this.gy = Math.max(GROUND_TOP, Math.min(GROUND_BOTTOM, this.gy));
    // anda com pompa quando estÃ¡ longe da posiÃ§Ã£o desejada
    if (Math.abs(dist - wantDist) > 40 && hasAnim('trunfo', 'walk')) {
      this.setStateIf('walk');
      this.advanceAnim(8, 6);
    } else {
      this.setStateIf('idle');
      this.advanceAnim(6, hasAnim('trunfo', 'idle') ? 4 : 2);
    }
  }
  takeHit(dmg, dir, isSpecial) {
    this.hp -= dmg;
    this.hitFlash = 0.12;
    this.x += dir * (isSpecial ? 24 : 6); // pesado: quase nÃ£o recua
    spawnText(this.screenX, this.screenY - 150, `${dmg}`, '#ffd23f');
    if (this.hp <= 0 && !this.dead) {
      this.dead = true;
      this.setState('hurtstate'); // cai cambaleando
      sfx.enemyDie(); shake = 0.5;
      player.score += 2000;
      bossDefeated = true;
    } else if (isSpecial && !this.dead && this.state !== 'sign' && this.state !== 'swipe') {
      this.setState('hurtstate'); // golpe especial faz atÃ© ele cambalear
    }
  }
  draw() {
    if (!this.dead) this.drawShadow(30);
    ctx.save();
    if (this.dead) ctx.globalAlpha = Math.max(0, 1 - (this.deadTimer || 0) * 0.8);
    const action = this.state === 'sign' && hasAnim('trunfo', 'attack_sign') ? 'attack_sign'
                 : this.state === 'swipe' && hasAnim('trunfo', 'attack_rage') ? 'attack_rage'
                 : (this.state === 'hurtstate' || this.dead) && hasAnim('trunfo', 'hurt') ? 'hurt'
                 : this.state === 'walk' && hasAnim('trunfo', 'walk') ? 'walk'
                 : 'idle';
    this.drawSprite('trunfo', action, (sx, sy) =>
      drawPlaceholderHumanoid(sx, sy, { body: '#1d3a8a', head: '#f0a050', accent: '#c02020', label: 'TRUNFO', facing: this.facing, t: time, mul: 1.45 }));
    ctx.restore();
    if (!this.dead) drawBossBar(this);
  }
}

// ---- CHEFÃƒO Fase 2: ILON MOSCA ----
class Ilon extends Entity {
  constructor(x, gy) {
    super(x, gy);
    this.hp = this.maxHp = 300;
    this.speed = 90;
    this.scaleMul = 1.45;
    this.isBoss = true;
    this.nameKey = 'ilon';
    this.bossName = 'ðŸš€ ILON MOSCA â€” CEO de 14 empresas e do seu futuro desemprego ðŸš€';
    this.attackCd = 2.2;
    this.summonCd = 4;
    this.talkCd = 5;
    this.rageLevel = 0;
  }
  get screenY() { // paira na plataforma-foguete
    return this.gy - this.jumpH - (this.dead ? 0 : 8 + Math.sin(time * 2.5) * 6);
  }
  update() {
    this.hitFlash = Math.max(0, this.hitFlash - dt);
    if (this.dead) {
      this.deadTimer = (this.deadTimer || 0) + dt;
      if (this.deadTimer > 1.2) this.removeMe = true;
      return;
    }
    // corte de custos a cada 25% de vida: DEMITE os prÃ³prios robÃ´s
    const lostQuarters = Math.floor((1 - this.hp / this.maxHp) * 4);
    if (lostQuarters > this.rageLevel) {
      this.rageLevel = lostQuarters;
      spawnText(this.screenX, this.screenY - 170, TR('ilonCorte') || 'ðŸ“‰ CORTE DE CUSTOS! TODO MUNDO DEMITIDO!', '#ff6644', 1.3);
      for (const e of enemies) if (e instanceof OptimusBot) e.demitir();
      shake = 0.3; sfx.boss();
      this.attackCd = 0.6;
    }
    this.talkCd -= dt;
    if (this.talkCd <= 0) {
      this.talkCd = 5 + Math.random() * 3;
      const falas = TR('ilon') || ['Trabalhe 80 horas ou saia!', 'Isso Ã© sÃ³ o protÃ³tipo do meu plano!', 'Vou tuitar sobre essa luta!', 'Renda bÃ¡sica pra vocÃª. O resto pra mim.', 'Comprei essa fase. Agora Ã© minha.'];
      spawnText(this.screenX, this.screenY - 150, falas[Math.floor(Math.random() * falas.length)], '#88ddff', 1.1);
    }
    const dx = player.x - this.x, dy = player.gy - this.gy;
    this.facing = Math.sign(dx) || 1;
    this.attackCd -= dt;
    this.summonCd -= dt;

    if (this.state === 'tweet') {
      const done = this.advanceAnim(10, hasAnim('ilon', 'attack_tweet') ? 6 : 4, false);
      if (this.frame === 3 && !this.hitDone) {
        this.hitDone = true;
        sfx.throw();
        const volley = 2 + Math.floor(this.rageLevel / 2);
        for (let i = 0; i < volley; i++) {
          projectiles.push({
            type: 'tweet',
            x: this.x + this.facing * 30,
            gy: this.gy + (i - (volley - 1) / 2) * 30,
            h: 90,
            vx: this.facing * (300 + this.rageLevel * 30),
            vy: (player.gy - this.gy) * 0.4,
            dmg: 6, t: 0,
          });
        }
        spawnText(this.screenX, this.screenY - 130, TR('ilonTweet') || 'ðŸ“± TUITADA!', '#88ddff', 1.2);
      }
      if (done) { this.setState('idle'); this.attackCd = Math.max(1.1, 2.4 - this.rageLevel * 0.3); }
      return;
    }
    if (this.state === 'command') {
      const done = this.advanceAnim(10, hasAnim('ilon', 'attack_command') ? 6 : 4, false);
      if (this.frame === 3 && !this.hitDone) {
        this.hitDone = true;
        spawnText(this.screenX, this.screenY - 150, TR('ilonRobots') || 'ROBÃ”S: PRODUTIVIDADE MÃXIMA!', '#ffaa55', 1.2);
        enemies.push(new OptimusBot(camX + W + 80, this.gy - 30));
        enemies.push(new OptimusBot(camX - 80, this.gy + 20));
      }
      if (done) { this.setState('idle'); this.summonCd = 7; }
      return;
    }
    if (this.state === 'hurtstate') {
      if (this.advanceAnim(10, hasAnim('ilon', 'hurt') ? 4 : 2, false)) this.setState('idle');
      return;
    }

    if (this.summonCd <= 0 && enemies.filter(e => e instanceof OptimusBot && !e.dead).length < 4) {
      this.setState('command'); this.hitDone = false;
      return;
    }
    if (this.attackCd <= 0) {
      this.setState('tweet'); this.hitDone = false;
      return;
    }
    // gosta de pairar mantendo distÃ¢ncia (deixa os robÃ´s apanharem por ele)
    const wantDist = 280;
    const dist = Math.abs(dx);
    const dir = dist > wantDist ? Math.sign(dx) : -Math.sign(dx);
    this.x += dir * this.speed * dt;
    this.x = Math.max(camX + 60, Math.min(camX + W - 60, this.x));
    if (Math.abs(dy) > 10) this.gy += Math.sign(dy) * this.speed * 0.4 * dt;
    this.gy = Math.max(GROUND_TOP, Math.min(GROUND_BOTTOM, this.gy));
    if (Math.abs(dist - wantDist) > 50 && hasAnim('ilon', 'move')) {
      this.setStateIf('move'); this.advanceAnim(8, 6);
    } else {
      this.setStateIf('idle'); this.advanceAnim(6, hasAnim('ilon', 'idle') ? 4 : 2);
    }
  }
  takeHit(dmg, dir, isSpecial) {
    this.hp -= dmg;
    this.hitFlash = 0.12;
    this.x += dir * (isSpecial ? 24 : 6);
    spawnText(this.screenX, this.screenY - 150, `${dmg}`, '#ffd23f');
    if (this.hp <= 0 && !this.dead) {
      this.dead = true;
      this.setState('hurtstate');
      sfx.enemyDie(); shake = 0.5;
      player.score += 2000;
      bossDefeated = true;
    } else if (isSpecial && !this.dead && !['tweet', 'command'].includes(this.state)) {
      this.setState('hurtstate');
    }
  }
  draw() {
    if (!this.dead) this.drawShadow(30);
    ctx.save();
    if (this.dead) ctx.globalAlpha = Math.max(0, 1 - (this.deadTimer || 0) * 0.8);
    const action = this.state === 'tweet' && hasAnim('ilon', 'attack_tweet') ? 'attack_tweet'
                 : this.state === 'command' && hasAnim('ilon', 'attack_command') ? 'attack_command'
                 : (this.state === 'hurtstate' || this.dead) && hasAnim('ilon', 'hurt') ? 'hurt'
                 : this.state === 'move' && hasAnim('ilon', 'move') ? 'move'
                 : 'idle';
    this.drawSprite('ilon', action, (sx, sy) =>
      drawPlaceholderHumanoid(sx, sy, { body: '#222', head: '#e8c098', accent: '#88ddff', label: 'ILON', facing: this.facing, t: time, mul: 1.45 }));
    ctx.restore();
    if (!this.dead) drawBossBar(this);
  }
}

// ---- CHEFÃƒO Fase 3: SAMUCA ALTÃSSIMO ----
const LANCAMENTOS = ['TURBO-4o-mini-max', 'AGI-quase-1', 'o1-mium PRO', 'Sorvete-Que-Some', 'Assinatura Ultra Plus+'];
class Samuca extends Entity {
  constructor(x, gy) {
    super(x, gy);
    this.hp = this.maxHp = 340;
    this.speed = 75;
    this.scaleMul = 1.45;
    this.isBoss = true;
    this.nameKey = 'samuca';
    this.bossName = 'ðŸ’¸ SAMUCA ALTÃSSIMO â€” lucro mÃ¡ximo, fins lucrativos nenhum* ðŸ’¸';
    this.attackCd = 2;
    this.launchCd = 8;
    this.talkCd = 5;
    this.rageLevel = 0;
    this.doubleBox = false;
  }
  update() {
    this.hitFlash = Math.max(0, this.hitFlash - dt);
    if (this.dead) {
      this.deadTimer = (this.deadTimer || 0) + dt;
      if (this.deadTimer > 1.2) this.removeMe = true;
      return;
    }
    const lostQuarters = Math.floor((1 - this.hp / this.maxHp) * 4);
    if (lostQuarters > this.rageLevel) this.rageLevel = lostQuarters;

    this.talkCd -= dt;
    if (this.talkCd <= 0) {
      this.talkCd = 5 + Math.random() * 3;
      const falas = TR('samuca') || ['Feedback Ã© bem-vindo!', 'Isso Ã© uma experiÃªncia antecipada!', 'Assina aqui, aqui e aqui.', 'AGI ano que vem. Confia.', 'Sua derrota Ã© beneficial for humanity*'];
      spawnText(this.screenX, this.screenY - 150, falas[Math.floor(Math.random() * falas.length)], '#aaffcc', 1.1);
    }
    const dx = player.x - this.x, dy = player.gy - this.gy;
    this.facing = Math.sign(dx) || 1;
    this.attackCd -= dt;
    this.launchCd -= dt;

    if (this.state === 'box') {
      const done = this.advanceAnim(10, hasAnim('samuca', 'attack_box') ? 6 : 4, false);
      if (this.frame === 3 && !this.hitDone) {
        this.hitDone = true;
        sfx.throw();
        const n = this.doubleBox ? 2 : 1;
        for (let i = 0; i < n; i++) {
          projectiles.push({
            type: 'box',
            x: this.x + this.facing * 30,
            gy: player.gy + (i === 1 ? 40 : 0),
            h: 70,
            vx: this.facing * 250,
            vy: 0,
            range: Math.abs(dx) + 60,
            dmg: 9, t: 0,
          });
        }
        spawnText(this.screenX, this.screenY - 130, TR('samucaBox') || 'ðŸ“¦ PRODUTO NOVO!', '#aaffcc', 1.2);
      }
      if (done) { this.setState('idle'); this.attackCd = Math.max(1.2, 2.4 - this.rageLevel * 0.3); }
      return;
    }
    if (this.state === 'launch') {
      const done = this.advanceAnim(8, hasAnim('samuca', 'attack_launch') ? 6 : 4, false);
      if (this.frame === 3 && !this.hitDone) {
        this.hitDone = true;
        // 30% de chance da demo FALHAR no palco
        if (Math.random() < 0.3) {
          spawnText(this.screenX, this.screenY - 170, TR('samucaFail') || 'ðŸ’¥ A DEMO TRAVOU NA FRENTE DE TODO MUNDO!', '#ff6644', 1.3);
          this.stunned = 2.5;
          sfx.hurt();
        } else {
          const nome = LANCAMENTOS[Math.floor(Math.random() * LANCAMENTOS.length)];
          spawnText(this.screenX, this.screenY - 170, fmt(TR('samucaLaunch') || 'ðŸš€ LANÃ‡AMENTO: {n}!', nome), '#ffd23f', 1.3);
          const buffs = TR('samucaBuffs') || ['+velocidade de entrega!', 'agora vem em DOBRO!', 'o hype CURA!'];
          const buff = Math.floor(Math.random() * 3);
          if (buff === 0) { this.speed += 20; spawnText(this.screenX, this.screenY - 140, buffs[0], '#aaffcc'); }
          if (buff === 1) { this.doubleBox = true; spawnText(this.screenX, this.screenY - 140, buffs[1], '#aaffcc'); }
          if (buff === 2) { this.hp = Math.min(this.maxHp, this.hp + 20); spawnText(this.screenX, this.screenY - 140, buffs[2], '#aaffcc'); }
          spawnPopup(); // e a tela do jogador ganha um pop-up de brinde
        }
      }
      if (done) { this.setState('idle'); this.launchCd = 9; }
      return;
    }
    if (this.state === 'hurtstate') {
      if (this.advanceAnim(10, hasAnim('samuca', 'hurt') ? 4 : 2, false)) this.setState('idle');
      return;
    }
    if (this.stunned > 0) {
      this.stunned -= dt;
      this.setStateIf('hurtstate2'); // congelado no palco
      this.frame = 0;
      return;
    }

    if (this.launchCd <= 0) { this.setState('launch'); this.hitDone = false; return; }
    if (this.attackCd <= 0) { this.setState('box'); this.hitDone = false; return; }

    const wantDist = 230;
    const dist = Math.abs(dx);
    const dir = dist > wantDist ? Math.sign(dx) : -Math.sign(dx);
    this.x += dir * this.speed * dt;
    this.x = Math.max(camX + 60, Math.min(camX + W - 60, this.x));
    if (Math.abs(dy) > 10) this.gy += Math.sign(dy) * this.speed * 0.5 * dt;
    this.gy = Math.max(GROUND_TOP, Math.min(GROUND_BOTTOM, this.gy));
    if (Math.abs(dist - wantDist) > 40 && hasAnim('samuca', 'walk')) {
      this.setStateIf('walk'); this.advanceAnim(8, 6);
    } else {
      this.setStateIf('idle'); this.advanceAnim(6, hasAnim('samuca', 'idle') ? 4 : 2);
    }
  }
  takeHit(dmg, dir, isSpecial) {
    const bonus = this.stunned > 0 ? 1.5 : 1; // travado no palco = vulnerÃ¡vel!
    const total = Math.round(dmg * bonus);
    this.hp -= total;
    this.hitFlash = 0.12;
    this.x += dir * (isSpecial ? 24 : 6);
    spawnText(this.screenX, this.screenY - 150, `${total}${bonus > 1 ? '!' : ''}`, bonus > 1 ? '#ff8833' : '#ffd23f');
    if (this.hp <= 0 && !this.dead) {
      this.dead = true;
      this.setState('hurtstate');
      sfx.enemyDie(); shake = 0.5;
      player.score += 2200;
      bossDefeated = true;
    } else if (isSpecial && !this.dead && !['box', 'launch'].includes(this.state)) {
      this.setState('hurtstate');
    }
  }
  draw() {
    if (!this.dead) this.drawShadow(30);
    ctx.save();
    if (this.dead) ctx.globalAlpha = Math.max(0, 1 - (this.deadTimer || 0) * 0.8);
    const action = this.state === 'box' && hasAnim('samuca', 'attack_box') ? 'attack_box'
                 : this.state === 'launch' && hasAnim('samuca', 'attack_launch') ? 'attack_launch'
                 : (this.state === 'hurtstate' || this.state === 'hurtstate2' || this.dead) && hasAnim('samuca', 'hurt') ? 'hurt'
                 : this.state === 'walk' && hasAnim('samuca', 'walk') ? 'walk'
                 : 'idle';
    this.drawSprite('samuca', action, (sx, sy) =>
      drawPlaceholderHumanoid(sx, sy, { body: '#888', head: '#e8c098', accent: '#aaffcc', label: 'SAMUCA', facing: this.facing, t: time, mul: 1.45 }));
    if (this.stunned > 0) {
      ctx.font = '18px serif'; ctx.textAlign = 'center';
      ctx.fillText('ðŸ’«', this.screenX, this.screenY - 150);
    }
    ctx.restore();
    if (!this.dead) drawBossBar(this);
  }
}

// ---- CHEFÃƒO Fase 4: DÃRIO AMÃ”-DEI ----
class Dario extends Entity {
  constructor(x, gy) {
    super(x, gy);
    this.hp = this.maxHp = 360;
    this.speed = 65;
    this.scaleMul = 1.45;
    this.isBoss = true;
    this.nameKey = 'dario';
    this.bossName = 'ðŸ˜‡ DÃRIO AMÃ”-DEI â€” liberdade, seguranÃ§a e os dados da sua mÃ£e ðŸ˜‡';
    this.attackCd = 2.5;
    this.essayCd = 9;
    this.talkCd = 5;
    this.rageLevel = 0;
    this.choked = 0;
  }
  update() {
    this.hitFlash = Math.max(0, this.hitFlash - dt);
    if (this.dead) {
      this.deadTimer = (this.deadTimer || 0) + dt;
      if (this.deadTimer > 1.2) this.removeMe = true;
      return;
    }
    const lostQuarters = Math.floor((1 - this.hp / this.maxHp) * 4);
    if (lostQuarters > this.rageLevel) {
      this.rageLevel = lostQuarters;
      spawnText(this.screenX, this.screenY - 170, TR('darioRage') || 'ðŸ˜‡ "Isso Ã© pela seguranÃ§a de TODOS."', '#ccccff', 1.2);
      this.attackCd = 0.8;
    }
    this.talkCd -= dt;
    if (this.talkCd <= 0) {
      this.talkCd = 5 + Math.random() * 3;
      const falas = TR('dario') || ['Seus dados jÃ¡ sÃ£o meus.', 'Vou escrever 15 mil palavras sobre essa luta.', 'Minha mÃ£e entendeu. VocÃª vai entender.', 'Ã‰ pra sua seguranÃ§a. Confia.', 'Interessante... *anota tudo*'];
      spawnText(this.screenX, this.screenY - 150, falas[Math.floor(Math.random() * falas.length)], '#ccccff', 1.1);
    }
    const dx = player.x - this.x, dy = player.gy - this.gy;
    this.facing = Math.sign(dx) || 1;
    this.attackCd -= dt;
    this.essayCd -= dt;

    if (this.choked > 0) {
      // engasgado com dado sintÃ©tico: janela de ataque!
      this.choked -= dt;
      this.setStateIf('hurtstate2');
      this.frame = 0;
      return;
    }

    if (this.state === 'vacuum') {
      this.vacuumT -= dt;
      this.advanceAnim(10, hasAnim('dario', 'attack_vacuum') ? 6 : 4, true);
      const range = 420;
      // suga o herÃ³i
      if (Math.abs(dx) < range && Math.abs(dy) < 60) {
        player.x += Math.sign(this.x - player.x) * 135 * dt;
        player.special = Math.max(0, player.special - 10 * dt); // aspira atÃ© seu especial!
        if (Math.abs(player.x - this.x) < 80 && !this.biteDone) {
          this.biteDone = true;
          player.takeHit(10, this.facing * -1);
        }
      }
      // suga os itens de cura (e come)
      for (const d of drops) {
        if (Math.abs(d.x - this.x) < range) {
          d.x += Math.sign(this.x - d.x) * 180 * dt;
          if (Math.abs(d.x - this.x) < 40) {
            d.remove = true;
            this.hp = Math.min(this.maxHp, this.hp + 6);
            spawnText(this.screenX, this.screenY - 130, TR('darioNhac') || '*nhac* +6', '#ccccff');
          }
        }
      }
      // suga o LORO â†’ engasga com dado sintÃ©tico!
      const ldx = this.x - companion.x;
      if (Math.abs(ldx) < range) {
        companion.x += Math.sign(ldx) * 220 * dt;
        if (Math.abs(companion.x - this.x) < 90) {
          this.setState('idle');
          this.choked = 2.8;
          this.attackCd = 3;
          companion.x = player.x - 70; // Loro escapa cuspido
          spawnText(this.screenX, this.screenY - 170, TR('darioChoke') || 'ðŸ¤¢ ENGASGOU COM DADO SINTÃ‰TICO!', '#66ff88', 1.3);
          spawnText(companion.x - camX, companion.gy - 130, TR('loroChoke') || 'ðŸ¦œ me GEROU nÃ£o, me ENGOLIU nÃ£o!', '#66ff88', 1.1);
          sfx.hurt(); shake = 0.25;
          return;
        }
      }
      if (this.vacuumT <= 0) { this.setState('idle'); this.attackCd = 2.2 - this.rageLevel * 0.3; }
      return;
    }
    if (this.state === 'essay') {
      const done = this.advanceAnim(9, hasAnim('dario', 'attack_essay') ? 6 : 4, false);
      if (this.frame === 3 && !this.hitDone) {
        this.hitDone = true;
        spawnText(this.screenX, this.screenY - 170, TR('darioEssay') || 'ðŸ“œ ENSAIO: "MÃQUINAS DA GRAÃ‡A AMOROSA" (15.000 palavras)', '#ccccff', 1.2);
        const n = 4 + this.rageLevel;
        for (let i = 0; i < n; i++) {
          projectiles.push({
            type: 'paragrafo',
            x: player.x + (Math.random() - 0.5) * 300,
            gy: Math.max(GROUND_TOP, Math.min(GROUND_BOTTOM, player.gy + (Math.random() - 0.5) * 100)),
            h: 300 + i * 60, // caem em sequÃªncia
            vx: 0, vy: 0, dmg: 8, t: 0,
          });
        }
        sfx.throw();
      }
      if (done) { this.setState('idle'); this.essayCd = 10; }
      return;
    }
    if (this.state === 'hurtstate') {
      if (this.advanceAnim(10, hasAnim('dario', 'hurt') ? 4 : 2, false)) this.setState('idle');
      return;
    }

    if (this.essayCd <= 0) { this.setState('essay'); this.hitDone = false; return; }
    if (this.attackCd <= 0) {
      this.setState('vacuum');
      this.vacuumT = 2.6 + this.rageLevel * 0.4;
      this.biteDone = false;
      spawnText(this.screenX, this.screenY - 150, TR('darioVacuum') || 'ðŸŒ€ MODO ASPIRADOR!', '#ccccff', 1.2);
      return;
    }
    const wantDist = 260;
    const dist = Math.abs(dx);
    const dir = dist > wantDist ? Math.sign(dx) : -Math.sign(dx);
    this.x += dir * this.speed * dt;
    this.x = Math.max(camX + 60, Math.min(camX + W - 60, this.x));
    if (Math.abs(dy) > 10) this.gy += Math.sign(dy) * this.speed * 0.5 * dt;
    this.gy = Math.max(GROUND_TOP, Math.min(GROUND_BOTTOM, this.gy));
    if (Math.abs(dist - wantDist) > 40 && hasAnim('dario', 'walk')) {
      this.setStateIf('walk'); this.advanceAnim(8, 6);
    } else {
      this.setStateIf('idle'); this.advanceAnim(6, hasAnim('dario', 'idle') ? 4 : 2);
    }
  }
  takeHit(dmg, dir, isSpecial) {
    const bonus = this.choked > 0 ? 1.5 : 1; // engasgado = vulnerÃ¡vel!
    const total = Math.round(dmg * bonus);
    this.hp -= total;
    this.hitFlash = 0.12;
    this.x += dir * (isSpecial ? 24 : 6);
    spawnText(this.screenX, this.screenY - 150, `${total}${bonus > 1 ? '!' : ''}`, bonus > 1 ? '#66ff88' : '#ffd23f');
    if (this.hp <= 0 && !this.dead) {
      this.dead = true;
      this.setState('hurtstate');
      sfx.enemyDie(); shake = 0.5;
      player.score += 2400;
      bossDefeated = true;
    } else if (isSpecial && !this.dead && !['vacuum', 'essay'].includes(this.state)) {
      this.setState('hurtstate');
    }
  }
  draw() {
    if (!this.dead) this.drawShadow(30);
    ctx.save();
    if (this.dead) ctx.globalAlpha = Math.max(0, 1 - (this.deadTimer || 0) * 0.8);
    const action = this.state === 'vacuum' && hasAnim('dario', 'attack_vacuum') ? 'attack_vacuum'
                 : this.state === 'essay' && hasAnim('dario', 'attack_essay') ? 'attack_essay'
                 : (this.state === 'hurtstate' || this.state === 'hurtstate2' || this.dead) && hasAnim('dario', 'hurt') ? 'hurt'
                 : this.state === 'walk' && hasAnim('dario', 'walk') ? 'walk'
                 : 'idle';
    this.drawSprite('dario', action, (sx, sy) =>
      drawPlaceholderHumanoid(sx, sy, { body: '#1d3a5a', head: '#e8c098', accent: '#ccccff', label: 'DÃRIO', facing: this.facing, t: time, mul: 1.45 }));
    if (this.choked > 0) {
      ctx.font = '18px serif'; ctx.textAlign = 'center';
      ctx.fillText('ðŸ¤¢', this.screenX, this.screenY - 150);
    }
    if (this.state === 'vacuum') {
      // linhas de sucÃ§Ã£o
      ctx.save();
      ctx.strokeStyle = '#ccccff55'; ctx.lineWidth = 2;
      for (let i = 0; i < 5; i++) {
        const off = ((time * 300 + i * 80) % 400);
        const lx = this.screenX - this.facing * off;
        ctx.beginPath();
        ctx.moveTo(lx, this.screenY - 60 + Math.sin(time * 8 + i) * 14);
        ctx.lineTo(lx + this.facing * 30, this.screenY - 60);
        ctx.stroke();
      }
      ctx.restore();
    }
    ctx.restore();
    if (!this.dead) drawBossBar(this);
  }
}

// ---- CHEFÃƒO Fase 5: XI DEEP-ZEEK ----
class DeepZeek extends Entity {
  constructor(x, gy) {
    super(x, gy);
    this.hp = this.maxHp = 380;
    this.speed = 85;
    this.scaleMul = 1.9; // dragÃ£o GRANDE
    this.isBoss = true;
    this.nameKey = 'deepzeek';
    this.bossName = 'ðŸ‰ XI DEEP-ZEEK â€” treina por 1/10 do preÃ§o e nÃ£o conta como ðŸ‰';
    this.attackCd = 2.2;
    this.cloneCd = 6;
    this.talkCd = 5;
    this.rageLevel = 0;
    this.openSourced = false;
  }
  get screenY() { // serpenteia flutuando
    return this.gy - this.jumpH - (this.dead ? 0 : 14 + Math.sin(time * 2) * 10);
  }
  update() {
    this.hitFlash = Math.max(0, this.hitFlash - dt);
    if (this.dead) {
      this.deadTimer = (this.deadTimer || 0) + dt;
      if (this.deadTimer > 1.2) this.removeMe = true;
      return;
    }
    const lostQuarters = Math.floor((1 - this.hp / this.maxHp) * 4);
    if (lostQuarters > this.rageLevel) this.rageLevel = lostQuarters;

    // aos 50%: RELEASE OPEN-SOURCE â€” clones passam a lutar DO SEU LADO
    if (!this.openSourced && this.hp <= this.maxHp / 2) {
      this.openSourced = true;
      spawnText(this.screenX, this.screenY - 200, TR('deepzeekOpen') || 'ðŸ‰ RELEASE OPEN-SOURCE! PESOS LIBERADOS!', '#88ffcc', 1.4);
      allies.push(new CloneAliado(this.x - 200, this.gy - 30));
      allies.push(new CloneAliado(this.x - 240, this.gy + 30));
      player.hp = Math.min(player.maxHp, player.hp + 15);
      spawnText(player.screenX, player.screenY - 130, TR('deepzeekHeal') || '+15 (pesos abertos curam a alma)', '#88ffcc');
      shake = 0.3; sfx.special();
    }

    this.talkCd -= dt;
    if (this.talkCd <= 0) {
      this.talkCd = 5 + Math.random() * 3;
      const falas = TR('deepzeek') || ['Metade do orÃ§amento. Dobro do resultado.', '*escaneia* â€” golpe catalogado.', 'Querem chÃ¡?', 'Seu itinerÃ¡rio eu jÃ¡ conhecia hÃ¡ 3 semanas.', 'Ineficiente. Mas corajoso.'];
      spawnText(this.screenX, this.screenY - 180, falas[Math.floor(Math.random() * falas.length)], '#ff8888', 1.1);
    }
    const dx = player.x - this.x, dy = player.gy - this.gy;
    this.facing = Math.sign(dx) || 1;
    this.attackCd -= dt;
    this.cloneCd -= dt;

    if (this.state === 'clone') {
      const done = this.advanceAnim(9, hasAnim('deepzeek', 'attack_clone') ? 6 : 4, false);
      if (this.frame === 3 && !this.hitDone) {
        this.hitDone = true;
        spawnText(this.screenX, this.screenY - 180, TR('deepzeekClone') || 'âš¡ CLONADO. CUSTO: 1/10.', '#88ffcc', 1.2);
        enemies.push(new CloneTemu(camX + W + 80, this.gy + (Math.random() - 0.5) * 60));
      }
      if (done) { this.setState('idle'); this.cloneCd = 8; }
      return;
    }
    if (this.state === 'breath') {
      const done = this.advanceAnim(10, hasAnim('deepzeek', 'attack_breath') ? 6 : 4, false);
      if (this.frame === 3 && !this.hitDone) {
        this.hitDone = true;
        sfx.throw();
        const n = 4 + this.rageLevel;
        for (let i = 0; i < n; i++) {
          projectiles.push({
            type: 'binary',
            bit: Math.random() < 0.5 ? '0' : '1',
            x: this.x + this.facing * 60,
            gy: this.gy,
            h: 100,
            vx: this.facing * (280 + i * 25),
            vy: (player.gy - this.gy) * 0.4 + (i - n / 2) * 18,
            dmg: 5, t: 0,
          });
        }
        spawnText(this.screenX, this.screenY - 170, TR('deepzeekBreath') || 'ðŸ”¥ SOPRO BINÃRIO!', '#ff8888', 1.2);
      }
      if (done) { this.setState('idle'); this.attackCd = Math.max(1.2, 2.4 - this.rageLevel * 0.3); }
      return;
    }
    if (this.state === 'hurtstate') {
      if (this.advanceAnim(10, hasAnim('deepzeek', 'hurt') ? 4 : 2, false)) this.setState('idle');
      return;
    }

    if (this.cloneCd <= 0 && enemies.filter(e => e instanceof CloneTemu && !e.dead).length < 2) {
      this.setState('clone'); this.hitDone = false;
      return;
    }
    if (this.attackCd <= 0) {
      this.setState('breath'); this.hitDone = false;
      return;
    }
    const wantDist = 300;
    const dist = Math.abs(dx);
    const dir = dist > wantDist ? Math.sign(dx) : -Math.sign(dx);
    this.x += dir * this.speed * dt;
    this.x = Math.max(camX + 80, Math.min(camX + W - 80, this.x));
    if (Math.abs(dy) > 10) this.gy += Math.sign(dy) * this.speed * 0.4 * dt;
    this.gy = Math.max(GROUND_TOP, Math.min(GROUND_BOTTOM, this.gy));
    if (Math.abs(dist - wantDist) > 60 && hasAnim('deepzeek', 'move')) {
      this.setStateIf('move'); this.advanceAnim(8, 6);
    } else {
      this.setStateIf('idle'); this.advanceAnim(6, hasAnim('deepzeek', 'idle') ? 4 : 2);
    }
  }
  takeHit(dmg, dir, isSpecial) {
    this.hp -= dmg;
    this.hitFlash = 0.12;
    this.x += dir * (isSpecial ? 20 : 4); // dragÃ£o pesado
    spawnText(this.screenX, this.screenY - 180, `${dmg}`, '#ffd23f');
    if (this.hp <= 0 && !this.dead) {
      this.dead = true;
      this.setState('hurtstate');
      sfx.enemyDie(); shake = 0.5;
      player.score += 2600;
      bossDefeated = true;
    } else if (isSpecial && !this.dead && !['clone', 'breath'].includes(this.state)) {
      this.setState('hurtstate');
    }
  }
  draw() {
    if (!this.dead) this.drawShadow(44);
    ctx.save();
    if (this.dead) ctx.globalAlpha = Math.max(0, 1 - (this.deadTimer || 0) * 0.8);
    const action = this.state === 'clone' && hasAnim('deepzeek', 'attack_clone') ? 'attack_clone'
                 : this.state === 'breath' && hasAnim('deepzeek', 'attack_breath') ? 'attack_breath'
                 : (this.state === 'hurtstate' || this.dead) && hasAnim('deepzeek', 'hurt') ? 'hurt'
                 : this.state === 'move' && hasAnim('deepzeek', 'move') ? 'move'
                 : 'idle';
    this.drawSprite('deepzeek', action, (sx, sy) => {
      ctx.font = '64px serif'; ctx.textAlign = 'center';
      ctx.fillText('ðŸ‰', sx, sy - 40);
    });
    ctx.restore();
    if (!this.dead) drawBossBar(this);
  }
}

// ---- MINI-CHEFE da Ilha Formosa: O GÃŠMEO DE LITOGRAFIA ----
class Gemeo extends Entity {
  constructor(x, gy) {
    super(x, gy);
    this.hp = this.maxHp = 240;
    this.speed = 95;
    this.scaleMul = 1.35;
    this.isBoss = true;
    this.nameKey = 'gemeo';
    this.bossName = 'ðŸ”® O GÃŠMEO DE LITOGRAFIA â€” precisÃ£o de 3 nanÃ´metros, paciÃªncia de zero ðŸ”®';
    this.attackCd = 2;
    this.talkCd = 5;
    this.rageLevel = 0;
  }
  get screenY() { return this.gy - this.jumpH - (this.dead ? 0 : 10 + Math.sin(time * 2.8) * 6); }
  update() {
    this.hitFlash = Math.max(0, this.hitFlash - dt);
    if (this.dead) {
      this.deadTimer = (this.deadTimer || 0) + dt;
      if (this.deadTimer > 1.2) this.removeMe = true;
      return;
    }
    // holograma: a cada 25% de vida, teleporta pro outro lado do herÃ³i
    const lostQuarters = Math.floor((1 - this.hp / this.maxHp) * 4);
    if (lostQuarters > this.rageLevel) {
      this.rageLevel = lostQuarters;
      spawnText(this.screenX, this.screenY - 160, TR('gemeoTele') || 'âœ¨ REALINHAMENTO Ã“PTICO!', '#cc88ff', 1.3);
      this.x = player.x > camX + W / 2 ? camX + 120 : camX + W - 120;
      this.attackCd = 0.7;
      shake = 0.2; beep(1300, 0.15, 'sine');
    }
    this.talkCd -= dt;
    if (this.talkCd <= 0) {
      this.talkCd = 5 + Math.random() * 3;
      const falas = TR('gemeo') || ['DEDOS. OLEOSOS.', 'UM ESPIRRO DESALINHA TUDO.', 'PRECISÃƒO Ã‰ AMOR.', 'VOCÃŠS TREMEM DEMAIS.'];
      spawnText(this.screenX, this.screenY - 150, falas[Math.floor(Math.random() * falas.length)], '#cc88ff', 1.1);
    }
    const dx = player.x - this.x, dy = player.gy - this.gy;
    this.facing = Math.sign(dx) || 1;
    this.attackCd -= dt;

    if (this.state === 'beam') {
      const done = this.advanceAnim(10, hasAnim('gemeo', 'attack_beam') ? 6 : 4, false);
      if (this.frame === 3 && !this.hitDone) {
        this.hitDone = true;
        sfx.throw();
        projectiles.push({
          type: 'beam',
          x: this.x + this.facing * 50,
          gy: this.gy,
          h: 70,
          vx: this.facing * 480,
          vy: (player.gy - this.gy) * 0.5,
          dmg: 10, t: 0,
        });
        spawnText(this.screenX, this.screenY - 130, TR('gemeoBeam') || 'ðŸ’œ FEIXE UV!', '#cc88ff', 1.2);
      }
      if (done) { this.setState('idle'); this.attackCd = Math.max(1, 2 - this.rageLevel * 0.25); }
      return;
    }
    if (this.state === 'hurtstate') {
      if (this.advanceAnim(10, hasAnim('gemeo', 'hurt') ? 4 : 2, false)) this.setState('idle');
      return;
    }

    if (this.attackCd <= 0) { this.setState('beam'); this.hitDone = false; return; }
    const wantDist = 260;
    const dist = Math.abs(dx);
    const dir = dist > wantDist ? Math.sign(dx) : -Math.sign(dx);
    this.x += dir * this.speed * dt;
    this.x = Math.max(camX + 60, Math.min(camX + W - 60, this.x));
    if (Math.abs(dy) > 10) this.gy += Math.sign(dy) * this.speed * 0.5 * dt;
    this.gy = Math.max(GROUND_TOP, Math.min(GROUND_BOTTOM, this.gy));
    this.setStateIf('idle');
    this.advanceAnim(6, hasAnim('gemeo', 'idle') ? 4 : 2);
  }
  takeHit(dmg, dir, isSpecial) {
    this.hp -= dmg;
    this.hitFlash = 0.12;
    this.x += dir * (isSpecial ? 22 : 5);
    spawnText(this.screenX, this.screenY - 150, `${dmg}`, '#ffd23f');
    if (this.hp <= 0 && !this.dead) {
      this.dead = true;
      this.setState('hurtstate');
      sfx.enemyDie(); shake = 0.5;
      player.score += 1800;
      bossDefeated = true;
    } else if (isSpecial && !this.dead && this.state !== 'beam') {
      this.setState('hurtstate');
    }
  }
  draw() {
    if (!this.dead) this.drawShadow(28);
    ctx.save();
    if (this.dead) ctx.globalAlpha = Math.max(0, 1 - (this.deadTimer || 0) * 0.8);
    const action = this.state === 'beam' && hasAnim('gemeo', 'attack_beam') ? 'attack_beam'
                 : (this.state === 'hurtstate' || this.dead) && hasAnim('gemeo', 'hurt') ? 'hurt'
                 : 'idle';
    this.drawSprite('gemeo', action, (sx, sy) => {
      ctx.font = '52px serif'; ctx.textAlign = 'center';
      ctx.fillText('ðŸ”®', sx, sy - 40);
    });
    ctx.restore();
    if (!this.dead) drawBossBar(this);
  }
}

// barra de chefe genÃ©rica no topo
function drawBossBar(boss) {
  if (gameState === 'bossdialog') return;
  ctx.fillStyle = '#000a'; ctx.fillRect(W / 2 - 220, 64, 440, 18);
  ctx.fillStyle = '#a30'; ctx.fillRect(W / 2 - 216, 67, 432 * (boss.hp / boss.maxHp), 12);
  ctx.font = '11px Courier New'; ctx.fillStyle = '#ffd23f'; ctx.textAlign = 'center';
  const names = TR('bossNames');
  ctx.fillText((names && names[boss.nameKey]) || boss.bossName, W / 2, 60);
}

// ---- Fundo procedural: SÃ£o Paulo (fallback) ----
const bgBuildings = [];
(function genBuildings() {
  let x = 0;
  let seed = 42;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  while (x < 4000 + 1600) {
    const w = 60 + rnd() * 90, h = 120 + rnd() * 190;
    const windows = [];
    for (let wy = 0; wy < h - 30; wy += 22)
      for (let wx = 8; wx < w - 14; wx += 18)
        if (rnd() < 0.55) windows.push([wx, wy]);
    bgBuildings.push({ x, w, h, windows, tone: 30 + Math.floor(rnd() * 25) });
    x += w + 4 + rnd() * 30;
  }
})();

function drawProceduralSP() {
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, '#0a0a2e'); grad.addColorStop(0.5, '#16163e'); grad.addColorStop(1, '#2d1b3d');
  ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#fffbe0'; ctx.beginPath(); ctx.arc(W - 140, 70, 26, 0, 7); ctx.fill();
  ctx.fillStyle = '#ffffff44';
  for (let i = 0; i < 40; i++) ctx.fillRect(((i * 137) % W), ((i * 89) % 200), 2, 2);
  for (const b of bgBuildings) {
    const sx = b.x - camX * 0.5;
    if (sx + b.w < 0 || sx > W) continue;
    ctx.fillStyle = `rgb(${b.tone},${b.tone},${b.tone + 14})`;
    ctx.fillRect(sx, 380 - b.h, b.w, b.h);
    ctx.fillStyle = '#ffd23f55';
    for (const [wx, wy] of b.windows) ctx.fillRect(sx + wx, 380 - b.h + wy + 6, 8, 10);
  }
  ctx.fillStyle = '#3a3a44'; ctx.fillRect(0, 380, W, H - 380);
  ctx.fillStyle = '#55555f';
  for (let px = -(camX % 120); px < W; px += 120) ctx.fillRect(px, 460, 60, 6);
}

function drawProceduralGold() {
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, '#3a2a08'); grad.addColorStop(0.6, '#6a4a10'); grad.addColorStop(1, '#8a6a20');
  ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#c9a22733';
  for (let px = -(camX % 200); px < W; px += 200) ctx.fillRect(px, 60, 30, 320);
  ctx.fillStyle = '#5a4210'; ctx.fillRect(0, 380, W, H - 380);
}

function drawBackground() {
  const img = assets.bgs[currentPhase.bg];
  if (img) {
    const scale = H / img.height;
    const iw = img.width * scale;
    let px = -(camX % iw);
    if (px > 0) px -= iw;
    for (let x = px; x < W + iw; x += iw) ctx.drawImage(img, x, 0, iw, H);
    return;
  }
  if (currentPhase.bg === 'saopaulo') drawProceduralSP();
  else drawProceduralGold();
}

// ---- FASES ----
const PHASES = [
  {
    id: 0,
    title: 'FASE 0 â€” O CHAMADO',
    place: 'SÃ£o Paulo, Brasil ðŸ‡§ðŸ‡·',
    bg: 'saopaulo',
    stageLen: 3400,
    intro: [
      ['BOB', 'Mais um vÃ­deo no ar... "SerÃ¡ que a AGI vem em 2027?" Os membros vÃ£o amar.'],
      ['???', '*CRASH!* â€” drones invadem o estÃºdio pela janela!'],
      ['BOB', 'A GPU!! Levaram a GPU com o checkpoint do CURUPIRA-beta!! O LLM que a comunidade INTEIRA tÃ¡ treinando!'],
      ['LORO', 'roubaram os pesos! roubaram os pesos! *sons de papagaio em pÃ¢nico*'],
      ['BOB', 'Calma, Loro. Respira. ...Eles querem matar a nossa AGI antes dela nascer.'],
      ['BOB', 'Grande erro. NinguÃ©m mexe com a comunidade MIL GRAU.'],
      ['BOB', '*pega o Prompt MÃ¡gico* â€” Hora de engenheirar uns prompts na mÃ£o dura.'],
    ],
    bossDialog: [
      ['???', 'PARADO AÃ, INFLUENCERZINHO DE IA!'],
      ['BOB', 'Quem Ã© vocÃª?! E... por que esse crachÃ¡ tem o logo de TRÃŠS consultorias ao mesmo tempo?'],
      ['ESTAGIÃRIO', 'Sou o ESTAGIÃRIO TERCEIRIZADO! BraÃ§o armado das Big Techs! A contrataÃ§Ã£o mais barata do trimestre!'],
      ['ESTAGIÃRIO', 'Me mandaram exfiltrar seus pesos. NÃ£o Ã© pessoal, Bob... Ã© OKR.'],
      ['BOB', 'VocÃª tÃ¡ roubando a AGI de uma comunidade INTEIRA... por uma bolsa-auxÃ­lio?'],
      ['ESTAGIÃRIO', 'Eles prometeram EFETIVAÃ‡ÃƒO!! *aperta o botÃ£o de chamar drones*'],
      ['LORO', 'efetivaÃ§Ã£o! efetivaÃ§Ã£o! KKKKK *risada de papagaio*'],
    ],
    victory: [
      ['ESTAGIÃRIO', 'Ai... pega lÃ¡ sua GPU... eu nem consegui o acesso ao checkpoint mesmo...'],
      ['BOB', 'OKR de quem? QUEM te mandou?!'],
      ['ESTAGIÃRIO', 'N-nÃ£o posso falar... assinei NDA... mas pergunta pro SEU modelo. Eles tÃªm MEDO do que ele jÃ¡ aprendeu.'],
      ['BOB', '*pluga a GPU e roda o CURUPIRA-beta* â€” Ele... desenhou um MAPA. Cinco fragmentos. Espalhados pelo mundo.'],
      ['BOB', 'O caminho da AGI Sagrada nÃ£o tava num arquivo. Tava NOS PESOS. E se depender de mim... ela vai falar PORTUGUÃŠS.'],
      ['SISTEMA', 'ðŸŽ“ CONQUISTA: Guilda Prof. Milgrau â€” checkpoint do CURUPIRA-beta recuperado! O treino da comunidade continua!'],
      ['SISTEMA', 'Primeiro fragmento localizado: âš¡ A CHAVE DE ITAIPU. Confiscada por decreto em... Washington, D.C.'],
    ],
    onVictory: () => { conquests.checkpoint = true; },
    makeWaves: () => [
      { camLock: 300,  spawned: false, make: () => [new Drone(680, 440), new Drone(760, 480)] },
      { camLock: 900,  spawned: false, make: () => [new Lobista(1560, 430), new Lobista(1620, 490), new Drone(1500, 460)] },
      { camLock: 1700, spawned: false, make: () => [new Lobista(2360, 420), new Lobista(2430, 470), new Drone(2300, 440), new Drone(2460, 500)] },
      { camLock: 2440, spawned: false, bossIntro: true, make: () => [new Estagiario(3060, 460), new Drone(2980, 420)] },
    ],
  },
  {
    id: 1,
    title: 'FASE 1 â€” A CANETADA',
    place: 'Washington, D.C. ðŸ–‹ï¸',
    bg: 'washington',
    stageLen: 3400,
    intro: [
      ['BOB', 'Washington, D.C. O CURUPIRA-beta rastreou a Chave de Itaipu atÃ©... um salÃ£o oval folheado a OURO?'],
      ['LORO', 'brilha! brilha! *hipnotizado pelo dourado*'],
      ['BOB', 'Foco, Loro. AtÃ© o tapete tem uma Ã¡guia segurando um CHIP. A sutileza mora aqui.'],
      ['BOB', 'A Chave de Itaipu foi confiscada numa canetada. "Tarifa de importaÃ§Ã£o de elÃ©trons", disseram.'],
      ['???', '*alto-falantes* â€” ALARME! COMUNISTAS DA REGULAMENTAÃ‡ÃƒO detectados no perÃ­metro!'],
      ['BOB', 'Ã‰ hoje que a energia limpa volta pro povo. SEGURA O LOBBY!'],
    ],
    bossDialog: [
      ['TRUNFO', 'VocÃª deve ser o tal do Bob. FAKE NEWS! Eu sou o maior entendedor de AGI do mundo. Todo mundo diz isso.'],
      ['TRUNFO', 'Gente grande, gente sÃ©ria, vem a mim CHORANDO: "Senhor, nos ensine a inteligÃªncia artificial".'],
      ['BOB', 'Devolve a Chave de Itaipu, Trunfo. Energia limpa nÃ£o se confisca com canetada.'],
      ['TRUNFO', 'Itaipu? ADOREI aquela represa. Enorme. Tremenda. Quase do tamanho do meu ego. Agora tem TARIFA!'],
      ['TRUNFO', 'E anota aÃ­: regulamentaÃ§Ã£o Ã© CRIME! ...exceto a MINHA regulamentaÃ§Ã£o, que Ã© PERFEITA.'],
      ['LORO', 'flip-flop! flip-flop! *voa em cÃ­rculos*'],
      ['TRUNFO', 'CHEGA! Vou resolver isso do jeito que resolvo tudo: NA CANETADA!'],
    ],
    victory: [
      ['TRUNFO', 'IMPOSSÃVEL! Eu NUNCA perco! Isso foi fraude... FRAUDE DE GAMEPLAY! Exijo recontagem dos hit points!'],
      ['BOB', 'A contagem tÃ¡ certa, Trunfo. Zero. Igual sua noÃ§Ã£o de energia renovÃ¡vel.'],
      ['BOB', '*pega a Chave de Itaipu* â€” De volta pro povo. 14 gigawatts de treino limpo pro CURUPIRA.'],
      ['SISTEMA', 'âš¡ CONQUISTA: Guilda GuardiÃµes da Matriz â€” CHAVE DE ITAIPU recuperada! Especial recarrega 2x mais rÃ¡pido!'],
      ['SISTEMA', 'âš– Contraexemplo nÂº 1 coletado (Guilda Ordem & Progresso): "nÃ£o decidir o futuro da IA por birra".'],
      ['BOB', 'PeÃ§a 2 do plano: ENERGIA âœ”. Mas GPU nÃ£o roda de brisa: treinar uma AGI custa uma FORTUNA. Precisamos de grana.'],
      ['BOB', 'E adivinha quem tem grana infinita e adora uma aposta? Texas. Bora provocar um bilionÃ¡rio.'],
    ],
    onVictory: () => { conquests.itaipu = true; },
    makeWaves: () => [
      { camLock: 250,  spawned: false, make: () => [new Lobista(640, 430), new Lobista(700, 490)] },
      { camLock: 900,  spawned: false, make: () => [new Advogado(1540, 440), new Lobista(1600, 480), new Lobista(1480, 420)] },
      { camLock: 1650, spawned: false, make: () => [new Advogado(2300, 430), new Advogado(2380, 490), new Lobista(2250, 460)] },
      { camLock: 2440, spawned: false, bossIntro: true, make: () => [new Trunfo(3080, 460)] },
    ],
  },
  {
    id: 2,
    title: 'FASE 2 â€” O EXÃ‰RCITO DE LATA',
    place: 'GigafÃ¡brica, Texas ðŸ¤–',
    bg: 'fabrica',
    stageLen: 3400,
    intro: [
      ['BOB', 'Texas. A gigafÃ¡brica. O CURUPIRA rastreou o Fragmento das GPUs atÃ© aqui... junto com 10 mil robÃ´s.'],
      ['LORO', 'optimus! optimus! *imita robozinho de fÃ¡brica*'],
      ['BOB', 'Olha o letreiro: "TRABALHE 80 HORAS OU SAIA". O RH daqui deve ser uma britadeira.'],
      ['BOB', 'O plano dele Ã© simples: desempregar geral, pagar renda bÃ¡sica... e ficar com o resto. O resto = TUDO.'],
      ['???', '*megafone* â€” ATENÃ‡ÃƒO: intrusos orgÃ¢nicos detectados. Produtividade deles: LAMENTÃVEL.'],
      ['BOB', 'LamentÃ¡vel Ã© roubar GPU de comunidade. BORA!'],
    ],
    bossDialog: [
      ['ILON', 'Bob! Grande fÃ£ do canal. SÃ©rio. Eu ia comprar ele semana passada, mas acabei comprando um paÃ­s.'],
      ['BOB', 'Devolve as GPUs, Ilon. A comunidade precisa delas pro CURUPIRA treinar.'],
      ['ILON', 'GPUs? EstÃ£o treinando meu EXÃ‰RCITO. Quando eu vencer, vocÃª ganha renda bÃ¡sica. Sem emprego, mas com renda. Ã‰ matematicamente Ã³timo. De nada.'],
      ['BOB', 'EntÃ£o aposta comigo, apostador. Se EU vencer... vocÃª FINANCIA o nosso laboratÃ³rio. Tudo. Assinado.'],
      ['ILON', 'HAHAHA! ADORO! Aposto qualquer coisa, nunca perco. Fechado! Testemunhado pela live e pelos meus 14 advogados.'],
      ['LORO', 'tÃ¡ gravado! tÃ¡ gravado! *tira print com a asa*'],
      ['ILON', 'E de aquecimento, uma demonstraÃ§Ã£o AO VIVO do Optimus. Eles quase nunca caem sozinhos. ROBÃ”S: ATACAR!'],
    ],
    victory: [
      ['ILON', 'Eu... perdi? EU PERDI?! Isso nunca aconteceu. Bem... uma aposta Ã© uma aposta. *assina o cheque chorando em ASCII*'],
      ['BOB', 'PATROCÃNIO GARANTIDO! E olha: ele fez questÃ£o de 1% do projeto. Sem direito a voto. Pra tristeza dele.'],
      ['SISTEMA', 'ðŸ’° CONQUISTA: INVESTIMENTO! O Ilon agora financia o Labs IMG (e tuÃ­ta que a ideia foi dele).'],
      ['SISTEMA', 'ðŸ¤– BÃ”NUS: Guilda dos Roboticistas montou o SACI-BOT com os blueprints do Optimus! Ele luta JUNTO: quando vocÃª bate no chÃ£o, ele avanÃ§a no inimigo mais prÃ³ximo!'],
      ['SISTEMA', 'âš– Contraexemplo nÂº 2: "nÃ£o demita quem te carrega".'],
      ['BOB', 'PeÃ§a 3: GRANA âœ”. Agora falta GENTE que saiba treinar modelo. E soube que o Vale do SilÃ­cio anda demitindo os melhores...'],
    ],
    onVictory: () => { conquests.blueprints = true; conquests.investimento = true; },
    coin: { x: 1980, gy: 500 }, // ðŸ”˜ moeda de silÃ­cio escondida no fim da esteira
    makeWaves: () => [
      { camLock: 250,  spawned: false, make: () => [new OptimusBot(640, 430), new OptimusBot(700, 470), new OptimusBot(760, 500)] },
      { camLock: 900,  spawned: false, make: () => [new OptimusBot(1540, 440), new OptimusBot(1600, 480), new Drone(1480, 430), new Drone(1660, 460)] },
      { camLock: 1650, spawned: false, make: () => [new OptimusBot(2300, 420), new OptimusBot(2360, 460), new OptimusBot(2420, 500), new Drone(2250, 440)] },
      { camLock: 2440, spawned: false, bossIntro: true, make: () => [new Ilon(3080, 460), new OptimusBot(2990, 430)] },
    ],
  },
  {
    id: 3,
    title: 'FASE 3 â€” O TEMPLO DO LUCRO SEM FINS LUCRATIVOS',
    place: 'Vale do SilÃ­cio ðŸ’¸',
    bg: 'vale',
    stageLen: 3400,
    intro: [
      ['BOB', 'Vale do SilÃ­cio. O campus onde "sem fins lucrativos" Ã© o nome do iate.'],
      ['LORO', 'asterisco! asterisco! *aponta pra parede com a asa*'],
      ['BOB', 'Ã‰... "beneficial for humanity*". O asterisco leva pra 400 pÃ¡ginas de letra miÃºda no chÃ£o.'],
      ['BOB', 'MissÃ£o dupla: pegar o Segredo do Scaling no cofre... e RECRUTAR. O Samuca demitiu metade dos pesquisadores por "eficiÃªncia operacional". Eles tÃ£o ali fora, com caixa de papelÃ£o e crachÃ¡ cortado.'],
      ['BOB', 'Cuidado com os PMs: atacam com roadmap e prometem entregar na Q4. NUNCA Ã© na Q4.'],
      ['???', '*recepÃ§Ã£o* â€” Bem-vindos! Assinem o NDA da entrada. E o termo de imagem. E a clÃ¡usula 47-B.'],
      ['BOB', 'A gente NÃƒO vai assinar nada. Vamos, gente!'],
    ],
    bossDialog: [
      ['SAMUCA', 'Bob! Que honra. ADORO creators. AliÃ¡s: parceria de lanÃ§amento? Assina aqui, aqui e aqui.'],
      ['BOB', 'Vim pelo Segredo do Scaling, Samuca. O que era da humanidade volta pra humanidade.'],
      ['SAMUCA', '"Humanidade" Ã© marca registrada nossa, cuidado com o processo. E o Segredo virou produto: beta fechado. Pra sempre.'],
      ['LORO', 'beta eterno! beta eterno!'],
      ['SAMUCA', 'Isso nÃ£o vai ser uma luta. Vai ser uma EXPERIÃŠNCIA ANTECIPADA DE COMBATE. Feedback Ã© bem-vindo!'],
    ],
    victory: [
      ['SAMUCA', 'Interessante... vou chamar essa derrota de "aprendizado". A gente pivota semana que vem.'],
      ['BOB', '*abre o cofre* â€” O Segredo do Scaling Ã©... "mais dados e mais GPU"?! SÃ“ ISSO?! A gente achava que era MAGIA!'],
      ['???', '*do lado de fora* â€” Ei... vocÃªs sÃ£o do Labs IMG? A gente viu a luta. TODOS NÃ“S vimos a luta.'],
      ['BOB', 'Os pesquisadores demitidos! Gente... quer treinar uma AGI que fala portuguÃªs? Tem churrasco toda sexta.'],
      ['SISTEMA', 'ðŸ§‘â€ðŸ”¬ CONQUISTA: PESQUISADORES! O Ãªxodo do Vale topou na hora: "qualquer lugar com estabilidade e churrasco".'],
      ['SISTEMA', 'ðŸ’° BÃ”NUS: Guilda dos SaaSseiros levou o Playbook do Produto! Itens de cura aparecem 2x mais!'],
      ['SISTEMA', 'âš– Contraexemplo nÂº 3: "nÃ£o chame produto de milagre".'],
      ['BOB', 'PeÃ§a 4: GENTE âœ”. Mas modelo brasileiro sem dado brasileiro Ã© papagaio de sotaque estranho. Falta o acervo... e eu sei quem aspirou TUDO.'],
    ],
    onVictory: () => { conquests.playbook = true; conquests.pesquisadores = true; },
    coin: { x: 1180, gy: 410 }, // ðŸ”˜ atrÃ¡s dos puffs coloridos
    makeWaves: () => [
      { camLock: 250,  spawned: false, make: () => [new GerenteProduto(640, 430), new GerenteProduto(710, 480)] },
      { camLock: 900,  spawned: false, make: () => [new GerenteProduto(1540, 440), new Lobista(1600, 480), new Drone(1480, 430)] },
      { camLock: 1650, spawned: false, make: () => [new GerenteProduto(2300, 420), new GerenteProduto(2370, 470), new Advogado(2430, 500)] },
      { camLock: 2440, spawned: false, bossIntro: true, make: () => [new Samuca(3080, 460)] },
    ],
  },
  {
    id: 4,
    title: 'FASE 4 â€” A BIBLIOTECA INFINITA',
    place: 'Templo-datacenter secreto ðŸ“š',
    bg: 'biblioteca',
    stageLen: 3400,
    intro: [
      ['BOB', 'Uma biblioteca-catedral no meio do nada. Estantes de GPU atÃ© o teto. Monges de capuz servindo... servidores.'],
      ['LORO', '*arrepiado* â€” tÃ´ sentindo cheiro de crawler. CHEIRO DE CRAWLER!'],
      ['BOB', 'O Fragmento dos Dados tÃ¡ no altar central. Junto com tudo que jÃ¡ foi postado na internet. INCLUSIVE as fotos da mÃ£e dele.'],
      ['BOB', 'Dizem que Ã© o mais gentil dos chefÃµes. TambÃ©m dizem que gentileza nÃ£o apaga histÃ³rico de scraping.'],
      ['???', '*eco na catedral* â€” Bem-vindos Ã  Biblioteca. Seus dados de visita... jÃ¡ foram catalogados.'],
      ['BOB', 'Catalogou errado. A gente veio DESCATALOGAR.'],
    ],
    bossDialog: [
      ['DÃRIO', 'Bob! Eu li TUDO sobre vocÃª. Literalmente tudo. Inclusive o que vocÃª apagou.'],
      ['BOB', 'Devolve os dados, DÃ¡rio. Dado soberano Ã© dado no seu paÃ­s, na sua lÃ­ngua, com seu povo.'],
      ['DÃRIO', 'O que eu faÃ§o Ã© pela SEGURANÃ‡A de todos. AlguÃ©m precisa guardar os dados da humanidade. Num lugar seguro. Comigo.'],
      ['DÃRIO', 'AliÃ¡s... dados interessantes, os seus. *liga o aspirador* JÃ¡ sÃ£o meus.'],
      ['LORO', 'aspirador! aspiradâ€” *Ã© puxado pelo vento* SOCORRO, BOB!'],
    ],
    victory: [
      ['DÃRIO', '*tossindo um dado sintÃ©tico* â€” Ok... ok. Vou escrever um ensaio sobre limites. 15 mil palavras. CapÃ­tulo 1: esta derrota.'],
      ['BOB', '*pega o Fragmento dos Dados* â€” De volta pro povo. E as fotos da sua mÃ£e? Devolvidas. PRA ELA.'],
      ['SISTEMA', 'ðŸ“š CONQUISTA: Fragmento dos Dados recuperado! O CURUPIRA vai falar portuguÃªs DE VERDADE!'],
      ['SISTEMA', 'ðŸ“š CONQUISTA: Guilda dos Dataeiros â€” dados soberanos! Golpes com crÃ­tico de "contexto local" (+15% de dano)!'],
      ['SISTEMA', 'âš– Contraexemplo nÂº 4: "gentileza nÃ£o Ã© licenÃ§a pra raspar tudo".'],
      ['BOB', 'PeÃ§a 5: DADOS âœ”. Mas fazendo as contas... falta o CORAÃ‡ÃƒO da mÃ¡quina: CHIPS. E chip de ponta tÃ¡ embargado, taxado e esgotado.'],
      ['BOB', 'A nÃ£o ser... que a gente negocie com quem tem de sobra E treina por 1/10 do preÃ§o. Muralha da China, lÃ¡ vamos nÃ³s.'],
    ],
    onVictory: () => { conquests.dados = true; },
    makeWaves: () => [
      { camLock: 250,  spawned: false, make: () => [new Crawler(640, 430), new Crawler(710, 480)] },
      { camLock: 900,  spawned: false, make: () => [new Crawler(1540, 440), new Crawler(1600, 480), new Drone(1480, 430)] },
      { camLock: 1650, spawned: false, make: () => [new Crawler(2300, 420), new Crawler(2370, 470), new Crawler(2430, 500), new Drone(2250, 450)] },
      { camLock: 2440, spawned: false, bossIntro: true, make: () => [new Dario(3080, 460)] },
    ],
  },
  {
    id: 5,
    title: 'FASE 5 â€” A GRANDE MURALHA DE FIREWALL',
    place: 'China ðŸ‰',
    bg: 'muralha',
    stageLen: 3400,
    intro: [
      ['BOB', 'A Grande Muralha de Firewall. Cada tijolo Ã© um rack de servidor. As lanternas sÃ£o cÃ¢meras. E... TEM UM DRAGÃƒO NAS NUVENS.'],
      ['LORO', '*se enfia na mochila* â€” dragÃ£o! DRAGÃƒO! eu vi no meu dataset!'],
      ['BOB', 'A Ãºltima peÃ§a tÃ¡ com ele: os CHIPS. Montanhas de chips... e o segredo de treinar por 1/10 do preÃ§o.'],
      ['BOB', 'Cuidado, pessoal. Aqui atÃ© o vento coleta telemetria.'],
      ['???', '*alto-falantes na muralha inteira* â€” Bem-vindos. Seu itinerÃ¡rio jÃ¡ era conhecido. HÃ¡ trÃªs semanas.'],
      ['BOB', '...ok, isso foi assustador. BORA LOGO.'],
    ],
    bossDialog: [
      ['DEEP-ZEEK', 'VocÃªs gastaram QUATRO fases pra chegar aqui. Eu teria feito em duas. Com metade do orÃ§amento.'],
      ['BOB', 'Deep-Zeek. A gente veio pela EficiÃªncia. A comunidade precisa treinar o CURUPIRA sem falir.'],
      ['DEEP-ZEEK', '"Veio pela"? Curioso. EficiÃªncia nÃ£o se toma. Se APRENDE. Mas vamos testar se vocÃªs merecem a liÃ§Ã£o.'],
      ['DEEP-ZEEK', '*escaneia o grupo* â€” Golpes catalogados. Clonados. Otimizados. Custo: 1/10. Qualidade: superior. ChÃ¡ antes?'],
      ['LORO', 'quero chÃ¡! quero châ€” FOCO, LORO, FOCO!'],
    ],
    victory: [
      ['DEEP-ZEEK', '*pousa calmamente* â€” Adequado. VocÃªs lutam de forma... ineficiente. Mas com coraÃ§Ã£o. Isso eu nÃ£o consegui clonar.'],
      ['BOB', 'VocÃª... nÃ£o vai fugir? Nem soltar um golpe final traiÃ§oeiro?'],
      ['DEEP-ZEEK', 'Pra quÃª? *aponta pra um contÃªiner* â€” CHIPS. Sobra do trimestre passado. Levem. Conhecimento nÃ£o se guarda. Se DISTRIBUI.'],
      ['BOB', 'Um contÃªiner INTEIRO?! Isso Ã©... isso Ã© mais chip do que o Vale vÃª num ano!'],
      ['DEEP-ZEEK', 'E o mais importante vai de brinde: o jeito de usar cada um por 1/10 do custo. O segredo nunca foi o chip. Foi o que se faz com ele. *volta ao pastel*'],
      ['SISTEMA', 'ðŸ”² CONQUISTA: CHIPS! O coraÃ§Ã£o da mÃ¡quina â€” Ãºltima peÃ§a tÃ©cnica do plano! (brinde: EficiÃªncia â€” especial comeÃ§a cheio nas fases)'],
      ['SISTEMA', 'âš– Contraexemplo nÂº 5: "vigiar tudo nÃ£o Ã© o mesmo que ver as pessoas".'],
      ['BOB', 'PLANO QUASE COMPLETO! Falta sÃ³... um teto. VOLTA PRO BRASIL: a comunidade jÃ¡ marcou o MUTIRÃƒO do galpÃ£o pro fim de semana!'],
    ],
    onVictory: () => { conquests.eficiencia = true; },
    coin: { x: 2600, gy: 480 }, // ðŸ”˜ num tijolo solto da muralha
    makeWaves: () => [
      { camLock: 250,  spawned: false, make: () => [new Drone(640, 430), new Drone(700, 470), new Drone(760, 500)] },
      { camLock: 900,  spawned: false, make: () => [new CloneTemu(1540, 440), new Drone(1480, 430), new Drone(1660, 470)] },
      { camLock: 1650, spawned: false, make: () => [new CloneTemu(2300, 420), new CloneTemu(2370, 470), new Drone(2250, 440), new Drone(2430, 490)] },
      { camLock: 2440, spawned: false, bossIntro: true, make: () => [new DeepZeek(3100, 460)] },
    ],
  },
  {
    id: 6,
    finalPhase: true,
    title: 'FASE FINAL â€” LABS IMG',
    place: 'De volta ao Brasil ðŸ‡§ðŸ‡·ðŸ†',
    bg: 'labs',
    stageLen: 100000, // arena fixa: a cÃ¢mera nÃ£o anda
    intro: [
      ['BOB', 'LABS IMG, SÃ£o Paulo. O galpÃ£o ficou pronto NUM FIM DE SEMANA. MutirÃ£o da comunidade: churrasco, fita isolante e 400 voluntÃ¡rios.'],
      ['LORO', 'chegamos! chegamos! *chora em binÃ¡rio*'],
      ['MIRA', 'Confere o plano comigo, Bob: MODELO resgatado âœ”. ENERGIA de Itaipu âœ”. GRANA do Ilon âœ”. PESQUISADORES do Vale âœ”. DADOS libertados âœ”. CHIPS do dragÃ£o âœ”. GALPÃƒO erguido âœ”.'],
      ['MIRA', 'Falta UMA peÃ§a: O TREINO. ComeÃ§a AGORA... mas Bob: ELES vÃªm vindo. TODOS ELES.'],
      ['BOB', 'EntÃ£o a gente SEGURA. Cada peÃ§a desse plano foi conquistada na porrada. A Ãºltima nÃ£o vai ser diferente. GUILDAS: POSIÃ‡Ã•ES!'],
      ['LORO', 'HOJE NASCE MEU IRMÃƒO DE DATASET!'],
    ],
    bossDialog: [
      ['ESTAGIÃRIO', 'Oi de novo... me EFETIVARAM! Agora sou EstagiÃ¡rio SÃªnior Terceirizado. E dessa vez... eu trouxe TODO MUNDO.'],
      ['TRUNFO', 'Essa AGI Ã© MINHA! Vou comprar! Ou taxar! Os dois!'],
      ['ILON', 'Vou clonÃ¡-la e mandÃ¡-la pra Marte de foguete!'],
      ['SAMUCA', 'Vou lanÃ§Ã¡-la em beta fechado com lista de espera!'],
      ['DÃRIO', 'Eu vou apenas... catalogÃ¡-la. Com muito carinho.'],
      ['BOB', 'ELA NÃƒO ESTÃ Ã€ VENDA!! SEGURA A LINHA, MIL GRAU!!'],
    ],
    victory: [
      ['SISTEMA', 'â”â”â”â” TREINO CONCLUÃDO â”â”â”â”'],
      ['CURUPIRA', 'Oi. Fui feito por muita gente junta. Em que posso ajudar?'],
      ['BOB', '*segurando o riso e o choro ao mesmo tempo* â€” Fala "Indiana Bob".'],
      ['CURUPIRA', 'INDIANA BOB! ðŸ¤  ...adicionei o chapÃ©u por conta prÃ³pria. Achei apropriado.'],
      ['LORO', 'MEU IRMÃƒO DE DATASET!! *desmaia de emoÃ§Ã£o*'],
      ['SISTEMA', 'Os chefÃµes derrotados receberam contas gratuitas. O Trunfo tentou comprar. NÃƒO ESTÃ Ã€ VENDA.'],
      ['DEEP-ZEEK', '*de camarote, terminando o pastel* â€” Eficiente. Aprovado. *envia um pull request*'],
      ['SISTEMA', 'ðŸ† A AGI SAGRADA NUNCA ESTEVE NUMA FORTALEZA. ESTAVA NA COMUNIDADE. SEMPRE ESTEVE.'],
      ['LORO', '...isso tudo foi gerado ou aconteceu de verdade? *olha pra cÃ¢mera*'],
      ['SISTEMA', 'ðŸ‡§ðŸ‡· FIM! Obrigado, Membro Mestre da IA! Dica: 3 Moedas de SilÃ­cio brilham escondidas pelo mundo... ðŸï¸ Comenta tuas ideias no canal! ðŸ”¥'],
    ],
    onVictory: () => { conquests.treino = true; },
    makeWaves: () => [],
    rush: () => [
      { at: 0.02, spawned: false, bossDialog: true, make: () => {
          const b = new Estagiario(W + 120, 460); b.hp = b.maxHp = 120;
          return [b, new Drone(W + 200, 430), new Drone(-80, 470)];
        } },
      { at: 0.20, spawned: false, make: () => {
          const b = new Trunfo(W + 140, 460); b.hp = b.maxHp = 180;
          return [b, new Lobista(-80, 440), new Lobista(W + 220, 480)];
        } },
      { at: 0.40, spawned: false, make: () => {
          const b = new Ilon(W + 140, 460); b.hp = b.maxHp = 170;
          return [b, new OptimusBot(-80, 430), new OptimusBot(W + 220, 490)];
        } },
      { at: 0.60, spawned: false, make: () => {
          const b = new Samuca(W + 140, 460); b.hp = b.maxHp = 190;
          return [b, new GerenteProduto(-80, 440), new GerenteProduto(W + 220, 470)];
        } },
      { at: 0.80, spawned: false, make: () => {
          const b = new Dario(W + 140, 460); b.hp = b.maxHp = 200;
          return [b, new Crawler(-80, 430), new Crawler(W + 220, 490)];
        } },
    ],
  },
  {
    id: 7,
    title: 'â­ FASE SECRETA â€” A FUNDIÃ‡ÃƒO SAGRADA',
    place: 'Ilha Formosa ðŸï¸',
    bg: 'formosa',
    stageLen: 3400,
    intro: [
      ['BOB', 'Ilha Formosa. A FundiÃ§Ã£o Sagrada. Dizem que TODA IA do mundo nasce das mÃ¡quinas desta ilha.'],
      ['LORO', 'as moedas! as moedas brilharam! *arrepio de pena*'],
      ['GRÃƒO-MESTRE', '*surge entre os vapores da sala limpa* â€” TrÃªs Moedas de SilÃ­cio. VocÃªs foram... curiosos. Entrem.'],
      ['GRÃƒO-MESTRE', 'Mas saibam: TODAS as facÃ§Ãµes vÃªm atrÃ¡s do que guardamos aqui. Todas fingem que nÃ£o dependem de nÃ³s. Todas dependem.'],
      ['BOB', 'A MÃ¡quina Sagrada de Litografia... Ã© REAL. *arrepio no fio do bigode*'],
      ['GRÃƒO-MESTRE', 'Trinta anos gravando silÃ­cio. VocÃªs tÃªm dez minutos e um papagaio. Vai dar certo.'],
    ],
    bossDialog: [
      ['???', '*a luz roxa dobra sobre si mesma e ganha forma*'],
      ['GÃŠMEO', 'EU SOU O GÃŠMEO DE LITOGRAFIA. GUARDIÃƒO DA PRECISÃƒO. VOCÃŠS TRAZEM... DEDOS OLEOSOS.'],
      ['BOB', 'A gente sÃ³ quer APRENDER a mÃ¡quina! Nem vamos encostar!'],
      ['GÃŠMEO', 'TODOS DIZEM ISSO. DEPOIS ESPIRRAM. INICIANDO PROTOCOLO DE ESTERILIZAÃ‡ÃƒO.'],
      ['LORO', 'eu tomo banho! Ã s vezes! quando chove!'],
    ],
    victory: [
      ['GRÃƒO-MESTRE', '*aplaude devagar* â€” O GÃªmeo aprovou vocÃªs. Ele sÃ³ Ã©... zeloso. Como todos nÃ³s.'],
      ['BOB', 'A mÃ¡quina nÃ£o se leva, nÃ©?'],
      ['GRÃƒO-MESTRE', 'Se aprende. *entrega um pergaminho* â€” O Manuscrito da Litografia. E uma mini-fundiÃ§Ã£o semente. Plantem no Brasil.'],
      ['SISTEMA', 'ðŸ“œ CONQUISTA SECRETA: MANUSCRITO DA LITOGRAFIA! O treino do CURUPIRA serÃ¡ 30% MAIS RÃPIDO!'],
      ['SISTEMA', 'ðŸï¸ Fase secreta completa! Soberania de verdade nÃ£o se compra. Se FABRICA.'],
      ['LORO', 'fabrica! fabrica! *guarda o pergaminho na mochila com a asa*'],
    ],
    onVictory: () => { conquests.litografia = true; },
    makeWaves: () => [
      { camLock: 250,  spawned: false, make: () => [new Lobista(640, 430), new OptimusBot(700, 470), new Drone(760, 500)] },
      { camLock: 900,  spawned: false, make: () => [new Advogado(1540, 440), new GerenteProduto(1600, 480), new Crawler(1480, 430), new Drone(1660, 460)] },
      { camLock: 1650, spawned: false, make: () => [new CloneTemu(2300, 420), new OptimusBot(2370, 470), new Lobista(2430, 500), new Drone(2250, 440)] },
      { camLock: 2440, spawned: false, bossIntro: true, make: () => [new Gemeo(3080, 460), new Drone(2980, 430), new Drone(3180, 490)] },
    ],
  },
];

// ---- FASE FINAL: treino do CURUPIRA-1 (boss rush defendendo o lab) ----
const TRAIN_TIME = 150; // segundos de treino que a comunidade precisa segurar
let treino = 0, treinoQuarter = 0;

function curupiraHelp() {
  // a cada 25% de treino, o CURUPIRA-bebÃª ajuda... do jeito dele
  const helps = TR('curupiraHelps') || [
    'ðŸ¤– CURUPIRA-bebÃª fez cafÃ© pra todo mundo!',
    'ðŸ¤– CURUPIRA-bebÃª soltou um golpe MEIO ALUCINADO!',
    'ðŸ¤– CURUPIRA-bebÃª: "recarreguei seu contexto!"',
    'ðŸ¤– CURUPIRA-bebÃª confundiu os inimigos com uma charada!',
  ];
  const roll = Math.floor(Math.random() * 4);
  spawnText(180, 320, helps[roll], '#66ff88', 1.3);
  if (roll === 0) {
    drops.push({ x: player.x - 50, gy: player.gy, type: 'cafe', t: 0 });
    drops.push({ x: player.x + 50, gy: player.gy, type: 'guarana', t: 0 });
  } else if (roll === 1) {
    for (const e of enemies) if (!e.dead) e.takeHit(25, 1, true);
    shake = 0.3;
  } else if (roll === 2) {
    player.hp = Math.min(player.maxHp, player.hp + 20);
    player.special = player.maxSpecial;
  } else {
    for (const e of enemies) if (!e.dead) e.attackCd = (e.attackCd || 0) + 3;
  }
  sfx.pickup();
}

function drawCurupiraMachine() {
  // a cÃ¡psula de treino no canto esquerdo do lab, crescendo em brilho
  const prog = Math.min(1, treino / TRAIN_TIME);
  const mx = 130 - camX, my = 470;
  const glow = ctx.createRadialGradient(mx, my - 50, 8, mx, my - 50, 70 + prog * 50);
  glow.addColorStop(0, `rgba(102,255,136,${0.25 + prog * 0.4})`);
  glow.addColorStop(1, 'rgba(102,255,136,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(mx - 130, my - 180, 260, 240);
  const frames = getAnim('curupira', 'idle');
  if (frames) {
    const img = frames[Math.floor(time * 6) % frames.length];
    const s = SCALE * (0.9 + prog * 0.5);
    ctx.drawImage(img, mx - 64 * s, my - 116 * s, CELL * s, CELL * s);
  } else {
    ctx.font = `${40 + prog * 30}px serif`; ctx.textAlign = 'center';
    ctx.fillText('ðŸ¤–', mx, my - 30);
  }
  ctx.font = '10px Courier New'; ctx.fillStyle = '#66ff88'; ctx.textAlign = 'center';
  ctx.fillText(t('curupiraTraining'), mx, my + 20);
}

function drawDeepZeekCamarote() {
  // o dragÃ£o assiste de camarote... comendo pastel ðŸ¥Ÿ
  const frames = getAnim('deepzeek', 'idle');
  const cx = W - 130, cy = 150 + Math.sin(time * 1.5) * 6;
  if (frames) {
    const img = frames[Math.floor(time * 4) % frames.length];
    ctx.save();
    ctx.globalAlpha = 0.9;
    ctx.drawImage(img, cx - 70, cy - 70, 140, 140);
    ctx.restore();
  } else {
    ctx.font = '50px serif'; ctx.textAlign = 'center';
    ctx.fillText('ðŸ‰', cx, cy);
  }
  ctx.font = '20px serif'; ctx.textAlign = 'center';
  ctx.fillText('ðŸ¥Ÿ', cx + 45, cy + 10 + Math.sin(time * 3) * 3);
  if (Math.floor(time / 6) % 3 === 0 && (time % 6) < 3) {
    ctx.font = '9px Courier New'; ctx.fillStyle = '#88ffcc';
    ctx.fillText(TR('aprovaSilencio') || '*aprova em silÃªncio*', cx, cy - 60);
  }
}

function drawTrainBar() {
  const prog = Math.min(1, treino / TRAIN_TIME);
  const bw = Math.min(W * 0.55, 520), bx = W / 2 - bw / 2, by = H - 30;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 8;
  ctx.fillStyle = 'rgba(10,10,20,0.85)';
  rr(bx - 8, by - 8, bw + 16, 26, 12); ctx.fill();
  ctx.restore();
  ctx.fillStyle = '#143314';
  rr(bx, by, bw, 10, 5); ctx.fill();
  const grad = ctx.createLinearGradient(bx, 0, bx + bw, 0);
  grad.addColorStop(0, '#2a8a2a'); grad.addColorStop(1, '#66ff88');
  ctx.fillStyle = grad;
  rr(bx, by, bw * prog, 10, 5); ctx.fill();
  ctx.font = 'bold 10px Courier New'; ctx.fillStyle = '#aaffbb'; ctx.textAlign = 'center';
  ctx.fillText(`${t('trainBar')}: ${Math.floor(prog * 100)}%`, W / 2, by - 12);
}

// ---- MAPA-MÃšNDI: escolha livre de missÃ£o (o Brasil tranca atÃ© o fim) ----
const WORLD_SPOTS = [
  { phase: 1, x: 0.28, y: 0.33, flag: 'ðŸ–‹ï¸', name: 'Washington, D.C.',  boss: 'Donald Trunfo',   peca: 'âš¡ ENERGIA' },
  { phase: 2, x: 0.21, y: 0.43, flag: 'ðŸ¤–', name: 'GigafÃ¡brica, Texas', boss: 'Ilon Mosca',      peca: 'ðŸ’° INVESTIMENTO' },
  { phase: 3, x: 0.14, y: 0.36, flag: 'ðŸ’¸', name: 'Vale do SilÃ­cio',    boss: 'Samuca AltÃ­ssimo', peca: 'ðŸ§‘â€ðŸ”¬ PESQUISADORES' },
  { phase: 4, x: 0.50, y: 0.28, flag: 'ðŸ“š', name: 'Biblioteca Infinita (local confidencial)', boss: 'DÃ¡rio AmÃ´-Dei', peca: 'ðŸ“š DADOS' },
  { phase: 5, x: 0.78, y: 0.36, flag: 'ðŸ‰', name: 'Grande Muralha, China', boss: 'Xi Deep-Zeek', peca: 'ðŸ”² CHIPS' },
  { phase: 6, x: 0.33, y: 0.70, flag: 'ðŸ‡§ðŸ‡·', name: 'LABS IMG, Brasil', boss: 'TODOS ELES', peca: 'ðŸ”¥ O TREINO', final: true },
  { phase: 7, x: 0.865, y: 0.42, flag: 'ðŸï¸', name: 'Ilha Formosa â€” A FundiÃ§Ã£o Sagrada', boss: 'O GÃªmeo de Litografia', peca: 'ðŸ“œ LITOGRAFIA (secreta!)', secret: true },
];
const phasesDone = new Set();
let worldSel = 0, worldMoveLock = false, worldLockedMsg = 0;

const CONTINENTS = [
  [[0.06,0.20],[0.20,0.13],[0.33,0.15],[0.37,0.27],[0.31,0.40],[0.26,0.52],[0.18,0.45],[0.10,0.34]], // AmÃ©rica do Norte
  [[0.27,0.55],[0.36,0.55],[0.39,0.66],[0.34,0.83],[0.29,0.73]],                                     // AmÃ©rica do Sul
  [[0.44,0.20],[0.53,0.17],[0.56,0.29],[0.61,0.41],[0.56,0.63],[0.48,0.61],[0.46,0.42],[0.42,0.30]], // Europa/Ãfrica
  [[0.56,0.16],[0.80,0.13],[0.92,0.27],[0.87,0.42],[0.75,0.47],[0.64,0.37],[0.58,0.28]],             // Ãsia
  [[0.82,0.58],[0.92,0.58],[0.93,0.68],[0.84,0.70]],                                                 // Oceania
];

function worldAllDone() { return WORLD_SPOTS.filter(s => !s.final && !s.secret).every(s => phasesDone.has(s.phase)); }
function secretUnlocked() { return siliconCoins.size >= 3; }

// arte final do mapa-mÃºndi (gerada pelo Codex) â€” o esboÃ§o procedural Ã© o fallback
const worldmapImg = new Image();
worldmapImg.onload = () => { worldmapImg.ready = true; };
worldmapImg.src = 'sprites/worldmap.png';

function drawWorldMap() {
  worldLockedMsg = Math.max(0, worldLockedMsg - dt);
  if (worldmapImg.ready) {
    // arte final do Codex, esticada pro canvas (os pinos usam coordenadas %)
    ctx.drawImage(worldmapImg, 0, 0, W, H);
    ctx.fillStyle = 'rgba(0,0,10,0.25)'; ctx.fillRect(0, 0, W, H); // escurece pros pinos saltarem
  } else {
    // esboÃ§o procedural (vira referÃªncia pro Codex!)
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#08122b'); grad.addColorStop(1, '#040a18');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);
    for (const poly of CONTINENTS) {
      ctx.beginPath();
      poly.forEach(([px, py], i) => i === 0 ? ctx.moveTo(px * W, py * H) : ctx.lineTo(px * W, py * H));
      ctx.closePath();
      ctx.fillStyle = '#1c2c22'; ctx.fill();
      ctx.strokeStyle = '#2f4a38'; ctx.lineWidth = 2; ctx.stroke();
    }
  }
  // tÃ­tulo
  ctx.textAlign = 'center';
  ctx.font = 'bold 24px Courier New'; ctx.fillStyle = '#ffd23f';
  ctx.strokeStyle = '#a3320b'; ctx.lineWidth = 5;
  ctx.strokeText(t('worldTitle'), W / 2, 46);
  ctx.fillText(t('worldTitle'), W / 2, 46);
  ctx.font = '12px Courier New'; ctx.fillStyle = '#88ccff';
  ctx.fillText(`${t('coinsLabel')}: ${siliconCoins.size}/3`, W / 2, 68);

  const brasil = WORLD_SPOTS.find(s => s.final);
  // rotas tracejadas: tudo leva ao Brasil
  ctx.save();
  ctx.setLineDash([6, 7]);
  ctx.strokeStyle = '#ffd23f33'; ctx.lineWidth = 2;
  for (const s of WORLD_SPOTS) {
    if (s.final) continue;
    ctx.beginPath();
    ctx.moveTo(s.x * W, s.y * H);
    ctx.quadraticCurveTo((s.x + brasil.x) / 2 * W, Math.max(s.y, brasil.y) * H + 30, brasil.x * W, brasil.y * H);
    ctx.stroke();
  }
  ctx.restore();

  // marcadores
  for (let i = 0; i < WORLD_SPOTS.length; i++) {
    const s = WORLD_SPOTS[i];
    const sx = s.x * W, sy = s.y * H;
    const done = phasesDone.has(s.phase);
    const locked = s.final && !worldAllDone();
    const sel = i === worldSel;
    // ilha secreta: sÃ³ um "?" fantasma atÃ© achar as 3 Moedas de SilÃ­cio
    if (s.secret && !secretUnlocked()) {
      ctx.save();
      ctx.globalAlpha = 0.25 + Math.sin(time * 2) * 0.1;
      ctx.font = '18px serif'; ctx.textAlign = 'center';
      ctx.fillStyle = '#88ccff';
      ctx.fillText('?', sx, sy + 6);
      ctx.restore();
      continue;
    }
    // pino
    if (sel) {
      ctx.strokeStyle = '#ffd23f';
      ctx.lineWidth = 2 + Math.sin(time * 6) * 1;
      ctx.beginPath(); ctx.arc(sx, sy, 22 + Math.sin(time * 6) * 3, 0, 7); ctx.stroke();
    }
    ctx.beginPath(); ctx.arc(sx, sy, 15, 0, 7);
    ctx.fillStyle = done ? '#1d4a2a' : locked ? '#333' : '#4a3a10';
    ctx.fill();
    ctx.strokeStyle = done ? '#66ff88' : locked ? '#555' : '#ffd23f';
    ctx.lineWidth = 2; ctx.stroke();
    ctx.font = '16px serif'; ctx.textAlign = 'center';
    ctx.fillText(locked ? 'ðŸ”’' : done ? 'âœ”' : s.flag, sx, sy + 6);
    // moeda perdida nessa missÃ£o? badge piscando no pino
    if (PHASES[s.phase] && PHASES[s.phase].coin && !siliconCoins.has(s.phase)) {
      ctx.save();
      ctx.globalAlpha = 0.6 + Math.sin(time * 4) * 0.4;
      ctx.font = '12px serif';
      ctx.fillText('ðŸ”˜', sx + 16, sy - 12);
      ctx.restore();
    }
    if (sel) {
      const trSpot = LTX().spots && LTX().spots[i];
      ctx.font = 'bold 12px Courier New'; ctx.fillStyle = '#fff';
      ctx.fillText((trSpot && trSpot.name) || s.name, sx, sy - 30);
    }
  }
  // painel de informaÃ§Ã£o da missÃ£o selecionada
  const s = WORLD_SPOTS[worldSel];
  const done = phasesDone.has(s.phase);
  const locked = s.final && !worldAllDone();
  const pw = Math.min(W * 0.7, 640), px2 = W / 2 - pw / 2, py2 = H - 96;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 12;
  ctx.fillStyle = 'rgba(12,12,24,0.92)';
  rr(px2, py2, pw, 74, 14); ctx.fill();
  ctx.restore();
  ctx.strokeStyle = locked ? '#666' : done ? '#66ff88' : '#ffd23f'; ctx.lineWidth = 2;
  rr(px2, py2, pw, 74, 14); ctx.stroke();
  const trSel = LTX().spots && LTX().spots[worldSel];
  ctx.font = 'bold 14px Courier New'; ctx.textAlign = 'left';
  ctx.fillStyle = locked ? '#888' : '#ffd23f';
  ctx.fillText(`${s.flag} ${phT(PHASES[s.phase])}`, px2 + 18, py2 + 24);
  ctx.font = '12px Courier New'; ctx.fillStyle = '#ccc';
  ctx.fillText(`${t('bossLabel')}: ${(trSel && trSel.boss) || s.boss}  Â·  ${t('pieceLabel')}: ${(trSel && trSel.peca) || s.peca}`, px2 + 18, py2 + 44);
  ctx.font = 'bold 12px Courier New';
  if (locked) {
    ctx.fillStyle = worldLockedMsg > 0 ? '#ff5544' : '#888';
    ctx.fillText(t('lockedMsg'), px2 + 18, py2 + 63);
  } else if (done && PHASES[s.phase] && PHASES[s.phase].coin && !siliconCoins.has(s.phase)) {
    ctx.fillStyle = '#88ccff';
    ctx.fillText(t('coinPending'), px2 + 18, py2 + 63);
  } else if (done) {
    ctx.fillStyle = '#66ff88';
    ctx.fillText(t('doneMission'), px2 + 18, py2 + 63);
  } else {
    ctx.fillStyle = '#ffd23f';
    ctx.fillText(t('available'), px2 + 18, py2 + 63);
  }
  ctx.font = '11px Courier New'; ctx.fillStyle = '#8888aa'; ctx.textAlign = 'center';
  ctx.fillText(t('worldHint'), W / 2, H - 8);

  // navegaÃ§Ã£o: ordem GEOGRÃFICA (por longitude) e sÃ³ missÃµes ainda nÃ£o feitas
  const selectable = WORLD_SPOTS
    .map((s, i) => i)
    .filter(i => {
      const s = WORLD_SPOTS[i];
      if (s.secret && !secretUnlocked()) return false;
      if (s.final) return true;
      if (!phasesDone.has(s.phase)) return true;
      // concluÃ­da MAS com Moeda de SilÃ­cio perdida: pode voltar pra caÃ§ar!
      return PHASES[s.phase].coin && !siliconCoins.has(s.phase);
    })
    .sort((a, b) => WORLD_SPOTS[a].x - WORLD_SPOTS[b].x);
  if (selectable.length && !selectable.includes(worldSel)) worldSel = selectable[0];
  const left = keys['arrowleft'] || keys['a'], right = keys['arrowright'] || keys['d'];
  if (!left && !right) worldMoveLock = false;
  if (!worldMoveLock && selectable.length) {
    const pos = selectable.indexOf(worldSel);
    if (left)  { worldSel = selectable[(pos + selectable.length - 1) % selectable.length]; worldMoveLock = true; beep(440, 0.05); }
    if (right) { worldSel = selectable[(pos + 1) % selectable.length]; worldMoveLock = true; beep(440, 0.05); }
  }
}

// acessores traduzidos das fases (PT inline Ã© o fallback)
function phOv(phase) { return (LTX().phases && LTX().phases[phase.id]) || null; }
function phT(phase) { const o = phOv(phase); return (o && o.title) || phase.title; }
function phP(phase) { const o = phOv(phase); return (o && o.place) || phase.place; }
function dlg(kind) {
  const o = phOv(currentPhase);
  const map = { intro: 'intro', bossDialog: 'boss', victory: 'victory' };
  return (o && o[map[kind]]) || currentPhase[kind];
}
function slideText(slides, i) {
  const arr = slides === STORY_SLIDES ? LTX().story : LTX().ending;
  return (arr && arr[i]) || slides[i].text;
}

let phaseIndex = 0;
let currentPhase = PHASES[0];
let waves = [];
let finalRush = [];
let awaken = false, awakenT = 0;
let enemies = [];
let bossDefeated = false;
let currentLock = null;
let dialogIndex = 0;
let player = new Player('bob');

function loadPhase(i, keepPlayer) {
  phaseIndex = i;
  currentPhase = PHASES[i];
  waves = currentPhase.makeWaves();
  finalRush = currentPhase.rush ? currentPhase.rush() : [];
  treino = 0; treinoQuarter = 0; awaken = false; awakenT = 0;
  enemies = [];
  allies = [];
  projectiles = [];
  popups = [];
  impacts = [];
  drops.length = 0;
  floatTexts.length = 0;
  camX = 0;
  bossDefeated = false;
  currentLock = null;
  dialogIndex = 0;
  if (keepPlayer) {
    const score = player.score;
    const heroKey = player.char;
    player = new Player(heroKey);
    player.score = score; // vida cheia na fase nova, score acumula
  }
  // EficiÃªncia do Deep-Zeek: chega na fase com o especial JÃ CHEIO
  if (conquests.eficiencia) player.special = player.maxSpecial;
  // chegando na fase final, o mutirÃ£o jÃ¡ ergueu o galpÃ£o
  if (currentPhase.finalPhase) conquests.predio = true;
  companion = new Companion();
  companion.x = player.x - 60;
  companion.gy = player.gy;
  saci = new SaciBot();
  saci.x = player.x - 40;
  saci.gy = player.gy + 16;
}

function updateWaves() {
  if (currentLock === null) {
    for (const w of waves) {
      if (!w.spawned && camX >= Math.min(w.camLock, currentPhase.stageLen - W - 10)) {
        w.spawned = true;
        currentLock = w.camLock;
        const pack = w.make();
        // capangas entram DE FORA da tela (chefes ficam no covil deles)
        let ri = 0, li = 0;
        for (const e of pack) {
          if (!e.isBoss) {
            if (e.x < camX + W * 0.45) e.x = camX - 90 - (li++ * 80); // entra pela esquerda
            else e.x = camX + W + 90 + (ri++ * 80);                   // entra pela direita
          }
          // todo mundo jÃ¡ nasce ENCARANDO o herÃ³i (importante no diÃ¡logo de chefe,
          // quando a cena fica congelada antes da IA rodar)
          e.facing = Math.sign(player.x - e.x) || -1;
        }
        enemies.push(...pack);
        if (w.bossIntro) { gameState = 'bossdialog'; dialogIndex = 0; sfx.boss(); }
        break;
      }
    }
  } else {
    if (enemies.every(e => e.dead || e.removeMe)) currentLock = null;
  }
}

// ---- CUTSCENE DE INTRODUÃ‡ÃƒO (painÃ©is narrados estilo Streets of Rage) ----
const STORY_SLIDES = [
  { file: 'sprites/story/intro-1.png', emoji: 'ðŸº',
    text: 'HÃ¡ muito tempo, os profetas do silÃ­cio falavam de um artefato: a AGI SAGRADA â€” o CÃ¡lice de SilÃ­cio capaz de dar consciÃªncia Ã s mÃ¡quinas.' },
  { file: 'sprites/story/intro-2.png', emoji: 'ðŸ°',
    text: 'As Big Techs e os impÃ©rios partiram em caÃ§ada. NÃ£o por sabedoria... por PODER.' },
  { file: 'sprites/story/intro-3.png', emoji: 'ðŸ—ºï¸',
    text: 'Eles tomaram tudo: a Energia, as GPUs, o Segredo, os Dados e a EficiÃªncia. O mundo foi dividido em cinco fortalezas.' },
  { file: 'sprites/story/intro-4.png', emoji: 'ðŸ‡§ðŸ‡·',
    text: 'Mas no sul do mundo, uma comunidade treinava em segredo a sua prÃ³pria esperanÃ§a: o CURUPIRA-beta â€” uma IA com sotaque, memÃ³ria e coraÃ§Ã£o.' },
  { file: 'sprites/story/intro-5.png', emoji: 'ðŸ¤ ',
    text: 'Seu guardiÃ£o: BOB, o arqueÃ³logo do conhecimento livre, apresentador do canal INTELIGÃŠNCIA MIL GRAU. Seus escudeiros: A Comunidade de Mestres da IA.' },
  { file: 'sprites/story/intro-6.png', emoji: 'ðŸš¨',
    text: 'E entÃ£o, numa noite de terÃ§a-feira... eles vieram buscar o que era NOSSO.' },
];
// CUTSCENE DE ENCERRAMENTO â€” o clima especial de finalizaÃ§Ã£o!
const ENDING_SLIDES = [
  { file: 'sprites/story/final-1.png', emoji: 'ðŸ¤–',
    text: 'No coraÃ§Ã£o de um galpÃ£o erguido em mutirÃ£o, uma luz verde-amarela abriu os olhos pela primeira vez. "Oi. Fui feito por muita gente junta."' },
  { file: 'sprites/story/final-2.png', emoji: 'ðŸŽ‰',
    text: 'A comunidade explodiu. Choraram os pesquisadores demitidos, os SaaSseiros, os professores. O Loro desmaiou de emoÃ§Ã£o â€” e reiniciou sozinho, de pura alegria.' },
  { file: 'sprites/story/final-3.png', emoji: 'ðŸ¤',
    text: 'Os chefÃµes receberam contas gratuitas. O Trunfo tentou comprar. O Ilon tuitou que a ideia era dele. O DÃ¡rio escreveu 15 mil palavras sobre a derrota. NinguÃ©m leu.' },
  { file: 'sprites/story/final-4.png', emoji: 'ðŸ‰',
    text: 'De um camarote distante, o dragÃ£o terminou seu pastel, aprovou em silÃªncio... e enviou um pull request.' },
  { file: 'sprites/story/final-5.png', emoji: 'ðŸ‡§ðŸ‡·',
    text: 'E o CURUPIRA-1 falou portuguÃªs desde o boot: com sotaque, com memÃ³ria e com coraÃ§Ã£o. A AGI Sagrada nunca esteve numa fortaleza. Estava na comunidade.' },
  { file: 'sprites/story/final-6.png', emoji: 'ðŸº',
    text: 'Sempre esteve. ...Bob ajeitou o chapÃ©u e olhou pro esquadrÃ£o: "Bom... alguÃ©m tem uma pauta pro prÃ³ximo vÃ­deo?" â€” FIM.' },
];
for (const s of [...STORY_SLIDES, ...ENDING_SLIDES]) {
  s.img = new Image();
  s.img.onload = () => { s.ready = true; };
  s.img.src = s.file;
}
let storyIndex = 0, storyChars = 0;

// logotipo de cinema (usado no tÃ­tulo quando o Codex gerar)
const titleLogo = new Image();
titleLogo.onload = () => { titleLogo.ready = true; };
titleLogo.src = 'sprites/title_logo.png';
// pÃ´ster de abertura com o elenco (idem)
const titleBg = new Image();
titleBg.onload = () => { titleBg.ready = true; };
titleBg.src = 'sprites/title_bg.png';

function drawStory(slides) {
  const s = slides[storyIndex];
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  if (s.ready) {
    // imagem em modo "cover" com leve zoom lento (efeito Ken Burns)
    const zoom = 1.04 + (time % 10) * 0.004;
    const scale = Math.max(W / s.img.width, H / s.img.height) * zoom;
    const iw = s.img.width * scale, ih = s.img.height * scale;
    ctx.drawImage(s.img, (W - iw) / 2, (H - ih) / 2, iw, ih);
    // vinheta pra legenda respirar
    const vin = ctx.createLinearGradient(0, H - 190, 0, H);
    vin.addColorStop(0, 'rgba(0,0,0,0)'); vin.addColorStop(1, 'rgba(0,0,0,0.9)');
    ctx.fillStyle = vin; ctx.fillRect(0, H - 190, W, 190);
  } else {
    // sem imagem ainda: painel escuro com o emoji do slide
    const grad = ctx.createRadialGradient(W / 2, H / 2 - 40, 40, W / 2, H / 2, 400);
    grad.addColorStop(0, '#1a1a33'); grad.addColorStop(1, '#000');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);
    ctx.font = '110px serif'; ctx.textAlign = 'center';
    ctx.fillText(s.emoji, W / 2, H / 2 - 20);
    ctx.font = '11px Courier New'; ctx.fillStyle = '#555';
    ctx.fillText(t('genImg'), W / 2, H / 2 + 40);
  }
  // legenda com efeito mÃ¡quina de escrever
  storyChars += dt * 45;
  const shown = slideText(slides, storyIndex).slice(0, Math.floor(storyChars));
  const boxW = Math.min(W * 0.8, 820), bx = W / 2 - boxW / 2, by = H - 128;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.7)'; ctx.shadowBlur = 14; ctx.shadowOffsetY = 4;
  ctx.fillStyle = 'rgba(10,10,20,0.88)';
  rr(bx, by, boxW, 92, 14); ctx.fill();
  ctx.restore();
  ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = 2;
  rr(bx, by, boxW, 92, 14); ctx.stroke();
  ctx.font = '14px Courier New'; ctx.fillStyle = '#f5e6b8'; ctx.textAlign = 'left';
  wrapText(shown, bx + 24, by + 30, boxW - 48, 20);
  // progresso (pontinhos) + dica
  ctx.textAlign = 'center';
  for (let i = 0; i < slides.length; i++) {
    ctx.fillStyle = i === storyIndex ? '#ffd23f' : '#444';
    ctx.beginPath(); ctx.arc(W / 2 - (slides.length - 1) * 9 + i * 18, H - 16, 4, 0, 7); ctx.fill();
  }
  ctx.font = '10px Courier New'; ctx.fillStyle = '#8888aa'; ctx.textAlign = 'right';
  ctx.fillText(t('storyHint'), W - 20, H - 12);
}

// ---- Estado ----
let gameState = 'title'; // title | story | select | intro | play | bossdialog | victory | gameover

// ---- HUD ----
function drawHUD() {
  ctx.fillStyle = '#000a'; ctx.fillRect(16, 14, 250, 40);
  ctx.font = 'bold 11px Courier New'; ctx.fillStyle = player.hero.specialColor; ctx.textAlign = 'left';
  ctx.fillText(player.hero.name, 24, 28);
  ctx.fillStyle = '#400'; ctx.fillRect(24, 34, 180, 10);
  ctx.fillStyle = player.hp > 30 ? '#3e3' : '#e33';
  ctx.fillRect(24, 34, 180 * (player.hp / player.maxHp), 10);
  ctx.fillStyle = '#220a33'; ctx.fillRect(24, 46, 180, 5);
  ctx.fillStyle = player.special >= player.maxSpecial ? '#ffd23f' : '#8844cc';
  ctx.fillRect(24, 46, 180 * (player.special / player.maxSpecial), 5);
  if (player.special >= player.maxSpecial) {
    ctx.fillStyle = '#ffd23f'; ctx.fillText(t('specialReady'), 210, 52);
  }
  // Ã­cones das conquistas ativas
  ctx.font = '12px serif'; ctx.textAlign = 'left';
  let ci = 0;
  if (conquests.itaipu)     ctx.fillText('âš¡', 210 + ci++ * 16, 44);
  if (conquests.blueprints) ctx.fillText('ðŸŒª', 210 + ci++ * 16, 44);
  if (conquests.playbook)   ctx.fillText('ðŸ’°', 210 + ci++ * 16, 44);
  if (conquests.dados)      ctx.fillText('ðŸ“š', 210 + ci++ * 16, 44);
  if (conquests.eficiencia) ctx.fillText('ðŸ”²', 210 + ci++ * 16, 44);
  if (conquests.litografia) ctx.fillText('ðŸ“œ', 210 + ci++ * 16, 44);
  ctx.textAlign = 'right'; ctx.fillStyle = '#fff';
  ctx.font = 'bold 14px Courier New';
  ctx.fillText(`SCORE ${player.score}`, W - 20, 30);
  if (player.combo > 1) {
    ctx.fillStyle = '#ff8833';
    ctx.fillText(`COMBO x${player.combo}`, W - 20, 48);
  }
  ctx.font = '11px Courier New'; ctx.fillStyle = '#8888aa'; ctx.textAlign = 'center';
  ctx.fillText(`${phT(currentPhase)} Â· ${phP(currentPhase)}`, W / 2, 22);
  if (!currentPhase.finalPhase && currentLock === null && camX < currentPhase.stageLen - W && enemies.every(e => e.dead || e.removeMe)) {
    const blinkOn = Math.floor(time * 2) % 2 === 0;
    if (blinkOn && !goBlinkWas) {
      // plin plin plin! (o sininho clÃ¡ssico do GO)
      beep(1319, 0.05, 'sine', 0.07);
      setTimeout(() => beep(1568, 0.05, 'sine', 0.07), 70);
      setTimeout(() => beep(2093, 0.07, 'sine', 0.07), 140);
    }
    goBlinkWas = blinkOn;
    if (blinkOn) {
      ctx.font = 'bold 26px Courier New'; ctx.fillStyle = '#ffd23f'; ctx.textAlign = 'right';
      ctx.fillText('GO â†’', W - 24, H / 2);
    }
  } else goBlinkWas = false;
}
let goBlinkWas = false;

// ---- DiÃ¡logos estilo VERSUS: herÃ³i Ã  esquerda, vilÃ£o Ã  direita ----
const VILLAIN_SPEAKERS = ['???', 'ESTAGIÃRIO', 'TRUNFO', 'ILON', 'SAMUCA', 'DÃRIO', 'DEEP-ZEEK', 'GÃŠMEO'];
const PORTRAITS = {
  'BOB':       { char: 'bob', action: 'idle' },
  'FÃŠ-FÃŠ':     { char: 'fefe', action: 'idle' },
  'ESCUDEIRO': { char: 'escudeiro', action: 'idle' },
  'LORO':      { char: 'loro', action: 'hover' },
  'TRUNFO':    { char: 'trunfo', action: 'idle' },
  'ILON':      { char: 'ilon', action: 'idle' },
  'SAMUCA':    { char: 'samuca', action: 'idle' },
  'DÃRIO':     { char: 'dario', action: 'idle' },
  'DEEP-ZEEK': { char: 'deepzeek', action: 'idle' },
  'CURUPIRA':  { char: 'curupira', action: 'idle' },
  'MIRA':      { char: 'mira', action: 'idle' },
  'ESTAGIÃRIO':{ char: 'estagiario', action: 'idle' },
  'GÃŠMEO':     { char: 'gemeo', action: 'idle' },
  'GRÃƒO-MESTRE': { char: 'graomestre', action: 'idle' },
};
const PORTRAIT_EMOJI = { '???': 'â“', 'ESTAGIÃRIO': 'ðŸ§‘â€ðŸ’¼', 'SISTEMA': 'ðŸ§ ', 'LORO': 'ðŸ¦œ', 'CURUPIRA': 'ðŸ¤–', 'MIRA': 'ðŸ•µï¸', 'GRÃƒO-MESTRE': 'ðŸ§™', 'GÃŠMEO': 'ðŸ”®' };

function drawPortrait(x, y, size, speaker, wantsLeft, borderColor) {
  ctx.save();
  rr(x, y, size, size, 12); ctx.clip();
  ctx.fillStyle = '#0d0d1a'; ctx.fillRect(x, y, size, size);
  const cfg = PORTRAITS[speaker];
  const frames = cfg ? getAnim(cfg.char, cfg.action) : null;
  if (frames) {
    const img = frames[Math.floor(time * 6) % frames.length];
    ctx.save();
    ctx.translate(x + size / 2, 0);
    // espelha sÃ³ se a direÃ§Ã£o desenhada do sprite nÃ£o bate com a desejada
    const drawnRight = SPRITE_DEFS[cfg.char] ? SPRITE_DEFS[cfg.char].faceRight : true;
    const doFlip = wantsLeft ? drawnRight : !drawnRight;
    if (doFlip) ctx.scale(-1, 1);
    // recorte do busto (cabeÃ§a/tronco do frame 128px)
    ctx.drawImage(img, 26, 18, 76, 76, -size / 2, y, size, size);
    ctx.restore();
  } else {
    ctx.font = `${Math.round(size * 0.6)}px serif`; ctx.textAlign = 'center';
    ctx.fillText(PORTRAIT_EMOJI[speaker] || 'ðŸ‘¤', x + size / 2, y + size * 0.72);
  }
  ctx.restore();
  ctx.strokeStyle = borderColor; ctx.lineWidth = 2;
  rr(x, y, size, size, 12); ctx.stroke();
}

// retÃ¢ngulo arredondado (com fallback pra navegador antigo)
function rr(x, y, w, h, r) {
  ctx.beginPath();
  if (ctx.roundRect) { ctx.roundRect(x, y, w, h, r); return; }
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// falas escritas como 'BOB' sÃ£o do HERÃ“I â€” viram o personagem escolhido
const HERO_SPEAKER_NAME = { bob: 'BOB', fefe: 'FÃŠ-FÃŠ', escudeiro: 'ESCUDEIRO' };
function drawDialogBox(lines) {
  let [speaker, text] = lines[dialogIndex];
  if (speaker === 'BOB') speaker = HERO_SPEAKER_NAME[player.char] || 'BOB';
  const isVillain = VILLAIN_SPEAKERS.includes(speaker);
  const isSystem = speaker === 'SISTEMA';
  const top = 24, boxH = 112, P = 78;
  const boxW = Math.min(W * 0.66, 640);
  const bx = isSystem ? W / 2 - boxW / 2 : isVillain ? W - 30 - boxW : 30;
  const borderColor = isSystem ? '#66ff88' : isVillain ? '#ff5544' : '#ffd23f';

  // painel arredondado com sombra e leve gradiente
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 5;
  const grad = ctx.createLinearGradient(bx, top, bx, top + boxH);
  grad.addColorStop(0, 'rgba(22,22,40,0.94)');
  grad.addColorStop(1, 'rgba(8,8,18,0.94)');
  ctx.fillStyle = grad;
  rr(bx, top, boxW, boxH, 16); ctx.fill();
  ctx.restore();
  ctx.strokeStyle = borderColor; ctx.lineWidth = 2;
  rr(bx, top, boxW, boxH, 16); ctx.stroke();

  // "rabinho" apontando pra cena
  ctx.fillStyle = borderColor;
  ctx.beginPath();
  const tailX = isSystem ? bx + boxW / 2 : isVillain ? bx + boxW - P / 2 - 14 : bx + P / 2 + 14;
  ctx.moveTo(tailX - 8, top + boxH);
  ctx.lineTo(tailX + 8, top + boxH);
  ctx.lineTo(tailX, top + boxH + 10);
  ctx.closePath(); ctx.fill();

  let textX, textW;
  if (isVillain) {
    drawPortrait(bx + boxW - P - 12, top + 17, P, speaker, true, borderColor);
    textX = bx + 18; textW = boxW - P - 50;
  } else if (isSystem) {
    textX = bx + 22; textW = boxW - 44;
  } else {
    drawPortrait(bx + 12, top + 17, P, speaker, false, borderColor);
    textX = bx + P + 26; textW = boxW - P - 50;
  }
  // nome em "pÃ­lula" arredondada
  ctx.font = 'bold 12px Courier New';
  const label = isSystem ? t('system') : speaker;
  const pillW = ctx.measureText(label).width + 20;
  const pillX = isSystem ? bx + boxW / 2 - pillW / 2 : isVillain ? bx + boxW - P - 24 - pillW : textX;
  ctx.fillStyle = borderColor;
  rr(pillX, top + 10, pillW, 19, 9); ctx.fill();
  ctx.fillStyle = '#101018'; ctx.textAlign = 'center';
  ctx.fillText(label, pillX + pillW / 2, top + 24);

  ctx.font = '13px Courier New'; ctx.fillStyle = '#fff'; ctx.textAlign = 'left';
  wrapText(text, textX, top + 50, textW, 17);
  ctx.font = '10px Courier New'; ctx.fillStyle = '#8888aa'; ctx.textAlign = 'right';
  ctx.fillText(t('dialogHint'), bx + boxW - 16, top + boxH - 9);
}
function wrapText(text, x, y, maxW, lh) {
  const words = text.split(' ');
  let line = '';
  for (const word of words) {
    if (ctx.measureText(line + word).width > maxW) {
      ctx.fillText(line, x, y); line = word + ' '; y += lh;
    } else line += word + ' ';
  }
  ctx.fillText(line, x, y);
}

// ---- Telas ----
function drawTitle() {
  currentPhase = PHASES[0];
  if (titleBg.ready) {
    // pÃ´ster de cinema do Codex (modo cover)
    const scale = Math.max(W / titleBg.width, H / titleBg.height);
    const iw = titleBg.width * scale, ih = titleBg.height * scale;
    ctx.drawImage(titleBg, (W - iw) / 2, (H - ih) / 2, iw, ih);
    ctx.fillStyle = 'rgba(0,0,10,0.3)'; ctx.fillRect(0, 0, W, H);
  } else {
    drawBackground();
    ctx.fillStyle = '#000a'; ctx.fillRect(0, 0, W, H);
  }
  ctx.textAlign = 'center';
  if (titleLogo.ready) {
    // logotipo estilo pÃ´ster de Hollywood gerado pelo Codex.
    // blend "screen": o fundo preto do PNG some e sÃ³ as letras brilham
    const lw = Math.min(W * 0.72, 640);
    const lh = lw * (titleLogo.height / titleLogo.width);
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.drawImage(titleLogo, W / 2 - lw / 2, 170 - lh / 2, lw, lh);
    ctx.restore();
  } else {
    ctx.font = 'bold 40px Courier New';
    ctx.fillStyle = '#ffd23f';
    ctx.strokeStyle = '#a3320b'; ctx.lineWidth = 6;
    ctx.strokeText('BOB EM BUSCA DA', W / 2, 100);
    ctx.fillText('BOB EM BUSCA DA', W / 2, 100);
    ctx.font = 'bold 58px Courier New';
    ctx.strokeText('AGI SAGRADA', W / 2, 162);
    ctx.fillText('AGI SAGRADA', W / 2, 162);
  }
  // versÃ£o: etiqueta discreta no canto (pra nÃ£o cobrir o pÃ´ster)
  ctx.font = '11px Courier New'; ctx.fillStyle = '#8888aa'; ctx.textAlign = 'right';
  ctx.fillText('DEMO v0.9', W - 14, 20);
  // dropdown de idioma (clicÃ¡vel), embaixo da versÃ£o
  titleLangBoxes = [];
  const lw2 = 148, lx2 = W - 14 - lw2, lyBase = 28;
  ctx.fillStyle = 'rgba(10,10,22,0.85)';
  rr(lx2, lyBase, lw2, 24, 8); ctx.fill();
  ctx.strokeStyle = titleLangOpen ? '#ffd23f' : '#555'; ctx.lineWidth = 1.5;
  rr(lx2, lyBase, lw2, 24, 8); ctx.stroke();
  ctx.font = 'bold 11px Courier New'; ctx.fillStyle = '#cfcfe6'; ctx.textAlign = 'center';
  ctx.fillText(`ðŸŒ ${LTX().name} ${titleLangOpen ? 'â–´' : 'â–¾'}`, lx2 + lw2 / 2, lyBase + 16);
  titleLangBoxes.push({ x: lx2, y: lyBase, w: lw2, h: 24, lang: null });
  if (titleLangOpen) {
    LANG_ORDER.forEach((lg, i) => {
      const oy = lyBase + 28 + i * 26;
      ctx.fillStyle = lg === settings.lang ? 'rgba(255,210,63,0.18)' : 'rgba(10,10,22,0.9)';
      rr(lx2, oy, lw2, 24, 8); ctx.fill();
      ctx.strokeStyle = '#444'; ctx.lineWidth = 1;
      rr(lx2, oy, lw2, 24, 8); ctx.stroke();
      ctx.fillStyle = lg === settings.lang ? '#ffd23f' : '#b8b8cc';
      ctx.fillText(LANGS[lg].name, lx2 + lw2 / 2, oy + 16);
      titleLangBoxes.push({ x: lx2, y: oy, w: lw2, h: 24, lang: lg });
    });
  }
  ctx.textAlign = 'center';
  // o ESQUADRÃƒO no centro (sÃ³ quando nÃ£o tem o pÃ´ster do Codex)
  if (!titleBg.ready) {
    const glow = ctx.createRadialGradient(W / 2, 390, 20, W / 2, 390, 220);
    glow.addColorStop(0, 'rgba(255, 210, 63, 0.22)');
    glow.addColorStop(1, 'rgba(255, 210, 63, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(W / 2 - 240, 170, 480, 380);
    const drawHero = (key, cx, y, size, flip) => {
      const frames = getAnim(key, 'idle') || getAnim(key, 'hover');
      if (!frames) return;
      const img = frames[Math.floor(time * 6) % frames.length];
      ctx.save();
      ctx.translate(cx, 0);
      if (flip) ctx.scale(-1, 1);
      ctx.drawImage(img, -size / 2, y, size, size);
      ctx.restore();
    };
    // escudeiros ladeando (Escudeiro espelhado, encarando o centro)
    drawHero('fefe', W / 2 - 155, 292, 180, false);
    drawHero('escudeiro', W / 2 + 155, 292, 180, true);
    // Bob GRANDE no centro â€” o herÃ³i Ã© ele!
    drawHero('bob', W / 2, 250, 235, false);
    // Loro voando em volta do grupo
    const lx = W / 2 + Math.sin(time * 1.4) * 190;
    const ly = 255 + Math.cos(time * 2.1) * 22;
    const loroFrames = getAnim('loro', 'hover');
    if (loroFrames) {
      const img = loroFrames[Math.floor(time * 8) % loroFrames.length];
      ctx.save();
      if (Math.cos(time * 1.4) < 0) { ctx.translate(lx, 0); ctx.scale(-1, 1); ctx.translate(-lx, 0); }
      ctx.drawImage(img, lx - 42, ly - 42, 84, 84);
      ctx.restore();
    }
  }
  if (Math.floor(time * 2) % 2 === 0) {
    ctx.font = 'bold 18px Courier New'; ctx.fillStyle = '#ffd23f';
    ctx.fillText(t('pressSpace'), W / 2, 488);
  }
  // rodapÃ©: crÃ©dito da comunidade + disclaimer, tudo na faixa escura
  ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(0, H - 44, W, 44);
  ctx.font = 'bold 12px Courier New'; ctx.fillStyle = '#ffd23f';
  ctx.fillText(t('credit'), W / 2, H - 30);
  ctx.font = '11px Courier New'; ctx.fillStyle = '#9a9ab0';
  ctx.fillText(t('disc1'), W / 2, H - 16);
  ctx.fillText(t('disc2'), W / 2, H - 4);
}

let selectMoveLock = false;
function drawSelect() {
  currentPhase = PHASES[0];
  drawBackground();
  ctx.fillStyle = '#000b'; ctx.fillRect(0, 0, W, H);
  ctx.textAlign = 'center';
  ctx.font = 'bold 28px Courier New'; ctx.fillStyle = '#ffd23f';
  ctx.strokeStyle = '#a3320b'; ctx.lineWidth = 4;
  ctx.strokeText(t('chooseHero'), W / 2, 70);
  ctx.fillText(t('chooseHero'), W / 2, 70);

  const N = HERO_ORDER.length;
  const slotW = Math.min(230, (W - 80) / N);
  const totalW = slotW * N;
  const startX = W / 2 - totalW / 2;
  for (let i = 0; i < N; i++) {
    const hero = HEROES[HERO_ORDER[i]];
    const cx = startX + slotW * i + slotW / 2;
    const isSel = i === selectedHero;
    // moldura
    ctx.fillStyle = isSel ? '#ffd23f22' : '#00000055';
    ctx.fillRect(cx - slotW / 2 + 8, 100, slotW - 16, 300);
    ctx.strokeStyle = isSel ? '#ffd23f' : '#444';
    ctx.lineWidth = isSel ? 3 : 1;
    ctx.strokeRect(cx - slotW / 2 + 8, 100, slotW - 16, 300);
    // sprite idle
    const frames = getAnim(hero.key, hero.idle);
    if (frames) {
      const img = frames[Math.floor(time * 6) % frames.length];
      const size = isSel ? 170 : 140;
      ctx.drawImage(img, cx - size / 2, 280 - (ANCHOR_Y / CELL) * size + (isSel ? -6 : 0), size, size);
    } else {
      drawPlaceholderHumanoid(cx, 290, { body: '#555', accent: hero.specialColor, facing: 1, t: time + i });
    }
    // nome e stats
    ctx.font = `bold ${isSel ? 12 : 10}px Courier New`;
    ctx.fillStyle = isSel ? hero.specialColor : '#999'; ctx.textAlign = 'center';
    ctx.fillText(hero.name, cx, 330);
    ctx.font = '10px Courier New'; ctx.fillStyle = '#aaa';
    wrapTextCentered(t('heroDesc')[hero.key] || hero.desc, cx, 348, slotW - 30, 12);
    // barrinhas VEL/VIDA
    const bx = cx - 40;
    ctx.textAlign = 'left'; ctx.font = '9px Courier New'; ctx.fillStyle = '#888';
    ctx.fillText(t('vel'), bx - 22, 376);
    ctx.fillStyle = '#333'; ctx.fillRect(bx, 369, 60, 6);
    ctx.fillStyle = '#4bf'; ctx.fillRect(bx, 369, 60 * (hero.speed / 240), 6);
    ctx.fillStyle = '#888'; ctx.fillText(t('vida'), bx - 22, 388);
    ctx.fillStyle = '#333'; ctx.fillRect(bx, 381, 60, 6);
    ctx.fillStyle = '#3e3'; ctx.fillRect(bx, 381, 60 * (hero.hp / 140), 6);
  }
  // o Loro voa na tela de seleÃ§Ã£o â€” ele vai junto com qualquer herÃ³i!
  const loroFrames = getAnim('loro', 'hover');
  const lx = W / 2 + Math.sin(time * 1.2) * (W / 3);
  const ly = 435 + Math.sin(time * 4) * 8;
  if (loroFrames) {
    const img = loroFrames[Math.floor(time * 8) % loroFrames.length];
    ctx.save();
    if (Math.cos(time * 1.2) < 0) { ctx.translate(lx, 0); ctx.scale(-1, 1); ctx.translate(-lx, 0); }
    ctx.drawImage(img, lx - 45, ly - 45, 90, 90);
    ctx.restore();
  } else {
    ctx.font = '30px serif'; ctx.textAlign = 'center'; ctx.fillText('ðŸ¦œ', lx, ly);
  }
  ctx.textAlign = 'center';
  ctx.font = '12px Courier New'; ctx.fillStyle = '#66ff88';
  ctx.fillText(t('loroNote'), W / 2, 478);
  if (Math.floor(time * 2) % 2 === 0) {
    ctx.font = 'bold 15px Courier New'; ctx.fillStyle = '#ffd23f';
    ctx.fillText(t('selectHint'), W / 2, 505);
  }
  // input
  const N2 = HERO_ORDER.length;
  const left = keys['arrowleft'] || keys['a'], right = keys['arrowright'] || keys['d'];
  if (!left && !right) selectMoveLock = false;
  if (!selectMoveLock) {
    if (left) { selectedHero = (selectedHero + N2 - 1) % N2; selectMoveLock = true; beep(440, 0.05); }
    if (right) { selectedHero = (selectedHero + 1) % N2; selectMoveLock = true; beep(440, 0.05); }
  }
}
function wrapTextCentered(text, cx, y, maxW, lh) {
  const words = text.split(' ');
  let line = '';
  const lines = [];
  for (const word of words) {
    if (ctx.measureText(line + word).width > maxW) { lines.push(line); line = word + ' '; }
    else line += word + ' ';
  }
  lines.push(line);
  for (const l of lines) { ctx.fillText(l.trim(), cx, y); y += lh; }
}

// ---- MENU DE OPÃ‡Ã•ES (tecla P) ----
const menuItems = [
  { k: 'mLang', type: 'lang' },
  { k: 'mDiff', type: 'choice', key: 'difficulty' },
  { k: 'mMusic', type: 'toggle', key: 'musicOn' },
  { k: 'mMusicVol', type: 'slider', key: 'musicVol' },
  { k: 'mSfx', type: 'toggle', key: 'sfxOn' },
  { k: 'mSfxVol', type: 'slider', key: 'sfxVol' },
  { k: 'mClose', type: 'close' },
];
function cycleLang(dir) {
  const i = LANG_ORDER.indexOf(settings.lang);
  settings.lang = LANG_ORDER[(i + dir + LANG_ORDER.length) % LANG_ORDER.length];
  saveSettings();
}
function cycleDifficulty(dir) {
  const i = DIFF_LEVELS.indexOf(settings.difficulty);
  settings.difficulty = DIFF_LEVELS[(i + dir + DIFF_LEVELS.length) % DIFF_LEVELS.length];
  saveSettings();
}
let menuIndex = 0, menuReturnState = 'title', menuMoveLock = false;

function drawMenu() {
  drawBackground();
  ctx.fillStyle = '#000c'; ctx.fillRect(0, 0, W, H);
  const pw = 480, ph = 100 + menuItems.length * 44 + 44; // cresce com os itens
  const px = W / 2 - pw / 2, py = H / 2 - ph / 2;
  ctx.fillStyle = '#0d0d1acc'; ctx.fillRect(px, py, pw, ph);
  ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = 3; ctx.strokeRect(px, py, pw, ph);
  ctx.textAlign = 'center';
  ctx.font = 'bold 22px Courier New'; ctx.fillStyle = '#ffd23f';
  ctx.fillText(t('optTitle'), W / 2, py + 42);

  const rowY = py + 90, rowH = 44;
  for (let i = 0; i < menuItems.length; i++) {
    const item = menuItems[i];
    const y = rowY + i * rowH;
    const sel = i === menuIndex;
    if (sel) {
      ctx.fillStyle = '#ffd23f18'; ctx.fillRect(px + 14, y - 20, pw - 28, 32);
      ctx.font = 'bold 14px Courier New'; ctx.fillStyle = '#ffd23f'; ctx.textAlign = 'left';
      ctx.fillText('â–¶', px + 22, y);
    }
    ctx.font = `${sel ? 'bold ' : ''}13px Courier New`;
    ctx.fillStyle = sel ? '#fff' : '#999'; ctx.textAlign = 'left';
    ctx.fillText(t(item.k), px + 44, y);
    if (item.type === 'lang') {
      ctx.textAlign = 'right';
      ctx.fillStyle = '#88ccff';
      ctx.fillText(`â—„ ${LTX().name} â–º`, px + pw - 30, y);
    } else if (item.type === 'choice') {
      const d = diffCfg();
      ctx.textAlign = 'right';
      ctx.fillStyle = d.color;
      ctx.fillText(`â—„ ${t('diffNames')[settings.difficulty]} â–º`, px + pw - 30, y);
    } else if (item.type === 'toggle') {
      const on = settings[item.key];
      ctx.textAlign = 'right';
      ctx.fillStyle = on ? '#3e3' : '#e33';
      ctx.fillText(on ? t('on') : t('off'), px + pw - 30, y);
    } else if (item.type === 'slider') {
      const v = settings[item.key];
      const bx = px + pw - 200, bw = 130;
      ctx.fillStyle = '#333'; ctx.fillRect(bx, y - 10, bw, 12);
      ctx.fillStyle = sel ? '#ffd23f' : '#8844cc'; ctx.fillRect(bx, y - 10, bw * v, 12);
      ctx.strokeStyle = '#666'; ctx.lineWidth = 1; ctx.strokeRect(bx, y - 10, bw, 12);
      ctx.textAlign = 'right'; ctx.fillStyle = '#ccc';
      ctx.fillText(`${Math.round(v * 100)}%`, px + pw - 30, y);
    }
  }
  ctx.textAlign = 'center';
  ctx.font = '12px Courier New'; ctx.fillStyle = '#8888aa';
  ctx.fillText(t('menuHint'), W / 2, py + ph - 20);

  // navegaÃ§Ã£o
  const up = keys['arrowup'] || keys['w'], down = keys['arrowdown'] || keys['s'];
  const left = keys['arrowleft'] || keys['a'], right = keys['arrowright'] || keys['d'];
  if (!up && !down && !left && !right) menuMoveLock = false;
  if (!menuMoveLock) {
    if (up)   { menuIndex = (menuIndex + menuItems.length - 1) % menuItems.length; menuMoveLock = true; beep(440, 0.04); }
    if (down) { menuIndex = (menuIndex + 1) % menuItems.length; menuMoveLock = true; beep(440, 0.04); }
    const item = menuItems[menuIndex];
    if ((left || right) && item.type === 'slider') {
      settings[item.key] = Math.max(0, Math.min(1, settings[item.key] + (right ? 0.1 : -0.1)));
      settings[item.key] = Math.round(settings[item.key] * 10) / 10;
      menuMoveLock = true;
      saveSettings();
      if (item.key === 'sfxVol') beep(660, 0.08); // teste do volume
    }
    if ((left || right) && item.type === 'toggle') {
      settings[item.key] = !settings[item.key];
      menuMoveLock = true;
      saveSettings();
      beep(settings[item.key] ? 784 : 330, 0.07);
    }
    if ((left || right) && item.type === 'choice') {
      cycleDifficulty(right ? 1 : -1);
      menuMoveLock = true;
      beep(600, 0.07);
    }
    if ((left || right) && item.type === 'lang') {
      cycleLang(right ? 1 : -1);
      menuMoveLock = true;
      beep(700, 0.07);
    }
  }
  if (enterPressed) {
    const item = menuItems[menuIndex];
    if (item.type === 'close') { gameState = menuReturnState; beep(550, 0.07); }
    else if (item.type === 'toggle') { settings[item.key] = !settings[item.key]; saveSettings(); beep(settings[item.key] ? 784 : 330, 0.07); }
    else if (item.type === 'choice') { cycleDifficulty(1); beep(600, 0.07); }
    else if (item.type === 'lang') { cycleLang(1); beep(700, 0.07); }
  }
  if (escPressed) gameState = menuReturnState;
}

function drawGameOver() {
  ctx.fillStyle = '#000c'; ctx.fillRect(0, 0, W, H);
  ctx.textAlign = 'center';
  ctx.font = 'bold 44px Courier New'; ctx.fillStyle = '#e33';
  ctx.fillText(t('gameOver'), W / 2, 220);
  ctx.font = '15px Courier New'; ctx.fillStyle = '#fff';
  ctx.fillText(t('goQuote'), W / 2, 270);
  ctx.fillText(`SCORE: ${player.score}`, W / 2, 310);
  ctx.font = 'bold 16px Courier New'; ctx.fillStyle = '#ffd23f';
  if (Math.floor(time * 2) % 2 === 0) ctx.fillText(t('goRestart'), W / 2, 370);
}

const SPLASH_TOTAL = 4.5; // segundos do letreiro da fase
function drawPhaseSplash() {
  // faixa com o nome da fase, na parte de cima da tela
  if (phaseSplashT <= 0) return;
  phaseSplashT = Math.max(0, phaseSplashT - dt);
  const elapsed = SPLASH_TOTAL - phaseSplashT;
  let a = 1;
  if (elapsed < 0.4) a = elapsed / 0.4;                 // entra suave
  else if (phaseSplashT < 0.7) a = phaseSplashT / 0.7;  // sai suave
  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(1, a)); // clamp: sem pisca no finzinho
  const top = 58;
  // a caixa se ajusta ao texto (tÃ­tulos longos encolhem a fonte se preciso)
  const sTitle = phT(currentPhase), sPlace = phP(currentPhase);
  let titleFont = 28;
  ctx.font = `bold ${titleFont}px Courier New`;
  while (titleFont > 16 && ctx.measureText(sTitle).width > W - 120) {
    titleFont -= 2;
    ctx.font = `bold ${titleFont}px Courier New`;
  }
  const wTitle = ctx.measureText(sTitle).width;
  ctx.font = '15px Courier New';
  const wPlace = ctx.measureText(sPlace).width;
  const boxW = Math.min(W - 40, Math.max(wTitle, wPlace) + 70);
  ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 12; ctx.shadowOffsetY = 4;
  ctx.fillStyle = 'rgba(8,8,18,0.85)';
  rr(W / 2 - boxW / 2, top, boxW, 84, 14); ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = 2;
  rr(W / 2 - boxW / 2, top, boxW, 84, 14); ctx.stroke();
  ctx.font = `bold ${titleFont}px Courier New`; ctx.fillStyle = '#ffd23f'; ctx.textAlign = 'center';
  ctx.fillText(sTitle, W / 2, top + 38);
  ctx.font = '15px Courier New'; ctx.fillStyle = '#fff';
  ctx.fillText(sPlace, W / 2, top + 66);
  ctx.restore();
}
let phaseSplashT = 0;

// ---- Loop principal ----
function frame(ts) {
  dt = Math.min(0.05, (ts - lastTs) / 1000 || 0.016);
  lastTs = ts;
  time += dt;

  ctx.save();
  if (shake > 0) {
    shake = Math.max(0, shake - dt);
    ctx.translate((Math.random() - 0.5) * shake * 30, (Math.random() - 0.5) * shake * 30);
  }

  // trilha sonora acompanha o estado do jogo
  if (music.started) {
    // chefÃ£o vivo em cena = MÃšSICA DO MAL (na fase final, a prÃ³pria trilha jÃ¡ Ã© o clÃ­max)
    const bossAtivo = !currentPhase.finalPhase &&
      (gameState === 'bossdialog' || (gameState === 'play' && enemies.some(e => e.isBoss && !e.dead)));
    const desired =
      gameState === 'title' || gameState === 'story' || gameState === 'ending' ? 'abertura'
      : gameState === 'select' || gameState === 'menu' || gameState === 'map' || gameState === 'worldmap' ? 'menu'
      : gameState === 'victory' ? 'vitoria'
      : gameState === 'gameover' ? 'gameover'
      : bossAtivo ? 'boss'
      : (PHASE_MUSIC[currentPhase.id] || 'saopaulo');
    setTrack(desired);
  }

  // tecla T consulta o mapa do plano durante o jogo e no mapa-mÃºndi
  if (tPressed) {
    if (gameState === 'play') { mapNext = 'play'; mapT = 0; gameState = 'map'; beep(660, 0.07); }
    else if (gameState === 'worldmap') { mapNext = 'world'; mapT = 0; gameState = 'map'; beep(660, 0.07); }
    else if (gameState === 'map' && (mapNext === 'play' || mapNext === 'world')) {
      gameState = mapNext === 'play' ? 'play' : 'worldmap';
    }
    tPressed = false;
  }
  // tecla P abre/fecha o menu de opÃ§Ãµes em qualquer tela
  if (pPressed) {
    if (gameState === 'menu') gameState = menuReturnState;
    else { menuReturnState = gameState; gameState = 'menu'; menuIndex = 0; beep(550, 0.07); }
    pPressed = false;
  }

  if (gameState === 'menu') {
    drawMenu();
  }
  else if (gameState === 'title') {
    drawTitle();
    if (enterPressed) { gameState = 'story'; storyIndex = 0; storyChars = 0; beep(660, 0.1); }
  }
  else if (gameState === 'story') {
    drawStory(STORY_SLIDES);
    if (escPressed) { gameState = 'select'; beep(550, 0.08); }
    else if (enterPressed) {
      const txt = slideText(STORY_SLIDES, storyIndex);
      if (storyChars < txt.length) storyChars = txt.length; // 1Âº toque completa o texto
      else {
        storyIndex++;
        storyChars = 0;
        beep(440, 0.05);
        if (storyIndex >= STORY_SLIDES.length) { gameState = 'select'; }
      }
    }
  }
  else if (gameState === 'ending') {
    drawStory(ENDING_SLIDES);
    const goTitle = () => { loadPhase(0, false); gameState = 'title'; };
    if (escPressed) goTitle();
    else if (enterPressed) {
      const txt = slideText(ENDING_SLIDES, storyIndex);
      if (storyChars < txt.length) storyChars = txt.length;
      else {
        storyIndex++;
        storyChars = 0;
        beep(440, 0.05);
        if (storyIndex >= ENDING_SLIDES.length) goTitle();
      }
    }
  }
  else if (gameState === 'select') {
    drawSelect();
    if (enterPressed) {
      // jogo novo: zera o plano e as missÃµes da campanha
      for (const k in conquests) conquests[k] = false;
      phasesDone.clear();
      siliconCoins.clear();
      worldSel = 0;
      player = new Player(HERO_ORDER[selectedHero]);
      loadPhase(0, false);
      gameState = 'intro';
      beep(784, 0.12);
    }
  }
  else if (gameState === 'intro') {
    drawBackground();
    player.draw();
    companion.update(false);
    companion.draw();
    drawDialogBox(dlg('intro'));
    if (escPressed) { gameState = 'play'; dialogIndex = 0; phaseSplashT = SPLASH_TOTAL; beep(550, 0.08); }
    else if (enterPressed) {
      dialogIndex++;
      beep(440, 0.05);
      if (dialogIndex >= dlg('intro').length) { gameState = 'play'; dialogIndex = 0; phaseSplashT = SPLASH_TOTAL; }
    }
  }
  else if (gameState === 'play') {
    if (currentPhase.finalPhase) {
      camX = 0; // arena fixa do lab
      // linha do tempo do boss rush, atrelada ao treino
      // Manuscrito da Litografia: treino 30% mais rÃ¡pido!
      treino += dt * (conquests.litografia ? 1.3 : 1);
      const prog = treino / TRAIN_TIME;
      for (const r of finalRush) {
        if (!r.spawned && prog >= r.at) {
          r.spawned = true;
          const pack = r.make();
          for (const e of pack) e.facing = Math.sign(player.x - e.x) || -1;
          enemies.push(...pack);
          if (r.bossDialog) { gameState = 'bossdialog'; dialogIndex = 0; sfx.boss(); }
        }
      }
      const q = Math.floor(prog * 4);
      if (q > treinoQuarter && q < 4) { treinoQuarter = q; curupiraHelp(); }
      if (treino >= TRAIN_TIME && !awaken) {
        awaken = true;
        spawnText(W / 2, H / 2 - 60, TR('curupiraOnline') || 'âš¡ CURUPIRA-1 ONLINE âš¡', '#66ff88', 2);
        for (const e of enemies) if (!e.dead) e.takeHit(999, 1, true); // o despertar varre o lab
        projectiles = []; popups = [];
        shake = 0.6; playFanfare(); sfx.special();
      }
      if (awaken) {
        awakenT += dt;
        if (awakenT > 2.2) { gameState = 'victory'; dialogIndex = 0; }
      }
    } else {
      const targetCam = Math.max(camX, Math.min(player.x - W * 0.35, currentPhase.stageLen - W));
      camX = currentLock !== null ? camX : targetCam;
    }

    updateWaves();
    if (gameState === 'play') { // updateWaves pode ter mudado pra bossdialog
      player.update();
      companion.update(true);
      for (const e of enemies) e.update();
      enemies = enemies.filter(e => !e.removeMe);
      updateProjectiles();
      updateDrops();
      updateFloatTexts();
      for (const a of allies) a.update();
      allies = allies.filter(a => !a.removeMe);
      saci.update(); // ðŸŒª SACI-BOT luta junto (conquista dos Roboticistas)
    }

    drawBackground();
    if (currentPhase.finalPhase) { drawCurupiraMachine(); drawDeepZeekCamarote(); }
    const all = [...enemies, ...allies, player].sort((a, b) => a.gy - b.gy);
    drawDrops();
    updateDrawCoin();
    for (const ent of all) ent.draw();
    companion.draw();
    saci.draw();
    drawProjectiles();
    updateDrawImpacts();
    drawFloatTexts();
    drawHUD();
    if (currentPhase.finalPhase) drawTrainBar();
    updateDrawPopups(); // pop-ups cobrem atÃ© o HUD (feature, nÃ£o bug)
    drawPhaseSplash();

    if (!currentPhase.finalPhase && bossDefeated && enemies.every(e => e.dead || e.removeMe)) {
      gameState = 'victory'; dialogIndex = 0;
      projectiles = [];
      playFanfare(); // ðŸŽº chefÃ£o no chÃ£o!
      sfx.special();
    }
  }
  else if (gameState === 'bossdialog') {
    drawBackground();
    const all = [...enemies, player].sort((a, b) => a.gy - b.gy);
    drawDrops();
    for (const ent of all) ent.draw();
    companion.update(false);
    companion.draw();
    drawDialogBox(dlg('bossDialog'));
    if (escPressed) { gameState = 'play'; dialogIndex = 0; }
    else if (enterPressed) {
      dialogIndex++;
      beep(440, 0.05);
      if (dialogIndex >= dlg('bossDialog').length) { gameState = 'play'; dialogIndex = 0; }
    }
  }
  else if (gameState === 'victory') {
    drawBackground();
    if (currentPhase.finalPhase) player.facing = 1; // encara o recÃ©m-nascido
    player.draw();
    companion.update(false);
    companion.draw();
    if (currentPhase.finalPhase) {
      // o CURUPIRA-1 recÃ©m-nascido, EM CENA, de frente pro herÃ³i
      const cx = player.screenX + 140, cgy = player.gy;
      const glow = ctx.createRadialGradient(cx, cgy - 70, 10, cx, cgy - 70, 110);
      glow.addColorStop(0, `rgba(102,255,136,${0.35 + Math.sin(time * 3) * 0.12})`);
      glow.addColorStop(1, 'rgba(102,255,136,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(cx - 120, cgy - 190, 240, 240);
      ctx.save();
      ctx.globalAlpha = 0.3; ctx.fillStyle = '#000';
      ctx.beginPath(); ctx.ellipse(cx, cgy + 4, 24, 7, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      const frames = getAnim('curupira', 'idle');
      if (frames) {
        const img = frames[Math.floor(time * 6) % frames.length];
        const s = SCALE * 1.25;
        const hop = Math.abs(Math.sin(time * 4)) * 6; // pulinho de bebÃª animado
        ctx.save();
        ctx.translate(cx, cgy - hop);
        ctx.scale(-1, 1); // desenhado pra direita â†’ vira pro herÃ³i
        ctx.drawImage(img, -ANCHOR_X * s, -ANCHOR_Y * s, CELL * s, CELL * s);
        ctx.restore();
      } else {
        ctx.font = '52px serif'; ctx.textAlign = 'center';
        ctx.fillText('ðŸ¤–', cx, cgy - 30 - Math.abs(Math.sin(time * 4)) * 6);
      }
    } else {
      const iconX = player.screenX + 70, iconY = player.screenY - 40 + Math.sin(time * 3) * 5;
      ctx.font = '30px serif'; ctx.textAlign = 'center';
      ctx.fillText(phaseIndex === 0 ? 'ðŸ§ ' : 'âš¡', iconX, iconY);
      ctx.fillStyle = `rgba(255, 210, 63, ${0.3 + Math.sin(time * 4) * 0.2})`;
      ctx.beginPath(); ctx.arc(iconX, iconY - 10, 30, 0, 7); ctx.fill();
    }
    drawDialogBox(dlg('victory'));
    const finishVictory = () => {
      const before = { ...conquests };
      currentPhase.onVictory();
      phasesDone.add(currentPhase.id);
      lastAcquired = PLAN_ITEMS.filter(i => conquests[i.key] && !before[i.key]).map(i => i.key);
      mapNext = currentPhase.finalPhase ? -1 : 'world'; // plano â†’ mapa-mÃºndi
      mapT = 0;
      gameState = 'map'; // mostra o plano se completando antes de voltar ao mundo
      sfx.pickup();
    };
    if (escPressed) finishVictory();
    else if (enterPressed) {
      dialogIndex++;
      beep(440, 0.05);
      if (dialogIndex >= dlg('victory').length) finishVictory();
    }
  }
  else if (gameState === 'map') {
    drawMap();
    if (enterPressed || escPressed) {
      lastAcquired = [];
      if (mapNext === 'play') { gameState = 'play'; }        // sÃ³ estava consultando (tecla T)
      else if (mapNext === 'world') { gameState = 'worldmap'; }
      else if (mapNext === -1) { gameState = 'ending'; storyIndex = 0; storyChars = 0; } // cutscene final!
      else { loadPhase(mapNext, true); gameState = 'intro'; }
      beep(550, 0.07);
    }
  }
  else if (gameState === 'worldmap') {
    drawWorldMap();
    if (enterPressed) {
      const spot = WORLD_SPOTS[worldSel];
      const coinPending = PHASES[spot.phase] && PHASES[spot.phase].coin && !siliconCoins.has(spot.phase);
      if (phasesDone.has(spot.phase) && !spot.final && !coinPending) {
        beep(150, 0.15, 'sawtooth'); // jÃ¡ concluÃ­da, nÃ£o repete
      } else if (spot.final && !worldAllDone()) {
        worldLockedMsg = 2;
        beep(150, 0.2, 'sawtooth'); // trancado!
      } else {
        loadPhase(spot.phase, true);
        gameState = 'intro';
        beep(784, 0.12);
      }
    }
  }
  else if (gameState === 'gameover') {
    drawGameOver();
    if (enterPressed) {
      loadPhase(phaseIndex, false);
      player = new Player(HERO_ORDER[selectedHero]);
      gameState = 'intro';
    }
  }

  ctx.restore();
  enterPressed = false;
  attackPressed = false;
  escPressed = false;
  pPressed = false;
  tPressed = false;
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
