// Cloudflare Pages Function
// Route: /sitemap.xml
// Builds the sitemap live from the "projects" table, so new/removed projects
// show up automatically — no need to hand-edit a static file.

import { neon } from '@neondatabase/serverless';

const SITE = 'https://www.carvingdezine.com';

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export async function onRequestGet(context) {
  let projectUrls = [];
  try {
    const sql = neon(context.env.DATABASE_URL);
    const rows = await sql`select id, updated_at from projects order by updated_at desc`;
    projectUrls = rows.map((r) => ({
      loc: `${SITE}/project.html?id=${encodeURIComponent(r.id)}`,
      lastmod: new Date(r.updated_at).toISOString().slice(0, 10),
    }));
  } catch (err) {
    // If the DB is briefly unreachable, still return a valid sitemap with the static pages.
    projectUrls = [];
  }

  const staticUrls = [
    { loc: `${SITE}/`, priority: '1.0' },
    { loc: `${SITE}/work.html`, priority: '0.8' },
  ];

  const urlEntries = staticUrls
    .map(
      (u) =>
        `  <url><loc>${esc(u.loc)}</loc><changefreq>weekly</changefreq><priority>${u.priority}</priority></url>`
    )
    .concat(
      projectUrls.map(
        (u) =>
          `  <url><loc>${esc(u.loc)}</loc><lastmod>${u.lastmod}</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>`
      )
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlEntries}\n</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600', // sitemaps don't need to be realtime-fresh
    },
  });
}
