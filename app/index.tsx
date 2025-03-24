import { useEffect } from "react";
import { View, Image, StyleSheet } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { Stack } from "expo-router";

SplashScreen.preventAutoHideAsync();

const App = () => {
  useEffect(() => {
    async function prepare() {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await SplashScreen.hideAsync();
    }
    prepare();
  }, []);

  return (
    <>
      {/* Hides the header for this screen */}
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.container}>
        <Image source={require("../assets/images/icon-only.png")} style={styles.icon} />
        <Image source={require("../assets/images/Huddled-wordmark.png")} style={styles.wordmark} />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    width: 60,
    height: 60,
    marginBottom: 10,
    resizeMode: "contain",
  },
  wordmark: {
    width: 160,
    height: 50,
    resizeMode: "contain",
  },
});

export default App;
