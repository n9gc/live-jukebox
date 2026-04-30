/* @ts-self-types="./test_wasm.d.ts" */
import * as wasm from "./test_wasm_bg.wasm";
import { __wbg_set_wasm } from "./test_wasm_bg.js";

__wbg_set_wasm(wasm);
wasm.__wbindgen_start();
export {
    fibonacci
} from "./test_wasm_bg.js";
