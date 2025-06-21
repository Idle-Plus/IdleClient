import React from "react";

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
	});
};

export class TextUtils {

	public static getStyledMessage(message: string) {
		if (message.length === 0) return [""];

		return message.split(/(\\n|<br>)/)
			.map((line, index) => {
				if (line === "\\n" || line === "<br>") return <br key={`br-${index}`}/>;
				return parseStyledText(line);
			});
	}
}