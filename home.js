/* SwimFest India — home.js */

// Hamburger
const ham = document.getElementById('navHam');
const mob = document.getElementById('navMob');
if(ham) ham.addEventListener('click', () => mob.classList.toggle('open'));

// Active nav
window.addEventListener('scroll', () => {
  let cur = '';
  document.querySelectorAll('[id]').forEach(el => {
    if(window.scrollY >= el.offsetTop - 72) cur = el.id;
  });
  document.querySelectorAll('.nav-links a').forEach(a =>
    a.classList.toggle('active', a.getAttribute('href') === '#'+cur)
  );
}, {passive:true});

// Countdown — dynamic from API
function startCountdown(deadlineStr) {
  function tick() {
    const diff = new Date(deadlineStr + 'T23:59:59') - new Date();
    if (diff <= 0) {
      ['cdDays','cdHrs','cdMin','cdSec'].forEach(id => {
        const e = document.getElementById(id); if(e) e.textContent = '00';
      });
      return;
    }
    const pad = n => String(Math.floor(n)).padStart(2,'0');
    const set = (id,v) => { const e=document.getElementById(id); if(e) e.textContent=pad(v); };
    set('cdDays', diff/86400000);
    set('cdHrs',  (diff%86400000)/3600000);
    set('cdMin',  (diff%3600000)/60000);
    set('cdSec',  (diff%60000)/1000);
  }
  tick();
  setInterval(tick, 1000);
}

fetch('/api/tournaments').then(r=>r.json()).then(events=>{
  const open = events.find(e=>e.status==='Open') || events[0];
  if(open && open.reg_deadline) {
    startCountdown(open.reg_deadline);
  } else {
    startCountdown('2026-12-31');
  }
}).catch(()=>{ startCountdown('2026-12-31'); });

// Quick register DOB -> age group
function qrFillAge() {
  const dob = document.getElementById('qrDob')?.value;
  const el  = document.getElementById('qrAgeGroup');
  if(!dob || !el) return;
  const y = new Date(dob).getFullYear();
  const m = {2016:'U-10',2017:'U-10',2014:'U-12',2015:'U-12',2012:'U-14',2013:'U-14',2010:'U-16',2011:'U-16'};
  el.value = m[y] ? `${m[y]} (Born ${y})` : 'Outside eligible range';
}

function qrSubmit(e) {
  e.preventDefault();
  openRegisterModal();
  setTimeout(() => {
    const nm = document.getElementById('swimmerName');
    const gn = document.getElementById('gender');
    const db = document.getElementById('dob');
    const in_ = document.getElementById('institution');
    const qn = document.getElementById('qrName')?.value;
    const qg = document.getElementById('qrGender')?.value;
    const qd = document.getElementById('qrDob')?.value;
    const qa = document.getElementById('qrAcademy')?.value;
    if(nm && qn) nm.value = qn;
    if(gn && qg) gn.value = qg;
    if(db && qd) { db.value = qd; refreshEligibility && refreshEligibility(); }
    if(in_ && qa) in_.value = qa;
    wizardGoto(2);
  }, 400);
}

// Eligibility checker on home page
function checkElig() {
  const dob    = document.getElementById('ecDob')?.value;
  const gender = document.getElementById('ecGender')?.value;
  const resEl  = document.getElementById('ecResult');
  const badEl  = document.getElementById('ecBadge');
  const evEl   = document.getElementById('ecEvents');
  const noEl   = document.getElementById('ecIneligible');
  if(!dob || !gender) return;
  const y = new Date(dob).getFullYear();
  const groups = {
    u10:{label:'U-10',color:'#f97316',events:['50m FS','100m FS','50m BK','50m BR','50m BF','100m IM']},
    u12:{label:'U-12',color:'#8b5cf6',events:['50m FS','100m FS','50m BK','50m BR','50m BF','100m IM']},
    u14:{label:'U-14',color:'#0ea5e9',events:['50m FS','100m FS','100m BK','100m BR','100m BF','200m IM']},
    u16:{label:'U-16',color:'#10b981',events:['50m FS','100m FS','100m BK','100m BR','100m BF','200m IM']},
  };
  const km = {2016:'u10',2017:'u10',2014:'u12',2015:'u12',2012:'u14',2013:'u14',2010:'u16',2011:'u16'};
  const key = km[y];
  if(!key) {
    if(resEl) resEl.style.display='none';
    if(noEl) noEl.style.display='';
    return;
  }
  if(noEl) noEl.style.display='none';
  if(resEl) resEl.style.display='';
  const g = groups[key];
  if(badEl) {
    badEl.textContent=`${gender} ${g.label} — Born ${y}`;
    badEl.style.cssText=`background:${g.color}22;color:${g.color};border:1px solid ${g.color}55;display:inline-block;padding:4px 12px;border-radius:999px;font-size:.78rem;font-weight:800`;
  }
  if(evEl) {
    evEl.innerHTML = g.events.map(ev =>
      `<span style="background:${g.color}20;color:${g.color};border:1px solid ${g.color}44;padding:2px 8px;border-radius:999px;font-size:.68rem;font-weight:700;display:inline-block">${ev}</span>`
    ).join('');
  }
}

// Pool lane info
const laneInfo = {
  1:{title:'Lane 1 — Slowest Seed',text:'Assigned to the slowest entry time. Good for nervous first-timers. Less splash interference.'},
  2:{title:'Lane 2',text:'Second slowest seed. Outer lane, minimal wave interference from centre.'},
  3:{title:'Lane 3',text:'Third fastest seed. Good position — less turbulence than centre.'},
  4:{title:'Lane 4 — Fastest Seed ★',text:'Reserved for the fastest seed time in each heat. Centre of the pool for maximum visibility.'},
  5:{title:'Lane 5 — Second Fastest ★',text:'Second fastest seed. Directly beside Lane 4. Swimmers here often push each other to fast times.'},
  6:{title:'Lane 6',text:'Third fastest seed. Still a competitive lane with good positioning.'},
  7:{title:'Lane 7',text:'Outer lane. Good for swimmers who prefer less crowded water.'},
  8:{title:'Lane 8 — Slowest Outer',text:'Last lane. Sometimes used for swimmers with NT (No Time) entries.'},
};

function showLane(n, el) {
  const info = laneInfo[n];
  const box  = document.getElementById('poolInfoBox');
  const title= document.getElementById('poolInfoTitle');
  const text = document.getElementById('poolInfoText');
  document.querySelectorAll('.pool-lane-block').forEach(b => b.style.filter='');
  el.style.filter = 'brightness(1.5)';
  if(box && title && text) {
    box.style.display='block';
    title.textContent = info.title;
    text.textContent  = info.text;
  }
}

// Past results accordion
function toggleResult(id, row) {
  const panel = document.getElementById(id);
  if(!panel) return;
  const open = panel.classList.contains('open');
  document.querySelectorAll('.past-panel').forEach(p => p.classList.remove('open'));
  document.querySelectorAll('.past-row').forEach(r => r.classList.remove('open-row'));
  if(!open) { panel.classList.add('open'); row.classList.add('open-row'); }
}

// FAQ
function toggleFaq(q) {
  const a = q.nextElementSibling;
  const open = a.classList.contains('open-a');
  document.querySelectorAll('.faq-a').forEach(x => x.classList.remove('open-a'));
  document.querySelectorAll('.faq-q').forEach(x => x.classList.remove('open-q'));
  if(!open) { a.classList.add('open-a'); q.classList.add('open-q'); }
}
function filterFaq() {
  const q = document.getElementById('faqSearch')?.value.toLowerCase()||'';
  document.querySelectorAll('.faq-item').forEach(item => {
    const txt = item.textContent.toLowerCase();
    item.classList.toggle('hidden', q.length > 0 && !txt.includes(q));
  });
}

// Swimmer directory
let dg='all', da='all';
function filterDir() {
  const q = document.getElementById('dirSearch')?.value.toLowerCase()||'';
  document.querySelectorAll('.dir-card').forEach(card => {
    const gOk = dg==='all' || card.dataset.g===dg;
    const aOk = da==='all' || card.dataset.a===da;
    const txt = card.textContent.toLowerCase();
    card.classList.toggle('hidden', !(gOk && aOk && (!q || txt.includes(q))));
  });
}
document.querySelectorAll('#dirGender .dfb').forEach(b => b.addEventListener('click', () => {
  document.querySelectorAll('#dirGender .dfb').forEach(x => x.classList.remove('active'));
  b.classList.add('active'); dg=b.dataset.g; filterDir();
}));
document.querySelectorAll('#dirAge .dfb').forEach(b => b.addEventListener('click', () => {
  document.querySelectorAll('#dirAge .dfb').forEach(x => x.classList.remove('active'));
  b.classList.add('active'); da=b.dataset.a; filterDir();
}));
function showAllDir() {
  document.querySelectorAll('.dir-card').forEach(c => c.classList.remove('hidden'));
}

// Auto-fill from URL params on event.html
if(window.location.pathname.includes('event.html')) {
  const p = new URLSearchParams(window.location.search);
  setTimeout(() => {
    if(typeof openRegisterModal==='function') openRegisterModal();
    const set = (id,v) => { const e=document.getElementById(id); if(e&&v) e.value=v; };
    set('swimmerName', p.get('name'));
    set('gender', p.get('gender'));
    set('institution', p.get('academy'));
    const dob=p.get('dob');
    if(dob) { set('dob',dob); if(typeof refreshEligibility==='function') refreshEligibility(); }
  }, 600);
}

// ── Event Detail Modal ────────────────────────────────
// Dynamic — loads from API, no hardcoded data
let _cachedTournaments = [];

function formatDateDMY(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return parts[2] + '/' + parts[1] + '/' + parts[0];
}

function openEventDetail(btn) {
  const cards = document.querySelectorAll('.ecard');
  let idx = 0;
  cards.forEach((card, i) => { if (card.contains(btn)) idx = i; });

  // Always fetch fresh data (no stale cache)
  fetch('/api/tournaments').then(r=>r.json()).then(events => {
    _cachedTournaments = events.filter(e => e.status !== 'Completed');
    showEventModal(_cachedTournaments, idx);
  }).catch(() => {});
}

function showEventModal(events, idx) {
  const ev = events[idx];
  if (!ev) return;

  const startDate = formatDateDMY(ev.start_date);
  const endDate = formatDateDMY(ev.end_date);
  const dates = startDate && endDate ? `${startDate} to ${endDate}` : '';
  const deadline = formatDateDMY(ev.reg_deadline);
  const isOpen = ev.status === 'Open';
  const badgeText = isOpen ? 'Open Event' : ev.status;
  const badge = isOpen ? 'open' : 'nm';

  document.getElementById('evtModalBadge').textContent = badgeText;
  document.getElementById('evtModalBadge').className = `evt-modal-badge ${badge}`;
  document.getElementById('evtModalTitle').innerHTML = ev.name;
  document.getElementById('evtModalMeta').innerHTML = `${dates} &nbsp;&middot;&nbsp; ${ev.venue || ''}`;

  document.getElementById('evtInfoRow').innerHTML = `
    <div class="evt-info-item"><span class="evt-info-label">Date</span><span class="evt-info-val">${dates}</span></div>
    <div class="evt-info-item"><span class="evt-info-label">Venue</span><span class="evt-info-val">${ev.venue || ''}</span></div>
    <div class="evt-info-item"><span class="evt-info-label">Fee</span><span class="evt-info-val">&#8377;${ev.fee_per_event || 300} / event + GST</span></div>
    <div class="evt-info-item"><span class="evt-info-label">Deadline</span><span class="evt-info-val">${deadline || '—'}</span></div>
    <div class="evt-info-item"><span class="evt-info-label">Age Cut-off</span><span class="evt-info-val">31 Dec 2026</span></div>
    <div class="evt-info-item"><span class="evt-info-label">Max Events</span><span class="evt-info-val">3 individual + Relay</span></div>
  `;

  document.getElementById('evtCatsGrid').innerHTML = `
    <span class="evt-cat-pill ap u10">U10</span>
    <span class="evt-cat-pill ap u12">U12</span>
    <span class="evt-cat-pill ap u14">U14</span>
    <span class="evt-cat-pill ap u16">U16</span>
  `;

  document.getElementById('evtEventsTable').innerHTML = `
    <div class="evt-ev-row evt-ev-head"><span>Code</span><span>Stroke</span><span>Distance</span></div>
    <div class="evt-ev-row"><span><span class="evt-ev-code" style="background:#1d4ed8">FS</span></span><span>Freestyle</span><span style="font-weight:600;color:#0f172a">50m / 100m</span></div>
    <div class="evt-ev-row"><span><span class="evt-ev-code" style="background:#7c3aed">BK</span></span><span>Backstroke</span><span style="font-weight:600;color:#0f172a">50m / 100m</span></div>
    <div class="evt-ev-row"><span><span class="evt-ev-code" style="background:#059669">BR</span></span><span>Breaststroke</span><span style="font-weight:600;color:#0f172a">50m / 100m</span></div>
    <div class="evt-ev-row"><span><span class="evt-ev-code" style="background:#d97706">BF</span></span><span>Butterfly</span><span style="font-weight:600;color:#0f172a">50m / 100m</span></div>
    <div class="evt-ev-row"><span><span class="evt-ev-code" style="background:#dc2626">IM</span></span><span>Ind. Medley</span><span style="font-weight:600;color:#0f172a">100m / 200m</span></div>
    <div class="evt-ev-row"><span><span class="evt-ev-code" style="background:#374151">RLY</span></span><span>Relay</span><span style="font-weight:600;color:#0f172a">4x50m / 4x100m</span></div>
  `;

  document.getElementById('evtEligBox').innerHTML = `<strong>&#9989; Who can enter?</strong><ul><li>Open to all registered non-medalist swimmers. Age cut-off: 31 December 2026.</li></ul>`;

  document.getElementById('evtModal').classList.add('open');
  document.body.classList.add('modal-open');
}

function closeEvtModal() {
  document.getElementById('evtModal').classList.remove('open');
  document.body.classList.remove('modal-open');
}

// close on Escape — disabled, only X button closes modal

// ── Share Event ─────────────────────────────────
function shareEvent(btn) {
  // Get event details from the card
  const card = btn.closest('.ecard');
  const title = card?.querySelector('h4')?.textContent || 'SwimFest India Event';
  const meta = card?.querySelectorAll('.ecard-meta span') || [];
  const date = meta[0]?.textContent || '';
  const venue = meta[1]?.textContent || '';
  const fee = meta[2]?.textContent || '';
  const limit = meta[3]?.textContent || '';
  const url = window.location.origin + window.location.pathname;

  // Remove existing overlay
  document.querySelectorAll('.share-card-overlay').forEach(p => p.remove());

  const overlay = document.createElement('div');
  overlay.className = 'share-card-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(10,22,40,.8);backdrop-filter:blur(4px);z-index:900;display:flex;align-items:center;justify-content:center;padding:16px;flex-direction:column;gap:16px';

  overlay.innerHTML = `
    <div id="shareCardCanvas" style="width:360px;background:linear-gradient(160deg,#0a1628 0%,#0d2847 40%,#0a1628 100%);border-radius:20px;padding:0;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.5);position:relative">
      <!-- Pattern background -->
      <div style="position:absolute;inset:0;opacity:.06;background-image:repeating-linear-gradient(45deg,transparent,transparent 20px,rgba(255,255,255,.1) 20px,rgba(255,255,255,.1) 21px);pointer-events:none"></div>
      
      <!-- Header -->
      <div style="padding:30px 24px 20px;text-align:center;position:relative">
        <div style="display:inline-flex;gap:8px;margin-bottom:16px">
          <span style="background:rgba(6,182,212,.2);color:#06b6d4;padding:5px 14px;border-radius:999px;font-size:.72rem;font-weight:700;border:1px solid rgba(6,182,212,.3)">&#127946; Swimming</span>
          <span style="background:rgba(34,197,94,.2);color:#22c55a;padding:5px 14px;border-radius:999px;font-size:.72rem;font-weight:700;border:1px solid rgba(34,197,94,.3)">&#128994; Open</span>
        </div>
        <h2 style="color:#fff;font-size:1.4rem;font-weight:900;margin:0 0 4px;line-height:1.3">${title}</h2>
        <p style="color:rgba(255,255,255,.5);font-size:.78rem;margin:0">Non-Medalist Championship</p>
      </div>

      <!-- Info Grid -->
      <div style="margin:0 24px;background:rgba(255,255,255,.05);border-radius:12px;border:1px solid rgba(255,255,255,.1);padding:16px;display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div style="text-align:center">
          <div style="font-size:.65rem;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px">Date</div>
          <div style="font-size:.82rem;color:#fff;font-weight:700">${date.replace('📅 ','')}</div>
        </div>
        <div style="text-align:center">
          <div style="font-size:.65rem;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px">Venue</div>
          <div style="font-size:.82rem;color:#fff;font-weight:700">${venue.replace('📍 ','')}</div>
        </div>
        <div style="text-align:center">
          <div style="font-size:.65rem;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px">Entry Fee</div>
          <div style="font-size:.82rem;color:#22c55a;font-weight:700">${fee.replace('💰 ','')}</div>
        </div>
        <div style="text-align:center">
          <div style="font-size:.65rem;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px">Events</div>
          <div style="font-size:.82rem;color:#fff;font-weight:700">Max 3 + Relay</div>
        </div>
      </div>

      <!-- Categories -->
      <div style="display:flex;justify-content:center;gap:8px;padding:16px 24px">
        <span style="padding:4px 12px;border-radius:999px;font-size:.7rem;font-weight:700;background:rgba(239,68,68,.2);color:#f87171;border:1px solid rgba(239,68,68,.3)">U-10</span>
        <span style="padding:4px 12px;border-radius:999px;font-size:.7rem;font-weight:700;background:rgba(168,85,247,.2);color:#c084fc;border:1px solid rgba(168,85,247,.3)">U-12</span>
        <span style="padding:4px 12px;border-radius:999px;font-size:.7rem;font-weight:700;background:rgba(59,130,246,.2);color:#60a5fa;border:1px solid rgba(59,130,246,.3)">U-14</span>
        <span style="padding:4px 12px;border-radius:999px;font-size:.7rem;font-weight:700;background:rgba(34,197,94,.2);color:#4ade80;border:1px solid rgba(34,197,94,.3)">U-16</span>
      </div>

      <!-- Footer -->
      <div style="padding:14px 24px;border-top:1px solid rgba(255,255,255,.08);display:flex;align-items:center;gap:10px">
        <div style="width:32px;height:32px;background:rgba(6,182,212,.15);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:1rem">&#127946;</div>
        <div>
          <div style="font-size:.72rem;color:rgba(255,255,255,.4)">Register now at</div>
          <div style="font-size:.82rem;color:#06b6d4;font-weight:700">SwimFest India</div>
        </div>
      </div>
    </div>

    <!-- Action buttons -->
    <div style="display:flex;gap:10px">
      <button onclick="shareToWhatsApp()" style="padding:10px 20px;background:#25D366;color:#fff;border:none;border-radius:999px;font-size:.82rem;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:6px">&#128172; WhatsApp</button>
      <button onclick="copyShareText()" style="padding:10px 20px;background:#fff;color:#0a1628;border:none;border-radius:999px;font-size:.82rem;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:6px">&#128279; Copy</button>
      <button onclick="this.closest('.share-card-overlay').remove()" style="padding:10px 20px;background:rgba(255,255,255,.15);color:#fff;border:none;border-radius:999px;font-size:.82rem;font-weight:700;cursor:pointer">&#10005; Close</button>
    </div>
  `;

  // Store share data for buttons
  window._shareData = { title, date, venue, fee, url };

  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) overlay.remove();
  });

  document.body.appendChild(overlay);
}

function shareToWhatsApp() {
  const d = window._shareData;
  const text = `🏊 *${d.title}*\n\n📅 ${d.date}\n📍 ${d.venue}\n💰 ${d.fee}\n🎯 Max 3 events + 1 Relay\n👦👧 U-10 | U-12 | U-14 | U-16\n\n✅ Register now!\n${d.url}`;
  window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank');
}

function copyShareText() {
  const d = window._shareData;
  const text = `${d.title}\n${d.date}\n${d.venue}\n${d.fee}\nMax 3 events + 1 Relay\nU-10 | U-12 | U-14 | U-16\n\nRegister: ${d.url}`;
  navigator.clipboard.writeText(text).then(() => {
    alert('Event details copied!');
  }).catch(() => {
    prompt('Copy this:', text);
  });
}

function showShareMenu() {}
function copyLink() {}
