import { createClient } from '@supabase/supabase-js';

/**
 * A second Supabase client that connects to the PATIENT MODULE's database.
 * This is separate from the clinic's own Supabase project.
 *
 * The patient module stores self-registered patients, their reports,
 * and medical history uploaded from their personal devices.
 */

const patientModuleUrl = 'https://oarmuohgkjaijfphmntv.supabase.co';
const patientModuleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hcm11b2hna2phaWpmcGhtbnR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3Nzc3NDEsImV4cCI6MjEwNDM1Mzc0MX0.qEmRYSj6tcLKwZnEh7y2Ir3NC-fHQx8i3pLMhxPzXSs';

export const patientModuleSupabase = createClient(patientModuleUrl, patientModuleKey);
