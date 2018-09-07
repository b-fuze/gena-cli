// Full state of GENA
import {Task, MediaStatus} from "./anv";
export type ConnectionType = "ws" | "ipc";

export enum FocusedView {
  TASKLIST = "tasklist",
  TASKDETAILS = "taskdetails",
};

export enum FooterState {
  LISTTIPS = "listtips",
  DETAILSTIPS = "detailstips",
  NEWTASKTIPS = "newtasktips",
};

export enum HeaderState {
  MAIN = "main",
};

export const ViewUpdatesSymbol = Symbol();
export const state = {
  start: true,
  connection: <ConnectionType> "ws",
  host: "0.0.0.0",
  port: 7676,

  // UI state
  view: <FocusedView> "tasklist",
  header: <HeaderState> "main",
  footer: <FooterState> "listtips",

  confirmText: "Are you sure?",
  inputText: "",
  inputTextScroll: 0,
  inputTextCursor: 0,

  scroll: 0,
  scrollCursor: 0,
  scrollbarMinHeight: 2,
  scrollbarWidth: 1,
  scrollPaneHeight: 0,
  scrollItemCount: 0,

  selectedTask: 0,
  selectedMedia: 0,
  mediaExpanded: false,
  tasks: <Task[]> [],

  lastKey: <number | string> 0,

  lastPaintDuration: 0,
  lastPaneBuildDuration: 0,

  // Computed
  activeMedia: 0,

  // View reference
  [ViewUpdatesSymbol]: <ViewUpdates> null,
};

export const computedState: {
  [state: string]: (state: State) => any;
} = {
  activeMedia(state: State) {
    let active = 0;

    for (const task of state.tasks) {
      for (const media of task.list) {
        if (media.status === MediaStatus.ACTIVE) {
          active++;
        }
      }
    }

    return active;
  }
};

export function update(state: State, newState: PartialState) {
  const view = state[ViewUpdatesSymbol];
  view.updates.push(newState);
}

// Dummy class to expose the state structure to TypeScript type system
class StateStub {
  state = state;
}

export type State = StateStub["state"];
export type PartialState = {
  [K in keyof State]?: State[K];
}

export interface ViewUpdates {
  updates: PartialState[];
}
