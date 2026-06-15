// IELTScoreUp — Shared Navbar
// Uses single Supabase instance from config.js

(function() {
  var NAVBAR_PAGES = ['writing.html','reading.html','listening.html','speaking.html','grammar.html','mock-exam.html','certificates.html','profile.html'];
  var PLATFORM_PAGES = ['dashboard.html','writing.html','reading.html','listening.html','speaking.html','grammar.html','mock-exam.html','certificates.html','profile.html'];

  var currentPage = window.location.pathname.split('/').pop() || 'index.html';
  var needsNavbar = NAVBAR_PAGES.includes(currentPage);
  var isInsidePlatform = PLATFORM_PAGES.includes(currentPage);

  document.addEventListener('DOMContentLoaded', async function() {
    if (needsNavbar) document.body.style.paddingTop = '64px';

    // Use getSupabase() from config.js if available, else create instance
    var sb = (typeof getSupabase === 'function') ? getSupabase() : supabase.createClient(
      'https://ystwgkfwydyrefbqjcjd.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzdHdna2Z3eWR5cmVmYnFqY2pkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0NDI5NjksImV4cCI6MjA5NzAxODk2OX0.9Lt-SwbxLruBuISA25bGxqPLL0no6alX8NqllJrMytk',
      { auth: { storageKey: 'ieltscore-up-auth' } }
    );

    var { data } = await sb.auth.getSession();
    var user = data?.session?.user || null;

    if (isInsidePlatform && !user) {
      window.location.href = '/auth.html';
      return;
    }

    if (needsNavbar && user) buildNav(user, sb);
    else buildLandingNav(user);
  });

  function buildNav(user, sb) {
    var name = user.user_metadata?.full_name || user.email.split('@')[0];
    var initial = name.charAt(0).toUpperCase();

    var nav = document.createElement('nav');
    nav.className = 'isu-nav';
    nav.innerHTML = `
      <div class="isu-nav-inner">
        <div class="isu-nav-left">
          <button class="isu-hamburger" onclick="document.getElementById('isuMob').classList.toggle('open')">☰</button>
          <a href="/dashboard.html" class="isu-logo">IELTS<span>Score</span>Up</a>
        </div>
        <div class="isu-nav-links">
          <a href="/dashboard.html" class="isu-link ${currentPage==='dashboard.html'?'active':''}">Dashboard</a>
          <a href="/writing.html" class="isu-link ${currentPage==='writing.html'?'active':''}">Writing</a>
          <a href="/reading.html" class="isu-link ${currentPage==='reading.html'?'active':''}">Reading</a>
          <a href="/listening.html" class="isu-link ${currentPage==='listening.html'?'active':''}">Listening</a>
          <a href="/speaking.html" class="isu-link ${currentPage==='speaking.html'?'active':''}">Speaking</a>
          <a href="/grammar.html" class="isu-link ${currentPage==='grammar.html'?'active':''}">Grammar</a>
          <a href="/mock-exam.html" class="isu-link ${currentPage==='mock-exam.html'?'active':''}">Mock Exam</a>
          <a href="/certificates.html" class="isu-link ${currentPage==='certificates.html'?'active':''}">Certificates</a>
        </div>
        <div class="isu-nav-right">
          <div class="isu-user-wrap" onclick="document.getElementById('isuDD').classList.toggle('open')">
            <div class="isu-avatar">${initial}</div>
            <span class="isu-uname">${name.split(' ')[0]}</span>
            <span class="isu-chevron">▾</span>
          </div>
          <div class="isu-dropdown" id="isuDD">
            <div class="isu-dd-header">
              <div class="isu-dd-name">${name}</div>
              <div class="isu-dd-email">${user.email}</div>
              <div class="isu-dd-plan" id="isuDDPlan">Free Plan</div>
            </div>
            <a href="/profile.html" class="isu-dd-item">👤 My Profile</a>
            <a href="/profile.html#billing" class="isu-dd-item">⚡ Upgrade Plan</a>
            <a href="/certificates.html" class="isu-dd-item">🏆 My Certificates</a>
            <div class="isu-dd-sep"></div>
            <button class="isu-dd-item isu-dd-out" onclick="isuSignOut()">↩ Sign out</button>
          </div>
        </div>
      </div>
      <div class="isu-mob" id="isuMob">
        <a href="/dashboard.html">Dashboard</a>
        <a href="/writing.html">Writing</a>
        <a href="/reading.html">Reading</a>
        <a href="/listening.html">Listening</a>
        <a href="/speaking.html">Speaking</a>
        <a href="/grammar.html">Grammar</a>
        <a href="/mock-exam.html">Mock Exam</a>
        <a href="/certificates.html">Certificates</a>
        <div class="isu-mob-sep"></div>
        <a href="/profile.html">My Profile</a>
        <button onclick="isuSignOut()" style="padding:12px 24px;background:none;border:none;color:#DC2626;font-size:15px;font-weight:600;cursor:pointer;text-align:left;width:100%">Sign out</button>
      </div>
    `;
    document.body.insertBefore(nav, document.body.firstChild);

    sb.from('profiles').select('plan,full_name').eq('id', user.id).single().then(function(r) {
      if (r.data) {
        var p = r.data.plan;
        var label = p === 'pro' ? '⚡ Pro Plan' : p === 'intensive' ? '🚀 Intensive' : '🆓 Free Plan';
        var el = document.getElementById('isuDDPlan');
        if (el) el.textContent = label;
      }
    });

    document.addEventListener('click', function(e) {
      if (!e.target.closest('.isu-user-wrap') && !e.target.closest('.isu-dropdown')) {
        var dd = document.getElementById('isuDD');
        if (dd) dd.classList.remove('open');
      }
    });
  }

  function buildLandingNav(user) {
    var cta = document.querySelector('.nav-cta');
    if (!cta) return;
    if (user) { cta.textContent = 'Go to Dashboard →'; cta.href = '/dashboard.html'; }
    else { cta.href = '/auth.html'; }
  }

  window.isuSignOut = async function() {
    var sb = (typeof getSupabase === 'function') ? getSupabase() : supabase.createClient(
      'https://ystwgkfwydyrefbqjcjd.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzdHdna2Z3eWR5cmVmYnFqY2pkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0NDI5NjksImV4cCI6MjA5NzAxODk2OX0.9Lt-SwbxLruBuISA25bGxqPLL0no6alX8NqllJrMytk',
      { auth: { storageKey: 'ieltscore-up-auth' } }
    );
    await sb.auth.signOut();
    localStorage.clear();
    window.location.href = '/index.html';
  };
})();
