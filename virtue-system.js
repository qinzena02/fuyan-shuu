/* 負驗書 · 全站共用仁德值警戒（長明府的評價，不代表客觀善惡） */
(function(){
'use strict';
const KEY='fuyanshu_virtue',PLAYER='fuyanshu_player';
const clamp=n=>Math.max(0,Math.min(100,Math.round(n)));
function get(){let raw=localStorage.getItem(KEY);if(raw!==null&&raw.trim()!==''&&Number.isFinite(Number(raw)))return clamp(Number(raw));try{const p=JSON.parse(localStorage.getItem(PLAYER)||'null');if(p&&Number.isFinite(Number(p.virtue)))return clamp(Number(p.virtue));}catch(e){}return 50;}
function ensureStyle(){if(document.getElementById('fys-virtue-style'))return;const style=document.createElement('style');style.id='fys-virtue-style';style.textContent=`
#fys-virtue-alert{position:fixed;left:50%;top:16px;transform:translateX(-50%);z-index:2147483640;width:min(92vw,570px);box-sizing:border-box;padding:13px 18px;background:#241f12;border:1px solid #e2b94e;color:#ffe394;box-shadow:0 0 24px #d8a93544;font:14px/1.7 'Microsoft JhengHei',sans-serif;text-align:center;pointer-events:none}
#fys-virtue-alert.red{background:#290d13;border-color:#ff4257;color:#ff8391;box-shadow:0 0 28px #ff304955}
#fys-virtue-lock{position:fixed;inset:0;z-index:2147483646;background:rgba(6,9,11,.98);display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;color:#f3c7c7;font-family:'Microsoft JhengHei',serif;text-align:center}
#fys-virtue-lock .fys-panel{max-width:640px;width:100%;padding:36px 22px;border:1px solid #a82b3e;background:#170e12;box-shadow:0 0 50px #9e183344}
#fys-virtue-lock .fys-system{color:#ff7888;letter-spacing:3px;font-size:12px}
#fys-virtue-lock h1{font-size:clamp(23px,5vw,36px);font-weight:normal;color:#ff4257;text-shadow:0 0 12px #ff243e,0 0 25px #a41328;animation:fys-warning 2s infinite}
#fys-virtue-lock p{color:#c6b0b3;line-height:2}
#fys-virtue-lock button{margin-top:20px;padding:12px 24px;border:1px solid #ff5666;background:#45141e;color:#fff1ed;font:inherit;cursor:pointer}
@keyframes fys-warning{0%,18%,22%,50%,54%,100%{opacity:1}20%,52%{opacity:.3}21%,53%{opacity:.7}}
@media(prefers-reduced-motion:reduce){#fys-virtue-lock h1{animation:none}}
`;document.head.appendChild(style);}
let lastLevel=null;
function paint(){if(!document.body)return;ensureStyle();const v=get();const level=v===0?'zero':v<=20?'red':v<50?'yellow':'normal';
 document.querySelectorAll('[data-fys-virtue],#virtue,#virtueCard').forEach(e=>{e.textContent=String(v);e.style.color=level==='yellow'?'#ffcf59':level==='normal'?'':'#ff5569';});
 let alert=document.getElementById('fys-virtue-alert');if(level==='yellow'||level==='red'){if(!alert){alert=document.createElement('div');alert.id='fys-virtue-alert';alert.setAttribute('role','alert');document.body.appendChild(alert);}alert.className=level==='red'?'red':'';alert.textContent=level==='yellow'?'⚠ 天眼黃色警戒｜仁德值 '+v+'｜示籙已列入觀察':'⛔ 天眼紅色警戒｜仁德值 '+v+'｜通行資格瀕臨撤銷';}else if(alert)alert.remove();
 let lock=document.getElementById('fys-virtue-lock');if(level==='zero'){
 if(!lock){lock=document.createElement('div');lock.id='fys-virtue-lock';lock.setAttribute('role','alertdialog');lock.setAttribute('aria-modal','true');lock.innerHTML='<div class="fys-panel"><div class="fys-system">長明府 · 天眼最終判定 / ACCESS DENIED</div><h1>「德數歸零者，禁止前行。」</h1><p>當前示籙通行資格已撤銷。<br>本次行旅中止，須重新登記示籙方可入城。<br><small>原有劇情存檔暫時保留。</small></p><button type="button" id="fys-restart">重新建立示籙</button></div>';document.body.appendChild(lock);lock.querySelector('button').addEventListener('click',()=>{localStorage.removeItem(PLAYER);localStorage.removeItem(KEY);location.href='index.html';});}
 }else if(lock)lock.remove();lastLevel=level;
}
function set(n){if(!Number.isFinite(Number(n)))return get();const v=clamp(Number(n));localStorage.setItem(KEY,String(v));paint();try{if(window.parent!==window)window.parent.postMessage({type:'fys-virtue-changed',value:v},location.origin);}catch(e){}return v;}
window.FYSVirtue={get,set,change:delta=>set(get()+Number(delta||0)),refresh:paint};
window.addEventListener('storage',e=>{if(e.key===KEY||e.key===PLAYER)paint();});
window.addEventListener('message',e=>{if(e.origin===location.origin&&e.data&&e.data.type==='fys-virtue-changed')paint();});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',paint);else paint();
})();
