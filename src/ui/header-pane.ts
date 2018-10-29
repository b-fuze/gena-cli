import {State, HeaderState} from "../state";
import {rightAlign, strMultiply, strFill} from "term-utils";
import {pane, Pane} from "./pane";
import {bold, bgBlue} from "colorette";

const headerContent: {
  [state: string]: ((state: State) => string)
} = {
  main(state: State) {
    return strMultiply(" ", 8) + `${ bold("" + state.activeMedia) } active media of ${ bold("" + state.tasks.length) } tasks`;
  }
};

export function header(state: State, cols: number, rows?: number) {
  return pane([
    " Downloads" + rightAlign(headerContent[state.header](state)) + " ",
  ], cols, 1, "v", false, line => bgBlue(line));
}
