/* SwimFest India — app.js (shared: index.html + event.html) */

// ── Modal open/close ──────────────────────────────────
function openRegisterModal() {
  const modal = document.getElementById('registerModal');
  if (!modal) return;
  wizardGoto(1);
  modal.classList.add('open');
  document.body.classList.add('modal-open');
  const fab = document.getElementById('registerFab');
  if (fab) fab.style.display = 'none';

  // Auto-fill profile from backend if logged in
  const swId = localStorage.getItem('swimmer_id');
  if (swId && swId !== 'DEMO' && swId !== 'ADMIN') {
    fetch(`/api/swimmers/${swId}`)
      .then(r => r.json())
      .then(s => {
        if (s && !s.error) {
          // Fill Step 2 fields with existing profile data
          const set = (id, val) => { const el = document.getElementById(id); if (el && val) el.value = val; };
          set('swimmerName', s.full_name);
          set('gender', s.gender);
          set('dob', s.dob);
          set('ageGroup', s.age_group ? `${Math.floor((new Date('2026-12-31') - new Date(s.dob)) / (365.25*86400000))} yrs — ${s.age_group}` : '');
          set('parentName', s.parent_name);
          set('relationship', s.parent_relationship);
          set('phone', s.parent_mobile);
          set('email', s.parent_email);
          set('institution', s.academy_id || '');
          // Try to match academy_id to dropdown option
          if (s.academy_id) {
            fetch('/api/academies').then(r=>r.json()).then(acads => {
              const acad = acads.find(a => a.academy_id === s.academy_id);
              if (acad) {
                const instEl = document.getElementById('institution');
                if (instEl) {
                  // Find option matching academy name
                  for (let opt of instEl.options) {
                    if (opt.value === acad.name || opt.textContent === acad.name) {
                      instEl.value = opt.value;
                      break;
                    }
                  }
                }
              }
            }).catch(()=>{});
          }
          set('instType', s.institution_type);
          set('swimmerAddress', s.address || '');

          // Trigger eligibility refresh to load events for Step 3
          if (typeof refreshEligibility === 'function') refreshEligibility();
        }
      }).catch(() => {});
  }

  setTimeout(() => {
    const f = modal.querySelector('input:not([readonly]),select');
    if (f) f.focus();
  }, 320);
}

function closeRegisterModal() {
  const modal = document.getElementById('registerModal');
  if (!modal) return;
  modal.classList.remove('open');
  document.body.classList.remove('modal-open');
  const fab = document.getElementById('registerFab');
  if (fab) fab.style.display = '';
}

document.addEventListener('DOMContentLoaded', () => {
  // Modal only closes via the X button — no outside-click dismissal

  // payment method click styling
  document.querySelectorAll('.wiz-pay-opt').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.wiz-pay-opt').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      const upiWrap = document.getElementById('upiInputWrap');
      if (upiWrap) upiWrap.style.display = opt.querySelector('input')?.value === 'upi' ? '' : 'none';
    });
  });

  // institution dropdown
  const instSel  = document.getElementById('institution');
  const acadId   = document.getElementById('academyId');
  const otherRow = document.getElementById('otherInstRow');
  const ACAD_MAP = {'SRM Swim Club':'ACD-001','Chennai Dolphins':'ACD-002','Madurai Marlins':'ACD-003','Kattankulathur Aqua':'ACD-004','TN Swim Academy':'ACD-005','Other':'ACD-TBD'};
  if (instSel) {
    instSel.addEventListener('change', () => {
      if (acadId)   acadId.value = ACAD_MAP[instSel.value] || '';
      if (otherRow) otherRow.style.display = instSel.value === 'Other' ? '' : 'none';
    });
  }

  // DOB + gender
  const dobEl = document.getElementById('dob');
  const genEl = document.getElementById('gender');
  if (dobEl) dobEl.addEventListener('change', refreshEligibility);
  if (genEl) genEl.addEventListener('change', refreshEligibility);

  // relay toggle
  const relayOptEl = document.getElementById('relayOpt');
  if (relayOptEl) relayOptEl.addEventListener('change', recalcFees);
});

// Escape key does NOT close modal — only X button closes it

// ── Wizard state ──────────────────────────────────────
const TOTAL_STEPS = 7;
let currentStep = 1;

const STEP_LABELS = ['','Step 1 of 7 — Select Tournament','Step 2 of 7 — Player Profile','Step 3 of 7 — Select Events','Step 4 of 7 — Seed Times','Step 5 of 7 — Review & Declare','Step 6 of 7 — Payment','Step 7 of 7 — Booking Confirmed'];

function wizardGoto(n) {
  document.querySelectorAll('.wiz-panel').forEach(p => p.classList.remove('active'));
  const t = document.getElementById('step' + n);
  if (t) t.classList.add('active');

  const fill = document.getElementById('wizardProgressFill');
  if (fill) fill.style.width = ((n / TOTAL_STEPS) * 100) + '%';

  document.querySelectorAll('.rst').forEach(dot => {
    const s = parseInt(dot.dataset.step);
    dot.classList.toggle('active', s === n);
    dot.classList.toggle('done', s < n);
  });

  const lbl = document.getElementById('wizardStepLabel');
  if (lbl) lbl.textContent = STEP_LABELS[n] || '';

  const body = document.getElementById('wizardBody');
  if (body) body.scrollTop = 0;

  // build seed grid when entering step 4
  if (n === 4) buildSeedTimeGrid();
  // build review when entering step 5
  if (n === 5) { buildReviewBox(); recalcFees(); }
  // build payment summary when entering step 6
  if (n === 6) buildPaymentSummary();

  currentStep = n;
}

function wizardNext() {
  if (!validateStep(currentStep)) return;
  if (currentStep < TOTAL_STEPS) wizardGoto(currentStep + 1);
}

function wizardBack() {
  if (currentStep > 1) wizardGoto(currentStep - 1);
}

// ── Validation ────────────────────────────────────────
function validateStep(step) {
  if (step === 2) {
    const req = [
      [document.getElementById('swimmerName')?.value.trim(), 'Please enter swimmer name'],
      [document.getElementById('gender')?.value, 'Please select gender'],
      [document.getElementById('dob')?.value, 'Please enter date of birth'],
      [document.getElementById('parentName')?.value.trim(), 'Please enter parent name'],
      [document.getElementById('relationship')?.value, 'Please select relationship'],
      [document.getElementById('phone')?.value.trim(), 'Please enter mobile number'],
      [document.getElementById('email')?.value.trim(), 'Please enter email'],
    ];
    for (const [val, msg] of req) {
      if (!val) { alert(msg); return false; }
    }
    // At least school or academy must be filled
    const schoolName = document.getElementById('schoolName')?.value.trim();
    const academy = document.getElementById('institution')?.value;
    if (!schoolName && !academy) {
      alert('Please fill at least School Name or Swimming Academy.');
      return false;
    }
    if (document.getElementById('dob')?.value && !detectAgeGroup(document.getElementById('dob').value)) {
      alert('Date of birth is outside the eligible range (2010–2017).');
      return false;
    }
    return true;
  }
  if (step === 3) {
    const checked = document.querySelectorAll('#eventsGrid input[type=checkbox]:checked');
    if (checked.length === 0) { alert('Please select at least 1 event.'); return false; }
    if (checked.length < MAX_EVENTS) {
      return confirm(`You selected ${checked.length} event(s). Proceed with ${checked.length}?`);
    }
    return true;
  }
  if (step === 5) {
    const ids = ['consentRules','consentRefund','consentParent','consentMedical','consentNonMedalist'];
    for (const id of ids) {
      if (!document.getElementById(id)?.checked) {
        alert('Please accept all required declarations.');
        return false;
      }
    }
    return true;
  }
  return true;
}

// ── Event catalogue ───────────────────────────────────
const EVENT_CATALOGUE = {
  u10:{label:'U-10',relay:'4×50m Relay',relayFee:150,events:[
    {code:'fs',label:'50m Freestyle',dist:'50m',fee:300},
    {code:'fs',label:'100m Freestyle',dist:'100m',fee:300},
    {code:'bk',label:'50m Backstroke',dist:'50m',fee:300},
    {code:'br',label:'50m Breaststroke',dist:'50m',fee:300},
    {code:'bf',label:'50m Butterfly',dist:'50m',fee:300},
    {code:'im',label:'100m Ind. Medley',dist:'100m',fee:300},
  ]},
  u12:{label:'U-12',relay:'4×50m Relay',relayFee:150,events:[
    {code:'fs',label:'50m Freestyle',dist:'50m',fee:300},
    {code:'fs',label:'100m Freestyle',dist:'100m',fee:300},
    {code:'bk',label:'50m Backstroke',dist:'50m',fee:300},
    {code:'br',label:'50m Breaststroke',dist:'50m',fee:300},
    {code:'bf',label:'50m Butterfly',dist:'50m',fee:300},
    {code:'im',label:'100m Ind. Medley',dist:'100m',fee:300},
  ]},
  u14:{label:'U-14',relay:'4×100m Relay',relayFee:150,events:[
    {code:'fs',label:'50m Freestyle',dist:'50m',fee:300},
    {code:'fs',label:'100m Freestyle',dist:'100m',fee:300},
    {code:'bk',label:'100m Backstroke',dist:'100m',fee:300},
    {code:'br',label:'100m Breaststroke',dist:'100m',fee:300},
    {code:'bf',label:'100m Butterfly',dist:'100m',fee:300},
    {code:'im',label:'200m Ind. Medley',dist:'200m',fee:300},
  ]},
  u16:{label:'U-16',relay:'4×100m Relay',relayFee:150,events:[
    {code:'fs',label:'50m Freestyle',dist:'50m',fee:300},
    {code:'fs',label:'100m Freestyle',dist:'100m',fee:300},
    {code:'bk',label:'100m Backstroke',dist:'100m',fee:300},
    {code:'br',label:'100m Breaststroke',dist:'100m',fee:300},
    {code:'bf',label:'100m Butterfly',dist:'100m',fee:300},
    {code:'im',label:'200m Ind. Medley',dist:'200m',fee:300},
  ]},
};

const CODE_COLORS = {fs:'#1d4ed8',bk:'#7c3aed',br:'#059669',bf:'#d97706',im:'#dc2626'};
const GST_RATE  = 0.18;
const EVENT_FEE = 300;
const RELAY_FEE = 150;
const MAX_EVENTS = 3;

function detectAgeGroup(dob) {
  const y = new Date(dob).getFullYear();
  if (y === 2016 || y === 2017) return 'u10';
  if (y === 2014 || y === 2015) return 'u12';
  if (y === 2012 || y === 2013) return 'u14';
  if (y === 2010 || y === 2011) return 'u16';
  return null;
}

function refreshEligibility() {
  const dob    = document.getElementById('dob')?.value;
  const gender = document.getElementById('gender')?.value;
  if (!dob) return;

  const ageKey = detectAgeGroup(dob);
  const yob    = document.getElementById('yearOfBirth');
  const ageFld = document.getElementById('ageGroup');

  if (yob && dob) yob.value = new Date(dob).getFullYear();
  if (ageFld) {
    if (ageKey) {
      const age = Math.floor((new Date('2026-12-31') - new Date(dob)) / (365.25 * 86400000));
      const map = {u10:'U-10 (Born 2016–2017)',u12:'U-12 (Born 2014–2015)',u14:'U-14 (Born 2012–2013)',u16:'U-16 (Born 2010–2011)'};
      ageFld.value = `${age} yrs — ${map[ageKey]}`;
    } else {
      ageFld.value = dob ? 'Outside eligible range' : '';
    }
  }
  buildEventGrid(ageKey, gender);
}

// ── Build event grid ──────────────────────────────────
function buildEventGrid(ageKey, gender) {
  const grid    = document.getElementById('eventsGrid');
  const banner  = document.getElementById('eligInfoBanner');
  const eibCat  = document.getElementById('eibCategory');
  const eibDesc = document.getElementById('eibDesc');
  const eibPils = document.getElementById('eibPills');
  const msg     = document.getElementById('eventsStepMsg');
  const relRow  = document.getElementById('relayRow');
  const relDist = document.getElementById('relayDist');
  if (!grid) return;

  if (!ageKey) {
    grid.innerHTML = '';
    if (banner) banner.style.display = 'none';
    if (msg)    msg.style.display    = '';
    if (relRow) relRow.style.display = 'none';
    return;
  }

  if (msg) msg.style.display = 'none';
  const cat = EVENT_CATALOGUE[ageKey];

  if (banner && eibCat && eibDesc && eibPils) {
    eibCat.textContent  = `${gender || 'Swimmer'} ${cat.label} — Eligible`;
    eibDesc.textContent = `${cat.events.length} events available`;
    eibPils.innerHTML   = cat.events.map(ev =>
      `<span style="background:${CODE_COLORS[ev.code]}20;color:${CODE_COLORS[ev.code]};border:1px solid ${CODE_COLORS[ev.code]}44;padding:2px 8px;border-radius:999px;font-size:.65rem;font-weight:700;display:inline-block">${ev.label}</span>`
    ).join('');
    banner.style.display = '';
  }

  grid.innerHTML = '';
  cat.events.forEach(ev => {
    const card = document.createElement('div');
    card.className = 'wiz-ev-card';
    card.innerHTML = `
      <input type="checkbox" name="selectedEvents" value="${ev.label}" style="display:none"/>
      <div style="display:flex;align-items:center;gap:8px;width:100%">
        <span style="flex-shrink:0;padding:2px 8px;border-radius:4px;background:${CODE_COLORS[ev.code]};color:#fff;font-size:.62rem;font-weight:800">${ev.code.toUpperCase()}</span>
        <div style="flex:1;min-width:0">
          <div class="wiz-ev-label">${ev.label}</div>
          <div class="wiz-ev-dist">${ev.dist} &middot; &#8377;${ev.fee}</div>
        </div>
      </div>
      <div class="wiz-ev-seed hidden" style="width:100%;margin-top:6px">
        <input type="text" placeholder="Seed time (e.g. 00:32.45 or NT)" maxlength="12" style="width:100%;padding:6px 10px;border:1.5px solid #e2e8f0;border-radius:6px;font-size:.78rem"/>
      </div>`;

    const cb   = card.querySelector('input[type=checkbox]');
    const seed = card.querySelector('.wiz-ev-seed');

    card.addEventListener('click', e => {
      if (e.target.tagName === 'INPUT' && e.target.type === 'text') return;
      const total = grid.querySelectorAll('input[type=checkbox]:checked').length;
      if (!cb.checked && total >= MAX_EVENTS) return;
      cb.checked = !cb.checked;
      card.classList.toggle('checked', cb.checked);
      if (seed) seed.classList.toggle('hidden', !cb.checked);

      const now = grid.querySelectorAll('input[type=checkbox]:checked').length;
      grid.querySelectorAll('.wiz-ev-card').forEach(c => {
        const i = c.querySelector('input[type=checkbox]');
        c.classList.toggle('disabled', !i.checked && now >= MAX_EVENTS);
      });
      updateCounter();
      recalcFees();
    });
    grid.appendChild(card);
  });

  if (relRow) {
    relRow.style.display = '';
    if (relDist) relDist.textContent = `(${cat.relay} · &#8377;${cat.relayFee})`;
  }
  updateCounter();
}

function updateCounter() {
  const badge = document.getElementById('eventCounterBadge');
  const grid  = document.getElementById('eventsGrid');
  if (!badge || !grid) return;
  const n = grid.querySelectorAll('input[type=checkbox]:checked').length;
  badge.textContent = `${n} / ${MAX_EVENTS} selected`;
  badge.className   = `wiz-counter${n === MAX_EVENTS ? ' full' : ''}`;
}

// ── Seed time grid ─────────────────────────────────────
function buildSeedTimeGrid() {
  const grid    = document.getElementById('seedTimeGrid');
  if (!grid) return;
  const checked = [...document.querySelectorAll('#eventsGrid input[type=checkbox]:checked')];
  if (checked.length === 0) {
    grid.innerHTML = '<p style="font-size:.8rem;color:#64748b;text-align:center;padding:12px">No events selected. Go back to Step 3 to select events.</p>';
    return;
  }
  grid.innerHTML = '';
  checked.forEach(cb => {
    const row = document.createElement('div');
    row.className     = 'wiz-seed-row';
    row.dataset.event = cb.value;

    // check if seed was already entered inline on event card
    const evCard = [...document.querySelectorAll('.wiz-ev-card')].find(c => c.querySelector('input[type=checkbox]')?.value === cb.value);
    const inlineSeed = evCard?.querySelector('.wiz-ev-seed input')?.value || '';

    row.innerHTML = `
      <div class="wiz-seed-ev">${cb.value}</div>
      <div style="display:flex;align-items:center;gap:8px">
        <input type="text" class="wiz-seed-input" value="${inlineSeed}" placeholder="MM:SS.ss or NT" maxlength="12" aria-label="Seed time for ${cb.value}"/>
        <span class="wiz-seed-hint">NT = no time</span>
      </div>`;
    grid.appendChild(row);
  });
}

// ── Fee calculation ───────────────────────────────────
function recalcFees() {
  const linesEl    = document.getElementById('feeLines');
  const subEl      = document.getElementById('feeSubtotal');
  const taxEl      = document.getElementById('feeTax');
  const totalEl    = document.getElementById('feeTotal');
  const ptdEl      = document.getElementById('ptdAmount');
  const content    = document.getElementById('feeSummaryContent');
  if (!linesEl) return;

  const checked  = [...document.querySelectorAll('#eventsGrid input[type=checkbox]:checked')];
  const hasRelay = document.getElementById('relayOpt')?.checked;
  let sub = 0, lines = '';

  checked.forEach(cb => {
    lines += `<div class="wiz-fee-line"><span>${cb.value}</span><span>&#8377;${EVENT_FEE}</span></div>`;
    sub += EVENT_FEE;
  });
  if (hasRelay) {
    lines += `<div class="wiz-fee-line"><span>Relay</span><span>&#8377;${RELAY_FEE}</span></div>`;
    sub += RELAY_FEE;
  }

  const tax   = Math.round(sub * GST_RATE);
  const total = sub + tax;
  if (linesEl)  linesEl.innerHTML      = lines;
  if (subEl)    subEl.textContent      = `\u20B9${sub}`;
  if (taxEl)    taxEl.textContent      = `\u20B9${tax}`;
  if (totalEl)  totalEl.textContent    = `\u20B9${total}`;
  if (ptdEl)    ptdEl.textContent      = `\u20B9${total}`;
  if (content)  content.style.display  = checked.length > 0 || hasRelay ? '' : 'none';
  return total;
}

// ── Review box ────────────────────────────────────────
function buildReviewBox() {
  const box = document.getElementById('reviewBox');
  if (!box) return;
  const get = id => document.getElementById(id)?.value || '—';
  const checked = [...document.querySelectorAll('#eventsGrid input[type=checkbox]:checked')];
  const relay   = document.getElementById('relayOpt')?.checked;
  const seeds   = {};
  document.querySelectorAll('#seedTimeGrid .wiz-seed-row').forEach(r => {
    seeds[r.dataset.event] = r.querySelector('.wiz-seed-input')?.value || 'NT';
  });

  const evRows = checked.map(cb =>
    `<div class="wiz-rv-row"><span class="wiz-rv-key">${cb.value}</span><span class="wiz-rv-val">Seed: ${seeds[cb.value]||'NT'} &middot; &#8377;300</span></div>`
  ).join('');

  box.innerHTML = `
    <div class="wiz-rv-section">Swimmer</div>
    <div class="wiz-rv-row"><span class="wiz-rv-key">Name</span><span class="wiz-rv-val">${get('swimmerName')}</span></div>
    <div class="wiz-rv-row"><span class="wiz-rv-key">Gender</span><span class="wiz-rv-val">${get('gender')}</span></div>
    <div class="wiz-rv-row"><span class="wiz-rv-key">Age Group</span><span class="wiz-rv-val">${get('ageGroup')}</span></div>
    <div class="wiz-rv-section">Parent</div>
    <div class="wiz-rv-row"><span class="wiz-rv-key">Name</span><span class="wiz-rv-val">${get('parentName')} (${get('relationship')})</span></div>
    <div class="wiz-rv-row"><span class="wiz-rv-key">Mobile</span><span class="wiz-rv-val">${get('phone')}</span></div>
    <div class="wiz-rv-row"><span class="wiz-rv-key">Email</span><span class="wiz-rv-val">${get('email')}</span></div>
    <div class="wiz-rv-section">Academy</div>
    <div class="wiz-rv-row"><span class="wiz-rv-key">Name</span><span class="wiz-rv-val">${get('institution')}</span></div>
    <div class="wiz-rv-row"><span class="wiz-rv-key">Type</span><span class="wiz-rv-val">${get('instType')}</span></div>
    <div class="wiz-rv-section">Events</div>
    ${evRows}
    ${relay ? '<div class="wiz-rv-row"><span class="wiz-rv-key">Relay</span><span class="wiz-rv-val">Opted in &middot; &#8377;150</span></div>' : ''}`;
}

// ── Payment summary ───────────────────────────────────
function buildPaymentSummary() {
  const card = document.getElementById('paymentSummaryCard');
  if (!card) return;
  const name   = document.getElementById('swimmerName')?.value || '—';
  const age    = document.getElementById('ageGroup')?.value    || '—';
  const gender = document.getElementById('gender')?.value      || '';
  const checked= [...document.querySelectorAll('#eventsGrid input[type=checkbox]:checked')];
  const relay  = document.getElementById('relayOpt')?.checked;
  const sub    = checked.length * EVENT_FEE + (relay ? RELAY_FEE : 0);
  const tax    = Math.round(sub * GST_RATE);
  const total  = sub + tax;
  if (document.getElementById('ptdAmount')) document.getElementById('ptdAmount').textContent = `\u20B9${total}`;
  card.innerHTML = `
    <div class="wiz-pc-row"><span class="wiz-pc-label">Swimmer</span><span>${name}</span></div>
    <div class="wiz-pc-row"><span class="wiz-pc-label">Category</span><span>${gender} ${age}</span></div>
    <div class="wiz-pc-row"><span class="wiz-pc-label">Events</span><span>${checked.length} individual${relay?' + Relay':''}</span></div>
    <div class="wiz-pc-row"><span class="wiz-pc-label">Subtotal</span><span>&#8377;${sub}</span></div>
    <div class="wiz-pc-row"><span class="wiz-pc-label">GST (18%)</span><span>&#8377;${tax}</span></div>
    <div class="wiz-pc-row" style="border-top:1px solid rgba(255,255,255,.2);padding-top:8px;margin-top:4px">
      <span style="font-weight:700;color:#fff">Total</span><span class="wiz-pc-total">&#8377;${total}</span>
    </div>`;
}

// ── Simulate Payment ──────────────────────────────────
function simulatePayment() {
  const method = document.querySelector('.wiz-pay-opt.selected input')?.value || 'upi';
  const upiId  = document.getElementById('upiId')?.value?.trim();

  const swIdFld = document.getElementById('swimmerId');
  if (swIdFld && !swIdFld.value) swIdFld.value = `SWM-2026-${String(Math.floor(Math.random()*9000)+1000)}`;

  // Calculate total in paise
  const checked = [...document.querySelectorAll('#eventsGrid input[type=checkbox]:checked')];
  const hasRelay = document.getElementById('relayOpt')?.checked;
  const sub = checked.length * EVENT_FEE + (hasRelay ? RELAY_FEE : 0);
  const tax = Math.round(sub * GST_RATE);
  const total = sub + tax;
  const amountPaise = total * 100; // Razorpay expects paise

  const swimmerName = document.getElementById('swimmerName')?.value || 'Swimmer';
  const email = document.getElementById('email')?.value || '';
  const phone = document.getElementById('phone')?.value || '';

  // Step 1: Create Razorpay order via backend
  fetch('/api/payment/create-order', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      amount: amountPaise,
      tournament_id: 'GNMC-2026',
      swimmer_id: swIdFld?.value || ''
    })
  })
  .then(r => r.json())
  .then(order => {
    if (order.error) {
      alert('Payment error: ' + order.error);
      return;
    }

    // Step 2: Open Razorpay checkout
    const options = {
      key: order.key_id,
      amount: order.amount,
      currency: order.currency,
      name: 'SwimFest India',
      description: 'Golden Non-Medalist Championship 2026',
      order_id: order.order_id,
      prefill: {
        name: swimmerName,
        email: email,
        contact: phone
      },
      theme: {
        color: '#1d4ed8'
      },
      method: {
        upi: true,
        card: true,
        netbanking: true,
        wallet: true,
        qr: true
      },
      handler: function(response) {
        // Step 3: Payment successful — verify and save
        fetch('/api/payment/verify', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            booking_id: swIdFld?.value || ''
          })
        })
        .then(r => r.json())
        .then(verifyRes => {
          // Save booking to backend
          const swimmerData = {
            full_name: swimmerName,
            gender: document.getElementById('gender')?.value || '',
            dob: document.getElementById('dob')?.value || '',
            parent_name: document.getElementById('parentName')?.value || '',
            parent_relationship: document.getElementById('relationship')?.value || '',
            parent_mobile: phone,
            parent_email: email,
            academy_id: document.getElementById('institution')?.value || '',
            institution_type: document.getElementById('instType')?.value || '',
          };

          const events = checked.map(cb => ({
            event_name: cb.value,
            seed_time: 'NT',
            event_code: 'FS',
            distance: cb.value.split(' ')[0]
          }));

          // Register swimmer + create booking
          fetch('/api/swimmers', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(swimmerData)
          })
          .then(r => r.json())
          .then(swimRes => {
            return fetch('/api/bookings', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({
                swimmer_id: swimRes.swimmer_id || swIdFld.value,
                tournament_id: 'GNMC-2026',
                events: events,
                relay_opted: hasRelay,
                payment_method: method,
                consent_rules: 1, consent_refund: 1,
                consent_parent: 1, consent_medical: 1, consent_nonmedalist: 1,
              })
            });
          })
          .then(r => r.json())
          .then(() => {
            buildConfirmation();
            wizardGoto(7);
          });
        });
      },
      modal: {
        ondismiss: function() {
          alert('Payment cancelled. You can try again.');
        }
      }
    };

    const rzp = new Razorpay(options);
    rzp.open();
  })
  .catch(err => {
    console.warn('Razorpay unavailable, using demo mode:', err);
    // Fallback: demo mode if Razorpay fails
    buildConfirmation();
    wizardGoto(7);
  });
}

function buildConfirmation() {
  const det = document.getElementById('bcDetails');
  if (!det) return;
  const swId    = document.getElementById('swimmerId')?.value || `SWM-2026-${Math.floor(Math.random()*9000)+1000}`;
  const name    = document.getElementById('swimmerName')?.value || '—';
  const age     = document.getElementById('ageGroup')?.value    || '—';
  const gender  = document.getElementById('gender')?.value      || '';
  const acad    = document.getElementById('institution')?.value || '—';
  const parent  = document.getElementById('parentName')?.value  || '—';
  const email   = document.getElementById('email')?.value       || '—';
  const phone   = document.getElementById('phone')?.value       || '';
  const checked = [...document.querySelectorAll('#eventsGrid input[type=checkbox]:checked')];
  const relay   = document.getElementById('relayOpt')?.checked;
  const seeds   = {};
  document.querySelectorAll('#seedTimeGrid .wiz-seed-row').forEach(r => {
    seeds[r.dataset.event] = r.querySelector('.wiz-seed-input')?.value || 'NT';
  });
  const sub   = checked.length * EVENT_FEE + (relay ? RELAY_FEE : 0);
  const tax   = Math.round(sub * GST_RATE);
  const total = sub + tax;
  const evNames = checked.map(cb => cb.value).join(', ');

  const evRows = checked.map(cb =>
    `<div class="wiz-conf-row"><span class="wiz-conf-row-label">${cb.value}</span><span class="wiz-conf-row-val">Seed: ${seeds[cb.value]||'NT'} &middot; &#8377;${EVENT_FEE}</span></div>`
  ).join('');

  det.innerHTML = `
    <div class="wiz-conf-row"><span class="wiz-conf-row-label">Booking ID</span><span class="wiz-conf-row-val">${swId}</span></div>
    <div class="wiz-conf-row"><span class="wiz-conf-row-label">Swimmer</span><span class="wiz-conf-row-val">${name}</span></div>
    <div class="wiz-conf-row"><span class="wiz-conf-row-label">Category</span><span class="wiz-conf-row-val">${gender} ${age}</span></div>
    <div class="wiz-conf-row"><span class="wiz-conf-row-label">Academy</span><span class="wiz-conf-row-val">${acad}</span></div>
    <div class="wiz-conf-row"><span class="wiz-conf-row-label">Parent</span><span class="wiz-conf-row-val">${parent}</span></div>
    <div class="wiz-conf-row"><span class="wiz-conf-row-label">Email</span><span class="wiz-conf-row-val">${email}</span></div>
    ${evRows}
    ${relay ? `<div class="wiz-conf-row"><span class="wiz-conf-row-label">Relay</span><span class="wiz-conf-row-val">Opted in &middot; &#8377;${RELAY_FEE}</span></div>` : ''}
    <div class="wiz-conf-row wiz-conf-total"><span class="wiz-conf-row-label">Amount Paid</span><span class="wiz-conf-row-val">&#8377;${total} (incl. 18% GST)</span></div>`;

  // WhatsApp confirmation message
  const cleanPhone = phone.replace(/[^0-9]/g, '').replace(/^0+/, '');
  const waPhone = cleanPhone.startsWith('91') ? cleanPhone : '91' + cleanPhone;
  const waMsg = encodeURIComponent(
`*SwimFest India - Booking Confirmed!*

*Golden Non-Medalist Championship 2026*
SRM University, Kattankulathur
June 20-22, 2026

*Swimmer:* ${name}
*ID:* ${swId}
*Category:* ${gender} ${age}
*Academy:* ${acad}
*Events:* ${evNames}${relay ? ' + Relay' : ''}
*Amount Paid:* Rs.${total} (incl. GST)

*Check-in:* June 20 at 8:00 AM
Carry: Age proof, Declaration, Authorization

Thank you for registering!
- SwimFest India`);

  // Add WhatsApp button
  const actions = document.querySelector('.wiz-conf-actions');
  if (actions && phone) {
    const waBtn = document.createElement('button');
    waBtn.type = 'button';
    waBtn.className = 'wiz-btn-next';
    waBtn.style.background = '#25D366';
    waBtn.innerHTML = '&#128172; WhatsApp Confirmation';
    waBtn.onclick = () => window.open(`https://wa.me/${waPhone}?text=${waMsg}`, '_blank');
    if (!actions.querySelector('[style*="25D366"]')) actions.prepend(waBtn);
  }

  // Auto-open WhatsApp after 2 seconds
  if (phone && waPhone.length >= 12) {
    setTimeout(() => window.open(`https://wa.me/${waPhone}?text=${waMsg}`, '_blank'), 2000);
  }
}

function viewBooking() {
  const id = document.getElementById('swimmerId')?.value || 'N/A';
  alert(`Booking ID: ${id}\n\nYour participation certificate will be available after the event is completed.\n\nCheck your profile page after June 22, 2026.`);
}

function downloadReceipt() {
  const id   = document.getElementById('swimmerId')?.value  || 'N/A';
  const name = document.getElementById('swimmerName')?.value || 'Swimmer';
  const amt  = document.getElementById('ptdAmount')?.textContent || '';
  const txt  = [
    '===================================',
    ' GOLDEN NON-MEDALIST CHAMPIONSHIP',
    '  SRM University, Kattankulathur',
    '===================================',
    `Booking ID : ${id}`,
    `Swimmer    : ${name}`,
    `Amount Paid: ${amt} (incl. GST)`,
    `Event Date : June 20-22, 2026`,
    '-----------------------------------',
    'Carry all documents on Day 1.',
    'June 20, 2026 at 08:00 AM',
    '===================================',
  ].join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([txt], {type:'text/plain'}));
  a.download = `Receipt-${id}.txt`;
  a.click();
  URL.revokeObjectURL(a.href);
}

// ── Results accordion (home page) ─────────────────────
function toggleResults(panelId, btn) {
  const panel = document.getElementById(panelId);
  if (!panel) return;
  const isOpen = panel.classList.contains('open');
  document.querySelectorAll('.results-panel').forEach(p => p.classList.remove('open'));
  document.querySelectorAll('.results-trigger-btn').forEach(b => b.classList.remove('open'));
  if (!isOpen) { panel.classList.add('open'); btn.classList.add('open'); }
}

// ── Swimmer filter (event.html) ───────────────────────
let activeGender = 'all', activeCat = 'all';
function applyFilter() {
  document.querySelectorAll('#swimmersGrid .swimmer-card').forEach(card => {
    const gMatch = activeGender === 'all' || card.dataset.gender === activeGender;
    const cMatch = activeCat   === 'all' || card.dataset.cat    === activeCat;
    card.classList.toggle('hidden', !(gMatch && cMatch));
  });
}
document.querySelectorAll('.gender-btn').forEach(btn => btn.addEventListener('click', () => {
  document.querySelectorAll('.gender-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active'); activeGender = btn.dataset.gender; applyFilter();
}));
document.querySelectorAll('.cat-filter-btn').forEach(btn => btn.addEventListener('click', () => {
  document.querySelectorAll('.cat-filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active'); activeCat = btn.dataset.cat; applyFilter();
}));

// ── Tab switching (event.html schedule) ──────────────
document.querySelectorAll('.tab-bar').forEach(bar => {
  bar.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      bar.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      bar.parentElement.querySelectorAll('.tab-content').forEach(p => {
        p.classList.toggle('active', p.id === btn.dataset.tab);
      });
    });
  });
});

// ── Scroll-in animation ───────────────────────────────
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity   = '1';
      e.target.style.transform = 'translateY(0)';
      io.unobserve(e.target);
    }
  });
}, {threshold:0.06});

document.querySelectorAll('.swimmer-card,.contact-card,.cat-card,.elig-card,.event-card,.past-event-row').forEach(el => {
  el.style.opacity   = '0';
  el.style.transform = 'translateY(22px)';
  el.style.transition = 'opacity 0.45s ease, transform 0.45s ease';
  io.observe(el);
});
