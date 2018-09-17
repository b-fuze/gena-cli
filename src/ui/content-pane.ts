import tc from "turbocolor";
import {strFill} from "term-utils";
import {State} from "../state";
import {pane} from "./pane";
import {scroll} from "./scrollable";
import {taskRow} from "./task-row";

export function content(state: State) {
  return pane((cols, rows) => {
    const items = state.tasks.map((t, i) => pane((cols) => taskRow(t.id + "", tc.green(t.title), t.currentDl, cols, false), 0, 1));
    return scroll(state, pane((cols, rows) => taskRow(
      "#",
      "TASK",
      0,
      cols,
      true,
    ), 0, 1), items, cols, rows, state.showNotification && tc.bold.blue("SEND HELP TO WEEB LAND PLES"));
  }, 0, 0, "v");
}
