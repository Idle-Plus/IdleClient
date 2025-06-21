import { JSEncrypt } from "jsencrypt";
import { PlayFabSession } from "@idleclient/types/playFabTypes.ts";

const TITLE_ID: string = import.meta.env.VITE_PLAYFAB_TITLE_ID;
const PUBLIC_KEY: string = import.meta.env.VITE_PLAYFAB_PUBLIC_KEY;

const URL = `https://${TITLE_ID}.playfabapi.com`;
const LOGIN_EMAIL_PASSWORD = `${URL}/Client/LoginWithEmailAddress`;
const REGISTER_EMAIL_PASSWORD = `${URL}/Client/RegisterPlayFabUser`;

const encryptSessionTicket = (sessionTicket: string): string => {
	const encrypt = new JSEncrypt();
	encrypt.setPublicKey(PUBLIC_KEY);
	const encrypted = encrypt.encrypt(sessionTicket);
	if (!encrypted) throw new Error("Failed to encrypt session ticket");
	return encrypted;
}

export type PlayFabLoginResult =
	| { success: true, session: PlayFabSession }
	| { success: false };

export const login = async (email: string, password: string): Promise<PlayFabLoginResult> => {
	return new Promise((resolve, _reject) => {
		fetch(LOGIN_EMAIL_PASSWORD, {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				TitleId: TITLE_ID,
				Email: email,
				Password: password,
				InfoRequestParameters: {
					GetUserAccountInfo: true
				}
			})
		}).then((response) => {
			if (!response.ok) {
				console.error("Failed to login with PlayFab: ", response);
				resolve({ success: false });
				return;
			}

			response.json().then((data) => {

				const sessionTicket = data.data.SessionTicket;
				const playFabId = data.data.PlayFabId;
				const expiration = data.data.EntityToken.TokenExpiration;

				const accountInfo = data.data.InfoResultPayload.AccountInfo;
				const displayName = accountInfo.TitleInfo.DisplayName || accountInfo.Username;

				const session: PlayFabSession = {
					sessionTicket: encryptSessionTicket(sessionTicket),
					playFabId: playFabId,
					displayName: displayName,
					expiration: expiration
				}

				resolve({ success: true, session: session });
			});
		})
	});
}

export type PlayFabRegisterResult =
	| { success: true, session: PlayFabSession }
	| { success: false, message: string };

export const register = async (name: string, email: string, password: string): Promise<PlayFabRegisterResult> => {
	return new Promise((resolve, _reject) => {
		fetch(REGISTER_EMAIL_PASSWORD, {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				TitleId: TITLE_ID,
				Username: name,
				DisplayName: name,
				Email: email,
				Password: password,
				InfoRequestParameters: {
					GetUserAccountInfo: true
				}
			})
		}).then(async (response) => {
			if (!response.ok) {
				try {
					const data = await response.json();

					let message: string;
					switch (data.errorCode as number) {
						case 1005:
						case 1006: message = "Email address is already in use"; break
						case 1008: message = "Invalid password"; break;
						case 1007: message = "Invalid username"; break;
						case 1058:
						case 1009: message = "Username isn't available"; break
						default: message = data.errorMessage; break;
					}

					resolve({ success: false, message: message });
					return;
				} catch (e) {
					console.error(e);
					resolve({ success: false, message: "Failed to register account" });
					return;
				}
			}

			response.json().then((data) => {
				const sessionTicket = data.data.SessionTicket;
				const playFabId = data.data.PlayFabId;
				const expiration = data.data.EntityToken.TokenExpiration;
				const displayName = data.data.Username;

				const session: PlayFabSession = {
					sessionTicket: encryptSessionTicket(sessionTicket),
					playFabId: playFabId,
					displayName: displayName,
					expiration: expiration
				}

				resolve({ success: true, session: session });
			});
		})
	})
}