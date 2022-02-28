import {
  useMsgServer,
  useRoomBaseServer,
  useDocServer,
  useInteractiveServer,
  useMicServer,
  useMediaCheckServer,
  useGroupServer,
  useUserServer
} from 'middle-domain';
import { getQueryString } from '@/packages/app-shared/utils/tool';

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
  console.log('%c------黄金链路请求配置项完成', 'color:pink');
  console.log(roomBaseServer.state.configList);
  console.log('%c------多语言请求配置', 'color:pink');
  console.log(roomBaseServer.state.languages);
  // TODO 设置观看端测试权限数据
  // roomBaseServer.state.configList = {
  //   hasToolbar: false
  // };

  if (window.localStorage.getItem('token')) {
    await userServer.getUserInfo({ scene_id: 2 });
  }
  if (roomBaseServer.state.watchInitData.webinar.mode === 6) {
    // 如果是分组直播，初始化分组信息
    await groupServer.init();
    console.log('%c------服务初始化 groupServer 初始化完成', 'color:blue', groupServer);
  }

  await msgServer.init();
  console.log('%c------服务初始化 msgServer 初始化完成', 'color:blue');

  await interactiveServer.init();
  console.log('%c------服务初始化 interactiveServer 初始化完成', 'color:blue');

  await docServer.init();
  console.log('%c------服务初始化 docServer 初始化完成', 'color:blue');

  // TODO 方便查询数据，后面会删除
  window.msgServer = msgServer;
  window.roomBaseServer = roomBaseServer;
  window.interactiveServer = interactiveServer;
  window.docServer = docServer;
  window.groupServer = groupServer;
  window.micServer = micServer;
}
