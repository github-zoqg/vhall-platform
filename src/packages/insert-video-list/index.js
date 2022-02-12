import InsertVideo from './src/main';

/* istanbul ignore next */
InsertVideo.install = function (Vue) {
  Vue.component(InsertVideo.name, InsertVideo);
};

export default InsertVideo;
