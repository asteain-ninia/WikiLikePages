export const templateName = "架空";

export function build(template) {
  const worldName = template.positional[0] || "";
  const text = worldName
    ? `この記事は架空世界「${worldName}」に関するものです。`
    : "この記事は架空世界に関するものです。";

  return {
    type: "notice",
    style: "fictional",
    text,
  };
}
