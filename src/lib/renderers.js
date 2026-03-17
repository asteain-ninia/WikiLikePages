import { formatDisplayDate } from "./home-page-model.js";
import { buildArticleHref } from "./article-page-model.js";

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

function renderEntryLink(entry, options = {}) {
  const href = options.heading
    ? buildArticleHref(entry.id, options.heading)
    : buildArticleHref(entry.id);
  const className = options.className ? ` class="${escapeHtml(options.className)}"` : "";
  const label = options.label ?? entry.title;

  return `<a${className} href="${escapeHtml(href)}">${escapeHtml(label)}</a>`;
}

function renderRelatedTitles(titles) {
  return titles.map((title) => `<li>${escapeHtml(title)}</li>`).join("");
}

function renderParagraphSegments(segments) {
  return segments
    .map((segment) => {
      if (segment.type === "text") {
        return escapeHtml(segment.value);
      }

      const classNames = ["wiki-link"];
      if (segment.status === "missing") {
        classNames.push("wiki-link--missing");
      } else if (segment.status === "ambiguous") {
        classNames.push("wiki-link--ambiguous");
      }

      return `<a class="${classNames.join(" ")}" href="${escapeHtml(segment.href)}">${escapeHtml(segment.label)}</a>`;
    })
    .join("");
}

function renderEntrySummaryLinks(entries) {
  if (entries.length === 0) {
    return '<p class="empty-note">まだ項目がありません。</p>';
  }

  return `
    <ul class="plain-list">
      ${entries
        .map((entry) => {
          return `
            <li>
              ${renderEntryLink(entry)}
              <span class="entry-inline-meta"> (${escapeHtml(entry.category)} / ${escapeHtml(formatDisplayDate(entry.updated))})</span>
            </li>
          `;
        })
        .join("")}
    </ul>
  `;
}

function renderTagList(tags) {
  if (tags.length === 0) {
    return '<p class="empty-note">タグはまだ設定されていません。</p>';
  }

  return `
    <ul class="tag-list" aria-label="タグ一覧">
      ${tags.map((tag) => `<li class="tag">${escapeHtml(tag)}</li>`).join("")}
    </ul>
  `;
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

export function renderArticlePage(pageModel) {
  return `
    <article class="article-page">
      <nav class="breadcrumbs" aria-label="パンくず">
        <a href="#overview">メインページ</a>
        <span class="breadcrumbs__separator" aria-hidden="true">/</span>
        <span>${escapeHtml(pageModel.category)}</span>
        <span class="breadcrumbs__separator" aria-hidden="true">/</span>
        <span>${escapeHtml(pageModel.title)}</span>
      </nav>

      <header class="article-page__header">
        <p class="article-page__eyebrow">${escapeHtml(pageModel.category)}</p>
        <h2>${escapeHtml(pageModel.title)}</h2>
        <p class="article-page__summary">${escapeHtml(pageModel.summary)}</p>
        <p class="entry-meta">
          作成 ${escapeHtml(formatDisplayDate(pageModel.created))} / 更新 ${escapeHtml(formatDisplayDate(pageModel.updated))}
        </p>
      </header>

      <div class="article-page__layout">
        <div class="article-page__body">
          ${pageModel.sections
            .map((section) => {
              return `
                <section class="article-section" id="${escapeHtml(section.anchorId)}">
                  <h3>${escapeHtml(section.heading)}</h3>
                  ${section.paragraphs
                    .map((segments) => `<p>${renderParagraphSegments(segments)}</p>`)
                    .join("")}
                </section>
              `;
            })
            .join("")}
        </div>

        <aside class="article-page__sidebar">
          <section class="article-sidebox">
            <h3>タグ</h3>
            ${renderTagList(pageModel.tags)}
          </section>

          <section class="article-sidebox">
            <h3>別名</h3>
            ${
              pageModel.aliases.length === 0
                ? '<p class="empty-note">別名は登録されていません。</p>'
                : `<ul class="plain-list">${pageModel.aliases
                    .map((alias) => `<li>${escapeHtml(alias)}</li>`)
                    .join("")}</ul>`
            }
          </section>

          <section class="article-sidebox">
            <h3>バックリンク</h3>
            ${renderEntrySummaryLinks(pageModel.backlinks)}
          </section>

          <section class="article-sidebox">
            <h3>リンク状況</h3>
            <p class="article-page__status">
              未作成または曖昧なリンクは ${pageModel.unresolvedLinkCount} 件です。
            </p>
          </section>
        </aside>
      </div>
    </article>
  `;
}

export function renderMissingPage(pageModel) {
  return `
    <article class="article-page article-page--missing">
      <nav class="breadcrumbs" aria-label="パンくず">
        <a href="#overview">メインページ</a>
        <span class="breadcrumbs__separator" aria-hidden="true">/</span>
        <span>未作成記事</span>
        <span class="breadcrumbs__separator" aria-hidden="true">/</span>
        <span>${escapeHtml(pageModel.title)}</span>
      </nav>

      <header class="article-page__header">
        <p class="article-page__eyebrow">未作成記事</p>
        <h2>${escapeHtml(pageModel.title)}</h2>
        <p class="article-page__summary">
          この項目はまだ公開記事として作成されていません。参照元と近い既存ページを確認し、必要なら原稿化してください。
        </p>
      </header>

      <div class="article-page__layout">
        <div class="article-page__body">
          <section class="article-section">
            <h3>参照元ページ</h3>
            ${renderEntrySummaryLinks(pageModel.sourceEntries)}
          </section>

          <section class="article-section">
            <h3>投稿導線</h3>
            <ul class="plain-list">
              ${pageModel.participationGuides
                .map((guide) => {
                  return `<li><strong>${escapeHtml(guide.label)}:</strong> ${escapeHtml(guide.description)}</li>`;
                })
                .join("")}
            </ul>
            <p><a href="#participation">メインページの参加案内へ戻る</a></p>
          </section>
        </div>

        <aside class="article-page__sidebar">
          <section class="article-sidebox">
            <h3>近い既存ページ</h3>
            ${renderEntrySummaryLinks(pageModel.suggestions)}
          </section>
        </aside>
      </div>
    </article>
  `;
}

export function renderDisambiguationPage(pageModel) {
  return `
    <article class="article-page article-page--disambiguation">
      <nav class="breadcrumbs" aria-label="パンくず">
        <a href="#overview">メインページ</a>
        <span class="breadcrumbs__separator" aria-hidden="true">/</span>
        <span>曖昧な名称</span>
        <span class="breadcrumbs__separator" aria-hidden="true">/</span>
        <span>${escapeHtml(pageModel.title)}</span>
      </nav>

      <header class="article-page__header">
        <p class="article-page__eyebrow">曖昧な名称</p>
        <h2>${escapeHtml(pageModel.title)}</h2>
        <p class="article-page__summary">
          この名称は複数の記事候補に対応しています。対象ページを選び直してください。
        </p>
      </header>

      <div class="article-page__layout">
        <div class="article-page__body">
          <section class="article-section">
            <h3>候補ページ</h3>
            ${
              pageModel.candidates.length === 0
                ? '<p class="empty-note">候補ページを表示できません。</p>'
                : `<ul class="entry-list entry-list--stacked">${pageModel.candidates
                    .map((entry) => {
                      return `
                        <li>
                          <p class="entry-list__headline">${renderEntryLink(entry)}</p>
                          <p class="entry-list__meta">${escapeHtml(entry.category)} / 最終更新 ${escapeHtml(formatDisplayDate(entry.updated))}</p>
                          <p>${escapeHtml(entry.summary)}</p>
                        </li>
                      `;
                    })
                    .join("")}</ul>`
            }
          </section>
        </div>

        <aside class="article-page__sidebar">
          <section class="article-sidebox">
            <h3>参照元ページ</h3>
            ${renderEntrySummaryLinks(pageModel.sourceEntries)}
          </section>
        </aside>
      </div>
    </article>
  `;
}

export function renderNotFoundPage(label) {
  return `
    <article class="article-page article-page--missing">
      <nav class="breadcrumbs" aria-label="パンくず">
        <a href="#overview">メインページ</a>
        <span class="breadcrumbs__separator" aria-hidden="true">/</span>
        <span>ページ未検出</span>
      </nav>

      <header class="article-page__header">
        <p class="article-page__eyebrow">ページ未検出</p>
        <h2>${escapeHtml(label)}</h2>
        <p class="article-page__summary">
          指定されたページは現在のサンプルデータに存在しません。メインページから辿り直してください。
        </p>
      </header>
    </article>
  `;
}
