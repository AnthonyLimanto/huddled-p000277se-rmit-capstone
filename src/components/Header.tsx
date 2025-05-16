import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Platform,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';

const Header = () => {
  return (
    <View style={styles.wrapper}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>Huddled</Text>
          <TouchableOpacity style={styles.notificationIcon}>
            <Ionicons
              name={Platform.OS === 'ios' ? 'notifications-outline' : 'notifications-outline'}
              size={22}
              color="#fff"
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  safeArea: {
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#085DB7',
  },
  notificationIcon: {
    backgroundColor: '#085DB7',
    borderRadius: 10,
    padding: 8,
  },
});

export default Header;
