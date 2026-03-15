// ═══════════════════════════════════════════════════════════════
//   TOEIC Tracker – Student Activity Logger (v1.0)
//   Gửi dữ liệu học tập lên Google Sheets qua Apps Script
//   Thêm vào index.html: <script src="tracker.js"></script>
//   (Phải đặt SAU toeic-app.js)
// ═══════════════════════════════════════════════════════════════

const Tracker = (() => {

  // ─── ⚙️  CẤU HÌNH – chỉ cần sửa 2 dòng này ───────────────────
  const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyy3SdqWOEjZJ7ANEfwUk3bIMu18P_FMQupm4TziPXFlgAJY8COukEbQDCAVljfbMQO4w/exec';
  //  Dán URL từ Google Apps Script vào đây ↑
  //  Ví dụ: 'https://script.google.com/macros/s/AKfyc.../exec'

  const CLASS_ID = 'TOEIC_2025';
  //  Đặt tên lớp/khoá học của bạn ↑ (dùng để phân biệt nhiều lớp)
  // ────────────────────────────────────────────────────────────────

  const STORAGE_KEY  = 'toeic_student_name';
  const QUEUE_KEY    = 'toeic_track_queue';   // hàng chờ khi offline
  const SESSION_START = Date.now();

  // ─── Tên học viên ──────────────────────────────────────────────
  function getStudentName() {
    return localStorage.getItem(STORAGE_KEY) || '';
  }
  function saveStudentName(name) {
    localStorage.setItem(STORAGE_KEY, name.trim());
  }

  // ─── Hàng chờ offline ──────────────────────────────────────────
  function getQueue() {
    try { return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]'); }
    catch { return []; }
  }
  function saveQueue(q) {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(q.slice(-50))); // giữ tối đa 50 bản ghi
  }
  function enqueue(payload) {
    const q = getQueue();
    q.push(payload);
    saveQueue(q);
  }

  // ─── Gửi dữ liệu lên Google Sheets ────────────────────────────
  async function send(payload) {
    if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL === 'YOUR_APPS_SCRIPT_URL_HERE') {
      console.warn('[Tracker] Apps Script URL chưa được cấu hình.');
      return;
    }
    const data = { ...payload, classId: CLASS_ID, studentName: getStudentName() };
    try {
      await fetch(APPS_SCRIPT_URL, {
        method : 'POST',
        mode   : 'no-cors',          // bắt buộc với Apps Script
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify(data),
      });
    } catch {
      // Offline → lưu hàng chờ, gửi lại lần sau
      enqueue(data);
    }
  }

  // Gửi lại những bản ghi bị lỡ khi offline
  async function flushQueue() {
    const q = getQueue();
    if (!q.length) return;
    const failed = [];
    for (const payload of q) {
      try {
        await fetch(APPS_SCRIPT_URL, {
          method : 'POST',
          mode   : 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body   : JSON.stringify(payload),
        });
      } catch {
        failed.push(payload);
      }
    }
    saveQueue(failed);
  }

  // ─── Popup nhập tên học viên ───────────────────────────────────
  function showNamePrompt(onDone) {
    const existing = getStudentName();
    if (existing) { onDone(existing); return; }

    // Tạo overlay
    const overlay = document.createElement('div');
    overlay.id = 'tracker-name-overlay';
    overlay.style.cssText = `
      position:fixed;inset:0;z-index:10000;
      background:rgba(0,0,0,0.75);backdrop-filter:blur(8px);
      display:flex;align-items:center;justify-content:center;padding:20px;
    `;
    overlay.innerHTML = `
      <div style="
        background:var(--bg-card,#1a1e35);border:1px solid var(--border,rgba(255,255,255,.12));
        border-radius:16px;padding:32px 28px;max-width:400px;width:100%;
        animation:fadeUp .25s ease;text-align:center;
      ">
        <div style="font-size:2.5rem;margin-bottom:12px;">👋</div>
        <h2 style="font-size:1.25rem;font-weight:800;margin-bottom:8px;color:var(--text-primary,#fff)">
          Chào mừng đến TOEIC Master!
        </h2>
        <p style="color:var(--text-muted,#94a3b8);font-size:0.9rem;margin-bottom:22px;line-height:1.5">
          Nhập tên của bạn để giáo viên theo dõi tiến độ học tập.
        </p>
        <input id="tracker-name-input" type="text"
          placeholder="Họ và tên của bạn..."
          autocomplete="name"
          style="
            width:100%;box-sizing:border-box;padding:12px 16px;
            background:var(--bg-input,#0d1117);border:1px solid var(--border,rgba(255,255,255,.15));
            border-radius:10px;color:var(--text-primary,#fff);font-size:1rem;
            outline:none;margin-bottom:16px;
          "
        />
        <button id="tracker-name-btn" style="
          width:100%;padding:12px;background:var(--accent,#4f8ef7);
          border:none;border-radius:10px;color:#fff;font-size:1rem;
          font-weight:700;cursor:pointer;transition:opacity .2s;
        ">
          Bắt đầu học →
        </button>
        <p style="color:var(--text-muted,#94a3b8);font-size:0.75rem;margin-top:14px;">
          Tên chỉ dùng để báo cáo tiến độ học tập cho giáo viên.
        </p>
      </div>
    `;
    document.body.appendChild(overlay);

    const input = document.getElementById('tracker-name-input');
    const btn   = document.getElementById('tracker-name-btn');

    function submit() {
      const name = input.value.trim();
      if (!name) {
        input.style.borderColor = '#ef4444';
        input.placeholder = '⚠️ Vui lòng nhập tên của bạn';
        return;
      }
      saveStudentName(name);
      overlay.remove();
      // Gửi sự kiện "lần đầu đăng ký"
      send({ event: 'register', ts: new Date().toISOString() });
      flushQueue();
      onDone(name);
    }

    btn.addEventListener('click', submit);
    input.addEventListener('keypress', e => { if (e.key === 'Enter') submit(); });
    setTimeout(() => input.focus(), 100);
  }

  // ─── Track: Truy cập phiên ─────────────────────────────────────
  function trackPageVisit() {
    send({
      event      : 'visit',
      ts         : new Date().toISOString(),
      userAgent  : navigator.userAgent.substring(0, 80),
    });
  }

  // ─── Track: Kết quả quiz ───────────────────────────────────────
  //   Gọi hàm này từ submitQuiz() trong toeic-app.js
  function trackQuiz({ mode, correct, total, timeSpentSec, unitId, estimatedScore }) {
    const pct = Math.round(correct / total * 100);
    send({
      event          : 'quiz',
      ts             : new Date().toISOString(),
      quizMode       : mode,
      correct,
      total,
      wrong          : total - correct,
      pct,
      timeSpentSec   : timeSpentSec || 0,
      unitId         : unitId || '',
      estimatedLo    : estimatedScore ? estimatedScore.lo : '',
      estimatedHi    : estimatedScore ? estimatedScore.hi : '',
    });
  }

  // ─── Track: Từ vựng đã học ────────────────────────────────────
  function trackVocab({ topic, learned }) {
    send({
      event  : 'vocab',
      ts     : new Date().toISOString(),
      topic,
      learned,
    });
  }

  // ─── Track: Thời gian dùng app ────────────────────────────────
  function trackSessionEnd() {
    const sec = Math.round((Date.now() - SESSION_START) / 1000);
    if (sec < 10) return;   // bỏ qua phiên < 10 giây
    send({
      event      : 'session_end',
      ts         : new Date().toISOString(),
      durationSec: sec,
    });
  }

  // Gửi khi đóng tab
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') trackSessionEnd();
  });
  window.addEventListener('pagehide', trackSessionEnd);

  // ─── Khởi động ────────────────────────────────────────────────
  function init() {
    // Đợi DOM sẵn sàng rồi mới hiện popup tên
    showNamePrompt((name) => {
      console.log(`[Tracker] Xin chào, ${name}!`);
      trackPageVisit();
      flushQueue();     // gửi lại các bản ghi offline (nếu có)
    });
  }

  // ─── Public API ───────────────────────────────────────────────
  return { init, trackQuiz, trackVocab, getStudentName, send };
})();

// Khởi động khi DOM sẵn sàng
document.addEventListener('DOMContentLoaded', () => Tracker.init());
