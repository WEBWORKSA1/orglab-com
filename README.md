# OrgLab.com: The Organic Lab

A static website for independent organic testing, free tools and organic-certification lead generation. It runs on the **GitHub Pages free plan**: no server, no database, no paid services.

**Live (GitHub Pages):** https://webworksa1.github.io/orglab-com/
**Domain:** orglab.com (see "Custom domain" below)
**Strategy & build prompt:** [PROMPT.md](PROMPT.md)

## What's inside

| Area | Pages |
|---|---|
| Lead-gen engine | `get-certified.html`: 5-step quote funnel with lead scoring, UTM capture, instant estimate, partner (B2B) form; exit-intent lead magnet (`guide.html`) |
| Tools (9) | Pesticide residue guide, ingredient checker, label decoder, certification cost estimator, cost-share checker, transition ROI, budget planner, planting calendar, compost C:N mixer |
| Content | Learn hub + 6 cited pillar guides, lab reports (demo dataset), videos (lite YouTube embeds) |
| Monetization | AdSense slots (auto-activate), donations & memberships, advertise/media-kit page, featured directory listings, affiliate disclosure |
| Community | Contests (countdown, entry form, rules), careers (roles + talent pool), organic directory (listing form) |
| Trust & legal | About + testing methodology, privacy (GDPR/CCPA/PIPEDA), terms, disclaimer, cookie consent (Google Consent Mode v2) |
| SEO | Per-page meta/OG, JSON-LD (Organization, WebSite, Breadcrumb, Article, FAQ, HowTo, Event), sitemap.xml, robots.txt, search index, 404 |

## Turn on monetization (edit ONE file: `assets/js/config.js`)

1. **Forms and leads:** create a free [Formspree](https://formspree.io) form (or [Web3Forms](https://web3forms.com), or a Google Apps Script that writes to a Google Sheet) and paste its URL into `formEndpoint`. Until you do, forms run in demo mode: submissions are saved only in the visitor's own browser.
2. **AdSense:** once you're approved, set `adsenseClient: "ca-pub-…"` and replace the placeholder publisher ID in `ads.txt`. Ad slots appear automatically. To preview the slots before approval, add `?ads=preview` to any URL.
3. **Donations:** paste Stripe Payment Links, PayPal, Buy Me a Coffee, GitHub Sponsors or Patreon URLs. Buttons whose link is empty stay hidden.
4. **Analytics:** set `ga4Id`.
5. **YouTube and social:** channel and profile URLs. Social icons stay hidden until you set them.
6. **Calendly or Cal.com:** set `bookingUrl` to show a "book a call" button after a lead converts.

## Editing and adding pages

GitHub Pages builds the site automatically with Jekyll on every commit. You don't need any build step, and you can edit straight on github.com.

- **Page content** lives in `_src/pages/…` (header and footer in `_src/partials/`).
- **Routes** are small front-matter files at the root (`index.html`, `tools/*.html`, `learn/*.html` …) holding the title, description and `src:` pointer. The shared layout is `_layouts/default.html`.
- **To add a page:** create `_src/pages/new-page.html` (start the body with `<main id="main">`), then add a root file `new-page.html` like this:

```yaml
---
layout: default
title: "Page title | OrgLab"
description: "Meta description"
src: pages/new-page.html
scripts: tools   # optional: loads the tool scripts
exit: true       # optional: exit-intent lead magnet
---
```

Use `{{BASE}}` in front of internal links, for example `{{BASE}}tools/index.html`. `sitemap.xml` and `data/search-index.json` regenerate automatically. To add tool data (produce, labels, ingredients, videos, lab reports), edit `assets/js/data.js`.

## Hosting on GitHub Pages (free)

Settings → Pages → Build and deployment → Source: **Deploy from a branch** → Branch: `main`, folder `/ (root)` → Save. The site goes live at https://webworksa1.github.io/orglab-com/ within about a minute.

### Custom domain (orglab.com)

1. In Settings → Pages → Custom domain, enter `orglab.com`. In `_config.yml`, set `url: "https://orglab.com"` and `baseurl: ""`.
2. Set these DNS records at your registrar:
   - `A` records for `@`: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - `CNAME` for `www`: `webworksa1.github.io`
3. Tick **Enforce HTTPS** in Settings → Pages.

Canonical URLs and the sitemap follow `url` and `baseurl` in `_config.yml`.

## Before launch: honesty checklist

- The lab reports and directory listings are clearly labelled **sample/example data**. Replace them with real results and listings.
- Add a credentialed reviewer (RD, agronomist) to article bylines to strengthen E-E-A-T.
- Have the contest rules and privacy policy reviewed for each jurisdiction you market to.
- For EEA/UK visitors, use a Google-certified CMP alongside AdSense.
- Upload a 1200×630 PNG as `assets/img/og.png` and add an `og:image` tag in `_layouts/default.html` so social shares show a preview image.
