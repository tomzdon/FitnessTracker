// Migration script to set the environment variable for using Supabase database
require('dotenv').config();

// Set the environment variable for the migration
process.env.DATABASE_URL = process.env.SUPABASE_DATABASE_URL;

// Run the migration
const { exec } = require('child_process');
exec('npx drizzle-kit push --force', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
});