export const siteConfig = {
  preferredFeaturedId: "samples/デーレ共和国",
  newArticleLimit: 4,
  recentUpdateLimit: 4,
  categoryDefinitions: [
    {
      name: "国家",
      description: "国家、都市国家、同君王国、帝国などのページをまとめるカテゴリです。",
    },
    {
      name: "地域",
      description: "文化圏、地方、諸国、海域などの広域ページをまとめます。",
    },
    {
      name: "人物",
      description: "登場人物、役職、家系、別名、所属先を整理するページ群です。",
    },
    {
      name: "組織",
      description: "商会、行政機関、宗教組織などの制度面をまとめます。",
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
    "レビューでリンクと frontmatter を確認する",
    "承認後にGitHub Pagesへ反映する",
  ],
  implementationNotes: [
    "2026-03-17 時点でルート直下の試作品を archive/prototypes/ に隔離しました。",
    "content/ 配下の Markdown 原稿を正規化して、トップページと記事詳細に流し込む取り込み層を追加しました。",
    "検索、カテゴリ集計、内部リンク解決は純粋関数化し、Node 組み込みテストで検証します。",
    "frontmatter がある原稿はそれを優先し、先頭テンプレートは最小限のカテゴリ推定に利用します。",
    "次段階ではテンプレート変換拡張と HTML 生成フローを追加します。",
  ],
};
