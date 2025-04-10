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
}));
  
// 模拟路由
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
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
  rn.Modal = rn.View;
  
  return rn;
});

// 修改 expo-router 模拟，使用 jest.fn() 创建可配置的模拟函数
jest.mock('expo-router', () => ({
  useRouter: jest.fn().mockReturnValue({
    replace: jest.fn(),
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
  }),
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

// 添加对 supabase 的模拟
jest.mock('./src/api/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn().mockResolvedValue({ error: null }),
    }
  }
}));

console.log('✅ jest.setup.js loaded');