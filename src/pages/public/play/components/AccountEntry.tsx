import React from "react";
import { StoredAccountInfo } from "@context/SessionContext.tsx";
import { IoMdSettings } from "react-icons/io";
import { FaTrash } from "react-icons/fa6";

interface AccountEntryProps {
    account: StoredAccountInfo;
    onEditAccount: (account: StoredAccountInfo) => void;
    onForgetAccount: (account: StoredAccountInfo) => void;
    onLogin: (account: StoredAccountInfo) => void;
}

const AccountEntry: React.FC<AccountEntryProps> = ({ 
    account, 
    onEditAccount, 
    onForgetAccount, 
    onLogin 
}) => {
    return (
        <div
            className="relative flex flex-col p-3 pt-2 bg-ic-dark-300 border border-ic-dark-200 /*rounded-lg*/"
        >
            <div className="flex justify-between ml-1">
                <span className="text-lg font-medium text-white text-ellipsis whitespace-nowrap overflow-hidden">
                    {account.name}
                </span>
                <div className="flex items-center gap-2">
                    <button
                        className="text-lg font-bold text-gray-300/75 hover:text-gray-300 cursor-pointer transition-colors"
                        onClick={() => onEditAccount(account)}
                    >
                        <IoMdSettings />
                    </button>
                    <button
                        className="text-lg font-bold text-red-400/75 hover:text-red-400 cursor-pointer transition-colors"
                        onClick={() => onForgetAccount(account)}
                    >
                        <FaTrash />
                    </button>
                </div>
            </div>

            <div className='h-0.5 my-1 mb-1 bg-ic-dark-100/75'/>

            <div className="mx-1 text-gray-300 grow">
                {/*<div>
                    Total level: <span className="text-gray-100">2200</span>
                </div>*/}
                <div>
                    Last online: <span className="text-gray-100">22h</span>
                </div>
            </div>

            { account.description && account.description.length > 0 && (
                <>
                    {/*<div className='h-0.5 my-1 mb-2 bg-ic-dark-100/75'/>*/}

                    <p className="mx-1 text-gray-200 wrap-anywhere">
                        {account.description}
                    </p>
                </>
            ) }

            <div className="flex justify-between gap-2 mx-1 mt-2 ">
                <button
                    className="w-full p-0.5 text-lg text-white bg-ic-light-400
                    hover:bg-ic-light-400/80 rounded-sm transition-colors cursor-pointer"
                    onClick={() => onLogin(account)}
                >
                    { account.password === undefined ? "Login" : "Play" }
                </button>
            </div>
        </div>
    );
}

export default AccountEntry;