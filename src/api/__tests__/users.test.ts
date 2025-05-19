// Import functions to be tested
import { 
  signUp, 
  completeSignUp, 
  fetchUsers, 
  fetchUser, 
  getSessionUser 
} from '../users';
import { supabase } from '../supabase';
import { uploadPfp } from '../../helper/bucketHelper';

// Mock dependencies
jest.mock('../supabase', () => ({
  supabase: {
    from: jest.fn(),
    auth: {
      signUp: jest.fn(),
      getSession: jest.fn()
    }
  }
}));

jest.mock('../../helper/bucketHelper', () => ({
  uploadPfp: jest.fn()
}));

// Define test data types
interface UserData {
  id?: string;
  user_id?: string;
  username?: string;
  password?: string;
  email?: string;
  degree?: string;
  pfp_url?: string;
  created_at?: string;
}

describe('User Management Module Tests', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signUp', () => {
    test('Successfully create user', async () => {
      // Mock response data
      const mockUserData: UserData = { 
        username: 'testuser', 
        password: 'password123' 
      };
      
      // Mock insert call
      const mockInsert = jest.fn().mockResolvedValue({ 
        data: mockUserData, 
        error: null 
      });
      const mockFrom = jest.fn().mockReturnValue({ insert: mockInsert });
      
      // Apply mock
      (supabase.from as jest.Mock).mockImplementation(mockFrom);
      
      // Call function
      const result = await signUp('testuser', 'password123');
      
      // Verify results
      expect(supabase.from).toHaveBeenCalledWith('User');
      expect(mockInsert).toHaveBeenCalledWith([{ 
        username: 'testuser', 
        password: 'password123' 
      }]);
      expect(result).toEqual(mockUserData);
    });
    
    test('Throw error when user creation fails', async () => {
      // Mock error
      const mockError = new Error('User creation failed');
      
      // Mock failed insert call
      const mockInsert = jest.fn().mockResolvedValue({ 
        data: null, 
        error: mockError 
      });
      const mockFrom = jest.fn().mockReturnValue({ insert: mockInsert });
      
      // Apply mock
      (supabase.from as jest.Mock).mockImplementation(mockFrom);
      
      // Verify function throws error
      await expect(signUp('testuser', 'password123')).rejects.toThrow('User creation failed');
    });
    
    test('Handle boundary values for username and password', async () => {
      // Mock response data - long username
      const longUsername = 'a'.repeat(50);
      const mockUserData: UserData = { 
        username: longUsername, 
        password: 'p' 
      };
      
      // Mock insert call
      const mockInsert = jest.fn().mockResolvedValue({ 
        data: mockUserData, 
        error: null 
      });
      const mockFrom = jest.fn().mockReturnValue({ insert: mockInsert });
      
      // Apply mock
      (supabase.from as jest.Mock).mockImplementation(mockFrom);
      
      // Call function - very long username, very short password
      const result = await signUp(longUsername, 'p');
      
      // Verify results
      expect(mockInsert).toHaveBeenCalledWith([{ 
        username: longUsername, 
        password: 'p' 
      }]);
      expect(result).toEqual(mockUserData);
    });
  });

  describe('completeSignUp', () => {
    test('Successfully register user with profile picture upload', async () => {
      // Mock Auth signUp success
      const mockAuthUser = { id: 'user123', email: 'test@example.com' };
      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: { user: mockAuthUser },
        error: null
      });
      
      // Mock profile insert success
      const mockInsert = jest.fn().mockResolvedValue({ error: null });
      const mockFrom = jest.fn().mockReturnValue({ insert: mockInsert });
      (supabase.from as jest.Mock).mockImplementation(mockFrom);
      
      // Mock file upload
      (uploadPfp as jest.Mock).mockResolvedValue(true);
      
      // Mock fetch API
      global.fetch = jest.fn().mockResolvedValue({
        blob: jest.fn().mockResolvedValue(new Blob(['test'], { type: 'image/png' }))
      }) as jest.Mock;
      
      // Create File object instead of Blob to match uploadPfp parameter type
      const mockFile = new File(['test'], 'test.png', { type: 'image/png' });
      // Modify mock behavior to return File object
      (global.fetch as jest.Mock).mockResolvedValue({
        blob: jest.fn().mockResolvedValue(mockFile)
      });
      
      // Call function
      const result = await completeSignUp(
        'test@example.com',
        'password123',
        'testuser',
        'Computer Science',
        { uri: 'file://test.png', name: 'test.png', type: 'image/png' }
      );
      
      // Verify results
      expect(supabase.auth.signUp).toHaveBeenCalledWith({ 
        email: 'test@example.com', 
        password: 'password123' 
      });
      expect(uploadPfp).toHaveBeenCalled();
      expect(supabase.from).toHaveBeenCalledWith('users');
      expect(mockInsert).toHaveBeenCalledWith([{
        user_id: 'user123',
        username: 'testuser',
        degree: 'Computer Science',
        email: 'test@example.com',
        pfp_url: `https://leqcmbvpugjvyzlxxmgs.supabase.co/storage/v1/object/public/pfp/test@example.com/profile-picture.png`,
      }]);
      expect(result).toEqual(mockAuthUser);
    });
    
    test('Register user with default avatar when no profile picture provided', async () => {
      // Mock Auth signUp success
      const mockAuthUser = { id: 'user123', email: 'test@example.com' };
      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: { user: mockAuthUser },
        error: null
      });
      
      // Mock profile insert success
      const mockInsert = jest.fn().mockResolvedValue({ error: null });
      const mockFrom = jest.fn().mockReturnValue({ insert: mockInsert });
      (supabase.from as jest.Mock).mockImplementation(mockFrom);
      
      // Call function - without profile picture file
      const result = await completeSignUp(
        'test@example.com',
        'password123',
        'testuser',
        'Computer Science',
        null
      );
      
      // Verify results
      expect(supabase.auth.signUp).toHaveBeenCalledWith({ 
        email: 'test@example.com', 
        password: 'password123' 
      });
      expect(uploadPfp).not.toHaveBeenCalled();
      expect(mockInsert).toHaveBeenCalledWith([expect.objectContaining({
        user_id: 'user123',
        username: 'testuser',
        pfp_url: expect.stringContaining('https://ui-avatars.com/api/?name=testuser'),
      })]);
      expect(result).toEqual(mockAuthUser);
    });
    
    test('Throw error when Auth registration fails', async () => {
      // Mock Auth signUp failure
      const mockError = new Error('Registration failed');
      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: null,
        error: mockError
      });
      
      // Call function and verify it throws error
      await expect(completeSignUp(
        'test@example.com',
        'password123',
        'testuser',
        'Computer Science'
      )).rejects.toThrow('Registration failed');
      
      // Verify subsequent steps not called
      expect(supabase.from).not.toHaveBeenCalled();
    });
    
    test('Throw error when user created but profile insert fails', async () => {
      // Mock Auth signUp success
      const mockAuthUser = { id: 'user123', email: 'test@example.com' };
      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: { user: mockAuthUser },
        error: null
      });
      
      // Mock profile insert failure
      const profileError = new Error('Profile insert failed');
      const mockInsert = jest.fn().mockResolvedValue({ error: profileError });
      const mockFrom = jest.fn().mockReturnValue({ insert: mockInsert });
      (supabase.from as jest.Mock).mockImplementation(mockFrom);
      
      // Call function and verify it throws error
      await expect(completeSignUp(
        'test@example.com',
        'password123',
        'testuser',
        'Computer Science'
      )).rejects.toThrow('Profile insert failed');
    });
    
    test('Throw error when user creation returns empty ID', async () => {
      // Mock Auth signUp success but with no user ID
      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: { user: {} },
        error: null
      });
      
      // Call function and verify it throws error
      await expect(completeSignUp(
        'test@example.com',
        'password123',
        'testuser',
        'Computer Science'
      )).rejects.toThrow('User creation failed - no ID returned');
    });
  });

  describe('fetchUsers', () => {
    test('Successfully fetch all users', async () => {
      // Mock user data
      const mockUsers: UserData[] = [
        { 
          user_id: 'user1', 
          username: 'User1', 
          email: 'user1@example.com', 
          created_at: '2023-01-01' 
        },
        { 
          user_id: 'user2', 
          username: 'User2', 
          email: 'user2@example.com', 
          created_at: '2023-01-02' 
        }
      ];
      
      // Mock query
      const mockOrder = jest.fn().mockResolvedValue({ 
        data: mockUsers, 
        error: null 
      });
      const mockSelect = jest.fn().mockReturnValue({ order: mockOrder });
      const mockFrom = jest.fn().mockReturnValue({ select: mockSelect });
      
      // Apply mock
      (supabase.from as jest.Mock).mockImplementation(mockFrom);
      
      // Call function
      const result = await fetchUsers();
      
      // Verify results
      expect(supabase.from).toHaveBeenCalledWith('users');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(result).toEqual(mockUsers);
    });
    
    test('Return empty list when no users exist', async () => {
      // Mock empty response
      const mockEmptyData: UserData[] = [];
      
      // Mock query
      const mockOrder = jest.fn().mockResolvedValue({ 
        data: mockEmptyData, 
        error: null 
      });
      const mockSelect = jest.fn().mockReturnValue({ order: mockOrder });
      const mockFrom = jest.fn().mockReturnValue({ select: mockSelect });
      
      // Apply mock
      (supabase.from as jest.Mock).mockImplementation(mockFrom);
      
      // Call function
      const result = await fetchUsers();
      
      // Verify results
      expect(result).toEqual(mockEmptyData);
      expect(result.length).toBe(0);
    });
    
    test('Throw error when fetching users fails', async () => {
      // Mock error
      const mockError = new Error('Fetching users failed');
      
      // Mock query failure
      const mockOrder = jest.fn().mockResolvedValue({ 
        data: null, 
        error: mockError 
      });
      const mockSelect = jest.fn().mockReturnValue({ order: mockOrder });
      const mockFrom = jest.fn().mockReturnValue({ select: mockSelect });
      
      // Apply mock
      (supabase.from as jest.Mock).mockImplementation(mockFrom);
      
      // Verify function throws error
      await expect(fetchUsers()).rejects.toThrow('Fetching users failed');
    });
  });

  describe('fetchUser', () => {
    test('Successfully fetch a single user', async () => {
      // Mock user data
      const mockUser: UserData = {
        user_id: 'user123',
        username: 'testuser',
        email: 'test@example.com',
        degree: 'Computer Science',
        pfp_url: 'https://example.com/avatar.jpg',
        created_at: '2023-01-01'
      };
      
      // Mock query
      const mockSingle = jest.fn().mockResolvedValue({ 
        data: mockUser, 
        error: null 
      });
      const mockEq = jest.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = jest.fn().mockReturnValue({ select: mockSelect });
      
      // Apply mock
      (supabase.from as jest.Mock).mockImplementation(mockFrom);
      
      // Call function
      const result = await fetchUser('test@example.com');
      
      // Verify results
      expect(supabase.from).toHaveBeenCalledWith('users');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('email', 'test@example.com');
      expect(result).toEqual(mockUser);
    });
    
    test('Throw error when fetching non-existent user', async () => {
      // Mock error
      const mockError = new Error('User does not exist');
      
      // Mock query failure
      const mockSingle = jest.fn().mockResolvedValue({ 
        data: null, 
        error: mockError 
      });
      const mockEq = jest.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = jest.fn().mockReturnValue({ select: mockSelect });
      
      // Apply mock
      (supabase.from as jest.Mock).mockImplementation(mockFrom);
      
      // Verify function throws error
      await expect(fetchUser('nonexistent@example.com')).rejects.toThrow('User does not exist');
    });
    
    test('Handle email with special characters', async () => {
      // Mock user data
      const mockUser: UserData = {
        user_id: 'user123',
        username: 'specialuser',
        email: 'special+test@example.com'
      };
      
      // Mock query
      const mockSingle = jest.fn().mockResolvedValue({ 
        data: mockUser, 
        error: null 
      });
      const mockEq = jest.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = jest.fn().mockReturnValue({ select: mockSelect });
      
      // Apply mock
      (supabase.from as jest.Mock).mockImplementation(mockFrom);
      
      // Call function
      const result = await fetchUser('special+test@example.com');
      
      // Verify results
      expect(mockEq).toHaveBeenCalledWith('email', 'special+test@example.com');
      expect(result).toEqual(mockUser);
    });
  });

  describe('getSessionUser', () => {
    test('Successfully get current logged-in user', async () => {
      // Mock session data
      const mockSession = {
        user: {
          id: 'user123',
          email: 'test@example.com'
        }
      };
      
      // Mock user profile
      const mockProfile = {
        user_id: 'user123',
        username: 'testuser',
        degree: 'Computer Science',
        pfp_url: 'https://example.com/avatar.jpg'
      };
      
      // Mock getSession call
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
        error: null
      });
      
      // Mock query for user profile
      const mockSingle = jest.fn().mockResolvedValue({ 
        data: mockProfile, 
        error: null 
      });
      const mockEq = jest.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = jest.fn().mockReturnValue({ select: mockSelect });
      
      // Apply mock
      (supabase.from as jest.Mock).mockImplementation(mockFrom);
      
      // Call function
      const result = await getSessionUser();
      
      // Verify results
      expect(supabase.auth.getSession).toHaveBeenCalled();
      expect(supabase.from).toHaveBeenCalledWith('users');
      expect(mockEq).toHaveBeenCalledWith('user_id', 'user123');
      expect(result).toEqual({
        id: 'user123',
        email: 'test@example.com',
        username: 'testuser',
        degree: 'Computer Science',
        pfp_url: 'https://example.com/avatar.jpg'
      });
    });
    
    test('Throw error when no session exists', async () => {
      // Mock no session
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
        error: null
      });
      
      // Verify function throws error
      await expect(getSessionUser()).rejects.toThrow('No user session found');
      
      // Verify subsequent steps not called
      expect(supabase.from).not.toHaveBeenCalled();
    });
    
    test('Throw error when session exists but profile fetch fails', async () => {
      // Mock session data
      const mockSession = {
        user: {
          id: 'user123',
          email: 'test@example.com'
        }
      };
      
      // Mock getSession call
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
        error: null
      });
      
      // Mock query for user profile failure
      const profileError = new Error('Failed to fetch user profile');
      const mockSingle = jest.fn().mockResolvedValue({ 
        data: null, 
        error: profileError 
      });
      const mockEq = jest.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = jest.fn().mockReturnValue({ select: mockSelect });
      
      // Apply mock
      (supabase.from as jest.Mock).mockImplementation(mockFrom);
      
      // Verify function throws error
      await expect(getSessionUser()).rejects.toThrow('Failed to fetch user profile');
    });
    
    test('Throw error when session error occurs', async () => {
      // Mock session error
      const sessionError = new Error('Session error');
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: {},
        error: sessionError
      });
      
      // Verify function throws error
      await expect(getSessionUser()).rejects.toThrow('No user session found');
    });
  });
}); 