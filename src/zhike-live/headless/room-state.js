import { useMsgServer, useDocServer, useInteractiveServer } from 'middleDomain';
export default async function () {
  const msgServer = useMsgServer();
  const docServer = useDocServer();
  const interactiveServer = useInteractiveServer();
  const roomBaseServer = useMsgServer();
  await msgServer.init();
  await interactiveServer.init();
  await docServer.init({
    token: roomBaseServer.state.watchInitData.interact.paas_access_token
  });
}
