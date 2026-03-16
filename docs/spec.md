# WikiLikePages 仕様たたき台 v0.1

## 1. 背景

- 共同創作に使うWikiサービスの選定が難航している。
- 参加者はWiki文化に慣れているため、ページ単位編集・内部リンク・タグ・注釈のような体験は維持したい。
- ただし運用コストと実装コストを抑えたいので、公開は静的ホスティングに寄せたい。
- そのため、公開基盤はGitHub Pages、編集体験は外部エディタに切り出す方向を第一候補とする。

## 2. 解きたい課題

- 読者向けには通常のWikiのように閲覧できること。
- 執筆者向けには、Wikiっぽい書き心地をなるべく崩さないこと。
- サーバー運用やDB運用を持たずに継続できること。
- 将来の拡張で、スタイルやテンプレートを増やせること。

## 3. MVPの目標

- Markdownベースでページを作成・編集できる。
- `[[ページ名]]` 形式の内部リンクが使える。
- タグ、目次、検索、バックリンクなどのWiki系ナビゲーションを提供する。
- 管理者レビューとマージを通った内容だけを公開する。
- GitHubへのマージ後、自動でGitHub Pagesへ反映される。
- 下書きページを公開対象から除外できる。
- GitHubアカウントがない参加者にも、記事データを送る最低限の窓口を用意する。

## 4. MVPでやらないこと

- GitHub Pages上で完結するブラウザ内WYSIWYG編集。
- 同時編集やリアルタイム共同編集。
- 細かい権限管理を持つ独自管理画面。
- 既存Wiki記法の完全互換。

## 5. 制約と前提

- GitHub Pagesは静的サイト配信が前提で、任意の静的サイトジェネレータはGitHub Actionsのカスタムワークフローで配信できる。
- GitHub Docsでは、GitHub PagesはGitHub Freeでは公開リポジトリで利用でき、非公開リポジトリでの利用はPro/Team/Enterprise系プランが前提とされている。
- Pages単体では安全な認証付き編集UIを持ち込みにくいため、ブラウザ内編集を先に作るより、編集をObsidianなどに委譲したほうがMVPの難易度が低い。

## 6. 構成案の比較

| 案 | 編集体験 | 実装コスト | GitHub Pages適合 | 評価 |
| --- | --- | --- | --- | --- |
| GitHubのWeb編集だけで運用 | 低い。Wiki感が弱い | 最低 | 高い | 最低限動くが、参加者体験が弱い |
| Obsidian + Quartz + GitHub Pages | 高い。Wikiリンクや埋め込みに寄せやすい | 中 | 高い | 推奨 |
| 独自CMSやGitベースCMSを載せる | 中から高 | 高 | 中 | 将来候補。MVPには重い |

## 7. 推奨アーキテクチャ

### 7.1 結論

MVPでは以下を採用する。

- 編集: ローカルでObsidianを使う
- ソース形式: Obsidian互換Markdown
- 投稿経路: GitHub Pull Requestを標準とし、簡易投稿経路を別途用意する
- 静的サイト生成: Quartz 4
- 公開: GitHub Pages

投稿経路の詳細は [contribution-workflows.md](./contribution-workflows.md) を参照。

### 7.2 採用理由

- Quartz 4は公式にObsidian互換、全文検索、グラフ表示、wikilinks、transclusions、backlinksを機能として掲げている。
- Obsidianは公式に `[[Wikilinks]]` と通常Markdownリンクの両方をサポートし、ファイル名変更時に内部リンクを自動更新できる。
- Obsidianのcallout記法は公式にサポートされており、スタイル付き注釈を比較的低コストで書ける。
- GitHub Pagesは公式にカスタムワークフロー経由で任意の静的サイトジェネレータを配信できる。
- GitHub Issue Formsはテキスト入力、ドロップダウン、チェックボックス、ファイルアップロードを持てるため、Gitを触らない投稿窓口として使いやすい。

## 8. コンテンツ仕様

### 8.1 基本単位

- 1ページ = 1 Markdownファイル
- 画像や添付ファイルは専用ディレクトリに配置する
- ページ間リンクは `[[ページ名]]` を基本にする

### 8.2 推奨ディレクトリ構成

```text
content/
  Home.md
  settings/
  world/
  characters/
  organizations/
  timelines/
  assets/
```

### 8.3 推奨Frontmatter

```yaml
---
title: ページ表示名
aliases:
  - 別名1
  - 別名2
tags:
  - world
  - character
draft: false
created: 2026-03-13
updated: 2026-03-13
authors:
  - username
summary: 1行要約
---
```

### 8.4 編集記法の方針

- 内部リンク: `[[ページ名]]`
- 表示名付きリンク: `[[ページ名|表示名]]`
- 見出しリンク: `[[ページ名#見出し]]`
- 埋め込み: `![[画像.png]]` または `![[ページ名]]`
- callout: `> [!note]` などのObsidian記法を採用

### 8.5 ファイル名ルール

- MVPでは「参加者が自然に読めること」を優先し、日本語ファイル名を許容する。
- ただしObsidian公式の案内に合わせ、リンク解決を壊しやすい文字は避ける。
- URLの見た目が問題化した場合のみ、第2段階でslug運用を導入する。

## 9. 役割と運用フロー

### 9.1 想定ロール

- 読者: 公開サイトを閲覧する
- 執筆者: ページを追加・更新する
- 投稿者: GitHub Issue Formや外部フォームで記事データだけ送る
- 編集者: Pull Requestをレビューして整合性を保つ
- 管理者: マージ権限を持ち、公開可否を最終判断する

### 9.2 更新フロー

投稿フローは複数レーンを持つが、公開変更はすべてPull Requestへ集約する。
各レーンの詳細は [contribution-workflows.md](./contribution-workflows.md) を参照。

### 9.3 公開ルール

- `draft: true` のページは公開しない
- 画像や添付は公開前提のものだけを置く
- 非公開メモや作業メモは公開用コンテンツと分離する
- すべての公開変更はPRを経由し、管理者マージを必須にする

## 10. UI/UX要件

- サイト内検索があること
- バックリンク一覧があること
- タグまたはフォルダ単位で辿れること
- モバイルでも読めること
- できればページプレビューとパンくずを持つこと

## 11. リスク

- Gitに不慣れな参加者がいる場合、運用教育が必要
- 同一ページの同時編集ではマージコンフリクトが起こる
- GitHub Freeで非公開リポジトリにしたい場合はプラン制約に当たる
- ブラウザ編集を後付けする場合、認証方式の再設計が必要
- GitHubアカウントなし投稿はスパム対策が必要
- 外部フォームを自動PR化する場合、別途バックエンドか外部サービスが必要

## 12. 将来拡張

- ブラウザ内編集UIの追加
- PRごとのプレビュー環境
- テンプレート挿入や独自ショートコード
- talk page相当の議論導線
- 承認フローやLintの自動化
- 外部フォームからPRを自動生成する連携

## 13. 現時点の判断

- 最初に目指すべきは「Wikiサービスの完全代替」ではなく、「Wikiっぽく書けて静的に公開できる共同創作基盤」。
- そのため、MVPは公開面の完成度よりも執筆体験の自然さを優先する。
- 具体的には「Pages上で編集する」のではなく、「Obsidianで編集し、Pagesで読む」を基本思想にする。

## 14. 次に詰めるべき未決事項

- 参加者は全員GitHubアカウントを持てるか
- 公開リポジトリで問題ないか
- 直接push可能なメンバーとPR必須メンバーを分けるか
- 画像アップロード頻度はどれくらいか
- ページ名に日本語を使う方針でURL体裁を許容できるか
- 独自のテンプレート記法やインフォボックスが必要か
- 投稿経路の選択は [contribution-workflows.md](./contribution-workflows.md) の未決事項を参照

## 15. 次のプロトタイプ実装案

1. Quartz 4ベースで最小構成を立ち上げる
2. GitHub Pagesデプロイ用のActionsを入れる
3. 投稿経路の詳細設計を [contribution-workflows.md](./contribution-workflows.md) で確定する
4. サンプルページを3カテゴリ分作る
5. Obsidian運用ガイドを1枚書く
6. 第2版仕様を切る

## 参考

- Quartz 4: https://quartz.jzhao.xyz/
- Quartz Hosting: https://quartz.jzhao.xyz/hosting
- GitHub Pages custom workflows: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
- GitHub Issue Forms: https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/configuring-issue-templates-for-your-repository
- GitHub Discussions: https://docs.github.com/en/discussions
- Obsidian internal links: https://help.obsidian.md/Linking%20notes%20and%20files/Internal%20links
- Obsidian callouts: https://help.obsidian.md/callouts
- Staticman: https://the.staticman.net/
