import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import AdminLayout from '../../components/admin/AdminLayout';
import { Button } from '../../design-system/components/Button/Button';

const SetupDatabase = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');
  
  const createProductCategoriesTable = async () => {
    setLoading(true);
    setResult('');
    setError('');
    
    try {
      // 1. Check if product_categories table exists
      try {
        const { count } = await supabase
          .from('product_categories')
          .select('*', { count: 'exact', head: true });
        
        setResult(prev => prev + '✓ Product categories table already exists\n');
      } catch (err: any) {
        // If error contains "relation does not exist", we need to create the table
        if (err.message?.includes('relation "product_categories" does not exist')) {
          setResult(prev => prev + '⚠️ Product categories table does not exist, creating it...\n');
          
          // We can't create tables directly via the JavaScript client, so we'll need to do this
          // via the SQL Editor in Supabase dashboard
          setResult(prev => prev + '❌ Please create the table using SQL Editor in Supabase dashboard\n');
          setResult(prev => prev + 'Use the SQL script provided in scripts/create_tables.sql\n');
          return;
        }
      }
      
      // 2. Insert default categories
      const categories = [
        { name: 'All Products', icon_name: 'sun' },
        { name: 'On-Grid Systems', icon_name: 'sun' },
        { name: 'Off-Grid Systems', icon_name: 'zap' },
        { name: 'Hybrid Systems', icon_name: 'wrench' },
        { name: 'Residential', icon_name: 'home' },
        { name: 'Commercial', icon_name: 'building' },
        { name: 'Industrial', icon_name: 'factory' }
      ];
      
      const { error: insertError } = await supabase
        .from('product_categories')
        .upsert(categories, { onConflict: 'name' });
        
      if (insertError) {
        throw new Error(`Error inserting categories: ${insertError.message}`);
      }
      
      setResult(prev => prev + '✓ Default categories inserted or updated\n');
      setResult(prev => prev + '✅ Database setup complete!\n');
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message || 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <AdminLayout title="Database Setup">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-light">Database Setup</h1>
          <p className="text-light/60">Set up the database tables for Type 3 Energy admin panel</p>
        </div>
        
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2 text-light">Instructions</h2>
          <p className="mb-2 text-light/80">This utility will help set up the necessary database tables:</p>
          <ol className="list-decimal list-inside mb-4 text-light/80">
            <li>Create product_categories table (if not exists)</li>
            <li>Insert default categories</li>
            <li>Set up relationship with products table</li>
          </ol>
          <div className="p-4 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-md mb-4">
            <p className="font-semibold">Important:</p>
            <p>
              The Supabase JavaScript client cannot create tables directly. If tables don't exist,
              you'll need to create them manually using the SQL Editor in the Supabase dashboard.
            </p>
          </div>
        </div>
        
        <div className="mb-6">
          <Button 
            onClick={createProductCategoriesTable}
            disabled={loading}
          >
            {loading ? 'Setting up...' : 'Set Up Database Tables'}
          </Button>
        </div>
        
        {error && (
          <div className="p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-md mb-4">
            <p className="font-semibold">Error:</p>
            <p>{error}</p>
          </div>
        )}
        
        {result && (
          <div className="p-4 bg-black/90 text-green-400 rounded-md mb-4 font-mono">
            <pre className="whitespace-pre-wrap">{result}</pre>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default SetupDatabase;
