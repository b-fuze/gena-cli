import tc from "turbocolor";
import {strFill, rightAlign} from "term-utils";
import {State} from "../state";
import {pane} from "./pane";

export function footer(state: State, cols: number) {
  return pane([
    tc.green("┗" + strFill("━", cols - 2) + "┛"),
    "Build (panes): " + tc.bold("" + state.lastPaneBuildDuration + "ms")
    + " Render: " + tc.bold("" + state.lastPaintDuration + "ms")
    + rightAlign(tc.dim.white("" + state.lastKey)),
  ], cols, 2);
}
