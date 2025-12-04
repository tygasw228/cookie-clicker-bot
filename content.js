// ========== COOKIE CLICKER BOT ==========
// Этот скрипт работает на странице игры

console.log('🍪 Cookie Clicker Bot загружен!');

// Глобальный объект бота
window.cookieBot = {
    isRunning: false,
    intervals: [],
    stats: {
        clicks: 0,
        golden: 0,
        upgrades: 0
    },
    
    // Запуск бота
    start: function() {
        if (this.isRunning) return;
        
        console.log('🚀 ЗАПУСКАЕМ БОТА...');
        this.isRunning = true;
        this.updateUI();
        
        // 1. АВТОКЛИКЕР (ОЧЕНЬ БЫСТРО)
        const clickInterval = setInterval(() => {
            try {
                if (typeof Game !== 'undefined') {
                    // Метод 1: Используем Game объект
                    Game.ClickCookie();
                    this.stats.clicks++;
                } else {
                    // Метод 2: Кликаем по элементу
                    const cookie = document.getElementById('bigCookie') || 
                                  document.querySelector('.bigCookie') ||
                                  document.querySelector('#cookie');
                    if (cookie) {
                        cookie.click();
                        this.stats.clicks++;
                    }
                }
            } catch(e) {
                // Игнорируем ошибки
            }
        }, 1); // 1ms = 1000 кликов в секунду!
        
        this.intervals.push(clickInterval);
        
        // 2. СБОР ЗОЛОТЫХ ПЕЧЕНИЙ
        const goldenInterval = setInterval(() => {
            try {
                // Кликаем ВСЕ золотые печенья
                const shimmers = document.querySelectorAll('.shimmer');
                shimmers.forEach(shimmer => {
                    if (shimmer.style.display !== 'none') {
                        shimmer.click();
                        this.stats.golden++;
                    }
                });
                
                // Используем Game.shimmers если доступно
                if (typeof Game !== 'undefined' && Game.shimmers) {
                    Game.shimmers.forEach(shimmer => {
                        if (shimmer.life > 0) {
                            shimmer.pop();
                            this.stats.golden++;
                        }
                    });
                }
            } catch(e) {
                // Игнорируем ошибки
            }
        }, 50); // Проверяем каждые 50ms
        
        this.intervals.push(goldenInterval);
        
        // 3. АВТОПОКУПКА УЛУЧШЕНИЙ И ЗДАНИЙ
        const upgradeInterval = setInterval(() => {
            try {
                if (typeof Game === 'undefined') return;
                
                // Покупаем улучшения
                for (let id in Game.Upgrades) {
                    let upgrade = Game.Upgrades[id];
                    if (!upgrade.bought && Game.cookies >= upgrade.basePrice) {
                        upgrade.buy();
                        this.stats.upgrades++;
                        console.log('Купили улучшение:', upgrade.name);
                    }
                }
                
                // Покупаем самые дешевые здания
                for (let i in Game.Objects) {
                    let building = Game.Objects[i];
                    if (Game.cookies >= building.price * 1.1) { // +10% запас
                        building.buy();
                    }
                }
            } catch(e) {
                // Игнорируем ошибки
            }
        }, 2000); // Проверяем каждые 2 секунды
        
        this.intervals.push(upgradeInterval);
        
        console.log('✅ БОТ ЗАПУЩЕН! Клики: 1000/сек, золотые печенья: 20/сек');
    },
    
    // Остановка бота
    stop: function() {
        if (!this.isRunning) return;
        
        console.log('⏹️ ОСТАНАВЛИВАЕМ БОТА...');
        this.isRunning = false;
        
        // Очищаем все интервалы
        this.intervals.forEach(interval => clearInterval(interval));
        this.intervals = [];
        
        this.updateUI();
        console.log('✅ БОТ ОСТАНОВЛЕН');
    },
    
    // Создание панели управления
    createPanel: function() {
    if (document.getElementById('cookieBotPanel')) return;
    
    const panel = document.createElement('div');
    panel.id = 'cookieBotPanel';
    panel.style.cssText = `
        position: fixed !important;
        top: 20px !important;
        left: 20px !important;
        background: rgba(0,0,0,0.95) !important;
        color: lime !important;
        padding: 15px !important;
        border-radius: 10px !important;
        font-family: 'Courier New', monospace !important;
        z-index: 999999 !important;
        border: 2px solid lime !important;
        min-width: 250px !important;
        font-size: 12px !important;
        box-shadow: 0 0 20px rgba(0,255,0,0.5) !important;
        cursor: move !important;
        user-select: none !important;
        resize: both !important;
        overflow: auto !important;
        max-width: 400px !important;
        max-height: 400px !important;
    `;
    
    panel.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; cursor:move;">
            <div style="font-weight:bold; font-size:14px; color:#fff;">🍪 COOKIE BOT v3</div>
            <div style="display:flex; gap:5px;">
                <button id="minimizePanel" style="background:#ffa500; color:white; border:none; width:20px; height:20px; border-radius:3px; cursor:pointer; font-size:12px;">−</button>
                <button id="closePanel" style="background:#f44336; color:white; border:none; width:20px; height:20px; border-radius:3px; cursor:pointer; font-size:12px;">×</button>
            </div>
        </div>
        <div style="margin-bottom:10px;">
            <div>Статус: <span id="botStatus" style="color:red">СТОП</span></div>
            <div>Кликов: <span id="clickCount">0</span></div>
            <div>Золотых: <span id="goldenCount">0</span></div>
            <div>Улучшений: <span id="upgradeCount">0</span></div>
            <div>Печенек/сек: <span id="cps">0</span></div>
        </div>
        <div style="display:flex; gap:5px; margin-bottom:10px;">
            <button id="botStartBtn" style="flex:1; background:linear-gradient(135deg, #4CAF50, #2E7D32); color:white; border:none; padding:8px; border-radius:5px; cursor:pointer; font-weight:bold;">
                ▶ СТАРТ
            </button>
            <button id="botStopBtn" style="flex:1; background:linear-gradient(135deg, #f44336, #c62828); color:white; border:none; padding:8px; border-radius:5px; cursor:pointer; font-weight:bold;">
                ⏹ СТОП
            </button>
        </div>
        <div style="display:flex; gap:5px;">
            <button id="resetStatsBtn" style="flex:1; background:linear-gradient(135deg, #2196F3, #1565C0); color:white; border:none; padding:5px; border-radius:3px; cursor:pointer; font-size:10px;">
                Сбросить
            </button>
            <button id="hidePanelBtn" style="flex:1; background:linear-gradient(135deg, #9C27B0, #6A1B9A); color:white; border:none; padding:5px; border-radius:3px; cursor:pointer; font-size:10px;">
                Скрыть
            </button>
        </div>
        <div style="margin-top:10px; font-size:9px; color:#888; text-align:center;">
            🖱️ Перетащите заголовок для перемещения | 📐 Растягивайте углы
        </div>
    `;
    
    document.body.appendChild(panel);
    
    // Добавляем обработчики кнопок
    document.getElementById('botStartBtn').addEventListener('click', () => this.start());
    document.getElementById('botStopBtn').addEventListener('click', () => this.stop());
    document.getElementById('resetStatsBtn').addEventListener('click', () => this.resetStats());
    document.getElementById('hidePanelBtn').addEventListener('click', () => panel.style.display = 'none');
    document.getElementById('closePanel').addEventListener('click', () => panel.remove());
    
    // Кнопка сворачивания
    let isMinimized = false;
    const contentDiv = panel.querySelector('div:nth-child(2)');
    const buttonsDiv = panel.querySelector('div:nth-child(3)');
    const extraDiv = panel.querySelector('div:nth-child(4)');
    const footerDiv = panel.querySelector('div:nth-child(5)');
    
    document.getElementById('minimizePanel').addEventListener('click', () => {
        isMinimized = !isMinimized;
        if (isMinimized) {
            contentDiv.style.display = 'none';
            buttonsDiv.style.display = 'none';
            extraDiv.style.display = 'none';
            footerDiv.style.display = 'none';
            panel.style.minWidth = '150px';
            document.getElementById('minimizePanel').textContent = '+';
        } else {
            contentDiv.style.display = 'block';
            buttonsDiv.style.display = 'flex';
            extraDiv.style.display = 'flex';
            footerDiv.style.display = 'block';
            panel.style.minWidth = '250px';
            document.getElementById('minimizePanel').textContent = '−';
        }
    });
    
    // ========== ПЕРЕМЕЩЕНИЕ ПАНЕЛИ ==========
    let isDragging = false;
    let dragOffsetX = 0;
    let dragOffsetY = 0;
    let dragElement = null;
    
    // Функция начала перемещения
    function startDrag(e) {
        // Проверяем, что клик не на кнопке
        if (e.target.tagName === 'BUTTON') return;
        
        isDragging = true;
        dragElement = panel;
        
        // Получаем текущие координаты панели
        const rect = panel.getBoundingClientRect();
        dragOffsetX = e.clientX - rect.left;
        dragOffsetY = e.clientY - rect.top;
        
        // Меняем курсор
        panel.style.cursor = 'grabbing';
        
        // Добавляем эффект при перемещении
        panel.style.boxShadow = '0 0 30px rgba(0,255,0,0.8)';
        panel.style.opacity = '0.9';
        
        e.preventDefault();
    }
    
    // Функция перемещения
    function doDrag(e) {
        if (!isDragging || !dragElement) return;
        
        // Вычисляем новые координаты
        let newX = e.clientX - dragOffsetX;
        let newY = e.clientY - dragOffsetY;
        
        // Ограничиваем перемещение в пределах окна
        const maxX = window.innerWidth - dragElement.offsetWidth;
        const maxY = window.innerHeight - dragElement.offsetHeight;
        
        newX = Math.max(0, Math.min(newX, maxX));
        newY = Math.max(0, Math.min(newY, maxY));
        
        // Применяем новые координаты
        dragElement.style.left = newX + 'px';
        dragElement.style.top = newY + 'px';
        dragElement.style.right = 'auto';
        dragElement.style.bottom = 'auto';
        
        // Показываем координаты при перемещении (опционально)
        dragElement.title = `X: ${Math.round(newX)}px, Y: ${Math.round(newY)}px`;
    }
    
    // Функция завершения перемещения
    function stopDrag() {
        if (!isDragging) return;
        
        isDragging = false;
        dragElement = null;
        
        // Возвращаем обычный вид
        panel.style.cursor = 'move';
        panel.style.boxShadow = '0 0 20px rgba(0,255,0,0.5)';
        panel.style.opacity = '1';
        panel.title = '';
    }
    
    // Вешаем обработчики на заголовок панели
    const header = panel.querySelector('div:first-child');
    header.addEventListener('mousedown', startDrag);
    
    // Также можно перемещать за любую область панели (кроме кнопок)
    panel.addEventListener('mousedown', (e) => {
        // Если клик не на кнопке и не в области изменения размера
        if (e.target.tagName !== 'BUTTON' && !e.target.classList.contains('resize-handle')) {
            startDrag(e);
        }
    });
    
    // Обработчики для всего документа
    document.addEventListener('mousemove', doDrag);
    document.addEventListener('mouseup', stopDrag);
    
    // Для touch-устройств (телефоны/планшеты)
    panel.addEventListener('touchstart', (e) => {
        if (e.target.tagName === 'BUTTON') return;
        const touch = e.touches[0];
        startDrag({
            clientX: touch.clientX,
            clientY: touch.clientY,
            target: e.target,
            preventDefault: () => e.preventDefault()
        });
    });
    
    document.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        const touch = e.touches[0];
        doDrag({
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        e.preventDefault();
    });
    
    document.addEventListener('touchend', stopDrag);
    
    // ========== ИЗМЕНЕНИЕ РАЗМЕРА ==========
    let isResizing = false;
    let startWidth, startHeight, startX, startY;
    
    // Создаем элементы для изменения размера
    const resizeHandles = [];
    const handlePositions = ['nw', 'ne', 'sw', 'se'];
    
    handlePositions.forEach(pos => {
        const handle = document.createElement('div');
        handle.className = 'resize-handle';
        handle.style.cssText = `
            position: absolute;
            width: 10px;
            height: 10px;
            background: lime;
            ${pos.includes('n') ? 'top: -5px;' : 'bottom: -5px;'}
            ${pos.includes('w') ? 'left: -5px;' : 'right: -5px;'}
            cursor: ${pos}-resize;
            border-radius: 50%;
            opacity: 0.7;
            z-index: 1000000;
        `;
        
        handle.addEventListener('mousedown', (e) => {
            isResizing = true;
            startWidth = panel.offsetWidth;
            startHeight = panel.offsetHeight;
            startX = e.clientX;
            startY = e.clientY;
            e.stopPropagation();
        });
        
        panel.appendChild(handle);
        resizeHandles.push(handle);
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;
        
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        
        // Вычисляем новый размер с ограничениями
        let newWidth = Math.max(200, Math.min(600, startWidth + deltaX));
        let newHeight = Math.max(150, Math.min(500, startHeight + deltaY));
        
        panel.style.width = newWidth + 'px';
        panel.style.height = 'auto'; // Автовысота по содержимому
    });
    
    document.addEventListener('mouseup', () => {
        isResizing = false;
    });
    
    // ========== ДОПОЛНИТЕЛЬНЫЕ ФУНКЦИИ ==========
    
    // Сохранение позиции при перезагрузке
    function savePosition() {
        localStorage.setItem('cookieBotPanelPosition', JSON.stringify({
            x: parseInt(panel.style.left),
            y: parseInt(panel.style.top),
            width: panel.offsetWidth,
            minimized: isMinimized
        }));
    }
    
    // Загрузка сохраненной позиции
    function loadPosition() {
        const saved = localStorage.getItem('cookieBotPanelPosition');
        if (saved) {
            try {
                const pos = JSON.parse(saved);
                if (pos.x && pos.y) {
                    panel.style.left = pos.x + 'px';
                    panel.style.top = pos.y + 'px';
                }
                if (pos.width) {
                    panel.style.width = pos.width + 'px';
                }
                if (pos.minimized) {
                    document.getElementById('minimizePanel').click();
                }
            } catch(e) {
                console.log('Не удалось загрузить позицию панели');
            }
        }
    }
    
    // Загружаем сохраненную позицию
    setTimeout(loadPosition, 100);
    
    // Сохраняем позицию при изменении
    panel.addEventListener('mouseup', savePosition);
    window.addEventListener('beforeunload', savePosition);
    
    // Обновляем статистику каждую секунду
    setInterval(() => this.updatePanel(), 1000);
    
    // Добавляем функцию сброса статистики
    this.resetStats = function() {
        this.stats.clicks = 0;
        this.stats.golden = 0;
        this.stats.upgrades = 0;
        this.updatePanel();
        console.log('Статистика сброшена!');
    };
},
    
    // Обновление панели
    updatePanel: function() {
        if (!document.getElementById('cookieBotPanel')) return;
        
        // Статус
        const statusEl = document.getElementById('botStatus');
        if (statusEl) {
            statusEl.textContent = this.isRunning ? 'РАБОТАЕТ 🟢' : 'СТОП 🔴';
            statusEl.style.color = this.isRunning ? 'lime' : 'red';
        }
        
        // Статистика
        document.getElementById('clickCount').textContent = this.stats.clicks.toLocaleString();
        document.getElementById('goldenCount').textContent = this.stats.golden;
        document.getElementById('upgradeCount').textContent = this.stats.upgrades;
        
        // CPS (Cookies per second) если Game доступен
        if (typeof Game !== 'undefined') {
            document.getElementById('cps').textContent = Math.round(Game.cookiesPs).toLocaleString();
        }
    },
    
    // Обновление UI
    updateUI: function() {
        this.updatePanel();
    }
};

// ========== ЗАПУСК ==========

// Ждем загрузки страницы
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

function init() {
    console.log('🎮 Страница игры загружена!');
    console.log('Game объект:', typeof Game !== 'undefined' ? 'ДОСТУПЕН' : 'НЕ ДОСТУПЕН');
    
    // Создаем панель управления
    setTimeout(() => {
        window.cookieBot.createPanel();
        console.log('🎯 Панель управления создана!');
        
        // Автозапуск если сохранено в localStorage
        if (localStorage.getItem('cookieBotAutoStart') === 'true') {
            setTimeout(() => {
                window.cookieBot.start();
                console.log('🚀 АВТОСТАРТ ВЫПОЛНЕН!');
            }, 2000);
        }
    }, 1000);
    
    // Слушаем сообщения от popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        console.log('📩 Сообщение от popup:', request);
        
        if (request.action === 'start') {
            window.cookieBot.start();
            sendResponse({ success: true });
        } else if (request.action === 'stop') {
            window.cookieBot.stop();
            sendResponse({ success: true });
        } else if (request.action === 'status') {
            sendResponse({ running: window.cookieBot.isRunning });
        }
        
        return true;
    });
}

console.log('✅ Бот готов к работе!');