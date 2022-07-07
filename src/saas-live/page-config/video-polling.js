/**
 * 视频轮询页面配置
 */
export default {
  videoPollingRoot: {
    component: 'VmpAirContainer',
    children: ['videoPollingContainer']
  },
  videoPollingContainer: {
    component: 'VmpVideoPolling'
  }
};
