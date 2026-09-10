import { supabase } from '../lib/supabase';
import { patientModuleSupabase } from '../lib/patientModuleSupabase';

/** Normalize phone: strip spaces, +91, dashes — keep last 10 digits */
function normalizePhone(phone) {
  return (phone || '').replace(/[\s\-\+]/g, '').slice(-10);
}

/**
 * Given a patient object (from the merged list), resolve the patient module UUID.
 *
 * - If the patient came from the patient module (source === 'patient_module'),
 *   the id IS the patient module UUID — use it directly.
 * - If the patient came from the clinic DB (source === 'clinic'),
 *   look up the patient module by matching phone number.
 */
export async function resolvePatientModuleId(patient) {
  // If it's already a patient-module patient, use the id directly
  if (patient.source === 'patient_module') {
    return patient.id;
  }

  // Otherwise, look up by phone number
  try {
    const { data: clinicPatient, error: clinicError } = await supabase
      .from('patients')
      .select('phone_number')
      .eq('patient_id', patient.id)
      .single();

    // If it's not in the clinic DB, it might actually be a patient module ID 
    // that was saved in consultations/queue.
    if (clinicError || !clinicPatient) return patient.id;

    const clinicPhone = normalizePhone(clinicPatient.phone_number);
    if (!clinicPhone || clinicPhone.length < 10) return patient.id;

    const { data: pmPatients, error: pmError } = await patientModuleSupabase
      .from('patients')
      .select('id, phone');

    if (pmError || !pmPatients) return null;

    const match = pmPatients.find(p => normalizePhone(p.phone) === clinicPhone);
    return match ? match.id : patient.id;
  } catch (error) {
    console.error('Error resolving patient module ID:', error);
    return patient.id;
  }
}

/**
 * Fetch all reports for a patient from the PATIENT MODULE's DB.
 *
 * Accepts a patient object with { id, source } so it knows whether
 * to look up the patient module ID or use it directly.
 *
 * Table: patient_reports
 * Columns: id, patient_id, medical_history_id, report_name, report_type,
 *          report_date, file_url, file_name, file_size, mime_type,
 *          description, uploaded_at
 */
export async function getPatientReports(patientId, source) {
  try {
    let pmId = patientId;

    // If from the clinic DB, resolve to patient module ID via phone match
    if (source === 'clinic') {
      pmId = await resolvePatientModuleId({ id: patientId, source: 'clinic' });
    }

    if (!pmId) return [];

    const { data, error } = await patientModuleSupabase
      .from('patient_reports')
      .select('*')
      .eq('patient_id', pmId)
      .order('uploaded_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching patient reports:', error);
    return [];
  }
}

/**
 * Determine a human-readable label and icon for a report based on its report_type and mime_type.
 */
export function getReportTypeInfo(report) {
  const reportType = (report.report_type || '').toLowerCase();
  const mimeType = (report.mime_type || '').toLowerCase();

  if (reportType.includes('blood') || reportType.includes('lab') || reportType.includes('test')) {
    return { label: report.report_type, icon: 'biotech', color: '#4CAF50' };
  }
  if (reportType.includes('xray') || reportType.includes('x-ray') || reportType.includes('scan') || reportType.includes('mri') || reportType.includes('ct')) {
    return { label: report.report_type, icon: 'radiology', color: '#2196F3' };
  }
  if (reportType.includes('prescription') || reportType.includes('rx')) {
    return { label: report.report_type, icon: 'medication', color: '#FF9800' };
  }
  if (reportType.includes('discharge')) {
    return { label: report.report_type, icon: 'summarize', color: '#9C27B0' };
  }
  if (reportType.includes('vaccine') || reportType.includes('vaccination')) {
    return { label: report.report_type, icon: 'vaccines', color: '#00BCD4' };
  }
  if (mimeType.startsWith('image/')) {
    return { label: report.report_type || 'Image', icon: 'image', color: '#2196F3' };
  }
  if (mimeType === 'application/pdf') {
    return { label: report.report_type || 'PDF Document', icon: 'picture_as_pdf', color: '#F44336' };
  }
  return { label: report.report_type || 'Document', icon: 'attach_file', color: '#757575' };
}

/**
 * Subscribe to realtime changes on the patient_reports table for a specific patient.
 */
export function subscribeToPatientReports(patientModuleId, onInsert) {
  if (!patientModuleId) return null;

  const channel = patientModuleSupabase
    .channel(`patient_reports_${patientModuleId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'patient_reports',
        filter: `patient_id=eq.${patientModuleId}`,
      },
      (payload) => onInsert(payload.new)
    )
    .subscribe();

  return channel;
}
