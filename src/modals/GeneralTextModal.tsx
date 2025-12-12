import BaseModal, { BaseModalProps } from "@components/modal/BaseModal.tsx";
import React, { JSX } from "react";
import { IdleButton } from "@components/input/IdleButton.tsx";

interface GeneralTextModal extends BaseModalProps {
	title?: string;
	message: string | JSX.Element | (string | JSX.Element)[]

	titleClass?: string;
	messageClass?: string;
}

const GeneralTextModal: React.FC<GeneralTextModal> = ({
	active,
	onClose,
	title,
	message,
	titleClass = "",
	messageClass = ""
}) => {
	return (
		<BaseModal
			active={active}
			onClose={onClose}
		>
			<div className="w-full h-fit max-w-md overflow-y-auto shadow-black/25 shadow-md rounded-md">
				<div className="px-4 pb-2 bg-ic-dark-500 rounded-md">
					{ title && (
						<>
							<p className={`text-center pt-2 text-2xl text-white font-bold ${titleClass}`}>
								{ title ?? "Testing Title" }
							</p>
							<div className='h-0.5 my-1 mb-3 bg-ic-dark-100/75'/>
						</>
					) }
					<p className={`px-1 text-gray-200 text-lg text-center ${title === undefined ? "pt-4" : ""} ${messageClass}`}>
						{ Array.isArray(message)
							? message.map((item, index) => (
								<React.Fragment key={index}>
									{item}
								</React.Fragment>
							))
							: message
						}
					</p>

					<div className="mb-2 mt-4 w-full flex justify-center">
						<IdleButton
							title={"OK"}
							className="w-2/3 py-1!"
							onClick={onClose}
						/>
					</div>
				</div>
			</div>
		</BaseModal>
	);
}

export default GeneralTextModal;