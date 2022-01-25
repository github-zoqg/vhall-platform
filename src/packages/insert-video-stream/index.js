import InsertStream from './src/main';

/* istanbul ignore next */
InsertStream.install = function (Vue) {
  Vue.component(InsertStream.name, InsertStream);
};

export default InsertStream;
