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
    { id:5,  title:"Finance & Budget",        vocab:["Finance","Accounting"],           grammar:"prepositions"       }, // fixed: was "preposition"
    { id:6,  title:"Tech & Innovation",       vocab:["Tech","Innovation"],              grammar:"conjunction"        },
    { id:7,  title:"Manufacturing & QC",      vocab:["Manufacturing","Production"],     grammar:"pronoun"            }, // swapped with Unit 8 (pronoun before relative-clause)
    { id:8,  title:"Travel & Tourism",        vocab:["Travel","Tourism"],               grammar:"relative-clause"    }, // moved here after pronoun
    { id:9,  title:"Corporate Events",        vocab:["Events","Conferences"],           grammar:"modal"              },
    { id:10, title:"Customer Service",        vocab:["Customer","Customer Service"],    grammar:"gerund-infinitive"  },
    { id:11, title:"Logistics",               vocab:["Logistics","Shipping"],           grammar:"comparison"         },
    { id:12, title:"Health & Safety",         vocab:["Health","Safety"],                grammar:"participles"        },
    { id:13, title:"Banking & Investment",    vocab:["Finance","Accounting"],           grammar:"subject-verb"       },
    { id:14, title:"Real Estate",             vocab:["Property","Facilities"],          grammar:"noun-clauses"       },
    { id:15, title:"Media & Communications", vocab:["Media","Communication"],          grammar:"adverb-time"        },
    { id:16, title:"Retail & E-commerce",    vocab:["Sales","E-commerce"],             grammar:"vocabulary-context" },
    { id:17, title:"Research & Development", vocab:["Research","Data"],                grammar:"part6-strategy"     },
    { id:18, title:"Professional Training",  vocab:["Training","Education"],           grammar:"part7-strategy"     },
    { id:19, title:"Law & Contracts",        vocab:["Legal","Contract"],               grammar:"inversion"          },
    { id:20, title:"Environment & Energy",   vocab:["Environment","Sustainability"],   grammar:"quantifiers"        },
    { id:21, title:"Business Communications",vocab:["Communication","Phrases"],        grammar:"business-english"   },
    { id:22, title:"Corporate Policy",       vocab:["Management","Leadership"],        grammar:"subjunctive"        },
    { id:23, title:"Advanced Structures",    vocab:["General","Advanced"],             grammar:"prep-structures"    },
  ];

  // ─── Bootstrap / Data Loading ───
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
    setupVocabPage();
    setupGrammarPage();
    setupPracticePage();
    setupHomeworkLogic();

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
    renderVocabGrid();
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
    document.getElementById('grammar-content-area').innerHTML = topic ? topic.content : '';
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
      expBox.innerHTML = `<div class="exp-title">${userAns===q.answer?'✅ Chính xác!':'❌ Chưa đúng!'}</div><p>📖 ${q.explanation}</p>`;
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
    updateProgress(quizScore, total);

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
    const match = code.match(/HW-UNIT-(\d+)/i);
    if (match) generateUnitQuiz(parseInt(match[1]));
    else showToast('Mã bài tập không hợp lệ (VD: HW-UNIT-1)', '⚠️');
  }

  function generateUnitQuiz(unitId) {
    const unit     = UNIT_METADATA.find(u => u.id === unitId);
    const prevUnit = UNIT_METADATA.find(u => u.id === unitId - 1);
    if (!unit) { showToast('Không tìm thấy dữ liệu cho Unit này.', '❌'); return; }

    const keywords     = unit.vocab.map(k => k.toLowerCase());
    const grammar      = unit.grammar;
    const prevGrammar  = prevUnit ? prevUnit.grammar : null;

    // Chỉ dùng Part 5 cho bài luyện tập tích hợp (25 phút)
    let pool = flatQuestions.filter(q => {
      if (q.part !== 5) return false;
      return q.type === grammar || (prevGrammar && q.type === prevGrammar);
    });

    // Nếu chưa đủ 20 câu, bổ sung từ Part 5 theo từ khóa vocab
    if (pool.length < 20) {
      const byVocab = flatQuestions.filter(q => {
        if (q.part !== 5 || pool.includes(q)) return false;
        const text = (q.question + ' ' + (q.explanation || '')).toLowerCase();
        return keywords.some(k => text.includes(k));
      });
      shuffleArray(byVocab);
      pool.push(...byVocab.slice(0, 20 - pool.length));
    }

    // Nếu vẫn chưa đủ 20 câu, bổ sung Part 5 bất kỳ (ưu tiên đa dạng grammar type)
    if (pool.length < 20) {
      const remaining = flatQuestions.filter(q => q.part === 5 && !pool.includes(q));
      shuffleArray(remaining);
      pool.push(...remaining.slice(0, 20 - pool.length));
    }

    if (pool.length === 0) { showToast(`Chưa có câu hỏi cho Unit ${unitId}.`, 'ℹ️'); return; }

    quizQuestions   = shuffleArray([...pool]).slice(0, 20);
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
    startTimer();
    renderQuestionNavigator();
    renderQuestion();
    showToast(`Đã tạo bộ câu hỏi ôn tập Unit ${unitId}!`, '🚀');
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
    init, navigate,
    showVocabDetail, selectAnswer, closeModal,
    handleHomeworkCode, jumpToQuestion,
    getDB: () => DB,
    getFlatQuestions: () => flatQuestions,
    getUnitMetadata: () => UNIT_METADATA,
    shuffleArray
  };
})();

document.addEventListener('DOMContentLoaded', () => {
  App.init();
  document.getElementById('app-modal').addEventListener('click', function(e) {
    if (e.target === this) App.closeModal();
  });
});
