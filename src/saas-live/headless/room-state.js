import {
  useMsgServer,
  useRoomBaseServer,
  useDocServer,
  useInteractiveServer,
  useMicServer,
  useMediaCheckServer,
  useGroupServer
} from 'middle-domain';

export default async function () {
  console.log('%c------服务初始化 开始', 'color:blue');
  const msgServer = useMsgServer();
  const docServer = useDocServer();
  const interactiveServer = useInteractiveServer();
  const roomBaseServer = useRoomBaseServer();
  const mediaCheckServer = useMediaCheckServer();
  const groupServer = useGroupServer();

  const checkSystemResult = await mediaCheckServer.checkSystemRequirements();
  if (!checkSystemResult.result) {
    return 'isBrowserNotSuppport';
  }

  if (!roomBaseServer) {
    throw Error('get roomBaseServer exception');
  }
  console.log('%c------服务初始化 roomBaseServer 初始化完成', 'color:blue', roomBaseServer);

  // 获取房间互动工具状态
  await roomBaseServer.getInavToolStatus();

  console.log('[group] start1');
  // 如果当前正在进行分组讨论，初始化小组信息
  if (roomBaseServer.state.interactToolStatus.is_open_switch === 1) {
    console.log('[group] start2');
    await groupServer.groupInit();
  }
  console.log('[group] start3');

  await msgServer.init();
  console.log('%c------服务初始化 msgServer 初始化完成', 'color:blue', msgServer);

  await interactiveServer.init();
  console.log('%c------服务初始化 interactiveServer 初始化完成', 'color:blue');

  await docServer.init();
  console.log('%c------服务初始化 docServer 初始化完成', 'color:blue', docServer);

  useMicServer();
}
