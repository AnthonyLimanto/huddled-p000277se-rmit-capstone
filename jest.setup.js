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

  console.log('✅ jest.setup.js loaded');