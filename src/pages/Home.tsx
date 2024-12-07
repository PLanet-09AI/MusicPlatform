import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Download, Shield } from 'lucide-react';
import Button from '@/components/ui/Button';
import MusicBars from '@/components/ui/MusicBars';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="text-center space-y-8">
        <div className="flex flex-col items-center gap-4">
          <MusicBars className="scale-150 mb-8" />
          <h1 className="text-5xl md:text-6xl font-bold">
            Your Music,{' '}
            <span className="text-accent-blue">Your Way</span>
          </h1>
        </div>
        <p className="text-xl text-primary-gray max-w-2xl mx-auto">
          Discover, stream, and download high-quality music from independent artists worldwide.
          Join our community of music lovers today.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Button size="lg" onClick={() => navigate('/browse')}>
            Start Listening
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate('/signup')}>
            Join Now
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid md:grid-cols-3 gap-8">
        <div className="bg-primary-black/50 p-6 rounded-lg backdrop-blur-sm">
          <Play className="h-12 w-12 text-accent-blue mb-4" />
          <h3 className="text-xl font-semibold mb-2">Stream Anywhere</h3>
          <p className="text-primary-gray">
            Listen to your favorite tracks on any device, anytime. High-quality streaming that adapts to your connection.
          </p>
        </div>
        <div className="bg-primary-black/50 p-6 rounded-lg backdrop-blur-sm">
          <Download className="h-12 w-12 text-accent-blue mb-4" />
          <h3 className="text-xl font-semibold mb-2">Download & Own</h3>
          <p className="text-primary-gray">
            Purchase and download songs in premium quality. Build your personal music collection.
          </p>
        </div>
        <div className="bg-primary-black/50 p-6 rounded-lg backdrop-blur-sm">
          <Shield className="h-12 w-12 text-accent-blue mb-4" />
          <h3 className="text-xl font-semibold mb-2">Secure Platform</h3>
          <p className="text-primary-gray">
            Your data and purchases are protected. Safe and secure transactions guaranteed.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;