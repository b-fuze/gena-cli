import tc from "turbocolor";
import {strFill} from "term-utils";
import {State} from "../state";
import {pane} from "./pane";
import {scroll} from "./scrollable";

export function content(state: State) {
  return pane((cols, rows) => {
    // return [
    //   tc.green(strFill("━", cols)),
    //   tc.red(" Content") + " hurr durr",
    // ].concat(new Array(rows - 2).fill("~"));

    const items = state.tasks.map((t, i) => `TASK - ${ (i++) } - ` + tc.red("" + t.id));
    return scroll(state, items, cols, rows);
  }, 0, 0, "v");

}
