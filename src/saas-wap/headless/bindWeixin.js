import { useRoomBaseServer, useInviteServer } from 'middle-domain';
import { isWechat, getQueryString, replaceHtml } from '@/app-shared/utils/tool';
import { initWeChatSdk, initHideChatSdk } from '@/app-shared/utils/wechat';

export default function () {
  const roomBaseServer = useRoomBaseServer();
  const inviteServer = useInviteServer();
  const isEmbed = location.pathname.indexOf('embedclient') != -1;

  // 是否绑定邀请卡信息
  const open_id = sessionStorage.getItem('open_id');
  const isWechatBrowser = isWechat();
  const inviteCode = getQueryString('invite');

  // 判断是否是微信分享来的 【判定若用户参会了，才创建邀请关系】
  if (
    roomBaseServer.state.watchInitData.join_info &&
    roomBaseServer.state.watchInitData.join_info.join_id &&
    (getQueryString('shareId') || getQueryString('share_id'))
  ) {
    roomBaseServer.bindShare({
      share: getQueryString('shareId') || getQueryString('share_id')
    });
  }

  // 判断是否是从邀请卡分享来的
  if (
    isWechatBrowser &&
    !isEmbed &&
    open_id &&
    roomBaseServer.state.watchInitData.join_info &&
    inviteCode
  ) {
    bindInvite(inviteCode);
  }
  // 获取微信分享信息 只在微信打开能分享
  if (isWechatBrowser) {
    getShareSettingInfo();
  }

  function bindInvite(code = '') {
    return inviteServer.bindInvite({
      webinar_id: roomBaseServer.state.watchInitData.webinar.id,
      invite: code
    });
  }

  function getShareSettingInfo() {
    // 分享信息
    return roomBaseServer.getShareSettingInfo().then(res => {
      if (res.code === 200) {
        let title = res.data.title;
        title = title.length - 30 > 0 ? title.substring(0, 30) : title;
        let shareInfo = {
          title: title,
          img_url: res.data.img_url,
          introduction: replaceHtml(res.data.introduction, 42)
        };
        wxShareInfo(shareInfo);
      }
    });
  }

  function wxShareInfo(shareInfo) {
    const configList = roomBaseServer.state.configList;
    let wx_sign_url = location.href.split('#')[0]; // 验证签名所需URL

    // const { system } = getBrowserType();

    // if (system == 'ios') {
    //   // 微信浏览器&&苹果设备, 取出记录的第一次访问的URL
    //   wx_sign_url = sessionStorage.getItem('ios_wx_sign_url');
    // } else {
    //   wx_sign_url = location.href.split('#')[0]; // 当前页面URL
    // }

    const share_address = location.href.split('#')[0];

    return roomBaseServer.wechatShare({ wx_url: wx_sign_url }).then(res => {
      if (res.code == 200 && res.data) {
        const hideShare = configList ? !configList['ui.watch_hide_share'] : 0;
        const params = {
          appId: res.data.appId,
          timestamp: res.data.timestamp,
          nonceStr: res.data.nonceStr,
          signature: res.data.signature
        };
        const defaultImg =
          'https://t-alistatic01.e.vhall.com/upload/sys/img_url/11/a9/11a95389258d3eed866fa4c0f189b199.jpg';
        if (hideShare == 1) {
          initHideChatSdk({ ...params });
        } else {
          initWeChatSdk(
            { ...params },
            {
              title: shareInfo.title,
              desc: shareInfo.introduction,
              link: share_address,
              imgUrl: shareInfo.img_url || defaultImg
            }
          );
        }
      }
    });
  }
}
