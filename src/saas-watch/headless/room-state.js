import {
  contextServer,
  useMsgServer,
  useRoomBaseServer,
  useDocServer,
  useInteractiveServer
} from 'vhall-sass-domain';

export default async function () {
  console.log('%c------服务初始化 开始', 'color:blue');
  let msgServer = contextServer.get('msgServer');
  if (!msgServer) {
    msgServer = useMsgServer();
  }
  if (!msgServer) {
    throw Error('get msgServer exception');
  }
  console.log('%c------服务初始化 msgServer 初始化完成', 'color:blue');

  let docServer = contextServer.get('docServer');
  if (!docServer) {
    docServer = useDocServer();
  }
  if (!docServer) {
    throw Error('get docServer exception');
  }
  contextServer.set('docServer', docServer);
  console.log('%c------服务初始化 docServer 初始化完成', 'color:blue');

  let interactiveServer = contextServer.get('interactiveServer');
  if (!interactiveServer) {
    interactiveServer = useInteractiveServer();
  }
  if (!interactiveServer) {
    throw Error('get interactiveServer exception');
  }
  console.log('%c------服务初始化 interactiveServer 初始化完成', 'color:blue');

  let roomBaseServer = contextServer.get('roomBaseServer');
  if (!roomBaseServer) {
    roomBaseServer = useRoomBaseServer();
  }
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
