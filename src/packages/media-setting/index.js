import PcMediaSetting from './src/main';

/* istanbul ignore next */
PcMediaSetting.install = function (Vue) {
  Vue.component(PcMediaSetting.name, PcMediaSetting);
};

export default PcMediaSetting;
