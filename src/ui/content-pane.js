"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const turbocolor_1 = __importDefault(require("turbocolor"));
const pane_1 = require("./pane");
const scrollable_1 = require("./scrollable");
const task_row_1 = require("./task-row");
function content(state) {
    return pane_1.pane((cols, rows) => {
        const items = state.tasks.map((t, i) => pane_1.pane((cols) => task_row_1.taskRow(t.id + "", turbocolor_1.default.green(t.title), t.currentDl, cols, false), 0, 1));
        return scrollable_1.scroll(state, pane_1.pane((cols, rows) => task_row_1.taskRow("#", "TASK", 0, cols, true), 0, 1), items, cols, rows, state.showNotification && turbocolor_1.default.bold.blue("SEND HELP TO WEEB LAND PLES"));
    }, 0, 0, "v");
}
exports.content = content;
