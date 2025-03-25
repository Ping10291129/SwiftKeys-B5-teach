import renderHeader from './header.js';

// 等待 DOM 和其他脚本加载完成
window.addEventListener('load', () => {
    renderHeader();
    // 如果需要，可以在这里调用更新用户信息的函数
    if (typeof updateHeaderUserInfo === 'function') {
        updateHeaderUserInfo();
    }
});
