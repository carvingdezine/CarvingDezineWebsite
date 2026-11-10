# Client portal: what you have, what I added, what to do

## What you already have (it all works together)

| File | What it does |
|---|---|
| `client.html` | The page a client opens. They get a private link and a 6-digit PIN, then see their files. |
| `functions/api/client-portal.js` | Public. Checks the link and the PIN and returns that one client's files. |
| `functions/api/clients.js` | Admin only. Creates, lists and deletes portal accounts, makes new PINs. |
| `001_client_portal.sql` | Creates the `clients` and `client_files` tables in your Neon database. |
| `schema.sql` | Your existing `projects` table. Not touched. |

How it flows: you create an account for a client and get a **private link** and a **PIN**. You send the link by email and the PIN by WhatsApp. The client opens the link, types the PIN, and sees the files you added. A "file" is a name plus a **Google Drive link**, so nothing is stored on your site.

## What was missing, and what I added

1. **The upload tool.** You had no way to add files to a client. It is now in your workspace: `admin.html` > **Client portal**. Create access, copy the link and PIN, add files by pasting Drive links.
2. **`functions/api/client-files.js`**, the missing admin API that the tool needs (list, add, rename, delete files).
3. **Hardening** of your existing functions (same URLs, same behaviour, safer):
   - 5 wrong PINs lock the link for 15 minutes. Before, the 6-digit PIN could be guessed.
   - PINs come from a secure random source (before: `Math.random()`).
   - The PIN is sent in the request body, not the address bar (it stays out of logs and history).
   - Only `https` links are accepted for files.
   - Server errors are no longer sent to the browser.
   - New: **issue a new link** if a link is ever shared by mistake.
   - New: the workspace shows **when the client last opened** their portal.
4. **`sql/002_portal_hardening.sql`** adds the columns for the lockout and "last opened".
5. **`client.html`** restyled to match the new site (same red, capitals, Outfit) and updated to use the safer request.

Your old `client.html` keeps working with the new function, so you can deploy in any order.

## Do this once (about 30 minutes)

1. **Database.** Open the Neon SQL editor. Run `001_client_portal.sql` if you have not already, then run `sql/002_portal_hardening.sql`. (Run the SQL BEFORE you deploy the new functions.)
2. **Files.** Copy into your repo, at the same level as `index.html`:
   - `functions/api/clients.js` (replace the old one)
   - `functions/api/client-portal.js` (replace the old one)
   - `functions/api/client-files.js` (new)
   - `client.html` (replace the old one)
3. **Check two names.** Open your existing `functions/api/projects.js`. The three portal functions assume the same two things as your first versions: the import `@neondatabase/serverless`, and the settings `DATABASE_URL` and `ADMIN_KEY`. If `projects.js` uses different names, change them in the three files. Both settings live in Cloudflare Pages > your project > Settings > Environment variables.
4. **Deploy.** Commit and push, and wait for the build.
5. **Connect the workspace.** Open `yourdomain.com/admin.html` > **Client portal**. Paste your admin key (the same `ADMIN_KEY` you use in the portfolio manager). It is saved in this browser only.
6. **Test.** Click **New portal access**, add a test file, then open the link in a private window and try a wrong PIN and the right one.

## Daily use

1. Upload the file to Google Drive. Share it: **General access > Anyone with the link**.
2. Workspace > Client portal > open the client > paste the link under **Add a file**.
3. **Copy email message** and send it. Send the PIN separately, by WhatsApp or SMS.

## Things to know

- A Google Drive "Anyone with the link" file can be opened by anyone who has that Drive link directly. The portal link and PIN protect the page, not the Drive file. For files that must stay truly private, the next step is private storage with expiring links (for example Cloudflare R2). It is a good upgrade when you are ready.
- Protect `admin.html`, `admin-portfolio.html` and `brand-centre.html` with real server login (Cloudflare Access is free for small teams). The admin key sits in your browser while you use them.
- The functions and SQL were tested against an in-memory stand-in for the database, not your live Neon database, so the first real test is step 6 above. If something fails, the workspace shows a clear message about what to check.
