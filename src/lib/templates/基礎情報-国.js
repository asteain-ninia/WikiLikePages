export const templateName = "基礎情報 国";

const fieldDefinitions = [
  { key: "訳国名", label: "訳国名" },
  { key: "正式国名", label: "正式国名" },
  { key: "国旗説明", label: "国旗" },
  { key: "標語", label: "標語" },
  { key: "位置説明", label: "位置" },
  { key: "公用語", label: "公用語" },
  { key: "首都", label: "首都" },
  { key: "最大都市", label: "最大都市" },
  { key: "政府", label: "政体" },
  { key: "面積値", label: "面積" },
  { key: "人口値", label: "人口" },
  { key: "人口密度値", label: "人口密度" },
  { key: "人口統計年", label: "統計年" },
  { key: "GDP", label: "GDP" },
  { key: "建国年月日", label: "建国" },
  { key: "通貨", label: "通貨" },
  { key: "国際電話番号", label: "国際電話番号" },
  { key: "注記", label: "注記" },
];

export function build(template) {
  const heading = template.params["訳国名"] || template.positional[0] || "";

  const rows = fieldDefinitions
    .map((field) => {
      const rawValue = (template.params[field.key] ?? "").trim();
      if (!rawValue) {
        return null;
      }

      return { label: field.label, value: rawValue };
    })
    .filter(Boolean);

  return {
    type: "infobox",
    heading,
    image: (template.params["国旗画像px"] ?? "").trim() || null,
    rows,
  };
}
