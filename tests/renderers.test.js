import test from "node:test";
import assert from "node:assert/strict";

import {
  escapeHtml,
  renderArticlePage,
  renderCategoryCards,
  renderDisambiguationPage,
  renderFeaturedArticle,
  renderInfobox,
  renderInlineMarkdown,
  renderMissingPage,
  renderNotFoundPage,
  renderNotice,
  renderPreviewArticle,
  renderSearchResults,
  renderSummaryList,
  renderTemplateModels,
  renderUpdateList,
} from "../src/lib/renderers.js";

const fixtureEntry = {
  id: "entry-1",
  title: '封蝋院 <script>alert("x")</script>',
  category: "組織",
  created: "2026-03-10",
  updated: "2026-03-15",
  summary: "通行証を扱う行政機関",
  preview: "物流と政治の結節点",
  keywords: ["通行証", "行政"],
  relatedTitles: ["白磁海", "潮見港"],
};

test("escapeHtml escapes the five critical HTML characters", () => {
  assert.equal(
    escapeHtml(`&<>"'`),
    "&amp;&lt;&gt;&quot;&#39;"
  );
});

test("renderFeaturedArticle escapes dangerous text and keeps the article route", () => {
  const rendered = renderFeaturedArticle(fixtureEntry);

  assert.match(rendered, /#!article\/entry-1/);
  assert.doesNotMatch(rendered, /<script>/);
  assert.match(rendered, /&lt;script&gt;alert/);
});

test("renderPreviewArticle includes related titles", () => {
  const rendered = renderPreviewArticle(fixtureEntry);

  assert.match(rendered, /関連ページ/);
  assert.match(rendered, /白磁海/);
  assert.match(rendered, /潮見港/);
});

test("renderSummaryList renders fallback text for empty entries", () => {
  assert.match(renderSummaryList([]), /記事がありません/);
});

test("renderUpdateList renders formatted update meta", () => {
  const rendered = renderUpdateList([fixtureEntry]);
  assert.match(rendered, /最終更新 2026\.03\.15/);
});

test("renderSearchResults reports the number of matches", () => {
  const rendered = renderSearchResults("封蝋", [fixtureEntry]);
  assert.match(rendered, /1 件あります/);
});

test("renderCategoryCards renders article counts", () => {
  const rendered = renderCategoryCards([
    { name: "世界設定", description: "desc", articleCount: 2 },
  ]);

  assert.match(rendered, /記事数 2/);
});

test("renderArticlePage marks missing links with wiki-link--missing", () => {
  const rendered = renderArticlePage({
    id: "entry-1",
    title: "白磁海",
    category: "世界設定",
    created: "2026-03-10",
    updated: "2026-03-15",
    summary: "summary",
    aliases: ["白海"],
    tags: ["地理"],
    unresolvedLinkCount: 1,
    backlinks: [{ id: "entry-2", title: "潮見港", category: "世界設定", updated: "2026-03-14" }],
    sections: [
      {
        heading: "概要",
        anchorId: "section-overview",
        paragraphs: [
          [
            { type: "text", value: "本文 " },
            {
              type: "link",
              status: "missing",
              href: "#!missing/%E7%99%BD%E7%A3%81%E8%88%AA%E8%B7%AF%E5%8F%B0%E5%B8%B3",
              label: "白磁航路台帳",
              title: "白磁航路台帳",
            },
          ],
        ],
      },
    ],
  });

  assert.match(rendered, /wiki-link--missing/);
  assert.match(rendered, /バックリンク/);
  assert.match(rendered, /未作成または曖昧なリンクは 1 件/);
});

test("renderMissingPage shows source entries and guidance", () => {
  const rendered = renderMissingPage({
    title: "白磁航路台帳",
    sourceEntries: [{ id: "entry-1", title: "白磁海", category: "世界設定", updated: "2026-03-15" }],
    suggestions: [{ id: "entry-2", title: "潮見港", category: "世界設定", updated: "2026-03-14" }],
    participationGuides: [{ label: "標準投稿", description: "PRで提出" }],
  });

  assert.match(rendered, /参照元ページ/);
  assert.match(rendered, /近い既存ページ/);
  assert.match(rendered, /標準投稿/);
});

test("renderDisambiguationPage lists candidate pages", () => {
  const rendered = renderDisambiguationPage({
    title: "調査記録",
    candidates: [{ id: "a", title: "調査記録A", category: "年表", updated: "2026-03-12", summary: "A" }],
    sourceEntries: [{ id: "entry-1", title: "白磁海", category: "世界設定", updated: "2026-03-15" }],
  });

  assert.match(rendered, /曖昧な名称/);
  assert.match(rendered, /調査記録A/);
});

test("renderNotFoundPage shows a fallback message", () => {
  const rendered = renderNotFoundPage("missing-id");
  assert.match(rendered, /ページ未検出/);
  assert.match(rendered, /missing-id/);
});

test("renderInlineMarkdown converts **bold** to <strong>", () => {
  assert.equal(renderInlineMarkdown("前 **太字** 後"), "前 <strong>太字</strong> 後");
});

test("renderInlineMarkdown converts *italic* to <em>", () => {
  assert.equal(renderInlineMarkdown("前 *斜体* 後"), "前 <em>斜体</em> 後");
});

test("renderInlineMarkdown converts `code` to <code>", () => {
  assert.equal(
    renderInlineMarkdown("前 `コード` 後"),
    '前 <code class="inline-code">コード</code> 後'
  );
});

test("renderInlineMarkdown converts ***bold italic*** to nested tags", () => {
  assert.equal(
    renderInlineMarkdown("***強調斜体***"),
    "<strong><em>強調斜体</em></strong>"
  );
});

test("renderInlineMarkdown converts MediaWiki bold/italic syntax", () => {
  const escaped = escapeHtml("'''wiki太字'''と''wiki斜体''");
  const rendered = renderInlineMarkdown(escaped);
  assert.match(rendered, /<strong>wiki太字<\/strong>/);
  assert.match(rendered, /<em>wiki斜体<\/em>/);
});

test("renderInfobox renders table with heading and rows", () => {
  const rendered = renderInfobox({
    heading: "テスト国",
    rows: [
      { label: "首都", value: "テスト市", segments: [{ type: "text", value: "テスト市" }] },
      { label: "公用語", value: "テスト語" },
    ],
  });

  assert.match(rendered, /infobox__heading/);
  assert.match(rendered, /テスト国/);
  assert.match(rendered, /infobox__label/);
  assert.match(rendered, /首都/);
  assert.match(rendered, /テスト市/);
  assert.match(rendered, /テスト語/);
});

test("renderInfobox renders wikilinks in row segments", () => {
  const rendered = renderInfobox({
    heading: "国名",
    rows: [
      {
        label: "首都",
        value: "[[ランパン市]]",
        segments: [
          {
            type: "link",
            status: "resolved",
            href: "#!article/ranpan",
            label: "ランパン市",
            title: "ランパン市",
          },
        ],
      },
    ],
  });

  assert.match(rendered, /wiki-link/);
  assert.match(rendered, /ランパン市/);
  assert.match(rendered, /#!article\/ranpan/);
});

test("renderNotice renders aside with style class", () => {
  const rendered = renderNotice({
    type: "notice",
    style: "fictional",
    text: "この記事は架空世界に関するものです。",
  });

  assert.match(rendered, /notice--fictional/);
  assert.match(rendered, /架空世界/);
  assert.match(rendered, /role="note"/);
});

test("renderTemplateModels renders both infoboxes and notices", () => {
  const rendered = renderTemplateModels([
    { type: "notice", style: "fictional", text: "架空" },
    { type: "infobox", heading: "国", rows: [{ label: "首都", value: "市" }] },
  ]);

  assert.match(rendered, /notice--fictional/);
  assert.match(rendered, /infobox/);
});

test("renderTemplateModels returns empty string for empty or missing input", () => {
  assert.equal(renderTemplateModels([]), "");
  assert.equal(renderTemplateModels(null), "");
  assert.equal(renderTemplateModels(undefined), "");
});

test("renderArticlePage includes notice and infobox from templateModels", () => {
  const rendered = renderArticlePage({
    id: "entry-1",
    title: "テスト国",
    category: "国家",
    created: "2026-03-10",
    updated: "2026-03-15",
    summary: "テスト",
    aliases: [],
    tags: ["国家"],
    unresolvedLinkCount: 0,
    backlinks: [],
    sections: [],
    templateModels: [
      { type: "notice", style: "fictional", text: "架空世界です。" },
      {
        type: "infobox",
        heading: "テスト国",
        rows: [{ label: "首都", value: "テスト市", segments: [{ type: "text", value: "テスト市" }] }],
      },
    ],
  });

  assert.match(rendered, /notice--fictional/);
  assert.match(rendered, /架空世界です。/);
  assert.match(rendered, /infobox__heading/);
  assert.match(rendered, /テスト国/);
});
