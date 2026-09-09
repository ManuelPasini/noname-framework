/* importa */

import "modern-normalize/modern-normalize.css";
import "../scss/index.scss";

import { initSwiper } from "./modules/swiper.js";
import { initLenis } from "./modules/lenis.js";
import { initGsap, initLoader } from "./modules/gsap.js";

/* lancia funzioni */

function init() {
  initSwiper();
  initGsap();
  initLenis();


}

document.addEventListener("DOMContentLoaded", init);
