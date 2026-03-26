# AGENTS.md

## Purpose

- このリポジトリは、TL リンカーン向け Tampermonkey ユーザースクリプトを TypeScript で開発するための作業場。
- repo-template-codex 由来の運用方針として、正本優先・最小読込・最小差分を維持する。

## Read Budget

- 初手で読むのはこのファイルのみ。
- 追加読込は、タスク遂行に必要な最小数に限定する。

## Source Priority

1. セキュリティ、法令、公開制約
2. `docs/spec_*.md`
3. `docs/context/STATUS.md` と `docs/context/DECISIONS.md`
4. `README.md`
5. `AGENTS.md`

## Engineering Defaults

- 配布物と Tampermonkey への投入物は `dist/*.user.js` を正とする。
- Userscript metadata は `userscript.config.mjs` に集約し、ソース内へ重複記載しない。
- ビルドは `scripts/build.mjs` と `esbuild` で行い、TypeScript の型検査は `tsc --noEmit` で分離する。
- ブラウザ接続と自動操作は、Chrome の remote debugging port `9222` と `playwright-core` の CDP 接続を既定にする。
- 変更は最小差分を原則とし、タスクと無関係な rename や構成変更を混ぜない。

## Delivery Rule

- 最終報告は、コード詳細より「何を変えたか」「なぜ変えたか」「影響範囲」「GUI 確認要否」を優先する。
- Chrome や Tampermonkey の画面操作を伴う変更では、確認してほしい手順と期待結果を必ず示す。
