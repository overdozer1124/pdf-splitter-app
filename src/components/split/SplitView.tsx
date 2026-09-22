import React, { useState, useMemo } from 'react';
import { StepIndicator } from '../common/StepIndicator';
import { PdfDropZone } from '../step1/PdfDropZone';
import { PdfMetaInfo } from '../step1/PdfMetaInfo';
import { ModeSelector } from '../step2/ModeSelector';
import { PageByPageConfig } from '../step2/PageByPageConfig';
import { FixedPageConfig } from '../step2/FixedPageConfig';
import { RangeConfig } from '../step2/RangeConfig';
import { ThumbnailGrid } from '../step2/ThumbnailGrid';
import { SplitSummary } from '../step2/SplitSummary';
import { NamingModeSelector } from '../step3/NamingModeSelector';
import { SequenceNaming } from '../step3/SequenceNaming';
import { ManualNaming } from '../step3/ManualNaming';
import { SpreadsheetNaming } from '../step3/SpreadsheetNaming';
import { BookmarkNaming } from '../step3/BookmarkNaming';
import { ValidationPanel } from '../step4/ValidationPanel';
import { MappingPreview } from '../step4/MappingPreview';
import { ExportProgress } from '../step4/ExportProgress';
import { ExportAction } from '../step4/ExportAction';

import { usePdf } from '../../hooks/usePdf';
import { useSplit } from '../../hooks/useSplit';
import { useNaming } from '../../hooks/useNaming';
import { useExport } from '../../hooks/useExport';
import { validateNaming } from '../../services/validator';

export const SplitView: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [maxReachedStep, setMaxReachedStep] = useState(1);
  const [autoSequenceDuplicates, setAutoSequenceDuplicates] = useState(false);

  // Custom Hooks
  const {
    sourcePdf,
    pdfDocProxy,
    isLoading: isPdfLoading,
    error: pdfError,
    handleSelectFile,
    clearPdf
  } = usePdf();

  const totalPages = sourcePdf?.pageCount || 0;

  const {
    splitMode,
    setSplitMode,
    fixedPagesPerGroup,
    setFixedPagesPerGroup,
    rangeString,
    setRangeString,
    rangeError,
    breakpoints,
    toggleBreakpoint,
    splitGroups
  } = useSplit(totalPages);

  const {
    namingMode,
    setNamingMode,
    sequenceConfig,
    setSequenceConfig,
    manualNames,
    handleManualNameChange,
    spreadsheetData,
    spreadsheetConfig,
    setSpreadsheetConfig,
    handleImportSpreadsheet,
    handleSelectSheet,
    handleReorderRows,
    generatedNames,
    bookmarks,
    isExtractingBookmarks
  } = useNaming(splitGroups, pdfDocProxy);

  const { isExporting, progress, startExport } = useExport();

  // Step transition handlers
  const goToStep = (step: number) => {
    setCurrentStep(step);
    if (step > maxReachedStep) {
      setMaxReachedStep(step);
    }
  };

  const handleReset = () => {
    clearPdf();
    setCurrentStep(1);
    setMaxReachedStep(1);
  };

  // Perform validation on generated names
  const validationResult = useMemo(() => {
    return validateNaming(
      splitGroups.length,
      generatedNames,
      autoSequenceDuplicates
    );
  }, [splitGroups.length, generatedNames, autoSequenceDuplicates]);

  return (
    <div className="split-view-container">
      {/* Step Indicator */}
      <StepIndicator
        currentStep={currentStep}
        onSelectStep={goToStep}
        maxReachedStep={maxReachedStep}
      />

      {/* STEP 1: PDF Selection */}
      {currentStep === 1 && (
        <section className="step-content">
          {!sourcePdf ? (
            <PdfDropZone
              onFileSelect={(file) => {
                handleSelectFile(file);
              }}
              isLoading={isPdfLoading}
              error={pdfError}
            />
          ) : (
            <PdfMetaInfo
              pdf={sourcePdf}
              onChangePdf={handleReset}
              onNextStep={() => goToStep(2)}
            />
          )}
        </section>
      )}

      {/* STEP 2: PDF Split Configuration */}
      {currentStep === 2 && sourcePdf && (
        <section className="step-content card">
          <h2 className="section-title">Step 2: PDFの分割位置を指定</h2>
          <p className="section-desc">
            全{totalPages}ページの中からPDFを分割する単位を指定してください。
          </p>

          <ModeSelector currentMode={splitMode} onSelectMode={setSplitMode} />

          {splitMode === 'single' && <PageByPageConfig totalPages={totalPages} />}

          {splitMode === 'fixed' && (
            <FixedPageConfig
              pagesPerGroup={fixedPagesPerGroup}
              onChangePagesPerGroup={setFixedPagesPerGroup}
              totalPages={totalPages}
            />
          )}

          {splitMode === 'range' && (
            <RangeConfig
              rangeString={rangeString}
              onChangeRangeString={setRangeString}
              error={rangeError}
              totalPages={totalPages}
            />
          )}

          {splitMode === 'thumbnail' && (
            <ThumbnailGrid
              pdfDoc={pdfDocProxy}
              totalPages={totalPages}
              breakpoints={breakpoints}
              onToggleBreakpoint={toggleBreakpoint}
              groups={splitGroups}
            />
          )}

          <SplitSummary
            groups={splitGroups}
            onPrevStep={() => goToStep(1)}
            onNextStep={() => goToStep(3)}
          />
        </section>
      )}

      {/* STEP 3: Filename Configuration */}
      {currentStep === 3 && (
        <section className="step-content">
          <NamingModeSelector
            currentMode={namingMode}
            onSelectMode={setNamingMode}
          />

          {namingMode === 'sequence' && (
            <SequenceNaming
              config={sequenceConfig}
              onChangeConfig={setSequenceConfig}
              previewNames={generatedNames}
            />
          )}

          {namingMode === 'manual' && (
            <ManualNaming
              groups={splitGroups}
              names={manualNames}
              onChangeName={handleManualNameChange}
            />
          )}

          {namingMode === 'spreadsheet' && (
            <SpreadsheetNaming
              data={spreadsheetData}
              onImportFile={handleImportSpreadsheet}
              config={spreadsheetConfig}
              onChangeConfig={setSpreadsheetConfig}
              onSelectSheet={handleSelectSheet}
              onChangeHeaderRowIndex={(idx) =>
                setSpreadsheetConfig({ ...spreadsheetConfig, headerRowIndex: idx })
              }
              onReorderRows={handleReorderRows}
              previewNames={generatedNames}
            />
          )}

          {namingMode === 'bookmark' && (
            <BookmarkNaming
              bookmarks={bookmarks}
              previewNames={generatedNames}
              isExtracting={isExtractingBookmarks}
            />
          )}

          <div className="card-actions-bar card sticky-bottom margin-top">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => goToStep(2)}
            >
              ◀ 分割指定に戻る
            </button>
            <button
              type="button"
              className="btn btn-primary btn-large"
              onClick={() => goToStep(4)}
            >
              確認・ZIP保存へ (Step 4) ➔
            </button>
          </div>
        </section>
      )}

      {/* STEP 4: Verification & Export */}
      {currentStep === 4 && (
        <section className="step-content">
          <ValidationPanel
            splitCount={splitGroups.length}
            nameCount={generatedNames.length}
            errors={validationResult.errors}
            autoSequenceDuplicates={autoSequenceDuplicates}
            onToggleAutoSequenceDuplicates={setAutoSequenceDuplicates}
          />

          <MappingPreview
            groups={splitGroups}
            names={validationResult.sanitizedNames}
            pdfDoc={pdfDocProxy}
          />

          <ExportAction
            canExport={validationResult.canExport}
            onExportZip={() =>
              startExport(
                sourcePdf,
                splitGroups,
                validationResult.sanitizedNames
              )
            }
            onPrevStep={() => goToStep(3)}
            onReset={handleReset}
          />
        </section>
      )}

      {/* Modal Export Progress */}
      {isExporting && <ExportProgress progress={progress} />}
    </div>
  );
};
