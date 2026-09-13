(()=>{
  const $=q=>document.querySelector(q); const $$=q=>[...document.querySelectorAll(q)];
  const state={data:null,view:'home',readerIssue:null,readerPosition:0,readerBusy:false,readerAspect:.707,readerTimer:null};
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const svgArrow='<svg viewBox="0 0 24 24"><path d="M5 12h14m-5-5 5 5-5 5"/></svg>';

  const LIVE_CONTENT_URL='https://raw.githubusercontent.com/PauvNews/pauvnews.github.io/main/data/content.json';
  let liveSignature='';

  async function fetchLiveContent(){
    const liveUrl=LIVE_CONTENT_URL+(LIVE_CONTENT_URL.includes('?')?'&':'?')+'vf='+Date.now();
    try{
      const r=await fetch(liveUrl,{cache:'no-store',headers:{'Accept':'application/json'}});
      if(r.ok)return await r.json();
    }catch(e){console.warn('Weazel live data fallback:',e)}
    const local=await fetch('data/content.json?v='+Date.now(),{cache:'no-store'});
    if(!local.ok)throw new Error('content.json yüklenemedi');
    return await local.json();
  }

  function dataSignature(data){
    try{return JSON.stringify(data)}catch{return String(Date.now())}
  }

  async function refreshLiveContent(){
    if(document.hidden)return;
    try{
      const next=await fetchLiveContent();
      const sig=dataSignature(next);
      if(sig===liveSignature)return;
      liveSignature=sig; state.data=next;
      renderAll(); applySpotlights(); if(state.view==='home')setupTicker();
    }catch(e){console.warn('Weazel live refresh:',e)}
  }

  async function boot(){
    state.data=await fetchLiveContent();
    liveSignature=dataSignature(state.data);
    const saved=localStorage.getItem('weazel-theme');
    document.documentElement.classList.toggle('dark',saved!=='light');
    renderAll(); bind(); applySpotlights(); setupTicker(); handleDeepLink();
    setInterval(refreshLiveContent,6000);
  }

  function renderAll(){renderHome();renderNews();renderIssues();}
  function titleBlock(kicker,title){return `<div class="section-title"><small>${esc(kicker)}</small><h2>${esc(title)}</h2></div>`}
  function articleCard(a){return `<article class="news-card shine-card" data-article="${esc(a.id)}"><div class="news-card-media"><img src="${esc(a.image)}" alt=""><span class="card-arrow">${svgArrow}</span></div><div class="news-card-copy"><span class="kicker">${esc(a.category)}</span><h3>${esc(a.headline)}</h3><p>${esc(a.summary||'')}</p><div class="card-meta"><span>${esc(a.author||'Weazel News')}</span><span>${esc(a.date||'')}</span></div></div></article>`}
  function issueCard(i){return `<article class="issue-card shine-card" data-issue="${esc(i.id)}"><img src="${esc(i.cover)}" alt=""><div class="issue-copy"><span class="kicker">SAYI #${esc(i.number)}</span><h3>${esc(i.headline)}</h3><p>${esc(i.summary||'')}</p><small>${esc(i.date)} • ${(i.pages||[]).length} sayfa</small></div></article>`}

  function renderHome(){
    const d=state.data,f=d.featured,latest=d.issues?.[0];
    const ticker=(d.articles||[]).map(a=>`<b>${esc(a.category)}</b> — ${esc(a.headline)} <i class="ticker-dot">•</i>`).join('');
    $('#homeView').innerHTML=`
      <div class="breaking-strip glass"><span class="breaking-badge"><i></i> WEAZEL LIVE</span><div class="breaking-track"><div class="breaking-loop"><span class="breaking-copy ticker-seed">${ticker}</span></div></div></div>
      <section class="hero">
        <article class="featured" data-featured><img src="${esc(f.image)}" alt=""><div class="featured-copy"><span class="kicker">ÖNE ÇIKAN • ${esc(f.category)}</span><h1>${esc(f.headline)}</h1><p>${esc(f.summary)}</p><div class="featured-meta"><span>${esc(f.author||'Weazel News')}</span><i></i><span>${esc(f.date||'')}</span></div></div><span class="hero-cta">${svgArrow}</span></article>
        <div class="side-stack">
          ${latest?`<article class="latest-issue" data-issue="${esc(latest.id)}"><img src="${esc(latest.cover)}" alt=""><span class="issue-number">#${esc(latest.number)}</span><div class="latest-issue-copy"><span class="kicker">SON GAZETE</span><h2>${esc(latest.headline)}</h2><small>${esc(latest.date)} • ${latest.pages.length} sayfa</small></div></article>`:''}
          <section class="pulse-card glass shine-card"><div class="pulse-head"><span>WEAZEL DESK</span><span class="live-pill"><i></i> CANLI</span></div><h3>Şehrin sesi, tek merkezde.</h3><p>Haberler, özel dosyalar ve Weazel gazete arşivi. Oyun içinden yayınlanan içerikler burada otomatik olarak arşivlenecek.</p><div class="pulse-stats"><div><b>${d.articles.length}</b><span>Haber</span></div><div><b>${d.issues.length}</b><span>Sayı</span></div><div><b>${d.issues.reduce((n,x)=>n+(x.pages?.length||0),0)}</b><span>Sayfa</span></div></div></section>
        </div>
      </section>
      <div class="section-head">${titleBlock('WEAZEL DESK','Son Haberler')}<span>${d.articles.length} yayın</span></div>
      <section class="news-grid">${d.articles.slice(0,5).map(articleCard).join('')}</section>
      <section class="weazel-chaos glass">
        <div class="chaos-copy">
          <span class="kicker">WEAZEL EDİTORYAL STANDARTLARI™</span>
          <h2>Haberi kontrol ettik. <em>Sayılır.</em></h2>
          <p>Los Santos’ta gerçekler hızlıdır, Weazel daha hızlı. Panik yaratmadan haber yapıyoruz; panik kendi kendine oluşursa sorumluluk kabul etmiyoruz.</p>
          <div class="chaos-quote">“Önce yayına gir. Sonra ‘kaynak kimdi?’ diye sorarız.” <span>— gece vardiyası, muhtemelen</span></div>
        </div>
        <div class="chaos-meter">
          <div class="meter-top"><span>BUGÜNÜN YAYIN KARIŞIMI</span><b>WEAZEL ÖLÇER</b></div>
          <div class="meter-bar"><i style="--w:91%"></i></div>
          <div class="meter-legend"><span><b>91%</b> Drama</span><span><b>8%</b> Kahve</span><span><b>1%</b> Hukuki risk</span></div>
          <div class="chaos-grid">
            <div><small>KAYNAK</small><b>“Bize öyle dendi.”</b></div>
            <div><small>ACİLİYET</small><b>Sireni duyduysak son dakika.</b></div>
            <div><small>DÜZELTME</small><b>Gerekirse yarın daha büyük başlıkla.</b></div>
          </div>
        </div>
      </section>`;
  }

  function renderNews(){
    const d=state.data;
    $('#newsView').innerHTML=`<div class="page-heading"><div><span class="kicker">WEAZEL NEWSROOM</span><h1>Haberler</h1></div><p>Los Santos’un gündemi, özel dosyaları ve sahadan gelen son gelişmeler. Weazel yayın masasında ne varsa burada.</p></div><section class="news-grid">${d.articles.map(articleCard).join('')}</section>`;
  }

  function renderIssues(){
    const d=state.data,latest=d.issues?.[0];
    $('#issuesView').innerHTML=`<div class="page-heading"><div><span class="kicker">WEAZEL ARCHIVE</span><h1>Gazete Arşivi</h1></div><p>Weazel’in yayımlanan bütün gazete sayıları. Kapağı seç, alttaki oklarla gazeteyi çevir ve sayfalar arasında gez.</p></div>${latest?`<section class="issues-featured"><div class="issues-featured-cover"><img src="${esc(latest.cover)}" alt=""><div class="issues-featured-number"><small>SON SAYI</small><b>#${esc(latest.number)}</b></div></div><div class="issues-featured-copy"><span class="kicker">${esc(latest.title||'WEAZEL GAZETE')}</span><h1>${esc(latest.headline)}</h1><p>${esc(latest.summary||'')}</p><div class="issue-actions"><button class="primary-btn" data-issue="${esc(latest.id)}">Gazeteyi Oku ${svgArrow}</button><button class="secondary-btn" data-nav="home">Ana Sayfaya Dön</button></div></div></section>`:''}<div class="section-head">${titleBlock('TÜM SAYILAR','Arşiv')}<span>${d.issues.length} sayı</span></div><section class="issues-grid">${d.issues.map(issueCard).join('')}</section>`;
  }

  function setView(v,push=true){
    if(!['home','news','issues'].includes(v))v='home'; state.view=v;
    $$('.view').forEach(el=>el.classList.toggle('active',el.id===v+'View'));
    $$('[data-nav]').forEach(b=>b.classList.toggle('active',b.dataset.nav===v));
    if(push) history.replaceState({view:v},'',`#${v}`);
    window.scrollTo({top:0,behavior:'smooth'}); setTimeout(()=>{applySpotlights();if(v==='home')setupTicker()},20);
  }

  function findArticle(id){return state.data.articles.find(x=>String(x.id)===String(id));}
  function openArticle(articleOrId){
    let a=typeof articleOrId==='object'?articleOrId:findArticle(articleOrId); if(!a)return;
    $('#articleModalImage').src=a.image||''; $('#articleModalCategory').textContent=a.category||'HABER'; $('#articleModalTitle').textContent=a.headline||'';
    $('#articleModalMeta').textContent=`${a.author||'Weazel News'} • ${a.date||''}`; $('#articleModalBody').textContent=a.body||a.summary||'';
    $('#articleModal').classList.add('open'); $('#articleModal').setAttribute('aria-hidden','false'); document.body.style.overflow='hidden';
  }
  function closeArticle(){const m=$('#articleModal');m.classList.remove('open');m.setAttribute('aria-hidden','true');clearDeepLink();if(!$('#readerModal').classList.contains('open')&&!$('#searchModal').classList.contains('open'))document.body.style.overflow='';}

  function preloadImage(src){return new Promise(resolve=>{if(!src){resolve(null);return}const img=new Image();let done=false;const finish=()=>{if(done)return;done=true;resolve(img)};img.onload=finish;img.onerror=finish;img.src=src;if(img.complete)finish();setTimeout(finish,6000)})}
  async function imageMeta(src){const img=await preloadImage(src);return {width:Math.max(1,img?.naturalWidth||1000),height:Math.max(1,img?.naturalHeight||1414)}}

  function readerPositions(total){
    if(total<=1)return[0];
    const out=[0];
    for(let i=1;i<total-1;i+=2)out.push(i);
    if(out[out.length-1]!==total-1)out.push(total-1);
    return out;
  }
  function readerPagesAt(pos,total){
    if(total<=1||pos<=0||pos>=total-1)return[pos];
    if(pos+1<total-1)return[pos,pos+1];
    return[pos];
  }
  function readerCounterText(pos,total){
    const pages=readerPagesAt(pos,total);
    return pages.length===2?`${pages[0]+1}–${pages[1]+1} / ${total}`:`${pages[0]+1} / ${total}`;
  }
  function readerPageHtml(src,index,side='single'){
    return `<figure class="reader-sheet ${side}"><img src="${esc(src)}" alt="Gazete sayfası ${index+1}" draggable="false"></figure>`;
  }
  function sizeReader(total,pos){
    const stage=$('#readerStage'),host=$('#readerBook');if(!stage||!host)return;
    const rect=stage.getBoundingClientRect(),pages=readerPagesAt(pos,total),double=pages.length===2;
    const ratio=Math.max(.42,Math.min(.95,state.readerAspect||.707));
    const maxH=Math.max(360,rect.height*.88),maxW=Math.max(300,rect.width*.92);
    let pageH=Math.min(maxH,double?maxW/(2*ratio):maxW/ratio);
    let pageW=pageH*ratio;
    if(double&&pageW*2>maxW){pageW=maxW/2;pageH=pageW/ratio}
    if(!double&&pageW>Math.min(620,maxW)){pageW=Math.min(620,maxW);pageH=pageW/ratio}
    host.style.setProperty('--page-w',`${Math.round(pageW)}px`);host.style.setProperty('--page-h',`${Math.round(pageH)}px`);
    host.style.width=`${Math.round(pageW*(double?2:1))}px`;host.style.height=`${Math.round(pageH)}px`;
  }
  function renderReaderPage(animateClass=''){
    const issue=state.readerIssue;if(!issue)return;
    const pages=issue.pages||[],total=pages.length,pos=Math.max(0,Math.min(total-1,state.readerPosition||0));state.readerPosition=pos;
    const host=$('#readerBook');if(!host)return;
    const idxs=readerPagesAt(pos,total);host.className=`reader-book custom-reader ${idxs.length===2?'spread':'single'} ${animateClass}`.trim();
    host.innerHTML=idxs.map((idx,i)=>readerPageHtml(pages[idx]||'',idx,idxs.length===2?(i===0?'left':'right'):'single')).join('');
    sizeReader(total,pos);
    $('#readerCounter').textContent=readerCounterText(pos,total);
    const positions=readerPositions(total),slot=Math.max(0,positions.indexOf(pos));
    $('#readerPrev').disabled=slot<=0;$('#readerNext').disabled=slot>=positions.length-1;
    const center=$('#readerCenterer');if(center){center.className='reader-centerer '+(idxs.length===2?'inside-spread':pos===0?'front-cover':'back-cover')}
  }
  function destroyReader(){
    clearTimeout(state.readerTimer);state.readerTimer=null;state.readerBusy=false;state.readerPosition=0;
    const host=$('#readerBook');if(host){host.className='reader-book custom-reader';host.replaceChildren();host.removeAttribute('style')}
  }
  async function openIssue(id){
    const issue=state.data.issues.find(x=>String(x.id)===String(id));if(!issue)return;
    destroyReader();state.readerIssue=issue;state.readerPosition=0;
    $('#readerTitle').textContent=issue.headline;$('#readerMeta').textContent=`Sayı #${issue.number} • ${issue.pages.length} sayfa`;
    const m=$('#readerModal');m.classList.add('open');m.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';
    const meta=await imageMeta(issue.pages?.[0]);state.readerAspect=Math.max(.42,Math.min(.95,meta.width/meta.height));
    await Promise.allSettled((issue.pages||[]).slice(0,4).map(preloadImage));
    if(state.readerIssue!==issue||!m.classList.contains('open'))return;
    requestAnimationFrame(()=>renderReaderPage('reader-enter'));
  }
  function goReader(dir){
    const issue=state.readerIssue;if(!issue||state.readerBusy)return;
    const total=issue.pages.length,positions=readerPositions(total),slot=positions.indexOf(state.readerPosition),targetSlot=slot+dir;
    if(targetSlot<0||targetSlot>=positions.length)return;
    state.readerBusy=true;
    const host=$('#readerBook');if(!host){state.readerBusy=false;return}
    host.classList.remove('flip-out-next','flip-out-prev','flip-in-next','flip-in-prev');
    void host.offsetWidth;host.classList.add(dir>0?'flip-out-next':'flip-out-prev');
    state.readerTimer=setTimeout(()=>{
      state.readerPosition=positions[targetSlot];
      renderReaderPage(dir>0?'flip-in-next':'flip-in-prev');
      state.readerTimer=setTimeout(()=>{const h=$('#readerBook');if(h)h.classList.remove('flip-in-next','flip-in-prev');state.readerBusy=false},230);
    },170);
  }
  function readerPrev(){goReader(-1)}
  function readerNext(){goReader(1)}
  function closeReader(){
    const m=$('#readerModal');if(m){m.classList.remove('open');m.setAttribute('aria-hidden','true')}
    document.body.style.overflow='';state.readerIssue=null;clearDeepLink();requestAnimationFrame(()=>destroyReader());
  }

  function openSearch(){const m=$('#searchModal');m.classList.add('open');m.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';$('#searchInput').value='';renderSearch('');setTimeout(()=>$('#searchInput').focus(),60)}
  function closeSearch(){const m=$('#searchModal');m.classList.remove('open');m.setAttribute('aria-hidden','true');if(!$('#articleModal').classList.contains('open')&&!$('#readerModal').classList.contains('open'))document.body.style.overflow=''}
  function renderSearch(query){const q=query.trim().toLocaleLowerCase('tr');const rows=[];(state.data.articles||[]).forEach(a=>{if(!q||`${a.headline} ${a.summary} ${a.category}`.toLocaleLowerCase('tr').includes(q))rows.push({type:'article',id:a.id,img:a.image,title:a.headline,meta:`${a.category} • ${a.date}`})});(state.data.issues||[]).forEach(i=>{if(!q||`${i.headline} ${i.summary} ${i.title}`.toLocaleLowerCase('tr').includes(q))rows.push({type:'issue',id:i.id,img:i.cover,title:i.headline,meta:`Gazete • Sayı #${i.number}`})});$('#searchResults').innerHTML=rows.length?rows.slice(0,8).map(r=>`<button class="search-result" data-search-type="${r.type}" data-search-id="${esc(r.id)}"><img src="${esc(r.img)}" alt=""><div><b>${esc(r.title)}</b><small>${esc(r.meta)}</small></div><span>↗</span></button>`).join(''):'<div class="search-empty">Sonuç bulunamadı.</div>'}

  let tickerResizeTimer=null;
  function setupTicker(){
    const track=$('.breaking-track'),loop=$('.breaking-loop');
    if(!track||!loop)return;
    const seed=loop.querySelector('.ticker-seed');
    if(!seed)return;
    loop.querySelectorAll('.breaking-copy:not(.ticker-seed)').forEach(node=>node.remove());
    loop.classList.remove('ticker-running');
    loop.style.removeProperty('--ticker-shift');
    loop.style.removeProperty('--ticker-duration');
    requestAnimationFrame(()=>{
      const unit=Math.ceil(seed.getBoundingClientRect().width);
      const viewport=Math.ceil(track.getBoundingClientRect().width);
      if(!unit||!viewport)return;
      const copies=Math.max(2,Math.ceil((viewport+unit)/unit)+1);
      for(let i=1;i<copies;i++){
        const clone=seed.cloneNode(true);
        clone.classList.remove('ticker-seed');
        clone.setAttribute('aria-hidden','true');
        loop.appendChild(clone);
      }
      loop.style.setProperty('--ticker-shift',`${unit}px`);
      loop.style.setProperty('--ticker-duration',`${Math.max(14,unit/58).toFixed(2)}s`);
      void loop.offsetWidth;
      loop.classList.add('ticker-running');
    });
  }

  function applySpotlights(){
    $$('.shine-card,.featured').forEach(card=>{if(card.dataset.shineBound)return;card.dataset.shineBound='1';card.addEventListener('pointermove',e=>{const r=card.getBoundingClientRect();card.style.setProperty('--mx',`${e.clientX-r.left}px`);card.style.setProperty('--my',`${e.clientY-r.top}px`)})})
  }

  function clearDeepLink(){
    const url=new URL(location.href);
    url.searchParams.delete('article');
    url.searchParams.delete('issue');
    history.replaceState(history.state,'',url.pathname+(url.searchParams.toString()?('?'+url.searchParams.toString()):'')+url.hash);
  }

  function handleDeepLink(){
    const params=new URLSearchParams(location.search);
    const article=params.get('article');
    const issue=params.get('issue');
    if(issue){setView('issues',false);setTimeout(()=>openIssue(issue),40);return}
    if(article){setView('news',false);setTimeout(()=>openArticle(article),40)}
  }

  function bind(){
    document.addEventListener('click',e=>{
      const nav=e.target.closest('[data-nav]');if(nav){setView(nav.dataset.nav);return}
      const art=e.target.closest('[data-article]');if(art){openArticle(art.dataset.article);return}
      if(e.target.closest('[data-featured]')){openArticle({...state.data.featured,author:state.data.featured.author||'Weazel News',body:state.data.featured.body||state.data.featured.summary});return}
      const issue=e.target.closest('[data-issue]');if(issue){openIssue(issue.dataset.issue);return}
      const close=e.target.closest('[data-close]');if(close){close.dataset.close==='article'?closeArticle():closeSearch();return}
      const result=e.target.closest('[data-search-type]');if(result){const t=result.dataset.searchType,id=result.dataset.searchId;closeSearch();setTimeout(()=>t==='issue'?openIssue(id):openArticle(id),80)}
    });
    $('#readerClose').addEventListener('click',e=>{e.preventDefault();e.stopPropagation();closeReader()});
    $('#readerPrev').addEventListener('click',e=>{e.preventDefault();e.stopPropagation();readerPrev()});
    $('#readerNext').addEventListener('click',e=>{e.preventDefault();e.stopPropagation();readerNext()});
    $('#searchButton').onclick=openSearch;$('#searchInput').addEventListener('input',e=>renderSearch(e.target.value));
    $('#themeButton').onclick=()=>{document.documentElement.classList.toggle('dark');localStorage.setItem('weazel-theme',document.documentElement.classList.contains('dark')?'dark':'light')};
    window.addEventListener('keydown',e=>{if(e.key==='Escape'){if($('#readerModal').classList.contains('open'))closeReader();else if($('#articleModal').classList.contains('open'))closeArticle();else if($('#searchModal').classList.contains('open'))closeSearch()}if($('#readerModal').classList.contains('open')){if(e.key==='ArrowLeft')readerPrev();if(e.key==='ArrowRight')readerNext()}});
    window.addEventListener('resize',()=>{clearTimeout(tickerResizeTimer);tickerResizeTimer=setTimeout(()=>{if(state.view==='home')setupTicker()},120)});
    const initial=location.hash.replace('#','');if(['home','news','issues'].includes(initial))setView(initial,false);
  }

  boot().catch(err=>{console.error(err);document.body.innerHTML='<div style="padding:48px;font:700 14px system-ui;color:white;background:#111;min-height:100vh">Weazel News yüklenemedi.</div>'});
})();
