import test from "node:test";
import assert from "node:assert/strict";

import {
  buildArticleRecord,
  extractLeadingTemplates,
  parseFrontmatter,
  parseMarkdownSections,
} from "../src/lib/content-import.js";

test("parseFrontmatter reads scalar, list and boolean values", () => {
  const source = `---
title: デーレ共和国
aliases:
  - デーレ
  - 共和国デーレ
tags:
  - 国家
draft: false
summary: 概要文
---
本文です。`;

  const parsed = parseFrontmatter(source);

  assert.deepEqual(parsed.data, {
    title: "デーレ共和国",
    aliases: ["デーレ", "共和国デーレ"],
    tags: ["国家"],
    draft: false,
    summary: "概要文",
  });
  assert.equal(parsed.body, "本文です。");
});

test("extractLeadingTemplates collects one-line and multiline templates", () => {
  const source = `{{架空|デーレ界}}
{{基礎情報 国
|公用語=[[デーレ語]]
|首都=[[ランパン記念市]]
}}

本文です。`;

  const parsed = extractLeadingTemplates(source);

  assert.deepEqual(
    parsed.templates.map((template) => template.name),
    ["架空", "基礎情報 国"]
  );
  assert.deepEqual(parsed.templates[0].positional, ["デーレ界"]);
  assert.equal(parsed.templates[1].params["公用語"], "[[デーレ語]]");
  assert.equal(parsed.body, "本文です。");
});

test("parseMarkdownSections keeps headings, strips inline templates and flattens lists", () => {
  const sections = parseMarkdownSections(`**白磁海**は[[潮見港]]へ通じる。

## 地理
### [[灯台列島]]
海図改訂は{{要出典|考察}}[[灰塔文庫]]にも残る。
- [[潮見港]]
- [[白磁航路台帳]]
`);

  assert.deepEqual(
    sections.map((section) => section.heading),
    ["概要", "地理", "灯台列島"]
  );
  assert.equal(
    sections[2].paragraphs[0],
    "海図改訂は[[灰塔文庫]]にも残る。"
  );
  assert.equal(sections[2].paragraphs[1], "・[[潮見港]]");
  assert.equal(sections[2].paragraphs[2], "・[[白磁航路台帳]]");
});

test("buildArticleRecord normalizes markdown content into article data", () => {
  const article = buildArticleRecord({
    relativePath: "samples/白磁海.md",
    fileBasename: "白磁海",
    created: "2026-03-10",
    updated: "2026-03-15",
    sourceText: `---
title: 白磁海
category: 世界設定
aliases:
  - 白海
tags:
  - 地理
summary: 白磁海の要約です
---
**白磁海**は、[[潮見港]]と[[星舟連盟]]が向き合う海域である。

## 地理
### [[灯台列島]]
海図改訂は{{要出典|考察}}[[灰塔文庫]]にも残る。
- [[潮見港]]
`,
  });

  assert.equal(article.id, "samples/白磁海");
  assert.equal(article.title, "白磁海");
  assert.equal(article.category, "世界設定");
  assert.deepEqual(article.aliases, ["白海"]);
  assert.deepEqual(article.tags, ["地理", "世界設定"]);
  assert.equal(article.summary, "白磁海の要約です");
  assert.deepEqual(article.relatedTitles, ["潮見港", "星舟連盟", "灯台列島", "灰塔文庫"]);
  assert.deepEqual(
    article.sections.map((section) => section.heading),
    ["概要", "地理", "灯台列島"]
  );
});

test("buildArticleRecord produces templateModels when templateHandlers are provided", () => {
  const templateHandlers = new Map([
    [
      "架空",
      (template) => ({
        type: "notice",
        style: "fictional",
        text: template.positional[0]
          ? `この記事は架空世界「${template.positional[0]}」に関するものです。`
          : "この記事は架空世界に関するものです。",
      }),
    ],
    [
      "基礎情報 国",
      (template) => ({
        type: "infobox",
        heading: template.params["訳国名"] || "",
        rows: [
          { label: "首都", value: template.params["首都"] ?? "" },
        ].filter((row) => row.value),
      }),
    ],
  ]);

  const article = buildArticleRecord({
    relativePath: "samples/テスト国.md",
    fileBasename: "テスト国",
    created: "2026-03-10",
    updated: "2026-03-15",
    templateHandlers,
    sourceText: `---
title: テスト国
---
{{架空|テスト界}}
{{基礎情報 国
|訳国名=テスト国
|首都=[[テスト市]]
}}

**テスト国**は架空の国である。
`,
  });

  assert.equal(article.templateModels.length, 2);
  assert.equal(article.templateModels[0].type, "notice");
  assert.equal(article.templateModels[0].style, "fictional");
  assert.match(article.templateModels[0].text, /テスト界/);
  assert.equal(article.templateModels[1].type, "infobox");
  assert.equal(article.templateModels[1].heading, "テスト国");
  assert.equal(article.templateModels[1].rows[0].label, "首都");
  assert.equal(article.templateModels[1].rows[0].value, "[[テスト市]]");
});

test("buildArticleRecord returns empty templateModels without handlers", () => {
  const article = buildArticleRecord({
    relativePath: "samples/テスト.md",
    fileBasename: "テスト",
    created: "2026-03-10",
    updated: "2026-03-15",
    sourceText: `{{架空|テスト界}}

本文。
`,
  });

  assert.deepEqual(article.templateModels, []);
});

test("parseMarkdownSections extracts callout blocks", () => {
  const sections = parseMarkdownSections(`本文。

> [!note] 注意事項
> これは注意です。
> 二行目。

続きの段落。`);

  assert.equal(sections[0].paragraphs[0], "本文。");
  assert.equal(sections[0].paragraphs[1].type, "callout");
  assert.equal(sections[0].paragraphs[1].calloutType, "note");
  assert.equal(sections[0].paragraphs[1].title, "注意事項");
  assert.match(sections[0].paragraphs[1].body, /注意です/);
  assert.equal(sections[0].paragraphs[2], "続きの段落。");
});

test("parseMarkdownSections preserves safe inline HTML in section paragraphs", () => {
  const sections = parseMarkdownSections(
    "<small>詳しくは参照</small>。<script>alert(1)</script>"
  );

  assert.match(sections[0].paragraphs[0], /<small>詳しくは参照<\/small>/);
  assert.doesNotMatch(sections[0].paragraphs[0], /<script>/);
});

test("parseMarkdownSections preserves inline formatting in section paragraphs", () => {
  const sections = parseMarkdownSections(
    "**太字**と*斜体*と`コード`を含む段落。\n\n## 節\n'''wiki太字'''と''wiki斜体''。"
  );

  assert.equal(sections[0].paragraphs[0], "**太字**と*斜体*と`コード`を含む段落。");
  assert.equal(sections[1].paragraphs[0], "'''wiki太字'''と''wiki斜体''。");
});

test("parseMarkdownSections parses MediaWiki headings (== H2 ==)", () => {
  const sections = parseMarkdownSections(
    "概要文。\n\n== 地理 ==\n地理の説明。\n\n=== 気候 ===\n気候の説明。"
  );

  assert.deepEqual(
    sections.map((s) => s.heading),
    ["概要", "地理", "気候"]
  );
  assert.equal(sections[1].paragraphs[0], "地理の説明。");
  assert.equal(sections[2].paragraphs[0], "気候の説明。");
});

test("parseMarkdownSections parses MediaWiki tables ({| ... |})", () => {
  const sections = parseMarkdownSections(`本文。

{| class="wikitable"
|+ キャプション
! 名前
! 値
|-
| A
| 1
|-
| B
| 2
|}

続き。`);

  assert.equal(sections[0].paragraphs[0], "本文。");
  assert.equal(sections[0].paragraphs[1].type, "table");
  assert.equal(sections[0].paragraphs[1].caption, "キャプション");
  assert.equal(sections[0].paragraphs[1].rows.length, 3);
  assert.equal(sections[0].paragraphs[1].rows[0][0].isHeader, true);
  assert.equal(sections[0].paragraphs[1].rows[0][0].text, "名前");
  assert.equal(sections[0].paragraphs[1].rows[1][0].text, "A");
  assert.equal(sections[0].paragraphs[2], "続き。");
});

test("parseMarkdownSections parses MediaWiki table with rowspan", () => {
  const sections = parseMarkdownSections(`{| class="wikitable"
! Col1
! Col2
|-
| rowspan="2" | span
| A
|-
| B
|}`);

  const row = sections[0].paragraphs[0].rows[1];
  assert.equal(row[0].rowspan, 2);
  assert.equal(row[0].text, "span");
});

test("parseMarkdownSections parses blockquote elements", () => {
  const sections = parseMarkdownSections(
    "前文。\n\n<blockquote>引用文です。</blockquote>\n\n後文。"
  );

  assert.equal(sections[0].paragraphs[0], "前文。");
  assert.equal(sections[0].paragraphs[1].type, "blockquote");
  assert.equal(sections[0].paragraphs[1].body, "引用文です。");
  assert.equal(sections[0].paragraphs[2], "後文。");
});

test("parseMarkdownSections parses inline blockquotes mid-line", () => {
  const sections = parseMarkdownSections(
    "<blockquote>引用A</blockquote>中間テキスト。<blockquote>引用B</blockquote>"
  );

  assert.equal(sections[0].paragraphs[0].type, "blockquote");
  assert.equal(sections[0].paragraphs[0].body, "引用A");
  assert.equal(sections[0].paragraphs[1], "中間テキスト。");
  assert.equal(sections[0].paragraphs[2].type, "blockquote");
  assert.equal(sections[0].paragraphs[2].body, "引用B");
});

test("parseMarkdownSections parses MediaWiki list items (* item)", () => {
  const sections = parseMarkdownSections("* 項目A\n* [[項目B]]");

  assert.equal(sections[0].paragraphs[0], "・項目A");
  assert.equal(sections[0].paragraphs[1], "・[[項目B]]");
});

test("buildArticleRecord extracts footnotes from <ref> tags", () => {
  const article = buildArticleRecord({
    relativePath: "test.wiki",
    fileBasename: "テスト",
    created: "2026-03-20",
    updated: "2026-03-23",
    sourceText: `本文に脚注がある<ref>注釈1</ref>。次<ref>注釈2</ref>。\n\n<references />`,
  });

  assert.equal(article.footnotes.length, 2);
  assert.equal(article.footnotes[0], "注釈1");
  assert.equal(article.footnotes[1], "注釈2");
  assert.match(article.sections[0].paragraphs[0], /\[1\]/);
  assert.match(article.sections[0].paragraphs[0], /\[2\]/);
});

test("buildArticleRecord extracts [[Category:...]] as tags", () => {
  const article = buildArticleRecord({
    relativePath: "test.wiki",
    fileBasename: "テスト",
    created: "2026-03-20",
    updated: "2026-03-23",
    sourceText: `本文。\n[[Category:ガフィーク]][[Category:ティネブリスの国]]`,
  });

  assert.ok(article.tags.includes("ガフィーク"));
  assert.ok(article.tags.includes("ティネブリスの国"));
});

test("buildArticleRecord converts [[ファイル:...]] to embed syntax", () => {
  const article = buildArticleRecord({
    relativePath: "test.wiki",
    fileBasename: "テスト",
    created: "2026-03-20",
    updated: "2026-03-23",
    sourceText: `[[ファイル:map.png|サムネイル|説明]]\n\n本文。`,
  });

  assert.match(article.sections[0].paragraphs[0], /!\[\[map\.png\]\]/);
});

test("buildArticleRecord infers title from MediaWiki bold ('''タイトル''')", () => {
  const article = buildArticleRecord({
    relativePath: "test.wiki",
    fileBasename: "テスト",
    created: "2026-03-20",
    updated: "2026-03-23",
    sourceText: `'''テスト国'''は架空の国である。`,
  });

  assert.equal(article.title, "テスト国");
});

test("buildArticleRecord strips file extension from id for .wiki files", () => {
  const article = buildArticleRecord({
    relativePath: "qafik.wiki",
    fileBasename: "qafik",
    created: "2026-03-20",
    updated: "2026-03-23",
    sourceText: `本文。`,
  });

  assert.equal(article.id, "qafik");
});

test("parseMarkdownSections handles {{main|...}} as main-article link", () => {
  const article = buildArticleRecord({
    relativePath: "test.wiki",
    fileBasename: "テスト",
    created: "2026-03-20",
    updated: "2026-03-23",
    sourceText: `本文。\n\n== 歴史 ==\n{{main|テストの歴史}}テストの歴史は長い。`,
  });

  const historySec = article.sections.find((s) => s.heading === "歴史");
  assert.ok(historySec);
  assert.equal(historySec.paragraphs[0].type, "main-article");
  assert.equal(historySec.paragraphs[0].articleName, "テストの歴史");
  assert.match(historySec.paragraphs[1], /歴史は長い/);
});

test("extractLeadingTemplates finds templates after intro paragraph", () => {
  const source = `'''テスト国'''は架空の国である。

{{基礎情報 国
|首都=[[テスト市]]
}}

本文です。`;

  const parsed = extractLeadingTemplates(source);

  assert.equal(parsed.templates.length, 1);
  assert.equal(parsed.templates[0].name, "基礎情報 国");
  assert.equal(parsed.templates[0].params["首都"], "[[テスト市]]");
  assert.match(parsed.body, /テスト国/);
  assert.match(parsed.body, /本文です/);
  assert.ok(!parsed.body.includes("基礎情報 国"));
});

test("buildArticleRecord extracts relatedTitles from table cells", () => {
  const article = buildArticleRecord({
    relativePath: "test.wiki",
    fileBasename: "テスト",
    created: "2026-03-20",
    updated: "2026-03-23",
    sourceText: `本文。\n\n{| class="wikitable"\n! 名前\n|-\n| [[テーブルリンク先]]\n|}`,
  });

  assert.ok(article.relatedTitles.includes("テーブルリンク先"));
});

test("buildArticleRecord extracts relatedTitles from blockquote body", () => {
  const article = buildArticleRecord({
    relativePath: "test.wiki",
    fileBasename: "テスト",
    created: "2026-03-20",
    updated: "2026-03-23",
    sourceText: `本文。\n\n<blockquote>[[引用リンク先]]の言葉。</blockquote>`,
  });

  assert.ok(article.relatedTitles.includes("引用リンク先"));
});
