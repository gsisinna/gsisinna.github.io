// Site-wide behaviour. `astro:page-load` fires on the first load and after every
// client-side navigation, so everything is (re)bound to the current page there.

const reduceMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let cleanup: Array<() => void> = [];

function currentTheme() {
  const set = document.documentElement.dataset.theme;
  if (set === "light" || set === "dark") return set;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function setupThemeToggle() {
  const button = document.querySelector<HTMLButtonElement>("[data-theme-toggle]");
  if (!button) return;

  const sync = () => {
    const theme = currentTheme();
    button.setAttribute("aria-label", theme === "dark" ? "Switch to light theme" : "Switch to dark theme");
  };

  const toggle = () => {
    const next = currentTheme() === "dark" ? "light" : "dark";
    const apply = () => {
      document.documentElement.dataset.theme = next;
      try {
        localStorage.setItem("theme", next);
      } catch {}
      sync();
    };
    // Cross-fade the whole page when the browser supports it.
    const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
    if (doc.startViewTransition && !reduceMotion()) doc.startViewTransition(apply);
    else apply();
  };

  sync();
  button.addEventListener("click", toggle);
  cleanup.push(() => button.removeEventListener("click", toggle));
}

function setupScrollEffects() {
  const header = document.querySelector<HTMLElement>("header.site");
  const progress = document.querySelector<HTMLElement>("[data-reading-progress]");
  const article = document.querySelector<HTMLElement>(".post");
  let frame = 0;

  const update = () => {
    frame = 0;
    header?.classList.toggle("is-scrolled", window.scrollY > 8);
    if (progress && article) {
      const start = article.offsetTop;
      const end = start + article.offsetHeight - window.innerHeight;
      const ratio = Math.min(1, Math.max(0, (window.scrollY - start) / Math.max(1, end - start)));
      progress.style.transform = `scaleX(${ratio})`;
    }
  };

  const onScroll = () => {
    if (!frame) frame = window.requestAnimationFrame(update);
  };

  update();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  cleanup.push(() => {
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onScroll);
    if (frame) window.cancelAnimationFrame(frame);
  });
}

function setupReveal() {
  const targets = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
  if (targets.length === 0) return;

  if (reduceMotion() || !("IntersectionObserver" in window)) {
    for (const el of targets) el.classList.add("is-revealed");
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-revealed");
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
  );

  for (const el of targets) observer.observe(el);
  cleanup.push(() => observer.disconnect());
}

document.addEventListener("astro:page-load", () => {
  setupThemeToggle();
  setupScrollEffects();
  setupReveal();
});

document.addEventListener("astro:before-swap", () => {
  for (const fn of cleanup) fn();
  cleanup = [];
});
