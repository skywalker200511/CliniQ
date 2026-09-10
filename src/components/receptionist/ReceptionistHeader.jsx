import { useLocation, Link } from 'react-router-dom';
import StatusBadge from '../../components/shared/StatusBadge';
import './ReceptionistHeader.css';

export default function ReceptionistHeader() {
  const location = useLocation();

  // Generate breadcrumbs based on route
  const path = location.pathname.split('/').filter(Boolean);
  const currentView = path.length > 1 
    ? path[1].split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    : 'Front Desk Operations';

  return (
    <header className="receptionist-header">
      <div className="header-breadcrumbs">
        <span className="breadcrumb-item text-body-sm">Reception Desk</span>
        <span className="material-symbols-outlined breadcrumb-separator">chevron_right</span>
        <span className="breadcrumb-current text-headline-sm">{currentView}</span>
      </div>

      <div className="header-actions">
        <StatusBadge 
          status="Doctor • In Room 102 (Available)" 
          type="primary"
          icon="circle"
        />
        
        <Link to="/receptionist/messages" className="icon-button" aria-label="Messages">
          <span className="material-symbols-outlined">chat_bubble</span>
        </Link>

        <div className="header-user-avatar">
          <span className="material-symbols-outlined">person</span>
        </div>
      </div>
    </header>
  );
}
