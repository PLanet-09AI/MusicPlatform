import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Transaction } from '@/types';
import { formatPrice } from '@/lib/utils';

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const q = query(
          collection(db, 'transactions'),
          orderBy('createdAt', 'desc')
        );
        
        const snapshot = await getDocs(q);
        const transactionsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate()
        })) as Transaction[];
        
        setTransactions(transactionsData);
        setError(null);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        setError('Failed to load transactions. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-accent-blue"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-500/10 border border-red-500 text-red-500 px-6 py-4 rounded-lg inline-block">
          {error}
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-primary-gray">No transactions found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Transaction History</h2>

      <div className="bg-primary-black/50 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-primary-gray/20">
              <th className="px-6 py-3 text-left">Date</th>
              <th className="px-6 py-3 text-left">User</th>
              <th className="px-6 py-3 text-left">Song</th>
              <th className="px-6 py-3 text-left">Amount</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Payment Details</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(transaction => (
              <tr key={transaction.id} className="border-b border-primary-gray/20">
                <td className="px-6 py-4">
                  {transaction.createdAt?.toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <div>
                    <div className="font-medium">{transaction.metadata?.userName || 'Unknown'}</div>
                    <div className="text-sm text-primary-gray">{transaction.metadata?.userEmail || 'N/A'}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <div className="font-medium">{transaction.metadata?.songTitle || 'Unknown'}</div>
                    <div className="text-sm text-primary-gray">{transaction.metadata?.songArtist || 'N/A'}</div>
                  </div>
                </td>
                <td className="px-6 py-4">{formatPrice(transaction.amount)}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    transaction.status === 'completed'
                      ? 'bg-green-500/20 text-green-500'
                      : transaction.status === 'pending'
                      ? 'bg-yellow-500/20 text-yellow-500'
                      : 'bg-red-500/20 text-red-500'
                  }`}>
                    {transaction.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm">
                    {transaction.paymentDetails ? (
                      <>
                        <div>Card: **** {transaction.paymentDetails.last4}</div>
                        <div className="text-primary-gray">
                          ID: {transaction.paymentDetails.paymentIntentId.slice(-8)}
                        </div>
                      </>
                    ) : (
                      <span className="text-primary-gray">No payment details</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionHistory;