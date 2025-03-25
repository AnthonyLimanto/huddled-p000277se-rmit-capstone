import { useEffect } from "react";
import { router, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";

SplashScreen.preventAutoHideAsync(); // Keep native splash visible

const App = () => {
  useEffect(() => {
    async function prepare() {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulated loading
      await SplashScreen.hideAsync(); // Hide native splash
      router.replace("/Login"); // Navigate to login
    }
    prepare();
  }, []);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
    </>
  );
};

export default App;
