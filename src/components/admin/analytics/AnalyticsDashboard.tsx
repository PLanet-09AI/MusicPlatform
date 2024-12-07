import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { formatPrice, formatNumber } from '@/lib/utils';
import { Music, Users, CreditCard, Clock } from 'lucide-react';
import { AnalyticsService } from '@/lib/analytics/metrics';
import { useAuthStore } from '@/store/authStore';
import MetricsCard from './MetricsCard';
import type { AnalyticsMetrics } from '@/lib/analytics/types';

const AnalyticsDashboard = () => {
  const { user } = useAuthStore();
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await AnalyticsService.getMetrics(
          user?.role === 'artist' ? user.id : undefined
        );
        setMetrics(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching analytics metrics:', error);
        setError('Failed to load analytics data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-accent-blue"></div>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-500/10 border border-red-500 text-red-500 px-6 py-4 rounded-lg inline-block">
          {error || 'Failed to load analytics'}
        </div>
      </div>
    );
  }

  const chartData = {
    labels: metrics.revenueByDay.map(d => new Date(d.date).toLocaleDateString()),
    datasets: [{
      label: 'Revenue',
      data: metrics.revenueByDay.map(d => d.amount),
      borderColor: '#64FFDA',
      backgroundColor: 'rgba(100, 255, 218, 0.1)',
      fill: true,
      tension: 0.4
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          callback: (value: number) => formatPrice(value)
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricsCard
          title="Total Revenue"
          value={formatPrice(metrics.totalRevenue)}
          icon={CreditCard}
        />
        {user?.role === 'admin' && (
          <MetricsCard
            title="Total Users"
            value={formatNumber(metrics.totalUsers)}
            icon={Users}
          />
        )}
        <MetricsCard
          title="Total Songs"
          value={formatNumber(metrics.totalSongs)}
          icon={Music}
        />
        <MetricsCard
          title="Listening Hours"
          value={`${formatNumber(Math.round(metrics.totalListeningTime))}h`}
          icon={Clock}
        />
      </div>

      {/* Top Songs */}
      <div className="bg-primary-black/50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Top Songs</h3>
        <div className="space-y-4">
          {metrics.topSongs.map((song) => (
            <div key={song.id} className="flex items-center justify-between">
              <div>
                <span className="text-primary-gray">{song.title}</span>
                <span className="text-xs text-primary-gray ml-2">by {song.artist}</span>
              </div>
              <div className="text-sm">
                <span className="text-accent-blue">{formatNumber(song.plays)} plays</span>
                <span className="text-primary-gray ml-4">{formatNumber(song.hours)}h listened</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue Chart */}
      {metrics.revenueByDay.length > 0 && (
        <div className="bg-primary-black/50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Revenue Over Time</h3>
          <div className="h-[300px]">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;