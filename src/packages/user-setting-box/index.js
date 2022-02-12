import UserSettingBox from './src/main';

/* istanbul ignore next */
UserSettingBox.install = function (Vue) {
  Vue.component(UserSettingBox.name, UserSettingBox);
};

export default UserSettingBox;
