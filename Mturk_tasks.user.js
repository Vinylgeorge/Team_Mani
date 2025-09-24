// ==UserScript==
// @name        MTurk Accepted HITs  (Auto-Prune + Cleanup + CAPTCHA Popup)
// @namespace   Violentmonkey Scripts
// @match       https://worker.mturk.com/projects/*/tasks/*
// @match       https://worker.mturk.com/tasks*
// @grant        none
// @version     1.3
// @updateURL    https://raw.githubusercontent.com/Vinylgeorge/Team_Mani/refs/heads/main/Mturk_tasks.user.js
// @downloadURL  https://raw.githubusercontent.com/Vinylgeorge/Team_Mani/refs/heads/main/Mturk_tasks.user.js
// ==/UserScript==
(function () {
  'use strict';

  const s = document.createElement("script");
  s.type = "module";
  s.textContent = `
    import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
    import { getFirestore, collection, getDocs, setDoc, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

    // 🔑 Firebase Config
    const firebaseConfig = {
      apiKey: "enjoymturk2025",
      authDomain: "mturk-monitor-71203.firebaseapp.com",
      projectId: "mturk-monitor-71203",
      storageBucket: "mturk-monitor-71203.appspot.com",
      messagingSenderId: "149805882414",
      appId: "1:149805882414:web:ad879531a567e0b1b713bf"
    };

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    // --- Helpers ---
    function getWorkerId() {
  const el = document.querySelector(".me-bar span.text-uppercase span");
  if (!el) return null;
  const txt = el.textContent.trim();

  // Look for "A" followed by only uppercase letters/digits
  const match = txt.match(/A[0-9A-Z]+/);
  return match ? match[0] : txt;
}

    function fmtReward(val) {
      const n = Number(val);
      return isNaN(n) ? 0.0 : parseFloat(n.toFixed(2));
    }

    function docKey(workerId, assignmentId) {
      return workerId + "_" + assignmentId;
    }

    // --- Queue Collector ---
    function collectQueueHits(workerId) {
      const hits = [];
      const mounts = Array.from(document.querySelectorAll("[data-react-class*='TaskQueueTable']"));

      for (const el of mounts) {
        const raw = el.getAttribute("data-react-props");
        if (!raw) continue;
        try {
          const props = JSON.parse(raw);
          const body = props?.bodyData;
          if (!Array.isArray(body)) continue;

          for (const item of body) {
            const assignmentId = item?.assignment_id;
            if (!assignmentId) continue;

            const project = item?.project || {};
            const rewardNum = fmtReward(project?.monetary_reward?.amount_in_dollars);

            const deadline = item?.deadline ? new Date(item.deadline).getTime() : null;
            const remainingSeconds = deadline ? Math.max(0, Math.floor((deadline - Date.now()) / 1000)) : null;

            hits.push({
              assignmentId,
              workerId: workerId || "-",
              requester: project?.requester_name || "",
              title: project?.title || "",
              reward: rewardNum,
              acceptedAt: item?.accepted_at || new Date().toISOString(),
              deadline: item?.deadline || null,
              taskId: item?.task_id || "",
              hitSetId: project?.hit_set_id || "",
              status: "active",
              remainingSeconds,
              apiKey: "enjoymturk2025"
            });
          }
        } catch (_) {}
      }
      return hits;
    }

    async function syncQueueOnce() {
      const workerId = getWorkerId();
      if (!workerId) return;

      const current = collectQueueHits(workerId);
      if (!current.length) {
        console.log("⚠️ Queue empty for", workerId);
        return;
      }

      const currentIds = new Set(current.map(h => h.assignmentId));

      // Upsert current worker’s hits
      await Promise.all(current.map(h =>
        setDoc(doc(db, "hits", docKey(workerId, h.assignmentId)), h, { merge: true })
      ));

      // Delete only this worker’s disappeared hits
      const snap = await getDocs(collection(db, "hits"));
      const deletions = [];
      for (const d of snap.docs) {
        const h = d.data();
        if (h.workerId === workerId && !currentIds.has(h.assignmentId)) {
          deletions.push(deleteDoc(doc(db, "hits", d.id)));
        }
      }
      if (deletions.length) await Promise.all(deletions);

      console.log("✅ Queue sync for", workerId, " | upsert:", current.length, "| removed:", deletions.length);
    }

    // --- Task Collector ---
    function collectTaskHit() {
      const url = new URL(window.location.href);
      const assignmentId = url.searchParams.get("assignment_id");
      if (!assignmentId) return null;

      const workerId = getWorkerId();
      const title = document.querySelector(".task-project-title")?.innerText
                 || document.querySelector("h1")?.innerText
                 || document.title;

      // Reward from detail bar
      let reward = 0.0;
      const rewardEl = Array.from(document.querySelectorAll(".detail-bar-label"))
        .find(el => el.textContent.includes("Reward"));
      if (rewardEl) {
        const valEl = rewardEl.parentElement?.querySelector(".detail-bar-value");
        if (valEl) {
          const match = valEl.innerText.match(/\\$([0-9.]+)/);
          if (match) reward = parseFloat(match[1]);
        }
      }

      return {
        assignmentId,
        workerId: workerId || "-",
        requester: document.querySelector(".detail-bar-value a[href*='/requesters/']")?.innerText || "",
        title,
        reward: reward || 0.0,
        acceptedAt: new Date().toISOString(),
        deadline: null,
        taskId: "",
        hitSetId: "",
        status: "active",
        remainingSeconds: null,
        apiKey: "enjoymturk2025"
      };
    }

    async function syncTaskOnce() {
      const hit = collectTaskHit();
      if (!hit) return;
      const key = docKey(hit.workerId, hit.assignmentId);
      await setDoc(doc(db, "hits", key), hit, { merge: true });
      console.log("✅ Task sync:", hit.assignmentId, "reward:", hit.reward);
    }

    // --- Countdown updater ---
    async function updateCountdowns() {
      const snap = await getDocs(collection(db, "hits"));
      const now = Date.now();
      const updates = [];
      for (const d of snap.docs) {
        const h = d.data();
        if (h.deadline) {
          const remainingSeconds = Math.max(0, Math.floor((new Date(h.deadline).getTime() - now) / 1000));
          updates.push(updateDoc(doc(db, "hits", d.id), { remainingSeconds }));
        }
      }
      if (updates.length) await Promise.all(updates);
    }

    // --- Entry ---
    function init() {
      if (location.pathname.startsWith("/tasks")) {
        syncQueueOnce().catch(console.error);
        setInterval(() => {
          syncQueueOnce().catch(console.error);
          updateCountdowns().catch(console.error);
        }, 30000);
      } else if (location.pathname.includes("/projects/")) {
        syncTaskOnce().catch(console.error);
      }
    }

    if (document.readyState === "complete" || document.readyState === "interactive") {
      setTimeout(init, 800);
    } else {
      window.addEventListener("DOMContentLoaded", () => setTimeout(init, 800));
    }
  `;
  document.head.appendChild(s);
})();
