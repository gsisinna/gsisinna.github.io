// Re-run on every page load: the client-side router swaps pages without reloading scripts.
let removeTocListener: (() => void) | null = null;

function initPostPage() {
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

  // Heading anchors: a "#" link next to each section title, for sharing deep links.
  for (const heading of document.querySelectorAll<HTMLElement>(".prose :is(h2, h3)[id]")) {
    if (heading.querySelector(".heading-anchor")) continue;
    const anchor = document.createElement("a");
    anchor.className = "heading-anchor";
    anchor.href = `#${heading.id}`;
    anchor.setAttribute("aria-label", `Link to section: ${heading.textContent ?? ""}`);
    anchor.textContent = "#";
    heading.append(anchor);
  }

  // Table of contents: highlight the section currently being read
  // (the last heading that has scrolled past the top of the viewport).
  removeTocListener?.();
  removeTocListener = null;
  const tocLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>("[data-toc-link]"));
  if (tocLinks.length === 0) return;

  const sections = tocLinks
    .map((link) => ({ link, heading: document.getElementById(decodeURIComponent(link.hash.slice(1))) }))
    .filter((item): item is { link: HTMLAnchorElement; heading: HTMLElement } => item.heading !== null);

  let frame = 0;
  const update = () => {
    frame = 0;
    let active = sections[0];
    for (const item of sections) {
      if (item.heading.getBoundingClientRect().top < 140) active = item;
      else break;
    }
    for (const item of sections) item.link.classList.toggle("is-active", item === active);
  };
  const onScroll = () => {
    if (!frame) frame = window.requestAnimationFrame(update);
  };

  update();
  window.addEventListener("scroll", onScroll, { passive: true });
  removeTocListener = () => {
    window.removeEventListener("scroll", onScroll);
    if (frame) window.cancelAnimationFrame(frame);
  };
}

document.addEventListener("astro:page-load", initPostPage);
document.addEventListener("astro:before-swap", () => {
  removeTocListener?.();
  removeTocListener = null;
});
