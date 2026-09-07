import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import SearchInput from '../../components/shared/SearchInput';
import EmptyState from '../../components/shared/EmptyState';
import './DoctorPatients.css'; // Re-use the table styling from DoctorPatients

export default function DoctorConsultations() {
  const [consultations, setConsultations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

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
              shortcut="?K"
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
                      <button className="btn btn-outline" style={{ height: '32px', padding: '0 12px', fontSize: '13px' }}>
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
    </div>
  );
}
