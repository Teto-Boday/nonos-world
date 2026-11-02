// Thin wrapper around Firebase so the app code stays small. Bundled by esbuild in CI.
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as fbSignOut, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, doc, getDoc, setDoc, deleteDoc, onSnapshot, collection, query, orderBy, limit as qlimit, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
let db;
try { db = initializeFirestore(app, { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) }); }
catch (e) { db = initializeFirestore(app, {}); }

const ref = p => doc(db, ...p.split("/"));
const cref = p => collection(db, ...p.split("/"));
export const emailOf = u => `${u.toLowerCase()}@users.nonosworld.app`;

export const fb = {
  onUser: cb => onAuthStateChanged(auth, u => cb(u ? { uid: u.uid } : null)),
  signUp: (u, p) => createUserWithEmailAndPassword(auth, emailOf(u), p).then(c => c.user.uid),
  signIn: (u, p) => signInWithEmailAndPassword(auth, emailOf(u), p).then(c => c.user.uid),
  signOut: () => fbSignOut(auth),
  changePassword: async (current, next) => {
    const u = auth.currentUser;
    await reauthenticateWithCredential(u, EmailAuthProvider.credential(u.email, current));
    await updatePassword(u, next);
  },
  get: async p => { const s = await getDoc(ref(p)); return s.exists() ? s.data() : null; },
  set: (p, data, merge = true) => setDoc(ref(p), data, { merge }),
  del: p => deleteDoc(ref(p)),
  add: (p, data) => addDoc(cref(p), { ...data, at: serverTimestamp() }),
  listen: (p, cb, onErr) => onSnapshot(ref(p), s => cb(s.exists() ? s.data() : null), e => onErr && onErr(e)),
  listenCol: (p, cb, onErr, max = 500, order = "ts") =>
    onSnapshot(query(cref(p), orderBy(order, "desc"), qlimit(max)), s => cb(s.docs.map(d => ({ id: d.id, ...d.data() }))), e => onErr && onErr(e)),
  list: async (p, max = 500, order) => {
    const q = order ? query(cref(p), orderBy(order, "desc"), qlimit(max)) : query(cref(p), qlimit(max));
    const s = await getDocs(q); return s.docs.map(d => ({ id: d.id, ...d.data() }));
  }
};
window.fb = fb;
