import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { transactionSchema } from './validation';
import { mockPaymentProcessor } from './mockProcessor';
import type { PaymentMethod } from './types';
import { getDeviceInfo } from '@/lib/utils/device';
import type { Song } from '@/types';

export class PaymentService {
  static async processPayment(
    song: Song,
    user: { id: string; email: string; name: string },
    paymentMethod: PaymentMethod
  ) {
    try {
      // Create payment intent
      const paymentIntent = await mockPaymentProcessor.createPaymentIntent(song.price);

      // Process the payment
      const result = await mockPaymentProcessor.processPayment(paymentIntent, paymentMethod);

      if (result.status !== 'succeeded') {
        throw new Error('Payment processing failed');
      }

      // Get device info
      const deviceInfo = getDeviceInfo();

      // Prepare transaction data with all required fields
      const transactionData = {
        userId: user.id,
        songId: song.id,
        amount: song.price,
        status: 'completed' as const,
        paymentDetails: {
          paymentIntentId: result.id,
          paymentMethodId: paymentMethod.id,
          paymentMethodType: paymentMethod.type,
          last4: paymentMethod.card.last4,
          cardBrand: paymentMethod.card.brand,
        },
        metadata: {
          songTitle: song.title,
          songArtist: song.artist,
          userEmail: user.email,
          userName: user.name,
          purchaseType: song.isPremium ? 'premium' : 'standard',
          platform: deviceInfo.platform,
          deviceInfo: deviceInfo.userAgent,
          ipAddress: null,
        },
        createdAt: new Date(),
        refundStatus: 'none' as const,
      };

      // Validate transaction data
      const validatedData = transactionSchema.parse(transactionData);

      // Save transaction to Firestore
      const transactionRef = await addDoc(collection(db, 'transactions'), {
        ...validatedData,
        createdAt: serverTimestamp(),
      });

      return {
        transactionId: transactionRef.id,
        paymentIntentId: result.id,
      };
    } catch (error: any) {
      console.error('Payment processing error:', error);
      
      // Throw a standardized error
      throw {
        code: error.code || 'payment_failed',
        message: error.message || 'Payment processing failed. Please try again.',
      };
    }
  }
}