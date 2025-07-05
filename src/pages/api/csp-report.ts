import { supabase } from '../../lib/supabaseClient';

// Interface for CSP violation reports
interface CSPViolationReport {
  'csp-report': {
    'document-uri'?: string;
    'referrer'?: string;
    'violated-directive'?: string;
    'effective-directive'?: string;
    'original-policy'?: string;
    'disposition'?: string;
    'blocked-uri'?: string;
    'line-number'?: number;
    'source-file'?: string;
    'status-code'?: number;
    'script-sample'?: string;
  };
}

/**
 * API handler for CSP violation reports
 * This endpoint receives reports from browsers when a CSP violation occurs
 */
export async function POST(request: Request) {
  try {
    const report = await request.json() as CSPViolationReport;
    
    // Log violation for debugging
    console.log('CSP Violation:', JSON.stringify(report['csp-report']));
    
    // Store in database
    const { error } = await supabase
      .from('csp_violation_reports')
      .insert({
        document_uri: report['csp-report']['document-uri'] || '',
        referrer: report['csp-report']['referrer'] || '',
        violated_directive: report['csp-report']['violated-directive'] || '',
        effective_directive: report['csp-report']['effective-directive'] || '',
        original_policy: report['csp-report']['original-policy'] || '',
        disposition: report['csp-report']['disposition'] || '',
        blocked_uri: report['csp-report']['blocked-uri'] || '',
        line_number: report['csp-report']['line-number'] || null,
        source_file: report['csp-report']['source-file'] || '',
        status_code: report['csp-report']['status-code'] || null,
        script_sample: report['csp-report']['script-sample'] || ''
      });
    
    if (error) {
      console.error('Error storing CSP violation:', error);
      return new Response(JSON.stringify({ message: 'Error processing report' }), { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }
    
    // Return 204 No Content as per CSP spec
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Failed to process CSP report:', error);
    return new Response(JSON.stringify({ message: 'Invalid report format' }), { 
      status: 400, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
}

// Also export a general handler for other HTTP methods
export async function GET() {
  return new Response(JSON.stringify({ message: 'CSP report endpoint - POST only' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json' }
  });
}
