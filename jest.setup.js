// Jest setup file
// Mock Supabase client
const mockSupabaseChannel = {
  on: jest.fn().mockReturnThis(),
  subscribe: jest.fn().mockReturnThis(),
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
  }
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
  }),
}));

// Mock global supabase
jest.mock('./src/api/supabase', () => ({
  supabase: mockSupabase,
}));

// Mock bucket helper
jest.mock('./src/helper/bucketHelper', () => ({
  uploadPfp: jest.fn().mockResolvedValue(true)
}));

// Export mock objects for use in tests
global.mockSupabase = mockSupabase;
global.mockSupabaseChannel = mockSupabaseChannel;

// Reset all mocks
beforeEach(() => {
  jest.clearAllMocks();
  // Ensure console.error and console.log are mock functions in each test
  console.error = jest.fn();
  console.log = jest.fn();
});

// After all tests, restore original console methods
afterAll(() => {
  console.error = originalConsoleError;
  console.log = originalConsoleLog;
});