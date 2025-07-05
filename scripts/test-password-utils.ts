import { 
  evaluatePasswordStrength, 
  getPasswordStrengthLabel, 
  getPasswordStrengthColor,
  validatePasswordRequirements,
  PasswordStrength
} from '../src/utils/passwordUtils';

// Test passwords
const testPasswords = [
  '',
  'password',
  'Password1',
  'MyP@ssw0rd',
  'TxH8z!Lp2&Dw9*Qs'
];

// Test user inputs (things to avoid in password)
const userInputs = ['type3', 'solar', 'energy', 'admin'];

console.log('===== PASSWORD STRENGTH TESTING =====\n');

testPasswords.forEach(password => {
  const result = evaluatePasswordStrength(password, userInputs);
  
  console.log(`Password: ${password || '(empty)'}`);
  console.log(`Strength: ${getPasswordStrengthLabel(result.score)} (${result.score}/4)`);
  console.log(`Color Class: ${getPasswordStrengthColor(result.score)}`);
  console.log(`Crack Time: ${result.guessTimeString}`);
  console.log(`Acceptable: ${result.isAcceptable ? 'Yes' : 'No'}`);
  
  if (result.feedback.warning) {
    console.log(`Warning: ${result.feedback.warning}`);
  }
  
  if (result.feedback.suggestions.length > 0) {
    console.log('Suggestions:');
    result.feedback.suggestions.forEach(suggestion => {
      console.log(`  - ${suggestion}`);
    });
  }

  // Check requirements
  if (password) {
    const requirements = validatePasswordRequirements(password);
    console.log('Requirements check:');
    console.log(`  Min Length (8+): ${requirements.minLength ? '✅' : '❌'}`);
    console.log(`  Uppercase: ${requirements.hasUppercase ? '✅' : '❌'}`);
    console.log(`  Lowercase: ${requirements.hasLowercase ? '✅' : '❌'}`);
    console.log(`  Number: ${requirements.hasNumber ? '✅' : '❌'}`);
    console.log(`  Special Char: ${requirements.hasSpecialChar ? '✅' : '❌'}`);
  }
  
  console.log('\n-------------------\n');
});

// Example of validating a user password during registration
function validateUserPassword(password: string, email: string): boolean {
  const userInputs = [email, 'type3', 'solar', 'energy'];
  const strength = evaluatePasswordStrength(password, userInputs);
  
  if (!strength.isAcceptable) {
    console.log('Password validation failed:');
    if (strength.feedback.warning) {
      console.log(`- ${strength.feedback.warning}`);
    }
    strength.feedback.suggestions.forEach(suggestion => {
      console.log(`- ${suggestion}`);
    });
    return false;
  }
  
  return true;
}

console.log('===== USER PASSWORD VALIDATION EXAMPLE =====\n');

const testUser = {
  email: 'user@type3solar.com',
  password: 'Solar123'  // A weak password related to the company
};

console.log(`Validating password for ${testUser.email}:`);
const isValid = validateUserPassword(testUser.password, testUser.email);
console.log(`Password accepted: ${isValid ? 'Yes' : 'No'}`);
