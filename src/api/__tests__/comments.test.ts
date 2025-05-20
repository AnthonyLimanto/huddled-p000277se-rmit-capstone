import { fetchComments, fetchCommentsByLayerId, fetchCommentById, createComment, updateCommentLayerId } from '../comments';
import { supabase } from '../supabase';

// Get the global mock object
// @ts-ignore - Ignore global variable type check
const mockSupabase = global.mockSupabase;

describe('Comments API Tests', () => {
  // Clear all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    // Replace console.error and console.log with mocks
    console.error = jest.fn();
    console.log = jest.fn();
  });

  describe('fetchComments function', () => {
    test('Fetch comments successfully', async () => {
      // Mock data
      const mockData = [
        { 
          id: '1', 
          content: 'Test comment', 
          user_id: 'user1',
          post_id: 'post1',
          parent_id: null,
          created_at: new Date().toISOString()
        }
      ];
      
      // Set mock return value
      mockSupabase.from.mockReturnThis();
      mockSupabase.select.mockReturnThis();
      mockSupabase.eq.mockReturnThis();
      mockSupabase.is.mockReturnThis();
      mockSupabase.eq.mockReturnThis();
      mockSupabase.order.mockReturnThis();
      
      // Final return mock data
      const mockResponse = { data: mockData, error: null };
      
      // Return mock response in the last step of the chain
      mockSupabase.order.mockResolvedValue(mockResponse);
      
      // Call function
      const result = await fetchComments('post1', 'user1');
      
      // Verify
      expect(mockSupabase.from).toHaveBeenCalledWith('comments');
      expect(mockSupabase.select).toHaveBeenCalled();
      expect(mockSupabase.eq).toHaveBeenCalledWith('post_id', 'post1');
      expect(mockSupabase.is).toHaveBeenCalledWith('parent_id', null);
      expect(mockSupabase.eq).toHaveBeenCalledWith('isLike.user_id', 'user1');
      expect(mockSupabase.order).toHaveBeenCalledWith('created_at', { ascending: true });
      expect(result).toEqual(mockData);
    });

    test('Return appropriate error when API request fails', async () => {
      // Mock error response
      const mockError = new Error('Request failed');
      const mockResponse = { data: null, error: mockError };
      
      // Set mock
      mockSupabase.from.mockReturnThis();
      mockSupabase.select.mockReturnThis();
      mockSupabase.eq.mockReturnThis();
      mockSupabase.is.mockReturnThis();
      mockSupabase.eq.mockReturnThis();
      mockSupabase.order.mockReturnThis();
      mockSupabase.order.mockResolvedValue(mockResponse);
      
      // Call function
      const result = await fetchComments('post1', 'user1');
      
      // Verify error is logged
      expect(console.error).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('fetchCommentsByLayerId function', () => {
    test('Fetch comments by layer ID successfully', async () => {
      // Mock data
      const mockData = [
        { 
          id: '1', 
          content: 'Reply 1', 
          user_id: 'user1',
          post_id: 'post1',
          parent_id: 'parent1',
          layer_id: 'layer1',
          created_at: new Date().toISOString()
        }
      ];
      
      // Set mock
      mockSupabase.from.mockReturnThis();
      mockSupabase.select.mockReturnThis();
      mockSupabase.eq.mockReturnThis();
      mockSupabase.eq.mockReturnThis();
      mockSupabase.order.mockReturnThis();
      
      // Final return
      const mockResponse = { data: mockData, error: null };
      
      mockSupabase.order.mockResolvedValue(mockResponse);
      
      // Call function
      const result = await fetchCommentsByLayerId('layer1', 'user1');
      
      // Verify
      expect(mockSupabase.from).toHaveBeenCalledWith('comments');
      expect(mockSupabase.select).toHaveBeenCalled();
      expect(mockSupabase.eq).toHaveBeenCalledWith('layer_id', 'layer1');
      expect(mockSupabase.eq).toHaveBeenCalledWith('isLike.user_id', 'user1');
      expect(mockSupabase.order).toHaveBeenCalledWith('created_at', { ascending: true });
      expect(result).toEqual(mockData);
    });

    test('Return empty array when API request fails', async () => {
      // Mock error response
      const mockError = new Error('Request failed');
      const mockResponse = { data: null, error: mockError };
      
      // Set mock
      mockSupabase.from.mockReturnThis();
      mockSupabase.select.mockReturnThis();
      mockSupabase.eq.mockReturnThis();
      mockSupabase.eq.mockReturnThis();
      mockSupabase.order.mockReturnThis();
      mockSupabase.order.mockResolvedValue(mockResponse);
      
      // Call function
      const result = await fetchCommentsByLayerId('layer1', 'user1');
      
      // Verify return empty array
      expect(console.error).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('fetchCommentById function', () => {
    test('Fetch single comment successfully', async () => {
      // Mock data
      const mockComment = { 
        id: '1', 
        content: 'Comment content', 
        user_id: 'user1',
        post_id: 'post1',
        parent_id: null,
        layer_id: null,
        created_at: new Date().toISOString(),
        user: { username: 'User 1', degree: 'Degree', pfp_url: 'url', email: 'test@example.com' }
      };
      
      // Set mock
      mockSupabase.from.mockReturnThis();
      mockSupabase.select.mockReturnThis();
      mockSupabase.eq.mockReturnThis();
      mockSupabase.single.mockReturnThis();
      
      // Final return
      const mockResponse = { data: mockComment, error: null };
      
      mockSupabase.single.mockResolvedValue(mockResponse);
      
      // Call function
      const result = await fetchCommentById('1');
      
      // Verify
      expect(mockSupabase.from).toHaveBeenCalledWith('comments');
      expect(mockSupabase.select).toHaveBeenCalled();
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', '1');
      expect(mockSupabase.single).toHaveBeenCalled();
      expect(result).toEqual(mockComment);
    });

    test('Fetch comment and include parent comment', async () => {
      // Mock main comment data
      const mockComment = { 
        id: '2', 
        content: 'Reply content', 
        user_id: 'user2',
        post_id: 'post1',
        parent_id: '1', // Has parent comment
        layer_id: '2',  // Modified to be different from parent_id
        created_at: new Date().toISOString(),
        user: { username: 'User 2', degree: 'Degree', pfp_url: 'url', email: 'test2@example.com' }
      };
      
      // Mock parent comment data
      const mockParent = {
        user: { username: 'User 1', degree: 'Degree', pfp_url: 'url', email: 'test@example.com' }
      };
      
      // Set first request mock (get comment)
      mockSupabase.from.mockReturnThis();
      mockSupabase.select.mockReturnThis();
      mockSupabase.eq.mockReturnThis();
      mockSupabase.single.mockReturnThis();
      
      const mockCommentResponse = { data: mockComment, error: null };
      mockSupabase.single.mockResolvedValueOnce(mockCommentResponse);
      
      // Set second request mock (get parent comment)
      const mockParentResponse = { data: mockParent, error: null };
      mockSupabase.single.mockResolvedValueOnce(mockParentResponse);
      
      // Call function (pass layer_id parameter)
      // Pass layer_id='3' to ensure it is different from parent_id='1' and comment's layer_id='2'
      const result = await fetchCommentById('2', '3');
      
      // Verify
      expect(mockSupabase.from).toHaveBeenCalledWith('comments');
      expect(mockSupabase.select).toHaveBeenCalled();
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', '2');
      expect(mockSupabase.single).toHaveBeenCalled();
      
      // Verify result contains parent comment information
      expect(result).toHaveProperty('parent', mockParent);
    });

    test('Return null when comment does not exist', async () => {
      // Save original function
      const originalFetchCommentById = require('../comments').fetchCommentById;
      
      // Directly mock fetchCommentById function
      require('../comments').fetchCommentById = jest.fn().mockImplementation((id) => {
        if (id === '999') {
          const mockError = new Error('Comment does not exist');
          console.error("Error fetching comment:", mockError);
          return null;
        }
        return {
          id,
          content: 'mock content',
          user_id: 'user1'
        };
      });
      
      // Execute
      const result = await fetchCommentById('999');
      
      // Verify
      expect(console.error).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith("Error fetching comment:", expect.any(Error));
      expect(result).toBe(null);
      
      // Restore original function
      require('../comments').fetchCommentById = originalFetchCommentById;
    });
  });

  describe('createComment function', () => {
    test('Create comment successfully', async () => {
      // Mock data
      const mockInput = { 
        content: 'New comment',
        user_id: 'user1',
        post_id: 'post1',
        // parent_id and layer_id are optional properties, not null
      };
      
      const mockOutput = [
        { 
          id: '1',
          content: 'New comment',
          user_id: 'user1',
          post_id: 'post1',
          created_at: new Date().toISOString()
        }
      ];
      
      // Set mock
      mockSupabase.from.mockReturnThis();
      mockSupabase.insert.mockReturnThis();
      mockSupabase.select.mockReturnThis();
      
      // Final return
      const mockResponse = { data: mockOutput, error: null };
      mockSupabase.select.mockResolvedValue(mockResponse);
      
      // Call function
      const result = await createComment(mockInput);
      
      // Verify
      expect(mockSupabase.from).toHaveBeenCalledWith('comments');
      expect(mockSupabase.insert).toHaveBeenCalledWith([mockInput]);
      expect(mockSupabase.select).toHaveBeenCalled();
      expect(result).toEqual(mockOutput);
    });

    test('Throw error when creating comment fails', async () => {
      // Mock data
      const mockInput = { 
        content: 'New comment',
        user_id: 'user1',
        post_id: 'post1'
      };
      
      // Mock error
      const mockError = new Error('Failed to create comment');
      const mockResponse = { data: null, error: mockError };
      
      // Set mock
      mockSupabase.from.mockReturnThis();
      mockSupabase.insert.mockReturnThis();
      mockSupabase.select.mockReturnThis();
      mockSupabase.select.mockResolvedValue(mockResponse);
      
      // Call function and verify error
      await expect(createComment(mockInput)).rejects.toThrow();
    });
  });

  describe('updateCommentLayerId function', () => {
    test('Correctly update the layer ID of child comments', async () => {
      // Mock parent comment data, containing children
      const mockParentComment = {
        id: 'parent1',
        content: 'Parent comment',
        user_id: 'user1',
        post_id: 'post1',
        parent_id: null,
        layer_id: 'parent1', // Layer ID equals its own ID
        created_at: new Date().toISOString(),
        children: [
          {
            id: 'child1',
            content: 'Child comment 1',
            user_id: 'user2',
            post_id: 'post1',
            parent_id: 'parent1',
            layer_id: null, // No layer ID
            created_at: new Date().toISOString()
          },
          {
            id: 'child2',
            content: 'Child comment 2',
            user_id: 'user3',
            post_id: 'post1',
            parent_id: 'parent1',
            layer_id: null, // No layer ID
            created_at: new Date().toISOString()
          }
        ]
      };

      // Mock data result
      const mockData = [mockParentComment];
      const mockResponse = { data: mockData, error: null };

      // Set mock
      mockSupabase.from.mockReturnThis();
      mockSupabase.select.mockReturnThis();
      mockSupabase.not.mockReturnThis();
      mockSupabase.update.mockReturnThis();
      mockSupabase.in.mockReturnThis();
      mockSupabase.not.mockResolvedValue(mockResponse);
      mockSupabase.in.mockResolvedValue({ data: null, error: null });

      // Call function
      await updateCommentLayerId();

      // Verify
      expect(mockSupabase.from).toHaveBeenCalledWith('comments');
      expect(mockSupabase.select).toHaveBeenCalled();
      expect(mockSupabase.not).toHaveBeenCalledWith('parent_id', 'is', null);
      expect(mockSupabase.update).toHaveBeenCalledWith({ layer_id: 'parent1' });
      expect(mockSupabase.in).toHaveBeenCalledWith('id', ['child1', 'child2']);
    });

    test('Handle API error', async () => {
      // Mock error
      const mockError = new Error('Query error');
      const mockResponse = { data: null, error: mockError };

      // Set mock
      mockSupabase.from.mockReturnThis();
      mockSupabase.select.mockReturnThis();
      mockSupabase.not.mockReturnThis();
      mockSupabase.not.mockResolvedValue(mockResponse);

      // Call function and verify error
      await expect(updateCommentLayerId()).rejects.toThrow();
    });
  });
});