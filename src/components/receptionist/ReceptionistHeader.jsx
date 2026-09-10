import { useState, useRef, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../data/store';
import StatusBadge from '../../components/shared/StatusBadge';
import './ReceptionistHeader.css';

export default function ReceptionistHeader() {
  const { dispatch } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  // Generate breadcrumbs based on route
  const path = location.pathname.split('/').filter(Boolean);
  const currentView = path.length > 1 
    ? path[1].split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    : 'Front Desk Operations';

  const handleLogout = () => {
    dispatch({ type: 'SET_USER', payload: null });
    navigate('/');
  };

  return (
    <header className="receptionist-header">
      <div className="header-breadcrumbs">
        <span className="breadcrumb-item text-body-sm">Reception Desk</span>
        <span className="material-symbols-outlined breadcrumb-separator">chevron_right</span>
        <span className="breadcrumb-current text-headline-sm">{currentView}</span>
      </div>

      <div className="header-actions">
        <StatusBadge 
          status="Doctor — In Room 102 (Available)" 
          type="primary"
          icon="circle"
        />
        
        <Link to="/receptionist/messages" className="icon-button" aria-label="Messages">
          <span className="material-symbols-outlined">chat_bubble</span>
        </Link>

        <div className="header-user" ref={dropdownRef} onClick={() => setShowDropdown(!showDropdown)} style={{ cursor: 'pointer', position: 'relative' }}>
          <div className="header-user-avatar">
            <span className="material-symbols-outlined">person</span>
          </div>

          {showDropdown && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '8px',
              background: 'var(--surface-container-high)',
              border: '1px solid var(--surface-variant)',
              borderRadius: '8px',
              padding: '8px',
              minWidth: '180px',
              boxShadow: 'var(--shadow-2)',
              zIndex: 1000
            }}>
              <div 
                onClick={handleLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  color: 'var(--error)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--error-container)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>logout</span>
                Switch Account
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
