import {
  Alert,
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createPost } from '@/src/api/posts';
import { supabase } from '@/src/api/supabase';
import { uploadPostImages } from '@/src/helper/bucketHelper';
import { Audio } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigation } from '@react-navigation/native';

const MAX_IMAGE_COUNT = 4;

export type ImageFileType = {
  uri: string;
  name: string;
  file: File;
};

export default function CreatePostScreen() {
  const MAX_CHAR = 300;
  const [text, setText] = useState('');
  const [fileList, setFileList] = useState<ImageFileType[]>([]);
  const [userName, setUserName] = useState('');
  const [userTitle, setUserTitle] = useState('');
  const navigation = useNavigation();

  const dingSound = useRef<Audio.Sound | null>(null);
  const isImageReachLimit = useMemo(() => fileList.length >= MAX_IMAGE_COUNT, [fileList]);

  useEffect(() => {
    const loadSound = async () => {
      const { sound } = await Audio.Sound.createAsync(
        require('../../../assets/sounds/Post_sound.mp3')
      );
      dingSound.current = sound;
    };

    const fetchUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error || !data?.user) throw new Error('No user session found');
        setUserName(data.user.user_metadata.full_name || 'Unknown User');
        setUserTitle(data.user.user_metadata.title || 'Member');
      } catch (err) {
        console.error('Failed to get user:', err);
      }
    };

    loadSound();
    fetchUser();

    return () => {
      if (dingSound.current) dingSound.current.unloadAsync();
    };
  }, []);

  const getSessionUser = async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user?.id) throw new Error('No user session found');
    return data.user.id;
  };

  const handlePickImage = async () => {
    if (isImageReachLimit) {
      Alert.alert('Limit reached', `You can only upload ${MAX_IMAGE_COUNT} images.`);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
      allowsMultipleSelection: true,
      selectionLimit: MAX_IMAGE_COUNT - fileList.length,
    });

    if (!result.canceled && result.assets?.length > 0) {
      const uriArr = result.assets.map((asset, idx) => {
        const suffix = (asset.fileName || 'x.png').split('.').pop();
        return {
          uri: asset.uri,
          name: `image-${Date.now()}-${idx}.${suffix}`,
          file: asset.file,
        };
      }) as ImageFileType[];

      setFileList((prev) => [...prev, ...uriArr]);
    }
  };

  const handleSubmit = async () => {
    try {
      if (dingSound.current) await dingSound.current.replayAsync();
      if (text.trim() === '' && fileList.length === 0) return;

      const currentUserId = await getSessionUser();
      const fileNameArr = fileList.map((file) => file.name);
      const sentPost = await createPost(currentUserId, text, fileNameArr.join(','));

      if (fileList.length && sentPost) {
        await uploadPostImages(fileList, sentPost[0].id);
      }

      Alert.alert('Success', 'Post created successfully!');
      setText('');
      setFileList([]);
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'Failed to create post.');
    }
  };

  const deleteImage = (index: number) => {
    setFileList((prev) => prev.filter((_, idx) => idx !== index));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Top Header */}
      <View style={styles.topBar}>
        <Text style={styles.topTitle}>Create Post</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.closeButton}>x</Text>
        </TouchableOpacity>
      </View>

      {/* User Info Row */}
      <View style={styles.userRow}>
        <View style={styles.avatarPlaceholder} />
        <View>
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.userTitle}>{userTitle}</Text>
        </View>
        <TouchableOpacity style={styles.topPostButton} onPress={handleSubmit}>
          <Text style={styles.topPostButtonText}>Post</Text>
        </TouchableOpacity>
      </View>

      {/* Text Input */}
      <TextInput
        placeholder="What’s on your mind today?"
        placeholderTextColor="#AAA"
        multiline
        style={styles.simpleInput}
        value={text}
        onChangeText={(input) => {
          if (input.length <= MAX_CHAR) setText(input);
        }}
      />

      {/* Image Preview Thumbnails */}
      <View style={styles.thumbNailWrapper}>
        {fileList.map((file, idx) => (
          <View key={idx} style={styles.thumbNail}>
            <Image source={{ uri: file.uri }} style={{ width: 250, height: 250 }} />
            <TouchableOpacity onPress={() => deleteImage(idx)}>
              <Ionicons name="trash" size={24} color="red" />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Image Upload Icon */}
      <TouchableOpacity style={styles.imageUploadIcon} onPress={handlePickImage}>
        <Ionicons name="image" size={28} color="#000" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 54,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  topTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2a62d0',
  },
  closeButton: {
    fontSize: 24,
    color: '#2a62d0',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 10,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ccc',
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  userTitle: {
    fontSize: 12,
    color: '#666',
  },
  topPostButton: {
    marginLeft: 'auto',
    backgroundColor: '#2a62d0',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  topPostButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  simpleInput: {
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333',
    paddingTop: 12,
  },
  thumbNailWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  thumbNail: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  imageUploadIcon: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#fff',
    padding: 6,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
