/* 負驗書｜全域萬象傳書通知：在 world.html 外層執行 */
(()=>{
'use strict';
const db=window.fuyanshuDB;
const bell=document.getElementById('fys-notice-bell');
const badge=document.getElementById('fys-notice-count');
const panel=document.getElementById('fys-notice-panel');
const list=document.getElementById('fys-notice-list');
const toast=document.getElementById('fys-notice-toast');
const all=document.getElementById('fys-notice-readall');
if(!db||!bell)return;
let uid=null, items=[], reads=new Set(), initialized=false, busy=false, channel=null, toastTimer=null;
let shown=new Set();
const $time=v=>{try{return new Date(v).toLocaleString('zh-TW',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'});}catch{return '';}};
const title=n=>n.type==='new_post'?'萬象傳書有新書札':n.type==='comment_reply'?'有人回覆了你的留言':'你的書札收到新留言';
function destination(n){
 const url=new URL('world.html',location.href);
 url.searchParams.set('page','social.html');
 if(n.post_id)url.searchParams.set('post',n.post_id);
 if(n.comment_id)url.searchParams.set('comment',n.comment_id);
 return url.href;
}
function navigate(n){if(n.post_id)location.href=destination(n);else location.href=new URL('world.html?page=social.html',location.href).href;}
function render(){
 const count=items.filter(n=>!reads.has(n.id)).length;
 badge.textContent=count>99?'99+':String(count);badge.hidden=count===0;
 bell.setAttribute('aria-label',`傳書通知，${count} 則未讀`);
 list.replaceChildren();
 if(!items.length){const p=document.createElement('p');p.textContent='目前沒有傳書通知。';list.append(p);return;}
 for(const n of items){
  const btn=document.createElement('button');btn.type='button';btn.className='fys-notice-item'+(reads.has(n.id)?'':' unread');
  const strong=document.createElement('strong');strong.textContent=title(n);
  const small=document.createElement('small');small.textContent=$time(n.created_at)+(reads.has(n.id)?' · 已讀':' · 未讀');
  btn.append(strong,small);btn.addEventListener('click',async()=>{await mark([n.id]);panel.hidden=true;navigate(n);});list.append(btn);
 }
}
async function mark(ids){
 if(!uid)return;
 const pending=ids.filter(id=>!reads.has(id));if(!pending.length)return;
 const {error}=await db.from('social_notification_reads').upsert(pending.map(notification_id=>({notification_id,user_id:uid})),{onConflict:'notification_id,user_id',ignoreDuplicates:true});
 if(error){console.warn('全域通知標記已讀失敗',error);return;}
 pending.forEach(id=>reads.add(id));render();
}
function pop(n){
 toast.replaceChildren();
 const a=document.createElement('button');a.type='button';a.textContent='✉ '+title(n)+'　查看 ›';
 a.addEventListener('click',async()=>{await mark([n.id]);toast.hidden=true;navigate(n);});
 toast.append(a);toast.hidden=false;
 clearTimeout(toastTimer);toastTimer=setTimeout(()=>{toast.hidden=true;},6500);
}
async function sync(){
 if(!uid||busy)return;busy=true;
 try{
  const r=await db.from('social_notifications').select('id,type,actor_user_id,actor_character_id,post_id,comment_id,created_at').order('created_at',{ascending:false}).limit(100);
  if(r.error)throw r.error;
  const incoming=r.data||[];
  const ids=incoming.map(n=>n.id);
  const q=ids.length?await db.from('social_notification_reads').select('notification_id').eq('user_id',uid).in('notification_id',ids):{data:[],error:null};
  if(q.error)throw q.error;
  const nextReads=new Set((q.data||[]).map(x=>x.notification_id));
  const newItems=incoming.filter(n=>!shown.has(n.id)&&!nextReads.has(n.id));
  items=incoming;reads=nextReads;
  incoming.forEach(n=>shown.add(n.id));render();
  if(initialized&&newItems.length)pop(newItems[0]);
  initialized=true;
 }catch(e){console.warn('全域傳書通知讀取失敗',e);if(!initialized)list.textContent='通知暫時無法讀取，稍後會自動重試。';}
 finally{busy=false;}
}
async function start(){
 try{
  const {data,error}=await db.auth.getUser();if(error)throw error;
  const next=data?.user?.id||null;
  if(next===uid)return;
  if(channel){await db.removeChannel(channel);channel=null;}
  uid=next;items=[];reads=new Set();shown=new Set();initialized=false;
  bell.hidden=!uid;panel.hidden=true;toast.hidden=true;
  if(!uid)return;
  await sync();
  try{channel=db.channel('fys-global-notifications-'+uid).on('postgres_changes',{event:'INSERT',schema:'public',table:'social_notifications'},()=>sync()).subscribe();}catch(e){console.warn('通知即時訂閱未啟用，改用定期同步',e);}
 }catch(e){console.warn('全域通知登入檢查失敗',e);}
}
bell.addEventListener('click',()=>{panel.hidden=!panel.hidden;if(!panel.hidden)sync();});
all.addEventListener('click',()=>mark(items.map(n=>n.id)));
document.addEventListener('pointerdown',e=>{if(!panel.hidden&&!panel.contains(e.target)&&!bell.contains(e.target))panel.hidden=true;});
document.addEventListener('keydown',e=>{if(e.key==='Escape')panel.hidden=true;});
document.addEventListener('visibilitychange',()=>{if(!document.hidden){start();sync();}});
window.addEventListener('focus',()=>{start();sync();});
db.auth.onAuthStateChange(()=>{setTimeout(start,0);});
start();setInterval(()=>{if(!document.hidden){start();sync();}},20000);
})();
