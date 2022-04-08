import { useRoomBaseServer, useInviteServer } from 'middle-domain';
import { isWechat, getQueryString, replaceHtml } from '@/packages/app-shared/utils/tool';
import { initWeChatSdk, initHideChatSdk } from '@/packages/app-shared/utils/wechat';

export default function () {
  const roomBaseServer = useRoomBaseServer();
  const inviteServer = useInviteServer();
  const isEmbed = getQueryString('embedclient');

  // 是否绑定邀请卡信息
  const open_id = sessionStorage.getItem('open_id');
  const isWechatBrowser = isWechat();
  const inviteCode = getQueryString('invite');

  // 判断是否是微信分享来的
  if (getQueryString('shareId') || getQueryString('share_id')) {
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

  // 获取微信分享信息
  if (isWechatBrowser && !isEmbed) {
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
          introduction: replaceHtml(res.data.introduction)
        };
        wxShareInfo(shareInfo);
      }
    });
  }

  function wxShareInfo(shareInfo) {
    const configList = roomBaseServer.state.configList;
    const address = location.href.split('#')[0];
    return roomBaseServer.wechatShare({ wx_url: address }).then(res => {
      if (res.code == 200 && res.data) {
        const hideShare = configList ? configList['ui.watch_hide_share'] : 0;
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
              link: address,
              imgUrl: shareInfo.img_url || defaultImg
            }
          );
        }
      }
    });
  }
}
