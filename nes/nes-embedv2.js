// const rom = await showOpenFilePicker()
//     .then(([filehandle]) => filehandle.getFile())
// we get the name from the url and yeoink it
let romN = location.href.split("?rom=");
let coreN = location.href.split("&core=");
let isN64 = (coreN[1] ?? "").includes("n64");
let isDS = (coreN[1] ?? "").includes("ds");
// let rom;
// if (romN.length > 1) {
//   //nes_load_url("nes-canvas", "/example/" + romN[1]);
//   await fetch("/example/" + romN[1]).then((res) =>{
//     let rtext = res.text().then((str) => {
//       // something's happening to make the string longer than the normal amount..
//       rom = new File([str.slice(0,64934)],romN[1])
//       console.log(rom)
//     });
//     //rom = new File([rtext],romN[1]);
//   });
// }
// //rom = await fetch("/example/Tetris.nes");
let ran = false;
const { Nostalgist } = await import("https://esm.run/nostalgist");
// var nostalgia = await Nostalgist.nes(rom);
// console.log(nostalgia)
document.addEventListener("DOMContentLoaded", function () {});
let nostalgist = await Nostalgist.prepare({
  core: coreN[1] ?? "fceumm",
  rom:
    romN[0] +
    "roms/" +
    romN[1].split("&core=")[0].replaceAll(/\&core=.*/g, ""),
  retroarchConfig: {
    input_player1_a: "x",
    input_player1_b: "z",
    input_player1_y: "a",
    input_player1_x: "s",
    input_player1_start: "enter",
    input_player1_select: "rshift",
    input_player1_l: "q",
    input_player1_r: "w",
    input_player1_left: "left",
    input_player1_right: "right",
    input_player1_up: "up",
    input_player1_down: "down",
    input_player1_l_x_plus: "right",
    input_player1_l_x_minus: "left",
    input_player1_l_y_plus: "down",
    input_player1_l_y_minus: "up",
    input_player1_r_x_plus: "l", // the right stick is for the n64
    input_player1_r_x_minus: "j", // who uses right stick as the c buttons
    input_player1_r_y_plus: "k",
    input_player1_r_y_minus: "i",
    input_player1_l2: "shift", // I NEED TO INFINITE YAHOO!
    // Above: Input
    menu_driver: "ozone", // xmb, glui, rgui, ozone?
    // rgui is classic
    // glui is tablet one, press left and right on arrow keys to get to some places
    // xmb is the playstation
    // ozone is the wayy new one!
    //input_menu_toggle_gamepad_combo: 4 // press start and select
    video_driver: "gl", //"gl", "xvideo", "sdl", "d3d",
    menu_show_online_updater: true,
  },
  retroarchCoreConfig: {
    "prboom-mouse_on": "enabled",
    melonds_touch_mode: "Mouse",
  },
  resolveCoreJs(core) {
    if (isN64 || isDS) {
      return `https://ebcf0f0b-8d6c-492c-84b9-2219e2fec157-00-3f6flbl37ndig.janeway.replit.dev/cores/${core}.js`;
    }
    return `https://cdn.jsdelivr.net/gh/arianrhodsandlot/retroarch-emscripten-build@v1.16.0/retroarch/${core}_libretro.js`;
  },
  resolveCoreWasm(core) {
    if (isN64 || isDS) {
      return `https://ebcf0f0b-8d6c-492c-84b9-2219e2fec157-00-3f6flbl37ndig.janeway.replit.dev/cores/${core}.wasm`;
    }
    return `https://cdn.jsdelivr.net/gh/arianrhodsandlot/retroarch-emscripten-build@v1.16.0/retroarch/${core}_libretro.wasm`;
  },
});
let huh = document.addEventListener("click", async function () {
  if (!ran) {
    document.querySelector("#start").hidden = true;
    document.querySelector("h1#wait").hidden = false;
    document.querySelector("h3#wait").hidden = false;
    alert("Running!");
    console.log(
      "roms/" + romN[1].split("&core=")[0].replaceAll(/\&core=.*/g, ""),
      isN64,
    );
    nostalgist.start();

    ran = true;
    console.log("worked?");
  }
});
