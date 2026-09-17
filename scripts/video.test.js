import { test } from 'node:test';
import assert from 'node:assert/strict';
import { initVideo, initResponsiveVideo } from '../src/js/modules/video.js';
import Twig from 'twig';
import { resolve } from 'node:path';

function fixture(reject = false) {
  const events = {};
  const classes = new Set();
  const video = {
    paused: true, controls: true,
    addEventListener(name, fn) { events[name] = fn; },
    async play() {
      if (reject) throw new Error('Playback rejected');
      this.paused = false;
      events.playing();
    },
    focus() { this.focused = true; }
  };
  const button = {
    hidden: true,
    addEventListener(name, fn) { this[name] = fn; }
  };
  const player = {
    querySelector(selector) { return selector === 'video' ? video : selector === '.video-player__play' ? button : null; },
    classList: { add: (name) => classes.add(name), remove: (name) => classes.delete(name) }
  };
  const root = { querySelectorAll: () => [player] };
  initVideo(root);
  return { video, button, events, classes, root };
}

test('custom play hands control to native UI and leaves pause/ended usable', async () => {
  const { video, button, events, classes, root } = fixture();
  assert.equal(video.controls, false);
  assert.equal(button.hidden, false);
  await button.click();
  assert.equal(video.controls, true);
  assert.equal(button.hidden, true);
  assert.equal(video.focused, true);
  assert.ok(classes.has('is-playing'));
  events.pause();
  assert.equal(classes.has('is-playing'), false);
  events.ended();
  initVideo(root);
  assert.equal(video.controls, true);
  assert.equal(button.hidden, true);
});

test('rejected playback restores accessible native controls', async () => {
  const { video, button } = fixture(true);
  await button.click();
  assert.equal(video.controls, true);
  assert.equal(button.hidden, true);
  assert.equal(button.disabled, false);
  assert.equal(video.focused, true);
});

test('media error exposes native controls before the first play', () => {
  const { video, button, events } = fixture();
  events.error();
  assert.equal(video.controls, true);
  assert.equal(button.hidden, true);
});

test('responsive sources switch both ways, preserving order and poster fallback', () => {
  const previousWindow = globalThis.window;
  const query = { matches: true, addEventListener(_, callback) { this.change = callback; } };
  globalThis.window = { matchMedia: (value) => {
    assert.equal(value, '(width < 768px)');
    return query;
  } };
  try {
    const makeSource = (src) => ({ src, cloneNode() { return makeSource(src); }, remove() { sources.splice(sources.indexOf(this), 1); } });
    const sources = [makeSource('desktop.webm'), makeSource('desktop.mp4')];
    let poster = 'desktop.webp';
    let mobilePoster = 'mobile.webp';
    let resets = 0;
    let loads = 0;
    const video = {
      querySelectorAll: () => [...sources],
      getAttribute: () => poster,
      setAttribute: (_, value) => { poster = value; },
      removeAttribute: () => { poster = null; },
      prepend: (source) => sources.unshift(source),
      pause() { this.paused = true; },
      load() { loads++; }
    };
    const mobile = {
      content: { querySelectorAll: () => [makeSource('mobile.webm'), makeSource('mobile.mp4')] },
      getAttribute: () => mobilePoster
    };
    initResponsiveVideo({ querySelector: () => mobile }, video, () => resets++);
    assert.deepEqual(sources.map((source) => source.src), ['mobile.webm', 'mobile.mp4']);
    assert.equal(poster, 'mobile.webp');
    assert.equal(video.preload, 'metadata');
    query.matches = false;
    query.change();
    assert.deepEqual(sources.map((source) => source.src), ['desktop.webm', 'desktop.mp4']);
    assert.equal(poster, 'desktop.webp');
    mobilePoster = null;
    query.matches = true;
    query.change();
    assert.equal(poster, 'desktop.webp');
    assert.equal(loads, 3);
    assert.equal(resets, 3);
    assert.equal(video.paused, true);
  } finally {
    globalThis.window = previousWindow;
  }
});

test('Twig renders mobile sources inertly and preserves the single-video markup', () => {
  const template = Twig.twig({ path: resolve('src/components/video/video.twig'), async: false });
  const video = { sources: [{ src: '/desktop.mp4', type: 'video/mp4' }] };
  const single = template.render({ video });
  assert.match(single, /preload="metadata"/);
  assert.doesNotMatch(single, /<template/);
  video.mobile = { poster: '/mobile.webp', sources: [{ src: '/mobile.mp4', type: 'video/mp4' }] };
  const responsive = template.render({ video });
  assert.match(responsive, /preload="none"/);
  assert.match(responsive, /<template data-video-mobile data-poster="&#x2F;mobile.webp">\s*<source src="&#x2F;mobile.mp4"/);
});
