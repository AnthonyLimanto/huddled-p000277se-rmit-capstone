import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import HomeScreen from '../index';
import { fetchPosts } from '../../../api/posts';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text } from 'react-native';

// No longer need these mocks, as they have been moved to jest.setup.js
// Mocks have been integrated into the global jest.setup.js

describe('HomeScreen Component', () => {
  const mockPosts = [
    { id: '1', title: 'Post 1', content: 'Content 1', author: { name: 'User 1' } },
    { id: '2', title: 'Post 2', content: 'Content 2', author: { name: 'User 2' } },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (fetchPosts as jest.Mock).mockResolvedValue(mockPosts);
  });

  // Component rendering tests
  describe('Component Rendering', () => {
    it('should render the basic structure correctly', async () => {
      const { getByTestId } = render(<HomeScreen />);
      
      // Header should be rendered
      expect(getByTestId('mock-header')).toBeTruthy();
      
      // New posts button should be rendered
      expect(getByTestId('new-posts-button')).toBeTruthy();
      
      // Wait for initial loading to complete
      await waitFor(() => {
        // FlatList container should be rendered
        expect(getByTestId('posts-flatlist')).toBeTruthy();
      });
    });
    
    it('should display loading indicator initially', async () => {
      const { getByTestId, queryByTestId } = render(<HomeScreen />);
      
      // Initial loading indicator should be visible
      expect(getByTestId('initial-loading')).toBeTruthy();
      
      // After data is loaded, it should disappear
      await waitFor(() => {
        expect(queryByTestId('initial-loading')).toBeNull();
      });
    });
  });

  // State management tests
  describe('State Management', () => {
    it('should initialize with correct state', () => {
      // We'll need to expose state for testing
      // This is typically done via data-testid attributes
      const { getByTestId } = render(<HomeScreen />);
      
      // Check initial state through UI representation
      expect(getByTestId('page-indicator').props.children).toBe(1);
      expect(getByTestId('has-more-indicator').props.children).toBe('true');
    });
    
    it('should update state after loading posts', async () => {
      const { queryAllByTestId } = render(<HomeScreen />);
      
      await waitFor(() => {
        // Should have two posts rendered
        const postElements = queryAllByTestId(/^post-/);
        expect(postElements.length).toBe(2);
      });
    });
  });

  // Data fetching tests
  describe('Data Fetching', () => {
    it('should call loadPosts on component mount', async () => {
      render(<HomeScreen />);
      
      // fetchPosts should be called with default page 1
      expect(fetchPosts).toHaveBeenCalledWith(1);
    });
    
    it('should refetch posts on screen focus', () => {
        render(<HomeScreen />);
       
        // useFocusEffect should have been called
        expect(useFocusEffect).toHaveBeenCalled();
       
        // Get callback before clearing mocks
        const callback = (useFocusEffect as jest.Mock).mock.calls[0][0];
       
        // Clear mocks and test again
        jest.clearAllMocks();
        
        act(() => {
          callback();
        });
       
        // fetchPosts should be called again
        expect(fetchPosts).toHaveBeenCalledWith(1);  
    });
    
    it('should handle API call failures gracefully', async () => {
      // Mock a failure
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      (fetchPosts as jest.Mock).mockRejectedValue(new Error('Network error'));
      
      const { getByTestId } = render(<HomeScreen />);
      
      await waitFor(() => {
        // Should show empty state or error state
        expect(getByTestId('empty-posts-message')).toBeTruthy();
        // Console error should have been called
        expect(consoleErrorSpy).toHaveBeenCalled();
      });
      
      consoleErrorSpy.mockRestore();
    });
  });

  // Pagination tests
  describe('Pagination', () => {
    it('should call handleLoadMore when reaching the end of the list', async () => {
      const { getByTestId } = render(<HomeScreen />);
      
      await waitFor(() => {
        const flatList = getByTestId('posts-flatlist');
        
        // Simulate reaching the end of the list
        fireEvent(flatList, 'onEndReached');
        
        // fetchPosts should be called with page 2
        expect(fetchPosts).toHaveBeenCalledWith(2);
      });
    });
    
    it('should increment page number after loading more posts', async () => {
      const { getByTestId } = render(<HomeScreen />);
      
      await waitFor(() => {
        const flatList = getByTestId('posts-flatlist');
        fireEvent(flatList, 'onEndReached');
      });
      
      await waitFor(() => {
        // Page indicator should show 2
        expect(getByTestId('page-indicator').props.children).toBe(2);
      });
    });
    
    it('should stop pagination when no more posts are available', async () => {
      // Mock empty response for next page
      (fetchPosts as jest.Mock).mockImplementation((page) => {
        if (page === 1) return mockPosts;
        return []; // Empty array for page 2+
      });
      
      const { getByTestId } = render(<HomeScreen />);
      
      await waitFor(() => {
        const flatList = getByTestId('posts-flatlist');
        fireEvent(flatList, 'onEndReached');
      });
      
      await waitFor(() => {
        // hasMore should be false
        expect(getByTestId('has-more-indicator').props.children).toBe('false');
      });
      
      // Clear previous calls
      jest.clearAllMocks();
      
      // Try to load more again
      await waitFor(() => {
        const flatList = getByTestId('posts-flatlist');
        fireEvent(flatList, 'onEndReached');
      });
      
      // fetchPosts should not be called again
      expect(fetchPosts).not.toHaveBeenCalled();
    });
  });

  // FlatList configuration tests
  describe('FlatList Configuration', () => {
    it('should render posts correctly using renderItem', async () => {
      const { queryAllByTestId } = render(<HomeScreen />);
      
      await waitFor(() => {
        // Check if all posts are rendered
        const postElements = queryAllByTestId(/^post-/);
        expect(postElements.length).toBe(mockPosts.length);
        
        // Check if each post has correct data
        mockPosts.forEach(post => {
          const postElement = queryAllByTestId(`post-${post.id}`)[0];
          expect(postElement).toBeTruthy();
          expect(JSON.parse(postElement.props['data-post'])).toEqual(post);
        });
      });
    });
    
    it('should use correct keyExtractor for list items', async () => {
      const { getByTestId } = render(<HomeScreen />);
      
      await waitFor(() => {
        const flatList = getByTestId('posts-flatlist');
        expect(flatList.props.keyExtractor({ id: '123' })).toBe('123');
      });
    });
  });

  // Component interaction tests
  describe('Component Interactions', () => {
    it('should show loading indicator when loading more posts', async () => {
      // Make fetchPosts delay a bit to show loading indicator
      (fetchPosts as jest.Mock).mockImplementation(() => {
        return new Promise(resolve => {
          setTimeout(() => resolve(mockPosts), 100);
        });
      });
      
      const { getByTestId, queryByTestId } = render(<HomeScreen />);
      
      await waitFor(() => {
        const flatList = getByTestId('posts-flatlist');
        fireEvent(flatList, 'onEndReached');
      });
      
      // Loading indicator should be visible
      expect(getByTestId('loading-more-indicator')).toBeTruthy();
      
      // After loading completes, it should disappear
      await waitFor(() => {
        expect(queryByTestId('loading-more-indicator')).toBeNull();
      }, { timeout: 200 });
    });
    
    it('should trigger handleLoadMore when scrolling to end of list', async () => {
      const { getByTestId } = render(<HomeScreen />);
      
      // Wait for initial load
      await waitFor(() => {
        const flatList = getByTestId('posts-flatlist');
        
        // Simulate scrolling to bottom (75% visible)
        fireEvent(flatList, 'onEndReached');
        
        // fetchPosts should be called with page 2
        expect(fetchPosts).toHaveBeenCalledWith(2);
      });
    });
  });
}); 