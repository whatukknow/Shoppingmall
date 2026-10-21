'use client';

import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react';

const subscribe = (listener: () => void) => {
  window.addEventListener('taste-sound', listener);
  window.addEventListener('storage', listener);
  return () => { window.removeEventListener('taste-sound', listener); window.removeEventListener('storage', listener); };
};
const getSound = () => { try { return localStorage.getItem('lp-snd') !== '0'; } catch { return true; } };

export function useBoing() {
  const enabled = useSyncExternalStore(subscribe, getSound, () => true);
  const context = useRef<AudioContext | null>(null);
  useEffect(() => () => { void context.current?.close(); }, []);
  /* 모바일(iOS·안드로이드)은 '사용자 터치 순간'에 오디오를 깨워야 소리가 남 */
  const unlock = useCallback(() => {
    try {
      const audioNavigator = navigator as Navigator & { audioSession?: { type: string } };
      if (audioNavigator.audioSession) audioNavigator.audioSession.type = 'playback';
      const audioWindow = window as Window & { webkitAudioContext?: typeof AudioContext };
      const Audio = window.AudioContext ?? audioWindow.webkitAudioContext;
      if (!Audio) return;
      context.current ??= new Audio();
      if (context.current.state !== 'running') void context.current.resume();
      const buffer = context.current.createBuffer(1, 1, 22050);
      const source = context.current.createBufferSource();
      source.buffer = buffer;
      source.connect(context.current.destination);
      source.start(0);
    } catch { /* Audio may be unavailable. */ }
  }, []);
  useEffect(() => {
    const events = ['touchstart', 'touchend', 'pointerdown', 'click', 'keydown'];
    events.forEach((event) => document.addEventListener(event, unlock, { passive: true, capture: true }));
    return () => events.forEach((event) => document.removeEventListener(event, unlock, true));
  }, [unlock]);
  const boing = (index: number) => {
    if (!getSound()) return;
    unlock();
    const ctx = context.current;
    if (!ctx) return;
    const t = ctx.currentTime, base = 330 * Math.pow(1.122, index);
    const o = ctx.createOscillator(), o2 = ctx.createOscillator(), gain = ctx.createGain(), lfo = ctx.createOscillator(), modulation = ctx.createGain();
    o.type = 'triangle'; o2.type = 'sine';
    o.frequency.setValueAtTime(base * .55, t); o.frequency.exponentialRampToValueAtTime(base * 1.6, t + .07); o.frequency.exponentialRampToValueAtTime(base, t + .34);
    o2.frequency.setValueAtTime(base * 1.1, t); o2.frequency.exponentialRampToValueAtTime(base * 3.2, t + .07); o2.frequency.exponentialRampToValueAtTime(base * 2, t + .34);
    lfo.frequency.setValueAtTime(22, t); modulation.gain.setValueAtTime(base * .08, t); modulation.gain.exponentialRampToValueAtTime(.01, t + .4);
    lfo.connect(modulation); modulation.connect(o.frequency); modulation.connect(o2.frequency);
    gain.gain.setValueAtTime(.0001, t); gain.gain.exponentialRampToValueAtTime(.32, t + .012); gain.gain.exponentialRampToValueAtTime(.0001, t + .42);
    const overtone = ctx.createGain(); overtone.gain.value = .35;
    o.connect(gain); o2.connect(overtone); overtone.connect(gain); gain.connect(ctx.destination);
    [o, o2, lfo].forEach((node) => { node.start(t); node.stop(t + .45); });
  };
  const toggle = () => {
    try { localStorage.setItem('lp-snd', getSound() ? '0' : '1'); window.dispatchEvent(new Event('taste-sound')); } catch { /* Keep the available sound setting. */ }
    if (getSound()) boing(0);
  };
  return { enabled, unlock, boing, toggle };
}
