import { formatDisplayDate } from "./home-page-model.js";

export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    switch (character) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#39;";
      default:
        return character;
    }
  });
}

function renderEntryLink(entry) {
  return `<a href="#article-preview" data-entry-id="${escapeHtml(entry.id)}">${escapeHtml(entry.title)}</a>`;
}

function renderRelatedTitles(titles) {
  return titles.map((title) => `<li>${escapeHtml(title)}</li>`).join("");
}

export function renderFeaturedArticle(entry) {
  if (!entry) {
    return "<p>表示できる記事がありません。</p>";
  }

  return `
    <h3>${renderEntryLink(entry)}</h3>
    <p class="entry-meta">${escapeHtml(entry.category)} / 最終更新 ${escapeHtml(formatDisplayDate(entry.updated))}</p>
    <p>${escapeHtml(entry.summary)}</p>
    <p class="small-links">キーワード: ${entry.keywords.map((keyword) => escapeHtml(keyword)).join(" / ")}</p>
  `;
}

export function renderPreviewArticle(entry) {
  if (!entry) {
    return "<p>記事プレビューを表示できません。</p>";
  }

  return `
    <header class="preview-article__header">
      <h3>${renderEntryLink(entry)}</h3>
      <p class="entry-meta">
        ${escapeHtml(entry.category)} / 作成 ${escapeHtml(formatDisplayDate(entry.created))} / 更新 ${escapeHtml(formatDisplayDate(entry.updated))}
      </p>
    </header>
    <p>${escapeHtml(entry.preview)}</p>
    <p class="preview-article__keywords">キーワード: ${entry.keywords.map((keyword) => escapeHtml(keyword)).join(", ")}</p>
    <section class="preview-article__related" aria-label="関連ページ">
      <h4>関連ページ</h4>
      <ul class="plain-list">
        ${renderRelatedTitles(entry.relatedTitles)}
      </ul>
    </section>
  `;
}

export function renderSummaryList(entries) {
  if (entries.length === 0) {
    return "<li>記事がありません。</li>";
  }

  return entries
    .map(
      (entry) => `
        <li>
          ${renderEntryLink(entry)}
          <span> - ${escapeHtml(entry.summary)}</span>
        </li>
      `
    )
    .join("");
}

export function renderUpdateList(entries) {
  if (entries.length === 0) {
    return "<li>更新情報がありません。</li>";
  }

  return entries
    .map(
      (entry) => `
        <li>
          <p class="entry-list__headline">${renderEntryLink(entry)}</p>
          <p class="entry-list__meta">${escapeHtml(entry.category)} / 最終更新 ${escapeHtml(formatDisplayDate(entry.updated))}</p>
        </li>
      `
    )
    .join("");
}

export function renderSearchResults(query, matches) {
  const safeQuery = escapeHtml(query.trim());

  if (matches.length === 0) {
    return `
      <h2>検索結果</h2>
      <p>「${safeQuery}」に一致するサンプル記事はありません。</p>
    `;
  }

  return `
    <h2>検索結果</h2>
    <p class="search-results__count">「${safeQuery}」に一致する記事が ${matches.length} 件あります。</p>
    <ul class="entry-list">
      ${matches
        .map(
          (entry) => `
            <li>
              ${renderEntryLink(entry)}
              <span> (${escapeHtml(entry.category)}) - ${escapeHtml(entry.summary)}</span>
            </li>
          `
        )
        .join("")}
    </ul>
  `;
}

export function renderCategoryCards(categoryCards) {
  return categoryCards
    .map(
      (category) => `
        <article class="category-card">
          <h3>${escapeHtml(category.name)}</h3>
          <p class="category-card__count">記事数 ${category.articleCount}</p>
          <p>${escapeHtml(category.description)}</p>
        </article>
      `
    )
    .join("");
}

export function renderParticipationGuides(guides) {
  return guides
    .map(
      (guide) => `
        <li><strong>${escapeHtml(guide.label)}:</strong> ${escapeHtml(guide.description)}</li>
      `
    )
    .join("");
}

export function renderProcessSteps(steps) {
  return steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("");
}

export function renderImplementationNotes(notes) {
  return notes.map((note) => `<li>${escapeHtml(note)}</li>`).join("");
}
