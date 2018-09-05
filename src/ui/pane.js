"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function pane(contents, cols = 0, rows = 0, dir = "v") {
    let paneContent = contents;
    // Wrap in array if it's raw content and unwrapped
    if (typeof contents !== "function" && !Array.isArray(contents)) {
        paneContent = [contents];
    }
    return {
        contents: paneContent,
        cols,
        rows,
        dir,
    };
}
exports.pane = pane;
