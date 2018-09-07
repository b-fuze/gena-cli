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
}

export function pane(contents: PaneContentCallback, cols = 0, rows = 0, dir: PaneDir = "v", fill = false, post?: Pane["post"]): Pane {
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
    fill,
    post,
  };
}
