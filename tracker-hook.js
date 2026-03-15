// ═══════════════════════════════════════════════════════════════
//   TOEIC Tracker Hook – Kết nối tracker.js với toeic-app.js
//   Đặt <script src="tracker-hook.js"></script> CUỐI index.html,
//   SAU cả toeic-app.js và tracker.js
// ═══════════════════════════════════════════════════════════════

(function () {
  'use strict';

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

    // Ghi thời điểm bắt đầu khi quiz-container hiện ra
    const quizContainer = document.getElementById('quiz-container');
    if (quizContainer) {
      new MutationObserver(() => {
        if (quizContainer.style.display !== 'none' && quizContainer.style.display !== '') {
          _quizStartTime = Date.now();
        }
      }).observe(quizContainer, { attributes: true, attributeFilter: ['style'] });
    }

    // ── 2. Hook vào btn-submit-quiz (click) + timer hết giờ ──────
    //   Cách đáng tin cậy nhất: lắng nghe đúng nút "Nộp bài"
    //   và dùng setTimeout để đợi submitQuiz() điền xong DOM.
    document.addEventListener('click', (e) => {
      if (e.target && e.target.id === 'btn-submit-quiz') {
        // Đợi submitQuiz() chạy xong rồi mới đọc kết quả
        setTimeout(_onQuizComplete, 50);
      }
    });

    // Hook timer hết giờ: submitQuiz() được gọi tự động,
    // theo dõi results-container chuyển sang visible
    const resultsContainer = document.getElementById('results-container');
    if (resultsContainer) {
      let _lastResultVisible = false;
      new MutationObserver(() => {
        const nowVisible = resultsContainer.style.display === 'block';
        if (nowVisible && !_lastResultVisible) {
          // Đợi DOM điền xong (submitQuiz gán textContent ngay sau set display)
          setTimeout(_onQuizComplete, 50);
        }
        _lastResultVisible = nowVisible;
      }).observe(resultsContainer, { attributes: true, attributeFilter: ['style'] });
    }

    function _onQuizComplete() {
      try {
        // Chỉ gửi khi results-container đang hiển thị
        const rc = document.getElementById('results-container');
        if (!rc || rc.style.display !== 'block') return;

        const correct = parseInt(document.getElementById('rs-correct')?.textContent || '0', 10);
        const wrong   = parseInt(document.getElementById('rs-wrong')?.textContent   || '0', 10);
        const total   = correct + wrong;
        if (total === 0) return; // bảo vệ: chưa có dữ liệu

        const pct = Math.round(correct / total * 100);

        // Điểm TOEIC ước tính
        let estimatedScore = null;
        const estEl = document.getElementById('toeic-score-estimate');
        if (estEl) {
          const m = estEl.textContent.match(/(\d+)[–\-](\d+)/);
          if (m) estimatedScore = { lo: parseInt(m[1]), hi: parseInt(m[2]) };
        }

        const timeSpentSec = _quizStartTime
          ? Math.round((Date.now() - _quizStartTime) / 1000)
          : 0;

        // Reset để không gửi 2 lần
        _quizStartTime = null;

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

    function _getCurrentQuizMode() {
      // Đọc từ label hiển thị trong quiz (đáng tin hơn selector class)
      const partLabel = document.getElementById('quiz-part-label');
      if (partLabel && partLabel.textContent) return partLabel.textContent.trim();
      const activeCard = document.querySelector('.test-option-card.active, [data-mode].selected');
      if (activeCard) return activeCard.dataset.mode || activeCard.textContent.trim();
      return 'quiz';
    }

    function _getCurrentUnitId() {
      if (typeof App.getCurrentUnitId === 'function') return App.getCurrentUnitId();
      return '';
    }

    // ── 3. Track vocab ──────────────────────────────────────────
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-vocab-rate]');
      if (!btn) return;
      const topic  = document.querySelector('.vocab-topic-tag, .vocab-filter-active')?.textContent?.trim() || 'General';
      if (btn.dataset.vocabRate === 'know') {
        Tracker.trackVocab({ topic, learned: 1 });
      }
    });

    console.log('[TrackerHook] ✅ Đã kết nối tracker với TOEIC App');
  });

})();
