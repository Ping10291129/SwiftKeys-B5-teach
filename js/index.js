document.addEventListener('DOMContentLoaded', function() {
    // 初始化tabs
    initTabs();
    // 初始化图表
    initChart();
    // 更新用户信息
    updateHeaderUserInfo();
    initLogout();
    initDropdownToggle();
});

function initTabs() {
    const tabItems = document.querySelectorAll('.tabs__item');
    const slider = document.querySelector('.tabs__slider');

    tabItems.forEach((item, index) => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            tabItems.forEach(i => i.classList.remove('tabs__item--active'));
            this.classList.add('tabs__item--active');
            slider.style.left = (index * 33.3333) + '%';
            updateChart(this.getAttribute('data-range'));
        });
    });
}

function initChart() {
    // ...existing chart initialization code...
}

// 检查登录状态
function checkLoginStatus() {
    const token = localStorage.getItem('token');
    if (!token) {
        redirectToLoginWithCountdown(3);
        return false;
    }
    return true;
}

// 显示消息提示框
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

// 调用接口更新页面头部的用户信息
async function updateHeaderUserInfo() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            redirectToLoginWithCountdown(3);
            return;
        }

        const response = await fetch(localStorage.getItem('ip') + '/pim', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            }
        });

        // 统一处理401和500状态
        if (!response.ok) {
            if (response.status === 401 || response.status === 500) {
                redirectToLoginWithCountdown(3);
                return;
            }
            throw new Error('网络请求失败');
        }

        const data = await response.json();
        if (data.code === 200) {
            updateUIWithUserData(data.rows);
        } else if (data.code === 401 || data.code === 500) {
            redirectToLoginWithCountdown(3);
        } else {
            throw new Error(data.message || '获取用户信息失败');
        }
    } catch (error) {
        showMessage('error', '获取用户信息失败');
        console.error('获取用户信息失败:', error);
        if (error.message.includes('401') || error.message.includes('500')) {
            redirectToLoginWithCountdown(3);
        }
    }
}

// 更新UI界面
function updateUIWithUserData(userData) {
    // 更新头部用户信息
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

    // 更新下拉菜单用户信息
    const dropdownName = document.querySelector('.iq-user-dropdown .bg-primary h5');
    if (dropdownName) {
        dropdownName.textContent = `你好 - ${userData.name || '用户'}`;
    }
}

// 初始化退出登录功能
function initLogout() {
    const logoutBtn = document.querySelector('.iq-sign-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('token');
            window.location.href = 'login.html';
        });
    }
}

// 初始化下拉菜单切换
function initDropdownToggle() {
    const toggleBtn = document.querySelector('.search-toggle');
    const dropdown = document.querySelector('.iq-user-dropdown');
    if (toggleBtn && dropdown) {
        toggleBtn.addEventListener('click', function(e) {
            e.preventDefault();
            dropdown.classList.toggle('show');
        });

        // 点击其他地方关闭下拉菜单
        document.addEventListener('click', function(e) {
            if (!toggleBtn.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.remove('show');
            }
        });
    }
}

// 倒计时跳转函数
function redirectToLoginWithCountdown(seconds) {
    let counter = seconds;
    showMessage('error', `服务器内部错误，${counter}秒后将跳转到登录页面`);
    const intervalId = setInterval(function() {
        counter--;
        if (counter > 0) {
            showMessage('error', `服务器内部错误，${counter}秒后将跳转到登录页面`);
        } else {
            clearInterval(intervalId);
            localStorage.removeItem('token');
            window.location.href = 'login.html';
        }
    }, 1000);
}
