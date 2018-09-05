const bench = require("@jamen/bench")();
const tc = require("turbocolor");
const testString = "Something, " + tc.bgGreen("hei," + tc.italic(" li")) + tc.italic("ke") + ": " + tc.bold("Hi " + tc.green("Mike") + tc.underline(" my " + tc.red("Boi")));
// const testString = tc.bold("M") + "orning. I'm out toni" + tc.bold("g") + "ht, okay? ";
// const testString = "Morning. I'm out tonight, okay? ";
const testString2 = "Morn" + tc.red("i") + "ng. I'm out tonight, okay? ";

const ansiSubstr = require("ansi-substring");
const sliceAnsi = require("slice-ansi");
const slice = require("term-utils").sliceAnsi;

const printRaw = false;
const reset = "\u001b[0m";

[
  [10, 20],
  [5, 12],
  [5, 22],
  [12, 25],
  [11, 15],
  [1, 16],
  [17, 29],
  [1, 50],
  [25, 32],
  [25],
  [0, 6],
  [10],
  [2, 6],
  [4, 5],
  [0, 20],
  [-10],
  [0, -10],
].forEach(([rangeStart, rangeEnd]) => {
  const string = testString;

  console.log("\n --- " + rangeStart + " • " + rangeEnd + "\n");
  process.stdout.write("ansi-substring: ");
  console.log(ansiSubstr(string, rangeStart, rangeEnd - rangeStart) + reset);
  printRaw && process.stdout.write("raw       :     ");
  printRaw && console.log(ansiSubstr(string, rangeStart, rangeEnd - rangeStart).replace(/\u001b/g, "\\u001b"));

  process.stdout.write("slice-ansi:     ");
  console.log(sliceAnsi(string, rangeStart, rangeEnd) + reset);
  printRaw && process.stdout.write("raw       :     ");
  printRaw && console.log(sliceAnsi(string, rangeStart, rangeEnd).replace(/\u001b/g, "\\u001b"));

  process.stdout.write("term-utils:     ");
  console.log(slice(string, rangeStart, rangeEnd) + reset);
  printRaw && process.stdout.write("raw       :     ");
  printRaw && console.log(slice(string, rangeStart, rangeEnd, false, false).replace(/\u001b/g, "\\u001b"));
});

[
  [10, 20],
  [5, 12],
  [11, 15],
  [1, 16],
  [17, 29],
  [1, 50],
  [25, 32],
  [25],
  [0, 6],
  [10],
  [2, 6],
  [4, 5],
  [2, 3],
  [0, 20],
  [-10],
  [0, -10],
].forEach(([rangeStart, rangeEnd]) => {
  const string = testString2;

  console.log("\n --- " + rangeStart + " • " + rangeEnd + "\n");
  process.stdout.write("ansi-substring: ");
  console.log(ansiSubstr(string, rangeStart, rangeEnd - rangeStart) + reset);
  printRaw && process.stdout.write("raw       :     ");
  printRaw && console.log(ansiSubstr(string, rangeStart, rangeEnd - rangeStart).replace(/\u001b/g, "\\u001b"));

  process.stdout.write("slice-ansi:     ");
  console.log(sliceAnsi(string, rangeStart, rangeEnd) + reset);
  printRaw && process.stdout.write("raw       :     ");
  printRaw && console.log(sliceAnsi(string, rangeStart, rangeEnd).replace(/\u001b/g, "\\u001b"));

  process.stdout.write("term-utils:     ");
  console.log(slice(string, rangeStart, rangeEnd) + reset);
  printRaw && process.stdout.write("raw       :     ");
  printRaw && console.log(slice(string, rangeStart, rangeEnd, false, false).replace(/\u001b/g, "\\u001b"));
});

// console.log("\nFULL STRING:    " + string);
// console.log("length: " + 31);

console.log("\nBENCHHHH\n");

// Bench
bench.add("ansi-substring", () => {
  [
    [10, 20],
    [5, 12],
    [11, 15],
    [1, 16],
    [17, 29],
    [1, 50],
    [25, 32],
    [25],
    [0, 6],
    [10],
    [2, 6],
    [4, 5],
    [0, 20],
  ].forEach(([rangeStart, rangeEnd]) => {
    const x = ansiSubstr(testString, rangeStart, rangeEnd - rangeStart);
  });
});

bench.add("slice-ansi", () => {
  [
    [10, 20],
    [5, 12],
    [11, 15],
    [1, 16],
    [17, 29],
    [1, 50],
    [25, 32],
    [25],
    [0, 6],
    [10],
    [2, 6],
    [4, 5],
    [0, 20],
  ].forEach(([rangeStart, rangeEnd]) => {
    const x = sliceAnsi(testString, rangeStart, rangeEnd);
  });
});

bench.add("term-utils", () => {
  [
    [10, 20],
    [5, 12],
    [11, 15],
    [1, 16],
    [17, 29],
    [1, 50],
    [25, 32],
    [25],
    [0, 6],
    [10],
    [2, 6],
    [4, 5],
    [0, 20],
  ].forEach(([rangeStart, rangeEnd]) => {
    const x = slice(testString, rangeStart, rangeEnd, false, false);
  });
});

bench.run();
