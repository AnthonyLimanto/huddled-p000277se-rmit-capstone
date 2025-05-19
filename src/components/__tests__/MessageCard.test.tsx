import React from 'react';
import { render, screen } from '@testing-library/react-native';
import MessageCard from '../MessageCard';
import { Message } from '../../model/message';

describe('MessageCard Component', () => {
  // Test data setup
  const ownMessage: Message = {
    id: '1',
    sender: 'Current User',
    content: 'Hello, this is my message!',
    isOwnMessage: true
  };

  const otherMessage: Message = {
    id: '2',
    sender: 'Alice',
    content: 'Hi there!',
    isOwnMessage: false
  };

  // 1. Normal rendering tests
  describe('Rendering Tests', () => {
    test('should render a message from another user', () => {
      render(<MessageCard message={otherMessage} />);
      
      // Check if content is displayed
      const messageText = screen.getByText('Hi there!');
      expect(messageText).toBeTruthy();
      
      // Check if sender name is displayed
      const senderName = screen.getByText('Alice');
      expect(senderName).toBeTruthy();
    });

    test('should render a message from the current user without sender name', () => {
      render(<MessageCard message={ownMessage} />);
      
      // Check if content is displayed
      const messageText = screen.getByText('Hello, this is my message!');
      expect(messageText).toBeTruthy();
      
      // Sender name should not be displayed for own messages
      const senderName = screen.queryByText('Current User');
      expect(senderName).toBeNull();
    });
  });

  // 2. Content display verification
  describe('Content Display Tests', () => {
    test('should display the message content correctly', () => {
      render(<MessageCard message={otherMessage} />);
      const messageText = screen.getByText('Hi there!');
      expect(messageText).toBeTruthy();
    });

    test('should display sender name with correct style for other users messages', () => {
      const { getByText } = render(<MessageCard message={otherMessage} />);
      const senderName = getByText('Alice');
      
      // Check if the sender name has the correct style
      expect(senderName.props.style).toMatchObject({
        fontSize: 12,
        fontWeight: 'bold',
        color: '#555',
        marginBottom: 5,
      });
    });
  });

  // 3. Style application tests
  describe('Style Application Tests', () => {
    test('should apply ownMessage style when isOwnMessage is true', () => {
      const { getByText } = render(<MessageCard message={ownMessage} />);
      const messageText = getByText('Hello, this is my message!');
      const messageContainer = messageText.parent;
      
      // Check if the container exists
      expect(messageContainer).not.toBeNull();
      
      // In React Native, the style prop can be an array of styles
      // Need to find the container (View) with the correct styles
      const containerView = messageText.parent?.parent;
      expect(containerView).not.toBeNull();
      
      // The parent View should have the messageContainer and ownMessage styles
      const containerStyle = containerView!.props.style;
      expect(Array.isArray(containerStyle)).toBe(true);
      
      // Check if one of the styles in the array matches ownMessage
      expect(containerStyle.some((style: any) => 
        style && style.alignSelf === 'flex-end' && 
        style.backgroundColor === '#F0F9FF'
      )).toBe(true);
    });

    test('should apply otherMessage style when isOwnMessage is false', () => {
      const { getByText } = render(<MessageCard message={otherMessage} />);
      const messageText = getByText('Hi there!');
      const messageContainer = messageText.parent;
      
      // Check if the container exists
      expect(messageContainer).not.toBeNull();
      
      // In React Native, the style prop can be an array of styles
      // Need to find the container (View) with the correct styles
      const containerView = messageText.parent?.parent;
      expect(containerView).not.toBeNull();
      
      // The parent View should have the messageContainer and otherMessage styles
      const containerStyle = containerView!.props.style;
      expect(Array.isArray(containerStyle)).toBe(true);
      
      // Check if one of the styles in the array matches otherMessage
      expect(containerStyle.some((style: any) => 
        style && style.alignSelf === 'flex-start' && 
        style.backgroundColor === '#F1F1F1'
      )).toBe(true);
    });
  });

  // 4. Conditional rendering tests
  describe('Conditional Rendering Tests', () => {
    test('should not render sender name for own messages', () => {
      render(<MessageCard message={ownMessage} />);
      
      // Verify that the sender name is not displayed
      const senderName = screen.queryByText('Current User');
      expect(senderName).toBeNull();
    });

    test('should render sender name for messages from others', () => {
      render(<MessageCard message={otherMessage} />);
      
      // Verify that the sender name is displayed
      const senderName = screen.getByText('Alice');
      expect(senderName).toBeTruthy();
    });
  });

  // 5. Boundary and error handling tests (optional)
  describe('Boundary and Error Handling Tests', () => {
    test('should handle empty message content', () => {
      const emptyContentMessage: Message = {
        ...otherMessage,
        content: ''
      };
      
      render(<MessageCard message={emptyContentMessage} />);
      
      // The component should still render without errors
      // and the structure should remain the same
      const senderName = screen.getByText('Alice');
      expect(senderName).toBeTruthy();
      
      // The component should still render even with empty content
      const containerView = senderName.parent?.parent;
      expect(containerView).not.toBeNull();
    });

    test('should handle message with undefined sender when isOwnMessage is false', () => {
      const undefinedSenderMessage: Message = {
        ...otherMessage,
        sender: undefined as unknown as string
      };
      
      // Should render without crashing
      expect(() => render(<MessageCard message={undefinedSenderMessage} />)).not.toThrow();
    });

    test('should handle message with only whitespace content', () => {
      const whitespaceContentMessage: Message = {
        ...otherMessage,
        content: '    '
      };
      
      render(<MessageCard message={whitespaceContentMessage} />);
      
      // Should still render the whitespace content
      const messageText = screen.getByText('    ');
      expect(messageText).toBeTruthy();
    });
  });
}); 