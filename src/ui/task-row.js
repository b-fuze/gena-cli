"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pane_1 = require("./pane");
const term_utils_1 = require("term-utils");
const colorette_1 = require("colorette");
function taskRowHeader(state, cols) {
    const countWidth = "Media      ".length;
    const dlWidth = "Downloading      ".length;
    const providerWidth = Math.floor(cols / 5);
    return pane_1.pane([
        pane_1.pane(term_utils_1.rightAlign(colorette_1.bold("#"), true), 3, 1),
        " ",
        pane_1.pane(colorette_1.bold("TASK"), 0, 1, "h", true),
        " ",
        pane_1.pane(colorette_1.bold("MEDIA"), countWidth, 1),
        "  ",
        pane_1.pane(colorette_1.bold("STATUS"), dlWidth, 1),
        "  ",
        pane_1.pane(colorette_1.bold("PROVIDER"), providerWidth, 1),
    ], cols, 1, "h", false, (text) => {
        return colorette_1.bgMagenta(text);
    });
}
exports.taskRowHeader = taskRowHeader;
function taskRow(state, task, cols, index) {
    const isSelected = index === state.scrollCursor;
    const countWidth = "Media      ".length;
    const dlWidth = "Downloading      ".length;
    const providerWidth = Math.floor(cols / 5);
    return pane_1.pane([
        pane_1.pane(term_utils_1.rightAlign(task.id + "", true), 3, 1),
        " ",
        pane_1.pane((cols) => pane_1.pane((isSelected ? colorette_1.black : colorette_1.green)(task.title), cols, 1), 0, 1, "h", true),
        " ",
        pane_1.pane(task.list.length + term_utils_1.rightAlign(""), countWidth, 1),
        "  ",
        pane_1.pane("1 -> 39% 1.3MB/s" + term_utils_1.rightAlign(""), dlWidth, 1),
        "  ",
        pane_1.pane(task.provider + term_utils_1.rightAlign(""), providerWidth, 1),
    ], cols, 1, "h", false, (text) => {
        return isSelected
            ? colorette_1.bgWhite(colorette_1.black(text))
            : text;
    });
}
exports.taskRow = taskRow;
function taskMediaRow(state, media, cols, index) {
    const isSelected = index === state.scrollCursor;
    const dlWidth = "Downloading      ".length;
    const providerWidth = Math.floor(cols / 5);
    return pane_1.pane([
        pane_1.pane((cols) => term_utils_1.strFill(" ", cols), 0, 1, "h", true),
        "  ",
        pane_1.pane("1 -> 39% 1.3MB/s" + term_utils_1.rightAlign(""), dlWidth, 1),
        "  ",
        pane_1.pane(term_utils_1.rightAlign(""), providerWidth, 1),
    ], cols, 1, "h", false, (text) => {
        return isSelected
            ? colorette_1.bgWhite(colorette_1.black(text))
            : text;
    });
}
exports.taskMediaRow = taskMediaRow;
