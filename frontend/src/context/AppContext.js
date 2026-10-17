import React, { createContext, useContext, useReducer, useEffect, useCallback, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

// Configure Axios Base URL from environment variable if provided
if (process.env.REACT_APP_API_BASE_URL || process.env.REACT_APP_API_URL) {
  axios.defaults.baseURL = process.env.REACT_APP_API_BASE_URL || process.env.REACT_APP_API_URL;
}

const AppContext = createContext();

const initialState = {
  tasks: [],
  loading: true,
  stats: null,
  settings: {
    defaultPlatform: 'instagram',
    timezone: 'UTC',
    notificationPreferences: { holidayAlerts: true, taskReminders: true },
  },
  filter: { status: 'all', platform: 'all', priority: 'all', campaign: 'all' },
  searchQuery: '',
  sort: 'dueDate',
  backendError: false,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_TASKS':
      return { ...state, tasks: action.payload };
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(t => t.id === action.payload.id ? action.payload : t),
      };
    case 'DELETE_TASK':
      return { ...state, tasks: state.tasks.filter(t => t.id !== action.payload) };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_STATS':
      return { ...state, stats: action.payload };
    case 'SET_SETTINGS':
      return { ...state, settings: action.payload };
    case 'SET_FILTER':
      return { ...state, filter: { ...state.filter, ...action.payload } };
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    case 'SET_SORT':
      return { ...state, sort: action.payload };
    case 'SET_BACKEND_ERROR':
      return { ...state, backendError: action.payload };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // ── Theme State ─────────────────────────────────────────────────────────────
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('socialtodo_theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('socialtodo_theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  // ── Fetch User Settings ─────────────────────────────────────────────────────
  const fetchSettings = useCallback(async () => {
    try {
      const res = await axios.get('/api/settings');
      dispatch({ type: 'SET_SETTINGS', payload: res.data });
    } catch (err) {
      console.warn('[Settings] Failed to fetch settings, using defaults');
    }
  }, []);

  // ── Update User Settings ────────────────────────────────────────────────────
  const updateSettings = useCallback(async (newSettings) => {
    try {
      const res = await axios.patch('/api/settings', newSettings);
      dispatch({ type: 'SET_SETTINGS', payload: res.data });
      toast.success('Settings updated');
      return res.data;
    } catch (err) {
      toast.error('Failed to update settings');
      throw err;
    }
  }, []);

  // ── Fetch Tasks & Stats ─────────────────────────────────────────────────────
  const fetchTasks = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const [tasksRes, statsRes] = await Promise.all([
        axios.get('/api/tasks'),
        axios.get('/api/tasks/stats'),
      ]);
      dispatch({ type: 'SET_TASKS', payload: tasksRes.data });
      dispatch({ type: 'SET_STATS', payload: statsRes.data });
      dispatch({ type: 'SET_BACKEND_ERROR', payload: false });
    } catch (err) {
      console.error('[AppContext] Fetch error:', err);
      dispatch({ type: 'SET_BACKEND_ERROR', payload: true });
      toast.error('Unable to connect to backend server');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  useEffect(() => {
    fetchTasks();
    fetchSettings();
  }, [fetchTasks, fetchSettings]);

  // ── Create Task ─────────────────────────────────────────────────────────────
  const addTask = useCallback(async (taskData) => {
    try {
      const res = await axios.post('/api/tasks', taskData);
      dispatch({ type: 'ADD_TASK', payload: res.data });
      toast.success('Task created successfully');
      fetchTasks();
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to create task';
      toast.error(msg);
      throw err;
    }
  }, [fetchTasks]);

  // ── Update Task ─────────────────────────────────────────────────────────────
  const updateTask = useCallback(async (id, updates) => {
    try {
      const res = await axios.patch(`/api/tasks/${id}`, updates);
      dispatch({ type: 'UPDATE_TASK', payload: res.data });
      fetchTasks();
      return res.data;
    } catch (err) {
      toast.error('Failed to update task');
      throw err;
    }
  }, [fetchTasks]);

  // ── Delete Task ─────────────────────────────────────────────────────────────
  const deleteTask = useCallback(async (id) => {
    try {
      await axios.delete(`/api/tasks/${id}`);
      dispatch({ type: 'DELETE_TASK', payload: id });
      toast.success('Task deleted');
      fetchTasks();
    } catch (err) {
      toast.error('Failed to delete task');
    }
  }, [fetchTasks]);

  // ── Add to Google Calendar ──────────────────────────────────────────────────
  const addToCalendar = useCallback(async (task) => {
    try {
      if (!task.dueDate) throw new Error('Task needs a scheduled due date to sync with calendar');
      const res = await axios.post('/api/calendar/events', {
        title: task.title,
        description: task.description || task.notes,
        startDateTime: task.dueDate,
        platform: task.platform,
        taskId: task.id,
      });
      await updateTask(task.id, { calendarEventId: res.data.id });
      toast.success('Synced with Google Calendar');
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Calendar sync failed');
    }
  }, [updateTask]);

  // ── Filtered & Sorted Tasks ────────────────────────────────────────────────
  const filteredTasks = state.tasks
    .filter(t => {
      if (state.filter.status !== 'all' && t.status !== state.filter.status) return false;
      if (state.filter.platform !== 'all' && t.platform !== state.filter.platform) return false;
      if (state.filter.priority !== 'all' && t.priority !== state.filter.priority) return false;
      if (state.filter.campaign !== 'all' && t.campaign !== state.filter.campaign) return false;
      if (state.searchQuery) {
        const q = state.searchQuery.toLowerCase();
        const matchesTitle = t.title.toLowerCase().includes(q);
        const matchesDesc = (t.description || '').toLowerCase().includes(q);
        const matchesNotes = (t.notes || '').toLowerCase().includes(q);
        const matchesCampaign = (t.campaign || '').toLowerCase().includes(q);
        const matchesHashtags = (t.hashtags || []).some(h => h.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDesc && !matchesNotes && !matchesCampaign && !matchesHashtags) {
          return false;
        }
      }
      return true;
    })
    .sort((a, b) => {
      if (state.sort === 'dueDate') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      }
      if (state.sort === 'priority') {
        const order = { high: 0, medium: 1, low: 2 };
        return order[a.priority] - order[b.priority];
      }
      if (state.sort === 'created') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      return 0;
    });

  return (
    <AppContext.Provider value={{
      ...state,
      theme,
      toggleTheme,
      filteredTasks,
      fetchTasks,
      fetchSettings,
      updateSettings,
      addTask,
      updateTask,
      deleteTask,
      addToCalendar,
      setFilter: (f) => dispatch({ type: 'SET_FILTER', payload: f }),
      setSearchQuery: (q) => dispatch({ type: 'SET_SEARCH_QUERY', payload: q }),
      setSort: (s) => dispatch({ type: 'SET_SORT', payload: s }),
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
