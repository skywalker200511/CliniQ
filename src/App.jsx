import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginSelector from './pages/LoginSelector';

// Doctor Layout & Pages
import DoctorLayout from './components/doctor/DoctorLayout';
import DoctorHome from './pages/doctor/DoctorHome';
import DoctorQueue from './pages/doctor/DoctorQueue';
import DoctorPatients from './pages/doctor/DoctorPatients';
// import DoctorConsultation from './pages/doctor/DoctorConsultation';
import DoctorMessages from './pages/doctor/DoctorMessages';

// Receptionist Layout & Pages
import ReceptionistLayout from './components/receptionist/ReceptionistLayout';
import ReceptionistHome from './pages/receptionist/ReceptionistHome';
import ReceptionistRegister from './pages/receptionist/ReceptionistRegister';
import ReceptionistQueue from './pages/receptionist/ReceptionistQueue';
import ReceptionistPatients from './pages/receptionist/ReceptionistPatients';
import ReceptionistMessages from './pages/receptionist/ReceptionistMessages';

// Placeholder for unbuilt pages
const Placeholder = ({ title }) => (
  <div style={{ padding: '2rem' }}>
    <h2>{title}</h2>
    <p>Page is under construction.</p>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginSelector />} />

        {/* Doctor Routes */}
        <Route path="/doctor" element={<DoctorLayout />}>
          <Route index element={<DoctorHome />} />
          <Route path="queue" element={<DoctorQueue />} />
          <Route path="patients" element={<DoctorPatients />} />
          <Route path="consultations" element={<Placeholder title="Doctor Consultations" />} />
          <Route path="consultation/:id" element={<Placeholder title="Doctor Case-Taking" />} />
          <Route path="messages" element={<DoctorMessages />} />
          <Route path="follow-ups" element={<Placeholder title="Follow-ups" />} />
          <Route path="documents" element={<Placeholder title="Documents" />} />
        </Route>

        {/* Receptionist Routes */}
        <Route path="/receptionist" element={<ReceptionistLayout />}>
          <Route index element={<ReceptionistHome />} />
          <Route path="register" element={<ReceptionistRegister />} />
          <Route path="queue" element={<ReceptionistQueue />} />
          <Route path="patients" element={<ReceptionistPatients />} />
          <Route path="messages" element={<ReceptionistMessages />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
