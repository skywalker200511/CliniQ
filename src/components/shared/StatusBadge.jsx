import './StatusBadge.css';

export default function StatusBadge({ status, type = 'default', icon = null }) {
  // Determine variant based on type or status string
  let variant = 'default';
  
  if (type !== 'default') {
    variant = type;
  } else {
    const s = status.toLowerCase();
    if (s.includes('completed') || s.includes('normal') || s.includes('optimal')) {
      variant = 'success';
    } else if (s.includes('waiting') || s.includes('pending')) {
      variant = 'warning';
    } else if (s.includes('doctor') || s.includes('active') || s.includes('serving')) {
      variant = 'primary';
    } else if (s.includes('error') || s.includes('high') || s.includes('abnormal')) {
      variant = 'error';
    }
  }

  return (
    <span className={`status-badge badge-${variant}`}>
      {icon && <span className="material-symbols-outlined badge-icon">{icon}</span>}
      {status}
    </span>
  );
}
