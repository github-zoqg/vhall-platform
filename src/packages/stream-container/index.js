import StreamContainer from './src/main';

/* istanbul ignore next */
StreamContainer.install = function (Vue) {
  Vue.component(StreamContainer.name, StreamContainer);
};

export default StreamContainer;
