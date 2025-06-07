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

// Posts API Mock Data
const mockPostsData = [
  {
    id: 'post1',
    content: 'Test post content 1',
    created_at: '2023-01-01T10:00:00Z',
    image_url: 'https://example.com/image1.jpg',
    profile: {
      username: 'testuser1',
      degree: 'Computer Science',
      pfp_url: 'https://example.com/avatar1.jpg',
      email: 'user1@example.com'
    },
    count: { count: 5 },
    likes: { count: 10 },
    isLike: { user_id: 'test-user-id' }
  },
  {
    id: 'post2',
    content: 'Test post content 2',
    created_at: '2023-01-02T11:00:00Z',
    image_url: 'https://example.com/image2.jpg',
    profile: {
      username: 'testuser2',
      degree: 'Engineering',
      pfp_url: 'https://example.com/avatar2.jpg',
      email: 'user2@example.com'
    },
    count: { count: 3 },
    likes: { count: 7 },
    isLike: null
  }
];

const mockSinglePost = {
  id: 'post1',
  content: 'Test post content 1',
  created_at: '2023-01-01T10:00:00Z',
  image_url: 'https://example.com/image1.jpg',
  user_id: 'test-user-id',
  profile: {
    user_id: 'test-user-id',
    username: 'testuser1',
    degree: 'Computer Science',
    email: 'user1@example.com',
    pfp_url: 'https://example.com/avatar1.jpg'
  },
  count: { count: 5 },
  likes: { count: 10 }
};

const mockCreatedPost = {
  id: 'new-post-id',
  user_id: 'test-user-id',
  content: 'New test post',
  image_url: 'https://example.com/new-image.jpg',
  created_at: '2023-01-03T12:00:00Z'
};

// Mock database responses for different scenarios
const mockDatabaseResponses = {
  // Success responses
  fetchPostsSuccess: { data: mockPostsData, error: null },
  fetchPostsEmpty: { data: [], error: null },
  fetchSinglePostSuccess: { data: mockSinglePost, error: null },
  createPostSuccess: { data: [mockCreatedPost], error: null },
  
  // Error responses
  fetchPostsError: { data: null, error: new Error('Failed to fetch posts') },
  fetchPostNotFound: { data: null, error: new Error('Post not found') },
  createPostError: { data: null, error: new Error('Failed to create post') },
  networkError: { data: null, error: new Error('Network error') },
  
  // Validation errors
  invalidInputError: { data: null, error: new Error('Invalid input parameters') }
};

const mockSupabase = {
  from: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  is: jest.fn().mockReturnThis(),
  not: jest.fn().mockReturnThis(),
  in: jest.fn().mockReturnThis(),
  ilike: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
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
global.mockPostsData = mockPostsData;
global.mockSinglePost = mockSinglePost;
global.mockCreatedPost = mockCreatedPost;
global.mockDatabaseResponses = mockDatabaseResponses;

// Reset all mocks
beforeEach(() => {
  jest.clearAllMocks();
  // Ensure console.error and console.log are mock functions in each test
  console.error = jest.fn();
  console.log = jest.fn();
  
  // 重置mockStorageResponse为默认值
  mockStorageResponse.data = null;
  mockStorageResponse.error = null;
  
  // Reset supabase chain methods to default behavior
  mockSupabase.from.mockReturnThis();
  mockSupabase.select.mockReturnThis();
  mockSupabase.insert.mockReturnThis();
  mockSupabase.eq.mockReturnThis();
  mockSupabase.ilike.mockReturnThis();
  mockSupabase.order.mockReturnThis();
  mockSupabase.single.mockReturnThis();
  mockSupabase.delete.mockReturnThis();
  mockSupabase.update.mockReturnThis();
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