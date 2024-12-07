import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Line } from 'react-chartjs-2';
import type { Song } from '@/types';
import { formatDuration, formatNumber } from '@/lib/utils';

const SongAnalytics = () => {
  const { id } = useParams();
  const [song, setSong] = useState<Song | null>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        const [songDoc, metricsDoc] = await Promise.all([
          getDoc(doc(db, 'songs', id)),
          getDoc(doc(db, 'songMetrics', id))
        ]);

        if (songDoc.exists()) {
          setSong({ id: songDoc.id, ...songDoc.data() } as Song);
        }

        if (metricsDoc.exists()) {
          setMetrics(metricsDoc.data());
        }
      } catch (error) {
        console.error('Error fetching song analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-accent-blue"></div>
      </div>
    );
  }

  if (!song || !metrics) {
    return (
      <div className="text-center py-12">
        <p className="text-primary-gray">Analytics data not available</p>
      </div>
    );
  }

  const completionData = {
    labels: Object.keys(metrics.completionRates || {}),
    datasets: [{
      label: 'Completion Rate',
      data: Object.values(metrics.completionRates || {}),
      borderColor: '#64FFDA',
      backgroundColor: 'rgba(100, 255, 218, 0.1)',
      fill: true,
    }]
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex items-start gap-6">
        <img
          src={song.coverUrl}
          alt={song.title}
          className="w-48 h-48 rounded-lg object-cover"
        />
        <div>
          <h1 className="text-3xl font-bold mb-2">{song.title}</h1>
          <p className="text-xl text-primary-gray mb-4">{song.artist}</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-primary-black/50 p-4 rounded-lg">
              <p className="text-sm text-primary-gray">Total Plays</p>
              <p className="text-2xl font-semibold">{formatNumber(metrics.playCount || 0)}</p>
            </div>
            <div className="bg-primary-black/50 p-4 rounded-lg">
              <p className="text-sm text-primary-gray">Unique Listeners</p>
              <p className="text-2xl font-semibold">
                {formatNumber(metrics.uniqueListeners?.length || 0)}
              </p>
            </div>
            <div className="bg-primary-black/50 p-4 rounded-lg">
              <p className="text-sm text-primary-gray">Total Play Time</p>
              <p className="text-2xl font-semibold">
                {formatDuration(metrics.totalPlayTime || 0)}
              </p>
            </div>
            <div className="bg-primary-black/50 p-4 rounded-lg">
              <p className="text-sm text-primary-gray">Avg. Completion</p>
              <p className="text-2xl font-semibold">
                {Math.round((metrics.averageCompletion || 0) * 100)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Completion Rate Graph */}
      <div className="bg-primary-black/50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Listening Patterns</h2>
        <div className="h-[300px]">
          <Line
            data={completionData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                  grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                  },
                },
                x: {
                  grid: {
                    display: false,
                  },
                },
              },
              plugins: {
                legend: {
                  display: false,
                },
              },
            }}
          />
        </div>
      </div>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-primary-black/50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Peak Listening Hours</h3>
          {/* Add peak hours visualization */}
        </div>
        <div className="bg-primary-black/50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Listener Demographics</h3>
          {/* Add demographics visualization */}
        </div>
      </div>
    </div>
  );
};

export default SongAnalytics;