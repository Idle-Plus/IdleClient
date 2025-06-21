import React, { createContext, useContext, useState, type ReactNode } from "react";

export interface BaseModalTypeProps {
	active?: boolean;
	onOpen?: () => void;
	onClose?: () => void;
}

type ModalType = {
	id: string;
	component: React.ReactElement<BaseModalTypeProps>;
	props?: Partial<BaseModalTypeProps>;
};

export interface ModalContextType {
	modals: ModalType[];
	openModal: (id: string, component: React.ReactElement<BaseModalTypeProps>, props?: Partial<BaseModalTypeProps>) => void;
	closeModal: (id: string) => void;
	closeAllModals: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);
const ModalBlurContext = createContext<boolean | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
	const [modals, setModals] = useState<ModalType[]>([]);

	const openModal = (
		id: string,
		component: React.ReactElement<BaseModalTypeProps>,
		props?: Partial<BaseModalTypeProps>
	) => {
		// Check if the modal already exists, if it does, update it.
		if (modals.some(modal => modal.id === id)) {
			const updatedModals = modals.map(modal => modal.id === id ?
				{ ...modal, component, props } :
				modal);
			setModals(updatedModals);
		} else {
			// If it doesn't exist, then just add it.
			setModals([...modals, { id, component, props }]);
			if (props?.onOpen) props.onOpen();
		}
	};

	const closeModal = (id: string) => {
		const modal = modals.find(m => m.id === id);
		if (modal?.props?.onClose) modal.props.onClose();
		setModals(modals.filter(modal => modal.id !== id));
	};

	const closeAllModals = () => {
		setModals([]);
	};

	return (
		<ModalContext.Provider
			value={{ modals, openModal, closeModal, closeAllModals }}
		>
			{children}
		</ModalContext.Provider>
	);
};

export const ModalBlur: React.FC<{ children: ReactNode }> = ({ children }) => {
	const modal = useModal();
	const blur = modal.modals.length > 0;

	return (
		<ModalBlurContext.Provider value={blur}>
			<div
				style={blur ?
					{filter: "blur(1px)", transition: "filter 0.1s"} :
					{transition: "filter 0.05s"}}
			>
				{children}
			</div>
		</ModalBlurContext.Provider>
	);
}

export const ModalContainer: React.FC = () => {
	const { modals, closeModal } = useModal();

	return (
		<>
			{modals.map((modal) => (
				<div key={modal.id}>
					{React.isValidElement(modal.component) &&
						React.cloneElement(modal.component, {
							active: true,
							onClose: () => closeModal(modal.id),
						})
					}
				</div>
			))}
		</>
	);
};

export const useModal = () => {
	const context = useContext(ModalContext);
	if (context === undefined) {
		throw new Error("useModal must be used within a ModalProvider");
	}
	return context;
};