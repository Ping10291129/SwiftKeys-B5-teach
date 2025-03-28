document.addEventListener('DOMContentLoaded', function () {
    initTabs();
    initDateControls();
    // 默认加载日排行，并确保日期选择器可用
    updateDatePickerState(true);
    const dateSelect = document.getElementById('dateSelect');
    loadRankingData('former', dateSelect.value);
});

function initDateControls() {
    const dateSelect = document.getElementById('dateSelect');
    const todayBtn = document.getElementById('todayBtn');
    
    // 设置日期选择器的最大值为今天
    const today = new Date().toISOString().split('T')[0];
    dateSelect.max = today;
    
    // 初始化为今天的日期
    dateSelect.value = today;
    
    // 日期选择事件
    dateSelect.addEventListener('change', function() {
        loadRankingData('former', this.value);
    });
    
    // 今日按钮点击事件
    todayBtn.addEventListener('click', function() {
        dateSelect.value = today;
        loadRankingData('day');
    });
}

// 更新日期控件状态
function updateDatePickerState(isEnabled) {
    const dateSelect = document.getElementById('dateSelect');
    const todayBtn = document.getElementById('todayBtn');
    
    dateSelect.disabled = !isEnabled;
    todayBtn.disabled = !isEnabled;
    
    // 添加或移除禁用状态的鼠标样式
    dateSelect.style.cursor = isEnabled ? 'pointer' : 'not-allowed';
    todayBtn.style.cursor = isEnabled ? 'pointer' : 'not-allowed';
}
localStorage.setItem('ip', 'http://10.11.126.174:809');

function initTabs() {
    const tabItems = document.querySelectorAll('.tabs__item');
    updateSliderPosition(0);

    // 更新标签的data-period属性
    tabItems[0].setAttribute('data-period', 'former');
    tabItems[1].setAttribute('data-period', 'week');
    tabItems[2].setAttribute('data-period', 'month');

    // 标签切换监听 
    tabItems.forEach((item, index) => {
        item.addEventListener('click', function (e) {
            e.preventDefault();
            tabItems.forEach(i => i.classList.remove('tabs__item--active'));
            this.classList.add('tabs__item--active');
            updateSliderPosition(index);
            
            const period = this.getAttribute('data-period');
            const dateSelect = document.getElementById('dateSelect');
            if (period === 'former') {
                updateDatePickerState(true);
                loadRankingData('former', dateSelect.value);
            } else {
                updateDatePickerState(false);
                loadRankingData(period);
            }
        });
    });
}

function updateSliderPosition(index) {
    document.querySelector('.tabs__slider').style.left = (index * 33.3333) + '%';
}

async function loadRankingData(period, date = '') {
    try {
        // 首先确保表格头的初始化
        const tableHead = document.querySelector(`#score table thead tr`);
        if (tableHead) {
            tableHead.innerHTML = `
                <th class="text-center" style="width: 80px;">排名</th>
                <th style="width: 120px;">姓名</th>
                <th style="width: 80px;">类型</th>
                <th style="width: 140px;">打字速度</th>
                <th style="width: 180px;">总分 (速度×准确率)</th>
            `;
        }

        const data = await fetchRankingData(period, date);
        if (!data || (!data.chinese?.length && !data.english?.length)) {
            const tableBody = document.querySelector(`#score table tbody`);
            if (tableBody) {
                tableBody.innerHTML = `<tr><td colspan="5" class="no-data text-center">暂无数据，请选择其他日期</td></tr>`;
            }
            return;
        }
        updateRankingTable(data);
    } catch (error) {
        console.error('获取排行榜失败:', error);
        const tableBody = document.querySelector(`#score table tbody`);
        if (tableBody) {
            tableBody.innerHTML = `<tr><td colspan="5" class="no-data text-center">数据加载失败</td></tr>`;
        }
        showMessage('error', '获取排行榜数据失败');
    }
}

async function fetchRankingData(period, date = '') {
    const token = localStorage.getItem('token');
    if (!token) {
        showMessage('error', '请先登录');
        return null;
    }

    const baseUrl = localStorage.getItem('ip');
    if (!baseUrl) {
        showMessage('error', '系统配置错误');
        return null;
    }

    let apiEndpoint = '';
    let method = 'GET';
    let body = null;

    // 设置接口路径
    switch (period) {
        case 'week':
            apiEndpoint = `${baseUrl}/ranking/week`;
            break;
        case 'month':
            apiEndpoint = `${baseUrl}/ranking/month`;
            break;
        case 'class':
            apiEndpoint = `${baseUrl}/ranking/calculateAllClassAverages`;
            break;
        case 'former':
            apiEndpoint = `${baseUrl}/ranking/former`;
            method = 'POST';
            const formData = new FormData();
            formData.append('dateTime', date || new Date().toISOString().split('T')[0]);
            body = formData;
            break;
        default:
            apiEndpoint = `${baseUrl}/ranking/today`;
    }

    const requestOptions = {
        method,
        headers: {
            'Authorization': token  // 直接使用token，不加Bearer前缀
        }
    };

    if (method === 'POST' && body) {
        requestOptions.body = body;
    }

    try {
        console.log('Request URL:', apiEndpoint);  // 调试用
        console.log('Request Options:', requestOptions);  // 调试用
        
        const response = await fetch(apiEndpoint, requestOptions);
        const data = await response.json();
        console.log('Response Data:', data);  // 调试用
        
        // 只在状态码不为200时显示错误
        if (data.code !== 200) {
            showMessage('error', data.message || '获取数据失败');
            return null;
        }

        return period === 'class' ? {
            chinese: Array.isArray(data.rowsChineseOne) ? data.rowsChineseOne : [],
            english: Array.isArray(data.rowsEnglishOne) ? data.rowsEnglishOne : []
        } : {
            chinese: Array.isArray(data.chinese_rows) ? data.chinese_rows : [],
            english: Array.isArray(data.english_rows) ? data.english_rows : []
        };
    } catch (error) {
        console.error('Request Error:', error);  // 调试用
        return null;
    }
}

function updateRankingTable(data) {
    const tableBody = document.querySelector(`#score table tbody`);
    if (!tableBody) return;

    if (!data.chinese.length && !data.english.length) {
        tableBody.innerHTML = `<tr><td colspan="5" class="no-data text-center">暂无数据</td></tr>`;
        return;
    }

    // 合并并处理数据
    const allData = [
        ...data.chinese.map(item => ({ ...item, type: 'chinese' })),
        ...data.english.map(item => ({ ...item, type: 'english' }))
    ];

    // 按速度排序
    allData.sort((a, b) => b.speed - a.speed);
    
    // 获取最高分用于计算进度条
    const maxScore = Math.max(...allData.map(item => (item.speed * item.accuracy) / 100));

    // 生成表格头
    const tableHead = document.querySelector(`#score table thead tr`);
    if (tableHead) {
        tableHead.innerHTML = `
            <th class="text-center" style="width: 80px;">排名</th>
            <th style="width: 120px;">姓名</th>
            <th style="width: 80px;">类型</th>
            <th style="width: 140px;">打字速度</th>
            <th style="width: 180px;">总分 (速度×准确率)</th>
        `;
    }

    // 生成表格行
    const rows = allData.map((item, index) => {
        const score = Math.round((item.speed * item.accuracy) / 100);
        const progressPercent = (score / maxScore) * 100;
        
        // 优化进度条颜色逻辑
        let progressClass = 'medium';
        if (progressPercent >= 85) {
            progressClass = 'high';
        } else if (progressPercent < 60) {
            progressClass = 'low';
        }

        return `
            <tr class="rank-row align-items-center">
                <td class="text-center">
                    ${index < 3 ? 
                        `<div class="rank-badge-wrapper">
                            <span class="rank-badge rank-${index + 1}" data-rank="${index + 1}">
                                ${index + 1}
                            </span>
                        </div>` :
                        `<span class="rank-number">${index + 1}</span>`
                    }
                </td>
                <td>
                    <div class="d-flex align-items-center">
                        <div class="h5 mb-0 font-weight-light">${item.name || '-'}</div>
                    </div>
                </td>
                <td>
                    <div class="text-muted">${item.type === 'chinese' ? '中文' : '英文'}</div>
                </td>
                <td>
                    <div class="speed-info">
                        <div class="h5 mb-0 score-value" data-final="${item.speed || 0}">${item.speed || 0}</div>
                        <div class="small text-muted">准确率: ${item.accuracy || 0}%</div>
                    </div>
                </td>
                <td>
                    <div class="score-info">
                        <div class="d-flex justify-content-between align-items-center mb-1">
                            <span class="h5 mb-0 score-value" data-final="${score}">0</span>
                            <small class="text-muted ml-2">分</small>
                        </div>
                        <div class="progress">
                            <div class="progress-bar ${progressClass}" role="progressbar" 
                                data-final-width="${progressPercent}%" 
                                style="width: 0%"
                                aria-valuenow="${score}" 
                                aria-valuemin="0" 
                                aria-valuemax="${maxScore}">
                            </div>
                        </div>
                    </div>
                </td>
            </tr>
        `;
    });

    tableBody.innerHTML = rows.join('');
    
    // 更新时间范围显示
    if (data.weekStart && data.now) {
        const dateRangeEl = document.querySelector('.date-range');
        if (dateRangeEl) {
            dateRangeEl.textContent = `${data.weekStart} 至 ${data.now}`;
        }
    }

    // 添加动画效果
    requestAnimationFrame(() => {
        document.querySelectorAll(`#score .rank-row`).forEach((row, index) => {
            setTimeout(() => {
                row.classList.add('show');
            }, index * 50);
        });
        runAnimations();
    });
}

// 数值动画函数
function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        obj.innerText = value;
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// 运行动画效果
function runAnimations() {
    // 分数数字动画
    document.querySelectorAll('.score-value').forEach(span => {
        const finalValue = parseInt(span.getAttribute('data-final'), 10);
        animateValue(span, 0, finalValue, 800);
    });
    
    // 进度条动画
    document.querySelectorAll('.progress-bar').forEach(bar => {
        const finalWidth = bar.getAttribute('data-final-width');
        setTimeout(() => {
            bar.style.width = finalWidth;
        }, 100);
    });
}

// 消息提示函数
function showMessage(type, message) {
    let messageDiv = document.querySelector('.message-div');
    if (!messageDiv) {
        messageDiv = document.createElement('div');
        messageDiv.className = 'message-div';
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 4px;
            color: white;
            z-index: 9999;
            opacity: 0;
            transition: opacity 0.3s ease-in-out;
        `;
        document.body.appendChild(messageDiv);
    }
    messageDiv.style.backgroundColor = type === 'error' ? '#ff4d4f' : '#52c41a';
    messageDiv.textContent = message;
    messageDiv.style.opacity = '1';
    setTimeout(() => {
        messageDiv.style.opacity = '0';
        setTimeout(() => messageDiv.remove(), 300);
    }, 3000);
}
