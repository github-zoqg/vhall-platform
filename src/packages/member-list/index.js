import VmpMemberList from './src/main';

/* istanbul ignore next */
VmpMemberList.install = function (Vue) {
  Vue.component(VmpMemberList.name, VmpMemberList);
};

export default VmpMemberList;
