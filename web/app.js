
"use strict";
/* ================= helpers ================= */
const $ = s => document.querySelector(s);
const escP = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
/* esc() marks what people wrote (names, diary, messages) so the masculine rewrite below never touches it */
const esc = s => "\uE000" + escP(s) + "\uE001";
const uid = () => Math.random().toString(36).slice(2, 9);
const dkey = (d = new Date()) => { const z = new Date(d); return z.getFullYear()+"-"+String(z.getMonth()+1).padStart(2,"0")+"-"+String(z.getDate()).padStart(2,"0"); };
const addDays = (d, n) => { const z = new Date(d); z.setDate(z.getDate()+n); return z; };
const fromKey = k => { const [y,m,d] = k.split("-").map(Number); return new Date(y, m-1, d); };
const pc = n => `<bdi dir="ltr" class="num">${Math.round(n)}%</bdi>`;
const SHORT = ["حد","اتنين","تلات","أربع","خميس","جمعة","سبت"];
const fmt = n => Math.round(n).toLocaleString("en-US");
const pick = arr => arr && arr.length ? arr[Math.floor(Math.random()*arr.length)] : "";
const DAYS = ["الأحد","الاتنين","التلات","الأربع","الخميس","الجمعة","السبت"];
const MONTHS = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];
const prettyDate = d => DAYS[d.getDay()] + " " + d.getDate() + " " + MONTHS[d.getMonth()];
const norm = s => s.replace(/[ً-ْـ]/g,"").replace(/[أإآ]/g,"ا").replace(/ة/g,"ه").replace(/ى/g,"ي");

/* ================= labels (his names) ================= */
const L = {
  app:"Nono's World 🌍", money:"اصرفي براحتك يا بسبوسه 💸", day:"علينا ايه النهارده 🤔", tasks:"مهماتي",
  done:"عملتيها يا نونو 🤏🏽", lazy:"كسلت 🙈", study:"ركن المذاكرة 📚", focus:"حبه جد", rest:"حبه هدوء ☕",
  examsBad:"مكتوب عليا ⏳", examsGood:"إفراج 🎉", streak:"ايه الشطارة دي🔥", week:"راحه اخيرا 🫠", care:"الدلع 🛁",
  mood:"النفسيه", diary:"دفتر حكاياتي 📔", love:"فاكرك علطول 💌", alarm:"صحّيني ⏰", backup:"احفظي ذكرياتي 💾",
  daily:"قربنا نفلس", vacation:"إجازة 🏖️", left:{ok:"لسه في الخير 😌", near:"هنفلس 😬", out:"فلسنا 🙆🏽‍♀️"}
};
const MOODS = [
  {k:"happy", e:"😍", t:"مبسوطة"}, {k:"good", e:"🙂", t:"كويسة"}, {k:"meh", e:"😐", t:"عادي"},
  {k:"sad", e:"😔", t:"زعلانة"}, {k:"stressed", e:"😫", t:"مضغوطة"}
];
const CATS = [
  {k:"food",e:"🍔",t:"أكل",c:"#f08a5d"},{k:"ride",e:"🚕",t:"مواصلات",c:"#f6c445"},{k:"clothes",e:"👗",t:"لبس",c:"#e85d8a"},
  {k:"uni",e:"📚",t:"كلية",c:"#7f6ad6"},{k:"out",e:"🎡",t:"خروجات",c:"#43b3ae"},{k:"gift",e:"🎁",t:"هدايا",c:"#d65aa0"},
  {k:"care",e:"💄",t:"ميكب وعناية",c:"#ff9fb7"},{k:"other",e:"✨",t:"حاجات تانية",c:"#a3a3b5"}
];
const GTYPES = ["كويز","ميدترم","فاينل"];
const SHARE = [["mood","النفسيه 💭"],["diary","دفتر حكاياتي 📔"],["study","المذاكرة والدرجات 📚"],["day","يومي ومهماتي 🗓️"],["money","الفلوس 💸"],["care","الدلع 🛁"]];

/* ================= his messages (editable from the secret screen) ================= */
const MSG_GROUPS = [
  ["النفسيه 😍 مبسوطة","happy"],["النفسيه 🙂 كويسة","good"],["النفسيه 😐 عادي","meh"],["النفسيه 😔 زعلانة","sad"],["النفسيه 😫 مضغوطة","stressed"],
  ["حكاياتي: مذاكرة أو امتحان","d_study"],["حكاياتي: تعبانة","d_tired"],["حكاياتي: زعلانة","d_sad"],["حكاياتي: فرحانة أو نجحت","d_happy"],
  ["حكاياتي: لو كتبت إزيك","d_greet"],["حكاياتي: لو كتبت غور","d_ghor"],["حكاياتي: عايزة أحكي","d_story"],["حكاياتي: أي حاجة تانية","d_other"],
  ["الدرجات: 75% أو أكتر","g_high"],["الدرجات: من 50% لـ 75%","g_mid"],["الدرجات: أقل من 50%","g_low"],
  ["لما تعمل مهمة ✅","done"],["لما تكسل عن مهمة 🙈","lazy"],["فاكرك علطول 💌","love"],["صحّيني ⏰ صباح الخير","morning"],["أيام العذر (دلع زيادة)","period"]
];
const DEFAULT_MSGS = {
  happy:["يا بخت اليوم اللي إنتي مبسوطة فيه 😍","الضحكة دي لازم تتحط في متحف يا نونو","خليكي كده على طول، الدنيا بتحلو لما إنتي تحلوّي","ببقا مبسوط طول مانت مبسوطه يا نونو 🤏🏽"],
  good:["كويسة؟ مش متطمن 😑","يوم هادي ولطيف، زيك بالظبط","حلو، كمّلي كده يا بسبوسة 🌸"],
  meh:["عادي إيه بس، إنتي مفيش فيكي حاجة عادية 🙄","اليوم ده محتاج كوباية حاجة سخنة وأغنية حلوة ☕","قومي اعملي حاجة بتحبيها و تعالي قوليلي بقيتي أحسن 😉","لعله خير ان شاء الله"],
  sad:["تعالي هنا… مين زعّلك؟ قوليلي بس 😤","الزعل ده ضيف وهيمشي، وأنا هنا مش ماشي 🤍","مسموحلك تزعلي، بس مش مسموحلك تنسي إن في حد بيحبك جدًا","عيّطي لو عايزة، وبعدين نقوم ناكل حاجة حلوة 🍫","مالك يا نونو, حقك عليا لو انا السبب يا بنوتي 😟","انا السبب؟ ده انا مني لله, كلو الا زعلك يا قمر 🌑"],
  stressed:["الدنيا ضغوطات بس انت اشطر بنوته في الدنيا 🤏🏽","مش لازم تخلّصي كل حاجة النهارده، حاجة واحدة بس تكفي","إنتي أشطر من الضغط ده بكتير، وأنا عارف","انا جنبك و معاك يا نونو كل حاجه هتبقا كويسه ❤️"],
  d_study:["انت اشطر بنوته في الدنيا انتي قدها ❤️","كل صفحة بتذاكريها بتقرّبك من الإفراج 🎉","أنا فخور بيكي إنك قاعدة تذاكري أصلًا، دي لوحدها شطارة","انا فخور بيكي يا بنوتي 🤏🏽"],
  d_tired:["كفاية كده النهارده يا نونو، نامي بدري وده أمر 😤","جسمك بيقولك ارتاحي، اسمعي كلامه وكلامي","التعب ده معناه إنك بتعافري، ارتاحي بقى وأنا فخور بيكي","تعبك ده في ميزان حسناتك يا بنوتي ❤️","انت اشطر نونو و قد التعب"],
  d_sad:["مش هسيبك زعلانة لوحدك أبدًا 🤍","مهما حصل، إنتي مش لوحدك","طلّعي كل اللي جواكي هنا، ولما تخلّصي افتكري إني بحبك","انا معاك و جمبك و هفضل جنبك ❤️","من ايه يا نونو تعالي احكيلي","احكي طيب مالك يا حبيبي"],
  d_happy:["قوليلي تاني! 😍 أنا فرحان أكتر منك","شوفتي بقى؟ قولتلك إنك جامدة","ده يستاهل احتفال، وأنا عازمك 🎉","بجد كنت متاكد انك اشطر بنوته في الدنيا 🤏🏽","انا فخور بيك يا نور عيوني ❤️"],
  d_greet:["احسن منك 😂😂","اكيد كويس لانك معايا","كويس طول مانت معايا"],
  d_ghor:["للجنه معاكي نيهاهاهاااااا","يارب لبيتنا يا عيوني","و اسيبك تؤ تؤ مقدرش"],
  d_story:["احكيلي يا حبيبي ❤️","اشجيني يا روح قلبي 🙂","انا معاكي و وداني مطرطقه اهو 👂🏽"],
  d_other:["شكرًا إنك حكيتي 🤍","حكاياتك أحلى حاجة في يومي","مستني الحكاية الجاية يا بسبوسة 📔"],
  g_high:["إيه الشطارة دي يا نونو 😍🔥","كنت عارف! اشطر بنوته زي العادة","الدرجة دي لازم تتبروز 🖼️","انت اشطر بنوته في الدنيا"],
  g_mid:["اللهم بارك واثق انو احلى المره الجايه","انت اشطر بنوته المفروض تقفلي"],
  g_low:["ولا يهمك، دي درجة مش آخر الدنيا 🤍","الدرجة دي مش بتقول إنتي مين، إنتي أشطر منها","انتي اشطر بنوته واثق انك هتعوضي"],
  done:["انت اشطر بنوته في الدنيا 🤏🏽","انا فخور بيكي يا بنوتي 🤏🏽"],
  lazy:["كسلتي؟ عادي، بكرة نعوّضها 😌","ماشي يا كسولة، بس بكرة مفيش هزار 😂"],
  love:["جيتي في بالي و قلت اقولك ان حبي ليكي زاد","انتي بجد احلى حاجه في الدنيا","انتي اجمل حاجه حصلت لي","انا اسف على كل حاجه زعلتك","حقك عليا يا نور عيوني في كل مره زعلتك فيها","اسفلك على كل مره زعلتك فيها"],
  period:["ألف سلامة عليكي يا قلبي، ارتاحي ومتشيليش هم حاجة 🤍","اعملي لنفسك حاجة دافية واتغطي كويس، وأنا معاكي","لو تعبانة سيبي المذاكرة شوية، صحتك أهم من أي حاجة","إنتي أحلى حاجة في الدنيا حتى وإنتي تعبانة ❤️","عايزة شوكولاتة؟ قوليلي وأنا أجيبهالك 🍫","قربة مية سخنة وفيلم حلو والبطانية، ده أمر 😤","أي حاجة مضايقاكي قوليلي، أنا هنا يا نونو","مسموحلك تتدلّعي على الآخر الأيام دي 🎀"],
  morning:["صباح الفل على أحلى نونو ☀️ قومي يلا، الدنيا مستنياكي","اصحي يا بسبوسة، النهارده هيبقى يوم حلو","يلا قومي… وأول حاجة اشربي مية وابتسمي 😁","صباح الخير يا بنوتي","صباح الخير يا اشطر بنوته في الدنيا","ابعتيلي عشان وحشاني اوي","كنت مستنيكي بفارغ الصبر"]
};
const DEFAULT_MSGS_M = {
  happy:["يا بخت اليوم اللي إنت مبسوط فيه يا راجلي 😍","ضحكتك دي أحلى حاجة في يومي يا بطلي","خليك مبسوط كده على طول يا حبيبي","ببقى مبسوطة طول ما إنت مبسوط 🤍"],
  good:["كويس؟ يبقى ناويين نبقى أحلى يا بطلي 💪","يوم هادي وحلو زيك يا راجلي","كمّل كده يا حبيبي، أنا فخورة بيك"],
  meh:["عادي إيه بس يا بطلي، إنت مفيش فيك حاجة عادية 🙄","قوم اعمل حاجة بتحبها وتعالى قولّي بقيت أحسن 😉","لعله خير إن شاء الله يا حبيبي","اليوم ده محتاج كوباية شاي وأغنية حلوة، وأنا معاك ☕"],
  sad:["مالك يا راجلي؟ قولّي بس مين زعّلك 😤","الزعل ده ضيف وهيمشي، وأنا جنبك ومش ماشية 🤍","مسموحلك تزعل يا بطلي، بس متنساش إن في واحدة بتحبك جدًا","حقك عليا يا حبيبي لو أنا السبب 😟"],
  stressed:["خد نفس يا بطلي… الدنيا هتعدّي وإنت أقوى منها 💪","مش لازم تخلّص كل حاجة النهارده يا راجلي، حاجة واحدة بس تكفي","إنت أشطر وأجدع راجل في الدنيا، والضغط ده صغير عليك","أنا جنبك ومعاك يا حبيبي، كل حاجة هتبقى كويسة ❤️"],
  d_study:["إنت قدها يا بطلي، أنا واثقة فيك 💪","كل صفحة بتذاكرها بتقرّبك من الإفراج يا راجلي 🎉","فخورة بيك إنك قاعد تذاكر أصلًا، دي لوحدها رجولة","يلا يا بطلي، فاضل شوية وتخلّص 🔥"],
  d_tired:["كفاية كده النهارده يا حبيبي، نام بدري وده أمر 😤","جسمك بيقولك ارتاح، اسمع كلامه وكلامي يا راجلي","تعبك ده في ميزان حسناتك يا بطلي ❤️","إنت قد التعب وأكتر، بس ارتاح شوية عشان خاطري"],
  d_sad:["مش هسيبك زعلان لوحدك أبدًا يا راجلي 🤍","مهما حصل، إنت مش لوحدك، أنا معاك","أنا معاك وجنبك وهفضل جنبك يا بطلي ❤️","مالك يا حبيبي؟ احكيلي"],
  d_happy:["قولّي تاني! 😍 أنا فرحانة بيك أكتر منك","شوفت بقى؟ قولتلك إنك بطلي","ده يستاهل احتفال يا راجلي 🎉","كنت متأكدة إنك أشطر واحد في الدنيا 💪"],
  d_greet:["أحسن منك 😂😂","أكيد كويسة عشان إنت معايا يا حبيبي","كويسة طول ما إنت معايا يا راجلي"],
  d_ghor:["للجنة معاك يا حبيبي نيهاهاها 😂","يارب لبيتنا يا راجلي","وأسيبك؟ تؤ تؤ مقدرش"],
  d_story:["احكيلي يا حبيبي ❤️","سامعاك يا بطلي 👂🏽","أنا معاك، احكي يا راجلي"],
  d_other:["شكرًا إنك حكيتلي يا حبيبي 🤍","حكاياتك أحلى حاجة في يومي","مستنية الحكاية الجاية يا بطلي 📔"],
  g_high:["إيه الشطارة دي يا بطلي 🔥","كنت عارفة! راجلي أشطر واحد زي العادة 💪","الدرجة دي لازم تتبروز يا حبيبي 🖼️"],
  g_mid:["اللهم بارك، والجاية أحلى إن شاء الله يا بطلي 💪","حلوة يا راجلي، المرة الجاية هتقفل"],
  g_low:["ولا يهمك يا حبيبي، دي درجة مش آخر الدنيا 🤍","الدرجة دي مش بتقول إنت مين يا بطلي، إنت أشطر منها","واثقة إنك هتعوّض يا راجلي 💪"],
  done:["عاش يا بطلي 💪","إيه الرجولة دي يا راجلي 🔥","فخورة بيك يا حبيبي"],
  lazy:["كسلت؟ عادي يا حبيبي، بكرة نعوّضها 😌","ماشي يا كسول، بس بكرة مفيش هزار يا راجلي 😂"],
  love:["على فكرة، أنا فاكراك دلوقتي يا راجلي 💌","اشرب مية يا حبيبي، دي مش نصيحة دي رسالة حب 💧","إنت أحلى حاجة حصلتلي يا بطلي","لو مضايق من حاجة كلّمني على طول، أنا هنا","ربنا يخليك ليا يا راجلي ❤️"],
  morning:["صباح الخير يا راجلي ☀️ قوم يلا، الدنيا مستنياك","اصحى يا بطلي، النهارده يوم حلو","صباح الفل يا حبيبي، اشرب مية وابتسم 😁","وحشتني، ابعتلي أول ما تصحى 💌"],
  period:[]
};
const ISLAMIC = /ميزان حسنات|اللهم|ما شاء الله|الحمد لله|ربنا يتقبل|بإذن الله|سبحان/;
const NEUTRAL_FALLBACK = "أنا جنبك على طول 🤍";
function defMsgs(g, rel){
  const m = JSON.parse(JSON.stringify(g === "m" ? DEFAULT_MSGS_M : DEFAULT_MSGS));
  if (rel === "christian") for (const k in m){ const f = m[k].filter(t => !ISLAMIC.test(t)); m[k] = f.length || !m[k].length ? f : [NEUTRAL_FALLBACK]; }
  return m;
}
/* keyword → reply group for the diary (checked in order) */
const DIARY_RULES = [
  ["d_sad",   ["زعلان","مخنوق","مضايق","عيطت","بعيط","حزين","زهقان","مقهور","وحش اوي","مكتئب"]],
  ["d_tired", ["تعبان","تعبت","مرهق","مصدع","هلكان","نعسان","مفيش طاقه","تعب"]],
  ["d_study", ["مذاكر","ذاكرت","امتحان","كويز","ميدترم","فاينل","محاضر","سكشن","شيت","دكتور","مذاكره"]],
  ["d_happy", ["فرحان","مبسوط","نجحت","قفلت","فرحت","جبت الدرجه","مبسوطه","حلو اوي","اتبسطت"]],
  ["d_ghor",  ["غور","غوري","اتغور"]],
  ["d_greet", ["ازيك","عامل ايه","اخبارك","عامله ايه"]],
  ["d_story", ["عايزه احكي","عايزة احكي","هحكيلك","احكيلك","هقولك حاجه"]]
];


/* ================= masculine wording (when the user is a guy) ================= */
const MASC = {"إنتي":"إنت","انتي":"انت","وانتي":"وانت","ابدئي":"ابدأ","وابدئي":"وابدأ","تبدئي":"تبدأ","ابعتي":"ابعت","ابعتيلي":"ابعتلي","ابعتيها":"ابعتها",
"اتأكدي":"اتأكد","اتبسطي":"اتبسط","احفظي":"احفظ","واحفظي":"واحفظ","واحفظيه":"واحفظه","اختاري":"اختار","تختاري":"تختار","بتختاري":"بتختار","ادخلي":"ادخل","تدخلي":"تدخل",
"اربطي":"اربط","ارتاحي":"ارتاح","استخدمي":"استخدم","استمتعي":"استمتع","اشربي":"اشرب","اصرفي":"اصرف","اعملي":"اعمل","اكتبي":"اكتب","اكتبيه":"اكتبه","تكتبي":"تكتب",
"الصقي":"الصق","امسحي":"امسح","انسخي":"انسخ","وانسخي":"وانسخ","وانسخيه":"وانسخه","تنسخيها":"تنسخها","اهتميتي":"اهتميت","بتذاكريها":"بتذاكرها","تذاكري":"تذاكر",
"بتعافري":"بتعافر","بقيتي":"بقيت","بلّغي":"بلّغ","بيكي":"بيك","تخلّصي":"تخلّص","تزعلي":"تزعل","تسجّلي":"تسجّل","سجّلي":"سجّل","سجّلتي":"سجّلت","تصرفي":"تصرف",
"تصرفيهم":"تصرفهم","صرفتي":"صرفت","صرفتيهم":"صرفتهم","تعالي":"تعالى","تعبانة":"تعبان","تغيّريها":"تغيّرها","غيّري":"غيّر","تفكّي":"تفكّ","فكّي":"فكّ","فكّيه":"فكّه",
"تقدري":"تقدر","وتقدري":"وتقدر","تقفلي":"تقفل","تقفليه":"تقفله","تنسي":"تنسى","جبتي":"جبت","جرّبي":"جرّب","وجرّبي":"وجرّب","حابة":"حابب","حطّي":"حطّ","حكيتي":"حكيت",
"خليكي":"خليك","خلّيكي":"خلّيك","خلّصتي":"خلّصت","دلّعتي":"دلّعت","دوسي":"دوس","ذاكرتي":"ذاكرت","رجّعي":"رجّع","رجّعيها":"رجّعها","زعلانة":"زعلان","سيبيها":"سيبها",
"شغّليها":"شغّلها","شوفي":"شوف","صاحبة":"صاحب","ضيفي":"ضيف","عارفة":"عارف","عايزة":"عايز","عايزه":"عايز","عدّيتي":"عدّيت","عليكي":"عليك","علّمي":"علّم","عملتي":"عملت",
"عملتيها":"عملتها","عيّطي":"عيّط","فاكرة":"فاكر","فرحانة":"فرحان","قاعدة":"قاعد","قوليلي":"قولّي","قومي":"قوم","كسلتي":"كسلت","كسولة":"كسول","كلّمي":"كلّم","كمّلي":"كمّل",
"كويسة":"كويس","ليكي":"ليك","مبسوطة":"مبسوط","مبسوطه":"مبسوط","متأكدة":"متأكد","مختارتيش":"مختارتش","مصرفتيش":"مصرفتش","مضايقة":"مضايق","مضغوطة":"مضغوط",
"معاكي":"معاك","موافقة":"موافق","مستعدة":"مستعد","مستنيكي":"مستنيك","نامي":"نام","نسيتي":"نسيت","نمتي":"نمت","هتعوضي":"هتعوض","هصحّيكي":"هصحّيك","هنناديكي":"هنناديك",
"وابتسمي":"وابتسم","وافقتي":"وافقت","شغالة":"شغال","بطلة":"بطل","بسبوسة":"وحش","بسبوسه":"وحش","نونو":"بطل","بنوتي":"بطل","حبيبتي":"حبيبي",
"مسلمة":"مسلم","مسيحية":"مسيحي","هو سامعك":"هي سامعاك","هو بيشوفك":"هي بتشوفك","يرد عليكي":"ترد عليك","من عنده":"من عندها","شريك حياتك":"شريكة حياتك","شريكك":"شريكتك","صاحبة الحساب":"صاحب الحساب"};
const MASC_RE = new RegExp("(^|[^\\u0600-\\u06FF])(" + Object.keys(MASC).sort((a,b)=>b.length-a.length).map(k=>k.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")).join("|") + ")(?![\\u0600-\\u06FF])", "g");
const mascRaw = str => String(str).replace(MASC_RE, (m, pre, w) => pre + MASC[w]);
const stripMarks = h => String(h).replace(/[]/g, "");
const mascProtected = h => String(h).split(/([^]*)/).map(x => x[0] === "" ? x.slice(1, -1) : mascRaw(x)).join("");
const isMale = () => !!(S && S.user && S.user.gender === "m");
/* gx: final pass on any HTML before it hits the page */
const gx = (html, on = isMale()) => String(html).split(/(<!--k-->[\s\S]*?<!--\/k-->)/).map(x => x.startsWith("<!--k-->") ? x : (on ? mascProtected(x) : stripMarks(x))).join("");
/* keep(): a block about another person, worded by THEIR gender, left alone by gx */
const keep = (html, gender) => `<!--k-->${gender === "m" ? mascProtected(html) : stripMarks(html)}<!--/k-->`;

/* ================= themes ================= */
const THEMES = [
  {k:"basbousa",n:"بسبوسة 🍓",bg:"#fff6f9",ink:"#3b2430",mu:"#8d7380",a:"#e85d8a",a2:"#ffb3c9",g:"f"},
  {k:"farawlaya",n:"فراولاية 🌸",bg:"#fff0f5",ink:"#3d1d2b",mu:"#8f6676",a:"#d63a74",a2:"#ff8fb6",g:"f"},
  {k:"ghazl",n:"غزل البنات 🍭",bg:"#fcf3fb",ink:"#3a2238",mu:"#8a6f88",a:"#d65aa0",a2:"#b28ae6",g:"f"},
  {k:"yasmina",n:"ياسمينة 🤍",bg:"#fcfaff",ink:"#2f2640",mu:"#7f7591",a:"#9b6fd1",a2:"#e6d8f7",g:"f"},
  {k:"lavender",n:"لافندر 💜",bg:"#f6f2fd",ink:"#2e2546",mu:"#7c7194",a:"#8a6cc9",a2:"#c9b6f0",g:"f"},
  {k:"khokh",n:"خوخ 🍑",bg:"#fff7f1",ink:"#3f2a20",mu:"#91756a",a:"#e8805a",a2:"#ffd0b3",g:"f"},
  {k:"ghayma",n:"غيمة 🩵",bg:"#f3faff",ink:"#1f3140",mu:"#6c8293",a:"#3f9bd1",a2:"#bfe3f7",g:"f"},
  {k:"naanaa",n:"نعناع 🌿",bg:"#f2fbf7",ink:"#1f3a30",mu:"#6c8a7f",a:"#2fa07d",a2:"#bfe9d8",g:"f"},
  {k:"leil",n:"ليل ⚫",bg:"#eef0f6",ink:"#1d2233",mu:"#6b7288",a:"#4e6bcc",a2:"#a9b6e6",g:"m",dark:true},
  {k:"bahr",n:"بحر 🌊",bg:"#f0f5fb",ink:"#15283b",mu:"#62778d",a:"#1f6fb2",a2:"#9cc7ea",g:"m"},
  {k:"ramli",n:"رملي 🏜️",bg:"#faf5ee",ink:"#3a2c20",mu:"#8a7865",a:"#a0714f",a2:"#e8d5c0",g:"m"},
  {k:"romady",n:"رمادي 🩶",bg:"#f5f6f8",ink:"#24272d",mu:"#6f7580",a:"#5f6672",a2:"#cfd3da",g:"m"}
];
const TS = () => S || {theme:"basbousa", dark:"auto"};
function isDark(){
  const t = THEMES.find(x=>x.k===TS().theme) || THEMES[0];
  if (t.dark || TS().dark === "on") return true;
  if (TS().dark === "auto"){ const h = new Date().getHours(); return h >= 20 || h < 6; }
  return false;
}
function applyTheme(){
  const t = THEMES.find(x=>x.k===TS().theme) || THEMES[0];
  const r = document.documentElement.style, dark = isDark();
  if (!dark){
    r.setProperty("--bg",t.bg); r.setProperty("--surface","#ffffff"); r.setProperty("--ink",t.ink);
    r.setProperty("--muted",t.mu); r.setProperty("--accent",t.a); r.setProperty("--accent2",t.a2);
    r.setProperty("color-scheme","light");
  } else {
    r.setProperty("--bg",`color-mix(in srgb, ${t.a} 7%, #121016)`);
    r.setProperty("--surface",`color-mix(in srgb, ${t.a} 11%, #1d1b22)`);
    r.setProperty("--ink","#f2edf4"); r.setProperty("--muted","#b3aab9");
    r.setProperty("--accent",`color-mix(in srgb, ${t.a} 78%, #fff)`);
    r.setProperty("--accent2",`color-mix(in srgb, ${t.a2} 45%, #2a2630)`);
    r.setProperty("color-scheme","dark");
  }
  const m = document.querySelector('meta[name="theme-color"]') || Object.assign(document.head.appendChild(document.createElement("meta")),{name:"theme-color"});
  m.content = dark ? "#16131a" : t.bg;
}

/* ================= state ================= */
const KEY = "nonos-world-v1";
let S;
function seed(){
  const t = new Date(), k = dkey(t), y = dkey(addDays(t,-1)), y2 = dkey(addDays(t,-2)), y3 = dkey(addDays(t,-3));
  const wd = t.getDay();
  return {
    v:1, user:{name:"نونو", username:"nono", gender:"f"}, sample:true,
    theme:"basbousa", dark:"auto", pin:null, tab:"home",
    money:{allowance:3000, period:"month", expenses:[
      {id:uid(),amt:65,cat:"food",note:"فطار مع البنات",date:k},
      {id:uid(),amt:40,cat:"ride",note:"أوبر للكلية",date:k},
      {id:uid(),amt:350,cat:"clothes",note:"طرحة وبلوزة",date:y},
      {id:uid(),amt:120,cat:"uni",note:"ملازم",date:y2},
      {id:uid(),amt:210,cat:"out",note:"سينما",date:y3},
      {id:uid(),amt:95,cat:"care",note:"لوشن",date:y3}
    ]},
    schedule:[
      {id:uid(),day:wd,start:"09:00",end:"10:30",title:"محاضرة تشريح",place:"مدرج 3"},
      {id:uid(),day:wd,start:"11:00",end:"12:30",title:"سكشن فسيولوجي",place:"معمل 2"},
      {id:uid(),day:(wd+1)%7,start:"10:00",end:"12:00",title:"محاضرة كيمياء حيوية",place:"مدرج 1"}
    ],
    tasks:[
      {id:uid(),date:k,title:"أراجع محاضرة التشريح",status:"done"},
      {id:uid(),date:k,title:"أحل شيت الفسيولوجي",status:null},
      {id:uid(),date:k,title:"أشرب 8 كوبايات مية",status:null},
      {id:uid(),date:y,title:"ألخّص الكيمياء",status:"lazy"},
      {id:uid(),date:y,title:"أرتّب أوضتي",status:"done"}
    ],
    subjects:["تشريح","فسيولوجي","كيمياء حيوية"],
    sessions:[
      {date:k,subject:"تشريح",mins:50},{date:y,subject:"فسيولوجي",mins:75},
      {date:y2,subject:"تشريح",mins:25},{date:y3,subject:"كيمياء حيوية",mins:50}
    ],
    exams:[
      {id:uid(),subject:"تشريح",type:"ميدترم",date:dkey(addDays(t,9))},
      {id:uid(),subject:"فسيولوجي",type:"كويز",date:dkey(addDays(t,3))}
    ],
    grades:[
      {id:uid(),subject:"فسيولوجي",type:"كويز",score:8,total:10,date:y3},
      {id:uid(),subject:"تشريح",type:"كويز",score:13,total:20,date:dkey(addDays(t,-8))}
    ],
    moods:{[y]:"good",[y2]:"stressed",[y3]:"happy"},
    care:{[k]:{water:3,sleep:7}},
    diary:[{id:uid(),ts:addDays(t,-1).getTime(),text:"النهارده الدكتور شرح حتة صعبة أوي في المحاضرة بس فهمتها لوحدي 🥹",cat:"d_study",reply:"انا فخور بيكي يا بنوتي 🤏🏽"}],
    msgs:defMsgs("f"),
    alarm:{wake:"07:30", reminders:[{id:uid(),time:"21:00",text:"سجّلتي مصاريف النهارده؟ 💸"},{id:uid(),time:"18:00",text:"يلا حبه جد 📚"}]},
    lastMorning:null, timer:null
  };
}
function blank(){
  return { v:1, theme:"basbousa", dark:"auto", lang:"ar", pin:null, tab:"home", sample:false,
    money:{allowance:0, period:"month", expenses:[]}, schedule:[], tasks:[], subjects:[], sessions:[], exams:[], grades:[],
    moods:{}, care:{}, prayers:{}, cycle:{on:false, history:[]}, diary:[], msgs:defMsgs("f"), rules:[], share:{},
    alarm:{wake:"07:30", reminders:[{id:uid(),time:"21:00",text:"سجّلتي مصاريف النهارده؟ 💸"},{id:uid(),time:"18:00",text:"يلا حبه جد 📚"}]},
    lastMorning:null, timer:null, chatId:"c0", durations:{focus:25, rest:5}, vacation:{on:false} };
}
function normalize(s, gender){
  const b = blank();
  for (const k in b) if (s[k] === undefined || s[k] === null && k !== "pin" && k !== "lastMorning" && k !== "timer") s[k] = b[k];
  const dm = defMsgs(gender, s.religionHint); for (const k in dm) if (!s.msgs[k] || !s.msgs[k].length) s.msgs[k] = dm[k];
  s.diary.forEach(e => { if (!e.chat) e.chat = "c0"; if (!e.reply && e.from !== "him" && e.pending) { e.reply = e.pending; delete e.pending; } });
  return s;
}
function load(){
  if (CLOUD) return null;
  try { const raw = localStorage.getItem(KEY); if (raw){ const s = JSON.parse(raw); if (s && s.v===1) return s; } } catch(e){}
  return seed();
}

/* ================= cloud sync (Firebase) ================= */
const CLOUD = !!window.fb;
const SEC = { prefs:["theme","dark","lang","durations","vacation","alarm","subjects","chatId","lastMorning","lastCare","pin"], money:["money"], day:["schedule","tasks"],
  study:["sessions","exams","grades"], mood:["moods"], care:["care","prayers","cycle"], msgs:["msgs","rules"] };
let UID = null, ME = null, IS_ADMIN = false, P = null, unsubs = [], punsubs = [], pushTimer = null, lastPushed = {}, lastDiary = new Map(), signingUp = null;
const secData = (st, sec) => { const o = {}; SEC[sec].forEach(k => o[k] = st[k] === undefined ? null : st[k]); return o; };
function save(){
  if (!CLOUD){ try { localStorage.setItem(KEY, JSON.stringify(S)); } catch(e){} return; }
  if (!UID || !S) return;
  try { localStorage.setItem(KEY + ":" + UID, JSON.stringify(S)); } catch(e){}
  clearTimeout(pushTimer); pushTimer = setTimeout(pushNow, 700);
}
function pushNow(){
  if (!UID || !S || (ME && ME.banned)) return;
  for (const sec in SEC){
    const d = secData(S, sec), j = JSON.stringify(d);
    if (lastPushed[sec] !== j){ lastPushed[sec] = j; fb.set(`u/${UID}/sec/${sec}`, d, false).catch(e => console.warn("push", sec, e)); }
  }
  const seen = new Set();
  S.diary.forEach(e => {
    seen.add(e.id); if (e.pending) return;
    const j = JSON.stringify(e);
    if (lastDiary.get(e.id) !== j){ lastDiary.set(e.id, j); fb.set(`u/${UID}/chat/${e.id}`, e, false).then(()=>moderate(e, `u/${UID}/chat/${e.id}`, UID)).catch(err => console.warn("chat", err)); }
  });
  for (const id of [...lastDiary.keys()]) if (!seen.has(id)){ lastDiary.delete(id); fb.del(`u/${UID}/chat/${id}`).catch(()=>{}); }
  if (ME && JSON.stringify(ME.share || {}) !== JSON.stringify(S.share || {})) saveMe({share:S.share});
}
function saveMe(fields){ Object.assign(ME, fields); return fb.set(`users/${UID}`, fields).catch(e => console.warn("me", e)); }
const BAD = ["خول","متناك","شرموط","عرص","كسم","كس ام","يلعن","ابن الكلب","ابن الوسخه","وسخه","زباله","معفن","حيوان","بهيمه","متخلف","غبي","حماره","حمار","fuck","bitch","shit"];
function moderate(e, path, owner){
  if (!e.text || e.flagged) return;
  const n = norm(String(e.text).toLowerCase());
  if (BAD.some(w => n.includes(norm(w)))){ e.flagged = true; fb.add("reports", {kind:"auto", path, owner, author: e.from==="him" ? (ME.partner||null) : owner, by: UID, text: e.text}).catch(()=>{}); }
}
function stopAll(list){ list.forEach(u => { try{u();}catch(e){} }); list.length = 0; }
async function boot(u){
  stopAll(unsubs); stopAll(punsubs); P = null; ME = null; IS_ADMIN = false; lastPushed = {}; lastDiary = new Map();
  if (!u){ UID = null; S = null; render(); return; }
  UID = u.uid;
  if (signingUp) { try { await signingUp; } catch(e){} }
  try { const c = localStorage.getItem(KEY + ":" + UID); if (c){ S = normalize(JSON.parse(c)); } } catch(e){}
  try { ME = await fb.get(`users/${UID}`); if (ME) localStorage.setItem(KEY + ":me:" + UID, JSON.stringify(ME)); }
  catch(e){ try { ME = JSON.parse(localStorage.getItem(KEY + ":me:" + UID)); } catch(_){} }
  if (!ME){
    if (navigator.onLine){ await fb.signOut(); toast("الحساب مش كامل، اعملي حساب تاني 🙏"); return; }
    S = null; UID = null; render(); toast("محتاجين نت أول مرة تدخلي 📶"); return;
  }
  const secs = await Promise.all(Object.keys(SEC).map(sec => fb.get(`u/${UID}/sec/${sec}`).catch(()=>null)));
  const st = S && S.v ? S : blank();
  Object.keys(SEC).forEach((sec, i) => { const d = secs[i]; if (d){ Object.assign(st, d); lastPushed[sec] = JSON.stringify(secData(st, sec)); } });
  st.religionHint = ME.religion || "muslim";
  S = normalize(st, ME.gender); S.tab = S.tab || "home";
  if (S.cycle && S.cycle.on && !cycleOn() && dkey() > S.cycle.start){ S.cycle.history = (S.cycle.history||[]).concat({start:S.cycle.start, days:S.cycle.days||7}).slice(-12); S.cycle.on = false; save(); }
  S.user = {name:ME.name, username:ME.username, gender:ME.gender, religion:ME.religion || "muslim"}; S.share = Object.assign({}, ME.share || {});
  IS_ADMIN = !!(await fb.get(`admins/${UID}`).catch(()=>null));
  unsubs.push(fb.listenCol(`u/${UID}/chat`, list => {
    const local = new Map(S.diary.filter(e=>e.pending).map(e=>[e.id,e]));
    S.diary = list.map(e => { const {at, ...rest} = e; lastDiary.set(e.id, JSON.stringify(rest)); return rest; });
    local.forEach((e,id) => { if (!S.diary.some(x=>x.id===id)) S.diary.push(e); });
    if (S.tab === "diary" && !$("#layer").innerHTML){ const typing = document.activeElement && document.activeElement.id === "diarytext" ? $("#diarytext").value : null; render(); if (typing !== null){ $("#diarytext").value = typing; $("#diarytext").focus(); } scrollChat(); }
  }));
  unsubs.push(fb.listen(`u/${UID}/sec/msgs`, d => { if (!d) return; const j = JSON.stringify(secData(Object.assign({}, S, d), "msgs")); if (j !== lastPushed.msgs){ S.msgs = d.msgs || S.msgs; S.rules = d.rules || []; lastPushed.msgs = j; } }));
  unsubs.push(fb.listen(`users/${UID}`, d => { if (!d) return; const before = ME.partner; ME = d; S.user = {name:d.name, username:d.username, gender:d.gender, religion:d.religion || "muslim"};
    if (d.banned){ render(); return; } if (before !== d.partner) setupPartner(); }));
  unsubs.push(fb.listen(`linkRequests/${UID}`, d => { if (d && d.from && d.from !== ME.partner) linkRequestSheet(d); }));
  setupPartner();
  render(); startupChecks(); scheduleNative();
  try { if (!LN() && "Notification" in window && Notification.permission === "default") document.addEventListener("click", () => Notification.requestPermission().catch(()=>{}), {once:true}); } catch(e){}
}
function setupPartner(){
  stopAll(punsubs); P = null;
  const pid = ME && ME.partner; if (!pid) { if (S && S.tab === "partner") S.tab = "home"; render(); return; }
  P = Object.assign(blank(), {uid:pid, linked:false, user:null, loaded:{}});
  const sub = (path, cb) => punsubs.push(fb.listen(path, cb, () => {}));
  punsubs.push(fb.listen(`users/${pid}`, d => {
    if (!d){ return; }
    P.user = d; const wasLinked = P.linked; P.linked = d.partner === UID; P.share = d.share || {};
    if (P.linked && !wasLinked){
      ["prefs","msgs"].concat(SHARE.map(x=>x[0]).filter(k=>k!=="diary")).forEach(sec => sub(`u/${pid}/sec/${sec}`, v => { if (v){ Object.assign(P, v); P.loaded[sec] = true; } if (S.tab === "partner") render(); }));
      if (P.share.diary !== false) punsubs.push(fb.listenCol(`u/${pid}/chat`, list => { P.diary = list; if (S.tab === "partner") render(); }, () => {}));
    }
    render();
  }, () => { P.linked = false; render(); }));
}
function linkRequestSheet(d){
  sheet(`<div class="popmsg"><div class="em">💞</div><p>${esc(d.name)} عايز يربط حسابه بيكي</p><small>لو وافقتي هيقدر يشوف الأقسام اللي إنتي مفعّلاها في "شريكي يشوف إيه"، وتقدري تغيّريها أو تفكّي الربط في أي وقت.</small></div>
  <div class="form" style="margin-top:14px"><button class="btn" data-act="link-accept" data-v="${esc(d.from)}">💞 موافقة</button><button class="btn ghost" data-act="link-decline">لأ</button></div>`);
}
async function sendCode(code){
  code = code.trim().toUpperCase();
  const inv = await fb.get(`invites/${code}`).catch(()=>null);
  if (!inv || !inv.uid) return toast("الكود ده مش موجود 🤔");
  if (inv.uid === UID) return toast("ده الكود بتاعك إنت 😅");
  await saveMe({partner: inv.uid});
  await fb.set(`linkRequests/${inv.uid}`, {from:UID, name:ME.name, at:Date.now()}, false);
  closeSheet(); toast("اتبعت الطلب لـ " + inv.name + " 💌"); setupPartner();
}
function notifyPartner(text, force){
  if (!P || !P.linked || !P.user || !P.user.ntfy) return;
  if (!force) try { const last = +localStorage.getItem("nw-alert") || 0; if (Date.now() - last < 3600e3) return; localStorage.setItem("nw-alert", Date.now()); } catch(e){}
  fetch("https://ntfy.sh/" + P.user.ntfy, {method:"POST", body:text, headers:{"Title":"Nono's World","Tags":"heart","Priority":"high"}}).catch(()=>{});
}
const genCode = () => (Math.random().toString(36).slice(2,6) + Math.random().toString(36).slice(2,6)).toUpperCase().replace(/[O0I1]/g,"7").slice(0,6);
async function signUp(name, username, pass, gender, religion = "muslim"){
  let resolveSU, rejectSU; signingUp = new Promise((r,j)=>{resolveSU=r; rejectSU=j;});
  try {
    const uidNew = await fb.signUp(username, pass);
    const code = genCode(), topic = "nw-" + Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
    await fb.set(`users/${uidNew}`, {name, username:username.toLowerCase(), gender, partner:null, share:{}, invite:code, ntfy:topic, religion, createdAt:Date.now()}, false);
    await fb.set(`invites/${code}`, {uid:uidNew, name}, false);
    const st = blank(); st.theme = gender === "m" ? "leil" : "basbousa"; st.msgs = defMsgs(gender, religion);
    if (gender === "m") st.alarm.reminders = [{id:uid(),time:"21:00",text:"سجّلت مصاريف النهارده؟ 💸"},{id:uid(),time:"18:00",text:"يلا حبه جد 📚"}];
    await fb.set(`u/${uidNew}/sec/prefs`, secData(st, "prefs"), false);
    await fb.set(`u/${uidNew}/sec/msgs`, secData(st, "msgs"), false);
    resolveSU();
  } catch(e){ rejectSU(e); throw e; } finally { setTimeout(()=>signingUp=null, 0); }
}
function authError(e){
  const c = (e && e.code) || "";
  if (c.includes("email-already-in-use")) return "اسم المستخدم ده متاخد، جرّبي اسم تاني";
  if (c.includes("invalid-credential") || c.includes("wrong-password") || c.includes("user-not-found")) return "اسم المستخدم أو الباسورد غلط";
  if (c.includes("weak-password")) return "الباسورد لازم 6 حروف أو أرقام على الأقل";
  if (c.includes("network")) return "مفيش إنترنت، جرّبي تاني";
  if (c.includes("too-many-requests")) return "محاولات كتير، استني شوية وجرّبي تاني";
  return "حصلت مشكلة، جرّبي تاني";
}
function startupChecks(){
  if (!S || !S.user) return;
  setTimeout(vacationCheck, 300);
  const t = new Date(), k = dkey(t), now = t.toTimeString().slice(0,5);
  if (!vacDue() && S.lastMorning !== k && now >= S.alarm.wake && t.getHours() < 14){ S.lastMorning = k; save(); setTimeout(morningSheet, 400); }
  else if (S.user.gender !== "m" && cycleOn() && S.lastCare !== k && !vacDue()){ S.lastCare = k; save(); setTimeout(() => message("🤍", pick(S.msgs.period), "دلع زيادة الأيام دي"), 500); }
}

/* ================= derived ================= */
function periodRange(){
  const t = new Date();
  if (S.money.period === "week"){ // Egyptian week starts Saturday
    const back = (t.getDay() + 1) % 7; const st = addDays(new Date(t.getFullYear(),t.getMonth(),t.getDate()), -back);
    return {start:st, end:addDays(st,6)};
  }
  return {start:new Date(t.getFullYear(),t.getMonth(),1), end:new Date(t.getFullYear(),t.getMonth()+1,0)};
}
function moneyInfo(){
  const {start,end} = periodRange(); const sk = dkey(start), ek = dkey(end), tk = dkey();
  const list = S.money.expenses.filter(e => e.date >= sk && e.date <= ek);
  const spent = list.reduce((a,e)=>a+e.amt,0), todaySpent = list.filter(e=>e.date===tk).reduce((a,e)=>a+e.amt,0);
  const left = S.money.allowance - spent;
  const daysLeft = Math.round((end - fromKey(tk))/864e5) + 1;
  const leftStartToday = left + todaySpent;
  const daily = Math.max(0, leftStartToday / Math.max(1,daysLeft));
  const ratio = S.money.allowance ? left / S.money.allowance : 0;
  const state = !S.money.allowance ? "ok" : left <= 0 ? "out" : ratio < 0.3 ? "near" : "ok";
  return {list, spent, left, daily, todaySpent, daysLeft, state, todayLeft: daily - todaySpent};
}
const dur = m => (m === "focus" ? S.durations.focus : S.durations.rest) * 60;
const newTimer = (m, subject) => ({mode:m, total:dur(m), remain:dur(m), subject});
function onVacation(day = dkey()){
  const v = S.vacation; if (!v || !v.on) return false;
  if (v.until && day > v.until) return false;
  return !v.from || day >= v.from;
}
const PRAYERS = [["fajr","الفجر"],["dhuhr","الظهر"],["asr","العصر"],["maghrib","المغرب"],["isha","العشاء"]];
const CARE_TIPS = ["اشربي حاجة دافية زي ينسون أو قرفة","قربة مية سخنة على بطنك بتريّح جدًا","نامي بدري واديله راحة","كُلي حاجة فيها حديد زي العدس والسبانخ","مشي بسيط أو حركة خفيفة بيفرق","اشربي مية كتير النهارده","اتفرجي على حاجة بتحبيها وانسي المذاكرة شوية"];
const isMuslim = () => !(S && S.user && S.user.religion === "christian");
const cycleName = () => isMuslim() ? "العذر الشرعي" : "أيام الدورة";
function cycleInterval(){
  const h = ((S.cycle && S.cycle.history) || []).map(x=>x.start).sort();
  const gaps = []; for (let i = 1; i < h.length; i++){ const g = Math.round((fromKey(h[i]) - fromKey(h[i-1]))/864e5); if (g >= 18 && g <= 45) gaps.push(g); }
  return gaps.length ? Math.round(gaps.slice(-6).reduce((a,x)=>a+x,0) / Math.min(6, gaps.length)) : 28;
}
function nextCycle(){
  const h = (S.cycle && S.cycle.history) || []; if (!h.length) return null;
  const last = h.map(x=>x.start).sort().pop(), next = addDays(fromKey(last), cycleInterval());
  return {date: next, days: Math.round((next - fromKey(dkey()))/864e5)};
}
function cycleOn(day = dkey()){
  const c = S.cycle; if (!c || !c.on || !c.start) return false;
  return day >= c.start && day <= dkey(addDays(fromKey(c.start), (c.days||7) - 1));
}
function cycleLeft(){ const c = S.cycle; return Math.max(0, Math.round((addDays(fromKey(c.start), (c.days||7) - 1) - fromKey(dkey()))/864e5) + 1); }
function avgCycleDays(){ const h = (S.cycle && S.cycle.history) || []; if (!h.length) return 7; return Math.round(h.slice(-6).reduce((a,x)=>a+x.days,0) / Math.min(6, h.length)); }
function studyDays(n=7){
  const set = new Set(); const from = dkey(addDays(new Date(),-(n-1)));
  S.sessions.forEach(s => { if (s.date >= from) set.add(s.date); });
  return set.size;
}
function lastGradePct(){
  if (!S.grades.length) return null;
  const g = S.grades.slice().sort((a,b)=>a.date<b.date?1:-1)[0];
  return g.total ? g.score/g.total*100 : null;
}
function examLabel(){ return onVacation() ? L.vacation : examGood() ? L.examsGood : L.examsBad; }
function examGood(){ if (onVacation() || cycleOn()) return true; const p = lastGradePct(); return studyDays(7) >= 4 || (p !== null && p >= 75); }
function streak(){
  const active = d => S.sessions.some(s=>s.date===d) || S.tasks.some(t=>t.date===d && t.status==="done");
  let n = 0, d = new Date();
  if (!active(dkey(d)) && !onVacation(dkey(d)) && !cycleOn(dkey(d))) d = addDays(d,-1);
  for (let i = 0; i < 400; i++){
    const kk = dkey(d);
    if (active(kk)) n++; else if (!onVacation(kk) && !cycleOn(kk)) break;
    d = addDays(d,-1);
  }
  return n;
}
function minsOn(day){ return S.sessions.filter(s=>s.date===day).reduce((a,s)=>a+s.mins,0); }
const hm = m => m >= 60 ? (Math.floor(m/60) + " س" + (m%60 ? " و" + (m%60) + " د" : "")) : (m + " د");

/* ================= UI shell ================= */
let tapCount = 0, tapTimer = null;
const U = {authMode:"signup", ag:"f", rel:"muslim", busy:false, admin:null, edit:"me"};
function render(){
  applyTheme();
  const app = $("#app");
  if (CLOUD && UID && !S){ app.innerHTML = `<div class="auth"><div class="logo">🌍</div><p class="center muted">بنجهّز دنيتك… 🌸</p></div>`; $("#tabs")?.remove(); return; }
  if (!S || !S.user){ app.innerHTML = gx(authView(), U.ag === "m" && U.authMode !== "login"); $("#tabs")?.remove(); return; }
  if (ME && ME.banned){ app.innerHTML = `<div class="auth"><div class="logo">⛔</div><h1>الحساب موقوف</h1><p class="center muted">الحساب ده اتوقف من إدارة التطبيق. لو فاكرة إن ده غلط، كلّمي صاحب التطبيق.</p><button class="btn ghost" data-act="logout">خروج</button></div>`; app.innerHTML = gx(app.innerHTML); $("#tabs")?.remove(); return; }
  const v = {home:homeView, money:moneyView, day:dayView, study:studyView, diary:diaryView, settings:settingsView, partner:partnerView, mate:mateView, admin:adminView}[S.tab] || homeView;
  app.innerHTML = `
    <header class="top">
      <button class="brand" id="brand" aria-label="${esc(L.app)}">${esc(L.app)}</button>
      <button class="iconbtn" data-act="tab" data-v="settings" aria-label="الإعدادات">⚙️</button>
    </header>
    <main class="view">${v()}</main>`;
  app.innerHTML = gx(app.innerHTML);
  let nav = $("#tabs");
  if (!nav){ nav = document.createElement("nav"); nav.id="tabs"; nav.className="tabs"; document.body.appendChild(nav); }
  const tabs = [["home","🏠","الرئيسية"],["money","💸","الفلوس"],["day","🗓️","يومنا"],["study","📚","المذاكرة"],["diary","📔","حكاياتي"]];
  if (P && P.linked) tabs.push(["mate","💞", P.user && P.user.gender === "m" ? "شريكي" : "شريكتي"]);
  nav.innerHTML = gx(`<div class="in">${tabs.map(([k,e,t])=>`<button data-act="tab" data-v="${k}" ${S.tab===k?'aria-current="page"':""}><span class="e">${e}</span>${t}</button>`).join("")}</div>`);
  tickTimer();
}
function go(tab){ S.tab = tab; save(); render(); if (tab==="diary") window.scrollTo({top:document.body.scrollHeight}); else window.scrollTo({top:0}); }
function toast(t){ const d = document.createElement("div"); d.className="toast"; d.textContent = isMale() ? mascRaw(t) : String(t); document.body.appendChild(d); setTimeout(()=>d.remove(),1900); }
function sheet(html, onMount){
  const layer = $("#layer");
  layer.innerHTML = `<div class="scrim" data-act="close-scrim"><div class="sheet" role="dialog" aria-modal="true"><div class="grab"></div>${gx(html, isMale() && U.edit !== "mate")}</div></div>`;
  const first = layer.querySelector("input,textarea,select"); if (first && !matchMedia("(pointer:coarse)").matches) setTimeout(()=>first.focus(),60);
  onMount && onMount(layer.querySelector(".sheet"));
}
let sheetLocked = false;
function closeSheet(){ sheetLocked = false; $("#layer").innerHTML = ""; }
function message(emoji, text, from = "منه 💌"){
  sheet(`<div class="popmsg"><div class="em">${emoji}</div><p>${esc(text)}</p><small>${escP(from)}</small></div>
    <button class="btn block" data-act="close" style="margin-top:14px">تسلم 🤍</button>`);
}

/* ================= views ================= */
function homeView(){
  const t = new Date(), k = dkey(t), mi = moneyInfo(), mood = S.moods[k];
  const hour = t.getHours();
  const greet = hour < 12 ? "صباح الخير" : hour < 18 ? "إزيك" : "مساء الخير";
  const today = S.tasks.filter(x=>x.date===k), doneN = today.filter(x=>x.status==="done").length;
  const lectures = S.schedule.filter(s=>s.day===t.getDay()).sort((a,b)=>a.start<b.start?-1:1);
  const next = onVacation() ? null : lectures.find(l => l.end > t.toTimeString().slice(0,5));
  const care = S.care[k] || {water:0,sleep:0};
  const st = streak(), good = examGood();
  const upcoming = S.exams.filter(e=>e.date>=k).sort((a,b)=>a.date<b.date?-1:1)[0];
  const love = S._love || (S._love = pick(S.msgs.love));
  return `
  <section class="hello">
    <h1>${greet} يا ${esc(S.user.name)} ${hour<18?"☀️":"🌙"}</h1>
    <p>${prettyDate(t)}</p>
  </section>

  ${S.user.gender !== "m" && cycleOn() ? `<div class="card tint"><div class="row between"><h3>🤍 دلع زيادة الأيام دي</h3><button class="x" data-act="new-pmsg" aria-label="رسالة تانية">🔄</button></div>
    <p style="margin:6px 0 4px;font-weight:700;font-size:17px">${esc(S._pmsg || (S._pmsg = pick(S.msgs.period)))}</p>
    <p class="muted small" style="margin:0">💡 ${CARE_TIPS[new Date().getDate() % CARE_TIPS.length]}</p></div>` : ""}
  <div class="letter"><div class="row between"><span class="lbl">${esc(L.love)}</span><button class="x" data-act="new-love" aria-label="رسالة تانية">🔄</button></div><p>${esc(love)}</p></div>

  <div class="card">
    <div class="row between"><h2>${L.mood} النهارده</h2>${mood?`<span class="pill">${MOODS.find(m=>m.k===mood).e} ${MOODS.find(m=>m.k===mood).t}</span>`:""}</div>
    <div class="moods" style="margin-top:10px">${MOODS.map(m=>`<button data-act="mood" data-v="${m.k}" aria-pressed="${mood===m.k}" aria-label="${m.t}">${m.e}<span>${m.t}</span></button>`).join("")}</div>
  </div>

  <div class="grid2">
    <button class="card" data-act="tab" data-v="money" style="text-align:right;border:0">
      <div class="row between"><h3>${L.money}</h3><span class="pill ${mi.state==="ok"?"good":mi.state==="near"?"warn":"bad"}">${L.left[mi.state]}</span></div>
      <div class="big num" style="margin-top:8px">${fmt(Math.max(0,mi.left))} <small>جنيه فاضلين</small></div>
      <div class="muted small" style="margin-top:4px">${L.daily}: تقدري تصرفي النهارده <b class="num">${fmt(Math.max(0,mi.todayLeft))}</b> جنيه</div>
    </button>

    <button class="card" data-act="tab" data-v="day" style="text-align:right;border:0">
      <div class="row between"><h3>${L.day}</h3><span class="pill">${doneN}/${today.length} ✅</span></div>
      <div style="margin-top:8px">${next?`<div class="t"><b>${esc(next.title)}</b></div><div class="muted small num">${next.start} – ${next.end}${next.place?" · "+esc(next.place):""}</div>`:`<div class="muted">مفيش محاضرات تانية النهارده 🎈</div>`}</div>
      <div class="bar" style="margin-top:10px"><i style="width:${today.length?doneN/today.length*100:0}%"></i></div>
    </button>

    <button class="card" data-act="tab" data-v="study" style="text-align:right;border:0">
      <div class="row between"><h3>${examLabel()}</h3><span class="pill">${L.streak} ${st}</span></div>
      <div style="margin-top:8px">${upcoming?`<b>${esc(upcoming.type)} ${esc(upcoming.subject)}</b> <span class="muted">بعد</span> <b class="num">${Math.round((fromKey(upcoming.date)-fromKey(k))/864e5)}</b> <span class="muted">يوم</span>`:`<span class="muted">مفيش امتحانات جاية</span>`}</div>
      <div class="muted small">ذاكرتي النهارده ${hm(minsOn(k))}</div>
    </button>

    <div class="card">
      <h3>${L.care}</h3>
      <div class="sectionlbl" style="margin:8px 0 4px">💧 كوبايات المية</div>
      <div class="cups">${Array.from({length:8},(_,i)=>`<button data-act="water" data-v="${i+1}" class="${i<care.water?"f":""}" aria-label="${i+1} كوباية">💧</button>`).join("")}</div>
      <div class="row between wrap" style="margin-top:10px"><span class="sectionlbl" style="margin:0">💅 اهتميتي بنفسك النهارده</span><span class="muted small num">${care.stars||0} من 5</span></div>
      <div class="stars" style="margin-top:4px">${Array.from({length:5},(_,i)=>`<button data-act="star" data-v="${i+1}" class="${i<(care.stars||0)?"f":""}" aria-label="${i+1} نجوم">⭐</button>`).join("")}</div>
      <div class="row between" style="margin-top:10px"><span class="sectionlbl" style="margin:0">😴 نمتي كام ساعة؟</span>
        <div class="row"><button class="mini" data-act="sleep" data-v="-1" aria-label="أقل">−</button><b class="num">${care.sleep}</b><button class="mini" data-act="sleep" data-v="1" aria-label="أكتر">+</button></div></div>
      ${prayersBlock(k)}
      ${S.user.gender !== "m" ? cycleBlock() : ""}
    </div>
  </div>

  <div class="card">
    <h3>آخر 7 أيام</h3>
    <div class="week" style="margin-top:10px">${Array.from({length:7},(_,i)=>{const d=addDays(t,i-6),kk=dkey(d),m=S.moods[kk];return `<div class="${kk===k?"today":""}"><b>${m?MOODS.find(x=>x.k===m).e:"·"}</b>${SHORT[d.getDay()]}</div>`}).join("")}</div>
  </div>

  <button class="btn ghost block" data-act="week-summary">${L.week} · ملخص الأسبوع</button>
  `;
}

function moneyView(){
  const mi = moneyInfo(), {start,end} = periodRange();
  const byCat = CATS.map(c=>({...c, sum: mi.list.filter(e=>e.cat===c.k).reduce((a,e)=>a+e.amt,0)})).filter(c=>c.sum>0).sort((a,b)=>b.sum-a.sum);
  const pct = S.money.allowance ? Math.min(100, mi.spent/S.money.allowance*100) : 0;
  const groups = {};
  mi.list.slice().sort((a,b)=>a.date<b.date?1:-1).forEach(e => (groups[e.date] = groups[e.date] || []).push(e));
  return `
  <section class="hello"><h1>${L.money}</h1><p>${S.money.period==="week"?"الأسبوع ده":"شهر "+MONTHS[start.getMonth()]} · فاضل <span class="num">${mi.daysLeft}</span> يوم</p></section>
  <div class="card tint">
    <div class="row between"><span class="pill ${mi.state==="ok"?"good":mi.state==="near"?"warn":"bad"}">${L.left[mi.state]}</span><button class="btn ghost small" data-act="allowance">المصروف: <span class="num">${fmt(S.money.allowance)}</span></button></div>
    <div class="big num" style="margin-top:10px">${fmt(mi.left)} <small>جنيه فاضلين</small></div>
    <div class="bar" style="margin:12px 0 6px"><i style="width:${pct}%"></i></div>
    <div class="row between small muted"><span>صرفتي <b class="num">${fmt(mi.spent)}</b></span><span>من <b class="num">${fmt(S.money.allowance)}</b></span></div>
  </div>
  <div class="card">
    <div class="row between"><h3>${L.daily}</h3><span class="muted small">علشان الفلوس تكفّي لآخر ${S.money.period==="week"?"الأسبوع":"الشهر"}</span></div>
    <div class="row between" style="margin-top:6px">
      <div><div class="big num" style="font-size:30px">${fmt(Math.max(0,mi.todayLeft))}</div><div class="muted small">تقدري تصرفيهم النهارده</div></div>
      <div style="text-align:left"><div class="num" style="font-weight:700">${fmt(mi.todaySpent)} / ${fmt(mi.daily)}</div><div class="muted small">صرفتي النهارده</div></div>
    </div>
    ${mi.todaySpent > mi.daily && mi.daily>0 ? `<div class="notice" style="margin-top:10px">صرفتي النهارده أكتر من المسموح بـ <b class="num">${fmt(mi.todaySpent-mi.daily)}</b> جنيه، بكرة نهدّي شوية 🙈</div>`:""}
  </div>
  <button class="btn block" data-act="add-exp">＋ صرفت حاجة</button>
  ${byCat.length?`<div class="card"><h3>صرفتي على إيه؟</h3>
    <div class="cat-bar" style="margin:10px 0">${byCat.map(c=>`<i style="width:${c.sum/mi.spent*100}%;background:${c.c}" title="${c.t}"></i>`).join("")}</div>
    <div class="legend">${byCat.map(c=>`<span><i style="background:${c.c}"></i>${c.e} ${c.t} <b class="num">${fmt(c.sum)}</b></span>`).join("")}</div></div>`:""}
  <div class="card"><h3>المصاريف</h3>
    ${Object.keys(groups).length? Object.entries(groups).map(([d,arr])=>`
      <div class="sectionlbl" style="margin:12px 4px 6px">${d===dkey()?"النهارده":prettyDate(fromKey(d))} · <span class="num">${fmt(arr.reduce((a,e)=>a+e.amt,0))}</span></div>
      <ul class="list">${arr.map(e=>{const c=CATS.find(x=>x.k===e.cat)||CATS[7];return `<li class="item"><span class="ic">${c.e}</span><div class="grow"><div class="t">${esc(e.note||c.t)}</div><div class="s">${c.t}</div></div><b class="num">${fmt(e.amt)}</b><button class="x" data-act="del-exp" data-v="${e.id}" aria-label="امسحي">✕</button></li>`}).join("")}</ul>`).join("")
    : `<div class="empty">لسه مصرفتيش حاجة ✨</div>`}
  </div>`;
}

function dayView(){
  const t = new Date(), k = dkey(t);
  S._dayOff = S._dayOff || 0;
  const d = addDays(t, S._dayOff), dk = dkey(d);
  const lectures = S.schedule.filter(s=>s.day===d.getDay()).sort((a,b)=>a.start<b.start?-1:1);
  const tasks = S.tasks.filter(x=>x.date===dk);
  const doneN = tasks.filter(x=>x.status==="done").length, lazyN = tasks.filter(x=>x.status==="lazy").length;
  return `
  <section class="hello"><h1>${L.day}</h1><p>${prettyDate(d)}</p></section>
  <div class="seg">
    <button data-act="dayoff" data-v="-1" aria-pressed="${S._dayOff===-1}">امبارح</button>
    <button data-act="dayoff" data-v="0" aria-pressed="${S._dayOff===0}">النهارده</button>
    <button data-act="dayoff" data-v="1" aria-pressed="${S._dayOff===1}">بكرة</button>
  </div>
  <div class="card">
    <div class="row between"><h3>المحاضرات 🎓</h3><button class="btn ghost small" data-act="edit-schedule">الجدول الثابت</button></div>
    <ul class="list" style="margin-top:10px">${onVacation(dk)?`<li class="empty">إجازة، مفيش محاضرات 🏖️</li>`:lectures.length?lectures.map(l=>`<li class="item"><span class="ic">🎓</span><div class="grow"><div class="t">${esc(l.title)}</div><div class="s num">${l.start} – ${l.end}${l.place?" · "+esc(l.place):""}</div></div></li>`).join(""):`<li class="empty">مفيش محاضرات ${S._dayOff===1?"بكرة":S._dayOff===-1?"امبارح":"النهارده"} 🎈</li>`}</ul>
  </div>
  <div class="card">
    <div class="row between"><h3>${L.tasks}</h3><span class="row" style="gap:6px"><span class="pill good">${doneN} ✅</span><span class="pill warn">${lazyN} 🙈</span></span></div>
    <ul class="list" style="margin-top:10px">${tasks.length?tasks.map(x=>`
      <li class="item ${x.status||""}"><div class="grow"><div class="t">${esc(x.title)}</div></div>
        <button class="mini ${x.status==="done"?"on-good":""}" data-act="task" data-v="${x.id}" data-s="done">${L.done}</button>
        <button class="mini ${x.status==="lazy"?"on-warn":""}" data-act="task" data-v="${x.id}" data-s="lazy">${L.lazy}</button>
        <button class="x" data-act="del-task" data-v="${x.id}" aria-label="امسحي">✕</button></li>`).join(""):`<li class="empty">ضيفي مهماتك 🌷</li>`}</ul>
    <form class="row" data-form="task" style="margin-top:10px"><input class="in" id="newtask" placeholder="مهمة جديدة…" autocomplete="off"><button class="btn small" type="submit">ضيفي</button></form>
  </div>
  <div class="card tint row between"><div><h3>${L.streak}</h3><div class="muted small">أيام ورا بعض عملتي فيها حاجة أو ذاكرتي</div></div><div class="big num">${streak()}</div></div>
  <button class="btn ghost block" data-act="week-summary">${L.week} · ملخص الأسبوع</button>`;
}

function studyView(){
  const k = dkey(), good = examGood(), p = lastGradePct();
  const tm = S.timer;
  let remain = dur("focus"), total = dur("focus"), mode = "focus", running = false;
  if (tm){ mode = tm.mode; total = tm.total; remain = tm.end ? Math.max(0, Math.round((tm.end-Date.now())/1000)) : tm.remain; running = !!tm.end; }
  const pct = (1 - remain/total) * 100;
  const subj = (tm && tm.subject) || S.subjects[0] || "";
  const exams = S.exams.slice().sort((a,b)=>a.date<b.date?-1:1);
  const grades = S.grades.slice().sort((a,b)=>a.date<b.date?1:-1);
  const avg = s => { const g = S.grades.filter(x=>x.subject===s); return g.length ? g.reduce((a,x)=>a+x.score/x.total*100,0)/g.length : null; };
  const weekMins = s => { const from = dkey(addDays(new Date(),-6)); return S.sessions.filter(x=>x.subject===s && x.date>=from).reduce((a,x)=>a+x.mins,0); };
  return `
  <section class="hello"><h1>${L.study}</h1><p>ذاكرتي النهارده ${hm(minsOn(k))} · ${L.streak} <b class="num">${streak()}</b></p></section>
  <div class="card">
    <div class="seg"><button data-act="tmode" data-v="focus" aria-pressed="${mode==="focus"}">${L.focus} · <span class="num">${S.durations.focus}</span> د</button><button data-act="tmode" data-v="rest" aria-pressed="${mode==="rest"}">${L.rest} · <span class="num">${S.durations.rest}</span> د</button></div>
    <div class="timer">
      <div class="ring" id="ring" style="--p:${pct}"><div><b class="num" id="tleft">${String(Math.floor(remain/60)).padStart(2,"0")}:${String(remain%60).padStart(2,"0")}</b><span>${mode==="focus"?L.focus:L.rest}</span></div></div>
      ${mode==="focus"?`<div class="chips" style="justify-content:center">${S.subjects.map(s=>`<button class="chip" data-act="tsubj" data-v="${esc(s)}" aria-pressed="${s===subj}">${esc(s)}</button>`).join("")}<button class="chip" data-act="add-subject">＋ مادة</button></div>`:""}
      <div class="row"><button class="btn" data-act="tstart">${running?"⏸️ استنّي":"▶️ يلا"}</button><button class="btn ghost" data-act="treset">من الأول</button></div>
      <button class="btn ghost small" data-act="durations">⏱️ غيّري الوقت</button>
    </div>
  </div>

  <div class="card ${onVacation()?"tint":""}">
    <div class="row between"><div><h3>🏖️ الإجازة</h3><div class="muted small">${onVacation()?`${S.vacation.type==="end"?"إجازة آخر السنة":"إجازة نص السنة"}${S.vacation.until?` لحد ${prettyDate(fromKey(S.vacation.until))}`:""} · استمتعي يا ${esc(S.user.name)} 😌`:"لو في إجازة، شغّليها ومش هتتحسب عليكي أيام المذاكرة"}</div></div>
    <button class="switch" data-act="vacation" role="switch" aria-checked="${onVacation()}" aria-label="أنا في إجازة"><i></i></button></div>
  </div>
  <div class="card ${good?"tint":""}">
    <div class="row between"><h2>${examLabel()}</h2><button class="btn ghost small" data-act="add-exam">＋ امتحان</button></div>
    <div class="muted small" style="margin-top:2px">${onVacation()?"الإجازة مش بتتحسب عليكي، والسلسلة مش هتتقطع 🔥 · ":""}${good?"شغالة مذاكرة أو درجاتك حلوة، كمّلي كده 💪":"يلا نذاكر شوية أو نجيب درجة حلوة ونطلع إفراج 😌"} · ذاكرتي <b class="num">${studyDays(7)}</b> من 7 أيام${p!==null?` · آخر درجة <b>${pc(p)}</b>`:""}</div>
    <ul class="list" style="margin-top:10px">${exams.length?exams.map(e=>{const n=Math.round((fromKey(e.date)-fromKey(k))/864e5);return `<li class="item"><span class="ic">${n<0?"✔️":"⏳"}</span><div class="grow"><div class="t">${esc(e.type)} ${esc(e.subject)}</div><div class="s">${prettyDate(fromKey(e.date))}</div></div><b class="num">${n<0?"خلص":n===0?"النهارده!":n+" يوم"}</b><button class="x" data-act="del-exam" data-v="${e.id}" aria-label="امسحي">✕</button></li>`}).join(""):`<li class="empty">مفيش امتحانات متسجلة</li>`}</ul>
  </div>

  <div class="card">
    <div class="row between"><h3>درجاتي 🎓</h3><button class="btn small" data-act="add-grade">＋ سجّلي درجة</button></div>
    <ul class="list" style="margin-top:10px">${grades.length?grades.map(g=>{const pc=g.score/g.total*100;return `<li class="item"><span class="ic">${pc>=75?"🌟":pc>=50?"🙂":"🫂"}</span><div class="grow"><div class="t">${esc(g.type)} ${esc(g.subject)}</div><div class="s">${prettyDate(fromKey(g.date))}</div></div><span class="pill ${pc>=75?"good":pc>=50?"warn":"bad"} num">${g.score} من ${g.total}</span><button class="x" data-act="del-grade" data-v="${g.id}" aria-label="امسحي">✕</button></li>`}).join(""):`<li class="empty">لسه مفيش درجات</li>`}</ul>
  </div>

  <div class="card"><h3>المواد</h3>
    <ul class="list" style="margin-top:10px">${S.subjects.map(s=>{const a=avg(s);return `<li class="item"><span class="ic">📘</span><div class="grow"><div class="t">${esc(s)}</div><div class="s">الأسبوع ده ${hm(weekMins(s))}</div></div>${a!==null?`<span class="pill">متوسط ${pc(a)}</span>`:""}</li>`}).join("")}</ul>
  </div>`;
}

function diaryView(){
  const list = S.diary.filter(e=>e.chat===S.chatId).sort((a,b)=>a.ts-b.ts);
  let last = "", out = "";
  list.forEach(e => {
    const d = new Date(e.ts), dk = dkey(d), tm = d.toTimeString().slice(0,5);
    if (dk !== last){ last = dk; out += `<div class="daysep">${dk===dkey()?"النهارده":prettyDate(d)}</div>`; }
    if (e.from === "him"){ out += `<div class="msg him"><div class="bub real"><small class="from">💌 ${P&&P.user&&P.user.gender==="f"?"منها":"منه"} بجد</small>${esc(e.text)}<span class="tm num">${tm}</span></div>${CLOUD?`<button class="x small" data-act="report" data-v="${esc(e.id)}" aria-label="بلّغي" title="بلّغي">🚩</button>`:""}</div>`; return; }
    out += `<div class="msg me"><div class="bub">${esc(e.text)}<span class="tm num">${tm}</span></div></div>`;
    out += e.reply
      ? `<div class="msg him"><div class="bub">${esc(e.reply)}<span class="tm num">${tm}</span></div></div>`
      : `<div class="msg him"><div class="bub typing" aria-label="بيكتب"><i></i><i></i><i></i></div></div>`;
  });
  return `
  <section class="hello"><h1>${L.diary}</h1><p>احكي يا ${esc(S.user.name)}، ${P&&P.linked&&P.user?esc(P.user.name)+" "+(P.user.gender==="f"?"سامعاك":"سامعك"):"هو سامعك"} 🤍</p></section>
  <div class="row"><button class="btn ghost small" data-act="new-chat">✨ شات جديد</button><button class="btn ghost small" data-act="old-chats">🗂️ الشاتات القديمة</button></div>
  <div class="chat" id="chat">${out || `<div class="empty">لسه مفيش حكايات… ابدئي إنتي 📔</div>`}</div>
  <form class="composer" data-form="diary">
    <textarea class="in" id="diarytext" rows="1" placeholder="احكي يا ${esc(S.user.name)}…" aria-label="اكتبي حكايتك"></textarea>
    <button class="send" type="submit" aria-label="ابعتي">➤</button>
  </form>`;
}

function withState(st, fn){ const keep = S; S = st; try { return fn(); } finally { S = keep; } }
function dashboard(o){
  const k = dkey(), sh = x => o.all || S.share[x] !== false, name = esc(o.name);
  const fem = o.gender !== "m";
  const lock = t => `<div class="card"><h3>${t}</h3><div class="lock" style="margin-top:8px">🔒 ${name} ${fem?"مخبّية":"مخبّي"} القسم ده</div></div>`;
  const mood = S.moods[k], m = mood && MOODS.find(x=>x.k===mood), care = S.care[k] || {water:0,sleep:0,stars:0};
  const chatAll = (S.diary||[]).filter(e=>e.chat===S.chatId).sort((a,b)=>a.ts-b.ts);
  const sadDiary = chatAll.some(e=>dkey(new Date(e.ts))===k && e.cat==="d_sad");
  const upset = sh("mood") && (mood==="sad"||mood==="stressed") || sh("diary") && sadDiary;
  const mi = moneyInfo(), tasks = S.tasks.filter(x=>x.date===k);
  const chat = o.fullChat ? chatAll : chatAll.slice(-8);
  const grades = S.grades.slice().sort((a,b)=>a.date<b.date?1:-1).slice(0,3);
  const ex = S.exams.filter(e=>e.date>=k).sort((a,b)=>a.date<b.date?-1:1)[0];
  const send = o.canReply ? `data-act="p-send"` : "disabled";
  return keep(`
  ${o.banner||""}
  <section class="hello"><h1>${o.title}</h1><p>${prettyDate(new Date())}</p></section>
  ${sh("care") && o.gender !== "m" && cycleOn() ? `<div class="card tint"><h3>🤍 ${name} محتاجة اهتمام ودلع زيادة الأيام دي</h3><p class="small" style="margin:4px 0 10px">اهتم بيها أكتر، ابعتلها كلمة حلوة أو جيبلها حاجة بتحبها.</p><button class="btn small" ${send}>💌 ابعتلها</button></div>` : ""}
  ${upset?`<div class="card alert"><h3>🚨 ${name} ${fem?"مضايقة":"مضايق"}</h3><p class="small" style="margin:4px 0 10px">${m&&(mood==="sad"||mood==="stressed")?`${fem?"اختارت":"اختار"} ${m.e} ${m.t} النهارده`:(fem?"كتبت":"كتب")+" حكاية زعلانة"}، ${fem?"كلّمها":"كلّمه"} 🤍</p><button class="btn small" ${send}>💌 ابعت كلمة</button></div>`:""}
  <div class="grid2">
    ${sh("mood")?`<div class="card"><h3>النفسيه</h3><div class="big" style="margin-top:6px">${m?m.e+` <small>${m.t}</small>`:`<small>لسه ${fem?"مختارتش":"مختارش"}</small>`}</div></div>`:lock("النفسيه")}
    ${sh("care")?`<div class="card"><h3>${L.care}</h3><div class="stats" style="margin-top:8px"><div class="stat"><b class="num">${care.water||0}</b><span>💧 كوباية</span></div><div class="stat"><b class="num">${care.stars||0}/5</b><span>⭐ اهتمام</span></div><div class="stat"><b class="num">${care.sleep||0}</b><span>😴 ساعات</span></div></div>${(o.gender !== "m" && cycleOn()) || !isMuslim() ? "" : `<div class="muted small" style="margin-top:8px">الصلاة: <b class="num">${PRAYERS.filter(([p])=>(S.prayers[k]||{})[p]).length}</b> من 5</div>`}</div>`:lock(L.care)}
  </div>
  ${sh("diary")?`<div class="card"><div class="row between"><h3>${L.diary}</h3><button class="btn small" ${send}>ردّ بنفسك 💌</button></div>
    <div class="chat" style="padding-bottom:0;margin-top:10px">${chat.length?chat.map(e=>{const tm=new Date(e.ts).toTimeString().slice(0,5); const flag = o.admin && e.flagged ? " 🚩" : "";
      const del = o.admin ? `<button class="x" data-act="adm-delmsg" data-v="${esc(e.id)}" aria-label="امسح">🗑️</button>` : "";
      return e.from==="him"?`<div class="msg him"><div class="bub real"><small class="from">💌 ${o.admin?"الشريك":"إنت"}${flag}</small>${esc(e.text)}<span class="tm num">${tm}</span></div>${del}</div>`:`<div class="msg me">${del}<div class="bub">${esc(e.text)}${flag}<span class="tm num">${tm}</span></div></div>${e.reply?`<div class="msg him"><div class="bub"><small class="from">🤖 رد أوتوماتيك</small>${esc(e.reply)}</div></div>`:""}`}).join(""):`<div class="empty">مفيش رسايل في الشات ده لسه</div>`}</div></div>`:lock(L.diary)}
  ${sh("study")?`<div class="card"><div class="row between"><h3>${examLabel()}</h3><span class="pill">${L.streak} ${streak()}</span></div>
    <div class="muted small" style="margin-top:4px">ذاكر النهارده ${hm(minsOn(k))} · ${studyDays(7)} من 7 أيام${ex?` · ${esc(ex.type)} ${esc(ex.subject)} بعد ${Math.round((fromKey(ex.date)-fromKey(k))/864e5)} يوم`:""}</div>
    <ul class="list" style="margin-top:10px">${grades.map(g=>{const p=g.score/g.total*100;return `<li class="item"><div class="grow t">${esc(g.type)} ${esc(g.subject)}</div><span class="pill ${p>=75?"good":p>=50?"warn":"bad"} num">${g.score} من ${g.total}</span></li>`}).join("")}</ul></div>`:lock(L.study)}
  <div class="grid2">
    ${sh("day")?`<div class="card"><h3>${L.day}</h3><ul class="list" style="margin-top:8px">${tasks.length?tasks.map(x=>`<li class="item ${x.status||""}"><div class="grow t">${esc(x.title)}</div><span class="small">${x.status==="done"?"✅":x.status==="lazy"?"🙈":"⏳"}</span></li>`).join(""):`<li class="empty">مفيش مهمات النهارده</li>`}</ul></div>`:lock(L.day)}
    ${sh("money")?`<div class="card"><div class="row between"><h3>الفلوس</h3><span class="pill ${mi.state==="ok"?"good":mi.state==="near"?"warn":"bad"}">${L.left[mi.state]}</span></div><div class="big num" style="margin-top:8px">${fmt(mi.left)} <small>جنيه فاضلين</small></div></div>`:lock("الفلوس")}
  </div>
  ${o.footer||""}`, o.gender);
}
function prayersBlock(k){
  if (!isMuslim()) return "";
  const pr = S.prayers[k] || {}, n = PRAYERS.filter(([p])=>pr[p]).length;
  if (S.user.gender !== "m" && cycleOn(k)) return `<div class="row between" style="margin-top:12px"><span class="sectionlbl" style="margin:0">الصلاة</span><span class="muted small">معذورة الأيام دي، ربنا يتقبل منك</span></div>`;
  return `<div class="row between" style="margin-top:12px"><span class="sectionlbl" style="margin:0">الصلاة</span><span class="muted small num">${n} من 5</span></div>
    <div class="prayers">${PRAYERS.map(([p,t])=>`<button data-act="pray" data-v="${p}" aria-pressed="${!!pr[p]}">${t}</button>`).join("")}</div>`;
}
function cycleBlock(){
  const c = S.cycle || {};
  if (cycleOn()) return `<div class="row between" style="margin-top:12px"><div><span class="sectionlbl" style="margin:0">${cycleName()}</span><div class="muted small">باقي <b class="num">${cycleLeft()}</b> ${cycleLeft()===1?"يوم":"أيام"} · لحد ${prettyDate(addDays(fromKey(c.start),(c.days||7)-1))}</div></div><button class="mini" data-act="cycle-end">خلص</button></div>`;
  const nx = nextCycle();
  const hint = !nx ? "" : nx.days > 1 ? `المرة الجاية متوقعة بعد <b class="num">${nx.days}</b> يوم · حوالي ${prettyDate(nx.date)}` : nx.days >= -3 ? "ممكن تيجي في أي وقت الأيام دي 🤍" : `اتأخرت <b class="num">${-nx.days}</b> يوم عن المتوقع`;
  return `<div class="row between" style="margin-top:12px"><div><span class="sectionlbl" style="margin:0">${cycleName()}</span>${hint?`<div class="muted small">${hint}</div>`:""}</div><button class="mini" data-act="cycle-start">جالي</button></div>`;
}
function cycleSheet(){
  const linked = CLOUD && P && P.linked;
  sheet(`<h2>${cycleName()} 🤍</h2>
  <form class="form" data-form="cycle">
    <div class="two"><label class="f">بدأ يوم<input class="in num" type="date" id="cy-start" value="${dkey()}" max="${dkey()}" required></label>
    <label class="f">بيقعد كام يوم؟<input class="in num" type="number" id="cy-days" min="2" max="12" value="${avgCycleDays()}" required inputmode="numeric"></label></div>
    ${(S.cycle.history||[]).length ? `<p class="muted small" style="margin:0">المتوسط من المرات اللي فاتت: <b class="num">${avgCycleDays()}</b> أيام</p>` : ""}
    ${linked ? `<label class="item" style="cursor:pointer"><input type="checkbox" id="cy-tell" checked style="width:20px;height:20px;accent-color:var(--accent)"><div class="grow"><div class="t">ابعتي لـ${esc(P.user.name)} يهتم بيكي أكتر</div><div class="s">هيوصله إنك محتاجة اهتمام ودلع زيادة الأيام دي، من غير ما نقوله السبب</div></div></label>` : ""}
    <button class="btn" type="submit">تمام</button>
  </form>`);
}
function partnerView(){
  return dashboard({name:S.user.name, gender:S.user.gender, title:`${S.user.gender==="m"?"شريكي":"شريكتي"} 💞 ${esc(S.user.name)}`, canReply:false,
    banner:`<div class="banner"><span>👀 ده اللي شريكك بيشوفه منك</span><button class="btn small" data-act="tab" data-v="settings">رجوع</button></div>`});
}
function mateView(){
  if (!P || !P.linked || !P.user) return `<div class="card"><p class="empty">مستنيين ${P&&P.user?esc(P.user.name):"شريكك"} يوافق على الربط 💌</p></div>`;
  return withState(P, () => dashboard({name:P.user.name, gender:P.user.gender, title:`${P.user.gender==="m"?"شريكي":"شريكتي"} 💞 ${esc(P.user.name)}`, canReply:true,
    footer:`<button class="btn ghost block" data-act="p-msgs">✏️ رسايلي ${P.user.gender==="m"?"ليه":"ليها"} وردود "لو ${P.user.gender==="m"?"قال":"قالت"}…"</button>`}));
}
function adminView(){
  if (!IS_ADMIN) return `<div class="card"><p class="empty">الصفحة دي لصاحب التطبيق بس 👑</p></div>`;
  const A = U.admin || (U.admin = {users:null, reports:null, sel:null, st:null, q:""});
  if (!A.users){ loadAdmin(); return `<section class="hello"><h1>👑 لوحة التحكم</h1></section><div class="card"><p class="empty">بنحمّل…</p></div>`; }
  if (A.sel && A.st){
    const u = A.users.find(x=>x.id===A.sel) || {};
    return withState(A.st, () => dashboard({name:u.name||"", gender:u.gender, title:`👤 ${esc(u.name||"")} <small class="muted">@${esc(u.username||"")}</small>`, all:true, admin:true, fullChat:true, canReply:false,
      banner:`<div class="banner"><span>👑 عرض إداري · ${u.partner?"مربوط بـ "+esc((A.users.find(x=>x.id===u.partner)||{}).name||"?"):"مش مربوط"}</span><button class="btn small" data-act="adm-back">رجوع</button></div>
      <div class="row wrap"><button class="btn ${u.banned?"":"danger"} small" data-act="adm-ban" data-v="${esc(u.id)}">${u.banned?"✅ فك الإيقاف":"⛔ وقف الحساب"}</button>${u.partner?`<button class="btn ghost small" data-act="adm-unlink" data-v="${esc(u.id)}">💔 فك الربط</button>`:""}</div>`}));
  }
  const q = A.q.trim().toLowerCase();
  const list = A.users.filter(u => !q || (u.name||"").toLowerCase().includes(q) || (u.username||"").includes(q));
  return `<section class="hello"><h1>👑 لوحة التحكم</h1><p>إدارة التطبيق ومنع الإساءة</p></section>
  <div class="stats"><div class="stat"><b class="num">${A.users.length}</b><span>حساب</span></div><div class="stat"><b class="num">${A.users.filter(u=>u.partner).length}</b><span>مربوطين</span></div><div class="stat"><b class="num">${A.reports.length}</b><span>محتاج مراجعة</span></div></div>
  <div class="card"><h3>🔑 طلبات الباسورد</h3>
    <ul class="list" style="margin-top:10px">${(A.resets||[]).length?A.resets.map(r=>{const u=A.users.find(x=>x.username===r.username); return `<li class="item" style="flex-wrap:wrap"><span class="ic">🔑</span><div class="grow"><div class="t">@${esc(r.username)} ${u?"· "+esc(u.name):"· ❓ مش موجود"}</div><div class="s" dir="auto">📞 ${esc(r.contact)}${r.note?" · "+esc(r.note):""}</div>
      ${r.status==="approved"?`<div class="s">⏳ هيتغيّر خلال 5 لـ 15 دقيقة لـ: <b class="num" dir="ltr">${esc(r.temp||"")}</b></div>`:r.status==="done"?`<div class="s">✅ اتغيّر: <b class="num" dir="ltr">${esc(r.temp||"")}</b> ابعتهولها</div>`:r.status==="notfound"?`<div class="s">❓ اليوزر ده مش موجود</div>`:""}</div>
      ${r.status==="new"&&u?`<button class="mini" data-act="adm-reset" data-v="${esc(r.id)}">اعمل باسورد مؤقت</button>`:""}<button class="x" data-act="adm-rdel" data-v="${esc(r.id)}" aria-label="امسح">✕</button></li>`}).join(""):`<li class="empty">مفيش طلبات</li>`}</ul>
    <p class="muted small" style="margin:8px 0 0">⚠️ اتأكد إن اللي طالب هو صاحب الحساب فعلًا قبل ما تعمل الباسورد.</p></div>
  <div class="card"><h3>🚩 محتاج مراجعة</h3><ul class="list" style="margin-top:10px">${A.reports.length?A.reports.map(r=>`<li class="item"><span class="ic">${r.kind==="auto"?"🤖":"🚩"}</span><div class="grow"><div class="t">${esc(r.text||"")}</div><div class="s">${r.kind==="auto"?"الفلتر علّمها":"بلاغ"} · كتبها ${esc((A.users.find(x=>x.id===r.author)||{}).name||"?")}</div></div>
    <button class="mini" data-act="adm-open" data-v="${esc(r.owner||"")}">افتح</button><button class="mini" data-act="adm-rmmsg" data-v="${esc(r.id)}">🗑️ امسح الرسالة</button><button class="x" data-act="adm-dismiss" data-v="${esc(r.id)}" aria-label="تجاهل">✕</button></li>`).join(""):`<li class="empty">مفيش حاجة ✨</li>`}</ul></div>
  <div class="card"><div class="row between"><h3>👥 الحسابات</h3><button class="btn ghost small" data-act="adm-reload">🔄</button></div>
    <input class="in" id="adm-q" placeholder="دوّر بالاسم أو اليوزر" value="${esc(A.q)}" style="margin-top:10px">
    <ul class="list" style="margin-top:10px">${list.map(u=>`<li><button class="item" style="width:100%;border:0;text-align:right" data-act="adm-open" data-v="${esc(u.id)}"><span class="ic">${u.gender==="m"?"🧢":"🎀"}</span><div class="grow"><div class="t">${esc(u.name)} ${u.banned?"⛔":""}</div><div class="s">@${esc(u.username)}${u.partner?" · 💞 "+esc((A.users.find(x=>x.id===u.partner)||{}).name||""):""}</div></div></button></li>`).join("")}</ul></div>`;
}
async function loadAdmin(){
  const A = U.admin;
  try {
    A.users = (await fb.list("users", 1000)).sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));
    A.reports = await fb.list("reports", 200);
    A.resets = await fb.list("resetRequests", 100).catch(()=>[]);
  } catch(e){ A.users = []; A.reports = []; toast("مش قادر أحمّل البيانات"); }
  if (S.tab === "admin") render();
}
async function adminOpen(id){
  const A = U.admin; if (!id) return;
  A.sel = id; A.st = null; render();
  const st = blank();
  const secs = await Promise.all(Object.keys(SEC).map(sec => fb.get(`u/${id}/sec/${sec}`).catch(()=>null)));
  secs.forEach(d => d && Object.assign(st, d));
  st.diary = (await fb.list(`u/${id}/chat`, 1000, "ts").catch(()=>[])).reverse();
  st.chatId = st.chatId || "c0"; st.share = {};
  const allChats = new Set(st.diary.map(e=>e.chat)); if (allChats.size > 1) st.diary.forEach(e => e.chat = st.chatId);
  A.st = normalize(st); A.stUid = id; render(); window.scrollTo({top:0});
}
function partnerSendSheet(){
  sheet(`<h2>💌 ابعت رسالة</h2><form class="form" data-form="psend"><textarea class="in" id="ps-text" required placeholder="أنا جنبك يا نونو ❤️"></textarea><button class="btn" type="submit">ابعت</button></form>
  <p class="muted small" style="margin-top:8px">الرسالة هتظهر في دفتر حكاياتي بعلامة "💌 بجد".</p>`);
}
function partnerCard(){
  if (!CLOUD) return `<div class="card"><h3>💞 شريكك</h3><p class="muted small" style="margin:6px 0 10px">اربطي حسابك بشريك حياتك علشان يرد عليكي وتشاركوا يومكم مع بعض.</p><div class="notice">الربط بيشتغل في النسخة الحقيقية.</div></div>`;
  if (P && P.user && P.linked) return `<div class="card"><h3>💞 شريكك</h3><div class="item" style="margin-top:10px"><span class="ic">${P.user.gender==="m"?"🧢":"🎀"}</span><div class="grow"><div class="t">${esc(P.user.name)}</div><div class="s">@${esc(P.user.username)} · مربوطين 💞</div></div><button class="mini" data-act="unlink">💔 فكّ الربط</button></div></div>`;
  if (P && !P.linked) return `<div class="card"><h3>💞 شريكك</h3><p class="muted small" style="margin:6px 0 10px">اتبعت طلب الربط، مستنيين الطرف التاني يوافق 💌</p><button class="btn ghost small" data-act="unlink">إلغاء الطلب</button></div>`;
  return `<div class="card"><h3>💞 شريكك</h3>
    <p class="muted small" style="margin:6px 0 10px">ابعتي الكود بتاعك لشريك حياتك، أو اكتبي الكود بتاعه.</p>
    <div class="item"><span class="ic">🔗</span><div class="grow"><div class="t num" dir="ltr">${esc(ME.invite||"")}</div><div class="s">كود الدعوة بتاعك</div></div><button class="mini" data-act="copy" data-v="${esc(ME.invite||"")}">نسخ</button></div>
    <form class="row" data-form="code" style="margin-top:10px"><input class="in num" id="pcode" dir="ltr" placeholder="ABC123" maxlength="8" autocomplete="off" aria-label="كود الشريك"><button class="btn small" type="submit">اربط</button></form></div>`;
}
function settingsView(){
  return `
  <section class="hello"><h1>الإعدادات ⚙️</h1><p>${esc(S.user.name)} · @${esc(S.user.username)}</p></section>
  <div class="card"><h3>الثيم 🎨</h3>
    <div class="themes" style="margin-top:10px">${THEMES.map(t=>`<button data-act="theme" data-v="${t.k}" aria-pressed="${S.theme===t.k}"><span class="sw" style="background:linear-gradient(135deg,${t.a},${t.a2})"></span>${t.n}</button>`).join("")}</div>
    <div class="sectionlbl" style="margin:14px 4px 6px">🌙 الوضع الليلي</div>
    <div class="seg"><button data-act="dark" data-v="off" aria-pressed="${S.dark==="off"}">مقفول</button><button data-act="dark" data-v="auto" aria-pressed="${S.dark==="auto"}">لوحده بالليل</button><button data-act="dark" data-v="on" aria-pressed="${S.dark==="on"}">على طول</button></div>
  </div>
  <div class="card"><div class="row between"><h3>${L.alarm}</h3><button class="btn ghost small" data-act="test-morning">جرّبي</button></div>
    <label class="f" style="margin-top:10px">ميعاد الصحيان<input class="in num" type="time" id="wake" value="${S.alarm.wake}"></label>
    <div class="sectionlbl" style="margin:14px 4px 6px">🔔 التذكيرات</div>
    <ul class="list">${S.alarm.reminders.map(r=>`<li class="item"><span class="ic">🔔</span><div class="grow"><div class="t">${esc(r.text)}</div><div class="s num">${r.time}</div></div><button class="x" data-act="del-rem" data-v="${r.id}" aria-label="امسحي">✕</button></li>`).join("")}</ul>
    <button class="add" style="margin-top:8px" data-act="add-rem">＋ تذكير جديد</button>
    <div class="notice" style="margin-top:10px">على التابلت بيرنّوا حتى لو التطبيق مقفول. على الكمبيوتر بيرنّوا طول ما البرنامج مفتوح. على الآيفون استخدمي منبّه الآيفون مع Shortcuts (الشرح في موقع التحميل).</div>
  </div>
  <div class="card"><h3>🔒 شريكي يشوف إيه</h3>
    <p class="muted small" style="margin:6px 0 10px">إنتي اللي بتختاري. اللي تقفليه بيختفي من عنده على طول.</p>
    <ul class="list">${SHARE.map(([k,t])=>`<li class="item"><div class="grow t">${t}</div><button class="switch" data-act="share" data-v="${k}" role="switch" aria-checked="${S.share[k]!==false}" aria-label="${t}"><i></i></button></li>`).join("")}</ul>
    <div class="row wrap" style="margin-top:10px"><button class="btn small" data-act="tab" data-v="partner">👀 شوفي هو بيشوفك إزاي</button></div>
  </div>
  <div class="card"><h3>الديانة</h3><p class="muted small" style="margin:4px 0 10px">علشان نظبط الكلام والتذكيرات اللي تناسبك.</p>
    <div class="seg"><button data-act="set-rel" data-v="muslim" aria-pressed="${isMuslim()}">مسلمة</button><button data-act="set-rel" data-v="christian" aria-pressed="${!isMuslim()}">مسيحية</button></div></div>
  ${partnerCard()}
  ${CLOUD && ME ? `<div class="card"><h3>🔔 تنبيه لما ${ME.gender==="m"?"شريكتك":"شريكك"} ${ME.gender==="m"?"تبقى مضايقة":"يبقى مضايق"}</h3>
    <ol class="small" style="margin:8px 0 0;padding-inline-start:18px;line-height:1.9"><li>نزّل تطبيق <b>ntfy</b> (موجود على Google Play وApp Store ومتاح للكمبيوتر).</li><li>دوس <b>+</b> واكتب الاسم ده بالظبط:</li></ol>
    <div class="item" style="margin-top:6px"><div class="grow t num" dir="ltr" style="word-break:break-all">${esc(ME.ntfy||"")}</div><button class="mini" data-act="copy" data-v="${esc(ME.ntfy||"")}">نسخ</button></div>
    <p class="muted small" style="margin:8px 0 0">متقولش الاسم ده لحد، ده بتاعك إنت بس.</p></div>` : ""}
  ${IS_ADMIN ? `<button class="btn block" data-act="tab" data-v="admin">👑 لوحة التحكم</button>` : ""}
  <div class="card"><h3>${L.backup}</h3>
    <p class="muted small" style="margin:6px 0 10px">انسخي كل بياناتك في ملف نصي، أو رجّعيها من نسخة قديمة.</p>
    <div class="row wrap"><button class="btn ghost small" data-act="backup">انسخي نسخة</button><button class="btn ghost small" data-act="restore">رجّعي نسخة</button>${S.sample?`<button class="btn ghost small" data-act="clear-sample">امسحي البيانات التجريبية</button>`:""}</div>
  </div>
  ${CLOUD ? `<div class="card"><h3>🔑 غيّري الباسورد</h3>
    <form class="form" data-form="pass" style="margin-top:10px">
      <label class="f">الباسورد الحالي<input class="in" id="pw-cur" type="password" required autocomplete="current-password" dir="ltr"></label>
      <label class="f">الباسورد الجديد<input class="in" id="pw-new" type="password" required minlength="6" autocomplete="new-password" dir="ltr"></label>
      <div class="notice" id="pw-err" style="display:none;color:var(--bad);font-weight:700"></div>
      <button class="btn" type="submit">غيّري</button>
    </form></div>` : ""}
  <div class="card row between"><span class="muted small">دوسي 5 مرات على اسم التطبيق فوق… 🤫</span><button class="btn ghost small" data-act="logout">خروج</button></div>`;
}

function authView(){
  const login = U.authMode === "login";
  return `
  <div class="auth">
    <div class="logo">🌍</div>
    <h1>Nono's World</h1>
    <p class="center muted" style="margin:-8px 0 0">${login?"وحشتينا! ادخلي 💗":"اعملي حسابك وابدئي دنيتك 🌸"}</p>
    <form class="card form" data-form="auth">
      ${login?"":`<label class="f">اسمك (هنناديكي بيه)<input class="in" id="a-name" required placeholder="${U.ag==="m"?"محمد":"نونو"}"></label>`}
      <label class="f">اسم المستخدم (إنجليزي وأرقام)<input class="in" id="a-user" required autocomplete="username" dir="ltr" placeholder="nono" pattern="[A-Za-z0-9_.]{3,20}" title="من 3 لـ 20 حرف إنجليزي أو رقم"></label>
      <label class="f">الباسورد<input class="in" id="a-pass" type="password" required minlength="6" autocomplete="${login?"current-password":"new-password"}" dir="ltr"></label>
      ${login?"":`<div class="seg" role="group" aria-label="أنا"><button type="button" data-act="agender" data-v="f" aria-pressed="${(U.ag||"f")==="f"}">أنا بنت 🎀</button><button type="button" data-act="agender" data-v="m" aria-pressed="${U.ag==="m"}">أنا شاب 🧢</button></div>
      <div class="seg" role="group" aria-label="الديانة"><button type="button" data-act="arel" data-v="muslim" aria-pressed="${U.rel!=="christian"}">مسلمة</button><button type="button" data-act="arel" data-v="christian" aria-pressed="${U.rel==="christian"}">مسيحية</button></div>`}
      <div class="notice" id="a-err" style="display:none;color:var(--bad);font-weight:700"></div>
      <button class="btn" type="submit" ${U.busy?"disabled":""}>${U.busy?"لحظة…":login?"ادخلي":"اعملي حساب"}</button>
      ${login?"":`<div class="notice">🔒 بتسجيلك، إنتي موافقة إن بياناتك محفوظة أونلاين، وإن صاحب التطبيق يقدر يوصلها لأغراض الإدارة ومنع الإساءة.</div>`}
    </form>
    <button class="btn ghost" data-act="authmode">${login?"معنديش حساب، أعمل واحد":"عندي حساب، أدخل"}</button>
    ${CLOUD && login ? `<button class="btn ghost" data-act="forgot" style="background:none">نسيتي الباسورد؟ 🔑</button>` : ""}
  </div>`;
}

/* ================= sheets ================= */
function chatBubbles(list){
  return list.map(e => { const tm = new Date(e.ts).toTimeString().slice(0,5);
    return `<div class="msg me"><div class="bub">${esc(e.text)}<span class="tm num">${tm}</span></div></div><div class="msg him"><div class="bub">${esc(e.reply||"")}<span class="tm num">${tm}</span></div></div>`; }).join("");
}
function oldChatsSheet(){
  const groups = {};
  S.diary.filter(e=>e.chat!==S.chatId).forEach(e => (groups[e.chat] = groups[e.chat] || []).push(e));
  const arr = Object.entries(groups).map(([id,l])=>({id, l:l.sort((a,b)=>a.ts-b.ts)})).sort((a,b)=>b.l[0].ts-a.l[0].ts);
  sheet(`<h2>🗂️ الشاتات القديمة</h2>
  <ul class="list">${arr.length?arr.map(c=>`<li><button class="item" style="width:100%;border:0;text-align:right" data-act="open-chat" data-v="${c.id}"><span class="ic">📔</span><div class="grow"><div class="t" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(c.l[0].text)}</div><div class="s">${prettyDate(new Date(c.l[0].ts))} · <span class="num">${c.l.length}</span> رسالة</div></div></button></li>`).join(""):`<li class="empty">مفيش شاتات قديمة لسه</li>`}</ul>`);
}
function oldChatSheet(id){
  const l = S.diary.filter(e=>e.chat===id).sort((a,b)=>a.ts-b.ts);
  sheet(`<div class="row between" style="margin-bottom:10px"><h2 style="margin:0">${prettyDate(new Date(l[0].ts))}</h2><button class="btn ghost small" data-act="old-chats">رجوع</button></div>
  <div class="chat" style="padding-bottom:0">${chatBubbles(l)}</div>`);
}
function durationsSheet(){
  sheet(`<h2>⏱️ وقت المذاكرة والبريك</h2>
  <form class="form" data-form="dur">
    <div class="two"><label class="f">${L.focus} (دقايق)<input class="in num" id="d-focus" type="number" inputmode="numeric" value="${S.durations.focus}" required></label>
    <label class="f">${L.rest} (دقايق)<input class="in num" id="d-rest" type="number" inputmode="numeric" value="${S.durations.rest}" required></label></div>
    <div class="chips"><button type="button" class="chip" data-act="dpreset" data-v="25,5">25 + 5</button><button type="button" class="chip" data-act="dpreset" data-v="45,10">45 + 10</button><button type="button" class="chip" data-act="dpreset" data-v="50,10">50 + 10</button><button type="button" class="chip" data-act="dpreset" data-v="60,15">60 + 15</button></div>
    <div class="notice">المذاكرة متقلّش عن 10 دقايق، والبريك ميزيدش عن وقت المذاكرة 😉</div>
    <div class="notice" id="d-err" style="display:none;color:var(--bad);font-weight:700"></div>
    <button class="btn" type="submit">حفظ</button>
  </form>`);
}
function vacDays(){ return S.vacation && S.vacation.from ? Math.round((fromKey(dkey()) - fromKey(S.vacation.from))/864e5) : 0; }
function vacDue(){
  if (!onVacation() || vacDays() < 21 || S.vacation.until) return false;
  return !(S.vacation.checked && Math.round((fromKey(dkey()) - fromKey(S.vacation.checked))/864e5) < 14);
}
function vacationCheck(){
  if (!vacDue()) return false;
  const w = Math.floor(vacDays()/7);
  sheet(`<div class="popmsg"><div class="em">⏰🏖️</div><p>بقالك <span class="num">${w}</span> أسابيع إجازة يا ${esc(S.user.name)}!</p><small>لسه في إجازة ولا نرجع للمذاكرة؟</small></div>
  <div class="form" style="margin-top:14px"><button class="btn" data-act="vac-back">📚 رجعت، نقفل الإجازة</button><form class="row" data-form="vac-until" style="gap:8px"><input class="in num" type="date" id="vu-date" required min="${dkey(addDays(new Date(),1))}" aria-label="لحد إمتى"><button class="btn ghost" type="submit" style="white-space:nowrap">🏖️ لسه، لحد اليوم ده</button></form>
  <button class="btn ghost" data-act="vac-still">🤷🏻‍♀️ لسه، ومش عارفة لحد إمتى</button></div>`);
  sheetLocked = true;
  return true;
}
function vacationSheet(){
  S._vtype = "mid";
  sheet(`<h2>🏖️ إجازة</h2>
  <form class="form" data-form="vac">
    <div class="seg" role="group" aria-label="نوع الإجازة"><button type="button" data-act="vtype" data-v="mid" aria-pressed="true">نص السنة</button><button type="button" data-act="vtype" data-v="end" aria-pressed="false">آخر السنة</button></div>
    <label class="f">لحد إمتى؟ (لو مش عارفة سيبيها فاضية)<input class="in num" id="v-until" type="date"></label>
    <button class="btn" type="submit">ابدئي الإجازة 🏖️</button>
  </form>`);
}
function forgotSheet(){
  sheet(`<h2>🔑 نسيتي الباسورد؟</h2>
  <p class="muted small" style="margin:-6px 0 12px">ابعتي طلب لصاحب التطبيق، وهيتأكد إنه حسابك ويبعتلك باسورد مؤقت.</p>
  <form class="form" data-form="forgot">
    <label class="f">اسم المستخدم<input class="in" id="fg-user" required dir="ltr" maxlength="20" pattern="[A-Za-z0-9_.]{3,20}"></label>
    <label class="f">نوصلك إزاي؟ (رقم واتساب مثلًا)<input class="in" id="fg-contact" required maxlength="80" dir="ltr"></label>
    <label class="f">حاجة تأكد إنه حسابك (اختياري)<input class="in" id="fg-note" maxlength="140" placeholder="اسمك في التطبيق، اسم شريكك…"></label>
    <button class="btn" type="submit">ابعتي الطلب</button>
  </form>`);
}
function expSheet(){
  S._cat = S._cat || "food";
  sheet(`<h2>صرفتي على إيه؟ 💸</h2>
  <form class="form" data-form="exp">
    <label class="f">المبلغ (جنيه)<input class="in num" id="e-amt" type="number" inputmode="decimal" min="1" step="any" required placeholder="50"></label>
    <div class="chips" id="e-cats">${CATS.map(c=>`<button type="button" class="chip" data-act="ecat" data-v="${c.k}" aria-pressed="${S._cat===c.k}">${c.e} ${c.t}</button>`).join("")}</div>
    <label class="f">ملاحظة (لو حابة)<input class="in" id="e-note" placeholder="قهوة مع البنات"></label>
    <button class="btn" type="submit">سجّلي</button>
  </form>`);
}
function allowanceSheet(){
  sheet(`<h2>المصروف 💰</h2>
  <form class="form" data-form="allow">
    <label class="f">معاكي كام؟<input class="in num" id="al-amt" type="number" inputmode="decimal" min="0" value="${S.money.allowance}" required></label>
    <div class="seg"><button type="button" data-act="aperiod" data-v="month" aria-pressed="${S.money.period==="month"}">كل شهر</button><button type="button" data-act="aperiod" data-v="week" aria-pressed="${S.money.period==="week"}">كل أسبوع</button></div>
    <button class="btn" type="submit">حفظ</button>
  </form>`);
}
function scheduleSheet(){
  const rows = S.schedule.slice().sort((a,b)=>a.day-b.day||(a.start<b.start?-1:1));
  sheet(`<h2>الجدول الثابت 🎓</h2>
  <ul class="list">${rows.length?rows.map(s=>`<li class="item"><div class="grow"><div class="t">${esc(s.title)}</div><div class="s num">${DAYS[s.day]} · ${s.start} – ${s.end}${s.place?" · "+esc(s.place):""}</div></div><button class="x" data-act="del-lec" data-v="${s.id}" aria-label="امسحي">✕</button></li>`).join(""):`<li class="empty">لسه مفيش محاضرات</li>`}</ul>
  <form class="form" data-form="lec" style="margin-top:14px">
    <label class="f">اسم المحاضرة أو السكشن<input class="in" id="l-title" required placeholder="محاضرة تشريح"></label>
    <div class="two"><label class="f">اليوم<select class="in" id="l-day">${DAYS.map((d,i)=>`<option value="${i}" ${i===new Date().getDay()?"selected":""}>${d}</option>`).join("")}</select></label>
    <label class="f">المكان<input class="in" id="l-place" placeholder="مدرج 3"></label></div>
    <div class="two"><label class="f">من<input class="in num" type="time" id="l-start" value="09:00" required></label><label class="f">لحد<input class="in num" type="time" id="l-end" value="10:30" required></label></div>
    <button class="btn" type="submit">ضيفي للجدول</button>
  </form>`);
}
function examSheet(){
  sheet(`<h2>امتحان جاي ⏳</h2>
  <form class="form" data-form="exam">
    <label class="f">المادة<select class="in" id="x-subj">${S.subjects.map(s=>`<option>${esc(s)}</option>`).join("")}</select></label>
    <label class="f">النوع<select class="in" id="x-type">${GTYPES.map(t=>`<option>${t}</option>`).join("")}</select></label>
    <label class="f">التاريخ<input class="in num" type="date" id="x-date" value="${dkey(addDays(new Date(),7))}" required></label>
    <button class="btn" type="submit">ضيفي</button>
  </form>`);
}
function gradeSheet(){
  sheet(`<h2>سجّلي درجتك 🎓</h2>
  <form class="form" data-form="grade">
    <div class="two"><label class="f">المادة<select class="in" id="g-subj">${S.subjects.map(s=>`<option>${esc(s)}</option>`).join("")}</select></label>
    <label class="f">النوع<select class="in" id="g-type">${GTYPES.map(t=>`<option>${t}</option>`).join("")}</select></label></div>
    <div class="two"><label class="f">جبتي كام؟<input class="in num" type="number" id="g-score" min="0" step="any" required inputmode="decimal"></label>
    <label class="f">من كام؟<input class="in num" type="number" id="g-total" min="1" step="any" required inputmode="decimal" value="10"></label></div>
    <button class="btn" type="submit">سجّلي</button>
  </form>`);
}
function weekSheet(){
  const t = new Date(), from = dkey(addDays(t,-6));
  const tasks = S.tasks.filter(x=>x.date>=from), done = tasks.filter(x=>x.status==="done").length, lazy = tasks.filter(x=>x.status==="lazy").length;
  const mins = S.sessions.filter(s=>s.date>=from).reduce((a,s)=>a+s.mins,0);
  const spent = S.money.expenses.filter(e=>e.date>=from).reduce((a,e)=>a+e.amt,0);
  const moods = Object.entries(S.moods).filter(([d])=>d>=from).map(([,m])=>m);
  const top = MOODS.map(m=>({...m,n:moods.filter(x=>x===m.k).length})).sort((a,b)=>b.n-a.n)[0];
  const pct = tasks.length ? Math.round(done/tasks.length*100) : 0;
  sheet(`<h2>${L.week}</h2>
  <p class="muted" style="margin:-6px 0 12px">آخر 7 أيام</p>
  <div class="stats"><div class="stat"><b>${pc(pct)}</b><span>خلّصتي من مهماتك</span></div><div class="stat"><b class="num">${done}</b><span>${L.done}</span></div><div class="stat"><b class="num">${lazy}</b><span>${L.lazy}</span></div>
  <div class="stat"><b>${hm(mins)}</b><span>مذاكرة</span></div><div class="stat"><b class="num">${fmt(spent)}</b><span>جنيه صرفتيهم</span></div><div class="stat"><b>${top&&top.n?top.e:"·"}</b><span>أكتر مود</span></div></div>
  <div class="letter" style="margin-top:14px"><span class="lbl">${L.love}</span><p>${esc(pick(pct>=60?S.msgs.g_high:S.msgs.lazy))}</p></div>
  <button class="btn block" data-act="close" style="margin-top:14px">تمام 🫠</button>`);
}
function reminderSheet(){
  sheet(`<h2>تذكير جديد 🔔</h2>
  <form class="form" data-form="rem">
    <label class="f">الكلام اللي يظهر<input class="in" id="r-text" required placeholder="اشربي مية يا نونو 💧"></label>
    <label class="f">الساعة<input class="in num" type="time" id="r-time" value="20:00" required></label>
    <button class="btn" type="submit">ضيفي</button>
  </form>`);
}
function subjectSheet(){
  sheet(`<h2>مادة جديدة 📘</h2>
  <form class="form" data-form="subj"><label class="f">اسم المادة<input class="in" id="s-name" required></label><button class="btn" type="submit">ضيفي</button></form>`);
}
function morningSheet(){
  const t = new Date(), lec = S.schedule.filter(s=>s.day===t.getDay()).length, mi = moneyInfo();
  sheet(`<div class="popmsg"><div class="em">☀️</div><p>${esc(pick(S.msgs.morning))}</p><small>${L.love}</small></div>
  <div class="stats" style="margin-top:12px"><div class="stat"><b class="num">${lec}</b><span>محاضرات النهارده</span></div><div class="stat"><b class="num">${S.tasks.filter(x=>x.date===dkey()).length}</b><span>مهمات</span></div><div class="stat"><b class="num">${fmt(Math.max(0,mi.daily))}</b><span>${L.daily}</span></div></div>
  <button class="btn block" data-act="close" style="margin-top:14px">صباح النور 🌷</button>`);
}
function pinSheet(){
  const setting = !S.pin;
  sheet(`<h2>${setting?"اختار رقم سري 🤫":"الرقم السري 🤫"}</h2>
  <p class="muted" style="margin:-6px 0 12px">${setting?"ده علشان محدش يفتح الصفحة دي غيرك.":"الصفحة دي لصاحب الرسايل بس."}</p>
  <form class="form" data-form="pin"><input class="in num center" id="pin" type="password" inputmode="numeric" minlength="4" maxlength="8" required dir="ltr" aria-label="الرقم السري" style="font-size:24px;letter-spacing:8px">
  <button class="btn" type="submit">${setting?"حفظ":"افتح"}</button></form>`);
}
function secretSheet(){
  const T = U.edit === "mate" && P ? P : S;
  return withState(T, () => sheet(`<h2>🤫 الرسايل</h2>
  <div class="card" style="margin-bottom:16px"><h3>💬 لو قالت… يبقى الرد…</h3>
    <p class="muted small" style="margin:2px 0 10px">الردود دي بتتجرّب الأول قبل أي رد تاني في دفتر حكاياتي.</p>
    <ul class="list">${S.rules.length?S.rules.map(r=>`<li class="item"><div class="grow"><div class="t">لو قالت: ${r.keys.map(esc).join(" أو ")}</div><div class="s">الرد: ${r.replies.map(esc).join(" · ")}</div></div><button class="x" data-act="del-rule" data-v="${r.id}" aria-label="امسح">✕</button></li>`).join(""):`<li class="empty">لسه مفيش ردود خاصة</li>`}</ul>
    <form class="form" data-form="rule" style="margin-top:12px">
      <label class="f">لو قالت (لو أكتر من كلمة افصل بينهم بفاصلة ،)<input class="in" id="ru-keys" required placeholder="وحشتني، وحشتيني"></label>
      <label class="f">يبقى الرد (كل سطر رد، وبيختار واحد منهم)<textarea class="in" id="ru-replies" rows="3" required placeholder="وانتي أكتر يا نونو ❤️"></textarea></label>
      <button class="btn" type="submit">ضيف الرد</button>
    </form>
  </div>
  <h3 style="margin-bottom:8px">الرسايل العامة</h3>
  <p class="muted small" style="margin:-6px 0 12px">كل سطر رسالة لوحدها. التطبيق بيختار منهم عشوائي.</p>
  <form class="form" data-form="msgs">
    ${MSG_GROUPS.map(([t,k])=>`<label class="f">${t}<textarea class="in" data-msg="${k}" rows="4">${esc(S.msgs[k].join("\n"))}</textarea></label>`).join("")}
    <button class="btn" type="submit">حفظ الرسايل</button>
    <button class="btn ghost" type="button" data-act="reset-msgs">رجّع الرسايل الأصلية</button>
    ${U.edit === "mate" ? "" : `<button class="btn ghost" type="button" data-act="change-pin">غيّر الرقم السري</button>`}
  </form>`));
}
function msgsTarget(){ return U.edit === "mate" && P ? P : S; }
function saveMsgs(){ if (U.edit === "mate" && P && CLOUD){ fb.set(`u/${P.uid}/sec/msgs`, {msgs:P.msgs, rules:P.rules||[]}, false).catch(()=>toast("مقدرتش أحفظ")); } else save(); }
function backupSheet(){
  const data = JSON.stringify(S);
  sheet(`<h2>${L.backup}</h2><p class="muted small">انسخي الكلام ده واحفظيه في أي مكان (ملاحظات، واتساب لنفسك).</p>
  <textarea class="in num" id="bk" readonly dir="ltr" style="min-height:160px;font-size:11px">${esc(data)}</textarea>
  <button class="btn block" data-act="copy-bk" style="margin-top:10px">انسخي</button>`);
}
function restoreSheet(){
  sheet(`<h2>رجّعي نسخة 💾</h2><form class="form" data-form="restore"><textarea class="in" id="rs" dir="ltr" required placeholder="الصقي النسخة هنا" style="font-size:12px"></textarea><button class="btn" type="submit">رجّعيها</button></form>`);
}

/* ================= actions ================= */
function diaryReply(text){
  const n = norm(text);
  for (const r of (S.rules||[])) if (r.keys.some(w => w && n.includes(norm(w)))) return "rule:" + r.id;
  for (const [cat, words] of DIARY_RULES) if (words.some(w => n.includes(norm(w)))) return cat;
  return "d_other";
}
function scrollChat(){ requestAnimationFrame(()=>window.scrollTo({top:document.body.scrollHeight, behavior:"smooth"})); }
let audioCtx = null;
function beep(){
  try {
    audioCtx = audioCtx || new (window.AudioContext||window.webkitAudioContext)();
    [0,0.35,0.7].forEach(t0 => { const o = audioCtx.createOscillator(), g = audioCtx.createGain(); o.type="sine"; o.frequency.value=880; g.gain.setValueAtTime(0.0001,audioCtx.currentTime+t0); g.gain.exponentialRampToValueAtTime(0.25,audioCtx.currentTime+t0+0.02); g.gain.exponentialRampToValueAtTime(0.0001,audioCtx.currentTime+t0+0.3); o.connect(g).connect(audioCtx.destination); o.start(audioCtx.currentTime+t0); o.stop(audioCtx.currentTime+t0+0.32); });
  } catch(e){}
}
let ticker = null;
function tickTimer(){
  clearInterval(ticker);
  if (!S.timer || !S.timer.end) return;
  ticker = setInterval(() => {
    const tm = S.timer; if (!tm || !tm.end){ clearInterval(ticker); return; }
    const remain = Math.max(0, Math.round((tm.end - Date.now())/1000));
    const el = $("#tleft"), ring = $("#ring");
    if (el){ el.textContent = String(Math.floor(remain/60)).padStart(2,"0")+":"+String(remain%60).padStart(2,"0"); ring.style.setProperty("--p",(1-remain/tm.total)*100); }
    if (remain <= 0){
      clearInterval(ticker); beep();
      if (tm.mode === "focus"){
        S.sessions.push({date:dkey(), subject:tm.subject || S.subjects[0] || "مذاكرة", mins:Math.round(tm.total/60)});
        S.timer = newTimer("rest", tm.subject);
        save(); render(); message("📚", pick(S.msgs.d_study), "خلّصتي "+L.focus+" 💪");
      } else {
        S.timer = newTimer("focus", tm.subject);
        save(); render(); toast("خلصت الراحة، يلا "+L.focus+" 😌");
      }
    }
  }, 500);
}

document.addEventListener("click", e => {
  const b = e.target.closest("[data-act]");
  if (e.target.id === "brand" || e.target.closest("#brand")){
    tapCount++; clearTimeout(tapTimer); tapTimer = setTimeout(()=>tapCount=0, 1500);
    if (tapCount >= 5){ tapCount = 0; pinSheet(); }
    return;
  }
  if (!b) return;
  const act = b.dataset.act, v = b.dataset.v;
  if (act === "close-scrim"){ if (e.target === b && !sheetLocked) closeSheet(); return; }
  const k = dkey();
  switch(act){
    case "close": closeSheet(); break;
    case "tab": go(v); break;
    case "new-love": S._love = pick(S.msgs.love); render(); break;
    case "mood": {
      S.moods[k] = v; save(); render();
      const m = MOODS.find(x=>x.k===v); message(m.e, pick(S.msgs[v]));
      if (CLOUD && (v === "sad" || v === "stressed")) notifyPartner(`${S.user.name} ${S.user.gender==="m"?"مضايق":"مضايقة"} ${m.e} النهارده، كلّمه/كلّمها 🤍`);
      break;
    }
    case "water": { const c = S.care[k] = S.care[k] || {water:0,sleep:0}; c.water = c.water === +v ? +v-1 : +v; save(); render(); if (c.water===8) toast("8 كوبايات! إيه الشطارة دي 💧"); break; }
    case "pray": { const pr = S.prayers[k] = S.prayers[k] || {}; pr[v] = !pr[v]; save(); render(); if (PRAYERS.every(([p])=>pr[p])) toast("ما شاء الله، الخمس فروض كاملين، ربنا يتقبل"); break; }
    case "cycle-start": cycleSheet(); break;
    case "cycle-end": { const c = S.cycle; const days = Math.max(1, Math.round((fromKey(dkey()) - fromKey(c.start))/864e5) + 1); c.history = (c.history||[]).concat({start:c.start, days}).slice(-12); c.on = false; save(); render(); const nx = nextCycle(); toast("ألف سلامة عليكي 🤍" + (nx ? " · المرة الجاية حوالي " + prettyDate(nx.date) : "")); break; }
    case "new-pmsg": S._pmsg = pick(S.msgs.period); render(); break;
    case "star": { const c = S.care[k] = S.care[k] || {water:0,sleep:0}; c.stars = c.stars === +v ? +v-1 : +v; save(); render(); if (c.stars===5) toast("ايه الحلاوه دي كلها 💅✨"); break; }
    case "sleep": { const c = S.care[k] = S.care[k] || {water:0,sleep:0}; c.sleep = Math.max(0, Math.min(16, c.sleep + +v)); save(); render(); break; }
    case "week-summary": weekSheet(); break;
    case "add-exp": expSheet(); break;
    case "ecat": S._cat = v; document.querySelectorAll("#e-cats .chip").forEach(c=>c.setAttribute("aria-pressed", c.dataset.v===v)); break;
    case "del-exp": S.money.expenses = S.money.expenses.filter(x=>x.id!==v); save(); render(); break;
    case "allowance": S._period = S.money.period; allowanceSheet(); break;
    case "aperiod": S._period = v; b.parentElement.querySelectorAll("button").forEach(x=>x.setAttribute("aria-pressed", x.dataset.v===v)); break;
    case "dayoff": S._dayOff = +v; render(); break;
    case "task": {
      const t = S.tasks.find(x=>x.id===v); if (!t) break;
      const was = t.status; t.status = was === b.dataset.s ? null : b.dataset.s; save(); render();
      if (t.status === "done") toast(L.done + " · " + pick(S.msgs.done));
      if (t.status === "lazy") message(cycleOn() && S.user.gender !== "m" ? "🤍" : "🙈", pick(cycleOn() && S.user.gender !== "m" && S.msgs.period.length ? S.msgs.period : S.msgs.lazy));
      break;
    }
    case "del-task": S.tasks = S.tasks.filter(x=>x.id!==v); save(); render(); break;
    case "edit-schedule": scheduleSheet(); break;
    case "del-lec": S.schedule = S.schedule.filter(x=>x.id!==v); save(); render(); scheduleSheet(); break;
    case "tmode": if (S.timer && S.timer.end) break; S.timer = newTimer(v, S.timer&&S.timer.subject); save(); render(); break;
    case "tsubj": S.timer = S.timer || newTimer("focus"); S.timer.subject = v; save(); render(); break;
    case "tstart": {
      try { audioCtx = audioCtx || new (window.AudioContext||window.webkitAudioContext)(); audioCtx.resume && audioCtx.resume(); } catch(err){}
      const tm = S.timer = S.timer || newTimer("focus", S.subjects[0]);
      if (tm.end){ tm.remain = Math.max(0, Math.round((tm.end-Date.now())/1000)); tm.end = null; }
      else { tm.end = Date.now() + (tm.remain ?? tm.total)*1000; }
      save(); render(); break;
    }
    case "treset": { const m = (S.timer&&S.timer.mode)||"focus"; S.timer = newTimer(m, S.timer&&S.timer.subject); save(); render(); break; }
    case "add-subject": subjectSheet(); break;
    case "add-exam": examSheet(); break;
    case "del-exam": S.exams = S.exams.filter(x=>x.id!==v); save(); render(); break;
    case "add-grade": gradeSheet(); break;
    case "del-grade": S.grades = S.grades.filter(x=>x.id!==v); save(); render(); break;
    case "del-diary": S.diary = S.diary.filter(x=>x.id!==v); save(); render(); break;
    case "share": S.share[v] = S.share[v] === false; save(); render(); break;
    case "p-send": partnerSendSheet(); break;
    case "p-msgs": U.edit = "mate"; secretSheet(); break;
    case "durations": durationsSheet(); break;
    case "dpreset": { const [f,r] = v.split(","); $("#d-focus").value = f; $("#d-rest").value = r; break; }
    case "vacation": if (onVacation()){ S.vacation = {on:false}; save(); render(); toast("رجعنا للمذاكرة 📚"); } else vacationSheet(); break;
    case "vac-back": S.vacation = {on:false}; save(); closeSheet(); render(); toast("يلا بينا 📚💪"); break;
    case "vac-still": S.vacation.checked = dkey(); save(); closeSheet(); render(); toast("ماشي، هسألك تاني بعد أسبوعين 😏"); break;
    case "vtype": S._vtype = v; b.parentElement.querySelectorAll("button").forEach(x=>x.setAttribute("aria-pressed", x.dataset.v===v)); break;
    case "new-chat": if (!S.diary.some(e=>e.chat===S.chatId)){ toast("الشات فاضي أصلًا ✨"); break; } S.chatId = uid(); save(); render(); toast("شات جديد ✨ القديم محفوظ"); break;
    case "old-chats": oldChatsSheet(); break;
    case "open-chat": oldChatSheet(v); break;
    case "del-rule": { const T = msgsTarget(); T.rules = (T.rules||[]).filter(r=>r.id!==v); saveMsgs(); secretSheet(); break; }
    case "theme": S.theme = v; save(); render(); break;
    case "dark": S.dark = v; save(); render(); break;
    case "test-morning": morningSheet(); break;
    case "add-rem": reminderSheet(); break;
    case "del-rem": S.alarm.reminders = S.alarm.reminders.filter(x=>x.id!==v); save(); render(); break;
    case "backup": backupSheet(); break;
    case "copy-bk": { const t = $("#bk"); t.select(); (navigator.clipboard ? navigator.clipboard.writeText(t.value) : Promise.reject()).then(()=>toast("اتنسخت ✅")).catch(()=>{ try{document.execCommand("copy"); toast("اتنسخت ✅");}catch(err){ toast("علّمي على الكلام وانسخيه"); } }); break; }
    case "restore": restoreSheet(); break;
    case "clear-sample": {
      const keep = {user:S.user, theme:S.theme, dark:S.dark, pin:S.pin, msgs:S.msgs, alarm:S.alarm};
      S = Object.assign(seed(), keep, {sample:false, money:{allowance:0,period:"month",expenses:[]}, schedule:[], tasks:[], sessions:[], exams:[], grades:[], moods:{}, care:{}, diary:[], subjects:["مادة 1"], tab:"home"});
      save(); render(); toast("بقت دنيتك فاضية ونضيفة ✨"); break;
    }
    case "logout": U.authMode = "login"; closeSheet(); $("#tabs")?.remove(); if (CLOUD){ pushNow(); fb.signOut(); } else { S.user = null; save(); render(); } break;
    case "copy": { (navigator.clipboard ? navigator.clipboard.writeText(v) : Promise.reject()).then(()=>toast("اتنسخ ✅")).catch(()=>toast(v)); break; }
    case "unlink": { if (!CLOUD) break; const pid = ME.partner; saveMe({partner:null}); fb.del(`linkRequests/${pid}`).catch(()=>{}); setupPartner(); render(); toast("اتفك الربط"); break; }
    case "link-accept": { saveMe({partner:v}); fb.del(`linkRequests/${UID}`).catch(()=>{}); closeSheet(); setupPartner(); toast("اتربطتوا 💞"); break; }
    case "link-decline": { fb.del(`linkRequests/${UID}`).catch(()=>{}); closeSheet(); break; }
    case "report": { const e = S.diary.find(x=>x.id===v); if (!e) break; fb.add("reports", {kind:"report", path:`u/${UID}/chat/${v}`, owner:UID, author:ME.partner||null, by:UID, text:e.text}).then(()=>toast("اتبعت البلاغ 🚩")).catch(()=>toast("مقدرتش أبعت البلاغ")); break; }
    case "forgot": forgotSheet(); break;
    case "adm-open": adminOpen(v); break;
    case "adm-reset": {
      const r = U.admin.resets.find(x=>x.id===v); if (!r) break;
      const temp = "nw" + Math.random().toString(36).slice(2,8);
      fb.set(`resetRequests/${v}`, {status:"approved", temp}).then(()=>{ r.status = "approved"; r.temp = temp; render(); });
      break;
    }
    case "adm-rdel": fb.del(`resetRequests/${v}`).then(()=>{ U.admin.resets = U.admin.resets.filter(x=>x.id!==v); render(); }); break;
    case "adm-back": U.admin.sel = null; U.admin.st = null; render(); break;
    case "adm-reload": U.admin.users = null; render(); break;
    case "adm-ban": { const u = U.admin.users.find(x=>x.id===v); if (!u) break; u.banned = !u.banned; fb.set(`users/${v}`, {banned:u.banned}).then(()=>toast(u.banned?"اتوقف ⛔":"اتفك الإيقاف ✅")); render(); break; }
    case "adm-unlink": { const u = U.admin.users.find(x=>x.id===v); if (!u) break; const o = u.partner; fb.set(`users/${v}`, {partner:null}); if (o) fb.set(`users/${o}`, {partner:null}); u.partner = null; render(); toast("اتفك الربط"); break; }
    case "adm-delmsg": { const id = U.admin.stUid; fb.del(`u/${id}/chat/${v}`).then(()=>{ U.admin.st.diary = U.admin.st.diary.filter(e=>e.id!==v); render(); toast("اتمسحت 🗑️"); }); break; }
    case "adm-rmmsg": { const r = U.admin.reports.find(x=>x.id===v); if (!r) break; (r.path ? fb.del(r.path) : Promise.resolve()).then(()=>fb.del(`reports/${v}`)).then(()=>{ U.admin.reports = U.admin.reports.filter(x=>x.id!==v); render(); toast("اتمسحت 🗑️"); }); break; }
    case "adm-dismiss": { fb.del(`reports/${v}`).then(()=>{ U.admin.reports = U.admin.reports.filter(x=>x.id!==v); render(); }); break; }
    case "authmode": U.authMode = U.authMode === "login" ? "signup" : "login"; render(); break;
    case "arel": U.rel = v; b.parentElement.querySelectorAll("button").forEach(x=>x.setAttribute("aria-pressed", x.dataset.v===v)); break;
    case "set-rel": { if (!CLOUD) { S.user.religion = v; render(); break; } saveMe({religion:v}); S.user.religion = v; render(); toast("اتحفظ ✅"); break; }
    case "agender": { const keepVals = ["a-name","a-user","a-pass"].map(id => (document.getElementById(id)||{}).value || ""); U.ag = v; render(); ["a-name","a-user","a-pass"].forEach((id,i) => { const el = document.getElementById(id); if (el) el.value = keepVals[i]; }); break; }
    case "reset-msgs": { const T = msgsTarget(); T.msgs = T === P && P && P.user ? defMsgs(P.user.gender, P.user.religion) : defMsgs(S.user.gender, S.user.religion); saveMsgs(); secretSheet(); toast("رجعت الرسايل الأصلية"); break; }
    case "change-pin": S.pin = null; save(); pinSheet(); break;
  }
});

document.addEventListener("submit", e => {
  const f = e.target.closest("[data-form]"); if (!f) return;
  e.preventDefault();
  const val = id => (document.getElementById(id)?.value || "").trim();
  const k = dkey();
  switch(f.dataset.form){
    case "task": { const t = val("newtask"); if (!t) return; const d = dkey(addDays(new Date(), S._dayOff||0)); S.tasks.push({id:uid(),date:d,title:t,status:null}); save(); render(); setTimeout(()=>$("#newtask")?.focus(),30); break; }
    case "exp": {
      const amt = parseFloat(val("e-amt")); if (!(amt > 0)) return;
      S.money.expenses.push({id:uid(), amt, cat:S._cat||"food", note:val("e-note"), date:k}); save(); closeSheet(); render();
      const mi = moneyInfo();
      if (mi.state === "out") message("🙆🏽‍♀️", L.left.out + " … خلّي بالك يا بسبوسة", "الفلوس");
      else if (mi.todaySpent > mi.daily) toast("عدّيتي المسموح النهارده 😬");
      else toast("اتسجلت ✅ فاضلّك " + fmt(mi.left));
      break;
    }
    case "allow": { const a = parseFloat(val("al-amt")); if (!(a >= 0)) return; S.money.allowance = a; S.money.period = S._period || S.money.period; save(); closeSheet(); render(); break; }
    case "lec": { S.schedule.push({id:uid(), title:val("l-title"), day:+val("l-day"), place:val("l-place"), start:val("l-start"), end:val("l-end")}); save(); render(); scheduleSheet(); toast("اتضافت للجدول ✅"); break; }
    case "exam": { S.exams.push({id:uid(), subject:val("x-subj"), type:val("x-type"), date:val("x-date")}); save(); closeSheet(); render(); break; }
    case "grade": {
      const sc = parseFloat(val("g-score")), tot = parseFloat(val("g-total")); if (!(tot > 0) || !(sc >= 0)) return;
      const before = examGood();
      S.grades.push({id:uid(), subject:val("g-subj"), type:val("g-type"), score:sc, total:tot, date:k}); save(); closeSheet(); render();
      const p = sc/tot*100, grp = p >= 75 ? "g_high" : p >= 50 ? "g_mid" : "g_low";
      message(p>=75?"🌟":p>=50?"🙂":"🫂", pick(S.msgs[grp]), (!before && examGood()) ? L.examsGood + " يا نونو!" : Math.round(p) + "٪");
      break;
    }
    case "diary": {
      const t = val("diarytext"); if (!t) return;
      const cat = diaryReply(t), id = uid();
      const pool = cat.startsWith("rule:") ? (S.rules.find(r=>"rule:"+r.id===cat)||{}).replies : S.msgs[cat];
      const ans = pick(pool && pool.length ? pool : S.msgs.d_other);
      S.diary.push({id, chat:S.chatId, ts:Date.now(), text:t, cat, reply:null, pending:ans}); save(); render(); scrollChat();
      if (CLOUD && cat === "d_sad") notifyPartner(`${S.user.name} كتب/كتبت حكاية زعلانة 📔 كلّمه/كلّمها 🤍`);
      setTimeout(() => { const e = S.diary.find(x=>x.id===id); if (!e) return; e.reply = e.pending; delete e.pending; save(); if (S.tab==="diary"){ render(); scrollChat(); setTimeout(()=>$("#diarytext")?.focus(),30); } }, 1200 + Math.random()*900);
      break;
    }
    case "psend": {
      const t = val("ps-text"); if (!t) return;
      if (CLOUD && P && P.linked){ const id = uid(), e = {id, chat:P.chatId||"c0", ts:Date.now(), from:"him", text:t}; fb.set(`u/${P.uid}/chat/${id}`, e, false).then(()=>moderate(e, `u/${P.uid}/chat/${id}`, P.uid)).catch(()=>toast("مقدرتش أبعت")); closeSheet(); toast("وصلت 💌"); break; }
      closeSheet(); toast("ده عرض بس 👀"); break;
    }
    case "dur": {
      const f = Math.round(+val("d-focus")), r = Math.round(+val("d-rest")), err = $("#d-err");
      const bad = msg => { err.textContent = msg; err.style.display = "block"; };
      if (!(f >= 10)) return bad("المذاكرة لازم تبقى 10 دقايق على الأقل 📚");
      if (!(r >= 1)) return bad("البريك لازم يبقى دقيقة على الأقل ☕");
      if (r > f) return bad("البريك ميزيدش عن وقت المذاكرة يا نونو 😏");
      S.durations = {focus:f, rest:r};
      if (!S.timer || !S.timer.end) S.timer = newTimer((S.timer&&S.timer.mode)||"focus", S.timer&&S.timer.subject);
      save(); closeSheet(); render(); toast("اتظبط الوقت ⏱️"); break;
    }
    case "vac": { S.vacation = {on:true, type:S._vtype||"mid", from:dkey(), until:val("v-until")||null}; save(); closeSheet(); render(); toast("إجازة سعيدة 🏖️"); break; }
    case "vac-until": { const d = val("vu-date"); if (!d) return; S.vacation.until = d; save(); closeSheet(); render(); toast("تمام، الإجازة هتخلص " + prettyDate(fromKey(d)) + " 🏖️"); break; }
    case "cycle": {
      const st = val("cy-start"), days = Math.max(2, Math.min(12, Math.round(+val("cy-days") || 7))); if (!st) return;
      const tell = $("#cy-tell") && $("#cy-tell").checked;
      S.cycle = Object.assign({}, S.cycle, {on:true, start:st, days}); S._pmsg = null; save(); closeSheet(); render();
      if (tell) notifyPartner(`${S.user.name} محتاجة اهتمام ودلع زيادة الأيام دي 🤍 اهتم بيها أكتر`, true);
      message("🤍", pick(S.msgs.period) || "ألف سلامة عليكي", "منه 💌");
      break;
    }
    case "rule": {
      const keys = val("ru-keys").split(/[,،]/).map(x=>x.trim()).filter(Boolean);
      const replies = val("ru-replies").split("\n").map(x=>x.trim()).filter(Boolean);
      if (!keys.length || !replies.length) return;
      const T = msgsTarget(); T.rules = T.rules || []; T.rules.push({id:uid(), keys, replies}); saveMsgs(); secretSheet(); toast("اتضاف الرد 💬"); break;
    }
    case "rem": { S.alarm.reminders.push({id:uid(), time:val("r-time"), text:val("r-text")}); S.alarm.reminders.sort((a,b)=>a.time<b.time?-1:1); save(); closeSheet(); render(); break; }
    case "subj": { const n = val("s-name"); if (n && !S.subjects.includes(n)) S.subjects.push(n); save(); closeSheet(); render(); break; }
    case "pin": {
      const p = val("pin"); if (p.length < 4) return;
      U.edit = "me";
      if (!S.pin){ S.pin = p; save(); toast("اتحفظ الرقم السري 🤫"); secretSheet(); }
      else if (p === S.pin) secretSheet();
      else { toast("الرقم غلط 🙅🏽‍♀️"); $("#pin").value = ""; }
      break;
    }
    case "msgs": {
      const T = msgsTarget();
      f.querySelectorAll("[data-msg]").forEach(t => { const arr = t.value.split("\n").map(s=>s.trim()).filter(Boolean); T.msgs[t.dataset.msg] = arr.length ? arr : (T === P && P.user ? defMsgs(P.user.gender, P.user.religion) : defMsgs(S.user.gender, S.user.religion))[t.dataset.msg]; });
      S._love = null; saveMsgs(); closeSheet(); render(); toast("اتحفظت الرسايل 💌"); break;
    }
    case "restore": {
      try { const d = JSON.parse(val("rs")); if (!d || d.v !== 1) throw 0; S = d; save(); closeSheet(); render(); toast("رجعت ذكرياتك 💾"); }
      catch(err){ toast("النسخة دي مش سليمة، جرّبي تنسخيها تاني"); }
      break;
    }
    case "auth": {
      const user = val("a-user"), pass = (document.getElementById("a-pass")||{}).value || ""; if (!user || !pass) return;
      if (!CLOUD){
        if (U.authMode === "login"){ S.user = {name: (U.lastName || "نونو"), username:user, gender:"f"}; }
        else { const g = U.ag || "f"; S.user = {name: val("a-name") || "نونو", username:user, gender:g}; S.theme = g === "m" ? "leil" : "basbousa"; }
        U.lastName = S.user.name; S.tab = "home"; save(); render(); break;
      }
      if (!/^[A-Za-z0-9_.]{3,20}$/.test(user)){ const er = $("#a-err"); er.textContent = "اسم المستخدم من 3 لـ 20 حرف إنجليزي أو رقم"; er.style.display = "block"; return; }
      const nm = val("a-name") || user;
      U.busy = true; render();
      const p = U.authMode === "login" ? fb.signIn(user, pass) : signUp(nm, user, pass, U.ag || "f", U.rel || "muslim");
      p.then(() => { U.busy = false; }).catch(err => { U.busy = false; render(); const er = $("#a-err"); if (er){ er.textContent = authError(err); er.style.display = "block"; } });
      break;
    }
    case "code": { const c = val("pcode"); if (c) sendCode(c); break; }
    case "forgot": {
      const u = val("fg-user").toLowerCase(), c = val("fg-contact"); if (!u || !c) return;
      fb.add("resetRequests", {username:u, contact:c, note:val("fg-note"), status:"new"}).then(()=>{ closeSheet(); message("💌", "الطلب وصل، هيكلّمك قريب ويبعتلك باسورد مؤقت", "🔑"); }).catch(()=>toast("مقدرتش أبعت الطلب، اتأكدي من النت"));
      break;
    }
    case "pass": {
      const cur = (document.getElementById("pw-cur")||{}).value || "", nw = (document.getElementById("pw-new")||{}).value || "", er = $("#pw-err");
      fb.changePassword(cur, nw).then(()=>{ toast("اتغيّر الباسورد ✅"); render(); }).catch(err => { er.textContent = (err && String(err.code).includes("invalid")) ? "الباسورد الحالي غلط" : authError(err); er.style.display = "block"; });
      break;
    }
  }
});
document.addEventListener("input", e => { if (e.target.id === "adm-q"){ U.admin.q = e.target.value; const pos = e.target.selectionStart; render(); const i = $("#adm-q"); i.focus(); i.setSelectionRange(pos,pos); } });
document.addEventListener("change", e => {
  if (e.target.id === "wake"){ S.alarm.wake = e.target.value; save(); toast("هصحّيكي الساعة " + e.target.value + " ⏰"); }
});
document.addEventListener("keydown", e => {
  if (e.key === "Escape" && !sheetLocked) closeSheet();
  if (e.target.id === "diarytext" && e.key === "Enter" && !e.shiftKey && !matchMedia("(pointer:coarse)").matches){ e.preventDefault(); e.target.form.requestSubmit(); }
});
document.addEventListener("input", e => { if (e.target.id === "diarytext"){ e.target.style.height = "auto"; e.target.style.height = Math.min(140, e.target.scrollHeight) + "px"; } });

/* ================= reminders & alarm (native on Android, in-app elsewhere) ================= */
const LN = () => window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LocalNotifications;
let lastSchedule = "";
async function scheduleNative(){
  const ln = LN(); if (!ln || !S || !S.user) return;
  const plan = JSON.stringify([S.alarm, S.msgs.morning]); if (plan === lastSchedule) return; lastSchedule = plan;
  try {
    const perm = await ln.requestPermissions(); if (perm.display !== "granted") return;
    try { await ln.createChannel({id:"alarm", name:"صحّيني", importance:5, sound:"default", vibration:true}); } catch(e){}
    const pending = await ln.getPending(); if (pending.notifications.length) await ln.cancel({notifications: pending.notifications.map(n=>({id:n.id}))});
    const at = t => { const [h,m] = t.split(":").map(Number); return {hour:h, minute:m}; };
    const list = [{id:1, title:"صحّيني ⏰", body:pick(S.msgs.morning) || "صباح الخير ☀️", channelId:"alarm", schedule:{on:at(S.alarm.wake), allowWhileIdle:true}}];
    S.alarm.reminders.forEach((r,i) => list.push({id:10+i, title:"Nono's World 🌍", body:r.text, schedule:{on:at(r.time), allowWhileIdle:true}}));
    await ln.schedule({notifications:list});
  } catch(e){ console.warn("notify", e); }
}
function inAppReminders(){
  if (!S || !S.user || LN()) return;
  const now = new Date(), hm5 = now.toTimeString().slice(0,5), k = dkey(now);
  let fired = {}; try { fired = JSON.parse(localStorage.getItem("nw-fired") || "{}"); } catch(e){}
  const due = [];
  if (S.alarm.wake === hm5) due.push(["wake", "صحّيني ⏰", pick(S.msgs.morning)]);
  S.alarm.reminders.forEach(r => { if (r.time === hm5) due.push([r.id, "Nono's World 🌍", r.text]); });
  due.forEach(([id, title, body]) => {
    if (fired[id] === k) return; fired[id] = k;
    try { if ("Notification" in window && Notification.permission === "granted") new Notification(title, {body, icon:"icon-192.png"}); } catch(e){}
    if (id === "wake"){ beep(); setTimeout(beep, 1200); setTimeout(beep, 2400); }
    toast(body);
  });
  try { localStorage.setItem("nw-fired", JSON.stringify(fired)); } catch(e){}
}
setInterval(inAppReminders, 20000);
setInterval(scheduleNative, 15000);

/* ================= start ================= */
if (CLOUD){
  if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("sw.js").catch(()=>{});
  S = null; render();
  fb.onUser(u => boot(u).catch(e => { console.error(e); toast("حصلت مشكلة في التحميل، جرّبي تاني"); }));
} else {
  S = normalize(load());
  if (S.vacation.on && S.vacation.until && dkey() > S.vacation.until) S.vacation = {on:false};
  render(); startupChecks();
}
setInterval(()=>{ if (S && S.dark==="auto") applyTheme(); }, 60000);
