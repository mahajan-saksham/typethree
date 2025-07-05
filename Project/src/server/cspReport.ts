import { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

// Interface for CSP violation reports
interface CSPViolationReport {
  'csp-report': {
    'document-uri': string;
    'referrer': string;
    'violated-directive': string;
    'effective-directive': string;
    'original-policy': string;
    'disposition': string;
    'blocked-uri': string;
    'line-number'?: number;
    'source-file'?: string;
    'status-code'?: number;
    'script-sample'?: string;
  };
}

/**
 * Store CSP violation reports in the database
 * @param report The CSP violation report
 * @param client Supabase client
 * @returns Result of the insertion operation
 */
async function storeCSPViolation(report: CSPViolationReport, client: SupabaseClient) {
  try {
    const { data, error } = await client
      .from('csp_violation_reports')
      .insert({
        document_uri: report['csp-report']['document-uri'],
        referrer: report['csp-report']['referrer'],
        violated_directive: report['csp-report']['violated-directive'],
        effective_directive: report['csp-report']['effective-directive'],
        original_policy: report['csp-report']['original-policy'],
        disposition: report['csp-report']['disposition'],
        blocked_uri: report['csp-report']['blocked-uri'],
        line_number: report['csp-report']['line-number'],
        source_file: report['csp-report']['source-file'],
        status_code: report['csp-report']['status-code'],
        script_sample: report['csp-report']['script-sample'],
        created_at: new Date().toISOString()
      });

    return { data, error };
  } catch (error) {
    console.error('Failed to store CSP violation:', error);
    return { data: null, error };
  }
}

/**
 * Handles incoming CSP violation reports
 * 
 * @param request The incoming request with CSP violation report
 * @returns Response indicating success or failure
 */
export async function handleCSPReport(request: Request) {
  // Only accept POST requests
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const report: CSPViolationReport = await request.json();
    
    // Log violation for debugging
    console.log('CSP Violation:', JSON.stringify(report['csp-report']));
    
    // Store in database
    const result = await storeCSPViolation(report, supabase);
    
    if (result.error) {
      console.error('Error storing CSP violation:', result.error);
      return new Response('Error processing report', { status: 500 });
    }
    
    return new Response('CSP violation report processed', { status: 204 });
  } catch (error) {
    console.error('Failed to process CSP report:', error);
    return new Response('Invalid report format', { status: 400 });
  }
}
