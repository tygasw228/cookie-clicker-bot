document.addEventListener('DOMContentLoaded', function() {
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');
    const statusEl = document.getElementById('status');
    const autoStart = document.getElementById('autoStart');
    
    // Загружаем настройки
    autoStart.checked = localStorage.getItem('cookieBotAutoStart') === 'true';
    
    // Получаем статус бота
    getBotStatus();
    
    // Обработчики кнопок
    startBtn.addEventListener('click', function() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, {action: 'start'}, function(response) {
                    if (response && response.success) {
                        updateStatus(true);
                    }
                });
            }
        });
    });
    
    stopBtn.addEventListener('click', function() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, {action: 'stop'}, function(response) {
                    if (response && response.success) {
                        updateStatus(false);
                    }
                });
            }
        });
    });
    
    // Сохраняем настройки автозапуска
    autoStart.addEventListener('change', function() {
        localStorage.setItem('cookieBotAutoStart', this.checked);
        
        // Также сообщаем на страницу игры
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: 'setAutoStart',
                    value: this.checked
                });
            }
        });
    });
    
    // Функции
    function getBotStatus() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, {action: 'status'}, function(response) {
                    if (response) {
                        updateStatus(response.running);
                    }
                });
            }
        });
    }
    
    function updateStatus(isRunning) {
        if (isRunning) {
            statusEl.textContent = 'РАБОТАЕТ 🟢';
            statusEl.className = 'status running';
            startBtn.disabled = true;
            stopBtn.disabled = false;
        } else {
            statusEl.textContent = 'ОСТАНОВЛЕН 🔴';
            statusEl.className = 'status stopped';
            startBtn.disabled = false;
            stopBtn.disabled = false;
        }
    }
    
    // Обновляем статус каждые 2 секунды
    setInterval(getBotStatus, 2000);
});