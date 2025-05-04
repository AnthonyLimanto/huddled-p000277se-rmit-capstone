// Import functions to be tested
import { fetchCommentLikeInfo, addCommentLike, deleteCommentLike } from '../comment_likes';
import { supabase } from '../supabase';

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  // Set up console error listener to avoid showing too many error logs during testing
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

describe('fetchCommentLikeInfo function', () => {
  // 1.1 Normal case: 5 likes total, current user has liked
  test('should return correct like count and user like status', async () => {
    // Mock first call (get like count)
    (supabase.from as jest.Mock).mockImplementationOnce(() => ({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ count: 5, error: null })
      })
    }));
    
    // Mock second call (get user like status)
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
    
    const result = await fetchCommentLikeInfo('comment-123', 'user-123');
    
    expect(result).toEqual({
      likes: 5,
      isLike: true
    });
    
    expect(supabase.from).toHaveBeenCalledWith('comment_likes');
  });
  
  // 1.2 Normal case: 0 likes total, current user has not liked
  test('should return correct like count (0) and user not liked status', async () => {
    // Mock first call (get like count)
    (supabase.from as jest.Mock).mockImplementationOnce(() => ({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ count: 0, error: null })
      })
    }));
    
    // Mock second call (get user like status)
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
    
    const result = await fetchCommentLikeInfo('comment-123', 'user-123');
    
    expect(result).toEqual({
      likes: 0,
      isLike: false
    });
    
    expect(supabase.from).toHaveBeenCalledWith('comment_likes');
  });
  
  // 1.3 Exception case: Error when querying like count
  test('should return default values when like count query fails', async () => {
    // Mock count query error
    (supabase.from as jest.Mock).mockImplementationOnce(() => ({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ count: null, error: new Error('Database error') })
      })
    }));
    
    const result = await fetchCommentLikeInfo('comment-123', 'user-123');
    
    expect(result).toEqual({
      likes: 0,
      isLike: false
    });
    expect(console.error).toHaveBeenCalled();
  });
  
  // 1.4 Exception case: Error when querying user like status
  test('should return default values when user like status query fails', async () => {
    // Mock first call (get like count)
    (supabase.from as jest.Mock).mockImplementationOnce(() => ({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ count: 5, error: null })
      })
    }));
    
    // Mock user like query error
    (supabase.from as jest.Mock).mockImplementationOnce(() => ({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({ 
              data: null, 
              error: new Error('User like status query error') 
            })
          })
        })
      })
    }));
    
    const result = await fetchCommentLikeInfo('comment-123', 'user-123');
    
    expect(result).toEqual({
      likes: 0,
      isLike: false
    });
    expect(console.error).toHaveBeenCalled();
  });
});

describe('addCommentLike function', () => {
  // 2.1 Normal case: Successfully insert like record
  test('should return true when like record is successfully inserted', async () => {
    // Mock successful insert operation
    (supabase.from as jest.Mock).mockImplementationOnce(() => ({
      insert: jest.fn().mockResolvedValue({ data: {}, error: null })
    }));
    
    const result = await addCommentLike('comment-123', 'user-123');
    
    expect(result).toBe(true);
    expect(supabase.from).toHaveBeenCalledWith('comment_likes');
  });
  
  // 2.2 Exception case: Failed to insert like record
  test('should return false when like record insertion fails', async () => {
    // Mock failed insert operation
    (supabase.from as jest.Mock).mockImplementationOnce(() => ({
      insert: jest.fn().mockResolvedValue({ 
        data: null, 
        error: new Error('Failed to insert like record') 
      })
    }));
    
    const result = await addCommentLike('comment-123', 'user-123');
    
    expect(result).toBe(false);
    expect(console.error).toHaveBeenCalled();
  });
});

describe('deleteCommentLike function', () => {
  // 3.1 Normal case: Successfully delete like record
  test('should return true when like record is successfully deleted', async () => {
    // Mock successful delete operation
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
  
  // 3.2 Exception case: Failed to delete like record
  test('should return false when like record deletion fails', async () => {
    // Mock failed delete operation
    (supabase.from as jest.Mock).mockImplementationOnce(() => ({
      delete: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: new Error('Failed to delete like record') })
        })
      })
    }));
    
    const result = await deleteCommentLike('comment-123', 'user-123');
    
    expect(result).toBe(false);
    expect(console.error).toHaveBeenCalled();
  });
}); 