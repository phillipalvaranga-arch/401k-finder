const KEY='k401finder_v1';
const STEPS=[
{id:'dol',t:'1. DOL Retirement Savings Lost and Found',u:'https://lostandfound.dol.gov/',d:'U.S. Labor Department database of retirement plans that owe benefits. Free. You sign in with Login.gov (that is the government site, not this app).'},
{id:'nrurb',t:'2. National Registry of Unclaimed Retirement Benefits',u:'https://www.unclaimedretirementbenefits.com/',d:'Free nationwide registry where employers list former workers with unclaimed plan money.'},
{id:'tx',t:'3. Texas unclaimed property (ClaimItTexas)',u:'https://www.claimittexas.gov/',d:'Texas Comptroller\'s free search. Cashed-out or abandoned accounts are sometimes turned over to the state. Search your name and old addresses.'},
{id:'mm',t:'4. MissingMoney.com (many states at once)',u:'https://www.missingmoney.com/',d:'Free multi-state unclaimed property search endorsed by state treasurers. Search every state you have lived or worked in.'},
{id:'naupa',t:'5. NAUPA – each state\'s official site',u:'https://unclaimed.org/',d:'Links to every state\'s official unclaimed property office, for states not covered by MissingMoney.'},
{id:'ssa',t:'6. Social Security "Notice of Potential Private Retirement Benefit Information" (Form SSA-L99-C1)',u:'https://www.pbgc.gov/about/advocate/resources/ssa-notice',d:'Social Security keeps records (from the IRS) of retirement plans where you left vested money. The notice is Form SSA-L99-C1 (sometimes called "L99"). Social Security mails it when you file for benefits, or after a written request. To ask for it now, call Social Security at 1-800-772-1213 or visit your local office and ask to request it. Do this by phone or in person with Social Security, never in this app. The link explains the notice (PBGC). If you get one, enter the plan number in the DOL lookup below.',x:[['DOL lookup for notice plan numbers','https://www.askebsa.dol.gov/WebIntake/home.aspx/ssasearch']]},
{id:'efast',t:'7. Form 5500 search (EFAST2) – find a former employer\'s plan',u:'https://www.efast.dol.gov/5500Search/',d:'Public federal filings. Search the old employer\'s name to get the plan name, plan number and administrator\'s phone and address. Use the Employers tab to search each employer.'},
{id:'pbgc',t:'8. PBGC unclaimed / missing participants search',u:'https://www.pbgc.gov/workers-retirees/find-unclaimed-retirement-benefits',d:'Pension Benefit Guaranty Corporation search for benefits from plans that ended. Free.'},
{id:'w2',t:'9. Check old W-2s – Box 12 code D',d:'Code D in box 12 means you put money into a 401(k) that year. Any employer with a code D likely holds or held a 401(k) for you. Add those employers in the Employers tab.'},
{id:'hr',t:'10. Call each former employer\'s HR / benefits office',d:'Ask: "Did I have a 401(k), who is the plan recordkeeper, and what is their phone number?"'},
{id:'rk',t:'11. Call the plan recordkeeper',d:'Common recordkeepers: Fidelity, Vanguard, Empower, Principal, Voya, Alight, T. Rowe Price, John Hancock, Schwab, Prudential, Transamerica. Look up the phone number on the recordkeeper\'s own official website.'},
{id:'merge',t:'12. If a company merged or was bought, search the new company',d:'Plans usually move to the buyer. Search the new company\'s name in the Form 5500 search and call its HR.'}];
const STAT=[['done','Done'],['found','Found'],['none','Nothing found']];
const ACC=['searching','found','contacted','rolled over','cashed'];
let S=JSON.parse(localStorage.getItem(KEY)||'null')||{steps:{},emps:[]};
const save=()=>localStorage.setItem(KEY,JSON.stringify(S));
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const money=n=>'$'+(+n||0).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});
const bad=v=>/\b\d{3}-?\d{2}-?\d{4}\b/.test(v);
let tab='summary';
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>{tab=b.dataset.tab;document.querySelectorAll('nav button').forEach(x=>x.classList.toggle('on',x===b));render()});
function render(){const m=document.getElementById('main');m.innerHTML=({summary,steps,employers,backup})[tab]();bind()}
function summary(){
 const done=STEPS.filter(s=>S.steps[s.id]).length;const found=S.emps.filter(e=>['found','contacted','rolled over'].includes(e.status));
 const tot=S.emps.filter(e=>e.status!=='cashed').reduce((a,e)=>a+(+e.balance||0),0);
 const next=[];const ns=STEPS.find(s=>!S.steps[s.id]);if(ns)next.push('Do search step: '+ns.t);
 if(!S.emps.length)next.push('Add your past employers in the Employers tab (check old W-2s for box 12 code D).');
 S.emps.forEach(e=>{if(e.status==='searching')next.push(`${e.name}: run the Form 5500 search, then call HR or the plan administrator.`);
  if(e.status==='found')next.push(`${e.name}: contact ${e.rk||'the recordkeeper'}${e.phone?' at '+e.phone:''} to confirm the balance.`);
  if(e.status==='contacted')next.push(`${e.name}: decide whether to roll it over into an IRA or your current plan.`)});
 return `<div class="card"><div class="mut">Total found (not cashed)</div><div class="big">${money(tot)}</div>
 <div class="grid"><div>Accounts found: <b>${found.length}</b></div><div>Employers tracked: <b>${S.emps.length}</b></div><div>Search steps finished: <b>${done} / ${STEPS.length}</b></div></div></div>
 <div class="card"><h3>Next actions</h3>${next.length?'<ul>'+next.slice(0,8).map(x=>`<li>${esc(x)}</li>`).join('')+'</ul>':'All caught up! 🎉'}</div>
 ${S.emps.length?`<div class="card"><h3>Accounts</h3><ul>${S.emps.map(e=>`<li><b>${esc(e.name)}</b> – ${esc(e.status)}${e.balance?' – '+money(e.balance):''}</li>`).join('')}</ul></div>`:''}`}
function steps(){return STEPS.map(s=>`<div class="card"><h3>${esc(s.t)}</h3><div>${esc(s.d)}</div><div class="row">
 ${s.u?`<a class="btn go" href="${s.u}" target="_blank" rel="noopener">Open search ↗</a>`:''}${(s.x||[]).map(([n,u])=>`<a class="btn" href="${u}" target="_blank" rel="noopener">${esc(n)} ↗</a>`).join('')}</div>
 <div class="row st">${STAT.map(([k,l])=>`<button class="sel ${k} ${S.steps[s.id]===k?'sel '+k:''}" style="${S.steps[s.id]===k?'':'background:var(--card)'}" data-step="${s.id}" data-v="${k}">${S.steps[s.id]===k?'✔ ':''}${l}</button>`).join('')}</div></div>`).join('')}
function employers(){return `<div class="card"><h3>Add a past employer</h3><div class="grid">
 <div><label>Company name</label><input id="n"></div><div><label>Years (e.g. 1995–2001)</label><input id="y"></div><div><label>City / State</label><input id="c"></div></div>
 <label>Notes</label><input id="no"><button id="add" class="btn go">＋ Add employer</button></div>`+
 S.emps.map((e,i)=>{const q=encodeURIComponent(e.name);return `<div class="card"><h3>${esc(e.name)}</h3><div class="mut">${esc(e.years)} · ${esc(e.city)}</div>
 <div class="row"><a class="btn go" href="https://www.efast.dol.gov/5500Search/" target="_blank" rel="noopener" data-copy="${esc(e.name)}">Form 5500 search ↗</a>
 <a class="btn" href="https://www.unclaimedretirementbenefits.com/" target="_blank" rel="noopener">Registry ↗</a>
 <a class="btn" href="https://lostandfound.dol.gov/" target="_blank" rel="noopener">DOL Lost & Found ↗</a>
 <a class="btn" href="https://www.google.com/search?q=${q}+401k+plan+administrator" target="_blank" rel="noopener">Web search plan ↗</a>
 <a class="btn" href="https://www.google.com/search?q=${q}+merged+acquired+by" target="_blank" rel="noopener">Merged / bought? ↗</a></div>
 <div class="mut">Tip: the Form 5500 button copies the company name so you can paste it into the search box.</div>
 <div class="grid"><div><label>Plan name</label><input data-i="${i}" data-f="plan" value="${esc(e.plan)}"></div>
 <div><label>Recordkeeper</label><input data-i="${i}" data-f="rk" value="${esc(e.rk)}" list="rks"></div>
 <div><label>Phone</label><input data-i="${i}" data-f="phone" value="${esc(e.phone)}"></div>
 <div><label>Status</label><select data-i="${i}" data-f="status">${ACC.map(a=>`<option ${e.status===a?'selected':''}>${a}</option>`).join('')}</select></div>
 <div><label>Balance ($)</label><input type="number" step="0.01" data-i="${i}" data-f="balance" value="${esc(e.balance)}"></div></div>
 <label>Notes</label><textarea data-i="${i}" data-f="notes">${esc(e.notes)}</textarea>
 <button class="del" data-del="${i}">Delete employer</button></div>`}).join('')+
 `<datalist id="rks">${['Fidelity','Vanguard','Empower','Principal','Voya','Alight','T. Rowe Price','John Hancock','Charles Schwab','Prudential','Transamerica'].map(x=>`<option>${x}`).join('')}</datalist>`}
function backup(){return `<div class="card"><h3>Back up your data</h3><p>Your data is saved only on this device. Export a backup file and keep it safe. Import it to move your data to your tablet or phone.</p>
 <div class="row"><button id="exp" class="btn go">⬇ Export backup</button><label class="btn">⬆ Import backup<input id="imp" type="file" accept=".json" hidden></label></div></div>
 <div class="card"><h3>Erase everything</h3><button id="wipe" class="del">Erase all data on this device</button></div>`}
function bind(){
 document.querySelectorAll('[data-step]').forEach(b=>b.onclick=()=>{const k=b.dataset.step;S.steps[k]=S.steps[k]===b.dataset.v?undefined:b.dataset.v;save();render()});
 const a=document.getElementById('add');if(a)a.onclick=()=>{const g=id=>document.getElementById(id).value.trim();
  if(!g('n'))return alert('Enter a company name.');if([g('n'),g('y'),g('c'),g('no')].some(bad))return alert('That looks like a Social Security number. Never enter your SSN in this app.');
  S.emps.push({name:g('n'),years:g('y'),city:g('c'),notes:g('no'),status:'searching'});save();render()};
 document.querySelectorAll('[data-f]').forEach(el=>el.onchange=()=>{if(bad(el.value)){alert('That looks like a Social Security number. Never enter your SSN in this app.');el.value='';return}
  S.emps[el.dataset.i][el.dataset.f]=el.value;save();if(el.dataset.f==='status')render()});
 document.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{if(confirm('Delete this employer?')){S.emps.splice(b.dataset.del,1);save();render()}});
 document.querySelectorAll('[data-copy]').forEach(b=>b.addEventListener('click',()=>navigator.clipboard&&navigator.clipboard.writeText(b.dataset.copy).catch(()=>{})));
 const ex=document.getElementById('exp');if(ex)ex.onclick=()=>{const u=URL.createObjectURL(new Blob([JSON.stringify(S,null,1)],{type:'application/json'}));
  const l=document.createElement('a');l.href=u;l.download='401k-finder-backup-'+new Date().toISOString().slice(0,10)+'.json';l.click()};
 const im=document.getElementById('imp');if(im)im.onchange=()=>{const f=im.files[0];if(!f)return;f.text().then(t=>{try{const d=JSON.parse(t);if(!d.emps||!d.steps)throw 0;S=d;save();alert('Backup restored.');render()}catch{alert('That file is not a 401k Finder backup.')}})};
 const w=document.getElementById('wipe');if(w)w.onclick=()=>{if(confirm('Erase ALL 401k Finder data on this device?')){S={steps:{},emps:[]};save();render()}};
}
render();if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js');
