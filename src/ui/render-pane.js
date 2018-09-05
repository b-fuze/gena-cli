"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pane_1 = require("./pane");
const term_utils_1 = require("term-utils");
const jshorts_1 = require("jshorts");
function render(main, cols, rows, undetermined = false) {
    const { post, fill } = main;
    const isHorizontal = main.dir === "h";
    const isVertical = !isHorizontal;
    let canvas;
    if (undetermined) {
        const canvasCols = fill ? (isHorizontal ? cols : 1) : 0;
        const canvasRows = fill ? (isVertical ? rows : 1) : 0;
        canvas = emptyCanvas(canvasCols, canvasRows);
    }
    else {
        canvas = emptyCanvas(cols, rows);
    }
    if (typeof main.contents === "function") {
        // The pane is merely a callback
        canvas = render(pane_1.pane(main.contents(cols, rows), cols, rows, main.dir), cols, rows);
    }
    else {
        // [canvas, cols, offset, selfConsumption] - offset is optional
        const renderedPanes = [];
        const deferred = [];
        let consumed = 0;
        // Loop child panes
        for (let i = 0; i < main.contents.length; i++) {
            const content = main.contents[i];
            if (typeof content === "string") {
                // Child is a raw string instead of a pane
                let paneRows = 1;
                let consumption = 0;
                const preRenderedContent = content.replace("\n", "");
                const renderedContent = preRenderedContent && applyRightAlign(preRenderedContent, cols);
                const strippedContent = renderedContent && term_utils_1.stripAnsi(renderedContent);
                if (isHorizontal) {
                    paneRows = rows;
                    consumption = Math.min(strippedContent.length, cols);
                }
                else {
                    consumption = 1;
                }
                const pane = paneMerge(emptyCanvas(strippedContent.length, 1), [renderedContent], 0, 0, strippedContent.length, 1);
                renderedPanes.push([pane, strippedContent.length]);
                consumed += consumption;
            }
            else if (content) {
                // Child is a pane
                if (isVertical && content.rows
                    || isHorizontal && content.cols) {
                    // Child has defined non-zero col and row dimensions
                    consumed += isVertical ? content.rows : content.cols;
                    const availCols = isVertical ? cols : content.cols;
                    const availRows = isHorizontal ? rows : content.rows;
                    const rendered = render(content, availCols, availRows);
                    let paneCols = 0;
                    let paneRows = rendered.length;
                    // Get max cols
                    // FIXME: This is probably useless, should probably just adjust `paneMerge`'s 4th arg
                    for (const row of rendered) {
                        const strippedRow = term_utils_1.stripAnsi(row);
                        paneCols = Math.max(strippedRow.length, paneCols);
                    }
                    const renderedPaneCols = Math.min(paneCols, availCols);
                    const pane = paneMerge(emptyCanvas(content.cols || cols, content.rows || rows), rendered, 0, 0, renderedPaneCols, paneRows);
                    renderedPanes.push([
                        pane,
                        renderedPaneCols,
                    ]);
                }
                else {
                    renderedPanes.push(null);
                    deferred.push(i);
                }
            }
        }
        if (deferred.length) {
            deferredLoop: for (const index of deferred) {
                const pane = main.contents[index];
                const paneRenderingCols = isVertical ? cols : cols - consumed;
                const paneRenderingRows = isHorizontal ? rows : rows - consumed;
                const rendered = sliceCanvas(render(pane, paneRenderingCols, paneRenderingRows, true), paneRenderingCols, paneRenderingRows);
                let paneCols = 0;
                // Get max cols
                for (const row of rendered) {
                    const strippedRow = term_utils_1.stripAnsi(row);
                    paneCols = Math.max(strippedRow.length, paneCols);
                }
                let paneRendered;
                renderedPanes[index] = paneRendered = [rendered, paneCols];
                if (isVertical) {
                    consumed -= rendered.length;
                }
                else {
                    consumed -= paneCols;
                }
                if (consumed <= 0) {
                    // No more space left
                    break deferredLoop;
                }
            }
        }
        let offset = 0;
        for (const pane of renderedPanes) {
            if (pane) {
                canvas = paneMerge(canvas, pane[0], isHorizontal ? offset : 0, isVertical ? offset : 0, pane[1], pane[0].length);
                offset += isVertical ? pane[0].length : pane[1];
            }
        }
    }
    if (post) {
        canvas = canvas.map(line => post(line));
    }
    return canvas;
}
exports.render = render;
function paneMerge(canvas, contents, x, y, cols, rows) {
    let copy = canvas.slice();
    const lastRow = y + rows;
    if (copy.length < y) {
        const row = jshorts_1.jSh.nChars(" ", cols);
        copy = copy.concat(new Array(y - copy.length).fill(row));
    }
    for (let i = y; i < lastRow; i++) {
        const row = i in copy ? copy[i] : jshorts_1.jSh.nChars(" ", cols);
        const subRowLine = contents[i - y];
        const subRow = subRowLine ? term_utils_1.sliceAnsi(subRowLine, 0, cols, true) : "";
        const subRowStripped = term_utils_1.stripAnsi(subRow);
        copy[i] = (row ? term_utils_1.sliceAnsi(row, 0, x, true) : "")
            + subRow
            + (row ? term_utils_1.sliceAnsi(row, x + subRowStripped.length, undefined, true) : "");
    }
    return copy;
}
function sliceCanvas(canvas, cols, rows) {
    return canvas.slice(0, rows).map(line => line ? term_utils_1.sliceAnsi(line, 0, cols) : "");
}
function copyCanvas(canvas) {
    return canvas.slice();
}
function emptyCanvas(cols, rows) {
    const row = jshorts_1.jSh.nChars(" ", cols);
    return new Array(rows).fill(row);
}
const rightAlignSymbolRe = /\\\][Rr]/g;
function applyRightAlign(output, cols) {
    rightAlignSymbolRe.lastIndex = 0;
    const match = rightAlignSymbolRe.exec(output);
    if (match) {
        const prefer = +(match[0][2] === "R");
        const opposite = 1 - prefer;
        const sides = [
            output.slice(0, match.index),
            output.slice(match.index + 3),
        ];
        const sidesRaw = sides.map(s => term_utils_1.stripAnsi(s));
        const maxUnprefCol = cols - Math.min(sidesRaw[prefer].length, cols);
        if (prefer === 0) {
            // Prefer left side
            sides[opposite] && (sides[opposite] = term_utils_1.sliceAnsi(sides[opposite], 0, maxUnprefCol, true)); // sides[opposite].slice(0, maxUnprefCol);
        }
        else {
            // Prefer right side
            sides[opposite] && (sides[opposite] = term_utils_1.sliceAnsi(sides[opposite], -maxUnprefCol, undefined, true));
        }
        const preSliced = sides[0] + term_utils_1.strMultiply(" ", maxUnprefCol - sidesRaw[opposite].length) + sides[1];
        output = preSliced && term_utils_1.sliceAnsi(preSliced, 0, cols);
    }
    return output;
}
