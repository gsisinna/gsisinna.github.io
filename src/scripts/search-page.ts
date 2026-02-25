(() => {
  const input = document.getElementById("site-search-input");
  const status = document.getElementById("search-status");
  const count = document.getElementById("search-count");
  const range = document.getElementById("search-range");
  const results = document.getElementById("search-results");
  const pagination = document.getElementById("search-pagination");
  const prevBtn = document.getElementById("search-prev");
  const nextBtn = document.getElementById("search-next");
  const pageLabel = document.getElementById("search-page-label");
  const empty = document.getElementById("search-empty");
  const chips = Array.from(document.querySelectorAll("[data-query]"));

  if (!(input instanceof HTMLInputElement) || !(results instanceof HTMLElement)) return;

  type SearchPost = {
    id: string;
    title: string;
    excerpt: string;
    tags: string[];
    date: string;
    readingTime?: string;
  };

  type RankedMatch = { post: SearchPost; score: number };

  let index: SearchPost[] = [];
  let ready = false;
  let currentPage = 1;
  const pageSize = 8;
  let lastMatches: RankedMatch[] = [];

  const formatDate = (iso: string) => {
    try {
      return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(
        new Date(iso),
      );
    } catch {
      return iso;
    }
  };

  const escapeHtml = (value: string) =>
    value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const highlightHtml = (value: string, query: string) => {
    const safe = escapeHtml(value);
    const terms = Array.from(new Set(query.toLowerCase().split(/\s+/).filter((t) => t.length >= 2)));
    if (terms.length === 0) return safe;
    const pattern = terms.map((t) => escapeRegex(t)).join("|");
    if (!pattern) return safe;
    const regex = new RegExp(`(${pattern})`, "ig");
    return safe.replace(regex, "<mark>$1</mark>");
  };

  const rank = (post: SearchPost, query: string) => {
    const q = query.toLowerCase().trim();
    if (!q) return 0;
    const title = post.title.toLowerCase();
    const excerpt = post.excerpt.toLowerCase();
    const tags = post.tags.join(" ").toLowerCase();
    let score = 0;
    if (title.includes(q)) score += 6;
    if (tags.includes(q)) score += 4;
    if (excerpt.includes(q)) score += 2;
    const words = q.split(/\s+/).filter(Boolean);
    for (const word of words) {
      if (title.includes(word)) score += 2;
      if (tags.includes(word)) score += 1;
      if (excerpt.includes(word)) score += 1;
    }
    return score;
  };

  const renderPage = () => {
    const total = lastMatches.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    currentPage = Math.min(Math.max(1, currentPage), totalPages);
    const start = (currentPage - 1) * pageSize;
    const end = Math.min(total, start + pageSize);
    const pageItems = lastMatches.slice(start, end);

    if (range) {
      range.textContent = total > 0 ? `${start + 1}-${end} shown` : "Page 1";
    }
    if (pageLabel) {
      pageLabel.textContent = `Page ${currentPage} of ${totalPages}`;
    }
    if (pagination instanceof HTMLElement) {
      pagination.hidden = total <= pageSize;
    }
    if (prevBtn instanceof HTMLButtonElement) {
      prevBtn.disabled = currentPage <= 1;
    }
    if (nextBtn instanceof HTMLButtonElement) {
      nextBtn.disabled = currentPage >= totalPages;
    }

    if (pageItems.length === 0) {
      results.innerHTML = `
        <div class="terminal-card">
          <div class="bar">
            <span class="traffic" aria-hidden="true"><span></span><span></span><span></span></span>
            <span class="title">search.log</span>
          </div>
          <div class="body">
            <p class="muted">No results yet. Try a broader keyword or a tag name.</p>
          </div>
        </div>
      `;
      return;
    }

    results.innerHTML = pageItems
      .map(
        ({ post }) => `
          <article class="search-result-card">
            <a class="search-result-link compact" href="/journal/${encodeURIComponent(post.id)}/">
              <div class="search-result-body">
                <div class="search-result-top">
                  <h2>${highlightHtml(post.title, input.value)}</h2>
                  <span class="pill">${escapeHtml(formatDate(post.date))}</span>
                </div>
                <p class="muted">${highlightHtml(post.excerpt, input.value)}</p>
                <div class="search-result-meta-line">
                  ${post.readingTime ? `<span class="pill">${escapeHtml(post.readingTime)}</span>` : ""}
                  <div class="meta-row search-result-meta">
                    ${post.tags
                      .slice(0, 3)
                      .map((tag) => `<span class="pill">#${highlightHtml(tag, input.value)}</span>`)
                      .join("")}
                  </div>
                </div>
              </div>
            </a>
          </article>
        `,
      )
      .join("");
  };

  const renderResults = (query: string) => {
    const q = query.trim();
    if (!ready) {
      if (status) status.textContent = "Loading index...";
      return;
    }

    if (!q) {
      results.innerHTML = "";
      if (status) status.textContent = "Type to search";
      if (count) count.textContent = "0 results";
      if (range) range.textContent = "Page 1";
      lastMatches = [];
      currentPage = 1;
      if (pagination instanceof HTMLElement) pagination.hidden = true;
      if (empty) empty.hidden = false;
      return;
    }

    const matches = index
      .map((post) => ({ post, score: rank(post, q) }))
      .filter((item) => item.score > 0)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return new Date(b.post.date).getTime() - new Date(a.post.date).getTime();
      })
      .slice(0, 100);

    if (status) status.textContent = matches.length > 0 ? `Searching for: ${q}` : `No match for: ${q}`;
    if (count) count.textContent = `${matches.length} result${matches.length === 1 ? "" : "s"}`;
    if (empty) empty.hidden = matches.length > 0 || q.length > 0;
    lastMatches = matches;
    currentPage = 1;
    renderPage();
  };

  for (const chip of chips) {
    if (!(chip instanceof HTMLButtonElement)) continue;
    chip.addEventListener("click", () => {
      input.value = chip.dataset.query ?? "";
      renderResults(input.value);
      input.focus();
    });
  }

  input.addEventListener("input", () => renderResults(input.value));
  if (prevBtn instanceof HTMLButtonElement) {
    prevBtn.addEventListener("click", () => {
      currentPage -= 1;
      renderPage();
    });
  }
  if (nextBtn instanceof HTMLButtonElement) {
    nextBtn.addEventListener("click", () => {
      currentPage += 1;
      renderPage();
    });
  }

  const params = new URLSearchParams(window.location.search);
  const initialQ = params.get("q") ?? "";
  if (initialQ) input.value = initialQ;

  fetch("/search-index.json")
    .then((response) => response.json())
    .then((data: unknown) => {
      index = Array.isArray(data) ? (data as SearchPost[]) : [];
      ready = true;
      if (status) status.textContent = "Type to search";
      renderResults(input.value);
    })
    .catch(() => {
      ready = true;
      if (status) status.textContent = "Search index unavailable";
    });
})();
