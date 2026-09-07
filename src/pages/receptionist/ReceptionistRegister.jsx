import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../data/store';
import { createPatient } from '../../services/patientService';
import { addToQueue } from '../../services/queueService';
import { BLOOD_GROUPS, GENDER_OPTIONS } from '../../data/models';
import Modal from '../../components/shared/Modal';
import './ReceptionistRegister.css';

export default function ReceptionistRegister() {
  const { state, dispatch, showToast } = useAppContext();
  const navigate = useNavigate();
  const todayCount = state.patients.filter(p => p.registeredAt.startsWith(new Date().toISOString().split('T')[0])).length + 28; // using +28 as a base to match mockup

  const initialFormState = {
    fullName: '',
    dateOfBirth: '',
    gender: 'Male',
    phone: '',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    bloodGroup: 'Unknown',
    allergies: '',
    noAllergies: false,
  };

  const [formData, setFormData] = useState(initialFormState);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [newPatientId, setNewPatientId] = useState('');

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleBloodGroupSelect = (bg) => {
    setFormData(prev => ({ ...prev, bloodGroup: bg }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.fullName || !formData.dateOfBirth || !formData.phone) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    const patientData = {
      fullName: formData.fullName,
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender,
      phone: formData.phone,
      address: formData.address,
      emergencyContactName: formData.emergencyContactName,
      emergencyContactPhone: formData.emergencyContactPhone,
      bloodGroup: formData.bloodGroup,
      allergies: formData.noAllergies ? 'None' : formData.allergies,
      registeredBy: state.currentUser?.id || 'rec-001'
    };

    const newPatient = createPatient(dispatch, patientData);
    setNewPatientId(newPatient.id);
    setShowSuccessModal(true);
    showToast('Patient registered successfully');
  };

  const handleAddToQueue = () => {
    addToQueue(dispatch, state, {
      patientId: newPatientId,
      patientName: formData.fullName,
      patientMrn: newPatientId,
      doctorId: 'doc-001'
    });
    showToast(`${formData.fullName} added to queue`);
    navigate('/receptionist/queue');
  };

  const handleRegisterAnother = () => {
    setFormData(initialFormState);
    setShowSuccessModal(false);
    setNewPatientId('');
  };

  return (
    <div className="receptionist-register">
      <div className="register-main-content">
        <div className="page-header">
          <div className="terminal-badge">
            <span className="status-dot green"></span>
            STATION 01 ACTIVE • Front Counter Desk
            <span className="divider">|</span>
            Queue load: {state.queue.filter(q => q.status === 'Waiting').length} Waiting • Avg Check-in speed: 1m 40s
          </div>
          <div className="header-actions">
            <span className="shortcut-hint">Keyboard Shortcut: Alt + R</span>
            <button className="btn btn-outline" onClick={() => setFormData(initialFormState)}>
              <span className="material-symbols-outlined">refresh</span> Clear Form
            </button>
          </div>
        </div>

        <div className="page-title-section">
          <span className="intake-badge">INTAKE RECEPTION</span>
          <span className="terminal-id">Terminal ID: CT-MAIN-D1</span>
          <h1 className="text-display">Register New Patient</h1>
          <p className="text-body-lg" style={{ color: 'var(--on-surface-variant)' }}>
            Enter basic identity and contact details for patient intake. Clinical documentation is handled by physicians.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          {/* Section 1: Basic Information */}
          <div className="form-section">
            <div className="section-header">
              <div className="section-number">1</div>
              <div className="section-title">
                <h2 className="text-headline-sm">Basic Information</h2>
                <p className="text-body-sm">Mandatory identity fields for new record creation</p>
              </div>
              <span className="required-badge">Required</span>
            </div>

            <div className="form-grid">
              <div className="form-group full-width">
                <label className="text-label-md">Full Name <span className="text-error">*</span></label>
                <div className="input-with-hint">
                  <div className="input-wrapper">
                    <span className="material-symbols-outlined input-icon">badge</span>
                    <input 
                      type="text" 
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="e.g. Rahul Sharma"
                      required
                    />
                  </div>
                  <span className="input-hint">As per legal photo ID</span>
                </div>
              </div>

              <div className="form-group">
                <label className="text-label-md">Date of Birth <span className="text-error">*</span></label>
                <div className="input-wrapper">
                  <span className="material-symbols-outlined input-icon">calendar_today</span>
                  <input 
                    type="date" 
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="text-label-md">Gender Identity <span className="text-error">*</span></label>
                <div className="gender-chips">
                  {GENDER_OPTIONS.map(gender => (
                    <button
                      key={gender}
                      type="button"
                      className={`chip ${formData.gender === gender ? 'active' : ''}`}
                      onClick={() => setFormData(prev => ({ ...prev, gender }))}
                    >
                      {gender}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group full-width">
                <label className="text-label-md">Primary Phone Number <span className="text-error">*</span></label>
                <div className="input-with-hint">
                  <div className="phone-input-group">
                    <div className="country-code">
                      <span className="material-symbols-outlined">public</span> +91
                    </div>
                    <div className="input-wrapper phone-wrapper">
                      <span className="material-symbols-outlined input-icon">call</span>
                      <input 
                        type="tel" 
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="98765 43210"
                        required
                      />
                    </div>
                  </div>
                  <span className="input-hint">SMS queue alerts will be sent here</span>
                </div>
              </div>

              <div className="form-group full-width">
                <label className="text-label-md">Residential Street Address</label>
                <div className="input-wrapper">
                  <span className="material-symbols-outlined input-icon">location_on</span>
                  <input 
                    type="text" 
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Flat / House no, Building name, Local Street, Postal Code"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="text-label-md">Emergency Contact Person</label>
                <div className="input-wrapper">
                  <span className="material-symbols-outlined input-icon">contact_emergency</span>
                  <input 
                    type="text" 
                    name="emergencyContactName"
                    value={formData.emergencyContactName}
                    onChange={handleInputChange}
                    placeholder="e.g. Priya Sharma (Spouse/Parent)"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="text-label-md">Emergency Phone</label>
                <div className="input-wrapper">
                  <span className="material-symbols-outlined input-icon">phone_in_talk</span>
                  <input 
                    type="tel" 
                    name="emergencyContactPhone"
                    value={formData.emergencyContactPhone}
                    onChange={handleInputChange}
                    placeholder="+91 91234 56789"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Optional Information */}
          <div className="form-section">
            <div className="section-header">
              <div className="section-number disabled">2</div>
              <div className="section-title">
                <h2 className="text-headline-sm">Optional Intake Information</h2>
                <p className="text-body-sm">Non-clinical baseline declarations for administrative identification</p>
              </div>
              <span className="optional-badge">Optional</span>
            </div>

            <div className="form-grid">
              <div className="form-group full-width">
                <div className="label-with-hint">
                  <label className="text-label-md">Reported Blood Group</label>
                  <span className="input-hint">Self-reported by patient</span>
                </div>
                <div className="blood-group-chips">
                  {BLOOD_GROUPS.map(bg => (
                    <button
                      key={bg}
                      type="button"
                      className={`blood-chip ${formData.bloodGroup === bg ? 'active' : ''}`}
                      onClick={() => handleBloodGroupSelect(bg)}
                    >
                      {bg}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group full-width">
                <div className="label-with-hint">
                  <label className="text-label-md">Known Drug or Food Allergies</label>
                  <label className="checkbox-label">
                    <input 
                      type="checkbox" 
                      name="noAllergies"
                      checked={formData.noAllergies}
                      onChange={handleInputChange}
                    />
                    <span className="text-body-sm">None known at check-in</span>
                  </label>
                </div>
                <div className={`input-wrapper ${formData.noAllergies ? 'disabled' : ''}`}>
                  <span className="material-symbols-outlined input-icon">warning</span>
                  <input 
                    type="text" 
                    name="allergies"
                    value={formData.allergies}
                    onChange={handleInputChange}
                    placeholder="e.g. Penicillin, Peanuts, Latex, Sulfa drugs"
                    disabled={formData.noAllergies}
                  />
                </div>
                <p className="field-note text-body-sm">Physician will conduct clinical validation and full vitals upon examination.</p>
              </div>
            </div>
          </div>

          <div className="system-allocation-banner">
            <span className="material-symbols-outlined">verified_user</span>
            <div>
              <div className="text-label-md">System Identifier Allocation</div>
              <div className="text-body-sm">Auto-assignment will generate standard clinical identifier format <strong>PT-2024-XXXX</strong> upon registration. Patient MRN will sync instantly across reception, triage monitors, and consultation chambers.</div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-outline btn-lg" onClick={() => setFormData(initialFormState)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-lg">
              <span className="material-symbols-outlined">person_add</span> Register Patient
            </button>
          </div>
        </form>
      </div>

      <div className="register-sidebar">
        <button className="search-directory-btn" onClick={() => navigate('/receptionist/patients')}>
          <div className="search-btn-content">
            <span className="material-symbols-outlined">search</span>
            <span className="text-label-md">Existing Patient? Search Directory instead</span>
          </div>
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>

        <div className="guidelines-card">
          <div className="guidelines-img">
            {/* Placeholder for clinic image */}
            <div className="img-overlay">
              <span className="protocol-badge">Front Desk Protocol</span>
              <span className="version-badge">v4.2 Active</span>
            </div>
          </div>
          <div className="guidelines-content">
            <h3 className="text-headline-sm mb-md">Receptionist Guidelines</h3>
            <ul className="guidelines-list text-body-sm">
              <li>
                <span className="material-symbols-outlined list-icon">check_circle</span>
                <span>Confirm government-issued photo ID matches patient spelling.</span>
              </li>
              <li>
                <span className="material-symbols-outlined list-icon">check_circle</span>
                <span>Ensure mobile number is verified for digital SMS queue updates.</span>
              </li>
              <li>
                <span className="material-symbols-outlined list-icon">lock</span>
                <span>Never record diagnoses, vitals, or clinical notes at this terminal.</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="chambers-card">
          <div className="chambers-header">
            <div className="chambers-title">
              <span className="material-symbols-outlined">meeting_room</span>
              <h3 className="text-label-md">Doctor Chambers</h3>
            </div>
            <span className="chambers-count">3 On Duty</span>
          </div>

          <div className="chamber-list">
            <div className="chamber-item">
              <div className="chamber-avatar busy">101</div>
              <div className="chamber-info">
                <div className="text-label-md">Dr. Sarah Jenkins</div>
                <div className="text-body-sm">General Medicine • In Consult</div>
              </div>
              <span className="status-pill-small busy">Busy</span>
            </div>
            
            <div className="chamber-item">
              <div className="chamber-avatar available">102</div>
              <div className="chamber-info">
                <div className="text-label-md">Dr. Marcus Lee</div>
                <div className="text-body-sm">Cardiology • Ready for patient</div>
              </div>
              <span className="status-pill-small available">Available</span>
            </div>
            
            <div className="chamber-item">
              <div className="chamber-avatar break">103</div>
              <div className="chamber-info">
                <div className="text-label-md">Dr. Anita Roy</div>
                <div className="text-body-sm">Pediatrics • Rounding in 15m</div>
              </div>
              <span className="status-pill-small break">Break</span>
            </div>
          </div>
        </div>

        <div className="metrics-card">
          <div className="metrics-title text-label-sm">TODAY'S TOTAL REGISTRATIONS</div>
          <div className="metrics-value-row">
            <div className="metrics-number">{todayCount}</div>
            <div className="metrics-trend">
              <span className="material-symbols-outlined">trending_up</span>
            </div>
          </div>
          <div className="metrics-desc text-body-sm">
            {state.queue.length} queued • 6 scheduled for afternoon
          </div>
        </div>
      </div>

      <Modal 
        isOpen={showSuccessModal} 
        onClose={handleRegisterAnother}
        title="Patient Registered Successfully"
        icon="check_circle"
      >
        <div className="success-modal-content text-center">
          <div className="success-icon-large">
            <span className="material-symbols-outlined">how_to_reg</span>
          </div>
          
          <h2 className="text-headline-md">{formData.fullName}</h2>
          <div className="generated-mrn">{newPatientId}</div>
          
          <p className="text-body-md mt-md">
            The patient profile has been created and synced with the clinical database.
          </p>
          
          <div className="modal-actions mt-xl">
            <button className="btn btn-outline btn-full" onClick={handleRegisterAnother}>
              <span className="material-symbols-outlined">person_add</span> Register Another
            </button>
            <button className="btn btn-primary btn-full" onClick={handleAddToQueue}>
              <span className="material-symbols-outlined">format_list_bulleted_add</span> Add to Queue
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
