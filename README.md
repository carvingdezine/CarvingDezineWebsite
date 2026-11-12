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
4. **Tell the workspace your key:** workspace → **Site connection** → paste the same `ADMIN_KEY` → **Save** → **Test Connection**. The key is stored in this browser only.
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

One click each. Old addresses still work: `#/portfolio` goes to Manage projects, and `admin-portfolio.html` opened alone redirects to the workspace.

**YouTube demo.** On `index.html` and `brand-centre.html` it is now centred and capped at 960 px wide (16:9). To change the size, edit `--bcv-max:960px` in the `.bc-video` rule of each file.

**Changed files in this package:** `admin.html`, `admin-portfolio.html`, `index.html`, `brand-centre.html`, `README.md`. Everything else is untouched.

---

## 7. Be aware

- I tested the menu, panel switching, automatic entry and the redirect in a simulated browser, and the scripts pass syntax checks. **I have not seen the pages in a real browser**, so please check the look in light and dark mode and tell me what feels off.
- The workspace page has no server login. Saving projects needs your `ADMIN_KEY`, but anyone who finds `/admin.html` can open the screens. Protect `admin.html`, `admin-portfolio.html` and `brand-centre.html` with **Cloudflare Access** (free): Zero Trust → Access → Applications → add your domain with those paths.
- The old manager password inside `admin-portfolio.html` is checked in the browser and is not real security. Inside the workspace it is skipped automatically.
- The workspace's own **Clients, Leads, Tasks, Quotes and Files** pages still save in *this browser* only, not in Neon. Clearing browser data erases them. Use **Settings → Backup** until we move them to the database.

---

## 8. Still to do: projects and earnings from your PDF

Not started, because the PDF was not in the upload. Send it and I will turn it into an **Earnings** page in the workspace: total, by year, by client, paid versus pending. It will be stored in Neon so it survives clearing your browser.

---

## 9. If something breaks

- **Blank panel in the workspace:** press F12 → Console and screenshot it.
- **"Unauthorized" when saving:** the key in **Site connection** doesn't match `ADMIN_KEY` in Cloudflare.
- **Change not visible:** Ctrl + Shift + R, then confirm the push finished.
- **Never delete** `.git`, `functions`, `sql` or `assets` without asking.
