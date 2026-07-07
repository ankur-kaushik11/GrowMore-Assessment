'use client';

import React from 'react';

interface ToastProps {
  message: string;
  type: 'error' | 'success';
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
  return (
    <div className={`toast ${type}`} id="toast-notification" role="alert">
      <span style={{ flex: 1 }}>
        {type === 'error' ? '❌' : '✅'} {message}
      </span>
      <button className="toast-close" onClick={onClose} aria-label="Close">
        ✕
      </button>
    </div>
  );
}
