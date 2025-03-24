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
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// 显示消息提示框
function showMessage(type, message) {
    const messageDiv = document.createElement('div');
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
    setTimeout(() => messageDiv.style.opacity = '1', 100);
    setTimeout(() => {
        messageDiv.style.opacity = '0';
        setTimeout(() => document.body.removeChild(messageDiv), 300);
    }, 3000);
}

// 调用接口更新页面头部的用户信息
function updateHeaderUserInfo() {
    localStorage.setItem('ip', 'http://10.11.126.174:809/userLogin');
    const xhr = new XMLHttpRequest();
    const timeout = 10000;
    let timeoutId;

    xhr.open('POST', localStorage.getItem('ip') + '/pim', true);
    xhr.setRequestHeader('Authorization', localStorage.getItem('token'));
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            clearTimeout(timeoutId);
            if (xhr.status === 200) {
                try {
                    const response = JSON.parse(xhr.responseText);
                    if (response.code === 200) {
                        updateUIWithUserData(response.rows);
                    } else {
                        redirectToLoginWithCountdown(3);
                    }
                } catch (error) {
                    showMessage('error', '解析响应数据失败');
                    console.error('解析响应数据失败:', error);
                }
            } else {
                redirectToLoginWithCountdown(3);
            }
        }
    };

    xhr.onerror = function() {
        clearTimeout(timeoutId);
        redirectToLoginWithCountdown(3);
    };

    timeoutId = setTimeout(() => {
        xhr.abort();
        redirectToLoginWithCountdown(3);
    }, timeout);

    xhr.send();
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
