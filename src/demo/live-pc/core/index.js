import { initConfig } from './config';
import { initUse } from './use';
import { initMixin } from './mixin';
import { initI18n } from './locales';

initConfig();

export function initGlobal() {
  initUse();
  initMixin();
}

export const i18n = initI18n('zh');
