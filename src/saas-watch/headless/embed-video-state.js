import { useMsgServer, useRoomBaseServer, useVirtualAudienceServer } from 'middle-domain';

export default async function () {
  console.log('%c------服务初始化 开始', 'color:blue');
  const roomBaseServer = useRoomBaseServer();
  const msgServer = useMsgServer();
  const virtualAudienceServer = useVirtualAudienceServer();

  if (!roomBaseServer) {
    throw Error('get roomBaseServer exception');
  }

  const promiseList = [
    roomBaseServer.getConfigList({ scene_id: 1 }),
    //多语言接口
    roomBaseServer.getLangList(),
    roomBaseServer.getUnionConfig()
  ];

  await Promise.all(promiseList);
  console.log('%c------黄金链路请求配置项完成', 'color:pink');
  console.log(roomBaseServer.state.configList);
  console.log('%c------多语言请求配置', 'color:pink');
  console.log(roomBaseServer.state.languages);

  // TODO 设置观看端测试权限数据
  // roomBaseServer.state.configList = {
  //   hasToolbar: false
  // };
  await msgServer.init();
  console.log('%c------服务初始化 msgServer 初始化完成', 'color:blue');

  await virtualAudienceServer.init();

  // TODO 方便查询数据，后面会删除
  window.msgServer = msgServer;
  window.roomBaseServer = roomBaseServer;
}
export function isMSECanUse() {
  let mse = false;
  VhallPlayer &&
    VhallPlayer.probe({}, data => {
      mse = data.MediaSourceExtensions;
    });
  return mse;
}
