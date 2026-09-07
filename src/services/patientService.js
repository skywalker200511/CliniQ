import { ACTIONS } from '../data/store';
import { PATIENT_ID_PREFIX } from '../data/models';
import { supabase } from '../lib/supabase';

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

/** Create a new patient record in Supabase */
export async function createPatient(dispatch, patientData) {
  try {
    // Map React form state (camelCase) to Supabase columns (snake_case)
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

    // Map Supabase response back to our frontend model format
    const newPatient = {
      id: data.patient_id,
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

/** Get all patients from Supabase */
export async function getAllPatients(dispatch) {
  try {
    const { data, error } = await supabase.from('patients').select('*');
    if (error) throw error;
    
    const patients = data.map(p => ({
      id: p.patient_id,
      fullName: p.first_name + ' ' + p.last_name,
      dateOfBirth: p.date_of_birth,
      gender: p.gender,
      phone: p.phone_number,
      bloodGroup: p.blood_group,
      address: p.address,
      emergencyContactName: p.emergency_contact_name,
      emergencyContactPhone: p.emergency_contact_phone,
      allergies: p.allergies.length > 0 ? p.allergies.join(', ') : 'None',
      registeredAt: p.created_at,
      lastVisitDate: null,
    }));
    
    // Depending on your store structure, you might want to dispatch an action to SET_PATIENTS here.
    return patients;
  } catch (error) {
    console.error('Error fetching patients:', error);
    return [];
  }
}

