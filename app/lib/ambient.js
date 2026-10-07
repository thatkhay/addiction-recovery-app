// lib/ambient.js
// Calming soundscapes synthesised with the Web Audio API: no files, works offline.
import { useSyncExternalStore } from "react";

export const SOUNDS = [
  { id: "rain", label: "Rain" },
  { id: "ocean", label: "Ocean" },
  { id: "wind", label: "Wind" },
  { id: "fire", label: "Campfire" },
  { id: "brown", label: "Deep focus" },
];

let ctx = null;
let current = null; // { id, stop }
let state = { playing: null, volume: 0.6 };
const listeners = new Set();
const SERVER = { playing: null, volume: 0.6 };

function emit(next) {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
}

export function useAmbient() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state,
    () => SERVER
  );
}

function noiseBuffer(kind, seconds = 6) {
  const length = ctx.sampleRate * seconds;
  const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    let last = 0;
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      if (kind === "brown") {
        last = (last + 0.02 * white) / 1.02;
        data[i] = last * 3.5;
      } else if (kind === "pink") {
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.969 * b2 + white * 0.153852;
        b3 = 0.8665 * b3 + white * 0.3104856;
        b4 = 0.55 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.016898;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      } else {
        data[i] = white;
      }
    }
  }
  return buffer;
}

function loop(buffer) {
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  src.loop = true;
  src.start();
  return src;
}

function lfo(freq, depth, target) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.frequency.value = freq;
  gain.gain.value = depth;
  osc.connect(gain).connect(target);
  osc.start();
  return osc;
}

function build(id, out) {
  const nodes = [];
  const timers = [];
  const filter = (type, freq, q = 0.7) => {
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    f.Q.value = q;
    return f;
  };

  if (id === "brown") {
    const src = loop(noiseBuffer("brown"));
    const lp = filter("lowpass", 900);
    src.connect(lp).connect(out);
    nodes.push(src);
  }

  if (id === "rain") {
    const src = loop(noiseBuffer("pink"));
    const hp = filter("highpass", 400);
    const lp = filter("lowpass", 7000);
    src.connect(hp).connect(lp).connect(out);
    nodes.push(src);
    // Occasional heavier drops.
    const drops = loop(noiseBuffer("white", 2));
    const bp = filter("bandpass", 2500, 1.5);
    const dropGain = ctx.createGain();
    dropGain.gain.value = 0;
    drops.connect(bp).connect(dropGain).connect(out);
    nodes.push(drops);
    const tick = () => {
      const t = ctx.currentTime;
      dropGain.gain.setValueAtTime(0.25 + Math.random() * 0.3, t);
      dropGain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
      timers.push(setTimeout(tick, 60 + Math.random() * 400));
    };
    tick();
  }

  if (id === "ocean") {
    const src = loop(noiseBuffer("brown"));
    const lp = filter("lowpass", 600);
    const swell = ctx.createGain();
    swell.gain.value = 0.55;
    src.connect(lp).connect(swell).connect(out);
    nodes.push(src, lfo(0.09, 0.45, swell.gain), lfo(0.09, 400, lp.frequency));
  }

  if (id === "wind") {
    const src = loop(noiseBuffer("pink"));
    const bp = filter("bandpass", 500, 0.9);
    src.connect(bp).connect(out);
    nodes.push(src, lfo(0.07, 300, bp.frequency), lfo(0.13, 120, bp.frequency));
  }

  if (id === "fire") {
    const src = loop(noiseBuffer("brown"));
    const lp = filter("lowpass", 500);
    const base = ctx.createGain();
    base.gain.value = 0.7;
    src.connect(lp).connect(base).connect(out);
    nodes.push(src);
    const crackle = loop(noiseBuffer("white", 2));
    const hp = filter("highpass", 1800);
    const pop = ctx.createGain();
    pop.gain.value = 0;
    crackle.connect(hp).connect(pop).connect(out);
    nodes.push(crackle);
    const tick = () => {
      const t = ctx.currentTime;
      pop.gain.setValueAtTime(0.2 + Math.random() * 0.6, t);
      pop.gain.exponentialRampToValueAtTime(0.001, t + 0.02 + Math.random() * 0.04);
      timers.push(setTimeout(tick, 80 + Math.random() * 700));
    };
    tick();
  }

  return () => {
    timers.forEach(clearTimeout);
    nodes.forEach((n) => {
      try {
        n.stop();
      } catch {
        // already stopped
      }
    });
  };
}

export function stopAmbient() {
  if (!current) return;
  const { out, stop } = current;
  const t = ctx.currentTime;
  out.gain.cancelScheduledValues(t);
  out.gain.setValueAtTime(out.gain.value, t);
  out.gain.linearRampToValueAtTime(0, t + 0.6);
  setTimeout(stop, 700);
  current = null;
  emit({ playing: null });
}

export function playAmbient(id) {
  if (state.playing === id) return stopAmbient();
  if (current) stopAmbient();
  ctx ??= new (window.AudioContext || window.webkitAudioContext)();
  ctx.resume();
  const out = ctx.createGain();
  out.gain.value = 0;
  out.connect(ctx.destination);
  const stop = build(id, out);
  out.gain.linearRampToValueAtTime(state.volume, ctx.currentTime + 1.2);
  current = { id, out, stop: () => (stop(), out.disconnect()) };
  emit({ playing: id });
}

export function setAmbientVolume(volume) {
  if (current) current.out.gain.setTargetAtTime(volume, ctx.currentTime, 0.1);
  emit({ volume });
}
