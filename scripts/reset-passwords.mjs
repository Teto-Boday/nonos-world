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
