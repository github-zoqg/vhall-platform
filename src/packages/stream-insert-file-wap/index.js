import VmpWapInsertFile from './src/main';

/* istanbul ignore next */
VmpWapInsertFile.install = function (Vue) {
  Vue.component(VmpWapInsertFile.name, VmpWapInsertFile);
};

export default VmpWapInsertFile;
