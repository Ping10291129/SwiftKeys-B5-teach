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
function redirectToLoginWithCountdown(seconds) {
    let counter = seconds;
    showMessage('error', `服务器内部错误，${counter}秒后将跳转到登录页面`);
    const intervalId = setInterval(() => {
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

function showMessage(type, message) {
    // ...existing message display code...
}
