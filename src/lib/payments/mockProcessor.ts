import { PaymentIntent, PaymentMethod, PaymentError } from './types';

// Simulate payment processing delays
const PROCESSING_TIME = 1500;

// Test card numbers for different scenarios
const TEST_CARDS = {
  success: '4242424242424242',
  expired: '4000000000000069',
  declined: '4000000000000002',
  insufficient: '4000000000009995',
};

// Mock validation for card details
const validateCard = (card: PaymentMethod['card']): PaymentError | null => {
  const currentYear = new Date().getFullYear() % 100;
  const currentMonth = new Date().getMonth() + 1;

  // Check for expired card
  if (card.expiryYear < currentYear || 
      (card.expiryYear === currentYear && card.expiryMonth < currentMonth)) {
    return {
      code: 'card_expired',
      message: 'Your card has expired. Please use a valid card.'
    };
  }

  // Check for test card scenarios
  const cardNumber = card.last4.padStart(16, '4');
  
  if (cardNumber === TEST_CARDS.expired) {
    return {
      code: 'card_expired',
      message: 'Your card has expired. Please use a valid card.'
    };
  }

  if (cardNumber === TEST_CARDS.declined) {
    return {
      code: 'card_declined',
      message: 'Your card was declined. Please try a different card.'
    };
  }

  if (cardNumber === TEST_CARDS.insufficient) {
    return {
      code: 'insufficient_funds',
      message: 'Insufficient funds. Please try a different card.'
    };
  }

  return null;
};

export const mockPaymentProcessor = {
  async createPaymentIntent(amount: number): Promise<PaymentIntent> {
    if (amount <= 0) {
      throw {
        code: 'invalid_amount',
        message: 'Payment amount must be greater than 0'
      };
    }

    const id = `pi_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      id,
      amount,
      currency: 'USD',
      status: 'pending',
      createdAt: new Date()
    };
  },

  async processPayment(
    paymentIntent: PaymentIntent,
    paymentMethod: PaymentMethod
  ): Promise<PaymentIntent> {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, PROCESSING_TIME));

      // Validate card
      const error = validateCard(paymentMethod.card);
      if (error) {
        throw error;
      }

      // Validate payment intent
      if (paymentIntent.status === 'succeeded') {
        throw {
          code: 'payment_intent_invalid',
          message: 'This payment has already been processed'
        };
      }

      // Process the payment
      return {
        ...paymentIntent,
        status: 'succeeded'
      };
    } catch (error: any) {
      // Ensure consistent error format
      throw {
        code: error.code || 'payment_failed',
        message: error.message || 'Payment processing failed. Please try again.'
      };
    }
  }
};