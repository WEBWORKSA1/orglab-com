# OrgLab.com: Concept and Phase-by-Phase Build Prompt

## 1. The concept

**OrgLab = "The Organic Lab."** It is an independent site that tests organic claims and helps people and businesses act on the results:

- **For consumers:** test data, calculators and label decoders that answer "is this organic claim real, and is it worth paying for?"
- **For farms and brands (B2B):** a quote-matching funnel for organic certification and lab testing. This is where most of the money is.

### Why this beats the other options

| Option | Traffic potential | RPM / lead value | Moat | Verdict |
|---|---|---|---|---|
| Organic recipes blog | High | Low ($5–10 RPM) | None; the space is crowded | Reject |
| Organic gardening blog | High | Medium ($8–15 RPM) | Weak | Include as a traffic pillar only |
| Organic product e-commerce | Medium | Thin margins, needs stock | Weak | Reject |
| **Organic testing + tools + certification leads** | High (tools and lists earn links) | AdSense $10–25 RPM, plus B2B leads at **$50–$300 each** | Proprietary tools and data, and the "Lab" brand fits the domain | **Chosen** |

**The core insight:** certification is a paperwork-heavy process that farms and brands pay thousands of dollars to get through. Certifiers typically charge a $350 application fee, hourly inspections, and an annual fee that grows with sales; expediting costs $2,000–4,000. Nobody in the space owns the question "how much will certification cost me, and who should do it?" OrgLab answers it with a free estimator, then passes the qualified lead to certifiers, consultants and labs.

### Revenue model at month 18 (assumptions stated; scale linearly)

| Stream | Assumption | Monthly revenue |
|---|---|---|
| Display ads (AdSense, then Mediavine or Raptive) | 150k pageviews × $12 RPM | ~$1,800 |
| Certification and testing leads | 20k tool users × 1.2% conversion × $90 per lead | ~$21,600 |
| Affiliate (test kits, organic grocery, seeds) | 30k clicks × 4% conversion × $6 per sale | ~$7,200 |
| Sponsorships (newsletter, contests, featured directory listings) | 3 deals × $800 | ~$2,400 |
| Memberships and donations | 250 supporters × $9 average | ~$2,250 |
| YouTube (own channel, embedded on the site) | 100k views × $6 RPM | ~$600 |

**The lesson from this table:** ads alone won't get you there. Leads are about 60% of the upside, so every page must feed the certification and testing funnel.

### What we learned from 30 benchmark sites

We reviewed EWG, OTA, USDA NOP, Rodale Institute, Organic Consumers Association, Cornucopia, CCOF, Oregon Tilth, QAI/NSF, Ecocert, Soil Association, IFOAM, OrganicFacts, Thrive Market, Labdoor, ConsumerLab, Clean Label Project, Non-GMO Project, Organic Prepper, Organic Authority, Gardener's Path, Epic Gardening, Mother Earth News, LocalHarvest, The Organic Center, Healthline, iHerb, GrowVeg, MOFGA and ABC Organic Gardener. Six patterns stood out:

- **Annual lists that make news.** EWG's Dirty Dozen is the model. They earn backlinks every year.
- **Lookups and calculators.** Oregon Tilth's fee calculator, Ecocert's eQuote, EWG's water search by ZIP and LocalHarvest's ZIP directory all bring people back.
- **Lab-tested rankings.** Labdoor and ConsumerLab pair affiliate links with a paywall. The trust comes from publishing the method and buying products at retail.
- **Tiered membership.** Soil Association charges £5/£8/£10 a month. MOFGA runs $5/$40/$60/$100 levels. ConsumerLab charges $75 for 1 year or $125 for 2.
- **E-E-A-T signals.** Credentialed authors, a named reviewer, 30+ citations, an "evidence based" badge, updated dates, a corrections policy and disclosures.
- **Lead forms built around the operation.** Operation type, gross organic sales, acreage, standards wanted, number of sites, timeline, current certifier.

---

## 2. The build prompt, in phases

> Paste one phase at a time into your AI coding assistant, or give it to a developer. Every phase ends with a deliverable you can ship.

### PHASE 0: Foundation and brand
```
Build the foundation for OrgLab.com ("The Organic Lab"), a static, GitHub Pages-hostable site (free plan: no server code, no database).
- Stack: semantic HTML5, one design-token CSS file, vanilla JS, and a data file for the tools. Use GitHub Pages' built-in Jekyll: a shared layout (_layouts/default.html) plus header and footer partials, with each page's front matter holding its title, description and schema type. Everything must work with JavaScript disabled, except the interactive tools.
- Brand: deep lab green #0E3B2E, chlorophyll lime #B7E35A, cream #F7F5EE, ink #13201B. Fonts: Fraunces for display, Inter for UI. Motif: a lab-grid background with a "test tube leaf" logo mark in SVG.
- Include: light/dark mode (prefers-color-scheme plus a toggle), a mobile-first layout at 360px with no horizontal scroll, a skip link, visible focus rings, WCAG AA contrast, and prefers-reduced-motion support.
- Include a global config file (assets/js/config.js) holding the AdSense publisher ID, the form endpoint (Formspree/Web3Forms), donation links (Stripe Payment Links, PayPal, Buy Me a Coffee, GitHub Sponsors), YouTube channel ID and GA4 ID, so the owner can switch monetization on without touching the code.
```

### PHASE 1: Core pages and navigation
```
Create these pages: Home, Lab Reports, Tools hub, Get Certified (lead gen), Learn hub plus pillar articles, Videos, Organic Directory, Contests, Support Us, Careers, Advertise & Partner, About (with editorial and testing methodology), Contact, Privacy, Terms, Disclaimer & Affiliate Disclosure, 404.
- Header: a sticky mega-menu (Test | Tools | Learn | Community | Get Certified [CTA button]), search opened with Ctrl+K, and a theme toggle. On mobile: a drawer menu.
- Footer: a newsletter form with a lead magnet ("Free Organic Certification Roadmap PDF"), a 4-column sitemap, a trust strip, social icons, and legal links.
- Home, in order: a hero with a value prop plus 2 CTAs (Check a label / Get a certification quote), a "Lab Stats" counter strip, a Residue Risk quick-checker widget, a featured tools grid, latest lab reports, a certification lead band, a videos row, a contest teaser, a support band, and the newsletter.
```

### PHASE 2: Interactive tools (traffic engines)
```
Build these client-side tools, each with its data in one editable data file, a shareable URL (state in the query string), a "copy result" button, an FAQ, HowTo/FAQ schema, and an in-content ad slot below the result:
1. Pesticide Residue Risk Checker: search produce and get a High/Moderate/Low risk rating, a "buy organic?" verdict, and a printable shopping list.
2. Organic Label Decoder: 15+ labels (USDA Organic, "Made with Organic", Non-GMO Project, Regenerative Organic Certified, Certified Naturally Grown, Demeter, COSMOS, GOTS, Fair Trade, Grass-fed, "Natural"…) with a strictness score, and a side-by-side comparison of any two.
3. Ingredient Checker: paste an ingredient list and flag each ingredient as prohibited in USDA organic, allowed with restrictions, or allowed/natural, with an explanation for each flag.
4. Certification Cost Estimator (lead magnet): operation type, gross organic sales, sites and add-on standards give a low-to-high cost range, minus a cost-share estimate, with a CTA to "Get 3 matched quotes".
5. Organic Budget Planner: weekly produce spend and organic premium give the cost of all-organic versus "smart organic" (organic only for high-risk items), and the saving.
6. Planting Calendar: pick a USDA zone or enter a last-frost date to get sowing and transplant windows for 30 crops.
7. Compost C:N Ratio Mixer: add materials and quantities to get the blended C:N ratio against the 25–35:1 target.
8. Transition-to-Organic ROI calculator for farms: acres, yield, price, organic premium, yield drag and a 36-month transition give the payback year. CTA to the lead form.
9. Cost-Share Reimbursement Checker.
```

### PHASE 3: Lead-generation engine (the profit center)
```
Build Get Certified as a high-converting funnel:
- Hero: "Get certified organic without the guesswork. Compare 3 accredited certifiers & consultants — free."
- A multi-step form (progress bar, 5 steps, the answers from one step unlock the next, auto-save to localStorage):
  1) Who are you (farm / processor-handler / brand-private label / retailer-restaurant / cosmetics / lab testing only)
  2) Operation details (products, acres or head of livestock, number of sites, state/province/country)
  3) Standards (USDA NOP, Canada COR, EU, COSMOS, GOTS, Non-GMO Project, Regenerative Organic, Lab testing)
  4) Timeline and budget (ASAP / 3 / 6 / 12 months; gross organic sales band; currently certified?)
  5) Contact (name, company, email, phone, preferred contact method, consent checkbox), then the thank-you screen with the next steps and a calendar-booking CTA
- Also: an instant cost estimate on the thank-you step, lead scoring (sales band × timeline + standards count) sent as a hidden field, UTM and referrer capture, a honeypot plus time-trap spam protection, and a submission to the endpoint in config.js (Formspree/Web3Forms/Google Apps Script → Google Sheet).
- Supporting sections: 10-step certification guide, certifier comparison table, cost breakdown, cost-share explainer, FAQ (schema), a sticky mobile CTA, an exit-intent modal offering the free Roadmap, and a "For certifiers & labs: become a partner" B2B form.
- Secondary lead forms: "Test my product" (brands to the lab network), "List my farm" (directory), "Advertise with us".
```

### PHASE 4: Monetization layer
```
- AdSense: load it once with the publisher ID from config (skip loading if the ID is empty). Use responsive ad slots: header leaderboard, in-content, sidebar sticky on desktop. Reserve min-height for each slot so the layout doesn't shift (CLS < 0.1). Add ads.txt, and a cookie consent banner that sets Google Consent Mode v2 defaults (use a Google-certified CMP for EEA/UK traffic).
- YouTube: a lite-embed component (thumbnail → iframe on click, youtube-nocookie) for fast pages, a videos page with category filters, and a channel subscribe CTA.
- Affiliate: disclosure page, rel="sponsored nofollow" on links, and a "Where to buy" block on lab reports.
- Support Us: a one-time or monthly toggle, amount chips ($5/$10/$25/$50/$100/custom), 3 membership tiers (Seedling $5/mo, Grower $12/mo, Lab Partner $29/mo) with perks, a funding-goal progress bar, a "where your money goes" breakdown (testing / content / hiring / operations / prizes / promotion), a supporter wall, and other ways to help. State plainly that contributions are not tax-deductible unless a nonprofit entity exists.
- Advertise & Partner: media kit stats, packages (newsletter sponsor, contest sponsor, featured listing, category sponsorship, video integration, lead partner), a rule that lab results are never for sale, and an inquiry form.
```

### PHASE 5: Community, contests and hiring
```
- Contests: an active contest with a countdown timer, prizes, rules, eligibility, judging criteria, and an entry form (name, email, category, photo/video link, story, consent). Also a sponsor slot and an "Official Rules" section (no purchase necessary, void where prohibited).
- Careers: open roles (Nutrition Writer, Garden Editor, Video Producer, Lab Partnerships Manager, Community Manager, Campus Ambassadors), a talent-pool form (name, email, role, portfolio URL, availability, rate, cover note), and a benefits and remote-first culture section.
- Directory: farms, CSAs, markets and co-ops with filters (type, region), "Featured" paid placement, and a "List your farm" form (free vs featured).
- Newsletter: a weekly "Lab Notes" issue, with a printable lead-magnet roadmap delivered through the thank-you page.
```

### PHASE 6: SEO, E-E-A-T, performance
```
- Unique title and meta description, canonical, Open Graph and Twitter tags on every page. JSON-LD: Organization, WebSite, BreadcrumbList, Article, FAQPage, HowTo, Event (contests).
- sitemap.xml (jekyll-sitemap), robots.txt, a site search index (JSON) generated at build time, and internal linking blocks ("Related tools", "Related guides").
- E-E-A-T: author boxes, a published testing methodology, a corrections policy, updated dates, and cited sources.
- Performance: no frameworks, deferred JS, system-font fallback, preconnect to fonts, SVG icons, click-to-load videos. Target Lighthouse scores of 95+ for performance, SEO and accessibility.
```

### PHASE 7: Deploy and scale
```
- Push to GitHub (webworksa1/orglab-com), publish via GitHub Pages (free plan, public repo, Deploy from branch: main / root), then add the custom domain orglab.com: DNS A records to 185.199.108–111.153, a www CNAME to webworksa1.github.io, set url/baseurl in _config.yml, then enforce HTTPS.
- Content engine: publish 3 articles a week across the topic clusters (organic vs conventional, pesticides and contaminants, labels, lab tests, gardening, certification). Update the Residue list every year for a PR push.
- Scale path: at 50k sessions/month move from AdSense to Mediavine Journey or Raptive. Sell the lead flow to certifiers on a per-lead or monthly-retainer basis. Add a paid "Lab Pro" tier with full test data.
```
