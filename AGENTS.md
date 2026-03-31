# AGENTS.md

## Purpose

このファイルは、このリポジトリで安全に作業を始めるための常設ルール。
repo-template-codex の現行方針をベースに、正本優先・最小読込・最小差分で事故を減らしつつ、TL リンカーン向け Tampermonkey userscript の実装とドキュメント更新を進める。

## Scope

- このファイル単体で運用を開始できることを優先する。
- 外部リポジトリや親ワークスペースへの参照は任意。存在しなくても止めない。

## Read Budget

- 初手で読むのは `AGENTS.md` のみ。
- 追加読込は、タスク遂行に必要な最小数に限定する。
- ただし、責務境界、影響範囲、安全性判断に必要なときは追加読込を許可する。読む理由と対象を先に特定し、漫然と広げない。
- 不足があれば推測せず、必要ファイルを特定して読む。
- サブエージェント利用時も read budget を免除しない。起動時に対象ファイルと理由を固定し、読み広げが必要になった場合はメインスレッド側へ戻して再判断する。

## Task Read (Only When Needed)

- 仕様変更や挙動確認: `docs/spec_*.md`
- 現在地の確認: `docs/context/STATUS.md`
- 判断理由の確認: `docs/context/DECISIONS.md`
- 実装規約や運用コマンドの確認: `README.md`
- リポジトリ固有運用の確認: この `AGENTS.md` の `Local Extension` 節

## Skills (Only When Needed)

- root `AGENTS.md` は repo-wide の常時ルールを定義し、task-specific procedure は必要になったときだけ別ドキュメントへ切り出す。
- 常時ルールや設計原則を別手順へ重複展開しない。
- このリポジトリでは、必要頻度が高い Skill だけを `.agents/skills/` に常設する。運用一覧は `.agents/skills/README.md` を参照する。
- 導入済み Skill:
	- `context-writeback`: 常設コンテキストへの反映が必要なときに使う。手順は `.agents/skills/context-writeback/SKILL.md` を参照。
	- `docs-governance`: ドキュメント新設や正本整理の判断が必要なときに使う。手順は `.agents/skills/docs-governance/SKILL.md` を参照。
	- `verification-before-completion`: 完了や成功を主張する前に fresh verification を取るときに使う。手順は `.agents/skills/verification-before-completion/SKILL.md` を参照。
	- `search-first`: 実装前に既存解、既存依存、外部候補を先に調べたいときに使う。手順は `.agents/skills/search-first/SKILL.md` を参照。
	- `task-add-and-triage`: `docs/tasks_backlog.md` にタスク追加後、棚卸しと順番最適化を行うときに使う。手順は `.agents/skills/task-add-and-triage/SKILL.md` を参照。
	- `thread-contract-handoff`: 長めのスレッドで目的、範囲、終了条件、handoff 要否を整理したいときに使う。手順は `.agents/skills/thread-contract-handoff/SKILL.md` を参照。
- 新規 Skill を追加する場合、名前は原則 hyphen-case とし、repo-wide の判断基準は root `AGENTS.md` 側を正本にする。

## Source Priority

1. セキュリティ、法令、公開制約
2. 仕様書 (`docs/spec_*.md` など)
3. 現況と意思決定 (`docs/context/STATUS.md` / `docs/context/DECISIONS.md`)
4. `AGENTS.md`
5. `README.md`

同順位で矛盾した場合は、より新しい決定を優先する。
未解決なら `docs/context/DECISIONS.md` に暫定判断を残して進める。

## Constant Context Rules

- 推測で運用ルールを足さない。
- 会話を正本にせず、継続して参照すべき内容だけを `.agents/skills/context-writeback/SKILL.md` の条件を満たすときに既存の正本ドキュメントへ反映する。

## Docs Governance

- 重複記載を避ける。仕様は `docs/spec_*.md`、現況は `docs/context/STATUS.md`、判断理由は `docs/context/DECISIONS.md`、利用手順は `README.md` を正本とする。
- 新規ドキュメントの要否や既存文書への統合判断は `.agents/skills/docs-governance/SKILL.md` の手順に従う。
- AGENTS には常設ルールだけを書く。手順書や一時的な作業メモを肥大化させない。

## Engineering Defaults

- デフォルトは単純さを優先する。後方互換の shim や fallback は、明確な運用要件がある場合のみ追加する。
- 既存の公開挙動は、タスクが明示的に変更を求めない限り保持する。
- 変更は最小差分を原則とし、タスクと無関係な rename、move、構成変更を混ぜない。
- 変更範囲が広い、横断的、または危険操作を含む場合は、先に分割案を示す。
- 依存追加や更新の前に、既存実装、標準ライブラリ、既存依存で代替できないか確認する。緊急性がない依存更新で latest へ安易に追随しない。
- lockfile や version pin がある依存は、未固定のまま完了しない。
- 3 ステップ以上、または責務境界や仕様判断を含むタスクでは、実装前に `変更範囲`、`保持すべき公開挙動`、`最小 verify` を先に明示する。
- 実装中に前提、影響範囲、または verify 方法が崩れた場合は、そのまま押し切らず、分割または再計画へ戻す。
- 明示承認なしで行わない: 依存追加や更新、大量削除、設定変更、認証や secrets や権限まわりの変更、配布物の公開設定変更。
- 明示承認なしで行わない: 外部ネットワークアクセス、外部 API、認証済み管理画面への接続、実データの読込、変換、外部送信。
- verify 失敗時の自己修正は最大 2 回までとし、解消しなければ失敗内容と未解決点を報告して止まる。

## Verification Policy

- `verify` は「変更に応じた最小十分な確認」とする。変更箇所に直結しない重い確認を既定にしないが、回帰リスクを見落とす省略もしない。
- 優先順は、変更箇所に直結するテスト、型や静的解析、ビルド、手動確認とする。前段で失敗した場合は、原因修正を優先して先へ進まない。
- verify は可能な限り対象を絞って実行し、必要になった範囲だけ広げる。結果は pass や fail だけでなく、何を確認したかを把握して報告する。
- verify 未整備または未実施の項目がある場合は、そのまま完了扱いにしない。最終報告で確認できた範囲と未確認範囲を明示する。

## Directory Guideline

- 入口は root の `AGENTS.md` とする。
- 仕様は `docs/`、実装は `src/`、ビルドや補助スクリプトは `scripts/` に寄せる。
- `dist/` は生成物として扱い、ソース上の真実をそこへ重複させない。

## Local Extension

この節は、このリポジトリ固有の運用ルールを置く。

### Tampermonkey / Userscript

- 配布物と Tampermonkey への投入物は `dist/*.user.js` を正とする。
- userscript metadata は `userscript.config.mjs` に集約し、ソースへ重複記載しない。
- `dist/*.user.js` を手編集せず、必要な変更は `src/`、`scripts/build.mjs`、`userscript.config.mjs` 側で行う。

### Build / Verify

- ビルドは `scripts/build.mjs` と `esbuild` で行い、TypeScript の型検査は `tsc --noEmit` で分離する。
- まず既存の verify 手段を使う。通常は `npm run typecheck`、`npm run lint`、`npm run build`、必要に応じて `npm run check` を使う。
- verify 手段が未整備なら勝手に増やさず、その旨を報告する。

### Browser / Automation

- ブラウザ接続と自動操作は、Chrome の remote debugging port `9222` と `playwright-core` の CDP 接続を既定にする。
- 画面確認が必要な変更では、専用プロファイルまたは remote debugging 付き既存プロファイルでの確認手順を優先する。

### Subagent Policy

- メインスレッド側は全体判断、統合、verify、最終報告を担う。クリティカルパスの実装も既定ではメインスレッド側が担当する。
- サブエージェントは既定では未使用とし、使う場合も対象範囲、返却形式、寿命を事前に固定できる bounded delegation に限る。
- サブエージェントへ優先して委譲するのは、調査、影響範囲確認、テスト切り分け、レビュー、要約などの read-heavy な作業とする。
- write-heavy な変更、横断変更、依存変更、設定変更、外部接続を伴う操作は既定でメインスレッド側に残す。
- サブエージェントによる部分検証は許容するが、最終 verify 判定、最終判断、正本ドキュメントへの反映要否判断はメインスレッド側が保持する。

### Documentation Priority In This Repo

- TL リンカーン固有仕様は `docs/spec_*.md` を優先する。
- 現在の開発状況や残課題は `docs/context/STATUS.md` と `docs/tasks_backlog.md` を参照する。
- 判断理由や運用更新は `docs/context/DECISIONS.md` に残す。

## Delivery Rule

- 最終報告は、コード詳細より「何を変えたか」「なぜ変えたか」「影響範囲」「GUI 確認要否」を優先する。
- 最終報告では、実施済み、未実施、未確認、承認待ちを分けて書く。
- Chrome や Tampermonkey の画面操作を伴う変更では、確認してほしい手順と期待結果を必ず示す。
- サブエージェントを使った場合も、最終報告はメインスレッド側が統合し、生ログではなく結論と影響を先に示す。
- GUI 確認が不要な変更なら、その理由を明記する。
