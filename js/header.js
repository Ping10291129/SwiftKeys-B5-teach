export default function renderHeader() {
    const headerHTML = `
        <div class="iq-top-navbar">
            <div class="iq-navbar-custom">
                <nav class="navbar navbar-expand-lg navbar-light p-0">
                    <div class="iq-search-bar">
                        <form action="javascript:;" class="searchbox">
                            <input type="text" class="text search-input" placeholder="请输入搜索内容...">
                            <a class="search-link" href="#"><i class="ri-search-line"></i></a>
                        </form>
                    </div>
                    <div class="iq-menu-bt align-self-center">
                        <div class="wrapper-menu">
                            <div class="main-circle"><i class="ri-more-fill"></i></div>
                            <div class="hover-circle"><i class="ri-more-2-fill"></i></div>
                        </div>
                    </div>
                    <div class="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul class="navbar-nav ml-auto navbar-list">
                            <li class="nav-item iq-full-screen">
                                <a href="#" class="iq-waves-effect" id="btnFullscreen"><i class="ri-fullscreen-line"></i></a>
                            </li>
                        </ul>
                    </div>
                    <ul class="navbar-list">
                        <li>
                            <a href="#" class="search-toggle iq-waves-effect d-flex align-items-center">
                                <img src="images/user1.jpg" class="img-fluid rounded mr-3 image" alt="user">
                                <div class="caption">
                                    <h6 class="mb-0 line-height">用户名</h6>
                                    <span class="font-size-12">角色信息</span>
                                </div>
                            </a>
                            <div class="iq-sub-dropdown iq-user-dropdown back-fil">
                                <div class="iq-card shadow-none m-0 back-tra">
                                    <div class="iq-card-body p-0">
                                        <div class="bg-primary p-3">
                                            <h5 class="mb-0 text-white line-height">你好</h5>
                                        </div>
                                        <a href="edit_profile.html" class="iq-sub-card iq-bg-primary-hover">
                                            <div class="media align-items-center">
                                                <div class="rounded iq-card-icon iq-bg-primary">
                                                    <i class="ri-file-user-line"></i>
                                                </div>
                                                <div class="media-body ml-3">
                                                    <h6 class="mb-0">资料编辑</h6>
                                                </div>
                                            </div>
                                        </a>
                                        <div class="d-inline-block w-100 text-center p-3">
                                            <a class="bg-primary iq-sign-btn" href="login.html" role="button">退出登录
                                                <i class="ri-login-box-line ml-2"></i>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>`;

    const headerContainer = document.getElementById('header');
    if (headerContainer) {
        headerContainer.innerHTML = headerHTML;
        // 初始化下拉菜单
        initDropdowns();
    }
}

function initDropdowns() {
    // 使用 jQuery 初始化下拉菜单
    $('.search-toggle').on('click', function(e) {
        e.preventDefault();
        $(this).siblings('.iq-sub-dropdown').toggleClass('show');
    });

    // 点击其他地方关闭下拉菜单
    $(document).on('click', function(e) {
        if (!$(e.target).closest('.search-toggle, .iq-sub-dropdown').length) {
            $('.iq-sub-dropdown').removeClass('show');
        }
    });
}
