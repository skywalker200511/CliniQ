import './EmptyState.css';

export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className="empty-state animate-fade-in">
      <div className="empty-state-icon">
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-description">{description}</p>
      {action && (
        <div className="empty-state-action">
          {action}
        </div>
      )}
    </div>
  );
}
