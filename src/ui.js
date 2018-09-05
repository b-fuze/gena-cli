"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const state_1 = require("./state");
const render_pane_1 = require("./ui/render-pane");
const window_1 = require("./ui/window");
const anv_1 = require("./anv");
const perf_hooks_1 = require("perf_hooks");
const alternativeStart = "\u001b[?1049h";
const alternativeEnd = "\u001b[?1049l";
const showCursor = "\u001b[?25h";
const hideCursor = "\u001b[?25l";
const clearScreen = "\u001b[2J";
const positionCursor = (col, row) => `\u001b[${row};${col}H`;
class UI {
    constructor(stdin, stdout) {
        this.stdin = stdin;
        this.stdout = stdout;
        this.active = false;
    }
    start() {
        if (!this.active) {
            this.stdin.setRawMode(true);
            this.stdout.write(alternativeStart + hideCursor);
            this.active = true;
        }
    }
    stop() {
        if (this.active) {
            this.stdin.setRawMode(false);
            this.stdout.write(alternativeEnd + showCursor);
            this.active = false;
        }
    }
    render(state) {
        const cols = this.stdout.columns;
        const rows = this.stdout.rows;
        // Paint new screen onto buffer (before clearing to prevent flickering)
        const t = perf_hooks_1.performance.now();
        const newBuffer = render_pane_1.render(window_1.window(state, cols, rows), cols, rows).join("\n");
        const t2 = perf_hooks_1.performance.now();
        // Reset screen
        this.stdout.write(clearScreen + positionCursor(1, 1));
        // Write new screen
        this.stdout.write(newBuffer);
        // Save paint performance
        state.lastPaintDuration = Math.floor((t2 - t) * 100) / 100;
    }
    update(state, input, fullInput) {
        if (input === 27) {
            input = fullInput.charCodeAt(2);
            // Escape sequence
            switch (input) {
                case 65: // Up arrow
                    state.scroll = Math.max(state.scroll - 2, 0);
                    break;
                case 66: // Down arrow
                    state.scroll += 2;
                    break;
                case 68: // Left arrow
                    state.scrollbarWidth++;
                    break;
                case 67: // Right arrow
                    state.scrollbarWidth--;
                    break;
            }
            input = "ESC " + input;
        }
        else {
            // Regular character
            switch (input) {
                case 32: // Space key
                    state.tasks.push({
                        list: [
                            { status: anv_1.MediaStatus.ACTIVE },
                            { status: anv_1.MediaStatus.ACTIVE },
                            { status: anv_1.MediaStatus.ACTIVE },
                            { status: anv_1.MediaStatus.ACTIVE },
                            { status: anv_1.MediaStatus.ACTIVE },
                        ],
                        id: Math.round(Math.random() * 100000),
                    });
                    break;
                case 45: // Minus/dash key
                    state.tasks.pop();
                    break;
            }
        }
        for (const stateName in state_1.computedState) {
            state[stateName] = state_1.computedState[stateName](state);
        }
        // Display key
        state.lastKey = input;
    }
}
exports.UI = UI;