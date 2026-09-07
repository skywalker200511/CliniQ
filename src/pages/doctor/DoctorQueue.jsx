import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../data/store';
import { getFilteredQueue, callNextPatient } from '../../services/queueService';
import StatusBadge from '../../components/shared/StatusBadge';
import EmptyState from '../../components/shared/EmptyState';
import './DoctorQueue.css';

export default function DoctorQueue() {
  const { state, dispatch, showToast } = useAppContext();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('waiting');
  
  const doctorId = state.currentUser?.id || 'doc-001';
  // Note: For demo, we are showing all patients in the queue for the specific doctor (or all if not assigned)
  const queueData = getFilteredQueue(state, filter).filter(
    q => !q.doctorId || q.doctorId === doctorId
  );

  const waitingCount = state.queue.filter(q => q.status === 'Waiting').length;
  const servingCount = state.queue.filter(q => q.status === 'With Doctor' && (!q.doctorId || q.doctorId === doctorId)).length;

  const handleCallNext = async () => {
    if (servingCount > 0) {
      showToast('You must complete the current consultation before calling another patient.', 'error');
      return;
    }
    const nextPatient = await callNextPatient(dispatch, state, doctorId);
    if (nextPatient) {
      showToast(`Called ${nextPatient.patientName} to Room 102`);
    } else {
      showToast('No patients waiting in queue', 'error');
    }
  };

  const handleStartConsultation = (patientId) => {
    // Navigate to consultation page
    navigate(`/doctor/consultation/${patientId}`);
  };

  return (
    <div className="doctor-queue">
      <div className="page-header">
        <div>
          <h1 className="text-display">Patient Queue</h1>
          <p className="text-body-lg" style={{ color: 'var(--on-surface-variant)' }}>
            Manage your daily appointments and walk-in patients.
          </p>
        </div>
        <div className="header-actions">
          <button 
            className="btn btn-primary" 
            onClick={handleCallNext}
            disabled={waitingCount === 0 || servingCount > 0}
          >
            <span className="material-symbols-outlined">campaign</span> Call Next Patient
          </button>
        </div>
      </div>

      <div className="queue-container">
        <div className="queue-toolbar">
          <div className="filter-tabs">
            <button className={`tab ${filter === 'waiting' ? 'active' : ''}`} onClick={() => setFilter('waiting')}>
              Waiting <span className="tab-badge">{waitingCount}</span>
            </button>
            <button className={`tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
              All Assigned <span className="tab-badge">{state.queue.filter(q => !q.doctorId || q.doctorId === doctorId).length}</span>
            </button>
          </div>
          
          <div className="toolbar-actions">
            <span className="live-badge">
              <span className="status-dot green"></span> Live updates
            </span>
          </div>
        </div>

        <div className="queue-table-wrapper">
          <table className="queue-table">
            <thead>
              <tr>
                <th>No.</th>
                <th>Patient Name</th>
                <th>Patient MRN</th>
                <th>Wait Time</th>
                <th>Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {queueData.length > 0 ? (
                queueData.map(entry => (
                  <tr key={entry.id} className={entry.status === 'With Doctor' ? 'highlight-row' : ''}>
                    <td className="queue-number">#{entry.queueNumber}</td>
                    <td>
                      <div className="patient-name-cell">
                        <div className="patient-avatar">{entry.initials}</div>
                        <span className="text-label-md">{entry.patientName}</span>
                      </div>
                    </td>
                    <td className="font-mono text-body-sm">{entry.patientMrn}</td>
                    <td className="text-body-sm">
                      {entry.status === 'Waiting' ? '15 mins' : '-'}
                    </td>
                    <td>
                      <StatusBadge status={entry.status} />
                    </td>
                    <td className="text-right">
                      {entry.status === 'With Doctor' ? (
                        <button 
                          className="btn btn-primary btn-sm"
                          onClick={() => handleStartConsultation(entry.patientId)}
                        >
                          <span className="material-symbols-outlined">edit_note</span> Case Sheet
                        </button>
                      ) : entry.status === 'Waiting' ? (
                        <button className="btn btn-outline btn-sm">
                          <span className="material-symbols-outlined">visibility</span> View Chart
                        </button>
                      ) : (
                        <button className="btn btn-surface btn-sm">
                          <span className="material-symbols-outlined">description</span> View Notes
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="empty-cell">
                    <EmptyState 
                      icon="chair"
                      title="No patients waiting"
                      description="There are currently no patients assigned to you in this queue."
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
