---
name: verification-before-completion
description: 完了、修正済み、通過済みと主張する直前に使う。成功を述べる前に fresh verification を実行し、出力を確認してから結論を出す。
---

# Purpose
完了主張の前に fresh verification を必ず取り、推測で成功を述べない。
root `AGENTS.md` の repo-wide ルールを前提にし、この Skill は verification の実施順だけを追加する。

# Core rule
`fresh verification の証拠なしに completion claim をしない。`

# Procedure
1. 何を証明したいかを明確にする。
2. その主張を裏づける verify コマンドまたは確認手順を特定する。
3. その場で fresh に実行する。
4. 出力、終了コード、失敗件数を確認する。
5. 成功していれば証拠つきで報告し、失敗していれば失敗内容をそのまま報告する。

# Common cases
- build 成功: `npm run build` などの build 成功出力
- lint clean: `npm run lint` などの lint 結果
- typecheck pass: `npm run typecheck` などの型検査結果
- bug fix: 元の症状を再確認できるテスト、ログ、再現手順
- GUI 変更: 対象画面、手順、期待結果の確認

# Red flags
- 「たぶん動く」「通っているはず」のような推測
- 部分的な verify だけで全体成功を主張すること
- 古い実行結果を流用すること

# Validation
- 主張に対応する fresh verification がある。
- 実行結果を読んだうえで報告している。
- 未確認範囲がある場合は明示している。
