"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const term_utils_1 = require("term-utils");
const pane_1 = require("./pane");
const colorette_1 = require("colorette");
const headerContent = {
    main(state) {
        return term_utils_1.strMultiply(" ", 8) + `${colorette_1.bold("" + state.activeMedia)} active media of ${colorette_1.bold("" + state.tasks.length)} tasks`;
    }
};
function header(state, cols, rows) {
    return pane_1.pane([
        " Downloads" + term_utils_1.rightAlign(headerContent[state.header](state)) + " ",
    ], cols, 1, "v", false, line => colorette_1.bgBlue(line));
}
exports.header = header;
