import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import CreatePostScreen from '../create';
import { createPost } from '../../../api/posts';
import { supabase } from '../../../api/supabase';

// Mock Alert.alert
jest.spyOn(Alert, 'alert');

// Mock console.error
const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

describe('CreatePostScreen Component', () => {
  // 在每个测试前重置所有的模拟
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // 测试结束后恢复console.error
  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  // 组件渲染测试
  describe('Component Rendering', () => {
    it('should render all major UI elements correctly', () => {
      const { getByText, getByPlaceholderText } = render(<CreatePostScreen />);
      
      // 验证标题
      expect(getByText('Create Post')).toBeTruthy();
      
      // 验证输入框
      expect(getByPlaceholderText("What's on your mind?")).toBeTruthy();
      
      // 验证媒体选项
      expect(getByText('Photo')).toBeTruthy();
      expect(getByText('Video')).toBeTruthy();
      expect(getByText('File')).toBeTruthy();
      
      // 验证隐私选项
      expect(getByText('Who can see this?')).toBeTruthy();
      expect(getByText('Everyone')).toBeTruthy();
      
      // 验证发布按钮
      expect(getByText('Post')).toBeTruthy();
    });
  });

  // 状态管理测试
  describe('State Management', () => {
    it('should initialize with empty text', () => {
      const { getByPlaceholderText } = render(<CreatePostScreen />);
      
      const textInput = getByPlaceholderText("What's on your mind?");
      expect(textInput.props.value).toBe('');
    });

    it('should update text state when input changes', () => {
      const { getByPlaceholderText } = render(<CreatePostScreen />);
      
      const textInput = getByPlaceholderText("What's on your mind?");
      fireEvent.changeText(textInput, 'Test post content');
      
      expect(textInput.props.value).toBe('Test post content');
    });
  });

  // 用户会话测试
  describe('User Session', () => {
    it('should get user session correctly when logged in', async () => {
      const { getByText } = render(<CreatePostScreen />);
      
      // 触发获取用户会话的操作
      fireEvent.press(getByText('Post'));
      
      // 验证supabase.auth.getUser被调用
      await waitFor(() => {
        expect(supabase.auth.getUser).toHaveBeenCalled();
      });
    });

    it('should handle error when user is not logged in', async () => {
      // 模拟用户未登录情况
      (supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
        data: { user: null },
        error: { message: 'Not authenticated' }
      });
      
      const { getByText } = render(<CreatePostScreen />);
      
      // 触发发布操作
      fireEvent.press(getByText('Post'));
      
      // 验证错误处理
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Error',
          'Failed to create post.'
        );
      });
    });
  });

  // 发布功能测试
  describe('Post Creation', () => {
    it('should handle successful post creation', async () => {
      // 模拟用户已登录和成功创建帖子
      (supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
        data: { user: { id: 'test-user-id' } },
        error: null
      });
      
      const { getByText, getByPlaceholderText } = render(<CreatePostScreen />);
      
      // 输入帖子内容
      const textInput = getByPlaceholderText("What's on your mind?");
      fireEvent.changeText(textInput, 'Test post content');
      
      // 点击发布
      fireEvent.press(getByText('Post'));
      
      // 验证createPost被正确调用
      await waitFor(() => {
        expect(createPost).toHaveBeenCalledWith(
          'test-user-id',
          'Test post content',
          'default'
        );
      });
      
      // 验证发布成功消息
      expect(Alert.alert).toHaveBeenCalledWith(
        'Success', 
        'Post created successfully!'
      );
      
      // 验证输入框被清空
      expect(textInput.props.value).toBe('');
    });

    it('should handle post creation failure', async () => {
      // 模拟创建帖子失败
      (createPost as jest.Mock).mockRejectedValueOnce(new Error('Failed to create post'));
      
      const { getByText, getByPlaceholderText } = render(<CreatePostScreen />);
      
      // 输入帖子内容
      const textInput = getByPlaceholderText("What's on your mind?");
      fireEvent.changeText(textInput, 'Test post content');
      
      // 点击发布
      fireEvent.press(getByText('Post'));
      
      // 验证错误处理
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Error',
          'Failed to create post.'
        );
      });
      
      // 验证控制台错误日志
      await waitFor(() => {
        expect(console.error).toHaveBeenCalled();
      });
    });
  });

  // 用户交互测试
  describe('User Interactions', () => {
    it('should trigger handleSubmit when post button is clicked', async () => {
      const { getByText } = render(<CreatePostScreen />);
      
      // 点击发布按钮
      fireEvent.press(getByText('Post'));
      
      // 验证supabase.auth.getUser被调用（表明handleSubmit被触发）
      await waitFor(() => {
        expect(supabase.auth.getUser).toHaveBeenCalled();
      });
    });

    it('should update UI when text is entered', () => {
      const { getByPlaceholderText } = render(<CreatePostScreen />);
      
      // 获取输入框并输入文本
      const textInput = getByPlaceholderText("What's on your mind?");
      fireEvent.changeText(textInput, 'New post content');
      
      // 验证UI更新
      expect(textInput.props.value).toBe('New post content');
    });
  });
}); 