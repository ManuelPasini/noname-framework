import Lenis from "lenis";

export function initLenis() {
  const lenis = new Lenis({
    autoRaf: true,
    duration: 1.8,
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 2,
    anchors: true,
  });

  return lenis;
}