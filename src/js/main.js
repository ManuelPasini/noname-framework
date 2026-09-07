/* importa */

import "modern-normalize/modern-normalize.css";
import "../scss/index.scss";

import { initSwiper } from "./modules/swiper.js";
import { initLenis } from "./modules/lenis.js";
import { initGsap, initLoader } from "./modules/gsap.js";
import { initGlitch } from "./modules/glitch.js";

/* lancia funzioni */

function init() {
  initSwiper();

  const lenis = initLenis();

  lenis.stop();

  initLoader(() => {
    lenis.start();
    initGsap(initGlitch);
  });
}

document.addEventListener("DOMContentLoaded", init);
