const initialized = new WeakSet();

export function initResponsiveVideo(player, video, onSwitch) {
  const mobile = player.querySelector('template[data-video-mobile]');
  if (!mobile) return;

  const desktopSources = Array.from(video.querySelectorAll('source'), (source) => source.cloneNode(true));
  const desktopPoster = video.getAttribute('poster');
  const query = window.matchMedia('(width < 768px)');

  const selectSources = () => {
    video.pause();
    video.querySelectorAll('source').forEach((source) => source.remove());
    const sources = query.matches ? mobile.content.querySelectorAll('source') : desktopSources;
    // Insert before subtitle tracks, preserving the native video child order.
    for (const source of Array.from(sources).reverse()) {
      video.prepend(source.cloneNode(true));
    }
    const poster = query.matches ? mobile.getAttribute('data-poster') ?? desktopPoster : desktopPoster;
    if (poster) video.setAttribute('poster', poster);
    else video.removeAttribute('poster');
    video.preload = 'metadata';
    video.load();
    onSwitch();
  };

  selectSources();
  query.addEventListener('change', selectSources);
}

export function initVideo(root = document) {
  root.querySelectorAll('[data-video]').forEach((player) => {
    const video = player.querySelector('video');
    const play = player.querySelector('.video-player__play');
    if (!video || !play || initialized.has(player)) return;
    initialized.add(player);
    let sourceVersion = 0;

    const showNativeControls = () => {
      video.controls = true;
      play.hidden = true;
      play.disabled = false;
    };

    // Keep native controls after the first start, including while paused.
    video.addEventListener('playing', () => {
      showNativeControls();
      player.classList.add('is-playing');
    });
    for (const event of ['pause', 'ended']) {
      video.addEventListener(event, () => player.classList.remove('is-playing'));
    }
    video.addEventListener('error', showNativeControls);

    play.addEventListener('click', async () => {
      const version = sourceVersion;
      play.disabled = true;
      try {
        await video.play();
        if (version !== sourceVersion) return;
        showNativeControls();
        video.focus();
      } catch {
        if (version !== sourceVersion) return;
        // Expose the browser's playback UI if play is rejected or unsupported.
        showNativeControls();
        video.focus();
      }
    });

    initResponsiveVideo(player, video, () => {
      sourceVersion++;
      player.classList.remove('is-playing');
      video.controls = false;
      play.hidden = false;
      play.disabled = false;
    });

    if (video.paused && !video.error) {
      video.controls = false;
      play.hidden = false;
    } else {
      showNativeControls();
    }
  });
}
