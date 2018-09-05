"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pane_1 = require("./pane");
const header_pane_1 = require("./header-pane");
const footer_pane_1 = require("./footer-pane");
const content_pane_1 = require("./content-pane");
function window(state, cols, rows) {
    return pane_1.pane([
        header_pane_1.header(state, cols),
        content_pane_1.content(state),
        footer_pane_1.footer(state, cols),
    ], cols, rows);
}
exports.window = window;
