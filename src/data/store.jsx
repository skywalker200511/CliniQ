import { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { INITIAL_PATIENTS, INITIAL_QUEUE, INITIAL_CONSULTATIONS, INITIAL_MESSAGES, USERS } from './mockData';

/* ── Initial State ───────────────────────────────────────────────── */
const initialState = {
  currentUser: JSON.parse(localStorage.getItem('cliniq_user') || 'null'),
  patients: [],
  queue: [],
  consultations: [],
  messages: INITIAL_MESSAGES,
  toasts: [],
};

/* ── Action Types ────────────────────────────────────────────────── */
export const ACTIONS = {
  SET_USER: 'SET_USER',
  SET_QUEUE: 'SET_QUEUE',
  SET_MESSAGES: 'SET_MESSAGES',
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
    case ACTIONS.SET_QUEUE:
      return { ...state, queue: action.payload };

    case ACTIONS.SET_MESSAGES:
      return { ...state, messages: action.payload };

    case ACTIONS.SET_USER:
      if (action.payload) {
        localStorage.setItem('cliniq_user', JSON.stringify(action.payload));
      } else {
        localStorage.removeItem('cliniq_user');
      }
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


  useEffect(() => {
    const fetchQueue = async () => {
      // Only fetch queue entries from today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { data } = await supabase.from('queue')
        .select('*')
        .gte('created_at', today.toISOString());
        
      if (data) {
        const formatted = data.map(q => ({
          id: q.id,
          patientId: q.patient_id,
          patientName: q.patient_name,
          patientMrn: q.patient_id,
          doctorId: q.doctor_id,
          queueNumber: q.queue_number,
          status: q.status,
          arrivalTime: q.arrival_time,
          appointmentTime: q.appointment_time,
          calledAt: q.called_at,
          completedAt: q.completed_at
        }));
        dispatch({ type: ACTIONS.SET_QUEUE, payload: formatted });
      }
    };
    fetchQueue();

    const subscription = supabase
      .channel('queue_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'queue' }, () => {
        fetchQueue();
      })
      .subscribe();

    const fetchMessages = async () => {
      const { data } = await supabase.from('messages').select('*');
      if (data) {
        const formatted = data.map(m => ({
          id: m.id,
          senderId: m.sender_id,
          senderRole: m.sender_role,
          senderName: m.sender_name,
          receiverId: m.receiver_id,
          receiverRole: m.receiver_role,
          content: m.content,
          timestamp: m.created_at,
          read: m.read
        }));
        dispatch({ type: ACTIONS.SET_MESSAGES, payload: formatted });
      }
    };
    fetchMessages();

    const msgSub = supabase.channel('msg_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
        fetchMessages();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
      supabase.removeChannel(msgSub);
    };
  }, []);
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
