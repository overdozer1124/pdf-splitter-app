export type ValidationErrorType =
  | 'EMPTY_NAME'
  | 'DUPLICATE_NAME'
  | 'COUNT_MISMATCH'
  | 'INVALID_NAME';

export interface ValidationError {
  type: ValidationErrorType;
  message: string;
  groupId?: string;
  index?: number;
}
