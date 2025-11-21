/**
 * Sapana Full Auto Indexing Engine v3
 * -----------------------------------
 * ✔ Auto-scan all HTML files in project
 * ✔ Generate sitemap.xml
 * ✔ Generate rss.xml
 * ✔ Generate news-sitemap.xml
 * ✔ Submit all URLs to IndexNow
 * ✔ Ping Google with sitemap
 *
 * Runs once on each Cloudflare Pages deploy.
 * Requires Node 18+ (for global fetch).
 */

import { readdirSync, writeFileSync, statSync } from "fs";
import { join, resolve } from "path";

const DOMAIN = "https://sapanacyberhub.in";
const INDEXNOW_KEY = "c92b83f1bb827d0e1a8f822ce732ae32";

// Folders to ignore while scanning
const IGNORE_DIRS = ["node_modules", ".git", ".github", "dist", "build", ".next"];

// Recursively scan for .html files
function scanFolder(folderPath) {
  const entries = readdirSync(folderPath);
  let urls = [];

  for (const entry of entries) {
    const fullPath = join(folderPath, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      if (IGNORE_DIRS.includes(entry)) continue;
      urls = urls.concat(scanFolder(fullPath));
    } else if (entry.endsWith(".html")) {
      const rel = fullPath.replace(process.cwd(), "").replace(/\\/g, "/");
      const url = `${DOMAIN}${rel.startsWith("/") ? "" : "/"}${rel}`;
      urls.push({ url, mtime: stats.mtime });
    }
  }

  return urls;
}

// Nice title from filename (fallback)
function prettyTitleFromUrl(url) {
  const part = url.split("/").pop() || "";
  const file = part.replace(".html", "").replace(".htm", "");
  if (!file || file === "index") return "SapanaCyberHub";

  return file
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// Generate sitemap.xml
function generateSitemap(pages) {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  for (const { url } of pages) {
    xml += `  <url>
    <loc>${url}</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>\n`;
  }

  xml += `</urlset>\n`;

  writeFileSync("sitemap.xml", xml);
  console.log("✅ sitemap.xml generated");
}

// Generate rss.xml
function generateRSS(pages) {
  const now = new Date().toUTCString();

  let rss = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  rss += `<rss version="2.0">
<channel>
  <title>SapanaCyberHub — Latest Blogs</title>
  <link>${DOMAIN}/</link>
  <description>Cyber help, Android tricks, WhatsApp secrets, AI tools and tech learning from SapanaCyberHub.</description>
  <language>en</language>
  <lastBuildDate>${now}</lastBuildDate>\n`;

  // Sort by modified date (latest first)
  const sorted = [...pages].sort((a, b) => b.mtime - a.mtime);

  for (const { url, mtime } of sorted) {
    const title = prettyTitleFromUrl(url);
    const pubDate = new Date(mtime).toUTCString();

    rss += `  <item>
    <title>${title}</title>
    <link>${url}</link>
    <guid>${url}</guid>
    <pubDate>${pubDate}</pubDate>
  </item>\n`;
  }

  rss += `</channel>\n</rss>\n`;

  writeFileSync("rss.xml", rss);
  console.log("✅ rss.xml generated");
}

// Generate news-sitemap.xml
function generateNewsSitemap(pages) {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
    xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n`;

  const now = new Date();
  const cutoff = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000); // last 2 days only (Google News style)

  for (const { url, mtime } of pages) {
    if (mtime < cutoff) continue; // include only recent pages

    const title = prettyTitleFromUrl(url);
    const pubDate = mtime.toISOString();

    xml += `  <url>
    <loc>${url}</loc>
    <news:news>
      <news:publication>
        <news:name>SapanaCyberHub</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${title}</news:title>
    </news:news>
  </url>\n`;
  }

  xml += `</urlset>\n`;

  writeFileSync("news-sitemap.xml", xml);
  console.log("✅ news-sitemap.xml generated");
}

// Submit URLs to IndexNow (batch)
async function submitToIndexNow(pages) {
  const urls = pages.map((p) => p.url);

  const payload = {
    host: "sapanacyberhub.in",
    key: INDEXNOW_KEY,
    keyLocation: `${DOMAIN}/indexnow.txt`,
    urlList: urls
  };

  const endpoint = "https://api.indexnow.org/indexnow";

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  console.log("✅ IndexNow submitted:", urls.length, "URLs. Status:", res.status);
}

// Ping Google with sitemap
async function pingGoogle() {
  const pingURL = `https://www.google.com/ping?sitemap=${DOMAIN}/sitemap.xml`;
  const res = await fetch(pingURL);
  console.log("✅ Google ping sent. Status:", res.status);
}

// MAIN
(async () => {
  console.log("🔍 Scanning project for HTML files...");
  const root = resolve(".");
  const pages = scanFolder(root);

  console.log(`📄 Found ${pages.length} HTML pages`);

  generateSitemap(pages);
  generateRSS(pages);
  generateNewsSitemap(pages);

  await submitToIndexNow(pages);
  await pingGoogle();

  console.log("🌟 Sapana Full Auto Indexing Engine v3 completed successfully 🌟");
})();
