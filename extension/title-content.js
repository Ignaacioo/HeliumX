'use strict';
// Isolated content script; guard repeated injection after installing/updating extension.
if (!globalThis.__heliumXTitleScript) {
 globalThis.__heliumXTitleScript = true;
 let override = '';
 let original = '';
 let titleObserver = null;
 let rootObserver = null;
 let shell = null;
 let closing = null;

 function ensureTitle() {
  if (!document.documentElement) return null;
  let node = document.querySelector('head > title');
  if (!node && document.head) {
   node = document.createElement('title');
   document.head.appendChild(node);
  }
  return node;
 }
 function enforceTitle() {
  if (!override) return;
  const title = ensureTitle();
  if (title && title.textContent !== override) title.textContent = override;
 }
 function observeTitle() {
  titleObserver?.disconnect();
  const title = ensureTitle();
  if (!title) return;
  titleObserver = new MutationObserver(() => {
   if (override && title.textContent !== override) title.textContent = override;
  });
  titleObserver.observe(title,{subtree:true,characterData:true,childList:true});
 }
 function applyTitle(name) {
  name = String(name||'').trim();
  if (name.length > 120) throw Error('Максимум 120 символов');
  const node = ensureTitle();
  if (!node) throw Error('Заголовок страницы пока недоступен');
  if (!override && name) original = document.title;
  override = name;
  if (!name) {
   titleObserver?.disconnect();
   titleObserver = null;
   node.textContent = original || document.title;
  } else {
   node.textContent = name;
   observeTitle();
  }
  if (name && document.title !== name) throw Error('Сайт не разрешил изменить название');
  return document.title;
 }
 // Handle a site replacing its <title> element without busy polling.
 function watchHead() {
  if (rootObserver || !document.documentElement) return;
  rootObserver = new MutationObserver(() => {
   if (!override) return;
   const title = document.querySelector('head > title');
   if (!title) {enforceTitle();observeTitle();}
  });
  rootObserver.observe(document.documentElement,{childList:true,subtree:true});
 }
 function closeDialog() {
  if (!shell) return;
  shell.remove();shell=null;
  document.removeEventListener('keydown',closing,true);
  closing=null;
 }
 function openDialog() {
  if (shell) {shell.shadowRoot?.querySelector('input')?.focus();return;}
  if (!document.documentElement) throw Error('Страница ещё загружается');
  shell=document.createElement('div');
  shell.id='heliumx-rename-overlay';
  // Shadow DOM keeps modal styles separate from the site.
  const shadow=shell.attachShadow({mode:'closed'});
  const style=document.createElement('style');
  style.textContent=`
:host{all:initial;font-family:Inter,system-ui,-apple-system,sans-serif}
*{box-sizing:border-box}
.overlay{position:fixed;inset:0;z-index:2147483647;background:rgba(6,5,12,.55);display:grid;place-items:center;padding:24px}
.dialog{width:min(100%,380px);background:#1e1e2e;color:#cdd6f4;border:1px solid #45475a;border-radius:14px;padding:20px;box-shadow:0 20px 80px rgba(0,0,0,.55);font:14px system-ui,sans-serif}
.head{display:flex;align-items:center;justify-content:space-between;margin-bottom:15px}
h2{font-size:16px;font-weight:650;margin:0;color:#cdd6f4}
.x{background:transparent;border:0;color:#a6adc8;font-size:21px;cursor:pointer;padding:0 3px}
label{font-size:12px;color:#bac2de;display:block;margin-bottom:7px}
input{width:100%;border:1px solid #585b70;background:#313244;color:#cdd6f4;border-radius:8px;padding:11px 12px;font:14px system-ui;outline:none}
input:focus{border-color:#cba6f7;box-shadow:0 0 0 2px rgba(203,166,247,.2)}
.actions{display:flex;justify-content:flex-end;gap:8px;margin-top:16px}
button{font:13px system-ui;padding:9px 14px;border:1px solid #585b70;background:#313244;color:#cdd6f4;border-radius:8px;cursor:pointer}
button.primary{background:#cba6f7;color:#1e1e2e;border-color:#cba6f7;font-weight:650}
.status{font-size:12px;min-height:16px;color:#fab387;margin-top:9px}
`;
  const overlay=document.createElement('div');
  overlay.className='overlay';
  const dialog=document.createElement('div');
  dialog.className='dialog';
  dialog.setAttribute('role','dialog');
  dialog.setAttribute('aria-modal','true');
  dialog.setAttribute('aria-labelledby','heliumx-dialog-title');
  const head=document.createElement('div');head.className='head';
  const title=document.createElement('h2');title.id='heliumx-dialog-title';title.textContent='Переименовать вкладку';
  const x=document.createElement('button');x.className='x';x.type='button';x.textContent='×';x.setAttribute('aria-label','Закрыть');x.addEventListener('click',closeDialog);
  head.append(title,x);
  const form=document.createElement('form');
  const label=document.createElement('label');label.textContent='Название';label.htmlFor='heliumx-name';
  const input=document.createElement('input');input.id='heliumx-name';input.maxLength=120;input.required=true;input.value=override||'';
  input.placeholder='Например, Расписание';
  const actions=document.createElement('div');actions.className='actions';
  const reset=document.createElement('button');reset.type='button';reset.textContent='Сбросить';
  const cancel=document.createElement('button');cancel.type='button';cancel.textContent='Отмена';
  const save=document.createElement('button');save.type='submit';save.className='primary';save.textContent='Сохранить';
  actions.append(reset,cancel,save);
  const status=document.createElement('div');status.className='status';status.setAttribute('role','status');
  form.append(label,input,actions,status);dialog.append(head,form);overlay.append(dialog);shadow.append(style,overlay);
  overlay.addEventListener('mousedown',e=>{if(e.target===overlay)closeDialog();});
  cancel.addEventListener('click',closeDialog);
  function submit(type){
   save.disabled=true;reset.disabled=true;
   status.textContent='';
   chrome.runtime.sendMessage({type,tabId:null,name:input.value}).then(r=>{
    if(!r?.ok)throw Error(r?.error||'Не удалось переименовать');
    closeDialog();
   }).catch(e=>status.textContent=String(e?.message||e)).finally(()=>{
    save.disabled=false;reset.disabled=false;
   });
  }
  // Page content script has no tabId, background resolves the sender's tab.
  form.addEventListener('submit',e=>{e.preventDefault();submit('title:set');});
  reset.addEventListener('click',()=>submit('title:remove'));
  shell.appendChild(document.createTextNode(''));
  document.documentElement.appendChild(shell);
  // Closed shadow root: use local 'input' reference, not shell.shadowRoot.
  closing=e=>{if(e.key==='Escape'){e.preventDefault();closeDialog();}};
  document.addEventListener('keydown',closing,true);
  input.focus();input.select();
 }
 chrome.runtime.onMessage.addListener((message,sender,reply)=>{
  if (message?.type==='title:dialog') {
   try{openDialog();reply({ok:true});}catch(e){reply({ok:false,error:String(e.message||e)});}
   return;
  }
  if (message?.type==='title:apply') {
   try{const title=applyTitle(message.name);reply({ok:true,title:message.name?title:''});}
   catch(e){reply({ok:false,error:String(e.message||e)});}
  }
 });
 watchHead();
 if (!document.documentElement)document.addEventListener('readystatechange',watchHead,{once:true});
 chrome.runtime.sendMessage({type:'title:get'}).then(r=>{
  if (!r?.ok||!r.name)return;
  const run=()=>{try{applyTitle(r.name);}catch(e){console.warn('HeliumX title restore:',e);}};
  if(document.head)run();
  else document.addEventListener('DOMContentLoaded',run,{once:true});
 }).catch(()=>{});
}
