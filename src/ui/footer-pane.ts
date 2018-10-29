import {bold, red, white, whiteBright, bgBlue, bgBlueBright} from "colorette";
import {strFill, rightAlign} from "term-utils";
import {State, FooterState} from "../state";
import {pane} from "./pane";

const kmap = (str: string) => bold(bgBlueBright(str));

export function footer(state: State, cols: number) {
  return state.isDebug
           ? pane([
               "Build (panes): " + bold("" + state.lastPaneBuildDuration + "ms")
               + " Diff: " + bold("" + state.lastPaneDiffDuration + "ms")
               + " Render: " + bold("" + state.lastPaintDuration + "ms")
               + bold(red(" |"))
               + " SAME: " + bold("" + state.samePanes)
               + " DIFF: " + bold("" + state.diffPanes)
               + rightAlign(white("    " + state.lastKey), true),
             ], cols, 1, "v", false, line => bgBlue(line))
           : pane([
               ` ${ kmap("p:") } pause`
               + `  ${ kmap("c:") } continue`
               + `  ${ kmap("d:") } cancel`
               + `  ${ kmap("x:") } set max concurrent media downloads`
               , ` ${ kmap("j:") } set max concurrent source downloads`
             ], cols, 2, "v", false, line => bgBlue(line));
}
