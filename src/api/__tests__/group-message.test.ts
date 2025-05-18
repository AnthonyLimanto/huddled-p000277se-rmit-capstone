import { sendGroupMessage, fetchGroupMessages, subscribeToGroupMessages } from '../group-message';

// Mock supabase
jest.mock('../supabase', () => {
  return {
    supabase: {
      from: jest.fn(),
      channel: jest.fn(),
      removeChannel: jest.fn()
    }
  };
});

// Import the mocked supabase
import { supabase } from '../supabase';

describe('Group Message Module Tests', () => {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendGroupMessage', () => {
    test('Send group message and return new message object', async () => {
      // Mock data and response
      const mockData = [{ id: 'msg123', content: 'Hello', user_id: 'user123' }];
      
      // Set nested mock chain
      const mockSelect = jest.fn().mockResolvedValue({ data: mockData, error: null });
      const mockInsert = jest.fn().mockReturnValue({ select: mockSelect });
      const mockFrom = jest.fn().mockReturnValue({ insert: mockInsert });
      
      // Apply mock
      (supabase.from as jest.Mock).mockImplementation(mockFrom);

      // Execute test function
      const result = await sendGroupMessage('group123', 'user123', 'Hello');

      // Verify
      expect(supabase.from).toHaveBeenCalledWith('messages');
      expect(mockInsert).toHaveBeenCalledWith([
        { group_id: 'group123', user_id: 'user123', content: 'Hello' }
      ]);
      expect(mockSelect).toHaveBeenCalled();
      expect(result).toEqual(mockData[0]);
    });

    test('Throw error when parameters are invalid', async () => {
      // Mock error response
      const mockError = new Error('Invalid parameters');
      
      // Use e mockRejectedVal directly to simulate irectly rejectiono simulate Promise rejection
      const mockSelect = jest.fn().mockRejectedValue(mockError);
      const mockInsert = jest.fn().mockReturnValue({ select: mockSelect });
      const mockFrom = jest.fn().mockReturnValue({ insert: mockInsert });
      
      // Apply mock
      (supabase.from as jest.Mock).mockImplementation(mockFrom);

      // Execute and verify error
      await expect(sendGroupMessage('', 'user123', 'Hello')).rejects.toThrow('Invalid parameters');
      expect(supabase.from).toHaveBeenCalledWith('messages');
    });

    test('Handle empty content message', async () => {
      // Mock empty content response
      const mockData = [{ id: 'msg123', content: '', user_id: 'user123' }];
      
      // Set nested mock chain
      const mockSelect = jest.fn().mockResolvedValue({ data: mockData, error: null });
      const mockInsert = jest.fn().mockReturnValue({ select: mockSelect });
      const mockFrom = jest.fn().mockReturnValue({ insert: mockInsert });
      
      // Apply mock
      (supabase.from as jest.Mock).mockImplementation(mockFrom);

      // Execute test function
      const result = await sendGroupMessage('group123', 'user123', '');

      // Verify
      expect(mockInsert).toHaveBeenCalledWith([
        { group_id: 'group123', user_id: 'user123', content: '' }
      ]);
      expect(result).toEqual(mockData[0]);
    });
  });

  describe('fetchGroupMessages', () => {
    test('Get group messages', async () => {
      // Mock message data
      const mockMessages = [
        {
          id: 'msg1',
          content: 'Hello',
          created_at: '2023-05-01T12:00:00Z',
          user_id: 'user1',
          users: { username: 'User One' }
        },
        {
          id: 'msg2',
          content: 'Hi there',
          created_at: '2023-05-01T12:01:00Z',
          user_id: 'user2',
          users: { username: 'User Two' }
        }
      ];

      // Set nested mock chain
      const mockOrder = jest.fn().mockResolvedValue({ data: mockMessages, error: null });
      const mockEq = jest.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = jest.fn().mockReturnValue({ select: mockSelect });

      // Apply mock
      (supabase.from as jest.Mock).mockImplementation(mockFrom);

      // Execute test function
      const result = await fetchGroupMessages('group123');

      // Verify
      expect(supabase.from).toHaveBeenCalledWith('messages');
      expect(mockSelect).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith('group_id', 'group123');
      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(result).toEqual(mockMessages);
    });

    test('Handle empty result set', async () => {
      // Set nested mock chain
      const mockOrder = jest.fn().mockResolvedValue({ data: [], error: null });
      const mockEq = jest.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = jest.fn().mockReturnValue({ select: mockSelect });

      // Apply mock
      (supabase.from as jest.Mock).mockImplementation(mockFrom);

      // Execute test function
      const result = await fetchGroupMessages('emptyGroup');

      // Verify return empty array
      expect(result).toEqual([]);
    });

    test('Handle get messages failed', async () => {
      // Set error response
      const mockError = new Error('Database error');
      
      // Use mockRejectedValue directly to simulate Promise rejection
      const mockOrder = jest.fn().mockRejectedValue(mockError);
      const mockEq = jest.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = jest.fn().mockReturnValue({ select: mockSelect });

      // Apply mock
      (supabase.from as jest.Mock).mockImplementation(mockFrom);

      // Verify function throws error
      await expect(fetchGroupMessages('group123')).rejects.toThrow('Database error');
    });
  });

  describe('subscribeToGroupMessages', () => {
    test('Correctly register real-time message subscription', () => {
      // Create mock channel
      const mockChannel = {
        on: jest.fn().mockReturnThis(),
        subscribe: jest.fn().mockReturnThis()
      };
      
      // Set return mock channel
      (supabase.channel as jest.Mock).mockReturnValue(mockChannel);

      // Mock callback function
      const mockCallback = jest.fn();

      // Execute test function
      const unsubscribe = subscribeToGroupMessages('group123', mockCallback);

      // Verify
      expect(supabase.channel).toHaveBeenCalledWith('realtime:messages');
      expect(mockChannel.on).toHaveBeenCalledWith(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'messages', 
          filter: 'group_id=eq.group123' 
        },
        expect.any(Function)
      );
      expect(mockChannel.subscribe).toHaveBeenCalled();
      expect(typeof unsubscribe).toBe('function');
    });

    test('Unsubscribe function correctly removes channel', () => {
      // Create mock channel
      const mockChannel = {
        on: jest.fn().mockReturnThis(),
        subscribe: jest.fn().mockReturnThis()
      };
      
      // Set return mock channel
      (supabase.channel as jest.Mock).mockReturnValue(mockChannel);

      // Mock callback function
      const mockCallback = jest.fn();

      // Execute test function
      const unsubscribe = subscribeToGroupMessages('group123', mockCallback);
      unsubscribe();

      // Verify channel removed
      expect(supabase.removeChannel).toHaveBeenCalledWith(mockChannel);
    });

    test('Call callback function when message event is triggered', () => {
      // Save event handler function
      let capturedHandler: ((payload: any) => void) | undefined;
      
      // Create mock channel and capture callback
      const mockChannel = {
        on: jest.fn().mockImplementation((event, filter, handler) => {
          capturedHandler = handler;
          return mockChannel;
        }),
        subscribe: jest.fn().mockReturnThis()
      };
      
      // Set return mock channel
      (supabase.channel as jest.Mock).mockReturnValue(mockChannel);

      // Mock callback function
      const mockCallback = jest.fn();

      // Execute test function
      subscribeToGroupMessages('group123', mockCallback);

      // Mock real-time message event
      const mockPayload = { 
        new: { id: 'msg1', content: 'New message' },
        eventType: 'INSERT'
      };
      
      // Trigger captured event handler function
      if (capturedHandler) {
        capturedHandler(mockPayload);
      }

      // Verify callback called
      expect(mockCallback).toHaveBeenCalledWith(mockPayload);
    });
  });
}); 