import { showMessage } from './main.js';

import { redirectToLoginWithCountdown } from './main.js';

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

// 调用接口更新页面头部的用户信息
async function updateHeaderUserInfo() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            redirectToLoginWithCountdown(3);
            return;
        }

        const response = await fetch(localStorage.getItem('ip') + '/userLogin/pim', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        if (data.code === 200) {
            updateUIWithUserData(data.rows);
        } else {
            redirectToLoginWithCountdown(3);
        }
    } catch (error) {
        console.error('Error:', error);
        redirectToLoginWithCountdown(3);
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
            window.location.href = 'index.html';
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
