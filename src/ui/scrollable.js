"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pane_1 = require("./pane");
const turbocolor_1 = __importDefault(require("turbocolor"));
const jshorts_1 = require("jshorts");
function scroll(state, header, items, cols, rows) {
    const scrollMax = Math.max(items.length - rows, 0);
    const scrollDistance = Math.min(state.scroll, scrollMax);
    const headerUnoccupiedSpace = Math.max(rows - Number(!!header), 0);
    return pane_1.pane([
        header
            ? pane_1.pane([
                turbocolor_1.default.green("┃"),
                pane_1.pane(header, cols - 2, 1),
                turbocolor_1.default.green("┃"),
            ], cols, 1, "h")
            : null,
        pane_1.pane([
            scrollview(scrollDistance, items, cols - state.scrollbarWidth, headerUnoccupiedSpace),
            scrollbar(state, scrollDistance, scrollMax, items.length, headerUnoccupiedSpace),
        ], 0, 0, "h"),
    ], cols, rows, "v");
}
exports.scroll = scroll;
function scrollview(scrollDistance, items, cols, rows) {
    return pane_1.pane([
        pane_1.pane(new Array(rows).fill(turbocolor_1.default.green("┃")), 1, rows),
        pane_1.pane(items.slice(scrollDistance, rows + scrollDistance), cols - 1, rows),
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
    const scrollbarRow = turbocolor_1.default.red(jshorts_1.jSh.nChars("┃", state.scrollbarWidth));
    const scrollbarTroughRow = turbocolor_1.default.gray(jshorts_1.jSh.nChars("┃", state.scrollbarWidth));
    const trough = Array(rows).fill(scrollbarTroughRow);
    // Draw scrollbar
    for (let i = 0; i < sbHeight; i++) {
        trough[sbPos + i] = scrollbarRow;
    }
    return pane_1.pane(trough, state.scrollbarWidth, rows, "v");
}
