import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';
import type { Song, Transaction } from '@/types';
import SongCard from '@/components/songs/SongCard';
import AudioPlayer from '@/components/songs/AudioPlayer';

const Profile = () => {
  const { user } = useAuthStore();
  const [purchases, setPurchases] = useState<(Transaction & { song: Song })[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPurchases = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        // Query completed transactions for the user
        const purchasesQuery = query(
          collection(db, 'transactions'),
          where('userId', '==', user.id),
          where('status', '==', 'completed')
        );

        const purchasesSnapshot = await getDocs(purchasesQuery);
        
        // Fetch song details for each purchase
        const purchasesWithSongs = await Promise.all(
          purchasesSnapshot.docs.map(async (purchaseDoc) => {
            const purchaseData = purchaseDoc.data() as Transaction;
            try {
              const songDoc = await getDoc(doc(db, 'songs', purchaseData.songId));
              if (!songDoc.exists()) {
                throw new Error(`Song not found: ${purchaseData.songId}`);
              }
              return {
                ...purchaseData,
                id: purchaseDoc.id,
                song: { id: songDoc.id, ...songDoc.data() } as Song
              };
            } catch (err) {
              console.error(`Error fetching song ${purchaseData.songId}:`, err);
              return null;
            }
          })
        );

        // Filter out any failed song fetches
        setPurchases(purchasesWithSongs.filter((p): p is Transaction & { song: Song } => p !== null));
        setError(null);
      } catch (error) {
        console.error('Error fetching purchases:', error);
        setError('Failed to load your purchases. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPurchases();
  }, [user]);

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

  return (
    <div className="space-y-8 pb-24">
      <div>
        <h1 className="text-3xl font-bold mb-2">Profile</h1>
        <p className="text-primary-gray">{user?.email}</p>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-6">Your Purchases</h2>
        {purchases.length === 0 ? (
          <div className="text-center py-12 bg-primary-black/30 rounded-lg">
            <p className="text-primary-gray">You haven't purchased any songs yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {purchases.map(({ song }) => (
              <SongCard
                key={song.id}
                song={song}
                onPlay={() => setCurrentSong(song)}
              />
            ))}
          </div>
        )}
      </div>

      <AudioPlayer song={currentSong} />
    </div>
  );
};

export default Profile;