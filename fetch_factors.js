const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://dinrwcwdxmkcbtyxqlbn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpbnJ3Y3dkeG1rY2J0eXhxbGJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMjc3ODQsImV4cCI6MjA4OTcwMzc4NH0.AbCoopMj6XVzURhsfLFPahLkt6b-kyO6C0g9q2hlzmE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fetchFactors() {
    const { data, error } = await supabase.from('factores').select('*');
    if (error) {
        console.error('Error fetching factors:', error);
        return;
    }
    console.log('Factors data:', JSON.stringify(data, null, 2));
}

fetchFactors();
