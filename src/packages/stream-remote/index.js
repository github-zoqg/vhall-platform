import StreamRemote from './src/main';

/* istanbul ignore next */
StreamRemote.install = function (Vue) {
  Vue.component(StreamRemote.name, StreamRemote);
};

export default StreamRemote;
