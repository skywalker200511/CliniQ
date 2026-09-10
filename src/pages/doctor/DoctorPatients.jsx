import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../data/store';
import { searchPatients, calculateAge } from '../../services/patientService';
import SearchInput from '../../components/shared/SearchInput';
import EmptyState from '../../components/shared/EmptyState';
import Modal from '../../components/shared/Modal';
import ReportList from '../../components/shared/ReportList';
import './DoctorPatients.css';

export default function DoctorPatients() {
  const { state } = useAppContext();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [patients, setPatients] = useState([]);
  const [reportsPatient, setReportsPatient] = useState(null);
  
  useEffect(() => {
    const fetchPatients = async () => {
      const results = await searchPatients(searchQuery);
      setPatients(results);
    };
    
    const timeoutId = setTimeout(() => {
      fetchPatients();
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleStartConsultation = (patientId) => {
    navigate(`/doctor/consultation/${patientId}`);
  };

  return (
    <div className="doctor-patients">
      <div className="page-header">
        <div>
          <h1 className="text-display">Clinical Directory</h1>
          <p className="text-body-lg" style={{ color: 'var(--on-surface-variant)' }}>
            Access complete medical records and patient history.
          </p>
        </div>
      </div>

      <div className="directory-container">
        <div className="directory-toolbar">
          <div className="search-container">
            <SearchInput 
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by Patient Name, MRN, or Phone Number"
              shortcut="⌘K"
              autoFocus={true}
            />
          </div>
        </div>

        <div className="directory-table-wrapper">
          <table className="directory-table">
            <thead>
              <tr>
                <th>Patient ID / MRN</th>
                <th>Patient Details</th>
                <th>Demographics</th>
                <th>Last Visit</th>
                <th>Alerts</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.length > 0 ? (
                patients.map(patient => (
                  <tr key={patient.id}>
                    <td className="font-mono font-bold text-primary">{patient.id}</td>
                    <td>
                      <div className="patient-name-cell">
                        <div className="text-label-md">{patient.fullName}</div>
                      </div>
                    </td>
                    <td>
                      <div className="demographics-cell">
                        <span className="demographic-pill">{patient.gender}</span>
                        <span className="demographic-pill">{calculateAge(patient.dateOfBirth)} yrs</span>
                        <span className="demographic-pill border">{patient.bloodGroup || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="text-body-sm">
                      {patient.lastVisitDate ? new Date(patient.lastVisitDate).toLocaleDateString() : 'New Patient'}
                    </td>
                    <td>
                      {patient.allergies && patient.allergies !== 'None' ? (
                        <span className="medical-alert-pill">
                          <span className="material-symbols-outlined">warning</span> Allergy
                        </span>
                      ) : (
                        <span className="text-body-sm" style={{ color: 'var(--outline)' }}>None</span>
                      )}
                    </td>
                    <td className="text-right actions-cell">
                      <button 
                        className="btn btn-outline" 
                        style={{ height: '32px', padding: '0 12px', fontSize: '13px', marginRight: '6px' }}
                        onClick={() => setReportsPatient(patient)}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>folder_shared</span> 
                        Reports
                      </button>
                      <button 
                        className="btn btn-primary" 
                        style={{ height: '32px', padding: '0 12px', fontSize: '13px' }}
                        onClick={() => handleStartConsultation(patient.id)}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>edit_note</span> 
                        New Case
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="empty-cell">
                    <EmptyState 
                      icon="person_search"
                      title="No matching patients found"
                      description={`We couldn't find any patient matching "${searchQuery}".`}
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Patient Reports Modal */}
      <Modal
        isOpen={!!reportsPatient}
        onClose={() => setReportsPatient(null)}
        title={`Reports — ${reportsPatient?.fullName || 'Patient'}`}
        icon="folder_shared"
        size="lg"
      >
        {reportsPatient && (
          <ReportList patientId={reportsPatient.id} patientName={reportsPatient.fullName} source={reportsPatient.source || 'clinic'} />
        )}
      </Modal>
    </div>
  );
}
