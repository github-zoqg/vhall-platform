import { initConfig } from './config';
import { initUse } from './use';
import { initMixin } from './mixin';
import { initI18n } from './locales';

export function initGlobal() {
  initConfig();
  initUse();
  initMixin();
}

export const i18n = initI18n('zh');
