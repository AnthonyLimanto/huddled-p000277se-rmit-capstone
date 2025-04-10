import React from 'react';
import { render } from '@testing-library/react-native';
import { View } from 'react-native';
import TabLayout from '../_layout';

describe('TabLayout Navigation Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all 5 bottom navigation tabs', () => {
    const { getByTestId } = render(<TabLayout />);

    // Verify that all navigation icons are rendered
    expect(getByTestId('home-icon')).toBeTruthy();
    expect(getByTestId('search-icon')).toBeTruthy();
    expect(getByTestId('create-icon')).toBeTruthy();
    expect(getByTestId('messages-icon')).toBeTruthy();
    expect(getByTestId('profile-icon')).toBeTruthy();
  });

  it('each navigation option should have the correct title and accessibility label', () => {
    const result = render(<TabLayout />);
    
    // Get all Tabs.Screen elements from the rendering result
    const screens = result.UNSAFE_getAllByType(View).filter(node => 
      node.props.testID && node.props.testID.startsWith('screen-')
    );
    
    // Verify home tab options
    const homeTab = screens.find(node => node.props.testID === 'screen-index');
    expect(homeTab).toBeTruthy();
    expect(homeTab?.props.title).toBe('Home');
    expect(homeTab?.props.accessibilityLabel).toBe('Home Tab');

    // Verify search tab options
    const searchTab = screens.find(node => node.props.testID === 'screen-search');
    expect(searchTab).toBeTruthy();
    expect(searchTab?.props.title).toBe('Search');
    expect(searchTab?.props.accessibilityLabel).toBe('Search Tab');

    // Verify create post tab options
    const createTab = screens.find(node => node.props.testID === 'screen-create');
    expect(createTab).toBeTruthy();
    expect(createTab?.props.title).toBe('Post');
    expect(createTab?.props.accessibilityLabel).toBe('Create Post Tab');

    // Verify messages tab options
    const messagesTab = screens.find(node => node.props.testID === 'screen-messages');
    expect(messagesTab).toBeTruthy();
    expect(messagesTab?.props.title).toBe('Messages');
    expect(messagesTab?.props.accessibilityLabel).toBe('Messages Tab');

    // Verify profile tab options
    const profileTab = screens.find(node => node.props.testID === 'screen-profile');
    expect(profileTab).toBeTruthy();
    expect(profileTab?.props.title).toBe('Profile');
    expect(profileTab?.props.accessibilityLabel).toBe('Profile Tab');
  });

  it('should have the correct navigation structure', () => {
    // Test the basic rendering of the navigation component
    const result = render(<TabLayout />);
    
    // Get all Tabs.Screen elements from the rendering result
    const screens = result.UNSAFE_getAllByType(View).filter(node => 
      node.props.testID && node.props.testID.startsWith('screen-')
    );
    
    // Verify that there is the correct number of navigation tabs
    expect(screens.length).toBe(5);
    
    // Verify the tab names and order
    const tabNames = screens.map(node => node.props.testID.replace('screen-', ''));
    expect(tabNames).toEqual(['index', 'search', 'create', 'messages', 'profile']);
    
    // Verify that all icons are correctly rendered
    const icons = result.UNSAFE_getAllByType(View).filter(node => 
      node.props.testID && (
        node.props.testID === 'home-icon' || 
        node.props.testID === 'search-icon' || 
        node.props.testID === 'create-icon' || 
        node.props.testID === 'messages-icon' || 
        node.props.testID === 'profile-icon'
      )
    );
    expect(icons.length).toBe(5);
  });
}); 