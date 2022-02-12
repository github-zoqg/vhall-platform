import Share from './src/main';

/* istanbul ignore next */
Share.install = function (Vue) {
  Vue.component(Share.name, Share);
};

export default Share;
