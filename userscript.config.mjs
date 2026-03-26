const githubPagesBaseUrl = process.env.GITHUB_PAGES_BASE_URL?.trim();
const publishedUserscriptUrl = githubPagesBaseUrl
    ? `${githubPagesBaseUrl.replace(/\/$/, "")}/tl-lincoln-bulk-export-helper.user.js`
    : undefined;

export default {
    id: "tl-lincoln-bulk-export-helper",
    name: "TL Lincoln Bulk Export Helper",
    namespace: githubPagesBaseUrl ?? "https://local.tl-lincoln.dev/bulk-export-helper/",
    version: "0.3.0",
    description: "TL リンカーンのデータ出力を期間分割して一括実行する補助スクリプト",
    author: "TL Lincoln Userscript Workspace",
    match: [
        "https://www.tl-lincoln.net/accomodation/Ascsc5070*",
        "https://www.tl-lincoln.net/accomodation/Ascsc4310*"
    ],
    updateURL: publishedUserscriptUrl,
    downloadURL: publishedUserscriptUrl,
    grant: ["none"],
    runAt: "document-idle"
};