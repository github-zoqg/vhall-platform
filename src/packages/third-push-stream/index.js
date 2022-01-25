import ThirdStream from './src/main';

/* istanbul ignore next */
ThirdStream.install = function (Vue) {
  Vue.component(ThirdStream.name, ThirdStream);
};

export default ThirdStream;
