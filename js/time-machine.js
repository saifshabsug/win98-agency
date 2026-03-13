// js/time-machine.js - Handles the jaw-dropping transition to Web 3.0

document.addEventListener('DOMContentLoaded', () => {
  const btnTimeTravel = document.getElementById('btn-time-travel');
  const winTimeMachine = document.getElementById('win-time-machine');
  const overlay = document.createElement('div');
  
  // Setup overlay for the flashbang effect
  overlay.id = 'transition-overlay';
  document.body.appendChild(overlay);

  // Handle Deep Linking to Modern Mode directly
  if (window.location.search.includes('modern=true')) {
      const desktopArea = document.querySelector('.desktop-area');
      const taskbar = document.querySelector('.taskbar');
      const clippy = document.getElementById('clippy');
      const msn = document.getElementById('win-msn');
      
      if(desktopArea) desktopArea.style.display = 'none';
      if(taskbar) taskbar.style.display = 'none';
      if(clippy) clippy.style.display = 'none';
      if(msn) msn.style.display = 'none';
      if(winTimeMachine) winTimeMachine.classList.add('hidden');
      if(overlay) overlay.style.display = 'none';
      
      document.body.classList.remove('desktop-os');
      document.body.classList.add('modern-mode');
      
      const modernApp = document.getElementById('modern-app');
      if (modernApp) {
        modernApp.classList.remove('hidden');
        setTimeout(() => {
            initModernBackground();
            initStarfield();
        }, 100);
      }
  }

  if (btnTimeTravel) {
    btnTimeTravel.addEventListener('click', triggerTimeTravel);
  }

  function triggerTimeTravel() {
    // 1. Close specific windows and initial sound
    if (winTimeMachine) winTimeMachine.classList.add('hidden');
    
    // Play sci-fi buildup sound (fallback to a basic oscillator buildup if no external audio)
    playTimeTravelSound();

    // 2. Add shake effect to the entire desktop
    const desktopArea = document.querySelector('.desktop-area');
    const taskbar = document.querySelector('.taskbar');
    desktopArea.classList.add('shake-screen');
    
    // 3. Make all windows fade and blur out
    document.querySelectorAll('.window').forEach(win => {
       win.classList.add('fade-out');
    });
    
    // 4. After 1.5s, trigger FlashBang
    setTimeout(() => {
      overlay.style.display = 'block';
      overlay.classList.add('flash');
      
      // 5. Mid-flash: swap the DOM visibility and load heavy assets
      setTimeout(() => {
        // Hide Win98 Elements completely
        desktopArea.style.display = 'none';
        taskbar.style.display = 'none';
        const clippy = document.getElementById('clippy');
        if(clippy) clippy.style.display = 'none';
        const msn = document.getElementById('win-msn');
        if(msn) msn.style.display = 'none';
        
        document.body.classList.remove('desktop-os');
        document.body.classList.add('modern-mode');
        
        // Show Modern App
        const modernApp = document.getElementById('modern-app');
        if (modernApp) {
          modernApp.classList.remove('hidden');
          // Trigger initializations
          initModernBackground();
          initStarfield();
        }
      }, 500); // Trigger swap at height of flash
      
    }, 1500); // Build up time
  }

  // --- Return function ---
  window.returnToWin98 = function() {
    overlay.classList.remove('flash');
    overlay.style.display = 'block';
    overlay.style.opacity = '1';
    overlay.style.background = '#000';
    
    playReturnSound();
    
    setTimeout(() => {
      // Hide Modern
      window.history.replaceState({}, document.title, window.location.pathname); // Clear URL params
      const modernApp = document.getElementById('modern-app');
      if (modernApp) modernApp.classList.add('hidden');
      document.body.classList.remove('modern-mode');
      document.body.classList.add('desktop-os');
      
      // Restore Win98
      const desktopArea = document.querySelector('.desktop-area');
      const taskbar = document.querySelector('.taskbar');
      desktopArea.style.display = 'block';
      taskbar.style.display = 'flex';
      
      const clippy = document.getElementById('clippy');
      if(clippy) clippy.style.display = '';
      const msn = document.getElementById('win-msn');
      if(msn) msn.style.display = '';
      
      desktopArea.classList.remove('shake-screen');
      document.querySelectorAll('.window').forEach(win => {
         win.classList.remove('fade-out');
      });
      
      // Fade from black
      overlay.style.transition = 'opacity 1s ease';
      overlay.style.opacity = '0';
      setTimeout(() => {
        overlay.style.display = 'none';
        overlay.style.transition = '';
      }, 1000);
      
    }, 500);
  };

  // --- Audio Context for Effects ---
  let audioCtx;
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  } catch (e) {
    console.warn("AudioContext not supported or blocked by browser:", e);
  }
  
  function playTimeTravelSound() {
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
    // Deep bass sweep up
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(50, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 1.5);
    
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(1, audioCtx.currentTime + 1.0);
    gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1.5);
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 1.6);
  }
  
  function playReturnSound() {
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.5);
    
    gainNode.gain.setValueAtTime(1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.6);
  }

  // --- Interactive Starfield ---
  var starsInitialized = false;
  function initStarfield() {
    if (starsInitialized) return;
    starsInitialized = true;
    
    const canvas = document.getElementById('starfield-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let width, height;
    let stars = [];
    const numStars = 600;
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;
    
    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    }
    
    window.addEventListener('resize', resize);
    resize();
    
    // Initialize stars
    for (let i = 0; i < numStars; i++) {
        stars.push({
            x: Math.random() * width * 2 - width, // distributed wider for parallax
            y: Math.random() * height * 2 - height,
            z: Math.random() * 2000,
            size: Math.random() * 1.5 + 0.5
        });
    }
    
    document.addEventListener('mousemove', (e) => {
        if(!document.body.classList.contains('modern-mode')) return;
        // Parallax effect
        targetMouseX = (e.clientX - width / 2) * 5;
        targetMouseY = (e.clientY - height / 2) * 5;
    });
    
    function animate() {
        if(!document.body.classList.contains('modern-mode')) {
            requestAnimationFrame(animate);
            return;
        }
        
        ctx.clearRect(0, 0, width, height);
        
        // Smooth follow mouse
        mouseX += (targetMouseX - mouseX) * 0.05;
        mouseY += (targetMouseY - mouseY) * 0.05;
        
        stars.forEach(star => {
            star.z -= 2; // Speed of passing stars
            if (star.z <= 0) {
                star.x = Math.random() * width * 2 - width;
                star.y = Math.random() * height * 2 - height;
                star.z = 2000;
            }
            
            // 3D projection mapping
            const fov = 300;
            const projectedX = (star.x - mouseX) * (fov / star.z) + width / 2;
            const projectedY = (star.y - mouseY) * (fov / star.z) + height / 2;
            const projectedSize = star.size * (fov / star.z);
            
            if (projectedX > 0 && projectedX < width && projectedY > 0 && projectedY < height) {
                 // Opacity based on distance
                 const opacity = Math.min(1, 2000 / star.z - 0.5);
                 ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
                 ctx.beginPath();
                 ctx.arc(projectedX, projectedY, projectedSize, 0, Math.PI * 2);
                 ctx.fill();
            }
        });
        
        requestAnimationFrame(animate);
    }
    
    animate();
  }

  // --- Modern Background & Interactions Init ---
  var bgInitialized = false;
  function initModernBackground() {
    if (bgInitialized) return;
    bgInitialized = true;
    
    // 1. Mouse Tracking for Global Spotlight and Cards
    const spotlight = document.getElementById('spotlight-cursor');
    const cards = document.querySelectorAll('.spotlight-card');
    
    document.addEventListener('mousemove', (e) => {
        if(!document.body.classList.contains('modern-mode')) return;
        
        // Global aura
        if(spotlight) {
            spotlight.style.left = e.clientX + 'px';
            spotlight.style.top = e.clientY + 'px';
        }
    });

    // Dedicated listener for card local coordinates
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });

    // 2. Red to Green Tech Upgrade Toggle (3D Server Node)
    window.fixLegacySystem = function(bladeElement) {
         if (!bladeElement.classList.contains('error-state')) {
             // Revert to Error/Red state
             bladeElement.classList.remove('active');
             bladeElement.classList.add('error-state');
             
             const lights = bladeElement.querySelector('.blade-lights');
             if (lights) {
                lights.innerHTML = '<span class="s-light pulse-red"></span><span class="s-light"></span>';
             }
             const label = bladeElement.querySelector('.blade-label');
             if (label) {
                label.textContent = 'NODE_ERR';
             }
             
             document.body.classList.remove('success-mode');
             
             // Revert Content
             const heroBadge = document.getElementById('hero-badge');
             if(heroBadge) heroBadge.innerHTML = 'نحن نعرف الماضي جيداً، لكننا نبني المستقبل 🚀';
             
             const heroTitle = document.getElementById('hero-title');
             if(heroTitle) heroTitle.innerHTML = 'نصمم ونبرمج لك<br><span class="text-gradient-bright" id="hero-gradient">مستقبلاً رقمياً لا يُنسى</span>';
             
             const heroDesc = document.getElementById('hero-desc');
             if(heroDesc) heroDesc.innerHTML = 'المواقع البطيئة، السيرفرات المتوقفة، والأنظمة المخترقة تكلفك عملاء حقيقيين كل دقيقة. ارتقِ ببنيتك التحتية لتواكب مستوى تطلعاتك الاستثنائية.';
             
             const trustBarSpans = document.querySelectorAll('.w3-trust-bar span');
             if(trustBarSpans.length >= 3) {
                 trustBarSpans[0].innerHTML = '<span style="color:var(--w3-primary);">▼ 45%</span> معدل ارتداد';
                 trustBarSpans[1].innerHTML = '<span style="color:var(--w3-primary);">▼ $12K</span> تسرب شهري';
                 trustBarSpans[2].innerHTML = '<span style="color:var(--w3-primary);">⚠</span> ثغرات خطرة';
             }
             
             const helper = document.querySelector('.server-helper-text');
             if(helper) helper.innerHTML = 'تحذير: النظام يعمل بکفاءة 32٪ فقط. <br>اضغط على الخادم الأحمر لإصلاح البنية التحتية.';
             
             return;
         }
         
         // Visually upgrade the blade
         bladeElement.classList.remove('error-state');
         bladeElement.classList.add('active'); // Pop out
         
         const lights = bladeElement.querySelector('.blade-lights');
         if (lights) {
            lights.innerHTML = '<span class="s-light pulse-blue"></span><span class="s-light"></span>';
         }
         const label = bladeElement.querySelector('.blade-label');
         if (label) {
            label.textContent = 'NODE_SECURE';
         }
         
         // Change CSS Theme globally
         document.body.classList.add('success-mode');
         
         // Play Success Sound
         playSuccessTechSound();
         
         // Dynamic Content Replacements
         const heroBadge = document.getElementById('hero-badge');
         if(heroBadge) heroBadge.innerHTML = 'الأنظمة مؤمنة وتعمل بكفاءة عالية 💯';
         
         const heroTitle = document.getElementById('hero-title');
         if(heroTitle) heroTitle.innerHTML = 'نصمم ونبرمج لك<br><span class="text-gradient-bright" id="hero-gradient">مستقبلاً رقمياً لا يُنسى</span>';
         
         const heroDesc = document.getElementById('hero-desc');
         if(heroDesc) heroDesc.innerHTML = 'خوادم لا تنهار، أمان سيبراني معقد، وعمليات مؤتمتة بالذكاء الاصطناعي 24/7. هكذا تنمو وتتصدر السوق.';
         
         const trustBarSpans = document.querySelectorAll('.w3-trust-bar span');
         if(trustBarSpans.length >= 3) {
             trustBarSpans[0].innerHTML = '<span style="color:var(--w3-secondary);">▲ 85%</span> زيادة تحويلات';
             trustBarSpans[1].innerHTML = '<span style="color:var(--w3-secondary);">0</span> ثواني تعطل';
             trustBarSpans[2].innerHTML = '<span style="color:var(--w3-secondary);">🔒</span> أمان سيبراني محكم';
         }
         
         // Wait for animation then change helper text
         setTimeout(() => {
             const helper = document.querySelector('.server-helper-text');
             if(helper) helper.innerHTML = '<a href="https://wa.me/966XXXXXXXXX" target="_blank" style="color:var(--w3-primary); font-weight:bold; text-decoration:none; padding:10px; border:1px solid var(--w3-primary); border-radius:5px; background:rgba(255,255,255,0.05);">البنية التحتية جاهزة - تواصل معنا</a>';
         }, 800);
    };

    // 3. Scroll Animations for Vertical Timeline
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, { threshold: 0.2 });

    document.querySelectorAll('.w3-step').forEach(step => {
        observer.observe(step);
    });
  }
  
  function playSuccessTechSound() {
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc1.frequency.setValueAtTime(400, audioCtx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.3);
      
      osc2.frequency.setValueAtTime(600, audioCtx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.3);
      
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
      
      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      osc1.start();
      osc2.start();
      osc1.stop(audioCtx.currentTime + 0.6);
      osc2.stop(audioCtx.currentTime + 0.6);
  }
});
