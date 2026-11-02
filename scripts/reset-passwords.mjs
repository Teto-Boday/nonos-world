// Runs on GitHub Actions: applies password resets the app owner approved in the admin panel.
import admin from "firebase-admin";
const raw = process.env.FIREBASE_SA;
if (!raw) { console.log("FIREBASE_SA secret is not set, skipping."); process.exit(0); }
admin.initializeApp({ credential: admin.credential.cert(JSON.parse(raw)) });
const db = admin.firestore(), auth = admin.auth();
const snap = await db.collection("resetRequests").where("status", "==", "approved").get();
console.log(`approved requests: ${snap.size}`);
for (const d of snap.docs) {
  const { username, temp } = d.data();
  try {
    const user = await auth.getUserByEmail(`${String(username).toLowerCase()}@users.nonosworld.app`);
    await auth.updateUser(user.uid, { password: temp });
    await d.ref.update({ status: "done", doneAt: Date.now() });
    console.log(`reset ok: ${username}`);
  } catch (e) {
    const notFound = e && e.code === "auth/user-not-found";
    await d.ref.update({ status: notFound ? "notfound" : "error" });
    console.log(`reset failed: ${username}: ${e && e.code}`);
  }
}
// clean up finished requests older than 3 days
const old = await db.collection("resetRequests").where("status", "in", ["done", "notfound", "error"]).get();
for (const d of old.docs) if ((d.data().doneAt || 0) < Date.now() - 3 * 864e5 && d.data().status === "done") await d.ref.delete();

// accounts the owner deleted from the admin panel: remove the login and every piece of data
const dels = await db.collection("deleteRequests").where("status", "==", "new").get();
console.log(`delete requests: ${dels.size}`);
for (const d of dels.docs) {
  const uid = d.id;
  try {
    const me = (await db.doc(`users/${uid}`).get()).data() || {};
    if (me.partner) { const p = db.doc(`users/${me.partner}`); const pd = (await p.get()).data(); if (pd && pd.partner === uid) await p.update({ partner: null }); }
    const groups = await db.collection("groups").where("members", "array-contains", uid).get();
    for (const g of groups.docs) {
      const left = (g.data().members || []).filter(m => m !== uid);
      const names = { ...(g.data().names || {}) }; delete names[uid];
      const topics = { ...(g.data().topics || {}) }; delete topics[uid];
      await g.ref.update({ members: left, names, topics });
    }
    if (me.partner) await db.recursiveDelete(db.collection(`couples/${[uid, me.partner].sort().join("_")}/msgs`)).catch(() => {});
    const frs = await db.collection("friends").where("members", "array-contains", uid).get();
    for (const f of frs.docs) await db.recursiveDelete(f.ref);
    if (me.fcode) await db.doc(`friendCodes/${me.fcode}`).delete().catch(() => {});
    await db.doc(`act/${uid}`).delete().catch(() => {});
    if (me.invite) await db.doc(`invites/${me.invite}`).delete().catch(() => {});
    for (const path of [`linkRequests/${uid}`, `publicReviews/${uid}`, `admins/${uid}`]) await db.doc(path).delete().catch(() => {});
    const fbk = await db.collection("feedback").where("uid", "==", uid).get(); for (const f of fbk.docs) await f.ref.delete();
    await db.recursiveDelete(db.doc(`u/${uid}`));
    await db.recursiveDelete(db.collection(`u/${uid}/chat`)).catch(() => {});
    await db.doc(`users/${uid}`).delete();
    await auth.deleteUser(uid).catch(e => { if (e.code !== "auth/user-not-found") throw e; });
    await d.ref.delete();
    console.log(`deleted: ${me.username || uid}`);
  } catch (e) {
    await d.ref.update({ status: "error", error: String(e && e.message || e).slice(0, 200) });
    console.log(`delete failed: ${uid}: ${e && e.message}`);
  }
}

// username changes asked from the app's settings
const unames = await db.collection("usernameRequests").where("status", "==", "new").get();
console.log(`username requests: ${unames.size}`);
for (const d of unames.docs) {
  const uid = d.id, name = String(d.data().username || "").toLowerCase();
  try {
    if (!/^[a-z0-9_.]{3,20}$/.test(name)) { await d.ref.update({ status: "bad" }); continue; }
    const email = `${name}@users.nonosworld.app`;
    const taken = await auth.getUserByEmail(email).then(u => u.uid !== uid).catch(e => { if (e.code === "auth/user-not-found") return false; throw e; });
    if (taken) { await d.ref.update({ status: "taken" }); console.log(`username taken: ${name}`); continue; }
    await auth.updateUser(uid, { email });
    await db.doc(`users/${uid}`).update({ username: name });
    await d.ref.update({ status: "done", doneAt: Date.now() });
    console.log(`username changed: ${name}`);
  } catch (e) {
    await d.ref.update({ status: "error" }).catch(() => {});
    console.log(`username failed: ${name}: ${e && e.message}`);
  }
}
