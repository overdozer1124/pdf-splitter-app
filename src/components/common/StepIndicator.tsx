import React from 'react';

interface StepIndicatorProps {
  currentStep: number;
  onSelectStep: (step: number) => void;
  maxReachedStep: number;
}

const STEPS = [
  { step: 1, title: 'PDFを選択' },
  { step: 2, title: '分割位置を指定' },
  { step: 3, title: 'ファイル名を設定' },
  { step: 4, title: '確認・保存' }
];

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  onSelectStep,
  maxReachedStep
}) => {
  return (
    <nav className="step-indicator" aria-label="ステップ進捗">
      <ol className="step-list">
        {STEPS.map((s) => {
          const isActive = currentStep === s.step;
          const isCompleted = currentStep > s.step;
          const isClickable = s.step <= maxReachedStep;

          return (
            <li
              key={s.step}
              className={`step-item ${isActive ? 'active' : ''} ${
                isCompleted ? 'completed' : ''
              } ${isClickable ? 'clickable' : 'disabled'}`}
              onClick={() => isClickable && onSelectStep(s.step)}
              aria-current={isActive ? 'step' : undefined}
            >
              <div className="step-number">{isCompleted ? '✓' : s.step}</div>
              <div className="step-title">{s.title}</div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
