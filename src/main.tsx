import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from "react-router-dom";
import { WebsiteProvider } from './context/WebsiteContext.tsx';
import { SessionProvider } from "@context/SessionContext.tsx";
import { GameProvider } from "@context/GameContext.tsx";
import { SpriteSheetProvider } from "@context/SpriteSheetContext.tsx";
import { LoadingProvider } from "@context/LoadingContext.tsx";
import { ConsoleProvider } from "@context/ConsoleContext.tsx";
import { ModalBlur, ModalContainer, ModalProvider } from "@context/ModalContext.tsx";

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<BrowserRouter>
			<LoadingProvider>
				<WebsiteProvider>
					<ModalProvider>
						<ConsoleProvider>
							<SessionProvider>
								<GameProvider>
									<SpriteSheetProvider>
										<div className="page-background" />
										<ModalBlur>
											<App />
										</ModalBlur>
										<ModalContainer />
									</SpriteSheetProvider>
								</GameProvider>
							</SessionProvider>
						</ConsoleProvider>
					</ModalProvider>
				</WebsiteProvider>
			</LoadingProvider>
		</BrowserRouter>
	</StrictMode>,
)
