import React, { useMemo, useState } from 'react';
import { Alert, Image, SafeAreaView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createPost } from '../../api/posts';
import { supabase } from '../../api/supabase';
import { uploadPostImages } from '../../helper/bucketHelper';
import * as ImagePicker from 'expo-image-picker';

const MAX_IMAGE_COUNT = 4;

export type ImageFileType = {
  uri: string;
  name: string;
  file: File;
};

export default function CreatePostScreen() {
  const MAX_CHAR = 300;
  const [text, setText] = useState("");
  const [postFile, setPostFile] = useState<string | null>(null);

  const [fileList, setFileList] = useState<ImageFileType[]>([]);

  const isImageReachLimit = useMemo(() => fileList.length >= MAX_IMAGE_COUNT, [fileList]);

  const getSessionUser = async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user?.id) {
      throw new Error('No user session found');
    }
    return data.user.id;
  };

  // Need to refactor later to consolidate with the pfp image picker
  const handlePickImage = async () => {
    if (isImageReachLimit) {
      Alert.alert('Limit reached', `You can only upload ${MAX_IMAGE_COUNT} images.`);
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true, // Include base64 data
      allowsMultipleSelection: true,
      selectionLimit: MAX_IMAGE_COUNT - fileList.length, // Limit the number of images
    });

    console.log("Image picker result:", result);

    if (!result.canceled && result.assets && result.assets.length > 0) {
      if (result.assets.length + fileList.length > MAX_IMAGE_COUNT) {
        Alert.alert('Limit reached', `You can only upload ${MAX_IMAGE_COUNT} images.`);
        return;
      }

      const uriArr = result.assets.map((asset, idx) => {
        const suffix = (asset.fileName || 'x.png').split('.').pop();
        return {
          uri: asset.uri,
          name: `image-${Date.now()}-${idx}`,
          file: asset.file
        };
      }) as ImageFileType[];
      setFileList((prev) => [...prev, ...uriArr]);
    }
  };

  const handleSubmit = async () => {
    try {
      if (text.trim() === "" && fileList.length === 0) {
        console.log('Please enter text or select an image to post.');
        return
      }
      const currentUserId = await getSessionUser();
      const fileNameArr = (fileList || []).map((file) => file.name);
      const sentPost = await createPost(currentUserId, text, fileNameArr.join(','));
      console.log("Post file created:", postFile, sentPost);
      if (fileList?.length && sentPost) {
        await uploadPostImages(fileList, sentPost[0].id); // ✅ Upload image to bucket
      }
      console.log("Sent post:", sentPost);

      Alert.alert('Success', 'Post created successfully!');
      setText("");
    } catch (error) {
      console.error("Error creating post:", error);
      Alert.alert('Error', 'Failed to create post.');
    }
  };

  const deleteImage = (index: number) => {
    setFileList((prev) => prev.filter((_, idx) => idx !== index));
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.title}>Create Post</Text>
      </View>

      <View style={styles.createContainer}>
        <View>
          <TextInput
            placeholder="What's on your mind?"
            placeholderTextColor="#999"
            multiline
            style={styles.postInput}
            value={text}
            numberOfLines={4}
            onChangeText={(input) => {
              if (input.length <= MAX_CHAR) setText(input);
            }}
          />
        </View>
        <View style={styles.charCounterContainer}>
          <Text style={[styles.charCounter, text.length >= MAX_CHAR && { color: 'red' }]}>
            {text.length} / {MAX_CHAR}
          </Text>
        </View>

        <View style={styles.mediaOptions}>
          <TouchableOpacity
            style={styles.mediaButton}
            onPress={handlePickImage}
          >
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
        {/* Show thumbnail preview */}
        <View style={styles.thumbNailWrapper}>
          {
            (fileList || []).map((file, idx) => {
              return (
                <View
                  key={idx}
                  style={styles.thumbNail}
                >
                  <Image
                    key={idx}
                    source={{ uri: file.uri }}
                    style={{ width: 250, height: 250 }}
                  />
                  <TouchableOpacity
                    onPress={() => deleteImage(idx)}
                  >
                    <Ionicons name='trash' size={24} color='red' />
                  </TouchableOpacity>
                </View>
              );
            })
          }
        </View>
        {/* {postFile && (
          <Image
            source={{ uri: `data:image/png;base64,${postFile}` }}
            style={{ width: 250, height: 250, marginTop: 10 }}
          />
        )} */}
        <View style={styles.divider} />

        <View style={styles.privacySelector}>
          <Text style={styles.privacyLabel}>Who can see this?</Text>
          <TouchableOpacity style={styles.privacyOption}>
            <Ionicons name="globe-outline" size={20} color="#333" />
            <Text style={styles.privacyText}>Everyone</Text>
            <Ionicons name="chevron-down" size={20} color="#333" />
          </TouchableOpacity>
        </View>

        <View style={styles.postButtonContainer}>
          <TouchableOpacity style={styles.postButton} onPress={handleSubmit}>
            <Text style={styles.postButtonText}>Post</Text>
          </TouchableOpacity>
        </View>
      </View>
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
  title: { fontSize: 28, fontWeight: 'bold' },
  createContainer: {
    flex: 1,
    padding: 16,
    overflowY: 'auto'
  },
  postInput: {
    height: 150,
    fontSize: 18,
    textAlignVertical: 'top',
    padding: 12,
    backgroundColor: '#F8F8F8',
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
  thumbNailWrapper: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  thumbNail: {
    display: 'flex',
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center'
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
  postButtonContainer:{
    padding: 20,
    borderTopWidth: 1,
    borderColor: '#EEE',
    marginTop: 20,
  },
  postButton: {
    backgroundColor: '#0066CC',
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 'auto',
    justifyContent: 'center',
    paddingVertical: 12,
    flexDirection: 'row',
  },
  postButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
