/* heatsheet.js */

const ENTRY_TABLE = [
  {swimId:'SWM-001',name:'Arun Kumar',    yob:2015,state:'Tamil Nadu',      academy:'Chennai Swim',        cat:'U-12',gender:'Boys', event:'50m Freestyle', code:'FS',dist:'50m', seed:'00:39.2'},
  {swimId:'SWM-002',name:'Rahul Patrick', yob:2014,state:'Kerala',          academy:'Kerala Aquatics',     cat:'U-12',gender:'Boys', event:'50m Freestyle', code:'FS',dist:'50m', seed:'00:40.5'},
  {swimId:'SWM-003',name:'Dev Krishnan',  yob:2015,state:'Tamil Nadu',      academy:'SRM Swim Club',       cat:'U-12',gender:'Boys', event:'50m Freestyle', code:'FS',dist:'50m', seed:'00:41.1'},
  {swimId:'SWM-004',name:'Sanjay Iyer',   yob:2014,state:'Karnataka',       academy:'Madurai Marlins',     cat:'U-12',gender:'Boys', event:'50m Freestyle', code:'FS',dist:'50m', seed:'00:41.8'},
  {swimId:'SWM-005',name:'Rajan Das',     yob:2015,state:'West Bengal',     academy:'TN Swim Academy',     cat:'U-12',gender:'Boys', event:'50m Freestyle', code:'FS',dist:'50m', seed:'00:42.3'},
  {swimId:'SWM-006',name:'Praveen T',     yob:2014,state:'Tamil Nadu',      academy:'SRM Swim Club',       cat:'U-12',gender:'Boys', event:'50m Freestyle', code:'FS',dist:'50m', seed:'NT'},
  {swimId:'SWM-014',name:'Sneha Iyer',    yob:2015,state:'Tamil Nadu',      academy:'SRM Swim Club',       cat:'U-12',gender:'Girls',event:'50m Freestyle', code:'FS',dist:'50m', seed:'00:31.3'},
  {swimId:'SWM-015',name:'Divya Menon',   yob:2014,state:'Kerala',          academy:'Chennai Dolphins',    cat:'U-12',gender:'Girls',event:'50m Freestyle', code:'FS',dist:'50m', seed:'00:32.8'},
  {swimId:'SWM-016',name:'Harini Raj',    yob:2015,state:'Tamil Nadu',      academy:'Kattankulathur Aqua', cat:'U-12',gender:'Girls',event:'50m Freestyle', code:'FS',dist:'50m', seed:'00:33.1'},
  {swimId:'SWM-017',name:'Lakshmi V',     yob:2015,state:'Andhra Pradesh',  academy:'TN Swim Academy',     cat:'U-12',gender:'Girls',event:'50m Freestyle', code:'FS',dist:'50m', seed:'NT'},
  {swimId:'SWM-010',name:'Karthik M',     yob:2013,state:'Tamil Nadu',      academy:'Aquatic Chennai',     cat:'U-14',gender:'Boys', event:'100m Freestyle',code:'FS',dist:'100m',seed:'00:58.7'},
  {swimId:'SWM-011',name:'Arjun Kumar',   yob:2013,state:'Tamil Nadu',      academy:'Chennai Dolphins',    cat:'U-14',gender:'Boys', event:'100m Freestyle',code:'FS',dist:'100m',seed:'01:01.0'},
  {swimId:'SWM-012',name:'Zain Khalid',   yob:2012,state:'Maharashtra',     academy:'Madurai Marlins',     cat:'U-14',gender:'Boys', event:'100m Freestyle',code:'FS',dist:'100m',seed:'01:02.3'},
  {swimId:'SWM-013',name:'Ethan Brown',   yob:2013,state:'Delhi',           academy:'SRM Swim Club',       cat:'U-14',gender:'Boys', event:'100m Freestyle',code:'FS',dist:'100m',seed:'01:03.1'},
  {swimId:'SWM-020',name:'Priya Sharma',  yob:2013,state:'Tamil Nadu',      academy:'Blue Waves',          cat:'U-14',gender:'Girls',event:'100m Freestyle',code:'FS',dist:'100m',seed:'01:02.4'},
  {swimId:'SWM-021',name:'Sofia M',       yob:2012,state:'Karnataka',       academy:'SRM Swim Club',       cat:'U-14',gender:'Girls',event:'100m Freestyle',code:'FS',dist:'100m',seed:'01:04.7'},
  {swimId:'SWM-030',name:'Rahul Mehta',   yob:2011,state:'Tamil Nadu',      academy:'Madurai Marlins',     cat:'U-16',gender:'Boys', event:'100m Freestyle',code:'FS',dist:'100m',seed:'00:55.3'},
  {swimId:'SWM-031',name:'Chen Wei',      yob:2010,state:'Tamil Nadu',      academy:'SRM Swim Club',       cat:'U-16',gender:'Boys', event:'100m Freestyle',code:'FS',dist:'100m',seed:'00:56.8'},
  {swimId:'SWM-032',name:'Marco R',       yob:2011,state:'Kerala',          academy:'Chennai Dolphins',    cat:'U-16',gender:'Boys', event:'100m Freestyle',code:'FS',dist:'100m',seed:'00:58.0'},
  {swimId:'SWM-040',name:'Meera Pillai',  yob:2011,state:'Tamil Nadu',      academy:'Madurai Marlins',     cat:'U-16',gender:'Girls',event:'100m Freestyle',code:'FS',dist:'100m',seed:'01:00.4'},
  {swimId:'SWM-041',name:'Layla Hassan',  yob:2010,state:'Tamil Nadu',      academy:'SRM Swim Club',       cat:'U-16',gender:'Girls',event:'100m Freestyle',code:'FS',dist:'100m',seed:'01:01.8'},
];

/* Relay teams */
const RELAY_TEAMS = [
  {cat:'U-12',gender:'Boys', event:'4x50m Freestyle Relay',
   teams:[
     {name:'Chennai Swim',       swimmers:['Arun Kumar','Dev Krishnan','Praveen T','Sanjay Iyer']},
     {name:'Kerala Aquatics',    swimmers:['Rahul Patrick','Rajan Das','Nikhil K','Suraj P']},
   ]},
  {cat:'U-12',gender:'Girls',event:'4x50m Freestyle Relay',
   teams:[
     {name:'SRM Swim Club',      swimmers:['Sneha Iyer','Harini Raj','Preethi R','Ananya S']},
     {name:'Chennai Dolphins',   swimmers:['Divya Menon','Lakshmi V','Kavya N','Pooja T']},
   ]},
  {cat:'U-14',gender:'Boys', event:'4x100m Freestyle Relay',
   teams:[
     {name:'Aquatic Chennai',    swimmers:['Karthik M','Arjun Kumar','Ethan Brown','Zain Khalid']},
     {name:'SRM Swim Club',      swimmers:['Naveen','Saran','Pradeep','Dinesh']},
   ]},
  {cat:'U-14',gender:'Girls',event:'4x100m Freestyle Relay',
   teams:[
     {name:'Blue Waves',         swimmers:['Priya Sharma','Sofia M','Nour E','Chloe D']},
   ]},
  {cat:'U-16',gender:'Boys', event:'4x100m Freestyle Relay',
   teams:[
     {name:'SRM Swim Club',      swimmers:['Rahul Mehta','Chen Wei','Marco R','Arun V']},
   ]},
];

let LANES = 8;
let heatData = [];

const LANE_PATTERNS = {
  6:  [3,4,2,5,1,6],
  8:  [4,5,3,6,2,7,1,8],
  10: [5,6,4,7,3,8,2,9,1,10],
};

const CODE_COLORS = {FS:'#1d4ed8',BK:'#7c3aed',BR:'#059669',BF:'#d97706',IM:'#dc2626',RLY:'#374151'};
const CAT_COLORS  = {'U-10':'#f97316','U-12':'#8b5cf6','U-14':'#0ea5e9','U-16':'#10b981'};

function calcStartTime(baseMinutes) {
  const h = Math.floor(baseMinutes/60), m = baseMinutes%60;
  const ampm = h<12?'AM':'PM', h12=h%12||12;
  return `${String(h12).padStart(2,'0')}:${String(m).padStart(2,'0')} ${ampm}`;
}

function seedToSec(seed) {
  if (!seed || seed==='NT') return Infinity;
  const p = seed.split(':');
  return parseFloat(p[0])*60 + parseFloat(p[1]);
}

function rankEntries(swimmers) {
  const sorted = [...swimmers].filter(s=>s.seed!=='NT').sort((a,b)=>seedToSec(a.seed)-seedToSec(b.seed));
  const ranks = {};
  sorted.forEach((s,i)=>ranks[s.swimId]=i+1);
  swimmers.filter(s=>s.seed==='NT').forEach(s=>ranks[s.swimId]='NT');
  return ranks;
}

function generateHeats() {
  const pattern = LANE_PATTERNS[LANES]||LANE_PATTERNS[8];
  heatData = [];
  const groups = {};
  ENTRY_TABLE.forEach(e=>{
    const key=`${e.cat}__${e.gender}__${e.event}`;
    if(!groups[key]) groups[key]=[];
    groups[key].push({...e});
  });

  let baseMin = 9*60; // 09:00 AM
  Object.keys(groups).sort().forEach(key=>{
    const swimmers = groups[key];
    const ranks    = rankEntries(swimmers);
    swimmers.sort((a,b)=>seedToSec(a.seed)-seedToSec(b.seed));

    const heats=[];
    for(let i=0;i<swimmers.length;i+=LANES) heats.push(swimmers.slice(i,i+LANES));

    const processedHeats = heats.map((heat,hi)=>{
      const sorted=[...heat].sort((a,b)=>seedToSec(a.seed)-seedToSec(b.seed));
      let sno=1;
      const assigned = sorted.map((sw,pos)=>({
        ...sw, rank:ranks[sw.swimId], sno:sno++,
        heatNo:hi+1, laneNo:pattern[pos]||(pos+1),
        startTime:calcStartTime(baseMin + hi*3),
      }));
      assigned.sort((a,b)=>a.laneNo-b.laneNo);
      return assigned;
    });

    const parts=key.split('__');
    heatData.push({cat:parts[0],gender:parts[1],event:parts[2],
      code:swimmers[0].code, dist:swimmers[0].dist, heats:processedHeats,
      startTime:calcStartTime(baseMin)});
    baseMin += heats.length*3 + 5;
  });

  renderHeatSheet();
  updateSummary();
}

function renderHeatSheet() {
  const fCat   = document.getElementById('filterCat')?.value||'all';
  const fEvent = document.getElementById('filterEvent')?.value||'all';
  const search = document.getElementById('searchSwimmer')?.value.toLowerCase()||'';
  const output = document.getElementById('heatSheetOutput');
  if(!output) return;

  let html='', shown=0;

  heatData.forEach(group=>{
    const catLabel=`${group.cat} ${group.gender}`;
    if(fCat!=='all' && catLabel!==fCat) return;
    if(fEvent!=='all' && group.event!==fEvent) return;

    const filteredHeats = group.heats.map(h=>h.filter(r=>!search||
      r.name.toLowerCase().includes(search)||
      r.swimId.toLowerCase().includes(search)||
      r.academy.toLowerCase().includes(search)||
      r.state.toLowerCase().includes(search)
    )).filter(h=>h.length>0);
    if(!filteredHeats.length) return;
    shown++;

    const catClr = CAT_COLORS[group.cat]||'#374151';
    const codeClr= CODE_COLORS[group.code]||'#374151';
    const genClr = group.gender==='Boys'?'#1d4ed8':'#db2777';

    // ── Event header ──
    html += `<div class="hs-event-block">
      <div class="hs-event-block-header">
        <div class="hs-ev-title">
          <span style="background:${codeClr};color:#fff;padding:3px 9px;border-radius:4px;font-size:.66rem;font-weight:800">${group.code}</span>
          <h3>${group.event} &mdash; ${group.dist}</h3>
          <div class="hs-ev-pills">
            <span class="hs-ev-pill" style="background:${catClr}">${group.cat}</span>
            <span class="hs-ev-pill" style="background:${genClr}">${group.gender}</span>
          </div>
        </div>
        <div class="hs-ev-meta">
          <span>&#128336; Session starts: ${group.startTime}</span>
          <span>&#127949; ${filteredHeats.length} heat${filteredHeats.length>1?'s':''}</span>
          <span>&#128100; ${filteredHeats.reduce((a,h)=>a+h.length,0)} swimmers</span>
          <span>&#127944; ${LANES} lanes</span>
        </div>
      </div>`;

    filteredHeats.forEach((heat,hi)=>{
      const slowSec = heat.reduce((mx,r)=>{const s=seedToSec(r.seed);return s!==Infinity&&s>mx?s:mx;},0);
      const estDur  = slowSec>0?`~${Math.ceil(slowSec+30)}s`:'--';
      html += `<div class="hs-heat-block">
        <div class="hs-heat-header">
          <span class="hs-heat-title">HEAT ${hi+1} of ${filteredHeats.length}</span>
          <span class="hs-heat-time">&#128336; ${heat[0]?.startTime||'--'}</span>
          <span class="hs-heat-est">Est. completion: ${estDur}</span>
        </div>
        <table class="hs-heat-table">
          <thead><tr>
            <th>S.No</th><th>Swimmer Name</th><th>Year Born</th>
            <th>State</th><th>Team / Club</th><th>Seed Time</th>
            <th>Rank</th><th>Heat No</th><th>Lane No</th>
          </tr></thead><tbody>`;

      heat.forEach(row=>{
        const isNT = row.seed==='NT';
        const ctr  = row.laneNo===4||row.laneNo===5;
        html += `<tr class="${ctr?'hs-lane-centre':''}">
          <td style="text-align:center;font-weight:700">${row.sno}</td>
          <td style="font-weight:700;color:#0f172a">${row.name}</td>
          <td style="text-align:center">${row.yob}</td>
          <td>${row.state}</td>
          <td>${row.academy}</td>
          <td class="${isNT?'hs-nt':'hs-seed-cell'}">${row.seed}</td>
          <td style="text-align:center;font-weight:700;color:${isNT?'#94a3b8':'#1d4ed8'}">${row.rank}</td>
          <td style="text-align:center">${row.heatNo}</td>
          <td class="hs-lane-cell">${row.laneNo}${ctr?' &#9733;':''}</td>
        </tr>`;
      });
      html += `</tbody></table></div>`;
    });
    html += `</div>`;
  });

  // ── Relay section ──
  const showAll   = fCat==='all' && fEvent==='all';
  const relayMatch= RELAY_TEAMS.filter(r=>{
    const lbl=`${r.cat} ${r.gender}`;
    return (fCat==='all'||fCat===lbl) && (fEvent==='all'||fEvent===r.event);
  });

  if(relayMatch.length>0 && !search){
    html += `<div class="hs-relay-section">
      <div class="hs-relay-header">&#127882; Relay Events</div>`;

    relayMatch.forEach(rel=>{
      const catClr=CAT_COLORS[rel.cat]||'#374151';
      const genClr=rel.gender==='Boys'?'#1d4ed8':'#db2777';
      html += `<div class="hs-relay-event-block">
        <div class="hs-relay-event-title">
          <span style="background:#374151;color:#fff;padding:3px 9px;border-radius:4px;font-size:.66rem;font-weight:800">RLY</span>
          <strong>${rel.event}</strong>
          <span class="hs-ev-pill" style="background:${catClr};color:#fff;font-size:.65rem;padding:2px 9px;border-radius:999px">${rel.cat}</span>
          <span class="hs-ev-pill" style="background:${genClr};color:#fff;font-size:.65rem;padding:2px 9px;border-radius:999px">${rel.gender}</span>
        </div>
        <table class="hs-relay-table">
          <thead><tr>
            <th>Team / Club</th>
            <th>Swimmer 1</th><th>Swimmer 2</th><th>Swimmer 3</th><th>Swimmer 4</th>
          </tr></thead><tbody>`;
      rel.teams.forEach(team=>{
        html += `<tr>
          <td class="hs-relay-teamname">${team.name}</td>
          ${team.swimmers.map(s=>`<td class="hs-relay-swimmer">${s}</td>`).join('')}
        </tr>`;
      });
      html += `</tbody></table></div>`;
    });
    html += `</div>`;
  }

  if(!shown && !relayMatch.length) html=`<div class="hs-empty">No entries match the selected filters.</div>`;
  output.innerHTML = html;
}

function updateSummary(){
  const bar=document.getElementById('summaryBar');
  if(!bar) return;
  const uniq   = new Set(ENTRY_TABLE.map(e=>e.swimId)).size;
  const totalH = heatData.reduce((a,g)=>a+g.heats.length,0);
  bar.innerHTML=`
    <span class="hs-sum-item">Events: <strong>${heatData.length}</strong></span>
    <span style="color:#e2e8f0">|</span>
    <span class="hs-sum-item">Heats: <strong>${totalH}</strong></span>
    <span style="color:#e2e8f0">|</span>
    <span class="hs-sum-item">Swimmers: <strong>${uniq}</strong></span>
    <span style="color:#e2e8f0">|</span>
    <span class="hs-sum-item">Entries: <strong>${ENTRY_TABLE.length}</strong></span>
    <span style="color:#e2e8f0">|</span>
    <span class="hs-sum-item">Relay Teams: <strong>${RELAY_TEAMS.reduce((a,r)=>a+r.teams.length,0)}</strong></span>
    <span style="color:#e2e8f0">|</span>
    <span class="hs-sum-item">Lanes: <strong>${LANES}</strong></span>
    <span style="color:#e2e8f0">|</span>
    <span class="hs-sum-item">3 min/heat &nbsp;&middot;&nbsp; Centre lanes 4&ndash;5 = fastest seed &#9733;</span>`;
}

function exportCSV(){
  let csv='S.No,Heat No,Lane No,Swimmer ID,Name,Year Born,State,Academy,Category,Gender,Event,Seed Time,Rank\n';
  heatData.forEach(g=>g.heats.forEach(h=>h.forEach(r=>{
    csv+=`${r.sno},${r.heatNo},${r.laneNo},${r.swimId},"${r.name}",${r.yob},${r.state},"${r.academy}",${r.cat},${r.gender},"${r.event}",${r.seed},${r.rank}\n`;
  })));
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));
  a.download='HeatSheet_GNMC_2026.csv';
  a.click();
  URL.revokeObjectURL(a.href);
}

function exportPDF(){
  // Use browser print with a clean print stylesheet
  const printContent = document.getElementById('hs-table-area') || document.querySelector('.hs-table-area');
  if(!printContent){
    alert('Generate heat sheet first before exporting PDF.');
    return;
  }
  const win = window.open('','_blank');
  win.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>Heat Sheet — SwimFest India</title>
  <style>
    body{font-family:Arial,sans-serif;font-size:11px;margin:20px}
    h1{font-size:16px;margin-bottom:4px}
    p{margin:2px 0;color:#555}
    table{width:100%;border-collapse:collapse;margin-bottom:20px}
    th{background:#0a1628;color:#fff;padding:6px 8px;text-align:left;font-size:10px}
    td{padding:5px 8px;border-bottom:1px solid #ddd;font-size:11px}
    tr:nth-child(even){background:#f9f9f9}
    .event-header{background:#1d4ed8;color:#fff;padding:8px 10px;margin-top:14px;font-weight:bold;font-size:12px}
    @media print{@page{size:A4;margin:15mm}}
  </style>
</head>
<body>
  <h1>SwimFest India — Heat Sheet</h1>
  <p>Generated: ${new Date().toLocaleString()}</p>
  <hr/>
  ${printContent.innerHTML}
</body></html>`);
  win.document.close();
  win.focus();
  setTimeout(()=>{ win.print(); }, 500);
}

document.querySelectorAll('.hs-lane-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.hs-lane-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    LANES=parseInt(btn.dataset.lanes);
    const hint=document.getElementById('laneHint');
    if(hint){const mid=Math.ceil(LANES/2);hint.textContent=`Centre lanes ${mid}–${mid+1} seeded fastest`;}
    generateHeats();
  });
});

// add relay CSS
const style=document.createElement('style');
style.textContent=`
.hs-relay-section{max-width:1300px;margin:0 auto;padding:0 20px 24px}
.hs-relay-header{font-size:.75rem;font-weight:800;text-transform:uppercase;letter-spacing:.7px;color:#0a1628;padding:10px 14px;background:#f0fdf4;border:1px solid #86efac;border-radius:8px;margin-bottom:14px}
.hs-relay-event-block{margin-bottom:20px;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden}
.hs-relay-event-title{display:flex;align-items:center;gap:8px;padding:10px 14px;background:#f8fafc;border-bottom:1px solid #e2e8f0;flex-wrap:wrap;font-size:.85rem;font-weight:700;color:#0a1628}
.hs-relay-table{width:100%;border-collapse:collapse;font-size:.82rem}
.hs-relay-table th{background:#0a1628;color:#fff;padding:8px 14px;text-align:left;font-size:.68rem;font-weight:700;text-transform:uppercase;letter-spacing:.4px}
.hs-relay-table td{padding:10px 14px;border-bottom:1px solid #f1f5f9}
.hs-relay-table tr:last-child td{border-bottom:none}
.hs-relay-table tr:hover td{background:#f8fafc}
.hs-relay-teamname{font-weight:800;color:#1d4ed8}
.hs-relay-swimmer{font-weight:600;color:#0f172a}`;
document.head.appendChild(style);

generateHeats();
