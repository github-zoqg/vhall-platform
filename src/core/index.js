import dispatcher from './dispatcher';
import eventQueue from './eventQueue';
import serverPool from './serverPool';

const platformsSDK = {
  install(vue) {
    vue.prototype.$dispatcher = dispatcher;
    vue.prototype.$event = eventQueue;
    vue.prototype.$serverPool = serverPool;
  }
};

export { dispatcher, eventQueue, serverPool };
export default platformsSDK;
