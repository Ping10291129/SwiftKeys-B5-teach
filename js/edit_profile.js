document.addEventListener('DOMContentLoaded', function() {
    // 复用优化后的消息提示函数
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

    // 倒计时跳转函数
    function redirectToLoginWithCountdown(seconds) {
        let counter = seconds;
        showMessage('error', `登录已经失效，${counter}秒后将跳转到登录页面`);
        const intervalId = setInterval(function() {
            counter--;
            if (counter > 0) {
                showMessage('error', `登录已经失效，${counter}秒后将跳转到登录页面`);
            } else {
                clearInterval(intervalId);
                localStorage.removeItem('token');
                window.location.href = 'login.html';
            }
        }, 1000);
    }

    // 更新页面用户信息
    async function updateUserInfo() {
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
                // 同时处理401和500状态码
                if (response.status === 401 || response.status === 500) {
                    redirectToLoginWithCountdown(3);
                    return;
                }
                throw new Error('网络请求失败');
            }

            const data = await response.json();
            
            if (data.code === 200) {
                updateHeaderInfo(data.rows);
                updateFormInfo(data.rows);
            } else if (data.code === 401 || data.code === 500) {
                // 同时处理401和500业务状态码
                redirectToLoginWithCountdown(3);
            } else {
                throw new Error(data.message || '获取用户信息失败');
            }
        } catch (error) {
            showMessage('error', error.message);
            console.error('获取用户信息失败:', error);
            // 同时处理401和500相关的错误信息
            if (error.message.includes('401') || error.message.includes('500')) {
                redirectToLoginWithCountdown(3);
            }
        }
    }

    // 更新头部信息
    function updateHeaderInfo(userData) {
        // 更新头像
        const headerImg = document.querySelector('.navbar-list li a.search-toggle img');
        if (headerImg && userData.img) {
            headerImg.src = localStorage.getItem('ip') + userData.img;
        }
        
        // 更新用户名
        const headerName = document.querySelector('.navbar-list li a.search-toggle .caption h6');
        if (headerName) {
            headerName.textContent = userData.name || '用户';
        }
        
        // 更新角色信息
        const headerRole = document.querySelector('.navbar-list li a.search-toggle .caption span');
        if (headerRole) {
            headerRole.textContent = userData.role || '超级管理员';
        }
    }

    // 更新表单信息
    function updateFormInfo(userData) {
        // 更新昵称
        const nameInput = document.querySelector('input[type="text"].form-control');
        if (nameInput) {
            nameInput.value = userData.name || '';
        }

        // 更新性别
        const genderSelect = document.getElementById('gender');
        if (genderSelect) {
            genderSelect.value = userData.gender || '男';
        }

        // 更新邮箱
        const emailInput = document.querySelector('input[type="text"].form-control[value="admin@yahoo.com"]');
        if (emailInput) {
            emailInput.value = userData.email || '';
        }

        // 更新头像
        const profileImg = document.querySelector('.roundimg');
        if (profileImg && userData.img) {
            profileImg.src = localStorage.getItem('ip') + userData.img;
        }
    }

    // 初始化页面信息
    updateUserInfo();

    // 处理头像上传
    const uploadInput = document.querySelector('.btn-upload-avatar input[type="file"]');
    if (uploadInput) {
        uploadInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                uploadAvatar(file);
            }
        });
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

    // 初始化页面
    function initPage() {
        checkLoginStatus();
        updateUserInfo();
    }

    // 页面加载完成后初始化
    initPage();
});

async function uploadAvatar(file) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            redirectToLoginWithCountdown(3);
            return;
        }

        const formData = new FormData();
        formData.append('avatar', file);

        const response = await fetch(localStorage.getItem('ip') + '/upload-avatar', {
            method: 'POST',
            headers: {
                'Authorization': token
            },
            body: formData
        });

        if (!response.ok) {
            if (response.status === 401 || response.status === 500) {
                redirectToLoginWithCountdown(3);
                return;
            }
            throw new Error('网络请求失败');
        }

        const data = await response.json();
        if (data.code === 200) {
            showMessage('success', '头像上传成功');
            updateUserInfo();
        } else if (data.code === 401 || data.code === 500) {
            redirectToLoginWithCountdown(3);
        } else {
            throw new Error(data.message || '头像上传失败');
        }
    } catch (error) {
        showMessage('error', error.message);
        console.error('上传失败:', error);
        if (error.message.includes('401') || error.message.includes('500')) {
            redirectToLoginWithCountdown(3);
        }
    }
}
