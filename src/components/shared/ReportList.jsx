import { useState, useEffect } from 'react';
import { getPatientReports, getReportTypeInfo, resolvePatientModuleId, subscribeToPatientReports } from '../../services/reportService';
import { patientModuleSupabase } from '../../lib/patientModuleSupabase';
import Modal from './Modal';
import './ReportList.css';

/**
 * Reusable component that displays a patient's reports/documents
 * collected from the patient module (table: patient_reports).
 *
 * Props:
 *   patientId - the patient's ID (clinic UUID or patient module UUID)
 *   patientName - display name
 *   source - 'clinic' or 'patient_module' (determines how we look up reports)
 */
export default function ReportList({ patientId, patientName, source = 'clinic' }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    if (!patientId) return;

    let channel = null;

    const fetchReports = async () => {
      setLoading(true);
      const data = await getPatientReports(patientId, source);
      setReports(data);
      setLoading(false);

      // Set up realtime subscription
      const pmId = source === 'patient_module'
        ? patientId
        : await resolvePatientModuleId({ id: patientId, source: 'clinic' });

      if (pmId) {
        channel = subscribeToPatientReports(pmId, (newReport) => {
          setReports((prev) => [newReport, ...prev]);
        });
      }
    };

    fetchReports();

    return () => {
      if (channel) {
        patientModuleSupabase.removeChannel(channel);
      }
    };
  }, [patientId, source]);

  /** Format file size for display */
  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  /** Render a preview card for a single report */
  const renderReportCard = (report) => {
    const typeInfo = getReportTypeInfo(report);
    const mimeType = (report.mime_type || '').toLowerCase();
    const isImage = mimeType.startsWith('image/');

    return (
      <div
        key={report.id}
        className="report-card"
        onClick={() => setSelectedReport(report)}
      >
        {/* Thumbnail area */}
        <div className="report-card-thumb" style={{ borderLeftColor: typeInfo.color }}>
          {isImage && report.file_url ? (
            <img src={report.file_url} alt={report.report_name || 'Report'} className="report-thumb-img" />
          ) : (
            <span className="material-symbols-outlined report-thumb-icon" style={{ color: typeInfo.color }}>
              {typeInfo.icon}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="report-card-info">
          <div className="report-card-title text-label-md">
            {report.report_name || typeInfo.label}
          </div>
          <div className="report-card-meta text-body-sm">
            <span className="report-type-badge" style={{ background: typeInfo.color + '18', color: typeInfo.color }}>
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>{typeInfo.icon}</span>
              {typeInfo.label}
            </span>
            {report.report_date && (
              <span className="report-date">
                {new Date(report.report_date).toLocaleDateString()}
              </span>
            )}
            {report.file_size > 0 && (
              <span className="report-date">{formatFileSize(report.file_size)}</span>
            )}
          </div>
          {report.description && (
            <div className="report-card-desc text-body-sm">{report.description}</div>
          )}
        </div>

        {/* Chevron */}
        <span className="material-symbols-outlined report-card-chevron">chevron_right</span>
      </div>
    );
  };

  /** Render the full report in the modal */
  const renderReportDetail = (report) => {
    const typeInfo = getReportTypeInfo(report);
    const mimeType = (report.mime_type || '').toLowerCase();
    const isImage = mimeType.startsWith('image/');
    const isPdf = mimeType === 'application/pdf';

    return (
      <div className="report-detail">
        {/* Type badge & date */}
        <div className="report-detail-header">
          <span className="report-type-badge" style={{ background: typeInfo.color + '18', color: typeInfo.color }}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{typeInfo.icon}</span>
            {typeInfo.label}
          </span>
          <div className="text-body-sm" style={{ color: 'var(--on-surface-variant)', display: 'flex', gap: '12px' }}>
            {report.report_date && <span>Report Date: {new Date(report.report_date).toLocaleDateString()}</span>}
            {report.uploaded_at && <span>Uploaded: {new Date(report.uploaded_at).toLocaleString()}</span>}
          </div>
        </div>

        {/* File info */}
        {(report.file_name || report.file_size) && (
          <div className="text-body-sm" style={{ color: 'var(--on-surface-variant)', display: 'flex', gap: '12px', alignItems: 'center' }}>
            {report.file_name && <span>📄 {report.file_name}</span>}
            {report.file_size > 0 && <span>({formatFileSize(report.file_size)})</span>}
          </div>
        )}

        {/* Description */}
        {report.description && (
          <div className="report-detail-desc text-body-md">
            {report.description}
          </div>
        )}

        {/* Image preview */}
        {isImage && report.file_url && (
          <div className="report-detail-image-wrap">
            <img src={report.file_url} alt={report.report_name || 'Report'} className="report-detail-image" />
          </div>
        )}

        {/* PDF embed */}
        {isPdf && report.file_url && (
          <div className="report-detail-pdf-wrap">
            <iframe src={report.file_url} title={report.report_name || 'PDF Report'} className="report-detail-pdf" />
          </div>
        )}

        {/* Download link */}
        {report.file_url && (
          <a href={report.file_url} target="_blank" rel="noopener noreferrer" className="btn btn-outline report-download-btn">
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>download</span>
            Download Original
          </a>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="report-list-loading">
        <div className="loading">Loading patient reports...</div>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="report-list-empty">
        <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--outline)', marginBottom: '12px' }}>folder_open</span>
        <div className="text-label-md" style={{ color: 'var(--on-surface-variant)' }}>No reports found</div>
        <div className="text-body-sm" style={{ color: 'var(--outline)' }}>
          Reports uploaded by the patient will appear here automatically.
        </div>
      </div>
    );
  }

  return (
    <div className="report-list">
      <div className="report-list-header">
        <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>folder_shared</span>
        <span className="text-label-md">Patient Reports ({reports.length})</span>
      </div>

      <div className="report-list-grid">
        {reports.map(renderReportCard)}
      </div>

      {/* Detail modal */}
      <Modal
        isOpen={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        title={selectedReport?.report_name || selectedReport?.report_type || 'Report Details'}
        icon="description"
        size="lg"
      >
        {selectedReport && renderReportDetail(selectedReport)}
      </Modal>
    </div>
  );
}
