// Initialize Lucide Icons
lucide.createIcons();

// Visual Haptics Function
function triggerHaptic(el) {
    if (!el) return;
    el.classList.add('haptic-tap');
    setTimeout(() => el.classList.remove('haptic-tap'), 300);
}

// macOS Dock Magnification Logic
const dockIcons = document.querySelectorAll('.dock-icon');
const dockGlass = document.querySelector('.dock-glass');

dockGlass.addEventListener('mousemove', (e) => {
    dockIcons.forEach(icon => {
        const rect = icon.getBoundingClientRect();
        const iconCenter = rect.left + rect.width / 2;
        const distance = Math.abs(e.clientX - iconCenter);
        const maxDistance = 150;
        
        if (distance < maxDistance) {
            const scale = 1 + (0.5 * (1 - distance / maxDistance));
            icon.style.transform = `scale(${scale}) translateY(-${(scale - 1) * 30}px)`;
        } else {
            icon.style.transform = 'scale(1) translateY(0)';
        }
    });
});

dockGlass.addEventListener('mouseleave', () => {
    dockIcons.forEach(icon => {
        icon.style.transform = 'scale(1) translateY(0)';
    });
});

// Page Navigation Logic
function navigateTo(sectionId) {
    console.log(`Navigating to: ${sectionId}`);
    
    // Show skeleton screen before content load
    const mainContent = document.getElementById('main-content');
    mainContent.style.opacity = '0';
    
    setTimeout(() => {
        // Here we would swap content
        // For now, let's just log it
        if (sectionId === 'hero') {
            mainContent.innerHTML = `
                <section id="hero" class="hero-section">
                    <div class="hero-content">
                        <div class="logo-container">
                            <div class="apple-intelligence-logo">
                                <span class="logo-s">S</span>
                                <div class="neural-dot"></div>
                            </div>
                        </div>
                        <h1 class="hero-title">Sotuvlaringizni <br><span class="ai-gradient-text">AI boshqaruviga</span> topshiring.</h1>
                        <p class="hero-subtitle">SellUp AI – Marketplace boshqaruvining yangi davri.</p>
                        <button class="apple-button glow-hover" id="start-btn" onclick="triggerHaptic(this); navigateTo('studio')">
                            <span>Hoziroq boshlang</span>
                        </button>
                    </div>
                </section>
            `;
        } else {
            // Generic Section Template
            mainContent.innerHTML = `
                <div class="skeleton-screen">
                    <div class="skeleton-header"></div>
                    <div class="skeleton-card"></div>
                    <div class="skeleton-card"></div>
                    <div class="skeleton-card"></div>
                </div>
            `;
            
            // Artificial delay to show skeleton
            setTimeout(() => {
                if (sectionId === 'studio') renderStudio();
                if (sectionId === 'seo') renderSEO();
                if (sectionId === 'support') renderSupport();
            }, 800);
        }
        
        mainContent.style.opacity = '1';
        lucide.createIcons();
    }, 300);
}

// Auth Modal
function openAuth() {
    alert("Apple ID style login coming soon!");
}

// Module Renderers
function renderStudio() {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <div class="module-container fade-in" style="padding: 100px 40px; max-width: 1200px; margin: 0 auto;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
                <h2 class="hero-title" style="font-size: 2.5rem; margin-bottom: 0;">AI Infographic Studio</h2>
                <div style="display: flex; gap: 10px;">
                    <button class="apple-button" style="padding: 10px 20px; background: #eee; color: #333;" onclick="triggerHaptic(this)">
                        <i data-lucide="upload" style="width:16px; margin-right:5px;"></i> Import
                    </button>
                    <button class="apple-button" style="padding: 10px 20px;" onclick="triggerHaptic(this)">
                        <i data-lucide="download" style="width:16px; margin-right:5px;"></i> Export 3:4
                    </button>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 300px; gap: 30px;">
                <div class="glass studio-canvas" style="aspect-ratio: 3/4; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; overflow: hidden; background: #fff;">
                    <div id="canvas-placeholder" style="text-align: center; color: var(--apple-text-secondary);">
                        <i data-lucide="image-plus" style="width: 64px; height: 64px; margin-bottom: 20px; opacity: 0.5;"></i>
                        <p>Drag & drop product photo or click to upload</p>
                    </div>
                    <div class="canvas-tools-overlay">
                         <div class="glow-indicator">AI Enhancing...</div>
                    </div>
                </div>
                
                <div class="glass-sidebar" style="display: flex; flex-direction: column; gap: 20px;">
                    <div class="glass tool-card" onclick="triggerHaptic(this)">
                        <i data-lucide="scissors"></i>
                        <span>Background Removal</span>
                    </div>
                    <div class="glass tool-card" onclick="triggerHaptic(this)">
                        <i data-lucide="palette"></i>
                        <span>Brand Colors</span>
                    </div>
                    <div class="glass tool-card" onclick="triggerHaptic(this)">
                        <i data-lucide="sun"></i>
                        <span>Premium Lighting</span>
                    </div>
                    <div class="glass tool-card" onclick="triggerHaptic(this)">
                        <i data-lucide="layers"></i>
                        <span>Smart Shadows</span>
                    </div>
                    <div class="glass tool-card" onclick="triggerHaptic(this)">
                        <i data-lucide="wand-2"></i>
                        <span>Auto-Enhance</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    lucide.createIcons();
}

function renderSEO() {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <div class="module-container fade-in" style="padding: 100px 40px; max-width: 1200px; margin: 0 auto;">
            <h2 class="hero-title" style="font-size: 2.5rem; text-align: left; margin-bottom: 30px;">Smart Card Creator</h2>
            <div style="display: grid; grid-template-columns: 1fr 350px; gap: 40px;">
                <div class="glass notes-view" style="height: 600px; padding: 40px; display: flex; flex-direction: column;">
                     <div class="notes-header" style="border-bottom: 1px solid #eee; padding-bottom: 20px; margin-bottom: 20px;">
                        <input type="text" placeholder="Product Title..." style="width: 100%; font-size: 1.8rem; font-weight: 700; border: none; outline: none; background: transparent;">
                     </div>
                     <textarea placeholder="Start typing product details or drop an image for AI analysis (Apple Notes Style)..." style="width: 100%; flex: 1; border: none; background: transparent; font-size: 1.1rem; line-height: 1.6; resize: none; outline: none;"></textarea>
                </div>
                
                <div style="display: flex; flex-direction: column; gap: 30px;">
                    <div class="glass" style="padding: 30px; text-align: center;">
                        <h3 style="margin-bottom: 20px;">SEO Analysis</h3>
                        <div class="activity-rings-container">
                             <svg viewBox="0 0 100 100" width="180" height="180">
                                <circle class="ring-bg" cx="50" cy="50" r="40" />
                                <circle class="ring-progress" cx="50" cy="50" r="40" style="stroke-dasharray: 251.2; stroke-dashoffset: 50; stroke: #ff3b30;" /> <!-- Red -->
                                
                                <circle class="ring-bg" cx="50" cy="50" r="30" />
                                <circle class="ring-progress" cx="50" cy="50" r="30" style="stroke-dasharray: 188.4; stroke-dashoffset: 40; stroke: #4cd964;" /> <!-- Green -->
                                
                                <circle class="ring-bg" cx="50" cy="50" r="20" />
                                <circle class="ring-progress" cx="50" cy="50" r="20" style="stroke-dasharray: 125.6; stroke-dashoffset: 25; stroke: #007aff;" /> <!-- Blue -->
                             </svg>
                             <div class="ring-label">85%</div>
                        </div>
                        <p style="margin-top: 20px; color: var(--apple-text-secondary);">Keywords, Description, and Title are highly optimized.</p>
                    </div>
                    
                    <div class="glass" style="padding: 20px;">
                        <h4>Suggested Keywords</h4>
                        <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 15px;">
                            <span class="keyword-tag">Premium</span>
                            <span class="keyword-tag">Yangi</span>
                            <span class="keyword-tag">Sifatli</span>
                            <span class="keyword-tag">Arzon</span>
                            <span class="keyword-tag">Uzum</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderSupport() {
    const mainContent = document.getElementById('main-content');
     mainContent.innerHTML = `
        <div class="module-container fade-in" style="padding: 100px 40px; max-width: 800px; margin: 0 auto;">
            <h2 class="hero-title" style="font-size: 2.5rem; text-align: left; margin-bottom: 30px;">AI Support Desk</h2>
            <div class="glass" style="height: 600px; display: flex; flex-direction: column; overflow: hidden; background: #fff;">
                <div class="chat-header" style="padding: 15px 20px; border-bottom: 1px solid #eee; display: flex; align-items: center; gap: 15px;">
                    <div style="width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #007AFF, #5856D6); display: flex; align-items: center; justify-content: center; color: white;">
                        <i data-lucide="bot"></i>
                    </div>
                    <div>
                        <div style="font-weight: 600;">SellUp AI Assistant</div>
                        <div style="font-size: 0.8rem; color: #4cd964;">● Online</div>
                    </div>
                </div>
                
                <div id="chat-messages" style="flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 10px;">
                    <div class="i-message-bubble incoming">Assalomu alaykum! Men SellUp AI yordamchisiman.</div>
                    <div class="i-message-bubble incoming">Sotuvlaringizni oshirishda senga qanday yordam bera olaman?</div>
                </div>
                
                <div style="padding: 20px; border-top: 1px solid #eee; display: flex; gap: 10px; align-items: center;">
                    <i data-lucide="plus-circle" style="color: #8e8e93; cursor: pointer;"></i>
                    <div style="flex: 1; position: relative;">
                        <input type="text" id="chat-input" placeholder="iMessage" style="width: 100%; padding: 10px 15px; border-radius: 20px; border: 1px solid #e5e5ea; background: #fff; outline: none; font-size: 1rem;">
                        <i data-lucide="arrow-up-circle" style="position: absolute; right: 8px; top: 50%; transform: translateY(-50%); color: var(--apple-blue); cursor: pointer;" onclick="sendMessage()"></i>
                    </div>
                </div>
            </div>
        </div>
    `;
    lucide.createIcons();
    
    const input = document.getElementById('chat-input');
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
}

function sendMessage() {
    const input = document.getElementById('chat-input');
    const msg = input.value.trim();
    if (!msg) return;
    
    appendMessage(msg, 'outgoing');
    input.value = '';
    triggerHaptic();
    
    // AI Mock Response
    setTimeout(() => {
        appendMessage("Tushundim. Hozirda bu funksiya ustida ishlayapman. Tez orada tayyor bo'ladi!", 'incoming');
    }, 1000);
}

function appendMessage(text, type) {
    const chat = document.getElementById('chat-messages');
    const div = document.createElement('div');
    div.className = `i-message-bubble ${type}`;
    div.textContent = text;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
}

// Add CSS for modules dynamically
const style = document.createElement('style');
style.textContent = `
    .fade-in {
        animation: fadeIn 0.5s ease forwards;
    }
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    .i-message-bubble {
        padding: 8px 15px;
        border-radius: 20px;
        margin-bottom: 5px;
        max-width: 75%;
        font-size: 0.95rem;
        line-height: 1.4;
        position: relative;
    }
    .incoming {
        background: #E9E9EB;
        color: black;
        align-self: flex-start;
        border-bottom-left-radius: 4px;
    }
    .outgoing {
        background: var(--apple-blue);
        color: white;
        align-self: flex-end;
        border-bottom-right-radius: 4px;
    }
`;
document.head.appendChild(style);
