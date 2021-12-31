import StreamLocal from './src/main';

/* istanbul ignore next */
StreamLocal.install = function (Vue) {
  Vue.component(StreamLocal.name, StreamLocal);
};

export default StreamLocal;
