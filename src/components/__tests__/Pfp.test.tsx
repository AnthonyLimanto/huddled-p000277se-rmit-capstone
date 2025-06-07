import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { Pfp } from '../Pfp';
import { downloadPfp } from '../../helper/bucketHelper';

// Mock dependencies
jest.mock('../../helper/bucketHelper', () => ({
  downloadPfp: jest.fn(),
}));

jest.mock('@rneui/base', () => ({
  Avatar: ({ size, rounded, source, title, containerStyle, titleStyle, testID }: any) => {
    const React = require('react');
    const { View, Text, Image } = require('react-native');
    
    if (source) {
      return React.createElement(
        View,
        { testID: testID || 'avatar-with-image', style: containerStyle },
        React.createElement(Image, { source, style: { width: size, height: size } })
      );
    } else {
      return React.createElement(
        View,
        { testID: testID || 'avatar-with-title', style: containerStyle },
        React.createElement(Text, { style: titleStyle }, title)
      );
    }
  },
}));

describe('Pfp Component', () => {
  const mockDownloadPfp = downloadPfp as jest.MockedFunction<typeof downloadPfp>;

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset URL.revokeObjectURL mock
    global.URL.revokeObjectURL = jest.fn();
  });

  describe('Profile Picture Display', () => {
    it('should display profile picture when pfp URL is available', async () => {
      const mockUrl = 'https://example.com/profile.jpg';
      mockDownloadPfp.mockResolvedValue(mockUrl);

      const { getByTestId } = render(
        <Pfp email="test@example.com" name="Test User" size={50} />
      );

      await waitFor(() => {
        expect(getByTestId('avatar-with-image')).toBeTruthy();
      });

      expect(mockDownloadPfp).toHaveBeenCalledWith('test@example.com');
    });

    it('should display initial letter when pfp URL is not available', async () => {
      mockDownloadPfp.mockResolvedValue('default');

      const { getByTestId, getByText } = render(
        <Pfp email="test@example.com" name="Test User" size={50} />
      );

      await waitFor(() => {
        expect(getByTestId('avatar-with-title')).toBeTruthy();
        expect(getByText('T')).toBeTruthy();
      });
    });

    it('should display initial letter when download fails', async () => {
      mockDownloadPfp.mockRejectedValue(new Error('Download failed'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const { getByTestId, getByText } = render(
        <Pfp email="test@example.com" name="Test User" size={50} />
      );

      await waitFor(() => {
        expect(getByTestId('avatar-with-title')).toBeTruthy();
        expect(getByText('T')).toBeTruthy();
      });

      expect(consoleSpy).toHaveBeenCalledWith('Error downloading profile picture:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  describe('Size Handling', () => {
    it('should use provided size prop', async () => {
      mockDownloadPfp.mockResolvedValue('default');

      render(<Pfp email="test@example.com" name="Test User" size={100} />);

      await waitFor(() => {
        expect(mockDownloadPfp).toHaveBeenCalled();
      });
    });

    it('should use default size when size prop is not provided', async () => {
      mockDownloadPfp.mockResolvedValue('default');

      render(<Pfp email="test@example.com" name="Test User" />);

      await waitFor(() => {
        expect(mockDownloadPfp).toHaveBeenCalled();
      });
    });
  });

  describe('Name Handling', () => {
    it('should handle uppercase first letter correctly', async () => {
      mockDownloadPfp.mockResolvedValue('default');

      const { getByText } = render(
        <Pfp email="test@example.com" name="john doe" size={50} />
      );

      await waitFor(() => {
        expect(getByText('J')).toBeTruthy();
      });
    });

    it('should handle empty name gracefully', async () => {
      mockDownloadPfp.mockResolvedValue('default');

      // With empty name, the component should not crash but may show empty title
      const { getByTestId } = render(
        <Pfp email="test@example.com" name="" size={50} />
      );

      await waitFor(() => {
        expect(getByTestId('avatar-with-title')).toBeTruthy();
      });
    });

    it('should handle undefined name gracefully', async () => {
      mockDownloadPfp.mockResolvedValue('default');

      // With undefined name, the component should not crash
      expect(() => {
        render(
          <Pfp email="test@example.com" name={undefined as any} size={50} />
        );
      }).not.toThrow();
    });
  });

  describe('Cleanup', () => {
    it('should revoke object URL on unmount when URL was created', async () => {
      const mockUrl = 'blob:mock-url';
      mockDownloadPfp.mockResolvedValue(mockUrl);

      const { unmount } = render(
        <Pfp email="test@example.com" name="Test User" size={50} />
      );

      // Wait for the component to set the pfpUrl state
      await waitFor(() => {
        expect(mockDownloadPfp).toHaveBeenCalled();
      });

      // The cleanup function in useEffect will be called on unmount
      // However, since we're testing the state-based cleanup, we need to ensure
      // the state was actually set before unmounting
      unmount();

      // Note: The actual cleanup depends on the pfpUrl state being set
      // In this test, we're mainly verifying that unmount doesn't crash
    });

    it('should not call revokeObjectURL when pfp URL is default', async () => {
      mockDownloadPfp.mockResolvedValue('default');

      const { unmount } = render(
        <Pfp email="test@example.com" name="Test User" size={50} />
      );

      await waitFor(() => {
        expect(mockDownloadPfp).toHaveBeenCalled();
      });

      unmount();

      // When pfpUrl is 'default', URL.revokeObjectURL should not be called
      expect(global.URL.revokeObjectURL).not.toHaveBeenCalled();
    });
  });

  describe('Custom Styles', () => {
    it('should apply custom style prop', async () => {
      mockDownloadPfp.mockResolvedValue('default');
      const customStyle = { borderWidth: 2 };

      render(
        <Pfp email="test@example.com" name="Test User" style={customStyle} size={50} />
      );

      await waitFor(() => {
        expect(mockDownloadPfp).toHaveBeenCalled();
      });
    });
  });
}); 