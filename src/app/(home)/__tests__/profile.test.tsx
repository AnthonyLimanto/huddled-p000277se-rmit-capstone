import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import ProfileScreen from '../profile';

// The useRouter mock is now in jest.setup.js, so we don't need to define it here

describe('ProfileScreen Component', () => {
  // Setup mock replace function to test navigation
  let mockReplace: jest.Mock;
  
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Setup router mock with replace method
    mockReplace = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      replace: mockReplace
    });
  });
  
  describe('Navigation Tests', () => {
    it('should navigate to signin page when Log Out button is clicked', () => {
      // Render the component
      const { getByText } = render(<ProfileScreen />);
      
      // Find the Log Out button by its text content
      const logoutButton = getByText('Log Out');
      
      // Simulate a press on the Log Out button
      fireEvent.press(logoutButton);
      
      // Verify that router.replace was called
      expect(mockReplace).toHaveBeenCalled();
      
      // Verify that router.replace was called with the correct path
      expect(mockReplace).toHaveBeenCalledWith('../(auth)/signin');
    });
    
    it('should call handleLogin method with correct parameters', () => {
      // Render the component
      const { getByText } = render(<ProfileScreen />);
      
      // Find the Log Out button
      const logoutButton = getByText('Log Out');
      
      // Simulate a press on the Log Out button
      fireEvent.press(logoutButton);
      
      // Verify router.replace was called exactly once
      expect(mockReplace).toHaveBeenCalledTimes(1);
      
      // Verify the exact path parameter
      expect(mockReplace).toHaveBeenCalledWith('../(auth)/signin');
    });
  });
}); 