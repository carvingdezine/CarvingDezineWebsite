# Carving Dezine Website: Owner's Guide (plain English)

Save this as `README.md` in the root of `D:\Github\CarvingDezineWebsite`.
This version replaces my earlier draft. I have now read your real code, so the database part is corrected: it is **Neon**, not Cloudflare D1.

---

## 1. The big picture

| Layer | Restaurant | In your project |
|---|---|---|
| **Pages** | Dining room, seen by visitors | `index.html`, `work.html`, `project.html`, `client.html`, `brand-centre.html` |
| **Workspace** | Kitchen, only you | `admin.html` (and `admin-portfolio.html`, which now lives *inside* it) |
| **Functions** | Waiter between kitchen and pantry | `functions/api/*.js` |
| **Database** | Pantry | **Neon Postgres** (a free online database) |
| **Hosting** | The building | **Cloudflare Pages**, which publishes whatever you push to GitHub |

Saving a project: workspace → `/api/projects` function → Neon. A visitor opening your Work page reads it back the same way.

---

## 2. Every file and folder, and where it goes

Everything sits in the project root unless a path says otherwise.

| Item | What it is | Touch it? |
|---|---|---|
| `index.html`, `work.html`, `project.html` | Public website | Edit with me |
| `brand-centre.html` + `assets/brand-centre/` | Brand Centre page and its 8 screenshots (keep them together) | Edit with me |
| `client.html` | Page your client opens (link + PIN) | Edit with me |
| `admin.html` | **Your workspace** | Edit with me |
| `admin-portfolio.html` | The portfolio manager. Now loads inside the workspace. Opened alone, it sends you to the workspace | Edit with me |
| `assets/site.css`, `assets/site.js` | Shared styling and animation | Leave alone |
| `functions/api/projects.js` | Saves and loads portfolio projects | Edit with me |
| `functions/api/clients.js`, `client-files.js`, `client-portal.js` | Client portal backend | Edit with me |
| `functions/api/earnings.js` | **New.** Stores your projects and payments (admin key required) | Edit with me |
| `functions/_middleware.js` | **New. Security guard.** Runs in front of every page: locks the private pages, hides private files, adds security headers | Don't edit without me |
| `functions/_session.js` | **New.** Helper that issues and checks the sign-in cookie | Don't edit |
| `functions/login.js`, `functions/logout.js` | **New.** The `/login` page and `/logout` | Don't edit |
| `assets/earnings.js` | **New.** Rules that read `Projects.xlsx`. Contains no data of yours | Leave alone |
| `functions/sitemap.xml.js` | Builds your sitemap for Google | Leave alone |
| `schema.sql`, `001_client_portal.sql`, `sql/002_portal_hardening.sql` | Database setup scripts. **Run once each** (section 4) | Don't edit |
| `package.json` | Tells Cloudflare to install the Neon library | Leave alone |
| `gsap.min.js`, `ScrambleTextPlugin.min.js` | Animation libraries | **Never edit** |
| `samples/ux-audit-sample.html` | Sample audit report | Yes |
| `og-image.jpg`, `robots.txt`, `sitemap.xml` | Link preview image and Google files | Rarely |
| `projects.json` | **Old** project list from before the database | Keep as backup |
| `PORTAL-SETUP.md`, `PROMPT-for-website-claude.md`, `README.txt` | Old notes | Keep or archive |
| `images/`, `videos/`, `audio/` | Your media (not in the zip you sent me) | Add media here |
| `.git` | Version history | **Never touch** |

**Probably unused (please don't delete yet):** the root `clients.js` and `client-portal.js` look like old copies of the functions, and a second `sitemap.xml.js` at the root differs from the one in `functions/`. No page loads them. The `website` folder was not in your zip, so I don't know what it holds.

**Rule of thumb:** new picture → `images`, new video → `videos`, new page → next to `index.html`, new server code → `functions/api`, new database script → `sql`.

---

## 3. Database or Google Drive?

They store different things.

- **Database (Neon):** small facts. Project titles, client names, PINs, link addresses, who opened what.
- **Files (PDFs, images):** big things. A database is the wrong place for them.

Your client portal stores *a note per file* in the database ("Invoice 14 lives at this Drive link"). The file itself sits in Google Drive.

| | Google Drive (now) | Private file storage such as Cloudflare R2 (later) |
|---|---|---|
| Setup | None | About an hour, once |
| Client experience | Opens a Google page | Stays on your site |
| Privacy | Anyone with the Drive link can open it | Only someone with the right PIN |

**My advice:** keep Drive for now. Move to private storage when you start sending contracts or invoices that must stay truly private. Public portfolio images never need Drive: upload them in **Add project**.

---

## 4. Connect the database (you may have done this already)

Your live site already saves projects, so most of this exists. Use the list to check.

1. **Neon:** log in at neon.tech → your project → **SQL Editor**.
2. Run each file once, in this order (open in Notepad, copy all, paste, Run):
   1. `schema.sql` (projects table)
   2. `001_client_portal.sql` (client portal tables)
   3. `sql/002_portal_hardening.sql` (PIN lockout)

   Running a file twice is safe.
3. **Cloudflare:** dash.cloudflare.com → **Workers & Pages** → your site → **Settings → Variables and Secrets**. You need exactly two:
   - `DATABASE_URL` = the Neon connection string (ends in `?sslmode=require`)
   - `ADMIN_KEY` = a password you invent, 20+ characters
4. **Sign in once:** go to `yoursite.com/admin` and enter your `ADMIN_KEY` as the password. Signing in also lets the workspace talk to your database, so there is no separate key to paste.
5. **Test:** Add project → fill the title → Save → open **Manage projects**. It should be listed.

---

## 5. Publishing a change

1. Copy the new files into `D:\Github\CarvingDezineWebsite` (same names, replace).
2. GitHub Desktop → write a message → **Commit** → **Push**.
3. Cloudflare publishes in about a minute. Press **Ctrl + Shift + R** to see it.

Before big changes, use **Portfolio backup** in the workspace and keep the download.

---

## 6. What changed in this update

**Workspace and portfolio manager are now one.** The manager is no longer a second website. It opens inside the workspace and matches its fonts, buttons, fields, colours and light/dark switch. There is no second login screen and no "Studio Admin" bar.

Menu on the left of the workspace:

| Menu item | Opens |
|---|---|
| **Clients → Client portal** | Add clients, copy link and PIN, add Drive files |
| **Portfolio → Add project** | The Add New Project form |
| **Portfolio → Manage projects** | Edit, delete, reorder |
| **Portfolio → Testimonials** | Client quotes |
| **Portfolio → Tags** | Project tags |
| **Studio → Portfolio backup** | Export and restore |
| **Studio → Site connection** | Admin key and GitHub settings |
| **Clients → Earnings** | Your income, projects and pending payments (see section 8) |

**Public pages.** Pricing is gone from the home page. **Brand Centre** is now in the top menu, the mobile menu and the footer of the home, Work and project pages, and links to `brand-centre.html`, where the options and prices now live. The home page keeps a short Brand Centre intro with the demo video and a button to the full page. The public "Studio" footer link to the admin is removed. Open your workspace at `yoursite.com/admin` (bookmark it).

One click each. Old addresses still work: `#/portfolio` goes to Manage projects, and `admin-portfolio.html` opened alone redirects to the workspace.

**YouTube demo.** On `index.html` and `brand-centre.html` it is now centred and capped at 960 px wide (16:9). To change the size, edit `--bcv-max:960px` in the `.bc-video` rule of each file.

**Changed or new files in this package:** `admin.html`, `admin-portfolio.html`, `index.html`, `brand-centre.html`, `assets/earnings.js`, `functions/api/earnings.js`, `README.md`. Everything else is untouched. Keep the folder structure: `assets/earnings.js` goes into your `assets` folder and `earnings.js` into `functions/api`.

---

## 7. Be aware

- I tested the menu, panel switching, the redirect, the Earnings page (with your real sheet) and the whole sign-in and protection layer (53 automatic checks) in a simulated setup, and the scripts pass syntax checks. **I could not test on your live site**, so the first sign-in and the first Earnings import are the real tests. I have **not seen the pages in a real browser**, so please check the look in light and dark mode.
- **Brand Centre is public, on purpose.** My earlier advice to protect `brand-centre.html` was wrong, because it is your sales page. Only the workspace and manager are private.
- The workspace's own **Clients, Leads, Tasks, Quotes and Files** pages still save in *this browser* only, not in Neon. Clearing browser data erases them. Use **Settings → Backup** until we move them to the database.

---

## 8. Earnings (from Projects.xlsx)

**First time:** workspace → **Clients → Earnings** → **Import Projects.xlsx** → choose your file. A check screen shows what was found and compares each yearly sheet with its own total. Click **Save to database**. The three database tables are created automatically, so there is **no SQL step**. It needs the same `DATABASE_URL` and `ADMIN_KEY` as the rest of the site, and your key saved in **Site connection**.

**Updating later:** edit your spreadsheet, then import it again. Each import *replaces* the stored data, so the spreadsheet stays your master copy.

**What you see:** income per year, per client, projects still waiting for payment, and a searchable list of all 1,340 projects.

**The rules (as you decided):**
- **No currency conversion.** Rupees, dollars and other currencies are never added together. Converting needs the exact rate for each payment date, which the sheet does not contain.
- **2024 onward:** exact rupee receipts from your 2024, 2025 and 2026 sheets.
- **Before 2024:** paid, not-cancelled projects from the Projects sheet, grouped by start year, in the currency recorded. If no currency was written: PayPal and Escrow payments count as dollars, and Indian clients paying by cheque, NEFT, cash or UPI count as rupees. In the older layout the amount sits in the *TDS Deduction* column.
- Rows where that column differs from *Payment Pending* are marked **check**. Please look at those 46 rows.
- Dates typed as real dates may have day and month swapped by Excel, so only the year is trusted for them.

**Two things I found in your sheet:**
- Your 2025 sheet total says ₹2,10,194.78, but the payments add up to ₹2,21,341.02. The ₹11,146.24 gap is the AYIO Healthcare payment, typed with a ₹ sign so Excel's SUM skips it. The Earnings page counts it.
- Three 2024 to 2026 payments could not be matched to a project name (Rockers letterhead, JewelSpark Ai, Modified Photgraphy). They still count in the totals, but show as "Not matched to a project" under By client.

**Privacy:** the spreadsheet holds client emails and transaction IDs. **Do not put `Projects.xlsx` in the GitHub folder.** The import never sends emails, transaction IDs or links to the database. Earnings data is only readable with your `ADMIN_KEY`.

---

## 9. Security: what was wrong and what protects you now

**What was wrong.** The footer "Studio" link on every page opened `admin.html` straight away. The page had no login, anyone could open it, and the old manager password (`carving2024`) was written in plain text in the page's code. Passwords checked in the browser are not real security: anyone can read them.

**What protects you now**
1. **One password, checked on the server.** Your `ADMIN_KEY` is now the single password for the workspace, the portfolio manager and the database. Without it the server sends nobody into `/admin` or `/admin-portfolio`, so the pages themselves are never delivered. The old `carving2024` no longer works anywhere.
2. **Signed cookie.** After a correct password the server gives your browser a cookie that the website's scripts cannot read, that only works on your site, and that cannot be forged without your key. It lasts 8 hours, or 30 days if you tick "Keep me signed in". **Sign out** is at the top right of the workspace.
3. **Guessing is slowed down.** Each wrong password waits about a second, and the comparison cannot be timed.
4. **Private files are invisible.** These now answer "404 Not found" to the public: all `.sql` and `.md` files, `package.json`, `projects.json`, `README.txt`, the root `clients.js`, `client-portal.js` and `sitemap.xml.js`, and the `functions`, `sql` and `.git` folders. Before this, anyone could download your database layout and setup notes.
5. **Browser security headers** on every page: no embedding of your site in other sites (clickjacking), no content-type guessing, a strict referrer policy, camera/microphone/location switched off, HTTPS enforced.
6. **Search engines are told to skip** the private pages (`robots.txt` and a "noindex" header). The admin key comparison in `projects.js` is now timing-safe too.
7. **If `ADMIN_KEY` is missing the doors stay locked** instead of opening.

**Do these in this order**
1. In Cloudflare check that `ADMIN_KEY` exists (Settings → Variables and Secrets). **Because the old admin page was public, set a new one now:** 20 or more random characters, saved in a password manager. Save and redeploy.
2. Push the new files (section 5), then open `yoursite.com/admin`. You should see the sign-in page. Enter the new `ADMIN_KEY`.
3. Test from a private/incognito window: `yoursite.com/admin.html` must send you to the sign-in page, and `yoursite.com/schema.sql` must say Not found.
4. **Rate limit sign-in attempts:** Cloudflare → your domain → Security → WAF → Rate limiting rules → Create. Match: URI Path equals `/login`. Choose the strictest limit the free plan allows (for example 5 requests per 10 seconds) and Block.
5. Turn on **Bot Fight Mode** (Security → Bots) and, under SSL/TLS → Edge Certificates, **Always Use HTTPS** and **Minimum TLS 1.2**.
6. **Two-step verification** on GitHub, Cloudflare, Neon, your Google account and your domain registrar. Most real-world hacks start by taking over one of these accounts.
7. Make the GitHub repository **Private** and check that no password or database address was ever typed into a file. Secrets belong only in Cloudflare's Variables.
8. Keep a monthly **Portfolio backup** download, and a copy of `Projects.xlsx` somewhere private (not in the repository).

**Not covered yet, honestly**
- There is no full Content-Security-Policy, because the site relies on scripts written inside the pages. Adding one safely needs a careful rewrite and testing in a real browser.
- After sign-in your key is also kept in this browser's storage so the workspace can call your database. Do not sign in on a shared or public computer, and use **Sign out** when you finish.
- The public contact and audit forms send visitor input to your own services. I have not reviewed where they deliver, so tell me if you want that checked.
- If you want shorter, human passwords later, the right upgrade is Cloudflare Access (free, adds email codes or Google sign-in in front of everything). I can set that up next.

---

## 10. If something breaks

- **Locked out / "Incorrect password":** the password is exactly your `ADMIN_KEY` from Cloudflare. If it is lost, set a new `ADMIN_KEY` there, redeploy, and use the new one.
- **"Sign-in is not set up":** `ADMIN_KEY` is missing in Cloudflare.
- **Blank panel in the workspace:** press F12 → Console and screenshot it.
- **"Unauthorized" when saving:** the key in **Site connection** doesn't match `ADMIN_KEY` in Cloudflare.
- **Change not visible:** Ctrl + Shift + R, then confirm the push finished.
- **Never delete** `.git`, `functions`, `sql` or `assets` without asking.
