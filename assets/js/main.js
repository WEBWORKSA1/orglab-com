/* OrgLab.com — core site script (no dependencies) */
(function () {
  "use strict";
  const C = window.ORGLAB_CONFIG || {};
  const root = document.documentElement;
  const BASE = root.dataset.base || "";
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const store = {
    get(k, d = null) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  const ss = {
    get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }
  };
  window.OL = { $, $$, store, BASE, toast, getByPath };

  function getByPath(obj, path) { return path.split(".").reduce((o, k) => (o ? o[k] : undefined), obj); }

  /* ---------- Toast ---------- */
  function toast(msg) {
    let t = $(".toast");
    if (!t) { t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
    t.textContent = msg; t.classList.add("show");
    clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("show"), 2600);
  }

  /* ---------- Theme ---------- */
  const savedTheme = store.get("ol-theme");
  if (savedTheme) root.dataset.theme = savedTheme;
  $$("[data-theme-toggle]").forEach(b => b.addEventListener("click", () => {
    const dark = root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme = dark ? "light" : "dark";
    store.set("ol-theme", root.dataset.theme);
  }));

  /* ---------- Drawer / dropdowns ---------- */
  const drawer = $("#drawer");
  function setDrawer(open) {
    if (!drawer) return;
    drawer.classList.toggle("open", open);
    document.body.style.overflow = open ? "hidden" : "";
    $$("[data-drawer-open]").forEach(b => b.setAttribute("aria-expanded", String(open)));
    if (open) { const f = $("a, button", drawer.querySelector(".drawer-panel")); f && f.focus(); }
  }
  $$("[data-drawer-open]").forEach(b => b.addEventListener("click", () => setDrawer(true)));
  $$("[data-drawer-close]").forEach(b => b.addEventListener("click", () => setDrawer(false)));
  $$(".menu > li > button").forEach(btn => {
    btn.addEventListener("click", () => {
      const li = btn.parentElement; const open = !li.classList.contains("open");
      $$(".menu > li.open").forEach(x => { x.classList.remove("open"); $("button", x).setAttribute("aria-expanded", "false"); });
      li.classList.toggle("open", open); btn.setAttribute("aria-expanded", String(open));
    });
  });
  document.addEventListener("click", e => { if (!e.target.closest(".menu")) $$(".menu > li.open").forEach(x => x.classList.remove("open")); });

  /* ---------- Modals ---------- */
  function openModal(id) {
    const m = document.getElementById(id); if (!m) return;
    m.classList.add("open"); m._last = document.activeElement;
    const f = $("input, button, a", $(".modal-box", m)); setTimeout(() => f && f.focus(), 30);
  }
  function closeModal(m) { m.classList.remove("open"); m._last && m._last.focus && m._last.focus(); }
  window.OL.openModal = openModal;
  $$("[data-modal-open]").forEach(b => b.addEventListener("click", e => { e.preventDefault(); openModal(b.dataset.modalOpen); }));
  $$(".modal").forEach(m => $$("[data-modal-close], .modal-bg", m).forEach(x => x.addEventListener("click", () => closeModal(m))));
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") { $$(".modal.open").forEach(closeModal); setDrawer(false); }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); openModal("search-modal"); }
    if (e.key === "/" && !/input|textarea|select/i.test(document.activeElement.tagName)) { e.preventDefault(); openModal("search-modal"); }
  });

  /* ---------- Site search ---------- */
  let idx = null;
  const sInput = $("#site-search"), sOut = $("#search-results");
  async function loadIndex() {
    if (idx) return idx;
    try { const r = await fetch(BASE + "data/search-index.json"); idx = await r.json(); } catch (e) { idx = []; }
    return idx;
  }
  function renderSearch(q) {
    if (!sOut) return;
    q = q.trim().toLowerCase();
    if (!q) { sOut.innerHTML = '<p class="muted">Try “dirty dozen”, “certification cost”, “compost”, “label”…</p>'; return; }
    const terms = q.split(/\s+/);
    const hits = idx.map(p => {
      const hay = (p.t + " " + p.d + " " + p.k).toLowerCase();
      let s = 0; terms.forEach(t => { if (p.t.toLowerCase().includes(t)) s += 5; if (hay.includes(t)) s += 1; });
      return { p, s };
    }).filter(x => x.s > 0).sort((a, b) => b.s - a.s).slice(0, 8);
    sOut.innerHTML = hits.length ? hits.map(({ p }) => `<a href="${BASE + p.u}"><strong>${esc(p.t)}</strong><small>${esc(p.d)}</small></a>`).join("")
      : `<p class="muted">No results for “${esc(q)}”. <a href="${BASE}contact.html">Ask the lab</a>.</p>`;
  }
  if (sInput) { sInput.addEventListener("focus", async () => { await loadIndex(); renderSearch(sInput.value); }); sInput.addEventListener("input", async () => { await loadIndex(); renderSearch(sInput.value); }); }
  function esc(s) { return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
  window.OL.esc = esc;

  /* ---------- Config-driven links ---------- */
  $$("[data-cfg-link]").forEach(a => {
    const v = getByPath(C, a.dataset.cfgLink);
    if (v) { a.href = v; a.target = "_blank"; a.rel = "noopener"; }
    else if (a.dataset.cfgHide !== undefined) a.classList.add("hide");
  });
  $$("[data-cfg-text]").forEach(el => { const v = getByPath(C, el.dataset.cfgText); if (v) el.textContent = v; });
  $$("[data-year]").forEach(el => el.textContent = new Date().getFullYear());

  /* ---------- Consent + AdSense + GA4 ---------- */
  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  window.gtag = gtag;
  const consent = store.get("ol-consent");
  gtag("consent", "default", {
    ad_storage: consent === "all" ? "granted" : "denied",
    ad_user_data: consent === "all" ? "granted" : "denied",
    ad_personalization: consent === "all" ? "granted" : "denied",
    analytics_storage: consent ? "granted" : "denied",
    wait_for_update: 500
  });
  const cookie = $("#cookie");
  if (cookie && !consent) cookie.classList.add("show");
  $$("[data-consent]").forEach(b => b.addEventListener("click", () => {
    const v = b.dataset.consent; store.set("ol-consent", v);
    gtag("consent", "update", { ad_storage: v === "all" ? "granted" : "denied", ad_user_data: v === "all" ? "granted" : "denied", ad_personalization: v === "all" ? "granted" : "denied", analytics_storage: "granted" });
    cookie && cookie.classList.remove("show");
  }));

  function loadScript(src, attrs = {}) { const s = document.createElement("script"); s.async = true; s.src = src; Object.entries(attrs).forEach(([k, v]) => s.setAttribute(k, v)); document.head.appendChild(s); return s; }

  if (C.ga4Id) {
    loadScript("https://www.googletagmanager.com/gtag/js?id=" + C.ga4Id);
    gtag("js", new Date()); gtag("config", C.ga4Id, { anonymize_ip: true });
  }
  const previewAds = /[?&]ads=preview/.test(location.search);
  if (C.adsenseClient) {
    loadScript("https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" + C.adsenseClient, { crossorigin: "anonymous" });
    $$(".ad").forEach(slot => {
      const ins = document.createElement("ins");
      ins.className = "adsbygoogle"; ins.style.display = "block";
      ins.setAttribute("data-ad-client", C.adsenseClient);
      const id = (C.adSlots || {})[slot.dataset.slot || "incontent"];
      if (id) ins.setAttribute("data-ad-slot", id);
      ins.setAttribute("data-ad-format", slot.dataset.format || "auto");
      ins.setAttribute("data-full-width-responsive", "true");
      slot.innerHTML = ""; slot.classList.add("ad-live"); slot.appendChild(ins);
      try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {}
    });
  } else if (!previewAds) {
    document.body.classList.add("ads-off");
  }

  /* ---------- Lite YouTube ---------- */
  $$(".yt[data-id]").forEach(el => {
    const id = el.dataset.id;
    el.style.backgroundImage = `url(https://i.ytimg.com/vi/${id}/hqdefault.jpg)`;
    const b = document.createElement("button"); b.type = "button"; b.setAttribute("aria-label", "Play video: " + (el.dataset.title || "")); el.appendChild(b);
    b.addEventListener("click", () => {
      el.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0" title="${esc(el.dataset.title || "YouTube video")}" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    });
  });

  /* ---------- Counters ---------- */
  const counters = $$("[data-count]");
  if (counters.length && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return; io.unobserve(e.target);
      const el = e.target, end = parseFloat(el.dataset.count), suf = el.dataset.suffix || "", pre = el.dataset.prefix || "";
      const t0 = performance.now(), dur = 1200;
      (function tick(t) { const p = Math.min(1, (t - t0) / dur); el.textContent = pre + Math.round(end * (1 - Math.pow(1 - p, 3))).toLocaleString() + suf; if (p < 1) requestAnimationFrame(tick); })(t0);
    }), { threshold: .4 });
    counters.forEach(c => io.observe(c));
  }

  /* ---------- Sticky CTA / back to top ---------- */
  const sticky = $(".sticky-cta"), bt = $(".back-top");
  addEventListener("scroll", () => {
    const y = scrollY;
    sticky && sticky.classList.toggle("show", y > 700 && !ss.get("ol-sticky-x"));
    bt && bt.classList.toggle("show", y > 900);
  }, { passive: true });
  $$("[data-sticky-close]").forEach(b => b.addEventListener("click", () => { ss.set("ol-sticky-x", "1"); sticky.classList.remove("show"); }));
  bt && bt.addEventListener("click", () => scrollTo({ top: 0 }));

  /* ---------- Exit intent (lead magnet) ---------- */
  if (document.body.dataset.exit !== undefined && !ss.get("ol-exit") && !store.get("ol-subscribed")) {
    const fire = () => { if (ss.get("ol-exit")) return; ss.set("ol-exit", "1"); openModal("magnet-modal"); };
    document.addEventListener("mouseout", e => { if (!e.relatedTarget && e.clientY < 8) fire(); });
    setTimeout(() => { if (matchMedia("(max-width: 900px)").matches && scrollY > 1200) fire(); }, 40000);
  }

  /* ---------- Countdown ---------- */
  $$("[data-countdown]").forEach(el => {
    const end = new Date(el.dataset.countdown).getTime();
    const parts = { d: $("[data-d]", el), h: $("[data-h]", el), m: $("[data-m]", el), s: $("[data-s]", el) };
    (function tick() {
      let diff = Math.max(0, end - Date.now());
      const d = Math.floor(diff / 864e5); diff -= d * 864e5; const h = Math.floor(diff / 36e5); diff -= h * 36e5; const m = Math.floor(diff / 6e4); diff -= m * 6e4; const s = Math.floor(diff / 1e3);
      parts.d.textContent = d; parts.h.textContent = String(h).padStart(2, "0"); parts.m.textContent = String(m).padStart(2, "0"); parts.s.textContent = String(s).padStart(2, "0");
      setTimeout(tick, 1000);
    })();
  });

  /* ---------- Copy buttons ---------- */
  $$("[data-copy]").forEach(b => b.addEventListener("click", async () => {
    const txt = b.dataset.copy === "url" ? location.href : ($(b.dataset.copy) || {}).innerText || "";
    try { await navigator.clipboard.writeText(txt); toast("Copied to clipboard"); } catch (e) { toast("Copy failed — select and copy manually"); }
  }));
  $$("[data-print]").forEach(b => b.addEventListener("click", () => print()));
  $$("[data-share]").forEach(b => b.addEventListener("click", async () => {
    const data = { title: document.title, url: location.href };
    if (navigator.share) { try { await navigator.share(data); } catch (e) {} } else { try { await navigator.clipboard.writeText(location.href); toast("Link copied"); } catch (e) {} }
  }));

  /* ---------- Forms (all [data-form]) ---------- */
  const utm = (() => {
    const p = new URLSearchParams(location.search), o = store.get("ol-utm") || {};
    ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid"].forEach(k => { if (p.get(k)) o[k] = p.get(k); });
    if (!o.first_referrer && document.referrer && !document.referrer.includes(location.host)) o.first_referrer = document.referrer;
    if (!o.landing) o.landing = location.pathname;
    store.set("ol-utm", o); return o;
  })();

  async function submitForm(form, extra = {}) {
    const fd = new FormData(form);
    const data = Object.fromEntries(Array.from(fd.keys()).map(k => [k, fd.getAll(k).length > 1 ? fd.getAll(k).join(", ") : fd.get(k)]));
    Object.assign(data, extra, utm, { form_name: form.dataset.form, page: location.href, submitted_at: new Date().toISOString() });
    if (data._gotcha) return { ok: true, spam: true };
    const started = parseInt(form.dataset.t0 || "0", 10);
    if (started && Date.now() - started < 2500) return { ok: true, spam: true };
    delete data._gotcha;
    if (C.web3formsKey) data.access_key = C.web3formsKey;
    data.subject = `[OrgLab] ${form.dataset.form} submission`;
    if (!C.formEndpoint) {
      const all = store.get("ol-demo-submissions", []); all.push(data); store.set("ol-demo-submissions", all);
      console.info("[OrgLab demo mode] Form captured locally. Set formEndpoint in assets/js/config.js to receive leads.", data);
      return { ok: true, demo: true };
    }
    try {
      const r = await fetch(C.formEndpoint, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(data) });
      return { ok: r.ok };
    } catch (e) { return { ok: false }; }
  }
  window.OL.submitForm = submitForm;

  function validate(form) {
    let ok = true, first = null;
    $$("input, select, textarea", form).forEach(f => {
      if (f.closest(".hide") || f.type === "hidden" || f.name === "_gotcha") return;
      const bad = !f.checkValidity();
      f.setAttribute("aria-invalid", bad ? "true" : "false");
      if (bad && !first) first = f; if (bad) ok = false;
    });
    first && first.focus(); return ok;
  }
  window.OL.validate = validate;

  $$("form[data-form]").forEach(form => {
    form.dataset.t0 = Date.now();
    if (!$("[name=_gotcha]", form)) form.insertAdjacentHTML("beforeend", '<input class="hp" type="text" name="_gotcha" tabindex="-1" autocomplete="off" aria-hidden="true">');
    if (form.dataset.custom !== undefined) return;
    form.setAttribute("novalidate", "");
    form.addEventListener("submit", async e => {
      e.preventDefault();
      if (!validate(form)) { toast("Please complete the highlighted fields"); return; }
      const btn = $("button[type=submit]", form); const label = btn ? btn.innerHTML : "";
      if (btn) { btn.disabled = true; btn.textContent = "Sending…"; }
      const res = await submitForm(form);
      if (btn) { btn.disabled = false; btn.innerHTML = label; }
      let msg = $(".form-msg", form.parentElement);
      if (!msg) { msg = document.createElement("div"); msg.className = "form-msg"; msg.setAttribute("role", "status"); form.after(msg); }
      if (res.ok) {
        msg.className = "form-msg ok";
        msg.textContent = form.dataset.success || "Thank you! We received your submission.";
        if (form.dataset.form.includes("newsletter") || form.dataset.form.includes("magnet")) store.set("ol-subscribed", true);
        if (form.dataset.redirect) { location.href = BASE + form.dataset.redirect; return; }
        form.reset();
        if (window.gtag) gtag("event", "generate_lead", { form_name: form.dataset.form });
      } else {
        msg.className = "form-msg err";
        msg.textContent = "Something went wrong. Please email " + (C.contactEmail || "us") + ".";
      }
    });
  });

  /* ---------- Donation widget ---------- */
  const don = $("#donate-widget");
  if (don) {
    let freq = "once", amt = 25;
    const out = $("#donate-summary"), go = $("#donate-go"), custom = $("#donate-custom");
    const upd = () => { out.textContent = `$${amt}${freq === "monthly" ? " / month" : " one-time"}`; };
    $$("[data-freq]", don).forEach(b => b.addEventListener("click", () => { freq = b.dataset.freq; $$("[data-freq]", don).forEach(x => x.setAttribute("aria-pressed", String(x === b))); upd(); }));
    $$("[data-amt]", don).forEach(b => b.addEventListener("click", () => { amt = +b.dataset.amt; custom.value = ""; $$("[data-amt]", don).forEach(x => x.setAttribute("aria-pressed", String(x === b))); upd(); }));
    custom && custom.addEventListener("input", () => { const v = parseFloat(custom.value); if (v > 0) { amt = Math.round(v); $$("[data-amt]", don).forEach(x => x.setAttribute("aria-pressed", "false")); upd(); } });
    go.addEventListener("click", () => {
      const d = C.donate || {};
      let url = freq === "monthly" ? (amt >= 29 ? d.stripeMonthly.labpartner : amt >= 12 ? d.stripeMonthly.grower : d.stripeMonthly.seedling) : d.stripeOneTime;
      url = url || d.paypal || d.buyMeACoffee || d.githubSponsors;
      if (url) { window.open(url, "_blank", "noopener"); if (window.gtag) gtag("event", "begin_checkout", { value: amt, currency: "USD", frequency: freq }); }
      else toast("Donations launch soon — thank you!");
    });
    upd();
  }
  const goal = $("[data-goal]");
  if (goal && C.fundingGoal) {
    const g = C.fundingGoal, pct = Math.min(100, Math.round((g.raised / g.goal) * 100));
    $("i", goal).style.width = Math.max(pct, 2) + "%";
    const t = $("[data-goal-text]"); if (t) t.textContent = `$${g.raised.toLocaleString()} raised of $${g.goal.toLocaleString()} goal (${pct}%)`;
  }
  $$("[data-tier]").forEach(b => b.addEventListener("click", () => {
    const url = getByPath(C, "donate.stripeMonthly." + b.dataset.tier) || (C.donate || {}).patreon || (C.donate || {}).githubSponsors;
    if (url) window.open(url, "_blank", "noopener"); else toast("Memberships launch soon!");
  }));

  /* ---------- Generic filter lists ([data-filter-list]) ---------- */
  $$("[data-filter-list]").forEach(wrap => {
    const items = $$("[data-item]", wrap), q = $("[data-filter-q]", wrap), sels = $$("[data-filter-key]", wrap), count = $("[data-filter-count]", wrap);
    const run = () => {
      const term = (q && q.value || "").toLowerCase(); let n = 0;
      items.forEach(it => {
        let show = !term || it.textContent.toLowerCase().includes(term);
        sels.forEach(s => { if (s.value && !(it.dataset[s.dataset.filterKey] || "").split(" ").includes(s.value)) show = false; });
        it.classList.toggle("hide", !show); if (show) n++;
      });
      if (count) count.textContent = n + " result" + (n === 1 ? "" : "s");
    };
    q && q.addEventListener("input", run); sels.forEach(s => s.addEventListener("change", run));
    $$("[data-chip-filter]", wrap).forEach(ch => ch.addEventListener("click", () => {
      const key = ch.dataset.chipFilter, sel = sels.find(s => s.dataset.filterKey === key);
      $$(`[data-chip-filter="${key}"]`, wrap).forEach(x => x.setAttribute("aria-pressed", String(x === ch)));
      if (sel) { sel.value = ch.dataset.value; run(); }
    }));
    run();
  });
})();
