import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { allPages, fullTitle, pages, SITE_URL, type PageMeta } from './src/data/seo';

const escapeAttr = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// WhatsApp in particular is picky about share images; it gets the type alongside the URL.
const imageType = (file: string) => (/\.png$/i.test(file) ? 'image/png' : 'image/jpeg');

/** Replaces the content of one meta tag, failing the build if the tag is missing from index.html. */
function setMeta(html: string, attr: 'name' | 'property', key: string, value: string) {
  const pattern = new RegExp(`(<meta\\s+${attr}="${key}"\\s+content=")[^"]*(")`, 's');
  if (!pattern.test(html))
    throw new Error(`prerender-meta: <meta ${attr}="${key}"> not found in index.html`);
  return html.replace(pattern, `$1${escapeAttr(value)}$2`);
}

/**
 * Writes one HTML file per route (dist/work.html, dist/work/bite-wise.html, …; served at /work and
 * /work/bite-wise through `cleanUrls` in vercel.json) with
 * that page's title, description, canonical URL and share image. The app itself is unchanged;
 * this only matters to crawlers and link-preview bots, which don't run JavaScript.
 */
function prerenderMeta(): Plugin {
  let root = process.cwd();
  let outDir = 'dist';

  return {
    name: 'prerender-meta',
    apply: 'build',
    configResolved(config) {
      root = config.root;
      outDir = path.resolve(config.root, config.build.outDir);
    },
    async closeBundle() {
      const template = await readFile(path.join(outDir, 'index.html'), 'utf8');

      const render = (page: PageMeta) => {
        const image = existsSync(path.join(root, 'public', page.image))
          ? page.image
          : pages.home.image;
        const url = `${SITE_URL}${page.path === '/' ? '/' : page.path}`;
        const title = fullTitle(page);
        let html = template.replace(/<title>[^<]*<\/title>/, `<title>${escapeAttr(title)}</title>`);
        html = setMeta(html, 'name', 'description', page.description);
        html = setMeta(html, 'property', 'og:title', title);
        html = setMeta(html, 'property', 'og:description', page.description);
        html = setMeta(html, 'property', 'og:url', url);
        html = setMeta(html, 'property', 'og:image', `${SITE_URL}${image}`);
        html = setMeta(html, 'property', 'og:image:secure_url', `${SITE_URL}${image}`);
        html = setMeta(html, 'property', 'og:image:type', imageType(image));
        html = setMeta(html, 'property', 'og:image:alt', page.imageAlt);
        html = setMeta(html, 'name', 'twitter:title', title);
        html = setMeta(html, 'name', 'twitter:description', page.description);
        html = setMeta(html, 'name', 'twitter:image', `${SITE_URL}${image}`);
        return html.replace('</head>', `    <link rel="canonical" href="${url}" />\n  </head>`);
      };

      // Sitemap and robots.txt come from the same page list, so new projects are included
      // automatically and a domain change only touches SITE_URL.
      const urls = allPages().map((page) => `${SITE_URL}${page.path === '/' ? '/' : page.path}`);
      await writeFile(
        path.join(outDir, 'sitemap.xml'),
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
          .map((loc) => `  <url><loc>${loc}</loc></url>`)
          .join('\n')}\n</urlset>\n`,
      );
      await writeFile(
        path.join(outDir, 'robots.txt'),
        `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`,
      );

      for (const page of allPages()) {
        const file =
          page.path === '/'
            ? path.join(outDir, 'index.html')
            : path.join(outDir, `${page.path.replace(/^\//, '')}.html`);
        await mkdir(path.dirname(file), { recursive: true });
        await writeFile(file, render(page));
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), prerenderMeta()],
  base: '/',
});
