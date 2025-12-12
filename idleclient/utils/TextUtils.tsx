import React, { JSX } from "react";

const parseStyledText = (text: string) => {
	return text.split(/(<\/?[bi]>)/).map((part, index) => {
		if (part === "<b>") return null;
		if (part === "</b>") return null;
		if (part === "<i>") return null;
		if (part === "</i>") return null;

		const prevPart = index > 0 ? text.split(/(<\/?[bi]>)/)[index - 1] : "";
		const isBold = prevPart === "<b>";
		const isItalic = prevPart === "<i>";

		return part && (
			<span key={index} className={`${isBold ? "font-semibold" : ""} ${isItalic ? "italic" : ""}`}>
				{part}
			</span>
		);
	}).filter(value => value !== null);
};

export class TextUtils {

	public static getStyledMessage(
		message: string,
		options?: { appendPeriod?: boolean, ignoreBr?: boolean }
	): string | JSX.Element | (string | JSX.Element)[] {
		if (message.length === 0) return "";

		return message
			.split(/(\\n|<br>)/)
			.map((line, index) => {
				if (options?.ignoreBr !== true && (line === "\\n" || line === "<br>"))
					return <br key={`br-${index}`}/>;
				if (options?.appendPeriod === true && !line.trim().endsWith(".") && line.trim().length > 0)
					line += ".";

				return parseStyledText(line);
			})
			.flat();
	}
}