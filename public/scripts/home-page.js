(() => {
  const progressBar = document.getElementById("home-progress-bar");
  if (!(progressBar instanceof HTMLElement)) return;

  let progressRaf = 0;

  const updateProgress = () => {
    const doc = document.documentElement;
    const scrollTop = window.scrollY || doc.scrollTop;
    const max = Math.max(1, doc.scrollHeight - window.innerHeight);
    const pct = Math.max(0, Math.min(100, (scrollTop / max) * 100));
    progressBar.style.transform = `scaleX(${pct / 100})`;
  };

  const scheduleProgressUpdate = () => {
    if (progressRaf) return;
    progressRaf = window.requestAnimationFrame(() => {
      progressRaf = 0;
      updateProgress();
    });
  };

  updateProgress();
  window.addEventListener("scroll", scheduleProgressUpdate, { passive: true });
  window.addEventListener("resize", scheduleProgressUpdate, { passive: true });

  const navLinks = Array.from(document.querySelectorAll("[data-jump]"));
  const sections = navLinks
    .map((link) => {
      if (!(link instanceof HTMLAnchorElement)) return null;
      const id = link.getAttribute("href")?.replace("#", "");
      if (!id) return null;
      const section = document.getElementById(id);
      if (!section) return null;
      return { link, section };
    })
    .filter(Boolean);

  if (sections.length > 0 && "IntersectionObserver" in window) {
    const sectionMap = new Map(sections.map((item) => [item?.section, item?.link]));
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const link = sectionMap.get(entry.target);
          if (!(link instanceof HTMLAnchorElement)) continue;
          if (entry.isIntersecting) {
            for (const item of sections) item?.link.classList.remove("is-active");
            link.classList.add("is-active");
          }
        }
      },
      { threshold: 0.35, rootMargin: "-14% 0px -55% 0px" },
    );

    for (const item of sections) {
      if (!item) continue;
      observer.observe(item.section);
    }
  }

  const recentCards = document.querySelectorAll(".recent-card");
  if (window.matchMedia("(pointer:fine)").matches) {
    for (const card of recentCards) {
      if (!(card instanceof HTMLElement)) continue;
      card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty("--mx", `${x}%`);
        card.style.setProperty("--my", `${y}%`);
      });
    }
  }
})();
