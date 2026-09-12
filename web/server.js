// ============================================================
// ARS Portfolio - local web frontend
// Dependency-free: uses Node built-in http + node:sqlite (Node >= 22).
// Run:  node web/server.js      then open http://localhost:4321
// ============================================================

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const PORT = process.env.PORT || 4321;
const DB_PATH = path.join(__dirname, '..', 'db', 'ars.db');
const PUBLIC_DIR = path.join(__dirname, 'public');

if (!fs.existsSync(DB_PATH)) {
  console.error(`Database not found at ${DB_PATH}. Build it first:\n` +
    `  npm run db:build`);
  process.exit(1);
}

// ---- DB access via sqlite3 CLI ----
function runSql(sql, readonly = true) {
  const args = readonly ? ['-readonly', '-json', DB_PATH, sql] : ['-json', DB_PATH, sql];
  const r = spawnSync('sqlite3', args, {
    encoding: 'utf8', maxBuffer: 10 * 1024 * 1024,
  });
  if (r.status !== 0) {
    const msg = (r.stderr || 'sqlite3 error').trim();
    const err = new Error(msg);
    err.sqlite = true;
    throw err;
  }
  const out = (r.stdout || '').trim();
  return out ? JSON.parse(out) : [];
}

function sqlNum(v) {
  const n = Number(v);
  if (!Number.isInteger(n)) throw new Error('invalid numeric parameter');
  return String(n);
}

const db = {
  all: (sql) => runSql(sql),
  get: (sql) => { const rows = runSql(sql); return rows[0]; },
};

// ---- helpers ----
function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
};

function serveStatic(res, urlPath) {
  const rel = urlPath === '/' ? '/index.html' : urlPath;
  const filePath = path.normalize(path.join(PUBLIC_DIR, rel));
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403); res.end('Forbidden'); return;
  }
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream' });
    res.end(data);
  });
}

function isSafeSelect(sql) {
  const trimmed = sql.trim().replace(/;+\s*$/, '');
  if (/;/.test(trimmed)) return false;
  if (!/^(select|with)\b/i.test(trimmed)) return false;
  if (/\b(insert|update|delete|drop|alter|create|attach|detach|replace|pragma|vacuum|reindex)\b/i.test(trimmed)) return false;
  return true;
}

// ---- routes ----
const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  try {
    if (pathname === '/api/rollup') {
      return sendJson(res, 200, db.get('SELECT * FROM v_portfolio_rollup'));
    }

    if (pathname === '/api/properties') {
      const rows = db.all('SELECT * FROM v_property_overview ORDER BY property_id');
      return sendJson(res, 200, rows);
    }

    if (pathname.startsWith('/api/property/')) {
      const rawId = Number(pathname.split('/').pop());
      if (!Number.isInteger(rawId)) return sendJson(res, 400, { error: 'invalid id' });
      const id = sqlNum(rawId);
      const property = db.get(`SELECT * FROM v_property_overview WHERE property_id = ${id}`);
      if (!property) return sendJson(res, 404, { error: 'not found' });
      property.legal = db.get(`SELECT legal_description, apn, mls_area, year_built FROM properties WHERE property_id = ${id}`);
      property.valuations = db.all(`SELECT year, assessed_total, market_total, total_tax, realavm, realavm_low, realavm_high FROM valuations WHERE property_id = ${id} ORDER BY year`);
      property.features = db.all(`SELECT feature_type, size_sqft FROM features WHERE property_id = ${id}`);
      property.sales = db.all(`SELECT sale_date, sale_price, buyer_name, seller_name, deed_type FROM sale_history WHERE property_id = ${id} ORDER BY sale_date DESC`);
      return sendJson(res, 200, property);
    }

    if (pathname === '/api/descriptions') {
      const rows = db.all(`
        SELECT p.property_id, p.address, d.mls_description, d.retail_description, d.investor_description
        FROM properties p
        JOIN descriptions d ON p.property_id = d.property_id
        ORDER BY p.address
      `);
      return sendJson(res, 200, rows);
    }

    if (pathname.startsWith('/api/descriptions/') && req.method === 'GET') {
      const id = Number(pathname.split('/').pop());
      if (!Number.isInteger(id)) return sendJson(res, 400, { error: 'invalid id' });
      const pid = sqlNum(id);
      const row = db.get(`SELECT property_id, mls_description, retail_description, investor_description FROM descriptions WHERE property_id = ${pid}`);
      if (!row) return sendJson(res, 404, { error: 'not found' });
      return sendJson(res, 200, row);
    }

    if (pathname.startsWith('/api/descriptions/') && req.method === 'POST') {
      const id = Number(pathname.split('/').pop());
      if (!Number.isInteger(id)) return sendJson(res, 400, { error: 'invalid id' });
      const pid = sqlNum(id);
      let body = '';
      req.on('data', (c) => { body += c; if (body.length > 100000) req.destroy(); });
      req.on('end', () => {
        try {
          const data = JSON.parse(body);
          const mls = (data.mls_description || '').toString();
          const retail = (data.retail_description || '').toString();
          const investor = (data.investor_description || '').toString();
          if (!mls || !retail || !investor) return sendJson(res, 400, { error: 'all three descriptions required' });
          
          const esc = (s) => String(s).replace(/'/g, "''");
          const updateSql = `
            UPDATE descriptions 
            SET mls_description = '${esc(mls)}',
                retail_description = '${esc(retail)}',
                investor_description = '${esc(investor)}'
            WHERE property_id = ${pid}
          `;
          runSql(updateSql, false);
          return sendJson(res, 200, { success: true, message: 'Descriptions updated' });
        } catch (e) {
          return sendJson(res, 400, { error: e.message });
        }
      });
      return;
    }

    if (pathname === '/api/properties-map') {
      const rows = db.all(`
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

    if (pathname === '/api/analysis') {
      return sendJson(res, 200, db.all('SELECT * FROM v_investment_analysis ORDER BY property_id'));
    }

    if (pathname === '/api/analysis/portfolio') {
      const roll = db.get('SELECT * FROM v_investment_portfolio');
      const totalValue = roll.total_current_value;
      const totalNoi = roll.total_noi;
      const discountRows = [0, 5, 10, 15, 20].map((d) => {
        const price = totalValue * (1 - d / 100);
        return { discount_pct: d, package_price: Math.round(price), cap_rate: +(100 * totalNoi / price).toFixed(2) };
      });
      const capTargetRows = [5, 6, 7, 8].map((c) => ({
        target_cap_pct: c, implied_price: Math.round(totalNoi / (c / 100)),
      }));
      return sendJson(res, 200, { rollup: roll, discount_sensitivity: discountRows, cap_target_pricing: capTargetRows });
    }

    if (pathname.startsWith('/api/analysis/')) {
      const rawId = Number(pathname.split('/').pop());
      if (!Number.isInteger(rawId)) return sendJson(res, 400, { error: 'invalid id' });
      const id = sqlNum(rawId);
      const row = db.get(`SELECT * FROM v_investment_analysis WHERE property_id = ${id}`);
      if (!row) return sendJson(res, 404, { error: 'not found' });
      row.assumptions = db.get(`SELECT * FROM analysis_assumptions WHERE property_id = ${id}`);
      return sendJson(res, 200, row);
    }

    if (pathname === '/api/query' && req.method === 'POST') {
      let body = '';
      req.on('data', (c) => { body += c; if (body.length > 10000) req.destroy(); });
      req.on('end', () => {
        let sql = '';
        try { sql = (JSON.parse(body).sql || '').toString(); } catch { return sendJson(res, 400, { error: 'bad JSON' }); }
        if (!isSafeSelect(sql)) return sendJson(res, 400, { error: 'Only a single read-only SELECT/WITH query is allowed.' });
        try {
          const rows = db.all(sql);
          const columns = rows.length ? Object.keys(rows[0]) : [];
          return sendJson(res, 200, { columns, rows });
        } catch (e) {
          return sendJson(res, 400, { error: e.message });
        }
      });
      return;
    }

    if (pathname.startsWith('/api/')) {
      return sendJson(res, 404, { error: 'unknown endpoint' });
    }

    return serveStatic(res, pathname);
  } catch (e) {
    return sendJson(res, 500, { error: e.message });
  }
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use — the app may already be running at http://localhost:${PORT}.`);
    console.error(`To use a different port:  PORT=4322 npm start`);
    process.exit(1);
  }
  throw err;
});

server.listen(PORT, () => {
  console.log(`ARS portfolio frontend running at http://localhost:${PORT}`);
});
