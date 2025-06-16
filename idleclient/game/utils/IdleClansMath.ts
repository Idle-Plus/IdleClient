import type * as WasmModule from '@idleclient/wasm/idle_client_wasm';
import wasmInit from '@idleclient/wasm/idle_client_wasm_bg.wasm?init';

export class IdleClansMath {
	private static wasmModule: typeof WasmModule | null = null;

	public static async load(): Promise<void> {
		try {
			const instance = await wasmInit();
			IdleClansMath.wasmModule = instance.exports as typeof WasmModule;
		} catch (error) {
			console.error("Failed to load WASM module:", error);
			throw error;
		}
	}

	public static get(): typeof WasmModule {
		if (!IdleClansMath.wasmModule) throw new Error("WASM module not loaded");
		return IdleClansMath.wasmModule;
	}
}
