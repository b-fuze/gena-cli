import {state} from "./state";
import {UI} from "./ui";
import minimist from "minimist";
import WebSocket from "ws";

const ui = new UI(process.stdin, process.stdout);

// ui.start();
// ui.render(state);

const args = minimist(process.argv.slice(2));
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
} else {
  console.error("GENA.connectWS: Invalid IP address \"" + args.host + "\" for WebSockets");
  process.exit(1);
}

// Connect to ANV process
const socket = new WebSocket(addr);

socket.on("close", () => {
  console.log("Shutdown");
  process.exit();
});

process.stdin.on("data", (chunk: Buffer) => {
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
