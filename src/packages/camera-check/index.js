import CameraCheck from './src/main';

/* istanbul ignore next */
CameraCheck.install = function (Vue) {
  Vue.component(CameraCheck.name, CameraCheck);
};

export default CameraCheck;
