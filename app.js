/**
 * SellUp AI — Main Application Logic
 * Modules: Unit Economics, AI Studio, Market Intelligence, FBS/FBO, Chat, CMD+K
 */

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    initNavigation();
    initCommandBar();
    initCalculator();
    initStudio();
    initAnalytics();
    initFBS();
    initChat();
    initCounters();
});

// ============================================
// NAVIGATION (SPA Router)
// ============================================
let currentPage = 'hero';

function navigateTo(pageId) {
    const pages = document.querySelectorAll('.page');
    const dockItems = document.querySelectorAll('.dock-item');

    // Hide all pages
    pages.forEach(p => p.classList.remove('active'));

    // Show target
    const target = document.getElementById(`page-${pageId}`);
    if (target) {
        target.classList.add('active');
        currentPage = pageId;

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Update dock
        dockItems.forEach(d => {
            d.classList.toggle('active', d.dataset.page === pageId);
        });

        // Reinitialize icons
        setTimeout(() => lucide.createIcons(), 50);

        // Trigger page-specific init
        if (pageId === 'calculator') calculateUnitEconomics();
        if (pageId === 'analytics') animateCharts();
        if (pageId === 'fbs') renderKanban();

        // Re-count animations
        initCounters();
    }

    // Close command bar if open
    closeCommandBar();
}

function initNavigation() {
    // Dock magnification effect
    const dockBar = document.querySelector('.dock-bar');
    const dockItems = document.querySelectorAll('.dock-item');

    if (dockBar) {
        dockBar.addEventListener('mousemove', (e) => {
            dockItems.forEach(item => {
                const rect = item.getBoundingClientRect();
                const center = rect.left + rect.width / 2;
                const dist = Math.abs(e.clientX - center);
                const maxDist = 120;
                if (dist < maxDist) {
                    const scale = 1 + (0.35 * (1 - dist / maxDist));
                    item.style.transform = `scale(${scale}) translateY(-${(scale - 1) * 18}px)`;
                } else {
                    item.style.transform = '';
                }
            });
        });

        dockBar.addEventListener('mouseleave', () => {
            dockItems.forEach(item => {
                item.style.transform = '';
            });
        });
    }
}

// ============================================
// COMMAND BAR (CMD+K / Ctrl+K)
// ============================================
const commandActions = [
    { name: 'Bosh sahifa', icon: 'home', action: () => navigateTo('hero'), shortcut: '1' },
    { name: 'Unit Economics Kalkulyatori', icon: 'calculator', action: () => navigateTo('calculator'), shortcut: '2' },
    { name: 'AI Kontent Studio', icon: 'sparkles', action: () => navigateTo('studio'), shortcut: '3' },
    { name: 'Bozor Tahlili', icon: 'bar-chart-3', action: () => navigateTo('analytics'), shortcut: '4' },
    { name: 'FBS / FBO Boshqaruv', icon: 'package', action: () => navigateTo('fbs'), shortcut: '5' },
    { name: 'AI Yordamchi', icon: 'message-circle', action: () => navigateTo('support'), shortcut: '6' },
    { name: 'Yangi buyurtma qo\'shish', icon: 'plus-circle', action: () => { navigateTo('fbs'); setTimeout(addNewOrder, 500); } },
    { name: 'Foydani hisoblash', icon: 'trending-up', action: () => navigateTo('calculator') },
    { name: 'Rasm yuklash', icon: 'upload', action: () => { navigateTo('studio'); } },
];

let highlightedIndex = 0;

function initCommandBar() {
    document.addEventListener('keydown', (e) => {
        // Ctrl+K or Cmd+K
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            toggleCommandBar();
        }

        // Escape
        if (e.key === 'Escape') {
            closeCommandBar();
        }

        // Navigate with arrow keys in command bar
        const overlay = document.getElementById('command-overlay');
        if (!overlay.classList.contains('hidden')) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                highlightedIndex = Math.min(highlightedIndex + 1, document.querySelectorAll('.cmd-result-item').length - 1);
                updateHighlight();
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                highlightedIndex = Math.max(highlightedIndex - 1, 0);
                updateHighlight();
            }
            if (e.key === 'Enter') {
                e.preventDefault();
                const items = document.querySelectorAll('.cmd-result-item');
                if (items[highlightedIndex]) items[highlightedIndex].click();
            }
        }
    });

    // Search filter
    const cmdInput = document.getElementById('cmd-input');
    if (cmdInput) {
        cmdInput.addEventListener('input', (e) => {
            filterCommands(e.target.value);
        });
    }

    // Click outside to close
    const overlay = document.getElementById('command-overlay');
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeCommandBar();
        });
    }
}

function toggleCommandBar() {
    const overlay = document.getElementById('command-overlay');
    if (overlay.classList.contains('hidden')) {
        openCommandBar();
    } else {
        closeCommandBar();
    }
}

function openCommandBar() {
    const overlay = document.getElementById('command-overlay');
    const input = document.getElementById('cmd-input');
    overlay.classList.remove('hidden');
    input.value = '';
    input.focus();
    highlightedIndex = 0;
    filterCommands('');
}

function closeCommandBar() {
    const overlay = document.getElementById('command-overlay');
    overlay.classList.add('hidden');
}

function filterCommands(query) {
    const resultsContainer = document.getElementById('cmd-results');
    const filtered = query
        ? commandActions.filter(a => a.name.toLowerCase().includes(query.toLowerCase()))
        : commandActions;

    resultsContainer.innerHTML = filtered.map((item, i) => `
        <div class="cmd-result-item ${i === highlightedIndex ? 'highlighted' : ''}" onclick="commandActions.find(a => a.name === '${item.name.replace(/'/g, "\\'")}').action()">
            <i data-lucide="${item.icon}"></i>
            <span>${item.name}</span>
            ${item.shortcut ? `<kbd>${item.shortcut}</kbd>` : ''}
        </div>
    `).join('');

    highlightedIndex = 0;
    lucide.createIcons();
}

function updateHighlight() {
    const items = document.querySelectorAll('.cmd-result-item');
    items.forEach((item, i) => {
        item.classList.toggle('highlighted', i === highlightedIndex);
    });
}

// ============================================
// UNIT ECONOMICS CALCULATOR
// ============================================
function initCalculator() {
    // Sync range sliders with inputs
    const priceInput = document.getElementById('calc-price');
    const priceRange = document.getElementById('calc-price-range');
    const costInput = document.getElementById('calc-cost');
    const costRange = document.getElementById('calc-cost-range');

    if (priceInput && priceRange) {
        priceInput.addEventListener('input', () => {
            priceRange.value = priceInput.value;
            calculateUnitEconomics();
        });
        priceRange.addEventListener('input', () => {
            priceInput.value = priceRange.value;
            calculateUnitEconomics();
        });
    }

    if (costInput && costRange) {
        costInput.addEventListener('input', () => {
            costRange.value = costInput.value;
            calculateUnitEconomics();
        });
        costRange.addEventListener('input', () => {
            costInput.value = costRange.value;
            calculateUnitEconomics();
        });
    }

    // Category change
    const categorySelect = document.getElementById('calc-category');
    if (categorySelect) {
        categorySelect.addEventListener('change', calculateUnitEconomics);
    }

    // Quantity change
    const quantityInput = document.getElementById('calc-quantity');
    if (quantityInput) {
        quantityInput.addEventListener('input', calculateUnitEconomics);
    }

    // Logistics radio cards
    document.querySelectorAll('.radio-card[data-logistics]').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.radio-card[data-logistics]').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            card.querySelector('input').checked = true;

            // Show/hide MGT tier
            const mgtGroup = document.getElementById('mgt-tier-group');
            if (card.dataset.logistics === 'mgt') {
                mgtGroup.style.display = 'block';
            } else {
                mgtGroup.style.display = 'none';
            }
            calculateUnitEconomics();
        });
    });

    // MGT tier radio cards
    document.querySelectorAll('.radio-card[data-mgt]').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.radio-card[data-mgt]').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            card.querySelector('input').checked = true;
            calculateUnitEconomics();
        });
    });
}

function calculateUnitEconomics() {
    const price = parseFloat(document.getElementById('calc-price')?.value) || 0;
    const cost = parseFloat(document.getElementById('calc-cost')?.value) || 0;
    const commissionRate = parseFloat(document.getElementById('calc-category')?.value) || 10;
    const quantity = parseInt(document.getElementById('calc-quantity')?.value) || 1;

    // Get logistics cost
    let logisticsCost = 0;
    const logisticsType = document.querySelector('input[name="logistics"]:checked')?.value;

    if (logisticsType === 'mgt') {
        logisticsCost = parseFloat(document.querySelector('input[name="mgt-tier"]:checked')?.value) || 2000;
    } else if (logisticsType === 'ogt') {
        logisticsCost = 8000;
    } else if (logisticsType === 'ygt') {
        logisticsCost = 20000;
    }

    // Calculate
    const commission = price * (commissionRate / 100);
    const totalExpenses = cost + commission + logisticsCost;
    const profit = price - totalExpenses;
    const margin = price > 0 ? (profit / price) * 100 : 0;
    const monthlyProfit = profit * quantity;

    // Break-even price (where profit = 0)
    const breakeven = cost + logisticsCost + (cost + logisticsCost) * (commissionRate / (100 - commissionRate));

    // Update UI
    const profitEl = document.getElementById('result-profit');
    if (profitEl) {
        profitEl.textContent = formatNumber(Math.round(profit));
        profitEl.style.color = profit >= 0 ? 'white' : '#FF6B6B';
    }

    const marginFill = document.getElementById('margin-fill');
    if (marginFill) {
        marginFill.style.width = `${Math.max(0, Math.min(100, margin))}%`;
    }

    const marginText = document.getElementById('result-margin');
    if (marginText) marginText.textContent = margin.toFixed(1);

    const commissionEl = document.getElementById('result-commission');
    if (commissionEl) commissionEl.textContent = formatNumber(Math.round(commission)) + ' so\'m';

    const logisticsEl = document.getElementById('result-logistics');
    if (logisticsEl) logisticsEl.textContent = formatNumber(logisticsCost) + ' so\'m';

    const monthlyEl = document.getElementById('result-monthly');
    if (monthlyEl) monthlyEl.textContent = formatNumber(Math.round(monthlyProfit)) + ' so\'m';

    const breakevenEl = document.getElementById('result-breakeven');
    if (breakevenEl) breakevenEl.textContent = formatNumber(Math.round(breakeven)) + ' so\'m';

    // Update donut chart
    updateDonutChart(cost, commission, logisticsCost, profit, price);
}

function updateDonutChart(cost, commission, logistics, profit, total) {
    const svg = document.getElementById('profit-donut');
    if (!svg || total <= 0) return;

    const radius = 80;
    const circumference = 2 * Math.PI * radius;

    const costPercent = (cost / total) * 100;
    const commissionPercent = (commission / total) * 100;
    const logisticsPercent = (logistics / total) * 100;
    const profitPercent = Math.max(0, (profit / total) * 100);

    const segments = [
        { percent: costPercent, color: '#7B2FBE', label: 'Tannarx' },
        { percent: commissionPercent, color: '#FF6B00', label: 'Komissiya' },
        { percent: logisticsPercent, color: '#3B82F6', label: 'Logistika' },
        { percent: profitPercent, color: '#10B981', label: 'Foyda' },
    ];

    let html = `<circle cx="100" cy="100" r="${radius}" fill="none" stroke="#F3E8FF" stroke-width="25"/>`;
    let offset = 0;

    segments.forEach(seg => {
        const dashArray = (seg.percent / 100) * circumference;
        const dashOffset = circumference - dashArray;
        const rotation = (offset / 100) * 360 - 90;

        html += `<circle cx="100" cy="100" r="${radius}" fill="none" 
                    stroke="${seg.color}" stroke-width="25" 
                    stroke-dasharray="${dashArray} ${circumference - dashArray}" 
                    transform="rotate(${rotation} 100 100)"
                    style="transition: all 0.6s ease"/>`;
        offset += seg.percent;
    });

    svg.innerHTML = html;

    // Center text
    const centerText = document.getElementById('donut-center-text');
    if (centerText) centerText.textContent = `${Math.max(0, profitPercent).toFixed(0)}%`;

    // Legend
    const legend = document.getElementById('donut-legend');
    if (legend) {
        legend.innerHTML = segments.map(s => `
            <div class="legend-item">
                <div class="legend-dot" style="background: ${s.color};"></div>
                ${s.label} (${s.percent.toFixed(1)}%)
            </div>
        `).join('');
    }
}

// ============================================
// AI CONTENT STUDIO
// ============================================
let uploadedImage = null;

function initStudio() {
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-upload');

    if (!uploadArea || !fileInput) return;

    // Drag & Drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleImageUpload(file);
        }
    });

    // File input
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) handleImageUpload(file);
    });
}

function handleImageUpload(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        uploadedImage = e.target.result;

        // Show preview with WOW bounce animation
        const placeholder = document.getElementById('upload-placeholder');
        const preview = document.getElementById('upload-preview');
        const previewImage = document.getElementById('preview-image');

        if (placeholder) placeholder.classList.add('hidden');
        if (preview) {
            preview.classList.remove('hidden');
            previewImage.src = uploadedImage;
        }

        // Enable SEO button
        const seoBtn = document.getElementById('generate-seo-btn');
        if (seoBtn) seoBtn.disabled = false;

        // Run compliance check with animation
        setTimeout(runComplianceCheck, 500);
    };
    reader.readAsDataURL(file);
}

function runComplianceCheck() {
    const rules = document.querySelectorAll('#compliance-rules .rule-item');
    const statusBadge = document.getElementById('compliance-status');

    // Simulate AI analysis with staggered animations
    const results = [
        { pass: true },   // No text on main image
        { pass: Math.random() > 0.3 },  // White background
        { pass: Math.random() > 0.5 },  // Image quality
        { pass: true },   // No watermark
        { pass: Math.random() > 0.4 },  // 3:4 ratio
    ];

    let passCount = 0;

    rules.forEach((rule, i) => {
        setTimeout(() => {
            const check = rule.querySelector('.rule-check');
            check.classList.remove('pending');

            if (results[i].pass) {
                check.classList.add('pass');
                check.innerHTML = '<i data-lucide="check"></i>';
                passCount++;
            } else {
                check.classList.add('fail');
                check.innerHTML = '<i data-lucide="x"></i>';
            }

            lucide.createIcons();

            // Update status badge after all checks
            if (i === rules.length - 1) {
                if (passCount === rules.length) {
                    statusBadge.textContent = 'Muvofiq ✓';
                    statusBadge.className = 'status-badge pass';
                } else if (passCount >= 3) {
                    statusBadge.textContent = 'Qisman muvofiq';
                    statusBadge.className = 'status-badge warning';
                } else {
                    statusBadge.textContent = 'Nomuvofiq ✗';
                    statusBadge.className = 'status-badge fail';
                }

                // Update image badges
                updateComplianceBadges(passCount, rules.length);
            }
        }, (i + 1) * 400);
    });
}

function updateComplianceBadges(passCount, totalCount) {
    const badgesContainer = document.getElementById('compliance-badges');
    if (!badgesContainer) return;

    let html = '';
    if (passCount === totalCount) {
        html = '<div class="badge badge-pass"><i data-lucide="check-circle"></i> Uzum Approved</div>';
    } else {
        html = `<div class="badge badge-warn"><i data-lucide="alert-circle"></i> ${passCount}/${totalCount} muvofiq</div>`;
    }

    badgesContainer.innerHTML = html;
    lucide.createIcons();
}

function generateSEO() {
    const output = document.getElementById('seo-output');
    if (!output) return;

    // Show loading
    output.innerHTML = `
        <div style="text-align: center; padding: 20px;">
            <div class="typing-dot" style="display: inline-block; margin: 0 2px; width: 8px; height: 8px; background: var(--violet-500); border-radius: 50%; animation: typingBounce 1.4s infinite;"></div>
            <div class="typing-dot" style="display: inline-block; margin: 0 2px; width: 8px; height: 8px; background: var(--violet-500); border-radius: 50%; animation: typingBounce 1.4s infinite 0.2s;"></div>
            <div class="typing-dot" style="display: inline-block; margin: 0 2px; width: 8px; height: 8px; background: var(--violet-500); border-radius: 50%; animation: typingBounce 1.4s infinite 0.4s;"></div>
            <p style="margin-top: 10px; color: var(--text-tertiary); font-size: 0.85rem;">AI tahlil qilmoqda...</p>
        </div>
    `;

    // Simulate AI generation
    setTimeout(() => {
        const titles = [
            "Premium sifatli mahsulot | Tez yetkazish | Kafolat bilan",
            "Yangi kolleksiya | Eng arzon narx | Sifat kafolati",
            "Original mahsulot | Bepul yetkazish | 30 kun kafolat",
        ];

        const descriptions = [
            "Yuqori sifatli materialdan tayyorlangan. O'zbekiston bo'ylab tez yetkazish. 30 kunlik qaytarish kafolati. Uzum Market rasmiy sotuvchisi. Barcha ranglar va o'lchamlar mavjud.",
            "Premium sifat — har bir buyurtma sinchiklab tekshiriladi. 1-3 kun ichida yetkazish. Arzon narx va ishonchli xizmat. Buyurtma bering — afzalliklarni his qiling!",
            "Mahsulot tavsifi: Original, sifatli, bardoshli. Tez yetkazish xizmati mavjud. Murojaat qilganingizda qo'shimcha chegirmalar. Bizning do'konda eng yaxshi takliflar!",
        ];

        const randomIdx = Math.floor(Math.random() * titles.length);

        output.innerHTML = `
            <div class="seo-result">
                <div class="seo-result-block">
                    <label>SEO Sarlavha (UZ)</label>
                    <p>${titles[randomIdx]}</p>
                </div>
                <div class="seo-result-block">
                    <label>Tavsif (UZ)</label>
                    <p>${descriptions[randomIdx]}</p>
                </div>
                <div class="seo-result-block">
                    <label>Kalit so'zlar</label>
                    <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px;">
                        <span class="pill" style="padding: 5px 10px; font-size: 0.75rem; cursor: default;">premium</span>
                        <span class="pill" style="padding: 5px 10px; font-size: 0.75rem; cursor: default;">sifatli</span>
                        <span class="pill" style="padding: 5px 10px; font-size: 0.75rem; cursor: default;">arzon</span>
                        <span class="pill" style="padding: 5px 10px; font-size: 0.75rem; cursor: default;">yangi</span>
                        <span class="pill" style="padding: 5px 10px; font-size: 0.75rem; cursor: default;">kafolatli</span>
                        <span class="pill" style="padding: 5px 10px; font-size: 0.75rem; cursor: default;">tez yetkazish</span>
                    </div>
                </div>
            </div>
        `;
    }, 2000);
}

function updateOverlays() {
    const container = document.getElementById('infographic-overlays');
    if (!container || !uploadedImage) return;

    let html = '';

    if (document.getElementById('toggle-delivery')?.checked) {
        html += '<div class="overlay-badge"><i data-lucide="truck"></i> 1-3 kun yetkazish</div>';
    }
    if (document.getElementById('toggle-warranty')?.checked) {
        html += '<div class="overlay-badge"><i data-lucide="shield"></i> 12 oy kafolat</div>';
    }
    if (document.getElementById('toggle-free-delivery')?.checked) {
        html += '<div class="overlay-badge" style="background: rgba(16, 185, 129, 0.85);"><i data-lucide="gift"></i> Bepul yetkazish</div>';
    }
    if (document.getElementById('toggle-rating')?.checked) {
        html += '<div class="overlay-badge" style="background: rgba(255, 107, 0, 0.85);"><i data-lucide="star"></i> ★ 4.8</div>';
    }

    container.innerHTML = html;
    lucide.createIcons();
}

// ============================================
// MARKET INTELLIGENCE
// ============================================
const nicheData = [
    { name: 'Smart soatlar aksessuarlari', demand: 'Yuqori', competition: 'Past', score: 94 },
    { name: 'Uy uchun LED yoritgichlar', demand: 'Yuqori', competition: 'Past', score: 91 },
    { name: 'Bolalar o\'quv o\'yinchoqlari', demand: 'Yuqori', competition: 'O\'rta', score: 87 },
    { name: 'Organik tabiiy kosmetika', demand: 'Yuqori', competition: 'O\'rta', score: 83 },
    { name: 'Sport uchun aksessuarlar', demand: 'O\'rta', competition: 'Past', score: 79 },
    { name: 'Oshxona jihozlari', demand: 'Yuqori', competition: 'O\'rta', score: 76 },
    { name: 'Avtomobil aksessuarlari', demand: 'O\'rta', competition: 'Past', score: 72 },
    { name: 'Quloqchinlar va audio', demand: 'O\'rta', competition: 'O\'rta', score: 68 },
];

const categoryTrends = [
    { name: 'Elektronika', value: 92, color: '#7B2FBE' },
    { name: 'Kiyim-kechak', value: 85, color: '#A855F7' },
    { name: 'Uy-ro\'zg\'or', value: 78, color: '#FF6B00' },
    { name: 'Go\'zallik', value: 74, color: '#EC4899' },
    { name: 'Bolalar', value: 70, color: '#3B82F6' },
    { name: 'Sport', value: 65, color: '#10B981' },
    { name: 'Oziq-ovqat', value: 58, color: '#F59E0B' },
    { name: 'Kitoblar', value: 42, color: '#6B7280' },
];

const competitors = [
    { name: 'TechStore UZ', category: 'Elektronika', products: 340, rating: 4.7, avatar: '#7B2FBE' },
    { name: 'FashionHub', category: 'Kiyim-kechak', products: 520, rating: 4.5, avatar: '#EC4899' },
    { name: 'HomeComfort', category: 'Uy-ro\'zg\'or', products: 180, rating: 4.8, avatar: '#FF6B00' },
    { name: 'BeautyLab', category: 'Go\'zallik', products: 290, rating: 4.6, avatar: '#10B981' },
    { name: 'KidZone', category: 'Bolalar', products: 410, rating: 4.4, avatar: '#3B82F6' },
    { name: 'SportMax', category: 'Sport', products: 150, rating: 4.3, avatar: '#F59E0B' },
];

function initAnalytics() {
    renderNiches();
    renderCategoryChart();
    renderCompetitors();
}

function renderNiches() {
    const container = document.getElementById('niche-list');
    if (!container) return;

    container.innerHTML = nicheData.map((niche, i) => `
        <div class="niche-item" style="animation: fadeInUp 0.4s ease ${i * 0.05}s both;">
            <div class="niche-info">
                <div class="niche-rank">${i + 1}</div>
                <div>
                    <div class="niche-name">${niche.name}</div>
                    <div class="niche-meta">Talab: ${niche.demand} / Raqobat: ${niche.competition}</div>
                </div>
            </div>
            <span class="niche-score ${niche.score >= 80 ? 'score-high' : 'score-medium'}">${niche.score}%</span>
        </div>
    `).join('');
}

function renderCategoryChart() {
    const container = document.getElementById('category-chart');
    if (!container) return;

    container.innerHTML = categoryTrends.map((cat, i) => `
        <div class="bar-item" style="animation: fadeInUp 0.4s ease ${i * 0.05}s both;">
            <div class="bar-label">${cat.name}</div>
            <div class="bar-track">
                <div class="bar-fill" id="bar-${i}" style="background: ${cat.color};"></div>
            </div>
            <div class="bar-value">${cat.value}%</div>
        </div>
    `).join('');
}

function renderCompetitors() {
    const container = document.getElementById('competitor-grid');
    if (!container) return;

    container.innerHTML = competitors.map((comp, i) => `
        <div class="competitor-card" style="animation: fadeInUp 0.4s ease ${i * 0.05}s both;">
            <div class="competitor-header">
                <div class="competitor-avatar" style="background: ${comp.avatar};">
                    ${comp.name.charAt(0)}
                </div>
                <div>
                    <div class="competitor-name">${comp.name}</div>
                    <div class="competitor-sub">${comp.category}</div>
                </div>
            </div>
            <div class="competitor-stats">
                <div>
                    <div class="comp-stat-label">Mahsulotlar</div>
                    <div class="comp-stat-value">${comp.products}</div>
                </div>
                <div>
                    <div class="comp-stat-label">Reyting</div>
                    <div class="comp-stat-value">★ ${comp.rating}</div>
                </div>
            </div>
        </div>
    `).join('');
}

function animateCharts() {
    setTimeout(() => {
        categoryTrends.forEach((cat, i) => {
            const bar = document.getElementById(`bar-${i}`);
            if (bar) {
                setTimeout(() => {
                    bar.style.width = `${cat.value}%`;
                }, i * 100);
            }
        });
    }, 300);
}

function refreshAnalytics() {
    // Add subtle refresh animation
    const items = document.querySelectorAll('.niche-item, .competitor-card');
    items.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(10px)';
    });

    setTimeout(() => {
        items.forEach((item, i) => {
            setTimeout(() => {
                item.style.transition = 'all 0.4s ease';
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }, i * 50);
        });
    }, 300);
}

// ============================================
// FBS / FBO OPERATIONS
// ============================================
let orderIdCounter = 20;

const orders = {
    new: [
        { id: 'UZ-001', title: 'Bluetooth quloqchin TWS', price: 189000, date: '2026-03-19' },
        { id: 'UZ-002', title: 'Smart soat M7 Pro', price: 340000, date: '2026-03-19' },
        { id: 'UZ-003', title: 'Telefon uchun chexol', price: 45000, date: '2026-03-18' },
        { id: 'UZ-004', title: 'USB-C kabel (2m)', price: 28000, date: '2026-03-18' },
        { id: 'UZ-005', title: 'LED stol chiroq', price: 125000, date: '2026-03-17' },
    ],
    assembly: [
        { id: 'UZ-006', title: 'Powerbank 20000mAh', price: 210000, date: '2026-03-17' },
        { id: 'UZ-007', title: 'Simsiz zaryadka', price: 85000, date: '2026-03-16' },
        { id: 'UZ-008', title: 'Bluetooth dinamik', price: 165000, date: '2026-03-16' },
    ],
    delivering: [
        { id: 'UZ-009', title: 'Laptop sumkasi', price: 95000, date: '2026-03-15' },
        { id: 'UZ-010', title: 'Klaviatura mekhanik', price: 280000, date: '2026-03-15' },
        { id: 'UZ-011', title: 'Sichqoncha gaming', price: 120000, date: '2026-03-14' },
        { id: 'UZ-012', title: 'Monitor LED 24"', price: 1500000, date: '2026-03-14' },
    ],
    delivered: [
        { id: 'UZ-013', title: 'USB Flash 64GB', price: 55000, date: '2026-03-13' },
        { id: 'UZ-014', title: 'Kamera web HD', price: 190000, date: '2026-03-12' },
        { id: 'UZ-015', title: 'Quloqchin shnurli', price: 35000, date: '2026-03-12' },
        { id: 'UZ-016', title: 'Smartfon qoplamasi', price: 22000, date: '2026-03-11' },
        { id: 'UZ-017', title: 'Power strip 5 porta', price: 48000, date: '2026-03-11' },
        { id: 'UZ-018', title: 'HDMI kabel 3m', price: 32000, date: '2026-03-10' },
        { id: 'UZ-019', title: 'Wi-Fi router', price: 245000, date: '2026-03-10' },
        { id: 'UZ-020', title: 'SSD 256GB', price: 320000, date: '2026-03-09' },
    ]
};

function initFBS() {
    renderKanban();
}

function renderKanban() {
    const statuses = ['new', 'assembly', 'delivering', 'delivered'];
    const nextStatus = { new: 'assembly', assembly: 'delivering', delivering: 'delivered', delivered: null };
    const nextLabel = { new: 'Yig\'ishga o\'tkazish', assembly: 'Yetkazishga berish', delivering: 'Yetkazildi deb belgilash' };

    statuses.forEach(status => {
        const container = document.getElementById(`kanban-${status}`);
        if (!container) return;

        container.innerHTML = orders[status].map((order, i) => `
            <div class="kanban-card" style="animation: fadeInUp 0.3s ease ${i * 0.05}s both;">
                <div class="kanban-card-id">#${order.id}</div>
                <div class="kanban-card-title">${order.title}</div>
                <div class="kanban-card-footer">
                    <span class="kanban-card-price">${formatNumber(order.price)} so'm</span>
                    <span class="kanban-card-date">${order.date}</span>
                </div>
                ${nextStatus[status] ? `
                    <button class="kanban-card-action" onclick="moveOrder('${status}', '${order.id}')">
                        <i data-lucide="arrow-right"></i> ${nextLabel[status]}
                    </button>
                ` : ''}
            </div>
        `).join('');
    });

    updateFBSCounts();
    lucide.createIcons();
}

function moveOrder(fromStatus, orderId) {
    const nextStatus = { new: 'assembly', assembly: 'delivering', delivering: 'delivered' };
    const toStatus = nextStatus[fromStatus];
    if (!toStatus) return;

    const orderIndex = orders[fromStatus].findIndex(o => o.id === orderId);
    if (orderIndex === -1) return;

    const [order] = orders[fromStatus].splice(orderIndex, 1);
    orders[toStatus].unshift(order);

    renderKanban();
}

function addNewOrder() {
    orderIdCounter++;
    const productNames = [
        'Bluetooth quloqchin', 'Smart soat', 'Telefon chexol', 'USB kabel',
        'LED chiroq', 'Powerbank', 'Zaryadka', 'Dinamik', 'Sumka', 'Klaviatura'
    ];

    const newOrder = {
        id: `UZ-${String(orderIdCounter).padStart(3, '0')}`,
        title: productNames[Math.floor(Math.random() * productNames.length)],
        price: Math.floor(Math.random() * 400000) + 20000,
        date: '2026-03-19'
    };

    orders.new.unshift(newOrder);
    renderKanban();
}

function updateFBSCounts() {
    const statuses = ['new', 'assembly', 'delivering', 'delivered'];
    statuses.forEach(status => {
        const count = orders[status].length;
        const fbsStat = document.getElementById(`fbs-${status}-count`);
        const kanbanCount = document.getElementById(`kanban-${status}-count`);
        if (fbsStat) fbsStat.textContent = count;
        if (kanbanCount) kanbanCount.textContent = count;
    });
}

// ============================================
// AI SUPPORT CHAT
// ============================================
const aiResponses = [
    "Tushundim! Sizning savolingiz bo'yicha ma'lumot beraman.",
    "Uzum Market'da muvaffaqiyatli sotish uchun mahsulot rasmlariga e'tibor bering. Birinchi rasm — eng muhimi!",
    "Unit Economics — bu har bir mahsulot uchun real foydani hisoblash. Kalkulyator bo'limiga o'ting!",
    "FBS modelida buyurtmani 24 soat ichida yig'ish kerak. Kechikish 500 so'm jarima!",
    "SEO sarlavhada eng muhim kalit so'zlarni boshida yozing. Masalan: 'Premium Bluetooth quloqchin TWS'",
    "Kam raqobatli nishalarni topish uchun 'Bozor Tahlili' bo'limiga o'ting. AI sizga eng yaxshi imkoniyatlarni ko'rsatadi.",
    "Logistika narxlari: MGT (shahar ichida) — 2000-6000 so'm, viloyatlararo — 8000 so'm, yagona — 20000 so'm.",
    "Mahsulot rasmida matn, logotip yoki vodyanoy belgi qo'yish mumkin emas — Uzum qoidasi!",
    "Marja 20% dan past bo'lsa — narxni oshirish yoki tannarxni kamaytirish kerak.",
    "Raqobatchilarni tahlil qilish uchun ularning eng ko'p sotiladigan mahsulotlariga e'tibor bering.",
];

function initChat() {
    const input = document.getElementById('chat-input');
    if (input) {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendChatMessage();
        });
    }
}

function sendChatMessage() {
    const input = document.getElementById('chat-input');
    const messages = document.getElementById('chat-messages');
    if (!input || !messages) return;

    const text = input.value.trim();
    if (!text) return;

    // Add user message
    appendChatBubble(text, 'outgoing');
    input.value = '';

    // Show typing indicator
    const typingId = 'typing-' + Date.now();
    messages.innerHTML += `
        <div class="chat-bubble incoming typing" id="${typingId}">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        </div>
    `;
    messages.scrollTop = messages.scrollHeight;

    // Simulate AI response
    setTimeout(() => {
        const typingEl = document.getElementById(typingId);
        if (typingEl) typingEl.remove();

        const response = aiResponses[Math.floor(Math.random() * aiResponses.length)];
        appendChatBubble(response, 'incoming');
    }, 1200 + Math.random() * 800);
}

function appendChatBubble(text, type) {
    const messages = document.getElementById('chat-messages');
    if (!messages) return;

    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${type}`;
    bubble.textContent = text;
    messages.appendChild(bubble);
    messages.scrollTop = messages.scrollHeight;
}

// ============================================
// COUNTER ANIMATION
// ============================================
function initCounters() {
    const counters = document.querySelectorAll('.counter');
    counters.forEach(counter => {
        const target = parseInt(counter.dataset.target) || 0;
        if (target === 0) return;

        let current = 0;
        const increment = target / 60;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            counter.textContent = formatNumber(Math.floor(current));
        }, 25);
    });
}

// ============================================
// UTILITIES
// ============================================
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}
