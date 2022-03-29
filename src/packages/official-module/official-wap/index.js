import VmpWapQrCode from './src/main';

/* istanbul ignore next */
VmpWapQrCode.install = function (Vue) {
  Vue.component(VmpWapQrCode.name, VmpWapQrCode);
};

export default VmpWapQrCode;
