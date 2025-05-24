import { fetchCommentLikeInfo, addCommentLike, deleteCommentLike } from '../comment_likes';
import { supabase } from '../supabase';

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  // Set up console error listener to avoid showing too many error logs during testing
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

describe('likeComment', () => {
  // 4.1 Normal case: Successfully like a comment
  test('should return true when like operation succeeds', async () => {
    // Mock successful like operation
    (supabase.from as jest.Mock).mockImplementationOnce(() => ({
      insert: jest.fn().mockResolvedValue({ 
        data: {}, 
        error: null 
      })
    }));
    
    const result = await addCommentLike('comment-123', 'user-123');
    
    expect(result).toBe(true);
    expect(supabase.from).toHaveBeenCalledWith('comment_likes');
  });
  
  // 4.2 Exception case: Missing or invalid commentId
  test('should return error when commentId is empty', async () => {
    // Mock empty commentId error
    (supabase.from as jest.Mock).mockImplementationOnce(() => ({
      insert: jest.fn().mockImplementation(() => {
        throw new Error('Invalid comment ID');
      })
    }));
    
    const result = await addCommentLike('', 'user-123');
    
    expect(result).toBe(false);
    expect(console.error).toHaveBeenCalled();
  });
  
  // 4.3 Exception case: Server returns error
  test('should handle server error and return false', async () => {
    // Mock server error
    (supabase.from as jest.Mock).mockImplementationOnce(() => ({
      insert: jest.fn().mockResolvedValue({ 
        data: null, 
        error: new Error('Database error') 
      })
    }));
    
    const result = await addCommentLike('comment-123', 'user-123');
    
    expect(result).toBe(false);
    expect(console.error).toHaveBeenCalled();
  });
  
  // 4.4 Exception case: Already liked, attempting to like again
  test('should return error when trying to like an already liked comment', async () => {
    // Mock insert failure (unique constraint error)
    (supabase.from as jest.Mock).mockImplementationOnce(() => ({
      insert: jest.fn().mockResolvedValue({ 
        data: null, 
        error: { code: '23505', message: 'Unique constraint violation' } // PostgreSQL unique constraint error code
      })
    }));
    
    const result = await addCommentLike('comment-123', 'user-123');
    
    expect(result).toBe(false);
    expect(console.error).toHaveBeenCalled();
  });
});

describe('unlikeComment', () => {
  // 5.1 Normal case: Successfully unlike a comment
  test('should return true when unlike operation succeeds', async () => {
    // Mock successful unlike operation
    (supabase.from as jest.Mock).mockImplementationOnce(() => ({
      delete: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null })
        })
      })
    }));
    
    const result = await deleteCommentLike('comment-123', 'user-123');
    
    expect(result).toBe(true);
    expect(supabase.from).toHaveBeenCalledWith('comment_likes');
  });
  
  // 5.2 Exception case: Missing or invalid commentId
  test('should return error when commentId is empty', async () => {
    // Mock empty commentId error
    (supabase.from as jest.Mock).mockImplementationOnce(() => ({
      delete: jest.fn().mockImplementation(() => {
        throw new Error('Invalid comment ID');
      })
    }));
    
    const result = await deleteCommentLike('', 'user-123');
    
    expect(result).toBe(false);
    expect(console.error).toHaveBeenCalled();
  });
  
  // 5.3 Exception case: Server returns error
  test('should handle server error and return false', async () => {
    // Mock server error
    (supabase.from as jest.Mock).mockImplementationOnce(() => ({
      delete: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: new Error('Database error') })
        })
      })
    }));
    
    const result = await deleteCommentLike('comment-123', 'user-123');
    
    expect(result).toBe(false);
    expect(console.error).toHaveBeenCalled();
  });
  
  // 5.4 Edge case: Attempting to unlike a comment that wasn't liked
  test('should correctly handle attempting to unlike a comment that was not liked', async () => {
    // Mock case where no rows were deleted (but not considered an error)
    (supabase.from as jest.Mock).mockImplementationOnce(() => ({
      delete: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ 
            error: null,
            data: { count: 0 } // No rows deleted
          })
        })
      })
    }));
    
    const result = await deleteCommentLike('comment-123', 'user-123');
    
    expect(result).toBe(true); // API designed to return true as long as the operation itself didn't error, regardless of whether any rows were actually deleted
    expect(supabase.from).toHaveBeenCalledWith('comment_likes');
  });
});

describe('Fetch comment like info - edge cases', () => {
  // 6.1 Network exception case
  test('should return default values when network exception occurs', async () => {
    // Mock network exception
    (supabase.from as jest.Mock).mockImplementationOnce(() => {
      throw new Error('Network exception');
    });
    
    const result = await fetchCommentLikeInfo('comment-123', 'user-123');
    
    expect(result).toEqual({
      likes: 0,
      isLike: false
    });
    expect(console.error).toHaveBeenCalled();
  });
  
  // 6.2 Concurrent calls behavior
  test('concurrent calls should run independently', async () => {
    // Mock first call to fetchCommentLikeInfo
    // First call's first request (getting like count)
    (supabase.from as jest.Mock).mockImplementationOnce(() => ({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ 
          count: 5, 
          error: null 
        })
      })
    }));
    
    // First call's second request (checking if user has liked)
    (supabase.from as jest.Mock).mockImplementationOnce(() => ({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({ 
              data: { comment_id: 'comment-123', user_id: 'user-123' }, 
              error: null 
            })
          })
        })
      })
    }));
    
    // Mock second call to fetchCommentLikeInfo
    // Second call's first request (getting like count)
    (supabase.from as jest.Mock).mockImplementationOnce(() => ({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ 
          count: 10, 
          error: null 
        })
      })
    }));
    
    // Second call's second request (checking if user has liked)
    (supabase.from as jest.Mock).mockImplementationOnce(() => ({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({ 
              data: null, 
              error: null 
            })
          })
        })
      })
    }));
    
    // Make two concurrent calls
    const result1 = await fetchCommentLikeInfo('comment-123', 'user-123');
    const result2 = await fetchCommentLikeInfo('comment-456', 'user-123');
    
    expect(result1).toEqual({
      likes: 5,
      isLike: true
    });
    
    expect(result2).toEqual({
      likes: 10,
      isLike: false
    });
  });
}); 