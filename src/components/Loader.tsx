import React from "react";

export const Loader: React.FC<{
	title: string,
	animateDots?: boolean,
	className?: string,
	titleClass?: string,
}> = ({
	title,
	animateDots = false,
	className = "",
	titleClass = "",
}) => {

	return (
		<div className={`flex flex-col items-center gap-2 text-white ${className}`}>
			<div>
				<div className="fixed border-8 w-24 h-24 border-gray-600 rounded-full"/>
				<div className="w-24 h-24 border-8 border-gray-100 border-b-transparent rounded-full animate-spin" />
			</div>
			<div className="flex flex-col items-center gap-0 h-fit">
				{ title && <div className={titleClass}>{ title }</div> }
			</div>
		</div>
	);
}