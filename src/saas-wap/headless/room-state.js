import {
  useMsgServer,
  useRoomBaseServer,
  useDocServer,
  useInteractiveServer,
  useMediaCheckServer,
  useMicServer,
  useUserServer,
  useGroupServer,
  useDesktopShareServer,
  usePlayerServer,
  useInsertFileServer,
  useVirtualAudienceServer
} from 'middle-domain';
import { isWechat } from '@/app-shared/utils/tool';

export default async function () {
  console.log('%c------服务初始化 开始', 'color:blue');

  const msgServer = useMsgServer();
  const docServer = useDocServer();
  const interactiveServer = useInteractiveServer();
  const roomBaseServer = useRoomBaseServer();
  const mediaCheckServer = useMediaCheckServer();
  const micServer = useMicServer();
  const userServer = useUserServer();
  const groupServer = useGroupServer();
  const desktopShareServer = useDesktopShareServer();
  const insertFileServer = useInsertFileServer();
  const playerServer = usePlayerServer();
  const virtualAudienceServer = useVirtualAudienceServer();

  if (!roomBaseServer) {
    throw Error('get roomBaseServer exception');
  }

  const promiseList = [
    // configList 和 黄金链路串行执行
    roomBaseServer.getConfigList().then(async () => {
      //黄金链路
      await roomBaseServer.startGetDegradationInterval({
        staticDomain: process.env.VUE_APP_DEGRADE_STATIC_DOMAIN,
        environment: process.env.VUE_APP_SAAS_ENV != 'production' ? 'test' : 'product',
        systemKey: 2
      });
    }),
    //多语言接口
    roomBaseServer.getLangList(),
    roomBaseServer.getCustomRoleName(),
    roomBaseServer.getUnionConfig()
  ];
  virtualAudienceServer.init();

  await Promise.all(promiseList);

  // 调用聚合接口
  await roomBaseServer
    .getCommonConfig({
      tags: [
        'skin',
        'screen-poster',
        'like',
        'keywords',
        'public-account',
        'webinar-tag',
        'menu',
        'adv-default',
        'invite-card',
        'red-packet',
        'pwd-red-packet',
        'room-tool',
        'goods-default',
        'announcement',
        'sign',
        'timer'
      ]
    })
    .then(async () => {
      // 如果是回放，调互动工具状态接口，互动状态以这个为准
      if (roomBaseServer.state.watchInitData.webinar.type == 5) {
        await roomBaseServer.getInavToolStatus({
          webinar_switch_id: roomBaseServer.state.watchInitData.switch.switch_id
        });
      }
    });

  if (roomBaseServer.state.watchInitData.webinar.mode === 6) {
    // 如果是分组直播，初始化分组信息
    await groupServer.init();
    console.log('%c------服务初始化 groupServer 初始化完成', 'color:blue', groupServer);
  }

  // 互动、分组直播初始化micServer
  micServer.init();

  if (window.localStorage.getItem('token')) {
    await userServer.getUserInfo({ scene_id: 2 });
  }
  if (
    // 非嵌入页 微信环境 没有授权 微信授权没有关闭 不能初始化聊天
    !(
      !localStorage.getItem('unionid') &&
      isWechat() &&
      roomBaseServer.state.configList['ui.hide_wechat'] == 0 &&
      roomBaseServer.state.embedObj.embed
    )
  ) {
    await msgServer.init();
    console.log('%c------服务初始化 msgServer 初始化完成', 'color:blue');
  }

  if (roomBaseServer.state.watchInitData.webinar.type == 1) {
    await interactiveServer.init();
    console.log('%c------服务初始化 interactiveServer 初始化完成', 'color:blue');
  }

  insertFileServer.init();

  desktopShareServer.init();

  await docServer.init({
    token: roomBaseServer.state.watchInitData.interact.paas_access_token
  });
  console.log('%c------服务初始化 docServer 初始化完成', 'color:blue');

  // TODO 方便查询数据，后面会删除
  window.msgServer = msgServer;
  window.roomBaseServer = roomBaseServer;
  window.interactiveServer = interactiveServer;
  window.docServer = docServer;
  window.groupServer = groupServer;
  window.micServer = micServer;
  window.playerServer = playerServer;
  window.insertFileServer = insertFileServer;
  window.mediaCheckServer = mediaCheckServer;
}
