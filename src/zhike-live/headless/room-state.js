import { contextServer, useDocServer } from 'vhall-sass-domain';
export default async function () {
  const msgServer = contextServer.get('msgServer');
  const docServer = useDocServer();
  const interactiveServer = contextServer.get('interactiveServer');
  const roomBaseServer = contextServer.get('roomBaseServer');

  contextServer.set('docServer', docServer);

  await msgServer.init();
  await interactiveServer.init();
  await docServer.init({
    token: roomBaseServer.state.watchInitData.interact.paas_access_token
  });
}
