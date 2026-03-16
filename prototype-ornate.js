const entries = [
  {
    id: "hakujikai",
    title: "白磁海",
    category: "world",
    categoryLabel: "世界設定",
    breadcrumb: "World / 海域",
    summary: "交易都市と灯台列島を抱える内海。港湾国家の思惑が集中する、世界設定の中核ページです。",
    excerpt: "白磁海を渡る船団は、灯台列島の灯火を道標にしながら潮位と政治の両方を読む。",
    updated: "2026-03-15",
    tags: ["交易", "海域", "灯台"],
    links: ["[[潮見港]]", "[[灯台列島]]", "[[星舟連盟]]"],
    backlinks: 18,
    featured: true,
  },
  {
    id: "seishurenmei",
    title: "星舟連盟",
    category: "organization",
    categoryLabel: "組織",
    breadcrumb: "Organizations / 航路同盟",
    summary: "白磁海交易を支える船団同盟。護送契約、海図更新、港湾政治の三点で重要な組織。",
    excerpt: "星舟連盟は航路を守るだけでなく、港がどの海図を正史と見なすかまで決めてしまう。",
    updated: "2026-03-14",
    tags: ["組織", "海運", "政治"],
    links: ["[[白磁海]]", "[[封蝋院]]", "[[帝国暦712年の航路封鎖]]"],
    backlinks: 22,
  },
  {
    id: "riina",
    title: "灰塔の記録官リィナ",
    category: "character",
    categoryLabel: "人物",
    breadcrumb: "Characters / 記録官",
    summary: "航路封鎖期の証言と海図の改訂記録を残した記録官。人物ページから年表へ辿りやすい。",
    excerpt: "リィナの記録は感情を削ぎ落とした文体で知られるが、海図の余白にだけ迷いが残っている。",
    updated: "2026-03-13",
    tags: ["人物", "記録", "海図"],
    links: ["[[帝国暦712年の航路封鎖]]", "[[灰塔文庫]]", "[[白磁海]]"],
    backlinks: 12,
  },
  {
    id: "korofusa",
    title: "帝国暦712年の航路封鎖",
    category: "timeline",
    categoryLabel: "年表",
    breadcrumb: "Timelines / 封鎖事件",
    summary: "帝国と港湾国家の対立が表面化した大事件。人物・組織・地理ページを横断する重要ハブ。",
    excerpt: "封鎖は海そのものよりも記録の流通を止めた。各地で残された海図は同じ日付でも異なる。",
    updated: "2026-03-15",
    tags: ["年表", "戦史", "交易"],
    links: ["[[星舟連盟]]", "[[灰塔の記録官リィナ]]", "[[潮見港]]"],
    backlinks: 29,
  },
  {
    id: "shiomi",
    title: "潮見港",
    category: "world",
    categoryLabel: "世界設定",
    breadcrumb: "World / 港湾都市",
    summary: "白磁海北岸の多層港湾都市。市場区画、外洋税、灯台税で複数の物語線が接続する。",
    excerpt: "潮見港では、同じ船がどの波止場についたかで所属する世界が変わると言われている。",
    updated: "2026-03-12",
    tags: ["都市", "港", "交易"],
    links: ["[[白磁海]]", "[[星舟連盟]]", "[[北岬観測塔]]"],
    backlinks: 17,
  },
  {
    id: "furoin",
    title: "封蝋院",
    category: "organization",
    categoryLabel: "組織",
    breadcrumb: "Organizations / 文書機関",
    summary: "通行証と封印文書を管轄する行政機関。政治陰謀と物流管理の両面で使いやすい設定ページ。",
    excerpt: "封蝋院の印は船を守るためのものではない。誰が物語の正本を持つかを決めるためのものだ。",
    updated: "2026-03-11",
    tags: ["組織", "行政", "公文書"],
    links: ["[[星舟連盟]]", "[[白磁海]]", "[[夜鳴き写本]]"],
    backlinks: 9,
  },
  {
    id: "kaspar",
    title: "玻璃庭のカスパル",
    category: "character",
    categoryLabel: "人物",
    breadcrumb: "Characters / 商会長",
    summary: "潮見港の玻璃商会を率いる実務家。人物紹介から港湾と組織ページへ遷移させやすい。",
    excerpt: "カスパルは交渉の席で声を荒げない。その代わり、相手の背後にある在庫表を読む。",
    updated: "2026-03-10",
    tags: ["人物", "商会", "交渉"],
    links: ["[[潮見港]]", "[[玻璃商会]]", "[[星舟連盟]]"],
    backlinks: 14,
  },
  {
    id: "kitamisaki",
    title: "北岬観測塔",
    category: "timeline",
    categoryLabel: "年表",
    breadcrumb: "Timelines / 灯台記録",
    summary: "航路封鎖以前から続く観測記録の整理ページ。年表入口として視線を引きやすい。",
    excerpt: "北岬観測塔の記録は天候ではなく、灯火の欠落を記すために始まったと伝えられる。",
    updated: "2026-03-09",
    tags: ["年表", "観測", "灯台"],
    links: ["[[潮見港]]", "[[白磁海]]", "[[灰塔の記録官リィナ]]"],
    backlinks: 11,
  },
];

const state = {
  filter: "all",
  query: "",
  selectedId: entries[0].id,
};

const searchInput = document.getElementById("search-input");
const searchForm = document.getElementById("search-form");
const searchResults = document.getElementById("search-results");
const articleGrid = document.getElementById("article-grid");
const updateList = document.getElementById("update-list");
const changesList = document.getElementById("changes-list");
const randomButton = document.getElementById("random-button");
const featuredPreview = document.getElementById("featured-preview");

function formatDate(value) {
  const date = new Date(`${value}T00:00:00`);
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

function matchesEntry(entry, query) {
  if (!query) {
    return true;
  }

  const normalized = query.trim().toLowerCase();
  const haystack = [
    entry.title,
    entry.categoryLabel,
    entry.summary,
    entry.excerpt,
    ...entry.tags,
    ...entry.links,
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(normalized);
}

function getFilteredEntries() {
  return entries.filter((entry) => {
    const filterMatch = state.filter === "all" || entry.category === state.filter;
    return filterMatch && matchesEntry(entry, state.query);
  });
}

function getEntryById(id) {
  return entries.find((entry) => entry.id === id) ?? entries[0];
}

function syncSelectionToVisible() {
  const visible = getFilteredEntries();
  if (visible.length === 0) {
    return;
  }

  const selectedIsVisible = visible.some((entry) => entry.id === state.selectedId);
  if (!selectedIsVisible) {
    state.selectedId = visible[0].id;
  }
}

function setSelectedEntry(id) {
  state.selectedId = id;
  renderPreview();
  renderArticleGrid();
  renderSearchResults();
}

function updateFilterButtons() {
  document.querySelectorAll("[data-filter]").forEach((button) => {
    const isActive = button.dataset.filter === state.filter;
    button.classList.toggle("is-active", isActive);
  });
}

function renderFeatured() {
  const featured = entries.find((entry) => entry.featured) ?? entries[0];
  document.getElementById("featured-title").textContent = featured.title;
  document.getElementById("featured-summary").textContent = featured.summary;
  document.getElementById("featured-category").textContent = featured.categoryLabel;
  document.getElementById("featured-updated").textContent = `最終更新 ${formatDate(featured.updated)}`;
  document.getElementById("featured-tags").innerHTML = featured.tags
    .map((tag) => `<span class="tag-chip">${tag}</span>`)
    .join("");
  document.getElementById("hero-pick-title").textContent = featured.title;
  document.getElementById("hero-pick-summary").textContent = featured.summary;
}

function renderSearchResults() {
  const visible = getFilteredEntries();
  const selected = getEntryById(state.selectedId);
  const items = state.query ? visible.slice(0, 4) : entries.slice(0, 4);

  if (items.length === 0) {
    searchResults.innerHTML = `
      <div class="search-result-card">
        <strong>一致するページがありません</strong>
        <span>検索語かカテゴリを変えて、別の入口を試してください。</span>
      </div>
    `;
    return;
  }

  searchResults.innerHTML = items
    .map(
      (entry) => `
        <button class="search-result-card" type="button" data-entry-id="${entry.id}">
          <strong>${entry.title}</strong>
          <span>${entry.categoryLabel} / ${entry.summary}</span>
        </button>
      `
    )
    .join("");

  const selectedShortcut = Array.from(searchResults.querySelectorAll("[data-entry-id]")).find(
    (button) => button.dataset.entryId === selected.id
  );

  if (selectedShortcut) {
    selectedShortcut.classList.add("is-selected");
  }
}

function renderArticleGrid() {
  const visible = getFilteredEntries();

  if (visible.length === 0) {
    articleGrid.innerHTML = `
      <div class="card-button">
        <strong>該当するページがありません</strong>
        <span class="article-summary">検索語を変えると、ここに別のサンプル記事が並びます。</span>
      </div>
    `;
    return;
  }

  articleGrid.innerHTML = visible
    .map(
      (entry) => `
        <article class="article-card">
          <button
            class="card-button ${entry.id === state.selectedId ? "is-selected" : ""}"
            type="button"
            data-entry-id="${entry.id}"
          >
            <div class="article-card-header">
              <div>
                <span class="article-category">${entry.categoryLabel}</span>
                <h3>${entry.title}</h3>
              </div>
              <span class="tag-chip">${entry.tags[0]}</span>
            </div>
            <p class="article-summary">${entry.summary}</p>
            <div class="tag-row">
              ${entry.tags.map((tag) => `<span class="tag-chip">${tag}</span>`).join("")}
            </div>
            <div class="article-footer">
              <span>${entry.backlinks}件のバックリンク</span>
              <span>${formatDate(entry.updated)}</span>
            </div>
          </button>
        </article>
      `
    )
    .join("");
}

function renderPreview() {
  const entry = getEntryById(state.selectedId);

  document.getElementById("preview-breadcrumb").textContent = entry.breadcrumb;
  document.getElementById("preview-title").textContent = entry.title;
  document.getElementById("preview-summary").textContent = entry.summary;
  document.getElementById("preview-updated").textContent = formatDate(entry.updated);
  document.getElementById("preview-tag-count").textContent = `${entry.tags.length}件`;
  document.getElementById("preview-backlinks").textContent = `${entry.backlinks}件`;
  document.getElementById("preview-excerpt").textContent = entry.excerpt;
  document.getElementById("preview-tags").innerHTML = entry.tags
    .map((tag) => `<span class="tag-chip">${tag}</span>`)
    .join("");
  document.getElementById("preview-links").innerHTML = entry.links
    .map((link) => `<span class="link-chip">${link}</span>`)
    .join("");
}

function renderUpdates() {
  const sorted = [...entries].sort((a, b) => b.updated.localeCompare(a.updated));

  updateList.innerHTML = sorted
    .slice(0, 4)
    .map(
      (entry) => `
        <li class="update-item">
          <strong>${entry.title}</strong>
          <p>${entry.summary}</p>
          <span class="update-meta">${entry.categoryLabel} / ${formatDate(entry.updated)} 更新</span>
        </li>
      `
    )
    .join("");

  changesList.innerHTML = sorted
    .slice(0, 6)
    .map(
      (entry) => `
        <li class="change-item">
          <strong>${entry.title}</strong>
          <span class="change-meta">${entry.categoryLabel} ・ ${formatDate(entry.updated)}</span>
        </li>
      `
    )
    .join("");
}

function applyFilter(nextFilter) {
  state.filter = nextFilter;
  syncSelectionToVisible();
  updateFilterButtons();
  renderPreview();
  renderSearchResults();
  renderArticleGrid();
  document.getElementById("popular").scrollIntoView({ behavior: "smooth", block: "start" });
}

document.addEventListener("click", (event) => {
  const filterButton = event.target.closest("[data-filter]");
  if (filterButton) {
    applyFilter(filterButton.dataset.filter);
    return;
  }

  const shortcutButton = event.target.closest("[data-filter-shortcut]");
  if (shortcutButton) {
    applyFilter(shortcutButton.dataset.filterShortcut);
    return;
  }

  const entryButton = event.target.closest("[data-entry-id]");
  if (entryButton) {
    setSelectedEntry(entryButton.dataset.entryId);
    document.getElementById("preview").scrollIntoView({ behavior: "smooth", block: "start" });
  }
});

searchInput.addEventListener("input", (event) => {
  state.query = event.target.value;
  syncSelectionToVisible();
  renderPreview();
  renderSearchResults();
  renderArticleGrid();
});

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const firstMatch = getFilteredEntries()[0];
  if (firstMatch) {
    setSelectedEntry(firstMatch.id);
    document.getElementById("preview").scrollIntoView({ behavior: "smooth", block: "start" });
  }
});

randomButton.addEventListener("click", () => {
  const pool = entries.filter((entry) => entry.id !== state.selectedId);
  const next = pool[Math.floor(Math.random() * pool.length)] ?? entries[0];
  setSelectedEntry(next.id);
  document.getElementById("preview").scrollIntoView({ behavior: "smooth", block: "start" });
});

featuredPreview.addEventListener("click", () => {
  const featured = entries.find((entry) => entry.featured) ?? entries[0];
  setSelectedEntry(featured.id);
  document.getElementById("preview").scrollIntoView({ behavior: "smooth", block: "start" });
});

renderFeatured();
updateFilterButtons();
renderSearchResults();
renderArticleGrid();
renderPreview();
renderUpdates();
