# STATUS

Last Updated: 2026-03-31

## Overview

- TL リンカーン向け userscript の開発基盤と配布基盤を整備した。
- repo-template-codex 由来の運用骨格と、Chrome CDP 接続前提の userscript ビルド基盤を配置し、実行検証まで完了した。
- `.agents/skills/` に、この repo で常用する Skill 群を導入し、AGENTS と README の参照関係を更新した。

## Done

- repo-template-codex の運用骨格をこのワークスペース向けに最小化して移植した。
- esbuild ベースの userscript ビルド設定を追加した。
- Chrome remote debugging 接続用の PowerShell / Node 補助スクリプトを追加した。
- Node.js を導入し、`npm install`、`npm run check`、`npm run chrome:pages` を確認した。
- 既存の認証済み Chrome プロファイルを remote debugging 付きで再起動する導線を追加した。
- TL リンカーンの料金データ出力と残室データ出力を期間分割で一括実行する userscript を実装した。
- GitHub Pages を使った userscript 配布と自動更新の導線を追加した。
- 導入済み Skill 一覧と docs 運用ルールを `AGENTS.md`、`README.md`、`.agents/skills/README.md` に反映した。

## Next (max 3)

1. 公開リポジトリ `tl-lincoln-bulk-export-helper` を作成して push する
2. GitHub Pages を有効化し、配布 URL から Tampermonkey へインストールする
3. 料金データ出力画面と残室データ出力画面で最終 GUI 確認を行う

## Open Questions / Risks

- Tampermonkey を常用 Chrome ではなくデバッグ専用プロファイルへ入れる前提にしている。
- userscript を公開配布するため、ロジックが公開リポジトリ上で閲覧可能になる。
- 既存プロファイルを使う場合は、Chrome を完全終了してから再起動する必要がある。

## References

- `docs/spec_000_overview.md`
- `docs/tasks_backlog.md`
