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
    quick:   { label:"Luyện nhanh",   filter: q => q.part===5 || q.part===6, time:900,  count:20  },
    part5:   { label:"Part 5 Focus",  filter: q => q.part===5,               time:600,  count:30  },
    part6:   { label:"Part 6 Focus",  filter: q => q.part===6,               time:480,  count:16  },
    part7:   { label:"Part 7 Focus",  filter: q => q.part===7,               time:2700, count:54  },
    reading: { label:"Full Reading",  filter: q => true,                     time:4500, count:999 },
  };

  const UNIT_METADATA = [
    { id:1,  title:"Business Foundations",    vocab:["Office","Business"],              grammar:"verb-tense"         },
    { id:2,  title:"Office Life",             vocab:["Workplace","HR"],                 grammar:"passive"            },
    { id:3,  title:"Personnel & HR",          vocab:["Recruitment","Training"],         grammar:"conditionals"       },
    { id:4,  title:"Marketing & Sales",       vocab:["Marketing","Sales"],              grammar:"word-form"          },
    { id:5,  title:"Finance & Budget",        vocab:["Finance","Accounting"],           grammar:"preposition"        }, // fixed: prepositions→preposition (matches question type)
    { id:6,  title:"Tech & Innovation",       vocab:["Tech","Innovation"],              grammar:"conjunction"        },
    { id:7,  title:"Manufacturing & QC",      vocab:["Manufacturing","Production"],     grammar:"pronoun"            },
    { id:8,  title:"Travel & Tourism",        vocab:["Travel","Tourism"],               grammar:"relative-clause"    },
    { id:9,  title:"Corporate Events",        vocab:["Events","Conferences"],           grammar:"modal"              },
    { id:10, title:"Customer Service",        vocab:["Customer","Customer Service"],    grammar:"gerund-infinitive"  },
    { id:11, title:"Logistics",               vocab:["Logistics","Shipping"],           grammar:"comparison"         },
    { id:12, title:"Health & Safety",         vocab:["Health","Safety"],                grammar:"participles"        },
    { id:13, title:"Banking & Investment",    vocab:["Finance","Accounting"],           grammar:"subject-verb"       },
    { id:14, title:"Real Estate",             vocab:["Property","Facilities"],          grammar:"noun-clauses"       },
    { id:15, title:"Media & Communications", vocab:["Media","Communication"],          grammar:"adverb-time"        },
    { id:16, title:"Retail & E-commerce",    vocab:["Sales","E-commerce"],             grammar:"vocabulary-context" },
    { id:17, title:"Research & Development", vocab:["Research","Data"],                grammar:"vocabulary"         }, // fixed: part6-strategy→vocabulary (no Part5 qs with that type)
    { id:18, title:"Professional Training",  vocab:["Training","Education"],           grammar:"vocabulary-context" }, // fixed: part7-strategy→vocabulary-context
    { id:19, title:"Law & Contracts",        vocab:["Legal","Contract"],               grammar:"inversion"          },
    { id:20, title:"Environment & Energy",   vocab:["Environment","Sustainability"],   grammar:"quantifiers"        },
    { id:21, title:"Business Communications",vocab:["Communication","Phrases"],        grammar:"business-english"   },
    { id:22, title:"Corporate Policy",       vocab:["Management","Leadership"],        grammar:"subjunctive"        },
    { id:23, title:"Advanced Structures",    vocab:["General","Advanced"],             grammar:"prep-structures"    },
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
      btn.addEventListener('click', () => navigate(btn.dataset.page));
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

  function buildSmartPool(rawPool) {
    const seen  = getSeenIds();
    const wrong = getWrongIds();
    const unseen      = rawPool.filter(q => q.id && !seen.has(q.id));
    const wrongSeen   = rawPool.filter(q => q.id && seen.has(q.id) && wrong.has(q.id));
    const correctSeen = rawPool.filter(q => q.id && seen.has(q.id) && !wrong.has(q.id));
    const noId        = rawPool.filter(q => !q.id);
    [unseen, wrongSeen, correctSeen, noId].forEach(shuffleArray);
    return [...unseen, ...wrongSeen, ...correctSeen, ...noId];
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
    // flashcard button is handled by SRS version in init()
    renderVocabGrid();
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
    if (inner)   inner.classList.add('flipped');
    if (actions) actions.style.display = 'block';
    // Mark vocab as seen
    const v = fcDeck[fcIndex];
    if (v) {
      const prog = getProgress();
      const seen = new Set(prog.vocabSeen_ids || []);
      seen.add(v.id);
      saveProgress({ vocabSeen: seen.size, vocabSeen_ids: [...seen] });
      document.getElementById('stat-vocab').textContent = seen.size;
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
    setTimeout(renderFcCard, 180);
  }

  function skipCard() {
    fcSkip++;
    updateFcStats();
    fcIndex++;
    setTimeout(renderFcCard, 100);
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
    renderFcCard();
    showToast(`Ôn lại ${fcDeck.length} từ cần ôn`, '🔄');
  }

  function renderVocabGrid() {
    const search   = (document.getElementById('vocab-search')?.value || '').toLowerCase();
    const filtered = DB.vocab.filter(v => {
      const matchCat    = vocabFilter === 'All' || v.category === vocabFilter;
      const matchSearch = !search || v.word.toLowerCase().includes(search) || v.meaning.toLowerCase().includes(search);
      return matchCat && matchSearch;
    });
    const grid = document.getElementById('vocab-grid');
    grid.innerHTML = filtered.length === 0
      ? `<div style="color:var(--text-muted);padding:24px;text-align:center;">Không tìm thấy từ nào.</div>`
      : filtered.map(v => `
        <div class="vocab-card" onclick="App.showVocabDetail(${v.id})">
          <div class="vocab-category"><span class="badge badge-blue">${v.category}</span></div>
          <div class="vocab-word">${v.word}</div>
          <div class="vocab-phonetic">${v.phonetic}</div>
          <div class="vocab-type">[${v.type}]</div>
          <div class="vocab-meaning">${v.meaning}</div>
          <div class="vocab-example">${v.example}</div>
        </div>`).join('');
    document.getElementById('vocab-count').textContent = `${filtered.length} từ`;
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

  // ─── Grammar Page ───
  function setupGrammarPage() {
    const nav = document.getElementById('grammar-nav');
    nav.innerHTML = DB.grammar.map(t => `
      <button class="grammar-topic-btn ${t.id===grammarTopic?'active':''}" data-id="${t.id}">
        ${t.icon} ${t.title}
      </button>`).join('');
    nav.querySelectorAll('.grammar-topic-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.grammar-topic-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        grammarTopic = btn.dataset.id;
        renderGrammarContent();
      });
    });
    renderGrammarContent();
  }

  function renderGrammarContent() {
    const topic = DB.grammar.find(t => t.id === grammarTopic);
    const area = document.getElementById('grammar-content-area');
    if (!topic) { area.innerHTML = ''; return; }

    // Count available drill questions for this topic
    const drillPool = flatQuestions.filter(q => q.part === 5 && q.type === topic.id);
    const drillCount = drillPool.length;

    const drillBanner = drillCount > 0 ? `
      <div class="grammar-drill-banner">
        <span style="font-size:0.88rem;color:var(--text-secondary)">
          📝 <strong style="color:var(--accent-2)">${drillCount} câu</strong> luyện tập cho chủ đề này
        </span>
        <button class="btn btn-sm btn-drill" onclick="App.startGrammarDrill('${topic.id}')">
          ▶ Drill 5 câu
        </button>
      </div>` : '';

    area.innerHTML = drillBanner + (topic.content || '');
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
    const pool = flatQuestions.filter(mode.filter);
    if (pool.length === 0) { alert('Không có câu hỏi nào cho chế độ này.'); return; }
    const smartPool = buildSmartPool(pool);
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
    if (idx === quizQuestions[quizIndex].answer) quizScore++;
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
                   : quizMode === 'grammar-drill' ? 'Grammar Drill'
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

  function handleHomeworkCode(code) {
    // ── Mã đề kiểm tra: EXAM-P{p5}-G{p6}-Q{p7}-{seed} ──
    const examMatch = code.match(/EXAM-P(\d+)-G(\d+)-Q(\d+)-(\d+)/i);
    if (examMatch) {
      generateExamFromCode(
        parseInt(examMatch[1]),  // p5Count
        parseInt(examMatch[2]),  // p6Groups
        parseInt(examMatch[3]),  // p7Target
        parseInt(examMatch[4])   // seed
      );
      return;
    }

    // ── Mã bài tập về nhà: HW-UNIT-{unitId}-{seed} ──
    const match = code.match(/HW-UNIT-(\d+)-(\d+)/i);
    if (match) {
      _currentUnitId = parseInt(match[1]);
      generateUnitQuiz(parseInt(match[1]), parseInt(match[2]));
    } else {
      const fallback = code.match(/HW-UNIT-(\d+)/i);
      if (fallback) {
        showToast('Mã cũ — không có seed. Vui lòng dùng mã mới từ giáo viên (VD: HW-UNIT-1-4823)', '⚠️');
      } else {
        showToast('Mã không hợp lệ. Định dạng: HW-UNIT-1-4823 hoặc EXAM-P30-G4-Q54-123456', '⚠️');
      }
    }
  }

  // ─── Tái tạo đề kiểm tra từ mã EXAM ──────────────────────────
  function generateExamFromCode(p5Count, p6Groups, p7Target, seed) {
    // ── Part 5: seeded shuffle toàn bộ pool, lấy p5Count câu đầu ──
    const p5pool     = seededShuffle([...DB.questions.part5], seed);
    const selectedP5 = p5pool.slice(0, Math.min(p5Count, p5pool.length));

    // ── Part 6: seeded shuffle, lấy p6Groups đoạn đầy đủ 4 câu ──
    const p6full     = DB.questions.part6.filter(g => g.questions.length === 4);
    const selectedP6 = seededShuffle(p6full, seed + 1).slice(0, Math.min(p6Groups, p6full.length));

    // ── Part 7: seeded shuffle theo loại giống teacher-core ──
    const singles = seededShuffle(DB.questions.part7.filter(g => g.type === 'single' || !g.type), seed + 2);
    const doubles = seededShuffle(DB.questions.part7.filter(g => g.type === 'double'), seed + 3);
    const triples = seededShuffle(DB.questions.part7.filter(g => g.type === 'triple'), seed + 4);
    const selectedP7 = [];
    let p7count = 0;
    const addGroups = list => {
      for (const g of list) {
        if (p7count + g.questions.length <= p7Target) { selectedP7.push(g); p7count += g.questions.length; }
      }
    };
    addGroups(triples.slice(0, 3));
    addGroups(doubles.slice(0, 2));
    addGroups(singles);

    if (selectedP5.length === 0) { showToast('Không tải được đề — dữ liệu thiếu câu hỏi Part 5.', '❌'); return; }

    // Flatten thành quizQuestions
    const allQ = [
      ...selectedP5.map(q => ({...q, part:5})),
      ...selectedP6.flatMap(g => g.questions.map(q => ({...q, passage:g.passage, passageTitle:g.passageTitle, type:g.type||'text-completion', part:6}))),
      ...selectedP7.flatMap(g => g.questions.map(q => ({...q, passage:g.passage, passageTitle:g.passageTitle, type:g.type||'single', part:7}))),
    ];

    quizQuestions   = allQ;
    quizIndex = 0; quizScore = 0; quizAnswered = 0;
    quizUserAnswers = new Array(allQ.length).fill(null);
    quizTimeLeft    = allQ.length * 45;
    quizMode        = 'exam-review';
    _currentUnitId  = null;  // đề kiểm tra không thuộc unit nào

    document.getElementById('quiz-setup').style.display      = 'none';
    document.getElementById('quiz-container').style.display  = 'block';
    document.getElementById('results-container').style.display = 'none';
    document.getElementById('quiz-total').textContent        = allQ.length;

    const partLabel = document.getElementById('quiz-part-label');
    partLabel.textContent    = 'Mock Test';
    partLabel.className      = 'tag';
    partLabel.style.background = '#2563eb';
    partLabel.style.color      = '#fff';

    const unseenBadge = document.getElementById('quiz-unseen-badge');
    if (unseenBadge) {
      unseenBadge.textContent   = `📝 Đề kiểm tra | P5:${selectedP5.length} P6:${selectedP6.reduce((s,g)=>s+g.questions.length,0)} P7:${p7count} câu`;
      unseenBadge.style.display = 'inline-block';
    }

    startTimer();
    renderQuestionNavigator();
    renderQuestion();
    showToast(`✅ Đã tải đề kiểm tra · ${allQ.length} câu`, '📝');
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
    const unit     = UNIT_METADATA.find(u => u.id === unitId);
    const prevUnit = UNIT_METADATA.find(u => u.id === unitId - 1);
    if (!unit) { showToast('Không tìm thấy dữ liệu cho Unit này.', '❌'); return; }

    const isTeacher  = (seed === undefined || seed === null);
    const activeSeed = isTeacher ? (Math.floor(Math.random() * 9000) + 1000) : seed;

    const keywords    = unit.vocab.map(k => k.toLowerCase());
    const grammar     = unit.grammar;
    const prevGrammar = prevUnit ? prevUnit.grammar : null;

    // Normalize grammar type aliases (type mismatches between UNIT_METADATA and question data)
    const grammarAliases = { 'prepositions': 'preposition', 'preposition': 'prepositions' };
    const grammarTypes = new Set([grammar, grammarAliases[grammar]].filter(Boolean));
    const prevGrammarTypes = prevGrammar
      ? new Set([prevGrammar, grammarAliases[prevGrammar]].filter(Boolean))
      : new Set();

    let pool = flatQuestions.filter(q => {
      if (q.part !== 5) return false;
      return grammarTypes.has(q.type) || (prevGrammar && prevGrammarTypes.has(q.type));
    });

    if (pool.length < 20) {
      const byVocab = flatQuestions.filter(q => {
        if (q.part !== 5 || pool.includes(q)) return false;
        const text = (q.question + ' ' + (q.explanation || '')).toLowerCase();
        return keywords.some(k => text.includes(k));
      });
      pool.push(...seededShuffle(byVocab, activeSeed + 1).slice(0, 20 - pool.length));
    }

    if (pool.length < 20) {
      const remaining = flatQuestions.filter(q => q.part === 5 && !pool.includes(q));
      pool.push(...seededShuffle(remaining, activeSeed + 2).slice(0, 20 - pool.length));
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
      unseenBadge.textContent   = `📚 Ôn tập: ${unit.title}${prevUnit ? ` | 🔄 Recycling: ${prevUnit.grammar}` : ''}`;
      unseenBadge.style.display = 'inline-block';
    }

    if (isTeacher) {
      const hwCode = `HW-UNIT-${unitId}-${activeSeed}`;
      showToast(`Đã tạo bộ câu hỏi! Mã học viên: ${hwCode}`, '🔑');
      const input = document.getElementById('homework-code-input');
      if (input) input.value = hwCode;
    } else {
      showToast(`✅ Đã tải bộ câu hỏi Unit ${unitId}`, '📝');
    }

    startTimer();
    renderQuestionNavigator();
    renderQuestion();
  }

  // ─── Wrong Count UI ───
  function updateWrongCountUI() {
    const wrongIds = getWrongIds();
    const count = wrongIds.size;
    const badge = document.getElementById('wrong-count-badge');
    const card  = document.getElementById('wrong-review-card');
    if (badge) badge.textContent = count;
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
  function startWrongReview() {
    const wrongIds = getWrongIds();
    if (wrongIds.size === 0) {
      showToast('Chưa có câu nào cần ôn! Hãy làm bài trước 😊', 'ℹ️');
      return;
    }
    const pool = flatQuestions.filter(q => q.id && wrongIds.has(q.id));
    if (pool.length === 0) { showToast('Không tìm thấy câu sai trong dữ liệu.', '⚠️'); return; }

    const smartPool = buildSmartPool(pool);
    quizQuestions   = smartPool; // ôn hết — không giới hạn số câu
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

  // ─── Grammar Mini Drill (5 câu) ───
  function startGrammarDrill(typeId) {
    const pool = flatQuestions.filter(q => q.part === 5 && q.type === typeId);
    if (pool.length === 0) {
      showToast('Chưa có câu luyện tập cho chủ đề này.', 'ℹ️');
      return;
    }
    const smartPool = buildSmartPool(pool);
    quizQuestions   = smartPool.slice(0, Math.min(5, smartPool.length));
    quizIndex = 0; quizScore = 0; quizAnswered = 0;
    quizUserAnswers = new Array(quizQuestions.length).fill(null);
    quizTimeLeft    = quizQuestions.length * 50; // ~50 giây / câu cho drill
    quizMode        = 'grammar-drill';

    navigate('practice');
    // small delay to let page transition complete
    requestAnimationFrame(() => {
      document.getElementById('quiz-setup').style.display      = 'none';
      document.getElementById('quiz-container').style.display  = 'block';
      document.getElementById('results-container').style.display = 'none';
      document.getElementById('quiz-total').textContent        = quizQuestions.length;

      const topic    = DB.grammar.find(t => t.id === typeId);
      const partLabel = document.getElementById('quiz-part-label');
      partLabel.textContent   = 'Drill';
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
      showToast(`Drill: ${quizQuestions.length} câu về ${topic ? topic.title : typeId}`, '📝');
    });
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

  function srsDueCount() {
    const srs = getSrsData();
    const now = Date.now();
    return DB.vocab.filter(v => {
      const c = srs[v.id];
      return c && c.dueDate <= now;
    }).length;
  }

  function srsNewCount() {
    const srs = getSrsData();
    return DB.vocab.filter(v => !srs[v.id]).length;
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
    setTimeout(renderFcCard, 180);
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

    // Show 3-button rating row (Again / Good / Easy) after flip
    const actionsEl = document.getElementById('fc-actions');
    if (actionsEl) actionsEl.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px">
        <button class="btn" style="background:rgba(244,63,94,.18);border:1px solid var(--danger);color:var(--danger);font-size:.8rem" onclick="App.rateCardSRS('wrong')">😓 Chưa nhớ</button>
        <button class="btn" style="background:rgba(79,142,247,.15);border:1px solid var(--accent);color:var(--accent);font-size:.8rem" onclick="App.rateCardSRS('right')">👍 Nhớ rồi</button>
        <button class="btn" style="background:rgba(16,185,129,.12);border:1px solid var(--success);color:var(--success);font-size:.8rem" onclick="App.rateCardSRS('easy')">⚡ Dễ quá!</button>
      </div>
      <button class="btn btn-outline btn-sm" onclick="App.skipCard()" style="width:100%;margin-top:10px;font-size:.8rem;color:var(--text-muted)">Bỏ qua →</button>`;

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
    { id:'first_quiz',   icon:'🎯', name:'Bắt đầu học',    desc:'Hoàn thành bài thi đầu tiên',   check: p => (p.testsCompleted||0) >= 1 },
    { id:'streak3',      icon:'🔥', name:'On fire!',        desc:'Streak 3 ngày liên tiếp',        check: () => getStreakCount() >= 3 },
    { id:'streak7',      icon:'💥', name:'Tuần bất bại',    desc:'Streak 7 ngày liên tiếp',        check: () => getStreakCount() >= 7 },
    { id:'vocab50',      icon:'📖', name:'Từ vựng cơ bản',  desc:'Học 50 từ vựng',                 check: p => (p.vocabSeen||0) >= 50 },
    { id:'vocab200',     icon:'📚', name:'Từ điển nhỏ',     desc:'Học 200 từ vựng',                check: p => (p.vocabSeen||0) >= 200 },
    { id:'acc80',        icon:'🎓', name:'Chính xác cao',   desc:'Độ chính xác ≥ 80%',             check: p => (p.accuracy||0) >= 80 },
    { id:'test10',       icon:'✏️', name:'Luyện tập chăm',  desc:'Hoàn thành 10 bài thi',          check: p => (p.testsCompleted||0) >= 10 },
    { id:'xp500',        icon:'⚡', name:'Năng lượng!',     desc:'Đạt 500 XP',                     check: () => getXP() >= 500 },
    { id:'xp2000',       icon:'💎', name:'Chăm chỉ đỉnh',  desc:'Đạt 2000 XP',                    check: () => getXP() >= 2000 },
    { id:'srs20',        icon:'🧠', name:'Trí nhớ sắt',     desc:'Hoàn thành 20 thẻ SRS',          check: () => Object.keys(getSrsData()).length >= 20 },
    { id:'perfect',      icon:'🏆', name:'Hoàn hảo',        desc:'Đạt 100% một bài thi',           check: p => (p.hasPerfect||false) },
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
      if (currentPage === 'stats') renderStatsPage();
    }
  }

  // ─── Unit Learning Page ───────────────────────────────────
  function setupUnitsPage() {
    const grid = document.getElementById('units-grid');
    if (!grid) return;
    const srs  = getSrsData();
    const now  = Date.now();

    grid.innerHTML = UNIT_METADATA.map(unit => {
      const prog   = getProgress();
      const scores = prog.unitScores || {};
      const best   = scores[unit.id];
      const pct    = best ? best.pct : 0;
      const done   = pct >= 70;

      return `<div class="unit-card ${done?'unit-done':''}" onclick="App.showUnitDetail(${unit.id})">
        <div class="unit-num">Unit ${unit.id}</div>
        <div class="unit-title">${unit.title}</div>
        <div class="unit-tags">
          ${unit.vocab.map(v=>`<span class="unit-tag unit-tag-vocab">📂 ${v}</span>`).join('')}
          <span class="unit-tag unit-tag-grammar">📝 ${unit.grammar}</span>
        </div>
        <div class="unit-progress-wrap">
          <div class="unit-progress-fill" style="width:${pct}%"></div>
        </div>
        <div class="unit-score-row">
          <span>${pct > 0 ? `Best: <b class="unit-best-score" style="color:${pct>=80?'var(--success)':pct>=60?'var(--warning)':'var(--danger)'}">${pct}%</b>` : '<span style="color:var(--text-muted)">Chưa làm</span>'}</span>
          <span>${done ? '<span style="color:var(--success);font-size:.72rem">✓ Hoàn thành</span>' : ''}</span>
        </div>
      </div>`;
    }).join('');
  }

  function showUnitDetail(unitId) {
    const unit = UNIT_METADATA.find(u => u.id === unitId);
    if (!unit) return;

    // Get sample vocab words for this unit
    const keywords = unit.vocab.map(k => k.toLowerCase());
    const unitVocab = DB.vocab.filter(v =>
      keywords.some(k => v.category.toLowerCase().includes(k))
    ).slice(0, 12);

    const prog   = getProgress();
    const scores = prog.unitScores || {};
    const best   = scores[unitId];
    const bestHtml = best
      ? `<span style="color:${best.pct>=80?'var(--success)':best.pct>=60?'var(--warning)':'var(--danger)'}">Best: <b>${best.pct}%</b> (${best.correct}/${best.total})</span>`
      : '<span style="color:var(--text-muted)">Chưa làm</span>';

    const detailEl = document.getElementById('unit-detail');
    detailEl.style.display = 'block';
    detailEl.innerHTML = `
      <div class="unit-detail-panel">
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;margin-bottom:14px">
          <div class="unit-detail-title">Unit ${unitId}: ${unit.title}</div>
          <button onclick="document.getElementById('unit-detail').style.display='none'" style="background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:1.1rem">✕</button>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px">
          ${unit.vocab.map(v=>`<span class="unit-tag unit-tag-vocab">📂 ${v}</span>`).join('')}
          <span class="unit-tag unit-tag-grammar">📝 Ngữ pháp: ${unit.grammar}</span>
        </div>
        ${unitVocab.length ? `
          <div style="font-size:.75rem;color:var(--text-secondary);font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">Từ vựng chủ đề</div>
          <div class="unit-vocab-preview">${unitVocab.map(v=>`<span class="unit-vocab-chip" title="${v.meaning}">${v.word}</span>`).join('')}</div>
        ` : ''}
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-top:6px">
          <div style="font-size:.82rem;color:var(--text-muted)">${bestHtml}</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button class="btn btn-outline btn-sm" onclick="App.openUnitFlashcard(${unitId})">🃏 Flashcard từ vựng</button>
            <button class="btn btn-primary btn-sm" onclick="App.startUnitQuizFromPage(${unitId})">▶ Luyện tập Unit ${unitId}</button>
          </div>
        </div>
      </div>`;
    detailEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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
    _currentUnitId = unitId;
    navigate('practice');
    requestAnimationFrame(() => {
      generateUnitQuiz(unitId, undefined);
    });
  }

  // ─── Stats Page ───────────────────────────────────────────
  function renderStatsPage() {
    const el = document.getElementById('stats-content');
    if (!el) return;

    const prog    = getProgress();
    const sd      = getStreakData();
    const xp      = getXP();
    const li      = getLevelInfo(xp);
    const hist    = sd.history || [];
    const histSet = new Set(hist);
    const unlocked = getUnlocked();

    // ── Heatmap: last 70 days ──
    const heatDays = Array.from({length:70}, (_,i) => {
      const d = new Date(); d.setDate(d.getDate() - (69-i));
      const str = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      const isToday = str === todayStr();
      const active = histSet.has(str);
      return `<div class="hm-cell ${active?'hm-4':''} ${isToday?'hm-today':''}" title="${str}"></div>`;
    }).join('');

    // ── Weekly bar chart: last 7 weeks quiz count ──
    const weeklyScores = prog.weeklyScores || [];
    const chartBars = weeklyScores.slice(-7).map((s,i) => {
      const maxS = Math.max(...weeklyScores.slice(-7), 1);
      const h = Math.round(s / maxS * 100);
      return `<div class="bar-col">
        <div class="bar-body" style="height:${h}%"></div>
        <div class="bar-label">T${i+1}</div>
      </div>`;
    }).join('') || '<div style="color:var(--text-muted);font-size:.82rem;padding:10px">Chưa có dữ liệu tuần</div>';

    // ── SRS summary ──
    const srsAll = getSrsData();
    const srsTotal = Object.keys(srsAll).length;
    const now = Date.now();
    const srsDue = Object.values(srsAll).filter(c => c.dueDate <= now).length;
    const srsMastered = Object.values(srsAll).filter(c => c.reps >= 4).length;

    // ── Unit completion ──
    const unitScores = prog.unitScores || {};
    const unitsDone = Object.values(unitScores).filter(s => s.pct >= 70).length;

    el.innerHTML = `
      <!-- Level card -->
      <div class="stats-hero">
        <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">
          <div style="font-size:3rem">${li.level.name.split(' ').pop()}</div>
          <div style="flex:1;min-width:160px">
            <div style="font-size:1.3rem;font-weight:900">${li.level.name}</div>
            <div style="font-size:.82rem;color:var(--text-secondary);margin:4px 0">${xp} XP tổng cộng</div>
            <div class="xp-track" style="max-width:260px"><div class="xp-fill" style="width:${li.pct}%"></div></div>
            <div style="font-size:.72rem;color:var(--text-muted);margin-top:4px">${li.next ? `${li.next.min - xp} XP đến ${li.next.name}` : '🏆 Cấp độ tối đa!'}</div>
          </div>
          <div style="text-align:center">
            <div style="font-size:2rem;font-weight:900;color:#fbbf24">${sd.streak||0} 🔥</div>
            <div style="font-size:.72rem;color:var(--text-muted)">Streak hiện tại</div>
            <div style="font-size:.78rem;color:var(--text-secondary);margin-top:2px">Best: ${sd.best||0} ngày</div>
          </div>
        </div>
      </div>

      <!-- Stats grid -->
      <div class="stats-grid">
        <div class="stats-tile"><div class="stats-tile-num">${prog.vocabSeen||0}</div><div class="stats-tile-label">Từ đã học</div></div>
        <div class="stats-tile"><div class="stats-tile-num">${prog.testsCompleted||0}</div><div class="stats-tile-label">Bài thi</div></div>
        <div class="stats-tile"><div class="stats-tile-num">${prog.totalAnswered||0}</div><div class="stats-tile-label">Câu đã làm</div></div>
        <div class="stats-tile"><div class="stats-tile-num">${prog.accuracy||0}%</div><div class="stats-tile-label">Độ chính xác</div></div>
        <div class="stats-tile"><div class="stats-tile-num" style="color:#fbbf24">${srsDue}</div><div class="stats-tile-label">Thẻ đến hạn SRS</div></div>
        <div class="stats-tile"><div class="stats-tile-num" style="color:var(--success)">${srsMastered}</div><div class="stats-tile-label">Thẻ đã thuộc</div></div>
        <div class="stats-tile"><div class="stats-tile-num">${srsTotal}</div><div class="stats-tile-label">Tổng thẻ SRS</div></div>
        <div class="stats-tile"><div class="stats-tile-num">${unitsDone}/${UNIT_METADATA.length}</div><div class="stats-tile-label">Units hoàn thành</div></div>
      </div>

      <!-- Heatmap -->
      <div class="heatmap-wrap">
        <div class="heatmap-title">📅 Lịch học 70 ngày gần nhất</div>
        <div class="heatmap-grid">${heatDays}</div>
        <div style="font-size:.72rem;color:var(--text-muted);margin-top:8px">Ô màu = ngày có hoạt động học · Viền vàng = hôm nay</div>
      </div>

      <!-- Weekly bars -->
      <div class="progress-chart-wrap">
        <div class="heatmap-title">📈 Số bài thi theo tuần</div>
        <div class="bar-chart">${chartBars}</div>
      </div>

      <!-- Achievements -->
      <div style="font-size:.88rem;font-weight:700;color:var(--text-secondary);text-transform:uppercase;letter-spacing:.5px;margin-bottom:14px">🏅 Thành tích (${unlocked.size}/${ACHIEVEMENTS.length})</div>
      <div class="achievement-grid">
        ${ACHIEVEMENTS.map(a => `
          <div class="achievement-card ${unlocked.has(a.id)?'unlocked':'locked'}">
            <div class="ach-icon">${a.icon}</div>
            <div>
              <div class="ach-name">${a.name}</div>
              <div class="ach-desc">${a.desc}</div>
            </div>
          </div>`).join('')}
      </div>
      <div style="text-align:center;margin-top:12px">
        <button class="btn btn-outline btn-sm" onclick="App.resetAllData()" style="border-color:var(--danger);color:var(--danger);font-size:.75rem">🗑 Xóa toàn bộ dữ liệu</button>
      </div>`;
  }

  function resetAllData() {
    if (!confirm('Bạn có chắc muốn xóa toàn bộ tiến trình, XP, streak và SRS? Hành động này không thể hoàn tác.')) return;
    ['toeic_progress','toeic_srs','toeic_xp','toeic_streak','toeic_ach'].forEach(k => localStorage.removeItem(k));
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

  // generateUnitQuizTracked — alias giữ tương thích, _currentUnitId được set tại điểm gọi
  function generateUnitQuizTracked(unitId, seed) {
    _currentUnitId = unitId;
    generateUnitQuiz(unitId, seed);
  }

  // ─── Hook navigate to render stats/units on page open ─────
  const _origNavigate = navigate;
  function navigateGamified(page) {
    _origNavigate(page);
    if (page === 'stats')  { renderStatsPage(); }
    if (page === 'units')  { setupUnitsPage(); }
    if (page === 'home')   { renderStreakBanner(); }
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

  // ─── Public API (expose to teacher-core.js too) ───
  return {
    init, navigate: navigateGamified,
    showVocabDetail, selectAnswer, closeModal,
    handleHomeworkCode, jumpToQuestion,
    goToGrammar,
    startWrongReview, startGrammarDrill,
    flipCard, rateCard, rateCardSRS, skipCard, closeFlashcard, restartReviewCards,
    // Vocab learning modes
    openVocabQuiz, closeVocabQuiz, vqSelect, vqNext,
    openVocabFill, closeVocabFill, vfSelect, vfNext,
    openVocabMatch, closeVocabMatch, vmTileClick, vmNewRound,
    // Gamification
    showUnitDetail, openUnitFlashcard, startUnitQuizFromPage,
    resetAllData,
    getDB: () => DB,
    getFlatQuestions: () => flatQuestions,
    getUnitMetadata: () => UNIT_METADATA,
    shuffleArray,
    seededShuffle,
    mulberry32,
  };
})();

document.addEventListener('DOMContentLoaded', () => {
  App.init();
  document.getElementById('app-modal').addEventListener('click', function(e) {
    if (e.target === this) App.closeModal();
  });
});
