// ═══════════════════════════════════════════════════════════════
//   TOEIC Tracker Hook – Kết nối tracker.js với toeic-app.js
//   Đặt <script src="tracker-hook.js"></script> CUỐI index.html,
//   SAU cả toeic-app.js và tracker.js
//
//   File này KHÔNG sửa toeic-app.js gốc — dùng kỹ thuật
//   monkey-patching để chèn tracking vào đúng điểm cần thiết.
// ═══════════════════════════════════════════════════════════════

(function () {
  'use strict';

  // Chờ cả App lẫn Tracker sẵn sàng
  function waitReady(fn) {
    if (typeof App !== 'undefined' && typeof Tracker !== 'undefined') {
      fn();
    } else {
      setTimeout(() => waitReady(fn), 100);
    }
  }

  waitReady(() => {

    // ── 1. Track thời gian bắt đầu quiz ─────────────────────────
    let _quizStartTime = null;

    // ── 2. Hook submitQuiz ──────────────────────────────────────
    //   Trong App (IIFE), submitQuiz không expose ra ngoài trực tiếp.
    //   Chúng ta hook qua sự kiện click nút "Nộp bài" và
    //   lắng nghe DOM thay đổi khi results-container hiện ra.

    // Lưu thời điểm quiz bắt đầu mỗi khi quiz-container hiện
    const quizContainer = document.getElementById('quiz-container');
    const resultsContainer = document.getElementById('results-container');

    if (quizContainer) {
      const startObserver = new MutationObserver((muts) => {
        for (const m of muts) {
          if (m.attributeName === 'style') {
            const visible = quizContainer.style.display !== 'none';
            if (visible) _quizStartTime = Date.now();
          }
        }
      });
      startObserver.observe(quizContainer, { attributes: true, attributeFilter: ['style'] });
    }

    // Khi results-container xuất hiện → quiz vừa kết thúc
    if (resultsContainer) {
      const resultObserver = new MutationObserver((muts) => {
        for (const m of muts) {
          if (m.attributeName === 'style') {
            const visible = resultsContainer.style.display !== 'none';
            if (visible) _onQuizComplete();
          }
        }
      });
      resultObserver.observe(resultsContainer, { attributes: true, attributeFilter: ['style'] });
    }

    function _onQuizComplete() {
      try {
        // Đọc kết quả từ DOM (đã được submitQuiz() điền sẵn)
        const correct     = parseInt(document.getElementById('rs-correct')?.textContent  || '0', 10);
        const wrong       = parseInt(document.getElementById('rs-wrong')?.textContent    || '0', 10);
        const total       = correct + wrong;
        const pct         = total > 0 ? Math.round(correct / total * 100) : 0;

        // Đọc điểm TOEIC ước tính từ DOM
        const estEl       = document.getElementById('toeic-score-estimate');
        let estimatedScore = null;
        if (estEl) {
          const match = estEl.textContent.match(/(\d+)[–-](\d+)/);
          if (match) estimatedScore = { lo: parseInt(match[1]), hi: parseInt(match[2]) };
        }

        // Đọc quizMode & unitId (public qua App object nếu expose, hoặc từ DOM)
        const modeLabel   = document.querySelector('.quiz-mode-label')?.textContent || '';
        const unitBadge   = document.getElementById('quiz-unseen-badge');

        const timeSpentSec = _quizStartTime
          ? Math.round((Date.now() - _quizStartTime) / 1000)
          : 0;

        Tracker.trackQuiz({
          mode          : _getCurrentQuizMode(),
          correct,
          total,
          timeSpentSec,
          unitId        : _getCurrentUnitId(),
          estimatedScore,
        });
      } catch (e) {
        console.warn('[TrackerHook] trackQuiz error:', e);
      }
    }

    // Lấy quizMode hiện tại (đọc từ nút active trong quiz-setup)
    function _getCurrentQuizMode() {
      const activeBtn = document.querySelector('.quiz-mode-btn.active, [data-quiz-mode].active');
      if (activeBtn) return activeBtn.dataset.quizMode || activeBtn.textContent.trim();
      // Fallback: đọc từ tiêu đề kết quả
      const gradeEl = document.getElementById('grade-label');
      return gradeEl ? 'quiz' : 'unknown';
    }

    // Unit ID từ đường dẫn / trạng thái
    function _getCurrentUnitId() {
      // Nếu app lưu _currentUnitId (expose qua App.getUnitId nếu có)
      if (typeof App.getCurrentUnitId === 'function') return App.getCurrentUnitId();
      return '';
    }

    // ── 3. Track vocab ──────────────────────────────────────────
    //   Hook khi học viên nhấn "Đã biết" / "Chưa biết" trên flashcard
    //   Dùng event delegation vì cards render động
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-vocab-rate]');
      if (!btn) return;
      const topic  = document.querySelector('.vocab-topic-tag, .vocab-filter-active')?.textContent?.trim() || 'General';
      const rating = btn.dataset.vocabRate; // 'know' hoặc 'unknown'
      if (rating === 'know') {
        Tracker.trackVocab({ topic, learned: 1 });
      }
    });

    console.log('[TrackerHook] ✅ Đã kết nối tracker với TOEIC App');
  });

})();
