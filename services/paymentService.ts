// Mock Razorpay service

interface OrderResponse {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
}

interface PaymentVerifyResponse {
  success: boolean;
  paymentId: string;
  orderId: string;
  signature: string;
}

// Create a new Razorpay order
export const createOrder = async (amount: number, receipt: string): Promise<OrderResponse> => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      // In a real app, this would call the Razorpay API to create an order
      resolve({
        id: 'order_' + Math.random().toString(36).substring(2, 15),
        amount,
        currency: 'INR',
        receipt,
        status: 'created',
      });
    }, 500);
  });
};

// Verify payment
export const verifyPayment = async (paymentId: string, orderId: string, signature: string): Promise<PaymentVerifyResponse> => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      // In a real app, this would verify the payment signature with Razorpay
      resolve({
        success: true,
        paymentId,
        orderId,
        signature,
      });
    }, 500);
  });
};