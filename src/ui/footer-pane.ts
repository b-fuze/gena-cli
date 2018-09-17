import tc from "turbocolor";
import {strFill, rightAlign} from "term-utils";
import {State} from "../state";
import {pane} from "./pane";

export function footer(state: State, cols: number) {
  return pane([
    tc.green("┗" + strFill("━", cols - 2) + "┛"),
    "Build (panes): " + tc.bold("" + state.lastPaneBuildDuration + "ms")
    + " Diff: " + tc.bold("" + state.lastPaneDiffDuration + "ms")
    + " Render: " + tc.bold("" + state.lastPaintDuration + "ms")
    + tc.bold.red(" |")
    + " SAME: " + tc.bold("" + state.samePanes)
    + " DIFF: " + tc.bold("" + state.diffPanes)
    + rightAlign(tc.dim.white("    " + state.lastKey), true),
  ], cols, 2);
}
