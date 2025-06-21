import React from "react";
import { FaDiscord, FaGithub, FaReddit } from "react-icons/fa6";
import { IoBookSharp } from "react-icons/io5";

const FooterLinks: React.FC = () => {
    return (
        <div className="flex flex-col md:items-center lg:flex-row px-4">
            <div className="w-full md:w-2/3 lg:w-full flex justify-evenly px-4 py-2 bg-ic-dark-600 text-gray-300">
                <a
                    href="https://github.com/Idle-Plus/IdleClient"
                    className="flex flex-col lg:flex-row items-center gap-2 hover:text-white transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <FaGithub className="text-xl" />
                    <span className="hidden lg:inline">Idle Client</span>
                    <span className="lg:hidden text-base/2">Client</span>
                </a>
                <a
                    href="https://wiki.idleclans.com"
                    className="flex flex-col lg:flex-row items-center gap-2 hover:text-white transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <IoBookSharp className="text-xl" />
                    <span className="hidden lg:inline">Idle Clans Wiki</span>
                    <span className="lg:hidden text-base/2">Wiki</span>
                </a>
                <a
                    href="https://discord.gg/R3bfHyH9cH"
                    className="flex flex-col lg:flex-row items-center gap-2 hover:text-white transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <FaDiscord className="text-xl" />
                    <span className="hidden lg:inline">Idle Clans Discord</span>
                    <span className="lg:hidden text-base/2">Discord</span>
                </a>
                <a
                    href="https://reddit.com/r/idleclans"
                    className="flex flex-col lg:flex-row items-center gap-2 hover:text-white transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <FaReddit className="text-xl" />
                    <span className="hidden lg:inline">Idle Clans Reddit</span>
                    <span className="lg:hidden text-base/2">Reddit</span>
                </a>
            </div>
        </div>
    );
};

export default FooterLinks;