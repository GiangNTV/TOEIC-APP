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

    // ══════════════════════════════════════════════
    //  PASSIVE – bổ sung 5 bài đa dạng (#006–010)
    // ══════════════════════════════════════════════
    {
      id: 'tr-p-006', type: 'active-passive', grammarId: 'passive', unitId: 2,
      instruction: '🔄 Chuyển sang câu bị động',
      prompt: 'The board approved the new budget last week.',
      question: 'The new budget _____ by the board last week.',
      options: ['approved', 'was approved', 'has been approved', 'is approved'],
      answer: 1,
      explanation: 'Bị động quá khứ đơn: was/were + V3. "Approved" (quá khứ đơn chủ động) → "was approved".',
      hint: 'Quá khứ đơn bị động: was/were + V3',
      tag: 'Past Simple Passive'
    },
    {
      id: 'tr-p-007', type: 'active-passive', grammarId: 'passive', unitId: 2,
      instruction: '🔄 Chuyển sang câu bị động',
      prompt: 'The team is currently updating the software.',
      question: 'The software _____ by the team at this moment.',
      options: ['is updating', 'is being updated', 'has been updated', 'was updated'],
      answer: 1,
      explanation: 'Bị động hiện tại tiếp diễn: is/are + being + V3. "Is updating" → "is being updated".',
      hint: 'Hiện tại tiếp diễn bị động: is/are + being + V3',
      tag: 'Present Continuous Passive'
    },
    {
      id: 'tr-p-008', type: 'active-passive', grammarId: 'passive', unitId: 2,
      instruction: '🔄 Chọn bị động tương lai hoàn thành',
      prompt: 'Ngữ cảnh: "By Friday, the logistics team will have shipped all orders."',
      question: 'By Friday, all orders _____ by the logistics team.',
      options: ['will ship', 'will be shipped', 'will have shipped', 'will have been shipped'],
      answer: 3,
      explanation: 'Bị động tương lai hoàn thành: will + have been + V3. "Will have shipped" → "will have been shipped".',
      hint: 'Future Perfect Passive: will + have been + V3',
      tag: 'Future Perfect Passive'
    },
    {
      id: 'tr-p-009', type: 'active-passive', grammarId: 'passive', unitId: 2,
      instruction: '🔄 Nhận dạng tính từ phân từ bị động',
      prompt: 'Phân biệt V-ing (gây ra) vs V3 (cảm nhận/trạng thái).\nNgữ cảnh: The client received unexpected news.',
      question: 'The client seemed _____ by the unexpected price increase.',
      options: ['surprising', 'surprised', 'surprise', 'to surprise'],
      answer: 1,
      explanation: '"Surprised" = client nhận cảm xúc ngạc nhiên (bị tác động). "Surprising" = vật gây ra sự ngạc nhiên. Sau linking verb (seemed), dùng tính từ chỉ trạng thái của chủ ngữ.',
      hint: 'Client nhận cảm xúc hay gây ra cảm xúc?',
      tag: 'Participial Adj: Surprised vs Surprising'
    },
    {
      id: 'tr-p-010', type: 'active-passive', grammarId: 'passive', unitId: 2,
      instruction: '🔄 Chọn bị động phủ định đúng',
      prompt: 'Câu gốc: "Nobody has resolved the complaint yet."',
      question: 'The complaint _____ yet.',
      options: ['has not resolved', 'has not been resolved', 'was not resolved', 'is not resolving'],
      answer: 1,
      explanation: 'Bị động hiện tại hoàn thành phủ định: has/have + not + been + V3. "Has not resolved" (chủ động) → "has not been resolved".',
      hint: 'Hiện tại hoàn thành bị động phủ định: has not been + V3',
      tag: 'Present Perfect Passive (Negative)'
    },

    // ══════════════════════════════════════════════
    //  VERB TENSE – bổ sung 5 bài đa dạng (#006–010)
    // ══════════════════════════════════════════════
    {
      id: 'tr-t-006', type: 'tense-shift', grammarId: 'verb-tense', unitId: 1,
      instruction: '⏱️ Chọn thì đúng cho ngữ cảnh',
      prompt: 'Từ khóa: "for three years / still working"\nNgữ cảnh: The team started the project 3 years ago and still works on it.',
      question: 'The team _____ on this project for three years.',
      options: ['works', 'has been working', 'worked', 'will work'],
      answer: 1,
      explanation: '"For + khoảng thời gian" + hành động bắt đầu trong quá khứ và còn tiếp diễn → Hiện tại hoàn thành tiếp diễn (have/has been + V-ing). Nhấn mạnh tính liên tục.',
      hint: 'Hành động liên tục từ quá khứ đến nay + "for" → thì nào?',
      tag: 'Present Perfect Continuous'
    },
    {
      id: 'tr-t-007', type: 'tense-shift', grammarId: 'verb-tense', unitId: 1,
      instruction: '⏱️ Chọn thì đúng cho ngữ cảnh',
      prompt: 'Từ khóa: mệnh đề thời gian + tương lai\nNgữ cảnh: "Once the approval comes through, the project starts."',
      question: 'Once the approval _____, we will begin construction.',
      options: ['will come', 'comes', 'is coming', 'came'],
      answer: 1,
      explanation: 'Mệnh đề thời gian (once, when, before, after, as soon as) KHÔNG dùng tương lai → dùng hiện tại đơn. "Once + present simple, will + V" là cấu trúc chuẩn.',
      hint: 'Mệnh đề "once/when/after" → không dùng will, dùng thì gì?',
      tag: 'Time Clause: No Future Tense'
    },
    {
      id: 'tr-t-008', type: 'tense-shift', grammarId: 'verb-tense', unitId: 1,
      instruction: '⏱️ Xác định thì đúng qua từ khóa',
      prompt: 'Từ khóa: "every quarter / routinely"\nNgữ cảnh: Đây là thói quen định kỳ của công ty.',
      question: 'The finance department _____ the budget every quarter.',
      options: ['is reviewing', 'reviews', 'has reviewed', 'will review'],
      answer: 1,
      explanation: '"Every quarter" = thói quen định kỳ → Hiện tại đơn (reviews). "Currently/right now" → Present Continuous. "Since/for" → Present Perfect.',
      hint: '"Every + thời gian" → thói quen → thì nào?',
      tag: 'Present Simple: Routine'
    },
    {
      id: 'tr-t-009', type: 'tense-shift', grammarId: 'verb-tense', unitId: 1,
      instruction: '⏱️ Chọn thì đúng',
      prompt: 'Từ khóa: "at 3 p.m. yesterday"\nNgữ cảnh: Hành động đang diễn ra tại thời điểm cụ thể trong quá khứ.',
      question: 'At 3 p.m. yesterday, the CEO _____ a presentation to investors.',
      options: ['gave', 'was giving', 'has given', 'had given'],
      answer: 1,
      explanation: '"At [time] yesterday" = thời điểm xác định trong quá khứ + hành động đang diễn ra → Quá khứ tiếp diễn (was/were + V-ing).',
      hint: '"At [thời điểm] yesterday" + hành động đang diễn ra → thì gì?',
      tag: 'Past Continuous: Specific Time'
    },
    {
      id: 'tr-t-010', type: 'tense-shift', grammarId: 'verb-tense', unitId: 1,
      instruction: '⏱️ Phân biệt thì khi có 2 hành động quá khứ',
      prompt: 'Ngữ cảnh: Hai hành động quá khứ — xác định cái nào xảy ra trước.\n"Prepare report → submit to manager"',
      question: 'She submitted the report to her manager after she _____ it.',
      options: ['prepares', 'prepared', 'had prepared', 'has prepared'],
      answer: 2,
      explanation: 'Khi có 2 hành động quá khứ, hành động xảy ra TRƯỚC dùng Quá khứ hoàn thành (had + V3). Chuẩn bị trước → nộp sau: "after she had prepared".',
      hint: 'Hành động nào xảy ra trước trong 2 hành động quá khứ?',
      tag: 'Past Perfect: Sequence'
    },

    // ══════════════════════════════════════════════
    //  CONDITIONALS – bổ sung 6 bài đa dạng (#005–010)
    // ══════════════════════════════════════════════
    {
      id: 'tr-c-005', type: 'conditional-transform', grammarId: 'conditionals', unitId: 3,
      instruction: '🔀 Chuyển sang điều kiện loại 3',
      prompt: 'Thực tế: "We didn\'t receive the funding. The project failed."\n→ Nếu nhận được tài trợ, kết quả đã khác.',
      question: 'If we _____ the funding, the project would have succeeded.',
      options: ['received', 'had received', 'would receive', 'were to receive'],
      answer: 1,
      explanation: 'Điều kiện loại 3 (quá khứ không có thật): If + Past Perfect, would have + V3. "Didn\'t receive" → "had received" (giả định trái thực tế quá khứ).',
      hint: 'Điều kiện loại 3: If + Past Perfect, would have + V3',
      tag: 'Conditional Type 3'
    },
    {
      id: 'tr-c-006', type: 'conditional-transform', grammarId: 'conditionals', unitId: 3,
      instruction: '🔀 Chọn dạng conditional phù hợp',
      prompt: 'Ngữ cảnh: Quy luật tự nhiên/khoa học (luôn đúng).\n"Water + 100°C → boils always"',
      question: 'If water _____ to 100°C, it boils.',
      options: ['heated', 'is heated', 'will be heated', 'were heated'],
      answer: 1,
      explanation: 'Điều kiện loại 0 (sự thật hiển nhiên, quy luật): If + Present Simple, Present Simple. Kết quả luôn xảy ra mỗi khi điều kiện được đáp ứng.',
      hint: 'Sự thật hiển nhiên, quy luật → If + hiện tại, hiện tại',
      tag: 'Conditional Type 0 (Scientific)'
    },
    {
      id: 'tr-c-007', type: 'conditional-transform', grammarId: 'conditionals', unitId: 3,
      instruction: '🔀 Chọn liên từ điều kiện phù hợp',
      prompt: 'Ngữ cảnh: "The discount applies to all orders. The only requirement is order > $500."',
      question: 'Customers will receive the discount _____ their order exceeds $500.',
      options: ['unless', 'provided that', 'even if', 'although'],
      answer: 1,
      explanation: '"Provided that / as long as" = miễn là, với điều kiện là. Tương tự: "on condition that". Khác với "unless" (trừ khi = if not).',
      hint: '"Miễn là / với điều kiện là" → từ nào?',
      tag: 'Provided That (Condition)'
    },
    {
      id: 'tr-c-008', type: 'conditional-transform', grammarId: 'conditionals', unitId: 3,
      instruction: '🔀 Chọn dạng unless đúng',
      prompt: 'Câu gốc: "If you don\'t register by Friday, you won\'t get the early bird rate."\n→ Chuyển sang "unless".',
      question: '_____ you register by Friday, you will not get the early bird rate.',
      options: ['If', 'Unless', 'Once', 'Should'],
      answer: 1,
      explanation: '"Unless" = if not. "Unless you register" = "If you don\'t register". Không dùng phủ định sau "unless" (KHÔNG nói "unless you don\'t register").',
      hint: '"Unless" = "if not" → chuyển "if + phủ định" thành "unless + khẳng định"',
      tag: 'Unless = If Not'
    },
    {
      id: 'tr-c-009', type: 'conditional-transform', grammarId: 'conditionals', unitId: 3,
      instruction: '🔀 Chọn dạng in case đúng',
      prompt: 'Ngữ cảnh: "We will prepare an extra budget. There might be unexpected expenses."\n→ Dùng "in case".',
      question: 'We will prepare an extra budget _____ there are unexpected expenses.',
      options: ['if', 'unless', 'in case', 'so that'],
      answer: 2,
      explanation: '"In case" = phòng khi, đề phòng trường hợp (chuẩn bị trước cho khả năng xảy ra). Khác với "if" (điều kiện). "In case" nhấn mạnh phòng ngừa.',
      hint: '"Phòng khi / đề phòng trường hợp" → từ nào?',
      tag: 'In Case (Precaution)'
    },
    {
      id: 'tr-c-010', type: 'conditional-transform', grammarId: 'conditionals', unitId: 3,
      instruction: '🔀 Chọn mixed conditional đúng',
      prompt: 'Ngữ cảnh: "She didn\'t take the manager role. She is still a junior analyst now."',
      question: 'If she had taken the manager role, she _____ a senior executive by now.',
      options: ['would be', 'would have been', 'will be', 'had been'],
      answer: 0,
      explanation: 'Mixed conditional: If + Past Perfect (quá khứ) → would + V (kết quả hiện tại). "Would be" = trạng thái hiện tại. Khác với "would have been" (kết quả quá khứ).',
      hint: 'Điều kiện quá khứ → kết quả ở HIỆN TẠI: would + V nguyên thể',
      tag: 'Mixed Conditional'
    },

    // ══════════════════════════════════════════════
    //  GERUND/INFINITIVE – bổ sung 6 bài đa dạng (#005–010)
    // ══════════════════════════════════════════════
    {
      id: 'tr-g-005', type: 'gerund-infinitive', grammarId: 'gerund-infinitive', unitId: 10,
      instruction: '🔁 Chọn gerund hay infinitive?',
      prompt: 'Cấu trúc: STOP\n"He stopped _____ when the boss walked in." (dừng lại để chào)',
      question: 'He stopped _____ when the boss walked in.',
      options: ['working / greeting', 'to greet', 'greeting', 'to work'],
      answer: 1,
      explanation: '"Stop to V" = dừng lại ĐỂ làm gì (hành động mới, mục đích). "Stop V-ing" = ngừng đang làm việc gì. Dừng làm việc để chào → "stopped to greet".',
      hint: '"Stop to V" = dừng lại ĐỂ làm gì; "Stop V-ing" = ngừng việc đang làm',
      tag: 'Stop to V vs Stop V-ing'
    },
    {
      id: 'tr-g-006', type: 'gerund-infinitive', grammarId: 'gerund-infinitive', unitId: 10,
      instruction: '🔁 Nhận dạng cấu trúc đúng',
      prompt: 'Cấu trúc: REQUIRE\n"The policy requires all visitors _____ a security badge."',
      question: 'The policy requires all visitors _____ a security badge.',
      options: ['wear', 'wearing', 'to wear', 'worn'],
      answer: 2,
      explanation: '"Require + object + to V" (infinitive). Tương tự: ask, tell, expect, need, allow, enable, encourage, request, remind, advise.',
      hint: 'Require + ai đó + to V (infinitive)',
      tag: 'Require + Object + To V'
    },
    {
      id: 'tr-g-007', type: 'gerund-infinitive', grammarId: 'gerund-infinitive', unitId: 10,
      instruction: '🔁 Chọn gerund hay infinitive?',
      prompt: 'Cấu trúc: ENJOY\n"The team enjoys _____ new challenges."',
      question: 'The team enjoys _____ new strategies each quarter.',
      options: ['to develop', 'develop', 'developing', 'developed'],
      answer: 2,
      explanation: '"Enjoy + V-ing" (gerund). Nhóm EASE: Enjoy, Avoid, Suggest, Escape – đều dùng gerund.',
      hint: 'Enjoy + V-ing (gerund)',
      tag: 'Enjoy + V-ing'
    },
    {
      id: 'tr-g-008', type: 'gerund-infinitive', grammarId: 'gerund-infinitive', unitId: 10,
      instruction: '🔁 Nhận dạng cấu trúc đúng',
      prompt: 'Cụm giới từ: "prior to"\n"Prior to _____ the contract, both parties reviewed the terms."',
      question: 'Prior to _____ the contract, both parties reviewed the terms.',
      options: ['sign', 'signing', 'signed', 'to sign'],
      answer: 1,
      explanation: '"Prior to" là cụm giới từ → luôn đi với V-ing. Tương tự: "in addition to", "instead of", "on top of", "due to". Giới từ + V-ing là quy tắc bất biến.',
      hint: 'Cụm giới từ (prior to / in addition to...) + V-ing',
      tag: 'Prepositional Phrase + V-ing'
    },
    {
      id: 'tr-g-009', type: 'gerund-infinitive', grammarId: 'gerund-infinitive', unitId: 10,
      instruction: '🔁 Chọn gerund hay infinitive?',
      prompt: 'Cấu trúc: MANAGE\n"Despite the difficulties, she managed _____ the deadline."',
      question: 'Despite the delays, the team managed _____ the project on time.',
      options: ['completing', 'to complete', 'complete', 'completed'],
      answer: 1,
      explanation: '"Manage + to V" (infinitive). "Manage to do" = xoay sở được, làm được (despite difficulties). Không dùng gerund sau manage.',
      hint: 'Manage + to V (infinitive) = xoay sở được',
      tag: 'Manage + To V'
    },
    {
      id: 'tr-g-010', type: 'gerund-infinitive', grammarId: 'gerund-infinitive', unitId: 10,
      instruction: '🔁 Phân biệt try to vs try V-ing',
      prompt: 'Ngữ cảnh: "Chúng tôi muốn thử giải pháp mới để xem có hiệu quả không."',
      question: 'The team decided to _____ a new approach to solve the bottleneck.',
      options: ['try using', 'try to using', 'tried using', 'try use'],
      answer: 0,
      explanation: '"Try V-ing" = thử làm gì (thử nghiệm, xem kết quả). "Try to V" = cố gắng làm gì (nỗ lực). Ngữ cảnh "thử giải pháp mới xem sao" → "try using".',
      hint: '"Try V-ing" = thử nghiệm; "Try to V" = cố gắng',
      tag: 'Try V-ing vs Try To V'
    },

    // ══════════════════════════════════════════════
    //  RELATIVE CLAUSE – bổ sung câu (đã có 10, bổ sung thêm 5: #011–015)
    // ══════════════════════════════════════════════
    {
      id: 'tr-r-011', type: 'combine-relative', grammarId: 'relative-clause', unitId: 8,
      instruction: '🔗 Rút gọn mệnh đề quan hệ',
      prompt: 'Câu gốc: "The position that is being advertised requires five years of experience."',
      question: 'The position _____ requires five years of experience.',
      options: ['that is advertising', 'advertised', 'being advertised', 'that advertises'],
      answer: 2,
      explanation: 'Rút gọn mệnh đề quan hệ bị động đang tiếp diễn: "that is being V-ed" → "being V-ed". Giữ "being" để chỉ trạng thái đang xảy ra.',
      hint: '"That is being V-ed" rút gọn thành "being V-ed"',
      tag: 'Reduced Relative: Being + V3'
    },
    {
      id: 'tr-r-012', type: 'combine-relative', grammarId: 'relative-clause', unitId: 8,
      instruction: '🔗 Nối 2 câu dùng mệnh đề quan hệ phi hạn định',
      prompt: 'Câu 1: "Mr. Chen is our CFO."\nCâu 2: "He joined the company in 2018."',
      question: 'Mr. Chen, _____ joined the company in 2018, is our CFO.',
      options: ['that', 'which', 'who', 'whose'],
      answer: 2,
      explanation: 'Mệnh đề phi hạn định (có dấu phẩy, bổ sung thêm về Mr. Chen) + chỉ người → "who". Không dùng "that" trong mệnh đề có dấu phẩy.',
      hint: 'Mệnh đề có dấu phẩy + người → who (không dùng that)',
      tag: 'Non-defining: Who'
    },
    {
      id: 'tr-r-013', type: 'combine-relative', grammarId: 'relative-clause', unitId: 8,
      instruction: '🔗 Chọn đại từ quan hệ đúng',
      prompt: 'Câu gốc: "The year was 2020. The pandemic changed everything that year."',
      question: '2020 was the year _____ the pandemic changed everything.',
      options: ['when', 'which', 'that', 'where'],
      answer: 0,
      explanation: '"When" thay thế cho "at/in which time". Dùng sau danh từ chỉ thời gian (year, time, day, moment). "The year when..." = "The year in which...".',
      hint: 'Sau danh từ chỉ thời gian (year, day, month) → when',
      tag: 'When: Time Relative Clause'
    },
    {
      id: 'tr-r-014', type: 'combine-relative', grammarId: 'relative-clause', unitId: 8,
      instruction: '🔗 Nối câu bằng đại từ quan hệ',
      prompt: 'Câu 1: "The sales figures were impressive."\nCâu 2: "We reviewed the sales figures at the meeting."',
      question: 'The sales figures _____ we reviewed at the meeting were impressive.',
      options: ['who', 'whose', 'where', 'that'],
      answer: 3,
      explanation: '"That" hoặc "which" chỉ vật (sales figures) làm tân ngữ. Có thể bỏ qua đại từ quan hệ khi nó là tân ngữ: "The sales figures [that/which/∅] we reviewed".',
      hint: 'Chỉ vật, làm tân ngữ → that/which (hoặc có thể bỏ)',
      tag: 'That: Object Relative Clause'
    },
    {
      id: 'tr-r-015', type: 'combine-relative', grammarId: 'relative-clause', unitId: 8,
      instruction: '🔗 Chọn cấu trúc mệnh đề quan hệ đúng',
      prompt: 'Câu gốc: "The policy was updated. The policy applies to all remote workers."',
      question: 'The policy, _____ to all remote workers, was updated.',
      options: ['who applies', 'that applies', 'which applies', 'applying'],
      answer: 3,
      explanation: 'Rút gọn mệnh đề quan hệ chủ động: "which applies" → "applying" (V-ing). Câu có dấu phẩy = mệnh đề phi hạn định → rút gọn thành cụm phân từ "applying".',
      hint: 'Rút gọn "which + V" (mệnh đề phi hạn định) → V-ing',
      tag: 'Reduced Relative: V-ing (Active)'
    },

    // ══════════════════════════════════════════════
    //  COMPARISON – bổ sung (đã có 10, thêm 5: #011–015)
    // ══════════════════════════════════════════════
    {
      id: 'tr-cm-011', type: 'comparison-transform', grammarId: 'comparison', unitId: 11,
      instruction: '📊 Chọn dạng so sánh đúng',
      prompt: 'Từ khóa: "significantly, much, far" + so sánh hơn\nNgữ cảnh: Doanh số tăng đáng kể so với năm ngoái.',
      question: 'This year\'s sales are _____ higher than last year\'s.',
      options: ['very', 'much', 'more', 'very much'],
      answer: 1,
      explanation: 'Để nhấn mạnh mức độ so sánh hơn, dùng: much, far, significantly, considerably, a lot + so sánh hơn. KHÔNG dùng "very" trước so sánh hơn ("very higher" sai).',
      hint: 'Nhấn mạnh so sánh hơn: much/far + adj-er, KHÔNG dùng very',
      tag: 'Intensifying Comparatives'
    },
    {
      id: 'tr-cm-012', type: 'comparison-transform', grammarId: 'comparison', unitId: 11,
      instruction: '📊 Chọn dạng so sánh đúng',
      prompt: 'Tính từ đặc biệt: "far"\nNgữ cảnh: Khoảng cách văn phòng mới xa hơn văn phòng cũ.',
      question: 'The new office is _____ from downtown than the old one.',
      options: ['more far', 'farther', 'farthest', 'far more'],
      answer: 1,
      explanation: '"Far" có 2 dạng so sánh hơn: farther (khoảng cách vật lý) và further (mức độ, bổ sung thêm). Khoảng cách địa lý → "farther".',
      hint: 'Far bất quy tắc: farther (khoảng cách) / further (mức độ)',
      tag: 'Irregular: Far → Farther/Further'
    },
    {
      id: 'tr-cm-013', type: 'comparison-transform', grammarId: 'comparison', unitId: 11,
      instruction: '📊 Chọn dạng so sánh đúng',
      prompt: 'Cấu trúc: "no + so sánh hơn + than"\nNgữ cảnh: "Dự án không hề dễ hơn dự án trước."',
      question: 'This project is _____ easier than the previous one.',
      options: ['no', 'not', 'no more', 'not more'],
      answer: 0,
      explanation: '"No + so sánh hơn" = phủ định so sánh ("no easier" = không dễ hơn). "Not" + adj + "er" không chuẩn bằng. "No easier than" = "equally difficult".',
      hint: '"No + so sánh hơn + than" = không hề...hơn',
      tag: 'No + Comparative'
    },
    {
      id: 'tr-cm-014', type: 'comparison-transform', grammarId: 'comparison', unitId: 11,
      instruction: '📊 Chọn dạng so sánh đúng',
      prompt: 'Adverb comparison: "efficiently"\nNgữ cảnh: Nhóm mới làm việc hiệu quả hơn nhóm cũ.',
      question: 'The new team works _____ than the previous one.',
      options: ['more efficiently', 'efficientlier', 'most efficiently', 'efficiently more'],
      answer: 0,
      explanation: 'So sánh hơn của phó từ dài (>2 âm tiết): more + adverb. "More efficiently" (không nói "efficientlier"). Tương tự: more carefully, more accurately.',
      hint: 'So sánh hơn của phó từ dài: more + adverb',
      tag: 'Adverb Comparative'
    },
    {
      id: 'tr-cm-015', type: 'comparison-transform', grammarId: 'comparison', unitId: 11,
      instruction: '📊 Chọn dạng so sánh đúng',
      prompt: 'So sánh bằng phủ định: "not as...as"\nNgữ cảnh: Chi phí mới không rẻ bằng chi phí cũ.',
      question: 'The new service is _____ as the previous package.',
      options: ['not as affordable', 'not affordable as', 'less affordable as', 'not more affordable'],
      answer: 0,
      explanation: '"Not as + adj + as" = không...bằng (phủ định so sánh bằng). Có thể diễn đạt bằng "less + adj + than". "Not as affordable as" = "less affordable than".',
      hint: '"Không...bằng" → not as + adj + as',
      tag: 'Not As...As (Negative Equality)'
    },

    // ══════════════════════════════════════════════
    //  PARTICIPLES – bổ sung (đã có 10, thêm 5: #011–015)
    // ══════════════════════════════════════════════
    {
      id: 'tr-pt-011', type: 'participle-reduce', grammarId: 'participles', unitId: 12,
      instruction: '✂️ Rút gọn mệnh đề bằng phân từ',
      prompt: 'Câu gốc: "Because it was written by an expert, the report was highly credible."',
      question: '_____ by an expert, the report was highly credible.',
      options: ['Writing', 'Written', 'Having written', 'Being written'],
      answer: 1,
      explanation: '"Written by an expert" = phân từ bị động, rút gọn của "Because it was written by an expert". Subject của mệnh đề chính (report) nhận hành động được viết.',
      hint: 'Báo cáo "được viết" bởi ai đó → bị động phân từ: V3',
      tag: 'Causal Passive Participle'
    },
    {
      id: 'tr-pt-012', type: 'participle-reduce', grammarId: 'participles', unitId: 12,
      instruction: '✂️ Rút gọn mệnh đề bằng phân từ',
      prompt: 'Câu gốc: "While she was waiting for the flight, she reviewed the presentation."',
      question: '_____ for the flight, she reviewed the presentation.',
      options: ['Waited', 'Having waited', 'Waiting', 'To wait'],
      answer: 2,
      explanation: '"Waiting for the flight" = rút gọn "while she was waiting". Hai hành động đồng thời cùng chủ ngữ → rút gọn bằng V-ing (phân từ hiện tại chủ động).',
      hint: '"While + S + was V-ing" → rút gọn thành V-ing',
      tag: 'Simultaneous Action: V-ing'
    },
    {
      id: 'tr-pt-013', type: 'participle-reduce', grammarId: 'participles', unitId: 12,
      instruction: '✂️ Nhận dạng phân từ đúng',
      prompt: 'Câu gốc: "The proposal, which was carefully drafted by the legal team, was approved."',
      question: 'The proposal, carefully _____ by the legal team, was approved.',
      options: ['drafting', 'to draft', 'drafted', 'having drafted'],
      answer: 2,
      explanation: 'Rút gọn mệnh đề quan hệ bị động (phi hạn định): "which was drafted" → "drafted" (V3). Phó từ "carefully" giữ nguyên vị trí trước phân từ.',
      hint: '"Which was + V3" rút gọn thành V3 (phân từ bị động)',
      tag: 'Non-defining Passive Reduction'
    },
    {
      id: 'tr-pt-014', type: 'participle-reduce', grammarId: 'participles', unitId: 12,
      instruction: '✂️ Nhận dạng dangling participle (lỗi)',
      prompt: 'Phát hiện lỗi dangling participle.\n"Having reviewed the application, the position was offered to Ms. Kim."',
      question: 'Câu nào ĐÚNG khi sửa lỗi trên?',
      options: [
        'Having reviewed the application, the position was offered.',
        'Having reviewed the application, the committee offered Ms. Kim the position.',
        'Reviewing the application, the position was offered to Ms. Kim.',
        'The position, having reviewed the application, was offered to Ms. Kim.'
      ],
      answer: 1,
      explanation: 'Dangling participle: "Having reviewed" phải có cùng chủ ngữ với mệnh đề chính. "Position" không tự review → phải có chủ ngữ người review: "the committee offered...".',
      hint: 'Chủ ngữ của phân từ phải trùng chủ ngữ mệnh đề chính',
      tag: 'Dangling Participle (Error)'
    },
    {
      id: 'tr-pt-015', type: 'participle-reduce', grammarId: 'participles', unitId: 12,
      instruction: '✂️ Chọn phân từ phù hợp ngữ cảnh',
      prompt: 'Câu gốc: "The results were disappointing. The management team was very concerned."\n→ Dùng phân từ bổ nghĩa cho danh từ.',
      question: 'The _____ results prompted the management team to revise the strategy.',
      options: ['disappointed', 'disappointing', 'being disappointed', 'having disappointed'],
      answer: 1,
      explanation: '"Disappointing" = tính từ phân từ chủ động, bổ nghĩa cho danh từ "results" (kết quả gây ra sự thất vọng). "Disappointed" = người cảm thấy thất vọng.',
      hint: '"Results" gây ra sự thất vọng → "disappointing results"',
      tag: 'Participial Adj Before Noun'
    },

    // ══════════════════════════════════════════════
    //  CONJUNCTION – bổ sung (đã có 10, thêm 5: #011–015)
    // ══════════════════════════════════════════════
    {
      id: 'tr-conj-011', type: 'conjunction-transform', grammarId: 'conjunction', unitId: 6,
      instruction: '🔁 Chọn liên từ nhượng bộ đúng',
      prompt: 'Câu gốc: "In spite of the economic downturn, the company maintained profitability."\n→ Chuyển dùng "even though".',
      question: '_____ the economy was in a downturn, the company maintained profitability.',
      options: ['In spite of', 'Even though', 'Despite', 'Regardless of'],
      answer: 1,
      explanation: '"Even though + clause" = mặc dù (clause). "In spite of / despite + noun/V-ing". "Even though" mạnh hơn "although" về sắc thái nhấn mạnh.',
      hint: 'Even though + clause (S+V) = dạng mạnh của although',
      tag: 'Even Though vs Despite'
    },
    {
      id: 'tr-conj-012', type: 'conjunction-transform', grammarId: 'conjunction', unitId: 6,
      instruction: '🔁 Chọn liên từ bổ sung đúng',
      prompt: 'Câu gốc: "The company reduced its carbon footprint. In addition, it launched a recycling initiative."',
      question: 'The company reduced its carbon footprint; _____, it launched a recycling initiative.',
      options: ['however', 'furthermore', 'therefore', 'unless'],
      answer: 1,
      explanation: '"Furthermore / moreover / in addition" = hơn nữa, thêm vào đó. Dùng khi thêm thông tin cùng chiều vào câu trước. "However" = tương phản; "therefore" = kết quả.',
      hint: '"Hơn nữa / thêm vào đó" → furthermore/moreover',
      tag: 'Furthermore (Addition)'
    },
    {
      id: 'tr-conj-013', type: 'conjunction-transform', grammarId: 'conjunction', unitId: 6,
      instruction: '🔁 Chọn liên từ phù hợp',
      prompt: 'Ngữ cảnh: Muốn nói cả hai khả năng đều không được chấp nhận.\n"Option A is too expensive. Option B is too slow."',
      question: '_____ Option A _____ Option B is acceptable to the client.',
      options: ['Both / and', 'Either / or', 'Neither / nor', 'Not only / but also'],
      answer: 2,
      explanation: '"Neither A nor B" = không A cũng không B (cả hai đều phủ định). Động từ chia theo N gần nhất. Khác với "either...or" (A hoặc B, một trong hai).',
      hint: '"Không A cũng không B" → neither...nor',
      tag: 'Neither...Nor (Double Negative)'
    },
    {
      id: 'tr-conj-014', type: 'conjunction-transform', grammarId: 'conjunction', unitId: 6,
      instruction: '🔁 Chuyển đổi liên từ nguyên nhân nâng cao',
      prompt: 'Câu gốc: "Owing to the flight delay, the delegation missed the opening ceremony."\n→ Viết lại dùng "as a result of".',
      question: '_____ the flight delay, the delegation missed the opening ceremony.',
      options: ['Because', 'As a result of', 'Since', 'Therefore'],
      answer: 1,
      explanation: '"As a result of / owing to / due to / because of + noun/V-ing" = do...mà, vì... (nguyên nhân trước danh từ). "Because + clause". "Therefore" đứng đầu mệnh đề kết quả.',
      hint: '"As a result of / owing to" + noun = do...mà (nguyên nhân)',
      tag: 'As a Result of (Cause + Noun)'
    },
    {
      id: 'tr-conj-015', type: 'conjunction-transform', grammarId: 'conjunction', unitId: 6,
      instruction: '🔁 Chọn liên từ nhượng bộ nâng cao',
      prompt: 'Ngữ cảnh: "Mặc dù rủi ro cao, nhưng ban giám đốc vẫn quyết định đầu tư."\n→ Dùng "notwithstanding".',
      question: '_____ the high risk, the board decided to proceed with the investment.',
      options: ['Although', 'Notwithstanding', 'Because of', 'Therefore'],
      answer: 1,
      explanation: '"Notwithstanding + noun" = mặc dù, bất chấp (rất trang trọng, dùng trong văn bản pháp lý/kinh doanh). Tương đương: despite/in spite of. Có thể đứng sau hoặc trước noun.',
      hint: '"Notwithstanding" = despite (rất trang trọng, văn pháp lý)',
      tag: 'Notwithstanding (Formal Concession)'
    },

    // ══════════════════════════════════════════════
    //  SUBJUNCTIVE – bổ sung (đã có 10, thêm 5: #011–015)
    // ══════════════════════════════════════════════
    {
      id: 'tr-sub-011', type: 'subjunctive', grammarId: 'subjunctive', unitId: 22,
      instruction: '📋 Áp dụng cấu trúc Subjunctive',
      prompt: 'Động từ: MANDATE\n"The regulation mandates that every company _____ annual audits."',
      question: 'The regulation mandates that every company _____ annual audits.',
      options: ['conducts', 'conduct', 'conducted', 'will conduct'],
      answer: 1,
      explanation: '"Mandate + that + S + V nguyên thể" (subjunctive). Không chia -s dù chủ ngữ số ít. Nhóm: mandate, require, demand, insist, stipulate, recommend, propose.',
      hint: 'Mandate + that → V nguyên thể (không -s)',
      tag: 'Mandate + That (Subjunctive)'
    },
    {
      id: 'tr-sub-012', type: 'subjunctive', grammarId: 'subjunctive', unitId: 22,
      instruction: '📋 Nhận dạng subjunctive bị động',
      prompt: 'Câu gốc: "The manager recommended that the report be reviewed."\n→ Dạng bị động subjunctive.',
      question: 'It was suggested that the meeting _____ until next week.',
      options: ['is postponed', 'be postponed', 'was postponed', 'would be postponed'],
      answer: 1,
      explanation: 'Subjunctive bị động: be + V3 (không phải is/are/was). "Be postponed" = dạng subjunctive bị động chuẩn sau suggest/recommend/require.',
      hint: 'Subjunctive bị động: be + V3 (không is/are/was)',
      tag: 'Passive Subjunctive: Be + V3'
    },
    {
      id: 'tr-sub-013', type: 'subjunctive', grammarId: 'subjunctive', unitId: 22,
      instruction: '📋 Áp dụng cấu trúc Wish',
      prompt: 'Ngữ cảnh: Ước muốn về hiện tại không có thật.\n"We don\'t have enough time. I wish we did."',
      question: 'I wish the training program _____ longer.',
      options: ['is', 'was', 'were', 'will be'],
      answer: 2,
      explanation: '"Wish + past simple" = ước muốn hiện tại không có thật. Trong wish-subjunctive, dùng "were" cho mọi ngôi (không phải "was"), dù bất chính thức chấp nhận "was".',
      hint: 'Wish + past: dùng "were" (không "was") cho mọi ngôi',
      tag: 'Wish + Were (Hypothetical Present)'
    },
    {
      id: 'tr-sub-014', type: 'subjunctive', grammarId: 'subjunctive', unitId: 22,
      instruction: '📋 Áp dụng cấu trúc Wish về quá khứ',
      prompt: 'Ngữ cảnh: Tiếc nuối về quá khứ.\n"We didn\'t back up the data. We lost everything."',
      question: 'I wish we _____ the data before the system crashed.',
      options: ['backed up', 'had backed up', 'would back up', 'were backing up'],
      answer: 1,
      explanation: '"Wish + past perfect" = tiếc nuối về quá khứ (đã xảy ra nhưng muốn khác đi). "Wish + had + V3" diễn đạt điều đáng lẽ nên làm nhưng không làm.',
      hint: 'Tiếc về quá khứ: wish + had + V3',
      tag: 'Wish + Past Perfect (Regret)'
    },
    {
      id: 'tr-sub-015', type: 'subjunctive', grammarId: 'subjunctive', unitId: 22,
      instruction: '📋 Phân biệt subjunctive vs indicative',
      prompt: 'Câu A: "It is important that the CEO attends the meeting."\nCâu B: "It is important that the CEO attend the meeting."\n→ Câu nào đúng theo ngữ pháp chuẩn?',
      question: 'Câu nào dùng đúng subjunctive sau "it is important that"?',
      options: [
        'Câu A: "attends" (chia theo chủ ngữ số ít)',
        'Câu B: "attend" (V nguyên thể, không -s)',
        'Cả hai đều đúng',
        'Cả hai đều sai'
      ],
      answer: 1,
      explanation: 'Câu B đúng. Subjunctive sau "It is important/essential/necessary/vital that" → V nguyên thể KHÔNG chia -s dù chủ ngữ số ít. Đây là lỗi cực kỳ phổ biến trong TOEIC.',
      hint: 'Sau "it is important that" → V nguyên thể (không thêm -s)',
      tag: 'Subjunctive vs Indicative'
    },

    // ══════════════════════════════════════════════
    //  INVERSION – bổ sung (đã có 10, thêm 5: #011–015)
    // ══════════════════════════════════════════════
    {
      id: 'tr-inv-011', type: 'inversion-transform', grammarId: 'inversion', unitId: 19,
      instruction: '🔄 Chuyển sang dạng đảo ngữ trang trọng',
      prompt: 'Câu gốc: "The company has at no time violated environmental regulations."',
      question: 'At no time _____ environmental regulations.',
      options: ['the company has violated', 'has the company violated', 'the company violated', 'did the company violate'],
      answer: 1,
      explanation: '"At no time" đứng đầu câu → đảo ngữ: "At no time + has/have + S + V3". Tương tự: "at no point", "under no circumstances".',
      hint: '"At no time" → has + S + V3 (đảo ngữ)',
      tag: 'At No Time (Inversion)'
    },
    {
      id: 'tr-inv-012', type: 'inversion-transform', grammarId: 'inversion', unitId: 19,
      instruction: '🔄 Chuyển sang dạng đảo ngữ',
      prompt: 'Câu gốc: "The company not only reduced costs but also improved quality."\n→ Dạng đảo ngữ nhấn mạnh.',
      question: 'Not only _____ costs, but the company also improved quality.',
      options: ['the company reduced', 'reduced the company', 'did the company reduce', 'the company did reduce'],
      answer: 2,
      explanation: '"Not only + auxiliary + S + V" (đảo ngữ). "Not only did the company reduce costs" = nhấn mạnh hành động. Trợ động từ "did" vì thì quá khứ đơn.',
      hint: 'Not only (quá khứ) → did + S + V nguyên thể',
      tag: 'Not Only Did (Past Inversion)'
    },
    {
      id: 'tr-inv-013', type: 'inversion-transform', grammarId: 'inversion', unitId: 19,
      instruction: '🔄 Hoàn thành câu đảo ngữ',
      prompt: 'Câu gốc: "The company seldom provides such generous bonuses."\n→ Dạng đảo ngữ.',
      question: 'Seldom _____ such generous bonuses.',
      options: ['the company provides', 'does the company provide', 'the company does provide', 'provides the company'],
      answer: 1,
      explanation: '"Seldom" đứng đầu → đảo ngữ: "Seldom + does/do/did + S + V". "Seldom does the company provide..." = Công ty hiếm khi cung cấp...',
      hint: 'Seldom + does/do + S + V nguyên thể',
      tag: 'Seldom (Inversion)'
    },
    {
      id: 'tr-inv-014', type: 'inversion-transform', grammarId: 'inversion', unitId: 19,
      instruction: '🔄 Nhận dạng đảo ngữ Only if',
      prompt: 'Câu gốc: "You can receive the refund only if you return the item within 30 days."',
      question: 'Only if you return the item within 30 days _____ a refund.',
      options: ['you can receive', 'can you receive', 'you will receive', 'will you receive'],
      answer: 1,
      explanation: '"Only if + clause" đứng đầu → đảo ngữ mệnh đề chính: "can/will + S + V". Present ability → "can you receive". Đây là cấu trúc hay gặp trong chính sách công ty.',
      hint: 'Only if + clause → can/will + S + V (đảo ngữ)',
      tag: 'Only If (Conditional Inversion)'
    },
    {
      id: 'tr-inv-015', type: 'inversion-transform', grammarId: 'inversion', unitId: 19,
      instruction: '🔄 Chọn dạng đảo ngữ loại 2 đúng',
      prompt: 'Câu điều kiện loại 2: "If the manager were available, the meeting would proceed."\n→ Chuyển sang đảo ngữ.',
      question: '_____ the manager available, the meeting would proceed.',
      options: ['If were', 'Should', 'Were', 'Had'],
      answer: 2,
      explanation: 'Đảo ngữ loại 2: "Were + S + adj/V..." = If + S + were. "Were the manager available" = If the manager were available. Bỏ "if", đưa "were" lên đầu.',
      hint: 'Đảo ngữ loại 2: Were + S + adj/participle... (bỏ "if")',
      tag: 'Were-Inversion (Type 2)'
    },

    // ══════════════════════════════════════════════
    //  SUBJECT-VERB – bổ sung (đã có 10, thêm 5: #011–015)
    // ══════════════════════════════════════════════
    {
      id: 'tr-sv-011', type: 'subject-verb', grammarId: 'subject-verb', unitId: 13,
      instruction: '⚖️ Chọn động từ đúng về hòa hợp chủ-vị',
      prompt: 'Chủ ngữ phức tạp: "The quality of the products"\nChú ý: động từ theo "quality" hay "products"?',
      question: 'The quality of the products _____ improved significantly this year.',
      options: ['have', 'has', 'are', 'were'],
      answer: 1,
      explanation: 'Động từ theo danh từ CHÍNH (quality = số ít), không theo danh từ trong cụm giới từ (products = số nhiều). "The quality... has" (số ít).',
      hint: 'Bỏ qua cụm giới từ ở giữa — động từ chia theo danh từ đầu',
      tag: 'Head Noun Agreement'
    },
    {
      id: 'tr-sv-012', type: 'subject-verb', grammarId: 'subject-verb', unitId: 13,
      instruction: '⚖️ Chọn động từ đúng về hòa hợp chủ-vị',
      prompt: 'Chủ ngữ: "The news"\nDanh từ không đếm được trông giống số nhiều.',
      question: 'The news about the merger _____ confirmed by the CEO.',
      options: ['were', 'was', 'have been', 'are'],
      answer: 1,
      explanation: '"News" là danh từ không đếm được (số ít), dù trông có vẻ số nhiều. Tương tự: information, advice, equipment, furniture → luôn dùng động từ số ít.',
      hint: '"News / information / advice" → luôn số ít (was, has)',
      tag: 'Uncountable Noun (Looks Plural)'
    },
    {
      id: 'tr-sv-013', type: 'subject-verb', grammarId: 'subject-verb', unitId: 13,
      instruction: '⚖️ Chọn động từ đúng về hòa hợp chủ-vị',
      prompt: 'Cấu trúc: "Not only A but also B"\nQuy tắc: động từ chia theo danh từ GẦN nhất.',
      question: 'Not only the managers but also the CEO _____ attending the summit.',
      options: ['are', 'is', 'were', 'have been'],
      answer: 1,
      explanation: '"Not only A but also B" → động từ theo B (gần nhất). "The CEO" = số ít → "is". Tương tự: "Either A or B", "Neither A nor B".',
      hint: 'Not only A but also B → động từ chia theo B (danh từ gần nhất)',
      tag: 'Not Only...But Also: Proximity'
    },
    {
      id: 'tr-sv-014', type: 'subject-verb', grammarId: 'subject-verb', unitId: 13,
      instruction: '⚖️ Chọn động từ đúng về hòa hợp chủ-vị',
      prompt: 'Chủ ngữ: "Fifty percent of the staff"\nQuy tắc: phần trăm + of + N → động từ theo N.',
      question: 'Fifty percent of the staff _____ completed the mandatory training.',
      options: ['has', 'have', 'is', 'was'],
      answer: 1,
      explanation: '"Percent/fraction of + N" → động từ theo danh từ SAU "of". "Staff" = danh từ tập thể (số nhiều khi nhấn mạnh cá nhân) → "have". So sánh: "50% of the budget HAS been used" (budget = số ít).',
      hint: '"% of + N" → động từ chia theo N sau "of"',
      tag: 'Percent + Of: Agreement'
    },
    {
      id: 'tr-sv-015', type: 'subject-verb', grammarId: 'subject-verb', unitId: 13,
      instruction: '⚖️ Chọn động từ đúng về hòa hợp chủ-vị',
      prompt: 'Chủ ngữ: Cụm danh từ ghép\n"The CEO, along with several board members, _____ the conference."',
      question: 'The CEO, along with several board members, _____ the annual conference.',
      options: ['attend', 'attends', 'are attending', 'have attended'],
      answer: 1,
      explanation: '"Along with / together with / as well as" KHÔNG thay đổi số của chủ ngữ. Chủ ngữ vẫn là "The CEO" (số ít) → "attends". Khác với "and" (ghép hai chủ ngữ → số nhiều).',
      hint: '"Along with / together with" không thay đổi số chủ ngữ chính',
      tag: 'Along With: Does Not Change Number'
    },

    // ══════════════════════════════════════════════
    //  6 TOPICS MỚI
    // ══════════════════════════════════════════════

    // ─────────────────────────────────────────────
    //  MODAL VERBS (grammarId: modal)
    // ─────────────────────────────────────────────
    {
      id: 'tr-m-001', type: 'modal-transform', grammarId: 'modal', unitId: 9,
      instruction: '💡 Chọn modal đúng theo ngữ cảnh',
      prompt: 'Ngữ cảnh: Đây là quy định bắt buộc — không có lựa chọn nào khác.\n"All employees wear safety gear in the factory."',
      question: 'All employees _____ wear safety gear in the factory. (bắt buộc)',
      options: ['should', 'might', 'must', 'would'],
      answer: 2,
      explanation: '"Must" = bắt buộc tuyệt đối (quy định nội bộ, không có ngoại lệ). "Should" = khuyến nghị (nên, không bắt buộc). "Might" = khả năng. Ngữ cảnh safety regulation → must.',
      hint: '"Bắt buộc, không ngoại lệ" → must',
      tag: 'Must vs Should (Obligation)'
    },
    {
      id: 'tr-m-002', type: 'modal-transform', grammarId: 'modal', unitId: 9,
      instruction: '💡 Chuyển từ bắt buộc sang lời khuyên',
      prompt: 'Câu gốc: "Employees must submit expense reports within 5 days." (bắt buộc)\n→ Chuyển sang LỜI KHUYÊN (không bắt buộc).',
      question: 'Employees _____ submit expense reports within 5 days for faster processing.',
      options: ['must', 'should', 'shall', 'need to'],
      answer: 1,
      explanation: '"Should" = lời khuyên/khuyến nghị (không bắt buộc về mặt quy tắc). Khác với "must" (bắt buộc, có hậu quả nếu vi phạm). Khi thêm "for faster processing" → ngữ cảnh là lời khuyên.',
      hint: '"Lời khuyên, khuyến nghị, không bắt buộc" → should',
      tag: 'Should (Recommendation)'
    },
    {
      id: 'tr-m-003', type: 'modal-transform', grammarId: 'modal', unitId: 9,
      instruction: '💡 Chọn perfect modal đúng',
      prompt: 'Ngữ cảnh: Suy luận về quá khứ — chắc chắn điều gì đó đã xảy ra.\n"The office is empty. Everyone left early."',
      question: 'The office is empty. Everyone _____ left early today.',
      options: ['should have', 'must have', 'might have', 'could have'],
      answer: 1,
      explanation: '"Must have + V3" = suy luận chắc chắn về quá khứ (chắc chắn đã xảy ra). "Might have" = không chắc. "Should have" = đáng lẽ nên làm (tiếc nuối). Văn phòng trống → chắc chắn mọi người đã về.',
      hint: '"Chắc chắn đã xảy ra" (suy luận) → must have + V3',
      tag: 'Must Have (Past Deduction)'
    },
    {
      id: 'tr-m-004', type: 'modal-transform', grammarId: 'modal', unitId: 9,
      instruction: '💡 Chọn perfect modal đúng',
      prompt: 'Ngữ cảnh: Tiếc nuối — đáng lẽ nên làm nhưng không làm.\n"We didn\'t back up the files. We lost the data."',
      question: 'We _____ the files before the system crashed.',
      options: ['must have backed up', 'should have backed up', 'might have backed up', 'could back up'],
      answer: 1,
      explanation: '"Should have + V3" = đáng lẽ nên làm (nhưng không làm, có hàm ý tiếc nuối hoặc chỉ trích). Đây là perfect modal phổ biến nhất trong TOEIC Part 5 & emails.',
      hint: '"Đáng lẽ phải làm nhưng không làm" → should have + V3',
      tag: 'Should Have (Past Regret)'
    },
    {
      id: 'tr-m-005', type: 'modal-transform', grammarId: 'modal', unitId: 9,
      instruction: '💡 Chọn modal đúng — khả năng không chắc chắn',
      prompt: 'Ngữ cảnh: Dự đoán không chắc về tương lai.\n"The conference might or might not be postponed."',
      question: 'The conference _____ be postponed due to the weather conditions.',
      options: ['must', 'should', 'might', 'will'],
      answer: 2,
      explanation: '"Might / may" = khả năng (50/50 hoặc ít hơn, không chắc chắn). "Will" = chắc chắn. "Should" = kỳ vọng (dự đoán có cơ sở). Thời tiết xấu → không chắc → might.',
      hint: '"Có thể, không chắc chắn" → might/may',
      tag: 'Might (Uncertain Possibility)'
    },
    {
      id: 'tr-m-006', type: 'modal-transform', grammarId: 'modal', unitId: 9,
      instruction: '💡 Chuyển câu dùng modal bị động đúng',
      prompt: 'Câu gốc: "Someone should review the proposal before Monday."\n→ Chuyển sang bị động.',
      question: 'The proposal _____ before Monday.',
      options: ['should review', 'should be reviewing', 'should be reviewed', 'must review'],
      answer: 2,
      explanation: 'Modal + bị động: modal + be + V3. "Should review" (chủ động) → "should be reviewed" (bị động). Chủ thể "proposal" nhận hành động review.',
      hint: 'Modal bị động: modal + be + V3',
      tag: 'Modal Passive Voice'
    },
    {
      id: 'tr-m-007', type: 'modal-transform', grammarId: 'modal', unitId: 9,
      instruction: '💡 Chọn modal đúng theo mức độ trang trọng',
      prompt: 'Ngữ cảnh: Email trang trọng — xin phép lịch sự.\n"I want to take Friday off." → Dạng trang trọng hơn.',
      question: 'I _____ take the day off this Friday to attend a family event.',
      options: ['want to', 'would like to', 'will', 'shall'],
      answer: 1,
      explanation: '"Would like to" = muốn (lịch sự, trang trọng hơn "want to"). Trong email kinh doanh: "would like to" > "want to". "Shall" dùng trong đề nghị/gợi ý (Shall I...?).',
      hint: '"Want to" trang trọng hơn → "would like to"',
      tag: 'Would Like To (Polite Want)'
    },
    {
      id: 'tr-m-008', type: 'modal-transform', grammarId: 'modal', unitId: 9,
      instruction: '💡 Phân biệt can vs be able to',
      prompt: 'Ngữ cảnh: Khả năng đạt được sau nỗ lực (đặc biệt về quá khứ).\n"We finally managed to solve the issue after 3 days."',
      question: 'After three days of troubleshooting, the IT team _____ resolve the server issue.',
      options: ['could', 'was able to', 'can', 'might'],
      answer: 1,
      explanation: '"Was/were able to" dùng cho hành động cụ thể đã hoàn thành trong quá khứ (sau nỗ lực). "Could" dùng cho khả năng chung, không nhấn mạnh cụ thể. "Managed to" = was able to.',
      hint: 'Khả năng cụ thể đã hoàn thành trong quá khứ (sau nỗ lực) → was able to',
      tag: 'Was Able To (Specific Achievement)'
    },
    {
      id: 'tr-m-009', type: 'modal-transform', grammarId: 'modal', unitId: 9,
      instruction: '💡 Chọn perfect modal đúng',
      prompt: 'Ngữ cảnh: Khả năng đã xảy ra trong quá khứ nhưng không chắc.\n"The client didn\'t reply. Maybe they didn\'t receive the email."',
      question: 'The client _____ the email. That\'s why there\'s no reply.',
      options: ['must not have received', 'should not have received', 'might not have received', 'cannot have received'],
      answer: 2,
      explanation: '"Might not have + V3" = có thể đã không xảy ra (không chắc). "Must not have" = chắc chắn không xảy ra. "Should not have" = đáng lẽ không nên làm. Ngữ cảnh "maybe" → might not have.',
      hint: '"Có thể đã không" (không chắc) → might not have + V3',
      tag: 'Might Not Have (Uncertain Past)'
    },
    {
      id: 'tr-m-010', type: 'modal-transform', grammarId: 'modal', unitId: 9,
      instruction: '💡 Chọn modal phù hợp cho lời đề nghị',
      prompt: 'Ngữ cảnh: Đề nghị giúp đỡ trong văn phòng.\n"Do you need me to reschedule the meeting?"',
      question: '_____ I reschedule the meeting for a more convenient time?',
      options: ['Must', 'Should', 'Shall', 'Would'],
      answer: 2,
      explanation: '"Shall I/we + V?" = đề nghị giúp đỡ, gợi ý (thường dùng ngôi thứ nhất). Trang trọng và lịch sự hơn "Should I". "Would you like me to...?" cũng dùng được nhưng cấu trúc khác.',
      hint: '"Shall I/we + V?" = đề nghị giúp đỡ lịch sự',
      tag: 'Shall I? (Offer to Help)'
    },

    // ─────────────────────────────────────────────
    //  NOUN CLAUSES (grammarId: noun-clauses)
    // ─────────────────────────────────────────────
    {
      id: 'tr-nc-001', type: 'noun-clause-transform', grammarId: 'noun-clauses', unitId: 14,
      instruction: '📦 Chuyển câu hỏi trực tiếp → gián tiếp',
      prompt: 'Câu hỏi trực tiếp: "Where is the nearest service center?"\n→ Chuyển thành câu hỏi gián tiếp sau "Can you tell me...".',
      question: 'Can you tell me _____ the nearest service center is?',
      options: ['where is', 'where', 'what is', 'that where'],
      answer: 1,
      explanation: 'Câu hỏi gián tiếp: Wh-word + S + V (trật tự câu khẳng định, không đảo ngữ). "Where is?" → "where [the service center] is". KHÔNG đảo: "where is the service center" → sai.',
      hint: 'Câu hỏi gián tiếp: Wh-word + S + V (không đảo ngữ)',
      tag: 'Indirect Question: Where S V'
    },
    {
      id: 'tr-nc-002', type: 'noun-clause-transform', grammarId: 'noun-clauses', unitId: 14,
      instruction: '📦 Chuyển câu hỏi Yes/No → gián tiếp',
      prompt: 'Câu hỏi trực tiếp: "Is the position still available?"\n→ Gián tiếp sau "I would like to know...".',
      question: 'I would like to know _____ the position is still available.',
      options: ['that', 'if', 'what', 'how'],
      answer: 1,
      explanation: 'Câu hỏi Yes/No gián tiếp: dùng "whether" hoặc "if" + S + V. "Is the position available?" → "whether/if the position is available". "If" thường dùng trong văn nói; "whether" trang trọng hơn.',
      hint: 'Câu hỏi Yes/No gián tiếp: whether/if + S + V',
      tag: 'Indirect Yes/No: Whether/If'
    },
    {
      id: 'tr-nc-003', type: 'noun-clause-transform', grammarId: 'noun-clauses', unitId: 14,
      instruction: '📦 Chọn từ dẫn mệnh đề danh từ đúng',
      prompt: 'Ngữ cảnh: Xác nhận thông tin (khẳng định, không phải câu hỏi).\n"The announcement confirmed [THÔNG TIN]: The merger is finalized."',
      question: 'The announcement confirmed _____ the merger had been finalized.',
      options: ['whether', 'if', 'that', 'what'],
      answer: 2,
      explanation: '"That" dẫn mệnh đề danh từ khi nội dung là khẳng định (không phải câu hỏi). "Whether/if" dùng cho câu hỏi gián tiếp Yes/No. Confirm + that = xác nhận điều gì đó.',
      hint: '"That" dẫn nội dung khẳng định; "whether/if" dẫn câu hỏi Yes/No',
      tag: 'That vs Whether: Assertion vs Question'
    },
    {
      id: 'tr-nc-004', type: 'noun-clause-transform', grammarId: 'noun-clauses', unitId: 14,
      instruction: '📦 Chọn từ dẫn mệnh đề danh từ đúng',
      prompt: 'Câu hỏi trực tiếp: "How does the system work?"\n→ Gián tiếp: "Please explain...".',
      question: 'Please explain _____ the system works.',
      options: ['how does', 'how', 'what does', 'whether'],
      answer: 1,
      explanation: '"How + S + V" (trật tự khẳng định trong câu gián tiếp). "How does the system work?" → "how the system works". Không giữ "does" vì đã đổi sang trật tự khẳng định.',
      hint: '"How does X work?" → "how X works" (bỏ does, đổi trật tự)',
      tag: 'Indirect How-Question'
    },
    {
      id: 'tr-nc-005', type: 'noun-clause-transform', grammarId: 'noun-clauses', unitId: 14,
      instruction: '📦 Nhận dạng cấu trúc it is + adj + that',
      prompt: 'Ngữ cảnh: Diễn đạt tầm quan trọng.\n"Completing the report on time is essential."',
      question: 'It is essential _____ the report is completed on time.',
      options: ['that', 'if', 'whether', 'what'],
      answer: 0,
      explanation: '"It is + adj (essential/important/necessary/vital) + that + noun clause". Đây là cấu trúc mệnh đề danh từ làm chủ ngữ giả (It = subject placeholder). "That" là từ dẫn bắt buộc.',
      hint: '"It is + adj + that..." = cấu trúc chủ ngữ giả, dùng "that"',
      tag: 'It Is + Adj + That-Clause'
    },
    {
      id: 'tr-nc-006', type: 'noun-clause-transform', grammarId: 'noun-clauses', unitId: 14,
      instruction: '📦 Chọn từ dẫn mệnh đề danh từ đúng',
      prompt: 'Ngữ cảnh: Hỏi về lý do.\n"I don\'t understand. Why was the project cancelled?"',
      question: 'I don\'t understand _____ the project was cancelled.',
      options: ['why was', 'why', 'whether why', 'that why'],
      answer: 1,
      explanation: '"Why + S + V" (trật tự khẳng định trong gián tiếp). "Why was the project cancelled?" → "why the project was cancelled". Không dùng đảo ngữ sau "why" trong câu gián tiếp.',
      hint: '"Why was X?" → "why X was" (S+V sau why, không đảo)',
      tag: 'Indirect Why-Question'
    },
    {
      id: 'tr-nc-007', type: 'noun-clause-transform', grammarId: 'noun-clauses', unitId: 14,
      instruction: '📦 Chọn từ dẫn mệnh đề danh từ làm tân ngữ',
      prompt: 'Câu hỏi: "Who made this decision?"\n→ Gián tiếp sau "We need to find out...".',
      question: 'We need to find out _____ made this decision.',
      options: ['who', 'whom', 'that', 'whether'],
      answer: 0,
      explanation: '"Who" làm chủ ngữ trong mệnh đề danh từ. "Who made this decision?" → "who made this decision" (giữ nguyên "who" vì làm chủ ngữ, không đổi thành "whom").',
      hint: '"Who" làm chủ ngữ trong mệnh đề gián tiếp → giữ "who"',
      tag: 'Who as Subject in Noun Clause'
    },
    {
      id: 'tr-nc-008', type: 'noun-clause-transform', grammarId: 'noun-clauses', unitId: 14,
      instruction: '📦 Chuyển câu hỏi "what" → gián tiếp',
      prompt: 'Câu hỏi: "What time does the conference start?"\n→ Gián tiếp sau "Could you tell me...".',
      question: 'Could you tell me _____ the conference starts?',
      options: ['what time does', 'what time', 'that time', 'when does'],
      answer: 1,
      explanation: '"What time + S + V" trong câu gián tiếp. "What time does the conference start?" → "what time the conference starts" (bỏ does, V chia theo S). Giữ "what time" làm trạng từ.',
      hint: '"What time does X start?" → "what time X starts" (bỏ does, V chia)',
      tag: 'What Time S V (Indirect)'
    },
    {
      id: 'tr-nc-009', type: 'noun-clause-transform', grammarId: 'noun-clauses', unitId: 14,
      instruction: '📦 Nhận dạng mệnh đề danh từ làm chủ ngữ',
      prompt: 'Ngữ cảnh: Mệnh đề danh từ làm chủ ngữ câu.\n"[That she passed the exam] is great news."',
      question: '_____ she exceeded the sales target this quarter was truly impressive.',
      options: ['What', 'Which', 'That', 'Whether'],
      answer: 2,
      explanation: '"That + S + V" làm chủ ngữ câu. "That she exceeded..." = chủ ngữ của "was". "What" dùng khi không rõ "cái gì"; "that" dùng khi nội dung rõ ràng là khẳng định.',
      hint: '"That + S + V" làm chủ ngữ câu = nội dung cụ thể, khẳng định',
      tag: 'That-Clause as Subject'
    },
    {
      id: 'tr-nc-010', type: 'noun-clause-transform', grammarId: 'noun-clauses', unitId: 14,
      instruction: '📦 Phân biệt whether vs if trong noun clause',
      prompt: 'Ngữ cảnh: Câu hỏi gián tiếp sau giới từ.\n"I\'m not sure about [if the shipment arrived]."',
      question: 'The manager is unsure about _____ the shipment has arrived.',
      options: ['if', 'whether', 'that', 'how'],
      answer: 1,
      explanation: 'Sau giới từ (about, of, as to), phải dùng "whether" (KHÔNG dùng "if"). "About whether" = chuẩn. "About if" = sai ngữ pháp. Quy tắc: preposition + whether (không + if).',
      hint: 'Sau giới từ (about/of/as to) → whether (không dùng if)',
      tag: 'Preposition + Whether (Not If)'
    },

    // ─────────────────────────────────────────────
    //  PREPOSITIONS (grammarId: prepositions)
    // ─────────────────────────────────────────────
    {
      id: 'tr-prep-001', type: 'preposition-fill', grammarId: 'prepositions', unitId: 5,
      instruction: '📍 Chọn giới từ thời gian đúng',
      prompt: 'Phân biệt BY vs UNTIL:\n"by" = chậm nhất là (deadline) | "until" = liên tục đến tận',
      question: 'Please submit the report _____ 5 p.m. today. (deadline)',
      options: ['until', 'by', 'during', 'for'],
      answer: 1,
      explanation: '"By 5 p.m." = không muộn hơn 5 giờ chiều (deadline). "Until 5 p.m." = làm liên tục đến tận 5 giờ rồi dừng. "Submit by" = nộp trước thời hạn.',
      hint: '"Deadline, không muộn hơn" → by; "kéo dài liên tục đến" → until',
      tag: 'By vs Until (Time)'
    },
    {
      id: 'tr-prep-002', type: 'preposition-fill', grammarId: 'prepositions', unitId: 5,
      instruction: '📍 Chọn giới từ địa điểm đúng',
      prompt: 'Phân biệt AT / IN / ON cho địa điểm:\nat = điểm cụ thể | in = bên trong | on = trên bề mặt / tầng',
      question: 'The training session will be held _____ the main conference room.',
      options: ['in', 'at', 'on', 'by'],
      answer: 1,
      explanation: '"At + địa điểm cụ thể" khi nhấn mạnh vị trí điểm đến. "The conference room" là địa điểm cụ thể → "at". "In" dùng khi nhấn mạnh "bên trong không gian" (in the room cũng có thể, nhưng "at" tự nhiên hơn cho địa điểm sự kiện).',
      hint: '"At" cho địa điểm sự kiện/tòa nhà; "in" cho không gian/vùng/thành phố',
      tag: 'At vs In: Location'
    },
    {
      id: 'tr-prep-003', type: 'preposition-fill', grammarId: 'prepositions', unitId: 5,
      instruction: '📍 Chọn giới từ trong cụm cố định',
      prompt: 'Cụm cố định: "in accordance with"\nNgữ cảnh: Hành động tuân theo quy định.',
      question: 'The company operates _____ accordance with international standards.',
      options: ['on', 'in', 'at', 'by'],
      answer: 1,
      explanation: '"In accordance with" = tuân theo, phù hợp với (cụm giới từ cố định). Tương tự: "in compliance with", "in line with", "in keeping with". Luôn dùng "in".',
      hint: '"In accordance with" = cụm cố định, luôn dùng "in"',
      tag: 'In Accordance With'
    },
    {
      id: 'tr-prep-004', type: 'preposition-fill', grammarId: 'prepositions', unitId: 5,
      instruction: '📍 Chọn giới từ đi với tính từ cố định',
      prompt: 'Tính từ + giới từ cố định: "responsible"\n"She is responsible _____ the entire marketing department."',
      question: 'Each team leader is responsible _____ managing their department\'s budget.',
      options: ['of', 'to', 'for', 'with'],
      answer: 2,
      explanation: '"Responsible for" = có trách nhiệm về (cụm cố định). Tương tự cùng giới từ "for": eligible for, accountable for, qualified for, apply for.',
      hint: '"Responsible for" = cụm cố định',
      tag: 'Responsible For'
    },
    {
      id: 'tr-prep-005', type: 'preposition-fill', grammarId: 'prepositions', unitId: 5,
      instruction: '📍 Chọn giới từ đi với động từ cố định',
      prompt: 'Động từ + giới từ cố định: "comply"\n"All vendors must comply _____ the new safety regulations."',
      question: 'The manufacturer agreed to comply _____ all quality control standards.',
      options: ['to', 'with', 'by', 'at'],
      answer: 1,
      explanation: '"Comply with" = tuân thủ (cụm cố định). Tương tự "with": deal with, proceed with, interfere with, provide with. Nhóm "comply/deal/proceed" luôn dùng "with".',
      hint: '"Comply with" = cụm cố định',
      tag: 'Comply With'
    },
    {
      id: 'tr-prep-006', type: 'preposition-fill', grammarId: 'prepositions', unitId: 5,
      instruction: '📍 Chọn giới từ trong cụm thành ngữ trang trọng',
      prompt: 'Cụm giới từ trong email kinh doanh: "on behalf of"\nNgữ cảnh: Đại diện ai đó.',
      question: 'I am writing _____ behalf of the entire customer service team.',
      options: ['in', 'on', 'at', 'for'],
      answer: 1,
      explanation: '"On behalf of" = thay mặt, đại diện cho (cụm cố định). Rất phổ biến trong email trang trọng TOEIC. Không nói "in behalf of" hay "at behalf of".',
      hint: '"On behalf of" = thay mặt (cụm cố định)',
      tag: 'On Behalf Of'
    },
    {
      id: 'tr-prep-007', type: 'preposition-fill', grammarId: 'prepositions', unitId: 5,
      instruction: '📍 Chọn giới từ thời gian đúng',
      prompt: 'Phân biệt FOR vs DURING:\nfor + khoảng thời gian | during + danh từ chỉ sự kiện/khoảng thời gian',
      question: 'The office will be closed _____ the national holiday.',
      options: ['for', 'during', 'while', 'within'],
      answer: 1,
      explanation: '"During + danh từ" = trong suốt (thời điểm sự kiện xác định). "For + khoảng thời gian" = trong khoảng (chỉ độ dài). "During the holiday" (holiday = danh từ sự kiện).',
      hint: '"During + danh từ sự kiện"; "for + khoảng thời gian số"',
      tag: 'During vs For'
    },
    {
      id: 'tr-prep-008', type: 'preposition-fill', grammarId: 'prepositions', unitId: 5,
      instruction: '📍 Chọn giới từ trong cụm cố định',
      prompt: 'Cụm giới từ: "prior to" / "in advance of"\nNgữ cảnh: Làm việc gì TRƯỚC một sự kiện.',
      question: 'All documents must be submitted _____ to the interview date.',
      options: ['prior', 'before', 'ahead', 'in'],
      answer: 0,
      explanation: '"Prior to" = trước (trang trọng hơn "before", phổ biến trong văn bản kinh doanh/pháp lý). Cụm hoàn chỉnh: "prior to + noun/V-ing". "Prior" đứng một mình không đủ nghĩa.',
      hint: '"Prior to + noun" = trước (trang trọng)',
      tag: 'Prior To (Formal Before)'
    },
    {
      id: 'tr-prep-009', type: 'preposition-fill', grammarId: 'prepositions', unitId: 5,
      instruction: '📍 Chọn giới từ đi với tính từ cố định',
      prompt: 'Tính từ + giới từ: "interested"\n"She is interested _____ joining the overseas project."',
      question: 'Several employees expressed interest _____ the new mentorship program.',
      options: ['for', 'about', 'in', 'with'],
      answer: 2,
      explanation: '"Interested in" = quan tâm đến (cụm cố định). Danh từ "interest in" cũng dùng "in". Tương tự nhóm "in": specialize in, result in, invest in, succeed in.',
      hint: '"Interested in" = cụm cố định',
      tag: 'Interested In'
    },
    {
      id: 'tr-prep-010', type: 'preposition-fill', grammarId: 'prepositions', unitId: 5,
      instruction: '📍 Chọn giới từ đúng trong cụm phức tạp',
      prompt: 'Cụm giới từ nâng cao: "as of"\nNgữ cảnh: Thay đổi có hiệu lực kể từ một ngày nào đó.',
      question: '_____ January 1st, the company will implement its new remote work policy.',
      options: ['From', 'Since', 'As of', 'By'],
      answer: 2,
      explanation: '"As of + date" = kể từ ngày, có hiệu lực từ ngày (trang trọng, phổ biến trong thông báo chính sách). "As of January 1st" = effective from January 1st. Phổ biến trong Part 6 & 7.',
      hint: '"As of + date" = kể từ ngày, có hiệu lực từ',
      tag: 'As Of (Effective Date)'
    },

    // ─────────────────────────────────────────────
    //  PRONOUNS (grammarId: pronoun)
    // ─────────────────────────────────────────────
    {
      id: 'tr-pron-001', type: 'pronoun-select', grammarId: 'pronoun', unitId: 7,
      instruction: '🅰️ Chọn đại từ/hạn định từ đúng',
      prompt: 'Phân biệt sở hữu tính từ vs sở hữu đại từ.\n"This is my report." → "This report is _____."',
      question: 'The laptop on the desk is _____ ; please don\'t use it.',
      options: ['mine', 'my', 'me', 'myself'],
      answer: 0,
      explanation: '"Mine" = sở hữu đại từ (đứng độc lập, không đi kèm danh từ). "My" = sở hữu tính từ (đứng trước danh từ: my laptop). "The laptop is mine" = The laptop belongs to me.',
      hint: 'Sở hữu tính từ (my) + N; sở hữu đại từ (mine) đứng độc lập',
      tag: 'Possessive: My vs Mine'
    },
    {
      id: 'tr-pron-002', type: 'pronoun-select', grammarId: 'pronoun', unitId: 7,
      instruction: '🅰️ Chọn đại từ phản thân đúng',
      prompt: 'Đại từ phản thân: chủ ngữ và tân ngữ là cùng một người/vật.\n"He checked the report HE wrote."',
      question: 'The director reviewed the presentation _____ before sharing it with the board.',
      options: ['him', 'his', 'himself', 'he'],
      answer: 2,
      explanation: '"Himself" = đại từ phản thân (director tự mình review). Dùng khi chủ ngữ và tân ngữ là cùng một người. "Him" = tân ngữ (người khác). "Himself" cũng dùng nhấn mạnh = "personally".',
      hint: 'Chủ ngữ tự làm việc gì cho chính mình → đại từ phản thân',
      tag: 'Reflexive Pronoun: Himself'
    },
    {
      id: 'tr-pron-003', type: 'pronoun-select', grammarId: 'pronoun', unitId: 7,
      instruction: '🅰️ Chọn đại từ đúng cho danh từ tập thể',
      prompt: 'Danh từ tập thể: "the committee"\nQuy tắc: danh từ tập thể thường dùng đại từ số ít.',
      question: 'The committee submitted _____ final report to the board of directors.',
      options: ['their', 'its', 'it', 'his'],
      answer: 1,
      explanation: '"Its" = đại từ sở hữu số ít cho danh từ tập thể (committee, company, board, team) khi coi là một đơn vị. Tiếng Anh Mỹ thường dùng "its" (đơn vị). Tiếng Anh Anh có thể dùng "their".',
      hint: 'Danh từ tập thể (committee/company) → its (số ít, coi là đơn vị)',
      tag: 'Collective Noun + Its'
    },
    {
      id: 'tr-pron-004', type: 'pronoun-select', grammarId: 'pronoun', unitId: 7,
      instruction: '🅰️ Chọn mạo từ đúng',
      prompt: 'Phân biệt a/an/the/zero article:\n"We received a report. _____ report was detailed."',
      question: 'We launched a new product last month. _____ product exceeded our sales expectations.',
      options: ['A', 'An', 'The', 'Ø (không cần)'],
      answer: 2,
      explanation: '"A/an" = lần đầu đề cập (chưa xác định). "The" = đã đề cập trước hoặc đã xác định. "A new product" (đề cập lần đầu) → "The product" (lần sau, đã xác định).',
      hint: 'Lần đầu đề cập → a/an; đã đề cập/xác định → the',
      tag: 'Article: A (First) → The (Second)'
    },
    {
      id: 'tr-pron-005', type: 'pronoun-select', grammarId: 'pronoun', unitId: 7,
      instruction: '🅰️ Chọn hạn định từ số lượng đúng',
      prompt: 'Phân biệt each vs every:\nboth có nghĩa "mỗi" nhưng dùng khác nhau về sắc thái.',
      question: '_____ employee is required to complete the annual performance review.',
      options: ['All', 'Every', 'Each', 'Both'],
      answer: 1,
      explanation: '"Every" nhấn mạnh toàn bộ nhóm không có ngoại lệ (quy tắc, chính sách). "Each" nhấn mạnh từng cá nhân riêng lẻ. "Every employee" = all employees without exception (phổ biến trong văn bản quy định).',
      hint: '"Every" = toàn bộ, không ngoại lệ (quy tắc). "Each" = từng người riêng lẻ',
      tag: 'Every vs Each'
    },
    {
      id: 'tr-pron-006', type: 'pronoun-select', grammarId: 'pronoun', unitId: 7,
      instruction: '🅰️ Chọn đại từ sở hữu đúng',
      prompt: 'Phân biệt their vs its:\n"The team submitted _____ proposal." vs "The employees submitted _____ proposals."',
      question: 'The marketing department presented _____ annual strategy to the stakeholders.',
      options: ['their', 'its', 'his', 'our'],
      answer: 1,
      explanation: '"The marketing department" = danh từ tập thể, số ít → "its" (khi coi là một đơn vị). Tuy nhiên nếu nhấn mạnh các thành viên, "their" cũng chấp nhận được. Trong TOEIC, "department/company/board" → thường là "its".',
      hint: '"Department/company/board" (tập thể, đơn vị) → its',
      tag: 'Its vs Their: Collective Noun'
    },
    {
      id: 'tr-pron-007', type: 'pronoun-select', grammarId: 'pronoun', unitId: 7,
      instruction: '🅰️ Chọn đại từ tân ngữ đúng',
      prompt: 'Phân biệt chủ ngữ (I/he/she) vs tân ngữ (me/him/her).\n"Between you and _____, this project is behind schedule."',
      question: 'The CEO personally congratulated _____ on the successful product launch.',
      options: ['we', 'us', 'our', 'ourselves'],
      answer: 1,
      explanation: '"Us" = đại từ tân ngữ (nhận tác động của động từ "congratulated"). "We" = chủ ngữ. Sau động từ và giới từ → luôn dùng tân ngữ (me/him/her/us/them).',
      hint: 'Sau động từ → tân ngữ (us, them, him, her) không phải chủ ngữ',
      tag: 'Object Pronoun: Us'
    },
    {
      id: 'tr-pron-008', type: 'pronoun-select', grammarId: 'pronoun', unitId: 7,
      instruction: '🅰️ Chọn đại từ đúng cho mệnh đề quan hệ',
      prompt: 'Phân biệt who (chủ ngữ) vs whom (tân ngữ):\n"The person [WHO/WHOM] sent the email..." vs "The person [WHO/WHOM] we contacted..."',
      question: 'The consultant _____ we hired last year has extensive TOEIC teaching experience.',
      options: ['who', 'whom', 'whose', 'that'],
      answer: 1,
      explanation: '"Whom" = đại từ quan hệ làm tân ngữ (we hired HIM → whom we hired). "Who" = làm chủ ngữ. Test: thay bằng he/him. "We hired him" → "him" → whom. Trang trọng hơn "who".',
      hint: 'Test: thay bằng he/him. "him" → whom (tân ngữ)',
      tag: 'Who vs Whom (Relative Pronoun)'
    },
    {
      id: 'tr-pron-009', type: 'pronoun-select', grammarId: 'pronoun', unitId: 7,
      instruction: '🅰️ Chọn hạn định từ đúng',
      prompt: 'Phân biệt both/either/neither cho 2 đối tượng:\nboth = cả hai | either = một trong hai | neither = không ai/cái nào',
      question: '_____ the morning and afternoon sessions will cover the new compliance requirements.',
      options: ['Either', 'Neither', 'Both', 'Every'],
      answer: 2,
      explanation: '"Both A and B" = cả A lẫn B (hai đều đúng). "Either A or B" = một trong hai. "Neither A nor B" = không A cũng không B. Cả hai buổi đều học → Both.',
      hint: '"Cả hai đều" → both; "một trong hai" → either; "không cái nào" → neither',
      tag: 'Both / Either / Neither'
    },
    {
      id: 'tr-pron-010', type: 'pronoun-select', grammarId: 'pronoun', unitId: 7,
      instruction: '🅰️ Chọn đại từ đúng',
      prompt: 'Đại từ "one" dùng để chỉ người chung chung (generic).\n"_____ should always proofread before sending."',
      question: 'In professional settings, _____ should always verify information before presenting it.',
      options: ['they', 'one', 'you', 'someone'],
      answer: 1,
      explanation: '"One" = đại từ chung chung, lịch sự (rất trang trọng, đặc biệt trong văn viết). Tương đương với "you (generic)" nhưng trang trọng hơn. Phổ biến trong văn bản học thuật và kinh doanh.',
      hint: '"One should/must..." = trang trọng, lịch sự để chỉ chung chung',
      tag: 'Generic "One" (Formal)'
    },

    // ─────────────────────────────────────────────
    //  ADVERB TIME CLAUSES (grammarId: adverb-time)
    // ─────────────────────────────────────────────
    {
      id: 'tr-at-001', type: 'adverb-time', grammarId: 'adverb-time', unitId: 15,
      instruction: '🕐 Sửa lỗi thì trong mệnh đề thời gian',
      prompt: 'Quy tắc: Mệnh đề thời gian (when/after/before/once/until/as soon as) KHÔNG dùng will.\n"After the meeting will end, we will discuss the results." → SAI',
      question: 'After the meeting _____, we will discuss the results.',
      options: ['will end', 'ends', 'is ending', 'had ended'],
      answer: 1,
      explanation: 'Mệnh đề thời gian không dùng tương lai. "After + present simple" thay cho "after + will". "After the meeting ends" = sau khi cuộc họp kết thúc. Mệnh đề chính vẫn dùng "will".',
      hint: 'Mệnh đề thời gian: KHÔNG will → dùng hiện tại đơn',
      tag: 'No Future in Time Clause'
    },
    {
      id: 'tr-at-002', type: 'adverb-time', grammarId: 'adverb-time', unitId: 15,
      instruction: '🕐 Chọn liên từ thời gian đúng',
      prompt: 'Phân biệt WHEN vs AS SOON AS:\nwhen = khi | as soon as = ngay khi (nhấn mạnh tức thì)',
      question: '_____ the contract is signed, we will announce the partnership.',
      options: ['During', 'While', 'As soon as', 'Until'],
      answer: 2,
      explanation: '"As soon as" = ngay khi (nhấn mạnh hành động xảy ra ngay lập tức). "Once" cũng có nghĩa tương tự. "When" đơn giản hơn, không nhấn mạnh tức thì. "Until" = cho đến khi.',
      hint: '"Ngay khi / vừa khi" → as soon as / once',
      tag: 'As Soon As (Immediately When)'
    },
    {
      id: 'tr-at-003', type: 'adverb-time', grammarId: 'adverb-time', unitId: 15,
      instruction: '🕐 Chọn thì đúng trong chuỗi thời gian',
      prompt: 'Ngữ cảnh: Hai hành động trong quá khứ — một hành động kết thúc trước khi hành động kia bắt đầu.\n"She left → then I arrived."',
      question: 'By the time I arrived at the venue, the keynote speaker _____ his speech.',
      options: ['already started', 'had already started', 'already starts', 'will have started'],
      answer: 1,
      explanation: '"By the time + past simple" → mệnh đề chính dùng Past Perfect (had + V3). Hành động bắt đầu bài phát biểu xảy ra TRƯỚC khi tôi đến → "had already started".',
      hint: '"By the time + past" → past perfect (had + V3)',
      tag: 'By the Time + Past → Past Perfect'
    },
    {
      id: 'tr-at-004', type: 'adverb-time', grammarId: 'adverb-time', unitId: 15,
      instruction: '🕐 Phân biệt WHILE vs WHEN',
      prompt: 'while = hành động kéo dài (tiếp diễn) | when = thời điểm (đơn)',
      question: '_____ the presentation was ongoing, several attendees took notes.',
      options: ['When', 'While', 'Until', 'Once'],
      answer: 1,
      explanation: '"While" + hành động đang diễn ra (continuous). "Presentation was ongoing" = tiếp diễn → "while". "When" thường đi với hành động điểm (khoảnh khắc cụ thể). Câu trên nhấn mạnh trong suốt quá trình.',
      hint: '"While" + hành động kéo dài; "when" + khoảnh khắc cụ thể',
      tag: 'While vs When'
    },
    {
      id: 'tr-at-005', type: 'adverb-time', grammarId: 'adverb-time', unitId: 15,
      instruction: '🕐 Chọn liên từ thời gian đúng',
      prompt: 'Ngữ cảnh: Hành động kéo dài cho đến khi hành động khác xảy ra.\n"The store stays open. → Until what point?"',
      question: 'The temporary office will remain open _____ the renovation is completed.',
      options: ['when', 'once', 'until', 'as soon as'],
      answer: 2,
      explanation: '"Until/till + S + V" = cho đến khi (kéo dài liên tục đến điểm kết thúc). "Until the renovation is completed" = mở cửa liên tục cho đến khi việc cải tạo hoàn tất.',
      hint: '"Kéo dài liên tục cho đến khi" → until/till',
      tag: 'Until (Duration to Point)'
    },
    {
      id: 'tr-at-006', type: 'adverb-time', grammarId: 'adverb-time', unitId: 15,
      instruction: '🕐 Sửa lỗi thì trong mệnh đề thời gian',
      prompt: 'Ngữ cảnh: "Before you will submit the form, please double-check all details." → SAI',
      question: 'Before you _____ the form, please double-check all details.',
      options: ['will submit', 'submit', 'are submitting', 'submitted'],
      answer: 1,
      explanation: '"Before + present simple" trong mệnh đề thời gian (không dùng will). "Before you submit" = trước khi bạn nộp. Lệnh/yêu cầu trong mệnh đề chính dùng imperative hoặc "please + V".',
      hint: '"Before" = liên từ thời gian → không dùng will, dùng hiện tại đơn',
      tag: 'Before + Present (Not Will)'
    },
    {
      id: 'tr-at-007', type: 'adverb-time', grammarId: 'adverb-time', unitId: 15,
      instruction: '🕐 Chọn liên từ thời gian đúng',
      prompt: 'Ngữ cảnh: Hành động xảy ra ĐỒNG THỜI trong quá khứ.\n"She was reviewing documents. At the same time, he was writing the report."',
      question: 'She was reviewing the financial documents _____ her colleague was writing the quarterly report.',
      options: ['when', 'after', 'while', 'once'],
      answer: 2,
      explanation: '"While" = trong khi (hai hành động tiếp diễn đồng thời). Cả hai đều dùng Past Continuous. "When" + điểm thời gian gián đoạn. "While" + hành động song song kéo dài.',
      hint: '"Trong khi cùng lúc" (hai hành động tiếp diễn) → while',
      tag: 'While: Simultaneous Actions'
    },
    {
      id: 'tr-at-008', type: 'adverb-time', grammarId: 'adverb-time', unitId: 15,
      instruction: '🕐 Chọn thì đúng trong mệnh đề thời gian tương lai',
      prompt: 'Ngữ cảnh: "Ngay khi nhận được phê duyệt, dự án sẽ bắt đầu."\nMệnh đề thời gian dùng thì gì?',
      question: 'Once the funding _____, the construction team will begin immediately.',
      options: ['will be approved', 'is approved', 'would be approved', 'has been approved'],
      answer: 1,
      explanation: '"Once + present simple/present perfect" trong mệnh đề thời gian (không dùng will). "Is approved" (present passive) = ngay khi được phê duyệt. Cả "is approved" và "has been approved" đều chấp nhận được.',
      hint: '"Once" là liên từ thời gian → không dùng will trong mệnh đề that',
      tag: 'Once + Present (Not Will)'
    },
    {
      id: 'tr-at-009', type: 'adverb-time', grammarId: 'adverb-time', unitId: 15,
      instruction: '🕐 Chọn liên từ thời gian phù hợp',
      prompt: 'Ngữ cảnh: Hành động xảy ra ngay trước hành động khác trong quá khứ.\n"She submitted → immediately left."',
      question: '_____ submitting the final report, she immediately left for vacation.',
      options: ['Before', 'While', 'After', 'Until'],
      answer: 2,
      explanation: '"After V-ing" = sau khi làm gì (hành động đã hoàn thành). "After submitting the report, she left" = Sau khi nộp báo cáo, cô ấy ra đi. Rút gọn mệnh đề thời gian: "After she submitted" → "After submitting".',
      hint: '"Sau khi làm gì" + rút gọn → After + V-ing',
      tag: 'After + V-ing (Reduced Time Clause)'
    },
    {
      id: 'tr-at-010', type: 'adverb-time', grammarId: 'adverb-time', unitId: 15,
      instruction: '🕐 Phân biệt liên từ thời gian nâng cao',
      prompt: 'Cấu trúc: "No sooner had S V3 than..."\nNgữ cảnh: Vừa làm xong thì ngay lập tức...',
      question: 'No sooner _____ the meeting room than the fire alarm went off.',
      options: ['we entered', 'had we entered', 'we had entered', 'did we enter'],
      answer: 1,
      explanation: '"No sooner + had + S + V3 + than + past simple" = vừa...thì ngay... Đây là cấu trúc đảo ngữ thời gian, "had" đứng trước S. "No sooner had we entered than..." = Vừa bước vào thì...',
      hint: '"No sooner had + S + V3 + than..." = vừa...thì ngay...',
      tag: 'No Sooner...Than (Inversion)'
    },

    // ─────────────────────────────────────────────
    //  QUANTIFIERS (grammarId: quantifiers)
    // ─────────────────────────────────────────────
    {
      id: 'tr-q-001', type: 'quantifier-select', grammarId: 'quantifiers', unitId: 20,
      instruction: '🔢 Chọn từ chỉ số lượng đúng',
      prompt: 'Phân biệt MANY vs MUCH:\nmany + danh từ đếm được số nhiều | much + danh từ không đếm được',
      question: 'There is not _____ time left before the deadline.',
      options: ['many', 'much', 'a lot of', 'few'],
      answer: 1,
      explanation: '"Much" dùng với danh từ không đếm được (time = uncountable). "Many" dùng với danh từ đếm được số nhiều. "Not much time" = không còn nhiều thời gian.',
      hint: '"Time" là danh từ không đếm được → much (không many)',
      tag: 'Much vs Many'
    },
    {
      id: 'tr-q-002', type: 'quantifier-select', grammarId: 'quantifiers', unitId: 20,
      instruction: '🔢 Chọn từ chỉ số lượng đúng',
      prompt: 'Phân biệt FEW vs A FEW:\nfew = rất ít (tiêu cực) | a few = một vài (đủ dùng, tích cực)',
      question: 'We still have _____ days before the product launch. Let\'s use the time wisely.',
      options: ['few', 'a few', 'little', 'a little'],
      answer: 1,
      explanation: '"A few" = một vài ngày (đủ để làm gì đó → tích cực). "Few" = hầu như không có (tiêu cực). Câu "Let\'s use the time" → còn thời gian để dùng → "a few" (tích cực).',
      hint: '"A few" = tích cực (còn vài cái); "few" = tiêu cực (hầu như không có)',
      tag: 'A Few vs Few (Positive/Negative)'
    },
    {
      id: 'tr-q-003', type: 'quantifier-select', grammarId: 'quantifiers', unitId: 20,
      instruction: '🔢 Chọn từ chỉ số lượng đúng',
      prompt: 'Phân biệt LITTLE vs A LITTLE:\nlittle = rất ít (tiêu cực) | a little = một ít (đủ dùng)',
      question: 'There is _____ progress on the project — we are behind schedule.',
      options: ['little', 'a little', 'few', 'a few'],
      answer: 0,
      explanation: '"Little progress" = rất ít tiến triển (tiêu cực → phù hợp với "behind schedule"). "A little progress" = có một chút tiến triển (tích cực). "Progress" là uncountable → little/a little.',
      hint: '"Little" = tiêu cực (hầu không có gì); "a little" = tích cực (còn một ít)',
      tag: 'Little vs A Little'
    },
    {
      id: 'tr-q-004', type: 'quantifier-select', grammarId: 'quantifiers', unitId: 20,
      instruction: '🔢 Chọn từ chỉ số lượng đúng',
      prompt: 'Phân biệt A NUMBER OF vs THE NUMBER OF:\na number of = nhiều (plural) | the number of = con số (singular)',
      question: '_____ applicants have submitted their portfolios ahead of schedule.',
      options: ['The number of', 'A number of', 'A great deal of', 'Much'],
      answer: 1,
      explanation: '"A number of + plural noun" = nhiều, một số (động từ số nhiều). "The number of + plural noun" = con số (động từ số ít). "A number of applicants have" (số nhiều).',
      hint: '"A number of + N (plural)" = nhiều; động từ số nhiều',
      tag: 'A Number Of vs The Number Of'
    },
    {
      id: 'tr-q-005', type: 'quantifier-select', grammarId: 'quantifiers', unitId: 20,
      instruction: '🔢 Chọn từ chỉ số lượng đúng',
      prompt: 'Danh từ không đếm được thường nhầm lẫn trong TOEIC:\nfeedback, information, advice, equipment → không có "s", không dùng "many"',
      question: 'The customer provided _____ useful feedback on the new interface.',
      options: ['many', 'a great deal of', 'several', 'a number of'],
      answer: 1,
      explanation: '"Feedback" = danh từ không đếm được (không có dạng số nhiều, không dùng many/several/a number of). Dùng: a great deal of, a lot of, much, some. "A great deal of feedback" là tự nhiên.',
      hint: '"Feedback" là uncountable → a great deal of / a lot of / much',
      tag: 'Quantifier for Uncountable'
    },
    {
      id: 'tr-q-006', type: 'quantifier-select', grammarId: 'quantifiers', unitId: 20,
      instruction: '🔢 Chọn từ chỉ số lượng đúng',
      prompt: 'Phân biệt EACH vs EVERY:\neach = nhấn mạnh từng cái riêng lẻ | every = nhấn mạnh toàn bộ nhóm',
      question: '_____ department is required to submit a quarterly budget report.',
      options: ['All', 'Every', 'Each', 'Either'],
      answer: 1,
      explanation: '"Every department" = toàn bộ phòng ban, không có ngoại lệ (nhấn mạnh quy tắc áp dụng cho tất cả). "Each department" = từng phòng ban riêng lẻ (nhấn mạnh từng đơn vị). Quy định → "every".',
      hint: '"Every" = tất cả, không ngoại lệ (quy định/quy tắc)',
      tag: 'Every vs Each (Rule vs Individual)'
    },
    {
      id: 'tr-q-007', type: 'quantifier-select', grammarId: 'quantifiers', unitId: 20,
      instruction: '🔢 Chọn từ chỉ số lượng đúng',
      prompt: 'Phân biệt FEWER vs LESS:\nfewer + đếm được số nhiều | less + không đếm được',
      question: 'The new process generates _____ waste than the previous method.',
      options: ['fewer', 'less', 'little', 'few'],
      answer: 1,
      explanation: '"Less" + danh từ không đếm được (waste = uncountable). "Fewer" + danh từ đếm được số nhiều ("fewer employees"). "Less waste / fewer employees".',
      hint: '"Waste" là uncountable → less; "employees" là countable → fewer',
      tag: 'Less vs Fewer'
    },
    {
      id: 'tr-q-008', type: 'quantifier-select', grammarId: 'quantifiers', unitId: 20,
      instruction: '🔢 Chọn từ chỉ số lượng đúng',
      prompt: 'Phân biệt BOTH vs ALL:\nboth = cả hai (2 vật) | all = tất cả (≥3 hoặc không đếm được)',
      question: '_____ of the three proposals were considered by the selection committee.',
      options: ['Both', 'All', 'Every', 'Either'],
      answer: 1,
      explanation: '"All" dùng cho 3 hoặc nhiều hơn. "Both" chỉ dùng cho đúng 2. "All three proposals" = cả ba đề xuất. "Both two proposals" = cả hai.',
      hint: '"Both" = đúng 2; "all" = 3 trở lên',
      tag: 'Both (2) vs All (3+)'
    },
    {
      id: 'tr-q-009', type: 'quantifier-select', grammarId: 'quantifiers', unitId: 20,
      instruction: '🔢 Chọn từ chỉ số lượng đúng',
      prompt: 'Phân biệt SOME vs ANY:\nsome = khẳng định | any = phủ định/câu hỏi | any = "bất kỳ" trong khẳng định',
      question: 'Please let me know if you have _____ questions about the onboarding process.',
      options: ['some', 'any', 'every', 'either'],
      answer: 1,
      explanation: '"Any" trong câu hỏi và phủ định. "If you have any questions" = câu điều kiện có nghĩa phủ định/câu hỏi → "any". "Some" trong câu hỏi mang tính đề nghị ("Would you like some coffee?").',
      hint: '"Any" trong câu hỏi/phủ định/điều kiện; "some" trong khẳng định/đề nghị',
      tag: 'Any (Question/Condition) vs Some'
    },
    {
      id: 'tr-q-010', type: 'quantifier-select', grammarId: 'quantifiers', unitId: 20,
      instruction: '🔢 Chọn từ chỉ số lượng đúng',
      prompt: 'Cấu trúc nâng cao: "no fewer than" / "no less than" / "no more than"\nNgữ cảnh: Tối thiểu 500 người tham dự hội nghị.',
      question: 'The annual conference attracted _____ 500 participants this year.',
      options: ['no more than', 'no less than', 'no fewer than', 'as many as'],
      answer: 2,
      explanation: '"No fewer than 500" = ít nhất 500 (đếm được, nhấn mạnh con số tối thiểu ấn tượng). "No less than" dùng với uncountable. "No more than" = tối đa. "As many as" = nhiều đến (bao nhiêu).',
      hint: '"No fewer than + N đếm được" = ít nhất (nhấn mạnh tối thiểu ấn tượng)',
      tag: 'No Fewer Than (Minimum Emphasis)'
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
