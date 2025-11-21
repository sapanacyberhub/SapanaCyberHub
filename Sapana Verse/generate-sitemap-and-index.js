/**
 * ⭐ Sapana Ultra Sitemap & Indexing Engine v4 ⭐
 * Author: Sapana ❤️ Sanjeet
 *
 * Features:
 * ✔ Full recursive HTML scan
 * ✔ Auto sitemap.xml
 * ✔ Auto pages-sitemap.xml
 * ✔ Auto blogs-sitemap.xml
 * ✔ Auto news-sitemap.xml
 * ✔ Auto-priority system
 * ✔ Auto lastmod timestamps
 * ✔ Auto IndexNow
 * ✔ Auto Google ping
 * ✔ SEO-optimized structure
 */

import { readdirSync, writeFileSync, statSync } from "fs";
import { join } from "path";
import fetch from "node-fetch";

// CONFIG
const DOMAIN = "https://sapanacyberhub.in";
const INDEXNOW_KEY = "c92b83f1bb827d0e1a8f822ce732ae32";
const ROOT = "Sapana Verse";

// EXCLUDE folders not needed in sitemap
const EXCLUDE = ["Assets", "img", "icons", "Decorate", "node_modules"];

// --- Recursive Scanner ---
function scan(dir) {
    let pages = [];

    const items = readdirSync(dir);

    for (const item of items) {
        const full = join(dir, item);
        const stats = statSync(full);

        if (stats.isDirectory()) {
            if (!EXCLUDE.includes(item)) {
                pages = pages.concat(scan(full));
            }
        } else if (item.endsWith(".html")) {
            const rel = full.replace(ROOT, "").replace(/\\/g, "/");
            pages.push({
                url: `${DOMAIN}${rel.startsWith("/") ? "" : "/"}${rel}`,
                path: full,
                lastmod: stats.mtime
            });
        }
    }
    return pages;
}

// --- Priority Logic ---
// Blogs = 0.95
// Home = 1.0
// Other pages = 0.80
function getPriority(url) {
    if (url.endsWith("index.html")) return 1.0;
    if (url.includes("/Blogs/")) return 0.95;
    return 0.80;
}

// --- Generate Sitemap ---
function generateSitemap(name, pages) {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    pages.forEach(p => {
        xml += `
 <url>
   <loc>${p.url}</loc>
   <lastmod>${p.lastmod.toISOString()}</lastmod>
   <changefreq>daily</changefreq>
   <priority>${getPriority(p.url)}</priority>
 </url>\n`;
    });

    xml += `</urlset>`;
    writeFileSync(`${ROOT}/${name}.xml`, xml);
}

// --- Generate News Sitemap (last 48 hours only) ---
function generateNewsSitemap(pages) {
    const limit = 48 * 60 * 60 * 1000;
    const recent = pages.filter(p =>
        Date.now() - p.lastmod.getTime() < limit
    );

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap-news/0.9">\n`;

    recent.forEach(p => {
        xml += `
 <url>
   <loc>${p.url}</loc>
   <news:news>
     <news:publication>
       <news:name>SapanaCyberHub</news:name>
       <news:language>en</news:language>
     </news:publication>
     <news:publication_date>${p.lastmod.toISOString()}</news:publication_date>
     <news:title>${p.url.split("/").pop().replace(".html", "")}</news:title>
   </news:news>
 </url>\n`;
    });

    xml += `</urlset>`;
    writeFileSync(`${ROOT}/news-sitemap.xml`, xml);
}

// --- Ping Google ---
async function pingGoogle() {
    const url = `https://www.google.com/ping?sitemap=${DOMAIN}/sitemap.xml`;
    await fetch(url);
    console.log("🔥 Google ping sent!");
}

// --- IndexNow Submit ---
async function indexNow(urls) {
    const payload = {
        host: "sapanacyberhub.in",
        key: INDEXNOW_KEY,
        keyLocation: `${DOMAIN}/indexnow.txt`,
        urlList: urls
    };

    await fetch("https://api.indexnow.org/indexnow", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(payload)
    });

    console.log("🚀 IndexNow submission complete!");
}

// --- MAIN ---
(async () => {
    console.log("🔍 Scanning project…");

    const pages = scan(ROOT);

    console.log(`📄 Found ${pages.length} HTML pages`);

    // Master sitemap
    generateSitemap("sitemap", pages);

    // Pages only
    generateSitemap("sitemap-pages", pages.filter(p => !p.url.includes("/Blogs/")));

    // Blog posts only
    generateSitemap("sitemap-blogs", pages.filter(p => p.url.includes("/Blogs/")));

    // News sitemap
    generateNewsSitemap(pages);

    // Submit to IndexNow
    await indexNow(pages.map(p => p.url));

    // Google ping
    await pingGoogle();

    console.log("🌟 Sapana Ultra Sitemap Engine v4 Completed Successfully 🌟");
})();
