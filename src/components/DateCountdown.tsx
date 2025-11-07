import React, { useEffect, useState } from "react";

export const DateCountdown: React.FC<{ date: Date, nowText?: string }> = ({ date, nowText = "now" }) => {
	const [time, setTime] = useState<string>(() => {
		const now = new Date();
		return formatTimeRemaining(date, now, nowText);
	})

	useEffect(() => {
		const timer = setInterval(() => {
			const now = new Date();
			setTime(formatTimeRemaining(date, now, nowText));
		}, 1000);

		return () => clearInterval(timer);
	}, [date, nowText]);


	function formatTimeRemaining(date: Date, now: Date, nowText: string): string {
		const diff = date.getTime() - now.getTime();

		if (diff < 0) return nowText;

		const hours = Math.floor(diff / (1000 * 60 * 60));
		const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
		const seconds = Math.floor((diff % (1000 * 60)) / 1000);

		return `${hours.toString().padStart(2, "0")}:${
			minutes.toString().padStart(2, "0")}:${
			seconds.toString().padStart(2, "0")}`;
	}

	return <span>{time}</span>
}