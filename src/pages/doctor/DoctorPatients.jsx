import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../data/store';
import { searchPatients, calculateAge } from '../../services/patientService';
import SearchInput from '../../components/shared/SearchInput';
import EmptyState from '../../components/shared/EmptyState';
import './DoctorPatients.css';

export default function DoctorPatients() {
  const { state } = useAppContext();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  
  const patients = searchPatients(state, searchQuery);

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
          <div className="filter-chips">
            <span className="filter-label text-label-sm">Quick Filters:</span>
            <button className="chip">My Patients</button>
            <button className="chip">Recent Consults</button>
            <button className="chip">Chronic Care</button>
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
                      <button className="btn btn-outline" style={{ height: '32px', padding: '0 12px', fontSize: '13px' }}>
                        View EHR
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
    </div>
  );
}
