"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Full state of GENA
const anv_1 = require("./anv");
const utils_1 = require("./utils");
var FocusedView;
(function (FocusedView) {
    FocusedView["TASKLIST"] = "tasklist";
    FocusedView["TASKDETAILS"] = "taskdetails";
})(FocusedView = exports.FocusedView || (exports.FocusedView = {}));
;
var FooterState;
(function (FooterState) {
    FooterState["LISTTIPS"] = "listtips";
    FooterState["DETAILSTIPS"] = "detailstips";
    FooterState["NEWTASKTIPS"] = "newtasktips";
})(FooterState = exports.FooterState || (exports.FooterState = {}));
;
var HeaderState;
(function (HeaderState) {
    HeaderState["MAIN"] = "main";
})(HeaderState = exports.HeaderState || (exports.HeaderState = {}));
;
exports.ViewUpdatesSymbol = Symbol();
exports.OldStateSymbol = Symbol();
exports.state = {
    start: true,
    connection: "ws",
    host: "0.0.0.0",
    port: 7676,
    // UI state
    view: "tasklist",
    header: "main",
    footer: "listtips",
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
    tasks: [],
    showNotification: false,
    lastKey: 0,
    // Meta state
    lastPaintDuration: 0,
    lastPaneBuildDuration: 0,
    lastPaneDiffDuration: 0,
    samePanes: 0,
    diffPanes: 0,
    // Computed
    activeMedia: 0,
    // View reference
    [exports.ViewUpdatesSymbol]: null,
    [exports.OldStateSymbol]: null,
};
exports.computedState = {
    activeMedia(state) {
        let active = 0;
        for (const task of state.tasks) {
            for (const media of task.list) {
                if (media.status === anv_1.MediaStatus.ACTIVE) {
                    active++;
                }
            }
        }
        return active;
    }
};
function setOldState(state) {
    state[exports.OldStateSymbol] = utils_1.deepCopy(state);
}
exports.setOldState = setOldState;
function getOldState(state) {
    return state[exports.OldStateSymbol];
}
exports.getOldState = getOldState;
function update(state, newState) {
    const view = state[exports.ViewUpdatesSymbol];
    view.updates.push(newState);
}
exports.update = update;
// Dummy class to expose the state structure to TypeScript type system
class StateStub {
    constructor() {
        this.state = exports.state;
    }
}
