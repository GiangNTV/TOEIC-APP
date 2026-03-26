// ═══════════════════════════════════════════════
//   TOEIC App – Main Application Logic (v3.0)
//   Architecture: data-*.js globals (works offline + online)
// ═══════════════════════════════════════════════

const App = (() => {
  // ─── State ───
  let currentPage = 'home';
  let DB = { questions: { part5:[], part6:[], part7:[] }, vocab: [], grammar: [] };
  let flatQuestions = []; // flattened for quiz use
  let vocabFilter = 'All';
  let grammarTopic = null;

  // Quiz state
  let quizQuestions = [], quizIndex = 0, quizScore = 0, quizAnswered = 0;
  let quizTimer = null, quizTimeLeft = 0, quizUserAnswers = [], quizMode = 'part5';

  const QUIZ_MODES = {
    quick:   { label:"Luyện nhanh",   filter: q => q.part===5,               time:900,  count:20  },
    part5:   { label:"Part 5 Focus",  filter: q => q.part===5,               time:600,  count:30  },
    part6:   { label:"Part 6 Focus",  filter: q => q.part===6,               time:480,  count:16  },
    part7:   { label:"Part 7 Focus",  filter: q => q.part===7,               time:2700, count:54  },
    reading: { label:"Full Reading",  filter: q => true,                     time:4500, count:100 },
  };

  const UNIT_METADATA = [
    { id:1,  title:"Business Foundations",    vocab:["Office","Business"]                       },
    { id:2,  title:"Office Life",             vocab:["HR","Office"]                             },
    { id:3,  title:"Personnel & HR",          vocab:["HR","Leadership"]                         },
    { id:4,  title:"Marketing & Sales",       vocab:["Marketing","Sales"]                       },
    { id:5,  title:"Finance & Budget",        vocab:["Finance","Accounting"]                    },
    { id:6,  title:"Tech & Innovation",       vocab:["Tech","Digital"]                          },
    { id:7,  title:"Manufacturing & QC",      vocab:["Manufacturing","Supply Chain"]            },
    { id:8,  title:"Travel & Tourism",        vocab:["Travel"]                                  },
    { id:9,  title:"Corporate Events",        vocab:["Events"]                                  },
    { id:10, title:"Customer Service",        vocab:["Customer Service"]                        },
    { id:11, title:"Logistics & Shipping",    vocab:["Supply Chain","Insurance"]                },
    { id:12, title:"Health & Safety",         vocab:["Healthcare","Safety"]                     },
    { id:13, title:"Banking & Investment",    vocab:["Finance","Accounting"]                    },
    { id:14, title:"Real Estate",             vocab:["Property"]                                },
    { id:15, title:"Media & Communications", vocab:["Media"]                                   },
    { id:16, title:"Retail & E-commerce",    vocab:["Sales","E-commerce"]                      },
    { id:17, title:"Research & Development", vocab:["Project Management","General"]             },
    { id:18, title:"Professional Training",  vocab:["Education"]                               },
    { id:19, title:"Law & Contracts",        vocab:["Legal"]                                   },
    { id:20, title:"Environment & Energy",   vocab:["Environment","Sustainability"]             },
    { id:21, title:"Business Communications",vocab:["Collocations","Phrases"]                  },
    { id:22, title:"Corporate Policy",       vocab:["Leadership","Business"]                   },
    { id:23, title:"Advanced Structures",    vocab:["General","Food & Beverage"]               },
  ];

  // ─── TOEIC Reading Score Conversion Table (% đúng → dải điểm) ───
  // Dựa trên bảng chuyển đổi ETS chính thức (Reading: 0–495)
  const TOEIC_SCORE_RANGES = [
    { pctMin:95, pctMax:100, lo:460, hi:495 },
    { pctMin:88, pctMax:94,  lo:415, hi:455 },
    { pctMin:82, pctMax:87,  lo:380, hi:410 },
    { pctMin:76, pctMax:81,  lo:345, hi:375 },
    { pctMin:70, pctMax:75,  lo:310, hi:340 },
    { pctMin:64, pctMax:69,  lo:275, hi:305 },
    { pctMin:58, pctMax:63,  lo:240, hi:270 },
    { pctMin:52, pctMax:57,  lo:205, hi:235 },
    { pctMin:46, pctMax:51,  lo:170, hi:200 },
    { pctMin:40, pctMax:45,  lo:140, hi:165 },
    { pctMin:34, pctMax:39,  lo:110, hi:135 },
    { pctMin:28, pctMax:33,  lo: 80, hi:105 },
    { pctMin:22, pctMax:27,  lo: 55, hi: 75 },
    { pctMin:16, pctMax:21,  lo: 35, hi: 50 },
    { pctMin: 0, pctMax:15,  lo: 10, hi: 30 },
  ];

  function estimateToeicScore(pct) {
    return TOEIC_SCORE_RANGES.find(r => pct >= r.pctMin && pct <= r.pctMax)
        || TOEIC_SCORE_RANGES[TOEIC_SCORE_RANGES.length - 1];
  }
  function init() {
    // Data is loaded via <script> tags (data-vocab.js, data-grammar.js, data-questions.js)
    // Works both offline (file://) and online (https://)
    if (typeof TOEIC_VOCAB === 'undefined' || typeof TOEIC_QUESTIONS === 'undefined' || typeof TOEIC_GRAMMAR === 'undefined') {
      const overlay = document.getElementById('loading-overlay');
      if (overlay) {
        document.getElementById('load-msg').textContent = '❌ Thiếu file dữ liệu. Hãy kiểm tra data-vocab.js, data-questions.js, data-grammar.js';
        document.getElementById('load-msg').style.color = '#ef4444';
      }
      console.error('TOEIC data globals not found. Make sure data-vocab.js, data-questions.js, data-grammar.js are loaded.');
      return;
    }

    setLoadProgress(40, 'Đang xử lý dữ liệu...');
    DB.vocab     = TOEIC_VOCAB;
    DB.questions = TOEIC_QUESTIONS;
    DB.grammar   = TOEIC_GRAMMAR;

    // Flatten questions for quiz use
    flatQuestions = [];
    DB.questions.part5.forEach(q => flatQuestions.push({...q, part:5}));
    DB.questions.part6.forEach(grp => grp.questions.forEach(q => flatQuestions.push({...q, passage:grp.passage, passageTitle:grp.passageTitle, type:grp.type, part:6})));
    DB.questions.part7.forEach(grp => grp.questions.forEach(q => flatQuestions.push({...q, passage:grp.passage, passageTitle:grp.passageTitle, type:grp.type, part:7})));

    setLoadProgress(85, 'Đang khởi động giao diện...');
    grammarTopic = DB.grammar[0]?.id || null;

    setupNav();
    renderHomeDashboard();
    renderWordOfTheDay();
    setupVocabPage();
    setupGrammarPage();
    setupPracticePage();
    setupHomeworkLogic();
    updateWrongCountUI();
    // ── Gamification ──
    recordActivity();
    renderStreakBanner();
    // Override flashcard to use SRS
    document.getElementById('btn-flashcard')?.addEventListener('click', e => { e.stopImmediatePropagation(); openFlashcardSRS(); }, true);

    // Update badges
    document.getElementById('badge-vocab').textContent     = `📖 ${DB.vocab.length}+ Từ vựng`;
    document.getElementById('badge-questions').textContent = `❓ ${flatQuestions.length}+ Câu hỏi TOEIC`;

    setLoadProgress(100, 'Sẵn sàng!');
    setTimeout(() => {
      const overlay = document.getElementById('loading-overlay');
      if (overlay) overlay.style.display = 'none';
    }, 300);
  }

  function setLoadProgress(pct, msg) {
    const bar = document.getElementById('load-bar');
    const msgEl = document.getElementById('load-msg');
    if (bar) bar.style.width = pct + '%';
    if (msgEl) msgEl.textContent = msg;
  }

  // ─── Navigation ───
  function setupNav() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => App.navigate(btn.dataset.page));
    });
  }

  function navigate(page) {
    currentPage = page;
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    const el = document.getElementById(`page-${page}`);
    if (el) el.classList.add('active');
    const btn = document.querySelector(`.nav-btn[data-page="${page}"]`);
    if (btn) btn.classList.add('active');
    window.scrollTo(0, 0);
  }

  // ─── Home Dashboard ───
  function renderHomeDashboard() {
    const prog = getProgress();
    document.getElementById('stat-vocab').textContent     = prog.vocabSeen || 0;
    document.getElementById('stat-tests').textContent     = prog.testsCompleted || 0;
    document.getElementById('stat-questions').textContent = prog.totalAnswered || 0;
    document.getElementById('stat-accuracy').textContent  = (prog.accuracy || 0) + '%';
    const unseenEl = document.getElementById('stat-unseen');
    if (unseenEl) {
      const seenCount = (prog.seenIds || []).length;
      unseenEl.textContent = flatQuestions.length > 0 ? Math.max(0, flatQuestions.length - seenCount) : '—';
    }
    // Grammar mastery stat card
    const grammarEl = document.getElementById('stat-grammar');
    if (grammarEl) {
      const stats   = getGrammarStats();
      const total   = DB.grammar ? DB.grammar.length : 25;
      const mastered = DB.grammar
        ? DB.grammar.filter(t => getGrammarMasteryLevel(t.id) === 'mastered').length
        : 0;
      grammarEl.textContent = mastered + '/' + total;
      const labelEl = document.getElementById('stat-grammar-label');
      if (labelEl) {
        const pct = total > 0 ? Math.round(mastered / total * 100) : 0;
        labelEl.textContent = pct >= 80 ? '🏆 Ngữ pháp thành thạo'
                            : pct >= 40 ? '📈 Ngữ pháp đang tiến bộ'
                            : 'Chủ đề đã thành thạo';
      }
    }
    // SRS due reminder on Home page
    const srsReminderEl = document.getElementById('home-srs-reminder');
    if (srsReminderEl) {
      const due = qSrsDueCount();
      const wrongTotal = getWrongIds().size;
      if (due > 0) {
        srsReminderEl.style.display = 'flex';
        srsReminderEl.innerHTML = `
          <div style="flex:1">
            <span style="font-size:0.88rem;font-weight:700;color:#fbbf24">🔄 ${due} câu cần ôn hôm nay</span>
            <span style="font-size:0.75rem;color:var(--text-muted);margin-left:8px">/ ${wrongTotal} câu sai tổng</span>
          </div>
          <button onclick="App.startWrongReview(true)" class="btn btn-sm"
            style="border:1px solid rgba(251,191,36,0.4);color:#fbbf24;background:transparent;flex-shrink:0;white-space:nowrap">
            Ôn ngay →
          </button>`;
      } else {
        srsReminderEl.style.display = 'none';
      }
    }
  }

  // ─── Progress (localStorage) ───
  function getProgress() {
    try { return JSON.parse(localStorage.getItem('toeic_progress') || '{}'); }
    catch { return {}; }
  }
  function saveProgress(data) {
    const cur = getProgress();
    localStorage.setItem('toeic_progress', JSON.stringify({...cur, ...data}));
  }
  function getSeenIds()  { return new Set(getProgress().seenIds  || []); }
  function getWrongIds() { return new Set(getProgress().wrongIds || []); }

  function markQuestionsAnswered(questions, userAnswers) {
    const prog  = getProgress();
    const seen  = new Set(prog.seenIds  || []);
    const wrong = new Set(prog.wrongIds || []);
    questions.forEach((q, i) => {
      if (!q.id) return;
      seen.add(q.id);
      if (userAnswers[i] !== null && userAnswers[i] !== undefined) {
        userAnswers[i] !== q.answer ? wrong.add(q.id) : wrong.delete(q.id);
      }
    });
    saveProgress({ seenIds: [...seen], wrongIds: [...wrong] });
    updateWrongCountUI();
  }

  function buildSmartPool(rawPool, count) {
    const seen  = getSeenIds();
    const wrong = getWrongIds();
    const unseen      = rawPool.filter(q => q.id && !seen.has(q.id));
    const wrongSeen   = rawPool.filter(q => q.id && seen.has(q.id) && wrong.has(q.id));
    const correctSeen = rawPool.filter(q => q.id && seen.has(q.id) && !wrong.has(q.id));
    const noId        = rawPool.filter(q => !q.id);
    [unseen, wrongSeen, correctSeen, noId].forEach(shuffleArray);
    const ordered = [...unseen, ...wrongSeen, ...correctSeen, ...noId];

    // Difficulty-aware interleaving: target ~20% easy, 65% medium, 15% hard
    // Only apply when pool is large enough and count is specified
    if (!count || count < 10 || ordered.length < count) return ordered;
    const easy   = ordered.filter(q => q.difficulty === 'easy');
    const medium = ordered.filter(q => q.difficulty === 'medium');
    const hard   = ordered.filter(q => q.difficulty === 'hard');
    const noTagQ = ordered.filter(q => !q.difficulty);

    // Build interleaved sequence: pattern E,M,M,M,H per 5 (roughly 20/60/20)
    const result = [];
    let ei = 0, mi = 0, hi = 0, ni = 0;
    const pattern = ['medium','medium','medium','easy','hard'];
    let pi = 0;
    while (result.length < count) {
      const slot = pattern[pi % pattern.length];
      pi++;
      if      (slot === 'easy'   && ei < easy.length)   result.push(easy[ei++]);
      else if (slot === 'hard'   && hi < hard.length)   result.push(hard[hi++]);
      else if (slot === 'medium' && mi < medium.length) result.push(medium[mi++]);
      else if (ni < noTagQ.length)                      result.push(noTagQ[ni++]);
      else if (mi < medium.length) result.push(medium[mi++]);
      else if (ei < easy.length)   result.push(easy[ei++]);
      else if (hi < hard.length)   result.push(hard[hi++]);
      else break;
    }
    return result;
  }

  function updateProgress(correct, total) {
    const cur = getProgress();
    const newTotal   = (cur.totalAnswered || 0) + total;
    const newCorrect = (cur.totalCorrect  || 0) + correct;
    saveProgress({
      totalAnswered:  newTotal,
      totalCorrect:   newCorrect,
      testsCompleted: (cur.testsCompleted || 0) + 1,
      accuracy:       newTotal > 0 ? Math.round(newCorrect / newTotal * 100) : 0
    });
    renderHomeDashboard();
  }

  // ─── Vocabulary Page ───
  // ─── Vocab status filter state ───
  let vocabStatusFilter = 'all';

  function setupVocabPage() {
    const categories = ['All', ...new Set(DB.vocab.map(v => v.category))].sort((a,b) => a === 'All' ? -1 : a.localeCompare(b));
    const filterBar  = document.getElementById('vocab-filters');
    filterBar.innerHTML = categories.map(c =>
      `<button class="filter-btn ${c==='All'?'active':''}" data-cat="${c}">${c}</button>`
    ).join('');
    filterBar.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#vocab-filters .filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        vocabFilter = btn.dataset.cat;
        renderVocabGrid();
      });
    });
    document.getElementById('vocab-search').addEventListener('input', renderVocabGrid);

    // Status filter buttons
    document.querySelectorAll('.dict-status-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.dict-status-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        vocabStatusFilter = btn.dataset.status;
        renderVocabGrid();
      });
    });

    // flashcard button is handled by SRS version in init()
    renderVocabGrid();
    updateDictHeroStats();
  }

  function updateDictHeroStats() {
    const prog = getProgress();
    const knownIds  = new Set(prog.fcKnown_ids  || []);
    const reviewIds = new Set(prog.fcReview_ids || []);
    const seenIds   = new Set(prog.vocabSeen_ids || []);
    const total     = DB.vocab.length;
    const known  = DB.vocab.filter(v => knownIds.has(v.id)).length;
    const review = DB.vocab.filter(v => reviewIds.has(v.id) && !knownIds.has(v.id)).length;
    const unseen = total - seenIds.size;
    document.getElementById('dict-stat-known-num').textContent  = known;
    document.getElementById('dict-stat-review-num').textContent = review;
    document.getElementById('dict-stat-new-num').textContent    = Math.max(0, unseen);
  }

  // ─── Flashcard State ───
  let fcDeck = [], fcIndex = 0, fcFlipped = false;
  let fcKnown = 0, fcReview = 0, fcSkip = 0;

  function openFlashcard() {
    // Build deck from current filter + search (what user sees in grid)
    const search   = (document.getElementById('vocab-search')?.value || '').toLowerCase();
    fcDeck = DB.vocab.filter(v => {
      const matchCat    = vocabFilter === 'All' || v.category === vocabFilter;
      const matchSearch = !search || v.word.toLowerCase().includes(search) || v.meaning.toLowerCase().includes(search);
      return matchCat && matchSearch;
    });
    if (fcDeck.length === 0) { showToast('Không có từ nào để luyện.', '⚠️'); return; }
    shuffleArray(fcDeck);
    fcIndex = 0; fcKnown = 0; fcReview = 0; fcSkip = 0; fcFlipped = false;

    const overlay = document.getElementById('flashcard-overlay');
    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    renderFcCard();
  }

  function closeFlashcard() {
    const overlay = document.getElementById('flashcard-overlay');
    overlay.style.display = 'none';
    document.body.style.overflow = '';
    // If deck finished, show summary toast
    if (fcIndex >= fcDeck.length && fcDeck.length > 0) {
      showToast(`✅ Xong! Biết: ${fcKnown} · Cần ôn: ${fcReview} · Bỏ qua: ${fcSkip}`, '🃏');
    }
  }

  function renderFcCard() {
    if (fcIndex >= fcDeck.length) { showFcComplete(); return; }
    const v = fcDeck[fcIndex];
    fcFlipped = false;

    // Reset flip
    const inner = document.getElementById('fc-inner');
    if (inner) inner.classList.remove('flipped');
    const actions = document.getElementById('fc-actions');
    if (actions) actions.style.display = 'none';

    // Populate
    document.getElementById('fc-word').textContent     = v.word;
    document.getElementById('fc-phonetic').textContent = v.phonetic;
    document.getElementById('fc-type').textContent     = v.type.toUpperCase();
    document.getElementById('fc-meaning').textContent  = v.meaning;
    document.getElementById('fc-example').textContent  = '"' + v.example + '"';
    document.getElementById('fc-category-label').textContent = v.category;

    // Progress
    const pct = Math.round(fcIndex / fcDeck.length * 100);
    document.getElementById('fc-progress-bar').style.width = pct + '%';
    document.getElementById('fc-progress-text').textContent = `${fcIndex + 1} / ${fcDeck.length}`;
    updateFcStats();
  }

  function flipCard() {
    if (fcFlipped) return;
    fcFlipped = true;
    const inner   = document.getElementById('fc-inner');
    const actions = document.getElementById('fc-actions');
    if (inner) inner.classList.add('flipped');
    if (actions) {
      // Inject the correct rating buttons at flip time (works for both SRS and legacy mode)
      actions.innerHTML = `
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px">
          <button class="btn" style="background:rgba(244,63,94,.18);border:1px solid var(--danger);color:var(--danger);font-size:.8rem" onclick="App.rateCardSRS('wrong')">😓 Chưa nhớ</button>
          <button class="btn" style="background:rgba(79,142,247,.15);border:1px solid var(--accent);color:var(--accent);font-size:.8rem" onclick="App.rateCardSRS('right')">👍 Nhớ rồi</button>
          <button class="btn" style="background:rgba(16,185,129,.12);border:1px solid var(--success);color:var(--success);font-size:.8rem" onclick="App.rateCardSRS('easy')">⚡ Dễ quá!</button>
        </div>
        <button class="btn btn-outline btn-sm" onclick="App.skipCard()" style="width:100%;margin-top:10px;font-size:.8rem;color:var(--text-muted)">Bỏ qua →</button>`;
      actions.style.display = 'block';
    }
    // Mark vocab as seen
    const v = fcDeck[fcIndex];
    if (v) {
      const prog = getProgress();
      const seen = new Set(prog.vocabSeen_ids || []);
      seen.add(v.id);
      saveProgress({ vocabSeen: seen.size, vocabSeen_ids: [...seen] });
      const statEl = document.getElementById('stat-vocab');
      if (statEl) statEl.textContent = seen.size;
    }
  }

  function rateCard(rating) {
    const v = fcDeck[fcIndex];
    if (!v) return;
    if (rating === 'right') {
      fcKnown++;
      // Save to localStorage as "known"
      const prog = getProgress();
      const known = new Set(prog.fcKnown_ids || []);
      known.add(v.id);
      saveProgress({ fcKnown_ids: [...known] });
    } else {
      fcReview++;
      const prog = getProgress();
      const review = new Set(prog.fcReview_ids || []);
      review.add(v.id);
      saveProgress({ fcReview_ids: [...review] });
    }
    updateFcStats();
    fcIndex++;
    setTimeout(renderFcCardSRS, 180);
  }

  function skipCard() {
    fcSkip++;
    updateFcStats();
    fcIndex++;
    setTimeout(renderFcCardSRS, 100);
  }

  function updateFcStats() {
    const k = document.getElementById('fc-known-count');
    const r = document.getElementById('fc-review-count');
    const s = document.getElementById('fc-skip-count');
    if (k) k.textContent = fcKnown;
    if (r) r.textContent = fcReview;
    if (s) s.textContent = fcSkip;
  }

  function showFcComplete() {
    const inner = document.getElementById('fc-inner');
    if (inner) inner.innerHTML = `
      <div class="fc-front" style="cursor:default">
        <div style="font-size:2.8rem;margin-bottom:8px">🎉</div>
        <div style="font-size:1.3rem;font-weight:800;color:var(--text-primary);margin-bottom:16px">Hoàn thành bộ từ!</div>
        <div style="display:flex;gap:20px;justify-content:center;font-size:0.9rem">
          <span style="color:var(--success)">✓ ${fcKnown} biết</span>
          <span style="color:var(--warning)">🔄 ${fcReview} cần ôn</span>
          <span style="color:var(--text-muted)">— ${fcSkip} bỏ qua</span>
        </div>
        ${fcReview > 0 ? `<button class="btn btn-primary btn-sm" style="margin-top:20px" onclick="App.restartReviewCards()">🔄 Ôn lại ${fcReview} từ cần ôn</button>` : ''}
        <button class="btn btn-outline btn-sm" style="margin-top:${fcReview>0?'10px':'20px'}" onclick="App.closeFlashcard()">Đóng</button>
      </div>`;
    document.getElementById('fc-progress-bar').style.width = '100%';
    const actions = document.getElementById('fc-actions');
    if (actions) actions.style.display = 'none';
  }

  function restartReviewCards() {
    const prog = getProgress();
    const reviewIds = new Set(prog.fcReview_ids || []);
    fcDeck = DB.vocab.filter(v => reviewIds.has(v.id));
    if (fcDeck.length === 0) { closeFlashcard(); return; }
    shuffleArray(fcDeck);
    fcIndex = 0; fcKnown = 0; fcReview = 0; fcSkip = 0; fcFlipped = false;
    // Reset card HTML in case it was replaced with complete screen
    const inner = document.getElementById('fc-inner');
    if (inner) inner.innerHTML = `
      <div class="fc-front">
        <div id="fc-word" class="fc-word"></div>
        <div id="fc-phonetic" class="fc-phonetic"></div>
        <div id="fc-type" class="fc-type-tag"></div>
        <div class="fc-hint">Nhấn để xem nghĩa</div>
      </div>
      <div class="fc-back">
        <div id="fc-meaning" class="fc-meaning"></div>
        <div id="fc-example" class="fc-example"></div>
      </div>`;
    // Clear saved review list for fresh start
    saveProgress({ fcReview_ids: [] });
    renderFcCardSRS();
    showToast(`Ôn lại ${fcDeck.length} từ cần ôn`, '🔄');
  }

  function renderVocabGrid() {
    const search   = (document.getElementById('vocab-search')?.value || '').toLowerCase();
    const prog     = getProgress();
    const knownIds  = new Set(prog.fcKnown_ids  || []);
    const reviewIds = new Set(prog.fcReview_ids || []);
    const seenIds   = new Set(prog.vocabSeen_ids || []);

    let filtered = DB.vocab.filter(v => {
      const matchCat    = vocabFilter === 'All' || v.category === vocabFilter;
      const matchSearch = !search || v.word.toLowerCase().includes(search) || v.meaning.toLowerCase().includes(search);
      if (!matchCat || !matchSearch) return false;
      if (vocabStatusFilter === 'known')  return knownIds.has(v.id);
      if (vocabStatusFilter === 'review') return reviewIds.has(v.id) && !knownIds.has(v.id);
      if (vocabStatusFilter === 'new')    return !seenIds.has(v.id);
      return true;
    });

    const grid = document.getElementById('vocab-grid');
    if (filtered.length === 0) {
      grid.innerHTML = `<div class="dict-empty">Không tìm thấy từ nào phù hợp.</div>`;
      document.getElementById('vocab-count').textContent = '0 từ';
      return;
    }
    document.getElementById('vocab-count').textContent = `${filtered.length} từ`;

    // Highlight search term in word/meaning
    function hl(str) {
      if (!search) return str;
      return str.replace(new RegExp(`(${search.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')})`, 'gi'),
        '<mark class="dict-hl">$1</mark>');
    }

    grid.innerHTML = filtered.map(v => {
      const isKnown  = knownIds.has(v.id);
      const isReview = reviewIds.has(v.id) && !isKnown;
      const isNew    = !seenIds.has(v.id);
      let statusBadge = '';
      if (isKnown)       statusBadge = '<span class="dict-status-badge dict-badge-known">✅ Đã thuộc</span>';
      else if (isReview) statusBadge = '<span class="dict-status-badge dict-badge-review">🔄 Cần ôn</span>';
      else if (isNew)    statusBadge = '<span class="dict-status-badge dict-badge-new">🆕 Mới</span>';

      return `
        <div class="dict-entry ${isKnown?'dict-entry-known':isReview?'dict-entry-review':''}" onclick="App.showVocabDetail(${v.id})">
          <div class="dict-entry-left">
            <div class="dict-entry-word">${hl(v.word)}</div>
            <div class="dict-entry-meta">
              <span class="dict-phonetic">${v.phonetic}</span>
              <span class="dict-type-tag">${v.type}</span>
              ${statusBadge}
            </div>
          </div>
          <div class="dict-entry-right">
            <div class="dict-entry-meaning">${hl(v.meaning)}</div>
            <div class="dict-entry-example">${v.example}</div>
          </div>
          <div class="dict-entry-cat"><span class="badge badge-blue">${v.category}</span></div>
          <button class="dict-speak-btn" title="Phát âm" onclick="event.stopPropagation();window.speechSynthesis&&window.speechSynthesis.speak(Object.assign(new SpeechSynthesisUtterance('${v.word.replace(/'/g,"\\'")}'),{lang:'en-US',rate:0.9}))">🔊</button>
        </div>`;
    }).join('');
  }

  function showVocabDetail(id) {
    const v = DB.vocab.find(x => x.id === id);
    if (!v) return;
    showModal(`
      <div style="text-align:center;padding:8px 0;">
        <div style="font-size:2rem;font-weight:900;color:var(--text-primary)">${v.word}</div>
        <div style="font-family:'JetBrains Mono',monospace;color:var(--accent-3);margin:6px 0">${v.phonetic}</div>
        <div style="color:var(--accent-2);font-weight:700;text-transform:uppercase;font-size:0.78rem">${v.type}</div>
      </div>
      <hr style="border-color:var(--border);margin:16px 0">
      <div style="margin-bottom:10px"><b style="color:var(--text-secondary);font-size:0.8rem;">NGHĨA TIẾNG VIỆT</b><br><span style="font-size:1.05rem">${v.meaning}</span></div>
      <div style="margin-bottom:10px"><b style="color:var(--text-secondary);font-size:0.8rem;">VÍ DỤ</b><br><span style="color:var(--text-secondary);font-style:italic">${v.example}</span></div>
      <div style="margin-bottom:10px"><b style="color:var(--text-secondary);font-size:0.8rem;">NHÓM TỪ</b><br><span class="badge badge-blue">${v.category}</span></div>
    `, v.word);
    const prog = getProgress();
    const seen = new Set(prog.vocabSeen_ids || []);
    seen.add(id);
    saveProgress({ vocabSeen: seen.size, vocabSeen_ids: [...seen] });
    document.getElementById('stat-vocab').textContent = seen.size;
  }

  // ─── Word of the Day ───
  function renderWordOfTheDay() {
    if (!DB.vocab || DB.vocab.length === 0) return;
    // Seed by date so it changes daily but is consistent within a day
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth()+1) * 100 + today.getDate();
    const idx = seed % DB.vocab.length;
    const v = DB.vocab[idx];
    const el = id => document.getElementById(id);
    if (!el('wotd-word')) return;
    el('wotd-word').textContent    = v.word;
    el('wotd-phonetic').textContent = v.phonetic;
    el('wotd-type').textContent    = v.type.toUpperCase();
    el('wotd-meaning').textContent  = v.meaning;
    el('wotd-example').textContent  = '"' + v.example + '"';
    // Mark as seen
    const prog = getProgress();
    const seen = new Set(prog.vocabSeen_ids || []);
    seen.add(v.id);
    saveProgress({ vocabSeen: seen.size, vocabSeen_ids: [...seen] });
  }

  // ─── Vocab Quiz (4-choice, TOEIC-style: chọn nghĩa đúng của từ) ───
  let vqDeck = [], vqIndex = 0, vqCorrect = 0, vqWrong = 0, vqStreak = 0;

  function getVocabDeck() {
    const search = (document.getElementById('vocab-search')?.value || '').toLowerCase();
    let pool = DB.vocab.filter(v => {
      const matchCat = vocabFilter === 'All' || v.category === vocabFilter;
      const matchSearch = !search || v.word.toLowerCase().includes(search) || v.meaning.toLowerCase().includes(search);
      return matchCat && matchSearch;
    });
    if (pool.length < 4) pool = DB.vocab; // fallback to full list if filter too narrow
    return pool;
  }

  function openVocabQuiz() {
    const pool = getVocabDeck();
    if (pool.length < 4) { showToast('Cần ít nhất 4 từ để chơi Quiz.', '⚠️'); return; }
    vqDeck = shuffleArray([...pool]);
    vqIndex = 0; vqCorrect = 0; vqWrong = 0; vqStreak = 0;
    document.getElementById('vquiz-overlay').style.display = 'flex';
    document.body.style.overflow = 'hidden';
    renderVqCard();
  }

  function closeVocabQuiz() {
    document.getElementById('vquiz-overlay').style.display = 'none';
    document.body.style.overflow = '';
    if (vqCorrect + vqWrong > 0) showToast(`Quiz: ${vqCorrect} đúng · ${vqWrong} sai · Streak tốt nhất`, '❓');
  }

  function renderVqCard() {
    if (vqIndex >= vqDeck.length) {
      // Restart shuffled
      vqDeck = shuffleArray([...vqDeck]);
      vqIndex = 0;
    }
    const v = vqDeck[vqIndex];
    const pool = vqDeck;

    // 4 options: 1 correct + 3 random distractors from same category if possible, else random
    let distractors = pool.filter(x => x.id !== v.id && x.category === v.category);
    if (distractors.length < 3) distractors = pool.filter(x => x.id !== v.id);
    shuffleArray(distractors);
    const wrongOpts = distractors.slice(0, 3).map(x => x.meaning);
    const allOpts = shuffleArray([v.meaning, ...wrongOpts]);
    const correctIdx = allOpts.indexOf(v.meaning);

    // Update header
    document.getElementById('vq-category').textContent = v.category;
    document.getElementById('vq-progress').textContent = `${vqIndex + 1} / ${vqDeck.length}`;
    const pct = Math.round(vqIndex / vqDeck.length * 100);
    document.getElementById('vq-progress-bar').style.width = pct + '%';

    // Card content
    document.getElementById('vq-word').textContent     = v.word;
    document.getElementById('vq-phonetic').textContent = v.phonetic;
    document.getElementById('vq-type').textContent     = v.type.toUpperCase();

    const letters = ['A','B','C','D'];
    document.getElementById('vq-options').innerHTML = allOpts.map((opt, i) =>
      `<button class="vquiz-opt" onclick="App.vqSelect(${i},${correctIdx})">
         <span class="opt-letter">${letters[i]}</span><span>${opt}</span>
       </button>`
    ).join('');

    document.getElementById('vq-result-box').style.display  = 'none';
    document.getElementById('vq-example-box').style.display = 'none';
    document.getElementById('vq-next-wrap').style.display   = 'none';
    updateVqStats();

    // Mark seen
    const prog = getProgress();
    const seen = new Set(prog.vocabSeen_ids || []);
    seen.add(v.id);
    saveProgress({ vocabSeen: seen.size, vocabSeen_ids: [...seen] });
    document.getElementById('stat-vocab').textContent = seen.size;
  }

  function vqSelect(chosen, correct) {
    const opts = document.querySelectorAll('#vq-options .vquiz-opt');
    opts.forEach(btn => btn.disabled = true);
    const v = vqDeck[vqIndex];
    const isRight = chosen === correct;
    opts[chosen].classList.add(isRight ? 'opt-correct' : 'opt-wrong');
    if (!isRight) opts[correct].classList.add('opt-correct');

    if (isRight) { vqCorrect++; vqStreak++; } else { vqWrong++; vqStreak = 0; }

    const rb = document.getElementById('vq-result-box');
    rb.className = 'vquiz-result-box ' + (isRight ? 'result-correct' : 'result-wrong');
    rb.innerHTML = isRight
      ? `✅ <strong>Chính xác!</strong> <em>${v.word}</em> = ${v.meaning}`
      : `❌ <strong>Chưa đúng.</strong> Đáp án: <strong style="color:var(--success)">${v.meaning}</strong>`;
    rb.style.display = 'block';

    const eb = document.getElementById('vq-example-box');
    eb.innerHTML = `📝 <em>"${v.example}"</em>`;
    eb.style.display = 'block';

    document.getElementById('vq-next-wrap').style.display = 'block';
    updateVqStats();

    // Save to fcReview if wrong
    if (!isRight) {
      const prog = getProgress();
      const review = new Set(prog.fcReview_ids || []);
      review.add(v.id);
      saveProgress({ fcReview_ids: [...review] });
    }
  }

  function vqNext() {
    vqIndex++;
    renderVqCard();
  }

  function updateVqStats() {
    const c = document.getElementById('vq-correct');
    const w = document.getElementById('vq-wrong');
    const s = document.getElementById('vq-streak');
    if (c) c.textContent = vqCorrect;
    if (w) w.textContent = vqWrong;
    if (s) s.textContent = vqStreak;
  }

  // ─── Vocab Fill-in-the-Blank (TOEIC Part 5 cảm giác: câu ví dụ, chọn từ đúng) ───
  let vfDeck = [], vfIndex = 0, vfCorrect = 0, vfWrong = 0;

  function openVocabFill() {
    const pool = getVocabDeck().filter(v => v.example && v.example.includes(v.word));
    if (pool.length < 4) { showToast('Không đủ câu ví dụ cho chế độ này.', '⚠️'); return; }
    vfDeck = shuffleArray([...pool]);
    vfIndex = 0; vfCorrect = 0; vfWrong = 0;
    document.getElementById('vfill-overlay').style.display = 'flex';
    document.body.style.overflow = 'hidden';
    renderVfCard();
  }

  function closeVocabFill() {
    document.getElementById('vfill-overlay').style.display = 'none';
    document.body.style.overflow = '';
    if (vfCorrect + vfWrong > 0) showToast(`Điền từ: ${vfCorrect} đúng · ${vfWrong} sai`, '✏️');
  }

  function renderVfCard() {
    if (vfIndex >= vfDeck.length) {
      vfDeck = shuffleArray([...vfDeck]);
      vfIndex = 0;
    }
    const v = vfDeck[vfIndex];
    // Replace target word with blank in the example sentence
    const regex = new RegExp(v.word.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i');
    const blankedSentence = v.example.replace(regex,
      `<span class="vfill-blank">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>`);

    // Build 4 options: the correct word + 3 distractors from same category
    let distractors = vfDeck.filter(x => x.id !== v.id && x.category === v.category);
    if (distractors.length < 3) distractors = vfDeck.filter(x => x.id !== v.id);
    shuffleArray(distractors);
    const wrongOpts = distractors.slice(0, 3).map(x => x.word);
    const allOpts = shuffleArray([v.word, ...wrongOpts]);
    const correctIdx = allOpts.indexOf(v.word);

    document.getElementById('vf-category').textContent  = v.category;
    document.getElementById('vf-progress').textContent  = `${vfIndex + 1} / ${vfDeck.length}`;
    document.getElementById('vf-progress-bar').style.width = Math.round(vfIndex / vfDeck.length * 100) + '%';
    document.getElementById('vf-sentence').innerHTML    = blankedSentence;
    document.getElementById('vf-phonetic-hint').textContent = v.phonetic + ' [' + v.type + ']';
    document.getElementById('vf-result-box').style.display  = 'none';
    document.getElementById('vf-next-wrap').style.display   = 'none';

    const letters = ['A','B','C','D'];
    document.getElementById('vf-options').innerHTML = allOpts.map((opt, i) =>
      `<button class="vquiz-opt" onclick="App.vfSelect(${i},${correctIdx})">
         <span class="opt-letter">${letters[i]}</span><span>${opt}</span>
       </button>`
    ).join('');
    document.getElementById('vf-correct').textContent = vfCorrect;
    document.getElementById('vf-wrong').textContent   = vfWrong;

    // Mark seen
    const prog = getProgress();
    const seen = new Set(prog.vocabSeen_ids || []);
    seen.add(v.id);
    saveProgress({ vocabSeen: seen.size, vocabSeen_ids: [...seen] });
    document.getElementById('stat-vocab').textContent = seen.size;
  }

  function vfSelect(chosen, correct) {
    const opts = document.querySelectorAll('#vf-options .vquiz-opt');
    opts.forEach(btn => btn.disabled = true);
    const v = vfDeck[vfIndex];
    const isRight = chosen === correct;
    opts[chosen].classList.add(isRight ? 'opt-correct' : 'opt-wrong');
    if (!isRight) opts[correct].classList.add('opt-correct');

    if (isRight) { vfCorrect++; } else { vfWrong++; }

    // Reveal full sentence with answer filled in
    document.getElementById('vf-sentence').innerHTML =
      v.example.replace(new RegExp(v.word.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i'),
        `<strong style="color:${isRight ? 'var(--success)' : 'var(--danger)'}; font-style:normal;">${v.word}</strong>`);

    const rb = document.getElementById('vf-result-box');
    rb.className = 'vquiz-result-box ' + (isRight ? 'result-correct' : 'result-wrong');
    rb.innerHTML = isRight
      ? `✅ <strong>Đúng!</strong> ${v.word} — ${v.meaning}`
      : `❌ <strong>Chưa đúng.</strong> Từ cần điền: <strong style="color:var(--success)">${v.word}</strong> (${v.meaning})`;
    rb.style.display = 'block';
    document.getElementById('vf-next-wrap').style.display = 'block';
    document.getElementById('vf-correct').textContent = vfCorrect;
    document.getElementById('vf-wrong').textContent   = vfWrong;

    if (!isRight) {
      const prog = getProgress();
      const review = new Set(prog.fcReview_ids || []);
      review.add(v.id);
      saveProgress({ fcReview_ids: [...review] });
    }
  }

  function vfNext() {
    vfIndex++;
    renderVfCard();
  }

  // ─── Vocab Matching Game (ghép cặp từ ↔ nghĩa) ───
  let vmPool = [], vmPairs = [], vmSelectedLeft = null, vmSelectedRight = null;
  let vmMatched = 0, vmErrors = 0, vmRound = 0, vmTotalPairs = 0;
  const VM_PAIRS_PER_ROUND = 6;

  function openVocabMatch() {
    vmPool = shuffleArray([...getVocabDeck()]);
    vmRound = 0; vmMatched = 0; vmErrors = 0;
    document.getElementById('vmatch-overlay').style.display = 'flex';
    document.body.style.overflow = 'hidden';
    vmNewRound();
  }

  function closeVocabMatch() {
    document.getElementById('vmatch-overlay').style.display = 'none';
    document.body.style.overflow = '';
    if (vmMatched > 0) showToast(`Ghép cặp: ${vmMatched} cặp đúng · ${vmErrors} lỗi`, '🔗');
  }

  function vmNewRound() {
    vmRound++;
    const startIdx = ((vmRound - 1) * VM_PAIRS_PER_ROUND) % vmPool.length;
    vmPairs = [];
    for (let i = 0; i < VM_PAIRS_PER_ROUND; i++) {
      vmPairs.push(vmPool[(startIdx + i) % vmPool.length]);
    }
    vmSelectedLeft = null; vmSelectedRight = null;
    vmTotalPairs = vmPairs.length;

    document.getElementById('vm-round').textContent   = `Vòng ${vmRound}`;
    document.getElementById('vm-matched').textContent = vmMatched;
    document.getElementById('vm-total-pairs').textContent = vmTotalPairs * vmRound - vmTotalPairs + vmTotalPairs;
    document.getElementById('vm-errors').textContent  = vmErrors;
    document.getElementById('vm-result').style.display  = 'none';
    document.getElementById('vm-stats-row').style.display = 'flex';

    const leftWords   = shuffleArray(vmPairs.map((v, i) => ({ id: i, text: v.word,    side: 'left'  })));
    const rightMeanings = shuffleArray(vmPairs.map((v, i) => ({ id: i, text: v.meaning, side: 'right' })));

    // Mark vocab seen
    const prog = getProgress();
    const seen = new Set(prog.vocabSeen_ids || []);
    vmPairs.forEach(v => seen.add(v.id));
    saveProgress({ vocabSeen: seen.size, vocabSeen_ids: [...seen] });
    document.getElementById('stat-vocab').textContent = seen.size;

    const board = document.getElementById('vm-board');
    board.innerHTML = `
      <div class="vmatch-col" id="vm-col-left">
        ${leftWords.map(item =>
          `<div class="vmatch-tile" data-id="${item.id}" data-side="left" onclick="App.vmTileClick(this)">${item.text}</div>`
        ).join('')}
      </div>
      <div class="vmatch-col" id="vm-col-right">
        ${rightMeanings.map(item =>
          `<div class="vmatch-tile" data-id="${item.id}" data-side="right" onclick="App.vmTileClick(this)">${item.text}</div>`
        ).join('')}
      </div>`;
  }

  function vmTileClick(tile) {
    if (tile.classList.contains('matched')) return;
    const side = tile.dataset.side;
    const id   = parseInt(tile.dataset.id);

    if (side === 'left') {
      // Deselect previous left selection
      document.querySelectorAll('#vm-col-left .vmatch-tile.selected').forEach(t => t.classList.remove('selected'));
      tile.classList.add('selected');
      vmSelectedLeft = id;
    } else {
      document.querySelectorAll('#vm-col-right .vmatch-tile.selected').forEach(t => t.classList.remove('selected'));
      tile.classList.add('selected');
      vmSelectedRight = id;
    }

    if (vmSelectedLeft !== null && vmSelectedRight !== null) {
      if (vmSelectedLeft === vmSelectedRight) {
        // Correct match
        vmMatched++;
        const lTile = document.querySelector(`#vm-col-left .vmatch-tile[data-id="${vmSelectedLeft}"]`);
        const rTile = document.querySelector(`#vm-col-right .vmatch-tile[data-id="${vmSelectedRight}"]`);
        if (lTile) { lTile.classList.remove('selected'); lTile.classList.add('matched'); }
        if (rTile) { rTile.classList.remove('selected'); rTile.classList.add('matched'); }
        vmSelectedLeft = null; vmSelectedRight = null;
        document.getElementById('vm-matched').textContent = vmMatched;

        // Check if round complete
        const remaining = document.querySelectorAll('#vm-board .vmatch-tile:not(.matched)').length;
        if (remaining === 0) {
          setTimeout(() => {
            document.getElementById('vm-result').style.display = 'block';
            document.getElementById('vm-stats-row').style.display = 'none';
            document.getElementById('vm-score-msg').textContent =
              `${vmMatched} cặp đúng · ${vmErrors} lỗi · Tiếp tục vòng ${vmRound + 1}?`;
          }, 400);
        }
      } else {
        // Wrong
        vmErrors++;
        document.getElementById('vm-errors').textContent = vmErrors;
        const lTile = document.querySelector(`#vm-col-left .vmatch-tile[data-id="${vmSelectedLeft}"]`);
        const rTile = document.querySelector(`#vm-col-right .vmatch-tile[data-id="${vmSelectedRight}"]`);
        if (lTile) lTile.classList.add('error-flash');
        if (rTile) rTile.classList.add('error-flash');
        setTimeout(() => {
          if (lTile) { lTile.classList.remove('error-flash', 'selected'); }
          if (rTile) { rTile.classList.remove('error-flash', 'selected'); }
        }, 350);
        vmSelectedLeft = null; vmSelectedRight = null;
      }
    }
  }

  // ─── Grammar Stats (localStorage) ───
  const GRAMMAR_STATS_KEY = 'toeic_grammar_stats';

  function getGrammarStats() {
    try { return JSON.parse(localStorage.getItem(GRAMMAR_STATS_KEY) || '{}'); }
    catch { return {}; }
  }

  function saveGrammarDrillResult(typeId, correct, total) {
    const stats = getGrammarStats();
    if (!stats[typeId]) stats[typeId] = { drills: 0, correct: 0, total: 0, lastDrill: null, history: [] };
    stats[typeId].drills++;
    stats[typeId].correct += correct;
    stats[typeId].total   += total;
    stats[typeId].lastDrill = Date.now();
    // Lưu lịch sử 5 lần gần nhất
    stats[typeId].history = [...(stats[typeId].history || []), { correct, total, ts: Date.now() }].slice(-5);
    localStorage.setItem(GRAMMAR_STATS_KEY, JSON.stringify(stats));
  }

  function getGrammarMasteryLevel(typeId) {
    const stats = getGrammarStats();
    const s = stats[typeId];
    if (!s || s.total === 0) return 'new';       // chưa drill lần nào
    const pct = Math.round(s.correct / s.total * 100);
    if (pct >= 80 && s.drills >= 2) return 'mastered';   // 🟢
    if (pct >= 60) return 'learning';                     // 🟡
    return 'weak';                                         // 🔴
  }

  function getDaysSinceLastDrill(typeId) {
    const stats = getGrammarStats();
    const s = stats[typeId];
    if (!s || !s.lastDrill) return null;
    return Math.floor((Date.now() - s.lastDrill) / 864e5);
  }

  // ─── Grammar Page ───
  function setupGrammarPage() {
    _renderGrammarNav();
    renderGrammarContent();
    _renderGrammarSpacedAlert();
  }

  function _renderGrammarNav() {
    const nav = document.getElementById('grammar-nav');
    nav.innerHTML = DB.grammar.map(t => {
      const level = getGrammarMasteryLevel(t.id);
      const badge = level === 'mastered' ? '<span class="gm-badge gm-mastered">✓</span>'
                  : level === 'learning' ? '<span class="gm-badge gm-learning">~</span>'
                  : level === 'weak'     ? '<span class="gm-badge gm-weak">!</span>'
                  : '';
      return `<button class="grammar-topic-btn ${t.id===grammarTopic?'active':''}" data-id="${t.id}">
        ${t.icon} ${t.title}${badge}
      </button>`;
    }).join('');
    nav.querySelectorAll('.grammar-topic-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.grammar-topic-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        grammarTopic = btn.dataset.id;
        renderGrammarContent();
      });
    });
  }

  function _renderGrammarSpacedAlert() {
    // Gợi ý ôn lại các topic đã lâu không drill (>5 ngày) hoặc còn yếu
    const stats = getGrammarStats();
    const overdue = DB.grammar.filter(t => {
      const days = getDaysSinceLastDrill(t.id);
      const level = getGrammarMasteryLevel(t.id);
      return (days !== null && days >= 5 && level !== 'mastered') || level === 'weak';
    }).slice(0, 3);

    const alertEl = document.getElementById('grammar-spaced-alert');
    if (!alertEl) return;
    if (overdue.length === 0) { alertEl.style.display = 'none'; return; }

    alertEl.style.display = 'block';
    alertEl.innerHTML = `
      <div class="grammar-spaced-banner">
        <span class="spaced-icon">🔔</span>
        <div class="spaced-content">
          <strong>Đến lúc ôn lại!</strong>
          <span>${overdue.map(t => `<button class="spaced-topic-btn" onclick="App.goToGrammar('${t.id}')">${t.icon} ${t.title}</button>`).join('')}</span>
        </div>
      </div>`;
  }

  // Kiểm tra có bài Luyện tập chuyển đổi cho topic này không
  function _hasTransformDrill(grammarId) {
    if (typeof TransformDrill === 'undefined') return false;
    const types = TransformDrill.getAvailableTypes();
    return !!(types[grammarId] && types[grammarId] > 0);
  }

  function renderGrammarContent() {
    const topic = DB.grammar.find(t => t.id === grammarTopic);
    const area  = document.getElementById('grammar-content-area');
    if (!topic) { area.innerHTML = ''; return; }
    if (topic.id === 'grammar-reference') { _renderQuickReference(area); return; }
    _renderGrammarContentMain(topic, area);
  }

  // ─── Quick Reference – Interactive lookup ────────────────────
  function _renderQuickReference(area) {
    // ── Data: tất cả rule cards ───────────────────────────────
    const QR_CARDS = [
      // ── TENSES ─────────────────────────────────────────────
      { group:'⏱️ Thì động từ', id:'verb-tense', title:'Present Simple', keywords:'always usually every schedule routine habit',
        formula:'S + V(s/es)', vi:'Thói quen, sự thật, lịch trình cố định',
        keys:'always, usually, often, every, generally, on Monday',
        example:'The store opens at 9 a.m. every day.' },
      { group:'⏱️ Thì động từ', id:'verb-tense', title:'Present Continuous', keywords:'right now currently at the moment',
        formula:'S + am/is/are + V-ing', vi:'Đang xảy ra; kế hoạch sắp tới',
        keys:'right now, at the moment, currently, this week',
        example:'We are launching the product next month.' },
      { group:'⏱️ Thì động từ', id:'verb-tense', title:'Present Perfect', keywords:'since for already yet recently just to date',
        formula:'S + have/has + V3', vi:'Hành động có liên quan đến hiện tại; kinh nghiệm',
        keys:'since, for, already, yet, recently, just, so far, to date',
        example:'The team has completed three projects this year.' },
      { group:'⏱️ Thì động từ', id:'verb-tense', title:'Past Simple', keywords:'yesterday last ago in 2020',
        formula:'S + V2/ed', vi:'Hành động đã hoàn tất ở thời điểm xác định',
        keys:'yesterday, last week, ago, in [year], at that time',
        example:'The company launched the product in March 2023.' },
      { group:'⏱️ Thì động þừ', id:'verb-tense', title:'Past Perfect', keywords:'by the time before after had',
        formula:'S + had + V3', vi:'Xảy ra TRƯỚC hành động quá khứ khác',
        keys:'by the time [past], before, after, already (in past)',
        example:'She had reviewed all documents before the meeting started.' },
      { group:'⏱️ Thì động từ', id:'verb-tense', title:'Future Perfect ⭐', keywords:'by the time will have future',
        formula:'S + will have + V3', vi:'Hoàn tất TRƯỚC mốc tương lai',
        keys:'by [future time], by the time + present simple',
        example:'By Friday, the team will have completed the report.',
        trap:'By the time + present → Future Perfect (không dùng will trong mệnh đề thời gian)' },
      // ── PASSIVE ─────────────────────────────────────────────
      { group:'🔄 Câu bị động', id:'passive', title:'Bị động theo thì', keywords:'passive be v3 is are was were',
        formula:'S + be(chia thì) + V3 [+ by agent]', vi:'Chủ thể nhận tác động',
        keys:'is/are reviewed · was/were submitted · will be processed · has/have been approved · modal + be + V3',
        example:'The contract has been signed by both parties.' },
      { group:'🔄 Câu bị động', id:'passive', title:'Modal + Passive ⭐', keywords:'must should can modal be v3',
        formula:'modal + be + V3', vi:'Yêu cầu/khả năng bị động',
        keys:'must be submitted, should be reviewed, can be accessed',
        example:'All applications must be submitted by Friday.' },
      { group:'🔄 Câu bị động', id:'passive', title:'Participial Adjectives ⚠️', keywords:'interesting interested surprising surprised boring bored',
        formula:'V-ing = gây ra · V3/ed = nhận cảm xúc', vi:'Phân biệt chủ động/bị động',
        keys:'-ing: the news is surprising · -ed: she is surprised',
        example:'The results were surprising. The team felt surprised.',
        trap:'The presentation was interesting / The audience was interested' },
      // ── CONDITIONALS ───────────────────────────────────────
      { group:'🔀 Câu điều kiện', id:'conditionals', title:'Type 0 – Sự thật', keywords:'if present present zero',
        formula:'If + Present, Present', vi:'Quy luật, sự thật hiển nhiên',
        keys:'If/When + present simple, present simple',
        example:'If water reaches 100°C, it boils.' },
      { group:'🔀 Câu điều kiện', id:'conditionals', title:'Type 1 – Có thể xảy ra', keywords:'if present will can may',
        formula:'If + Present, will/can/may + V', vi:'Điều kiện có thể xảy ra',
        keys:'If + present simple, will/can/may + V',
        example:'If you register before Oct 25, you will get the early bird rate.' },
      { group:'🔀 Câu điều kiện', id:'conditionals', title:'Type 2 – Trái hiện tại', keywords:'if past would were type 2',
        formula:'If + Past Simple, would/could + V', vi:'Giả định trái thực tế hiện tại',
        keys:'If + past (were for all subjects), would/could + V',
        example:'If she were available, she would lead the training.',
        trap:'Luôn dùng "were" (không "was") trong Type 2' },
      { group:'🔀 Câu điều kiện', id:'conditionals', title:'Type 3 – Trái quá khứ', keywords:'if had v3 would have past perfect',
        formula:'If + Past Perfect, would have + V3', vi:'Giả định trái thực tế quá khứ',
        keys:'If + had + V3, would/could/might have + V3',
        example:'If the budget had been approved, the launch could have happened earlier.' },
      { group:'🔀 Câu điều kiện', id:'conditionals', title:'Đảo ngữ điều kiện ⭐⭐', keywords:'should were had inversion formal',
        formula:'Should you / Were S to / Had S + V3', vi:'Trang trọng hơn "if"',
        keys:'Should you + V (Type1) · Were S to V (Type2) · Had S V3 (Type3)',
        example:'Should you have any questions, please contact us.',
        trap:'"Should you + V" rất phổ biến trong email TOEIC' },
      // ── WORD FORM ───────────────────────────────────────────
      { group:'🔡 Từ loại', id:'word-form', title:'Vị trí nhận biết từ loại', keywords:'noun verb adjective adverb position',
        formula:'the/a/an → N · after be → adj · modify V → adv', vi:'Nhận dạng từ loại qua vị trí',
        keys:'after the/a/an → noun · before noun → adj · after verb/adj → adv',
        example:'The implementation (N) of the policy was effective (adj). It was effectively (adv) implemented.' },
      { group:'🔡 Từ loại', id:'word-form', title:'Hậu tố nhận dạng ⭐', keywords:'suffix tion ment ness ive ly ous',
        formula:'-tion/-ment/-ness/-ity = N · -ive/-al/-ous/-able = adj · -ly = adv', vi:'Hậu tố = từ loại',
        keys:'-tion: implementation · -ment: management · -ness: effectiveness · -ly: efficiently',
        example:'Efficiency (N) → efficient (adj) → efficiently (adv).' },
      { group:'🔡 Từ loại', id:'word-form', title:'Cặp từ dễ nhầm ⭐⭐', keywords:'economic economical historic historical successful successive',
        formula:'economic ≠ economical · historic ≠ historical', vi:'Sắc thái nghĩa khác nhau',
        keys:'economic (kinh tế) vs economical (tiết kiệm) · successful (thành công) vs successive (liên tiếp)',
        example:'An economical solution saves costs. Three successive quarters of growth.',
        trap:'considerable (đáng kể) vs considerate (chu đáo) · comprehensive (toàn diện) vs comprehensible (hiểu được)' },
      // ── PREPOSITIONS ────────────────────────────────────────
      { group:'📍 Giới từ', id:'prepositions', title:'Giới từ thời gian ⭐', keywords:'at on in by until for since during',
        formula:'at = điểm · on = ngày · in = tháng/năm · by = deadline · until = liên tục',
        vi:'Phân biệt giới từ thời gian',
        keys:'at 9 a.m. · on Monday · in March · by Friday (deadline) · until 5 p.m. (kéo dài)',
        example:'Submit the report by 5 p.m. The office is open until 9 p.m.',
        trap:'"by" = không muộn hơn (deadline) ≠ "until" = liên tục đến tận' },
      { group:'📍 Giới từ', id:'prepositions', title:'Adj + Giới từ cố định ⭐⭐', keywords:'responsible for interested in satisfied with committed to aware of',
        formula:'adj + prep = cụm cố định', vi:'Học thuộc các cụm adj+prep',
        keys:'responsible/eligible FOR · interested/specialized IN · satisfied/familiar WITH · committed/dedicated TO · aware/capable OF',
        example:'She is responsible for the entire project. We are committed to quality.' },
      { group:'📍 Giới từ', id:'prepositions', title:'Cụm giới từ trang trọng ⭐', keywords:'in accordance with on behalf of in lieu of prior to as of',
        formula:'Cụm giới từ = bất biến', vi:'Cụm giới từ hay gặp trong TOEIC',
        keys:'in accordance with · on behalf of · in addition to · prior to · as of [date] · in response to · in terms of',
        example:'On behalf of the team, I thank you. As of January 1st, the policy takes effect.' },
      // ── CONJUNCTIONS ────────────────────────────────────────
      { group:'🔗 Liên từ', id:'conjunction', title:'Nhượng bộ ⚠️', keywords:'although despite despite in spite of even though',
        formula:'although/even though + CLAUSE · despite/in spite of + NOUN', vi:'Tương phản – phân biệt cấu trúc',
        keys:'Although/Even though/While + S+V · Despite/In spite of/Notwithstanding + N/V-ing',
        example:'Although the budget was tight, the team succeeded. Despite the high cost, it was worth it.',
        trap:'"Despite + clause" = SAI. "Despite + noun/V-ing" = ĐÚNG' },
      { group:'🔗 Liên từ', id:'conjunction', title:'Nguyên nhân & Kết quả', keywords:'because due to therefore thus consequently as a result',
        formula:'because + CLAUSE · due to/owing to + NOUN', vi:'Nhân quả – phân biệt cấu trúc',
        keys:'because/since/as + clause · due to/owing to/because of + noun · therefore/thus/consequently + clause',
        example:'Because costs rose, prices increased. Due to cost increases, prices rose.' },
      { group:'🔗 Liên từ', id:'conjunction', title:'Bổ sung & Tương phản', keywords:'furthermore moreover however nevertheless nonetheless',
        formula:'Trạng từ liên kết: ; adverb, CLAUSE', vi:'Dùng sau dấu ; hoặc đầu câu mới',
        keys:'furthermore/moreover/in addition (bổ sung) · however/nevertheless/nonetheless (tương phản)',
        example:'The plan is feasible; furthermore, it is cost-effective. The proposal was strong; however, revisions were needed.' },
      // ── GERUND / INFINITIVE ─────────────────────────────────
      { group:'✏️ Gerund/Infinitive', id:'gerund-infinitive', title:'Động từ + Gerund ⭐', keywords:'enjoy avoid suggest recommend consider postpone delay finish',
        formula:'V + V-ing', vi:'Nhóm động từ đi với gerund',
        keys:'enjoy, avoid, consider, suggest, recommend, postpone, delay, finish, practice, keep, involve, risk, mind',
        example:'The committee recommended reviewing the guidelines.' },
      { group:'✏️ Gerund/Infinitive', id:'gerund-infinitive', title:'Động từ + Infinitive ⭐', keywords:'want plan decide agree refuse manage fail expect need',
        formula:'V + to + V', vi:'Nhóm động từ đi với to-infinitive',
        keys:'want, plan, decide, agree, refuse, manage, fail, expect, arrange, need, hope, tend, promise',
        example:'We plan to open three branches next year.' },
      { group:'✏️ Gerund/Infinitive', id:'gerund-infinitive', title:'Giới từ + Gerund ⭐⭐', keywords:'look forward to in addition to prior to responsible for',
        formula:'Preposition + V-ing (KHÔNG to-V)', vi:'Sau giới từ LUÔN dùng V-ing',
        keys:'look forward to V-ing · prior to V-ing · in addition to V-ing · responsible for V-ing',
        example:'We look forward to hearing from you.',
        trap:'"look forward to + V-ing" — "to" là giới từ, KHÔNG phải to-infinitive!' },
      { group:'✏️ Gerund/Infinitive', id:'gerund-infinitive', title:'Nghĩa KHÁC nhau ⭐⭐', keywords:'remember forget stop try',
        formula:'V + to-V = tương lai · V + V-ing = quá khứ/thực tế', vi:'Cùng động từ, nghĩa khác',
        keys:'remember to V (nhớ sẽ làm) vs remember V-ing (nhớ đã làm) · stop to V (dừng ĐỂ) vs stop V-ing (ngừng) · try to V (cố gắng) vs try V-ing (thử nghiệm)',
        example:'Remember to submit the report. (= chưa nộp, phải nhớ nộp) I remember submitting it. (= đã nộp rồi)',
        trap:'try to V ≠ try V-ing' },
      // ── COMPARISON ──────────────────────────────────────────
      { group:'📊 So sánh', id:'comparison', title:'Comparative & Superlative', keywords:'more than er est most',
        formula:'1 âm tiết: adj-er than · 2+: more adj than · nhất: the most/adj-est', vi:'Quy tắc so sánh',
        keys:'fast→faster→fastest · expensive→more expensive→most expensive · good→better→best · bad→worse→worst',
        example:'This is more comprehensive than the previous version. It is by far the best deal.' },
      { group:'📊 So sánh', id:'comparison', title:'Nhấn mạnh so sánh hơn ⭐', keywords:'much far significantly considerably',
        formula:'much/far/significantly + comparative', vi:'Tăng cường mức độ so sánh',
        keys:'much higher · far more expensive · significantly better · considerably faster',
        example:'Online sales are significantly higher than last year.',
        trap:'KHÔNG dùng "very" trước so sánh hơn. "Very higher" = SAI' },
      { group:'📊 So sánh', id:'comparison', title:'The more...the better ⭐', keywords:'the more the better the higher',
        formula:'The + comparative, the + comparative', vi:'Càng...càng...',
        keys:'The more you practice, the better you get. The sooner we act, the less it will cost.',
        example:'The more data we collect, the better our predictions become.' },
      // ── RELATIVE CLAUSE ─────────────────────────────────────
      { group:'🔍 Mệnh đề quan hệ', id:'relative-clause', title:'Đại từ quan hệ', keywords:'who whom whose which that where when why',
        formula:'who = người chủ · whom = người tân · whose = sở hữu · which = vật · where = nơi · when = thời · why = lý do', vi:'Chọn đại từ quan hệ',
        keys:'who (person, subject) · whom (person, object) · whose (possession) · which (thing) · where (place) · when (time) · why (reason)',
        example:'The manager whose decision surprised everyone approved the budget.' },
      { group:'🔍 Mệnh đề quan hệ', id:'relative-clause', title:'Rút gọn mệnh đề QH ⭐', keywords:'reduce relative clause v-ing v3 past participle',
        formula:'who is V-ing → V-ing · which is V3 → V3', vi:'Rút gọn = bỏ đại từ + be',
        keys:'who is reviewing → reviewing · which was submitted → submitted · who are selected → selected',
        example:'The manager reviewing the proposal is our CFO. The report submitted yesterday was approved.' },
      // ── PRONOUN ─────────────────────────────────────────────
      { group:'🅰️ Đại từ', id:'pronoun', title:'Bảng đại từ đầy đủ', keywords:'he him his himself she her hers herself they them their',
        formula:'subject / object / possessive adj / possessive pron / reflexive', vi:'5 dạng đại từ',
        keys:'I/me/my/mine/myself · he/him/his/his/himself · she/her/her/hers/herself · they/them/their/theirs/themselves',
        example:'The director reviewed the report himself. (reflexive = nhấn mạnh, chính tự làm)' },
      { group:'🅰️ Đại từ', id:'pronoun', title:'Mạo từ ⭐⭐', keywords:'a an the zero article',
        formula:'a/an = lần đầu đề cập · the = đã xác định · ∅ = chung chung', vi:'Quy tắc mạo từ',
        keys:'a/an → the (lần 2) · the + only/same/superlative · the + địa danh số nhiều · ∅ + uncountable chung chung',
        example:'We received a complaint. The complaint was resolved immediately.',
        trap:'"The" trước tính từ đặc định: "the new policy" (đã biết policy nào) vs "a new policy" (chưa xác định)' },
      // ── MODAL ───────────────────────────────────────────────
      { group:'💡 Modals', id:'modal', title:'Phân biệt nghĩa modal ⭐', keywords:'must should may might can could would',
        formula:'must = bắt buộc · should = khuyên · may/might = khả năng · can = khả năng/cho phép', vi:'Chọn modal theo nghĩa',
        keys:'must (obligation) · should (advice) · may/might (possibility) · can/could (ability/permission) · would (hypothetical/polite)',
        example:'All staff must wear ID badges. You should double-check before submitting.' },
      { group:'💡 Modals', id:'modal', title:'Perfect Modals ⭐⭐', keywords:'must have should have might have could have would have',
        formula:'modal + have + V3', vi:'Suy luận/tiếc nuối về quá khứ',
        keys:'must have V3 (chắc chắn đã) · should have V3 (đáng lẽ phải) · could have V3 (có thể đã) · might have V3 (có thể đã - không chắc)',
        example:'She should have confirmed the reservation. The package must have been delivered while we were out.',
        trap:'"Should have + V3" = đáng lẽ phải làm (không làm = tiếc nuối/chỉ trích)' },
      // ── SUBJECT-VERB ────────────────────────────────────────
      { group:'⚖️ Hòa hợp chủ-vị', id:'subject-verb', title:'Các trường hợp đặc biệt ⭐⭐', keywords:'subject verb agreement each every neither either number',
        formula:'Động từ theo CHÍNH (bỏ qua giới từ đi kèm)', vi:'Chủ ngữ phức tạp',
        keys:'The quality of the products HAS · A number of employees HAVE · The number of employees IS · Each/Every + singular + singular verb · Neither A nor B: verb theo B',
        example:'The number of applicants has increased. A number of employees have signed up.',
        trap:'"A number of" (số nhiều) ≠ "The number of" (số ít)' },
      { group:'⚖️ Hòa hợp chủ-vị', id:'subject-verb', title:'Danh từ không đếm được ⭐', keywords:'information advice equipment furniture news',
        formula:'uncountable = số ít (luôn)', vi:'Danh từ không đếm được → động từ số ít',
        keys:'information, advice, equipment, furniture, feedback, software, news, progress, research, evidence',
        example:'The information is confidential. The equipment needs to be calibrated.' },
      // ── NOUN CLAUSES ────────────────────────────────────────
      { group:'📦 Mệnh đề danh từ', id:'noun-clauses', title:'Câu hỏi gián tiếp ⭐⭐', keywords:'indirect question where how when why whether if',
        formula:'Wh + S + V (không đảo ngữ)', vi:'Câu hỏi trực tiếp → gián tiếp',
        keys:'where is → where S is · how does X work → how X works · whether/if (Yes/No question)',
        example:'Can you tell me where the office is? Please explain how the system works.',
        trap:'"Please explain how does it work" = SAI. "How it works" = ĐÚNG' },
      { group:'📦 Mệnh đề danh từ', id:'noun-clauses', title:'It is + adj + that ⭐', keywords:'it is essential important necessary that subjunctive',
        formula:'It is essential/important/necessary + that + S + V nguyên thể', vi:'Chủ ngữ giả + subjunctive',
        keys:'essential, necessary, important, vital, critical, recommended + that + V nguyên thể',
        example:'It is essential that every employee follow the evacuation procedure.',
        trap:'"It is essential that he FOLLOWS" = SAI. "follows" → "follow" (subjunctive)' },
      // ── SUBJUNCTIVE ─────────────────────────────────────────
      { group:'🎯 Subjunctive', id:'subjunctive', title:'Sau suggest/recommend/insist ⭐⭐', keywords:'suggest recommend insist require demand propose subjunctive',
        formula:'V + that + S + V nguyên thể (không chia -s)', vi:'Subjunctive sau nhóm động từ yêu cầu/đề xuất',
        keys:'suggest, recommend, insist, require, demand, propose, mandate, stipulate + that + V base form',
        example:'The board recommended that we launch in Southeast Asia. The auditor insisted that the report be revised.',
        trap:'"Insisted that he submits" = SAI. "submit" (không -s, không -ed)' },
      { group:'🎯 Subjunctive', id:'subjunctive', title:'Bị động Subjunctive ⭐', keywords:'be v3 passive subjunctive proposed suggested',
        formula:'that + S + be + V3', vi:'Bị động subjunctive = be + V3',
        keys:'It is proposed that the meeting BE postponed. It is recommended that the form BE completed.',
        example:'The committee proposed that the deadline be extended.',
        trap:'"Be postponed" (không "is/was postponed") trong subjunctive' },
      // ── INVERSION ───────────────────────────────────────────
      { group:'🔁 Đảo ngữ', id:'inversion', title:'Phó từ phủ định ⭐⭐', keywords:'never rarely seldom hardly scarcely not only',
        formula:'Adv phủ định + aux + S + V', vi:'Đảo ngữ trang trọng, nhấn mạnh',
        keys:'Never/Rarely/Seldom/Hardly/Scarcely/Barely + have/has/did/does + S + V · Not only did S V, but also...',
        example:'Never before has the company received such reviews. Rarely do we see such dedication.' },
      { group:'🔁 Đảo ngữ', id:'inversion', title:'Only + adverbial ⭐', keywords:'only after only when only by only if only then',
        formula:'Only + adverbial, aux + S + V', vi:'Đảo ngữ sau "only"',
        keys:'Only after/when/if/then/by + [phrase] + aux + S + V',
        example:'Only after reviewing all data did the team reach a conclusion. Only if you register by Friday can you get the discount.' },
      // ── QUANTIFIERS ─────────────────────────────────────────
      { group:'🔢 Lượng từ', id:'quantifiers', title:'Bảng lượng từ ⭐⭐', keywords:'many much few little some any a lot of',
        formula:'many/few/fewer + đếm được · much/little/less + không đếm được · some/any/a lot of = cả hai', vi:'Lượng từ theo loại danh từ',
        keys:'many/few/fewer (countable plural) · much/little/less (uncountable) · some/any/a lot of (both) · each/every (countable singular)',
        example:'There is not much time left. A few candidates were shortlisted.',
        trap:'"A few" = tích cực (vài) ≠ "few" = tiêu cực (hầu như không)' },
      { group:'🔢 Lượng từ', id:'quantifiers', title:'Less vs Fewer ⭐', keywords:'less fewer countable uncountable',
        formula:'fewer + đếm được · less + không đếm được', vi:'Phân biệt less/fewer',
        keys:'fewer employees (countable) · less waste (uncountable) · no fewer than (≥ min) · no more than (≤ max)',
        example:'The new process generates less waste and requires fewer workers.' },
      // ── PARTICIPLES ─────────────────────────────────────────
      { group:'🌿 Phân từ', id:'participles', title:'Rút gọn mệnh đề ⭐', keywords:'having v-ing v3 participle reduce',
        formula:'V-ing = chủ động/đồng thời · V3 = bị động · Having V3 = hoàn thành trước', vi:'Rút gọn mệnh đề phụ',
        keys:'While reviewing → Reviewing · After having completed → Having completed · Because it was written → Written',
        example:'Reviewing the contract, she noticed a key clause. Having completed the training, the team began the project.' },
      { group:'🌿 Phân từ', id:'participles', title:'Dangling Participle ⚠️', keywords:'dangling participle error wrong subject',
        formula:'Phân từ phải có chủ ngữ = chủ ngữ mệnh đề chính', vi:'Lỗi chủ ngữ không khớp',
        keys:'SAI: Having reviewed the report, the deadline was extended. ĐÚNG: Having reviewed the report, the manager extended the deadline.',
        example:'Based on the results, the manager revised the strategy. ✓',
        trap:'"Based on" và "Given" là cụm phân từ cố định, không bị coi là dangling' },
      // ── ADVERB TIME ─────────────────────────────────────────
      { group:'🕐 Mệnh đề thời gian', id:'adverb-time', title:'Không dùng will ⭐⭐', keywords:'when after before once until as soon as no will',
        formula:'Time clause: hiện tại → thay cho tương lai', vi:'Quy tắc bắt buộc',
        keys:'when/after/before/once/until/as soon as + PRESENT SIMPLE (không will)',
        example:'Once the report is ready, please send it. After the meeting ends, we will discuss.',
        trap:'"Once the report will be ready" = SAI. "Once the report is ready" = ĐÚNG' },
      { group:'🕐 Mệnh đề thời gian', id:'adverb-time', title:'By the time ⭐⭐', keywords:'by the time past perfect future perfect',
        formula:'By the time + present → Future Perfect · By the time + past → Past Perfect', vi:'Quy tắc "by the time"',
        keys:'By the time he arrives (present), we will have finished (future perfect). By the time he arrived (past), we had finished (past perfect).',
        example:'By the time the director arrives, the team will have completed the presentation.',
        trap:'"By the time" = bẫy cực phổ biến trong TOEIC Part 5' },
      // ── TOP 10 ETS TRAPS ────────────────────────────────────
      { group:'⭐ Top ETS Traps', id:'part5-strategy', title:'Top 10 Bẫy ETS 2025', keywords:'trap ets toeic common mistakes',
        formula:'Ghi nhớ để không bị lừa', vi:'Bẫy thường gặp nhất ETS 2025',
        keys:'1. by≠until · 2. despite+N · 3. look forward to V-ing · 4. by the time+present→FP · 5. each/every+singular · 6. the number of+singular · 7. a number of+plural · 8. subjunctive (no -s) · 9. should you = inversion · 10. economic≠economical',
        example:'Should you have questions, please contact us. (Formal conditional inversion)',
        trap:'Học thuộc 10 bẫy này = +5 điểm Part 5' },
      // ── BUSINESS COLLOCATIONS ───────────────────────────────
      { group:'💼 Business Collocations', id:'business-english', title:'Verbs for Meetings & Reports', keywords:'schedule arrange postpone cancel submit review present',
        formula:'V + N collocations', vi:'Cụm từ thương mại chuẩn ETS',
        keys:'schedule/arrange/postpone/cancel/chair a meeting · submit/review/present/distribute/compile a report · sign/draft/terminate/renew a contract',
        example:'The committee will review and present the report at the next board meeting.' },
      { group:'💼 Business Collocations', id:'business-english', title:'Verbs for Products & HR', keywords:'launch release hire recruit promote dismiss',
        formula:'V + N collocations (HR & Product)', vi:'Cụm từ HR và sản phẩm',
        keys:'launch/release/unveil a product · hire/recruit/onboard/promote/dismiss employees · allocate/exceed/approve a budget',
        example:'The company unveiled its new product line and hired 50 additional staff members.' },
    ];

    // ── Groups (order) ────────────────────────────────────────
    const GROUP_ORDER = [
      '⭐ Top ETS Traps',
      '⏱️ Thì động từ',
      '🔄 Câu bị động',
      '🔀 Câu điều kiện',
      '🔡 Từ loại',
      '✏️ Gerund/Infinitive',
      '📍 Giới từ',
      '🔗 Liên từ',
      '🔍 Mệnh đề quan hệ',
      '🅰️ Đại từ',
      '💡 Modals',
      '⚖️ Hòa hợp chủ-vị',
      '📦 Mệnh đề danh từ',
      '🎯 Subjunctive',
      '🔁 Đảo ngữ',
      '🔢 Lượng từ',
      '🌿 Phân từ',
      '🕐 Mệnh đề thời gian',
      '💼 Business Collocations',
    ];

    // ── Render function ────────────────────────────────────────
    function buildQRHtml(cards) {
      // group cards
      const byGroup = {};
      GROUP_ORDER.forEach(g => byGroup[g] = []);
      cards.forEach(c => { if (byGroup[c.group]) byGroup[c.group].push(c); });

      const groupHtml = GROUP_ORDER.map(g => {
        const items = byGroup[g];
        if (!items || items.length === 0) return '';
        const itemsHtml = items.map(c => {
          const drillBtn = `<button class="qr-drill-btn" onclick="App.goToGrammar('${c.id}')" title="Xem bài học">📖 Học</button>`;
          const drillTrBtn = _hasTransformDrill(c.id) ? `<button class="qr-drill-btn qr-drill-transform" onclick="TransformDrill.open('${c.id}')" title="Luyện tập chuyển đổi">🔀 Luyện tập</button>` : '';
          const trapHtml = c.trap ? `<div class="qr-trap">⚠️ ${c.trap}</div>` : '';
          return `
            <div class="qr-item" data-keywords="${(c.title + ' ' + c.keywords + ' ' + c.vi).toLowerCase()}">
              <div class="qr-item-head">
                <span class="qr-title">${c.title}</span>
                <div class="qr-actions">${drillBtn}${drillTrBtn}</div>
              </div>
              <div class="qr-formula" onclick="navigator.clipboard?.writeText('${c.formula.replace(/'/g,"\\'")}').then(()=>{this.classList.add('copied');setTimeout(()=>this.classList.remove('copied'),1200)})" title="Click để copy công thức">
                <span class="qr-formula-text">${c.formula}</span>
                <span class="qr-copy-icon">📋</span>
              </div>
              <div class="qr-vi">${c.vi}</div>
              <div class="qr-keys">🔑 ${c.keys}</div>
              <div class="qr-example">✦ ${c.example}</div>
              ${trapHtml}
            </div>`;
        }).join('');
        return `
          <div class="qr-group">
            <div class="qr-group-head" onclick="this.parentElement.classList.toggle('collapsed')">
              <span class="qr-group-title">${g}</span>
              <span class="qr-group-count">${items.length} rule</span>
              <span class="qr-chevron">▾</span>
            </div>
            <div class="qr-group-body">${itemsHtml}</div>
          </div>`;
      }).join('');

      return groupHtml;
    }

    // ── Initial render ─────────────────────────────────────────
    area.innerHTML = `
      <div class="qr-wrap">
        <div class="qr-header">
          <div class="qr-search-wrap">
            <span class="qr-search-icon">🔍</span>
            <input type="text" id="qr-search" class="qr-search" placeholder="Tìm nhanh: by the time, subjunctive, look forward to...">
            <button class="qr-search-clear" id="qr-search-clear" style="display:none">✕</button>
          </div>
          <div class="qr-meta" id="qr-meta">${QR_CARDS.length} rules · Click công thức để copy · Click nhóm để ẩn/hiện</div>
        </div>
        <div id="qr-content">${buildQRHtml(QR_CARDS)}</div>
      </div>`;

    // ── Wire search ────────────────────────────────────────────
    const searchEl = document.getElementById('qr-search');
    const clearBtn = document.getElementById('qr-search-clear');
    const metaEl   = document.getElementById('qr-meta');
    const contentEl = document.getElementById('qr-content');

    function doSearch(q) {
      clearBtn.style.display = q ? 'block' : 'none';
      if (!q) {
        contentEl.innerHTML = buildQRHtml(QR_CARDS);
        metaEl.textContent = `${QR_CARDS.length} rules · Click công thức để copy`;
        return;
      }
      const lq = q.toLowerCase();
      const filtered = QR_CARDS.filter(c =>
        (c.title + ' ' + c.keywords + ' ' + c.vi + ' ' + c.formula + ' ' + c.keys + ' ' + (c.trap||'')).toLowerCase().includes(lq)
      );
      if (filtered.length === 0) {
        contentEl.innerHTML = `<div class="qr-empty">Không tìm thấy kết quả cho "<b>${q}</b>"</div>`;
        metaEl.textContent = '0 kết quả';
        return;
      }
      // Render flat (no group collapsing) when searching
      const flatHtml = filtered.map(c => {
        const drillBtn = `<button class="qr-drill-btn" onclick="App.goToGrammar('${c.id}')" title="Xem bài học">📖 Học</button>`;
        const drillTrBtn = _hasTransformDrill(c.id) ? `<button class="qr-drill-btn qr-drill-transform" onclick="TransformDrill.open('${c.id}')" title="Luyện tập">🔀 Luyện tập</button>` : '';
        const trapHtml = c.trap ? `<div class="qr-trap">⚠️ ${c.trap}</div>` : '';
        const groupTag = `<span class="qr-group-tag">${c.group}</span>`;
        return `
          <div class="qr-item qr-item-search">
            <div class="qr-item-head">
              <div><span class="qr-title">${c.title}</span>${groupTag}</div>
              <div class="qr-actions">${drillBtn}${drillTrBtn}</div>
            </div>
            <div class="qr-formula" onclick="navigator.clipboard?.writeText('${c.formula.replace(/'/g,"\\'")}').then(()=>{this.classList.add('copied');setTimeout(()=>this.classList.remove('copied'),1200)})" title="Click để copy">
              <span class="qr-formula-text">${c.formula}</span>
              <span class="qr-copy-icon">📋</span>
            </div>
            <div class="qr-vi">${c.vi}</div>
            <div class="qr-keys">🔑 ${c.keys}</div>
            <div class="qr-example">✦ ${c.example}</div>
            ${trapHtml}
          </div>`;
      }).join('');
      contentEl.innerHTML = `<div class="qr-flat">${flatHtml}</div>`;
      metaEl.textContent = `${filtered.length} kết quả cho "${q}"`;
    }

    searchEl.addEventListener('input', e => doSearch(e.target.value.trim()));
    clearBtn.addEventListener('click', () => { searchEl.value = ''; doSearch(''); searchEl.focus(); });
    searchEl.focus();
  }

  function _renderGrammarContentMain(topic, area) {
    // ── Drill pool ──
    const drillPool = flatQuestions.filter(q => q.part === 5 && q.type === topic.id);
    const drillCount = drillPool.length;

    // ── Grammar stats cho topic này ──
    const stats = getGrammarStats();
    const s     = stats[topic.id];
    const level = getGrammarMasteryLevel(topic.id);
    const days  = getDaysSinceLastDrill(topic.id);

    // ── Progress bar mini ──
    let progressHtml = '';
    if (s && s.total > 0) {
      const pct = Math.round(s.correct / s.total * 100);
      const color = pct >= 80 ? 'var(--success)' : pct >= 60 ? 'var(--warning)' : 'var(--danger)';
      const levelLabel = level === 'mastered' ? '🟢 Thành thạo' : level === 'learning' ? '🟡 Đang học' : '🔴 Cần ôn';
      const daysText = days === 0 ? 'hôm nay' : days === 1 ? 'hôm qua' : `${days} ngày trước`;
      progressHtml = `
        <div class="grammar-progress-bar-wrap">
          <div class="gpb-top">
            <span class="gpb-label">${levelLabel} · Đúng ${pct}% (${s.correct}/${s.total} câu · ${s.drills} lần luyện tập)</span>
            <span class="gpb-date">Lần cuối: ${daysText}</span>
          </div>
          <div class="gpb-track"><div class="gpb-fill" style="width:${pct}%;background:${color}"></div></div>
        </div>`;
    } else {
      progressHtml = `<div class="grammar-progress-bar-wrap gpb-empty">⚪ Chưa luyện tập chủ đề này — hãy thử ngay bên dưới!</div>`;
    }

    // ── Drill banner ──
    const drillEasy   = drillPool.filter(q => q.difficulty === 'easy').length;
    const drillMedium = drillPool.filter(q => q.difficulty === 'medium').length;
    const drillHard   = drillPool.filter(q => q.difficulty === 'hard').length;
    const diffLabel   = drillCount > 0
      ? `<span style="font-size:0.72rem;color:var(--text-muted);margin-left:8px">` +
        (drillEasy   > 0 ? `<span style="color:#10b981">★${drillEasy}</span> ` : '') +
        (drillMedium > 0 ? `<span style="color:#60a5fa">★★${drillMedium}</span> ` : '') +
        (drillHard   > 0 ? `<span style="color:#ef4444">★★★${drillHard}</span>` : '') +
        `</span>`
      : '';
    const drillBanner = drillCount > 0 ? `
      <div class="grammar-drill-banner">
        <div class="drill-banner-left">
          <span style="font-size:0.88rem;color:var(--text-secondary)">
            📝 <strong style="color:var(--accent-2)">${drillCount} câu</strong> luyện tập cho chủ đề này${diffLabel}
          </span>
        </div>
        <div class="drill-banner-right">
          <button class="btn btn-sm btn-drill" onclick="App.startGrammarDrill('${topic.id}')">▶ Luyện tập nhanh 5 câu</button>
          ${drillCount >= 10 ? `<button class="btn btn-sm" style="margin-left:6px;background:rgba(139,92,246,0.15);border-color:rgba(139,92,246,0.4);color:var(--accent-2)" onclick="App.startGrammarDrill10('${topic.id}')">🔥 Luyện tập nhanh 10 câu</button>` : ''}
          ${_hasTransformDrill(topic.id) ? `<button class="btn btn-sm btn-transform-drill" style="margin-left:6px" onclick="TransformDrill.open('${topic.id}')">🔀 Luyện tập chuyển đổi</button>` : ''}
          ${topic.id === 'word-form' ? `<button class="btn btn-sm btn-word-form-drill" style="margin-left:6px" onclick="WordFormDrill.open()">🔤 Luyện từ loại</button>` : ''}
          ${drillCount > 0 ? `<button class="btn btn-sm" style="margin-left:6px;background:rgba(16,185,129,0.12);border:1px solid rgba(16,185,129,0.4);color:#10b981;font-weight:700" onclick="App.goToPracticeByGrammar('${topic.id}')">🎯 Luyện tập Part 5</button>` : ''}
        </div>
      </div>` : `
      <div class="grammar-drill-banner">
        <div class="drill-banner-left">
          <span style="font-size:0.88rem;color:var(--text-muted)">📝 Chưa có câu luyện tập Part 5 cho chủ đề này</span>
        </div>
        <div class="drill-banner-right">
          ${_hasTransformDrill(topic.id) ? `<button class="btn btn-sm btn-transform-drill" onclick="TransformDrill.open('${topic.id}')">🔀 Luyện tập chuyển đổi</button>` : ''}
          ${topic.id === 'word-form' ? `<button class="btn btn-sm btn-word-form-drill" onclick="WordFormDrill.open()">🔤 Luyện từ loại</button>` : ''}
        </div>
      </div>`;

    // ── Câu hỏi mẫu thực tế (Nâng cấp #1 – Question Breakdown) ──
    const sampleQs = drillPool.slice(0, 3); // lấy tối đa 3 câu mẫu
    let breakdownHtml = '';
    if (sampleQs.length > 0) {
      const qCards = sampleQs.map((q, idx) => {
        const opts = ['A','B','C','D'];
        const optHtml = q.options.map((opt, i) => {
          const isCorrect = i === q.answer;
          return `<div class="qb-option ${isCorrect ? 'qb-correct' : 'qb-wrong'}">
            <span class="qb-letter">${opts[i]}</span>
            <span class="qb-text">${opt}</span>
            ${isCorrect ? '<span class="qb-tick">✓</span>' : ''}
          </div>`;
        }).join('');
        return `
          <div class="qb-card">
            <div class="qb-num">Câu ${idx+1}</div>
            <div class="qb-sentence">${q.question || q.sentence || ''}</div>
            <div class="qb-options">${optHtml}</div>
            ${q.explanation ? `<div class="qb-explanation">💡 ${q.explanation}</div>` : ''}
          </div>`;
      }).join('');

      breakdownHtml = `
        <div class="grammar-breakdown-section">
          <div class="breakdown-header">
            <h3 class="breakdown-title">🎯 Câu hỏi thực tế – Ngữ pháp này trông như thế nào trong đề thi?</h3>
            <span class="breakdown-sub">Phân tích ${sampleQs.length} câu mẫu từ ngân hàng đề Part 5</span>
          </div>
          <div class="qb-list">${qCards}</div>
          ${drillCount > 3 ? `<p class="breakdown-more">Còn ${drillCount - 3} câu nữa trong ngân hàng đề → <button class="link-btn" onclick="App.startGrammarDrill('${topic.id}')">Luyện tập ngay</button></p>` : ''}
        </div>`;
    }

    area.innerHTML = progressHtml + drillBanner + (topic.content || '') + breakdownHtml;

    // Setup inline quiz buttons sau khi inject HTML
    _setupInlineQuiz(area);
  }

  // ─── Practice Page ───
  function setupPracticePage() {
    document.querySelectorAll('.test-option-card').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.test-option-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        quizMode = card.dataset.mode;
      });
    });
    document.getElementById('btn-start-quiz').addEventListener('click', startQuiz);
    document.getElementById('btn-next').addEventListener('click', nextQuestion);
    document.getElementById('btn-prev').addEventListener('click', prevQuestion);
    document.getElementById('btn-submit-quiz').addEventListener('click', submitQuiz);
    document.getElementById('btn-restart').addEventListener('click', restartPractice);
    const wrongBtn = document.getElementById('btn-start-wrong');
    if (wrongBtn) wrongBtn.addEventListener('click', startWrongReview);
    const firstCard = document.querySelector('.test-option-card');
    if (firstCard) { firstCard.classList.add('selected'); quizMode = firstCard.dataset.mode; }
  }

  function startQuiz() {
    const mode = QUIZ_MODES[quizMode];

    // ── Chế độ Full Reading: tái tạo đề theo đúng tỉ lệ và thứ tự TOEIC ──
    if (quizMode === 'reading') {
      const rndSeed = Math.floor(Math.random() * 900000) + 100000;

      // Part 5: 30 câu ngẫu nhiên
      const selectedP5 = shuffleArray([...DB.questions.part5]).slice(0, 30);

      // Part 6: 4 đoạn (mỗi đoạn 4 câu = 16 câu)
      const p6groupsPool = DB.questions.part6.filter(g => g.questions.length === 4);
      const selectedP6 = shuffleArray([...p6groupsPool]).slice(0, 4);

      // Part 7: 54 câu theo đúng cấu trúc TOEIC dùng _buildP7Exact
      const selectedP7 = _buildP7Exact(rndSeed, 54);

      // Flatten theo thứ tự Part5 → Part6 → Part7
      quizQuestions = [];
      selectedP5.forEach(q => quizQuestions.push({...q, part: 5}));
      selectedP6.forEach(grp => grp.questions.forEach(q => quizQuestions.push({
        ...q, part: 6, passage: grp.passage, passageTitle: grp.passageTitle, type: grp.type
      })));
      selectedP7.forEach(grp => grp.questions.forEach(q => quizQuestions.push({
        ...q, part: 7, passage: grp.passage, passageTitle: grp.passageTitle, type: grp.type
      })));

      quizIndex = 0; quizScore = 0; quizAnswered = 0;
      quizUserAnswers = new Array(quizQuestions.length).fill(null);
      quizTimeLeft = 4500; // 75 phút

      const p6q = selectedP6.reduce((s,g) => s + g.questions.length, 0);
      const p7q = selectedP7.reduce((s,g) => s + g.questions.length, 0);

      document.getElementById('quiz-setup').style.display      = 'none';
      document.getElementById('quiz-container').style.display  = 'block';
      document.getElementById('results-container').style.display = 'none';
      document.getElementById('quiz-total').textContent        = quizQuestions.length;

      const unseenBadge = document.getElementById('quiz-unseen-badge');
      if (unseenBadge) {
        unseenBadge.textContent   = `📝 Full Reading: ${selectedP5.length} P5 + ${p6q} P6 + ${p7q} P7`;
        unseenBadge.style.display = 'inline-block';
      }
      startTimer();
      renderQuestionNavigator();
      renderQuestion();
      return;
    }
    const pool = flatQuestions.filter(mode.filter);
    if (pool.length === 0) { alert('Không có câu hỏi nào cho chế độ này.'); return; }
    const smartPool = buildSmartPool(pool, Math.min(mode.count, pool.length));
    quizQuestions   = smartPool.slice(0, Math.min(mode.count, smartPool.length));
    quizIndex = 0; quizScore = 0; quizAnswered = 0;
    quizUserAnswers = new Array(quizQuestions.length).fill(null);
    quizTimeLeft    = (quizMode === 'reading') ? quizQuestions.length * 45 : mode.time;

    const seen = getSeenIds();
    const unseenInSet = quizQuestions.filter(q => q.id && !seen.has(q.id)).length;

    document.getElementById('quiz-setup').style.display      = 'none';
    document.getElementById('quiz-container').style.display  = 'block';
    document.getElementById('results-container').style.display = 'none';
    document.getElementById('quiz-total').textContent        = quizQuestions.length;

    const unseenBadge = document.getElementById('quiz-unseen-badge');
    if (unseenBadge) {
      unseenBadge.textContent     = unseenInSet > 0 ? `🆕 ${unseenInSet} câu mới` : '✅ Đã ôn hết bộ này';
      unseenBadge.style.display   = 'inline-block';
    }
    startTimer();
    renderQuestionNavigator();
    renderQuestion();
  }

  function renderQuestionNavigator() {
    const navEl = document.getElementById('quiz-navigator');
    if (!navEl) return;
    navEl.innerHTML = quizQuestions.map((_, i) => {
      const isAnswered = quizUserAnswers[i] !== null;
      return `<div class="quiz-nav-item ${i===quizIndex?'active':''} ${isAnswered?'answered':''}" onclick="App.jumpToQuestion(${i})">${i+1}</div>`;
    }).join('');
  }

  function jumpToQuestion(idx) {
    if (idx < 0 || idx >= quizQuestions.length) return;
    quizIndex = idx;
    renderQuestion();
  }

  function startTimer() {
    clearInterval(quizTimer);
    updateTimerDisplay();
    quizTimer = setInterval(() => {
      quizTimeLeft--;
      updateTimerDisplay();
      if (quizTimeLeft <= 0) { clearInterval(quizTimer); submitQuiz(); }
    }, 1000);
  }

  function updateTimerDisplay() {
    const el = document.getElementById('timer-display');
    const m  = Math.floor(quizTimeLeft / 60).toString().padStart(2,'0');
    const s  = (quizTimeLeft % 60).toString().padStart(2,'0');
    el.textContent = `${m}:${s}`;
    el.classList.toggle('warning', quizTimeLeft <= 60);
  }

  function renderQuestion() {
    const q = quizQuestions[quizIndex];
    if (!q) return;

    document.getElementById('quiz-current').textContent = quizIndex + 1;
    const partLabel = document.getElementById('quiz-part-label');
    partLabel.textContent = `Part ${q.part}`;
    partLabel.className   = `tag tag-part${q.part}`;
    // Difficulty badge
    const diffBadge = document.getElementById('quiz-diff-badge');
    if (diffBadge && q.difficulty) {
      const dMap = { easy: '★ Dễ', medium: '★★ Vừa', hard: '★★★ Khó' };
      const dCol = { easy: 'rgba(16,185,129,0.18)', medium: 'rgba(96,165,250,0.15)', hard: 'rgba(244,63,94,0.18)' };
      const dTxt = { easy: '#10b981', medium: '#60a5fa', hard: '#ef4444' };
      diffBadge.textContent = dMap[q.difficulty] || '';
      diffBadge.style.background = dCol[q.difficulty] || 'transparent';
      diffBadge.style.color = dTxt[q.difficulty] || 'inherit';
      diffBadge.style.display = q.part === 5 ? 'inline-block' : 'none';
    }
    document.getElementById('quiz-progress-bar').style.width = ((quizIndex / quizQuestions.length) * 100).toFixed(0) + '%';

    const seen = getSeenIds();
    const unseenTagEl = document.getElementById('quiz-new-tag');
    if (unseenTagEl) unseenTagEl.style.display = (q.id && !seen.has(q.id)) ? 'inline-block' : 'none';

    const passageEl = document.getElementById('question-passage');
    if (q.passage) {
      passageEl.style.display = 'block';
      const typeLabel = q.type === 'triple' ? '📄📄📄 TRIPLE PASSAGE' : q.type === 'double' ? '📄📄 DOUBLE PASSAGE' : '📄 PASSAGE';
      const titleHtml = q.passageTitle
        ? `<b style="color:var(--accent);font-size:0.78rem;display:block;margin-bottom:8px;">${typeLabel} – ${q.passageTitle}</b>`
        : `<b style="color:var(--accent);font-size:0.78rem;display:block;margin-bottom:8px;">${typeLabel}</b>`;
      let passageHtml = escapeHtml(q.passage)
        .replace(/\[Document (\d+) –([^\]]*)\]/g, (_, num, label) =>
          `<span style="display:inline-block;background:rgba(79,142,247,0.15);color:var(--accent);font-weight:700;font-size:0.78rem;padding:3px 10px;border-radius:20px;margin:10px 0 6px 0;">📄 Document ${num} –${label}</span>`)
        .replace(/\n/g, '<br>');
      passageEl.innerHTML = titleHtml + passageHtml;
    } else {
      passageEl.style.display = 'none';
    }

    const qNum = q.qNum ? `Question ${q.qNum} — ` : '';
    document.getElementById('question-text').innerHTML = `<span style="color:var(--text-muted);font-size:0.85rem">${qNum}Q${quizIndex+1}.</span> ${q.question}`;

    const userAns = quizUserAnswers[quizIndex];
    const letters = ['A','B','C','D'];
    document.getElementById('question-options').innerHTML = q.options.map((opt, i) => {
      let cls = 'option-btn';
      if (userAns !== null) {
        cls += ' disabled';
        if (i === q.answer) cls += ' correct';
        else if (i === userAns) cls += ' wrong';
      }
      return `<button class="${cls}" data-idx="${i}" onclick="App.selectAnswer(${i})">
        <span class="opt-letter">${letters[i]}</span><span>${opt}</span></button>`;
    }).join('');

    const expBox = document.getElementById('explanation-box');
    if (userAns !== null) {
      expBox.classList.add('show');
      const grammarLinkHtml = buildGrammarLink(q);
      expBox.innerHTML = `<div class="exp-title">${userAns===q.answer?'✅ Chính xác!':'❌ Chưa đúng!'}</div><p>📖 ${q.explanation}</p>${grammarLinkHtml}`;
    } else {
      expBox.classList.remove('show');
      expBox.innerHTML = '';
    }

    const navItems = document.querySelectorAll('.quiz-nav-item');
    navItems.forEach((item, i) => {
      item.classList.toggle('active',   i === quizIndex);
      item.classList.toggle('answered', quizUserAnswers[i] !== null);
    });

    document.getElementById('btn-prev').disabled = quizIndex === 0;
    const isLast = quizIndex === quizQuestions.length - 1;
    document.getElementById('btn-next').style.display       = isLast ? 'none' : 'inline-flex';
    const submitBtn = document.getElementById('btn-submit-quiz');
    submitBtn.style.display    = 'inline-flex';
    submitBtn.className        = isLast ? 'btn btn-success' : 'btn btn-outline';
    submitBtn.style.borderColor = isLast ? '' : 'var(--success)';
    submitBtn.style.color       = isLast ? '' : 'var(--success)';
  }

  function selectAnswer(idx) {
    if (quizUserAnswers[quizIndex] !== null) return;
    quizUserAnswers[quizIndex] = idx;
    quizAnswered++;
    const q = quizQuestions[quizIndex];
    const isCorrect = idx === q.answer;
    if (isCorrect) quizScore++;
    if (q.id) qSrsRate(q.id, isCorrect);
    const navItem = document.querySelectorAll('.quiz-nav-item')[quizIndex];
    if (navItem) navItem.classList.add('answered');
    renderQuestion();
  }

  function nextQuestion() { if (quizIndex < quizQuestions.length-1) { quizIndex++; renderQuestion(); } }
  function prevQuestion() { if (quizIndex > 0) { quizIndex--; renderQuestion(); } }

  function submitQuiz() {
    const total     = quizQuestions.length;
    const unanswered = total - quizAnswered;
    if (unanswered > 0 && !confirm(`Bạn còn ${unanswered} câu chưa làm. Bạn có chắc muốn nộp bài không?`)) return;

    clearInterval(quizTimer);
    const pct = Math.round(quizScore / total * 100);
    markQuestionsAnswered(quizQuestions, quizUserAnswers);
    updateProgressGamified(quizScore, total);

    // Lưu grammar stats nếu đây là grammar drill (Nâng cấp #2 & #3)
    if (quizMode === 'grammar-drill' && _grammarDrillTypeId) {
      saveGrammarDrillResult(_grammarDrillTypeId, quizScore, total);
      _renderGrammarNav(); // cập nhật badge trên nav
      _grammarDrillTypeId = null;
    }

    document.getElementById('quiz-container').style.display    = 'none';
    document.getElementById('results-container').style.display = 'block';

    const radius = 70, circ = 2 * Math.PI * radius, dash = (pct/100) * circ;
    const color  = pct >= 80 ? '#22c55e' : pct >= 60 ? '#f59e0b' : '#ef4444';
    document.getElementById('score-ring-svg').innerHTML =
      `<circle cx="80" cy="80" r="${radius}" fill="none" stroke="#1a1e35" stroke-width="12"/>
       <circle cx="80" cy="80" r="${radius}" fill="none" stroke="${color}" stroke-width="12" stroke-dasharray="${dash} ${circ}" stroke-linecap="round"/>`;
    document.getElementById('score-num').textContent   = quizScore;
    document.getElementById('score-pct').textContent   = pct + '%';
    document.getElementById('score-total').textContent = `/ ${total}`;
    document.getElementById('rs-correct').textContent  = quizScore;
    document.getElementById('rs-wrong').textContent    = total - quizScore;
    document.getElementById('rs-skipped').textContent  = total - quizAnswered;

    let grade = '', gradeColor = '';
    if (pct >= 90) { grade = 'Xuất sắc 🏆'; gradeColor = 'var(--success)'; }
    else if (pct >= 75) { grade = 'Tốt 👍'; gradeColor = 'var(--accent)'; }
    else if (pct >= 60) { grade = 'Trung bình 📖'; gradeColor = 'var(--warning)'; }
    else { grade = 'Cần ôn thêm 💪'; gradeColor = 'var(--danger)'; }
    document.getElementById('grade-label').innerHTML = `<span style="color:${gradeColor};font-size:1.1rem;font-weight:700">${grade}</span>`;

    // ── TOEIC Score Estimator ──
    const scoreRow = estimateToeicScore(pct);
    const scoreColor = pct >= 80 ? 'var(--success)' : pct >= 60 ? 'var(--warning)' : 'var(--danger)';
    const modeName = quizMode === 'reading' ? 'Full Reading'
                   : quizMode === 'part5'   ? 'Part 5'
                   : quizMode === 'part6'   ? 'Part 6'
                   : quizMode === 'part7'   ? 'Part 7'
                   : quizMode === 'wrong'   ? 'Ôn câu sai'
                   : quizMode === 'grammar-drill' ? 'Luyện tập nhanh'
                   : 'Luyện tập';
    const estEl = document.getElementById('toeic-score-estimate');
    if (estEl) {
      estEl.innerHTML = `
        <div class="toeic-estimate-box">
          <div class="estimate-label">📊 Ước tính điểm Reading (${modeName})</div>
          <div style="display:flex;align-items:baseline;gap:10px;margin:6px 0 4px">
            <span class="estimate-range" style="color:${scoreColor}">${scoreRow.lo}–${scoreRow.hi}</span>
            <span style="font-size:0.95rem;color:var(--text-muted);font-weight:600">/ 495</span>
          </div>
          <div class="estimate-note">Dựa trên tỉ lệ đúng ${pct}% · Điểm thật phụ thuộc từng đề ETS cụ thể</div>
        </div>`;
    }

    // ── Type breakdown (Part 5) ───────────────────────────────────
    const _typeMap = {};
    quizQuestions.forEach((q, i) => {
      if (q.part !== 5 || !q.type) return;
      if (!_typeMap[q.type]) _typeMap[q.type] = { correct:0, total:0 };
      _typeMap[q.type].total++;
      if (quizUserAnswers[i] === q.answer) _typeMap[q.type].correct++;
    });

    // Lưu tích lũy typeStats
    const _prog2 = getProgress();
    const _saved = _prog2.typeStats || {};
    Object.entries(_typeMap).forEach(([t, s]) => {
      if (!_saved[t]) _saved[t] = { correct:0, total:0 };
      _saved[t].correct += s.correct;
      _saved[t].total   += s.total;
    });
    saveProgress({ typeStats: _saved });

    // Render nếu có >=2 type
    const _bdTypes = Object.entries(_typeMap)
      .filter(([,s]) => s.total >= 1)
      .sort((a,b) => (a[1].correct/a[1].total) - (b[1].correct/b[1].total));

    if (_bdTypes.length >= 2) {
      const _TL = {
        'word-form':'Từ loại','verb-tense':'Thì ĐT','prepositions':'Giới từ',
        'conjunction':'Liên từ','passive':'Bị động','pronoun':'Đại từ',
        'modal':'Modal','gerund-infinitive':'Gerund/Inf','comparison':'So sánh',
        'participles':'Phân từ','subject-verb':'Chủ-Vị','noun-clauses':'MĐ DT',
        'adverb-time':'TT thời gian','vocabulary-context':'Từ vựng NGC',
        'inversion':'Đảo ngữ','quantifiers':'Số lượng','prep-structures':'Cụm GT',
        'business-english':'Văn TM','subjunctive':'Cầu khiến',
        'conditionals':'Điều kiện','relative-clause':'MĐ QH','vocabulary':'Từ vựng',
      };
      const _bars = _bdTypes.slice(0, 6).map(([t, s]) => {
        const p = Math.round(s.correct / s.total * 100);
        const col = p >= 80 ? '#22c55e' : p >= 60 ? '#f59e0b' : '#ef4444';
        const icon = p >= 80 ? '✅' : p >= 60 ? '⚠️' : '❌';
        return '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">'
          + '<span style="font-size:.72rem;color:var(--text-muted);min-width:88px">' + (_TL[t]||t) + '</span>'
          + '<div style="flex:1;background:#1a1e35;border-radius:3px;height:6px;overflow:hidden">'
          + '<div style="height:100%;width:' + p + '%;background:' + col + ';border-radius:3px"></div></div>'
          + '<span style="font-size:.72rem;color:' + col + ';min-width:44px;text-align:right">' + icon + ' ' + s.correct + '/' + s.total + '</span></div>';
      }).join('');

      const _weak = _bdTypes.filter(([,s]) => s.correct/s.total < 0.6);
      const _hint = _weak.length
        ? '<div style="margin-top:8px;padding:7px 11px;background:rgba(239,68,68,.07);border:1px solid rgba(239,68,68,.18);border-radius:7px;font-size:.75rem;color:var(--text-secondary)">'
          + '💡 Nên ôn thêm: <b style="color:#f87171">' + _weak.slice(0,3).map(([t])=>_TL[t]||t).join(' · ') + '</b></div>'
        : '';

      const _box = document.createElement('div');
      _box.style.cssText = 'margin-top:16px;padding:14px 16px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:10px';
      _box.innerHTML = '<div style="font-size:.75rem;font-weight:700;color:var(--text-secondary);text-transform:uppercase;letter-spacing:.4px;margin-bottom:10px">📊 Kết quả theo dạng câu</div>' + _bars + _hint;
      const _rc = document.querySelector('.results-card');
      if (_rc) {
        const _rb = document.getElementById('btn-restart');
        const _rp = _rb ? _rb.closest('div[style]') || _rb.parentElement : null;
        if (_rp) _rc.insertBefore(_box, _rp); else _rc.appendChild(_box);
      }
    }
  }

  function restartPractice() {
    document.getElementById('results-container').style.display = 'none';
    document.getElementById('quiz-setup').style.display        = 'block';
    navigate('practice');
  }

  // ─── Homework / Unit Quiz ───
  function setupHomeworkLogic() {
    const btn   = document.getElementById('btn-check-homework');
    const input = document.getElementById('homework-code-input');
    if (!btn || !input) return;
    btn.addEventListener('click', () => {
      const code = input.value.trim().toUpperCase();
      if (code) handleHomeworkCode(code);
    });
    input.addEventListener('keypress', e => {
      if (e.key === 'Enter') handleHomeworkCode(input.value.trim().toUpperCase());
    });
  }

  // ── Bảng giải mã type shortcode (đồng bộ với teacher-core.js) ──
  const _TYPE_SHORT_REV = {
    'VC':'vocabulary','VX':'vocabulary-context','WF':'word-form','VT':'verb-tense',
    'PV':'passive','CD':'conditionals','PP':'prepositions','CJ':'conjunction',
    'RC':'relative-clause','PR':'pronoun','MD':'modal','GI':'gerund-infinitive',
    'CM':'comparison','PT':'participles','SV':'subject-verb','NC':'noun-clauses',
    'AT':'adverb-time','IV':'inversion','QT':'quantifiers','SJ':'subjunctive',
    'PS':'prep-structures','BE':'business-english',
  };

  function handleHomeworkCode(code) {
    // ── Định dạng EXAM v4: EXAM-P{n}-G{n}-Q{n}-T{types}-{seed} ──
    const examV4 = code.match(/^EXAM-P(\d+)-G(\d+)-Q(\d+)-T([A-Z0-9.]+)-(\d+)$/i);
    if (examV4) {
      const p5Count     = parseInt(examV4[1]);
      const p6Groups    = parseInt(examV4[2]);
      const p7Questions = parseInt(examV4[3]);
      const typeStr     = examV4[4].toUpperCase();
      const seed        = parseInt(examV4[5]);
      const filterTypes = typeStr === 'ALL' ? []
        : typeStr.split('.').map(s => _TYPE_SHORT_REV[s] || s).filter(Boolean);
      generateExamFromCode(p5Count, p6Groups, p7Questions, seed, filterTypes);
      return;
    }

    // ── Định dạng EXAM v3 (legacy): EXAM-P{n}-G{n}-Q{n}-{seed} ──
    const examV3 = code.match(/^EXAM-P(\d+)-G(\d+)-Q(\d+)-(\d+)$/i);
    if (examV3) {
      generateExamFromCode(parseInt(examV3[1]), parseInt(examV3[2]), parseInt(examV3[3]), parseInt(examV3[4]), []);
      return;
    }

    // ── Định dạng HW-UNIT hoặc HW-LP ──
    const hwMatch = code.match(/HW-(?:UNIT|LP)-(\d+)-(\d+)/i);
    if (hwMatch) {
      _currentUnitId = parseInt(hwMatch[1]);
      generateUnitQuiz(parseInt(hwMatch[1]), parseInt(hwMatch[2]));
      return;
    }

    const fallback = code.match(/HW-UNIT-(\d+)/i);
    if (fallback) {
      showToast('Mã cũ — không có seed. Vui lòng dùng mã mới từ giáo viên (VD: HW-UNIT-1-4823)', '⚠️');
    } else {
      showToast('Mã không hợp lệ. Định dạng: EXAM-P30-G4-Q54-TALL-123456 hoặc HW-UNIT-1-4823', '⚠️');
    }
  }

  // ── _buildP7Exact: đảm bảo Part 7 luôn đúng 54 câu theo cấu trúc TOEIC ──
  // Part A (singles): tổng 29 câu, phân bổ 2q/3q/4q đa dạng theo seed
  // Part B (multiples): 2 doubles(5q) + 3 triples(5q) = 25 câu
  // Thứ tự: singles → doubles → triples (đúng theo ETS)
  function _buildP7Exact(seed, targetTotal) {
    const allSingles = seededShuffle(DB.questions.part7.filter(g => g.type === 'single' || !g.type), seed + 2);
    const allDoubles = seededShuffle(DB.questions.part7.filter(g => g.type === 'double'),             seed + 3);
    const allTriples = seededShuffle(DB.questions.part7.filter(g => g.type === 'triple'),             seed + 4);

    // Part B cố định: 2 doubles + 3 triples = 25 câu
    const partBDoubles = allDoubles.slice(0, 2);
    const partBTriples = allTriples.slice(0, 3);
    const partBTotal   = partBDoubles.reduce((s,g) => s + g.questions.length, 0)
                       + partBTriples.reduce((s,g) => s + g.questions.length, 0);

    const partATarget = targetTotal - partBTotal; // = 29

    // Phân loại singles theo số câu
    const s2 = allSingles.filter(g => g.questions.length === 2);
    const s3 = allSingles.filter(g => g.questions.length === 3);
    const s4 = allSingles.filter(g => g.questions.length === 4);

    // Tất cả tổ hợp [n2, n3, n4] sao cho 2*n2+3*n3+4*n4 = 29
    // Được tính sẵn dựa trên data hiện có (s2≤11, s3≤12, s4≤78)
    const COMBOS = [[0,3,5],[0,7,2],[1,1,6],[1,5,3],[2,3,4],[2,7,1],
                    [3,1,5],[3,5,2],[4,3,3],[4,7,0],[5,1,4],[5,5,1],
                    [6,3,2],[7,1,3],[7,5,0],[8,3,1]];

    // Lọc các tổ hợp khả dụng theo data thực tế, chọn 1 theo seed
    const validCombos = COMBOS.filter(([a,b,c]) => a <= s2.length && b <= s3.length && c <= s4.length);
    const [n2, n3, n4] = validCombos[seed % validCombos.length];

    const partASingles = [
      ...s2.slice(0, n2),
      ...s3.slice(0, n3),
      ...s4.slice(0, n4),
    ];

    // Ghép theo đúng thứ tự TOEIC: singles → doubles → triples
    return [...partASingles, ...partBDoubles, ...partBTriples];
  }

  // ─── Seeded PRNG (Mulberry32) ───
  function mulberry32(seed) {
    return function() {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function seededShuffle(arr, seed) {
    const rng = mulberry32(seed);
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function generateUnitQuiz(unitId, seed) {
    const unit = UNIT_METADATA.find(u => u.id === unitId);
    if (!unit) { showToast('Không tìm thấy dữ liệu cho Unit này.', '❌'); return; }

    const isTeacher  = (seed === undefined || seed === null);
    const activeSeed = isTeacher ? (Math.floor(Math.random() * 9000) + 1000) : seed;
    const keywords   = unit.vocab.map(k => k.toLowerCase());

    // Step 1: câu Part 5 có keyword liên quan vocab của unit
    let pool = flatQuestions.filter(q => {
      if (q.part !== 5) return false;
      const text = (q.question + ' ' + (q.explanation || '') + ' ' + (q.options || []).join(' ')).toLowerCase();
      return keywords.some(k => text.includes(k));
    });

    // Step 2: nếu chưa đủ 20 → bổ sung từ Part 5 ngẫu nhiên (đa dạng ngữ pháp)
    if (pool.length < 20) {
      const extra = seededShuffle(
        flatQuestions.filter(q => q.part === 5 && !pool.includes(q)),
        activeSeed
      ).slice(0, 20 - pool.length);
      pool.push(...extra);
    }

    if (pool.length === 0) { showToast(`Chưa có câu hỏi cho Unit ${unitId}.`, 'ℹ️'); return; }

    quizQuestions   = seededShuffle([...pool], activeSeed).slice(0, 20);
    quizIndex = 0; quizScore = 0; quizAnswered = 0;
    quizUserAnswers = new Array(quizQuestions.length).fill(null);
    quizTimeLeft    = quizQuestions.length * 45;
    quizMode        = 'unit-review';

    document.getElementById('quiz-setup').style.display      = 'none';
    document.getElementById('quiz-container').style.display  = 'block';
    document.getElementById('results-container').style.display = 'none';
    document.getElementById('quiz-total').textContent        = quizQuestions.length;

    const partLabel = document.getElementById('quiz-part-label');
    partLabel.textContent = `Unit ${unitId}`;
    partLabel.className   = 'tag';
    partLabel.style.background = '#8b5cf6';
    partLabel.style.color      = '#fff';

    const unseenBadge = document.getElementById('quiz-unseen-badge');
    if (unseenBadge) {
      unseenBadge.textContent   = `📚 Unit ${unitId}: ${unit.title}`;
      unseenBadge.style.display = 'inline-block';
    }

    if (isTeacher) {
      const hwCode = `HW-UNIT-${unitId}-${activeSeed}`;
      showToast(`Đã tạo bộ câu hỏi! Mã: ${hwCode}`, '🔑');
      const input = document.getElementById('homework-code-input');
      if (input) input.value = hwCode;
    } else {
      showToast(`✅ Đã tải bộ câu hỏi Unit ${unitId}`, '📝');
    }

    startTimer();
    renderQuestionNavigator();
    renderQuestion();
  }

  // ─── Generate Exam from Code (Mock Test) ───
  function generateExamFromCode(p5Count, p6Groups, p7Questions, seed, filterTypes) {
    filterTypes = filterTypes || [];

    // Part 5: seeded shuffle với type filter
    let p5pool = seededShuffle([...DB.questions.part5], seed);
    if (filterTypes.length > 0) p5pool = p5pool.filter(q => filterTypes.includes(q.type));
    const selectedP5 = p5pool.slice(0, Math.min(p5Count, p5pool.length));

    // Part 6: seeded shuffle
    const p6groupsPool = DB.questions.part6.filter(g => g.questions.length === 4);
    const selectedP6 = seededShuffle(p6groupsPool, seed + 1).slice(0, Math.min(p6Groups, p6groupsPool.length));

    // Part 7: dùng _buildP7Exact – đảm bảo đúng 54 câu và đúng thứ tự TOEIC
    const selectedP7 = _buildP7Exact(seed, p7Questions);

    // Flatten theo thứ tự Part5 → Part6 → Part7
    quizQuestions = [];
    selectedP5.forEach(q => quizQuestions.push({...q, part: 5}));
    selectedP6.forEach(grp => grp.questions.forEach(q => quizQuestions.push({
      ...q, part: 6, passage: grp.passage, passageTitle: grp.passageTitle, type: grp.type
    })));
    selectedP7.forEach(grp => grp.questions.forEach(q => quizQuestions.push({
      ...q, part: 7, passage: grp.passage, passageTitle: grp.passageTitle, type: grp.type
    })));

    if (quizQuestions.length === 0) {
      showToast('❌ Không thể tải đề thi. Vui lòng kiểm tra mã.', '⚠️');
      return;
    }

    quizIndex = 0; quizScore = 0; quizAnswered = 0;
    quizUserAnswers = new Array(quizQuestions.length).fill(null);
    quizTimeLeft = 4500; // 75 phút
    quizMode = 'mock-exam';

    document.getElementById('quiz-setup').style.display      = 'none';
    document.getElementById('quiz-container').style.display  = 'block';
    document.getElementById('results-container').style.display = 'none';
    document.getElementById('quiz-total').textContent        = quizQuestions.length;

    const partLabel = document.getElementById('quiz-part-label');
    partLabel.textContent = 'Mock Test';
    partLabel.className   = 'tag';
    partLabel.style.background = '#dc2626';
    partLabel.style.color      = '#fff';

    const p6q = selectedP6.reduce((s,g) => s + g.questions.length, 0);
    const p7q = selectedP7.reduce((s,g) => s + g.questions.length, 0);
    const unseenBadge = document.getElementById('quiz-unseen-badge');
    if (unseenBadge) {
      unseenBadge.textContent   = `📝 Full Reading: ${selectedP5.length} P5 + ${p6q} P6 + ${p7q} P7`;
      unseenBadge.style.display = 'inline-block';
    }

    showToast(`✅ Đã tải Mock Test (${quizQuestions.length} câu)`, '📝');
    startTimer();
    renderQuestionNavigator();
    renderQuestion();
  }

  // ─── Wrong Count UI ───
  function updateWrongCountUI() {
    const wrongIds = getWrongIds();
    const count    = wrongIds.size;
    const dueCount = qSrsDueCount();
    const badge = document.getElementById('wrong-count-badge');
    const card  = document.getElementById('wrong-review-card');
    if (badge) {
      badge.textContent = dueCount > 0 ? `${dueCount} hôm nay` : count;
      badge.title = `${dueCount} câu đến hạn hôm nay · ${count} câu sai tổng`;
    }
    if (card) {
      if (count === 0) {
        card.classList.add('wrong-review-empty');
        const btn = document.getElementById('btn-start-wrong');
        if (btn) { btn.disabled = true; btn.style.opacity = '0.45'; }
      } else {
        card.classList.remove('wrong-review-empty');
        const btn = document.getElementById('btn-start-wrong');
        if (btn) { btn.disabled = false; btn.style.opacity = ''; }
      }
    }
  }

  // ─── Wrong Answer Review Mode ───
  // ─── Question SRS ───────────────────────────────────────────────
  const Q_SRS_KEY = 'toeic_q_srs';
  function getQSRS() {
    try { return JSON.parse(localStorage.getItem(Q_SRS_KEY) || '{}'); } catch { return {}; }
  }
  function saveQSRS(d) { localStorage.setItem(Q_SRS_KEY, JSON.stringify(d)); }

  function qSrsRate(qId, isCorrect) {
    const srs = getQSRS(), now = Date.now();
    const c = srs[qId] || { interval:1, lapses:0, dueDate:now, reps:0 };
    if (isCorrect) {
      c.reps++;
      c.interval = c.reps <= 1 ? 1 : c.reps === 2 ? 3 : Math.min(Math.round(c.interval * 2.2), 60);
      c.dueDate  = now + c.interval * 864e5;
    } else {
      c.lapses++; c.reps = 0; c.interval = 1;
      c.dueDate  = now + 864e5;
    }
    c.lastReview = now;
    srs[qId] = c;
    saveQSRS(srs);
  }

  function getQSRSDueToday() {
    const srs = getQSRS(), wrongIds = getWrongIds(), now = Date.now();
    return flatQuestions.filter(q => {
      if (!q.id || !wrongIds.has(q.id)) return false;
      const c = srs[q.id];
      return !c || c.dueDate <= now;
    });
  }

  function qSrsDueCount() { return getQSRSDueToday().length; }

  // ─── Wrong Answer Review Mode ────────────────────────────────────
  function startWrongReview(dueOnly) {
    const wrongIds = getWrongIds();
    if (wrongIds.size === 0) {
      showToast('Chưa có câu nào cần ôn! Hãy làm bài trước 😊', 'ℹ️');
      return;
    }
    const duePool  = getQSRSDueToday();
    const allWrong = flatQuestions.filter(q => q.id && wrongIds.has(q.id));
    const pool = (dueOnly && duePool.length > 0) ? duePool : allWrong;
    if (pool.length === 0) { showToast('Không tìm thấy câu sai trong dữ liệu.', '⚠️'); return; }

    // Sort: câu đến hạn trước, nhiều lapses trước
    const srs = getQSRS(), now = Date.now();
    pool.sort((a, b) => {
      const ca = srs[a.id], cb = srs[b.id];
      const dA = ca ? ca.dueDate : 0, dB = cb ? cb.dueDate : 0;
      if (dA <= now && dB > now) return -1;
      if (dB <= now && dA > now) return  1;
      return ((cb ? cb.lapses : 0) - (ca ? ca.lapses : 0));
    });

    quizQuestions   = pool.slice(0, 30); // max 30 câu/session
    quizIndex = 0; quizScore = 0; quizAnswered = 0;
    quizUserAnswers = new Array(quizQuestions.length).fill(null);
    quizTimeLeft    = quizQuestions.length * 60; // 1 phút / câu, thoải mái
    quizMode        = 'wrong';

    document.getElementById('quiz-setup').style.display      = 'none';
    document.getElementById('quiz-container').style.display  = 'block';
    document.getElementById('results-container').style.display = 'none';
    document.getElementById('quiz-total').textContent        = quizQuestions.length;

    const partLabel = document.getElementById('quiz-part-label');
    partLabel.textContent   = 'Ôn sai';
    partLabel.className     = 'tag';
    partLabel.style.background = 'rgba(244,63,94,0.2)';
    partLabel.style.color      = 'var(--danger)';

    const unseenBadge = document.getElementById('quiz-unseen-badge');
    if (unseenBadge) {
      unseenBadge.textContent   = `🔁 Ôn lại ${quizQuestions.length} câu đã sai`;
      unseenBadge.style.display = 'inline-block';
    }

    startTimer();
    renderQuestionNavigator();
    renderQuestion();
    showToast(`Bắt đầu ôn ${quizQuestions.length} câu sai`, '🔁');
  }

  // ─── Inline Quiz (quiz nhỏ trong trang Grammar) ───
  function _setupInlineQuiz(container) {
    container.querySelectorAll('.grammar-quiz').forEach(quiz => {
      quiz.querySelectorAll('.quiz-question').forEach(qEl => {
        const correct = parseInt(qEl.dataset.answer, 10);
        const expEl = qEl.querySelector('.quiz-exp');
        if (expEl) expEl.style.display = 'none';
        qEl.querySelectorAll('.quiz-opt').forEach(btn => {
          btn.addEventListener('click', () => {
            if (qEl.dataset.done) return;
            qEl.dataset.done = '1';
            const idx = parseInt(btn.dataset.idx, 10);
            qEl.querySelectorAll('.quiz-opt').forEach((b, i) => {
              b.disabled = true;
              if (i === correct) b.classList.add('quiz-opt-correct');
              else if (i === idx) b.classList.add('quiz-opt-wrong');
            });
            if (expEl) expEl.style.display = 'block';
          });
        });
      });
    });
  }

  // ─── Grammar Mini Drill ───
  function _launchGrammarDrill(typeId, count) {
    const pool = flatQuestions.filter(q => q.part === 5 && q.type === typeId);
    if (pool.length === 0) {
      showToast('Chưa có câu luyện tập cho chủ đề này.', 'ℹ️');
      return;
    }
    const smartPool = buildSmartPool(pool);
    quizQuestions   = smartPool.slice(0, Math.min(count, smartPool.length));
    quizIndex = 0; quizScore = 0; quizAnswered = 0;
    quizUserAnswers = new Array(quizQuestions.length).fill(null);
    quizTimeLeft    = quizQuestions.length * 50;
    quizMode        = 'grammar-drill';
    _grammarDrillTypeId = typeId; // lưu lại để save stats khi submit

    navigate('practice');
    requestAnimationFrame(() => {
      document.getElementById('quiz-setup').style.display      = 'none';
      document.getElementById('quiz-container').style.display  = 'block';
      document.getElementById('results-container').style.display = 'none';
      document.getElementById('quiz-total').textContent        = quizQuestions.length;

      const topic    = DB.grammar.find(t => t.id === typeId);
      const partLabel = document.getElementById('quiz-part-label');
      partLabel.textContent   = 'Luyện tập nhanh';
      partLabel.className     = 'tag';
      partLabel.style.background = 'rgba(139,92,246,0.25)';
      partLabel.style.color      = 'var(--accent-2)';

      const unseenBadge = document.getElementById('quiz-unseen-badge');
      if (unseenBadge) {
        unseenBadge.textContent   = `📝 Luyện: ${topic ? topic.icon + ' ' + topic.title : typeId}`;
        unseenBadge.style.display = 'inline-block';
      }

      startTimer();
      renderQuestionNavigator();
      renderQuestion();
      showToast(`Luyện tập nhanh: ${quizQuestions.length} câu về ${topic ? topic.title : typeId}`, '📝');
    });
  }

  let _grammarDrillTypeId = null;

  function startGrammarDrill(typeId)   {
    if (typeId === 'vocabulary') typeId = 'vocabulary-context';
    _launchGrammarDrill(typeId, 5);
  }
  function startGrammarDrill10(typeId) {
    if (typeId === 'vocabulary') typeId = 'vocabulary-context';
    _launchGrammarDrill(typeId, 10);
  }

  // ─── Grammar Link (hiện sau khi chọn đáp án Part 5) ───
  const TYPE_TO_GRAMMAR_ID = {
    'word-form':'word-form','verb-tense':'verb-tense','passive':'passive',
    'preposition':'prepositions','prepositions':'prepositions',
    'conjunction':'conjunction','pronoun':'pronoun','article':'article',
    'relative-clause':'relative-clause','modal':'modal',
    'gerund-infinitive':'gerund-infinitive','comparison':'comparison',
    'subject-verb':'subject-verb','conditionals':'conditionals',
    'participles':'participles','inversion':'inversion',
    'quantifiers':'quantifiers','subjunctive':'subjunctive',
    'noun-clauses':'noun-clauses','adverb-time':'adverb-time',
    'prep-structures':'prep-structures','vocabulary':'vocabulary-context',
    'vocabulary-context':'vocabulary-context','business-english':'business-english',
    'part6-strategy':'part6-strategy','part7-strategy':'part7-strategy',
  };

  function buildGrammarLink(q) {
    if (!q || q.part !== 5) return '';
    const grammarId = TYPE_TO_GRAMMAR_ID[q.type];
    if (!grammarId) return '';
    const topic = DB.grammar.find(t => t.id === grammarId);
    if (!topic) return '';
    return `<div style="margin-top:14px;padding-top:12px;border-top:1px solid var(--border);">
      <button onclick="App.goToGrammar('${grammarId}')"
        style="display:inline-flex;align-items:center;gap:8px;padding:8px 16px;
               border-radius:var(--radius-sm);width:100%;justify-content:center;
               background:linear-gradient(135deg,rgba(79,142,247,0.15),rgba(139,92,246,0.15));
               border:1px solid rgba(79,142,247,0.4);color:var(--accent);
               font-size:0.85rem;font-weight:600;cursor:pointer;transition:all 0.2s;"
        onmouseover="this.style.background='linear-gradient(135deg,rgba(79,142,247,0.28),rgba(139,92,246,0.28))'"
        onmouseout="this.style.background='linear-gradient(135deg,rgba(79,142,247,0.15),rgba(139,92,246,0.15))'">
        📝 Xem ngữ pháp liên quan: <strong>${topic.icon || '📖'} ${topic.title}</strong>
      </button>
    </div>`;
  }

  function goToGrammar(grammarId) {
    navigate('grammar');
    requestAnimationFrame(() => {
      const btn = document.querySelector(`.grammar-topic-btn[data-id="${grammarId}"]`);
      if (!btn) return;
      document.querySelectorAll('.grammar-topic-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      grammarTopic = grammarId;
      renderGrammarContent();
      setTimeout(() => {
        btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        window.scrollTo({ top: 0, behavior: 'smooth' });
        btn.style.transition = 'box-shadow 0.3s';
        btn.style.boxShadow  = '0 0 0 3px rgba(79,142,247,0.6)';
        setTimeout(() => { btn.style.boxShadow = ''; }, 1500);
      }, 80);
    });
  }

  // Chuyen sang trang Luyen tap va loc Part 5 theo grammar type
  function goToPracticeByGrammar(grammarId) {
    if (grammarId === 'vocabulary') grammarId = 'vocabulary-context';
    const topic = DB.grammar ? DB.grammar.find(t => t.id === grammarId) : null;
    const label = topic ? topic.title : grammarId;
    const pool  = flatQuestions.filter(q => q.part === 5 && q.type === grammarId);
    if (pool.length === 0) { showToast(`Chua co cau Part 5 cho chu de nay.`, "info"); return; }
    QUIZ_MODES['grammar-focus'] = {
      label:  'Part 5 – ' + label,
      filter: q => q.part === 5 && q.type === grammarId,
      time:   600,
      count:  30
    };
    navigate('practice');
    setTimeout(() => {
      const oldCard = document.getElementById('grammar-focus-card');
      if (oldCard) oldCard.remove();
      const grid = document.querySelector('.test-options-grid');
      if (!grid) return;
      const card = document.createElement('div');
      card.className    = 'test-option-card grammar-focus-card';
      card.id           = 'grammar-focus-card';
      card.dataset.mode = 'grammar-focus';
      card.innerHTML    = `<div class="opt-icon">🎯</div><h3>Part 5 – ${label}</h3><p>${pool.length} câu chủ đề này · 10 phút</p>`;
      card.addEventListener('click', () => {
        document.querySelectorAll('.test-option-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        quizMode = 'grammar-focus';
      });
      grid.appendChild(card);
      document.querySelectorAll('.test-option-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      quizMode = 'grammar-focus';
      card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  }



  // ═══════════════════════════════════════════════════════════
  //   GAMIFICATION MODULE
  //   1) Spaced Repetition (SM-2 lite) for Flashcards
  //   2) Unit Learning page
  //   3) Stats / Streak / XP / Achievements
  // ═══════════════════════════════════════════════════════════

  // ─── SRS: SM-2 lite ───────────────────────────────────────
  // Each card stores: { interval, easeFactor, dueDate, reps }
  // interval in days; easeFactor default 2.5

  const SRS_DEFAULT_EF = 2.5;
  const SRS_MIN_EF     = 1.3;

  function getSrsData() {
    try { return JSON.parse(localStorage.getItem('toeic_srs') || '{}'); }
    catch { return {}; }
  }
  function saveSrsData(data) {
    localStorage.setItem('toeic_srs', JSON.stringify(data));
  }

  // quality: 0=Again, 3=Hard, 4=Good, 5=Easy
  function srsRate(vocabId, quality) {
    const srs = getSrsData();
    const now = Date.now();
    const c   = srs[vocabId] || { interval: 1, ef: SRS_DEFAULT_EF, dueDate: now, reps: 0 };

    let { interval, ef, reps } = c;
    if (quality < 3) {
      // Forgot → reset
      interval = 1; reps = 0;
    } else {
      reps++;
      if (reps === 1) interval = 1;
      else if (reps === 2) interval = 3;
      else interval = Math.round(interval * ef);
      ef = ef + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
      if (ef < SRS_MIN_EF) ef = SRS_MIN_EF;
    }

    srs[vocabId] = { interval, ef, reps, dueDate: now + interval * 864e5, lastReview: now };
    saveSrsData(srs);
    return interval;
  }

  function srsGetStatus(vocabId) {
    const srs = getSrsData();
    const c = srs[vocabId];
    if (!c) return 'new';
    const now = Date.now();
    if (c.dueDate <= now) return 'due';
    if (c.reps >= 4) return 'known';
    return 'review';
  }

  // Build SRS-sorted deck: due first, then new, then review, then known
  function buildSrsDeck(pool) {
    const srs = getSrsData();
    const now = Date.now();
    const due    = pool.filter(v => { const c=srs[v.id]; return c && c.dueDate <= now; });
    const newW   = pool.filter(v => !srs[v.id]);
    const review = pool.filter(v => { const c=srs[v.id]; return c && c.dueDate > now && c.reps < 4; });
    const known  = pool.filter(v => { const c=srs[v.id]; return c && c.reps >= 4 && c.dueDate > now; });
    [due,newW,review,known].forEach(shuffleArray);
    return [...due, ...newW, ...review, ...known];
  }

  // ─── Override rateCard to integrate SRS ───────────────────
  const _origRateCard = rateCard;  // keep reference... we redefine below after SRS is ready

  // We patch rateCard (already defined above) by wrapping via openFlashcard rebuild
  // Instead, we override the SRS rating inside rateCard:
  function rateCardSRS(rating) {
    const v = fcDeck[fcIndex];
    if (!v) return;
    // Map rating to SRS quality
    const quality = rating === 'right' ? 4 : rating === 'easy' ? 5 : 1;
    const nextDays = srsRate(v.id, quality);

    if (rating === 'right' || rating === 'easy') {
      fcKnown++;
      const prog = getProgress();
      const known = new Set(prog.fcKnown_ids || []);
      known.add(v.id);
      saveProgress({ fcKnown_ids: [...known] });
      // XP for correct
      const xpAmt = rating === 'easy' ? 3 : 2;
      addXP(xpAmt, v.id + '-fc');
      if (nextDays > 1) showToast(`📅 Ôn lại sau ${nextDays} ngày`, '🧠');
    } else {
      fcReview++;
      const prog = getProgress();
      const review = new Set(prog.fcReview_ids || []);
      review.add(v.id);
      saveProgress({ fcReview_ids: [...review] });
    }
    updateFcStats();
    fcIndex++;
    setTimeout(renderFcCardSRS, 180);
  }

  // ─── Patch openFlashcard to use SRS-sorted deck ────────────
  function openFlashcardSRS() {
    const search = (document.getElementById('vocab-search')?.value || '').toLowerCase();
    let pool = DB.vocab.filter(v => {
      const matchCat    = vocabFilter === 'All' || v.category === vocabFilter;
      const matchSearch = !search || v.word.toLowerCase().includes(search) || v.meaning.toLowerCase().includes(search);
      return matchCat && matchSearch;
    });
    if (pool.length === 0) { showToast('Không có từ nào để luyện.', '⚠️'); return; }

    fcDeck = buildSrsDeck(pool);
    fcIndex = 0; fcKnown = 0; fcReview = 0; fcSkip = 0; fcFlipped = false;

    const overlay = document.getElementById('flashcard-overlay');
    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    renderFcCardSRS();
  }

  function renderFcCardSRS() {
    if (fcIndex >= fcDeck.length) { showFcComplete(); return; }
    const v = fcDeck[fcIndex];
    fcFlipped = false;

    const inner   = document.getElementById('fc-inner');
    const actions = document.getElementById('fc-actions');
    if (inner)   inner.classList.remove('flipped');
    if (actions) actions.style.display = 'none';

    // SRS status badge
    const status = srsGetStatus(v.id);
    const statusBadge = {
      new:    '<span class="srs-badge srs-new">🆕 Mới</span>',
      due:    '<span class="srs-badge srs-due">⏰ Đến hạn</span>',
      review: '<span class="srs-badge srs-review">🔄 Ôn tập</span>',
      known:  '<span class="srs-badge srs-known">✓ Thuộc</span>',
    }[status] || '';

    document.getElementById('fc-word').innerHTML    = v.word + statusBadge;
    document.getElementById('fc-phonetic').textContent = v.phonetic;
    document.getElementById('fc-type').textContent     = v.type.toUpperCase();
    document.getElementById('fc-meaning').textContent  = v.meaning;
    document.getElementById('fc-example').textContent  = '"' + v.example + '"';
    document.getElementById('fc-category-label').textContent = v.category;

    // SRS queue bar in header: show due/new/review counts
    const srs = getSrsData(); const now = Date.now();
    const remaining = fcDeck.slice(fcIndex);
    const dueN  = remaining.filter(x => { const c=srs[x.id]; return c && c.dueDate<=now; }).length;
    const newN  = remaining.filter(x => !srs[x.id]).length;
    const revN  = remaining.length - dueN - newN;
    const progressEl = document.getElementById('fc-progress-text');
    if (progressEl) progressEl.innerHTML =
      `${fcIndex + 1}/${fcDeck.length} &nbsp;`
      + (dueN  ? `<span style="color:var(--danger);font-size:.68rem">⏰${dueN}</span> ` : '')
      + (newN  ? `<span style="color:var(--accent-3);font-size:.68rem">🆕${newN}</span> ` : '')
      + (revN  ? `<span style="color:#fbbf24;font-size:.68rem">🔄${revN}</span>` : '');

    const pct = Math.round(fcIndex / fcDeck.length * 100);
    document.getElementById('fc-progress-bar').style.width = pct + '%';
    updateFcStats();

    // Hide actions — will be shown + populated on flip
    const actionsEl = document.getElementById('fc-actions');
    if (actionsEl) { actionsEl.style.display = 'none'; actionsEl.innerHTML = ''; }

    // Mark vocab as seen
    const prog = getProgress();
    const seen = new Set(prog.vocabSeen_ids || []);
    seen.add(v.id);
    saveProgress({ vocabSeen: seen.size, vocabSeen_ids: [...seen] });
    document.getElementById('stat-vocab').textContent = seen.size;
  }

  // ─── XP & Level System ────────────────────────────────────
  const XP_LEVELS = [
    { name:'Beginner 🌱',   min:0    },
    { name:'Learner 📖',    min:100  },
    { name:'Student 🎒',   min:250  },
    { name:'Scholar 🏫',   min:500  },
    { name:'Expert 🎯',    min:900  },
    { name:'Master 🏆',    min:1500 },
    { name:'Champion 💎',  min:2500 },
    { name:'TOEIC Pro 🚀', min:4000 },
  ];

  function getXP() {
    try { return parseInt(localStorage.getItem('toeic_xp') || '0', 10); }
    catch { return 0; }
  }
  function saveXP(val) { localStorage.setItem('toeic_xp', String(val)); }
  const _xpGiven = new Set(); // prevent duplicate XP in same session

  function addXP(amount, key = '') {
    if (key && _xpGiven.has(key)) return;
    if (key) _xpGiven.add(key);
    const newXP = getXP() + amount;
    saveXP(newXP);
    showXpPopup('+' + amount + ' XP');
    renderXpBar();
    checkAchievements();
  }

  function showXpPopup(text) {
    const el = document.createElement('div');
    el.className = 'xp-popup';
    el.textContent = text;
    // Position near XP bar
    const bar = document.getElementById('xp-bar-wrap');
    const rect = bar ? bar.getBoundingClientRect() : { left: window.innerWidth/2, top: window.innerHeight/2 };
    el.style.left = (rect.left + rect.width/2 - 20) + 'px';
    el.style.top  = (rect.top + window.scrollY - 10) + 'px';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1300);
  }

  function getLevelInfo(xp) {
    let level = XP_LEVELS[0];
    for (const l of XP_LEVELS) { if (xp >= l.min) level = l; }
    const idx  = XP_LEVELS.indexOf(level);
    const next = XP_LEVELS[idx + 1] || null;
    const pct  = next ? Math.round((xp - level.min) / (next.min - level.min) * 100) : 100;
    return { level, next, pct, xp };
  }

  // ─── Streak System ────────────────────────────────────────
  function getStreakData() {
    try { return JSON.parse(localStorage.getItem('toeic_streak') || '{}'); }
    catch { return {}; }
  }
  function saveStreakData(d) { localStorage.setItem('toeic_streak', JSON.stringify(d)); }

  function todayStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }

  function recordActivity() {
    const today = todayStr();
    const sd    = getStreakData();
    if (sd.lastDay === today) return; // already recorded today

    // Build history array
    const hist = sd.history || [];
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate()-1);
    const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth()+1).padStart(2,'0')}-${String(yesterday.getDate()).padStart(2,'0')}`;

    const streak = sd.lastDay === yStr ? (sd.streak || 0) + 1 : 1;
    hist.push(today);
    // Keep last 90 days
    const trimmed = hist.slice(-90);
    saveStreakData({ streak, lastDay: today, history: trimmed, best: Math.max(streak, sd.best || 0) });
    // XP for streak
    addXP(streak >= 7 ? 10 : streak >= 3 ? 5 : 2, 'streak-' + today);
    if (streak >= 3 && streak % 3 === 0) showToast(`🔥 ${streak} ngày liên tiếp! Tuyệt vời!`, '🎉');
    renderStreakBanner();
  }

  function getStreakCount() {
    return getStreakData().streak || 0;
  }

  // ─── Render Streak + XP Banner (home page) ─────────────────
  function renderStreakBanner() {
    const wrap = document.getElementById('streak-xp-wrap');
    if (!wrap) return;
    const sd   = getStreakData();
    const streak = sd.streak || 0;
    const hist   = sd.history || [];
    const histSet = new Set(hist);

    // Last 7 days dots
    const dots = Array.from({length:7}, (_,i) => {
      const d = new Date(); d.setDate(d.getDate() - (6-i));
      const str = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      const day = ['CN','T2','T3','T4','T5','T6','T7'][d.getDay()];
      const isToday = str === todayStr();
      const done    = histSet.has(str);
      return `<div class="streak-dot ${done?'done':''} ${isToday?'today':''}" title="${str}">${day}</div>`;
    }).join('');

    const xp  = getXP();
    const li  = getLevelInfo(xp);
    const lvlEmoji = li.level.name.split(' ').pop();

    wrap.innerHTML = `
      <div class="streak-banner">
        <div class="streak-fire">🔥</div>
        <div class="streak-info">
          <div class="streak-count">${streak}</div>
          <div class="streak-sub">Ngày streak · Best: ${sd.best||0}</div>
        </div>
        <div>
          <div class="streak-dots">${dots}</div>
          <div style="font-size:.68rem;color:var(--text-muted);margin-top:5px">7 ngày gần nhất</div>
        </div>
      </div>
      <div class="xp-bar-wrap" id="xp-bar-wrap">
        <div class="xp-avatar">${lvlEmoji}</div>
        <div class="xp-details">
          <div class="xp-level-row">
            <span class="xp-level-name">${li.level.name}</span>
            <span class="xp-pts">${xp} XP</span>
          </div>
          <div class="xp-track"><div class="xp-fill" style="width:${li.pct}%"></div></div>
          <div class="xp-next">${li.next ? `${li.next.min - xp} XP đến ${li.next.name}` : '🏆 Cấp độ tối đa!'}</div>
        </div>
      </div>`;
  }

  function renderXpBar() {
    // Re-render just the XP portion without rebuilding streak
    renderStreakBanner();
  }

  // ─── Achievements ─────────────────────────────────────────
  const ACHIEVEMENTS = [
    // ── Khởi đầu ──
    { id:'first_quiz',   icon:'🎯', name:'Bắt đầu học',     desc:'Hoàn thành bài thi đầu tiên',
      check: p => (p.testsCompleted||0) >= 1,
      progress: p => ({ cur: Math.min(p.testsCompleted||0, 1), max: 1 }) },
    { id:'test10',       icon:'✏️', name:'Luyện tập chăm',   desc:'Hoàn thành 10 bài thi',
      check: p => (p.testsCompleted||0) >= 10,
      progress: p => ({ cur: Math.min(p.testsCompleted||0, 10), max: 10 }) },
    { id:'test30',       icon:'📋', name:'Chiến binh',        desc:'Hoàn thành 30 bài thi',
      check: p => (p.testsCompleted||0) >= 30,
      progress: p => ({ cur: Math.min(p.testsCompleted||0, 30), max: 30 }) },
    { id:'perfect',      icon:'🏆', name:'Hoàn hảo',          desc:'Đạt 100% một bài thi',
      check: p => (p.hasPerfect||false),
      progress: p => ({ cur: p.hasPerfect ? 1 : 0, max: 1 }) },
    { id:'acc80',        icon:'🎓', name:'Chính xác cao',     desc:'Độ chính xác tổng ≥ 80%',
      check: p => (p.accuracy||0) >= 80,
      progress: p => ({ cur: Math.min(p.accuracy||0, 80), max: 80, unit: '%' }) },
    // ── Từ vựng ──
    { id:'vocab50',      icon:'📖', name:'Từ vựng cơ bản',   desc:'Học 50 từ vựng',
      check: p => (p.vocabSeen||0) >= 50,
      progress: p => ({ cur: Math.min(p.vocabSeen||0, 50), max: 50 }) },
    { id:'vocab200',     icon:'📚', name:'Từ điển nhỏ',       desc:'Học 200 từ vựng',
      check: p => (p.vocabSeen||0) >= 200,
      progress: p => ({ cur: Math.min(p.vocabSeen||0, 200), max: 200 }) },
    { id:'vocab500',     icon:'🗂️', name:'Từ điển lớn',       desc:'Học 500 từ vựng',
      check: p => (p.vocabSeen||0) >= 500,
      progress: p => ({ cur: Math.min(p.vocabSeen||0, 500), max: 500 }) },
    { id:'srs20',        icon:'🧠', name:'Trí nhớ sắt',       desc:'Làm quen 20 thẻ SRS',
      check: () => Object.keys(getSrsData()).length >= 20,
      progress: () => ({ cur: Math.min(Object.keys(getSrsData()).length, 20), max: 20 }) },
    { id:'srs_master',   icon:'💡', name:'SRS Master',         desc:'Thuộc 50 thẻ SRS (≥4 lần)',
      check: () => Object.values(getSrsData()).filter(c=>c.reps>=4).length >= 50,
      progress: () => ({ cur: Math.min(Object.values(getSrsData()).filter(c=>c.reps>=4).length, 50), max: 50 }) },
    // ── Units ──
    { id:'unit_3',       icon:'📗', name:'Bắt đầu unit',      desc:'Hoàn thành 3 units (≥70%)',
      check: p => Object.values(p.unitScores||{}).filter(s=>s.pct>=70).length >= 3,
      progress: p => ({ cur: Math.min(Object.values(p.unitScores||{}).filter(s=>s.pct>=70).length, 3), max: 3 }) },
    { id:'unit_10',      icon:'📘', name:'Học viên tích cực',  desc:'Hoàn thành 10 units (≥70%)',
      check: p => Object.values(p.unitScores||{}).filter(s=>s.pct>=70).length >= 10,
      progress: p => ({ cur: Math.min(Object.values(p.unitScores||{}).filter(s=>s.pct>=70).length, 10), max: 10 }) },
    { id:'unit_all',     icon:'🎖️', name:'Tốt nghiệp!',        desc:'Hoàn thành cả 23 units (≥70%)',
      check: p => Object.values(p.unitScores||{}).filter(s=>s.pct>=70).length >= 23,
      progress: p => ({ cur: Math.min(Object.values(p.unitScores||{}).filter(s=>s.pct>=70).length, 23), max: 23 }) },
    { id:'unit_perfect', icon:'⭐', name:'Unit hoàn hảo',      desc:'Đạt 100% một bài unit bất kỳ',
      check: p => Object.values(p.unitScores||{}).some(s=>s.pct===100),
      progress: p => ({ cur: Object.values(p.unitScores||{}).some(s=>s.pct===100)?1:0, max: 1 }) },
    // ── Streak ──
    { id:'streak3',      icon:'🔥', name:'On fire!',           desc:'Streak 3 ngày liên tiếp',
      check: () => getStreakCount() >= 3,
      progress: () => ({ cur: Math.min(getStreakCount(), 3), max: 3, unit: 'ngày' }) },
    { id:'streak7',      icon:'💥', name:'Tuần bất bại',       desc:'Streak 7 ngày liên tiếp',
      check: () => getStreakCount() >= 7,
      progress: () => ({ cur: Math.min(getStreakCount(), 7), max: 7, unit: 'ngày' }) },
    { id:'streak14',     icon:'🌟', name:'Hai tuần liên tục',  desc:'Streak 14 ngày liên tiếp',
      check: () => getStreakCount() >= 14,
      progress: () => ({ cur: Math.min(getStreakCount(), 14), max: 14, unit: 'ngày' }) },
    { id:'streak30',     icon:'👑', name:'Tháng không nghỉ',   desc:'Streak 30 ngày liên tiếp',
      check: () => getStreakCount() >= 30,
      progress: () => ({ cur: Math.min(getStreakCount(), 30), max: 30, unit: 'ngày' }) },
    // ── XP ──
    { id:'xp500',        icon:'⚡', name:'Năng lượng!',        desc:'Đạt 500 XP',
      check: () => getXP() >= 500,
      progress: () => ({ cur: Math.min(getXP(), 500), max: 500, unit: 'XP' }) },
    { id:'xp2000',       icon:'💎', name:'Chăm chỉ đỉnh',     desc:'Đạt 2000 XP',
      check: () => getXP() >= 2000,
      progress: () => ({ cur: Math.min(getXP(), 2000), max: 2000, unit: 'XP' }) },
    { id:'xp5000',       icon:'🚀', name:'TOEIC Hero',          desc:'Đạt 5000 XP',
      check: () => getXP() >= 5000,
      progress: () => ({ cur: Math.min(getXP(), 5000), max: 5000, unit: 'XP' }) },
    // ── Câu hỏi ──
    { id:'q100',         icon:'✅', name:'100 câu',             desc:'Trả lời đúng 100 câu',
      check: p => (p.totalCorrect||0) >= 100,
      progress: p => ({ cur: Math.min(p.totalCorrect||0, 100), max: 100 }) },
    { id:'q500',         icon:'🔑', name:'500 câu đúng',        desc:'Trả lời đúng 500 câu',
      check: p => (p.totalCorrect||0) >= 500,
      progress: p => ({ cur: Math.min(p.totalCorrect||0, 500), max: 500 }) },
    { id:'q1000',        icon:'🏅', name:'1000 câu đúng',       desc:'Trả lời đúng 1000 câu',
      check: p => (p.totalCorrect||0) >= 1000,
      progress: p => ({ cur: Math.min(p.totalCorrect||0, 1000), max: 1000 }) },
  ];

  function getUnlocked() {
    try { return new Set(JSON.parse(localStorage.getItem('toeic_ach') || '[]')); }
    catch { return new Set(); }
  }
  function saveUnlocked(set) { localStorage.setItem('toeic_ach', JSON.stringify([...set])); }

  function checkAchievements() {
    const prog     = getProgress();
    const unlocked = getUnlocked();
    let newOnes    = [];
    ACHIEVEMENTS.forEach(a => {
      if (!unlocked.has(a.id) && a.check(prog)) {
        unlocked.add(a.id);
        newOnes.push(a);
      }
    });
    if (newOnes.length) {
      saveUnlocked(unlocked);
      newOnes.forEach(a => {
        setTimeout(() => showToast(`🏅 Thành tích mới: ${a.icon} ${a.name}`, '🎉'), 400);
      });
    }
  }

  // ─── Unit Learning Page ───────────────────────────────────
  function setupUnitsPage() {
    const grid = document.getElementById('units-grid');
    if (!grid) return;
    const prog = getProgress();
    const scores = prog.unitScores || {};
    const unitsDone = Object.values(scores).filter(s => s.pct >= 70).length;

    const pct = Math.round(unitsDone / UNIT_METADATA.length * 100);
    const bar = document.getElementById('roadmap-progress-bar');
    const countEl = document.getElementById('roadmap-done-count');
    if (bar) bar.style.width = pct + '%';
    if (countEl) countEl.textContent = unitsDone;

    const headerEl = document.getElementById('units-header');
    if (headerEl) headerEl.innerHTML = '';

    // Card grid layout
    grid.innerHTML = UNIT_METADATA.map(unit => {
      const keywords  = unit.vocab.map(k => k.toLowerCase());
      const unitVocab = DB.vocab.filter(v => keywords.some(k => v.category.toLowerCase().includes(k)));
      const best      = scores[unit.id];
      const unitPct   = best ? best.pct : 0;
      const done      = unitPct >= 70;
      const inProgress = unitPct > 0 && !done;
      const knownIds  = new Set((getProgress().fcKnown_ids || []));
      const knownInUnit = unitVocab.filter(v => knownIds.has(v.id)).length;

      const staleDate  = best ? best.date : null;
      const daysSince  = staleDate ? Math.floor((Date.now() - new Date(staleDate).getTime()) / 864e5) : null;
      const needReview = daysSince !== null && daysSince >= 7 && done;

      const stateClass = done ? 'uc-done' : inProgress ? 'uc-progress' : 'uc-new';
      const vocabBarPct = unitVocab.length > 0 ? Math.round(knownInUnit / unitVocab.length * 100) : 0;

      return `
        <div class="unit-card-v2 ${stateClass}" onclick="App.showUnitDetail(${unit.id})">
          <div class="uc-top">
            <div class="uc-num">Unit ${unit.id}</div>
            <div class="uc-badges">
              ${done        ? '<span class="uc-badge uc-badge-done">✓ Xong</span>'     : ''}
              ${inProgress  ? '<span class="uc-badge uc-badge-prog">● Đang học</span>' : ''}
              ${needReview  ? '<span class="uc-badge uc-badge-warn">⏰ Ôn lại</span>'  : ''}
            </div>
          </div>
          <div class="uc-title">${unit.title}</div>
          <div class="uc-meta">📚 ${unitVocab.length} từ vựng</div>

          <!-- Dual progress bars -->
          <div class="uc-bars">
            <div class="uc-bar-row">
              <span class="uc-bar-label">Từ vựng</span>
              <div class="uc-bar-bg"><div class="uc-bar-fill uc-bar-vocab" style="width:${vocabBarPct}%"></div></div>
              <span class="uc-bar-val">${vocabBarPct}%</span>
            </div>
            <div class="uc-bar-row">
              <span class="uc-bar-label">Kiểm tra</span>
              <div class="uc-bar-bg"><div class="uc-bar-fill uc-bar-quiz" style="width:${unitPct}%"></div></div>
              <span class="uc-bar-val" style="color:${unitPct>=70?'var(--success)':unitPct>0?'var(--warning)':'var(--text-muted)'}">${unitPct > 0 ? unitPct + '%' : '—'}</span>
            </div>
          </div>

          <!-- Quick-action buttons -->
          <div class="uc-actions" onclick="event.stopPropagation()">
            <button class="uc-btn uc-btn-fc" onclick="App.openUnitFlashcard(${unit.id})">🃏 Flashcard</button>
            <button class="uc-btn uc-btn-quiz" onclick="App.startUnitQuizFromPage(${unit.id})">${done ? '🔁 Ôn lại' : '✏️ Quiz'}</button>
          </div>
        </div>`;
    }).join('');
  }

  function showUnitDetail(unitId) {
    const unit = UNIT_METADATA.find(u => u.id === unitId);
    if (!unit) return;

    const keywords   = unit.vocab.map(k => k.toLowerCase());
    const unitVocab  = DB.vocab.filter(v => keywords.some(k => v.category.toLowerCase().includes(k)));
    const prog       = getProgress();
    const scores     = prog.unitScores || {};
    const best       = scores[unitId];
    const knownIds   = new Set(prog.fcKnown_ids  || []);
    const seenIds    = new Set(prog.vocabSeen_ids || []);

    // Mark all vocab as seen when panel opens
    if (unitVocab.length > 0) {
      const seen = new Set(prog.vocabSeen_ids || []);
      const prev = seen.size;
      unitVocab.forEach(v => seen.add(v.id));
      if (seen.size !== prev) {
        saveProgress({ vocabSeen: seen.size, vocabSeen_ids: [...seen] });
        const el = document.getElementById('stat-vocab');
        if (el) el.textContent = seen.size;
      }
    }

    const byCategory = {};
    unitVocab.forEach(v => {
      if (!byCategory[v.category]) byCategory[v.category] = [];
      byCategory[v.category].push(v);
    });

    const unitPct     = best ? best.pct : 0;
    const done        = unitPct >= 70;
    const knownInUnit = unitVocab.filter(v => knownIds.has(v.id)).length;
    const vocabPct    = unitVocab.length > 0 ? Math.round(knownInUnit / unitVocab.length * 100) : 0;
    const step2done   = knownInUnit >= Math.ceil(unitVocab.length * 0.5);

    // Use the unit-detail overlay panel
    const panel = document.getElementById('unit-detail-panel');
    if (!panel) return;

    panel.innerHTML = `
      <div class="udp-inner">
        <!-- Header -->
        <div class="udp-header">
          <div>
            <div class="udp-label">Unit ${unitId}</div>
            <div class="udp-title">${unit.title}</div>
            <div class="udp-meta">📚 ${unitVocab.length} từ vựng</div>
          </div>
          <button class="udp-close" onclick="App.closeUnitPanel()">✕</button>
        </div>

        <!-- Progress summary -->
        <div class="udp-progress-row">
          <div class="udp-prog-block">
            <div class="udp-prog-label">Từ vựng</div>
            <div class="udp-prog-bar-bg"><div class="udp-prog-bar-fill" style="width:${vocabPct}%;background:var(--accent-3)"></div></div>
            <div class="udp-prog-val" style="color:var(--accent-3)">${vocabPct}%</div>
          </div>
          <div class="udp-prog-block">
            <div class="udp-prog-label">Kiểm tra</div>
            <div class="udp-prog-bar-bg"><div class="udp-prog-bar-fill" style="width:${unitPct}%;background:${done?'var(--success)':'var(--accent-2)'}"></div></div>
            <div class="udp-prog-val" style="color:${done?'var(--success)':unitPct>0?'var(--warning)':'var(--text-muted)'}">${unitPct > 0 ? unitPct + '%' : '—'}</div>
          </div>
        </div>

        <!-- Action buttons — always visible at top -->
        <div class="udp-actions">
          <button class="udp-btn udp-btn-fc" onclick="App.openUnitFlashcard(${unitId})">
            🃏 Flashcard
          </button>
          <button class="udp-btn udp-btn-quiz ${step2done ? '' : 'udp-btn-dim'}" onclick="App.startUnitQuizFromPage(${unitId})">
            ${done ? '🔁 Ôn lại quiz' : '✏️ Bắt đầu quiz'}
          </button>
        </div>
        ${!step2done ? '<div class="udp-hint">💡 Luyện Flashcard trước để quiz hiệu quả hơn</div>' : ''}

        <!-- Vocab reading section -->
        <div class="udp-section-label">👀 Từ vựng — đọc lướt làm quen</div>
        <div class="udp-vocab">
          ${Object.entries(byCategory).map(([cat, words]) => `
            <div class="udp-cat-head">
              <span class="udp-cat-tag">${cat}</span>
              <span class="udp-cat-count">${words.length} từ</span>
            </div>
            ${words.map(v => {
              const isKnown = knownIds.has(v.id);
              return `
                <div class="udp-word-row ${isKnown ? 'udp-row-known' : ''}">
                  <div class="udp-word-main">
                    <span class="udp-word">${v.word}</span>
                    <span class="udp-type">${v.type}</span>
                    <span class="udp-phonetic">${v.phonetic}</span>
                    ${isKnown ? '<span class="udp-known-tick">✓</span>' : ''}
                  </div>
                  <div class="udp-meaning">${v.meaning}</div>
                  <div class="udp-example">"${v.example}"</div>
                  <button class="udp-speak" onclick="event.stopPropagation();window.speechSynthesis&&window.speechSynthesis.speak(Object.assign(new SpeechSynthesisUtterance('${v.word.replace(/'/g,"\\'")}'),{lang:'en-US',rate:0.85}))">🔊</button>
                </div>`;
            }).join('')}
          `).join('')}
          ${unitVocab.length === 0 ? '<div class="udp-empty">Chưa có từ vựng cho unit này.</div>' : ''}
        </div>
      </div>`;

    // Show overlay
    const overlay = document.getElementById('unit-detail-overlay');
    if (overlay) {
      overlay.style.display = 'flex';
      overlay.classList.add('udp-open');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeUnitPanel() {
    const overlay = document.getElementById('unit-detail-overlay');
    if (overlay) {
      overlay.classList.remove('udp-open');
      document.body.style.overflow = '';
      setTimeout(() => { overlay.style.display = 'none'; }, 280);
    }
  }

  function openUnitFlashcard(unitId) {
    const unit = UNIT_METADATA.find(u => u.id === unitId);
    if (!unit) return;
    const keywords = unit.vocab.map(k => k.toLowerCase());
    const pool = DB.vocab.filter(v => keywords.some(k => v.category.toLowerCase().includes(k)));
    if (pool.length === 0) { showToast('Chưa có từ vựng cho Unit này.', '⚠️'); return; }

    // Switch to vocab page and open flashcard with this pool
    vocabFilter = 'All';
    fcDeck = buildSrsDeck(pool);
    fcIndex = 0; fcKnown = 0; fcReview = 0; fcSkip = 0; fcFlipped = false;

    const overlay = document.getElementById('flashcard-overlay');
    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    renderFcCardSRS();
    showToast(`Flashcard Unit ${unitId}: ${pool.length} từ`, '🃏');
  }

  function startUnitQuizFromPage(unitId) {
    // Trigger unit quiz and navigate to practice
    navigate('practice');
    requestAnimationFrame(() => {
      generateUnitQuiz(unitId, undefined);
    });
  }

  // ─── Stats Page ───────────────────────────────────────────
  function renderStatsPage() {
    const el = document.getElementById('stats-content');
    if (!el) return;

    const prog        = getProgress();
    const sd          = getStreakData();
    const xp          = getXP();
    const li          = getLevelInfo(xp);
    const histSet     = new Set(sd.history || []);
    const unlocked    = getUnlocked();
    const srsAll      = getSrsData();
    const now         = Date.now();
    const srsDue      = Object.values(srsAll).filter(c => c.dueDate <= now).length;
    const unitsDone   = Object.values(prog.unitScores||{}).filter(s => s.pct >= 70).length;
    const wrongCount  = getWrongIds().size;
    const totalWrong  = (prog.totalAnswered||0) - (prog.totalCorrect||0);

    const heatDays = Array.from({length:70}, (_,i) => {
      const d = new Date(); d.setDate(d.getDate() - (69-i));
      const str = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      return `<div class="hm-cell ${histSet.has(str)?'hm-4':''} ${str===todayStr()?'hm-today':''}" title="${str}"></div>`;
    }).join('');

    const weeklyScores = prog.weeklyScores || [];
    const chartBars = weeklyScores.slice(-7).map((s,i) => {
      const maxS = Math.max(...weeklyScores.slice(-7), 1);
      return `<div class="bar-col"><div class="bar-body" style="height:${Math.round(s/maxS*100)}%"></div><div class="bar-label">T${i+1}</div></div>`;
    }).join('') || `<div style="color:var(--text-muted);font-size:.82rem;padding:10px">Chưa có dữ liệu</div>`;

    function achProg(a) {
      try { return a.progress ? a.progress(prog) : null; } catch { return null; }
    }

    const groups = [
      { label: '📝 Luyện tập', ids: ['first_quiz','test10','test30','perfect','acc80'] },
      { label: '📖 Từ vựng',   ids: ['vocab50','vocab200','vocab500','srs20','srs_master'] },
      { label: '📗 Units',     ids: ['unit_3','unit_10','unit_all','unit_perfect'] },
      { label: '🔥 Streak',    ids: ['streak3','streak7','streak14','streak30'] },
      { label: '⚡ XP',        ids: ['xp500','xp2000','xp5000'] },
      { label: '✅ Câu hỏi',   ids: ['q100','q500','q1000'] },
    ];

    // ── Weak spots: tính trước, dùng string concat (không template-in-template) ──
    const TL = {
      'word-form':'Từ loại','verb-tense':'Thì động từ','prepositions':'Giới từ',
      'conjunction':'Liên từ','passive':'Bị động','pronoun':'Đại từ & Mạo từ',
      'modal':'Modal Verbs','gerund-infinitive':'Gerund / Infinitive',
      'comparison':'So sánh','participles':'Phân từ','subject-verb':'Chủ – Vị',
      'noun-clauses':'Mệnh đề DT','adverb-time':'TT thời gian',
      'vocabulary-context':'Từ vựng NGC','inversion':'Đảo ngữ',
      'quantifiers':'Số lượng','prep-structures':'Cụm GT',
      'business-english':'Văn TM','subjunctive':'Cầu khiến',
      'conditionals':'Điều kiện','relative-clause':'MĐ QH','vocabulary':'Từ vựng',
    };
    const typeStats  = prog.typeStats || {};
    const typeSorted = Object.entries(typeStats)
      .filter(([,s]) => s.total >= 5)
      .map(([t,s]) => ({ t, pct: Math.round(s.correct/s.total*100), correct:s.correct, total:s.total }))
      .sort((a,b) => a.pct - b.pct);
    const weakSpots   = typeSorted.slice(0, 4);
    const strongSpots = [...typeSorted].reverse().slice(0, 3);
    const dueToday    = qSrsDueCount();

    // Build weak HTML using string concat (avoids nested template literal escaping)
    let weakHtml = '';
    if (weakSpots.length > 0) {
      weakHtml = '<div style="font-size:.78rem;font-weight:700;color:var(--text-secondary);text-transform:uppercase;letter-spacing:.5px;margin:20px 0 10px">⚠️ Điểm yếu cần ôn</div>';
      weakSpots.forEach(function(ws) {
        var col = ws.pct >= 70 ? '#f59e0b' : '#ef4444';
        weakHtml += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;padding:8px 12px;background:rgba(239,68,68,.05);border-radius:8px;border:1px solid rgba(239,68,68,.12)">'
          + '<div style="flex:1;min-width:0">'
          + '<div style="font-size:.82rem;font-weight:600;color:var(--text-primary);margin-bottom:3px">' + (TL[ws.t]||ws.t) + '</div>'
          + '<div style="background:var(--bg-primary);border-radius:3px;height:5px;overflow:hidden">'
          + '<div style="height:100%;width:' + ws.pct + '%;background:' + col + ';border-radius:3px"></div></div></div>'
          + '<div style="text-align:right;flex-shrink:0">'
          + '<div style="font-size:.88rem;font-weight:700;color:' + col + '">' + ws.pct + '%</div>'
          + '<div style="font-size:.68rem;color:var(--text-muted)">' + ws.correct + '/' + ws.total + ' đúng</div></div>'
          + '<button data-drill="' + ws.t + '" class="ws-drill-btn" style="flex-shrink:0;padding:4px 10px;font-size:.7rem;font-weight:600;border-radius:6px;border:1px solid rgba(239,68,68,.3);background:transparent;color:#f87171;cursor:pointer">Ôn lại</button>'
          + '</div>';
      });
    }

    let strongHtml = '';
    if (strongSpots.length > 0) {
      strongHtml = '<div style="font-size:.78rem;font-weight:700;color:var(--text-secondary);text-transform:uppercase;letter-spacing:.5px;margin:16px 0 8px">💪 Điểm mạnh</div>'
        + '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:4px">';
      strongSpots.forEach(function(ss) {
        strongHtml += '<div style="padding:5px 12px;background:rgba(16,185,129,.08);border:1px solid rgba(16,185,129,.2);border-radius:20px;font-size:.78rem;color:#10b981;font-weight:600">'
          + (TL[ss.t]||ss.t) + ' · ' + ss.pct + '%</div>';
      });
      strongHtml += '</div>';
    }

    const srsColor  = dueToday > 0 ? '#fbbf24' : '#10b981';
    const srsBg     = dueToday > 0 ? 'rgba(251,191,36,.07)' : 'rgba(16,185,129,.06)';
    const srsBorder = dueToday > 0 ? 'rgba(251,191,36,.2)'  : 'rgba(16,185,129,.2)';
    const srsBtnHtml = dueToday > 0
      ? '<button id="btn-srs-due-review" style="padding:6px 14px;font-size:.78rem;font-weight:600;border-radius:6px;border:1px solid rgba(251,191,36,.4);background:transparent;color:#fbbf24;cursor:pointer;white-space:nowrap">Ôn ngay →</button>'
      : '';
    const srsHtml = '<div style="font-size:.78rem;font-weight:700;color:var(--text-secondary);text-transform:uppercase;letter-spacing:.5px;margin:16px 0 8px">🔄 Ôn câu sai hôm nay (SRS)</div>'
      + '<div style="padding:10px 14px;background:' + srsBg + ';border:1px solid ' + srsBorder + ';border-radius:8px;display:flex;align-items:center;justify-content:space-between">'
      + '<div>'
      + '<div style="font-size:.9rem;font-weight:700;color:' + srsColor + '">'
      + (dueToday > 0 ? dueToday + ' câu cần ôn hôm nay' : '✓ Đã ôn hết câu sai hôm nay!')
      + '</div>'
      + '<div style="font-size:.72rem;color:var(--text-muted);margin-top:2px">Tổng câu đang theo dõi: ' + wrongCount + '</div>'
      + '</div>' + srsBtnHtml + '</div>';

    el.innerHTML = `
      <div class="stats-hero">
        <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">
          <div style="font-size:2.8rem">${li.level.name.split(' ').pop()}</div>
          <div style="flex:1;min-width:160px">
            <div style="font-size:1.2rem;font-weight:900">${li.level.name}</div>
            <div style="font-size:.8rem;color:var(--text-secondary);margin:3px 0">${xp} XP</div>
            <div class="xp-track" style="max-width:240px"><div class="xp-fill" style="width:${li.pct}%"></div></div>
            <div style="font-size:.7rem;color:var(--text-muted);margin-top:3px">${li.next ? `${li.next.min-xp} XP đến ${li.next.name}` : '🏆 Cấp tối đa!'}</div>
          </div>
          <div style="text-align:center">
            <div style="font-size:1.8rem;font-weight:900;color:#fbbf24">${sd.streak||0} 🔥</div>
            <div style="font-size:.7rem;color:var(--text-muted)">Streak · Best: ${sd.best||0} ngày</div>
          </div>
        </div>
      </div>

      <div style="font-size:.78rem;font-weight:700;color:var(--text-secondary);
                  text-transform:uppercase;letter-spacing:.5px;margin:18px 0 10px">📊 Bộ đếm học tập</div>
      <div class="stats-grid">
        <div class="stats-tile">
          <div class="stats-tile-num" style="color:var(--accent)">${prog.testsCompleted||0}</div>
          <div class="stats-tile-label">Bài thi đã làm</div>
        </div>
        <div class="stats-tile">
          <div class="stats-tile-num" style="color:var(--success)">${prog.totalCorrect||0}</div>
          <div class="stats-tile-label">Câu trả lời đúng</div>
        </div>
        <div class="stats-tile">
          <div class="stats-tile-num" style="color:var(--danger)">${totalWrong}</div>
          <div class="stats-tile-label">Câu trả lời sai</div>
          ${wrongCount>0 ? `<div style="margin-top:6px">
            <button class="btn btn-outline btn-sm" onclick="App.startWrongReview()"
              style="font-size:.7rem;border-color:var(--danger);color:var(--danger)">
              Ôn ${wrongCount} câu sai
            </button></div>` : ''}
        </div>
        <div class="stats-tile">
          <div class="stats-tile-num">${prog.totalAnswered||0}</div>
          <div class="stats-tile-label">Tổng câu đã làm</div>
        </div>
        <div class="stats-tile">
          <div class="stats-tile-num" style="color:var(--accent)">${prog.accuracy||0}%</div>
          <div class="stats-tile-label">Độ chính xác</div>
          <div style="margin-top:6px;background:var(--bg-primary);border-radius:4px;height:4px;overflow:hidden">
            <div style="height:100%;width:${prog.accuracy||0}%;background:var(--accent);border-radius:4px"></div>
          </div>
        </div>
        <div class="stats-tile">
          <div class="stats-tile-num" style="color:var(--success)">${prog.vocabSeen||0}</div>
          <div class="stats-tile-label">Từ vựng đã học</div>
          <div style="margin-top:6px;background:var(--bg-primary);border-radius:4px;height:4px;overflow:hidden">
            <div style="height:100%;width:${Math.min(100,Math.round((prog.vocabSeen||0)/Math.max(DB.vocab.length,1)*100))}%;background:var(--success);border-radius:4px"></div>
          </div>
        </div>
        <div class="stats-tile">
          <div class="stats-tile-num">${unitsDone}/${UNIT_METADATA.length}</div>
          <div class="stats-tile-label">Units hoàn thành</div>
          <div style="margin-top:6px;background:var(--bg-primary);border-radius:4px;height:4px;overflow:hidden">
            <div style="height:100%;width:${Math.round(unitsDone/UNIT_METADATA.length*100)}%;background:#8b5cf6;border-radius:4px"></div>
          </div>
        </div>
        <div class="stats-tile">
          <div class="stats-tile-num" style="color:#fbbf24">${srsDue}</div>
          <div class="stats-tile-label">Thẻ SRS đến hạn</div>
          <div style="margin-top:6px;font-size:.7rem;color:${srsDue>0?'var(--warning)':'var(--success)'}">
            ${srsDue>0 ? '→ Vào Từ vựng để ôn' : '✓ Đã ôn hết'}
          </div>
        </div>
      </div>

      <div id="stats-weak-wrap"></div>

      <div class="heatmap-wrap">
        <div class="heatmap-title">📅 Lịch học 70 ngày gần nhất</div>
        <div class="heatmap-grid">${heatDays}</div>
        <div style="font-size:.7rem;color:var(--text-muted);margin-top:6px">Ô màu = ngày học · Viền vàng = hôm nay</div>
      </div>

      <div class="progress-chart-wrap">
        <div class="heatmap-title">📈 Bài thi theo tuần</div>
        <div class="bar-chart">${chartBars}</div>
      </div>

      <div style="font-size:.78rem;font-weight:700;color:var(--text-secondary);
                  text-transform:uppercase;letter-spacing:.5px;margin:20px 0 12px">
        🏅 Thành tích (${unlocked.size}/${ACHIEVEMENTS.length})
      </div>

      ${groups.map(g => {
        const groupAchs = ACHIEVEMENTS.filter(a => g.ids.includes(a.id));
        return `<div style="margin-bottom:18px">
          <div style="font-size:.78rem;font-weight:700;color:var(--text-muted);margin-bottom:8px">${g.label}</div>
          <div class="achievement-grid">
            ${groupAchs.map(a => {
              const isUnlocked = unlocked.has(a.id);
              const pd = achProg(a);
              const pct = pd ? Math.round(pd.cur/pd.max*100) : 0;
              const label = pd ? (pd.unit ? `${pd.cur}${pd.unit}/${pd.max}${pd.unit}` : `${pd.cur}/${pd.max}`) : '';
              return `<div class="achievement-card ${isUnlocked?'unlocked':'locked'}">
                <div class="ach-icon">${a.icon}</div>
                <div style="flex:1;min-width:0">
                  <div class="ach-name">${a.name}</div>
                  <div class="ach-desc">${a.desc}</div>
                  ${isUnlocked
                    ? '<div style="font-size:.65rem;color:var(--success);margin-top:3px">✓ Đã mở khóa</div>'
                    : pd ? `<div style="margin-top:5px">
                        <div style="display:flex;justify-content:space-between;font-size:.65rem;color:var(--text-muted);margin-bottom:2px">
                          <span>${label}</span><span>${pct}%</span>
                        </div>
                        <div style="background:var(--bg-primary);border-radius:3px;height:4px;overflow:hidden">
                          <div style="height:100%;width:${pct}%;background:var(--accent);border-radius:3px"></div>
                        </div>
                      </div>` : ''}
                </div>
              </div>`;
            }).join('')}
          </div>
        </div>`;
      }).join('')}

      <div style="text-align:center;margin-top:16px">
        <button class="btn btn-outline btn-sm" onclick="App.resetAllData()"
          style="border-color:var(--danger);color:var(--danger);font-size:.75rem">
          🗑 Xóa toàn bộ dữ liệu
        </button>
      </div>`;

    // Inject weak/strong/srs HTML into placeholder (safe, no template-in-template)
    const ww = document.getElementById('stats-weak-wrap');
    if (ww) ww.innerHTML = weakHtml + strongHtml + srsHtml;

    // Bind drill buttons via data attribute (safe, no inline JS string escaping)
    el.querySelectorAll('.ws-drill-btn').forEach(function(btn) {
      btn.addEventListener('click', function() { App.startGrammarDrill(btn.dataset.drill); });
    });
    const srsBtn = document.getElementById('btn-srs-due-review');
    if (srsBtn) srsBtn.addEventListener('click', function() { App.startWrongReview(true); });
  }

  function resetAllData() {
    if (!confirm('Bạn có chắc muốn xóa toàn bộ tiến trình, XP, streak và SRS? Hành động này không thể hoàn tác.')) return;
    ['toeic_progress','toeic_srs','toeic_q_srs','toeic_xp','toeic_streak','toeic_ach','toeic_grammar_stats'].forEach(k => localStorage.removeItem(k));
    renderHomeDashboard();
    renderStreakBanner();
    renderStatsPage();
    showToast('Đã xóa toàn bộ dữ liệu.', '🗑');
  }

  // ─── Hook into submitQuiz to award XP + save unit score ───
  const _origUpdateProgress = updateProgress;
  function updateProgressGamified(correct, total) {
    _origUpdateProgress(correct, total);
    const pct = Math.round(correct / total * 100);
    // XP: 1 per correct answer + bonus for accuracy
    const bonus = pct >= 90 ? 15 : pct >= 75 ? 8 : pct >= 60 ? 4 : 0;
    addXP(correct + bonus, 'quiz-' + Date.now());

    // Check perfect score
    if (pct === 100) {
      const prog = getProgress();
      saveProgress({ hasPerfect: true });
    }

    // Save unit score if unit mode
    if (quizMode === 'unit-review') {
      // Find which unit triggered (stored in quizMode context)
      const prog = getProgress();
      const unitScores = prog.unitScores || {};
      if (_currentUnitId) {
        const prev = unitScores[_currentUnitId];
        if (!prev || pct > prev.pct) {
          unitScores[_currentUnitId] = { pct, correct, total, date: todayStr() };
          saveProgress({ unitScores });
        }
      }
    }

    // Track weekly scores
    const prog   = getProgress();
    const week   = getWeekNumber();
    const weekly = prog.weeklyData || {};
    const wKey   = week.year + '-' + week.week;
    weekly[wKey] = (weekly[wKey] || 0) + 1;
    // Convert to array for chart
    const weeklyScores = Object.values(weekly).slice(-10);
    saveProgress({ weeklyData: weekly, weeklyScores });

    recordActivity();
    checkAchievements();
  }

  let _currentUnitId = null;

  function getWeekNumber() {
    const d = new Date();
    const jan1 = new Date(d.getFullYear(), 0, 1);
    const week = Math.ceil(((d - jan1) / 864e5 + jan1.getDay() + 1) / 7);
    return { year: d.getFullYear(), week };
  }

  // ─── Hook navigate to render stats/units on page open ─────
  const _origNavigate = navigate;
  function navigateGamified(page) {
    _origNavigate(page);
    if (page === 'stats')  { renderStatsPage(); }
    if (page === 'units')  { setupUnitsPage(); }
    if (page === 'home')   { renderStreakBanner(); }
    if (page === 'vocab')  { updateDictHeroStats && updateDictHeroStats(); }
    // FAB: chỉ hiện trên trang Home
    const fab = document.getElementById('home-fab');
    if (fab) {
      if (page === 'home') {
        fab.classList.add('fab-visible');
      } else {
        fab.classList.remove('fab-visible');
      }
    }
  }

  // ─── Modal ───
  function showModal(content, title = '') {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML    = content;
    document.getElementById('app-modal').classList.add('open');
  }
  function closeModal() { document.getElementById('app-modal').classList.remove('open'); }

  // ─── Utilities ───
  function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
  function escapeHtml(text) {
    return text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
  function showToast(msg, icon = 'ℹ️') {
    const t = document.getElementById('toast');
    t.innerHTML = `${icon} ${msg}`;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
  }

  // ═══════════════════════════════════════════════════════════
  //  GAME 1 — SPEED ROUND
  //  Hiển thị từ + 1 nghĩa (đúng hoặc sai), người học chọn
  //  Đúng/Sai trong 8 giây. 10 từ mỗi vòng.
  // ═══════════════════════════════════════════════════════════
  let vsrDeck = [], vsrIndex = 0, vsrCorrect = 0, vsrWrong = 0, vsrStreak = 0;
  let vsrTimer = null, vsrTimeLeft = 0, vsrCurrentIsTrue = false;
  const VSR_TIME = 8000;   // 8 giây mỗi từ
  const VSR_ROUND = 10;    // 10 từ mỗi vòng

  function openSpeedRound() {
    const pool = getVocabDeck();
    if (pool.length < 4) { showToast('Cần ít nhất 4 từ.', '⚠️'); return; }
    vsrDeck = shuffleArray([...pool]).slice(0, VSR_ROUND);
    vsrIndex = 0; vsrCorrect = 0; vsrWrong = 0; vsrStreak = 0;
    document.getElementById('vspeed-overlay').style.display = 'flex';
    document.body.style.overflow = 'hidden';
    vsrRenderCard();
  }

  function closeSpeedRound() {
    clearInterval(vsrTimer);
    document.getElementById('vspeed-overlay').style.display = 'none';
    document.body.style.overflow = '';
    if (vsrCorrect + vsrWrong > 0)
      showToast(`Speed Round: ${vsrCorrect} đúng · ${vsrWrong} sai`, '⚡');
  }

  function vsrRenderCard() {
    clearInterval(vsrTimer);
    if (vsrIndex >= vsrDeck.length) { vsrShowComplete(); return; }

    const v = vsrDeck[vsrIndex];
    // 50% chance: show correct meaning; 50%: show a wrong meaning
    vsrCurrentIsTrue = Math.random() < 0.5;
    let shownMeaning;
    if (vsrCurrentIsTrue) {
      shownMeaning = v.meaning;
    } else {
      // Pick a distractor from a different word
      const others = vsrDeck.filter(x => x.id !== v.id);
      shownMeaning = others[Math.floor(Math.random() * others.length)]?.meaning || v.meaning;
      // Ensure it's actually different
      if (shownMeaning === v.meaning) vsrCurrentIsTrue = true;
    }

    document.getElementById('vsr-word').textContent     = v.word;
    document.getElementById('vsr-phonetic').textContent = v.phonetic;
    document.getElementById('vsr-type').textContent     = v.type.toUpperCase();
    document.getElementById('vsr-meaning-shown').textContent = shownMeaning;
    document.getElementById('vsr-feedback').textContent = '';
    document.getElementById('vsr-round-label').textContent = `${vsrIndex + 1} / ${vsrDeck.length}`;
    document.getElementById('vsr-remaining').textContent = vsrDeck.length - vsrIndex;

    // Enable buttons
    document.getElementById('vsr-btn-true').disabled  = false;
    document.getElementById('vsr-btn-false').disabled = false;
    document.getElementById('vsr-btn-true').className  = 'vsr-choice-btn vsr-true';
    document.getElementById('vsr-btn-false').className = 'vsr-choice-btn vsr-false';

    // Timer bar
    vsrTimeLeft = VSR_TIME;
    const bar = document.getElementById('vsr-timer-bar');
    bar.style.transition = 'none';
    bar.style.width = '100%';
    bar.style.background = 'linear-gradient(90deg,#fbbf24,#f59e0b)';
    requestAnimationFrame(() => {
      bar.style.transition = `width ${VSR_TIME}ms linear`;
      bar.style.width = '0%';
    });

    vsrTimer = setInterval(() => {
      vsrTimeLeft -= 100;
      if (vsrTimeLeft <= 2000) bar.style.background = 'linear-gradient(90deg,#f43f5e,#e11d48)';
      if (vsrTimeLeft <= 0) {
        clearInterval(vsrTimer);
        vsrTimeUp();
      }
    }, 100);

    // Mark seen
    const prog = getProgress();
    const seen = new Set(prog.vocabSeen_ids || []);
    seen.add(v.id);
    saveProgress({ vocabSeen: seen.size, vocabSeen_ids: [...seen] });
  }

  function vsrAnswer(userSaysTrue) {
    clearInterval(vsrTimer);
    const v = vsrDeck[vsrIndex];
    const correct = (userSaysTrue === vsrCurrentIsTrue);

    document.getElementById('vsr-btn-true').disabled  = true;
    document.getElementById('vsr-btn-false').disabled = true;

    const fb = document.getElementById('vsr-feedback');
    if (correct) {
      vsrCorrect++; vsrStreak++;
      fb.style.color = 'var(--success)';
      fb.textContent = vsrStreak >= 3 ? `🔥 Streak ${vsrStreak}! Chính xác!` : '✅ Chính xác!';
      addXP(2, v.id + '-sr');
    } else {
      vsrWrong++; vsrStreak = 0;
      fb.style.color = 'var(--danger)';
      fb.textContent = `❌ Sai! Nghĩa đúng: "${v.meaning}"`;
      const prog = getProgress();
      const review = new Set(prog.fcReview_ids || []);
      review.add(v.id);
      saveProgress({ fcReview_ids: [...review] });
    }

    document.getElementById('vsr-correct').textContent = vsrCorrect;
    document.getElementById('vsr-wrong').textContent   = vsrWrong;
    document.getElementById('vsr-streak').textContent  = vsrStreak;

    vsrIndex++;
    setTimeout(vsrRenderCard, 1100);
  }

  function vsrTimeUp() {
    const v = vsrDeck[vsrIndex];
    vsrWrong++; vsrStreak = 0;
    document.getElementById('vsr-btn-true').disabled  = true;
    document.getElementById('vsr-btn-false').disabled = true;
    const fb = document.getElementById('vsr-feedback');
    fb.style.color = 'var(--warning)';
    fb.textContent = `⏰ Hết giờ! Nghĩa đúng: "${v.meaning}"`;
    document.getElementById('vsr-correct').textContent = vsrCorrect;
    document.getElementById('vsr-wrong').textContent   = vsrWrong;
    document.getElementById('vsr-streak').textContent  = vsrStreak;
    vsrIndex++;
    setTimeout(vsrRenderCard, 1300);
  }

  function vsrShowComplete() {
    clearInterval(vsrTimer);
    const pct = Math.round(vsrCorrect / vsrDeck.length * 100);
    const emoji = pct >= 80 ? '🏆' : pct >= 60 ? '👍' : '💪';
    const bar = document.getElementById('vsr-timer-bar');
    if (bar) { bar.style.transition = 'none'; bar.style.width = '100%'; bar.style.background = 'var(--success)'; }

    document.getElementById('vsr-word').style.fontSize = '2.5rem';
    document.getElementById('vsr-word').textContent    = emoji;
    document.getElementById('vsr-phonetic').textContent = '';
    document.getElementById('vsr-type').textContent     = '';
    document.getElementById('vsr-meaning-shown').textContent = '';
    document.getElementById('vsr-round-label').textContent   = 'Kết thúc';
    document.getElementById('vsr-remaining').textContent     = '0';

    const fb = document.getElementById('vsr-feedback');
    fb.style.color   = pct >= 60 ? 'var(--success)' : 'var(--warning)';
    fb.textContent   = `Vòng kết thúc! ${vsrCorrect}/${vsrDeck.length} đúng (${pct}%)`;

    // Replace True/False buttons with Replay button
    const trueBtn  = document.getElementById('vsr-btn-true');
    const falseBtn = document.getElementById('vsr-btn-false');
    if (trueBtn)  trueBtn.style.display  = 'none';
    if (falseBtn) falseBtn.style.display = 'none';

    const replayWrap = document.createElement('div');
    replayWrap.style.cssText = 'grid-column:1/-1;margin-top:4px';
    replayWrap.innerHTML = `<button class="btn btn-primary" style="width:100%" onclick="App.openSpeedRound()">🔄 Chơi lại vòng mới</button>`;
    trueBtn?.parentNode?.appendChild(replayWrap);
  }

  // ═══════════════════════════════════════════════════════════
  //  GAME 2 — WORD CHAIN
  //  Câu ví dụ thực tế có chỗ blank, chọn từ đúng từ word bank.
  //  Giống Part 5 nhưng có context đoạn văn ngắn.
  // ═══════════════════════════════════════════════════════════
  let vwcDeck = [], vwcIndex = 0, vwcCorrect = 0, vwcWrong = 0;

  function openWordChain() {
    const pool = getVocabDeck().filter(v => v.example && v.example.toLowerCase().includes(v.word.toLowerCase()));
    if (pool.length < 4) { showToast('Không đủ câu ví dụ cho Word Chain.', '⚠️'); return; }
    vwcDeck = shuffleArray([...pool]);
    vwcIndex = 0; vwcCorrect = 0; vwcWrong = 0;
    document.getElementById('vchain-overlay').style.display = 'flex';
    document.body.style.overflow = 'hidden';
    vwcRenderCard();
  }

  function closeWordChain() {
    document.getElementById('vchain-overlay').style.display = 'none';
    document.body.style.overflow = '';
    if (vwcCorrect + vwcWrong > 0)
      showToast(`Word Chain: ${vwcCorrect} đúng · ${vwcWrong} sai`, '🧩');
  }

  function vwcRenderCard() {
    if (vwcIndex >= vwcDeck.length) {
      vwcDeck = shuffleArray([...vwcDeck]);
      vwcIndex = 0;
    }
    const v = vwcDeck[vwcIndex];

    // Build sentence with blank
    const regex = new RegExp(v.word.replace(/[-/\\^$*+?.()|[\]{}]/g,'\\$&'), 'i');
    const blanked = v.example.replace(regex, '<span class="vwc-blank" id="vwc-blank-slot">_______</span>');

    // Context hint = category + type
    document.getElementById('vwc-sentence').innerHTML = blanked;
    document.getElementById('vwc-context-hint').textContent =
      `Gợi ý: [${v.type}] · Chủ đề: ${v.category}`;

    // Progress
    document.getElementById('vwc-progress').textContent = `${vwcIndex + 1} / ${vwcDeck.length}`;
    document.getElementById('vwc-progress-bar').style.width =
      Math.round(vwcIndex / vwcDeck.length * 100) + '%';

    // Build word bank: correct + 4 distractors (same category preferred)
    let distractors = vwcDeck.filter(x => x.id !== v.id && x.category === v.category);
    if (distractors.length < 4) distractors = vwcDeck.filter(x => x.id !== v.id);
    shuffleArray(distractors);
    const opts = shuffleArray([v, ...distractors.slice(0, 4)]);

    document.getElementById('vwc-word-bank').innerHTML = opts.map(opt =>
      `<button class="vwc-chip" onclick="App.vwcSelect('${opt.word.replace(/'/g,"\\'")}','${v.word.replace(/'/g,"\\'")}')">
        ${opt.word}
        <span style="font-size:.65rem;color:var(--text-muted);margin-left:4px">[${opt.type}]</span>
      </button>`
    ).join('');

    document.getElementById('vwc-result-box').style.display = 'none';
    document.getElementById('vwc-next-wrap').style.display  = 'none';
    document.getElementById('vwc-correct').textContent = vwcCorrect;
    document.getElementById('vwc-wrong').textContent   = vwcWrong;

    // Mark seen
    const prog = getProgress();
    const seen = new Set(prog.vocabSeen_ids || []);
    seen.add(v.id);
    saveProgress({ vocabSeen: seen.size, vocabSeen_ids: [...seen] });
  }

  function vwcSelect(chosen, correct) {
    // Disable all chips
    document.querySelectorAll('.vwc-chip').forEach(c => c.disabled = true);
    const v = vwcDeck[vwcIndex];
    const isRight = chosen.toLowerCase() === correct.toLowerCase();

    // Fill the blank slot with chosen word
    const slot = document.getElementById('vwc-blank-slot');
    if (slot) {
      slot.textContent = chosen;
      slot.style.color = isRight ? 'var(--success)' : 'var(--danger)';
      slot.style.borderBottom = `2px solid ${isRight ? 'var(--success)' : 'var(--danger)'}`;
      slot.style.fontWeight = '700';
    }

    // Highlight chosen chip
    document.querySelectorAll('.vwc-chip').forEach(c => {
      if (c.textContent.trim().startsWith(chosen)) {
        c.classList.add(isRight ? 'vwc-chip-correct' : 'vwc-chip-wrong');
      }
      if (!isRight && c.textContent.trim().startsWith(correct)) {
        c.classList.add('vwc-chip-correct');
      }
    });

    if (isRight) {
      vwcCorrect++;
      addXP(3, v.id + '-wc');
    } else {
      vwcWrong++;
      const prog = getProgress();
      const review = new Set(prog.fcReview_ids || []);
      review.add(v.id);
      saveProgress({ fcReview_ids: [...review] });
    }

    const rb = document.getElementById('vwc-result-box');
    rb.className = 'vquiz-result-box ' + (isRight ? 'result-correct' : 'result-wrong');
    rb.innerHTML = isRight
      ? `✅ <strong>Chính xác!</strong> — <em>${v.meaning}</em>`
      : `❌ Đáp án đúng: <strong style="color:var(--success)">${correct}</strong> — <em>${v.meaning}</em>`;
    rb.style.display = 'block';

    document.getElementById('vwc-correct').textContent = vwcCorrect;
    document.getElementById('vwc-wrong').textContent   = vwcWrong;
    document.getElementById('vwc-next-wrap').style.display = 'block';
  }

  function vwcNext() {
    vwcIndex++;
    vwcRenderCard();
  }

  // ─── Public API (expose to teacher-core.js too) ───
  return {
    init, navigate: navigateGamified,
    showVocabDetail, selectAnswer, closeModal,
    handleHomeworkCode, jumpToQuestion,
    goToGrammar, goToPracticeByGrammar,
    startWrongReview, startGrammarDrill, startGrammarDrill10,
    flipCard, rateCard, rateCardSRS, skipCard, closeFlashcard, restartReviewCards,
    // Vocab learning modes
    openVocabQuiz, closeVocabQuiz, vqSelect, vqNext,
    openVocabFill, closeVocabFill, vfSelect, vfNext,
    openVocabMatch, closeVocabMatch, vmTileClick, vmNewRound,
    // New games
    openSpeedRound, closeSpeedRound, vsrAnswer,
    openWordChain, closeWordChain, vwcSelect, vwcNext,
    showUnitDetail, closeUnitPanel, openUnitFlashcard, startUnitQuizFromPage,
    resetAllData,
    getDB: () => DB,
    getFlatQuestions: () => flatQuestions,
    getUnitMetadata: () => UNIT_METADATA,
    getCurrentUnitId: () => _currentUnitId,
    shuffleArray,
    seededShuffle,
    mulberry32,
    generateExamFromCode,
  };
})();

document.addEventListener('DOMContentLoaded', () => {
  App.init();
  document.getElementById('app-modal').addEventListener('click', function(e) {
    if (e.target === this) App.closeModal();
  });
  // Hiện FAB ngay khi load — trang home là mặc định
  const fab = document.getElementById('home-fab');
  if (fab) setTimeout(() => fab.classList.add('fab-visible'), 300);
});
