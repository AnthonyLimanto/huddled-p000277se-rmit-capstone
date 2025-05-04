import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import PostCard from '../../components/PostCard';
import { Post } from '../../model/post';
import { Comment } from '../../model/comment';
import * as AuthContext from '../../context/AuthContext';
import { Platform } from 'react-native';

// Set test timeout
jest.setTimeout(30000);

// Import modules actually used by the component, then use spyOn on these modules
// This ensures that the mock references the same path as the component
import * as comments from '../../api/comments';
import * as postLikes from '../../api/post_likes';
import * as commentLikes from '../../api/comment_likes';


// Then import the mocked functions
import { downloadPostImage } from '../../helper/bucketHelper';

// Mock Platform.OS, should be set before mocking APIs
Platform.OS = 'web';

// Mock Auth context, matching component usage
const mockUser = { id: 'logged-user-123', email: 'user@example.com' };
jest.spyOn(AuthContext, 'useAuth').mockReturnValue({
  user: mockUser,
  isLoading: false,
  signOut: jest.fn().mockResolvedValue(undefined)
});

// Mock a more complete post object to ensure all condition branches can be triggered
const createMockPost = (isLiked = false, hasImage = true): Post => ({
  id: 'post-123',
  user_id: 'user-456',
  content: 'This is a test post',
  image_url: hasImage ? 'image1.jpg,image2.jpg' : undefined, // Ensure not 'default'
  created_at: new Date(),
  profile: {
    username: 'testuser',
    degree: 'Computer Science',
    email: 'test@example.com',
    id: 'user-456' as unknown as number,
    created_at: new Date(),
    pfp_url: 'https://example.com/profile.jpg',
  },
  likes: [{ count: 10 }],
  count: [{ count: 5 }], // Ensure comment count > 0, to display "View comments" button
  isLike: isLiked ? [{}] : [] // Set like status based on parameter
});

// Mock comment data
const mockComments: Comment[] = [
  {
    id: 'comment-1',
    user_id: 'user-789',
    post_id: 'post-123',
    content: 'This is a test comment',
    created_at: new Date(),
    user: {
      username: 'commenter1',
      degree: 'Software Engineering',
      email: 'commenter1@example.com'
    },
    count: [{ count: 2 }],
    likes: [{ count: 3 }],
    isLike: [],
    children: [
      {
        id: 'comment-2',
        user_id: 'user-101',
        post_id: 'post-123',
        parent_id: 'comment-1',
        content: 'This is a test reply',
        created_at: new Date(),
        user: {
          username: 'replier1',
          degree: 'Artificial Intelligence',
          email: 'replier1@example.com'
        },
        count: [{ count: 0 }],
        likes: [{ count: 1 }],
        isLike: []
      }
    ]
  }
];

describe('PostCard Component', () => {
  // Reset mocks before each test
  beforeEach(() => {
    // Clear all mock function call history and implementations
    jest.clearAllMocks();
    
    // Reset Platform.OS to 'web' to ensure correct image download logic
    Platform.OS = 'web';
    
    // Ensure downloadPostImage is correctly mocked
    (downloadPostImage as jest.Mock).mockImplementation(async (postId: string, imageNameArr: string[]) => {
      // If no image name array is provided, return empty array
      if (!imageNameArr || imageNameArr.length === 0) {
        return [];
      }
      // Otherwise generate a mock URL for each image name
      return imageNameArr.map((name: string) => `https://example.com/${postId}/${name}`);
    });
    
    // Unless specifically overridden in the test, keep the default mock implementations
    // This ensures each test has a clean starting point
    jest.spyOn(comments, 'fetchComments').mockImplementation(() => Promise.resolve(mockComments as any));
    jest.spyOn(comments, 'fetchCommentsByParentId').mockImplementation(() => Promise.resolve(mockComments[0].children as any));
    jest.spyOn(comments, 'createComment').mockImplementation(() => Promise.resolve([{ id: 'new-comment-id' }] as any));
    
    jest.spyOn(postLikes, 'addPostLike').mockImplementation(() => Promise.resolve(true));
    jest.spyOn(postLikes, 'deletePostLike').mockImplementation(() => Promise.resolve(true));
    jest.spyOn(postLikes, 'fetchPostLikeInfo').mockImplementation(() => Promise.resolve({ likes: 11, isLike: true }));
    
    jest.spyOn(commentLikes, 'addCommentLike').mockImplementation(() => Promise.resolve(true));
    jest.spyOn(commentLikes, 'deleteCommentLike').mockImplementation(() => Promise.resolve(true));
  });

  // Test component initialization and API calls
  test('component should call fetchComments and downloadPostImage when loaded', async () => {
    // Use a complete mock post with image URL
    const mockPost = createMockPost(false, true);
    
    // Ensure mock is set before rendering component
    jest.spyOn(comments, 'fetchComments').mockResolvedValueOnce(mockComments as any);
    
    // Render component
    render(<PostCard post={mockPost} />);
    
    // Wait for fetchComments to be called, using a longer timeout
    await waitFor(
      () => {
        expect(comments.fetchComments).toHaveBeenCalledWith('post-123', 'logged-user-123');
      },
      { timeout: 3000 }
    );
    
    // Wait for downloadPostImage to be called
    await waitFor(
      () => {
        expect(downloadPostImage).toHaveBeenCalledWith('post-123', ['image1.jpg', 'image2.jpg']);
      },
      { timeout: 3000 }
    );
  });

  // Test post like functionality
  test('should call addPostLike when like button is clicked on an unliked post', async () => {
    // Use an unliked post
    const mockPost = createMockPost(false);
    
    // Ensure mock is set before rendering
    jest.spyOn(comments, 'fetchComments').mockResolvedValueOnce(mockComments as any);
    
    const { getByTestId, debug } = render(<PostCard post={mockPost} />);
    
    // Wait for component initialization to complete, using a longer timeout
    await waitFor(
      () => {
        expect(comments.fetchComments).toHaveBeenCalledWith('post-123', 'logged-user-123');
      },
      { timeout: 3000 }
    );
    
    // Wait for a while to ensure component is fully rendered
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Output component tree for debugging
    console.log('Like test component tree:', debug());
    
    // Find the like button
    const likeButton = getByTestId('post-like-button');
    
    // Click the like button
    fireEvent.press(likeButton);
    
    // Verify addPostLike was called, using a longer timeout
    await waitFor(
      () => {
        expect(postLikes.addPostLike).toHaveBeenCalledWith('post-123', 'logged-user-123');
      },
      { timeout: 3000 }
    );
    
    // Verify fetchPostLikeInfo was called to update state
    await waitFor(
      () => {
        expect(postLikes.fetchPostLikeInfo).toHaveBeenCalledWith('post-123', 'logged-user-123');
      },
      { timeout: 3000 }
    );
  });
  
  test('should call deletePostLike when like button is clicked on an already liked post', async () => {
    // Use an already liked post
    const mockPost = createMockPost(true);
    
    const { getByTestId } = render(<PostCard post={mockPost} />);
    
    // Wait for component initialization to complete
    await waitFor(() => {
      expect(comments.fetchComments).toHaveBeenCalled();
    });
    
    // Find the like button
    const likeButton = getByTestId('post-like-button');
    
    // Click the like button
    fireEvent.press(likeButton);
    
    // Verify deletePostLike was called
    await waitFor(() => {
      expect(postLikes.deletePostLike).toHaveBeenCalledWith('post-123', 'logged-user-123');
    });
    
    // Verify fetchPostLikeInfo was called to update state
    await waitFor(() => {
      expect(postLikes.fetchPostLikeInfo).toHaveBeenCalledWith('post-123', 'logged-user-123');
    });
  });
  
  // Test comment display and operations
  test('should show "View all comments" button and be able to expand comments when there are comments', async () => {
    const mockPost = createMockPost();
    
    const { getByTestId, getByText, queryByText } = render(<PostCard post={mockPost} />);
    
    // Wait for component initialization to complete
    await waitFor(() => {
      expect(comments.fetchComments).toHaveBeenCalled();
    });
    
    // Verify "View all comments" button exists
    const viewCommentsButton = getByTestId('view-comments-button');
    expect(viewCommentsButton).toBeTruthy();
    expect(getByText('View all comments')).toBeTruthy();
    
    // Click to expand comments
    fireEvent.press(viewCommentsButton);
    
    // Verify comment content is displayed
    await waitFor(() => {
      expect(queryByText('This is a test comment')).toBeTruthy();
    });
    
    // Verify button text changes to "Hide all"
    expect(getByText('Hide all')).toBeTruthy();
    
    // Click again should hide comments
    fireEvent.press(viewCommentsButton);
    
    // Verify button text changes back to "View all comments"
    await waitFor(() => {
      expect(getByText('View all comments')).toBeTruthy();
    });
  });
  
  // Test comment like functionality
  test('should call relevant API when comment like button is clicked', async () => {
    const mockPost = createMockPost();
    
    const { getByTestId } = render(<PostCard post={mockPost} />);
    
    // Wait for component initialization to complete
    await waitFor(() => {
      expect(comments.fetchComments).toHaveBeenCalled();
    });
    
    // Click "View all comments" button to expand comments
    const viewCommentsButton = getByTestId('view-comments-button');
    fireEvent.press(viewCommentsButton);
    
    // Wait for comments to render
    await waitFor(() => {
      const commentLikeButton = getByTestId('comment-like-button-comment-1');
      expect(commentLikeButton).toBeTruthy();
    });
    
    // Click the comment like button
    const commentLikeButton = getByTestId('comment-like-button-comment-1');
    fireEvent.press(commentLikeButton);
    
    // Verify addCommentLike was called
    await waitFor(() => {
      expect(commentLikes.addCommentLike).toHaveBeenCalledWith('comment-1', 'logged-user-123');
    });
  });
  
  // Test posting a comment
  test('should be able to post a comment and refresh comment list', async () => {
    const mockPost = createMockPost();
    
    const { getByTestId, getByPlaceholderText, queryByTestId } = render(<PostCard post={mockPost} />);
    
    // Wait for component initialization to complete
    await waitFor(() => {
      expect(comments.fetchComments).toHaveBeenCalled();
    });
    
    // Find comment input field
    const commentInput = getByPlaceholderText('Leave your thoughts here ...');
    
    // Initial state should not have post button
    expect(queryByTestId('post-comment-button')).toBeNull();
    
    // Input comment content
    fireEvent.changeText(commentInput, 'This is a new comment');
    
    // Post button should appear
    await waitFor(() => {
      const postButton = getByTestId('post-comment-button');
      expect(postButton).toBeTruthy();
    });
    
    // Click post button
    const postButton = getByTestId('post-comment-button');
    fireEvent.press(postButton);
    
    // Verify createComment was called
    await waitFor(() => {
      expect(comments.createComment).toHaveBeenCalledWith({
        user_id: 'logged-user-123',
        post_id: 'post-123',
        content: 'This is a new comment'
      });
    });
    
    // Verify comment list was refreshed
    await waitFor(() => {
      expect(comments.fetchComments).toHaveBeenCalledTimes(2);
    });
  });
  
  // Test posting a reply
  test('should show reply box and be able to post a reply when Reply button is clicked', async () => {
    const mockPost = createMockPost();
    
    const { getByTestId, getByPlaceholderText } = render(<PostCard post={mockPost} />);
    
    // Wait for component initialization to complete
    await waitFor(() => {
      expect(comments.fetchComments).toHaveBeenCalled();
    });
    
    // Click "View all comments" button to expand comments
    const viewCommentsButton = getByTestId('view-comments-button');
    fireEvent.press(viewCommentsButton);
    
    // Wait for comments to render
    await waitFor(() => {
      const replyButton = getByTestId('reply-button-comment-1');
      expect(replyButton).toBeTruthy();
    });
    
    // Click reply button
    const replyButton = getByTestId('reply-button-comment-1');
    fireEvent.press(replyButton);
    
    // Reply input field should appear
    const replyInput = getByPlaceholderText('Write a reply...');
    
    // Input reply content
    fireEvent.changeText(replyInput, 'This is a reply');
    
    // Wait for reply button to appear
    await waitFor(() => {
      const postReplyButton = getByTestId('post-reply-button-comment-1');
      expect(postReplyButton).toBeTruthy();
    });
    
    // Click post reply button
    const postReplyButton = getByTestId('post-reply-button-comment-1');
    fireEvent.press(postReplyButton);
    
    // Verify createComment was called
    await waitFor(() => {
      expect(comments.createComment).toHaveBeenCalledWith({
        content: 'This is a reply',
        user_id: 'logged-user-123',
        post_id: 'post-123',
        parent_id: 'comment-1'
      });
    });
    
    // Verify child comments were loaded
    await waitFor(() => {
      expect(comments.fetchCommentsByParentId).toHaveBeenCalledWith('comment-1', 'logged-user-123');
    });
  });
  
  // Test image loading behavior
  test('should call downloadPostImage and display images when post has images', async () => {
    const mockPost = createMockPost(false, true);
    
    const { queryByTestId } = render(<PostCard post={mockPost} />);
    
    // Wait for images to load
    await waitFor(() => {
      expect(downloadPostImage).toHaveBeenCalledWith('post-123', ['image1.jpg', 'image2.jpg']);
    });
    
    // Verify image container exists
    await waitFor(() => {
      expect(queryByTestId('post-images-wrapper')).toBeTruthy();
    });
  });
  
  test('should not display image container when post has no images', async () => {
    // Use a post without images
    const mockPost = createMockPost(false, false);
    
    // Ensure mock is set before rendering
    jest.spyOn(comments, 'fetchComments').mockResolvedValueOnce(mockComments as any);
    
    // Render component
    const { queryByTestId, debug } = render(<PostCard post={mockPost} />);
    
    // Print component tree for debugging
    console.log('Component tree:', debug());
    
    // First verify fetchComments was called - use a longer timeout to ensure async operations have enough time to complete
    await waitFor(
      () => {
        expect(comments.fetchComments).toHaveBeenCalledWith('post-123', 'logged-user-123');
      },
      { timeout: 3000 }
    );
    
    // Wait for component to fully render
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Verify image container doesn't exist
    expect(queryByTestId('post-image-container')).toBeNull();
    
    // Verify downloadPostImage wasn't called
    expect(downloadPostImage).not.toHaveBeenCalled();
  });
}); 