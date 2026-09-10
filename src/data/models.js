/**
 * Cliniq Data Models
 * JSDoc type definitions for the application data layer.
 * These serve as documentation and can be used for validation.
 */

/**
 * @typedef {Object} Patient
 * @property {string} id - Unique patient ID (e.g. "PT-2024-8842")
 * @property {string} fullName
 * @property {string} dateOfBirth - ISO date string
 * @property {string} gender - "Male" | "Female" | "Other" | "Not Specified"
 * @property {string} phone
 * @property {string} [address]
 * @property {string} [emergencyContactName]
 * @property {string} [emergencyContactPhone]
 * @property {string} [bloodGroup] - "A+" | "A-" | "B+" | "B-" | "O+" | "O-" | "AB+" | "AB-" | "Unknown"
 * @property {string} [allergies]
 * @property {string} registeredAt - ISO datetime string
 * @property {string} registeredBy - User ID of receptionist
 * @property {string} [lastVisitDate] - ISO date string
 */

/**
 * @typedef {Object} Consultation
 * @property {string} id
 * @property {string} patientId
 * @property {string} doctorId
 * @property {string} chiefComplaint
 * @property {string[]} additionalComplaints
 * @property {string[]} symptoms - Active symptom names
 * @property {Object<string, SymptomDetail>} symptomDetails
 * @property {MedicalHistory} medicalHistory
 * @property {VitalSigns} vitalSigns
 * @property {ClinicalExamination} clinicalExamination
 * @property {string} diagnosis
 * @property {string} [diagnosisCode] - ICD-10 code
 * @property {string} [secondaryDiagnosis]
 * @property {string} treatmentPlan
 * @property {string[]} quickInclusions
 * @property {string[]} documents - File references
 * @property {"draft" | "active" | "completed"} status
 * @property {string} startedAt - ISO datetime
 * @property {string} [completedAt] - ISO datetime
 * @property {string} [lastSavedAt] - ISO datetime
 */

/**
 * @typedef {Object} SymptomDetail
 * @property {string} duration
 * @property {string} severity
 * @property {string} frequency
 * @property {string} notes
 */

/**
 * @typedef {Object} MedicalHistory
 * @property {string[]} conditions - e.g. ["CAD", "Thyroid"]
 * @property {string} familyHistory
 * @property {string} surgicalHistory
 * @property {string[]} knownAllergies
 * @property {Medication[]} currentMedications
 */

/**
 * @typedef {Object} Medication
 * @property {string} name
 * @property {string} dosage
 * @property {string} route
 * @property {string} frequency
 * @property {boolean} compliant
 */

/**
 * @typedef {Object} VitalSigns
 * @property {number} [bodyTemp]
 * @property {string} [bodyTempUnit] - "°F" | "°C"
 * @property {string} [bodyTempStatus]
 * @property {string} [bloodPressure]
 * @property {string} [bpStatus]
 * @property {number} [pulseRate]
 * @property {string} [pulseStatus]
 * @property {number} [oxygenSaturation]
 * @property {string} [o2Status]
 * @property {number} [weight]
 * @property {string} [weightNote]
 * @property {number} [height]
 * @property {string} [bmi]
 */

/**
 * @typedef {Object} ClinicalExamination
 * @property {string[]} findings - Active finding tags
 * @property {string} notes
 */

/**
 * @typedef {Object} QueueEntry
 * @property {string} id
 * @property {string} patientId
 * @property {string} patientName
 * @property {string} patientMrn - Patient ID / MRN
 * @property {string} initials
 * @property {string} doctorId
 * @property {string} queueNumber - e.g. "01"
 * @property {"Waiting" | "With Doctor" | "Completed"} status
 * @property {string} arrivalTime
 * @property {string} appointmentTime
 * @property {string} [calledAt]
 * @property {string} [completedAt]
 */

/**
 * @typedef {Object} Message
 * @property {string} id
 * @property {string} senderId
 * @property {"doctor" | "receptionist"} senderRole
 * @property {string} senderName
 * @property {string} receiverId
 * @property {"doctor" | "receptionist"} receiverRole
 * @property {string} content
 * @property {string} timestamp - ISO datetime
 * @property {boolean} read
 */

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} fullName
 * @property {string} initials
 * @property {"doctor" | "receptionist"} role
 * @property {string} [department]
 * @property {string} [roomNumber]
 * @property {string} [title] - e.g. "MD", "Senior Physician"
 */

export const PATIENT_ID_PREFIX = 'PT-2024';
export const SYMPTOMS_LIST = [
  'Fever', 'Cough', 'Headache', 'Fatigue', 'Pain', 'Nausea',
  'Vomiting', 'Dizziness', 'Breathing Difficulty'
];
export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-', 'Unknown'];
export const GENDER_OPTIONS = ['Male', 'Female', 'Other', 'Not Specified'];
export const MEDICAL_CONDITIONS = ['CAD', 'Thyroid', 'Diabetes', 'Hypertension', 'Asthma', 'COPD'];
export const EXAMINATION_FINDINGS = [
  'Normal General Exam', 'Abnormal Findings', 'Tenderness: Occipital',
  'Swelling: Absent', 'Pharyngeal Redness'
];
export const SEVERITY_OPTIONS = ['Mild (2/10)', 'Moderate (5/10)', 'Moderate (6/10)', 'Severe (8/10)', 'Very Severe (9/10)'];
export const DURATION_OPTIONS = ['Today', '1 Day', '2 Days', '3 Days', '5 Days', '1 Week', '2 Weeks', '1 Month'];
export const FREQUENCY_OPTIONS = ['Constant', 'Intermittent', 'Occasional', 'Periodic', 'First Episode'];
