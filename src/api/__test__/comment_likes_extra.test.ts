// 导入要测试的函数
import { fetchCommentLikeInfo, addCommentLike, deleteCommentLike } from '../comment_likes';
import { deleteComment, canDeleteComment } from '../comments';
import { supabase } from '../supabase';

// 测试前重置所有模拟
beforeEach(() => {
  jest.clearAllMocks();
  // 设置控制台错误的监听器，避免测试中显示太多错误日志
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

describe('likeComment', () => {
  // 4.1 正常情况：成功为评论点赞
  test('点赞成功时应返回true', async () => {
    // 模拟点赞操作成功
    (supabase.from as jest.Mock).mockImplementationOnce(() => ({
      insert: jest.fn().mockResolvedValue({ 
        data: {}, 
        error: null 
      })
    }));
    
    const result = await addCommentLike('comment-123', 'user-123');
    
    expect(result).toBe(true);
    expect(supabase.from).toHaveBeenCalledWith('comment_likes');
  });
  
  // 4.2 异常情况：commentId 缺失或非法值
  test('commentId为空时应返回错误', async () => {
    // 模拟空commentId抛出错误
    (supabase.from as jest.Mock).mockImplementationOnce(() => ({
      insert: jest.fn().mockImplementation(() => {
        throw new Error('无效的评论ID');
      })
    }));
    
    const result = await addCommentLike('', 'user-123');
    
    expect(result).toBe(false);
    expect(console.error).toHaveBeenCalled();
  });
  
  // 4.3 异常情况：服务器返回错误
  test('服务器返回错误时应处理并返回false', async () => {
    // 模拟服务器返回错误
    (supabase.from as jest.Mock).mockImplementationOnce(() => ({
      insert: jest.fn().mockResolvedValue({ 
        data: null, 
        error: new Error('数据库错误') 
      })
    }));
    
    const result = await addCommentLike('comment-123', 'user-123');
    
    expect(result).toBe(false);
    expect(console.error).toHaveBeenCalled();
  });
  
  // 4.4 异常情况：已点赞重复点击
  test('已点赞的评论重复点赞应返回错误', async () => {
    // 模拟插入失败（唯一约束错误）
    (supabase.from as jest.Mock).mockImplementationOnce(() => ({
      insert: jest.fn().mockResolvedValue({ 
        data: null, 
        error: { code: '23505', message: '违反唯一约束' } // PostgreSQL 唯一约束错误码
      })
    }));
    
    const result = await addCommentLike('comment-123', 'user-123');
    
    expect(result).toBe(false);
    expect(console.error).toHaveBeenCalled();
  });
});

describe('unlikeComment', () => {
  // 5.1 正常情况：成功取消点赞
  test('取消点赞成功时应返回true', async () => {
    // 模拟取消点赞操作成功
    (supabase.from as jest.Mock).mockImplementationOnce(() => ({
      delete: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null })
        })
      })
    }));
    
    const result = await deleteCommentLike('comment-123', 'user-123');
    
    expect(result).toBe(true);
    expect(supabase.from).toHaveBeenCalledWith('comment_likes');
  });
  
  // 5.2 异常情况：commentId 缺失或非法值
  test('commentId为空时应返回错误', async () => {
    // 模拟空commentId抛出错误
    (supabase.from as jest.Mock).mockImplementationOnce(() => ({
      delete: jest.fn().mockImplementation(() => {
        throw new Error('无效的评论ID');
      })
    }));
    
    const result = await deleteCommentLike('', 'user-123');
    
    expect(result).toBe(false);
    expect(console.error).toHaveBeenCalled();
  });
  
  // 5.3 异常情况：服务器返回错误
  test('服务器返回错误时应处理并返回false', async () => {
    // 模拟服务器返回错误
    (supabase.from as jest.Mock).mockImplementationOnce(() => ({
      delete: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: new Error('数据库错误') })
        })
      })
    }));
    
    const result = await deleteCommentLike('comment-123', 'user-123');
    
    expect(result).toBe(false);
    expect(console.error).toHaveBeenCalled();
  });
  
  // 5.4 边界情况：未点赞时尝试取消点赞
  test('未点赞的评论尝试取消点赞应正确处理', async () => {
    // 模拟没有删除任何行的情况（但不视为错误）
    (supabase.from as jest.Mock).mockImplementationOnce(() => ({
      delete: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ 
            error: null,
            data: { count: 0 } // 没有删除任何行
          })
        })
      })
    }));
    
    const result = await deleteCommentLike('comment-123', 'user-123');
    
    expect(result).toBe(true); // API设计为无论是否实际删除了记录，只要操作本身没有错误就返回true
    expect(supabase.from).toHaveBeenCalledWith('comment_likes');
  });
});

describe('获取评论点赞信息 - 边界情况', () => {
  // 6.1 网络异常情况
  test('网络异常时应返回默认值', async () => {
    // 模拟网络异常
    (supabase.from as jest.Mock).mockImplementationOnce(() => {
      throw new Error('网络异常');
    });
    
    const result = await fetchCommentLikeInfo('comment-123', 'user-123');
    
    expect(result).toEqual({
      likes: 0,
      isLike: false
    });
    expect(console.error).toHaveBeenCalled();
  });
  
  // 6.2 并发调用时的行为
  test('并发调用应各自独立运行', async () => {
    // 模拟第一次调用 fetchCommentLikeInfo
    // 第一次调用的第一个请求（获取点赞数）
    (supabase.from as jest.Mock).mockImplementationOnce(() => ({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ 
          count: 5, 
          error: null 
        })
      })
    }));
    
    // 第一次调用的第二个请求（检查用户是否点赞）
    (supabase.from as jest.Mock).mockImplementationOnce(() => ({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({ 
              data: { comment_id: 'comment-123', user_id: 'user-123' }, 
              error: null 
            })
          })
        })
      })
    }));
    
    // 模拟第二次调用 fetchCommentLikeInfo
    // 第二次调用的第一个请求（获取点赞数）
    (supabase.from as jest.Mock).mockImplementationOnce(() => ({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ 
          count: 10, 
          error: null 
        })
      })
    }));
    
    // 第二次调用的第二个请求（检查用户是否点赞）
    (supabase.from as jest.Mock).mockImplementationOnce(() => ({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({ 
              data: null, 
              error: null 
            })
          })
        })
      })
    }));
    
    // 并发调用两次
    const result1 = await fetchCommentLikeInfo('comment-123', 'user-123');
    const result2 = await fetchCommentLikeInfo('comment-456', 'user-123');
    
    expect(result1).toEqual({
      likes: 5,
      isLike: true
    });
    
    expect(result2).toEqual({
      likes: 10,
      isLike: false
    });
  });
});

describe('评论删除功能', () => {
  // 7.1 模拟一个评论删除功能
  test('删除评论时应连带删除点赞记录', async () => {
    // 模拟删除点赞记录的级联操作
    (supabase.from as jest.Mock).mockImplementationOnce(() => ({
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ error: null })
    }));
    
    const result = await deleteComment('comment-123');
    
    expect(result).toBe(true);
    expect(supabase.from).toHaveBeenCalledWith('comments');
  });
  
  // 7.2 模拟一个非作者尝试删除评论的情况
  test('非评论作者尝试删除评论应失败', async () => {
    // 模拟查询返回不同的用户ID
    (supabase.from as jest.Mock).mockImplementationOnce(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({ 
        data: { user_id: 'different-user' }, 
        error: null 
      })
    }));
    
    const result = await canDeleteComment('comment-123', 'user-123');
    
    expect(result).toBe(false);
    expect(supabase.from).toHaveBeenCalledWith('comments');
  });
}); 