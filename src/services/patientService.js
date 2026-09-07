/**
 * Patient Service — Data access layer for patient records.
 * Currently uses the React Context store with mock data.
 * Replace internals with API calls when database is available.
 */
import { ACTIONS } from '../data/store';
import { PATIENT_ID_PREFIX } from '../data/models';

/** Generate a unique patient ID in format PT-2024-XXXX */
function generatePatientId() {
  const code = Math.floor(1000 + Math.random() * 9000);
  return `${PATIENT_ID_PREFIX}-${code}`;
}

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

/** Create a new patient record */
export function createPatient(dispatch, patientData) {
  const patient = {
    ...patientData,
    id: generatePatientId(),
    registeredAt: new Date().toISOString(),
    lastVisitDate: null,
  };
  dispatch({ type: ACTIONS.ADD_PATIENT, payload: patient });
  return patient;
}

/** Get a single patient by ID */
export function getPatient(state, patientId) {
  return state.patients.find(p => p.id === patientId) || null;
}

/** Search patients by name, ID, or phone */
export function searchPatients(state, query) {
  if (!query || query.length < 2) return state.patients;
  const q = query.toLowerCase().trim();
  return state.patients.filter(p =>
    p.fullName.toLowerCase().includes(q) ||
    p.id.toLowerCase().includes(q) ||
    p.phone.includes(q)
  );
}

/** Get all patients */
export function getAllPatients(state) {
  return state.patients;
}

/** Update an existing patient record */
export function updatePatient(dispatch, patientId, updates) {
  dispatch({ type: ACTIONS.UPDATE_PATIENT, payload: { id: patientId, ...updates } });
}
