// const register = document.getElementById("register");
const login = document.getElementById("login");
const hint = document.querySelector('.hint')
localStorage.setItem('ip', 'http://10.11.126.174:809')

login.addEventListener('click',()=>{
	const username = document.getElementById('username').value;
	const password = document.getElementById('password').value;
	// 检查用户名和密码是否已输入
	if(!username || !password) {
		hint.style.color = 'red';
		hint.textContent = '请输入用户名和密码';
		return;
	}
	const xhr = new XMLHttpRequest();
	const formData = new FormData();
	formData.append('username', username);
	formData.append('password', password);
	xhr.open('POST', localStorage.getItem('ip')+'/userLogin/login', true);
	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	xhr.timeout = 10000;

	xhr.onload = function() {
		if (xhr.status === 200) {
			try {
				const data = JSON.parse(xhr.responseText);
				if(data.code === 200){
					localStorage.setItem('token', data.token);
					window.location.href = 'index.html';
				}else if(data.code === 404){
					hint.style.color = 'red';
					hint.textContent = data.msg;
				}
			} catch(e) {
				hint.style.color = 'red';
				hint.textContent = '服务器响应格式错误';
			}
		} else {
			hint.style.color = 'red';
			hint.textContent = '服务器响应错误: ' + xhr.status;
		}
	};

	xhr.onerror = function() {
		hint.style.color = 'red';
		hint.textContent = '网络请求失败';
	};

	xhr.ontimeout = function() {
		hint.style.color = 'red';
		hint.textContent = '请求超时';
	};

	const urlEncodedData = `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
	xhr.send(urlEncodedData);
})

document.querySelectorAll('#username, #password').forEach(function(input) {
	input.addEventListener('keypress', function(event) {
		if (event.key == 'Enter') {
			login.click();
		}
	});
});
// register.addEventListener('click', () => {
// 	window.location.href = 'register.html'
// })