import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import Twig from "twig";
import { galleryImages, pages } from "../src/content/site.js";

const root = resolve(import.meta.dirname, "..");
const pageTemplate = Twig.twig({
  path: resolve(root, "src/templates/page.twig"),
  async: false
});

await Promise.all(pages.map(async (page) => {
  const schemaJson = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebSite",
    ...page.schema,
    url: page.url,
    description: page.description
  });
  const output = resolve(root, page.output);

  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, pageTemplate.render({
    page,
    galleryImages,
    schemaJson,
    gallery: {
      id: "documentation-gallery",
      label: "Esempio gallery",
      slidesDesktop: 4,
      images: galleryImages
    }
  }), "utf8");
}));
