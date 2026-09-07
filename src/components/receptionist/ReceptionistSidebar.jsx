import { NavLink } from 'react-router-dom';
import { useAppContext } from '../../data/store';
import { getUnreadCount } from '../../services/messageService';
import './ReceptionistSidebar.css';

export default function ReceptionistSidebar() {
  const { state, dispatch } = useAppContext();
  const unreadMessages = getUnreadCount(state, state.currentUser?.id);

  const navItems = [
    { to: '/receptionist/', icon: 'dashboard', label: 'Home', end: true },
    { to: '/receptionist/register', icon: 'person_add', label: 'Register Patient' },
    { to: '/receptionist/queue', icon: 'schedule', label: 'Queue' },
    { to: '/receptionist/patients', icon: 'groups', label: 'Patients' },
    { to: '/receptionist/messages', icon: 'chat_bubble', label: 'Messages', count: unreadMessages },
  ];

  return (
    <aside className="receptionist-sidebar">
      <div className="sidebar-brand">
        <div className="brand-logo">
          <img src="/logo.svg" alt="CareTrack Logo" />
        </div>
        <div className="brand-text">
          <div className="brand-name">CareTrack</div>
          <div className="brand-subtitle">Clinic Portal</div>
        </div>
      </div>

      <div className="sidebar-clinic-selector">
        <span className="material-symbols-outlined">domain</span>
        <span className="clinic-name-text">CareTrack Clinic • Main Branch</span>
        <span className="material-symbols-outlined expand-icon">unfold_more</span>
      </div>

      <div className="nav-section-title">FRONT DESK NAVIGATION</div>

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
        <div className="nav-section-title">SYSTEM</div>
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
            <div className="user-avatar">
              <span className="avatar-status"></span>
              {state.currentUser.initials}
            </div>
            <div className="user-info">
              <div className="user-name text-label-md truncate">{state.currentUser.fullName}</div>
              <div className="user-role text-body-sm truncate">Receptionist / Front Desk</div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
