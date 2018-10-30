"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ui_1 = require("./ui");
const minimist_1 = __importDefault(require("minimist"));
const ws_1 = __importDefault(require("ws"));
const ui = new ui_1.UI(process.stdin, process.stdout);
// ui.start();
// ui.render(state);
const args = minimist_1.default(process.argv.slice(2));
let host = "127.0.0.1";
let port = 41456;
const validHost = /^\d+\.\d+\.\d+\.\d+$/;
const validPort = /^\d+$/;
if (args.host) {
    host = validHost.test(args.host) ? args.host : null;
}
if (args.port && validPort.test(args.port)) {
    port = +args.port;
}
const addr = "ws://" + host + ":" + port + "/ANV-V1";
if (host) {
    console.log("GENA connected to ANV on " + addr);
}
else {
    console.error("GENA.connectWS: Invalid IP address \"" + args.host + "\" for WebSockets");
    process.exit(1);
}
// Connect to ANV process
const socket = new ws_1.default(addr);
socket.on("close", () => {
    console.log("Shutdown");
    process.exit();
});
process.stdin.on("data", (chunk) => {
    const input = chunk.toString();
    const code = input.charCodeAt(0);
    // ui.update(state, code, input);
    // ui.render(state);
    socket.send(JSON.stringify({
        data: "lole",
        input,
    }));
    if (code === 3) {
        // ui.stop();
        console.log("Bye");
        process.exit();
    }
    // console.log("KEY: '" + input + "' - " + input.charCodeAt(0));
});
process.stdout.on("resize", () => {
    // ui.render(state);
});
