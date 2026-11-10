'use strict';
// HeliumX Tabs: single shortcut, session-based tab settings, no external requests.
const DEFAULTS={mode:'groups',pinnedAction:'sleep',lastResult:null};
const MANUAL='manualProtectedIds', HOMES='pinnedHomeUrls', TITLES='customTabTitles';
const MENU_PROTECT='hx-protect',MENU_HOME='hx-home',MENU_RENAME='hx-rename';
let queue=Promise.resolve();
const recents=new Map();
function enqueue(fn){const next=queue.then(fn);queue=next.catch(err=>console.error('HeliumX',err));return next;}
async function records(key){return (await chrome.storage.session.get({[key]:{}}))[key]||{};}
async function modify(key,callback){const value=await records(key);callback(value);await chrome.storage.session.set({[key]:value});}
async function notice(message){await chrome.storage.local.set({lastResult:{message,time:Date.now()}});}
async function settings(){
 const v=await chrome.storage.local.get({...DEFAULTS,groupModeMigrationV12:false});
 if(!v.groupModeMigrationV12){if(v.mode==='all')v.mode='groups';await chrome.storage.local.set({mode:v.mode,groupModeMigrationV12:true});}
 return v;
}
function remember(tabId,windowId){
 if(!Number.isInteger(tabId)||!Number.isInteger(windowId))return;
 const prev=recents.get(windowId)||[];
 recents.set(windowId,[tabId,...prev.filter(id=>id!==tabId)].slice(0,150));
}
chrome.tabs.onActivated.addListener(({tabId,windowId})=>remember(tabId,windowId));
chrome.tabs.onRemoved.addListener(id=>{
 for(const [win,items] of recents)recents.set(win,items.filter(x=>x!==id));
 void enqueue(async()=>{for(const key of [MANUAL,HOMES,TITLES])await modify(key,o=>{delete o[String(id)];});});
});
chrome.tabs.onReplaced.addListener((added,removed)=>void enqueue(async()=>{
 for(const key of [MANUAL,HOMES,TITLES])await modify(key,o=>{if(Object.hasOwn(o,String(removed))){o[String(added)]=o[String(removed)];delete o[String(removed)];}});
}));
chrome.tabs.onUpdated.addListener((id,change,tab)=>{
 if(change.pinned===true&&tab.url)void enqueue(()=>modify(HOMES,o=>{o[String(id)]=tab.url;}));
 if(change.pinned===false)void enqueue(()=>modify(HOMES,o=>{delete o[String(id)];}));
});
async function initialize(){
 const tabs=await chrome.tabs.query({}),homes=await records(HOMES),valid=new Set(tabs.map(t=>String(t.id)));
 for(const t of tabs){if(t.active)remember(t.id,t.windowId);if(t.pinned&&t.url&&!homes[String(t.id)])homes[String(t.id)]=t.url;}
 for(const id of Object.keys(homes))if(!valid.has(id))delete homes[id];
 await chrome.storage.session.set({[HOMES]:homes});
}
function menus(){
 chrome.contextMenus.removeAll(()=>{
  chrome.contextMenus.create({id:MENU_PROTECT,title:'HeliumX: защитить / снять защиту',contexts:['tab']});
  chrome.contextMenus.create({id:MENU_HOME,title:'HeliumX: запомнить домашний URL закрепа',contexts:['tab']});
  chrome.contextMenus.create({id:MENU_RENAME,title:'Переименовать вкладку',contexts:['tab']});
 });
}
chrome.runtime.onInstalled.addListener(()=>{void enqueue(initialize);menus();});
chrome.runtime.onStartup.addListener(()=>{void enqueue(initialize);});
void enqueue(initialize);
chrome.contextMenus.onClicked.addListener((info,tab)=>{
 if(!Number.isInteger(tab?.id))return;
 if(info.menuItemId===MENU_RENAME){
  void chrome.windows.create({url:chrome.runtime.getURL('rename.html')+'?tabId='+tab.id,type:'popup',width:430,height:290});return;
 }
 void enqueue(async()=>{
  if(info.menuItemId===MENU_PROTECT){
   let enabled=false;
   await modify(MANUAL,o=>{if(o[String(tab.id)])delete o[String(tab.id)];else{o[String(tab.id)]=true;enabled=true;}});
   await notice(enabled?'Защита включена':'Защита отключена');
  } else if(info.menuItemId===MENU_HOME){
   if(!tab.pinned||!tab.url){await notice('Можно задать домашний URL только закреплённой вкладке');return;}
   await modify(HOMES,o=>{o[String(tab.id)]=tab.url;});await notice('Домашний URL обновлён');
  }
 });
});
function protectedTab(tab,v,manual){
 return tab.pinned||!!manual[String(tab.id)]||v.mode==='all'||v.mode==='groups'&&Number.isInteger(tab.groupId)&&tab.groupId>=0;
}
async function switchAway(tab){
 const tabs=await chrome.tabs.query({windowId:tab.windowId});
 const recent=recents.get(tab.windowId)||[];
 const choices=tabs.filter(t=>t.id!==tab.id).sort((a,b)=>{
  const ar=recent.indexOf(a.id),br=recent.indexOf(b.id);
  const av=ar<0?Infinity:ar,bv=br<0?Infinity:br;
  if(av!==bv)return av-bv;
  const ag=tab.groupId>=0&&a.groupId===tab.groupId?0:1,bg=tab.groupId>=0&&b.groupId===tab.groupId?0:1;
  return ag-bg||Math.abs(a.index-tab.index)-Math.abs(b.index-tab.index);
 });
 for(const t of choices){
  try{await chrome.tabs.update(t.id,{active:true});if(!(await chrome.tabs.get(tab.id)).active)return true;}catch(e){console.warn(e);}
 }
 await chrome.tabs.create({windowId:tab.windowId,active:true});
 return !(await chrome.tabs.get(tab.id)).active;
}
async function smartClose(forceSleep=false){
 const [tab]=await chrome.tabs.query({active:true,currentWindow:true});
 if(!tab?.id)return;
 const v=await settings(),manual=await records(MANUAL);
 if(!forceSleep&&!protectedTab(tab,v,manual)){
  await chrome.tabs.remove(tab.id);await notice('Обычная вкладка закрыта');return;
 }
 if(!(await switchAway(tab))){await notice('Не удалось переключить вкладку');return;}
 if(tab.pinned&&!forceSleep&&v.pinnedAction==='reset'){
  const homes=await records(HOMES),target=homes[String(tab.id)]||tab.url;
  if(target&&target!==tab.url){await chrome.tabs.update(tab.id,{url:target});await notice('Закреп возвращён на домашний URL');return;}
 }
 try{const result=await chrome.tabs.discard(tab.id);
  await notice(result?.discarded?'Вкладка сохранена и выгружена':'Вкладка сохранена, но браузер отказал в выгрузке');
 }catch(e){await notice('Вкладка сохранена, выгрузка не удалась: '+String(e?.message||e));}
}
chrome.commands.onCommand.addListener(cmd=>{if(cmd==='smart-close')void enqueue(()=>smartClose());});
chrome.runtime.onMessage.addListener((msg,sender,respond)=>{
 if(msg?.type==='sleep-current'){
  void enqueue(()=>smartClose(true)).then(()=>respond({ok:true}),e=>respond({ok:false,error:String(e)}));return true;
 }
 if(!['title:get','title:set','title:remove'].includes(msg?.type))return;
 void (async()=>{
  const id=msg.type==='title:get'?(sender.tab?.id??msg.tabId):msg.tabId;
  if(!Number.isInteger(id))throw Error('Не найдена вкладка');
  if(msg.type==='title:get'){const titles=await records(TITLES);return{name:titles[String(id)]||''};}
  const tab=await chrome.tabs.get(id);
  if(!/^https?:/.test(tab.url||''))throw Error('Переименование доступно только на веб-страницах');
  const name=msg.type==='title:remove'?'':String(msg.name||'').trim();
  if(name.length>120)throw Error('Максимум 120 символов');
  await enqueue(()=>modify(TITLES,o=>{if(name)o[String(id)]=name;else delete o[String(id)];}));
  try{await chrome.tabs.sendMessage(id,{type:'title:apply',name});}catch(e){}
  return{name};
 })().then(v=>respond({ok:true,...v}),e=>respond({ok:false,error:String(e?.message||e)}));
 return true;
});
