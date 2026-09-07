/**
 * Consultation Service — Data access layer for clinical case-taking.
 */
import { ACTIONS } from '../data/store';

/** Create a new consultation session */
export function createConsultation(dispatch, { patientId, doctorId }) {
  const consultation = {
    id: `consult-${Date.now()}`,
    patientId,
    doctorId,
    chiefComplaint: '',
    additionalComplaints: [],
    symptoms: [],
    symptomDetails: {},
    medicalHistory: {
      conditions: [],
      familyHistory: '',
      surgicalHistory: 'None reported',
      knownAllergies: [],
      currentMedications: [],
    },
    vitalSigns: {
      bodyTemp: null,
      bodyTempUnit: '°F',
      bodyTempStatus: '',
      bloodPressure: '',
      bpStatus: '',
      pulseRate: null,
      pulseStatus: '',
      oxygenSaturation: null,
      o2Status: '',
      weight: null,
      weightNote: '',
      height: null,
      bmi: '',
    },
    clinicalExamination: { findings: [], notes: '' },
    diagnosis: '',
    diagnosisCode: '',
    secondaryDiagnosis: '',
    treatmentPlan: '',
    quickInclusions: [],
    documents: [],
    status: 'active',
    startedAt: new Date().toISOString(),
    completedAt: null,
    lastSavedAt: null,
  };

  dispatch({ type: ACTIONS.ADD_CONSULTATION, payload: consultation });
  return consultation;
}

/** Get a specific consultation by ID */
export function getConsultation(state, consultationId) {
  return state.consultations.find(c => c.id === consultationId) || null;
}

/** Get consultations for a specific patient */
export function getPatientConsultations(state, patientId) {
  return state.consultations.filter(c => c.patientId === patientId);
}

/** Update a consultation */
export function updateConsultation(dispatch, consultationId, updates) {
  dispatch({
    type: ACTIONS.UPDATE_CONSULTATION,
    payload: { id: consultationId, ...updates, lastSavedAt: new Date().toISOString() },
  });
}

/** Save a consultation draft */
export function saveDraft(dispatch, consultationId, data) {
  dispatch({
    type: ACTIONS.UPDATE_CONSULTATION,
    payload: { id: consultationId, ...data, status: 'draft', lastSavedAt: new Date().toISOString() },
  });
}

/** Complete a consultation */
export function completeConsultation(dispatch, consultationId, data) {
  dispatch({
    type: ACTIONS.UPDATE_CONSULTATION,
    payload: {
      id: consultationId,
      ...data,
      status: 'completed',
      completedAt: new Date().toISOString(),
      lastSavedAt: new Date().toISOString(),
    },
  });
}

/** Get all consultations */
export function getAllConsultations(state) {
  return state.consultations;
}
