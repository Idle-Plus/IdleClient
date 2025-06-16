import React from 'react';
import Sidebar from './Sidebar';
import { useWebsite } from "../context/WebsiteContext.tsx";
import useSmartRefWatcher from "@hooks/smartref/useSmartRefWatcher.ts";
import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from "@context/UserContext.tsx";
import Console from './console/Console';


const GameLayout: React.FC = () => {
	const user = useUser();
	const website = useWebsite();
	const sidebar = useSmartRefWatcher(website.sidebarRef);
	const mobile = useSmartRefWatcher(website.mobileRef);

	if (!user.isLoggedIn && !user.loading) {
		return <Navigate to="/login" />;
	}

	return (
		<div className="flex w-screen h-screen">
			{/* Sidebar */}
			<Sidebar />

			{/* Main Content */}
			<main
				className={`overflow-auto ${mobile ? 'w-full p-2' : 'flex-1 p-6'}`}
				style={mobile && sidebar ?
					{filter: "brightness(0.75) blur(1px)", transition: "filter 0.2s"} :
					{transition: "filter 0.2s"}}
			>
				<Outlet />
			</main>

			{/* Console Overlay */}
			<Console />
		</div>
	);
};

export default GameLayout;
