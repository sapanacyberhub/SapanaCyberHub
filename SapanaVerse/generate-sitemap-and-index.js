/**
 * ⭐ Sapana Ultra Sitemap & Indexing Engine v5 ⭐
 * Author: Sapana ❤️ Sanjeet
 *
 * 100% Cloudflare Pages Compatible
 * ✔ No node-fetch
 * ✔ No ES modules
 * ✔ Uses built-in global fetch()
 * ✔ Auto recursive HTML scan
 * ✔ sitemap.xml
 * ✔ sitemap-pages.xml
 * ✔ sitemap-blogs.xml
 * ✔ news-sitemap.xml (48 hrs)
 * ✔ IndexNow API submit
 * ✔ Google Search ping
 */

const fs = require("fs");
const path = require("path");

// ==============================
// CONFIG
// ==============================
const DOMAIN = "https://sapanacyberhub.in";
const INDEXNOW_KEY = "c92b83f1bb827d0e1a8f822ce732ae32";
const ROOT = "SapanaVerse";

const EXCLUDE = ["Assets", "img", "icons", "Decorate", "node_modules"];


// ==============================
// SCAN FOLDERS FOR HTML FILES
// ==============================
function scan(dir) {
    let pages = [];

    fs.readdirSync(dir).forEach((item) => {
        const full = path.join(dir, item);
        const stats = fs.statSync(full);

        if (stats.isDirectory()) {
            if (!EXCLUDE.includes(item)) {
                pages = pages.concat(scan(full));
            }
        } else if (item.endsWith(".html")) {
            const rel = full.replace(ROOT, "").replace(/\\/g, "/");

            pages.push({
                url: `${DOMAIN}${rel.startsWith("/") ? "" : "/"}${rel}`,
                path: full,
                lastmod: stats.mtime,
            });
        }
    });

    return pages;
}


// ==============================
// PRIORITY LOGIC
// ==============================
function getPriority(url) {
    if (url.endsWith("index.html")) return 1.0;
    if (url.includes("/Blogs/")) return 0.95;
    return 0.80;
}


// ==============================
// SITEMAP GENERATOR
// ==============================
function writeXML(filename, xml) {
    fs.writeFileSync(`${ROOT}/${filename}`, xml);
    console.log("✨ Created:", filename);
}

function generateSitemap(name, pages) {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    pages.forEach((p) => {
        xml += `
  <url>
    <loc>${p.url}</loc>
    <lastmod>${p.lastmod.toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${getPriority(p.url)}</priority>
  </url>\n`;
    });

    xml += `</urlset>`;
    writeXML(`${name}.xml`, xml);
}


// ==============================
// NEWS SITEMAP (Last 48 hours)
// ==============================
function generateNewsSitemap(pages) {
    const limit = 48 * 60 * 60 * 1000;

    const latest = pages.filter((p) => {
        return Date.now() - p.lastmod.getTime() < limit;
    });

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.google.com/schemas/sitemap-news/0.9">\n`;

    latest.forEach((p) => {
        xml += `
  <url>
    <loc>${p.url}</loc>
    <news:news>
      <news:publication>
        <news:name>SapanaCyberHub</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${p.lastmod.toISOString()}</news:publication_date>
      <news:title>${path.basename(p.url).replace(".html", "")}</news:title>
    </news:news>
  </url>\n`;
    });

    xml += `</urlset>`;
    writeXML("news-sitemap.xml", xml);
}


// ==============================
// GOOGLE PING
// ==============================
async function pingGoogle() {
    const url = `https://www.google.com/ping?sitemap=${DOMAIN}/sitemap.xml`;

    try {
        const res = await fetch(url);
        console.log("🔥 Google Ping:", res.status);
    } catch (e) {
        console.log("❌ Google Ping Failed:", e.message);
    }
}


// ==============================
// INDEXNOW
// ==============================
async function indexNow(urls) {
    const payload = {
        host: "sapanacyberhub.in",
        key: INDEXNOW_KEY,
        keyLocation: `${DOMAIN}/indexnow.txt`,
        urlList: urls,
    };

    try {
        const res = await fetch("https://api.indexnow.org/indexnow", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        console.log("🚀 IndexNow Submitted! Status:", res.status);
    } catch (err) {
        console.log("❌ IndexNow Failed:", err.message);
    }
}


// ==============================
// MAIN
// ==============================
(async () => {
    console.log("🔍 Scanning HTML pages…");

    const pages = scan(ROOT);

    console.log(`📄 Found ${pages.length} HTML pages`);

    generateSitemap("sitemap", pages);
    generateSitemap("sitemap-pages", pages.filter(p => !p.url.includes("/Blogs/")));
    generateSitemap("sitemap-blogs", pages.filter(p => p.url.includes("/Blogs/")));

    generateNewsSitemap(pages);

    await indexNow(pages.map(p => p.url));
    await pingGoogle();

    console.log("🌟 Sapana Ultra Sitemap Engine v5 — Completed 🌟");
})();
