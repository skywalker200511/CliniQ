import { useLocation, Link } from 'react-router-dom';
import { useAppContext } from '../../data/store';
import StatusBadge from '../../components/shared/StatusBadge';
import './DoctorHeader.css';

export default function DoctorHeader() {
  const { state } = useAppContext();
  const location = useLocation();
  const user = state.currentUser;

  // Generate breadcrumbs based on route
  const path = location.pathname.split('/').filter(Boolean);
  const currentView = path.length > 1 
    ? path[1].charAt(0).toUpperCase() + path[1].slice(1).replace('-', ' ') 
    : 'Outpatient Practice';

  return (
    <header className="doctor-header">
      <div className="header-breadcrumbs">
        <span className="breadcrumb-item text-body-sm">Clinical Workspace</span>
        <span className="material-symbols-outlined breadcrumb-separator">chevron_right</span>
        <span className="breadcrumb-current text-label-md">{currentView}</span>
      </div>

      <div className="header-actions">
        <StatusBadge 
          status={`Clinic Open • Room ${user?.roomNumber || '102'}`} 
          type="success" 
        />
        
        <Link to="/doctor/messages" className="icon-button" aria-label="Messages">
          <span className="material-symbols-outlined">mail</span>
        </Link>

        <div className="header-divider"></div>

        <div className="header-user">
          <div className="header-user-info">
            <span className="header-user-name text-label-md">{user?.fullName}</span>
            <span className="header-user-role text-label-sm">Doctor</span>
          </div>
          <div className="header-user-avatar">
            <span className="material-symbols-outlined">person</span>
          </div>
        </div>
      </div>
    </header>
  );
}
