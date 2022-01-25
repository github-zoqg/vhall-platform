import VmpGroupSetting from './src/main';

/* istanbul ignore next */
VmpGroupSetting.install = function (Vue) {
  Vue.component(VmpGroupSetting.name, VmpGroupSetting);
};

export default VmpGroupSetting;
