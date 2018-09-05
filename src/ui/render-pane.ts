import {pane, Pane} from "./pane";
import {stripAnsi, strMultiply, sliceAnsi} from "term-utils";
import {jSh} from "jshorts";

export function render(main: Pane, cols: number, rows: number, undetermined = false) {
  let canvas = undetermined ? emptyCanvas(0, 0) : emptyCanvas(cols, rows);
  const isHorizontal = main.dir === "h";
  const isVertical = !isHorizontal;

  if (typeof main.contents === "function") {
    canvas = render(pane(main.contents(cols, rows), cols, rows, main.dir), cols, rows);
  } else {
    // [canvas, cols, offset, selfConsumption] - offset is optional
    const renderedPanes: [string[], number][] = [];
    const deferred: number[] = [];
    let consumed = 0;

    for (let i=0; i<main.contents.length; i++) {
      const content = main.contents[i];

      if (typeof content === "string") {
        let paneRows = 1;
        let consumption = 0;
        const renderedContent = applyRightAlign(content.replace("\n", ""), cols);
        const strippedContent = stripAnsi(renderedContent);

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
      } else {
        if (isVertical && content.rows
            || isHorizontal && content.cols) {
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
            if (strippedRow.length > paneCols) paneCols = strippedRow.length;
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
        const rendered = render(
          pane,
          paneRenderingCols,
          isHorizontal ? rows : rows - consumed,
          true,
        );

        let paneCols = 0;

        // Get max cols
        for (const row of rendered) {
          const strippedRow = stripAnsi(row);
          if (strippedRow.length > paneCols) paneCols = strippedRow.length;
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
  let copy = copyCanvas(canvas);
  const lastRow = y + rows;

  if (copy.length < y) {
    const row = jSh.nChars(" ", cols);
    copy = copy.concat(new Array(y - copy.length).fill(row));
    console.log("CONCATTED", y - copy.length);
  }

  for (let i=y; i<lastRow; i++) {
    const row = i in copy ? copy[i] : jSh.nChars(" ", cols);
    const subRow = sliceAnsi(contents[i - y], 0, cols, true);
    copy[i] = sliceAnsi(row, 0, x, true)
              + subRow
              + jSh.nChars(" ", cols - stripAnsi(subRow).length)
              + sliceAnsi(row, x + cols, undefined, true);
  }

  return copy;
}

function copyCanvas(canvas: string[]) {
  return canvas.slice();
}

function emptyCanvas(cols: number, rows: number) {
  const row = jSh.nChars(" ", cols);
  return new Array<string>(rows).fill(row);
}

function applyRightAlign(output: string, cols: number) {
  const match = /\\\][Rr]/g.exec(output);

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
      sides[opposite] = sliceAnsi(sides[opposite], 0, maxUnprefCol, true); // sides[opposite].slice(0, maxUnprefCol);
    } else {
      // Prefer right side
      sides[opposite] = sliceAnsi(sides[opposite], -maxUnprefCol, undefined, true);
    }

    output = sliceAnsi(sides[0] + strMultiply(" ", maxUnprefCol - sidesRaw[opposite].length) + sides[1], 0, cols);
  }

  return output;
}
