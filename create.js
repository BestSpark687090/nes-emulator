var exitOnDone = false;
function everything() {
  const fs = require("fs");
  const readline = require("readline");
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
  console.log("Please select a rom.");
  process.stdin.on("keypress", (str, key) => {
    if (!inDialog) return;
    if (key && key.ctrl && key.name == "c") process.exit();
    if (key.name == "down") {
      selectionIndex = (selectionIndex + 1) % list.length;
    }
    if (key.name == "up") {
      selectionIndex = selectionIndex-- == 0 ? 0 : selectionIndex;
    }
    if (key.name == "return" || key.name == "space") {
      // do the things.
      finalStep();
    }
    input(list);
    // console.log(list.length)
  });
  //get roms from /nes/roms
  let roms = fs.readdirSync("nes/roms/", { withFileTypes: true });
  let urlList = fs.readdirSync("urls/", { withFileTypes: false });
  let romsList = roms.filter(function (v) {
    if (urlList.includes(v.name + ".html") && !remakeNew) {
      return false;
    }
    return !v.name.endsWith(".url");
    // dont include the .url files
  });
  list = romsList;
  input(list);
  // create function to do the selection
  function input(list = []) {
    for (let i = 0; i < list.length + 1; i++) {
      console.log("\x1b[" + i + "A");
      // console.log("\x1b[2K")
    }
    // console.clear()

    inDialog = true;
    let tempList = [];
    list.forEach(function (e) {
      tempList.push(e.name + "  ");
    });
    tempList[selectionIndex] = "> " + list[selectionIndex].name;
    console.log(tempList.join("\n"));
  }
  function finalStep() {
    // finally, we get the outTemplate.html and use it as a template for our rom maker
    // replace ${ROM} with the actual rom encoded into base64
    //also check file extension for core replacemnent
    let outTemplate = fs.readFileSync("./outTemplate.html").toString();
    let file = fs.readFileSync("nes/roms/" + list[selectionIndex].name, {
      encoding: "binary",
    });
    let out = outTemplate.replaceAll("${ROM}", btoa(file));
    let core = "";
    let ext = list[selectionIndex].name.slice(-3);
    if (ext == "nes") {
      core = "fceumm";
    } else if (ext == "gba") {
      core = "mgba";
    } else if (ext == "wad") {
      // throw new Error("atp i dont think doom wants it to work :/");
      core = "prboom";
      outTemplate = fs.readFileSync("./outTemplateCustom.html").toString();
      out = outTemplate.replaceAll("${ROM}", btoa(file));
      // Special handling because... it's a goober
      out = out.replaceAll(
        `resolveCoreWasm:e=>"data:application/octet-stream;base64,"+coreWasm,resolveCoreJs:e=>"data:application/octet-stream;base64,"+coreJs`,
        `resolveCoreWasm:e=>"https://cdn.jsdelivr.net/gh/arianrhodsandlot/retroarch-emscripten-build@v1.16.0/retroarch/prboom_libretro.wasm",resolveCoreJs:e=>"https://cdn.jsdelivr.net/gh/arianrhodsandlot/retroarch-emscripten-build@v1.16.0/retroarch/prboom_libretro.js"`,
      );
    } else if (ext == ".md") {
      core = "genesis_plus_gx";
    } else if (false) {
      //(ext == "zip") {
      // core = "mame2003_plus";
    } else if (ext == "smc" || ext == "sfc") {
      core = "snes9x";
    } else if (ext == "z64" || ext == "nds" || ext == "zip") {
      core = ext.replaceAll("z", "n");
      // also, replace outTemplate with the custom template
      outTemplate = fs.readFileSync("./outTemplateCustom.html").toString();
      out = outTemplate.replaceAll("${ROM}", btoa(file));
      out = out.replaceAll(
        "${WASM}",
        fs.readFileSync("nes/cores/" + core + ".wasm").toString("base64"),
      );
      out = out.replaceAll(
        "${JS}",
        fs.readFileSync("nes/cores/" + core + ".js").toString("base64"),
      );
      // out = out.replaceAll("${JS}",fs.readFileSync("nes/cores/n64wasm13.js").toString("base64"));
      // this should work???
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
    let fout = base64 ? "data:text/html;base64," + btoa(out) : out;
    fs.writeFileSync("urls/" + list[selectionIndex].name + fext, fout);
    if (exitOnDone) {
      process.exit(0);
    } else {
      // ev.pause()
      everything();
    }
    // add/remove "data:text/html;base64,"+btoa(out) to check output
  }
}
everything();
