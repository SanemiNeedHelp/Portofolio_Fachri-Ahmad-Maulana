// ============================================================
//  config.js — Kredensial Supabase Sanemidev
// ============================================================

// Pastikan HANYA URL UTAMA (tanpa /rest/v1/)
const SUPABASE_URL = 'https://sfsgazpkzlrgrpnnmceo.supabase.co'; 

// Anon Key kamu sudah benar
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmc2dhenBremxyZ3Jwbm5tY2VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwMDk0NTMsImV4cCI6MjA5MjU4NTQ1M30.CIA1UioICkHTNKOiFrHN5oNOMTgrm5f0e2TUXB7Da50';

// Perbaikan: Inisialisasi client harus dilakukan sebelum memanggil auth
// Tapi karena kita menggunakan CDN di HTML, inisialisasi dilakukan di script.js atau admin.html.
// Di sini kita biarkan variabelnya saja agar bisa dipakai global.