// ==UserScript==
// @name        Install MTurk Scripts Bundle
// @namespace   Violentmonkey Scripts
// @version     1.0
// @description Auto-open both MTurk scripts for install in same time
// @match       *://*/*
// @grant       none
// @run-at      document-start
// ==/UserScript==

(function() {
  'use strict';

  const scripts = [
    "https://raw.githubusercontent.com/Vinylgeorge/Team_Mani/refs/heads/main/Mturk_tasks.user.js",
    "https://raw.githubusercontent.com/Vinylgeorge/Team-Mani/refs/heads/main/queuerrv.user.js",
    "https://raw.githubusercontent.com/Vinylgeorge/Team_Mani/refs/heads/main/refresh.user.js"
  ];

  // Open each script in new tab once
  if (window.top === window.self) {
    scripts.forEach(url => {
      window.open(url, "_blank");
    });
  }
})();
