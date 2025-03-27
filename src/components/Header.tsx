import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const Header = () => {
  return (
        <View style={styles.header}>
          <Text style={styles.title}>Huddled</Text>
          <TouchableOpacity style={styles.notificationIcon} >
            <Ionicons name={Platform.OS === 'ios' ? 'notifications-outline' : 'notifications-outline'}
              size={30}
              justifyContent='center'
              alignItems="center"
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>
  );
};
const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
      },
      title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#0066CC',
      },
      notificationIcon: {
        width: 50,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#1357DA',
        alignItems: 'center',
        justifyContent: 'center',
      },
});

export default Header;