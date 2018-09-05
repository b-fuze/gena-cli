"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const term_utils_1 = require("term-utils");
const pane_1 = require("./pane");
const turbocolor_1 = __importDefault(require("turbocolor"));
const headerContent = {
    main(state) {
        return term_utils_1.strMultiply(" ", 8) + `${turbocolor_1.default.bold("" + state.activeMedia)} active media of ${turbocolor_1.default.bold("" + state.tasks.length)} tasks `;
    }
};
function header(state, cols, rows) {
    return pane_1.pane([
        "",
        turbocolor_1.default.green("GENA") + term_utils_1.rightAlign(headerContent[state.header](state)),
        "",
        turbocolor_1.default.green("┏" + term_utils_1.strFill("━", cols - 2) + "┓"),
    ], cols, 4, "v");
}
exports.header = header;
