import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Platform, SafeAreaView, StyleSheet, TouchableOpacity, View } from 'react-native';

const Header = () => {
  return (
      <SafeAreaView style={styles.container}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/images/Huddled-wordmark.png')}
              style={styles.logoWordmark}
            />
          </View>
          <TouchableOpacity style={styles.notificationIcon} >
            <Ionicons name={Platform.OS === 'ios' ? 'notifications-outline' : 'notifications-outline'}
              size={30}
              justifyContent='center'
              alignItems="center"
              color="#FFFFFF"
            />
          </TouchableOpacity>
          </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
      },
      logoContainer: {
        alignItems: 'left',
        marginTop: 5,
        marginLeft: 20,
        marginBottom: 10,
      },
      logoWordmark: {
        width: 150,
        height: 50,
        resizeMode: 'contain',
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
        backgroundColor: '#075DB6',
        alignItems: 'center',
        justifyContent: 'center',
      },
});

export default Header;
