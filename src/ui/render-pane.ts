import {pane, Pane} from "./pane";
import {stripAnsi, strMultiply, sliceAnsi} from "term-utils";
import {jSh} from "jshorts";

export function render(main: Pane, cols: number, rows: number, undetermined = false) {
  const {post, fill} = main;

  const isHorizontal = main.dir === "h";
  const isVertical = !isHorizontal;
  let canvas: string[];

  if (undetermined) {
    const canvasCols = fill ? (isHorizontal ? cols : 1) : 0;
    const canvasRows = fill ? (isVertical ? rows : 1) : 0;
    canvas = emptyCanvas(canvasCols, canvasRows);
  } else {
    canvas = emptyCanvas(cols, rows);
  }

  if (typeof main.contents === "function") {
    // The pane is merely a callback
    canvas = render(pane(main.contents(cols, rows), cols, rows, main.dir), cols, rows);
  } else {
    // [canvas, cols, offset, selfConsumption] - offset is optional
    const renderedPanes: [string[], number][] = [];
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
        const renderedContent = preRenderedContent && applyRightAlign(preRenderedContent, cols);
        const strippedContent = renderedContent && stripAnsi(renderedContent);

        if (isHorizontal) {
          paneRows = rows;
          consumption = Math.min(strippedContent.length, cols);
        } else {
          consumption = 1;
        }

        const pane = paneMerge(
          emptyCanvas(strippedContent.length, 1),
          [renderedContent],
          0, 0,
          strippedContent.length, 1,
        );

        renderedPanes.push([pane, strippedContent.length]);
        consumed += consumption;
      } else if (content) {
        // Child is a pane
        if (isVertical && content.rows
            || isHorizontal && content.cols) {
          // Child has defined non-zero col and row dimensions
          consumed += isVertical ? content.rows : content.cols;

          const availCols = isVertical   ? cols : content.cols;
          const availRows = isHorizontal ? rows : content.rows;
          const rendered = render(content, availCols, availRows);

          let paneCols = 0;
          let paneRows = rendered.length;

          // Get max cols
          // FIXME: This is probably useless, should probably just adjust `paneMerge`'s 4th arg
          for (const row of rendered) {
            const strippedRow = stripAnsi(row);
            paneCols = Math.max(strippedRow.length, paneCols);
          }

          const renderedPaneCols = Math.min(paneCols, availCols);
          const pane = paneMerge(
            emptyCanvas(content.cols || cols, content.rows || rows),
            rendered,
            0, 0,
            renderedPaneCols, paneRows,
          );

          renderedPanes.push([
            pane,
            renderedPaneCols,
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
        const rendered = sliceCanvas(render(
          pane,
          paneRenderingCols,
          paneRenderingRows,
          true,
        ), paneRenderingCols, paneRenderingRows);

        let paneCols = 0;

        // Get max cols
        for (const row of rendered) {
          const strippedRow = stripAnsi(row);
          paneCols = Math.max(strippedRow.length, paneCols);
        }

        let paneRendered: [string[], number];
        renderedPanes[index] = paneRendered = [rendered, paneCols];

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
        canvas = paneMerge(
          canvas,
          pane[0],
          isHorizontal ? offset : 0,
          isVertical   ? offset : 0,
          pane[1],
          pane[0].length,
        );

        offset += isVertical ? pane[0].length : pane[1];
      }
    }
  }

  if (post) {
    canvas = canvas.map(line => post(line));
  }

  return canvas;
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
  const lastRow = y + rows;

  if (copy.length < y) {
    const row = jSh.nChars(" ", cols);
    copy = copy.concat(new Array(y - copy.length).fill(row));
  }

  for (let i=y; i<lastRow; i++) {
    const row = i in copy ? copy[i] : jSh.nChars(" ", cols);
    const subRowLine = contents[i - y];
    const subRow = subRowLine ? sliceAnsi(subRowLine, 0, cols, true) : "";
    const subRowStripped = stripAnsi(subRow);
    copy[i] = (row ? sliceAnsi(row, 0, x, true) : "")
              + subRow
              + (row ? sliceAnsi(row, x + subRowStripped.length, undefined, true) : "");
  }

  return copy;
}

function sliceCanvas(canvas: string[], cols: number, rows: number) {
  return canvas.slice(0, rows).map(line => line ? sliceAnsi(line, 0, cols) : "");
}

function copyCanvas(canvas: string[]) {
  return canvas.slice();
}

function emptyCanvas(cols: number, rows: number) {
  const row = jSh.nChars(" ", cols);
  return new Array<string>(rows).fill(row);
}

const rightAlignSymbolRe = /\\\][Rr]/g;
function applyRightAlign(output: string, cols: number) {
  rightAlignSymbolRe.lastIndex = 0;
  const match = rightAlignSymbolRe.exec(output);

  if (match) {
    const prefer = +(match[0][2] === "R");
    const opposite = 1 - prefer;

    const sides = [
      output.slice(0, match.index),
      output.slice(match.index + 3),
    ];

    const sidesRaw = sides.map(s => stripAnsi(s));
    const maxUnprefCol = cols - Math.min(sidesRaw[prefer].length, cols);

    if (prefer === 0) {
      // Prefer left side
      sides[opposite] && (sides[opposite] = sliceAnsi(sides[opposite], 0, maxUnprefCol, true)); // sides[opposite].slice(0, maxUnprefCol);
    } else {
      // Prefer right side
      sides[opposite] && (sides[opposite] = sliceAnsi(sides[opposite], -maxUnprefCol, undefined, true));
    }

    const preSliced = sides[0] + strMultiply(" ", maxUnprefCol - sidesRaw[opposite].length) + sides[1];
    output = preSliced && sliceAnsi(preSliced, 0, cols);
  }

  return output;
}
