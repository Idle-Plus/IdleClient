
const URL = "https://query.idleclans.com/api";
const CHAT_RECENT = URL + "/Chat/recent";

// Types

export interface ChatRecentResult {
	General: ChatMessage[];
	Trade: ChatMessage[];
	Help: ChatMessage[];
	ClanHub: ChatMessage[];
	CombatLFG: ChatMessage[];
	RaidLFG: ChatMessage[];
}

interface ChatMessage {
	Message: string;
	Sender: string;
	Premium: boolean;
	Gilded: boolean;
	GameMode: number;
	IsModerator: boolean;
}

// Implementation

const chat$Recent = async (): Promise<ChatRecentResult> => {
	return new Promise((resolve, reject) => {
		fetch(CHAT_RECENT, {
			method: "GET",
			headers: {
				"Content-Type": "application/json"
			}
		}).then((response) => {
			if (!response.ok) {
				console.error("Failed to fetch recent chat messages: ", response);
				reject("Failed to fetch recent chat messages");
				return;
			}

			response.json().then((data) => {
				resolve(data);
			});
		});
	});
}

export const IdleClansAPI = {
	chat$Recent: chat$Recent
}