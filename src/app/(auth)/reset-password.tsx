import { View, Text, StyleSheet } from 'react-native';

export default function ResetPasswordScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Reset Password Page</Text>
      <Text style={styles.subText}>This page will be implemented later</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E5F3FD',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subText: {
    fontSize: 16,
    color: '#555',
  },
}); 