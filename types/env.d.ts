declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EXPO_PUBLIC_API_URL: 'exp://172.20.10.2:8081'; 
      EXPO_PUBLIC_RAZORPAY_KEY_ID: string;
      // Add other environment variables here
    }
  }
}

// Ensure this file is treated as a module
export {};