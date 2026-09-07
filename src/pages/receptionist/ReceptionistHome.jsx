import { Link } from 'react-router-dom';
import { useAppContext } from '../../data/store';
import { getQueueStats } from '../../services/queueService';
import './ReceptionistHome.css';

export default function ReceptionistHome() {
  const { state } = useAppContext();
  const queueStats = getQueueStats(state);
  
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  return (
    <div className="receptionist-home">
      {/* Header section */}
      <div className="home-header">
        <div>
          <div className="shift-badge">SHIFT ACTIVE</div>
          <span className="terminal-id">TERMINAL 01 • MAIN DESK</span>
          <h1 className="text-display">Good Morning, {state.currentUser?.fullName.split(' ')[0] || 'Elena'}</h1>
          <p className="text-body-lg" style={{ color: 'var(--on-surface-variant)' }}>
            Manage today's patient flow and front-desk admissions.
          </p>
        </div>
        <div className="home-header-right">
          <div className="status-pill">
            <span className="status-dot green"></span>
            Lobby Gate 1 Connected
          </div>
          <div className="date-pill">
            <span className="material-symbols-outlined">calendar_today</span>
            {dateStr}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <Link to="/receptionist/register" className="action-card primary-action">
          <div className="action-icon">
            <span className="material-symbols-outlined">person_add</span>
          </div>
          <div className="action-content">
            <h3 className="text-headline-sm">Register New Patient</h3>
            <p className="text-body-sm">Direct walk-in intake & ID scan</p>
          </div>
          <span className="material-symbols-outlined arrow">arrow_forward</span>
        </Link>
        
        <Link to="/receptionist/patients" className="action-card">
          <div className="action-icon light">
            <span className="material-symbols-outlined">search</span>
          </div>
          <div className="action-content">
            <h3 className="text-headline-sm">Search Patient</h3>
            <p className="text-body-sm">Find by MRN, Name, or Phone</p>
          </div>
          <kbd className="shortcut">⌘K</kbd>
        </Link>
        
        <Link to="/receptionist/queue" className="action-card">
          <div className="action-icon light">
            <span className="material-symbols-outlined">format_list_bulleted</span>
          </div>
          <div className="action-content">
            <h3 className="text-headline-sm">View Full Queue</h3>
            <p className="text-body-sm">Daily schedule & order list</p>
          </div>
          <span className="material-symbols-outlined open-icon">open_in_new</span>
        </Link>
      </div>

      <div className="home-grid">
        <div className="grid-main">
          {/* Queue Card */}
          <div className="dashboard-card">
            <div className="card-header">
              <div className="card-title-group">
                <div className="vertical-indicator"></div>
                <div>
                  <h2 className="text-headline-sm">Today's Patient Queue</h2>
                  <p className="text-body-sm" style={{ color: 'var(--on-surface-variant)' }}>Main waiting lobby & arrival flow management</p>
                </div>
              </div>
              <div className="card-actions">
                <span className="refresh-badge">Auto-refresh On</span>
                <button className="icon-button"><span className="material-symbols-outlined">refresh</span></button>
              </div>
            </div>

            <div className="queue-stats-row">
              <div className="stat-box primary">
                <div className="stat-value">{queueStats.waiting}</div>
                <div className="stat-label">
                  <span className="text-label-md">Patients Waiting</span>
                  <span className="text-body-sm">In clinic lobby right now</span>
                </div>
              </div>
              
              <div className="stat-box">
                <div className="stat-icon"><span className="material-symbols-outlined">person_check</span></div>
                <div>
                  <div className="stat-number">{queueStats.total}</div>
                  <div className="stat-text">Checked In</div>
                </div>
              </div>
              
              <div className="stat-box">
                <div className="stat-icon success"><span className="material-symbols-outlined">stethoscope</span></div>
                <div>
                  <div className="stat-number">{queueStats.withDoctor}</div>
                  <div className="stat-text">With Doctor</div>
                </div>
              </div>
              
              <div className="stat-box">
                <div className="stat-icon neutral"><span className="material-symbols-outlined">check_circle</span></div>
                <div>
                  <div className="stat-number">{queueStats.completed}</div>
                  <div className="stat-text">Completed Today</div>
                </div>
              </div>
            </div>

            <div className="empty-queue-state">
              <div className="empty-icon"><span className="material-symbols-outlined">chair</span></div>
              <h3 className="text-headline-sm">No patients are currently waiting</h3>
              <p className="text-body-md" style={{ color: 'var(--on-surface-variant)' }}>
                Registered patients will appear here automatically when they check in at the front desk or self-service kiosk.
              </p>
              <div className="empty-actions">
                <Link to="/receptionist/register" className="btn btn-primary">
                  <span className="material-symbols-outlined">add</span> Intake First Patient
                </Link>
                <button className="btn btn-secondary">
                  <span className="material-symbols-outlined">qr_code_scanner</span> Scan Health Card
                </button>
              </div>
            </div>
          </div>

          {/* Activity Log */}
          <div className="dashboard-card mt-xl">
            <div className="card-header">
              <div className="card-title-group">
                <span className="material-symbols-outlined" style={{ color: 'var(--on-surface-variant)' }}>history</span>
                <h2 className="text-headline-sm">Recent Front Desk Activity</h2>
              </div>
              <span className="text-label-sm" style={{ color: 'var(--on-surface-variant)' }}>Today's Session</span>
            </div>
            
            <div className="activity-empty text-body-md">
              <div className="activity-icon"><span className="material-symbols-outlined">assignment</span></div>
              <div>
                <strong>No front desk activity recorded today</strong>
                <p>Begin by registering a new patient or searching existing clinic records.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid-sidebar">
          {/* Consultation Room */}
          <div className="dashboard-card border-card">
            <div className="card-header">
              <div className="card-title-group">
                <span className="material-symbols-outlined">meeting_room</span>
                <h2 className="text-headline-sm">Consultation Room</h2>
              </div>
              <span className="live-sync-badge">
                <span className="status-dot small"></span> Live Sync
              </span>
            </div>

            <div className="room-status-box">
              <div className="doctor-profile">
                <div className="doc-avatar">SJ</div>
                <div className="doc-info">
                  <div className="doc-name text-label-md">Dr. Sarah Jenkins, MD</div>
                  <div className="doc-dept text-body-sm">General Practice • Room 102</div>
                </div>
                <span className="badge-available">Available</span>
              </div>
              
              <div className="room-occupancy">
                <span className="text-label-sm" style={{ color: 'var(--on-surface-variant)' }}>Room Occupancy:</span>
                <span className="text-label-md">Idle • Ready for Next Patient</span>
              </div>
              
              <button className="btn btn-full btn-secondary mt-md">
                <span className="material-symbols-outlined">edit_note</span> Send Note to Doctor
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="dashboard-card border-card mt-md">
            <div className="card-header">
              <div className="card-title-group">
                <span className="material-symbols-outlined">chat_bubble</span>
                <h2 className="text-headline-sm">Doctor Communications</h2>
              </div>
              <span className="status-dot grey"></span>
            </div>
            
            <p className="text-body-sm" style={{ color: 'var(--on-surface-variant)', marginBottom: '16px' }}>
              Direct front desk to consultation room 102 channel. Real-time patient alerts and triage handoffs.
            </p>
            
            <div className="msg-empty text-body-sm">
              <span className="material-symbols-outlined">inbox</span>
              No new messages from consultation rooms.
            </div>
            
            <Link to="/receptionist/messages" className="btn btn-full btn-outline mt-md">
              <span className="material-symbols-outlined">chat</span> Open Messages
            </Link>
          </div>

          {/* Standards */}
          <div className="dashboard-card border-card mt-md" style={{ background: 'transparent', border: 'none' }}>
            <div className="card-title-group" style={{ marginBottom: '8px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--primary)' }}>verified_user</span>
              <h3 className="text-label-sm" style={{ color: 'var(--on-surface)' }}>SHIFT STANDARDS</h3>
            </div>
            <p className="text-body-sm" style={{ color: 'var(--on-surface-variant)' }}>
              Ensure patient identity documents and insurance verification cards are checked prior to assigning Room 102.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
