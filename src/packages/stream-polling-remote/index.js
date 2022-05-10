// 视频轮询流订阅组件 StreamPollingRemote
import StreamPollingRemote from './src/main';

/* istanbul ignore next */
StreamPollingRemote.install = function (Vue) {
  Vue.component(StreamPollingRemote.name, StreamPollingRemote);
};

export default StreamPollingRemote;
