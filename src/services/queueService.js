import { supabase } from '../lib/supabase';

export async function addToQueue(dispatch, state, { patientId, patientName, patientMrn, doctorId, appointmentTime, fullPatient }) {
  // Safety check: don't add if already waiting or with doctor today
  const isAlreadyInQueue = state.queue.some(q => q.patientId === patientId && (q.status === 'Waiting' || q.status === 'With Doctor'));
  if (isAlreadyInQueue) {
    console.warn('Patient is already in the queue');
    return;
  }

  const queueNumber = (state.queue.length + 1).toString().padStart(2, '0');
  const now = new Date();
  const arrivalTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const { error } = await supabase.from('queue').insert([{
    patient_id: patientId,
    patient_name: patientName,
    doctor_id: doctorId || 'doc-001',
    queue_number: queueNumber,
    status: 'Waiting',
    arrival_time: arrivalTime,
    appointment_time: appointmentTime || 'Walk-in'
  }]);

  // If the patient is from the Patient Module DB, the foreign key constraint will fail.
  // We need to sync them to the local Clinic DB first.
  if (error && error.code === '23503') {
    console.log("Foreign key missing for queue insert. Syncing patient to Clinic DB...");
    
    const names = patientName.split(' ');
    const firstName = names[0];
    const lastName = names.slice(1).join(' ') || ' ';
    
    // Default DOB to 1900-01-01 if we don't have it (required field)
    let dob = '1900-01-01';
    if (fullPatient?.age) {
      const year = new Date().getFullYear() - fullPatient.age;
      dob = `${year}-01-01`;
    }

    const { error: syncError } = await supabase.from('patients').insert([{
      patient_id: patientId,
      first_name: firstName,
      last_name: lastName,
      phone_number: fullPatient?.phone || 'Unknown',
      gender: fullPatient?.gender || 'Unknown',
      date_of_birth: dob,
      blood_group: 'Unknown' // default required or optional, safe default
    }]);

    if (!syncError) {
      // Retry queue insert after sync
      await supabase.from('queue').insert([{
        patient_id: patientId,
        patient_name: patientName,
        doctor_id: doctorId || 'doc-001',
        queue_number: queueNumber,
        status: 'Waiting',
        arrival_time: arrivalTime,
        appointment_time: appointmentTime || 'Walk-in'
      }]);
    } else {
      console.error("Failed to sync patient:", syncError);
    }
  } else if (error) {
    console.error("Failed to add to queue:", error);
  }
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
