import { showMessage } from './main.js';

document.addEventListener('DOMContentLoaded', function() {

    // 更新页面用户信息
    async function updateUserInfo() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                window.location.href = 'login.html';
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
                throw new Error('网络请求失败');
            }

            const data = await response.json();
            
            if (data.code === 200) {
                updateFormInfo(data.rows);
            } else {
                throw new Error(data.message || '获取用户信息失败');
            }
        } catch (error) {
            showMessage('error', error.message);
            console.error('获取用户信息失败:', error);
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

    // 处理头像选择和上传
    const avatarInput = document.querySelector('#avatarInput');
    const uploadAvatarBtn = document.querySelector('#uploadAvatarBtn');

    if (avatarInput) {
        avatarInput.addEventListener('change', function(e) {
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const img = document.querySelector('.roundimg');
                    img.src = e.target.result;
                };
                reader.readAsDataURL(this.files[0]);
            }
        });
    }

    if (uploadAvatarBtn) {
        uploadAvatarBtn.addEventListener('click', async function() {
            const fileInput = document.getElementById('avatarInput');
            if (!fileInput.files || !fileInput.files[0]) {
                showMessage('error', '请先选择要上传的头像');
                return;
            }

            this.disabled = true;
            try {
                const success = await uploadAvatar(fileInput.files[0]);
                if (success) {
                    await updateUserInfo();
                }
            } catch (error) {
                showMessage('error', '上传失败');
            } finally {
                this.disabled = false;
            }
        });
    }

    async function uploadAvatar(file) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                window.location.href = 'login.html';
                return false;
            }

            const formData = new FormData();
            formData.append('avatar', file);

            const response = await fetch(localStorage.getItem('ip') + '/userLogin/changeImg', {
                method: 'POST',
                headers: {
                    'Authorization': token
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error('网络请求失败');
            }

            const data = await response.json();
            
            if (data.code === 200) {
                showMessage('success', '头像上传成功');
                return true;
            } else {
                throw new Error(data.message || '上传失败');
            }
        } catch (error) {
            console.error('上传头像失败:', error);
            showMessage('error', error.message);
            return false;
        }
    }
});
