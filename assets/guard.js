(()=>{
  'use strict';
  // Cosmetic deterrence only: browser developer tools cannot be made truly inaccessible from a public website.
  const blockedCombo=(e)=>{
    const k=(e.key||'').toLowerCase();
    if(e.key==='F12') return true;
    if(e.ctrlKey && e.shiftKey && ['i','j','c','k'].includes(k)) return true;
    if(e.ctrlKey && ['u','s'].includes(k)) return true;
    if(e.metaKey && e.altKey && ['i','j','c'].includes(k)) return true;
    return false;
  };
  window.addEventListener('contextmenu',e=>e.preventDefault(),{capture:true});
  window.addEventListener('keydown',e=>{
    if(!blockedCombo(e)) return;
    e.preventDefault();
    e.stopImmediatePropagation();
  },{capture:true});
  window.addEventListener('dragstart',e=>{
    if(e.target && e.target.tagName==='IMG') e.preventDefault();
  },{capture:true});
})();
