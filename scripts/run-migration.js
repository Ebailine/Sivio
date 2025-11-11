#!/usr/bin/env node

/**
 * Run SQL migrations on Supabase database
 * Usage: node scripts/run-migration.js [migration-file]
 */

const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function runMigration(migrationFile) {
  console.log('🚀 Running migration:', migrationFile)
  console.log('=' .repeat(60))

  try {
    // Read SQL file
    const sqlPath = path.join(__dirname, '..', 'supabase', 'migrations', migrationFile)
    if (!fs.existsSync(sqlPath)) {
      console.error(`❌ Migration file not found: ${sqlPath}`)
      process.exit(1)
    }

    const sql = fs.readFileSync(sqlPath, 'utf8')
    console.log(`📄 Loaded SQL file (${sql.length} bytes)`)

    // Execute SQL using raw query
    console.log('⚙️  Executing SQL migration...')
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql }).catch(() => {
      // If exec_sql function doesn't exist, we'll use a different approach
      return { data: null, error: 'exec_sql not available' }
    })

    if (error && error !== 'exec_sql not available') {
      console.error('❌ Migration failed:', error)
      process.exit(1)
    }

    // If exec_sql doesn't exist, use direct connection
    if (error === 'exec_sql not available') {
      console.log('⚠️  exec_sql function not available, using alternative method...')
      console.log('')
      console.log('Please run this migration manually in Supabase SQL Editor:')
      console.log('')
      console.log('1. Go to: https://supabase.com/dashboard/project/clwnebahltkbcjnzexwh/sql/new')
      console.log('2. Copy and paste the contents of: supabase/migrations/' + migrationFile)
      console.log('3. Click "Run"')
      console.log('')
      console.log('Or use psql with your Supabase connection string:')
      console.log(`psql "postgresql://postgres:[YOUR-PASSWORD]@db.clwnebahltkbcjnzexwh.supabase.co:5432/postgres" -f ${sqlPath}`)
      console.log('')
      process.exit(0)
    }

    console.log('✅ Migration completed successfully!')
    console.log('=' .repeat(60))

    // Verify tables were created
    console.log('')
    console.log('🔍 Verifying tables...')
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .like('table_name', '%cache%')

    if (tablesError) {
      console.error('❌ Failed to verify tables:', tablesError)
    } else {
      console.log('✅ Created tables:', tables?.map(t => t.table_name).join(', ') || 'none found')
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
    process.exit(1)
  }
}

// Get migration file from command line or use default
const migrationFile = process.argv[2] || 'create_caching_tables.sql'
runMigration(migrationFile)
