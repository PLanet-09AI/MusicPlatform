import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';
import type { Song } from '@/types';

export function usePurchaseVerification(songId: string | undefined) {
  const { user } = useAuthStore();
  const [hasPurchased, setHasPurchased] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyPurchase = async () => {
      if (!user || !songId) {
        setHasPurchased(false);
        setIsLoading(false);
        return;
      }

      try {
        const transactionsQuery = query(
          collection(db, 'transactions'),
          where('userId', '==', user.id),
          where('songId', '==', songId),
          where('status', '==', 'completed')
        );

        const snapshot = await getDocs(transactionsQuery);
        setHasPurchased(!snapshot.empty);
      } catch (error) {
        console.error('Error verifying purchase:', error);
        setHasPurchased(false);
      } finally {
        setIsLoading(false);
      }
    };

    verifyPurchase();
  }, [user, songId]);

  return { hasPurchased, isLoading };
}