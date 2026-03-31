# Active Skill Bundle

このディレクトリは、このリポジトリで Codex が自動検出する Skill 置き場です。
常時使わせたい Skill だけを置き、運用の正本は root `AGENTS.md` に残します。

## Selected Skills

| Skill | 何に効くか | この repo での用途 |
| --- | --- | --- |
| context-writeback | 常設コンテキストへの最小差分反映 | `docs/context/STATUS.md` や `docs/context/DECISIONS.md` の更新判断 |
| docs-governance | ドキュメントの正本整理 | `README.md`、`docs/`、`AGENTS.md` の重複整理 |
| verification-before-completion | 完了主張前の fresh verification 徹底 | build、lint、typecheck、GUI確認の扱い統一 |
| search-first | 実装前の既存解調査 | 依存追加や新規 helper 実装前の確認 |
| task-add-and-triage | タスク追加直後の棚卸し | `docs/tasks_backlog.md` の実装順最適化 |
| thread-contract-handoff | スレッド範囲固定と handoff 判断 | 長めの実装/調査スレッドのスコープ管理 |

## Omitted For Now

- `repo-bootstrap`: この repo は初期構成を終えているため未導入
- `release-gate`: まだリリース運用の標準化を必要としていないため未導入
- `design-review`: 現時点では個別タスクの都度判断で十分なため未導入
