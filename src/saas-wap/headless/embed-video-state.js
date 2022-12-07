import {
  useMsgServer,
  useRoomBaseServer,
  usePlayerServer,
  useVirtualAudienceServer
} from 'middle-domain';

export default async function () {
  console.log('%c------服务初始化 开始', 'color:blue');

  const msgServer = useMsgServer();
  const roomBaseServer = useRoomBaseServer();
  const playerServer = usePlayerServer();
  const virtualAudienceServer = useVirtualAudienceServer();

  if (!roomBaseServer) {
    throw Error('get roomBaseServer exception');
  }

  const promiseList = [
    // configList 和 黄金链路串行执行
    roomBaseServer.getConfigList({ scene_id: 1 }),
    //多语言接口
    roomBaseServer.getLangList(),
    roomBaseServer.getUnionConfig()
  ];
  virtualAudienceServer.init();

  await Promise.all(promiseList);

  await msgServer.init();
  console.log('%c------服务初始化 msgServer 初始化完成', 'color:blue');

  // TODO 方便查询数据，后面会删除
  window.msgServer = msgServer;
  window.roomBaseServer = roomBaseServer;
  window.playerServer = playerServer;
}
