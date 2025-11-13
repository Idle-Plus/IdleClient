import React, { useEffect, useRef, useState } from "react";

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
	 * If the modal should animate in.
	 */
	animate?: boolean;

	/**
	 * The classes to insert onto the root element of the Modal.
	 */
	className?: string;
	/**
	 * The class name to insert onto the background element of the Modal.
	 */
	bgClassName?: string;
	/**
	 * Represents the child elements or components to be rendered inside a
	 * parent component.
	 *
	 * Accepts any valid React node, including elements, strings, fragments,
	 * or null.
	 */
	children?: React.ReactNode;
}

const BaseModal: React.FC<BaseModalProps> = ({
	active,
	onClose,
	animate = true,
	className,
	bgClassName,
	children
}) => {
	const openTimeRef = useRef(Date.now());
	const mouseDownRef = useRef(false);
	const [stage, setStage] = useState(0);

	useEffect(() => {
		if (!animate) return;
		setStage(1);
		const timer = setTimeout(() => {
			setStage(2);
		}, 150);

		return () => clearTimeout(timer);
	}, []); // eslint-disable-line

	if (!active) return null;

	const handleMouseDown = (e: React.MouseEvent) => {
		if (e.target !== e.currentTarget) return;
		mouseDownRef.current = true;
	};

	const handleMouseUp = (e: React.MouseEvent) => {
		// Wait until at least 100 ms has passed since the Modal was opened.
		if (Date.now() - openTimeRef.current < 100) return;
		if (e.target === e.currentTarget && mouseDownRef.current) onClose?.();
		mouseDownRef.current = false;
	};

	return (
		<div
			className={`fixed inset-0 bg-[#00000080] ${bgClassName ?? ""}`}
			onMouseLeave={() => mouseDownRef.current = false}
		>
			<div
				onMouseDown={handleMouseDown}
				onMouseUp={handleMouseUp}
				className={`fixed inset-0 flex flex-col justify-evenly items-center z-50 ${className ?? ""}`}
				style={
					animate ? {
						transform: stage === 0 ? "scale(0)" : stage === 1 ? "scale(1)" : "",
						transition: "transform 0.1s linear"
					} : {}
				}
			>
				{ children }
			</div>
		</div>
	);
};

export default BaseModal;