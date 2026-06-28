import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://kebjnmmvhwqxxanygdvy.supabase.co'
const SUPABASE_KEY = 'sb_publishable_T-Mbdz5jZSOCbOsIh_dS8A_TyyP2dmE'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)