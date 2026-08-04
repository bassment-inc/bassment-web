import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

const publicDir = new URL('../public/', import.meta.url);
const baseUrl = 'https://bassment.co.jp';

async function findHtml(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    const path = join(directory.pathname, entry.name);
    if (entry.isDirectory()) files.push(...await findHtml(new URL(`file://${path}/`)));
    else if (entry.name === 'index.html') files.push(path);
  }
  return files;
}

const htmlFiles = (await findHtml(publicDir)).sort();
const requiredMeta = [
  /<title>[^<]+<\/title>/,
  /<meta name="description" content="[^"]+">/,
  /<link rel="canonical" href="https:\/\/bassment\.co\.jp[^\"]*">/,
  /<meta property="og:title" content="[^"]+">/,
  /<meta name="twitter:card" content="summary_large_image">/,
];

for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8');
  for (const pattern of requiredMeta) {
    if (!pattern.test(html)) throw new Error(`Missing SEO metadata in ${relative(publicDir.pathname, file)}: ${pattern}`);
  }
}

const urls = htmlFiles.map((file) => {
  const path = relative(publicDir.pathname, file).split(sep).join('/').replace(/(^|\/)index\.html$/, '');
  return `${baseUrl}${path ? `/${path}` : '/'}`;
}).sort();

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((url) => `  <url><loc>${url}</loc></url>`).join('\n')}\n</urlset>\n`;
await writeFile(new URL('sitemap.xml', publicDir), xml);
console.log(`SEO validation passed for ${htmlFiles.length} pages.`);
console.log(`Generated sitemap.xml with ${urls.length} URLs.`);
