# WikiLikePages

GitHub Pages で公開しつつ、Wikiライクな執筆体験は外部エディタへ委譲する共同創作基盤です。

2026-03-17 に試作品を `archive/prototypes/` へ隔離し、ルート配下は正式実装の着手点へ切り替えました。

## 現在の構成

- 画面本体: `index.html`
- 実装コード: `src/`
- 設計資料: `docs/`
- 試作品アーカイブ: `archive/prototypes/`
- 自動テスト: `tests/`

## 実行メモ

- トップページは ES Modules を使っているため、HTTP 経由で確認する前提です
- 自動テストは `npm test` で実行できます

## ドキュメント

- 仕様たたき台: [docs/spec.md](docs/spec.md)
- 投稿経路: [docs/contribution-workflows.md](docs/contribution-workflows.md)
- 実装アーキテクチャ: [docs/implementation-architecture.md](docs/implementation-architecture.md)
