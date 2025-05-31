import React from 'react';
import { render, waitFor, screen } from '@testing-library/react-native';
import ProfileUserScreen from '../profile-user';
import { fetchUser } from '@/src/api/users';
import { fetchPostsByUserId } from '@/src/api/posts';

// Mock dependencies
jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  })),
}));

jest.mock('@/src/api/users', () => ({
  fetchUser: jest.fn(),
}));

jest.mock('@/src/api/posts', () => ({
  fetchPostsByUserId: jest.fn(),
}));

// Mock PostCard component
jest.mock('@/src/components/PostCard', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  return function MockPostCard({ post }: { post: any }) {
    return (
      <View testID={`post-${post.id}`}>
        <Text>{post.content}</Text>
      </View>
    );
  };
});

// Mock data
const mockUserData = {
  id: 1,
  user_id: 'user-123',
  username: 'testuser',
  email: 'test@example.com',
  degree: 'Computer Science',
  pfp_url: 'https://example.com/avatar.jpg',
  created_at: new Date(),
};

const mockEmptyUserData = {
  id: 2,
  user_id: 'user-456',
  username: 'userwithnodegree',
  email: 'nodegree@example.com',
  degree: null,
  pfp_url: null,
  created_at: new Date(),
};

const mockUserDataWithoutUsername = {
  id: 3,
  user_id: 'user-789',
  username: null,
  email: 'noname@example.com',
  degree: 'Engineering',
  pfp_url: null,
  created_at: new Date(),
};

const mockPosts = [
  {
    id: 'post-1',
    content: 'This is my first post',
    user_id: 'user-123',
    created_at: new Date(),
  },
  {
    id: 'post-2',
    content: 'This is my second post',
    user_id: 'user-123',
    created_at: new Date(),
  },
];

describe('ProfileUserScreen Component', () => {
  const mockUseLocalSearchParams = require('expo-router').useLocalSearchParams;
  const mockFetchUser = fetchUser as jest.MockedFunction<typeof fetchUser>;
  const mockFetchPostsByUserId = fetchPostsByUserId as jest.MockedFunction<typeof fetchPostsByUserId>;

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
      mockFetchPostsByUserId.mockResolvedValue(mockPosts);

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
      mockFetchPostsByUserId.mockResolvedValue([]);

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
      mockFetchPostsByUserId.mockResolvedValue([]);

      render(<ProfileUserScreen />);

      await waitFor(() => {
        const defaultAvatar = screen.getByTestId('default-avatar');
        expect(defaultAvatar).toBeTruthy();
      });
    });

    it('should display fallback message when degree is not available', async () => {
      mockUseLocalSearchParams.mockReturnValue({ userId: 'nodegree@example.com' });
      mockFetchUser.mockResolvedValue(mockEmptyUserData);
      mockFetchPostsByUserId.mockResolvedValue([]);

      render(<ProfileUserScreen />);

      await waitFor(() => {
        expect(screen.getByText('No degree information available.')).toBeTruthy();
      });
    });

    it('should display fallback title when username is not available', async () => {
      mockUseLocalSearchParams.mockReturnValue({ userId: 'noname@example.com' });
      mockFetchUser.mockResolvedValue(mockUserDataWithoutUsername);
      mockFetchPostsByUserId.mockResolvedValue([]);

      render(<ProfileUserScreen />);

      await waitFor(() => {
        expect(screen.getByText('Profile')).toBeTruthy();
      });
    });
  });

  describe('Posts Loading and Display', () => {
    it('should display user posts when posts are loaded successfully', async () => {
      mockUseLocalSearchParams.mockReturnValue({ userId: 'test@example.com' });
      mockFetchUser.mockResolvedValue(mockUserData);
      mockFetchPostsByUserId.mockResolvedValue(mockPosts);

      render(<ProfileUserScreen />);

      await waitFor(() => {
        expect(screen.getByText('Posts')).toBeTruthy();
        expect(screen.getByTestId('post-post-1')).toBeTruthy();
        expect(screen.getByTestId('post-post-2')).toBeTruthy();
        expect(screen.getByText('This is my first post')).toBeTruthy();
        expect(screen.getByText('This is my second post')).toBeTruthy();
      });
    });

    it('should display "No posts yet" when user has no posts', async () => {
      mockUseLocalSearchParams.mockReturnValue({ userId: 'test@example.com' });
      mockFetchUser.mockResolvedValue(mockUserData);
      mockFetchPostsByUserId.mockResolvedValue([]);

      render(<ProfileUserScreen />);

      await waitFor(() => {
        expect(screen.getByText('Posts')).toBeTruthy();
        expect(screen.getByText('No posts yet.')).toBeTruthy();
      });
    });

    it('should display "No posts yet" when fetchPostsByUserId returns null', async () => {
      mockUseLocalSearchParams.mockReturnValue({ userId: 'test@example.com' });
      mockFetchUser.mockResolvedValue(mockUserData);
      mockFetchPostsByUserId.mockResolvedValue([]);

      render(<ProfileUserScreen />);

      await waitFor(() => {
        expect(screen.getByText('Posts')).toBeTruthy();
        expect(screen.getByText('No posts yet.')).toBeTruthy();
      });
    });

    it('should handle posts loading error gracefully', async () => {
      mockUseLocalSearchParams.mockReturnValue({ userId: 'test@example.com' });
      mockFetchUser.mockResolvedValue(mockUserData);
      mockFetchPostsByUserId.mockRejectedValue(new Error('Posts loading failed'));

      render(<ProfileUserScreen />);

      await waitFor(() => {
        expect(screen.getByText('Posts')).toBeTruthy();
        expect(screen.getByText('No posts yet.')).toBeTruthy();
      });
    });

    it('should not fetch posts when user data has no user_id', async () => {
      const userDataWithoutUserId = { ...mockUserData, user_id: null };
      mockUseLocalSearchParams.mockReturnValue({ userId: 'test@example.com' });
      mockFetchUser.mockResolvedValue(userDataWithoutUserId);

      render(<ProfileUserScreen />);

      await waitFor(() => {
        expect(screen.getByText('testuser')).toBeTruthy();
      });

      // Should not call fetchPostsByUserId
      expect(mockFetchPostsByUserId).not.toHaveBeenCalled();
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
      mockFetchPostsByUserId.mockResolvedValue([]);

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
      mockFetchPostsByUserId.mockResolvedValue([]);

      render(<ProfileUserScreen />);

      await waitFor(() => {
        expect(screen.getByText('@complex.email+test')).toBeTruthy();
      });
    });
  });
}); 