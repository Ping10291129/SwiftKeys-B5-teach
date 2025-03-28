export default function renderSidebar() {
    const sidebarHTML = `
        <div class="iq-sidebar">
            <div class="iq-sidebar-logo d-flex justify-content-between">
                <a href="index.html"><span>SwiftKeys后台管理</span></a>
            </div>
            <div id="sidebar-scrollbar">
                <nav class="iq-sidebar-menu">
                    <ul class="iq-menu">
                        <li data-page="home">
                            <a href="home.html" class="iq-waves-effect">
                                <i class="ri-home-8-fill"></i><span>首页</span>
                            </a>
                        </li>
                        <li data-page="admin">
                            <a href="javascript:void(0);" class="iq-waves-effect">
                                <i class="ri-shield-user-fill"></i><span>管理员中心</span>
                                <i class="ri-arrow-right-s-line iq-arrow-right"></i>
                            </a>
                            <ul class="iq-submenu">
                                <li data-page="edit_profile"><a href="edit_profile.html">资料编辑</a></li>
                                <li data-page="change_password"><a href="change_password.html">修改密码</a></li>
                            </ul>
                        </li>
                        <li data-page="users">
                            <a href="javascript:void(0);" class="iq-waves-effect">
                                <i class="ri-user-settings-fill"></i>
                                <span>用户列表</span>
                                <i class="ri-arrow-right-s-line iq-arrow-right"></i>
                            </a>
                            <ul class="iq-submenu">
                                <li data-page="users_list"><a href="users.html">我的用户</a></li>
                                <li data-page="add_user"><a href="add_user.html">添加用户</a></li>
                            </ul>
                        </li>
                        <li data-page="typing">
                            <a href="javascript:void(0);" class="iq-waves-effect">
                                <i class="ri-todo-fill"></i>
                                <span>打字测试</span>
                                <i class="ri-arrow-right-s-line iq-arrow-right"></i>
                            </a>
                            <ul class="iq-submenu">
                                <li data-page="publish_task"><a href="publish_task.html">发布任务</a></li>
                                <li data-page="unfinished_students"><a href="unfinished_students.html">未做名单</a></li>
                                <li data-page="add_article"><a href="add_article.html">添加文章</a></li>
                            </ul>
                        </li>
                        <li data-page="score">
                            <a href="javascript:void(0);" class="iq-waves-effect">
                                <i class="ri-bar-chart-2-fill"></i>
                                <span>成绩统计</span>
                                <i class="ri-arrow-right-s-line iq-arrow-right"></i>
                            </a>
                            <ul class="iq-submenu">
                                <li data-page="ranking_list"><a href="ranking_list.html">成绩列表</a></li>
                                <li data-page="score_review"><a href="score_review.html">成绩审核</a></li>
                            </ul>
                        </li>
                        <li data-page="anomaly_monitoring">
                            <a href="anomaly_monitoring.html" class="iq-waves-effect">
                                <i class="ri-alarm-warning-fill"></i>
                                <span>异常监控</span>
                                <i class="ri-arrow-right-s-line iq-arrow-right"></i>
                            </a>
                        </li>
                        <li data-page="question">
                            <a href="javascript:void(0);" class="iq-waves-effect">
                                <i class="ri-file-edit-fill"></i>
                                <span>题库管理</span>
                                <i class="ri-arrow-right-s-line iq-arrow-right"></i>
                            </a>
                            <ul class="iq-submenu">
                                <li data-page="question_bank"><a href="question_bank.html">所有题目</a></li>
                                <li data-page="package_management"><a href="package_management.html">套餐管理</a></li>
                            </ul>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    `;

    const sidebarContainer = document.getElementById('sidebar');
    if (sidebarContainer) {
        sidebarContainer.innerHTML = sidebarHTML;
        initSidebar();

        // 添加样式初始化
        const sidebar = sidebarContainer.querySelector('.iq-sidebar');
        if (sidebar) {
            // 确保 logo 区域样式统一
            const logoArea = sidebar.querySelector('.iq-sidebar-logo');

            // 确保链接样式统一
            const logoLink = logoArea.querySelector('a');
            if (logoLink) {
                logoLink.style.color = '#666';
                logoLink.style.fontSize = '16px';
                logoLink.style.fontWeight = '500';
            }
        }
    }
}

function initSidebar() {
    // 获取当前页面标识
    const currentPage = document.body.getAttribute('data-page');
    
    // 处理主菜单项高亮和子菜单高亮
    const menuItems = document.querySelectorAll('.iq-menu > li');
    menuItems.forEach(item => {
        // 主菜单项处理
        if (item.getAttribute('data-page') === currentPage) {
            item.classList.add('active');
        }
        
        // 查找当前页面所在的子菜单
        const submenuItems = item.querySelectorAll('.iq-submenu li');
        submenuItems.forEach(subItem => {
            if (subItem.getAttribute('data-page') === currentPage || 
                (currentPage === 'change_password' && subItem.querySelector('a').getAttribute('href') === 'change_password.html')) {
                // 添加激活状态
                item.classList.add('active');
                subItem.classList.add('active');
                
                // 展开子菜单
                const submenu = subItem.closest('.iq-submenu');
                if (submenu) {
                    submenu.style.display = 'block';
                    item.classList.add('menu-open');
                }
            }
        });
    });

    // 菜单点击事件处理
    $('.iq-sidebar-menu .iq-menu li > a').on('click', function(e) {
        const parent = $(this).parent();
        const submenu = parent.find('> .iq-submenu');
        
        if (submenu.length) {
            e.preventDefault();
            e.stopPropagation();
            
            if (parent.hasClass('menu-open')) {
                // 关闭当前子菜单
                parent.removeClass('menu-open');
                submenu.slideUp(300);
            } else {
                // 展开当前子菜单，不关闭其他
                parent.addClass('menu-open');
                submenu.slideDown(300);
            }
        }
    });

    // 初始展开当前页面的父菜单
    const currentMenuItem = $(`.iq-menu li[data-page="${currentPage}"]`);
    if (currentMenuItem.length) {
        currentMenuItem.parents('.iq-menu li').addClass('menu-open')
            .find('> .iq-submenu').show();
    }
}
