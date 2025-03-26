document.addEventListener('DOMContentLoaded', function () {
    initRankingTabs();
    loadRankingData('score', 'day'); // 默认加载日排行
});
localStorage.setItem('ip', 'http://10.11.126.174:809');
function initRankingTabs() {
    const tabItems = document.querySelectorAll('.tabs__item');
    const periodTabs = document.querySelectorAll('.period-tab');
    updateSliderPosition(0);

    // 初始化默认面板
    document.querySelector('#score').classList.add('show', 'active');
    let currentPeriod = 'day';

    // 时间段选择监听
    periodTabs.forEach(tab => {
        tab.addEventListener('click', function (e) {
            e.preventDefault();
            periodTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            currentPeriod = this.getAttribute('data-period');
            const activeTab = document.querySelector('.tabs__item--active');
            loadRankingData(activeTab.getAttribute('data-target'), currentPeriod);
        });
    });

    // 标签切换监听
    tabItems.forEach((item, index) => {
        item.addEventListener('click', function (e) {
            e.preventDefault();
            tabItems.forEach(i => i.classList.remove('tabs__item--active'));
            this.classList.add('tabs__item--active');
            updateSliderPosition(index);

            const targetId = this.getAttribute('data-target');
            document.querySelectorAll('.tab-pane').forEach(pane => {
                pane.classList.remove('show', 'active');
            });

            document.querySelector(`#${targetId}`)?.classList.add('show', 'active');
            loadRankingData(targetId, currentPeriod);
        });
    });
}

function updateSliderPosition(index) {
    document.querySelector('.tabs__slider').style.left = (index * 33.3333) + '%';
}

async function loadRankingData(type, period) {
    try {
        const data = await fetchRankingData(type, period);
        if (!data || (!data.chinese?.length && !data.english?.length)) {
            // 如果数据为空，直接显示暂无数据
            const tableBody = document.querySelector(`#${type} table tbody`);
            if (tableBody) {
                tableBody.innerHTML = `<tr><td colspan="4" class="no-data">暂无数据</td></tr>`;
            }
            return;
        }
        updateRankingTable(type, data);
    } catch (error) {
        console.error('获取排行榜失败:', error);
        const tableBody = document.querySelector(`#${type} table tbody`);
        if (tableBody) {
            tableBody.innerHTML = `<tr><td colspan="4" class="no-data">数据加载失败</td></tr>`;
        }
    }
}

async function fetchRankingData(type, period) {
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
            formData.append('dateTime', new Date().toISOString().split('T')[0]);
            body = formData;
            break;
        default:
            apiEndpoint = `${baseUrl}/ranking/today`;
    }

    const requestOptions = {
        method,
        headers: {
            'Authorization': token,  // 直接使用token，不加Bearer前缀
            'Content-Type': 'application/json'  // 添加内容类型头
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

function updateRankingTable(type, data) {
    const tableBody = document.querySelector(`#${type} table tbody`);
    if (!tableBody) return;

    let rows = [];

    if (type === 'class') {
        if (!data.chinese.length && !data.english.length) {
            tableBody.innerHTML = `<tr><td colspan="4" class="no-data">暂无数据</td></tr>`;
            return;
        }

        rows = data.chinese.map((item, index) => {
            const englishData = data.english[index] || {};
            return `
                <tr class="rank-row">
                    <td><span class="rank-badge ${index < 3 ? 'rank-' + (index + 1) : ''}">${index + 1}</span></td>
                    <td>${item.class}</td>
                    <td>${item.grade}</td>
                    <td>中文：${item.chinese || 0}<br>英文：${englishData.english || 0}</td>
                </tr>
            `;
        });
    } else {
        const rankingData = type === 'chinese' ? data.chinese : data.english;
        if (!rankingData.length) {
            tableBody.innerHTML = `<tr><td colspan="4" class="no-data">暂无数据</td></tr>`;
            return;
        }

        rows = rankingData.map((item, index) => {
            return `
                <tr class="rank-row">
                    <td><span class="rank-badge ${index < 3 ? 'rank-' + (index + 1) : ''}">${index + 1}</span></td>
                    <td>
                        <img src="${item.img || '/images/default-avatar.png'}" class="avatar" alt="${item.name}">
                        ${item.name}
                    </td>
                    <td>${item.speed} 字/分钟</td>
                    <td>${item.accuracy}%</td>
                </tr>
            `;
        });
    }

    tableBody.innerHTML = rows.join('');

    requestAnimationFrame(() => {
        document.querySelectorAll(`#${type} .rank-row`).forEach((row, index) => {
            requestAnimationFrame(() => {
                setTimeout(() => {
                    row.classList.add('show');
                }, index * 50);
            });
        });
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
