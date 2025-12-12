import React, { FC, ReactNode, RefObject, useCallback, useEffect, useRef, useState } from "react";

interface TooltipProps {
	value: ReactNode | string;
	delay?: number;
	container?: RefObject<HTMLDivElement | null | undefined>;
	direction?: "top" | "bottom" | "left" | "right" | "auto";
	offset?: number;

	className?: string;
	tipClassName?: string;
	children: ReactNode;
}

const Tooltip: FC<TooltipProps> = ({
	value,
	delay = 0,
	container,
	direction = "bottom",
	offset = 0,
	
	className,
	tipClassName,
	children
}) => {
	const [hovering, setHovering] = useState(false);
	const [visible, setVisible] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);
	const positionRef = useRef({ x: 0, y: 0, dir: "bottom" });
	// Touch values
	const touchStartTime = useRef<number>(0);
	const touchStartPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

	const calculatePosition = useCallback((div: HTMLDivElement, dir: string) => {
		const rect = div.getBoundingClientRect();
		switch (dir) {
			case "top": return { x: rect.left + (rect.width / 2), y: rect.top - offset, dir }
			case "bottom": return { x: rect.left + (rect.width / 2), y: rect.bottom + offset, dir }
			case "left": return { x: rect.left - offset, y: rect.top + (rect.height / 2), dir }
			case "right": return { x: rect.right + offset, y: rect.top + (rect.height / 2), dir }
			case "auto": {
				const above = rect.top;
				const below = window.innerHeight - rect.bottom;
				const left = rect.left;
				const right = window.innerWidth - rect.right;

				const spaces = [
					{ dir: "bottom", space: below + offset },
					{ dir: "top", space: above - offset },
					{ dir: "left", space: left - offset },
					{ dir: "right", space: right + offset }
				];

				const bestDir = spaces.reduce((prev, curr) =>
					curr.space > prev.space ? curr : prev);
				return calculatePosition(div, bestDir.dir);
			}
			default: return { x: 0, y: 0, dir: "bottom" }
		}
	}, [offset]);
	
	useEffect(() => {
		if (!hovering) {
			setVisible(false)
			return;
		}

		if (delay <= 0) {
			const ref = container?.current ?? containerRef.current;
			if (ref) {
				positionRef.current = calculatePosition(ref, direction);
				setVisible(true);
			}
			return;
		}

		const timeoutId = setTimeout(() => {
			const ref = container?.current ?? containerRef.current;
			if (ref) {
				positionRef.current = calculatePosition(ref, direction);
				setVisible(true);
			}
		}, delay);

		return () => clearTimeout(timeoutId);
	}, [hovering, delay, container, direction, offset, calculatePosition]);

	const getTranslate = () => {
		switch (positionRef.current.dir) {
			case "top": return "translateX(-50%) translateY(-100%)"
			case "bottom": return "translateX(-50%)";
			case "left": return "translateX(-100%) translateY(-50%)";
			case "right": return "translateY(-50%)";
			default: return "translateX(-50%)";
		}
	}

	useEffect(() => {
		if (!visible) return;

		const handleGlobalTouchMove = () => setVisible(false);
		const handleGlobalScroll = () => setVisible(false);

		document.addEventListener('touchmove', handleGlobalTouchMove);
		document.addEventListener('scroll', handleGlobalScroll, true);

		return () => {
			document.removeEventListener('touchmove', handleGlobalTouchMove);
			document.removeEventListener('scroll', handleGlobalScroll, true);
		};
	}, [visible]);

	const handleTouchStart = (e: React.TouchEvent) => {
		if (visible) {
			touchStartTime.current = 0;
			touchStartPos.current = { x: 0, y: 0 };
			setVisible(false);
			return;
		}

		touchStartTime.current = Date.now();
		touchStartPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
	}

	const handleTouchEnd = (e: React.TouchEvent) => {
		const touchDuration = Date.now() - touchStartTime.current;
		const deltaX = Math.abs(e.changedTouches[0].clientX - touchStartPos.current.x);
		const deltaY = Math.abs(e.changedTouches[0].clientY - touchStartPos.current.y);
		touchStartTime.current = 0;
		touchStartPos.current = { x: 0, y: 0 };
		if (touchDuration > 500 || deltaX > 10 || deltaY > 10) return;

		if (visible) {
			setVisible(false);
			return;
		}

		const ref = container?.current ?? containerRef.current;
		if (ref) {
			positionRef.current = calculatePosition(ref, direction);
			setVisible(true);
		}
	}

	return (
		<div
			ref={containerRef}
			className={`group relative ${className ?? ""}`}
			onMouseEnter={() => setHovering(true)}
			onMouseLeave={() => setHovering(false)}
			onTouchStart={handleTouchStart}
			onTouchEnd={handleTouchEnd}
		>
			{children}

			<div
				className={`fixed z-100 transition-opacity duration-200 ${visible ? "opacity-100 visible" : "opacity-0 invisible"} 
				bg-ic-dark-700/85 text-white not-italic rounded-sm px-2 py-1 whitespace-nowrap 
				${tipClassName ?? ""} pointer-events-none select-none`}
				style={{
					left: `${positionRef.current.x}px`,
					top: `${positionRef.current.y}px`,
					transform: getTranslate(),
				}}

			>
				{value}
			</div>
		</div>
	);
}

export default Tooltip;