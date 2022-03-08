import VmpGroupDiscussion from './src/main';

/* istanbul ignore next */
VmpGroupDiscussion.install = function (Vue) {
  Vue.component(VmpGroupDiscussion.name, VmpGroupDiscussion);
};

export default VmpGroupDiscussion;
