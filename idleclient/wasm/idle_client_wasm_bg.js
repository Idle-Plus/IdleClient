let wasm;
export function __wbg_set_wasm(val) {
    wasm = val;
}

/**
 * @param {number} value
 * @param {number} percentage
 * @returns {number}
 */
export function calc_percentage_float_float(value, percentage) {
    const ret = wasm.calc_percentage_float_float(value, percentage);
    return ret;
}

/**
 * @param {number} value
 * @param {number} percentage
 * @returns {number}
 */
export function calc_negative_percentage_float_float(value, percentage) {
    const ret = wasm.calc_negative_percentage_float_float(value, percentage);
    return ret;
}

/**
 * @param {number} value
 * @param {number} percentage
 * @returns {number}
 */
export function multiply_by_negative_percentage_int_float(value, percentage) {
    const ret = wasm.multiply_by_negative_percentage_int_float(value, percentage);
    return ret;
}

/**
 * @param {number} value
 * @param {number} percentage
 * @returns {number}
 */
export function multiply_by_negative_percentage_float_float(value, percentage) {
    const ret = wasm.multiply_by_negative_percentage_float_float(value, percentage);
    return ret;
}

/**
 * @param {number} value
 * @param {number} percentage
 * @returns {number}
 */
export function multiply_by_percentage_float_float(value, percentage) {
    const ret = wasm.multiply_by_percentage_float_float(value, percentage);
    return ret;
}

/**
 * @param {number} value
 * @param {number} percentage
 * @returns {number}
 */
export function multiply_by_percentage_int_float(value, percentage) {
    const ret = wasm.multiply_by_percentage_int_float(value, percentage);
    return ret;
}

/**
 * @param {number} value
 * @param {number} percentage
 * @returns {number}
 */
export function multiply_by_percentage_int_double(value, percentage) {
    const ret = wasm.multiply_by_percentage_int_double(value, percentage);
    return ret;
}

/**
 * @param {number} value
 * @param {number} percentage
 * @returns {number}
 */
export function multiply_by_percentage_double_double(value, percentage) {
    const ret = wasm.multiply_by_percentage_double_double(value, percentage);
    return ret;
}

/**
 * @param {number} value
 * @returns {number}
 */
export function safe_round_to_one_decimal(value) {
    const ret = wasm.safe_round_to_one_decimal(value);
    return ret;
}

/**
 * @param {number} value
 * @returns {number}
 */
export function bankers_round(value) {
    const ret = wasm.bankers_round(value);
    return ret;
}

