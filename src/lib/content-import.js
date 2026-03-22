function normalizeNewlines(value) {
  return String(value).replace(/\r\n?/g, "\n");
}

function stripWrappingQuotes(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

function parseScalarValue(rawValue) {
  const value = stripWrappingQuotes(rawValue.trim());
  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return value;
}

function replaceWikiMarkupWithPlainText(text) {
  return text.replace(/\[\[([^[\]]+?)\]\]/g, (_match, token) => {
    const [targetPart, displayPart] = token.split("|");
    const [pageTitle] = targetPart.split("#");
    const displayText = displayPart?.trim();

    return displayText || pageTitle.trim();
  });
}

function stripInlineHtml(text) {
  return text
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/?[^>]+>/g, "");
}

function sanitizeInlineHtml(text) {
  return text
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<(?!\/?(?:small|sup|sub)\b)[^>]+>/gi, "");
}

function stripInlineFormatting(text) {
  return text
    .replace(/'''([^']+?)'''/g, "$1")
    .replace(/''([^']+?)''/g, "$1")
    .replace(/\*\*([^*]+?)\*\*/g, "$1")
    .replace(/__([^_]+?)__/g, "$1")
    .replace(/\*([^*\n]+?)\*/g, "$1")
    .replace(/_([^_\n]+?)_/g, "$1")
    .replace(/`([^`\n]+?)`/g, "$1");
}

function collapseSpaces(text) {
  return text.replace(/[ \t]+/g, " ").trim();
}

function normalizeInlineText(text) {
  return collapseSpaces(stripInlineFormatting(stripInlineHtml(text)));
}

function mergeParagraphLine(currentParagraph, nextLine) {
  if (!currentParagraph) {
    return nextLine;
  }

  if (
    /[A-Za-z0-9)]$/.test(currentParagraph) &&
    /^[A-Za-z0-9(]/.test(nextLine)
  ) {
    return `${currentParagraph} ${nextLine}`;
  }

  return `${currentParagraph}${nextLine}`;
}

function stripInlineTemplates(text) {
  let result = "";

  for (let index = 0; index < text.length; index += 1) {
    const pair = text.slice(index, index + 2);
    if (pair === "{{") {
      let depth = 1;
      index += 2;

      while (index < text.length && depth > 0) {
        const nestedPair = text.slice(index, index + 2);
        if (nestedPair === "{{") {
          depth += 1;
          index += 2;
          continue;
        }

        if (nestedPair === "}}") {
          depth -= 1;
          index += 2;
          continue;
        }

        index += 1;
      }

      index -= 1;
      continue;
    }

    result += text[index];
  }

  return result;
}

function parseListValue(rawValue) {
  const normalized = rawValue.trim();
  if (!normalized) {
    return "";
  }

  return parseScalarValue(normalized);
}

export function parseFrontmatter(sourceText) {
  const source = normalizeNewlines(sourceText);
  if (!source.startsWith("---\n")) {
    return {
      data: {},
      body: source,
    };
  }

  const lines = source.split("\n");
  const data = {};
  let currentKey = "";
  let closingIndex = -1;

  for (let lineIndex = 1; lineIndex < lines.length; lineIndex += 1) {
    const line = lines[lineIndex];
    if (line.trim() === "---") {
      closingIndex = lineIndex;
      break;
    }

    if (!line.trim()) {
      continue;
    }

    const keyMatch = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line);
    if (keyMatch) {
      const [, key, rawValue] = keyMatch;
      currentKey = key;

      if (!rawValue.trim()) {
        data[key] = [];
      } else {
        data[key] = parseScalarValue(rawValue);
      }

      continue;
    }

    const listItemMatch = /^\s*-\s*(.+)$/.exec(line);
    if (listItemMatch && currentKey) {
      const nextValue = parseListValue(listItemMatch[1]);
      if (Array.isArray(data[currentKey])) {
        data[currentKey].push(nextValue);
      } else {
        data[currentKey] = [nextValue];
      }
    }
  }

  if (closingIndex === -1) {
    return {
      data: {},
      body: source,
    };
  }

  return {
    data,
    body: lines.slice(closingIndex + 1).join("\n").replace(/^\n+/, ""),
  };
}

function parseTemplateLineContent(content) {
  const lines = content.split("\n");
  const firstLine = lines[0]?.trim() ?? "";
  const [namePart, ...positionalParts] = firstLine.split("|");
  const template = {
    name: namePart.trim(),
    positional: positionalParts.filter(Boolean).map((value) => value.trim()),
    params: {},
  };

  for (const line of lines.slice(1)) {
    const parameterMatch = /^\|\s*([^=]+?)\s*=\s*(.*)$/.exec(line.trim());
    if (parameterMatch) {
      const [, key, value] = parameterMatch;
      template.params[key.trim()] = value.trim();
      continue;
    }

    const positionalMatch = /^\|\s*(.+)$/.exec(line.trim());
    if (positionalMatch) {
      template.positional.push(positionalMatch[1].trim());
    }
  }

  return template;
}

export function extractLeadingTemplates(sourceText) {
  const source = normalizeNewlines(sourceText);
  const templates = [];
  let cursor = 0;

  while (cursor < source.length) {
    while (cursor < source.length && /\s/.test(source[cursor])) {
      cursor += 1;
    }

    if (source.slice(cursor, cursor + 2) !== "{{") {
      break;
    }

    let depth = 0;
    let index = cursor;

    while (index < source.length) {
      const pair = source.slice(index, index + 2);
      if (pair === "{{") {
        depth += 1;
        index += 2;
        continue;
      }

      if (pair === "}}") {
        depth -= 1;
        index += 2;
        if (depth === 0) {
          const templateSource = source.slice(cursor + 2, index - 2);
          templates.push(parseTemplateLineContent(templateSource.trim()));
          cursor = index;
          break;
        }

        continue;
      }

      index += 1;
    }

    if (depth !== 0) {
      break;
    }
  }

  return {
    templates,
    body: source.slice(cursor).replace(/^\s+/, ""),
  };
}

function inferTitle(frontmatter, introParagraphs, fileBasename) {
  if (typeof frontmatter.title === "string" && frontmatter.title.trim()) {
    return frontmatter.title.trim();
  }

  const leadingParagraph = introParagraphs[0] ?? "";
  const boldTitleMatch = /^\*\*(.+?)\*\*/.exec(leadingParagraph);
  if (boldTitleMatch) {
    return normalizeInlineText(replaceWikiMarkupWithPlainText(boldTitleMatch[1]));
  }

  return fileBasename;
}

function inferCategory(frontmatter, templates, title) {
  if (typeof frontmatter.category === "string" && frontmatter.category.trim()) {
    return frontmatter.category.trim();
  }

  if (templates.some((template) => template.name === "基礎情報 国")) {
    return "国家";
  }

  if (title.includes("諸国") || title.includes("圏") || title.includes("地方")) {
    return "地域";
  }

  if (
    /(共和国|帝国|王国|君主国|都市国|合議国|公国|国家|領国|自治領|都市国家)/.test(title)
  ) {
    return "国家";
  }

  return "記事";
}

function normalizeHeadingText(rawHeading) {
  return normalizeInlineText(replaceWikiMarkupWithPlainText(rawHeading));
}

function normalizeSectionText(rawParagraph) {
  return collapseSpaces(sanitizeInlineHtml(stripInlineTemplates(rawParagraph)));
}

function normalizeParagraphText(rawParagraph) {
  return normalizeInlineText(stripInlineTemplates(rawParagraph));
}

function parseCalloutLines(lines, startIndex) {
  const firstLine = lines[startIndex].trim();
  const calloutMatch = /^>\s*\[!(\w+)\]\s*(.*)$/.exec(firstLine);
  if (!calloutMatch) {
    return null;
  }

  const calloutType = calloutMatch[1].toLowerCase();
  const title = calloutMatch[2].trim();
  const bodyLines = [];
  let endIndex = startIndex + 1;

  while (endIndex < lines.length) {
    const line = lines[endIndex].trim();
    if (line.startsWith("> ")) {
      bodyLines.push(line.slice(2));
      endIndex += 1;
      continue;
    }

    if (line === ">") {
      bodyLines.push("");
      endIndex += 1;
      continue;
    }

    break;
  }

  return {
    type: "callout",
    calloutType,
    title: title || calloutType,
    body: bodyLines.join("\n").trim(),
    endIndex,
  };
}

function buildParagraphs(lines) {
  const paragraphs = [];
  let currentParagraph = "";
  let lineIndex = 0;

  function flushParagraph() {
    if (!currentParagraph) {
      return;
    }

    paragraphs.push(currentParagraph);
    currentParagraph = "";
  }

  while (lineIndex < lines.length) {
    const rawLine = lines[lineIndex];
    const line = rawLine.trimEnd();
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      lineIndex += 1;
      continue;
    }

    const callout = parseCalloutLines(lines, lineIndex);
    if (callout) {
      flushParagraph();
      paragraphs.push({
        type: "callout",
        calloutType: callout.calloutType,
        title: callout.title,
        body: callout.body,
      });
      lineIndex = callout.endIndex;
      continue;
    }

    const headingMatch = /^(#{2,6})\s+(.+)$/.exec(trimmed);
    if (headingMatch) {
      flushParagraph();
      paragraphs.push({
        type: "heading",
        level: headingMatch[1].length,
        text: headingMatch[2].trim(),
      });
      lineIndex += 1;
      continue;
    }

    const bulletMatch =
      /^([*\-+])(?:\s+|(?=<))(.+)$/.exec(trimmed) ?? /^(・)\s*(.+)$/.exec(trimmed);
    const orderedMatch = /^(\d+)[.)]\s+(.+)$/.exec(trimmed);
    if (bulletMatch || orderedMatch) {
      flushParagraph();
      const itemText = bulletMatch ? bulletMatch[2] : orderedMatch?.[2] ?? "";
      const normalizedItem = normalizeSectionText(itemText);
      if (normalizedItem) {
        paragraphs.push(`・${normalizedItem}`);
      }
      lineIndex += 1;
      continue;
    }

    currentParagraph = mergeParagraphLine(currentParagraph, line.trim());
    lineIndex += 1;
  }

  flushParagraph();
  return paragraphs;
}

export function parseMarkdownSections(sourceText) {
  const lines = normalizeNewlines(sourceText).split("\n");
  const tokens = buildParagraphs(lines);
  const sections = [];
  let currentSection = {
    rawHeading: "",
    heading: "概要",
    paragraphs: [],
  };

  function flushSection() {
    if (currentSection.paragraphs.length === 0 && !currentSection.rawHeading) {
      return;
    }

    sections.push({
      sourceHeading: currentSection.rawHeading,
      heading: currentSection.heading,
      paragraphs: currentSection.paragraphs,
    });
  }

  for (const token of tokens) {
    if (typeof token === "string") {
      const paragraph = normalizeSectionText(token);
      if (paragraph) {
        currentSection.paragraphs.push(paragraph);
      }
      continue;
    }

    if (token.type === "callout") {
      currentSection.paragraphs.push(token);
      continue;
    }

    if (token.type === "heading") {
      flushSection();
      currentSection = {
        rawHeading: token.text,
        heading: normalizeHeadingText(token.text) || "節",
        paragraphs: [],
      };
    }
  }

  flushSection();

  if (
    sections.length >= 2 &&
    !sections[0].sourceHeading &&
    sections[0].heading === sections[1].heading
  ) {
    return [
      {
        ...sections[1],
        paragraphs: [...sections[0].paragraphs, ...sections[1].paragraphs],
      },
      ...sections.slice(2),
    ];
  }

  return sections;
}

function truncateText(text, maxLength) {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 1).trimEnd()}…`;
}

function buildSummaryParagraphs(sections) {
  const collected = [];

  for (const section of sections) {
    for (const paragraph of section.paragraphs) {
      if (paragraph.startsWith("・")) {
        continue;
      }

      collected.push(paragraph);
      if (collected.length >= 2) {
        return collected;
      }
    }
  }

  return collected;
}

function normalizePlainText(text) {
  return normalizeInlineText(replaceWikiMarkupWithPlainText(text));
}

function buildUniqueList(values, maxItems = Infinity) {
  const result = [];
  const seen = new Set();

  for (const value of values) {
    const normalized = String(value).trim();
    if (!normalized || seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    result.push(normalized);

    if (result.length >= maxItems) {
      break;
    }
  }

  return result;
}

function extractWikiLinkTargets(text) {
  const matches = [];
  const pattern = /\[\[([^[\]]+?)\]\]/g;
  let match = pattern.exec(text);

  while (match) {
    const [targetPart] = match[1].split("|");
    const [pageTitle] = targetPart.split("#");
    if (pageTitle.trim()) {
      matches.push(pageTitle.trim());
    }

    match = pattern.exec(text);
  }

  return matches;
}

function buildTemplateModels(templates, templateHandlers) {
  if (!templateHandlers || templateHandlers.size === 0) {
    return [];
  }

  return templates
    .map((template) => {
      const handler = templateHandlers.get(template.name);
      return handler ? handler(template) : null;
    })
    .filter(Boolean);
}

export function buildArticleRecord({
  relativePath,
  fileBasename,
  sourceText,
  created,
  updated,
  templateHandlers,
}) {
  const { data: frontmatter, body: sourceWithoutFrontmatter } = parseFrontmatter(sourceText);
  const { templates, body: bodyWithoutLeadingTemplates } =
    extractLeadingTemplates(sourceWithoutFrontmatter);
  const cleanedBody = stripInlineTemplates(bodyWithoutLeadingTemplates).trim();
  const sections = parseMarkdownSections(cleanedBody);
  const leadParagraphs = buildSummaryParagraphs(sections);
  const title = inferTitle(frontmatter, leadParagraphs, fileBasename);
  const aliases = buildUniqueList(
    [
      ...(Array.isArray(frontmatter.aliases) ? frontmatter.aliases : []),
      fileBasename !== title ? fileBasename : "",
    ],
    12
  );
  const tags = buildUniqueList([
    ...(Array.isArray(frontmatter.tags) ? frontmatter.tags : []),
    inferCategory(frontmatter, templates, title),
  ]);
  const allSourceText = sections
    .flatMap((section) => [section.sourceHeading, ...section.paragraphs])
    .filter(Boolean)
    .join("\n");
  const relatedTitles = buildUniqueList(extractWikiLinkTargets(allSourceText), 6);
  const keywords = buildUniqueList(
    [
      ...tags,
      ...relatedTitles,
      ...sections.map((section) => section.heading),
    ],
    8
  );
  const summarySource = normalizePlainText(frontmatter.summary ?? leadParagraphs[0] ?? title);
  const previewSource = normalizePlainText(
    leadParagraphs.length > 0 ? leadParagraphs.join(" ") : summarySource
  );

  return {
    id: relativePath.replace(/\\/g, "/").replace(/\.md$/i, ""),
    title,
    aliases,
    category: inferCategory(frontmatter, templates, title),
    created,
    updated,
    summary: truncateText(summarySource, 96),
    preview: truncateText(previewSource, 220),
    tags,
    keywords,
    relatedTitles,
    sourcePath: relativePath.replace(/\\/g, "/"),
    templates: templates.map((template) => template.name),
    templateModels: buildTemplateModels(templates, templateHandlers),
    sections,
    draft: frontmatter.draft === true,
    isSample: relativePath.replace(/\\/g, "/").startsWith("samples/"),
  };
}
