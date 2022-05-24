import VideoPollingMemberList from './src/main';

/* istanbul ignore next */
VideoPollingMemberList.install = function (Vue) {
  Vue.component(VideoPollingMemberList.name, VideoPollingMemberList);
};

export default VideoPollingMemberList;
