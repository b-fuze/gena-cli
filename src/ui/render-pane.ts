import {pane, Pane} from "./pane";
import {stripAnsi, strMultiply, sliceAnsi, SliceMeta} from "term-utils";
import {jSh} from "jshorts";

export function render(main: Pane, cols: number, rows: number, undetermined = false) {
  const {post, fill} = main;

  const isHorizontal = main.dir === "h";
  const isVertical = !isHorizontal;
  let canvas: string[];
  let maxCols = 0;

  if (undetermined) {
    const canvasCols = fill ? (isHorizontal ? cols : 1) : 0;
    const canvasRows = fill ? (isVertical ? rows : 1) : 0;
    canvas = emptyCanvas(canvasCols, canvasRows);
  } else {
    canvas = emptyCanvas(cols, rows);
  }

  if (typeof main.contents === "function") {
    // The pane is merely a callback
    canvas = render(pane(main.contents(cols, rows), cols, rows, main.dir), cols, rows).canvas;
  } else {
    // [canvas, cols, rows] - offset is optional
    const renderedPanes: [string[], number, number][] = [];
    const deferred: number[] = [];
    let consumed = 0;

    // Loop child panes
    for (let i=0; i<main.contents.length; i++) {
      const content = main.contents[i];

      if (typeof content === "string") {
        // Child is a raw string instead of a pane
        let paneRows = 1;
        let consumption = 0;
        const preRenderedContent = content.replace("\n", "");

        let lineMeta: {out: string, length: number};
        const renderedContent = preRenderedContent && (lineMeta = applyRightAlign(preRenderedContent, cols)).out;
        const strippedContentLength = renderedContent.length && (lineMeta.length === -1 ? stripAnsi(renderedContent).length : lineMeta.length);

        if (isHorizontal) {
          paneRows = rows;
          consumption = Math.min(strippedContentLength, cols);
        } else {
          consumption = 1;
        }

        renderedPanes.push([[renderedContent], strippedContentLength, 1]);
        consumed += consumption;
      } else if (content) {
        // Child is a pane
        if (isVertical && content.rows
            || isHorizontal && content.cols) {
          // Child has defined non-zero col and row dimensions
          consumed += isVertical ? content.rows : content.cols;

          const availCols = isVertical   ? cols : content.cols;
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

        } else {
          renderedPanes.push(null);
          deferred.push(i);
        }
      }
    }

    if (deferred.length) {
      deferredLoop:
      for (const index of deferred) {
        const pane = <Pane> main.contents[index];
        const paneRenderingCols = isVertical ? cols : cols - consumed;
        const paneRenderingRows = isHorizontal ? rows : rows - consumed;
        const rawRender = render(
          pane,
          paneRenderingCols,
          paneRenderingRows,
          true,
        );

        const rendered = rawRender.canvas;
        const paneCols = rawRender.cols;

        let paneRendered: [string[], number, number];
        renderedPanes[index] = paneRendered = [rendered, paneRenderingCols, paneRenderingRows];

        if (isVertical) {
          consumed -= rendered.length;
        } else {
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
        const converged = paneMerge(
          canvas,
          pane[0],
          isHorizontal ? offset : 0,
          isVertical   ? offset : 0,
          pane[1],
          pane[0].length,
        );

        canvas = converged.pane;
        maxCols = Math.max(converged.cols, maxCols);

        offset += isVertical ? pane[0].length : pane[1];
      }
    }
  }

  if (post) {
    canvas = canvas.map(line => post(line));
  }

  return {
    canvas,
    cols: maxCols,
  };
}

function paneMerge(
  canvas: string[],
  contents: string[],
  x: number,
  y: number,
  cols: number,
  rows: number,
) {
  let copy = canvas.slice();
  let maxConsumedCols = 0;
  const lastRow = y + rows;

  if (copy.length < y) {
    const row = jSh.nChars(" ", cols);
    copy = copy.concat(new Array(y - copy.length).fill(row));
  }

  for (let i=y; i<lastRow; i++) {
    const row = i in copy ? copy[i] : jSh.nChars(" ", cols);
    const subRowLine = contents[i - y];
    const subRow = subRowLine ? sliceAnsi(subRowLine, 0, cols, true, true) : {out: "", length: 0};
    let sliceData1: {out: string, length: number};
    let sliceData2: {out: string, length: number};
    copy[i] = (row ? (sliceData1 = sliceAnsi(row, 0, x, true, true)).out : "")
              + subRow.out
              + (row ? (sliceData2 = sliceAnsi(row, x + subRow.length, undefined, true, true)).out : "");

    maxConsumedCols = Math.max(sliceData1.length + subRow.length + sliceData2.length, maxConsumedCols);
  }

  return {pane: copy, cols: maxConsumedCols};
}

function copyCanvas(canvas: string[]) {
  return canvas.slice();
}

function emptyCanvas(cols: number, rows: number) {
  const row = jSh.nChars(" ", cols);
  return new Array<string>(rows).fill(row);
}

function applyRightAlign(output: string, cols: number) {
  // old: const rightAlignSymbolRe = /\\\][Rr]/g;
  const matchIndex = output.indexOf("\\]");
  const meta = {
    out: output,
    length: -1,
  };

  if (matchIndex !== -1) {
    const char = matchIndex;
    let prefer = -1;

    switch (output[matchIndex + 2]) {
      case "R":
        prefer = 1;
        break;
      case "r":
        prefer = 0;
        break;
    }

    if (prefer !== -1) {
      const opposite = 1 - prefer;

      const sides = [
        output.slice(0, matchIndex),
        output.slice(matchIndex + 3),
      ];

      let preferMeta: SliceMeta;
      let oppositeMeta: SliceMeta;

      if (prefer === 0) {
        // Prefer left side
        sides[prefer] = (preferMeta = sliceAnsi(sides[prefer], 0, cols, true, true)).out;
      } else {
        sides[prefer] = (preferMeta = sliceAnsi(sides[prefer], -cols, undefined, true, true)).out;
      }

      const maxUnprefCol = cols - Math.min(preferMeta.oldLength, cols);

      if (prefer === 0) {
        sides[opposite] = (oppositeMeta = sliceAnsi(sides[opposite], 0, maxUnprefCol, true, true)).out;
      } else {
        sides[opposite] = (oppositeMeta = sliceAnsi(sides[opposite], -maxUnprefCol, undefined, true, true)).out;
      }

      const middleLength = Math.max(maxUnprefCol - oppositeMeta.oldLength, 0);
      meta.out = sides[0] + strMultiply(" ", middleLength) + sides[1];
      meta.length = preferMeta.length + middleLength + oppositeMeta.length;
    }
  }

  return meta;
}
