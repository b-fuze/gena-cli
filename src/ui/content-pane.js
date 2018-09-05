"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const turbocolor_1 = __importDefault(require("turbocolor"));
const pane_1 = require("./pane");
const scrollable_1 = require("./scrollable");
function content(state) {
    return pane_1.pane((cols, rows) => {
        // return [
        //   tc.green(strFill("━", cols)),
        //   tc.red(" Content") + " hurr durr",
        // ].concat(new Array(rows - 2).fill("~"));
        const items = state.tasks.map((t, i) => `TASK - ${(i++)} - ` + turbocolor_1.default.red("" + t.id));
        return scrollable_1.scroll(state, items, cols, rows);
    }, 0, 0, "v");
}
exports.content = content;
