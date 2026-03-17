# WikiLikePages 実装アーキテクチャ v0.1

## 1. 目的

2026-03-17 時点でルート直下に残っていた試作品を正式実装から切り離し、以後の実装着手点を明確にする。

- ルートには本番系の `index.html` と `src/` のみを置く
- 旧試作品は `archive/prototypes/` に隔離し、参照専用にする
- 画面実装はデータ、ロジック、描画を分離してテスト可能にする

## 2. 現在のディレクトリ方針

```text
archive/
  prototypes/
    ornate/
    simple/
docs/
  spec.md
  contribution-workflows.md
  implementation-architecture.md
src/
  data/
    articles.js
    site-config.js
  lib/
    home-page-model.js
    renderers.js
  main.js
  styles.css
tests/
  home-page-model.test.js
  renderers.test.js
index.html
```

## 3. レイヤ構成

### 3.1 Data

- `src/data/articles.js`
  - トップページで表示する記事データの仮置き
  - 将来は Markdown 解析結果や JSON 出力に差し替える
- `src/data/site-config.js`
  - カテゴリ定義、参加導線、実装メモなど固定的なUI設定

### 3.2 Model

- `src/lib/home-page-model.js`
  - 並び替え
  - 選り抜き記事選定
  - 検索
  - カテゴリ件数集計
  - 画面表示用モデル組み立て

UIに依存しない処理をここへ寄せ、Node の組み込みテストから直接検証する。

### 3.3 View

- `src/lib/renderers.js`
  - HTMLエスケープ
  - 記事カード描画
  - 検索結果描画
  - カテゴリカード描画

描画専用に閉じることで、DOM操作とテンプレート生成の責務を分離する。

### 3.4 Bootstrap

- `src/main.js`
  - 初期描画
  - 検索イベント
  - 記事選択イベント
  - ランダム選択イベント

## 4. 初期実装スコープ

この段階ではトップページを単独で成立させる。

- Wikipedia風のメインページレイアウト
- 選り抜き記事
- 新着記事
- 最近の更新
- 記事プレビュー
- キーワード検索
- カテゴリ件数表示
- 投稿導線の説明

## 5. アーカイブ方針

- `archive/prototypes/simple/`
  - 直前までルートで動いていた簡素版試作
- `archive/prototypes/ornate/`
  - 装飾強めの旧案

以後はこの配下を本実装の編集対象とみなさない。
必要に応じて比較参照は行うが、動作の基準は `src/` 側を正とする。

## 6. 自動テスト方針

- テストランナーは Node 組み込みの `node --test` を利用する
- 対象はまず純粋関数に限定する
- 重点確認項目
  - 選り抜き記事の決定
  - 日付ソート
  - 検索
  - カテゴリ件数集計
  - HTMLエスケープ
  - 描画文字列の最低限の整合性

ブラウザDOM全体の統合テストは、画面数と状態遷移が増えてから導入する。

## 7. 次の実装段階

1. Markdown 由来の実データ読み込みに切り替える
2. 記事詳細ページまたはルーティングを追加する
3. Quartz 4 または同等の静的生成フローへ接続する
4. frontmatter検証やリンク検証をテストに組み込む
