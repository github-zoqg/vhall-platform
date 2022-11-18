import main from './main.js';
import concise from './concise.js';
import fullscreen from './fullscreen.js';
import subscribe from './subscribe.js';
import embedVideo from './embed-video.js';
import { setPage as setPageUtil } from '@/app-shared/utils/pageConfigUtil';

const pages = {
  main,
  concise,
  subscribe,
  fullscreen,
  'embed-video': embedVideo
};

export const setPage = (page = 'main') => {
  setPageUtil(pages[page], page);
};

export default pages;
