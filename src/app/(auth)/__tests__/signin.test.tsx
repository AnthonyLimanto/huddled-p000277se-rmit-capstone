import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import SignIn from '../signin';
import { useRouter } from 'expo-router';
import { supabase } from '../../../api/supabase';
import { jest } from '@jest/globals';


// Type definitions
type SupabaseSignInResponse = {
    error: { message: string } | null;
    data?: {
        user: any;
        session: any;
    };
    };

describe('SignIn Component', () => {
    const mockRouter = {
      replace: jest.fn(),
    };
  
    beforeEach(() => {
      // Reset mocks directly instead of calling mockReturnValue
      jest.clearAllMocks();
      // Ensure useRouter returns the mock we need
      (useRouter as jest.Mock).mockReturnValue(mockRouter);
      // Reset mock timers before each test
      jest.useFakeTimers();
    });
  
    afterEach(() => {
      jest.useRealTimers();
    });

// 1. Form Validation Tests
describe('Form Validation', () => {
    it('should show error when email is empty', async () => {
        const { getByText, getByPlaceholderText } = render(<SignIn />);
        
        const emailInput = getByPlaceholderText('Email');
        fireEvent(emailInput, 'blur');
        
        await waitFor(() => {
        expect(getByText('Email is required')).toBeTruthy();
        });
    });

    it('should show error for invalid email format', async () => {
        const { getByText, getByPlaceholderText } = render(<SignIn />);
        
        const emailInput = getByPlaceholderText('Email');
        fireEvent.changeText(emailInput, 'test');
        fireEvent(emailInput, 'blur');
        
        await waitFor(() => {
        expect(getByText('Please enter a valid email address')).toBeTruthy();
        });
    });

    it('should clear error for valid email', async () => {
        const { queryByText, getByPlaceholderText } = render(<SignIn />);
        
        const emailInput = getByPlaceholderText('Email');
        fireEvent.changeText(emailInput, 'test@example.com');
        fireEvent(emailInput, 'blur');
        
        await waitFor(() => {
        expect(queryByText('Email is required')).toBeNull();
        expect(queryByText('Please enter a valid email address')).toBeNull();
        });
    });

    it('should show error when password is empty', async () => {
        const { getByText, getByPlaceholderText } = render(<SignIn />);
        
        const passwordInput = getByPlaceholderText('Password');
        fireEvent(passwordInput, 'blur');
        
        await waitFor(() => {
        expect(getByText('Password is required')).toBeTruthy();
        });
    });

    it('should clear error when password is entered', async () => {
        const { queryByText, getByPlaceholderText } = render(<SignIn />);
        
        const passwordInput = getByPlaceholderText('Password');
        fireEvent.changeText(passwordInput, 'password123');
        fireEvent(passwordInput, 'blur');
        
        await waitFor(() => {
        expect(queryByText('Password is required')).toBeNull();
        });
    });
    });

  // 2. UI Rendering Tests
  describe('UI Rendering', () => {
    it('should render all necessary elements', () => {
      const { getByPlaceholderText, getByText, getByTestId } = render(<SignIn />);
      
      expect(getByPlaceholderText('Email')).toBeTruthy();
      expect(getByPlaceholderText('Password')).toBeTruthy();
      expect(getByText('Login')).toBeTruthy();
      expect(getByTestId('forgot-password')).toBeTruthy();
      expect(getByText("Don't have an Account?")).toBeTruthy();
      expect(getByTestId('signup-link')).toBeTruthy();
      expect(getByTestId('login-button')).toBeTruthy();
    });

    it('should not show error messages initially', () => {
      const { queryByText } = render(<SignIn />);
      
      expect(queryByText('Email is required')).toBeNull();
      expect(queryByText('Password is required')).toBeNull();
    });
  });

  // 3. User Interaction Tests
  describe('User Interactions', () => {
    it('should call handleLogin when login button is pressed', async () => {
      // @ts-ignore
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({ 
        data: { user: {}, session: {} },
        error: null
      });
      
      const { getByTestId, getByPlaceholderText } = render(<SignIn />);
      
      const emailInput = getByPlaceholderText('Email');
      const passwordInput = getByPlaceholderText('Password');
      const loginButton = getByTestId('login-button');
      
      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'password123');
      
      await act(async () => {
        fireEvent.press(loginButton);
      });
      
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should navigate to signup page when "Sign Up Here" is pressed', () => {
      const { getByTestId } = render(<SignIn />);
      
      const signUpLink = getByTestId('signup-link');
      fireEvent.press(signUpLink);
      
      expect(mockRouter.replace).toHaveBeenCalledWith('../(auth)/signup');
    });

    it('should handle forgot password click', () => {
      const { getByTestId } = render(<SignIn />);
      
      const forgotPasswordLink = getByTestId('forgot-password');
      fireEvent.press(forgotPasswordLink);
      
      // Since there's no specific handler defined in the component,
      // we're just verifying it can be clicked without errors
      expect(forgotPasswordLink).toBeTruthy();
    });
  });

  // 4. State Update Tests
  describe('State Updates', () => {
    it('should update email state when input changes', () => {
      const { getByPlaceholderText } = render(<SignIn />);
      
      const emailInput = getByPlaceholderText('Email');
      fireEvent.changeText(emailInput, 'test@example.com');
      
      expect(emailInput.props.value).toBe('test@example.com');
    });

    it('should update password state when input changes', () => {
      const { getByPlaceholderText } = render(<SignIn />);
      
      const passwordInput = getByPlaceholderText('Password');
      fireEvent.changeText(passwordInput, 'password123');
      
      expect(passwordInput.props.value).toBe('password123');
    });

    it('should trigger validation on email blur', async () => {
      const { getByText, getByPlaceholderText } = render(<SignIn />);
      
      const emailInput = getByPlaceholderText('Email');
      fireEvent(emailInput, 'blur');
      
      await waitFor(() => {
        expect(getByText('Email is required')).toBeTruthy();
      });
    });

    it('should trigger validation on password blur', async () => {
      const { getByText, getByPlaceholderText } = render(<SignIn />);
      
      const passwordInput = getByPlaceholderText('Password');
      fireEvent(passwordInput, 'blur');
      
      await waitFor(() => {
        expect(getByText('Password is required')).toBeTruthy();
      });
    });
  });

  // 5. Login Logic Tests
  describe('Login Logic', () => {
    it('should show success modal and navigate on successful login', async () => {
      // @ts-ignore
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({ 
        data: { user: {}, session: {} },
        error: null
      });
      
      const { getByTestId, getByPlaceholderText, getByText, queryByText } = render(<SignIn />);
      
      const emailInput = getByPlaceholderText('Email');
      const passwordInput = getByPlaceholderText('Password');
      const loginButton = getByTestId('login-button');
      
      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'password123');
      
      await act(async () => {
        fireEvent.press(loginButton);
      });
      
      // Success modal should be visible
      expect(getByText('Login Successful!')).toBeTruthy();
      
      // Advance timers to simulate setTimeout
      await act(async () => {
        jest.advanceTimersByTime(2000);
      });
      
      // After timeout, should navigate and modal should close
      expect(mockRouter.replace).toHaveBeenCalledWith('/(home)');
      expect(queryByText('Login Successful!')).toBeNull();
    });

    it('should show email not confirmed error message', async () => {
      // @ts-ignore
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Email not confirmed' }
      });
      
      const { getByTestId, getByPlaceholderText, getByText } = render(<SignIn />);
      
      const emailInput = getByPlaceholderText('Email');
      const passwordInput = getByPlaceholderText('Password');
      const loginButton = getByTestId('login-button');
      
      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'password123');
      
      await act(async () => {
        fireEvent.press(loginButton);
      });
      
      expect(getByText('Email pending verification. Check your email to verify.')).toBeTruthy();
    });

    it('should show invalid credentials error message', async () => {
      // @ts-ignore
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Invalid login credentials' }
      });
      
      const { getByTestId, getByPlaceholderText, getByText } = render(<SignIn />);
      
      const emailInput = getByPlaceholderText('Email');
      const passwordInput = getByPlaceholderText('Password');
      const loginButton = getByTestId('login-button');
      
      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'password123');
      
      await act(async () => {
        fireEvent.press(loginButton);
      });
      
      expect(getByText('Incorrect email or password')).toBeTruthy();
    });

    it('should show generic error message for other errors', async () => {
      const genericError = 'Some unknown error';
      // @ts-ignore
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: genericError }
      });
      
      const { getByTestId, getByPlaceholderText, getByText } = render(<SignIn />);
      
      const emailInput = getByPlaceholderText('Email');
      const passwordInput = getByPlaceholderText('Password');
      const loginButton = getByTestId('login-button');
      
      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'password123');
      
      await act(async () => {
        fireEvent.press(loginButton);
      });
      
      expect(getByText(genericError)).toBeTruthy();
    });

    it('should prevent login attempt when validation fails', async () => {
      const { getByTestId } = render(<SignIn />);
      
      const loginButton = getByTestId('login-button');
      
      await act(async () => {
        fireEvent.press(loginButton);
      });
      
      expect(supabase.auth.signInWithPassword).not.toHaveBeenCalled();
    });
  });

  // 6. Modal Window Tests
  describe('Modal Window', () => {
    it('should show success modal after successful login', async () => {
      // @ts-ignore
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({ 
        data: { user: {}, session: {} },
        error: null
      });
      
      const { getByTestId, getByPlaceholderText, getByText } = render(<SignIn />);
      
      const emailInput = getByPlaceholderText('Email');
      const passwordInput = getByPlaceholderText('Password');
      const loginButton = getByTestId('login-button');
      
      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'password123');
      
      await act(async () => {
        fireEvent.press(loginButton);
      });
      
      expect(getByText('Login Successful!')).toBeTruthy();
    });

    it('should close modal and navigate after timeout', async () => {
      // @ts-ignore
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({ 
        data: { user: {}, session: {} },
        error: null
      });
      
      const { getByTestId, getByPlaceholderText, queryByText } = render(<SignIn />);
      
      const emailInput = getByPlaceholderText('Email');
      const passwordInput = getByPlaceholderText('Password');
      const loginButton = getByTestId('login-button');
      
      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'password123');
      
      await act(async () => {
        fireEvent.press(loginButton);
      });
      
      await act(async () => {
        jest.advanceTimersByTime(2000);
      });
      
      expect(queryByText('Login Successful!')).toBeNull();
      expect(mockRouter.replace).toHaveBeenCalledWith('/(home)');
    });
  });
}); 