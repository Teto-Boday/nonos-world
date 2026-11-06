
"use strict";
import { EN } from "./en.js";
import { prayerTimes, CITIES } from "./pray.js";
/* ================= helpers ================= */
const $ = s => document.querySelector(s);
const escP = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
/* esc() marks what people wrote (names, diary, messages) so the masculine rewrite below never touches it */
const esc = s => "\uE000" + escP(s) + "\uE001";
const uid = () => Math.random().toString(36).slice(2, 9);
/* clock style: follows the device (12h / 24h) unless chosen in settings */
const AUTO_H12 = (() => { try { const hc = new Intl.DateTimeFormat(undefined, {hour:"numeric"}).resolvedOptions().hourCycle; return hc ? (hc === "h11" || hc === "h12") : /AM|PM|ص|م/.test(new Date(2020,0,1,15).toLocaleTimeString()); } catch(e){ return false; } })();
const tf = x => { if (x == null || x === "") return "";
  let h, m; if (x instanceof Date){ h = x.getHours(); m = x.getMinutes(); } else { const pr = String(x).split(":"); h = +pr[0]; m = +pr[1]; if (isNaN(h)) return String(x); }
  const clk = (typeof S !== "undefined" && S && S.clock) || "auto", h12 = clk === "12" || (clk !== "24" && AUTO_H12), mm = String(m).padStart(2, "0");
  if (!h12) return String(h).padStart(2, "0") + ":" + mm;
  const en = (() => { try { return typeof isEN === "function" && isEN(); } catch(e){ return false; } })();
  return ((h % 12) || 12) + ":" + mm + " " + (h < 12 ? (en ? "AM" : "ص") : (en ? "PM" : "م")); };
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
const L_BASE = {
  app:"Nono's World 🌍", money:"اصرفي براحتك يا بسبوسه 💸", day:"علينا ايه النهارده 🤔", tasks:"مهماتي",
  done:"عملتيها يا نونو 🤏🏽", lazy:"كسلت 🙈", study:"ركن المذاكرة 📚", focus:"حبه جد", rest:"حبه هدوء ☕",
  examsBad:"مكتوب عليا ⏳", examsGood:"إفراج 🎉", streak:"ايه الشطارة دي🔥", week:"راحه اخيرا 🫠", care:"الدلع",
  mood:"النفسيه", diary:"دفتر حكاياتي 📔", love:"فاكرك علطول 💌", alarm:"صحّيني ⏰", backup:"احفظي ذكرياتي 💾",
  daily:"قربنا نفلس", vacation:"إجازة 🏖️", left:{ok:"لسه في الخير 😌", near:"هنفلس 😬", out:"فلسنا 🙆🏽‍♀️"}
};
/* no partner: no nicknames, no romance in the labels */
const L_SOLO = { money:"اصرفي براحتك 💸", done:"عملتيها 👏", love:"💪 كلمة حلوة" };
const L = new Proxy(L_BASE, { get: (t, k) => (typeof loveOn === "function" && !loveOn() && k in L_SOLO) ? L_SOLO[k] : t[k] });
const MOODS = [
  {k:"happy", e:"😍", t:"مبسوطة"}, {k:"good", e:"🙂", t:"كويسة"}, {k:"meh", e:"😐", t:"عادي"},
  {k:"sad", e:"😔", t:"زعلانة"}, {k:"stressed", e:"😫", t:"مضغوطة"}
];
const CATS = [
  {k:"food",e:"🍔",t:"أكل",c:"#f08a5d"},{k:"ride",e:"🚕",t:"مواصلات",c:"#f6c445"},{k:"clothes",e:"👗",t:"لبس",c:"#e85d8a"},
  {k:"uni",e:"📚",t:"كلية",c:"#7f6ad6"},{k:"out",e:"🎡",t:"خروجات",c:"#43b3ae"},{k:"gift",e:"🎁",t:"هدايا",c:"#d65aa0"},
  {k:"care", get e(){ return (typeof S !== "undefined" && S && S.user && S.user.gender === "m") ? "🧴" : "💄"; }, get t(){ return (typeof S !== "undefined" && S && S.user && S.user.gender === "m") ? "عناية شخصية" : "ميكب وعناية"; }, c:"#ff9fb7"},{k:"other",e:"✨",t:"حاجات تانية",c:"#a3a3b5"}
];
const GTYPES = ["كويز","ميدترم","فاينل"];
const SHARE = [["mood","النفسيه 💭"],["diary","دفتر حكاياتي 📔"],["study","المذاكرة والدرجات 📚"],["day","يومي ومهماتي 🗓️"],["money","الفلوس 💸"],["care","الدلع"]];

/* ================= his messages (editable from the secret screen) ================= */
const MSG_GROUPS = [
  ["النفسيه 😍 مبسوطة","happy"],["النفسيه 🙂 كويسة","good"],["النفسيه 😐 عادي","meh"],["النفسيه 😔 زعلانة","sad"],["النفسيه 😫 مضغوطة","stressed"],
  ["حكاياتي: مذاكرة أو امتحان","d_study"],["حكاياتي: تعبانة","d_tired"],["حكاياتي: زعلانة","d_sad"],["حكاياتي: فرحانة أو نجحت","d_happy"],
  ["حكاياتي: لو كتبت وحشتني","d_miss"],["حكاياتي: لو كتبت إزيك","d_greet"],["حكاياتي: لو كتبت غور","d_ghor"],["حكاياتي: عايزة أحكي","d_story"],["حكاياتي: أي حاجة تانية","d_other"],
  ["الدرجات: 75% أو أكتر","g_high"],["الدرجات: من 50% لـ 75%","g_mid"],["الدرجات: أقل من 50%","g_low"],
  ["لما تعمل مهمة ✅","done"],["لما تكسل عن مهمة 🙈","lazy"],["فاكرك علطول 💌","love"],["صحّيني ⏰ صباح الخير","morning"],["أيام البريود (دلع زيادة)","period"]
];
const DEFAULT_MSGS = {
  d_miss:["وانتي كمان جدًا ❤️","انا كل ثانية بتعدي عليا بتوحشيني أكتر من اللي قبلها","انتي مش بتلحقي توحشيني لأنك دايمًا على بالي","بتوحشيني دايمًا حتى في أكتر وقت مشغول فيه"],
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
  love:["جيتي في بالي و قلت اقولك ان حبي ليكي زاد","انتي بجد احلى حاجه في الدنيا","انتي اجمل حاجه حصلت لي","انا اسف على كل حاجه زعلتك","حقك عليا يا نور عيوني في كل مره زعلتك فيها","اسفلك على كل مره زعلتك فيها",
    "بحبك أكتر من امبارح وأقل من بكرة ❤️","إنتي الحاجة الوحيدة اللي مبزهقش منها أبدًا","لو رجع بيا الزمن هختارك تاني وتالت ومليون مرة","ضحكتك بتصلّح يومي كله مهما كان وحش","إنتي بيتي وأماني وراحتي","كل حاجة حلوة في حياتي بدأت من عندك","وجودك في حياتي نعمة بحمد ربنا عليها كل يوم","نفسي أفضل جنبك العمر كله","إنتي مش بس حبيبتي، إنتي صاحبتي وأقرب حد ليا","قلبي بيدق أسرع لما اسمك يظهر قدامي","أنا محظوظ إنك اخترتيني","عيونك دي أحلى مكان في الدنيا","بحبك في كل حالاتك، وإنتي زعلانة قبل وإنتي فرحانة","مفيش يوم بيعدي من غير ما أفتكرك وأبتسم","إنتي الحلم اللي اتحقق"],
  period:["ألف سلامة عليكي يا قلبي، ارتاحي ومتشيليش هم حاجة 🤍","اعملي لنفسك حاجة دافية واتغطي كويس، وأنا معاكي","لو تعبانة سيبي المذاكرة شوية، صحتك أهم من أي حاجة","إنتي أحلى حاجة في الدنيا حتى وإنتي تعبانة ❤️","عايزة شوكولاتة؟ قوليلي وأنا أجيبهالك 🍫","قربة مية سخنة وفيلم حلو والبطانية، ده أمر 😤","أي حاجة مضايقاكي قوليلي، أنا هنا يا نونو","مسموحلك تتدلّعي على الآخر الأيام دي 🎀"],
  morning:["صباح الفل على أحلى نونو ☀️ قومي يلا، الدنيا مستنياكي","اصحي يا بسبوسة، النهارده هيبقى يوم حلو","يلا قومي… وأول حاجة اشربي مية وابتسمي 😁","صباح الخير يا بنوتي","صباح الخير يا اشطر بنوته في الدنيا","ابعتيلي عشان وحشاني اوي","كنت مستنيكي بفارغ الصبر"]
};
const DEFAULT_MSGS_M = {
  happy:["يا بخت اليوم اللي إنت مبسوط فيه يا حبيبي 😍","الضحكة دي لازم تتحط في متحف يا راجلي","خليك كده على طول، الدنيا بتحلو لما إنت تحلو","ببقى مبسوطة طول ما إنت مبسوط يا جوزي 🤏🏽"],
  good:["كويس؟ مش متطمنة 😑","يوم هادي ولطيف، زيك بالظبط يا حبيبي","حلو، كمّل كده يا راجلي 💪"],
  meh:["عادي إيه بس، إنت مفيش فيك حاجة عادية 🙄","اليوم ده محتاج كوباية حاجة سخنة وأغنية حلوة ☕","قوم اعمل حاجة بتحبها وتعالى قولّي بقيت أحسن 😉","لعله خير إن شاء الله"],
  sad:["تعالى هنا… مين زعّلك؟ قولّي بس 😤","الزعل ده ضيف وهيمشي، وأنا هنا مش ماشية 🤍","مسموحلك تزعل، بس مش مسموحلك تنسى إن في واحدة بتحبك جدًا","طلّع اللي جواك، وبعدين نقوم ناكل حاجة حلوة 🍫","مالك يا حبيبي، حقك عليا لو أنا السبب يا راجلي 😟","أنا السبب؟ ده أنا مني لله، كله إلا زعلك يا جوزي 🌑"],
  stressed:["الدنيا ضغوطات بس إنت أشطر وأجدع راجل في الدنيا 💪","مش لازم تخلّص كل حاجة النهارده، حاجة واحدة بس تكفي","إنت أقوى من الضغط ده بكتير، وأنا عارفة","أنا جنبك ومعاك يا حبيبي، كل حاجة هتبقى كويسة ❤️"],
  d_miss:["وإنت كمان جدًا يا حبيبي ❤️","أنا كل ثانية بتعدي عليا بتوحشني أكتر من اللي قبلها","إنت مش بتلحق توحشني لأنك دايمًا على بالي","بتوحشني دايمًا حتى في أكتر وقت مشغولة فيه"],
  d_study:["إنت أشطر راجل في الدنيا، إنت قدها ❤️","كل صفحة بتذاكرها بتقرّبك من الإفراج 🎉","أنا فخورة بيك إنك قاعد تذاكر أصلًا، دي لوحدها رجولة","أنا فخورة بيك يا راجلي 💪"],
  d_tired:["كفاية كده النهارده يا حبيبي، نام بدري وده أمر 😤","جسمك بيقولك ارتاح، اسمع كلامه وكلامي","التعب ده معناه إنك بتعافر، ارتاح بقى وأنا فخورة بيك","تعبك ده في ميزان حسناتك يا جوزي ❤️","إنت أجدع راجل وقد التعب"],
  d_sad:["مش هسيبك زعلان لوحدك أبدًا 🤍","مهما حصل، إنت مش لوحدك","طلّع كل اللي جواك هنا، ولما تخلّص افتكر إني بحبك","أنا معاك وجنبك وهفضل جنبك يا راجلي ❤️","من إيه يا حبيبي؟ تعالى احكيلي","احكي طيب مالك يا حبيبي"],
  d_happy:["قولّي تاني! 😍 أنا فرحانة أكتر منك","شوفت بقى؟ قولتلك إنك جامد","ده يستاهل احتفال، وأنا عازماك 🎉","بجد كنت متأكدة إنك أشطر راجل في الدنيا 💪","أنا فخورة بيك يا نور عيوني ❤️"],
  d_greet:["أحسن منك 😂😂","أكيد كويسة عشان إنت معايا","كويسة طول ما إنت معايا يا حبيبي"],
  d_ghor:["للجنة معاك يا جوزي نيهاهاهاها","يارب لبيتنا يا عيوني","وأسيبك؟ تؤ تؤ مقدرش"],
  d_story:["احكيلي يا حبيبي ❤️","اشجيني يا روح قلبي 🙂","أنا معاك وودني مطرطقة أهو 👂🏽"],
  d_other:["شكرًا إنك حكيتلي 🤍","حكاياتك أحلى حاجة في يومي","مستنية الحكاية الجاية يا راجلي 📔"],
  g_high:["إيه الشطارة دي يا حبيبي 😍🔥","كنت عارفة! أشطر راجل زي العادة","الدرجة دي لازم تتبروز 🖼️","إنت أشطر واحد في الدنيا يا جوزي"],
  g_mid:["اللهم بارك، واثقة إنها أحلى المرة الجاية","إنت أشطر راجل، المفروض تقفل"],
  g_low:["ولا يهمك، دي درجة مش آخر الدنيا 🤍","الدرجة دي مش بتقول إنت مين، إنت أشطر منها","إنت أشطر راجل، واثقة إنك هتعوّض"],
  done:["إنت أشطر راجل في الدنيا 💪","أنا فخورة بيك يا راجلي 🤏🏽"],
  lazy:["كسلت؟ عادي، بكرة نعوّضها 😌","ماشي يا كسول، بس بكرة مفيش هزار 😂"],
  love:["جيت في بالي وقلت أقولك إن حبي ليك زاد","إنت بجد أحلى حاجة في الدنيا","إنت أجمل حاجة حصلتلي يا جوزي",
    "بحبك أكتر من امبارح وأقل من بكرة ❤️","إنت ضهري وسندي وأماني يا راجلي","لو رجع بيا الزمن هختارك تاني وتالت ومليون مرة","صوتك بيطمّني أكتر من أي حاجة في الدنيا","إنت بيتي اللي بحس فيه بالأمان","كل حاجة حلوة في حياتي بدأت من عندك يا حبيبي","وجودك في حياتي نعمة بحمد ربنا عليها كل يوم","نفسي أفضل جنبك العمر كله يا جوزي","إنت مش بس حبيبي، إنت صاحبي وأقرب حد ليا","قلبي بيدق أسرع لما اسمك يظهر قدامي","أنا محظوظة إنك اخترتني","حضنك أحلى مكان في الدنيا","بحبك في كل حالاتك، وإنت زعلان قبل وإنت فرحان","مفيش يوم بيعدي من غير ما أفتكرك وأبتسم","إنت الراجل اللي كنت بدعي ربنا بيه","فخورة إنك راجلي قدام الدنيا كلها 💪"],
  morning:["صباح الفل على أحلى راجل ☀️ قوم يلا، الدنيا مستنياك","اصحى يا حبيبي، النهارده هيبقى يوم حلو","يلا قوم… وأول حاجة اشرب مية وابتسم 😁","صباح الخير يا راجلي","صباح الخير يا أشطر واحد في الدنيا","ابعتلي عشان وحشتني أوي","كنت مستنياك بفارغ الصبر يا جوزي"],
  period:[]
};

const LOVE_OLD = ["أنا آسفة على كل حاجة زعلتك","حقك عليا يا نور عيوني في كل مرة زعلتك فيها","آسفة على كل مرة زعلتك فيها يا حبيبي","جيت في بالي وقلت أقولك إن حبي ليك زاد","إنت بجد أحلى حاجة في الدنيا","إنت أجمل حاجة حصلتلي يا جوزي","جيتي في بالي و قلت اقولك ان حبي ليكي زاد","انتي بجد احلى حاجه في الدنيا","انتي اجمل حاجه حصلت لي","انا اسف على كل حاجه زعلتك","اسفلك على كل مره زعلتك فيها"];
const ISLAMIC = /ميزان حسنات|اللهم|ما شاء الله|الحمد لله|ربنا يتقبل|بإذن الله|سبحان/;
const NEUTRAL_FALLBACK = "أنا جنبك على طول 🤍";
const DEFAULT_MSGS_EN = {
  d_miss:["Me too, so much ❤️","Every second that passes, I miss you more than the one before","You never get the chance to be missed, because you're always on my mind","I always miss you, even when I'm at my busiest"],
  happy:["Lucky is the day you're happy 😍","That smile belongs in a museum, Nono","Stay like this forever, the world gets prettier when you do","I'm happy as long as you're happy 🤏🏽"],
  good:["Good? Hmm, I'm not convinced 😑","A calm sweet day, just like you","Nice, keep going cupcake 🌸"],
  meh:["Meh? Nothing about you is ever meh 🙄","This day needs a warm drink and a good song ☕","Go do something you love and tell me you feel better 😉","It'll all be for the best"],
  sad:["Come here… who upset you? Just tell me 😤","Sadness is a guest, it'll leave. I'm staying 🤍","You're allowed to be sad, just never forget someone loves you so much","Cry if you need to, then let's go eat something sweet 🍫","What's wrong, Nono? I'm sorry if it's because of me 😟"],
  stressed:["Life is heavy, but you're the strongest girl in the world 🤏🏽","You don't have to finish everything today, one thing is enough","You're way bigger than this stress, and I know it","I'm right here with you, everything will be okay ❤️"],
  d_study:["You're the smartest girl in the world, you've got this ❤️","Every page you study brings you closer to freedom 🎉","I'm proud of you just for sitting down to study","So proud of you, my girl 🤏🏽"],
  d_tired:["That's enough for today, go to bed early, that's an order 😤","Your body is asking for rest, listen to it and to me","Being tired means you're fighting for it. Rest now, I'm proud of you","You can handle it, but please rest for me ❤️"],
  d_sad:["I'll never leave you sad alone 🤍","Whatever happens, you're not alone","I'm with you and I'll always be ❤️","What happened, Nono? Come tell me","Talk to me, what's wrong, love?"],
  d_happy:["Say it again! 😍 I'm happier than you","See? I told you you're amazing","This deserves a celebration, it's on me 🎉","I knew you were the smartest girl in the world 🤏🏽","So proud of you, light of my eyes ❤️"],
  d_greet:["Better than you 😂😂","Great, because you're with me","Good as long as you're with me"],
  d_ghor:["To paradise, together with you 😂","Hopefully to our future home","Leave you? Nope, can't do it"],
  d_story:["Tell me, love ❤️","I'm all ears 👂🏽","I'm here, tell me everything"],
  d_other:["Thanks for telling me 🤍","Your stories are the best part of my day","Waiting for the next story, cupcake 📔"],
  g_high:["Look at you, Nono 😍🔥","I knew it! Smartest girl as always","That grade deserves a frame 🖼️"],
  g_mid:["Nice, the next one will be even better 💪","You're smart, you'll ace it next time"],
  g_low:["Don't worry, it's one grade, not the end of the world 🤍","That grade doesn't say who you are, you're better than it","You'll make up for it, I'm sure"],
  done:["Smartest girl in the world 🤏🏽","So proud of you 🤏🏽"],
  lazy:["Too lazy? It's fine, we'll make it up tomorrow 😌","Okay lazy girl, but no excuses tomorrow 😂"],
  love:["You crossed my mind, and I love you even more","You're truly the best thing in the world","You're the most beautiful thing that ever happened to me","I'm sorry for every time I upset you"],
  morning:["Good morning to the sweetest Nono ☀️ get up, the world is waiting","Wake up cupcake, today will be a good day","Get up… drink some water and smile 😁","Text me, I miss you so much","I've been waiting for you to wake up"],
  period:["Feel better, love. Rest and don't worry about anything 🤍","Make yourself something warm and stay cozy, I'm with you","If you're tired, skip studying for a bit, your health comes first","You're the prettiest thing in the world, even when you're tired ❤️","Want chocolate? Tell me and I'll get it 🍫","Hot water bottle, a nice movie and a blanket. That's an order 😤","Anything bothering you, tell me. I'm here","You're allowed to be spoiled all you want these days 🎀"]
};
const DEFAULT_MSGS_EN_M = {
  d_miss:["Me too, so much, my love ❤️","Every second that passes, I miss you more than the one before","You never get the chance to be missed, because you're always on my mind","I always miss you, even when I'm at my busiest"],
  happy:["Lucky is the day you're happy, my man 😍","Your smile is the best part of my day, my hero","Stay happy like this forever, love","I'm happy as long as you're happy 🤍"],
  good:["Good? Then let's make it even better, my hero 💪","A calm sweet day, just like you","Keep going, love, I'm proud of you"],
  meh:["Meh? Nothing about you is ever meh 🙄","Go do something you love and tell me you feel better 😉","It'll all be for the best, love","This day needs tea and a good song, and I'm with you ☕"],
  sad:["What's wrong, my man? Who upset you? 😤","Sadness is a guest, it'll leave. I'm staying 🤍","You're allowed to be sad, just remember someone loves you so much","I'm sorry if it's because of me, love 😟"],
  stressed:["Breathe, my hero… this will pass and you're stronger 💪","You don't have to finish everything today, one thing is enough","You're the strongest man I know, this stress is small for you","I'm right here with you, everything will be okay ❤️"],
  d_study:["You've got this, my hero, I believe in you 💪","Every page brings you closer to freedom 🎉","I'm proud of you just for sitting down to study","Come on, my hero, almost there 🔥"],
  d_tired:["That's enough for today, love, sleep early, that's an order 😤","Your body needs rest, listen to it and to me","You can handle it, but rest for me ❤️","You're stronger than tired, but take a break, my man"],
  d_sad:["I'll never leave you sad alone 🤍","Whatever happens, you're not alone, I'm with you","I'm with you and I'll always be ❤️","What's wrong, love? Talk to me"],
  d_happy:["Say it again! 😍 I'm so happy for you","See? I told you you're my hero","This deserves a celebration 🎉","I knew you were the smartest man in the world 💪"],
  d_greet:["Better than you 😂😂","Great, because you're with me, love","Good as long as you're with me"],
  d_ghor:["To paradise, together with you 😂","Hopefully to our future home","Leave you? Nope, can't do it"],
  d_story:["Tell me, love ❤️","I'm listening, my hero 👂🏽","I'm here, tell me everything"],
  d_other:["Thanks for telling me, love 🤍","Your stories are the best part of my day","Waiting for the next story, my hero 📔"],
  g_high:["Look at you, my hero 🔥","I knew it! My man is the best as always 💪","That grade deserves a frame 🖼️"],
  g_mid:["Nice, the next one will be even better 💪","Good job, you'll ace it next time"],
  g_low:["Don't worry, love, it's one grade, not the end of the world 🤍","That grade doesn't say who you are","I know you'll make up for it 💪"],
  done:["Way to go, my hero 💪","That's my man 🔥","So proud of you, love"],
  lazy:["Too lazy? It's fine, we'll make it up tomorrow 😌","Okay lazy, but no excuses tomorrow 😂"],
  love:["Just so you know, I'm thinking of you right now 💌","Drink some water, love. It's not advice, it's a love note 💧","You're the best thing that ever happened to me","If anything's bothering you, call me right away"],
  morning:["Good morning, my man ☀️ get up, the world is waiting","Wake up, my hero, today will be a good day","Morning, love. Drink some water and smile 😁","I miss you, text me when you wake up 💌"],
  period:[]
};
/* when the language changes, untouched default groups switch language too; edited groups stay as written */
function swapDefaultMsgs(st, g, rel, from, to){
  const A = defMsgs(g, rel, from), B = defMsgs(g, rel, to);
  for (const k in B) if (st.msgs && JSON.stringify(st.msgs[k]) === JSON.stringify(A[k])) st.msgs[k] = B[k];
}
function defMsgs(g, rel, lang = (typeof LANG === "function" ? LANG() : "ar")){
  const m = JSON.parse(JSON.stringify(lang === "en" ? (g === "m" ? DEFAULT_MSGS_EN_M : DEFAULT_MSGS_EN) : (g === "m" ? DEFAULT_MSGS_M : DEFAULT_MSGS)));
  if (rel === "christian") for (const k in m){ const f = m[k].filter(t => !ISLAMIC.test(t)); m[k] = f.length || !m[k].length ? f : [NEUTRAL_FALLBACK]; }
  return m;
}
/* keyword → reply group for the diary (checked in order) */
const DIARY_RULES = [
  ["d_miss",  ["miss you","missed you","miss u","missing you","وحشتني","وحشتيني","وحشتنى","واحشني","واحشاني","وحشاني","وحشتيني اوي","وحشتني اوي"]],
  ["d_sad",   ["sad","upset","crying","cried","depressed","lonely","hurt","زعلان","مخنوق","مضايق","عيطت","بعيط","حزين","زهقان","مقهور","وحش اوي","مكتئب"]],
  ["d_tired", ["tired","exhausted","sleepy","headache","no energy","تعبان","تعبت","مرهق","مصدع","هلكان","نعسان","مفيش طاقه","تعب"]],
  ["d_study", ["exam","study","studied","quiz","midterm","final","lecture","doctor","مذاكر","ذاكرت","امتحان","كويز","ميدترم","فاينل","محاضر","سكشن","شيت","دكتور","مذاكره"]],
  ["d_happy", ["happy","passed","yay","so good","excited","great day","فرحان","مبسوط","نجحت","قفلت","فرحت","جبت الدرجه","مبسوطه","حلو اوي","اتبسطت"]],
  ["d_ghor",  ["get lost","go away","غور","غوري","اتغور"]],
  ["d_greet", ["how are you","how r u","hello","hi ","ازيك","عامل ايه","اخبارك","عامله ايه"]],
  ["d_story", ["want to talk","let me tell you","i need to talk","عايزه احكي","عايزة احكي","هحكيلك","احكيلك","هقولك حاجه"]]
];


/* ================= masculine wording (when the user is a guy) ================= */
const MASC = {"إنتي":"إنت","انتي":"انت","وانتي":"وانت","ابدئي":"ابدأ","وابدئي":"وابدأ","تبدئي":"تبدأ","ابعتي":"ابعت","ابعتيلي":"ابعتلي","ابعتيها":"ابعتها",
"اتأكدي":"اتأكد","اتبسطي":"اتبسط","احفظي":"احفظ","واحفظي":"واحفظ","واحفظيه":"واحفظه","اختاري":"اختار","تختاري":"تختار","بتختاري":"بتختار","ادخلي":"ادخل","تدخلي":"تدخل",
"اربطي":"اربط","ارتاحي":"ارتاح","استخدمي":"استخدم","استمتعي":"استمتع","اشربي":"اشرب","اصرفي":"اصرف","اعملي":"اعمل","اكتبي":"اكتب","اكتبيه":"اكتبه","تكتبي":"تكتب",
"الصقي":"الصق","امسحي":"امسح","انسخي":"انسخ","وانسخي":"وانسخ","وانسخيه":"وانسخه","تنسخيها":"تنسخها","اهتميتي":"اهتميت","بتذاكريها":"بتذاكرها","تذاكري":"تذاكر",
"بتعافري":"بتعافر","بقيتي":"بقيت","بلّغي":"بلّغ","بيكي":"بيك","تخلّصي":"تخلّص","تزعلي":"تزعل","تسجّلي":"تسجّل","سجّلي":"سجّل","سجّلتي":"سجّلت","تصرفي":"تصرف",
"تصرفيهم":"تصرفهم","صرفتي":"صرفت","صرفتيهم":"صرفتهم","تعالي":"تعالى","تعبانة":"تعبان","تغيّريها":"تغيّرها","غيّري":"غيّر","تفكّي":"تفكّ","فكّي":"فكّ","فكّيه":"فكّه",
"تقدري":"تقدر","وتقدري":"وتقدر","تقفلي":"تقفل","تقفليه":"تقفله","تنسي":"تنسى","جبتي":"جبت","جرّبي":"جرّب","ودوسي":"ودوس","افتحيه":"افتحه","حابة":"حابب","ناوية":"ناوي","تصومي":"تصوم","تتسحّري":"تتسحّر","تقوليه":"تقوله","صلّيتي":"صلّيت","معلّمتيش":"معلّمتش","تقري":"تقرا","قوليها":"قولها","وقوليها":"وقولها","تحددي":"تحدد","اختاري":"اختار","تسجّلي":"تسجّل","تعرفي":"تعرف","معاكي":"معاك","تنسي":"تنسى","والزقي":"والزق","متقوليهوش":"متقولهوش","فاتحة":"فاتح","وهيوريكي":"وهيوريك","عايزة":"عايز","نزّلي":"نزّل","والزقي":"والزق","فعّلي":"فعّل","فاتحة":"فاتح","يوريكي":"يوريك","وهيوريكي":"وهيوريك","متقوليهوش":"متقولهوش","افتحي":"افتح","متخرّجة":"متخرّج","بتدرسي":"بتدرس","وراكي":"وراك","هتدخلي":"هتدخل","وجرّبي":"وجرّب","حابة":"حابب","حطّي":"حطّ","حكيتي":"حكيت",
"خليكي":"خليك","خلّيكي":"خلّيك","خلّصتي":"خلّصت","دلّعتي":"دلّعت","دوسي":"دوس","ذاكرتي":"ذاكرت","رجّعي":"رجّع","رجّعيها":"رجّعها","زعلانة":"زعلان","سيبيها":"سيبها",
"شغّليها":"شغّلها","شوفي":"شوف","صاحبة":"صاحب","ضيفي":"ضيف","عارفة":"عارف","عايزة":"عايز","عايزه":"عايز","عدّيتي":"عدّيت","عليكي":"عليك","علّمي":"علّم","عملتي":"عملت",
"عملتيها":"عملتها","عيّطي":"عيّط","فاكرة":"فاكر","فرحانة":"فرحان","قاعدة":"قاعد","قوليلي":"قولّي","قومي":"قوم","كسلتي":"كسلت","كسولة":"كسول","كلّمي":"كلّم","كمّلي":"كمّل",
"كويسة":"كويس","ليكي":"ليك","مبسوطة":"مبسوط","مبسوطه":"مبسوط","متأكدة":"متأكد","مختارتيش":"مختارتش","مصرفتيش":"مصرفتش","مضايقة":"مضايق","مضغوطة":"مضغوط",
"معاكي":"معاك","موافقة":"موافق","مستعدة":"مستعد","مستنيكي":"مستنيك","نامي":"نام","نسيتي":"نسيت","نمتي":"نمت","هتعوضي":"هتعوض","هصحّيكي":"هصحّيك","هنناديكي":"هنناديك",
"وابتسمي":"وابتسم","وافقتي":"وافقت","شغالة":"شغال","بطلة":"بطل","بسبوسة":"وحش","بسبوسه":"وحش","نونو":"بطل","بنوتي":"بطل","حبيبتي":"حبيبي",
"مسلمة":"مسلم","مسيحية":"مسيحي","خرجتي":"خرجت","قيّمي":"قيّم","اعرضي":"اعرض","فرّحتينا":"فرّحتنا","اكتبيلي":"اكتبلي","اعملي الجروب":"اعمل الجروب","فاكرك علطول":"فكراك علطول","جالك":"جالك","حابة":"حابب","ضيفيها":"ضيفها","هو سامعك":"هي سامعاك","هو بيشوفك":"هي بتشوفك","يرد عليكي":"ترد عليك","من عنده":"من عندها","شريك حياتك":"شريكة حياتك","شريكك":"شريكتك","صاحبة الحساب":"صاحب الحساب"};
const MASC_RE = new RegExp("(^|[^\\u0621-\\u064A\\u0671-\\u06D3])(" + Object.keys(MASC).sort((a,b)=>b.length-a.length).map(k=>k.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")).join("|") + ")(?![\\u0621-\\u064A\\u0671-\\u06D3])", "g");
const mascRaw = str => String(str).replace(MASC_RE, (m, pre, w) => pre + MASC[w]);
const stripMarks = h => String(h).replace(/[]/g, "");
const mascProtected = h => String(h).split(/([^]*)/).map(x => x[0] === "" ? x.slice(1, -1) : mascRaw(x)).join("");
const isMale = () => !!(S && S.user && S.user.gender === "m");
/* gx: final pass on any HTML before it hits the page */
/* ================= language (Arabic / English) ================= */
const LANG = () => (S && S.lang) || (() => { try { return localStorage.getItem("nw-lang") || "ar"; } catch(e){ return "ar"; } })();
const isEN = () => LANG() === "en";
const TR_RE = new RegExp("(^|[^\\u0621-\\u064A\\u0671-\\u06D3])(" + Object.keys(EN).sort((a,b)=>b.length-a.length).map(k=>k.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")).join("|") + ")(?![\\u0621-\\u064A\\u0671-\\u06D3])", "g");
const EN_M = [[/\bcupcake\b/g,"champ"],[/Did it, Nono/g,"Did it, hero"],[/^Nono!$/g,"hero!"],[/he's listening/g,"she's listening"]];
const trRaw = (str, male) => { let o = String(str).replace(TR_RE, (m, pre, w) => pre + EN[w]); if (male) EN_M.forEach(([r,v]) => o = o.replace(r, v)); return o; };
const splitMarks = h => String(h).split(/([^]*)/);
const mascKeep = h => splitMarks(h).map(x => x[0] === "" ? x : mascRaw(x)).join("");
const trKeep = (h, male) => splitMarks(h).map(x => x[0] === "" ? x : trRaw(x, male)).join("");
/* gx: final pass on any HTML before it hits the page (masculine wording, English, then remove the "written by people" marks) */
const gx = (html, on = isMale()) => {
  const en = isEN();
  let out = String(html).split(/(<!--k-->[\s\S]*?<!--\/k-->)/).map(x => x.startsWith("<!--k-->") ? x.slice(8, -9) : (on && !en ? mascKeep(x) : x)).join("");
  if (en) out = trKeep(out, on);
  return stripMarks(stageTx(out));
};
/* keep(): a block about another person, worded by THEIR gender, left alone by the viewer's masculine pass */
const keep = (html, gender) => `<!--k-->${gender === "m" && !isEN() ? mascKeep(html) : html}<!--/k-->`;

const EYE_OPEN = `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>`;
const EYE_SHUT = `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 10c2.4 3.6 5.8 5.5 10 5.5S19.6 13.6 22 10"/><path d="M5 13.6 3.2 16M9.3 15.2 8.6 18M14.7 15.2l.7 2.8M19 13.6l1.8 2.4"/></svg>`;
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
  return { v:1, theme:"basbousa", dark:"auto", lang:(()=>{ try { return localStorage.getItem("nw-lang") || "ar"; } catch(e){ return "ar"; } })(), pin:null, tab:"home", sample:false,
    money:{allowance:0, period:"month", expenses:[]}, schedule:[], tasks:[], subjects:[], sessions:[], exams:[], grades:[],
    moods:{}, care:{}, prayers:{}, cycle:{on:false, history:[]}, diary:[], msgs:defMsgs("f"), rules:[], share:{},
    alarm:{wake:"07:30", reminders:[{id:uid(),time:"21:00",text:"سجّلتي مصاريف النهارده؟ 💸"},{id:uid(),time:"18:00",text:"يلا حبه جد 📚"}]},
    lastMorning:null, timer:null, chatId:"c0", durations:{focus:25, rest:5}, vacation:{on:false}, loveOff:false, stage:"uni", work:[],
    clock:"auto", pray:{on:true, remind:true, azkar:true, kahf:true, fast:false}, loc:null, nudge:{every:4}, azkarDone:{} };
}
function normalize(s, gender){
  const b = blank();
  for (const k in b) if (s[k] === undefined || s[k] === null && k !== "pin" && k !== "lastMorning" && k !== "timer") s[k] = b[k];
  const dm = defMsgs(gender, s.religionHint); for (const k in dm) if (!s.msgs[k] || !s.msgs[k].length) s.msgs[k] = dm[k];
  // love messages: lists nobody edited (only old default lines) move to the new, longer default list
  if (Array.isArray(s.msgs.love)){ const known = new Set(LOVE_OLD.concat(dm.love || [], DEFAULT_MSGS.love, DEFAULT_MSGS_M.love));
    if (s.msgs.love.every(t => known.has(t)) && JSON.stringify(s.msgs.love) !== JSON.stringify(dm.love)) s.msgs.love = (dm.love || []).slice(); }
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
const SEC = { prefs:["theme","dark","lang","currency","durations","vacation","alarm","subjects","chatId","lastMorning","lastCare","pin","loveOff","stage","pray","loc","nudge","azkarDone","clock"], money:["money"], day:["schedule","tasks"],
  study:["sessions","exams","grades","work"], mood:["moods"], care:["care","prayers","cycle"], msgs:["msgs","rules"] };
const GR = {list:[], open:null, msgs:[], unsub:null};
const CP = {msgs:[], cid:null};
const CFG = {love:{}, cheer:{}, msgs:{}};
const lovePool = () => { const extra = ((CFG.love || {})[S.user && S.user.gender === "m" ? "m" : "f"]) || []; return baseMsgs("love").concat(isEN() ? [] : extra); };
const PSUB = {};
/* friends: a lighter link than a partner. They only see what you tap in "what did you do today", and chat in the friends tab */
const FR = {list:[], acts:{}, subs:{}, open:null, msgs:[], unsub:null, mine:null, seen:{}};
const ACT_PRESETS = [["🏋️","نزلت الجيم"],["🚿","خدت دش"],["📚","ذاكرت"],["💧","شربت مية كتير"],["🚶","اتمشيت"],["🥗","أكلت صحي"],["😴","نمت بدري"],["📖","قريت"]];
const friendOf = f => (f.members || []).find(m => m !== UID);
const todayLog = d => ((d && d.log) || []).filter(x => dkey(new Date(x.ts)) === dkey());
/* encouragement instead of love notes, for anyone who turned them off */
const CHEER_F = ["إنتي أقوى بكتير مما تتخيلي 💪","خطوة صغيرة النهارده أحسن من ولا حاجة 🌱","إنتي قدها، وأكتر من قدها","افتكري قد إيه وصلتي، وكمّلي 🌸","مش لازم تكوني مثالية، كفاية إنك بتحاولي","كل يوم بتتعلمي حاجة جديدة، وده إنجاز","ارتاحي لو تعبتي، بس متستسلميش","إنتي تستاهلي كل حاجة حلوة 🤍","النهارده فرصة جديدة، استغليها","فخورين بيكي، حتى في الأيام الصعبة","ابتسمي، الدنيا لسه فيها حاجات حلوة كتير ☀️","صدّقي في نفسك زي ما بتصدّقي في اللي بتحبيهم","إنتي أشطر من الامتحان ده، ومن أي ضغط","اهتمي بنفسك، إنتي أهم حاجة 💅","حلمك يستاهل التعب، كمّلي"];
const CHEER_M = ["إنت أقوى بكتير مما تتخيل 💪","خطوة صغيرة النهارده أحسن من ولا حاجة 🌱","إنت قدها، وأكتر من قدها","افتكر قد إيه وصلت، وكمّل 🔥","مش لازم تكون مثالي، كفاية إنك بتحاول","كل يوم بتتعلم حاجة جديدة، وده إنجاز","ارتاح لو تعبت، بس متستسلمش","إنت تستاهل كل حاجة حلوة","النهارده فرصة جديدة، استغلها يا بطل","فخورين بيك، حتى في الأيام الصعبة","ركّز في هدفك، والباقي هييجي ☀️","صدّق في نفسك، إنت تقدر","إنت أشطر من الامتحان ده، ومن أي ضغط","اهتم بنفسك، إنت أهم حاجة","حلمك يستاهل التعب، كمّل يا وحش 💪"];
const CHEER_EN = ["You're way stronger than you think 💪","A small step today beats no step at all 🌱","You've got this, and then some","Look how far you've come, keep going","You don't have to be perfect, trying is enough","Rest if you're tired, just don't give up","You deserve every good thing 🤍","Today is a fresh chance, use it","Believe in yourself the way you believe in the people you love","Your dream is worth the effort, keep going"];
const hasMate = () => !CLOUD || !!(P && P.linked);
const loveOn = () => hasMate() && !(S && S.loveOff);
const MORNING_CHEER_F = ["صباح الخير ☀️ يوم جديد وفرصة جديدة","صباح الفل، قومي اشربي مية وابدئي يومك 💧","يلا قومي، النهارده هيبقى يوم حلو 🌸"];
const MORNING_CHEER_M = ["صباح الخير يا بطل ☀️ يوم جديد وفرصة جديدة","صباح الفل، قوم اشرب مية وابدأ يومك 💧","يلا قوم، النهارده هيبقى يوم حلو 🔥"];
const morningPick = () => loveOn() ? pick(S.msgs.morning) : (isEN() ? "Good morning ☀️ a new day, a new chance" : pick(S.user && S.user.gender === "m" ? MORNING_CHEER_M : MORNING_CHEER_F));
const cheerPool = () => isEN() ? CHEER_EN : (S.user && S.user.gender === "m" ? CHEER_M : CHEER_F).concat(((CFG.cheer || {})[S.user && S.user.gender === "m" ? "m" : "f"]) || []);

/* ================= messages when there's no partner: encouragement only, no romance, no nicknames ================= */
const SOLO_F = {
  happy:["مبسوطة؟ حقك، استمتعي باليوم ده 😍","الضحكة دي حلوة عليكي، خليها على طول","يوم حلو، خليه يكمّل كده ☀️"],
  good:["حلو، كمّلي كده 🌸","يوم هادي ولطيف، استمتعي بيه","كويسة؟ يبقى يلا نعمل حاجة حلوة النهارده"],
  meh:["عادي؟ ممكن تقومي تعملي حاجة بتحبيها وتفرق 😉","اليوم ده محتاج كوباية حاجة سخنة وأغنية حلوة ☕","مش كل الأيام لازم تبقى حلوة، وده طبيعي"],
  sad:["الزعل ده ضيف وهيمشي 🤍","مسموحلك تزعلي، بس متنسيش إنك أقوى من اللي حاصل","طلّعي اللي جواكي، وبعدين اعملي حاجة صغيرة بتحبيها","كلّمي حد بتحبيه وبتثقي فيه، هيفرق معاكي"],
  stressed:["خدي نفس عميق، حاجة واحدة بس في المرة 🌱","مش لازم تخلّصي كل حاجة النهارده","إنتي أشطر من الضغط ده بكتير","قسّمي الشغل حتت صغيرة، وابدئي بأسهلها"],
  d_study:["كل صفحة بتذاكريها بتقرّبك من هدفك 🎉","إنك قاعدة تذاكري أصلًا دي لوحدها شطارة","كمّلي، إنتي قدها 💪"],
  d_tired:["كفاية كده النهارده، ارتاحي ونامي بدري 😴","جسمك بيقولك ارتاحي، اسمعي كلامه","التعب ده معناه إنك بتعافري، ارتاحي بقى"],
  d_sad:["مهما حصل، الأيام الصعبة بتعدّي 🤍","طلّعي كل اللي جواكي هنا، الدفتر ده بتاعك","كلّمي حد قريب منك، الكلام بيريّح","إنتي مش لوحدك، وفي ناس بتحبك"],
  d_happy:["الله! قوليلي تاني 😍","ده يستاهل احتفال 🎉","شوفتي؟ إنتي جامدة","فرحتلك بجد 🌟"],
  d_miss:["اللي وحشك أكيد هيفرح لو كلّمتيه 🤍","ابعتيله رسالة، مش هتخسري حاجة","الحنين ده معناه إن عندك ناس حلوة في حياتك"],
  d_greet:["أهلًا 👋 عاملة إيه النهارده؟","تمام الحمد لله، وإنتي؟","أهلًا أهلًا، احكي"],
  d_ghor:["😂 ماشي، بس ارجعي احكي لما تحبي","حاضر 😂 الدفتر مستنيكي"],
  d_story:["احكي، أنا سامعة 👂🏽","الدفتر ده بتاعك، اكتبي كل اللي في بالك","يلا احكي من الأول"],
  d_other:["شكرًا إنك كتبتي 🤍","كتابة اللي في بالك بتريّح","مستنية الحكاية الجاية 📔"],
  g_high:["إيه الشطارة دي 😍🔥","الدرجة دي تستاهل تتبروز 🖼️","تعبك جاب نتيجة 👏"],
  g_mid:["حلو، والمرة الجاية أحسن 💪","كويس، كمّلي وهتقفلي"],
  g_low:["ولا يهمك، دي درجة مش آخر الدنيا 🤍","الدرجة دي مش بتقول إنتي مين","هتعوّضيها، ابدئي من النهارده"],
  done:["عملتيها 👏","برافو عليكي 💪","خطوة كمان، كمّلي"],
  lazy:["كسلتي؟ عادي، بكرة نعوّضها 😌","مفيش مشكلة، بكرة يوم جديد"],
  love:[],
  morning:["صباح الخير ☀️ يوم جديد وفرصة جديدة","صباح الفل، قومي اشربي مية وابدئي يومك 💧","يلا قومي، النهارده هيبقى يوم حلو 🌸"],
  period:["ألف سلامة عليكي، ارتاحي ومتشيليش هم حاجة 🤍","اعملي لنفسك حاجة دافية واتغطي كويس","لو تعبانة سيبي المذاكرة شوية، صحتك أهم","قربة مية سخنة وفيلم حلو والبطانية 😌","مسموحلك تدلّعي نفسك الأيام دي 🎀"]
};
const SOLO_M = {
  happy:["مبسوط؟ حقك، استمتع باليوم ده 😎","يوم حلو، خليه يكمّل كده ☀️","كده يا بطل 🔥"],
  good:["حلو، كمّل كده 💪","يوم هادي ولطيف، استمتع بيه","كويس؟ يبقى يلا نعمل حاجة مفيدة النهارده"],
  meh:["عادي؟ قوم اعمل حاجة بتحبها وهتفرق 😉","اليوم ده محتاج كوباية شاي وأغنية حلوة ☕","مش كل الأيام لازم تبقى حلوة، وده طبيعي"],
  sad:["الزعل ده ضيف وهيمشي 🤍","مسموحلك تزعل، بس إنت أقوى من اللي حاصل","طلّع اللي جواك، وبعدين اعمل حاجة صغيرة بتحبها","كلّم حد بتثق فيه، هيفرق معاك"],
  stressed:["خد نفس عميق، حاجة واحدة بس في المرة 🌱","مش لازم تخلّص كل حاجة النهارده","إنت أقوى من الضغط ده بكتير 💪","قسّم الشغل حتت صغيرة، وابدأ بأسهلها"],
  d_study:["كل صفحة بتذاكرها بتقرّبك من هدفك 🎉","إنك قاعد تذاكر أصلًا دي لوحدها شطارة","كمّل يا بطل، إنت قدها 💪"],
  d_tired:["كفاية كده النهارده، ارتاح ونام بدري 😴","جسمك بيقولك ارتاح، اسمع كلامه","التعب ده معناه إنك بتعافر، ارتاح بقى"],
  d_sad:["مهما حصل، الأيام الصعبة بتعدّي 🤍","طلّع كل اللي جواك هنا، الدفتر ده بتاعك","كلّم حد قريب منك، الكلام بيريّح","إنت مش لوحدك"],
  d_happy:["الله! قولّي تاني 🔥","ده يستاهل احتفال 🎉","شوفت؟ إنت جامد","فرحتلك بجد 🌟"],
  d_miss:["اللي وحشك أكيد هيفرح لو كلّمته 🤍","ابعتله رسالة، مش هتخسر حاجة","الحنين ده معناه إن عندك ناس حلوة في حياتك"],
  d_greet:["أهلًا 👋 عامل إيه النهارده؟","تمام الحمد لله، وإنت؟","أهلًا أهلًا، احكي"],
  d_ghor:["😂 ماشي، بس ارجع احكي لما تحب","حاضر 😂 الدفتر مستنيك"],
  d_story:["احكي، أنا سامعك 👂🏽","الدفتر ده بتاعك، اكتب كل اللي في بالك","يلا احكي من الأول"],
  d_other:["شكرًا إنك كتبت 🤍","كتابة اللي في بالك بتريّح","مستني الحكاية الجاية 📔"],
  g_high:["إيه الشطارة دي 🔥","الدرجة دي تستاهل تتبروز 🖼️","تعبك جاب نتيجة يا بطل 👏"],
  g_mid:["حلو، والمرة الجاية أحسن 💪","كويس، كمّل وهتقفل"],
  g_low:["ولا يهمك، دي درجة مش آخر الدنيا 🤍","الدرجة دي مش بتقول إنت مين","هتعوّضها، ابدأ من النهارده"],
  done:["عملتها 👏","برافو عليك 💪","خطوة كمان يا بطل، كمّل"],
  lazy:["كسلت؟ عادي، بكرة نعوّضها 😌","مفيش مشكلة، بكرة يوم جديد"],
  love:[],
  morning:["صباح الخير يا بطل ☀️ يوم جديد وفرصة جديدة","صباح الفل، قوم اشرب مية وابدأ يومك 💧","يلا قوم، النهارده هيبقى يوم حلو 🔥"],
  period:[]
};
const SOLO_EN = {
  happy:["Happy? You deserve it, enjoy today 😍","Great day, keep it going ☀️"], good:["Nice, keep going 🌸","A calm, sweet day. Enjoy it"],
  meh:["Meh? Do something you love, it helps 😉","Not every day has to be great, and that's okay"],
  sad:["Sadness is a guest, it'll leave 🤍","Talk to someone you trust, it helps","You're stronger than what's happening"],
  stressed:["Take a deep breath, one thing at a time 🌱","You don't have to finish everything today","Break it into small pieces and start with the easiest"],
  d_study:["Every page brings you closer to your goal 🎉","Just sitting down to study is already a win","Keep going, you've got this 💪"],
  d_tired:["That's enough for today, rest and sleep early 😴","Your body needs rest, listen to it"],
  d_sad:["Hard days pass 🤍","Write it all out here, this diary is yours","Talk to someone close to you"],
  d_happy:["Yay! Tell me again 😍","That deserves a celebration 🎉"], d_miss:["Whoever you miss would love to hear from you 🤍","Send them a message"],
  d_greet:["Hi 👋 how's your day?","Hey, tell me everything"], d_ghor:["😂 Okay, come back when you want to talk"],
  d_story:["Go ahead, I'm listening 👂🏽","This diary is yours, write everything"], d_other:["Thanks for writing 🤍","Writing it down helps"],
  g_high:["Look at that grade 🔥","Your hard work paid off 👏"], g_mid:["Nice, next time will be even better 💪"], g_low:["Don't worry, it's one grade 🤍","You'll make up for it, start today"],
  done:["Done 👏","Well done 💪"], lazy:["Too lazy? It's fine, tomorrow is a new day 😌"], love:[],
  morning:["Good morning ☀️ a new day, a new chance","Drink some water and start your day 💧"],
  period:["Feel better, rest and take it easy 🤍","Something warm and a cozy blanket 😌"]
};
/* the message pool to use: the partner's words when linked, encouragement otherwise */
const gKey = () => S && S.user && S.user.gender === "m" ? "m" : "f";
const cleanRel = arr => (S && S.user && S.user.religion === "christian") ? arr.filter(t => !ISLAMIC.test(t)) : arr;
const baseMsgs = k => { const own = S.msgs[k] || [], glob = ((CFG.msgs || {})[gKey()] || {})[k];
  if (isEN() || !glob || !glob.length) return own;
  const def = defMsgs(gKey(), S.user && S.user.religion)[k] || [];
  return JSON.stringify(own) === JSON.stringify(def) ? (cleanRel(glob).length ? cleanRel(glob) : own) : own; };
const globalRules = () => isEN() ? [] : ((CFG.msgs || {})["rules_" + gKey()] || []);
const MS = k => { if (loveOn()) return baseMsgs(k); const set = isEN() ? SOLO_EN : (S.user && S.user.gender === "m" ? SOLO_M : SOLO_F); return (set[k] && set[k].length ? set[k] : cheerPool()); };
const coupleId = (a, b) => [a, b].sort().join("_");
const SEEN = {him:null, mate:null, groups:null, mine:new Set(), tried:new Set()};
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
function forgetAccount(id){ try { [KEY + ":" + id, KEY + ":me:" + id, "nw-name", "nw-welcome"].forEach(k => localStorage.removeItem(k)); } catch(e){} }
async function boot(u){
  stopAll(unsubs); stopAll(punsubs); P = null; ME = null; IS_ADMIN = false; lastPushed = {}; lastDiary = new Map();
  if (!u){ UID = null; S = null; render(); return; }
  UID = u.uid;
  if (signingUp) { try { await signingUp; } catch(e){} }
  const meKey = KEY + ":me:" + UID;
  let cachedS = null, cachedME = null;
  try { const c = localStorage.getItem(KEY + ":" + UID); if (c) cachedS = JSON.parse(c); cachedME = JSON.parse(localStorage.getItem(meKey) || "null"); } catch(e){}
  const apply = (meDoc, st, secsLoaded) => {
    ME = meDoc;
    st.religionHint = ME.religion || "muslim";
    S = normalize(st, ME.gender); S.tab = S.tab || "home";
    if (secsLoaded) Object.keys(SEC).forEach(sec => lastPushed[sec] = JSON.stringify(secData(S, sec)));
    try { localStorage.setItem("nw-lang", S.lang || "ar"); localStorage.setItem("nw-g", ME.gender || "f"); localStorage.setItem("nw-name", ME.name || ""); if (ME.special) localStorage.setItem("nw-special", ME.special); else localStorage.removeItem("nw-special"); localStorage.setItem(meKey, JSON.stringify(ME)); } catch(e){}
    if (S.cycle && S.cycle.on && !cycleOn() && dkey() > S.cycle.start){ S.cycle.history = (S.cycle.history||[]).concat({start:S.cycle.start, days:S.cycle.days||7}).slice(-12); S.cycle.on = false; }
    S.user = {name:ME.name, username:ME.username, gender:ME.gender, religion:ME.religion || "muslim"}; S.share = Object.assign({}, ME.share || {});
  };
  const fetchAll = () => Promise.all([
    fb.get(`users/${UID}`),
    Promise.all(Object.keys(SEC).map(sec => fb.get(`u/${UID}/sec/${sec}`).catch(()=>null))),
    fb.get(`admins/${UID}`).catch(()=>null)
  ]);
  if (U.fresh && U.fresh.uid === UID){
    // just signed up: everything is already here, no need to download it again
    apply(U.fresh.me, U.fresh.st, true); U.fresh = null; save();
  } else if (cachedS && cachedME){
    // same device as before: open instantly from what's saved, refresh from the cloud in the background
    apply(cachedME, normalize(cachedS, cachedME.gender), true);
    fetchAll().then(([meDoc, secs, adm]) => {
      if (UID !== u.uid) return;
      if (!meDoc){ forgetAccount(UID); toast("الحساب ده مبقاش موجود، اعملي حساب جديد"); fb.signOut(); return; }
      IS_ADMIN = !!adm; const st = S;
      Object.keys(SEC).forEach((sec, i) => { const d = secs[i]; if (!d) return; if (JSON.stringify(secData(st, sec)) !== lastPushed[sec]) return; Object.assign(st, d); lastPushed[sec] = JSON.stringify(secData(st, sec)); });
      apply(meDoc, st, false); save(); if (!$("#layer").innerHTML && !(document.activeElement && /INPUT|TEXTAREA/.test(document.activeElement.tagName))) render();
    }).catch(e => console.warn("refresh", e));
  } else {
    let meDoc = null, secs = [], adm = null;
    try { [meDoc, secs, adm] = await fetchAll(); } catch(e){ console.warn(e); }
    if (!meDoc){
      if (navigator.onLine){ await fb.signOut(); toast("الحساب مش كامل، اعملي حساب تاني 🙏"); return; }
      S = null; UID = null; render(); toast("محتاجين نت أول مرة تدخلي 📶"); return;
    }
    IS_ADMIN = !!adm; const st = blank();
    Object.keys(SEC).forEach((sec, i) => { const d = secs[i]; if (d) Object.assign(st, d); });
    apply(meDoc, st, true);
  }
  SEEN.him = null; SEEN.mate = null; SEEN.groups = null;
  unsubs.push(fb.listenCol(`u/${UID}/chat`, list => {
    const him = list.filter(e => e.from === "him");
    if (SEEN.him) him.filter(e => !SEEN.him.has(e.id)).forEach(e => { if (!(S.tab === "diary" && document.visibilityState === "visible")) notice(`💌 ${P && P.user ? P.user.name : "شريكك"}`, e.text || ""); });
    SEEN.him = new Set(him.map(e => e.id));
    const local = new Map(S.diary.filter(e=>e.pending).map(e=>[e.id,e]));
    S.diary = list.map(e => { const {at, ...rest} = e; lastDiary.set(e.id, JSON.stringify(rest)); return rest; });
    local.forEach((e,id) => { if (!S.diary.some(x=>x.id===id)) S.diary.push(e); });
    if (S.tab === "diary" && U.dmode === "me" && !$("#layer").innerHTML){ keepTyping(render); scrollChat(); }
  }));
  unsubs.push(fb.listen(`u/${UID}/sec/msgs`, d => { if (!d) return; const j = JSON.stringify(secData(Object.assign({}, S, d), "msgs")); if (j !== lastPushed.msgs){ S.msgs = d.msgs || S.msgs; S.rules = d.rules || []; lastPushed.msgs = j; } }));
  unsubs.push(fb.listen(`users/${UID}`, d => { if (!d) return; const before = ME.partner; ME = d; try { localStorage.setItem(meKey, JSON.stringify(d)); } catch(e){} S.user = {name:d.name, username:d.username, gender:d.gender, religion:d.religion || "muslim"};
    if (d.banned){ render(); return; } if (before !== d.partner) setupPartner(); }));
  GR.list = []; GR.open = null; GR.msgs = [];
  unsubs.push(fb.listenWhere("groups", "members", "array-contains", UID, list => {
    if (SEEN.groups) list.forEach(g => { const before = SEEN.groups[g.id] || 0; if ((g.last||0) > before && !SEEN.mine.has(g.last) && !(GR.open === g.id && S.tab === "diary" && document.visibilityState === "visible")) notice(`👭 ${g.name || ""}`, g.lastText || ""); });
    SEEN.groups = {}; list.forEach(g => { SEEN.groups[g.id] = g.last || 0; if (ME && ME.ntfy && (g.topics||{})[UID] !== ME.ntfy && !SEEN.tried.has(g.id)){ SEEN.tried.add(g.id); fb.set(`groups/${g.id}`, {topics:{[UID]:ME.ntfy}}).catch(()=>{}); } });
    GR.list = list; if (S && S.tab === "diary" && U.dmode === "friends" && !$("#layer").innerHTML) keepTyping(render); }, () => {}));
  unsubs.push(fb.listen(`usernameRequests/${UID}`, d => {
    const before = U.unReq; U.unReq = d;
    if (d && d.status === "done"){ U.unReq = null; fb.del(`usernameRequests/${UID}`).catch(()=>{}); if (ME) ME.username = d.username; if (S && S.user) S.user.username = d.username; render(); message("✅", "اليوزر نيم اتغيّر لـ @" + d.username + (isMale() ? "، ادخل بيه المرة الجاية" : "، ادخلي بيه المرة الجاية"), "👤"); }
    if (S && S.tab === "settings" && JSON.stringify(before) !== JSON.stringify(U.unReq) && !$("#layer").innerHTML) keepTyping(render);
  }, () => {}));
  FR.list = []; FR.open = null; FR.msgs = []; FR.mine = null; FR.seen = {}; Object.values(FR.subs).forEach(u => { try { u(); } catch(e){} }); FR.subs = {}; FR.acts = {};
  unsubs.push(() => { Object.values(FR.subs).forEach(u => { try { u(); } catch(e){} }); FR.subs = {}; if (FR.unsub){ try { FR.unsub(); } catch(e){} FR.unsub = null; } });
  unsubs.push(fb.listen(`act/${UID}`, d => { FR.mine = d || {items:[], log:[]}; if (S && S.tab === "diary" && U.dmode === "friends" && !FR.open && !GR.open && !$("#layer").innerHTML) keepTyping(render); }, () => {}));
  unsubs.push(fb.listenWhere("friends", "members", "array-contains", UID, list => {
    const before = FR.list; FR.list = list;
    list.filter(f => f.status === "pending" && f.from !== UID && !before.some(b => b.id === f.id)).forEach(f => notice("👭 طلب صداقة", ((f.names||{})[f.from] || "")));
    const ok = new Set(list.filter(f => f.status === "ok").map(friendOf));
    Object.keys(FR.subs).forEach(id => { if (!ok.has(id)){ try { FR.subs[id](); } catch(e){} delete FR.subs[id]; delete FR.acts[id]; } });
    ok.forEach(id => { if (FR.subs[id]) return; FR.subs[id] = fb.listen(`act/${id}`, d => {
      const prev = FR.seen[id]; const ids = new Set(((d && d.log) || []).map(x => x.id));
      if (prev) todayLog(d).filter(x => !prev.has(x.id)).forEach(x => { const f = FR.list.find(z => friendOf(z) === id); notice(`${x.e} ${((f||{}).names||{})[id] || ""}`, x.t); });
      FR.seen[id] = ids; FR.acts[id] = d;
      if (S && S.tab === "diary" && U.dmode === "friends" && !FR.open && !GR.open && !$("#layer").innerHTML) keepTyping(render); }, () => {}); });
    if (S && S.tab === "diary" && U.dmode === "friends" && !$("#layer").innerHTML) keepTyping(render);
  }, () => {}));
  unsubs.push(fb.listen("config/love", d => { CFG.love = d || {}; }, () => {}));
  unsubs.push(fb.listen("config/cheer", d => { CFG.cheer = d || {}; }, () => {}));
  unsubs.push(fb.listen("config/msgs", d => { CFG.msgs = d || {}; }, () => {}));
  unsubs.push(fb.listen(`admins/${UID}`, d => { const was = IS_ADMIN; IS_ADMIN = !!d; if (was !== IS_ADMIN && S && !$("#layer").innerHTML) keepTyping(render); }, () => {}));
  unsubs.push(fb.listen(`linkRequests/${UID}`, d => { if (d && d.from && d.from !== ME.partner) linkRequestSheet(d); }));
  setupPartner();
  let firstTime = false; try { firstTime = localStorage.getItem("nw-welcome") === UID; if (firstTime) localStorage.removeItem("nw-welcome"); } catch(e){}
  render(); if (firstTime) welcomeScreen(); else startupChecks(); scheduleNative();
  try { if (!LN() && "Notification" in window && Notification.permission === "default") document.addEventListener("click", () => Notification.requestPermission().catch(()=>{}), {once:true}); } catch(e){}
}
function setupPartner(){
  stopAll(punsubs); Object.values(PSUB).forEach(u => { try { u(); } catch(e){} }); for (const k in PSUB) delete PSUB[k]; P = null; CP.msgs = []; CP.cid = null; if (U.dmode === "us") U.dmode = "me";
  const pid = ME && ME.partner; if (!pid) { if (S && S.tab === "partner") S.tab = "home"; render(); return; }
  P = Object.assign(blank(), {uid:pid, linked:false, user:null, loaded:{}});
  const sub = (path, cb) => punsubs.push(fb.listen(path, cb, () => {}));
  punsubs.push(fb.listen(`users/${pid}`, d => {
    if (!d){ return; }
    P.user = d; const wasLinked = P.linked; P.linked = d.partner === UID; P.share = d.share || {}; if (wasLinked !== P.linked && S) S._love = null;
    if (P.linked && !wasLinked){
      sub(`u/${pid}/sec/prefs`, v => { if (v){ Object.assign(P, v); P.loaded.prefs = true; } if (S.tab === "partner") render(); });
      sub(`u/${pid}/sec/msgs`, v => { if (v){ Object.assign(P, v); P.loaded.msgs = true; } if (S.tab === "partner") render(); });
      CP.cid = coupleId(UID, pid); CP.msgs = []; let cpFirst = true;
      punsubs.push(fb.listenCol(`couples/${CP.cid}/msgs`, list => {
        if (!cpFirst) list.filter(m => m.from !== UID && !CP.msgs.some(x => x.id === m.id)).forEach(m => { if (!(S.tab === "diary" && U.dmode === "us" && document.visibilityState === "visible")) notice(`💞 ${P.user ? P.user.name : ""}`, m.text || ""); });
        cpFirst = false; CP.msgs = list;
        if (S.tab === "diary" && U.dmode === "us" && !$("#layer").innerHTML){ keepTyping(render); scrollChat(); }
      }, () => {}, 500));
    }
    // follow what the partner chose to share: start a section when it's turned on, stop and forget it when it's hidden
    if (P.linked) SHARE.map(x=>x[0]).forEach(sec => {
      const on = P.share[sec] !== false, has = !!PSUB[sec];
      if (on && !has){
        PSUB[sec] = sec === "diary"
          ? fb.listenCol(`u/${pid}/chat`, list => { const own = list.filter(e => e.from !== "him");
              if (SEEN.mate) own.filter(e => !SEEN.mate.has(e.id)).forEach(e => { if (!(S.tab === "mate" && document.visibilityState === "visible")) notice(`📔 ${P.user ? P.user.name : ""}`, e.text || ""); });
              SEEN.mate = new Set(own.map(e => e.id)); P.diary = list; if (S.tab === "partner" || S.tab === "mate") render(); }, () => {})
          : fb.listen(`u/${pid}/sec/${sec}`, v => { if (v){ Object.assign(P, v); P.loaded[sec] = true; } if (S.tab === "partner" || S.tab === "mate") render(); }, () => {});
      } else if (!on && has){
        try { PSUB[sec](); } catch(e){} delete PSUB[sec]; P.loaded[sec] = false;
        if (sec === "diary"){ P.diary = []; SEEN.mate = null; }
      }
    });
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
  let resolveSU, rejectSU; signingUp = new Promise((r,j)=>{resolveSU=r; rejectSU=j;}); signingUp.catch(()=>{});
  try {
    let uidNew;
    try { uidNew = await fb.signUp(username, pass); }
    catch(e){
      if (!String(e && e.code || "").includes("email-already-in-use")) throw e;
      // an earlier try may have made the login but not the profile: same password = it's yours, finish it
      try { uidNew = await fb.signIn(username, pass); } catch(_){ throw e; }
      let existing; try { existing = await fb.get(`users/${uidNew}`); } catch(_){ throw e; }
      if (existing){ resolveSU(); return; }
    }
    const code = genCode(), topic = "nw-" + Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
    const me = {name, username:username.toLowerCase(), gender, partner:null, share:{}, invite:code, ntfy:topic, religion, createdAt:Date.now()};
    // queued writes go out in order, so the user doc lands before the rest; no need to wait for the server here
    const meWrite = fb.set(`users/${uidNew}`, me, false);
    meWrite.catch(e => { console.warn("me write", e); toast("حصلت مشكلة في حفظ الحساب، جرّبي تاني"); });
    const st = blank(); st.theme = gender === "m" ? "leil" : "basbousa"; st.msgs = defMsgs(gender, religion); st.stage = U.stage || "uni";
    if (gender === "m") st.alarm.reminders = [{id:uid(),time:"21:00",text:"سجّلت مصاريف النهارده؟ 💸"},{id:uid(),time:"18:00",text:"يلا حبه جد 📚"}];
    U.fresh = {uid:uidNew, me, st};
    try { localStorage.setItem("nw-welcome", uidNew); } catch(e){}
    resolveSU();
    Promise.all([fb.set(`invites/${code}`, {uid:uidNew, name}, false), fb.set(`u/${uidNew}/sec/prefs`, secData(st, "prefs"), false), fb.set(`u/${uidNew}/sec/msgs`, secData(st, "msgs"), false)]).catch(e => console.warn("signup extras", e));
  } catch(e){ rejectSU(e); throw e; } finally { setTimeout(()=>signingUp=null, 0); }
}
function authBoy(){ if (U.authMode !== "login") return U.ag === "m"; try { return localStorage.getItem("nw-g") === "m"; } catch(e){ return false; } }
function authError(e){
  const c = (e && e.code) || "";
  if (c.includes("email-already-in-use")) return "اسم المستخدم ده متاخد، جرّبي اسم تاني";
  if (c.includes("invalid-credential") || c.includes("wrong-password") || c.includes("user-not-found")) return "اسم المستخدم أو الباسورد غلط";
  if (c.includes("weak-password")) return "الباسورد لازم 6 حروف أو أرقام على الأقل";
  if (c.includes("network")) return "مفيش إنترنت، جرّبي تاني";
  if (c.includes("too-many-requests")) return "محاولات كتير، استني شوية وجرّبي تاني";
  return "حصلت مشكلة، جرّبي تاني";
}
/* push notifications when the app is closed go through the free ntfy app; walk everyone through setting it up once */
const DEVICE = () => { const ua = navigator.userAgent || ""; return /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) ? "ios" : /Android/.test(ua) ? "android" : /Electron/.test(ua) ? "win" : "desktop"; };
const NTFY_IOS = "https://apps.apple.com/app/ntfy/id1625396347", NTFY_ANDROID = "https://play.google.com/store/apps/details?id=io.heckel.ntfy";
const notifDone = () => { try { return localStorage.getItem("nw-ntfy-ok") === "1"; } catch(e){ return true; } };
const notifNeeded = () => CLOUD && ME && ME.ntfy && !notifDone() && (DEVICE() === "ios" || DEVICE() === "android");
function notifSheet(){
  const d = DEVICE(), topic = ME && ME.ntfy || "";
  const copy = `<div class="item" style="margin:6px 0"><div class="grow t num" dir="ltr" style="word-break:break-all;font-size:13px">${esc(topic)}</div><button class="mini" data-act="copy" data-v="${esc(topic)}">نسخ</button></div>`;
  const steps = d === "ios" ? `<ol class="howto">
      <li>نزّلي تطبيق <b>ntfy</b> من الـ App Store (مجاني):<br><a class="btn small" style="margin-top:6px;text-decoration:none" href="${NTFY_IOS}" target="_blank" rel="noopener">⬇️ App Store</a></li>
      <li>انسخي الكود بتاعك:${copy}</li>
      <li>افتحي <b>ntfy</b> ودوسي <b>+</b> اللي فوق، والزقي الكود في <b>Topic</b>، ودوسي <b>Subscribe</b>.</li>
      <li>لما يسألك "Allow notifications؟" دوسي <b>Allow</b>.</li></ol>`
    : d === "android" ? `<ol class="howto">
      <li>نزّلي تطبيق <b>ntfy</b> من Google Play (مجاني):<br><a class="btn small" style="margin-top:6px;text-decoration:none" href="${NTFY_ANDROID}" target="_blank" rel="noopener">⬇️ Google Play</a></li>
      <li>انسخي الكود بتاعك:${copy}</li>
      <li>افتحي <b>ntfy</b> ودوسي <b>+</b> اللي تحت، والزقي الكود في <b>Topic name</b>، ودوسي <b>Subscribe</b>.</li>
      <li>لو سألك عن الإشعارات دوسي <b>سماح</b>.</li></ol>`
    : d === "win" ? `<p>إنتي على الكمبيوتر ✅ الإشعارات شغالة لوحدها طول ما البرنامج شغال جنب الساعة.</p>`
    : `<p>إنتي فاتحة من المتصفح. علشان الإشعارات توصلك على الموبايل وهو مقفول، افتحي التطبيق من الموبايل وهيوريكي الطريقة. ولو عايزة على الكمبيوتر، نزّلي برنامج الويندوز من الموقع.</p>`;
  sheet(`<h2>🔔 خلّي الإشعارات توصلك</h2>
    <p class="muted small" style="margin:-6px 0 6px">علشان رسايل ${P && P.linked ? "شريكك وصحابك" : "صحابك"} والجروبات توصلك حتى لو التطبيق مقفول خالص. دقيقة واحدة ومرة واحدة بس 💗</p>
    ${steps}
    <p class="muted small">🔒 الكود ده بتاعك إنتي بس، متقوليهوش لحد.</p>
    ${d === "ios" || d === "android" ? `<button class="btn ghost small block" style="margin-bottom:8px" data-act="notif-test">🧪 ابعتيلي إشعار تجربة</button>` : ""}
    <div class="form"><button class="btn" data-act="notif-ok">✅ عملتها</button>${d === "ios" || d === "android" ? `<button class="btn ghost" data-act="notif-later">بعدين</button>` : ""}</div>`);
}
function startupChecks(){
  if (!S || !S.user) return;
  heartbeat(true);
  try { const k = dkey(), t = timesFor(), now = new Date();
    if (isMuslim() && S.pray && S.pray.azkar !== false && now >= t.fajr && now < t.dhuhr && !(S.azkarDone||{})["m" + k] && localStorage.getItem("nw-azm") !== k){
      const tryAz = (n) => { if (!$("#layer").innerHTML){ try { localStorage.setItem("nw-azm", k); } catch(e){} azkarSheet("m"); } else if (n < 20) setTimeout(() => tryAz(n + 1), 3000); };
      setTimeout(() => tryAz(0), 1500); } } catch(e){}
  setTimeout(vacationCheck, 300);
  setTimeout(() => { let snooze = 0; try { snooze = +localStorage.getItem("nw-ntfy-snooze") || 0; } catch(e){}
    if (notifNeeded() && Date.now() > snooze && !$("#layer").innerHTML) notifSheet(); }, 2500);
  const t = new Date(), k = dkey(t), now = t.toTimeString().slice(0,5);
  if (!vacDue() && S.lastMorning !== k && now >= S.alarm.wake && t.getHours() < 14){ S.lastMorning = k; save(); setTimeout(morningSheet, 400); }
  else if (S.user.gender !== "m" && cycleOn() && S.lastCare !== k && !vacDue()){ S.lastCare = k; save(); setTimeout(() => message("🤍", pick(MS("period")), "دلع زيادة الأيام دي"), 500); }
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
  const incomes = (S.money.incomes || []).filter(e => e.date >= sk && e.date <= ek), added = incomes.reduce((a,e)=>a+e.amt,0);
  const total = S.money.allowance + added, left = total - spent;
  const daysLeft = Math.round((end - fromKey(tk))/864e5) + 1;
  const leftStartToday = left + todaySpent;
  const daily = Math.max(0, leftStartToday / Math.max(1,daysLeft));
  const ratio = total ? left / total : 0;
  const state = !total ? "ok" : left <= 0 ? "out" : ratio < 0.3 ? "near" : "ok";
  return {list, incomes, added, total, spent, left, daily, todaySpent, daysLeft, state, todayLeft: daily - todaySpent};
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
const stage = () => (S && S.stage) || "uni";
/* school: lessons instead of lectures; graduates: appointments and work instead of studying */
const STAGE_WORDS = {
  school:[["اسم المحاضرة أو السكشن","اسم الدرس"],["محاضرة تشريح","درس رياضيات"],["مدرج 3","(مش لازم)"],["المحاضرات 🎓","الدروس 📖"],["محاضرات","دروس"],["المحاضرة","الدرس"],["محاضرة","درس"]],
  grad:[["اسم المحاضرة أو السكشن","اسم الميعاد"],["محاضرة تشريح","اجتماع الشغل"],["مدرج 3","(مش لازم)"],["المحاضرات 🎓","مواعيدي الثابتة 📅"],["الجدول الثابت 🎓","مواعيدي الثابتة 📅"],["محاضرات","مواعيد"],["المحاضرة","الميعاد"],["محاضرة","ميعاد"]]
};
const stageTx = html => { const w = (typeof S !== "undefined" && S) ? STAGE_WORDS[stage()] : null; if (!w || isEN()) return html; return String(html).split(/(\uE000[\s\S]*?\uE001)/).map(x => x.startsWith("\uE000") ? x : w.reduce((o,[a,b]) => o.split(a).join(b), x)).join(""); };
const isMuslim = () => !(S && S.user && S.user.religion === "christian");
const cycleName = () => "البريود";
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
const CUR = () => (S && S.currency === "usd") ? "دولار" : "جنيه";
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
const hm = m => isEN() ? (m >= 60 ? Math.floor(m/60) + "h" + (m%60 ? " " + (m%60) + "m" : "") : m + "m") : (m >= 60 ? (Math.floor(m/60) + " س" + (m%60 ? " و" + (m%60) + " د" : "")) : (m + " د"));

/* ================= UI shell ================= */
let tapCount = 0, tapTimer = null;
function CLOUD_BOOT(){ return !!window.fb; }
const U = {stage:"uni", dmode:"me", booting:CLOUD_BOOT(), authMode:"signup", ag:"f", rel:"muslim", busy:false, admin:null, edit:"me"};
function welcomeScreen(){
  const boy = S.user.gender === "m", en = isEN(), name = escP(S.user.name);
  const title = en ? "Welcome, " + name : "أهلًا يا " + name;
  const body = en ? "Your new world is ready. Your money, studies, mood and diary, all in one place, made just for you."
    : boy ? "نورت دنيتك الجديدة. هنا فلوسك ومذاكرتك ويومك كله في مكان واحد، وكل حاجة معمولة علشانك."
          : "نورتي دنيتك الجديدة. هنا فلوسك ومذاكرتك ونفسيتك وحكاياتك في مكان واحد، وكل حاجة معمولة علشانك إنتي.";
  const sub = en ? "Take your time and explore." : boy ? "خد راحتك، واكتشفها على مهلك." : "خدي راحتك، واكتشفيها على مهلك.";
  $("#layer").innerHTML = `<div class="splash ${boy ? "boy" : "girl"}" role="dialog" aria-modal="true" aria-label="${title}"><div class="splash-in">
    <img src="icon-192.png" alt="" class="splash-logo"><div class="splash-brand">Nono's World</div>
    <h1 class="splash-title">${title}</h1>${ME && ME.special ? `<p class="splash-special">${escP(ME.special)}</p>` : ""}<p class="splash-sub">${body}</p><p class="splash-sub" style="opacity:.8">${sub}</p>
    <button class="splash-go" data-act="welcome-go">${en ? "Let's start" : "يلا نبدأ"}</button></div></div>`;
}
function splashView(){
  let g = "f", name = ""; try { g = localStorage.getItem("nw-g") || U.ag || "f"; name = localStorage.getItem("nw-name") || ""; } catch(e){}
  const en = isEN(), boy = g === "m";
  const title = en ? (boy ? (name ? "Welcome back, " + escP(name) : "Welcome, champ") : (name ? "Welcome back, " + escP(name) : "Welcome to your world"))
                   : (boy ? (name ? "أهلًا بيك يا " + escP(name) : "أهلًا بيك يا بطل") : (name ? "أهلًا بيكي يا " + escP(name) : "أهلًا بيكي في دنيتك"));
  let special = ""; try { special = localStorage.getItem("nw-special") || ""; } catch(e){}
  const sub = special ? escP(special) : en ? (boy ? "Your world is ready and waiting for you" : "Everything you love is waiting for you here")
                 : (boy ? "دنيتك جاهزة ومستنياك" : "كل حاجة بتحبيها مستنياكي هنا");
  return `<div class="splash ${boy ? "boy" : "girl"}" role="status" aria-live="polite">
    <div class="splash-ded">${en ? "Dedicated to my love" : "إهداء إلى حبيبتي"}</div>
    <div class="splash-in"><img src="icon-192.png" alt="" class="splash-logo">
    <div class="splash-brand">Nono's World</div>
    <h1 class="splash-title">${title}</h1><p class="splash-sub">${sub}</p>
    <div class="splash-dots" aria-hidden="true"><i></i><i></i><i></i></div></div></div>`;
}
function render(){
  applyTheme();
  document.documentElement.lang = LANG(); document.documentElement.dir = isEN() ? "ltr" : "rtl";
  const app = $("#app");
  if (CLOUD && (U.booting || (UID && !S))){ app.innerHTML = splashView(); $("#tabs")?.remove(); return; }
  if (!S || !S.user){ app.innerHTML = gx(authView(), authBoy()); $("#tabs")?.remove(); return; }
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
  const tabs = [["home","🏠","الرئيسية"],["money","💸","الفلوس"],["day","🗓️","يومنا"],stage()==="grad" ? ["study","💼","الشغل"] : ["study","📚","المذاكرة"],["diary","📔","حكاياتي"]];
  if (P && P.linked) tabs.push(["mate","💞", P.user && P.user.gender === "m" ? "شريكي" : "شريكتي"]);
  nav.innerHTML = gx(`<div class="in">${tabs.map(([k,e,t])=>`<button data-act="tab" data-v="${k}" ${S.tab===k?'aria-current="page"':""}><span class="e">${e}</span>${t}</button>`).join("")}</div>`);
  tickTimer();
}
function go(tab){ S.tab = tab; save(); render(); if (tab === "mate" && P && P.linked && CLOUD){ try { const k = "nw-rh-" + UID; if (!localStorage.getItem(k)){ localStorage.setItem(k, "1"); setTimeout(repliesHelp, 400); } } catch(e){} } if (tab==="diary") window.scrollTo({top:document.body.scrollHeight}); else window.scrollTo({top:0}); }
function toast(t){ const d = document.createElement("div"); d.className="toast"; d.textContent = isEN() ? trRaw(t, isMale()) : isMale() ? mascRaw(t) : String(t); document.body.appendChild(d); setTimeout(()=>d.remove(),1900); }
function sheet(html, onMount){
  const layer = $("#layer");
  layer.innerHTML = `<div class="scrim" data-act="close-scrim"><div class="sheet" role="dialog" aria-modal="true"><div class="grab"></div>${gx(html, isMale() && U.edit !== "mate" && U.edit !== "global")}</div></div>`;
  const first = layer.querySelector("input,textarea,select"); if (first && !matchMedia("(pointer:coarse)").matches) setTimeout(()=>first.focus(),60);
  onMount && onMount(layer.querySelector(".sheet"));
}
let sheetLocked = false;
function closeSheet(){ sheetLocked = false; $("#layer").innerHTML = ""; if (U.edit === "global") U.edit = "me"; }
function message(emoji, text, from){
  if (from === undefined) from = loveOn() ? (P && P.user && P.user.gender === "f" ? "منها 💌" : "منه 💌") : "";
  sheet(`<div class="popmsg"><div class="em">${emoji}</div><p>${esc(text)}</p>${from ? `<small>${escP(from)}</small>` : ""}</div>
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
  const love = S._love || (S._love = pick(loveOn() ? lovePool() : cheerPool()));
  return `
  ${ME && ME.special ? `<div class="card special"><div class="lbl">${isEN() ? "Just for you" : "ليكي مخصوص"}</div><p>${esc(ME.special)}</p></div>` : ""}
  <section class="hello">
    <h1>${greet} يا ${esc(S.user.name)} ${hour<18?"☀️":"🌙"}</h1>
    <p>${prettyDate(t)}</p>
  </section>

  ${S.user.gender !== "m" && cycleOn() ? `<div class="card tint"><div class="row between"><h3>🤍 دلع زيادة الأيام دي</h3><button class="x" data-act="new-pmsg" aria-label="رسالة تانية">🔄</button></div>
    <p style="margin:6px 0 4px;font-weight:700;font-size:17px">${esc(S._pmsg || (S._pmsg = pick(MS("period"))))}</p>
    <p class="muted small" style="margin:0">💡 ${CARE_TIPS[new Date().getDate() % CARE_TIPS.length]}</p></div>` : ""}
  ${notifNeeded() ? `<button class="card tint" data-act="notif" style="text-align:right;border:0;width:100%"><div class="row between"><h3>🔔 فعّلي الإشعارات</h3><span class="pill">دقيقة</span></div><div class="muted small" style="margin-top:4px">علشان الرسايل توصلك حتى لو التطبيق مقفول</div></button>` : ""}
  <div class="letter"><div class="row between"><span class="lbl">${loveOn() ? L.love : "💪 كلمة حلوة"}</span><span class="row" style="gap:4px"><button class="x" data-act="new-love" aria-label="رسالة تانية">🔄</button>${hasMate() ? `<span class="love-sw-l" aria-hidden="true">💌</span><button class="switch sm" data-act="love-toggle" role="switch" aria-checked="${loveOn()}" title="${loveOn() ? "اقفلي رسايل الحب" : "رجّعي رسايل الحب"}" aria-label="رسايل الحب"><i></i></button>` : ""}</span></div><p>${esc(love)}</p></div>

  <div class="card">
    <div class="row between"><h2>${L.mood} النهارده</h2>${mood?`<span class="pill">${MOODS.find(m=>m.k===mood).e} ${MOODS.find(m=>m.k===mood).t}</span>`:""}</div>
    <div class="moods" style="margin-top:10px">${MOODS.map(m=>`<button data-act="mood" data-v="${m.k}" aria-pressed="${mood===m.k}" aria-label="${m.t}">${m.e}<span>${m.t}</span></button>`).join("")}</div>
  </div>

  <div class="grid2">
    <button class="card" data-act="tab" data-v="money" style="text-align:right;border:0">
      <div class="row between"><h3>${L.money}</h3><span class="pill ${mi.state==="ok"?"good":mi.state==="near"?"warn":"bad"}">${L.left[mi.state]}</span></div>
      <div class="big num" style="margin-top:8px">${fmt(Math.max(0,mi.left))} <small>${CUR()} فاضلين</small></div>
      <div class="muted small" style="margin-top:4px">${L.daily}: تقدري تصرفي النهارده <b class="num">${fmt(Math.max(0,mi.todayLeft))}</b> ${CUR()}</div>
    </button>

    <button class="card" data-act="tab" data-v="day" style="text-align:right;border:0">
      <div class="row between"><h3>${L.day}</h3><span class="pill">${doneN}/${today.length} ✅</span></div>
      <div style="margin-top:8px">${next?`<div class="t"><b>${esc(next.title)}</b></div><div class="muted small num">${tf(next.start)} – ${tf(next.end)}${next.place?" · "+esc(next.place):""}</div>`:`<div class="muted">مفيش محاضرات تانية النهارده 🎈</div>`}</div>
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
      <div class="row between wrap" style="margin-top:10px"><span class="sectionlbl" style="margin:0">${S.user.gender === "m" ? "💪" : "💅"} اهتميتي بنفسك النهارده</span><span class="muted small num">${care.stars||0} من 5</span></div>
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
    ${isMuslim() ? `<div class="item" style="margin-top:12px"><span class="ic">🌙</span><div class="grow"><div class="t">تذكير بصيام الاثنين والخميس</div><div class="s">${(S.pray||{}).fast ? "هنفكّرك بالليل قبلها الساعة 9" : "مقفول، افتحيه لو حابة"}</div></div><button class="switch" data-act="pray-opt" data-v="fast" role="switch" aria-checked="${!!(S.pray||{}).fast}" aria-label="تذكير بصيام الاثنين والخميس"><i></i></button></div>` : ""}
  </div>

  <button class="btn ghost block" data-act="week-summary">${L.week} · ملخص الأسبوع</button>
  ${togetherStrip()}
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
    <div class="big num" style="margin-top:10px">${fmt(mi.left)} <small>${CUR()} فاضلين</small></div>
    <div class="bar" style="margin:12px 0 6px"><i style="width:${pct}%"></i></div>
    <div class="row between small muted"><span>صرفتي <b class="num">${fmt(mi.spent)}</b></span><span>من <b class="num">${fmt(mi.total)}</b>${mi.added ? ` <span class="income-tag">(+<span class="num">${fmt(mi.added)}</span> جالك)</span>` : ""}</span></div>
  </div>
  <div class="card">
    <div class="row between"><h3>${L.daily}</h3><span class="muted small">علشان الفلوس تكفّي لآخر ${S.money.period==="week"?"الأسبوع":"الشهر"}</span></div>
    <div class="row between" style="margin-top:6px">
      <div><div class="big num" style="font-size:30px">${fmt(Math.max(0,mi.todayLeft))}</div><div class="muted small">تقدري تصرفيهم النهارده</div></div>
      <div style="text-align:left"><div class="num" style="font-weight:700">${fmt(mi.todaySpent)} / ${fmt(mi.daily)}</div><div class="muted small">صرفتي النهارده</div></div>
    </div>
    ${mi.todaySpent > mi.daily && mi.daily>0 ? `<div class="notice" style="margin-top:10px">صرفتي النهارده أكتر من المسموح بـ <b class="num">${fmt(mi.todaySpent-mi.daily)}</b> ${CUR()}، بكرة نهدّي شوية 🙈</div>`:""}
  </div>
  <div class="two"><button class="btn" data-act="add-exp">＋ صرفت حاجة</button><button class="btn ghost" data-act="add-inc">💰 جالي فلوس</button></div>
  ${mi.incomes.length ? `<div class="card"><h3>💰 فلوس جاتلك</h3><ul class="list" style="margin-top:10px">${mi.incomes.slice().sort((a,b)=>a.date<b.date?1:-1).map(e=>`<li class="item income"><span class="ic">💰</span><div class="grow"><div class="t">${esc(e.note || "فلوس زيادة")}</div><div class="s">${e.date===dkey()?"النهارده":prettyDate(fromKey(e.date))}</div></div><b class="num">+${fmt(e.amt)}</b><button class="x" data-act="del-inc" data-v="${e.id}" aria-label="امسحي">✕</button></li>`).join("")}</ul></div>` : ""}
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
    <ul class="list" style="margin-top:10px">${onVacation(dk)?`<li class="empty">إجازة، مفيش محاضرات 🏖️</li>`:lectures.length?lectures.map(l=>`<li class="item"><span class="ic">🎓</span><div class="grow"><div class="t">${esc(l.title)}</div><div class="s num">${tf(l.start)} – ${tf(l.end)}${l.place?" · "+esc(l.place):""}</div></div></li>`).join(""):`<li class="empty">مفيش محاضرات ${S._dayOff===1?"بكرة":S._dayOff===-1?"امبارح":"النهارده"} 🎈</li>`}</ul>
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

function workView(){
  const now = Date.now(), list = (S.work||[]).slice().sort((a,b)=>(a.done-b.done) || ((a.due||"9")<(b.due||"9")?-1:1));
  const left = (S.work||[]).filter(w=>!w.done).length, late = (S.work||[]).filter(w=>!w.done && w.due && new Date(w.due).getTime() < now).length;
  const when = d => { if (!d) return "من غير ميعاد"; const t = new Date(d), days = Math.round((fromKey(dkey(t)) - fromKey(dkey()))/864e5);
    return (days===0?"النهارده":days===1?"بكرة":days===-1?"امبارح":days>1?`بعد ${days} أيام`:`من ${-days} أيام`) + " · " + tf(t); };
  return `<section class="hello"><h1>الشغل 💼</h1><p>${left ? `وراكي <b class="num">${left}</b> ${left===1?"حاجة":"حاجات"}` : "مفيش حاجة وراكي 🎉"}${late ? ` · <span style="color:var(--bad)">${late} ${late===1?"عدّى ميعادها":"عدّى ميعادهم"}</span>` : ""}</p></section>
  <div class="card"><div class="row between"><h3>اللي ورايا</h3><button class="btn small" data-act="add-work">＋ ضيفي شغل</button></div>
    <ul class="list" style="margin-top:10px">${list.length ? list.map(w => { const over = !w.done && w.due && new Date(w.due).getTime() < now;
      return `<li class="item ${w.done?"done":""}"><button class="check ${w.done?"on":""}" data-act="work-done" data-v="${esc(w.id)}" aria-label="${w.done?"لسه":"خلص"}">${w.done?"✅":"⬜"}</button><div class="grow"><div class="t">${esc(w.title)}</div><div class="s num" ${over?'style="color:var(--bad)"':""}>${w.done?"خلص ✅":(over?"⚠️ ":"⏰ ")+when(w.due)}</div></div><button class="x" data-act="work-del" data-v="${esc(w.id)}" aria-label="امسحي">✕</button></li>`; }).join("") : `<li class="empty">ضيفي الشغل اللي وراكي وميعاده، وعلّمي عليه لما يخلص ✅</li>`}</ul></div>
  ${list.some(w=>w.done) ? `<button class="btn ghost small" data-act="work-clear">امسحي اللي خلص</button>` : ""}`;
}
function workSheet(){
  const d = new Date(Date.now() + 864e5); d.setMinutes(0, 0, 0);
  const local = new Date(d.getTime() - d.getTimezoneOffset()*6e4).toISOString().slice(0,16);
  sheet(`<h2>💼 شغل جديد</h2><form class="form" data-form="work">
    <label class="f">إيه الشغل؟<input class="in" id="w-title" required maxlength="80" placeholder="أسلّم التقرير"></label>
    <label class="f">ميعاده<input class="in num" type="datetime-local" id="w-due" value="${local}"></label>
    <button class="btn" type="submit">ضيفي</button></form>`);
}
function studyView(){
  if (stage() === "grad") return workView();
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

function diarySwitch(){
  return `<div class="seg" style="margin-top:4px"><button data-act="dmode" data-v="me" aria-pressed="${U.dmode === "me"}">حكاياتي</button>${P && P.linked ? `<button data-act="dmode" data-v="us" aria-pressed="${U.dmode === "us"}">إحنا 💞</button>` : ""}<button data-act="dmode" data-v="friends" aria-pressed="${U.dmode === "friends"}">الصحاب 👯</button></div>`;
}
function friendChatView(f){
  const oid = friendOf(f), on = esc((f.names||{})[oid] || "");
  let last = "", out = "";
  FR.msgs.slice().sort((a,b)=>a.ts-b.ts).forEach(m => {
    const d = new Date(m.ts), dk = dkey(d), tm = tf(d);
    if (dk !== last){ last = dk; out += `<div class="daysep">${dk===dkey()?"النهارده":prettyDate(d)}</div>`; }
    out += m.from === UID ? `<div class="msg me"><div class="bub">${esc(m.text)}<span class="tm num">${tm}</span></div></div>`
      : `<div class="msg him"><div class="bub">${esc(m.text)}<span class="tm num">${tm}</span></div><button class="x small" data-act="fr-report" data-v="${esc(m.id)}" aria-label="بلّغي" title="بلّغي">🚩</button></div>`;
  });
  const today = todayLog(FR.acts[oid]);
  return `<div class="row between"><button class="btn ghost small" data-act="fr-back">رجوع</button><button class="btn ghost small" data-act="fr-remove" data-v="${esc(f.id)}">شيلي من صحابي</button></div>
    <section class="hello"><h1>👭 ${on}</h1><p>${presTag(FR.acts[oid])}</p><p>${today.length ? "النهارده: " + today.map(x => esc(x.e + " " + x.t)).join(" · ") : "لسه مفيش حاجة النهارده"}</p></section>
    <div class="chat" id="chat">${out || `<div class="empty">قولي أهلًا 👋</div>`}</div>
    <form class="composer" data-form="frmsg"><textarea class="in" id="ftext" rows="1" placeholder="اكتبي لـ ${on}…" aria-label="اكتبي رسالة"></textarea><button class="send" type="submit" aria-label="ابعتي">➤</button></form>`;
}
function openFriend(fid){
  if (FR.unsub){ try { FR.unsub(); } catch(e){} FR.unsub = null; }
  FR.open = fid; FR.msgs = [];
  if (fid) FR.unsub = fb.listenCol(`friends/${fid}/msgs`, list => {
    const known = new Set(FR.msgs.map(m => m.id)), had = FR.msgs.length;
    if (had) list.filter(m => m.from !== UID && !known.has(m.id)).forEach(m => { if (document.visibilityState !== "visible") notice(`👭 ${m.name || ""}`, m.text || ""); });
    FR.msgs = list; if (S.tab === "diary" && U.dmode === "friends" && FR.open === fid){ keepTyping(render); scrollChat(); } }, () => {}, 300);
  render(); if (fid) scrollChat(); else window.scrollTo({top:0});
}
function actCard(){
  const mine = FR.mine || {items:[], log:[]}, items = mine.items || [], today = todayLog(mine);
  return `<div class="card"><h3>✨ عملتي إيه النهارده؟</h3>
    <p class="muted small" style="margin:4px 0 10px">دوسي على اللي عملتيه، وصحابك هيشوفوه. اللي مش بتدوسي عليه محدش بيشوفه.</p>
    <div class="acts">${items.map(x => `<button class="actb ${today.some(l=>l.id.startsWith(x.id+":"))?"on":""}" data-act="act-do" data-v="${esc(x.id)}">${esc(x.e)} ${esc(x.t)}</button>`).join("")}<button class="actb add" data-act="act-add">＋ ضيفي</button></div>
    ${today.length ? `<div class="muted small" style="margin-top:10px">ظاهر لصحابك النهارده:</div><div class="acts" style="margin-top:6px">${today.map(l => `<span class="actb on">${esc(l.e)} ${esc(l.t)} <span class="num muted">${tf(new Date(l.ts))}</span><button class="x" data-act="act-undo" data-v="${esc(l.id)}" aria-label="شيليها">✕</button></span>`).join("")}</div>` : ""}
    ${items.length ? `<button class="btn ghost small" style="margin-top:10px" data-act="act-edit">✏️ عدّلي الحاجات</button>` : ""}
  </div>`;
}
function friendsListCard(){
  const inc = FR.list.filter(f => f.status === "pending" && f.from !== UID), out = FR.list.filter(f => f.status === "pending" && f.from === UID), ok = FR.list.filter(f => f.status === "ok");
  return `<div class="card"><div class="row between"><h3>👭 صحابي</h3><button class="btn small" data-act="fr-add">＋ ضيفي حد</button></div>
    <ul class="list" style="margin-top:10px">
    ${inc.map(f => `<li class="item"><span class="ic">💌</span><div class="grow"><div class="t">${esc((f.names||{})[f.from] || "")}</div><div class="s">طلب صداقة 💌</div></div><button class="mini" data-act="fr-accept" data-v="${esc(f.id)}">موافقة</button><button class="x" data-act="fr-remove" data-v="${esc(f.id)}" aria-label="رفض">✕</button></li>`).join("")}
    ${ok.map(f => { const oid = friendOf(f), t = todayLog(FR.acts[oid]); return `<li><button class="item" style="width:100%;border:0;text-align:start" data-act="fr-open" data-v="${esc(f.id)}"><span class="ic">👭</span><div class="grow"><div class="t">${presence(FR.acts[oid]||{}).c === "on" ? `<span class="pres on"></span>` : ""}${esc((f.names||{})[oid] || "")}</div><div class="s">${t.length ? t.slice(-4).map(x => esc(x.e + " " + x.t)).join(" · ") : "لسه مفيش حاجة النهارده"}</div></div><span aria-hidden="true">💬</span></button></li>`; }).join("")}
    ${out.map(f => `<li class="item"><span class="ic">⏳</span><div class="grow"><div class="t">مستنيين موافقة</div><div class="s">${esc(Object.values(f.names||{})[0] || "")}</div></div><button class="x" data-act="fr-remove" data-v="${esc(f.id)}" aria-label="إلغاء">✕</button></li>`).join("")}
    ${!FR.list.length ? `<li class="empty">ضيفي صحابك بالكود، وتشوفوا بتعملوا إيه وتتكلموا 💬</li>` : ""}
    </ul></div>`;
}
function friendsView(){
  const f = FR.open && FR.list.find(x => x.id === FR.open && x.status === "ok");
  if (f) return friendChatView(f);
  const g = GR.open && GR.list.find(x => x.id === GR.open);
  if (!g) return `${diarySwitch()}
    <section class="hello"><h1>الصحاب 👯</h1><p>صحابك يشوفوا بس اللي إنتي تختاريه، ومش بيشوفوا دفترك ولا أي حاجة تانية</p></section>
    ${actCard()}
    ${friendsListCard()}
    <h3 style="margin:18px 0 8px">👯 الجروبات</h3>
    <div class="row wrap"><button class="btn small" data-act="g-new">＋ جروب جديد</button><button class="btn ghost small" data-act="g-join">ادخلي جروب بكود</button></div>
    <ul class="list">${GR.list.length ? GR.list.slice().sort((a,b)=>(b.last||b.at||0)-(a.last||a.at||0)).map(x => `<li><button class="item" style="width:100%;border:0;text-align:start" data-act="g-open" data-v="${esc(x.id)}"><span class="ic">👯</span><div class="grow"><div class="t">${esc(x.name)}</div><div class="s"><span class="num">${(x.members||[]).length}</span> أعضاء${x.lastText ? " · " + esc(String(x.lastText).slice(0,40)) : ""}</div></div></button></li>`).join("") : `<li class="empty">لسه مفيش جروبات، اعملي واحد وابعتي الكود لصحابك</li>`}</ul>`;
  let last = "", out = "";
  GR.msgs.slice().sort((a,b)=>a.ts-b.ts).forEach(m => {
    const d = new Date(m.ts), dk = dkey(d), tm = tf(d), mine = m.from === UID;
    if (dk !== last){ last = dk; out += `<div class="daysep">${dk===dkey()?"النهارده":prettyDate(d)}</div>`; }
    out += mine ? `<div class="msg me"><div class="bub">${esc(m.text)}<span class="tm num">${tm}</span></div></div>`
      : `<div class="msg him"><div class="bub"><small class="from">${esc(m.name || "")}</small>${esc(m.text)}<span class="tm num">${tm}</span></div><button class="x small" data-act="g-report" data-v="${esc(m.id)}" aria-label="بلّغي" title="بلّغي">🚩</button></div>`;
  });
  const names = Object.values(g.names || {}).map(esc).join("، ");
  return `<div class="row between"><button class="btn ghost small" data-act="g-back">رجوع</button><button class="btn ghost small" data-act="g-info">الكود والأعضاء</button></div>
    <section class="hello"><h1>${esc(g.name)}</h1><p>${names}</p></section>
    <div class="chat" id="chat">${out || `<div class="empty">قولوا أهلًا لبعض 👋</div>`}</div>
    <form class="composer" data-form="gmsg"><textarea class="in" id="gtext" rows="1" placeholder="اكتبي للجروب…" aria-label="اكتبي للجروب"></textarea><button class="send" type="submit" aria-label="ابعتي">➤</button></form>`;
}
function coupleView(){
  let last = "", out = "";
  CP.msgs.slice().sort((a,b)=>a.ts-b.ts).forEach(m => {
    const d = new Date(m.ts), dk = dkey(d), tm = tf(d);
    if (dk !== last){ last = dk; out += `<div class="daysep">${dk===dkey()?"النهارده":prettyDate(d)}</div>`; }
    out += m.from === UID ? `<div class="msg me"><div class="bub">${esc(m.text)}<span class="tm num">${tm}</span></div></div>`
      : `<div class="msg him"><div class="bub">${esc(m.text)}<span class="tm num">${tm}</span></div></div>`;
  });
  const pn = esc(P.user ? P.user.name : "");
  return `${diarySwitch()}
    <section class="hello"><h1>${esc(S.user.name)} 💞 ${pn}</h1><p>${presTag(P.user)}</p><p>شاتكم إنتوا الاتنين بس، بعيد عن دفتر حكاياتي</p></section>
    <div class="chat" id="chat">${out || `<div class="empty">ابدئي إنتي وقولي ${P.user && P.user.gender==="f" ? "لها" : "له"} حاجة حلوة 💌</div>`}</div>
    <form class="composer" data-form="cmsg"><textarea class="in" id="ctext" rows="1" placeholder="اكتبي لـ ${pn}…" aria-label="اكتبي رسالة"></textarea><button class="send" type="submit" aria-label="ابعتي">➤</button></form>`;
}
function actSaveItems(items){ const mine = FR.mine || {items:[], log:[]}; FR.mine = Object.assign({}, mine, {items}); render(); fb.set(`act/${UID}`, {items, log:mine.log||[], name:ME.name, seen:Date.now()}, false).catch(()=>toast("مقدرتش أحفظ")); }
function keepTyping(fn){ const a = document.activeElement, id = a && a.id, val = id && a.value; fn(); if (id){ const el = document.getElementById(id); if (el){ el.value = val; el.focus(); } } }
function openGroup(gid){
  if (GR.unsub){ try{GR.unsub();}catch(e){} GR.unsub = null; }
  GR.open = gid; GR.msgs = [];
  if (gid) GR.unsub = fb.listenCol(`groups/${gid}/msgs`, list => { GR.msgs = list; if (S.tab === "diary" && U.dmode === "friends" && GR.open === gid){ keepTyping(render); scrollChat(); } }, () => {}, 300);
  render(); if (gid) scrollChat(); else window.scrollTo({top:0});
}
function feedbackSheet(){
  U.fb = U.fb || {stars:5, kind:"review"};
  const f = U.fb;
  sheet(`<h2>قيّمي التطبيق ⭐</h2>
  <p class="muted small center" style="margin:-4px 0 6px">${f.kind==="review" ? "اختاري عدد النجوم، والكلام اختياري" : ""}</p>
  ${f.kind==="review" ? `<div class="stars big-stars" style="justify-content:center;margin-bottom:10px">${[1,2,3,4,5].map(i=>`<button data-act="fb-star" data-v="${i}" class="${i<=f.stars?"f":""}" aria-label="${i}">⭐</button>`).join("")}</div>` : ""}
  <div class="seg" style="margin-bottom:10px"><button data-act="fb-kind" data-v="review" aria-pressed="${f.kind==="review"}">رأيي</button><button data-act="fb-kind" data-v="idea" aria-pressed="${f.kind==="idea"}">اقتراح</button><button data-act="fb-kind" data-v="complaint" aria-pressed="${f.kind==="complaint"}">شكوى</button></div>
  <form class="form" data-form="feedback">
    <textarea class="in" id="fb-text" maxlength="300" placeholder="${f.kind==="complaint"?"إيه اللي مضايقك؟":f.kind==="idea"?"نفسك نزوّد إيه؟":"اكتبي رأيك لو حابة (مش لازم)"}" ${f.kind==="review" ? "" : "required"}></textarea>
    ${f.kind==="review" ? `<label class="item" style="cursor:pointer"><input type="checkbox" id="fb-public" checked style="width:20px;height:20px;accent-color:var(--accent)"><div class="grow"><div class="t">اعرضي رأيي على موقع التطبيق</div><div class="s">باسمك الأول بس</div></div></label>` : `<p class="muted small" style="margin:0">ده بيوصل لصاحب التطبيق بس.</p>`}
    <button class="btn" type="submit" id="fb-btn">ابعتي</button>
  </form>`);
}
function togetherStrip(){
  if (!(P && P.linked && P.user)) return "";
  return `<div class="together"><div class="names">${esc(S.user.name)} <span aria-hidden="true">💞</span> ${esc(P.user.name)}</div><div class="always">مع بعض دايمًا</div></div>`;
}
function diaryView(){
  const list = S.diary.filter(e=>e.chat===S.chatId).sort((a,b)=>a.ts-b.ts);
  let last = "", out = "";
  list.forEach(e => {
    const d = new Date(e.ts), dk = dkey(d), tm = tf(d);
    if (dk !== last){ last = dk; out += `<div class="daysep">${dk===dkey()?"النهارده":prettyDate(d)}</div>`; }
    if (e.from === "him"){ out += `<div class="msg him"><div class="bub real"><small class="from">💌 ${P&&P.user&&P.user.gender==="f"?"منها":"منه"} بجد</small>${esc(e.text)}<span class="tm num">${tm}</span></div>${CLOUD?`<button class="x small" data-act="report" data-v="${esc(e.id)}" aria-label="بلّغي" title="بلّغي">🚩</button>`:""}</div>`; return; }
    out += `<div class="msg me"><div class="bub">${esc(e.text)}<span class="tm num">${tm}</span></div></div>`;
    out += e.reply
      ? `<div class="msg him"><div class="bub">${esc(e.reply)}<span class="tm num">${tm}</span></div></div>`
      : `<div class="msg him"><div class="bub typing" aria-label="بيكتب"><i></i><i></i><i></i></div></div>`;
  });
  if (CLOUD && U.dmode === "friends") return friendsView();
  if (CLOUD && U.dmode === "us" && P && P.linked) return coupleView();
  const priv = CLOUD && P && P.linked && P.user ? `<button class="chip-priv" data-act="share" data-v="diary" aria-pressed="${S.share.diary === false}">${S.share.diary === false ? `🔒 مخفي عن ${esc(P.user.name)}` : `👁️ ${esc(P.user.name)} ${P.user.gender === "f" ? "تقدر تشوفه" : "يقدر يشوفه"}`}</button>` : "";
  return `
  ${CLOUD ? diarySwitch() : ""}
  <section class="hello"><h1>${L.diary}</h1><p>احكي يا ${esc(S.user.name)}، ${P&&P.linked&&P.user ? (S.share.diary === false ? "الدفتر ده ليكي إنتي بس 🔒" : esc(P.user.name)+" "+(P.user.gender==="f"?"سامعاك":"سامعك")+" 🤍") : (CLOUD ? "الدفتر ده بتاعك 🤍" : "هو سامعك 🤍")}</p>${priv}</section>
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
  const send = o.canReply ? `data-act="p-send"` : "hidden";
  return keep(`
  ${o.banner||""}
  <section class="hello"><h1>${o.title}</h1><p>${o.sub ? o.sub + " · " : ""}${prettyDate(new Date())}</p></section>
  ${o.admin ? adminExtra() : ""}
  ${sh("care") && o.gender !== "m" && cycleOn() ? `<div class="card tint"><h3>🤍 ${name} محتاجة اهتمام ودلع زيادة الأيام دي</h3><p class="small" style="margin:4px 0 10px">اهتم بيها أكتر، ابعتلها كلمة حلوة أو جيبلها حاجة بتحبها.</p><button class="btn small" ${send}>💌 ابعتلها</button></div>` : ""}
  ${upset?`<div class="card alert"><h3>🚨 ${name} ${fem?"مضايقة":"مضايق"}</h3><p class="small" style="margin:4px 0 10px">${m&&(mood==="sad"||mood==="stressed")?`${fem?"اختارت":"اختار"} ${m.e} ${m.t} النهارده`:(fem?"كتبت":"كتب")+" حكاية زعلانة"}، ${fem?"كلّمها":"كلّمه"} 🤍</p><button class="btn small" ${send}>💌 ابعت كلمة</button></div>`:""}
  <div class="grid2">
    ${sh("mood")?`<div class="card"><h3>النفسيه</h3><div class="big" style="margin-top:6px">${m?m.e+` <small>${m.t}</small>`:`<small>لسه ${fem?"مختارتش":"مختارش"}</small>`}</div></div>`:lock("النفسيه")}
    ${sh("care")?`<div class="card"><h3>${L.care}</h3><div class="stats" style="margin-top:8px"><div class="stat"><b class="num">${care.water||0}</b><span>💧 كوباية</span></div><div class="stat"><b class="num">${care.stars||0}/5</b><span>⭐ اهتمام</span></div><div class="stat"><b class="num">${care.sleep||0}</b><span>😴 ساعات</span></div></div>${(o.gender !== "m" && cycleOn()) || !isMuslim() ? "" : `<div class="muted small" style="margin-top:8px">الصلاة: <b class="num">${PRAYERS.filter(([p])=>(S.prayers[k]||{})[p]).length}</b> من 5</div>`}</div>`:lock(L.care)}
  </div>
  ${sh("diary")?`<div class="card"><div class="row between"><h3>${L.diary}</h3><button class="btn small" ${send}>ردّ بنفسك 💌</button></div>
    <div class="chat" style="padding-bottom:0;margin-top:10px">${chat.length?chat.map(e=>{const tm=tf(new Date(e.ts)); const flag = o.admin && e.flagged ? " 🚩" : "";
      const del = o.admin ? `<button class="x" data-act="adm-delmsg" data-v="${esc(e.id)}" aria-label="امسح">🗑️</button>` : "";
      return e.from==="him"?`<div class="msg him"><div class="bub real"><small class="from">💌 ${o.admin?"الشريك":"إنت"}${flag}</small>${esc(e.text)}<span class="tm num">${tm}</span></div>${del}</div>`:`<div class="msg me">${del}<div class="bub">${esc(e.text)}${flag}<span class="tm num">${tm}</span></div></div>${e.reply?`<div class="msg him"><div class="bub"><small class="from">🤖 رد أوتوماتيك</small>${esc(e.reply)}</div></div>`:""}`}).join(""):`<div class="empty">مفيش رسايل في الشات ده لسه</div>`}</div></div>`:lock(L.diary)}
  ${sh("study")?`<div class="card"><div class="row between"><h3>${examLabel()}</h3><span class="pill">${L.streak} ${streak()}</span></div>
    <div class="muted small" style="margin-top:4px">${fem ? "ذاكرت" : "ذاكر"} النهارده ${hm(minsOn(k))} · ${studyDays(7)} من 7 أيام${ex?` · ${esc(ex.type)} ${esc(ex.subject)} بعد ${Math.round((fromKey(ex.date)-fromKey(k))/864e5)} يوم`:""}</div>
    <ul class="list" style="margin-top:10px">${grades.map(g=>{const p=g.score/g.total*100;return `<li class="item"><div class="grow t">${esc(g.type)} ${esc(g.subject)}</div><span class="pill ${p>=75?"good":p>=50?"warn":"bad"} num">${g.score} من ${g.total}</span></li>`}).join("")}</ul></div>`:lock(L.study)}
  <div class="grid2">
    ${sh("day")?`<div class="card"><h3>${L.day}</h3><ul class="list" style="margin-top:8px">${tasks.length?tasks.map(x=>`<li class="item ${x.status||""}"><div class="grow t">${esc(x.title)}</div><span class="small">${x.status==="done"?"✅":x.status==="lazy"?"🙈":"⏳"}</span></li>`).join(""):`<li class="empty">مفيش مهمات النهارده</li>`}</ul></div>`:lock(L.day)}
    ${sh("money")?`<div class="card"><div class="row between"><h3>الفلوس</h3><span class="pill ${mi.state==="ok"?"good":mi.state==="near"?"warn":"bad"}">${L.left[mi.state]}</span></div><div class="big num" style="margin-top:8px">${fmt(mi.left)} <small>${CUR()} فاضلين</small></div></div>`:lock("الفلوس")}
  </div>
  ${o.footer||""}`, o.gender);
}
function adminExtra(){
  const days = Array.from({length:7}, (_,i) => dkey(addDays(new Date(), -i)));
  const short = k => SHORT[fromKey(k).getDay()] + " " + fromKey(k).getDate();
  const rows = days.map(k => { const pr = S.prayers[k] || {}, c = S.care[k] || {}, m = MOODS.find(x=>x.k===S.moods[k]);
    return `<tr><td>${short(k)}</td>${isMuslim() ? `<td class="num">${PRAYERS.filter(([p])=>pr[p]).length}/5</td>` : ""}<td>${m ? m.e : "·"}</td><td class="num">${c.water||0}💧</td><td class="num">${c.sleep||0}س</td><td class="num">${c.stars||0}⭐</td>${S.user.gender !== "m" ? `<td>${cycleOn(k) ? "🤍" : ""}</td>` : ""}</tr>`; }).join("");
  const cyc = S.cycle || {}, hist = (cyc.history||[]).slice(-6).reverse();
  return `<div class="card"><h3>👑 كل حاجة (آخر 7 أيام)</h3>
    <div style="overflow-x:auto;margin-top:8px"><table class="admtbl"><tr><th>اليوم</th>${isMuslim() ? "<th>الصلاة</th>" : ""}<th>المود</th><th>مية</th><th>نوم</th><th>اهتمام</th>${S.user.gender !== "m" ? "<th>بريود</th>" : ""}</tr>${rows}</table></div>
    ${isMuslim() ? `<div class="muted small" style="margin-top:8px">🕌 صلوات النهارده: ${PRAYERS.map(([p,t]) => `${(S.prayers[dkey()]||{})[p] ? "✅" : "⬜"} ${t}`).join(" · ")}</div>` : `<div class="muted small" style="margin-top:8px">مسيحية، الصلاة مش ظاهرة عندها</div>`}
    ${S.user.gender !== "m" ? `<div class="muted small" style="margin-top:6px">🤍 البريود: ${cycleOn() ? `شغال من ${esc(cyc.start||"")} (${cyc.days||7} أيام)` : "مش شغال دلوقتي"}${hist.length ? " · اللي فات: " + hist.map(h => `${esc(h.start)} (${h.days}ي)`).join("، ") : ""}</div>` : ""}
    <div class="muted small" style="margin-top:6px">⚙️ كلام الحب: ${S.loveOff ? "مقفول" : "شغال"} · ${stage()==="grad" ? "متخرّج" : stage()==="school" ? "مدرسة" : "جامعة"} · العملة: ${S.currency==="usd" ? "دولار" : "جنيه"} · الثيم: ${esc(S.theme||"")}</div>
    ${(S.work||[]).length ? `<div class="muted small" style="margin-top:6px">💼 الشغل: ${(S.work||[]).map(w => `${w.done?"✅":"⬜"} ${esc(w.title)}`).join(" · ")}</div>` : ""}
  </div>`;
}
function prayersBlock(k){
  if (!isMuslim()) return "";
  const pr = S.prayers[k] || {}, n = PRAYERS.filter(([p])=>pr[p]).length;
  if (S.user.gender !== "m" && cycleOn(k)) return `<div class="row between" style="margin-top:12px"><span class="sectionlbl" style="margin:0">الصلاة</span><span class="muted small">معذورة الأيام دي، ربنا يتقبل منك</span></div>
    <div class="notice" style="margin-top:8px;line-height:1.9">🤍 ${sabrAt(fromKey(k).getDate() + new Date().getHours())}</div>`;
  const tt = timesFor(fromKey(k)), nx = k === dkey() ? nextPrayer() : null, fri = new Date().getDay() === 5 && k === dkey();
  return `<div class="row between" style="margin-top:12px"><span class="sectionlbl" style="margin:0">الصلاة</span><span class="muted small num">${n} من 5</span></div>
    ${nx ? `<div class="muted small" style="margin:2px 4px 6px">🕌 الجاية: <b>${nx.n}</b> الساعة <b class="num">${hhmm(nx.at)}</b> · بعد ${inMins(nx.at - Date.now())} <span style="opacity:.7">(${esc(myLoc().name)})</span></div>` : ""}
    <div class="prayers">${PRAYERS.map(([p,t])=>`<button data-act="pray" data-v="${p}" aria-pressed="${!!pr[p]}">${t}<small class="num ptime">${hhmm(tt[p])}</small></button>`).join("")}</div>
    ${k === dkey() ? `<div class="row wrap" style="gap:8px;margin-top:8px"><button class="btn ghost small" data-act="azkar" data-v="${azkarNow()}">📿 ${azkarNow() === "m" ? "أذكار الصباح" : "أذكار المساء"}</button>${fri ? `<a class="btn ghost small" style="text-decoration:none" href="https://quran.com/ar/18" target="_blank" rel="noopener">📖 سورة الكهف</a>` : ""}</div>` : ""}`;
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
  return withState(P, () => dashboard({name:P.user.name, gender:P.user.gender, title:`${P.user.gender==="m"?"شريكي":"شريكتي"} 💞 ${esc(P.user.name)}`, sub:presTag(P.user), canReply:true,
    footer:`<button class="btn ghost block" data-act="p-msgs">✏️ رسايلي ${P.user.gender==="m"?"ليه":"ليها"} وردود "لو ${P.user.gender==="m"?"قال":"قالت"}…"</button><button class="btn ghost block small" style="margin-top:8px" data-act="replies-help">📖 إزاي أعدّل الردود؟</button>`}));
}
function repliesHelp(){
  const me = isMale(), pm = !!(P && P.user && P.user.gender === "m"), pn = P && P.user ? esc(P.user.name) : (pm ? "شريكك" : "شريكتك");
  const w = (f, m) => me ? m : f, q = (f, m) => pm ? m : f;
  const linked = !!(P && P.linked);
  if (isEN()) return sheet(keep(`<h2>📖 How to edit the auto-replies</h2>
  <p class="muted small">When ${pn} writes in their diary, the app answers right away with <b>your</b> words, even when you're busy.</p>
  <ol class="howto"><li>Open the <b>💞</b> tab at the bottom.</li><li>Scroll down and tap <b>✏️ My messages…</b>.</li>
  <li><b>"If they say… reply…"</b>: type a word they might write (e.g. <i>miss you</i>), your reply under it (one per line), then <b>Add</b>.</li>
  <li><b>General messages</b>: each box is a moment (sad, finished a task, morning…). Edit or add lines and <b>Save</b>.</li>
  <li>Done. It's saved on their side instantly.</li></ol>
  ${linked ? `<button class="btn block" data-act="p-msgs">Open the replies</button>` : ""}`, "f"));
  sheet(keep(`<h2>📖 إزاي ${w("تعدّلي","تعدّل")} الردود التلقائية</h2>
  <p class="muted small">لما ${pn} ${q("تكتب","يكتب")} في دفتر حكاياتي، التطبيق بيرد ${q("عليها","عليه")} على طول <b>بكلامك ${w("إنتي","إنت")}</b>، حتى لو ${w("مشغولة","مشغول")}. وده بيتعمل كده:</p>
  <ol class="howto">
    <li>${w("ادخلي","ادخل")} تاب <b>💞 ${q("شريكتي","شريكي")}</b> اللي تحت.</li>
    <li>${w("انزلي","انزل")} لآخر الصفحة و${w("دوسي","دوس")} <b>✏️ رسايلي ${q("ليها","ليه")}…</b></li>
    <li>في <b>"لو ${q("قالت","قال")}… يبقى الرد…"</b>:
      <div class="howto-ex">لو ${q("قالت","قال")}: <b>وحشتني، وحشتيني</b><br>الرد: <b>${q("وانتي أكتر يا قلبي ❤️","وانت أكتر يا حبيبي ❤️")}</b></div>
      ${w("اكتبي","اكتب")} الكلمة اللي ${q("ممكن تقولها","ممكن يقولها")}، ولو أكتر من كلمة ${w("افصلي","افصل")} بينهم بفاصلة (،). وتحتها ${w("ردّك","ردّك")}، وكل سطر رد لوحده والتطبيق بيختار واحد منهم. و${w("دوسي","دوس")} <b>ضيف الرد</b>.</li>
    <li>في <b>الرسايل العامة</b>: كل خانة ليها وقت (لما ${q("تكون مضايقة","يكون مضايق")}، لما ${q("تخلّص","يخلّص")} مهمة، الصبح…). ${w("عدّلي","عدّل")} أو ${w("زوّدي","زوّد")} سطور و${w("دوسي","دوس")} <b>حفظ الرسايل</b>.</li>
    <li>خلاص! الكلام بيتحفظ ${q("عندها","عنده")} على طول، ولما ${q("تكتب","يكتب")} كلمة من اللي ${w("حطّيتيها","حطّيتها")} يطلع ${w("ردّك","ردّك")} ${w("إنتي","إنت")}.</li>
  </ol>
  <p class="muted small">💡 ${w("تقدري","تقدر")} ${w("تشوفي","تشوف")} ${q("هي كتبت","هو كتب")} إيه في الدفتر و${w("تردّي","تردّ")} بنفسك كمان من تاب 💞.</p>
  ${linked ? `<button class="btn block" data-act="p-msgs">يلا ${w("افتحي","افتح")} الردود ✏️</button>` : `<div class="notice">${w("اربطي","اربط")} حسابك بـ${q("شريكتك","شريكك")} الأول من الإعدادات.</div>`}`, "f"));
}
function adminView(){
  if (!IS_ADMIN) return `<div class="card"><p class="empty">الصفحة دي لصاحب التطبيق بس 👑</p></div>`;
  const A = U.admin || (U.admin = {users:null, reports:null, sel:null, st:null, q:""});
  if (!A.users){ loadAdmin(); return `<section class="hello"><h1>👑 لوحة التحكم</h1></section><div class="card"><p class="empty">بنحمّل…</p></div>`; }
  if (A.sel && A.st){
    const u = A.users.find(x=>x.id===A.sel) || {};
    return withState(A.st, () => dashboard({name:u.name||"", gender:u.gender, title:`👤 ${esc(u.name||"")} <small class="muted">@${esc(u.username||"")}</small>`, all:true, admin:true, fullChat:true, canReply:false,
      banner:`<div class="banner"><span>👑 عرض إداري · ${u.partner?"مربوط بـ "+esc((A.users.find(x=>x.id===u.partner)||{}).name||"?"):"مش مربوط"}</span><button class="btn small" data-act="adm-back">رجوع</button></div>
      <div class="card" style="margin-bottom:10px"><h3>💌 رسالة خاصة تظهرله في شاشة الفتح</h3>
        <textarea class="in" id="adm-special" style="margin-top:8px" placeholder="إنتي أغلى وأجمل حاجة حصلتلي في الدنيا، أنا بجد آسف على كل اللي عملته">${escP(u.special||"")}</textarea>
        <button class="btn small" style="margin-top:8px" data-act="adm-special" data-v="${esc(u.id)}">حفظ الرسالة</button></div>
      <div class="muted small" style="margin-bottom:8px"><span class="pres ${presence(u).c}"></span>${presence(u).t}</div><div class="row wrap">${u.partner ? `<button class="btn small" data-act="adm-copen" data-v="${esc(u.id)}">💞 شاتهم مع بعض</button>` : ""}${u.id !== UID ? `<button class="btn danger small" data-act="adm-deluser" data-v="${esc(u.id)}">🗑️ امسح الحساب نهائي</button>` : ""}<button class="btn ${u.banned?"":"danger"} small" data-act="adm-ban" data-v="${esc(u.id)}">${u.banned?"✅ فك الإيقاف":"⛔ وقف الحساب"}</button>${u.partner?`<button class="btn ghost small" data-act="adm-unlink" data-v="${esc(u.id)}">💔 فك الربط</button>`:""}</div>`}));
  }
  if (A.gsel){
    const g = A.gsel.startsWith("c:") ? A.gcouple : ((A.groups||[]).find(x=>x.id===A.gsel) || {});
    const msgs = (A.gmsgs||[]).slice().sort((a,b)=>a.ts-b.ts);
    return `<div class="banner"><span>👑 جروب: ${esc(g.name||"")} · ${(g.members||[]).length} أعضاء</span><button class="btn small" data-act="adm-gback">رجوع</button></div>
    ${A.gsel.startsWith("c:") ? "" : `<button class="btn danger small" style="margin-bottom:10px" data-act="adm-delgroup">🗑️ امسح الجروب نهائي</button>`}
    <div class="card"><div class="muted small" style="margin-bottom:8px">${(g.members||[]).map(m=>esc((A.users.find(x=>x.id===m)||{}).name || (g.names||{})[m] || "?")).join("، ")}</div>
    ${A.gmsgs === null ? `<p class="empty">بنحمّل…</p>` : msgs.length ? `<ul class="list">${msgs.map(m=>`<li class="item"><span class="ic">💬</span><div class="grow"><div class="t">${esc(m.text||"")}</div><div class="s">${esc(m.name || (A.users.find(x=>x.id===m.from)||{}).name || "")} · ${new Date(m.ts).toLocaleString("ar-EG")}</div></div><button class="x" data-act="adm-gdel" data-v="${esc(m.id)}" aria-label="امسح">🗑️</button></li>`).join("")}</ul>` : `<p class="empty">مفيش رسايل</p>`}</div>`;
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
  <div class="card"><h3>⭐ التقييمات والآراء</h3><ul class="list" style="margin-top:10px">${(A.feedback||[]).length ? A.feedback.map(f=>`<li class="item"><span class="ic">${f.kind==="complaint"?"😟":f.kind==="idea"?"💡":"⭐"}</span><div class="grow"><div class="t">${esc(f.text||"")}</div><div class="s">${f.stars ? "⭐".repeat(f.stars) + " · " : ""}${esc(f.name||"")} · ${f.kind==="complaint"?"شكوى":f.kind==="idea"?"اقتراح":"رأي"}</div></div>${f.kind==="review"?`<button class="mini" data-act="adm-hide-review" data-v="${esc(f.uid||"")}">شيله من الموقع</button>`:""}<button class="x" data-act="adm-fb-del" data-v="${esc(f.id)}" aria-label="امسح">✕</button></li>`).join("") : `<li class="empty">لسه مفيش</li>`}</ul></div>
  <div class="card"><h3>🚩 محتاج مراجعة</h3><ul class="list" style="margin-top:10px">${A.reports.length?A.reports.map(r=>`<li class="item"><span class="ic">${r.kind==="auto"?"🤖":"🚩"}</span><div class="grow"><div class="t">${esc(r.text||"")}</div><div class="s">${r.kind==="auto"?"الفلتر علّمها":"بلاغ"} · كتبها ${esc((A.users.find(x=>x.id===r.author)||{}).name||"?")}</div></div>
    <button class="mini" data-act="adm-open" data-v="${esc(r.owner||"")}">افتح</button><button class="mini" data-act="adm-rmmsg" data-v="${esc(r.id)}">🗑️ امسح الرسالة</button><button class="x" data-act="adm-dismiss" data-v="${esc(r.id)}" aria-label="تجاهل">✕</button></li>`).join(""):`<li class="empty">مفيش حاجة ✨</li>`}</ul></div>
  <div class="card"><h3>💬 جروبات الصحاب</h3><ul class="list" style="margin-top:10px">${(A.groups||[]).length ? A.groups.map(g=>`<li><button class="item" style="width:100%;border:0;text-align:right" data-act="adm-gopen" data-v="${esc(g.id)}"><span class="ic">👭</span><div class="grow"><div class="t">${esc(g.name||"")}</div><div class="s">${(g.members||[]).length} أعضاء${g.lastText?" · "+esc(g.lastText):""}</div></div></button></li>`).join("") : `<li class="empty">مفيش جروبات لسه</li>`}</ul></div>
  <div class="card"><h3>💌 رسايل "فاكرك علطول" للكل</h3><p class="muted small" style="margin:6px 0 10px">الرسايل دي بتتضاف لرسايل كل الناس وبتظهرلهم في الرئيسية. كل سطر رسالة لوحدها.</p>
    <label class="f">🎀 للبنات (بصوت الولد)<textarea class="in" id="cfg-love-f" rows="5" placeholder="بحبك أكتر من امبارح">${escP(((CFG.love||{}).f||[]).join("\n"))}</textarea></label>
    <label class="f" style="margin-top:8px">🧢 للولاد (بصوت البنت)<textarea class="in" id="cfg-love-m" rows="5" placeholder="إنت ضهري وسندي">${escP(((CFG.love||{}).m||[]).join("\n"))}</textarea></label>
    <button class="btn block" style="margin-top:10px" data-act="adm-love">حفظ الرسايل للكل</button></div>
  <div class="card"><h3>💪 كلام التشجيع للكل</h3><p class="muted small" style="margin:6px 0 10px">بيظهر للي مش مرتبطين، وللي قفلوا رسايل الحب. كل سطر جملة لوحدها، وبتتضاف على الجمل الموجودة.</p>
    <label class="f">🎀 للبنات<textarea class="in" id="cfg-cheer-f" rows="5" placeholder="إنتي قدها 💪">${escP(((CFG.cheer||{}).f||[]).join("\n"))}</textarea></label>
    <label class="f" style="margin-top:8px">🧢 للولاد<textarea class="in" id="cfg-cheer-m" rows="5" placeholder="كمّل يا بطل 🔥">${escP(((CFG.cheer||{}).m||[]).join("\n"))}</textarea></label>
    <button class="btn block" style="margin-top:10px" data-act="adm-cheer">حفظ التشجيع للكل</button></div>
  <div class="card"><h3>👭 الصحاب</h3><ul class="list" style="margin-top:10px">${(A.friends||[]).length ? A.friends.map(f=>`<li><button class="item" style="width:100%;border:0;text-align:right" data-act="adm-fopen" data-v="${esc(f.id)}"><span class="ic">${f.status==="ok"?"👭":"⏳"}</span><div class="grow"><div class="t">${Object.values(f.names||{}).map(esc).join(" و ")}</div><div class="s">${f.status==="ok"?"صحاب":"طلب لسه"}</div></div></button></li>`).join("") : `<li class="empty">مفيش صحاب لسه</li>`}</ul></div>
  <div class="card"><h3>📦 نسخة من كل البيانات</h3><p class="muted small" style="margin:6px 0 10px">ملف فيه كل الحسابات وبياناتهم وشاتاتهم والجروبات والبلاغات والآراء.</p><button class="btn ghost block" data-act="adm-export">⬇️ نزّل كل البيانات</button></div>
  <div class="card"><div class="row between"><h3>👥 الحسابات <span class="muted small">· 🟢 ${A.users.filter(u=>presence(u).c==="on").length} فاتحين دلوقتي · 🔴 ${A.users.filter(u=>presence(u).c==="off").length} غايبين أسبوع</span></h3><button class="btn ghost small" data-act="adm-reload">🔄</button></div>
    <input class="in" id="adm-q" placeholder="دوّر بالاسم أو اليوزر" value="${esc(A.q)}" style="margin-top:10px">
    <ul class="list" style="margin-top:10px">${list.map(u=>`<li><button class="item" style="width:100%;border:0;text-align:right" data-act="adm-open" data-v="${esc(u.id)}"><span class="ic">${u.gender==="m"?"🧢":"🎀"}</span><div class="grow"><div class="t"><span class="pres ${presence(u).c}" title="${presence(u).t}"></span>${esc(u.name)} ${u.banned?"⛔":""}</div><div class="s">${presence(u).t} · @${esc(u.username)}${u.partner?" · 💞 "+esc((A.users.find(x=>x.id===u.partner)||{}).name||""):""}</div></div></button></li>`).join("")}</ul></div>`;
}
async function loadAdmin(){
  const A = U.admin;
  try {
    A.users = (await fb.list("users", 1000)).filter(u=>!u.deleting).sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));
    A.reports = await fb.list("reports", 200);
    A.feedback = await fb.list("feedback", 100, "at").catch(()=>[]);
    A.resets = await fb.list("resetRequests", 100).catch(()=>[]);
    A.groups = await fb.list("groups", 300).catch(()=>[]);
    A.friends = await fb.list("friends", 500).catch(()=>[]);
  } catch(e){ A.users = []; A.reports = []; toast("مش قادر أحمّل البيانات"); }
  if (S.tab === "admin") render();
}
/* green dot + "open now" for partner and friends */
const presTag = u => { const p = presence(u || {}); return `<span class="prestag"><span class="pres ${p.c}"></span>${p.c === "on" ? "فاتح دلوقتي" : (u && u.seen ? "آخر ظهور " + p.t : "")}</span>`; };
/* who's around: green = open now, red = not opened for a week */
function presence(u){
  const t = u && u.seen || 0, ago = Date.now() - t;
  if (!t) return {c:"off", t:"لسه مفتحش"};
  if (ago < 6 * 6e4) return {c:"on", t:"فاتح دلوقتي"};
  const m = Math.round(ago / 6e4), h = Math.round(ago / 36e5), d = Math.floor(ago / 864e5);
  return {c: d >= 7 ? "off" : "mid", t: m < 60 ? `من ${m} دقيقة` : h < 24 ? `من ${h} ساعة` : d === 1 ? "من يوم" : d === 2 ? "من يومين" : `من ${d} أيام`};
}
let lastBeat = 0;
function heartbeat(force){
  if (!CLOUD || !UID || !ME || document.visibilityState !== "visible") return;
  const now = Date.now(); if (!force && now - lastBeat < 3 * 6e4) return; lastBeat = now;
  fb.set(`users/${UID}`, {seen:now}).catch(()=>{}); fb.set(`act/${UID}`, {seen:now, name:ME.name}).catch(()=>{});
}
setInterval(heartbeat, 6e4);
setInterval(() => { if (S && !$("#layer").innerHTML && (S.tab === "mate" || (S.tab === "diary" && U.dmode !== "me"))) keepTyping(render); }, 6e4);
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") heartbeat(); });
async function adminExport(){
  toast("بنجمّع البيانات… استنى شوية");
  try {
    const users = await fb.list("users", 2000), out = {exportedAt:new Date().toISOString(), users:[], groups:[], reports:[], feedback:[], resetRequests:[]};
    for (const u of users){
      const secs = {}; await Promise.all(Object.keys(SEC).map(sec => fb.get(`u/${u.id}/sec/${sec}`).then(d => { if (d) secs[sec] = d; }).catch(()=>{})));
      const chat = (await fb.list(`u/${u.id}/chat`, 5000, "ts").catch(()=>[])).reverse();
      out.users.push({uid:u.id, account:u, data:secs, diary:chat});
    }
    for (const g of await fb.list("groups", 1000).catch(()=>[])) out.groups.push({...g, msgs:(await fb.list(`groups/${g.id}/msgs`, 5000, "ts").catch(()=>[])).reverse()});
    out.couples = [];
    for (const u of users) if (u.partner && u.id < u.partner) out.couples.push({between:[u.id, u.partner], msgs:(await fb.list(`couples/${coupleId(u.id, u.partner)}/msgs`, 5000, "ts").catch(()=>[])).reverse()});
    out.friends = [];
    for (const f of await fb.list("friends", 2000).catch(()=>[])) out.friends.push({...f, msgs:(await fb.list(`friends/${f.id}/msgs`, 5000, "ts").catch(()=>[])).reverse()});
    out.shared = await fb.list("act", 2000).catch(()=>[]);
    out.reports = await fb.list("reports", 2000).catch(()=>[]);
    out.feedback = await fb.list("feedback", 2000).catch(()=>[]);
    out.resetRequests = await fb.list("resetRequests", 2000).catch(()=>[]);
    const name = `nonos-world-data-${dkey()}.json`, blob = new Blob([JSON.stringify(out, null, 2)], {type:"application/json"});
    const file = typeof File === "function" ? new File([blob], name, {type:"application/json"}) : null;
    if (file && navigator.canShare && navigator.canShare({files:[file]}) && /Android|iPhone|iPad/i.test(navigator.userAgent)){ await navigator.share({files:[file], title:name}); }
    else { const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); }, 3000); }
    toast(`✅ ${out.users.length} حساب و ${out.groups.length} جروب`);
  } catch(e){ console.warn(e); toast("مقدرتش أنزّل البيانات"); }
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
  const u = (A.users||[]).find(x=>x.id===id) || {}; st.user = {name:u.name, username:u.username, gender:u.gender||"f", religion:u.religion||"muslim"};
  A.st = normalize(st, u.gender); A.st.user = st.user; A.stUid = id; render(); window.scrollTo({top:0});
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
  return `<section class="hello"><h1>الإعدادات ⚙️</h1><p>${esc(S.user.name)} · @${esc(S.user.username)}</p></section>
  ${IS_ADMIN ? `<button class="btn block" style="margin-bottom:12px" data-act="tab" data-v="admin">👑 لوحة التحكم</button>` : ""}
  <div class="card"><h3>الثيم 🎨</h3>
    <div class="themes" style="margin-top:10px">${THEMES.map(t=>`<button data-act="theme" data-v="${t.k}" aria-pressed="${S.theme===t.k}"><span class="sw" style="background:linear-gradient(135deg,${t.a},${t.a2})"></span>${t.n}</button>`).join("")}</div>
    <div class="sectionlbl" style="margin:14px 4px 6px">🌙 الوضع الليلي</div>
    <div class="seg"><button data-act="dark" data-v="off" aria-pressed="${S.dark==="off"}">مقفول</button><button data-act="dark" data-v="auto" aria-pressed="${S.dark==="auto"}">لوحده بالليل</button><button data-act="dark" data-v="on" aria-pressed="${S.dark==="on"}">على طول</button></div>
  </div>
  <div class="card"><div class="row between"><h3>${L.alarm}</h3><button class="btn ghost small" data-act="test-morning">جرّبي</button></div>
    <label class="f" style="margin-top:10px">ميعاد الصحيان<input class="in num" type="time" id="wake" value="${S.alarm.wake}"></label>
    <div class="sectionlbl" style="margin:14px 4px 6px">🔔 التذكيرات</div>
    <ul class="list">${S.alarm.reminders.map(r=>`<li class="item"><span class="ic">🔔</span><div class="grow"><div class="t">${esc(r.text)}</div><div class="s num">${tf(r.time)}</div></div><button class="x" data-act="del-rem" data-v="${r.id}" aria-label="امسحي">✕</button></li>`).join("")}</ul>
    <button class="add" style="margin-top:8px" data-act="add-rem">＋ تذكير جديد</button>
    <div class="notice" style="margin-top:10px">على التابلت بيرنّوا حتى لو التطبيق مقفول. على الكمبيوتر بيرنّوا طول ما البرنامج مفتوح. على الآيفون استخدمي منبّه الآيفون مع Shortcuts (الشرح في موقع التحميل).</div>
  </div>
  ${isMuslim() ? `<div class="card"><h3>🕌 الصلاة والأذكار</h3>
    <div class="item" style="margin-top:10px"><span class="ic">📍</span><div class="grow"><div class="t">${esc(myLoc().name)}</div><div class="s">${myLoc().guess ? "مختارين القاهرة لحد ما تحددي مكانك" : "مواعيد الصلاة على حسب المكان ده"}</div></div><button class="mini" data-act="loc-gps">مكاني</button></div>
    <select class="in" id="loc-city" aria-label="اختاري المدينة" style="margin-top:8px"><option value="">أو اختاري مدينتك…</option>${CITIES.map(([n])=>`<option ${myLoc().name===n?"selected":""}>${n}</option>`).join("")}</select>
    <div class="ptimes">${(() => { const t = timesFor(); return [["fajr","الفجر"],["sunrise","الشروق"],["dhuhr","الظهر"],["asr","العصر"],["maghrib","المغرب"],["isha","العشاء"]].map(([p,n]) => `<div><small>${n}</small><b class="num">${hhmm(t[p])}</b></div>`).join(""); })()}</div>
    <ul class="list" style="margin-top:6px">${[["on","🕌 إشعار الأذان في كل صلاة"],["remind","⏰ تذكير بعد 25 دقيقة لو معلّمتيش إنك صلّيتي"],["azkar","📿 أذكار الصباح والمساء"],["kahf","📖 سورة الكهف يوم الجمعة"],["fast","🌙 تذكير بصيام الاثنين والخميس (بالليل قبلها)"]].map(([k,t])=>`<li class="item"><div class="grow t">${t}</div><button class="switch" data-act="pray-opt" data-v="${k}" role="switch" aria-checked="${k === "fast" ? !!(S.pray||{}).fast : (S.pray||{})[k]!==false}" aria-label="${t}"><i></i></button></li>`).join("")}</ul>
    ${S.user.gender !== "m" ? `<p class="muted small" style="margin:8px 4px 0">🤍 أيام البريود الأذان بيقف لوحده، وبيوصلك مكانه حديث عن الصبر والأجر. والأذكار بتفضل، وتذكير الصيام مش بيوصل في الأيام دي.</p>` : ""}
  </div>` : ""}
  <div class="card"><h3>🔔 تذكير الفلوس والمهام</h3><p class="muted small" style="margin:4px 0 10px">كل كام ساعة نفكّرك تسجّلي مصاريفك ومهامك (من 10 الصبح لـ 10 بالليل).</p>
    <div class="seg">${[[0,"مقفول"],[2,"كل ساعتين"],[3,"كل 3"],[4,"كل 4"],[6,"كل 6"]].map(([n,t])=>`<button data-act="nudge" data-v="${n}" aria-pressed="${((S.nudge||{}).every||0)===n}">${t}</button>`).join("")}</div></div>
  <div class="card"><h3>🔒 شريكي يشوف إيه</h3>
    <p class="muted small" style="margin:6px 0 10px">إنتي اللي بتختاري. اللي تقفليه بيختفي من عنده على طول.</p>
    <ul class="list">${SHARE.map(([k,t])=>`<li class="item"><div class="grow t">${t}</div><button class="switch" data-act="share" data-v="${k}" role="switch" aria-checked="${S.share[k]!==false}" aria-label="${t}"><i></i></button></li>`).join("")}</ul>
    <div class="row wrap" style="margin-top:10px"><button class="btn small" data-act="tab" data-v="partner">👀 شوفي هو بيشوفك إزاي</button></div>
  </div>
  <div class="card"><h3>🌐 Language / اللغة</h3>
    <div class="seg" style="margin-top:10px"><button data-act="set-lang" data-v="ar" aria-pressed="${!isEN()}">\uE000عربي\uE001</button><button data-act="set-lang" data-v="en" aria-pressed="${isEN()}">\uE000English\uE001</button></div></div>
  ${CLOUD ? `<div class="card row between"><div><h3>⭐ قيّمي التطبيق</h3><div class="muted small">رأيك أو اقتراح أو شكوى</div></div><button class="btn small" data-act="feedback">اكتبي</button></div>` : ""}
  <div class="card"><h3>💵 العملة</h3>
    <div class="seg" style="margin-top:10px"><button data-act="set-cur" data-v="egp" aria-pressed="${S.currency!=="usd"}">جنيه مصري</button><button data-act="set-cur" data-v="usd" aria-pressed="${S.currency==="usd"}">دولار</button></div></div>
  <div class="card"><h3>الديانة</h3><p class="muted small" style="margin:4px 0 10px">علشان نظبط الكلام والتذكيرات اللي تناسبك.</p>
    <div class="seg"><button data-act="set-rel" data-v="muslim" aria-pressed="${isMuslim()}">مسلمة</button><button data-act="set-rel" data-v="christian" aria-pressed="${!isMuslim()}">مسيحية</button></div></div>
  <div class="card"><h3>🕐 شكل الساعة</h3><p class="muted small" style="margin:4px 0 10px">"زي الموبايل" بياخد نفس شكل ساعة جهازك.</p>
    <div class="seg">${[["auto","زي الموبايل"],["12","12 ساعة (2:30 م)"],["24","24 ساعة (14:30)"]].map(([k,t])=>`<button data-act="clock" data-v="${k}" aria-pressed="${(S.clock||"auto")===k}">${t}</button>`).join("")}</div></div>
  <div class="card"><h3>📍 بتدرسي فين؟</h3><p class="muted small" style="margin:4px 0 10px">علشان نظبط المذاكرة والجدول على حسابك.</p>
    <div class="seg"><button data-act="set-stage" data-v="uni" aria-pressed="${stage()==="uni"}">جامعة 🎓</button><button data-act="set-stage" data-v="school" aria-pressed="${stage()==="school"}">مدرسة 🎒</button><button data-act="set-stage" data-v="grad" aria-pressed="${stage()==="grad"}">متخرّجة 💼</button></div></div>
  ${partnerCard()}
  ${CLOUD && ME ? `<div class="card"><h3>🔔 الإشعارات والتطبيق مقفول</h3><p class="muted small" style="margin:4px 0 0">رسايل ${ME.gender==="m" ? "\uE000شريكتك\uE001" : "شريكك"} والجروبات والتنبيهات توصلك حتى لو التطبيق مقفول خالص.</p>
    <ol class="small" style="margin:8px 0 0;padding-inline-start:18px;line-height:1.9"><li>نزّل تطبيق <b>ntfy</b> (موجود على Google Play وApp Store ومتاح للكمبيوتر).</li><li>دوس <b>+</b> واكتب الاسم ده بالظبط:</li></ol>
    <div class="item" style="margin-top:6px"><div class="grow t num" dir="ltr" style="word-break:break-all">${esc(ME.ntfy||"")}</div><button class="mini" data-act="copy" data-v="${esc(ME.ntfy||"")}">نسخ</button></div>
    <p class="muted small" style="margin:8px 0 0">متقولش الاسم ده لحد، ده بتاعك إنت بس.</p>
    <button class="btn ghost small" style="margin-top:10px" data-act="notif">📖 الطريقة خطوة بخطوة</button></div>` : ""}
  ${IS_ADMIN ? `<button class="btn block" data-act="tab" data-v="admin">👑 لوحة التحكم</button>` : ""}
  <div class="card"><h3>${L.backup}</h3>
    <p class="muted small" style="margin:6px 0 10px">انسخي كل بياناتك في ملف نصي، أو رجّعيها من نسخة قديمة.</p>
    <div class="row wrap"><button class="btn ghost small" data-act="backup">انسخي نسخة</button><button class="btn ghost small" data-act="restore">رجّعي نسخة</button>${S.sample?`<button class="btn ghost small" data-act="clear-sample">امسحي البيانات التجريبية</button>`:""}</div>
  </div>
  ${CLOUD && ME ? `<div class="card"><h3>👤 غيّري اليوزر نيم</h3>
    <p class="muted small" style="margin:6px 0 10px">اليوزر الحالي: <b dir="ltr">@${esc(ME.username||"")}</b></p>
    ${U.unReq && U.unReq.status === "new" ? `<div class="notice">⏳ بيتغيّر لـ <b dir="ltr">@${esc(U.unReq.username)}</b> خلال دقايق. بعدها هتدخلي بيه المرة الجاية.</div>`
      : `${U.unReq && U.unReq.status === "taken" ? `<div class="notice" style="color:var(--bad)">❌ <b dir="ltr">@${esc(U.unReq.username)}</b> متاخد، جرّبي اسم تاني</div>` : ""}
    <form class="row" data-form="uname"><input class="in" id="un-new" dir="ltr" required placeholder="newname" pattern="[A-Za-z0-9_.]{3,20}" title="من 3 لـ 20 حرف إنجليزي" autocomplete="off" aria-label="اليوزر الجديد"><button class="btn small" type="submit">غيّري</button></form>`}
  </div>` : ""}
  ${CLOUD ? `<div class="card"><h3>🔑 غيّري الباسورد</h3>
    <form class="form" data-form="pass" style="margin-top:10px">
      <label class="f">الباسورد الحالي<span class="pwwrap"><input class="in" id="pw-cur" type="password" required autocomplete="current-password" dir="ltr"><button type="button" class="pweye" data-act="showpw" aria-label="إظهار الباسورد">${EYE_SHUT}</button></span></label>
      <label class="f">الباسورد الجديد<span class="pwwrap"><input class="in" id="pw-new" type="password" required minlength="6" autocomplete="new-password" dir="ltr"><button type="button" class="pweye" data-act="showpw" aria-label="إظهار الباسورد">${EYE_SHUT}</button></span></label>
      <div class="notice" id="pw-err" style="display:none;color:var(--bad);font-weight:700"></div>
      <button class="btn" type="submit">غيّري</button>
    </form></div>` : ""}
  <div class="card row between"><span class="muted small">دوسي 5 مرات على اسم التطبيق فوق… 🤫</span><button class="btn ghost small" data-act="logout">خروج</button></div>`;
}

function authView(){
  const login = U.authMode === "login";
  return `
  <div class="auth">
    <button class="btn ghost small" data-act="set-lang" data-v="${isEN()?"ar":"en"}" style="align-self:flex-end">\uE000${isEN()?"عربي":"English"}\uE001</button>
    <div class="logo">🌍</div>
    <h1>Nono's World</h1>
    <p class="center muted" style="margin:-8px 0 0">${login?"وحشتينا! ادخلي 💗":"اعملي حسابك وابدئي دنيتك 🌸"}</p>
    <form class="card form" data-form="auth">
      ${login?"":`<label class="f">اسمك (هنناديكي بيه)<input class="in" id="a-name" required placeholder="${U.ag==="m"?"محمد":"نونو"}"></label>`}
      <label class="f">اسم المستخدم (بالإنجليزي)<input class="in" id="a-user" required autocomplete="username" dir="ltr" placeholder="nono" pattern="[A-Za-z0-9_.]{3,20}" title="من 3 لـ 20 حرف إنجليزي"></label>
      <label class="f">الباسورد<span class="pwwrap"><input class="in" id="a-pass" type="password" required minlength="6" autocomplete="${login?"current-password":"new-password"}" dir="ltr"><button type="button" class="pweye" data-act="showpw" aria-label="إظهار الباسورد">${EYE_SHUT}</button></span></label>
      ${login?"":`<div class="seg" role="group" aria-label="أنا"><button type="button" data-act="agender" data-v="f" aria-pressed="${(U.ag||"f")==="f"}">أنا بنت 🎀</button><button type="button" data-act="agender" data-v="m" aria-pressed="${U.ag==="m"}">أنا شاب 🧢</button></div>
      <div class="seg" role="group" aria-label="بتدرسي فين"><button type="button" data-act="astage" data-v="uni" aria-pressed="${U.stage==="uni"}">جامعة 🎓</button><button type="button" data-act="astage" data-v="school" aria-pressed="${U.stage==="school"}">مدرسة 🎒</button><button type="button" data-act="astage" data-v="grad" aria-pressed="${U.stage==="grad"}">متخرّجة 💼</button></div>
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
  return list.map(e => { const tm = tf(new Date(e.ts));
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
    <button class="btn" type="submit" id="fg-btn">ابعتي الطلب</button>
  </form>`);
}
function incSheet(){
  sheet(`<h2>💰 جالك فلوس؟</h2>
  <form class="form" data-form="inc">
    <label class="f">المبلغ (${CUR()})<input class="in num" id="i-amt" type="number" inputmode="decimal" min="1" step="any" required placeholder="200"></label>
    <label class="f">منين؟ (لو حابة)<input class="in" id="i-note" placeholder="عيدية، شغل، هدية…"></label>
    <button class="btn" type="submit">ضيفيها</button>
  </form>`);
}
function expSheet(){
  S._cat = S._cat || "food";
  sheet(`<h2>صرفتي على إيه؟ 💸</h2>
  <form class="form" data-form="exp">
    <label class="f">المبلغ (${CUR()})<input class="in num" id="e-amt" type="number" inputmode="decimal" min="1" step="any" required placeholder="50"></label>
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
  <ul class="list">${rows.length?rows.map(s=>`<li class="item"><div class="grow"><div class="t">${esc(s.title)}</div><div class="s num">${DAYS[s.day]} · ${tf(s.start)} – ${tf(s.end)}${s.place?" · "+esc(s.place):""}</div></div><button class="x" data-act="del-lec" data-v="${s.id}" aria-label="امسحي">✕</button></li>`).join(""):`<li class="empty">لسه مفيش محاضرات</li>`}</ul>
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
  <div class="stat"><b>${hm(mins)}</b><span>مذاكرة</span></div><div class="stat"><b class="num">${fmt(spent)}</b><span>${CUR()} صرفتيهم</span></div><div class="stat"><b>${top&&top.n?top.e:"·"}</b><span>أكتر مود</span></div></div>
  <div class="letter" style="margin-top:14px"><span class="lbl">${loveOn() ? L.love : "💪 كلمة حلوة"}</span><p>${esc(pick(pct>=60 ? MS("g_high") : MS("lazy")))}</p></div>
  <button class="btn block" data-act="close" style="margin-top:14px">تمام 🫠</button>`);
}
function reminderSheet(){
  sheet(`<h2>تذكير جديد 🔔</h2>
  <form class="form" data-form="rem">
    <label class="f">الكلام اللي يظهر<input class="in" id="r-text" required placeholder="اشربي مية 💧"></label>
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
  sheet(`<div class="popmsg"><div class="em">☀️</div><p>${esc(morningPick())}</p><small>${loveOn() ? L.love : "صباح الخير"}</small></div>
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
function openGlobalMsgs(g){
  const saved = (CFG.msgs || {})[g] || {};
  U.edit = "global"; U.gEdit = g;
  U.G = {msgs:Object.assign(defMsgs(g, "muslim", "ar"), JSON.parse(JSON.stringify(saved))), rules:JSON.parse(JSON.stringify((CFG.msgs || {})["rules_" + g] || []))};
  secretSheet();
}
function secretSheet(){
  const T = U.edit === "mate" && P ? P : U.edit === "global" ? U.G : S;
  return withState(T, () => sheet(`${U.edit === "global" ? `<h2>👑 الردود التلقائية للكل</h2><p class="muted small" style="margin:-6px 0 10px">اللي تكتبه هنا بيتغيّر عند كل الناس المرتبطين اللي كلام الحب عندهم شغال (إلا اللي شريكه عدّل رسايله بنفسه).</p>
  <div class="seg" style="margin-bottom:14px"><button data-act="gedit" data-v="f" aria-pressed="${U.gEdit==="f"}">🎀 اللي بيظهر للبنات</button><button data-act="gedit" data-v="m" aria-pressed="${U.gEdit==="m"}">🧢 اللي بيظهر للولاد</button></div>` : `<h2>🤫 الرسايل</h2>`}
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
    ${U.edit === "mate" || U.edit === "global" ? "" : `<button class="btn ghost" type="button" data-act="change-pin">غيّر الرقم السري</button>`}
  </form>`));
}
function msgsTarget(){ return U.edit === "mate" && P ? P : U.edit === "global" ? U.G : S; }
function saveMsgs(){ if (U.edit === "global"){ const g = U.gEdit, d = {[g]:U.G.msgs, ["rules_" + g]:U.G.rules, at:Date.now()}; CFG.msgs = Object.assign({}, CFG.msgs, d); fb.set("config/msgs", d).then(()=>toast("اتحفظ عند الكل ✅")).catch(()=>toast("مقدرتش أحفظ")); return; }
  if (U.edit === "mate" && P && CLOUD){ fb.set(`u/${P.uid}/sec/msgs`, {msgs:P.msgs, rules:P.rules||[]}, false).catch(()=>toast("مقدرتش أحفظ")); } else save(); }
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
  const n = norm(String(text).toLowerCase() + " ");
  if (loveOn()) for (const r of (S.rules||[]).concat(globalRules())) if (r.keys.some(w => w && n.includes(norm(w)))) return "rule:" + r.id;
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
        save(); render(); message("📚", pick(MS("d_study")), "خلّصتي "+L.focus+" 💪");
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
    if (tapCount >= 5){ tapCount = 0; if (!CLOUD) pinSheet(); else if (IS_ADMIN) openGlobalMsgs("f"); }
    return;
  }
  if (!b) return;
  const act = b.dataset.act, v = b.dataset.v;
  if (act === "close-scrim"){ if (e.target === b && !sheetLocked) closeSheet(); return; }
  const k = dkey();
  switch(act){
    case "close": closeSheet(); break;
    case "tab": go(v); break;
    case "new-love": S._love = pick(loveOn() ? lovePool() : cheerPool()); render(); break;
    case "love-toggle": S.loveOff = !S.loveOff; S._love = null; save(); render(); toast(S.loveOff ? "تمام، مفيش كلام حب في أي حتة، تشجيع بس 💪" : "رجع كلام الحب 💌"); break;
    case "mood": {
      S.moods[k] = v; save(); render();
      const m = MOODS.find(x=>x.k===v); message(m.e, pick(MS(v)));
      if (CLOUD && (v === "sad" || v === "stressed")) notifyPartner(`${S.user.name} ${S.user.gender==="m"?"مضايق":"مضايقة"} ${m.e} النهارده، كلّمه/كلّمها 🤍`);
      break;
    }
    case "water": { const c = S.care[k] = S.care[k] || {water:0,sleep:0}; c.water = c.water === +v ? +v-1 : +v; save(); render(); if (c.water===8) toast("8 كوبايات! إيه الشطارة دي 💧"); break; }
    case "pray": { const pr = S.prayers[k] = S.prayers[k] || {}; pr[v] = !pr[v]; save(); render(); if (PRAYERS.every(([p])=>pr[p])) toast("ما شاء الله، الخمس فروض كاملين، ربنا يتقبل"); break; }
    case "cycle-start": cycleSheet(); break;
    case "cycle-end": { const c = S.cycle; const days = Math.max(1, Math.round((fromKey(dkey()) - fromKey(c.start))/864e5) + 1); c.history = (c.history||[]).concat({start:c.start, days}).slice(-12); c.on = false; save(); render(); const nx = nextCycle(); toast("ألف سلامة عليكي 🤍" + (nx ? " · المرة الجاية حوالي " + prettyDate(nx.date) : "")); break; }
    case "new-pmsg": S._pmsg = pick(MS("period")); render(); break;
    case "star": { const c = S.care[k] = S.care[k] || {water:0,sleep:0}; c.stars = c.stars === +v ? +v-1 : +v; save(); render(); if (c.stars===5) toast(S.user.gender === "m" ? "إيه الروقان ده كله 😎" : "ايه الحلاوه دي كلها 💅✨"); break; }
    case "sleep": { const c = S.care[k] = S.care[k] || {water:0,sleep:0}; c.sleep = Math.max(0, Math.min(16, c.sleep + +v)); save(); render(); break; }
    case "week-summary": weekSheet(); break;
    case "add-exp": expSheet(); break;
    case "add-inc": incSheet(); break;
    case "del-inc": S.money.incomes = (S.money.incomes||[]).filter(x=>x.id!==v); save(); render(); break;
    case "ecat": S._cat = v; document.querySelectorAll("#e-cats .chip").forEach(c=>c.setAttribute("aria-pressed", c.dataset.v===v)); break;
    case "del-exp": S.money.expenses = S.money.expenses.filter(x=>x.id!==v); save(); render(); break;
    case "allowance": S._period = S.money.period; allowanceSheet(); break;
    case "aperiod": S._period = v; b.parentElement.querySelectorAll("button").forEach(x=>x.setAttribute("aria-pressed", x.dataset.v===v)); break;
    case "dayoff": S._dayOff = +v; render(); break;
    case "task": {
      const t = S.tasks.find(x=>x.id===v); if (!t) break;
      const was = t.status; t.status = was === b.dataset.s ? null : b.dataset.s; save(); render();
      if (t.status === "done") toast(L.done + " · " + pick(MS("done")));
      if (t.status === "lazy") message(cycleOn() && S.user.gender !== "m" ? "🤍" : "🙈", pick(cycleOn() && S.user.gender !== "m" && MS("period").length ? MS("period") : MS("lazy")));
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
    case "replies-help": repliesHelp(); break;
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
    case "logout": try { localStorage.removeItem("nw-name"); } catch(e){} U.authMode = "login"; closeSheet(); $("#tabs")?.remove(); if (CLOUD){ pushNow(); fb.signOut(); } else { S.user = null; save(); render(); } break;
    case "copy": { (navigator.clipboard ? navigator.clipboard.writeText(v) : Promise.reject()).then(()=>toast("اتنسخ ✅")).catch(()=>toast(v)); break; }
    case "unlink": { if (!CLOUD) break; const pid = ME.partner; saveMe({partner:null}); fb.del(`linkRequests/${pid}`).catch(()=>{}); setupPartner(); render(); toast("اتفك الربط"); break; }
    case "link-accept": { saveMe({partner:v}); fb.del(`linkRequests/${UID}`).catch(()=>{}); closeSheet(); setupPartner(); toast("اتربطتوا 💞"); break; }
    case "link-decline": { fb.del(`linkRequests/${UID}`).catch(()=>{}); closeSheet(); break; }
    case "report": { const e = S.diary.find(x=>x.id===v); if (!e) break; fb.add("reports", {kind:"report", path:`u/${UID}/chat/${v}`, owner:UID, author:ME.partner||null, by:UID, text:e.text}).then(()=>toast("اتبعت البلاغ 🚩")).catch(()=>toast("مقدرتش أبعت البلاغ")); break; }
    case "forgot": forgotSheet(); break;
    case "adm-open": adminOpen(v); break;
    case "adm-copen": { const A = U.admin, u = A.users.find(x=>x.id===v); if (!u || !u.partner) break; const cid = coupleId(u.id, u.partner), o = A.users.find(x=>x.id===u.partner) || {};
      A.gcouple = {name:`💞 ${u.name||""} و ${o.name||"?"}`, members:[u.id, u.partner]}; A.gback = v; A.gsel = "c:" + cid; A.gpath = `couples/${cid}/msgs`; A.gmsgs = null; render();
      fb.list(A.gpath, 2000, "ts").then(l=>{ A.gmsgs = l; }).catch(()=>{ A.gmsgs = []; toast("مقدرتش أحمّل الرسايل"); }).then(()=>{ if (A.gsel === "c:" + cid) render(); }); window.scrollTo({top:0}); break; }
    case "adm-gopen": { const A = U.admin; A.gsel = v; A.gpath = `groups/${v}/msgs`; A.gback = null; A.gmsgs = null; render(); fb.list(`groups/${v}/msgs`, 1000, "ts").then(l=>{ A.gmsgs = l; }).catch(()=>{ A.gmsgs = []; toast("مقدرتش أحمّل الرسايل"); }).then(()=>{ if (U.admin.gsel === v) render(); }); window.scrollTo({top:0}); break; }
    case "adm-gback": { const A = U.admin, back = A.gback; A.gsel = null; A.gmsgs = null; A.gback = null; if (back) adminOpen(back); else render(); break; }
    case "adm-gdel": { const A = U.admin, gid = A.gsel; fb.del(`${A.gpath}/${v}`).then(()=>{ A.gmsgs = A.gmsgs.filter(m=>m.id!==v); render(); toast("اتمسحت"); }).catch(()=>toast("مقدرتش")); break; }
    case "adm-export": adminExport(); break;
    case "adm-cheer": { const lines = id => (($("#" + id)||{}).value || "").split("\n").map(x=>x.trim()).filter(Boolean).slice(0, 200);
      const d = {f:lines("cfg-cheer-f"), m:lines("cfg-cheer-m"), at:Date.now()};
      fb.set("config/cheer", d, false).then(()=>{ CFG.cheer = d; toast("اتحفظ، وهيظهر للكل 💪"); }).catch(()=>toast("مقدرتش أحفظ، اتأكد إنك نشرت القواعد الجديدة")); break; }
    case "adm-fopen": { const A = U.admin, f = (A.friends||[]).find(x=>x.id===v); if (!f) break;
      A.gcouple = {name:`👭 ${Object.values(f.names||{}).join(" و ")}`, members:f.members||[]}; A.gback = null; A.gsel = "c:f:" + v; A.gpath = `friends/${v}/msgs`; A.gmsgs = null; render();
      fb.list(A.gpath, 2000, "ts").then(l=>{ A.gmsgs = l; }).catch(()=>{ A.gmsgs = []; }).then(()=>{ if (A.gsel === "c:f:" + v) render(); }); window.scrollTo({top:0}); break; }
    case "adm-love": { const lines = id => (($("#" + id)||{}).value || "").split("\n").map(x=>x.trim()).filter(Boolean).slice(0, 200);
      const d = {f:lines("cfg-love-f"), m:lines("cfg-love-m"), at:Date.now()};
      fb.set("config/love", d, false).then(()=>{ CFG.love = d; toast("اتحفظت، وهتظهر للكل 💌"); }).catch(()=>toast("مقدرتش أحفظ، اتأكد إنك نشرت القواعد الجديدة")); break; }
    case "adm-deluser": { const u = (U.admin.users||[]).find(x=>x.id===v); if (!u || v === UID) break;
      sheet(`<h2>🗑️ تمسح حساب ${esc(u.name||"")}؟</h2><p class="muted">@${esc(u.username||"")}</p><p>الحساب وكل بياناته هيتمسحوا <b>نهائي</b> ومش هيرجعوا: الفلوس والمهام والمذاكرة والمود ودفتر حكاياتي والرسايل. وهيتفك الربط مع شريكه ويخرج من الجروبات.</p><p class="muted small">هيتقفل على طول، ويتمسح خالص خلال 5 دقايق.</p><div class="form"><button class="btn danger" data-act="adm-deluser-ok" data-v="${esc(u.id)}">أيوه امسحه نهائي</button><button class="btn ghost" data-act="close">لأ</button></div>`); break; }
    case "adm-deluser-ok": { const A = U.admin, u = (A.users||[]).find(x=>x.id===v); if (!u) break;
      Promise.all([fb.set(`users/${v}`, {banned:true, deleting:true}), fb.set(`deleteRequests/${v}`, {username:u.username||"", name:u.name||"", at:Date.now(), status:"new"}, false)])
        .then(() => { A.users = A.users.filter(x=>x.id!==v); A.sel = null; A.st = null; closeSheet(); render(); toast("اتقفل، وهيتمسح خالص خلال 5 دقايق 🗑️"); })
        .catch(() => toast("مقدرتش، اتأكد إنك نشرت قواعد Firebase الجديدة")); break; }
    case "adm-delgroup": { const g = (U.admin.groups||[]).find(x=>x.id===U.admin.gsel); if (!g) break;
      sheet(`<h2>🗑️ تمسح جروب ${esc(g.name||"")}؟</h2><p>الجروب وكل رسايله هيتمسحوا نهائي، والأعضاء مش هيشوفوه تاني.</p><div class="form"><button class="btn danger" data-act="adm-delgroup-ok">أيوه امسحه</button><button class="btn ghost" data-act="close">لأ</button></div>`); break; }
    case "adm-delgroup-ok": { const A = U.admin, g = (A.groups||[]).find(x=>x.id===A.gsel); if (!g) break; closeSheet(); toast("بنمسح…");
      fb.list(`groups/${g.id}/msgs`, 5000).then(ms => Promise.all(ms.map(m => fb.del(`groups/${g.id}/msgs/${m.id}`))))
        .then(() => g.code ? fb.del(`groupCodes/${g.code}`).catch(()=>{}) : null)
        .then(() => fb.del(`groups/${g.id}`))
        .then(() => { A.groups = A.groups.filter(x=>x.id!==g.id); A.gsel = null; A.gmsgs = null; render(); toast("اتمسح الجروب 🗑️"); })
        .catch(() => toast("مقدرتش أمسح الجروب")); break; }
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
    case "astage": U.stage = v; b.parentElement.querySelectorAll("button").forEach(x=>x.setAttribute("aria-pressed", x.dataset.v===v)); break;
    case "arel": U.rel = v; b.parentElement.querySelectorAll("button").forEach(x=>x.setAttribute("aria-pressed", x.dataset.v===v)); break;
    case "set-lang": { const from = LANG(); try { localStorage.setItem("nw-lang", v); } catch(e){} if (S) { if (S.user && from !== v) swapDefaultMsgs(S, S.user.gender, S.user.religion, from, v); S.lang = v; S._love = null; S._pmsg = null; save(); } closeSheet(); render(); break; }
    case "welcome-go": $("#layer").innerHTML = ""; startupChecks(); break;
    case "dmode": U.dmode = v; if (v !== "friends"){ openGroup(null); openFriend(null); } else render(); if (v === "us") scrollChat(); break;
    case "g-new": sheet(`<h2>جروب جديد 👯</h2><form class="form" data-form="gnew"><label class="f">اسم الجروب<input class="in" id="g-name" maxlength="40" required placeholder="البنات 💗"></label><button class="btn" type="submit">اعملي الجروب</button></form>`); break;
    case "g-join": sheet(`<h2>ادخلي جروب</h2><form class="form" data-form="gjoin"><label class="f">كود الجروب<input class="in num" id="g-code" dir="ltr" maxlength="8" required placeholder="ABC123"></label><button class="btn" type="submit">ادخلي</button></form>`); break;
    case "g-open": openGroup(v); break;
    case "fr-open": openFriend(v); break;
    case "fr-back": openFriend(null); break;
    case "fr-add": {
      const ensure = ME.fcode ? Promise.resolve(ME.fcode) : (() => { const c = genCode(); return fb.set(`friendCodes/${c}`, {uid:UID, name:ME.name}, false).then(() => saveMe({fcode:c})).then(() => c); })();
      ensure.then(code => sheet(`<h2>👭 ضيفي حد من صحابك</h2>
        <p class="muted small">ابعتي الكود بتاعك لصحابك، أو اكتبي الكود بتاعهم.</p>
        <div class="item"><span class="ic">🔗</span><div class="grow"><div class="t num" dir="ltr">${esc(code)}</div><div class="s">كود الصحاب بتاعك (غير كود الشريك)</div></div><button class="mini" data-act="copy" data-v="${esc(code)}">نسخ</button></div>
        <form class="row" data-form="fradd" style="margin-top:12px"><input class="in num" id="fr-code" dir="ltr" maxlength="8" required placeholder="ABC123" autocomplete="off" aria-label="كود الصاحب"><button class="btn small" type="submit">ضيفي</button></form>
        <p class="muted small" style="margin-top:10px">🔒 صحابك بيشوفوا بس "عملتي إيه النهارده" اللي بتدوسي عليه، وشاتكم. مش بيشوفوا دفترك ولا فلوسك ولا مذاكرتك ولا أي حاجة تانية.</p>`)).catch(() => toast("مقدرتش، اتأكدي من النت"));
      break;
    }
    case "fr-accept": { const f = FR.list.find(x=>x.id===v); if (!f) break; fb.set(`friends/${v}`, {status:"ok", names:Object.assign({}, f.names||{}, {[UID]:ME.name}), topics:Object.assign({}, f.topics||{}, {[UID]:ME.ntfy||""})}).then(()=>toast("بقيتوا صحاب 👭")).catch(()=>toast("مقدرتش")); break; }
    case "fr-remove": { const f = FR.list.find(x=>x.id===v); if (!f) break; const nm = esc((f.names||{})[friendOf(f)] || "");
      sheet(`<h2>${f.status === "ok" ? "تشيلي " + nm + " من صحابك؟" : "تلغي الطلب؟"}</h2><div class="form"><button class="btn danger" data-act="fr-remove-ok" data-v="${esc(v)}">أيوه</button><button class="btn ghost" data-act="close">لأ</button></div>`); break; }
    case "fr-remove-ok": closeSheet(); if (FR.open === v) openFriend(null); fb.del(`friends/${v}`).catch(()=>toast("مقدرتش")); break;
    case "fr-report": { const m = FR.msgs.find(x=>x.id===v); if (!m) break; fb.add("reports", {kind:"user", path:`friends/${FR.open}/msgs/${v}`, owner:m.from, author:m.from, by:UID, text:m.text}).then(()=>toast("اتبعت البلاغ 🚩")).catch(()=>{}); break; }
    case "act-do": {
      const mine = FR.mine || {items:[], log:[]}, it = (mine.items||[]).find(x=>x.id===v); if (!it) break;
      if (todayLog(mine).some(l => l.id.startsWith(it.id + ":"))){ toast("ظاهرة لصحابك خلاص ✅"); break; }
      const log = (mine.log||[]).concat({id:it.id + ":" + uid(), e:it.e, t:it.t, ts:Date.now()}).slice(-60);
      FR.mine = Object.assign({}, mine, {log}); render();
      fb.set(`act/${UID}`, {items:mine.items||[], log, name:ME.name, seen:Date.now()}, false).then(()=>toast(`${it.e} صحابك هيشوفوها`)).catch(()=>toast("مقدرتش أحفظ")); break; }
    case "act-undo": { const mine = FR.mine || {items:[], log:[]}, log = (mine.log||[]).filter(l => l.id !== v); FR.mine = Object.assign({}, mine, {log}); render(); fb.set(`act/${UID}`, {items:mine.items||[], log, name:ME.name, seen:Date.now()}, false).catch(()=>{}); break; }
    case "act-add": sheet(`<h2>✨ ضيفي حاجة بتعمليها</h2>
      <div class="acts" style="margin-bottom:12px">${ACT_PRESETS.filter(([e,t]) => !((FR.mine||{}).items||[]).some(x=>x.t===t)).map(([e,t]) => `<button class="actb" data-act="act-preset" data-v="${esc(e + "|" + t)}">${e} ${t}</button>`).join("")}</div>
      <form class="form" data-form="actnew"><div class="row"><input class="in center" id="act-e" maxlength="4" style="width:70px;flex:none" placeholder="⭐" aria-label="إيموجي"><input class="in" id="act-t" maxlength="30" required placeholder="مثلًا: عملت سكين كير" aria-label="الحاجة"></div><button class="btn" type="submit">ضيفي</button></form>`); break;
    case "act-preset": { const [e, t] = v.split("|"); actSaveItems(((FR.mine||{}).items||[]).concat({id:uid(), e, t})); act === "act-preset" && closeSheet(); break; }
    case "act-edit": sheet(`<h2>✏️ الحاجات بتاعتك</h2><ul class="list">${((FR.mine||{}).items||[]).map(x => `<li class="item"><span class="ic">${esc(x.e)}</span><div class="grow t">${esc(x.t)}</div><button class="x" data-act="act-del" data-v="${esc(x.id)}" aria-label="امسحي">🗑️</button></li>`).join("")}</ul>`); break;
    case "act-del": { actSaveItems(((FR.mine||{}).items||[]).filter(x=>x.id!==v)); closeSheet(); break; }
    case "g-back": openGroup(null); break;
    case "g-info": { const g = GR.list.find(x=>x.id===GR.open); if (!g) break; sheet(`<h2>${esc(g.name)}</h2><p class="muted small" style="margin:-6px 0 10px">ابعتي الكود ده لصحابك علشان يدخلوا الجروب</p>
      <div class="item"><span class="ic">🔗</span><div class="grow"><div class="t num" dir="ltr">${esc(g.code)}</div><div class="s">كود الجروب</div></div><button class="mini" data-act="copy" data-v="${esc(g.code)}">نسخ</button></div>
      <h3 style="margin:14px 0 8px">الأعضاء</h3><ul class="list">${Object.values(g.names||{}).map(n=>`<li class="item"><span class="ic">👤</span><div class="grow t">${esc(n)}</div></li>`).join("")}</ul>
      <button class="btn ghost block" style="margin-top:14px" data-act="g-leave" data-v="${esc(g.id)}">اخرجي من الجروب</button>`); break; }
    case "g-leave": { fb.leaveArray(`groups/${v}`, "members", UID).then(()=>{ closeSheet(); openGroup(null); toast("خرجتي من الجروب"); }).catch(()=>toast("مقدرتش أخرجك، جرّبي تاني")); break; }
    case "g-report": { const m = GR.msgs.find(x=>x.id===v); if (!m) break; fb.add("reports", {kind:"report", path:`groups/${GR.open}/msgs/${v}`, owner:null, author:m.from, by:UID, text:m.text}).then(()=>toast("اتبعت البلاغ 🚩")).catch(()=>toast("مقدرتش أبعت البلاغ")); break; }
    case "showpw": { const t = b, i = t.parentNode.querySelector("input"); const show = i.type === "password"; i.type = show ? "text" : "password"; t.innerHTML = show ? EYE_OPEN : EYE_SHUT; t.setAttribute("aria-label", show ? "إخفاء الباسورد" : "إظهار الباسورد"); i.focus(); break; }
    case "feedback": U.fb = {stars:5, kind:"review"}; feedbackSheet(); break;
    case "fb-star": { const t = ($("#fb-text")||{}).value || ""; U.fb.stars = +v; feedbackSheet(); $("#fb-text").value = t; break; }
    case "fb-kind": { const t = ($("#fb-text")||{}).value || ""; U.fb.kind = v; feedbackSheet(); $("#fb-text").value = t; break; }
    case "adm-special": { const t = ($("#adm-special")||{}).value.trim(); const u = U.admin.users.find(x=>x.id===v); fb.set(`users/${v}`, {special:t}).then(()=>{ if (u) u.special = t; toast("اتحفظت الرسالة 💌"); }).catch(()=>toast("مقدرتش أحفظ")); break; }
    case "adm-hide-review": if (v) fb.del(`publicReviews/${v}`).then(()=>toast("اتشال من الموقع")).catch(()=>toast("مقدرتش")); break;
    case "adm-fb-del": fb.del(`feedback/${v}`).then(()=>{ U.admin.feedback = U.admin.feedback.filter(x=>x.id!==v); render(); }); break;
    case "set-cur": S.currency = v; save(); render(); break;
    case "clock": S.clock = v; save(); render(); break;
    case "add-work": workSheet(); break;
    case "azkar": azkarSheet(v); break;
    case "zikr": { const i = +v, L2 = U.az.left; if (L2[i] > 0){ L2[i]--; if (navigator.vibrate) navigator.vibrate(L2[i] ? 15 : [30, 40, 30]); } if (L2.every(n => n === 0)){ S.azkarDone = Object.assign({}, S.azkarDone, {[U.az.kind + dkey()]: true}); save(); } azkarSheet(U.az.kind); break; }
    case "pray-opt": S.pray = Object.assign({on:true, remind:true, azkar:true, kahf:true, fast:false}, S.pray); S.pray[v] = v === "fast" ? !S.pray.fast : S.pray[v] === false; save(); render(); if (v === "fast") toast(S.pray.fast ? "تمام، هنفكّرك بالليل قبل الاثنين والخميس 🌙" : "اتقفل"); break;
    case "nudge": S.nudge = {every:+v}; save(); render(); toast(+v ? "تمام، هنفكّرك ⏰" : "اتقفل"); break;
    case "loc-gps": {
      if (!navigator.geolocation){ toast("الجهاز ده مش بيدي المكان، اختاري مدينتك من القايمة"); break; }
      toast("بنحدد مكانك… 📍");
      navigator.geolocation.getCurrentPosition(pos => { S.loc = {name:"مكاني الحالي", lat:+pos.coords.latitude.toFixed(4), lng:+pos.coords.longitude.toFixed(4)}; save(); render(); toast("✅ مواعيد الصلاة بقت على حسب مكانك"); },
        () => toast("مقدرتش أعرف مكانك، اختاري مدينتك من القايمة"), {timeout:15000, maximumAge:36e5});
      break; }
    case "work-done": { const w = (S.work||[]).find(x=>x.id===v); if (!w) break; w.done = !w.done; save(); render(); if (w.done) toast(L.done + " · " + pick(MS("done"))); break; }
    case "work-del": S.work = (S.work||[]).filter(x=>x.id!==v); save(); render(); break;
    case "work-clear": S.work = (S.work||[]).filter(x=>!x.done); save(); render(); break;
    case "set-stage": S.stage = v; save(); render(); toast("اتظبط ✅"); break;
    case "set-rel": { if (!CLOUD) { S.user.religion = v; render(); break; } saveMe({religion:v}); S.user.religion = v; render(); toast("اتحفظ ✅"); break; }
    case "agender": { const keepVals = ["a-name","a-user","a-pass"].map(id => (document.getElementById(id)||{}).value || ""); U.ag = v; render(); ["a-name","a-user","a-pass"].forEach((id,i) => { const el = document.getElementById(id); if (el) el.value = keepVals[i]; }); break; }
    case "gedit": openGlobalMsgs(v); break;
    case "notif": notifSheet(); break;
    case "notif-test": { const t = ME && ME.ntfy; if (!t) break; fetch("https://ntfy.sh/" + t + "?title=" + encodeURIComponent("Nono's World 🔔") + "&tags=tada", {method:"POST", body:"الإشعارات شغالة ✅ كده كل رسايلك هتوصلك"}).then(()=>toast("اتبعت، لو وصلك يبقى كله تمام ✅")).catch(()=>toast("مقدرتش أبعت، اتأكدي من النت")); break; }
    case "notif-ok": try { localStorage.setItem("nw-ntfy-ok", "1"); } catch(e){} closeSheet(); render(); toast("تمام، الإشعارات هتوصلك 🔔"); if ("Notification" in window && Notification.permission === "default") Notification.requestPermission().catch(()=>{}); break;
    case "notif-later": try { localStorage.setItem("nw-ntfy-snooze", String(Date.now() + 864e5)); } catch(e){} closeSheet(); break;
    case "reset-msgs": { const T = msgsTarget(); T.msgs = U.edit === "global" ? defMsgs(U.gEdit, "muslim", "ar") : T === P && P && P.user ? defMsgs(P.user.gender, P.user.religion) : defMsgs(S.user.gender, S.user.religion); saveMsgs(); secretSheet(); toast("رجعت الرسايل الأصلية"); break; }
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
    case "inc": {
      const amt = parseFloat(val("i-amt")); if (!(amt > 0)) return;
      S.money.incomes = (S.money.incomes || []).concat({id:uid(), amt, note:val("i-note"), date:dkey()}); save(); closeSheet(); render();
      toast("اتضافت ✅ بقى فاضلّك " + fmt(moneyInfo().left)); break;
    }
    case "exp": {
      const amt = parseFloat(val("e-amt")); if (!(amt > 0)) return;
      S.money.expenses.push({id:uid(), amt, cat:S._cat||"food", note:val("e-note"), date:k}); save(); closeSheet(); render();
      const mi = moneyInfo();
      if (mi.state === "out") message("🙆🏽‍♀️", L.left.out + (loveOn() ? " … خلّي بالك يا بسبوسة" : " … خلّي بالك"), "الفلوس");
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
      message(p>=75?"🌟":p>=50?"🙂":"🫂", pick(MS(grp)), (!before && examGood()) ? L.examsGood + (loveOn() ? " يا نونو!" : "!") : Math.round(p) + "٪");
      break;
    }
    case "diary": {
      const t = val("diarytext"); if (!t) return;
      const cat = diaryReply(t), id = uid();
      const pool = cat.startsWith("rule:") ? ((S.rules||[]).concat(globalRules()).find(r=>"rule:"+r.id===cat)||{}).replies : MS(cat);
      const ans = pick(pool && pool.length ? pool : MS("d_other"));
      S.diary.push({id, chat:S.chatId, ts:Date.now(), text:t, cat, reply:null, pending:ans}); save(); render(); scrollChat();
      if (CLOUD && P && P.linked && P.user && (S.share||{}).diary !== false && cat !== "d_sad") pushTo(P.user.ntfy, `📔 ${S.user.name}`, t);
      if (CLOUD && cat === "d_sad") notifyPartner(`${S.user.name} كتب/كتبت حكاية زعلانة 📔 كلّمه/كلّمها 🤍`);
      setTimeout(() => { const e = S.diary.find(x=>x.id===id); if (!e) return; e.reply = e.pending; delete e.pending; save(); if (S.tab==="diary"){ render(); scrollChat(); setTimeout(()=>$("#diarytext")?.focus(),30); } }, 1200 + Math.random()*900);
      break;
    }
    case "psend": {
      const t = val("ps-text"); if (!t) return;
      if (CLOUD && P && P.linked){ const id = uid(), e = {id, chat:P.chatId||"c0", ts:Date.now(), from:"him", text:t}; fb.set(`u/${P.uid}/chat/${id}`, e, false).then(()=>{ moderate(e, `u/${P.uid}/chat/${id}`, P.uid); pushTo(P.user && P.user.ntfy, `💌 ${S.user.name}`, t); }).catch(()=>toast("مقدرتش أبعت")); closeSheet(); toast("وصلت 💌"); break; }
      closeSheet(); toast("ده عرض بس 👀"); break;
    }
    case "dur": {
      const f = Math.round(+val("d-focus")), r = Math.round(+val("d-rest")), err = $("#d-err");
      const bad = msg => { err.textContent = msg; err.style.display = "block"; };
      if (!(f >= 10)) return bad("المذاكرة لازم تبقى 10 دقايق على الأقل 📚");
      if (!(r >= 1)) return bad("البريك لازم يبقى دقيقة على الأقل ☕");
      if (r > f) return bad("البريك ميزيدش عن وقت المذاكرة 😏");
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
      message("🤍", pick(MS("period")) || "ألف سلامة عليكي", loveOn() ? "منه 💌" : "🤍");
      break;
    }
    case "gnew": {
      const name = val("g-name"); if (!name) return;
      const gid = uid() + uid(), code = genCode();
      fb.set(`groups/${gid}`, {name, owner:UID, members:[UID], names:{[UID]:ME.name}, topics:{[UID]:ME.ntfy||""}, code, at:Date.now()}, false)
        .then(() => fb.set(`groupCodes/${code}`, {gid, name}, false))
        .then(() => { closeSheet(); U.dmode = "friends"; openGroup(gid); toast("اتعمل الجروب، ابعتي الكود لصحابك 💌"); })
        .catch(() => toast("مقدرتش أعمل الجروب، جرّبي تاني"));
      break;
    }
    case "gjoin": {
      const code = val("g-code").toUpperCase(); if (!code) return;
      fb.get(`groupCodes/${code}`).then(inv => {
        if (!inv || !inv.gid) return toast("الكود ده مش موجود 🤔");
        return fb.joinArray(`groups/${inv.gid}`, "members", UID, {["names." + UID]: ME.name}).then(() => { closeSheet(); U.dmode = "friends"; openGroup(inv.gid); toast("أهلًا بيكي في " + inv.name + " 👯"); });
      }).catch(() => toast("مقدرتش أدخلك، جرّبي تاني"));
      break;
    }
    case "fradd": {
      const code = val("fr-code").toUpperCase(); if (!code) return;
      fb.get(`friendCodes/${code}`).then(inv => {
        if (!inv || !inv.uid) return toast("الكود ده مش موجود 🤔");
        if (inv.uid === UID) return toast("ده الكود بتاعك إنتي 😅");
        const pid = coupleId(UID, inv.uid), ex = FR.list.find(x=>x.id===pid);
        if (ex && ex.status === "ok") return toast("إنتوا صحاب أصلًا 👭");
        if (ex && ex.from !== UID) return fb.set(`friends/${pid}`, {status:"ok", names:Object.assign({}, ex.names||{}, {[UID]:ME.name}), topics:Object.assign({}, ex.topics||{}, {[UID]:ME.ntfy||""})}).then(()=>{ closeSheet(); toast("بقيتوا صحاب 👭"); });
        return fb.set(`friends/${pid}`, {members:[UID, inv.uid].sort(), names:{[UID]:ME.name}, topics:{[UID]:ME.ntfy||""}, from:UID, status:"pending", at:Date.now()}, false)
          .then(() => { closeSheet(); toast("اتبعت الطلب لـ " + inv.name + " 💌"); });
      }).catch(() => toast("مقدرتش، جرّبي تاني"));
      break;
    }
    case "actnew": { const t = val("act-t"); if (!t) return; const e = val("act-e") || "⭐"; actSaveItems(((FR.mine||{}).items||[]).concat({id:uid(), e, t})); closeSheet(); break; }
    case "frmsg": {
      const t = val("ftext"); const f = FR.list.find(x=>x.id===FR.open); if (!t || !f) return;
      const id = uid() + uid(), m = {id, from:UID, name:ME.name, text:t, ts:Date.now()}, path = `friends/${f.id}/msgs/${id}`;
      FR.msgs = FR.msgs.concat(m); keepTyping(render); $("#ftext").value = ""; $("#ftext").focus(); scrollChat();
      fb.set(path, m, false).then(() => { moderate(m, path, UID); pushTo((f.topics||{})[friendOf(f)], `👭 ${ME.name}`, t); }).catch(() => { FR.msgs = FR.msgs.filter(x=>x.id!==id); render(); toast("مقدرتش أبعت"); });
      break;
    }
    case "cmsg": {
      const t = val("ctext"); if (!t || !P || !P.linked || !CP.cid) return;
      const id = uid() + uid(), m = {id, from:UID, text:t, ts:Date.now()}, path = `couples/${CP.cid}/msgs/${id}`;
      CP.msgs = CP.msgs.concat(m); keepTyping(render); $("#ctext").value = ""; $("#ctext").focus(); scrollChat();
      fb.set(path, m, false).then(() => { moderate(m, path, UID); pushTo(P.user && P.user.ntfy, `💞 ${S.user.name}`, t); }).catch(() => { CP.msgs = CP.msgs.filter(x=>x.id!==id); render(); toast("مقدرتش أبعت، اتأكدي من النت"); });
      break;
    }
    case "gmsg": {
      const t = val("gtext"); if (!t || !GR.open) return;
      const id = uid() + uid(), m = {id, from:UID, name:ME.name, text:t, ts:Date.now()}, path = `groups/${GR.open}/msgs/${id}`;
      GR.msgs = GR.msgs.concat(m); keepTyping(render); $("#gtext").value = ""; scrollChat();
      fb.set(path, m, false).then(() => { moderate(m, path, null); SEEN.mine.add(m.ts); const g = GR.list.find(x=>x.id===GR.open) || {}; fb.set(`groups/${GR.open}`, {last:m.ts, lastText:(ME.name + ": " + t).slice(0,70)}).catch(()=>{}); Object.entries(g.topics||{}).forEach(([k,tp]) => { if (k !== UID && (g.members||[]).includes(k)) pushTo(tp, `👭 ${g.name||""}`, ME.name + ": " + t); }); }).catch(() => toast("مقدرتش أبعت"));
      break;
    }
    case "feedback": {
      const text = val("fb-text"); if (!text && U.fb.kind !== "review") return;
      const f = U.fb, pub = f.kind === "review" && $("#fb-public") && $("#fb-public").checked;
      const btn = $("#fb-btn"); if (btn){ btn.disabled = true; btn.textContent = "لحظة…"; }
      const first = String(ME.name || "").split(/\s+/)[0].slice(0, 20);
      const clean = !BAD.some(w => norm(text.toLowerCase()).includes(norm(w)));
      fb.add("feedback", Object.assign({uid:UID, name:ME.name, kind:f.kind, text}, f.kind === "review" ? {stars:f.stars} : {}))
        .then(() => pub && clean ? fb.set(`publicReviews/${UID}`, {name:first, stars:f.stars, text, g:ME.gender || "f", at:Date.now()}, false) : null)
        .then(() => { closeSheet(); message("💗", f.kind === "complaint" ? "وصلت شكوتك، وهنحاول نحلها بسرعة" : f.kind === "idea" ? "شكرًا على الاقتراح، هنشوفه" : "شكرًا على رأيك، فرّحتينا", "Nono's World"); })
        .catch(() => { toast("مقدرتش أبعت، جرّبي تاني"); if (btn){ btn.disabled = false; btn.textContent = "ابعتي"; } });
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
      f.querySelectorAll("[data-msg]").forEach(t => { const arr = t.value.split("\n").map(s=>s.trim()).filter(Boolean); T.msgs[t.dataset.msg] = arr.length ? arr : (U.edit === "global" ? defMsgs(U.gEdit, "muslim", "ar") : T === P && P.user ? defMsgs(P.user.gender, P.user.religion) : defMsgs(S.user.gender, S.user.religion))[t.dataset.msg]; });
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
      if (!/^[A-Za-z0-9_.]{3,20}$/.test(user)){ const er = $("#a-err"); er.textContent = gx("اسم المستخدم من 3 لـ 20 حرف إنجليزي أو رقم", authBoy()); er.style.display = "block"; return; }
      const nm = val("a-name") || user;
      U.busy = true; render();
      const p = U.authMode === "login" ? fb.signIn(user, pass) : signUp(nm, user, pass, U.ag || "f", U.rel || "muslim");
      p.then(() => { U.busy = false; }).catch(err => { U.busy = false; render(); const er = $("#a-err"); if (er){ er.textContent = gx(authError(err), authBoy()); er.style.display = "block"; } });
      break;
    }
    case "code": { const c = val("pcode"); if (c) sendCode(c); break; }
    case "forgot": {
      const u = val("fg-user").toLowerCase(), c = val("fg-contact"); if (!u || !c) return;
      const fbtn = $("#fg-btn"); if (fbtn){ fbtn.disabled = true; fbtn.textContent = isEN() ? "One sec…" : "لحظة…"; }
      fb.add("resetRequests", {username:u, contact:c, note:val("fg-note"), status:"new"}).then(()=>{ closeSheet(); message("💌", "الطلب وصل، هيكلّمك قريب ويبعتلك باسورد مؤقت", "🔑"); }).catch(()=>{ toast("مقدرتش أبعت الطلب، اتأكدي من النت"); const fb2 = $("#fg-btn"); if (fb2){ fb2.disabled = false; fb2.textContent = isEN() ? "Send request" : "ابعتي الطلب"; } });
      break;
    }
    case "work": { const t = val("w-title"); if (!t) return; const due = (document.getElementById("w-due")||{}).value || ""; S.work = (S.work||[]).concat({id:uid(), title:t, due, done:false}); save(); closeSheet(); render(); toast("اتضاف 💼"); break; }
    case "uname": {
      const n = val("un-new").toLowerCase();
      if (!/^[a-z0-9_.]{3,20}$/.test(n)) return toast("اليوزر من 3 لـ 20 حرف إنجليزي أو رقم");
      if (n === ME.username) return toast("ده اليوزر بتاعك أصلًا 😅");
      fb.set(`usernameRequests/${UID}`, {username:n, status:"new", at:Date.now()}, false)
        .then(() => { U.unReq = {username:n, status:"new"}; render(); toast("تمام، هيتغيّر خلال دقايق ⏳"); })
        .catch(() => toast("مقدرتش، جرّبي تاني"));
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
  if (e.target.id === "wake"){ S.alarm.wake = e.target.value; save(); toast("هصحّيكي الساعة " + tf(e.target.value) + " ⏰"); }
  if (e.target.id === "loc-city" && e.target.value){ const c = CITIES.find(x => x[0] === e.target.value); if (c){ S.loc = {name:c[0], lat:c[1], lng:c[2]}; save(); render(); toast("✅ مواعيد الصلاة بقت على " + c[0]); } }
});
document.addEventListener("keydown", e => {
  if (e.key === "Escape" && !sheetLocked) closeSheet();
  if ((e.target.id === "diarytext" || e.target.id === "gtext" || e.target.id === "ctext" || e.target.id === "ftext") && e.key === "Enter" && !e.shiftKey && !matchMedia("(pointer:coarse)").matches){ e.preventDefault(); e.target.form.requestSubmit(); }
});
document.addEventListener("input", e => { if (e.target.id === "diarytext" || e.target.id === "gtext" || e.target.id === "ctext" || e.target.id === "ftext"){ e.target.style.height = "auto"; e.target.style.height = Math.min(140, e.target.scrollHeight) + "px"; } });


/* ================= prayer times, adhan, azkar, Kahf ================= */
const myLoc = () => (S && S.loc && typeof S.loc.lat === "number") ? S.loc : {name:"القاهرة", lat:30.0444, lng:31.2357, guess:true};
const timesFor = (d = new Date()) => { const l = myLoc(); return prayerTimes(d, l.lat, l.lng); };
const hhmm = d => tf(d);
function nextPrayer(){
  const now = new Date();
  for (const off of [0, 1]){ const d = addDays(now, off), t = timesFor(d);
    for (const [p, n] of PRAYERS) if (t[p] > now) return {p, n, at:t[p]}; }
  return null;
}
const inMins = ms => { const m = Math.max(0, Math.round(ms / 6e4)), h = Math.floor(m / 60), r = m % 60; return h ? `${h} ساعة${r ? ` و${r} دقيقة` : ""}` : `${r} دقيقة`; };
const AZKAR = {
  m:[
    ["آية الكرسي: اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ", 1],
    ["قُلْ هُوَ اللَّهُ أَحَدٌ، اللَّهُ الصَّمَدُ، لَمْ يَلِدْ وَلَمْ يُولَدْ، وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ", 3],
    ["قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ، مِن شَرِّ مَا خَلَقَ، وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ، وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ، وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ", 3],
    ["قُلْ أَعُوذُ بِرَبِّ النَّاسِ، مَلِكِ النَّاسِ، إِلَٰهِ النَّاسِ، مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ، الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ، مِنَ الْجِنَّةِ وَالنَّاسِ", 3],
    ["أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَٰذَا الْيَوْمِ وَخَيْرَ مَا بَعْدَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَٰذَا الْيَوْمِ وَشَرِّ مَا بَعْدَهُ، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ", 1],
    ["اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ", 1],
    ["سيد الاستغفار: اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَٰهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ", 1],
    ["رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا", 3],
    ["بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ", 3],
    ["اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لَا إِلَٰهَ إِلَّا أَنْتَ", 3],
    ["حَسْبِيَ اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ، عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ", 7],
    ["يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ، أَصْلِحْ لِي شَأْنِي كُلَّهُ، وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ", 1],
    ["اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ", 10],
    ["سُبْحَانَ اللَّهِ وَبِحَمْدِهِ", 100]
  ]
};
AZKAR.e = AZKAR.m.map(([t, n]) => [t
  .replace("أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ", "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ")
  .replace("خَيْرَ مَا فِي هَٰذَا الْيَوْمِ وَخَيْرَ مَا بَعْدَهُ", "خَيْرَ مَا فِي هَٰذِهِ اللَّيْلَةِ وَخَيْرَ مَا بَعْدَهَا")
  .replace("شَرِّ مَا فِي هَٰذَا الْيَوْمِ وَشَرِّ مَا بَعْدَهُ", "شَرِّ مَا فِي هَٰذِهِ اللَّيْلَةِ وَشَرِّ مَا بَعْدَهَا")
  .replace("اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ", "اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ"), n]);
AZKAR.e.splice(9, 0, ["أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ", 3]);
const azkarNow = () => { const t = timesFor(); return new Date() >= t.asr || new Date() < t.fajr ? "e" : "m"; };
function azkarSheet(kind){
  U.az = U.az && U.az.kind === kind && U.az.day === dkey() ? U.az : {kind, day:dkey(), left:AZKAR[kind].map(x => x[1])};
  const left = U.az.left, done = left.filter(n => n === 0).length;
  sheet(`<h2>📿 ${kind === "m" ? "أذكار الصباح" : "أذكار المساء"}</h2><p class="muted small" style="margin:-6px 0 10px">دوسي على الذكر كل ما تقوليه، والعدد بيقل لوحده · <b class="num">${done}</b> من <b class="num">${left.length}</b></p>
    <div class="azkar">${AZKAR[kind].map(([t, n], i) => `<button class="zikr ${left[i] === 0 ? "done" : ""}" data-act="zikr" data-v="${i}"><span class="zt">${escP(t)}</span><span class="zn num">${left[i] === 0 ? "✓" : left[i]}</span></button>`).join("")}</div>
    ${done === left.length ? `<div class="notice" style="margin-top:10px">تقبّل الله 🤍</div>` : ""}`);
}
/* hadith about prayer, shown with the adhan and with the "did you pray?" reminder */
const HADITH = [
  ["سُئل النبي ﷺ: أي العمل أحب إلى الله؟ قال: «الصلاة على وقتها»", "متفق عليه"],
  ["«أرأيتم لو أن نهرًا بباب أحدكم يغتسل فيه كل يوم خمسًا، هل يبقى من درنه شيء؟» قالوا: لا، قال: «فذلك مثل الصلوات الخمس، يمحو الله بهن الخطايا»", "متفق عليه"],
  ["«الصلوات الخمس، والجمعة إلى الجمعة، كفارة لما بينهن ما لم تُغشَ الكبائر»", "رواه مسلم"],
  ["«أقرب ما يكون العبد من ربه وهو ساجد، فأكثروا الدعاء»", "رواه مسلم"],
  ["«من صلى البردين دخل الجنة» (الفجر والعصر)", "متفق عليه"],
  ["«من صلى الصبح فهو في ذمة الله»", "رواه مسلم"],
  ["«ما من امرئ مسلم تحضره صلاة مكتوبة فيحسن وضوءها وخشوعها وركوعها إلا كانت كفارة لما قبلها من الذنوب ما لم يؤتِ كبيرة، وذلك الدهر كله»", "رواه مسلم"],
  ["«من صلى العشاء في جماعة فكأنما قام نصف الليل، ومن صلى الصبح في جماعة فكأنما صلى الليل كله»", "رواه مسلم"],
  ["«أول ما يحاسب به العبد يوم القيامة الصلاة، فإن صلحت صلح سائر عمله، وإن فسدت فسد سائر عمله»", "رواه الطبراني وصححه الألباني"],
  ["قال النبي ﷺ: «وجُعلت قرة عيني في الصلاة»", "رواه النسائي"],
  ["قال النبي ﷺ: «يا بلال، أقم الصلاة، أرحنا بها»", "رواه أبو داود"]
];
/* period days: no adhan; instead, authentic hadiths on patience with pain and the reward that keeps being written */
const HADITH_SABR = [
  ["«ما يصيب المسلم من نصب ولا وصب ولا همّ ولا حزن ولا أذى ولا غمّ، حتى الشوكة يُشاكها، إلا كفّر الله بها من خطاياه»", "متفق عليه"],
  ["«إذا مرض العبد أو سافر، كُتب له مثل ما كان يعمل مقيمًا صحيحًا»", "رواه البخاري"],
  ["«عجبًا لأمر المؤمن، إن أمره كله خير… إن أصابته سراء شكر فكان خيرًا له، وإن أصابته ضراء صبر فكان خيرًا له»", "رواه مسلم"],
  ["قال النبي ﷺ لعائشة رضي الله عنها: «إن هذا أمر كتبه الله على بنات آدم»", "متفق عليه"],
  ["«من يُرد الله به خيرًا يُصب منه»", "رواه البخاري"],
  ["«ما يزال البلاء بالمؤمن والمؤمنة في نفسه وولده وماله حتى يلقى الله وما عليه خطيئة»", "رواه الترمذي وقال: حسن صحيح"],
  ["«ما من مسلم يصيبه أذى، مرض فما سواه، إلا حطّ الله به سيئاته كما تحطّ الشجرة ورقها»", "متفق عليه"]
];
const sabrAt = n => { const [t, src] = HADITH_SABR[((n % HADITH_SABR.length) + HADITH_SABR.length) % HADITH_SABR.length]; return `${t} (${src})`; };
const hadithAt = n => { const [t, src] = HADITH[((n % HADITH.length) + HADITH.length) % HADITH.length]; return `${t} (${src})`; };
function prayerEvents(from, to){
  const out = [], male = isMale(), G = t => isEN() ? t : gx(t, male);
  for (let day = new Date(from); day.getTime() <= to + 864e5; day = addDays(day, 1)){
    const d = new Date(day.getFullYear(), day.getMonth(), day.getDate()), k = dkey(d), t = timesFor(d);
    const period = S.user.gender !== "m" && cycleOn(k);
    const add = (key, at, title, body, kind) => { const ms = at.getTime(); if (ms > from && ms <= to) out.push({key, at:ms, title, body, kind}); };
    if (isMuslim() && S.pray && S.pray.on && !period){
      const dn = Math.floor(d.getTime() / 864e5);
      PRAYERS.forEach(([p, n], i) => {
        add(`ad-${k}-${p}`, t[p], `🕌 حان الآن موعد صلاة ${n}`, hadithAt(dn * 5 + i), "adhan");
        if (S.pray.remind && !(S.prayers[k] || {})[p]) add(`pr-${k}-${p}`, new Date(t[p].getTime() + 25 * 6e4), G(`صلّيتي ${n}؟ 🤍 لسه فيه وقت`), hadithAt(dn * 5 + i + 3), "remind");
      });
    }
    if (isMuslim() && S.pray && S.pray.on && period){
      const dn = Math.floor(d.getTime() / 864e5);
      PRAYERS.forEach(([p], i) => add(`sb-${k}-${p}`, t[p], "🤍 أجرك محفوظ", sabrAt(dn * 5 + i), "sabr"));
    }
    // Monday & Thursday fasting: a reminder the evening before (not when the period would be on)
    if (isMuslim() && S.pray && S.pray.fast && (d.getDay() === 0 || d.getDay() === 3)){
      const next = addDays(d, 1);
      if (!(S.user.gender !== "m" && cycleOn(dkey(next)))) add(`fast-${k}`, new Date(d.getFullYear(), d.getMonth(), d.getDate(), 21, 0), G(`🌙 بكرة ${d.getDay() === 0 ? "الاثنين" : "الخميس"}، ناوية تصومي؟`), "قال ﷺ: «تُعرض الأعمال يوم الاثنين والخميس، فأحب أن يُعرض عملي وأنا صائم» (رواه الترمذي) · " + G("متنسيش تتسحّري 🤍"), "fast");
    }
    if (isMuslim() && S.pray && S.pray.azkar){
      add(`az-m-${k}`, new Date(t.fajr.getTime() + 20 * 6e4), "📿 أذكار الصباح", G("صباح الخير 🤍 دقيقتين لنفسك، افتحي التطبيق وقوليها"), "azkar");
      add(`az-e-${k}`, new Date(t.asr.getTime() + 30 * 6e4), "📿 أذكار المساء", G("متنسيش أذكار المساء 🤍"), "azkar");
    }
    if (isMuslim() && S.pray && S.pray.kahf && d.getDay() === 5 && !period) add(`kahf-${k}`, new Date(d.getFullYear(), d.getMonth(), d.getDate(), 10, 0), "📖 النهارده الجمعة", G("متنسيش تقري سورة الكهف 🤍"), "kahf");
    const every = (S.nudge && S.nudge.every) || 0;
    if (every) for (let h = 10, i = 0; h <= 22; h += every, i++){
      const msgs = [["💸 صرفتي حاجة النهارده؟", "سجّليها علشان تعرفي فاضل معاكي كام"], ["✅ فاضل حاجة من مهامك؟", "ضيفيها أو علّمي على اللي خلص"], ["💰 جالك فلوس؟", "ضيفيها من \"جالي فلوس\" في صفحة الفلوس"], ["📝 يومك عامل إيه؟", "سجّلي مصاريفك ومهامك قبل ما تنسي"]];
      const [a, b] = msgs[(i + d.getDate()) % msgs.length];
      add(`nu-${k}-${h}`, new Date(d.getFullYear(), d.getMonth(), d.getDate(), h, 0), G(a), G(b), "nudge");
    }
  }
  return out.sort((a, b) => a.at - b.at);
}
/* iPhone: the app can't ring when it's closed, so the next day and a half goes to ntfy as delayed pushes */
function schedulePushIOS(){
  if (!CLOUD || !ME || !ME.ntfy || DEVICE() !== "ios" || !notifDone()) return;
  const now = Date.now(); let h = 0; try { h = +localStorage.getItem("nw-ntfy-h") || 0; } catch(e){}
  if (h > now + 12 * 36e5) return;
  const from = Math.max(h, now + 6e4), to = now + 36 * 36e5;
  prayerEvents(from, to).filter(e => e.kind !== "remind").slice(0, 40).forEach(e =>
    fetch(`https://ntfy.sh/${ME.ntfy}?title=${encodeURIComponent(e.title)}&delay=${Math.floor(e.at / 1000)}&tags=${e.kind === "adhan" ? "mosque" : "bell"}`, {method:"POST", body:e.body}).catch(()=>{}));
  try { localStorage.setItem("nw-ntfy-h", String(to)); } catch(e){}
}
/* ================= reminders & alarm (native on Android, in-app elsewhere) ================= */
const LN = () => window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LocalNotifications;
let lastSchedule = "";
// a new message arrived: system notification when the app is in the background, a small toast when it's open
let noticeId = 1000;
function notice(title, body){
  title = isEN() ? trRaw(title, isMale()) : title;
  if (document.visibilityState === "visible" && document.hasFocus()){ toast(title + " · " + String(body).slice(0, 60)); return; }
  const ln = LN();
  if (ln){ ln.schedule({notifications:[{id: noticeId++, title, body:String(body).slice(0, 200)}]}).catch(()=>{}); return; }
  try { if ("Notification" in window && Notification.permission === "granted"){ const n = new Notification(title, {body:String(body).slice(0, 200), icon:"icon-192.png", tag:"nw-msg"}); n.onclick = () => { window.focus(); n.close(); }; } } catch(e){}
}
// push to someone's phone even if their app is closed (ntfy)
const pushGap = {};
function pushTo(topic, title, body){
  if (!topic) return; const now = Date.now(); if (pushGap[topic] && now - pushGap[topic] < 2500) return; pushGap[topic] = now;
  fetch("https://ntfy.sh/" + topic + "?title=" + encodeURIComponent(title) + "&tags=speech_balloon", {method:"POST", body:String(body).slice(0, 300)}).catch(()=>{});
}
async function scheduleNative(){
  const ln = LN(); if (!ln || !S || !S.user) return;
  const plan = JSON.stringify([S.alarm, S.msgs.morning, S.loveOff, dkey(), new Date().getHours() >= 12, S.pray, S.loc, S.nudge, S.prayers[dkey()], S.cycle, S.user.religion]); if (plan === lastSchedule) return; lastSchedule = plan;
  try {
    const perm = await ln.requestPermissions(); if (perm.display !== "granted") return;
    try { await ln.createChannel({id:"alarm", name:"صحّيني", importance:5, sound:"default", vibration:true}); } catch(e){}
    try { await ln.createChannel({id:"adhan", name:"الأذان والأذكار", importance:5, sound:"default", vibration:true}); } catch(e){}
    try { await ln.createChannel({id:"nudge", name:"تذكير الفلوس والمهام", importance:3}); } catch(e){}
    const pending = await ln.getPending(); if (pending.notifications.length) await ln.cancel({notifications: pending.notifications.map(n=>({id:n.id}))});
    const at = t => { const [h,m] = t.split(":").map(Number); return {hour:h, minute:m}; };
    const list = [{id:1, title:"صحّيني ⏰", body:morningPick() || "صباح الخير ☀️", channelId:"alarm", schedule:{on:at(S.alarm.wake), allowWhileIdle:true}}];
    S.alarm.reminders.forEach((r,i) => list.push({id:10+i, title:"Nono's World 🌍", body:r.text, schedule:{on:at(r.time), allowWhileIdle:true}}));
    prayerEvents(Date.now() + 3e4, Date.now() + 48 * 36e5).slice(0, 50).forEach((e, i) => list.push({id:1000+i, title:e.title, body:e.body, channelId:e.kind === "nudge" ? "nudge" : "adhan", schedule:{at:new Date(e.at), allowWhileIdle:true}}));
    await ln.schedule({notifications:list});
  } catch(e){ console.warn("notify", e); }
}
function inAppReminders(){
  if (!S || !S.user || LN()) return;
  const now = new Date(), hm5 = now.toTimeString().slice(0,5), k = dkey(now);
  let fired = {}; try { fired = JSON.parse(localStorage.getItem("nw-fired") || "{}"); } catch(e){}
  const due = [];
  if (S.alarm.wake === hm5) due.push(["wake", "صحّيني ⏰", morningPick()]);
  S.alarm.reminders.forEach(r => { if (r.time === hm5) due.push([r.id, "Nono's World 🌍", r.text]); });
  prayerEvents(Date.now() - 9e4, Date.now()).forEach(e => due.push([e.key, e.title, e.body, true]));
  for (const x in fired) if (x.length > 12 && fired[x] < dkey(addDays(new Date(), -2))) delete fired[x];
  due.forEach(([id, title, body, ev]) => {
    if (fired[id] === k) return; fired[id] = k; if (ev) body = title + " · " + body;
    try { if ("Notification" in window && Notification.permission === "granted") new Notification(title, {body, icon:"icon-192.png"}); } catch(e){}
    if (id === "wake"){ beep(); setTimeout(beep, 1200); setTimeout(beep, 2400); }
    toast(body);
  });
  try { localStorage.setItem("nw-fired", JSON.stringify(fired)); } catch(e){}
}
setInterval(inAppReminders, 20000);
setInterval(scheduleNative, 15000);
setInterval(() => { try { schedulePushIOS(); } catch(e){} }, 10 * 6e4);
setTimeout(() => { try { schedulePushIOS(); } catch(e){} }, 8000);

/* ================= start ================= */
if (CLOUD){
  if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("sw.js").catch(()=>{});
  S = null; render();
  const t0 = Date.now();
  fb.onUser(u => { const wait = u ? Math.max(0, 700 - (Date.now() - t0)) : 0; setTimeout(() => { U.booting = false; boot(u).catch(e => { console.error(e); toast("حصلت مشكلة في التحميل، جرّبي تاني"); }); }, wait); });
} else {
  S = normalize(load());
  if (S.vacation.on && S.vacation.until && dkey() > S.vacation.until) S.vacation = {on:false};
  render(); startupChecks();
}
setInterval(()=>{ if (S && S.dark==="auto") applyTheme(); }, 60000);

/* ================= updates ================= */
// the installed apps stay open for days, so ask the server now and then if there's a newer version and reload into it
const BUILD = "__NW_BUILD__";
let updWaiting = false;
function busyNow(){ const a = document.activeElement; return !!($("#layer") && $("#layer").innerHTML) || !!(a && /INPUT|TEXTAREA|SELECT/.test(a.tagName)) || !!(S && S.timer && S.timer.end); }
function doUpdate(){ try { clearTimeout(pushTimer); if (S && UID) pushNow(); if (S) save(); } catch(e){} setTimeout(() => location.reload(), 500); }
async function checkUpdate(){
  if (BUILD.startsWith("__") || !navigator.onLine) return;
  try {
    const r = await fetch("version.json?t=" + Date.now(), {cache:"no-store"}); if (!r.ok) return;
    const j = await r.json(); if (!j.v || j.v === BUILD) return;
    if (navigator.serviceWorker) navigator.serviceWorker.getRegistration().then(g => g && g.update()).catch(()=>{});
    if (!busyNow()) return doUpdate();
    if (updWaiting) return; updWaiting = true;
    const d = document.createElement("button"); d.className = "updbar"; d.textContent = isEN() ? "New update ✨ tap to refresh" : gx("فيه تحديث جديد ✨ دوسي علشان يتحدّث", isMale());
    d.onclick = doUpdate; document.body.appendChild(d);
  } catch(e){}
}
setTimeout(checkUpdate, 4000);
setInterval(checkUpdate, 20 * 60000);
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") checkUpdate(); });
window.addEventListener("online", checkUpdate);
// closing or hiding the app: send any change still waiting, so nothing is lost
const flushNow = () => { try { if (pushTimer && S && UID){ clearTimeout(pushTimer); pushTimer = null; pushNow(); } } catch(e){} };
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") flushNow(); });
window.addEventListener("pagehide", flushNow);
