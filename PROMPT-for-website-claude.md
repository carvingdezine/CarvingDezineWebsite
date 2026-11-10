# Prompt: add the Brand Centre page to carvingdezine.com

I'm attaching `brand-centre.html`, a finished, self-contained landing page for my Brand Centre product (inline CSS and JS, images embedded; it only loads Google Fonts). It uses the same visual language as my site (black, #ff2a2a red, Outfit, DM Mono, white panels, italic red emphasis). Please add it to the site without changing its copy or prices.

1. **Place the file** at the site root as `brand-centre.html`. Keep it as a standalone page for now. If you want to refactor it onto `assets/site.css` and `assets/site.js` for consistency, do that only if the result looks identical, and tell me what changed.
2. **Link to it from index.html.**
   - In the `#brand-centre` section, add a button after the tier cards, or beside the intro: "See how it works" linking to `brand-centre.html` (style it as `cd-btn cd-btn-outline`).
   - In the footer "Studio" list, change the Brand Centre link to `brand-centre.html`.
   - Keep the section's existing tiers, prices, currency switch and FAQ as they are.
3. **Make `?plan=` work on the contact form.** The new page links to `index.html?plan=Brand%20Centre%20-%20Starter#contact` (also `- Essential`, `- Complete`, `- Custom`, and plain `Brand Centre`). On load, if a `plan` query parameter is present, select or prefill that plan in the contact form exactly as clicking a `data-plan` link does today, then scroll to `#contact`.
4. **Demo video.** Both pages have a demo placeholder. On the new page it is `<button id="video" data-youtube="">`. When I give you the YouTube link, paste it into `data-youtube` there and into `#bc-video` on index.html. Don't change anything else.
5. **SEO and housekeeping.** Add `brand-centre.html` to sitemap.xml, check the canonical and og:url, and make sure the page's nav links (work.html, index.html#services, #audit, #contact) resolve.
6. **Check** at 390, 768 and 1440 px: no horizontal scroll, the currency toggle switches all three prices and the update price, the "What's inside" tabs swap the screenshot, and every CTA lands on the contact form with the right plan.

7. **Brand name.** The studio name is always written CARVINGDEZINE, one word in capitals, in Outfit. `brand-centre.html` already does this. Please apply the same to index.html and work.html: nav logo text, footer, page titles, meta and og tags, alt text and body copy (currently "Carving Dezine"). Keep the email address and domain lowercase.

Do not change prices: Starter ₹49,000 / $1,200, Essential ₹99,000 / $2,400, Complete ₹1,79,000 / $4,200, updates ₹15,000 / $300 a year.

---
## UPDATE: brand-centre.html is now the cinematic version
- Upload `brand-centre.html` AND the folder `assets/brand-centre/` (6 hi-res JPGs: home, colour, social, print, aikit, package) to the site root. Paths are relative.
- The page re-creates the index engine: fixed `#bg-nodes` canvas that pulls into the "d" logo, hero parallax, pinned 4-beat scene, red curtain panel ("A guideline is read once. A Brand Centre is used daily."), horizontal sticky "What's inside", 4-step interactive stepper, plan chooser and India/International price toggle. All headings are uppercase. No new tokens were invented.
- If index.html already has its own `CDNodes`/scroll engine, keep this page's inline copy as is; do not merge.
- Demo video: paste the YouTube link into `data-youtube=""` on `#bc-video`.
- Name is always CARVINGDEZINE.
