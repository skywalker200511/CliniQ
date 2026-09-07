import { useState } from 'react';
import './FormSection.css';

export default function DiagnosisSection({ diagnosis, setDiagnosis }) {
  const [newSecondary, setNewSecondary] = useState('');

  const handleStatusChange = (status) => {
    setDiagnosis(prev => ({ ...prev, status }));
  };

  const handlePrimaryChange = (e) => {
    setDiagnosis(prev => ({ ...prev, primary: e.target.value }));
  };

  const handleAddSecondary = (e) => {
    if (e.key === 'Enter' && newSecondary.trim()) {
      e.preventDefault();
      setDiagnosis(prev => ({
        ...prev,
        secondary: [...prev.secondary, newSecondary.trim()]
      }));
      setNewSecondary('');
    }
  };

  const handleRemoveSecondary = (index) => {
    setDiagnosis(prev => ({
      ...prev,
      secondary: prev.secondary.filter((_, i) => i !== index)
    }));
  };

  const QUICK_DIAGNOSES = ['Viral Fever', 'Common Cold', 'Hypertension', 'Type 2 Diabetes', 'Acute Gastroenteritis'];

  const handleQuickAdd = (dx) => {
    setDiagnosis(prev => ({ ...prev, primary: dx }));
  };

  return (
    <div className="form-section">
      <div className="section-header">
        <div className="section-title">
          <span className="material-symbols-outlined icon">clinical_notes</span>
          <h2 className="text-headline-sm">Diagnosis & Assessment</h2>
        </div>
      </div>

      <div className="diagnosis-status-toggle">
        <button 
          className={`status-btn ${diagnosis.status === 'Preliminary' ? 'active' : ''}`}
          onClick={() => handleStatusChange('Preliminary')}
          type="button"
        >
          Preliminary / Provisional
        </button>
        <button 
          className={`status-btn ${diagnosis.status === 'Confirmed' ? 'active confirmed' : ''}`}
          onClick={() => handleStatusChange('Confirmed')}
          type="button"
        >
          Confirmed Final
        </button>
      </div>

      <div className="diagnosis-grid">
        <div className="quick-select-chips" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px', width: '100%' }}>
          <span className="text-label-sm" style={{ display: 'flex', alignItems: 'center', marginRight: '8px' }}>Quick Add Primary:</span>
          {QUICK_DIAGNOSES.map(dx => (
            <button key={dx} type="button" className="chip" onClick={() => handleQuickAdd(dx)}>
              + {dx}
            </button>
          ))}
        </div>

        <div className="vital-input-group">
          <label>Primary Diagnosis (ICD-10)</label>
          <div className="input-wrapper">
            <input 
              type="text" 
              value={diagnosis.primary} 
              onChange={handlePrimaryChange} 
              placeholder="Search diagnosis or ICD-10 code..." 
              list="icd10-suggestions"
            />
          </div>
          <datalist id="icd10-suggestions">
            <option value="J02.9 - Acute pharyngitis, unspecified" />
            <option value="I10 - Essential (primary) hypertension" />
            <option value="E11.9 - Type 2 diabetes mellitus without complications" />
            <option value="R50.9 - Fever, unspecified" />
          </datalist>
        </div>

        <div className="vital-input-group">
          <label>Secondary Diagnoses / Comorbidities</label>
          <input 
            type="text" 
            value={newSecondary} 
            onChange={(e) => setNewSecondary(e.target.value)} 
            onKeyDown={handleAddSecondary}
            placeholder="Type and press Enter to add..." 
          />
          
          {diagnosis.secondary.length > 0 && (
            <div className="diagnosis-chips">
              {diagnosis.secondary.map((sec, idx) => (
                <div key={idx} className="dx-chip">
                  <span>{sec}</span>
                  <button type="button" onClick={() => handleRemoveSecondary(idx)}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
