const BUTTON_ID = "tl-lincoln-bulk-export-button";
const STATUS_ID = "tl-lincoln-bulk-export-status";
const STYLE_ID = "tl-lincoln-bulk-export-style";
const FRAME_PREFIX = "tl-lincoln-bulk-export-frame";
const EXPORT_INTERVAL_MS = 3000;
const SEARCH_RESULT_RETRY_MS = 250;
const SEARCH_RESULT_MAX_RETRIES = 20;

type PageKind = "pricing" | "rooms";

interface DateRange {
    from: string;
    to: string;
}

interface BulkExportState {
    phase: "after-search" | "exporting";
    ranges: DateRange[];
    currentIndex: number;
}

interface PageConfig {
    kind: PageKind;
    pathPattern: RegExp;
    stateKey: string;
    formName: string;
    outputActionPath: string;
    requiresSearch: boolean;
}

type WindowWithTlActions = Window & {
    doSearch?: () => void;
    doOutput?: () => void;
};

const PAGE_CONFIGS: PageConfig[] = [
    {
        kind: "pricing",
        pathPattern: /\/accomodation\/Ascsc5070(?:Init|Search)Action\.do$/,
        stateKey: "tl-lincoln-bulk-export-state-pricing",
        formName: "Ascsc5070Form",
        outputActionPath: "/accomodation/Ascsc5070OutputAction.do",
        requiresSearch: true
    },
    {
        kind: "rooms",
        pathPattern: /\/accomodation\/Ascsc4310(?:Init|Search)Action\.do$/,
        stateKey: "tl-lincoln-bulk-export-state-rooms",
        formName: "Ascsc4310Form",
        outputActionPath: "/accomodation/Ascsc4310OutputAction.do",
        requiresSearch: false
    }
];

let currentPageConfig: PageConfig | null = null;

function boot(): void {
    const scriptName = GM_info?.script?.name ?? "Tampermonkey Script";

    console.info(`[${scriptName}] initialized`, {
        href: window.location.href,
        dev: __DEV__
    });

    currentPageConfig = resolvePageConfig(window.location.pathname);
    if (currentPageConfig === null) {
        return;
    }

    injectStyle();
    renderControls();
    resumeBulkExport();
}

function resolvePageConfig(pathname: string): PageConfig | null {
    return PAGE_CONFIGS.find((config) => config.pathPattern.test(pathname)) ?? null;
}

function injectStyle(): void {
    if (document.getElementById(STYLE_ID) !== null) {
        return;
    }

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
        #${BUTTON_ID} {
            margin-left: 12px;
            padding: 8px 14px;
            border: 1px solid #2563eb;
            border-radius: 6px;
            background: #2563eb;
            color: #fff;
            font-size: 13px;
            font-weight: 700;
            cursor: pointer;
        }

        #${BUTTON_ID}:disabled {
            opacity: 0.6;
            cursor: wait;
        }

        #${STATUS_ID} {
            margin-left: 12px;
            color: #1f2937;
            font-size: 12px;
            font-weight: 700;
            vertical-align: middle;
        }
    `;

    document.head.append(style);
}

function renderControls(): void {
    const outputLink = document.querySelector<HTMLAnchorElement>('a[onclick="doOutput();"]');
    if (outputLink === null || document.getElementById(BUTTON_ID) !== null) {
        syncUiState();
        return;
    }

    const button = document.createElement("button");
    button.id = BUTTON_ID;
    button.type = "button";
    button.textContent = "期間分割で一括出力";
    button.addEventListener("click", handleBulkExportClick);

    const status = document.createElement("span");
    status.id = STATUS_ID;

    outputLink.insertAdjacentElement("afterend", button);
    button.insertAdjacentElement("afterend", status);

    syncUiState();
}

function handleBulkExportClick(): void {
    if (loadState() !== null) {
        return;
    }

    const config = currentPageConfig;
    if (config === null) {
        return;
    }

    const bounds = getExportBounds();
    if (bounds === null) {
        window.alert("出力可能期間を取得できませんでした。");
        return;
    }

    const ranges = buildDateRanges(bounds.start, bounds.end);
    if (ranges.length === 0) {
        window.alert("出力対象の期間が見つかりませんでした。");
        return;
    }

    if (config.requiresSearch) {
        saveState({
            phase: "after-search",
            ranges,
            currentIndex: 0
        });

        setStatus(`検索を実行します (${ranges.length} 分割)`);
        syncUiState();

        const actions = window as WindowWithTlActions;
        actions.doSearch?.();
        return;
    }

    const state: BulkExportState = {
        phase: "exporting",
        ranges,
        currentIndex: 0
    };

    saveState(state);
    syncUiState();
    runNextExport(state);
}

function resumeBulkExport(): void {
    const state = loadState();
    if (state === null) {
        syncUiState();
        return;
    }

    if (state.phase === "after-search" && currentPageConfig?.requiresSearch) {
        continueAfterSearch(state);
        return;
    }

    runNextExport(state);
}

function continueAfterSearch(state: BulkExportState): void {
    if (currentPageConfig?.kind !== "pricing") {
        clearState();
        syncUiState();
        return;
    }

    continueAfterSearchWithRetry(state, 0);
}

function continueAfterSearchWithRetry(state: BulkExportState, retryCount: number): void {
    const selectedPlanGroups = getSelectByName("arrPlanGroup");
    const availablePlanGroups = getSelectByName("raPlanGroup");

    if (selectedPlanGroups === null || availablePlanGroups === null) {
        scheduleAfterSearchRetry(state, retryCount);
        return;
    }

    if (selectedPlanGroups.options.length > 0) {
        const nextState: BulkExportState = {
            ...state,
            phase: "exporting",
            currentIndex: 0
        };

        saveState(nextState);
        runNextExport(nextState);
        return;
    }

    if (availablePlanGroups.options.length === 0) {
        scheduleAfterSearchRetry(state, retryCount);
        return;
    }

    moveAllPlanGroupsToExportTarget();

    if (selectedPlanGroups.options.length === 0) {
        scheduleAfterSearchRetry(state, retryCount + 1);
        return;
    }

    const nextState: BulkExportState = {
        ...state,
        phase: "exporting",
        currentIndex: 0
    };

    saveState(nextState);
    runNextExport(nextState);
}

function scheduleAfterSearchRetry(state: BulkExportState, retryCount: number): void {
    if (retryCount >= SEARCH_RESULT_MAX_RETRIES) {
        clearState();
        setStatus("");
        syncUiState();
        window.alert("出力するプラングループへ移動できませんでした。");
        return;
    }

    setStatus(`検索結果を確認中 ${retryCount + 1}/${SEARCH_RESULT_MAX_RETRIES}`);
    window.setTimeout(() => {
        const latestState = loadState();
        if (latestState === null || latestState.phase !== "after-search") {
            syncUiState();
            return;
        }

        continueAfterSearchWithRetry(latestState, retryCount + 1);
    }, SEARCH_RESULT_RETRY_MS);
}

function runNextExport(state: BulkExportState): void {
    if (state.currentIndex >= state.ranges.length) {
        clearState();
        setStatus(`完了: ${state.ranges.length} 件の出力を開始しました`);
        syncUiState();
        return;
    }

    if (currentPageConfig?.kind === "pricing") {
        const selectedPlanGroups = getSelectByName("arrPlanGroup");
        if (selectedPlanGroups === null || selectedPlanGroups.options.length === 0) {
            clearState();
            syncUiState();
            window.alert("出力対象のプラングループが空です。");
            return;
        }
    }

    const range = state.ranges[state.currentIndex];
    if (range === undefined) {
        clearState();
        syncUiState();
        return;
    }

    applyDateRange(range);
    prepareCurrentFormForExport();

    setStatus(`出力中 ${state.currentIndex + 1}/${state.ranges.length}: ${range.from} - ${range.to}`);

    const nextState: BulkExportState = {
        ...state,
        currentIndex: state.currentIndex + 1
    };

    saveState(nextState);
    syncUiState();

    submitCurrentFormToHiddenFrame(state.currentIndex);

    window.setTimeout(() => {
        const latestState = loadState();
        if (latestState === null || latestState.phase !== "exporting") {
            syncUiState();
            return;
        }

        runNextExport(latestState);
    }, EXPORT_INTERVAL_MS);
}

function moveAllPlanGroupsToExportTarget(): void {
    const availablePlanGroups = getSelectByName("raPlanGroup");
    if (availablePlanGroups === null) {
        return;
    }

    for (const option of Array.from(availablePlanGroups.options)) {
        option.selected = true;
    }

    const moveButton = document.getElementById("sectionTableBtn3");
    if (moveButton instanceof HTMLElement) {
        moveButton.click();
    }
}

function applyDateRange(range: DateRange): void {
    const from = parseDate(range.from);
    const to = parseDate(range.to);

    setDateField("objectDateFrom", from);
    setDateField("objectDateTo", to);
}

function prepareCurrentFormForExport(): void {
    if (currentPageConfig?.kind !== "pricing") {
        return;
    }

    selectAllExportPlanGroups();
    setCheckboxState("rankLimit", false);
    setCheckboxState("outputRestriction", false);
    setHiddenInputValue("cheRankLimit", "0");
    setHiddenInputValue("outputRestrictionFlg", "0");
    setHiddenInputValue("outputFlg", "1");
}

function selectAllExportPlanGroups(): void {
    const exportPlanGroups = getSelectByName("arrPlanGroup");
    if (exportPlanGroups === null) {
        return;
    }

    for (const option of Array.from(exportPlanGroups.options)) {
        option.selected = true;
    }

    setHiddenInputValue("leftHasDataFlg", exportPlanGroups.options.length > 0 ? "1" : "0");
}

function submitCurrentFormToHiddenFrame(index: number): void {
    const config = currentPageConfig;
    if (config === null) {
        throw new Error("Page config not found");
    }

    const originalForm = document.forms.namedItem(config.formName);
    if (originalForm === null) {
        throw new Error(`${config.formName} not found`);
    }

    const frameName = `${FRAME_PREFIX}-${Date.now()}-${index}`;
    const iframe = document.createElement("iframe");
    iframe.name = frameName;
    iframe.style.display = "none";
    document.body.append(iframe);

    const tempForm = document.createElement("form");
    tempForm.method = "post";
    tempForm.action = new URL(config.outputActionPath, window.location.origin).toString();
    tempForm.target = frameName;
    tempForm.style.display = "none";

    const formData = new FormData(originalForm);
    formData.forEach((value, key) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = String(value);
        tempForm.append(input);
    });

    document.body.append(tempForm);
    tempForm.submit();

    window.setTimeout(() => {
        tempForm.remove();
    }, 1000);

    window.setTimeout(() => {
        iframe.remove();
    }, Math.max(EXPORT_INTERVAL_MS * 2, 10000));
}

function setDateField(prefix: "objectDateFrom" | "objectDateTo", date: Date): void {
    const year = getSelectByName(`${prefix}Year`);
    const month = getSelectByName(`${prefix}Month`);
    const day = getSelectByName(`${prefix}Day`);

    if (year === null || month === null || day === null) {
        return;
    }

    updateSelectValue(year, String(date.getFullYear()));
    updateSelectValue(month, pad(date.getMonth() + 1));
    updateSelectValue(day, pad(date.getDate()));
}

function updateSelectValue(select: HTMLSelectElement, value: string): void {
    select.value = value;
    select.dispatchEvent(new Event("change", { bubbles: true }));
}

function setCheckboxState(name: string, checked: boolean): void {
    const checkbox = document.querySelector<HTMLInputElement>(`input[name="${name}"]`);
    if (checkbox === null) {
        return;
    }

    checkbox.checked = checked;
    checkbox.dispatchEvent(new Event("change", { bubbles: true }));
}

function setHiddenInputValue(name: string, value: string): void {
    const input = document.querySelector<HTMLInputElement>(`input[name="${name}"]`);
    if (input !== null) {
        input.value = value;
    }
}

function getExportBounds(): { start: Date; end: Date } | null {
    const earliest = getInputValue("objectDateFrom_start_date");
    const latest = getInputValue("objectDateTo_end_date");
    if (earliest === null || latest === null) {
        return null;
    }

    return {
        start: parseDate(earliest),
        end: parseDate(latest)
    };
}

function buildDateRanges(start: Date, end: Date): DateRange[] {
    const ranges: DateRange[] = [];
    let currentStart = cloneDate(start);

    while (currentStart.getTime() <= end.getTime()) {
        const candidateEnd = endOfMonth(addMonths(cloneDate(currentStart), 2));
        const currentEnd = candidateEnd.getTime() < end.getTime() ? candidateEnd : cloneDate(end);

        ranges.push({
            from: formatDate(currentStart),
            to: formatDate(currentEnd)
        });

        currentStart = addDays(currentEnd, 1);
    }

    return ranges;
}

function loadState(): BulkExportState | null {
    const stateKey = currentPageConfig?.stateKey;
    if (stateKey === undefined) {
        return null;
    }

    const raw = window.sessionStorage.getItem(stateKey);
    if (raw === null) {
        return null;
    }

    try {
        return JSON.parse(raw) as BulkExportState;
    } catch {
        window.sessionStorage.removeItem(stateKey);
        return null;
    }
}

function saveState(state: BulkExportState): void {
    const stateKey = currentPageConfig?.stateKey;
    if (stateKey !== undefined) {
        window.sessionStorage.setItem(stateKey, JSON.stringify(state));
    }
}

function clearState(): void {
    const stateKey = currentPageConfig?.stateKey;
    if (stateKey !== undefined) {
        window.sessionStorage.removeItem(stateKey);
    }
}

function syncUiState(): void {
    const button = document.getElementById(BUTTON_ID) as HTMLButtonElement | null;
    const state = loadState();

    if (button !== null) {
        button.disabled = state !== null;
    }

    if (state === null) {
        setStatus("");
        return;
    }

    if (state.phase === "after-search") {
        setStatus("検索結果の取得を待っています");
        return;
    }

    setStatus(`出力待機中 ${Math.min(state.currentIndex + 1, state.ranges.length)}/${state.ranges.length}`);
}

function setStatus(message: string): void {
    const status = document.getElementById(STATUS_ID);
    if (status !== null) {
        status.textContent = message;
    }
}

function getSelectByName(name: string): HTMLSelectElement | null {
    return document.querySelector<HTMLSelectElement>(`select[name="${name}"]`);
}

function getInputValue(name: string): string | null {
    return document.querySelector<HTMLInputElement>(`input[name="${name}"]`)?.value ?? null;
}

function parseDate(value: string): Date {
    const [year, month, day] = value.split("/").map((part) => Number(part));
    if (year === undefined || month === undefined || day === undefined) {
        throw new Error(`Invalid date value: ${value}`);
    }

    return new Date(year, month - 1, day);
}

function formatDate(date: Date): string {
    return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())}`;
}

function pad(value: number): string {
    return String(value).padStart(2, "0");
}

function cloneDate(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addMonths(date: Date, months: number): Date {
    return new Date(date.getFullYear(), date.getMonth() + months, date.getDate());
}

function addDays(date: Date, days: number): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function endOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
        boot();
    }, { once: true });
} else {
    boot();
}