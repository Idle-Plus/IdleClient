import * as wasm from "./idle_client_wasm_bg.wasm";
export * from "./idle_client_wasm_bg.js";
import { __wbg_set_wasm } from "./idle_client_wasm_bg.js";
__wbg_set_wasm(wasm);