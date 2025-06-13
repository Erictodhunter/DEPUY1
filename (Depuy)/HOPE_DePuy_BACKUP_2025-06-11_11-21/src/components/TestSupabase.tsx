import React, { useState, useEffect } from 'react';
import { Database, CheckCircle, XCircle, AlertTriangle, Loader } from 'lucide-react';
import { supabase, getKits, getSurgeries, getInventoryItems, getManufacturers } from '../lib/supabase';

interface ConnectionTest {
  name: string;
  status: 'loading' | 'success' | 'error';
  message: string;
  data?: any;
}

const TestSupabase: React.FC = () => {
  const [tests, setTests] = useState<ConnectionTest[]>([
    { name: 'Supabase Connection', status: 'loading', message: 'Testing connection...' },
    { name: 'Kits Table', status: 'loading', message: 'Checking kits table...' },
    { name: 'Surgeries Table', status: 'loading', message: 'Checking surgeries table...' },
    { name: 'Inventory Table', status: 'loading', message: 'Checking inventory table...' },
    { name: 'Manufacturers Table', status: 'loading', message: 'Checking manufacturers table...' }
  ]);

  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    runTests();
  }, []);

  const runTests = async () => {
    setIsRetrying(false);
    
    // Test 1: Basic connection
    try {
      const { data, error } = await supabase.from('kits').select('count', { count: 'exact', head: true });
      if (error) throw error;
      
      updateTest(0, 'success', 'Connected to Supabase successfully');
    } catch (error) {
      updateTest(0, 'error', `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Test 2: Kits table
    try {
      const kits = await getKits();
      updateTest(1, 'success', `Found ${kits.length} kits in database`, kits);
    } catch (error) {
      updateTest(1, 'error', `Error accessing kits: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Test 3: Surgeries table
    try {
      const surgeries = await getSurgeries();
      updateTest(2, 'success', `Found ${surgeries.length} surgeries in database`, surgeries);
    } catch (error) {
      updateTest(2, 'error', `Error accessing surgeries: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Test 4: Inventory table
    try {
      const inventory = await getInventoryItems();
      updateTest(3, 'success', `Found ${inventory.length} inventory items in database`, inventory);
    } catch (error) {
      updateTest(3, 'error', `Error accessing inventory: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Test 5: Manufacturers table
    try {
      const manufacturers = await getManufacturers();
      updateTest(4, 'success', `Found ${manufacturers.length} manufacturers in database`, manufacturers);
    } catch (error) {
      updateTest(4, 'error', `Error accessing manufacturers: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const updateTest = (index: number, status: 'success' | 'error', message: string, data?: any) => {
    setTests(prev => prev.map((test, i) => 
      i === index ? { ...test, status, message, data } : test
    ));
  };

  const retryTests = () => {
    setIsRetrying(true);
    setTests(prev => prev.map(test => ({ ...test, status: 'loading', message: 'Retesting...' })));
    setTimeout(runTests, 1000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'loading':
        return <Loader size={20} className="text-yellow-400 animate-spin" />;
      case 'success':
        return <CheckCircle size={20} className="text-green-400" />;
      case 'error':
        return <XCircle size={20} className="text-red-400" />;
      default:
        return <AlertTriangle size={20} className="text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'border-green-500 bg-green-900/20';
      case 'error':
        return 'border-red-500 bg-red-900/20';
      case 'loading':
        return 'border-yellow-500 bg-yellow-900/20';
      default:
        return 'border-gray-500 bg-gray-900/20';
    }
  };

  const allTestsPassed = tests.every(test => test.status === 'success');
  const hasErrors = tests.some(test => test.status === 'error');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Supabase Connection Test</h1>
        <p className="text-gray-400 mt-1">Database connection and table accessibility testing</p>
      </div>

      {/* Overall Status */}
      <div className={`card border-2 ${allTestsPassed ? 'border-green-500' : hasErrors ? 'border-red-500' : 'border-yellow-500'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Database size={24} className="text-purple-400" />
            <div>
              <h2 className="text-xl font-semibold text-white">
                {allTestsPassed ? 'All Systems Operational' : hasErrors ? 'Connection Issues Detected' : 'Testing in Progress...'}
              </h2>
              <p className="text-gray-400">
                {allTestsPassed 
                  ? 'Your Supabase database is properly connected and accessible'
                  : hasErrors 
                  ? 'Some database tables are not accessible. Check your Supabase configuration.'
                  : 'Running connection tests...'
                }
              </p>
            </div>
          </div>
          <button 
            onClick={retryTests} 
            disabled={isRetrying}
            className="btn-primary flex items-center space-x-2"
          >
            {isRetrying ? (
              <>
                <Loader size={18} className="animate-spin" />
                <span>Retesting...</span>
              </>
            ) : (
              <>
                <Database size={18} />
                <span>Retry Tests</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Individual Test Results */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Test Results</h3>
        {tests.map((test, index) => (
          <div key={index} className={`card border ${getStatusColor(test.status)}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                {getStatusIcon(test.status)}
                <div className="flex-1">
                  <h4 className="text-white font-medium">{test.name}</h4>
                  <p className="text-gray-400 text-sm mt-1">{test.message}</p>
                  {test.data && test.status === 'success' && (
                    <details className="mt-2">
                      <summary className="text-purple-400 cursor-pointer text-sm hover:text-purple-300">
                        View data sample
                      </summary>
                      <pre className="mt-2 p-2 bg-gray-800 rounded text-xs text-gray-300 overflow-x-auto">
                        {JSON.stringify(test.data.slice(0, 2), null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Configuration Guide */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4">Configuration Guide</h3>
        <div className="space-y-4 text-gray-300">
          <div>
            <h4 className="text-white font-medium mb-2">1. Environment Variables</h4>
            <p className="text-sm text-gray-400 mb-2">
              Make sure you have set up your Supabase environment variables in <code className="bg-gray-800 px-1 rounded">.local.env</code>:
            </p>
            <pre className="bg-gray-800 p-3 rounded text-xs">
{`REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here`}
            </pre>
          </div>
          
          <div>
            <h4 className="text-white font-medium mb-2">2. Required Database Tables</h4>
            <p className="text-sm text-gray-400 mb-2">
              Your Supabase project should have the following tables:
            </p>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• <code className="bg-gray-800 px-1 rounded">kits</code> - Surgery kit management</li>
              <li>• <code className="bg-gray-800 px-1 rounded">surgeries</code> - Surgical procedures</li>
              <li>• <code className="bg-gray-800 px-1 rounded">inventory_items</code> - Medical inventory</li>
              <li>• <code className="bg-gray-800 px-1 rounded">manufacturers</code> - Equipment manufacturers</li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-medium mb-2">3. Getting Started</h4>
            <p className="text-sm text-gray-400">
              If you haven't set up Supabase yet, visit <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300">supabase.com</a> to create a new project and get your credentials.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestSupabase; 