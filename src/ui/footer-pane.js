"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const colorette_1 = require("colorette");
const term_utils_1 = require("term-utils");
const pane_1 = require("./pane");
const kmap = (str) => colorette_1.bold(colorette_1.bgBlueBright(str));
function footer(state, cols) {
    return state.isDebug
        ? pane_1.pane([
            "Build (panes): " + colorette_1.bold("" + state.lastPaneBuildDuration + "ms")
                + " Diff: " + colorette_1.bold("" + state.lastPaneDiffDuration + "ms")
                + " Render: " + colorette_1.bold("" + state.lastPaintDuration + "ms")
                + colorette_1.bold(colorette_1.red(" |"))
                + " SAME: " + colorette_1.bold("" + state.samePanes)
                + " DIFF: " + colorette_1.bold("" + state.diffPanes)
                + term_utils_1.rightAlign(colorette_1.white("    " + state.lastKey), true),
        ], cols, 1, "v", false, line => colorette_1.bgBlue(line))
        : pane_1.pane([
            ` ${kmap("p:")} pause`
                + `  ${kmap("c:")} continue`
                + `  ${kmap("d:")} cancel`
                + `  ${kmap("x:")} set max concurrent media downloads`,
            ` ${kmap("j:")} set max concurrent source downloads`
        ], cols, 2, "v", false, line => colorette_1.bgBlue(line));
}
exports.footer = footer;
