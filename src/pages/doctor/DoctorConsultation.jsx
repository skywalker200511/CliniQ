import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../data/store';
import { searchPatients, calculateAge } from '../../services/patientService';
import { createConsultation } from '../../services/consultationService';
import { completeQueueEntry } from '../../services/queueService';
import StatusBadge from '../../components/shared/StatusBadge';
import './DoctorConsultation.css';

// We will build these sections in Phase 7
import VitalsSection from './sections/VitalsSection';
import SymptomsSection from './sections/SymptomsSection';
import DiagnosisSection from './sections/DiagnosisSection';
import PrescriptionSection from './sections/PrescriptionSection';
import NotesSection from './sections/NotesSection';
import AdviceSection from './sections/AdviceSection';
export default function DoctorConsultation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, dispatch, showToast } = useAppContext();
  
  const [patient, setPatient] = useState(null);
  const [consultationId, setConsultationId] = useState(null);
  const [activeTab, setActiveTab] = useState('clinical');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [vitals, setVitals] = useState({
    bp: '', hr: '', temp: '', resp: '', spo2: '', weight: '', height: ''
  });
  const [symptoms, setSymptoms] = useState([]);
  const [diagnosis, setDiagnosis] = useState({
    primary: '', secondary: [], status: 'Preliminary'
  });
  const [prescriptions, setPrescriptions] = useState([]);
  const [notes, setNotes] = useState('');
  const [advice, setAdvice] = useState({ text: '', labTests: '', followUpDays: '' });

  useEffect(() => {
    // Find patient and init consultation
    const found = searchPatients(state, id);
    if (found.length > 0) {
      setPatient(found[0]);
      // Note: In a real app we'd fetch an existing draft or create a new one
      const newConsultation = createConsultation(dispatch, {
        patientId: found[0].id,
        doctorId: state.currentUser?.id || 'doc-001'
      });
      setConsultationId(newConsultation.id);
    } else {
      showToast('Patient not found', 'error');
      navigate('/doctor/queue');
    }
  }, [id, state, dispatch, navigate, showToast]);

  const handleSaveDraft = () => {
    showToast('Draft saved successfully', 'success');
  };

  const handleCompleteConsultation = () => {
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      completeQueueEntry(dispatch, state, id);
      showToast('Consultation completed and saved to EHR', 'success');
      navigate('/doctor/queue');
    }, 800);
  };

  if (!patient) return <div className="loading">Loading patient data...</div>;

  return (
    <div className="doctor-consultation">
      {/* Patient Header Banner */}
      <div className="patient-banner">
        <div className="banner-left">
          <div className="patient-avatar-large">
            {patient.fullName.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="patient-details">
            <h1 className="text-display">{patient.fullName}</h1>
            <div className="demographics-row">
              <span className="text-label-md">{patient.id}</span>
              <span className="divider">•</span>
              <span className="text-body-md">{patient.gender}, {calculateAge(patient.dateOfBirth)} yrs</span>
              <span className="divider">•</span>
              <span className="text-body-md">Blood: {patient.bloodGroup || 'Unknown'}</span>
            </div>
            
            <div className="alerts-row mt-sm">
              {patient.allergies && patient.allergies !== 'None' && (
                <span className="medical-alert-pill">
                  <span className="material-symbols-outlined">warning</span> Allergy: {patient.allergies}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="banner-right">
          <div className="status-box">
            <span className="text-label-sm" style={{ color: 'var(--on-surface-variant)' }}>Consultation Status</span>
            <StatusBadge status="In Progress" type="primary" />
            <div className="timer mt-sm text-mono">00:15:32</div>
          </div>
          <div className="banner-actions">
            <button className="btn btn-outline" onClick={handleSaveDraft}>
              <span className="material-symbols-outlined">save</span> Save Draft
            </button>
            <button className="btn btn-primary" onClick={handleCompleteConsultation} disabled={isSubmitting}>
              <span className="material-symbols-outlined">check_circle</span> Complete Case
            </button>
          </div>
        </div>
      </div>

      <div className="consultation-layout">
        <div className="main-content">
          <div className="form-tabs">
            <button 
              className={`tab ${activeTab === 'clinical' ? 'active' : ''}`}
              onClick={() => setActiveTab('clinical')}
            >
              Clinical Examination
            </button>
            <button 
              className={`tab ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              Past History
            </button>
            <button 
              className={`tab ${activeTab === 'documents' ? 'active' : ''}`}
              onClick={() => setActiveTab('documents')}
            >
              Lab & Documents
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'clinical' && (
              <div className="clinical-sections">
                <VitalsSection vitals={vitals} setVitals={setVitals} />
                <SymptomsSection symptoms={symptoms} setSymptoms={setSymptoms} />
                <DiagnosisSection diagnosis={diagnosis} setDiagnosis={setDiagnosis} />
                <PrescriptionSection prescriptions={prescriptions} setPrescriptions={setPrescriptions} />
                <NotesSection notes={notes} setNotes={setNotes} />
                <AdviceSection advice={advice} setAdvice={setAdvice} />
              </div>
            )}
            
            {activeTab === 'history' && (
              <div className="placeholder-tab">
                <span className="material-symbols-outlined">history</span>
                <h3>No Past History Found</h3>
                <p>This is the first visit for this patient.</p>
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="placeholder-tab">
                <span className="material-symbols-outlined">folder</span>
                <h3>No Documents Uploaded</h3>
                <p>Upload lab reports, scans, or previous prescriptions.</p>
                <button className="btn btn-outline mt-md">Upload Document</button>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - Reference Info */}
        <div className="reference-sidebar">
          <div className="reference-card" style={{ marginBottom: '16px' }}>
            <div className="card-header border-bottom">
              <h3 className="text-label-md">Past Medical History</h3>
            </div>
            <div className="card-body">
              <div className="history-item" style={{ marginBottom: '12px' }}>
                <span className="text-label-sm label" style={{ display: 'block', color: 'var(--on-surface-variant)' }}>Chronic Conditions</span>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' }}>
                  <span className="demographic-pill warning">Hypertension</span>
                  <span className="demographic-pill">Asthma (Childhood)</span>
                </div>
              </div>
              <div className="history-item">
                <span className="text-label-sm label" style={{ display: 'block', color: 'var(--on-surface-variant)' }}>Previous Visits</span>
                <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ padding: '8px', background: 'var(--surface-container-low)', borderRadius: '6px' }}>
                    <div className="text-label-sm">12 Aug 2023</div>
                    <div className="text-body-sm">Viral Fever (Paracetamol)</div>
                  </div>
                  <div style={{ padding: '8px', background: 'var(--surface-container-low)', borderRadius: '6px' }}>
                    <div className="text-label-sm">05 Jan 2023</div>
                    <div className="text-body-sm">Routine Checkup (BP Normal)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="reference-card">
            <div className="card-header border-bottom">
              <h3 className="text-label-md">Patient Context</h3>
            </div>
            <div className="card-body">
              <div className="context-item">
                <span className="text-label-sm label">Registered at</span>
                <span className="text-body-sm value">{new Date().toLocaleTimeString()}</span>
              </div>
              <div className="context-item">
                <span className="text-label-sm label">Wait time</span>
                <span className="text-body-sm value">15 mins</span>
              </div>
              <div className="context-item">
                <span className="text-label-sm label">Contact</span>
                <span className="text-body-sm value">{patient.phone}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
