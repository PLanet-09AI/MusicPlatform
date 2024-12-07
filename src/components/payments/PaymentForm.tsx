import React, { useState } from 'react';
import { CreditCard, Calendar, Lock } from 'lucide-react';
import Button from '@/components/ui/Button';
import { PaymentMethod } from '@/lib/payments/types';

interface PaymentFormProps {
  amount: number;
  onSubmit: (paymentMethod: PaymentMethod) => Promise<void>;
  onCancel: () => void;
  isProcessing: boolean;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  amount,
  onSubmit,
  onCancel,
  isProcessing
}) => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvc, setCvc] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!cardNumber || !expiryMonth || !expiryYear || !cvc) {
      setError('Please fill in all fields');
      return;
    }

    const paymentMethod: PaymentMethod = {
      id: `pm_${Math.random().toString(36).substr(2, 9)}`,
      type: 'card',
      card: {
        brand: 'visa',
        last4: cardNumber.slice(-4),
        expiryMonth: parseInt(expiryMonth),
        expiryYear: parseInt(expiryYear)
      }
    };

    try {
      await onSubmit(paymentMethod);
    } catch (err: any) {
      setError(err.message || 'Payment failed. Please try again.');
    }
  };

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, '');
    const groups = digits.match(/.{1,4}/g) || [];
    return groups.join(' ').substr(0, 19);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="cardNumber" className="block text-sm font-medium mb-1">
            Card Number
          </label>
          <div className="relative">
            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary-gray" />
            <input
              id="cardNumber"
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              placeholder="4242 4242 4242 4242"
              className="w-full pl-10 pr-3 py-2 bg-primary-black/50 border border-primary-gray/30 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-blue"
              maxLength={19}
              disabled={isProcessing}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="expiry" className="block text-sm font-medium mb-1">
              Expiry Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary-gray" />
              <div className="flex">
                <input
                  type="text"
                  value={expiryMonth}
                  onChange={(e) => setExpiryMonth(e.target.value.replace(/\D/g, '').substr(0, 2))}
                  placeholder="MM"
                  className="w-16 pl-10 pr-3 py-2 bg-primary-black/50 border border-primary-gray/30 rounded-l-md focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  maxLength={2}
                  disabled={isProcessing}
                />
                <input
                  type="text"
                  value={expiryYear}
                  onChange={(e) => setExpiryYear(e.target.value.replace(/\D/g, '').substr(0, 2))}
                  placeholder="YY"
                  className="w-16 px-3 py-2 bg-primary-black/50 border-t border-b border-r border-primary-gray/30 rounded-r-md focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  maxLength={2}
                  disabled={isProcessing}
                />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="cvc" className="block text-sm font-medium mb-1">
              CVC
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary-gray" />
              <input
                id="cvc"
                type="text"
                value={cvc}
                onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').substr(0, 3))}
                placeholder="123"
                className="w-full pl-10 pr-3 py-2 bg-primary-black/50 border border-primary-gray/30 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-blue"
                maxLength={3}
                disabled={isProcessing}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-sm text-primary-gray">
          Amount to pay: <span className="font-semibold">${amount.toFixed(2)}</span>
        </div>
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Pay Now'}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default PaymentForm;