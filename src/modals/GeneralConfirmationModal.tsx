import React, { JSX, useEffect } from "react";
import BaseModal, { BaseModalProps } from "@components/modal/BaseModal.tsx";
import { IdleButton } from "@components/input/IdleButton.tsx";

interface GeneralConfirmationModalProps extends BaseModalProps {
	message: string | JSX.Element;
	onConfirm?: () => void;
	onCancel?: () => void;

	delay?: boolean;
	delayTimeSec?: number;
	
	confirmText?: string;
	cancelText?: string;
	titleClass?: string;
	messageClass?: string;
}

export const GeneralConfirmationModal: React.FC<GeneralConfirmationModalProps> = ({
	active,
	onClose,
	message,
	onConfirm,
	onCancel,
	delay = false,
	delayTimeSec = 5,
	confirmText = "Confirm",
	cancelText = "Cancel",
	titleClass,
	messageClass
}) => {
	const [time, setTime] = React.useState(delay ? delayTimeSec : 0);

	useEffect(() => {
		if (!delay) return;
		if (time <= 0) return;
		
		const timer = setTimeout(() => setTime(time - 1), 1000);
		return () => clearTimeout(timer);
	}, [delay, time]);
	
	return (
		<BaseModal
			active={active}
			onClose={onClose}
		>
			<div className="w-full h-fit max-w-md px-4 pb-4 bg-ic-dark-500 shadow-black/25 shadow-md rounded-md">
				<p className={`text-center pt-2 text-2xl text-white font-bold ${titleClass ?? ""}`}>
					Confirmation Required
				</p>
				<div className="h-0.5 my-1 mb-1 bg-ic-dark-100/75"/>

				<p className={`px-2 pt-2 pb-3 text-center text-lg text-gray-300 ${messageClass ?? ""}`}>
					{ message }
				</p>

				<div className="w-full flex flex-col xs:flex-row gap-x-4 gap-y-2">
					<IdleButton
						title={`${confirmText}${delay && time > 0 ? ` (${time}s)` : ""}`}
						onClick={() => {
							onConfirm?.();
							onClose?.();
						}}
						disabled={delay && time > 0}
						className="w-full"
					/>

					<IdleButton
						title={cancelText}
						onClick={() => {
							onCancel?.();
							onClose?.();
						}}
						bgColor="bg-ic-red-500"
						bgColorHover="hover:bg-ic-red-400"
						bgColorActive="active:bg-ic-red-400"
						className="w-full"
					/>
				</div>
			</div>
		</BaseModal>
	);
}