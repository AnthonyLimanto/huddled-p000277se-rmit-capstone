// 在文件顶部添加接口定义
interface GroupData {
  id: string;
  name?: string;
  created_at?: string;
}

interface MessageData {
  group_id: string;
  content: string;
  created_at: string;
}

interface MemberData {
  user_id: string;
  group_id: string;
  joined_at?: string;
  profile?: {
    username?: string;
    degree?: string;
    pfp_url?: string;
    email?: string;
  };
}

import {
  createGroup,
  addGroupMembers,
  fetchGroup,
  fetchGroups,
  fetchGroupMembers
} from '../group';
import { supabase } from '../supabase';

// Mock supabase
jest.mock('../supabase', () => {
  return {
    supabase: {
      from: jest.fn(),
      channel: jest.fn(),
      removeChannel: jest.fn()
    }
  };
});

describe('Group Management Module Tests', () => {
  // Clear all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createGroup', () => {
    test('create group success', async () => {
      // 1. Mock group creation success
      const mockGroupData: GroupData = { id: 'group123' };
      const mockMembersData: MemberData[] = [
        { group_id: 'group123', user_id: 'user1' },
        { group_id: 'group123', user_id: 'user2' }
      ];
      
      // 2. Mock supabase chain call - create group
      const mockSingle = jest.fn().mockResolvedValue({ 
        data: mockGroupData, 
        error: null 
      });
      const mockSelect = jest.fn().mockReturnValue({ single: mockSingle });
      const mockInsert = jest.fn().mockReturnValue({ select: mockSelect });
      
      // 3. Mock supabase chain call - add members
      const mockMembersInsert = jest.fn().mockResolvedValue({ 
        data: mockMembersData, 
        error: null 
      });
      
      // 4. Mock supabase chain call - different behaviors for from
      const mockFrom = jest.fn().mockImplementation((table) => {
        if (table === 'groups') {
          return { insert: mockInsert };
        }
        if (table === 'group_members') {
          return { insert: mockMembersInsert };
        }
        return {};
      });
      
      // Apply mock
      (supabase.from as jest.Mock).mockImplementation(mockFrom);
      
      // Call function
      const result = await createGroup('test group', ['user1', 'user2']);
      
      // Verify results
      expect(supabase.from).toHaveBeenCalledWith('groups');
      expect(mockInsert).toHaveBeenCalledWith([{ name: 'test group' }]);
      expect(result).toEqual({
        group: mockGroupData,
        members: mockMembersData
      });
    });
    
    test('create group failed', async () => {
      // Mock error response
      const mockError = new Error('create group failed');
      
      // Mock from behavior
      const mockSingle = jest.fn().mockRejectedValue(mockError);
      const mockSelect = jest.fn().mockReturnValue({ single: mockSingle });
      const mockInsert = jest.fn().mockReturnValue({ select: mockSelect });
      const mockFrom = jest.fn().mockReturnValue({ insert: mockInsert });
      
      // Apply mock
      (supabase.from as jest.Mock).mockImplementation(mockFrom);
      
      // Verify function throws error
      await expect(createGroup('test group', ['user1'])).rejects.toThrow('create group failed');
    });
    
    test('empty group name', async () => {
      // Mock success response, even if name is empty
      const mockGroupData: GroupData = { id: 'group123' };
      const mockMembersData: MemberData[] = [{ group_id: 'group123', user_id: 'user1' }];
      
      // Mock supabase chain call
      const mockSingle = jest.fn().mockResolvedValue({ 
        data: mockGroupData, 
        error: null 
      });
      const mockSelect = jest.fn().mockReturnValue({ single: mockSingle });
      const mockInsert = jest.fn().mockReturnValue({ select: mockSelect });
      
      const mockMembersInsert = jest.fn().mockResolvedValue({ 
        data: mockMembersData, 
        error: null 
      });
      
      const mockFrom = jest.fn().mockImplementation((table) => {
        if (table === 'groups') {
          return { insert: mockInsert };
        }
        if (table === 'group_members') {
          return { insert: mockMembersInsert };
        }
        return {};
      });
      
      (supabase.from as jest.Mock).mockImplementation(mockFrom);
      
      // Call function, using empty group nameon, using empty group nameon, using empty group name
      const result = await createGroup('', ['user1']);
      
      // Verify results
      expect(mockInsert).toHaveBeenCalledWith([{ name: '' }]);
      expect(result.group).toEqual(mockGroupData);
    });
  });

  describe('addGroupMembers', () => {
    test('add group members success', async () => {
      // Mock response
      const mockMembersData: MemberData[] = [
        { group_id: 'group123', user_id: 'user3' },
        { group_id: 'group123', user_id: 'user4' }
      ];
      
      // Mock insert call
      const mockInsert = jest.fn().mockResolvedValue({ 
        data: mockMembersData, 
        error: null 
      });
      const mockFrom = jest.fn().mockReturnValue({ insert: mockInsert });
      
      // Apply mock
      (supabase.from as jest.Mock).mockImplementation(mockFrom);
      
      // Call function
      const result = await addGroupMembers('group123', ['user3', 'user4']);
      
      // Verify results
      expect(supabase.from).toHaveBeenCalledWith('group_members');
      expect(mockInsert).toHaveBeenCalledWith(
        [
          { group_id: 'group123', user_id: 'user3' },
          { group_id: 'group123', user_id: 'user4' }
        ],
        { ignoreDuplicates: true }
      );
      expect(result).toEqual(mockMembersData);
    });
    
    test('add members failed', async () => {
      // Mock error
      const mockError = new Error('add members failed');
      
      // Mock insert call failure
      const mockInsert = jest.fn().mockRejectedValue(mockError);
      const mockFrom = jest.fn().mockReturnValue({ insert: mockInsert });
      
      // Apply mock
      (supabase.from as jest.Mock).mockImplementation(mockFrom);
      
      // Verify function throws error
      await expect(addGroupMembers('group123', ['user3'])).rejects.toThrow('add members failed');
    });
    
    test('empty user list', async () => {
      // Mock response
      const mockEmptyData: MemberData[] = [];
      
      // Mock insert call
      const mockInsert = jest.fn().mockResolvedValue({ 
        data: mockEmptyData, 
        error: null 
      });
      const mockFrom = jest.fn().mockReturnValue({ insert: mockInsert });
      
      // Apply mock
      (supabase.from as jest.Mock).mockImplementation(mockFrom);
      
      // Call function
      const result = await addGroupMembers('group123', []);
      
      // Verify results
      expect(mockInsert).toHaveBeenCalledWith([], { ignoreDuplicates: true });
      expect(result).toEqual(mockEmptyData);
    });
  });

  describe('fetchGroup', () => {
    test('fetch group info success', async () => {
      // Mock response data
      const mockGroupData: GroupData[] = [{
        id: 'group123',
        name: 'test group',
        created_at: '2023-05-01T12:00:00Z'
      }];
      
      // Mock select call
      const mockEq = jest.fn().mockResolvedValue({ 
        data: mockGroupData, 
        error: null 
      });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = jest.fn().mockReturnValue({ select: mockSelect });
      
      // Apply mock
      (supabase.from as jest.Mock).mockImplementation(mockFrom);
      
      // Call function
      const result = await fetchGroup('group123');
      
      // Verify results
      expect(supabase.from).toHaveBeenCalledWith('groups');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('id', 'group123');
      expect(result).toEqual(mockGroupData);
    });
    
    test('fetch non-existent group', async () => {
      // Mock empty response
      const mockEmptyData: GroupData[] = [];
      
      // Mock select call
      const mockEq = jest.fn().mockResolvedValue({ 
        data: mockEmptyData, 
        error: null 
      });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = jest.fn().mockReturnValue({ select: mockSelect });
      
      // Apply mock
      (supabase.from as jest.Mock).mockImplementation(mockFrom);
      
      // Call function
      const result = await fetchGroup('nonexistent');
      
      // Verify results
      expect(result).toEqual(mockEmptyData);
    });
    
    test('fetch group failed', async () => {
      // Mock error response
      const mockError = { message: 'fetch failed' };
      
      // Mock supabase response
      const mockEq = jest.fn().mockResolvedValue({ 
        data: null, 
        error: mockError 
      });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = jest.fn().mockReturnValue({ select: mockSelect });
      
      // Apply mock
      (supabase.from as jest.Mock).mockImplementation(mockFrom);
      
      // Call function - should not throw error
      const result = await fetchGroup('group123');
      
      // Verify results - this function does not throw error, only records error and returns null
      expect(result).toBeNull();
      // We cannot directly check if console.error is called, as it is not in our mock scope
    });
  });

  describe('fetchGroups', () => {
    test('fetch all groups of a user', async () => {
      // 1. Mock group data
      const mockGroupData = [
        { group: { id: 'group1', name: 'group1', created_at: '2023-01-01' } },
        { group: { id: 'group2', name: 'group2', created_at: '2023-01-02' } }
      ];
      
      // 2. Mock message data
      const mockMessageData: MessageData[] = [
        { group_id: 'group1', content: 'latest message1', created_at: '2023-02-01' },
        { group_id: 'group2', content: 'latest message2', created_at: '2023-02-02' }
      ];
      
      // 3. Mock group query
      const mockGroupOrder = jest.fn().mockResolvedValue({ 
        data: mockGroupData, 
        error: null 
      });
      const mockGroupEq = jest.fn().mockReturnValue({ order: mockGroupOrder });
      const mockGroupSelect = jest.fn().mockReturnValue({ eq: mockGroupEq });
      
      // 4. Mock message query
      const mockMessageOrder = jest.fn().mockResolvedValue({ 
        data: mockMessageData, 
        error: null 
      });
      const mockMessageIn = jest.fn().mockReturnValue({ order: mockMessageOrder });
      const mockMessageSelect = jest.fn().mockReturnValue({ in: mockMessageIn });
      
      // 5. Mock from returns different results based on table name
      const mockFrom = jest.fn().mockImplementation((table) => {
        if (table === 'group_members') {
          return { select: mockGroupSelect };
        }
        if (table === 'messages') {
          return { select: mockMessageSelect };
        }
        return {};
      });
      
      // Apply mock
      (supabase.from as jest.Mock).mockImplementation(mockFrom);
      
      // Call function
      const result = await fetchGroups('user123');
      
      // Verify results
      expect(supabase.from).toHaveBeenCalledWith('group_members');
      expect(supabase.from).toHaveBeenCalledWith('messages');
      expect(mockGroupSelect).toHaveBeenCalledWith('group:groups(id, name, created_at)');
      expect(mockGroupEq).toHaveBeenCalledWith('user_id', 'user123');
      
      // Verify results structure
      expect(result).toHaveLength(2);
      expect(result[0].group).toHaveProperty('id');
      expect(result[0].group).toHaveProperty('name');
      expect(result[0].group).toHaveProperty('createdAt');
      expect(result[0].message).toHaveProperty('content');
      expect(result[0].message).toHaveProperty('createdAt');
    });
    
    test('groups with no messages show null', async () => {
      // Mock group data
      const mockGroupData = [
        { group: { id: 'group1', name: 'group1', created_at: '2023-01-01' } }
      ];
      
      // Mock empty message data
      const mockMessageData: MessageData[] = [];
      
      // Mock group query
      const mockGroupOrder = jest.fn().mockResolvedValue({ 
        data: mockGroupData, 
        error: null 
      });
      const mockGroupEq = jest.fn().mockReturnValue({ order: mockGroupOrder });
      const mockGroupSelect = jest.fn().mockReturnValue({ eq: mockGroupEq });
      
      // Mock message query
      const mockMessageOrder = jest.fn().mockResolvedValue({ 
        data: mockMessageData, 
        error: null 
      });
      const mockMessageIn = jest.fn().mockReturnValue({ order: mockMessageOrder });
      const mockMessageSelect = jest.fn().mockReturnValue({ in: mockMessageIn });
      
      // Mock from
      const mockFrom = jest.fn().mockImplementation((table) => {
        if (table === 'group_members') {
          return { select: mockGroupSelect };
        }
        if (table === 'messages') {
          return { select: mockMessageSelect };
        }
        return {};
      });
      
      // Apply mock
      (supabase.from as jest.Mock).mockImplementation(mockFrom);
      
      // Call function
      const result = await fetchGroups('user123');
      
      // Verify results
      expect(result[0].message).toBeNull();
    });
    
    test('fetch failed', async () => {
      // Mock error
      const mockError = new Error('fetch failed');
      
      // Mock group query failure
      const mockGroupOrder = jest.fn().mockRejectedValue(mockError);
      const mockGroupEq = jest.fn().mockReturnValue({ order: mockGroupOrder });
      const mockGroupSelect = jest.fn().mockReturnValue({ eq: mockGroupEq });
      const mockFrom = jest.fn().mockReturnValue({ select: mockGroupSelect });
      
      // Apply mock
      (supabase.from as jest.Mock).mockImplementation(mockFrom);
      
      // Verify function throws error
      await expect(fetchGroups('user123')).rejects.toThrow('fetch failed');
    });
  });

  describe('fetchGroupMembers', () => {
    test('fetch group members success', async () => {
      // Mock member data
      const mockMembersData: MemberData[] = [
        { 
          user_id: 'user1', 
          group_id: 'group123', 
          joined_at: '2023-01-01',
          profile: {
            username: 'user1',
            degree: 'bachelor',
            pfp_url: 'https://example.com/avatar1.jpg',
            email: 'user1@example.com'
          } 
        },
        { 
          user_id: 'user2', 
          group_id: 'group123', 
          joined_at: '2023-01-02',
          profile: {
            username: 'user2',
            degree: 'master',
            pfp_url: 'https://example.com/avatar2.jpg',
            email: 'user2@example.com'
          } 
        }
      ];
      
      // Mock query
      const mockOrder = jest.fn().mockResolvedValue({ 
        data: mockMembersData, 
        error: null 
      });
      const mockEq = jest.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = jest.fn().mockReturnValue({ select: mockSelect });
      
      // Apply mock
      (supabase.from as jest.Mock).mockImplementation(mockFrom);
      
      // Call function
      const result = await fetchGroupMembers('group123');
      
      // Verify results
      expect(supabase.from).toHaveBeenCalledWith('group_members');
      expect(mockSelect).toHaveBeenCalledWith('user_id, group_id, joined_at, profile:users(username, degree, pfp_url, email)');
      expect(mockEq).toHaveBeenCalledWith('group_id', 'group123');
      expect(result).toEqual(mockMembersData);
    });
    
    test('empty group members', async () => {
      // Mock empty response
      const mockEmptyData: MemberData[] = [];
      
      // Mock query
      const mockOrder = jest.fn().mockResolvedValue({ 
        data: mockEmptyData, 
        error: null 
      });
      const mockEq = jest.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = jest.fn().mockReturnValue({ select: mockSelect });
      
      // Apply mock
      (supabase.from as jest.Mock).mockImplementation(mockFrom);
      
      // Call function
      const result = await fetchGroupMembers('emptyGroup');
      
      // Verify results
      expect(result).toEqual(mockEmptyData);
    });
    
    test('fetch members failed', async () => {
      // Mock error response
      const mockError = { message: 'fetch failed' };
      
      // Mock query
      const mockOrder = jest.fn().mockResolvedValue({ 
        data: null, 
        error: mockError 
      });
      const mockEq = jest.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = jest.fn().mockReturnValue({ select: mockSelect });
      
      // Apply mock
      (supabase.from as jest.Mock).mockImplementation(mockFrom);
      
      // Call function
      const result = await fetchGroupMembers('group123');
      
      // Verify results - note this function does not throw error, only records error and returns null
      expect(result).toBeNull();
    });
  });
}); 