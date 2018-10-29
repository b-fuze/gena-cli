import {State, computedState, setOldState, applyUpdates} from "./state";
import {pane, Pane} from "./ui/pane";
import {render, diffPanes} from "./ui/render-pane";
import {window} from "./ui/window";
import {MediaStatus} from "./anv";
import {performance} from "perf_hooks";

const alternativeStart = "\u001b[?1049h";
const alternativeEnd   = "\u001b[?1049l";
const showCursor       = "\u001b[?25h";
const hideCursor       = "\u001b[?25l";
const clearScreen      = "\u001b[2J";
const positionCursor   = (col: number, row: number) => `\u001b[${ row };${ col }H`;

export
class UI {
  public active = false;
  public lastPane: Pane = null;
  private updateRecursion: number = 0;
  private maxUpdateRecursion: number = 6;

  constructor(
    public stdin: NodeJS.ReadStream,
    public stdout: NodeJS.WriteStream,
  ) { }

  start() {
    if (!this.active) {
      this.stdin.setRawMode(true);
      this.stdout.write(alternativeStart + hideCursor);

      this.active = true;
    }
  }

  stop() {
    if (this.active) {
      this.stdin.setRawMode(false);
      this.stdout.write(alternativeEnd + showCursor);

      this.active = false;
    }
  }

  render(state: State) {
    const cols = this.stdout.columns;
    const rows = this.stdout.rows;

    // Update state cols/rows
    state.viewCols = cols;
    state.viewRows = rows;

    // Build panes
    const tp = performance.now();
    const panes = window(state, cols, rows);
    const tp2 = performance.now();

    // Clear diff panes
    state.samePanes = 0;
    state.diffPanes = 0;

    let td: number;
    let td2: number;
    if (this.lastPane) {
      td = performance.now();
      diffPanes(this.lastPane, panes, state);
      td2 = performance.now();
    }

    // Paint new screen onto buffer (before clearing to prevent flickering)
    const tr = performance.now();
    const newBuffer = render(panes, cols, rows).canvas.join("\n");
    const tr2 = performance.now();

    if (this.updateRecursion < this.maxUpdateRecursion && applyUpdates(state)) {
      // Render again to reflect new updates
      this.updateRecursion++;
      this.render(state);
    } else {
      // No updates, finish writing new buffer screen
      // Reset screen
      this.stdout.write(positionCursor(1, 1));

      // Write new screen
      this.stdout.write(newBuffer);

      // Save paint performance
      state.lastPaintDuration = Math.floor((tr2 - tr) * 100) / 100;
      state.lastPaneBuildDuration = Math.floor((tp2 - tp) * 100) / 100;

      if (td !== undefined) {
        state.lastPaneDiffDuration = Math.floor((td2 - td) * 100) / 100;
      }

      // Save lastPane
      this.lastPane = panes;
      this.updateRecursion = 0;
    }
  }

  update(state: State, input: number | string, fullInput: string) {
    setOldState(state);

    if (input === 27) {
      input = fullInput.charCodeAt(2);
      // Escape sequence
      switch (input) {
        case 65: // Up arrow
          state.scrollCursor = Math.max(state.scrollCursor - 1, 0);
          break;
        case 66: // Down arrow
          state.scrollCursor = Math.max(Math.min(state.scrollCursor + 1, state.scrollItemCount - 1), 0);
          break;
        case 68: // Left arrow
          state.scrollbarWidth++;
          break;
        case 67: // Right arrow
          state.scrollbarWidth--;
          break;
      }

      input = "ESC " + input;
    } else {
      // Regular character
      switch (input) {
        case 32: // Space key
          const titles = [
            "Late Night Thing",
            "Egyptian Muses",
            "Memes from long ago...",
            "Recursive Title(self)",
            "Random ilk",
            "XKCD was here",
            "Lies",
            "The retired fable of old, since yonder times...",
          ];

          state.tasks.push(<any> {
            provider: ["9anime", "gogoanime", "animerush"][Math.floor(Math.random() * 3)],
            list: [
              {status: MediaStatus.ACTIVE},
              {status: MediaStatus.ACTIVE},
              {status: MediaStatus.ACTIVE},
              // {status: MediaStatus.ACTIVE},
              // {status: MediaStatus.ACTIVE},
            ],
            id: state.tasks.length + 1,
            currentDl: Math.round(Math.random() * 100),
            title: titles[Math.round(Math.random() * (titles.length - 1))],
          });
          break;

        case 45: // Minus/dash key
          state.tasks.pop();
          break;

        case 13: // Enter key
          state.showNotification = !state.showNotification;
          break;
      }
    }

    for (const stateName in computedState) {
      (<any> state)[stateName] = computedState[stateName](state);
    }

    // Display key
    state.lastKey = input;
  }
}
