'use strict';
const mode=document.getElementById('mode'),pinned=document.getElementById('pinnedAction'),status=document.getElementById('status');
chrome.storage.local.get({mode:'groups',pinnedAction:'sleep',lastResult:null,groupModeMigrationV12:false}).then(async v=>{
 if(!v.groupModeMigrationV12){if(v.mode==='all')v.mode='groups';await chrome.storage.local.set({mode:v.mode,groupModeMigrationV12:true});}
 mode.value=v.mode;pinned.value=v.pinnedAction;status.textContent=v.lastResult?.message||'';
}).catch(e=>status.textContent=String(e));
mode.addEventListener('change',()=>void chrome.storage.local.set({mode:mode.value,groupModeMigrationV12:true}));
pinned.addEventListener('change',()=>void chrome.storage.local.set({pinnedAction:pinned.value}));
document.getElementById('sleep').addEventListener('click',async()=>{
 status.textContent='Выполняется…';
 try{const r=await chrome.runtime.sendMessage({type:'sleep-current'});if(!r?.ok)throw Error(r.error);status.textContent=(await chrome.storage.local.get('lastResult')).lastResult?.message||'Готово';}
 catch(e){status.textContent=String(e.message||e);}
});
const input=document.getElementById('custom-title'),titleStatus=document.getElementById('title-status');
let tabId=null;
chrome.tabs.query({active:true,currentWindow:true}).then(async ([tab])=>{
 if(!tab)return;tabId=tab.id;
 const r=await chrome.runtime.sendMessage({type:'title:get',tabId});
 if(r?.ok)input.value=r.name||'';
 const info=document.getElementById('group-info');
 info.textContent=tab.pinned?'Закреплённая вкладка защищена':Number.isInteger(tab.groupId)&&tab.groupId>=0?'Группа Chromium: '+tab.groupId:'Нет стандартного groupId. Папки Helium могут быть недоступны.';
}).catch(e=>titleStatus.textContent=String(e));
async function rename(type){
 if(tabId===null)return;
 try{const r=await chrome.runtime.sendMessage({type,tabId,name:input.value});if(!r?.ok)throw Error(r.error);titleStatus.textContent=type==='title:remove'?'Название восстановлено':'Название сохранено';if(type==='title:remove')input.value='';}
 catch(e){titleStatus.textContent=String(e.message||e);}
}
document.getElementById('rename-form').addEventListener('submit',e=>{e.preventDefault();void rename('title:set');});
document.getElementById('restore-title').addEventListener('click',()=>void rename('title:remove'));
