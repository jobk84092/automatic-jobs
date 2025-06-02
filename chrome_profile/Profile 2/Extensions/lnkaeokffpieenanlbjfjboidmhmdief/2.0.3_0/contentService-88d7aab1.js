import { n as n$1, p } from './storage-e4d9282e.js';
import { p as p$1, g, u } from './tools-bb3e9d9c.js';

const m=(e,t)=>{chrome.tabs.sendMessage(e.tab,e,t);},r=e=>{chrome.tabs.query({active:!0,currentWindow:!0},(t=>{t.length&&chrome.tabs.sendMessage(t[0].id,e,(()=>{}));}));},c=()=>{const m=document.getElementById(n$1);m&&m.remove();const r=document.getElementById(p);r&&document.getElementsByTagName("HEAD").item(0)?.removeChild(r),p$1(),g(),u();},n=()=>{const e=document.getElementById("crx-edit");e&&e.remove();};

export { c, m, n, r };
