import {State} from "../state";
export type PaneDir = "v" | "h";

export type ContentCallback = ((cols: number, rows: number) => string | Pane | (string | Pane)[]);
export type PaneContent = string | Pane | (string | Pane)[];
export type PaneContentCallback = string | Pane | (string | Pane)[] | ContentCallback;

export interface Pane {
  contents: (string | Pane)[] | ContentCallback;
  cols: number;
  rows: number;
  dir: PaneDir;
  fill: boolean;
  post(line: string): string;
  cache: {
    contents: (string | Pane)[],
    diff: boolean;
    dirDiff: boolean;
    rendered: string[];
    renderedCols: number;
    verticalShift: number;
  }
}

export function pane(contents: PaneContentCallback, cols = 0, rows = 0, dir: PaneDir = "v", fill = false, post?: Pane["post"], vShift = 0): Pane {
  let paneContent = <any> contents;
  const contentsFunc = typeof contents === "function";

  // Wrap in array if it's raw content and unwrapped
  if (!contentsFunc && !Array.isArray(contents)) {
    paneContent = [contents];
  }

  return {
    contents: paneContent,
    cols,
    rows,
    dir,
    fill,
    post,
    cache: {
      contents: contentsFunc ? null : paneContent,
      diff: true,
      dirDiff: true,
      rendered: null,
      renderedCols: 0,
      verticalShift: vShift,
    }
  };
}
