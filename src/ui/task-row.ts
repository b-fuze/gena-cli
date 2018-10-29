import {pane} from "./pane";
import {State} from "../state";
import {rightAlign, forceAnsi, strFill} from "term-utils";
import {Task, Media, MediaStatus} from "../anv";
import {bold, blue, black, green, bgBlue, bgWhite, bgMagenta} from "colorette";
import {jSh} from "jshorts";

export function taskRowHeader(
  state: State,
  cols: number,
) {
  const countWidth = "Media      ".length;
  const dlWidth = "Downloading      ".length;
  const providerWidth = Math.floor(cols / 5);

  return pane([
    pane(rightAlign(bold("#"), true), 3, 1),
    " ",
    pane(bold("TASK"), 0, 1, "h", true),
    " ",
    pane(bold("MEDIA"), countWidth, 1),
    "  ",
    pane(bold("STATUS"), dlWidth, 1),
    "  ",
    pane(bold("PROVIDER"), providerWidth, 1),
    // pane(rightAlign(bold("%")), 5, 1),
  ], cols, 1, "h", false, (text) => {
    return bgMagenta(text);
  });
}

export function taskRow(
  state: State,
  task: Task,
  cols: number,
  index: number,
) {
  const isSelected = index === state.scrollCursor;
  const countWidth = "Media      ".length;
  const dlWidth = "Downloading      ".length;
  const providerWidth = Math.floor(cols / 5);

  return pane([
    pane(rightAlign(task.id + "", true), 3, 1),
    " ",
    pane((cols) => pane((isSelected ? black : green)(task.title), cols, 1), 0, 1, "h", true),
    " ",
    pane(task.list.length + rightAlign(""), countWidth, 1),
    "  ",
    pane("1 -> 39% 1.3MB/s" + rightAlign(""), dlWidth, 1),
    "  ",
    pane(task.provider + rightAlign(""), providerWidth, 1),
  ], cols, 1, "h", false, (text) => {
    return isSelected
             ? bgWhite(black(text))
             : text;
  });
}

export function taskMediaRow(
  state: State,
  media: Media,
  cols: number,
  index: number,
) {
  const isSelected = index === state.scrollCursor;
  const dlWidth = "Downloading      ".length;
  const providerWidth = Math.floor(cols / 5);

  return pane([
    pane((cols) => strFill(" ", cols), 0, 1, "h", true),
    "  ",
    pane("1 -> 39% 1.3MB/s" + rightAlign(""), dlWidth, 1),
    "  ",
    pane(rightAlign(""), providerWidth, 1),
  ], cols, 1, "h", false, (text) => {
    return isSelected
             ? bgWhite(black(text))
             : text;
  });
}
