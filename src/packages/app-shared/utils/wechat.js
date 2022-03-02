import { useUserServer, useRoomBaseServer } from 'middle-domain';
import { isWechat, getQueryString } from './tool';
import { Toast } from 'vant';

/**
 * 过滤地址栏参数
 * @param {*} path
 * @param {*} _next
 */
function filterAddressParams(path) {
  console.log('wechatjs 看看跳转路径记录------->' + path);
  const newPath = path.indexOf('/v3/') != -1 ? path : process.env.VUE_APP_WEB_KEY + path;
  let search = location.search || '';
  if (
    search.indexOf('user_auth_key') == -1 &&
    search.indexOf('open_id') == -1 &&
    search.indexOf('purpose') == -1
  ) {
    // 默认的search传递，不做任何处理
  } else {
    // 移除传入的地址 ?a=1&b=2&c=3
    const _strOne = location.search.split('?');
    const _strTwo = _strOne[1] || ''; // ?之后的内容
    const _arr = _strTwo.split('&'); // &之后的分割
    const _newArr = [];
    for (let i = 0; i < _arr.length; i++) {
      if (
        !(
          _arr[i].indexOf('user_auth_key') != -1 ||
          _arr[i].indexOf('open_id') != -1 ||
          _arr[i].indexOf('purpose') != -1
        )
      ) {
        _newArr.push(_arr[i]);
      }
    }
    search = _newArr.length > 0 ? _newArr.join('&') : '';
  }

  const nextUrl = `${window.location.protocol}${process.env.VUE_APP_WAP_WATCH}${newPath}${search ? '?' + search : ''
    }`;
  console.log('wechatjs 看看当前走入到了哪里_next不为空------->', nextUrl);
  // replaceState 添加或替换历史记录后，浏览器地址栏会变成你传的地址，而页面并不会重新载入或跳转
  window.history.replaceState(null, null, nextUrl);
  window.location.replace(nextUrl);
}

/**
 * 授权三方登录
 * @param {*} _next 路由函数
 */
export function handleThirdLogin(_next) {
  const path = window.location.pathname; // 举例： '/v3/lives/watch/671680195'
  const user_auth_key = getQueryString('user_auth_key');
  const purpose = getQueryString('purpose');
  const open_id = getQueryString('open_id');
  if (purpose == 'login' && user_auth_key) {
    // 第三方登录后回调
    const params = {
      source: 2, // 1 控制台 2观看端 3admin
      key: user_auth_key,
      scene_id: 1 // 场景id：1登录 2提现绑定 3账户信息-账号绑定
    };
    if (open_id) {
      sessionStorage.setItem('open_id', open_id);
      sessionStorage.setItem('user_auth_key', user_auth_key);
    }
    handleAuth(params, path, _next);
  } else if (purpose == 'payAuth') {
    // 微信授权关闭后，支付走微信授权流程，不需要登录，避免用户信息覆写
    if (open_id) {
      sessionStorage.setItem('open_id', open_id);
      sessionStorage.setItem('user_auth_key', user_auth_key);
    }
    filterAddressParams(path);
  }
}

/**
 * 第三方授权
 * @param {*} params
 * @param {*} path
 * @param {*} _next
 */
export function handleAuth(params, path, _next) {
  console.log('wechat handleAuth------->', _next);
  useUserServer()
    .oauthCallback(params)
    .then(res => {
      if (res && res.code == 200) {
        localStorage.setItem('token', res.data.token || '');
        localStorage.setItem('userInfo', JSON.stringify(res.data));

        sessionStorage.setItem('isLogin', '1');
        filterAddressParams(path);
      } else {
        Toast({
          message: res.msg || '获取用户信息失败',
          position: 'center',
          duration: 0
        });

        //直接进入主页面
        // _next();
      }
    })
    .catch(res => {
      Toast({
        message: res.msg || '获取用户信息失败',
        position: 'center',
        duration: 0
      });
    });
}

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
      wx.error(function(res) {
        console.error('获取微信信息失败1', res);
      });
    });
  });
}

export function initHideChatSdk(initData = {}, failedCb = () => { }) {
  let hideConfigSdk = {
    debug: false,
    jsApiList: ['hideMenuItems'],
    appId: initData.appId,
    timestamp: initData.timestamp,
    nonceStr: initData.nonceStr,
    signature: initData.signature
  };
  wx.config(hideConfigSdk);
  wx.ready(function() {
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
    wx.error(function(res) {
      failedCb(res);
    });
  });
}

//微信授权相关
export async function authWeixinAjax(isEmbed, to, _next) {
  //如果是微信
  if (isWechat() && !isEmbed) {
    let roomBaseServer = useRoomBaseServer();

    console.log('authWeixinAjax roomBaseServer-------->', roomBaseServer);
    //获取房间权限配置列表
    await roomBaseServer.getConfigList({
      webinar_id: to.params.id,
      webinar_user_id: window.sessionStorage.getItem('initGrayId'),
      scene_id: 2 //观看端传2
    });
    if (
      roomBaseServer.state.configList &&
      roomBaseServer.state.configList['ui.hide_wechat'] == '0'
    ) {
      //获取地址栏参数、设置请求路径
      let _search = '';
      if (location.search && location.search != '') {
        _search = location.search.split('?')[1];
      }

      const address =
        window.location.protocol +
        process.env.VUE_APP_WAP_WATCH +
        process.env.VUE_APP_WEB_KEY +
        `${to.path}?purpose=login${_search ? '&' + _search : ''}`;
      const open_id = sessionStorage.getItem('open_id');
      if (!open_id) {
        // 请求授权接口
        useUserServer()
          .authWeixinAjax({
            source: 'wab',
            jump_url: address
          })
          .then(res => {
            if (res && res.code == 200) {
              console.log('wechat 当前authWeChat接口请求后地址结果为：', res.data.url);
              window.location.replace(res.data.url);
            } else {
              Toast({
                message: res.msg || '微信回调失败，请重新扫码',
                position: 'center',
                duration: 0
              });
              _next();
            }
          })
          .catch(res => {
            Toast({
              message: res.msg || '微信回调失败，请重新扫码',
              position: 'center',
              duration: 0
            });
          });
      }
    } else {
      // 走免登录，默认设置值为''
      // localStorage.setItem('token', '');
      // localStorage.setItem('userInfo', '');

      sessionStorage.setItem('isLogin', '');

      _next();
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
  if (sessionStorage.getItem('isLogin') == '1') {
    next();
    return;
  }

  // 若当前地址栏包含user_auth_key 以及 purposer入参，表示当前需要执行第三方信息回调
  if (getQueryString('user_auth_key') && getQueryString('purpose')) {
    handleThirdLogin(_next);
  } else {
    // 观看页和嵌入页需要微信授权
    if (!/watch|subscribe/.test(to.path)) {
      // 不是 预约/观看 或者 嵌入情况， 直接进入
      next();
    } else {
      // 微信登录鉴权
      authWeixinAjax(isEmbed, to, _next);
    }
  }
}

// 微信登录跳转
export function gotoWeixinLogin(address) {
  console.log('gotoWeixinLogin------->', `${process.env.VUE_APP_BASE_URL}`, address);
  // window.location.href = `${
  //   process.env.VUE_APP_BASE_URL
  // }/v3/commons/auth/weixin?source=wab&jump_url=${encodeURIComponent(address)}`;
}
