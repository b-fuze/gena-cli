"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pane_1 = require("./pane");
const term_utils_1 = require("term-utils");
const jshorts_1 = require("jshorts");
const state_1 = require("../state");
function render(main, cols, rows, undetermined = false) {
    if (!main.cache.diff) {
        return {
            canvas: main.cache.rendered.slice(0, rows),
            cols: main.cache.renderedCols,
        };
    }
    const { post, fill } = main;
    const isHorizontal = main.dir === "h";
    const isVertical = !isHorizontal;
    let canvas;
    let maxCols = 0;
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
        const newPane = pane_1.pane(main.contents(cols, rows), cols, rows, main.dir);
        const oldPane = !main.cache.dirDiff && main.cache.contents && pane_1.pane(main.cache.contents, cols, rows, main.dir);
        let newCanvasMeta;
        if (oldPane) {
            // FIXME: !!!!!! REMOVE `state` FROM HEEREEE !!!!!!!
            const diff = diffPanes(oldPane, newPane, state_1.state);
            if (!diff) {
                newCanvasMeta = {
                    canvas: main.cache.rendered,
                    cols: main.cache.renderedCols,
                };
            }
        }
        let canvasMeta;
        canvas = (canvasMeta = newCanvasMeta || render(newPane, cols, rows)).canvas;
        maxCols = canvasMeta.cols;
        // Cache new contents
        main.cache.contents = newPane.contents;
    }
    else {
        // [canvas, cols, rows] - offset is optional
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
                let lineMeta;
                const renderedContent = preRenderedContent && (lineMeta = applyRightAlign(preRenderedContent, cols)).out;
                const strippedContentLength = renderedContent.length && (lineMeta.length === -1 ? term_utils_1.stripAnsi(renderedContent).length : lineMeta.length);
                if (isHorizontal) {
                    paneRows = rows;
                    consumption = Math.min(strippedContentLength, cols);
                }
                else {
                    consumption = 1;
                }
                renderedPanes.push([[renderedContent], strippedContentLength, 1]);
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
                    const rawRender = render(content, availCols, availRows);
                    const rendered = rawRender.canvas;
                    const paneCols = rawRender.cols;
                    const paneRows = rendered.length;
                    const renderedPaneCols = Math.min(paneCols, availCols);
                    renderedPanes.push([
                        rendered,
                        content.cols || cols,
                        content.rows || rows,
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
                const rawRender = render(pane, paneRenderingCols, paneRenderingRows, true);
                const rendered = rawRender.canvas;
                const paneCols = rawRender.cols;
                let paneRendered;
                renderedPanes[index] = paneRendered = [rendered, paneRenderingCols, paneRenderingRows];
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
                const converged = paneMerge(canvas, pane[0], isHorizontal ? offset : 0, isVertical ? offset : 0, pane[1], pane[0].length);
                canvas = converged.pane;
                maxCols = Math.max(converged.cols, maxCols);
                offset += isVertical ? pane[0].length : pane[1];
            }
        }
    }
    if (post) {
        canvas = canvas.map(line => post(line));
    }
    // Cache this pane
    main.cache.rendered = canvas;
    main.cache.renderedCols = maxCols;
    return {
        canvas,
        cols: maxCols,
    };
}
exports.render = render;
function paneMerge(canvas, contents, x, y, cols, rows) {
    let copy = canvas.slice();
    let maxConsumedCols = 0;
    const lastRow = y + rows;
    if (copy.length < y) {
        const row = jshorts_1.jSh.nChars(" ", cols);
        copy = copy.concat(new Array(y - copy.length).fill(row));
    }
    for (let i = y; i < lastRow; i++) {
        const row = i in copy ? copy[i] : jshorts_1.jSh.nChars(" ", cols);
        const subRowLine = contents[i - y];
        const subRow = subRowLine ? term_utils_1.sliceAnsi(subRowLine, 0, cols, term_utils_1.ResetSlice.ALL, true) : { out: "", length: 0 };
        let sliceData1;
        let sliceData2;
        copy[i] = (row ? (sliceData1 = term_utils_1.sliceAnsi(row, 0, x, term_utils_1.ResetSlice.ALL, true)).out : (sliceData1 = { out: "", length: 0 }, ""))
            + subRow.out
            + (row ? (sliceData2 = term_utils_1.sliceAnsi(row, x + subRow.length, undefined, term_utils_1.ResetSlice.ALL, true)).out : (sliceData2 = { out: "", length: 0 }, ""));
        maxConsumedCols = Math.max(sliceData1.length + subRow.length + sliceData2.length, maxConsumedCols);
    }
    return { pane: copy, cols: maxConsumedCols };
}
function diffPanes(old, cur, state) {
    if (!cur || !old) {
        return true;
    }
    cur.cache.dirDiff = old.dir !== cur.dir;
    cur.cache.contents = old.cache.contents;
    cur.cache.rendered = old.cache.rendered;
    cur.cache.renderedCols = old.cache.renderedCols;
    if (typeof old.contents === "function" || typeof cur.contents === "function") {
        return true;
    }
    let diff = false;
    if (old.cols !== cur.cols || old.rows !== old.rows) {
        diff = true;
    }
    if (old.dir === cur.dir) {
        // Compare children since the direction is the same
        let oldChildren;
        if (cur.dir === "h") {
            oldChildren = old.contents;
        }
        else {
            if (cur.cache.verticalShift && cur.cache.verticalShift < 0) {
                oldChildren = new Array(-1 * cur.cache.verticalShift).fill("").concat(old.contents);
            }
            else {
                oldChildren = old.contents.slice(cur.cache.verticalShift);
            }
        }
        const curChildren = cur.contents;
        for (let i = 0; i < curChildren.length; i++) {
            const oldChild = oldChildren[i];
            const curChild = curChildren[i];
            if (oldChild === undefined) {
                // Not same child count even
                diff = true;
                break;
            }
            else {
                if (typeof curChild === "string") {
                    if (oldChild !== curChild) {
                        diff = true;
                    }
                }
                else {
                    if (typeof oldChild === "string") {
                        diff = true;
                    }
                    else {
                        const childDiff = diffPanes(oldChild, curChild, state);
                        if (childDiff)
                            diff = true;
                    }
                }
            }
        }
    }
    else {
        // Direction is different
        diff = true;
    }
    if (diff) {
        state.diffPanes++;
    }
    else {
        state.samePanes++;
    }
    return cur.cache.diff = diff;
}
exports.diffPanes = diffPanes;
function copyCanvas(canvas) {
    return canvas.slice();
}
function emptyCanvas(cols, rows) {
    const row = jshorts_1.jSh.nChars(" ", cols);
    return new Array(rows).fill(row);
}
function applyRightAlign(output, cols) {
    // old: const rightAlignSymbolRe = /\\\][Rr]/g;
    const matchIndex = output.indexOf("\\]");
    const meta = {
        out: output,
        length: -1,
    };
    if (matchIndex !== -1) {
        let prefer = -1;
        let slide = -1;
        switch (output[matchIndex + 2]) {
            case "R":
                prefer = 1;
                break;
            case "r":
                prefer = 0;
                break;
        }
        switch (output[matchIndex + 3]) {
            case "/":
                slide = 1;
                break;
            case "\\":
                slide = 0;
                break;
        }
        if (prefer !== -1 && slide !== -1) {
            const opposite = 1 - prefer;
            const sides = [
                output.slice(0, matchIndex),
                output.slice(matchIndex + 4),
            ];
            let preferMeta;
            let oppositeMeta;
            if (prefer === 0) {
                // Prefer left side
                sides[prefer] = (preferMeta = term_utils_1.sliceAnsi(sides[prefer], 0, cols, term_utils_1.ResetSlice.ALL, true)).out;
            }
            else {
                sides[prefer] = (preferMeta = term_utils_1.sliceAnsi(sides[prefer], -cols, undefined, term_utils_1.ResetSlice.ALL, true)).out;
            }
            const maxUnprefCol = cols - Math.min(preferMeta.oldLength, cols);
            let unprefStart;
            let unprefEnd;
            if (slide) {
                unprefStart = -maxUnprefCol;
                unprefEnd = undefined;
            }
            else {
                unprefStart = 0;
                unprefEnd = maxUnprefCol;
            }
            sides[opposite] = (oppositeMeta = term_utils_1.sliceAnsi(sides[opposite], unprefStart, unprefEnd, term_utils_1.ResetSlice.ALL, true)).out;
            const middleLength = Math.max(maxUnprefCol - oppositeMeta.oldLength, 0);
            meta.out = sides[0] + term_utils_1.strMultiply(" ", middleLength) + sides[1];
            meta.length = preferMeta.length + middleLength + oppositeMeta.length;
        }
    }
    return meta;
}
