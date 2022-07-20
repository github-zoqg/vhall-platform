import main from './main.js';
import concise from './concise.js';
import subscribe from './subscribe.js';
import embedVideo from './embed-video.js';

const pages = {
  main,
  concise,
  subscribe,
  'embed-video': embedVideo
};

export const setPage = page => {
  window.$serverConfig = pages[page];
  window.$serverConfig._page = page;
};

export default pages;
