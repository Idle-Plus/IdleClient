import { BaseModalProps } from "@components/modal/BaseModal.tsx";
import React, { useState } from "react";

interface EditAccountModalProps extends BaseModalProps {
	accountInfo: { email: string, description: string };
	onSave: (description: string) => void;
}

const EditAccountModal: React.FC<EditAccountModalProps> = ({active, onClose, accountInfo, onSave}) => {
	const [description, setDescription] = useState(accountInfo.description);
	const [showEmail, setShowEmail] = useState(false);
	const [isMouseDown, setIsMouseDown] = useState(false);

	if (!active) return null;

	const handleSave = () => {
		onSave(description);
		onClose?.();
	};

	const handleMouseDown = (e: React.MouseEvent) => {
		if (e.target === e.currentTarget) {
			setIsMouseDown(true);
		}
	};

	const handleMouseUp = (e: React.MouseEvent) => {
		if (e.target === e.currentTarget && isMouseDown) {
			onClose?.();
		}
		setIsMouseDown(false);
	};

	return (
		<div
			className="fixed inset-0 bg-[#00000080] flex flex-col justify-evenly items-center z-50 p-4"
			onMouseDown={handleMouseDown}
			onMouseUp={handleMouseUp}
			onMouseLeave={() => setIsMouseDown(false)}
		>
			<div
				className="w-full h-fit bg-ic-dark-500 max-w-md overflow-y-auto"
				onClick={(e) => e.stopPropagation()}
			>

				<div
					className="flex justify-between items-center mb-2 px-4 md:px-6 pt-3 pb-2 bg-ic-dark-200
					border-b-4 border-b-black/60 border-1 border-ic-dark-000"
				>
					<span className="text-3xl font-bold text-white">Edit account</span>
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

				<div className="px-4 pb-3 md:px-6">
					{/* Account Information */}
					<div className="mb-4">
						<div className="flex items-center gap-2">
							<label className="text-white/75 font-medium">Email Address</label>
							<button
								onClick={() => setShowEmail(!showEmail)}
								className="px-2 py-0.5 text-xs text-white bg-ic-dark-200 hover:bg-ic-dark-200/80
								rounded-sm transition-colors"
							>
								{showEmail ? 'Hide' : 'Show'}
							</button>
						</div>

						<div className="flex items-center space-x-2">
							<span className="text-white px-1">
								{showEmail ? accountInfo.email : '••••••••••••••••••'}
							</span>
						</div>
					</div>


					{/* Description */}
					<div className="space-y-1">
						<label htmlFor="description" className="block text-white/75 font-medium">
							Account description
						</label>
						<textarea
							id="description"
							placeholder="Magic, red & blue keys"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							className="w-full px-3 py-2 bg-ic-dark-200 text-white border
							border-ic-dark-000 focus:outline-none
							resize-none"
							rows={3}
							maxLength={80}
						/>
					</div>


					{/* Save */}
					<div className="ml-auto flex justify-end gap-4 pt-2 pb-4">
						<button
							onClick={handleSave}
							className="w-full px-4 py-2 text-white bg-ic-light-400 hover:bg-ic-light-400/80 rounded-md transition-colors"
						>
							Save
						</button>
					</div>
				</div>
			</div>

			<div/>
		</div>
	);
}

export default EditAccountModal;