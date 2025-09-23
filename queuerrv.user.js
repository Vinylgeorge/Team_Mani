// ==UserScript==
// @name        MTurk Queue Sync → Firestore
// @namespace   Violentmonkey Scripts
// @match       https://worker.mturk.com/tasks*
// @grant       none
// @version     1.2
// @updateURL    https://raw.githubusercontent.com/Vinylgeorge/Team_Mani/refs/heads/main/queuerrv.user.js
// @downloadURL  https://raw.githubusercontent.com/Vinylgeorge/Team_Mani/refs/heads/main/queuerrv.user.js
// ==/UserScript==

(function () {
  'use strict';

  const script = document.createElement("script");
  script.type = "module";
  script.textContent = `
    import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
    import { getFirestore, collection, getDocs, deleteDoc, setDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

    const firebaseConfig = {
      apiKey: "AIzaSyAC8nTZp3jHtan1wNOn5AMlBdIjAhUOuao",
  authDomain: "mturk-monitor-71203.firebaseapp.com",
  projectId: "mturk-monitor-71203",
  storageBucket: "mturk-monitor-71203.firebasestorage.app",
  messagingSenderId: "149805882414",
  appId: "1:149805882414:web:ad879531a567e0b1b713bf"
    };

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    async function syncQueue() {
      const activeIds = new Set();

      // extract assignmentIds from queue page
      document.querySelectorAll("a[href*='assignment_id=']").forEach(a => {
        const m = a.href.match(/assignment_id=([^&]+)/);
        if (m) activeIds.add(m[1]);
      });

      console.log("📋 Active HITs in MTurk queue:", [...activeIds]);

      // get all hits from Firestore
      const snap = await getDocs(collection(db, "hits"));
      for (const d of snap.docs) {
        if (!activeIds.has(d.id)) {
          // remove from hits + mark in history
          await deleteDoc(doc(db, "hits", d.id));
          await setDoc(doc(db, "history", d.id), {
            assignmentId: d.id,
            status: "submitted/returned/expired",
            removedAt: new Date().toISOString()
          }, { merge: true });
          console.log("🗑️ Removed stale HIT:", d.id);
        }
      }
    }

    // run once on load
    syncQueue();
  `;
  document.head.appendChild(script);
})();
