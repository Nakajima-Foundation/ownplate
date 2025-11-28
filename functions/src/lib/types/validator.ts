// Validator option types
export interface ValidatorNumberOption {
  min?: number;
  max?: number;
  minDigits?: number;
  maxDigits?: number;
  required?: boolean;
}

export interface ValidatorStringOption {
  minLength?: number;
  maxLength?: number;
  minLen?: number;      // Legacy alias for minLength
  maxLen?: number;      // Legacy alias for maxLength
  required?: boolean;
  pattern?: RegExp;
  type?: "number" | "alpha" | "alphanumeric" | "url";
}
