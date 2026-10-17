import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const AppContext = createContext();

const initialState = {
  tasks: [],
  loading: false,
  stats: null,
  filter: { status: 'all', platform: 'all', priority: 'all' },
  sort: 'dueDate',
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
    case 'SET_FILTER':
      return { ...state, filter: { ...state.filter, ...action.payload } };
    case 'SET_SORT':
      return { ...state, sort: action.payload };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // ── Fetch tasks ────────────────────────────────────────────────────────────
  const fetchTasks = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const [tasksRes, statsRes] = await Promise.all([
        axios.get('/api/tasks'),
        axios.get('/api/tasks/stats'),
      ]);
      dispatch({ type: 'SET_TASKS', payload: tasksRes.data });
      dispatch({ type: 'SET_STATS', payload: statsRes.data });
    } catch (err) {
      toast.error('Failed to load tasks');
      console.error(err);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  // ── Create task ────────────────────────────────────────────────────────────
  const addTask = useCallback(async (taskData) => {
    try {
      const res = await axios.post('/api/tasks', taskData);
      dispatch({ type: 'ADD_TASK', payload: res.data });
      toast.success('✅ Task created!');
      fetchTasks(); // refresh stats
      return res.data;
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create task');
      throw err;
    }
  }, [fetchTasks]);

  // ── Update task ────────────────────────────────────────────────────────────
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

  // ── Delete task ────────────────────────────────────────────────────────────
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

  // ── Add to Google Calendar ─────────────────────────────────────────────────
  const addToCalendar = useCallback(async (task) => {
    try {
      if (!task.dueDate) throw new Error('Task needs a due date to add to calendar');
      const res = await axios.post('/api/calendar/events', {
        title: task.title,
        description: task.description,
        startDateTime: task.dueDate,
        platform: task.platform,
        taskId: task.id,
      });
      // Store calendar event ID on the task
      await updateTask(task.id, { calendarEventId: res.data.id });
      toast.success('📅 Added to Google Calendar!');
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Calendar error');
    }
  }, [updateTask]);

  // ── Filtered & sorted tasks ────────────────────────────────────────────────
  const filteredTasks = state.tasks
    .filter(t => {
      if (state.filter.status !== 'all' && t.status !== state.filter.status) return false;
      if (state.filter.platform !== 'all' && t.platform !== state.filter.platform) return false;
      if (state.filter.priority !== 'all' && t.priority !== state.filter.priority) return false;
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
      filteredTasks,
      fetchTasks,
      addTask,
      updateTask,
      deleteTask,
      addToCalendar,
      setFilter: (f) => dispatch({ type: 'SET_FILTER', payload: f }),
      setSort: (s) => dispatch({ type: 'SET_SORT', payload: s }),
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
