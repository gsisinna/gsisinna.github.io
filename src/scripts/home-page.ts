// Home page journey: robot arm hero, chapter rail, and the scroll-lit experience timeline.
// Re-bound on every page load because the client-side router swaps pages without reloading.

import { mountRobotScene } from "./robot-arm";

let teardown: Array<() => void> = [];

function setupJourney() {
  const rail = document.querySelector<HTMLElement>("[data-journey]");
  const timeline = document.querySelector<HTMLElement>("[data-timeline]");
  if (!rail && !timeline) return;

  const links = rail ? Array.from(rail.querySelectorAll<HTMLAnchorElement>("[data-journey-link]")) : [];
  const fill = rail?.querySelector<HTMLElement>("[data-journey-fill]");
  const chapters = links
    .map((link) => ({ link, section: document.getElementById(link.hash.slice(1)) }))
    .filter((item): item is { link: HTMLAnchorElement; section: HTMLElement } => item.section !== null);
  const items = timeline ? Array.from(timeline.querySelectorAll<HTMLElement>(".timeline-item")) : [];
  let frame = 0;

  const update = () => {
    frame = 0;
    const doc = document.documentElement;
    const max = Math.max(1, doc.scrollHeight - window.innerHeight);
    const progress = Math.min(1, Math.max(0, window.scrollY / max));
    fill?.style.setProperty("transform", `scaleY(${progress})`);

    // Current chapter: the last section whose top passed 40% of the viewport.
    const probe = window.innerHeight * 0.4;
    let active = chapters[0];
    for (const chapter of chapters) {
      if (chapter.section.getBoundingClientRect().top <= probe) active = chapter;
    }
    if (progress > 0.995) active = chapters[chapters.length - 1];
    for (const chapter of chapters) {
      const isActive = chapter === active;
      chapter.link.classList.toggle("is-active", isActive);
      if (isActive) chapter.link.setAttribute("aria-current", "location");
      else chapter.link.removeAttribute("aria-current");
    }

    // Timeline rail fills up to the middle of the viewport; passed entries light up.
    if (timeline) {
      const rect = timeline.getBoundingClientRect();
      const middle = window.innerHeight * 0.55;
      const ratio = Math.min(1, Math.max(0, (middle - rect.top) / Math.max(1, rect.height)));
      timeline.style.setProperty("--timeline-progress", ratio.toFixed(3));
      for (const item of items) item.classList.toggle("is-passed", item.getBoundingClientRect().top < middle);
    }
  };

  const onScroll = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };

  update();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  teardown.push(() => {
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onScroll);
    if (frame) cancelAnimationFrame(frame);
  });
}

document.addEventListener("astro:page-load", () => {
  const scene = document.querySelector<HTMLElement>("[data-robot-scene]");
  if (scene) teardown.push(mountRobotScene(scene));
  setupJourney();
});

document.addEventListener("astro:before-swap", () => {
  for (const fn of teardown) fn();
  teardown = [];
});
