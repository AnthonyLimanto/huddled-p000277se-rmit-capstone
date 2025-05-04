// 导入要测试的函数
import { createComment, fetchComments, fetchCommentsByParentId, deleteComment, canDeleteComment } from '../comments';
import { supabase } from '../supabase';
import { CommentCreate } from '../../model/comment';

// 测试前重置所有模拟
beforeEach(() => {
  jest.clearAllMocks();
  // 设置控制台错误的监听器，避免测试中显示太多错误日志
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

describe('fetchComments', () => {
  // 1.1 正常情况：成功获取评论数组
  test('应返回评论数组', async () => {
    const mockCommentsData = [
      {
        id: 'comment-1',
        content: '测试评论1',
        image_urls: ['image1.jpg'],
        user_id: 'user-1',
        post_id: 'post-1',
        parent_id: null,
        created_at: '2023-01-01T12:00:00Z',
        user: { username: 'testuser1', degree: 'Bachelor', pfp_url: 'profile1.jpg', email: 'test1@example.com' },
        count: [{ count: 2 }],
        likes: [{ count: 5 }],
        isLike: [{ user_id: 'user-2' }],
        children: [
          {
            id: 'comment-child-1',
            content: '子评论1',
            image_urls: ['image2.jpg'],
            user_id: 'user-2',
            post_id: 'post-1',
            parent_id: 'comment-1',
            created_at: '2023-01-01T12:30:00Z',
            user: { username: 'testuser2', degree: 'Master', pfp_url: 'profile2.jpg', email: 'test2@example.com' },
            count: [{ count: 0 }],
            likes: [{ count: 2 }],
            isLike: [],
          }
        ]
      }
    ];

    // 模拟 Supabase 响应
    (supabase.from as jest.Mock).mockImplementationOnce(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      is: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: mockCommentsData,
        error: null
      })
    }));
    
    const result = await fetchComments('post-1', 'user-2');
    
    expect(result).toEqual(mockCommentsData);
    expect(supabase.from).toHaveBeenCalledWith('comments');
    expect(console.error).not.toHaveBeenCalled();
  });
  
  // 1.2 异常情况：postId 为无效值时
  test('postId 为空值时应正确处理', async () => {
    // 模拟 Supabase 响应，正确实现is方法
    (supabase.from as jest.Mock).mockImplementationOnce(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      is: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: null,
        error: new Error('无效的postId')
      })
    }));
    
    const result = await fetchComments('', 'user-2');
    
    expect(result).toBeNull();
    expect(supabase.from).toHaveBeenCalledWith('comments');
    expect(console.error).toHaveBeenCalled();
  });
  
  // 1.3 异常情况：服务器返回错误
  test('服务器返回错误时应捕获并记录', async () => {
    // 模拟 Supabase 响应错误
    (supabase.from as jest.Mock).mockImplementationOnce(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      is: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: null,
        error: new Error('服务器错误')
      })
    }));
    
    const result = await fetchComments('post-1', 'user-2');
    
    expect(result).toBeNull();
    expect(console.error).toHaveBeenCalled();
  });
});

describe('fetchCommentsByParentId', () => {
  // 2.1 正常情况：成功获取子评论数组
  test('应返回子评论数组', async () => {
    const mockChildCommentsData = [
      {
        id: 'comment-child-1',
        content: '子评论1',
        image_urls: ['image2.jpg'],
        user_id: 'user-2',
        post_id: 'post-1',
        parent_id: 'comment-1',
        created_at: '2023-01-01T12:30:00Z',
        user: { username: 'testuser2', degree: 'Master', pfp_url: 'profile2.jpg', email: 'test2@example.com' },
        count: [{ count: 0 }],
        likes: [{ count: 2 }],
        isLike: [],
        children: []
      }
    ];

    // 模拟 Supabase 响应
    (supabase.from as jest.Mock).mockImplementationOnce(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: mockChildCommentsData,
        error: null
      })
    }));
    
    const result = await fetchCommentsByParentId('comment-1', 'user-2');
    
    expect(result).toEqual(mockChildCommentsData);
    expect(supabase.from).toHaveBeenCalledWith('comments');
    expect(console.error).not.toHaveBeenCalled();
  });
  
  // 2.2 异常情况：parentId 为无效值时
  test('parentId 为空值时应正确处理', async () => {
    // 模拟 Supabase 响应，确保order方法被正确模拟
    (supabase.from as jest.Mock).mockImplementationOnce(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: null,
        error: new Error('无效的parentId')
      })
    }));
    
    const result = await fetchCommentsByParentId('', 'user-2');
    
    expect(result).toBeNull();
    expect(supabase.from).toHaveBeenCalledWith('comments');
    expect(console.error).toHaveBeenCalled();
  });
  
  // 2.3 异常情况：服务器返回错误
  test('服务器返回错误时应捕获并记录', async () => {
    // 模拟 Supabase 响应错误
    (supabase.from as jest.Mock).mockImplementationOnce(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: null,
        error: new Error('服务器错误')
      })
    }));
    
    const result = await fetchCommentsByParentId('comment-1', 'user-2');
    
    expect(result).toBeNull();
    expect(console.error).toHaveBeenCalled();
  });
});

describe('createComment', () => {
  // 3.1 正常情况：创建评论成功
  test('应正确创建评论并返回评论数据', async () => {
    const commentData: CommentCreate = {
      content: '测试评论内容',
      user_id: 'user-1',
      post_id: 'post-1',
      parent_id: undefined,
      image_url: 'image1.jpg'
    };
    
    const mockResponseData = [
      {
        id: 'new-comment-id',
        content: '测试评论内容',
        user_id: 'user-1',
        post_id: 'post-1',
        parent_id: null,
        image_url: 'image1.jpg',
        created_at: '2023-01-01T12:00:00Z'
      }
    ];
    
    // 模拟 Supabase 响应
    (supabase.from as jest.Mock).mockImplementationOnce(() => ({
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockResolvedValue({
        data: mockResponseData,
        error: null
      })
    }));
    
    const result = await createComment(commentData);
    
    expect(result).toEqual(mockResponseData);
    expect(supabase.from).toHaveBeenCalledWith('comments');
  });
  
  // 3.2 异常情况：创建评论失败，参数缺失
  test('参数缺失时应抛出错误', async () => {
    const incompleteCommentData = {
      // 缺少必要字段
      content: '测试评论内容',
      // user_id 和 post_id 缺失
      parent_id: undefined,
      image_url: undefined
    } as unknown as CommentCreate;
    
    // 模拟 Supabase 响应错误
    (supabase.from as jest.Mock).mockImplementationOnce(() => ({
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockResolvedValue({
        data: null,
        error: new Error('缺少必要参数')
      })
    }));
    
    await expect(createComment(incompleteCommentData)).rejects.toThrow();
  });
  
  // 3.3 异常情况：服务器返回错误
  test('服务器返回错误时应正确抛出', async () => {
    const commentData: CommentCreate = {
      content: '测试评论内容',
      user_id: 'user-1',
      post_id: 'post-1',
      parent_id: undefined,
      image_url: undefined
    };
    
    // 模拟 Supabase 响应错误
    (supabase.from as jest.Mock).mockImplementationOnce(() => ({
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockResolvedValue({
        data: null,
        error: new Error('服务器错误')
      })
    }));
    
    await expect(createComment(commentData)).rejects.toThrow();
  });
  
  // 3.4 边界情况：评论内容超长
  test('评论内容超长时应正确处理', async () => {
    // 创建一个超长的评论内容（超过1000字符）
    const longContent = 'a'.repeat(1001);
    
    const commentData: CommentCreate = {
      content: longContent,
      user_id: 'user-1',
      post_id: 'post-1',
      parent_id: undefined,
      image_url: undefined
    };
    
    // 模拟 Supabase 响应
    (supabase.from as jest.Mock).mockImplementationOnce(() => ({
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockResolvedValue({
        data: null,
        error: new Error('评论内容超过限制')
      })
    }));
    
    await expect(createComment(commentData)).rejects.toThrow();
  });
});

describe('deleteComment', () => {
  // 4.1 正常情况：评论删除成功
  test('应正确删除评论并返回true', async () => {
    // 模拟 Supabase 响应
    (supabase.from as jest.Mock).mockImplementationOnce(() => ({
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({
        error: null
      })
    }));
    
    const result = await deleteComment('comment-123');
    
    expect(result).toBe(true);
    expect(supabase.from).toHaveBeenCalledWith('comments');
  });
  
  // 4.2 异常情况：删除不存在的评论
  test('删除不存在的评论应抛出错误', async () => {
    // 模拟 Supabase 响应
    (supabase.from as jest.Mock).mockImplementationOnce(() => ({
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({
        error: new Error('评论不存在')
      })
    }));
    
    await expect(deleteComment('non-existent-id')).rejects.toThrow();
    expect(supabase.from).toHaveBeenCalledWith('comments');
  });
  
  // 4.3 异常情况：服务器错误
  test('服务器错误时应正确抛出', async () => {
    // 模拟 Supabase 响应
    (supabase.from as jest.Mock).mockImplementationOnce(() => ({
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({
        error: new Error('服务器错误')
      })
    }));
    
    await expect(deleteComment('comment-123')).rejects.toThrow();
    expect(supabase.from).toHaveBeenCalledWith('comments');
  });
});

describe('canDeleteComment', () => {
  // 5.1 正常情况：用户是评论作者
  test('用户是评论作者时应返回true', async () => {
    // 模拟 Supabase 响应
    (supabase.from as jest.Mock).mockImplementationOnce(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({
        data: { user_id: 'user-123' },
        error: null
      })
    }));
    
    const result = await canDeleteComment('comment-123', 'user-123');
    
    expect(result).toBe(true);
    expect(supabase.from).toHaveBeenCalledWith('comments');
  });
  
  // 5.2 正常情况：用户不是评论作者
  test('用户不是评论作者时应返回false', async () => {
    // 模拟 Supabase 响应
    (supabase.from as jest.Mock).mockImplementationOnce(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({
        data: { user_id: 'other-user' },
        error: null
      })
    }));
    
    const result = await canDeleteComment('comment-123', 'user-123');
    
    expect(result).toBe(false);
    expect(supabase.from).toHaveBeenCalledWith('comments');
  });
  
  // 5.3 异常情况：评论不存在
  test('评论不存在时应返回false', async () => {
    // 模拟 Supabase 响应
    (supabase.from as jest.Mock).mockImplementationOnce(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({
        data: null,
        error: null
      })
    }));
    
    const result = await canDeleteComment('non-existent-id', 'user-123');
    
    expect(Boolean(result)).toBe(false);
    expect(supabase.from).toHaveBeenCalledWith('comments');
  });
  
  // 5.4 异常情况：服务器错误
  test('服务器错误时应返回false', async () => {
    // 模拟 Supabase 响应
    (supabase.from as jest.Mock).mockImplementationOnce(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({
        data: null,
        error: new Error('服务器错误')
      })
    }));
    
    const result = await canDeleteComment('comment-123', 'user-123');
    
    expect(result).toBe(false);
    expect(supabase.from).toHaveBeenCalledWith('comments');
    expect(console.error).toHaveBeenCalled();
  });
}); 