import { z } from 'zod';

export const transactionSchema = z.object({
  userId: z.string(),
  songId: z.string(),
  amount: z.number().positive(),
  status: z.enum(['completed', 'pending', 'failed']),
  paymentDetails: z.object({
    paymentIntentId: z.string(),
    paymentMethodId: z.string(),
    paymentMethodType: z.string(),
    last4: z.string(),
    cardBrand: z.string().optional(),
  }),
  metadata: z.object({
    songTitle: z.string(),
    songArtist: z.string(),
    userEmail: z.string(),
    userName: z.string(),
    purchaseType: z.enum(['premium', 'standard']),
    platform: z.string(),
    deviceInfo: z.string(),
    ipAddress: z.string().optional().nullable(),
  }).transform(data => ({
    ...data,
    ipAddress: data.ipAddress || null
  })),
  refundStatus: z.enum(['none', 'pending', 'completed']).default('none'),
  refundReason: z.string().optional(),
  refundedAt: z.date().optional(),
});

export type TransactionData = z.infer<typeof transactionSchema>;