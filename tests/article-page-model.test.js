import test from "node:test";
import assert from "node:assert/strict";

import {
  buildArticleHref,
  buildArticlePageModel,
  buildDisambiguationPageModel,
  buildMissingPageModel,
  buildReferenceIndex,
  buildWikiGraph,
  buildWikiTextSegments,
  extractWikiLinks,
  parseAppRoute,
  resolveArticleReference,
} from "../src/lib/article-page-model.js";

const fixtureEntries = [
  {
    id: "sea",
    title: "白磁海",
    aliases: ["白海"],
    category: "世界設定",
    created: "2026-03-10",
    updated: "2026-03-15",
    summary: "海域ページ",
    sections: [
      {
        heading: "概要",
        paragraphs: ["[[潮見港]]と[[白磁航路台帳]]を参照する。"],
      },
    ],
  },
  {
    id: "port",
    title: "潮見港",
    category: "世界設定",
    created: "2026-03-11",
    updated: "2026-03-14",
    summary: "港ページ",
    sections: [
      {
        heading: "概要",
        paragraphs: ["[[白海]]と[[調査記録]]を参照する。"],
      },
    ],
  },
  {
    id: "survey-a",
    title: "調査記録A",
    aliases: ["調査記録"],
    category: "年表",
    created: "2026-03-12",
    updated: "2026-03-13",
    summary: "A",
    sections: [],
  },
  {
    id: "survey-b",
    title: "調査記録B",
    aliases: ["調査記録"],
    category: "年表",
    created: "2026-03-12",
    updated: "2026-03-16",
    summary: "B",
    sections: [],
  },
];

const fixtureSiteConfig = {
  participationGuides: [
    {
      label: "標準投稿",
      description: "Pull Request で提出する",
    },
  ],
};

test("extractWikiLinks parses simple, display-text and heading links", () => {
  assert.deepEqual(extractWikiLinks("[[白磁海]] [[潮見港|港]] [[白磁海#航路]]"), [
    {
      raw: "[[白磁海]]",
      start: 0,
      end: 7,
      pageTitle: "白磁海",
      heading: "",
      displayText: "",
    },
    {
      raw: "[[潮見港|港]]",
      start: 8,
      end: 17,
      pageTitle: "潮見港",
      heading: "",
      displayText: "港",
    },
    {
      raw: "[[白磁海#航路]]",
      start: 18,
      end: 28,
      pageTitle: "白磁海",
      heading: "航路",
      displayText: "",
    },
  ]);
});

test("buildReferenceIndex resolves titles and aliases", () => {
  const referenceIndex = buildReferenceIndex(fixtureEntries);
  const entryById = new Map(fixtureEntries.map((entry) => [entry.id, entry]));

  assert.equal(
    resolveArticleReference(referenceIndex, entryById, "白海").type,
    "article"
  );
  assert.equal(
    resolveArticleReference(referenceIndex, entryById, "調査記録").type,
    "ambiguous"
  );
  assert.equal(
    resolveArticleReference(referenceIndex, entryById, "白磁航路台帳").type,
    "missing"
  );
});

test("buildWikiGraph collects backlinks, missing pages and disambiguation pages", () => {
  const graph = buildWikiGraph(fixtureEntries);

  assert.deepEqual(
    graph.backlinksById.port.map((entry) => entry.id),
    ["sea"]
  );
  assert.deepEqual(
    graph.backlinksById.sea.map((entry) => entry.id),
    ["port"]
  );
  assert.deepEqual(
    graph.missingPagesByTitle["白磁航路台帳"].sourceEntries.map((entry) => entry.id),
    ["sea"]
  );
  assert.deepEqual(
    graph.disambiguationPagesByTitle["調査記録"].candidates.map((entry) => entry.id),
    ["survey-b", "survey-a"]
  );
});

test("buildWikiGraph also resolves links that appear in section headings", () => {
  const graph = buildWikiGraph([
    {
      id: "sea",
      title: "白磁海",
      category: "世界設定",
      created: "2026-03-10",
      updated: "2026-03-15",
      summary: "海域ページ",
      sections: [],
    },
    {
      id: "guide",
      title: "白磁海案内",
      category: "世界設定",
      created: "2026-03-11",
      updated: "2026-03-14",
      summary: "案内ページ",
      sections: [
        {
          heading: "白磁海",
          sourceHeading: "[[白磁海]]",
          paragraphs: [],
        },
      ],
    },
  ]);

  assert.deepEqual(
    graph.backlinksById.sea.map((entry) => entry.id),
    ["guide"]
  );
});

test("buildWikiTextSegments turns unresolved links into missing-page routes", () => {
  const graph = buildWikiGraph(fixtureEntries);
  const segments = buildWikiTextSegments("本文 [[白磁航路台帳]] 末尾", graph);

  assert.deepEqual(segments, [
    { type: "text", value: "本文 " },
    {
      type: "link",
      status: "missing",
      href: "#!missing/%E7%99%BD%E7%A3%81%E8%88%AA%E8%B7%AF%E5%8F%B0%E5%B8%B3",
      label: "白磁航路台帳",
      title: "白磁航路台帳",
    },
    { type: "text", value: " 末尾" },
  ]);
});

test("buildArticlePageModel includes backlinks and unresolved link counts", () => {
  const graph = buildWikiGraph(fixtureEntries);
  const pageModel = buildArticlePageModel(graph, "sea");

  assert.equal(pageModel?.backlinks.length, 1);
  assert.equal(pageModel?.backlinks[0].id, "port");
  assert.equal(pageModel?.unresolvedLinkCount, 1);
  assert.equal(pageModel?.sections[0].paragraphs[0][0].type, "link");
});

test("buildMissingPageModel returns source pages and suggestions", () => {
  const graph = buildWikiGraph(fixtureEntries);
  const missingPageModel = buildMissingPageModel(graph, fixtureSiteConfig, "白磁航路台帳");

  assert.deepEqual(
    missingPageModel.sourceEntries.map((entry) => entry.id),
    ["sea"]
  );
  assert.ok(Array.isArray(missingPageModel.suggestions));
});

test("buildDisambiguationPageModel returns candidate entries", () => {
  const graph = buildWikiGraph(fixtureEntries);
  const pageModel = buildDisambiguationPageModel(graph, "調査記録");

  assert.deepEqual(
    pageModel?.candidates.map((entry) => entry.id),
    ["survey-b", "survey-a"]
  );
});

test("parseAppRoute understands article, missing and home routes", () => {
  assert.deepEqual(parseAppRoute(buildArticleHref("sea", "概要")), {
    view: "article",
    entryId: "sea",
    sectionHeading: "概要",
  });
  assert.deepEqual(parseAppRoute("#!missing/%E7%99%BD%E7%A3%81%E6%B5%B7"), {
    view: "missing",
    title: "白磁海",
  });
  assert.deepEqual(parseAppRoute("#overview"), { view: "home" });
});
