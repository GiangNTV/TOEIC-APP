// ═══════════════════════════════════════════════════════════════
//   TOEIC Teacher App – Core Logic (v3.0)
//   Depends on: toeic-app.js (App object with getDB(), getUnitMetadata())
//   Architecture: fetch()-based, no inline data globals needed
// ═══════════════════════════════════════════════════════════════

const TeacherApp = (() => {
  let DB   = {};          // { questions:{part5,part6,part7}, vocab:[], grammar:[] }
  let UNITS = [];
  let currentExam = null; // { part5:[], part6:[], part7:[], name, generatedAt }

  // ─── Init (waits for App to finish loading) ───────────────────
  function init() {
    // App.init() is async; poll until data is ready
    const CHECK_INTERVAL = 80;
    let waited = 0;
    const poll = setInterval(() => {
      waited += CHECK_INTERVAL;
      const db = App.getDB ? App.getDB() : null;
      if (db && db.vocab.length > 0 && db.grammar.length > 0) {
        clearInterval(poll);
        DB    = db;
        UNITS = App.getUnitMetadata();
        renderUnitDashboard();
        renderTrapDashboard();
        updateExamMaxValues();
      }
      if (waited > 10000) { clearInterval(poll); console.warn('Teacher: timeout waiting for App data'); }
    }, CHECK_INTERVAL);
  }

  // ─── Utilities ────────────────────────────────────────────────
  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function getSelectedP5Types() {
    const sel = document.getElementById('cfg-p5-type');
    if (!sel) return [];
    const vals = [...sel.selectedOptions].map(o => o.value).filter(Boolean);
    return vals; // empty = all types
  }

  function updateExamMaxValues() {
    const p5count = DB.questions.part5.length;
    const maxEl = document.getElementById('cfg-p5-max');
    if (maxEl) maxEl.textContent = p5count;
    const p5input = document.getElementById('cfg-p5');
    if (p5input) p5input.max = p5count;
  }

  // ─── UNIT DASHBOARD ───────────────────────────────────────────
  function renderUnitDashboard() {
    const container = document.getElementById('unit-dashboard');
    if (!container) return;
    container.innerHTML = UNITS.map(unit => {
      const grammarLabel = getGrammarTitle(unit.grammar);
      return `
        <div class="unit-card" onclick="TeacherApp.openUnitModal(${unit.id})">
          <div class="u-badge">UNIT ${unit.id}</div>
          <h3>${unit.title}</h3>
          <p>${unit.vocab.join(' & ')}</p>
          <div class="unit-meta">📝 ${grammarLabel} · ⏱️ 90 phút</div>
        </div>`;
    }).join('');
  }

  function getGrammarTitle(grammarId) {
    const topic = DB.grammar.find(t => t.id === grammarId);
    return topic ? topic.title : grammarId;
  }

  // ─── UNIT MODAL (Lesson Plan) ─────────────────────────────────
  function openUnitModal(unitId) {
    const unit      = UNITS.find(u => u.id === unitId);
    const prevUnit  = UNITS.find(u => u.id === unitId - 1);
    if (!unit) return;

    const vocabItems  = DB.vocab.filter(v => unit.vocab.includes(v.category)).slice(0, 18);
    const grammarData = DB.grammar.filter(t => t.id === unit.grammar);
    const practiceQs  = getQuestionsForUnit(unitId);

    document.getElementById('modal-unit-title').textContent = unit.title;
    document.getElementById('modal-unit-sub').textContent   = `Vocab: ${unit.vocab.join(', ')} · Grammar: ${unit.grammar}`;

    document.getElementById('modal-unit-body').innerHTML = `
      <!-- Step 1: Vocab -->
      <div class="plan-step">
        <div class="step-head">
          <h4>1. 🔤 Khởi động & Từ vựng (25 phút)</h4>
          <span class="step-badge" style="background:#dcfce7;color:#15803d;">ETS 2025</span>
        </div>
        <div class="vocab-pills">
          ${vocabItems.length > 0
            ? vocabItems.map(v => `<span class="vocab-pill"><b>${v.word}</b> – ${v.meaning}</span>`).join('')
            : '<i style="color:#94a3b8">Chưa có từ vựng cho chủ đề này.</i>'}
        </div>
      </div>

      <!-- Step 2: Grammar -->
      <div class="plan-step">
        <div class="step-head">
          <h4>2. 📝 Trọng tâm Ngữ pháp (30 phút)</h4>
        </div>
        ${grammarData.length > 0
          ? grammarData.map(g => `
            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:14px;max-height:420px;overflow-y:auto;">
              <b style="font-size:0.95rem;color:#1e293b;display:block;margin-bottom:8px;">${g.icon} ${g.title}</b>
              <div class="gmc" style="font-size:0.83rem;line-height:1.6;">${g.content}</div>
            </div>`).join('')
          : `<i style="color:#94a3b8">Chưa có nội dung ngữ pháp cho unit này.</i>`}
        ${prevUnit ? `
          <div class="recycling-note">
            🔄 <b>Grammar Recycling:</b> Ôn lại điểm ngữ pháp từ Unit ${prevUnit.id}: <b>${getGrammarTitle(prevUnit.grammar)}</b>. Lồng ghép vào bài tập thực hành.
          </div>` : ''}
      </div>

      <!-- Step 3: Practice -->
      <div class="plan-step">
        <div class="step-head">
          <h4>3. ✏️ Luyện tập tích hợp (25 phút)</h4>
          <button class="btn btn-blue" style="padding:5px 12px;font-size:0.8rem;"
                  onclick="TeacherApp.printInClassWorksheet(${unitId})">🖨️ In bài tập (PDF)</button>
        </div>
        <p style="font-size:0.83rem;color:#475569;margin-bottom:8px;">Câu hỏi kết hợp từ vựng hôm nay + ngữ pháp mới và cũ.</p>
        <div style="background:#f1f5f9;padding:10px;border-radius:8px;">
          ${practiceQs.slice(0, 4).map((q, i) => `
            <div style="font-size:0.82rem;margin-bottom:6px;padding-bottom:6px;border-bottom:1px solid #e2e8f0;">
              <b>Q${i+1}.</b> ${q.question.substring(0,110)}${q.question.length>110?'...':''}
            </div>`).join('')}
          ${practiceQs.length > 4
            ? `<small style="color:#2563eb;font-weight:600">+ ${practiceQs.length - 4} câu hỏi khác trong file PDF</small>`
            : ''}
        </div>
      </div>

      <!-- Step 4: Homework -->
      <div class="plan-step" style="border:none;margin-bottom:0;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
        <div>
          <h4>4. 🏠 Giao bài tập về nhà</h4>
          <p style="font-size:0.78rem;color:#64748b;margin-top:3px;">Hệ thống tự động tạo mã bài tập cho học viên nhập vào cổng học.</p>
        </div>
        <button class="btn btn-dark" onclick="TeacherApp.printHomework(${unitId})">📄 Tạo & In bài BTVN</button>
      </div>
    `;

    document.getElementById('unit-modal').style.display = 'flex';
  }

  // ─── QUESTIONS FOR A UNIT ─────────────────────────────────────
  function getQuestionsForUnit(unitId) {
    const unit     = UNITS.find(u => u.id === unitId);
    const prevUnit = UNITS.find(u => u.id === unitId - 1);
    if (!unit) return [];

    const flat     = App.getFlatQuestions();
    const keywords = unit.vocab.map(v => v.toLowerCase());
    const grammar  = unit.grammar;
    const prevGrammar = prevUnit ? prevUnit.grammar : null;

    let filtered = flat.filter(q => {
      if (q.part !== 5 && q.part !== 6) return false;
      const text = (q.question + ' ' + (q.explanation || '')).toLowerCase();
      const hasVocab   = keywords.some(k => text.includes(k));
      const hasGrammar = q.type === grammar || (prevGrammar && q.type === prevGrammar);
      return hasVocab || hasGrammar;
    });

    // Fallback if fewer than 8 matches
    if (filtered.length < 8) {
      const extra = flat.filter(q => (q.part === 5 || q.part === 6) && !filtered.includes(q));
      filtered.push(...shuffle(extra).slice(0, 12 - filtered.length));
    }

    return shuffle(filtered).slice(0, 20);
  }

  // ─── EXAM GENERATOR ───────────────────────────────────────────
  function generateExam() {
    const targetP5   = parseInt(document.getElementById('cfg-p5').value) || 30;
    const targetP6g  = parseInt(document.getElementById('cfg-p6').value) || 4;  // passage groups
    const targetP7q  = parseInt(document.getElementById('cfg-p7').value) || 54; // questions count
    const filterTypes = getSelectedP5Types();
    const examName   = document.getElementById('cfg-name').value.trim();

    // ── Part 5 ──
    let p5pool = [...DB.questions.part5];
    if (filterTypes.length > 0) {
      p5pool = p5pool.filter(q => filterTypes.includes(q.type));
    }
    if (p5pool.length < targetP5) {
      setExamStatus(`⚠️ Chỉ có ${p5pool.length} câu P5 thỏa mãn bộ lọc (cần ${targetP5}). Đã dùng tất cả.`, 'warning');
    }
    const selectedP5 = selectBalancedP5(p5pool, Math.min(targetP5, p5pool.length));

    // ── Part 6 ──
    const p6groups = [...DB.questions.part6].filter(g => g.questions.length === 4);
    if (p6groups.length < targetP6g) {
      setExamStatus(`⚠️ Chỉ có ${p6groups.length} đoạn P6 đầy đủ 4 câu.`, 'warning');
    }
    const selectedP6 = shuffle(p6groups).slice(0, Math.min(targetP6g, p6groups.length));

    // ── Part 7 ──
    const p7groups = [...DB.questions.part7];
    const selectedP7 = selectBalancedP7(p7groups, targetP7q);

    if (selectedP5.length === 0) {
      setExamStatus('❌ Không đủ câu P5. Hãy kiểm tra bộ lọc.', 'error');
      return;
    }

    currentExam = {
      name: examName || `Mock Test – ${new Date().toLocaleDateString('vi-VN')}`,
      part5: selectedP5,
      part6: selectedP6,
      part7: selectedP7,
      generatedAt: new Date().toLocaleString('vi-VN')
    };

    const p6q = selectedP6.reduce((s, g) => s + g.questions.length, 0);
    const p7q = selectedP7.reduce((s, g) => s + g.questions.length, 0);
    setExamStatus(`✅ Đã tạo đề: ${selectedP5.length} P5 + ${p6q} P6 (${selectedP6.length} đoạn) + ${p7q} P7 = ${selectedP5.length + p6q + p7q} câu`, 'ok');

    renderExamPreview(currentExam);
    document.getElementById('btn-print-exam').style.display = 'block';
  }

  function selectBalancedP5(pool, target) {
    const byType = {};
    pool.forEach(q => {
      if (!byType[q.type]) byType[q.type] = [];
      byType[q.type].push(q);
    });

    const selected = [];
    const types = Object.keys(byType);
    types.forEach(t => byType[t] = shuffle(byType[t]));

    // Round-robin across types
    let t = 0;
    while (selected.length < target) {
      if (types.length === 0) break;
      const type = types[t % types.length];
      if (byType[type].length > 0) {
        selected.push(byType[type].pop());
      } else {
        types.splice(t % types.length, 1);
        t = Math.max(0, t - 1);
        if (types.length === 0) break;
      }
      t++;
    }
    return shuffle(selected);
  }

  function selectBalancedP7(groups, targetCount) {
    const singles = shuffle(groups.filter(g => g.type === 'single' || !g.type));
    const doubles = shuffle(groups.filter(g => g.type === 'double'));
    const triples = shuffle(groups.filter(g => g.type === 'triple'));

    const selected = [];
    let count = 0;

    // ETS distribution: ~3 triples (15q) + ~2 doubles (10q) + singles to fill
    const addGroups = (list) => {
      for (const g of list) {
        if (count + g.questions.length <= targetCount) {
          selected.push(g);
          count += g.questions.length;
        }
      }
    };

    addGroups(triples.slice(0, 3));
    addGroups(doubles.slice(0, 2));
    addGroups(singles);

    return selected;
  }

  function renderExamPreview(exam) {
    const p6q = exam.part6.reduce((s,g) => s + g.questions.length, 0);
    const p7q = exam.part7.reduce((s,g) => s + g.questions.length, 0);
    const total = exam.part5.length + p6q + p7q;

    const p5Types = {};
    exam.part5.forEach(q => { p5Types[q.type] = (p5Types[q.type]||0)+1; });
    const topTypes = Object.entries(p5Types).sort((a,b)=>b[1]-a[1]).slice(0,6);

    const preview = document.getElementById('exam-preview');
    preview.innerHTML = `
      <div style="margin-bottom:16px">
        <div style="font-size:0.85rem;font-weight:700;color:#1e293b;margin-bottom:8px;">📊 Phân bố đề thi</div>
        <div class="dist-row">
          <div class="dist-label">Part 5</div>
          <div class="dist-bar-wrap"><div class="dist-bar" style="width:${(exam.part5.length/total*100).toFixed(0)}%;background:#4f8ef7;"></div></div>
          <div class="dist-count">${exam.part5.length} câu</div>
        </div>
        <div class="dist-row">
          <div class="dist-label">Part 6</div>
          <div class="dist-bar-wrap"><div class="dist-bar" style="width:${(p6q/total*100).toFixed(0)}%;background:#8b5cf6;"></div></div>
          <div class="dist-count">${p6q} câu</div>
        </div>
        <div class="dist-row">
          <div class="dist-label">Part 7</div>
          <div class="dist-bar-wrap"><div class="dist-bar" style="width:${(p7q/total*100).toFixed(0)}%;background:#10b981;"></div></div>
          <div class="dist-count">${p7q} câu</div>
        </div>
      </div>

      <div style="margin-bottom:12px">
        <div style="font-size:0.82rem;font-weight:700;color:#64748b;margin-bottom:6px;">Part 7 passage types</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;font-size:0.78rem;">
          <span style="background:#f0fdf4;color:#15803d;padding:2px 8px;border-radius:12px;font-weight:600;">
            Single: ${exam.part7.filter(g=>!g.type||g.type==='single').length}
          </span>
          <span style="background:#eff6ff;color:#2563eb;padding:2px 8px;border-radius:12px;font-weight:600;">
            Double: ${exam.part7.filter(g=>g.type==='double').length}
          </span>
          <span style="background:#fef3c7;color:#92400e;padding:2px 8px;border-radius:12px;font-weight:600;">
            Triple: ${exam.part7.filter(g=>g.type==='triple').length}
          </span>
        </div>
      </div>

      <div style="margin-bottom:12px">
        <div style="font-size:0.82rem;font-weight:700;color:#64748b;margin-bottom:6px;">Top P5 grammar/vocab types</div>
        <div style="display:flex;gap:5px;flex-wrap:wrap;font-size:0.75rem;">
          ${topTypes.map(([type, cnt]) => `
            <span style="background:#f1f5f9;color:#334155;padding:2px 8px;border-radius:10px;">${type} ×${cnt}</span>
          `).join('')}
        </div>
      </div>

      <div class="q-preview-list">
        <div style="font-size:0.82rem;font-weight:700;color:#64748b;margin-bottom:6px;">Xem trước Part 5 (10 câu đầu)</div>
        ${exam.part5.slice(0,10).map((q,i) => `
          <div class="q-preview-item">
            <span class="q-num">${i+101}</span>
            <span class="q-type-tag">${q.type||'vocab'}</span>
            <span class="q-text">${q.question}</span>
          </div>`).join('')}
      </div>
    `;
  }

  function setExamStatus(msg, type = 'ok') {
    const el = document.getElementById('exam-status');
    if (!el) return;
    el.textContent = msg;
    el.style.color = type === 'error' ? '#dc2626' : type === 'warning' ? '#d97706' : '#059669';
  }

  // ─── PRINT EXAM ───────────────────────────────────────────────
  function printExam() {
    if (!currentExam) { alert('Chưa có đề thi. Hãy tạo đề trước.'); return; }

    document.getElementById('print-test-name').textContent = currentExam.name;

    let html = `<h2 style="margin:0 0 12pt;">PART 5: INCOMPLETE SENTENCES</h2>
      <p style="font-size:9pt;margin-bottom:8pt;font-style:italic;">Directions: A word or phrase is missing in each sentence. Select the best answer.</p>
      <div class="part5-grid">`;

    currentExam.part5.forEach((q, i) => {
      html += `<div class="question-block">
        <p><b>Q${i+101}.</b> ${q.question}</p>
        <p style="margin:3pt 0 0 8pt;font-size:9.5pt;">(A) ${q.options[0]} &nbsp; (B) ${q.options[1]} &nbsp; (C) ${q.options[2]} &nbsp; (D) ${q.options[3]}</p>
      </div>`;
    });
    html += `</div>`;

    const p5count = currentExam.part5.length;
    html += `<div style="page-break-before:always;"></div>
      <h2 style="margin:0 0 12pt;">PART 6: TEXT COMPLETION</h2>
      <p style="font-size:9pt;margin-bottom:8pt;font-style:italic;">Directions: Choose the best answer for each blank in each text.</p>`;

    let q6num = 101 + p5count;
    currentExam.part6.forEach((p, pi) => {
      html += `<div class="question-block">
        <p style="font-size:8.5pt;font-weight:bold;margin-bottom:4pt;">Questions ${q6num}–${q6num+p.questions.length-1} refer to the following text.</p>
        <div class="passage-box">${p.passage.replace(/\n/g,'<br>')}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
          ${p.questions.map((q, qi) => `
            <div>
              <b>Q${q6num + qi}.</b> ${q.question || 'Choose the best answer for the blank.'}
              <div style="font-size:9pt;margin-top:2pt;">(A) ${q.options[0]} (B) ${q.options[1]} (C) ${q.options[2]} (D) ${q.options[3]}</div>
            </div>`).join('')}
        </div>
      </div>`;
      q6num += p.questions.length;
    });

    html += `<div style="page-break-before:always;"></div>
      <h2 style="margin:0 0 12pt;">PART 7: READING COMPREHENSION</h2>
      <p style="font-size:9pt;margin-bottom:8pt;font-style:italic;">Directions: Questions about the content of each text. Select the best answer.</p>`;

    let q7num = q6num;
    currentExam.part7.forEach(p => {
      const typeLabel = p.type === 'triple' ? '📄📄📄 TRIPLE PASSAGE' : p.type === 'double' ? '📄📄 DOUBLE PASSAGE' : '📄 SINGLE PASSAGE';
      html += `<div class="question-block">
        <p style="font-size:8.5pt;font-weight:bold;margin-bottom:4pt;">${typeLabel}${p.passageTitle ? ' – ' + p.passageTitle : ''}</p>
        <div class="passage-box">${p.passage.replace(/\n/g,'<br>')}</div>
        ${p.questions.map(q => {
          const line = `<p><b>Q${q7num}.</b> ${q.question}</p>
            <p style="margin-left:12pt;margin-bottom:5pt;font-size:9pt;">(A) ${q.options[0]} &nbsp; (B) ${q.options[1]} &nbsp; (C) ${q.options[2]} &nbsp; (D) ${q.options[3]}</p>`;
          q7num++;
          return line;
        }).join('')}
      </div>`;
    });

    document.getElementById('print-content').innerHTML = html;

    // Answer key as separate section
    const p6q = currentExam.part6.reduce((s,g)=>s+g.questions.length,0);
    const p7q = currentExam.part7.reduce((s,g)=>s+g.questions.length,0);
    const allQ = [
      ...currentExam.part5,
      ...currentExam.part6.flatMap(g => g.questions),
      ...currentExam.part7.flatMap(g => g.questions),
    ];
    const letters = ['A','B','C','D'];
    let keyHtml = `<div style="page-break-before:always;">
      <h2 style="margin:0 0 10pt;">ANSWER KEY – ${currentExam.name}</h2>
      <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:4px 12px;font-size:9pt;">
        ${allQ.map((q,i) => `<span>${i+101}. ${letters[q.answer]}</span>`).join('')}
      </div>
    </div>`;
    document.getElementById('print-content').innerHTML += keyHtml;

    window.print();
  }

  // ─── IN-CLASS WORKSHEET ───────────────────────────────────────
  function printInClassWorksheet(unitId) {
    const unit       = UNITS.find(u => u.id === unitId);
    const prevUnit   = UNITS.find(u => u.id === unitId - 1);
    if (!unit) return;

    const vocabItems  = DB.vocab.filter(v => unit.vocab.includes(v.category)).slice(0, 20);
    const grammarData = DB.grammar.filter(t => t.id === unit.grammar);
    const questions   = getQuestionsForUnit(unitId);
    const prevTitle   = prevUnit ? getGrammarTitle(prevUnit.grammar) : 'None';
    const currTitle   = getGrammarTitle(unit.grammar);

    const win = window.open('', '_blank');
    win.document.write(`<!DOCTYPE html><html><head>
      <meta charset="UTF-8">
      <title>Worksheet: ${unit.title}</title>
      <style>
        body{font-family:'Segoe UI',sans-serif;padding:40px;line-height:1.5;color:#111;font-size:10pt;}
        .hdr{text-align:center;border-bottom:2pt solid #000;padding-bottom:10px;margin-bottom:20px;}
        .sec{margin-top:22px;border-left:4pt solid #000;padding-left:8pt;font-weight:bold;font-size:11pt;}
        .vcab-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:12px;}
        .vbox{border:1pt solid #ccc;padding:6px;}
        .q-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:14px;}
        .qitem{margin-bottom:14px;page-break-inside:avoid;}
        .formula{background:#f0f7ff;border:1pt solid #c2d9ff;padding:8px;margin:8px 0;font-family:monospace;font-size:9.5pt;color:#1e40af;border-left:4pt solid #1e40af;}
        .example-box{background:#f9fafb;border-left:2pt solid #6b7280;padding:6px 10px;margin:4px 0;font-style:italic;font-size:9pt;color:#374151;}
        .tip-box{background:#fffcf0;border:1pt solid #fef3c7;padding:8px;margin:8px 0;font-size:8.5pt;color:#92400e;border-left:4pt solid #f59e0b;}
        table{border-collapse:collapse;width:100%;margin:6px 0;}
        th,td{border:1px solid #ddd;padding:4px 6px;font-size:8.5pt;}
        th{background:#f1f5f9;}
        .footer{margin-top:40px;font-size:8pt;text-align:center;color:#777;border-top:1pt solid #eee;padding-top:8px;}
        @media print{body{padding:0;}.no-print{display:none;}}
      </style>
    </head><body>
      <div class="hdr">
        <div style="font-size:18pt;font-weight:800;">TOEIC CLASSROOM PRACTICE</div>
        <div style="font-size:13pt;margin-top:4pt;">${unit.title}</div>
        <div style="font-size:9pt;margin-top:3pt;">Grammar Focus: ${currTitle} · Review: ${prevTitle}</div>
      </div>

      <div class="sec">I. KEY VOCABULARY</div>
      <div class="vcab-grid">
        ${vocabItems.map(v => `<div class="vbox"><b>${v.word}</b> <span style="color:#555">[${v.type}]</span><br>${v.meaning}</div>`).join('')}
      </div>

      ${grammarData.map(g => {
        // Strip quiz section from printed grammar
        const cleanContent = g.content.replace(/<div[^>]*class="grammar-quiz"[\s\S]*?(?=<div class="plan-step|$)/i, '');
        return `<div class="sec">II. GRAMMAR: ${g.title.toUpperCase()}</div>
          <div style="margin-top:10px;">${cleanContent}</div>`;
      }).join('')}

      <div class="sec">III. INTEGRATED PRACTICE (PART 5 & 6)</div>
      <div class="q-grid">
        ${questions.map((q, i) => `
          <div class="qitem">
            <b>Q${i+1}.</b> ${q.question}
            <div style="margin-top:4px;font-size:9pt;">
              (A) ${q.options[0]}<br>(B) ${q.options[1]}<br>(C) ${q.options[2]}<br>(D) ${q.options[3]}
            </div>
          </div>`).join('')}
      </div>

      <div class="footer">ETS 2025 ALIGNED CONTENT · FOR CLASSROOM USE ONLY · TOEIC TEACHER APP</div>
      <script>window.onload=()=>setTimeout(()=>window.print(),400);</script>
    </body></html>`);
    win.document.close();
  }

  // ─── HOMEWORK SHEET ───────────────────────────────────────────
  function printHomework(unitId) {
    const unit = UNITS.find(u => u.id === unitId);
    if (!unit) return;

    const code        = `HW-UNIT-${unitId}-${Math.floor(Math.random() * 9000 + 1000)}`;
    const vocabItems  = DB.vocab.filter(v => unit.vocab.includes(v.category)).slice(0, 15);
    const grammarData = DB.grammar.filter(t => t.id === unit.grammar);
    const questions   = getQuestionsForUnit(unitId);

    const win = window.open('', '_blank');
    win.document.write(`<!DOCTYPE html><html><head>
      <meta charset="UTF-8">
      <title>HOMEWORK: ${unit.title}</title>
      <style>
        body{font-family:'Segoe UI',sans-serif;padding:40px;line-height:1.6;color:#333;font-size:10pt;}
        .hdr{text-align:center;border-bottom:2px solid #000;padding-bottom:10px;margin-bottom:20px;}
        .code{font-family:monospace;float:right;font-weight:bold;background:#f1f5f9;padding:6px 12px;border-radius:4px;font-size:10pt;}
        .sec{margin-top:24px;font-size:11pt;font-weight:700;border-left:4pt solid #1e293b;padding-left:8pt;}
        .vgrid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:12px;}
        .vitem{border:1px solid #e2e8f0;padding:7px;}
        .qlist{margin-top:12px;}
        .qblock{margin-bottom:16px;page-break-inside:avoid;border-bottom:1px dashed #ccc;padding-bottom:12px;}
        .formula{background:#f0f7ff;border:1pt solid #c2d9ff;padding:8px;margin:8px 0;font-family:monospace;font-size:9.5pt;color:#1e40af;border-left:4pt solid #1e40af;}
        .example-box{background:#f9fafb;border-left:2pt solid #6b7280;padding:6px 10px;margin:4px 0;font-style:italic;font-size:9pt;}
        .tip-box{background:#fffcf0;border:1pt solid #fef3c7;padding:8px;margin:8px 0;font-size:8.5pt;color:#92400e;border-left:4pt solid #f59e0b;}
        table{border-collapse:collapse;width:100%;}
        th,td{border:1px solid #ddd;padding:4px 6px;font-size:8.5pt;}
        th{background:#f1f5f9;}
        .footer{margin-top:50px;font-size:8.5pt;color:#666;border-top:1px solid #eee;padding-top:10px;text-align:center;}
        @media print{body{padding:0;}}
      </style>
    </head><body>
      <div class="code">Code: ${code}</div>
      <div class="hdr">
        <div style="font-size:18pt;font-weight:800;">TOEIC HOMEWORK SHEET</div>
        <div style="font-size:13pt;margin-top:4pt;">Topic: ${unit.title}</div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:9pt;margin-bottom:6px;">
        <div>Họ và tên: ___________________________</div>
        <div>Lớp: ___________________________</div>
      </div>

      <div class="sec">I. VOCABULARY REVIEW</div>
      <p style="font-size:9pt;margin-top:6px;">Ghi lại nghĩa và đặt câu với ít nhất 5 từ dưới đây.</p>
      <div class="vgrid">
        ${vocabItems.map(v => `<div class="vitem"><b>${v.word}</b><br><span style="color:#555;font-size:8.5pt;">${v.meaning}</span></div>`).join('')}
      </div>

      ${grammarData.map(g => {
        const cleanContent = g.content.replace(/<div[^>]*class="grammar-quiz"[\s\S]*?(?=<\/div>\s*<\/div>)/i, '');
        return `<div class="sec">II. GRAMMAR REVIEW: ${g.title.toUpperCase()}</div>
          <div style="margin-top:10px;">${cleanContent}</div>`;
      }).join('')}

      <div class="sec">III. READING PRACTICE (PART 5 & 6)</div>
      <div class="qlist">
        ${questions.map((q, i) => `
          <div class="qblock">
            <b>Q${i+1}.</b> ${q.question}
            <div style="margin-top:5px;font-size:9.5pt;">
              (A) ${q.options[0]} &nbsp;(B) ${q.options[1]} &nbsp;(C) ${q.options[2]} &nbsp;(D) ${q.options[3]}
            </div>
          </div>`).join('')}
      </div>

      <div class="footer">
        📌 Nhập mã <b>${code}</b> vào mục "BTVN & Ôn tập Unit" trên cổng học viên để kiểm tra đáp án.
      </div>
      <script>window.onload=()=>setTimeout(()=>window.print(),400);</script>
    </body></html>`);
    win.document.close();
  }

  // ─── TRAP DASHBOARD ───────────────────────────────────────────
  function renderTrapDashboard() {
    const container = document.getElementById('trap-list');
    if (!container) return;

    const traps = [];
    DB.grammar.forEach(topic => {
      // Match ETS TRAP patterns in grammar content
      const re = /(?:⭐[^<]*TRAP[^<]*|⚠️[^<]+)([^<]{15,})/g;
      let m;
      while ((m = re.exec(topic.content)) !== null) {
        const txt = m[0].replace(/<[^>]*>/g,'').trim();
        if (txt.length > 20) traps.push({ topic: topic.title, text: txt.substring(0,160) });
      }
    });

    container.innerHTML = traps.length === 0
      ? `<p style="color:#64748b;">Chưa phát hiện trap nào trong dữ liệu ngữ pháp.</p>`
      : traps.map(t => `
          <div class="trap-card">
            <h4>📍 ${t.topic}</h4>
            <div>${t.text}${t.text.length >= 160 ? '...' : ''}</div>
          </div>`).join('');
  }

  // ─── Public API ───────────────────────────────────────────────
  return {
    init,
    openUnitModal,
    generateExam,
    printExam,
    printInClassWorksheet,
    printHomework,
  };
})();

// Auto-init when DOM is ready
document.addEventListener('DOMContentLoaded', () => TeacherApp.init());
