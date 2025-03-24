document.addEventListener('DOMContentLoaded', function() {
    localStorage.setItem('ip', 'http://10.11.126.174:809/userLogin/');
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

    document.getElementById('login').addEventListener('click', function() {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        
        // 进行表单验证
        if (!validateForm(username, password)) {
            return;
        }

        // 构建请求数据
        const data = `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;

        // 发送登录请求
        fetch('http://10.11.126.174:809/userLogin/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            },
            body: data
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.code === 200) {
                // 存储token
                if (data.token) {
                    localStorage.setItem('token', data.token);
                }
                // 登录成功
                window.location.href = 'index.html';
            } else {
                // 登录失败
                document.getElementById('login-hint').style.color = '#ff4d4f';
                document.getElementById('login-hint').textContent = data.message || '登录失败，请检查用户名和密码';
            }
        })
        .catch(error => {
            console.error('登录请求失败:', error);
            document.getElementById('login-hint').style.color = '#ff4d4f';
            document.getElementById('login-hint').textContent = '服务器连接失败，请稍后再试';
        });
    });

    document.querySelectorAll('#username, #password').forEach(function(input) {
        input.addEventListener('keypress', function(event) {
            if (event.key == 'Enter') {
                document.getElementById('login').click();
            }
        });
    });
});