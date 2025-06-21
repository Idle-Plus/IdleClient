export class DeferredPromise<T> {

	private _resolve!: (value: T) => void;
	private _reject!: (reason: any) => void;
	private readonly _promise: Promise<T>;

	constructor() {
		this._promise = new Promise((resolve, reject) => {
			this._resolve = resolve;
			this._reject = reject;
		});
	}

	getPromise(): Promise<T> {
		return this._promise;
	}

	resolve(value: T) {
		this._resolve(value);
	}

	reject(reason: any) {
		this._reject(reason);
	}
}