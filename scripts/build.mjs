import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import MarkdownIt from 'markdown-it';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const markdown = new MarkdownIt({ html: false, linkify: false });

async function build() {
  const css = await readFile(path.join(root, 'resume.css'), 'utf8');
  const photo = await readFile(path.join(root, 'photo.png'));
  const renderImage = markdown.renderer.rules.image;
  markdown.renderer.rules.image = (tokens, index, options, env, renderer) => {
    const token = tokens[index];
    if (token.attrGet('src') === 'photo.png') token.attrSet('src', `data:image/png;base64,${photo.toString('base64')}`);
    return renderImage(tokens, index, options, env, renderer);
  };
  const browser = await chromium.launch();
  try {
    for (const lang of ['ru', 'en']) {
      const name = `Arapov-Frontend-Vue-CV-${lang}`;
      const source = await readFile(path.join(root, `${name}.md`), 'utf8');
      const page = await browser.newPage();
      try {
        await page.setContent(`<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><style>${css}</style></head><body><main>${markdown.render(source)}</main></body></html>`, { waitUntil: 'load' });
        await page.evaluate(() => Promise.all([...document.images].map(image => image.decode())));
        await page.pdf({ path: path.join(root, `${name}.pdf`), format: 'A4', printBackground: true, tagged: true });
        console.log(`Created ${name}.pdf`);
      } finally {
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }
}

build().catch(error => {
  console.error('PDF build failed:', error.message);
  console.error('Check the source files and run npx playwright install chromium if the browser is missing.');
  process.exitCode = 1;
});
