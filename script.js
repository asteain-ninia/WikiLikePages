const entries = [
  {
    title: "白磁海",
    category: "世界設定",
    updated: "2026-03-15",
    summary: "交易都市と灯台列島を抱える内海。港湾国家の思惑が集中する、世界設定の中核ページです。",
  },
  {
    title: "星舟連盟",
    category: "組織",
    updated: "2026-03-14",
    summary: "白磁海交易を支える船団同盟。護送契約、海図更新、港湾政治の三点で重要な組織。",
  },
  {
    title: "灰塔の記録官リィナ",
    category: "人物",
    updated: "2026-03-13",
    summary: "航路封鎖期の証言と海図の改訂記録を残した記録官。",
  },
  {
    title: "帝国暦712年の航路封鎖",
    category: "年表",
    updated: "2026-03-15",
    summary: "帝国と港湾国家の対立が表面化した大事件。複数ページをつなぐ重要ハブです。",
  },
  {
    title: "潮見港",
    category: "世界設定",
    updated: "2026-03-12",
    summary: "白磁海北岸の多層港湾都市。市場区画、外洋税、灯台税で物語線が接続します。",
  },
  {
    title: "封蝋院",
    category: "組織",
    updated: "2026-03-11",
    summary: "通行証と封印文書を管轄する行政機関。政治陰謀と物流管理の両面で使いやすい設定です。",
  },
];

const featuredEntry = entries[0];
const newArticles = entries.slice(0, 4);
const recentUpdates = [...entries].sort((a, b) => b.updated.localeCompare(a.updated)).slice(0, 4);

const featuredArticle = document.getElementById("featured-article");
const newArticlesList = document.getElementById("new-articles");
const recentUpdatesList = document.getElementById("recent-updates");
const statusLine = document.getElementById("status-line");
const searchInput = document.getElementById("search-input");
const searchForm = document.getElementById("search-form");
const searchResults = document.getElementById("search-results");
const randomButton = document.getElementById("random-button");

function formatDate(value) {
  return value.replaceAll("-", ".");
}

function renderFeatured(entry) {
  featuredArticle.innerHTML = `
    <h3><a href="#">${entry.title}</a></h3>
    <p class="feature-meta">${entry.category} / 最終更新 ${formatDate(entry.updated)}</p>
    <p>${entry.summary}</p>
    <p class="small-links"><a href="#">関連記事</a> / <a href="#">内部リンク</a> / <a href="#">カテゴリ一覧</a></p>
  `;
}

function renderLinkList(element, items) {
  element.innerHTML = items
    .map(
      (entry) => `
        <li>
          <a href="#">${entry.title}</a>
          <span> - ${entry.summary}</span>
        </li>
      `
    )
    .join("");
}

function renderSearchResults(query) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    searchResults.hidden = true;
    searchResults.innerHTML = "";
    return;
  }

  const matches = entries.filter((entry) => {
    return [entry.title, entry.category, entry.summary].join(" ").toLowerCase().includes(normalized);
  });

  searchResults.hidden = false;
  if (matches.length === 0) {
    searchResults.innerHTML = `
      <h2>検索結果</h2>
      <p>一致するサンプル記事はありません。</p>
    `;
    return;
  }

  searchResults.innerHTML = `
    <h2>検索結果</h2>
    <ul class="result-list">
      ${matches
        .map(
          (entry) => `
            <li><a href="#">${entry.title}</a> (${entry.category})</li>
          `
        )
        .join("")}
    </ul>
  `;
}

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  renderSearchResults(searchInput.value);
});

searchInput.addEventListener("input", () => {
  renderSearchResults(searchInput.value);
});

randomButton.addEventListener("click", () => {
  const entry = entries[Math.floor(Math.random() * entries.length)];
  renderFeatured(entry);
  statusLine.textContent = `選り抜き記事として「${entry.title}」を表示しています。`;
});

renderFeatured(featuredEntry);
renderLinkList(newArticlesList, newArticles);
renderLinkList(recentUpdatesList, recentUpdates);
