const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config();

const runMigration = async () => {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    const migrationFile = process.argv[2] || 'migration.sql';
    const sql = fs.readFileSync(migrationFile, 'utf8');
    await client.query(sql);
    console.log(`Migration from ${migrationFile} completed successfully.`);
  } catch (err) {
    console.error('Error running migration:', err);
  } finally {
    await client.end();
  }
};

runMigration();
