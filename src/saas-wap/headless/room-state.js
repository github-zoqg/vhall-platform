import {
  useMsgServer,
  useRoomBaseServer,
  useDocServer,
  useInteractiveServer,
  useMicServer
} from 'middle-domain';

export default async function () {
  console.log('%c------服务初始化 开始', 'color:blue');

  const msgServer = useMsgServer();

  const docServer = useDocServer();

  const interactiveServer = useInteractiveServer();

  const roomBaseServer = useRoomBaseServer();

  if (!roomBaseServer) {
    throw Error('get roomBaseServer exception');
  }
  // TODO 设置观看端测试权限数据
  roomBaseServer.state.configList = {
    hasToolbar: false
  };
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
      'sign'
    ]
  });

  await msgServer.init();
  console.log('%c------服务初始化 msgServer 初始化完成', 'color:blue');

  await interactiveServer.init();
  console.log('%c------服务初始化 interactiveServer 初始化完成', 'color:blue');

  await docServer.init({
    token: roomBaseServer.state.watchInitData.interact.paas_access_token
  });
  console.log('%c------服务初始化 docServer 初始化完成', 'color:blue');

  const micServer = useMicServer();
  console.log(micServer);
  // micServer.init();
}
