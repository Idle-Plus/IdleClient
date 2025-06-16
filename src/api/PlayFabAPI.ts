import { JSEncrypt } from "jsencrypt";
import { PlayFabSession } from "@idleclient/types/playFabTypes.ts";

// Settings
const TITLE_ID = "753EF"; // TEST server
const PUBLIC_KEY = "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCvMDt1Bccu/bsLyPFsb42aq417DALVOwHHk+p0ax/MEf3ueoZVeX+W6KDYk/k2xJ1tlyEll0ZrxGcPPisSGBYFi3V491TeVJS5Yq3DSXXyEqukW6LxB7U9eAm9y40JQr00s/mCTNtskWuMyNwDgSohis5DXI7EKrJ9Oq2UaMfeqwIDAQAB"

const URL = `https://${TITLE_ID}.playfabapi.com`;
const LOGIN_EMAIL_PASSWORD = `${URL}/Client/LoginWithEmailAddress`;

const encryptSessionTicket = (sessionTicket: string): string => {
	const encrypt = new JSEncrypt();
	encrypt.setPublicKey(PUBLIC_KEY);
	const encrypted = encrypt.encrypt(sessionTicket);
	if (!encrypted) throw new Error("Failed to encrypt session ticket");
	return encrypted;
}

export type LoginResult =
	| { success: true, session: PlayFabSession }
	| { success: false };

export const login = async (email: string, password: string): Promise<LoginResult> => {
	return new Promise((resolve, _reject) => {
		// Post request to PlayFab
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