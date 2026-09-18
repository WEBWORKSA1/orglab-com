/* OrgLab interactive tools. Each initializes only if its root element exists. */
(function () {
  "use strict";
  const D = window.OL_DATA || {}, OL = window.OL || {};
  const $ = (s, el = document) => el.querySelector(s), $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const esc = OL.esc || (s => s), BASE = OL.BASE || "";
  const money = n => "$" + Math.round(n).toLocaleString();
  const qs = new URLSearchParams(location.search);
  const setQS = obj => { const p = new URLSearchParams(location.search); Object.entries(obj).forEach(([k, v]) => v === "" || v == null ? p.delete(k) : p.set(k, v)); history.replaceState(null, "", "?" + p.toString()); };
  const RISK = { high: ["High", "pill-high", "Buy organic"], moderate: ["Moderate", "pill-mod", "Organic if budget allows"], low: ["Low", "pill-low", "Conventional is fine"] };

  /* ---------- 1. Residue quick-check (home + tool) ---------- */
  $$("[data-residue]").forEach(box => {
    const input = $("input", box), out = $(".qc-out, [data-out]", box), list = $("datalist", box);
    if (list) list.innerHTML = D.produce.map(p => `<option value="${esc(p[0])}">`).join("");
    const run = () => {
      const q = input.value.trim().toLowerCase();
      if (!q) { out.innerHTML = box.dataset.hint || ""; return; }
      const hits = D.produce.filter(p => p[0].toLowerCase().includes(q)).slice(0, 4);
      out.innerHTML = hits.length ? hits.map(p => { const r = RISK[p[1]]; return `<div style="margin-bottom:10px"><strong>${esc(p[0])}</strong> <span class="tag ${r[1]}">${r[0]} residue risk</span> <span class="tag">${r[2]}</span><br><small style="color:inherit;opacity:.85">${esc(p[2])}</small></div>`; }).join("")
        : `<small>Not in our index yet. <a href="${BASE}contact.html">Request it</a>.</small>`;
    };
    input.addEventListener("input", run); run();
  });

  /* Full residue table */
  const rt = $("#residue-table");
  if (rt) {
    const q = $("#residue-q"), f = $("#residue-f"), list = $("#shop-list"), picked = new Set(OL.store.get("ol-shop", []));
    const draw = () => {
      const term = q.value.toLowerCase(), lvl = f.value;
      const rows = D.produce.filter(p => (!term || p[0].toLowerCase().includes(term)) && (!lvl || p[1] === lvl));
      rt.innerHTML = rows.map(p => { const r = RISK[p[1]], id = p[0]; return `<tr><td><label class="check" style="margin:0"><input type="checkbox" data-pick="${esc(id)}" ${picked.has(id) ? "checked" : ""}> <b>${esc(id)}</b></label></td><td><span class="tag ${r[1]}">${r[0]}</span></td><td>${r[2]}</td><td><small>${esc(p[2])}</small></td></tr>`; }).join("");
      $$("[data-pick]", rt).forEach(c => c.addEventListener("change", () => { c.checked ? picked.add(c.dataset.pick) : picked.delete(c.dataset.pick); OL.store.set("ol-shop", [...picked]); drawList(); }));
      setQS({ q: q.value, level: lvl });
    };
    const drawList = () => {
      const items = [...picked];
      list.innerHTML = items.length ? items.map(i => { const p = D.produce.find(x => x[0] === i); return `<li><span>${esc(i)}</span><span class="tag ${RISK[p[1]][1]}">${RISK[p[1]][2]}</span></li>`; }).join("") : "<li class='muted'>Tick items in the table to build your list.</li>";
    };
    q.value = qs.get("q") || ""; f.value = qs.get("level") || "";
    q.addEventListener("input", draw); f.addEventListener("change", draw);
    $("#shop-clear").addEventListener("click", () => { picked.clear(); OL.store.set("ol-shop", []); draw(); drawList(); });
    draw(); drawList();
  }

  /* ---------- 2. Label decoder ---------- */
  const ld = $("#label-decoder");
  if (ld) {
    const grid = $("#label-grid"), a = $("#cmp-a"), b = $("#cmp-b"), out = $("#cmp-out");
    const opts = D.labels.map(l => `<option value="${l.id}">${esc(l.name)}</option>`).join("");
    a.innerHTML = opts; b.innerHTML = opts; a.value = qs.get("a") || "usda"; b.value = qs.get("b") || "natural";
    grid.innerHTML = D.labels.map(l => `<article class="card" data-item><div class="row" style="justify-content:space-between"><h3 style="margin:0;font-size:1.1rem">${esc(l.name)}</h3><span class="tag ${l.score >= 8 ? "pill-low" : l.score >= 5 ? "pill-mod" : "pill-high"}">Strictness ${l.score}/10</span></div><div class="bar" style="margin:12px 0"><i style="width:${l.score * 10}%"></i></div><p><b>Guarantees:</b> ${esc(l.covers)}</p><p><b>Blind spots:</b> ${esc(l.gaps)}</p><small>${esc(l.region)} · ${l.third ? "Third-party audited" : "Not independently audited"} · GMOs ${l.gmo ? "not excluded" : "excluded"}</small></article>`).join("");
    const cmp = () => {
      const A = D.labels.find(x => x.id === a.value), B = D.labels.find(x => x.id === b.value);
      const row = (k, fa, fb) => `<tr><th scope="row">${k}</th><td>${fa}</td><td>${fb}</td></tr>`;
      out.innerHTML = `<div class="table-wrap"><table><thead><tr><th></th><th>${esc(A.name)}</th><th>${esc(B.name)}</th></tr></thead><tbody>
        ${row("Strictness", A.score + "/10", B.score + "/10")}
        ${row("Independent audit", A.third ? "Yes" : "No", B.third ? "Yes" : "No")}
        ${row("GMOs excluded", A.gmo ? "No" : "Yes", B.gmo ? "No" : "Yes")}
        ${row("Synthetic inputs", esc(A.synth), esc(B.synth))}
        ${row("Region", esc(A.region), esc(B.region))}
        ${row("Blind spots", esc(A.gaps), esc(B.gaps))}</tbody></table></div>
        <p style="margin-top:12px"><b>Verdict:</b> ${A.score === B.score ? "Roughly equivalent strictness — decide on the blind spots that matter to you." : esc((A.score > B.score ? A : B).name) + " is the stricter, more meaningful label."}</p>`;
      setQS({ a: a.value, b: b.value });
    };
    a.addEventListener("change", cmp); b.addEventListener("change", cmp); cmp();
  }

  /* ---------- 3. Ingredient checker ---------- */
  const ic = $("#ingredient-checker");
  if (ic) {
    const ta = $("textarea", ic), out = $("#ing-out"), sum = $("#ing-sum");
    const run = () => {
      const raw = ta.value.replace(/ingredients?:/i, "");
      const parts = raw.split(/,(?![^()]*\))|;|\n/).map(s => s.replace(/[.*]/g, "").trim()).filter(Boolean);
      if (!parts.length) { out.innerHTML = ""; sum.innerHTML = "<p class='muted'>Paste an ingredient list to see results.</p>"; return; }
      const counts = { prohibited: 0, restricted: 0, allowed: 0, unknown: 0 };
      out.innerHTML = parts.map(p => {
        const low = p.toLowerCase().replace(/^organic\s+/, "");
        const isOrg = /^organic\b/i.test(p);
        let hit = D.ingredients.find(i => i[0].split("|").some(k => low.includes(k)));
        let st = hit ? hit[1] : "unknown", note = hit ? hit[2] : "Not in our database — likely a whole-food agricultural ingredient (must be organic in a certified product).";
        if (isOrg && st === "restricted") { st = "allowed"; note = "Listed as organic — meets the requirement. " + note; }
        counts[st]++;
        const cls = { prohibited: "bad", restricted: "warn", allowed: "ok", unknown: "unk" }[st];
        const lbl = { prohibited: "Not permitted in organic", restricted: "Allowed with conditions", allowed: "Allowed", unknown: "Check" }[st];
        return `<div class="flag-row"><span class="dot ${cls}"></span><div><b>${esc(p)}</b><small><strong>${lbl}.</strong> ${esc(note)}</small></div></div>`;
      }).join("");
      const verdict = counts.prohibited ? `<span class="tag pill-high">${counts.prohibited} prohibited</span> This product could <b>not</b> carry the USDA Organic seal as formulated.` : counts.restricted ? `<span class="tag pill-mod">${counts.restricted} conditional</span> Could qualify if the flagged ingredients meet their conditions.` : `<span class="tag pill-low">Clean</span> Nothing flagged — consistent with an organic formulation.`;
      sum.innerHTML = `<p class="big" style="font-size:2rem">${parts.length} ingredients</p><p>${verdict}</p><ul class="list-clean"><li>Not permitted <b>${counts.prohibited}</b></li><li>Conditional <b>${counts.restricted}</b></li><li>Allowed <b>${counts.allowed}</b></li><li>Unrecognized <b>${counts.unknown}</b></li></ul>`;
    };
    ta.addEventListener("input", run);
    $$("[data-sample]", ic).forEach(b => b.addEventListener("click", () => { ta.value = b.dataset.sample; run(); }));
    run();
  }

  /* ---------- 4. Certification cost estimator ---------- */
  const SALES = { "25": [300, 500], "100": [500, 1000], "250": [900, 1800], "1000": [1500, 4000], "5000": [3500, 9000], "5001": [8000, 25000] };
  const INSPECT = { crop: [400, 900], livestock: [500, 1100], handler: [600, 1500], brand: [600, 1400], wild: [350, 800], retail: [400, 900] };
  function certEstimate(o) {
    const s = SALES[o.sales] || SALES["100"], ins = INSPECT[o.type] || INSPECT.crop;
    const sites = Math.max(1, +o.sites || 1), addons = +o.addons || 0;
    let lo = 350 + ins[0] + (sites - 1) * 250 + s[0] + addons * 250, hi = 500 + ins[1] + (sites - 1) * 600 + s[1] + addons * 900;
    if (o.expedite) { lo += 2000; hi += 4000; }
    const scopes = o.type === "crop" || o.type === "wild" || o.type === "retail" ? 1 : o.type === "livestock" ? 2 : 1;
    const cs = Math.min(750 * scopes, lo * 0.75);
    return { lo, hi, cs };
  }
  window.OL.certEstimate = certEstimate;
  const ce = $("#cert-estimator");
  if (ce) {
    const f = $("form", ce), out = $("#cert-out");
    ["type", "sales", "sites", "addons"].forEach(k => { if (qs.get(k) && f.elements[k]) f.elements[k].value = qs.get(k); });
    const run = () => {
      const o = { type: f.type.value, sales: f.sales.value, sites: f.sites.value, addons: $$("input[name=addon]:checked", f).length, expedite: f.expedite.checked };
      const r = certEstimate(o);
      out.innerHTML = `<small>ESTIMATED FIRST-YEAR COST</small><div class="big">${money(r.lo)} – ${money(r.hi)}</div>
        <p style="margin-top:8px">Potential cost-share reimbursement: <b>up to ${money(r.cs)}</b> → net as low as <b>${money(Math.max(0, r.lo - r.cs))}</b>.</p>
        <ul class="list-clean"><li>Application / new-client fee<b>$350–$500</b></li><li>Inspection (${o.type}, ${o.sites} site${o.sites > 1 ? "s" : ""})<b>${money(INSPECT[o.type][0] + (o.sites - 1) * 250)}–${money(INSPECT[o.type][1] + (o.sites - 1) * 600)}</b></li><li>Annual certification fee<b>${money(SALES[o.sales][0])}–${money(SALES[o.sales][1])}</b></li><li>Add-on standards (${o.addons})<b>${money(o.addons * 250)}–${money(o.addons * 900)}</b></li>${o.expedite ? "<li>Expedited review<b>$2,000–$4,000</b></li>" : ""}</ul>
        <a class="btn btn-accent btn-block" style="margin-top:16px" href="${BASE}get-certified.html?type=${o.type}&sales=${o.sales}&sites=${o.sites}#quote">Get 3 matched certifier quotes — free →</a>
        <p class="form-note" style="margin-top:10px">Indicative ranges compiled from published certifier fee schedules. Actual fees vary by certifier and complexity.</p>`;
      setQS({ type: o.type, sales: o.sales, sites: o.sites });
    };
    f.addEventListener("input", run); f.addEventListener("change", run); run();
  }

  /* ---------- 5. Budget planner ---------- */
  const bp = $("#budget-planner");
  if (bp) {
    const f = $("form", bp), out = $("#budget-out");
    const run = () => {
      const spend = +f.spend.value || 0, prem = (+f.premium.value || 0) / 100, hi = (+f.highshare.value || 0) / 100, dairy = +f.dairy.value || 0, meat = +f.meat.value || 0;
      $$("[data-v]", f).forEach(o => o.textContent = f[o.dataset.v].value + (o.dataset.unit || ""));
      const full = (spend * prem + dairy * 0.6 + meat * 0.8) * 52;
      const smart = (spend * prem * hi + dairy * 0.6) * 52;
      const save = full - smart;
      out.innerHTML = `<small>EXTRA COST PER YEAR</small><p class="big">${money(smart)}</p><p>with the <b>Smart Organic</b> strategy (organic for high-residue produce + dairy).</p>
        <ul class="list-clean"><li>All-organic premium<b>${money(full)}/yr</b></li><li>Smart Organic premium<b>${money(smart)}/yr</b></li><li>You save vs all-organic<b style="color:var(--ok)">${money(save)}/yr</b></li><li>Per week (smart)<b>${money(smart / 52)}</b></li></ul>
        <p class="form-note" style="margin-top:12px">Organic price premiums vary widely by item and store (often 20–100%). Adjust the slider to match your receipts.</p>`;
    };
    f.addEventListener("input", run); run();
  }

  /* ---------- 6. Planting calendar ---------- */
  const pc = $("#planting-calendar");
  if (pc) {
    const ZONES = { 3: ["05-15", "09-15"], 4: ["05-08", "09-28"], 5: ["04-25", "10-10"], 6: ["04-15", "10-20"], 7: ["04-05", "10-30"], 8: ["03-20", "11-15"], 9: ["02-25", "12-05"], 10: ["02-01", "12-20"] };
    // [name, indoor[wk,wk], direct[wk,wk], transplant[wk,wk], daysToMaturity]
    const CROPS = [["Tomato", [-8, -6], null, [1, 3], 75], ["Pepper", [-10, -8], null, [2, 4], 80], ["Eggplant", [-9, -7], null, [2, 4], 80], ["Lettuce", [-6, -4], [-4, 2], [-2, 1], 50], ["Spinach", null, [-6, -2], null, 45], ["Kale", [-8, -6], [-4, -2], [-4, -2], 60], ["Broccoli", [-8, -6], null, [-2, 0], 70], ["Cabbage", [-8, -6], null, [-3, 0], 80], ["Carrot", null, [-3, 2], null, 70], ["Beet", null, [-3, 2], null, 60], ["Radish", null, [-5, 1], null, 28], ["Pea", null, [-6, -3], null, 65], ["Bush bean", null, [1, 6], null, 55], ["Sweet corn", null, [1, 4], null, 80], ["Cucumber", [-3, -2], [1, 4], null, 60], ["Zucchini", null, [1, 4], null, 55], ["Winter squash", null, [1, 3], null, 100], ["Pumpkin", null, [1, 3], null, 110], ["Melon", [-4, -2], null, [2, 3], 85], ["Onion", [-12, -10], null, [-4, -2], 110], ["Potato", null, [-3, 1], null, 90], ["Basil", [-6, -4], null, [1, 3], 60], ["Cilantro", null, [-2, 2], null, 45], ["Parsley", [-10, -8], null, [-2, 0], 75], ["Swiss chard", null, [-2, 2], null, 55], ["Sweet potato", null, null, [3, 5], 110], ["Okra", null, [3, 5], null, 60], ["Sunflower", null, [0, 3], null, 80], ["Strawberry", null, null, [-4, -2], 90], ["Garlic (fall-planted)", null, "garlic", null, 240]];
    const f = $("form", pc), grid = $("#cal-grid"), info = $("#cal-info");
    const M = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    if (qs.get("zone")) f.zone.value = qs.get("zone");
    const run = () => {
      const yr = new Date().getFullYear(); let lf, ff;
      if (f.lastfrost.value) { lf = new Date(f.lastfrost.value); ff = new Date(lf.getTime() + 165 * 864e5); }
      else { const z = ZONES[f.zone.value]; lf = new Date(`${yr}-${z[0]}T12:00:00`); ff = new Date(`${yr}-${z[1]}T12:00:00`); }
      const wk = w => new Date(lf.getTime() + w * 7 * 864e5);
      const fmt = d => d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
      info.innerHTML = `Average last spring frost: <b>${fmt(lf)}</b> · first fall frost: <b>${fmt(ff)}</b> · season ≈ <b>${Math.round((ff - lf) / 864e5)} days</b>`;
      const months = (a, b) => { const s = new Set(); if (!a) return s; let d = new Date(a); while (d <= b) { s.add(d.getMonth()); d = new Date(d.getTime() + 7 * 864e5); } s.add(b.getMonth()); return s; };
      let html = `<div class="crop" style="font-size:.72rem;color:var(--muted)">CROP</div>` + M.map(m => `<div style="font-weight:700">${m}</div>`).join("");
      CROPS.forEach(c => {
        let ind = new Set(), sow = new Set(), tr = new Set(), hv = new Set();
        if (c[2] === "garlic") { sow = months(new Date(ff.getTime() - 42 * 864e5), new Date(ff.getTime() - 14 * 864e5)); hv = months(wk(8), wk(12)); }
        else {
          if (c[1]) ind = months(wk(c[1][0]), wk(c[1][1]));
          if (c[2]) sow = months(wk(c[2][0]), wk(c[2][1]));
          if (c[3]) tr = months(wk(c[3][0]), wk(c[3][1]));
          const start = c[3] ? wk(c[3][0]) : c[2] ? wk(c[2][0]) : wk(0);
          const hs = new Date(start.getTime() + c[4] * 864e5), he = new Date(Math.min(ff.getTime(), hs.getTime() + 50 * 864e5));
          if (hs < ff) hv = months(hs, he);
        }
        html += `<div class="crop">${c[0]}</div>` + M.map((_, i) => { const cls = tr.has(i) ? "tr" : sow.has(i) ? "sow" : ind.has(i) ? "sow" : hv.has(i) ? "hv" : ""; const lbl = tr.has(i) ? "Transplant" : sow.has(i) ? "Sow" : ind.has(i) ? "Start indoors" : hv.has(i) ? "Harvest" : ""; return `<div class="${cls}" title="${lbl}">${ind.has(i) && !sow.has(i) && !tr.has(i) ? "in" : ""}</div>`; }).join("");
      });
      grid.innerHTML = html;
      setQS({ zone: f.lastfrost.value ? "" : f.zone.value });
    };
    f.addEventListener("input", run); run();
  }

  /* ---------- 7. Compost mixer ---------- */
  const cm = $("#compost-mixer");
  if (cm) {
    const MAT = { "Food / vegetable scraps": [2.5, 15, 80], "Grass clippings": [3.4, 17, 80], "Coffee grounds": [2.1, 20, 60], "Cow manure": [2.4, 19, 80], "Horse manure": [1.6, 30, 72], "Chicken manure": [4.0, 8, 60], "Fruit waste": [1.5, 35, 80], "Alfalfa / hay (green)": [2.7, 16, 15], "Seaweed": [1.9, 19, 55], "Dry leaves": [0.9, 60, 35], "Straw": [0.7, 80, 12], "Pine needles": [0.7, 80, 20], "Shredded newspaper": [0.1, 600, 8], "Cardboard": [0.14, 350, 8], "Sawdust": [0.24, 325, 39], "Wood chips": [0.12, 400, 40] };
    const rows = $("#cm-rows"), out = $("#cm-out");
    const addRow = (m = "Food / vegetable scraps", w = 10) => {
      const d = document.createElement("div"); d.className = "row"; d.style.marginBottom = "10px";
      d.innerHTML = `<select aria-label="Material" style="flex:1 1 200px">${Object.keys(MAT).map(k => `<option ${k === m ? "selected" : ""}>${k}</option>`).join("")}</select><input aria-label="Pounds" type="number" min="0" step="1" value="${w}" style="width:100px"><span class="muted">lb</span><button type="button" class="icon-btn" aria-label="Remove">✕</button>`;
      $("button", d).addEventListener("click", () => { d.remove(); run(); });
      d.addEventListener("input", run); rows.appendChild(d); run();
    };
    const run = () => {
      let C = 0, N = 0, W = 0, WM = 0;
      $$(".row", rows).forEach(r => { const m = MAT[$("select", r).value], w = +$("input", r).value || 0; const dry = w * (1 - m[2] / 100), n = dry * m[0] / 100; N += n; C += n * m[1]; W += w; WM += w * m[2]; });
      if (!N) { out.innerHTML = "<p class='muted'>Add materials to calculate.</p>"; return; }
      const ratio = C / N, moist = WM / W, pos = Math.min(100, Math.max(0, (ratio - 10) / 50 * 100));
      const v = ratio < 20 ? ["Too green (nitrogen-heavy)", "Add browns: leaves, straw or cardboard. Expect ammonia smell otherwise.", "pill-high"] : ratio <= 35 ? ["Ideal hot-compost range", "Great balance — keep it as moist as a wrung-out sponge and turn weekly.", "pill-low"] : ratio <= 50 ? ["A bit brown (carbon-heavy)", "Will compost slowly. Add greens: food scraps, grass or manure.", "pill-mod"] : ["Very carbon-heavy", "Will barely heat up. Add plenty of greens.", "pill-high"];
      out.innerHTML = `<small>BLENDED C:N RATIO</small><p class="big">${ratio.toFixed(1)} : 1</p><div class="meter"><i style="left:${pos}%"></i></div><small>10 · · · · · 25–35 ideal · · · · · 60+</small><p style="margin-top:12px"><span class="tag ${v[2]}">${v[0]}</span></p><p>${v[1]}</p><ul class="list-clean"><li>Total weight<b>${Math.round(W)} lb</b></li><li>Estimated moisture<b>${moist.toFixed(0)}%</b> <small>(target 50–60%)</small></li></ul>`;
    };
    $("#cm-add").addEventListener("click", () => addRow("Dry leaves", 5));
    addRow("Food / vegetable scraps", 20); addRow("Dry leaves", 10); addRow("Grass clippings", 5);
  }

  /* ---------- 8. Transition ROI ---------- */
  const tr = $("#transition-roi");
  if (tr) {
    const f = $("form", tr), out = $("#roi-out"), tbl = $("#roi-table");
    const run = () => {
      const A = +f.acres.value, Y = +f.yield.value, P = +f.price.value, prem = +f.premium.value / 100, drag = +f.drag.value / 100, cost = +f.cost.value, dcost = +f.dcost.value / 100, cert = +f.cert.value, years = +f.years.value;
      const conv = A * (Y * P - cost);
      let cum = 0, pay = null, rows = "";
      for (let y = 1; y <= 10; y++) {
        const transitioning = y <= years;
        const yy = Y * (1 - drag * (transitioning ? 1 : 0.8));
        const price = transitioning ? P : P * (1 + prem);
        const org = A * (yy * price - cost * (1 + dcost)) - cert + (y <= years ? 0 : Math.min(750, cert * .75));
        const diff = org - conv; cum += diff;
        if (pay === null && cum > 0) pay = y;
        rows += `<tr><td>Year ${y}${transitioning ? " <small>(transition)</small>" : ""}</td><td>${money(conv)}</td><td>${money(org)}</td><td style="color:${diff >= 0 ? "var(--ok)" : "var(--bad)"}">${diff >= 0 ? "+" : ""}${money(diff)}</td><td>${cum >= 0 ? "+" : ""}${money(cum)}</td></tr>`;
      }
      out.innerHTML = `<small>10-YEAR CUMULATIVE GAIN FROM GOING ORGANIC</small><p class="big" style="color:${cum >= 0 ? "" : "var(--bad)"}">${cum >= 0 ? "+" : ""}${money(cum)}</p><p>${pay ? `Break-even in <b>year ${pay}</b>.` : "Does not break even within 10 years at these assumptions — raise the premium or lower yield drag."}</p><a class="btn btn-accent btn-block" href="${BASE}get-certified.html#quote">Talk to a transition specialist →</a>`;
      tbl.innerHTML = rows;
      $$("[data-v]", f).forEach(o => o.textContent = f[o.dataset.v].value + (o.dataset.unit || ""));
    };
    f.addEventListener("input", run); run();
  }

  /* ---------- 9. Cost-share checker ---------- */
  const cs = $("#costshare");
  if (cs) {
    const f = $("form", cs), out = $("#cs-out");
    const run = () => {
      let total = 0, lines = "";
      $$("[data-scope]", f).forEach(r => {
        const on = $("input[type=checkbox]", r).checked, amt = +$("input[type=number]", r).value || 0;
        $("input[type=number]", r).disabled = !on;
        if (on) { const reimb = Math.min(750, amt * .75); total += reimb; lines += `<li>${r.dataset.scope}<b>${money(reimb)}</b></li>`; }
      });
      out.innerHTML = `<small>ESTIMATED REIMBURSEMENT</small><p class="big">${money(total)}</p><ul class="list-clean">${lines || "<li class='muted'>Select at least one scope.</li>"}</ul><p class="form-note" style="margin-top:10px">Based on the USDA Organic Certification Cost Share Program formula used in recent years (75% of eligible costs, max $750 per scope). Rates and deadlines change by program year — confirm with your state agency or local FSA office.</p>`;
    };
    f.addEventListener("input", run); run();
  }

  /* ---------- Lab reports ---------- */
  const lr = $("#reports");
  if (lr) {
    const q = $("#rep-q"), cat = $("#rep-cat"), sort = $("#rep-sort"), cnt = $("#rep-count");
    const lvl = v => ({ ND: "Not detected", trace: "Trace", low: "Low", moderate: "Moderate", high: "High" }[v] || v);
    const draw = () => {
      const t = q.value.toLowerCase();
      let rows = D.reports.filter(r => (!t || r.name.toLowerCase().includes(t)) && (!cat.value || r.cat === cat.value));
      rows.sort((a, b) => sort.value === "low" ? a.score - b.score : sort.value === "name" ? a.name.localeCompare(b.name) : b.score - a.score);
      cnt.textContent = rows.length + " reports";
      lr.innerHTML = rows.map(r => `<article class="card"><div class="report-head"><div class="score ${r.grade.toLowerCase()}" aria-label="Grade ${r.grade}">${r.grade}</div><div><span class="tag sample">Sample data</span><h3 style="font-size:1.05rem;margin:6px 0 0">${esc(r.name)}</h3><small>${r.id} · OrgLab score ${r.score}/100</small></div></div>
        <ul class="list-clean" style="font-size:.9rem"><li>Lead<b>${lvl(r.lead)}</b></li><li>Arsenic<b>${lvl(r.arsenic)}</b></li><li>Cadmium<b>${lvl(r.cadmium)}</b></li><li>Pesticide residues<b>${r.pesticides === 0 ? "None detected" : r.pesticides + " detected"}</b></li><li>Glyphosate<b>${lvl(r.glyphosate)}</b></li><li>Label accuracy<b>${esc(r.label)}</b></li></ul>
        ${r.note ? `<p style="margin-top:10px"><small>${esc(r.note)}</small></p>` : ""}<div class="row" style="margin-top:12px"><a class="btn btn-sm btn-ghost" href="${BASE}get-certified.html?type=testing#quote">Test a similar product</a></div></article>`).join("") || "<p>No matching reports.</p>";
    };
    [q, cat, sort].forEach(x => x.addEventListener("input", draw)); draw();
  }

  /* ---------- Videos page ---------- */
  const vg = $("#video-grid");
  if (vg) {
    const draw = c => {
      vg.innerHTML = D.videos.filter(v => !c || v.c === c).map(v => `<article class="card video-card"><div class="yt" data-id="${v.id}" data-title="${esc(v.t)}"></div><h3>${esc(v.t)}</h3><small>${esc(v.src)} · <span class="tag">${v.c}</span></small></article>`).join("");
      $$(".yt[data-id]", vg).forEach(el => {
        el.style.backgroundImage = `url(https://i.ytimg.com/vi/${el.dataset.id}/hqdefault.jpg)`;
        const b = document.createElement("button"); b.type = "button"; b.setAttribute("aria-label", "Play: " + el.dataset.title); el.appendChild(b);
        b.addEventListener("click", () => { el.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${el.dataset.id}?autoplay=1&rel=0" title="${esc(el.dataset.title)}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`; });
      });
    };
    $$("[data-vcat]").forEach(b => b.addEventListener("click", () => { $$("[data-vcat]").forEach(x => x.setAttribute("aria-pressed", String(x === b))); draw(b.dataset.vcat); }));
    draw("");
  }

  /* ---------- Multi-step certification lead form ---------- */
  const lf = $("#lead-form");
  if (lf) {
    const steps = $$(".step", lf), bar = $(".progress i", lf), label = $("[data-step-label]", lf);
    let i = 0;
    const saved = OL.store.get("ol-lead-draft", {});
    Object.entries(saved).forEach(([k, v]) => { $$(`[name="${k}"]`, lf).forEach(el => { if (el.type === "radio" || el.type === "checkbox") el.checked = [].concat(v).includes(el.value); else el.value = v; }); });
    const pre = { type: qs.get("type"), sales: qs.get("sales"), sites: qs.get("sites") };
    const typeMap = { crop: "farm", livestock: "farm", wild: "farm", handler: "handler", brand: "brand", retail: "retail", testing: "testing" };
    if (pre.type && typeMap[pre.type]) { const r = $(`[name=operation][value=${typeMap[pre.type]}]`, lf); if (r) r.checked = true; }
    if (pre.sales && lf.elements.sales) lf.elements.sales.value = pre.sales;
    if (pre.sites && lf.elements.sites) lf.elements.sites.value = pre.sites;
    const save = () => { const fd = new FormData(lf), o = {}; for (const k of new Set(fd.keys())) { if (k === "_gotcha") continue; const all = fd.getAll(k); o[k] = all.length > 1 ? all : all[0]; } OL.store.set("ol-lead-draft", o); };
    lf.addEventListener("change", save);
    const show = n => {
      i = n; steps.forEach((s, k) => s.classList.toggle("active", k === i));
      bar.style.width = ((i + 1) / steps.length * 100) + "%"; label.textContent = `Step ${i + 1} of ${steps.length}`;
      $("[data-prev]", lf).classList.toggle("hide", i === 0);
      $("[data-next]", lf).classList.toggle("hide", i === steps.length - 1);
      $("[data-submit]", lf).classList.toggle("hide", i !== steps.length - 1);
    };
    const validStep = () => {
      const s = steps[i]; let ok = true;
      const radios = new Set($$("input[type=radio][required]", s).map(r => r.name));
      radios.forEach(n => { if (!$(`input[name="${n}"]:checked`, s)) ok = false; });
      if ($("[data-min-one]", s) && !$$("input[type=checkbox]:checked", $("[data-min-one]", s)).length) ok = false;
      $$("input:not([type=radio]):not([type=checkbox]), select, textarea", s).forEach(f => { if (f.name === "_gotcha") return; const bad = !f.checkValidity(); f.setAttribute("aria-invalid", String(bad)); if (bad) ok = false; });
      $$("input[type=checkbox][required]", s).forEach(c => { if (!c.checked) ok = false; });
      if (!ok) OL.toast("Please complete this step");
      return ok;
    };
    $("[data-next]", lf).addEventListener("click", () => { if (validStep()) { show(i + 1); lf.scrollIntoView({ block: "start", behavior: "smooth" }); } });
    $("[data-prev]", lf).addEventListener("click", () => show(i - 1));
    $$(".choice input[type=radio]", lf).forEach(r => r.addEventListener("change", () => { if (r.closest(".step") === steps[i] && i === 0) setTimeout(() => { if (validStep()) show(1); }, 180); }));
    lf.addEventListener("submit", async e => {
      e.preventDefault(); if (!validStep()) return;
      const op = (lf.operation.value || "farm");
      const est = certEstimate({ type: { farm: "crop", handler: "handler", brand: "brand", retail: "retail", cosmetics: "brand", textile: "handler", testing: "brand" }[op], sales: lf.sales.value, sites: lf.sites.value || 1, addons: Math.max(0, $$("input[name=standards]:checked", lf).length - 1) });
      const salesScore = { "25": 1, "100": 2, "250": 3, "1000": 4, "5000": 5, "5001": 5 }[lf.sales.value] || 1;
      const timeScore = { asap: 4, "3m": 3, "6m": 2, "12m": 1 }[lf.timeline.value] || 1;
      const score = salesScore * timeScore + $$("input[name=standards]:checked", lf).length;
      const btn = $("[data-submit]", lf); btn.disabled = true; btn.textContent = "Matching…";
      const res = await OL.submitForm(lf, { lead_score: score, lead_tier: score >= 14 ? "HOT" : score >= 7 ? "WARM" : "NURTURE", est_low: est.lo, est_high: est.hi });
      btn.disabled = false; btn.textContent = "Get my free quotes";
      if (res.ok) {
        OL.store.set("ol-lead-draft", {});
        const C = window.ORGLAB_CONFIG || {};
        $("#lead-wrap").innerHTML = `<div class="stack" role="status"><span class="tag pill-low">✓ Request received</span><h3 style="font-family:var(--display);font-size:1.7rem">You're in, ${esc((lf.elements.full_name.value || "").split(" ")[0] || "friend")}!</h3><p>Our team will match you with up to 3 accredited certifiers or labs within <b>1 business day</b>.</p><div class="estimate"><small>YOUR INDICATIVE FIRST-YEAR COST</small><br><b>${money(est.lo)} – ${money(est.hi)}</b><br><small>Potential cost-share: up to ${money(est.cs)}</small></div><h4>What happens next</h4><ol><li>We review your operation profile (today).</li><li>You receive matched quotes by email.</li><li>Pick a certifier — we stay on hand to help with the Organic System Plan.</li></ol>${C.bookingUrl ? `<a class="btn btn-accent" href="${C.bookingUrl}" target="_blank" rel="noopener">Book a free 15-min call</a>` : ""}<a class="btn btn-ghost" href="${BASE}guide.html">Download the free Certification Roadmap</a></div>`;
        if (window.gtag) gtag("event", "generate_lead", { form_name: "certification-quote", value: score });
      } else OL.toast("Could not send — please try again or email us.");
    });
    show(0);
  }
})();
