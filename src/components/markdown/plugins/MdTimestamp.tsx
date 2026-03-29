// WIP

type ParsedTimestamp = {
	milliseconds: number;
	offset: number;
	flags?: string[];
};

const TIMEZONE_OFFSETS: Record<string, number> = {
	// Universal
	UTC: 0, GMT: 0,
	// Western Europe
	WET: 0,
	WEST: 1 * 3600 * 1000,
	CET: 1 * 3600 * 1000,
	CEST: 2 * 3600 * 1000,
	EET: 2 * 3600 * 1000,
	EEST: 3 * 3600 * 1000,
	BST: 1 * 3600 * 1000,
	// US Eastern
	EST: -5 * 3600 * 1000,
	EDT: -4 * 3600 * 1000,
	// US Central
	CST: -6 * 3600 * 1000,
	CDT: -5 * 3600 * 1000,
	// US Mountain
	MST: -7 * 3600 * 1000,
	MDT: -6 * 3600 * 1000,
	// US Pacific
	PST: -8 * 3600 * 1000,
	PDT: -7 * 3600 * 1000,
	// Alaska
	AKST: -9 * 3600 * 1000,
	AKDT: -8 * 3600 * 1000,
	// Hawaii
	HST: -10 * 3600 * 1000,
};

const WEEKDAYS: Record<string, number> = {
	SUN: 0,
	MON: 1,
	TUE: 2,
	WED: 3,
	THU: 4,
	FRI: 5,
	SAT: 6,
};

export function parseTimestamp(time: string): ParsedTimestamp | string {
	const regex = /^<!(t[a-z]*)\s+(.+?)\s*>$/i;
	const match = time.match(regex);
	if (!match) return "invalid timestamp format";

	const rawFlags = match[1].substring(1).toLowerCase();
	const flags = rawFlags.length
		? Array.from(new Set(rawFlags.split(""))).sort() // dedupe + sort
		: undefined;
	const hasX = rawFlags.includes('x');
	const timestampStr = match[2].trim();

	// Full date format: DD/MM/YY [HH:MM] [TZ] — time and TZ optional
	const dateTimeRegex = /^(\d{2})\/(\d{2})\/(\d{2})(?:\s+(\d{2}):?(\d{2}))?(?:\s+([A-Z]{3,5}))?$/i;
	const dateMatch = timestampStr.match(dateTimeRegex);
	if (dateMatch) {
		const day = parseInt(dateMatch[1], 10);
		const month = parseInt(dateMatch[2], 10) - 1;
		const year = 2000 + parseInt(dateMatch[3], 10);
		const hours = parseInt(dateMatch[4] || "0", 10);
		const minutes = parseInt(dateMatch[5] || "0", 10);
		const tz = (dateMatch[6] || "UTC").toUpperCase();

		if (day < 1 || day > 31) return "invalid date format, day must be between 1 and 31";
		if (month < 0 || month > 11) return "invalid date format, month must be between 1 and 12";

		const offset = TIMEZONE_OFFSETS[tz];
		if (offset === undefined) return "unsupported timezone";

		// Create tz timestamp from year/month/day/hour/min
		const tzFromParts = Date.UTC(year, month, day, hours, minutes);
		const utcMs = tzFromParts - offset; // Convert the timestamp to UTC by subtracting the offset.

		return { milliseconds: utcMs, offset: offset, ...(flags ? { flags } : {}) };
	}

	// Relative weekday format (X flag REQUIRED)
	const relativeDayRegex = /^(SUN|MON|TUE|WED|THU|FRI|SAT)\s+(\d{2})(?::?(\d{2}))?(?:\s+([A-Z]{3,5}))?$/i;
	const relativeDayMatch = timestampStr.match(relativeDayRegex);
	if (relativeDayMatch) {
		if (!hasX) return "relative weekday format requires 'x' flag";

		const weekdayStr = relativeDayMatch[1].toUpperCase();
		const hours = parseInt(relativeDayMatch[2], 10);
		const minutes = parseInt(relativeDayMatch[3] || "0", 10);
		const tz = (relativeDayMatch[4] || "UTC").toUpperCase();

		const offset = TIMEZONE_OFFSETS[tz];
		if (offset === undefined) return "unsupported timezone";

		const targetWeekday = WEEKDAYS[weekdayStr];
		const today = new Date();
		const todayWeekday = today.getUTCDay();

		const deltaDays = (targetWeekday - todayWeekday + 7) % 7;
		//if (deltaDays === 0) deltaDays = 7; // Always next occurrence

		const base = hours * 3600000 + minutes * 60000;
		const todayUTC = getTodayUTC();

		let target =
			todayUTC +
			deltaDays * 24 * 3600000 +
			(base - offset);

		if (target <= Date.now()) target += 7 * 24 * 3600000;

		return { milliseconds: target, offset: offset, ...(flags ? { flags } : {}) };
	}

	// Time-only format: HH:MM or HHMM [TZ]
	const timeRegex = /^(\d{2})(?::?(\d{2}))?(?:\s+([A-Z]{3,5}))?$/i;
	const timeMatch = timestampStr.match(timeRegex);
	if (!timeMatch) return "invalid time format";

	const hours = parseInt(timeMatch[1], 10);
	const minutes = parseInt(timeMatch[2] || "0", 10);
	const tz = (timeMatch[3] || "UTC").toUpperCase();

	const offset = TIMEZONE_OFFSETS[tz];
	if (offset === undefined) return "unsupported timezone";

	if (hasX) {

		const nowUtc = Date.now(); // The current time in UTC.

		const targetDateUtz = new Date(nowUtc + offset); // The target date + time in tz.
		targetDateUtz.setUTCHours(hours, minutes, 0, 0); // ^

		let targetTz = targetDateUtz.getTime(); // The target ms in tz.
		if (targetTz <= nowUtc + offset) // Check if time in tz is less than (now utc + offset)
			targetTz += 24 * 60 * 60 * 1000;

		return {
			milliseconds: targetTz - offset, // Return the target in ms - offset.
			offset: offset,
			...(flags ? { flags } : {})
		};
	}

	// We're not doing relative next time, so just get the time and offset it.

	// The base time in the given timezone.
	const base = hours * 3600000 + minutes * 60000;
	const target = base - offset; // Convert the base time to UTC by subtracting the offset.

	return { milliseconds: target, offset: offset, ...(flags ? { flags } : {}) };

	// Helpers

	function getTodayUTC() {
		const now = Date.now();
		const todayMidnightUtc = new Date(now);
		todayMidnightUtc.setUTCHours(0, 0, 0, 0);
		return todayMidnightUtc.getTime();
	}
}