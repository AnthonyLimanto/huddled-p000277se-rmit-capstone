import { fetchNotifications } from '../notification';
import { supabase } from '../supabase';

// Mock supabase
jest.mock('../supabase', () => ({
  supabase: {
    from: jest.fn(),
  }
}));

// Define test data types
interface NotificationData {
  id?: string;
  user_id?: string;
  title?: string;
  message?: string;
  type?: string;
  read?: boolean;
  created_at?: string;
}

describe('Notification Module Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchNotifications', () => {
    test('successfully fetch notifications for user', async () => {
      // Mock notification data
      const mockNotifications: NotificationData[] = [
        {
          id: 'notif1',
          user_id: 'user123',
          title: 'New Message',
          message: 'You have a new message from John',
          type: 'message',
          read: false,
          created_at: '2023-12-01T10:00:00Z'
        },
        {
          id: 'notif2',
          user_id: 'user123',
          title: 'Post Liked',
          message: 'Someone liked your post',
          type: 'like',
          read: true,
          created_at: '2023-12-01T09:00:00Z'
        }
      ];

      // Mock query chain
      const mockOrder = jest.fn().mockResolvedValue({
        data: mockNotifications,
        error: null
      });
      const mockEq = jest.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = jest.fn().mockReturnValue({ select: mockSelect });

      // Apply mock
      (supabase.from as jest.Mock).mockImplementation(mockFrom);

      // Call function
      const result = await fetchNotifications('user123');

      // Verify results
      expect(supabase.from).toHaveBeenCalledWith('notification');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('user_id', 'user123');
      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(result).toEqual(mockNotifications);
    });

    test('return empty array when no notifications exist', async () => {
      // Mock empty response
      const mockEmptyData: NotificationData[] = [];

      // Mock query chain
      const mockOrder = jest.fn().mockResolvedValue({
        data: mockEmptyData,
        error: null
      });
      const mockEq = jest.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = jest.fn().mockReturnValue({ select: mockSelect });

      // Apply mock
      (supabase.from as jest.Mock).mockImplementation(mockFrom);

      // Call function
      const result = await fetchNotifications('user456');

      // Verify results
      expect(result).toEqual(mockEmptyData);
      expect(result.length).toBe(0);
    });

    test('throw error when fetching notifications fails', async () => {
      // Mock error
      const mockError = new Error('Database connection failed');

      // Mock query chain failure
      const mockOrder = jest.fn().mockResolvedValue({
        data: null,
        error: mockError
      });
      const mockEq = jest.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = jest.fn().mockReturnValue({ select: mockSelect });

      // Apply mock
      (supabase.from as jest.Mock).mockImplementation(mockFrom);

      // Verify function throws error
      await expect(fetchNotifications('user123')).rejects.toThrow('Database connection failed');
    });

    test('handle special characters in user ID', async () => {
      // Mock notification data
      const mockNotifications: NotificationData[] = [
        {
          id: 'notif1',
          user_id: 'user+special@test.com',
          title: 'Test Notification',
          message: 'Test message',
          type: 'test',
          read: false,
          created_at: '2023-12-01T10:00:00Z'
        }
      ];

      // Mock query chain
      const mockOrder = jest.fn().mockResolvedValue({
        data: mockNotifications,
        error: null
      });
      const mockEq = jest.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = jest.fn().mockReturnValue({ select: mockSelect });

      // Apply mock
      (supabase.from as jest.Mock).mockImplementation(mockFrom);

      // Call function with special characters in user ID
      const result = await fetchNotifications('user+special@test.com');

      // Verify results
      expect(mockEq).toHaveBeenCalledWith('user_id', 'user+special@test.com');
      expect(result).toEqual(mockNotifications);
    });

    test('handle empty user ID', async () => {
      // Mock empty response
      const mockEmptyData: NotificationData[] = [];

      // Mock query chain
      const mockOrder = jest.fn().mockResolvedValue({
        data: mockEmptyData,
        error: null
      });
      const mockEq = jest.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = jest.fn().mockReturnValue({ select: mockSelect });

      // Apply mock
      (supabase.from as jest.Mock).mockImplementation(mockFrom);

      // Call function with empty user ID
      const result = await fetchNotifications('');

      // Verify results
      expect(mockEq).toHaveBeenCalledWith('user_id', '');
      expect(result).toEqual(mockEmptyData);
    });

    test('verify correct ordering of notifications', async () => {
      // Mock notification data with different timestamps
      const mockNotifications: NotificationData[] = [
        {
          id: 'notif1',
          user_id: 'user123',
          title: 'Latest Notification',
          created_at: '2023-12-01T12:00:00Z'
        },
        {
          id: 'notif2',
          user_id: 'user123',
          title: 'Earlier Notification',
          created_at: '2023-12-01T10:00:00Z'
        }
      ];

      // Mock query chain
      const mockOrder = jest.fn().mockResolvedValue({
        data: mockNotifications,
        error: null
      });
      const mockEq = jest.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = jest.fn().mockReturnValue({ select: mockSelect });

      // Apply mock
      (supabase.from as jest.Mock).mockImplementation(mockFrom);

      // Call function
      const result = await fetchNotifications('user123');

      // Verify ordering is requested correctly (descending by created_at)
      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(result).toEqual(mockNotifications);
    });

    test('handle network timeout error', async () => {
      // Mock timeout error
      const timeoutError = new Error('Request timeout');

      // Mock query chain failure
      const mockOrder = jest.fn().mockResolvedValue({
        data: null,
        error: timeoutError
      });
      const mockEq = jest.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = jest.fn().mockReturnValue({ select: mockSelect });

      // Apply mock
      (supabase.from as jest.Mock).mockImplementation(mockFrom);

      // Verify function throws timeout error
      await expect(fetchNotifications('user123')).rejects.toThrow('Request timeout');
    });

    test('handle large number of notifications', async () => {
      // Mock large dataset
      const mockLargeNotifications: NotificationData[] = Array.from({ length: 100 }, (_, index) => ({
        id: `notif${index + 1}`,
        user_id: 'user123',
        title: `Notification ${index + 1}`,
        message: `Message ${index + 1}`,
        type: 'test',
        read: index % 2 === 0,
        created_at: new Date(Date.now() - index * 1000).toISOString()
      }));

      // Mock query chain
      const mockOrder = jest.fn().mockResolvedValue({
        data: mockLargeNotifications,
        error: null
      });
      const mockEq = jest.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = jest.fn().mockReturnValue({ select: mockSelect });

      // Apply mock
      (supabase.from as jest.Mock).mockImplementation(mockFrom);

      // Call function
      const result = await fetchNotifications('user123');

      // Verify results
      expect(result).toEqual(mockLargeNotifications);
      expect(result.length).toBe(100);
    });
  });
}); 