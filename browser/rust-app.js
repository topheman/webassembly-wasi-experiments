import 'regenerator-runtime/runtime'; // specific parcel (missing for async/await)

function convertUint8ArrayToString(uint8array) {
  return new TextDecoder('utf-8').decode(uint8array);
}

// based on https://github.com/wasmerio/wasmer-js/tree/master/packages/wasi#quick-start
import { WASI } from '@wasmer/wasi';
import wasiBindings from '@wasmer/wasi/lib/bindings/browser';
import { lowerI64Imports } from '@wasmer/wasm-transformer';

import { WasmFs } from '@wasmer/wasmfs';

// Instantiate a new WASI Instance
const wasmFs = new WasmFs();
window.wasmFs = wasmFs; // expose wasmFs instance to debug
let wasi = new WASI({
  // first arg is the name of the command called
  args: [
    './rust-app.wasm',
    new Date().toGMTString(),
    'Running with wasmer on the Browser (emulating File System)',
  ],
  env: {},
  bindings: {
    ...wasiBindings,
    fs: wasmFs.fs,
  },
  // same as the node example, map a fake FileSystem
  preopens: {
    '.': '.',
  },
});

const startWasiTask = async () => {
  // Fetch our Wasm File
  const response = await fetch('./rust-app.wasm');
  const responseArrayBuffer = await response.arrayBuffer();

  // Instantiate the WebAssembly file
  const wasm_bytes = new Uint8Array(responseArrayBuffer).buffer;
  const lowered_wasm = await lowerI64Imports(wasm_bytes);
  let module = await WebAssembly.compile(lowered_wasm);
  let instance = await WebAssembly.instantiate(module, {
    ...wasi.getImports(module),
  });

  // Start the WebAssembly WASI instance!
  wasi.start(instance);

  // Output what's inside of /dev/stdout!
  const stdout = await wasmFs.getStdOut();
  console.log(stdout);
};
startWasiTask()
  .then((...rest) => {
    console.log('Generated tmp.txt file on the location ./ 👇');
    console.log(convertUint8ArrayToString(wasmFs.fs.readFileSync('tmp.txt')));
  })
  .catch((e) => {
    console.error('failure', e);
  });
