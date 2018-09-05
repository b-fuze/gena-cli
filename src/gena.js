"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const state_1 = require("./state");
const ui_1 = require("./ui");
const ui = new ui_1.UI(process.stdin, process.stdout);
ui.start();
ui.render(state_1.state);
process.stdin.on("data", (chunk) => {
    const input = chunk.toString();
    const code = input.charCodeAt(0);
    ui.update(state_1.state, code, input);
    ui.render(state_1.state);
    if (code === 3) {
        ui.stop();
        console.log("Bye");
        process.exit();
    }
    // console.log("KEY: '" + input + "' - " + input.charCodeAt(0));
});
process.stdout.on("resize", () => {
    ui.render(state_1.state);
});
// // Sometime later
// ui.stop();
