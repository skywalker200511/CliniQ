import './FormSection.css';

export default function VitalsSection({ vitals, setVitals }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setVitals(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="form-section">
      <div className="section-header">
        <div className="section-title">
          <span className="material-symbols-outlined icon">monitor_heart</span>
          <h2 className="text-headline-sm">Vitals & Measurements</h2>
        </div>
        <button className="btn btn-outline btn-sm">
          <span className="material-symbols-outlined">devices</span> Sync Device
        </button>
      </div>

      <div className="vitals-grid">
        <div className="vital-input-group">
          <label>Blood Pressure <span className="unit">(mmHg)</span></label>
          <input 
            type="text" 
            name="bp" 
            value={vitals.bp} 
            onChange={handleChange} 
            placeholder="120/80" 
            className="vital-input"
          />
        </div>

        <div className="vital-input-group">
          <label>Heart Rate <span className="unit">(bpm)</span></label>
          <input 
            type="number" 
            name="hr" 
            value={vitals.hr} 
            onChange={handleChange} 
            placeholder="72" 
            className="vital-input"
          />
        </div>

        <div className="vital-input-group">
          <label>Temperature <span className="unit">(°F)</span></label>
          <input 
            type="number" 
            name="temp" 
            value={vitals.temp} 
            onChange={handleChange} 
            placeholder="98.6" 
            step="0.1"
            className="vital-input"
          />
        </div>

        <div className="vital-input-group">
          <label>SpO2 <span className="unit">(%)</span></label>
          <input 
            type="number" 
            name="spo2" 
            value={vitals.spo2} 
            onChange={handleChange} 
            placeholder="98" 
            className="vital-input"
          />
        </div>

        <div className="vital-input-group">
          <label>Weight <span className="unit">(kg)</span></label>
          <input 
            type="number" 
            name="weight" 
            value={vitals.weight} 
            onChange={handleChange} 
            placeholder="70" 
            className="vital-input"
          />
        </div>

        <div className="vital-input-group">
          <label>Height <span className="unit">(cm)</span></label>
          <input 
            type="number" 
            name="height" 
            value={vitals.height} 
            onChange={handleChange} 
            placeholder="175" 
            className="vital-input"
          />
        </div>
      </div>
    </div>
  );
}
