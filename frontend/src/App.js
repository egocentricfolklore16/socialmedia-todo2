import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import TodoList from './components/TodoList';
import ContentCalendar from './components/ContentCalendar';
import HolidayBanner from './components/HolidayBanner';
import GoogleAuthBanner from './components/GoogleAuthBanner';
import StatsBar from './components/StatsBar';
import { usePushNotifications } from './hooks/usePushNotifications';
import axios from 'axios';

export default function App() {
  const [activeTab, setActiveTab] = useState('todos');
  const [authStatus, setAuthStatus] = useState(null); // null | true | false

  // Register push notifications
  usePushNotifications();

  // Check Google auth status on mount and after redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authResult = params.get('auth');

    if (authResult === 'success') {
      toast.success('✅ Connected to Google Calendar!');
      // Clean URL
      window.history.replaceState({}, '', '/');
    } else if (authResult === 'error') {
      toast.error(`Google auth failed: ${params.get('reason') || 'unknown error'}`);
      window.history.replaceState({}, '', '/');
    }

    // Handle tab from query param (e.g. ?tab=calendar from push notification)
    const tab = params.get('tab');
    if (tab === 'calendar') setActiveTab('calendar');

    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const res = await axios.get('/auth/status');
      setAuthStatus(res.data.authenticated);
    } catch {
      setAuthStatus(false);
    }
  }

  return (
    <AppProvider>
      <div style={{ minHeight: '100vh', background: '#0f172a' }}>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#1e293b', color: '#e2e8f0', border: '1px solid #334155' },
            duration: 4000,
          }}
        />

        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
          {/* Google Auth Banner */}
          {authStatus === false && (
            <GoogleAuthBanner onConnect={() => {
              window.location.href = '/auth/google';
            }} />
          )}

          {/* Holiday Alert Banner */}
          {authStatus && <HolidayBanner />}

          {/* Stats Bar */}
          <StatsBar />

          {/* Tab Content */}
          {activeTab === 'todos' && <TodoList />}
          {activeTab === 'calendar' && <ContentCalendar />}
        </main>
      </div>
    </AppProvider>
  );
}
