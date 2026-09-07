import { Link } from 'react-router-dom';
import { useAppContext } from '../../data/store';
import { getQueueStats, getCurrentlyServing } from '../../services/queueService';
import { formatMessageTime } from '../../services/messageService';
import './DoctorHome.css';

export default function DoctorHome() {
  const { state } = useAppContext();
  const queueStats = getQueueStats(state);
  const servingPatient = getCurrentlyServing(state);
  const nextWaitingPatient = state.queue.find(q => q.status === 'Waiting');
  const displayPatient = servingPatient || nextWaitingPatient;
  
  // Get recent messages for doctor
  const recentMessages = state.messages
    .filter(m => m.receiverId === 'doc-001' && !m.read)
    .slice(0, 3);

  // Simple clock
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const ampm = timeStr.slice(-2);
  const timeNum = timeStr.slice(0, -3);

  return (
    <div className="doctor-home">
      {/* Welcome Section */}
      <div className="home-welcome">
        <div>
          <div className="session-badge">
            <span className="status-dot green"></span>
            OUTPATIENT SESSION ACTIVE • STATION 02
          </div>
          <h1 className="text-display mt-sm">Good Morning, {state.currentUser?.fullName || 'Dr. Jenkins'}</h1>
          <p className="text-body-lg" style={{ color: 'var(--on-surface-variant)' }}>
            Here's your clinic overview for today.
          </p>
        </div>
        
        <div className="shift-time-card">
          <div className="time-info">
            <span className="text-label-sm" style={{ color: 'var(--on-surface-variant)' }}>CURRENT SHIFT</span>
            <div className="time-display">
              <span className="time-num">{timeNum}</span>
              <span className="time-ampm">{ampm}</span>
            </div>
          </div>
          <div className="shift-type">
            <span className="material-symbols-outlined">calendar_today</span>
            Morning Clinic
          </div>
        </div>
      </div>

      <div className="home-grid">
        {/* Left Column */}
        <div className="grid-left">
          {/* Current Queue Card */}
          <div className="dashboard-card border-card">
            <div className="card-header">
              <div className="card-title-group">
                <span className="status-dot green"></span>
                <h2 className="text-label-md">CURRENT QUEUE</h2>
              </div>
              <span className="live-sync-badge">Live Sync</span>
            </div>

            <div className="queue-big-number">
              {queueStats.waiting}
            </div>
            <p className="text-body-md" style={{ color: 'var(--on-surface-variant)' }}>
              {queueStats.waiting === 0 ? 'No patients currently waiting' : 'Patients currently waiting'}
            </p>

            <div className="queue-mini-stats">
              <div className="mini-stat">
                <div className="text-headline-md">{queueStats.waiting}</div>
                <div className="text-label-sm">Waiting</div>
              </div>
              <div className="mini-stat">
                <div className="text-headline-md">{queueStats.withDoctor}</div>
                <div className="text-label-sm">With Doctor</div>
              </div>
              <div className="mini-stat">
                <div className="text-headline-md">{queueStats.completed}</div>
                <div className="text-label-sm">Completed</div>
              </div>
            </div>

            <Link to="/doctor/queue" className="open-queue-link mt-lg">
              Open Full Queue <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </div>
        </div>

        {/* Right Column */}
        <div className="grid-right">
          {/* Next Patient Workspace */}
          <div className="dashboard-card border-card highlight-card">
            <div className="card-header">
              <div className="card-title-group">
                <span className="next-patient-badge">NEXT PATIENT</span>
                <span className="text-body-sm" style={{ color: 'var(--on-surface-variant)' }}>Triage Station 02</span>
              </div>
              <div className="auto-call-info">
                <span className="material-symbols-outlined">sync</span>
                <span className="text-label-sm">Auto-call enabled</span>
              </div>
            </div>

            {displayPatient ? (
              <div className="serving-patient-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 className="text-headline-md">{displayPatient.patientName}</h3>
                <p className="text-body-lg">MRN: {displayPatient.patientMrn}</p>
                <p className="text-body-md">Status: <span style={{ fontWeight: 'bold', color: displayPatient.status === 'Waiting' ? 'var(--warning)' : 'var(--primary)' }}>{displayPatient.status}</span></p>
              </div>
            ) : (
            <div className="workspace-empty-state">
              <div className="workspace-icon">
                <span className="material-symbols-outlined">person_check</span>
              </div>
              <div className="workspace-text">
                <h3 className="text-headline-sm">No Patient in Queue</h3>
                <p className="text-body-sm" style={{ color: 'var(--on-surface-variant)' }}>
                  Your next patient will appear here once called or checked in by reception. Room audio chimes and triage summaries will automatically sync when a chart is activated.
                </p>
              </div>
            </div>
            )}

            <div className="workspace-actions">
              {displayPatient ? (
                <Link to={`/doctor/consultation/${displayPatient.patientId}`} className="btn btn-full btn-primary">
                  <span className="material-symbols-outlined">play_arrow</span> Start Consultation
                </Link>
              ) : (
                <button className="btn btn-full btn-secondary" disabled>
                  <span className="material-symbols-outlined">play_arrow</span> Start Consultation
                </button>
              )}
              <Link to="/doctor/queue" className="btn btn-full btn-surface">
                <span className="material-symbols-outlined">format_list_bulleted</span> View Patient Queue
              </Link>
            </div>
            
            <p className="text-label-sm text-center mt-md" style={{ color: 'var(--on-surface)' }}>
              Awaiting next patient check-in
            </p>
          </div>
        </div>
      </div>

      <div className="home-grid mt-xl">
        {/* Today's Queue Preview */}
        <div className="grid-left">
          <div className="dashboard-card card-padding-lg">
            <div className="card-header">
              <div className="card-title-group">
                <h2 className="text-headline-sm">Today's Patient Queue</h2>
                <span className="total-badge">{queueStats.total} Total</span>
              </div>
              <button className="icon-button"><span className="material-symbols-outlined">refresh</span></button>
            </div>

            {queueStats.total > 0 ? (
              <div className="queue-list mt-lg">
                {state.queue.slice(0, 5).map(q => (
                  <div key={q.id} style={{ padding: '16px', borderBottom: '1px solid var(--outline-variant)' }}>
                    <div className="text-label-md">{q.patientName}</div>
                    <div className="text-body-sm" style={{ color: 'var(--on-surface-variant)' }}>
                      {q.status} • Arrived: {q.arrivalTime}
                    </div>
                  </div>
                ))}
                <Link to="/doctor/queue" className="btn btn-outline mt-md" style={{ width: '100%' }}>View Full Queue</Link>
              </div>
            ) : (
            <div className="empty-state-panel mt-lg">
              <div className="empty-state-icon">
                <span className="material-symbols-outlined">inbox</span>
              </div>
              <h3 className="text-label-md mt-sm">Your queue is empty.</h3>
              <p className="text-body-sm" style={{ color: 'var(--on-surface-variant)', marginBottom: '24px' }}>
                Patients checked in by reception will appear here in arrival order.
              </p>
              <Link to="/doctor/queue" className="btn btn-primary-light">
                View Full Queue <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
            </div>
            )}
          </div>
        </div>

        {/* Receptionist Messages */}
        <div className="grid-right">
          <div className="dashboard-card card-padding-lg">
            <div className="card-header">
              <h2 className="text-headline-sm">Receptionist Messages</h2>
              <div className="messages-header-right">
                <span className="new-badge">0 new</span>
                <span className="text-label-sm" style={{ color: 'var(--on-surface)' }}>Front Desk</span>
              </div>
            </div>

            <div className="empty-state-panel mt-lg">
              <div className="empty-state-icon">
                <span className="material-symbols-outlined">chat_bubble</span>
              </div>
              <h3 className="text-label-md mt-sm">No new messages</h3>
              <p className="text-body-sm" style={{ color: 'var(--on-surface-variant)', marginBottom: '24px', maxWidth: '240px', margin: '0 auto 24px' }}>
                Internal communications from the front desk will appear here.
              </p>
              <Link to="/doctor/messages" className="btn btn-full btn-primary">
                <span className="material-symbols-outlined">chat</span> Open Internal Messages
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="system-status-footer mt-xl">
        <div className="status-item">
          <span className="material-symbols-outlined">business</span>
          <span className="text-label-md">Main Branch • Ground Floor</span>
        </div>
        <div className="status-item">
          <span className="material-symbols-outlined" style={{ color: 'var(--secondary)' }}>check_circle</span>
          <span className="text-label-md">EHR System Operational</span>
        </div>
        <div className="version-info text-label-sm">
          CareTrack v4.12 • Medical Records Direct Connect
        </div>
      </div>
    </div>
  );
}
