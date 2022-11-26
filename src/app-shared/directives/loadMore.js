// 表格滚动加载更多
export const loadMore = {
  name: 'loadMore',
  option: {
    inserted: function (el, binding) {
      let targetDom =
        el.querySelector('.el-table__body-wrapper') ||
        el.querySelector('.el-scrollbar__wrap') ||
        el.querySelector('.el-tabs__content');
      targetDom.addEventListener('scroll', function () {
        let scrollDistance = this.scrollHeight - this.scrollTop - this.clientHeight;
        if (!parseInt(scrollDistance)) {
          binding.value();
        }
      });
    }
  }
};
