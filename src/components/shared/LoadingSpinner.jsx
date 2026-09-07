import './LoadingSpinner.css';

export default function LoadingSpinner({ size = 'md', fullPage = false }) {
  const spinner = (
    <div className={`spinner-container spinner-${size}`}>
      <div className="spinner"></div>
    </div>
  );

  if (fullPage) {
    return (
      <div className="spinner-full-page">
        {spinner}
      </div>
    );
  }

  return spinner;
}
