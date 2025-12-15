import React, { useEffect, useState } from "react";

export const Loader: React.FC<{
	title: string,
	animateDots?: boolean,
	className?: string,
	titleClass?: string,
	spinnerClass?: string,
}> = ({
	title,
	animateDots = false,
	className = "",
	titleClass = "",
	spinnerClass = "",
}) => {
	const [dots, setDots] = useState(0);

	useEffect(() => {
		if (!animateDots) return;

		let current = 0;
		const interval = setInterval(() => {
			current = (++current % 4);
			setDots(current);
		}, 500);

		return () => clearInterval(interval);
	}, [animateDots]);

	return (
		<div className={`flex flex-col items-center gap-2 text-white ${className}`}>
			<div>
				<div className={`fixed border-8 w-24 h-24 border-gray-600 rounded-full ${spinnerClass}`}/>
				<div className={`w-24 h-24 border-8 border-gray-100 border-b-transparent rounded-full animate-spin ${spinnerClass}`} />
			</div>
			<div className="flex flex-col items-center gap-0 h-fit">
				{ title && <div className={titleClass}>{ `${title}${dots > 0 ? ".".repeat(dots) : ""}` }</div> }
			</div>
		</div>
	);
}