import { NavLink } from 'react-router-dom';
import { useAppContext } from '../../data/store';
import { getUnreadCount } from '../../services/messageService';
import './DoctorSidebar.css';

export default function DoctorSidebar() {
  const { state, dispatch } = useAppContext();
  const unreadMessages = getUnreadCount(state, state.currentUser?.id);
  const queueCount = state.queue.length;

  const navItems = [
    { to: '/doctor/', icon: 'dashboard', label: 'Home', end: true },
    { to: '/doctor/queue', icon: 'group', label: 'Queue', count: queueCount },
    { to: '/doctor/patients', icon: 'patient_list', label: 'Patients' },
    { to: '/doctor/consultations', icon: 'stethoscope', label: 'Consultations' },
    { to: '/doctor/follow-ups', icon: 'event', label: 'Follow-ups' },
    { to: '/doctor/messages', icon: 'chat_bubble', label: 'Messages', count: unreadMessages },
    { to: '/doctor/documents', icon: 'folder', label: 'Documents' },
  ];

  return (
    <aside className="doctor-sidebar">
      <div className="sidebar-brand">
        <div className="brand-logo">
          <img src="/logo.svg" alt="CareTrack Logo" />
        </div>
        <div className="brand-name">CareTrack</div>
      </div>

      <div className="sidebar-clinic-selector">
        <div className="clinic-info">
          <div className="clinic-name text-label-md">CareTrack Clinic</div>
          <div className="clinic-branch text-body-sm">Main Branch</div>
        </div>
        <span className="material-symbols-outlined expand-icon">unfold_more</span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(item => (
          <NavLink 
            key={item.to} 
            to={item.to}
            end={item.end}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="material-symbols-outlined nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
            {item.count !== undefined && item.count > 0 && (
              <span className="nav-badge">{item.count}</span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="nav-item">
          <span className="material-symbols-outlined nav-icon">settings</span>
          <span className="nav-label">Settings</span>
        </button>
        <button className="nav-item">
          <span className="material-symbols-outlined nav-icon">help</span>
          <span className="nav-label">Help</span>
        </button>
        <button className="nav-item" onClick={() => {
          window.location.href = '/';
          dispatch({ type: 'SET_USER', payload: null });
        }}>
          <span className="material-symbols-outlined nav-icon" style={{color: 'var(--error)'}}>logout</span>
          <span className="nav-label" style={{color: 'var(--error)'}}>Logout</span>
        </button>
        
        {state.currentUser && (
          <div className="user-profile">
            <div className="user-avatar">{state.currentUser.initials}</div>
            <div className="user-info">
              <div className="user-name text-label-md truncate">{state.currentUser.fullName}</div>
              <div className="user-role text-body-sm truncate">{state.currentUser.title || state.currentUser.role}</div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
