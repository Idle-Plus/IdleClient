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
	 * The z-index of this modal.
	 */
	zIndex?: number;
	/**
	 * If the modal should animate in.
	 */
	animate?: boolean;
	/**
	 * Called when the Modal is mounted after the animation has finished.
	 */
	onMounted?: () => void;

	/**
	 * The padding to use. Class name field isn't used as most of the time it'll
	 * be the default value.
	 */
	padding?: string;
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
	zIndex = 6000,
	animate = true,
	onMounted,
	padding = "p-1 xs:p-4",
	className,
	bgClassName,
	children
}) => {
	const openTimeRef = useRef(Date.now());
	const mouseDownRef = useRef(false);
	const [stage, setStage] = useState(0);

	useEffect(() => {
		if (!animate) {
			onMounted?.();
			return;
		}
		setStage(1);
		const timer = setTimeout(() => {
			onMounted?.();
			setStage(2);
		}, 175);

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
			style={{ zIndex: zIndex }}
			onMouseLeave={() => mouseDownRef.current = false}
		>
			<div
				onMouseDown={handleMouseDown}
				onMouseUp={handleMouseUp}
				className={`fixed inset-0 flex flex-col justify-evenly items-center ${padding} ${className ?? ""}`}
				style={
					animate ? {
						opacity: stage === 0 ? 0.5 : stage === 1 ? 1 : "",
						transform: stage === 0 ? "scale(0)" : stage === 1 ? "scale(1)" : "",
						transition: "all 0.125s linear"
					} : {}
				}
			>
				<div className="flex-1" />
				{/*<React.Fragment key={stage !== 2 ? "mounting" : "mounted"}>
					{ children }
				</React.Fragment>*/}
				{ children }
				<div className="flex-2" />
			</div>
		</div>
	);
};

export const BaseModalCloseButton: React.FC<{ close?: () => void, className?: string, size?: string }> = ({
	close,
	className,
	size = "size-6"
}) => {
	return (
		<div
			className={`transition-colors duration-100 bg-ic-red-600 hover:bg-ic-red-500 
			text-ic-red-000 hover:text-white/85 rounded-xs ${size} ${className ?? ""}`}
			onClick={close}
		>
			<svg xmlns="http://www.w3.org/2000/svg" className={`${size} cursor-pointer`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
			</svg>
		</div>
	)
}

export default BaseModal;