/**
 * The drifting hexagons behind every page, copied from Studio
 * (src/chrome/DriftingHexes.jsx and the boot copy in its index.html).
 *
 * The logo's hexagon, many times over, in shades of magenta and cerulean: a
 * dozen of them, different sizes, overlapping, each moving slowly at its own
 * speed and angle. Quiet on purpose: each is laid down at a few percent, slow
 * enough (a few pixels a second, a turn every few minutes) that nothing seems
 * to move while you read. Fixed to the window, so the page scrolls over them;
 * the heroes sit on top.
 *
 * Held still when the device asks for less motion, and left out when it asks
 * for more contrast. Twenty frames a second, not sixty, as in Studio.
 */
(() => {
  /* The site's two colours in several shades each, alternating so the two mix
     (Studio draws its own purples). Magenta from the logo (#c44e9b), cerulean
     from Coach's (#007ba7), and the brighter versions the site uses on dark. */
  const TONES = ["#c44e9b", "#007ba7", "#dc77b9", "#4fa8dc", "#e26dbe", "#2a8fc4", "#a63d82", "#6cc8ee"];
  const COUNT = 12;
  const SIZE_MIN = 0.08, SIZE_MAX = 0.42;   // radius, as a share of the window's shorter side
  const SPEED_MIN = 3, SPEED_MAX = 12;      // pixels a second
  const TURN_MAX = 0.02;                    // radians a second, either way
  const ALPHA_MIN = 0.05, ALPHA_MAX = 0.12;
  const SHARE = 0.75;                       // the strength Studio's boot copy draws at

  const media = (q) => window.matchMedia?.(q);
  if (media("(prefers-contrast: more)")?.matches) return;
  const still = media("(prefers-reduced-motion: reduce)");

  const canvas = document.createElement("canvas");
  canvas.className = "hexes";
  canvas.setAttribute("aria-hidden", "true");
  document.body.prepend(canvas);
  const ctx = canvas.getContext("2d");

  const rand = (a, b) => a + Math.random() * (b - a);

  /* A hexagon of radius r around the origin, point up, its corners softened a
     tenth of the radius, as the mark's are (Studio's roundedPath). */
  function hexPath(r) {
    const pts = [];
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 180) * (60 * i - 90);
      pts.push([r * Math.cos(a), r * Math.sin(a)]);
    }
    const toward = (from, to, d) => {
      const dx = to[0] - from[0], dy = to[1] - from[1], len = Math.hypot(dx, dy) || 1;
      const k = Math.min(d, len / 2 - 0.001) / len;
      return [from[0] + dx * k, from[1] + dy * k];
    };
    const p = new Path2D();
    pts.forEach((here, i) => {
      const prev = pts[(i + 5) % 6], next = pts[(i + 1) % 6];
      const start = toward(here, prev, r * 0.1), end = toward(here, next, r * 0.1);
      if (i === 0) p.moveTo(...start); else p.lineTo(...start);
      p.quadraticCurveTo(here[0], here[1], end[0], end[1]);
    });
    p.closePath();
    return p;
  }

  let w = 0, h = 0, hexes = [], last = 0, frame = 0, wait = 0;

  const seed = () => {
    const side = Math.min(w, h) || 400;
    hexes = Array.from({ length: COUNT }, (_, i) => {
      const r = side * rand(SIZE_MIN, SIZE_MAX);
      const angle = rand(0, Math.PI * 2), speed = rand(SPEED_MIN, SPEED_MAX);
      return {
        r, path: hexPath(r),
        x: rand(-r * 0.5, w + r * 0.5), y: rand(-r * 0.5, h + r * 0.5),
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        turn: rand(-TURN_MAX, TURN_MAX), spin: rand(0, Math.PI / 3),
        tone: i % TONES.length, alpha: rand(ALPHA_MIN, ALPHA_MAX),
      };
    });
  };

  const draw = () => {
    ctx.clearRect(0, 0, w, h);
    for (const x of hexes) {
      ctx.save();
      ctx.translate(x.x, x.y);
      ctx.rotate(x.spin);
      ctx.globalAlpha = x.alpha * SHARE;
      ctx.fillStyle = TONES[x.tone];
      ctx.fill(x.path);
      ctx.restore();
    }
  };

  /* Off one edge and back in at the opposite one, fully out of sight both
     times, so a shape never visibly pops. */
  const step = (dt) => {
    for (const x of hexes) {
      x.x += x.vx * dt; x.y += x.vy * dt; x.spin += x.turn * dt;
      const m = x.r * 1.1;
      if (x.x < -m) x.x = w + m; else if (x.x > w + m) x.x = -m;
      if (x.y < -m) x.y = h + m; else if (x.y > h + m) x.y = -m;
    }
  };

  const tick = (now) => {
    /* Capped, so coming back to a tab left in the background doesn't jump every shape. */
    const dt = last ? Math.min(0.1, (now - last) / 1000) : 0;
    last = now;
    step(dt);
    draw();
    wait = setTimeout(() => { frame = requestAnimationFrame(tick); }, 45);
  };

  const start = () => {
    clearTimeout(wait);
    cancelAnimationFrame(frame);
    last = 0;
    if (still?.matches) draw();
    else frame = requestAnimationFrame(tick);
  };

  const size = () => {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const first = !w;
    w = window.innerWidth; h = window.innerHeight;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (first) seed();
    draw();
  };

  size();
  start();
  addEventListener("resize", size);
  still?.addEventListener?.("change", start);
})();
