const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://axqprnuyldvpkofanakt.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4cXBybnV5bGR2cGtvZmFuYWt0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjE5NjEzNiwiZXhwIjoyMDcxNzcyMTM2fQ.1N0x_jM9XkShEIdTA1ir35j05bZOJx25B58BeJG-2M4'

// Create Supabase client with service role key for backend operations
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

module.exports = { supabase }