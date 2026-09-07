import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function initGsap(onIntroComplete) {
  initScrollReveal(onIntroComplete);
}

export function initLoader(callback) {
  const loader = document.querySelector("#loader");

  if (!loader) {
    callback();
    return;
  }

  gsap.to(loader, {
    opacity: 0,
    duration: 0.8,
    delay: 2,
    onComplete: () => {
      loader.remove();
      callback();
    },
  });
}

function initScrollReveal(onIntroComplete) {
  const elements = document.querySelectorAll('[data-gsap="reveal"]');

  if (!elements.length) {
    onIntroComplete?.();
    return;
  }

  const introElements = [];
  const scrollElements = [];

  elements.forEach((element) => {
    const rect = element.getBoundingClientRect();

    const isVisible =
      rect.top < window.innerHeight &&
      rect.bottom > 0;

    if (isVisible) {
      introElements.push(element);
    } else {
      scrollElements.push(element);
    }
  });

  // Elementi già visibili al caricamento
  if (introElements.length) {
    gsap.to(introElements, {
      opacity: 1,
      duration: 1,
      ease: "power2.out",
      stagger: 0.3,
      onComplete: onIntroComplete,
    });
  } else {
    onIntroComplete?.();
  }

  // Elementi che verranno raggiunti durante lo scroll
  scrollElements.forEach((element) => {
  gsap.fromTo(
    element,
    {
      opacity: 0,
    },
    {
      opacity: 1,
      duration: 1,
      ease: "power2.out",

      scrollTrigger: {
        trigger: element,
        start: "top 85%",
        end: "top 40%",
        scrub: true,
      },
    }
  );
});
}
