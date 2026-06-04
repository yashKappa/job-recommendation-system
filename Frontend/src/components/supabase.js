import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://umvhgjhpbjtyoepwuopz.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtdmhnamhwYmp0eW9lcHd1b3B6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1ODk2NjQsImV4cCI6MjA5NjE2NTY2NH0.LCJgRfL2Nll4e-Ch-IsmUh_DylEtGQT_jYAbHV-TDuo";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
