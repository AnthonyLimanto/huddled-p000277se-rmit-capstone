# Huddled - Social Platform for Students

Welcome to **Huddled**, a React Native application built using Expo. This app provides features such as group chats, post feed, real-time updates, and analytics tracking. It is powered by Supabase for backend services and Amplitude for analytics.

---

## **Features**

- **Authentication**: Secure user authentication using Supabase.
- **Post Feed**: Global post feed, with likes and comments.
- **Group Chats**: Create and join group chats with real-time messaging.
- **Analytics**: Track user behavior using Amplitude.
- **File-Based Routing**: Organized navigation using Expo Router.

---

## **Getting Started**

Follow these steps to set up and run the project locally:

### **1. Install Dependencies**
Run the following command to install all required dependencies:

```
npm install
```

---

### **2. Configure Environment Variables**
In env.ts file and add the following keys:

```env
SUPABASE_URL=https://your-supabase-url.supabase.co
SUPABASE_KEY=your-supabase-key
AMPLITUDE_KEY=your-amplitude-key
```

At the moment existing credential already exist, please feel free to ustilse these.

---

### **3. Start the App**
Run the following command to start the development server:

```
npm run start
```

You can open the app in:
- **Web Build**: For quick testing on your PC
- **Android Emulator**: Using Android Studio.
- **iOS Simulator**: Using Xcode.

---

## **Project Structure**

### **Key Directories**
- **`src/api`**: Contains API functions for interacting with Supabase.
- **`src/app`**: Contains screens and components organized by feature.
- **`src/components`**: Reusable UI components.
- **`src/context`**: Context API for global state management.

### **Key Files**
- **`src/api/supabase.ts`**: Initializes Supabase client.
- **`src/api/amplitude.ts`**: Configures Amplitude analytics.
- **`src/app/_layout.tsx`**: Defines the app's navigation structure.

---

## **Technologies Used**

- **Frontend**: React Native with Expo.
- **Backend**: Supabase for database and authentication.
- **Analytics**: Amplitude for tracking user behavior.
- **Navigation**: Expo Router for file-based routing.
- **Styling**: React Native's `StyleSheet`.
