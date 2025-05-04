// 导入要测试的函数
import { fetchCommentLikeInfo, addCommentLike, deleteCommentLike } from '../comment_likes';
import { supabase } from '../supabase';

// 测试前重置所有模拟
beforeEach(() => {
  jest.clearAllMocks();
  // 设置控制台错误的监听器，避免测试中显示太多错误日志
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

describe('fetchCommentLikeInfo 函数', () => {
  // 1.1 正常情况：点赞总数为 5，当前用户已点赞
  test('应返回正确的点赞数和用户已点赞状态', async () => {
    // 模拟第一次调用（获取点赞数）
    (supabase.from as jest.Mock).mockImplementationOnce(() => ({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ count: 5, error: null })
      })
    }));
    
    // 模拟第二次调用（获取用户点赞状态）
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
    
    const result = await fetchCommentLikeInfo('comment-123', 'user-123');
    
    expect(result).toEqual({
      likes: 5,
      isLike: true
    });
    
    expect(supabase.from).toHaveBeenCalledWith('comment_likes');
  });
  
  // 1.2 正常情况：点赞总数为 0，当前用户未点赞
  test('应返回正确的点赞数(0)和用户未点赞状态', async () => {
    // 模拟第一次调用（获取点赞数）
    (supabase.from as jest.Mock).mockImplementationOnce(() => ({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ count: 0, error: null })
      })
    }));
    
    // 模拟第二次调用（获取用户点赞状态）
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
    
    const result = await fetchCommentLikeInfo('comment-123', 'user-123');
    
    expect(result).toEqual({
      likes: 0,
      isLike: false
    });
    
    expect(supabase.from).toHaveBeenCalledWith('comment_likes');
  });
  
  // 1.3 异常情况：查询点赞数时报错
  test('查询点赞数失败时应返回默认值', async () => {
    // 模拟 count 查询错误
    (supabase.from as jest.Mock).mockImplementationOnce(() => ({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ count: null, error: new Error('数据库错误') })
      })
    }));
    
    const result = await fetchCommentLikeInfo('comment-123', 'user-123');
    
    expect(result).toEqual({
      likes: 0,
      isLike: false
    });
    expect(console.error).toHaveBeenCalled();
  });
  
  // 1.4 异常情况：查询用户点赞状态时报错
  test('查询用户点赞状态失败时应返回默认值', async () => {
    // 模拟第一次调用（获取点赞数）
    (supabase.from as jest.Mock).mockImplementationOnce(() => ({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ count: 5, error: null })
      })
    }));
    
    // 模拟用户点赞查询错误
    (supabase.from as jest.Mock).mockImplementationOnce(() => ({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({ 
              data: null, 
              error: new Error('用户点赞状态查询错误') 
            })
          })
        })
      })
    }));
    
    const result = await fetchCommentLikeInfo('comment-123', 'user-123');
    
    expect(result).toEqual({
      likes: 0,
      isLike: false
    });
    expect(console.error).toHaveBeenCalled();
  });
});

describe('addCommentLike 函数', () => {
  // 2.1 正常情况：插入点赞记录成功
  test('插入点赞记录成功时应返回 true', async () => {
    // 模拟插入操作成功
    (supabase.from as jest.Mock).mockImplementationOnce(() => ({
      insert: jest.fn().mockResolvedValue({ data: {}, error: null })
    }));
    
    const result = await addCommentLike('comment-123', 'user-123');
    
    expect(result).toBe(true);
    expect(supabase.from).toHaveBeenCalledWith('comment_likes');
  });
  
  // 2.2 异常情况：插入点赞记录失败
  test('插入点赞记录失败时应返回 false', async () => {
    // 模拟插入操作失败
    (supabase.from as jest.Mock).mockImplementationOnce(() => ({
      insert: jest.fn().mockResolvedValue({ 
        data: null, 
        error: new Error('插入点赞记录失败') 
      })
    }));
    
    const result = await addCommentLike('comment-123', 'user-123');
    
    expect(result).toBe(false);
    expect(console.error).toHaveBeenCalled();
  });
});

describe('deleteCommentLike 函数', () => {
  // 3.1 正常情况：删除点赞记录成功
  test('删除点赞记录成功时应返回 true', async () => {
    // 模拟删除操作成功
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
  
  // 3.2 异常情况：删除点赞记录失败
  test('删除点赞记录失败时应返回 false', async () => {
    // 模拟删除操作失败
    (supabase.from as jest.Mock).mockImplementationOnce(() => ({
      delete: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: new Error('删除点赞记录失败') })
        })
      })
    }));
    
    const result = await deleteCommentLike('comment-123', 'user-123');
    
    expect(result).toBe(false);
    expect(console.error).toHaveBeenCalled();
  });
}); 