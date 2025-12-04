// Фоновый скрипт, который управляет ботом
let activeTabId = null;
let botRunning = false;

// Запуск бота при установке расширения
chrome.runtime.onInstalled.addListener(() => {
    console.log('Cookie Clicker Bot установлен');
    
    // Сохраняем настройки по умолчанию
    chrome.storage.local.set({
        autoStart: true,
        clickSpeed: 10,
        collectGolden: true,
        autoUpgrade: true
    });
});

// Слушаем сообщения от popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Message in background:', request);
    
    if (request.action === 'startBot') {
        startBot();
        sendResponse({ success: true });
    } else if (request.action === 'stopBot') {
        stopBot();
        sendResponse({ success: true });
    } else if (request.action === 'getStatus') {
        sendResponse({ running: botRunning });
    }
    
    return true;
});

// Запуск бота
async function startBot() {
    if (botRunning) return;
    
    console.log('Запуск бота...');
    botRunning = true;
    
    // Найти или создать вкладку с игрой
    const tabs = await chrome.tabs.query({ url: "https://orteil.dashnet.org/cookieclicker/*" });
    
    if (tabs.length > 0) {
        // Используем существующую вкладку
        activeTabId = tabs[0].id;
        await chrome.tabs.update(activeTabId, { active: true });
    } else {
        // Создаем новую вкладку
        const newTab = await chrome.tabs.create({ 
            url: "https://orteil.dashnet.org/cookieclicker/",
            active: false // Создаем в фоне, не активируем
        });
        activeTabId = newTab.id;
    }
    
    // Ждем загрузки страницы
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Внедряем скрипт бота
    await chrome.scripting.executeScript({
        target: { tabId: activeTabId },
        function: startCookieBot
    });
    
    console.log('Бот запущен в фоновом режиме');
}

// Остановка бота
async function stopBot() {
    if (!botRunning) return;
    
    console.log('Остановка бота...');
    botRunning = false;
    
    if (activeTabId) {
        await chrome.scripting.executeScript({
            target: { tabId: activeTabId },
            function: stopCookieBot
        });
    }
    
    console.log('Бот остановлен');
}

// Функция бота для внедрения в страницу
function startCookieBot() {
    // Удаляем старый бот если есть
    if (window.cookieBot) {
        window.cookieBot.stop();
    }
    
    // Создаем нового бота
    window.cookieBot = {
        running: true,
        intervals: [],
        stats: { clicks: 0, golden: 0 },
        
        start: function() {
            if (this.running) return;
            this.running = true;
            
            console.log('Cookie Bot запущен!');
            
            // Автокликер (очень быстро)
            const clickInterval = setInterval(() => {
                try {
                    if (typeof Game !== 'undefined') {
                        Game.ClickCookie();
                        this.stats.clicks++;
                    }
                } catch(e) {}
            }, 1); // 1ms = 1000 кликов в секунду
            
            this.intervals.push(clickInterval);
            
            // Сбор золотых печений
            const goldenInterval = setInterval(() => {
                try {
                    // Клик по всем золотым печеньям
                    document.querySelectorAll('.shimmer').forEach(el => {
                        el.click();
                        this.stats.golden++;
                    });
                    
                    // Используем Game.shimmers если доступно
                    if (typeof Game !== 'undefined' && Game.shimmers) {
                        Game.shimmers.forEach(shimmer => {
                            shimmer.pop();
                            this.stats.golden++;
                        });
                    }
                } catch(e) {}
            }, 100); // Проверяем каждые 100ms
            
            this.intervals.push(goldenInterval);
            
            // Автопокупка улучшений
            const upgradeInterval = setInterval(() => {
                try {
                    if (typeof Game === 'undefined') return;
                    
                    // Покупаем улучшения
                    for (let id in Game.Upgrades) {
                        let up = Game.Upgrades[id];
                        if (!up.bought && Game.cookies >= up.basePrice) {
                            up.buy();
                        }
                    }
                    
                    // Покупаем здания
                    for (let id in Game.Objects) {
                        let obj = Game.Objects[id];
                        if (Game.cookies >= obj.price) {
                            obj.buy();
                        }
                    }
                } catch(e) {}
            }, 5000); // Каждые 5 секунд
            
            this.intervals.push(upgradeInterval);
        },
        
        stop: function() {
            this.running = false;
            this.intervals.forEach(interval => clearInterval(interval));
            this.intervals = [];
            console.log('Cookie Bot остановлен');
        }
    };
    
    // Запускаем бота
    window.cookieBot.start();
    
    // Скрываем панель управления (чтобы не мешала)
    const panel = document.getElementById('cookieBotPanel');
    if (panel) panel.style.display = 'none';
}

function stopCookieBot() {
    if (window.cookieBot) {
        window.cookieBot.stop();
    }
}

// Автозапуск при старте браузера
chrome.runtime.onStartup.addListener(() => {
    chrome.storage.local.get(['autoStart'], (result) => {
        if (result.autoStart) {
            startBot();
        }
    });
});