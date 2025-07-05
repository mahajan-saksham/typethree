/**
 * Temporary component to test password strength functionality
 * This component demonstrates the use of the password strength utilities
 */

import { useState } from 'react';
import { 
  evaluatePasswordStrength, 
  getPasswordStrengthColor, 
  getPasswordStrengthLabel,
  validatePasswordRequirements,
  PasswordStrength
} from '../utils/passwordUtils';

const PasswordStrengthTest = () => {
  const [password, setPassword] = useState('');
  const strengthResult = evaluatePasswordStrength(password);
  const requirements = validatePasswordRequirements(password);
  
  // Calculate overall requirements met
  const requirementsMet = Object.values(requirements).filter(Boolean).length;
  const totalRequirements = Object.values(requirements).length;
  
  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-medium mb-4">Password Strength Test</h2>
      
      <div className="mb-6">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Enter password to test"
        />
      </div>
      
      {/* Strength meter */}
      <div className="mb-6">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-gray-700">Strength:</span>
          <span className={`text-sm font-medium ${getPasswordStrengthColor(strengthResult.score).split(' ')[0]}`}>
            {getPasswordStrengthLabel(strengthResult.score)}
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full ${getPasswordStrengthColor(strengthResult.score).split(' ')[1]}`}
            style={{ width: `${(strengthResult.score + 1) * 20}%` }}
          ></div>
        </div>
        <div className="mt-1 text-xs text-gray-500">
          {strengthResult.guessTimeString ? (
            <span>Time to crack: {strengthResult.guessTimeString}</span>
          ) : null}
        </div>
      </div>
      
      {/* Feedback */}
      {(strengthResult.feedback.warning || strengthResult.feedback.suggestions.length > 0) && (
        <div className="mb-6 p-3 bg-gray-50 rounded border border-gray-200">
          {strengthResult.feedback.warning && (
            <p className="text-sm text-orange-600 mb-2">{strengthResult.feedback.warning}</p>
          )}
          {strengthResult.feedback.suggestions.length > 0 && (
            <ul className="text-sm text-gray-600 pl-5 list-disc">
              {strengthResult.feedback.suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          )}
        </div>
      )}
      
      {/* Requirements */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Requirements ({requirementsMet}/{totalRequirements}):</h3>
        <ul className="space-y-1">
          <li className={`text-sm ${requirements.minLength ? 'text-green-600' : 'text-gray-500'}`}>
            ✓ At least 8 characters
          </li>
          <li className={`text-sm ${requirements.hasUppercase ? 'text-green-600' : 'text-gray-500'}`}>
            ✓ At least one uppercase letter
          </li>
          <li className={`text-sm ${requirements.hasLowercase ? 'text-green-600' : 'text-gray-500'}`}>
            ✓ At least one lowercase letter
          </li>
          <li className={`text-sm ${requirements.hasNumber ? 'text-green-600' : 'text-gray-500'}`}>
            ✓ At least one number
          </li>
          <li className={`text-sm ${requirements.hasSpecialChar ? 'text-green-600' : 'text-gray-500'}`}>
            ✓ At least one special character
          </li>
        </ul>
      </div>
      
      <div className="text-sm text-gray-500 italic">
        Password acceptable: {strengthResult.isAcceptable ? (
          <span className="text-green-600 font-medium">Yes</span>
        ) : (
          <span className="text-red-600 font-medium">No</span>
        )}
      </div>
    </div>
  );
};

export default PasswordStrengthTest;
