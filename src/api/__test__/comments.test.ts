// Import functions to be tested
import { createComment, fetchComments, fetchCommentsByParentId } from '../comments';
import { supabase } from '../supabase';
import { CommentCreate } from '../../model/comment';

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  // Set up console error listener to avoid showing too many error logs during testing
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

describe('fetchComments', () => {
  // 1.1 Normal case: Successfully fetch comments array
  test('should return comments array', async () => {
    const mockCommentsData = [
      {
        id: 'comment-1',
        content: 'Test comment 1',
        image_urls: ['image1.jpg'],
        user_id: 'user-1',
        post_id: 'post-1',
        parent_id: null,
        created_at: '2023-01-01T12:00:00Z',
        user: { username: 'testuser1', degree: 'Bachelor', pfp_url: 'profile1.jpg', email: 'test1@example.com' },
        count: [{ count: 2 }],
        likes: [{ count: 5 }],
        isLike: [{ user_id: 'user-2' }],
        children: [
          {
            id: 'comment-child-1',
            content: 'Child comment 1',
            image_urls: ['image2.jpg'],
            user_id: 'user-2',
            post_id: 'post-1',
            parent_id: 'comment-1',
            created_at: '2023-01-01T12:30:00Z',
            user: { username: 'testuser2', degree: 'Master', pfp_url: 'profile2.jpg', email: 'test2@example.com' },
            count: [{ count: 0 }],
            likes: [{ count: 2 }],
            isLike: [],
          }
        ]
      }
    ];

    // Mock Supabase response
    (supabase.from as jest.Mock).mockImplementationOnce(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      is: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: mockCommentsData,
        error: null
      })
    }));
    
    const result = await fetchComments('post-1', 'user-2');
    
    expect(result).toEqual(mockCommentsData);
    expect(supabase.from).toHaveBeenCalledWith('comments');
    expect(console.error).not.toHaveBeenCalled();
  });
  
  // 1.2 Exception case: postId is invalid
  test('should handle empty postId correctly', async () => {
    // Mock Supabase response, correctly implement is method
    (supabase.from as jest.Mock).mockImplementationOnce(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      is: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: null,
        error: new Error('Invalid postId')
      })
    }));
    
    const result = await fetchComments('', 'user-2');
    
    expect(result).toBeNull();
    expect(supabase.from).toHaveBeenCalledWith('comments');
    expect(console.error).toHaveBeenCalled();
  });
  
  // 1.3 Exception case: Server returns error
  test('should catch and log errors when server returns an error', async () => {
    // Mock Supabase response error
    (supabase.from as jest.Mock).mockImplementationOnce(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      is: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: null,
        error: new Error('Server error')
      })
    }));
    
    const result = await fetchComments('post-1', 'user-2');
    
    expect(result).toBeNull();
    expect(console.error).toHaveBeenCalled();
  });
});

describe('fetchCommentsByParentId', () => {
  // 2.1 Normal case: Successfully fetch child comments array
  test('should return child comments array', async () => {
    const mockChildCommentsData = [
      {
        id: 'comment-child-1',
        content: 'Child comment 1',
        image_urls: ['image2.jpg'],
        user_id: 'user-2',
        post_id: 'post-1',
        parent_id: 'comment-1',
        created_at: '2023-01-01T12:30:00Z',
        user: { username: 'testuser2', degree: 'Master', pfp_url: 'profile2.jpg', email: 'test2@example.com' },
        count: [{ count: 0 }],
        likes: [{ count: 2 }],
        isLike: [],
        children: []
      }
    ];

    // Mock Supabase response
    (supabase.from as jest.Mock).mockImplementationOnce(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: mockChildCommentsData,
        error: null
      })
    }));
    
    const result = await fetchCommentsByParentId('comment-1', 'user-2');
    
    expect(result).toEqual(mockChildCommentsData);
    expect(supabase.from).toHaveBeenCalledWith('comments');
    expect(console.error).not.toHaveBeenCalled();
  });
  
  // 2.2 Exception case: parentId is invalid
  test('should handle empty parentId correctly', async () => {
    // Mock Supabase response, ensure order method is correctly mocked
    (supabase.from as jest.Mock).mockImplementationOnce(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: null,
        error: new Error('Invalid parentId')
      })
    }));
    
    const result = await fetchCommentsByParentId('', 'user-2');
    
    expect(result).toBeNull();
    expect(supabase.from).toHaveBeenCalledWith('comments');
    expect(console.error).toHaveBeenCalled();
  });
  
  // 2.3 Exception case: Server returns error
  test('should catch and log errors when server returns an error', async () => {
    // Mock Supabase response error
    (supabase.from as jest.Mock).mockImplementationOnce(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: null,
        error: new Error('Server error')
      })
    }));
    
    const result = await fetchCommentsByParentId('comment-1', 'user-2');
    
    expect(result).toBeNull();
    expect(console.error).toHaveBeenCalled();
  });
});

describe('createComment', () => {
  // 3.1 Normal case: Successfully create comment
  test('should create comment and return comment data', async () => {
    const commentData: CommentCreate = {
      content: 'Test comment content',
      user_id: 'user-1',
      post_id: 'post-1',
      parent_id: undefined,
      image_url: 'image1.jpg'
    };
    
    const mockResponseData = [
      {
        id: 'new-comment-id',
        content: 'Test comment content',
        user_id: 'user-1',
        post_id: 'post-1',
        parent_id: null,
        image_url: 'image1.jpg',
        created_at: '2023-01-01T12:00:00Z'
      }
    ];
    
    // Mock Supabase response
    (supabase.from as jest.Mock).mockImplementationOnce(() => ({
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockResolvedValue({
        data: mockResponseData,
        error: null
      })
    }));
    
    const result = await createComment(commentData);
    
    expect(result).toEqual(mockResponseData);
    expect(supabase.from).toHaveBeenCalledWith('comments');
  });
  
  // 3.2 Exception case: Create comment fails, missing parameters
  test('should throw error when parameters are missing', async () => {
    const incompleteCommentData = {
      // Missing required fields
      content: 'Test comment content',
      // user_id and post_id missing
      parent_id: undefined,
      image_url: undefined
    } as unknown as CommentCreate;
    
    // Mock Supabase response error
    (supabase.from as jest.Mock).mockImplementationOnce(() => ({
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockResolvedValue({
        data: null,
        error: new Error('Missing required parameters')
      })
    }));
    
    await expect(createComment(incompleteCommentData)).rejects.toThrow();
  });
  
  // 3.3 Exception case: Server returns error
  test('should throw error when server returns an error', async () => {
    const commentData: CommentCreate = {
      content: 'Test comment content',
      user_id: 'user-1',
      post_id: 'post-1',
      parent_id: undefined,
      image_url: undefined
    };
    
    // Mock Supabase response error
    (supabase.from as jest.Mock).mockImplementationOnce(() => ({
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockResolvedValue({
        data: null,
        error: new Error('Server error')
      })
    }));
    
    await expect(createComment(commentData)).rejects.toThrow();
  });
  
  // 3.4 Edge case: Comment content too long
  test('should handle comment content that exceeds the limit', async () => {
    // Create a comment content that exceeds 1000 characters
    const longContent = 'a'.repeat(1001);
    
    const commentData: CommentCreate = {
      content: longContent,
      user_id: 'user-1',
      post_id: 'post-1',
      parent_id: undefined,
      image_url: undefined
    };
    
    // Mock Supabase response
    (supabase.from as jest.Mock).mockImplementationOnce(() => ({
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockResolvedValue({
        data: null,
        error: new Error('Comment content exceeds limit')
      })
    }));
    
    await expect(createComment(commentData)).rejects.toThrow();
  });
}); 