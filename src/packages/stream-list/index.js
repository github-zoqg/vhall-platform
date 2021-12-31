import StreamList from './src/main';

/* istanbul ignore next */
StreamList.install = function (Vue) {
  Vue.component(StreamList.name, StreamList);
};

export default StreamList;
