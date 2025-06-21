import React from "react";

export interface BaseModalProps {
	/**
	 * The title of the Modal.
	 */
	title?: string;
	/**
	 * If the Modal is active and should be displayed.
	 */
	active?: boolean;
	/**
	 * Called when the Modal is closed.
	 *
	 * If the Modal is displayed using ModalContext.open(), then this field
	 * won't do anything, as it's overridden when the Modal is displayed,
	 * instead, the onClose field on the .open() function should be used.
	 */
	onClose?: () => void;

	/**
	 * Represents the child elements or components to be rendered inside a
	 * parent component.
	 *
	 * Accepts any valid React node, including elements, strings, fragments,
	 * or null.
	 */
	children?: React.ReactNode;
}

const BaseModal: React.FC<BaseModalProps> = ({ title, children, onClose, active }) => {
	if (!active) return null;

	return (
		<div
			className="fixed inset-0 bg-[#00000080] flex justify-center z-50"
			onClick={onClose}
		>
			<div
				className="w-full bg-ic-dark-400 rounded-lg max-w-2xl overflow-y-auto"
				onClick={(e) => e.stopPropagation()}
			>
				{title && (
					<>
						<div className="flex justify-between items-center bg-ic-dark-100 p-6 pb-3 pt-3 border-b-ic-dark-600 border-b-4">
							<div>
								<h2 className="text-3xl font-bold text-white">{title}</h2>
							</div>
							<button
								onClick={onClose}
								className="text-ic-red-200 hover:text-ic-red-300"
							>
								<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</div>
					</>
				)}
				<div className="space-y-6 p-6">
					{children}
				</div>
			</div>
		</div>
	);
};

export default BaseModal;