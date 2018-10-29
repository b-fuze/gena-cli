"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const colorette_1 = require("colorette");
const pane_1 = require("./pane");
const scrollable_1 = require("./scrollable");
const task_row_1 = require("./task-row");
function content(state) {
    return pane_1.pane((cols, rows) => {
        const items = []; // state.tasks.map((t, i) => pane((cols) => taskRow(state, t, cols, i), 0, 1));
        let offset = 0;
        for (let i = 0; i < state.tasks.length; i++) {
            const task = state.tasks[i];
            const curOffset = offset;
            items.push(pane_1.pane((cols) => task_row_1.taskRow(state, task, cols, i + curOffset), 0, 1));
            for (const media of task.list) {
                offset++;
                const curOffset = offset;
                items.push(pane_1.pane((cols) => task_row_1.taskMediaRow(state, media, cols, i + curOffset), 0, 1));
            }
        }
        return scrollable_1.scroll(state, pane_1.pane((cols, rows) => task_row_1.taskRowHeader(state, cols), 0, 1), items, cols, rows, state.showNotification && colorette_1.bold(colorette_1.blue("SEND HELP TO WEEB LAND PLES")));
    }, 0, 0, "v");
}
exports.content = content;
