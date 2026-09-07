import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import SearchInput from '../../components/shared/SearchInput';
import EmptyState from '../../components/shared/EmptyState';
import './DoctorPatients.css'; // Re-use the table styling from DoctorPatients

export default function DoctorConsultations() {
  const [consultations, setConsultations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState(null);

  useEffect(() => {
    const fetchConsultations = async () => {
      setLoading(true);
      // Fetch consultations and join with patients table to get patient names
      let query = supabase
        .from('consultations')
        .select('*, patients(first_name, last_name, phone_number)')
        .order('created_at', { ascending: false });
        
      const { data, error } = await query;
      
      if (!error && data) {
        setConsultations(data);
      }
      setLoading(false);
    };

    fetchConsultations();
  }, []);

  const filteredConsultations = consultations.filter(c => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const patientName = c.patients ? (c.patients.first_name + ' ' + c.patients.last_name).toLowerCase() : '';
    const phone = c.patients?.phone_number || '';
    const dx = c.diagnosis?.primary?.toLowerCase() || '';
    return patientName.includes(q) || phone.includes(q) || dx.includes(q);
  });

  return (
    <div className="doctor-patients">
      <div className="page-header">
        <div>
          <h1 className="text-display">Past Consultations</h1>
          <p className="text-body-lg" style={{ color: 'var(--on-surface-variant)' }}>
            Review completed case sheets and historical records.
          </p>
        </div>
      </div>

      <div className="directory-container">
        <div className="directory-toolbar">
          <div className="search-container">
            <SearchInput 
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by Patient Name or Diagnosis"
              shortcut="⌘K"
              autoFocus={true}
            />
          </div>
        </div>

        <div className="directory-table-wrapper">
          <table className="directory-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Patient Details</th>
                <th>Visit #</th>
                <th>Primary Diagnosis</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="empty-cell">
                    <div className="loading">Loading consultations...</div>
                  </td>
                </tr>
              ) : filteredConsultations.length > 0 ? (
                filteredConsultations.map(c => (
                  <tr key={c.id}>
                    <td className="text-body-sm">
                      {new Date(c.created_at).toLocaleDateString()}<br/>
                      <span style={{ color: 'var(--on-surface-variant)' }}>
                        {new Date(c.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </td>
                    <td>
                      <div className="patient-name-cell">
                        <div className="text-label-md">
                          {c.patients ? (c.patients.first_name + ' ' + c.patients.last_name) : 'Unknown Patient'}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="demographic-pill border">Visit {c.visit_number || 1}</span>
                    </td>
                    <td>
                      <div className="text-body-md" style={{ fontWeight: '500' }}>
                        {c.diagnosis?.primary || 'No diagnosis recorded'}
                      </div>
                    </td>
                    <td>
                      <span className="demographic-pill" style={{ background: 'var(--primary-container)', color: 'var(--on-primary-container)' }}>
                        {c.status}
                      </span>
                    </td>
                    <td className="text-right actions-cell">
                      <button 
                        className="btn btn-outline" 
                        style={{ height: '32px', padding: '0 12px', fontSize: '13px' }}
                        onClick={() => setSelectedCase(c)}
                      >
                        View Case Sheet
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="empty-cell">
                    <EmptyState 
                      icon="history"
                      title="No consultations found"
                      description="You haven't completed any consultations yet, or none match your search."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Case Sheet Modal */}
      {selectedCase && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px' }}>
          <div style={{ background: 'var(--surface)', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', borderRadius: '12px', padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }}>
            <button 
              className="icon-button" 
              style={{ position: 'absolute', top: '16px', right: '16px' }}
              onClick={() => setSelectedCase(null)}
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <div>
              <h2 className="text-headline-md">Case Sheet � Visit {selectedCase.visit_number}</h2>
              <p className="text-body-md" style={{ color: 'var(--on-surface-variant)' }}>
                {selectedCase.patients ? (selectedCase.patients.first_name + ' ' + selectedCase.patients.last_name) : 'Unknown Patient'} � {new Date(selectedCase.created_at).toLocaleString()}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div style={{ background: 'var(--surface-container-low)', padding: '16px', borderRadius: '8px' }}>
                <h3 className="text-label-md" style={{ marginBottom: '12px', color: 'var(--primary)' }}>Vitals</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div className="text-body-sm"><b>BP:</b> {selectedCase.vitals?.bp || '-'}</div>
                  <div className="text-body-sm"><b>HR:</b> {selectedCase.vitals?.hr || '-'}</div>
                  <div className="text-body-sm"><b>Temp:</b> {selectedCase.vitals?.temp || '-'}</div>
                  <div className="text-body-sm"><b>SpO2:</b> {selectedCase.vitals?.spo2 || '-'}</div>
                  <div className="text-body-sm"><b>Weight:</b> {selectedCase.vitals?.weight || '-'}</div>
                  <div className="text-body-sm"><b>Height:</b> {selectedCase.vitals?.height || '-'}</div>
                </div>
              </div>

              <div style={{ background: 'var(--surface-container-low)', padding: '16px', borderRadius: '8px' }}>
                <h3 className="text-label-md" style={{ marginBottom: '12px', color: 'var(--primary)' }}>Diagnosis</h3>
                <div className="text-body-md" style={{ fontWeight: 'bold' }}>{selectedCase.diagnosis?.primary || 'None'}</div>
                {selectedCase.diagnosis?.secondary?.length > 0 && (
                  <div className="text-body-sm mt-sm">Secondary: {selectedCase.diagnosis.secondary.join(', ')}</div>
                )}
                <div className="text-body-sm mt-sm">Status: {selectedCase.diagnosis?.status || 'Unknown'}</div>
              </div>
            </div>

            {selectedCase.symptoms?.length > 0 && (
              <div>
                <h3 className="text-label-md" style={{ marginBottom: '8px' }}>Symptoms</h3>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {selectedCase.symptoms.map((s, i) => (
                    <span key={i} className="demographic-pill border">
                      {s.name} ({s.duration}, {s.severity})
                    </span>
                  ))}
                </div>
              </div>
            )}

            {selectedCase.prescriptions?.length > 0 && (
              <div>
                <h3 className="text-label-md" style={{ marginBottom: '8px' }}>Prescriptions</h3>
                <table className="directory-table" style={{ background: 'var(--surface-container-lowest)' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '8px' }}>Medication</th>
                      <th style={{ padding: '8px' }}>Dosage</th>
                      <th style={{ padding: '8px' }}>Frequency</th>
                      <th style={{ padding: '8px' }}>Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedCase.prescriptions.map((rx, i) => (
                      <tr key={i}>
                        <td style={{ padding: '8px' }} className="text-body-sm"><b>{rx.medication}</b></td>
                        <td style={{ padding: '8px' }} className="text-body-sm">{rx.dosage}</td>
                        <td style={{ padding: '8px' }} className="text-body-sm">{rx.frequency}</td>
                        <td style={{ padding: '8px' }} className="text-body-sm">{rx.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {selectedCase.advice?.labTests && (
              <div>
                <h3 className="text-label-md" style={{ marginBottom: '8px' }}>Lab Tests Ordered</h3>
                <div className="text-body-sm" style={{ padding: '12px', background: 'var(--surface-container-low)', borderRadius: '6px' }}>
                  {selectedCase.advice.labTests}
                </div>
              </div>
            )}

            {selectedCase.notes && (
              <div>
                <h3 className="text-label-md" style={{ marginBottom: '8px' }}>Clinical Notes</h3>
                <div className="text-body-sm" style={{ padding: '12px', background: 'var(--surface-container-low)', borderRadius: '6px', whiteSpace: 'pre-wrap' }}>
                  {selectedCase.notes}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
