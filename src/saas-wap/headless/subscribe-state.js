import {
  useMsgServer,
  useRoomBaseServer,
  useUserServer,
  useVirtualAudienceServer
} from 'middle-domain';

export default async function () {
  console.log('%c------服务初始化 开始', 'color:blue');
  const roomBaseServer = useRoomBaseServer();
  const msgServer = useMsgServer();
  const userServer = useUserServer();
  const virtualAudienceServer = useVirtualAudienceServer();

  if (!roomBaseServer) {
    throw Error('get roomBaseServer exception');
  }

  const promiseList = [
    roomBaseServer.getConfigList({ scene_id: 1 }),
    //多语言接口
    roomBaseServer.getLangList(),
    // 调用聚合接口
    roomBaseServer.getCommonConfig({
      tags: [
        'skin',
        'screen-poster',
        'public-account',
        'webinar-tag',
        'menu',
        'adv-default',
        'invite-card',
        'goods-default',
        'timer'
      ]
    })
  ];
  virtualAudienceServer.init();
  await Promise.all(promiseList);

  if (window.localStorage.getItem('token')) {
    await userServer.getUserInfo({ scene_id: 2 });
  }

  await msgServer.initMaintMsg({
    hide: 1
  });
  console.log('%c------服务初始化 msgServer 初始化完成', 'color:blue');

  // TODO 方便查询数据，后面会删除
  window.msgServer = msgServer;
  window.roomBaseServer = roomBaseServer;
}
