import { useUserServer, useRoomBaseServer } from 'middle-domain';
import { isWechat, getQueryString } from './tool';
import { Toast } from 'vh5-ui';

/**
 *  路由拦截需要的构建登录地址
 * @param {*} to
 * @returns
 */
export function buildLoginAddress(to) {
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
  return address;
}

/**
 *  统一构建支付当前的授权地址
 * @param {*} to
 * @returns
 */
export function buildPayUrl(to) {
  //获取地址栏参数、设置请求路径
  let _search = '';
  if (location.search && location.search != '') {
    _search = location.search.split('?')[1];
  }
  const address =
    window.location.protocol +
    process.env.VUE_APP_WAP_WATCH +
    process.env.VUE_APP_WEB_KEY +
    `${to.path}?purpose=payAuth${_search ? '&' + _search : ''}`;
  return address;
}

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

  const nextUrl = `${window.location.protocol}${process.env.VUE_APP_WAP_WATCH}${newPath}${
    search ? '?' + search : ''
  }`;
  console.log('wechatjs 看看当前走入到了哪里_next不为空------->', nextUrl);
  // replaceState 添加或替换历史记录后，浏览器地址栏会变成你传的地址，而页面并不会重新载入或跳转
  // window.history.replaceState(null, null, nextUrl);
  window.location.replace(nextUrl);
}

/**
 * 授权三方登录
 * @param {*} _next 路由函数
 */
export function handleThirdLoginOrPay(_next) {
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
      // unionid 不能为会话缓存
      localStorage.setItem('unionid', user_auth_key);
      console.log('weixin_auth++++++++++++++++++++++++++', 111);
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
        localStorage.setItem('token_stamp', new Date().getTime());
        localStorage.setItem('userInfo', JSON.stringify(res.data));

        sessionStorage.setItem('isLogin', '1');
        filterAddressParams(path);
      } else {
        Toast({
          message: res.msg || '获取用户信息失败',
          position: 'center',
          duration: 0
        });

        //直接进入后续流程路由
        _next();
      }
    })
    .catch(res => {
      Toast({
        message: res.msg || '获取用户信息失败',
        position: 'center',
        duration: 0
      });
      _next();
    });
}

/**
 * 初始化微信sdk, 包括分享设置
 * @param {*} initData
 * @param {*} shareData
 * @returns
 */
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

/**
 * 隐藏微信菜单选项
 * @param {*} initData
 * @param {*} failedCb
 */
export function initHideChatSdk(initData = {}, failedCb = () => {}) {
  let hideConfigSdk = {
    debug: false,
    jsApiList: ['hideMenuItems', 'hideAllNonBaseMenuItem', 'showMenuItems'],
    appId: initData.appId,
    timestamp: initData.timestamp,
    nonceStr: initData.nonceStr,
    signature: initData.signature
  };
  wx.config(hideConfigSdk);

  //微信初始化完成
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
  });

  //微信错误回调
  wx.error(function (res) {
    console.log('微信隐藏菜单配置错误------>', res);
    wx.hideAllNonBaseMenuItem();
    failedCb(res);
    //上报日志
    window.vhallLog({
      tag: 'wx', // 日志所属功能模块
      data: res,
      type: 'log' // log 日志埋点，event 业务数据埋点
    });
  });
}

//微信授权相关需要判断
export function authWeixinAjax(to, address, _next) {
  const isEmbed = !!/embed/.test(to.path);
  //如果是微信
  if (isWechat() && !isEmbed) {
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
            if (localStorage.getItem('unionid')) {
              window.location.replace(res.data.url);
            } else {
              sessionStorage.setItem('weixin_auth_url', res.data.url);
              _next();
            }
          } else {
            Toast({
              message: res.msg || '微信回调失败，请重新扫码',
              position: 'center',
              duration: 0
            });

            // 如果是路由执行
            if (_next) {
              _next();
            }
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
    if (_next) {
      _next();
    }
  }
}

// init微信授权跳转逻辑
export async function wxAuthCheck(to, next) {
  let _next = next;
  let token = localStorage.getItem('token');
  let token_stamp = Number(localStorage.getItem('token_stamp'));
  // 如果token存在并且不超过20天 则无需微信再次授权
  if (token && token_stamp + 20 * 24 * 3600 * 1000 < new Date().getTime()) {
    token = '';
    token_stamp = '';
  }
  // 若当前用户已登录过，直接进入界面。
  if (sessionStorage.getItem('isLogin') == '1' || token) {
    next();
    return;
  }

  // 若当前地址栏包含user_auth_key 以及 purposer入参，表示当前需要执行第三方信息回调
  if (getQueryString('user_auth_key') && getQueryString('purpose')) {
    handleThirdLoginOrPay(_next);
  } else {
    // 观看页和嵌入页需要微信授权
    if (!/watch|subscribe|special\/detail/.test(to.path) || /embed/.test(to.path)) {
      // 不是 预约/观看/专题详情页 或者 嵌入情况， 直接进入
      next();
    } else {
      // 微信登录鉴权
      let roomBaseServer = useRoomBaseServer();
      //获取房间权限配置列表
      await roomBaseServer.getConfigList({
        webinar_id: to.params.id,
        webinar_user_id: window.sessionStorage.getItem('initGrayId'),
        scene_id: 1
      });
      await roomBaseServer.getDegradationConfig({
        staticDomain: process.env.VUE_APP_DEGRADE_STATIC_DOMAIN,
        environment: process.env.VUE_APP_SAAS_ENV != 'production' ? 'test' : 'product',
        systemKey: 2
      });

      // 判断是否admin开启了微信授权开关
      if (roomBaseServer.state.configList && roomBaseServer.state.configList['ui.hide_wechat']) {
        let address = buildLoginAddress(to);
        authWeixinAjax(to, address, _next);
      } else {
        // 走免登录，默认设置值为''
        // localStorage.setItem('token', '');
        // localStorage.setItem('userInfo', '');
        // sessionStorage.setItem('isLogin', '');
        if (_next) {
          _next();
        }
      }
    }
  }
}
