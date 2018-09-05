import {State, update} from "../state";
import {pane, Pane, PaneContent} from "./pane";
import tc from "turbocolor";
import {jSh} from "jshorts";

export type ScrollItems = string[] | Pane[];

export function scroll(state: State, items: ScrollItems, cols: number, rows: number) {
  const scrollMax = Math.max(items.length - rows, 0);
  const scrollDistance = Math.min(state.scroll, scrollMax);

  return pane([
    scrollview(scrollDistance, items, cols - state.scrollbarWidth, rows),
    scrollbar(state, scrollDistance, scrollMax, items.length, rows),
  ], cols, rows, "h");
}

function scrollview(scrollDistance: number, items: ScrollItems, cols: number, rows: number) {
  return pane([
    pane(new Array(rows).fill(tc.green("┃")), 1, rows),
    pane(items.slice(scrollDistance, rows + scrollDistance), cols - 1, rows),
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

  const scrollbarRow = tc.bgGreen(jSh.nChars(" ", state.scrollbarWidth));
  const scrollbarTroughRow = tc.bgBlack(jSh.nChars(" ", state.scrollbarWidth));
  const trough: string[] = Array(rows).fill(scrollbarTroughRow);

  // Draw scrollbar
  for (let i=0; i<sbHeight; i++) {
    trough[sbPos + i] = scrollbarRow;
  }

  return pane(trough, state.scrollbarWidth, rows, "v");
}
