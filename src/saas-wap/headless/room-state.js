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
  useInsertFileServer
} from 'middle-domain';
import { getQueryString } from '@/packages/app-shared/utils/tool';

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

  if (!roomBaseServer) {
    throw Error('get roomBaseServer exception');
  }

  // 判断是否是嵌入/单视频嵌入
  try {
    const _param = {
      isEmbed: false,
      isEmbedVideo: false
    };
    if (location.pathname.indexOf('embedclient') != -1) {
      _param.isEmbed = true;
    }
    if (getQueryString('embed') == 'video') {
      _param.isEmbedVideo = true;
    }
    roomBaseServer.setEmbedObj(_param);
  } catch (e) {
    console.log('嵌入', e);
  }

  const promiseList = [
    // configList 和 黄金链路串行执行
    roomBaseServer.getConfigList().then(async () => {
      //黄金链路
      await roomBaseServer.startGetDegradationInterval({
        staticDomain: process.env.VUE_APP_DEGRADE_STATIC_DOMAIN,
        environment: process.env.NODE_ENV != 'production' ? 'test' : 'product',
        systemKey: 2
      });
    }),
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
      }),
    roomBaseServer.getCustomRoleName()
  ];

  if (roomBaseServer.state.watchInitData.webinar.mode === 6) {
    // 如果是分组直播，初始化分组信息
    await groupServer.init();
    console.log('%c------服务初始化 groupServer 初始化完成', 'color:blue', groupServer);
  }

  // 判断是否是微信分享来的
  try {
    if (getQueryString('shareId') || getQueryString('share_id')) {
      roomBaseServer.bindShare({
        share: getQueryString('shareId') || getQueryString('share_id')
      });
    }
  } catch (e) {
    console.log('微信分享', e);
  }

  const liveMode = roomBaseServer.state.watchInitData.webinar.mode;
  const liveType = roomBaseServer.state.watchInitData.webinar.type;

  // 互动、分组直播 并且 为直播模式，才进行设备检测
  if ([3, 6].includes(liveMode) && liveType == 1) {
    // 获取媒体许可，设置设备状态
    promiseList.push(mediaCheckServer.getMediaInputPermission({ isNeedBroadcast: false }));
  }
  await Promise.all(promiseList);

  // 互动、分组直播初始化micServer
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
}
