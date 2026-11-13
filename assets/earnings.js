/* CARVING DEZINE: Earnings import helper.
   Turns the rows of Projects.xlsx into clean records. Contains NO data of yours, only rules.
   Rules (agreed with the owner):
   - Nothing is converted between currencies. Each amount keeps the currency it was recorded in.
   - 2024 and later: exact INR receipts come from the yearly sheets (2024, 2025, 2026 ...).
   - Before 2024: amounts come from the main "Projects" sheet, per currency, as recorded.
   - Client emails, transaction IDs, websites and app links are never imported. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.CDEarn = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  var CUT = 2024; // first year whose money comes from the yearly INR sheets

  function txt(v) { return v == null ? '' : String(v).trim(); }
  /* private data stays out: an email typed into a name cell is reduced to the part before the @ */
  function safe(v) { return txt(v).replace(/([A-Za-z0-9._%+-]+)@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, '$1'); }
  function isDate(v) { return Object.prototype.toString.call(v) === '[object Date]' && !isNaN(v); }
  function num(s) { return Number(String(s).replace(/,/g, '')); }

  /* money cell -> {n, cur, raw, complex} ; n is null when there is no usable number */
  function money(v) {
    var raw = txt(v);
    if (typeof v === 'number') return { n: v, cur: null, raw: raw };
    if (!raw || /^(nil|cancelled|free|n\/a|-)$/i.test(raw)) return { n: null, cur: null, raw: raw };
    var cur = null;
    if (/₹|\brs\.?\s*\d|\binr\b/i.test(raw)) cur = 'INR';
    else if (/\$|\busd\b/i.test(raw)) cur = 'USD';
    else if (/\baud\b/i.test(raw)) cur = 'AUD';
    else if (/€|\beur\b/i.test(raw)) cur = 'EUR';
    else if (/£|\bgbp\b/i.test(raw)) cur = 'GBP';
    var cleaned = raw.replace(/₹|\$|€|£|\bUSD\b|\bINR\b|\bAUD\b|\bEUR\b|\bGBP\b|\bRs\.?/gi, '').trim();
    if (/^[\d,]+(\.\d+)?(\s*\+\s*[\d,]+(\.\d+)?)*$/.test(cleaned)) {
      var sum = 0; cleaned.split('+').forEach(function (p) { sum += num(p.trim()); });
      return { n: sum, cur: cur, raw: raw };
    }
    return { n: null, cur: cur, raw: raw, complex: true };
  }

  function yearOf(v) {
    var y = null;
    if (isDate(v)) y = v.getFullYear();
    else { var m = /(19|20)\d\d/.exec(txt(v)); y = m ? Number(m[0]) : null; }
    return (y != null && y >= 2000 && y <= new Date().getFullYear() + 1) ? y : null; /* typos like 2208 are treated as undated */
  }
  /* text dates are day-first in your sheet and shown as written; real date cells are ambiguous
     (day and month may have been swapped by Excel) so only the year is trusted for them */
  function label(v) {
    if (v == null || v === '') return '';
    if (isDate(v)) return String(v.getFullYear()) + ' (day/month unclear)';
    return txt(v);
  }
  function normName(s) { return txt(s).toLowerCase().replace(/[^a-z0-9]/g, ''); }

  function idx(header, name) {
    for (var i = 0; i < header.length; i++) if (txt(header[i]).replace(/:$/, '') === name) return i;
    return -1;
  }

  /* rows: array of arrays (first row = header) from the "Projects" sheet */
  function projects(rows) {
    var h = rows[0] || [], C = {};
    ['#', 'Status', 'Project Name', 'Scope of Work', 'Client Name', 'Client Country', 'Payment Received', 'Project Cost',
      'TDS Deduction', 'Payment Pending', 'Start Date', 'End Date', 'Mode of Payment', 'Payment Status', 'Project Source']
      .forEach(function (k) { C[k] = idx(h, k); });
    var out = [];
    for (var r = 1; r < rows.length; r++) {
      var row = rows[r]; if (!row) continue;
      var g = function (k) { return C[k] < 0 ? null : row[C[k]]; };
      var id = g('#'); if (id == null || id === '' || isNaN(Number(id))) continue;
      var country = txt(g('Client Country'));
      var recv = money(g('Payment Received')), cost = money(g('Project Cost')), tds = money(g('TDS Deduction')), pend = money(g('Payment Pending'));
      /* amount received: the Payment Received column when filled, else the older-sheet figure in the TDS Deduction column */
      var rec = recv.n != null ? recv : tds;
      var cur = rec.cur || cost.cur || null;
      /* no currency written: online platforms (PayPal, Escrow...) pay in dollars; Indian clients paying by cheque/NEFT/cash/UPI pay in rupees */
      var mode0 = txt(g('Mode of Payment'));
      if (!cur && rec.n != null) cur = (/paypal|escrow|moneybookers|payoneer|skrill|western/i.test(mode0) || !/^(india|mumbai)$/i.test(country)) ? 'USD' : 'INR';
      var status = txt(g('Status')), pay = txt(g('Payment Status')), year = yearOf(g('Start Date'));
      var paid = /^(paid|pad)$/i.test(pay);
      var legacy = recv.n == null && tds.n != null;
      var flag = '';
      if (legacy && pend.n != null && pend.n !== tds.n) flag = 'older sheet: TDS Deduction and Payment Pending columns differ';
      else if (recv.complex || cost.complex) flag = 'amount written as text; see raw columns';
      var counted = status !== 'Cancelled' && paid && rec.n != null && rec.n > 0 && (year == null || year < CUT);
      out.push({
        num: Number(id), status: status, name: safe(g('Project Name')), scope: safe(g('Scope of Work')), client: safe(g('Client Name')), country: safe(country),
        source: safe(g('Project Source')), start_label: label(g('Start Date')), start_year: year, end_label: label(g('End Date')),
        mode: safe(g('Mode of Payment')), pay_status: pay, currency: cur, received: rec.n, cost: cost.n,
        recv_raw: recv.raw, cost_raw: cost.raw, tds_raw: tds.raw, pend_raw: pend.raw, counted: counted, flag: flag
      });
    }
    return out;
  }

  /* yearly sheets: { '2024': rows, '2025': rows ... } each with header Project Name | Money Received (INR) | Payment Dates */
  function payments(sheets, projs) {
    var byName = {};
    projs.slice().sort(function (a, b) { return a.num - b.num; }).forEach(function (p) { byName[normName(p.name)] = p; });
    var keys = Object.keys(byName);
    function match(name) {
      var n = normName(name); if (!n) return null;
      if (byName[n]) return byName[n];
      for (var i = keys.length - 1; i >= 0; i--) {
        var k = keys[i];
        if (k.length >= 5 && n.length >= 5 && (k.indexOf(n) === 0 || n.indexOf(k) === 0)) return byName[k];
      }
      return null;
    }
    var out = [], declared = {}, skipped = [];
    Object.keys(sheets).sort().forEach(function (yr) {
      var rows = sheets[yr], last = '';
      for (var r = 1; r < rows.length; r++) {
        var row = rows[r] || [], nm = txt(row[0]);
        if (/^total$/i.test(nm)) { var d = money(row[1]); if (d.n != null) declared[yr] = d.n; continue; }
        if (nm) last = nm; else if (row[1] == null || row[1] === '') continue;
        var amt = money(row[1]);
        if (amt.n == null) { if (txt(row[1]) || nm) skipped.push({ year: Number(yr), project: safe(nm || last), raw: txt(row[1]) }); continue; }
        var m = match(nm || last);
        out.push({ year: Number(yr), project: safe(nm || last), client: m ? m.client : '', amount_inr: amt.n, date_label: label(row[2]), matched: !!m });
      }
    });
    return { payments: out, declared: declared, skipped: skipped };
  }

  /* wb = { sheets: { name: rows[][] } } */
  function normalize(wb) {
    var s = wb.sheets, names = Object.keys(s);
    var pName = names.filter(function (n) { return /^projects$/i.test(n.trim()); })[0];
    if (!pName) throw new Error('No sheet named "Projects" found.');
    var ys = {}; names.forEach(function (n) { if (/^(19|20)\d\d$/.test(n.trim())) ys[n.trim()] = s[n]; });
    var projs = projects(s[pName]);
    var pay = payments(ys, projs);
    var sums = {}; pay.payments.forEach(function (p) { sums[p.year] = Math.round(((sums[p.year] || 0) + p.amount_inr) * 100) / 100; });
    return { projects: projs, payments: pay.payments, meta: { declared: pay.declared, sums: sums, skipped: pay.skipped, cut: CUT } };
  }
  return { normalize: normalize, money: money, CUT: CUT };
});
