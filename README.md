# nes-emulator

An NES emulator pre-packaged with HTML files.

This took me ***FOREVER*** to actually get working, with Git not wanting to cooperate at all :/

Now, you can experience it! 

Have fun!

-BestSpark687090

## How to use:

It depends on which way you want to use it, at times.

### As a web server?

Simple. Just run the `index.js` file in the root, and it'll be handled.

To add rom files, just add them to the `nes/roms` folder, as long as it's supported.

Supported file extension list (other than .nes) is inside the `listall.html` file in the root.

### To make game files?

A little more complicated, but still easy!

Add your rom file inside the `nes/roms` folder (As long as its supported, supported types are inside the `create.js` file because im too lazy to type it here)

Then run `node create.js` and use the interactive prompt to select which game.

The result will appear inside the `urls` folder.

Enjoy!