import { supabase } from '../lib/supabase';

export async function addToQueue(dispatch, state, { patientId, patientName, patientMrn, doctorId, appointmentTime }) {
  const queueNumber = (state.queue.length + 1).toString().padStart(2, '0');
  const now = new Date();
  const arrivalTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  await supabase.from('queue').insert([{
    patient_id: patientId,
    patient_name: patientName,
    doctor_id: doctorId || 'doc-001',
    queue_number: queueNumber,
    status: 'Waiting',
    arrival_time: arrivalTime,
    appointment_time: appointmentTime || 'Walk-in'
  }]);
}

export async function callPatient(dispatch, queueEntryId) {
  await supabase.from('queue').update({ status: 'With Doctor', called_at: new Date().toISOString() }).eq('id', queueEntryId);
}

export async function markCompleted(dispatch, queueEntryId) {
  await supabase.from('queue').update({ status: 'Completed', completed_at: new Date().toISOString() }).eq('id', queueEntryId);
}

export async function removeFromQueue(dispatch, queueEntryId) {
  await supabase.from('queue').delete().eq('id', queueEntryId);
}

export function getQueueStats(state) {
  const queue = state.queue;
  return {
    total: queue.length,
    waiting: queue.filter(q => q.status === 'Waiting').length,
    withDoctor: queue.filter(q => q.status === 'With Doctor').length,
    completed: queue.filter(q => q.status === 'Completed').length,
  };
}

export function getFilteredQueue(state, filter = 'all', searchQuery = '') {
  let result = state.queue;
  if (filter === 'waiting') result = result.filter(q => q.status === 'Waiting');
  else if (filter === 'doctor') result = result.filter(q => q.status === 'With Doctor');
  else if (filter === 'completed') result = result.filter(q => q.status === 'Completed');

  if (searchQuery && searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    result = result.filter(entry =>
      (entry.patientName && entry.patientName.toLowerCase().includes(q)) ||
      (entry.patientMrn && entry.patientMrn.toLowerCase().includes(q)) ||
      (entry.queueNumber && entry.queueNumber.includes(q))
    );
  }
  return result;
}

export function getCurrentlyServing(state) {
  return state.queue.find(q => q.status === 'With Doctor') || null;
}

export async function callNextPatient(dispatch, state, doctorId) {
  const nextPatient = state.queue.find(
    q => q.status === 'Waiting' && (!q.doctorId || q.doctorId === doctorId)
  );
  if (nextPatient) {
    await callPatient(dispatch, nextPatient.id);
    return nextPatient;
  }
  return null;
}

export async function completeQueueEntry(dispatch, state, patientId) {
  const entry = state.queue.find(q => q.patientId === patientId && (q.status === 'With Doctor' || q.status === 'Waiting'));
  if (entry) {
    await markCompleted(dispatch, entry.id);
  }
}
