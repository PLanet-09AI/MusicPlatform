import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';
import type { Song } from '@/types';
import SongCard from '@/components/songs/SongCard';
import AudioPlayer from '@/components/songs/AudioPlayer';
import PurchaseModal from '@/components/songs/PurchaseModal';

const Browse = () => {
  const { user } = useAuthStore();
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const songsQuery = user?.role === 'admin' 
          ? query(collection(db, 'songs'))
          : query(collection(db, 'songs'));
        
        const snapshot = await getDocs(songsQuery);
        const songsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Song[];
        
        setSongs(songsData);
      } catch (error) {
        console.error('Error fetching songs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSongs();
  }, [user]);

  const handlePurchaseSuccess = () => {
    if (selectedSong) {
      setCurrentSong(selectedSong);
    }
    setShowPurchaseModal(false);
    setSelectedSong(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-accent-blue"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-24">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Browse Music</h1>
        <div className="flex items-center gap-4">
          {/* Add filters here if needed */}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {songs.map((song) => (
          <SongCard
            key={song.id}
            song={song}
            onPlay={() => setCurrentSong(song)}
            showPurchaseModal={() => {
              setSelectedSong(song);
              setShowPurchaseModal(true);
            }}
          />
        ))}
      </div>

      {showPurchaseModal && selectedSong && (
        <PurchaseModal
          song={selectedSong}
          onClose={() => {
            setShowPurchaseModal(false);
            setSelectedSong(null);
          }}
          onSuccess={handlePurchaseSuccess}
        />
      )}

      <AudioPlayer song={currentSong} />
    </div>
  );
};

export default Browse;