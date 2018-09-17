"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function pane(contents, cols = 0, rows = 0, dir = "v", fill = false, post, vShift = 0) {
    let paneContent = contents;
    const contentsFunc = typeof contents === "function";
    // Wrap in array if it's raw content and unwrapped
    if (!contentsFunc && !Array.isArray(contents)) {
        paneContent = [contents];
    }
    return {
        contents: paneContent,
        cols,
        rows,
        dir,
        fill,
        post,
        cache: {
            contents: contentsFunc ? null : paneContent,
            diff: true,
            dirDiff: true,
            rendered: null,
            renderedCols: 0,
            verticalShift: vShift,
        }
    };
}
exports.pane = pane;
