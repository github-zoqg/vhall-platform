import { merge } from 'lodash';
import home from './home';
import page1 from './page1';
import page_subscribe from './page_subscribe';

export const globalConfig = merge(
  home.globalConfig,
  page1.globalConfig,
  page_subscribe.globalConfig
);
export const serverConfig = merge(
  home.serverConfig,
  page1.serverConfig,
  page_subscribe.serverConfig
);
