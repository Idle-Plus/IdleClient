import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from "react-router-dom";
import { WebsiteProvider } from './context/WebsiteContext.tsx';
import { UserProvider } from "@context/UserContext.tsx";
import { GameProvider } from "@context/GameContext.tsx";
import { SpriteSheetProvider } from "@context/SpriteSheetContext.tsx";
import { LoadingProvider } from "@context/LoadingContext.tsx";
import { ConsoleProvider } from "@context/ConsoleContext.tsx";

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<BrowserRouter>
			<LoadingProvider>
				<WebsiteProvider>
					<ConsoleProvider>
						<UserProvider>
							<GameProvider>
								<SpriteSheetProvider>
									<div className="page-background" />
									<div className="h-screen"> {/*min-h-screen flex items-center justify-center */}
										<App />
									</div>
								</SpriteSheetProvider>
							</GameProvider>
						</UserProvider>
					</ConsoleProvider>
				</WebsiteProvider>
			</LoadingProvider>
		</BrowserRouter>
	</StrictMode>,
)
