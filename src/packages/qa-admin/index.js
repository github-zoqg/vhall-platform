import QaAdmin from './main';

/* istanbul ignore next */
QaAdmin.install = function (Vue) {
  Vue.component(QaAdmin.name, QaAdmin);
};

export default QaAdmin;
