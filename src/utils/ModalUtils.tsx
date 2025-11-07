import React from "react";
import { LocalizationDatabase } from "@idleclient/game/data/LocalizationDatabase.ts";
import GeneralTextModal from "@/modals/GeneralTextModal.tsx";

export class ModalUtils {

	public static generalTextModal(title: string | undefined | null, message: string) {
		title = title ?? undefined;
		return <GeneralTextModal title={title} message={message}/>;
	}

	public static generalTextModalLocalized(title: string | undefined | null, key: string, args?: any[]) {
		title = title ?? undefined;
		return <GeneralTextModal title={title} message={LocalizationDatabase.get(key, args)}/>;
	}
}