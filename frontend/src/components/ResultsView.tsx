'use client';

import React, { useState, useCallback } from 'react';
import { CRMRecord, SkippedRecord } from '@/types';

interface ResultsViewProps {
  successRecords: CRMRecord[];
  skippedRecords: SkippedRecord[];
  totalProcessed: number;
  onStartOver: () => void;
}

const CRM_HEADERS: { key: keyof CRMRecord; label: string }[] = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'country_code', label: 'Code' },
  { key: 'mobile_without_country_code', label: 'Mobile' },
  { key: 'company', label: 'Company' },
  { key: 'city', label: 'City' },
  { key: 'state', label: 'State' },
  { key: 'country', label: 'Country' },
  { key: 'crm_status', label: 'Status' },
  { key: 'lead_owner', label: 'Lead Owner' },
  { key: 'data_source', label: 'Source' },
  { key: 'created_at', label: 'Created At' },
  { key: 'crm_note', label: 'Notes' },
  { key: 'possession_time', label: 'Possession' },
  { key: 'description', label: 'Description' },
];

function getStatusBadgeStyle(status: string): React.CSSProperties {
  const base: React.CSSProperties = {
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: '9999px',
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.3px',
    whiteSpace: 'nowrap',
  };

  switch (status) {
    case 'GOOD_LEAD_FOLLOW_UP':
      return { ...base, background: 'rgba(16,185,129,0.15)', color: '#10B981' };
    case 'DID_NOT_CONNECT':
      return { ...base, background: 'rgba(59,130,246,0.15)', color: '#3B82F6' };
    case 'BAD_LEAD':
      return { ...base, background: 'rgba(239,68,68,0.15)', color: '#EF4444' };
    case 'SALE_DONE':
      return { ...base, background: 'rgba(139,92,246,0.15)', color: '#8B5CF6' };
    default:
      return { ...base, background: 'rgba(100,116,139,0.15)', color: '#94A3B8' };
  }
}

export default function ResultsView({
  successRecords,
  skippedRecords,
  totalProcessed,
  onStartOver,
}: ResultsViewProps) {
  const [activeTab, setActiveTab] = useState<'imported' | 'skipped'>('imported');

  const handleDownloadCSV = useCallback(() => {
    if (successRecords.length === 0) return;

    const keys = CRM_HEADERS.map((h) => h.key);
    const headerLine = keys.join(',');
    const dataLines = successRecords.map((record) =>
      keys
        .map((key) => {
          const val = record[key] || '';
          // Escape CSV values
          if (val.includes(',') || val.includes('"') || val.includes('\n')) {
            return `"${val.replace(/"/g, '""')}"`;
          }
          return val;
        })
        .join(',')
    );

    const csv = [headerLine, ...dataLines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `groweasy_crm_import_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [successRecords]);

  const handleDownloadJSON = useCallback(() => {
    if (successRecords.length === 0) return;

    const json = JSON.stringify(successRecords, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `groweasy_crm_import_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [successRecords]);

  return (
    <div className="animate-fade-in-up">
      {/* Stats */}
      <div className="stats-grid" id="results-stats">
        <div className="stat-card">
          <div className="stat-icon info">📊</div>
          <div className="stat-value">{totalProcessed}</div>
          <div className="stat-label">Total Processed</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon success">✅</div>
          <div className="stat-value">{successRecords.length}</div>
          <div className="stat-label">Successfully Imported</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon warning">⚠️</div>
          <div className="stat-value">{skippedRecords.length}</div>
          <div className="stat-label">Skipped Records</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="results-tabs" id="results-tabs">
        <button
          className={`results-tab ${activeTab === 'imported' ? 'active' : ''}`}
          onClick={() => setActiveTab('imported')}
          id="tab-imported"
        >
          Imported Records
          <span className="tab-badge success">{successRecords.length}</span>
        </button>
        <button
          className={`results-tab ${activeTab === 'skipped' ? 'active' : ''}`}
          onClick={() => setActiveTab('skipped')}
          id="tab-skipped"
        >
          Skipped Records
          <span className="tab-badge warning">{skippedRecords.length}</span>
        </button>
      </div>

      {/* Imported Records Table */}
      {activeTab === 'imported' && (
        <div className="table-container animate-fade-in" id="imported-table">
          <div className="table-header-bar">
            <span className="table-title">CRM Records</span>
            <span className="table-badge">{successRecords.length} records</span>
          </div>
          {successRecords.length > 0 ? (
            <div className="table-scroll-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="row-num">#</th>
                    {CRM_HEADERS.map((h) => (
                      <th key={h.key}>{h.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {successRecords.map((record, idx) => (
                    <tr key={idx}>
                      <td className="row-num">{idx + 1}</td>
                      {CRM_HEADERS.map((h) => (
                        <td key={h.key} title={record[h.key] || ''}>
                          {h.key === 'crm_status' && record[h.key] ? (
                            <span style={getStatusBadgeStyle(record[h.key])}>
                              {record[h.key].replace(/_/g, ' ')}
                            </span>
                          ) : (
                            record[h.key] || '—'
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📭</div>
              <p>No records were successfully imported.</p>
            </div>
          )}
        </div>
      )}

      {/* Skipped Records Table */}
      {activeTab === 'skipped' && (
        <div className="table-container animate-fade-in" id="skipped-table">
          <div className="table-header-bar">
            <span className="table-title">Skipped Records</span>
            <span className="table-badge">{skippedRecords.length} records</span>
          </div>
          {skippedRecords.length > 0 ? (
            <div className="table-scroll-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="row-num">#</th>
                    <th>Reason</th>
                    <th>Original Data</th>
                  </tr>
                </thead>
                <tbody>
                  {skippedRecords.map((record, idx) => (
                    <tr key={idx}>
                      <td className="row-num">{idx + 1}</td>
                      <td>
                        <span style={{
                          display: 'inline-block',
                          padding: '3px 10px',
                          borderRadius: '9999px',
                          fontSize: '11px',
                          fontWeight: 600,
                          background: 'rgba(245,158,11,0.15)',
                          color: '#F59E0B',
                        }}>
                          {record.reason}
                        </span>
                      </td>
                      <td style={{ maxWidth: '400px', whiteSpace: 'normal', wordBreak: 'break-word' }}>
                        {Object.entries(record.originalRow)
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(' | ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">🎉</div>
              <p>All records were imported successfully!</p>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="action-bar">
        <button
          className="btn btn-secondary"
          onClick={onStartOver}
          id="start-over-btn"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>
          Import Another File
        </button>
        {successRecords.length > 0 && (
          <div className="action-bar-right">
            <button
              className="btn btn-secondary"
              onClick={handleDownloadJSON}
              id="download-json-btn"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              JSON
            </button>
            <button
              className="btn btn-primary"
              onClick={handleDownloadCSV}
              id="download-csv-btn"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download CSV
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
