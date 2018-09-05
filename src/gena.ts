import {state} from "./state";
import {UI} from "./ui";

const ui = new UI(process.stdin, process.stdout);

ui.start();
ui.render(state);

process.stdin.on("data", (chunk: Buffer) => {
  const input = chunk.toString();
  const code = input.charCodeAt(0);

  ui.update(state, code, input);
  ui.render(state);

  if (code === 3) {
    ui.stop();
    console.log("Bye");
    process.exit();
  }

  // console.log("KEY: '" + input + "' - " + input.charCodeAt(0));
});

process.stdout.on("resize", () => {
  ui.render(state);
});

// // Sometime later
// ui.stop();
