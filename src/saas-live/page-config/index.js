import main from './main.js';
import record from './record';
import clientDoc from './client-embed/client-doc';
import clientIm from './client-embed/client-im';
import clientInteract from './client-embed/client-interact';
import liveYun from './live-yun';
import splitScreen from './split-screen.js';
import videoPolling from './video-polling';

export default {
  main,
  record,
  'client-doc': clientDoc,
  'client-im': clientIm,
  'client-interact': clientInteract,
  'live-yun': liveYun,
  'split-screen': splitScreen,
  'video-polling': videoPolling
};
