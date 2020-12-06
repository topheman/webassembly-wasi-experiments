'use strict';
const path = require('path');
const fs = require('fs');
const { WASI } = require('wasi');
const wasi = new WASI({
  args: process.argv,
  env: process.env,
  preopens: {
    // key = folders internal to the sandbox / value = real path on host machine
    './': `${path.resolve(__dirname)}`, // rust-write-file.wasm creates a file relaatif to the current directory
  },
});
const importObject = { wasi_snapshot_preview1: wasi.wasiImport };

(async () => {
  const wasm = await WebAssembly.compile(
    fs.readFileSync(path.resolve(__dirname, './rust-write-file.wasm')),
  );
  const instance = await WebAssembly.instantiate(wasm, importObject);

  wasi.start(instance);
})();
