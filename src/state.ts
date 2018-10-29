// Full state of GENA
import {Task, MediaStatus} from "./anv";
import {deepCopy} from "./utils";
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
export const OldStateSymbol = Symbol();
export const state = {
  start: true,
  connection: <ConnectionType> "ws",
  host: "0.0.0.0",
  port: 7676,

  // UI state
  view: <FocusedView> "tasklist",
  header: <HeaderState> "main",
  footer: <FooterState> "listtips",
  isDebug: false,

  confirmText: "Are you sure?",
  inputText: "",
  inputTextScroll: 0,
  inputTextCursor: 0,

  scroll: 0,
  scrollCursor: 0,
  scrollbarMinHeight: 2,
  scrollbarWidth: 1,
  scrollPaneHeight: 0,
  scrollMax: 0,
  scrollItemCount: 0,

  selectedTask: 0,
  selectedMedia: 0,
  mediaExpanded: false,
  tasks: <Task[]> [],

  showNotification: false,

  lastKey: <number | string> 0,

  // Meta state
  lastPaintDuration: 0,
  lastPaneBuildDuration: 0,
  lastPaneDiffDuration: 0,

  samePanes: 0,
  diffPanes: 0,

  // Computed
  activeMedia: 0,

  // View meta
  viewCols: 0,
  viewRows: 0,

  // View reference
  [ViewUpdatesSymbol]: <ViewUpdates> null,
  [OldStateSymbol]: <any> null,
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
  },

  scroll(state: State) {
    const min = Math.min(state.scrollCursor - state.scrollPaneHeight + 1, Math.max(state.scrollItemCount - state.scrollPaneHeight, 0));
    const max = Math.max(state.scrollCursor - 1, 0);

    if (state.scroll < min) {
      return min;
    } else if (state.scroll > max) {
      return max;
    } else {
      return state.scroll;
    }
  },

  scrollCursor(state: State) {
    return Math.min(state.scrollCursor, Math.max(state.scrollItemCount - 1, 0));
  }
};

// =========== State Util Functions ===========

export function setOldState(state: State) {
  state[OldStateSymbol] = deepCopy(state);
}

export function getOldState(state: State) {
  return <State> state[OldStateSymbol];
}

export function update(state: State, newState: PartialState) {
  const view = state[ViewUpdatesSymbol] || (state[ViewUpdatesSymbol] = {updates: []});
  view.updates.push(newState);
}

export function applyUpdates(state: State) {
  const view = state[ViewUpdatesSymbol];

  if (view && view.updates.length) {
    for (const update of view.updates) {
      Object.assign(state, update);
    }

    view.updates = [];
    return true;
  } else {
    return false;
  }
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
