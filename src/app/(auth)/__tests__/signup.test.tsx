import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import SignUp from '../signup';
import { useRouter } from 'expo-router';
import { completeSignUp } from '../../../api/users';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

// Mock expo-image-picker
jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn().mockResolvedValue({
    canceled: false,
    assets: [{
      uri: 'file://test/image.jpg',
    }],
  }),
  MediaTypeOptions: {
    Images: 'Images',
  },
}));

// Mock users API
jest.mock('../../../api/users', () => ({
  completeSignUp: jest.fn(),
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('SignUp Component', () => {
  const mockRouter = {
    replace: jest.fn(),
  };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    jest.clearAllMocks();
  });

  // 表单验证测试
  describe('Form Validation', () => {
    it('should show error when email is empty', async () => {
      const { getByTestId, getByText } = render(<SignUp />);
      
      const emailInput = getByTestId('email-input');
      fireEvent(emailInput, 'blur');
      
      await waitFor(() => {
        expect(getByText('Email is required')).toBeTruthy();
      });
    });

    it('should show error for invalid email format', async () => {
      const { getByTestId, getByText } = render(<SignUp />);
      
      const emailInput = getByTestId('email-input');
      fireEvent.changeText(emailInput, 'invalid-email');
      fireEvent(emailInput, 'blur');
      
      await waitFor(() => {
        expect(getByText('Invalid email format')).toBeTruthy();
      });
    });

    it('should clear error for valid email', async () => {
      const { getByTestId, queryByText } = render(<SignUp />);
      
      const emailInput = getByTestId('email-input');
      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent(emailInput, 'blur');
      
      await waitFor(() => {
        expect(queryByText('Invalid email format')).toBeNull();
      });
    });

    it('should show error when password is empty', async () => {
      const { getByTestId, getByText } = render(<SignUp />);
      
      const passwordInput = getByTestId('password-input');
      fireEvent(passwordInput, 'blur');
      
      await waitFor(() => {
        expect(getByText('Password is required')).toBeTruthy();
      });
    });

    it('should show error when password is too short', async () => {
      const { getByTestId, getByText } = render(<SignUp />);
      
      const passwordInput = getByTestId('password-input');
      fireEvent.changeText(passwordInput, '12345');
      fireEvent(passwordInput, 'blur');
      
      await waitFor(() => {
        expect(getByText('Minimum 6 characters')).toBeTruthy();
      });
    });

    it('should show error when username is empty', async () => {
      const { getByTestId, getByText } = render(<SignUp />);
      
      const usernameInput = getByTestId('username-input');
      fireEvent(usernameInput, 'blur');
      
      await waitFor(() => {
        expect(getByText('Username is required')).toBeTruthy();
      });
    });

    it('should show error when username is too short', async () => {
      const { getByTestId, getByText } = render(<SignUp />);
      
      const usernameInput = getByTestId('username-input');
      fireEvent.changeText(usernameInput, 'us');
      fireEvent(usernameInput, 'blur');
      
      await waitFor(() => {
        expect(getByText('Minimum 3 characters')).toBeTruthy();
      });
    });

    it('should clear username error for valid username', async () => {
      const { getByTestId, queryByText } = render(<SignUp />);
      
      const usernameInput = getByTestId('username-input');
      fireEvent.changeText(usernameInput, 'validuser');
      fireEvent(usernameInput, 'blur');
      
      await waitFor(() => {
        expect(queryByText('Username is required')).toBeNull();
        expect(queryByText('Minimum 3 characters')).toBeNull();
      });
    });
  });

  // UI 组件测试
  describe('UI Components', () => {
    it('should render all necessary elements', () => {
      const { getByTestId } = render(<SignUp />);
      
      expect(getByTestId('username-input')).toBeTruthy();
      expect(getByTestId('email-input')).toBeTruthy();
      expect(getByTestId('password-input')).toBeTruthy();
      expect(getByTestId('confirm-password-input')).toBeTruthy();
      expect(getByTestId('degree-input')).toBeTruthy();
      expect(getByTestId('signup-button')).toBeTruthy();
      expect(getByTestId('login-link')).toBeTruthy();
    });

    it('should not show error messages initially', () => {
      const { queryByText } = render(<SignUp />);
      
      expect(queryByText('Email is required')).toBeNull();
      expect(queryByText('Password is required')).toBeNull();
    });

    it('should navigate to login page when login link is pressed', () => {
      const { getByTestId } = render(<SignUp />);
      
      const loginLink = getByTestId('login-link');
      fireEvent.press(loginLink);
      
      expect(mockRouter.replace).toHaveBeenCalledWith('../(auth)/signin');
    });

    it('should call handlePickImage when upload button is pressed', async () => {
      const { getByTestId } = render(<SignUp />);
      
      const uploadButton = getByTestId('upload-button');
      await act(async () => {
        fireEvent.press(uploadButton);
      });
      
      expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalledWith({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });
    });

    it('should update profile picture state when image is picked', async () => {
      const { getByTestId } = render(<SignUp />);
      const uploadButton = getByTestId('upload-button');
      
      await act(async () => {
        fireEvent.press(uploadButton);
      });
      
      const previewImage = getByTestId('pfp-preview');
      expect(previewImage.props.source.uri).toBe('file://test/image.jpg');
    });

    it('should not update state if image picking is cancelled', async () => {
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValueOnce({
        canceled: true,
        assets: null,
      });
      
      const { getByTestId, queryByTestId } = render(<SignUp />);
      const uploadButton = getByTestId('upload-button');
      
      await act(async () => {
        fireEvent.press(uploadButton);
      });
      
      expect(queryByTestId('pfp-preview')).toBeNull();
    });
  });

  // 表单输入测试
  describe('Form Input', () => {
    it('should update email state when input changes', () => {
      const { getByTestId } = render(<SignUp />);
      
      const emailInput = getByTestId('email-input');
      fireEvent.changeText(emailInput, 'test@example.com');
      
      expect(emailInput.props.value).toBe('test@example.com');
    });

    it('should update password state when input changes', () => {
      const { getByTestId } = render(<SignUp />);
      
      const passwordInput = getByTestId('password-input');
      fireEvent.changeText(passwordInput, 'password123');
      
      expect(passwordInput.props.value).toBe('password123');
    });

    it('should trigger validation on blur', async () => {
      const { getByTestId, getByText } = render(<SignUp />);
      
      const emailInput = getByTestId('email-input');
      fireEvent(emailInput, 'blur');
      
      await waitFor(() => {
        expect(getByText('Email is required')).toBeTruthy();
      });
    });
  });

  // 业务逻辑测试
  describe('Sign Up Logic', () => {
    it('should handle successful sign up', async () => {
      const mockUser = { id: '1', email: 'test@example.com' };
      (completeSignUp as jest.Mock).mockResolvedValue(mockUser);

      const { getByTestId } = render(<SignUp />);
      
      // Fill in form
      fireEvent.changeText(getByTestId('username-input'), 'testuser');
      fireEvent.changeText(getByTestId('email-input'), 'test@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'password123');
      fireEvent.changeText(getByTestId('confirm-password-input'), 'password123');
      fireEvent.changeText(getByTestId('degree-input'), 'Computer Science');

      // Submit form
      await act(async () => {
        fireEvent.press(getByTestId('signup-button'));
      });

      await waitFor(() => {
        expect(completeSignUp).toHaveBeenCalledWith(
          'test@example.com',
          'password123',
          'testuser',
          'Computer Science',
          null
        );
        expect(Alert.alert).toHaveBeenCalledWith('Success', 'Account created successfully!');
        expect(mockRouter.replace).toHaveBeenCalledWith('/(home)');
      });
    });

    it('should handle sign up failure', async () => {
      const errorMessage = 'Sign up failed';
      (completeSignUp as jest.Mock).mockRejectedValue(new Error(errorMessage));

      const { getByTestId } = render(<SignUp />);
      
      // Fill in form
      fireEvent.changeText(getByTestId('username-input'), 'testuser');
      fireEvent.changeText(getByTestId('email-input'), 'test@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'password123');
      fireEvent.changeText(getByTestId('confirm-password-input'), 'password123');
      fireEvent.changeText(getByTestId('degree-input'), 'Computer Science');

      // Submit form
      await act(async () => {
        fireEvent.press(getByTestId('signup-button'));
      });

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Signup Failed', errorMessage);
      });
    });
  });
}); 