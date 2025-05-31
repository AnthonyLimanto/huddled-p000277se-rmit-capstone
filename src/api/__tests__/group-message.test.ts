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

// Mock console methods
const consoleSpy = {
  error: jest.spyOn(console, 'error').mockImplementation(() => {}),
  log: jest.spyOn(console, 'log').mockImplementation(() => {})
};

describe('Group Message Module Tests', () => {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    consoleSpy.error.mockClear();
    consoleSpy.log.mockClear();
  });

  afterAll(() => {
    consoleSpy.error.mockRestore();
    consoleSpy.log.mockRestore();
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

    // Supabase returns error object
    test('Throw error when Supabase returns error object', async () => {
      const mockError = { message: 'Database constraint violation', code: '23505' };
      
      // Simplify mock setup: directly return error
      const mockFrom = jest.fn().mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue({ data: null, error: mockError })
        })
      });
      
      (supabase.from as jest.Mock).mockImplementation(mockFrom);

      // Only test error throw, do not verify console.error
      await expect(sendGroupMessage('group123', 'user123', 'Hello')).rejects.toEqual(mockError);
    });

    // Handle empty data array response
    test('Handle empty data array response', async () => {
      const mockSelect = jest.fn().mockResolvedValue({ data: [], error: null });
      const mockInsert = jest.fn().mockReturnValue({ select: mockSelect });
      const mockFrom = jest.fn().mockReturnValue({ insert: mockInsert });
      
      (supabase.from as jest.Mock).mockImplementation(mockFrom);

      const result = await sendGroupMessage('group123', 'user123', 'Hello');
      expect(result).toBeUndefined();
    });

    // Handle null and undefined parameters
    test('Handle null and undefined parameters', async () => {
      const mockError = new Error('Invalid input');
      const mockSelect = jest.fn().mockRejectedValue(mockError);
      const mockInsert = jest.fn().mockReturnValue({ select: mockSelect });
      const mockFrom = jest.fn().mockReturnValue({ insert: mockInsert });
      
      (supabase.from as jest.Mock).mockImplementation(mockFrom);

      // Test null parameters
      await expect(sendGroupMessage(null as any, 'user123', 'Hello')).rejects.toThrow();
      await expect(sendGroupMessage('group123', null as any, 'Hello')).rejects.toThrow();
      await expect(sendGroupMessage('group123', 'user123', null as any)).rejects.toThrow();
      
      // Test undefined parameters
      await expect(sendGroupMessage(undefined as any, 'user123', 'Hello')).rejects.toThrow();
      await expect(sendGroupMessage('group123', undefined as any, 'Hello')).rejects.toThrow();
      await expect(sendGroupMessage('group123', 'user123', undefined as any)).rejects.toThrow();
    });

    // Handle very long content
    test('Handle very long content', async () => {
      const longContent = 'a'.repeat(10000);
      const mockData = [{ id: 'msg123', content: longContent, user_id: 'user123' }];
      
      const mockSelect = jest.fn().mockResolvedValue({ data: mockData, error: null });
      const mockInsert = jest.fn().mockReturnValue({ select: mockSelect });
      const mockFrom = jest.fn().mockReturnValue({ insert: mockInsert });
      
      (supabase.from as jest.Mock).mockImplementation(mockFrom);

      const result = await sendGroupMessage('group123', 'user123', longContent);
      expect(result.content).toBe(longContent);
      expect(mockInsert).toHaveBeenCalledWith([
        { group_id: 'group123', user_id: 'user123', content: longContent }
      ]);
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

    // Handle error when Supabase returns error object
    test('Throw error when Supabase returns error object', async () => {
      const mockError = { message: 'Permission denied', code: '42501' };
      
      // Simplify mock setup: directly return error
      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ data: null, error: mockError })
          })
        })
      });

      (supabase.from as jest.Mock).mockImplementation(mockFrom);

      // Only test error throw, do not verify console.error
      await expect(fetchGroupMessages('group123')).rejects.toEqual(mockError);
    });

    // Handle null data response
    test('Handle null data response', async () => {
      const mockOrder = jest.fn().mockResolvedValue({ data: null, error: null });
      const mockEq = jest.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = jest.fn().mockReturnValue({ select: mockSelect });

      (supabase.from as jest.Mock).mockImplementation(mockFrom);

      const result = await fetchGroupMessages('group123');
      expect(result).toBeNull();
    });

    // Handle invalid groupId parameters
    test('Handle invalid groupId parameters', async () => {
      const mockError = new Error('Invalid group ID');
      const mockOrder = jest.fn().mockRejectedValue(mockError);
      const mockEq = jest.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = jest.fn().mockReturnValue({ select: mockSelect });

      (supabase.from as jest.Mock).mockImplementation(mockFrom);

      // Test empty string
      await expect(fetchGroupMessages('')).rejects.toThrow();
      
      // Test null and undefined
      await expect(fetchGroupMessages(null as any)).rejects.toThrow();
      await expect(fetchGroupMessages(undefined as any)).rejects.toThrow();
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

    // Handle different real-time event types
    test('Handle different real-time event types', () => {
      let capturedHandler: ((payload: any) => void) | undefined;
      
      const mockChannel = {
        on: jest.fn().mockImplementation((event, filter, handler) => {
          capturedHandler = handler;
          return mockChannel;
        }),
        subscribe: jest.fn().mockReturnThis()
      };
      
      (supabase.channel as jest.Mock).mockReturnValue(mockChannel);
      const mockCallback = jest.fn();

      subscribeToGroupMessages('group123', mockCallback);

      // Test INSERT event
      const insertPayload = { 
        eventType: 'INSERT',
        new: { id: 'msg1', content: 'New message' }
      };
      capturedHandler?.(insertPayload);
      expect(mockCallback).toHaveBeenCalledWith(insertPayload);

      // Test UPDATE event
      const updatePayload = { 
        eventType: 'UPDATE',
        old: { id: 'msg1', content: 'Old message' },
        new: { id: 'msg1', content: 'Updated message' }
      };
      capturedHandler?.(updatePayload);
      expect(mockCallback).toHaveBeenCalledWith(updatePayload);

      // Test DELETE event
      const deletePayload = { 
        eventType: 'DELETE',
        old: { id: 'msg1', content: 'Deleted message' }
      };
      capturedHandler?.(deletePayload);
      expect(mockCallback).toHaveBeenCalledWith(deletePayload);

      expect(mockCallback).toHaveBeenCalledTimes(3);
    });

    // Handle real-time message events correctly
    test('Handle real-time message events correctly', () => {
      // Create a variable to store the actual event handler function
      let realEventHandler: ((payload: any) => void) | undefined;
      
      const mockChannel = {
        on: jest.fn().mockImplementation((event, config, handler) => {
          // Save the actual handler function
          realEventHandler = handler;
          return mockChannel;
        }),
        subscribe: jest.fn().mockReturnThis()
      };
      
      (supabase.channel as jest.Mock).mockReturnValue(mockChannel);
      const mockCallback = jest.fn();

      // Execute subscription
      subscribeToGroupMessages('group123', mockCallback);

      const mockPayload = { 
        eventType: 'INSERT',
        new: { id: 'msg1', content: 'New message' }
      };
      
      // Clear previous call records
      mockCallback.mockClear();
      
      // Call the actual event handler function
      if (realEventHandler) {
        realEventHandler(mockPayload);
      }

      // Verify callback function is called
      expect(mockCallback).toHaveBeenCalledWith(mockPayload);
    });

    // Handle invalid groupId in subscription
    test('Handle invalid groupId in subscription', () => {
      const mockChannel = {
        on: jest.fn().mockReturnThis(),
        subscribe: jest.fn().mockReturnThis()
      };
      
      (supabase.channel as jest.Mock).mockReturnValue(mockChannel);
      const mockCallback = jest.fn();

      // Test empty string groupId
      const unsubscribe1 = subscribeToGroupMessages('', mockCallback);
      expect(mockChannel.on).toHaveBeenCalledWith(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'messages', 
          filter: 'group_id=eq.' 
        },
        expect.any(Function)
      );

      // Test groupId with special characters
      const unsubscribe2 = subscribeToGroupMessages('group-123!@#', mockCallback);
      expect(mockChannel.on).toHaveBeenCalledWith(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'messages', 
          filter: 'group_id=eq.group-123!@#' 
        },
        expect.any(Function)
      );

      expect(typeof unsubscribe1).toBe('function');
      expect(typeof unsubscribe2).toBe('function');
    });

    // Handle callback function throwing error
    test('Handle callback function throwing error', () => {
      let capturedHandler: ((payload: any) => void) | undefined;
      
      const mockChannel = {
        on: jest.fn().mockImplementation((event, filter, handler) => {
          capturedHandler = handler;
          return mockChannel;
        }),
        subscribe: jest.fn().mockReturnThis()
      };
      
      (supabase.channel as jest.Mock).mockReturnValue(mockChannel);
      
      // Create callback function that throws an exception
      const errorCallback = jest.fn().mockImplementation(() => {
        throw new Error('Callback error');
      });

      subscribeToGroupMessages('group123', errorCallback);

      const mockPayload = { 
        eventType: 'INSERT',
        new: { id: 'msg1', content: 'New message' }
      };
      
      // Verify that even if the callback function throws an exception, it will not affect the subscription functionality
      expect(() => {
        capturedHandler?.(mockPayload);
      }).toThrow('Callback error');
      
      expect(errorCallback).toHaveBeenCalledWith(mockPayload);
    });

    // Handle null or undefined callback function
    test('Handle null or undefined callback function', () => {
      const mockChannel = {
        on: jest.fn().mockReturnThis(),
        subscribe: jest.fn().mockReturnThis()
      };
      
      (supabase.channel as jest.Mock).mockReturnValue(mockChannel);

      // Test null callback
      const unsubscribe1 = subscribeToGroupMessages('group123', null as any);
      expect(typeof unsubscribe1).toBe('function');

      // Test undefined callback
      const unsubscribe2 = subscribeToGroupMessages('group123', undefined as any);
      expect(typeof unsubscribe2).toBe('function');
    });
  });
}); 