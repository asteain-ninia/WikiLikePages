export const templateName = "main";

export function build(template) {
  const articleName = template.positional[0] || "";
  if (!articleName) {
    return null;
  }

  return {
    type: "notice",
    style: "main-article",
    text: `詳細は「[[${articleName}]]」を参照。`,
  };
}
