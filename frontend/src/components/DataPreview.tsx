'use client';

import React from 'react';

interface DataPreviewProps {
  headers: string[];
  rows: Record<string, string>[];
  totalRows: number;
  fileName: string;
  onConfirm: () => void;
  onBack: () => void;
  isProcessing: boolean;
}

export default function DataPreview({
  headers,
  rows,
  totalRows,
  fileName,
  onConfirm,
  onBack,
  isProcessing,
}: DataPreviewProps) {
  return (
    <div className="animate-fade-in-up">
      {/* File info bar */}
      <div className="upload-file-info" style={{ marginBottom: 'var(--space-xl)', marginTop: 0 }}>
        <div className="upload-file-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
        </div>
        <div className="upload-file-details">
          <div className="upload-file-name">{fileName}</div>
          <div className="upload-file-size">{totalRows} rows detected &middot; {headers.length} columns</div>
        </div>
      </div>

      {/* Data table */}
      <div className="table-container" id="preview-table">
        <div className="table-header-bar">
          <span className="table-title">CSV Preview</span>
          <span className="table-badge">{totalRows} rows</span>
        </div>
        <div className="table-scroll-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th className="row-num">#</th>
                {headers.map((header, i) => (
                  <th key={i}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIdx) => (
                <tr key={rowIdx}>
                  <td className="row-num">{rowIdx + 1}</td>
                  {headers.map((header, colIdx) => (
                    <td key={colIdx} title={row[header] || ''}>
                      {row[header] || '—'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action buttons */}
      <div className="action-bar">
        <button
          className="btn btn-secondary"
          onClick={onBack}
          disabled={isProcessing}
          id="back-to-upload-btn"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back
        </button>
        <div className="action-bar-right">
          <button
            className="btn btn-primary"
            onClick={onConfirm}
            disabled={isProcessing}
            id="confirm-import-btn"
          >
            {isProcessing ? (
              <>
                <span className="spinner" />
                Processing...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Confirm &amp; Import with AI
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
