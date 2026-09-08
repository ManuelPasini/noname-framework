export const galleryImages = ["91", "92", "93", "94", "95", "96", "97", "98", "99"].map((number) => ({
  src: `/images/gallery-${number}.jpg`,
  alt: `Esempio immagine gallery ${number}`
}));

export const pages = [{
  output: "index.html",
  htmlLang: "it",
  locale: "it_IT",
  url: "/",
  description: "NoName Framework: base frontend modulare con Twig, SCSS e JavaScript.",
  keywords: "frontend framework, Twig, SCSS, JavaScript, componenti UI",
  schema: { name: "NoName Framework", inLanguage: "it-IT" }
}];
