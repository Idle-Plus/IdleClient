import { BaseModalProps } from "./BaseModal";
import React, { useState } from "react";
import { TextUtils } from "@idleclient/utils/TextUtils.tsx";

interface GenericConfirmationModalProps extends BaseModalProps {
	title?: string;
	message: string;

	confirmTitle?: string;
	declineTitle?: string;

	onConfirm?: () => void;
	onDecline?: () => void;

	closeable?: boolean;
	closeOnBackground?: boolean;
	closeTriggers?: "confirm" | "decline";
}

const GenericConfirmationModal: React.FC<GenericConfirmationModalProps> = ({
	active,
	onClose,

	title,
	message,

	confirmTitle,
	declineTitle,

	onConfirm,
	onDecline,

	closeable = true,
	closeOnBackground = true,
	closeTriggers = "decline",
}) => {
	const mouseDownRef = React.useRef(false);

	confirmTitle = confirmTitle ?? "Yes";
	declineTitle = declineTitle ?? "No";

	if (!active) return null;
	const content = TextUtils.getStyledMessage(message);

	const handleMouseDown = (e: React.MouseEvent) => {
		if (e.target !== e.currentTarget) return;
		mouseDownRef.current = true;
	};

	const handleMouseUp = (e: React.MouseEvent) => {
		if (e.target === e.currentTarget && mouseDownRef.current && closeable && closeOnBackground) {
			if (closeTriggers === "confirm") onConfirm?.();
			else if (closeTriggers === "decline") onDecline?.();
			onClose?.();
		}
		mouseDownRef.current = false;
	};

	return (
		<div
			className="fixed inset-0 bg-[#00000080] flex flex-col justify-evenly items-center z-50 p-4"
			onMouseDown={handleMouseDown}
			onMouseUp={handleMouseUp}
			onMouseLeave={() => mouseDownRef.current = false}
		>

			<div
				className="w-full h-fit bg-ic-dark-300 max-w-md overflow-y-auto shadow-black/25 shadow-md"
				onClick={(e) => e.stopPropagation()}
			>

				{ title && (
					<div
						className="flex justify-between items-center px-4 sm:px-6 pt-3 pb-2 bg-ic-dark-200
						border-b-4 border-b-black/60 border-1 border-ic-dark-000"
					>
						<span className="text-3xl font-bold text-white">{ title }</span>

						{ closeable && (
							<button
								onClick={() => {
									if (closeTriggers === "confirm") onConfirm?.();
									else if (closeTriggers === "decline") onDecline?.();
									onClose?.()
								}}
								className="text-ic-red-200 hover:text-ic-red-300"
							>
								<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 cursor-pointer" fill="none"
								     viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
									      d="M6 18L18 6M6 6l12 12"/>
								</svg>
							</button>
						)}
					</div>
				) }

				{/*<div className="py-4 px-4 sm:px-6">
					<p className="text-gray-200 text-lg">{ content }</p>
				</div>*/}

				<div className="py-4 px-4 sm:px-6 bg-ic-dark-500 border-1 border-ic-dark-200 border-t-0">
					<p className="text-gray-200 text-lg">{ content }</p>

					<div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-4 mt-4">
						<button
							onClick={() => {
								onConfirm?.();
								onClose?.();
							}}
							className="w-full px-4 py-1.5 font-bold text-white bg-ic-light-400 hover:bg-ic-light-400/80
							rounded-md transition-colors"
						>
							{ confirmTitle }
						</button>

						<button
							onClick={() => {
								onDecline?.();
								onClose?.();
							}}
							className="w-full px-4 py-1.5 font-bold text-white bg-ic-red-400 hover:bg-ic-red-400/80
							rounded-sm transition-colors"
						>
							{ declineTitle }
						</button>
					</div>
				</div>

				{/*<div className="flex flex-col gap-2 sm:flex-row sm:gap-4 px-4 sm:px-6 pb-4">
					<button
						onClick={() => {
							onConfirm?.();
							onClose?.();
						}}
						className="w-full px-4 py-1.5 font-bold text-white bg-ic-light-400 hover:bg-ic-light-400/80
						rounded-md transition-colors"
					>
						{ confirmTitle }
					</button>

					<button
						onClick={() => {
							onDecline?.();
							onClose?.();
						}}
						className="w-full px-4 py-1.5 font-bold text-white bg-ic-red-400 hover:bg-ic-red-400/80
						ounded-sm transition-colors"
					>
						{ declineTitle }
					</button>
				</div>*/}

			</div>

			<div/>

		</div>
	)
}

export default GenericConfirmationModal;