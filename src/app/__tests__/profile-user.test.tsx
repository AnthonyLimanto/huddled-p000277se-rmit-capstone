import React from 'react';
import { render, waitFor, screen } from '@testing-library/react-native';
import ProfileUserScreen from '../profile-user';
import { fetchUser } from '@/src/api/users';

// Mock dependencies
jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(),
}));

jest.mock('@/src/api/users', () => ({
  fetchUser: jest.fn(),
}));

// Mock data
const mockUserData = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  degree: 'Computer Science',
  pfp_url: 'https://example.com/avatar.jpg',
  created_at: new Date(),
};

const mockEmptyUserData = {
  id: 2,
  username: 'userwithnodegree',
  email: 'nodegree@example.com',
  degree: null,
  pfp_url: null,
  created_at: new Date(),
};

describe('ProfileUserScreen Component', () => {
  const mockUseLocalSearchParams = require('expo-router').useLocalSearchParams;
  const mockFetchUser = fetchUser as jest.MockedFunction<typeof fetchUser>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Loading States', () => {
    it('should display loading indicator while fetching user data', () => {
      mockUseLocalSearchParams.mockReturnValue({ userId: 'test@example.com' });
      mockFetchUser.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<ProfileUserScreen />);

      expect(screen.getByTestId('activity-indicator')).toBeTruthy();
    });
  });

  describe('Successful User Data Loading', () => {
    it('should display user profile when data is loaded successfully', async () => {
      mockUseLocalSearchParams.mockReturnValue({ userId: 'test@example.com' });
      mockFetchUser.mockResolvedValue(mockUserData);

      render(<ProfileUserScreen />);

      await waitFor(() => {
        expect(screen.getByText('testuser')).toBeTruthy();
        expect(screen.getByText('@test')).toBeTruthy();
        expect(screen.getByText('Studying Computer Science')).toBeTruthy();
      });
    });

    it('should display profile picture when pfp_url is available', async () => {
      mockUseLocalSearchParams.mockReturnValue({ userId: 'test@example.com' });
      mockFetchUser.mockResolvedValue(mockUserData);

      render(<ProfileUserScreen />);

      await waitFor(() => {
        const profileImage = screen.getByTestId('profile-image');
        expect(profileImage).toBeTruthy();
        expect(profileImage.props.source.uri).toBe('https://example.com/avatar.jpg');
      });
    });

    it('should display default avatar when pfp_url is not available', async () => {
      mockUseLocalSearchParams.mockReturnValue({ userId: 'nodegree@example.com' });
      mockFetchUser.mockResolvedValue(mockEmptyUserData);

      render(<ProfileUserScreen />);

      await waitFor(() => {
        const defaultAvatar = screen.getByTestId('default-avatar');
        expect(defaultAvatar).toBeTruthy();
      });
    });

    it('should display fallback message when degree is not available', async () => {
      mockUseLocalSearchParams.mockReturnValue({ userId: 'nodegree@example.com' });
      mockFetchUser.mockResolvedValue(mockEmptyUserData);

      render(<ProfileUserScreen />);

      await waitFor(() => {
        expect(screen.getByText('No degree information available.')).toBeTruthy();
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message when user is not found', async () => {
      mockUseLocalSearchParams.mockReturnValue({ userId: 'nonexistent@example.com' });
      mockFetchUser.mockResolvedValue(null);

      render(<ProfileUserScreen />);

      await waitFor(() => {
        expect(screen.getByText('User not found.')).toBeTruthy();
      });
    });

    it('should display error message when API call fails', async () => {
      mockUseLocalSearchParams.mockReturnValue({ userId: 'test@example.com' });
      mockFetchUser.mockRejectedValue(new Error('Network error'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      render(<ProfileUserScreen />);

      await waitFor(() => {
        expect(screen.getByText('User not found.')).toBeTruthy();
        expect(consoleSpy).toHaveBeenCalledWith('Failed to load user profile:', expect.any(Error));
      });

      consoleSpy.mockRestore();
    });
  });

  describe('URL Parameter Handling', () => {
    it('should decode URL-encoded email parameter correctly', async () => {
      const encodedEmail = encodeURIComponent('test+user@example.com');
      mockUseLocalSearchParams.mockReturnValue({ userId: encodedEmail });
      mockFetchUser.mockResolvedValue(mockUserData);

      render(<ProfileUserScreen />);

      await waitFor(() => {
        expect(mockFetchUser).toHaveBeenCalledWith('test+user@example.com');
      });
    });

    it('should handle missing userId parameter gracefully', async () => {
      mockUseLocalSearchParams.mockReturnValue({});
      
      render(<ProfileUserScreen />);

      // Should not crash and should not call fetchUser
      expect(mockFetchUser).not.toHaveBeenCalled();
    });
  });

  describe('Email Display Logic', () => {
    it('should extract username from email correctly for userHandle', async () => {
      mockUseLocalSearchParams.mockReturnValue({ userId: 'complex.email+test@university.edu' });
      const userData = {
        ...mockUserData,
        email: 'complex.email+test@university.edu'
      };
      mockFetchUser.mockResolvedValue(userData);

      render(<ProfileUserScreen />);

      await waitFor(() => {
        expect(screen.getByText('@complex.email+test')).toBeTruthy();
      });
    });
  });
}); 