'use strict';
const tabId=Number(new URLSearchParams(location.search).get('tabId')),input=document.getElementById('name'),status=document.getElementById('status');
chrome.runtime.sendMessage({type:'title:get',tabId}).then(r=>{if(r?.ok)input.value=r.name||'';else status.textContent=r.error||'Ошибка';}).catch(e=>status.textContent=String(e));
async function change(type){
 try{const r=await chrome.runtime.sendMessage({type,tabId,name:input.value});if(!r?.ok)throw Error(r.error);status.textContent=type==='title:set'?'Название изменено':'Название восстановлено';if(type==='title:remove')input.value='';}
 catch(e){status.textContent=String(e.message||e);}
}
document.getElementById('form').addEventListener('submit',e=>{e.preventDefault();void change('title:set');});
document.getElementById('reset').addEventListener('click',()=>void change('title:remove'));
