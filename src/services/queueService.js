/**
 * Queue Service — Data access layer for patient queue operations.
 */
import { ACTIONS } from '../data/store';

/** Add a patient to the queue */
export function addToQueue(dispatch, state, { patientId, patientName, patientMrn, doctorId, appointmentTime }) {
  const initials = patientName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  const queueNumber = (state.queue.length + 1).toString().padStart(2, '0');
  const now = new Date();
  const arrivalTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const entry = {
    id: `q-${Date.now()}`,
    patientId,
    patientName,
    patientMrn: patientMrn || patientId,
    initials,
    doctorId: doctorId || 'doc-001',
    queueNumber,
    status: 'Waiting',
    arrivalTime,
    appointmentTime: appointmentTime || 'Walk-in',
    calledAt: null,
    completedAt: null,
  };

  dispatch({ type: ACTIONS.ADD_TO_QUEUE, payload: entry });
  return entry;
}

/** Call a patient from waiting to consultation */
export function callPatient(dispatch, queueEntryId) {
  dispatch({
    type: ACTIONS.UPDATE_QUEUE_ENTRY,
    payload: { id: queueEntryId, status: 'With Doctor', calledAt: new Date().toISOString() },
  });
}

/** Mark a patient consultation as completed */
export function markCompleted(dispatch, queueEntryId) {
  dispatch({
    type: ACTIONS.UPDATE_QUEUE_ENTRY,
    payload: { id: queueEntryId, status: 'Completed', completedAt: new Date().toISOString() },
  });
}

/** Remove a patient from the queue */
export function removeFromQueue(dispatch, queueEntryId) {
  dispatch({ type: ACTIONS.REMOVE_FROM_QUEUE, payload: queueEntryId });
}

/** Get queue statistics */
export function getQueueStats(state) {
  const queue = state.queue;
  return {
    total: queue.length,
    waiting: queue.filter(q => q.status === 'Waiting').length,
    withDoctor: queue.filter(q => q.status === 'With Doctor').length,
    completed: queue.filter(q => q.status === 'Completed').length,
  };
}

/** Get filtered queue entries */
export function getFilteredQueue(state, filter = 'all', searchQuery = '') {
  let result = state.queue;

  if (filter === 'waiting') result = result.filter(q => q.status === 'Waiting');
  else if (filter === 'doctor') result = result.filter(q => q.status === 'With Doctor');
  else if (filter === 'completed') result = result.filter(q => q.status === 'Completed');

  if (searchQuery && searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    result = result.filter(entry =>
      entry.patientName.toLowerCase().includes(q) ||
      entry.patientMrn.toLowerCase().includes(q) ||
      entry.queueNumber.includes(q)
    );
  }

  return result;
}

/** Get the currently serving patient (With Doctor) */
export function getCurrentlyServing(state) {
  return state.queue.find(q => q.status === 'With Doctor') || null;
}

/** Call the next waiting patient in the queue for a doctor */
export function callNextPatient(dispatch, state, doctorId) {
  const nextPatient = state.queue.find(
    q => q.status === 'Waiting' && (!q.doctorId || q.doctorId === doctorId)
  );
  if (nextPatient) {
    callPatient(dispatch, nextPatient.id);
    return nextPatient;
  }
  return null;
}

/** Mark a patient's consultation as completed based on patient ID */
export function completeQueueEntry(dispatch, state, patientId) {
  const entry = state.queue.find(q => q.patientId === patientId && q.status === 'With Doctor');
  if (entry) {
    markCompleted(dispatch, entry.id);
  }
}

