/**
 * Калькулятор баллов ПГАС ЮРГПУ (НПИ)
 * Только для общественной деятельности
 * На основе Положения о ПГАС (раздел 4.3)
 * Версия: 2.0 (исправленная)
 */

'use strict';

// ===== ДАННЫЕ ИЗ ПОЛОЖЕНИЯ (раздел 4.3) =====

/**
 * Критерий 1: Систематическое участие в проведении (обеспечении проведения)
 * общественно значимой деятельности социального, культурного, правозащитного,
 * общественно полезного характера, организуемой университетом или с его участием
 */
const organizationData = [
    { name: 'Факультетский / институтский', weight: 0.7, id: 'org-faculty' },
    { name: 'Университетский / городской', weight: 1, id: 'org-city' },
    { name: 'Региональный / межрегиональный', weight: 5, id: 'org-region' },
    { name: 'Всероссийский', weight: 7, id: 'org-russia' },
    { name: 'Международный', weight: 8, id: 'org-world' },
];

/**
 * Критерий 2: Участие в проведении мероприятия в качестве волонтёра
 */
const volunteerData = [
    { name: 'Факультетский / институтский', weight: 0.5, id: 'vol-faculty' },
    { name: 'Университетский / городской', weight: 1, id: 'vol-city' },
    { name: 'Региональный / межрегиональный', weight: 1.5, id: 'vol-region' },
    { name: 'Всероссийский', weight: 2, id: 'vol-russia' },
    { name: 'Международный', weight: 2.5, id: 'vol-world' },
];

/**
 * Критерий 3: Участие в мероприятиях в качестве призёра/победителя
 */
const prizeData = [
    { name: 'Факультетский / институтский', weight: 0.5, id: 'prize-faculty' },
    { name: 'Университетский / городской', weight: 1, id: 'prize-city' },
    { name: 'Региональный / межрегиональный', weight: 1.5, id: 'prize-region' },
    { name: 'Всероссийский', weight: 2, id: 'prize-russia' },
    { name: 'Международный', weight: 2.5, id: 'prize-world' },
];

/**
 * Благодарственные письма (п. 1.18 Положения)
 * Грамота за подписью проректора = 500 баллов
 */
const gratitudeData = [
    { 
        name: 'Грамота / благодарственное письмо за подписью проректора', 
        weight: 500, 
        id: 'gratitude-prorector',
        description: 'п. 1.18 Положения о ПГАС'
    },
];

// ===== СОСТОЯНИЕ =====
const state = {};

// Инициализация начального состояния
function initState() {
    const allItems = [...organizationData, ...volunteerData, ...prizeData, ...gratitudeData];
    allItems.forEach(item => {
        if (!(item.id in state)) {
            state[item.id] = 0;
        }
    });
}

// ===== ОТРИСОВКА ИНТЕРФЕЙСА =====

/**
 * Создаёт строку для одного критерия
 */
function createRow(item, containerId, showDescription = false) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const row = document.createElement('div');
    row.className = 'row';
    row.dataset.itemId = item.id;
    
    const descriptionHTML = showDescription && item.description 
        ? `<div class="row-level" style="color: #f0a030;">${item.description}</div>` 
        : '';
    
    row.innerHTML = `
        <div class="row-info">
            <div class="row-name">${item.name}</div>
            <div class="row-level">Вес: ×${item.weight} ${descriptionHTML}</div>
        </div>
        <div class="tapper">
            <button class="tapper-btn tapper-minus" data-id="${item.id}" aria-label="Уменьшить">−</button>
            <input 
                type="number" 
                class="tapper-value" 
                data-id="${item.id}" 
                value="0" 
                min="0" 
                readonly 
                aria-label="Количество"
            >
            <button class="tapper-btn tapper-plus" data-id="${item.id}" aria-label="Увеличить">+</button>
        </div>
        <div class="row-result" data-result="${item.id}">0</div>
    `;
    
    container.appendChild(row);
}

/**
 * Отрисовывает все строки
 */
function renderAllRows() {
    // Очищаем контейнеры
    const containers = ['organization-rows', 'volunteer-rows', 'prize-rows', 'gratitude-rows'];
    containers.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = '';
    });
    
    // Создаём строки
    organizationData.forEach(item => createRow(item, 'organization-rows'));
    volunteerData.forEach(item => createRow(item, 'volunteer-rows'));
    prizeData.forEach(item => createRow(item, 'prize-rows'));
    gratitudeData.forEach(item => createRow(item, 'gratitude-rows', true));
    
    // Восстанавливаем значения из state
    updateAllInputs();
    updateAllResults();
    calculateTotal();
}

// ===== ОБНОВЛЕНИЕ ЗНАЧЕНИЙ =====

/**
 * Обновляет все поля ввода из state
 */
function updateAllInputs() {
    const allItems = [...organizationData, ...volunteerData, ...prizeData, ...gratitudeData];
    allItems.forEach(item => {
        const input = document.querySelector(`.tapper-value[data-id="${item.id}"]`);
        if (input) {
            input.value = state[item.id] || 0;
        }
    });
}

/**
 * Обновляет результат для конкретного ID
 */
function updateRowResult(id) {
    const allItems = [...organizationData, ...volunteerData, ...prizeData, ...gratitudeData];
    const item = allItems.find(i => i.id === id);
    if (!item) return;
    
    const count = state[id] || 0;
    const result = count * item.weight;
    const formattedResult = Number.isInteger(result) ? result : result.toFixed(1);
    
    const resultEl = document.querySelector(`[data-result="${id}"]`);
    if (resultEl) {
        resultEl.textContent = formattedResult;
    }
}

/**
 * Обновляет все результаты
 */
function updateAllResults() {
    const allItems = [...organizationData, ...volunteerData, ...prizeData, ...gratitudeData];
    allItems.forEach(item => updateRowResult(item.id));
}

// ===== РАСЧЁТ ИТОГОВ =====

/**
 * Вычисляет общую сумму баллов
 */
function calculateTotal() {
    const gpa = parseFloat(document.getElementById('gpa').value) || 0;
    const coefficient = (gpa / 5) * 100;
    
    let totalPoints = 0;
    const allItems = [...organizationData, ...volunteerData, ...prizeData, ...gratitudeData];
    
    allItems.forEach(item => {
        totalPoints += (state[item.id] || 0) * item.weight;
    });
    
    const finalScore = totalPoints * coefficient;
    
    // Форматирование
    const formatNum = (num) => Number.isInteger(num) ? num : num.toFixed(1);
    
    // Обновление DOM
    document.getElementById('total-score').textContent = formatNum(finalScore);
    document.getElementById('total-formula').innerHTML = `
        Сумма баллов (${formatNum(totalPoints)}) × Коэфф. успеваемости (${gpa}/5 × 100) = <strong>${formatNum(finalScore)}</strong>
    `;
}

// ===== ВСПЛЫВАЮЩИЕ ПОДСКАЗКИ =====

let tooltipTimeout = null;

/**
 * Показывает подсказку
 */
function showTooltip(event, text) {
    const tooltip = document.getElementById('tooltip');
    const content = document.getElementById('tooltip-content');
    
    if (!tooltip || !content) return;
    
    content.textContent = text;
    tooltip.classList.add('visible');
    
    positionTooltip(event, tooltip);
}

/**
 * Позиционирует подсказку
 */
function positionTooltip(event, tooltip) {
    const target = event.target;
    const rect = target.getBoundingClientRect();
    
    let left = rect.left + rect.width / 2;
    let top = rect.bottom + 8;
    
    // Проверяем, не выходит ли за пределы экрана
    const tooltipRect = tooltip.getBoundingClientRect();
    
    if (left - tooltipRect.width / 2 < 10) {
        left = tooltipRect.width / 2 + 10;
    }
    if (left + tooltipRect.width / 2 > window.innerWidth - 10) {
        left = window.innerWidth - tooltipRect.width / 2 - 10;
    }
    
    // Если не хватает места снизу — показываем сверху
    if (top + tooltipRect.height > window.innerHeight - 10) {
        top = rect.top - tooltipRect.height - 8;
        tooltip.classList.add('bottom');
    } else {
        tooltip.classList.remove('bottom');
    }
    
    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';
    tooltip.style.transform = 'translateX(-50%)';
}

/**
 * Скрывает подсказку
 */
function hideTooltip() {
    const tooltip = document.getElementById('tooltip');
    if (tooltip) {
        tooltip.classList.remove('visible');
    }
}

// Обработчики для подсказок
document.addEventListener('mouseover', (event) => {
    const icon = event.target.closest('.info-icon');
    if (!icon) return;
    
    const tooltipText = icon.dataset.tooltip;
    if (!tooltipText) return;
    
    clearTimeout(tooltipTimeout);
    tooltipTimeout = setTimeout(() => showTooltip(event, tooltipText), 300);
});

document.addEventListener('mouseout', (event) => {
    const icon = event.target.closest('.info-icon');
    if (!icon) return;
    
    clearTimeout(tooltipTimeout);
    hideTooltip();
});

// Для мобильных устройств — показываем по клику
document.addEventListener('click', (event) => {
    const icon = event.target.closest('.info-icon');
    if (!icon) {
        // Клик вне иконки — скрываем подсказку
        hideTooltip();
        return;
    }
    
    const tooltipText = icon.dataset.tooltip;
    if (!tooltipText) return;
    
    const tooltip = document.getElementById('tooltip');
    const isVisible = tooltip.classList.contains('visible');
    
    hideTooltip();
    
    if (!isVisible) {
        showTooltip(event, tooltipText);
    }
    
    event.stopPropagation();
});

// ===== ОБРАБОТЧИКИ КНОПОК +/- =====

/**
 * Обработка кликов по кнопкам +/- (делегирование)
 */
document.addEventListener('click', (event) => {
    const btn = event.target.closest('.tapper-btn');
    if (!btn) return;
    
    // Предотвращаем всплытие, чтобы не скрывать подсказку
    event.stopPropagation();
    
    const id = btn.dataset.id;
    const input = document.querySelector(`.tapper-value[data-id="${id}"]`);
    if (!input) return;
    
    let currentValue = parseInt(input.value) || 0;
    
    if (btn.classList.contains('tapper-plus')) {
        currentValue++;
    } else if (btn.classList.contains('tapper-minus') && currentValue > 0) {
        currentValue--;
    }
    
    state[id] = currentValue;
    input.value = currentValue;
    updateRowResult(id);
    calculateTotal();
});

// ===== ОБРАБОТЧИК GPA =====

document.getElementById('gpa').addEventListener('input', function() {
    let value = parseFloat(this.value);
    
    if (isNaN(value)) {
        value = 0;
    }
    if (value > 5) {
        value = 5;
        this.value = 5;
    }
    if (value < 0) {
        value = 0;
        this.value = 0;
    }
    
    calculateTotal();
});

// ===== ИНИЦИАЛИЗАЦИЯ =====

function init() {
    initState();
    renderAllRows();
    
    // Инициализация VK Mini App
    if (window.vkBridge) {
        window.vkBridge.send('VKWebAppInit')
            .then(() => console.log('✅ VK Mini App initialized'))
            .catch(error => console.error('VK Bridge init error:', error));
    } else {
        console.log('🌐 Running in browser mode');
    }
    
    console.log('📊 Калькулятор ПГАС — Общественная деятельность');
    console.log('⚠️ Баллы предварительные, не являются официальными');
    console.log('📋 Правило: при участии и призёрстве в одном мероприятии — баллы только за место');
    console.log('🏆 Благодарственные письма проректора = 500 баллов (п. 1.18)');
}

// Запуск при загрузке страницы
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
