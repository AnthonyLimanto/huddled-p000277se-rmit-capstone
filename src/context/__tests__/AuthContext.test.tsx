import React from 'react';
import { render, waitFor, act } from '@testing-library/react-native';
import { Text } from 'react-native';
import { AuthProvider, useAuth, User } from '../AuthContext';
import { supabase } from '../../api/supabase';

// Mock supabase
jest.mock('../../api/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(),
      signOut: jest.fn(),
    }
  }
}));

// Test component that uses the auth context
const TestComponent = () => {
  const { user, isLoading, signOut } = useAuth();
  
  if (isLoading) {
    return <Text testID="loading">Loading</Text>;
  }
  
  return (
    <>
      <Text testID="user-status">
        {user ? `Logged in: ${user.email}` : 'Not logged in'}
      </Text>
      <Text testID="user-id">{user?.id || 'No ID'}</Text>
      <Text testID="sign-out" onPress={signOut}>Sign Out</Text>
    </>
  );
};

describe('AuthContext Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('AuthProvider', () => {
    test('initializes with no user when session is null', async () => {
      // Mock getSession to return no session
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null }
      });
      (supabase.auth.onAuthStateChange as jest.Mock).mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } }
      });

      const { getByTestId } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(getByTestId('user-status')).toBeTruthy();
      });

      expect(getByTestId('user-status').children[0]).toBe('Not logged in');
      expect(getByTestId('user-id').children[0]).toBe('No ID');
    });

    test('initializes with user when session exists', async () => {
      // Mock user data
      const mockUser: User = {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User'
      };

      // Mock getSession to return session with user
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: { user: mockUser } }
      });
      (supabase.auth.onAuthStateChange as jest.Mock).mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } }
      });

      const { getByTestId } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(getByTestId('user-status')).toBeTruthy();
      });

      expect(getByTestId('user-status').children[0]).toBe('Logged in: test@example.com');
      expect(getByTestId('user-id').children[0]).toBe('user123');
    });

    test('handles SIGNED_IN auth state change', async () => {
      // Mock initial no session
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null }
      });

      let authStateChangeCallback: (event: string, session: any) => void;
      (supabase.auth.onAuthStateChange as jest.Mock).mockImplementation((callback) => {
        authStateChangeCallback = callback;
        return { data: { subscription: { unsubscribe: jest.fn() } } };
      });

      const { getByTestId } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(getByTestId('user-status').children[0]).toBe('Not logged in');
      });

      // Simulate sign in
      const mockUser: User = {
        id: 'user456',
        email: 'newuser@example.com'
      };

      act(() => {
        authStateChangeCallback('SIGNED_IN', { user: mockUser });
      });

      await waitFor(() => {
        expect(getByTestId('user-status').children[0]).toBe('Logged in: newuser@example.com');
        expect(getByTestId('user-id').children[0]).toBe('user456');
      });
    });

    test('handles SIGNED_OUT auth state change', async () => {
      // Mock initial session with user
      const mockUser: User = {
        id: 'user123',
        email: 'test@example.com'
      };

      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: { user: mockUser } }
      });

      let authStateChangeCallback: (event: string, session: any) => void;
      (supabase.auth.onAuthStateChange as jest.Mock).mockImplementation((callback) => {
        authStateChangeCallback = callback;
        return { data: { subscription: { unsubscribe: jest.fn() } } };
      });

      const { getByTestId } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Wait for initial load with user
      await waitFor(() => {
        expect(getByTestId('user-status').children[0]).toBe('Logged in: test@example.com');
      });

      // Simulate sign out
      act(() => {
        authStateChangeCallback('SIGNED_OUT', null);
      });

      await waitFor(() => {
        expect(getByTestId('user-status').children[0]).toBe('Not logged in');
        expect(getByTestId('user-id').children[0]).toBe('No ID');
      });
    });

    test('handles SIGNED_IN with null session', async () => {
      // Mock initial no session
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null }
      });

      let authStateChangeCallback: (event: string, session: any) => void;
      (supabase.auth.onAuthStateChange as jest.Mock).mockImplementation((callback) => {
        authStateChangeCallback = callback;
        return { data: { subscription: { unsubscribe: jest.fn() } } };
      });

      const { getByTestId } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(getByTestId('user-status').children[0]).toBe('Not logged in');
      });

      // Simulate sign in with null session (edge case)
      act(() => {
        authStateChangeCallback('SIGNED_IN', null);
      });

      await waitFor(() => {
        expect(getByTestId('user-status').children[0]).toBe('Not logged in');
      });
    });

    test('cleans up subscription on unmount', async () => {
      const mockUnsubscribe = jest.fn();
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null }
      });
      (supabase.auth.onAuthStateChange as jest.Mock).mockReturnValue({
        data: { subscription: { unsubscribe: mockUnsubscribe } }
      });

      const { unmount } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(supabase.auth.onAuthStateChange).toHaveBeenCalled();
      });

      unmount();

      expect(mockUnsubscribe).toHaveBeenCalled();
    });
  });

  describe('signOut function', () => {
    test('calls supabase signOut and updates user state', async () => {
      // Mock initial session with user
      const mockUser: User = {
        id: 'user123',
        email: 'test@example.com'
      };

      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: { user: mockUser } }
      });
      (supabase.auth.onAuthStateChange as jest.Mock).mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } }
      });
      (supabase.auth.signOut as jest.Mock).mockResolvedValue({});

      const { getByTestId } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Wait for initial load with user
      await waitFor(() => {
        expect(getByTestId('user-status').children[0]).toBe('Logged in: test@example.com');
      });

      // Trigger sign out
      act(() => {
        getByTestId('sign-out').props.onPress();
      });

      await waitFor(() => {
        expect(supabase.auth.signOut).toHaveBeenCalled();
        expect(getByTestId('user-status').children[0]).toBe('Not logged in');
      });
    });
  });

  describe('useAuth hook', () => {
    test('returns correct context values', async () => {
      const mockUser: User = {
        id: 'user123',
        email: 'test@example.com'
      };

      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: { user: mockUser } }
      });
      (supabase.auth.onAuthStateChange as jest.Mock).mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } }
      });

      const { getByTestId } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(getByTestId('user-status')).toBeTruthy();
        expect(getByTestId('user-id')).toBeTruthy();
        expect(getByTestId('sign-out')).toBeTruthy();
      });
    });
  });

  describe('edge cases', () => {
    test('handles missing subscription object', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null }
      });
      // Mock onAuthStateChange to return undefined subscription
      (supabase.auth.onAuthStateChange as jest.Mock).mockReturnValue({
        data: { subscription: undefined }
      });

      const { unmount } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(supabase.auth.onAuthStateChange).toHaveBeenCalled();
      });

      // Should not throw error on unmount
      expect(() => unmount()).not.toThrow();
    });

    test('verifies context provides all required values', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null }
      });
      (supabase.auth.onAuthStateChange as jest.Mock).mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } }
      });

      const TestContextValues = () => {
        const context = useAuth();
        return (
          <>
            <Text testID="has-user">{context.user ? 'true' : 'false'}</Text>
            <Text testID="has-loading">{typeof context.isLoading === 'boolean' ? 'true' : 'false'}</Text>
            <Text testID="has-signout">{typeof context.signOut === 'function' ? 'true' : 'false'}</Text>
          </>
        );
      };

      const { getByTestId } = render(
        <AuthProvider>
          <TestContextValues />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(getByTestId('has-user').children[0]).toBe('false');
        expect(getByTestId('has-loading').children[0]).toBe('true');
        expect(getByTestId('has-signout').children[0]).toBe('true');
      });
    });
  });
}); 