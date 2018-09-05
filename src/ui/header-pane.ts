import {State, HeaderState} from "../state";
import {rightAlign, strMultiply, strFill} from "term-utils";
import {pane, Pane} from "./pane";
import tc from "turbocolor";

const headerContent: {
  [state: string]: ((state: State) => string)
} = {
  main(state: State) {
    return strMultiply(" ", 8) + `${ tc.bold("" + state.activeMedia) } active media of ${ tc.bold("" + state.tasks.length) } tasks `;
  }
};

export function header(state: State, cols: number, rows?: number) {
  return pane([
    "",
    tc.green("GENA") + rightAlign(headerContent[state.header](state)),
    "",
    tc.green("┏" + strFill("━", cols - 2) + "┓"),
  ], cols, 4, "v");
}
