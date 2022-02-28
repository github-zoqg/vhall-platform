import {
  useMsgServer,
  useRoomBaseServer,
  useDocServer,
  useInteractiveServer,
  useMediaCheckServer,
  useMicServer,
  useUserServer
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
    roomBaseServer.getConfigList(),
    //黄金链路
    roomBaseServer.getLowerConfigList({
      params: {},
      environment: process.env.NODE_ENV != 'production' ? 'test' : 'production',
      systemKey: 2,
      time: 5
    }),
    //多语言接口
    roomBaseServer.getLangList(),
    // 调用聚合接口
    roomBaseServer.getCommonConfig({
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
  ];

  // 互动、分组直播进行设备检测
  if ([3, 6].includes(roomBaseServer.state.watchInitData.webinar.mode)) {
    // 获取媒体许可，设置设备状态
    promiseList.push(mediaCheckServer.getMediaInputPermission());
    micServer.init();
  }

  await Promise.all(promiseList);

  if (window.localStorage.getItem('token')) {
    await userServer.getUserInfo({ scene_id: 2 });
  }
  await msgServer.init();
  console.log('%c------服务初始化 msgServer 初始化完成', 'color:blue');

  await interactiveServer.init();
  console.log('%c------服务初始化 interactiveServer 初始化完成', 'color:blue');

  await docServer.init({
    token: roomBaseServer.state.watchInitData.interact.paas_access_token
  });
  console.log('%c------服务初始化 docServer 初始化完成', 'color:blue');

  console.log(micServer);
  window.micServer = micServer;
}
