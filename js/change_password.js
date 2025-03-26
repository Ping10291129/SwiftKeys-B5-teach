document.addEventListener('DOMContentLoaded', function() {
    initPasswordToggle();
    initFormValidation();
});

function initPasswordToggle() {
    document.querySelectorAll('.toggle-password').forEach(icon => {
        icon.addEventListener('click', function() {
            const input = this.parentElement.querySelector('input');
            const type = input.getAttribute('type');
            input.setAttribute('type', type === 'password' ? 'text' : 'password');
            this.classList.toggle('ri-eye-line');
            this.classList.toggle('ri-eye-off-line');
        });
    });
}

function initFormValidation() {
    const form = document.getElementById('changePasswordForm');
    const oldPassword = document.getElementById('oldPassword');
    const newPassword = document.getElementById('newPassword');
    const confirmPassword = document.getElementById('confirmPassword');
    const submitBtn = document.getElementById('submitBtn');

    submitBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        submitBtn.disabled = true; // 禁用按钮，防止重复点击
        // 清除之前的错误提示
        clearErrors();

        // 表单验证
        if (!validateForm()) {
            submitBtn.disabled = false; // 验证未通过，恢复按钮
            return;
        }

        try {
            const response = await changePassword({
                oldPassword: oldPassword.value,
                newPassword: newPassword.value
            });

            if (response.code === 200) {
                showMessage('success', '密码修改成功，请重新登录');
                setTimeout(() => {
                    localStorage.removeItem('token');
                    window.location.href = 'login.html';
                }, 2000);
            } else if (response.code === 404) {
                // 当原密码错误时，输出后台返回的提示信息
                showMessage('error', response.msg);
            } else {
                showMessage('error', response.msg || '密码修改失败');
            }
        } catch (error) {
            showMessage('error', '服务器错误，请稍后重试');
        } finally {
            submitBtn.disabled = false; // 请求结束后恢复按钮
        }
    });

    function validateForm() {
        let isValid = true;

        if (!oldPassword.value) {
            showError(oldPassword, '请输入原密码');
            isValid = false;
        }

        if (!newPassword.value) {
            showError(newPassword, '请输入新密码');
            isValid = false;
        }

        if (!confirmPassword.value) {
            showError(confirmPassword, '请确认新密码');
            isValid = false;
        } else if (confirmPassword.value !== newPassword.value) {
            showError(confirmPassword, '两次输入的密码不一致');
            isValid = false;
        }

        return isValid;
    }

    function showError(input, message) {
        const formGroup = input.closest('.form-group');
        formGroup.classList.add('is-invalid');
        
        // 创建或更新错误提示
        let feedback = formGroup.querySelector('.error-feedback');
        if (!feedback) {
            feedback = document.createElement('div');
            feedback.className = 'error-feedback';
            formGroup.appendChild(feedback);
        }
        feedback.textContent = message;
    }

    function clearErrors() {
        document.querySelectorAll('.form-group').forEach(group => {
            group.classList.remove('is-invalid');
            const feedback = group.querySelector('.error-feedback');
            if (feedback) {
                feedback.remove();
            }
        });
    }
}

async function changePassword(data) {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
    // 使用 FormData 构造 multipart/form-data
    const formData = new FormData();
    formData.append('newPass', data.newPassword);
    formData.append('password', data.oldPassword);
    const response = await fetch(localStorage.getItem('ip') + '/userLogin/changePass', {
        method: 'POST',
        headers: {
            'Authorization': token
        },
        body: formData
    });
    return await response.json();
}

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
