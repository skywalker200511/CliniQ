import './Toast.css';
import { useAppContext } from '../../data/store';

export default function ToastContainer() {
  const { state, dispatch } = useAppContext();
  
  if (!state.toasts || state.toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {state.toasts.map((toast) => (
        <div key={toast.id} className="toast animate-fade-in-scale">
          {toast.icon && <span className="material-symbols-outlined icon-filled toast-icon">{toast.icon}</span>}
          <span className="toast-message">{toast.message}</span>
          <button 
            className="toast-close"
            onClick={() => dispatch({ type: 'REMOVE_TOAST', payload: toast.id })}
            aria-label="Close"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      ))}
    </div>
  );
}
