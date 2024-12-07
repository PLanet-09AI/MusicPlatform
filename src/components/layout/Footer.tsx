import React from 'react';
import { Music2, Github, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-primary-black/90 backdrop-blur-sm py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Music2 className="h-6 w-6 text-accent-blue" />
            <span className="text-xl font-bold">MusicHub</span>
          </div>
          
          <div className="flex items-center space-x-6">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent-blue transition"
            >
              <Github className="h-5 w-5" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent-blue transition"
            >
              <Twitter className="h-5 w-5" />
            </a>
          </div>
        </div>
        
        <div className="mt-8 text-center space-y-2">
          <p className="text-primary-gray text-sm">© {new Date().getFullYear()} MusicHub. All rights reserved.</p>
          <p className="text-accent-blue text-sm font-medium">Powered by Planet 09 AI</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;