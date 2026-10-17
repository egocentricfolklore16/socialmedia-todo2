import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import TodoList from './components/TodoList';
import ContentCalendar from './components/ContentCalendar';
import HolidayBanner from './components/HolidayBanner';
import GoogleAuthBanner from './components/GoogleAuthBanner';
import SettingsModal from './components/SettingsModal';
import StatsBar from './components/StatsBar';
import { usePushNotifications } from './hooks/usePushNotifications';
import { WifiOff, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import axios from 'axios';

function MainLayout() {
  const [activeTab, setActiveTab] = useState('todos');
  const [authStatus, setAuthStatus] = useState(null); // null | true | false
  const [showSettings, setShowSettings] = useState(false);
  const { backendError, fetchTasks } = useApp();

  // Register push notifications
  usePushNotifications();

  // Check Google auth status on mount and after redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authResult = params.get('auth');

    if (authResult === 'success') {
      toast.success('Connected to Google Calendar', {
        icon: <CheckCircle2 size={18} style={{ color: '#10b981' }} />,
      });
      window.history.replaceState({}, '', '/');
    } else if (authResult === 'error') {
      toast.error(`Google Auth: ${params.get('reason') || 'Authentication failed'}`, {
        icon: <AlertCircle size={18} style={{ color: '#f43f5e' }} />,
      });
      window.history.replaceState({}, '', '/');
    }

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
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-base)',
      color: 'var(--text-primary)',
      transition: 'background-color 0.2s ease, color 0.2s ease',
    }}>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-default)',
            boxShadow: 'var(--shadow-md)',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--text-sm)',
            fontFamily: 'var(--font-sans)',
          },
          duration: 3500,
        }}
      />

      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettings={() => setShowSettings(true)}
        authStatus={authStatus}
      />

      <main style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: 'var(--space-6) var(--space-4) var(--space-10) var(--space-4)',
      }}>
        {/* Backend Unreachable Error Banner */}
        {backendError && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.12)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-4)',
            marginBottom: 'var(--space-6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--space-4)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <WifiOff size={20} style={{ color: 'var(--priority-high)', flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                  Backend server unreachable
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                  Check if your Express API server is running at http://localhost:5000.
                </div>
              </div>
            </div>
            <button
              onClick={fetchTasks}
              style={{
                background: 'var(--priority-high)',
                color: '#ffffff',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                padding: 'var(--space-2) var(--space-4)',
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
              }}
            >
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        )}

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

        {/* Settings Modal */}
        {showSettings && (
          <SettingsModal onClose={() => setShowSettings(false)} />
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
