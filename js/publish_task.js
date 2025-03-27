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

    // 示例数据
    const articleData = [
        { id: 1, name: '医学论文写作指南', desc: '关于医学论文写作的基本规范和技巧指导', publishTime: '2024-01-15', deadline: '2024-02-15', action: '编辑' },
        { id: 2, name: '临床研究方法学', desc: '临床研究设计与实施的详细教程', publishTime: '2024-01-16', deadline: '2024-02-16', action: '编辑' },
        { id: 3, name: '医学统计学基础', desc: '医学统计方法及应用实例讲解', publishTime: '2024-01-17', deadline: '2024-02-17', action: '编辑' }
    ];

    const taskData = [
        { id: 1, name: '病例报告录入', desc: '录入10份急诊科病例报告', publishTime: '2024-01-15', deadline: '2024-01-20', action: '编辑' },
        { id: 2, name: '医疗记录整理', desc: '整理并录入2023年12月门诊记录', publishTime: '2024-01-16', deadline: '2024-01-21', action: '编辑' },
        { id: 3, name: '处方信息录入', desc: '录入100份标准处方信息', publishTime: '2024-01-17', deadline: '2024-01-22', action: '编辑' }
    ];

    // 更新表格数据
    function updateTableData(data) {
        tableBody.innerHTML = data.map(item => `
            <tr>
                <td>${item.id}</td>
                <td>${item.name}</td>
                <td>${item.desc}</td>
                <td>${item.publishTime}</td>
                <td>${item.deadline}</td>
                <td>
                    <button class="btn btn-primary btn-sm">${item.action}</button>
                </td>
            </tr>
        `).join('');
    }

    // 初始化显示文章数据
    updateTableData(articleData);

    // 内容类型切换事件监听
    contentSwitchItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            // 更新激活状态
            contentSwitchItems.forEach(tab => tab.classList.remove('content-switch__item--active'));
            item.classList.add('content-switch__item--active');

            // 精确计算滑块位置
            const translateX = index * (item.offsetWidth + 3);
            contentSwitchSlider.style.transform = `translateX(${translateX}px)`;

            // 更新表格数据
            const type = item.getAttribute('data-type');
            updateTableData(type === 'article' ? articleData : taskData);
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