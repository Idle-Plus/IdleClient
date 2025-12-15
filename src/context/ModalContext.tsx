import React, { createContext, useContext, type ReactNode } from "react";
import useSmartRef, { SmartRef } from "@hooks/smartref/useSmartRef.ts";
import useSmartRefWatcher from "@hooks/smartref/useSmartRefWatcher.ts";

export interface BaseModalTypeProps {
	active?: boolean;
	onOpen?: () => void;
	onClose?: () => void;
	zIndex?: number;
}

type ModalType = {
	id: string;
	component: React.ReactElement<BaseModalTypeProps>;
	props?: Partial<BaseModalTypeProps>;
};

export interface ModalContextType {
	modals: SmartRef<ModalType[]>;
	openModal: (id: string, component: React.ReactElement<BaseModalTypeProps>, props?: Partial<BaseModalTypeProps>) => void;
	closeModal: (id: string) => void;
	closeAllModals: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);
const ModalBlurContext = createContext<boolean | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
	const modalsRef = useSmartRef<ModalType[]>([]);

	const openModal = (
		id: string,
		component: React.ReactElement<BaseModalTypeProps>,
		props?: Partial<BaseModalTypeProps>,
	) => {
		const modals = modalsRef.content();

		// Check if the modal already exists, if it does, update it.
		if (modals.some(modal => modal.id === id)) {
			const updatedModals = modals.map(modal => modal.id === id ?
				{ ...modal, component, props } :
				modal);
			modalsRef.setContent(updatedModals);
		} else {
			// If it doesn't exist, then just add it.
			modalsRef.setContent([...modals, { id, component, props }]);
			if (props?.onOpen) props.onOpen();
		}
	};

	const closeModal = (id: string) => {
		const modals = modalsRef.content();
		const modal = modals.find(m => m.id === id);
		if (modal?.props?.onClose) modal.props.onClose();
		modalsRef.setContent(modals.filter(modal => modal.id !== id));
	};

	const closeAllModals = () => {
		modalsRef.setContent([]);
	};

	return (
		<ModalContext.Provider
			value={{ modals: modalsRef, openModal, closeModal, closeAllModals }}
		>
			{children}
		</ModalContext.Provider>
	);
};

export const ModalBlur: React.FC<{ children: ReactNode }> = ({ children }) => {
	const modal = useModal();
	const modals = useSmartRefWatcher(modal.modals);
	const blur = modals.length > 0;

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
	const modal = useModal();
	const modals = useSmartRefWatcher(modal.modals);

	return (
		<div>
			{modals.map((entry, index) => (
				<div key={entry.id}>
					{React.isValidElement(entry.component) &&
						React.cloneElement(entry.component, {
							active: true,
							onClose: () => modal.closeModal(entry.id),
							zIndex: 6000 + index,
						})
					}
				</div>
			))}
		</div>
	);
};

export const useModal = () => {
	const context = useContext(ModalContext);
	if (context === undefined) {
		throw new Error("useModal must be used within a ModalProvider");
	}
	return context;
};