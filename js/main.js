// main.js - Client-Friendly Win98 Desktop

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // 0. AUDIO CONTEXT (SOUND EFFECTS)
  // ==========================================
  // Audio Context
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  
  function playClickSound() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(800, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.05);
    gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.05);
  }

  // ==========================================
  // 1. CLOCK & START MENU
  // ==========================================
  const clockEl = document.getElementById('clock');
  const startBtn = document.getElementById('start-btn');
  const startMenu = document.getElementById('start-menu');

  function updateClock() {
    const now = new Date();
    clockEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  setInterval(updateClock, 1000);
  updateClock();

  startBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    startMenu.classList.toggle('hidden');
    startBtn.classList.toggle('active');
  });
  document.addEventListener('click', (e) => {
    if (!startMenu.classList.contains('hidden') && !startMenu.contains(e.target) && e.target !== startBtn) {
      startMenu.classList.add('hidden');
      startBtn.classList.remove('active');
    }
  });

  // Audio Context is now defined above

  // ==========================================
  // 3. WINDOW MANAGEMENT (Z-Index, Drag, Taskbar)
  // ==========================================
  let highestZ = 10;
  const windows = document.querySelectorAll('.window');
  const taskbarTasks = document.getElementById('taskbar-tasks');

  // Bring to front
  function bringToFront(winEl) {
    highestZ++;
    winEl.style.zIndex = highestZ;
    updateTaskbarActive(winEl.id);
  }

  // Update Taskbar Buttons Styling
  function updateTaskbarActive(activeId) {
    document.querySelectorAll('.task-btn').forEach(btn => {
      btn.classList.remove('active');
      if (btn.getAttribute('data-target') === activeId) {
        btn.classList.add('active');
      }
    });
  }

  // Ensure taskbar button exists
  function ensureTaskbarButton(winId, titleText) {
    let btn = document.querySelector(`.task-btn[data-target="${winId}"]`);
    if (!btn) {
      btn = document.createElement('button');
      btn.className = 'win-btn task-btn';
      btn.setAttribute('data-target', winId);
      btn.textContent = titleText;
      taskbarTasks.appendChild(btn);
      
      btn.addEventListener('click', () => {
        const winEl = document.getElementById(winId);
        if (winEl.classList.contains('minimized') || winEl.classList.contains('hidden')) {
          winEl.classList.remove('minimized', 'hidden');
          bringToFront(winEl);
        } else {
          // If already open and front, minimize it. If open but not front, bring to front.
          if (winEl.style.zIndex == highestZ) {
            winEl.classList.add('minimized');
            btn.classList.remove('active');
          } else {
            bringToFront(winEl);
          }
        }
      });
    }
  }

  function removeTaskbarButton(winId) {
    const btn = document.querySelector(`.task-btn[data-target="${winId}"]`);
    if (btn) btn.remove();
  }

  // Window Interactivity Binding
  windows.forEach(win => {
    // Bring to front on mousedown anywhere on the window
    win.addEventListener('mousedown', () => bringToFront(win));

    // Controls
    const closeBtn = win.querySelector('.btn-close');
    const minBtn = win.querySelector('.btn-minimize');
    const maxBtn = win.querySelector('.btn-maximize');
    const titleText = win.querySelector('.window-titlebar-text') ? win.querySelector('.window-titlebar-text').textContent.trim() : '';

    if (maxBtn) {
      maxBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (win.classList.contains('maximized')) {
          win.classList.remove('maximized');
          win.style.width = win.getAttribute('data-prev-width');
          win.style.height = win.getAttribute('data-prev-height') || 'auto';
          win.style.top = win.getAttribute('data-prev-top');
          win.style.left = win.getAttribute('data-prev-left');
          const bodyEl = win.querySelector('.window-body');
          if (bodyEl && bodyEl.style.height && win.id === 'win-ie') {
             bodyEl.style.height = '300px';
          }
        } else {
          win.setAttribute('data-prev-width', win.style.width || window.getComputedStyle(win).width);
          win.setAttribute('data-prev-height', win.style.height || window.getComputedStyle(win).height);
          win.setAttribute('data-prev-top', win.style.top);
          win.setAttribute('data-prev-left', win.style.left);
          
          win.classList.add('maximized');
          win.style.top = '0';
          win.style.left = '0';
          win.style.width = '100vw';
          win.style.height = 'calc(100vh - 35px)'; // Accounting for taskbar height
          win.style.transform = 'none';

          // For the IE window specifically, we want the body to fill the height
          const bodyEl = win.querySelector('.window-body');
          if (bodyEl && win.id === 'win-ie') {
            const occupiedHeight = 30 + 30 + 35 + 35 + 25; // magic numbers accounting for IE toolbars
            bodyEl.style.height = `calc(100vh - 35px - ${occupiedHeight}px)`;
          }
        }
        bringToFront(win);
        playClickSound();
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        win.classList.add('hidden');
        removeTaskbarButton(win.id);
        playClickSound();
      });
    }

    if (minBtn) {
      minBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        win.classList.add('minimized');
        document.querySelector(`.task-btn[data-target="${win.id}"]`)?.classList.remove('active');
        playClickSound();
      });
    }
  });

    // Desktop Icons (Open windows)
  document.querySelectorAll('.desktop-icon').forEach(icon => {
    icon.addEventListener('dblclick', () => {
      // If it's the BSOD icon, we trigger BSOD instead of a normal window
      if(icon.id === 'icon-bsod') {
        const bsod = document.getElementById('bsod-overlay');
        bsod.style.display = 'flex';
        bsod.requestFullscreen().catch(err => {
          console.warn(`Error attempting to enable fullscreen: ${err.message}`);
        });
        bsodAudio.currentTime = 0;
        bsodAudio.play();
        return;
      }

      // If it's the VIP Vault icon
      if(icon.id === 'icon-vip-vault') {
        const vaultWin = document.getElementById('win-vip-vault');
        vaultWin.classList.remove('minimized');
        vaultWin.style.zIndex = ++highestZ;
        ensureTaskbarButton('win-vip-vault', 'Security Verification');
        
        // Show Clippy Hint
        setTimeout(() => {
          document.getElementById('clippy').classList.remove('hidden');
          document.getElementById('clippy-msg').innerHTML = `<p>شـــشـــش... استمع إلي! 🤔<br><br>هذا المجلد لا يفتح إلا للعملاء المهمين جداً... ولكن إذا كتبت كلمة <b>VIP</b> بالإنجليزية سأسمح لك بإلقاء نظرة خاطفة.</p>
          <div class="mt-2 text-center">
            <button class="win-btn" onclick="document.getElementById('clippy').classList.add('hidden')">حسناً، فهمت</button>
          </div>`;
        }, 500);
        return;
      }

      const targetId = icon.getAttribute('data-window');
      if (targetId) {
        const win = document.getElementById(targetId);
        if (win) {
          win.classList.remove('minimized');
          win.style.zIndex = ++highestZ;
          playClickSound();
          
          const titleEl = win.querySelector('.window-titlebar-text');
          const titleText = titleEl ? titleEl.textContent.trim() : targetId;
          ensureTaskbarButton(targetId, titleText);
        }
      }
    });

    // Mobile single tap to open (due to fastclick/mobile behavior)
    icon.addEventListener('click', (e) => {
      // Small timeout to differentiate double click vs single tap on some devices,
      // but for simplicity, we'll let double-click handle desktop and single click handle mobile
      if(window.innerWidth < 768) {
        icon.dispatchEvent(new Event('dblclick'));
      }
    });
  });

  // ==========================================
  // 4. DRAG LOGIC
  // ==========================================
  let isDragging = false;
  let dragTarget = null;
  let offsetX = 0;
  let offsetY = 0;

  document.querySelectorAll('.drag-handle').forEach(handle => {
    handle.addEventListener('mousedown', (e) => {
      if (e.target.closest('.titlebar-btn')) return; // Ignore buttons
      isDragging = true;
      dragTarget = handle.closest('.window');
      bringToFront(dragTarget);
      
      const rect = dragTarget.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
    });
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging || !dragTarget) return;
    
    let x = e.clientX - offsetX;
    let y = e.clientY - offsetY;
    
    // Simple boundary limits
    if (y < 0) y = 0; // Don't go above screen
    
    dragTarget.style.left = `${x}px`;
    dragTarget.style.top = `${y}px`;
    dragTarget.style.transform = 'none'; // Clear any centering transforms
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
    dragTarget = null;
  });

  // ==========================================
  // 5. DESKTOP ICONS & SERVICES FOLDERS
  // ==========================================
  const serviceData = {
    'web': {
      title: 'تطوير المواقع الإلكترونية',
      url: 'http://www.youragency.com/services/web-development',
      content: `
        <div style="font-size: 18px; line-height: 1.8; color: black; padding: 10px;">
          <h1 style="color: navy; border-bottom: 2px solid navy; padding-bottom: 5px; font-size: 28px; font-weight: bold; margin-bottom: 20px;">تطوير مواقع الويب</h1>
          
          <div style="display: flex; gap: 20px; margin-bottom: 30px; align-items: flex-start;">
            <div style="flex: 1;">
              <h2 style="color: #444; font-size: 22px; margin-bottom: 10px;">واجهتك الرقمية للعالم</h2>
              <p>نبني مواقع إلكترونية سريعة وموثوقة تتصدر نتائج البحث (SEO) وتضمن تجربة مستخدم لا مثيل لها. نستخدم أحدث التقنيات لضمان أمان موقعك وسرعته، مما يحول زوار الموقع المنبهرين إلى عملاء دائمين.</p>
            </div>
            <img src="https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&q=80&w=300" alt="Web Development" style="border: 4px solid #c0c0c0; border-top-color: #fff; border-left-color: #fff; border-bottom-color: #808080; border-right-color: #808080; width: 250px;">
          </div>
          
          <h2 style="color: #444; font-size: 22px; margin-bottom: 10px;">ماذا تتضمن هذه الخدمة؟</h2>
          <ul style="list-style-type: square; margin-right: 25px; margin-bottom: 30px;">
            <li style="margin-bottom: 8px;">تصميم متجاوب بالكامل مع جميع أحجام الشاشات الموبايل والتابلت والكمبيوتر.</li>
            <li style="margin-bottom: 8px;">تهيئة وتحسين محركات البحث الأساسي للظهور في الصفحة الأولى.</li>
            <li style="margin-bottom: 8px;">لوحات تحكم ديناميكية وسهلة لإدارة المحتوى.</li>
            <li style="margin-bottom: 8px;">أداء عالي وسرعة تحميل فائقة وتطبيقات ويب سريعة (PWA).</li>
          </ul>
          
          <div style="background: #ffffcc; padding: 15px; border: 1px solid #e6e600; margin-bottom: 30px; border-radius: 5px;">
            <strong>نصيحة تقنية:</strong> 80% من المستخدمين يغادرون الموقع الذي لا يحمل خلال 3 ثوان. نحن نضمن أداء يتجاوز التوقعات!
          </div>

          <div style="text-align: center; margin-top: 40px; margin-bottom: 20px;">
            <button onclick="document.querySelector('[data-window=win-contact]').click()" style="background:#c0c0c0; border: 3px solid; border-color: #fff #808080 #808080 #fff; padding: 10px 25px; cursor: pointer; font-family: 'Tahoma'; font-size: 18px; font-weight: bold;">طلب عرض سعر للموقع 🚀</button>
          </div>
        </div>
      `
    },
    'mobile': {
      title: 'تطبيقات الجوال',
      url: 'http://www.youragency.com/services/mobile-apps',
      content: `
        <div style="font-size: 18px; line-height: 1.8; color: black; padding: 10px;">
          <h1 style="color: navy; border-bottom: 2px solid navy; padding-bottom: 5px; font-size: 28px; font-weight: bold; margin-bottom: 20px;">تطبيقات الجوال (iOS & Android)</h1>
          
          <div style="display: flex; gap: 20px; margin-bottom: 30px; align-items: flex-start;">
            <div style="flex: 1;">
              <h2 style="color: #444; font-size: 22px; margin-bottom: 10px;">متجرك في جيب كل عميل</h2>
              <p>نحول فكرتك إلى تطبيق يعمل بسلاسة على كافة الهواتف الذكية. تطبيقاتنا مصممة لتكون خفيفة، سريعة، وسهلة الاستخدام بحيث تعطي العميل تجربة فريدة تدفعه لاستخدام التطبيق يومياً.</p>
            </div>
            <img src="https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&q=80&w=300" alt="Mobile Apps" style="border: 4px solid #c0c0c0; border-top-color: #fff; border-left-color: #fff; border-bottom-color: #808080; border-right-color: #808080; width: 250px;">
          </div>
          
          <h2 style="color: #444; font-size: 22px; margin-bottom: 10px;">مزايا برمجيات الجوال:</h2>
          <ul style="list-style-type: square; margin-right: 25px; margin-bottom: 30px;">
            <li style="margin-bottom: 8px;">تطوير عبر منصات متعددة باستخدام (React Native / Flutter) لتقليل التكلفة ووقت الإطلاق.</li>
            <li style="margin-bottom: 8px;">تصميم واجهات (UI) مخصصة تلائم هوية علامتك التجارية.</li>
            <li style="margin-bottom: 8px;">إشعارات ذكية لزيادة مبيعاتك وعودة العملاء.</li>
            <li style="margin-bottom: 8px;">إدارة الرفع الكامل على App Store و Google Play.</li>
          </ul>
          
          <div style="text-align: center; margin-top: 40px; margin-bottom: 20px;">
            <button onclick="document.querySelector('[data-window=win-contact]').click()" style="background:#c0c0c0; border: 3px solid; border-color: #fff #808080 #808080 #fff; padding: 10px 25px; cursor: pointer; font-family: 'Tahoma'; font-size: 18px; font-weight: bold;">برمج تطبيقك المذهل الآن 📱</button>
          </div>
        </div>
      `
    },
    'systems': {
      title: 'الأنظمة السحابية و ERP',
      url: 'http://www.youragency.com/services/cloud-erp',
      content: `
        <div style="font-size: 18px; line-height: 1.8; color: black; padding: 10px;">
          <h1 style="color: navy; border-bottom: 2px solid navy; padding-bottom: 5px; font-size: 28px; font-weight: bold; margin-bottom: 20px;">الأنظمة السحابية الداعمة</h1>
          
          <h2 style="color: #444; font-size: 22px; margin-bottom: 10px;">تحكم كامل بإدارة شركتك</h2>
          <p>اربط جميع أقسام شركتك في مكان واحد ومن شاشة واحدة. نقدم حلولاً سحابية مخصصة للتحكم بالأنظمة وإدارة تدفق العمل، ومراقبة الموارد البشرية، المبيعات، والمخازن بكفاءة من أي مكان في العالم.</p>
          
          <div style="margin: 30px 0; text-align: center;">
            <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=600" alt="ERP Systems" style="border: 4px solid #c0c0c0; border-top-color: #fff; border-left-color: #fff; border-bottom-color: #808080; border-right-color: #808080; max-width: 100%; height: auto;">
          </div>
          
          <h2 style="color: #444; font-size: 22px; margin-bottom: 10px;">عناصر النظام الأساسية:</h2>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
            <div style="background: #e6f2ff; padding: 15px; border: 1px solid #b3d9ff;">
              <strong style="color: navy; font-size: 20px;">أمن البيانات</strong>
              <p style="margin-top: 5px; font-size: 16px;">حماية عالية للبيانات وتشفير كامل، مع النسخ الاحتياطي التلقائي للحفاظ على أصولك الرقمية.</p>
            </div>
            <div style="background: #e6f2ff; padding: 15px; border: 1px solid #b3d9ff;">
              <strong style="color: navy; font-size: 20px;">تحليلات وتقارير</strong>
              <p style="margin-top: 5px; font-size: 16px;">بيانات فورية وتقارير استخبارات مخصصة مبنية على مؤشرات الأداء الحقيقية.</p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 40px; margin-bottom: 20px;">
            <button onclick="document.querySelector('[data-window=win-contact]').click()" style="background:#c0c0c0; border: 3px solid; border-color: #fff #808080 #808080 #fff; padding: 10px 25px; cursor: pointer; font-family: 'Tahoma'; font-size: 18px; font-weight: bold;">اطلب استشارة لنظامك 📈</button>
          </div>
        </div>
      `
    },
    'uiux': {
      title: 'تصميم واجهات وتجربة المستخدم',
      url: 'http://www.youragency.com/services/ui-ux-design',
      content: `
        <div style="font-size: 18px; line-height: 1.8; color: black; padding: 10px;">
          <h1 style="color: navy; border-bottom: 2px solid navy; padding-bottom: 5px; font-size: 28px; font-weight: bold; margin-bottom: 20px;">تصميم UI/UX (الهندسة الرقمية للجمال)</h1>
          
          <div style="display: flex; gap: 20px; margin-bottom: 30px; align-items: flex-start;">
            <img src="https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=300" alt="UI Design" style="border: 4px solid #c0c0c0; border-top-color: #fff; border-left-color: #fff; border-bottom-color: #808080; border-right-color: #808080; width: 250px;">
            <div style="flex: 1;">
              <p>التصميم ليس مجرد شكل جميل، بل هو كيف يعمل المنتج بسلاسة. نصمم للناس أولاً، ونجعل تجربة استخدام تطبيقك أو موقعك ممتعة ومريحة لدرجة وبديهية حتى لمن ليس لديه خبرة تقنية.</p>
            </div>
          </div>
          
          <h2 style="color: #444; font-size: 22px; margin-bottom: 10px;">مراحل التصميم الإبداعي لدينا:</h2>
          <ol style="margin-right: 25px; margin-bottom: 30px;">
            <li style="margin-bottom: 10px;"><strong>البحث والتحليل:</strong> أبحاث مستخدمين ودراسات سلوك لمعرفة ما يُفضله عميلك.</li>
            <li style="margin-bottom: 10px;"><strong>الرسم والتخطيط:</strong> إنشاء الهيكلية السلكية (Wireframes) وخرائط التدفق (Userflows).</li>
            <li style="margin-bottom: 10px;"><strong>النماذج الأولية:</strong> إنشاء نماذج تفاعلية (Prototypes) تُمثِّل شكل المنتج قبل برمجته لاختبار تجربة المستخدم.</li>
            <li style="margin-bottom: 10px;"><strong>المرئيات (Visuals):</strong> اعتماد الألوان العصرية، الرسوميات، والخطوط التي تبهر العميل وتعزز الهوية.</li>
          </ol>
          
          <div style="text-align: center; margin-top: 40px; margin-bottom: 20px;">
            <button onclick="document.querySelector('[data-window=win-contact]').click()" style="background:#c0c0c0; border: 3px solid; border-color: #fff #808080 #808080 #fff; padding: 10px 25px; cursor: pointer; font-family: 'Tahoma'; font-size: 18px; font-weight: bold;">صمم واجهتك الإبداعية 🎨</button>
          </div>
        </div>
      `
    }
  };

  document.querySelectorAll('.s-folder').forEach(folder => {
    folder.addEventListener('click', () => {
      // Highlight effect
      document.querySelectorAll('.s-folder').forEach(f => f.classList.remove('selected'));
      folder.classList.add('selected');
      playClickSound();
      
      const serviceId = folder.getAttribute('data-service');
      const data = serviceData[serviceId];
      if (data) {
        // Update IE Content
        document.getElementById('ie-title').textContent = data.title + " - Microsoft Internet Explorer";
        document.getElementById('ie-address').textContent = data.url;
        document.getElementById('ie-content').innerHTML = data.content;
        
        // Open IE Window
        const ieWin = document.getElementById('win-ie');
        ieWin.classList.remove('hidden', 'minimized');
        ensureTaskbarButton('win-ie', data.title);
        bringToFront(ieWin);
      }
    });
  });

  document.querySelectorAll('.desktop-icon').forEach(icon => {
    icon.addEventListener('click', () => {
      // Select logic
      document.querySelectorAll('.desktop-icon').forEach(i => i.classList.remove('selected'));
      icon.classList.add('selected');
      playClickSound();
      
      // Open Window logic (Single click for simpler web UX)
      if (icon.id === 'icon-vip-vault') {
        const vaultWin = document.getElementById('win-vip-vault');
        if (vaultWin) {
          vaultWin.classList.remove('minimized');
          vaultWin.style.zIndex = ++highestZ;
          ensureTaskbarButton('win-vip-vault', 'Security Verification');
          
          // Show Clippy Hint if it isn't already handled
          setTimeout(() => {
            const clippy = document.getElementById('clippy');
            if (clippy) {
                clippy.classList.remove('hidden');
                document.getElementById('clippy-msg').innerHTML = `<p>شـــشـــش... استمع إلي! 🤔<br><br>هذا المجلد لا يفتح إلا للعملاء المهمين جداً... ولكن إذا كتبت كلمة <b>VIP</b> بالإنجليزية سأسمح لك بإلقاء نظرة خاطفة.</p>
                <div class="mt-2 text-center">
                  <button class="win-btn" onclick="document.getElementById('clippy').classList.add('hidden')">حسناً، فهمت</button>
                </div>`;
            }
          }, 500);
        }
        return; // Important: escape generic logic below to prevent duplicate actions
      }

      const winId = icon.getAttribute('data-window');
      const winEl = document.getElementById(winId);
      if (winEl) {
        winEl.classList.remove('hidden', 'minimized');
        const titleText = winEl.querySelector('.window-titlebar-text').textContent.trim();
        ensureTaskbarButton(winId, titleText);
        bringToFront(winEl);
      }
    });
  });

  // Deselect icons when clicking desktop
  document.getElementById('desktop').addEventListener('mousedown', (e) => {
    if (e.target.id === 'desktop') {
      document.querySelectorAll('.desktop-icon').forEach(i => i.classList.remove('selected'));
    }
  });

  // ==========================================
  // 6. PORTFOLIO IMAGING LOGIC
  // ==========================================
  const portfolioImages = [
    'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1555421689-491a97ff2040?auto=format&fit=crop&q=80&w=600'
  ];
  const portfolioTitles = [
    'تطبيق متجر إلكتروني متكامل - زيادة 40% في المبيعات',
    'لوحة تحكم مالية (Dashboard) لتتبع الإيرادات لحظياً',
    'موقع شركة تقنية عالمي - تصميم يعكس الهوية والاحترافية'
  ];
  let currentImg = 0;
  
  const imgEl = document.getElementById('portfolio-img');
  const titleEl = document.getElementById('portfolio-title');
  const counterEl = document.getElementById('img-counter');
  
  function updatePortfolio() {
    imgEl.src = portfolioImages[currentImg];
    titleEl.textContent = portfolioTitles[currentImg];
    counterEl.textContent = `${currentImg + 1} من ${portfolioImages.length}`;
  }

  document.getElementById('next-img')?.addEventListener('click', () => {
    currentImg = (currentImg + 1) % portfolioImages.length;
    updatePortfolio();
    playClickSound();
  });
  document.getElementById('prev-img')?.addEventListener('click', () => {
    currentImg = (currentImg - 1 + portfolioImages.length) % portfolioImages.length;
    updatePortfolio();
    playClickSound();
  });

  // ==========================================
  // 7. SEND EMAIL (CONTACT) LOGIC
  // ==========================================
  const sendBtn = document.getElementById('send-mail-btn');
  sendBtn?.addEventListener('click', () => {
    playClickSound();
    
    // Optional: play dial-up sound
    const osc = audioCtx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, audioCtx.currentTime);
    osc.frequency.setValueAtTime(600, audioCtx.currentTime + 0.1);
    osc.frequency.setValueAtTime(300, audioCtx.currentTime + 0.2);
    osc.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.3);

    alert("تم الإرسال بنجاح! سنتواصل معك قريباً بخصوص فكرة مشروعك.");
    document.getElementById('win-contact').classList.add('hidden');
    removeTaskbarButton('win-contact');
  });

  // ==========================================
  // 9. MINESWEEPER LOGIC
  // ==========================================
  const gridElement = document.getElementById('ms-grid');
  const msFace = document.getElementById('ms-face');
  const msFlags = document.getElementById('ms-flags');
  const msTimer = document.getElementById('ms-timer');
  const msRewardMsg = document.getElementById('ms-reward-msg');
  const msStartBtn = document.getElementById('ms-start-btn');
  
  const ROWS = 8;
  const COLS = 8;
  const MINES = 10;
  let board = [];
  let gameover = false;
  let firstClick = true;
  let timerInterval = null;
  let seconds = 0;
  let flagsLeft = MINES;
  let revealedCount = 0;

  function initMinesweeper() {
    if (!gridElement) return; // safety
    clearInterval(timerInterval);
    board = [];
    gameover = false;
    firstClick = true;
    seconds = 0;
    flagsLeft = MINES;
    revealedCount = 0;
    
    msFace.textContent = '🙂';
    msTimer.textContent = '000';
    msFlags.textContent = flagsLeft.toString().padStart(2, '0');
    msRewardMsg.style.display = 'none';
    
    gridElement.innerHTML = '';
    
    // Create logical board and DOM
    for (let r = 0; r < ROWS; r++) {
      let row = [];
      for (let c = 0; c < COLS; c++) {
        let cellObj = {
          r: r, c: c,
          isMine: false,
          isRevealed: false,
          isFlagged: false,
          neighborMines: 0,
          element: document.createElement('div')
        };
        
        cellObj.element.className = 'ms-cell unrevealed';
        cellObj.element.dataset.r = r;
        cellObj.element.dataset.c = c;
        
        cellObj.element.addEventListener('mousedown', (e) => handleCellClick(e, cellObj));
        cellObj.element.addEventListener('contextmenu', (e) => handleCellRightClick(e, cellObj));
        
        gridElement.appendChild(cellObj.element);
        row.push(cellObj);
      }
      board.push(row);
    }
  }

  function placeMines(firstR, firstC) {
    let minesPlaced = 0;
    while (minesPlaced < MINES) {
      let r = Math.floor(Math.random() * ROWS);
      let c = Math.floor(Math.random() * COLS);
      // Don't place mine on the first clicked cell or if already a mine
      if (!board[r][c].isMine && !(r === firstR && c === firstC)) {
        board[r][c].isMine = true;
        minesPlaced++;
      }
    }
    
    // Calculate neighbor mines
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (!board[r][c].isMine) {
          board[r][c].neighborMines = countNeighbors(r, c);
        }
      }
    }
  }

  function countNeighbors(r, c) {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            let nr = r + i;
            let nc = c + j;
            if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
                if (board[nr][nc].isMine) count++;
            }
        }
    }
    return count;
  }

  function handleCellClick(e, cell) {
    if (e.button !== 0 || gameover || cell.isFlagged || cell.isRevealed) return;
    
    if (firstClick) {
      placeMines(cell.r, cell.c);
      startTimer();
      firstClick = false;
    }
    
    revealCell(cell.r, cell.c);
    checkWin();
  }

  function handleCellRightClick(e, cell) {
    e.preventDefault();
    if (gameover || cell.isRevealed) return;

    if (!cell.isFlagged && flagsLeft > 0) {
      cell.isFlagged = true;
      cell.element.innerHTML = '<span style="color:red;">🚩</span>';
      flagsLeft--;
    } else if (cell.isFlagged) {
      cell.isFlagged = false;
      cell.element.innerHTML = '';
      flagsLeft++;
    }
    msFlags.textContent = flagsLeft.toString().padStart(2, '0');
  }

  function revealCell(r, c) {
    let cell = board[r][c];
    if (cell.isRevealed || cell.isFlagged) return;
    
    cell.isRevealed = true;
    cell.element.classList.remove('unrevealed');
    cell.element.classList.add('revealed');
    revealedCount++;
    
    if (cell.isMine) {
      gameOverLoss(cell);
      return;
    }
    
    if (cell.neighborMines > 0) {
      cell.element.textContent = cell.neighborMines;
      const colors = ['blue', 'green', 'red', 'darkblue', 'brown', 'cyan', 'black', 'gray'];
      cell.element.style.color = colors[cell.neighborMines - 1];
    } else {
      // Reveal neighbors
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            let nr = r + i;
            let nc = c + j;
            if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
              revealCell(nr, nc);
            }
        }
      }
    }
  }

  function startTimer() {
    timerInterval = setInterval(() => {
      seconds++;
      if (seconds > 999) seconds = 999;
      msTimer.textContent = seconds.toString().padStart(3, '0');
    }, 1000);
  }

  function gameOverLoss(clickedCell) {
    gameover = true;
    clearInterval(timerInterval);
    msFace.textContent = '😵';
    clickedCell.element.classList.add('mine');
    
    // Reveal all mines
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        let cell = board[r][c];
        if (cell.isMine && !cell.isFlagged) {
          cell.element.classList.remove('unrevealed');
          cell.element.classList.add('revealed');
          cell.element.textContent = '💣';
        } else if (!cell.isMine && cell.isFlagged) {
           cell.element.textContent = '❌';
        }
      }
    }
    playClickSound(); // Play a sound on death
  }

  function checkWin() {
    if (revealedCount === (ROWS * COLS) - MINES) {
      gameover = true;
      clearInterval(timerInterval);
      msFace.textContent = '😎';
      msFlags.textContent = '00';
      msRewardMsg.style.display = 'block';
      playClickSound(); // victory sound
    }
  }

  if (msFace) msFace.addEventListener('click', initMinesweeper);
  if (msStartBtn) msStartBtn.addEventListener('click', initMinesweeper);
  
  // Initialize once
  initMinesweeper();

  // ==========================================
  // X. MS PAINT GUESTBOOK LOGIC
  // ==========================================
  const canvas = document.getElementById('paint-canvas');
  if(canvas) {
    const ctx = canvas.getContext('2d');
    let isDrawing = false;
    let currentColor = 'black';
    let currentSize = 2;

    canvas.addEventListener('mousedown', (e) => {
      isDrawing = true;
      ctx.beginPath();
      ctx.moveTo(e.offsetX, e.offsetY);
    });

    canvas.addEventListener('mousemove', (e) => {
      if(isDrawing) {
         ctx.lineTo(e.offsetX, e.offsetY);
         ctx.strokeStyle = currentColor;
         ctx.lineWidth = currentSize;
         ctx.stroke();
      }
    });

    canvas.addEventListener('mouseup', () => isDrawing = false);
    canvas.addEventListener('mouseleave', () => isDrawing = false);

    document.querySelectorAll('.color-box').forEach(box => {
      box.addEventListener('click', (e) => {
         document.querySelectorAll('.color-box').forEach(b => b.classList.remove('selected'));
         e.target.classList.add('selected');
         currentColor = e.target.style.backgroundColor;
      });
    });

    document.querySelectorAll('.tool-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
         document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('selected'));
         e.target.classList.add('selected');
         currentSize = parseInt(e.target.dataset.size);
      });
    });

    // Clear Canvas
    const paintClearBtn = document.getElementById('paint-clear');
    if(paintClearBtn) {
        paintClearBtn.addEventListener('click', () => {
          ctx.clearRect(0,0, canvas.width, canvas.height);
        });
    }

    // Submit Paint Form & Save to Guestbook
    const paintSubmitBtn = document.getElementById('paint-submit');
    if(paintSubmitBtn) {
      paintSubmitBtn.addEventListener('click', () => {
         const nameInput = document.getElementById('paint-name');
         const phoneInput = document.getElementById('paint-phone');
         const name = nameInput ? nameInput.value : 'Anonymous';
         const phone = phoneInput ? phoneInput.value : '';
         
         const dataURL = canvas.toDataURL();
         const guestbookEntry = { name, phone, image: dataURL, date: new Date().toLocaleString() };
         let guestbook = JSON.parse(localStorage.getItem('agency_guestbook')) || [];
         guestbook.push(guestbookEntry);
         localStorage.setItem('agency_guestbook', JSON.stringify(guestbook));

         alert('تم حفظ إبداعك في دفتر الزوار! سنتواصل معك قريباً.');
         
         document.getElementById('win-paint').classList.add('minimized');
         ctx.clearRect(0,0, canvas.width, canvas.height);
         if(nameInput) nameInput.value = '';
         if(phoneInput) phoneInput.value = '';
      });
    }
  }

  // ==========================================
  // X. PANIC BUTTON TERMINAL LOGIC
  // ==========================================
  const winPanic = document.getElementById('win-panic');
  const panicOutput = document.getElementById('panic-terminal-output');
  const panicCtaBtn = document.getElementById('btn-panic-cta');
  let panicRunning = false;

  function initiatePanicSequence() {
      if(winPanic && panicOutput && !panicRunning) {
          panicRunning = true;
          winPanic.classList.remove('minimized', 'hidden');
          winPanic.style.zIndex = ++highestZ;
          panicOutput.innerHTML = '';
          if(panicCtaBtn) panicCtaBtn.classList.add('hidden');
          
          const sleep = ms => new Promise(r => setTimeout(r, ms));
          
          const runTerminal = async () => {
              const appendText = async (text, delay = 50, color = '#0f0') => {
                  const span = document.createElement('span');
                  span.style.color = color;
                  span.innerHTML = text;
                  panicOutput.appendChild(span);
                  winPanic.querySelector('.window-body').scrollTop = winPanic.querySelector('.window-body').scrollHeight;
                  if(delay > 0) await sleep(delay);
              };

              await appendText(`جاري تهيئة تفريغ ذاكرة النظام...<br>`, 200);
              await appendText(`تحميل ملف التسويق_التقليدي.dll... <span style="color:red">تالف (CORRUPT)</span><br>`, 400);
              await appendText(`فحص مسار_المبيعات.sys... <span style="color:red">فشل ذريع (CRITICAL FAILURE)</span><br>`, 400);
              
              await appendText(`<br>جاري فحص البنية التحتية للأعمال...<br>`, 600);
              
              for(let i=1; i<=5; i++) {
                 let hash = Math.random().toString(36).substring(2, 10).toUpperCase();
                 await appendText(`[${hash}] تم اكتشاف أساليب تسويق عفا عليها الزمن.<br>`, 200);
              }

              await appendText(`<br><span style="color:yellow">تحذير: منافسوك يقومون بترقية أنظمتهم إلى معايير Web 3.0 القوية.</span><br>`, 800);
              await appendText(`<span style="color:red; font-weight:bold; font-size:16px;">خطأ فادح: تسرب الإيرادات تجاوز الحدود المسموح بها!</span><br><br>`, 800);
              
              await appendText(`هل ترغب في إصلاح هذا التسرب فوراً؟ (ن/ل) ... <span style="color:yellow">تم اختيار (نعم) تلقائياً</span><br><br>`, 500);

              if(panicCtaBtn) {
                  panicCtaBtn.classList.remove('hidden');
                  // Scroll to the bottom again to make sure the CTA button is visible
                  setTimeout(() => {
                      winPanic.querySelector('.window-body').scrollTop = winPanic.querySelector('.window-body').scrollHeight;
                  }, 50);
              }
              panicRunning = false;
          };
          
          runTerminal();
      }
  }

  // Bind to the desktop icon "لا_تضغط_هنا.bat"
  const panicIcon = document.querySelector('.desktop-icon[data-window="win-panic"]');
  if (panicIcon) {
      // Listen to both click and dblclick, since single click opens generic window
      panicIcon.addEventListener('click', (e) => {
          e.preventDefault();
          initiatePanicSequence();
      });
      panicIcon.addEventListener('dblclick', (e) => {
          e.preventDefault();
          initiatePanicSequence();
      });
  }

  // Bind to the start menu item
  const startBsodMenu = document.getElementById('start-bsod'); // Note: it's called start-bsod but points to Panic in index.html
  if (startBsodMenu) {
      startBsodMenu.addEventListener('click', (e) => {
          e.preventDefault();
          startMenu.classList.add('hidden');
          // Wait, 'start-bsod' was originally meant for the BSOD full screen. Let's see what index.html says.
          // The index.html start-menu has id "start-bsod" for "الوكالات التقليدية".
          // The BSOD is for "الوكالات التقليدية".
          // I shouldn't bind Panic to start-bsod. Instead, BSOD goes there.
      });
  }

  // ==========================================
  // 10. BSOD EASTER EGG (OLD LOGIC DISABLED)
  // ==========================================
  const bsodOverlay = document.getElementById('bsod-overlay');
  const iconBsod = document.getElementById('icon-bsod');
  const startBsod = document.getElementById('start-bsod');

  function triggerBsod() {
    bsodOverlay.style.display = 'flex';
    if(startMenu) startMenu.classList.add('hidden');
    
    // Play error sound
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.5);
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.5);
    
    // Listen for any key or click to dismiss
    document.addEventListener('keydown', dismissBsod);
    bsodOverlay.addEventListener('click', dismissBsod);
  }

  function dismissBsod(e) {
    bsodOverlay.style.display = 'none';
    document.removeEventListener('keydown', dismissBsod);
    bsodOverlay.removeEventListener('click', dismissBsod);
    
    // Open Contact Window
    const contactWin = document.getElementById('win-contact');
    if (contactWin) {
      contactWin.classList.remove('hidden', 'minimized');
      document.querySelector('.window.active')?.classList.remove('active');
      contactWin.classList.add('active');
      bringToFront(contactWin);
      addOrUpdateTaskbarButton('win-contact', contactWin.querySelector('.window-titlebar-text').textContent.trim());
    }
  }

  if (iconBsod) iconBsod.addEventListener('dblclick', triggerBsod);
  // Also support single click for mobile/touch if needed, but standard desktop icons are double-click
  if (iconBsod) iconBsod.addEventListener('click', (e) => {
    // Basic single-click highlight could go here. For now, we'll just let dblclick do the work, or trigger on single click to make it easier to find.
    triggerBsod(); 
  });
  if (startBsod) startBsod.addEventListener('click', (e) => {
    e.preventDefault();
    triggerBsod();
  });

  // ==========================================
  // 11. CLIPPY TIMEOUT & EXIT INTENT
  // ==========================================
  const clippy = document.getElementById('clippy');
  const clippyMsg = document.getElementById('clippy-msg');
  
  // Initial appearance
  let clippyShown = false;
  setTimeout(() => {
    if(!clippyShown) {
      clippy.classList.remove('hidden');
      playClickSound();
      clippyShown = true;
    }
  }, 12000);

  document.getElementById('clippy-dismiss').addEventListener('click', () => {
    clippy.classList.add('hidden');
  });

  // Exit Intent Logic
  let exitIntentTriggered = false;
  document.addEventListener('mouseleave', (e) => {
    // If mouse leaves from the top of the window and we haven't triggered this yet
    if (e.clientY <= 0 && !exitIntentTriggered) {
      exitIntentTriggered = true;
      clippy.classList.remove('hidden');
      playClickSound(); // Get attention
      
      clippyMsg.innerHTML = `
        <p style="font-size: 13px;"><b>انتظر! اكتم هذا السر... 🤫</b><br><br>
        لا تخبر مديري، ولكن إذا حجزت موعداً الآن، سأعطيك هذا الرمز السري: <br><br>
        <span style="background: yellow; color: black; padding: 2px 5px; font-weight: bold; border: 1px dotted #000;">CLIPPY-15</span><br><br>
        للحصول على خصم حصري 15% على مشروعك القادم معنا!</p>
        <div class="mt-2 text-center">
          <button class="win-btn" onclick="document.querySelector('[data-window=win-contact]').click(); document.getElementById('clippy').classList.add('hidden')" style="font-weight: bold; color: green;">استخدم الخصم الآن</button>
        </div>
      `;
    }
  });

  // ==========================================
  // 12. WINAMP MEDIA PLAYER LOGIC
  // ==========================================
  const waAudio = document.getElementById('winamp-audio');
  const waPlay = document.getElementById('wa-play');
  const waPause = document.getElementById('wa-pause');
  const waStop = document.getElementById('wa-stop');
  const waPrev = document.getElementById('wa-prev');
  const waNext = document.getElementById('wa-next');
  const waVolume = document.getElementById('wa-volume');
  const audioTime = document.getElementById('audio-time');

  if(waAudio) {
    waPlay.addEventListener('click', () => {
      waAudio.play();
    });

    waPause.addEventListener('click', () => {
      waAudio.pause();
    });

    waStop.addEventListener('click', () => {
      waAudio.pause();
      waAudio.currentTime = 0;
    });

    // We only have one track, so prev/next just restart it or do nothing.
    waPrev.addEventListener('click', () => {
      waAudio.currentTime = 0;
      waAudio.play();
    });
    waNext.addEventListener('click', () => {
      waAudio.currentTime = 0;
      waAudio.play();
    });

    waVolume.addEventListener('input', (e) => {
      waAudio.volume = e.target.value;
    });

    waAudio.addEventListener('timeupdate', () => {
      const minutes = Math.floor(waAudio.currentTime / 60);
      const seconds = Math.floor(waAudio.currentTime % 60);
      audioTime.textContent = 
        (minutes < 10 ? '0' : '') + minutes + ':' + 
        (seconds < 10 ? '0' : '') + seconds;
    });
  }

  // ==========================================
  // 13. VIP VAULT LOGIC
  // ==========================================
  const vipSubmitBtn = document.getElementById('vip-submit-btn');
  const vipPasswordInput = document.getElementById('vip-password');
  const vipErrorMsg = document.getElementById('vip-error-msg');
  const vipVaultWindow = document.getElementById('win-vip-vault');
  const vipContentWindow = document.getElementById('win-vip-content');

  if(vipSubmitBtn) {
    vipSubmitBtn.addEventListener('click', () => {
      const pwd = vipPasswordInput.value.trim().toUpperCase();
      if(pwd === 'VIP') {
        // Correct Phase
        vipErrorMsg.style.display = 'none';
        vipVaultWindow.classList.add('minimized');
        vipContentWindow.classList.remove('minimized');
        vipContentWindow.style.zIndex = ++highestZ;
        vipPasswordInput.value = ''; // Reset
      } else {
        // Incorrect
        vipErrorMsg.style.display = 'block';
        setTimeout(() => {
          vipErrorMsg.style.display = 'none';
        }, 3000);
      }
    });

    // Enter key support
    vipPasswordInput.addEventListener('keypress', (e) => {
      if(e.key === 'Enter') {
        vipSubmitBtn.click();
      }
    });
  }

  // Add click sound to all win-buttons (ensure new buttons get it if dynamically added, though we only run this once on load)
  document.querySelectorAll('.win-btn').forEach(btn => {
    // Avoid re-adding if already added, simple approach here for now:
    btn.removeEventListener('click', playClickSound); 
    btn.addEventListener('click', playClickSound);
  });

  // ==========================================
  // 14. MSN MESSENGER POPUP LOGIC
  // ==========================================
  const msnWindow = document.getElementById('win-msn');
  const msnMsg2 = document.getElementById('msn-msg-2');
  
  if (msnWindow) {
    // Show MSN window after 15 seconds
    setTimeout(() => {
      // Play a notification sound (using Asterisk or similar, or just chord)
      const msnSound = new Audio('https://win98icons.alexmeub.com/audio/chimes.wav');
      msnSound.play().catch(e => console.log('Audio play prevented', e));
      
      msnWindow.classList.remove('hidden');
      msnWindow.style.zIndex = ++highestZ;

      // Show second message after 3 seconds of the window opening
      setTimeout(() => {
        if(msnMsg2) msnMsg2.classList.remove('hidden');
        // Play nudge sound
        const nudgeSound = new Audio('https://win98icons.alexmeub.com/audio/chord.wav');
        nudgeSound.play().catch(e => console.log('Audio play prevented', e));
        
        // Add a slight shake effect
        msnWindow.style.transform = 'translate(-5px, 0)';
        setTimeout(() => msnWindow.style.transform = 'translate(5px, 0)', 50);
        setTimeout(() => msnWindow.style.transform = 'translate(-5px, 0)', 100);
        setTimeout(() => msnWindow.style.transform = 'translate(5px, 0)', 150);
        setTimeout(() => msnWindow.style.transform = 'none', 200);
      }, 3000);

    }, 15000); // 15 seconds delay
  }

  // ==========================================
  // 15. BUSINESS DEFRAGMENTER LOGIC
  // ==========================================
  const defragWindow = document.getElementById('win-defrag');
  const defragGrid = document.getElementById('defrag-grid');
  const defragStartBtn = document.getElementById('btn-start-defrag');
  const defragCtaBtn = document.getElementById('btn-defrag-cta');
  const defragStatusText = document.getElementById('defrag-status-text');
  const defragProgressBar = document.getElementById('defrag-progress-bar');
  const defragProgressText = document.getElementById('defrag-progress-text');
  
  if(defragWindow && defragGrid) {
    const totalBlocks = 200;
    
    // Initialize random blocks (red = chaos/loss, blue = optimized)
    function initDefragBlocks() {
      defragGrid.innerHTML = '';
      for(let i=0; i<totalBlocks; i++) {
        const block = document.createElement('div');
        block.style.width = '10px';
        block.style.height = '14px';
        block.style.border = '1px solid #ccc';
        
        // 70% chance of being red (chaos) initially
        if(Math.random() > 0.3) {
          block.style.backgroundColor = 'red';
          block.dataset.type = 'chaos';
        } else {
          block.style.backgroundColor = 'blue';
          block.dataset.type = 'optimized';
        }
        defragGrid.appendChild(block);
      }
    }
    
    // Only init when window is opened to save DOM
    // Only init when window is opened to save DOM
    const defragIcon = document.querySelector('.desktop-icon[data-window="win-defrag"]');
    if (defragIcon) {
        defragIcon.addEventListener('dblclick', () => {
          if(defragGrid.children.length === 0) initDefragBlocks();
        });
        defragIcon.addEventListener('click', () => {
          if(defragGrid.children.length === 0) initDefragBlocks();
        });
    }

    defragStartBtn.addEventListener('click', () => {
      const domainInput = document.getElementById('defrag-domain-input');
      const domainValue = domainInput.value.trim() || 'موقعك الإلكتروني';
      
      defragStartBtn.disabled = true;
      if (domainInput) domainInput.disabled = true;
      
      const resultsDiv = document.getElementById('defrag-results');
      if (resultsDiv) {
         resultsDiv.style.display = 'none';
         resultsDiv.classList.add('hidden');
      }
      
      defragStatusText.textContent = `جاري فحص ${domainValue} للبحث عن الفوضى الرقمية...`;
      
      const blocks = Array.from(defragGrid.children);
      let currentIndex = 0;
      
      setTimeout(() => {
        defragStatusText.textContent = `تحليل الأداء... واكتشاف التسرب في الأرباح...`;
      }, 1500);
      
      const defragInterval = setInterval(() => {
        if(currentIndex >= totalBlocks) {
          clearInterval(defragInterval);
          defragStatusText.textContent = `اكتمل الفحص! تم تحديد مسارات التحسين لـ ${domainValue} بنجاح.`;
          defragStatusText.style.color = 'green';
          
          if (resultsDiv) {
             resultsDiv.innerHTML = `
                <strong style="color: red; font-size: 13px;">⚠️ تم اكتشاف تسرب في الأرباح!</strong>
                <ul style="margin-top: 8px; padding-right: 20px; list-style: square; line-height: 1.6;">
                   <li><b>ما يمكن تحسينه:</b> رحلة مستخدم (User Journey) معقدة وبطء نسبي يؤدي لفرصة ضائعة.</li>
                   <li><b>كيف نحسنه:</b> إعادة هيكلة واجهة الاستخدام (UI/UX) وتسريع مسار الدفع أو التواصل.</li>
                   <li><b>ما نقدمه لك:</b> تطوير نظام رقمي متكامل، وتصميم عصري يضاعف معدلات التحويل (Conversion) فوراً.</li>
                </ul>
             `;
             resultsDiv.style.display = 'block';
             resultsDiv.classList.remove('hidden');
          }
          
          defragCtaBtn.classList.remove('hidden');
          return;
        }
        
        // Animate current block (Yellow = scanning)
        const block = blocks[currentIndex];
        const oldBg = block.style.backgroundColor;
        block.style.backgroundColor = 'yellow';
        
        setTimeout(() => {
           // Change everything to optimized (blue) smoothly
           block.style.backgroundColor = 'blue';
           
           // Sort logic visual: If it was red, play a tiny sound (optional, skipping to avoid noise spam)
        }, 100);

        // Update Progress
        currentIndex++;
        const percent = Math.floor((currentIndex / totalBlocks) * 100);
        defragProgressBar.style.width = percent + '%';
        defragProgressText.textContent = percent + '%';
        
      }, 30); // Speed of defrag
    });
  }

  // ==========================================
  // 16. SITE SCANNER LOGIC
  // ==========================================
  const scannerBtn = document.getElementById('scanner-btn');
  const scannerInput = document.getElementById('scanner-input');
  const scannerOutput = document.getElementById('scanner-output');
  
  if (scannerBtn && scannerInput && scannerOutput) {
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    
    scannerBtn.addEventListener('click', async () => {
      const url = scannerInput.value.trim() || 'UNKNOWN_TARGET';
      scannerBtn.disabled = true;
      scannerInput.disabled = true;
      
      const appendText = async (text, delay = 50, color = '#00ff00') => {
        const span = document.createElement('span');
        span.style.color = color;
        span.innerHTML = text;
        scannerOutput.appendChild(span);
        scannerOutput.scrollTop = scannerOutput.scrollHeight;
        if(delay > 0) await sleep(delay);
      };
      
      // Clear specific area or just append
      await appendText(`<br><br>&gt; جاري تهيئة الاتصال بخوادم [${url}]...<br>`, 500);
      await appendText('&gt; تخطي الحماية... نجاح<br>', 300);
      await appendText('&gt; استخراج وتحليل بيانات رحلة المستخدم...<br>', 800);
      
      // Funnel analysis loop
      for(let i = 1; i <= 3; i++) {
        await appendText(`[${i}/3] جاري فحص واجهات الدفع والتصفح 0x00${i}F... `, 400);
        await appendText('خطر<br>', 100, '#ff0000');
      }
      
      await appendText('<br>&gt; تجميع النتائج وبناء التقرير...<br>', 1000);
      
      // Generate some random numbers to make it feel real
      const lostTraffic = Math.floor(Math.random() * 40) + 40; // 40-80%
      const lostRevenue = Math.floor(Math.random() * 9000) + 1000;
      
      await appendText(`<br>================================<br>`, 50);
      await appendText(`<span style="color:#ff0000">خطأ فادح: تم رصد تسرب هائل في الإيرادات</span><br>`, 50);
      await appendText(`================================<br>`, 500);
      
      await appendText(`- سرعة تحميل الموقع: <span style="color:#ff0000">ضعيفة (هروب ${lostTraffic}% من الزوار قبل ظهور المحتوى)</span><br>`, 500);
      await appendText(`- تجربة المستخدم (UX): <span style="color:#ff0000">معقدة جداً (العميل يضيع ولا يكمل عملية الشراء)</span><br>`, 500);
      await appendText(`- الخسارة الشهرية التقديرية: <span style="color:#ff0000">$${lostRevenue}+ ضائعة على الطاولة</span><br><br>`, 800);
      
      await appendText(`الإجراء الإنقاذي الموصى به:<br>`, 200, '#ffff00');
      await appendText(`مطلوب تدخل تقني احترافي عاجل. الواجهات الحالية تقتل مبيعاتك.<br><br>`, 600);
      
      // CTA Button in terminal
      const ctaBtn = document.createElement('button');
      ctaBtn.className = 'win-btn';
      ctaBtn.style.padding = '5px 15px';
      ctaBtn.style.fontWeight = 'bold';
      ctaBtn.style.color = 'red';
      ctaBtn.textContent = 'ابدأ خطة الإنقاذ والمضاعفة (تواصل معنا)';
      ctaBtn.onclick = () => {
        document.querySelector('[data-window=win-contact]').click();
        document.getElementById('win-scanner').classList.add('minimized');
      };
      
      scannerOutput.appendChild(ctaBtn);
      scannerOutput.scrollTop = scannerOutput.scrollHeight;
      
      scannerBtn.disabled = false;
      scannerInput.disabled = false;
    });

    // Allow Enter key to submit
    scannerInput.addEventListener('keypress', (e) => {
      if(e.key === 'Enter') {
        scannerBtn.click();
      }
    });
  }

});

