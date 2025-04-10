// jest.setup.js
jest.mock('expo-font', () => ({
  isLoaded: jest.fn(() => true),
  loadAsync: jest.fn(() => Promise.resolve()),
  __internal__: {
    NativeFont: {
      get loaded() {
        return [];
      }
    }
  }
}));
  
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
  }
}));
  
// mock @react-navigation/native
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
  // mock useFocusEffect
  useFocusEffect: jest.fn((callback) => callback()),
}));

jest.mock('react-native', () => {
  const rn = jest.requireActual('react-native');
  rn.Platform.select = jest.fn(obj => obj.default || obj.ios || obj.android || {});
  
  // mock all major react native components
  rn.SafeAreaView = rn.View;
  rn.KeyboardAvoidingView = rn.View;
  rn.ScrollView = rn.View;
  rn.TouchableOpacity = rn.View;
  rn.Image = rn.View;
  rn.TextInput = rn.View;
  rn.Modal = rn.View;
  
  return rn;
});

// mock expo-router
jest.mock('expo-router', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  
  const mockUseRouter = jest.fn().mockReturnValue({
    replace: jest.fn(),
    push: jest.fn(),
  });
  
  // Create a valid Tabs component
  const MockTabs = ({ children, screenOptions }) => {
    return React.createElement(View, { testID: 'tabs-container' }, children);
  };
  
  // Add Screen subcomponent
  MockTabs.Screen = ({ name, options }) => {
    // Store test properties directly in props instead of a special testProps property
    return React.createElement(
      View, 
      { 
        testID: `screen-${name}`,
        // Store test properties directly in props
        title: options.title,
        accessibilityLabel: options.tabBarAccessibilityLabel
      },
      // Add key to the icon element to eliminate the React warning
      options.tabBarIcon ? 
        React.createElement(
          React.Fragment,
          { key: `icon-${name}` },
          options.tabBarIcon({ color: 'black', size: 24 })
        ) : null
    );
  };
  
  return {
    useRouter: mockUseRouter,
    Tabs: MockTabs
  };
});

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn().mockResolvedValue({
    canceled: false,
    assets: [
      {
        uri: 'file://example.jpg',
        width: 200,
        height: 200,
        type: 'image',
        fileName: 'example.jpg',
        fileSize: 12345
      }
    ]
  }),
  MediaTypeOptions: {
    Images: 'images',
  },
}));

// mock Alert
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

// mock api/users.ts
jest.mock('./src/api/users.ts', () => ({
  completeSignUp: jest.fn(),
}));

// mock api/supabase
jest.mock('./src/api/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn().mockResolvedValue({ error: null }),
      getUser: jest.fn().mockResolvedValue({ 
        data: { 
          user: { 
            id: 'test-user-id', 
            email: 'test@example.com' 
          } 
        }, 
        error: null 
      })
    }
  }
}));

// mock api/posts.ts
jest.mock('./src/api/posts', () => ({
  fetchPosts: jest.fn().mockResolvedValue([
    { id: '1', title: 'Post 1', content: 'Content 1', author: { name: 'User 1' } },
    { id: '2', title: 'Post 2', content: 'Content 2', author: { name: 'User 2' } },
  ]),
  createPost: jest.fn().mockResolvedValue({
    id: 'new-post-id',
    content: 'Test post content',
    authorId: 'test-user-id',
    type: 'default',
    createdAt: new Date().toISOString()
  })
}));

// mock src/components/PostCard.tsx
jest.mock('./src/components/PostCard', () => {
  const React = require('react');
  const { View } = require('react-native');
  
  return function MockPostCard({ post }) {
    return React.createElement(View, { 
      testID: `post-${post.id}`,
      'data-post': JSON.stringify(post)
    });
  };
});

// mock src/components/Header.tsx
jest.mock('./src/components/Header', () => {
  const React = require('react');
  const { View } = require('react-native');
  
  return function MockHeader() {
    return React.createElement(View, { testID: "mock-header" });
  };
});

console.log('✅ jest.setup.js loaded');