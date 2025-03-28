document.addEventListener('DOMContentLoaded', function() {
    localStorage.setItem('ip', 'http://10.11.126.174:809');
    const hint = document.getElementById('login-hint');

    // 显示消息函数
    function showMessage(type, message) {
        hint.style.color = type === 'error' ? '#ff4d4f' : '#52c41a';
        hint.textContent = message;
    }

    // 表单验证函数
    function validateForm(username, password) {
        if (!username) {
            showMessage('error', '请输入用户名');
            return false;
        }
        if (!password) {
            showMessage('error', '请输入密码');
            return false;
        }
        return true;
    }

    document.getElementById('login').addEventListener('click', async function() {
        const btn = this;
        const spinner = btn.querySelector('.spinner-border');
        const buttonText = btn.querySelector('.button-text');
        
        // 显示加载状态
        spinner.classList.remove('d-none');
        buttonText.textContent = '登录中...';
        btn.disabled = true;

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        
        if (!validateForm(username, password)) {
            // 恢复按钮状态
            spinner.classList.add('d-none');
            buttonText.textContent = '登录账号';
            btn.disabled = false;
            return;
        }

        try {
            // 使用URLSearchParams构造请求体
            const formData = new URLSearchParams();
            formData.append('username', username);
            formData.append('password', password);

            const response = await fetch('http://10.11.126.174:809/userLogin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json'
                },
                body: formData.toString()
            });

            if (!response.ok) {
                throw new Error('网络请求失败');
            }

            const data = await response.json();
            
            if (data.code === 200) {
                if (data.token) {
                    localStorage.setItem('token', data.token);
                }
                window.location.href = 'home.html';
            } else {
                showMessage('error', data.message || '登录失败，请检查用户名和密码');
            }
        } catch (error) {
            showMessage('error', '服务器连接失败，请稍后再试');
            console.error('登录请求失败:', error);
        } finally {
            // 恢复按钮状态
            spinner.classList.add('d-none');
            buttonText.textContent = '登录账号';
            btn.disabled = false;
        }
    });

    document.querySelectorAll('#username, #password').forEach(function(input) {
        input.addEventListener('keypress', function(event) {
            if (event.key == 'Enter') {
                document.getElementById('login').click();
            }
        });
    });

    function togglePassword() {
        const passwordInput = document.getElementById('password');
        const icon = document.querySelector('.toggle-password i');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            icon.className = 'ri-eye-line';
        } else {
            passwordInput.type = 'password';
            icon.className = 'ri-eye-off-line';
        }
    }

    window.togglePassword = togglePassword;
});