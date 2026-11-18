// Party games: 2 to 4 people around one phone, one button each, no internet needed.
// Every game is a small object: press(i), update(dt, held), draw(c), result() -> winner index, -1 for a draw, or null while it's still going.

const TAU = Math.PI * 2;
const COLORS = ["#e85d8a", "#4f8fd6", "#3fae7a", "#e3a21a"], FACES = ["🐱", "🐻", "🐸", "🐥"], KEYS = ["m", "q", "z", "p"];
const rnd = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

const TXT = {
  ar: { title:"ألعاب القعدة", sub:"موبايل واحد في النص، وكل واحد ليه زرار. من غير نت.", free:"مجاني", players:"كام لاعب؟", start:"يلا نلعب", back:"رجوع", how:"إزاي تتلعب",
        solo:"ضد الكمبيوتر", level:"الكمبيوتر عامل إزاي؟", lv:["😌 سهل", "🙂 متوسط", "😈 صعب"], win:"كسب!", draw:"تعادل", again:"العبوا تاني", other:"لعبة تانية", quit:"تخرجوا من اللعبة؟", resume:"كمّلوا", leave:"اخرج", round:"الجولة", keys:"على الكمبيوتر: الزراير", first:"أول واحد يكسب", rounds:"جولات" },
  en: { title:"Party games", sub:"One phone in the middle, one button each. No internet needed.", free:"Free", players:"How many players?", start:"Let's play", back:"Back", how:"How to play",
        solo:"vs computer", level:"How good is the computer?", lv:["😌 Easy", "🙂 Medium", "😈 Hard"], win:"wins!", draw:"Draw", again:"Play again", other:"Another game", quit:"Leave the game?", resume:"Keep playing", leave:"Leave", round:"Round", keys:"On a computer: keys", first:"First to win", rounds:"rounds" },
};

/* where each player sits: 0 bottom, 1 top (across the table), 2 and 3 share the two ends when there are more */
function seatPos(i, n, w, h, m){
  if (n === 2) return i === 0 ? { x:w / 2, y:h - m } : { x:w / 2, y:m };
  if (n === 3 && i === 1) return { x:w / 2, y:m };
  return [{ x:w - m, y:h - m }, { x:m, y:m }, { x:m, y:h - m }, { x:w - m, y:m }][i];
}
const facing = (p, w, h) => Math.atan2(h / 2 - p.y, w / 2 - p.x);

function drawDisc(c, p, r, i, arrow = true){
  if (arrow){
    const ax = p.x + Math.cos(p.a) * r * 1.5, ay = p.y + Math.sin(p.a) * r * 1.5, s = r * .42;
    c.beginPath(); c.moveTo(ax, ay); c.lineTo(ax - Math.cos(p.a - .7) * s * 2, ay - Math.sin(p.a - .7) * s * 2); c.lineTo(ax - Math.cos(p.a + .7) * s * 2, ay - Math.sin(p.a + .7) * s * 2); c.closePath();
    c.fillStyle = COLORS[i]; c.fill();
  }
  c.beginPath(); c.arc(p.x, p.y, r, 0, TAU); c.fillStyle = COLORS[i]; c.fill();
  c.lineWidth = Math.max(1.5, r * .14); c.strokeStyle = "rgba(255,255,255,.9)"; c.stroke();
  c.font = `${r * 1.2}px system-ui, sans-serif`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(FACES[i], p.x, p.y + r * .08);
}
/* two discs that overlap are pushed apart; returns the unit direction from a to b, or null */
function separate(a, b, ra, rb){
  const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || .001, over = ra + rb - d;
  if (over <= 0) return null;
  const nx = dx / d, ny = dy / d; a.x -= nx * over / 2; a.y -= ny * over / 2; b.x += nx * over / 2; b.y += ny * over / 2;
  return { nx, ny };
}
const keepIn = (p, r, w, h) => { p.x = clamp(p.x, r, w - r); p.y = clamp(p.y, r, h - r); };
const lastAlive = ps => { const a = ps.filter(p => p.alive); return a.length > 1 ? null : a.length ? ps.indexOf(a[0]) : -1; };
const hearts = n => "♥".repeat(Math.max(0, n));

/* ---------- the computer player: each game has ai(i) that says whether its button should be down right now.
   It reacts a little late and aims a little off on purpose, so a person can beat it. ---------- */
const angDiff = (a, b) => { let d = (b - a) % TAU; if (d > Math.PI) d -= TAU; if (d < -Math.PI) d += TAU; return d; };
const aimed = (p, tx, ty, tol) => Math.abs(angDiff(p.a, Math.atan2(ty - p.y, tx - p.x))) < tol;
const nearest = (ps, i, ok = () => true) => { let best = null, bd = 1e9; ps.forEach((q, j) => { if (j === i || !q.alive || !ok(j)) return; const d = Math.hypot(q.x - ps[i].x, q.y - ps[i].y); if (d < bd){ bd = d; best = q; } }); return best; };

/* ---------- sumo: you spin on your own, a tap dashes you forward ---------- */
function sumo({ n, w, h, u, col, fx }){
  const cx = w / 2, cy = h / 2, r = 7 * u; let R = Math.min(w, h) * .46, time = 0;
  const ps = Array.from({ length:n }, (_, i) => { const s = seatPos(i, n, w, h, 0), ang = Math.atan2(s.y - cy, s.x - cx);
    return { x:cx + Math.cos(ang) * R * .58, y:cy + Math.sin(ang) * R * .58, a:ang + Math.PI, vx:0, vy:0, cd:0, spin:i % 2 ? -3 : 3, alive:true }; });
  return {
    press(i){ const p = ps[i]; if (!p.alive || p.cd > 0) return; p.vx = Math.cos(p.a) * 64 * u; p.vy = Math.sin(p.a) * 64 * u; p.cd = .28; fx("tap"); }, // the dash replaces whatever slide was left, so you always go where your arrow points
    update(dt){
      time += dt; if (time > 16) R = Math.max(r * 2.4, R - 1.4 * u * dt); // the ring closes in so nobody can just wait
      for (const p of ps){ if (!p.alive) continue; p.a += p.spin * dt; p.cd -= dt; p.x += p.vx * dt; p.y += p.vy * dt; const f = Math.exp(-3.4 * dt); p.vx *= f; p.vy *= f; }
      for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++){ const a = ps[i], b = ps[j]; if (!a.alive || !b.alive) continue;
        const s = separate(a, b, r, r); if (!s) continue;
        const vn = (a.vx - b.vx) * s.nx + (a.vy - b.vy) * s.ny; if (vn > 0){ if (vn > 20 * u) fx("hit"); a.vx -= vn * s.nx * 1.05; a.vy -= vn * s.ny * 1.05; b.vx += vn * s.nx * 1.05; b.vy += vn * s.ny * 1.05; } }
      for (const p of ps) if (p.alive && Math.hypot(p.x - cx, p.y - cy) > R){ p.alive = false; fx("out"); }
    },
    // dash when facing someone, or when facing the middle while close to the edge
    ai(i, lvl = 2){ const p = ps[i], t = nearest(ps, i); if (!t || p.cd > 0 || Math.random() > [.12, .2, .35][lvl]) return false;
      const edge = Math.hypot(p.x - cx, p.y - cy) > R * [.72, .68, .62][lvl]; return edge ? aimed(p, cx, cy, .6) : aimed(p, t.x, t.y, [.5, .42, .32][lvl]); },
    result: () => lastAlive(ps),
    draw(c){
      c.beginPath(); c.arc(cx, cy, R, 0, TAU); c.fillStyle = col.surface; c.fill(); c.lineWidth = 1.2 * u; c.strokeStyle = col.accent; c.stroke();
      c.beginPath(); c.arc(cx, cy, R * .3, 0, TAU); c.lineWidth = .4 * u; c.strokeStyle = col.line; c.stroke();
      ps.forEach((p, i) => p.alive && drawDisc(c, p, r, i));
    },
  };
}

/* ---------- spin and drive: turning while the button is up, driving while it's held ---------- */
function movers(n, w, h, u, r, margin){
  return Array.from({ length:n }, (_, i) => { const s = seatPos(i, n, w, h, margin * u); return { x:s.x, y:s.y, a:facing(s, w, h), alive:true, spin:i % 2 ? -2.6 : 2.6 }; });
}
function moveAll(ps, held, dt, speed){
  ps.forEach((p, i) => { if (!p.alive) return; if (held[i]){ p.x += Math.cos(p.a) * speed(i) * dt; p.y += Math.sin(p.a) * speed(i) * dt; } else p.a += p.spin * dt; });
}

/* ---------- tanks ---------- */
function tanks({ n, w, h, u, col, fx }){
  const r = 5 * u, ps = movers(n, w, h, u, r, 12); ps.forEach(p => p.reload = 0);
  const blocks = [[w * .32, h * .47, w * .36, h * .06], [w * .08, h * .27, w * .2, h * .035], [w * .72, h * .7, w * .2, h * .035]];
  let shells = [], time = 0;
  const hitBlock = (x, y, rad) => blocks.some(([bx, by, bw, bh]) => { const qx = clamp(x, bx, bx + bw), qy = clamp(y, by, by + bh); return Math.hypot(x - qx, y - qy) < rad; });
  return {
    press(i){ const p = ps[i]; if (!p.alive || p.reload > 0) return; p.reload = .55; fx("tap");
      shells.push({ x:p.x + Math.cos(p.a) * r * 1.5, y:p.y + Math.sin(p.a) * r * 1.5, vx:Math.cos(p.a) * 76 * u, vy:Math.sin(p.a) * 76 * u, o:i, age:0, b:1 }); },
    update(dt, held){
      time += dt; ps.forEach(p => p.reload -= dt);
      moveAll(ps, held, dt, () => 30 * u);
      for (const p of ps){ if (!p.alive) continue; keepIn(p, r, w, h);
        for (const [bx, by, bw, bh] of blocks){ const qx = clamp(p.x, bx, bx + bw), qy = clamp(p.y, by, by + bh), d = Math.hypot(p.x - qx, p.y - qy);
          if (d < r && d > 0){ p.x = qx + (p.x - qx) / d * r; p.y = qy + (p.y - qy) / d * r; } else if (d === 0) p.y = by - r; } }
      for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (ps[i].alive && ps[j].alive) separate(ps[i], ps[j], r, r);
      shells = shells.filter(s => { s.age += dt; s.x += s.vx * dt; s.y += s.vy * dt;
        if (s.x < 0 || s.x > w){ if (s.b-- <= 0) return false; s.vx = -s.vx; s.x = clamp(s.x, 0, w); }
        if (s.y < 0 || s.y > h){ if (s.b-- <= 0) return false; s.vy = -s.vy; s.y = clamp(s.y, 0, h); }
        if (s.age > 2.6 || hitBlock(s.x, s.y, 1.3 * u)) return false;
        for (let i = 0; i < n; i++){ const p = ps[i]; if (p.alive && (s.o !== i || s.age > .3) && Math.hypot(p.x - s.x, p.y - s.y) < r + 1.3 * u){ p.alive = false; fx("out"); return false; } }
        return true; });
    },
    // drive (and fire) while roughly facing someone, let go now and then to aim again
    ai(i, lvl = 2){ const p = ps[i], t = nearest(ps, i); if (!t) return false; p.rest = (p.rest || 0) - 1 / 60; if (p.rest > 0) return false;
      if (aimed(p, t.x, t.y, [.24, .2, .16][lvl])){ if (Math.random() < [.04, .015, 0][lvl]) p.rest = .35; return true; } return false; },
    result: () => time > 45 ? -1 : lastAlive(ps),
    draw(c){
      c.fillStyle = col.surface; c.fillRect(0, 0, w, h);
      c.fillStyle = col.muted; blocks.forEach(([bx, by, bw, bh]) => { if (c.roundRect){ c.beginPath(); c.roundRect(bx, by, bw, bh, u); c.fill(); } else c.fillRect(bx, by, bw, bh); });
      ps.forEach((p, i) => { if (!p.alive) return; c.lineWidth = 2.2 * u; c.lineCap = "round"; c.strokeStyle = COLORS[i];
        c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(p.x + Math.cos(p.a) * r * 1.7, p.y + Math.sin(p.a) * r * 1.7); c.stroke(); drawDisc(c, p, r, i, false); });
      shells.forEach(s => { c.beginPath(); c.arc(s.x, s.y, 1.3 * u, 0, TAU); c.fillStyle = COLORS[s.o]; c.fill(); c.lineWidth = .4 * u; c.strokeStyle = col.ink; c.stroke(); });
    },
  };
}

/* ---------- goals on the walls: player 0 guards the bottom, 1 the top, 2 the left, 3 the right ---------- */
const SIDE = ["bottom", "top", "left", "right"];
function drawLives(c, i, lives, w, h, u, col){
  c.font = `${4.4 * u}px system-ui, sans-serif`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillStyle = COLORS[i];
  const t = hearts(lives); if (i === 0) c.fillText(t, w / 2, h - 7 * u); else if (i === 1) c.fillText(t, w / 2, 7 * u);
  else { c.save(); c.translate(i === 2 ? 7 * u : w - 7 * u, h / 2); c.rotate(i === 2 ? Math.PI / 2 : -Math.PI / 2); c.fillText(t, 0, 0); c.restore(); }
}

/* ---------- football: push the ball into someone else's goal; three goals against you and you're out ---------- */
function football({ n, w, h, u, col, fx }){
  const r = 5 * u, br = 3 * u, ps = movers(n, w, h, u, r, 16), lives = Array(n).fill(3), half = () => Math.min(w, h) * .2;
  const ball = { x:w / 2, y:h / 2, vx:0, vy:0 }; let wait = 1, time = 0, golden = false;
  const kick = () => { const a = rnd(0, TAU); ball.vx = Math.cos(a) * 30 * u; ball.vy = Math.sin(a) * 30 * u; };
  const reset = () => { ball.x = w / 2; ball.y = h / 2; ball.vx = ball.vy = 0; wait = .9; };
  const inGoal = i => ps[i] && ps[i].alive && Math.abs((i < 2 ? ball.x - w / 2 : ball.y - h / 2)) < half(i);
  const concede = i => { lives[i]--; fx("out"); if (lives[i] <= 0) ps[i].alive = false; reset(); };
  return {
    update(dt, held){
      moveAll(ps, held, dt, () => 34 * u);
      ps.forEach(p => p.alive && keepIn(p, r, w, h));
      for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (ps[i].alive && ps[j].alive) separate(ps[i], ps[j], r, r);
      if (wait > 0){ wait -= dt; if (wait <= 0) kick(); return; }
      time += dt;
      // after 90 seconds it's golden goal: only the players with the most hearts stay, with one heart each
      if (time > 90 && !golden){ golden = true; const best = Math.max(...lives.filter((l, i) => ps[i].alive)); ps.forEach((p, i) => { if (p.alive && lives[i] < best) p.alive = false; else lives[i] = Math.min(lives[i], 1); }); }
      // the ball never dies down, so a goal left open gets scored on sooner or later
      ball.x += ball.vx * dt; ball.y += ball.vy * dt; const f = Math.exp(-.2 * dt), sp0 = Math.hypot(ball.vx, ball.vy) * f || 1, k = Math.max(sp0, 24 * u) / (sp0 / f); ball.vx *= k; ball.vy *= k;
      ps.forEach((p, i) => { if (!p.alive) return; const dx = ball.x - p.x, dy = ball.y - p.y, d = Math.hypot(dx, dy) || .001; if (d >= r + br) return;
        const nx = dx / d, ny = dy / d, push = held[i] ? Math.max(0, Math.cos(p.a) * nx + Math.sin(p.a) * ny) * 34 * u : 0, sp = Math.max(30 * u + push, Math.hypot(ball.vx, ball.vy) * .7);
        ball.x = p.x + nx * (r + br); ball.y = p.y + ny * (r + br); ball.vx = nx * sp; ball.vy = ny * sp; });
      if (ball.y > h - br){ if (inGoal(0)) return concede(0); ball.y = h - br; ball.vy = -Math.abs(ball.vy); }
      if (ball.y < br){ if (inGoal(1)) return concede(1); ball.y = br; ball.vy = Math.abs(ball.vy); }
      if (ball.x < br){ if (inGoal(2)) return concede(2); ball.x = br; ball.vx = Math.abs(ball.vx); }
      if (ball.x > w - br){ if (inGoal(3)) return concede(3); ball.x = w - br; ball.vx = -Math.abs(ball.vx); }
    },
    // run at the ball whenever it's roughly ahead
    // easy: just chases the ball. medium and hard: get behind the ball so it flies at someone else's goal, and hard also falls back to guard its own goal
    ai(i, lvl = 2){ const p = ps[i]; if (lvl === 0) return aimed(p, ball.x, ball.y, .5) && Math.random() > .08;
      const G = [[w / 2, h], [w / 2, 0], [0, h / 2], [w, h / 2]], mine = G[i];
      let opp = null, od = 1e9; ps.forEach((q, j) => { if (j === i || !q.alive) return; const d = Math.hypot(G[j][0] - ball.x, G[j][1] - ball.y); if (d < od){ od = d; opp = G[j]; } });
      if (!opp) return aimed(p, ball.x, ball.y, .4);
      const toMine = Math.hypot(ball.x - mine[0], ball.y - mine[1]), coming = (ball.vx * (mine[0] - ball.x) + ball.vy * (mine[1] - ball.y)) > 0;
      if (lvl === 2 && coming && toMine < Math.min(w, h) * .45){ const tx = (ball.x + mine[0]) / 2, ty = (ball.y + mine[1]) / 2; return aimed(p, tx, ty, .35) || aimed(p, ball.x, ball.y, .25); }
      const dx = opp[0] - ball.x, dy = opp[1] - ball.y, d = Math.hypot(dx, dy) || 1, back = (r + br) * (lvl === 2 ? 1.4 : 1.1);
      const tx = ball.x - dx / d * back, ty = ball.y - dy / d * back, near = Math.hypot(tx - p.x, ty - p.y) < r * 1.6;
      return near ? aimed(p, ball.x, ball.y, .4) : aimed(p, tx, ty, lvl === 2 ? .3 : .4) && Math.random() > (lvl === 2 ? 0 : .03); },
    result: () => time > 150 ? -1 : lastAlive(ps), // nobody scored the golden goal in a minute: call it a draw
    draw(c){
      c.fillStyle = col.surface; c.fillRect(0, 0, w, h);
      c.strokeStyle = col.line; c.lineWidth = .5 * u; c.beginPath(); c.arc(w / 2, h / 2, 12 * u, 0, TAU); c.stroke(); c.beginPath(); c.moveTo(0, h / 2); c.lineTo(w, h / 2); c.stroke();
      ps.forEach((p, i) => { if (!p.alive) return; c.strokeStyle = COLORS[i]; c.lineWidth = 2.4 * u; c.lineCap = "round"; c.beginPath(); const g = half(i);
        if (i === 0){ c.moveTo(w / 2 - g, h - u); c.lineTo(w / 2 + g, h - u); } else if (i === 1){ c.moveTo(w / 2 - g, u); c.lineTo(w / 2 + g, u); }
        else if (i === 2){ c.moveTo(u, h / 2 - g); c.lineTo(u, h / 2 + g); } else { c.moveTo(w - u, h / 2 - g); c.lineTo(w - u, h / 2 + g); }
        c.stroke(); drawLives(c, i, lives[i], w, h, u, col); drawDisc(c, p, r, i); });
      c.beginPath(); c.arc(ball.x, ball.y, br, 0, TAU); c.fillStyle = "#fff"; c.fill(); c.lineWidth = .5 * u; c.strokeStyle = "#333"; c.stroke();
    },
  };
}

/* ---------- air hockey: your paddle slides on its own, a tap turns it round ---------- */
function hockey({ n, w, h, u, col, fx }){
  const br = 2.6 * u, th = 2.6 * u, inset = 4 * u, len = i => (i < 2 ? w : h) * .27, span = i => (i < 2 ? w : h);
  const ps = Array.from({ length:n }, (_, i) => ({ t:span(i) / 2, dir:i % 2 ? -1 : 1, lives:3, alive:true }));
  const ball = { x:w / 2, y:h / 2, vx:0, vy:0 }; let s = 40 * u, wait = 1;
  const serve = () => { const alive = ps.map((p, i) => p.alive ? i : -1).filter(i => i >= 0), t = alive[Math.floor(Math.random() * alive.length)];
    const base = [Math.PI / 2, -Math.PI / 2, Math.PI, 0][t], a = base + rnd(-.5, .5); s = 40 * u; ball.vx = Math.cos(a) * s; ball.vy = Math.sin(a) * s; };
  const miss = i => { const p = ps[i]; p.lives--; fx("out"); if (p.lives <= 0) p.alive = false; ball.x = w / 2; ball.y = h / 2; ball.vx = ball.vy = 0; wait = .9; };
  const bounce = (i, off) => { fx("hit"); s = Math.min(s * 1.05, 96 * u); const a = clamp(off, -1, 1) * 1.05;
    if (i === 0){ ball.vx = Math.sin(a) * s; ball.vy = -Math.cos(a) * s; } else if (i === 1){ ball.vx = Math.sin(a) * s; ball.vy = Math.cos(a) * s; }
    else if (i === 2){ ball.vx = Math.cos(a) * s; ball.vy = Math.sin(a) * s; } else { ball.vx = -Math.cos(a) * s; ball.vy = Math.sin(a) * s; } };
  const on = i => ps[i] && ps[i].alive;
  function step(dt){
    ball.x += ball.vx * dt; ball.y += ball.vy * dt;
    // bottom, top, left, right: a paddle if someone is guarding that wall, a plain wall if not
    if (ball.vy > 0){ if (on(0)){ const py = h - inset; if (ball.y + br >= py - th / 2 && ball.y < py && Math.abs(ball.x - ps[0].t) <= len(0) / 2 + br) bounce(0, (ball.x - ps[0].t) / (len(0) / 2)); else if (ball.y > h + br) return miss(0); } else if (ball.y > h - br){ ball.y = h - br; ball.vy = -ball.vy; } }
    else if (ball.vy < 0){ if (on(1)){ const py = inset; if (ball.y - br <= py + th / 2 && ball.y > py && Math.abs(ball.x - ps[1].t) <= len(1) / 2 + br) bounce(1, (ball.x - ps[1].t) / (len(1) / 2)); else if (ball.y < -br) return miss(1); } else if (ball.y < br){ ball.y = br; ball.vy = -ball.vy; } }
    if (ball.vx < 0){ if (on(2)){ const px = inset; if (ball.x - br <= px + th / 2 && ball.x > px && Math.abs(ball.y - ps[2].t) <= len(2) / 2 + br) bounce(2, (ball.y - ps[2].t) / (len(2) / 2)); else if (ball.x < -br) return miss(2); } else if (ball.x < br){ ball.x = br; ball.vx = -ball.vx; } }
    else if (ball.vx > 0){ if (on(3)){ const px = w - inset; if (ball.x + br >= px - th / 2 && ball.x < px && Math.abs(ball.y - ps[3].t) <= len(3) / 2 + br) bounce(3, (ball.y - ps[3].t) / (len(3) / 2)); else if (ball.x > w + br) return miss(3); } else if (ball.x > w - br){ ball.x = w - br; ball.vx = -ball.vx; } }
  }
  return {
    press(i){ if (ps[i].alive) ps[i].dir *= -1; },
    update(dt){
      ps.forEach((p, i) => { if (!p.alive) return; p.t += p.dir * 50 * u * dt; const lo = len(i) / 2, hi = span(i) - len(i) / 2; if (p.t < lo){ p.t = lo; p.dir = 1; } if (p.t > hi){ p.t = hi; p.dir = -1; } });
      if (wait > 0){ wait -= dt; if (wait <= 0) serve(); return; }
      for (let k = 0; k < 3 && wait <= 0; k++) step(dt / 3);
    },
    // turn the paddle round when the ball is coming and the paddle is sliding away from it
    ai(i, lvl = 2){ const p = ps[i]; p.think = (p.think || 0) - 1 / 60; if (p.think > 0) return false;
      const j = [16, 10, 4][lvl], coming = [ball.vy > 0, ball.vy < 0, ball.vx < 0, ball.vx > 0][i], at = (i < 2 ? ball.x : ball.y) + rnd(-j, j) * u, off = at - p.t;
      if ((coming || lvl >= 1) && Math.abs(off) > len(i) * [.3, .25, .18][lvl] && Math.sign(off) !== p.dir){ p.think = [.5, .32, .16][lvl]; return true; } return false; },
    result: () => lastAlive(ps),
    draw(c){
      c.fillStyle = col.surface; c.fillRect(0, 0, w, h);
      c.strokeStyle = col.line; c.lineWidth = .5 * u; c.beginPath(); c.arc(w / 2, h / 2, 10 * u, 0, TAU); c.stroke();
      ps.forEach((p, i) => { if (!p.alive) return; c.strokeStyle = COLORS[i]; c.lineWidth = th; c.lineCap = "round"; c.beginPath(); const g = len(i) / 2 - th / 2;
        if (i === 0){ c.moveTo(p.t - g, h - inset); c.lineTo(p.t + g, h - inset); } else if (i === 1){ c.moveTo(p.t - g, inset); c.lineTo(p.t + g, inset); }
        else if (i === 2){ c.moveTo(inset, p.t - g); c.lineTo(inset, p.t + g); } else { c.moveTo(w - inset, p.t - g); c.lineTo(w - inset, p.t + g); }
        c.stroke(); drawLives(c, i, p.lives, w, h, u * 1.6, col); });
      c.beginPath(); c.arc(ball.x, ball.y, br, 0, TAU); c.fillStyle = col.ink; c.fill();
    },
  };
}

/* ---------- snakes: always moving, hold to turn; touch a wall or any trail and you're out ---------- */
function snakes({ n, w, h, u, col, fx }){
  const cell = Math.max(2, u * .9), cols = Math.ceil(w / cell) + 1, rows = Math.ceil(h / cell) + 1, owner = new Int8Array(cols * rows).fill(-1), stamp = new Float32Array(cols * rows);
  let time = 0;
  const ps = Array.from({ length:n }, (_, i) => { const s = seatPos(i, n, w, h, 16 * u); return { x:s.x, y:s.y, a:facing(s, w, h) + rnd(-.4, .4), alive:true, lines:[[]], gap:0, next:rnd(2, 3.2) }; });
  const mark = (x, y, i) => { const cx = Math.floor(x / cell), cy = Math.floor(y / cell);
    for (const [dx, dy] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]){ const X = cx + dx, Y = cy + dy; if (X < 0 || Y < 0 || X >= cols || Y >= rows) continue; const k = Y * cols + X; if (owner[k] === -1 || owner[k] === i){ owner[k] = i; stamp[k] = time; } } };
  return {
    update(dt, held){
      time += dt;
      ps.forEach((p, i) => { if (!p.alive) return;
        if (held[i]) p.a += 3 * dt;
        p.next -= dt; if (p.gap > 0){ p.gap -= dt; if (p.gap <= 0) p.lines.push([]); } else if (p.next <= 0){ p.gap = .28; p.next = rnd(2.2, 3.4); }
        const dist = 25 * u * dt, steps = Math.max(1, Math.ceil(dist / (cell * .5)));
        for (let s = 0; s < steps && p.alive; s++){
          p.x += Math.cos(p.a) * dist / steps; p.y += Math.sin(p.a) * dist / steps;
          if (p.x < 0 || p.y < 0 || p.x > w || p.y > h){ p.alive = false; fx("out"); break; }
          const k = Math.floor(p.y / cell) * cols + Math.floor(p.x / cell);
          if (owner[k] !== -1 && (owner[k] !== i || time - stamp[k] > .4)){ p.alive = false; fx("out"); break; }
          if (p.gap <= 0) mark(p.x, p.y, i);
        }
        if (p.alive && p.gap <= 0) p.lines[p.lines.length - 1].push(p.x, p.y);
      });
    },
    // turn when something is in the way ahead; otherwise wander a little
    ai(i, lvl = 2){ const p = ps[i]; const blocked = (ang, far) => { for (let d = cell * 2; d < far; d += cell){ const x = p.x + Math.cos(ang) * d, y = p.y + Math.sin(ang) * d;
        if (x < cell || y < cell || x > w - cell || y > h - cell) return true; const k = Math.floor(y / cell) * cols + Math.floor(x / cell); if (owner[k] !== -1 && (owner[k] !== i || time - stamp[k] > .4)) return true; } return false; };
      if (blocked(p.a, [13, 15, 18][lvl] * u) || blocked(p.a + .35, [9, 11, 13][lvl] * u)) return true; p.wander = (p.wander || 0) - 1 / 60; if (p.wander < -1.4) p.wander = rnd(.1, .35); return p.wander > 0; },
    result: () => lastAlive(ps),
    draw(c){
      c.fillStyle = col.surface; c.fillRect(0, 0, w, h);
      ps.forEach((p, i) => { c.strokeStyle = COLORS[i]; c.lineWidth = 1.7 * u; c.lineCap = c.lineJoin = "round";
        for (const l of p.lines){ if (l.length < 4) continue; c.beginPath(); c.moveTo(l[0], l[1]); for (let k = 2; k < l.length; k += 2) c.lineTo(l[k], l[k + 1]); c.stroke(); }
        if (p.alive) drawDisc(c, p, 2.6 * u, i, false); });
    },
  };
}

/* ---------- bomb: bump into someone to hand it over before it goes off ---------- */
function bomb({ n, w, h, u, col, fx }){
  const r = 5.5 * u, ps = movers(n, w, h, u, r, 16);
  let holder = Math.floor(Math.random() * n), fuse = rnd(9, 15), pass = .8, boom = 0, bx = 0, by = 0, time = 0;
  return {
    update(dt, held){
      time += dt; pass -= dt; if (boom > 0) boom -= dt;
      moveAll(ps, held, dt, i => (i === holder ? 39 : 33) * u);
      ps.forEach(p => p.alive && keepIn(p, r, w, h));
      for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++){ if (!ps[i].alive || !ps[j].alive) continue;
        if (separate(ps[i], ps[j], r, r) && pass <= 0 && (i === holder || j === holder)){ holder = i === holder ? j : i; pass = .6; fx("hit"); } }
      fuse -= dt;
      if (fuse <= 0){ const p = ps[holder]; p.alive = false; boom = .8; fx("boom"); bx = p.x; by = p.y;
        const left = ps.map((q, i) => q.alive ? i : -1).filter(i => i >= 0); if (left.length > 1){ holder = left[Math.floor(Math.random() * left.length)]; fuse = rnd(8, 13); pass = .8; } }
    },
    // with the bomb: run at the nearest player. Without it: run when facing away from whoever has it
    ai(i, lvl = 2){ const p = ps[i], hp = ps[holder]; if (i === holder){ const t = nearest(ps, i); return !!t && aimed(p, t.x, t.y, [.45, .38, .3][lvl]); }
      if (!hp || !hp.alive) return false; const away = Math.atan2(p.y - hp.y, p.x - hp.x), near = Math.hypot(p.x - hp.x, p.y - hp.y) < [40, 48, 58][lvl] * u;
      const wall = p.x + Math.cos(p.a) * 12 * u, wy = p.y + Math.sin(p.a) * 12 * u; if (wall < r || wall > w - r || wy < r || wy > h - r) return false;
      return near && Math.abs(angDiff(p.a, away)) < .9; },
    result: () => lastAlive(ps),
    draw(c){
      c.fillStyle = col.surface; c.fillRect(0, 0, w, h);
      ps.forEach((p, i) => p.alive && drawDisc(c, p, r, i));
      const p = ps[holder]; if (p && p.alive){ const beat = 1 + .18 * Math.sin(time * (6 + 40 / Math.max(1, fuse)));
        c.font = `${r * 1.5 * beat}px system-ui, sans-serif`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("💣", p.x, p.y < r * 3.2 ? p.y + r * 1.6 : p.y - r * 1.5); }
      if (boom > 0){ c.font = `${r * 4}px system-ui, sans-serif`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("💥", bx, by); }
    },
  };
}

/* ---------- tap race: every tap is a step; first across the line ---------- */
function race({ n, w, h, u, col, fx }){
  const ps = Array.from({ length:n }, () => ({ d:0, bob:0, next:0 })), goal = 46; let won = null, time = 0;
  return {
    rawAi:true,
    press(i){ if (won !== null) return; const p = ps[i]; p.d++; p.bob = 1; fx("tap"); if (p.d >= goal) won = i; },
    update(dt){ time += dt; ps.forEach(p => { p.bob = Math.max(0, p.bob - dt * 9); }); },
    // the computer just taps at a steady pace for its level
    ai(i, lvl){ const p = ps[i]; if (time < p.next) return false; p.next = time + 1 / ([5, 7.5, 10.5][lvl] * rnd(.8, 1.2)); return true; },
    result: () => won,
    draw(c){
      c.fillStyle = col.surface; c.fillRect(0, 0, w, h);
      const lane = h / n, x0 = 9 * u, x1 = w - 12 * u;
      ps.forEach((p, i) => { const y = lane * (i + .5);
        c.fillStyle = i % 2 ? "rgba(127,127,127,.08)" : "rgba(127,127,127,.16)"; c.fillRect(0, lane * i, w, lane);
        c.font = `${6 * u}px system-ui, sans-serif`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("🏁", x1 + 6 * u, y);
        drawDisc(c, { x:x0 + (x1 - x0) * Math.min(1, p.d / goal), y:y - p.bob * 2.5 * u, a:0 }, Math.min(6 * u, lane * .3), i, false); });
    },
  };
}

/* ---------- quickest finger: wait for green, then tap. Tap too early and you sit this round out ---------- */
function quick({ n, w, h, u, col, fx }){
  const ps = Array.from({ length:n }, () => ({ alive:true, at:0 })); let time = 0, go = rnd(1.6, 4.6), won = null, said = false;
  return {
    rawAi:true,
    press(i){ const p = ps[i]; if (won !== null || !p.alive) return; if (time < go){ p.alive = false; fx("out"); const left = ps.filter(q => q.alive); if (left.length === 1) won = ps.indexOf(left[0]); else if (!left.length) won = -1; } else { won = i; fx("hit"); } },
    update(dt){ time += dt; if (!said && time >= go){ said = true; fx("go"); } },
    // the computer answers after a human-like delay, slower on the easy level, and now and then jumps the gun
    ai(i, lvl){ const p = ps[i]; if (!p.alive) return false; if (!p.at) p.at = go + [rnd(.38, .6), rnd(.26, .38), rnd(.17, .24)][lvl] - (Math.random() < [.05, .02, 0][lvl] ? rnd(.6, 1.2) : 0); return time >= p.at; },
    result: () => won,
    draw(c){
      const green = time >= go; c.fillStyle = green ? "#2fa868" : "#d24a5c"; c.fillRect(0, 0, w, h);
      c.fillStyle = "#fff"; c.textAlign = "center"; c.textBaseline = "middle"; c.font = `${22 * u}px system-ui, sans-serif`; c.fillText(green ? "👆" : "✋", w / 2, h / 2);
      ps.forEach((p, i) => { const s = seatPos(i, n, w, h, 12 * u); c.globalAlpha = p.alive ? 1 : .3; drawDisc(c, { x:s.x, y:s.y, a:0 }, 6 * u, i, false); c.globalAlpha = 1; if (!p.alive){ c.font = `${7 * u}px system-ui, sans-serif`; c.fillText("🙈", s.x, s.y); } });
    },
  };
}

/* ---------- paint: drive around and colour the floor; most squares after 25 seconds ---------- */
function paint({ n, w, h, u, col, fx }){
  const r = 5 * u, ps = movers(n, w, h, u, r, 14), cols = 9, cell = w / cols, rows = Math.max(6, Math.round(h / cell)), ch = h / rows, grid = new Int8Array(cols * rows).fill(-1);
  let time = 25;
  const count = () => { const k = Array(n).fill(0); grid.forEach(v => { if (v >= 0) k[v]++; }); return k; };
  return {
    update(dt, held){
      time -= dt; moveAll(ps, held, dt, () => 36 * u);
      ps.forEach((p, i) => { keepIn(p, r, w, h); const k = Math.min(rows - 1, Math.floor(p.y / ch)) * cols + Math.min(cols - 1, Math.floor(p.x / cell)); if (grid[k] !== i){ grid[k] = i; } });
      for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (separate(ps[i], ps[j], r, r)) fx("hit");
    },
    // head for the nearest square that isn't yours yet
    ai(i, lvl = 2){ const p = ps[i]; let best = null, bd = 1e9; for (let k = 0; k < grid.length; k++){ if (grid[k] === i) continue; const x = (k % cols + .5) * cell, y = (Math.floor(k / cols) + .5) * ch, d = Math.hypot(x - p.x, y - p.y); if (d < bd && d > r){ bd = d; best = [x, y]; } }
      return !!best && aimed(p, best[0], best[1], [.5, .42, .34][lvl]); },
    result(){ if (time > 0) return null; const k = count(), top = Math.max(...k), who = k.map((v, i) => v === top ? i : -1).filter(i => i >= 0); return who.length === 1 ? who[0] : -1; },
    draw(c){
      c.fillStyle = col.surface; c.fillRect(0, 0, w, h);
      for (let k = 0; k < grid.length; k++){ if (grid[k] < 0) continue; c.globalAlpha = .55; c.fillStyle = COLORS[grid[k]]; c.fillRect((k % cols) * cell + 1, Math.floor(k / cols) * ch + 1, cell - 2, ch - 2); } c.globalAlpha = 1;
      ps.forEach((p, i) => drawDisc(c, p, r, i));
      const k = count(); c.font = `800 ${5 * u}px system-ui, sans-serif`; c.textAlign = "center"; c.textBaseline = "top"; c.fillStyle = col.ink; c.fillText(`⏱ ${Math.max(0, Math.ceil(time))}   ${k.map((v, i) => FACES[i] + v).join("  ")}`, w / 2, 2 * u);
    },
  };
}

/* ---------- star catch: first to grab five stars ---------- */
function stars({ n, w, h, u, col, fx }){
  const r = 5 * u, ps = movers(n, w, h, u, r, 14), got = Array(n).fill(0); let star = null, spin = 0;
  const drop = () => { star = { x:rnd(10 * u, w - 10 * u), y:rnd(10 * u, h - 10 * u) }; }; drop();
  return {
    update(dt, held){
      spin += dt; moveAll(ps, held, dt, () => 36 * u); ps.forEach(p => keepIn(p, r, w, h));
      for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) separate(ps[i], ps[j], r, r);
      ps.forEach((p, i) => { if (Math.hypot(p.x - star.x, p.y - star.y) < r + 3.5 * u){ got[i]++; fx("hit"); drop(); } });
    },
    ai(i, lvl = 2){ return aimed(ps[i], star.x, star.y, [.48, .4, .32][lvl]); },
    result(){ const i = got.findIndex(v => v >= 5); return i >= 0 ? i : null; },
    draw(c){
      c.fillStyle = col.surface; c.fillRect(0, 0, w, h);
      c.font = `${8 * u * (1 + .12 * Math.sin(spin * 6))}px system-ui, sans-serif`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("⭐", star.x, star.y);
      ps.forEach((p, i) => drawDisc(c, p, r, i));
      c.font = `800 ${5 * u}px system-ui, sans-serif`; c.textBaseline = "top"; c.fillStyle = col.ink; c.fillText(got.map((v, i) => FACES[i] + v).join("  "), w / 2, 2 * u);
    },
  };
}

export const GAMES = [
  { id:"sumo", e:"🤼", free:true, rounds:3, make:sumo, ar:["سومو", "إنت بتلف لوحدك. دوس عشان تندفع لقدام، وزق الباقي برّه الحلبة."], en:["Sumo", "You spin on your own. Tap to dash forward and push the others out of the ring."] },
  { id:"hockey", e:"🏒", free:true, rounds:1, make:hockey, ar:["الهوكي", "المضرب بتاعك بيتحرك لوحده. دوس عشان يغيّر اتجاهه، ومتخليش الكورة تعدّي منك. ليك ٣ قلوب."], en:["Air hockey", "Your paddle slides on its own. Tap to turn it round and don't let the ball get past you. You have 3 hearts."] },
  { id:"tanks", e:"🛡️", rounds:3, make:tanks, ar:["حرب الدبابات", "الدبابة بتلف لوحدها. كل دوسة بتضرب قذيفة، ولو فضلت دايس بتمشي لقدام."], en:["Tank battle", "Your tank turns on its own. Each tap fires a shell, and holding drives forward."] },
  { id:"football", e:"⚽", rounds:1, make:football, ar:["كورة", "سيب الزرار عشان تلف، ودوس عشان تجري. دخّل الكورة في جون غيرك. اللي يدخل فيه ٣ أجوان بيخرج."], en:["Football", "Let go to turn, hold to run. Push the ball into someone else's goal. Three goals against you and you're out."] },
  { id:"snakes", e:"🐍", rounds:3, make:snakes, ar:["ساحة الثعابين", "التعبان ماشي على طول. دوس عشان يلف. اللي يخبط في الحيطة أو في أي ديل بيخرج."], en:["Snake arena", "Your snake never stops. Hold to turn. Hit a wall or any trail and you're out."] },
  { id:"race", e:"🏃", rounds:3, make:race, ar:["سباق الدوس", "كل دوسة خطوة. دوس بأسرع ما عندك، وأول واحد يوصل للعلم يكسب."], en:["Tap race", "Every tap is a step. Tap as fast as you can. First to the flag wins."] },
  { id:"quick", e:"⚡", rounds:3, make:quick, ar:["مين الأسرع؟", "استنوا الشاشة تبقى خضرا ودوسوا. اللي يدوس بدري بيخرج من الجولة."], en:["Quickest finger", "Wait for the screen to turn green, then tap. Tap too early and you sit the round out."] },
  { id:"paint", e:"🎨", rounds:1, make:paint, ar:["لوّنها", "سيب الزرار عشان تلف، ودوس عشان تجري وتلوّن الأرض. اللي يلوّن أكتر في ٢٥ ثانية يكسب."], en:["Paint it", "Let go to turn, hold to run and colour the floor. Most squares after 25 seconds wins."] },
  { id:"stars", e:"⭐", rounds:1, make:stars, ar:["صيد النجوم", "سيب الزرار عشان تلف، ودوس عشان تجري. أول واحد يمسك ٥ نجوم يكسب."], en:["Star catch", "Let go to turn, hold to run. First to grab 5 stars wins."] },
  { id:"bomb", e:"💣", rounds:2, make:bomb, ar:["القنبلة", "سيب الزرار عشان تلف، ودوس عشان تجري. اللي معاه القنبلة يخبط في حد عشان يديهاله قبل ما تفرقع."], en:["Hot bomb", "Let go to turn, hold to run. If you have the bomb, bump into someone to hand it over before it goes off."] },
];

/* little sounds and a buzz, so a hit feels like a hit. Off with the 🔊 button; remembered on this phone */
let actx = null;
const soundOn = () => { try { return localStorage.getItem("nw-gsnd") !== "0"; } catch(e){ return true; } };
function beep(kind){
  if (!soundOn()) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)(); if (actx.state === "suspended") actx.resume();
    const [f0, f1, len, type, vol] = { tap:[520, 640, .05, "square", .04], hit:[300, 180, .09, "triangle", .1], out:[260, 70, .28, "sawtooth", .09], boom:[120, 40, .45, "sawtooth", .16], go:[880, 880, .14, "square", .07], tick:[440, 440, .07, "sine", .08], win:[523, 1046, .5, "triangle", .12] }[kind] || [440, 440, .05, "sine", .05];
    const o = actx.createOscillator(), g = actx.createGain(), t = actx.currentTime; o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(30, f1), t + len);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + len); o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + len + .02);
    if ((kind === "out" || kind === "boom") && navigator.vibrate) navigator.vibrate(kind === "boom" ? 120 : 40);
  } catch(e){}
}
const CHEERS = { ar:["يا سلام! 😎", "ولا في الأحلام 😂", "حد يلحق الباقي 🚑", "إيه الحلاوة دي 🍬", "اتفرّجوا واتعلّموا 👀", "كده كتير عليهم 😭", "بالراحة عليهم 🙈", "ده حظ ولا شطارة؟ 🤔"],
                 en:["Too good! 😎", "Unreal 😂", "Somebody call a medic 🚑", "Smooth 🍬", "Watch and learn 👀", "That was brutal 😭", "Go easy on them 🙈", "Luck or skill? 🤔"] };
// how sharp the computer is: how often it looks, how often it gets it wrong, and how long it daydreams
const LEVELS = [{ rate:6, wrong:.2, nap:[2.4, .8] }, { rate:15, wrong:.05, nap:[6, .3] }, { rate:60, wrong:0, nap:null }];

export function closeGames(){ const g = document.getElementById("games"); if (g && g._close) g._close(); }

export function openGames(opts = {}){
  closeGames();
  const en = !!opts.en, T = TXT[en ? "en" : "ar"], nm = g => (en ? g.en : g.ar);
  const root = document.createElement("div"); root.id = "games"; root.dir = en ? "ltr" : "rtl"; document.body.appendChild(root);
  let raf = 0, players = 2, cur = null, stopPlay = null; // players 1 = one person against the computer
  let level = 0; try { level = clamp(+localStorage.getItem("nw-glvl") || 0, 0, 2); } catch(e){}
  const close = () => { if (stopPlay) stopPlay(); root.remove(); };
  root._close = close;
  const open = g => !!opts.unlocked || !!g.free;

  function menu(){
    if (stopPlay) stopPlay();
    root.innerHTML = `<div class="g-page"><header class="g-head"><h2>🎮 ${T.title}</h2><span><button class="g-x" data-g="sound" aria-label="sound">${soundOn() ? "🔊" : "🔇"}</button> <button class="g-x" data-g="close" aria-label="${T.back}">✕</button></span></header>
      <p class="g-sub">${T.sub}</p>
      <div class="g-list">${GAMES.map(g => `<button class="g-item" data-g="pick" data-id="${g.id}"><span class="g-e">${g.e}</span><span class="g-n"><b>${nm(g)[0]}</b><small>${nm(g)[1]}</small></span><span class="g-tag">${open(g) ? (g.free && !opts.unlocked ? T.free : "▶") : "🔒"}</span></button>`).join("")}</div></div>`;
  }
  function setup(g){
    cur = g;
    root.innerHTML = `<div class="g-page"><header class="g-head"><h2>${g.e} ${nm(g)[0]}</h2><button class="g-x" data-g="menu" aria-label="${T.back}">✕</button></header>
      <div class="g-card"><b>${T.how}</b><p>${nm(g)[1]}</p><p class="g-small">${g.rounds > 1 ? `${T.first} ${g.rounds} ${T.rounds}` : ""}</p>${matchMedia("(pointer:fine)").matches ? `<p class="g-small">${T.keys}: ${KEYS.map((k, i) => `${FACES[i]} ${k.toUpperCase()}`).join(" · ")}</p>` : ""}</div>
      <div class="g-card"><b>${T.players}</b><div class="g-seg">${[1, 2, 3, 4].map(k => `<button data-g="n" data-n="${k}" aria-pressed="${players === k}">${k === 1 ? FACES[0] + "🤖" : FACES.slice(0, k).join("")}<small>${k === 1 ? T.solo : k}</small></button>`).join("")}</div></div>
      ${players === 1 ? `<div class="g-card"><b>${T.level}</b><div class="g-seg">${T.lv.map((x, k) => `<button class="g-lv" data-g="lv" data-n="${k}" aria-pressed="${level === k}">${x}</button>`).join("")}</div></div>` : ""}
      <button class="g-go" data-g="start">${T.start}</button></div>`;
  }
  function finish(g, winner, bots = []){
    root.innerHTML = `<div class="g-page g-center"><div class="g-cup">🏆</div><div class="g-face" style="--c:${COLORS[winner]}">${bots.includes(winner) ? "🤖" : FACES[winner]}</div><h2>${T.win}</h2><p class="g-sub">${CHEERS[en ? "en" : "ar"][Math.floor(Math.random() * 8)]}</p>
      <button class="g-go" data-g="start">${T.again}</button><button class="g-ghost" data-g="menu">${T.other}</button></div>`;
  }

  function play(g, n, bots = []){
    // 2 players sit across from each other; 3 and 4 share the two ends
    const slot = i => n === 2 ? (i === 0 ? "b" : "t") : n === 3 ? (i === 1 ? "t" : i === 0 ? "br" : "bl") : ["br", "tl", "bl", "tr"][i];
    const btn = i => `<button class="g-btn g-${slot(i)}${bots.includes(i) ? " g-bot" : ""}" data-p="${i}" style="--c:${COLORS[i]}"${bots.includes(i) ? " disabled" : ""}><span>${bots.includes(i) ? "🤖" : FACES[i]}</span><i></i></button>`;
    const top = [1, 3].filter(i => i < n), bottom = [2, 0].filter(i => i < n);
    root.innerHTML = `<div class="g-play"><div class="g-strip g-top">${top.map(btn).join("")}</div><div class="g-field"><canvas></canvas><button class="g-pause" data-g="pause" aria-label="${T.leave}">✕</button><div class="g-ask" hidden><p>${T.quit}</p><button class="g-go" data-g="resume">${T.resume}</button><button class="g-ghost" data-g="menu">${T.leave}</button></div></div><div class="g-strip g-bottom">${bottom.map(btn).join("")}</div></div>`;
    const cv = root.querySelector("canvas"), c = cv.getContext("2d"), field = root.querySelector(".g-field"), held = Array(n).fill(false), wins = Array(n).fill(0);
    const cs = getComputedStyle(document.body), v = (k, d) => (cs.getPropertyValue(k) || "").trim() || d;
    const col = { bg:v("--bg", "#fff6f9"), surface:v("--surface", "#fff"), ink:v("--ink", "#3b2430"), muted:v("--muted", "#8d7380"), accent:v("--accent", "#e85d8a"), line:"rgba(127,127,127,.35)" };
    let w = 0, h = 0, game = null, phase = "count", t = 3, last = 0, winner = -1, paused = false, round = 1, dead = false;
    const size = () => { const r = field.getBoundingClientRect(), d = Math.min(2, devicePixelRatio || 1); w = Math.max(120, r.width); h = Math.max(120, r.height); cv.width = Math.round(w * d); cv.height = Math.round(h * d); c.setTransform(d, 0, 0, d, 0, 0); };
    const lv = LEVELS[level], brain = bots.map(() => ({ want:false, t:0, nap:rnd(.5, 1.5), sleep:0 }));
    let cheer = "", lastTick = 4;
    const newRound = () => { size(); game = g.make({ n, w, h, u:Math.min(w, h) / 100, col, fx:beep }); phase = "count"; t = 3; lastTick = 4; held.fill(false); root.querySelectorAll(".g-btn.on").forEach(b => b.classList.remove("on")); };
    // the computer looks at the game only every so often, sometimes decides wrong, and sometimes daydreams: that's what makes the easy level easy
    const think = (k, i, dt) => { if (game.rawAi) return !!game.ai(i, level); const b = brain[k];
      if (lv.nap){ b.nap -= dt; if (b.nap <= 0){ b.sleep = lv.nap[1] * rnd(.6, 1.3); b.nap = lv.nap[0] * rnd(.7, 1.4); } if (b.sleep > 0){ b.sleep -= dt; return b.want = false; } }
      b.t -= dt; if (b.t <= 0){ b.t = 1 / lv.rate; const real = !!(game.ai && game.ai(i, level)); b.want = Math.random() < lv.wrong ? Math.random() < .4 : real; } return b.want; };
    const score = () => root.querySelectorAll(".g-btn").forEach(b => { b.querySelector("i").textContent = "★".repeat(wins[+b.dataset.p]); });
    const down = i => { if (paused || held[i]) return; held[i] = true; if (phase === "run" && game.press) game.press(i); root.querySelector(`.g-btn[data-p="${i}"]`)?.classList.add("on"); };
    const up = i => { held[i] = false; root.querySelector(`.g-btn[data-p="${i}"]`)?.classList.remove("on"); };
    root.querySelectorAll(".g-btn:not(.g-bot)").forEach(b => { const i = +b.dataset.p;
      b.addEventListener("pointerdown", e => { e.preventDefault(); try { b.setPointerCapture(e.pointerId); } catch(err){} down(i); });
      for (const ev of ["pointerup", "pointercancel", "lostpointercapture"]) b.addEventListener(ev, () => up(i));
      b.addEventListener("contextmenu", e => e.preventDefault()); });
    const kd = e => { const i = KEYS.indexOf(e.key.toLowerCase()); if (i >= 0 && i < n && !bots.includes(i) && !e.repeat){ e.preventDefault(); down(i); } }, ku = e => { const i = KEYS.indexOf(e.key.toLowerCase()); if (i >= 0 && i < n && !bots.includes(i)) up(i); };
    addEventListener("keydown", kd); addEventListener("keyup", ku);
    const big = (text, sub) => { c.fillStyle = "rgba(0,0,0,.28)"; c.fillRect(0, 0, w, h); c.fillStyle = "#fff"; c.textAlign = "center"; c.textBaseline = "middle";
      c.font = `800 ${Math.min(w, h) * .26}px system-ui, sans-serif`; c.fillText(text, w / 2, h / 2); if (sub){ c.font = `700 ${Math.min(w, h) * .06}px system-ui, sans-serif`; c.fillText(sub, w / 2, h / 2 + Math.min(w, h) * .2); } };
    function frame(now){
      if (dead) return; raf = requestAnimationFrame(frame);
      const dt = Math.min(.034, (now - last) / 1000 || 0); last = now;
      if (!paused){
        if (phase === "count"){ t -= dt; if (Math.ceil(t) < lastTick && t > 0){ lastTick = Math.ceil(t); beep("tick"); } if (t <= 0){ phase = "run"; beep("go"); } }
        else if (phase === "run"){ bots.forEach((i, k) => { const want = think(k, i, dt); if (want && !held[i]) down(i); else if (!want && held[i]) up(i); });
          game.update(dt, held); const r = game.result(); if (r !== null){ winner = r; if (r >= 0) wins[r]++; score(); phase = "end"; t = 1.9; cheer = CHEERS[en ? "en" : "ar"][Math.floor(Math.random() * 8)]; beep(wins.some(x => x >= g.rounds) ? "win" : "go"); } }
        else { t -= dt; if (t <= 0){ const champ = wins.findIndex(x => x >= g.rounds); if (champ >= 0){ stop(); finish(g, champ, bots); return; } round++; newRound(); } }
      }
      c.fillStyle = col.bg; c.fillRect(0, 0, w, h); game.draw(c);
      if (phase === "count") big(String(Math.ceil(t)), g.rounds > 1 ? `${T.round} ${round}` : "");
      else if (phase === "end") big(winner >= 0 ? (bots.includes(winner) ? "🤖" : FACES[winner]) : "🤝", winner >= 0 ? cheer : T.draw);
    }
    function stop(){ dead = true; cancelAnimationFrame(raf); removeEventListener("keydown", kd); removeEventListener("keyup", ku); removeEventListener("resize", onResize); stopPlay = null; }
    const onResize = () => { if (phase === "count") newRound(); };
    addEventListener("resize", onResize);
    stopPlay = stop;
    play.pause = on => { paused = on; root.querySelector(".g-ask").hidden = !on; };
    newRound(); score(); raf = requestAnimationFrame(frame);
  }

  root.addEventListener("click", e => {
    const b = e.target.closest("[data-g]"); if (!b) return;
    switch (b.dataset.g){
      case "close": close(); break;
      case "menu": menu(); break;
      case "pick": { const g = GAMES.find(x => x.id === b.dataset.id); if (!g) break; if (!open(g)){ close(); if (opts.onLocked) opts.onLocked(); break; } setup(g); break; }
      case "n": players = +b.dataset.n; setup(cur); break;
      case "lv": level = +b.dataset.n; try { localStorage.setItem("nw-glvl", String(level)); } catch(e){} setup(cur); break;
      case "sound": try { localStorage.setItem("nw-gsnd", soundOn() ? "0" : "1"); } catch(e){} menu(); beep("tick"); break;
      case "start": if (cur) play(cur, Math.max(2, players), players === 1 ? [1] : []); break;
      case "pause": play.pause(true); break;
      case "resume": play.pause(false); break;
    }
  });
  menu();
}
