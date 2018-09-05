"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const turbocolor_1 = __importDefault(require("turbocolor"));
const term_utils_1 = require("term-utils");
const pane_1 = require("./pane");
function footer(state, cols) {
    return pane_1.pane([
        turbocolor_1.default.green("┗" + term_utils_1.strFill("━", cols - 2) + "┛"),
        "Build (panes): " + turbocolor_1.default.bold("" + state.lastPaneBuildDuration + "ms")
            + " Render: " + turbocolor_1.default.bold("" + state.lastPaintDuration + "ms")
            + term_utils_1.rightAlign(turbocolor_1.default.dim.white("" + state.lastKey)),
    ], cols, 2);
}
exports.footer = footer;
