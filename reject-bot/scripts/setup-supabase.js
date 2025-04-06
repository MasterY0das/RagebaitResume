// Script to programmatically set up a Supabase database
// Usage: node setup-supabase.js

require('dotenv').config({ path: '../.env.local' });
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables. Please check your .env.local file.');
  process.exit(1);
}

// Create a Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Read SQL file
const sqlFile = path.join(__dirname, 'setup-supabase.sql');
const sqlContent = fs.readFileSync(sqlFile, 'utf8');

// Split SQL into individual statements (this is a simple approach)
const statements = sqlContent
  .split(';')
  .map(statement => statement.trim())
  .filter(statement => statement.length > 0);

async function executeQueries() {
  console.log('Setting up Supabase database...');
  
  try {
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      console.log(`Executing query ${i + 1} of ${statements.length}...`);
      
      const { data, error } = await supabase.rpc('exec_sql', { query: statement });
      
      if (error) {
        console.error(`Error executing query ${i + 1}:`, error);
        console.error('Query:', statement);
        
        // Check if this is a critical error to stop execution
        if (statement.includes('CREATE TABLE') && error.message.includes('already exists')) {
          console.log('Table already exists, continuing...');
        } else if (error.message.includes('function "exec_sql" does not exist')) {
          console.error('The exec_sql function does not exist in your Supabase project.');
          console.error('Please run the SQL statements manually through the Supabase SQL Editor.');
          break;
        } else {
          // For non-critical errors, continue
          console.error('Continuing with next statement...');
        }
      } else {
        console.log(`Query ${i + 1} executed successfully.`);
      }
    }
    
    console.log('Database setup completed!');
    console.log('Note: If there were errors, you may need to run the SQL manually.');
    
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
  }
}

executeQueries(); 