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

  // 判断是否是嵌入/单视频嵌入
  try {
    const _param = {};
    if (/embed/.test(this.$route.path)) {
      _param.isEmbed = true;
    }
    const { embed } = this.$route.query;
    _param.isEmbedVideo = embed == 'video';
    roomBaseServer.setEmbedObj(_param);
  } catch (e) {
    console.log('嵌入', e);
  }

  // TODO：晓东确认，是否在此处添加，配置项调用
  await roomBaseServer.getConfigList();
  await roomBaseServer.getLowerConfigList({
    params: {},
    environment: process.env.NODE_ENV != 'production' ? 'test' : 'production',
    systemKey: 2,
    time: 5
  });
  console.log('%c------黄金链路请求配置项完成', 'color:pink');
  console.log(roomBaseServer.state.configList);
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
