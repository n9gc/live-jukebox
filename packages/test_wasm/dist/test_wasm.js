/* @ts-self-types="./test_wasm.d.ts" */

/**
 * ## 斐波那契数列
 * @param {number} n
 * @returns {number}
 */
function fibonacci(n) {
    const ret = wasm.fibonacci(n);
    return ret >>> 0;
}
exports.fibonacci = fibonacci;
function __wbg_get_imports() {
    const import0 = {
        __proto__: null,
        __wbindgen_init_externref_table: function() {
            const table = wasm.__wbindgen_externrefs;
            const offset = table.grow(4);
            table.set(0, undefined);
            table.set(offset + 0, undefined);
            table.set(offset + 1, null);
            table.set(offset + 2, true);
            table.set(offset + 3, false);
        },
    };
    return {
        __proto__: null,
        "./test_wasm_bg.js": import0,
    };
}

const wasmPath = `${__dirname}/test_wasm_bg.wasm`;
const wasmBytes = require('fs').readFileSync(wasmPath);
const wasmModule = new WebAssembly.Module(wasmBytes);
let wasm = new WebAssembly.Instance(wasmModule, __wbg_get_imports()).exports;
wasm.__wbindgen_start();
