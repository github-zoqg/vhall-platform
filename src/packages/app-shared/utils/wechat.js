import { useUserServer, useRoomBaseServer } from 'middle-domain';
import { isWechat } from './tool';

export function initWeChatSdk(initData = {}, shareData = {}) {
  const configParams = {
    debug: false,
    appId: initData.appId,
    timestamp: initData.timestamp,
    nonceStr: initData.nonceStr,
    signature: initData.signature,
    jsApiList: ['chooseWXPay', 'updateAppMessageShareData', 'updateTimelineShareData']
  };

  return new Promise(resolve => {
    wx.config(configParams);
    wx.ready(() => {
      wx.updateAppMessageShareData({
        title: shareData.title, // 分享标题
        desc: shareData.desc, // 分享描述
        link: shareData.link, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
        imgUrl: shareData.imgUrl, // 分享图标
        success() {
          // 设置成功
          resolve({ action: 'updateAppMessageShareData', isSuccess: true });
        }
      });
      wx.updateTimelineShareData({
        title: shareData.title, // 分享标题
        link: shareData.link, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
        imgUrl: shareData.imgUrl, // 分享图标
        success() {
          // 设置成功
          resolve({ action: 'updateTimelineShareData', isSuccess: true });
        }
      });
      wx.error(function (res) {
        console.error('获取微信信息失败1', res);
      });
    });
  });
}

export function initHideChatSdk(initData = {}, failedCb = () => {}) {
  let hideConfigSdk = {
    debug: false,
    jsApiList: ['hideMenuItems'],
    appId: initData.appId,
    timestamp: initData.timestamp,
    nonceStr: initData.nonceStr,
    signature: initData.signature
  };
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
      failedCb(res);
    });
  });
}

//微信授权相关
export function authByWx(isEmbed, path, _next) {
  const failure = res => {
    this.$message.error(res.msg);
  };
  let params = {
    source: '',
    jump_url: ''
  };
  if (isWechat() && !isEmbed) {
    //如果是微信
    if (useRoomBaseServer().state.configList) {
      //获取房间权限配置列表
      //获取地址栏参数、设置请求路径
      let _search = '';
      if (location.search && location.search != '') {
        _search = location.search.split('?')[1];
      }
      params.source = params.source != '' ? params.source : 'web'; //默认为web pc的话传pc
      params.jump_url =
        window.location.protocol +
        process.env.VUE_APP_WAP_WATCH +
        process.env.VUE_APP_WEB_KEY +
        `${path}?purpose=login${_search ? '&' + _search : ''}`;
      console.log(params.jump_url, 'params.jump_url');
      // 请求授权接口
      return useUserServer()
        .authLoginByWx(params)
        .then(res => {
          if (res.code !== 200) {
            failure(res);
            sessionStorage.setItem('open_id', '');
            sessionStorage.setItem('isLogin', '');
            _next();
          } else if (res && res.code == 200) {
            //微信授权成功后；设置open_id;跳转到后台返回的url;
            this.state.open_id = res.data.open_id;
            sessionStorage.setItem('open_id', res.data.open_id);
            // 缓存微信授权后的login标记
            sessionStorage.setItem('isLogin', 1);
            window.location.replace(res.data.url);
          }
        })
        .catch(err => {
          failure(err);
          return err;
        });
    }
  } else {
    _next();
  }
}
// init微信授权跳转逻辑
export function authCheck(to, next) {
  const isEmbed = !!/embed/.test(to.path);
  let _next = next;

  // 若当前用户已登录过，直接进入界面。
  if (sessionStorage.getItem('isLogin') == 1) {
    next();
    return;
  }
  // 若当前地址栏包含user_auth_key 以及 purposer入参，表示当前需要执行第三方信息回调
  // if (getQueryString('user_auth_key') && getQueryString('purpose')) {

  // }
  if (!/watch|subscribe/.test(to.path)) {
    // 不是 预约/观看 或者 嵌入情况， 直接进入
    next();
  } else {
    // 微信登录鉴权
    authByWx(isEmbed, to.path, _next);
  }
}
