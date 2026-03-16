// ═══════════════════════════════════════════════════════════════
//   Transformation Drill – TOEIC Grammar Upgrade v2
//   Giúp học viên luyện chuyển đổi câu theo các mẫu ngữ pháp
//   cốt lõi: Active→Passive, thì, câu điều kiện, gerund/inf
//
//   Tích hợp: thêm <script src="transformation-drill.js"></script>
//   vào index.html SAU toeic-app.js
// ═══════════════════════════════════════════════════════════════

const TransformDrill = (() => {

  // ─── Ngân hàng bài tập Transformation ─────────────────────────
  // Mỗi bài gồm: type, grammarId, unitId (để kết nối Unit),
  // prompt (câu gốc), instruction (yêu cầu chuyển đổi),
  // options (A-D), answer (index), explanation, hint
  const TRANSFORM_DATA = [

    // ══════════════════════════════════════
    //  ACTIVE → PASSIVE (grammarId: passive)
    // ══════════════════════════════════════
    {
      id: 'tr-p-001', type: 'active-passive', grammarId: 'passive', unitId: 2,
      instruction: '🔄 Chuyển sang câu bị động',
      prompt: 'The manager reviews the quarterly report every month.',
      question: 'The quarterly report _____ by the manager every month.',
      options: ['is reviewed', 'reviews', 'was reviewed', 'will be reviewed'],
      answer: 0,
      explanation: 'Bị động hiện tại đơn: is/are + V3. "Reviews" (hiện tại đơn) → "is reviewed".',
      hint: 'Hiện tại đơn bị động: am/is/are + V3',
      tag: 'Present Simple Passive'
    },
    {
      id: 'tr-p-002', type: 'active-passive', grammarId: 'passive', unitId: 2,
      instruction: '🔄 Chuyển sang câu bị động',
      prompt: 'The HR team will announce the new policy tomorrow.',
      question: 'The new policy _____ by the HR team tomorrow.',
      options: ['will announce', 'will be announced', 'is announced', 'has been announced'],
      answer: 1,
      explanation: 'Bị động tương lai: will + be + V3. "Will announce" → "will be announced".',
      hint: 'Tương lai bị động: will + be + V3',
      tag: 'Future Passive'
    },
    {
      id: 'tr-p-003', type: 'active-passive', grammarId: 'passive', unitId: 2,
      instruction: '🔄 Chuyển sang câu bị động',
      prompt: 'The client has signed the contract.',
      question: 'The contract _____ by the client.',
      options: ['signed', 'has signed', 'has been signed', 'was signed'],
      answer: 2,
      explanation: 'Bị động hiện tại hoàn thành: have/has + been + V3. "Has signed" → "has been signed".',
      hint: 'Hiện tại hoàn thành bị động: have/has + been + V3',
      tag: 'Present Perfect Passive'
    },
    {
      id: 'tr-p-004', type: 'active-passive', grammarId: 'passive', unitId: 2,
      instruction: '🔄 Chuyển sang câu bị động',
      prompt: 'Someone must submit all expense reports by Friday.',
      question: 'All expense reports _____ by Friday.',
      options: ['must submit', 'must be submitted', 'should submit', 'should be submitted'],
      answer: 1,
      explanation: 'Bị động sau modal: modal + be + V3. "Must submit" → "must be submitted".',
      hint: 'Modal bị động: modal + be + V3',
      tag: 'Modal Passive'
    },
    {
      id: 'tr-p-005', type: 'active-passive', grammarId: 'passive', unitId: 2,
      instruction: '🔄 Chuyển sang câu bị động',
      prompt: 'The company was renovating the office when we arrived.',
      question: 'The office _____ by the company when we arrived.',
      options: ['was renovating', 'was being renovated', 'had been renovated', 'is renovated'],
      answer: 1,
      explanation: 'Bị động quá khứ tiếp diễn: was/were + being + V3. "Was renovating" → "was being renovated".',
      hint: 'Quá khứ tiếp diễn bị động: was/were + being + V3',
      tag: 'Past Continuous Passive'
    },

    // ══════════════════════════════════════
    //  THÌ ĐỘNG TỪ (grammarId: verb-tense)
    // ══════════════════════════════════════
    {
      id: 'tr-t-001', type: 'tense-shift', grammarId: 'verb-tense', unitId: 1,
      instruction: '⏱️ Chọn thì đúng cho ngữ cảnh',
      prompt: 'Câu gốc: "She works here every day." → Thêm "since 2020" vào cuối.',
      question: 'She _____ here since 2020.',
      options: ['works', 'worked', 'has worked', 'is working'],
      answer: 2,
      explanation: '"Since 2020" là dấu hiệu của hiện tại hoàn thành (Present Perfect). Hành động bắt đầu 2020 và còn tiếp tục.',
      hint: '"Since" luôn đi với thì nào?',
      tag: 'Present Perfect'
    },
    {
      id: 'tr-t-002', type: 'tense-shift', grammarId: 'verb-tense', unitId: 1,
      instruction: '⏱️ Chọn thì đúng cho ngữ cảnh',
      prompt: 'Câu gốc: "The team finishes the project." → Thêm "by next Friday" vào cuối.',
      question: 'By next Friday, the team _____ the project.',
      options: ['will finish', 'finishes', 'will have finished', 'has finished'],
      answer: 2,
      explanation: '"By + mốc tương lai" → tương lai hoàn thành (Future Perfect: will have + V3).',
      hint: '"By + thời gian tương lai" cần thì nào?',
      tag: 'Future Perfect'
    },
    {
      id: 'tr-t-003', type: 'tense-shift', grammarId: 'verb-tense', unitId: 1,
      instruction: '⏱️ Chọn thì đúng cho ngữ cảnh',
      prompt: 'Câu gốc: "They reviewed the document." → Thêm "before the meeting started" vào cuối.',
      question: 'They _____ the document before the meeting started.',
      options: ['reviewed', 'were reviewing', 'had reviewed', 'have reviewed'],
      answer: 2,
      explanation: 'Hành động xảy ra TRƯỚC một hành động quá khứ khác → quá khứ hoàn thành (Past Perfect: had + V3).',
      hint: 'Hành động nào xảy ra trước trong quá khứ?',
      tag: 'Past Perfect'
    },
    {
      id: 'tr-t-004', type: 'tense-shift', grammarId: 'verb-tense', unitId: 1,
      instruction: '⏱️ Chọn thì đúng cho ngữ cảnh',
      prompt: 'Câu gốc: "The team develops the app." → Thêm "for six months / by next year" vào bài.',
      question: 'By next year, the team _____ the app for six months.',
      options: ['will develop', 'has been developing', 'will have been developing', 'develops'],
      answer: 2,
      explanation: '"By + tương lai" + "for + khoảng thời gian" → tương lai hoàn thành tiếp diễn (Future Perfect Continuous).',
      hint: 'Khi có cả "by + tương lai" lẫn "for + duration"...',
      tag: 'Future Perfect Continuous'
    },
    {
      id: 'tr-t-005', type: 'tense-shift', grammarId: 'verb-tense', unitId: 1,
      instruction: '⏱️ Chọn thì đúng cho ngữ cảnh',
      prompt: 'Ngữ cảnh: Cuộc họp bị gián đoạn. "The director was presenting" + "when the fire alarm rang."',
      question: 'The director _____ when the fire alarm rang.',
      options: ['presented', 'was presenting', 'has presented', 'had been presenting'],
      answer: 1,
      explanation: 'Hành động đang diễn ra bị gián đoạn → quá khứ tiếp diễn (Past Continuous: was/were + V-ing).',
      hint: '"When + sự kiện gián đoạn" → hành động đang diễn ra cần thì gì?',
      tag: 'Past Continuous'
    },

    // ══════════════════════════════════════════════
    //  CÂU ĐIỀU KIỆN (grammarId: conditionals)
    // ══════════════════════════════════════════════
    {
      id: 'tr-c-001', type: 'conditional-transform', grammarId: 'conditionals', unitId: 3,
      instruction: '🔀 Chuyển sang loại điều kiện phù hợp',
      prompt: 'Câu gốc (hiện thực): "If she applies, she will get the job."',
      question: 'Chuyển sang điều kiện KHÔNG CÓ THẬT ở hiện tại:\n"If she applied, she _____ the job."',
      options: ['will get', 'would get', 'would have gotten', 'gets'],
      answer: 1,
      explanation: 'Điều kiện loại 2 (không có thật hiện tại): If + Past Simple, S + would + V. "Applied" → "would get".',
      hint: 'Điều kiện loại 2: If + quá khứ đơn, would + V',
      tag: 'Conditional Type 2'
    },
    {
      id: 'tr-c-002', type: 'conditional-transform', grammarId: 'conditionals', unitId: 3,
      instruction: '🔀 Chuyển sang loại điều kiện phù hợp',
      prompt: 'Câu gốc (loại 2): "If the merger had been approved, the company would have expanded."',
      question: 'Dạng ĐẢO NGỮ của câu trên:\n"_____ the merger been approved, the company would have expanded."',
      options: ['If', 'Had', 'Should', 'Were'],
      answer: 1,
      explanation: 'Đảo ngữ loại 3: Had + S + V3 (= If S had + V3). Bỏ "If" và đưa "had" lên đầu.',
      hint: 'Đảo ngữ loại 3: Had + S + V3...',
      tag: 'Conditional Inversion'
    },
    {
      id: 'tr-c-003', type: 'conditional-transform', grammarId: 'conditionals', unitId: 3,
      instruction: '🔀 Chọn đúng để hoàn thành điều kiện',
      prompt: 'Câu gốc: "Please contact us if you have questions."',
      question: 'Dạng LỊCH SỰ/TRANG TRỌNG hơn:\n"_____ you have any questions, please contact us."',
      options: ['If', 'Should', 'Unless', 'Were'],
      answer: 1,
      explanation: '"Should you + V" = đảo ngữ điều kiện loại 1, rất trang trọng và phổ biến trong TOEIC email.',
      hint: 'Đảo ngữ loại 1 lịch sự: Should + S + V...',
      tag: 'Formal Conditional'
    },
    {
      id: 'tr-c-004', type: 'conditional-transform', grammarId: 'conditionals', unitId: 3,
      instruction: '🔀 Chuyển sang điều kiện phù hợp',
      prompt: 'Ý muốn diễn đạt: "The deadline is tomorrow; if it were not, I would relax." (giả định trái thực tế)',
      question: 'If the deadline _____ tomorrow, I would relax.',
      options: ['is not', 'was not', 'were not', 'will not be'],
      answer: 2,
      explanation: 'Điều kiện loại 2 dùng "were" (không phải "was") cho mọi ngôi. "If it were not" = chuẩn mực.',
      hint: 'Điều kiện loại 2: luôn dùng "were", không dùng "was"',
      tag: 'Subjunctive Were'
    },

    // ══════════════════════════════════════════════
    //  GERUND vs INFINITIVE (grammarId: gerund-infinitive)
    // ══════════════════════════════════════════════
    {
      id: 'tr-g-001', type: 'gerund-infinitive', grammarId: 'gerund-infinitive', unitId: 10,
      instruction: '🔁 Chọn gerund hay infinitive?',
      prompt: 'Động từ: SUGGEST\n"The consultant suggested _____ a new pricing model."',
      question: 'The consultant suggested _____ a new pricing model.',
      options: ['adopt', 'to adopt', 'adopting', 'adopted'],
      answer: 2,
      explanation: 'Suggest + V-ing (KHÔNG dùng to-infinitive). Tương tự: recommend, consider, avoid, enjoy.',
      hint: 'Suggest đi với gerund hay infinitive?',
      tag: 'Suggest + V-ing'
    },
    {
      id: 'tr-g-002', type: 'gerund-infinitive', grammarId: 'gerund-infinitive', unitId: 10,
      instruction: '🔁 Chọn gerund hay infinitive?',
      prompt: 'Giới từ: look forward to\n"We look forward to _____ from you."',
      question: 'We look forward to _____ from you.',
      options: ['hear', 'hearing', 'have heard', 'be hearing'],
      answer: 1,
      explanation: '"Look forward to" + V-ing (vì "to" ở đây là GIỚI TỪ, không phải to-infinitive). Đây là bẫy cực kỳ phổ biến trong TOEIC!',
      hint: '"To" trong "look forward to" là giới từ hay phần của to-infinitive?',
      tag: 'Preposition + V-ing Trap'
    },
    {
      id: 'tr-g-003', type: 'gerund-infinitive', grammarId: 'gerund-infinitive', unitId: 10,
      instruction: '🔁 Chọn gerund hay infinitive?',
      prompt: 'So sánh: REMEMBER\n"I remember sending the email." vs "Remember to send the email."',
      question: 'Please remember _____ the report before you leave.',
      options: ['submitting', 'to submit', 'submit', 'submitted'],
      answer: 1,
      explanation: '"Remember to V" = nhớ phải làm việc gì (trong tương lai). "Remember V-ing" = nhớ đã làm việc gì (trong quá khứ).',
      hint: 'Hành động này xảy ra trong quá khứ hay tương lai?',
      tag: 'Remember to vs V-ing'
    },
    {
      id: 'tr-g-004', type: 'gerund-infinitive', grammarId: 'gerund-infinitive', unitId: 10,
      instruction: '🔁 Chọn gerund hay infinitive?',
      prompt: 'Cấu trúc: ALLOW\n"The policy allows employees _____ from home on Fridays."',
      question: 'The policy allows employees _____ from home on Fridays.',
      options: ['work', 'working', 'to work', 'worked'],
      answer: 2,
      explanation: '"Allow + object + to V" (infinitive). Tương tự: ask, tell, expect, require, enable, encourage, advise.',
      hint: 'Allow + ai đó + làm gì → dùng cấu trúc nào?',
      tag: 'Object + Infinitive'
    },

    // ══════════════════════════════════════════════
    //  MỆNH ĐỀ QUAN HỆ (grammarId: relative-clause)
    // ══════════════════════════════════════════════
    {
      id: 'tr-r-001', type: 'combine-relative', grammarId: 'relative-clause', unitId: 8,
      instruction: '🔗 Nối 2 câu dùng mệnh đề quan hệ',
      prompt: 'Câu 1: "The manager approved the budget."\nCâu 2: "Her decision surprised everyone."',
      question: 'The manager, _____ decision surprised everyone, approved the budget.',
      options: ['who', 'whose', 'whom', 'which'],
      answer: 1,
      explanation: '"Whose" = đại từ quan hệ sở hữu (her decision → whose decision). Khi "decision" thuộc về "the manager".',
      hint: '"Decision" thuộc về ai? → dùng đại từ sở hữu nào?',
      tag: 'Whose (Possessive)'
    },
    {
      id: 'tr-r-002', type: 'combine-relative', grammarId: 'relative-clause', unitId: 8,
      instruction: '🔗 Nối 2 câu dùng mệnh đề quan hệ',
      prompt: 'Câu 1: "The conference room has 50 seats."\nCâu 2: "We held the meeting in the room."',
      question: 'The conference room _____ we held the meeting has 50 seats.',
      options: ['where', 'which', 'in which', 'that'],
      answer: 2,
      explanation: '"In which" = "where" (chỉ địa điểm). Chuẩn hơn trong văn viết trang trọng. "That" không dùng sau giới từ.',
      hint: 'Mệnh đề quan hệ chỉ địa điểm: where = in which',
      tag: 'In Which = Where'
    },
    {
      id: 'tr-r-003', type: 'combine-relative', grammarId: 'relative-clause', unitId: 8,
      instruction: '🔗 Nối 2 câu dùng mệnh đề quan hệ',
      prompt: 'Câu 1: "We interviewed the candidate."\nCâu 2: "The candidate impressed us most."',
      question: 'The candidate _____ we interviewed impressed us most.',
      options: ['who', 'whom', 'whose', 'which'],
      answer: 1,
      explanation: '"Whom" = đại từ quan hệ làm tân ngữ cho người (we interviewed him → whom we interviewed). Trang trọng hơn "who".',
      hint: '"We interviewed ___" → đại từ làm tân ngữ cho người = ?',
      tag: 'Whom (Object)'
    },

    // ══════════════════════════════════════════════
    //  SO SÁNH (grammarId: comparison)
    // ══════════════════════════════════════════════
    {
      id: 'tr-cm-001', type: 'comparison-transform', grammarId: 'comparison', unitId: 11,
      instruction: '📊 Chuyển sang dạng so sánh đúng',
      prompt: 'Thông tin: "Method A costs $100. Method B costs $300." → So sánh Method B với A.',
      question: 'Method B is _____ Method A.',
      options: ['more expensive than', 'the most expensive', 'as expensive as', 'expensiver than'],
      answer: 0,
      explanation: '"More expensive than" = so sánh hơn. Tính từ dài (≥2 âm tiết) dùng "more + adj + than".',
      hint: 'So sánh 2 đối tượng → so sánh hơn hay so sánh nhất?',
      tag: 'Comparative'
    },
    {
      id: 'tr-cm-002', type: 'comparison-transform', grammarId: 'comparison', unitId: 11,
      instruction: '📊 Nhấn mạnh mức độ so sánh',
      prompt: 'Câu gốc: "This is the best deal we have received."\n→ Thêm cụm nhấn mạnh vào câu.',
      question: 'This is _____ the best deal we have received.',
      options: ['so', 'very', 'by far', 'more'],
      answer: 2,
      explanation: '"By far" = vượt trội hoàn toàn, cách xa. Dùng với so sánh nhất để nhấn mạnh. "By far the best" = tốt nhất tuyệt đối.',
      hint: 'Cụm nào nhấn mạnh mức độ "vượt trội tuyệt đối" với so sánh nhất?',
      tag: 'By Far + Superlative'
    },

    // ══════════════════════════════════════════════
    //  PHÂN TỪ (grammarId: participles)
    // ══════════════════════════════════════════════
    {
      id: 'tr-pt-001', type: 'participle-reduce', grammarId: 'participles', unitId: 12,
      instruction: '✂️ Rút gọn mệnh đề thành cụm phân từ',
      prompt: 'Câu gốc: "Because she was encouraged by the results, the manager continued the program."',
      question: '_____ by the results, the manager continued the program.',
      options: ['Encouraging', 'Encouraged', 'Having encouraged', 'To encourage'],
      answer: 1,
      explanation: '"Encouraged" (phân từ II bị động) vì manager nhận sự khích lệ. Câu rút gọn bị động: V3 + ...',
      hint: 'Manager "được/bị" khích lệ hay tự khích lệ?',
      tag: 'Passive Participle'
    },
    {
      id: 'tr-pt-002', type: 'participle-reduce', grammarId: 'participles', unitId: 12,
      instruction: '✂️ Rút gọn mệnh đề thành cụm phân từ',
      prompt: 'Câu gốc: "After they completed the training, the team began the project."',
      question: '_____ the training, the team began the project.',
      options: ['Completing', 'Having completed', 'Completed', 'To complete'],
      answer: 1,
      explanation: '"Having completed" = cụm phân từ hoàn thành, chỉ hành động xảy ra TRƯỚC trong cùng một chủ ngữ.',
      hint: 'Hành động nào xảy ra trước? → dùng dạng phân từ nào?',
      tag: 'Perfect Participle'
    },

    // ══════════════════════════════════════════════
    //  LIÊN TỪ & DESPITE/ALTHOUGH (grammarId: conjunction)
    // ══════════════════════════════════════════════
    {
      id: 'tr-conj-001', type: 'conjunction-transform', grammarId: 'conjunction', unitId: 6,
      instruction: '🔁 Chuyển đổi giữa DESPITE và ALTHOUGH',
      prompt: 'Câu gốc: "Although the budget was tight, the team delivered an excellent result."',
      question: '_____ the tight budget, the team delivered an excellent result.',
      options: ['Although', 'Despite', 'Even though', 'Because of'],
      answer: 1,
      explanation: '"Despite + noun/noun phrase". "Although + clause (S+V)". Khi chuyển "although S+V" → "despite + N/V-ing".',
      hint: 'Despite đi với danh từ, although đi với mệnh đề có S+V',
      tag: 'Despite vs Although'
    },
    {
      id: 'tr-conj-002', type: 'conjunction-transform', grammarId: 'conjunction', unitId: 6,
      instruction: '🔁 Chuyển đổi liên từ nguyên nhân',
      prompt: 'Câu gốc (clause): "Because supply chain issues persisted, the launch was delayed."',
      question: '_____ supply chain issues, the launch was delayed.',
      options: ['Because', 'Due to', 'Although', 'So that'],
      answer: 1,
      explanation: '"Due to + noun phrase". "Because + clause (S+V)". Khi chuyển từ clause sang noun phrase dùng "due to/owing to/because of".',
      hint: 'Due to đi với danh từ, because đi với mệnh đề',
      tag: 'Due to vs Because'
    },
    {
      id: 'tr-conj-003', type: 'conjunction-transform', grammarId: 'conjunction', unitId: 6,
      instruction: '🔁 Chọn liên từ logic phù hợp',
      prompt: 'Ngữ cảnh: "Sales rose 15%. [THÊM] the company launched a new product line."',
      question: '_____, the company launched a new product line.',
      options: ['However', 'Furthermore', 'As a result', 'Despite this'],
      answer: 1,
      explanation: '"Furthermore/Moreover" = thêm vào đó (bổ sung thông tin tích cực). "As a result" = kết quả. Ngữ cảnh đây là bổ sung thêm thành tựu.',
      hint: 'Câu sau BỔ SUNG thêm điều tích cực → liên từ nào?',
      tag: 'Furthermore / Moreover'
    },

    // ══════════════════════════════════════════════
    //  ĐẢO NGỮ (grammarId: inversion)
    // ══════════════════════════════════════════════
    {
      id: 'tr-inv-001', type: 'inversion-transform', grammarId: 'inversion', unitId: 19,
      instruction: '🔄 Chuyển sang dạng đảo ngữ trang trọng',
      prompt: 'Câu gốc: "We have never seen such strong results."',
      question: '_____ have we seen such strong results.',
      options: ['Rarely', 'Never', 'Not only', 'Only if'],
      answer: 1,
      explanation: '"Never have we..." = đảo ngữ với phó từ phủ định. "Never" đứng đầu câu → đảo trợ động từ trước chủ ngữ.',
      hint: 'Đảo ngữ với phó từ phủ định: Never/Rarely/Seldom + trợ động từ + S + V',
      tag: 'Negative Adverb Inversion'
    },
    {
      id: 'tr-inv-002', type: 'inversion-transform', grammarId: 'inversion', unitId: 19,
      instruction: '🔄 Chuyển sang dạng đảo ngữ trang trọng',
      prompt: 'Câu gốc: "If you have any questions, please contact us."',
      question: '_____ any questions, please contact us.',
      options: ['If you have', 'Should you have', 'Were you to have', 'Had you'],
      answer: 1,
      explanation: '"Should you have" = đảo ngữ điều kiện loại 1, trang trọng hơn "If you have". Hay gặp trong email TOEIC Part 6.',
      hint: 'Đảo ngữ điều kiện loại 1 trang trọng: Should + S + V',
      tag: 'Should-Inversion'
    },

    // ══════════════════════════════════════════════
    //  SUBJECT-VERB AGREEMENT (grammarId: subject-verb)
    // ══════════════════════════════════════════════
    {
      id: 'tr-sv-001', type: 'subject-verb', grammarId: 'subject-verb', unitId: 13,
      instruction: '⚖️ Chọn động từ đúng (hòa hợp chủ-vị)',
      prompt: 'Bẫy: "A number of employees" vs "The number of employees"',
      question: 'A number of employees _____ requesting flexible work hours.',
      options: ['is', 'are', 'was', 'has been'],
      answer: 1,
      explanation: '"A number of + N số nhiều" → động từ SỐ NHIỀU. Ngược lại, "The number of + N" → động từ SỐ ÍT.',
      hint: '"A number of" khác "The number of" như thế nào?',
      tag: 'A Number of vs The Number of'
    },
    {
      id: 'tr-sv-002', type: 'subject-verb', grammarId: 'subject-verb', unitId: 13,
      instruction: '⚖️ Chọn động từ đúng (hòa hợp chủ-vị)',
      prompt: 'Bẫy cấu trúc: "The manager, along with his assistants, ..."',
      question: 'The manager, along with his assistants, _____ the meeting.',
      options: ['attend', 'attends', 'are attending', 'have attended'],
      answer: 1,
      explanation: '"S1 + along with S2" → chia theo S1. "The manager" (số ít) → attends. "Along with" không phải "and" → không tính vào chủ ngữ.',
      hint: '"Along with" không làm thay đổi số của chủ ngữ chính',
      tag: 'S along with S → V1'
    },

    // ══════════════════════════════════════════════
    //  SUBJUNCTIVE (grammarId: subjunctive)
    // ══════════════════════════════════════════════
    {
      id: 'tr-sub-001', type: 'subjunctive', grammarId: 'subjunctive', unitId: 22,
      instruction: '📋 Áp dụng cấu trúc Subjunctive (Giá định cách)',
      prompt: 'Cấu trúc: recommend/suggest/insist/require + that + S + V (nguyên thể)',
      question: 'The board recommended that the CEO _____ the proposal.',
      options: ['reviews', 'review', 'reviewed', 'to review'],
      answer: 1,
      explanation: 'Sau recommend/suggest/insist/require + "that" → dùng V nguyên thể (không chia -s, không dùng would). Đây là "subjunctive mood".',
      hint: 'Recommend + that + S + V_?_ → không chia theo chủ ngữ',
      tag: 'Subjunctive after Recommend'
    },
    {
      id: 'tr-sub-002', type: 'subjunctive', grammarId: 'subjunctive', unitId: 22,
      instruction: '📋 Áp dụng cấu trúc Subjunctive',
      prompt: 'Cấu trúc: It is essential/vital/important + that + S + V',
      question: 'It is essential that all staff members _____ safety protocols.',
      options: ['follow', 'follows', 'are following', 'will follow'],
      answer: 0,
      explanation: '"It is essential/vital/important that + S + V nguyên thể". Không thêm -s dù chủ ngữ số ít.',
      hint: '"It is essential that" → V nguyên thể, không chia',
      tag: 'It is Essential That'
    },

    // ══════════════════════════════════════
    //  PASSIVE – bổ sung thêm 5 bài (#006–010)
    // ══════════════════════════════════════
    {
      id: 'tr-p-006', type: 'active-passive', grammarId: 'passive', unitId: 2,
      instruction: '🔄 Chuyển sang câu bị động',
      prompt: 'The board of directors was discussing the merger when we joined.',
      question: 'The merger _____ by the board of directors when we joined.',
      options: ['was discussing', 'was being discussed', 'had been discussed', 'is discussed'],
      answer: 1,
      explanation: 'Bị động quá khứ tiếp diễn: was/were + being + V3. "Was discussing" → "was being discussed".',
      hint: 'Quá khứ tiếp diễn bị động: was/were + being + V3',
      tag: 'Past Continuous Passive'
    },
    {
      id: 'tr-p-007', type: 'active-passive', grammarId: 'passive', unitId: 2,
      instruction: '🔄 Chuyển sang câu bị động',
      prompt: 'The company has delivered the products to all clients.',
      question: 'The products _____ to all clients by the company.',
      options: ['has delivered', 'have been delivered', 'were delivered', 'had been delivered'],
      answer: 1,
      explanation: 'Bị động hiện tại hoàn thành số nhiều: have + been + V3. "Has delivered" → "have been delivered" (chủ ngữ mới "the products" là số nhiều).',
      hint: 'Hiện tại hoàn thành bị động: have/has + been + V3 (chia theo chủ ngữ mới)',
      tag: 'Present Perfect Passive'
    },
    {
      id: 'tr-p-008', type: 'active-passive', grammarId: 'passive', unitId: 2,
      instruction: '🔄 Chuyển sang câu bị động',
      prompt: 'They are currently renovating the conference room.',
      question: 'The conference room _____ currently.',
      options: ['is renovating', 'is being renovated', 'has been renovated', 'was renovated'],
      answer: 1,
      explanation: 'Bị động hiện tại tiếp diễn: is/are + being + V3. "Are renovating" → "is being renovated".',
      hint: 'Hiện tại tiếp diễn bị động: is/are + being + V3',
      tag: 'Present Continuous Passive'
    },
    {
      id: 'tr-p-009', type: 'active-passive', grammarId: 'passive', unitId: 2,
      instruction: '🔄 Chuyển sang câu bị động',
      prompt: 'The government should implement the new regulation immediately.',
      question: 'The new regulation _____ immediately.',
      options: ['should implement', 'should be implemented', 'must implement', 'will implement'],
      answer: 1,
      explanation: 'Bị động sau modal should: should + be + V3. "Should implement" → "should be implemented".',
      hint: 'Should bị động: should + be + V3',
      tag: 'Modal Passive'
    },
    {
      id: 'tr-p-010', type: 'active-passive', grammarId: 'passive', unitId: 2,
      instruction: '🔄 Xác định câu nào dùng bị động ĐÚNG',
      prompt: 'Ngữ cảnh: "The results (chủ thể nhận) surprised the analysts (người phản ứng)."',
      question: 'The analysts _____ by the results.',
      options: ['surprised', 'were surprising', 'were surprised', 'have surprising'],
      answer: 2,
      explanation: '"The analysts" là người nhận cảm xúc (bị ngạc nhiên) → bị động "were surprised". Phân biệt: surprising (gây ngạc nhiên – dùng cho vật) vs surprised (cảm thấy ngạc nhiên – dùng cho người).',
      hint: 'Surprising (gây ra) vs surprised (cảm nhận) – ai là người nhận?',
      tag: 'Stative Passive'
    },

    // ══════════════════════════════════════
    //  VERB-TENSE – bổ sung thêm 5 bài (#006–010)
    // ══════════════════════════════════════
    {
      id: 'tr-t-006', type: 'tense-shift', grammarId: 'verb-tense', unitId: 1,
      instruction: '⏱️ Chọn thì đúng cho ngữ cảnh',
      prompt: 'Ngữ cảnh: Lịch trình cố định của cửa hàng.\n"The store opens at 9 a.m. _____."',
      question: 'The store _____ at 9 a.m. every day.',
      options: ['is opening', 'has opened', 'opens', 'will be opening'],
      answer: 2,
      explanation: 'Lịch trình cố định, thói quen lặp lại → hiện tại đơn. Keywords: every day/week, always, usually.',
      hint: '"Every day" → thì nào diễn đạt thói quen lặp lại?',
      tag: 'Present Simple – Schedule'
    },
    {
      id: 'tr-t-007', type: 'tense-shift', grammarId: 'verb-tense', unitId: 1,
      instruction: '⏱️ Chọn thì đúng cho ngữ cảnh',
      prompt: 'Ngữ cảnh: "The company moved to the new office last year. Before that, they _____ in the old building for 10 years."',
      question: 'Before moving, the company _____ in the old building for 10 years.',
      options: ['lived', 'has lived', 'had been living', 'was living'],
      answer: 2,
      explanation: '"For 10 years" + hành động kéo dài liên tục trước một mốc quá khứ → quá khứ hoàn thành tiếp diễn (had been + V-ing). Nhấn mạnh tính liên tục.',
      hint: 'Hành động kéo dài liên tục trước mốc quá khứ + for [duration]',
      tag: 'Past Perfect Continuous'
    },
    {
      id: 'tr-t-008', type: 'tense-shift', grammarId: 'verb-tense', unitId: 1,
      instruction: '⏱️ Chọn thì đúng cho ngữ cảnh',
      prompt: 'Ngữ cảnh: Câu điều kiện.\n"If the supply chain issues are resolved, production targets _____ next quarter."',
      question: 'If the issues are resolved, the company _____ its targets.',
      options: ['meets', 'met', 'will meet', 'would meet'],
      answer: 2,
      explanation: 'Điều kiện loại 1 (có thể xảy ra): If + hiện tại đơn → will + V. "If...are resolved" → "will meet".',
      hint: 'Điều kiện loại 1: if + hiện tại → will + V',
      tag: 'Conditional Type 1 Tense'
    },
    {
      id: 'tr-t-009', type: 'tense-shift', grammarId: 'verb-tense', unitId: 1,
      instruction: '⏱️ Chọn thì đúng cho ngữ cảnh',
      prompt: 'Ngữ cảnh: "The HR team has been distributing the new handbook _____ last month."',
      question: 'The HR team _____ the handbook since last month.',
      options: ['distributes', 'has been distributing', 'distributed', 'is distributing'],
      answer: 1,
      explanation: '"Since last month" + hành động bắt đầu quá khứ và còn tiếp diễn → hiện tại hoàn thành tiếp diễn (has/have + been + V-ing). Nhấn mạnh quá trình liên tục.',
      hint: '"Since" + hành động đang tiếp diễn → thì nào?',
      tag: 'Present Perfect Continuous'
    },
    {
      id: 'tr-t-010', type: 'tense-shift', grammarId: 'verb-tense', unitId: 1,
      instruction: '⏱️ Chọn thì đúng cho ngữ cảnh',
      prompt: 'Ngữ cảnh: "Unless the client approves the budget, the project _____ on hold."',
      question: 'Unless the client approves, the project _____ on hold.',
      options: ['remains', 'will remain', 'remained', 'would remain'],
      answer: 1,
      explanation: '"Unless" = if...not, dùng như điều kiện loại 1: unless + hiện tại đơn → will + V. Không dùng "will" trong mệnh đề "unless".',
      hint: 'Unless = if not → cấu trúc giống điều kiện loại 1',
      tag: 'Unless + Future'
    },

    // ══════════════════════════════════════
    //  GERUND / INFINITIVE – bổ sung thêm 6 bài (#005–010)
    // ══════════════════════════════════════
    {
      id: 'tr-g-005', type: 'gerund-infinitive', grammarId: 'gerund-infinitive', unitId: 10,
      instruction: '🔁 Chọn gerund hay infinitive?',
      prompt: 'Động từ: AVOID\n"The company avoids _____ unnecessary risks."',
      question: 'The company avoids _____ unnecessary risks.',
      options: ['take', 'to take', 'taking', 'taken'],
      answer: 2,
      explanation: '"Avoid + V-ing" là cấu trúc cố định. Tương tự: delay, postpone, mind, keep, consider, practice.',
      hint: 'Avoid đi với gerund hay infinitive?',
      tag: 'Avoid + V-ing'
    },
    {
      id: 'tr-g-006', type: 'gerund-infinitive', grammarId: 'gerund-infinitive', unitId: 10,
      instruction: '🔁 Chọn gerund hay infinitive?',
      prompt: 'Giới từ: in addition to\n"In addition to _____ the report, she also prepared the slides."',
      question: 'In addition to _____ the report, she also prepared the slides.',
      options: ['write', 'writing', 'written', 'to write'],
      answer: 1,
      explanation: '"In addition to + V-ing" vì "to" ở đây là giới từ. Tương tự: prior to, instead of, responsible for, interested in.',
      hint: '"In addition to" – "to" là giới từ hay to-infinitive?',
      tag: 'In Addition to + V-ing'
    },
    {
      id: 'tr-g-007', type: 'gerund-infinitive', grammarId: 'gerund-infinitive', unitId: 10,
      instruction: '🔁 Chọn gerund hay infinitive?',
      prompt: 'Động từ: PLAN\n"The marketing team plans _____ a new campaign next quarter."',
      question: 'The marketing team plans _____ a new campaign next quarter.',
      options: ['launching', 'to launch', 'launch', 'launched'],
      answer: 1,
      explanation: '"Plan + to V" là cấu trúc cố định. Tương tự: decide, agree, refuse, manage, fail, hope, expect, want.',
      hint: 'Plan đi với gerund hay infinitive?',
      tag: 'Plan + to V'
    },
    {
      id: 'tr-g-008', type: 'gerund-infinitive', grammarId: 'gerund-infinitive', unitId: 10,
      instruction: '🔁 Gerund làm CHỦ NGỮ',
      prompt: 'Ngữ cảnh: "_____ feedback regularly is essential for improvement."',
      question: '_____ feedback regularly is essential for improvement.',
      options: ['Collect', 'To collecting', 'Collecting', 'Collected'],
      answer: 2,
      explanation: 'Gerund (V-ing) làm chủ ngữ của câu. "Collecting feedback" = việc thu thập phản hồi. Cả to-infinitive cũng đúng nhưng gerund tự nhiên hơn trong văn TOEIC.',
      hint: 'Dạng nào của động từ có thể làm chủ ngữ?',
      tag: 'Gerund as Subject'
    },
    {
      id: 'tr-g-009', type: 'gerund-infinitive', grammarId: 'gerund-infinitive', unitId: 10,
      instruction: '🔁 So sánh: STOP',
      prompt: '"He stopped to read the email." vs "He stopped reading the email."\nNghĩa của hai câu KHÁC nhau.',
      question: 'The manager stopped _____ the report when the client called. (= ngừng đọc)',
      options: ['to read', 'reading', 'read', 'having read'],
      answer: 1,
      explanation: '"Stop + V-ing" = dừng không làm nữa. "Stop + to V" = dừng lại ĐỂ làm việc gì khác. Ở đây "ngừng đọc" → stop + V-ing.',
      hint: 'Stop + V-ing = dừng việc đang làm. Stop + to V = dừng lại để làm gì khác.',
      tag: 'Stop + V-ing vs to V'
    },
    {
      id: 'tr-g-010', type: 'gerund-infinitive', grammarId: 'gerund-infinitive', unitId: 10,
      instruction: '🔁 Chọn gerund hay infinitive?',
      prompt: 'Cấu trúc: ENABLE\n"The new software enables employees _____ from any location."',
      question: 'The new software enables employees _____ from any location.',
      options: ['work', 'working', 'to work', 'worked'],
      answer: 2,
      explanation: '"Enable + object + to V" (infinitive). Tương tự: allow, ask, tell, expect, require, encourage, advise, persuade, remind.',
      hint: 'Enable + ai đó + to do something',
      tag: 'Enable + Object + to V'
    },

    // ══════════════════════════════════════
    //  CONDITIONALS – bổ sung thêm 6 bài (#005–010)
    // ══════════════════════════════════════
    {
      id: 'tr-c-005', type: 'conditional-transform', grammarId: 'conditionals', unitId: 3,
      instruction: '🔀 Chọn đúng cấu trúc điều kiện',
      prompt: 'Ngữ cảnh: Điều không có thật trong quá khứ.\n"We missed the deadline. If we hadn\'t, the client would have been happy."',
      question: 'If we _____ the deadline, the client would have been satisfied.',
      options: ['meet', 'had met', 'would meet', 'have met'],
      answer: 1,
      explanation: 'Điều kiện loại 3 (trái ngược quá khứ): If + had + V3, S + would have + V3. Sự thật: chúng ta đã bỏ lỡ deadline.',
      hint: 'Điều kiện loại 3: If + had V3, would have V3',
      tag: 'Conditional Type 3'
    },
    {
      id: 'tr-c-006', type: 'conditional-transform', grammarId: 'conditionals', unitId: 3,
      instruction: '🔀 Chuyển sang dạng lịch sự/trang trọng',
      prompt: 'Câu gốc: "If you need any assistance, please let us know."',
      question: '_____ you need any assistance, please do not hesitate to contact us.',
      options: ['If', 'Were', 'Should', 'Had'],
      answer: 2,
      explanation: '"Should you need" = đảo ngữ điều kiện loại 1, rất trang trọng. Hay gặp trong email TOEIC Part 6.',
      hint: 'Đảo ngữ điều kiện loại 1 lịch sự: Should + S + V',
      tag: 'Should-Inversion (Formal)'
    },
    {
      id: 'tr-c-007', type: 'conditional-transform', grammarId: 'conditionals', unitId: 3,
      instruction: '🔀 Chọn từ điều kiện phù hợp',
      prompt: 'Ngữ cảnh: "The expansion will proceed _____ market conditions remain stable."',
      question: 'The expansion will proceed _____ market conditions remain stable.',
      options: ['unless', 'provided that', 'even if', 'although'],
      answer: 1,
      explanation: '"Provided that" = miễn là, với điều kiện là. Tương đương "as long as". Dùng khi đặt ra điều kiện để hành động xảy ra.',
      hint: '"Miễn là / với điều kiện là" → từ nào?',
      tag: 'Provided That'
    },
    {
      id: 'tr-c-008', type: 'conditional-transform', grammarId: 'conditionals', unitId: 3,
      instruction: '🔀 Chuyển sang dạng trang trọng hơn',
      prompt: 'Câu gốc: "If the budget had been approved, we would have hired more staff."',
      question: '_____ the budget been approved, we would have hired more staff.',
      options: ['If', 'Should', 'Were', 'Had'],
      answer: 3,
      explanation: 'Đảo ngữ loại 3: Had + S + V3 (= If S had + V3). Bỏ "If", đưa "had" lên đầu. Hay gặp trong văn viết trang trọng.',
      hint: 'Đảo ngữ điều kiện loại 3: Had + S + V3...',
      tag: 'Had-Inversion (Type 3)'
    },
    {
      id: 'tr-c-009', type: 'conditional-transform', grammarId: 'conditionals', unitId: 3,
      instruction: '🔀 Chọn từ điều kiện phù hợp',
      prompt: 'Ngữ cảnh: "We should bring an umbrella _____ it rains." (phòng trường hợp)',
      question: 'We should bring an umbrella _____ it rains.',
      options: ['unless', 'in case', 'provided that', 'so that'],
      answer: 1,
      explanation: '"In case" = phòng trường hợp, đề phòng. Khác với "if" (nếu). "Bring an umbrella in case it rains" = mang ô để phòng khi trời mưa.',
      hint: '"Phòng trường hợp / đề phòng" → từ nào?',
      tag: 'In Case'
    },
    {
      id: 'tr-c-010', type: 'conditional-transform', grammarId: 'conditionals', unitId: 3,
      instruction: '🔀 Chọn đúng dạng mixed conditional',
      prompt: 'Ngữ cảnh: Kết hợp điều kiện loại 2 + 3.\n"She didn\'t study hard → she failed → she is not a manager now."',
      question: 'If she had studied harder, she _____ a manager now.',
      options: ['would be', 'would have been', 'will be', 'had been'],
      answer: 0,
      explanation: 'Mixed conditional: hành động quá khứ (If + had V3) → kết quả hiện tại (would + V). "Would be" chỉ trạng thái hiện tại, khác với "would have been" chỉ quá khứ.',
      hint: 'Điều kiện trái quá khứ → kết quả ở HIỆN TẠI: would + V (không phải would have V3)',
      tag: 'Mixed Conditional'
    },

    // ══════════════════════════════════════
    //  RELATIVE CLAUSE – bổ sung thêm 7 bài (#004–010)
    // ══════════════════════════════════════
    {
      id: 'tr-r-004', type: 'combine-relative', grammarId: 'relative-clause', unitId: 8,
      instruction: '🔗 Chọn đại từ quan hệ đúng',
      prompt: 'Câu gốc: "The report was submitted on time. It impressed the client."',
      question: 'The report, _____ was submitted on time, impressed the client.',
      options: ['that', 'which', 'who', 'whose'],
      answer: 1,
      explanation: '"Which" dùng trong mệnh đề quan hệ phi hạn định (có dấu phẩy) cho vật. "That" KHÔNG dùng trong mệnh đề có dấu phẩy.',
      hint: 'Mệnh đề có dấu phẩy → that hay which?',
      tag: 'Which (Non-defining)'
    },
    {
      id: 'tr-r-005', type: 'combine-relative', grammarId: 'relative-clause', unitId: 8,
      instruction: '🔗 Chọn đại từ quan hệ đúng',
      prompt: 'Câu gốc: "The time was 9 a.m. The meeting started at that time."',
      question: 'The meeting started at 9 a.m., _____ most employees were still commuting.',
      options: ['when', 'which', 'where', 'that'],
      answer: 0,
      explanation: '"When" thay thế cho cụm thời gian ("at which time"). Dùng trong mệnh đề quan hệ chỉ thời gian.',
      hint: 'Đại từ quan hệ thay thế cho thời gian = ?',
      tag: 'When (Time Relative)'
    },
    {
      id: 'tr-r-006', type: 'combine-relative', grammarId: 'relative-clause', unitId: 8,
      instruction: '🔗 Chọn đại từ quan hệ đúng',
      prompt: 'Câu gốc: "The branch opened last year. The company launched there."',
      question: 'The branch _____ the company launched last year is now profitable.',
      options: ['which', 'that', 'where', 'when'],
      answer: 2,
      explanation: '"Where" thay thế cho cụm địa điểm ("in which" / "at which"). Dùng trong mệnh đề quan hệ chỉ nơi chốn.',
      hint: 'Đại từ quan hệ thay thế cho địa điểm = ?',
      tag: 'Where (Place Relative)'
    },
    {
      id: 'tr-r-007', type: 'combine-relative', grammarId: 'relative-clause', unitId: 8,
      instruction: '🔗 Rút gọn mệnh đề quan hệ',
      prompt: 'Câu gốc: "The candidates who were shortlisted will be notified today."',
      question: 'The candidates _____ will be notified today.',
      options: ['who shortlisted', 'shortlisting', 'shortlisted', 'who are shortlisting'],
      answer: 2,
      explanation: 'Rút gọn mệnh đề quan hệ bị động: "who were shortlisted" → "shortlisted" (bỏ who + be). Dùng V3 (past participle) thay cho who + be + V3.',
      hint: 'Rút gọn "who were V3" → chỉ còn V3',
      tag: 'Reduced Relative (Passive)'
    },
    {
      id: 'tr-r-008', type: 'combine-relative', grammarId: 'relative-clause', unitId: 8,
      instruction: '🔗 Rút gọn mệnh đề quan hệ',
      prompt: 'Câu gốc: "The manager who is reviewing the proposal is our CFO."',
      question: 'The manager _____ the proposal is our CFO.',
      options: ['reviews', 'reviewing', 'reviewed', 'who reviewed'],
      answer: 1,
      explanation: 'Rút gọn mệnh đề quan hệ chủ động: "who is reviewing" → "reviewing" (bỏ who + is). Dùng V-ing thay cho who + be + V-ing.',
      hint: 'Rút gọn "who is V-ing" → chỉ còn V-ing',
      tag: 'Reduced Relative (Active)'
    },
    {
      id: 'tr-r-009', type: 'combine-relative', grammarId: 'relative-clause', unitId: 8,
      instruction: '🔗 Chọn đại từ quan hệ đúng',
      prompt: 'Câu gốc: "The reason was unclear. The project was delayed for that reason."',
      question: 'The reason _____ the project was delayed remains unclear.',
      options: ['which', 'why', 'when', 'that'],
      answer: 1,
      explanation: '"Why" thay thế cho cụm lý do ("for which"). Dùng sau danh từ "reason".',
      hint: '"The reason ___" → đại từ quan hệ chỉ lý do = ?',
      tag: 'Why (Reason Relative)'
    },
    {
      id: 'tr-r-010', type: 'combine-relative', grammarId: 'relative-clause', unitId: 8,
      instruction: '🔗 Nối 2 câu dùng mệnh đề quan hệ',
      prompt: 'Câu 1: "The consultant gave advice."\nCâu 2: "Her advice transformed the business."',
      question: 'The consultant, _____ advice transformed the business, was highly effective.',
      options: ['who', 'whom', 'whose', 'which'],
      answer: 2,
      explanation: '"Whose" = sở hữu. "Her advice" → "whose advice". Khi danh từ theo sau là vật sở hữu của người, dùng "whose".',
      hint: '"advice" thuộc về ai? → dùng whose',
      tag: 'Whose (Possessive)'
    },

    // ══════════════════════════════════════
    //  CONJUNCTION – bổ sung thêm 7 bài (#004–010)
    // ══════════════════════════════════════
    {
      id: 'tr-conj-004', type: 'conjunction-transform', grammarId: 'conjunction', unitId: 6,
      instruction: '🔁 Chuyển đổi liên từ kết quả',
      prompt: 'Câu gốc: "Sales dropped significantly. As a result, the company cut its budget."',
      question: 'Sales dropped significantly; _____, the company cut its budget.',
      options: ['however', 'therefore', 'moreover', 'although'],
      answer: 1,
      explanation: '"Therefore" = do đó, vì vậy (kết quả). Tương đương: thus, consequently, as a result, hence. Đứng sau dấu chấm phẩy hoặc đầu câu mới.',
      hint: '"Vì vậy / do đó" → liên từ kết quả nào?',
      tag: 'Therefore / Consequently'
    },
    {
      id: 'tr-conj-005', type: 'conjunction-transform', grammarId: 'conjunction', unitId: 6,
      instruction: '🔁 Chọn liên từ thời gian đúng',
      prompt: 'Câu gốc: "The report will be sent immediately. [THỜI ĐIỂM] the meeting ends."',
      question: 'The report will be sent _____ the meeting ends.',
      options: ['until', 'once', 'during', 'while'],
      answer: 1,
      explanation: '"Once" = ngay khi, ngay sau khi (tức thì). Khác với "when" (khi), "after" (sau khi). "Once" nhấn mạnh hành động xảy ra ngay lập tức.',
      hint: '"Ngay khi / ngay sau khi" → từ nào?',
      tag: 'Once (Immediately After)'
    },
    {
      id: 'tr-conj-006', type: 'conjunction-transform', grammarId: 'conjunction', unitId: 6,
      instruction: '🔁 Chọn liên từ tương phản đúng',
      prompt: 'Câu gốc: "The proposal was strong. [TƯƠNG PHẢN] the committee requested revisions."',
      question: 'The proposal was strong; _____, the committee requested revisions.',
      options: ['furthermore', 'nonetheless', 'therefore', 'similarly'],
      answer: 1,
      explanation: '"Nonetheless / nevertheless" = tuy vậy, dù vậy. Dùng khi câu sau tương phản nhẹ với câu trước nhưng không hoàn toàn phủ nhận.',
      hint: '"Tuy vậy / dù vậy" sau một vế tích cực → liên từ nào?',
      tag: 'Nonetheless / Nevertheless'
    },
    {
      id: 'tr-conj-007', type: 'conjunction-transform', grammarId: 'conjunction', unitId: 6,
      instruction: '🔁 Chọn cấu trúc liên từ đúng',
      prompt: 'Ngữ cảnh: Công ty vừa mở rộng sang thị trường mới VỪA tăng nhân sự.',
      question: 'The company _____ expanded into new markets _____ increased its workforce.',
      options: ['both / and', 'either / or', 'neither / nor', 'not only / but'],
      answer: 0,
      explanation: '"Both A and B" = cả A lẫn B (tương phản tích cực). Động từ chia theo chủ ngữ thực. "Both...and" nhấn mạnh cả hai điều đều đúng.',
      hint: '"Cả A lẫn B" → cấu trúc song song nào?',
      tag: 'Both...And'
    },
    {
      id: 'tr-conj-008', type: 'conjunction-transform', grammarId: 'conjunction', unitId: 6,
      instruction: '🔁 Chọn liên từ mục đích đúng',
      prompt: 'Câu gốc: "The company hired more staff. [MỤC ĐÍCH] customers won\'t wait long."',
      question: 'The company hired more staff _____ customers would not wait long.',
      options: ['because', 'so that', 'although', 'unless'],
      answer: 1,
      explanation: '"So that" = để cho, nhằm mục đích. Đứng trước mệnh đề chỉ mục đích (thường có can/could/will/would). Khác với "because" (vì - nguyên nhân).',
      hint: '"Để cho / nhằm mục đích" → liên từ mục đích nào?',
      tag: 'So That (Purpose)'
    },
    {
      id: 'tr-conj-009', type: 'conjunction-transform', grammarId: 'conjunction', unitId: 6,
      instruction: '🔁 Chuyển đổi: WHILE vs WHEREAS',
      prompt: 'Ngữ cảnh: "The Asia division grew 30%. The Europe division declined 5%." (đối lập)',
      question: 'The Asia division grew 30%, _____ the Europe division declined 5%.',
      options: ['because', 'while', 'so', 'since'],
      answer: 1,
      explanation: '"While/whereas" = trong khi (tương phản song song giữa 2 vế). Dùng khi so sánh hai thực tế trái ngược nhau trong cùng thời điểm.',
      hint: 'Tương phản song song 2 vế: "trong khi đó" → từ nào?',
      tag: 'While / Whereas (Contrast)'
    },
    {
      id: 'tr-conj-010', type: 'conjunction-transform', grammarId: 'conjunction', unitId: 6,
      instruction: '🔁 Chọn liên từ điều kiện đúng',
      prompt: 'Ngữ cảnh: "The policy applies to all employees _____ they work full-time or part-time."',
      question: 'The policy applies _____ employees work full-time or part-time.',
      options: ['whether', 'if', 'unless', 'although'],
      answer: 0,
      explanation: '"Whether...or" = dù là...hay là (bất kể điều kiện nào). Dùng khi đưa ra cả hai trường hợp và cả hai đều đúng.',
      hint: '"Dù là A hay B" → từ nào?',
      tag: 'Whether...Or'
    },

    // ══════════════════════════════════════
    //  SUBJUNCTIVE – bổ sung thêm 8 bài (#003–010)
    // ══════════════════════════════════════
    {
      id: 'tr-sub-003', type: 'subjunctive', grammarId: 'subjunctive', unitId: 22,
      instruction: '📋 Áp dụng cấu trúc Subjunctive',
      prompt: 'Động từ: REQUIRE\n"The contract requires that the vendor _____ a 30-day notice."',
      question: 'The contract requires that the vendor _____ a 30-day notice.',
      options: ['gives', 'give', 'gave', 'will give'],
      answer: 1,
      explanation: '"Require + that + S + V nguyên thể" (subjunctive). Không chia -s dù chủ ngữ số ít. Tương tự: demand, insist, mandate, stipulate.',
      hint: 'Require + that + S + V nguyên thể (không -s)',
      tag: 'Require + That'
    },
    {
      id: 'tr-sub-004', type: 'subjunctive', grammarId: 'subjunctive', unitId: 22,
      instruction: '📋 Áp dụng cấu trúc Subjunctive',
      prompt: 'Động từ: INSIST\n"The auditor insisted that the manager _____ the documents."',
      question: 'The auditor insisted that the manager _____ the documents.',
      options: ['submits', 'submit', 'submitted', 'would submit'],
      answer: 1,
      explanation: '"Insist + that + S + V nguyên thể". Lưu ý: "insisted" (quá khứ) nhưng mệnh đề that vẫn dùng V nguyên thể, không phải V quá khứ.',
      hint: 'Insist + that → V nguyên thể, bất kể thì của insist',
      tag: 'Insist + That'
    },
    {
      id: 'tr-sub-005', type: 'subjunctive', grammarId: 'subjunctive', unitId: 22,
      instruction: '📋 Áp dụng cấu trúc Subjunctive',
      prompt: 'Cấu trúc: It is important/necessary\n"It is necessary that the team _____ the deadline."',
      question: 'It is necessary that the team _____ the deadline.',
      options: ['meets', 'meet', 'will meet', 'is meeting'],
      answer: 1,
      explanation: '"It is necessary/important/vital/crucial that + S + V nguyên thể". Không dùng will hoặc chia -s.',
      hint: 'It is necessary that → V nguyên thể',
      tag: 'It is Necessary That'
    },
    {
      id: 'tr-sub-006', type: 'subjunctive', grammarId: 'subjunctive', unitId: 22,
      instruction: '📋 Nhận dạng cấu trúc Subjunctive',
      prompt: 'Cấu trúc đặc biệt: "It is proposed/suggested/recommended that..."',
      question: 'It is proposed that the meeting _____ rescheduled.',
      options: ['is', 'be', 'was', 'will be'],
      answer: 1,
      explanation: '"It is proposed/suggested that + S + be + V3" (bị động subjunctive). Dùng "be" thay vì "is/are/was". Đây là bẫy phổ biến trong TOEIC Part 5.',
      hint: 'Subjunctive bị động: be + V3 (không phải is/are/was)',
      tag: 'Passive Subjunctive (Be)'
    },
    {
      id: 'tr-sub-007', type: 'subjunctive', grammarId: 'subjunctive', unitId: 22,
      instruction: '📋 Áp dụng cấu trúc Subjunctive',
      prompt: 'Động từ: MANDATE\n"Company policy mandates that all visitors _____ badges at all times."',
      question: 'Company policy mandates that all visitors _____ badges at all times.',
      options: ['wear', 'wears', 'are wearing', 'will wear'],
      answer: 0,
      explanation: '"Mandate + that + S + V nguyên thể". Các từ tương tự trong văn bản chính sách: mandate, stipulate, specify, require, necessitate.',
      hint: 'Mandate + that → V nguyên thể',
      tag: 'Mandate + That'
    },
    {
      id: 'tr-sub-008', type: 'subjunctive', grammarId: 'subjunctive', unitId: 22,
      instruction: '📋 Áp dụng cấu trúc Subjunctive',
      prompt: 'Cấu trúc với WISH:\n"I wish the meeting _____ shorter." (hiện tại không có thật)',
      question: 'I wish the meeting _____ shorter.',
      options: ['is', 'were', 'will be', 'has been'],
      answer: 1,
      explanation: '"Wish + were" diễn đạt điều ước trái với thực tế hiện tại. Luôn dùng "were" (không phải "was") dù chủ ngữ là I/he/she.',
      hint: 'Wish + thực tế hiện tại: I wish + S + were (không phải was)',
      tag: 'Wish + Were (Subjunctive)'
    },
    {
      id: 'tr-sub-009', type: 'subjunctive', grammarId: 'subjunctive', unitId: 22,
      instruction: '📋 Phân biệt Subjunctive vs thì thường',
      prompt: 'Hai câu dưới đây KHÁC nhau về nghĩa:\n"She suggested he takes a break." vs "She suggested he take a break."',
      question: 'Trong văn TOEIC trang trọng, câu đúng là:\n"The director suggested that the project _____ postponed."',
      options: ['is', 'be', 'was', 'will be'],
      answer: 1,
      explanation: '"Suggest + that + S + be + V3" (passive subjunctive). Dùng "be" (không phải "is/was") trong văn trang trọng. "Be postponed" = được hoãn lại.',
      hint: 'Suggest + that + passive → be + V3 (không phải is/was)',
      tag: 'Suggest + Passive Subjunctive'
    },
    {
      id: 'tr-sub-010', type: 'subjunctive', grammarId: 'subjunctive', unitId: 22,
      instruction: '📋 Nhận dạng Subjunctive trong câu thực tế',
      prompt: 'Câu thực tế từ TOEIC Part 5:\n"It is imperative that every department head _____ the quarterly report."',
      question: 'It is imperative that every department head _____ the quarterly report.',
      options: ['submits', 'submit', 'submitted', 'is submitting'],
      answer: 1,
      explanation: '"It is imperative that + S + V nguyên thể". "Every department head" là số ít nhưng KHÔNG thêm -s. Đây là bẫy điển hình ETS.',
      hint: 'Imperative that → V nguyên thể, không thêm -s dù chủ ngữ số ít',
      tag: 'It is Imperative That'
    },

    // ══════════════════════════════════════
    //  SUBJECT-VERB AGREEMENT – bổ sung thêm 8 bài (#003–010)
    // ══════════════════════════════════════
    {
      id: 'tr-sv-003', type: 'subject-verb', grammarId: 'subject-verb', unitId: 13,
      instruction: '⚖️ Chọn động từ đúng (hòa hợp chủ-vị)',
      prompt: 'Bẫy: Danh động từ làm chủ ngữ\n"Developing new products _____ time and resources."',
      question: 'Developing new products _____ time and resources.',
      options: ['require', 'requires', 'are requiring', 'have required'],
      answer: 1,
      explanation: 'Gerund (V-ing) làm chủ ngữ luôn được coi là số ÍT → động từ số ít. "Developing... requires". Tương tự: Making decisions is hard.',
      hint: 'Gerund làm chủ ngữ → số ít hay số nhiều?',
      tag: 'Gerund Subject → Singular'
    },
    {
      id: 'tr-sv-004', type: 'subject-verb', grammarId: 'subject-verb', unitId: 13,
      instruction: '⚖️ Chọn động từ đúng (hòa hợp chủ-vị)',
      prompt: 'Bẫy: Neither...nor\n"Neither the CEO nor the board members _____ aware of the issue."',
      question: 'Neither the CEO nor the board members _____ aware of the issue.',
      options: ['was', 'were', 'is', 'has been'],
      answer: 1,
      explanation: 'Cấu trúc "Neither A nor B": chia theo danh từ GẦN NHẤT với động từ. "Board members" (số nhiều) → "were".',
      hint: 'Neither A nor B → chia theo danh từ gần động từ nhất',
      tag: 'Neither...Nor Agreement'
    },
    {
      id: 'tr-sv-005', type: 'subject-verb', grammarId: 'subject-verb', unitId: 13,
      instruction: '⚖️ Chọn động từ đúng (hòa hợp chủ-vị)',
      prompt: 'Bẫy: Each / Every\n"Each of the department heads _____ required to submit a report."',
      question: 'Each of the department heads _____ required to submit a report.',
      options: ['are', 'is', 'were', 'have been'],
      answer: 1,
      explanation: '"Each of + noun (plural)" → động từ số ÍT vì "each" xét từng cá nhân riêng lẻ. Tương tự: "Every one of the employees is...".',
      hint: '"Each of + N số nhiều" → động từ số ít hay số nhiều?',
      tag: 'Each of + Plural N → Singular'
    },
    {
      id: 'tr-sv-006', type: 'subject-verb', grammarId: 'subject-verb', unitId: 13,
      instruction: '⚖️ Chọn động từ đúng (hòa hợp chủ-vị)',
      prompt: 'Bẫy: Chủ ngữ tập thể\n"The committee _____ reached a decision after three hours."',
      question: 'The committee _____ reached a decision.',
      options: ['have', 'has', 'were', 'are'],
      answer: 1,
      explanation: 'Danh từ tập thể (committee, team, board, staff, jury) trong tiếng Anh Mỹ thường dùng số ÍT khi hoạt động như một đơn vị thống nhất. "The committee has reached...".',
      hint: 'Committee, team, board → số ít hay số nhiều trong tiếng Anh Mỹ?',
      tag: 'Collective Noun (AmE)'
    },
    {
      id: 'tr-sv-007', type: 'subject-verb', grammarId: 'subject-verb', unitId: 13,
      instruction: '⚖️ Chọn động từ đúng (hòa hợp chủ-vị)',
      prompt: 'Bẫy: "There is / There are"\n"There _____ several issues with the current system."',
      question: 'There _____ several issues with the current system.',
      options: ['is', 'are', 'was', 'has been'],
      answer: 1,
      explanation: 'Trong cấu trúc "There is/are", động từ chia theo danh từ đứng SAU. "Several issues" (số nhiều) → "There are".',
      hint: '"There is/are" → chia theo danh từ phía sau',
      tag: 'There Is/Are Agreement'
    },
    {
      id: 'tr-sv-008', type: 'subject-verb', grammarId: 'subject-verb', unitId: 13,
      instruction: '⚖️ Chọn động từ đúng (hòa hợp chủ-vị)',
      prompt: 'Bẫy: "One of the + noun"\n"One of the main reasons for the delay _____ the shortage of materials."',
      question: 'One of the main reasons for the delay _____ the shortage of materials.',
      options: ['are', 'is', 'were', 'have been'],
      answer: 1,
      explanation: '"One of the + noun (plural)" → động từ số ÍT vì chủ ngữ thực sự là "one" (số ít). Đừng bị "reasons" (số nhiều) đánh lừa.',
      hint: '"One of the + N số nhiều" → chia theo "one" (số ít)',
      tag: 'One of the + Plural → Singular'
    },
    {
      id: 'tr-sv-009', type: 'subject-verb', grammarId: 'subject-verb', unitId: 13,
      instruction: '⚖️ Chọn động từ đúng (hòa hợp chủ-vị)',
      prompt: 'Bẫy: "Not only A but also B"\n"Not only the manager but also the employees _____ informed."',
      question: 'Not only the manager but also the employees _____ informed.',
      options: ['was', 'were', 'is', 'has been'],
      answer: 1,
      explanation: '"Not only A but also B" → chia theo danh từ GẦN NHẤT (B). "The employees" (số nhiều) → "were". Quy tắc tương tự neither...nor.',
      hint: 'Not only A but also B → chia theo B (gần nhất)',
      tag: 'Not Only...But Also'
    },
    {
      id: 'tr-sv-010', type: 'subject-verb', grammarId: 'subject-verb', unitId: 13,
      instruction: '⚖️ Chọn động từ đúng (hòa hợp chủ-vị)',
      prompt: 'Bẫy: Mệnh đề quan hệ chen vào\n"The data that was collected from all branches _____ reviewed."',
      question: 'The data that was collected from all branches _____ being reviewed.',
      options: ['are', 'is', 'were', 'have'],
      answer: 1,
      explanation: 'Chủ ngữ thực là "The data" (không đếm được, số ít) → "is". Mệnh đề quan hệ "that was collected..." chỉ bổ sung thông tin, không ảnh hưởng đến chủ ngữ.',
      hint: 'Mệnh đề quan hệ chen vào không ảnh hưởng đến chủ ngữ thực',
      tag: 'Subject + Relative Clause Agreement'
    },

    // ══════════════════════════════════════
    //  PARTICIPLES – bổ sung thêm 8 bài (#003–010)
    // ══════════════════════════════════════
    {
      id: 'tr-pt-003', type: 'participle-reduce', grammarId: 'participles', unitId: 12,
      instruction: '✂️ Rút gọn mệnh đề bằng phân từ',
      prompt: 'Câu gốc: "When she entered the office, she noticed something strange."',
      question: '_____ the office, she noticed something strange.',
      options: ['Entered', 'Having entered', 'Entering', 'To enter'],
      answer: 2,
      explanation: 'Hành động xảy ra đồng thời với mệnh đề chính → V-ing (present participle). "When she entered" → "Entering". Chủ ngữ cùng là "she".',
      hint: 'Hai hành động cùng thời gian, cùng chủ ngữ → V-ing',
      tag: 'Present Participle (Simultaneous)'
    },
    {
      id: 'tr-pt-004', type: 'participle-reduce', grammarId: 'participles', unitId: 12,
      instruction: '✂️ Rút gọn mệnh đề bằng phân từ',
      prompt: 'Câu gốc: "Because the system was updated overnight, it runs faster now."',
      question: '_____ overnight, the system runs faster now.',
      options: ['Updating', 'Having updated', 'Updated', 'Being updated'],
      answer: 2,
      explanation: '"Updated overnight" = rút gọn từ "Having been updated" hoặc "Updated" (phân từ bị động rút gọn). Vì hệ thống nhận tác động (được cập nhật).',
      hint: 'Hệ thống "được" cập nhật → bị động → V3',
      tag: 'Past Participle (Passive Reduced)'
    },
    {
      id: 'tr-pt-005', type: 'participle-reduce', grammarId: 'participles', unitId: 12,
      instruction: '✂️ Rút gọn mệnh đề bằng phân từ',
      prompt: 'Câu gốc: "Since it offers competitive pricing, the product attracts many buyers."',
      question: '_____ competitive pricing, the product attracts many buyers.',
      options: ['Offered', 'Offering', 'Having offered', 'To offer'],
      answer: 1,
      explanation: '"Offering" = rút gọn mệnh đề trạng ngữ nguyên nhân. Chủ ngữ "the product" chủ động đưa ra giá cạnh tranh → V-ing.',
      hint: 'The product chủ động → V-ing (present participle)',
      tag: 'Causal Participle Clause'
    },
    {
      id: 'tr-pt-006', type: 'participle-reduce', grammarId: 'participles', unitId: 12,
      instruction: '✂️ Nhận dạng lỗi phân từ lơ lửng',
      prompt: 'Bẫy: "Dangling Participle"\n❌ "Working overtime, the project was completed early."\n(Ai làm thêm giờ? "The project" không thể làm thêm giờ.)',
      question: 'Câu nào ĐÚNG?',
      options: ['Working overtime, the project was completed early.', 'Working overtime, the team completed the project early.', 'The project, working overtime, was completed early.', 'Worked overtime, the project finished early.'],
      answer: 1,
      explanation: 'Phân từ phải có cùng chủ ngữ với mệnh đề chính. "Working overtime" → chủ ngữ phải là NGƯỜI làm thêm giờ → "the team" mới đúng.',
      hint: 'Phân từ và mệnh đề chính phải có cùng chủ ngữ',
      tag: 'Dangling Participle (Error)'
    },
    {
      id: 'tr-pt-007', type: 'participle-reduce', grammarId: 'participles', unitId: 12,
      instruction: '✂️ Chọn phân từ đúng',
      prompt: 'Ngữ cảnh: "The presentation (gây ấn tượng) impressed everyone."\nvs "The audience (cảm thấy ấn tượng) was impressed."',
      question: 'The _____ results encouraged the team to continue.',
      options: ['encouraged', 'encouraging', 'being encouraged', 'to encourage'],
      answer: 1,
      explanation: '"Encouraging results" = kết quả (khích lệ/gây khích lệ) → V-ing (present participle) bổ nghĩa cho danh từ chỉ vật gây ra cảm xúc. "Encouraged team" = đội (cảm thấy được khích lệ) → V3.',
      hint: 'Danh từ gây ra cảm xúc → V-ing. Danh từ cảm nhận cảm xúc → V3.',
      tag: 'Emotive Participle (-ing vs -ed)'
    },
    {
      id: 'tr-pt-008', type: 'participle-reduce', grammarId: 'participles', unitId: 12,
      instruction: '✂️ Chọn phân từ đúng',
      prompt: 'Câu gốc: "The conference, which was held annually, draws 500 attendees."',
      question: 'The conference, _____ annually, draws 500 attendees.',
      options: ['holding', 'held', 'having held', 'to be held'],
      answer: 1,
      explanation: '"Held annually" = rút gọn mệnh đề quan hệ bị động "which is held annually". Dùng V3 thay cho "which is/was + V3".',
      hint: 'Rút gọn "which is V3" → chỉ còn V3',
      tag: 'Reduced Relative (V3)'
    },
    {
      id: 'tr-pt-009', type: 'participle-reduce', grammarId: 'participles', unitId: 12,
      instruction: '✂️ Rút gọn mệnh đề bằng phân từ',
      prompt: 'Câu gốc: "After they had reviewed all the data, the analysts published the report."',
      question: '_____ all the data, the analysts published the report.',
      options: ['Reviewing', 'Having reviewed', 'Reviewed', 'To review'],
      answer: 1,
      explanation: '"Having reviewed" = phân từ hoàn thành, chỉ hành động xảy ra TRƯỚC mệnh đề chính. "After having reviewed" rút gọn thành "Having reviewed".',
      hint: 'Hành động hoàn thành TRƯỚC → Having + V3',
      tag: 'Perfect Participle (Before)'
    },
    {
      id: 'tr-pt-010', type: 'participle-reduce', grammarId: 'participles', unitId: 12,
      instruction: '✂️ Rút gọn mệnh đề bằng phân từ',
      prompt: 'Câu gốc: "The documents that are required for the application include a CV and cover letter."',
      question: 'The documents _____ for the application include a CV and cover letter.',
      options: ['requiring', 'required', 'that require', 'to require'],
      answer: 1,
      explanation: '"Required for the application" = rút gọn "that are required for..." (mệnh đề quan hệ bị động). V3 thay thế cho "which are + V3".',
      hint: 'Rút gọn "which are V3" (bị động) → V3',
      tag: 'Required (Reduced Passive Relative)'
    },

    // ══════════════════════════════════════
    //  INVERSION – bổ sung thêm 8 bài (#003–010)
    // ══════════════════════════════════════
    {
      id: 'tr-inv-003', type: 'inversion-transform', grammarId: 'inversion', unitId: 19,
      instruction: '🔄 Chuyển sang dạng đảo ngữ',
      prompt: 'Câu gốc: "We rarely see such dedication in a new employee."',
      question: '_____ do we see such dedication in a new employee.',
      options: ['Never', 'Rarely', 'Seldom', 'Hardly'],
      answer: 1,
      explanation: '"Rarely" → đảo ngữ: "Rarely + trợ động từ + S + V". "Rarely do we see..." = Hiếm khi chúng ta thấy...',
      hint: 'Rarely đứng đầu câu → trợ động từ đảo trước S',
      tag: 'Rarely + Inversion'
    },
    {
      id: 'tr-inv-004', type: 'inversion-transform', grammarId: 'inversion', unitId: 19,
      instruction: '🔄 Hoàn thành câu đảo ngữ',
      prompt: 'Câu gốc: "The company not only cut costs but also improved efficiency."',
      question: 'Not only _____ costs, but the company also improved efficiency.',
      options: ['the company cut', 'did the company cut', 'the company did cut', 'cut the company'],
      answer: 1,
      explanation: '"Not only" đứng đầu mệnh đề → đảo ngữ: "Not only + trợ động từ + S + V". "Not only did the company cut...".',
      hint: 'Not only đầu câu → did/does/do + S + V',
      tag: 'Not Only (Inversion)'
    },
    {
      id: 'tr-inv-005', type: 'inversion-transform', grammarId: 'inversion', unitId: 19,
      instruction: '🔄 Hoàn thành câu đảo ngữ',
      prompt: 'Câu gốc: "We had barely started when the alarm went off."',
      question: '_____ we started when the alarm went off.',
      options: ['Barely had', 'Had barely', 'Barely have', 'Have barely'],
      answer: 0,
      explanation: '"Barely/Scarcely/Hardly" đứng đầu câu → đảo ngữ với had: "Barely had + S + V3... when...".',
      hint: 'Barely/Hardly/Scarcely + had + S + V3... when',
      tag: 'Barely Had...When'
    },
    {
      id: 'tr-inv-006', type: 'inversion-transform', grammarId: 'inversion', unitId: 19,
      instruction: '🔄 Chuyển sang dạng đảo ngữ',
      prompt: 'Câu gốc: "You can access the system only after verifying your identity."',
      question: 'Only after verifying your identity _____ access the system.',
      options: ['you can', 'can you', 'you could', 'could you'],
      answer: 1,
      explanation: '"Only after/when/if" đứng đầu câu → đảo ngữ: "Only after... + trợ động từ + S + V". "Only after...can you...".',
      hint: 'Only after + [điều kiện] → trợ động từ đảo trước S',
      tag: 'Only After (Inversion)'
    },
    {
      id: 'tr-inv-007', type: 'inversion-transform', grammarId: 'inversion', unitId: 19,
      instruction: '🔄 Chọn dạng đảo ngữ đúng',
      prompt: 'Câu gốc: "You must not share confidential information under any circumstances."',
      question: 'Under no circumstances _____ share confidential information.',
      options: ['you must', 'must you', 'you should', 'should you'],
      answer: 1,
      explanation: '"Under no circumstances" → đảo ngữ bắt buộc: "Under no circumstances + must/should + S + V". Đây là cấu trúc trang trọng trong quy định công ty.',
      hint: 'Under no circumstances → must/should + S (đảo ngữ)',
      tag: 'Under No Circumstances'
    },
    {
      id: 'tr-inv-008', type: 'inversion-transform', grammarId: 'inversion', unitId: 19,
      instruction: '🔄 Chọn dạng đảo ngữ đúng',
      prompt: 'Câu gốc: "No sooner had we launched the product than competitors copied it."',
      question: '_____ had we launched the product than competitors copied it.',
      options: ['Sooner', 'No sooner', 'Not sooner', 'Just'],
      answer: 1,
      explanation: '"No sooner had + S + V3 + than..." = vừa mới...thì... Đây là cấu trúc đảo ngữ cố định, hay gặp trong TOEIC Part 5.',
      hint: 'No sooner had + S + V3 + than... = vừa...thì...',
      tag: 'No Sooner...Than'
    },
    {
      id: 'tr-inv-009', type: 'inversion-transform', grammarId: 'inversion', unitId: 19,
      instruction: '🔄 Chọn dạng đảo ngữ điều kiện đúng',
      prompt: 'Câu gốc: "If the proposal were accepted, the project would begin immediately."',
      question: '_____ the proposal accepted, the project would begin immediately.',
      options: ['If', 'Should', 'Were', 'Had'],
      answer: 2,
      explanation: 'Đảo ngữ điều kiện loại 2: "Were + S + V/adj..." = If + S + were. "Were the proposal accepted" = If the proposal were accepted.',
      hint: 'Đảo ngữ loại 2: Were + S + ...',
      tag: 'Were-Inversion (Type 2)'
    },
    {
      id: 'tr-inv-010', type: 'inversion-transform', grammarId: 'inversion', unitId: 19,
      instruction: '🔄 Nhận dạng đảo ngữ trang trọng',
      prompt: 'Câu gốc: "We have never encountered such a complex situation."',
      question: 'Never before _____ encountered such a complex situation.',
      options: ['we have', 'have we', 'we had', 'had we'],
      answer: 1,
      explanation: '"Never (before)" đứng đầu câu → đảo ngữ với have: "Never before have + S + V3". Nhấn mạnh tính chưa từng có.',
      hint: 'Never before + have + S + V3',
      tag: 'Never Before Have'
    },

    // ══════════════════════════════════════
    //  COMPARISON – bổ sung thêm 8 bài (#003–010)
    // ══════════════════════════════════════
    {
      id: 'tr-cm-003', type: 'comparison-transform', grammarId: 'comparison', unitId: 11,
      instruction: '📊 Chọn dạng so sánh đúng',
      prompt: 'Thông tin: "Plan A costs $100. Plan B also costs $100." → So sánh bằng.',
      question: 'Plan B is _____ Plan A.',
      options: ['as expensive than', 'as expensive as', 'more expensive than', 'the most expensive as'],
      answer: 1,
      explanation: 'So sánh bằng: as + adj + as. "As expensive as" = đắt bằng. Lưu ý: KHÔNG dùng "than" sau "as...as".',
      hint: 'So sánh bằng: as + adj + as (không dùng than)',
      tag: 'As...As (Equality)'
    },
    {
      id: 'tr-cm-004', type: 'comparison-transform', grammarId: 'comparison', unitId: 11,
      instruction: '📊 Chọn dạng so sánh đúng',
      prompt: 'Tính từ ngắn: "fast"\nPhương án A nhanh hơn phương án B.',
      question: 'Method A processes data _____ Method B.',
      options: ['more fast than', 'faster than', 'fastest than', 'as fast than'],
      answer: 1,
      explanation: 'So sánh hơn tính từ ngắn (1 âm tiết): adj + -er + than. "Fast" → "faster than". Không dùng "more fast".',
      hint: 'Tính từ 1 âm tiết: adj + er + than',
      tag: 'Short Adjective Comparative'
    },
    {
      id: 'tr-cm-005', type: 'comparison-transform', grammarId: 'comparison', unitId: 11,
      instruction: '📊 Chọn dạng so sánh đúng',
      prompt: 'Bẫy tính từ đặc biệt: "good"\n"This quarter\'s results are better than _____ expected."',
      question: 'This quarter\'s results are _____ than we expected.',
      options: ['more good', 'gooder', 'better', 'best'],
      answer: 2,
      explanation: '"Good" có dạng bất quy tắc: good → better → best. Không dùng "more good" hay "gooder".',
      hint: 'Good → so sánh hơn bất quy tắc là gì?',
      tag: 'Irregular: Good → Better'
    },
    {
      id: 'tr-cm-006', type: 'comparison-transform', grammarId: 'comparison', unitId: 11,
      instruction: '📊 Chọn dạng so sánh đúng',
      prompt: 'Cấu trúc đặc biệt: "The more...the more"\n"Nếu bạn luyện tập nhiều hơn, kết quả sẽ tốt hơn."',
      question: '_____ you practice, _____ your results will be.',
      options: ['The more / the better', 'More / better', 'The most / the best', 'More / the best'],
      answer: 0,
      explanation: '"The more...the better/more..." = càng...càng... Đây là cấu trúc so sánh song song cố định. "The more you practice, the better your results will be."',
      hint: '"Càng...càng..." → The more...the + adj/adv',
      tag: 'The More...The Better'
    },
    {
      id: 'tr-cm-007', type: 'comparison-transform', grammarId: 'comparison', unitId: 11,
      instruction: '📊 Nhận dạng so sánh kép',
      prompt: 'Bẫy: "twice as much as"\n"The new office costs twice _____ the old one."',
      question: 'The new office costs twice _____ the old one.',
      options: ['more than', 'as much as', 'as many as', 'so much as'],
      answer: 1,
      explanation: '"Twice/three times as much as" = gấp đôi/ba. Dùng "as much as" (không đếm được) hoặc "as many as" (đếm được). Không dùng "more than" sau "twice".',
      hint: 'Twice + as much as (không phải "more than")',
      tag: 'Twice As Much As'
    },
    {
      id: 'tr-cm-008', type: 'comparison-transform', grammarId: 'comparison', unitId: 11,
      instruction: '📊 Chọn dạng so sánh đúng',
      prompt: 'Bẫy tính từ 2 âm tiết tận cùng -y: "busy"\n"The finance team is _____ than the marketing team."',
      question: 'The finance team is _____ than the marketing team.',
      options: ['more busy', 'busier', 'most busy', 'the busiest'],
      answer: 1,
      explanation: 'Tính từ 2 âm tiết tận cùng -y: đổi y → i rồi thêm -er. "Busy → busier". Không dùng "more busy".',
      hint: 'Tính từ -y: đổi y → i, thêm -er (happy → happier)',
      tag: '-Y Adjective: Busier'
    },
    {
      id: 'tr-cm-009', type: 'comparison-transform', grammarId: 'comparison', unitId: 11,
      instruction: '📊 Chọn dạng so sánh đúng',
      prompt: 'Bẫy tính từ bất quy tắc: "bad"\n"Last year\'s results were _____ than this year\'s."',
      question: 'Last year\'s results were _____ than this year\'s.',
      options: ['more bad', 'badder', 'worse', 'worst'],
      answer: 2,
      explanation: '"Bad" có dạng bất quy tắc: bad → worse → worst. Không dùng "more bad" hay "badder".',
      hint: 'Bad → so sánh hơn bất quy tắc là gì?',
      tag: 'Irregular: Bad → Worse'
    },
    {
      id: 'tr-cm-010', type: 'comparison-transform', grammarId: 'comparison', unitId: 11,
      instruction: '📊 Chọn dạng so sánh nhất đúng',
      prompt: 'Ngữ cảnh: "Among all candidates, this one is most qualified."\nThêm mạo từ phù hợp.',
      question: 'This candidate is _____ qualified person we have ever interviewed.',
      options: ['most', 'the more', 'the most', 'by far more'],
      answer: 2,
      explanation: 'So sánh nhất cần "the" đứng trước. "The most qualified" = được đào tạo tốt nhất. "By far the most" nếu muốn nhấn mạnh thêm.',
      hint: 'So sánh nhất luôn có "the" đứng trước',
      tag: 'The Most (Superlative)'
    },
  ];

  // ─── State ────────────────────────────────────────────────────
  let _currentSet   = [];
  let _index        = 0;
  let _score        = 0;
  let _answered     = 0;
  let _startTime    = 0;
  let _selectedType = null;  // null = mix all
  let _overlay      = null;

  // ─── Lọc bài theo grammar type ────────────────────────────────
  function _getPool(grammarId) {
    if (!grammarId) return TRANSFORM_DATA;
    return TRANSFORM_DATA.filter(q => q.grammarId === grammarId);
  }

  function _shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // ─── Mở Transformation Drill ──────────────────────────────────
  function open(grammarId) {
    const pool = _getPool(grammarId);
    if (pool.length === 0) {
      if (typeof App !== 'undefined') {
        App.showToast && App.showToast('Chưa có bài tập transformation cho chủ đề này.', 'ℹ️');
      }
      return;
    }
    _currentSet = _shuffle(pool).slice(0, Math.min(6, pool.length));
    _index      = 0;
    _score      = 0;
    _answered   = 0;
    _startTime  = Date.now();
    _selectedType = grammarId || null;

    _buildOverlay();
    _renderQuestion();
  }

  // ─── Xây dựng overlay UI ─────────────────────────────────────
  function _buildOverlay() {
    if (_overlay) _overlay.remove();

    _overlay = document.createElement('div');
    _overlay.id = 'transform-overlay';
    _overlay.innerHTML = `
      <div class="td-backdrop" id="td-backdrop"></div>
      <div class="td-modal" id="td-modal">
        <div class="td-header">
          <div class="td-header-left">
            <span class="td-badge">🔀 Luyện tập chuyển đổi</span>
            <span class="td-progress-text" id="td-prog-text">Câu 1 / ${_currentSet.length}</span>
          </div>
          <button class="td-close" id="td-close" aria-label="Đóng">✕</button>
        </div>
        <div class="td-progress-bar"><div class="td-progress-fill" id="td-prog-fill"></div></div>
        <div class="td-body" id="td-body"></div>
        <div class="td-footer" id="td-footer"></div>
      </div>`;
    document.body.appendChild(_overlay);

    document.getElementById('td-backdrop').addEventListener('click', close);
    document.getElementById('td-close').addEventListener('click', close);

    // Animate in
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        _overlay.classList.add('td-visible');
      });
    });
  }

  // ─── Render câu hỏi ──────────────────────────────────────────
  function _renderQuestion() {
    const q = _currentSet[_index];
    const pct = (_index / _currentSet.length) * 100;

    document.getElementById('td-prog-text').textContent = `Câu ${_index + 1} / ${_currentSet.length}`;
    document.getElementById('td-prog-fill').style.width = pct + '%';

    const body = document.getElementById('td-body');
    const opts = q.options.map((opt, i) => `
      <button class="td-option" data-idx="${i}">
        <span class="td-opt-letter">${['A','B','C','D'][i]}</span>
        <span class="td-opt-text">${opt}</span>
      </button>`).join('');

    body.innerHTML = `
      <div class="td-tag">${q.tag}</div>
      <div class="td-instruction">${q.instruction}</div>
      <div class="td-prompt-box">
        <div class="td-prompt-label">Câu gốc / Ngữ cảnh</div>
        <div class="td-prompt">${q.prompt.replace(/\n/g, '<br>')}</div>
      </div>
      <div class="td-question">${q.question.replace(/\n/g, '<br>').replace(/___+/, '<span class="td-blank">___</span>')}</div>
      <div class="td-hint-wrap">
        <button class="td-hint-btn" id="td-hint-btn">💡 Gợi ý</button>
        <div class="td-hint" id="td-hint" style="display:none">${q.hint}</div>
      </div>
      <div class="td-options" id="td-options">${opts}</div>
      <div class="td-explanation" id="td-explanation" style="display:none"></div>`;

    document.getElementById('td-hint-btn').addEventListener('click', () => {
      const hint = document.getElementById('td-hint');
      hint.style.display = hint.style.display === 'none' ? 'block' : 'none';
    });

    document.querySelectorAll('.td-option').forEach(btn => {
      btn.addEventListener('click', () => _selectAnswer(parseInt(btn.dataset.idx)));
    });

    document.getElementById('td-footer').innerHTML = '';
  }

  // ─── Xử lý trả lời ───────────────────────────────────────────
  function _selectAnswer(idx) {
    const q       = _currentSet[_index];
    const correct = q.answer;
    const isRight = idx === correct;
    if (isRight) _score++;
    _answered++;

    // Lock buttons & highlight
    document.querySelectorAll('.td-option').forEach((btn, i) => {
      btn.disabled = true;
      if (i === correct) btn.classList.add('td-correct');
      else if (i === idx && !isRight) btn.classList.add('td-wrong');
    });

    // Show explanation
    const expEl = document.getElementById('td-explanation');
    expEl.style.display = 'block';
    expEl.innerHTML = `
      <div class="td-exp-icon">${isRight ? '✅' : '❌'}</div>
      <div class="td-exp-text">${q.explanation}</div>`;

    // Footer button
    const footer = document.getElementById('td-footer');
    const isLast = _index === _currentSet.length - 1;
    footer.innerHTML = `
      <button class="td-btn-next" id="td-btn-next">
        ${isLast ? '🏁 Xem kết quả' : 'Câu tiếp theo →'}
      </button>`;
    document.getElementById('td-btn-next').addEventListener('click', () => {
      if (isLast) _showResult();
      else { _index++; _renderQuestion(); }
    });
  }

  // ─── Màn hình kết quả ─────────────────────────────────────────
  function _showResult() {
    const total   = _currentSet.length;
    const pct     = Math.round(_score / total * 100);
    const timeSec = Math.round((Date.now() - _startTime) / 1000);
    const grade   = pct >= 83 ? { icon: '🏆', label: 'Xuất sắc!',   color: 'var(--success)' }
                  : pct >= 67 ? { icon: '👍', label: 'Tốt!',        color: 'var(--accent)'  }
                  : pct >= 50 ? { icon: '📖', label: 'Ổn!',         color: 'var(--warning)' }
                  :             { icon: '💪', label: 'Luyện thêm!', color: 'var(--danger)'  };

    document.getElementById('td-prog-fill').style.width = '100%';
    document.getElementById('td-prog-text').textContent = 'Hoàn thành!';

    const body = document.getElementById('td-body');
    body.innerHTML = `
      <div class="td-result-wrap">
        <div class="td-result-icon">${grade.icon}</div>
        <div class="td-result-grade" style="color:${grade.color}">${grade.label}</div>
        <div class="td-result-score">${_score} / ${total}</div>
        <div class="td-result-sub">Đúng ${pct}% · ${timeSec} giây</div>
        <div class="td-result-breakdown" id="td-breakdown"></div>
      </div>`;

    // Mini breakdown by type
    const breakdown = {};
    _currentSet.forEach((q, i) => {
      if (!breakdown[q.tag]) breakdown[q.tag] = { total: 0 };
      breakdown[q.tag].total++;
    });

    const breakdownEl = document.getElementById('td-breakdown');
    breakdownEl.innerHTML = '<div class="td-bd-title">Phân loại bài làm</div>' +
      _currentSet.map((q, i) => `
        <div class="td-bd-row">
          <span class="td-bd-tag">${q.tag}</span>
        </div>`).slice(0, 3).join('');

    const footer = document.getElementById('td-footer');
    footer.innerHTML = `
      <button class="td-btn-retry" id="td-btn-retry">🔄 Làm lại</button>
      <button class="td-btn-close" id="td-btn-done">✅ Xong</button>`;
    document.getElementById('td-btn-retry').addEventListener('click', () => open(_selectedType));
    document.getElementById('td-btn-done').addEventListener('click', close);

    // Track với Tracker nếu có
    if (typeof Tracker !== 'undefined' && Tracker.trackQuiz) {
      Tracker.trackQuiz({
        mode: 'luyen-tap-chuyen-doi',
        correct: _score,
        total,
        timeSpentSec: timeSec,
        unitId: '',
      });
    }
  }

  // ─── Đóng overlay ────────────────────────────────────────────
  function close() {
    if (_overlay) {
      _overlay.classList.remove('td-visible');
      setTimeout(() => { if (_overlay) { _overlay.remove(); _overlay = null; } }, 300);
    }
  }

  // ─── Lấy danh sách grammar types có bài ─────────────────────
  function getAvailableTypes() {
    const types = {};
    TRANSFORM_DATA.forEach(q => {
      if (!types[q.grammarId]) types[q.grammarId] = 0;
      types[q.grammarId]++;
    });
    return types;
  }

  return { open, close, getAvailableTypes };
})();

// Expose globally
window.TransformDrill = TransformDrill;
