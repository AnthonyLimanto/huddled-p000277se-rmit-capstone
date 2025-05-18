import { sendGroupMessage, fetchGroupMessages, subscribeToGroupMessages } from '../group-message';

// 模拟整个supabase模块
jest.mock('../supabase', () => {
  return {
    supabase: {
      from: jest.fn(),
      channel: jest.fn(),
      removeChannel: jest.fn()
    }
  };
});

// 导入模拟后的supabase
import { supabase } from '../supabase';

describe('群组消息模块测试', () => {
  // 每个测试之前重置所有模拟
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendGroupMessage', () => {
    test('正常发送消息并返回新消息对象', async () => {
      // 模拟数据和响应
      const mockData = [{ id: 'msg123', content: 'Hello', user_id: 'user123' }];
      
      // 设置嵌套模拟链
      const mockSelect = jest.fn().mockResolvedValue({ data: mockData, error: null });
      const mockInsert = jest.fn().mockReturnValue({ select: mockSelect });
      const mockFrom = jest.fn().mockReturnValue({ insert: mockInsert });
      
      // 应用模拟
      (supabase.from as jest.Mock).mockImplementation(mockFrom);

      // 执行测试函数
      const result = await sendGroupMessage('group123', 'user123', 'Hello');

      // 验证
      expect(supabase.from).toHaveBeenCalledWith('messages');
      expect(mockInsert).toHaveBeenCalledWith([
        { group_id: 'group123', user_id: 'user123', content: 'Hello' }
      ]);
      expect(mockSelect).toHaveBeenCalled();
      expect(result).toEqual(mockData[0]);
    });

    test('当参数无效时抛出错误', async () => {
      // 模拟错误响应
      const mockError = new Error('无效的参数');
      
      // 使用mockRejectedValue直接模拟Promise拒绝
      const mockSelect = jest.fn().mockRejectedValue(mockError);
      const mockInsert = jest.fn().mockReturnValue({ select: mockSelect });
      const mockFrom = jest.fn().mockReturnValue({ insert: mockInsert });
      
      // 应用模拟
      (supabase.from as jest.Mock).mockImplementation(mockFrom);

      // 执行并验证抛出错误
      await expect(sendGroupMessage('', 'user123', 'Hello')).rejects.toThrow('无效的参数');
      expect(supabase.from).toHaveBeenCalledWith('messages');
    });

    test('空内容消息的处理', async () => {
      // 模拟空内容响应
      const mockData = [{ id: 'msg123', content: '', user_id: 'user123' }];
      
      // 设置嵌套模拟链
      const mockSelect = jest.fn().mockResolvedValue({ data: mockData, error: null });
      const mockInsert = jest.fn().mockReturnValue({ select: mockSelect });
      const mockFrom = jest.fn().mockReturnValue({ insert: mockInsert });
      
      // 应用模拟
      (supabase.from as jest.Mock).mockImplementation(mockFrom);

      // 执行测试函数
      const result = await sendGroupMessage('group123', 'user123', '');

      // 验证
      expect(mockInsert).toHaveBeenCalledWith([
        { group_id: 'group123', user_id: 'user123', content: '' }
      ]);
      expect(result).toEqual(mockData[0]);
    });
  });

  describe('fetchGroupMessages', () => {
    test('正常获取群组消息', async () => {
      // 模拟消息数据
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

      // 设置嵌套模拟链
      const mockOrder = jest.fn().mockResolvedValue({ data: mockMessages, error: null });
      const mockEq = jest.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = jest.fn().mockReturnValue({ select: mockSelect });

      // 应用模拟
      (supabase.from as jest.Mock).mockImplementation(mockFrom);

      // 执行测试函数
      const result = await fetchGroupMessages('group123');

      // 验证
      expect(supabase.from).toHaveBeenCalledWith('messages');
      expect(mockSelect).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith('group_id', 'group123');
      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(result).toEqual(mockMessages);
    });

    test('处理空结果集', async () => {
      // 设置嵌套模拟链
      const mockOrder = jest.fn().mockResolvedValue({ data: [], error: null });
      const mockEq = jest.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = jest.fn().mockReturnValue({ select: mockSelect });

      // 应用模拟
      (supabase.from as jest.Mock).mockImplementation(mockFrom);

      // 执行测试函数
      const result = await fetchGroupMessages('emptyGroup');

      // 验证返回空数组
      expect(result).toEqual([]);
    });

    test('处理获取消息失败', async () => {
      // 设置错误响应
      const mockError = new Error('数据库错误');
      
      // 使用mockRejectedValue直接模拟Promise拒绝
      const mockOrder = jest.fn().mockRejectedValue(mockError);
      const mockEq = jest.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = jest.fn().mockReturnValue({ select: mockSelect });

      // 应用模拟
      (supabase.from as jest.Mock).mockImplementation(mockFrom);

      // 验证函数抛出错误
      await expect(fetchGroupMessages('group123')).rejects.toThrow('数据库错误');
    });
  });

  describe('subscribeToGroupMessages', () => {
    test('正确注册实时消息订阅', () => {
      // 创建模拟通道
      const mockChannel = {
        on: jest.fn().mockReturnThis(),
        subscribe: jest.fn().mockReturnThis()
      };
      
      // 设置返回模拟通道
      (supabase.channel as jest.Mock).mockReturnValue(mockChannel);

      // 模拟回调函数
      const mockCallback = jest.fn();

      // 执行测试函数
      const unsubscribe = subscribeToGroupMessages('group123', mockCallback);

      // 验证
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

    test('取消订阅函数正确移除通道', () => {
      // 创建模拟通道
      const mockChannel = {
        on: jest.fn().mockReturnThis(),
        subscribe: jest.fn().mockReturnThis()
      };
      
      // 设置返回模拟通道
      (supabase.channel as jest.Mock).mockReturnValue(mockChannel);

      // 模拟回调函数
      const mockCallback = jest.fn();

      // 执行测试函数
      const unsubscribe = subscribeToGroupMessages('group123', mockCallback);
      unsubscribe();

      // 验证通道被移除
      expect(supabase.removeChannel).toHaveBeenCalledWith(mockChannel);
    });

    test('消息事件触发时正确调用回调函数', () => {
      // 保存事件处理函数
      let capturedHandler: ((payload: any) => void) | undefined;
      
      // 创建模拟通道并捕获回调
      const mockChannel = {
        on: jest.fn().mockImplementation((event, filter, handler) => {
          capturedHandler = handler;
          return mockChannel;
        }),
        subscribe: jest.fn().mockReturnThis()
      };
      
      // 设置返回模拟通道
      (supabase.channel as jest.Mock).mockReturnValue(mockChannel);

      // 模拟回调函数
      const mockCallback = jest.fn();

      // 执行测试函数
      subscribeToGroupMessages('group123', mockCallback);

      // 模拟实时消息事件
      const mockPayload = { 
        new: { id: 'msg1', content: 'New message' },
        eventType: 'INSERT'
      };
      
      // 触发捕获的事件处理函数
      if (capturedHandler) {
        capturedHandler(mockPayload);
      }

      // 验证回调被调用
      expect(mockCallback).toHaveBeenCalledWith(mockPayload);
    });
  });
}); 