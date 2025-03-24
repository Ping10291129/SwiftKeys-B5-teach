document.addEventListener('DOMContentLoaded', function() {
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

    // 更新页面用户信息
    function updateUserInfo() {
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
                            const userData = response.rows;
                            // 更新头部信息
                            updateHeaderInfo(userData);
                            // 更新表单信息
                            updateFormInfo(userData);
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
                const formData = new FormData();
                formData.append('avatar', file);

                fetch(localStorage.getItem('ip') + '/upload-avatar', {
                    method: 'POST',
                    headers: {
                        'Authorization': localStorage.getItem('token')
                    },
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    if (data.code === 200) {
                        showMessage('success', '头像上传成功');
                        updateUserInfo();
                    } else {
                        showMessage('error', data.message || '头像上传失败');
                    }
                })
                .catch(error => {
                    showMessage('error', '头像上传失败');
                    console.error('上传失败:', error);
                });
            }
        });
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

    // 初始化页面
    function initPage() {
        checkLoginStatus();
        updateUserInfo();
    }

    // 初始化全局ajax错误处理
    $(document).ajaxError(function (event, jqXHR) {
        if (jqXHR.status === 401 || jqXHR.status === 500) {
            redirectToLoginWithCountdown(3);
        }
    });

    // 初始化头像上传
    initAvatarUpload();
    
    // 页面加载完成后初始化
    initPage();
});
