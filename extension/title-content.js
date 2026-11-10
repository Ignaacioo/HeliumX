'use strict';
// Set only document.title. No page content is collected or transmitted.
let renamed='',previous='',observer=null;
function apply(){
 if(!renamed||!document.head)return;
 if(document.title!==renamed){if(document.title!==previous)previous=document.title;document.title=renamed;}
}
function setName(name){
 if(!renamed&&name)previous=document.title;
 renamed=name;
 if(!name){observer?.disconnect();observer=null;if(previous)document.title=previous;return;}
 apply();
 if(!observer){observer=new MutationObserver(()=>{if(renamed)apply();});observer.observe(document.documentElement,{subtree:true,childList:true,characterData:true});}
}
chrome.runtime.onMessage.addListener(msg=>{if(msg?.type==='title:apply')setName(String(msg.name||''));});
chrome.runtime.sendMessage({type:'title:get'}).then(r=>{
 if(r?.ok&&r.name){
  if(document.head)setName(r.name);else document.addEventListener('DOMContentLoaded',()=>setName(r.name),{once:true});
 }
}).catch(()=>{});
