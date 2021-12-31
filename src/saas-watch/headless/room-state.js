import { contextServer } from 'vhall-sass-domain';
export default async function () {
  const msgServer = contextServer.get('msgServer');
  const docServer = contextServer.get('docServer');
  const interactiveServer = contextServer.get('interactiveServer');

  await msgServer.init();
  await interactiveServer.init();
  await docServer.init();
}
