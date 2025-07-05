import React, { useState } from 'react';
import { checkDatabaseTables, createTestRecord } from '../../utils/dbUtils';
import { AdminLayout } from '../../components/admin/AdminLayout';

export default function DatabaseCheck() {
  const [results, setResults] = useState<Record<string, boolean> | null>(null);
  const [loading, setLoading] = useState(false);
  const [testTable, setTestTable] = useState('');
  const [testResult, setTestResult] = useState<any>(null);
  const [testLoading, setTestLoading] = useState(false);

  const runCheck = async () => {
    setLoading(true);
    try {
      const tableResults = await checkDatabaseTables();
      setResults(tableResults);
    } catch (error) {
      console.error('Error checking tables:', error);
    } finally {
      setLoading(false);
    }
  };

  const runTestInsert = async () => {
    if (!testTable) return;
    setTestLoading(true);
    try {
      const result = await createTestRecord(testTable);
      setTestResult(result);
    } catch (error) {
      console.error('Error running test insert:', error);
      setTestResult({ success: false, error });
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold text-primary">Database Table Check</h1>
          <p className="text-light/70">
            This utility checks which tables exist in your Supabase database to help diagnose form submission issues.
          </p>

          <div className="flex items-center gap-4">
            <button
              onClick={runCheck}
              disabled={loading}
              className="bg-primary text-black px-5 py-2.5 rounded-lg font-medium shadow transition hover:scale-105 disabled:opacity-50"
            >
              {loading ? 'Checking...' : 'Check Database Tables'}
            </button>
          </div>
        </div>

        {results && (
          <div className="bg-dark-100 rounded-xl p-6 border border-dark-200 mt-4">
            <h2 className="text-xl font-bold text-light mb-4">Results</h2>
            <div className="grid grid-cols-1 gap-3">
              {Object.entries(results).map(([tableName, exists]) => (
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

        {results && (
          <div className="bg-dark-100 rounded-xl p-6 border border-dark-200 mt-4">
            <h2 className="text-xl font-bold text-light mb-4">Test Record Insertion</h2>
            <p className="text-light/70 mb-4">
              Select a table from the available tables to insert a test record and verify database permissions.
            </p>
            
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <select
                value={testTable}
                onChange={(e) => setTestTable(e.target.value)}
                className="px-4 py-2.5 rounded-lg bg-dark-200 text-light border border-dark-300 focus:ring-2 focus:ring-primary outline-none transition"
              >
                <option value="">Select a table</option>
                {results && Object.entries(results)
                  .filter(([_, exists]) => exists)
                  .map(([tableName]) => (
                    <option key={tableName} value={tableName}>
                      {tableName}
                    </option>
                  ))}
              </select>
              
              <button
                onClick={runTestInsert}
                disabled={!testTable || testLoading}
                className="bg-primary text-black px-5 py-2.5 rounded-lg font-medium shadow transition hover:scale-105 disabled:opacity-50"
              >
                {testLoading ? 'Testing...' : 'Insert Test Record'}
              </button>
            </div>
            
            {testResult && (
              <div className={`p-4 rounded-lg mt-4 ${testResult.success ? 'bg-green-900/20 border border-green-700/30' : 'bg-red-900/20 border border-red-700/30'}`}>
                <h3 className={`font-bold ${testResult.success ? 'text-green-500' : 'text-red-500'} mb-2`}>
                  {testResult.success ? 'Test Successful' : 'Test Failed'}
                </h3>
                <pre className="bg-dark-800 p-3 rounded overflow-auto text-sm font-mono text-light/80 max-h-64">
                  {JSON.stringify(testResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
