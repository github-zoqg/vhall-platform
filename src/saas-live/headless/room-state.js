import {
  useMsgServer,
  useRoomBaseServer,
  useDocServer,
  useInteractiveServer,
  useMicServer
} from 'middle-domain';

export default async function () {
  const roomBaseServer = useRoomBaseServer();
  console.log('%c------服务初始化 开始', 'color:blue');
  const msgServer = useMsgServer();
  const docServer = useDocServer();
  const interactiveServer = useInteractiveServer();
  //TODO: 测试用，后续这个状态通过互动状态接口在domain设置
  interactiveServer.state.mainScreen = roomBaseServer.state.watchInitData.webinar.userinfo.user_id;

  if (!roomBaseServer) {
    throw Error('get roomBaseServer exception');
  }

  // TODO 设置主持端测试权限数据
  roomBaseServer.state.configList = {
    hasToolbar: true
  };
  console.log('%c------服务初始化 roomBaseServer 初始化完成', 'color:blue');

  await msgServer.init();
  console.log('%c------服务初始化 msgServer 初始化完成', 'color:blue', msgServer);

  await interactiveServer.init();
  console.log('%c------服务初始化 interactiveServer 初始化完成', 'color:blue');

  await docServer.init();
  console.log('%c------服务初始化 docServer 初始化完成', 'color:blue', docServer);

  useMicServer();
}
