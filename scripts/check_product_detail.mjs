import fs from 'fs';
import path from 'path';

/**
 * Checks if the ProductDetail.tsx file contains variant-related code
 * that needs to be updated for the non-variant structure
 */
async function checkProductDetail() {
  try {
    console.log('Checking ProductDetail.tsx for variant-related code...');
    
    const filePath = path.join(process.cwd(), '..', 'src', 'pages', 'ProductDetail.tsx');
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for variant-related code
    const variantPatterns = [
      { pattern: /variant/gi, name: 'variant references' },
      { pattern: /default_variant/gi, name: 'default_variant references' },
      { pattern: /selectedVariant/gi, name: 'selectedVariant state' },
      { pattern: /setSelectedVariant/gi, name: 'setSelectedVariant function' },
      { pattern: /variantId/gi, name: 'variantId references' },
      { pattern: /is_default/gi, name: 'is_default references' }
    ];
    
    console.log('\nVariant-related code found:');
    let foundAny = false;
    
    for (const { pattern, name } of variantPatterns) {
      const matches = content.match(pattern);
      if (matches && matches.length > 0) {
        console.log(`- ${name}: ${matches.length} occurrences`);
        foundAny = true;
      }
    }
    
    if (!foundAny) {
      console.log('No variant-related code found. The file may already be compatible with the non-variant structure.');
    } else {
      console.log('\nThe ProductDetail.tsx file contains variant-related code that needs to be updated.');
      console.log('You should update the file to work with the simplified product structure.');
    }
    
    // Check for subsidy calculation
    const subsidyPatterns = [
      { pattern: /subsidy_amount/gi, name: 'subsidy_amount references' },
      { pattern: /subsidy_percentage/gi, name: 'subsidy_percentage references' },
      { pattern: /calculatePriceAfterSubsidy/gi, name: 'calculatePriceAfterSubsidy function' },
      { pattern: /calculateSubsidyAmount/gi, name: 'calculateSubsidyAmount function' }
    ];
    
    console.log('\nSubsidy calculation code found:');
    foundAny = false;
    
    for (const { pattern, name } of subsidyPatterns) {
      const matches = content.match(pattern);
      if (matches && matches.length > 0) {
        console.log(`- ${name}: ${matches.length} occurrences`);
        foundAny = true;
      }
    }
    
    if (!foundAny) {
      console.log('No subsidy calculation code found. You may need to add code to calculate subsidies using the new utility functions.');
    }
    
    console.log('\nCheck completed!');
    
  } catch (error) {
    console.error('Check failed:', error.message);
  }
}

// Run the check
checkProductDetail().then(() => console.log('Script execution completed.'));
