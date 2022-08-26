import { useMsgServer, useRoomBaseServer, useDocServer } from 'middle-domain';

export default async function () {
  console.log('%c------服务初始化 开始', 'color:blue');
  const msgServer = useMsgServer();
  const roomBaseServer = useRoomBaseServer();
  const docServer = useDocServer();
  if (!roomBaseServer) {
    throw Error('get roomBaseServer exception');
  }
  console.log('%c------服务初始化 roomBaseServer 初始化完成', 'color:blue', roomBaseServer);

  const promiseList = [
    // 获取房间互动工具状态
    roomBaseServer.getInavToolStatus()
    // roomBaseServer.getCustomRoleName()
  ];

  await Promise.all(promiseList);
  await msgServer.initMaintMsg({
    hide: 1
  });
  console.log('%c------服务初始化 msgServer 初始化完成', 'color:blue', msgServer);
  await docServer.init();
  console.log('%c------服务初始化 docServer 初始化完成', 'color:blue', docServer);
  console.log(roomBaseServer);
}
