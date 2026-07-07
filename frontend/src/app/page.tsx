'use client';

import React, { useState, useCallback } from 'react';
import { AppStep, CRMRecord, SkippedRecord } from '@/types';
import { uploadCSV, extractRecords } from '@/lib/api';
import StepIndicator from '@/components/StepIndicator';
import FileUpload from '@/components/FileUpload';
import DataPreview from '@/components/DataPreview';
import ProcessingState from '@/components/ProcessingState';
import ResultsView from '@/components/ResultsView';
import Toast from '@/components/Toast';

export default function HomePage() {
  // Step management
  const [currentStep, setCurrentStep] = useState<AppStep>('upload');

  // Upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Preview state
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [fileName, setFileName] = useState('');

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState('');

  // Results state
  const [successRecords, setSuccessRecords] = useState<CRMRecord[]>([]);
  const [skippedRecords, setSkippedRecords] = useState<SkippedRecord[]>([]);
  const [totalProcessed, setTotalProcessed] = useState(0);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  const showToast = useCallback((message: string, type: 'error' | 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  }, []);

  // Handle file selection & upload
  const handleFileSelect = useCallback(
    async (file: File) => {
      setSelectedFile(file);
      setIsUploading(true);

      try {
        const response = await uploadCSV(file);

        if (response.success && response.data) {
          setHeaders(response.data.headers);
          setRows(response.data.rows);
          setTotalRows(response.data.totalRows);
          setFileName(response.data.fileName);
          setCurrentStep('preview');
        } else {
          showToast(response.error || 'Failed to parse CSV file.', 'error');
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to upload file.';
        showToast(message, 'error');
      } finally {
        setIsUploading(false);
      }
    },
    [showToast]
  );

  // Remove file and go back to upload
  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null);
    setHeaders([]);
    setRows([]);
    setTotalRows(0);
    setFileName('');
    setCurrentStep('upload');
  }, []);

  // Confirm import — trigger AI extraction
  const handleConfirmImport = useCallback(async () => {
    setIsProcessing(true);
    setCurrentStep('processing');
    setProcessingProgress(10);
    setProcessingStatus('Sending records to AI...');

    try {
      // Simulate initial progress
      const progressTimer = setInterval(() => {
        setProcessingProgress((prev) => {
          if (prev >= 85) {
            clearInterval(progressTimer);
            return prev;
          }
          return prev + Math.random() * 8;
        });
      }, 800);

      setProcessingStatus(`Processing ${rows.length} records...`);

      const response = await extractRecords(headers, rows);

      clearInterval(progressTimer);
      setProcessingProgress(100);

      if (response.success && response.data) {
        setSuccessRecords(response.data.success);
        setSkippedRecords(response.data.skipped);
        setTotalProcessed(response.data.totalProcessed);

        // Brief delay to show 100% before transitioning
        setTimeout(() => {
          setCurrentStep('results');
          setIsProcessing(false);
          showToast(
            `Successfully imported ${response.data!.totalImported} records!`,
            'success'
          );
        }, 500);
      } else {
        throw new Error(response.error || 'Extraction failed.');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'AI extraction failed.';
      showToast(message, 'error');
      setCurrentStep('preview');
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  }, [headers, rows, showToast]);

  // Start over
  const handleStartOver = useCallback(() => {
    setCurrentStep('upload');
    setSelectedFile(null);
    setHeaders([]);
    setRows([]);
    setTotalRows(0);
    setFileName('');
    setSuccessRecords([]);
    setSkippedRecords([]);
    setTotalProcessed(0);
    setProcessingProgress(0);
    setProcessingStatus('');
  }, []);

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header" id="app-header">
        <div className="app-logo">
          <div className="app-logo-icon">📊</div>
          <span className="app-logo-text">GrowEasy</span>
        </div>
        <p className="app-subtitle">
          AI-Powered CSV Importer — Upload any CSV and let AI intelligently
          extract and map your leads into CRM format.
        </p>
      </header>

      {/* Step Indicator */}
      <StepIndicator currentStep={currentStep} />

      {/* Step Content */}
      <main>
        {currentStep === 'upload' && (
          <FileUpload
            onFileSelect={handleFileSelect}
            isUploading={isUploading}
            selectedFile={selectedFile}
            onRemoveFile={handleRemoveFile}
          />
        )}

        {currentStep === 'preview' && (
          <DataPreview
            headers={headers}
            rows={rows}
            totalRows={totalRows}
            fileName={fileName}
            onConfirm={handleConfirmImport}
            onBack={handleRemoveFile}
            isProcessing={isProcessing}
          />
        )}

        {currentStep === 'processing' && (
          <ProcessingState
            progress={processingProgress}
            statusText={processingStatus}
          />
        )}

        {currentStep === 'results' && (
          <ResultsView
            successRecords={successRecords}
            skippedRecords={skippedRecords}
            totalProcessed={totalProcessed}
            onStartOver={handleStartOver}
          />
        )}
      </main>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
