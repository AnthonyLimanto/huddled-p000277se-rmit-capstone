import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import CreatePostScreen from '../create';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { createPost } from '../../../api/posts';
import { supabase } from '../../../api/supabase';
import { uploadPostImages } from '../../../helper/bucketHelper';

describe('CreatePostScreen', () => {
  // Reset all mock functions before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // 1. Component rendering test
  it('should render all UI elements correctly', () => {
    const { getByPlaceholderText, getByText, getAllByLabelText  } = render(<CreatePostScreen />);
    
    // Check if input box is rendered
    expect(getByPlaceholderText("What's on your mind?")).toBeTruthy();
    
    // Check if upload image button is rendered
    expect(getByText('Photo')).toBeTruthy();
    
    // Check if character count is rendered
    expect(getByText('0 / 300')).toBeTruthy();
    
    // Check if post button is rendered
    expect(getByText('Post')).toBeTruthy();
  });

  // 2. Text input test
  describe('Text input test', () => {
    // Case 1: Input text less than 300 characters
    it('should correctly update state and display when text is less than 300 characters', () => {
      const { getByPlaceholderText, getByText } = render(<CreatePostScreen />);
      const input = getByPlaceholderText("What's on your mind?");
      
      fireEvent.changeText(input, 'Hello world');
      
      // Check if character counter is updated
      expect(getByText('11 / 300')).toBeTruthy();
    });
    
    // Case 2: Input text more than 300 characters
    it('should not update state when input exceeds 300 characters', () => {
      const { getByPlaceholderText, getByText } = render(<CreatePostScreen />);
      const input = getByPlaceholderText("What's on your mind?");
      
      // Create a 301 character string
      const longText = 'a'.repeat(301);
      
      // First input 300 characters
      fireEvent.changeText(input, 'a'.repeat(300));
      expect(getByText('300 / 300')).toBeTruthy();
      
      // Try to input 301 characters
      fireEvent.changeText(input, longText);
      
      // State should remain at 300 characters
      expect(getByText('300 / 300')).toBeTruthy();
    });
  });

  // 3. Image selection logic test
  describe('Image selection logic test', () => {
    // Case 3: Successfully upload images (within limit)
    it('should add to fileList when images are successfully uploaded within limit', async () => {
      // Mock ImagePicker to return two images
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValueOnce({
        canceled: false,
        assets: [
          { uri: 'file://test1.jpg', fileName: 'test1.jpg' },
          { uri: 'file://test2.jpg', fileName: 'test2.jpg' }
        ]
      });
      
      const { getByText, getAllByLabelText  } = render(<CreatePostScreen />);
      
      // Click the Photo button
      const photoButton = getByText('Photo');
      await act(async () => {
        fireEvent.press(photoButton);
      });
      
      // Check if there are delete image buttons (indicating images were added)
      const trashIcons = getAllByLabelText ('trash');
      expect(trashIcons.length).toBe(2);
    });
    
    // Case 4: Exceed maximum image count
    it('should show an alert when maximum image count is exceeded', async () => {
      // First mock that there are already 3 images
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValueOnce({
        canceled: false,
        assets: [
          { uri: 'file://test1.jpg', fileName: 'test1.jpg' },
          { uri: 'file://test2.jpg', fileName: 'test2.jpg' },
          { uri: 'file://test3.jpg', fileName: 'test3.jpg' }
        ]
      });
      
      const { getByText } = render(<CreatePostScreen />);
      
      // Click the Photo button to add the first 3 images
      await act(async () => {
        fireEvent.press(getByText('Photo'));
      });
      
      // Mock trying to add 2 more images
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValueOnce({
        canceled: false,
        assets: [
          { uri: 'file://test4.jpg', fileName: 'test4.jpg' },
          { uri: 'file://test5.jpg', fileName: 'test5.jpg' }
        ]
      });
      
      // Click the Photo button again
      await act(async () => {
        fireEvent.press(getByText('Photo'));
      });
      
      // Check if Alert.alert is called
      expect(Alert.alert).toHaveBeenCalledWith('Limit reached', 'You can only upload 4 images.');
    });
  });

  // 4. Delete image test
  it('should remove the corresponding image from fileList when deleted', async () => {
    // Mock selecting two images
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValueOnce({
      canceled: false,
      assets: [
        { uri: 'file://test1.jpg', fileName: 'test1.jpg' },
        { uri: 'file://test2.jpg', fileName: 'test2.jpg' }
      ]
    });
    
    const { getByText, getAllByLabelText  } = render(<CreatePostScreen />);
    
    // Click the Photo button to add images
    await act(async () => {
      fireEvent.press(getByText('Photo'));
    });
    
    // Confirm there are two images
    let trashIcons = getAllByLabelText ('trash');
    expect(trashIcons.length).toBe(2);
    
    // Click the first delete button
    await act(async () => {
      fireEvent.press(trashIcons[0]);
    });
    
    // Confirm now there is only one image
    trashIcons = getAllByLabelText ('trash');
    expect(trashIcons.length).toBe(1);
  });

  // 5. Post submission test
  describe('Post submission test', () => {
    // Case 6: Submit empty content
    it('should not trigger createPost when content is empty', async () => {
      const { getByText } = render(<CreatePostScreen />);
      
      // Mock clicking the Post button
      await act(async () => {
        fireEvent.press(getByText('Post'));
      });
      
      // createPost should not be called
      expect(createPost).not.toHaveBeenCalled();
    });
    
    // Case 7: Successfully submit text content
    it('should call relevant APIs when text content is successfully submitted', async () => {
      // Mock successful post creation
      (createPost as jest.Mock).mockResolvedValueOnce([{ id: 'new-post-id' }]);
      
      const { getByPlaceholderText, getByText } = render(<CreatePostScreen />);
      
      // Input text
      fireEvent.changeText(getByPlaceholderText("What's on your mind?"), 'Test post content');
      
      // Click the Post button
      await act(async () => {
        fireEvent.press(getByText('Post'));
      });
      
      // Check API calls
      expect(supabase.auth.getUser).toHaveBeenCalled();
      expect(createPost).toHaveBeenCalledWith('test-user-id', 'Test post content', '');
      expect(Alert.alert).toHaveBeenCalledWith('Success', 'Post created successfully!');
    });
    
    // Case 8: Successfully submit content with image
    it('should call image upload API when content with image is successfully submitted', async () => {
      // Mock image selection
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValueOnce({
        canceled: false,
        assets: [{ uri: 'file://test.jpg', fileName: 'test.jpg' }]
      });
      
      // Mock successful post creation
      (createPost as jest.Mock).mockResolvedValueOnce([{ id: 'new-post-id' }]);
      
      const { getByPlaceholderText, getByText } = render(<CreatePostScreen />);
      
      // Select images
      await act(async () => {
        fireEvent.press(getByText('Photo'));
      });
      
      // Input text
      fireEvent.changeText(getByPlaceholderText("What's on your mind?"), 'Test post with image');
      
      // Click the Post button
      await act(async () => {
        fireEvent.press(getByText('Post'));
      });
      
      // Check API calls
      expect(supabase.auth.getUser).toHaveBeenCalled();
      expect(createPost).toHaveBeenCalled();
      expect(uploadPostImages).toHaveBeenCalled();
      expect(Alert.alert).toHaveBeenCalledWith('Success', 'Post created successfully!');
    });
    
    // Case 9: API throws error
    it('should show error notification when post creation API throws an error', async () => {
      // Mock createPost throwing an error
      (createPost as jest.Mock).mockRejectedValueOnce(new Error('API Error'));
      
      const { getByPlaceholderText, getByText } = render(<CreatePostScreen />);
      
      // Input text
      fireEvent.changeText(getByPlaceholderText("What's on your mind?"), 'Test error case');
      
      // Click the Post button
      await act(async () => {
        fireEvent.press(getByText('Post'));
      });
      
      // Check error notification
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to create post.');
    });
  });
}); 