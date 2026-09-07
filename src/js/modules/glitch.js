const GLITCH_SELECTOR = "[data-glitch-canvas]";

export function initGlitch() {
  const placeholder = document.querySelector(GLITCH_SELECTOR);
  const title = placeholder?.closest("h1");

  if (!title || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  // Regola qui intensità e frequenza del glitch.
  const settings = {
    slicesPerBurst: [2, 6],
    sliceHeight: [1, 6],
    horizontalShift: [-3, 3],
    visibleFor: [20, 100],
    pauseBetweenBursts: [800, 4400],
  };

  const randomInteger = (minimum, maximum) =>
    Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
  const randomFromRange = ([minimum, maximum]) => randomInteger(minimum, maximum);

  const layer = document.createElement("div");
  layer.className = "glitch-layer";
  layer.setAttribute("aria-hidden", "true");
  title.append(layer);
  placeholder.remove();

  const createTextCopy = () => {
    const copy = document.createElement("div");
    copy.className = "glitch-copy";

    for (const node of title.childNodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        copy.append(node.cloneNode());
      }

      if (node.nodeType === Node.ELEMENT_NODE && node.matches("span")) {
        // Evita di copiare eventuali transform/opacity inline applicati da GSAP.
        copy.append(document.createTextNode(node.textContent));
      }
    }

    return copy;
  };

  const addSlice = () => {
    const { height } = title.getBoundingClientRect();
    const sliceHeight = Math.min(randomFromRange(settings.sliceHeight), height);
    const top = randomInteger(0, Math.max(0, Math.floor(height - sliceHeight)));
    const slice = document.createElement("div");

    slice.className = "glitch-slice";
    slice.style.clipPath = `inset(${top}px 0 ${height - top - sliceHeight}px 0)`;
    slice.style.transform = `translateX(${randomFromRange(settings.horizontalShift)}px)`;
    slice.append(createTextCopy());
    layer.append(slice);

    window.setTimeout(() => slice.remove(), randomFromRange(settings.visibleFor));
  };

  const glitch = () => {
    const sliceCount = randomFromRange(settings.slicesPerBurst);

    for (let index = 0; index < sliceCount; index += 1) {
      window.setTimeout(addSlice, index * 25);
    }

    window.setTimeout(glitch, randomFromRange(settings.pauseBetweenBursts));
  };

  glitch();
}
