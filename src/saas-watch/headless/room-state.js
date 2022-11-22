import {
  useMsgServer,
  useRoomBaseServer,
  useDocServer,
  useInteractiveServer,
  useMicServer,
  useMediaCheckServer,
  useGroupServer,
  useUserServer,
  useDesktopShareServer,
  useInsertFileServer,
  useMediaSettingServer,
  useVirtualAudienceServer,
  useVideoPollingServer
} from 'middle-domain';

export default async function () {
  console.log('%c------服务初始化 开始', 'color:blue');
  const roomBaseServer = useRoomBaseServer();
  const msgServer = useMsgServer();
  const docServer = useDocServer();
  const interactiveServer = useInteractiveServer();
  const mediaCheckServer = useMediaCheckServer();
  const groupServer = useGroupServer();
  const micServer = useMicServer();
  const userServer = useUserServer();
  const desktopShareServer = useDesktopShareServer();
  const insertFileServer = useInsertFileServer();
  const mediaSettingServer = useMediaSettingServer();
  const virtualAudienceServer = useVirtualAudienceServer();

  if (!roomBaseServer) {
    throw Error('get roomBaseServer exception');
  }

  // configList 和 黄金链路串行执行 由于轮巡时，依赖roombase的config字段，故不能将此接口获取与mediaCheck同事使用
  await roomBaseServer.getConfigList().then(async () => {
    // 获取视频论巡配置项 TODO:后面观看端权限统一处理之后，这个就不需要调了
    await roomBaseServer.getVideoPollingConfig();
    //黄金链路
    await roomBaseServer.startGetDegradationInterval({
      staticDomain: process.env.VUE_APP_DEGRADE_STATIC_DOMAIN,
      environment: process.env.VUE_APP_SAAS_ENV != 'production' ? 'test' : 'product',
      systemKey: 2
    });
  });

  const promiseList = [
    //多语言接口
    roomBaseServer.getLangList(),
    // 调用聚合接口
    roomBaseServer
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
          'timer',
          'exam'
        ]
      })
      .then(async () => {
        // 如果是回放，调互动工具状态接口，互动状态以这个为准
        if (roomBaseServer.state.watchInitData.webinar.type == 5) {
          await roomBaseServer.getInavToolStatus({
            webinar_switch_id: roomBaseServer.state.watchInitData.switch.switch_id
          });
        }
      }),
    roomBaseServer.getCustomRoleName(),
    roomBaseServer.getUnionConfig()
  ];
  const liveMode = roomBaseServer.state.watchInitData.webinar.mode;
  // 1-音频 2-视频 3-互动 6-分组
  const liveType = roomBaseServer.state.watchInitData.webinar.type;

  await Promise.all(promiseList);
  console.log('%c------黄金链路请求配置项完成', 'color:pink');
  console.log('%c------多语言请求配置', 'color:pink');
  console.log(roomBaseServer.state.languages);

  // 互动进行设备检测 或者是视频直播并且开启了视频轮巡权限
  if (
    liveType == 1 &&
    roomBaseServer.state.configList['video_polling'] == 1 &&
    (liveMode == 3 || liveMode == 2)
  ) {
    // 获取媒体许可，设置设备状态
    if (roomBaseServer.state.interactToolStatus.video_polling) {
      await mediaCheckServer.getMediaInputPermission({ isNeedBroadcast: false });
    }
    useVideoPollingServer().init({ isWatch: true });
  }

  if (roomBaseServer.state.watchInitData.webinar.mode === 6) {
    // 如果是分组直播，初始化分组信息
    await groupServer.init();
    console.log('%c------服务初始化 groupServer 初始化完成', 'color:blue', groupServer);
  }

  micServer.init();

  if (window.localStorage.getItem('token')) {
    await userServer.getUserInfo({ scene_id: 2 });
  }

  await msgServer.init();
  console.log('%c------服务初始化 msgServer 初始化完成', 'color:blue');

  if (roomBaseServer.state.watchInitData.webinar.type == 1) {
    await interactiveServer.init();
    console.log('%c------服务初始化 interactiveServer 初始化完成', 'color:blue');
  }

  mediaSettingServer.init();

  insertFileServer.init();

  desktopShareServer.init();

  await docServer.init();
  console.log('%c------服务初始化 docServer 初始化完成', 'color:blue');

  await virtualAudienceServer.init();

  // TODO 方便查询数据，后面会删除
  window.msgServer = msgServer;
  window.roomBaseServer = roomBaseServer;
  window.interactiveServer = interactiveServer;
  window.docServer = docServer;
  window.groupServer = groupServer;
  window.micServer = micServer;
  window.insertFileServer = insertFileServer;
  window.mediaCheckServer = mediaCheckServer;
}
export function isMSECanUse() {
  let mse = false;
  VhallPlayer &&
    VhallPlayer.probe({}, data => {
      mse = data.MediaSourceExtensions;
    });
  return mse;
}
