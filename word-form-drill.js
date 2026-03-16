// ═══════════════════════════════════════════════════════════════
//   Luyện từ loại – TOEIC Grammar Upgrade v2
//   Luyện nhận dạng từ loại đúng theo vị trí trong câu
//   (Danh từ / Động từ / Tính từ / Trạng từ)
//
//   Tích hợp: thêm <script src="word-form-drill.js"></script>
//   vào index.html SAU toeic-app.js
// ═══════════════════════════════════════════════════════════════

const WordFormDrill = (() => {

  // ─── Màu nhãn từ loại ─────────────────────────────────────────
  const POS_CONFIG = {
    noun:    { label: 'Danh từ',  color: '#3b82f6', bg: 'rgba(59,130,246,0.15)',  border: 'rgba(59,130,246,0.4)'  },
    verb:    { label: 'Động từ',  color: '#10b981', bg: 'rgba(16,185,129,0.15)',  border: 'rgba(16,185,129,0.4)'  },
    adj:     { label: 'Tính từ',  color: '#f59e0b', bg: 'rgba(245,158,11,0.15)',  border: 'rgba(245,158,11,0.4)'  },
    adv:     { label: 'Trạng từ', color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)',  border: 'rgba(139,92,246,0.4)'  },
  };

  // ─── Ngân hàng bài tập ────────────────────────────────────────
  // Mỗi bài gồm:
  //   family  : tên nhóm từ (hiển thị cho học viên)
  //   sentence: câu có [___] chỗ trống, [SIGNAL] tín hiệu ngữ pháp
  //   signal  : câu ngắn giải thích tín hiệu vị trí
  //   pos     : từ loại cần điền (noun/verb/adj/adv)
  //   options : 4 đáp án (các dạng của cùng một từ gốc)
  //   answer  : index đáp án đúng
  //   explanation: giải thích tại sao
  //   tip     : mẹo nhớ ngắn
  const WORD_FORM_DATA = [

    // ══════════════════════
    //  NHÓM: effect / effective / effectively / effectiveness
    // ══════════════════════
    {
      id: 'wf-001', family: 'effect – effective – effectively – effectiveness',
      sentence: 'The new strategy proved highly [___] in reducing operational costs.',
      signal: 'Sau linking verb "proved" + "highly" (trạng từ bổ nghĩa) → cần tính từ',
      pos: 'adj',
      options: ['effect', 'effective', 'effectively', 'effectiveness'],
      answer: 1,
      explanation: '"Proved + tính từ" = linking verb + complement. "Effective" (tính từ) = hiệu quả. "Effectively" là trạng từ không dùng sau linking verb. "Effect/effectiveness" là danh từ.',
      tip: 'Sau linking verb (prove, seem, become, remain) → tính từ, không phải trạng từ'
    },
    {
      id: 'wf-002', family: 'effect – effective – effectively – effectiveness',
      sentence: 'The team communicated [___] during the crisis, keeping all stakeholders informed.',
      signal: 'Sau động từ hành động "communicated" → cần trạng từ',
      pos: 'adv',
      options: ['effect', 'effective', 'effectively', 'effectiveness'],
      answer: 2,
      explanation: '"Communicated effectively" = trạng từ bổ nghĩa cho động từ hành động. Chỉ trạng từ (-ly) mới đứng sau động từ hành động để nói về cách thức.',
      tip: 'Sau động từ hành động (work, communicate, perform) → trạng từ (-ly)'
    },
    {
      id: 'wf-003', family: 'effect – effective – effectively – effectiveness',
      sentence: 'The [___] of the new training program was evaluated after three months.',
      signal: 'Sau mạo từ "The" + đứng làm chủ ngữ → cần danh từ',
      pos: 'noun',
      options: ['effect', 'effective', 'effectively', 'effectiveness'],
      answer: 3,
      explanation: '"The + [danh từ] + of..." là cấu trúc danh từ chủ ngữ. "Effectiveness" = sự hiệu quả (danh từ trừu tượng). "Effect" cũng là danh từ nhưng nghĩa là "tác động/kết quả", không phù hợp ngữ cảnh đánh giá chương trình.',
      tip: 'The + ___ + of = vị trí danh từ trừu tượng (-ness, -tion, -ance, -ity)'
    },

    // ══════════════════════
    //  NHÓM: implement / implementation / implementing / implemented
    // ══════════════════════
    {
      id: 'wf-004', family: 'implement – implementation – implementing – implemented',
      sentence: 'The [___] of the new safety protocols will begin next Monday.',
      signal: 'Sau "The" + làm chủ ngữ cho "will begin" → cần danh từ',
      pos: 'noun',
      options: ['implement', 'implementation', 'implementing', 'implemented'],
      answer: 1,
      explanation: '"The implementation of..." = danh từ làm chủ ngữ. Cấu trúc "The + noun + of + noun phrase" rất phổ biến trong văn bản công ty TOEIC.',
      tip: 'The ___ of [cái gì đó] → luôn là danh từ (-tion, -ment, -ance)'
    },
    {
      id: 'wf-005', family: 'implement – implementation – implementing – implemented',
      sentence: 'The company plans to [___] the new system before the end of Q3.',
      signal: 'Sau "to" (to-infinitive) → cần động từ nguyên mẫu',
      pos: 'verb',
      options: ['implement', 'implementation', 'implementing', 'implemented'],
      answer: 0,
      explanation: '"To + V (nguyên mẫu)" = to-infinitive. "Implement" là động từ nguyên mẫu. "Implementation" là danh từ không dùng sau "to" kiểu này.',
      tip: 'Plan to / decide to / agree to + V nguyên mẫu (không phải danh từ)'
    },

    // ══════════════════════
    //  NHÓM: satisfy / satisfied / satisfying / satisfaction
    // ══════════════════════
    {
      id: 'wf-006', family: 'satisfy – satisfied – satisfying – satisfaction',
      sentence: 'Employee [___] has improved significantly since the new benefits package was introduced.',
      signal: '"Employee" đứng trước như tính từ bổ nghĩa → cần danh từ làm chủ ngữ',
      pos: 'noun',
      options: ['satisfy', 'satisfied', 'satisfying', 'satisfaction'],
      answer: 3,
      explanation: '"Employee satisfaction" = cụm danh từ (noun phrase). "Satisfaction" là danh từ làm chủ ngữ cho "has improved". "Satisfy" là động từ, "satisfied/satisfying" là tính từ.',
      tip: 'Noun + [___] + has/have = chủ ngữ kép → vị trí thứ hai là danh từ'
    },
    {
      id: 'wf-007', family: 'satisfy – satisfied – satisfying – satisfaction',
      sentence: 'The auditors were [___] with the company\'s financial reporting standards.',
      signal: '"Were" (linking verb) + "with" gợi ý cảm xúc → cần tính từ chỉ người',
      pos: 'adj',
      options: ['satisfy', 'satisfied', 'satisfying', 'satisfaction'],
      answer: 1,
      explanation: '"Were satisfied" = be + tính từ (past participle dùng như tính từ). "Satisfied with" = hài lòng với (người cảm nhận). "Satisfying" = làm thỏa mãn (vật gây ra cảm xúc).',
      tip: 'Người cảm nhận → -ed (satisfied, excited, bored). Vật gây cảm xúc → -ing (satisfying, exciting, boring)'
    },
    {
      id: 'wf-008', family: 'satisfy – satisfied – satisfying – satisfaction',
      sentence: 'Winning the industry award was a truly [___] achievement for the entire team.',
      signal: '"A truly" (mạo từ + trạng từ) trước danh từ "achievement" → cần tính từ',
      pos: 'adj',
      options: ['satisfy', 'satisfied', 'satisfying', 'satisfaction'],
      answer: 2,
      explanation: '"A + (trạng từ) + tính từ + danh từ" = cấu trúc cụm danh từ. "Satisfying achievement" = thành tựu mang lại sự thỏa mãn (vật gây cảm xúc → -ing).',
      tip: 'a/an/the + [trạng từ] + ___ + danh từ → tính từ'
    },

    // ══════════════════════
    //  NHÓM: innovate / innovative / innovation / innovatively
    // ══════════════════════
    {
      id: 'wf-009', family: 'innovate – innovative – innovation – innovatively',
      sentence: 'The team\'s [___] approach to product design has set a new industry benchmark.',
      signal: '"Team\'s" (sở hữu cách) + trước "approach" (danh từ) → cần tính từ',
      pos: 'adj',
      options: ['innovate', 'innovative', 'innovation', 'innovatively'],
      answer: 1,
      explanation: '"Innovative approach" = tính từ + danh từ. Tính từ đứng trước danh từ để bổ nghĩa. "Innovation" là danh từ không thể đứng trước danh từ khác làm tính từ.',
      tip: 'Possessive (\'s) + ___ + noun → tính từ bổ nghĩa'
    },
    {
      id: 'wf-010', family: 'innovate – innovative – innovation – innovatively',
      sentence: 'Continuous [___] is essential for companies competing in fast-moving markets.',
      signal: '"Continuous" (tính từ) đứng trước + làm chủ ngữ → cần danh từ',
      pos: 'noun',
      options: ['innovate', 'innovative', 'innovation', 'innovatively'],
      answer: 2,
      explanation: '"Continuous innovation" = tính từ + danh từ làm chủ ngữ. "Continuous" là tính từ → phải đứng trước danh từ, không thể trước động từ hay trạng từ.',
      tip: 'Tính từ (continuous, rapid, significant) + ___ → danh từ'
    },
    {
      id: 'wf-011', family: 'innovate – innovative – innovation – innovatively',
      sentence: 'The R&D team approached the challenge [___], finding solutions no one had considered before.',
      signal: 'Sau động từ "approached" + dấu phẩy → cần trạng từ bổ nghĩa cách thức',
      pos: 'adv',
      options: ['innovate', 'innovative', 'innovation', 'innovatively'],
      answer: 3,
      explanation: '"Approached innovatively" = động từ + trạng từ (cách thức). Trạng từ có thể đứng sau động từ hoặc cuối câu. "Innovative" là tính từ không dùng để bổ nghĩa cho động từ.',
      tip: 'Động từ + ___ (cách thức) → trạng từ (-ly)'
    },

    // ══════════════════════
    //  NHÓM: comply / compliant / compliance / complying
    // ══════════════════════
    {
      id: 'wf-012', family: 'comply – compliant – compliance – complying',
      sentence: 'The board must ensure full [___] with the new financial reporting standards.',
      signal: '"Full" (tính từ) đứng trước + sau "ensure" → cần danh từ tân ngữ',
      pos: 'noun',
      options: ['comply', 'compliant', 'compliance', 'complying'],
      answer: 2,
      explanation: '"Ensure full compliance" = ensure + tính từ + danh từ tân ngữ. "Compliance with" là cụm danh từ cố định trong văn bản pháp lý/công ty TOEIC.',
      tip: 'Ensure + full/strict/complete + ___ → danh từ tân ngữ'
    },
    {
      id: 'wf-013', family: 'comply – compliant – compliance – complying',
      sentence: 'All new suppliers must be [___] with international environmental standards.',
      signal: '"Be" (linking verb) + "with" → cần tính từ',
      pos: 'adj',
      options: ['comply', 'compliant', 'compliance', 'complying'],
      answer: 1,
      explanation: '"Be compliant with" = be + tính từ + giới từ. "Compliant" = tuân thủ (tính từ). "Compliance" là danh từ không dùng sau "be" như này.',
      tip: 'Be + ___ + with/of/in → tính từ (-ant, -ent, -ive, -ful)'
    },

    // ══════════════════════
    //  NHÓM: perform / performance / performing / performer
    // ══════════════════════
    {
      id: 'wf-014', family: 'perform – performance – performing – performer',
      sentence: 'The product\'s [___] has improved significantly following feedback from the pilot launch.',
      signal: '"The product\'s" (sở hữu cách) + làm chủ ngữ → cần danh từ',
      pos: 'noun',
      options: ['perform', 'performance', 'performing', 'performer'],
      answer: 1,
      explanation: '"Product\'s performance" = danh từ sở hữu + danh từ. Sau sở hữu cách (\'s) luôn là danh từ. "Performing" là V-ing không làm chủ ngữ sau sở hữu cách.',
      tip: 'Noun\'s + ___ → danh từ (không phải V-ing)'
    },
    {
      id: 'wf-015', family: 'perform – performance – performing – performer',
      sentence: 'Ms. Kim was recognized as the top [___] in the sales division this quarter.',
      signal: '"The top" + làm tân ngữ sau "as" → cần danh từ chỉ người',
      pos: 'noun',
      options: ['perform', 'performance', 'performing', 'performer'],
      answer: 3,
      explanation: '"Top performer" = tính từ + danh từ chỉ người (agent noun). "-er" suffix chỉ người thực hiện hành động. "Performance" chỉ kết quả/chất lượng, không chỉ người.',
      tip: 'Top/best/leading + ___ chỉ người → danh từ đuôi -er/-or'
    },

    // ══════════════════════
    //  NHÓM: analyze / analysis / analytical / analytically
    // ══════════════════════
    {
      id: 'wf-016', family: 'analyze – analysis – analytical – analytically',
      sentence: 'The report provided a thorough [___] of market trends over the past decade.',
      signal: '"A thorough" (mạo từ + tính từ) + sau giới từ "of" → cần danh từ',
      pos: 'noun',
      options: ['analyze', 'analysis', 'analytical', 'analytically'],
      answer: 1,
      explanation: '"A thorough analysis of..." = mạo từ + tính từ + danh từ + giới từ. Đây là cấu trúc cụm danh từ chuẩn. "Analyze" là động từ không thể đứng sau "a thorough".',
      tip: 'A/an + [tính từ] + ___ of → danh từ tân ngữ'
    },
    {
      id: 'wf-017', family: 'analyze – analysis – analytical – analytically',
      sentence: 'Candidates applying for the data science role must have strong [___] skills.',
      signal: '"Strong" (tính từ) + trước "skills" (danh từ) → cần tính từ song song',
      pos: 'adj',
      options: ['analyze', 'analysis', 'analytical', 'analytically'],
      answer: 2,
      explanation: '"Strong analytical skills" = tính từ 1 + tính từ 2 + danh từ. "Analytical" bổ nghĩa cho "skills". "Analysis" là danh từ không thể ghép trực tiếp thành "analysis skills".',
      tip: 'strong/excellent/good + ___ skills/ability → tính từ'
    },

    // ══════════════════════
    //  NHÓM: manage / manager / management / managerial
    // ══════════════════════
    {
      id: 'wf-018', family: 'manage – manager – management – managerial',
      sentence: 'Effective [___] of resources is critical to the success of any large-scale project.',
      signal: '"Effective" (tính từ) đứng trước + làm chủ ngữ → cần danh từ',
      pos: 'noun',
      options: ['manage', 'manager', 'management', 'managerial'],
      answer: 2,
      explanation: '"Effective management of resources" = tính từ + danh từ + giới từ. "Management" = sự quản lý (uncountable noun). "Manager" là người, không phải hoạt động quản lý.',
      tip: 'Effective/efficient + ___ of [resources/time/staff] → danh từ trừu tượng'
    },
    {
      id: 'wf-019', family: 'manage – manager – management – managerial',
      sentence: 'Employees promoted to [___] positions are required to attend a leadership workshop.',
      signal: 'Trước "positions" (danh từ) → cần tính từ bổ nghĩa',
      pos: 'adj',
      options: ['manage', 'manager', 'management', 'managerial'],
      answer: 3,
      explanation: '"Managerial positions" = tính từ + danh từ. "Managerial" = thuộc về quản lý (tính từ). "Management positions" cũng thấy trong thực tế nhưng "managerial" là dạng tính từ chuẩn trong TOEIC.',
      tip: 'Khi cần tính từ trước danh từ → tìm dạng đuôi -ial, -al, -ive, -ful'
    },

    // ══════════════════════
    //  NHÓM: present / presentation / presentable / presently
    // ══════════════════════
    {
      id: 'wf-020', family: 'present – presentation – presentable – presently',
      sentence: 'The marketing team delivered an impressive [___] to the board of directors.',
      signal: '"An impressive" (mạo từ + tính từ) + tân ngữ của "delivered" → cần danh từ',
      pos: 'noun',
      options: ['present', 'presentation', 'presentable', 'presently'],
      answer: 1,
      explanation: '"An impressive presentation" = mạo từ + tính từ + danh từ tân ngữ. "Presentation" = bài thuyết trình. "Present" là động từ/tính từ/danh từ nhưng không phù hợp ngữ cảnh "delivered an impressive ___".',
      tip: 'delivered/gave/made an impressive ___ → danh từ chỉ sản phẩm/kết quả'
    },
    {
      id: 'wf-021', family: 'present – presentation – presentable – presently',
      sentence: 'The company is [___] reviewing its supplier contracts to ensure competitive pricing.',
      signal: '"Is" + trước "reviewing" (V-ing) → cần trạng từ bổ nghĩa thời gian',
      pos: 'adv',
      options: ['present', 'presentation', 'presentable', 'presently'],
      answer: 3,
      explanation: '"Is presently reviewing" = be + trạng từ + V-ing. "Presently" = hiện tại, ngay bây giờ (adverb). Tương tự: currently, actively, actively reviewing.',
      tip: 'Is/are + ___ + V-ing → trạng từ thời gian/cách thức (currently, presently, actively)'
    },

    // ══════════════════════
    //  NHÓM: vary / various / variety / variously
    // ══════════════════════
    {
      id: 'wf-022', family: 'vary – various – variety – variously',
      sentence: 'The new menu offers a wide [___] of options to accommodate different dietary needs.',
      signal: '"A wide" (mạo từ + tính từ) → cần danh từ tân ngữ của "offers"',
      pos: 'noun',
      options: ['vary', 'various', 'variety', 'variously'],
      answer: 2,
      explanation: '"A wide variety of" = cụm danh từ cố định (= a large number of different things). "Various" là tính từ không dùng sau "a wide". Đây là collocation rất hay gặp trong TOEIC.',
      tip: '"A wide ___ of" → cụm cố định: a wide variety of'
    },
    {
      id: 'wf-023', family: 'vary – various – variety – variously',
      sentence: '[___] departments have expressed interest in adopting the new project management software.',
      signal: 'Đứng đầu câu + trước "departments" (danh từ số nhiều) → cần tính từ',
      pos: 'adj',
      options: ['vary', 'various', 'variety', 'variously'],
      answer: 1,
      explanation: '"Various departments" = tính từ + danh từ số nhiều. "Various" = nhiều, đa dạng (tính từ). "Variety" là danh từ không đứng trước danh từ khác trực tiếp.',
      tip: '___ + [danh từ số nhiều] ở đầu câu → tính từ (various, several, numerous)'
    },

    // ══════════════════════
    //  NHÓM: signify / significant / significantly / significance
    // ══════════════════════
    {
      id: 'wf-024', family: 'signify – significant – significantly – significance',
      sentence: 'Revenue increased [___] in the third quarter, surpassing all forecasts.',
      signal: 'Sau động từ "increased" + bổ nghĩa mức độ → cần trạng từ',
      pos: 'adv',
      options: ['signify', 'significant', 'significantly', 'significance'],
      answer: 2,
      explanation: '"Increased significantly" = động từ + trạng từ mức độ. "Significantly" bổ nghĩa cho động từ "increased", chỉ mức độ tăng. "Significant" là tính từ không thể bổ nghĩa động từ.',
      tip: 'Động từ + ___ (mức độ) → trạng từ: significantly, considerably, substantially'
    },
    {
      id: 'wf-025', family: 'signify – significant – significantly – significance',
      sentence: 'The [___] of the partnership agreement extends beyond financial benefits.',
      signal: '"The" + làm chủ ngữ + "extends" → cần danh từ',
      pos: 'noun',
      options: ['signify', 'significant', 'significantly', 'significance'],
      answer: 3,
      explanation: '"The significance of..." = danh từ trừu tượng làm chủ ngữ. "Significance" = tầm quan trọng, ý nghĩa. "Significant" là tính từ không làm chủ ngữ sau "The" theo cách này.',
      tip: 'The ___ of [sự việc] → danh từ trừu tượng (-ance, -ence, -ity, -ness)'
    },

    // ══════════════════════
    //  NHÓM: produce / product / productive / productively
    // ══════════════════════
    {
      id: 'wf-026', family: 'produce – product – productive – productively',
      sentence: 'The new workspace layout has made employees significantly more [___].',
      signal: '"More" (so sánh hơn) đứng trước → cần tính từ',
      pos: 'adj',
      options: ['produce', 'product', 'productive', 'productively'],
      answer: 2,
      explanation: '"More productive" = more + tính từ (so sánh hơn). "Productively" là trạng từ không đi với "more" theo kiểu so sánh tính từ.',
      tip: 'More/less + ___ → tính từ (không phải trạng từ)'
    },
    {
      id: 'wf-027', family: 'produce – product – productive – productively',
      sentence: 'The factory launched three new [___] lines targeting the premium segment.',
      signal: '"Three new" (số từ + tính từ) + trước "lines" → cần tính từ hoặc danh từ làm modifier',
      pos: 'noun',
      options: ['produce', 'product', 'productive', 'productively'],
      answer: 1,
      explanation: '"Product lines" = danh từ ghép (compound noun). "Product" đứng trước "lines" như danh từ modifier. Đây là cấu trúc Noun + Noun rất phổ biến trong tiếng Anh thương mại.',
      tip: 'Noun + Noun ghép (product line, budget report, marketing campaign) → danh từ modifier'
    },

    // ══════════════════════
    //  NHÓM: access / accessible / accessibility / accessibly
    // ══════════════════════
    {
      id: 'wf-028', family: 'access – accessible – accessibility – accessibly',
      sentence: 'Remote employees can [___] company files securely through the new cloud platform.',
      signal: 'Sau "can" (modal verb) → cần động từ nguyên mẫu',
      pos: 'verb',
      options: ['access', 'accessible', 'accessibility', 'accessibly'],
      answer: 0,
      explanation: '"Can + V nguyên mẫu" = modal + bare infinitive. "Access" là động từ ("to access a file"). "Accessible" là tính từ, "accessibility" là danh từ.',
      tip: 'Can/could/will/should/must + ___ → động từ nguyên mẫu'
    },
    {
      id: 'wf-029', family: 'access – accessible – accessibility – accessibly',
      sentence: 'The new app makes financial planning [___] to people without a banking background.',
      signal: '"Makes [tân ngữ] + ___" = SVOC structure → cần tính từ bổ nghĩa tân ngữ',
      pos: 'adj',
      options: ['access', 'accessible', 'accessibility', 'accessibly'],
      answer: 1,
      explanation: '"Makes [something] accessible" = make + object + adjective (SVOC). Tính từ bổ nghĩa cho tân ngữ "financial planning". "Accessibly" là trạng từ không dùng trong cấu trúc SVOC.',
      tip: 'Make/keep/find + object + ___ → tính từ (SVOC structure)'
    },

    // ══════════════════════
    //  NHÓM: proceed / procedure / procedural / procedurally
    // ══════════════════════
    {
      id: 'wf-030', family: 'proceed – procedure – procedural – procedurally',
      sentence: 'All complaints must follow the standard [___] outlined in the employee handbook.',
      signal: '"The standard" (mạo từ + tính từ) + tân ngữ của "follow" → cần danh từ',
      pos: 'noun',
      options: ['proceed', 'procedure', 'procedural', 'procedurally'],
      answer: 1,
      explanation: '"Follow the standard procedure" = follow + the + adjective + noun. "Procedure" = quy trình (danh từ đếm được). "Procedural" là tính từ không dùng sau "the standard" như tân ngữ.',
      tip: 'follow/adhere to/comply with the ___ → danh từ chỉ quy trình/quy định'
    },
    {
      id: 'wf-031', family: 'proceed – procedure – procedural – procedurally',
      sentence: 'The contract was deemed invalid due to [___] errors during the signing process.',
      signal: '"Due to" (giới từ) + trước "errors" (danh từ) → cần tính từ',
      pos: 'adj',
      options: ['proceed', 'procedure', 'procedural', 'procedurally'],
      answer: 2,
      explanation: '"Procedural errors" = tính từ + danh từ. "Procedural" = liên quan đến thủ tục/quy trình. "Due to + adj + noun" là cụm giới từ chỉ nguyên nhân.',
      tip: 'Due to + ___ + noun → tính từ bổ nghĩa danh từ'
    },

    // ══════════════════════
    //  NHÓM: responsible / responsibility / responsibly / irresponsible
    // ══════════════════════
    {
      id: 'wf-032', family: 'responsible – responsibility – responsibly – irresponsible',
      sentence: 'Each department head bears [___] for the accuracy of the submitted reports.',
      signal: '"Bears" (động từ) + tân ngữ trực tiếp → cần danh từ',
      pos: 'noun',
      options: ['responsible', 'responsibility', 'responsibly', 'irresponsible'],
      answer: 1,
      explanation: '"Bear responsibility" = collocation cố định (chịu trách nhiệm). "Responsibility" là danh từ tân ngữ. "Responsible" là tính từ không làm tân ngữ trực tiếp.',
      tip: 'Bear/take/accept/assign + ___ → danh từ (responsibility, authority, accountability)'
    },
    {
      id: 'wf-033', family: 'responsible – responsibility – responsibly – irresponsible',
      sentence: 'Companies are expected to source materials [___] and reduce their carbon footprint.',
      signal: 'Sau động từ "source" + liệt kê với "and reduce" → cần trạng từ cách thức',
      pos: 'adv',
      options: ['responsible', 'responsibility', 'responsibly', 'irresponsible'],
      answer: 2,
      explanation: '"Source responsibly" = động từ + trạng từ cách thức. Trạng từ bổ nghĩa cho động từ "source". "Responsible" là tính từ không bổ nghĩa động từ.',
      tip: 'source/act/behave + ___ (cách thức) → trạng từ (-ly)'
    },

    // ══════════════════════
    //  NHÓM: determine / determination / determined / determinedly
    // ══════════════════════
    {
      id: 'wf-034', family: 'determine – determination – determined – determinedly',
      sentence: 'Despite numerous setbacks, the team showed remarkable [___] to complete the project on time.',
      signal: '"Remarkable" (tính từ) + tân ngữ của "showed" → cần danh từ',
      pos: 'noun',
      options: ['determine', 'determination', 'determined', 'determinedly'],
      answer: 1,
      explanation: '"Showed remarkable determination" = showed + tính từ + danh từ tân ngữ. "Determination" = sự quyết tâm (danh từ trừu tượng). "Determined" là tính từ không làm tân ngữ trực tiếp.',
      tip: 'Show/demonstrate/display remarkable ___ → danh từ trừu tượng (-tion, -ness, -ity)'
    },
    {
      id: 'wf-035', family: 'determine – determination – determined – determinedly',
      sentence: 'The new CEO appeared [___] to turn around the company\'s financial performance.',
      signal: '"Appeared" (linking verb) + "to turn around" → cần tính từ trước to-infinitive',
      pos: 'adj',
      options: ['determine', 'determination', 'determined', 'determinedly'],
      answer: 2,
      explanation: '"Appeared determined to V" = linking verb + tính từ + to-infinitive. Cấu trúc adj + to-infinitive biểu thị mục đích/ý định. "Determinedly" là trạng từ không dùng sau appear.',
      tip: 'appear/seem/look/remain + ___ + to V → tính từ'
    },

    // ══════════════════════
    //  NHÓM: develop / development / developer / undeveloped
    // ══════════════════════
    {
      id: 'wf-036', family: 'develop – development – developer – undeveloped',
      sentence: 'The company invested heavily in the [___] of its proprietary software platform.',
      signal: '"The" + sau "in" (giới từ) + "of" gợi ý → cần danh từ',
      pos: 'noun',
      options: ['develop', 'development', 'developer', 'undeveloped'],
      answer: 1,
      explanation: '"Invested in the development of..." = invest + in + the + noun + of. Cấu trúc "in the ___ of" luôn cần danh từ. "Developer" chỉ người, không phải hoạt động.',
      tip: 'invest in / participate in / focus on the ___ of → danh từ trừu tượng'
    },
    {
      id: 'wf-037', family: 'develop – development – developer – undeveloped',
      sentence: 'The company is actively looking to hire an experienced software [___].',
      signal: '"An experienced software" + tân ngữ của "hire" → cần danh từ chỉ người',
      pos: 'noun',
      options: ['develop', 'development', 'developer', 'undeveloped'],
      answer: 2,
      explanation: '"An experienced software developer" = danh từ chỉ nghề nghiệp. "Developer" = người phát triển. Phân biệt với "development" (quá trình/kết quả).',
      tip: 'hire an experienced ___ → danh từ chỉ nghề nghiệp (-er, -or, -ist, -ian)'
    },

    // ══════════════════════
    //  NHÓM: require / requirement / required / requiring
    // ══════════════════════
    {
      id: 'wf-038', family: 'require – requirement – required – requiring',
      sentence: 'Meeting the minimum educational [___] is mandatory for all applicants.',
      signal: '"Educational" (tính từ) + làm chủ ngữ → cần danh từ',
      pos: 'noun',
      options: ['require', 'requirement', 'required', 'requiring'],
      answer: 1,
      explanation: '"Educational requirement" = tính từ + danh từ làm chủ ngữ. "Requirement" (số ít) hoặc "requirements" (số nhiều) = yêu cầu. "Required" là tính từ/V3 không làm chủ ngữ.',
      tip: 'educational/minimum/basic ___ → danh từ (-ment, -tion, -ance)'
    },
    {
      id: 'wf-039', family: 'require – requirement – required – requiring',
      sentence: 'All [___] documents must be submitted to the HR department by Friday.',
      signal: '"All" + trước "documents" → cần tính từ bổ nghĩa',
      pos: 'adj',
      options: ['require', 'requirement', 'required', 'requiring'],
      answer: 2,
      explanation: '"All required documents" = all + tính từ + danh từ. "Required" = được yêu cầu (past participle dùng như tính từ). "Requirement documents" sai — danh từ không thể ghép trực tiếp như vậy.',
      tip: 'All + ___ + documents/forms/materials → tính từ (required, necessary, completed)'
    },

    // ══════════════════════
    //  NHÓM: contribute / contribution / contributor / considerably
    //  (bonus: nhóm hay nhầm lẫn)
    // ══════════════════════
    {
      id: 'wf-040', family: 'contribute – contribution – contributor – considerable',
      sentence: 'The merger made a [___] contribution to the company\'s expansion into new markets.',
      signal: '"A" + trước "contribution" (danh từ) → cần tính từ bổ nghĩa',
      pos: 'adj',
      options: ['contribute', 'contribution', 'considerable', 'considerably'],
      answer: 2,
      explanation: '"A considerable contribution" = mạo từ + tính từ + danh từ. "Considerable" = đáng kể (tính từ). "Considerably" là trạng từ không đứng giữa mạo từ và danh từ.',
      tip: 'A/an + ___ + noun → tính từ (considerable, significant, remarkable)'
    },
    {
      id: 'wf-041', family: 'contribute – contribution – contributor – considerable',
      sentence: 'Online sales have grown [___] since the launch of the new mobile application.',
      signal: '"Have grown" + bổ nghĩa mức độ → cần trạng từ',
      pos: 'adv',
      options: ['contribute', 'contribution', 'considerable', 'considerably'],
      answer: 3,
      explanation: '"Have grown considerably" = present perfect + trạng từ mức độ. "Considerably" = đáng kể (adverb). "Considerable" là tính từ không bổ nghĩa động từ.',
      tip: 'has/have + V3 + ___ (mức độ) → trạng từ (considerably, significantly, substantially)'
    },

    // ══════════════════════
    //  NHÓM: aware / awareness / unaware / unawareness
    // ══════════════════════
    {
      id: 'wf-042', family: 'aware – awareness – unaware – unawareness',
      sentence: 'The campaign successfully raised [___] of the dangers of workplace burnout.',
      signal: '"Raised" (động từ quá khứ) + tân ngữ → cần danh từ',
      pos: 'noun',
      options: ['aware', 'awareness', 'unaware', 'unawareness'],
      answer: 1,
      explanation: '"Raise awareness of" = cụm động từ + danh từ cố định. "Raise awareness" = nâng cao nhận thức. "Aware" là tính từ không làm tân ngữ trực tiếp.',
      tip: 'raise/build/increase ___ → danh từ (awareness, confidence, efficiency)'
    },
    {
      id: 'wf-043', family: 'aware – awareness – unaware – unawareness',
      sentence: 'Staff members are encouraged to remain [___] of changes to company policy.',
      signal: '"Remain" (linking verb) + "of" → cần tính từ',
      pos: 'adj',
      options: ['aware', 'awareness', 'unaware', 'unawareness'],
      answer: 0,
      explanation: '"Remain aware of" = linking verb + tính từ + giới từ. "Aware of" = nhận thức được (tính từ + giới từ cố định). "Awareness" là danh từ không dùng sau "remain" như vậy.',
      tip: 'remain/stay/become + ___ of → tính từ (aware, mindful, conscious)'
    },

    // ══════════════════════
    //  NHÓM: compete / competitive / competition / competitor
    // ══════════════════════
    {
      id: 'wf-044', family: 'compete – competitive – competition – competitor',
      sentence: 'To attract top talent, the company must offer a [___] salary package.',
      signal: '"A" + trước "salary package" (danh từ) → cần tính từ',
      pos: 'adj',
      options: ['compete', 'competitive', 'competition', 'competitor'],
      answer: 1,
      explanation: '"A competitive salary package" = mạo từ + tính từ + cụm danh từ. "Competitive salary" = mức lương cạnh tranh. Đây là collocation chuẩn trong tuyển dụng TOEIC.',
      tip: 'a ___ salary/price/advantage → tính từ (competitive, attractive, generous)'
    },
    {
      id: 'wf-045', family: 'compete – competitive – competition – competitor',
      sentence: 'The firm closely monitors its main [___] to stay ahead in the market.',
      signal: '"Main" (tính từ) + tân ngữ của "monitors" → cần danh từ chỉ người/tổ chức',
      pos: 'noun',
      options: ['compete', 'competitive', 'competition', 'competitor'],
      answer: 3,
      explanation: '"Main competitor" = tính từ + danh từ chỉ tổ chức cạnh tranh. "Competitors" (số nhiều) vì "monitors its main ___s". "Competition" là danh từ tập hợp chỉ môi trường cạnh tranh, không chỉ từng công ty cụ thể.',
      tip: 'main/key/direct ___ → danh từ chỉ đối thủ cụ thể (-or, -er, -ant)'
    },

    // ══════════════════════
    //  NHÓM: announce / announcement / announced / announcing
    // ══════════════════════
    {
      id: 'wf-046', family: 'announce – announcement – announced – announcing',
      sentence: 'A formal [___] of the contract will be made at the signing ceremony next week.',
      signal: '"A formal" (mạo từ + tính từ) + chủ ngữ → cần danh từ',
      pos: 'noun',
      options: ['announce', 'announcement', 'announced', 'announcing'],
      answer: 1,
      explanation: '"A formal announcement" = mạo từ + tính từ + danh từ. "Announcement" = thông báo chính thức. "Announce" là động từ không đứng sau "a formal".',
      tip: 'A formal/official/public ___ → danh từ (-ment, -tion, -ance)'
    },
    {
      id: 'wf-047', family: 'announce – announcement – announced – announcing',
      sentence: 'The merger was [___] at a press conference attended by over 200 journalists.',
      signal: '"Was" (be) + bổ nghĩa → cần V3 bị động',
      pos: 'verb',
      options: ['announce', 'announcement', 'announced', 'announcing'],
      answer: 2,
      explanation: '"Was announced" = bị động quá khứ (be + V3). "Announced" là V3 của announce. "Announcing" là V-ing không dùng trong cấu trúc bị động đơn giản.',
      tip: 'Was/were + ___ → V3 (bị động quá khứ)'
    },

    // ══════════════════════
    //  NHÓM: formal / formality / formally / formalize
    // ══════════════════════
    {
      id: 'wf-048', family: 'formal – formality – formally – formalize',
      sentence: 'The board has [___] authorized the release of funds for the new infrastructure project.',
      signal: '"Has + [___] + V3" → cần trạng từ xen vào giữa',
      pos: 'adv',
      options: ['formal', 'formality', 'formally', 'formalize'],
      answer: 2,
      explanation: '"Has formally authorized" = trạng từ xen vào giữa have và V3 trong present perfect. "Formally" = một cách chính thức. "Formal" là tính từ không xen vào cấu trúc này.',
      tip: 'Has/have + ___ + V3 → trạng từ xen vào giữa (formally, officially, recently)'
    },
    {
      id: 'wf-049', family: 'formal – formality – formally – formalize',
      sentence: 'Wearing a suit to the interview is considered a basic [___] in the finance industry.',
      signal: '"A basic" (mạo từ + tính từ) + tân ngữ → cần danh từ',
      pos: 'noun',
      options: ['formal', 'formality', 'formally', 'formalize'],
      answer: 1,
      explanation: '"A basic formality" = mạo từ + tính từ + danh từ. "Formality" = điều mang tính hình thức/nghi lễ. "Formal" là tính từ không làm tân ngữ trực tiếp sau "a basic".',
      tip: 'A basic/mere/standard ___ → danh từ tân ngữ'
    },

    // ══════════════════════
    //  NHÓM: disappoint / disappointed / disappointing / disappointment
    // ══════════════════════
    {
      id: 'wf-050', family: 'disappoint – disappointed – disappointing – disappointment',
      sentence: 'The committee expressed its [___] with the vendor\'s lack of transparency.',
      signal: '"Its" (sở hữu đại từ) + tân ngữ của "expressed" → cần danh từ',
      pos: 'noun',
      options: ['disappoint', 'disappointed', 'disappointing', 'disappointment'],
      answer: 3,
      explanation: '"Expressed its disappointment" = express + possessive + noun. "Disappointment" = sự thất vọng (danh từ). "Disappointed/disappointing" là tính từ không làm tân ngữ trực tiếp.',
      tip: 'Express/show/hide its ___ → danh từ cảm xúc (-ment, -tion, -ness)'
    },
    {
      id: 'wf-051', family: 'disappoint – disappointed – disappointing – disappointment',
      sentence: 'The quarterly results were [___], falling short of analyst expectations by 12%.',
      signal: '"Were" (linking verb) → cần tính từ; kết quả gây ra cảm giác',
      pos: 'adj',
      options: ['disappoint', 'disappointed', 'disappointing', 'disappointment'],
      answer: 2,
      explanation: '"Were disappointing" = linking verb + tính từ. "Disappointing" = gây thất vọng (dùng cho vật/kết quả). "Disappointed" = cảm thấy thất vọng (dùng cho người).',
      tip: 'Kết quả/sự việc → -ing (disappointing). Người cảm nhận → -ed (disappointed)'
    },

    // ══════════════════════
    //  NHÓM: expand / expansion / expansive / expanding
    // ══════════════════════
    {
      id: 'wf-052', family: 'expand – expansion – expansive – expanding',
      sentence: 'The firm\'s rapid [___] into Southeast Asian markets caught many analysts by surprise.',
      signal: '"The firm\'s rapid" (sở hữu + tính từ) + chủ ngữ → cần danh từ',
      pos: 'noun',
      options: ['expand', 'expansion', 'expansive', 'expanding'],
      answer: 1,
      explanation: '"Rapid expansion into" = tính từ + danh từ + giới từ. "Expansion into [market]" là cụm danh từ chuẩn trong kinh doanh TOEIC.',
      tip: 'rapid/strategic/global ___ into [thị trường] → danh từ (-sion, -tion)'
    },
    {
      id: 'wf-053', family: 'expand – expansion – expansive – expanding',
      sentence: 'The company\'s [___] portfolio now includes properties in twelve countries.',
      signal: '"The company\'s" (sở hữu) + trước "portfolio" → cần tính từ',
      pos: 'adj',
      options: ['expand', 'expansion', 'expansive', 'expanding'],
      answer: 2,
      explanation: '"Expansive portfolio" = tính từ + danh từ. "Expansive" = rộng lớn, trải dài. Phân biệt với "expansion" (danh từ) không đứng trực tiếp trước danh từ như modifier.',
      tip: 'Possessive + ___ + noun → tính từ bổ nghĩa (-ive, -al, -ful)'
    },

    // ══════════════════════
    //  NHÓM: construct / construction / constructive / constructing
    // ══════════════════════
    {
      id: 'wf-054', family: 'construct – construction – constructive – constructing',
      sentence: 'The [___] of the new production facility is scheduled to begin next spring.',
      signal: '"The" + chủ ngữ cho "is scheduled" → cần danh từ',
      pos: 'noun',
      options: ['construct', 'construction', 'constructive', 'constructing'],
      answer: 1,
      explanation: '"The construction of..." = danh từ làm chủ ngữ. "Construction" = việc xây dựng. "Constructing" là V-ing có thể làm chủ ngữ nhưng không dùng sau "The".',
      tip: 'The ___ of [công trình] + is/was → danh từ trừu tượng'
    },
    {
      id: 'wf-055', family: 'construct – construction – constructive – constructing',
      sentence: 'Managers are encouraged to offer [___] feedback rather than simply criticizing.',
      signal: '"Offer" + trước "feedback" → cần tính từ bổ nghĩa',
      pos: 'adj',
      options: ['construct', 'construction', 'constructive', 'constructing'],
      answer: 2,
      explanation: '"Constructive feedback" = tính từ + danh từ. "Constructive" = mang tính xây dựng. Collocation chuẩn trong môi trường công việc TOEIC.',
      tip: 'offer/provide/give ___ feedback/criticism → tính từ (constructive, helpful)'
    },

    // ══════════════════════
    //  NHÓM: consist / consistent / consistency / consistently
    // ══════════════════════
    {
      id: 'wf-056', family: 'consist – consistent – consistency – consistently',
      sentence: 'Ms. Vo\'s [___] performance throughout the quarter earned her a well-deserved promotion.',
      signal: '"Ms. Vo\'s" (sở hữu) + trước "performance" → cần tính từ',
      pos: 'adj',
      options: ['consist', 'consistent', 'consistency', 'consistently'],
      answer: 1,
      explanation: '"Consistent performance" = tính từ + danh từ. "Consistent" = đều đặn, nhất quán. "Consistency" là danh từ không đứng trước danh từ khác trực tiếp.',
      tip: 'Possessive + ___ + performance/results → tính từ (-ent, -ive, -al)'
    },
    {
      id: 'wf-057', family: 'consist – consistent – consistency – consistently',
      sentence: 'The brand has [___] delivered high-quality products over the past two decades.',
      signal: '"Has + [___] + V3" → cần trạng từ xen vào',
      pos: 'adv',
      options: ['consist', 'consistent', 'consistency', 'consistently'],
      answer: 3,
      explanation: '"Has consistently delivered" = present perfect với trạng từ xen vào. "Consistently" = một cách nhất quán, đều đặn. Phân biệt với "consistent" (tính từ).',
      tip: 'Has/have + ___ + V3 → trạng từ (consistently, steadily, reliably)'
    },

    // ══════════════════════
    //  NHÓM: except / exceptional / exceptionally / exception
    // ══════════════════════
    {
      id: 'wf-058', family: 'except – exceptional – exceptionally – exception',
      sentence: 'Investors were pleased with the [___] results posted by the company this quarter.',
      signal: '"The" + trước "results" → cần tính từ bổ nghĩa',
      pos: 'adj',
      options: ['except', 'exceptional', 'exceptionally', 'exception'],
      answer: 1,
      explanation: '"Exceptional results" = tính từ + danh từ. "Exceptional" = xuất sắc, vượt trội. "Exceptionally" là trạng từ không đứng trước danh từ.',
      tip: 'The ___ results/performance/growth → tính từ (-al, -ive, -ous)'
    },
    {
      id: 'wf-059', family: 'except – exceptional – exceptionally – exception',
      sentence: 'The committee found the auditor\'s report [___] thorough and above reproach.',
      signal: '"Found [tân ngữ] + [___] + tính từ" → SVOC, cần trạng từ bổ nghĩa tính từ',
      pos: 'adv',
      options: ['except', 'exceptional', 'exceptionally', 'exception'],
      answer: 2,
      explanation: '"Exceptionally thorough" = trạng từ + tính từ. "Exceptionally" bổ nghĩa mức độ cho "thorough". "Exceptional" là tính từ không bổ nghĩa tính từ khác.',
      tip: '___ + tính từ → trạng từ bổ nghĩa mức độ (exceptionally, remarkably, particularly)'
    },

    // ══════════════════════
    //  NHÓM: capable / capability / capably / incapable
    // ══════════════════════
    {
      id: 'wf-060', family: 'capable – capability – capably – incapable',
      sentence: 'The new assistant proved to be highly [___] in managing the director\'s schedule.',
      signal: '"Proved to be highly" → linking verb + intensifier → cần tính từ',
      pos: 'adj',
      options: ['capable', 'capability', 'capably', 'incapable'],
      answer: 0,
      explanation: '"Proved to be highly capable" = linking verb + intensifier + tính từ. "Highly capable" là collocation chuẩn. "Capably" là trạng từ không đứng sau "highly" theo cách này.',
      tip: 'proved to be highly ___ → tính từ (capable, effective, skilled)'
    },
    {
      id: 'wf-061', family: 'capable – capability – capably – incapable',
      sentence: 'The organization must assess its technical [___] before committing to the project.',
      signal: '"Its technical" (sở hữu + tính từ) + tân ngữ → cần danh từ',
      pos: 'noun',
      options: ['capable', 'capability', 'capably', 'incapable'],
      answer: 1,
      explanation: '"Technical capability" = tính từ + danh từ tân ngữ. "Capability" = năng lực, khả năng. Phân biệt với "capacity" (công suất vật lý).',
      tip: 'technical/financial/operational ___ → danh từ chỉ năng lực (-ity, -ance)'
    },

    // ══════════════════════
    //  NHÓM: scarce / scarcely / scarcity / scare
    // ══════════════════════
    {
      id: 'wf-062', family: 'scarce – scarcely – scarcity – scare',
      sentence: 'The [___] of qualified candidates makes the hiring decision particularly difficult.',
      signal: '"The" + chủ ngữ cho "makes" → cần danh từ',
      pos: 'noun',
      options: ['scarce', 'scarcely', 'scarcity', 'scare'],
      answer: 2,
      explanation: '"The scarcity of candidates" = danh từ chủ ngữ. "Scarcity" = sự khan hiếm. "Scarce" là tính từ không làm chủ ngữ sau "The" theo cách này.',
      tip: 'The ___ of [something] makes/causes → danh từ trừu tượng (-ity, -ness)'
    },
    {
      id: 'wf-063', family: 'scarce – scarcely – scarcity – scare',
      sentence: 'Skilled technicians are [___] in the region, prompting companies to recruit internationally.',
      signal: '"Are" (linking verb) + bổ nghĩa tính chất → cần tính từ',
      pos: 'adj',
      options: ['scarce', 'scarcely', 'scarcity', 'scare'],
      answer: 0,
      explanation: '"Are scarce" = be + tính từ. "Scarce" = khan hiếm. "Scarcely" là trạng từ không dùng sau "are" như tính từ bổ nghĩa chủ ngữ.',
      tip: 'Are/remain/become + ___ → tính từ vị ngữ'
    },

    // ══════════════════════
    //  NHÓM: frequent / frequency / frequently / frequented
    // ══════════════════════
    {
      id: 'wf-064', family: 'frequent – frequency – frequently – frequented',
      sentence: 'Staff are [___] reminded that personal use of company devices is strictly prohibited.',
      signal: '"Are + [___] + V3" (bị động) → cần trạng từ xen vào',
      pos: 'adv',
      options: ['frequent', 'frequency', 'frequently', 'frequented'],
      answer: 2,
      explanation: '"Are frequently reminded" = bị động với trạng từ xen vào. "Frequently" = thường xuyên. "Frequent" là tính từ không xen vào cấu trúc bị động.',
      tip: 'Are/is + ___ + V3 (bị động) → trạng từ xen vào (frequently, regularly, officially)'
    },
    {
      id: 'wf-065', family: 'frequent – frequency – frequently – frequented',
      sentence: 'The [___] of system updates has increased since the new IT policy was implemented.',
      signal: '"The" + chủ ngữ → cần danh từ',
      pos: 'noun',
      options: ['frequent', 'frequency', 'frequently', 'frequented'],
      answer: 1,
      explanation: '"The frequency of updates" = danh từ chủ ngữ. "Frequency" = tần suất. "Frequent" là tính từ không làm chủ ngữ sau "The".',
      tip: 'The ___ of [hoạt động] has increased/decreased → danh từ trừu tượng'
    },

    // ══════════════════════
    //  NHÓM: confide / confidential / confidentiality / confidently
    // ══════════════════════
    {
      id: 'wf-066', family: 'confide – confidential – confidentiality – confidently',
      sentence: 'All participants must sign a [___] agreement before accessing the data room.',
      signal: '"A" + trước "agreement" → cần tính từ bổ nghĩa',
      pos: 'adj',
      options: ['confide', 'confidential', 'confidentiality', 'confidently'],
      answer: 1,
      explanation: '"Confidential agreement" = tính từ + danh từ. "Confidential" = bảo mật, riêng tư. "Confidentiality" là danh từ không đứng trực tiếp trước "agreement".',
      tip: 'a ___ agreement/document/report → tính từ (-al, -ial, -ive)'
    },
    {
      id: 'wf-067', family: 'confide – confidential – confidentiality – confidently',
      sentence: 'The spokesperson addressed the media [___], fielding every question without hesitation.',
      signal: 'Sau động từ "addressed" + cách thức → cần trạng từ',
      pos: 'adv',
      options: ['confide', 'confidential', 'confidentiality', 'confidently'],
      answer: 3,
      explanation: '"Addressed confidently" = động từ + trạng từ cách thức. "Confidently" = một cách tự tin. "Confidential" là tính từ không bổ nghĩa động từ.',
      tip: 'addressed/presented/spoke + ___ (cách thức) → trạng từ (-ly)'
    },

    // ══════════════════════
    //  NHÓM: finalize / finalization / finally / finalizing
    // ══════════════════════
    {
      id: 'wf-068', family: 'finalize – finalization – finally – finalizing',
      sentence: 'The [___] of the merger agreement is expected to take several more months.',
      signal: '"The" + chủ ngữ cho "is expected" → cần danh từ',
      pos: 'noun',
      options: ['finalize', 'finalization', 'finally', 'finalizing'],
      answer: 1,
      explanation: '"The finalization of..." = danh từ làm chủ ngữ. "Finalization" = sự hoàn tất. "Finalizing" là V-ing nhưng không dùng sau "The" khi làm chủ ngữ kiểu này.',
      tip: 'The ___ of [thỏa thuận/hợp đồng] is expected → danh từ (-tion, -ment)'
    },
    {
      id: 'wf-069', family: 'finalize – finalization – finally – finalizing',
      sentence: 'After months of negotiation, the two parties [___] reached a mutually beneficial agreement.',
      signal: 'Sau "parties" (chủ ngữ) + trước "reached" → cần trạng từ',
      pos: 'adv',
      options: ['finalize', 'finalization', 'finally', 'finalizing'],
      answer: 2,
      explanation: '"Finally reached" = trạng từ + động từ. "Finally" = cuối cùng (trạng từ thời gian). Đứng giữa chủ ngữ và động từ, hoặc đầu câu.',
      tip: 'Subject + ___ + verb = trạng từ chêm vào (finally, eventually, ultimately)'
    },

    // ══════════════════════
    //  NHÓM: overwhelm / overwhelming / overwhelmingly / overwhelmed
    // ══════════════════════
    {
      id: 'wf-070', family: 'overwhelm – overwhelming – overwhelmingly – overwhelmed',
      sentence: 'Customer feedback was [___] positive about the new service model.',
      signal: '"Was + [___] + positive" → trạng từ bổ nghĩa tính từ "positive"',
      pos: 'adv',
      options: ['overwhelm', 'overwhelming', 'overwhelmingly', 'overwhelmed'],
      answer: 2,
      explanation: '"Overwhelmingly positive" = trạng từ + tính từ. "Overwhelmingly" bổ nghĩa mức độ cho "positive". "Overwhelming" là tính từ không bổ nghĩa tính từ khác.',
      tip: '___ + tính từ = trạng từ bổ nghĩa mức độ (overwhelmingly, exceptionally, remarkably)'
    },
    {
      id: 'wf-071', family: 'overwhelm – overwhelming – overwhelmingly – overwhelmed',
      sentence: 'The support team received an [___] number of inquiries following the product launch.',
      signal: '"An" + trước "number" → cần tính từ',
      pos: 'adj',
      options: ['overwhelm', 'overwhelming', 'overwhelmingly', 'overwhelmed'],
      answer: 1,
      explanation: '"An overwhelming number" = mạo từ + tính từ + danh từ. "Overwhelming" = áp đảo, quá lớn. "Overwhelmingly" là trạng từ không đứng sau mạo từ "an".',
      tip: 'An/a + ___ + number/majority/response → tính từ'
    },

    // ══════════════════════
    //  NHÓM: remark / remarkable / remarkably / remarked
    // ══════════════════════
    {
      id: 'wf-072', family: 'remark – remarkable – remarkably – remarked',
      sentence: 'The company\'s [___] growth exceeded all expectations last quarter.',
      signal: '"The company\'s" + trước "growth" → cần tính từ bổ nghĩa',
      pos: 'adj',
      options: ['remark', 'remarkable', 'remarkably', 'remarked'],
      answer: 1,
      explanation: '"Remarkable growth" = tính từ + danh từ. "Remarkable" = đáng chú ý, ấn tượng. "Remarkably" là trạng từ không đứng trước danh từ.',
      tip: 'Possessive + ___ + growth/achievement/progress → tính từ'
    },
    {
      id: 'wf-073', family: 'remark – remarkable – remarkably – remarked',
      sentence: 'The junior analyst performed [___] well during her first client presentation.',
      signal: '"Performed + [___] + well" → trạng từ bổ nghĩa trạng từ "well"',
      pos: 'adv',
      options: ['remark', 'remarkable', 'remarkably', 'remarked'],
      answer: 2,
      explanation: '"Remarkably well" = trạng từ + trạng từ. "Remarkably" bổ nghĩa mức độ cho "well". "Remarkable" là tính từ không bổ nghĩa trạng từ.',
      tip: '___ + well/quickly/efficiently = trạng từ bổ nghĩa mức độ'
    },

    // ══════════════════════
    //  NHÓM: prove / proof / proven / provable
    // ══════════════════════
    {
      id: 'wf-074', family: 'prove – proof – proven – provable',
      sentence: 'All applicants must provide [___] of their educational qualifications.',
      signal: '"Provide" + tân ngữ trực tiếp → cần danh từ',
      pos: 'noun',
      options: ['prove', 'proof', 'proven', 'provable'],
      answer: 1,
      explanation: '"Provide proof of" = cụm động từ + danh từ + giới từ. "Proof" = bằng chứng, chứng minh (danh từ). "Proven" là tính từ/V3 không làm tân ngữ trực tiếp của "provide".',
      tip: 'provide/submit/show ___ of [qualification] → danh từ tân ngữ'
    },
    {
      id: 'wf-075', family: 'prove – proof – proven – provable',
      sentence: 'Using social media for recruitment is a [___] strategy in modern HR practice.',
      signal: '"A" + trước "strategy" → cần tính từ bổ nghĩa',
      pos: 'adj',
      options: ['prove', 'proof', 'proven', 'provable'],
      answer: 2,
      explanation: '"A proven strategy" = mạo từ + tính từ + danh từ. "Proven" = đã được chứng minh (past participle dùng như tính từ). Collocation chuẩn trong kinh doanh.',
      tip: 'a ___ strategy/method/approach → tính từ (proven, tested, effective)'
    },

    // ══════════════════════
    //  NHÓM: persuade / persuasion / persuasive / persuasively
    // ══════════════════════
    {
      id: 'wf-076', family: 'persuade – persuasion – persuasive – persuasively',
      sentence: 'The marketing director gave a very [___] presentation at the annual meeting.',
      signal: '"A very" + trước "presentation" → cần tính từ',
      pos: 'adj',
      options: ['persuade', 'persuasion', 'persuasive', 'persuasively'],
      answer: 2,
      explanation: '"A very persuasive presentation" = a + intensifier + tính từ + danh từ. "Persuasive" = có tính thuyết phục. "Persuasively" là trạng từ không đứng sau "very" trước danh từ.',
      tip: 'a very/highly/extremely + ___ + presentation/argument → tính từ'
    },
    {
      id: 'wf-077', family: 'persuade – persuasion – persuasive – persuasively',
      sentence: 'The sales representative argued [___] for the benefits of upgrading to the premium plan.',
      signal: 'Sau động từ "argued" + cách thức → cần trạng từ',
      pos: 'adv',
      options: ['persuade', 'persuasion', 'persuasive', 'persuasively'],
      answer: 3,
      explanation: '"Argued persuasively" = động từ + trạng từ cách thức. "Persuasively" = một cách thuyết phục. "Persuasive" là tính từ không bổ nghĩa động từ trực tiếp.',
      tip: 'argued/wrote/spoke + ___ (cách thức) → trạng từ (-ly)'
    },

    // ══════════════════════
    //  NHÓM: collaborate / collaboration / collaborative / collaboratively
    // ══════════════════════
    {
      id: 'wf-078', family: 'collaborate – collaboration – collaborative – collaboratively',
      sentence: 'The [___] between the two departments has improved communication significantly.',
      signal: '"The" + chủ ngữ cho "has improved" → cần danh từ',
      pos: 'noun',
      options: ['collaborate', 'collaboration', 'collaborative', 'collaboratively'],
      answer: 1,
      explanation: '"The collaboration between..." = danh từ chủ ngữ. "Collaboration" = sự hợp tác. "Collaborative" là tính từ không làm chủ ngữ sau "The" theo cách này.',
      tip: 'The ___ between [hai bên] has improved → danh từ trừu tượng'
    },
    {
      id: 'wf-079', family: 'collaborate – collaboration – collaborative – collaboratively',
      sentence: 'The engineering and design teams worked [___] to deliver the prototype ahead of schedule.',
      signal: 'Sau động từ "worked" + cách thức → cần trạng từ',
      pos: 'adv',
      options: ['collaborate', 'collaboration', 'collaborative', 'collaboratively'],
      answer: 3,
      explanation: '"Worked collaboratively" = động từ + trạng từ. "Collaboratively" = một cách hợp tác. "Collaborative" là tính từ không bổ nghĩa động từ trực tiếp.',
      tip: 'worked/operated/functioned + ___ → trạng từ cách thức'
    },

    // ══════════════════════
    //  NHÓM: strong / strength / strongly / strengthen
    // ══════════════════════
    {
      id: 'wf-080', family: 'strong – strength – strongly – strengthen',
      sentence: 'Participants are [___] encouraged to submit their registration before the deadline.',
      signal: '"Are + [___] + V3" (bị động) → cần trạng từ xen vào',
      pos: 'adv',
      options: ['strong', 'strength', 'strongly', 'strengthen'],
      answer: 2,
      explanation: '"Are strongly encouraged" = bị động + trạng từ. "Strongly encouraged" = được khuyến khích mạnh mẽ. "Strong" là tính từ không xen vào cấu trúc bị động.',
      tip: 'Are/is + ___ + encouraged/advised/recommended → trạng từ'
    },
    {
      id: 'wf-081', family: 'strong – strength – strengths – strengthen',
      sentence: 'One of the company\'s key [___] is its highly skilled and experienced workforce.',
      signal: '"Key" (tính từ) + chủ ngữ sau "One of" → cần danh từ số nhiều',
      pos: 'noun',
      options: ['strong', 'strength', 'strengths', 'strengthen'],
      answer: 2,
      explanation: '"Key strengths" = tính từ + danh từ số nhiều. "Strengths" = những điểm mạnh. "Strong" là tính từ không làm chủ ngữ sau "key".',
      tip: '"Key/core ___ is/are" → danh từ chỉ đặc điểm/lợi thế (-ness, -ity)'
    },

    // ══════════════════════
    //  NHÓM: safe / safely / safety / safeguard
    // ══════════════════════
    {
      id: 'wf-082', family: 'safe – safely – safety – safeguard',
      sentence: 'The new regulation aims to ensure [___] working conditions for all employees.',
      signal: '"Ensure" + trước "working conditions" → cần tính từ bổ nghĩa',
      pos: 'adj',
      options: ['safe', 'safely', 'safety', 'safeguard'],
      answer: 0,
      explanation: '"Safe working conditions" = tính từ + danh từ ghép. "Safe" bổ nghĩa cho "working conditions". "Safety" là danh từ có thể làm modifier nhưng "safe" chuẩn hơn trong cụm này.',
      tip: 'ensure ___ + working/operating conditions → tính từ vị trí modifier'
    },
    {
      id: 'wf-083', family: 'safe – safely – safety – safeguard',
      sentence: 'All vehicles must be inspected to ensure they can operate [___] on public roads.',
      signal: 'Sau "operate" (động từ) + cách thức → cần trạng từ',
      pos: 'adv',
      options: ['safe', 'safely', 'safety', 'safeguard'],
      answer: 1,
      explanation: '"Operate safely" = động từ + trạng từ cách thức. "Safely" = một cách an toàn. "Safe" là tính từ không bổ nghĩa động từ trực tiếp.',
      tip: 'operate/drive/function + ___ → trạng từ (-ly)'
    },

    // ══════════════════════
    //  NHÓM: substance / substantial / substantially / substantiate
    // ══════════════════════
    {
      id: 'wf-084', family: 'substance – substantial – substantially – substantiate',
      sentence: 'The company has made [___] investments in renewable energy infrastructure this year.',
      signal: '"Has made" + trước "investments" → cần tính từ bổ nghĩa',
      pos: 'adj',
      options: ['substance', 'substantial', 'substantially', 'substantiate'],
      answer: 1,
      explanation: '"Substantial investments" = tính từ + danh từ. "Substantial" = đáng kể, lớn. "Substantially" là trạng từ không đứng trước danh từ.',
      tip: 'made ___ investments/progress/improvements → tính từ (-al, -ive, -ous)'
    },
    {
      id: 'wf-085', family: 'substance – substantial – substantially – substantiate',
      sentence: 'Operating costs have been reduced [___] since the automation was introduced.',
      signal: '"Have been reduced + [___]" → cần trạng từ bổ nghĩa mức độ',
      pos: 'adv',
      options: ['substance', 'substantial', 'substantially', 'substantiate'],
      answer: 2,
      explanation: '"Reduced substantially" = V3 + trạng từ mức độ. "Substantially" = đáng kể. "Substantial" là tính từ không bổ nghĩa động từ.',
      tip: 'reduced/increased/improved + ___ → trạng từ mức độ (-ly)'
    },

    // ══════════════════════
    //  NHÓM: finance / financial / financially / financing
    // ══════════════════════
    {
      id: 'wf-086', family: 'finance – financial – financially – financing',
      sentence: 'The executive board reviewed the [___] report before making a final decision.',
      signal: '"The" + trước "report" → cần tính từ bổ nghĩa',
      pos: 'adj',
      options: ['finance', 'financial', 'financially', 'financing'],
      answer: 1,
      explanation: '"Financial report" = tính từ + danh từ. "Financial" = thuộc về tài chính. "Finance" là danh từ có thể làm modifier nhưng "financial" chuẩn hơn trong TOEIC.',
      tip: 'The ___ report/statement/performance → tính từ (-al, -ial)'
    },
    {
      id: 'wf-087', family: 'finance – financial – financially – financing',
      sentence: 'The start-up struggled [___] in its first year but recovered strongly by year three.',
      signal: '"Struggled + [___]" → cần trạng từ bổ nghĩa phạm vi',
      pos: 'adv',
      options: ['finance', 'financial', 'financially', 'financing'],
      answer: 2,
      explanation: '"Struggled financially" = động từ + trạng từ phạm vi. "Financially" = về mặt tài chính. "Financial" là tính từ không bổ nghĩa động từ.',
      tip: 'struggled/succeeded/benefited + ___ → trạng từ phạm vi (-ally, -ically)'
    },

    // ══════════════════════
    //  NHÓM: attend / attentive / attention / attentively
    // ══════════════════════
    {
      id: 'wf-088', family: 'attend – attentive – attention – attentively',
      sentence: 'His [___] to detail made him an ideal candidate for the quality control role.',
      signal: '"His" (sở hữu) + tân ngữ của "made" → cần danh từ',
      pos: 'noun',
      options: ['attend', 'attentive', 'attention', 'attentively'],
      answer: 2,
      explanation: '"His attention to detail" = possessive + noun + to + noun. "Attention to detail" là collocation cố định, cực kỳ phổ biến trong mô tả công việc TOEIC.',
      tip: '"___ to detail" = collocation cố định: attention to detail'
    },
    {
      id: 'wf-089', family: 'attend – attentive – attention – attentively',
      sentence: 'The audience listened [___] to every word of the keynote speaker\'s presentation.',
      signal: '"Listened + [___]" → cần trạng từ cách thức',
      pos: 'adv',
      options: ['attend', 'attentive', 'attention', 'attentively'],
      answer: 3,
      explanation: '"Listened attentively" = động từ + trạng từ. "Attentively" = một cách chú ý. "Attentive" là tính từ không bổ nghĩa động từ.',
      tip: 'listened/watched/observed + ___ → trạng từ cách thức (-ly)'
    },

    // ══════════════════════
    //  NHÓM: certify / certified / certification / certifiable
    // ══════════════════════
    {
      id: 'wf-090', family: 'certify – certified – certification – certifiable',
      sentence: 'Our product packaging is [___] to ensure it meets the highest environmental standards.',
      signal: '"Is + [___]" → linking verb + trạng thái → cần tính từ bị động',
      pos: 'adj',
      options: ['certify', 'certified', 'certification', 'certifiable'],
      answer: 1,
      explanation: '"Is certified" = be + tính từ (past participle dùng như tính từ). "Certified" = được chứng nhận. Phân biệt với "certification" (danh từ chỉ giấy chứng nhận).',
      tip: 'Is/are + ___ (trạng thái đã được xác nhận) → V3 dùng như tính từ'
    },
    {
      id: 'wf-091', family: 'certify – certified – certification – certifiable',
      sentence: 'Obtaining professional [___] can significantly enhance your career prospects.',
      signal: '"Professional" (tính từ) + tân ngữ của "Obtaining" → cần danh từ',
      pos: 'noun',
      options: ['certify', 'certified', 'certification', 'certifiable'],
      answer: 2,
      explanation: '"Professional certification" = tính từ + danh từ tân ngữ của gerund "Obtaining". "Certification" = việc chứng nhận, bằng cấp. "Certified" là tính từ không làm tân ngữ trực tiếp của "obtaining".',
      tip: 'Obtaining/achieving/earning + professional ___ → danh từ (-tion, -ment)'
    },

    // ══════════════════════
    //  NHÓM: persist / persistent / persistence / persistently
    // ══════════════════════
    {
      id: 'wf-092', family: 'persist – persistent – persistence – persistently',
      sentence: 'The sales team showed great [___] in closing three major deals within a single quarter.',
      signal: '"Showed great" + tân ngữ → cần danh từ',
      pos: 'noun',
      options: ['persist', 'persistent', 'persistence', 'persistently'],
      answer: 2,
      explanation: '"Showed great persistence" = show + intensifier + noun. "Persistence" = sự kiên trì (danh từ). "Persistent" là tính từ không làm tân ngữ trực tiếp.',
      tip: 'show/demonstrate/display great ___ → danh từ (-ence, -ance, -tion)'
    },
    {
      id: 'wf-093', family: 'persist – persistent – persistence – persistently',
      sentence: 'Despite repeated rejections, she [___] pursued her goal of becoming a partner.',
      signal: '"She + [___] + pursued" → cần trạng từ bổ nghĩa động từ',
      pos: 'adv',
      options: ['persist', 'persistent', 'persistence', 'persistently'],
      answer: 3,
      explanation: '"Persistently pursued" = trạng từ + động từ. "Persistently" = một cách kiên trì. Trạng từ đứng trước hoặc sau động từ để bổ nghĩa cách thức.',
      tip: 'Subject + ___ + verb = trạng từ cách thức xen vào'
    },

    // ══════════════════════
    //  NHÓM: candid / candidly / candidness / candidacy
    // ══════════════════════
    {
      id: 'wf-094', family: 'candid – candidly – candidness – candidacy',
      sentence: 'The director spoke [___] about the company\'s challenges at the shareholder meeting.',
      signal: '"Spoke + [___]" → cần trạng từ cách thức',
      pos: 'adv',
      options: ['candid', 'candidly', 'candidness', 'candidacy'],
      answer: 1,
      explanation: '"Spoke candidly" = động từ + trạng từ. "Candidly" = một cách thẳng thắn, cởi mở. "Candid" là tính từ không bổ nghĩa động từ.',
      tip: 'spoke/addressed/discussed + ___ → trạng từ cách thức (-ly)'
    },
    {
      id: 'wf-095', family: 'candid – candidly – candidness – candidacy',
      sentence: 'Her [___] assessment of the project\'s risks impressed the investment committee.',
      signal: '"Her" (sở hữu) + trước "assessment" → cần tính từ bổ nghĩa',
      pos: 'adj',
      options: ['candid', 'candidly', 'candidness', 'candidacy'],
      answer: 0,
      explanation: '"Candid assessment" = tính từ + danh từ. "Candid" = thẳng thắn, không che giấu. "Candidly" là trạng từ không đứng trước danh từ.',
      tip: 'Her/his/its + ___ + assessment/view/opinion → tính từ'
    },

    // ══════════════════════
    //  NHÓM: appropriate / appropriately / appropriateness / appropriated
    // ══════════════════════
    {
      id: 'wf-096', family: 'appropriate – appropriately – appropriateness – appropriated',
      sentence: 'All visitors must wear [___] safety equipment when entering the construction zone.',
      signal: '"Wear" + trước "safety equipment" → cần tính từ bổ nghĩa',
      pos: 'adj',
      options: ['appropriate', 'appropriately', 'appropriateness', 'appropriated'],
      answer: 0,
      explanation: '"Appropriate safety equipment" = tính từ + cụm danh từ. "Appropriate" = phù hợp, đúng quy định. "Appropriately" là trạng từ không đứng trước danh từ.',
      tip: 'wear/use/provide ___ + equipment/attire/measures → tính từ'
    },
    {
      id: 'wf-097', family: 'appropriate – appropriately – appropriateness – appropriated',
      sentence: 'All expenses must be [___] documented and submitted within 14 days of travel.',
      signal: '"Must be + [___] + V3" (bị động) → cần trạng từ xen vào',
      pos: 'adv',
      options: ['appropriate', 'appropriately', 'appropriateness', 'appropriated'],
      answer: 1,
      explanation: '"Must be appropriately documented" = modal bị động + trạng từ. "Appropriately" = một cách phù hợp. Trạng từ xen vào giữa "be" và V3 trong cấu trúc bị động.',
      tip: 'Must be + ___ + V3 → trạng từ xen vào cấu trúc bị động'
    },

    // ══════════════════════
    //  NHÓM: proactive / proactively / proactiveness / reactive
    // ══════════════════════
    {
      id: 'wf-098', family: 'proactive – proactively – proactiveness – reactive',
      sentence: 'Staff are encouraged to act [___] when they notice potential safety hazards.',
      signal: '"Act + [___]" → cần trạng từ cách thức',
      pos: 'adv',
      options: ['proactive', 'proactively', 'proactiveness', 'reactive'],
      answer: 1,
      explanation: '"Act proactively" = động từ + trạng từ. "Proactively" = một cách chủ động. "Proactive" là tính từ không bổ nghĩa động từ "act" trực tiếp.',
      tip: 'act/respond/engage + ___ → trạng từ cách thức (-ly)'
    },
    {
      id: 'wf-099', family: 'proactive – proactively – proactiveness – reactive',
      sentence: 'Taking a [___] approach to risk management can prevent costly issues down the line.',
      signal: '"A" + trước "approach" → cần tính từ bổ nghĩa',
      pos: 'adj',
      options: ['proactive', 'proactively', 'proactiveness', 'reactive'],
      answer: 0,
      explanation: '"A proactive approach" = mạo từ + tính từ + danh từ. "Proactive" = chủ động phòng ngừa. Collocation "proactive approach" rất phổ biến trong TOEIC.',
      tip: 'a ___ approach/strategy/stance → tính từ (proactive, strategic, systematic)'
    },

    // ══════════════════════
    //  NHÓM: support / supportive / supportively / supported
    // ══════════════════════
    {
      id: 'wf-100', family: 'support – supportive – supportively – supported',
      sentence: 'The board expressed its full [___] for the CEO\'s restructuring plan at last week\'s meeting.',
      signal: '"Its full" (sở hữu + tính từ) + tân ngữ của "expressed" → cần danh từ',
      pos: 'noun',
      options: ['support', 'supportive', 'supportively', 'supported'],
      answer: 0,
      explanation: '"Expressed its full support" = express + possessive + adjective + noun. "Support" = sự ủng hộ (uncountable noun). "Supportive" là tính từ không làm tân ngữ trực tiếp.',
      tip: 'express/show/gain + its full ___ for → danh từ trừu tượng'
    },
    {
      id: 'wf-101', family: 'support – supportive – supportively – supported',
      sentence: 'The manager was highly [___] of her team\'s innovative approach to the project.',
      signal: '"Was highly + [___] + of" → cần tính từ',
      pos: 'adj',
      options: ['support', 'supportive', 'supportively', 'supported'],
      answer: 1,
      explanation: '"Was highly supportive of" = be + intensifier + tính từ + giới từ. "Supportive of" = ủng hộ (tính từ + giới từ). "Support" là danh từ/động từ không dùng sau "highly".',
      tip: 'Was highly ___ of [something/someone] → tính từ (-ive, -ful, -al)'
    },

    // ══════════════════════
    //  NHÓM: create / creative / creativity / creatively
    // ══════════════════════
    {
      id: 'wf-102', family: 'create – creative – creativity – creatively',
      sentence: 'The CEO was impressed by the [___] shown by the research team.',
      signal: '"The" + tân ngữ của "impressed by" → cần danh từ',
      pos: 'noun',
      options: ['create', 'creative', 'creativity', 'creatively'],
      answer: 2,
      explanation: '"Impressed by the creativity" = impressed + by + the + noun. "Creativity" = óc sáng tạo (uncountable noun). "Creative" là tính từ không làm tân ngữ sau "the".',
      tip: 'impressed by the ___ shown/demonstrated → danh từ trừu tượng (-ity, -ness)'
    },
    {
      id: 'wf-103', family: 'create – creative – creativity – creatively',
      sentence: 'The agency designed the campaign [___], blending traditional and digital channels.',
      signal: '"Designed + [___]" → cần trạng từ cách thức',
      pos: 'adv',
      options: ['create', 'creative', 'creativity', 'creatively'],
      answer: 3,
      explanation: '"Designed creatively" = động từ + trạng từ. "Creatively" = một cách sáng tạo. "Creative" là tính từ không bổ nghĩa động từ trực tiếp.',
      tip: 'designed/executed/developed + ___ (cách thức) → trạng từ (-ly)'
    },

    // ══════════════════════
    //  NHÓM: spacious / spaciousness / space / spatially
    // ══════════════════════
    {
      id: 'wf-104', family: 'spacious – spaciousness – space – spatially',
      sentence: 'The [___] of the warehouse makes it ideal for companies requiring large-scale cold storage.',
      signal: '"The" + chủ ngữ cho "makes" → cần danh từ trừu tượng',
      pos: 'noun',
      options: ['spacious', 'spaciousness', 'space', 'spatially'],
      answer: 1,
      explanation: '"The spaciousness of the warehouse" = danh từ trừu tượng làm chủ ngữ. "Spaciousness" = tính rộng rãi. "Spacious" là tính từ không làm chủ ngữ sau "The" theo cách này.',
      tip: 'The ___ of [địa điểm] makes it ideal → danh từ trừu tượng chỉ tính chất (-ness)'
    },
    {
      id: 'wf-105', family: 'spacious – spaciousness – space – spatially',
      sentence: 'The newly renovated headquarters features [___], open-plan offices across all five floors.',
      signal: 'Sau "features" + trước "offices" → cần tính từ bổ nghĩa',
      pos: 'adj',
      options: ['spacious', 'spaciousness', 'space', 'spatially'],
      answer: 0,
      explanation: '"Spacious, open-plan offices" = tính từ + tính từ + danh từ. "Spacious" = rộng rãi. "Spaciousness" là danh từ không đứng trực tiếp trước danh từ như modifier.',
      tip: 'features/includes + ___ + [loại phòng/không gian] → tính từ bổ nghĩa'
    },

    // ══════════════════════
    //  NHÓM: detail / detailed / detailing / meticulously
    // ══════════════════════
    {
      id: 'wf-106', family: 'detail – detailed – detailing – meticulously',
      sentence: 'Ms. Park gave a [___] account of how the project evolved from concept to completion.',
      signal: '"A" + trước "account" → cần tính từ bổ nghĩa',
      pos: 'adj',
      options: ['detail', 'detailed', 'detailing', 'meticulously'],
      answer: 1,
      explanation: '"A detailed account" = mạo từ + tính từ + danh từ. "Detailed" = chi tiết, tỉ mỉ (past participle dùng như tính từ). "Detailing" là V-ing không đứng sau "a".',
      tip: 'a ___ account/report/explanation → tính từ (-ed dùng như adj)'
    },
    {
      id: 'wf-107', family: 'reduce – reduction – reducing – reduced',
      sentence: 'The new payroll software has significantly [___] the time required to process monthly salaries.',
      signal: '"Has significantly + [___]" → cần V3 trong present perfect',
      pos: 'verb',
      options: ['reduce', 'reduction', 'reducing', 'reduced'],
      answer: 3,
      explanation: '"Has significantly reduced" = present perfect + trạng từ + V3. "Reduced" là V3 của reduce. "Reducing" là V-ing không dùng trong present perfect.',
      tip: 'Has + (trạng từ) + ___ → V3 trong present perfect'
    },

    // ══════════════════════
    //  NHÓM: unanimous / unanimously / unanimity / unanimousness
    // ══════════════════════
    {
      id: 'wf-108', family: 'unanimous – unanimously – unanimity – unanimousness',
      sentence: 'Ms. Kim was [___] selected as the keynote speaker for the annual leadership summit.',
      signal: '"Was + [___] + V3" → cần trạng từ xen vào cấu trúc bị động',
      pos: 'adv',
      options: ['unanimous', 'unanimously', 'unanimity', 'unanimousness'],
      answer: 1,
      explanation: '"Was unanimously selected" = bị động + trạng từ. "Unanimously" = một cách nhất trí. Trạng từ xen giữa "was" và V3 trong bị động quá khứ.',
      tip: 'Was/were + ___ + V3 → trạng từ xen vào bị động (-ly)'
    },
    {
      id: 'wf-109', family: 'unanimous – unanimously – unanimity – unanimousness',
      sentence: 'The board reached a [___] decision to proceed with the acquisition after three hours of discussion.',
      signal: '"A" + trước "decision" → cần tính từ bổ nghĩa',
      pos: 'adj',
      options: ['unanimous', 'unanimously', 'unanimity', 'unanimousness'],
      answer: 0,
      explanation: '"A unanimous decision" = mạo từ + tính từ + danh từ. "Unanimous" = nhất trí. Collocation chuẩn trong văn bản công ty TOEIC.',
      tip: 'a ___ decision/vote/agreement → tính từ (unanimous, formal, final)'
    },

    // ══════════════════════
    //  NHÓM: persevere / perseverance / persevering / perseverant
    // ══════════════════════
    {
      id: 'wf-110', family: 'persevere – perseverance – persevering – perseverant',
      sentence: 'Parkfield Consulting is known for its [___] approach to client relationships.',
      signal: '"Its" (sở hữu) + trước "approach" → cần tính từ bổ nghĩa',
      pos: 'adj',
      options: ['persevere', 'perseverance', 'persevering', 'perseverant'],
      answer: 2,
      explanation: '"Persevering approach" = tính từ + danh từ. "Persevering" = kiên trì, bền bỉ (present participle dùng như tính từ). "Perseverance" là danh từ không đứng trực tiếp trước "approach".',
      tip: 'known for its ___ approach → tính từ bổ nghĩa (persevering, innovative, collaborative)'
    },
    {
      id: 'wf-111', family: 'persevere – perseverance – persevering – perseverant',
      sentence: 'Her [___] in the face of numerous setbacks ultimately led to a breakthrough.',
      signal: '"Her" (sở hữu) + chủ ngữ cho "led" → cần danh từ',
      pos: 'noun',
      options: ['persevere', 'perseverance', 'persevering', 'perseverant'],
      answer: 1,
      explanation: '"Her perseverance" = sở hữu + danh từ trừu tượng làm chủ ngữ. "Perseverance" = sự kiên trì, bền bỉ (danh từ). "Persevering" là tính từ/V-ing không làm chủ ngữ sau "her".',
      tip: 'Her/his ___ in the face of → danh từ trừu tượng (-ance, -ence, -ity)'
    },

    // ══════════════════════
    //  NHÓM: flawless / flawlessly / flaw / flawed
    // ══════════════════════
    {
      id: 'wf-112', family: 'flawless – flawlessly – flaw – flawed',
      sentence: 'The annual gala was organised [___] and received unanimous praise from all 300 guests.',
      signal: '"Was organised + [___]" → cần trạng từ bổ nghĩa',
      pos: 'adv',
      options: ['flawless', 'flawlessly', 'flaw', 'flawed'],
      answer: 1,
      explanation: '"Organised flawlessly" = V3 + trạng từ. "Flawlessly" = một cách hoàn hảo. "Flawless" là tính từ không bổ nghĩa động từ trực tiếp.',
      tip: 'organised/executed/delivered + ___ → trạng từ cách thức (-ly)'
    },
    {
      id: 'wf-113', family: 'flawless – flawlessly – flaw – flawed',
      sentence: 'The inspectors identified a [___] in the structural design that required immediate attention.',
      signal: '"A" + tân ngữ của "identified" → cần danh từ',
      pos: 'noun',
      options: ['flawless', 'flawlessly', 'flaw', 'flawed'],
      answer: 2,
      explanation: '"A flaw in the design" = mạo từ + danh từ + giới từ. "Flaw" = lỗi, khiếm khuyết (danh từ đếm được). "Flawless" là tính từ không làm tân ngữ sau "a".',
      tip: 'identified/detected/found a ___ in → danh từ chỉ lỗi/vấn đề'
    },

    // ══════════════════════
    //  NHÓM: succeed / success / successful / successfully
    // ══════════════════════
    {
      id: 'wf-114', family: 'succeed – success – successful – successfully',
      sentence: 'The [___] of the new product line exceeded all previous sales records.',
      signal: '"The" + chủ ngữ cho "exceeded" → cần danh từ',
      pos: 'noun',
      options: ['succeed', 'success', 'successful', 'successfully'],
      answer: 1,
      explanation: '"The success of the new product line" = danh từ làm chủ ngữ. "Success" = sự thành công (uncountable noun). "Successful" là tính từ không làm chủ ngữ sau "The".',
      tip: 'The ___ of [sản phẩm/dự án] exceeded → danh từ trừu tượng'
    },
    {
      id: 'wf-115', family: 'succeed – success – successful – successfully',
      sentence: 'The project was [___] completed within the allotted budget and timeframe.',
      signal: '"Was + [___] + V3" → cần trạng từ xen vào bị động',
      pos: 'adv',
      options: ['succeed', 'success', 'successful', 'successfully'],
      answer: 3,
      explanation: '"Was successfully completed" = bị động + trạng từ. "Successfully" = một cách thành công. "Successful" là tính từ không xen vào cấu trúc bị động.',
      tip: 'Was/were + ___ + V3 → trạng từ (successfully, officially, formally)'
    },
  ];

  // ─── State ────────────────────────────────────────────────────
  let _set      = [];
  let _index    = 0;
  let _score    = 0;
  let _start    = 0;
  let _overlay  = null;

  // ─── Công cụ ──────────────────────────────────────────────────
  function _shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // ─── Mở Luyện từ loại ────────────────────────────────────────
  function open() {
    _set   = _shuffle(WORD_FORM_DATA).slice(0, 6);
    _index = 0;
    _score = 0;
    _start = Date.now();
    _buildOverlay();
    _renderQuestion();
  }

  // ─── Dựng overlay ────────────────────────────────────────────
  function _buildOverlay() {
    if (_overlay) _overlay.remove();
    _overlay = document.createElement('div');
    _overlay.id = 'wf-overlay';
    _overlay.innerHTML = `
      <div class="wf-backdrop" id="wf-backdrop"></div>
      <div class="wf-modal" id="wf-modal">
        <div class="wf-header">
          <div class="wf-header-left">
            <span class="wf-badge">🔤 Luyện từ loại</span>
            <span class="wf-prog-text" id="wf-prog-text">Câu 1 / ${_set.length}</span>
          </div>
          <button class="wf-close" id="wf-close" aria-label="Đóng">✕</button>
        </div>
        <div class="wf-progress-bar"><div class="wf-progress-fill" id="wf-prog-fill"></div></div>
        <div class="wf-body" id="wf-body"></div>
        <div class="wf-footer" id="wf-footer"></div>
      </div>`;
    document.body.appendChild(_overlay);
    document.getElementById('wf-backdrop').addEventListener('click', close);
    document.getElementById('wf-close').addEventListener('click', close);
    requestAnimationFrame(() => requestAnimationFrame(() => _overlay.classList.add('wf-visible')));
  }

  // ─── Render câu hỏi ──────────────────────────────────────────
  function _renderQuestion() {
    const q   = _set[_index];
    const pct = (_index / _set.length) * 100;
    const pos = POS_CONFIG[q.pos];

    document.getElementById('wf-prog-text').textContent = `Câu ${_index + 1} / ${_set.length}`;
    document.getElementById('wf-prog-fill').style.width = pct + '%';

    // Highlight chỗ trống trong câu
    const sentenceHtml = q.sentence.replace('[___]',
      `<span class="wf-blank">_____</span>`);

    const optsHtml = q.options.map((opt, i) => `
      <button class="wf-option" data-idx="${i}">
        <span class="wf-opt-letter">${['A','B','C','D'][i]}</span>
        <span class="wf-opt-text">${opt}</span>
      </button>`).join('');

    document.getElementById('wf-body').innerHTML = `
      <div class="wf-family">📚 Nhóm từ: <em>${q.family}</em></div>
      <div class="wf-sentence">${sentenceHtml}</div>
      <div class="wf-signal-box">
        <span class="wf-signal-label">📍 Dấu hiệu</span>
        <span class="wf-signal-text">${q.signal}</span>
      </div>
      <div class="wf-pos-target">
        Vị trí này cần:
        <span class="wf-pos-badge" style="color:${pos.color};background:${pos.bg};border-color:${pos.border}">
          ${pos.label}
        </span>
      </div>
      <div class="wf-options" id="wf-options">${optsHtml}</div>
      <div class="wf-explanation" id="wf-exp" style="display:none"></div>`;

    document.querySelectorAll('.wf-option').forEach(btn => {
      btn.addEventListener('click', () => _selectAnswer(parseInt(btn.dataset.idx)));
    });
    document.getElementById('wf-footer').innerHTML = '';
  }

  // ─── Xử lý trả lời ───────────────────────────────────────────
  function _selectAnswer(idx) {
    const q     = _set[_index];
    const right = q.answer;
    const ok    = idx === right;
    if (ok) _score++;

    document.querySelectorAll('.wf-option').forEach((btn, i) => {
      btn.disabled = true;
      if (i === right) btn.classList.add('wf-correct');
      else if (i === idx && !ok) btn.classList.add('wf-wrong');
    });

    // Giải thích
    const expEl = document.getElementById('wf-exp');
    expEl.style.display = 'flex';
    expEl.innerHTML = `
      <span class="wf-exp-icon">${ok ? '✅' : '❌'}</span>
      <div>
        <div class="wf-exp-main">${q.explanation}</div>
        <div class="wf-exp-tip">💡 <strong>Mẹo nhớ:</strong> ${q.tip}</div>
      </div>`;

    // Nút tiếp theo
    const isLast = _index === _set.length - 1;
    document.getElementById('wf-footer').innerHTML = `
      <button class="wf-btn-next" id="wf-btn-next">
        ${isLast ? '🏁 Xem kết quả' : 'Câu tiếp theo →'}
      </button>`;
    document.getElementById('wf-btn-next').addEventListener('click', () => {
      if (isLast) _showResult();
      else { _index++; _renderQuestion(); }
    });
  }

  // ─── Màn hình kết quả ─────────────────────────────────────────
  function _showResult() {
    const total   = _set.length;
    const pct     = Math.round(_score / total * 100);
    const timeSec = Math.round((Date.now() - _start) / 1000);
    const grade   = pct >= 83 ? { icon: '🏆', label: 'Xuất sắc!',    color: 'var(--success)' }
                  : pct >= 67 ? { icon: '👍', label: 'Tốt!',         color: 'var(--accent)'  }
                  : pct >= 50 ? { icon: '📖', label: 'Ổn!',          color: 'var(--warning)' }
                  :             { icon: '💪', label: 'Luyện thêm!',  color: 'var(--danger)'  };

    document.getElementById('wf-prog-fill').style.width = '100%';
    document.getElementById('wf-prog-text').textContent  = 'Hoàn thành!';

    // Thống kê theo từ loại
    const posStats = {};
    _set.forEach((q, i) => {
      const pos = q.pos;
      if (!posStats[pos]) posStats[pos] = { total: 0 };
      posStats[pos].total++;
    });

    const statsHtml = Object.entries(posStats).map(([pos, s]) => {
      const cfg = POS_CONFIG[pos];
      return `<span class="wf-stat-pill" style="color:${cfg.color};background:${cfg.bg};border-color:${cfg.border}">${cfg.label}: ${s.total}</span>`;
    }).join('');

    document.getElementById('wf-body').innerHTML = `
      <div class="wf-result-wrap">
        <div class="wf-result-icon">${grade.icon}</div>
        <div class="wf-result-grade" style="color:${grade.color}">${grade.label}</div>
        <div class="wf-result-score">${_score} / ${total}</div>
        <div class="wf-result-sub">Đúng ${pct}% · ${timeSec} giây</div>
        <div class="wf-result-pos">Từ loại đã ôn: ${statsHtml}</div>
      </div>`;

    document.getElementById('wf-footer').innerHTML = `
      <button class="wf-btn-retry" id="wf-btn-retry">🔄 Làm lại</button>
      <button class="wf-btn-done"  id="wf-btn-done">✅ Xong</button>`;
    document.getElementById('wf-btn-retry').addEventListener('click', open);
    document.getElementById('wf-btn-done').addEventListener('click', close);

    if (typeof Tracker !== 'undefined' && Tracker.trackQuiz) {
      Tracker.trackQuiz({ mode: 'luyen-tu-loai', correct: _score, total, timeSpentSec: timeSec, unitId: '' });
    }
  }

  // ─── Đóng overlay ─────────────────────────────────────────────
  function close() {
    if (_overlay) {
      _overlay.classList.remove('wf-visible');
      setTimeout(() => { if (_overlay) { _overlay.remove(); _overlay = null; } }, 300);
    }
  }

  function getTotalQuestions() { return WORD_FORM_DATA.length; }

  return { open, close, getTotalQuestions };
})();

window.WordFormDrill = WordFormDrill;
