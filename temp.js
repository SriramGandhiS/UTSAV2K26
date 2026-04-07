
        /* ════════════════════════════════
             CONFIGURATION — EDIT THESE
             ════════════════════════════════ */
        // To connect Google Sheets:
        // 1. Create a Google Sheet
        // 2. Go to Extensions → Apps Script
        // 3. Paste the doPost function from the bottom of this file
        // 4. Deploy as Web App (Anyone can access)
        // 5. Paste the URL below
        const SHEETS_URL='https://script.google.com/macros/s/AKfycbx_En8x8MhnhIV1qYboX9kAftQ23dHtjJAO8wGouGgwlaBP8GOgUHTS-7Va4nErc0MWKg/exec';
        // ── ADMIN ACCESS ──
        const ADMIN_ID='sriram';
        const SCANNER_ID='utsavqr'; // Secondary scanner ID
        // ⚠ CAUTION: Change this default password before production deployment
        const ADMIN_PASS='93611';

        /* ═══ WHATSAPP GROUP LINKS ═══ */
        const EVENT_WHATSAPP_MAP= {
          "DESIGN DECODE": "https://chat.whatsapp.com/DjFzaKUd1e925Mwot5Li9L?mode=gi_t",
            "FRANCHISE FIESTA": "https://chat.whatsapp.com/Fc8otG9IlqN99FzuPiRty9",
            "CHECKMATE CODERS": "https://chat.whatsapp.com/HM2osS4hkYaLExQnQVw2TL",
            "HACKVERSE": "https://chat.whatsapp.com/EPVfUdxaIqAIJEQFgs79b7",
            "THE ALGORITHMIC PLATTER": "https://chat.whatsapp.com/LKa7feP7CPkIWbhyb2yJo7",
            "TECHNOTRACE": "https://chat.whatsapp.com/Id7RvnVMPtjBeur8ISIwj7",
            "UNO REVERSE": "https://chat.whatsapp.com/GxbewbKXWC2EMXvZXG56zO",
            "CLASH OF MINDS": "https://chat.whatsapp.com/Id7RvnVMPtjBeur8ISIwj7",
            "ZERO CODE ZONE": "https://chat.whatsapp.com/HXi7JqCoAVx9Ly97Mu6h2K",
            "BRAND TO BILLION": "https://chat.whatsapp.com/LWue9Cn8wj399upfwEwTc1"
        }

        ;

        /* ═══ EMERGENCY MAINTENANCE MODE (Global via Google Sheets) ═══ */
        let emergencyMode=false;

        function applyEmergencyMode() {
          const ov=document.getElementById('maint-ov');
          const btn=document.getElementById('em-toggle-btn');

          if (emergencyMode) {
            ov && ov.classList.add('active');

            if (btn) {
              btn.className='em-toggle-btn on';
              btn.innerHTML='✅ Disable Emergency Mode';
            }
          }

          else {
            ov && ov.classList.remove('active');

            if (btn) {
              btn.className='em-toggle-btn off';
              btn.innerHTML='🚨 Enable Emergency Mode';
            }
          }
        }

        /* ═══ ADMIN SECONDARY SECURITY (OTP Failsafe) ═══ */
        function verifyAdminOTP(actionName) {
          const otp=prompt(`SECURITY CHECK\n\nWe need to verify your identity to $ {
              actionName
            }

            .\nAn OTP has been sent to the Admin's registered mobile number.\n\nPlease enter the OTP to proceed:`);
 if (otp==='0172') return true;
            if (otp !==null) alert("Authentication Failed: Incorrect OTP entered. Security event logged. Action blocked.");
            return false;
          }

          async function toggleEmergencyMode() {
            if ( !verifyAdminOTP('toggle Global Maintenance Mode')) return;

            const btn=document.getElementById('em-toggle-btn');
            const newState= !emergencyMode;
            // Instant visual feedback
            btn.disabled=true;
            btn.innerHTML=newState ? '⏳ Enabling...' : '⏳ Disabling...';

            try {
              const resp=await fetch(SHEETS_URL, {

                method: 'POST',
                body: JSON.stringify({
                  action: 'setEmergency', enabled: newState, uid: ADMIN_ID, pwd: ADMIN_PASS
                })
            });
          const data=await resp.json();

          if (data.success) {
            emergencyMode=data.emergency;

            localStorage.setItem('u26_em_cache', JSON.stringify({
                v: emergencyMode, t: Date.now()
              }));
        }
        }

        catch (err) {
          // Fallback: toggle locally even if API fails
          emergencyMode=newState;

          localStorage.setItem('u26_em_cache', JSON.stringify({
              v: emergencyMode, t: Date.now()
            }));
        }

        btn.disabled=false;
        applyEmergencyMode();
        }

        // Check emergency status on page load
        async function checkEmergencyStatus() {

          // 1. Apply cached value instantly (no flash)
          try {
            const cached=JSON.parse(localStorage.getItem('u26_em_cache') || '{}');

            if (cached.v===true) {
              emergencyMode=true; applyEmergencyMode();
            }
          }

          catch (e) {}

          // 2. Fetch fresh value from Google Sheets (with 10-second spam protection)
          if ( !SHEETS_URL || SHEETS_URL==='YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') return;

          try {
            const cached=JSON.parse(localStorage.getItem('u26_em_cache') || '{}');

            if (cached.t && Date.now() - cached.t < 10000) {
              emergencyMode= ! !cached.v;
              applyEmergencyMode();
              return;
            }
          }

          catch (e) {}

          try {
            const resp=await fetch(SHEETS_URL + '?action=getEmergencyStatus');
            const data=await resp.json();
            emergencyMode= ! !data.emergency;

            localStorage.setItem('u26_em_cache', JSON.stringify({
                v: emergencyMode, t: Date.now()
              }));
          applyEmergencyMode();
        }

        catch (e) {
          /* silent fail, use cached */
        }
        }

        document.addEventListener('DOMContentLoaded', checkEmergencyStatus);

        function getTeamLabel(min, max, type='', eventId='') {
          if (eventId==='dn' || (type==='Year-wise' && eventId==='dn')) return 'Year-wise';
          if (min===1 && max===1) return 'SOLO';
          if (min===2 && max===2) return 'DUO';
          if (min===3 && max===3) return 'TRIO';
          if (min===4 && max===4) return 'SQUAD';

          return min===max ? `$ {
            max
          }

          PLAYERS` : `$ {
            min
          }

          -$ {
            max
          }

          PLAYERS`;
        }

        function formatDate(raw) {
          if ( !raw || raw==='undefined') return 'TBA';

          try {
            const d=new Date(raw);
            if (isNaN(d.getTime())) return raw; // Return as is if not a valid date
            const months=['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

            return `$ {
              months[d.getMonth()]
            }

            $ {
              d.getDate()
            }

            `;
          }

          catch (e) {
            return raw;
          }
        }

        /* ════════ EVENT DATA (DYNAMIC) ════════ */
        let EVS=[];
        let uiOverlayCount=0;

        async function fetchEvents() {
          // 🚀 Stale-While-Revalidate: Load from cache instantly
          const cached=localStorage.getItem('u26_ev_cache');

          if (cached) {
            try {
              EVS=JSON.parse(cached);
              renderTiles(); renderAllEvents();
              // If a category path is already open, refresh it too
              const activePath=document.querySelector('.ev-path-ov.open');

              if (activePath && activePath.id) {
                const cat=activePath.id.replace('-ov', '');
                renderEventsByPath(cat);
              }

              console.log("⚡ Loaded from cache.");
            }

            catch (e) {}
          }

          try {
            // 🔥 Cache-buster for fresh edits
            const resp=await fetch(SHEETS_URL + '?action=getEvents&cb=' + Date.now());
            const data=await resp.json();

            if (data.success && data.events && data.events.length > 0) {
              const freshEVS=data.events.map(row=> {
                  const get=(key)=> {
                    const k=Object.keys(row).find(k=> k.toLowerCase().trim()===key.toLowerCase());
                    return k ? String(row[k] || '').trim() : '';
                  }

                  ;

                  const evObj= {
                    id: get('EventID').toLowerCase() || ('ev-' + Math.random().toString(36).substr(2, 5)),
                    name: get('EventName') || 'Unnamed Event',
                    label: get('Label') || 'Event details',
                    category: get('Category'),
                    type: get('Type'),
                    minTeam: parseInt(get('MinTeam')) || 1,
                    maxTeam: parseInt(get('MaxTeam')) || 1,
                    tag: get('Tag'),
                    timeSlot: get('TimeSlot'),
                    venue: get('Venue'),
                    date: formatDate(get('EventDate')),
                    time: get('TimeRange'),
                    desc: get('Description'),
                    p1: get('Prize1'),
                    p2: get('Prize2'),
                    p3: get('Prize3'),
                    rules: (get('Rules') || '').split('\n').map(r=> r.trim()).filter(r=> r !==''),
                    ec: get('EventCoordinator'),
                    ep: get('ECPhone'),
                    sc: get('StaffCoordinator'),
                    sp: get('SCPhone'),
                    jcs: (get('JuniorCoordinators') || '').split(',').map(j=> j.trim()).filter(j=> j !==''),
                    poster: get('PosterURL'),
                    icon: get('IconSVG') || '♣',
                    accent: get('AccentColor'),
                    grad: get('Gradient'),
                    isSimultaneous: get('IsSimultaneous').toUpperCase()==='TRUE',
                    targetSheet: get('TargetSheet'),
                    allowMultiple: get('AllowMultiple').toUpperCase()==='TRUE'
                  }

                  ;

                  // Local Poster Overrides
                  if (evObj.id==='dn') {
                    evObj.poster='assets/posters/dance.jpg';
                  }

                  return evObj;
                });

              // Force update if data changed
              // Always update EVS from fresh data if success
              EVS=freshEVS;
              localStorage.setItem('u26_ev_cache', JSON.stringify(freshEVS));
              renderTiles(); renderAllEvents();

              // Re-render open category path
              const activePath=document.querySelector('.ev-path-ov.open');

              if (activePath && activePath.id) {
                renderEventsByPath(activePath.id.replace('-ov', ''));
              }

              console.log("🔄 UI Synced with fresh sheet data.");
            }
          }

          catch (e) {
            console.error("Sync Error:", e);
            if ( !EVS.length) showDataError("CONNECTION LOST", "Could not reach the Google Sheet.");
          }
        }

        function showDataError(title, msg) {
          const container=document.getElementById('ev-tiles');
          if ( !container) return;

          container.innerHTML=` <div style="grid-column:1/-1; padding:40px 20px; text-align:center; background:rgba(211,47,47,0.1); border:1px dashed #d32f2f; border-radius:15px; margin:20px;" > <div style="font-size:32px; margin-bottom:10px;" >⚠️</div> <h2 style="color:#ff4d4d; font-family:'Barlow Condensed',sans-serif; letter-spacing:2px; margin-bottom:10px;" >$ {
            title
          }

          </h2> <p style="color:rgba(255,255,255,0.7); font-size:14px; max-width:400px; margin:0 auto; line-height:1.5;" >$ {
            msg
          }

          </p> </div> `;
        }

        const CONTACTS=[ {
          role: 'Non-Technical Event Queries', name: 'Arjhun', phone: '8610051714'
        }

        ,
        {
        role: 'Technical Event Queries', name: 'Pranav', phone: '9092339133'
        }

        ,
        {
        role: 'General Enquiries', name: 'Lekeetha Sri', phone: '8838422893'
        }

        ,
        {
        role: 'Event Management', name: 'Aravind', phone: '9025810169'
        }

        ,
        {
        role: 'Website & Digital Support', name: 'Sriram S', phone: '9361123688'
        }

        ,
        {
        role: 'Staff Coordinator', name: 'Hemalatha', phone: 'Asst. Prof'
        }

        ,
        {
        role: 'Staff Coordinator', name: 'Padma Priya', phone: 'Asst. Prof'
        }

        ];

        /* ════════ STATE ════════ */
        let currentEv=null;
        let selectedTeamSize=0;
        let teamMembers=[];

        let pktDrafts= {}

        ; // Store unsaved field data for each slot index
        let currentStep=0;

        /* ════════ INIT ════════ */
        async function init() {
          const loader=document.getElementById('initial-loader');
          const startTime=Date.now();

          // Fetch dynamic events from Google Sheets FIRST
          await fetchEvents();
          // Fetch Access sheet feature flags
          await fetchAccessFlags();

          // Build UI after data is ready
          buildObs();
          buildTicker();
          renderTiles();
          renderComm();
          renderContacts();
          renderAllEvents();

          animStats();
          tick();
          setInterval(tick, 1000);
          initHeroVideo();

          if (typeof initHeroParticles !=='function') {
            window.initHeroParticles=function () {
              console.log("Hero particles initialized (placeholder)");
            }

            ;
          }

          initHeroParticles();
          initOverlayParticles('allev-particles', 'allev-ov');
          initOverlayParticles('reg-particles', 'reg-ov');

          const hasRegs=JSON.parse(localStorage.getItem('u26r') || '[]').length > 0;

          window.addEventListener('scroll', updateDockActive, {
            passive: true
          });
        updateDockActive();

        // "Feel the Loading" - Ensure loader stays for a short time for brand experience
        const elapsed=Date.now() - startTime;
        const minDelay=300;
        const remaining=Math.max(0, minDelay - elapsed);

        setTimeout(()=> {
            if (loader) {
              loader.classList.remove('visible');
              setTimeout(()=> loader.remove(), 1000);
            }

            // Force restore UI states on load completion
            restoreDockForce();
          }

          , remaining);
        }



        /* ════════ ACCESS / FEATURE FLAGS from Sheet ════════ */
        window.ACCESS= {}

        ; // Global feature flags

        async function fetchAccessFlags() {
          try {
            const cachedComm = JSON.parse(localStorage.getItem('u26_committee_cache') || 'null');
            if (cachedComm) {
               COMMITTEE = cachedComm;
            }

            const resp=await fetch(SHEETS_URL + '?action=getAccess&cb=' + Date.now());
            const data=await resp.json();

            if (data.success && data.access) {
              window.ACCESS=data.access;
              applyAccessFlags();
              localStorage.setItem('u26_access_cache', JSON.stringify(data.access));

              if (data.committee && data.committee.length > 0) {
                 COMMITTEE = data.committee.map(c => {
                   return {
                     isHead: String(c.ishead || '').toUpperCase() === 'TRUE',
                     name: c.name || '',
                     role: c.role || '',
                     dept: c.department || '',
                     img: c.imageurl || c.photo || '',
                     imgStyle: c.imagestyle || '',
                     phone: c.phone || c.phonenumber || '',
                     linkedin: c.linkedin || '#'
                   };
                 });
                 localStorage.setItem('u26_committee_cache', JSON.stringify(COMMITTEE));
              }
            }
          }

          catch (e) {
            // Fallback: use cached flags and committee
            try {
              const cached=JSON.parse(localStorage.getItem('u26_access_cache') || '{}');
              window.ACCESS=cached;
              applyAccessFlags();
              
              const cachedComm = JSON.parse(localStorage.getItem('u26_committee_cache') || '[]');
              if (cachedComm.length) COMMITTEE = cachedComm;
            }
            catch(e2) {}
          }
        }

        function applyAccessFlags() {
          // show_team_btn: controls Add Member button visibility
          const showTeam=window.ACCESS.show_team_btn;
          const addBtns=document.querySelectorAll('.add-member-btn, .pkt-add-btn, [id*="add-member"], [onclick*="addMember"], [onclick*="addPktMember"]');

          if (showTeam===false || String(showTeam).toLowerCase()==='false') {
            addBtns.forEach(b=> b.style.display='none');
          }

          else {
            addBtns.forEach(b=> b.style.display='');
          }

          // registrations_open: if false, disable Register buttons
          const regsOpen=window.ACCESS.registrations_open;

          if (regsOpen===false || String(regsOpen).toLowerCase()==='false') {
            const regBtns=document.querySelectorAll('[onclick*="openReg"], #dock-registration');

            regBtns.forEach(b=> {
                b.disabled=true;
                b.title='Registrations are currently closed';
                b.style.opacity='0.5';
              });
          }

          // event_count_override: override the displayed event count
          if (window.ACCESS.event_count_override) {
            const sevEl=document.getElementById('sev');
            if (sevEl) sevEl.textContent=window.ACCESS.event_count_override;
          }
        }

        /* ════════ LAZY VIDEO LOADER ════════ */
        function initHeroVideo() {
          const wrapper=document.getElementById('vid-wrapper'); // .vid-glow-ring
          const video=document.getElementById('hero-video');
          const fallback=document.getElementById('vid-fallback');
          if ( !wrapper || !video) return;

          const loadVideo=()=> {
            // 🔥 Optimization: Removed cache-buster ?v= to allow browser to cache video
            video.src='assets/unboxing.mp4';
            video.load();

            video.play().catch(()=> {});

            const obs=new IntersectionObserver(entries=> {
                entries.forEach(en=> {
                    if (en.isIntersecting) {
                      wrapper.classList.add('vid-visible');
                      obs.disconnect();
                    }
                  });
              }

              , {
              threshold: 0.1
            });
          obs.observe(wrapper);

          if (wrapper.getBoundingClientRect().top < window.innerHeight) {
            wrapper.classList.add('vid-visible');
          }

          video.addEventListener('playing', ()=> {
              if (fallback) {
                fallback.style.transition='opacity 0.3s'; fallback.style.opacity='0';
              }
            }

            , {
            once: true
          });
        }

        ;

        // 🔥 Optimization: No more deferral. Load immediately.
        loadVideo();
        }

        /* ─── PREMIUM 3D CARD STORM ─── */
        function initHeroParticles() {
          const hero=document.querySelector('.hero');
          if ( !hero) return;

          const container=document.createElement('div');
          container.className='hero-particles';
          hero.insertBefore(container, hero.firstChild);

          const CARD_COUNT=18;
          const suits=['♠', '♥', '♦', '♣'];
          const values=['A', 'K', 'Q', 'J', '10'];

          function spawnCard() {
            const wrap=document.createElement('div');
            wrap.className='flying-card-wrap';

            const sx=Math.random() * window.innerWidth;
            const ex=sx + (Math.random() - 0.5) * 400;
            const sz=-500 + Math.random() * 1000;
            const ez=sz + (Math.random() - 0.5) * 500;
            const dur=10 + Math.random() * 15;
            const op=0.1 + Math.random() * 0.4;

            wrap.style.setProperty('--sx', `$ {
                sx
              }

              px`);

            wrap.style.setProperty('--ex', `$ {
                ex
              }

              px`);

            wrap.style.setProperty('--sz', `$ {
                sz
              }

              px`);

            wrap.style.setProperty('--ez', `$ {
                ez
              }

              px`);
            wrap.style.setProperty('--op', op);

            // Random drift speed
            wrap.style.animation=`float-3d $ {
              dur
            }

            s linear infinite`;

            wrap.style.animationDelay=`-$ {
              Math.random() * dur
            }

            s`;

            const suit=suits[Math.floor(Math.random() * suits.length)];
            const val=values[Math.floor(Math.random() * values.length)];
            const color=(suit==='♥' || suit==='♦') ? '#ff003c' : '#000';

            wrap.innerHTML=` <div class="flying-card" style="--dur: ${5 + Math.random() * 5}s" > <div class="f-card-face f-card-front" style="color:${color}" > <div style="position:absolute;top:5px;left:5px;font-size:10px;line-height:1;font-weight:900" >$ {
              val
            }

            <br>$ {
              suit
            }

            </div> <span>$ {
              suit
            }

            </span> <div style="position:absolute;bottom:5px;right:5px;font-size:10px;line-height:1;font-weight:900;transform:rotate(180deg)" >$ {
              val
            }

            <br>$ {
              suit
            }

            </div> </div> <div class="f-card-face f-card-back" ></div> </div> `;

            container.appendChild(wrap);
          }

          for (let i=0; i < CARD_COUNT; i++) spawnCard();
        }


        function initOverlayParticles(canvasId, overlayId) {
          if (overlayId==='reg-ov') {
            const overlay=document.getElementById(overlayId);

            if (overlay && !overlay.querySelector('.falling-items-container')) {
              initFallingRegItems(overlayId);
            }

            return;
          }

          const overlay=document.getElementById(overlayId);
          const canvas=document.getElementById(canvasId);
          if ( !canvas || !overlay) return;
          const ctx=canvas.getContext('2d');
          const PARTICLE_COUNT=30;
          let particles=[];
          let W, H;

          function resize() {
            if ( !overlay.classList.contains('open')) return;
            W=canvas.width=window.innerWidth;
            H=canvas.height=window.innerHeight;
          }

          resize();

          window.addEventListener('resize', resize, {
            passive: true
          });

        function makeParticle() {
          return {
            x: Math.random() * (W || window.innerWidth),
            y: Math.random() * (H || window.innerHeight),
            r: 1.2 + Math.random() * 2.5,
            vx: (Math.random() - 0.5) * 0.3,
            vy: -(0.25 + Math.random() * 0.55),
            opacity: 0.15 + Math.random() * 0.55,
            opDir: Math.random() < 0.5 ? 1 : -1,
            blur: 1 + Math.random() * 3
          }

          ;
        }

        for (let i=0; i < PARTICLE_COUNT; i++) particles.push(makeParticle());

        function draw() {
          if ( !overlay.classList.contains('open')) {
            requestAnimationFrame(draw);
            return;
          }

          if ( !W || !H) resize();
          ctx.clearRect(0, 0, W, H);

          particles.forEach(p=> {
              ctx.save();
              ctx.globalAlpha=Math.max(0.05, Math.min(1, p.opacity));
              ctx.shadowColor='rgba(232, 84, 26, 0.9)';
              ctx.shadowBlur=p.blur * 8;

              ctx.fillStyle=`rgba(255, $ {
                  80 + Math.random() * 30 | 0
                }

                , 20, 1)`;
              ctx.beginPath();
              ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
              ctx.fill();
              ctx.restore();
              p.x +=p.vx;
              p.y +=p.vy;
              p.opacity +=0.003 * p.opDir;
              if (p.opacity > 0.75 || p.opacity < 0.08) p.opDir *=-1;

              if (p.y < -8 || p.x < -8 || p.x > W + 8) {
                Object.assign(p, makeParticle(), {
                  y: H + 5, x: Math.random() * W
                });
            }
          });
        requestAnimationFrame(draw);
        }

        draw();
        }

        function initFallingRegItems(overlayId) {
          const overlay=document.getElementById(overlayId);
          if ( !overlay) return;

          const container=document.createElement('div');
          container.className='falling-items-container';
          overlay.insertBefore(container, overlay.firstChild);

          const ITEM_COUNT=10;

          for (let i=0; i < ITEM_COUNT; i++) {
            const item=document.createElement('div');
            item.className='falling-item reg-item-coin';

            let xPos, yPos;

            // Logic to avoid the center area where the card sits
            if (i < 4) {
              // 4 coins in the far corners
              xPos=i % 2===0 ? Math.random() * 15 : 85 + Math.random() * 10;
              yPos=i < 2 ? Math.random() * 15 : 85 + Math.random() * 10;
            }

            else if (i < 8) {
              // 4 coins on the very far left/right edges
              xPos=i % 2===0 ? Math.random() * 8 : 92 + Math.random() * 8;
              yPos=20 + Math.random() * 60;
            }

            else {
              // 2 coins at the very top/bottom edges
              xPos=20 + Math.random() * 60;
              yPos=i===8 ? Math.random() * 8 : 92 + Math.random() * 8;
            }

            const rot=Math.random() * 360;
            const scale=0.9 + Math.random() * 0.3;

            item.style.left=`$ {
              xPos
            }

            %`;

            item.style.top=`$ {
              yPos
            }

            %`;

            item.style.transform=`rotate($ {
                rot
              }

              deg) scale($ {
                scale
              })`;
            item.style.zIndex=Math.floor(Math.random() * 10);

            container.appendChild(item);
          }
        }



        /* ════════ OUTLINE + TICKER ════════ */
        function buildObs() {
          const w=["CSEUTSAV'26", 'JACKPOT', 'ULTIMATE STAKES', 'THE FLOOR'];
          const d=[...w, ...w, ...w, ...w, ...w, ...w];

          document.getElementById('obs').innerHTML=d.map(x=> `<span class="obi" >$ {
              x
            }

            </span>`).join('');
        }

        function buildTicker() {
          const items=["CSEUTSAV'26 2K26", 'STAKES ARE HIGH', 'JACKPOT WAITING', 'PLACE YOUR BETS', 'VIP ACCESS ONLY', 'JOIN THE FLOOR'];
          const d=[...items, ...items];

          document.getElementById('ticker').innerHTML=d.map(t=> `<div class="ti" >$ {
              t
            }

            <div class="td" ></div></div>`).join('');
        }

        /* ════════ RENDER TILES ════════ */
        /* ════════ RENDER TILES (CASINO STYLE) ════════ */
        function renderTile(e, isFeatured) {
          const suits=[ {
            s: '♠', c: 'var(--gold)'
          }

          ,
          {
          s: '♥', c: '#ff4d4d'
        }

        ,
        {
        s: '♦', c: '#ff4d4d'
        }

        ,
        {
        s: '♣', c: '#ffffff'
        }

        ];
        // Use a consistent suit based on event name length or ID to avoid flickering on re-renders
        const suitIdx=(e.name.length) % 4;
        const suitObj=suits[suitIdx];
        const iconColor=suitObj.c;
        const casinoIcon=suitObj.s;

        const hasConflict= ! !e.isSimultaneous;

        const teamText=getTeamLabel(e.minTeam, e.maxTeam, e.type, e.id);

        return ` <div class="ev-tile" onclick="triggerDetailsTransition('${e.id}', this)"

        style="display:flex; flex-direction:column; background:rgba(12,12,12,0.6); backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px); border:1px solid rgba(212,175,55,0.2); border-radius:18px; overflow:hidden; transition:all 0.4s cubic-bezier(0.4, 0, 0.2, 1); min-height:360px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);" > <div class="ev-tile-top" style="position: relative; aspect-ratio: 16/11; overflow:hidden;" > <img src="${e.poster}" style="width:100%; height:100%; object-fit:cover;" alt="${e.name}" > < !-- Gradient Overlay for Name --> <div style="position:absolute; inset:0; background:linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 40%);" ></div> < !-- Suit Icon --> <div style="position:absolute; top:12px; right:12px; background:rgba(0,0,0,0.6); backdrop-filter:blur(5px); color:${iconColor}; padding:6px 12px; border-radius:8px; font-weight:900; font-size:16px; border:1px solid ${iconColor}66;" >$ {
          casinoIcon
        }

        </div> < !-- Cinematic Name Overlay --> <div style="position:absolute; bottom:12px; left:16px; right:16px; font-family:'Barlow Condensed',sans-serif; font-size:22px; font-weight:950; color:#fff; text-transform:uppercase; letter-spacing:1px; line-height:1.1; text-shadow:0 2px 10px rgba(0,0,0,0.8);" > $ {
          e.name
        }

        </div> </div> <div class="ev-tile-body" style="padding: 22px; display: flex; flex-direction: column; flex: 1; gap: 16px;" > <div style="display: flex; flex-direction: column; gap: 14px;" > < !-- Full Time Range --> <div style="display:flex; align-items:center; gap:14px; font-size:12px; font-weight:800; color:${hasConflict ? '#ff4d4d' : 'var(--gold)'}; letter-spacing:0.8px;" > <span style="font-size:16px; width:20px; text-align:center;" >⏰</span> $ {
          e.time
        }

        </div> < !-- Members --> <div style="display:flex; align-items:center; gap:14px; font-size:12px; font-weight:700; color:#ddd;" > <span style="color:${iconColor}; font-size:16px; width:20px; text-align:center;" >$ {
          casinoIcon
        }

        </span> $ {
          teamText
        }

        </div> < !-- Date --> <div style="display:flex; align-items:center; gap:14px; font-size:12px; font-weight:800; color:#fff;" > <span style="font-size:16px; width:20px; text-align:center;" >📅</span> $ {
          e.date
        }

        </div> </div> <div style="margin-top: auto;" > <div class="ev-tile-link" style="border: 1px solid var(--gold); background: rgba(212,175,55,0.05); color: var(--gold); font-weight: 800; letter-spacing: 2px; padding: 12px; border-radius: 10px; text-transform: uppercase; text-align: center; font-size: 11px; transition: all 0.3s ease;" > REGISTER NOW <span style="margin-left: 5px;" >→</span> </div> </div> </div> </div> `;
        }

        function renderTiles() {
          const techEvs=EVS.filter(e=> String(e.category).toLowerCase().includes('technical') && !String(e.category).toLowerCase().includes('non'));
          const nonTechEvs=EVS.filter(e=> String(e.category).toLowerCase().includes('non-technical'));
          const culturalEvs=EVS.filter(e=> String(e.category).toLowerCase().includes('cultural'));

          document.getElementById('ev-tiles').innerHTML=` <style>

          /* scoped fix: remove 3D rotation and gradient overlay for this events section */
          #ev-tiles .ev-tile::before {
            display: none !important;
          }

          #ev-tiles .ev-tile {
            border: 1px solid rgba(212, 175, 55, 0.35) !important;
            min-height: unset !important;
            background: #0a0a0a !important;
            transition: transform 0.2s ease, box-shadow 0.2s ease !important;
          }

          #ev-tiles .ev-tile:hover {
            transform: scale(1.02) !important;
            box-shadow: 0 0 18px rgba(212, 175, 55, 0.25), 0 10px 25px rgba(0, 0, 0, 0.8) !important;
            border-color: rgba(212, 175, 55, 0.8) !important;
          }
      </style>
      <div style="grid-column:1/-1;margin-bottom:20px;text-align:center">
        <h2
          style="font-family:'Barlow Condensed',sans-serif;font-size:42px;font-weight:900;color:var(--gold);text-transform:uppercase;letter-spacing:10px;margin-bottom:10px">
          The High Stakes</h2>
        <div style="width:100px;height:3px;background:var(--gold);margin:0 auto"></div>
      </div>

      <div style="grid-column:1/-1;margin-bottom:20px">
        <div class="casino-badge">TECHNICAL PLAYS</div>
      </div>
      ${techEvs.map(e => renderTile(e, false)).join('')}

      <div style="grid-column:1/-1;margin-top:50px;margin-bottom:20px">
        <div class="casino-badge">NON-TECHNICAL GAMES</div>
      </div>
      ${nonTechEvs.map(e => renderTile(e, false)).join('')}

      <div style="grid-column:1/-1;margin-top:50px;margin-bottom:20px">
        <div class="casino-badge">CULTURAL REGISTRATION</div>
      </div>
      ${culturalEvs.map(e => renderTile(e, false)).join('')}
      `;
      }

      /* ════════ CONTACTS ════════ */
      let COMMITTEE = [];


      function getInitials(name) {
      return name.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();
      }

      function renderComm() {
      // Bounty values by role
      function getBounty(role) {
      const r = (role || '').toLowerCase();
      if (r.includes('symposium coordinator') || r.includes('asst. prof')) return ['12,00,000', true];
      if (r.includes('president') && !r.includes('joint')) return ['10,00,000', false];
      if (r.includes('treasurer') && !r.includes('joint')) return ['9,00,000', false];
      if (r.includes('secretary') && !r.includes('joint')) return ['8,50,000', false];
      if (r.includes('web admin') || r.includes('digital architect') || r.includes('web')) return ['8,00,000', false];
      if (r.includes('joint president')) return ['7,00,000', false];
      if (r.includes('joint secretary')) return ['6,50,000', false];
      if (r.includes('joint treasurer')) return ['6,00,000', false];
      if (r.includes('head coordinator')) return ['5,00,000', false];
      if (r.includes('joint coordinator')) return ['2,50,000', false];
      if (r.includes('multimedia')) return ['1,00,000', false];
      return ['1,00,000', false];
      }

      document.getElementById('comm-list').innerHTML = COMMITTEE.map(c => {
      const initials = getInitials(c.name);
      const hasRealPhoto = c.img && !c.img.includes('ui-avatars.com');
      const [bountyNum, isFaculty] = getBounty(c.role);
      const isCallable = c.phone && c.phone !== 'Asst. Prof' && c.phone !== '+910000000000';

      const opos = (c.imgStyle && c.imgStyle.includes('top')) ? 'top center' : 'center top';
      // Apply Red color to Top 7 Leadership members, Dark for others
      // Apply Dark color to ALL roles as per latest request (matching Asst. Prof)
      let roleClass = 'role-dark';
      let displayRole = c.role;

      if (c.name === 'Sriram S') {
      displayRole = 'WEB ADMIN & JOINT COORDINATOR';
      }




      // Prioritize the first 10 members to load in the "first load" itself
      const listIndex = COMMITTEE.indexOf(c);
      const isEager = listIndex < 10; const photoContent=hasRealPhoto ? `<img src="${c.img}" alt="${c.name}"
        loading="${isEager ? 'eager' : 'lazy'}" ${isEager ? 'fetchpriority="high"' : '' } decoding="async"
        style="width:100%;height:100%;object-fit:cover;object-position:${opos};display:block;filter:sepia(0.08) contrast(1.22) brightness(1.02); background: rgba(0,0,0,0.15);"
        onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
        <div class="wp-initials-fallback" style="display:none;">${initials}</div>`
        : `<div class="wp-initials-fallback">${initials}</div>`;


        return `
        <div class="wanted-poster ${roleClass}">
          <div class="wp-inner">
            <!-- WANTED -->
            <div class="wp-wanted">WANTED</div>
            <div class="wp-rule"></div>

            <!-- PHOTO -->
            <div class="wp-photo-wrap">${photoContent}</div>

            <!-- DOA line -->
            <div class="wp-rule-sm"></div>
            <div class="wp-doa">
              <span class="wp-doa-orn">&#10022;</span>
              DEAD OR ALIVE
              <span class="wp-doa-orn">&#10022;</span>
            </div>
            <div class="wp-rule-sm"></div>

            <!-- Name -->
            <div class="wp-name" title="${c.name}">${c.name}</div>
            <!-- Role -->
            <div class="wp-role">${displayRole}</div>
            <!-- Event Tag -->
            ${c.dept ? `<div class="wp-event-tag">#${c.dept}</div>` : ''}

            <!-- Bounty ฿ row -->
            <div class="wp-bounty-row">
              <span class="wp-berry">฿</span>
              <span class="wp-amount">${bountyNum}-</span>
            </div>

            <!-- Fine print -->
            <div class="wp-fine">KONO MEMBER WA CSEUTSAV'26 EVENTS NI TOKOU SURU JITSUZAISURU JINBUTSU DESU. SHITAISHO
              SHITEMO IISAI MUKANKEDETH.</div>
          </div>

          <!-- Bottom strip: MARINE + Contact -->
          <div class="wp-bottom-strip">
            <span class="wp-marine">MARINE</span>
            ${isCallable
            ? `<a href="tel:${c.phone}" class="wp-call-btn">
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path
                  d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5 19.79 19.79 0 0 1 1.61 4.9 2 2 0 0 1 3.6 2.68h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 10a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21.5 17z" />
              </svg>
              CONTACT
            </a>`
            : `<span class="wp-call-btn" style="opacity:0.35;cursor:default;pointer-events:none;">FACULTY</span>`
            }
          </div>
        </div>`;
        }).join('');
        }

        function renderContacts() {
        document.getElementById('cg').innerHTML = CONTACTS.map(c => `
        <a class="cc" href="tel:${c.phone}">
          <div class="cc-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path
                d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5 19.79 19.79 0 0 1 1.61 4.9 2 2 0 0 1 3.6 2.68h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 10a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21.5 17z" />
            </svg></div>
          <div class="cc-info">
            <div class="cc-role">${c.role}</div>
            <div class="cc-name">${c.name}</div>
            <div class="cc-ph">${c.phone}</div>
          </div>
        </a>
        `).join('');
        }

        /* ════════ STATS ════════ */
        function animStats() {
        function count(el, target, suffix, dur) {
        let v = 0, step = target / 50;
        const t = setInterval(() => { v += step; if (v >= target) { v = target; clearInterval(t); } el.textContent =
        Math.floor(v) + suffix; }, dur / 50);
        }
        const obs = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
        const sev = document.getElementById('sev');
        const spr = document.getElementById('spr');
        if (sev) count(sev, 10, '', 700);
        if (spr) count(spr, 33, 'K+', 900);
        obs.disconnect();
        }
        }, { threshold: .4 });
        const target = document.getElementById('sev');
        if (target) obs.observe(target);
        }

        /* ════════ EVENT MODAL ════════ */
        function triggerDetailsTransition(id, el) {
        if (el) {
        playMechanicalSnap();
        doHapticSnap();
        }
        const success = openEvMod(id);
        if (success) {
        // If coming from the "All Events" overlay, close it and balance UI counter
        if (el && el.closest('#allev-list')) {
        document.getElementById('allev-ov').classList.remove('open');
        showSiteUI();
        }
        }
        }

        function openEvMod(id) {
        const e = EVS.find(ev => ev.id === id); if (!e) return;
        const casinoIcons = {
        'Technical': '⚡',
        'Management': '💰',
        'Gaming': '🎮',
        'Design': '🎨',
        'Coding': '🎯'
        };
        let icon = casinoIcons[e.category] || '♣';

        document.getElementById('esc').innerHTML = `
        <div class="snooker-felt-overlay" id="individual-ev-ov" style="display:flex;">
          <div class="snooker-table-canvas">
            <div class="snooker-pocket pk-tl"></div>
            <div class="snooker-pocket pk-tr"></div>
            <div class="snooker-pocket pk-bl"></div>
            <div class="snooker-pocket pk-br"></div>
            <div class="snooker-pocket pk-ml"></div>
            <div class="snooker-pocket pk-mr"></div>

            <div class="snooker-ball ball-red" style="top:15%; left:10%;"></div>
            <div class="snooker-ball ball-white" style="bottom:20%; right:15%;"></div>
            <div class="snooker-ball ball-black" style="top:40%; right:8%;"></div>

            <div style="position:absolute;top:max(15px, env(safe-area-inset-top, 15px));right:15px;z-index:99999;">
              <button class="ev-modal-close-btn"
                style="background:rgba(0,0,0,0.65); backdrop-filter:blur(15px) saturate(180%); -webkit-backdrop-filter:blur(15px) saturate(180%); border:1px solid rgba(255,255,255,0.25); padding:10px 18px; border-radius:30px; color:#fff; font-size:12px; font-weight:800; cursor:pointer; letter-spacing:1.5px; text-transform:uppercase; box-shadow:0 6px 20px rgba(0,0,0,0.4); font-family:'Barlow Condensed',sans-serif;"
                onclick="closeEvMod(null,1)">✕ CLOSE</button>
            </div>

            <div
              style="width:100%; max-width:600px; position:relative; z-index:5; padding:10px; display:flex; flex-direction:column; align-items:center;">
              <div style="text-align:center; margin-bottom:25px;">
                <div
                  style="width:70px;height:70px;border-radius:18px;background:rgba(10,10,10,0.9);border:2px solid rgba(212,175,55,0.5);display:flex;align-items:center;justify-content:center;font-size:32px;margin:0 auto 12px;box-shadow:0 8px 25px rgba(0,0,0,0.5); color:var(--gold);">
                  ${icon}</div>
                <h1
                  style="font-family:'Barlow Condensed',sans-serif;font-size:clamp(28px, 6vw, 36px);font-weight:950;color:#fff;text-transform:uppercase;letter-spacing:1px;line-height:1;margin:0 0 5px 0;">
                  ${e.name}</h1>
                <div
                  style="font-family:'Outfit',sans-serif;font-size:13px;color:var(--gold);font-weight:800;letter-spacing:2px;text-transform:uppercase">
                  ${e.label}</div>
              </div>

              <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;width:100%;margin-bottom:20px;">
                ${[['📅 Date', e.date], ['⏰ Time', e.time], ['📍 Venue', e.venue], ['👥 Team', getTeamLabel(e.minTeam,
                e.maxTeam, e.type, e.id)]].map(([l, t]) => `
                <div
                  style="padding:12px;background:rgba(0,0,0,0.5);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.1);border-radius:10px;">
                  <div
                    style="font-size:9px;font-weight:900;color:var(--gold);text-transform:uppercase;letter-spacing:1px;margin-bottom:3px; opacity:0.7">
                    ${l}</div>
                  <div style="font-size:13px;font-weight:700;color:#fff;">${t}</div>
                </div>
                `).join('')}
              </div>

              <p
                style="font-size:13px;color:rgba(255,255,255,0.8);line-height:1.5;margin-bottom:25px;text-align:center;">
                ${e.desc}</p>

              <div
                style="width:100%;background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.05);border-radius:12px;padding:15px;margin-bottom:25px;">
                <div
                  style="font-size:11px;font-weight:900;color:var(--gold);text-transform:uppercase;letter-spacing:2px;margin-bottom:10px;text-align:center;border-bottom:1px solid rgba(212,175,55,0.2);padding-bottom:5px;">
                  Table Rules</div>
                <div style="font-size:12px;color:rgba(255,255,255,0.7);line-height:1.4;">
                  ${e.rules.map((r, i) => `<div style="margin-bottom:8px;display:flex;gap:10px;"><span
                      style="color:var(--gold);font-weight:900;">0${i + 1}</span><span>${r}</span></div>`).join('')}
                </div>
              </div>

              <button onclick="closeEvMod();openReg('${e.id}')"
                style="width:100%; padding:15px; border-radius:10px; background:var(--gold); color:#000; font-family:'Barlow Condensed',sans-serif; font-weight:950; text-transform:uppercase; letter-spacing:1px; border:none; cursor:pointer; font-size:16px;box-shadow:0 8px 20px rgba(212,175,55,0.3);">RESERVE
                YOUR SEAT</button>
              <div
                style="text-align:center; margin-top:10px; font-size:9px; color:rgba(255,255,255,0.4); letter-spacing:1px; text-transform:uppercase;">
                Processed via Google Cloud</div>
            </div>
          </div>`;
          const modal = document.getElementById('ev-modal');
          if (modal) {
          modal.classList.add('open');
          hideDock();
          return true;
          }
          return false;
          }
          function closeEvMod(ev, f) {
          if (f || (ev && ev.target === document.getElementById('ev-modal'))) {
          document.getElementById('ev-modal').classList.remove('open');
          showDock(); // RESTORE NAV AND LOGO
          }
          }

          /* ════════ REGISTER FLOW ════════ */
          function evSummaryCard(id) {
          const e = EVS.find(ev => ev.id === id); if (!e) return '';
          return `<div class="ev-summary-card">
            <div class="esc-accent"></div>
            <div style="display:flex;align-items:center;gap:10px;flex:1;overflow:hidden;">
              <div class="esc-icon" style="width:28px;height:28px;font-size:14px;background:rgba(212,175,55,0.1);">
                ${e.icon}</div>
              <div style="overflow:hidden;">
                <div class="esc-name" style="font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                  ${e.name}</div>
                <div class="esc-meta" style="font-size:8px;opacity:0.7;">${e.label} · ${getTeamLabel(e.minTeam,
                  e.maxTeam, e.type, e.id)}</div>
              </div>
            </div>
            <button class="esc-change"
              style="padding:6px 12px;font-size:9px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:6px;color:var(--gold);font-weight:800;text-transform:uppercase;"
              onclick="clearEvent()">Change</button>
          </div>`;
          }

          function showError(title, reason, desc) {
          document.getElementById('err-title').textContent = title;
          document.getElementById('err-reason').textContent = reason;
          document.getElementById('err-desc').textContent = desc;
          document.getElementById('err-ov').classList.add('open');
          }


          let revealTimeouts = [];
          function skipAllReveals() {
          revealTimeouts.forEach(t => clearTimeout(t));
          revealTimeouts = [];
          document.querySelectorAll('.master-card-prop').forEach(card => {
          card.style.animation = 'none'; card.style.opacity = '1';
          card.style.transform = 'none';
          });
          const btn = document.getElementById('skip-reveal'); if (btn) btn.remove();
          }

          function doHapticSnap() {
          if (window.navigator && window.navigator.vibrate) {
          window.navigator.vibrate(20);
          }
          }

          function playMechanicalSnap() {
          try {
          const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          const now = audioCtx.currentTime;
          const o = audioCtx.createOscillator(); const g = audioCtx.createGain();
          o.connect(g); g.connect(audioCtx.destination);
          o.type = 'triangle'; o.frequency.setValueAtTime(600, now);
          o.frequency.exponentialRampToValueAtTime(1400, now + 0.08);
          g.gain.setValueAtTime(0.04, now); g.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
          o.start(); o.stop(now + 0.15);
          } catch (e) { }
          }

          function openReg(evId) {
          hideDock();
          revealTimeouts.forEach(t => clearTimeout(t)); revealTimeouts = [];
          if (isCooldown) {
          document.getElementById('reg-ov').classList.add('open');
          document.getElementById('reg-rsc').style.display = 'none';
          document.getElementById('cooldown-wall').style.display = 'flex';
          const wt = document.getElementById('wall-timer'); if (wt) wt.textContent = globalCooldownTime + 's';
          return;
          }
          document.getElementById('reg-rsc').style.display = 'block';
          const cw = document.getElementById('cooldown-wall'); if (cw) cw.style.display = 'none';
          resetRegState();
          currentEv = evId ? EVS.find(e => e.id === evId) : null;
          currentStep = 0;
          teamMembers = [];
          selectedTeamSize = 0;

          const selectionArea = document.getElementById('reg-selection-area');
          const regSheet = document.getElementById('reg-sheet');
          const summary1 = document.getElementById('ev-summary-here');
          const summary2 = document.getElementById('ev-summary-here2');

          if (currentEv === null) {
          selectionArea.style.display = 'block';
          regSheet.style.display = 'none';

          const techEvs = EVS.filter(e => String(e.category).toLowerCase().includes('technical') &&
          !String(e.category).toLowerCase().includes('non'));
          const nonTechEvs = EVS.filter(e => String(e.category).toLowerCase().includes('non-technical'));
          const culturalEvs = EVS.filter(e => String(e.category).toLowerCase().includes('cultural'));

          function evRow(e, globalIdx) {
          const players = getTeamLabel(e.minTeam, e.maxTeam, e.type, e.id);
          const delay = globalIdx * 350;
          revealTimeouts.push(setTimeout(() => {
          if (document.getElementById('reg-ov').classList.contains('open')) {
          playMechanicalSnap();
          doHapticSnap();
          }
          }, delay));

          return `
          <div onclick="selectEventInTable('${e.id}')" class="master-card-prop" style="animation-delay: ${delay}ms">
            <div class="card-inner">
              <div class="card-face card-face-back">
                <div class="master-tarot-pattern"></div>
                <div class="master-sun-core"></div>
              </div>
              <div class="card-face face-master" style="border: 2px solid #fff; outline: 1px solid var(--orange)">
                <div class="master-event-icon" style="font-size: 20px; margin-bottom: 5px;">${e.icon}</div>
                <div class="master-event-name"
                  style="font-size: 11px; font-weight:950; min-height:30px; display:flex; align-items:center; justify-content:center;">
                  ${e.name}</div>
                <div class="master-event-cat" style="font-size: 7px; color: var(--orange); margin-top:-2px;">${e.label}
                </div>
                <div class="master-footer" style="padding-top: 3px; font-size: 8px; margin-top:auto;">
                  <span>👥 ${players}</span>
                </div>
              </div>
            </div>
          </div>`;
          }

          selectionArea.innerHTML = `
          <div class="reg-selection-env">
            <div class="reg-felt-surface">
              <div class="cup-holder cu1"></div>
              <div class="cup-holder cu2"></div>
              <div class="cup-holder cu3"></div>
              <div class="cup-holder cu4"></div>
              <div class="table-lines"></div>
              <div class="poker-chip chip-red" style="top:12%; left:8%; --r:-15deg"></div>
              <div class="poker-chip chip-blue" style="top:18%; left:12%; --r:25deg"></div>
              <div class="poker-chip chip-gold" style="bottom:15%; right:10%; --r:10deg"></div>
            </div>

            <button class="reg-close-btn"
              style="position:fixed; top:15px; right:15px; z-index:2100; background:rgba(255,255,255,0.05); backdrop-filter:blur(15px) saturate(180%); -webkit-backdrop-filter:blur(15px) saturate(180%); border:1px solid rgba(255,255,255,0.15); padding:8px 18px; border-radius:14px; color:#fff; font-size:10px; font-weight:800; cursor:pointer; letter-spacing:1.5px; text-transform:uppercase; box-shadow:0 8px 32px rgba(0,0,0,0.3); font-family:'Barlow Condensed',sans-serif; white-space:nowrap;"
              onclick="playMechanicalSnap(); doHapticSnap(); forceCloseReg()">✕ CLOSE</button>
            <div class="fc-t gold-text"
              style="font-size:clamp(22px, 8vw, 30px); margin-top: 15px; margin-bottom:5px; font-weight:950; letter-spacing:2px; text-shadow:0 0 30px rgba(212,175,55,0.8); text-align:left !important; margin-left:0 !important; padding-left:10px !important; width:100% !important; align-self:flex-start !important; display:flex !important; justify-content:flex-start !important;">
              SNOOKER <span style="color:var(--gold)">LOUNGE ♠</span></div>
            <div
              style="font-size:9px; color:rgba(255,255,255,0.4); margin-bottom:10px; text-align:left !important; margin-left:0 !important; padding-left:10px !important; font-weight:900; letter-spacing:2px; text-transform:uppercase; opacity:0.6; width:100% !important; align-self:flex-start !important; display:flex !important; justify-content:flex-start !important;">
              UTSAV 2K26 EDITION · CLICK TO RESERVE</div>

            <div class="cinematic-card-viewport"
              style="padding: 0 5px; margin-bottom:60px; display:grid; grid-template-columns: repeat(auto-fill, minmax(105px, 1fr)); gap:10px; width:100%; align-self:center;">
              ${techEvs.map((e, i) => evRow(e, i)).join('')}
              ${nonTechEvs.map((e, i) => evRow(e, i + techEvs.length)).join('')}
              ${culturalEvs.map((e, i) => evRow(e, i + techEvs.length + nonTechEvs.length)).join('')}
            </div>
            <div style="height: 120px; width: 100%;"></div>
          </div>`;

          summary1.innerHTML = '';
          summary2.innerHTML = '';

          } else {
          selectionArea.style.display = 'none';
          regSheet.style.display = 'block';
          regSheet.style.background = 'var(--black2)';
          regSheet.style.borderTop = '2px solid var(--orange)';

          // Route through our single source of truth for form initialization
          selectEventInForm(currentEv.id);
          }

          const fieldsContainer = document.getElementById('reg-fields-container');
          if (fieldsContainer) {
          fieldsContainer.style.display = currentEv ? 'block' : 'none';
          }

          // Pre-fill ONLY gender from last registration — it’s safe because it doesn't depend on lookup
          // NOTE: Do NOT pre-fill regno/name/year/section — those must come from lookupStudent() to populate
          // dataset.raw correctly. Pre-filling .value without dataset.raw causes buildReview() to use
          // stale unverified data (name shows but year/section would be blank in the sheet).
          const saved = JSON.parse(localStorage.getItem('u26r') || '[]');
          if (saved.length > 0) {
          const last = saved[saved.length - 1];
          const genderEl = document.getElementById('f-gender');
          if (genderEl && !genderEl.value && last.gender) genderEl.value = last.gender;
          }

          updateStepUI();
          document.getElementById('reg-ov').classList.add('open');

          }

          /* Route register event click through the detail modal */
          function regEventDetail(id) {
          document.getElementById('reg-ov').classList.remove('open');
          showDock();
          // Open event detail modal (has About, Rules, Secure Your Spot)
          triggerDetailsTransition(id, null);
          }

          function selectEventInTable(id) {
          playMechanicalSnap();
          doHapticSnap();
          // Instead of going straight to the form, route through the detail modal
          regEventDetail(id);
          }

          function selectEventInForm(id) {
          const ev = EVS.find(e => e.id === id);
          currentEv = ev;
          const s1 = document.getElementById('ev-summary-here');
          const s2 = document.getElementById('ev-summary-here2');
          s1.innerHTML = evSummaryCard(id);
          s2.innerHTML = evSummaryCard(id);

          // ── Update the Team Size select field ──
          const sizeWrap = document.getElementById('rlt-team-size-wrap');
          const danceSizeWrap = document.getElementById('rlt-dance-size-wrap');
          const sizeSelect = document.getElementById('rlt-size-select');
          const noteEl = document.getElementById('rlt-step-note');

          if (ev.id === 'dn') {
          // Dance: Specific Year-wise branding
          if (sizeWrap) sizeWrap.style.display = 'none';
          if (danceSizeWrap) danceSizeWrap.style.display = 'none';
          selectedTeamSize = 1;
          document.getElementById('f-dance-size').value = 1;

          if (noteEl) noteEl.textContent = '🏅 Cultural Registration · Year-wise Entry confirmed';
          ev.desc = "This is a dance event. Register to show your info in first stage. Coordinators will guide you.";

          } else if (!ev || ev.type === 'Solo' || ev.type === 'Year-wise') {
          // All other individual events (even if sheet says Year-wise, we show Solo for non-dance)
          if (sizeWrap) sizeWrap.style.display = 'none';
          if (danceSizeWrap) danceSizeWrap.style.display = 'none';
          selectedTeamSize = 1;
          if (noteEl) noteEl.textContent = 'Solo Event · No team members needed';

          } else if (ev.minTeam === ev.maxTeam) {
          if (sizeWrap) sizeWrap.style.display = 'block';
          if (danceSizeWrap) danceSizeWrap.style.display = 'none';
          if (sizeSelect) {
          sizeSelect.innerHTML = `<option value="${ev.minTeam}">${getTeamLabel(ev.minTeam, ev.maxTeam)} (FIXED)</option>
          `;
          sizeSelect.disabled = true;
          sizeSelect.style.opacity = '0.9';
          sizeSelect.style.borderColor = 'var(--gold)';
          }
          selectedTeamSize = ev.minTeam;
          if (noteEl) noteEl.textContent = `\u26a0\ufe0f Fixed Team Size \u00b7 Must add exactly ${ev.minTeam - 1}
          member(s) to form your ${getTeamLabel(ev.minTeam, ev.maxTeam).toLowerCase()}`;

          } else {
          if (sizeWrap) sizeWrap.style.display = 'block';
          if (danceSizeWrap) danceSizeWrap.style.display = 'none';
          if (sizeSelect) {
          sizeSelect.disabled = false;
          sizeSelect.style.opacity = '1';
          sizeSelect.innerHTML = '';
          for (let n = ev.minTeam; n <= Math.min(ev.maxTeam, 4); n++) { const opt=document.createElement('option');
            opt.value=n; opt.textContent=n + ' Players' ; sizeSelect.appendChild(opt); } sizeSelect.value=ev.minTeam;
            selectedTeamSize=ev.minTeam; sizeSelect.onchange=()=> { selectedTeamSize = parseInt(sizeSelect.value); };
            }
            if (noteEl) noteEl.textContent = '\u26a0\ufe0f Leader Registration \u00b7 Choose team size, then add members
            on next page';
            }

            setupTeamStep(true); // pass true to reset if it's a fresh event pick
            rltInit();

            // Reveal the form fields
            const fieldsContainer = document.getElementById('reg-fields-container');
            if (fieldsContainer) {
            fieldsContainer.style.display = 'block';
            fieldsContainer.style.animation = 'su 0.4s cubic-bezier(0.22, 0.68, 0, 1.1)';
            }
            }

            function clearEvent() {
            currentEv = null;
            openReg(null);
            }

            function forceCloseReg() {
            const regOv = document.getElementById('reg-ov');
            if (regOv) regOv.classList.remove('open');
            showDock();
            // Ensure detail modal stays closed too
            const evMod = document.getElementById('ev-modal');
            if (evMod) evMod.classList.remove('open');
            }

            function closeRegOv(e) {
            if (e.target.id === 'reg-ov') {
            forceCloseReg();
            }
            }

            function closeConf() {
            // 1. Close confirmation overlay
            const conf = document.getElementById('conf-screen');
            if (conf) conf.classList.remove('open');

            // 2. Clear registration state and reset UI locks
            resetRegState();
            forceCloseReg(); // Ensure main screen reflects reset

            // 3. Navigate home
            if (typeof dockNav === 'function') {
            dockNav('home');
            }

            // 4. Force scroll to top (Instant reset to break any sticky scroll)
            window.scrollTo({ top: 0, behavior: 'instant' });

            // 5. Ensure UI elements are visible
            showDock();
            }



            function setupTeamStep(isReset) {
            if (!currentEv) return;
            const e = currentEv;
            if (isReset) { teamMembers = []; pktDrafts = {}; }

            const room = document.getElementById('pkt-room');
            if (!room) return;

            const teamNameRow = document.querySelector('.pkt-teamname-row');
            const badge = document.getElementById('pkt-ev-badge');
            const title = document.querySelector('.pkt-title');
            const hintEl = document.getElementById('pkt-hint');

            // Pre-fill leader card from step-1 data
            const leaderName = (document.getElementById('f-name')?.value || 'You').trim();
            const leaderRegno = (document.getElementById('f-regno')?.value || '—').trim();
            const nameEl = document.getElementById('pkt-name-0');
            const regnoEl = document.getElementById('pkt-regno-0');

            if (nameEl) nameEl.textContent = leaderName || 'You';
            if (regnoEl) regnoEl.textContent = leaderRegno || '—';

            // Fetch elements to toggle text dynamically depending on event type
            const centerLogo = document.querySelector('.pkt-table-logo');
            const leaderBadge = document.querySelector('#pkt-card-0 .pkt-card-badge');

            // ── SOLO / YEAR-WISE event ──
            const isYearWise = (e.id === 'dn' || e.type === 'Year-wise');
            if (e.type === 'Solo' || isYearWise) {
            if (teamNameRow) teamNameRow.style.display = 'none';
            if (badge) badge.textContent = isYearWise ? 'Year-wise' : 'Solo Event';
            if (title) title.textContent = isYearWise ? 'YEAR-WISE ENTRY READY' : 'YOUR SEAT IS READY';
            if (hintEl) hintEl.textContent = isYearWise ? 'Year-wise Registration · Select your year below' : 'Solo
            Event · Your seat is confirmed';
            if (centerLogo) centerLogo.innerHTML = isYearWise ? 'YEAR-<br>WISE' : 'SOLO<br>PLAYER';
            if (leaderBadge) leaderBadge.textContent = isYearWise ? '♠ Year-wise' : '♠ Solo Player';

            // Hide all members slots
            for (let i = 1; i <= 3; i++) { const slotEl=document.getElementById(`pkt-slot-${i}`); if (slotEl)
              slotEl.style.display='none' ; } pktSpawnParticles(); updatePktSummaryPlate(); return; } // ── TEAM event:
              initialise poker table ── if (teamNameRow) teamNameRow.style.display='' ; if (badge)
              badge.textContent='The Syndicate' ; if (title) title.textContent='ASSEMBLE YOUR TEAM' ; if (centerLogo)
              centerLogo.innerHTML='THE<br>TABLE' ; if (leaderBadge) leaderBadge.textContent='♠ Leader' ; const
              chosenSize=selectedTeamSize || e.maxTeam; const maxSlots=Math.min(chosenSize - 1, 3); // leader=slot 0,
              members=slots 1..maxSlots // Update hint if (hintEl) hintEl.textContent=`FIXED TEAM: ${chosenSize} Players
              \u00b7 Add ${chosenSize - 1} member(s) to proceed`; // Show only the slots matching chosen team size; hide
              the rest for (let i=1; i <=3; i++) { const slotEl=document.getElementById(`pkt-slot-${i}`); const
              card=document.getElementById(`pkt-card-${i}`); if (!slotEl || !card) continue; if (i <=maxSlots) {
              slotEl.style.display='' ; card.classList.remove('pkt-card-locked'); card.onclick=()=> {
              playMechanicalSnap(); doHapticSnap(); pktOpenSlot(i); };

              // Update the visual cards from existing data
              const m = teamMembers[i - 1];
              if (m && m.name) {
              const mNameEl = document.getElementById(`pkt-name-${i}`);
              const mRegnoEl = document.getElementById(`pkt-regno-${i}`);
              const mStatusEl = document.getElementById(`pkt-status-${i}`);
              if (mNameEl) mNameEl.textContent = m.name;
              if (mRegnoEl) mRegnoEl.textContent = m.regno.slice(0, 12) + (m.regno.length > 12 ? '…' : '');
              if (mStatusEl) { mStatusEl.textContent = '● Added'; mStatusEl.className = 'pkt-card-status
              pkt-status-added'; }
              card.className = 'pkt-player-card pkt-card-added';
              } else {
              pktResetSlotDisplay(i);
              }
              } else {
              slotEl.style.display = 'none'; // hide unused slots entirely
              card.onclick = null;
              }
              }

              // Spawn particles
              pktSpawnParticles();

              // Sync team-name visual → hidden input
              const visInput = document.getElementById('pkt-teamname-vis');
              if (visInput) {
              visInput.oninput = () => { document.getElementById('f-teamname').value = visInput.value; };
              }

              updatePktSummaryPlate();
              }

              /* ── Poker Table Helpers ── */

              function updatePktSummaryPlate() {
              const p = document.getElementById('pkt-summary-plate');
              if (!p || !currentEv) return;

              const ldrNameEl = document.getElementById('summ-ldr-name');
              const selNameEl = document.getElementById('summ-team-sel');

              const ldrName = (document.getElementById('f-name')?.value || 'You').trim();
              if (ldrNameEl) ldrNameEl.textContent = ldrName;

              if (currentEv.type === 'Solo') {
              if (selNameEl) selNameEl.innerHTML = '<span style="color:#fff;font-size:15px;">SOLO</span>';
              } else {
              const requiredMembers = (selectedTeamSize || currentEv.maxTeam);
              const labels = { 2: 'DUO', 3: 'TRIPLETS', 4: 'SQUAD', 5: 'SUPER SQUAD' };
              const label = labels[requiredMembers] || requiredMembers + ' PLAYERS';
              let count = 0;
              for (let i = 0; i < requiredMembers - 1; i++) { const m=teamMembers[i]; if (m && m.name && m.regno &&
                m.phone && m.gender && m.year && m.section) { count++; } } if (selNameEl) selNameEl.innerHTML=`<span
                style="color:#fff;font-size:15px;">${label}</span> <span
                  style="font-size:9px;color:rgba(255,255,255,0.4);display:block;">(${count + 1}/${requiredMembers}
                  COMPLETE)</span>`;
                }
                }

                function pktSpawnParticles() {
                const c = document.getElementById('pkt-particles-container');
                if (!c) return;
                c.innerHTML = '';
                const colors = ['rgba(180,80,255,0.7)', 'rgba(212,175,55,0.6)', 'rgba(255,255,255,0.4)',
                'rgba(140,50,220,0.5)'];
                for (let i = 0; i < 18; i++) { const p=document.createElement('div'); p.className='pkt-particle' ; const
                  size=Math.random() * 4 + 1.5; p.style.cssText=` width:${size}px; height:${size}px;
                  left:${Math.random() * 100}%; bottom:${Math.random() * 30}%;
                  background:${colors[Math.floor(Math.random() * colors.length)]}; animation-duration:${3 +
                  Math.random() * 5}s; animation-delay:${Math.random() * 4}s; box-shadow:0 0 ${size * 2}px
                  ${colors[Math.floor(Math.random() * colors.length)]}; `; c.appendChild(p); } } /* ── Roulette room
                  initialiser (Step 0) ── */ function rltInit() { // Spawn roulette number labels around outer ring
                  const numsEl=document.getElementById('rlt-nums'); if (numsEl) { numsEl.innerHTML='' ; const
                  rouletteNums=[0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1,
                  20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26]; const total=rouletteNums.length;
                  rouletteNums.forEach((n, i)=> {
                  const lbl = document.createElement('span');
                  lbl.className = 'rlt-num-label';
                  lbl.textContent = n;
                  const deg = (360 / total) * i;
                  const isRed = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36].includes(n);
                  lbl.style.cssText = `
                  transform: rotate(${deg}deg);
                  color: ${n === 0 ? 'rgba(80,220,80,0.6)' : isRed ? 'rgba(220,30,50,0.65)' : 'rgba(212,175,55,0.45)'};
                  `;
                  numsEl.appendChild(lbl);
                  });
                  }
                  // Spawn ambient particles
                  const pc = document.getElementById('rlt-particles');
                  if (pc) {
                  pc.innerHTML = '';
                  const colors = ['rgba(255,30,60,0.7)', 'rgba(212,175,55,0.5)', 'rgba(255,120,120,0.4)',
                  'rgba(255,255,255,0.3)'];
                  for (let i = 0; i < 14; i++) { const p=document.createElement('div'); const sz=Math.random() * 3.5 +
                    1.5; const col=colors[Math.floor(Math.random() * colors.length)]; p.style.cssText=`
                    position:absolute; width:${sz}px; height:${sz}px; border-radius:50%; left:${Math.random() * 100}%;
                    bottom:${Math.random() * 40}%; background:${col}; box-shadow: 0 0 ${sz * 2}px ${col}; animation:
                    pkt-rise ${3 + Math.random() * 5}s ease-in infinite; animation-delay: ${Math.random() * 5}s;
                    pointer-events:none; z-index:2; `; pc.appendChild(p); } } } function pktOpenSlot(slotIdx) { if
                    (!currentEv) return; // Guard: prevent multiple overlays from flickering if
                    (document.getElementById('pkt-overlay')) return; const maxSlots=Math.min((selectedTeamSize ||
                    currentEv.maxTeam) - 1, 3); if (slotIdx> maxSlots) return;
                    pktCurrentEditSlot = slotIdx;

                    // Pre-fill if already added, or check drafts
                    const saved = teamMembers[slotIdx - 1] || {};
                    const draft = pktDrafts[slotIdx] || {};
                    const fields = {
                    name: draft.name !== undefined ? draft.name : (saved.name || ''),
                    regno: draft.regno !== undefined ? draft.regno : (saved.regno || ''),
                    gender: draft.gender !== undefined ? draft.gender : (saved.gender || ''),
                    year: draft.year !== undefined ? draft.year : (saved.year || ''),
                    section: draft.section !== undefined ? draft.section : (saved.section || ''),
                    phone: ''
                    };

                    const overlay = document.createElement('div');
                    overlay.className = 'pkt-slot-form-overlay';
                    overlay.id = 'pkt-overlay';
                    overlay.innerHTML = `
                    <div class="pkt-form-sheet">
                      <div class="pkt-form-title">Member <span>${slotIdx + 1}</span></div>
                      <div class="inline-error" id="pkt-error"></div>
                      <div id="pkt-saved-container"></div>
                      <div class="pkt-form-row">
                        <div class="pkt-fg" style="grid-column:1/-1">
                          <label>Reg Number (RegNo)</label>
                          <input id="pkt-fi-regno" type="number" inputmode="numeric" pattern="[0-9]*"
                            placeholder="e.g. 23039213104..." value="${fields.regno}"
                            oninput="this.value=this.value.replace(/[^0-9]/g,''); pktLookupMember(${slotIdx}, this.value); pktUpdateDraft(${slotIdx}, 'regno', this.value)"
                            onkeypress="return /[0-9]/.test(event.key)"
                            onpaste="setTimeout(()=>{this.value=this.value.replace(/[^0-9]/g,'');pktLookupMember(${slotIdx},this.value);pktUpdateDraft(${slotIdx},'regno',this.value);},0)">
                        </div>
                      </div>
                      <div class="pkt-form-row">
                        <div class="pkt-fg" style="grid-column:1/-1">
                          <label>Full Name</label>
                          <input id="pkt-fi-name" type="text" placeholder="Auto-filled from RegNo"
                            value="${fields.name}" readonly
                            style="background:rgba(255,255,255,0.05); cursor:not-allowed;">
                        </div>
                      </div>
                      <div class="pkt-form-row">
                        <div class="pkt-fg">
                          <label>Year</label>
                          <input id="pkt-fi-year" type="text" placeholder="Auto" value="${fields.year}" readonly
                            style="background:rgba(255,255,255,0.05); cursor:not-allowed;">
                        </div>
                        <div class="pkt-fg">
                          <label>Section</label>
                          <input id="pkt-fi-section" type="text" placeholder="Auto" value="${fields.section}" readonly
                            style="background:rgba(255,255,255,0.05); cursor:not-allowed;">
                        </div>
                      </div>
                      <div class="pkt-form-row">
                        <div class="pkt-fg" style="grid-column:1/-1">
                          <label>Gender</label>
                          <select id="pkt-fi-gender" onchange="pktUpdateDraft(${slotIdx}, 'gender', this.value)">
                            <option value="">Select Gender</option>
                            <option value="Male" ${fields.gender==='Male' ? 'selected' : '' }>Male</option>
                            <option value="Female" ${fields.gender==='Female' ? 'selected' : '' }>Female</option>
                          </select>
                        </div>
                      </div>
                      <div class="pkt-form-row" style="display:none">
                        <div class="pkt-fg" style="grid-column:1/-1">
                          <input id="pkt-fi-phone" type="hidden" value="0000000000"
                            oninput="this.value=this.value.replace(/[^0-9]/g,''); pktUpdateDraft(${slotIdx}, 'phone', this.value)">
                        </div>
                      </div>
                      <button class="pkt-form-save-btn"
                        onclick="playMechanicalSnap(); doHapticSnap(); pktSaveSlot(${slotIdx})">✦ Confirm Seat</button>
                      <button class="pkt-form-cancel-btn"
                        onclick="playMechanicalSnap(); doHapticSnap(); pktCloseOverlay()">Cancel</button>
                    </div>
                    `;
                    document.body.appendChild(overlay);
                    renderSavedMembers(slotIdx);
                    }

                    function pktCloseOverlay() {
                    const ov = document.getElementById('pkt-overlay');
                    if (!ov) return;
                    const sheet = ov.querySelector('.pkt-form-sheet');
                    if (sheet) sheet.style.animation = 'pkt-sheet-out 0.25s cubic-bezier(0.8, 0, 1, 1) forwards';
                    ov.style.animation = 'pkt-overlay-out 0.25s ease forwards';

                    setTimeout(() => {
                    if (ov && ov.parentNode) ov.remove();
                    pktCurrentEditSlot = -1;
                    }, 240);
                    }

                    function pktSaveSlot(slotIdx) {
                    const name = document.getElementById('pkt-fi-name')?.value.trim() || '';
                    const regno = document.getElementById('pkt-fi-regno')?.value.trim() || '';
                    const gender = document.getElementById('pkt-fi-gender')?.value || '';
                    const year = document.getElementById('pkt-fi-year')?.value || '';
                    const section = document.getElementById('pkt-fi-section')?.value || '';
                    const phone = '0000000000';

                    const errEl = document.getElementById('pkt-error');

                    let err = '';
                    if (!name || !regno || !gender || !year || !section) {
                    err = 'Please enter RegNo and Gender for this member.';
                    } else if (regno.length < 5) { err='Register number must be at least 5 digits.' ; } else if
                      (/[^0-9]/.test(regno)) { err='Register number must contain digits only. No letters allowed.' ; }
                      else { const leaderRegno=document.getElementById('f-regno')?.value.trim() || '' ; if
                      (regno.toLowerCase()===leaderRegno.toLowerCase()) err='Register number matches the leader.' ; else
                      { for (let i=0; i < teamMembers.length; i++) { if (i===slotIdx - 1) continue; if (teamMembers[i]
                      && teamMembers[i].regno.toLowerCase()===regno.toLowerCase()) {
                      err='This member is already added to another seat.' ; break; } } } } if (err) { if (errEl) {
                      errEl.textContent=err; errEl.classList.add('show'); } const
                      sheet=document.querySelector('.pkt-form-sheet'); if (sheet) { sheet.style.animation='none' ; void
                      sheet.offsetWidth; sheet.style.animation='btn-impact 0.3s ease' ; } return; } if (errEl)
                      errEl.classList.remove('show'); const member={ name, regno, gender, year, section, phone };
                      teamMembers[slotIdx - 1]=member; // Persist to local pool let
                      pool=JSON.parse(localStorage.getItem('utsav_saved_team') || '[]' ); const idx=pool.findIndex(m=>
                      m.regno === regno);
                      if (idx !== -1) pool[idx] = member; else pool.push(member);
                      localStorage.setItem('utsav_saved_team', JSON.stringify(pool));

                      // Update visual card
                      const nameEl = document.getElementById(`pkt-name-${slotIdx}`);
                      const regnoEl = document.getElementById(`pkt-regno-${slotIdx}`);
                      const statusEl = document.getElementById(`pkt-status-${slotIdx}`);
                      const card = document.getElementById(`pkt-card-${slotIdx}`);

                      if (nameEl) nameEl.textContent = name;
                      if (regnoEl) regnoEl.textContent = regno.slice(0, 12) + (regno.length > 12 ? '…' : '');
                      if (statusEl) { statusEl.textContent = '● Added'; statusEl.className = 'pkt-card-status
                      pkt-status-added'; }
                      if (card) card.className = 'pkt-player-card pkt-card-added';

                      // Also sync hidden tm-grid for goStep(2) validation
                      pktSyncHiddenGrid();

                      updatePktSummaryPlate();

                      pktCloseOverlay();
                      }

                      function renderSavedMembers(slotIdx) {
                      const container = document.getElementById('pkt-saved-container');
                      if (!container) return;

                      const pool = JSON.parse(localStorage.getItem('utsav_saved_team') || '[]');
                      const genderFilter = document.getElementById('f-gender')?.value; // Leader's gender

                      // Filter by gender (rule: no mixed gender teams) and exclude already added
                      const filtered = pool.filter(m => {
                      if (genderFilter && m.gender !== genderFilter) return false;
                      if (teamMembers.some(tm => tm && tm.regno === m.regno)) return false;
                      const leaderRegno = document.getElementById('f-regno')?.value.trim();
                      if (m.regno === leaderRegno) return false;
                      return true;
                      });

                      if (filtered.length === 0) {
                      container.innerHTML = '';
                      return;
                      }

                      container.innerHTML = `
                      <div
                        style="font-size:10px;font-weight:800;color:var(--gold);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;opacity:0.8">
                        Quick Select Previous Team</div>
                      <div class="saved-members-box">
                        ${filtered.map(m => `
                        <div class="saved-member-pill" onclick="selectSavedMember('${m.regno}', ${slotIdx})">
                          <div class="saved-member-info">
                            <div class="sm-name">${m.name}</div>
                            <div class="sm-meta">${m.regno} · Year ${m.year}${m.section}</div>
                          </div>
                          <div class="sm-add-icon">＋</div>
                        </div>
                        `).join('')}
                      </div>
                      `;
                      }

                      function selectSavedMember(regno, slotIdx) {
                      const pool = JSON.parse(localStorage.getItem('utsav_saved_team') || '[]');
                      const member = pool.find(m => m.regno === regno);
                      if (!member) return;

                      document.getElementById('pkt-fi-name').value = member.name;
                      document.getElementById('pkt-fi-regno').value = member.regno;
                      document.getElementById('pkt-fi-gender').value = member.gender;
                      document.getElementById('pkt-fi-year').value = member.year;
                      document.getElementById('pkt-fi-section').value = member.section;
                      document.getElementById('pkt-fi-phone').value = member.phone;

                      // Update drafts too
                      pktDrafts[slotIdx] = { ...member };

                      // Visual feedback
                      const pill = event.currentTarget;
                      if (pill) {
                      pill.style.background = 'rgba(46, 204, 113, 0.2)';
                      pill.style.borderColor = '#2ecc71';
                      }

                      doHapticSnap();
                      playMechanicalSnap();
                      }

                      function pktUpdateDraft(slotIdx, field, val) {
                      if (!pktDrafts[slotIdx]) pktDrafts[slotIdx] = {};
                      pktDrafts[slotIdx][field] = val;
                      }

                      function shakePktCard(slotIdx) {
                      const card = document.getElementById(`pkt-card-${slotIdx}`);
                      if (card) {
                      card.style.animation = 'none';
                      void card.offsetWidth;
                      card.style.animation = 'btn-impact 0.4s ease'; // existing shake-like animation
                      }
                      }

                      function pktResetSlotDisplay(slotIdx) {
                      const nameEl = document.getElementById(`pkt-name-${slotIdx}`);
                      const regnoEl = document.getElementById(`pkt-regno-${slotIdx}`);
                      const statusEl = document.getElementById(`pkt-status-${slotIdx}`);
                      const card = document.getElementById(`pkt-card-${slotIdx}`);
                      if (nameEl) nameEl.textContent = 'Empty Seat';
                      if (regnoEl) regnoEl.textContent = '—';
                      if (statusEl) { statusEl.textContent = '👆 Tap to Add'; statusEl.className = 'pkt-card-status
                      pkt-status-waiting'; }
                      if (card) card.className = 'pkt-player-card pkt-card-waiting';
                      }

                      /* Sync poker table data into the hidden tm-grid so existing goStep(2) validation works */
                      function pktSyncHiddenGrid() {
                      const grid = document.getElementById('tm-grid');
                      if (!grid) return;
                      grid.innerHTML = '';
                      teamMembers.forEach((m, i) => {
                      if (!m || !m.name) return;
                      const div = document.createElement('div');
                      div.className = 'tm-card'; div.id = `tm-card-${i}`;
                      div.innerHTML = `
                      <input class="fi tm-name" type="hidden" data-idx="${i}" value="${m.name}">
                      <input class="fi tm-regno" type="hidden" data-idx="${i}" value="${m.regno}">
                      <select class="fs tm-gender" data-idx="${i}" style="display:none">
                        <option value="${m.gender}" selected>${m.gender}</option>
                      </select>
                      <select class="fs tm-year" data-idx="${i}" style="display:none">
                        <option value="${m.year}" selected>${m.year}</option>
                      </select>
                      <select class="fs tm-section" data-idx="${i}" style="display:none">
                        <option value="${m.section}" selected>${m.section}</option>
                      </select>
                      <input class="fi tm-phone" type="hidden" data-idx="${i}" value="${m.phone}">
                      `;
                      grid.appendChild(div);
                      });
                      }

                      /* pktConfirmTeam — validate then call goStep(2) */
                      function pktConfirmTeam() {
                      if (!currentEv) return;
                      const e = currentEv;

                      // Sync team name
                      const vis = document.getElementById('pkt-teamname-vis');
                      if (vis) document.getElementById('f-teamname').value = vis.value.trim();

                      if (e.type !== 'Solo') {
                      // Count filled slots — must equal exactly selectedTeamSize - 1 members
                      const needed = (selectedTeamSize || e.minTeam) - 1;
                      const filled = teamMembers.filter(m => m && m.name).length;
                      if (filled < needed) { alert(`Your team is incomplete. For "${e.name}" , you must add exactly
                        ${needed} member(s) to the remaining seats.`); return; } } // Sync hidden grid for downstream
                        validation pktSyncHiddenGrid(); goStep(2); } let tmCount=0; function addTeamMember() { // Legacy
                        — still called by setupTeamStep internally for compatibility // In the new poker UI, slots are
                        managed by pktOpenSlot / pktSaveSlot if (!currentEv) return; if (teamMembers.length>=
                        currentEv.maxTeam - 1) {
                        alert(`Maximum ${currentEv.maxTeam} members including you`); return;
                        }
                        const idx = teamMembers.length;
                        teamMembers.push({ name: '', regno: '', year: '', section: '', phone: '', gender: '' });
                        }

                        function removeTeamMember(idx) {
                        if (!currentEv || teamMembers.length <= currentEv.minTeam - 1) { alert(`Minimum
                          ${currentEv.minTeam} members required`); return; } teamMembers.splice(idx, 1); if (idx>= 1 &&
                          idx <= 3) pktResetSlotDisplay(idx); pktSyncHiddenGrid(); } /* ── STEP NAVIGATION ── */
                            function goStep(n) { if (n===1) { // Validate step 0 if (!currentEv) { showError('Missing
                            Info', 'Select an Event' , 'Please choose an event to proceed.' ); return; } const
                            name=document.getElementById('f-name').value.trim(); const
                            regno=document.getElementById('f-regno').value.trim(); // Check dataset.raw first
                            (auto-fetched), fall back to visible value const
                            year=document.getElementById('f-year').dataset.raw ||
                            document.getElementById('f-year').value; const
                            section=document.getElementById('f-section').dataset.raw ||
                            document.getElementById('f-section').value; const
                            gender=document.getElementById('f-gender').value; const fields=[ { id: 'f-name' , val: name,
                            label: 'Full Name' }, { id: 'f-regno' , val: regno, label: 'Register Number' }, {
                            id: 'f-year' , val: year, label: 'Year' }, { id: 'f-section' , val: section,
                            label: 'Section' }, { id: 'f-gender' , val: gender, label: 'Gender' } ]; let err='' ; const
                            errEl=document.getElementById('step-0-error'); document.querySelectorAll('.rlt-fi,
                            .rlt-fs').forEach(el=> el.classList.remove('error'));

                            const missing = fields.filter(f => !f.val);
                            if (missing.length > 0) {
                            err = `Please fill all details: ${missing.map(m => m.label).join(', ')}`;
                            missing.forEach(m => document.getElementById(m.id)?.classList.add('error'));
                            } else if (regno.length < 7) { err='Register number must be at least 7 digits.' ;
                              document.getElementById('f-regno').classList.add('error'); } else if
                              (/[^0-9]/.test(regno)) {
                              err='Register number must contain digits only — no letters allowed.' ;
                              document.getElementById('f-regno').classList.add('error'); } if (err) { if (errEl) {
                              errEl.textContent=err; errEl.classList.add('show'); } const
                              slip=document.getElementById('rlt-slip'); if (slip) { slip.style.animation='none' ; void
                              slip.offsetWidth; slip.style.animation='btn-impact 0.3s ease' ; } return; } if (errEl)
                              errEl.classList.remove('show'); // RE-INITIALIZE poker table slots based on whatever the
                              leader selected in the Team Size dropdown if (currentEv.id==='dn' ) { if
                              (selectedTeamSize> 1) {
                              initDanceMemberFlow();
                              return;
                              } else {
                              // Solo dance - go straight to review
                              teamMembers = [];
                              goStep(2);
                              return;
                              }
                              }
                              setupTeamStep();
                              }
                              if (n === 2) {
                              // Validate step 1 (team)
                              if (currentEv && currentEv.type !== 'Solo') {
                              const leaderGender = document.getElementById('f-gender').value;
                              if (currentEv.id === 'dn') {
                              const tnInput = document.getElementById('f-teamname');
                              if (tnInput && !tnInput.value.trim()) tnInput.value = 'Dance Performance Group';
                              for (let m of teamMembers) {
                              if (m.gender && m.gender !== leaderGender) {
                              showError('Rule Violation', 'Mixed Gender Team', `All members must be ${leaderGender}.
                              Mixed-gender teams are not allowed in this event.`);
                              return;
                              }
                              }
                              buildReview();
                              currentStep = n;
                              updateStepUI();
                              return;
                              }
                              const tname = document.getElementById('f-teamname').value.trim();
                              if (!tname) { showError('Missing Info', 'Team Name Required', 'Please enter a team name to
                              proceed.'); return; }

                              // Only perform Poker Table Card validation for non-Dance events
                              const needed = (selectedTeamSize || currentEv.minTeam) - 1;

                              for (let i = 0; i < needed; i++) { const m=teamMembers[i]; const slotNum=i + 2; if (!m ||
                                !m.name) { showError('Member Missing', `Seat ${slotNum} is Empty`, `Please tap on Seat
                                ${slotNum} to add a team member.`); shakePktCard(i + 1); return; } const fields=[ {
                                k: 'regno' , l: 'Register Number' }, { k: 'gender' , l: 'Gender' }, { k: 'year' ,
                                l: 'Year' }, { k: 'section' , l: 'Section' } ]; for (let f of fields) { if (!m[f.k]) {
                                showError('Incomplete Info', `Check Member ${slotNum}`, `Field "${f.l}" is missing for
                                ${m.name}. Tap their seat to complete.`); shakePktCard(i + 1); return; } } if (m.gender
                                !==leaderGender) { showError('Rule Violation', 'Mixed Gender Team' , `Member ${slotNum}
                                (${m.name}) must be ${leaderGender}. Mixed-gender teams are not allowed.`);
                                shakePktCard(i + 1); return; } } if (teamMembers.length < needed) {
                                showError('Incomplete Team', 'Add More Members' , `Required: ${needed + 1} players
                                total. Please fill all seats.`); return; } } buildReview(); } currentStep=n;
                                updateStepUI(); } /* ── DANCE SEQUENTIAL FLOW HELPERS ── */ let danceMemberIndex=1; let
                                _danceLookupTimer=null; let _danceLookupAbortController=null; function
                                initDanceMemberFlow() { danceMemberIndex=1; teamMembers=[]; const total=selectedTeamSize
                                || 1; if (total <=1) { goStep(2); return; } currentStep=1.5; updateStepUI();
                                renderDanceMemberForm(); // Initialize particles for the dance-specific room
                                spawnDanceParticles(); // Animation Reset for the Slip const
                                slip=document.getElementById('dance-member-slip'); if (slip) {
                                slip.style.animation='none' ; void slip.offsetWidth;
                                slip.style.animation='btn-impact 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' ; } } function
                                spawnDanceParticles() { const pc=document.getElementById('rlt-particles-dance'); if (pc)
                                { pc.innerHTML='' ; const colors=['rgba(255,215,0,0.4)', 'rgba(212,175,55,0.3)'
                                , 'rgba(255,255,255,0.2)' ]; for (let i=0; i < 15; i++) { const
                                p=document.createElement('div'); const sz=Math.random() * 3 + 1; const
                                col=colors[Math.floor(Math.random() * colors.length)]; p.style.cssText=`
                                position:absolute; width:${sz}px; height:${sz}px; border-radius:50%;
                                left:${Math.random() * 100}%; bottom:${Math.random() * 20}%; background:${col};
                                box-shadow: 0 0 ${sz * 2}px ${col}; animation: pkt-rise ${4 + Math.random() * 4}s
                                ease-in infinite; animation-delay: ${Math.random() * 4}s; `; pc.appendChild(p); } } }
                                function renderDanceMemberForm() { const
                                title=document.getElementById('dance-member-title'); const
                                nextBtn=document.getElementById('dance-next-btn'); const total=selectedTeamSize; if
                                (title) title.textContent=`MEMBER ${danceMemberIndex + 1} OF ${total}`; if (nextBtn)
                                nextBtn.textContent=(danceMemberIndex + 1===total) ? 'REVIEW REGISTRATION \u2192'
                                : 'NEXT MEMBER \u2192' ; // Clear fields document.getElementById('fd-regno').value='' ;
                                document.getElementById('fd-name').value='' ;
                                document.getElementById('fd-year').value='' ;
                                document.getElementById('fd-section').value='' ;
                                document.getElementById('fd-gender').value=document.getElementById('f-gender').value
                                || '' ; // Default to leader gender
                                document.getElementById('dance-member-error').classList.remove('show'); } function
                                nextDanceMember() { const regno=document.getElementById('fd-regno').value.trim(); const
                                name=document.getElementById('fd-name').value.trim(); const
                                gender=document.getElementById('fd-gender').value; const
                                year=document.getElementById('fd-year').value; const
                                section=document.getElementById('fd-section').value; const
                                errEl=document.getElementById('dance-member-error'); let err='' ; if (!regno || !name ||
                                !gender) err='Please enter Member details.' ; else if (regno.length < 5)
                                err='Register number is too short.' ; else { const
                                leaderRegno=document.getElementById('f-regno').value.trim(); const
                                leaderGender=document.getElementById('f-gender').value; if (regno===leaderRegno)
                                err='Member cannot be the same as Leader.' ; else if (teamMembers.some((m, idx)=> idx
                                !== danceMemberIndex - 1 && m.regno === regno)) err = 'Member already added to this
                                team.';
                                else if (gender !== leaderGender) err = `Mixed gender not allowed. Member must be
                                ${leaderGender}.`;
                                }

                                if (err) {
                                if (errEl) { errEl.textContent = err; errEl.classList.add('show'); }
                                return;
                                }

                                // Save member
                                teamMembers[danceMemberIndex - 1] = { name, regno, gender, year, section, phone:
                                '0000000000' };

                                if (danceMemberIndex + 1 < selectedTeamSize) { danceMemberIndex++;
                                  renderDanceMemberForm(); const sheet=document.querySelector('#step-dance-member
                                  .rlt-slip'); if (sheet) { sheet.style.animation='none' ; void sheet.offsetWidth;
                                  sheet.style.animation='su 0.4s ease' ; } } else { goStep(2); } } function
                                  prevDanceMember() { if (danceMemberIndex> 1) {
                                  danceMemberIndex--;
                                  // Pre-fill from saved
                                  const m = teamMembers[danceMemberIndex - 1];
                                  renderDanceMemberForm();
                                  document.getElementById('fd-regno').value = m.regno;
                                  document.getElementById('fd-name').value = m.name;
                                  document.getElementById('fd-year').value = m.year;
                                  document.getElementById('fd-section').value = m.section;
                                  document.getElementById('fd-gender').value = m.gender;
                                  } else {
                                  goStep(0);
                                  }
                                  }

                                  function lookupDanceStudent() {
                                  const regno = document.getElementById('fd-regno').value.trim();
                                  const nameEl = document.getElementById('fd-name');
                                  const yearEl = document.getElementById('fd-year');
                                  const secEl = document.getElementById('fd-section');
                                  const errEl = document.getElementById('dance-member-error');

                                  if (_danceLookupAbortController) _danceLookupAbortController.abort();

                                  clearTimeout(_danceLookupTimer);
                                  if (regno.length < 5) { if (nameEl) nameEl.value='' ; return; } if (nameEl)
                                    nameEl.value='🔍 Finding student...' ; if (errEl) errEl.classList.remove('show');
                                    _danceLookupTimer=setTimeout(async ()=> {
                                    if (!SHEETS_URL || SHEETS_URL.includes('YOUR_GOOGLE')) return;

                                    _danceLookupAbortController = new AbortController();
                                    try {
                                    const resp = await
                                    fetch(`${SHEETS_URL}?action=studentLookup&regno=${encodeURIComponent(regno)}`, {
                                    signal: _danceLookupAbortController.signal });
                                    const data = await resp.json();
                                    if (data.success) {
                                    if (nameEl) nameEl.value = data.name;
                                    if (yearEl) yearEl.value = (data.year === '1' ? '1st Year' : data.year === '2' ?
                                    '2nd Year' : data.year === '3' ? '3rd Year' : data.year === '4' ? '4th Year' :
                                    data.year);
                                    if (secEl) secEl.value = 'Section ' + data.section;
                                    } else {
                                    if (nameEl) nameEl.value = '';
                                    if (errEl) { errEl.textContent = ' ⚠ ' + data.error; errEl.classList.add('show'); }
                                    }
                                    } catch (e) {
                                    if (e.name === 'AbortError') return;
                                    if (nameEl) nameEl.value = '';
                                    console.error('Dance lookup error:', e);
                                    }
                                    }, 300);
                                    }

                                    function updateStepUI() {
                                    const regOv = document.getElementById('reg-ov');
                                    const steps = document.querySelectorAll('.step');
                                    const danceStepActive = (currentStep === 1.5);

                                    // Update background theme
                                    if (regOv) {
                                    if (currentStep === 1 || danceStepActive) regOv.setAttribute('data-theme', 'poker');
                                    else regOv.removeAttribute('data-theme');
                                    }

                                    steps.forEach((s) => {
                                    let isActive = false;
                                    if (s.id === 'step-0') isActive = (currentStep === 0);
                                    else if (s.id === 'step-1') isActive = (currentStep === 1);
                                    else if (s.id === 'step-2') isActive = (currentStep === 2);
                                    else if (s.id === 'step-dance-member') isActive = (currentStep === 1.5);

                                    s.classList.toggle('active', isActive);
                                    s.style.visibility = isActive ? 'visible' : 'hidden';
                                    s.style.display = isActive ? 'block' : 'none';
                                    });

                                    document.querySelectorAll('.step-dot').forEach((d, i) => {
                                    d.classList.remove('current', 'done');
                                    if (i === currentStep) d.classList.add('current');
                                    else if (i < currentStep) d.classList.add('done'); }); // Scroll sheet to top const
                                      regSheet=document.querySelector('.reg-sheet'); if (regSheet) {
                                      regSheet.scrollTo(0, 0); if (currentStep===0 || currentStep===1) {
                                      regSheet.classList.add('reg-sheet-fullscreen'); } else {
                                      regSheet.classList.remove('reg-sheet-fullscreen'); } } const
                                      btn=document.querySelector('#step-2 .reg-next-btn'); const
                                      backBtn=document.querySelector('#step-2 .reg-back-btn'); if (btn && !isCooldown) {
                                      btn.disabled=false; btn.textContent='Confirm Registration' ; btn.style.opacity='1'
                                      ; } if (backBtn) { backBtn.style.pointerEvents='auto' ; backBtn.style.opacity='1'
                                      ; } } function buildReview() { const nameEl=document.getElementById('f-name');
                                      const regnoEl=document.getElementById('f-regno'); const
                                      yearEl=document.getElementById('f-year'); const
                                      secEl=document.getElementById('f-section'); const name=(nameEl.dataset.raw ||
                                      nameEl.value || '' ).trim(); const regno=regnoEl.value.trim(); const
                                      year=yearEl.dataset.raw || yearEl.value || '' ; const section=secEl.dataset.raw ||
                                      secEl.value || '' ; const gender=document.getElementById('f-gender').value; const
                                      tname=document.getElementById('f-teamname')?.value.trim() || '' ; const
                                      e=currentEv; // Display year nicely const yearDisplay=year==='1' ? '1st Year' :
                                      year==='2' ? '2nd Year' : year==='3' ? '3rd Year' : year==='4' ? '4th Year' :
                                      (year ? 'Year ' + year : '—' ); const sectionDisplay=section ? 'Section ' +
                                      section : '—' ; let html=` ${evSummaryCard(e.id)} <div
                                      style="background:rgba(255,255,255,.03);border:1px solid var(--border);border-radius:8px;padding:16px;margin-bottom:14px">
                                      <div
                                        style="font-size:10px;font-weight:700;letter-spacing:2px;color:var(--orange);text-transform:uppercase;margin-bottom:12px">
                                        Your Details</div>
                                      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
                                        ${[['Name', name], ['Reg Number', regno], ['Year', yearDisplay], ['Section',
                                        sectionDisplay], ['Gender', gender]].map(([l, v]) => `
                                        <div>
                                          <div
                                            style="font-size:9px;font-weight:700;letter-spacing:1.5px;color:var(--muted2);text-transform:uppercase;margin-bottom:3px">
                                            ${l}</div>
                                          <div style="font-size:13px;font-weight:600;color:#fff">${v}</div>
                                        </div>
                                        `).join('')}
                                      </div>
        </div>`;

        if (e.type !== 'Solo' && tname) {
        const teamTitle = (e.id === 'dn') ? 'Dance Performance Group' : 'Team: ' + tname;
        html += `<div
          style="background:rgba(255,255,255,.03);border:1px solid var(--border);border-radius:8px;padding:16px;margin-bottom:14px">
          <div
            style="font-size:10px;font-weight:700;letter-spacing:2px;color:var(--orange);text-transform:uppercase;margin-bottom:6px">
            ${teamTitle}</div>
          <div style="font-size:11px;color:var(--muted2);margin-bottom:10px">Member 1 (You): ${name} · ${regno}</div>
          ${teamMembers.map((m, i) => `<div style="padding:8px 0;border-top:1px solid rgba(255,255,255,.04)">
            <div style="font-size:12px;font-weight:700;color:#fff">Member ${i + 2}: ${m.name}</div>
            <div style="font-size:10px;color:var(--muted2)">${m.regno} · Year ${m.year} · Sec ${m.section}</div>
          </div>`).join('')}
        </div>`;
        }
        document.getElementById('review-content').innerHTML = html;
        }

        /* ── SYSTEM LOGIC: Speed & Safety ── */
        let isCooldown = false;
        let isSubmitting = false;
        let cooldownTimer = null;
        let globalCooldownTime = 0;

        function activateCooldown(timeleftStr = 25, penaltyMsg = '') {
        const btn = document.querySelector('#step-2 .reg-next-btn');
        const backBtn = document.querySelector('#step-2 .reg-back-btn');
        isCooldown = true;
        let timeleft = parseInt(timeleftStr) || 25;
        globalCooldownTime = timeleft;

        const warnSec = document.getElementById('cooldown-warning-msg');
        if (warnSec) { warnSec.innerHTML = penaltyMsg ? `<span
          style="color:var(--orange);font-size:12px;font-weight:600;display:block;margin-top:10px;">${penaltyMsg}</span>`
        : ''; }

        const wt = document.getElementById('wall-timer');
        if (wt) wt.textContent = timeleft + 's';

        const scb = document.getElementById('success-cooldown-box');
        const sct = document.getElementById('success-cd-timer');
        if (scb && sct) { scb.style.display = 'block'; sct.textContent = timeleft + 's'; }

        if (btn) {
        btn.disabled = true;
        btn.style.opacity = '0.5';
        btn.textContent = `Wait ${timeleft}s`;

        clearInterval(cooldownTimer);
        cooldownTimer = setInterval(() => {
        timeleft--;
        globalCooldownTime = timeleft;

        if (wt) wt.textContent = timeleft + 's';
        if (sct) sct.textContent = timeleft + 's';

        if (timeleft <= 0) { clearInterval(cooldownTimer); cooldownTimer=null; isCooldown=false; if (scb)
          scb.style.display='none' ; // Auto-recover if they waited on the cooldown wall const
          wall=document.getElementById('cooldown-wall'); if (wall && wall.style.display==='flex' ) {
          wall.style.display='none' ; const rsc=document.getElementById('reg-rsc'); if (rsc) rsc.style.display='block' ;
          forceCloseReg(); } if (btn) { btn.disabled=false; btn.style.opacity='1' ;
          btn.textContent='Confirm Registration' ; } if (warnSec) warnSec.innerHTML='' ; if (backBtn) {
          backBtn.style.pointerEvents='auto' ; backBtn.style.opacity='1' ; } } else { if (btn) btn.textContent=`Wait
          ${timeleft}s`; } }, 1000); } } async function submitReg() { try { const
          hpElem=document.getElementById('f-website') || document.getElementById('f-hp'); if (hpElem && hpElem.value)
          return; // Honeypot bot block if (isSubmitting) return; if (isCooldown) { showError('Anti-Spam
          Active', 'Please Wait' , `You must wait ${globalCooldownTime} seconds before confirming your next
          registration.`); return; } isSubmitting=true; const btn=document.querySelector('#step-2 .reg-next-btn'); const
          backBtn=document.querySelector('#step-2 .reg-back-btn'); const protectOn=()=> window.onbeforeunload = () =>
          "Registration is in progress. Closing this page might result in lost data. Are you sure?";
          const protectOff = () => window.onbeforeunload = null;

          const resetUI = () => {
          protectOff();
          isSubmitting = false;
          if (btn) { btn.disabled = false; btn.textContent = 'Confirm Registration'; btn.style.opacity = '1'; }
          if (backBtn) { backBtn.style.pointerEvents = 'auto'; backBtn.style.opacity = '1'; }
          };

          if (btn) { btn.disabled = true; btn.textContent = 'Confirming...'; btn.style.opacity = '0.7'; }
          if (backBtn) { backBtn.style.pointerEvents = 'none'; backBtn.style.opacity = '0.5'; }
          protectOn();

          // Read auto-fetched values
          const nameEl = document.getElementById('f-name');
          let name = (nameEl.dataset.raw || nameEl.value || '').trim();
          let regno = document.getElementById('f-regno').value.trim();
          const year = document.getElementById('f-year').dataset.raw || document.getElementById('f-year').value;
          const section = document.getElementById('f-section').dataset.raw ||
          document.getElementById('f-section').value;
          const gender = document.getElementById('f-gender').value;
          const tname = (currentEv?.type !== 'Solo') ? document.getElementById('f-teamname').value.trim() : '';

          // 3. Name / Regno format Enforcer - Improved for Initials and dots
          const pureName = (name || "").replace(/[^A-Za-z.\s]/g, "").trim();
          const pureRegNo = (regno || "").replace(/[^0-9]/g, "");

          if (pureName.length < 2 || pureRegNo.length < 7) { showError('Invalid Format', 'Check Details'
            , 'Please ensure your Name and Register Number are correct.' ); resetUI(); return; } // Re-assign sanitized
            values name=pureName; regno=pureRegNo; // Local duplicate check const
            saved=JSON.parse(localStorage.getItem('u26r') || '[]' ); const currentRegNos=[{ name, regno },
            ...teamMembers.map(m=> ({ name: m.name, regno: m.regno }))];

            let localDupeName = null, localDupeReg = null;
            if (!currentEv.allowMultiple) {
            for (const storedReg of saved) {
            if (storedReg.eventId === currentEv.id || storedReg.eventName === currentEv.name) {
            // Check leader regno (current) against stored leader + all stored members
            const allStoredRegnosForEvent = [storedReg.regno];
            if (storedReg.teamMembers && Array.isArray(storedReg.teamMembers)) {
            storedReg.teamMembers.forEach(tm => { if (tm.regno) allStoredRegnosForEvent.push(tm.regno); });
            }
            // Check ALL current participants (leader + team) against ALL stored participants for this event
            for (const cur of currentRegNos) {
            const dupeFound = allStoredRegnosForEvent.find(sr => sr.toLowerCase() === cur.regno.toLowerCase());
            if (dupeFound) { localDupeName = cur.name; localDupeReg = cur.regno; break; }
            }
            if (localDupeName) break;
            }
            // Time slot conflict check
            if (currentEv.timeSlot && currentEv.isSimultaneous && storedReg.timeSlot === currentEv.timeSlot
            && storedReg.eventId !== currentEv.id && storedReg.eventName !== currentEv.name) {
            const storedEvData = EVS.find(ev => ev.id === storedReg.eventId);
            if (storedEvData && storedEvData.isSimultaneous) {
            const allStoredRegnos = [storedReg.regno];
            if (storedReg.teamMembers && Array.isArray(storedReg.teamMembers)) {
            storedReg.teamMembers.forEach(tm => { if (tm.regno) allStoredRegnos.push(tm.regno); });
            }
            const conflictMember = currentRegNos.find(c => allStoredRegnos.map(r =>
            r.toLowerCase()).includes(c.regno.toLowerCase()));
            if (conflictMember) {
            showError('Time Slot Conflict', 'Same Time Slot', `${conflictMember.name} (${conflictMember.regno}) is
            already registered for "${storedReg.eventName}" which runs at the same time as ${currentEv.name}.`);
            resetUI(); return;
            }
            }
            }
            }
            }

            if (localDupeName) {
            showError('Duplicate Blocked', 'Already registered', `${localDupeName} (${localDupeReg}) is already
            registered for ${currentEv.name} on this device.`);
            resetUI(); return;
            }

            // ── MANDATORY SERVER-SIDE DUPLICATE + TIME CONFLICT CHECK ──
            // This check MUST pass before allowing registration.
            // Errors are NOT silently swallowed — any failure BLOCKS registration.
            if (SHEETS_URL && SHEETS_URL !== 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
            showAdminLoader('Validating Records...<br><span
              style="font-size:10px;color:rgba(255,255,255,0.7);display:block;margin-top:8px;font-weight:600">Please do
              not refresh this page.</span>');

            let serverCheckPassed = false;
            try {
            const allRegNos = [regno, ...teamMembers.filter(m => m && m.regno).map(m => m.regno)].join(',');
            const checkUrl =
            `${SHEETS_URL}?action=lookup&regnos=${encodeURIComponent(allRegNos)}&eventId=${encodeURIComponent(currentEv.id)}&eventName=${encodeURIComponent(currentEv.name)}&timeSlot=${encodeURIComponent(currentEv.timeSlot
            || '')}&targetSheet=${encodeURIComponent(currentEv.targetSheet || '')}`;

            // Abort after 12 seconds to prevent infinite wait
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 12000);

            const resp = await fetch(checkUrl, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (!resp.ok) {
            hideAdminLoader();
            showError('Server Error', 'Validation Failed', `Server returned error ${resp.status}. Please try again.`);
            resetUI(); return;
            }

            const data = await resp.json();

            // ── Check 1: Duplicate reg number for same event ──
            if (data.duplicates && data.duplicates.length > 0) {
            hideAdminLoader();
            const dupeNames = (data.duplicateDetails || []).map(d => `${d.name} (${d.regno})`).join(' / ');
            showError('Duplicate Detected', 'Already Registered for this Event', `The following person(s) are already
            registered for ${currentEv.name}:\n\n${dupeNames}\n\nEach student can only register once per event.`);
            resetUI(); return;
            }

            // ── Check 2: Cross-event time slot conflict ──
            if (data.timeSlotConflicts && data.timeSlotConflicts.length > 0) {
            hideAdminLoader();
            const conflictNames = (data.timeSlotConflictDetails || []).map(d => `${d.name} (${d.regno}) — already in
            "${d.conflictingEvent || d.eventName}"`).join('\n');
            showError('Time Slot Conflict!', 'Cannot Register for Simultaneous Events', `These members are already
            registered for another event running at the same time as ${currentEv.name}:\n\n${conflictNames}`);
            resetUI(); return;
            }

            serverCheckPassed = true;

            } catch (fetchErr) {
            hideAdminLoader();
            if (fetchErr.name === 'AbortError') {
            showError('Server Timeout', 'Validation Could Not Complete', 'The duplicate check timed out. Please check
            your internet connection and try again. Registration is blocked until validation succeeds.');
            } else {
            showError('Connection Error', 'Validation Failed', 'Could not reach the server to validate your
            registration. Please check your internet and try again.\n\nRegistration is blocked until server confirms no
            duplicate.');
            }
            console.error('Server duplicate check failed:', fetchErr);
            resetUI(); return; // ← BLOCK registration — never silently proceed
            }

            hideAdminLoader();

            // Safety net — should never happen, but guard against unexpected flow
            if (!serverCheckPassed) {
            showError('Validation Error', 'Check Incomplete', 'Server validation did not complete. Please try again.');
            resetUI(); return;
            }
            }

            const n = parseInt(localStorage.getItem('u26n') || '0') + 1;
            const rnd = Math.floor(Math.random() * 900 + 100);
            const regId = 'U26-' + String(n).padStart(4, '0') + '-' + rnd;
            const ts = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true });

            const reg = {
            regId, name, regno, gender, year, section,
            eventId: currentEv.id, eventName: currentEv.name,
            timeSlot: currentEv.timeSlot || '',
            teamName: tname,
            teamMembers: teamMembers.slice(),
            ts,
            targetSheet: currentEv.targetSheet || 'Registrations',
            allowMultiple: !!currentEv.allowMultiple
            };

            // Local backup before network call
            localStorage.setItem('pendingReg', JSON.stringify(reg));

            if (SHEETS_URL && SHEETS_URL !== 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
            showAdminLoader('Saving Registration...<br><span
              style="font-size:10px;color:rgba(255,255,255,0.7);display:block;margin-top:8px;font-weight:600">Please do
              not refresh this page.</span>');

            let attempts = 0;
            let success = false;

            while (attempts < 2 && !success) { try { const resp=await fetch(SHEETS_URL, { method: 'POST' , body:
              JSON.stringify({ action: 'addReg' , data: reg, uid: ADMIN_ID, pwd: ADMIN_PASS }) }); const result=await
              resp.json(); if (result.success) { success=true; localStorage.removeItem('pendingReg'); } else if
              (result.error==='RATE_LIMIT' ) { hideAdminLoader(); showError('Rate Limit Active', 'Anti-Spam Triggered'
              , 'Too many requests. Please wait 60 seconds.' );
              activateCooldown(60, 'Global Rate Limit Active. Please wait 60 seconds.' ); resetUI(); return; } else if
              (result.error && result.error.includes('Server busy')) { if (attempts===0) { attempts++;
              showAdminLoader('Server Busy. Retrying in 2s...<br><span
                style="font-size:10px;color:rgba(255,255,255,0.7);display:block;margin-top:8px;font-weight:600">Re-attempting
                connection...</span>');
              await new Promise(r => setTimeout(r, 2000));
              continue;
              }
              hideAdminLoader();
              showError('High Traffic', 'Network Busy', 'Server is handling many requests. Please wait 20s and try
              again.');
              activateCooldown(); resetUI(); return;
              } else {
              hideAdminLoader(); showError('Registration Warning', 'Save Failed', result.error || 'Unknown error.');
              resetUI(); return;
              }
              } catch (e) {
              if (attempts === 0) {
              attempts++;
              showAdminLoader('Network glitch. Retrying...<br><span
                style="font-size:10px;color:rgba(255,255,255,0.7);display:block;margin-top:8px;font-weight:600">Re-establishing
                connection...</span>');
              await new Promise(r => setTimeout(r, 2000));
              continue;
              }
              hideAdminLoader(); showError('Connection Error', 'Timeout', 'Unable to reach the server. Please check your
              internet.');
              resetUI(); return;
              }
              }
              hideAdminLoader();
              } else {
              localStorage.removeItem('pendingReg');
              }

              // Success — activate cooldown and show confirmation
              activateCooldown(20, 'System cool-down active. Registration confirmed.');

              localStorage.setItem('u26n', n);
              saved.push(reg);
              localStorage.setItem('u26r', JSON.stringify(saved));

              resetUI();

              document.getElementById('reg-ov').classList.remove('open');
              document.getElementById('conf-id-v').textContent = regId;

              let waGroupLink = EVENT_WHATSAPP_MAP[reg.eventName] || '#';
              if (reg.eventId === 'dn') {
              waGroupLink = (reg.gender === 'Female')
              ? 'https://chat.whatsapp.com/KuV7TFjgpP9FzAmmCvrGTy?mode=gi_t'
              : 'https://chat.whatsapp.com/Kz4a3HXB56bISBxP9sebh0?mode=gi_t';
              }

              document.getElementById('conf-wa-container').innerHTML = `
              <a href="${waGroupLink}" target="_blank" rel="noopener noreferrer"
                style="display: flex; align-items: center; justify-content: center; gap: 8px; background: #25D366; color: #fff; padding: 12px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; transition: 0.2s ease;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                </svg>
                JOIN WHATSAPP GROUP
              </a>
              `;

              document.getElementById('conf-screen').classList.add('open');


              // Show My Pass button in navbar
              const passBtn = document.getElementById('pass-nav-btn');
              if (passBtn) passBtn.style.display = 'block';

              } catch (err) {
              console.error('Registration Fatal Error:', err);
              hideAdminLoader();
              showError('Registration Error', 'Process Interrupted', 'An unexpected error occurred. Please try again or
              check your internet.');

              // Manual UI Reset on error
              isSubmitting = false;
              const btn = document.querySelector('#step-2 .reg-next-btn');
              const backBtn = document.querySelector('#step-2 .reg-back-btn');
              if (btn) { btn.disabled = false; btn.textContent = 'Confirm Registration'; btn.style.opacity = '1'; }
              if (backBtn) { backBtn.style.pointerEvents = 'auto'; backBtn.style.opacity = '1'; }
              window.onbeforeunload = null;
              }
              }

              function syncSingle(reg) {
              if (!SHEETS_URL || SHEETS_URL.includes('your-url')) return;
              fetch(SHEETS_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'text/plain' },
              body: JSON.stringify({ action: 'addReg', data: reg, uid: ADMIN_ID, pwd: ADMIN_PASS })
              }).then(r => r.json()).catch(() => { });
              }

              /* ── RegNo Auto-Fetch Lookup Functions ── */
              let _lookupTimer = null;
              let _lookupAbortController = null;

              async function lookupStudent() {
              const regno = (document.getElementById('f-regno')?.value || '').trim();
              const nameEl = document.getElementById('f-name');
              const yearEl = document.getElementById('f-year');
              const secEl = document.getElementById('f-section');
              const errEl = document.getElementById('step-0-error');
              const nextBtn = document.querySelector('.rlt-next-btn');

              // Abort any pending fetch
              if (_lookupAbortController) _lookupAbortController.abort();

              // Instant clear stale data
              if (nameEl) { nameEl.value = 'Fetching...'; delete nameEl.dataset.raw; }
              if (yearEl) { yearEl.value = ''; delete yearEl.dataset.raw; }
              if (secEl) { secEl.value = ''; delete secEl.dataset.raw; }
              if (errEl) { errEl.textContent = ''; errEl.style.display = 'none'; }
              if (nextBtn) { nextBtn.disabled = true; nextBtn.style.opacity = '0.5'; }

              clearTimeout(_lookupTimer);
              _lookupTimer = setTimeout(async () => {
              if (regno.length < 5) { if (nameEl) nameEl.value='' ; if (nextBtn) { nextBtn.disabled=false;
                nextBtn.style.opacity='1' ; } return; } if (!SHEETS_URL ||
                SHEETS_URL==='YOUR_GOOGLE_APPS_SCRIPT_URL_HERE' ) return; _lookupAbortController=new AbortController();
                const signal=_lookupAbortController.signal; try { const resp=await
                fetch(`${SHEETS_URL}?action=studentLookup&regno=${encodeURIComponent(regno)}`, { signal }); const
                data=await resp.json(); if (data.success) { if (nameEl) nameEl.value=data.name; if (yearEl)
                yearEl.value=data.year==='1' ? '1st Year' : data.year==='2' ? '2nd Year' : data.year==='3' ? '3rd Year'
                : data.year; if (secEl) secEl.value='Section ' + data.section; nameEl.dataset.raw=data.name;
                yearEl.dataset.raw=data.year; secEl.dataset.raw=data.section; } else { if (nameEl) nameEl.value='' ; if
                (errEl) { errEl.textContent='⚠ ' + data.error; errEl.style.display='block' ; } } } catch (e) { if
                (e.name==='AbortError' ) return; if (nameEl) nameEl.value='' ; if (errEl) {
                errEl.textContent='⚠ Lookup failed. Check Connection.' ; errEl.style.display='block' ; }
                console.error('Lookup error:', e); } finally { if (!signal.aborted && nextBtn) { nextBtn.disabled=false;
                nextBtn.style.opacity='1' ; } } }, 300); } let _memberLookupTimer={}; let _memberAbortControllers={};
                async function pktLookupMember(slotIdx, regno) { const nameEl=document.getElementById("pkt-fi-name");
                const yearEl=document.getElementById("pkt-fi-year"); const
                secEl=document.getElementById("pkt-fi-section"); const errEl=document.getElementById("pkt-error"); const
                saveBtn=document.querySelector('.pkt-form-save-btn'); // Abort any pending fetch for this specific slot
                if (_memberAbortControllers[slotIdx]) _memberAbortControllers[slotIdx].abort(); // Instant clear stale
                data if (nameEl) nameEl.value="Fetching..." ; if (yearEl) yearEl.value="" ; if (secEl) secEl.value="" ;
                if (errEl) { errEl.textContent="" ; errEl.classList.remove("show"); } if (saveBtn) {
                saveBtn.disabled=true; saveBtn.style.opacity='0.5' ; } clearTimeout(_memberLookupTimer[slotIdx]);
                _memberLookupTimer[slotIdx]=setTimeout(async ()=> {
                if ((regno || "").length < 5) { if (nameEl) nameEl.value="" ; if (saveBtn) { saveBtn.disabled=false;
                  saveBtn.style.opacity='1' ; } return; } if (!SHEETS_URL ||
                  SHEETS_URL==="YOUR_GOOGLE_APPS_SCRIPT_URL_HERE" ) return; _memberAbortControllers[slotIdx]=new
                  AbortController(); const signal=_memberAbortControllers[slotIdx].signal; try { const resp=await
                  fetch(`${SHEETS_URL}?action=studentLookup&regno=${encodeURIComponent(regno)}`, { signal }); const
                  data=await resp.json(); if (data.success) { if (nameEl) nameEl.value=data.name; if (yearEl)
                  yearEl.value=data.year==="1" ? "1st Year" : data.year==="2" ? "2nd Year" : data.year==="3"
                  ? "3rd Year" : data.year; if (secEl) secEl.value="Section " + data.section;
                  pktUpdateDraft(slotIdx, "name" , data.name); pktUpdateDraft(slotIdx, "year" , data.year);
                  pktUpdateDraft(slotIdx, "section" , data.section); } else { if (nameEl) nameEl.value="" ; if (errEl) {
                  errEl.textContent="⚠ " + data.error; errEl.classList.add("show"); } } } catch (e) { if
                  (e.name==='AbortError' ) return; if (nameEl) nameEl.value="" ; if (errEl) {
                  errEl.textContent="⚠ Lookup failed. Try again." ; errEl.classList.add("show"); } console.error("Member
                  lookup error:", e); } finally { if (!signal.aborted && saveBtn) { saveBtn.disabled=false;
                  saveBtn.style.opacity='1' ; } } }, 300); } /* ── CONFIRMATION ── */ function viewPass() {
                  document.getElementById('conf-screen').classList.remove('open'); openPass(); } /* ── HELPERS ── */
                  function getParsedMembers(r) { let m=[]; if (Array.isArray(r.teamMembers)) m=r.teamMembers; else if
                  (typeof r.teamMembers==='string' && r.teamMembers.trim()) { try { m=JSON.parse(r.teamMembers); } catch
                  (e) { } } // Fallbacks for corrupted data if (m.length===0 && typeof r.ts==='string' &&
                  r.ts.includes('[{"name"')) { try { m=JSON.parse(r.ts); } catch (e) { } } if (m.length===0 && typeof
                  r.teamName==='string' && r.teamName.includes('[{"name"')) { try { m=JSON.parse(r.teamName); } catch
                  (e) { } } // Handle "Solo" string written by matured script version if (m.length===0 &&
                  r.teamMembers==="Solo" ) return []; return m; } /* ── PASS ── */ function renderPassCards(regs) {
                  return regs.map(r=> {
                  const members = getParsedMembers(r);
                  const matchEv = EVS.find(e => e.name === r.eventName);
                  const exactDate = matchEv ? matchEv.date : '18 April';
                  const exactVenue = matchEv ? matchEv.venue : 'PSNA';
                  const shareLink = window.location.origin + window.location.pathname.replace('index.html', '') +
                  'pass.html?id=' + r.regId;
                  const waText = encodeURIComponent(`🎟️ CSEUTSAV'26 2K26 Pass\nName: ${r.name}\nEvent:
                  ${r.eventName}\nPass ID: ${r.regId}\n\nShow this pass at entry:\n${shareLink}`);

                  let waGroupLink = EVENT_WHATSAPP_MAP[r.eventName] || '#';
                  if (r.eventId === 'dn' || r.eventName === 'Cultural Dance') {
                  waGroupLink = (r.gender === 'Female')
                  ? 'https://chat.whatsapp.com/KuV7TFjgpP9FzAmmCvrGTy?mode=gi_t'
                  : 'https://chat.whatsapp.com/Kz4a3HXB56bISBxP9sebh0?mode=gi_t';
                  }
                  return `
                  <div class="pass-card">
                    <div class="pass-top">
                      <div class="pass-fest">CSEUTSAV'26 2K26 · PSNA COLLEGE · DEPT OF CSE</div>
                      <div class="pass-ev-name">${r.eventName}</div>
                      <div class="pass-status">
                        <div class="sdot"></div>Confirmed
                      </div>
                    </div>
                    <div class="pass-body">
                      <div class="pass-id-row">
                        <div>
                          <div class="pid-l">Registration ID</div>
                          <div class="pid-v">${r.regId}</div>
                        </div>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(232,84,26,.3)"
                          stroke-width="1.5">
                          <path
                            d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z" />
                        </svg>
                      </div>
                      <div class="pass-grid">
                        <div>
                          <div class="pfl">Name</div>
                          <div class="pfv">${r.name}</div>
                        </div>
                        <div>
                          <div class="pfl">Reg Number</div>
                          <div class="pfv">${r.regno}</div>
                        </div>
                        <div>
                          <div class="pfl">Department</div>
                          <div class="pfv">${r.department || 'CSE'}</div>
                        </div>
                        <div>
                          <div class="pfl">Year & Section</div>
                          <div class="pfv">${r.year ? 'Year ' + r.year + ' · Sec ' + (r.section || '—') : '—'}</div>
                        </div>
                        <div>
                          <div class="pfl">Gender</div>
                          <div class="pfv">${r.gender || '—'}</div>
                        </div>
                        <div>
                          <div class="pfl">Date & Venue</div>
                          <div class="pfv">${exactDate} · ${exactVenue}</div>
                        </div>
                      </div>
                      ${(r.teamName && r.teamName.trim() !== 'Solo' && !r.teamName.includes('[{"name"')) ||
                      members.length > 0 ? `
                      <div class="team-pass-section">
                        <div class="team-pass-title">Team: ${r.teamName && !r.teamName.includes('[{"name"') ? r.teamName
                          : 'Team'}</div>
                        <div class="team-member-row"><span>Member 1 (You)</span><strong>${r.name} · ${r.regno ||
                            ''}</strong></div>
                        ${members.map((m, i) => `<div class="team-member-row"><span>Member ${i +
                            2}</span><strong>${m.name}${m.regno ? ' · ' + m.regno : ''}</strong></div>`).join('')}
                      </div>` : ''}
                      <div class="pass-sep"><span>Valid Digital Entry Pass</span></div>
                      <div class="qr-center">
                        <div class="qr-box">
                          <div id="qr-${r.regId.replace(/[^a-zA-Z0-9]/g, '_')}"></div>
                          <div class="qr-lbl">${r.regId}</div>
                        </div>
                      </div>
                      <div class="shot-note">Screenshot this pass · Show at the entry desk</div>

                      <a href="https://wa.me/?text=${waText}" target="_blank" rel="noopener noreferrer"
                        style="display: flex; align-items: center; justify-content: center; gap: 8px; background: #25D366; color: #fff; padding: 12px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 14px; margin-top: 20px; text-transform: uppercase; letter-spacing: 0.5px; transition: 0.2s ease;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path
                            d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                        </svg>
                        Share Pass on WhatsApp
                      </a>
                      <a href="${waGroupLink}" target="_blank" rel="noopener noreferrer"
                        style="display: flex; align-items: center; justify-content: center; gap: 8px; background: #25D366; color: #fff; padding: 12px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 14px; margin-top: 10px; text-transform: uppercase; letter-spacing: 0.5px; transition: 0.2s ease;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path
                            d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                        </svg>
                        JOIN WHATSAPP GROUP
                      </a>
                    </div>
                  </div>
                  `;
                  }).join('');
                  }

                  function generateQRs(regs) {
                  setTimeout(() => {
                  regs.forEach(r => {
                  const el = document.getElementById('qr-' + r.regId.replace(/[^a-zA-Z0-9]/g, '_'));
                  if (el && !el.hasChildNodes()) {
                  // Pointing to internal app with data parameter
                  const verifyUrl = window.location.origin + window.location.pathname.replace('index.html', '');
                  const members = getParsedMembers(r);
                  const tmQR = members.map(m => ({ n: m.name || '', r: m.regno || '', y: m.year || '', s: m.section ||
                  '', p: m.phone || '' }));
                  const data = { id: r.regId, n: r.name, e: r.eventName, rn: r.regno || '', ph: r.phone || '', yr:
                  r.year || '', sec: r.section || '', t: r.teamName || '', tm: tmQR };

                  // Standard base64 with URL-safe replacements (replace + with -, / with _)
                  let b64 = btoa(unescape(encodeURIComponent(JSON.stringify(data)))).replace(/\+/g, '-').replace(/\//g,
                  '_').replace(/=/g, '');
                  const qrText = verifyUrl + '?d=' + b64;

                  try { new QRCode(el, { text: qrText, width: 140, height: 140, colorDark: '#000', colorLight: '#fff',
                  correctLevel: QRCode.CorrectLevel.M }); } catch (ex) { console.error("QR Code rendering blocked:",
                  ex); }
                  }
                  });
                  }, 100);
                  }

                  function openPass() {
                  hideDock();
                  const regs = JSON.parse(localStorage.getItem('u26r') || '[]').reverse();
                  const out = document.getElementById('pass-out');
                  const fetchSection = document.getElementById('fetch-pass-section');
                  if (!regs.length) {
                  out.innerHTML = '';
                  fetchSection.style.display = 'block';
                  document.getElementById('fetch-regno').value = '';
                  document.getElementById('fetch-status').textContent = '';
                  document.getElementById('fetch-status').className = 'fetch-status';
                  document.getElementById('pass-ov').classList.add('open');
                  return;
                  }
                  fetchSection.style.display = 'none';
                  out.innerHTML = renderPassCards(regs);
                  // Show fetch option below existing passes
                  out.innerHTML += `<div
                    style="margin-top:20px;padding:16px;text-align:center;background:rgba(255,255,255,.03);border:1px solid var(--border);border-radius:10px">
                    <div style="font-size:11px;color:var(--muted2);margin-bottom:10px;letter-spacing:1px">Registered on
                      another device?</div>
                    <div style="display:flex;gap:8px">
                      <input class="fi" id="fetch-email-inline" type="number" inputmode="numeric" pattern="[0-9]*"
                        placeholder="Enter your Reg No" style="flex:1"
                        oninput="this.value = this.value.replace(/[^0-9]/g, '')"
                        onkeypress="return /[0-9]/.test(event.key)">
                      <button class="btn-fill" style="white-space:nowrap;padding:10px 16px;font-size:12px"
                        onclick="fetchMyPass(document.getElementById('fetch-email-inline').value)">Fetch</button>
                    </div>
                    <div class="fetch-status" id="fetch-status-inline" style="margin-top:8px"></div>
                  </div>`;
                  document.getElementById('pass-ov').classList.add('open');
                  generateQRs(regs);
                  backgroundValidatePasses(regs);
                  }

                  async function backgroundValidatePasses(localRegs) {
                  if (!SHEETS_URL || SHEETS_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE' || localRegs.length === 0)
                  return;

                  const emails = [...new Set(localRegs.map(r => r.email).filter(e => !!e))];
                  let updatedAny = false;
                  let allLatest = [];

                  try {
                  for (const email of emails) {
                  const url =
                  `${SHEETS_URL}?action=lookup&email=${encodeURIComponent(email)}&uid=${ADMIN_ID}&pwd=${ADMIN_PASS}`;
                  const resp = await fetch(url);
                  const data = await resp.json();
                  if (data.registrations) {
                  allLatest = allLatest.concat(data.registrations);
                  }
                  }

                  // Merge/Sync Logic: Only remove a local pass if we verified the email
                  // AND the server successfully returned a non-empty list that specifically excludes this registration.
                  // This prevents passes from disappearing due to sync delays or network glitches.
                  const currentLocal = JSON.parse(localStorage.getItem('u26r') || '[]');
                  const filtered = currentLocal.filter(loc => {
                  if (emails.includes(loc.email)) {
                  const remoteForThisEmail = allLatest.filter(rem => rem.email === loc.email);
                  if (remoteForThisEmail.length > 0) {
                  return remoteForThisEmail.some(rem => rem.regId === loc.regId);
                  }
                  // If server returned 0 results for this email, keep local pass (safety against sync delay)
                  return true;
                  }
                  return true;
                  });

                  if (filtered.length !== currentLocal.length) {
                  localStorage.setItem('u26r', JSON.stringify(filtered));
                  if (filtered.length === 0) document.getElementById('pass-nav-btn').style.display = 'inline-flex';

                  // Quietly re-render if the user is still looking at the passes
                  if (document.getElementById('pass-ov').classList.contains('open')) {
                  const out = document.getElementById('pass-out');
                  if (filtered.length === 0) {
                  out.innerHTML = '';
                  document.getElementById('fetch-pass-section').style.display = 'block';
                  } else {
                  out.innerHTML = renderPassCards([...filtered].reverse());
                  generateQRs(filtered);
                  }
                  }
                  }
                  } catch (e) { console.error('BG Validation failed', e); }
                  }
                  function closePass() { document.getElementById('pass-ov').classList.remove('open'); showDock(); }

                  function logoutAdmin() {
                  closeAdmin();
                  openAdminLogin();
                  }

                  /* ── FETCH PASS FROM GOOGLE SHEETS ── */
                  async function fetchMyPass(regnoArg) {
                  // Always update the button FIRST so user sees feedback immediately
                  const fetchBtn = document.getElementById('fetch-pass-btn');
                  if (fetchBtn) { fetchBtn.disabled = true; fetchBtn.textContent = 'Fetching...'; }

                  const restoreBtn = () => {
                  if (fetchBtn) { fetchBtn.disabled = false; fetchBtn.textContent = 'Fetch My Pass'; }
                  };

                  const regno = (regnoArg || document.getElementById('fetch-regno')?.value || '').replace(/[^0-9]/g,
                  '').trim();
                  const statusEl = document.getElementById('fetch-status');

                  if (!statusEl) { restoreBtn(); return; }

                  if (!regno || regno.length < 7) {
                    statusEl.textContent='Please enter a valid Register Number (minimum 7 digits).' ;
                    statusEl.className='fetch-status error' ; restoreBtn(); return; } if (!SHEETS_URL ||
                    SHEETS_URL==='YOUR_GOOGLE_APPS_SCRIPT_URL_HERE' ) {
                    statusEl.textContent='⚠ System not configured. Contact admin.' ;
                    statusEl.className='fetch-status error' ; restoreBtn(); return; } statusEl.textContent='' ;
                    statusEl.className='fetch-status' ; try { // fetchRegno path: look up all registrations where RegNo
                    matches in the Registrations sheet const
                    url=`${SHEETS_URL}?action=lookup&fetchRegno=${encodeURIComponent(regno)}`; const controller=new
                    AbortController(); const tid=setTimeout(()=> controller.abort(), 12000);
                    const resp = await fetch(url, { signal: controller.signal });
                    clearTimeout(tid);

                    if (!resp.ok) {
                    statusEl.textContent = 'Failed to load. Contact Admin';
                    statusEl.className = 'fetch-status error';
                    restoreBtn();
                    return;
                    }

                    const data = await resp.json();

                    if (!data.found || !data.registrations || data.registrations.length === 0) {
                    statusEl.textContent = '❌ No registration found for this Register Number. Double-check and try
                    again.';
                    statusEl.className = 'fetch-status error';
                    restoreBtn();
                    return;
                    }

                    // Merge into localStorage — avoid duplicate regIds
                    const saved = JSON.parse(localStorage.getItem('u26r') || '[]');
                    let added = 0;
                    data.registrations.forEach(r => {
                    if (!saved.some(s => s.regId === r.regId)) {
                    saved.push(r);
                    added++;
                    }
                    });
                    localStorage.setItem('u26r', JSON.stringify(saved));
                    document.getElementById('pass-nav-btn').style.display = 'inline-flex';

                    // Success — update the button to show confirmed state
                    if (fetchBtn) { fetchBtn.textContent = '✓ Done'; }
                    statusEl.textContent = `Fetched ${data.registrations.length} registered event(s)`;
                    statusEl.className = 'fetch-status success';

                    setTimeout(() => { openPass(); restoreBtn(); }, 800);

                    } catch (err) {
                    statusEl.textContent = 'Failed to load. Contact Admin';
                    statusEl.className = 'fetch-status error';
                    restoreBtn();
                    }
                    }

                    /* ── CLOSE REG ── */
                    function resetRegState() {
                    // Always reset submission locks when overlay closes, but NOT the background cooldown timer!
                    isSubmitting = false;
                    window.onbeforeunload = null;

                    const btn = document.querySelector('#step-2 .reg-next-btn');
                    const backBtn = document.querySelector('#step-2 .reg-back-btn');

                    // Only reset the confirm button if the global spam-timer is NOT running
                    if (!isCooldown && btn) {
                    btn.disabled = false;
                    btn.textContent = 'Confirm Registration';
                    btn.style.opacity = '1';
                    }
                    if (backBtn) {
                    backBtn.style.pointerEvents = 'auto';
                    backBtn.style.opacity = '1';
                    }
                    }
                    // NOTE: closeRegOv and forceCloseReg are defined above (lines ~10917 & ~10908)
                    // These duplicate definitions are intentionally removed to avoid shadowing.

                    /* ════════ ADMIN PANEL ════════ */
                    let allAdminRegs = [];
                    async function openAdmin() {
                    hideDock();
                    const statusEl = document.getElementById('sync-status');
                    statusEl.textContent = 'Loading registrations from Google Sheets...';
                    statusEl.className = 'sync-status loading';

                    let regs = JSON.parse(localStorage.getItem('u26r') || '[]');

                    if (SHEETS_URL && SHEETS_URL !== 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
                    try {
                    const resp = await fetch(`${SHEETS_URL}?action=getRegs&uid=${ADMIN_ID}&pwd=${ADMIN_PASS}`);
                    const data = await resp.json();
                    if (data.registrations) {
                    regs = data.registrations;
                    statusEl.textContent = '✓ Showing real-time data from Google Sheets';
                    statusEl.className = 'sync-status ok';
                    }
                    } catch (err) {
                    statusEl.textContent = '⚠ Failed to fetch from Sheets. Showing local data instead.';
                    statusEl.className = 'sync-status err';
                    }
                    } else {
                    document.getElementById('admin-sheet-link').style.display = 'none';
                    }

                    allAdminRegs = regs;
                    refreshAdminUI(regs);
                    document.getElementById('admin-search').value = '';
                    document.getElementById('admin-ov').classList.add('open');
                    }

                    function renderAdminRegs(regs) {
                    const listEl = document.getElementById('admin-regs-list');
                    if (!listEl) return;

                    if (!regs || regs.length === 0) {
                    listEl.innerHTML = '<div style="text-align:center;padding:30px;color:var(--muted2)">No registrations
                      yet.</div>';
                    return;
                    }

                    listEl.innerHTML = regs.slice().reverse().map(r => {
                    // Safe mapping
                    const rName = r.name || 'Unknown';
                    const rRegNo = r.regno || 'N/A';
                    const rId = r.regId || 'N/A';
                    const rEvName = r.eventName || 'Unnamed Event';
                    const rYear = r.year || '';
                    const rSection = r.section || '';
                    const rPhone = r.phone || '';
                    const rEmail = r.email || '';
                    const rGender = r.gender || '';
                    const rTimeSlot = r.timeSlot || '';

                    // Advanced Date formatting
                    let dateStr = 'Unknown Date';
                    const isBracketOrEmpty = (str) => {
                    if (!str) return true;
                    const s = String(str).trim();
                    return s === '' || s === '[]' || s === '[ ]' || s === '{}' || s === '{ }' || (s.startsWith('[') &&
                    s.endsWith(']'));
                    };

                    if (r.ts && !isBracketOrEmpty(r.ts)) {
                    let d = new Date(r.ts);
                    if (isNaN(d.getTime()) && typeof r.ts === 'string') {
                    const parts = r.ts.split(', ');
                    if (parts.length === 2) {
                    const cleanDate = parts[0].replace(/-/g, '/');
                    d = new Date(`${cleanDate} ${parts[1] || ''}`);
                    }
                    }
                    if (!isNaN(d.getTime())) {
                    dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' · ' +
                    d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
                    } else {
                    dateStr = typeof r.ts === 'string' && r.ts.length < 30 ? r.ts : 'Unknown Date' ; } } const
                      parsedMembers=getParsedMembers(r); const isTeam=(r.teamName && r.teamName.trim() !=='' &&
                      r.teamName.trim() !=='Solo' ) || (parsedMembers.length> 0);

                      let teamNameDisplay = 'Solo';
                      if (isTeam) {
                      if (r.teamName && !r.teamName.trim().startsWith('[')) {
                      teamNameDisplay = r.teamName;
                      } else {
                      teamNameDisplay = rEvName + ' Team';
                      }
                      }

                      const numMembers = isTeam ? (1 + parsedMembers.length) : 1;

                      let expandedHtml = `
                      <div
                        style="font-size:10px;font-weight:700;letter-spacing:1.5px;color:var(--orange);text-transform:uppercase;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center">
                        <span>Full Details</span>
                        <button onclick="deleteSingleReg('${rId}'); event.stopPropagation();"
                          style="background:rgba(231,76,60,.1);color:#e74c3c;border:1px solid rgba(231,76,60,.2);padding:4px 8px;border-radius:4px;font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;cursor:pointer">Delete
                          Profile</button>
                      </div>
                      <div>
                        <div class="arc-member"><strong>Event:</strong> ${rEvName} ${rTimeSlot ? `[Slot ${rTimeSlot}]` :
                          ''}</div>
                        ${dateStr !== 'Unknown Date' ? `<div class="arc-member"><strong>Date of Reg:</strong> ${dateStr}
                        </div>` : ''}
                        <div class="arc-member" style="margin-top:4px"><strong>Email:</strong> ${rEmail || 'N/A'}</div>
                        <div class="arc-member"><strong>Phone:</strong> ${rPhone || 'N/A'}</div>
                        <div class="arc-member"><strong>Gender:</strong> ${rGender || 'N/A'}</div>
                      </div>
                      `;

                      if (isTeam && parsedMembers.length > 0) {
                      expandedHtml += `<div
                        style="font-size:10px;font-weight:700;color:var(--orange);margin-top:12px;margin-bottom:6px;letter-spacing:1px;text-transform:uppercase">
                        Team Members</div>`;
                      expandedHtml += parsedMembers.map((m, i) => {
                      let det = [];
                      if (m.regno) det.push(m.regno);
                      if (m.gender) det.push(m.gender);
                      if (m.year) det.push('Y' + m.year);
                      return `<div class="arc-member"
                        style="margin-bottom:6px;padding-left:8px;border-left:2px solid var(--border2)">
                        <div style="font-weight:700;color:#fff;margin-bottom:2px">M${i + 2}: ${m.name || 'N/A'}</div>
                        <div style="color:var(--muted2);font-size:11px">${det.join(' · ')}</div>
                      </div>`;
                      }).join('');
                      }

                      return `
                      <div class="admin-reg-card"
                        onclick="this.querySelector('.arc-expanded').classList.toggle('show')">
                        <div class="arc-top">
                          <div class="arc-name">${rName} <span
                              style="font-size:11px;color:var(--muted2);font-weight:400">· ${rRegNo}</span></div>
                          <div class="arc-id">${rId}</div>
                        </div>
                        <div class="arc-meta">
                          ${rYear ? 'Year ' + rYear : ''} ${rSection ? '· Sec ' + rSection : ''} · ${rPhone}<br>
                          ${isTeam ? `Team: ${teamNameDisplay} · ${numMembers} members` : 'Solo Registration'}
                          ${dateStr !== 'Unknown Date' ? `· <span
                            style="color:rgba(255,255,255,.4);font-size:10px">${dateStr}</span>` : ''}
                        </div>
                        <div class="arc-events"><span class="arc-ev-pill">${rEvName}</span></div>
                        <div class="arc-expanded">${expandedHtml}</div>
                      </div>`;
                      }).join('');
                      }

                      function filterAdminRegs() {
                      const q = document.getElementById('admin-search').value.trim().toLowerCase();
                      if (!q) { renderAdminRegs(allAdminRegs); return; }
                      const filtered = allAdminRegs.filter(r =>
                      r.name.toLowerCase().includes(q) || r.regno.toLowerCase().includes(q) ||
                      r.eventName.toLowerCase().includes(q) || r.regId.toLowerCase().includes(q) ||
                      (r.teamName || '').toLowerCase().includes(q) || r.email.toLowerCase().includes(q)
                      );
                      renderAdminRegs(filtered);
                      }

                      function closeAdmin() { document.getElementById('admin-ov').classList.remove('open'); showDock();
                      }

                      async function syncToSheets() {
                      if (!SHEETS_URL || SHEETS_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
                      document.getElementById('sync-status').className = 'sync-status err';
                      document.getElementById('sync-status').textContent = '⚠ Google Sheets URL not configured.';
                      return;
                      }
                      showAdminLoader('Syncing to Google Sheets...');
                      const regs = JSON.parse(localStorage.getItem('u26r') || '[]');
                      try {
                      const payload = {
                      action: 'syncAll',
                      uid: ADMIN_ID,
                      pwd: ADMIN_PASS,
                      data: regs
                      };
                      const resp = await fetch(SHEETS_URL, {
                      method: 'POST',
                      body: JSON.stringify(payload)
                      });
                      const result = await resp.json();
                      if (result.success) {
                      document.getElementById('sync-status').className = 'sync-status ok';
                      document.getElementById('sync-status').textContent = '✓ Synced ' + regs.length + '
                      registrations!';
                      } else {
                      throw new Error(result.error);
                      }
                      } catch (e) {
                      document.getElementById('sync-status').className = 'sync-status err';
                      document.getElementById('sync-status').textContent = '✗ Sync failed: ' + e.message;
                      } finally {
                      hideAdminLoader();
                      }
                      }

                      function showSheetsSetup() {
                      let existing = document.getElementById('admin-sheets-setup-box');
                      if (existing) existing.remove();

                      const setup = document.createElement('div');
                      setup.id = 'admin-sheets-setup-box';
                      setup.style.cssText = 'background:rgba(255,255,255,.04);border:1px solid
                      var(--border);border-radius:8px;padding:16px;margin-bottom:14px;font-size:12px;color:var(--muted2);line-height:1.8';
                      setup.innerHTML = `
                      <div
                        style="font-size:11px;font-weight:700;letter-spacing:2px;color:var(--orange);text-transform:uppercase;margin-bottom:10px">
                        Google Sheets Setup</div>
                      <ol style="margin-left:14px">
                        <li>Create a new Google Sheet</li>
                        <li>Go to <strong style="color:#fff">Extensions → Apps Script</strong></li>
                        <li><strong style="color:#fff">Delete ALL existing code</strong> and paste this entire code:
                          <div
                            style="padding:10px;background:rgba(0,0,0,.6);border:1px solid rgba(255,255,255,.1);border-radius:6px;margin:8px 0;max-height:200px;overflow-y:auto;font-family:monospace;font-size:10px;color:#aaa;line-height:1.4;white-space:pre">
                            var OFFICIAL_HEADERS = ["RegID", "Name", "RegNo", "Year", "Section", "Phone", "Email",
                            "Event", "TeamName", "TeamMembers", "Timestamp", "Gender", "TimeSlot"];

                            function enforceHeaders(sh) {
                            sh.getRange(1, 1, 1, OFFICIAL_HEADERS.length).setValues([OFFICIAL_HEADERS]);
                            var lc = sh.getLastColumn();
                            if (lc > OFFICIAL_HEADERS.length) sh.getRange(1, OFFICIAL_HEADERS.length + 1,
                            sh.getMaxRows(), lc - OFFICIAL_HEADERS.length).clearContent();
                            }

                            function doGet(e) {
                            var ss = SpreadsheetApp.getActiveSpreadsheet();
                            var sh = ss.getSheetByName("Registrations");
                            if (!sh) return ContentService.createTextOutput(JSON.stringify({found:false,
                            registrations:[]})).setMimeType(ContentService.MimeType.JSON);
                            enforceHeaders(sh);
                            var action = (e.parameter.action || "").trim();
                            if (action === "getRegs") {
                            if (!checkAuth(e)) return ContentService.createTextOutput(JSON.stringify({success:false,
                            error:"Unauthorized"})).setMimeType(ContentService.MimeType.JSON);
                            var data = sh.getDataRange().getValues();
                            if (data.length <= 1) return
                              ContentService.createTextOutput(JSON.stringify({registrations:[]})).setMimeType(ContentService.MimeType.JSON);
                              var headers=OFFICIAL_HEADERS; var results=[]; for (var i=1; i < data.length; i++) { var
                              row=data[i]; var teamMembersRaw=row[headers.indexOf("TeamMembers")] || "[]" ; var
                              teamMembers=[]; try { teamMembers=JSON.parse(teamMembersRaw); } catch(ex) {
                              teamMembers=[]; } results.push({ regId: String(row[headers.indexOf("RegID")] || "" ),
                              name: String(row[headers.indexOf("Name")] || "" ), regno:
                              String(row[headers.indexOf("RegNo")] || "" ), year: String(row[headers.indexOf("Year")]
                              || "" ), section: String(row[headers.indexOf("Section")] || "" ), phone:
                              String(row[headers.indexOf("Phone")] || "" ), email: String(row[headers.indexOf("Email")]
                              || "" ), gender: String(row[headers.indexOf("Gender")] || "" ), eventName:
                              String(row[headers.indexOf("Event")] || "" ), teamName:
                              String(row[headers.indexOf("TeamName")] || "" ), teamMembers: teamMembers, ts:
                              String(row[headers.indexOf("Timestamp")] || "" ) }); } return
                              ContentService.createTextOutput(JSON.stringify({registrations:
                              results})).setMimeType(ContentService.MimeType.JSON); } if (action==="lookupTeamStatus" )
                              { if (!checkAuth(e)) return ContentService.createTextOutput(JSON.stringify({success:false,
                              error:"Unauthorized"})).setMimeType(ContentService.MimeType.JSON); var
                              regId=(e.parameter.regId || "" ).trim(); if (!regId) return
                              ContentService.createTextOutput(JSON.stringify({success:false, error:"Missing
                              regId"})).setMimeType(ContentService.MimeType.JSON); var
                              data=sh.getDataRange().getValues(); var headers=OFFICIAL_HEADERS; var participant=null;
                              for (var i=1; i < data.length; i++) { if (String(data[i][headers.indexOf("RegID")] || ""
                              )===regId) { participant={ regId: regId, name: String(data[i][headers.indexOf("Name")]
                              || "" ), regno: String(data[i][headers.indexOf("RegNo")] || "" ), eventName:
                              String(data[i][headers.indexOf("Event")] || "" ), teamName:
                              String(data[i][headers.indexOf("TeamName")] || "" ), teamMembers:
                              String(data[i][headers.indexOf("TeamMembers")] || "[]" ) }; break; } } if (!participant)
                              return ContentService.createTextOutput(JSON.stringify({success:false, error:"Not
                              found"})).setMimeType(ContentService.MimeType.JSON); var
                              scannerSh=ss.getSheetByName("ScannerLogs") || ss.insertSheet("ScannerLogs"); var
                              sData=scannerSh.getDataRange().getValues(); var enteredIndices=[]; for (var i=1; i <
                              sData.length; i++) { if (String(sData[i][0])===regId &&
                              String(sData[i][1])===participant.eventName) { enteredIndices.push(parseInt(sData[i][3]));
                              // index } } return ContentService.createTextOutput(JSON.stringify({success:true,
                              participant: participant, enteredIndices:
                              enteredIndices})).setMimeType(ContentService.MimeType.JSON); } return
                              ContentService.createTextOutput(JSON.stringify({found:false,
                              registrations:[]})).setMimeType(ContentService.MimeType.JSON); } function doPost(e) { var
                              lock=LockService.getScriptLock(); var successLock=lock.tryLock(28000); if (!successLock)
                              return ContentService.createTextOutput(JSON.stringify({success:false, error:"Server busy,
                              please try again."})).setMimeType(ContentService.MimeType.JSON); try { var
                              ss=SpreadsheetApp.getActiveSpreadsheet(), sh=ss.getSheetByName("Registrations") ||
                              ss.insertSheet("Registrations"); enforceHeaders(sh); var
                              d=JSON.parse(e.postData.contents); if (d.action==="syncAll" ) { d.data.forEach(function(r)
                              { var tName=r.teamName && r.teamName.trim() !=="" ? r.teamName : "Solo" ; var
                              tMem=r.teamMembers && r.teamMembers.length> 0 ? JSON.stringify(r.teamMembers) : "Solo";
                              sh.appendRow([r.regId, r.name, r.regno, r.year, r.section, r.phone, r.email, r.eventName,
                              tName, tMem, r.ts, r.gender||"", r.timeSlot||""]);
                              });
                              SpreadsheetApp.flush();
                              return
                              ContentService.createTextOutput(JSON.stringify({success:true})).setMimeType(ContentService.MimeType.JSON);
                              } else if (d.action === "addReg") {
                              var r = d.data;
                              var tName = r.teamName && r.teamName.trim() !== "" ? r.teamName : "Solo";
                              var tMem = r.teamMembers && r.teamMembers.length > 0 ? JSON.stringify(r.teamMembers) :
                              "Solo";
                              var finalTs = "'" + Utilities.formatDate(new Date(), "Asia/Kolkata", "MM/dd/yyyy, hh:mm:ss
                              a");
                              sh.appendRow([r.regId, r.name, r.regno, r.year, r.section, r.phone, r.email, r.eventName,
                              tName, tMem, finalTs, r.gender||"", r.timeSlot||""]);
                              SpreadsheetApp.flush();
                              return ContentService.createTextOutput(JSON.stringify({success:true,
                              regId:r.regId})).setMimeType(ContentService.MimeType.JSON);
                              } else if (d.action === "deleteReg") {
                              var data = sh.getDataRange().getValues();
                              for(var i = data.length - 1; i >= 1; i--) {
                              if (String(data[i][0]) === String(d.data.regId)) { sh.deleteRow(i + 1); break; }
                              }
                              SpreadsheetApp.flush();
                              return ContentService.createTextOutput(JSON.stringify({success: true}));
                              } else if (d.action === "deleteAll") {
                              var lastRow = sh.getLastRow();
                              if (lastRow > 1) { sh.deleteRows(2, lastRow - 1); SpreadsheetApp.flush(); }
                              return ContentService.createTextOutput(JSON.stringify({success: true}));
                              }
                              } catch(ex) { return ContentService.createTextOutput(JSON.stringify({success:false,
                              error:ex.message})).setMimeType(ContentService.MimeType.JSON); }
                              finally { lock.releaseLock(); }
                              }</div>
                        </li>
                        <li>Click <strong style="color:#fff">Deploy → Manage Deployments</strong></li>
                        <li>Click Edit (crayon icon), select "New Version", then click <strong
                            style="color:#fff">Deploy</strong></li>
                        `;
                        document.getElementById('admin-ov').querySelector('.admin-wrap').insertBefore(setup,
                        document.getElementById('sync-status'));
                        }

                        async function deleteAllData() {
                        if (!verifyAdminOTP('WIPE OUT ALL DATABASE RECORDS')) return;

                        showAdminLoader('Wiping all data from server...');

                        // 1. Clear local
                        localStorage.removeItem('u26r');
                        localStorage.removeItem('u26n');
                        // pass-nav-btn always visible

                        // 2. Clear remote (strict confirmation)
                        if (SHEETS_URL && SHEETS_URL !== 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
                        try {
                        const resp = await fetch(SHEETS_URL, {
                        method: 'POST',
                        body: JSON.stringify({ action: 'deleteAll', uid: ADMIN_ID, pwd: ADMIN_PASS })
                        });
                        const result = await resp.json();
                        if (!result.success) {
                        hideAdminLoader();
                        alert('Failed to clear database: ' + result.error);
                        return;
                        }
                        } catch (e) {
                        hideAdminLoader();
                        alert('Server timeout while wiping data. Please try again.');
                        return;
                        }
                        }

                        // 3. Clear UI
                        allAdminRegs = [];
                        refreshAdminUI([]);
                        hideAdminLoader();
                        alert('All data completely wiped out. Old passes and QR codes are now invalid.');
                        closeAdmin();
                        }

                        /* ── Refresh admin stats/breakdown/list without re-fetching ── */
                        function refreshAdminUI(regs) {
                        if (!regs) regs = [];
                        const totalRegs = regs.length;
                        const totalMembers = regs.reduce((a, r) => a + 1 + (getParsedMembers(r) || []).length, 0);
                        const totalTeams = regs.filter(r => {
                        const evNameRaw = (r.eventName || "").trim().toLowerCase();
                        const ev = EVS.find(e => e.id === r.eventId || (evNameRaw !== "" && e.name.toLowerCase() ===
                        evNameRaw));
                        const isActuallySolo = (r.teamName || "").trim() === "Solo" || (r.teamName ||
                        "").startsWith("[");
                        return ev ? ev.type !== 'Solo' : (!isActuallySolo && (r.teamName || "").trim() !== "");
                        }).length;

                        const statsEl = document.getElementById('admin-stats');
                        if (statsEl) {
                        statsEl.innerHTML = `
                        <div class="admin-stat"><span class="as-n">${totalRegs}</span><span
                            class="as-l">Registrations</span></div>
                        <div class="admin-stat"><span class="as-n">${totalMembers}</span><span class="as-l">Total
                            Members</span></div>
                        <div class="admin-stat"><span class="as-n">${totalTeams}</span><span class="as-l">Teams</span>
                        </div>
                        <div class="admin-stat"><span class="as-n">${EVS.length}</span><span class="as-l">Events</span>
                        </div>`;
                        }

                        // Department summary (Year only)
                        const yearCounts = {};
                        regs.forEach(r => {
                        yearCounts[r.year] = (yearCounts[r.year] || 0) + 1;
                        });
                        let deptHtml = '<div style="font-size:11px;color:var(--muted);margin-bottom:8px">By Year</div>
                        <div class="admin-dept-grid">';
                          ['1', '2', '3', '4'].forEach(y => {
                          deptHtml += `<div class="admin-dept-card"><span class="adc-n">${yearCounts[y] ||
                              0}</span><span class="adc-l">Year ${y}</span></div>`;
                          });
                          deptHtml += '</div>';
                        document.getElementById('admin-dept-summary').innerHTML = deptHtml;

                        // Event breakdown — show all EVS events + any old events with registrations
                        const knownIds = EVS.map(e => e.id);
                        const oldEventRegs = regs.filter(r => !knownIds.includes(r.eventId));
                        const oldEventIds = [...new Set(oldEventRegs.map(r => r.eventId))];

                        const techEvsBd = EVS.filter(e => e.category === 'Technical');
                        const nonTechEvsBd = EVS.filter(e => e.category === 'Non-Technical');

                        function adminEvRow(e, regsArr) {
                        const evRegs = regsArr.filter(r =>
                        r.eventId === e.id ||
                        ((r.eventName || "") + "").trim().toLowerCase() === e.name.toLowerCase()
                        );
                        const evMembers = evRegs.reduce((a, r) => a + 1 + getParsedMembers(r).length, 0);
                        return `<div class="admin-ev-row">
                          <div class="aer-left">
                            <div class="aer-icon"
                              style="width:32px;height:32px;border-radius:6px;background:${e.accent}15;border:1px solid ${e.accent}30;display:flex;align-items:center;justify-content:center;flex-shrink:0">
                              <span
                                style="color:${e.accent};font-weight:900;font-size:11px;font-family:'Barlow Condensed',sans-serif;letter-spacing:1px">${e.tag.slice(0,
                                3).toUpperCase()}</span></div>
                            <div class="aer-name">${e.name}</div>
                          </div>
                          <div class="aer-stats">
                            <div class="aer-stat"><span class="aer-n">${evRegs.length}</span><span
                                class="aer-l">${e.type === 'Solo' ? 'Regs' : 'Teams'}</span></div>
                            ${e.type !== 'Solo' ? `<div class="aer-stat"><span class="aer-n">${evMembers}</span><span
                                class="aer-l">Members</span></div>` : ''}
                          </div>
                        </div>`;
                        }

                        let breakdownHtml = `<div
                          style="font-family:'Barlow Condensed',sans-serif;font-size:14px;font-weight:800;color:#2ecc71;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px;display:flex;align-items:center;gap:6px">
                          <span style="text-shadow:0 0 6px rgba(46,204,113,.4);font-size:16px">&lt;/&gt;</span>
                          Technical</div>`;
                        breakdownHtml += techEvsBd.map(e => adminEvRow(e, regs)).join('');
                        breakdownHtml += `<div
                          style="font-family:'Barlow Condensed',sans-serif;font-size:14px;font-weight:800;color:var(--orange);text-transform:uppercase;letter-spacing:2px;margin:14px 0 8px;padding-top:12px;border-top:1px solid var(--border);display:flex;align-items:center;gap:6px">
                          <span style="text-shadow:0 0 6px rgba(232,84,26,.4);font-size:16px">{ }</span> Non-Technical
                        </div>`;
                        breakdownHtml += nonTechEvsBd.map(e => adminEvRow(e, regs)).join('');


                        document.getElementById('admin-ev-breakdown').innerHTML = breakdownHtml;

                        renderAdminRegs(regs);
                        }

                        async function deleteSingleReg(regId) {
                        if (!verifyAdminOTP(`delete Registration ID: ${regId}`)) return;

                        showAdminLoader('Deleting Registration...');

                        // 1. Remove from local storage
                        let localRegs = JSON.parse(localStorage.getItem('u26r') || '[]');
                        localRegs = localRegs.filter(r => r.regId !== regId);
                        localStorage.setItem('u26r', JSON.stringify(localRegs));

                        if (localRegs.length === 0) {
                        // pass-nav-btn always visible
                        }

                        // 2. Remove from in-memory admin data & re-render UI immediately
                        allAdminRegs = allAdminRegs.filter(r => r.regId !== regId);
                        refreshAdminUI(allAdminRegs);

                        // 3. Delete definitively from Google Sheets (strict confirmation)
                        if (SHEETS_URL && SHEETS_URL !== 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
                        try {
                        const resp = await fetch(SHEETS_URL, {
                        method: 'POST',
                        body: JSON.stringify({ action: 'deleteReg', uid: ADMIN_ID, pwd: ADMIN_PASS, data: { regId } })
                        });
                        const result = await resp.json();
                        if (!result.success) {
                        hideAdminLoader();
                        alert('Failed to delete on server: ' + (result.error || 'Unauthorized'));
                        return;
                        }
                        } catch (e) {
                        hideAdminLoader();
                        alert('The server is under heavy load and timed out. Deletion failed.');
                        return;
                        }
                        }

                        hideAdminLoader();
                        }

                        function showAdminLoader(msg) {
                        document.getElementById('al-text').innerHTML = msg || 'Processing...';
                        document.getElementById('admin-loader-ov').classList.add('active');
                        }
                        function hideAdminLoader() {
                        document.getElementById('admin-loader-ov').classList.remove('active');
                        }

                        /* ════════ COUNTDOWN ════════ */
                        function tick() {
                        const target = new Date('2026-04-13T09:00:00');
                        const diff = target - new Date();
                        if (diff <= 0) return; const elements={ 'rw-d' : Math.floor(diff / 86400000), 'rw-h' :
                          Math.floor(diff % 86400000 / 3600000), 'rw-m' : Math.floor(diff % 3600000 / 60000), 'rw-s' :
                          Math.floor(diff % 60000 / 1000) }; for (const [id, val] of Object.entries(elements)) { const
                          el=document.getElementById(id); if (el) { const strVal=String(val).padStart(2, '0' ); if
                          (el.textContent !==strVal) { el.style.opacity='0' ; setTimeout(()=> {
                          el.textContent = strVal;
                          el.style.opacity = '1';
                          }, 150);
                          }
                          }
                          }
                          }

                          /* ════════ NAV SCROLL ════════ */
                          window.addEventListener('scroll', () => {
                          document.querySelector('.nav').style.background = window.scrollY > 50 ? 'rgba(10,10,10,.98)' :
                          'rgba(10,10,10,.95)';
                          });


                          /* ════════ ADMIN LOGIN ════════ */
                          let loginType = 'admin'; // 'admin' or 'scanner'

                          function openAdminLogin(type) {
                          loginType = type || 'admin';
                          const title = document.getElementById('admin-login-ov').querySelector('.admin-login-title');
                          const sub = document.getElementById('admin-login-ov').querySelector('.admin-login-sub');

                          if (loginType === 'scanner') {
                          title.innerHTML = 'Scanner <span style="color:var(--orange)">Login</span>';
                          sub.textContent = 'Enter scanner credentials (utsavqr)';
                          } else {
                          title.innerHTML = 'Admin <span style="color:var(--orange)">Login</span>';
                          sub.textContent = 'Enter admin credentials to access the panel';
                          }

                          document.getElementById('admin-uid').value = '';
                          document.getElementById('admin-pwd').value = '';
                          document.getElementById('admin-login-err').classList.remove('show');
                          document.getElementById('admin-login-ov').classList.add('open');
                          }

                          function closeAdminLogin() {
                          document.getElementById('admin-login-ov').classList.remove('open');
                          }

                          window.checkAdminLogin = async function () {
                          const uid = document.getElementById('admin-uid').value.trim();
                          const pwd = document.getElementById('admin-pwd').value.trim();

                          if (loginType === 'admin') {
                          if (uid === ADMIN_ID && pwd === ADMIN_PASS) {
                          showAdminLoader('Authenticating Admin...');
                          localStorage.setItem('utsav_auth', 'admin');
                          localStorage.removeItem('u26r'); // Clear stale test data for fresh sync
                          closeAdminLogin();
                          await openAdmin();
                          hideAdminLoader();
                          } else {
                          showLoginError();
                          }
                          } else if (loginType === 'scanner') {
                          if (uid === 'utsavqr' && pwd === '93611') {
                          showAdminLoader('Initializing Scanner...');
                          localStorage.setItem('utsav_auth', 'scanner');
                          closeAdminLogin();
                          await openScanner();
                          hideAdminLoader();
                          } else {
                          showLoginError();
                          }
                          }
                          };

                          function showLoginError() {
                          document.getElementById('admin-login-err').classList.add('show');
                          const box = document.getElementById('admin-login-ov').querySelector('.admin-login-box');
                          box.style.animation = 'none';
                          void box.offsetWidth;
                          box.style.animation = '';
                          }

                          /* ════════ HIDDEN PORTAL ════════ */
                          let portalTimer = null;
                          function startPortalTrigger() {
                          const triggers = ['logo-trigger', 'maint-trigger'].map(id =>
                          document.getElementById(id)).filter(Boolean);
                          if (triggers.length === 0) return;
                          const start = (e) => {
                          e.preventDefault();
                          portalTimer = setTimeout(() => {
                          openPortal();
                          }, 1000);
                          };
                          const end = () => clearTimeout(portalTimer);
                          triggers.forEach(el => {
                          el.addEventListener('mousedown', start);
                          el.addEventListener('touchstart', start, { passive: false });
                          el.addEventListener('mouseup', end);
                          el.addEventListener('mouseleave', end);
                          el.addEventListener('touchend', end);
                          });
                          }

                          function openPortal() { document.getElementById('portal-ov').classList.add('open'); }
                          function closePortal() { document.getElementById('portal-ov').classList.remove('open'); }

                          function portalToAdmin() { closePortal(); openAdminLogin('admin'); }
                          function portalToScanner() { closePortal(); openAdminLogin('scanner'); }

                          /* ════════ QR SCANNER ════════ */
                          let html5QrCode = null;
                          let currentScanData = null;

                          let scannerRegistry = []; // Local cache for instant lookup

                          async function openScanner() {
                          // Setup counter UI
                          updateScanCounter(0);
                          try { audioCtx.resume(); } catch (e) { } // resume audio context legally on user interaction

                          hideDock();
                          document.getElementById('scanner-ov').classList.add('open');
                          document.getElementById('scan-status-msg').textContent = 'Flash Mode Syncing...';

                          // OPTIMIZATION: Start background registry sync once
                          if (scannerRegistry.length === 0) {
                          fetch(`${SHEETS_URL}?action=getRegs&uid=${SCANNER_ID}&pwd=${ADMIN_PASS}&_t=${Date.now()}`)
                          .then(r => r.json())
                          .then(d => {
                          if (d.registrations) {
                          scannerRegistry = d.registrations;
                          document.getElementById('scan-status-msg').textContent = 'Flash Mode Ready ⚡';
                          }
                          }).catch(() => { });
                          } else {
                          document.getElementById('scan-status-msg').textContent = 'Camera Ready';
                          }

                          if (!html5QrCode) {
                          html5QrCode = new Html5Qrcode("reader");
                          }

                          const config = {
                          fps: 20,
                          qrbox: { width: 250, height: 250 },
                          aspectRatio: 1.0,
                          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE]
                          };

                          try {
                          await html5QrCode.start(
                          { facingMode: "environment" },
                          config,
                          onScanSuccess
                          ).catch(() => {
                          return html5QrCode.start({ facingMode: "user" }, config, onScanSuccess);
                          });
                          if (!scannerRegistry.length) document.getElementById('scan-status-msg').textContent = 'Camera
                          Ready';
                          } catch (e) {
                          document.getElementById('scan-status-msg').textContent = 'Camera Error: Check Permissions';
                          }
                          }

                          async function closeScanner() {
                          if (html5QrCode) {
                          try { await html5QrCode.stop(); } catch (e) { console.error("Scanner stop failed:", e); }
                          }
                          document.getElementById('scanner-ov').classList.remove('open');
                          showDock();
                          }

                          let selectedMembers = new Set();
                          let sessionScans = parseInt(localStorage.getItem('utsav_scans') || 0);

                          const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                          function playScanAudio(type) {
                          try {
                          if (audioCtx.state === 'suspended') audioCtx.resume();
                          const osc = audioCtx.createOscillator();
                          const gain = audioCtx.createGain();
                          osc.connect(gain);
                          gain.connect(audioCtx.destination);
                          if (type === 'success') {
                          osc.type = 'sine'; osc.frequency.setValueAtTime(800, audioCtx.currentTime);
                          gain.gain.setValueAtTime(0.5, audioCtx.currentTime);
                          gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
                          osc.start(); osc.stop(audioCtx.currentTime + 0.3);
                          setTimeout(() => {
                          const osc2 = audioCtx.createOscillator(); const gain2 = audioCtx.createGain();
                          osc2.connect(gain2); gain2.connect(audioCtx.destination);
                          osc2.type = 'sine'; osc2.frequency.setValueAtTime(1200, audioCtx.currentTime);
                          gain2.gain.setValueAtTime(0.5, audioCtx.currentTime);
                          gain2.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
                          osc2.start(); osc2.stop(audioCtx.currentTime + 0.3);
                          }, 100);
                          } else {
                          osc.type = 'square'; osc.frequency.setValueAtTime(150, audioCtx.currentTime);
                          gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
                          gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
                          osc.start(); osc.stop(audioCtx.currentTime + 0.4);
                          }
                          } catch (e) { }
                          }

                          function flashScreen(type) {
                          const ov = document.getElementById('flash-ov');
                          if (!ov) return;
                          ov.style.background = type === 'success' ? 'rgba(46, 204, 113, 0.2)' : 'rgba(231, 76, 60,
                          0.2)';
                          ov.style.opacity = '1';
                          setTimeout(() => { ov.style.opacity = '0'; }, 400);
                          }

                          function updateScanCounter(increment) {
                          if (increment) sessionScans += increment;
                          localStorage.setItem('utsav_scans', sessionScans);
                          const disp = document.getElementById('scan-counter-display');
                          if (disp) disp.innerHTML = `SESSION SCANS: <span
                            style="font-weight:900;color:#fff">${sessionScans}</span>`;
                          }

                          async function onScanSuccess(decodedText) {
                          if (typeof navigator.vibrate === "function") navigator.vibrate(100);

                          let regId = null;
                          let instantDataRaw = null;

                          // 1. DECODE INSTANTLY (existing QR decode — UNTOUCHED)
                          if (decodedText.includes('?d=')) {
                          try {
                          const b64Raw = decodedText.split('?d=')[1];
                          // Robust Base64 decode: inverse of the URL-safe transform
                          let safeB64 = b64Raw.replace(/-/g, '+').replace(/_/g, '/').replace(/ /g, '+');
                          while (safeB64.length % 4) safeB64 += '=';

                          instantDataRaw = JSON.parse(decodeURIComponent(escape(atob(safeB64))));
                          regId = instantDataRaw.id;
                          } catch (e) { }
                          }

                          if (!regId) {
                          const match = decodedText.match(/(CSEUTSAV'26|U26)-[A-Z0-9-]+/i);
                          if (match) regId = match[0].toUpperCase();
                          }

                          if (regId) {
                          if (html5QrCode) {
                          try { await html5QrCode.stop(); } catch (e) { }
                          }

                          // Build local fallback from QR data (full data now)
                          let localReg = scannerRegistry.find(r => r.regId === regId);
                          if (!localReg && instantDataRaw) {
                          localReg = {
                          regId: instantDataRaw.id,
                          name: instantDataRaw.n,
                          regno: instantDataRaw.rn || '',
                          eventName: instantDataRaw.e,
                          phone: instantDataRaw.ph || '',
                          teamName: instantDataRaw.t || 'Solo',
                          year: instantDataRaw.yr || '',
                          section: instantDataRaw.sec || '',
                          teamMembers: (instantDataRaw.tm || []).map(m => ({
                          name: m.n, regno: m.r, year: m.y, section: m.s, phone: m.p
                          }))
                          };
                          }

                          // Show loading while fetching team status
                          const resBox = document.getElementById('scanner-results');
                          const resContent = document.getElementById('res-content');

                          // If results are NOT already open, show the full loader
                          if (!resBox.classList.contains('open')) {
                          resContent.innerHTML = `
                          <div class="scanner-result-card" style="text-align:center;padding:40px 20px">
                            <div class="al-spinner" style="width:60px;height:60px;border-width:4px;margin:0 auto"></div>
                            <div
                              style="margin-top:20px;font-family:'Barlow Condensed',sans-serif;font-size:22px;font-weight:800;letter-spacing:2px;color:#fff;text-transform:uppercase;animation:res-pulse 1.5s infinite">
                              Fetching Team Status</div>
                            <div style="margin-top:8px;font-size:12px;color:var(--muted2);letter-spacing:1px">${regId}
                            </div>
                          </div>
                          `;
                          document.getElementById('mark-scanned-btn').style.display = 'none';
                          resBox.classList.add('open');
                          } else {
                          // If already open (e.g. scanning next teammate), show a subtle loader overlay on top
                          const subLoader = document.createElement('div');
                          subLoader.id = 'scanner-sub-loader';
                          subLoader.style.cssText =
                          'position:absolute;inset:0;background:rgba(22,22,22,0.8);backdrop-filter:blur(4px);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:100;border-radius:24px
                          24px 0 0;opacity:0;transition:opacity 0.2s;';
                          subLoader.innerHTML = `
                          <div class="al-spinner" style="width:40px;height:40px;border-width:3px"></div>
                          <div
                            style="margin-top:12px;color:#fff;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase">
                            Updating...</div>
                          `;
                          resBox.appendChild(subLoader);
                          setTimeout(() => subLoader.style.opacity = '1', 10);
                          }

                          // Backend verify
                          verifyQR(regId, localReg);
                          }
                          }
                          async function verifyQR(regId, localReg) {
                          try {
                          // Optimized check: passing credentials to authenticate registry lookup
                          const resp = await
                          fetch(`${SHEETS_URL}?action=lookupTeamStatus&regId=${regId}&uid=${SCANNER_ID}&pwd=${ADMIN_PASS}&_t=${Date.now()}`);
                          const result = await resp.json();

                          if (!result.success || !result.participant) {
                          hideAdminLoader();
                          playScanAudio('error');
                          flashScreen('error');
                          // Instantly show the bold 🔴 INVALID PASS UI, bypassing alerts and fallback
                          document.getElementById('res-content').innerHTML = `
                          <div class="scanner-result-card"
                            style="text-align:center;padding:50px 20px; border: 2px solid rgba(231,76,60,.4); background: rgba(231,76,60,.05);">
                            <div
                              style="font-size:70px;line-height:1;margin-bottom:15px;text-shadow: 0 0 20px rgba(231,76,60,.5);">
                              ❌</div>
                            <div
                              style="font-family:'Barlow Condensed',sans-serif;font-size:36px;font-weight:900;letter-spacing:2px;color:#e74c3c;text-transform:uppercase;">
                              INVALID PASS</div>
                            <div style="margin-top:10px;font-size:13px;color:rgba(255,255,255,.6);letter-spacing:1px">
                              ${regId} is not in database.</div>
                            <div style="margin-top:8px;font-size:11px;color:#e74c3c;">Registry mismatch or deleted.
                            </div>
                          </div>
                          `;
                          document.getElementById('mark-scanned-btn').style.display = 'none';
                          document.getElementById('scanner-results').classList.add('open');

                          // Auto-resume scanner instantly after short visual delay
                          setTimeout(() => { closeScanResults(); }, 1800);
                          return;
                          }

                          hideAdminLoader();
                          const subLoader = document.getElementById('scanner-sub-loader');
                          if (subLoader) {
                          subLoader.style.opacity = '0';
                          setTimeout(() => subLoader.remove(), 200);
                          }

                          selectedMembers = new Set();
                          renderTeamScanUI(result.participant, result.enteredIndices || []);
                          document.getElementById('scanner-results').classList.add('open');

                          } catch (e) {
                          console.error(e);
                          hideAdminLoader();
                          playScanAudio('error');
                          flashScreen('error');
                          document.getElementById('res-content').innerHTML = `
                          <div class="scanner-result-card"
                            style="text-align:center;padding:50px 20px; border: 2px solid rgba(241,196,15,.4); background: rgba(241,196,15,.05);">
                            <div
                              style="font-size:60px;line-height:1;margin-bottom:15px;text-shadow: 0 0 20px rgba(241,196,15,.5);">
                              ⚠️</div>
                            <div
                              style="font-family:'Barlow Condensed',sans-serif;font-size:32px;font-weight:900;letter-spacing:2px;color:#f1c40f;text-transform:uppercase;">
                              NETWORK ERROR</div>
                            <div style="margin-top:10px;font-size:13px;color:rgba(255,255,255,.6);letter-spacing:1px">
                              Check server connection.</div>
                          </div>
                          `;
                          document.getElementById('mark-scanned-btn').style.display = 'none';
                          document.getElementById('scanner-results').classList.add('open');
                          setTimeout(() => { closeScanResults(); }, 1800);
                          }
                          }

                          function renderTeamScanUI(reg, enteredIndices) {
                          currentScanData = reg;
                          const members = getParsedMembers(reg);
                          const allMembers = [
                          { name: reg.name, regno: reg.regno, year: reg.year, section: reg.section, phone: reg.phone,
                          isLeader: true },
                          ...members.map(m => ({ name: m.name, regno: m.regno, year: m.year || m.y || '', section:
                          m.section || m.s || '', phone: m.phone || m.p || '', isLeader: false }))
                          ];
                          const totalMembers = allMembers.length;
                          const enteredCount = enteredIndices.length;
                          const allEntered = enteredCount >= totalMembers;
                          const progressPct = totalMembers > 0 ? Math.round((enteredCount / totalMembers) * 100) : 0;
                          const checkSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff"
                            stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>';

                          const badgeColor = allEntered ? '#f39c12' : '#2ecc71';
                          const badgeText = allEntered ? '⚠️ ALREADY SCANNED' : '✅ VERIFIED PASS';
                          const badgeBg = allEntered ? 'rgba(243,156,18,0.15)' : 'rgba(46,204,113,0.15)';

                          let content = `
                          <div class="scanner-result-card" style="position:relative; padding-top:20px">
                            <div style="text-align:center;margin-bottom:20px">

                              <!-- DYNAMIC HARDENED STATUS BADGE -->
                              <div
                                style="background:${badgeBg}; border: 2px solid ${badgeColor}; color: ${badgeColor}; padding: 8px 18px; border-radius: 50px; display: inline-flex; align-items: center; justify-content: center; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; font-size: 14px; margin-bottom: 24px; box-shadow: 0 0 20px ${badgeBg};">
                                ${badgeText}
                              </div>

                              <div
                                style="font-size:10px;font-weight:900;letter-spacing:3px;color:var(--muted2);text-transform:uppercase;margin-bottom:6px">
                                Team Entry</div>
                              <div
                                style="font-family:'Barlow Condensed',sans-serif;font-size:28px;font-weight:900;color:#fff;letter-spacing:.5px">
                                ${reg.teamName && reg.teamName !== 'Solo' ? reg.teamName : reg.name}</div>
                              <div style="margin-top:10px;display:flex;flex-wrap:wrap;gap:6px;justify-content:center">
                                <span
                                  style="background:rgba(232,84,26,.1);color:var(--orange);padding:6px 14px;border-radius:8px;font-size:11px;font-weight:800;text-transform:uppercase;border:1px solid rgba(232,84,26,.2)">${reg.eventName}</span>
                                <span
                                  style="color:var(--muted2);font-size:11px;font-family:monospace;background:rgba(255,255,255,.03);padding:4px 8px;border-radius:4px">${reg.regId}</span>
                              </div>
                            </div>

                            ${allEntered ? `
                            <div class="team-completed-banner"
                              style="border-color:#f39c12; background:rgba(243,156,18,0.1)">
                              <div class="tc-icon" style="color:#f39c12">⚠️</div>
                              <div class="tc-title" style="color:#f39c12">Team Completed</div>
                              <div class="tc-sub">All ${totalMembers} members have entered</div>
                            </div>` : ''}

                            <div class="team-progress">
                              <div class="team-progress-bar">
                                <div class="team-progress-fill" style="width:${progressPct}%"></div>
                              </div>
                              <div class="team-progress-text">${enteredCount} / ${totalMembers} Entered</div>
                            </div>

                            <div
                              style="font-size:10px;font-weight:900;letter-spacing:2px;color:var(--muted2);text-transform:uppercase;margin:16px 0 10px">
                              ${allEntered ? 'All Members Entered' : 'Select Members to Mark Entry'}</div>
                            <div id="team-member-list">
                              ${allMembers.map((m, i) => {
                              const isEntered = enteredIndices.includes(i);
                              return `
                              <div class="member-card ${isEntered ? 'entered' : ''}" id="member-card-${i}" ${isEntered
                                ? '' : `onclick="toggleMember(${i})" `} data-index="${i}">
                                <div class="member-checkbox" id="member-cb-${i}">${isEntered ? checkSvg : ''}</div>
                                <div class="member-info">
                                  <div class="member-name">${m.name || '—'} ${m.isLeader ? '<span
                                      style="font-size:9px;color:var(--orange);font-weight:900;margin-left:4px;text-transform:uppercase">(Leader)</span>'
                                    : ''}</div>
                                  <div class="member-detail">${m.regno || '—'} · Year ${m.year || '—'} · Sec ${m.section
                                    || '—'}</div>
                                </div>
                                <div class="member-status ${isEntered ? 'status-entered' : 'status-new'}">${isEntered ?
                                  '✓ Entered' : 'Not Entered'}</div>
                              </div>`;
                              }).join('')}
                            </div>
                          </div>
                          `;

                          document.getElementById('res-content').innerHTML = content;

                          const markBtn = document.getElementById('mark-scanned-btn');
                          if (allEntered) {
                          markBtn.style.display = 'none';
                          } else {
                          markBtn.style.display = 'block';
                          markBtn.disabled = true;
                          markBtn.innerHTML = '☑️ SELECT MEMBERS ABOVE';
                          markBtn.style.background = 'var(--border2)';
                          markBtn.style.color = 'var(--muted)';
                          markBtn.onclick = markTeamEntry;
                          }
                          }

                          function toggleMember(index) {
                          const card = document.getElementById('member-card-' + index);
                          const cb = document.getElementById('member-cb-' + index);
                          const checkSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff"
                            stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>';
                          if (typeof navigator.vibrate === "function") navigator.vibrate(15);
                          if (selectedMembers.has(index)) {
                          selectedMembers.delete(index);
                          card.classList.remove('selected');
                          cb.innerHTML = '';
                          } else {
                          selectedMembers.add(index);
                          card.classList.add('selected');
                          cb.innerHTML = checkSvg;
                          }
                          const markBtn = document.getElementById('mark-scanned-btn');
                          if (selectedMembers.size > 0) {
                          markBtn.disabled = false;
                          markBtn.innerHTML = `✅ MARK ${selectedMembers.size} MEMBER${selectedMembers.size > 1 ? 'S' :
                          ''} AS ENTERED`;
                          markBtn.style.background = 'var(--orange)';
                          markBtn.style.color = '#fff';
                          } else {
                          markBtn.disabled = true;
                          markBtn.innerHTML = '☑️ SELECT MEMBERS ABOVE';
                          markBtn.style.background = 'var(--border2)';
                          markBtn.style.color = 'var(--muted)';
                          }
                          }

                          async function markTeamEntry() {
                          if (!currentScanData || selectedMembers.size === 0) return;
                          const btn = document.getElementById('mark-scanned-btn');
                          btn.disabled = true;
                          btn.innerHTML = '⌛ VERIFYING & SAVING...';
                          btn.style.background = 'var(--orange)';
                          btn.style.color = '#fff';

                          const allMembersData = [
                          { name: currentScanData.name, regno: currentScanData.regno },
                          ...getParsedMembers(currentScanData).map(m => ({ name: m.name, regno: m.regno }))
                          ];
                          const membersToMark = [...selectedMembers].map(i => ({
                          index: i, name: allMembersData[i]?.name || '', regno: allMembersData[i]?.regno || ''
                          }));

                          try {
                          const payload = {
                          action: 'handleTeamScan',
                          uid: SCANNER_ID,
                          pwd: ADMIN_PASS,
                          data: {
                          regId: currentScanData.regId,
                          eventName: currentScanData.eventName,
                          teamName: currentScanData.teamName || 'Solo',
                          members: membersToMark,
                          scannerId: SCANNER_ID
                          }
                          };
                          const resp = await fetch(SHEETS_URL, { method: 'POST', body: JSON.stringify(payload) });
                          const result = await resp.json();
                          if (result.success) {
                          let markedCount = 0;
                          result.results.forEach(r => {
                          if (r.status === 'marked') markedCount++;
                          const card = document.getElementById('member-card-' + r.index);
                          const cb = document.getElementById('member-cb-' + r.index);
                          if (card) { card.classList.remove('selected'); card.classList.add('entered'); card.onclick =
                          null; }
                          if (cb) cb.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                            stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>';
                          const statusEl = card?.querySelector('.member-status');
                          if (statusEl) { statusEl.className = 'member-status status-entered'; statusEl.textContent =
                          r.status === 'marked' ? '✓ Entered' : '✓ Already In'; }
                          });
                          if (typeof navigator.vibrate === "function") navigator.vibrate([30, 30]);
                          playScanAudio('success');
                          flashScreen('success');
                          updateScanCounter(markedCount);
                          selectedMembers.clear();
                          // Update progress
                          const enteredNow = document.querySelectorAll('.member-card.entered').length;
                          const totalNow = document.querySelectorAll('.member-card').length;
                          const bar = document.querySelector('.team-progress-fill');
                          const txt = document.querySelector('.team-progress-text');
                          if (bar) bar.style.width = Math.round((enteredNow / totalNow) * 100) + '%';
                          if (txt) txt.textContent = `${enteredNow} / ${totalNow} Entered`;
                          if (enteredNow >= totalNow) {
                          btn.innerHTML = '✅ TEAM COMPLETED';
                          btn.style.background = '#27ae60';
                          btn.disabled = true;
                          // Insert completed banner
                          const list = document.getElementById('team-member-list');
                          if (list) list.insertAdjacentHTML('beforebegin', '<div class="team-completed-banner">
                            <div class="tc-icon">✅</div>
                            <div class="tc-title">Team Completed</div>
                            <div class="tc-sub">All members have entered</div>
                          </div>');
                          } else {
                          btn.innerHTML = `✅ ${markedCount} MARKED`;
                          btn.style.background = '#27ae60';
                          setTimeout(() => { btn.disabled = true; btn.innerHTML = '☑️ SELECT MEMBERS ABOVE';
                          btn.style.background = 'var(--border2)'; btn.style.color = 'var(--muted)'; }, 2000);
                          }
                          } else {
                          btn.disabled = false;
                          btn.innerHTML = '⚠️ ' + (result.error || 'RETRY');
                          btn.style.background = '#e74c3c';
                          playScanAudio('error');
                          flashScreen('error');
                          }
                          } catch (e) {
                          btn.disabled = false;
                          btn.innerHTML = '⚠️ NETWORK ERROR — RETRY';
                          btn.style.background = '#e74c3c';
                          }
                          }

                          function closeScanResults() {
                          selectedMembers.clear();
                          document.getElementById('scanner-results').classList.remove('open');
                          openScanner();
                          }

                          function promptManualEntry() {
                          const id = prompt("Enter Registration ID (e.g. U26-0001-XYZ):");
                          if (id && id.trim().length > 5) {
                          const cleanId = id.trim().toUpperCase();
                          if (html5QrCode) {
                          try { html5QrCode.stop(); } catch (e) { }
                          }
                          showAdminLoader('Fetching Details...');
                          verifyQR(cleanId);
                          hideAdminLoader();
                          }
                          }

                          /* ── Helper to parse team members safely ── */
                          function getParsedMembers(reg) {
                          if (!reg.teamMembers) return [];
                          if (Array.isArray(reg.teamMembers)) return reg.teamMembers;
                          try {
                          const p = JSON.parse(reg.teamMembers);
                          return Array.isArray(p) ? p : [];
                          } catch (e) {
                          return [];
                          }
                          }

                          /* ════════ SITE UI VISIBILITY ════════ */
                          function hideSiteUI() {
                          uiOverlayCount++;
                          const d = document.getElementById('dock'); if (d) d.classList.add('nav-hidden');
                          const n = document.querySelector('.nav'); if (n) n.classList.add('nav-hidden');
                          const l = document.getElementById('logo-trigger'); if (l) l.style.opacity = '0';
                          }
                          function showSiteUI() {
                          uiOverlayCount--;
                          if (uiOverlayCount <= 0) { uiOverlayCount=0; const d=document.getElementById('dock'); if (d)
                            d.classList.remove('nav-hidden'); const n=document.querySelector('.nav'); if (n)
                            n.classList.remove('nav-hidden'); const l=document.getElementById('logo-trigger'); if (l)
                            l.style.opacity='1' ; } } // Aliases for compatibility function hideDock() { hideSiteUI(); }
                            function showDock() { showSiteUI(); } function restoreDockForce() { uiOverlayCount=0; const
                            d=document.getElementById('dock'); if (d) { d.classList.remove('nav-hidden');
                            d.classList.remove('hidden'); d.style.display='flex' ; d.style.opacity='1' ;
                            d.style.visibility='visible' ; } const n=document.querySelector('.nav'); if (n) {
                            n.classList.remove('nav-hidden'); n.style.display='flex' ; n.style.opacity='1' ; } const
                            l=document.getElementById('logo-trigger'); if (l) l.style.opacity='1' ;
                            document.body.style.overflow='auto' ; } function dockNav(target) { if (target==='pass' ) {
                            openPass(); return; } const el=document.getElementById(target); if (el) el.scrollIntoView({
                            behavior: 'smooth' }); // Update active document.querySelectorAll('.dock-item').forEach(d=>
                            d.classList.remove('active'));
                            document.getElementById('dock-' + target).classList.add('active');
                            }

                            function updateDockActive() {
                            const eventsEl = document.getElementById('events');
                            const regEl = document.getElementById('registration');
                            const dockHome = document.getElementById('dock-home');
                            const dockEvents = document.getElementById('dock-events');
                            const dockReg = document.getElementById('dock-registration');
                            if (!eventsEl || !dockHome || !dockEvents) return;

                            const scrollMid = window.scrollY + window.innerHeight / 2;
                            let targetId = 'dock-home';

                            if (regEl && scrollMid >= regEl.offsetTop) {
                            targetId = 'dock-registration';
                            } else if (scrollMid >= eventsEl.offsetTop) {
                            targetId = 'dock-events';
                            }

                            const currentActive = document.querySelector('.dock-item.active');
                            if (currentActive && currentActive.id === targetId) return; // No change, avoid flicker

                            document.querySelectorAll('.dock-item').forEach(d => d.classList.remove('active'));
                            const newActive = document.getElementById(targetId);
                            if (newActive) newActive.classList.add('active');
                            }

                            function openComm() {
                            hideDock();
                            renderComm();
                            document.getElementById('comm-ov').classList.add('open');
                            }
                            function closeComm() {
                            document.getElementById('comm-ov').classList.remove('open');
                            showDock();
                            }

                            /* ════════ ALL EVENTS MODAL ════════ */
                            function openAllEvents() {
                            hideDock();
                            renderAllEvents();
                            document.getElementById('allev-ov').classList.add('open');
                            }
                            function closeAllEvents() {
                            document.getElementById('allev-ov').classList.remove('open');
                            showDock();
                            }
                            function renderAllEvents() {
                            const container = document.getElementById('allev-list');
                            if (!container) return;

                            const cards = EVS.map((e, idx) => {
                            const suits = [
                            { s: '♠', c: 'var(--gold)' },
                            { s: '♥', c: '#ff4d4d' },
                            { s: '♦', c: '#ff4d4d' },
                            { s: '♣', c: '#ffffff' }
                            ];
                            const suitObj = suits[idx % 4];
                            let casinoIcon = suitObj.s;
                            let iconColor = suitObj.c;

                            // 🔥 Optimization: Drastically reduced stagger for "Instant" feel
                            const delay = (idx * 0.01).toFixed(2);

                            return `
                            <div class="ev-item-card lying-flat-card card-reveal-stagger"
                              style="background:rgba(18,18,18,0.45); backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px); border:1px solid rgba(255,255,255,0.1); border-radius:14px; padding:15px; display:flex; flex-direction:column; gap:12px; align-items:center; text-align:center; cursor:pointer; box-shadow:0 8px 32px rgba(0,0,0,0.4); transition:all 0.3s ease; animation-delay:${delay}s; min-height:180px;"
                              onclick="triggerDetailsTransition('${e.id}', this)">

                              <div
                                style="width:40px; height:40px; border-radius:10px; background:rgba(212,175,55,0.05); border:1.5px solid ${iconColor}88; display:flex; align-items:center; justify-content:center; font-size:20px; color:${iconColor}; box-shadow:0 5px 15px rgba(0,0,0,0.4); flex-shrink:0;">
                                ${casinoIcon}</div>

                              <div style="flex-grow:1; display:flex; flex-direction:column; justify-content:center;">
                                <div
                                  style="font-family:'Barlow Condensed',sans-serif; font-size:16px; font-weight:900; color:#fff; text-transform:uppercase; letter-spacing:1px; margin-bottom:2px; line-height:1.2;">
                                  ${e.name}</div>
                                <div
                                  style="font-family:'Outfit',sans-serif; font-size:9px; font-weight:800; color:var(--gold); text-transform:uppercase; letter-spacing:2.5px; opacity:0.8;">
                                  ${e.label}</div>
                              </div>

                              <div
                                style="margin-top:auto; padding-top:10px; width:100%; border-top:1px solid rgba(255,255,255,0.05);">
                                <div
                                  style="display:inline-block; font-size:9px; font-weight:800; color:#fff; padding:4px 10px; background:rgba(255,255,255,0.05); border-radius:100px; border:1px solid rgba(255,255,255,0.1);">
                                  📅 ${e.date}</div>
                              </div>
                            </div>`;
                            }).join('');

                            container.innerHTML = `
                            <div id="allev-items-grid" class="ev-listing-grid"
                              style="display:grid; grid-template-columns:repeat(auto-fill, minmax(110px, 1fr)); gap:10px; perspective:1500px; margin-top:5px; width:100%; padding:0 5px;">
                              ${cards}
                            </div>
                            `;
                            }

                            // init() is called via

                            <body onload="init()">
                              startPortalTrigger();

                              /* ════════ CINEMATIC INTRO (REMOVED - MOVED TO INTRO.HTML) ════════ */

                              /* ════════════════════════════════
                              GOOGLE APPS SCRIPT CODE (v3)
                              See apps_script_code.js for the full, up-to-date version.
                              Copy that file's contents into your Apps Script editor.
                              Then Deploy → New Deployment → Web App → Anyone.
                              Paste the URL as SHEETS_URL at the top of this file.
                              ════════════════════════════════ */

                              /* ════════ QR LANDING HANDLER ════════
                              When a student scans their QR with Google Lens / Phone Camera / WhatsApp etc.,
                              they land on this page with ?d=<base64> in the URL.
                                We detect that and show a "Registration Confirmed" screen.
                                The official UTSAV web scanner reads the raw QR text via Html5Qrcode
                                and NEVER navigates to this URL — so it is completely unaffected. */
                                (function handleQRLanding() {
                                const params = new URLSearchParams(window.location.search);
                                let d = params.get('d');
                                if (!d) return;

                                // Robust Base64 decode: inverse of the URL-safe transform
                                let reg = null;
                                try {
                                // 1. Restore URL-safe characters (+ and /)
                                // 2. Handle potential browser space-decoding
                                let safeD = d.replace(/-/g, '+').replace(/_/g, '/').replace(/ /g, '+');
                                // 3. Add padding if missing
                                while (safeD.length % 4) safeD += '=';

                                reg = JSON.parse(decodeURIComponent(escape(atob(safeD))));
                                } catch (e) {
                                console.error("QR Component Decode Error:", e);
                                return; // Malformed QR — silently ignore
                                }

                                if (!reg || !reg.id) return;

                                // Clean the URL ONLY AFTER we are sure we have a valid registration to show
                                history.replaceState(null, '', window.location.pathname);

                                if (!reg || !reg.id) return;

                                // Build the overlay
                                const ov = document.createElement('div');
                                ov.id = 'qr-landing-ov';
                                ov.style.cssText = `
                                position:fixed;inset:0;z-index:9999;
                                background:linear-gradient(160deg,#0a0a0a 0%,#120700 50%,#0a0a0a 100%);
                                display:flex;flex-direction:column;align-items:center;justify-content:center;
                                padding:24px;overflow-y:auto;
                                animation:qrl-in 0.5s cubic-bezier(.22,1,.36,1) both;
                                `;

                                // Inject keyframes
                                if (!document.getElementById('qrl-style')) {
                                const st = document.createElement('style');
                                st.id = 'qrl-style';
                                st.textContent = `
                                @keyframes qrl-in { from { opacity:0; transform:scale(1.04); } to { opacity:1;
                                transform:scale(1); } }
                                @keyframes qrl-pulse { 0%,100%{box-shadow:0 0 0 0 rgba(46,204,113,.4);} 70%{box-shadow:0
                                0 0 14px rgba(46,204,113,0);} }
                                @keyframes qrl-badge { from{transform:scale(0) rotate(-10deg);opacity:0;}
                                to{transform:scale(1) rotate(0deg);opacity:1;} }
                                @keyframes qrl-rise { from{opacity:0;transform:translateY(20px);}
                                to{opacity:1;transform:translateY(0);} }
                                `;
                                document.head.appendChild(st);
                                }

                                const name = reg.n || 'Participant';
                                const eventName = reg.e || "CSEUTSAV'26 2K26";
                                const regId = reg.id || '';
                                const regno = reg.rn ? '···' + reg.rn : '';

                                ov.innerHTML = `
                                <div style="max-width:400px;width:100%;text-align:center;">

                                  <!-- Big Check Badge -->
                                  <div style="
            width:90px;height:90px;border-radius:50%;
            background:linear-gradient(135deg,#1a5c35,#27ae60);
            display:flex;align-items:center;justify-content:center;
            font-size:42px;margin:0 auto 24px;
            animation:qrl-badge .6s cubic-bezier(.22,1,.36,1) .1s both, qrl-pulse 2s ease-out 1s infinite;
            border:3px solid rgba(46,204,113,.3);
          ">✅</div>

                                  <!-- Title -->
                                  <div style="
            font-family:'Barlow Condensed',sans-serif;
            font-size:clamp(36px,10vw,52px);font-weight:900;
            color:#fff;text-transform:uppercase;letter-spacing:2px;
            line-height:1;margin-bottom:8px;
            animation:qrl-rise .5s ease .2s both;
          ">Registration<br>Confirmed!</div>

                                  <div style="
            font-size:13px;color:rgba(255,255,255,.5);letter-spacing:2px;
            text-transform:uppercase;margin-bottom:32px;
            animation:qrl-rise .5s ease .3s both;
          ">CSEUTSAV'26 2K26 · PSNA College</div>

                                  <!-- Card -->
                                  <div style="
            background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);
            border-radius:20px;padding:28px 24px;margin-bottom:24px;
            animation:qrl-rise .5s ease .4s both;
            position:relative;overflow:hidden;
          ">
                                    <div style="
              position:absolute;top:-40px;right:-40px;width:120px;height:120px;
              background:radial-gradient(circle,rgba(232,84,26,.18),transparent 70%);
              pointer-events:none;
            "></div>

                                    <div
                                      style="font-size:11px;color:var(--orange);font-weight:900;letter-spacing:2px;text-transform:uppercase;margin-bottom:6px">
                                      Participant</div>
                                    <div
                                      style="font-size:28px;font-weight:900;color:#fff;letter-spacing:-0.5px;margin-bottom:4px">
                                      ${name}</div>
                                    <div style="font-size:13px;color:rgba(255,255,255,.5);margin-bottom:20px">${regno ?
                                      regno + ' · ' : ''}${eventName}</div>

                                    <div
                                      style="background:rgba(232,84,26,.08);border:1px solid rgba(232,84,26,.2);border-radius:10px;padding:12px;margin-bottom:12px">
                                      <div
                                        style="font-size:10px;color:var(--orange);font-weight:900;letter-spacing:2px;text-transform:uppercase;margin-bottom:4px">
                                        Registration ID</div>
                                      <div
                                        style="font-size:16px;font-weight:800;color:#fff;letter-spacing:1px;font-family:monospace">
                                        ${regId}</div>
                                    </div>

                                    <div
                                      style="background:rgba(46,204,113,.06);border:1px solid rgba(46,204,113,.2);border-radius:10px;padding:14px">
                                      <div style="font-size:13px;color:#2ecc71;font-weight:700;line-height:1.5">
                                        🎯 <strong>Show this screen at the event desk</strong><br>
                                        <span style="font-size:12px;color:rgba(255,255,255,.5);font-weight:400">Your
                                          entry will be verified by our team.</span>
                                      </div>
                                    </div>
                                  </div>

                                  <!-- Official scanner note -->
                                  <div style="
            background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.06);
            border-radius:14px;padding:18px;margin-bottom:28px;
            animation:qrl-rise .5s ease .5s both;
          ">
                                    <div
                                      style="font-size:12px;color:rgba(255,255,255,.4);line-height:1.7;text-align:left">
                                      <span style="font-size:16px">🔐</span>&nbsp;
                                      <strong style="color:rgba(255,255,255,.7)">Attendance is marked only by official
                                        UTSAV scanners.</strong><br>
                                      <span style="font-size:11px">If you have any issue, contact the event coordinator
                                        or show your Registration ID at the event desk.</span>
                                    </div>
                                  </div>

                                  <!-- Admin / Student Footer Actions -->
                                  <div
                                    style="animation:qrl-rise .5s ease .6s both; display:flex; flex-direction:column; gap:12px; width:100%">
                                    ${localStorage.getItem('utsav_auth') ? `
                                    <button
                                      onclick="window.location.href='/?verify_id=' + encodeURIComponent('${regId}')"
                                      style="
                  width:100%;padding:16px;
                  background:#27ae60;border:none;border-radius:12px;
                  font-family:'Barlow Condensed',sans-serif;font-size:16px;font-weight:800;
                  color:#fff;letter-spacing:2px;text-transform:uppercase;cursor:pointer;
                  box-shadow: 0 4px 15px rgba(39, 174, 96, 0.3);
                ">✅ MARK ATTENDANCE (ADMIN) →</button>
                                    ` : ''}

                                    <button
                                      onclick="document.getElementById('qr-landing-ov').style.display='none';document.body.style.overflow=''"
                                      style="
                width:100%;padding:16px;
                background:var(--orange);border:none;border-radius:12px;
                font-family:'Barlow Condensed',sans-serif;font-size:15px;font-weight:800;
                color:#fff;letter-spacing:2px;text-transform:uppercase;cursor:pointer;
                transition:opacity .2s;
              " onmouseover="this.style.opacity='.85'"
                                      onmouseout="this.style.opacity='1'">${localStorage.getItem('utsav_auth') ? 'Back
                                      to Website' : 'Open CSEUTSAV\'26 Website →'}</button>
                                  </div>

                                  <!-- Top Right Close -->
                                  <button
                                    onclick="document.getElementById('qr-landing-ov').style.display='none';document.body.style.overflow=''"
                                    style="
              position:fixed;top:20px;right:20px;
              width:40px;height:40px;border-radius:50%;
              background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);
              color:#fff;font-size:18px;display:flex;align-items:center;justify-content:center;
              cursor:pointer;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);
              z-index:10001;
            ">✕</button>

                                  <div
                                    style="font-size:11px;color:rgba(255,255,255,.2);margin-top:14px;animation:qrl-rise .5s ease .7s both">
                                    For support, contact the organizer at the event venue.
                                  </div>
                                </div>
                                `;

                                document.body.style.overflow = 'hidden';
                                document.body.appendChild(ov);
                                })();

                                /* ── Handle Direct Attendance Lookup (from External Scan) ── */
                                (function handleAttendanceRedirect() {
                                const params = new URLSearchParams(window.location.search);
                                const verifyId = params.get('verify_id');
                                const auth = localStorage.getItem('utsav_auth');
                                if (!verifyId || !auth) return;

                                // Clean URL
                                history.replaceState(null, '', window.location.pathname);

                                // Open the attendance marking UI
                                setTimeout(() => {
                                if (typeof verifyQR === 'function') {
                                // If scanner is not open, open it first to show the overlay container
                                document.getElementById('scanner-results').classList.add('open');
                                document.getElementById('res-content').innerHTML = `
                                <div class="scanner-result-card" style="text-align:center;padding:40px 20px">
                                  <div class="al-spinner" style="width:60px;height:60px;border-width:4px;margin:0 auto">
                                  </div>
                                  <div
                                    style="margin-top:20px;font-family:'Barlow Condensed',sans-serif;font-size:22px;font-weight:800;letter-spacing:2px;color:#fff;text-transform:uppercase;">
                                    Fetching Details...</div>
                                  <div style="margin-top:8px;font-size:12px;color:var(--muted2);letter-spacing:1px">
                                    ${verifyId}</div>
                                </div>
                                `;
                                verifyQR(verifyId);
                                }
                                }, 500);
                                })();

                                /* ─── WhatsApp Group List Functions ─── */
                                function openWaList() {
                                const container = document.getElementById('wa-list-container');
                                if (!container) return;

                                container.innerHTML = '';
                                Object.keys(EVENT_WHATSAPP_MAP).forEach(event => {
                                const link = EVENT_WHATSAPP_MAP[event];
                                if (link && link !== '#') {
                                const btn = document.createElement('a');
                                btn.href = link;
                                btn.target = '_blank';
                                btn.rel = 'noopener noreferrer';
                                btn.className = 'wa-item-btn';
                                btn.innerHTML = `
                                <div class="wa-item-info">
                                  <div class="wa-item-name">${event}</div>
                                  <div class="wa-item-status">Official Group</div>
                                </div>
                                <div class="wa-item-icon">
                                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <path
                                      d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                                  </svg>
                                </div>
                                `;
                                container.appendChild(btn);
                                }
                                });

                                document.getElementById('wa-list-ov').classList.add('open');
                                document.body.style.overflow = 'hidden';
                                hideSiteUI();
                                }

                                function closeWaList(e) {
                                if (e) e.stopPropagation();
                                document.getElementById('wa-list-ov').classList.remove('open');
                                document.body.style.overflow = '';
                                showSiteUI();
                                }

                                /* ════════════════════════════════ */

                                
