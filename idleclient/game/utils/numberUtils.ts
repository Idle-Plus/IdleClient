export function toFixedNoRound(num: number, fixed: number) {
	const factor = Math.pow(10, fixed);
	const truncated = Math.trunc(num * factor) / factor;
	return truncated.toFixed(fixed);
}

export function toFixedNoRoundLocale(num: number, fixed: number, locale?: string) {
	const factor = Math.pow(10, fixed);
	const truncated = Math.trunc(num * factor) / factor;

	return truncated.toLocaleString(locale, {
		minimumFractionDigits: fixed,
		maximumFractionDigits: fixed
	});
}

export function toFixedNoRoundTrim(num: number, fixed: number) {
	const factor = Math.pow(10, fixed);
	const truncated = Math.trunc(num * factor) / factor;

	const str = truncated.toString();
	if (!str.includes('.')) return str;

	return str.replace(/\.?0+$/, '');
}


export function toFixedNoRoundTrimLocale(num: number, fixed: number, locale?: string) {
	const factor = Math.pow(10, fixed);
	const truncated = Math.trunc(num * factor) / factor;

	const parts = truncated.toString().split('.');
	const decimalPlaces = parts[1]?.length || 0;

	return truncated.toLocaleString(locale, {
		minimumFractionDigits: decimalPlaces,
		maximumFractionDigits: decimalPlaces
	});
}

export function toKMB(num: number) {
	return num >= 1_000_000_000 ? `${toFixedNoRoundTrim(num / 1_000_000_000, 1)}B` :
		num >= 1_000_000 ? `${toFixedNoRoundTrim(num / 1_000_000, 1)}M` :
			num >= 10_000 ? `${toFixedNoRoundTrim((num / 1_000), 1)}K` : num.toString();
}