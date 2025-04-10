import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import SignUp from '../signup';
import { useRouter } from 'expo-router';
import { completeSignUp } from '../../../api/users';
import { Alert, Platform } from 'react-native';
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

// Mock Platform
jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'ios',
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

    // 确认密码验证测试
    it('should show error when passwords do not match', async () => {
      const { getByTestId, getByText } = render(<SignUp />);
      
      const passwordInput = getByTestId('password-input');
      const confirmPasswordInput = getByTestId('confirm-password-input');
      
      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.changeText(confirmPasswordInput, 'differentpassword');
      fireEvent(confirmPasswordInput, 'blur');
      
      await waitFor(() => {
        expect(getByText('Passwords do not match')).toBeTruthy();
      });
    });

    it('should clear error when passwords match', async () => {
      const { getByTestId, queryByText } = render(<SignUp />);
      
      const passwordInput = getByTestId('password-input');
      const confirmPasswordInput = getByTestId('confirm-password-input');
      
      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.changeText(confirmPasswordInput, 'password123');
      fireEvent(confirmPasswordInput, 'blur');
      
      await waitFor(() => {
        expect(queryByText('Passwords do not match')).toBeNull();
      });
    });

    // 课程验证测试
    it('should show error when course is empty', async () => {
      const { getByTestId, getByText } = render(<SignUp />);
      
      const degreeInput = getByTestId('degree-input');
      fireEvent(degreeInput, 'blur');
      
      await waitFor(() => {
        expect(getByText('Course is required')).toBeTruthy();
      });
    });

    it('should clear error for valid course', async () => {
      const { getByTestId, queryByText } = render(<SignUp />);
      
      const degreeInput = getByTestId('degree-input');
      fireEvent.changeText(degreeInput, 'Computer Science');
      fireEvent(degreeInput, 'blur');
      
      await waitFor(() => {
        expect(queryByText('Course is required')).toBeNull();
      });
    });

    // 组合验证测试
    it('should validate all fields together', async () => {
      const { getByTestId, getByText } = render(<SignUp />);
      
      // Submit without filling any fields
      const signupButton = getByTestId('signup-button');
      
      await act(async () => {
        fireEvent.press(signupButton);
      });
      
      await waitFor(() => {
        expect(getByText('Minimum 3 characters')).toBeTruthy();
        expect(getByText('Email is required')).toBeTruthy();
        expect(getByText('Minimum 6 characters')).toBeTruthy();
        expect(getByText('Course is required')).toBeTruthy();
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

    // 返回按钮功能测试
    it('should call back button handler when back button is pressed', () => {
      const { getByTestId } = render(<SignUp />);
      
      const backButton = getByTestId('back-button');
      fireEvent.press(backButton);
      
      expect(mockRouter.replace).toHaveBeenCalledWith('../(auth)/signin');
    });

    // 提交按钮禁用状态测试
    it('should disable signup button when submitting', async () => {
      // Mock completeSignUp to delay resolution
      (completeSignUp as jest.Mock).mockImplementation(() => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve({ id: '1', email: 'test@example.com' });
          }, 100);
        });
      });

      const { getByTestId } = render(<SignUp />);
      
      // Fill all required fields
      fireEvent.changeText(getByTestId('username-input'), 'testuser');
      fireEvent.changeText(getByTestId('email-input'), 'test@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'password123');
      fireEvent.changeText(getByTestId('confirm-password-input'), 'password123');
      fireEvent.changeText(getByTestId('degree-input'), 'Computer Science');
      
      const signupButton = getByTestId('signup-button');
      
      await act(async () => {
        fireEvent.press(signupButton);
      });
      
      // Button should be disabled during submission
      expect(signupButton.props.accessibilityState.disabled).toBe(true);
      
      // Wait for submission to complete
      await waitFor(() => {
        expect(signupButton.props.accessibilityState.disabled).toBe(false);
      });
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

    // 表单文本首字母大写测试
    it('should capitalize first letter of degree input', () => {
      const { getByTestId } = render(<SignUp />);
      
      const degreeInput = getByTestId('degree-input');
      fireEvent.changeText(degreeInput, 'computer science');
      
      expect(degreeInput.props.value).toBe('Computer science');
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

    // 错误处理边界测试
    it('should handle unknown error during sign up', async () => {
      (completeSignUp as jest.Mock).mockRejectedValue(new Error());

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
        expect(Alert.alert).toHaveBeenCalledWith('Signup Failed', 'Unknown error');
      });
    });

    // 表单提交验证测试
    it('should prevent form submission when validation fails', async () => {
      const { getByTestId } = render(<SignUp />);
      
      // Submit form without filling any fields
      await act(async () => {
        fireEvent.press(getByTestId('signup-button'));
      });
      
      // Ensure API was not called
      expect(completeSignUp).not.toHaveBeenCalled();
    });
  });
}); 