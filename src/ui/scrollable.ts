import {State, update, getOldState} from "../state";
import {pane, Pane, PaneContent} from "./pane";
import {bold, blue, red, gray, black, green, bgBlue, bgWhite, bgMagenta} from "colorette";
import {center, forceAnsi} from "term-utils";
import {jSh} from "jshorts";

export type ScrollItems = string[] | Pane[];

export function scroll(state: State, header: Pane, items: ScrollItems, cols: number, rows: number, notification?: string) {
  const notifiHeight = 3;
  const viewRows = notification ? rows - notifiHeight : rows;

  const headerUnoccupiedSpace = Math.max(viewRows - Number(!!header), 0);
  const scrollMax = Math.max(items.length - headerUnoccupiedSpace, 0);
  const scrollDistance = Math.min(state.scroll, scrollMax);
  const oldState = getOldState(state);
  const scrollDiff = oldState ? state.scroll - oldState.scroll : 0;

  // Ensure state reflects the scroll view
  if (state.scrollMax !== scrollMax
      || state.scrollItemCount !== items.length
      || state.scrollPaneHeight !== headerUnoccupiedSpace - 1 /* header height */) {
    update(state, {
      scrollMax,
      scrollItemCount: items.length,
      scrollPaneHeight: headerUnoccupiedSpace - 1,
    });
  }

  return pane([
    // Top notification pane
    notification
      ? pane([
          pane([
            pane(new Array(notifiHeight).fill(blue("▏")), 1, notifiHeight),
            pane([
              "",
              center(notification, cols - 2),
              "",
            ], cols - 2, notifiHeight),
          ],
          cols - 1, notifiHeight, "h", false, (line) => bgWhite(line)),
          pane(new Array(notifiHeight).fill(blue("▕")), 1, notifiHeight),
        ],
        cols, notifiHeight, "h")
      : null,

    // Actual scroll section
    pane([
      header
        ? pane([
            bgMagenta(blue("▏")),
            pane(header, cols - 2, 1),
            bgMagenta(blue("▕")),
          ], cols, 1, "h")
        : null,
      pane([
        scrollview(scrollDistance, items, cols - state.scrollbarWidth, headerUnoccupiedSpace, scrollDiff),
        scrollbar(state, scrollDistance, scrollMax, items.length, headerUnoccupiedSpace),
      ], 0, 0, "h"),
    ], cols, viewRows, "v")
  ], cols, viewRows, "v");
}

function scrollview(scrollDistance: number, items: ScrollItems, cols: number, rows: number, scrollDiff: number) {
  return pane([
    pane(new Array(rows).fill(blue("▏")), 1, rows),
    pane(items.slice(scrollDistance, rows + scrollDistance), cols - 1, rows, "v", false, null, scrollDiff),
  ], cols, rows, "h");
}

function scrollbar(state: State, scrollDistance: number, scrollMax: number, itemCount: number, rows: number) {
  const sbHeight = itemCount
                    ? Math.max(Math.min(Math.round((rows / itemCount) * rows), rows), state.scrollbarMinHeight)
                    : rows;
  const sbPosMax = rows - sbHeight;
  const sbPos = scrollMax
                  ? Math.round((scrollDistance / scrollMax) * sbPosMax)
                  : 0;

  const scrollbarRow = green(jSh.nChars("▕", state.scrollbarWidth));
  const scrollbarTroughRow = gray(jSh.nChars("▕", state.scrollbarWidth));
  const trough: string[] = Array(rows).fill(scrollbarTroughRow);

  // Draw scrollbar
  for (let i=0; i<sbHeight; i++) {
    trough[sbPos + i] = scrollbarRow;
  }

  return pane(trough, state.scrollbarWidth, rows, "v");
}
