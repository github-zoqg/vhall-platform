import QaWap from './src/main';

/* istanbul ignore next */
QaWap.install = function (Vue) {
  Vue.component(QaWap.name, QaWap);
};

export default QaWap;
