import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Browse from './pages/Browse';
import SongDetails from './pages/SongDetails';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import Login from './pages/auth/Login';
import SignUp from './pages/auth/SignUp';
import AuthGuard from './components/auth/AuthGuard';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-primary-navy text-primary-white flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/songs/:id" element={<SongDetails />} />
            <Route
              path="/profile"
              element={
                <AuthGuard>
                  <Profile />
                </AuthGuard>
              }
            />
            <Route
              path="/admin/*"
              element={
                <AuthGuard allowedRoles={['admin', 'artist']}>
                  <Admin />
                </AuthGuard>
              }
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;