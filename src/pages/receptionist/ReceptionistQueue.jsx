import { useState } from 'react';
import { useAppContext } from '../../data/store';
import { getFilteredQueue, getQueueStats } from '../../services/queueService';
import StatusBadge from '../../components/shared/StatusBadge';
import SearchInput from '../../components/shared/SearchInput';
import EmptyState from '../../components/shared/EmptyState';
import './ReceptionistQueue.css';

export default function ReceptionistQueue() {
  const { state } = useAppContext();
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const stats = getQueueStats(state);
  const queueData = getFilteredQueue(state, filter, searchQuery);

  return (
    <div className="receptionist-queue">
      <div className="page-header">
        <div>
          <h1 className="text-display">Queue Management</h1>
          <p className="text-body-lg" style={{ color: 'var(--on-surface-variant)' }}>
            Monitor and manage patient flow across all consultation rooms.
          </p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary">
            <span className="material-symbols-outlined">person_add</span> Register Walk-in
          </button>
        </div>
      </div>

      <div className="queue-stats-cards">
        <div className="stat-card active">
          <div className="stat-icon-wrapper primary">
            <span className="material-symbols-outlined">stethoscope</span>
          </div>
          <div className="stat-info">
            <span className="text-label-md">Now Serving</span>
            <span className="text-display stat-number primary">{stats.withDoctor}</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon-wrapper warning">
            <span className="material-symbols-outlined">chair</span>
          </div>
          <div className="stat-info">
            <span className="text-label-md">Waiting</span>
            <span className="text-display stat-number warning">{stats.waiting}</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon-wrapper success">
            <span className="material-symbols-outlined">check_circle</span>
          </div>
          <div className="stat-info">
            <span className="text-label-md">Completed</span>
            <span className="text-display stat-number success">{stats.completed}</span>
          </div>
        </div>
      </div>

      <div className="queue-list-container">
        <div className="list-toolbar">
          <div className="filter-tabs">
            <button className={`tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
              All Patients <span className="tab-badge">{stats.total}</span>
            </button>
            <button className={`tab ${filter === 'waiting' ? 'active' : ''}`} onClick={() => setFilter('waiting')}>
              Waiting <span className="tab-badge">{stats.waiting}</span>
            </button>
            <button className={`tab ${filter === 'doctor' ? 'active' : ''}`} onClick={() => setFilter('doctor')}>
              With Doctor <span className="tab-badge">{stats.withDoctor}</span>
            </button>
            <button className={`tab ${filter === 'completed' ? 'active' : ''}`} onClick={() => setFilter('completed')}>
              Completed <span className="tab-badge">{stats.completed}</span>
            </button>
          </div>
          
          <div className="toolbar-actions">
            <div className="search-wrapper">
              <SearchInput 
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search queue by name or MRN"
              />
            </div>
            <button className="btn btn-outline">
              <span className="material-symbols-outlined">filter_list</span> Filter
            </button>
          </div>
        </div>

        <div className="queue-table-wrapper">
          <table className="queue-table">
            <thead>
              <tr>
                <th>No.</th>
                <th>Patient Name</th>
                <th>Patient MRN</th>
                <th>Arrival Time</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
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
                    <td className="text-body-sm">{entry.arrivalTime}</td>
                    <td>
                      <StatusBadge status={entry.status} />
                    </td>
                    <td className="text-right actions-cell">
                      <button className="icon-button small" title="View Patient">
                        <span className="material-symbols-outlined">visibility</span>
                      </button>
                      {entry.status === 'Waiting' && (
                        <button className="icon-button small primary-color" title="Call to Doctor">
                          <span className="material-symbols-outlined">campaign</span>
                        </button>
                      )}
                      <button className="icon-button small" title="More options">
                        <span className="material-symbols-outlined">more_vert</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="empty-cell">
                    <EmptyState 
                      icon="person_search"
                      title="No patients found"
                      description={searchQuery ? `No matching results for "${searchQuery}" in ${filter} view.` : "The queue is currently empty."}
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
