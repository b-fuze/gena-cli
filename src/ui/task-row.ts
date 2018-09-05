import {pane} from "./pane";
import {rightAlign, forceAnsi} from "term-utils";
import tc from "turbocolor";
import {jSh} from "jshorts";

export function taskRow(
  id: string,
  name: string,
  progress: number,
  cols: number,
  isHeader: boolean,
) {
  const progressWidth = Math.floor(cols / 2);
  const progressConsumed = isHeader ? 0 : Math.floor(Math.max(Math.min(progress / 100, 1), 0) * (progressWidth - 10));
  const progressDisplay = isHeader
                            ? tc.bold("PROGRESS")
                            : tc.bold("[")
                              + jSh.nChars(tc.blue("■"), progressConsumed)
                              + jSh.nChars(tc.black("■"), (progressWidth - 10) - progressConsumed)
                              + tc.bold("]");

  return pane([
    pane(rightAlign(isHeader ? tc.bold(id) : id, true), 3, 1),
    " ",
    pane((cols) => isHeader ? tc.bold(name) : name, 0, 1, "h", true),
    " ",
    pane(rightAlign(progressDisplay, true), progressWidth, 1),
    pane(rightAlign(isHeader ? tc.bold("%") : Math.floor(progress) + tc.bold("%")), 5, 1),
  ], cols, 1, "h", false, (text) => {
    return isHeader ? tc.bgBlue(forceAnsi(text, tc.Styles.bgBlue.open)) : text;
  });
}
