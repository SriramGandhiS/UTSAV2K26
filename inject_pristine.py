with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# EVS data to inject 
new_evs = """const EVS = [
      {
        id: 'hv', name: 'HACKATHON', label: '24-Hour Innovation', category: 'Technical', type: 'Team', minTeam: 2, maxTeam: 4, tag: 'Hackathon', timeSlot: 'A',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="width:1.2em;height:1.2em"><defs><linearGradient id="g-hv" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#00cec9"/><stop offset="100%" stop-color="#0984e3"/></linearGradient></defs><path d="M16 18l6-6-6-6M8 6l-6 6 6 6" stroke="url(#g-hv)"/></svg>', grad: 'linear-gradient(135deg,#021a1a,#010f10)', accent: '#00cec9',
        desc: 'Build, innovate, and deploy! A high-intensity hackathon where teams race to develop solutions to real-world challenges.',
        date: 'April 15', time: '09:00 AM to 11:00 AM', venue: 'CSE Lab 1', deadline: 'Mar 30',
        p1: 'Rs.5,000', p2: 'Rs.3,000', p3: 'Rs.2,000',
        rules: ['Team of 2 to 4', 'Theme given on spot', 'Working prototype required', 'Any tech stack allowed', 'Judge decision final'],
        ec: 'Pranaav', ep: '9361131042', sc: 'Dr. Priya M.', sp: '+91 97890 12345'
      },
      {
        id: 'dd', name: 'DESIGN DECODE', label: 'Graphic Design', category: 'Technical', type: 'Solo', minTeam: 1, maxTeam: 1, tag: 'Design', timeSlot: 'B',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="width:1.2em;height:1.2em"><defs><linearGradient id="g-dd" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#fd79a8"/><stop offset="100%" stop-color="#e84393"/></linearGradient></defs><circle cx="13.5" cy="10.5" r="2.5" fill="#fd79a8" stroke="none"/><path d="m20.24 12.24-5.48 5.48a2.83 2.83 0 0 1-4 0l-5.48-5.48a2.83 2.83 0 0 1 0-4l5.48-5.48a2.83 2.83 0 0 1 4 0l5.48 5.48a2.83 2.83 0 0 1 0 4Z" stroke="url(#g-dd)" fill="url(#g-dd)" fill-opacity="0.15"/><path d="M3.76 11.76l5.48-5.48" stroke="#00cec9"/><path d="M14.76 20.24l5.48-5.48" stroke="#00cec9"/></svg>', grad: 'linear-gradient(135deg,#1a0a28,#0f0518)', accent: '#e84393',
        desc: 'Decode the design brief and craft pixel-perfect UI/UX solutions under time pressure. Creativity meets precision.',
        date: 'April 13', time: '09:00 AM to 10:35 AM', venue: 'IT Lab 2', deadline: 'Mar 30',
        p1: 'Rs.3,000', p2: 'Rs.2,000', p3: 'Rs.1,000',
        rules: ['Individual', 'Design tools provided', 'Time-bound rounds', 'Theme given on spot', 'Originality is key'],
        ec: 'Lekeetha Sri', ep: '9361131042', sc: 'Prof. Ramesh K.', sp: '+91 95670 23456'
      },
      {
        id: 'cc', name: 'CHECKMATE CODERS', label: 'Bug Gambit & Arena', category: 'Technical', type: 'Team', minTeam: 2, maxTeam: 2, tag: 'Coding', timeSlot: 'A',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="width:1.2em;height:1.2em"><defs><linearGradient id="g-cc" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#2ecc71"/><stop offset="100%" stop-color="#f1c40f"/></linearGradient></defs><path d="M16 18l6-6-6-6M8 6l-6 6 6 6" stroke="url(#g-cc)"/></svg>', grad: 'linear-gradient(135deg,#031a0d,#021008)', accent: '#2ecc71',
        desc: 'Strategize, code, and checkmate your opponents! A competitive programming showdown where logic is your weapon.',
        date: 'April 13', time: '02:00 PM to 04:30 PM', venue: 'CSE Lab 3', deadline: 'Mar 30',
        p1: 'Rs.3,000', p2: 'Rs.2,000', p3: 'Rs.1,000',
        rules: ['Team of 2', 'Languages: C, C++, Java, Python', 'Multiple rounds', 'No internet', 'Judge decision final'],
        ec: 'Kalaiselvi', ep: '9361131042', sc: 'Ms. Anitha L.', sp: '+91 93450 67890'
      },
      {
        id: 'ur', name: 'UNO REVERSE', label: 'Reverse Coding', category: 'Technical', type: 'Team', minTeam: 2, maxTeam: 2, tag: 'Coding', timeSlot: 'A',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="width:1.2em;height:1.2em"><defs><linearGradient id="g-ur" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#e74c3c"/><stop offset="100%" stop-color="#e67e22"/></linearGradient></defs><path d="M17.4 9c.4.8.6 1.7.6 2.7 0 3.3-2.7 6-6 6s-6-2.7-6-6c0-1 .2-1.9.6-2.7" stroke="url(#g-ur)" fill="url(#g-ur)" fill-opacity="0.15"/><path d="M12 2A4.5 4.5 0 0 0 7.5 6.5C7.5 8.9 9.5 11 12 11s4.5-2.1 4.5-4.5A4.5 4.5 0 0 0 12 2z" stroke="url(#g-ur)"/><path d="M11 20.3L6.8 16M13 20.3l4.2-4.3" stroke="#e74c3c"/></svg>', grad: 'linear-gradient(135deg,#1f0505,#120303)', accent: '#e74c3c',
        desc: 'Expect the unexpected. Teams are formed on the spot, roles are split, and just when you think you are winning, an UNO Reverse card flips the game! You might have to code a logic exactly backwards or swap problems mid-way.',
        date: 'April 16', time: '09:00 AM to 12:00 PM', venue: 'CSE Lab 2', deadline: 'Mar 30',
        p1: 'Rs.3,000', p2: 'Rs.2,000', p3: 'Rs.1,000',
        rules: ['Team of 2', 'Exclusive to 1st and 2nd years', 'Output provided, find the code', 'Reverse logic rounds', 'Time-limited rounds'],
        ec: 'Arikara Sudhan', ep: '9361131042', sc: 'Dr. Senthil P.', sp: '+91 91230 45678'
      },
      {
        id: 'btb', name: 'BRAND TO BILLION', label: 'Tech Startup Pitch', category: 'Technical', type: 'Team', minTeam: 1, maxTeam: 3, tag: 'Strategy', timeSlot: 'C',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="width:1.2em;height:1.2em"><defs><linearGradient id="g-btb" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#e67e22"/><stop offset="100%" stop-color="#f1c40f"/></linearGradient></defs><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="url(#g-btb)"/></svg>', grad: 'linear-gradient(135deg,#1f1200,#120b00)', accent: '#e67e22',
        desc: 'Turn the absurd into unforgettable. From selling the silliest product to pitching a million-dollar startup idea, this event tests your creativity, persuasion, and business instincts. Think fast, pitch smarter, and convince the investors.',
        date: 'April 18', time: '11:30 AM to 12:30 PM', venue: 'Seminar Hall', deadline: 'Mar 30',
        p1: 'Rs.4,000', p2: 'Rs.2,500', p3: 'Rs.1,500',
        rules: ['Open to all', 'Max of 3 in a team', 'Round 1 - Sell the Silliest', 'Round 2 - Start-up Investment Pitch', 'Judges decision final'],
        ec: 'Syedali Fathima', ep: '9361131042', sc: 'Prof. Lavanya S.', sp: '+91 89010 23456'
      },
      {
        id: 'zcz', name: 'ZERO CODE ZONE', label: 'Non Coding Tech', category: 'Technical', type: 'Team', minTeam: 2, maxTeam: 4, tag: 'Logic', timeSlot: 'C',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="width:1.2em;height:1.2em"><defs><linearGradient id="g-zcz" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#e74c3c"/><stop offset="100%" stop-color="#9b59b6"/></linearGradient></defs><path d="M12 21a9 9 0 1 0-9-9c0 1.6.4 3.1 1.2 4.4.2.4.3.9.1 1.4-.4 1.1-1.3 2.9-1.3 3.2 0 .2.2.4.4.3.3 0 2.1-.9 3.2-1.3.5-.2 1-.2 1.4.1 1.3.8 2.8 1.2 4.4 1.2z" stroke="url(#g-zcz)" fill="url(#g-zcz)" fill-opacity="0.15"/></svg>', grad: 'linear-gradient(135deg,#1f0505,#120303)', accent: '#e74c3c',
        desc: 'No coding needed! A pure logic, aptitude, and tech knowledge challenge for everyone.',
        date: 'April 15', time: '09:00 AM to 11:00 AM', venue: 'IT Lab 1', deadline: 'Mar 30',
        p1: 'Rs.2,000', p2: 'Rs.1,500', p3: 'Rs.1,000',
        rules: ['Team of 2 to 4', 'No coding required', 'Logic and aptitude based', 'Multiple rounds', 'No electronic devices'],
        ec: 'Reshmaa', ep: '9361131042', sc: 'Dr. Murugan A.', sp: '+91 87890 01234'
      },
      {
        id: 'tt', name: 'TECHNOTRACE', label: 'Tech Treasure Hunt', category: 'Technical', type: 'Team', minTeam: 2, maxTeam: 3, tag: 'Fun', timeSlot: 'D',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="width:1.2em;height:1.2em"><defs><linearGradient id="g-tt" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#3498db"/><stop offset="100%" stop-color="#9b59b6"/></linearGradient></defs><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" stroke="url(#g-tt)" fill="url(#g-tt)" fill-opacity="0.15"></polygon></svg>', grad: 'linear-gradient(135deg,#0d1f3c,#0a1428)', accent: '#3498db',
        desc: 'Follow the clues, crack the codes, and trace your way through a thrilling tech-themed treasure hunt!',
        date: 'April 15', time: '02:00 PM to 04:30 PM', venue: 'Campus Wide', deadline: 'Mar 30',
        p1: 'Rs.3,000', p2: 'Rs.2,000', p3: 'Rs.1,000',
        rules: ['Team of 2 to 3', 'Multiple rounds', 'Phone required for clues', 'No external help', 'Fastest team wins'],
        ec: 'Hariharan', ep: '9361131042', sc: 'Dr. Priya M.', sp: '+91 97890 12345'
      },
      {
        id: 'com', name: 'CLASH OF MINDS', label: 'Quiz & Debate Showdown', category: 'Non-Technical', type: 'Team', minTeam: 2, maxTeam: 3, tag: 'Quiz', timeSlot: 'A',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="width:1.2em;height:1.2em"><defs><linearGradient id="g-com" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#9b59b6"/><stop offset="100%" stop-color="#3498db"/></linearGradient></defs><path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="url(#g-com)" fill="url(#g-com)" fill-opacity="0.15"/><path d="M14 3v5h5M16 13H8M16 17H8M10 9H8" stroke="url(#g-com)"/></svg>', grad: 'linear-gradient(135deg,#150a28,#0a0518)', accent: '#9b59b6',
        desc: 'Battle it out in a rapid-fire quiz and debate format! Test your general knowledge and persuasion skills.',
        date: 'April 18', time: '02:00 PM to 04:00 PM', venue: 'Auditorium', deadline: 'Mar 30',
        p1: 'Rs.3,000', p2: 'Rs.2,000', p3: 'Rs.1,000',
        rules: ['Team of 2 to 3', 'Multiple rounds', 'No electronic devices', 'Quizmaster decision final', 'Time-limited answers'],
        ec: 'Jai Sri', ep: '9087654321', sc: 'Prof. Ramesh K.', sp: '+91 95670 23456'
      },
      {
        id: 'ff', name: 'FRANCHISE FIESTA', label: 'Business Simulation Game', category: 'Non-Technical', type: 'Team', minTeam: 2, maxTeam: 4, tag: 'Management', timeSlot: 'B',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="width:1.2em;height:1.2em"><defs><linearGradient id="g-ff" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#f1c40f"/><stop offset="100%" stop-color="#e67e22"/></linearGradient></defs><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="url(#g-ff)"/><circle cx="9" cy="7" r="4" stroke="url(#g-ff)"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="url(#g-ff)"/></svg>', grad: 'linear-gradient(135deg,#1a1200,#100c00)', accent: '#f1c40f',
        desc: 'Build your dream franchise from scratch! Strategy, marketing & management all in one thrilling game.',
        date: 'April 13', time: '11:30 AM to 01:00 PM', venue: 'MBA Block', deadline: 'Mar 30',
        p1: 'Rs.4,000', p2: 'Rs.2,500', p3: 'Rs.1,500',
        rules: ['Team of 2 to 4', 'Business strategy game', 'Presentation required', 'All materials provided', 'Judges decision final'],
        ec: 'Sriram Adithya', ep: '9087654321', sc: 'Prof. Lavanya S.', sp: '+91 89010 23456'
      },
      {
        id: 'tap', name: 'THE ALGORITHMIC PLATTER', label: 'Fun Algorithmic Puzzles', category: 'Non-Technical', type: 'Team', minTeam: 2, maxTeam: 3, tag: 'Puzzle', timeSlot: 'C',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="width:1.2em;height:1.2em"><defs><linearGradient id="g-tap" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#f1c40f"/><stop offset="100%" stop-color="#e67e22"/></linearGradient></defs><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" stroke="#f1c40f"/><path d="M12 5a7 7 0 0 0-7 7c0 2 1 3.9 2.5 5.1.7.6 1.1 1.4 1.1 2.4v1.5c0 1.1.9 2 2 2h2c1.1 0 2-.9 2-2v-1.5c0-1 .4-1.8 1.1-2.4C18 15.9 19 14 19 12a7 7 0 0 0-7-7Z" stroke="url(#g-tap)" fill="url(#g-tap)" fill-opacity="0.2"/></svg>', grad: 'linear-gradient(135deg,#1a1200,#100c00)', accent: '#f1c40f',
        desc: 'Serve up the perfect solution! A fun mix of algorithmic puzzles and pattern recognition challenges.',
        date: 'April 16', time: '01:30 PM to 03:30 PM', venue: 'MCA Lab', deadline: 'Mar 30',
        p1: 'Rs.3,000', p2: 'Rs.2,000', p3: 'Rs.1,000',
        rules: ['Team of 2 to 3', 'Puzzle-based challenges', 'Pen & paper rounds included', 'No electronic devices in prelims', 'Time-bound'],
        ec: 'Priyanka M', ep: '9087654321', sc: 'Dr. Murugan A.', sp: '+91 87890 01234'
      }
    ];"""

new_comm = """const COMMITTEE = [
      { name: 'Dr. T. Priya', role: 'Staff Coordinator', position: 'Professor & Head', img: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png', year: 5 },
      { name: 'Dr. S. Ramesh', role: 'Staff Coordinator', position: 'Associate Professor', img: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png', year: 5 },
      { name: 'Pranaav', role: 'Event Head', position: '4th Year Coordinator', img: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png', year: 4 },
      { name: 'Kalaiselvi', role: 'Event Head', position: '4th Year Coordinator', img: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png', year: 4 },
      { name: 'Reshmaa', role: 'Event Head', position: '4th Year Coordinator', img: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png', year: 4 },
      { name: 'Hariharan', role: 'Event Head', position: '4th Year Coordinator', img: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png', year: 4 },
      { name: 'Syedali Fathima', role: 'Event Head', position: '4th Year Coordinator', img: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png', year: 4 },
      { name: 'Arikara Sudhan', role: 'Event Head', position: '4th Year Coordinator', img: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png', year: 4 },
      { name: 'Lekeetha Sri', role: 'Event Head', position: '4th Year Coordinator', img: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png', year: 4 },
      { name: 'Sriram Adithya', role: 'Event Head', position: '4th Year Coordinator', img: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png', year: 4 },
      { name: 'Priyanka M', role: 'Event Head', position: '4th Year Coordinator', img: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png', year: 4 },
      { name: 'Jai Sri', role: 'Event Head', position: '4th Year Coordinator', img: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png', year: 4 },
      { name: 'Arjhun O', role: 'Joint President', position: 'Sub Coordinator', img: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png', year: 3 },
      { name: 'Arriram', role: 'Coordinator', position: 'Sub Coordinator', img: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png', year: 3 },
      { name: 'Abinayaa', role: 'Coordinator', position: 'Sub Coordinator', img: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png', year: 3 },
      { name: 'Abirami', role: 'Coordinator', position: 'Sub Coordinator', img: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png', year: 3 },
      { name: 'Devadharshini', role: 'Coordinator', position: 'Sub Coordinator', img: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png', year: 3 },
      { name: 'Dharshan', role: 'Coordinator', position: 'Sub Coordinator', img: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png', year: 3 },
      { name: 'Deva Priyan', role: 'Coordinator', position: 'Sub Coordinator', img: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png', year: 3 }
    ];"""

rc_fn = """function renderComm() {
      const commList = document.getElementById('comm-list');
      if (!commList) return;
      let heads = COMMITTEE.filter(c => c.year === 4);
      let subs = COMMITTEE.filter(c => c.year === 3);

      function renderCommCard(c) {
        return `
        <div class="comm-card" onclick="window.location.href='https://www.google.com/search?q=' + encodeURIComponent(c.name)">
          <img src="${c.img}" alt="${c.name}">
          <div class="comm-name">${c.name}</div>
          <div class="comm-role">${c.role}</div>
        </div>`;
      }

      let html = '';
      if (heads.length > 0) {
        html += `<div class="comm-sec-title">Head Coordinators (4th Year)</div><div class="comm-grid">` + 
                heads.map(c => renderCommCard(c)).join('') + `</div>`;
      }
      if (subs.length > 0) {
        html += `<div class="comm-sec-title">Sub Coordinators (3rd Year)</div><div class="comm-grid">` + 
                subs.map(c => renderCommCard(c)).join('') + `</div>`;
      }
      commList.innerHTML = html;
    }"""

# Inject EVS
evs_start = html.find('const EVS = [')
evs_end = html.find('];', evs_start) + 2
html = html[:evs_start] + new_evs + html[evs_end:]

# Inject COMMITTEE
c_start = html.find('const COMMITTEE = [')
if c_start > -1:
    c_end = html.find('];', c_start) + 2
    html = html[:c_start] + new_comm + html[c_end:]
else:
    s_idx = html.find('/* ════════ STATE ════════ */')
    html = html[:s_idx] + new_comm + '\\n\\n    ' + html[s_idx:]

# Inject renderComm if missing from code or update it
rc_start = html.find('function renderComm() {')
if rc_start > -1:
    rc_end = html.find('}', html.find('commList.innerHTML = html;', rc_start)) + 1
    html = html[:rc_start] + rc_fn + html[rc_end:]
else:
    b_idx = html.find('function buildObs()')
    html = html[:b_idx] + rc_fn + '\\n\\n    ' + html[b_idx:]

# Ensure init triggers renderComm
if 'renderComm()' not in html[html.find('function init()'):html.find('}', html.find('function init()'))]:
    html = html.replace('renderTiles();', 'renderTiles();\\n      renderComm();')

# Grid sizing CSS fixes
if 'minmax(280px, 1fr)' in html:
    html = html.replace('repeat(auto-fill, minmax(280px, 1fr))', 'repeat(auto-fill, minmax(180px, 1fr))')
if 'gap: 16px;' in html and 'grid-template-columns: repeat(2, 1fr);' in html:
    html = html.replace('grid-template-columns: repeat(2, 1fr);\\n        gap: 16px;', 'grid-template-columns: repeat(2, 1fr);\\n        gap: 12px;')

# Date updates
html = html.replace('2–4 April 2026', 'April 13 to April 18')
html = html.replace('>April 13, 15, 16, 18 <', '>April 13 to April 18<')
html = html.replace('>April 13, 15, 16, 18<', '>April 13 to April 18<')
html = html.replace('>April 13, 15, 16 &amp; 18 · PSNA Campus<', '>April 13 to April 18 - PSNA Campus<')
html = html.replace("'APRIL 13, 15, 16, 18'", "'APRIL 13 TO APRIL 18'")
import re
html = re.sub(r'<div class="poster-dt">[^<]+</div>', '<div class="poster-dt">April 13 to April 18</div>', html)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print('Data injected smoothly')
