export const siteConfig = {
  preferredFeaturedId: "white-porcelain-sea",
  newArticleLimit: 4,
  recentUpdateLimit: 4,
  categoryDefinitions: [
    {
      name: "世界設定",
      description: "地理、都市、海域、文化、用語集などの基礎設定を束ねるカテゴリです。",
    },
    {
      name: "人物",
      description: "登場人物、役職、家系、別名、所属先を整理するページ群です。",
    },
    {
      name: "組織",
      description: "国家、商会、行政機関、宗教組織などの制度面をまとめます。",
    },
    {
      name: "年表",
      description: "事件や変遷を時系列で整理し、関連ページへ接続する入口です。",
    },
  ],
  participationGuides: [
    {
      label: "標準投稿",
      description: "Obsidian で編集し、Pull Request でレビューします。",
    },
    {
      label: "簡易投稿",
      description: "GitHub Issue Form から原稿要素だけを送り、管理者がPR化します。",
    },
    {
      label: "非GitHub参加",
      description: "フォームかメールの投稿箱を受け口にし、正本は必ずGitHubへ集約します。",
    },
  ],
  processSteps: [
    "Obsidian で記事原稿を整える",
    "Pull Request または投稿箱経由で提出する",
    "レビューでリンクとfrontmatterを確認する",
    "承認後にGitHub Pagesへ反映する",
  ],
  implementationNotes: [
    "2026-03-17 時点でルート直下の試作品を archive/prototypes/ に隔離しました。",
    "トップページはデータ層、モデル層、描画層を分け、将来のMarkdown連携に備えています。",
    "検索、カテゴリ集計、選り抜き記事選定は純粋関数化し、Node組み込みテストで検証します。",
    "次段階では Quartz もしくは同等の静的生成フローへ接続できる形へ寄せます。",
  ],
};
