import { createContext, useContext, useReducer, useCallback } from 'react';
import { INITIAL_PATIENTS, INITIAL_QUEUE, INITIAL_CONSULTATIONS, INITIAL_MESSAGES, USERS } from './mockData';

/* ── Initial State ───────────────────────────────────────────────── */
const initialState = {
  currentUser: null, // Will be set on role selection
  patients: [...INITIAL_PATIENTS],
  queue: [...INITIAL_QUEUE],
  consultations: [...INITIAL_CONSULTATIONS],
  messages: [...INITIAL_MESSAGES],
  toasts: [],
};

/* ── Action Types ────────────────────────────────────────────────── */
export const ACTIONS = {
  SET_USER: 'SET_USER',
  // Patient actions
  ADD_PATIENT: 'ADD_PATIENT',
  UPDATE_PATIENT: 'UPDATE_PATIENT',
  // Queue actions
  ADD_TO_QUEUE: 'ADD_TO_QUEUE',
  UPDATE_QUEUE_ENTRY: 'UPDATE_QUEUE_ENTRY',
  REMOVE_FROM_QUEUE: 'REMOVE_FROM_QUEUE',
  // Consultation actions
  ADD_CONSULTATION: 'ADD_CONSULTATION',
  UPDATE_CONSULTATION: 'UPDATE_CONSULTATION',
  // Message actions
  ADD_MESSAGE: 'ADD_MESSAGE',
  MARK_MESSAGE_READ: 'MARK_MESSAGE_READ',
  // Toast
  ADD_TOAST: 'ADD_TOAST',
  REMOVE_TOAST: 'REMOVE_TOAST',
};

/* ── Reducer ─────────────────────────────────────────────────────── */
function appReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_USER:
      return { ...state, currentUser: action.payload };

    case ACTIONS.ADD_PATIENT:
      return { ...state, patients: [...state.patients, action.payload] };

    case ACTIONS.UPDATE_PATIENT:
      return {
        ...state,
        patients: state.patients.map(p => p.id === action.payload.id ? { ...p, ...action.payload } : p),
      };

    case ACTIONS.ADD_TO_QUEUE:
      return { ...state, queue: [...state.queue, action.payload] };

    case ACTIONS.UPDATE_QUEUE_ENTRY:
      return {
        ...state,
        queue: state.queue.map(q => q.id === action.payload.id ? { ...q, ...action.payload } : q),
      };

    case ACTIONS.REMOVE_FROM_QUEUE:
      return { ...state, queue: state.queue.filter(q => q.id !== action.payload) };

    case ACTIONS.ADD_CONSULTATION:
      return { ...state, consultations: [...state.consultations, action.payload] };

    case ACTIONS.UPDATE_CONSULTATION:
      return {
        ...state,
        consultations: state.consultations.map(c =>
          c.id === action.payload.id ? { ...c, ...action.payload } : c
        ),
      };

    case ACTIONS.ADD_MESSAGE:
      return { ...state, messages: [...state.messages, action.payload] };

    case ACTIONS.MARK_MESSAGE_READ:
      return {
        ...state,
        messages: state.messages.map(m => m.id === action.payload ? { ...m, read: true } : m),
      };

    case ACTIONS.ADD_TOAST:
      return { ...state, toasts: [...state.toasts, action.payload] };

    case ACTIONS.REMOVE_TOAST:
      return { ...state, toasts: state.toasts.filter(t => t.id !== action.payload) };

    default:
      return state;
  }
}

/* ── Context ─────────────────────────────────────────────────────── */
const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const showToast = useCallback((message, icon = 'check_circle') => {
    const id = Date.now().toString();
    dispatch({ type: ACTIONS.ADD_TOAST, payload: { id, message, icon } });
    setTimeout(() => {
      dispatch({ type: ACTIONS.REMOVE_TOAST, payload: id });
    }, 3500);
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch, showToast }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

export { USERS };
