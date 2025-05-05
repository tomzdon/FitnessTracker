// Test connecting to Supabase and creating a table
import pg from 'pg';
const { Pool } = pg;

async function testSupabaseConnection() {
  // Get the Supabase database URL
  const supabaseUrl = process.env.SUPABASE_DATABASE_URL;
  
  if (!supabaseUrl) {
    console.error('SUPABASE_DATABASE_URL environment variable is not set');
    process.exit(1);
  }
  
  // Clean any quotes from the URL
  const connectionString = supabaseUrl.replace(/^["']|["']$/g, '');
  
  console.log('Connecting to Supabase database...');
  console.log(`Connection string (masked): ${connectionString.replace(/postgres.*:(.*)@/, 'postgres***:***@')}`);
  
  // Create a connection pool with SSL enabled
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    // Test the connection
    console.log('Testing connection...');
    const result = await pool.query('SELECT current_database(), current_user');
    console.log('Connection successful!');
    console.log('Database:', result.rows[0].current_database);
    console.log('User:', result.rows[0].current_user);
    
    // List existing tables
    console.log('\nListing existing tables:');
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    if (tablesResult.rows.length === 0) {
      console.log('No tables found in the public schema');
    } else {
      tablesResult.rows.forEach(row => {
        console.log(`- ${row.table_name}`);
      });
    }
    
    // Close the connection
    await pool.end();
    console.log('\nConnection closed');
    
  } catch (error) {
    console.error('Error:', error);
    await pool.end();
    process.exit(1);
  }
}

testSupabaseConnection().catch(console.error);