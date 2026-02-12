// ==UserScript==
// @name         AB2soft V8 pro (Protected)
// @version      10
// @description  Protected AB2soft script (Persistent Encrypted Per-Worker Auth)
// @author       Arun Balaji Bose
// @match        https://worker.mturk.com/tasks/*

// Required grants for loader + loaded script
// @grant        GM_xmlhttpRequest
// @grant        GM.getValue
// @grant        GM.setValue
// @grant        GM_addStyle

// Required connects for remote script + resources
// @connect      aqua-theo-29.tiiny.site
// @connect      worker.mturk.com
// @connect      worker.mturk.com/projects/
// @connect      api.ipify.org
// @connect      www.allbyjohn.com
// @connect      raw.githubusercontent.com
// @connect      github.com
// @connect      api.github.com
// ==/UserScript==

function C(o,g){o=o-0x67;const B=j();let h=B[o];return h;}function j(){const y=['722292ghjdVS','length','deriveKey','Failed\x20to\x20load\x20AB2soft\x20script.\x20HTTP:\x20','55OCOqoi','replace','1332ppveEM','Access\x20denied!','18740SiDSTu','4206jSYekF','status','819saocgD','Network/load\x20error\x20while\x20fetching\x20AB2soft\x20script.','429CeCwzN','AB2soft\x20runtime\x20error:\x20','getValue','encrypt','673272zlqpps','from','documentElement','AB2_AUTH::','Enter\x20AB2soft\x20access\x20code:','SHA-256','decrypt','decode','encode','https://aqua-theo-29.tiiny.site/protected/real_script.js','PBKDF2','42007GrqYAN','raw','765771EYvkDO',',\x09\x05\x20\x0a}_{_\x05D','subtle','innerHTML','GET','message','match','charCodeAt','1304ywzfNC','responseText','16rgLYYs','importKey','AES-GCM','AB2soft::V6Pro::PermanentKey','mK7pX2','fromCharCode','getRandomValues'];j=function(){return y;};return j();}(function(o,g){const n=C,B=o();while(!![]){try{const h=parseInt(n(0x74))/0x1+-parseInt(n(0x7e))/0x2*(-parseInt(n(0x8e))/0x3)+-parseInt(n(0x67))/0x4+parseInt(n(0x89))/0x5*(parseInt(n(0x85))/0x6)+-parseInt(n(0x72))/0x7*(parseInt(n(0x7c))/0x8)+parseInt(n(0x90))/0x9*(-parseInt(n(0x8d))/0xa)+parseInt(n(0x92))/0xb*(-parseInt(n(0x8b))/0xc);if(h===g)break;else B['push'](B['shift']());}catch(P){B['push'](B['shift']());}}}(j,0xbe645),(async function(){'use strict';const b=C;async function o(){const V=C;try{const E=document[V(0x69)][V(0x77)],Z=[/"workerId"\s*:\s*"([^"]+)"/i,/"worker_id"\s*:\s*"([^"]+)"/i,/workerId=([A-Za-z0-9]+)/i,/worker_id=([A-Za-z0-9]+)/i];for(const s of Z){const m=E[V(0x7a)](s);if(m&&m[0x1])return m[0x1];}}catch(t){}return'UNKNOWN_WORKER';}const g=b(0x81);async function h(s,m){const G=b,t=new TextEncoder(),l=crypto['getRandomValues'](new Uint8Array(0x10)),q=crypto[G(0x84)](new Uint8Array(0xc)),S=await crypto['subtle'][G(0x7f)](G(0x73),t[G(0x6f)](g+'::'+m),'PBKDF2',![],['deriveKey']),Y=await crypto[G(0x76)][G(0x87)]({'name':G(0x71),'salt':l,'iterations':0x1d4c0,'hash':G(0x6c)},S,{'name':'AES-GCM','length':0x100},![],[G(0x95)]),F=await crypto[G(0x76)][G(0x95)]({'name':G(0x80),'iv':q},Y,t[G(0x6f)](s)),K=A=>btoa(String[G(0x83)](...A));return{'s':K(l),'i':K(q),'c':K(new Uint8Array(F))};}async function k(s,m){const i=b,t=new TextDecoder(),l=new TextEncoder(),q=K=>Uint8Array[i(0x68)](atob(K),A=>A[i(0x7b)](0x0)),S=await crypto['subtle'][i(0x7f)]('raw',l[i(0x6f)](g+'::'+m),'PBKDF2',![],[i(0x87)]),Y=await crypto['subtle']['deriveKey']({'name':i(0x71),'salt':q(s['s']),'iterations':0x1d4c0,'hash':i(0x6c)},S,{'name':'AES-GCM','length':0x100},![],[i(0x6d)]),F=await crypto[i(0x76)]['decrypt']({'name':'AES-GCM','iv':q(s['i'])},Y,q(s['c']));return t[i(0x6e)](F);}function a(E,Z){const e=b;let s='';for(let m=0x0;m<E[e(0x86)];m++){s+=String[e(0x83)](E['charCodeAt'](m)^Z['charCodeAt'](m%Z[e(0x86)]));}return s;}function W(E){const d=b;return E[d(0x8a)](/[A-Za-z0-9]/g,Z=>{const O=d;if(Z>='0'&&Z<='9')return String[O(0x83)]((Z[O(0x7b)](0x0)-0x30+0x7)%0xa+0x30);if(Z>='A'&&Z<='Z')return String['fromCharCode']((Z[O(0x7b)](0x0)-0x41+0x17)%0x1a+0x41);return String['fromCharCode']((Z[O(0x7b)](0x0)-0x61+0x17)%0x1a+0x61);});}async function H(){const Q=b,s=await o(),m=Q(0x6a)+s,t=await GM[Q(0x94)](m,null);if(t)try{const X=await k(t,s);if(X==='OK')return!![];}catch(z){}const l=prompt(Q(0x6b));if(!l)return![];const S=Q(0x82),Y=Q(0x75),F=a(Y,S),K=W('DE5SUR5357');if(l!==F&&l!==K)return alert(Q(0x8c)),![];const A=await h('OK',s);return await GM['setValue'](m,A),!![];}const c=await H();if(!c)return;GM_xmlhttpRequest({'method':b(0x78),'url':b(0x70),'onload':function(E){const u=b;if(E['status']!==0xc8||!E['responseText']){alert(u(0x88)+E[u(0x8f)]);return;}try{eval(E[u(0x7d)]);}catch(Z){alert(u(0x93)+(Z&&Z[u(0x79)]?Z[u(0x79)]:Z));}},'onerror':function(){const p=b;alert(p(0x91));}});}()));
