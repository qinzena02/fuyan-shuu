/* 負驗書 · 仁德值顯示與長明府短暫警示。雲端資料只讀，不授權客戶端修改資料庫。 */
(function(){
'use strict';
const KEY='fuyanshu_virtue',PLAYER='fuyanshu_player';
const clamp=n=>Math.max(0,Math.min(100,Math.round(n)));
let cloudValue=null, lastValue=null, lastSource=null, timer=null;
function legacyGet(){const raw=localStorage.getItem(KEY);if(raw!==null&&raw.trim()!==''&&Number.isFinite(Number(raw)))return clamp(Number(raw));try{const p=JSON.parse(localStorage.getItem(PLAYER)||'null');if(p&&Number.isFinite(Number(p.virtue)))return clamp(Number(p.virtue));}catch(e){}return 50;}
function get(){return cloudValue===null?legacyGet():cloudValue;}
function css(){if(document.getElementById('fys-virtue-style'))return;const s=document.createElement('style');s.id='fys-virtue-style';s.textContent=`
#fys-virtue-alert{position:fixed;top:16px;right:16px;z-index:2147483640;max-width:min(82vw,310px);padding:9px 13px;background:#241f12;border:1px solid #e2b94e;border-radius:10px;color:#ffe394;box-shadow:0 6px 24px #0009;font:12px/1.6 'Microsoft JhengHei',sans-serif;pointer-events:none;animation:fys-slide .2s ease-out}
#fys-virtue-alert.red{background:#290d13;border-color:#ff4257;color:#ff9ca7}
@keyframes fys-slide{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
@media(prefers-reduced-motion:reduce){#fys-virtue-alert{animation:none}}
`;document.head.appendChild(s);}
function level(v){return v===0?'zero':v<=20?'red':v<=50?'yellow':'normal';}
function showWarning(v){if(!document.body)return;css();const l=level(v);let box=document.getElementById('fys-virtue-alert');if(box)box.remove();box=document.createElement('div');box.id='fys-virtue-alert';box.className=l==='red'||l==='zero'?'red':'';box.setAttribute('role','status');box.textContent=l==='yellow'?`⚠ 長明府 · 禁步預警｜仁德值降至 ${v}，示籙已列入觀察`:l==='zero'?'⛔ 長明府 · 仁德值歸零，通行資格須重新核驗':`⛔ 長明府 · 紅色警戒｜仁德值降至 ${v}`;document.body.appendChild(box);clearTimeout(timer);timer=setTimeout(()=>box.remove(),l==='yellow'?3500:5000);}
function render(v){if(!document.body)return;document.querySelectorAll('[data-fys-virtue],#virtue,#virtueCard').forEach(e=>{e.textContent=String(v);e.style.color=level(v)==='normal'?'':level(v)==='yellow'?'#ffcf59':'#ff5569';});}
function accept(v,source){
 if(!Number.isFinite(Number(v)))return;
 v=clamp(Number(v));
 if(source==='cloud')cloudValue=v;
 // 一般同步或載入只更新畫面，不發出警報。
 lastValue=v;lastSource=source;render(v);
}
// 僅在已確認成功的交易後呼叫；低於 50 且實際下降才顯示警告。
function notifyDeduction(before,after){
 if(!Number.isFinite(Number(before))||!Number.isFinite(Number(after)))return;
 const oldValue=clamp(Number(before)),newValue=clamp(Number(after));
 if(newValue<oldValue&&newValue<50)showWarning(newValue);
}
function refresh(){if(cloudValue!==null){accept(cloudValue,'cloud');return;}if(!window.FYS_VIRTUE_CLOUD_PENDING)accept(legacyGet(),'local');}
function set(n){if(!Number.isFinite(Number(n)))return get();const v=clamp(Number(n));
// 舊劇情仍使用本機進度；這個函式不會假裝已更新 Supabase。
localStorage.setItem(KEY,String(v));if(cloudValue===null)accept(v,'local');try{if(window.parent!==window)window.parent.postMessage({type:'fys-virtue-changed',value:v},location.origin);}catch(e){}return v;}
window.FYSVirtue={get,set,change:delta=>set(legacyGet()+Number(delta||0)),refresh,syncCloud:v=>accept(v,'cloud'),notifyDeduction,isCloudSynced:()=>cloudValue!==null};
window.addEventListener('storage',e=>{if((e.key===KEY||e.key===PLAYER)&&cloudValue===null)refresh();});
window.addEventListener('message',e=>{if(e.origin===location.origin&&e.data&&e.data.type==='fys-virtue-changed'&&cloudValue===null)refresh();});
if(!window.FYS_VIRTUE_CLOUD_PENDING){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',refresh);else refresh();}
})();
