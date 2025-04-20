import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import AdminLayout from '../../components/admin/AdminLayout';

export default function DatabaseSetup() {
  const [status, setStatus] = useState<'idle' | 'creating' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');
  const [tables, setTables] = useState<{[key: string]: boolean}>({});
  const [copied, setCopied] = useState(false);
  const [sampleStatus, setSampleStatus] = useState<'idle' | 'creating' | 'success' | 'error'>('idle');
  const [sampleLeadsInserted, setSampleLeadsInserted] = useState(0);

  // SQL statements for creating tables
  const tableCreationSQL = `
-- Create rooftop_leads table
CREATE TABLE IF NOT EXISTS public.rooftop_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  contact TEXT NOT NULL,
  email TEXT,
  status TEXT DEFAULT 'new',
  preferred_date DATE,
  preferred_time_slot TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  product_sku TEXT,
  product_name TEXT,
  product_power NUMERIC,
  source TEXT,
  lead_source TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policy
ALTER TABLE public.rooftop_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access to authenticated users" ON public.rooftop_leads 
  FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow insert access to anonymous users" ON public.rooftop_leads 
  FOR INSERT TO anon USING (true);

-- Create site_visits table
CREATE TABLE IF NOT EXISTS public.site_visits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  email TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  pincode TEXT,
  preferred_date DATE,
  preferred_time_slot TEXT,
  geolocation JSONB,
  additional_notes TEXT,
  status TEXT DEFAULT 'pending',
  product_sku TEXT,
  product_name TEXT,
  capacity_kw NUMERIC,
  power NUMERIC,
  system_size NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  scheduled_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Add RLS policy
ALTER TABLE public.site_visits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access to authenticated users" ON public.site_visits 
  FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow insert access to anonymous users" ON public.site_visits 
  FOR INSERT TO anon USING (true);
  `;

  // Function to check if tables exist
  const checkTables = async () => {
    setStatus('creating');
    setMessage('Checking database tables...');
    
    const tables = ['rooftop_leads', 'site_visits'];
    const results: {[key: string]: boolean} = {};
    
    for (const table of tables) {
      try {
        const { error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        results[table] = !error;
      } catch (error) {
        results[table] = false;
      }
    }
    
    setTables(results);
    setStatus('idle');
    return results;
  };

  // Function to try creating tables directly (might not work due to permissions)
  const createTables = async () => {
    setStatus('creating');
    setMessage('Attempting to create tables...');
    
    try {
      // Try to create tables using raw SQL (this might not work without proper permissions)
      const { error: rooftopLeadsError } = await supabase.rpc(
        'execute_sql',
        { query: `CREATE TABLE IF NOT EXISTS public.rooftop_leads (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name TEXT NOT NULL,
          contact TEXT NOT NULL,
          email TEXT,
          status TEXT DEFAULT 'new',
          preferred_date DATE,
          preferred_time_slot TEXT,
          address TEXT,
          city TEXT,
          state TEXT,
          zip_code TEXT,
          product_sku TEXT,
          product_name TEXT,
          product_power NUMERIC,
          source TEXT,
          lead_source TEXT,
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );` }
      );
      
      const { error: siteVisitsError } = await supabase.rpc(
        'execute_sql',
        { query: `CREATE TABLE IF NOT EXISTS public.site_visits (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name TEXT NOT NULL,
          phone_number TEXT NOT NULL,
          email TEXT,
          address TEXT,
          city TEXT,
          state TEXT,
          zip_code TEXT,
          pincode TEXT,
          preferred_date DATE,
          preferred_time_slot TEXT,
          geolocation JSONB,
          additional_notes TEXT,
          status TEXT DEFAULT 'pending',
          product_sku TEXT,
          product_name TEXT,
          capacity_kw NUMERIC,
          power NUMERIC,
          system_size NUMERIC,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          scheduled_at TIMESTAMP WITH TIME ZONE,
          completed_at TIMESTAMP WITH TIME ZONE
        );` }
      );
      
      if (rooftopLeadsError || siteVisitsError) {
        setStatus('error');
        setMessage(
          'Unable to create tables directly through the API. This is expected as it requires database admin privileges. ' +
          'Please use the SQL statements below in the Supabase SQL Editor to create the tables manually.'
        );
      } else {
        setStatus('success');
        setMessage('Tables created successfully!');
        await checkTables();
      }
    } catch (error) {
      setStatus('error');
      setMessage(
        'Error creating tables. Please use the SQL statements below in the Supabase SQL Editor to create the tables manually.'
      );
    }
  };

  const copySQL = () => {
    navigator.clipboard.writeText(tableCreationSQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Function to add sample leads to the rooftop_leads table
  const addSampleLeads = async () => {
    setSampleStatus('creating');
    
    // Sample data - representing leads from different Indian states
    const sampleLeads = [
      {
        name: 'Raj Kumar',
        contact: '+919876543210',
        email: 'raj.kumar@example.com',
        status: 'new',
        preferred_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        preferred_time_slot: '10:00 AM - 12:00 PM',
        address: '42 Green Park Avenue',
        city: 'New Delhi',
        state: 'Delhi',
        zip_code: '110016',
        product_sku: 'SOLAR-5KW',
        product_name: '5kW Residential Solar System',
        product_power: 5,
        source: 'site_visit_form',
        lead_source: 'website'
      },
      {
        name: 'Priya Sharma',
        contact: '+918765432109',
        email: 'priya.s@example.com',
        status: 'assigned',
        preferred_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        preferred_time_slot: '2:00 PM - 4:00 PM',
        address: '78 Bandra West',
        city: 'Mumbai',
        state: 'Maharashtra',
        zip_code: '400050',
        product_sku: 'SOLAR-3KW',
        product_name: '3kW Residential Solar System',
        product_power: 3,
        source: 'site_visit_form',
        lead_source: 'referral'
      },
      {
        name: 'Arjun Patel',
        contact: '+917654321098',
        email: 'arjun.p@example.com',
        status: 'scheduled',
        preferred_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        preferred_time_slot: '9:00 AM - 11:00 AM',
        address: '15 Satellite Road',
        city: 'Ahmedabad',
        state: 'Gujarat',
        zip_code: '380015',
        product_sku: 'SOLAR-10KW',
        product_name: '10kW Commercial Solar System',
        product_power: 10,
        source: 'site_visit_form',
        lead_source: 'exhibition'
      },
      {
        name: 'Kavita Reddy',
        contact: '+916543210987',
        email: 'kavita.r@example.com',
        status: 'new',
        preferred_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        preferred_time_slot: '11:00 AM - 1:00 PM',
        address: '27 Jubilee Hills',
        city: 'Hyderabad',
        state: 'Telangana',
        zip_code: '500033',
        product_sku: 'SOLAR-7KW',
        product_name: '7kW Residential Solar System',
        product_power: 7,
        source: 'site_visit_form',
        lead_source: 'website'
      },
      {
        name: 'Vijay Singh',
        contact: '+915432109876',
        email: 'vijay.s@example.com',
        status: 'closed',
        preferred_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        preferred_time_slot: '3:00 PM - 5:00 PM',
        address: '8 Model Town',
        city: 'Chandigarh',
        state: 'Punjab',
        zip_code: '160009',
        product_sku: 'SOLAR-15KW',
        product_name: '15kW Commercial Solar System',
        product_power: 15,
        source: 'site_visit_form',
        lead_source: 'direct'
      }
    ];

    try {
      // Check if the table exists first
      const { error: checkError } = await supabase
        .from('rooftop_leads')
        .select('*', { count: 'exact', head: true });
      
      if (checkError) {
        setSampleStatus('error');
        setMessage('Unable to insert sample leads. The rooftop_leads table doesn\'t exist yet.');
        return;
      }

      // Insert sample leads one by one to show progress
      let successCount = 0;
      for (const lead of sampleLeads) {
        const { error } = await supabase
          .from('rooftop_leads')
          .insert([lead]);

        if (!error) {
          successCount++;
          setSampleLeadsInserted(successCount);
        }
      }

      // Also insert site visits
      for (const lead of sampleLeads) {
        // Insert corresponding site visit
        await supabase
          .from('site_visits')
          .insert([{
            name: lead.name,
            phone_number: lead.contact,
            email: lead.email,
            address: lead.address,
            city: lead.city,
            state: lead.state,
            zip_code: lead.zip_code,
            preferred_date: lead.preferred_date,
            preferred_time_slot: lead.preferred_time_slot,
            product_sku: lead.product_sku,
            product_name: lead.product_name,
            capacity_kw: lead.product_power,
            status: lead.status === 'closed' ? 'completed' : 
                    lead.status === 'scheduled' ? 'scheduled' : 'pending'
          }]);
      }

      setSampleStatus('success');
      setMessage(`Successfully inserted ${successCount} sample leads and corresponding site visits.`);
      await checkTables(); // Refresh table status
    } catch (error) {
      setSampleStatus('error');
      setMessage('Error inserting sample leads. Please check console for details.');
      console.error('Error inserting sample leads:', error);
    } finally {
      setTimeout(() => {
        setSampleStatus('idle');
      }, 3000);
    }
  };

  return (
    <AdminLayout title="Database Setup">
      <div className="p-6 flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold text-primary">Database Schema Setup</h1>
          <p className="text-light/70">
            This utility helps you set up the required database tables for your Type 3 Solar Platform.
            You'll need to create the <code>rooftop_leads</code> and <code>site_visits</code> tables.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={checkTables}
              disabled={status === 'creating'}
              className="bg-primary text-black px-5 py-2.5 rounded-lg font-medium shadow transition hover:scale-105 disabled:opacity-50 w-full sm:w-auto"
            >
              {status === 'creating' ? 'Checking...' : 'Check Tables'}
            </button>
            
            <button
              onClick={createTables}
              disabled={status === 'creating'}
              className="bg-primary text-black px-5 py-2.5 rounded-lg font-medium shadow transition hover:scale-105 disabled:opacity-50 w-full sm:w-auto"
            >
              {status === 'creating' ? 'Creating...' : 'Create Tables'}
            </button>
            
            <button
              onClick={addSampleLeads}
              disabled={sampleStatus === 'creating' || !tables['rooftop_leads']}
              className="bg-primary/80 text-black px-5 py-2.5 rounded-lg font-medium shadow transition hover:scale-105 disabled:opacity-50 w-full sm:w-auto flex items-center justify-center gap-2"
            >
              {sampleStatus === 'creating' ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Inserting ({sampleLeadsInserted}/5)
                </>
              ) : (
                'Add Sample Leads'
              )}
            </button>
          </div>

          {Object.keys(tables).length > 0 && (
            <div className="bg-dark-100 rounded-xl p-6 border border-dark-200 mt-4">
              <h2 className="text-xl font-bold text-light mb-4">Table Status</h2>
              <div className="grid grid-cols-1 gap-3">
                {Object.entries(tables).map(([tableName, exists]) => (
                  <div
                    key={tableName}
                    className={`flex items-center justify-between p-3 rounded-lg ${exists ? 'bg-green-900/20 border border-green-700/30' : 'bg-red-900/20 border border-red-700/30'}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`text-lg ${exists ? 'text-green-500' : 'text-red-500'}`}>
                        {exists ? '✅' : '❌'}
                      </span>
                      <span className="font-mono font-medium text-light">{tableName}</span>
                    </div>
                    <span className={`text-sm ${exists ? 'text-green-400' : 'text-red-400'}`}>
                      {exists ? 'Available' : 'Not Available'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {status === 'error' && message && (
            <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-6 text-light">
              <h3 className="font-bold text-red-400 mb-2">Error</h3>
              <p>{message}</p>
            </div>
          )}

          {status === 'success' && message && (
            <div className="bg-green-900/20 border border-green-700/30 rounded-lg p-6 text-light">
              <h3 className="font-bold text-green-400 mb-2">Success</h3>
              <p>{message}</p>
            </div>
          )}
          
          {sampleStatus === 'success' && (
            <div className="bg-green-900/20 border border-green-700/30 rounded-lg p-6 text-light">
              <h3 className="font-bold text-green-400 mb-2">Sample Leads Added</h3>
              <p>Successfully added sample data to both rooftop_leads and site_visits tables!</p>
              <p className="mt-2">Your admin panels should now display the sample data. Check the RooftopLeads page.</p>
            </div>
          )}
          
          {sampleStatus === 'error' && (
            <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-6 text-light">
              <h3 className="font-bold text-red-400 mb-2">Error Adding Sample Data</h3>
              <p>{message}</p>
            </div>
          )}

          <div className="bg-dark-100 rounded-xl p-6 border border-dark-200 mt-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-light">SQL Statements</h2>
              <button
                onClick={copySQL}
                className="bg-dark-300 text-light px-4 py-2 rounded-lg text-sm font-medium hover:bg-dark-200 transition flex items-center gap-2"
              >
                {copied ? 'Copied!' : 'Copy SQL'}
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </button>
            </div>
            <p className="text-light/70 mb-4">
              To create the tables manually, copy these SQL statements and paste them into the SQL Editor in your Supabase dashboard.
            </p>
            <div className="bg-dark-800 p-4 rounded-lg overflow-auto">
              <pre className="font-mono text-sm text-light/80 whitespace-pre-wrap">{tableCreationSQL}</pre>
            </div>
          </div>

          <div className="bg-dark-100 rounded-xl p-6 border border-dark-200 mt-4">
            <h2 className="text-xl font-bold text-light mb-4">Instructions</h2>
            <ol className="list-decimal list-inside text-light/70 space-y-2">
              <li>Go to your <a href="https://app.supabase.io" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Supabase Dashboard</a></li>
              <li>Select your project</li>
              <li>Go to the SQL Editor in the left sidebar</li>
              <li>Create a new query</li>
              <li>Paste the SQL statements above</li>
              <li>Run the query to create the tables</li>
              <li>Come back to this page and click "Check Tables" to verify they were created</li>
            </ol>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
