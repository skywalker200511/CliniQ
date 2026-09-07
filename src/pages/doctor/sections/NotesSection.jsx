import './FormSection.css';

export default function NotesSection({ notes, setNotes }) {
  return (
    <div className="form-section">
      <div className="section-header">
        <div className="section-title">
          <span className="material-symbols-outlined icon">edit_note</span>
          <h2 className="text-headline-sm">Clinical Notes & Follow-up</h2>
        </div>
      </div>

      <div className="vital-input-group">
        <label>Detailed Observations & Advice</label>
        <textarea 
          value={notes} 
          onChange={(e) => setNotes(e.target.value)} 
          placeholder="Enter clinical observations, dietary advice, lifestyle modifications..."
          rows="4"
          style={{ resize: 'vertical', minHeight: '100px' }}
        ></textarea>
      </div>

      <div className="vital-input-group" style={{ marginTop: 'var(--gutter-lg)' }}>
        <label>Follow-up Schedule</label>
        <div style={{ display: 'flex', gap: 'var(--gutter-md)' }}>
          <select style={{ width: '200px' }}>
            <option>No follow-up needed</option>
            <option>In 3 days</option>
            <option>In 1 week</option>
            <option>In 2 weeks</option>
            <option>In 1 month</option>
            <option>Custom date...</option>
          </select>
        </div>
      </div>
    </div>
  );
}
