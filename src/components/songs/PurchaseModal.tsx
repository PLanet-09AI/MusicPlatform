import React, { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import type { Song } from '@/types';
import type { PaymentMethod } from '@/lib/payments/types';
import { PaymentService } from '@/lib/payments/service';
import PaymentForm from '@/components/payments/PaymentForm';
import { formatPrice } from '@/lib/utils';

interface PurchaseModalProps {
  song: Song;
  onClose: () => void;
  onSuccess?: () => void;
}

const PurchaseModal: React.FC<PurchaseModalProps> = ({ song, onClose, onSuccess }) => {
  const { user } = useAuthStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const handlePayment = async (paymentMethod: PaymentMethod) => {
    if (!user) return;
    
    setIsProcessing(true);
    setError('');

    try {
      await PaymentService.processPayment(
        song,
        {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        paymentMethod
      );

      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Error processing payment:', error);
      setError(error.message || 'Failed to process payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-primary-black/90 p-6 rounded-lg max-w-md w-full mx-4">
        <div className="flex items-center gap-4 mb-6">
          <img
            src={song.coverUrl}
            alt={song.title}
            className="w-16 h-16 rounded-md object-cover"
          />
          <div>
            <h2 className="text-xl font-bold">{song.title}</h2>
            <p className="text-primary-gray">{song.artist}</p>
          </div>
        </div>

        <PaymentForm
          amount={song.price}
          onSubmit={handlePayment}
          onCancel={onClose}
          isProcessing={isProcessing}
          error={error}
        />

        <div className="mt-6 text-sm text-primary-gray text-center">
          <p>This is a simulation. Use these test card numbers:</p>
          <ul className="mt-2 space-y-1">
            <li>Success: 4242 4242 4242 4242</li>
            <li>Expired: 4000 0000 0000 0069</li>
            <li>Declined: 4000 0000 0000 0002</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PurchaseModal;