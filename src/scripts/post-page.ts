(() => {
  const copyIcon =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>';
  const checkIcon =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 5 5 9-10"/></svg>';

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback for contexts where the async Clipboard API is blocked.
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.cssText = "position:fixed;opacity:0;pointer-events:none";
      document.body.append(area);
      area.select();
      const ok = document.execCommand("copy");
      area.remove();
      if (!ok) throw new Error("copy failed");
    }
  };

  // Code blocks: wrap each highlighted <pre> with a header (title, language, copy button).
  for (const pre of document.querySelectorAll<HTMLPreElement>(".prose pre")) {
    if (pre.parentElement?.classList.contains("code-block")) continue;

    const frame = document.createElement("div");
    frame.className = "code-block";
    const header = document.createElement("div");
    header.className = "code-header";
    const label = document.createElement("div");
    label.className = "code-label";

    if (pre.dataset.title) {
      const title = document.createElement("span");
      title.className = "code-title";
      title.textContent = pre.dataset.title;
      label.append(title);
    }
    if (pre.dataset.language) {
      const lang = document.createElement("span");
      lang.className = "code-lang";
      lang.textContent = pre.dataset.language;
      label.append(lang);
    }

    const button = document.createElement("button");
    button.type = "button";
    button.className = "code-copy";
    button.innerHTML = `${copyIcon}<span>Copy</span>`;
    button.setAttribute("aria-label", "Copy code to clipboard");
    button.addEventListener("click", async () => {
      const code = pre.querySelector("code") ?? pre;
      // Skip lines marked as removed in diff blocks.
      const lines = code.querySelectorAll(".line");
      const text =
        lines.length > 0
          ? Array.from(lines)
              .filter((line) => !line.classList.contains("remove"))
              .map((line) => line.textContent ?? "")
              .join("\n")
          : code.textContent ?? "";
      try {
        await copyText(text.replace(/\n+$/, ""));
        button.dataset.copied = "";
        button.innerHTML = `${checkIcon}<span>Copied</span>`;
        window.setTimeout(() => {
          delete button.dataset.copied;
          button.innerHTML = `${copyIcon}<span>Copy</span>`;
        }, 1600);
      } catch {
        button.querySelector("span")!.textContent = "Press Ctrl+C";
      }
    });

    header.append(label, button);
    pre.before(frame);
    frame.append(header, pre);
  }

  // Table of contents: highlight the section currently being read.
  const tocLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>("[data-toc-link]"));
  if (tocLinks.length === 0 || !("IntersectionObserver" in window)) return;

  const byId = new Map(tocLinks.map((link) => [decodeURIComponent(link.hash.slice(1)), link]));
  const headings = Array.from(byId.keys())
    .map((id) => document.getElementById(id))
    .filter((el): el is HTMLElement => el !== null);

  const setActive = (id: string) => {
    for (const link of tocLinks) link.classList.toggle("is-active", link === byId.get(id));
  };

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting);
      if (visible.length > 0) setActive(visible[0].target.id);
    },
    { rootMargin: "-80px 0px -70% 0px" }
  );
  for (const heading of headings) observer.observe(heading);
})();
