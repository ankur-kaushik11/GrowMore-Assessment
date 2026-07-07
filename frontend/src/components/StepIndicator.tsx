'use client';

import React from 'react';
import { AppStep } from '@/types';

interface StepIndicatorProps {
  currentStep: AppStep;
}

const STEPS: { key: AppStep; label: string; number: number }[] = [
  { key: 'upload', label: 'Upload', number: 1 },
  { key: 'preview', label: 'Preview', number: 2 },
  { key: 'processing', label: 'Process', number: 3 },
  { key: 'results', label: 'Results', number: 4 },
];

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  const currentIndex = STEPS.findIndex((s) => s.key === currentStep);

  return (
    <div className="step-indicator" id="step-indicator">
      {STEPS.map((step, index) => {
        const isActive = step.key === currentStep;
        const isCompleted = index < currentIndex;

        return (
          <React.Fragment key={step.key}>
            <div className="step-item">
              <div
                className={`step-circle ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
              >
                {isCompleted ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M3 8L6.5 11.5L13 4.5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  step.number
                )}
              </div>
              <span
                className={`step-label ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
              >
                {step.label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={`step-connector ${isCompleted ? 'completed' : ''}`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
