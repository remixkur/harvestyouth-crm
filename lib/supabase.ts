import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://koigswanceixhtnpmhgj.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvaWdzd2FuY2VpeGh0bnBtaGdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzOTcwMjEsImV4cCI6MjA4ODk3MzAyMX0.88-0Br8Ds-TfHDcsCjYrLKjNZwYV0GmL15WcmAPCz24";

export const supabase = createClient(supabaseUrl, supabaseKey);