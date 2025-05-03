import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import CreatePostScreen from '../create';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { createPost } from '../../../api/posts';
import { supabase } from '../../../api/supabase';
import { uploadPostImages } from '../../../helper/bucketHelper';

describe('CreatePostScreen', () => {
  // 每个测试前重置所有模拟函数
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // 1. 组件渲染测试
  it('应正确渲染UI各个元素', () => {
    const { getByPlaceholderText, getByText, getAllByLabelText  } = render(<CreatePostScreen />);
    
    // 检查是否渲染了输入框
    expect(getByPlaceholderText("What's on your mind?")).toBeTruthy();
    
    // 检查是否渲染了上传图片按钮
    expect(getByText('Photo')).toBeTruthy();
    
    // 检查是否渲染了字数统计
    expect(getByText('0 / 300')).toBeTruthy();
    
    // 检查是否渲染了发布按钮
    expect(getByText('Post')).toBeTruthy();
  });

  // 2. 文本输入测试
  describe('文本输入测试', () => {
    // Case 1: 输入文字小于300字
    it('输入文字小于300字时应正确更新状态和显示', () => {
      const { getByPlaceholderText, getByText } = render(<CreatePostScreen />);
      const input = getByPlaceholderText("What's on your mind?");
      
      fireEvent.changeText(input, 'Hello world');
      
      // 检查字数计数器是否更新
      expect(getByText('11 / 300')).toBeTruthy();
    });
    
    // Case 2: 输入文字超过300字
    it('输入超过300字时不应继续更新状态', () => {
      const { getByPlaceholderText, getByText } = render(<CreatePostScreen />);
      const input = getByPlaceholderText("What's on your mind?");
      
      // 创建一个301字的字符串
      const longText = 'a'.repeat(301);
      
      // 先输入300字
      fireEvent.changeText(input, 'a'.repeat(300));
      expect(getByText('300 / 300')).toBeTruthy();
      
      // 尝试输入301字
      fireEvent.changeText(input, longText);
      
      // 状态应该保持在300字
      expect(getByText('300 / 300')).toBeTruthy();
    });
  });

  // 3. 图片选择逻辑测试
  describe('图片选择逻辑测试', () => {
    // Case 3: 上传图片成功（在限制内）
    it('成功上传图片在限制内时应添加到fileList', async () => {
      // 模拟ImagePicker返回两张图片
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValueOnce({
        canceled: false,
        assets: [
          { uri: 'file://test1.jpg', fileName: 'test1.jpg' },
          { uri: 'file://test2.jpg', fileName: 'test2.jpg' }
        ]
      });
      
      const { getByText, getAllByLabelText  } = render(<CreatePostScreen />);
      
      // 点击Photo按钮
      const photoButton = getByText('Photo');
      await act(async () => {
        fireEvent.press(photoButton);
      });
      
      // 检查是否有删除图片的按钮（表示图片已添加）
      const trashIcons = getAllByLabelText ('trash');
      expect(trashIcons.length).toBe(2);
    });
    
    // Case 4: 超过最大图片数量
    it('超过最大图片数量时应显示提示', async () => {
      // 首先模拟已有3张图片
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValueOnce({
        canceled: false,
        assets: [
          { uri: 'file://test1.jpg', fileName: 'test1.jpg' },
          { uri: 'file://test2.jpg', fileName: 'test2.jpg' },
          { uri: 'file://test3.jpg', fileName: 'test3.jpg' }
        ]
      });
      
      const { getByText } = render(<CreatePostScreen />);
      
      // 点击Photo按钮添加前3张图片
      await act(async () => {
        fireEvent.press(getByText('Photo'));
      });
      
      // 再次模拟尝试添加2张图片
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValueOnce({
        canceled: false,
        assets: [
          { uri: 'file://test4.jpg', fileName: 'test4.jpg' },
          { uri: 'file://test5.jpg', fileName: 'test5.jpg' }
        ]
      });
      
      // 再次点击Photo按钮
      await act(async () => {
        fireEvent.press(getByText('Photo'));
      });
      
      // 检查Alert.alert是否被调用
      expect(Alert.alert).toHaveBeenCalledWith('Limit reached', 'You can only upload 4 images.');
    });
  });

  // 4. 删除图片测试
  it('删除图片时应从fileList中移除对应图片', async () => {
    // 模拟选择两张图片
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValueOnce({
      canceled: false,
      assets: [
        { uri: 'file://test1.jpg', fileName: 'test1.jpg' },
        { uri: 'file://test2.jpg', fileName: 'test2.jpg' }
      ]
    });
    
    const { getByText, getAllByLabelText  } = render(<CreatePostScreen />);
    
    // 点击Photo按钮添加图片
    await act(async () => {
      fireEvent.press(getByText('Photo'));
    });
    
    // 确认有两张图片
    let trashIcons = getAllByLabelText ('trash');
    expect(trashIcons.length).toBe(2);
    
    // 点击第一个删除按钮
    await act(async () => {
      fireEvent.press(trashIcons[0]);
    });
    
    // 确认现在只有一张图片
    trashIcons = getAllByLabelText ('trash');
    expect(trashIcons.length).toBe(1);
  });

  // 5. 提交帖子测试
  describe('提交帖子测试', () => {
    // Case 6: 提交内容为空
    it('提交内容为空时不应触发createPost', async () => {
      const { getByText } = render(<CreatePostScreen />);
      
      // 模拟点击Post按钮
      await act(async () => {
        fireEvent.press(getByText('Post'));
      });
      
      // createPost不应被调用
      expect(createPost).not.toHaveBeenCalled();
    });
    
    // Case 7: 提交文字内容成功
    it('成功提交文字内容时应调用相关API', async () => {
      // 模拟创建帖子成功
      (createPost as jest.Mock).mockResolvedValueOnce([{ id: 'new-post-id' }]);
      
      const { getByPlaceholderText, getByText } = render(<CreatePostScreen />);
      
      // 输入文字
      fireEvent.changeText(getByPlaceholderText("What's on your mind?"), 'Test post content');
      
      // 点击Post按钮
      await act(async () => {
        fireEvent.press(getByText('Post'));
      });
      
      // 检查API调用
      expect(supabase.auth.getUser).toHaveBeenCalled();
      expect(createPost).toHaveBeenCalledWith('test-user-id', 'Test post content', '');
      expect(Alert.alert).toHaveBeenCalledWith('Success', 'Post created successfully!');
    });
    
    // Case 8: 提交带图片的内容成功
    it('成功提交带图片的内容时应调用上传图片API', async () => {
      // 模拟图片选择
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValueOnce({
        canceled: false,
        assets: [{ uri: 'file://test.jpg', fileName: 'test.jpg' }]
      });
      
      // 模拟创建帖子成功
      (createPost as jest.Mock).mockResolvedValueOnce([{ id: 'new-post-id' }]);
      
      const { getByPlaceholderText, getByText } = render(<CreatePostScreen />);
      
      // 选择图片
      await act(async () => {
        fireEvent.press(getByText('Photo'));
      });
      
      // 输入文字
      fireEvent.changeText(getByPlaceholderText("What's on your mind?"), 'Test post with image');
      
      // 点击Post按钮
      await act(async () => {
        fireEvent.press(getByText('Post'));
      });
      
      // 检查API调用
      expect(supabase.auth.getUser).toHaveBeenCalled();
      expect(createPost).toHaveBeenCalled();
      expect(uploadPostImages).toHaveBeenCalled();
      expect(Alert.alert).toHaveBeenCalledWith('Success', 'Post created successfully!');
    });
    
    // Case 9: 接口抛出错误
    it('创建帖子接口抛出错误时应显示错误提示', async () => {
      // 模拟createPost抛出错误
      (createPost as jest.Mock).mockRejectedValueOnce(new Error('API Error'));
      
      const { getByPlaceholderText, getByText } = render(<CreatePostScreen />);
      
      // 输入文字
      fireEvent.changeText(getByPlaceholderText("What's on your mind?"), 'Test error case');
      
      // 点击Post按钮
      await act(async () => {
        fireEvent.press(getByText('Post'));
      });
      
      // 检查错误提示
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to create post.');
    });
  });
}); 