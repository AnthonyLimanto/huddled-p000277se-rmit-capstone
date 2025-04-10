import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import CreatePostScreen from '../create';
import { createPost } from '../../../api/posts';
import { supabase } from '../../../api/supabase';

// Mock Alert.alert
jest.spyOn(Alert, 'alert');

// Mock console.error
const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

describe('CreatePostScreen Component', () => {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Restore console.error after tests
  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  // Component rendering tests
  describe('Component Rendering', () => {
    it('should render all major UI elements correctly', () => {
      const { getByText, getByPlaceholderText } = render(<CreatePostScreen />);
      
      // Verify title
      expect(getByText('Create Post')).toBeTruthy();
      
      // Verify input field
      expect(getByPlaceholderText("What's on your mind?")).toBeTruthy();
      
      // Verify media options
      expect(getByText('Photo')).toBeTruthy();
      expect(getByText('Video')).toBeTruthy();
      expect(getByText('File')).toBeTruthy();
      
      // Verify privacy options
      expect(getByText('Who can see this?')).toBeTruthy();
      expect(getByText('Everyone')).toBeTruthy();
      
      // Verify post button
      expect(getByText('Post')).toBeTruthy();
    });
  });

  // State management tests
  describe('State Management', () => {
    it('should initialize with empty text', () => {
      const { getByPlaceholderText } = render(<CreatePostScreen />);
      
      const textInput = getByPlaceholderText("What's on your mind?");
      expect(textInput.props.value).toBe('');
    });

    it('should update text state when input changes', () => {
      const { getByPlaceholderText } = render(<CreatePostScreen />);
      
      const textInput = getByPlaceholderText("What's on your mind?");
      fireEvent.changeText(textInput, 'Test post content');
      
      expect(textInput.props.value).toBe('Test post content');
    });
  });

  // User session tests
  describe('User Session', () => {
    it('should get user session correctly when logged in', async () => {
      const { getByText } = render(<CreatePostScreen />);
      
      // Trigger the operation to get user session
      fireEvent.press(getByText('Post'));
      
      // Verify supabase.auth.getUser was called
      await waitFor(() => {
        expect(supabase.auth.getUser).toHaveBeenCalled();
      });
    });

    it('should handle error when user is not logged in', async () => {
      // Mock scenario where user is not logged in
      (supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
        data: { user: null },
        error: { message: 'Not authenticated' }
      });
      
      const { getByText } = render(<CreatePostScreen />);
      
      // Trigger the post operation
      fireEvent.press(getByText('Post'));
      
      // Verify error handling
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Error',
          'Failed to create post.'
        );
      });
    });
  });

  // Post creation tests
  describe('Post Creation', () => {
    it('should handle successful post creation', async () => {
      // Mock logged-in user and successful post creation
      (supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
        data: { user: { id: 'test-user-id' } },
        error: null
      });
      
      const { getByText, getByPlaceholderText } = render(<CreatePostScreen />);
      
      // Enter post content
      const textInput = getByPlaceholderText("What's on your mind?");
      fireEvent.changeText(textInput, 'Test post content');
      
      // Click publish
      fireEvent.press(getByText('Post'));
      
      // Verify createPost was called correctly
      await waitFor(() => {
        expect(createPost).toHaveBeenCalledWith(
          'test-user-id',
          'Test post content',
          'default'
        );
      });
      
      // Verify success message
      expect(Alert.alert).toHaveBeenCalledWith(
        'Success', 
        'Post created successfully!'
      );
      
      // Verify input field was cleared
      expect(textInput.props.value).toBe('');
    });

    it('should handle post creation failure', async () => {
      // Mock post creation failure
      (createPost as jest.Mock).mockRejectedValueOnce(new Error('Failed to create post'));
      
      const { getByText, getByPlaceholderText } = render(<CreatePostScreen />);
      
      // Enter post content
      const textInput = getByPlaceholderText("What's on your mind?");
      fireEvent.changeText(textInput, 'Test post content');
      
      // Click publish
      fireEvent.press(getByText('Post'));
      
      // Verify error handling
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Error',
          'Failed to create post.'
        );
      });
      
      // Verify console error log
      await waitFor(() => {
        expect(console.error).toHaveBeenCalled();
      });
    });
  });

  // User interaction tests
  describe('User Interactions', () => {
    it('should trigger handleSubmit when post button is clicked', async () => {
      const { getByText } = render(<CreatePostScreen />);
      
      // Click the post button
      fireEvent.press(getByText('Post'));
      
      // Verify supabase.auth.getUser was called (indicating handleSubmit was triggered)
      await waitFor(() => {
        expect(supabase.auth.getUser).toHaveBeenCalled();
      });
    });

    it('should update UI when text is entered', () => {
      const { getByPlaceholderText } = render(<CreatePostScreen />);
      
      // Get input field and enter text
      const textInput = getByPlaceholderText("What's on your mind?");
      fireEvent.changeText(textInput, 'New post content');
      
      // Verify UI update
      expect(textInput.props.value).toBe('New post content');
    });
  });
}); 