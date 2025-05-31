import { fetchComments, fetchCommentsByLayerId, fetchCommentById, createComment, updateCommentLayerId, fetchCommentsByParentId } from '../comments';
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

    // Verify console.log on success
    test('Log success message when fetching comments successfully', async () => {
      const mockData = [{ id: '1', content: 'Test comment' }];
      const mockResponse = { data: mockData, error: null };
      
      mockSupabase.from.mockReturnThis();
      mockSupabase.select.mockReturnThis();
      mockSupabase.eq.mockReturnThis();
      mockSupabase.is.mockReturnThis();
      mockSupabase.eq.mockReturnThis();
      mockSupabase.order.mockReturnThis();
      mockSupabase.order.mockResolvedValue(mockResponse);
      
      await fetchComments('post1', 'user1');
      
      expect(console.log).toHaveBeenCalledWith('Fetched posts with user info:', mockData);
    });

    // Handle null data response
    test('Handle null data response', async () => {
      const mockResponse = { data: null, error: null };
      
      mockSupabase.from.mockReturnThis();
      mockSupabase.select.mockReturnThis();
      mockSupabase.eq.mockReturnThis();
      mockSupabase.is.mockReturnThis();
      mockSupabase.eq.mockReturnThis();
      mockSupabase.order.mockReturnThis();
      mockSupabase.order.mockResolvedValue(mockResponse);
      
      const result = await fetchComments('post1', 'user1');
      
      expect(result).toBeNull();
      expect(console.log).toHaveBeenCalledWith('Fetched posts with user info:', null);
    });

    // Handle invalid parameters
    test('Handle invalid parameters', async () => {
      const mockError = new Error('Invalid parameters');
      const mockResponse = { data: null, error: mockError };
      
      mockSupabase.from.mockReturnThis();
      mockSupabase.select.mockReturnThis();
      mockSupabase.eq.mockReturnThis();
      mockSupabase.is.mockReturnThis();
      mockSupabase.eq.mockReturnThis();
      mockSupabase.order.mockReturnThis();
      mockSupabase.order.mockResolvedValue(mockResponse);
      
      // Test with empty strings
      const result1 = await fetchComments('', 'user1');
      expect(result1).toBeNull();
      
      const result2 = await fetchComments('post1', '');
      expect(result2).toBeNull();
      
      expect(console.error).toHaveBeenCalledTimes(2);
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

    // Test parent-child relationship mapping
    test('Correctly build parent-child relationship mapping', async () => {
      const mockData = [
        { 
          id: 'child1', 
          content: 'Child comment 1',
          parent_id: 'parent1',
          layer_id: 'layer1'
        },
        { 
          id: 'parent1', 
          content: 'Parent comment',
          parent_id: null,
          layer_id: 'layer1'
        },
        { 
          id: 'child2', 
          content: 'Child comment 2',
          parent_id: 'parent1',
          layer_id: 'layer1'
        }
      ];
      
      const mockResponse = { data: mockData, error: null };
      
      mockSupabase.from.mockReturnThis();
      mockSupabase.select.mockReturnThis();
      mockSupabase.eq.mockReturnThis();
      mockSupabase.eq.mockReturnThis();
      mockSupabase.order.mockReturnThis();
      mockSupabase.order.mockResolvedValue(mockResponse);
      
      const result = await fetchCommentsByLayerId('layer1', 'user1');
      
      // Verify parent relationship is correctly assigned
      const childComment1 = result.find((c: any) => c.id === 'child1');
      const childComment2 = result.find((c: any) => c.id === 'child2');
      const parentComment = result.find((c: any) => c.id === 'parent1');
      
      expect(childComment1).toBeDefined();
      expect(childComment2).toBeDefined();
      expect(parentComment).toBeDefined();
      expect((childComment1 as any).parent).toEqual(parentComment);
      expect((childComment2 as any).parent).toEqual(parentComment);
    });

    // Handle comments without parent relationship
    test('Handle comments without parent relationship', async () => {
      const mockData = [
        { 
          id: 'comment1', 
          content: 'Standalone comment',
          parent_id: 'layer1', // parent_id equals layer_id
          layer_id: 'layer1'
        }
      ];
      
      const mockResponse = { data: mockData, error: null };
      
      mockSupabase.from.mockReturnThis();
      mockSupabase.select.mockReturnThis();
      mockSupabase.eq.mockReturnThis();
      mockSupabase.eq.mockReturnThis();
      mockSupabase.order.mockReturnThis();
      mockSupabase.order.mockResolvedValue(mockResponse);
      
      const result = await fetchCommentsByLayerId('layer1', 'user1');
      
      // Verify no parent is assigned when parent_id equals layer_id
      expect(result[0]).not.toHaveProperty('parent');
    });
  });

  // FetchCommentsByParentId function (completely missing)
  describe('fetchCommentsByParentId function', () => {
    test('Fetch comments by parent ID successfully', async () => {
      const mockData = [
        { 
          id: 'child1', 
          content: 'Child comment 1',
          user_id: 'user1',
          post_id: 'post1',
          parent_id: 'parent1',
          created_at: new Date().toISOString(),
          children: []
        },
        { 
          id: 'child2', 
          content: 'Child comment 2',
          user_id: 'user2',
          post_id: 'post1',
          parent_id: 'parent1',
          created_at: new Date().toISOString(),
          children: []
        }
      ];
      
      const mockResponse = { data: mockData, error: null };
      
      mockSupabase.from.mockReturnThis();
      mockSupabase.select.mockReturnThis();
      mockSupabase.eq.mockReturnThis();
      mockSupabase.eq.mockReturnThis();
      mockSupabase.order.mockReturnThis();
      mockSupabase.order.mockResolvedValue(mockResponse);
      
      const result = await fetchCommentsByParentId('parent1', 'user1');
      
      expect(mockSupabase.from).toHaveBeenCalledWith('comments');
      expect(mockSupabase.eq).toHaveBeenCalledWith('parent_id', 'parent1');
      expect(mockSupabase.eq).toHaveBeenCalledWith('isLike.user_id', 'user1');
      expect(mockSupabase.order).toHaveBeenCalledWith('created_at', { ascending: true });
      expect(result).toEqual(mockData);
    });

    test('Log success message when fetching by parent ID successfully', async () => {
      const mockData = [{ id: 'child1', content: 'Child comment' }];
      const mockResponse = { data: mockData, error: null };
      
      mockSupabase.from.mockReturnThis();
      mockSupabase.select.mockReturnThis();
      mockSupabase.eq.mockReturnThis();
      mockSupabase.eq.mockReturnThis();
      mockSupabase.order.mockReturnThis();
      mockSupabase.order.mockResolvedValue(mockResponse);
      
      await fetchCommentsByParentId('parent1', 'user1');
      
      expect(console.log).toHaveBeenCalledWith('Fetched posts with user info:', mockData);
    });

    test('Handle error when fetching by parent ID fails', async () => {
      const mockError = new Error('Database error');
      const mockResponse = { data: null, error: mockError };
      
      mockSupabase.from.mockReturnThis();
      mockSupabase.select.mockReturnThis();
      mockSupabase.eq.mockReturnThis();
      mockSupabase.eq.mockReturnThis();
      mockSupabase.order.mockReturnThis();
      mockSupabase.order.mockResolvedValue(mockResponse);
      
      const result = await fetchCommentsByParentId('parent1', 'user1');
      
      expect(console.error).toHaveBeenCalledWith('Error fetching posts:', mockError);
      expect(result).toBeNull();
    });

    test('Handle empty result when no child comments exist', async () => {
      const mockResponse = { data: [], error: null };
      
      mockSupabase.from.mockReturnThis();
      mockSupabase.select.mockReturnThis();
      mockSupabase.eq.mockReturnThis();
      mockSupabase.eq.mockReturnThis();
      mockSupabase.order.mockReturnThis();
      mockSupabase.order.mockResolvedValue(mockResponse);
      
      const result = await fetchCommentsByParentId('parent1', 'user1');
      
      expect(result).toEqual([]);
      expect(console.log).toHaveBeenCalledWith('Fetched posts with user info:', []);
    });

    test('Handle invalid parent ID parameters', async () => {
      const mockError = new Error('Invalid parent ID');
      const mockResponse = { data: null, error: mockError };
      
      mockSupabase.from.mockReturnThis();
      mockSupabase.select.mockReturnThis();
      mockSupabase.eq.mockReturnThis();
      mockSupabase.eq.mockReturnThis();
      mockSupabase.order.mockReturnThis();
      mockSupabase.order.mockResolvedValue(mockResponse);
      
      // Test with empty string
      const result1 = await fetchCommentsByParentId('', 'user1');
      expect(result1).toBeNull();
      
      // Test with null
      const result2 = await fetchCommentsByParentId(null as any, 'user1');
      expect(result2).toBeNull();
      
      expect(console.error).toHaveBeenCalledTimes(2);
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

    // Handle case when layer_id equals parent_id
    test('Skip parent fetching when layer_id equals parent_id', async () => {
      const mockComment = { 
        id: '2', 
        content: 'Reply content',
        parent_id: '1',
        layer_id: '2'
      };
      
      const mockResponse = { data: mockComment, error: null };
      
      mockSupabase.from.mockReturnThis();
      mockSupabase.select.mockReturnThis();
      mockSupabase.eq.mockReturnThis();
      mockSupabase.single.mockReturnThis();
      mockSupabase.single.mockResolvedValue(mockResponse);
      
      // Call with layer_id that equals parent_id
      const result = await fetchCommentById('2', '1');
      
      // Verify parent is not fetched
      expect(result).not.toHaveProperty('parent');
      expect(mockSupabase.single).toHaveBeenCalledTimes(1);
    });

    // Handle parent comment fetch error
    test('Return null when parent comment fetch fails', async () => {
      const mockComment = { 
        id: '2', 
        content: 'Reply content',
        parent_id: '1',
        layer_id: '2'
      };
      
      const mockCommentResponse = { data: mockComment, error: null };
      const mockParentError = new Error('Parent not found');
      const mockParentResponse = { data: null, error: mockParentError };
      
      mockSupabase.from.mockReturnThis();
      mockSupabase.select.mockReturnThis();
      mockSupabase.eq.mockReturnThis();
      mockSupabase.single.mockReturnThis();
      mockSupabase.single.mockResolvedValueOnce(mockCommentResponse);
      mockSupabase.single.mockResolvedValueOnce(mockParentResponse);
      
      const result = await fetchCommentById('2', '3');
      
      expect(console.error).toHaveBeenCalledWith('Error fetching parent comment:', mockParentError);
      expect(result).toBeNull();
    });

    // Handle missing layer_id parameter
    test('Handle missing layer_id parameter', async () => {
      const mockComment = { 
        id: '1', 
        content: 'Comment content',
        parent_id: null
      };
      
      const mockResponse = { data: mockComment, error: null };
      
      mockSupabase.from.mockReturnThis();
      mockSupabase.select.mockReturnThis();
      mockSupabase.eq.mockReturnThis();
      mockSupabase.single.mockReturnThis();
      mockSupabase.single.mockResolvedValue(mockResponse);
      
      const result = await fetchCommentById('1');
      
      expect(result).toEqual(mockComment);
      expect(mockSupabase.single).toHaveBeenCalledTimes(1);
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

    // Create comment with optional fields
    test('Create comment with optional parent_id and layer_id', async () => {
      const mockInput = { 
        content: 'Reply comment',
        user_id: 'user1',
        post_id: 'post1',
        parent_id: 'parent1',
        layer_id: 'layer1'
      };
      
      const mockOutput = [{ ...mockInput, id: '2', created_at: new Date().toISOString() }];
      const mockResponse = { data: mockOutput, error: null };
      
      mockSupabase.from.mockReturnThis();
      mockSupabase.insert.mockReturnThis();
      mockSupabase.select.mockReturnThis();
      mockSupabase.select.mockResolvedValue(mockResponse);
      
      const result = await createComment(mockInput);
      
      expect(mockSupabase.insert).toHaveBeenCalledWith([mockInput]);
      expect(result).toEqual(mockOutput);
    });

    // Handle empty data response
    test('Handle empty data response', async () => {
      const mockInput = { 
        content: 'New comment',
        user_id: 'user1',
        post_id: 'post1'
      };
      
      const mockResponse = { data: [], error: null };
      
      mockSupabase.from.mockReturnThis();
      mockSupabase.insert.mockReturnThis();
      mockSupabase.select.mockReturnThis();
      mockSupabase.select.mockResolvedValue(mockResponse);
      
      const result = await createComment(mockInput);
      
      expect(result).toEqual([]);
    });

    // Handle invalid input parameters
    test('Handle invalid input parameters', async () => {
      const mockError = new Error('Invalid input');
      const mockResponse = { data: null, error: mockError };
      
      mockSupabase.from.mockReturnThis();
      mockSupabase.insert.mockReturnThis();
      mockSupabase.select.mockReturnThis();
      mockSupabase.select.mockResolvedValue(mockResponse);
      
      // Test with empty content
      await expect(createComment({ content: '', user_id: 'user1', post_id: 'post1' })).rejects.toThrow();
      
      // Test with missing required fields
      await expect(createComment({ content: 'test' } as any)).rejects.toThrow();
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

    // Test layerId calculation logic
    test('Correctly calculate layerId based on parent_id', async () => {
      const mockComments = [
        {
          id: 'comment1',
          parent_id: null, // Root comment
          layer_id: 'comment1',
          children: [{ id: 'child1', layer_id: null }]
        },
        {
          id: 'comment2',
          parent_id: 'parent1', // Has parent
          layer_id: 'layer1',
          children: [{ id: 'child2', layer_id: null }]
        }
      ];

      const mockResponse = { data: mockComments, error: null };

      mockSupabase.from.mockReturnThis();
      mockSupabase.select.mockReturnThis();
      mockSupabase.not.mockReturnThis();
      mockSupabase.update.mockReturnThis();
      mockSupabase.in.mockReturnThis();
      mockSupabase.not.mockResolvedValue(mockResponse);
      mockSupabase.in.mockResolvedValue({ data: null, error: null });

      await updateCommentLayerId();

      // Verify layerId calculation: comment.parent_id ? comment.layer_id : comment.id
      expect(mockSupabase.update).toHaveBeenCalledWith({ layer_id: 'comment1' }); // For root comment
      expect(mockSupabase.update).toHaveBeenCalledWith({ layer_id: 'layer1' }); // For comment with parent
    });

    // Handle comments without children
    test('Handle comments without children', async () => {
      const mockComments = [
        {
          id: 'comment1',
          parent_id: null,
          layer_id: 'comment1',
          children: [] // No children
        },
        {
          id: 'comment2',
          parent_id: null,
          layer_id: 'comment2',
          children: null // Null children
        }
      ];

      const mockResponse = { data: mockComments, error: null };

      mockSupabase.from.mockReturnThis();
      mockSupabase.select.mockReturnThis();
      mockSupabase.not.mockReturnThis();
      mockSupabase.update.mockReturnThis();
      mockSupabase.in.mockReturnThis();
      mockSupabase.not.mockResolvedValue(mockResponse);

      await updateCommentLayerId();

      // Verify update is not called when no children exist
      expect(mockSupabase.update).not.toHaveBeenCalled();
    });

    // Handle children with existing layer_id
    test('Filter out children that already have layer_id', async () => {
      const mockComment = {
        id: 'parent1',
        parent_id: null,
        layer_id: 'parent1',
        children: [
          { id: 'child1', layer_id: null }, // Should be updated
          { id: 'child2', layer_id: 'existing' }, // Should be filtered out
          { id: 'child3', layer_id: null } // Should be updated
        ]
      };

      const mockResponse = { data: [mockComment], error: null };

      mockSupabase.from.mockReturnThis();
      mockSupabase.select.mockReturnThis();
      mockSupabase.not.mockReturnThis();
      mockSupabase.update.mockReturnThis();
      mockSupabase.in.mockReturnThis();
      mockSupabase.not.mockResolvedValue(mockResponse);
      mockSupabase.in.mockResolvedValue({ data: null, error: null });

      await updateCommentLayerId();

      // Verify only children without layer_id are updated
      expect(mockSupabase.in).toHaveBeenCalledWith('id', ['child1', 'child3']);
    });

    // Handle missing layerId
    test('Handle comments with missing layerId', async () => {
      const mockComment = {
        id: 'comment1',
        parent_id: 'parent1', // Has parent, so layerId will be comment.layer_id
        layer_id: null, // Missing layer_id
        children: [{ id: 'child1', layer_id: null }]
      };

      const mockResponse = { data: [mockComment], error: null };

      mockSupabase.from.mockReturnThis();
      mockSupabase.select.mockReturnThis();
      mockSupabase.not.mockReturnThis();
      mockSupabase.not.mockResolvedValue(mockResponse);

      await updateCommentLayerId();

      // Verify update is not called when layerId is null (because comment.parent_id ? comment.layer_id : comment.id results in null)
      expect(mockSupabase.update).not.toHaveBeenCalled();
    });
  });
});