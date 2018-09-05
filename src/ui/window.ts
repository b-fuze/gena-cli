import {State} from "../state";
import {pane} from "./pane";
import {header} from "./header-pane";
import {footer} from "./footer-pane";
import {content} from "./content-pane";

export function window(state: State, cols: number, rows: number) {
  return pane([
    header(state, cols),
    content(state),
    footer(state, cols),
  ], cols, rows);
}
