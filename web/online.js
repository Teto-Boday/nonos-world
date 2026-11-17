// Turn-based games inside a chat (partner, friend or group), each person on their own phone.
// Nothing is stored but ordinary chat messages: one "new" message starts a game and every move is another message
// carrying { g: { id, k, t, ... } }. The board is rebuilt by replaying those messages, so both phones always agree
// and a move that isn't allowed (wrong turn, taken square) is simply skipped by everyone.

export const ONLINE = [
  { k:"xo",  e:"❌⭕", free:true, two:true, ar:["إكس أو", "أول واحد يعمل ٣ ورا بعض يكسب."], en:["Tic-tac-toe", "First to get 3 in a row wins."] },
  { k:"c4",  e:"🔴🟡", two:true, ar:["أربعة في صف", "نزّلوا القرص في أي عمود. أول واحد يعمل ٤ ورا بعض يكسب."], en:["Four in a row", "Drop a disc in any column. First to line up 4 wins."] },
  { k:"rps", e:"✊✋✌️", two:true, ar:["حجر ورقة مقص", "كل واحد يختار من غير ما يشوف التاني. أول واحد يكسب جولتين."], en:["Rock paper scissors", "Each of you picks without seeing the other. First to win 2 rounds."] },
  { k:"tod", e:"🎭", free:true, ar:["صراحة ولا جرأة", "كل واحد يختار صراحة أو جرأة ويكتب إجابته جوه اللعبة، والإجابات بتظهر لما الكل يجاوب."], en:["Truth or dare", "Each of you picks truth or dare and writes the answer inside the game. Answers show once everyone has answered."] },
  { k:"mem", e:"🧠", two:true, ar:["الذاكرة", "اقلبوا كارتين في كل دور. اللي يلاقي اتنين زي بعض ياخد نقطة ويلعب تاني."], en:["Memory", "Flip two cards each turn. Find a pair to score a point and go again."] },
  { k:"wyr", e:"⚖️", ar:["لو خيّروك", "١٢ سؤال، وكل واحد يختار بين حاجتين. وفي الآخر بيقولكم متشابهين في إيه."], en:["Would you rather", "12 questions with two choices each. At the end it shows where you matched."] },
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
const WHO_LEN = 15, WYR_LEN = 12;
// [first choice, second choice] in Arabic then English; new ones at the end only.
// The Arabic here avoids verbs said to "you", so the same words suit a girl or a boy
const RATHER = [
  ["سفرية بحر", "سفرية جبل", "a beach trip", "a mountain trip"], ["قهوة", "شاي", "coffee", "tea"], ["السهر", "الصحيان بدري", "stay up late", "wake up early"], ["بيتزا", "برجر", "pizza", "burger"],
  ["صيف على طول", "شتا على طول", "summer forever", "winter forever"], ["فيلم في البيت", "خروجة برّه", "a film at home", "a night out"], ["قطة", "كلب", "a cat", "a dog"], ["قراية أفكار الناس", "الاختفاء", "read minds", "be invisible"],
  ["حلو", "حادق", "sweet", "savoury"], ["كل اللغات", "كل الآلات الموسيقية", "speak every language", "play every instrument"], ["عيشة المدينة", "عيشة الريف", "live in the city", "live in the countryside"], ["مكالمة", "رسالة", "a call", "a text"],
  ["رجوع للماضي", "سفر للمستقبل", "go back to the past", "jump to the future"], ["أكل بيتي", "أكل برّه", "home cooking", "eating out"], ["الطيران", "التنفس تحت المية", "fly", "breathe underwater"], ["شوكولاتة", "آيس كريم", "chocolate", "ice cream"],
  ["مفاجأة", "خطة معروفة", "a surprise", "a set plan"], ["كتاب", "مسلسل", "a book", "a series"], ["هدية غالية", "هدية معمولة بالإيد", "an expensive gift", "a handmade gift"], ["أسبوع من غير موبايل", "أسبوع من غير حلويات", "a week with no phone", "a week with no sweets"],
  ["عربية", "موتوسيكل", "a car", "a motorbike"], ["الغنا قدام الناس", "الرقص قدام الناس", "sing in front of people", "dance in front of people"], ["نفس الأكلة سنة", "نفس الأغنية سنة", "eat the same meal for a year", "hear the same song for a year"], ["فطار تقيل", "عشا تقيل", "a big breakfast", "a big dinner"],
  ["شغل على مزاجك بمرتب قليل", "شغل ممل بمرتب كبير", "a job you love for less pay", "a dull job for more pay"], ["بيت صغير على البحر", "بيت كبير في المدينة", "a small house by the sea", "a big house in the city"], ["معرفة كل حاجة", "نسيان كل حاجة وحشة", "know everything", "forget everything bad"], ["مطر", "شمس", "rain", "sunshine"],
  ["صحاب كتير", "صاحب واحد قريب", "lots of friends", "one close friend"], ["شهرة", "غنى من غير شهرة", "be famous", "be rich and unknown"],
];
const TRUTHS = [
  ["إيه أكتر حاجة بتضحّكك؟", "What makes you laugh most?"], ["آخر حاجة اتبحث عنها على النت من موبايلك؟", "What was the last thing you searched for?"], ["أكلة الكل بيحبها ومش على مزاجك؟", "What food does everyone love but you?"], ["أغرب حلم جالك؟", "What's the strangest dream you've had?"],
  ["حاجة بتخوّفك ومحدش يعرف؟", "What scares you that you don't admit?"], ["آخر مكالمة في موبايلك كانت مع مين؟", "Who did you last speak to on the phone?"], ["أكتر تطبيق مفتوح على موبايلك؟", "Which app do you open most?"], ["أحرج موقف حصلك؟", "What's your most embarrassing moment?"],
  ["لقبك أيام الطفولة كان إيه؟", "What nickname did you have as a kid?"], ["أول حاجة في يومك بعد الصحيان؟", "What's the first thing you do when you wake up?"], ["مهارة نفسك تبقى عندك؟", "What do you wish you could learn?"], ["أكتر حاجة بتضايقك من الناس؟", "What annoys you most about people?"],
  ["أغنية بتتسمع في السر عندك؟", "What song do you listen to in secret?"], ["أحلى يوم في حياتك؟", "What was the best day of your life?"], ["لو معاك مليون جنيه دلوقتي، أول حاجة هتتجاب إيه؟", "What would you do with a million right now?"], ["أكتر مشترى مالوش لازمة عندك؟", "What do you regret buying?"],
  ["مين أكتر حد بيفهمك؟", "Who understands you best?"], ["أكتر حاجة بتعجبك في نفسك؟", "What do you like most about yourself?"], ["عادة وحشة عندك؟", "What's a bad habit of yours?"], ["بلد أحلامك للسفر؟", "Which country do you want to visit?"],
  ["آخر مرة دموعك نزلت كانت ليه؟", "When did you last cry, and why?"], ["حاجة بتحصل منك لما محدش شايف؟", "What do you do when nobody's watching?"], ["أكتر كذبة بيضا على لسانك؟", "What white lie do you tell most?"], ["الممثل أو المغني المفضل عندك؟", "Who's your favourite actor or singer?"],
];
const DARES = [
  ["اسمك مكتوب بالمقلوب", "Type your name backwards"], ["٥ إيموجي بيوصفوا يومك", "Send 5 emojis that describe your day"], ["نكتة، ولو محدش ضحك نكتة تانية", "Tell a joke. If nobody laughs, tell another"], ["أحلى حاجة في كل واحد هنا", "Say the best thing about everyone here"],
  ["رسالة كاملة من غير نقط", "Write a message with no dots on the letters"], ["أول ٣ كلمات تيجي في بالك", "Type the first 3 words that come to mind"], ["وصف نفسك في تلات كلمات بس", "Describe yourself in exactly three words"], ["بيت شعر تأليف اللحظة", "Make up a two-line poem right now"],
  ["الخمس رسايل الجايين بالفصحى", "Talk like a news reader for your next five messages"], ["رسايلك كلها إيموجي بس لمدة دقيقتين", "Use only emojis for the next two minutes"], ["موقف مضحك حصلك الأسبوع ده", "Tell a funny thing that happened to you this week"], ["أكلة على كل حرف من اسمك", "Name a food for each letter of your name"],
  ["مدح مبالغ فيه للي قبلك", "Praise the person before you in a way-over-the-top way"], ["إعلان بيبيع الشبشب بتاعك", "Write an advert selling your slippers"], ["سر صغير محدش يعرفه", "Share a small secret nobody knows"], ["أغنية من سطرين عن الأكل", "Write a two-line song about food"],
  ["رسالة مكتوبة بالإيد التانية زي ما تطلع", "Type with your other hand and send whatever comes out"], ["٣ حاجات هتحصل بكرة في يومك", "List 3 things you'll do tomorrow"], ["نشرة أخبار عن الشات ده بأسلوب مذيع", "Be a presenter and report the news about this chat"], ["شكر لحد هنا على حاجة", "Pick someone and thank them for something"],
  ["وصف شكلك ساعة الصحيان", "Describe how you look right after waking up"], ["آخر إيموجي عندك، ٧ مرات", "Send the last emoji you used, 7 times"], ["قصة من ٣ سطور فيها قطة وبيتزا", "Write a 3-line story with a cat and a pizza"], ["أكتر كلمة على لسانك طول اليوم", "Type the word you say most each day"],
];
const DECK = ["🍓", "🌙", "🐱", "🎈", "🍕", "⭐", "🌸", "🎵"];
const RPS = { r:"✊", p:"✋", s:"✌️" }, BEATS = { r:"s", p:"r", s:"p" };
const LINES3 = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
const rid = () => Math.random().toString(36).slice(2, 10);

/* the message that starts a game. members: { uid: name } of everyone in the chat; pair: a two-person chat */
export function newGame(k, me, members, pair){
  // truth or dare v2: answers are written inside the game
  const ids = Object.keys(members), other = ids.find(u => u !== me), g = { id:rid() + rid(), k, t:"new", nm:{} };
  ids.slice(0, 12).forEach(u => { g.nm[u] = String(members[u] || "").slice(0, 20); });
  g.p = pair && other ? [me, other] : [me];
  const draw = (from, count) => { const pool = from.map((_, i) => i), out = []; while (out.length < count && pool.length) out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]); return out; };
  if (k === "who"){ g.q = draw(QUESTIONS, WHO_LEN); g.o = pair ? g.p.slice() : ids.slice(0, 8); }
  else if (k === "wyr") g.q = draw(RATHER, WYR_LEN);
  else if (k === "mem") g.d = draw(Array(16).fill(0), 16);
  else if (k === "tod") g.v = 2; // the 16 places shuffled; place i holds DECK[d[i] >> 1]
  return g;
}

/* replay the chat's messages into the state of every game in it */
export function fold(msgs){
  const games = new Map(), rest = [];
  for (const m of msgs){ const g = m && m.g; if (!g || !g.id) continue;
    if (g.t === "new"){ if (!games.has(g.id)) games.set(g.id, start(g, m)); } else rest.push(m); }
  // joins first, then moves in the order the players numbered them; the clock only breaks ties, so a wrong phone clock can't reorder a game
  // "that's enough" always comes after the answers; in truth or dare a round's picks come first, then its answers, then "next round"
  const at = m => m.g.t === "join" ? -1 : m.g.t === "end" ? 2e9 : m.g.t === "stop" ? 1e9 : (m.g.n ?? 0) + (m.g.t === "ans" ? .4 : m.g.t === "next" ? .8 : 0);
  rest.sort((a, b) => at(a) - at(b) || a.ts - b.ts);
  for (const m of rest){ const s = games.get(m.g.id); if (s) apply(s, m); }
  return games;
}
function start(g, m){
  const s = { id:g.id, k:g.k, p:(g.p || [m.from]).slice(0, 2), nm:Object.assign({}, g.nm), by:m.from, ts:m.ts, n:0, win:null };
  if (g.k === "xo") s.b = Array(9).fill(null);
  else if (g.k === "c4") s.b = Array(42).fill(null);
  else if (g.k === "rps"){ s.pick = {}; s.score = {}; s.log = []; }
  else if (g.k === "who" || g.k === "wyr"){ const list = g.k === "who" ? QUESTIONS : RATHER; s.duo = s.p.length === 2; s.q = (g.q || []).filter(i => list[i]).slice(0, 30); s.o = g.k === "wyr" ? ["a", "b"] : (g.o || s.p).slice(0, 8); s.a = s.q.map(() => ({})); s.stop = {}; }
  else if (g.k === "mem"){ const d = Array.isArray(g.d) && g.d.length === 16 && new Set(g.d).size === 16 && g.d.every(x => x >= 0 && x < 16) ? g.d : Array.from({ length:16 }, (_, i) => i); s.d = d.map(x => DECK[x >> 1]); s.found = []; s.open = []; s.peek = null; s.turn = 0; s.score = {}; }
  else if (g.k === "tod"){ s.v2 = g.v === 2; s.r = 0; s.pick = {}; s.ans = {}; s.pair = (g.p || []).length === 2; } // round r: who picked what, and their answers
  return s;
}
function apply(s, m){
  const g = m.g, u = m.from;
  if (s.ended) return;
  // "end the game": whoever started it or is playing in it can close it, so nobody is stuck waiting for a game that won't finish
  if (g.t === "end"){ if (u === s.by || (s.p || []).includes(u)) s.ended = true; return; }
  if (g.t === "join"){ if (two(s.k) && s.p.length < 2 && !s.p.includes(u)){ s.p.push(u); s.nm[u] = String(m.name || s.nm[u] || "").slice(0, 20); } return; }
  // "that's enough": in a two-person chat it ends the questions for both, in a group only for the one who tapped it
  if (g.t === "stop"){ if (poll(s.k) && !(s.duo && !s.p.includes(u))) s.stop[u] = true; return; }
  if ((g.t !== "move" && !(s.k === "tod" && (g.t === "ans" || g.t === "next"))) || s.win) return;
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
  } else if (poll(s.k)){
    const i = g.n; if (!(i >= 0 && i < s.q.length) || !s.o.includes(g.m) || s.a[i][u] || whoOver(s, u)) return;
    if (s.duo && !s.p.includes(u)) return;
    s.a[i][u] = g.m;
  } else if (s.k === "mem"){
    const i = g.m; if (s.p.length < 2 || g.n !== s.n || u !== s.p[s.turn] || !(i >= 0 && i < 16) || s.found.includes(i) || s.open.includes(i)) return;
    s.n++; s.peek = null;
    if (!s.open.length){ s.open = [i]; return; }
    const a = s.open[0]; s.open = [];
    if (s.d[a] === s.d[i]){ s.found.push(a, i); s.score[u] = (s.score[u] || 0) + 1;
      if (s.found.length === 16){ const [x, y] = s.p, sx = s.score[x] || 0, sy = s.score[y] || 0; s.win = sx === sy ? "draw" : sx > sy ? x : y; } }
    else { s.peek = [a, i]; s.turn = 1 - s.turn; } // a miss stays face up until the next flip, then the turn passes
  } else if (s.k === "tod"){
    if (!s.v2 || g.n !== s.r) return;
    if (s.pair && !s.p.includes(u)) return;
    if (g.t === "move"){ const list = g.m === "t" ? TRUTHS : g.m === "d" ? DARES : null; if (!list || !(g.i >= 0 && g.i < list.length) || s.pick[u] || todOpen(s)) return;
      s.pick[u] = { m:g.m, i:g.i }; s.nm[u] = s.nm[u] || String(m.name || "").slice(0, 20); }
    else if (g.t === "ans"){ if (!s.pick[u] || s.ans[u] != null || typeof g.a !== "string") return; const a = g.a.trim().slice(0, 300); if (a) s.ans[u] = a; }
    else if (g.t === "next"){ if (todOpen(s)){ s.r++; s.pick = {}; s.ans = {}; } }
  }
}
// a truth-or-dare round opens once everyone who has to answer has answered: both people in a two-person chat, or (in a group) at least two and everyone who picked
/* is the game over? a winner or a draw, ended by a player, or (question games) everyone in a two-person chat is done, or in a group the one who started it is done */
export function gameOver(s){
  if (!s) return true;
  if (s.win || s.ended) return true;
  if (poll(s.k)) return s.duo ? s.p.every(u => whoAt(s, u) >= s.q.length) : whoAt(s, s.by) >= s.q.length;
  return false;
}
export const todOpen = s => { const who = s.pair ? s.p : Object.keys(s.pick); return who.length >= 2 && who.every(u => s.ans[u] != null); };
const two = k => !!(ONLINE.find(x => x.k === k) || {}).two, poll = k => k === "who" || k === "wyr";
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
  if (s.ended) return null;
  if (what === "end") return !gameOver(s) && (me === s.by || (s.p || []).includes(me)) ? Object.assign(base, { t:"end" }) : null;
  if (what === "stop") return poll(s.k) && whoAt(s, me) > 0 && whoAt(s, me) < s.q.length ? Object.assign(base, { t:"stop" }) : null;
  if (what === "join") return two(s.k) && s.p.length < 2 && !s.p.includes(me) ? Object.assign(base, { t:"join" }) : null;
  if (s.win) return null;
  const m = Number.isNaN(+arg) ? arg : +arg;
  if (s.k === "xo") return s.p.length === 2 && s.p[s.n % 2] === me && s.b[m] === null ? Object.assign(base, { t:"move", n:s.n, m }) : null;
  if (s.k === "c4") return s.p.length === 2 && s.p[s.n % 2] === me && s.b[m] === null ? Object.assign(base, { t:"move", n:s.n, m }) : null;
  if (s.k === "rps") return s.p.includes(me) && !s.pick[me] && RPS[arg] ? Object.assign(base, { t:"move", n:s.n, m:arg }) : null;
  if (poll(s.k)){ const i = whoAt(s, me); return i < s.q.length && s.o.includes(arg) && !(s.duo && !s.p.includes(me)) ? Object.assign(base, { t:"move", n:i, m:arg }) : null; }
  if (s.k === "mem") return s.p.length === 2 && s.p[s.turn] === me && m >= 0 && m < 16 && !s.found.includes(m) && !s.open.includes(m) ? Object.assign(base, { t:"move", n:s.n, m }) : null;
  if (s.k === "tod"){
    if (!s.v2 || (s.pair && !s.p.includes(me))) return null;
    if (what === "next") return todOpen(s) ? Object.assign(base, { t:"next", n:s.r }) : null;
    if (what === "ans") return s.pick[me] && s.ans[me] == null && String(arg || "").trim() ? Object.assign(base, { t:"ans", n:s.r, a:String(arg).trim().slice(0, 300) }) : null;
    return (arg === "t" || arg === "d") && !s.pick[me] && !todOpen(s) ? Object.assign(base, { t:"move", n:s.r, m:arg, i:Math.floor(Math.random() * (arg === "t" ? TRUTHS : DARES).length) }) : null;
  }
  return null;
}
const whoOver = (s, me) => !!s.stop[me] || (s.duo && Object.keys(s.stop).length > 0);
const whoAt = (s, me) => { if (whoOver(s, me)) return s.q.length; let i = 0; while (i < s.q.length && s.a[i][me]) i++; return i; };
export const myTurn = (s, me) => !s.win && ((s.k === "xo" || s.k === "c4") ? s.p.length === 2 && s.p[s.n % 2] === me : s.k === "mem" ? s.p.length === 2 && s.p[s.turn] === me : s.k === "rps" ? s.p.includes(me) && !s.pick[me] : s.k === "tod" ? (s.v2 && !todOpen(s) && (!s.pick[me] || s.ans[me] == null)) : whoAt(s, me) < s.q.length);

/* the card shown in the chat where the game was started. lang: "en", "f" or "m" (who is looking at it) */
export function card(s, me, lang, escHtml, draft){
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
  } else if (poll(s.k)){
    const rather = s.k === "wyr", i = whoAt(s, me), total = s.q.length, voters = k => Object.keys(s.a[k]).length;
    // "who" answers are people; "would you rather" answers are one of two things
    const opt = (k, v) => rather ? K(escHtml(RATHER[s.q[k]][(en ? 2 : 0) + (v === "b" ? 1 : 0)])) : name(v);
    const ask = k => rather ? T("لو خيّروك", "لو خيّروك", "Would you rather") : `${whoIs} ${q(k)}`;
    const result = k => { const tally = {}; Object.values(s.a[k]).forEach(v => { tally[v] = (tally[v] || 0) + 1; });
      return `<div class="og-last">${rather ? "" : ask(k) + " "}${Object.entries(tally).sort((x, y) => y[1] - x[1]).map(([v, c]) => `${opt(k, v)} <b>${c}</b>`).join(" · ")}</div>`; };
    if (i < total){
      body = (i > 0 && voters(i - 1) > 1 ? result(i - 1) : "") + `<div class="og-q"><small>${i + 1} / ${total}</small>${ask(i)}</div><div class="og-row wrap">${s.o.map(v => btn(v, opt(i, v), "txt")).join("")}</div>`
        + (i > 0 ? `<button type="button" class="btn ghost small" data-act="og" data-v="${s.id}:stop:">${T("كفاية كده", "كفاية كده", "That's enough")}</button>` : "");
      status = T("اختاري", "اختار", "Pick one");
    } else {
      // the ending: what everyone agreed on, and (in a group) who answered most like you
      const done = s.q.map((_, k) => k).filter(k => voters(k) > 1), same = done.filter(k => new Set(Object.values(s.a[k])).size === 1);
      body = same.length ? `<div class="og-same"><b>${T("اتفقتوا على", "اتفقتوا على", "You all agreed on")}</b>${same.map(k => `<div>✅ ${rather ? "" : ask(k) + " "}${opt(k, Object.values(s.a[k])[0])}</div>`).join("")}</div>` : "";
      if (!s.duo){
        const like = {}; done.forEach(k => { const mine = s.a[k][me]; if (!mine) return; Object.entries(s.a[k]).forEach(([u, v]) => { if (u === me) return; like[u] = like[u] || [0, 0]; like[u][1]++; if (v === mine) like[u][0]++; }); });
        const rank = Object.entries(like).sort((x, y) => y[1][0] / y[1][1] - x[1][0] / x[1][1] || y[1][1] - x[1][1]);
        if (rank.length) body += `<div class="og-same"><b>${T("أكتر ناس شبهك", "أكتر ناس شبهك", "Most like you")}</b>${rank.slice(0, 5).map(([u, [a, b]], n) => `<div>${n === 0 ? "🥇" : "•"} ${name(u)} · <b>${a}</b> ${T("من", "من", "of")} <b>${b}</b></div>`).join("")}</div>`;
      }
      status = done.length ? `${T("متشابهين في", "متشابهين في", "You matched on")} <b>${same.length}</b> ${T("من", "من", "of")} <b>${done.length}</b>` : T("خلصتي. مستنيين الباقي يجاوب", "خلصت. مستنيين الباقي يجاوب", "Done. Waiting for the others to answer");
    }
  } else if (s.k === "mem"){
    const [a, b] = s.p, mine = s.p[s.turn] === me && !s.win, up = i => s.found.includes(i) || s.open.includes(i) || (s.peek && s.peek.includes(i));
    body = `<div class="og-score">${name(a)} <b>${s.score[a] || 0}</b> : <b>${s.score[b] || 0}</b> ${name(b)}</div><div class="og-grid og-mem">${s.d.map((e, i) => btn(i, up(i) ? e : "❔", (s.found.includes(i) ? "win " : "") + (s.peek && s.peek.includes(i) ? "last" : ""), !mine || s.found.includes(i) || s.open.includes(i))).join("")}</div>`;
    status = s.win === "draw" ? drawn : s.win ? winner() : mine ? T("دورك، اقلبي كارت", "دورك، اقلب كارت", "Your turn, flip a card") : `${T("الدور على", "الدور على", "Waiting for")} ${name(s.p[s.turn])}`;
  } else if (s.k === "tod"){
    const kind = m => m === "t" ? "🗣️ " + T("صراحة", "صراحة", "Truth") : "🔥 " + T("جرأة", "جرأة", "Dare");
    const prompt = p => K(escHtml((p.m === "t" ? TRUTHS : DARES)[p.i][en ? 1 : 0]));
    const mine = s.pick[me], open = todOpen(s), inGame = !s.pair || s.p.includes(me);
    if (!s.v2){ body = ""; status = T("دي نسخة قديمة من اللعبة، ابدأوا واحدة جديدة", "دي نسخة قديمة من اللعبة، ابدأوا واحدة جديدة", "This is an old version of the game. Start a new one"); }
    else if (open){
      // everyone answered: show every question with its answer
      body = `<div class="og-q"><small>${T("الجولة", "الجولة", "Round")} ${s.r + 1}</small></div>` + Object.keys(s.pick).map(u => `<div class="og-same"><b>${name(u)} · ${kind(s.pick[u].m)}</b><div>${prompt(s.pick[u])}</div><div class="og-ans">${K(escHtml(s.ans[u]))}</div></div>`).join("")
        + (inGame ? btn("", "🔄 " + T("جولة جديدة", "جولة جديدة", "Next round"), "txt next").replace(":move:", ":next:") : "");
      status = T("كل الإجابات ظهرت 🎉", "كل الإجابات ظهرت 🎉", "All the answers are in 🎉");
    } else {
      // the other person may be a girl or a boy, so this line has no verb: name · pick · ✅ answered / ✍️ still writing
      const others = Object.keys(s.pick).filter(u => u !== me).map(u => `<div class="og-last">${name(u)} · ${kind(s.pick[u].m)} · ${s.ans[u] != null ? "✅" : "✍️…"}</div>`).join("");
      if (!inGame) body = others;
      else if (!mine) body = `<div class="og-q"><small>${T("الجولة", "الجولة", "Round")} ${s.r + 1}</small>${T("تختاري إيه؟", "تختار إيه؟", "Your pick?")}</div><div class="og-row">${btn("t", kind("t"), "txt")}${btn("d", kind("d"), "txt")}</div>` + others;
      else if (s.ans[me] == null) body = `<div class="og-q"><small>${kind(mine.m)}</small>${prompt(mine)}</div>
        <textarea class="in og-in" id="oga-${s.id}" rows="2" maxlength="300" placeholder="${T("اكتبي إجابتك هنا…", "اكتب إجابتك هنا…", "Write your answer here…")}">${escHtml(draft || "")}</textarea>${btn("", T("ابعتي ✓", "ابعت ✓", "Send ✓"), "txt").replace(":move:", ":ans:")}` + others;
      else body = `<div class="og-q"><small>${kind(mine.m)}</small>${prompt(mine)}</div><div class="og-ans">${K(escHtml(s.ans[me]))}</div>` + others;
      const wait = (s.pair ? s.p : Object.keys(s.pick)).filter(u => u !== me && s.ans[u] == null);
      status = !inGame ? T("بيلعبوا…", "بيلعبوا…", "Playing…") : !mine ? T("اختاري، وإجابات الكل هتظهر لما كله يجاوب", "اختار، وإجابات الكل هتظهر لما كله يجاوب", "Pick one. Everyone's answers show once all have answered")
        : s.ans[me] == null ? T("إجابتك مش هتبان غير لما الكل يجاوب 🤫", "إجابتك مش هتبان غير لما الكل يجاوب 🤫", "Nobody sees your answer until everyone has answered 🤫")
        : wait.length ? `${T("مستنيين", "مستنيين", "Waiting for")} ${wait.map(name).join("، ")}` : T("مستنيين حد كمان يلعب", "مستنيين حد كمان يلعب", "Waiting for someone else to play");
    }
  }
  if (s.ended){ body = ""; status = "🏁 " + T("اللعبة اتقفلت", "اللعبة اتقفلت", "This game was ended"); }
  const over = s.win || s.ended || (poll(s.k) && whoAt(s, me) >= s.q.length);
  const canEnd = !gameOver(s) && (me === s.by || (s.p || []).includes(me));
  return `<div class="og-card"><div class="og-h"><span>${def.e}</span><b>${K(en ? def.en[0] : def.ar[0])}</b></div>${body}<div class="og-s">${status}</div>${over ? `<button type="button" class="btn ghost small" data-act="og-new" data-v="${s.k}">🔁 ${T("كمان مرة", "كمان مرة", "Play again")}</button>` : ""}${canEnd ? `<button type="button" class="og-end" data-act="og" data-v="${s.id}:end:">🏁 ${T("إنهاء اللعبة", "إنهاء اللعبة", "End the game")}</button>` : ""}</div>`;
}
