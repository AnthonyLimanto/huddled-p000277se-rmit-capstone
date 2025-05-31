import { trackEvent, setUserProperties } from '../amplitude';
import * as amplitude from '@amplitude/analytics-react-native';

// Mock the amplitude module
jest.mock('@amplitude/analytics-react-native', () => ({
  init: jest.fn(),
  track: jest.fn(),
  setUserId: jest.fn(),
  Identify: jest.fn().mockImplementation(() => ({
    set: jest.fn().mockReturnThis(),
  })),
  identify: jest.fn(),
}));

describe('Amplitude Analytics Module Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('trackEvent', () => {
    test('successfully track event with properties', () => {
      const eventName = 'Sign Up';
      const eventProperties = {
        username: 'testuser',
        email: 'test@example.com',
        degree: 'Computer Science',
        hasProfilePicture: true,
      };

      trackEvent(eventName, eventProperties);

      expect(amplitude.track).toHaveBeenCalledWith(eventName, eventProperties);
      expect(amplitude.track).toHaveBeenCalledTimes(1);
    });

    test('successfully track event without properties', () => {
      const eventName = 'App Opened';

      trackEvent(eventName);

      expect(amplitude.track).toHaveBeenCalledWith(eventName, undefined);
      expect(amplitude.track).toHaveBeenCalledTimes(1);
    });

    test('handle tracking error gracefully', () => {
      const eventName = 'Test Event';
      const trackError = new Error('Network error');
      
      (amplitude.track as jest.Mock).mockImplementationOnce(() => {
        throw trackError;
      });

      // Should not throw error
      expect(() => trackEvent(eventName)).not.toThrow();
    });

    test('track event with empty string name', () => {
      const eventName = '';
      const eventProperties = { test: 'value' };

      trackEvent(eventName, eventProperties);

      expect(amplitude.track).toHaveBeenCalledWith(eventName, eventProperties);
    });

    test('track event with special characters in properties', () => {
      const eventName = 'Special Event';
      const eventProperties = {
        'special-key': 'value with spaces',
        'unicode': 'TestData',
        'number': 123,
        'boolean': false,
        'null': null,
      };

      trackEvent(eventName, eventProperties);

      expect(amplitude.track).toHaveBeenCalledWith(eventName, eventProperties);
    });
  });

  describe('setUserProperties', () => {
    test('successfully set user properties', () => {
      const userId = 'user123';
      const userProperties = {
        username: 'testuser',
        degree: 'Computer Science',
        email: 'test@example.com',
      };

      const mockIdentify = {
        set: jest.fn().mockReturnThis(),
      };
      (amplitude.Identify as jest.Mock).mockReturnValue(mockIdentify);

      setUserProperties(userId, userProperties);

      expect(amplitude.setUserId).toHaveBeenCalledWith(userId);
      expect(amplitude.Identify).toHaveBeenCalled();
      expect(mockIdentify.set).toHaveBeenCalledWith('username', 'testuser');
      expect(mockIdentify.set).toHaveBeenCalledWith('degree', 'Computer Science');
      expect(mockIdentify.set).toHaveBeenCalledWith('email', 'test@example.com');
      expect(amplitude.identify).toHaveBeenCalledWith(mockIdentify);
    });

    test('handle empty user properties', () => {
      const userId = 'user123';
      const userProperties = {};

      const mockIdentify = {
        set: jest.fn().mockReturnThis(),
      };
      (amplitude.Identify as jest.Mock).mockReturnValue(mockIdentify);

      setUserProperties(userId, userProperties);

      expect(amplitude.setUserId).toHaveBeenCalledWith(userId);
      expect(amplitude.Identify).toHaveBeenCalled();
      expect(mockIdentify.set).not.toHaveBeenCalled();
      expect(amplitude.identify).toHaveBeenCalledWith(mockIdentify);
    });

    test('handle setUserId error gracefully', () => {
      const userId = 'user123';
      const userProperties = { username: 'test' };
      const setUserIdError = new Error('SetUserId failed');

      (amplitude.setUserId as jest.Mock).mockImplementationOnce(() => {
        throw setUserIdError;
      });

      // Should not throw error
      expect(() => setUserProperties(userId, userProperties)).not.toThrow();
    });

    test('handle identify error gracefully', () => {
      const userId = 'user123';
      const userProperties = { username: 'test' };
      const identifyError = new Error('Identify failed');

      const mockIdentify = {
        set: jest.fn().mockReturnThis(),
      };
      (amplitude.Identify as jest.Mock).mockReturnValue(mockIdentify);
      (amplitude.identify as jest.Mock).mockImplementationOnce(() => {
        throw identifyError;
      });

      // Should not throw error
      expect(() => setUserProperties(userId, userProperties)).not.toThrow();
    });

    test('handle special characters in user properties', () => {
      const userId = 'user-123';
      const userProperties: Record<string, any> = {
        'special-key': 'value with spaces',
        'unicode-name': 'James',
        'number-value': 42,
        'boolean-flag': true,
      };

      const mockIdentify = {
        set: jest.fn().mockReturnThis(),
      };
      (amplitude.Identify as jest.Mock).mockReturnValue(mockIdentify);

      setUserProperties(userId, userProperties);

      expect(amplitude.setUserId).toHaveBeenCalledWith(userId);
      Object.keys(userProperties).forEach(key => {
        expect(mockIdentify.set).toHaveBeenCalledWith(key, userProperties[key]);
      });
    });

    test('handle null and undefined values in properties', () => {
      const userId = 'user123';
      const userProperties: Record<string, any> = {
        nullValue: null,
        undefinedValue: undefined,
        emptyString: '',
        zeroNumber: 0,
        falseBool: false,
      };

      const mockIdentify = {
        set: jest.fn().mockReturnThis(),
      };
      (amplitude.Identify as jest.Mock).mockReturnValue(mockIdentify);

      setUserProperties(userId, userProperties);

      Object.keys(userProperties).forEach(key => {
        expect(mockIdentify.set).toHaveBeenCalledWith(key, userProperties[key]);
      });
    });
  });
}); 