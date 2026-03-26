# DECISIONS

> 形式は `ID | date | decision | spec_link | status` を使う。

## Entries

- `D-20260326-001` | 2026-03-26 | repo-template-codex からは運用骨格のみを取り込み、Tampermonkey 向けの実行基盤はこのリポジトリで新設する | `docs/spec_000_overview.md` | active
- `D-20260326-002` | 2026-03-26 | userscript のビルドは esbuild + TypeScript とし、metadata は `userscript.config.mjs` に集約する | `docs/spec_000_overview.md` | active
- `D-20260326-003` | 2026-03-26 | Chrome 接続は remote debugging port 9222 と Playwright CDP 接続を既定にする | `docs/spec_000_overview.md` | active
