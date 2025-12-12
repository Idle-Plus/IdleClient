import React from "react";
import BaseModal, { BaseModalProps } from "@components/modal/BaseModal.tsx";

interface GeneralEmptyModalProps extends BaseModalProps {
	title?: string;
	divider?: boolean;

	className?: string;
}

export const GeneralEmptyModal: React.FC<GeneralEmptyModalProps> = ({
	active,
	onClose,

	title,
	divider = true,
	className = "",

	children
}) => {

	return (
		<BaseModal
			active={active}
			onClose={onClose}
		>
			<div className={`w-full h-fit max-w-2xl px-4 pb-4 bg-ic-dark-500 shadow-black/25 shadow-md rounded-md ${className}`}>
				{ title !== undefined ? (
					<>
						<p className="text-center pt-2 text-2xl text-white font-bold">
							{ title }
						</p>
						{ divider && <div className="h-0.5 my-1 mb-1 bg-ic-dark-100/75"/> }
					</>
				) : null }

				{ children }
			</div>
		</BaseModal>
	);
}