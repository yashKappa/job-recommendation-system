import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://pgjihfrgevmyybpqtbay.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnamloZnJnZXZteXlicHF0YmF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2NTc1NTQsImV4cCI6MjA3MzIzMzU1NH0.htfYKJ_kAOsN77-L6RxxKnNbJ_K1dKNXnd-cLPc9Azg";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
