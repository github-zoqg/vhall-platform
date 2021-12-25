import dispatcher from './dispatcher';
import eventQueue from './eventQueue';
import serverPool from './serverPool';

const platformsSDK = {
  install(vue) {
    window.$dispatcher = vue.prototype.$dispatcher = dispatcher;
    window.$event = vue.prototype.$event = eventQueue;
    window.$serverPool = vue.prototype.$serverPool = serverPool;
  }
};

export { dispatcher, eventQueue, serverPool };
export default platformsSDK;
