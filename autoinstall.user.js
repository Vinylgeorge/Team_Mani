// ==UserScript==
// @name         AB2soft Secure Loader
// @version      25
// @match        https://worker.mturk.com/tasks/*
// @grant        GM_xmlhttpRequest
// @grant        GM.getValue
// @grant        GM.setValue
// @grant        GM_addStyle
// @connect      192.227.99.43
// @connect      worker.mturk.com
// @connect      worker.mturk.com/projects/
// ==/UserScript==

(async function () {
  "use strict";

  const API_BASE = "http://192.227.99.43:8787";
  const AUTH_URL = API_BASE + "/v1/loader/auth";
  const LOADER_VERSION = "autoinstall-secure-v1";
  const KEY_LICENSE = "AB2_LICENSE_KEY";
  const KEY_DEVICE_ID = "AB2_DEVICE_ID";

  async function getWorkerId() {
    try {
      const html = document.documentElement.innerHTML;
      const patterns = [
        /"workerId"\s*:\s*"([^"]+)"/i,
        /"worker_id"\s*:\s*"([^"]+)"/i,
        /workerId=([A-Za-z0-9]+)/i,
        /worker_id=([A-Za-z0-9]+)/i
      ];
      for (const re of patterns) {
        const m = html.match(re);
        if (m && m[1]) return m[1];
      }
    } catch (_e) {}
    return "UNKNOWN_WORKER";
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function b64UrlFromBytes(bytes) {
    let raw = "";
    for (let i = 0; i < bytes.length; i++) raw += String.fromCharCode(bytes[i]);
    return btoa(raw).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  }

  function randomNonce(size) {
    return b64UrlFromBytes(crypto.getRandomValues(new Uint8Array(size || 16)));
  }

  function randomUuidV4() {
    const b = crypto.getRandomValues(new Uint8Array(16));
    b[6] = (b[6] & 0x0f) | 0x40;
    b[8] = (b[8] & 0x3f) | 0x80;
    const hex = Array.from(b, x => x.toString(16).padStart(2, "0")).join("");
    return (
      hex.slice(0, 8) + "-" +
      hex.slice(8, 12) + "-" +
      hex.slice(12, 16) + "-" +
      hex.slice(16, 20) + "-" +
      hex.slice(20)
    );
  }

  async function getOrCreateDeviceId() {
    let id = await GM.getValue(KEY_DEVICE_ID, "");
    if (!id) {
      id = randomUuidV4();
      await GM.setValue(KEY_DEVICE_ID, id);
    }
    return id;
  }

  async function sha256Hex(text) {
    const data = new TextEncoder().encode(text);
    const digest = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, "0")).join("");
  }

  function gmRequest(method, url, opts) {
    const headers = (opts && opts.headers) || {};
    const data = (opts && opts.data) || null;
    const timeout = (opts && opts.timeout) || 20000;
    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        method,
        url,
        headers,
        data,
        nocache: true,
        timeout,
        onload: r => resolve({ status: r.status, text: r.responseText || "" }),
        onerror: () => reject(new Error("Network error at " + url)),
        ontimeout: () => reject(new Error("Timed out at " + url))
      });
    });
  }

  async function requestWithRetry(method, url, opts, maxAttempts) {
    let attempt = 0;
    const max = maxAttempts || 5;
    while (attempt < max) {
      attempt += 1;
      try {
        const res = await gmRequest(method, url, opts || {});
        const retryStatus = res.status === 429 || res.status === 503;
        if (retryStatus && attempt < max) {
          const waitMs = Math.min(1500 * Math.pow(2, attempt - 1), 12000) + Math.floor(Math.random() * 400);
          await sleep(waitMs);
          continue;
        }
        return res;
      } catch (e) {
        if (attempt >= max) throw e;
        const waitMs = Math.min(1500 * Math.pow(2, attempt - 1), 12000) + Math.floor(Math.random() * 400);
        await sleep(waitMs);
      }
    }
    throw new Error("Request failed after retries: " + url);
  }

  function parseJsonSafe(text) {
    try {
      return JSON.parse(text || "{}");
    } catch (_e) {
      return {};
    }
  }

  function pickErrorMessage(body, fallback) {
    if (body && typeof body.error === "string" && body.error) return body.error;
    if (body && typeof body.detail === "string" && body.detail) return body.detail;
    if (body && typeof body.reason === "string" && body.reason) return body.reason;
    return fallback;
  }

  async function promptLicense(existing) {
    const current = existing || "";
    const next = prompt("Enter your license key:", current);
    if (!next || !next.trim()) throw new Error("License key is required.");
    return next.trim();
  }

  async function authSession(workerId) {
    const deviceId = await getOrCreateDeviceId();
    let licenseKey = (await GM.getValue(KEY_LICENSE, "") || "").trim();
    if (!licenseKey) {
      licenseKey = await promptLicense("");
      await GM.setValue(KEY_LICENSE, licenseKey);
    }

    for (let licenseAttempt = 0; licenseAttempt < 2; licenseAttempt++) {
      let unlockCode = "";
      for (let unlockAttempt = 0; unlockAttempt < 3; unlockAttempt++) {
        const body = {
          workerId,
          deviceId,
          loaderVersion: LOADER_VERSION,
          nonce: randomNonce(16),
          issuedAt: Date.now(),
          licenseKey
        };
        if (unlockCode) body.unlockCode = unlockCode;

        const res = await requestWithRetry(
          "POST",
          AUTH_URL,
          {
            headers: { "Content-Type": "application/json" },
            data: JSON.stringify(body)
          },
          3
        );
        const json = parseJsonSafe(res.text);

        if (res.status === 200 && json && json.ok && json.session) return json.session;

        if (res.status === 423 && json && json.error_code === "NEED_ROTATING_PASSWORD") {
          const code = prompt("This worker is locked to another worker/device/IP. Enter temporary rotating password:");
          if (!code || !code.trim()) throw new Error("Rotating unlock code is required.");
          unlockCode = code.trim();
          continue;
        }

        const errMsg = pickErrorMessage(json, "Authorization failed.");
        const maybeLicenseIssue = res.status === 403 && /license/i.test(errMsg);
        if (maybeLicenseIssue && licenseAttempt === 0) {
          licenseKey = await promptLicense("");
          await GM.setValue(KEY_LICENSE, licenseKey);
          break;
        }
        throw new Error(errMsg + " (HTTP " + res.status + ")");
      }
    }
    throw new Error("Authorization failed.");
  }

  async function fetchPayloadSource(session, workerId) {
    const res = await requestWithRetry(
      "GET",
      session.payloadUrl,
      {
        headers: {
          Authorization: "Bearer " + session.token,
          "X-Worker-Id": workerId,
          "X-Loader-Version": LOADER_VERSION
        }
      },
      3
    );
    if (res.status !== 200 || !res.text) throw new Error("Payload fetch failed (HTTP " + res.status + ")");
    return res.text;
  }

  async function bootFromSecureBackend() {
    const workerId = await getWorkerId();
    if (!workerId || workerId === "UNKNOWN_WORKER") throw new Error("Could not detect workerId.");

    const session = await authSession(workerId);
    const sourceCode = await fetchPayloadSource(session, workerId);

    if (session.payloadSha256) {
      const got = (await sha256Hex(sourceCode)).toLowerCase();
      const expected = String(session.payloadSha256).toLowerCase();
      if (got !== expected) throw new Error("Payload hash mismatch.");
    }

    // direct eval keeps GM_* available for loaded script
    eval(sourceCode);
  }

  try {
    await bootFromSecureBackend();
  } catch (e) {
    alert("AB2soft secure loader error: " + (e && e.message ? e.message : e));
  }
})();
