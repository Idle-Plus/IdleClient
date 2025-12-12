import React, { JSX } from "react";
import { LocalizationDatabase } from "@idleclient/game/data/LocalizationDatabase.ts";
import GeneralTextModal from "@/modals/GeneralTextModal.tsx";
import { GeneralConfirmationModal } from "@/modals/GeneralConfirmationModal.tsx";
import { TextUtils } from "@idleclient/utils/TextUtils.tsx";
import { ClanInvitationsModal } from "@pages/game/clan/modals/ClanInvitationsModal.tsx";

export class ModalUtils {

	public static generalTextModal(title: string | undefined | null, message: string) {
		title = title ?? undefined;
		return <GeneralTextModal title={title} message={message}/>;
	}

	public static generalTextModalLocalized(title: string | undefined | null, key: string, args?: any[]) {
		title = title ?? undefined;
		const message = TextUtils.getStyledMessage(LocalizationDatabase.get(key, args));
		return <GeneralTextModal title={title} message={message}/>;
	}

	public static generalConfirmationModal(
		message: string | JSX.Element,
		onConfirm?: (() => void) | null,
		onCancel?: (() => void) | null,
		options?: { confirmText?: string, cancelText?: string, delay?: number }
	) {
		return <GeneralConfirmationModal
			message={message}
			onConfirm={onConfirm ?? undefined}
			onCancel={onCancel ?? undefined}
			delay={options?.delay !== undefined}
			delayTimeSec={options?.delay}
			confirmText={options?.confirmText}
			cancelText={options?.cancelText}
		/>;
	}

	public static clanInvitationModal() {
		return <ClanInvitationsModal />;
	}
}