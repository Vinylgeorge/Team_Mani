// ==UserScript==
// @name        MTurk Accepted HITs → JSONBin (Auto-Prune + Cleanup + CAPTCHA Popup)
// @namespace   Violentmonkey Scripts
// @match       https://worker.mturk.com/projects/*/tasks/*
// @grant        none
// @version     1.0
// @updateURL    https://raw.githubusercontent.com/Vinylgeorge/Team_Mani/refs/heads/main/Mturk_tasks.user.js
// @downloadURL  https://raw.githubusercontent.com/Vinylgeorge/Team_Mani/refs/heads/main/Mturk_tasks.user.js
// ==/UserScript==

((async function () {
  'use strict';

  // Dynamically load Firebase SDK
  const script = document.createElement("script");
  script.type = "module";
  script.textContent = `
    import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
    import { getFirestore, doc, setDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

    // 🔑 Your Firebase Config
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

    // ---------- Scraper ----------
    function scrapeHitInfo() {
      const assignmentId =
        new URLSearchParams(window.location.search).get("assignment_id") ||
        \`task-\${Date.now()}\`;

      const requester =
        document.querySelector(".detail-bar-value a[href*='/requesters']")
          ?.innerText.trim() || "Unknown";

      const title =
        document.querySelector(".task-project-title")?.innerText.trim() ||
        document.title;

      // ✅ Reward: keep as original string like "$0.03"
      let reward = "$0.00";
      try {
        const rewardEl = [...document.querySelectorAll(".detail-bar-label")]
          .find(el => el.innerText.trim() === "Reward")
          ?.parentElement.querySelector(".detail-bar-value");
        if (rewardEl) {
          reward = rewardEl.innerText.trim();
        }
      } catch {}

      // ✅ Worker ID: remove "COPIED " prefix
      let workerId =
        document.querySelector(".me-bar .text-uppercase span")?.innerText.trim() ||
        "unknown";
      workerId = workerId.replace(/^COPIED\\s+/i, "");

      // ⏳ Time remaining
      let timeRemainingSeconds = null;
      const timer = document.querySelector("[data-react-class*='CompletionTimer']");
      if (timer?.getAttribute("data-react-props")) {
        try {
          const props = JSON.parse(timer.getAttribute("data-react-props"));
          timeRemainingSeconds = props.timeRemainingInSeconds;
        } catch {}
      }

      return {
        assignmentId,
        requester,
        title,
        reward,  // string, e.g. "$0.03"
        workerId, // cleaned ID
        acceptedAt: new Date().toISOString(),
        timeRemainingSeconds
      };
    }

    // ---------- Save HIT ----------
    async function saveHit(hit) {
      await setDoc(doc(db, "hits", hit.assignmentId), hit);
      console.log("✅ HIT saved to Firestore:", hit);

      // Auto-expire cleanup
      if (hit.timeRemainingSeconds) {
        setTimeout(async () => {
          await deleteDoc(doc(db, "hits", hit.assignmentId));
          console.log("🗑️ HIT expired:", hit.assignmentId);
        }, hit.timeRemainingSeconds * 1000);
      }
    }

    // ---------- Remove HIT ----------
    async function removeHit(assignmentId, reason = "Removed") {
      await deleteDoc(doc(db, "hits", assignmentId));
      console.log(\`🗑️ \${reason} HIT:\`, assignmentId);
    }

    // ---------- Run ----------
    const hit = scrapeHitInfo();
    if (hit) {
      await saveHit(hit);

      // Listen for form submissions (Submit / Return)
      const forms = document.querySelectorAll(
        "form[action*='/submit'], form[action*='/return'], form[action*='/tasks/']"
      );
      forms.forEach(f => {
        f.addEventListener("submit", () => {
          removeHit(hit.assignmentId, "Submitted/Returned");
        });
      });
    }
  `;
  document.head.appendChild(script);
})();
