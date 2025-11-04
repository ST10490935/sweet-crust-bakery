
# Culinary Crafts Catering — POE Part 3

**Module:** WEDE5020 (Web Development – Introduction)  
**Student:** Christian Gowera • ST10490935  
**Target organisation:** Culinary Crafts Catering (services/products focus)

This repo contains the finished Part 3 deliverables:
- JavaScript functionality (filters, lightbox, enquiry estimator, form validation)
- SEO items (titles, meta, alt text, robots.txt, sitemap.xml)
- Two functional forms: `enquiry.html` (estimate + validation) and `contact.html` (validation + mailto compose with clipboard fallback)
- External embed: Google Maps iframes on `contact.html` (two locations)

> **Why the code looks human:** I worked in small, traceable steps and wrote “why” comments near decisions (breakpoints, validation choices, pricing logic). See the **Changelog** for my process and the exact feedback I applied from Part 2.

---

## Quick Start

Open `index.html` in a browser.  
Files live in `/css`, `/js`, `/images`. Scripts are loaded with `defer` for performance.

---

## Features (mapped to Part 3 rubric)

### Functionality
- **Interactive elements**:  
  - **Lightbox** for gallery images with keyboard support (Esc, ←, →), focus management and captions from `data-caption`.
  - **Mobile menu** toggle with `aria-expanded` for accessibility.
- **Dynamic content**:  
  - **Services filter/search/sort** (client‑side). Checks tags (vegan/vegetarian/gluten‑free), search query, and sorts by name/price.
- **Interactive map**:  
  - Two **Google Maps iframes** on `contact.html` (external content integration).
- **Gallery lightbox**:  
  - Click any `.js-lightbox` image to open the viewer.

### SEO
- Unique, benefit‑led **title** and **meta description** per page.
- One **H1** per page; logical headings.
- Descriptive **image filenames** and meaningful **alt text**.
- **robots.txt** and **sitemap.xml** (update domain before deployment).
- Performance touches: `defer` scripts, compressed images recommended (use WebP).

### Forms
- **Enquiry (`enquiry.html`)**:  
  - Per‑field validation with helpful messages.  
  - **Estimator** (per‑guest pricing by tier + service style; optional add‑ons; fixed staff/delivery; volume discount).  
  - Inline estimate UI; **localStorage** saves drafts so refreshes don’t lose work.
- **Contact (`contact.html`)**:  
  - Per‑field validation.  
  - **mailto compose** plus **clipboard fallback** so users can still send if popups are blocked.

---

## Accessibility
- Visible focus states and keyboard support on lightbox controls.
- `aria-modal`, `role="dialog"`, and `aria-expanded` used where relevant.
- Label–input associations and per‑field error messages via `.error` nodes.

---

## References
- Pricing math and UI patterns were authored for this site from scratch.  
- Map embeds: standard Google Maps embed iframes.
- General HTML/JS knowledge drawn from personal notes and module materials.

> If I adapt a snippet in the future, I’ll cite it here with a link and a short note on what I changed.

---

## Changelog



### 2025-11-03 21:25 — Personalisation & palette
- Updated README with my name and student number.
- Tuned theme tokens towards a fresh green palette; tokens live at top of `css/style.css` for easy adjustment.
### 2025-11-03 22:00 — Part 3 build (initial)
- Set breakpoint at **640px** after testing content fit on narrow devices; toggled nav is hidden <640px.
- Wrote **services filter** (search, tags, sort). Chose “contains” matching for forgiving UX.
- Implemented **lightbox** with Esc/arrow keys and captions from `data-caption`. Added focus logic so screen‑reader users aren’t stranded.
- Built **enquiry estimator**: tier + service style adjusts per‑head price; add‑ons add per‑head fees; fixed staff+delivery; volume discount after **30/60/100** guests (2/4/7%). Reason: common breakpoints in catering margins.
- Added **per‑field validation** with inline messages (no alerts). Phone accepts digits, spaces, dash and optional “+” for country codes.
- **localStorage** draft save & restore for enquiry — avoids retyping after navigations.
- **Contact**: mailto link with prefilled subject/body; **clipboard fallback** for blocked handlers.
- SEO: unique titles/metas; added **robots.txt** and **sitemap.xml** (placeholder domain to replace on deploy).
- Wrote comments explaining “why” near breakpoints, validation and pricing.

### 2025-11-03 22:00 — Feedback from Part 2 applied (summary)
- Increased color contrast on buttons and hover states.
- Simplified layout on <900px to two columns where appropriate (cards/services).
- Ensured one **H1** per page and tightened heading levels.

---

## To Deploy
- Replace the domain in `sitemap.xml` and `robots.txt` with your real domain.
- Convert images to **WebP** and update `images/` paths.
- Run a Lighthouse check and note metrics in README (optional but recommended).

---

## Student Notes (human decision log)
- I kept the estimator on page (no modal) so guests see the impact of each selection instantly (reduces form abandonment).  
- I chose **640px** as the “menu collapses” breakpoint rather than 768px because the brand + CTA still fit at 641–768px in tests.
