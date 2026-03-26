# TL Lincoln Bulk Export Helper

TL リンカーン向け Tampermonkey ユーザースクリプトを、TypeScript で開発・ビルド・検証するための専用ワークスペースです。

## 目的

- TypeScript で userscript を記述する
- `dist/*.user.js` を安定して生成する
- Chrome に remote debugging で接続し、将来的な自動操作や検証へつなげる

## 取り込んだテンプレート要素

repo-template-codex から以下の考え方を引き継いでいます。

- `AGENTS.md` を起点にした最小読込運用
- `docs/context` と `docs/spec_*.md` を正本にするドキュメント骨格
- `.editorconfig` と `.gitignore` の基本整備

このリポジトリは TL リンカーン専用の userscript 開発用なので、ビルド設定と Chrome 接続補助はこの用途向けに作り直しています。

## 必要な前提

1. Node.js 22 LTS 以上
2. Google Chrome
3. Chrome 拡張の Tampermonkey
4. `npm run chrome:debug` を使う場合は PowerShell 7 (`pwsh`)

Windows で Node.js を入れる場合の例:

```powershell
winget install OpenJS.NodeJS.LTS
```

PowerShell 7 が未導入なら次で追加できます。

```powershell
winget install Microsoft.PowerShell
```

## 初期セットアップ

```powershell
npm install
npm run build
```

## 開発コマンド

- `npm run dev`: `dist/*.user.js` を watch build
- `npm run build`: 本番向けに 1 回ビルド
- `npm run typecheck`: TypeScript の型検査
- `npm run lint`: ESLint 実行
- `npm run check`: 型検査、lint、build をまとめて実行
- `npm run chrome:debug`: デバッグポート 9222 付きの Chrome を専用プロファイルで起動
- `npm run chrome:debug:default-profile`: 既存の Chrome Default プロファイルを remote debugging 付きで起動
- `npm run chrome:debug:default-profile:resume`: 既存の Chrome Default プロファイルを前回セッション復元付きで起動
- `npm run chrome:profiles`: 利用可能な Chrome プロファイルを一覧表示
- `npm run chrome:pages`: CDP 経由で Chrome に接続し、開いているページを一覧表示

VS Code の「実行とデバッグ」からは `.vscode/launch.json` の `Chrome: Resume Default Profile` を選ぶとワンクリックで起動できます。

VS Code のチャットから Chrome DevTools MCP を使う場合は、ワークスペースの `.vscode/mcp.json` をそのまま使えます。前提は `9222` で起動済みの Chrome で、通常は `npm run chrome:debug:default-profile:resume` を先に実行します。

## GitHub 配布と自動更新

公開リポジトリ名は `tl-lincoln-bulk-export-helper` を推奨します。公開方法は GitHub Pages を前提にしてあり、`.github/workflows/publish-userscript.yml` が `main` への push ごとに `dist/` を Pages へ公開します。

手順は次です。

1. GitHub で公開リポジトリ `tl-lincoln-bulk-export-helper` を作る
2. このワークスペースをそのリポジトリへ push する
3. GitHub の Settings → Pages で GitHub Actions を公開元にする
4. `main` へ push すると `https://OWNER.github.io/tl-lincoln-bulk-export-helper/tl-lincoln-bulk-export-helper.user.js` が公開される
5. 配布先はその URL を Tampermonkey にインストールする

GitHub Actions 上では `GITHUB_PAGES_BASE_URL` を自動設定してビルドするため、公開された `.user.js` には `updateURL` と `downloadURL` が自動で入ります。以後は `version` を上げて `main` に push すれば、Tampermonkey 側で更新確認ができます。

ローカルの `npm run build` では配布 URL を埋め込まないため、手元確認用のビルドと GitHub 配布用ビルドを安全に分けられます。

## Tampermonkey 反映手順

1. `userscript.config.mjs` の `match` と `name` を対象サイト向けに調整する
2. `npm run build` で `dist/*.user.js` を生成する
3. Chrome の Tampermonkey から `dist/*.user.js` を読み込む
4. 対象サイトを開いて動作確認する

GitHub Pages 配布を使う場合は、配布先に渡すのはローカルファイルではなく `https://OWNER.github.io/tl-lincoln-bulk-export-helper/tl-lincoln-bulk-export-helper.user.js` です。

開発中は `npm run dev` で watch し、ビルド後のファイルを再読込して確認します。

## Chrome 接続の提案

この環境では、ブラウザ操作や検証を次の方針で進めるのを推奨します。

1. まず `npm run chrome:debug` で専用プロファイルの Chrome を起動する
2. そのプロファイルに Tampermonkey を入れる
3. `npm run chrome:pages` で VS Code 側から接続できることを確認する
4. 将来、ページ自動操作が必要になったら `playwright-core` で CDP 接続したスクリプトを追加する

現在の環境では `npm install`、`npm run check`、`npm run chrome:pages` まで確認済みです。

通常の普段使い Chrome ではなく、専用プロファイルを使うのは拡張構成とデバッグ設定を固定するためです。

認証済みの既存プロファイルを使いたい場合は、次の順で切り替えます。

1. `npm run chrome:profiles` で使いたいプロファイル名を確認する
2. そのプロファイルを使っている Chrome をすべて閉じる
3. Default プロファイルなら `npm run chrome:debug:default-profile` を実行する
4. 別プロファイルなら `pwsh -ExecutionPolicy Bypass -File ./scripts/open-chrome-debug.ps1 -UseChromeUserData -ProfileDirectory "Profile 1"` のように起動する
5. `npm run chrome:pages` で認証済みページが見えていることを確認する

普段の手動起動に近づけたい場合は `npm run chrome:debug:default-profile:resume` を使います。これで同じプロファイルを remote debugging 付きで起動しつつ、前回セッションの復元を試みます。

Chrome DevTools MCP を使う場合の最短手順は次です。

1. `npm run chrome:debug:default-profile:resume` を実行する
2. VS Code で `.vscode/mcp.json` を信頼して MCP サーバーを起動する
3. チャットで開いているページの DOM、スクリーンショット、console、network を参照するよう依頼する

この設定は `chrome-devtools-mcp@latest` を `http://127.0.0.1:9222` へ接続する構成で、利用統計送信と CrUX への URL 送信は無効化しています。

Google アカウントの同期ログイン画面が出ても、対象サイトの Cookie と別の場合があります。対象サイトのログインが維持されていれば、そのままタブを開いて確認できます。

既存プロファイルはロックされるため、開いたままの Chrome に後付けで接続することはできません。いったん閉じて、同じプロファイルを remote debugging 付きで再起動する必要があります。

## 主要ファイル

- `userscript.config.mjs`: userscript metadata の正本
- `src/main.ts`: userscript のエントリーポイント
- `scripts/build.mjs`: esbuild ベースのビルドスクリプト
- `scripts/open-chrome-debug.ps1`: Chrome を remote debugging 付きで起動
- `scripts/list-chrome-profiles.ps1`: 利用可能な Chrome プロファイルを確認
- `scripts/attach-chrome.mjs`: Chrome へ CDP 接続してページ一覧を確認
