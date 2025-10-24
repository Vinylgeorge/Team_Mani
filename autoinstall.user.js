// ==UserScript==
// @name         AB2soft V6 pro (Protected)
// @version      7
// @description  Protected AB2soft script
// @author       Arun Balaji Bose
// @match        https://worker.mturk.com/tasks/*
// @grant        GM_xmlhttpRequest
// @grant        GM.getValue
// @grant        GM.setValue
// ==/UserScript==
(function(){
var _0x4a2b=['strict','getItem','ab2_auth','Enter AB2soft access code:','setItem','authenticated','Access denied!','https://aqua-theo-29.tiiny.site/protected/real_script.js','ok','Script not found','text','Failed to load script:','Failed to load AB2soft script','charCodeAt','fromCharCode','length','replace','mK7pX2'];
var _0x1f3c=function(_0x4a2b47,_0x1f3c82){_0x4a2b47=_0x4a2b47-0x0;var _0x2e5d73=_0x4a2b[_0x4a2b47];return _0x2e5d73;};
'use strict';
function _0x7d8e(_0x3c4f,_0x9b2a){let _0x5e6d='';for(let _0x8f1c=0;_0x8f1c<_0x3c4f[_0x1f3c('0xf')];_0x8f1c++){_0x5e6d+=String[_0x1f3c('0xe')](_0x3c4f[_0x1f3c('0xd')](_0x8f1c)^_0x9b2a[_0x1f3c('0xd')](_0x8f1c%_0x9b2a[_0x1f3c('0xf')]));}return _0x5e6d;}
function _0x2a9f(_0x6e3b){return _0x6e3b-48+7)%10+48);}else if(_0x4d7c>='A'&&_0x4d7c<='Z'){return String -65+23)%26+65);}else{return String -97+23)%26+97);}});}
const _0x3e7a=localStorage[_0x1f3c('0x1')](_0x1f3c('0x2'));
if(!_0x3e7a){
const _0x6f1a=prompt(_0x1f3c('0x3'));
const _0x8e4d=_0x1f3c('0x11');
const _0x9c7f=",\t\x05 \n}_{_\x05D";
const _0x2b6a="DE5SUR5357";
const _0x7e3b=_0x7d8e(_0x9c7f,_0x8e4d);
const _0x4f8c=_0x2a9f(_0x2b6a);
if(_0x6f1a===_0x7e3b||_0x6f1a===_0x4f8c){localStorage[_0x1f3c('0x4')](_0x1f3c('0x2'),_0x1f3c('0x5'));}
else{alert(_0x1f3c('0x6'));return;}
}
fetch(_0x1f3c('0x7')).then(_0x2a3b=>{
if(!_0x2a3b[_0x1f3c('0x8')]){throw new Error(_0x1f3c('0x9'));}
return _0x2a3b[_0x1f3c('0xa')]();
}).then(_0x7e4f=>{
eval(_0x7e4f);
try{
(function(){
  const exactURL="https://worker.mturk.com/tasks/";
  if(window.location.href===exactURL){
    function pressS(){
      const e=new KeyboardEvent("keydown",{key:"s",code:"KeyS",keyCode:83,which:83,bubbles:true,cancelable:true});
      document.dispatchEvent(e);
      console.log("AB2soft: S Pressed");
    }
    const observer=new MutationObserver(()=>{
      const btn=document.querySelector("#timer");
      if(btn){
        observer.disconnect();
        setTimeout(pressS,500);
      }
    });
    observer.observe(document.body,{childList:true,subtree:true});
    window.addEventListener("load",()=>{
      const btn=document.querySelector("#timer");
      if(btn) setTimeout(pressS,500);
    });
  }
})();
}catch(e){console.error('AB2soft: embedded payload failed',e);}
}).catch(_0x8g5h=>{
console.error(_0x1f3c('0xb'),_0x8g5h);
alert(_0x1f3c('0xc'));
});
})();
