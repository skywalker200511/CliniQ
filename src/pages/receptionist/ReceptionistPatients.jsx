import { useState } from 'react';
import { useAppContext } from '../../data/store';
import { searchPatients, calculateAge } from '../../services/patientService';
import { addToQueue } from '../../services/queueService';
import SearchInput from '../../components/shared/SearchInput';
import EmptyState from '../../components/shared/EmptyState';
import './ReceptionistPatients.css';

export default function ReceptionistPatients() {
  const { state, dispatch, showToast } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  
  const patients = searchPatients(state, searchQuery);

  const handleAddToQueue = (patient) => {
    addToQueue(dispatch, state, {
      patientId: patient.id,
      patientName: patient.fullName,
      patientMrn: patient.id,
    });
    showToast(`${patient.fullName} added to queue`);
  };

  const isPatientInQueue = (patientId) => {
    return state.queue.some(q => q.patientId === patientId && (q.status === 'Waiting' || q.status === 'With Doctor'));
  };

  return (
    <div className="receptionist-patients">
      <div className="page-header">
        <div>
          <h1 className="text-display">Patient Directory</h1>
          <p className="text-body-lg" style={{ color: 'var(--on-surface-variant)' }}>
            Search existing clinic records and manage patient profiles.
          </p>
        </div>
      </div>

      <div className="sop-banner">
        <span className="material-symbols-outlined">info</span>
        <div>
          <div className="text-label-md">SOP Reminder</div>
          <div className="text-body-sm">Always verify patient identity (DOB + Phone Number) before adding to queue or updating records.</div>
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
            <button className="chip">Recently Visited</button>
            <button className="chip">Seniors (65+)</button>
            <button className="chip">Pediatrics</button>
          </div>
        </div>

        <div className="directory-table-wrapper">
          <table className="directory-table">
            <thead>
              <tr>
                <th>Patient ID / MRN</th>
                <th>Patient Details</th>
                <th>Contact Information</th>
                <th>Demographics</th>
                <th>Last Visit</th>
                <th className="text-right">Quick Actions</th>
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
                      <div className="contact-cell">
                        <div className="text-body-sm"><span className="material-symbols-outlined">call</span> {patient.phone}</div>
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
                    <td className="text-right actions-cell">
                      <button className="btn btn-outline" style={{ height: '32px', padding: '0 12px', fontSize: '13px' }}>
                        View Profile
                      </button>
                      <button 
                        className="btn btn-primary" 
                        style={{ height: '32px', padding: '0 12px', fontSize: '13px' }}
                        onClick={() => handleAddToQueue(patient)}
                        disabled={isPatientInQueue(patient.id)}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                          {isPatientInQueue(patient.id) ? 'check' : 'add'}
                        </span> 
                        {isPatientInQueue(patient.id) ? 'In Queue' : 'Add to Queue'}
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
                      action={
                        <button className="btn btn-primary" onClick={() => window.location.href = '/receptionist/register'}>
                          <span className="material-symbols-outlined">person_add</span> Register New Patient
                        </button>
                      }
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
