import { FiHome, FiSettings, FiUsers, FiMenu, FiChevronsLeft } from 'react-icons/fi';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useWebsite } from '../context/WebsiteContext';
import { FaUser } from "react-icons/fa";
import { RiLoginBoxLine, RiLogoutBoxLine } from "react-icons/ri";
import { FaShieldHalved, FaShop } from "react-icons/fa6";
import useSmartRefWatcher from "@hooks/smartref/useSmartRefWatcher.ts";
import { IoFishOutline } from "react-icons/io5";
import { GiHatchet, GiMineWagon } from "react-icons/gi";
import { PiHandshake } from "react-icons/pi";
import { useUser } from "@context/UserContext.tsx";
import React, { JSX } from "react";
import { SpriteIcon } from "@components/icon";
import logo from "../assets/IdleClansLogo.svg";

const Icons = {
	home: <FiHome />,
	users: <FiUsers />,
	settings: <FiSettings />,
	user: <FaUser />,
	logout: <RiLogoutBoxLine />,
	login: <RiLoginBoxLine />,
	clan: <FaShieldHalved />,
	shop: <FaShop />,
	handshake: <PiHandshake />,
	woodcutting: <GiHatchet />,
	fishing: <IoFishOutline />,
	mining: <GiMineWagon />
};

const iconSize = 26;
const navItems: (SidebarItemProps | string | (SidebarItemProps | string)[])[] = [
	{ icon: <SpriteIcon icon={"home_page_32"} size={iconSize} />, title: 'Profile', href: '/game/profile' },
	{ icon: <SpriteIcon icon={"inventory_32"} size={iconSize} />, title: 'Inventory', href: '/game/inventory' },
	"Community",
	{ icon: <SpriteIcon icon={"clan_32"} size={iconSize} />, title: 'Clans', href: '/game/clan', disabled: true },
	{ icon: <SpriteIcon icon={"local_market_32"} size={iconSize} />, title: 'Local Market', href: '/game/local-market', disabled: true },
	{ icon: <SpriteIcon icon={"auction_house_32"} size={iconSize} />, title: 'Player Market', href: '/game/player-market', disabled: true },
	"Activities",
	[
		/*{ icon: <SpriteIcon icon={"skill_exterminating_32"} size={iconSize} />, title: 'Exterminating', href: '/game/skill/exterminating' },*/
		{ icon: <SpriteIcon icon={"skill_crafting_32"} size={iconSize} />, title: 'Crafting', href: '/game/skill/crafting' },
		/*{ icon: <SpriteIcon icon={"skill_plundering_32"} size={iconSize} />, title: 'Plundering', href: '/game/skill/plundering' },*/
		{ icon: <SpriteIcon icon={"skill_woodcutting_32"} size={iconSize} />, title: 'Woodcutting', href: '/game/skill/woodcutting' },
		{ icon: <SpriteIcon icon={"skill_fishing_32"} size={iconSize} />, title: 'Fishing', href: '/game/skill/fishing' },
		{ icon: <SpriteIcon icon={"skill_mining_32"} size={iconSize} />, title: 'Mining', href: '/game/skill/mining' },
		{ icon: <SpriteIcon icon={"skill_smithing_32"} size={iconSize} />, title: 'Smithing', href: '/game/skill/smithing' },
		{ icon: <SpriteIcon icon={"skill_cooking_32"} size={iconSize} />, title: 'Cooking', href: '/game/skill/cooking' },
		/*{ icon: <SpriteIcon icon={"skill_enchanting_32"} size={iconSize} />, title: 'Enchanting', href: '/game/skill/enchanting' },*/
		{ icon: <SpriteIcon icon={"skill_foraging_32"} size={iconSize} />, title: 'Foraging', href: '/game/skill/foraging' },
		{ icon: <SpriteIcon icon={"skill_farming_32"} size={iconSize} />, title: 'Farming', href: '/game/skill/farming' },
		{ icon: <SpriteIcon icon={"skill_brewing_32"} size={iconSize} />, title: 'Brewing', href: '/game/skill/brewing' },
		{ icon: <SpriteIcon icon={"skill_carpentry_32"} size={iconSize} />, title: 'Carpentry', href: '/game/skill/carpentry' },
		/*{ icon: <SpriteIcon icon={"skill_agility_32"} size={iconSize} />, title: 'Agility', href: '/game/skill/agility' },*/
	]
];

interface SidebarItemProps {
	icon: React.ReactNode;
	title: string;
	href: string;
	disabled?: boolean;
	collapsed?: boolean;
	isActive?: boolean;
	textColor?: string;
	textColorHover?: string;
	textColorActive?: string;
}

const SidebarItem: React.FC<SidebarItemProps> = React.memo(({
	icon,
	title,
	href,
	disabled = false,
	collapsed = false,
	textColor = "text-gray-300",
	textColorHover = "hover:text-white",
	textColorActive = "text-white"
}) => {
	const location = useLocation();
	const navigate = useNavigate();
	const active = location.pathname === href;

	const content = (
		<div className="flex flex-row items-center gap-3 font-nunito font-medium">
			<div className="flex drop-shadow-ic-dark-600 drop-shadow-sm text-xl">{icon}</div>
			<span
				className={`overflow-hidden whitespace-nowrap text-lg transition-all duration-300 ${collapsed ? "opacity-0 w-0 hidden" : "opacity-100 w-auto"}`}
				style={{lineHeight: "20px"}}
			>
				{title}
			</span>
		</div>
	);

	const handleClick = () => {
		if (active) return;
		navigate(href);
	}

	return disabled ? (
		<div
			className={`w-full overflow-hidden pl-3.5 px-4 py-2.5 rounded-md transition-colors opacity-50 
			cursor-not-allowed text-(--color-lightest) focus:outline-none`}
		>
			{content}
		</div>
	) : (
		<button
			onClick={handleClick}
			className={`w-full overflow-hidden pl-3.5 gap-3 py-2.5 rounded-md transition-colors hover:bg-ic-light-500/50 
			focus:outline-none ${active ? `bg-ic-light-500! ${textColorActive}` : `cursor-pointer ${textColor} ${textColorHover}`}`}
		>
			{content}
		</button>
	);
});

interface FooterProps {
	collapsed: boolean;
}

const FooterButtons: React.FC<FooterProps> = React.memo(({ collapsed }) => {
	const user = useUser();

	const authButtons = user.isLoggedIn ? (
		<>
			<SidebarItem
				icon={Icons.user}
				title={user.session?.displayName || "_null_"}
				href="/profile"
				collapsed={collapsed}
			/>
			<SidebarItem
				icon={Icons.settings}
				title="Settings"
				href="/settings"
				collapsed={collapsed}
			/>
			<SidebarItem
				icon={Icons.logout}
				title="Logout"
				href="/logout"
				collapsed={collapsed}
				textColor={"text-red-400"}
				textColorHover={"hover:text-red-300"}
				textColorActive={"text-red-300"}
			/>
		</>
	) : (
		<>
			<SidebarItem
				icon={Icons.settings}
				title="Settings"
				href="/settings"
				collapsed={collapsed}
			/>
			<SidebarItem
				icon={Icons.login}
				title="Login with Idle Clans"
				href="/login"
				collapsed={collapsed}
			/>
		</>
	);

	return (
		<div>
			<div className="flex items-center px-2.5 rounded-md transition-colors">
				<div className="space-y-1 flex-grow overflow-hidden">
					{authButtons}
				</div>
			</div>
		</div>
	)
});

const Sidebar: React.FC = () => {
	const website = useWebsite();
	const user = useUser();

	const sidebar = useSmartRefWatcher(website.sidebarRef);
	const mobile = useSmartRefWatcher(website.mobileRef);
	const version = "v0.1";

	const buttons = [ ...navItems, "Debug" ]

	/*
<SidebarItem
				icon={Icons.logout}
				title="Logout"
				href="/logout"
				collapsed={collapsed}
				textColor={"text-red-400"}
				textColorHover={"hover:text-red-300"}
				textColorActive={"text-red-300"}
			/>
	 */

	if (user.isLoggedIn) {
		buttons.push({ icon: Icons.user, title: user.session?.displayName || "_null_", href: "/profile" });
	}

	buttons.push({ icon: Icons.settings, title: "Settings", href: "/settings" });

	if (user.isLoggedIn) {
		buttons.push({ icon: Icons.logout, title: "Logout", href: "/logout", textColor: "text-red-400",
			textColorHover: "hover:text-red-400", textColorActive: "text-red-400" });
	} else {
		buttons.push({ icon: Icons.login, title: "Login with Idle Clans", href: "/login" });
	}

	return (
		<>
			{/* Mobile overlay */}
			{mobile && sidebar && (
				<div
					className="fixed inset-0 bg-opacity-50 z-20"
					onClick={() => website.setSidebar(true)}
					aria-hidden="true"
				/>
			)}

			{/* bg-(--color-darker) */}
			<aside
				className={`
					select-none h-screen bg-ic-dark-500 flex flex-col transition-all duration-300 
					${mobile ? `fixed z-30 ${!sidebar ? '-left-18' : 'left-0'}` : `${!sidebar ? 'w-18' : 'w-64'}`}
					${mobile && sidebar ? 'w-64' : mobile ? 'w-18' : ''}
				`}
			>
				{/* Mobile toggle button (fixed to the side) */}
				{mobile && (
					<button
						className={`
							absolute top-4 p-2 rounded-full text-gray-200 hover:bg-(--color-shadow) 
							transition-colors duration-300 
							${!sidebar ? 'right-[-50px] bg-(--color-shadow) hover:bg-(--color-light)!' : 'right-4'}
						`}
						onClick={() => website.setSidebar(!sidebar)}
						aria-label={!sidebar ? "Expand sidebar" : "Collapse sidebar"}
					>
						{!sidebar ? <FiMenu size={24}/> : <FiChevronsLeft size={24}/>}
					</button>
				)}

				{/* Top bg-(--color-dark) border-(--color-darkest) */}
				<div className="flex flex-col mb-2 bg-ic-dark-200 border-b-4 border-ic-dark-700">

					{/* Logo */}
					<div className="flex justify-center items-center">
						<img
							src={logo}
							alt="Idle Clans Logo"
							className={`transition-all duration-300 select-none mt-1 ${mobile ? "mb-1" : ""} drop-shadow drop-shadow-black/30`}
							style={{height: "4rem", pointerEvents: "none"}}
						/>
					</div>

					{/* Desktop toggle button (only visible on desktop) */}
					{!mobile && (
						<button
							className="mx-auto p-1.5 mb-0.5 rounded-full text-gray-300 hover:text-white hover:bg-(--color-shadow) transition-colors"
							onClick={() => website.setSidebar(!sidebar)}
							aria-label={!sidebar ? "Expand sidebar" : "Collapse sidebar"}
						>
							{!sidebar ? <FiMenu size={18}/> : <FiChevronsLeft size={18}/>}
						</button>
					)}
				</div>

				{/* Navigation */}
				<nav className={`flex-1 flex flex-col overflow-y-auto overflow-hidden ${sidebar ? "sidebar-scrollbar" : "no-scrollbar"}`}>
					<div className="space-y-1 px-2.5 flex flex-col flex-1">
						{buttons.map((item, index) => (
							<div key={index} className={typeof item === 'string' ? '' : Array.isArray(item) ? 'flex-1 min-h-0' : ''}>
								{ typeof item === "string" ? (
									<>
										{ sidebar ? (
											<div className="flex items-center w-full h-6">
												<span className="flex-1 border-b-2 border-ic-light-400 ml-2 mr-2"/>
												<span className="text-gray-200 text-md font-nunito font-bold uppercase">{item}</span>
												<span className="flex-1 border-b-2 border-ic-light-400 ml-2 mr-2"/>
											</div>
										) : (
											<div className="flex items-center w-full h-6">
												<span className="flex-1 border-b-2 border-ic-light-400 ml-2 mr-2"/>
											</div>
										) }
									</>
								) : (item as any[]).length !== undefined ? (
									<div className="space-y-1">
										{(item as any[]).map((subItem, i) => (
											<SidebarItem key={i} {...subItem} collapsed={!sidebar} />
										))}
									</div>
								) : (
									<SidebarItem {...(item as { href: string, title: string, icon: JSX.Element })} collapsed={!sidebar} />
								) }
							</div>
						))}
					</div>
				</nav>

				{/*<div className='flex items-center w-full my-1'>
					border-(--color-light)
					<span className='flex-1 border-b-2 border-ic-light-500 ml-2 mr-2'></span>
				</div>*/}

				{/*<FooterButtons collapsed={!sidebar} />*/}

				{/* Footer bg-(--color-dark) border-(--color-darkest) */}
				<div className="pb-1 pt-1 mt-2 text-xs bg-ic-dark-200 border-t-4 border-ic-dark-700">
					<p
						className={`text-center text-gray-200 italic font-raleway overflow-hidden
						transition-opacity duration-300 ${!sidebar ? 'opacity-50' : 'opacity-80'}`}
					>
						Idle Plus<br/>Web Client<br/>{version}
					</p>
				</div>
			</aside>
		</>
	);
};

export default Sidebar;