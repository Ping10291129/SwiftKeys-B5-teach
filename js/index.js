const tabItems = document.querySelectorAll('.tabs__item');
const slider = document.querySelector('.tabs__slider');

tabItems.forEach((item, index) => {
  item.addEventListener('click', function(e) {
    e.preventDefault();

    // 移除所有按钮的激活状态
    tabItems.forEach(i => i.classList.remove('tabs__item--active'));
    // 给当前点击项添加激活状态
    this.classList.add('tabs__item--active');

    // 让滑块移动到相应位置
    slider.style.left = (index * 33.3333) + '%';

    // 获取 data-range 属性并更新图表
    updateChart(this.getAttribute('data-range'));
  });
});
