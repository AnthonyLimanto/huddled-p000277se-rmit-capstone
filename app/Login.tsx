import { View, Text, StyleSheet } from "react-native";

const Login = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login Page</Text>
      {/* Add your login form here */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold" },
});

export default Login;
