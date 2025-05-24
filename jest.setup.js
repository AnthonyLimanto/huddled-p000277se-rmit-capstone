// Jest setup file
// Mock Supabase client
const mockSupabaseChannel = {
  on: jest.fn().mockReturnThis(),
  subscribe: jest.fn().mockReturnThis(),
};

// 创建一个更完整的Supabase存储模拟
const mockStorageResponse = {
  data: null,
  error: null
};

const mockStorage = {
  from: jest.fn().mockImplementation((bucket) => ({
    upload: jest.fn().mockImplementation((path, file, options) => {
      return mockStorageResponse;
    }),
    download: jest.fn().mockImplementation((path) => {
      return mockStorageResponse;
    }),
    createSignedUrl: jest.fn().mockImplementation((path, expiresIn) => {
      return mockStorageResponse;
    })
  }))
};

const mockSupabase = {
  from: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  is: jest.fn().mockReturnThis(),
  not: jest.fn().mockReturnThis(),
  in: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  single: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  channel: jest.fn(() => mockSupabaseChannel),
  removeChannel: jest.fn(),
  auth: {
    signUp: jest.fn(),
    getSession: jest.fn()
  },
  storage: mockStorage
};

// Save original console methods
const originalConsoleError = console.error;
const originalConsoleLog = console.log;

// mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: (props) => {
    const React = require('react');
    const { View, Text } = require('react-native');
    return React.createElement(
      View, 
      { 
        testID: props.testID, 
        accessibilityLabel: props.name,
        style: { 
          width: props.size, 
          height: props.size, 
          backgroundColor: props.color 
        }
      },
      props.name
    );
  },
  MaterialIcons: (props) => {
    const React = require('react');
    const { View, Text } = require('react-native');
    return React.createElement(
      View, 
      { 
        testID: props.testID, 
        accessibilityLabel: props.name,
        style: { 
          width: props.size, 
          height: props.size, 
          backgroundColor: props.color 
        }
      },
      props.name
    );
  }
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
  useLocalSearchParams: () => ({
    userId: 'test@example.com'
  }),
}));

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn().mockImplementation((blob) => {
  return 'mock-object-url';
});

// Mock base64-arraybuffer
jest.mock('base64-arraybuffer', () => ({
  decode: jest.fn().mockImplementation((base64) => {
    return new ArrayBuffer(8);
  })
}));

// Mock global supabase
jest.mock('./src/api/supabase', () => ({
  supabase: mockSupabase,
}));

// Export mock objects for use in tests
global.mockSupabase = mockSupabase;
global.mockSupabaseChannel = mockSupabaseChannel;
global.mockStorageResponse = mockStorageResponse;

// Reset all mocks
beforeEach(() => {
  jest.clearAllMocks();
  // Ensure console.error and console.log are mock functions in each test
  console.error = jest.fn();
  console.log = jest.fn();
  
  // 重置mockStorageResponse为默认值
  mockStorageResponse.data = null;
  mockStorageResponse.error = null;
});

// After all tests, restore original console methods
afterAll(() => {
  console.error = originalConsoleError;
  console.log = originalConsoleLog;
});

// mock @rneui/base components
jest.mock('@rneui/base', () => ({
  Avatar: (props) => {
    const React = require('react');
    const { View, Image } = require('react-native');
    return React.createElement(
      View,
      {
        testID: props.testID || 'avatar',
        style: {
          width: props.size || 40,
          height: props.size || 40,
          borderRadius: (props.size || 40) / 2,
          backgroundColor: '#f0f0f0'
        }
      },
      props.source && React.createElement(Image, {
        source: props.source,
        style: { width: '100%', height: '100%', borderRadius: (props.size || 40) / 2 }
      })
    );
  }
}));