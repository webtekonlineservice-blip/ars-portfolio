// ARS Portfolio frontend logic

const money = (n) => (n === null || n === undefined || n === '')
  ? '—'
  : '$' + Number(n).toLocaleString('en-US', { maximumFractionDigits: 0 });
const num = (n) => (n === null || n === undefined || n === '') ? '—' : Number(n).toLocaleString('en-US');
const bathLabel = (full, half) => half ? String(full + 0.5 * half) : String(full);

async function getJSON(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error((await r.json()).error || r.statusText);
  return r.json();
}

// ---- portfolio cards ----
async function loadRollup() {
  const d = await getJSON('/api/rollup');
  const cards = [
    ['Properties', num(d.num_properties)],
    ['Total beds', num(d.total_beds)],
    ['Living sq ft', num(d.total_living_sqft)],
    ['Market value \'25', money(d.total_market_value_2025)],
    ['Total RealAVM', money(d.total_realavm)],
    ['Annual tax \'25', money(d.total_annual_tax_2025)],
    ['List price', money(d.total_list_price)],
  ];
  document.getElementById('rollup').innerHTML = cards.map(([label, value]) =>
    `<div class="card"><div class="label">${label}</div><div class="value">${value}</div></div>`).join('');
}

// ---- property table ----
let allProps = [];
let sortKey = 'market_value_2025';
let sortDir = -1;

const MONEY_KEYS = new Set(['market_value_2025', 'realavm', 'tax_2025', 'list_price']);

function renderTable() {
  const filter = document.getElementById('filter').value.toLowerCase();
  const rows = allProps
    .filter((p) => p.address.toLowerCase().includes(filter))
    .sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      if (av === null) return 1; if (bv === null) return -1;
      if (typeof av === 'number') return (av - bv) * sortDir;
      return String(av).localeCompare(String(bv)) * sortDir;
    });

  document.querySelector('#propTable tbody').innerHTML = rows.map((p) => `
    <tr data-id="${p.property_id}">
      <td>${p.address}</td>
      <td>${p.owner ?? '—'}</td>
      <td class="num">${p.beds}</td>
      <td class="num">${bathLabel(p.full_baths, p.half_baths)}</td>
      <td class="num">${num(p.living_sqft)}</td>
      <td class="num">${p.year_built ?? '—'}</td>
      <td class="num">${money(p.market_value_2025)}</td>
      <td class="num">${money(p.realavm)}</td>
      <td class="num">${money(p.tax_2025)}</td>
      <td class="num">${money(p.list_price)}</td>
    </tr>`).join('');

  document.querySelectorAll('#propTable th').forEach((th) => {
    th.setAttribute('aria-sort', th.dataset.key === sortKey ? (sortDir === 1 ? 'ascending' : 'descending') : 'none');
  });
}

async function loadProps() {
  allProps = await getJSON('/api/properties');
  renderTable();
}

// ---- detail drawer ----
async function openDetail(id) {
  const p = await getJSON('/api/property/' + id);
  const valRows = p.valuations.map((v) => `
    <tr><td>${v.year}</td><td class="num">${money(v.market_total)}</td>
    <td class="num">${money(v.total_tax)}</td><td class="num">${money(v.realavm)}</td></tr>`).join('');
  const featRows = p.features.map((f) => `<tr><td>${f.feature_type}</td><td class="num">${num(f.size_sqft)}</td></tr>`).join('');
  const saleRows = p.sales.map((s) => `
    <tr><td>${s.sale_date ?? '—'}</td><td class="num">${money(s.sale_price)}</td><td>${s.seller_name ?? '—'}</td></tr>`).join('');

  document.getElementById('drawerContent').innerHTML = `
    <h3>${p.address}</h3>
    <p class="addr-sub">${p.owner ?? ''} &middot; ${p.legal.mls_area ?? ''} &middot; APN ${p.legal.apn ?? '—'}</p>
    <div class="detail-grid">
      <div><div class="k">Beds / Baths</div><div class="v">${p.beds} / ${bathLabel(p.full_baths, p.half_baths)}</div></div>
      <div><div class="k">Living sq ft</div><div class="v">${num(p.living_sqft)}</div></div>
      <div><div class="k">Lot sq ft</div><div class="v">${num(p.lot_sqft)}</div></div>
      <div><div class="k">Year built</div><div class="v">${p.legal.year_built ?? '—'}</div></div>
      <div><div class="k">Market value '25</div><div class="v">${money(p.market_value_2025)}</div></div>
      <div><div class="k">RealAVM</div><div class="v">${money(p.realavm)}</div></div>
      <div><div class="k">RealAVM range</div><div class="v">${money(p.realavm_low)} – ${money(p.realavm_high)}</div></div>
      <div><div class="k">List price</div><div class="v">${money(p.list_price)}</div></div>
    </div>
    <div><div class="k">Legal description</div><div class="v" style="font-weight:400">${p.legal.legal_description ?? '—'}</div></div>

    <h4>Valuation history</h4>
    <table class="mini"><thead><tr><th>Year</th><th class="num">Market</th><th class="num">Tax</th><th class="num">RealAVM</th></tr></thead><tbody>${valRows}</tbody></table>

    <h4>Features</h4>
    <table class="mini"><thead><tr><th>Type</th><th class="num">Sq Ft</th></tr></thead><tbody>${featRows}</tbody></table>

    <h4>Sale history</h4>
    <table class="mini"><thead><tr><th>Date</th><th class="num">Price</th><th>Seller</th></tr></thead><tbody>${saleRows}</tbody></table>

    <h4>Listing description</h4>
    <div class="desc-tools">
      <select id="toneSel" aria-label="Description tone">
        <option value="mls">MLS public remarks</option>
        <option value="retail">Retail / homebuyer</option>
        <option value="investor">Investor</option>
      </select>
      <button id="genBtn" class="primary" data-id="${p.property_id}">Generate</button>
      <button id="copyBtn">Copy</button>
      <span id="copyMsg"></span>
    </div>
    <div id="descBox" class="desc-box">Choose a tone and click Generate.</div>
  `;
  document.getElementById('drawer').hidden = false;

  const descBox = document.getElementById('descBox');
  document.getElementById('genBtn').addEventListener('click', async () => {
    const tone = document.getElementById('toneSel').value;
    descBox.textContent = 'Generating…';
    try {
      const d = await getJSON(`/api/description/${id}?tone=${tone}`);
      descBox.textContent = d.text;
    } catch (e) { descBox.textContent = 'Error: ' + e.message; }
  });
  document.getElementById('copyBtn').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(descBox.textContent);
      const m = document.getElementById('copyMsg');
      m.textContent = 'Copied!'; m.className = 'copied';
      setTimeout(() => { m.textContent = ''; }, 1800);
    } catch { /* clipboard may be blocked on non-https; ignore */ }
  });
}

// ---- query box ----
async function runQuery() {
  const sql = document.getElementById('sql').value;
  const msg = document.getElementById('queryMsg');
  msg.textContent = 'Running…'; msg.className = 'msg';
  try {
    const r = await fetch('/api/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sql }),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error);
    const thead = document.querySelector('#queryTable thead');
    const tbody = document.querySelector('#queryTable tbody');
    thead.innerHTML = '<tr>' + data.columns.map((c) => {
      const cls = MONEY_KEYS.has(c) || /price|value|tax|avm|total|sqft/i.test(c) ? ' class="num"' : '';
      return `<th${cls}>${c}</th>`;
    }).join('') + '</tr>';
    tbody.innerHTML = data.rows.map((row) => '<tr>' + data.columns.map((c) => {
      const isMoney = MONEY_KEYS.has(c) || /price|value|tax|avm|total/i.test(c);
      const cls = (isMoney || /sqft|beds|baths|year|count|homes/i.test(c)) ? ' class="num"' : '';
      const val = isMoney ? money(row[c]) : (row[c] ?? '—');
      return `<td${cls}>${val}</td>`;
    }).join('') + '</tr>').join('');
    msg.textContent = `${data.rows.length} row(s)`;
  } catch (e) {
    msg.textContent = e.message; msg.className = 'msg error';
    document.querySelector('#queryTable thead').innerHTML = '';
    document.querySelector('#queryTable tbody').innerHTML = '';
  }
}

// ---- investment analysis ----
const pct = (n) => (n === null || n === undefined) ? '—' : Number(n).toFixed(2) + '%';
let analysisLoaded = false;
let anRows = [];
let anSortKey = 'cash_on_cash_pct';
let anSortDir = -1;

async function loadAnalysis() {
  // portfolio KPIs + sensitivity
  const port = await getJSON('/api/analysis/portfolio');
  const r = port.rollup;
  const kpis = [
    ['Total NOI', money(r.total_noi)],
    ['Blended cap (basis)', pct(r.blended_cap_on_purchase)],
    ['Blended cap (value)', pct(r.blended_cap_on_value)],
    ['Annual cash flow', money(r.total_annual_cash_flow)],
    ['Cash invested', money(r.total_cash_invested)],
    ['Portfolio CoC', pct(r.portfolio_cash_on_cash)],
    ['Portfolio DSCR', Number(r.portfolio_dscr).toFixed(2)],
  ];
  document.getElementById('anKpis').innerHTML = kpis.map(([l, v]) =>
    `<div class="card"><div class="label">${l}</div><div class="value">${v}</div></div>`).join('');

  // discount sensitivity table
  const dt = document.getElementById('discTable');
  dt.querySelector('thead').innerHTML = '<tr><th>Discount</th><th class="num">Package price</th><th class="num">Cap rate</th></tr>';
  dt.querySelector('tbody').innerHTML = port.discount_sensitivity.map((d) =>
    `<tr><td>${d.discount_pct}%</td><td class="num">${money(d.package_price)}</td><td class="num">${pct(d.cap_rate)}</td></tr>`).join('');

  // cap target pricing table
  const ct = document.getElementById('capTable');
  ct.querySelector('thead').innerHTML = '<tr><th>Target cap</th><th class="num">Implied package price</th></tr>';
  ct.querySelector('tbody').innerHTML = port.cap_target_pricing.map((c) =>
    `<tr><td>${c.target_cap_pct}%</td><td class="num">${money(c.implied_price)}</td></tr>`).join('');

  // per-property table
  anRows = await getJSON('/api/analysis');
  renderAnalysisTable();
  analysisLoaded = true;
}

function renderAnalysisTable() {
  const rows = [...anRows].sort((a, b) => {
    const av = a[anSortKey], bv = b[anSortKey];
    if (typeof av === 'number') return (av - bv) * anSortDir;
    return String(av).localeCompare(String(bv)) * anSortDir;
  });
  const signed = (n) => {
    const cls = n > 0 ? 'pos' : (n < 0 ? 'neg' : '');
    return `<td class="num ${cls}">${money(n)}</td>`;
  };
  const signedPct = (n) => {
    const cls = n > 0 ? 'pos' : (n < 0 ? 'neg' : '');
    return `<td class="num ${cls}">${pct(n)}</td>`;
  };
  document.querySelector('#anTable tbody').innerHTML = rows.map((a) => `
    <tr data-id="${a.property_id}">
      <td>${a.address}</td>
      <td class="num">${money(a.purchase_price)}</td>
      <td class="num">${money(a.current_value)}</td>
      <td class="num">${money(a.monthly_rent)}</td>
      <td class="num">${money(a.noi)}</td>
      <td class="num">${pct(a.cap_rate_on_purchase)}</td>
      <td class="num">${pct(a.cap_rate_on_value)}</td>
      <td class="num">${Number(a.grm).toFixed(1)}</td>
      ${signed(a.annual_cash_flow)}
      ${signedPct(a.cash_on_cash_pct)}
      <td class="num">${Number(a.dscr).toFixed(2)}</td>
    </tr>`).join('');
  document.querySelectorAll('#anTable th').forEach((th) => {
    th.setAttribute('aria-sort', th.dataset.key === anSortKey ? (anSortDir === 1 ? 'ascending' : 'descending') : 'none');
  });
}

async function openProforma(id) {
  const a = await getJSON('/api/analysis/' + id);
  const line = (label, val, cls = '') => `<tr class="${cls}"><td>${label}</td><td>${val}</td></tr>`;
  document.getElementById('drawerContent').innerHTML = `
    <h3>${a.address}</h3>
    <p class="addr-sub">Pro-forma (annual) &middot; purchase basis ${money(a.purchase_price)} &middot; value ${money(a.current_value)}</p>
    <table class="proforma">
      ${line('Gross scheduled rent', money(a.gross_rent))}
      ${line('Effective gross income (after vacancy)', money(a.effective_gross_income))}
      ${line('Operating expenses', '(' + money(a.operating_expenses) + ')')}
      ${line('Net operating income (NOI)', money(a.noi), 'total')}
      ${line('Annual debt service', '(' + money(a.annual_debt_service) + ')')}
      ${line('Annual cash flow', money(a.annual_cash_flow), 'total')}
    </table>
    <h4>Returns</h4>
    <table class="proforma">
      ${line('Cap rate on purchase basis', pct(a.cap_rate_on_purchase))}
      ${line('Cap rate on current value', pct(a.cap_rate_on_value))}
      ${line('Gross rent multiplier (GRM)', Number(a.grm).toFixed(1))}
      ${line('Operating expense ratio', pct(a.opex_ratio_pct))}
      ${line('Cash-on-cash return', pct(a.cash_on_cash_pct))}
      ${line('DSCR', Number(a.dscr).toFixed(2))}
    </table>
    <h4>Capital required</h4>
    <table class="proforma">
      ${line('Down payment (' + a.assumptions.down_pct + '%)', money(a.down_payment))}
      ${line('Closing costs (' + a.assumptions.closing_pct + '%)', money(a.closing_costs))}
      ${line('Total cash invested', money(a.total_cash_invested), 'total')}
      ${line('Loan amount', money(a.loan_amount))}
      ${line('Monthly debt service', money(a.monthly_debt_service))}
    </table>
    <p class="hint" style="margin-top:14px">Rent is a modeled estimate (${money(a.monthly_rent)}/mo). Financing at ${a.assumptions.interest_rate_pct}% over ${a.assumptions.amort_years} yrs. Adjust assumptions in db/analysis.sql for real figures.</p>
  `;
  document.getElementById('drawer').hidden = false;
}

// ---- descriptions tab ----
let allDescriptions = [];

async function loadDescriptionsTab() {
  // Load all descriptions for the table
  try {
    allDescriptions = await getJSON('/api/descriptions');
    renderDescriptionsTable();
  } catch (e) { console.error('Error loading descriptions:', e); }

  // Populate property selector
  const sel = document.getElementById('descPropSel');
  if (sel.querySelectorAll('option').length <= 1) {
    // Populate from allProps
    allProps.forEach((p) => {
      const opt = document.createElement('option');
      opt.value = p.property_id;
      opt.textContent = p.address;
      sel.appendChild(opt);
    });
  }
}

function renderDescriptionsTable() {
  const tbody = document.querySelector('#descTable tbody');
  tbody.innerHTML = allDescriptions.map((d) => `
    <tr data-id="${d.property_id}">
      <td>${d.address}</td>
      <td style="font-size: 0.85rem; max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${d.mls_description.substring(0, 80)}…</td>
      <td style="font-size: 0.85rem; max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${d.retail_description.substring(0, 80)}…</td>
      <td style="font-size: 0.85rem; max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${d.investor_description.substring(0, 80)}…</td>
    </tr>`).join('');
  document.querySelector('#descTable tbody').addEventListener('click', (e) => {
    const tr = e.target.closest('tr[data-id]');
    if (tr) {
      const id = Number(tr.dataset.id);
      document.getElementById('descPropSel').value = id;
      showDescriptionView(id);
    }
  });
}

async function showDescriptionView(id) {
  const desc = allDescriptions.find((d) => d.property_id === id);
  if (!desc) return;
  
  document.getElementById('descViewPanel').hidden = false;
  document.getElementById('descEditPanel').hidden = true;
  
  const tone = document.getElementById('descToneSel').value || 'mls';
  displayDescriptionByTone(desc, tone);
}

function displayDescriptionByTone(desc, tone) {
  const box = document.getElementById('descDisplayBox');
  const key = tone + '_description';
  box.textContent = desc[key] || '';
}

async function showDescriptionEdit(id) {
  const desc = allDescriptions.find((d) => d.property_id === id);
  if (!desc) return;
  
  document.getElementById('descViewPanel').hidden = true;
  document.getElementById('descEditPanel').hidden = false;
  
  document.getElementById('descMls').value = desc.mls_description;
  document.getElementById('descRetail').value = desc.retail_description;
  document.getElementById('descInvestor').value = desc.investor_description;
}

function switchTab(name) {
  document.querySelectorAll('.tab').forEach((t) => t.classList.toggle('active', t.dataset.tab === name));
  document.getElementById('tab-overview').hidden = name !== 'overview';
  document.getElementById('tab-descriptions').hidden = name !== 'descriptions';
  document.getElementById('tab-analysis').hidden = name !== 'analysis';
  document.getElementById('tab-contact').hidden = name !== 'contact';
  if (name === 'analysis' && !analysisLoaded) loadAnalysis().catch((e) => console.error(e));
  if (name === 'descriptions') loadDescriptionsTab().catch((e) => console.error(e));
}

// ---- wire up ----
document.addEventListener('DOMContentLoaded', () => {
  loadRollup();
  loadProps();

  document.querySelectorAll('.tab').forEach((t) => t.addEventListener('click', () => switchTab(t.dataset.tab)));

  document.querySelectorAll('#anTable th').forEach((th) => {
    th.addEventListener('click', () => {
      const key = th.dataset.key;
      if (key === anSortKey) anSortDir *= -1; else { anSortKey = key; anSortDir = 1; }
      renderAnalysisTable();
    });
  });
  document.querySelector('#anTable tbody').addEventListener('click', (e) => {
    const tr = e.target.closest('tr[data-id]');
    if (tr) openProforma(Number(tr.dataset.id));
  });

  document.getElementById('filter').addEventListener('input', renderTable);

  document.querySelectorAll('#propTable th').forEach((th) => {
    th.addEventListener('click', () => {
      const key = th.dataset.key;
      if (key === sortKey) sortDir *= -1; else { sortKey = key; sortDir = 1; }
      renderTable();
    });
  });

  document.querySelector('#propTable tbody').addEventListener('click', (e) => {
    const tr = e.target.closest('tr[data-id]');
    if (tr) openDetail(Number(tr.dataset.id));
  });

  document.getElementById('drawerClose').addEventListener('click', () => { document.getElementById('drawer').hidden = true; });
  document.getElementById('drawer').addEventListener('click', (e) => { if (e.target.id === 'drawer') e.currentTarget.hidden = true; });

  // package description
  const pkgBox = document.getElementById('pkgBox');
  async function genPackage() {
    const tone = document.getElementById('pkgTone').value;
    pkgBox.hidden = false; pkgBox.textContent = 'Generating…';
    try {
      const d = await getJSON('/api/description/package?tone=' + tone);
      pkgBox.textContent = d.text;
    } catch (e) { pkgBox.textContent = 'Error: ' + e.message; }
  }
  document.getElementById('pkgBtn').addEventListener('click', genPackage);
  document.getElementById('pkgTone').addEventListener('change', () => { if (!pkgBox.hidden) genPackage(); });
  document.getElementById('pkgCopy').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(pkgBox.textContent);
      const m = document.getElementById('pkgCopyMsg');
      m.textContent = 'Copied!'; m.className = 'copied';
      setTimeout(() => { m.textContent = ''; }, 1800);
    } catch { /* ignore */ }
  });

  document.getElementById('runBtn').addEventListener('click', runQuery);
  document.querySelectorAll('.chip').forEach((c) => c.addEventListener('click', () => {
    document.getElementById('sql').value = c.dataset.sql;
    runQuery();
  }));

  // ---- descriptions tab events ----
  document.getElementById('descPropSel').addEventListener('change', (e) => {
    const id = Number(e.target.value);
    if (id) showDescriptionView(id);
  });

  document.getElementById('descToneSel').addEventListener('change', (e) => {
    const id = Number(document.getElementById('descPropSel').value);
    if (id) {
      const desc = allDescriptions.find((d) => d.property_id === id);
      if (desc) displayDescriptionByTone(desc, e.target.value);
    }
  });

  document.getElementById('descViewBtn').addEventListener('click', () => {
    const id = Number(document.getElementById('descPropSel').value);
    if (id) showDescriptionView(id);
  });

  document.getElementById('descEditBtn').addEventListener('click', () => {
    const id = Number(document.getElementById('descPropSel').value);
    if (id) showDescriptionEdit(id);
  });

  document.getElementById('descCopyBtn').addEventListener('click', async () => {
    const box = document.getElementById('descDisplayBox');
    try {
      await navigator.clipboard.writeText(box.textContent);
      const m = document.getElementById('descCopyMsg');
      m.textContent = 'Copied!'; m.className = 'copied';
      setTimeout(() => { m.textContent = ''; }, 1800);
    } catch { /* ignore */ }
  });

  document.getElementById('descBackToEditBtn').addEventListener('click', () => {
    const id = Number(document.getElementById('descPropSel').value);
    if (id) showDescriptionEdit(id);
  });

  document.getElementById('descSaveBtn').addEventListener('click', async () => {
    const id = Number(document.getElementById('descPropSel').value);
    const msg = document.getElementById('descSaveMsg');
    msg.textContent = 'Saving…'; msg.className = '';
    try {
      const payload = {
        mls_description: document.getElementById('descMls').value,
        retail_description: document.getElementById('descRetail').value,
        investor_description: document.getElementById('descInvestor').value,
      };
      const r = await fetch(`/api/descriptions/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      msg.textContent = 'Saved!'; msg.className = 'copied';
      
      // Reload descriptions
      allDescriptions = await getJSON('/api/descriptions');
      renderDescriptionsTable();
      
      setTimeout(() => {
        showDescriptionView(id);
        msg.textContent = '';
      }, 1200);
    } catch (e) {
      msg.textContent = 'Error: ' + e.message; msg.className = 'error';
    }
  });

  document.getElementById('descCancelBtn').addEventListener('click', () => {
    const id = Number(document.getElementById('descPropSel').value);
    if (id) showDescriptionView(id);
  });
});
