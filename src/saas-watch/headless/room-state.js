import { useMsgServer, useRoomBaseServer, useDocServer, useInteractiveServer } from 'middle-domain';

export default async function () {
  console.log('%c------服务初始化 开始', 'color:blue');
  const msgServer = useMsgServer();

  console.log('%c------服务初始化 msgServer 初始化完成', 'color:blue');

  const docServer = useDocServer();

  console.log('%c------服务初始化 docServer 初始化完成', 'color:blue');

  const interactiveServer = useInteractiveServer();

  console.log('%c------服务初始化 interactiveServer 初始化完成', 'color:blue');

  const roomBaseServer = useRoomBaseServer();

  if (!roomBaseServer) {
    throw Error('get roomBaseServer exception');
  }
  console.log('%c------服务初始化 roomBaseServer 初始化完成', 'color:blue');

  await msgServer.init();
  await interactiveServer.init();

  await docServer.init({
    token: roomBaseServer.state.watchInitData.interact.paas_access_token
  });
}
