export default {
  methods: {
    // 返回主房间提示
    gobackHome(index, name) {
      let title = '';
      switch (index) {
        case 1:
          title = '主持人开启了分组讨论，您将进入' + name + '组参与讨论';
          break;
        case 2:
          title = '主持人已将您分配至' + name + '组';
          break;
        case 3:
          title = '主持人结束了分组讨论，您将返回主直播间';
          break;
        case 4:
          title = '主持人解散了分组，您将返回主直播间';
          break;
        case 5:
          title = '您已被踢出该小组';
          break;
      }
      this.$alert(title, '提示', {
        confirmButtonText: '我知道了',
        customClass: 'know-message-box',
        lockScroll: false,
        cancelButtonClass: 'zdy-confirm-cancel'
      })
        .then(() => {})
        .catch(() => {});
    }
  }
};
