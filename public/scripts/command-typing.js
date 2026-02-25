(() => {
  const commands = Array.from(document.querySelectorAll(".command-typing"));
  if (commands.length === 0) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion || !("IntersectionObserver" in window)) {
    for (const el of commands) el.classList.add("is-typed");
    return;
  }

  const onTypeEnd = (event) => {
    if (!(event.target instanceof HTMLElement)) return;
    if (event.animationName !== "typeCommand") return;
    const command = event.target.closest(".command-typing");
    if (!command) return;
    command.classList.remove("is-typing");
    command.classList.add("is-typed");
    event.target.removeEventListener("animationend", onTypeEnd);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target;
        if (!(el instanceof HTMLElement)) continue;
        if (el.classList.contains("is-typed") || el.classList.contains("is-typing")) {
          observer.unobserve(el);
          continue;
        }

        const code = el.querySelector("code");
        if (code instanceof HTMLElement) {
          const computed = getComputedStyle(el);
          const baseDelay = Number.parseFloat(computed.getPropertyValue("--type-delay")) || 0;
          const baseDuration = Number.parseFloat(computed.getPropertyValue("--type-duration")) || 1.1;
          const jitterDelay = Math.round(Math.random() * 180 - 60);
          const jitterDuration = Math.random() * 0.28 - 0.1;
          el.style.setProperty("--type-delay", `${Math.max(0, baseDelay + jitterDelay)}ms`);
          el.style.setProperty(
            "--type-duration",
            `${Math.max(0.35, baseDuration + jitterDuration).toFixed(2)}s`,
          );
          code.addEventListener("animationend", onTypeEnd);
        }

        el.classList.add("is-typing");
        observer.unobserve(el);
      }
    },
    {
      threshold: 0.6,
      rootMargin: "0px 0px -8% 0px",
    },
  );

  for (const el of commands) observer.observe(el);
})();
