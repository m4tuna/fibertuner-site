import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://rfvcpnnbqihfwatrxhib.supabase.co'
const SUPABASE_KEY = 'sb_publishable_9ZwitUQo0Y-unPRePt9aCQ_Mn5UCh6i'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
