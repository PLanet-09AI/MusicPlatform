import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import AudioPlayer from '../songs/AudioPlayer';
import { usePlayerStore } from '@/store/playerStore';

const PlayerLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const currentSong = usePlayerStore(state => state.currentSong);
  const isPlayerVisible = !!currentSong && !location.pathname.includes('/analytics');

  return (
    <div className="min-h-screen bg-primary-navy flex flex-col">
      <Navbar />
      <div className="flex-1 flex">
        <Sidebar />
        <main className={`flex-1 overflow-y-auto p-6 ${isPlayerVisible ? 'pb-32' : 'pb-6'}`}>
          {children}
        </main>
      </div>
      {isPlayerVisible && <AudioPlayer song={currentSong} />}
    </div>
  );
};

export default PlayerLayout;