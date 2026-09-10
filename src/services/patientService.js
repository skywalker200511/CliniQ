import { ACTIONS } from '../data/store';
import { PATIENT_ID_PREFIX } from '../data/models';
import { supabase } from '../lib/supabase';
import { patientModuleSupabase } from '../lib/patientModuleSupabase';

/** Calculate age from date of birth string */
export function calculateAge(dob) {
  if (!dob) return '';
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

/** Get patient initials from full name */
export function getInitials(name) {
  if (!name) return '??';
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

/** Normalize phone: strip spaces, +91, dashes — keep last 10 digits */
function normalizePhone(phone) {
  return (phone || '').replace(/[\s\-\+]/g, '').slice(-10);
}

/**
 * Map a patient row from the PATIENT MODULE's DB to our unified format.
 * Source: "pm" (patient module)
 */
function mapPatientModuleRow(p) {
  const nameParts = (p.full_name || '').trim().split(' ');
  return {
    id: p.id,
    source: 'patient_module',
    fullName: p.full_name || 'Unknown',
    dateOfBirth: p.date_of_birth,
    gender: p.gender,
    phone: p.phone,
    bloodGroup: p.blood_group || 'Unknown',
    address: [p.address, p.city, p.state, p.pincode].filter(Boolean).join(', '),
    emergencyContactName: p.emergency_contact_name,
    emergencyContactPhone: p.emergency_contact_phone,
    allergies: p.allergies || 'None',
    medicalConditions: p.medical_conditions || '',
    medications: p.medications || '',
    surgeries: p.surgeries || '',
    registeredAt: p.created_at,
    lastVisitDate: null,
    email: p.email,
    mrnId: p.patient_id_mrn,
  };
}

/**
 * Map a patient row from the CLINIC's DB to our unified format.
 * Source: "clinic"
 */
function mapClinicRow(p) {
  return {
    id: p.patient_id,
    source: 'clinic',
    fullName: p.first_name + ' ' + p.last_name,
    dateOfBirth: p.date_of_birth,
    gender: p.gender,
    phone: p.phone_number,
    bloodGroup: p.blood_group,
    address: p.address,
    emergencyContactName: p.emergency_contact_name,
    emergencyContactPhone: p.emergency_contact_phone,
    allergies: p.allergies && p.allergies.length > 0 ? p.allergies.join(', ') : 'None',
    medicalConditions: p.chronic_conditions && p.chronic_conditions.length > 0 ? p.chronic_conditions.join(', ') : '',
    medications: '',
    surgeries: '',
    registeredAt: p.created_at,
    lastVisitDate: null,
  };
}

/**
 * Merge patients from both databases, deduplicating by phone number.
 * Clinic patients take priority, but we enrich them with medical history 
 * from the patient module if a match is found.
 */
function mergePatients(clinicPatients, pmPatients) {
  const mergedMap = new Map();

  // Add all clinic patients first
  for (const p of clinicPatients) {
    const phone = normalizePhone(p.phone);
    if (phone.length >= 10) {
      mergedMap.set(phone, { ...p });
    } else {
      mergedMap.set(p.id, { ...p });
    }
  }

  // Add or enrich with patient-module patients
  for (const p of pmPatients) {
    const phone = normalizePhone(p.phone);
    if (phone.length >= 10 && mergedMap.has(phone)) {
      // Enrich existing clinic patient with patient module's medical data
      const existing = mergedMap.get(phone);
      if (!existing.medicalConditions && p.medicalConditions) existing.medicalConditions = p.medicalConditions;
      if (!existing.medications && p.medications) existing.medications = p.medications;
      if (!existing.surgeries && p.surgeries) existing.surgeries = p.surgeries;
      // Merge allergies if clinic didn't have any
      if (existing.allergies === 'None' && p.allergies !== 'None') existing.allergies = p.allergies;
    } else if (phone.length >= 10) {
      mergedMap.set(phone, { ...p });
    } else {
      mergedMap.set(p.id, { ...p });
    }
  }

  return Array.from(mergedMap.values());
}

/** Create a new patient record in Supabase (clinic DB) */
export async function createPatient(dispatch, patientData) {
  try {
    const fullNameParts = patientData.fullName.trim().split(' ');
    const firstName = fullNameParts[0];
    const lastName = fullNameParts.length > 1 ? fullNameParts.slice(1).join(' ') : '';

    const { data, error } = await supabase
      .from('patients')
      .insert([{
        first_name: firstName,
        last_name: lastName || 'Unknown',
        date_of_birth: patientData.dateOfBirth,
        gender: patientData.gender,
        blood_group: patientData.bloodGroup,
        phone_number: patientData.phone,
        address: patientData.address,
        emergency_contact_name: patientData.emergencyContactName,
        emergency_contact_phone: patientData.emergencyContactPhone,
        allergies: patientData.allergies === 'None' ? [] : [patientData.allergies],
        chronic_conditions: []
      }])
      .select()
      .single();

    if (error) throw error;

    const newPatient = {
      id: data.patient_id,
      source: 'clinic',
      fullName: data.first_name + ' ' + data.last_name,
      dateOfBirth: data.date_of_birth,
      gender: data.gender,
      phone: data.phone_number,
      bloodGroup: data.blood_group,
      address: data.address,
      emergencyContactName: data.emergency_contact_name,
      emergencyContactPhone: data.emergency_contact_phone,
      allergies: data.allergies.length > 0 ? data.allergies.join(', ') : 'None',
      registeredAt: data.created_at,
      lastVisitDate: null,
    };

    dispatch({ type: ACTIONS.ADD_PATIENT, payload: newPatient });
    return newPatient;
  } catch (error) {
    console.error('Error creating patient:', error);
    throw error;
  }
}

/** Delete a patient from BOTH databases */
export async function deletePatient(patient) {
  try {
    const phone = normalizePhone(patient.phone);
    
    // --- 1. Delete from Clinic DB ---
    let clinicId = patient.source === 'clinic' ? patient.id : null;
    if (!clinicId && phone) {
      const { data } = await supabase.from('patients').select('patient_id').ilike('phone_number', `%${phone}%`).maybeSingle();
      if (data) clinicId = data.patient_id;
    }

    if (clinicId) {
      // Delete their queue entries first
      const { error: eq } = await supabase.from('queue').delete().eq('patient_id', clinicId);
      if (eq) throw eq;
      // Delete their consultations
      const { error: ec } = await supabase.from('consultations').delete().eq('patient_id', clinicId);
      if (ec) throw ec;
      // Delete the patient
      const { error: ep } = await supabase.from('patients').delete().eq('patient_id', clinicId);
      if (ep) throw ep;
    }

    // --- 2. Delete from Patient Module DB ---
    let pmId = patient.source === 'patient_module' ? patient.id : null;
    if (!pmId && phone) {
      const { data } = await patientModuleSupabase.from('patients').select('id').ilike('phone', `%${phone}%`).maybeSingle();
      if (data) pmId = data.id;
    }

    if (pmId) {
      // Delete their reports
      const { error: pmr } = await patientModuleSupabase.from('patient_reports').delete().eq('patient_id', pmId);
      if (pmr) throw pmr;
      // Delete their medical history
      const { error: pmm } = await patientModuleSupabase.from('patient_medical_history').delete().eq('patient_id', pmId);
      if (pmm) throw pmm;
      // Delete the patient
      const { error: pmp } = await patientModuleSupabase.from('patients').delete().eq('id', pmId);
      if (pmp) throw pmp;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting patient:', error);
    throw error;
  }
}

/**
 * Get all patients from BOTH databases, merged and deduplicated.
 * Clinic patients come first, then patient-module-only patients.
 */
export async function getAllPatients(dispatch) {
  try {
    // Fetch from clinic DB
    const { data: clinicData, error: clinicError } = await supabase
      .from('patients').select('*');
    
    const clinicPatients = clinicError ? [] : (clinicData || []).map(mapClinicRow);

    // Fetch from patient module DB
    const { data: pmData, error: pmError } = await patientModuleSupabase
      .from('patients').select('*');
    
    const pmPatients = pmError ? [] : (pmData || []).map(mapPatientModuleRow);

    return mergePatients(clinicPatients, pmPatients);
  } catch (error) {
    console.error('Error fetching patients:', error);
    return [];
  }
}

/**
 * Search patients by name, ID, or phone across BOTH databases.
 * Results are merged and deduplicated by phone number.
 */
export async function searchPatients(query) {
  try {
    // --- Clinic DB ---
    let clinicQuery = supabase.from('patients').select('*');
    if (query && query.length >= 2) {
      const q = query.toLowerCase().trim();
      clinicQuery = clinicQuery.or(
        'first_name.ilike.%' + q + '%,last_name.ilike.%' + q + '%,phone_number.ilike.%' + q + '%,patient_id.eq.' + q
      );
    }
    const { data: clinicData, error: clinicError } = await clinicQuery;
    const clinicPatients = clinicError ? [] : (clinicData || []).map(mapClinicRow);

    // --- Patient Module DB ---
    let pmQuery = patientModuleSupabase.from('patients').select('*');
    if (query && query.length >= 2) {
      const q = query.toLowerCase().trim();
      pmQuery = pmQuery.or(
        'full_name.ilike.%' + q + '%,phone.ilike.%' + q + '%,patient_id_mrn.ilike.%' + q + '%,email.ilike.%' + q + '%'
      );
    }
    const { data: pmData, error: pmError } = await pmQuery;
    const pmPatients = pmError ? [] : (pmData || []).map(mapPatientModuleRow);

    return mergePatients(clinicPatients, pmPatients);
  } catch (error) {
    console.error('Error searching patients:', error);
    return [];
  }
}
