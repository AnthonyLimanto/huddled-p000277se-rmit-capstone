import {
  Alert,
  Image,
  Modal,
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
import { useRouter } from 'expo-router'; // ✅ Router for redirect

const MAX_IMAGE_COUNT = 4;

export type ImageFileType = {
  uri: string;
  name: string;
  file: File;
};

export default function CreatePostScreen() {
  const router = useRouter(); // ✅ Init router
  const MAX_CHAR = 300;

  const [text, setText] = useState('');
  const [fileList, setFileList] = useState<ImageFileType[]>([]);
  const [profile, setProfile] = useState<{ username: string; degree: string } | null>(null);
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  const isImageReachLimit = useMemo(() => fileList.length >= MAX_IMAGE_COUNT, [fileList]);
  const dingSound = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    const loadSound = async () => {
      const { sound } = await Audio.Sound.createAsync(
        require('../../../assets/sounds/Post_sound.mp3')
      );
      dingSound.current = sound;
    };

    loadSound();

    return () => {
      if (dingSound.current) {
        dingSound.current.unloadAsync();
      }
    };
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: sessionData } = await supabase.auth.getUser();
      const userId = sessionData.user?.id;
      if (!userId) return;

      const { data, error } = await supabase
        .from('users')
        .select('username, degree')
        .eq('id', userId)
        .single();

      if (!error && data) {
        setProfile(data);
      }
    };

    fetchProfile();
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
      allowsMultipleSelection: true,
      selectionLimit: MAX_IMAGE_COUNT - fileList.length,
    });

    if (!result.canceled && result.assets?.length) {
      const selected = result.assets.slice(0, MAX_IMAGE_COUNT - fileList.length).map((asset, idx) => ({
        uri: asset.uri,
        name: `image-${Date.now()}-${idx}`,
        file: asset.file,
      })) as ImageFileType[];
      setFileList((prev) => [...prev, ...selected]);
    }
  };

  const handleSubmit = async () => {
    try {
      if (dingSound.current) await dingSound.current.replayAsync();

      if (text.trim() === '' && fileList.length === 0) {
        Alert.alert('Error', 'Please enter text or select an image to post.');
        return;
      }

      const currentUserId = await getSessionUser();
      const fileNameArr = fileList.map((file) => file.name);
      const sentPost = await createPost(currentUserId, text, fileNameArr.join(','));

      if (fileList.length && sentPost) {
        await uploadPostImages(fileList, sentPost[0].id);
      }

      setText('');
      setFileList([]);
      setSuccessModalVisible(true);

      setTimeout(() => {
        setSuccessModalVisible(false);
        router.replace('/(home)'); // Redirect after modal closes
      }, 2000);
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
      <View style={styles.header}>
        <Text style={styles.title}>Create Post</Text>
      </View>

      <View style={styles.createContainer}>
        {profile && (
          <View style={styles.userBlock}>
            <View style={styles.avatar} />
            <View>
              <Text style={styles.name}>{profile.username}</Text>
              <Text style={styles.degree}>{profile.degree}</Text>
            </View>
          </View>
        )}

        <TextInput
          placeholder="What's on your mind today?"
          placeholderTextColor="#999"
          multiline
          style={styles.postInput}
          value={text}
          numberOfLines={4}
          onChangeText={(input) => {
            if (input.length <= MAX_CHAR) setText(input);
          }}
        />

        <View style={styles.charCounterContainer}>
          <Text style={[styles.charCounter, text.length >= MAX_CHAR && { color: 'red' }]}>
            {text.length} / {MAX_CHAR}
          </Text>
        </View>

        <View style={styles.imageButtonRow}>
          <TouchableOpacity onPress={handlePickImage}>
            <Ionicons name="image" size={28} color="#000" />
          </TouchableOpacity>
        </View>

        <View style={styles.thumbNailWrapper}>
          {fileList.map((file, idx) => (
            <View key={idx} style={styles.thumbNail}>
              <Image source={{ uri: file.uri }} style={{ width: 80, height: 80 }} />
              <TouchableOpacity onPress={() => deleteImage(idx)}>
                <Ionicons name="trash" size={20} color="red" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={styles.postButtonContainer}>
          <TouchableOpacity style={styles.postButton} onPress={handleSubmit}>
            <Ionicons name="send" size={18} color="white" style={{ marginRight: 6 }} />
            <Text style={styles.postButtonText}>Post</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Post success modal */}
      <Modal transparent visible={successModalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalText}>Post created successfully!</Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  title: { fontSize: 28, fontWeight: 'bold', color: '#085DB7' },
  createContainer: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
  },
  userBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ccc',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1D1D1D',
  },
  degree: {
    fontSize: 13,
    color: '#666',
  },
  postInput: {
    height: 150,
    fontSize: 16,
    textAlignVertical: 'top',
    padding: 12,
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    marginBottom: 8,
  },
  charCounterContainer: {
    alignItems: 'flex-end',
    marginBottom: 10,
    paddingRight: 4,
  },
  charCounter: {
    fontSize: 14,
    color: '#888',
  },
  imageButtonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 10,
  },
  thumbNailWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  thumbNail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginRight: 10,
    marginBottom: 10,
  },
  postButtonContainer: {
    paddingTop: 20,
  },
  postButton: {
    backgroundColor: '#0066CC',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 24,
    alignSelf: 'center',
  },
  postButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000099',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 8,
  },
  modalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#075DB6',
  },
});
