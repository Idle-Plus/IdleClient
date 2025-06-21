import { BaseModalProps } from "./BaseModal";
import React from "react";

interface GenericTextModalProps extends BaseModalProps {
	title?: string;
	message: string;
}

const GenericTextModal: React.FC<GenericTextModalProps> = ({ active, onClose, title, message }) => {
	const mouseDownRef = React.useRef(false);

	if (!active) return null;

	const handleMouseDown = (e: React.MouseEvent) => {
		if (e.target !== e.currentTarget) return;
		mouseDownRef.current = true;
	};

	const handleMouseUp = (e: React.MouseEvent) => {
		if (e.target === e.currentTarget && mouseDownRef.current) onClose?.();
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
				className="w-full h-fit max-w-md overflow-y-auto shadow-black/25 shadow-md"
				onClick={(e) => e.stopPropagation()}
			>

				{ title && (
					<div
						className="flex justify-between items-center px-4 md:px-6 pt-3 pb-2 bg-ic-dark-200
						border-b-4 border-b-black/60 border-1 border-ic-dark-000"
					>
						<span className="text-3xl font-bold text-white">{ title }</span>
						<button
							onClick={onClose}
							className="text-ic-red-200 hover:text-ic-red-300"
						>
							<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 cursor-pointer" fill="none"
							     viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
								      d="M6 18L18 6M6 6l12 12"/>
							</svg>
						</button>
					</div>
				) }

				<div className="py-4 px-4 md:px-6 bg-ic-dark-500 border-1 border-ic-dark-200 border-t-0">
					<p className="text-gray-200 text-lg">{ message }</p>
				</div>

			</div>

			<div/>

		</div>
	)
}

export default GenericTextModal;