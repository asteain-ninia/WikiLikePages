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
      description: "Obsidian 等のエディタで記事を執筆し、Pull Request で提出します。",
    },
    {
      label: "簡易投稿",
      description: "GitHub Issue Form から原稿を送ると、管理者がレビュー後に反映します。",
    },
    {
      label: "その他の方法",
      description: "GitHub アカウントがない場合も、フォーム経由で投稿できます。",
    },
  ],
  processSteps: [
    "記事原稿を Markdown または MediaWiki 記法で作成する",
    "Pull Request または投稿フォームから提出する",
    "レビューで内部リンクや書式を確認する",
    "承認後、サイトに自動反映される",
  ],
};
