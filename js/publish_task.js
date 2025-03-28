// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', () => {
    // 初始化页面功能
    initPublishTask();
});

function initPublishTask() {
    // 内容类型切换功能
    const contentSwitchItems = document.querySelectorAll('.content-switch__item');
    const contentSwitchSlider = document.querySelector('.content-switch__slider');
    const tableBody = document.querySelector('#pending tbody');

    // 任务状态切换功能
    const tabItems = document.querySelectorAll('.tabs__item');
    const tabSlider = document.querySelector('.tabs__slider');

    let currentPage = 1;
    const itemsPerPage = 20;
    let currentData = [];

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
        const intervalId = setInterval(function () {
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

    // 获取文章列表数据
    async function fetchArticleData() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                redirectToLoginWithCountdown(3);
                return [];
            }

            const response = await fetch(localStorage.getItem('ip') + '/textUpload/textList', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                }
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 500) {
                    redirectToLoginWithCountdown(3);
                    return [];
                }
                throw new Error('网络请求失败');
            }

            const data = await response.json();
            if (data.code === 200) {
                return data.rows || [];
            } else if (data.code === 401 || data.code === 500) {
                redirectToLoginWithCountdown(3);
                return [];
            } else {
                throw new Error(data.message || '获取文章列表失败');
            }
        } catch (error) {
            showMessage('error', error.message);
            console.error('获取文章列表失败:', error);
            return [];
        }
    }

    // 获取任务列表数据
    async function fetchTaskData() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                redirectToLoginWithCountdown(3);
                return [];
            }

            const response = await fetch(localStorage.getItem('ip') + '/task/taskList', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                }
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 500) {
                    redirectToLoginWithCountdown(3);
                    return [];
                }
                throw new Error('网络请求失败');
            }

            const data = await response.json();
            if (data.code === 200) {
                return data.rows || [];
            } else if (data.code === 401 || data.code === 500) {
                redirectToLoginWithCountdown(3);
                return [];
            } else {
                throw new Error(data.message || '获取任务列表失败');
            }
        } catch (error) {
            showMessage('error', error.message);
            console.error('获取任务列表失败:', error);
            return [];
        }
    }

    // 更新表格数据
    function updateTableData(data, page = 1) {
        currentData = data;
        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const pageData = data.slice(start, end);

        if (!pageData || pageData.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center" style="padding: 20px;">
                        <div style="color: #999; font-size: 14px;">暂无数据</div>
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = pageData.map(item => `
            <tr>
                <td>${item.id}</td>
                <td>${item.name}</td>
                <td>${item.grade || '-'}</td>
                <td>${item.type || '-'}</td>
                <td>${item.create_time || '-'}</td>
                <td>${item.update_time || '-'}</td>
                <td>
                    <button class="btn btn-primary btn-sm">编辑</button>
                </td>
            </tr>
        `).join('');

        updatePagination();
    }

    function updatePagination() {
        const totalPages = Math.ceil(currentData.length / itemsPerPage);
        const paginationContainer = document.querySelector('.custom-pagination');
        
        paginationContainer.innerHTML = `
            <li class="custom-page-item ${currentPage === 1 ? 'disabled' : ''}">
                <a class="custom-page-link" href="javascript:;" aria-label="Previous">
                    <span aria-hidden="true">上一页</span>
                </a>
            </li>
        `;
        
        for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
            paginationContainer.innerHTML += `
                <li class="custom-page-item ${i === currentPage ? 'active' : ''}">
                    <a class="custom-page-link" href="javascript:;">${i}</a>
                </li>
            `;
        }
        
        paginationContainer.innerHTML += `
            <li class="custom-page-item ${currentPage === totalPages ? 'disabled' : ''}">
                <a class="custom-page-link" href="javascript:;" aria-label="Next">
                    <span aria-hidden="true">下一页</span>
                </a>
            </li>
        `;

        addPaginationEventListeners(totalPages);
    }

    function addPaginationEventListeners(totalPages) {
        const pageLinks = document.querySelectorAll('.custom-page-link');
        
        pageLinks.forEach((link, index) => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                if (index === 0 && currentPage > 1) {
                    currentPage--;
                    updateTableData(currentData, currentPage);
                } else if (index === pageLinks.length - 1 && currentPage < totalPages) {
                    currentPage++;
                    updateTableData(currentData, currentPage);
                } else if (index !== 0 && index !== pageLinks.length - 1) {
                    const pageNum = parseInt(this.textContent);
                    if (pageNum !== currentPage) {
                        currentPage = pageNum;
                        updateTableData(currentData, currentPage);
                    }
                }
            });
        });
    }

    // 初始化显示文章数据
    fetchArticleData().then(data => updateTableData(data, 1));

    // 内容类型切换事件监听
    contentSwitchItems.forEach((item, index) => {
        item.addEventListener('click', async () => {
            // 更新激活状态
            contentSwitchItems.forEach(tab => tab.classList.remove('content-switch__item--active'));
            item.classList.add('content-switch__item--active');

            // 精确计算滑块位置
            const translateX = index * (item.offsetWidth + 3);
            contentSwitchSlider.style.transform = `translateX(${translateX}px)`;

            // 更新表格数据
            const type = item.getAttribute('data-type');
            const data = await (type === 'article' ? fetchArticleData() : fetchTaskData());
            currentPage = 1; // 重置页码
            updateTableData(data, 1);
        });
    });

    // 任务状态切换事件监听
    tabItems.forEach((item, index) => {
        item.addEventListener('click', (e) => {
            e.preventDefault();

            // 更新激活状态
            tabItems.forEach(tab => tab.classList.remove('tabs__item--active'));
            item.classList.add('tabs__item--active');

            // 使用95px作为固定宽度
            const translateX = index * 95;
            tabSlider.style.transform = `translateX(${translateX}px)`;
        });
    });

    // 初始化滑块
    if (tabItems.length > 0) {
        // 设置固定宽度为95px
        tabSlider.style.width = '95px';
        tabSlider.style.transform = 'translateX(0)';
    }
    if (contentSwitchItems.length > 0) {
        const firstSwitchWidth = contentSwitchItems[0].offsetWidth;
        contentSwitchSlider.style.width = `${firstSwitchWidth - 6}px`;
    }
}