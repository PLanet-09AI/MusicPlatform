import React, { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';
import type { Song } from '@/types';
import Button from '@/components/ui/Button';
import SongForm from './SongForm';

const SongManagement = () => {
  const { user } = useAuthStore();
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedSong, setSelectedSong] = useState<Song | undefined>();

  const fetchSongs = async () => {
    try {
      // Filter songs by artistId if user is an artist
      const songsQuery = user?.role === 'artist'
        ? query(collection(db, 'songs'), where('artistId', '==', user.id))
        : query(collection(db, 'songs'));

      const snapshot = await getDocs(songsQuery);
      const songsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as Song[];
      
      setSongs(songsData);
    } catch (error) {
      console.error('Error fetching songs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSongs();
  }, [user]);

  const handleDelete = async (songId: string) => {
    if (!confirm('Are you sure you want to delete this song?')) return;

    try {
      await deleteDoc(doc(db, 'songs', songId));
      setSongs(songs.filter(song => song.id !== songId));
    } catch (error) {
      console.error('Error deleting song:', error);
    }
  };

  const handleEdit = (song: Song) => {
    setSelectedSong(song);
    setShowForm(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-accent-blue"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Manage Songs</h2>
        <Button onClick={() => {
          setSelectedSong(undefined);
          setShowForm(true);
        }}>
          Add New Song
        </Button>
      </div>

      <div className="bg-primary-black/50 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-primary-gray/20">
              <th className="px-6 py-3 text-left">Title</th>
              <th className="px-6 py-3 text-left">Artist</th>
              <th className="px-6 py-3 text-left">Price</th>
              <th className="px-6 py-3 text-left">Premium</th>
              <th className="px-6 py-3 text-left">Plays</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {songs.map(song => (
              <tr key={song.id} className="border-b border-primary-gray/20">
                <td className="px-6 py-4">{song.title}</td>
                <td className="px-6 py-4">{song.artist}</td>
                <td className="px-6 py-4">${song.price}</td>
                <td className="px-6 py-4">{song.isPremium ? 'Yes' : 'No'}</td>
                <td className="px-6 py-4">{song.playCount || 0}</td>
                <td className="px-6 py-4 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mr-2"
                    onClick={() => handleEdit(song)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500"
                    onClick={() => handleDelete(song.id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <SongForm
          song={selectedSong}
          onClose={() => {
            setShowForm(false);
            setSelectedSong(undefined);
          }}
          onSuccess={fetchSongs}
        />
      )}
    </div>
  );
};

export default SongManagement;