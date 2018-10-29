"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const state_1 = require("../state");
const pane_1 = require("./pane");
const colorette_1 = require("colorette");
const term_utils_1 = require("term-utils");
const jshorts_1 = require("jshorts");
function scroll(state, header, items, cols, rows, notification) {
    const notifiHeight = 3;
    const viewRows = notification ? rows - notifiHeight : rows;
    const headerUnoccupiedSpace = Math.max(viewRows - Number(!!header), 0);
    const scrollMax = Math.max(items.length - headerUnoccupiedSpace, 0);
    const scrollDistance = Math.min(state.scroll, scrollMax);
    const oldState = state_1.getOldState(state);
    const scrollDiff = oldState ? state.scroll - oldState.scroll : 0;
    // Ensure state reflects the scroll view
    if (state.scrollMax !== scrollMax
        || state.scrollItemCount !== items.length
        || state.scrollPaneHeight !== headerUnoccupiedSpace - 1 /* header height */) {
        state_1.update(state, {
            scrollMax,
            scrollItemCount: items.length,
            scrollPaneHeight: headerUnoccupiedSpace - 1,
        });
    }
    return pane_1.pane([
        // Top notification pane
        notification
            ? pane_1.pane([
                pane_1.pane([
                    pane_1.pane(new Array(notifiHeight).fill(colorette_1.blue("▏")), 1, notifiHeight),
                    pane_1.pane([
                        "",
                        term_utils_1.center(notification, cols - 2),
                        "",
                    ], cols - 2, notifiHeight),
                ], cols - 1, notifiHeight, "h", false, (line) => colorette_1.bgWhite(line)),
                pane_1.pane(new Array(notifiHeight).fill(colorette_1.blue("▕")), 1, notifiHeight),
            ], cols, notifiHeight, "h")
            : null,
        // Actual scroll section
        pane_1.pane([
            header
                ? pane_1.pane([
                    colorette_1.bgMagenta(colorette_1.blue("▏")),
                    pane_1.pane(header, cols - 2, 1),
                    colorette_1.bgMagenta(colorette_1.blue("▕")),
                ], cols, 1, "h")
                : null,
            pane_1.pane([
                scrollview(scrollDistance, items, cols - state.scrollbarWidth, headerUnoccupiedSpace, scrollDiff),
                scrollbar(state, scrollDistance, scrollMax, items.length, headerUnoccupiedSpace),
            ], 0, 0, "h"),
        ], cols, viewRows, "v")
    ], cols, viewRows, "v");
}
exports.scroll = scroll;
function scrollview(scrollDistance, items, cols, rows, scrollDiff) {
    return pane_1.pane([
        pane_1.pane(new Array(rows).fill(colorette_1.blue("▏")), 1, rows),
        pane_1.pane(items.slice(scrollDistance, rows + scrollDistance), cols - 1, rows, "v", false, null, scrollDiff),
    ], cols, rows, "h");
}
function scrollbar(state, scrollDistance, scrollMax, itemCount, rows) {
    const sbHeight = itemCount
        ? Math.max(Math.min(Math.round((rows / itemCount) * rows), rows), state.scrollbarMinHeight)
        : rows;
    const sbPosMax = rows - sbHeight;
    const sbPos = scrollMax
        ? Math.round((scrollDistance / scrollMax) * sbPosMax)
        : 0;
    const scrollbarRow = colorette_1.green(jshorts_1.jSh.nChars("▕", state.scrollbarWidth));
    const scrollbarTroughRow = colorette_1.gray(jshorts_1.jSh.nChars("▕", state.scrollbarWidth));
    const trough = Array(rows).fill(scrollbarTroughRow);
    // Draw scrollbar
    for (let i = 0; i < sbHeight; i++) {
        trough[sbPos + i] = scrollbarRow;
    }
    return pane_1.pane(trough, state.scrollbarWidth, rows, "v");
}
