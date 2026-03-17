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
