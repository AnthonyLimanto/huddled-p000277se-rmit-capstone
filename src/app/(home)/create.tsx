// src/app/create.tsx

import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, StatusBar, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createPost } from '@/src/api/posts';
import { supabase } from '@/src/api/supabase'; // 👈 import Supabase client
import { getSessionUser } from '@/src/api/users';

export default function CreatePostScreen() {
  const [text, setText] = useState("");

  // 📨 Handle posting
  const handleSubmit = async () => {
    try {
      const currentUserId = await getSessionUser(); // ✅ Get real logged-in user's ID

      const sentPost = await createPost(currentUserId, text, "default"); // ✅ Save post with correct user
      console.log("Sent post:", sentPost);

      Alert.alert('Success', 'Post created successfully!');
      setText(""); // Clear input after posting
    } catch (error) {
      console.error("Error creating post:", error);
      Alert.alert('Error', 'Failed to create post.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Create Post</Text>
      </View>
      
      <View style={styles.createContainer}>
        <TextInput
          placeholder="What's on your mind?"
          placeholderTextColor="#999"
          multiline
          style={styles.postInput}
          value={text}
          onChangeText={(text) => setText(text)}
        />
        
        <View style={styles.mediaOptions}>
          <TouchableOpacity style={styles.mediaButton}>
            <Ionicons name="image" size={24} color="#0066CC" />
            <Text style={styles.mediaButtonText}>Photo</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.mediaButton}>
            <Ionicons name="videocam" size={24} color="#0066CC" />
            <Text style={styles.mediaButtonText}>Video</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.mediaButton}>
            <Ionicons name="document" size={24} color="#0066CC" />
            <Text style={styles.mediaButtonText}>File</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.privacySelector}>
          <Text style={styles.privacyLabel}>Who can see this?</Text>
          <TouchableOpacity style={styles.privacyOption}>
            <Ionicons name="globe-outline" size={20} color="#333" />
            <Text style={styles.privacyText}>Everyone</Text>
            <Ionicons name="chevron-down" size={20} color="#333" />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={styles.postButton} onPress={handleSubmit}>
          <Text style={styles.postButtonText}>Post</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// 🎨 Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  createContainer: {
    flex: 1,
    padding: 16,
  },
  postInput: {
    height: 150,
    fontSize: 18,
    textAlignVertical: 'top',
    padding: 12,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    marginBottom: 16,
  },
  mediaOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  mediaButton: {
    alignItems: 'center',
    padding: 10,
  },
  mediaButtonText: {
    marginTop: 5,
    fontSize: 14,
    color: '#0066CC',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 16,
  },
  privacySelector: {
    marginBottom: 20,
  },
  privacyLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  privacyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    padding: 12,
    borderRadius: 8,
  },
  privacyText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  postButton: {
    backgroundColor: '#0066CC',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 'auto',
  },
  postButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

