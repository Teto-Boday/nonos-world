/* Prayer times computed on the device (no internet needed).
   Method: Egyptian General Authority of Survey (Fajr 19.5°, Isha 17.5°), Asr = shadow 1x (standard). */
const rad = d => d * Math.PI / 180, deg = r => r * 180 / Math.PI;
const fixA = a => { a = a - 360 * Math.floor(a / 360); return a < 0 ? a + 360 : a; };
const fixH = h => { h = h - 24 * Math.floor(h / 24); return h < 0 ? h + 24 : h; };

function sun(jd){
  const D = jd - 2451545.0;
  const g = fixA(357.529 + 0.98560028 * D), q = fixA(280.459 + 0.98564736 * D);
  const L = fixA(q + 1.915 * Math.sin(rad(g)) + 0.020 * Math.sin(rad(2 * g)));
  const e = 23.439 - 0.00000036 * D;
  const RA = deg(Math.atan2(Math.cos(rad(e)) * Math.sin(rad(L)), Math.cos(rad(L)))) / 15;
  return { decl: deg(Math.asin(Math.sin(rad(e)) * Math.sin(rad(L)))), eqt: q / 15 - fixH(RA) };
}
function julian(y, m, d){
  if (m <= 2){ y -= 1; m += 12; }
  const A = Math.floor(y / 100), B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5;
}

/* returns {fajr, sunrise, dhuhr, asr, maghrib, isha} as Date objects in the device's local time */
export function prayerTimes(date, lat, lng){
  const y = date.getFullYear(), m = date.getMonth() + 1, d = date.getDate();
  const jd = julian(y, m, d) - lng / (15 * 24);
  const mid = t => fixH(12 - sun(jd + t).eqt);
  const angleTime = (angle, t, before) => {
    const s = sun(jd + t), noon = mid(t);
    const c = (-Math.sin(rad(angle)) - Math.sin(rad(s.decl)) * Math.sin(rad(lat))) / (Math.cos(rad(s.decl)) * Math.cos(rad(lat)));
    const T = deg(Math.acos(Math.max(-1, Math.min(1, c)))) / 15;
    return noon + (before ? -T : T);
  };
  const asrTime = t => { const s = sun(jd + t); const a = -deg(Math.atan(1 / (1 + Math.tan(rad(Math.abs(lat - s.decl)))))); return angleTime(a, t); };
  let t = {fajr:5, sunrise:6, dhuhr:12, asr:13, maghrib:18, isha:18};
  for (let i = 0; i < 2; i++){
    const p = k => t[k] / 24;
    t = { fajr: angleTime(19.5, p("fajr"), true), sunrise: angleTime(0.833, p("sunrise"), true), dhuhr: mid(p("dhuhr")),
          asr: asrTime(p("asr")), maghrib: angleTime(0.833, p("maghrib")), isha: angleTime(17.5, p("isha")) };
  }
  // hours are UTC at the given longitude → local clock time of that day
  const tz = -new Date(y, m - 1, d, 12).getTimezoneOffset() / 60;
  const adj = { fajr:0, sunrise:0, dhuhr:0, asr:0, maghrib:0, isha:0 }; // matches the Egyptian Survey Authority's published times
  const out = {};
  for (const k in t){
    const h = t[k] + tz - lng / 15, mins = Math.round(h * 60) + adj[k];
    out[k] = new Date(y, m - 1, d, 0, mins);
  }
  return out;
}

/* places people can pick when the phone won't share its location */
export const CITIES = [
  ["القاهرة", 30.0444, 31.2357], ["الجيزة", 30.0131, 31.2089], ["الإسكندرية", 31.2001, 29.9187], ["القليوبية (بنها)", 30.4659, 31.1848],
  ["الشرقية (الزقازيق)", 30.5877, 31.502], ["الدقهلية (المنصورة)", 31.0409, 31.3785], ["الغربية (طنطا)", 30.7865, 31.0004], ["المنوفية (شبين الكوم)", 30.5539, 31.0094],
  ["البحيرة (دمنهور)", 31.0341, 30.4682], ["كفر الشيخ", 31.1107, 30.9388], ["دمياط", 31.4165, 31.8133], ["بورسعيد", 31.2653, 32.3019],
  ["الإسماعيلية", 30.5965, 32.2715], ["السويس", 29.9668, 32.5498], ["الفيوم", 29.3084, 30.8428], ["بني سويف", 29.0661, 31.0994],
  ["المنيا", 28.0871, 30.7618], ["أسيوط", 27.1783, 31.1859], ["سوهاج", 26.5591, 31.6957], ["قنا", 26.1551, 32.716],
  ["الأقصر", 25.6872, 32.6396], ["أسوان", 24.0889, 32.8998], ["الغردقة", 27.2579, 33.8116], ["شرم الشيخ", 27.9158, 34.33],
  ["مرسى مطروح", 31.3543, 27.2373], ["العريش", 31.1316, 33.7984], ["دبي", 25.2048, 55.2708], ["أبوظبي", 24.4539, 54.3773],
  ["الرياض", 24.7136, 46.6753], ["جدة", 21.4858, 39.1925], ["الكويت", 29.3759, 47.9774], ["الدوحة", 25.2854, 51.531]
];
