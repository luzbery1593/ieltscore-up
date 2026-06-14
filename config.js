// IELTScoreUp — API Configuration
const CONFIG = {
  API_URL: 'https://ieltscore-up-api-production.up.railway.app',
  SUPABASE_URL: 'https://ystwgkfwydyrefbqjcjd.supabase.co',
  SUPABASE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzdHdna2Z3eWR5cmVmYnFqY2pkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0NDI5NjksImV4cCI6MjA5NzAxODk2OX0.9Lt-SwbxLruBuISA25bGxqPLL0no6alX8NqllJrMytk'
};

function getSupabase() {
  return supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_KEY);
}

async function getToken() {
  const sb = getSupabase();
  const { data } = await sb.auth.getSession();
  return data?.session?.access_token || null;
}

async function requireLogin() {
  const token = await getToken();
  if (!token) { window.location.href = '/auth.html'; return null; }
  return token;
}

async function getCurrentUser() {
  const sb = getSupabase();
  const { data } = await sb.auth.getSession();
  return data?.session?.user || null;
}

async function apiCall(endpoint, body = {}, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(CONFIG.API_URL + endpoint, {
    method: 'POST', headers, body: JSON.stringify(body)
  });
  if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'API error'); }
  return res.json();
}

async function playTTS(text, voice = 'british_female', onProgress) {
  const token = await getToken();
  if (!token) throw new Error('Not logged in');
  const res = await fetch(CONFIG.API_URL + '/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ text, voice })
  });
  if (!res.ok) throw new Error('Audio generation failed');
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  audio.ontimeupdate = () => { if (onProgress && audio.duration) onProgress(audio.currentTime, audio.duration); };
  return audio;
}
