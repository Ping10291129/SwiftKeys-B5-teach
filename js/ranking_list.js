document.addEventListener('DOMContentLoaded', function() {
    initRankingTabs();
    loadRankingData('score'); // 默认加载总分排行数据
});

function initRankingTabs() {
    const tabItems = document.querySelectorAll('.tabs__item');
    updateSliderPosition(0);

    // 默认显示第一个面板
    document.querySelector('#score').classList.add('show', 'active');

    tabItems.forEach((item, index) => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 更新标签状态
            tabItems.forEach(i => i.classList.remove('tabs__item--active'));
            this.classList.add('tabs__item--active');
            
            // 更新滑块位置
            updateSliderPosition(index);
            
            // 获取目标面板ID
            const targetId = this.getAttribute('data-target');
            
            // 隐藏所有面板
            document.querySelectorAll('.tab-pane').forEach(pane => {
                pane.classList.remove('show', 'active');
            });
            
            // 显示目标面板
            const targetPane = document.querySelector(`#${targetId}`);
            if (targetPane) {
                targetPane.classList.add('show', 'active');
            }
            
            // 加载对应的排行榜数据
            loadRankingData(targetId);
        });
    });
}

function updateSliderPosition(index) {
    const slider = document.querySelector('.tabs__slider');
    slider.style.left = (index * 33.3333) + '%';
}

async function loadRankingData(type) {
    try {
        // 这里应该是实际的API调用，现在用模拟数据
        const data = await fetchRankingData(type);
        updateRankingTable(type, data);
    } catch (error) {
        showMessage('error', '获取排行榜数据失败');
        console.error('获取排行榜数据失败:', error);
    }
}

// 模拟获取排行榜数据
async function fetchRankingData(type) {
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 生成测试数据
    return Array.from({length: 20}, (_, i) => {
        const baseScore = 100 - i * 2;
        return {
            rank: i + 1,
            name: `学生${i + 1}`,
            class: `高${Math.ceil(Math.random() * 3)}(${Math.ceil(Math.random() * 5)})班`,
            studentId: `202${Math.floor(Math.random() * 4)}${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
            totalScore: Math.round(baseScore + Math.random() * 10),
            speed: Math.round(120 - i * 3 + Math.random() * 5),
            accuracy: Math.round(98 - i * 0.5 + Math.random() * 2)
        };
    });
}

function updateRankingTable(type, data) {
    const tableBody = document.querySelector(`#${type} table tbody`);
    if (!tableBody) return;

    const rows = data.map(item => {
        let score;
        switch(type) {
            case 'score':
                score = `${item.totalScore}`;
                break;
            case 'speed':
                score = `${item.speed} 字/分钟`;
                break;
            case 'accuracy':
                score = `${item.accuracy}%`;
                break;
        }

        return `
            <tr class="rank-row">
                <td><span class="rank-badge ${item.rank <= 3 ? 'rank-' + item.rank : ''}">${item.rank}</span></td>
                <td>${item.name}</td>
                <td>
                    <p>${item.class}</p>
                    <p class="typing-time">学号：${item.studentId}</p>
                </td>
                <td>${score}</td>
            </tr>
        `;
    }).join('');

    tableBody.innerHTML = rows;

    // 优化动画效果
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
