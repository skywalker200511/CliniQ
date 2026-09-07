import { Outlet, Navigate } from 'react-router-dom';
import { useAppContext } from '../../data/store';
import DoctorSidebar from './DoctorSidebar';
import DoctorHeader from './DoctorHeader';
import ToastContainer from '../../components/shared/Toast';
import './DoctorLayout.css';

export default function DoctorLayout() {
  const { state } = useAppContext();

  // If not logged in as doctor, redirect to login
  if (!state.currentUser || state.currentUser.role !== 'doctor') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="doctor-module">
      <DoctorSidebar />
      <div className="doctor-main">
        <DoctorHeader />
        <main className="doctor-content">
          <Outlet />
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}
