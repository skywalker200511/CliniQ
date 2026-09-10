import { Outlet, Navigate } from 'react-router-dom';
import { useAppContext } from '../../data/store';
import ReceptionistSidebar from './ReceptionistSidebar';
import ReceptionistHeader from './ReceptionistHeader';
import ToastContainer from '../../components/shared/Toast';
import './ReceptionistLayout.css';
import './ReceptionistMobile.css';

export default function ReceptionistLayout() {
  const { state } = useAppContext();

  // If not logged in as receptionist, redirect to login
  if (!state.currentUser || state.currentUser.role !== 'receptionist') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="receptionist-module">
      <ReceptionistSidebar />
      <div className="receptionist-main">
        <ReceptionistHeader />
        <main className="receptionist-content">
          <Outlet />
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}
