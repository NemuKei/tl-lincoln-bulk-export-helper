# BACKLOG

## Rules

- ID は `P<phase>-<連番>` を使う
- 各タスクに Done 条件を 1 行で書く
- `Next候補` は 1〜3 件に絞る

## Phase 1

- [ ] `P1-01` 対象サイト向け metadata を確定する
  Done条件: `userscript.config.mjs` の `name` と `match` が対象サイト前提で確定している

- [x] `P1-02` Node.js と依存関係を導入する
  Done条件: `npm install` と `npm run check` が通る

- [ ] `P1-03` Tampermonkey へ初回インポートする
  Done条件: `dist/*.user.js` を Tampermonkey へ読ませて対象ページで起動ログを確認できる

## Phase 2

- [ ] `P2-01` ブラウザ接続の自動化を足す
  Done条件: CDP 接続スクリプトで対象ページへ遷移し、要素確認や操作の基礎が取れている

## Next候補 (max 3)

1. `P1-02`
2. `P1-03`
3. `P2-01`
