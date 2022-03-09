import ScreenPost from './src/main';

/* istanbul ignore next */
ScreenPost.install = function (Vue) {
  Vue.component(ScreenPost.name, ScreenPost);
};

export default ScreenPost;
