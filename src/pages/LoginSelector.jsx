import { useNavigate } from 'react-router-dom';
import { useAppContext, USERS } from '../data/store';
import './LoginSelector.css';

export default function LoginSelector() {
  const { dispatch } = useAppContext();
  const navigate = useNavigate();

  const handleLogin = (role) => {
    dispatch({ type: 'SET_USER', payload: USERS[role] });
    navigate(`/${role}/`);
  };

  return (
    <div className="login-selector">
      <div className="login-card animate-fade-in-scale">
        <div className="login-brand">
          <img src="/logo.svg" alt="CareTrack Logo" className="login-logo" />
          <h1 className="login-title text-headline-md">CareTrack Demo</h1>
          <p className="login-subtitle text-body-md">Select a role to enter the application</p>
        </div>

        <div className="role-options">
          <button 
            className="role-btn doctor-role" 
            onClick={() => handleLogin('doctor')}
          >
            <div className="role-icon">
              <span className="material-symbols-outlined">stethoscope</span>
            </div>
            <div className="role-text">
              <div className="role-name text-label-lg">Doctor Module</div>
              <div className="role-desc text-body-sm">Clinical workspace, case-taking, queue</div>
            </div>
            <span className="material-symbols-outlined arrow-icon">arrow_forward</span>
          </button>

          <button 
            className="role-btn receptionist-role" 
            onClick={() => handleLogin('receptionist')}
          >
            <div className="role-icon">
              <span className="material-symbols-outlined">front_desk</span>
            </div>
            <div className="role-text">
              <div className="role-name text-label-lg">Receptionist Module</div>
              <div className="role-desc text-body-sm">Patient intake, registry, flow management</div>
            </div>
            <span className="material-symbols-outlined arrow-icon">arrow_forward</span>
          </button>
        </div>

        <div className="login-footer">
          <p className="text-body-sm">SIH26047 Patient Case-Taking Software Prototype</p>
        </div>
      </div>
    </div>
  );
}
