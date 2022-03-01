const mixins = {
  methods: {
    initWeChatSdk(initData = {}, shareData = {}) {
      // const params = {
      //   debug: true,
      //   jsApiList: [
      //     'chooseWXPay',
      //     'updateAppMessageShareData',
      //     'updateTimelineShareData'
      //   ]
      // }
      const configParams = {
        debug: false,
        appId: initData.appId,
        timestamp: initData.timestamp,
        nonceStr: initData.nonceStr,
        signature: initData.signature,
        jsApiList: ['chooseWXPay', 'updateAppMessageShareData', 'updateTimelineShareData']
      };
      console.log('wxConfig', configParams, initData, shareData);
      // wx.config({ ...params, ...initData })
      wx.config(configParams);
      wx.ready(() => {
        wx.updateAppMessageShareData({
          title: shareData.title, // 分享标题
          desc: shareData.desc, // 分享描述
          link: shareData.link, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
          imgUrl: shareData.imgUrl, // 分享图标
          success() {
            // 设置成功
            this.$toast('分享成功');
          }
        });
        wx.updateTimelineShareData({
          title: shareData.title, // 分享标题
          link: shareData.link, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
          imgUrl: shareData.imgUrl, // 分享图标
          success() {
            // 设置成功
            this.$toast('分享成功');
          }
        });
        wx.error(function (res) {
          console.error('获取微信信息失败1', res);
        });
      });
    },
    initHideChatSdk(initData = {}) {
      const hideConfigSdk = {
        debug: false,
        jsApiList: ['hideMenuItems'],
        appId: initData.appId,
        timestamp: initData.timestamp,
        nonceStr: initData.nonceStr,
        signature: initData.signature
      };
      // console.log('wxhideConfig', hideConfigSdk, initData)
      wx.config(hideConfigSdk);
      wx.ready(function () {
        wx.hideMenuItems({
          menuList: [
            'menuItem:share:appMessage',
            'menuItem:share:timeline',
            'menuItem:share:qq',
            'menuItem:share:weiboApp',
            'menuItem:share:facebook',
            'menuItem:share:QZone',
            'menuItem:copyUrl'
          ]
        });
        wx.error(function (res) {
          console.error('获取微信信息失败', res);
        });
      });
    }
  }
};
export default mixins;
