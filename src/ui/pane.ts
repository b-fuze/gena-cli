import {State} from "../state";
export type PaneDir = "v" | "h";

export type ContentCallback = ((cols: number, rows: number) => string | string[] | Pane | Pane[]);
export type PaneContent = string | string[] | Pane | Pane[];
export type PaneContentCallback = string | string[] | Pane | Pane[] | ContentCallback;

export interface Pane {
  contents: (string | Pane)[] | ContentCallback;
  cols: number;
  rows: number;
  dir: PaneDir;
}

export function pane(contents: string | string[] | Pane | Pane[] | ContentCallback, cols = 0, rows = 0, dir: PaneDir = "v"): Pane {
  let paneContent = <any> contents;

  // Wrap in array if it's raw content and unwrapped
  if (typeof contents !== "function" && !Array.isArray(contents)) {
    paneContent = [contents];
  }

  return {
    contents: paneContent,
    cols,
    rows,
    dir,
  };
}
