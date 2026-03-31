---
name: search-first
description: 実装前に既存実装、既存依存、外部ライブラリ、関連 Skill や MCP を先に調べたいときに使う。新規 utility や依存追加の前提確認に使う。
---

# Purpose
新しい実装や依存追加の前に、既存解を先に調べて再発明や不要な依存追加を防ぐ。
root `AGENTS.md` の repo-wide ルールを前提にし、この Skill は research-before-coding の手順だけを追加する。

# When to use / When NOT to use
- When to use:
  - 新機能を足す前に既存ライブラリや既存実装の有無を確認したいとき
  - 新しい依存を追加するか判断したいとき
  - 新規 helper / utility / abstraction を書く前
- When NOT to use:
  - 単純な typo 修正や限定的な差分修正で、既存解調査が不要なとき
  - 既に repo 内の正本実装を拡張するだけで十分なとき

# Procedure
1. まず repo 内に既存実装がないか検索する。
2. 次に、必要なら関連 Skill、MCP、外部ライブラリ、公開実装を調べる。
3. 候補を `採用 / 薄い wrapper で拡張 / 自前実装` に分ける。
4. 判断理由を、機能適合、保守性、依存コスト、既存構成との整合で短く残す。
5. 実装する場合は、調査結果を踏まえた最小差分に留める。

# Practical guidance
- repo 内検索は `search_subagent`、`semantic_search`、`grep_search` を優先する。
- 調査が広い場合は `Explore` などの read-only subagent を bounded scope で使う。
- 依存追加前は、標準機能や既存依存で代替できないかを必ず確認する。
- 外部情報を使う場合は、ライセンス、最終更新、導入コスト、メンテ状況を確認する。

# Validation
- repo 内既存解の有無を確認している。
- 外部候補を使う場合、採否理由がある。
- 依存追加の有無が repo-wide ルールと矛盾していない。
- 調査結果が実装方針に反映されている。
