import NoticeList from './src/main';
/* istanbul ignore next */
NoticeList.install = function (Vue) {
  Vue.component(NoticeList.name, NoticeList);
};

export default NoticeList;
