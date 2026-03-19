/**
 * SellUp AI — Main Application Logic
 * Modules: Komissiya Kalkulyatori, Unit Iqtisodiyoti, AI Studio, Market Intelligence, FBS/FBO, Chat, CMD+K
 * 
 * Rasmiy ma'lumotlar manbalari:
 * - Logistika sbori: 06.10.2025 dan - KGT: 5000, O'GT: 8000, YGT: 20000
 * - Komissiya: Uzum Market rasmiy spreadsheet (kategoriya bo'yicha 5%-30%)
 * - FBS qoidalari: seller.uzum.uz/manual/
 * - Rasm talablari: seller.uzum.uz/manual/5.product-creation/
 */

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    initNavigation();
    initCommandBar();
    initKommissiyaCalc();
    initUnitEconomics();
    initStudio();
    initAnalytics();
    initPromo();
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

    pages.forEach(p => p.classList.remove('active'));

    const target = document.getElementById(`page-${pageId}`);
    if (target) {
        target.classList.add('active');
        currentPage = pageId;

        window.scrollTo({ top: 0, behavior: 'smooth' });

        dockItems.forEach(d => {
            d.classList.toggle('active', d.dataset.page === pageId);
        });

        setTimeout(() => lucide.createIcons(), 50);

        if (pageId === 'kommissiya') calculateKommissiya();
        if (pageId === 'unit') calculateUnitEconomics();
        if (pageId === 'analytics') { animateCharts(); renderSalesFunnel(); }
        if (pageId === 'promo') renderPromo();
        if (pageId === 'fbs') { renderKanban(); updateSellerRating(); }

        initCounters();
    }

    closeCommandBar();
}

function initNavigation() {
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
    { name: 'Komissiya Kalkulyatori', icon: 'calculator', action: () => navigateTo('kommissiya'), shortcut: '2' },
    { name: 'Unit Iqtisodiyoti', icon: 'trending-up', action: () => navigateTo('unit'), shortcut: '3' },
    { name: 'AI Kontent Studio', icon: 'sparkles', action: () => navigateTo('studio'), shortcut: '4' },
    { name: 'Bozor Tahlili', icon: 'bar-chart-3', action: () => navigateTo('analytics'), shortcut: '5' },
    { name: 'Aktsiya & Promokodlar', icon: 'megaphone', action: () => navigateTo('promo'), shortcut: '6' },
    { name: 'FBS / FBO Boshqaruv', icon: 'package', action: () => navigateTo('fbs'), shortcut: '7' },
    { name: 'AI Yordamchi', icon: 'message-circle', action: () => navigateTo('support'), shortcut: '8' },
    { name: 'Yangi buyurtma qo\'shish', icon: 'plus-circle', action: () => { navigateTo('fbs'); setTimeout(addNewOrder, 500); } },
    { name: 'Foydani hisoblash', icon: 'wallet', action: () => navigateTo('unit') },
    { name: 'Komissiya hisoblash', icon: 'percent', action: () => navigateTo('kommissiya') },
    { name: 'Rasm yuklash', icon: 'upload', action: () => navigateTo('studio') },
    { name: 'Promokod yaratish', icon: 'tag', action: () => { navigateTo('promo'); setTimeout(createPromoCode, 500); } },
];

let highlightedIndex = 0;

function initCommandBar() {
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            toggleCommandBar();
        }
        if (e.key === 'Escape') {
            closeCommandBar();
        }
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

    const cmdInput = document.getElementById('cmd-input');
    if (cmdInput) {
        cmdInput.addEventListener('input', (e) => {
            filterCommands(e.target.value);
        });
    }

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
// KOMISSIYA KALKULYATORI (Alohida bo'lim)
// Rasmiy Uzum Market ma'lumotlari
// Logistika: KGT=5000, O'GT=8000, YGT=20000 (06.10.2025 dan)
// ============================================
function initKommissiyaCalc() {
    const priceInput = document.getElementById('komm-price');
    const priceRange = document.getElementById('komm-price-range');

    if (priceInput && priceRange) {
        priceInput.addEventListener('input', () => {
            priceRange.value = priceInput.value;
            calculateKommissiya();
        });
        priceRange.addEventListener('input', () => {
            priceInput.value = priceRange.value;
            calculateKommissiya();
        });
    }

    const categorySelect = document.getElementById('komm-category');
    if (categorySelect) {
        categorySelect.addEventListener('change', calculateKommissiya);
    }

    const quantityInput = document.getElementById('komm-quantity');
    if (quantityInput) {
        quantityInput.addEventListener('input', calculateKommissiya);
    }

    // Logistics radio cards for Kommissiya
    document.querySelectorAll('.radio-card[data-logistics]').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.radio-card[data-logistics]').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            card.querySelector('input').checked = true;
            calculateKommissiya();
        });
    });
}

function calculateKommissiya() {
    const price = parseFloat(document.getElementById('komm-price')?.value) || 0;
    const commissionRate = parseFloat(document.getElementById('komm-category')?.value) || 12;
    const quantity = parseInt(document.getElementById('komm-quantity')?.value) || 1;

    // Get logistics cost from radio
    const logisticsCost = parseFloat(document.querySelector('input[name="komm-logistics"]:checked')?.value) || 5000;

    // Calculate
    const commission = price * (commissionRate / 100);
    const totalFee = commission + logisticsCost;
    const netToSeller = price - totalFee;
    const totalQty = netToSeller * quantity;

    // Update UI
    const totalFeeEl = document.getElementById('komm-total-fee');
    if (totalFeeEl) {
        totalFeeEl.textContent = formatNumber(Math.round(totalFee));
        totalFeeEl.style.color = totalFee > 0 ? '#FF6B6B' : 'white';
    }

    const commissionEl = document.getElementById('komm-commission');
    if (commissionEl) commissionEl.textContent = formatNumber(Math.round(commission)) + ' so\'m';

    const logisticsEl = document.getElementById('komm-logistics');
    if (logisticsEl) logisticsEl.textContent = formatNumber(logisticsCost) + ' so\'m';

    const netEl = document.getElementById('komm-net');
    if (netEl) {
        netEl.textContent = formatNumber(Math.round(netToSeller)) + ' so\'m';
        netEl.style.color = netToSeller >= 0 ? '#10B981' : '#EF4444';
    }

    const totalQtyEl = document.getElementById('komm-total-qty');
    if (totalQtyEl) totalQtyEl.textContent = formatNumber(Math.round(totalQty)) + ' so\'m';
}

// ============================================
// UNIT IQTISODIYOTI (Alohida bo'lim)
// To'liq foyda-zarar hisob-kitobi
// ============================================
function initUnitEconomics() {
    const priceInput = document.getElementById('unit-price');
    const priceRange = document.getElementById('unit-price-range');
    const costInput = document.getElementById('unit-cost');
    const costRange = document.getElementById('unit-cost-range');

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

    const categorySelect = document.getElementById('unit-category');
    if (categorySelect) {
        categorySelect.addEventListener('change', calculateUnitEconomics);
    }

    const quantityInput = document.getElementById('unit-quantity');
    if (quantityInput) {
        quantityInput.addEventListener('input', calculateUnitEconomics);
    }

    // Logistics radio cards for Unit Economics
    document.querySelectorAll('.radio-card[data-unit-logistics]').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.radio-card[data-unit-logistics]').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            card.querySelector('input').checked = true;
            calculateUnitEconomics();
        });
    });
}

function calculateUnitEconomics() {
    const price = parseFloat(document.getElementById('unit-price')?.value) || 0;
    const cost = parseFloat(document.getElementById('unit-cost')?.value) || 0;
    const commissionRate = parseFloat(document.getElementById('unit-category')?.value) || 12;
    const quantity = parseInt(document.getElementById('unit-quantity')?.value) || 1;

    // Rasmiy logistika narxlari (06.10.2025 dan)
    const logisticsCost = parseFloat(document.querySelector('input[name="unit-logistics"]:checked')?.value) || 5000;

    // Hisoblash
    const commission = price * (commissionRate / 100);
    const totalExpenses = cost + commission + logisticsCost;
    const profit = price - totalExpenses;
    const margin = price > 0 ? (profit / price) * 100 : 0;
    const monthlyProfit = profit * quantity;

    // Zarar chegarasi — minimal sotuv narxi (foyda = 0 bo'ladigan nuqta)
    // narx = tannarx + komissiya(narx) + logistika
    // narx = cost + (narx * rate/100) + logistika
    // narx - narx*rate/100 = cost + logistika
    // narx(1 - rate/100) = cost + logistika
    // narx = (cost + logistika) / (1 - rate/100)
    const breakeven = (cost + logisticsCost) / (1 - commissionRate / 100);

    // UI yangilash
    const profitEl = document.getElementById('unit-profit');
    if (profitEl) {
        profitEl.textContent = formatNumber(Math.round(profit));
        profitEl.style.color = profit >= 0 ? 'white' : '#FF6B6B';
    }

    const marginFill = document.getElementById('unit-margin-fill');
    if (marginFill) {
        marginFill.style.width = `${Math.max(0, Math.min(100, margin))}%`;
        marginFill.style.background = margin >= 20 ? 'linear-gradient(90deg, #10B981, #34D399)' :
                                       margin >= 10 ? 'linear-gradient(90deg, #F59E0B, #FBBF24)' :
                                       'linear-gradient(90deg, #EF4444, #F87171)';
    }

    const marginText = document.getElementById('unit-margin');
    if (marginText) marginText.textContent = margin.toFixed(1);

    const commissionEl = document.getElementById('unit-commission');
    if (commissionEl) commissionEl.textContent = formatNumber(Math.round(commission)) + ' so\'m';

    const logisticsEl = document.getElementById('unit-logistics');
    if (logisticsEl) logisticsEl.textContent = formatNumber(logisticsCost) + ' so\'m';

    const monthlyEl = document.getElementById('unit-monthly');
    if (monthlyEl) {
        monthlyEl.textContent = formatNumber(Math.round(monthlyProfit)) + ' so\'m';
        monthlyEl.style.color = monthlyProfit >= 0 ? '#10B981' : '#EF4444';
    }

    const breakevenEl = document.getElementById('unit-breakeven');
    if (breakevenEl) breakevenEl.textContent = formatNumber(Math.round(breakeven)) + ' so\'m';

    // Donut chart yangilash
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
        const rotation = (offset / 100) * 360 - 90;

        html += `<circle cx="100" cy="100" r="${radius}" fill="none" 
                    stroke="${seg.color}" stroke-width="25" 
                    stroke-dasharray="${dashArray} ${circumference - dashArray}" 
                    transform="rotate(${rotation} 100 100)"
                    style="transition: all 0.6s ease"/>`;
        offset += seg.percent;
    });

    svg.innerHTML = html;

    const centerText = document.getElementById('donut-center-text');
    if (centerText) centerText.textContent = `${Math.max(0, profitPercent).toFixed(0)}%`;

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
// Rasmiy Uzum Market rasm talablari (5.7 bo'lim)
// ============================================
let uploadedImage = null;

function initStudio() {
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-upload');

    if (!uploadArea || !fileInput) return;

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

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) handleImageUpload(file);
    });
}

function handleImageUpload(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        uploadedImage = e.target.result;

        const placeholder = document.getElementById('upload-placeholder');
        const preview = document.getElementById('upload-preview');
        const previewImage = document.getElementById('preview-image');

        if (placeholder) placeholder.classList.add('hidden');
        if (preview) {
            preview.classList.remove('hidden');
            previewImage.src = uploadedImage;
        }

        const seoBtn = document.getElementById('generate-seo-btn');
        if (seoBtn) seoBtn.disabled = false;

        setTimeout(runComplianceCheck, 500);
    };
    reader.readAsDataURL(file);
}

/**
 * Rasmiy Uzum Market rasm/infografika tekshiruvi
 * Manba: seller.uzum.uz/manual/5.product-creation/#_5-7
 * 
 * Qoidalar:
 * 1) Tovar rasmda 50%+ joy egallashi kerak
 * 2) Yuqori aniqlik — loyqa, shovqinli rasmlar taqiqlangan
 * 3) Och, bir xil fon tavsiya etiladi (oshxona/uy foni bo'lmasligi kerak)
 * 4) Begona narsalar, insonlar aks etmasligi kerak
 * 5) Infografikada stop-so'zlar taqiqlangan (#1, Eng yaxshi, Top va h.k.)
 * 6) Matn faqat o'zbek yoki rus tilida
 * 7) AI yaratilgan aldamchi rasmlar taqiqlangan
 */
function runComplianceCheck() {
    const rules = document.querySelectorAll('#compliance-rules .rule-item');
    const statusBadge = document.getElementById('compliance-status');

    // Uzum rasmiy talablari bo'yicha AI simulyatsiyasi
    const results = [
        { pass: true },                    // Tovar 50%+ kadr egallaydi
        { pass: Math.random() > 0.3 },     // Yuqori aniqlik
        { pass: Math.random() > 0.25 },    // Och fon
        { pass: true },                    // Begona narsalar yo'q
        { pass: Math.random() > 0.4 },     // Stop-so'zlar yo'q
        { pass: true },                    // Til — UZ/RU
        { pass: true },                    // AI aldamchi rasm emas
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

            if (i === rules.length - 1) {
                if (passCount === rules.length) {
                    statusBadge.textContent = 'Muvofiq ✓';
                    statusBadge.className = 'status-badge pass';
                } else if (passCount >= 5) {
                    statusBadge.textContent = 'Qisman muvofiq';
                    statusBadge.className = 'status-badge warning';
                } else {
                    statusBadge.textContent = 'Nomuvofiq ✗';
                    statusBadge.className = 'status-badge fail';
                }

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

/**
 * SEO Sarlavha va Tavsif yaratish
 * Uzum qoidalari (5.3 bo'lim):
 * - Sarlavha: Tovar turi + brend + model + xususiyat
 * - Kamida 3 so'z
 * - UZ va RU da to'ldirilishi kerak
 * - Stop-so'zlar taqiqlangan (eng yaxshi, #1, top va h.k.)
 */
function generateSEO() {
    const output = document.getElementById('seo-output');
    if (!output) return;

    output.innerHTML = `
        <div style="text-align: center; padding: 20px;">
            <div class="typing-dot" style="display: inline-block; margin: 0 2px; width: 8px; height: 8px; background: var(--violet-500); border-radius: 50%; animation: typingBounce 1.4s infinite;"></div>
            <div class="typing-dot" style="display: inline-block; margin: 0 2px; width: 8px; height: 8px; background: var(--violet-500); border-radius: 50%; animation: typingBounce 1.4s infinite 0.2s;"></div>
            <div class="typing-dot" style="display: inline-block; margin: 0 2px; width: 8px; height: 8px; background: var(--violet-500); border-radius: 50%; animation: typingBounce 1.4s infinite 0.4s;"></div>
            <p style="margin-top: 10px; color: var(--text-tertiary); font-size: 0.85rem;">AI tahlil qilmoqda...</p>
        </div>
    `;

    setTimeout(() => {
        const titles_uz = [
            "Bluetooth quloqchin simsiz TWS Pro sifatli stereo ovoz",
            "Smartfon uchun himoya qoplamasi shaffof silikon antiudar",
            "LED stol chirog'i o'qish uchun 3 rejimli yorug'lik",
        ];
        const titles_ru = [
            "Bluetooth наушники беспроводные TWS Pro качественный стерео звук",
            "Защитный чехол для смартфона прозрачный силикон противоударный",
            "LED настольная лампа для чтения 3 режима освещения",
        ];
        const descriptions = [
            "Yuqori sifatli materialdan tayyorlangan. O'zbekiston bo'ylab 1-3 kun ichida yetkazish. 30 kunlik qaytarish kafolati. Barcha ranglar va o'lchamlar mavjud.",
            "Premium sifat — har bir buyurtma sinchiklab tekshiriladi. Tez yetkazish xizmati. Arzon narx va ishonchli xizmat. Buyurtma bering!",
            "Original mahsulot, sifatli va bardoshli. Tez yetkazish xizmati mavjud. Barcha savollarga javob beramiz.",
        ];

        const idx = Math.floor(Math.random() * titles_uz.length);

        output.innerHTML = `
            <div class="seo-result">
                <div class="seo-result-block">
                    <label>📝 Sarlavha (O'zbekcha)</label>
                    <p>${titles_uz[idx]}</p>
                </div>
                <div class="seo-result-block">
                    <label>📝 Sarlavha (Ruscha)</label>
                    <p>${titles_ru[idx]}</p>
                </div>
                <div class="seo-result-block">
                    <label>📄 Tavsif (O'zbekcha)</label>
                    <p>${descriptions[idx]}</p>
                </div>
                <div class="seo-result-block">
                    <label>🏷️ Kalit so'zlar</label>
                    <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px;">
                        <span class="pill" style="padding: 5px 10px; font-size: 0.75rem; cursor: default;">sifatli</span>
                        <span class="pill" style="padding: 5px 10px; font-size: 0.75rem; cursor: default;">original</span>
                        <span class="pill" style="padding: 5px 10px; font-size: 0.75rem; cursor: default;">kafolatli</span>
                        <span class="pill" style="padding: 5px 10px; font-size: 0.75rem; cursor: default;">arzon narx</span>
                        <span class="pill" style="padding: 5px 10px; font-size: 0.75rem; cursor: default;">tez yetkazish</span>
                    </div>
                </div>
                <div class="seo-result-block" style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 10px; padding: 12px;">
                    <label style="color: #EF4444;">⚠️ Taqiqlangan so'zlar (Uzum qoidasi 5.1)</label>
                    <p style="font-size: 0.8rem; color: var(--text-tertiary);">Eng yaxshi, #1, Top, Premium sifat, Arzon narx garantiya, Official, Rasmiy diler — bu so'zlarni ISHLATMANG!</p>
                </div>
            </div>
        `;
    }, 2000);
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

// ---- Sales Funnel ----
const funnelData = [
    { stage: 'Ko\'rishlar', value: 12400, color: '#7B2FBE', icon: 'eye' },
    { stage: 'Kartochka ochish', value: 4800, color: '#A855F7', icon: 'mouse-pointer' },
    { stage: 'Savatchaga', value: 1240, color: '#FF6B00', icon: 'shopping-cart' },
    { stage: 'Buyurtma', value: 680, color: '#3B82F6', icon: 'credit-card' },
    { stage: 'Yetkazildi', value: 520, color: '#10B981', icon: 'check-circle' },
];

function renderSalesFunnel() {
    const container = document.getElementById('sales-funnel');
    if (!container) return;

    const maxValue = funnelData[0].value;

    container.innerHTML = funnelData.map((item, i) => {
        const widthPercent = (item.value / maxValue) * 100;
        const conversion = i > 0 ? ((item.value / funnelData[i - 1].value) * 100).toFixed(1) : '100';

        return `
            <div class="funnel-step" style="animation: fadeInUp 0.4s ease ${i * 0.1}s both;">
                <div class="funnel-bar-wrap">
                    <div class="funnel-bar" style="width: 0%; background: ${item.color}; transition: width 0.8s ease ${i * 0.15}s;" data-width="${widthPercent}">
                        <i data-lucide="${item.icon}"></i>
                        <span>${item.stage}</span>
                    </div>
                </div>
                <div class="funnel-meta">
                    <strong>${formatNumber(item.value)}</strong>
                    ${i > 0 ? `<span class="funnel-conv">${conversion}%</span>` : ''}
                </div>
            </div>
        `;
    }).join('');

    lucide.createIcons();

    // Animate bars
    setTimeout(() => {
        document.querySelectorAll('.funnel-bar').forEach(bar => {
            bar.style.width = bar.dataset.width + '%';
        });
    }, 100);
}

function refreshAnalytics() {
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
// Rasmiy qoidalar (seller.uzum.uz/manual/):
// - Buyurtmani 24 soat ichida yig'ish shart
// - Qaytarish muddati: 10 kun (sifatli tovar)
// - Brak olib ketish: 30 kun ichida
// - Taqiqlangan tovar jarimasi: 5 000 000 so'm gacha
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
// Rasmiy Uzum Market ma'lumotlari asosida javoblar
// ============================================
const aiResponses = [
    "Tushundim! Sizning savolingiz bo'yicha ma'lumot beraman.",
    "Uzum Market'da rasm talablari: tovar rasmning 50% dan ko'p joyini egallashi, yuqori aniqlikda bo'lishi va begona narsalar ko'rinmasligi kerak!",
    "Unit Economics — har bir mahsulot uchun real foydani hisoblash. Unit Iqtisodiyoti bo'limiga o'ting!",
    "FBS modelida buyurtmani 24 soat ichida yig'ish kerak. Aks holda buyurtma bekor bo'lishi mumkin!",
    "Sarlavha qoidasi: Tovar turi + Brend + Model + Xususiyat. Masalan: 'Bluetooth quloqchin simsiz TWS Pro sifatli stereo ovoz'",
    "Rasmiy logistika narxlari (06.10.2025 dan): KGT — 5 000, O'GT — 8 000, YGT — 20 000 so'm.",
    "Komissiya kategoriya bo'yicha farqlanadi: Elektronika 10-15%, Kiyim 22%, O'yinchoqlar 30%, Oziq-ovqat 5-20%.",
    "Qaytarish muddati: sifatli tovar — 10 kun, brak tovarni olib ketish — 30 kun ichida.",
    "Infografikada stop-so'zlar taqiqlangan: 'Eng yaxshi', '#1', 'Top', 'Rasmiy diler' — Uzum blokirovka qiladi!",
    "Tovar saqlash: oborachivaemost 60 kundan oshsa — pullik saqlash boshlanadi. Aktsiyaga qo'shing yoki narxni tushiring!",
    "Mahsulot rasmida matn faqat o'zbek yoki rus tilida bo'lishi kerak. Boshqa tillar taqiqlangan!",
    "Kam raqobatli nishalarni topish uchun 'Bozor Tahlili' bo'limiga o'ting. AI sizga eng yaxshi imkoniyatlarni ko'rsatadi.",
    "FBS Reytingi: 80% dan past bo'lsa, xizmat 3 kunga bloklanadi. 90% dan past bo'lsa, Uzum ogohlantirish beradi!",
    "Aktsiya turlari: Timer (chegirma vaqt bilan), Promokod (do'kon kodi), Bust v TOP (reklama).",
    "DBS / EDBS: Ushbu modelda seller tovarlarni o'z kuryerlari yoki Uzum Tezkor orqali yetkazishi mumkin.",
];

function switchFBSTab(tabId) {
    const tabs = document.querySelectorAll('.fbs-tab');
    const contents = document.querySelectorAll('.fbs-tab-content');

    tabs.forEach(t => {
        t.classList.toggle('active', t.dataset.tab === tabId);
    });
    
    contents.forEach(c => {
        c.classList.toggle('active', c.id === `fbs-tab-${tabId}`);
    });

    if (tabId === 'orders') renderKanban();
    setTimeout(() => lucide.createIcons(), 50);
}

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

    appendChatBubble(text, 'outgoing');
    input.value = '';

    const typingId = 'typing-' + Date.now();
    messages.innerHTML += `
        <div class="chat-bubble incoming typing" id="${typingId}">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        </div>
    `;
    messages.scrollTop = messages.scrollHeight;

    // Kontekstli javob berish
    setTimeout(() => {
        const typingEl = document.getElementById(typingId);
        if (typingEl) typingEl.remove();

        let response;
        const lowerText = text.toLowerCase();

        if (lowerText.includes('komissiya') || lowerText.includes('foiz')) {
            response = "Komissiya kategoriya bo'yicha farqlanadi: Elektronika 10-15%, Kiyim 22%, O'yinchoqlar 30%, Oziq-ovqat 5-20%. To'liq hisob uchun Kalkulyator bo'limiga o'ting!";
        } else if (lowerText.includes('logistika') || lowerText.includes('yetkazish')) {
            response = "Rasmiy logistika narxlari (06.10.2025 dan): KGT (kichik) — 5 000, O'GT (o'rta) — 8 000, YGT (yirik) — 20 000 so'm. Qaytarilsa — logistika ham qaytariladi.";
        } else if (lowerText.includes('fbs') || lowerText.includes('buyurtma')) {
            response = "FBS modelida buyurtmani 24 soat ichida yig'ish kerak. Qaytarish muddati: 10 kun. Brak tovarni 30 kun ichida olib ketish shart, aks holda utilizatsiya qilinadi!";
        } else if (lowerText.includes('rasm') || lowerText.includes('foto') || lowerText.includes('surat')) {
            response = "Rasm talablari: tovar 50%+ kadr egallashi, yuqori aniqlik, och fon, begona narsalarsiz. Infografikada stop-so'zlar taqiqlangan. Matn faqat UZ/RU. AI aldamchi rasmlar taqiqlangan!";
        } else if (lowerText.includes('foyda') || lowerText.includes('marja') || lowerText.includes('unit')) {
            response = "Foydani hisoblash uchun Unit Iqtisodiyoti bo'limiga o'ting. Formula: Foyda = Narx - Tannarx - Komissiya - Logistika. Marja 20% dan past bo'lmasin!";
        } else if (lowerText.includes('saqlash') || lowerText.includes('sklad') || lowerText.includes('ombor')) {
            response = "Pulli saqlash qoidasi: oborachivaemost 60 kundan oshsa, saqlash pullik bo'ladi. Yangi SKU uchun — 30 kun bepul (kiyim/poyabzal uchun 60 kun).";
        } else {
            response = aiResponses[Math.floor(Math.random() * aiResponses.length)];
        }

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
// PROMOTIONS MODULE
// Aktsiyalar, Promokodlar, Bust v TOP
// Manba: seller.uzum.uz/manual/10.promotion/
// ============================================
const timerPromos = [
    { id: 1, name: 'Bluetooth quloqchin TWS Pro', oldPrice: 250000, newPrice: 189000, discount: 24, endTime: '2026-03-22T23:59', status: 'active', sold: 47 },
    { id: 2, name: 'Smart soat M7', oldPrice: 420000, newPrice: 340000, discount: 19, endTime: '2026-03-21T18:00', status: 'active', sold: 23 },
    { id: 3, name: 'LED stol chiroq 3 rejimli', oldPrice: 165000, newPrice: 125000, discount: 24, endTime: '2026-03-20T12:00', status: 'ending', sold: 89 },
];

let promoCodes = [
    { code: 'SELLUP10', discount: 10, type: 'percent', minOrder: 50000, used: 34, limit: 100, status: 'active' },
    { code: 'YANGI2026', discount: 15000, type: 'sum', minOrder: 100000, used: 12, limit: 50, status: 'active' },
    { code: 'VIP20', discount: 20, type: 'percent', minOrder: 200000, used: 50, limit: 50, status: 'expired' },
];

const boostCampaigns = [
    { name: 'Quloqchinlar TOP', budget: 500000, spent: 234000, clicks: 1240, orders: 47, cpc: 189, status: 'active' },
    { name: 'Smart soatlar', budget: 300000, spent: 156000, clicks: 780, orders: 28, cpc: 200, status: 'active' },
];

function initPromo() {
    renderPromo();
}

function renderPromo() {
    renderTimerPromos();
    renderPromoCodes();
    renderBoostCampaigns();
}

function renderTimerPromos() {
    const container = document.getElementById('timer-promos');
    if (!container) return;

    container.innerHTML = timerPromos.map((promo, i) => {
        const now = new Date();
        const end = new Date(promo.endTime);
        const diff = end - now;
        const hours = Math.max(0, Math.floor(diff / (1000 * 60 * 60)));
        const mins = Math.max(0, Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)));

        return `
            <div class="promo-card" style="animation: fadeInUp 0.4s ease ${i * 0.1}s both;">
                <div class="promo-card-header">
                    <div>
                        <div class="promo-card-name">${promo.name}</div>
                        <div class="promo-card-prices">
                            <span class="old-price">${formatNumber(promo.oldPrice)} so'm</span>
                            <span class="new-price">${formatNumber(promo.newPrice)} so'm</span>
                            <span class="discount-badge">-${promo.discount}%</span>
                        </div>
                    </div>
                    <div class="promo-timer ${promo.status === 'ending' ? 'timer-ending' : ''}">
                        <i data-lucide="timer"></i>
                        ${hours}s ${mins}d qoldi
                    </div>
                </div>
                <div class="promo-card-stats">
                    <span><i data-lucide="shopping-bag"></i> ${promo.sold} ta sotildi</span>
                    <span class="status-pill ${promo.status}">${promo.status === 'active' ? 'Faol' : 'Tugayapti'}</span>
                </div>
            </div>
        `;
    }).join('');
    lucide.createIcons();
}

function renderPromoCodes() {
    const container = document.getElementById('promo-codes-list');
    if (!container) return;

    container.innerHTML = promoCodes.map((code, i) => `
        <div class="promo-code-card" style="animation: fadeInUp 0.3s ease ${i * 0.08}s both;">
            <div class="promo-code-main">
                <div class="promo-code-tag">${code.code}</div>
                <div class="promo-code-desc">
                    ${code.type === 'percent' ? code.discount + '% chegirma' : formatNumber(code.discount) + ' so\'m chegirma'}
                    · Min: ${formatNumber(code.minOrder)} so'm
                </div>
            </div>
            <div class="promo-code-stats">
                <div class="promo-code-usage">
                    <div class="usage-bar">
                        <div class="usage-fill" style="width: ${(code.used / code.limit) * 100}%;"></div>
                    </div>
                    <span>${code.used}/${code.limit}</span>
                </div>
                <span class="status-pill ${code.status}">${code.status === 'active' ? 'Faol' : 'Tugagan'}</span>
            </div>
        </div>
    `).join('');
}

function createPromoCode() {
    const codes = ['FLASH15', 'SUPER25', 'MEGA30', 'BONUS10', 'SALE20'];
    const newCode = {
        code: codes[Math.floor(Math.random() * codes.length)] + Math.floor(Math.random() * 99),
        discount: [10, 15, 20, 25][Math.floor(Math.random() * 4)],
        type: 'percent',
        minOrder: [50000, 100000, 150000][Math.floor(Math.random() * 3)],
        used: 0,
        limit: [50, 100, 200][Math.floor(Math.random() * 3)],
        status: 'active'
    };
    promoCodes.unshift(newCode);
    renderPromoCodes();
    lucide.createIcons();
}

function renderBoostCampaigns() {
    const container = document.getElementById('boost-campaigns');
    if (!container) return;

    container.innerHTML = boostCampaigns.map((camp, i) => {
        const spentPercent = (camp.spent / camp.budget) * 100;
        const roi = camp.orders > 0 ? ((camp.orders * 150000 - camp.spent) / camp.spent * 100).toFixed(0) : 0;

        return `
            <div class="boost-card" style="animation: fadeInUp 0.4s ease ${i * 0.1}s both;">
                <div class="boost-header">
                    <div>
                        <div class="boost-name">${camp.name}</div>
                        <span class="status-pill active">Faol</span>
                    </div>
                    <div class="boost-roi" style="color: ${roi > 0 ? '#10B981' : '#EF4444'};">
                        ROI: ${roi}%
                    </div>
                </div>
                <div class="boost-stats">
                    <div class="boost-stat">
                        <div class="boost-stat-value">${formatNumber(camp.clicks)}</div>
                        <div class="boost-stat-label">Bosishlar</div>
                    </div>
                    <div class="boost-stat">
                        <div class="boost-stat-value">${camp.orders}</div>
                        <div class="boost-stat-label">Buyurtmalar</div>
                    </div>
                    <div class="boost-stat">
                        <div class="boost-stat-value">${formatNumber(camp.cpc)}</div>
                        <div class="boost-stat-label">CPC (so'm)</div>
                    </div>
                </div>
                <div class="boost-budget">
                    <div class="boost-budget-bar">
                        <div class="boost-budget-fill" style="width: ${spentPercent}%;"></div>
                    </div>
                    <span>${formatNumber(camp.spent)} / ${formatNumber(camp.budget)} so'm</span>
                </div>
            </div>
        `;
    }).join('');
    lucide.createIcons();
}

// ============================================
// FBS SELLER RATING
// Rasmiy formula: 100% - bekor qilingan buyurtmalar (8 kun ichida)
// 90% dan past = ogohlantirish
// 80% dan past + 10 buyurtma = FBS blokirovka (3 kun)
// ============================================
function updateSellerRating() {
    const delivered = orders.delivered.length + orders.delivering.length;
    const total = delivered + orders.new.length + orders.assembly.length;
    const cancelled = 1; // Simulated

    // Rasmiy formula: 100% - (bekor / (jami - yangi - yig'ilmoqda)) * 100
    const rating = total > 0 ? Math.max(0, ((delivered / (delivered + cancelled)) * 100)) : 100;

    const pointer = document.getElementById('rating-pointer');
    const badge = document.getElementById('rating-badge');
    const ratingVal = document.getElementById('rating-value');
    const ratingDel = document.getElementById('rating-delivered');
    const ratingCan = document.getElementById('rating-cancelled');

    if (pointer) {
        pointer.style.left = `${rating}%`;
    }

    if (ratingVal) ratingVal.textContent = rating.toFixed(0) + '%';
    if (ratingDel) ratingDel.textContent = delivered;
    if (ratingCan) ratingCan.textContent = cancelled;

    if (badge) {
        if (rating >= 90) {
            badge.textContent = 'Yaxshi ✓';
            badge.className = 'status-badge pass';
        } else if (rating >= 80) {
            badge.textContent = 'Ogohlantirish ⚠';
            badge.className = 'status-badge warning';
        } else {
            badge.textContent = 'Blokirovka xavfi ✗';
            badge.className = 'status-badge fail';
        }
    }
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
