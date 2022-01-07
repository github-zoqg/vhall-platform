import noticeColumn from './src/main';

/* istanbul ignore next */
noticeColumn.install = function (Vue) {
  Vue.component(noticeColumn.name, noticeColumn);
};

export default noticeColumn;
