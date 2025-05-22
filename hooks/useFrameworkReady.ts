import * as Font from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export function useFrameworkReady() {
	const [appIsReady, setAppIsReady] = useState(false);

	useEffect(() => {
		async function prepare() {
			try {
				// Pre-load fonts, make any API calls you need to do here
				await Font.loadAsync({
					// Load any fonts you need here
					// 'open-sans': require('../assets/fonts/OpenSans-Regular.ttf'),
				});

				// Any other initialization logic goes here

				// Artificial delay for demo purposes
				await new Promise((resolve) => setTimeout(resolve, 100));
			} catch (e) {
				console.warn(e);
			} finally {
				// Tell the application to render
				setAppIsReady(true);
			}
		}

		prepare();
	}, []);

	useEffect(() => {
		// After everything is set up, hide the splash screen
		if (appIsReady) {
			// Use setTimeout to ensure the UI is ready before hiding splash screen
			const hideSplash = async () => {
				await SplashScreen.hideAsync();
			};

			// Add small timeout to prevent potential race conditions
			const timer = setTimeout(() => {
				hideSplash();
			}, 100);

			return () => clearTimeout(timer);
		}
	}, [appIsReady]);

	return appIsReady;
}
