import React from 'react';
import { cn } from '@/lib/utils';

interface MusicBarsProps {
  className?: string;
}

const MusicBars: React.FC<MusicBarsProps> = ({ className }) => {
  return (
    <div className={cn('flex items-end gap-1', className)}>
      {[1, 2, 3, 4, 5].map((bar) => (
        <div
          key={bar}
          className="w-2 bg-gradient-to-t from-accent-blue to-purple-500 rounded-t animate-music-bar"
          style={{
            height: '20px',
            animation: `musicBar 1.5s ease-in-out infinite ${bar * 0.2}s`,
            animationDirection: bar % 2 ? 'alternate' : 'alternate-reverse'
          }}
        />
      ))}
    </div>
  );
};

export default MusicBars;