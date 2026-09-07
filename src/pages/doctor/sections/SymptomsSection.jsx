import { useState } from 'react';
import './FormSection.css';

export default function SymptomsSection({ symptoms, setSymptoms }) {
  const [newSymptom, setNewSymptom] = useState('');
  const [duration, setDuration] = useState('');
  const [severity, setSeverity] = useState('Mild');

  const QUICK_SYMPTOMS = ['Fever', 'Cough', 'Headache', 'Nausea', 'Body Ache', 'Fatigue'];

  const handleQuickAdd = (symp) => {
    setNewSymptom(symp);
  };

  const handleAddSymptom = () => {
    if (!newSymptom) return;
    
    setSymptoms(prev => [...prev, {
      id: Date.now().toString(),
      name: newSymptom,
      duration: duration || 'Not specified',
      severity: severity
    }]);
    
    setNewSymptom('');
    setDuration('');
    setSeverity('Mild');
  };

  const handleRemoveSymptom = (id) => {
    setSymptoms(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="form-section">
      <div className="section-header">
        <div className="section-title">
          <span className="material-symbols-outlined icon">personal_injury</span>
          <h2 className="text-headline-sm">Chief Complaints & Symptoms</h2>
        </div>
      </div>

      <div className="symptoms-container">
        <div className="quick-select-chips" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
          <span className="text-label-sm" style={{ display: 'flex', alignItems: 'center', marginRight: '8px' }}>Quick Add:</span>
          {QUICK_SYMPTOMS.map(symp => (
            <button key={symp} type="button" className="chip" onClick={() => handleQuickAdd(symp)}>
              + {symp}
            </button>
          ))}
        </div>

        <div className="symptoms-input-row">
          <div className="vital-input-group">
            <label>Symptom</label>
            <input 
              type="text" 
              value={newSymptom} 
              onChange={(e) => setNewSymptom(e.target.value)} 
              placeholder="e.g. Headache, Fever, Cough" 
            />
          </div>
          <div className="vital-input-group">
            <label>Duration</label>
            <input 
              type="text" 
              value={duration} 
              onChange={(e) => setDuration(e.target.value)} 
              placeholder="e.g. 2 days" 
            />
          </div>
          <div className="vital-input-group">
            <label>Severity</label>
            <select value={severity} onChange={(e) => setSeverity(e.target.value)}>
              <option>Mild</option>
              <option>Moderate</option>
              <option>Severe</option>
            </select>
          </div>
          <button 
            type="button" 
            className="btn btn-primary" 
            onClick={handleAddSymptom}
            disabled={!newSymptom}
          >
            <span className="material-symbols-outlined">add</span> Add
          </button>
        </div>

        {symptoms.length > 0 && (
          <div className="symptoms-list">
            {symptoms.map(symptom => (
              <div key={symptom.id} className="symptom-item">
                <div className="symptom-info">
                  <span className="symptom-name">{symptom.name}</span>
                  <span className="symptom-meta">Duration: {symptom.duration}</span>
                  <span className={`demographic-pill ${symptom.severity.toLowerCase()}`}>
                    {symptom.severity}
                  </span>
                </div>
                <button 
                  type="button" 
                  className="icon-button small" 
                  onClick={() => handleRemoveSymptom(symptom.id)}
                  style={{ color: 'var(--error)' }}
                >
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
