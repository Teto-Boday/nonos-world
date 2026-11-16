// Turn-based games inside a chat (partner, friend or group), each person on their own phone.
// Nothing is stored but ordinary chat messages: one "new" message starts a game and every move is another message
// carrying { g: { id, k, t, ... } }. The board is rebuilt by replaying those messages, so both phones always agree
// and a move that isn't allowed (wrong turn, taken square) is simply skipped by everyone.

export const ONLINE = [
  { k:"xo",  e:"❌⭕", free:true, two:true, ar:["إكس أو", "أول واحد يعمل ٣ ورا بعض يكسب."], en:["Tic-tac-toe", "First to get 3 in a row wins."] },
  { k:"c4",  e:"🔴🟡", two:true, ar:["أربعة في صف", "نزّلوا القرص في أي عمود. أول واحد يعمل ٤ ورا بعض يكسب."], en:["Four in a row", "Drop a disc in any column. First to line up 4 wins."] },
  { k:"rps", e:"✊✋✌️", two:true, ar:["حجر ورقة مقص", "كل واحد يختار من غير ما يشوف التاني. أول واحد يكسب جولتين."], en:["Rock paper scissors", "Each of you picks without seeing the other. First to win 2 rounds."] },
  { k:"who", e:"🤔", ar:["مين فينا؟", "١٥ سؤال، وكل واحد يختار مين. وفي الآخر بيقولكم متشابهين في إيه. وتقدروا تقولوا كفاية في أي وقت."], en:["Who's more likely?", "15 questions and everyone picks a person. At the end it shows where you matched. You can stop any time."] },
];
const QUESTIONS = [
  ["بينام أكتر؟", "sleeps more?"], ["بيتأخر دايمًا؟", "is always late?"], ["بياكل أكتر؟", "eats more?"], ["بيضحك على أي حاجة؟", "laughs at anything?"],
  ["بيعيّط في الأفلام؟", "cries at films?"], ["بيصرف فلوس أكتر؟", "spends more money?"], ["بينسى المواعيد؟", "forgets plans?"], ["بيرد على الرسايل متأخر؟", "replies late?"],
  ["أشطر في المطبخ؟", "is the better cook?"], ["بيتعصب بسرعة؟", "gets annoyed faster?"], ["بيصالح الأول؟", "says sorry first?"], ["بيحب الخروج أكتر؟", "likes going out more?"],
  ["بيسهر أكتر؟", "stays up later?"], ["بيخاف من الحشرات؟", "is scared of insects?"], ["بياخد صور أكتر؟", "takes more photos?"], ["صوته أحلى في الغنا؟", "is the better singer?"],
  ["بيتكلم أكتر؟", "talks more?"], ["منظّم أكتر؟", "is more organised?"], ["بيحب المفاجآت أكتر؟", "loves surprises more?"], ["بيزهق بسرعة؟", "gets bored faster?"],
  ["بيحب القهوة أكتر؟", "loves coffee more?"], ["بيعرف يحوّش؟", "is better at saving?"], ["بيضيّع حاجته دايمًا؟", "keeps losing things?"], ["بيصحى بدري؟", "wakes up early?"],
  // new questions go at the end only: a game in an old chat points at these by their place in the list
  ["بيحب الأكل الحراق أكتر؟", "likes spicy food more?"], ["بيمسك الموبايل أكتر؟", "is on the phone more?"], ["بيحكي نكت أحلى؟", "tells better jokes?"], ["بيغيّر رأيه بسرعة؟", "changes their mind faster?"],
  ["بيحب الشتا أكتر؟", "loves winter more?"], ["بيعرف يحفظ السر؟", "is better at keeping a secret?"], ["بيتوتر قبل الامتحان أكتر؟", "gets more nervous before an exam?"], ["بيحب الحلويات أكتر؟", "has the sweeter tooth?"],
  ["بيتفرج على مسلسلات أكتر؟", "watches more series?"], ["بيحب السفر أكتر؟", "loves travelling more?"], ["بيخاف من أفلام الرعب؟", "is scared of horror films?"], ["بيتكسف بسرعة؟", "gets shy faster?"],
  ["بيرتب أوضته أكتر؟", "keeps a tidier room?"], ["بيحب يهادي أكتر؟", "loves giving gifts more?"], ["بيفتكر التواريخ المهمة؟", "remembers important dates?"], ["بيلعب رياضة أكتر؟", "does more sport?"],
  ["بيشرب مية أكتر؟", "drinks more water?"], ["بيجوع بسرعة؟", "gets hungry faster?"], ["عنيد أكتر؟", "is more stubborn?"], ["بيسمع أغاني أكتر؟", "listens to more music?"],
  ["بيحب القطط أكتر؟", "loves cats more?"], ["بيتأثر بكلام الناس أكتر؟", "cares more about what people say?"], ["بيخطط لكل حاجة؟", "plans everything?"], ["بيعمل الحاجة في آخر لحظة؟", "leaves things to the last minute?"],
  ["بيحب يتصور سيلفي أكتر؟", "takes more selfies?"], ["بيذاكر أكتر؟", "studies more?"], ["بيحب البحر أكتر؟", "loves the sea more?"], ["بينسى هو كان بيقول إيه؟", "forgets what they were saying?"],
  ["بيسامح بسرعة؟", "forgives faster?"], ["بيحب يجرّب أكل جديد؟", "likes trying new food?"], ["بيتكلم وهو نايم؟", "talks in their sleep?"], ["بيغني في الحمام؟", "sings in the shower?"],
  ["بيرغي في التليفون أكتر؟", "talks longer on the phone?"], ["بيحب الهدوء أكتر؟", "likes quiet more?"], ["صبره أطول؟", "is more patient?"], ["بيضحك بصوت عالي؟", "laughs louder?"],
];
const WHO_LEN = 15;
const RPS = { r:"✊", p:"✋", s:"✌️" }, BEATS = { r:"s", p:"r", s:"p" };
const LINES3 = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
const rid = () => Math.random().toString(36).slice(2, 10);

/* the message that starts a game. members: { uid: name } of everyone in the chat; pair: a two-person chat */
export function newGame(k, me, members, pair){
  const ids = Object.keys(members), other = ids.find(u => u !== me), g = { id:rid() + rid(), k, t:"new", nm:{} };
  ids.slice(0, 12).forEach(u => { g.nm[u] = String(members[u] || "").slice(0, 20); });
  g.p = pair && other ? [me, other] : [me];
  if (k === "who"){ const pool = QUESTIONS.map((_, i) => i); g.q = []; while (g.q.length < WHO_LEN) g.q.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]); g.o = pair ? g.p.slice() : ids.slice(0, 8); }
  return g;
}

/* replay the chat's messages into the state of every game in it */
export function fold(msgs){
  const games = new Map(), rest = [];
  for (const m of msgs){ const g = m && m.g; if (!g || !g.id) continue;
    if (g.t === "new"){ if (!games.has(g.id)) games.set(g.id, start(g, m)); } else rest.push(m); }
  // joins first, then moves in the order the players numbered them; the clock only breaks ties, so a wrong phone clock can't reorder a game
  const at = m => m.g.t === "join" ? -1 : m.g.t === "stop" ? 1e9 : m.g.n ?? 0; // "that's enough" always comes after the answers
  rest.sort((a, b) => at(a) - at(b) || a.ts - b.ts);
  for (const m of rest){ const s = games.get(m.g.id); if (s) apply(s, m); }
  return games;
}
function start(g, m){
  const s = { id:g.id, k:g.k, p:(g.p || [m.from]).slice(0, 2), nm:Object.assign({}, g.nm), by:m.from, ts:m.ts, n:0, win:null };
  if (g.k === "xo") s.b = Array(9).fill(null);
  else if (g.k === "c4") s.b = Array(42).fill(null);
  else if (g.k === "rps"){ s.pick = {}; s.score = {}; s.log = []; }
  else if (g.k === "who"){ s.q = (g.q || []).filter(i => QUESTIONS[i]).slice(0, 30); s.o = (g.o || s.p).slice(0, 8); s.a = s.q.map(() => ({})); s.p = (g.p || [m.from]).slice(0, 8); s.stop = {}; }
  return s;
}
function apply(s, m){
  const g = m.g, u = m.from;
  if (g.t === "join"){ if (s.k !== "who" && s.p.length < 2 && !s.p.includes(u)){ s.p.push(u); s.nm[u] = String(m.name || s.nm[u] || "").slice(0, 20); } return; }
  // "that's enough": in a two-person chat it ends the questions for both, in a group only for the one who tapped it
  if (g.t === "stop"){ if (s.k === "who" && !(s.o.length === 2 && !s.o.includes(u))) s.stop[u] = true; return; }
  if (g.t !== "move" || s.win) return;
  if (s.k === "xo" || s.k === "c4"){
    if (s.p.length < 2 || g.n !== s.n || u !== s.p[s.n % 2]) return;
    let at = -1;
    if (s.k === "xo"){ if (!(g.m >= 0 && g.m < 9) || s.b[g.m] !== null) return; at = g.m; }
    else { if (!(g.m >= 0 && g.m < 7)) return; for (let r = 5; r >= 0; r--) if (s.b[r * 7 + g.m] === null){ at = r * 7 + g.m; break; } if (at < 0) return; }
    s.b[at] = s.n % 2; s.n++; s.last = at;
    const line = s.k === "xo" ? LINES3.find(l => l.every(i => s.b[i] === s.b[at])) : four(s.b, at);
    if (line){ s.win = u; s.line = line; } else if (s.b.every(x => x !== null)) s.win = "draw";
  } else if (s.k === "rps"){
    if (s.p.length < 2 || !s.p.includes(u) || g.n !== s.n || !RPS[g.m] || s.pick[u]) return;
    s.pick[u] = g.m;
    const [a, b] = s.p; if (!s.pick[a] || !s.pick[b]) return;
    const w = s.pick[a] === s.pick[b] ? null : BEATS[s.pick[a]] === s.pick[b] ? a : b;
    s.log.push({ [a]:s.pick[a], [b]:s.pick[b], w }); if (w) s.score[w] = (s.score[w] || 0) + 1;
    s.pick = {}; s.n++; if (w && s.score[w] >= 2) s.win = w; else if (s.n >= 9) s.win = "draw";
  } else if (s.k === "who"){
    const i = g.n; if (!(i >= 0 && i < s.q.length) || !s.o.includes(g.m) || s.a[i][u] || whoOver(s, u)) return;
    if (s.p.length === 2 && s.o.length === 2 && !s.p.includes(u)) return;
    s.a[i][u] = g.m;
  }
}
function four(b, at){
  const r0 = Math.floor(at / 7), c0 = at % 7, v = b[at];
  for (const [dr, dc] of [[0, 1], [1, 0], [1, 1], [1, -1]]){
    const line = [at];
    for (const sgn of [1, -1]) for (let k = 1; k < 4; k++){ const r = r0 + dr * k * sgn, c = c0 + dc * k * sgn; if (r < 0 || r > 5 || c < 0 || c > 6 || b[r * 7 + c] !== v) break; line.push(r * 7 + c); }
    if (line.length >= 4) return line;
  }
  return null;
}

/* what a tap on the card should send, or null when that tap isn't allowed right now */
export function action(s, me, what, arg){
  if (!s) return null;
  const base = { id:s.id, k:s.k };
  if (what === "stop") return s.k === "who" && whoAt(s, me) > 0 && whoAt(s, me) < s.q.length ? Object.assign(base, { t:"stop" }) : null;
  if (what === "join") return s.k !== "who" && s.p.length < 2 && !s.p.includes(me) ? Object.assign(base, { t:"join" }) : null;
  if (s.win) return null;
  const m = Number.isNaN(+arg) ? arg : +arg;
  if (s.k === "xo") return s.p.length === 2 && s.p[s.n % 2] === me && s.b[m] === null ? Object.assign(base, { t:"move", n:s.n, m }) : null;
  if (s.k === "c4") return s.p.length === 2 && s.p[s.n % 2] === me && s.b[m] === null ? Object.assign(base, { t:"move", n:s.n, m }) : null;
  if (s.k === "rps") return s.p.includes(me) && !s.pick[me] && RPS[arg] ? Object.assign(base, { t:"move", n:s.n, m:arg }) : null;
  if (s.k === "who"){ const i = whoAt(s, me); return i < s.q.length && s.o.includes(arg) ? Object.assign(base, { t:"move", n:i, m:arg }) : null; }
  return null;
}
const whoOver = (s, me) => !!s.stop[me] || (s.o.length === 2 && Object.keys(s.stop).length > 0);
const whoAt = (s, me) => { if (whoOver(s, me)) return s.q.length; let i = 0; while (i < s.q.length && s.a[i][me]) i++; return i; };
export const myTurn = (s, me) => !s.win && ((s.k === "xo" || s.k === "c4") ? s.p.length === 2 && s.p[s.n % 2] === me : s.k === "rps" ? s.p.includes(me) && !s.pick[me] : whoAt(s, me) < s.q.length);

/* the card shown in the chat where the game was started. lang: "en", "f" or "m" (who is looking at it) */
export function card(s, me, lang, escHtml){
  // every piece of text is fenced with the app's "leave as is" marks, so its automatic rewording never touches a card
  const K = t => "" + t + "", T = (f, m, e) => K(lang === "en" ? e : lang === "m" ? m : f), en = lang === "en";
  const def = ONLINE.find(x => x.k === s.k) || ONLINE[0], name = u => u === me ? T("إنتي", "إنت", "You") : K(escHtml(s.nm[u] || (en ? "Player" : "لاعب")));
  const btn = (arg, inner, cls = "", off = false) => `<button type="button" class="og-b ${cls}" data-act="og" data-v="${s.id}:move:${arg}"${off ? " disabled" : ""}>${inner}</button>`;
  const q = k => K(escHtml(QUESTIONS[s.q[k]][en ? 1 : 0])), whoIs = T("مين فينا", "مين فينا", "Who"), winner = () => `${T("الفايز", "الفايز", "Winner")}: ${name(s.win)} 🎉`, drawn = T("تعادل 🤝", "تعادل 🤝", "Draw 🤝");
  let body = "", status = "";
  if (def.two && s.p.length < 2){
    status = s.p.includes(me) ? T("مستنيين حد يدخل يلعب", "مستنيين حد يدخل يلعب", "Waiting for someone to join") : `<button type="button" class="btn small" data-act="og" data-v="${s.id}:join:">${T("ادخلي العبي", "ادخل العب", "Join the game")}</button>`;
  } else if (s.k === "xo" || s.k === "c4"){
    const mine = s.p[s.n % 2] === me && !s.win, mark = v => s.k === "xo" ? (v === 0 ? "❌" : v === 1 ? "⭕" : "") : (v === 0 ? "🔴" : v === 1 ? "🟡" : "");
    body = `<div class="og-grid og-${s.k}">${s.b.map((v, i) => btn(s.k === "xo" ? i : i % 7, mark(v), (s.line && s.line.includes(i) ? "win " : "") + (i === s.last ? "last" : ""), !mine || (s.k === "xo" ? v !== null : s.b[i % 7] !== null))).join("")}</div>`;
    status = s.win === "draw" ? drawn : s.win ? winner() : mine ? `${T("دورك", "دورك", "Your turn")} ${mark(s.n % 2)}` : `${T("الدور على", "الدور على", "Waiting for")} ${name(s.p[s.n % 2])} ${mark(s.n % 2)}`;
  } else if (s.k === "rps"){
    const [a, b] = s.p, last = s.log[s.log.length - 1], inGame = s.p.includes(me);
    body = `<div class="og-score">${name(a)} <b>${s.score[a] || 0}</b> : <b>${s.score[b] || 0}</b> ${name(b)}</div>`
      + (last ? `<div class="og-last">${name(a)} ${RPS[last[a]]} · ${RPS[last[b]]} ${name(b)}${last.w ? "" : " · " + T("تعادل", "تعادل", "draw")}</div>` : "")
      + (!s.win && inGame && !s.pick[me] ? `<div class="og-row">${Object.keys(RPS).map(k => btn(k, RPS[k], "big")).join("")}</div>` : "");
    status = s.win === "draw" ? drawn : s.win ? winner() : inGame && s.pick[me] ? `${T("اخترتي. مستنيين", "اخترت. مستنيين", "You picked. Waiting for")} ${name(s.p.find(u => u !== me))}` : inGame ? T("اختاري", "اختار", "Pick one") : T("بيلعبوا…", "بيلعبوا…", "Playing…");
  } else if (s.k === "who"){
    const i = whoAt(s, me), total = s.q.length, voters = k => Object.keys(s.a[k]).length;
    const result = k => { const tally = {}; Object.values(s.a[k]).forEach(u => { tally[u] = (tally[u] || 0) + 1; });
      return `<div class="og-last">${whoIs} ${q(k)} ${Object.entries(tally).sort((x, y) => y[1] - x[1]).map(([u, c]) => `${name(u)} <b>${c}</b>`).join(" · ")}</div>`; };
    if (i < total){
      body = (i > 0 && voters(i - 1) > 1 ? result(i - 1) : "") + `<div class="og-q"><small>${i + 1} / ${total}</small>${whoIs} ${q(i)}</div><div class="og-row wrap">${s.o.map(u => btn(u, name(u), "txt")).join("")}</div>`
        + (i > 0 ? `<button type="button" class="btn ghost small" data-act="og" data-v="${s.id}:stop:">${T("كفاية كده", "كفاية كده", "That's enough")}</button>` : "");
      status = T("اختاري", "اختار", "Pick one");
    } else {
      // the ending: what everyone agreed on, and (in a group) who answered most like you
      const done = s.q.map((_, k) => k).filter(k => voters(k) > 1), same = done.filter(k => new Set(Object.values(s.a[k])).size === 1);
      body = same.length ? `<div class="og-same"><b>${T("اتفقتوا على", "اتفقتوا على", "You all agreed on")}</b>${same.map(k => `<div>✅ ${whoIs} ${q(k)} ${name(Object.values(s.a[k])[0])}</div>`).join("")}</div>` : "";
      if (s.o.length > 2){
        const like = {}; done.forEach(k => { const mine = s.a[k][me]; if (!mine) return; Object.entries(s.a[k]).forEach(([u, v]) => { if (u === me) return; like[u] = like[u] || [0, 0]; like[u][1]++; if (v === mine) like[u][0]++; }); });
        const rank = Object.entries(like).sort((x, y) => y[1][0] / y[1][1] - x[1][0] / x[1][1] || y[1][1] - x[1][1]);
        if (rank.length) body += `<div class="og-same"><b>${T("أكتر ناس شبهك", "أكتر ناس شبهك", "Most like you")}</b>${rank.slice(0, 5).map(([u, [a, b]], n) => `<div>${n === 0 ? "🥇" : "•"} ${name(u)} · <b>${a}</b> ${T("من", "من", "of")} <b>${b}</b></div>`).join("")}</div>`;
      }
      status = done.length ? `${T("متشابهين في", "متشابهين في", "You matched on")} <b>${same.length}</b> ${T("من", "من", "of")} <b>${done.length}</b>` : T("خلصتي. مستنيين الباقي يجاوب", "خلصت. مستنيين الباقي يجاوب", "Done. Waiting for the others to answer");
    }
  }
  const over = s.win || (s.k === "who" && whoAt(s, me) >= s.q.length);
  return `<div class="og-card"><div class="og-h"><span>${def.e}</span><b>${K(en ? def.en[0] : def.ar[0])}</b></div>${body}<div class="og-s">${status}</div>${over ? `<button type="button" class="btn ghost small" data-act="og-new" data-v="${s.k}">🔁 ${T("كمان مرة", "كمان مرة", "Play again")}</button>` : ""}</div>`;
}
