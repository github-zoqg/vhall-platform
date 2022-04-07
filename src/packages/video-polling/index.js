import videoPolling from './src/main';

/* istanbul ignore next */
videoPolling.install = function (Vue) {
  Vue.component(videoPolling.name, videoPolling);
};

export default videoPolling;
