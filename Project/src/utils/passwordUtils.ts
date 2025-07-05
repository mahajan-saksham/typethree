/**
 * Password utility functions for security features
 * Provides password strength estimation and policy enforcement
 */

import zxcvbn from 'zxcvbn';

/**
 * Password strength levels
 */
export enum PasswordStrength {
  VeryWeak = 0,
  Weak = 1,
  Medium = 2,
  Strong = 3,
  VeryStrong = 4
}

/**
 * Password strength result with feedback
 */
export interface PasswordStrengthResult {
  score: PasswordStrength;
  feedback: {
    warning: string;
    suggestions: string[];
  };
  guessTimeString: string;
  isAcceptable: boolean;
}

// Minimum acceptable password strength (0-4)
const MIN_ACCEPTABLE_STRENGTH = 2; // Medium or stronger

/**
 * Evaluates password strength using zxcvbn
 * @param password - The password to evaluate
 * @param userInputs - Optional array of strings related to the user (email, name, etc.)
 * @returns Password strength analysis with score and feedback
 */
export const evaluatePasswordStrength = (
  password: string,
  userInputs: string[] = []
): PasswordStrengthResult => {
  if (!password) {
    return {
      score: PasswordStrength.VeryWeak,
      feedback: {
        warning: 'Password is empty',
        suggestions: ['Enter a password']
      },
      guessTimeString: 'Instant',
      isAcceptable: false
    };
  }

  const result = zxcvbn(password, userInputs);
  
  return {
    score: result.score as PasswordStrength,
    feedback: {
      warning: result.feedback.warning || '',
      suggestions: result.feedback.suggestions || []
    },
    guessTimeString: result.crack_times_display.offline_slow_hashing_1e4_per_second,
    isAcceptable: result.score >= MIN_ACCEPTABLE_STRENGTH
  };
};

/**
 * Gets color representing password strength
 * @param score - Password strength score (0-4)
 * @returns CSS color class for the given strength
 */
export const getPasswordStrengthColor = (score: PasswordStrength): string => {
  switch (score) {
    case PasswordStrength.VeryWeak:
      return 'text-red-500 bg-red-100';
    case PasswordStrength.Weak:
      return 'text-orange-500 bg-orange-100';
    case PasswordStrength.Medium:
      return 'text-yellow-500 bg-yellow-100';
    case PasswordStrength.Strong:
      return 'text-green-500 bg-green-100';
    case PasswordStrength.VeryStrong:
      return 'text-emerald-500 bg-emerald-100';
    default:
      return 'text-gray-500 bg-gray-100';
  }
};

/**
 * Gets label for password strength score
 * @param score - Password strength score (0-4)
 * @returns Human-readable label for the given strength
 */
export const getPasswordStrengthLabel = (score: PasswordStrength): string => {
  switch (score) {
    case PasswordStrength.VeryWeak:
      return 'Very Weak';
    case PasswordStrength.Weak:
      return 'Weak';
    case PasswordStrength.Medium:
      return 'Medium';
    case PasswordStrength.Strong:
      return 'Strong';
    case PasswordStrength.VeryStrong:
      return 'Very Strong';
    default:
      return 'Unknown';
  }
};

/**
 * Validates password against common requirements
 * @param password - The password to validate
 * @returns Object with validation results
 */
export const validatePasswordRequirements = (password: string) => {
  return {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };
};
