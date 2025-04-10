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
  
// 模拟 @expo/vector-icons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
  // 添加你在项目中使用的其他图标库
}));
  
// 模拟路由
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));

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
  })
}));

jest.mock('react-native', () => {
  const rn = jest.requireActual('react-native');
  rn.Platform.select = jest.fn(obj => obj.default || obj.ios || obj.android || {});
  
  // 模拟所有主要的 React Native 组件
  rn.SafeAreaView = rn.View;
  rn.KeyboardAvoidingView = rn.View;
  rn.ScrollView = rn.View;
  rn.TouchableOpacity = rn.View;
  rn.Image = rn.View;
  rn.TextInput = rn.View;
  
  return rn;
});

// 模拟 Expo 相关模块
jest.mock('expo-router', () => ({
  useRouter: () => ({
    replace: jest.fn(),
  }),
}));

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
  MediaTypeOptions: {
    Images: 'images',
  },
}));

// 模拟 Alert
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

// 模拟 API 调用
jest.mock('./src/api/users.ts', () => ({
  completeSignUp: jest.fn(),
}));

// 如果日志显示你使用的第三方图标库也需要模拟
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons-Mock',
}));

console.log('✅ jest.setup.js loaded');