import {
  useMsgServer,
  useRoomBaseServer,
  useInteractiveServer,
  useMicServer,
  useMediaCheckServer,
  useMediaSettingServer,
  useVideoPollingServer
} from 'middle-domain';

export default async function () {
  console.log('%c------服务初始化 开始', 'color:blue');
  const msgServer = useMsgServer();
  const interactiveServer = useInteractiveServer();
  const roomBaseServer = useRoomBaseServer();
  const mediaCheckServer = useMediaCheckServer();
  const micServer = useMicServer();
  const mediaSettingServer = useMediaSettingServer();
  const videoPollingServer = useVideoPollingServer();

  const checkSystemResult = await mediaCheckServer.checkSystemRequirements();
  if (!checkSystemResult.result) {
    return 'isBrowserNotSupport';
  }

  if (!roomBaseServer) {
    throw Error('get roomBaseServer exception');
  }
  console.log('%c------服务初始化 roomBaseServer 初始化完成', 'color:blue', roomBaseServer);

  // 获取媒体许可，设置设备状态
  await mediaCheckServer.getMediaInputPermission({ isNeedBroadcast: false });

  // 获取房间互动工具状态
  // await roomBaseServer.getInavToolStatus();

  micServer.init();

  await msgServer.initMaintMsg({
    hide: 1
  });
  console.log('%c------服务初始化 msgServer 初始化完成', 'color:blue', msgServer);

  await videoPollingServer.init();
  console.log('%c------服务初始化 interactiveServer 初始化完成', 'color:blue');

  mediaSettingServer.init();

  // TODO 方便查询数据，后面会删除
  window.msgServer = msgServer;
  window.roomBaseServer = roomBaseServer;
  window.interactiveServer = interactiveServer;
  window.micServer = micServer;
}
