import React from "react";
import { IoMdMenu } from "react-icons/io";
import { IdleButton } from "@components/input/IdleButton.tsx";
import { IoChatbubbleEllipses } from "react-icons/io5";

const Topbar: React.FC<{ setSidebar: () => void, sidebar: boolean }> = ({ setSidebar, sidebar }) => {
	return (
		<div
			className={`z-2000 fixed top-0 left-0 w-full h-16 xl:w-[calc(100%-16rem)] xl:left-64 
			flex px-2 lg:px-4 bg-ic-dark-600 transition-all duration-300`}
		>
			<div className="max-w-7xl w-full flex justify-between xl:justify-end items-center mx-auto">
				<div className="xl:hidden transition-colors text-white/75 hover:text-white/95 text-4xl">
					<IoMdMenu onClick={setSidebar} className="cursor-pointer" />
				</div>

				<div className="flex items-center gap-4">
					<IdleButton className="sm:w-28 flex justify-center items-center gap-1">
						<span className="text-2xl"><IoChatbubbleEllipses /></span>
						<span className="hidden sm:block"> Chat</span>
					</IdleButton>
				</div>
			</div>

		</div>
	);
}

export default Topbar;