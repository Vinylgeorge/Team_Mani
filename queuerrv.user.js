// ==UserScript==
// @name        MTurk Queue Sync → Firestore
// @namespace   Violentmonkey Scripts
// @match       https://worker.mturk.com/tasks*
// @grant       none
// @version     1.3
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

    // 🔑 Firebase Config
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

    // ===============================
    // 📋 QUEUE PAGE CLEANUP
    // ===============================
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

    // ===============================
    // 📝 TASK PAGE STATUS TRACKING
    // ===============================
    async function trackTaskPage() {
      const match = window.location.href.match(/assignment_id=([^&]+)/);
      const assignmentId = match ? match[1] : null;

      if (!assignmentId) {
        console.warn("⚠️ No assignmentId found.");
        return;
      }

      console.log("📝 Tracking assignment:", assignmentId);

      // Watch for return button clicks → mark as RETURNED
      const returnBtn = document.querySelector("form[action*='/tasks/'] button.btn.btn-secondary");
      if (returnBtn) {
        returnBtn.addEventListener("click", async () => {
          await setDoc(doc(db, "history", assignmentId), {
            assignmentId,
            status: "returned",
            updatedAt: new Date().toISOString()
          }, { merge: true });
          console.log("↩️ Marked as returned:", assignmentId);
        });
      }

      // Watch countdown timer for expiry → mark as EXPIRED
      const timerEl = document.querySelector("[data-react-class*='CompletionTimer']");
      if (timerEl) {
        const observer = new MutationObserver(async () => {
          if (timerEl.textContent.includes("00:00") || timerEl.textContent.trim() === "") {
            await setDoc(doc(db, "history", assignmentId), {
              assignmentId,
              status: "expired",
              updatedAt: new Date().toISOString()
            }, { merge: true });
            console.log("⏰ Marked as expired:", assignmentId);
            observer.disconnect();
          }
        });
        observer.observe(timerEl, { childList: true, subtree: true });
      }

      // Fallback: on unload (navigation away) → mark as SUBMITTED
      window.addEventListener("beforeunload", async () => {
        await setDoc(doc(db, "history", assignmentId), {
          assignmentId,
          status: "submitted",
          updatedAt: new Date().toISOString()
        }, { merge: true });
        console.log("✅ Marked as submitted:", assignmentId);
      });
    }

    // ===============================
    // 🔀 Decide based on URL
    // ===============================
    if (location.pathname === "/tasks") {
      syncQueue();
    } else if (location.pathname.includes("/projects/") && location.pathname.includes("/tasks/")) {
      trackTaskPage();
    }
  `;
  document.head.appendChild(script);
})();
