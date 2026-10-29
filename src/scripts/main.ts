import Lenis from 'lenis';

const root = document.documentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(pointer: fine)').matches;

/* ---------- Smooth scroll ---------- */

let lenis: Lenis | null = null;
if (!reduce) {
  lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 0.95 });
  const raf = (t: number) => {
    lenis!.raf(t);
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);
}

/* ---------- Sound ----------
   Placeholder ambience made with the Web Audio API.
   TODO: replace with Avijeet's own track — drop an mp3 at /public/audio/signature.mp3
   and set USE_FILE to true. */

const USE_FILE = false;
const SOUND_KEY = 'as-sound';

const Sound = (() => {
  let ctx: AudioContext | null = null;
  let master: GainNode | null = null;
  let audioEl: HTMLAudioElement | null = null;
  let on = false;

  function build() {
    if (USE_FILE) {
      audioEl = new Audio('/audio/signature.mp3');
      audioEl.loop = true;
      audioEl.volume = 0;
      return;
    }
    ctx = new AudioContext();
    master = ctx.createGain();
    master.gain.value = 0;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 820;
    filter.Q.value = 0.6;
    filter.connect(master);
    master.connect(ctx.destination);
    // A soft, slowly breathing chord
    [110, 164.81, 220, 277.18, 329.63].forEach((f, i) => {
      const o = ctx!.createOscillator();
      o.type = i % 2 ? 'triangle' : 'sine';
      o.frequency.value = f;
      o.detune.value = (i - 2) * 4;
      const g = ctx!.createGain();
      g.gain.value = 0.16 / (i + 1);
      const lfo = ctx!.createOscillator();
      lfo.frequency.value = 0.04 + i * 0.027;
      const lg = ctx!.createGain();
      lg.gain.value = 0.07 / (i + 1);
      lfo.connect(lg).connect(g.gain);
      lfo.start();
      o.connect(g).connect(filter);
      o.start();
    });
  }

  function update() {
    document.querySelectorAll<HTMLButtonElement>('[data-sound]').forEach((b) => {
      b.setAttribute('aria-pressed', String(on));
      const l = b.querySelector('[data-sound-label]');
      if (l) l.textContent = on ? 'Sound on' : 'Sound off';
    });
    root.classList.toggle('sound-on', on);
  }

  function set(v: boolean) {
    on = v;
    try { localStorage.setItem(SOUND_KEY, v ? '1' : '0'); } catch {}
    if (v) {
      if (!ctx && !audioEl) build();
      if (audioEl) {
        audioEl.play().catch(() => {});
        fadeEl(audioEl, 0.5);
      } else if (ctx && master) {
        ctx.resume();
        master.gain.cancelScheduledValues(ctx.currentTime);
        master.gain.setTargetAtTime(0.4, ctx.currentTime, 0.9);
      }
    } else {
      if (audioEl) fadeEl(audioEl, 0, () => audioEl!.pause());
      else if (ctx && master) master.gain.setTargetAtTime(0, ctx.currentTime, 0.25);
    }
    update();
  }

  function fadeEl(el: HTMLAudioElement, to: number, done?: () => void) {
    const from = el.volume;
    const t0 = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / 900);
      el.volume = from + (to - from) * p;
      if (p < 1) requestAnimationFrame(step);
      else done?.();
    };
    requestAnimationFrame(step);
  }

  function wanted() {
    try { return localStorage.getItem(SOUND_KEY) === '1'; } catch { return false; }
  }

  return { set, toggle: () => set(!on), wanted, update };
})();

document.querySelectorAll('[data-sound]').forEach((b) => b.addEventListener('click', () => Sound.toggle()));

// Browsers only allow audio after a gesture, so resume on the first interaction
if (Sound.wanted()) {
  Sound.update();
  const resume = () => {
    Sound.set(true);
    removeEventListener('pointerdown', resume);
    removeEventListener('keydown', resume);
  };
  addEventListener('pointerdown', resume);
  addEventListener('keydown', resume);
}

/* ---------- Intro (home, once per visit) ---------- */

const intro = document.querySelector<HTMLElement>('[data-intro]');
if (intro) {
  let seen = false;
  try { seen = sessionStorage.getItem('as-intro') === '1'; } catch {}
  if (!seen) {
    intro.hidden = false;
    root.classList.add('intro-open');
    lenis?.stop();
    const count = intro.querySelector<HTMLElement>('[data-intro-count]')!;
    const dur = reduce ? 0 : 1500;
    const t0 = performance.now();
    const step = (t: number) => {
      const p = dur ? Math.min(1, (t - t0) / dur) : 1;
      const eased = 1 - Math.pow(1 - p, 3);
      count.textContent = String(Math.round(eased * 100));
      if (p < 1) requestAnimationFrame(step);
      else {
        intro.classList.add('is-ready');
        intro.querySelector<HTMLButtonElement>('[data-enter="sound"]')?.focus({ preventScroll: true });
      }
    };
    requestAnimationFrame(step);

    const leave = (withSound: boolean) => {
      try { sessionStorage.setItem('as-intro', '1'); } catch {}
      if (withSound) Sound.set(true);
      intro.classList.add('is-leaving');
      root.classList.remove('intro-open');
      lenis?.start();
      setTimeout(() => { intro.hidden = true; }, reduce ? 0 : 950);
    };
    intro.querySelectorAll<HTMLButtonElement>('[data-enter]').forEach((b) =>
      b.addEventListener('click', () => leave(b.dataset.enter === 'sound')),
    );
    addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !intro.hidden) leave(false);
    });
  }
}

/* ---------- Cursor ---------- */

const cursor = document.querySelector<HTMLElement>('.cursor');
if (cursor && fine) {
  root.classList.add('has-cursor');
  const tag = cursor.querySelector<HTMLElement>('[data-cursor-tag]')!;
  let x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y;
  addEventListener('pointermove', (e) => {
    tx = e.clientX;
    ty = e.clientY;
    cursor.classList.add('is-visible');
  }, { passive: true });
  document.addEventListener('pointerleave', () => cursor.classList.remove('is-visible'));
  addEventListener('blur', () => cursor.classList.remove('is-visible'));
  const loop = () => {
    x += (tx - x) * (reduce ? 1 : 0.4);
    y += (ty - y) * (reduce ? 1 : 0.4);
    cursor.style.transform = `translate3d(${x - 2}px, ${y - 2}px, 0)`;
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
  addEventListener('pointerover', (e) => {
    const t = (e.target as Element).closest?.('[data-cursor], a, button, label, input');
    const label = t?.getAttribute('data-cursor') ?? (t?.tagName === 'A' ? 'Open' : '');
    cursor.classList.toggle('is-active', !!t);
    cursor.classList.toggle('has-tag', !!label);
    if (label) tag.textContent = label;
  });
}

/* ---------- Tint: the page takes on a project's colour ---------- */

const baseTint = document.body.dataset.accent;
function tint(c?: string) {
  if (!c) return;
  root.style.setProperty('--tint', c);
  root.classList.add('is-tinted');
}
function untint() {
  if (baseTint) root.style.setProperty('--tint', baseTint);
  else {
    root.style.removeProperty('--tint');
    root.classList.remove('is-tinted');
  }
}

/* ---------- Peel lens on project cards ---------- */

document.querySelectorAll<HTMLElement>('[data-peel]').forEach((el) => {
  const media = el.querySelector<HTMLElement>('[data-peel-media]') ?? el;
  el.addEventListener('pointermove', (e) => {
    const r = media.getBoundingClientRect();
    media.style.setProperty('--mx', `${e.clientX - r.left}px`);
    media.style.setProperty('--my', `${e.clientY - r.top}px`);
  });
  el.addEventListener('pointerenter', (e) => {
    if (e.pointerType !== 'touch') el.classList.add('is-peeling');
    tint(el.dataset.accent);
  });
  el.addEventListener('pointerleave', () => {
    el.classList.remove('is-peeling');
    untint();
  });
  el.addEventListener('focus', () => tint(el.dataset.accent));
  el.addEventListener('blur', untint);
});

/* ---------- Layered name follows the pointer ---------- */

const layerName = document.querySelector<HTMLElement>('[data-layer-name]');
if (layerName && fine && !reduce) {
  addEventListener('pointermove', (e) => {
    const px = (e.clientX / innerWidth - 0.5) * 2;
    const py = (e.clientY / innerHeight - 0.5) * 2;
    layerName.style.setProperty('--px', px.toFixed(3));
    layerName.style.setProperty('--py', py.toFixed(3));
  }, { passive: true });
}

/* ---------- Horizontal work strip (home) ---------- */

const strip = document.querySelector<HTMLElement>('[data-strip]');
if (strip) {
  const track = strip.querySelector<HTMLElement>('[data-strip-track]')!;
  const ruler = strip.querySelector<HTMLElement>('[data-ruler]');
  const now = strip.querySelector<HTMLElement>('[data-strip-now]');
  const cards = [...track.querySelectorAll<HTMLElement>('.card')];
  const wide = matchMedia('(min-width: 900px)');
  let dist = 0;

  const update = () => {
    if (!wide.matches) return;
    const top = strip.getBoundingClientRect().top;
    const p = dist ? Math.min(1, Math.max(0, -top / dist)) : 0;
    const shift = -p * dist;
    track.style.transform = `translate3d(${shift}px, 0, 0)`;
    ruler?.style.setProperty('--shift', `${shift}px`);
    if (now) {
      const mid = innerWidth / 2;
      let best = cards[0];
      let bestD = Infinity;
      for (const c of cards) {
        const r = c.getBoundingClientRect();
        const d = Math.abs(r.left + r.width / 2 - mid);
        if (d < bestD) { bestD = d; best = c; }
      }
      const label = best?.dataset.title ?? '';
      if (now.textContent !== label) now.textContent = label;
    }
  };

  const measure = () => {
    if (!wide.matches) {
      strip.style.height = '';
      track.style.transform = '';
      return;
    }
    dist = Math.max(0, track.scrollWidth - innerWidth);
    strip.style.height = `${innerHeight + dist}px`;
    ruler?.style.setProperty('--ruler-w', `${track.scrollWidth + innerWidth}px`);
    update();
  };

  addEventListener('scroll', update, { passive: true });
  addEventListener('resize', measure);
  wide.addEventListener('change', measure);
  measure();
  document.fonts?.ready.then(measure);
}

/* ---------- Work index: layer toggles and view switch ---------- */

const filter = document.querySelector<HTMLElement>('[data-filter]');
if (filter) {
  const boxes = [...filter.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')];
  const items = [...document.querySelectorAll<HTMLElement>('[data-work] [data-disciplines]')];
  const empty = document.querySelector<HTMLElement>('[data-empty]');
  const counter = document.querySelector<HTMLElement>('[data-count]');

  const only = new URLSearchParams(location.search).get('layer');
  if (only && boxes.some((b) => b.value === only)) boxes.forEach((b) => (b.checked = b.value === only));

  const apply = () => {
    const on = new Set(boxes.filter((b) => b.checked).map((b) => b.value));
    let n = 0;
    items.forEach((it) => {
      const show = it.dataset.disciplines!.split(' ').some((d) => on.has(d));
      it.hidden = !show;
      if (show) n++;
    });
    if (empty) empty.hidden = n > 0;
    if (counter) counter.textContent = `${n} ${n === 1 ? 'project' : 'projects'} visible`;
  };
  boxes.forEach((b) => b.addEventListener('change', apply));
  apply();

  const work = document.querySelector<HTMLElement>('[data-work]');
  document.querySelectorAll<HTMLButtonElement>('[data-view]').forEach((btn) =>
    btn.addEventListener('click', () => {
      work?.setAttribute('data-mode', btn.dataset.view!);
      document.querySelectorAll('[data-view]').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    }),
  );
}

/* ---------- Peel slider (case studies) ---------- */

document.querySelectorAll<HTMLElement>('[data-peel-slider]').forEach((el) => {
  const input = el.querySelector<HTMLInputElement>('input[type="range"]')!;
  const set = () => el.style.setProperty('--p', input.value);
  input.addEventListener('input', set);
  set();
});

/* ---------- Mumbai clock ---------- */

const clock = document.querySelector<HTMLElement>('[data-clock]');
if (clock) {
  const fmt = new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true });
  const tick = () => { clock.textContent = `${fmt.format(new Date())} in Mumbai`; };
  tick();
  setInterval(tick, 30_000);
}
