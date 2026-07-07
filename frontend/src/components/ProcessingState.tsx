'use client';

import React from 'react';

interface ProcessingStateProps {
  progress: number; // 0-100
  statusText: string;
}

export default function ProcessingState({ progress, statusText }: ProcessingStateProps) {
  return (
    <div className="glass-card animate-fade-in-up">
      <div className="processing-state" id="processing-state">
        <div className="processing-spinner-wrapper">
          <div className="processing-spinner-ring" />
          <div className="processing-spinner-inner">🤖</div>
        </div>

        <h3 className="processing-title">AI is Extracting CRM Data</h3>
        <p className="processing-subtitle">
          {statusText || 'Analyzing your CSV and intelligently mapping fields to GrowEasy CRM format...'}
        </p>

        <div className="progress-container">
          <div className="progress-bar-wrapper">
            <div
              className="progress-bar-fill"
              style={{ width: `${Math.max(progress, 5)}%` }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-sm)' }}>
            <span className="progress-percentage">{statusText}</span>
            <span className="progress-percentage">{Math.round(progress)}%</span>
          </div>
        </div>

        <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: 'var(--space-lg)' }}>
          This may take a moment depending on the number of records.
          <br />
          Please do not close this tab.
        </p>
      </div>
    </div>
  );
}
