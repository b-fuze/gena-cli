"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pane_1 = require("./pane");
const turbocolor_1 = __importDefault(require("turbocolor"));
const jshorts_1 = require("jshorts");
function scroll(state, items, cols, rows) {
    const scrollMax = Math.max(items.length - rows, 0);
    const scrollDistance = Math.min(state.scroll, scrollMax);
    return pane_1.pane([
        scrollview(scrollDistance, items, cols - state.scrollbarWidth, rows),
        scrollbar(state, scrollDistance, scrollMax, items.length, rows),
    ], cols, rows, "h");
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
    const scrollbarRow = turbocolor_1.default.bgGreen(jshorts_1.jSh.nChars(" ", state.scrollbarWidth));
    const scrollbarTroughRow = turbocolor_1.default.bgBlack(jshorts_1.jSh.nChars(" ", state.scrollbarWidth));
    const trough = Array(rows).fill(scrollbarTroughRow);
    // Draw scrollbar
    for (let i = 0; i < sbHeight; i++) {
        trough[sbPos + i] = scrollbarRow;
    }
    return pane_1.pane(trough, state.scrollbarWidth, rows, "v");
}
