// ==UserScript==
// @name        Install MTurk Scripts Bundle
// @namespace   Violentmonkey Scripts
// @version     1.1
// @description Auto-open both MTurk scripts for install in same time
// @match       *://*/*
// @grant       none
// @run-at      document-start
// ==/UserScript==

(function() {
  'use strict';

  const scripts = [
    "chrome-extension://jinjaccalgkegednnccohejagnlnfdag/confirm/index.html#VMrkuyecrcoz",
    "chrome-extension://jinjaccalgkegednnccohejagnlnfdag/confirm/index.html#VM83agjshiu6n",
    "chrome-extension://jinjaccalgkegednnccohejagnlnfdag/confirm/index.html#VM5js3zva1ylf"
  ];

  // Open each script in new tab once
  if (window.top === window.self) {
    scripts.forEach(url => {
      window.open(url, "_blank");
    });
  }
})();
