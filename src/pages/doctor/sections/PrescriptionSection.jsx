import { useState } from 'react';
import './FormSection.css';

export default function PrescriptionSection({ prescriptions, setPrescriptions }) {
  const initialRxState = {
    medication: '',
    dosage: '',
    frequency: '1-0-1 (Twice daily)',
    duration: '',
    instructions: ''
  };

  const [newRx, setNewRx] = useState(initialRxState);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewRx(prev => ({ ...prev, [name]: value }));
  };

  const handleAddPrescription = () => {
    if (!newRx.medication || !newRx.dosage) return;

    setPrescriptions(prev => [...prev, {
      id: Date.now().toString(),
      ...newRx
    }]);

    setNewRx(initialRxState);
  };

  const handleRemovePrescription = (id) => {
    setPrescriptions(prev => prev.filter(rx => rx.id !== id));
  };

  const QUICK_MEDS = [
    { name: 'Paracetamol', dosage: '500mg', duration: '3 days', instructions: 'After meals' },
    { name: 'Amoxicillin', dosage: '250mg', duration: '5 days', instructions: 'After meals' },
    { name: 'Cetirizine', dosage: '10mg', duration: '5 days', instructions: 'Before sleep' },
    { name: 'Pantoprazole', dosage: '40mg', duration: '5 days', instructions: 'Empty stomach' }
  ];

  const handleQuickAdd = (med) => {
    setPrescriptions(prev => [...prev, {
      id: Date.now().toString() + Math.random(),
      medication: med.name,
      dosage: med.dosage,
      frequency: '1-0-1 (Twice daily)',
      duration: med.duration,
      instructions: med.instructions
    }]);
  };

  return (
    <div className="form-section">
      <div className="section-header">
        <div className="section-title">
          <span className="material-symbols-outlined icon">prescriptions</span>
          <h2 className="text-headline-sm">Treatment & Prescriptions</h2>
        </div>
      </div>

      <div className="prescription-container">
        <div className="quick-select-chips" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px', width: '100%' }}>
          <span className="text-label-sm" style={{ display: 'flex', alignItems: 'center', marginRight: '8px' }}>Quick Add Rx:</span>
          {QUICK_MEDS.map(med => (
            <button key={med.name} type="button" className="chip" onClick={() => handleQuickAdd(med)}>
              + {med.name} {med.dosage}
            </button>
          ))}
        </div>

        <div className="rx-input-grid">
          <div className="vital-input-group">
            <label>Medication Name</label>
            <input 
              type="text" 
              name="medication" 
              value={newRx.medication} 
              onChange={handleChange} 
              placeholder="e.g. Paracetamol" 
            />
          </div>
          <div className="vital-input-group">
            <label>Dosage</label>
            <input 
              type="text" 
              name="dosage" 
              value={newRx.dosage} 
              onChange={handleChange} 
              placeholder="e.g. 500mg" 
            />
          </div>
          <div className="vital-input-group">
            <label>Frequency</label>
            <select name="frequency" value={newRx.frequency} onChange={handleChange}>
              <option>1-0-0 (Morning only)</option>
              <option>1-0-1 (Twice daily)</option>
              <option>1-1-1 (Thrice daily)</option>
              <option>0-0-1 (Night only)</option>
              <option>SOS (As needed)</option>
            </select>
          </div>
          <div className="vital-input-group">
            <label>Duration</label>
            <input 
              type="text" 
              name="duration" 
              value={newRx.duration} 
              onChange={handleChange} 
              placeholder="e.g. 5 days" 
            />
          </div>
          <button 
            type="button" 
            className="btn btn-primary" 
            onClick={handleAddPrescription}
            disabled={!newRx.medication || !newRx.dosage}
            style={{ height: '48px', marginBottom: '2px' }}
          >
            <span className="material-symbols-outlined">add</span> Add Rx
          </button>
        </div>

        {newRx.medication && (
          <div className="vital-input-group">
            <input 
              type="text" 
              name="instructions" 
              value={newRx.instructions} 
              onChange={handleChange} 
              placeholder="Special instructions (e.g. Take after meals)..." 
              style={{ background: 'var(--surface-container-low)', border: 'none' }}
            />
          </div>
        )}

        {prescriptions.length > 0 && (
          <div className="rx-list mt-md">
            <h3 className="text-label-md mb-sm" style={{ color: 'var(--on-surface-variant)' }}>Current Prescriptions</h3>
            {prescriptions.map((rx, idx) => (
              <div key={rx.id} className="rx-item">
                <div className="rx-name">
                  <span className="material-symbols-outlined">medication</span>
                  {rx.medication} {rx.dosage}
                </div>
                <div className="rx-meta">Freq: {rx.frequency}</div>
                <div className="rx-meta">Dur: {rx.duration}</div>
                <div className="rx-meta">{rx.instructions}</div>
                <button 
                  type="button" 
                  className="icon-button small" 
                  onClick={() => handleRemovePrescription(rx.id)}
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
