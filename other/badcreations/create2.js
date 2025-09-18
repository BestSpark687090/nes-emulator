const fs = require("fs");
const readline = require("readline");
const { createGzip } = require('zlib');
const { promisify } = require('util');
const { Readable } = require('stream');

// Promisify the pipeline for easier async/await usage
// Note: This isn't used directly in the final version but is a useful utility.
// For our use case, `zlib` convenience functions are simpler.
const gzipAsync = promisify(createGzip);

var exitOnDone = false;
async function everything() {
  let inDialog = false;
  let selectionIndex = 0;
  let list = [];
  let base64 = false; // SET TO TRUE TO MAKE URL
  let remakeNew = true;
  // false, we dont remake
  // true, we do

  readline.emitKeypressEvents(process.stdin);
  console.clear();
  if (process.stdin.setRawMode != null) {
    process.stdin.setRawMode(true);
  }

  const handleKeyPress = (str, key) => {
    if (!inDialog) return;
    if (key && key.ctrl && key.name === "c") process.exit();
    if (key.name === "down") {
      selectionIndex = (selectionIndex + 1) % list.length;
    }
    if (key.name === "up") {
      selectionIndex = selectionIndex === 0 ? 0 : selectionIndex - 1;
    }
    if (key.name === "return" || key.name === "space") {
      process.stdin.removeListener("keypress", handleKeyPress);
      finalStep();
      return;
    }
    input(list);
  };

  process.stdin.on("keypress", handleKeyPress);

  // Get roms from /nes/roms
  let roms = fs.readdirSync("nes/roms/", { withFileTypes: true });
  let urlList = fs.readdirSync("urls/", { withFileTypes: false });
  let romsList = roms.filter(function (v) {
    if (urlList.includes(v.name + ".html") && !remakeNew) {
      return false;
    }
    return !v.name.endsWith(".url");
  });
  list = romsList;
  input(list);

  // Create function to do the selection
  function input(list = []) {
    console.clear();
    inDialog = true;
    let tempList = [];
    list.forEach(function (e) {
      tempList.push("  " + e.name);
    });
    tempList[selectionIndex] = "> " + list[selectionIndex].name;
    console.log(tempList.join("\n"));
    console.log("\nUse arrow keys to navigate, Enter or Space to select.");
  }

  async function finalStep() {
    try {
      // Finally, we get the outTemplate.html and use it as a template for our rom maker
      let romFilePath = "nes/roms/" + list[selectionIndex].name;
      let fileBuffer = fs.readFileSync(romFilePath);

      // Compress the ROM data
      const compressedBuffer = await new Promise((resolve, reject) => {
        const chunks = [];
        const gzip = createGzip();
        gzip.on('data', chunk => chunks.push(chunk));
        gzip.on('end', () => resolve(Buffer.concat(chunks)));
        gzip.on('error', reject);
        gzip.end(fileBuffer);
      });
      let base64Rom = compressedBuffer.toString('base64');

      let outTemplate = fs.readFileSync("./outTemplate2.html").toString();
      let out = outTemplate.replaceAll("${ROM}", base64Rom);
      let core = "";
      let ext = list[selectionIndex].name.slice(-3);

      if (ext === "nes") {
        core = "fceumm";
      } else if (ext === "gba") {
        core = "mgba";
      } else if (ext === "wad") {
        core = "prboom";
        outTemplate = fs.readFileSync("./outTemplateCustom.html").toString();
        // Special handling for wad core
        out = outTemplate.replaceAll("${ROM}", base64Rom);
        out = out.replaceAll(
          `resolveCoreWasm:e=>"data:application/octet-stream;base64,"+coreWasm,resolveCoreJs:e=>"data:application/octet-stream;base64,"+coreJs`,
          `resolveCoreWasm:e=>"https://cdn.jsdelivr.net/gh/arianrhodsandlot/retroarch-emscripten-build@v1.16.0/retroarch/prboom_libretro.wasm",resolveCoreJs:e=>"https://cdn.jsdelivr.net/gh/arianrhodsandlot/retroarch-emscripten-build@v1.16.0/retroarch/prboom_libretro.js"`,
        );
      } else if (ext === ".md") {
        core = "genesis_plus_gx";
      } else if (ext === "smc" || ext === "sfc") {
        core = "snes9x";
      } else if (ext === "z64" || ext === "nds" || ext === "zip") {
        core = ext.replaceAll("z", "n");
        // Also, replace outTemplate with the custom template
        outTemplate = fs.readFileSync("./outTemplateCustom.html").toString();
        out = outTemplate.replaceAll("${ROM}", base64Rom);

        // --- Core WASM compression ---
        let wasmFileBuffer = fs.readFileSync("nes/cores/" + core + ".wasm");
        const compressedWasm = await new Promise((resolve, reject) => {
          const chunks = [];
          const gzip = createGzip();
          gzip.on('data', chunk => chunks.push(chunk));
          gzip.on('end', () => resolve(Buffer.concat(chunks)));
          gzip.on('error', reject);
          gzip.end(wasmFileBuffer);
        });
        out = out.replaceAll("${WASM}", compressedWasm.toString('base64'));

        // --- Core JS compression ---
        let jsFileBuffer = fs.readFileSync("nes/cores/" + core + ".js");
        const compressedJs = await new Promise((resolve, reject) => {
          const chunks = [];
          const gzip = createGzip();
          gzip.on('data', chunk => chunks.push(chunk));
          gzip.on('end', () => resolve(Buffer.concat(chunks)));
          gzip.on('error', reject);
          gzip.end(jsFileBuffer);
        });
        out = out.replaceAll("${JS}", compressedJs.toString('base64'));

      } else {
        throw new Error(
          "The file " +
          list[selectionIndex].name +
          " is currently not supported. Please try again later.",
        );
      }

      out = out.replaceAll("${CORE}", core);
      out = out.replaceAll("${EXT}", list[selectionIndex].name.slice(-3));

      let fext = base64 ? ".url" : ".html";
      let fout = base64 ? "data:text/html;base64," + Buffer.from(out).toString('base64') : out;

      fs.writeFileSync("urls/" + list[selectionIndex].name + fext, fout);

      console.log(`\nFile created: urls/${list[selectionIndex].name}${fext}`);

      if (exitOnDone) {
        process.exit(0);
      } else {
        everything();
      }
    } catch (error) {
      console.error("An error occurred during finalStep:", error);
      process.exit(1);
    }
  }
}

everything();
