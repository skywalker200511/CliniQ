import { supabase } from '../lib/supabase';

export async function saveConsultation({ patientId, doctorId, vitals, symptoms, diagnosis, prescriptions, notes, advice }) {
  // 1. Calculate the visit number by counting previous consultations
  const { count, error: countError } = await supabase
    .from('consultations')
    .select('*', { count: 'exact', head: true })
    .eq('patient_id', patientId);

  const visitNumber = (count || 0) + 1;

  // 2. Insert the new consultation
  const { data, error } = await supabase.from('consultations').insert([{
    patient_id: patientId,
    doctor_id: doctorId || 'doc-001',
    visit_number: visitNumber,
    vitals: vitals,
    symptoms: symptoms,
    diagnosis: diagnosis,
    prescriptions: prescriptions,
    notes: notes,
    advice: advice,
    status: 'completed'
  }]).select().single();

  if (error) {
    console.error('Error saving consultation:', error);
    throw error;
  }
  return data;
}

export async function getPatientConsultations(patientId) {
  const { data, error } = await supabase
    .from('consultations')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false });
  
  return data || [];
}
