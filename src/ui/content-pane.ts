import {bold, blue} from "colorette";
import {strFill} from "term-utils";
import {State} from "../state";
import {pane, Pane} from "./pane";
import {scroll} from "./scrollable";
import {taskRow, taskMediaRow, taskRowHeader} from "./task-row";

export function content(state: State) {
  return pane((cols, rows) => {
    const items: Pane[] = []; // state.tasks.map((t, i) => pane((cols) => taskRow(state, t, cols, i), 0, 1));
    let offset = 0;

    for (let i=0; i<state.tasks.length; i++) {
      const task = state.tasks[i];
      const curOffset = offset;
      items.push(pane((cols) => taskRow(state, task, cols, i + curOffset), 0, 1));

      for (const media of task.list) {
        offset++;
        const curOffset = offset;
        items.push(pane((cols) => taskMediaRow(state, media, cols, i + curOffset), 0, 1));
      }
    }

    return scroll(state, pane((cols, rows) => taskRowHeader(
      state,
      cols,
    ), 0, 1), items, cols, rows, state.showNotification && bold(blue("SEND HELP TO WEEB LAND PLES")));
  }, 0, 0, "v");
}
