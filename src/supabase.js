// src/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fpfuzxggtspthnnmoqel.supabase.co'   // 실제 프로젝트 URL로 대체
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwZnV6eGdndHNwdGhubm1vcWVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0MjkxMzEsImV4cCI6MjA2NTAwNTEzMX0.f_AtKQxnGwFP3LiNMn1VnsnlsQaHHJn8M_a7S6MNoIU'               // 실제 anon key로 대체

export const supabase = createClient(supabaseUrl, supabaseKey)
