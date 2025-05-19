// Jest setup file
// 模拟Supabase客户端
const mockSupabaseChannel = {
  on: jest.fn().mockReturnThis(),
  subscribe: jest.fn().mockReturnThis(),
};

const mockSupabase = {
  from: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  channel: jest.fn(() => mockSupabaseChannel),
  removeChannel: jest.fn(),
  auth: {
    signUp: jest.fn(),
    getSession: jest.fn()
  }
};

// 模拟expo-router
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
}));

// 全局模拟
jest.mock('./src/api/supabase', () => ({
  supabase: mockSupabase,
}));

// 模拟bucket helper
jest.mock('./src/helper/bucketHelper', () => ({
  uploadPfp: jest.fn().mockResolvedValue(true)
}));

// 导出模拟对象以便在测试中使用
global.mockSupabase = mockSupabase;
global.mockSupabaseChannel = mockSupabaseChannel;

// 重置所有模拟
beforeEach(() => {
  jest.clearAllMocks();
}); 