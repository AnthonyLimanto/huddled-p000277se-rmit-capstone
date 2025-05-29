import * as amplitude from '@amplitude/analytics-react-native';
import { AMPLITUDE_KEY } from './env';
amplitude.init(AMPLITUDE_KEY);

// Track an event
export const trackEvent = (eventName: string, eventProperties?: Record<string, any>) => {
    try {
      amplitude.track(eventName, eventProperties);
      console.log(`Event tracked: ${eventName}`, eventProperties);
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  };
  
  // Set user properties
  export const setUserProperties = (userId: string, userProperties: Record<string, any>) => {
    try {
      amplitude.setUserId(userId);
      const identify = new amplitude.Identify();
      Object.keys(userProperties).forEach((key) => {
        identify.set(key, userProperties[key]);
      });
      amplitude.identify(identify);
      console.log('User properties set:', userId, userProperties);
    } catch (error) {
      console.error('Error setting user properties:', error);
    }
  };