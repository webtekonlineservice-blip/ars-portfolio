// ============================================================
// ARS Portfolio API — single catch-all serverless function.
// Handles every /api/* route. Uses the shared WASM SQLite helper
// (lib/db.js) so it runs on Vercel without a native sqlite3 binary.
// ============================================================

const db = require('../lib/db');
const { generateDescription, bathLabel } = require('../lib/descriptions');

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

async function loadPropertyForDesc(id) {
  const pid = db.sqlNum(id);
  const p = await db.get(`SELECT * FROM v_property_overview WHERE property_id = ${pid}`);
  if (!p) return null;
  p.core = await db.get(`SELECT * FROM properties WHERE property_id = ${pid}`);
  p.features = await db.all(`SELECT feature_type, size_sqft FROM features WHERE property_id = ${pid}`);
  return p;
}

async function readBody(req) {
  if (req.body) {
    return typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  }
  return await new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (c) => { data += c; if (data.length > 10000) req.destroy(); });
    req.on('end', () => { try { resolve(data ? JSON.parse(data) : {}); } catch (e) { reject(e); } });
    req.on('error', reject);
  });
}

module.exports = async (req, res) => {
  // Normalize the path (strip query string). On Vercel the function receives
  // the original /api/... path.
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname.replace(/\/+$/, '') || '/';
  const parts = pathname.split('/').filter(Boolean); // e.g. ['api','analysis','portfolio']

  try {
    // /api/rollup
    if (pathname === '/api/rollup') {
      return sendJson(res, 200, await db.get('SELECT * FROM v_portfolio_rollup'));
    }

    // /api/properties
    if (pathname === '/api/properties') {
      return sendJson(res, 200, await db.all('SELECT * FROM v_property_overview ORDER BY property_id'));
    }

    // /api/property/:id
    if (parts[1] === 'property' && parts[2]) {
      const id = db.sqlNum(parts[2]);
      const property = await db.get(`SELECT * FROM v_property_overview WHERE property_id = ${id}`);
      if (!property) return sendJson(res, 404, { error: 'not found' });
      property.legal = await db.get(`SELECT legal_description, apn, mls_area, year_built FROM properties WHERE property_id = ${id}`);
      property.valuations = await db.all(`SELECT year, assessed_total, market_total, total_tax, realavm, realavm_low, realavm_high FROM valuations WHERE property_id = ${id} ORDER BY year`);
      property.features = await db.all(`SELECT feature_type, size_sqft FROM features WHERE property_id = ${id}`);
      property.sales = await db.all(`SELECT sale_date, sale_price, buyer_name, seller_name, deed_type FROM sale_history WHERE property_id = ${id} ORDER BY sale_date DESC`);
      return sendJson(res, 200, property);
    }

    // /api/properties-map
    if (pathname === '/api/properties-map') {
      const rows = await db.all(`
        SELECT 
          p.property_id,
          p.address,
          p.beds,
          p.full_baths,
          p.half_baths,
          p.living_sqft,
          v.market_total as market_value_2025,
          v.realavm,
          COALESCE(pc.latitude, 38.5200) as latitude,
          COALESCE(pc.longitude, -90.2850) as longitude
        FROM properties p
        LEFT JOIN valuations v ON p.property_id = v.property_id AND v.year = 2025
        LEFT JOIN property_coordinates pc ON p.property_id = pc.property_id
        ORDER BY p.property_id
      `);
      return sendJson(res, 200, rows);
    }

    // /api/analysis, /api/analysis/portfolio, /api/analysis/:id
    if (parts[1] === 'analysis') {
      if (!parts[2]) {
        return sendJson(res, 200, await db.all('SELECT * FROM v_investment_analysis ORDER BY property_id'));
      }
      if (parts[2] === 'portfolio') {
        const roll = await db.get('SELECT * FROM v_investment_portfolio');
        const totalValue = roll.total_current_value;
        const totalNoi = roll.total_noi;
        const discount_sensitivity = [0, 5, 10, 15, 20].map((d) => {
          const price = totalValue * (1 - d / 100);
          return { discount_pct: d, package_price: Math.round(price), cap_rate: +(100 * totalNoi / price).toFixed(2) };
        });
        const cap_target_pricing = [5, 6, 7, 8].map((c) => ({
          target_cap_pct: c, implied_price: Math.round(totalNoi / (c / 100)),
        }));
        return sendJson(res, 200, { rollup: roll, discount_sensitivity, cap_target_pricing });
      }
      const id = db.sqlNum(parts[2]);
      const row = await db.get(`SELECT * FROM v_investment_analysis WHERE property_id = ${id}`);
      if (!row) return sendJson(res, 404, { error: 'not found' });
      row.assumptions = await db.get(`SELECT * FROM analysis_assumptions WHERE property_id = ${id}`);
      return sendJson(res, 200, row);
    }

    // /api/descriptions  (GET all, POST to update)
    if (pathname === '/api/descriptions' && req.method === 'GET') {
      const rows = await db.all(`
        SELECT p.property_id, p.address, d.mls_description, d.retail_description, d.investor_description
        FROM properties p
        JOIN descriptions d ON p.property_id = d.property_id
        ORDER BY p.address
      `);
      return sendJson(res, 200, rows);
    }

    // /api/descriptions/:id  (GET one)
    if (parts[1] === 'descriptions' && parts[2] && req.method === 'GET') {
      const id = db.sqlNum(parts[2]);
      const row = await db.get(`SELECT property_id, mls_description, retail_description, investor_description FROM descriptions WHERE property_id = ${id}`);
      if (!row) return sendJson(res, 404, { error: 'not found' });
      return sendJson(res, 200, row);
    }

    // /api/description/:id?tone=  and  /api/description/package?tone=
    if (parts[1] === 'description' && parts[2]) {
      const tone = (url.searchParams.get('tone') || 'mls').toLowerCase();
      if (parts[2] === 'package') {
        const r = await db.get('SELECT * FROM v_portfolio_rollup');
        const props = await db.all('SELECT address, beds, full_baths, half_baths FROM v_property_overview ORDER BY property_id');
        const list = props.map((p) => `${p.address} (${p.beds}bd/${bathLabel(p.full_baths, p.half_baths)}ba)`).join('; ');
        const text = `8-property single-family rental portfolio in the Riverview Gardens area of St. Louis County, MO 63137. ` +
          `Combined ${r.total_beds} bedrooms across ${Number(r.total_living_sqft).toLocaleString('en-US')} sq ft of living space. ` +
          `Total CoreLogic estimated value approximately $${Number(r.total_realavm).toLocaleString('en-US')}; ` +
          `combined annual taxes approximately $${Number(r.total_annual_tax_2025).toLocaleString('en-US')}. ` +
          `Turnkey opportunity for a buy-and-hold investor. Homes may be purchased individually or as a package: ${list}. ` +
          `Buyer to verify all information. Sold as-is.`;
        return sendJson(res, 200, { tone, text });
      }
      const p = await loadPropertyForDesc(parts[2]);
      if (!p) return sendJson(res, 404, { error: 'not found' });
      return sendJson(res, 200, { tone, text: generateDescription(p, tone) });
    }

    // /api/query  (POST, read-only SELECT)
    if (pathname === '/api/query' && req.method === 'POST') {
      let body;
      try { body = await readBody(req); } catch { return sendJson(res, 400, { error: 'bad JSON' }); }
      const sql = (body.sql || '').toString();
      if (!db.isSafeSelect(sql)) return sendJson(res, 400, { error: 'Only a single read-only SELECT/WITH query is allowed.' });
      try {
        const rows = await db.all(sql);
        const columns = rows.length ? Object.keys(rows[0]) : [];
        return sendJson(res, 200, { columns, rows });
      } catch (e) {
        return sendJson(res, 400, { error: e.message });
      }
    }

    return sendJson(res, 404, { error: 'unknown endpoint' });
  } catch (e) {
    return sendJson(res, 500, { error: e.message });
  }
};
