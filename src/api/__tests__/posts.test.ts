// Import functions to be tested
import { 
  createPost, 
  fetchPosts, 
  searchPosts,
  fetchPostsByUserId
} from '../posts';
import { supabase } from '../supabase';

// Test data types
interface PostData {
  id?: string;
  user_id?: string;
  content?: string;
  image_url?: string;
  created_at?: string;
  profile?: {
    username?: string;
    degree?: string;
    pfp_url?: string;
    email?: string;
  };
  count?: { count: number };
  likes?: { count: number };
  isLike?: { user_id: string } | null;
}

// Declare global types for test data
declare global {
  var mockPostsData: any;
  var mockSinglePost: any;
  var mockCreatedPost: any;
  var mockDatabaseResponses: any;
}

describe('Posts API Module Tests', () => {

  describe('createPost()', () => {
    test('Successfully create post', async () => {
      // Set mock return success
      const mockSelect = jest.fn().mockResolvedValue(globalThis.mockDatabaseResponses.createPostSuccess);
      const mockInsert = jest.fn().mockReturnValue({ select: mockSelect });
      const mockFrom = jest.fn().mockReturnValue({ insert: mockInsert });
      
      (supabase.from as jest.Mock).mockImplementation(mockFrom);
      
      // Call function
      const result = await createPost('test-user-id', 'New test post', 'https://example.com/new-image.jpg');
      
      // Verify result
      expect(supabase.from).toHaveBeenCalledWith('posts');
      expect(mockInsert).toHaveBeenCalledWith([{
        user_id: 'test-user-id',
        content: 'New test post',
        image_url: 'https://example.com/new-image.jpg'
      }]);
      expect(result).toEqual([globalThis.mockCreatedPost]);
    });

    test('Failed to create post - database error', async () => {
      // Set mock return error
      const mockSelect = jest.fn().mockResolvedValue(globalThis.mockDatabaseResponses.createPostError);
      const mockInsert = jest.fn().mockReturnValue({ select: mockSelect });
      const mockFrom = jest.fn().mockReturnValue({ insert: mockInsert });
      
      (supabase.from as jest.Mock).mockImplementation(mockFrom);
      
      // Verify function throws error
      await expect(createPost('test-user-id', 'New test post', 'https://example.com/image.jpg'))
        .rejects.toThrow('Failed to create post');
    });

    test('Invalid input - empty content', async () => {
      // Test empty content input
      const mockSelect = jest.fn().mockResolvedValue(globalThis.mockDatabaseResponses.createPostSuccess);
      const mockInsert = jest.fn().mockReturnValue({ select: mockSelect });
      const mockFrom = jest.fn().mockReturnValue({ insert: mockInsert });
      
      (supabase.from as jest.Mock).mockImplementation(mockFrom);
      
      // Call function - empty content should also be processed
      const result = await createPost('test-user-id', '', 'https://example.com/image.jpg');
      
      // Verify call parameters
      expect(mockInsert).toHaveBeenCalledWith([{
        user_id: 'test-user-id',
        content: '',
        image_url: 'https://example.com/image.jpg'
      }]);
    });

    test('Boundary test - very long content', async () => {
      const longContent = 'a'.repeat(1000);
      
      const mockSelect = jest.fn().mockResolvedValue(globalThis.mockDatabaseResponses.createPostSuccess);
      const mockInsert = jest.fn().mockReturnValue({ select: mockSelect });
      const mockFrom = jest.fn().mockReturnValue({ insert: mockInsert });
      
      (supabase.from as jest.Mock).mockImplementation(mockFrom);
      
      const result = await createPost('test-user-id', longContent, 'https://example.com/image.jpg');
      
      expect(mockInsert).toHaveBeenCalledWith([{
        user_id: 'test-user-id',
        content: longContent,
        image_url: 'https://example.com/image.jpg'
      }]);
    });
  });

  describe('fetchPosts()', () => {
    test('Successfully return post list', async () => {
      // Set mock chain call
      const mockOrder = jest.fn().mockResolvedValue(globalThis.mockDatabaseResponses.fetchPostsSuccess);
      const mockEq = jest.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = jest.fn().mockReturnValue({ select: mockSelect });
      
      (supabase.from as jest.Mock).mockImplementation(mockFrom);
      
      // Call function
      const result = await fetchPosts('test-user-id');
      
      // Verify call
      expect(supabase.from).toHaveBeenCalledWith('posts');
      expect(mockSelect).toHaveBeenCalledWith(`
      id,
      content,
      created_at,
      image_url,
      profile:users!user_id(username, degree, pfp_url, email),
      count:comments(count),
      likes:post_likes!post_id(count),
      isLike:post_likes!post_id(user_id)
    `);
      expect(mockEq).toHaveBeenCalledWith('isLike.user_id', 'test-user-id');
      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(result).toEqual(globalThis.mockPostsData);
    });

    test('Empty data situation', async () => {
      // Set mock return empty array
      const mockOrder = jest.fn().mockResolvedValue(globalThis.mockDatabaseResponses.fetchPostsEmpty);
      const mockEq = jest.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = jest.fn().mockReturnValue({ select: mockSelect });
      
      (supabase.from as jest.Mock).mockImplementation(mockFrom);
      
      // Call function
      const result = await fetchPosts('test-user-id');
      
      // Verify return empty array
      expect(result).toEqual([]);
      expect(result?.length).toBe(0);
    });

    test('API error', async () => {
      // Set mock return error
      const mockOrder = jest.fn().mockResolvedValue(globalThis.mockDatabaseResponses.fetchPostsError);
      const mockEq = jest.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = jest.fn().mockReturnValue({ select: mockSelect });
      
      (supabase.from as jest.Mock).mockImplementation(mockFrom);
      
      // Call function
      const result = await fetchPosts('test-user-id');
      
      // Verify error is logged but not thrown
      expect(console.error).toHaveBeenCalledWith('Error fetching posts:', expect.any(Error));
      expect(result).toBeNull(); // Function returns data (null) when error occurs
    });

    test('Network error handling', async () => {
      // Set mock return network error
      const mockOrder = jest.fn().mockResolvedValue(globalThis.mockDatabaseResponses.networkError);
      const mockEq = jest.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = jest.fn().mockReturnValue({ select: mockSelect });
      
      (supabase.from as jest.Mock).mockImplementation(mockFrom);
      
      const result = await fetchPosts('test-user-id');
      
      expect(console.error).toHaveBeenCalledWith('Error fetching posts:', expect.any(Error));
      expect(result).toBeNull(); // Function returns data (null) when error occurs
    });

    test('Supabase 超时测试 - fetchPosts', async () => {
      // Simulate timeout error - fetchPosts should catch exception and return undefined
      const timeoutError = new Error('Request timeout');
      const mockOrder = jest.fn().mockResolvedValue({ data: null, error: timeoutError });
      const mockEq = jest.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = jest.fn().mockReturnValue({ select: mockSelect });
      
      (supabase.from as jest.Mock).mockImplementation(mockFrom);
      
      // fetchPosts should catch exception and return undefined
      const result = await fetchPosts('test-user-id');
      expect(result).toBeNull(); // When error exists, data is null
      expect(console.error).toHaveBeenCalledWith('Error fetching posts:', timeoutError);
    });
  });

  describe('searchPosts()', () => {
    test('Successfully search posts', async () => {
      // Set mock chain call
      const mockOrder = jest.fn().mockResolvedValue(globalThis.mockDatabaseResponses.fetchPostsSuccess);
      const mockEq = jest.fn().mockReturnValue({ order: mockOrder });
      const mockIlike = jest.fn().mockReturnValue({ eq: mockEq });
      const mockSelect = jest.fn().mockReturnValue({ ilike: mockIlike });
      const mockFrom = jest.fn().mockReturnValue({ select: mockSelect });
      
      (supabase.from as jest.Mock).mockImplementation(mockFrom);
      
      // Call function
      const result = await searchPosts('test', 'test-user-id');
      
      // Verify call
      expect(supabase.from).toHaveBeenCalledWith('posts');
      expect(mockIlike).toHaveBeenCalledWith('content', '%test%');
      expect(mockEq).toHaveBeenCalledWith('isLike.user_id', 'test-user-id');
      expect(result).toEqual(globalThis.mockPostsData);
    });

    test('No results found', async () => {
      const mockOrder = jest.fn().mockResolvedValue(globalThis.mockDatabaseResponses.fetchPostsEmpty);
      const mockEq = jest.fn().mockReturnValue({ order: mockOrder });
      const mockIlike = jest.fn().mockReturnValue({ eq: mockEq });
      const mockSelect = jest.fn().mockReturnValue({ ilike: mockIlike });
      const mockFrom = jest.fn().mockReturnValue({ select: mockSelect });
      
      (supabase.from as jest.Mock).mockImplementation(mockFrom);
      
      const result = await searchPosts('nonexistent', 'test-user-id');
      
      expect(result).toEqual([]);
    });

    test('Search failed - throw error', async () => {
      const mockOrder = jest.fn().mockResolvedValue(globalThis.mockDatabaseResponses.fetchPostsError);
      const mockEq = jest.fn().mockReturnValue({ order: mockOrder });
      const mockIlike = jest.fn().mockReturnValue({ eq: mockEq });
      const mockSelect = jest.fn().mockReturnValue({ ilike: mockIlike });
      const mockFrom = jest.fn().mockReturnValue({ select: mockSelect });
      
      (supabase.from as jest.Mock).mockImplementation(mockFrom);
      
      await expect(searchPosts('test', 'test-user-id')).rejects.toThrow('Failed to fetch posts');
    });

    test('Boundary test - empty search term', async () => {
      const mockOrder = jest.fn().mockResolvedValue(globalThis.mockDatabaseResponses.fetchPostsSuccess);
      const mockEq = jest.fn().mockReturnValue({ order: mockOrder });
      const mockIlike = jest.fn().mockReturnValue({ eq: mockEq });
      const mockSelect = jest.fn().mockReturnValue({ ilike: mockIlike });
      const mockFrom = jest.fn().mockReturnValue({ select: mockSelect });
      
      (supabase.from as jest.Mock).mockImplementation(mockFrom);
      
      const result = await searchPosts('', 'test-user-id');
      
      expect(mockIlike).toHaveBeenCalledWith('content', '%%');
      expect(result).toEqual(globalThis.mockPostsData);
    });

    test('Boundary test - special character search', async () => {
      const mockOrder = jest.fn().mockResolvedValue(globalThis.mockDatabaseResponses.fetchPostsSuccess);
      const mockEq = jest.fn().mockReturnValue({ order: mockOrder });
      const mockIlike = jest.fn().mockReturnValue({ eq: mockEq });
      const mockSelect = jest.fn().mockReturnValue({ ilike: mockIlike });
      const mockFrom = jest.fn().mockReturnValue({ select: mockSelect });
      
      (supabase.from as jest.Mock).mockImplementation(mockFrom);
      
      const specialSearch = '@#$%^&*()';
      const result = await searchPosts(specialSearch, 'test-user-id');
      
      expect(mockIlike).toHaveBeenCalledWith('content', `%${specialSearch}%`);
    });

    test('Supabase timeout test - searchPosts', async () => {
      // Simulate timeout error - searchPosts should throw exception
      const timeoutError = new Error('Request timeout');
      const mockOrder = jest.fn().mockResolvedValue({ data: null, error: timeoutError });
      const mockEq = jest.fn().mockReturnValue({ order: mockOrder });
      const mockIlike = jest.fn().mockReturnValue({ eq: mockEq });
      const mockSelect = jest.fn().mockReturnValue({ ilike: mockIlike });
      const mockFrom = jest.fn().mockReturnValue({ select: mockSelect });
      
      (supabase.from as jest.Mock).mockImplementation(mockFrom);
      
      // searchPosts should throw exception
      await expect(searchPosts('test', 'test-user-id')).rejects.toThrow('Request timeout');
    });
  });

  describe('fetchPostsByUserId()', () => {
    test('Successfully get user posts', async () => {
      const mockOrder = jest.fn().mockResolvedValue({ 
        data: [globalThis.mockSinglePost], 
        error: null 
      });
      const mockEq = jest.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = jest.fn().mockReturnValue({ select: mockSelect });
      
      (supabase.from as jest.Mock).mockImplementation(mockFrom);
      
      const result = await fetchPostsByUserId('test-user-id');
      
      expect(supabase.from).toHaveBeenCalledWith('posts');
      expect(mockSelect).toHaveBeenCalledWith(`
      *,
      profile:users!posts_user_fk(user_id, username, degree, email, pfp_url),
      count:comments(count),
      likes:post_likes!post_id(count)
    `);
      expect(mockEq).toHaveBeenCalledWith('user_id', 'test-user-id');
      expect(result).toEqual([globalThis.mockSinglePost]);
    });

    test('Return empty array when user ID is empty', async () => {
      const result1 = await fetchPostsByUserId('');
      const result2 = await fetchPostsByUserId(null as any);
      const result3 = await fetchPostsByUserId(undefined as any);
      
      expect(result1).toEqual([]);
      expect(result2).toEqual([]);
      expect(result3).toEqual([]);
      
      // Ensure no database call
      expect(supabase.from).not.toHaveBeenCalled();
    });

    test('Failed to get user posts', async () => {
      const mockOrder = jest.fn().mockResolvedValue(globalThis.mockDatabaseResponses.fetchPostsError);
      const mockEq = jest.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = jest.fn().mockReturnValue({ select: mockSelect });
      
      (supabase.from as jest.Mock).mockImplementation(mockFrom);
      
      const result = await fetchPostsByUserId('test-user-id');
      
      expect(console.error).toHaveBeenCalledWith('Failed to fetch posts:', expect.any(Error));
      expect(result).toEqual([]);
    });

    test('User has no posts', async () => {
      const mockOrder = jest.fn().mockResolvedValue(globalThis.mockDatabaseResponses.fetchPostsEmpty);
      const mockEq = jest.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = jest.fn().mockReturnValue({ select: mockSelect });
      
      (supabase.from as jest.Mock).mockImplementation(mockFrom);
      
      const result = await fetchPostsByUserId('user-with-no-posts');
      
      expect(result).toEqual([]);
    });
  });

  // Boundary and exception tests
  describe('Boundary and exception tests', () => {
    test('null/undefined parameter test - createPost', async () => {
      const mockSelect = jest.fn().mockResolvedValue(globalThis.mockDatabaseResponses.createPostSuccess);
      const mockInsert = jest.fn().mockReturnValue({ select: mockSelect });
      const mockFrom = jest.fn().mockReturnValue({ insert: mockInsert });
      
      (supabase.from as jest.Mock).mockImplementation(mockFrom);
      
      // Test null parameters
      await createPost(null as any, null as any, null as any);
      
      expect(mockInsert).toHaveBeenCalledWith([{
        user_id: null,
        content: null,
        image_url: null
      }]);
    });

    test('Database connection failed', async () => {
      const connectionError = new Error('Database connection failed');
      const mockOrder = jest.fn().mockResolvedValue({ data: null, error: connectionError });
      const mockEq = jest.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = jest.fn().mockReturnValue({ select: mockSelect });
      
      (supabase.from as jest.Mock).mockImplementation(mockFrom);
      
      const result = await fetchPostsByUserId('test-user-id');
      
      expect(console.error).toHaveBeenCalledWith('Failed to fetch posts:', connectionError);
      expect(result).toEqual([]);
    });
  });
}); 