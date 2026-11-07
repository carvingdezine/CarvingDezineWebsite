CARVING DEZINE SITE - how to put it online
==========================================
Keep this exact folder structure. Every page needs the assets/ folder beside it.

  index.html                      public home page
  work.html                       all work
  project.html                    one project (opened from a card)
  samples/ux-audit-sample.html    sample audit
  admin.html                      YOUR ADMIN PANEL (your existing admin, now on its own page)
  assets/site.css  assets/site.js
  audio/ambient-piano.mp3         <- your existing audio folder
  images/...                      <- your existing images folder

ADMIN
Open  yourdomain.com/admin.html  and log in as before. It is not linked from the menu and is set to noindex.
Your old index.html is no longer needed online (keep a copy as a backup).
Projects live behind /api/projects, so they appear on the live site, not when a file is opened from a folder.

BRAND CENTRE DEMO VIDEO
Open index.html, search for  data-youtube=""  and paste your YouTube link between the quotes.

If a page looks unstyled, the assets/ folder is not next to it.
