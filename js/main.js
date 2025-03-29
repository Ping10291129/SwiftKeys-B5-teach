import renderHeader from './header.js';
import renderSidebar from './sidebar.js';

// 等待 DOM 和其他脚本加载完成
window.addEventListener('load', () => {
    // 渲染侧边栏和顶部栏
    renderSidebar();
    renderHeader();
    
    // 更新用户信息
    updateHeaderUserInfo();
});

// 复用 index.html 中的用户信息更新函数
function updateHeaderUserInfo() {
    const token = localStorage.getItem('token');
    if (!token) {
        redirectToLoginWithCountdown(3);
        return;
    }

    fetch(localStorage.getItem('ip') + '/userLogin/pim', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data.code === 200) {
            // 更新头部用户信息
            const userData = data.rows;
            const headerImg = document.querySelector('.navbar-list li a.search-toggle img');
            if (headerImg && userData.img) {
                headerImg.src = localStorage.getItem('ip') + userData.img;
            }
            
            const headerName = document.querySelector('.navbar-list li a.search-toggle .caption h6');
            if (headerName) {
                headerName.textContent = userData.name || '用户';
            }
            
            const headerRole = document.querySelector('.navbar-list li a.search-toggle .caption span');
            if (headerRole) {
                headerRole.textContent = userData.role || '超级管理员';
            }
        } else {
            redirectToLoginWithCountdown(3);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        redirectToLoginWithCountdown(3);
    });
}

// 倒计时跳转函数
function redirectToLoginWithCountdown(seconds = 4) {
    let counter = seconds;
    const getCountdownMessage = (count) => `登录已失效，${count}秒后将跳转到登录页面`;
    const message = getCountdownMessage(counter);
    showMessage('error', message, true);
    const intervalId = setInterval(() => {
        counter--;
        if (counter > 0) {
            const existingMessage = document.querySelector('.countdown-message');
            if (existingMessage) {
                existingMessage.textContent = getCountdownMessage(counter);
            }
        } else {
            clearInterval(intervalId);
            localStorage.removeItem('token');
            window.location.href = 'index.html';
        }
    }, 1000);
}

export function showMessage(type, message, isCountdown = false) {
    // 如果是倒计时消息，尝试更新现有的倒计时消息框
    if (isCountdown) {
        const existingCountdown = document.querySelector('.countdown-message');
        if (existingCountdown) {
            existingCountdown.textContent = message;
            return;
        }
    } else {
        // 移除所有非倒计时消息
        const existingMessages = document.querySelectorAll('.message-div:not(.countdown-message)');
        existingMessages.forEach(div => div.remove());
    }

    // 创建新的消息提示
    const messageDiv = document.createElement('div');
    messageDiv.className = `message-div${isCountdown ? ' countdown-message' : ''}`;
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
    messageDiv.style.backgroundColor = type === 'error' ? '#ff4d4f' : '#52c41a';
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);
    
    // 显示消息
    setTimeout(() => messageDiv.style.opacity = '1', 10);

    // 如果不是倒计时消息，3秒后自动移除
    if (!isCountdown) {
        setTimeout(() => {
            messageDiv.style.opacity = '0';
            setTimeout(() => messageDiv.remove(), 300);
        }, 3000);
    }
}
