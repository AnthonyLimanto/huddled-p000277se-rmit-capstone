import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import PostCard from '../../components/PostCard';
import { Post } from '../../model/post';
import { Comment } from '../../model/comment';
import * as AuthContext from '../../context/AuthContext';
import { Platform } from 'react-native';

// 设置测试超时
jest.setTimeout(30000);

// 导入实际组件使用的模块，然后在这些模块上使用 spyOn
// 这样保证 mock 与组件引用的是相同路径
import * as comments from '../../api/comments';
import * as postLikes from '../../api/post_likes';
import * as commentLikes from '../../api/comment_likes';


// 然后导入被模拟的函数
import { downloadPostImage } from '../../helper/bucketHelper';

// 模拟Platform.OS，应该在模拟API之前设置
Platform.OS = 'web';

// 模拟 Auth 上下文，匹配组件的使用方式
const mockUser = { id: 'logged-user-123', email: 'user@example.com' };
jest.spyOn(AuthContext, 'useAuth').mockReturnValue({
  user: mockUser,
  isLoading: false,
  signOut: jest.fn().mockResolvedValue(undefined)
});

// 模拟一个更完整的帖子对象，确保所有条件分支都能被触发
const createMockPost = (isLiked = false, hasImage = true): Post => ({
  id: 'post-123',
  user_id: 'user-456',
  content: '这是一个测试帖子',
  image_url: hasImage ? 'image1.jpg,image2.jpg' : undefined, // 确保非 'default'
  created_at: new Date(),
  profile: {
    username: 'testuser',
    degree: '计算机科学',
    email: 'test@example.com',
    id: 'user-456' as unknown as number,
    created_at: new Date(),
    pfp_url: 'https://example.com/profile.jpg',
  },
  likes: [{ count: 10 }],
  count: [{ count: 5 }], // 确保有评论计数 > 0，才会显示"查看评论"按钮
  isLike: isLiked ? [{}] : [] // 根据参数设置点赞状态
});

// 模拟评论数据
const mockComments: Comment[] = [
  {
    id: 'comment-1',
    user_id: 'user-789',
    post_id: 'post-123',
    content: '这是一个测试评论',
    created_at: new Date(),
    user: {
      username: 'commenter1',
      degree: '软件工程',
      email: 'commenter1@example.com'
    },
    count: [{ count: 2 }],
    likes: [{ count: 3 }],
    isLike: [],
    children: [
      {
        id: 'comment-2',
        user_id: 'user-101',
        post_id: 'post-123',
        parent_id: 'comment-1',
        content: '这是一个测试回复',
        created_at: new Date(),
        user: {
          username: 'replier1',
          degree: '人工智能',
          email: 'replier1@example.com'
        },
        count: [{ count: 0 }],
        likes: [{ count: 1 }],
        isLike: []
      }
    ]
  }
];

describe('PostCard 组件', () => {
  // 每个测试前重置mock
  beforeEach(() => {
    // 清除所有模拟函数的调用历史和实现
    jest.clearAllMocks();
    
    // 重置 Platform.OS 为 'web'，确保图片下载逻辑正确
    Platform.OS = 'web';
    
    // 确保 downloadPostImage 被正确模拟
    (downloadPostImage as jest.Mock).mockImplementation(async (postId: string, imageNameArr: string[]) => {
      // 如果没有提供图片名称数组，返回空数组
      if (!imageNameArr || imageNameArr.length === 0) {
        return [];
      }
      // 否则为每个图片名称生成一个模拟URL
      return imageNameArr.map((name: string) => `https://example.com/${postId}/${name}`);
    });
    
    // 除非在测试中特别覆盖，否则保持默认的模拟实现
    // 这样确保每个测试都有一个干净的起点
    jest.spyOn(comments, 'fetchComments').mockImplementation(() => Promise.resolve(mockComments as any));
    jest.spyOn(comments, 'fetchCommentsByParentId').mockImplementation(() => Promise.resolve(mockComments[0].children as any));
    jest.spyOn(comments, 'createComment').mockImplementation(() => Promise.resolve([{ id: 'new-comment-id' }] as any));
    
    jest.spyOn(postLikes, 'addPostLike').mockImplementation(() => Promise.resolve(true));
    jest.spyOn(postLikes, 'deletePostLike').mockImplementation(() => Promise.resolve(true));
    jest.spyOn(postLikes, 'fetchPostLikeInfo').mockImplementation(() => Promise.resolve({ likes: 11, isLike: true }));
    
    jest.spyOn(commentLikes, 'addCommentLike').mockImplementation(() => Promise.resolve(true));
    jest.spyOn(commentLikes, 'deleteCommentLike').mockImplementation(() => Promise.resolve(true));
  });

  // 测试组件初始化和API调用
  test('组件加载时应调用fetchComments和downloadPostImage', async () => {
    // 使用完整的模拟帖子，确保有图片URL
    const mockPost = createMockPost(false, true);
    
    // 确保组件渲染前就设置好 mock 返回值
    jest.spyOn(comments, 'fetchComments').mockResolvedValueOnce(mockComments as any);
    
    // 渲染组件
    render(<PostCard post={mockPost} />);
    
    // 等待fetchComments被调用，使用更长的超时时间
    await waitFor(
      () => {
        expect(comments.fetchComments).toHaveBeenCalledWith('post-123', 'logged-user-123');
      },
      { timeout: 3000 }
    );
    
    // 等待downloadPostImage被调用
    await waitFor(
      () => {
        expect(downloadPostImage).toHaveBeenCalledWith('post-123', ['image1.jpg', 'image2.jpg']);
      },
      { timeout: 3000 }
    );
  });

  // 测试帖子点赞功能
  test('初始未点赞时，点击点赞按钮应调用addPostLike', async () => {
    // 使用未点赞的帖子
    const mockPost = createMockPost(false);
    
    // 确保组件渲染前设置好 mock
    jest.spyOn(comments, 'fetchComments').mockResolvedValueOnce(mockComments as any);
    
    const { getByTestId, debug } = render(<PostCard post={mockPost} />);
    
    // 等待组件初始化完成，使用更长的超时时间
    await waitFor(
      () => {
        expect(comments.fetchComments).toHaveBeenCalledWith('post-123', 'logged-user-123');
      },
      { timeout: 3000 }
    );
    
    // 等待一段时间，确保组件完全渲染
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 输出组件树，帮助诊断问题
    console.log('点赞测试组件树:', debug());
    
    // 找到点赞按钮
    const likeButton = getByTestId('post-like-button');
    
    // 点击点赞按钮
    fireEvent.press(likeButton);
    
    // 验证调用了addPostLike，使用更长的超时时间
    await waitFor(
      () => {
        expect(postLikes.addPostLike).toHaveBeenCalledWith('post-123', 'logged-user-123');
      },
      { timeout: 3000 }
    );
    
    // 验证调用了fetchPostLikeInfo更新状态
    await waitFor(
      () => {
        expect(postLikes.fetchPostLikeInfo).toHaveBeenCalledWith('post-123', 'logged-user-123');
      },
      { timeout: 3000 }
    );
  });
  
  test('初始已点赞时，点击点赞按钮应调用deletePostLike', async () => {
    // 使用已点赞的帖子
    const mockPost = createMockPost(true);
    
    const { getByTestId } = render(<PostCard post={mockPost} />);
    
    // 等待组件初始化完成
    await waitFor(() => {
      expect(comments.fetchComments).toHaveBeenCalled();
    });
    
    // 找到点赞按钮
    const likeButton = getByTestId('post-like-button');
    
    // 点击点赞按钮
    fireEvent.press(likeButton);
    
    // 验证调用了deletePostLike
    await waitFor(() => {
      expect(postLikes.deletePostLike).toHaveBeenCalledWith('post-123', 'logged-user-123');
    });
    
    // 验证调用了fetchPostLikeInfo更新状态
    await waitFor(() => {
      expect(postLikes.fetchPostLikeInfo).toHaveBeenCalledWith('post-123', 'logged-user-123');
    });
  });
  
  // 测试评论显示和操作
  test('有评论时，应显示"查看所有评论"按钮并能展开评论', async () => {
    const mockPost = createMockPost();
    
    const { getByTestId, getByText, queryByText } = render(<PostCard post={mockPost} />);
    
    // 等待组件初始化完成
    await waitFor(() => {
      expect(comments.fetchComments).toHaveBeenCalled();
    });
    
    // 验证"查看所有评论"按钮存在
    const viewCommentsButton = getByTestId('view-comments-button');
    expect(viewCommentsButton).toBeTruthy();
    expect(getByText('View all comments')).toBeTruthy();
    
    // 点击展开评论
    fireEvent.press(viewCommentsButton);
    
    // 验证评论内容显示
    await waitFor(() => {
      expect(queryByText('这是一个测试评论')).toBeTruthy();
    });
    
    // 验证按钮文字变为"Hide all"
    expect(getByText('Hide all')).toBeTruthy();
    
    // 再次点击应隐藏评论
    fireEvent.press(viewCommentsButton);
    
    // 验证按钮文字变回"View all comments"
    await waitFor(() => {
      expect(getByText('View all comments')).toBeTruthy();
    });
  });
  
  // 测试评论点赞功能
  test('点击评论点赞按钮应调用相应API', async () => {
    const mockPost = createMockPost();
    
    const { getByTestId } = render(<PostCard post={mockPost} />);
    
    // 等待组件初始化完成
    await waitFor(() => {
      expect(comments.fetchComments).toHaveBeenCalled();
    });
    
    // 点击"查看所有评论"按钮展开评论
    const viewCommentsButton = getByTestId('view-comments-button');
    fireEvent.press(viewCommentsButton);
    
    // 等待评论渲染完成
    await waitFor(() => {
      const commentLikeButton = getByTestId('comment-like-button-comment-1');
      expect(commentLikeButton).toBeTruthy();
    });
    
    // 点击评论点赞按钮
    const commentLikeButton = getByTestId('comment-like-button-comment-1');
    fireEvent.press(commentLikeButton);
    
    // 验证调用了addCommentLike
    await waitFor(() => {
      expect(commentLikes.addCommentLike).toHaveBeenCalledWith('comment-1', 'logged-user-123');
    });
  });
  
  // 测试发布评论
  test('输入评论后应能发布并刷新评论列表', async () => {
    const mockPost = createMockPost();
    
    const { getByTestId, getByPlaceholderText, queryByTestId } = render(<PostCard post={mockPost} />);
    
    // 等待组件初始化完成
    await waitFor(() => {
      expect(comments.fetchComments).toHaveBeenCalled();
    });
    
    // 找到评论输入框
    const commentInput = getByPlaceholderText('Leave your thoughts here ...');
    
    // 初始状态应该没有发布按钮
    expect(queryByTestId('post-comment-button')).toBeNull();
    
    // 输入评论内容
    fireEvent.changeText(commentInput, '这是一条新评论');
    
    // 应显示发布按钮
    await waitFor(() => {
      const postButton = getByTestId('post-comment-button');
      expect(postButton).toBeTruthy();
    });
    
    // 点击发布按钮
    const postButton = getByTestId('post-comment-button');
    fireEvent.press(postButton);
    
    // 验证调用了createComment
    await waitFor(() => {
      expect(comments.createComment).toHaveBeenCalledWith({
        user_id: 'logged-user-123',
        post_id: 'post-123',
        content: '这是一条新评论'
      });
    });
    
    // 验证刷新了评论列表
    await waitFor(() => {
      expect(comments.fetchComments).toHaveBeenCalledTimes(2);
    });
  });
  
  // 测试发布回复
  test('点击Reply按钮应显示回复框并能发布回复', async () => {
    const mockPost = createMockPost();
    
    const { getByTestId, getByPlaceholderText } = render(<PostCard post={mockPost} />);
    
    // 等待组件初始化完成
    await waitFor(() => {
      expect(comments.fetchComments).toHaveBeenCalled();
    });
    
    // 点击"查看所有评论"按钮展开评论
    const viewCommentsButton = getByTestId('view-comments-button');
    fireEvent.press(viewCommentsButton);
    
    // 等待评论渲染完成
    await waitFor(() => {
      const replyButton = getByTestId('reply-button-comment-1');
      expect(replyButton).toBeTruthy();
    });
    
    // 点击回复按钮
    const replyButton = getByTestId('reply-button-comment-1');
    fireEvent.press(replyButton);
    
    // 应显示回复输入框
    const replyInput = getByPlaceholderText('Write a reply...');
    
    // 输入回复内容
    fireEvent.changeText(replyInput, '这是一条回复');
    
    // 等待回复按钮出现
    await waitFor(() => {
      const postReplyButton = getByTestId('post-reply-button-comment-1');
      expect(postReplyButton).toBeTruthy();
    });
    
    // 点击发布回复按钮
    const postReplyButton = getByTestId('post-reply-button-comment-1');
    fireEvent.press(postReplyButton);
    
    // 验证调用了createComment
    await waitFor(() => {
      expect(comments.createComment).toHaveBeenCalledWith({
        content: '这是一条回复',
        user_id: 'logged-user-123',
        post_id: 'post-123',
        parent_id: 'comment-1'
      });
    });
    
    // 验证加载了子评论
    await waitFor(() => {
      expect(comments.fetchCommentsByParentId).toHaveBeenCalledWith('comment-1', 'logged-user-123');
    });
  });
  
  // 测试图片加载行为
  test('帖子有图片时应调用downloadPostImage并显示图片', async () => {
    const mockPost = createMockPost(false, true);
    
    const { queryByTestId } = render(<PostCard post={mockPost} />);
    
    // 等待图片加载
    await waitFor(() => {
      expect(downloadPostImage).toHaveBeenCalledWith('post-123', ['image1.jpg', 'image2.jpg']);
    });
    
    // 验证图片容器存在
    await waitFor(() => {
      expect(queryByTestId('post-images-wrapper')).toBeTruthy();
    });
  });
  
  test('帖子无图片时不应显示图片容器', async () => {
    // 使用没有图片的帖子
    const mockPost = createMockPost(false, false);
    
    // 确保组件渲染前就设置好 mock 返回值
    jest.spyOn(comments, 'fetchComments').mockResolvedValueOnce(mockComments as any);
    
    // 渲染组件
    const { queryByTestId, debug } = render(<PostCard post={mockPost} />);
    
    // 打印组件树，帮助调试
    console.log('组件树:', debug());
    
    // 先验证 fetchComments 被调用 - 使用更长的超时时间，确保异步操作有足够时间完成
    await waitFor(
      () => {
        expect(comments.fetchComments).toHaveBeenCalledWith('post-123', 'logged-user-123');
      },
      { timeout: 3000 }
    );
    
    // 等待组件完全渲染
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 验证图片容器不存在
    expect(queryByTestId('post-image-container')).toBeNull();
    
    // 验证没有调用 downloadPostImage
    expect(downloadPostImage).not.toHaveBeenCalled();
  });
}); 