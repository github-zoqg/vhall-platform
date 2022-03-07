import {
  useMsgServer,
  useRoomBaseServer,
  useDocServer,
  useInteractiveServer,
  useMicServer,
  useMediaCheckServer,
  useGroupServer,
  useMediaSettingServer,
  useRebroadcastServer,
  useInsertFileServer,
  useMemberServer,
  useDesktopShareServer,
  useSplitScreenServer
} from 'middle-domain';

export default async function () {
  console.log('%c------服务初始化 开始', 'color:blue');
  const msgServer = useMsgServer();
  const docServer = useDocServer();
  const interactiveServer = useInteractiveServer();
  const roomBaseServer = useRoomBaseServer();
  const mediaCheckServer = useMediaCheckServer();
  const groupServer = useGroupServer();
  const micServer = useMicServer();
  const mediaSettingServer = useMediaSettingServer();
  const rebroadcastServer = useRebroadcastServer();
  const insertFileServer = useInsertFileServer();
  const desktopShareServer = useDesktopShareServer();
  const splitScreenServer = useSplitScreenServer();

  const checkSystemResult = await mediaCheckServer.checkSystemRequirements();
  if (!checkSystemResult.result) {
    return 'isBrowserNotSupport';
  }

  if (!roomBaseServer) {
    throw Error('get roomBaseServer exception');
  }
  console.log('%c------服务初始化 roomBaseServer 初始化完成', 'color:blue', roomBaseServer);

  // 获取媒体许可，设置设备状态
  await mediaCheckServer.getMediaInputPermission();

  // 获取房间互动工具状态
  await roomBaseServer.getInavToolStatus();

  if (roomBaseServer.state.watchInitData.webinar.mode === 6) {
    // 如果是分组直播，初始化分组信息
    await groupServer.init();
    console.log('%c------服务初始化 groupServer 初始化完成', 'color:blue', groupServer);
  }

  // 如果存在rebroadcast
  if (roomBaseServer.state.watchInitData?.rebroadcast?.id) {
    await rebroadcastServer.init();
    console.log('%c------服务初始化 rebroadcastServer 初始化完成', 'color:blue', rebroadcastServer);
  }

  micServer.init();

  await msgServer.init();
  console.log('%c------服务初始化 msgServer 初始化完成', 'color:blue', msgServer);

  await splitScreenServer.init();
  console.log('%c------服务初始化 splitScreenServer 初始化完成', 'color:blue', splitScreenServer);

  if (!splitScreenServer.state.isOpenSplitScreen) {
    // 没有开启分屏则初始化互动
    await interactiveServer.init();
    console.log('%c------服务初始化 interactiveServer 初始化完成', 'color:blue');
  }

  insertFileServer.init();

  desktopShareServer.init();

  await docServer.init();
  console.log('%c------服务初始化 docServer 初始化完成', 'color:blue', docServer);

  mediaSettingServer.init();

  if (roomBaseServer.state.watchInitData.webinar.mode === 6) {
    // 如果是分组直播，初始化分组信息
    await groupServer.init();
    console.log('%c------服务初始化 groupServer 初始化完成', 'color:blue', groupServer);
  }

  useMicServer();

  // TODO 方便查询数据，后面会删除
  window.msgServer = msgServer;
  window.roomBaseServer = roomBaseServer;
  window.interactiveServer = interactiveServer;
  window.docServer = docServer;
  window.groupServer = groupServer;
  window.micServer = micServer;
  window.insertFileServer = insertFileServer;
  window.memberServer = useMemberServer();
}
