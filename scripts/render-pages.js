import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import Twig from "twig";
import { galleryImages, pageDefaults } from "../src/content/site.js";
import { discoverPages } from "./discover-pages.js";

const root = resolve(import.meta.dirname, "..");

await Promise.all(discoverPages().map(async ({ template, output: outputName }) => {
  const page = {
    ...pageDefaults,
    output: outputName,
    url: outputName === "index.html" ? "/" : `/${outputName}`
  };
  const pageTemplate = Twig.twig({
    path: template,
    async: false
  });
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
