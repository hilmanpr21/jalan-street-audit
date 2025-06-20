// Initialize Supabase
const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY'
const supabase = supabase.createClient(supabaseUrl, supabaseKey)

// Test connection
async function testConnection() {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .limit(1)
  
  if (error) console.error('Supabase connection error:', error)
  else console.log('Supabase connected!', data)
}

testConnection()