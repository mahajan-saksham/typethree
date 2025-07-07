// Vercel serverless function for handling CSP violation reports
export default async function handler(req, res) {
  // Set CORS headers to allow the browser to send reports
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const report = req.body;
    
    // Log the CSP violation for debugging
    console.log('CSP Violation Report:', JSON.stringify(report, null, 2));
    
    // In a production environment, you might want to:
    // 1. Store this in a database
    // 2. Send alerts for critical violations
    // 3. Aggregate and analyze the data
    
    // For now, we'll just log it and return success
    // You can integrate with Supabase here if needed:
    /*
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_SERVICE_KEY
    );
    
    await supabase.from('csp_violation_reports').insert({
      document_uri: report['csp-report']['document-uri'] || '',
      violated_directive: report['csp-report']['violated-directive'] || '',
      blocked_uri: report['csp-report']['blocked-uri'] || '',
      // ... other fields
      created_at: new Date().toISOString()
    });
    */
    
    // Return 204 No Content as per CSP reporting specification
    return res.status(204).end();
  } catch (error) {
    console.error('Error processing CSP report:', error);
    return res.status(400).json({ error: 'Invalid report format' });
  }
}
