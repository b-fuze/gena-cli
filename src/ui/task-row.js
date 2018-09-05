"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pane_1 = require("./pane");
const term_utils_1 = require("term-utils");
const turbocolor_1 = __importDefault(require("turbocolor"));
const jshorts_1 = require("jshorts");
function taskRow(id, name, progress, cols, isHeader) {
    const progressWidth = Math.floor(cols / 2);
    const progressConsumed = isHeader ? 0 : Math.floor(Math.max(Math.min(progress / 100, 1), 0) * (progressWidth - 10));
    const progressDisplay = isHeader
        ? turbocolor_1.default.bold("PROGRESS")
        : turbocolor_1.default.bold("[")
            + jshorts_1.jSh.nChars(turbocolor_1.default.blue("■"), progressConsumed)
            + jshorts_1.jSh.nChars(turbocolor_1.default.black("■"), (progressWidth - 10) - progressConsumed)
            + turbocolor_1.default.bold("]");
    return pane_1.pane([
        pane_1.pane(term_utils_1.rightAlign(isHeader ? turbocolor_1.default.bold(id) : id, true), 3, 1),
        " ",
        pane_1.pane((cols) => isHeader ? turbocolor_1.default.bold(name) : name, 0, 1, "h", true),
        " ",
        pane_1.pane(term_utils_1.rightAlign(progressDisplay, true), progressWidth, 1),
        pane_1.pane(term_utils_1.rightAlign(isHeader ? turbocolor_1.default.bold("%") : Math.floor(progress) + turbocolor_1.default.bold("%")), 5, 1),
    ], cols, 1, "h", false, (text) => {
        return isHeader ? turbocolor_1.default.bgBlue(term_utils_1.forceAnsi(text, turbocolor_1.default.Styles.bgBlue.open)) : text;
    });
}
exports.taskRow = taskRow;
