import { useState } from 'react';
import './FormSection.css';

export default function AdviceSection({ advice, setAdvice }) {
  const handleAdviceChange = (e) => {
    setAdvice(prev => ({ ...prev, text: e.target.value }));
  };

  const handleFollowUpChange = (e) => {
    setAdvice(prev => ({ ...prev, followUpDays: e.target.value }));
  };

  const handleLabChange = (e) => {
    setAdvice(prev => ({ ...prev, labTests: e.target.value }));
  };

  const QUICK_LABS = ['CBC', 'Lipid Profile', 'HbA1c', 'TSH', 'Urine Routine'];

  const handleQuickLabAdd = (lab) => {
    setAdvice(prev => ({
      ...prev,
      labTests: prev.labTests ? prev.labTests + ', ' + lab : lab
    }));
  };

  return (
    <div className="form-section">
      <div className="section-header">
        <div className="section-title">
          <span className="material-symbols-outlined icon">health_and_safety</span>
          <h2 className="text-headline-sm">Follow-up, Labs & Advice</h2>
        </div>
      </div>

      <div className="advice-container">
        <div className="vital-input-group" style={{ marginBottom: '16px' }}>
          <label>General Advice / Diet Restrictions</label>
          <textarea 
            rows="3"
            value={advice?.text || ''} 
            onChange={handleAdviceChange} 
            placeholder="e.g. Drink plenty of fluids, avoid spicy food..."
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--outline-variant)', background: 'var(--surface-container-low)', fontFamily: 'inherit' }}
          />
        </div>

        <div className="vital-input-group" style={{ marginBottom: '16px' }}>
          <label>Recommended Lab Tests</label>
          <div className="quick-select-chips" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
            {QUICK_LABS.map(lab => (
              <button key={lab} type="button" className="chip" onClick={() => handleQuickLabAdd(lab)}>
                + {lab}
              </button>
            ))}
          </div>
          <input 
            type="text" 
            value={advice?.labTests || ''} 
            onChange={handleLabChange} 
            placeholder="e.g. CBC, Liver Function Test" 
          />
        </div>

        <div className="vital-input-group">
          <label>Follow-up Date</label>
          <select value={advice?.followUpDays || ''} onChange={handleFollowUpChange}>
            <option value="">No follow-up needed</option>
            <option value="3">Review after 3 days</option>
            <option value="5">Review after 5 days</option>
            <option value="7">Review after 1 week</option>
            <option value="14">Review after 2 weeks</option>
            <option value="30">Review after 1 month</option>
          </select>
        </div>
      </div>
    </div>
  );
}
